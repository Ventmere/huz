// https://github.com/mustache/spec/pull/75

import { Extension, register } from '../extension';
import * as NodeType from '../node';
import * as TokenType from '../token';
import { walk } from '../helpers';

const PARENT = 'Inheritance.PARENT';
const BLOCK = 'Inheritance.BLOCK';
const LEAVE_SCOPE = 'Inheritance.LEAVE_SCOPE';

function isInheritanceTagType(type) {
  return type === PARENT || type === BLOCK;
}

export class Inheritance extends Extension {
  constructor() {
    super();

    this._blocks = null;
  }

  transformToken(token) {
    const { type, name, location } = token;
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
              location
            };
          } else if (name[0] === '$') {
            if (name.length === 1) {
              throw new Error('Block name expected');
            }
            const blockName = name.slice(1);
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
        parserContext.pushParent({
          type: BLOCK,
          name,
          location
        });
        break;

      case TokenType.SECTION_CLOSE:
        const tagNode = parserContext.tailNode;
        if (tagNode === null) {
          if (isInheritanceTagType(tagNode.type)) {
            parserContext.throw('Unexpected tag close');
          }
        } else {
          if (tagNode.name !== name) {
            parserContext.throw(`Unexpected tag close, current tag: ${tagNode.name}`);
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
          parserContext.throw('Unexpected EOF: tags not closed: ' + 
            this.stack.map(f => f.name).join(', '));
        }
        break;
    }
    return handled;
  }

  handleNode(node, rendererContext) {
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

  _handleParent(node, rendererContext) {
    const { name } = node;

    if (this._blocks === null) {
      rendererContext.pushNodes([
        {
          type: LEAVE_SCOPE
        }
      ]);
      this._blocks = {};
    }

    //find all blocks defined in parent
    node.children.forEach(child => {
      if (child.type === BLOCK) {
        const blockName = child.name;
        if (!this._blocks.hasOwnProperty(blockName)) {
          this._blocks[blockName] = child;
        }
      }
    });

    rendererContext.pushNodes([
      {
        type: TokenType.PARTIAL,
        name,
        indent: node.indent
      }
    ]);
  }

  _handleBlock(node, rendererContext) {
    const { name, children } = node;
    if (this._blocks !== null && this._blocks.hasOwnProperty(name)) {
      rendererContext.pushNodes(this._blocks[name].children);
    } else {
      rendererContext.pushNodes(node.children);
    }
  }
}