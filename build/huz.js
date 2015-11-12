(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.parse = parse;
	exports.compile = compile;
	exports.render = render;
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	var _parser = __webpack_require__(1);
	
	var _renderer = __webpack_require__(7);
	
	var _token = __webpack_require__(2);
	
	var TokenType = _interopRequireWildcard(_token);
	
	var _node = __webpack_require__(3);
	
	var NodeType = _interopRequireWildcard(_node);
	
	var _extension = __webpack_require__(5);
	
	var _extensionsInheritance = __webpack_require__(9);
	
	var _tokenizer = __webpack_require__(4);
	
	Object.defineProperty(exports, 'Tokenizer', {
	  enumerable: true,
	  get: function get() {
	    return _tokenizer.Tokenizer;
	  }
	});
	exports.Parser = _parser.Parser;
	exports.Renderer = _renderer.Renderer;
	exports.TokenType = TokenType;
	exports.NodeType = NodeType;
	
	(0, _extension.register)(_extensionsInheritance.Inheritance);
	
	function parse(src, opts) {
	  var parser = new _parser.Parser(opts);
	  return parser.parse(src);
	}
	
	function compile(src, opts) {
	  return new _renderer.Renderer(src, opts);
	}
	
	function render(src, context, opts) {
	  var r = compile(src, opts);
	  return r.render(context);
	}
	
	exports.register = _extension.register;

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
	
	var _token = __webpack_require__(2);
	
	var TokenType = _interopRequireWildcard(_token);
	
	var _node = __webpack_require__(3);
	
	var NodeType = _interopRequireWildcard(_node);
	
	var _tokenizer = __webpack_require__(4);
	
	var _helpers = __webpack_require__(6);
	
	var _extension = __webpack_require__(5);
	
	var ParserContext = (function () {
	  function ParserContext(parser) {
	    _classCallCheck(this, ParserContext);
	
	    this._parser = parser;
	  }
	
	  _createClass(ParserContext, [{
	    key: 'appendNode',
	    value: function appendNode(node) {
	      this._parser._appendNode(node);
	    }
	  }, {
	    key: 'pushParent',
	    value: function pushParent(node) {
	      this._parser._pushParent(node);
	    }
	  }, {
	    key: 'popParent',
	    value: function popParent() {
	      return this._parser._popParent();
	    }
	  }, {
	    key: 'throw',
	    value: function _throw(message) {
	      return this._parser._throw(message);
	    }
	  }, {
	    key: 'top',
	    get: function get() {
	      return this._parser._stack.length;
	    }
	  }, {
	    key: 'tailNode',
	    get: function get() {
	      return this._parser._stack.length > 0 ? this._parser._stack[this._parser._stack.length - 1] : null;
	    }
	  }]);
	
	  return ParserContext;
	})();
	
	var Parser = (function () {
	  function Parser() {
	    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	
	    _classCallCheck(this, Parser);
	
	    this._delimiters = opts.delimiters ? opts.delimiters : ["{{", "}}"];
	    this._extensions = opts.extensions || (0, _extension.instantiateAll)();
	    this._filename = opts.filename || '';
	
	    if (this._extensions.length > 0) {
	      this._parserContext = new ParserContext(this);
	    }
	
	    this._stack = null;
	    this._lastToken = null;
	    this._src = null;
	  }
	
	  _createClass(Parser, [{
	    key: 'parse',
	    value: function parse(src) {
	      var rootNode = {
	        type: NodeType.ROOT,
	        children: []
	      };
	      this._src = src;
	      this._stack = [rootNode];
	      this._lastToken = null;
	      this._parseNodes(src);
	
	      if (this._extensions.length > 0) {
	        for (var i = 0; i < this._extensions.length; i++) {
	          this._extensions[i].visit(rootNode);
	        }
	      }
	
	      return rootNode;
	    }
	  }, {
	    key: '_appendNode',
	    value: function _appendNode(node) {
	      node.location.filename = this._filename;
	      this._stack[this._stack.length - 1].children.push(node);
	      return node;
	    }
	  }, {
	    key: '_getTop',
	    value: function _getTop() {
	      return this._stack[this._stack.length - 1];
	    }
	  }, {
	    key: '_clone',
	    value: function _clone(obj) {
	      return JSON.parse(JSON.stringify(obj));
	    }
	  }, {
	    key: '_makeLocation',
	    value: function _makeLocation(beginLocation, endLocation) {
	      var location = this._clone(beginLocation);
	      if (endLocation) {
	        location.endIndex = endLocation.endIndex;
	        location.endLine = endLocation.endLine;
	      }
	      return location;
	    }
	  }, {
	    key: '_parseNodes',
	    value: function _parseNodes(src) {
	      var initialStackSize = this._stack.length;
	      var token = undefined;
	      var z = new _tokenizer.Tokenizer(src, {
	        delimiters: this._delimiters.slice(0),
	        extensions: this._extensions
	      });
	
	      do {
	        token = z.getNextToken();
	
	        if (z.error !== null) {
	          throw z.error;
	        }
	
	        this._lastToken = token;
	
	        var handled = false;
	        if (this._extensions) {
	          for (var i = 0; i < this._extensions.length; i++) {
	            var ext = this._extensions[i];
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
	        this._throw('Unexpected EOF: sections not closed: ' + this._stack.slice(initialStackSize).map(function (n) {
	          return '\'' + n.name + '\'';
	        }).join(', '));
	      } else if (this._stack.length < initialStackSize) {
	        this._throw('Internal error.');
	      }
	    }
	  }, {
	    key: '_throw',
	    value: function _throw(message) {
	      var e = new Error(message);
	      e.location = this._lastToken.location;
	      throw e;
	    }
	  }, {
	    key: '_pushParent',
	    value: function _pushParent(node) {
	      node.children = [];
	      this._stack.push(node);
	    }
	  }, {
	    key: '_popParent',
	    value: function _popParent() {
	      return this._stack.pop();
	    }
	  }, {
	    key: '_handleSectionOpen',
	    value: function _handleSectionOpen(token) {
	      var inverted = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];
	      var name = token.name;
	      var location = token.location;
	
	      this._pushParent({
	        type: NodeType.SECTION,
	        name: name,
	        inverted: inverted,
	        location: location
	      });
	    }
	  }, {
	    key: '_handleSectionClose',
	    value: function _handleSectionClose(token) {
	      var name = token.name;
	      var location = token.location;
	
	      var section = this._popParent();
	      if (section.type !== NodeType.SECTION) {
	        this._throw('Unexpected SECTION_CLOSE: \'' + name + '\'');
	      }
	
	      if (section.name !== name) {
	        this._throw('Unexpected SECTION_CLOSE: \'' + name + '\', current section: \'' + section.name + '\'');
	      }
	
	      section.raw = this._src.slice(section.location.endIndex, location.index);
	      section.location = this._makeLocation(section.location, token.location);
	
	      this._appendNode(section);
	    }
	  }, {
	    key: '_handleComment',
	    value: function _handleComment(token) {
	      var content = token.content;
	      var location = token.location;
	
	      this._appendNode({
	        type: NodeType.COMMENT,
	        content: content,
	        location: this._makeLocation(location)
	      });
	    }
	  }]);
	
	  return Parser;
	})();

	exports.Parser = Parser;

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	var EOF = 'EOF';
	exports.EOF = EOF;
	var TEXT = 'TEXT';
	exports.TEXT = TEXT;
	var PARTIAL = 'PARTIAL';
	exports.PARTIAL = PARTIAL;
	var INVERTED_SECTION_OPEN = 'INVERTED_SECTION_OPEN';
	exports.INVERTED_SECTION_OPEN = INVERTED_SECTION_OPEN;
	var SECTION_OPEN = 'SECTION_OPEN';
	exports.SECTION_OPEN = SECTION_OPEN;
	var SECTION_CLOSE = 'SECTION_CLOSE';
	exports.SECTION_CLOSE = SECTION_CLOSE;
	var UNESCAPED_VARIABLE = 'UNESCAPED_VARIABLE';
	exports.UNESCAPED_VARIABLE = UNESCAPED_VARIABLE;
	var COMMENT = 'COMMENT';
	exports.COMMENT = COMMENT;
	var VARIABLE = 'VARIABLE';
	exports.VARIABLE = VARIABLE;
	var DELIMITER_CHANGE = 'DELIMITER_CHANGE';
	exports.DELIMITER_CHANGE = DELIMITER_CHANGE;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	var ROOT = 'ROOT';
	exports.ROOT = ROOT;
	var VARIABLE = 'VARIABLE';
	exports.VARIABLE = VARIABLE;
	var SECTION = 'SECTION';
	exports.SECTION = SECTION;
	var TEXT = 'TEXT';
	exports.TEXT = TEXT;
	var COMMENT = 'COMMENT';
	exports.COMMENT = COMMENT;
	var PARTIAL = 'PARTIAL';
	exports.PARTIAL = PARTIAL;
	var DELIMITER_CHANGE = 'DELIMITER_CHANGE';
	exports.DELIMITER_CHANGE = DELIMITER_CHANGE;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
	
	var _token = __webpack_require__(2);
	
	var TokenType = _interopRequireWildcard(_token);
	
	var _extension = __webpack_require__(5);
	
	var _helpers = __webpack_require__(6);
	
	var STATE_NONE = 'STATE_NONE';
	var STATE_EOF = 'STATE_EOF';
	var STATE_TEXT = 'STATE_TEXT';
	var STATE_TEXT_BREAK = 'STATE_TEXT_BREAK';
	var STATE_TAG = 'STATE_TAG';
	
	var DELIMITER_LEFT = 0;
	var DELIMITER_RIGHT = 1;
	
	var Tokenizer = (function () {
	  function Tokenizer(src) {
	    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	    _classCallCheck(this, Tokenizer);
	
	    this._extensions = opts.extensions || (0, _extension.instantiateAll)();
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
	
	  _createClass(Tokenizer, [{
	    key: 'getNextToken',
	    value: function getNextToken() {
	      if (this._tokens.length > 0) {
	        return this._tokens.shift();
	      }
	
	      var done = false;
	      var matched = false;
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
	
	        if (matched) {
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
	
	  }, {
	    key: '_handleEOF',
	    value: function _handleEOF() {
	      this._handleStandaloneTag();
	      this._makeToken({
	        type: TokenType.EOF
	      });
	    }
	  }, {
	    key: '_handleTag',
	    value: function _handleTag() {
	      var _delimiters = _slicedToArray(this._delimiters, 2);
	
	      var left = _delimiters[0];
	      var right = _delimiters[1];
	
	      this._skip(left.length);
	      this._skipAllWhitespaces();
	
	      if (this._char === null) {
	        this._setError('Unclosed tag.');
	      } else if (this._isDelimiter(DELIMITER_RIGHT)) {
	        this._handleEmptyTag();
	      } else {
	        var tagTypeChar = this._char;
	        if (tagTypeChar === '{') {
	          this._handleVariableCurly();
	        } else {
	          var tagContentStart = this._index - 1;
	          //read content
	          while (!this._isDelimiter(DELIMITER_RIGHT) && this._char !== null) {
	            this._read();
	          }
	
	          if (this._char === null) {
	            this._setError('Unclosed tag.');
	          } else {
	            var content = this._src.slice(tagContentStart, this._index - 1);
	            switch (tagTypeChar) {
	              case '>':
	                this._handleSimpleTag(TokenType.PARTIAL, content);break;
	              case '^':
	                this._handleSimpleTag(TokenType.INVERTED_SECTION_OPEN, content);break;
	              case '#':
	                this._handleSimpleTag(TokenType.SECTION_OPEN, content);break;
	              case '/':
	                this._handleSimpleTag(TokenType.SECTION_CLOSE, content);break;
	
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
	        for (var i = 0; i < right.length; i++) {
	          this._read();
	        }
	      }
	
	      this._state = STATE_NONE;
	    }
	  }, {
	    key: '_handleDelimiterChange',
	    value: function _handleDelimiterChange(content) {
	      var newDelimiters = extractNewDelimiters(content);
	      if (newDelimiters === null) {
	        this._setError('Invalid change delimiter syntax.');
	      } else {
	        var _newDelimiters = _slicedToArray(newDelimiters, 2);
	
	        var left = _newDelimiters[0];
	        var right = _newDelimiters[1];
	
	        this._delimiters = newDelimiters;
	        this._makeToken({
	          type: TokenType.DELIMITER_CHANGE,
	          delimiters: [left, right]
	        });
	      }
	    }
	  }, {
	    key: '_handleSimpleTag',
	    value: function _handleSimpleTag(type, content) {
	      this._makeToken({ type: type, name: content.substr(1).trim() });
	    }
	  }, {
	    key: '_handleComment',
	    value: function _handleComment(content) {
	      this._makeToken({
	        type: TokenType.COMMENT,
	        content: content
	      });
	    }
	  }, {
	    key: '_handleVariableCurly',
	    value: function _handleVariableCurly() {
	      this._read(); //eat '{'
	      var begin = this._index - 1;
	      var d = this._distance('}');
	      if (d === -1) {
	        this._setError('Unclosed variable tag: missingright curly.');
	      } else {
	        var content = this._src.slice(begin, begin + d);
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
	  }, {
	    key: '_handleEmptyTag',
	    value: function _handleEmptyTag() {
	      this._makeToken({
	        type: TokenType.VARIABLE,
	        name: ''
	      });
	    }
	  }, {
	    key: '_handleVariable',
	    value: function _handleVariable(content, unescaped) {
	      this._makeToken({
	        type: unescaped ? TokenType.UNESCAPED_VARIABLE : TokenType.VARIABLE,
	        name: content.trim()
	      });
	    }
	  }, {
	    key: '_handleText',
	    value: function _handleText() {
	      var done = false;
	      var index = this._index - 1;
	      var length = 0;
	      do {
	        var c = this._char;
	
	        if (c === null || c === '\n' || this._isDelimiter(DELIMITER_LEFT)) {
	          done = true;
	        } else {
	          length++;
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
	  }, {
	    key: '_handleTextBreak',
	    value: function _handleTextBreak() {
	      this._makeToken({
	        type: TokenType.TEXT,
	        text: '\n'
	      });
	      this._read();
	      this._handleStandaloneTag();
	      this._state = STATE_NONE;
	    }
	  }, {
	    key: '_handleStandaloneTag',
	    value: function _handleStandaloneTag() {
	      this._tokens = (0, _helpers.trimStandaloneToken)(this._tokens);
	    }
	
	    // Helpers
	  }, {
	    key: '_dump',
	    value: function _dump() {
	      var t = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
	
	      console.log(t + '>' + this._src.slice(this._index - 1));
	    }
	  }, {
	    key: '_read',
	    value: function _read() {
	      if (this._index < this._src.length) {
	        if (this._char === '\n') {
	          this._line++;
	          this._column = 0;
	        } else {
	          this._column++;
	        }
	
	        this._char = this._src[this._index];
	        this._index++;
	      } else {
	        this._char = null;
	      }
	    }
	  }, {
	    key: '_peek',
	    value: function _peek() {
	      if (this._index < this._src.length - 1) {
	        return this._src[this._index];
	      } else {
	        return null;
	      }
	    }
	  }, {
	    key: '_skip',
	    value: function _skip(n) {
	      for (var i = 0; i < n; i++) {
	        this._read();
	      }
	    }
	  }, {
	    key: '_distance',
	    value: function _distance(c) {
	      for (var i = this._index; i < this._src.length; i++) {
	        if (this._src[i] === c) {
	          return i - this._index + 1;
	        }
	      }
	      return -1;
	    }
	  }, {
	    key: '_skipAllWhitespaces',
	    value: function _skipAllWhitespaces() {
	      while (this._isWhitespace()) {
	        this._read();
	      }
	    }
	  }, {
	    key: '_markTokenStartLocation',
	    value: function _markTokenStartLocation() {
	      this._location.index = this._index - 1;
	      this._location.line = this._line;
	      this._location.column = this._column;
	    }
	  }, {
	    key: '_markTokenEndLocation',
	    value: function _markTokenEndLocation() {
	      var token = this._tokens[this._tokens.length - 1];
	      var _location = this._location;
	      var index = _location.index;
	      var line = _location.line;
	      var column = _location.column;
	
	      token.location = {
	        index: index, line: line, column: column,
	        endIndex: this._index - 1,
	        endLine: this._line,
	        endColumn: this._column
	      };
	    }
	  }, {
	    key: '_isWhitespace',
	    value: function _isWhitespace() {
	      return (/\s/.test(this._char)
	      );
	    }
	  }, {
	    key: '_isDelimiter',
	    value: function _isDelimiter(d) {
	      var offset = arguments.length <= 1 || arguments[1] === undefined ? 0 : arguments[1];
	
	      var delimiter = this._delimiters[d];
	      var pos = this._index - 1 + offset;
	      return this._src.slice(pos, pos + delimiter.length) === delimiter;
	    }
	  }, {
	    key: '_makeToken',
	    value: function _makeToken(token) {
	      if (this._extensions.length) {
	        try {
	          this._extensions.forEach(function (ext) {
	            token = ext.transformToken(token);
	          });
	        } catch (e) {
	          this._setError(e.message);
	          return;
	        }
	      }
	      this._tokens.push(token);
	    }
	  }, {
	    key: '_setError',
	    value: function _setError(message) {
	      var error = new Error(message);
	      error.index = this._index - 1;
	      error.line = this._line;
	      error.column = this._column;
	      this._error = error;
	    }
	  }, {
	    key: 'error',
	    get: function get() {
	      return this._error;
	    }
	  }]);
	
	  return Tokenizer;
	})();
	
	exports.Tokenizer = Tokenizer;
	
	function extractNewDelimiters(tagContent) {
	  var matches = tagContent.match(/=[\s\n]*([^\s\n]*?)[\s\n]+([^\s\n]*?)[\s\n]*=[\s\n]*$/);
	  if (matches) {
	    return matches.slice(1);
	  } else {
	    return null;
	  }
	}

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	exports.instantiateAll = instantiateAll;
	exports.register = register;
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var registry = [];
	
	var Extension = (function () {
	  function Extension() {
	    _classCallCheck(this, Extension);
	  }
	
	  _createClass(Extension, [{
	    key: "transformToken",
	
	    //called by tokenizer
	    value: function transformToken(token) {
	      return token;
	    }
	
	    //called by parser
	  }, {
	    key: "handleToken",
	    value: function handleToken(token, parserContext) {}
	  }, {
	    key: "visit",
	    value: function visit(root) {
	      return root;
	    }
	
	    //called by renderer
	  }, {
	    key: "handleNode",
	    value: function handleNode(node, renderContext) {}
	  }]);
	
	  return Extension;
	})();
	
	exports.Extension = Extension;
	
	function instantiateAll() {
	  return registry.map(function (ctor) {
	    return new ctor();
	  });
	}
	
	function register(constructor) {
	  return registry.push(constructor);
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	exports.walk = walk;
	exports.visit = visit;
	exports.trimStandaloneToken = trimStandaloneToken;
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	var _token = __webpack_require__(2);
	
	var TokenType = _interopRequireWildcard(_token);
	
	function walk(root, modifier) {
	  var stack = root.children.slice(0).reverse();
	  while (stack.length) {
	    var node = stack.pop();
	    modifier(node);
	    if (node.children !== undefined) {
	      stack = stack.concat(node.children.slice(0).reverse());
	    }
	  }
	}
	
	function visit(root, visitor) {
	  var stack = [root];
	  while (stack.length) {
	    var _parent = stack.pop();
	    for (var i = 0; i < _parent.children.length; i++) {
	      var child = _parent.children[i];
	      var modified = visitor.visit(child) || child;
	      if (modified !== child) {
	        _parent.children[i] = modified;
	      }
	      if (child.children && child.children.length) {
	        stack.push(child);
	      }
	    }
	  }
	}
	
	function trimStandaloneToken(tokens) {
	  var count = tokens.length;
	
	  if (count === 0) {
	    return tokens;
	  }
	
	  var open = null;
	  var inline = 0;
	  var standalone = true;
	  var indentTokens = [];
	  for (var i = 0; standalone && i < count; i++) {
	    var token = tokens[i];
	    switch (token.type) {
	      case TokenType.VARIABLE:
	      case TokenType.UNESCAPED_VARIABLE:
	        standalone = false;
	        break;
	      case TokenType.TEXT:
	        if (isStringWhitespace(token.text)) {
	          if (inline === 0) {
	            indentTokens.push(token);
	          }
	        } else {
	          standalone = false;
	        }
	        break;
	      case TokenType.DELIMITER_CHANGE:
	      case TokenType.COMMENT:
	        if (open !== null) {
	          open.push(token);
	        } else {
	          inline++;
	        }
	        break;
	      case TokenType.SECTION_CLOSE:
	        if (open) {
	          if (open[0].name === token.name) {
	            open = null;
	          } else {
	            standalone = false;
	          }
	        } else {
	          inline++;
	        }
	        break;
	      default:
	        //section-like tags
	        if (open === null) {
	          open = [token];
	          inline++;
	        } else {
	          standalone = false;
	        }
	        break;
	    }
	
	    if (inline > 1) {
	      standalone = false;
	    }
	  }
	
	  if (open && open.length > 1) {
	    standalone = false;
	  }
	
	  if (standalone) {
	    //all whitespace
	    if (indentTokens.length === count) {
	      return tokens;
	    }
	
	    var tailWSNodeCount = 0;
	    for (var i = count - 1; i >= 0; i--) {
	      var token = tokens[i];
	      if (token.type == TokenType.TEXT && isStringWhitespace(token.text)) {
	        tailWSNodeCount++;
	      } else {
	        break;
	      }
	    }
	
	    if (indentTokens.length > 0 || tailWSNodeCount > 0) {
	      //trim
	      tokens = tokens.slice(indentTokens.length, count - tailWSNodeCount);
	      if (indentTokens.length) {
	        var indent = '';
	        indentTokens.forEach(function (t) {
	          indent += t.text;
	        });
	        tokens[0].indent = indent;
	      }
	    }
	  }
	  return tokens;
	}
	
	function isStringWhitespace(str) {
	  return (/^\s*$/.test(str)
	  );
	}

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
	
	var _node = __webpack_require__(3);
	
	var nodeTypes = _interopRequireWildcard(_node);
	
	var _escapeHtml = __webpack_require__(8);
	
	var _escapeHtml2 = _interopRequireDefault(_escapeHtml);
	
	var _parser = __webpack_require__(1);
	
	var _helpers = __webpack_require__(6);
	
	var _extension = __webpack_require__(5);
	
	var REPEATER_NODE_TYPE = '_REPEATER';
	var MAX_PARTIAL_STACK = 10;
	var MAX_LAMBDA_STACK = 255;
	
	var RenderContext = (function () {
	  function RenderContext(renderer) {
	    _classCallCheck(this, RenderContext);
	
	    this._renderer = renderer;
	  }
	
	  _createClass(RenderContext, [{
	    key: 'evaluate',
	    value: function evaluate(name) {
	      return this._renderer._evaluate(name);
	    }
	  }, {
	    key: 'pushNodes',
	    value: function pushNodes(nodes) {
	      this._renderer._pushNodes(nodes);
	    }
	  }, {
	    key: 'pushContext',
	    value: function pushContext(ctx) {
	      this._pushContext(ctx);
	    }
	  }, {
	    key: 'parse',
	    value: function parse(src, opts) {
	      return this._renderer._parse(src, opts);
	    }
	  }, {
	    key: 'getParsedPartial',
	    value: function getParsedPartial(name) {
	      return this._renderer._getParsedPartial(name);
	    }
	  }, {
	    key: 'throw',
	    value: function _throw(message, location) {
	      return this._renderer._throw(message, location);
	    }
	  }, {
	    key: 'top',
	    get: function get() {
	      return this._renderer._stack.length;
	    }
	  }]);
	
	  return RenderContext;
	})();
	
	var Renderer = (function () {
	  function Renderer(src) {
	    var _this = this;
	
	    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	    _classCallCheck(this, Renderer);
	
	    //if this is true, src and values in partials are parsed tree, not string
	    this._parsed = opts.parsed || false;
	
	    this._partials = opts.partials || {};
	    this._delimiters = opts.delimiters ? opts.delimiters : ['{{', '}}'];
	    this._extensions = opts.extensions || (0, _extension.instantiateAll)();
	    if (this._extensions.length > 0) {
	      this._renderContext = new RenderContext(this);
	    }
	
	    this._partialCached = {};
	    if (this._parsed) {
	      Object.keys(opts.partials).forEach(function (k) {
	        _this._partialCached[k] = opts.partials[k].children;
	      });
	    }
	
	    this._stack = null;
	    this._contextStack = null;
	    this._partialStack = null;
	    this._lambdaStack = null;
	    this._src = src;
	  }
	
	  _createClass(Renderer, [{
	    key: 'render',
	    value: function render(context) {
	      var _this2 = this;
	
	      this._stack = [];
	      this._contextStack = [];
	      this._partialStack = [];
	      this._lambdaStack = [];
	
	      this._pushContext(context);
	
	      //push root nodes
	      var rootNode = this._parsed ? this._src : this._parse(this._src);
	      this._stack = rootNode.children.slice(0).reverse();
	
	      var out = '';
	      var newline = true;
	
	      var _loop = function () {
	        var node = _this2._stack[_this2._stack.length - 1];
	        var partial = _this2._partialStack.length ? _this2._partialStack[_this2._partialStack.length - 1] : null;
	
	        //insert indent
	        if (node.type in nodeTypes) {
	          if (newline && partial !== null && partial.indent.length > 0) {
	            out += partial.indent;
	          }
	        }
	
	        var value = undefined;
	        switch (node.type) {
	          case nodeTypes.VARIABLE:
	            value = _this2._evaluate(node.name);
	            if (isFunction(value)) {
	              _this2._popNode();
	              _this2._expandLambda(node, value);
	            } else {
	              if (!!value) {
	                out += node.unescaped ? value : (0, _escapeHtml2['default'])(value);
	              }
	              _this2._popNode();
	            }
	            break;
	
	          case nodeTypes.SECTION:
	            value = _this2._evaluate(node.name);
	            if (isFunction(value)) {
	              _this2._popNode();
	              _this2._expandLambda(node, value);
	            } else {
	              var isList = Array.isArray(value);
	
	              if (isList && value.length === 0) {
	                //Empty lists should behave like falsey values.
	                value = false;
	                isList = false;
	              }
	
	              var testResult = !!value;
	              if (node.inverted) {
	                testResult = !testResult;
	              }
	
	              if (testResult) {
	                if (isList) {
	                  _this2._popNode();
	                  _this2._pushRepeaterNode(value.length, node.children, value);
	                } else {
	                  _this2._popNode();
	                  _this2._pushContext(value);
	                  _this2._pushNodes(node.children);
	                }
	              } else {
	                _this2._popNode();
	              }
	            }
	            break;
	
	          case nodeTypes.TEXT:
	            out += node.text;
	            _this2._popNode();
	            break;
	
	          case nodeTypes.COMMENT:
	            _this2._popNode();
	            break;
	
	          case nodeTypes.PARTIAL:
	            _this2._popNode();
	            _this2._expandPartial(node);
	            break;
	
	          case nodeTypes.DELIMITER_CHANGE:
	            _this2._popNode();
	            _this2._delimiters = node.delimiters.slice(0);
	            break;
	
	          case REPEATER_NODE_TYPE:
	            if (node.count < node.repeat) {
	              var repeatIndex = node.count;
	              if (repeatIndex === 0) {
	                _this2._pushContext(node.contexts[0]);
	              } else {
	                _this2._replaceTopContext(node.contexts[repeatIndex]);
	              }
	              _this2._pushNodes(node.children);
	              node.count++;
	            } else {
	              _this2._popNode();
	            }
	            break;
	
	          default:
	            _this2._popNode();
	            if (_this2._extensions) {
	              _this2._extensions.forEach(function (ext) {
	                ext.handleNode(node, _this2._renderContext);
	              });
	            }
	            break;
	        }
	
	        _this2._checkStacks();
	        newline = out.length === 0 || out[out.length - 1] === '\n';
	      };
	
	      while (this._stack.length > 0) {
	        _loop();
	      }
	      return out;
	    }
	  }, {
	    key: '_parse',
	    value: function _parse(src) {
	      var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
	
	      opts.extensions = this._extensions;
	      var parser = new _parser.Parser(opts);
	      return parser.parse(src);
	    }
	  }, {
	    key: '_pushNodes',
	    value: function _pushNodes(list) {
	      for (var i = list.length - 1; i >= 0; i--) {
	        this._stack.push(list[i]);
	      }
	    }
	  }, {
	    key: '_popNode',
	    value: function _popNode() {
	      this._stack.pop();
	    }
	  }, {
	    key: '_pushRepeaterNode',
	    value: function _pushRepeaterNode(repeat, nodes, contexts) {
	      this._stack.push({
	        type: REPEATER_NODE_TYPE,
	        count: 0,
	        repeat: repeat,
	        children: nodes.slice(0),
	        contexts: contexts
	      });
	    }
	  }, {
	    key: '_pushContext',
	    value: function _pushContext(context) {
	      this._contextStack.push({
	        context: context,
	        sp: this._stack.length
	      });
	    }
	  }, {
	    key: '_pushPartial',
	    value: function _pushPartial(_ref) {
	      var name = _ref.name;
	      var indent = _ref.indent;
	      var location = _ref.location;
	
	      this._partialStack.push({
	        name: name,
	        indent: indent || '',
	        location: location,
	        sp: this._stack.length
	      });
	    }
	  }, {
	    key: '_pushLambda',
	    value: function _pushLambda(_ref2) {
	      var name = _ref2.name;
	      var location = _ref2.location;
	
	      this._lambdaStack.push({
	        name: name,
	        location: location,
	        sp: this._stack.length
	      });
	    }
	  }, {
	    key: '_replaceTopContext',
	    value: function _replaceTopContext(context) {
	      this._contextStack[this._contextStack.length - 1].context = context;
	    }
	  }, {
	    key: '_checkStacks',
	    value: function _checkStacks() {
	      //console.log('STACK', this._stack);
	
	      //console.log('CONTEXT STACK:', this._contextStack);
	      if (this._stack.length === this._contextStack[this._contextStack.length - 1].sp) {
	        this._contextStack.pop();
	      }
	
	      //console.log('PARTIAL STACK:', this._partialStack);
	      if (this._partialStack.length > 0 && this._stack.length === this._partialStack[this._partialStack.length - 1].sp) {
	        this._partialStack.pop();
	      }
	
	      if (this._lambdaStack.length > 0 && this._stack.length === this._lambdaStack[this._lambdaStack.length - 1].sp) {
	        this._lambdaStack.pop();
	      }
	    }
	  }, {
	    key: '_evaluate',
	    value: function _evaluate(name) {
	      if (name === '.') {
	        return this._contextStack[this._contextStack.length - 1].context;
	      }
	
	      var path = name.split('.');
	      for (var i = this._contextStack.length - 1; i >= 0; i--) {
	        var context = this._contextStack[i].context;
	        if (context === null || typeof context !== 'object') {
	          continue;
	        }
	
	        var current = context;
	        var resolved = true;
	        for (var pi = 0; pi < path.length; pi++) {
	          var key = path[pi];
	          if (current.hasOwnProperty(key)) {
	            current = current[key];
	          } else {
	            resolved = false;
	            break;
	          }
	        }
	
	        if (resolved) {
	          return current;
	        }
	      }
	      return '';
	    }
	  }, {
	    key: '_getParsedPartial',
	    value: function _getParsedPartial(name) {
	      if (this._partialCached.hasOwnProperty(name)) {
	        return this._partialCached[name];
	      } else {
	        if (!this._partials.hasOwnProperty(name)) {
	          return null;
	        }
	        var ast = this._parse(this._partials[name], { name: name });
	        var nodes = this._partialCached[name] = ast.children;
	        return nodes;
	      }
	    }
	  }, {
	    key: '_expandPartial',
	    value: function _expandPartial(node) {
	      var name = node.name;
	
	      var nodes = this._getParsedPartial(name);
	
	      if (nodes === null) {
	        //The empty string should be used when the named partial is not found.
	        return;
	      }
	
	      this._pushPartial(node);
	
	      if (this._partialStack.length > MAX_PARTIAL_STACK) {
	        this._throw('Possible partial short circuit: ' + this._partialStack.map(function (f) {
	          return f.name + '@' + f.location.filename + ':' + (f.location.line + 1);
	        }).concat([name]).join(' -> '), node.location);
	      }
	
	      this._pushNodes(nodes);
	    }
	  }, {
	    key: '_expandLambda',
	    value: function _expandLambda(node, lambda) {
	      var name = node.name;
	
	      this._pushLambda(node);
	
	      if (this._lambdaStack.length > MAX_LAMBDA_STACK) {
	        this._throw('Possible lambda short circuit: ' + this._lambdaStack.map(function (f) {
	          return f.name + '@' + f.location.filename + ':' + (f.location.line + 1);
	        }).concat([name]).join(' -> '), node.location);
	      }
	
	      var ast = undefined;
	      var skipped = false;
	      if (node.type === nodeTypes.VARIABLE) {
	        var code = lambda();
	        if (code) {
	          //A lambda's return value should parse with the default delimiters.
	          ast = this._parse('' + code, { name: '[lambda]' });
	          if (!node.unescaped) {
	            //Lambda results should be appropriately escaped.
	            (0, _helpers.walk)(ast, function (node) {
	              if (node.type === nodeTypes.TEXT) {
	                node.text = (0, _escapeHtml2['default'])(node.text);
	              }
	            });
	          }
	        } else {
	          skipped = true;
	        }
	      } else if (node.type === nodeTypes.SECTION) {
	        var code = lambda(node.raw);
	        if (code) {
	          //Lambdas used for inverted sections should be considered truthy.
	          //Lambdas used for sections should parse with the current delimiters.
	          ast = this._parse('' + code, {
	            name: '[#lambda]',
	            delimiters: this._delimiters.slice(0)
	          });
	        } else {
	          skipped = true;
	        }
	      }
	
	      if (!skipped) {
	        this._pushNodes(ast.children);
	      }
	    }
	  }, {
	    key: '_throw',
	    value: function _throw(message, location) {
	      var e = new Error(message);
	      e.location = location;
	      throw e;
	    }
	  }]);
	
	  return Renderer;
	})();
	
	exports.Renderer = Renderer;
	
	function isFunction(x) {
	  return Object.prototype.toString.call(x) == '[object Function]';
	}

/***/ },
/* 8 */
/***/ function(module, exports) {

	/*!
	 * escape-html
	 * Copyright(c) 2012-2013 TJ Holowaychuk
	 * Copyright(c) 2015 Andreas Lubbe
	 * Copyright(c) 2015 Tiancheng "Timothy" Gu
	 * MIT Licensed
	 */
	
	'use strict';
	
	/**
	 * Module variables.
	 * @private
	 */
	
	var matchHtmlRegExp = /["'&<>]/;
	
	/**
	 * Module exports.
	 * @public
	 */
	
	module.exports = escapeHtml;
	
	/**
	 * Escape special characters in the given string of html.
	 *
	 * @param  {string} string The string to escape for inserting into HTML
	 * @return {string}
	 * @public
	 */
	
	function escapeHtml(string) {
	  var str = '' + string;
	  var match = matchHtmlRegExp.exec(str);
	
	  if (!match) {
	    return str;
	  }
	
	  var escape;
	  var html = '';
	  var index = 0;
	  var lastIndex = 0;
	
	  for (index = match.index; index < str.length; index++) {
	    switch (str.charCodeAt(index)) {
	      case 34: // "
	        escape = '&quot;';
	        break;
	      case 38: // &
	        escape = '&amp;';
	        break;
	      case 39: // '
	        escape = '&#39;';
	        break;
	      case 60: // <
	        escape = '&lt;';
	        break;
	      case 62: // >
	        escape = '&gt;';
	        break;
	      default:
	        continue;
	    }
	
	    if (lastIndex !== index) {
	      html += str.substring(lastIndex, index);
	    }
	
	    lastIndex = index + 1;
	    html += escape;
	  }
	
	  return lastIndex !== index
	    ? html + str.substring(lastIndex, index)
	    : html;
	}


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	// https://github.com/mustache/spec/pull/75
	
	'use strict';
	
	Object.defineProperty(exports, '__esModule', {
	  value: true
	});
	
	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();
	
	var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };
	
	function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var _extension = __webpack_require__(5);
	
	var _node = __webpack_require__(3);
	
	var NodeType = _interopRequireWildcard(_node);
	
	var _token2 = __webpack_require__(2);
	
	var TokenType = _interopRequireWildcard(_token2);
	
	var _helpers = __webpack_require__(6);
	
	var PARENT = 'Inheritance.PARENT';
	var BLOCK = 'Inheritance.BLOCK';
	var LEAVE_SCOPE = 'Inheritance.LEAVE_SCOPE';
	
	function isInheritanceTagType(type) {
	  return type === PARENT || type === BLOCK;
	}
	
	var Inheritance = (function (_Extension) {
	  _inherits(Inheritance, _Extension);
	
	  function Inheritance() {
	    _classCallCheck(this, Inheritance);
	
	    _get(Object.getPrototypeOf(Inheritance.prototype), 'constructor', this).call(this);
	
	    this._blocks = null;
	  }
	
	  _createClass(Inheritance, [{
	    key: 'transformToken',
	    value: function transformToken(token) {
	      var _token = token;
	      var type = _token.type;
	      var name = _token.name;
	      var location = _token.location;
	
	      switch (type) {
	        case TokenType.VARIABLE:
	          if (name) {
	            if (name[0] === '<') {
	              if (name.length === 1) {
	                throw new Error('Parent partial name expected');
	              }
	              token = {
	                type: PARENT,
	                name: name.slice(1),
	                location: location
	              };
	            } else if (name[0] === '$') {
	              if (name.length === 1) {
	                throw new Error('Block name expected');
	              }
	              token = {
	                type: BLOCK,
	                name: name.slice(1),
	                location: location
	              };
	            }
	          }
	          break;
	      }
	      return token;
	    }
	  }, {
	    key: 'handleToken',
	    value: function handleToken(token, parserContext) {
	      var handled = false;
	      var name = token.name;
	      var location = token.location;
	      var type = token.type;
	
	      switch (type) {
	        case PARENT:
	          parserContext.pushParent({
	            type: PARENT,
	            name: name,
	            location: location
	          });
	          handled = true;
	          break;
	
	        case BLOCK:
	          parserContext.pushParent({
	            type: BLOCK,
	            name: name,
	            location: location
	          });
	          break;
	
	        case TokenType.SECTION_CLOSE:
	          var tagNode = parserContext.tailNode;
	          if (tagNode === null) {
	            if (isInheritanceTagType(tagNode.type)) {
	              parserContext['throw']('Unexpected tag close');
	            }
	          } else {
	            if (tagNode.name !== name) {
	              parserContext['throw']('Unexpected tag close, current tag: ' + tagNode.name);
	            }
	            if (isInheritanceTagType(tagNode.type)) {
	              parserContext.popParent();
	              tagNode.location.endIndex = location.endIndex;
	              tagNode.location.endLine = location.endLine;
	              parserContext.appendNode(tagNode);
	
	              //TODO move this to visit, handle whitespaces after Parent close tag.
	              var firstLine = tagNode.location.line;
	              var firstBlock = tagNode.children.find(function (c) {
	                return c.type === BLOCK;
	              });
	              if (firstBlock && firstBlock.location.line === firstLine) {
	                for (var i = 0; i < firstBlock.children.length; i++) {
	                  var blockNode = firstBlock.children[i];
	                  if (blockNode.type === NodeType.TEXT && /^\s*$/.test(blockNode.text)) {
	                    blockNode.text = '';
	                  } else {
	                    break;
	                  }
	                }
	              }
	
	              handled = true;
	            }
	          }
	          break;
	
	        case TokenType.EOF:
	          if (this.top > 0) {
	            parserContext['throw']('Unexpected EOF: tags not closed: ' + this.stack.map(function (f) {
	              return f.name;
	            }).join(', '));
	          }
	          break;
	      }
	      return handled;
	    }
	  }, {
	    key: 'handleNode',
	    value: function handleNode(node, rendererContext) {
	      switch (node.type) {
	        case PARENT:
	          this._handleParent(node, rendererContext);
	          break;
	
	        case BLOCK:
	          this._handleBlock(node, rendererContext);
	          break;
	
	        case LEAVE_SCOPE:
	          this._blocks = null;
	          break;
	      }
	    }
	  }, {
	    key: '_handleParent',
	    value: function _handleParent(node, rendererContext) {
	      var _this = this;
	
	      var name = node.name;
	      var location = node.location;
	
	      if (this._blocks === null) {
	        rendererContext.pushNodes([{
	          type: LEAVE_SCOPE
	        }]);
	        this._blocks = {};
	      }
	
	      //find all blocks defined in parent
	      node.children.forEach(function (child) {
	        if (child.type === BLOCK) {
	          var blockName = child.name;
	          if (!_this._blocks.hasOwnProperty(blockName)) {
	            _this._blocks[blockName] = child;
	          }
	        }
	      });
	
	      rendererContext.pushNodes([{
	        type: TokenType.PARTIAL,
	        name: name, location: location,
	        indent: node.indent
	      }]);
	    }
	  }, {
	    key: '_handleBlock',
	    value: function _handleBlock(node, rendererContext) {
	      var name = node.name;
	
	      if (this._blocks !== null && this._blocks.hasOwnProperty(name)) {
	        rendererContext.pushNodes(this._blocks[name].children);
	      } else {
	        rendererContext.pushNodes(node.children);
	      }
	    }
	  }]);
	
	  return Inheritance;
	})(_extension.Extension);

	exports.Inheritance = Inheritance;

/***/ }
/******/ ])
});
;
//# sourceMappingURL=huz.js.map