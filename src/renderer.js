import * as nodeTypes from './node';
import escapeHTML from 'escape-html';
import { Parser } from './parser';

const REPEATER_NODE_TYPE  = '_REPEATER';
const MAX_PARTIAL_RECURSION = 10;

export class Renderer {
  constructor(root, opts = {}) {
    this._partials = opts.partials || {};
    this._delimiters = opts.delimiters ? opts.delimiters : ['{{', '}}'];

    this._partialCached = {};
    this._root = root;
    this._stack = null;
    this._contextStack = null;
    this._partialStack = null;
    this._error = null;
  }

  get error() {
    return this._error;
  }

  render(context) {
    this._stack = [];
    this._contextStack = [];
    this._partialStack = [];

    this._pushContext(context);

    //push root nodes
    this._stack = this._root.children.slice(0).reverse();

    let out = '';
    let newline = true;
    while (this._error === null && this._stack.length > 0) {
      const node = this._stack[this._stack.length - 1];
      const partial = this._partialStack.length ? this._partialStack[this._partialStack.length - 1] : null;

      //insert indent
      if (node.type in nodeTypes) {
        if (newline && partial !== null && partial.indent.length > 0) {
          out += partial.indent;
        }
      }

      let value;
      switch (node.type) {
        case nodeTypes.VARIABLE:
          value = this._getValue(node.name);
          if (isFunction(value)) {
            this._popNode();
            this._expandLambda(node, value);
          } else {
            if (!!value) {
              out += node.unescaped ? value : escapeHTML(value);
            }
            this._popNode();
          }
          break;

        case nodeTypes.SECTION:
          value = this._getValue(node.name);
          if (isFunction(value)) {
            this._popNode();
            this._expandLambda(node, value);
          } else {
            let isList = Array.isArray(value);

            if (isList && value.length === 0) {
              //Empty lists should behave like falsey values.
              value = false;
              isList = false;
            }

            let testResult = !!value;
            if (node.inverted) {
              testResult = !testResult;
            }

            if (testResult) {
              if (isList) {
                this._popNode();
                this._pushRepeaterNode(value.length, node.children, value);
              } else {
                this._popNode()
                this._pushContext(value);
                this._pushNodes(node.children);
              }
            } else {
              this._popNode();
            }
          }
          break;

        case nodeTypes.TEXT:
          out += node.text;
          this._popNode()
          break;

        case nodeTypes.COMMENT:
          this._popNode();
          break;

        case nodeTypes.PARTIAL:
          this._popNode();
          this._expandPartial(node);
          break;

        case nodeTypes.DELIMITER_CHANGE:
          this._popNode();
          this._delimiters = node.delimiters.slice(0);
          break;

        case REPEATER_NODE_TYPE:
          if (node.count < node.repeat) {
            const repeatIndex = node.count;
            if (repeatIndex === 0) {
              this._pushContext(node.contexts[0]);
            } else {
              this._replaceTopContext(node.contexts[repeatIndex]);
            }
            this._pushNodes(node.nodesReversed, true);
            node.count ++;
          } else {
            this._popNode();
          }
          break;

        case LAMBDA_NODE_TYPE:
          this._popNode();
          this._expandLambda(node);
          break;
      }

      this._checkStacks();
      newline = out.length === 0 || (out[out.length -1 ] === '\n');
    }
    return out;
  }

  _pushNodes(list, reversed = false) {
    this._stack = this._stack.concat(reversed ? list : list.slice(0).reverse());
  }

  _popNode() {
    this._stack.pop();
  }

  _pushRepeaterNode(repeat, nodes, contexts) {
    this._stack.push({
      type: REPEATER_NODE_TYPE,
      count: 0,
      repeat,
      nodesReversed: nodes.slice(0).reverse(),
      contexts
    });
  }

  _pushContext(context) {
    this._contextStack.push({
      context,
      sp: this._stack.length
    });
  }

  _pushPartial(name, indent = '') {
    this._partialStack.push({
      name,
      indent,
      sp: this._stack.length
    });
  }

  _replaceTopContext(context) {
    this._contextStack[this._contextStack.length - 1].context = context;
  }

  _checkStacks() {
    //console.log('STACK', this._stack);

    //console.log('CONTEXT STACK:', this._contextStack);
    if (this._stack.length === this._contextStack[this._contextStack.length - 1].sp) {
      this._contextStack.pop();
    }

    //console.log('PARTIAL STACK:', this._partialStack);
    if (this._partialStack.length > 0 && this._stack.length === this._partialStack[this._partialStack.length - 1].sp) {
      this._partialStack.pop();
    }
  }

  _getValue(name) {
    if (name === '.') {
      return this._contextStack[this._contextStack.length - 1].context;
    }

    const path = name.split('.');
    for (let i = this._contextStack.length - 1; i >= 0; i--) {
      const context = this._contextStack[i].context;
      if (context === null || typeof context !== 'object') {
        continue;
      }

      let current = context;
      let resolved = true;
      for (let pi = 0; pi < path.length; pi++) {
        const key = path[pi];
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

  _expandPartial(node) {
    const { name } = node;
    if (!this._partials.hasOwnProperty(name)) {
      return;
    }

    this._pushPartial(name, node.indent);

    if (this._partialStack.length > MAX_PARTIAL_RECURSION) {
      this._setError(
        'Partial stack overflow: ' +
          this._partialStack.map(f => f.name).concat([name]).join(' -> '),
        node.location
      );
      return;
    }

    if (this._partialCached.hasOwnProperty(name)) {
      this._pushNodes(this._partialCached[name], true);
    } else {
      const parser = new Parser(name);
      const ast = parser.parse(this._partials[name]);
      if (ast !== null) {
        const nodesReversed = this._partialCached[name] = ast.children.slice(0).reverse();
        this._pushNodes(nodesReversed, true);
      } else {
        this._error = parser.error;
      }
    }
  }

  _expandLambda(node, lambda) {
    let ast;
    let skipped = false;
    if (node.type === nodeTypes.VARIABLE) {
      const code = lambda();
      if (code) {
        //A lambda's return value should parse with the default delimiters.
        const parser = new Parser('[lambda return value]');
        ast = parser.parse('' + code);
        if (!node.unescaped) {
          //Lambda results should be appropriately escaped.
          walk(ast, node => {
            if (node.type === nodeTypes.TEXT) {
              node.text = escapeHTML(node.text);
            }
          });
        }
      } else {
        skipped = true;
      }
    } else if (node.type === nodeTypes.SECTION) {
      const code = lambda(node.raw);
      if (code) {
        //Lambdas used for inverted sections should be considered truthy.
        //Lambdas used for sections should parse with the current delimiters.
        const parser = new Parser('[lambda]', {
          delimiters: this._delimiters.slice(0)
        });
        ast = parser.parse('' + code);
      } else {
        skipped = true;
      }
    }

    if (!skipped) {
      if (ast !== null) {
        this._pushNodes(ast.children);
      } else {
        this._error = parser.error;
      }
    }
  }

  _setError(message, location) {
    this._error = new Error(message);
    this._error.location = location;
  }
}

function isFunction(x) {
  return Object.prototype.toString.call(x) == '[object Function]';
}

function walk(root, modifier) {
  let stack = root.children.slice(0).reverse();
  while (stack.length) {
    const node = stack.pop();
    modifier(node);
    if (node.children !== undefined) {
      stack = stack.concat(node.children.slice(0).reverse());
    }
  }
}