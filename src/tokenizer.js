import * as TokenType from './token';
import { instantiateAll } from './extension';
import { trimStandaloneToken } from './helpers';

const STATE_NONE        = 'STATE_NONE';
const STATE_EOF         = 'STATE_EOF';
const STATE_TEXT        = 'STATE_TEXT';
const STATE_TEXT_BREAK  = 'STATE_TEXT_BREAK';
const STATE_TAG         = 'STATE_TAG';

const DELIMITER_LEFT  = 0;
const DELIMITER_RIGHT = 1;

export class Tokenizer {
  constructor(src, opts = {}) {
    this._extensions = opts.extensions || instantiateAll();
    this._src = src;
    this._index = 0;
    this._char = null;
    this._tokens = [];
    this._line = 0;
    this._column = 0;
    this._state = STATE_NONE;
    this._error = null;
    this._location = {
      index: 0,
      line: 0,
      column: 0
    };
    this._delimiters = opts.delimiters ? opts.delimiters : ['{{', '}}'];
  }

  get error() {
    return this._error;
  }

  getNextToken() {
    if (this._tokens.length > 0) {
      return this._tokens.shift();
    }

    let done = false;
    let matched = false;
    do {
      //console.log(this._state, this._tokens);
      if (this._error !== null) {
        return null;
      }

      if (this._state !== STATE_NONE) {
        matched = true;
        this._markTokenStartLocation();
      }

      switch (this._state) {
        case STATE_NONE:
          this._read();
          break;

        case STATE_EOF:
          this._handleEOF();
          done = true;
          break;

        case STATE_TEXT:
          this._handleText();
          break;

        case STATE_TEXT_BREAK:
          this._handleTextBreak();
          done = true;
          break;

        case STATE_TAG:
          this._handleTag();
          break;
      }

      if (matched && !this._error) {
        this._markTokenEndLocation();
        matched = false;
      }

      if (this._state === STATE_NONE) {
        if (this._char === null) {
          this._state = STATE_EOF;
        } else if (this._char === '\n') {
          this._state = STATE_TEXT_BREAK;
        } else if (this._isDelimiter(DELIMITER_LEFT)) {
          this._state = STATE_TAG;
        } else {
          this._state = STATE_TEXT;
        }
      }

    } while (!done);

    return this._error === null ? this._tokens.shift() : null;
  }

  // Handlers

  _handleEOF() {
    this._handleStandaloneTag();
    this._makeToken({ 
      type: TokenType.EOF
    });
  }

  _handleTag() {
    const [ left, right ] = this._delimiters;
    this._skip(left.length);
    this._skipAllWhitespaces();

    if (this._char === null) {
      this._setError('Unclosed tag.');
    }
    else if (this._isDelimiter(DELIMITER_RIGHT)) {
      this._handleEmptyTag();
    } else {
      const tagTypeChar = this._char;
      if (tagTypeChar === '{') {
        this._handleVariableCurly();
      } else {
        let tagContentStart = this._index - 1;
        //read content
        while (!this._isDelimiter(DELIMITER_RIGHT) && this._char !== null) {
          this._read();
        }

        if (this._char === null) {
          this._setError('Unclosed tag.');
        } else {
          const content = this._src.slice(tagContentStart, this._index - 1);
          switch (tagTypeChar) {
            case '>': this._handleSimpleTag(TokenType.PARTIAL, content); break;
            case '^': this._handleSimpleTag(TokenType.INVERTED_SECTION_OPEN, content); break;
            case '#': this._handleSimpleTag(TokenType.SECTION_OPEN, content); break;
            case '/': this._handleSimpleTag(TokenType.SECTION_CLOSE, content); break;

            case '!':
              this._handleComment(content.substr(1));
              break;

            case '=':
              this._handleDelimiterChange(content);
              break;
            case '&':
              this._handleVariable(content.substr(1), true);
              break;
            default:
              this._handleVariable(content);
              break;
          }
        }
      }
    }
    if (this._error === null) {
      //eat right
      for (let i = 0; i < right.length; i++) {
        this._read();
      }
    }

    this._state = STATE_NONE;
  }

  _handleDelimiterChange(content) {
    const newDelimiters = extractNewDelimiters(content);
    if (newDelimiters === null) {
      this._setError('Invalid change delimiter syntax.');
    } else {
      const [ left, right ] = newDelimiters;
      this._delimiters = newDelimiters;
      this._makeToken({
        type: TokenType.DELIMITER_CHANGE,
        delimiters: [ left, right ]
      });
    }
  }

  _handleSimpleTag(type, content) {
    this._makeToken({ type, name: content.substr(1).trim() });
  }

  _handleComment(content) {
    this._makeToken({
      type: TokenType.COMMENT,
      content
    });
  }

  _handleVariableCurly() {
    this._read(); //eat '{'
    const begin = this._index - 1;
    const d = this._distance('}');
    if (d === -1) {
      this._setError('Unclosed variable tag: missingright curly.');
    } else {
      const content = this._src.slice(begin, begin + d);
      this._skip(d + 1); //skip '}'
      this._skipAllWhitespaces();
      if (!this._isDelimiter(DELIMITER_RIGHT)) {
        this._setError('Unclosed variable: missing right delimiter.');
      } else {
        this._makeToken({
          type: TokenType.UNESCAPED_VARIABLE,
          name: content.trim()
        });
      }
    }
  }

  _handleEmptyTag() {
    this._makeToken({
      type: TokenType.VARIABLE,
      name: ''
    });
  }

  _handleVariable(content, unescaped) {
    this._makeToken({
      type: unescaped ? TokenType.UNESCAPED_VARIABLE : TokenType.VARIABLE,
      name: content.trim()
    });
  }

  _handleText() {
    let done = false;
    let index = this._index - 1;
    let length = 0;
    do {
      const c = this._char;

      if (c === null || c === '\n' || this._isDelimiter(DELIMITER_LEFT)) {
        done = true;
      } else {
        length ++;
      }

      if (!done) {
        this._read();
      }
    } while (!done);

    this._makeToken({
      type: TokenType.TEXT,
      text: this._src.slice(index, index + length)
    });

    this._state = STATE_NONE;
  }

  _handleTextBreak() {
    this._makeToken({
      type: TokenType.TEXT,
      text: '\n'
    });
    this._read();
    this._handleStandaloneTag();
    this._state = STATE_NONE;
  }

  _handleStandaloneTag() {
    this._tokens = trimStandaloneToken(this._tokens);
  }

  // Helpers
  _dump(t = '') {
    console.log(t +'>'+this._src.slice(this._index - 1));
  }

  _read() {
    if (this._index < this._src.length) {
      if (this._char === '\n') {
        this._line ++;
        this._column = 0;
      } else {
        this._column ++;
      }

      this._char = this._src[this._index];
      this._index ++;
    } else {
      this._char = null;
    }
  }

  _peek() {
    if (this._index < this._src.length - 1) {
      return this._src[this._index];
    } else {
      return null;
    }
  }

  _skip(n) {
    for (let i = 0; i < n; i ++) {
      this._read();
    }
  }

  _distance(c) {
    for (let i = this._index; i < this._src.length; i++) {
      if (this._src[i] === c) {
        return i - this._index + 1;
      }
    }
    return -1;
  }

  _skipAllWhitespaces() {
    while (this._isWhitespace()) {
      this._read();
    }
  }

  _markTokenStartLocation() {
    this._location.index = this._index - 1;
    this._location.line = this._line;
    this._location.column = this._column;
  }

  _markTokenEndLocation() {
    const token = this._tokens[this._tokens.length - 1];
    const { index, line, column } = this._location;
    token.location = {
      index, line, column,
      endIndex: this._index - 1,
      endLine: this._line,
      endColumn: this._column
    };
  }

  _isWhitespace() {
    return /\s/.test(this._char);
  }

  _isDelimiter(d, offset = 0) {
    const delimiter = this._delimiters[d];
    const pos = this._index - 1 + offset;
    return this._src.slice(pos, pos + delimiter.length) === delimiter;
  }

  _makeToken(token) {
    if (this._extensions.length) {
      try {
        this._extensions.forEach(ext => {
          token = ext.transformToken(token);
        });
      } catch (e) {
        this._setError(e.message);
        return;
      }
    }
    this._tokens.push(token);
  }

  _setError(message) {
    const error = new Error(message);
    error.index = this._index - 1;
    error.line = this._line;
    error.column = this._column;
    this._error = error;
  }
}

const R_DELIMITER_CHANGE = /=[\s\n]*([^\s\n]*?)[\s\n]+([^\s\n]*?)[\s\n]*=[\s\n]*$/;
function extractNewDelimiters(tagContent) {
  const matches = tagContent.match(R_DELIMITER_CHANGE);
  if (matches) {
    return matches.slice(1);
  } else {
    return null;
  }
}