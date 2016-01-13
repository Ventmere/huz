import { Parser } from './parser';
import { Renderer } from './renderer';
import * as TokenType from './token';
import * as NodeType from './node';
import * as Helpers from './helpers';
import { register } from './extension';

export { Tokenizer } from './tokenizer';
export { Parser, Renderer, TokenType, NodeType };

import { Inheritance } from './extensions/inheritance';

register(Inheritance);

export function parse(src, opts) {
  const parser = new Parser(opts);
  return parser.parse(src);
}

export function compile(src, opts) {
  return new Renderer(src, opts);
}

export function render(src, context, opts) {
  const r = compile(src, opts);
  return r.render(context);
}

export { register, Helpers };