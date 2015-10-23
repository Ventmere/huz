import * as tokenTypes from './token';
import * as nodeTypes from './node';
import { Tokenizer } from './tokenizer';

export class Parser {
  constructor(filename, opts = {}) {
    this._delimiters = opts.delimiters ? opts.delimiters : ["{{", "}}"];

    this._error = null;
    this._stack = null;
    this._lastToken = null;
    this._filename = filename;
    this._src = null;
  }

  get error() {
    return this._error;
  }

  parse(src) {
    const rootNode = { 
      type: nodeTypes.ROOT, 
      children: []
    };
    this._src = src;
    this._error = null;
    this._stack = [rootNode];
    this._lastToken = null;
    this._parseNodes(src);

    if (this._error) {
      return null;
    } else {
      return rootNode;
    }
  }

  _pushNode(node) {
    this._stack[this._stack.length - 1].children.push(node);
    return node;
  }

  _getTop() {
    return this._stack[this._stack.length - 1];
  }

  _clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  _makeLocation(beginLocation, endLocation) {
    const location = this._clone(beginLocation);
    if (this._filename) {
      location.filename = this._filename;
    }
    if (endLocation) {
      location.endIndex = endLocation.endIndex;
      location.endLine = endLocation.endLine;
    }
    return location;
  }

  _parseNodes(src) {
    let initialStackSize = this._stack.length;
    let token;
    const z = new Tokenizer(src, { delimiters: this._delimiters.slice(0) });

    do {
      token = z.getNextToken();

      if (z.error !== null) {
        this._error = z.error;
        return null;  
      }

      this._lastToken = token;

      switch (token.type) {
        case tokenTypes.TEXT:
          this._pushNode({
            type: nodeTypes.TEXT,
            text: token.text,
            location: this._makeLocation(token.location)
          });
          break;

        case tokenTypes.VARIABLE:
        case tokenTypes.UNESCAPED_VARIABLE:
          this._pushNode({
            type: nodeTypes.VARIABLE,
            name: token.name,
            unescaped: token.type === tokenTypes.UNESCAPED_VARIABLE,
            location: this._makeLocation(token.location)
          });
          break;

        case tokenTypes.SECTION_OPEN:
          this._handleSectionOpen(token);
          break;

        case tokenTypes.INVERTED_SECTION_OPEN:
          this._handleSectionOpen(token, true);
          break;

        case tokenTypes.SECTION_CLOSE:
          this._handleSectionClose(token);
          break;

        case tokenTypes.PARTIAL:
          this._pushNode({
            type: nodeTypes.PARTIAL,
            name: token.name,
            indent: token.indent,
            location: this._makeLocation(token.location)
          });
          break;

        case tokenTypes.COMMENT:
          this._handleComment(token);
          break;

        case tokenTypes.DELIMITER_CHANGE:
          this._pushNode({
            type: nodeTypes.DELIMITER_CHANGE,
            delimiters: token.delimiters,
            location: this._makeLocation(token.location)
          });
          break;
      }
    } while (token.type !== tokenTypes.EOF && this._error === null);

    if (!this._error) {
      if (this._stack.length > initialStackSize) {
        this._setError('Unexpected EOF: sections not closed: ' + 
          this._stack.slice(initialStackSize).map(n => `'${n.name}'`).join(', '));
      } else if (this._stack.length < initialStackSize) {
        this._setError('Internal error.');
      }
    }
  }

  _setError(message) {
    this._error = new Error(message);
    this._error.location = this._lastToken.location;
  }

  _handleSectionOpen(token, inverted = false) {
    const { name, location } = token;
    this._stack.push({
      type: nodeTypes.SECTION,
      name,
      children: [],
      inverted,
      location
    });
  }

  _handleSectionClose(token) {
    const { name, location } = token;
    const section = this._stack.pop();
    if (section.type !== nodeTypes.SECTION) {
      this._setError('Unexpected SECTION_CLOSE: ' + this._token.name);
      return;
    }

    if (section.name !== name) {
      this._setError(`Unexpected SECTION_CLOSE: '${name}', current section: '${section.name}'`);
      return;
    }

    section.raw = this._src.slice(section.location.endIndex, location.index);
    section.location = this._makeLocation(section.location, token.location);

    this._pushNode(section);
  }

  _handleComment(token) {
    const { content, location } = token;
    this._pushNode({
      type: nodeTypes.COMMENT,
      content,
      location: this._makeLocation(location)
    });
  }
}
