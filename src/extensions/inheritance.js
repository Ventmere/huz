// https://github.com/mustache/spec/pull/75

import { Extension, register } from "../extension";
import * as NodeType from "../node";
import * as TokenType from "../token";

const PARENT = "Inheritance.PARENT";
const BLOCK = "Inheritance.BLOCK";
const LEAVE_SCOPE = "Inheritance.LEAVE_SCOPE";

function isInheritanceTagType(type) {
  return type === PARENT || type === BLOCK;
}

export class Inheritance extends Extension {
  constructor() {
    super();

    this._blocks = null;
    this._parentStack = [];
  }

  transformToken(token) {
    const { type, name, location } = token;
    switch (type) {
      case TokenType.VARIABLE:
        if (name) {
          if (name[0] === "<") {
            if (name.length === 1) {
              throw new Error("Parent partial name expected");
            }
            token = {
              type: PARENT,
              name: name.slice(1),
              location
            };
          } else if (name[0] === "$") {
            if (name.length === 1) {
              throw new Error("Block name expected");
            }
            token = {
              type: BLOCK,
              name: name.slice(1),
              location
            };
          }
        }
        break;
    }
    return token;
  }

  handleToken(token, parserContext) {
    let handled = false;
    const { name, location, type } = token;
    switch (type) {
      case PARENT:
        parserContext.pushParent({
          type: PARENT,
          name,
          location
        });
        handled = true;
        break;

      case BLOCK:
        this._pushBlock(
          {
            type: BLOCK,
            name,
            location
          },
          parserContext
        );
        break;

      case TokenType.SECTION_CLOSE:
        const tagNode = parserContext.tailNode;
        if (tagNode === null) {
          if (isInheritanceTagType(tagNode.type)) {
            parserContext.throw("Unexpected tag close");
          }
        } else {
          if (tagNode.name !== name) {
            parserContext.throw(
              `Unexpected tag close, current tag: ${tagNode.name}`
            );
          }
          if (isInheritanceTagType(tagNode.type)) {
            parserContext.popParent();
            tagNode.location.endIndex = location.endIndex;
            tagNode.location.endLine = location.endLine;
            parserContext.appendNode(tagNode);

            //TODO move this to visit, handle whitespaces after Parent close tag.
            const firstLine = tagNode.location.line;
            const firstBlock = tagNode.children.find(c => c.type === BLOCK);
            if (firstBlock && firstBlock.location.line === firstLine) {
              for (let i = 0; i < firstBlock.children.length; i++) {
                const blockNode = firstBlock.children[i];
                if (
                  blockNode.type === NodeType.TEXT &&
                  /^\s*$/.test(blockNode.text)
                ) {
                  blockNode.text = "";
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
          parserContext.throw(
            "Unexpected EOF: tags not closed: " +
              this.stack.map(f => f.name).join(", ")
          );
        }
        break;
    }
    return handled;
  }

  handleNode(node, rendererContext) {
    const top = rendererContext.top;
    this._checkTop(top);

    switch (node.type) {
      case PARENT:
        this._handleParent(node, rendererContext);
        return true;

      case BLOCK:
        this._handleBlock(node, rendererContext);
        return true;

      case LEAVE_SCOPE:
        this._blocks = null;
        return true;
    }
  }

  _pushBlock(node, parserContext) {
    const parent = parserContext.lastParent();
    if (parent && parent.type === BLOCK && parent.name === node.name) {
      parserContext.throw(`Recursive block: '${node.name}'`);
    }
    parserContext.pushParent(node);
  }

  _handleParent(node, rendererContext) {
    const { name, location } = node;
    const top = rendererContext.top;

    this._pushParent(name, top);

    if (this._blocks === null) {
      rendererContext.pushNodes([
        {
          type: LEAVE_SCOPE
        }
      ]);
      this._blocks = {};
    }

    //find all blocks defined in parent
    const blocks = {};
    node.children.forEach(child => {
      if (child.type === BLOCK) {
        const blockName = child.name;
        blocks[blockName] = child;
      }
    });
    if (Object.keys(blocks).length) {
      this._setDefaultBlocks(blocks);
    }

    rendererContext.pushNode({
      type: TokenType.PARTIAL,
      name,
      location,
      indent: node.indent
    });
  }

  _handleBlock(node, rendererContext) {
    const { name } = node;
    const defaultBlock = this._getDefaultBlock(name);
    if (defaultBlock) {
      rendererContext.pushNodes(defaultBlock.children);
    } else {
      rendererContext.pushNodes(node.children);
    }
  }

  _pushParent(name, top) {
    return this._parentStack.push({
      name,
      blocks: {},
      top
    });
  }

  _checkTop(top) {
    let pop = 0;
    for (let i = this._parentStack.length - 1; i >= 0; i--) {
      const frame = this._parentStack[i];
      if (frame.top > top) {
        pop++;
      } else {
        break;
      }
    }
    if (pop > 0) {
      this._parentStack = this._parentStack.slice(
        0,
        this._parentStack.length - pop
      );
    }
  }

  _popParent() {
    return this._parentStack.pop();
  }

  _getDefaultBlock(name) {
    for (let i = 0; i < this._parentStack.length; i++) {
      const frame = this._parentStack[i];
      if (name in frame.blocks) {
        return frame.blocks[name];
      }
    }
    return null;
  }

  _setDefaultBlocks(blocks) {
    const topFrame = this._parentStack[this._parentStack.length - 1];
    topFrame.blocks = Object.assign(topFrame.blocks, blocks);
  }
}
