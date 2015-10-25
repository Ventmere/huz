// https://github.com/mustache/spec/pull/75

import { Extension } from '../extension';
import * as NodeType from '../node';

export class TemplateInheritance extends Extension {
  visit(node) {
    if (node.type === NodeType.TEXT) {
      node.text = '123';
    }
    return node;
  }
}