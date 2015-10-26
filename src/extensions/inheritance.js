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

    this._scopes = [];
  }

  transformToken(token) {
    const { type, name, location } = token;
    switch (type) {
      case TokenType.VARIABLE:
        if (name) {
          if (name[0] === '<') {
            if (name.length === 1) {
              throw new Error('Expect a parent partial name.');
            }
            token = {
              type: PARENT,
              name: name.slice(1),
              location
            };
          } else if (name[0] === '$') {
            if (name.length === 1) {
              throw new Error('Expect a block name.');
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
            parserContext.throw('Unexpected tag close.');
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
            handled = true;
          }
        }
        break;

      case TokenType.EOF:
        if (this.top > 0) {
          parserContext.throw('Unexpected EOF: tags not closed: ' + 
            this.stack.map(f => f.name)).join(', ');
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
        //assert node.scope === this._scopes[-1]
        this._scopes.pop();
        break;
    }
  }

  _handleParent(node, rendererContext) {
    const { name } = node;
    
    const partialNodes = rendererContext.getParsedPartial(name);
    if (partialNodes === null) {
      return;
    }

    //find all blocks defined in parent
    const blocks = {};
    node.children.forEach(child => {
      if (child.type === BLOCK) {
        const blockName = child.name;
        if (blocks.hasOwnProperty(blockName)) {
          const existingBlock = blocks[blockName];
          rendererContext.throw(`Duplicated block '${blockName}, last seen: ${existingBlock.location.filename}:${existingBlock.location.line+1}'`);
        }
        blocks[blockName] = child;
      }
    });

    //scope
    const scope = {
      blocks
    };
    this._scopes.push(scope);

    rendererContext.pushNodes([
      //push a special node to pop current scope
      {
        type: LEAVE_SCOPE,
        scope
      }, 
      ...partialNodes
    ]);
  }

  _handleBlock(node, rendererContext) {
    const { name, children } = node;
    const currentScope = this._scopes.length > 0 ? this._scopes[this._scopes.length - 1] : null;
    if (currentScope && currentScope.blocks.hasOwnProperty(name)) {
      rendererContext.pushNodes(currentScope.blocks[name].children);
    } else {
      rendererContext.pushNodes(node.children);
    }
  }
}