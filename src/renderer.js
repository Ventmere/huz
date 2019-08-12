import * as nodeTypes from "./node";
import escapeHTML from "escape-html";
import { Parser } from "./parser";
import { walk, visit } from "./helpers";
import { instantiateAll } from "./extension";

const REPEATER_NODE_TYPE = "_REPEATER";
const MAX_PARTIAL_STACK = 100;
const MAX_LAMBDA_STACK = 255;
const MAX_NODE_COUNT = 30000;

class RenderContext {
  constructor(renderer) {
    this._renderer = renderer;
  }

  get top() {
    return this._renderer._stack.length;
  }

  get result() {
    return this._renderer._out;
  }

  evaluate(name) {
    return this._renderer._evaluate(name);
  }

  pushNodes(nodes) {
    this._renderer._pushNodes(nodes);
  }

  pushNode(node) {
    this._renderer._pushNode(node);
  }

  pushContext(ctx, sp) {
    this._renderer._pushContext(ctx, sp);
  }

  appendText(text) {
    this._renderer._out += text;
  }

  parse(src, opts) {
    return this._renderer._parse(src, opts);
  }

  getParsedPartial(name) {
    return this._renderer._getParsedPartial(name);
  }

  throw(message, location) {
    return this._renderer._throw(message, location);
  }
}

export class Renderer {
  constructor(src, opts = {}) {
    //if this is true, src and values in partials are parsed tree, not string
    this._parsed = opts.parsed || false;
    this._filename = opts.filename;

    this._partials = opts.partials || {};
    this._delimiters = opts.delimiters ? opts.delimiters : ["{{", "}}"];
    this._extensions = opts.extensions || instantiateAll(opts);
    if (this._extensions.length > 0) {
      this._renderContext = new RenderContext(this);
    }

    this._partialCached = {};
    if (this._parsed) {
      Object.keys(this._partials).forEach(k => {
        this._partialCached[k] = this._partials[k].children;
      });
    }

    this._stack = null;
    this._contextStack = null;
    this._partialStack = null;
    this._lambdaStack = null;
    this._src = src;
    this._out = "";
    this._transformNodeResult = (node, result, nodeResult) =>
      this._extensions.reduce(
        (r, e) => e.transformNodeResult(node, result, r),
        nodeResult
      );
  }

  render(context) {
    this._out = "";
    this._stack = [];
    this._contextStack = [];
    this._partialStack = [];
    this._lambdaStack = [];

    this._pushContext(context);

    //push root nodes
    const rootNode = this._parsed
      ? this._src
      : this._parse(this._src, { filename: this._filename });
    this._stack = rootNode.children.slice(0).reverse();

    let node_count = 0;

    let newline = true;
    while (this._stack.length > 0) {
      const top = this._stack.length - 1;
      const node = this._stack[top];

      if (node.type !== nodeTypes.TEXT) {
        node_count++;
        if (node_count > MAX_NODE_COUNT) {
          this._throw(
            `Possible infinity loop detected: last node type is '${node.type}'`,
            node.location
          );
        }
      }

      let handled = false;
      if (this._extensions) {
        this._extensions.forEach(ext => {
          if (ext.handleNode(node, this._renderContext)) {
            handled = true;
          }
        });
      }

      if (handled) {
        this._stack.splice(top, 1);
      } else {
        const partial = this._partialStack.length
          ? this._partialStack[this._partialStack.length - 1]
          : null;

        //insert indent
        if (node.type in nodeTypes) {
          if (newline && partial !== null && partial.indent.length > 0) {
            this._out += partial.indent;
          }
        }

        let value;
        switch (node.type) {
          case nodeTypes.VARIABLE:
            value = this._evaluate(node.name);
            if (isFunction(value)) {
              this._popNode();
              this._expandLambda(node, value);
            } else {
              if (!!value) {
                const result = node.unescaped ? value : escapeHTML(value);
                this._out += this._transformNodeResult(node, this._out, result);
              }
              this._popNode();
            }
            break;

          case nodeTypes.SECTION:
            value = this._evaluate(node.name);
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
                  this._popNode();
                  this._pushContext(value);
                  this._pushNodes(node.children);
                }
              } else {
                this._popNode();
              }
            }
            break;

          case nodeTypes.TEXT:
            this._out += this._transformNodeResult(node, this._out, node.text);
            this._popNode();
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
                node.contextIndex = this._pushContext(node.contexts[0]);
              } else {
                this._replaceContextAt(
                  node.contextIndex,
                  node.contexts[repeatIndex]
                );
              }
              this._pushNodes(node.children);
              node.count++;
            } else {
              this._popNode();
            }
            break;

          default:
            this._popNode();
            break;
        }
      }
      this._checkStacks();
      newline =
        this._out.length === 0 || this._out[this._out.length - 1] === "\n";
    }

    return this._extensions.reduce(
      (result, ext) => ext.transformResult(result),
      this._out
    );
  }

  _parse(src, opts = {}) {
    opts.extensions = this._extensions;
    const parser = new Parser(opts);
    return parser.parse(src);
  }

  _pushNodes(list) {
    for (let i = list.length - 1; i >= 0; i--) {
      this._stack.push(list[i]);
    }
  }

  _pushNode(node) {
    this._stack.push(node);
  }

  _popNode() {
    this._stack.pop();
  }

  _pushRepeaterNode(repeat, nodes, contexts) {
    this._stack.push({
      type: REPEATER_NODE_TYPE,
      count: 0,
      repeat,
      children: nodes.slice(0),
      contexts
    });
  }

  _pushContext(context, sp = this._stack.length) {
    if (this._contextStack.length) {
      sp = Math.min(
        Math.max(this._contextStack[this._contextStack.length - 1].sp, sp),
        this._stack.length
      );
    }
    return (
      this._contextStack.push({
        context,
        sp
      }) - 1
    );
  }

  _replaceContextAt(index, context) {
    if (index < 0 || index > this._contextStack.length - 1) {
      throw new RangeError("Huz context index out of range.");
    }
    this._contextStack[index].context = context;
  }

  _pushPartial({ name, indent, location }) {
    this._partialStack.push({
      name,
      indent: indent || "",
      location,
      sp: this._stack.length
    });
  }

  _pushLambda({ name, location }) {
    this._lambdaStack.push({
      name,
      location,
      sp: this._stack.length
    });
  }

  _checkStacks() {
    while (
      this._stack.length < this._contextStack[this._contextStack.length - 1].sp
    ) {
      this._contextStack.pop();
    }

    if (
      this._partialStack.length > 0 &&
      this._stack.length ===
        this._partialStack[this._partialStack.length - 1].sp
    ) {
      this._partialStack.pop();
    }

    if (
      this._lambdaStack.length > 0 &&
      this._stack.length === this._lambdaStack[this._lambdaStack.length - 1].sp
    ) {
      this._lambdaStack.pop();
    }
  }

  _evaluate(name) {
    if (name === ".") {
      return this._contextStack[this._contextStack.length - 1].context;
    }

    const path = name.split(".");
    for (let i = this._contextStack.length - 1; i >= 0; i--) {
      const context = this._contextStack[i].context;
      if (context === null || typeof context !== "object") {
        continue;
      }

      let current = context;
      let resolved = true;
      for (let pi = 0; pi < path.length; pi++) {
        const key = path[pi];
        if (
          typeof current === "object" &&
          current !== null &&
          current.hasOwnProperty(key)
        ) {
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
    return "";
  }

  _getParsedPartial(name) {
    if (this._partialCached.hasOwnProperty(name)) {
      return this._partialCached[name];
    } else {
      if (!this._partials.hasOwnProperty(name)) {
        return null;
      }
      const ast = this._parse(this._partials[name], { filename: name });
      const nodes = (this._partialCached[name] = ast.children);
      return nodes;
    }
  }

  _expandPartial(node) {
    const { name } = node;
    const nodes = this._getParsedPartial(name);

    if (nodes === null) {
      //The empty string should be used when the named partial is not found.
      return;
    }

    this._pushPartial(node);

    if (this._partialStack.length > MAX_PARTIAL_STACK) {
      this._throw(
        "Possible partial short circuit: " +
          this._partialStack
            .map(f => `${f.name}@${f.location.filename}:${f.location.line + 1}`)
            .concat([name])
            .join(" -> "),
        node.location
      );
    }

    this._pushNodes(nodes);
  }

  _expandLambda(node, lambda) {
    const { name } = node;

    this._pushLambda(node);

    if (this._lambdaStack.length > MAX_LAMBDA_STACK) {
      this._throw(
        "Possible lambda short circuit: " +
          this._lambdaStack
            .map(f => `${f.name}@${f.location.filename}:${f.location.line + 1}`)
            .concat([name])
            .join(" -> "),
        node.location
      );
    }

    let ast;
    let skipped = false;
    if (node.type === nodeTypes.VARIABLE) {
      const code = lambda();
      if (code) {
        //A lambda's return value should parse with the default delimiters.
        ast = this._parse("" + code, { filename: "[lambda]" });
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
        ast = this._parse("" + code, {
          filename: "[#lambda]",
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

  _throw(message, location) {
    const e = new Error(message);
    e.filename = location.filename;
    e.location = location;
    throw e;
  }
}

function isFunction(x) {
  return Object.prototype.toString.call(x) == "[object Function]";
}
