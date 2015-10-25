import * as tokenTypes from './token';
import * as nodeTypes from './node';
import { Tokenizer } from './tokenizer';
import { visit } from './helpers';
import { instantiateAll } from './extension';

class ParserContext {
  constructor(parser) {
    this._parser = parser;
  }

  appendNode(node) {
    this._parser._appendNode(node);
  }

  pushParent(node) {
    this._parser._pushParent(node);
  }

  popParent() {
    return this._parser._popParent();
  }

  get top() {
    return this._parser._stack.length;
  }

  get tailNode() {
    return this._parser._stack.length > 0 ? this._parser._stack[this._parser._stack.length - 1] : null;
  }

  throw(message) {
    return this._parser._throw(message);
  }
}

export class Parser {
  constructor(opts = {}) {
    this._delimiters = opts.delimiters ? opts.delimiters : ["{{", "}}"];
    this._extensions = opts.extensions || instantiateAll();
    this._filename = opts.filename || '';

    if (this._extensions.length > 0) {
      this._parserContext = new ParserContext(this);
    }

    this._stack = null;
    this._lastToken = null;
    this._src = null;
  }

  parse(src) {
    const rootNode = { 
      type: nodeTypes.ROOT, 
      children: []
    };
    this._src = src;
    this._stack = [rootNode];
    this._lastToken = null;
    this._parseNodes(src);

    return rootNode;
  }

  _appendNode(node) {
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
    location.filename = this._filename;
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
        throw z.error;
      }

      this._lastToken = token;

      let handled = false;
      if (this._extensions) {
        for (let i = 0; i < this._extensions.length; i++) {
          const ext = this._extensions[i];
          if (ext.handleToken(token, this._parserContext) === true) {
            handled = true;
            break;
          }
        }
      }

      if (!handled) {
        switch (token.type) {
          case tokenTypes.TEXT:
            this._appendNode({
              type: nodeTypes.TEXT,
              text: token.text,
              location: this._makeLocation(token.location)
            });
            break;

          case tokenTypes.VARIABLE:
          case tokenTypes.UNESCAPED_VARIABLE:
            this._appendNode({
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
            this._appendNode({
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
            this._appendNode({
              type: nodeTypes.DELIMITER_CHANGE,
              delimiters: token.delimiters,
              location: this._makeLocation(token.location)
            });
            break;
        }
      }
    } while (token.type !== tokenTypes.EOF);

    if (this._stack.length > initialStackSize) {
      this._throw('Unexpected EOF: sections not closed: ' + 
        this._stack.slice(initialStackSize).map(n => `'${n.name}'`).join(', '));
    } else if (this._stack.length < initialStackSize) {
      this._throw('Internal error.');
    }
  }

  _throw(message) {
    const e = new Error(message);
    e.location = this._lastToken.location;
    throw e;
  }

  _pushParent(node) {
    node.children = [];
    this._stack.push(node);
  }

  _popParent() {
    return this._stack.pop();
  }

  _handleSectionOpen(token, inverted = false) {
    const { name, location } = token;
    this._pushParent({
      type: nodeTypes.SECTION,
      name,
      inverted,
      location
    });
  }

  _handleSectionClose(token) {
    const { name, location } = token;
    const section = this._popParent();
    if (section.type !== nodeTypes.SECTION) {
      this._throw(`Unexpected SECTION_CLOSE: '${name}'`);
    }

    if (section.name !== name) {
      this._throw(`Unexpected SECTION_CLOSE: '${name}', current section: '${section.name}'`);
    }

    section.raw = this._src.slice(section.location.endIndex, location.index);
    section.location = this._makeLocation(section.location, token.location);

    this._appendNode(section);
  }

  _handleComment(token) {
    const { content, location } = token;
    this._appendNode({
      type: nodeTypes.COMMENT,
      content,
      location: this._makeLocation(location)
    });
  }
}
