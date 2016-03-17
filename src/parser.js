import * as TokenType from './token';
import * as NodeType from './node';
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

  get filename() {
    return this._parser._filename;
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
    this._extensions = opts.extensions || instantiateAll(opts);
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
      type: NodeType.ROOT, 
      children: []
    };
    this._src = src;
    this._stack = [rootNode];
    this._lastToken = null;
    this._parseNodes(src);

    if (this._extensions.length > 0) {
      for (let i = 0; i < this._extensions.length; i++) {
        this._extensions[i].visit(rootNode);
      }
    }

    return rootNode;
  }

  _addNodeToken(node) {
    const token = this._lastToken;
    if (node.tokens) {
      node.tokens.push(token);
    } else {
      node.tokens = [token];
    }
  }

  _appendNode(node) {
    this._addNodeToken(node);
    node.location.filename = this._filename;
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
    if (endLocation) {
      location.endIndex = endLocation.endIndex;
      location.endLine = endLocation.endLine;
    }
    return location;
  }

  _parseNodes(src) {
    let initialStackSize = this._stack.length;
    let token;
    const z = new Tokenizer(src, { 
      delimiters: this._delimiters.slice(0),
      extensions: this._extensions,
      filename: this._filename
    });

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
          case TokenType.TEXT:
            this._appendNode({
              type: NodeType.TEXT,
              text: token.text,
              location: this._makeLocation(token.location)
            });
            break;

          case TokenType.VARIABLE:
          case TokenType.UNESCAPED_VARIABLE:
            this._appendNode({
              type: NodeType.VARIABLE,
              name: token.name,
              unescaped: token.type === TokenType.UNESCAPED_VARIABLE,
              location: this._makeLocation(token.location)
            });
            break;

          case TokenType.SECTION_OPEN:
            this._handleSectionOpen(token);
            break;

          case TokenType.INVERTED_SECTION_OPEN:
            this._handleSectionOpen(token, true);
            break;

          case TokenType.SECTION_CLOSE:
            this._handleSectionClose(token);
            break;

          case TokenType.PARTIAL:
            this._appendNode({
              type: NodeType.PARTIAL,
              name: token.name,
              indent: token.indent,
              location: this._makeLocation(token.location)
            });
            break;

          case TokenType.COMMENT:
            this._handleComment(token);
            break;

          case TokenType.DELIMITER_CHANGE:
            this._appendNode({
              type: NodeType.DELIMITER_CHANGE,
              delimiters: token.delimiters,
              location: this._makeLocation(token.location)
            });
            break;
        }
      }
    } while (token.type !== TokenType.EOF);

    if (this._stack.length > initialStackSize) {
      this._throw('Unexpected EOF: sections not closed: ' + 
        this._stack.slice(initialStackSize).map(n => `'${n.name}'`).join(', '));
    } else if (this._stack.length < initialStackSize) {
      this._throw('Internal error.');
    }
  }

  _throw(message) {
    const e = new Error(message);
    e.filename = this._lastToken.filename;
    e.location = this._lastToken.location;
    throw e;
  }

  _pushParent(node) {
    this._addNodeToken(node);
    node.children = [];
    this._stack.push(node);
  }

  _popParent() {
    return this._stack.pop();
  }

  _handleSectionOpen(token, inverted = false) {
    const { name, location } = token;
    this._pushParent({
      type: NodeType.SECTION,
      name,
      inverted,
      location
    });
  }

  _handleSectionClose(token) {
    const { name, location } = token;
    const section = this._popParent();
    if (section.type !== NodeType.SECTION) {
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
      type: NodeType.COMMENT,
      content,
      location: this._makeLocation(location)
    });
  }
}
