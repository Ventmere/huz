// https://github.com/mustache/spec/pull/75

import { Extension, register } from '../extension';
import * as NodeType from '../node';
import * as TokenType from '../token';

const PARENT = 'Inheritance.PARENT';
const BLOCK = 'Inheritance.BLOCK';

function isInheritanceTagType(type) {
  return type === PARENT || type === BLOCK;
}

export class Inheritance extends Extension {
  constructor() {
    super();
  }

  handleToken(token, parserContext) {
    let handled = false;
    const { name, location, type } = token;
    switch (type) {
      case TokenType.VARIABLE:
        if (name) {
          if (name[0] === '<') {
            if (name.length === 1) {
              parserContext.throw('Expect a parent partial name.');
            }
            const parentName = name.slice(1);
            parserContext.pushParent({
              type: PARENT,
              name: parentName,
              location
            });
            handled = true;
          } else if (name[0] === '$') {
            if (name.length === 1) {
              parserContext.throw('Expect a block name.');
            }
            const blockName = name.slice(1);
            parserContext.pushParent({
              type: BLOCK,
              name: blockName,
              location
            });
            handled = true;
          }
        }
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
    console.log(node.type);
  }
}

register(Inheritance);