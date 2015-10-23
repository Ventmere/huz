import { Parser } from './parser';
import { Renderer } from './renderer';

export { Tokenizer } from './tokenizer';
export { Parser, Renderer };

export function parse(src, opts) {
  const parser = new Parser(opts);
  const ast = parser.parse(src);
  if (ast === null) {
    throw parser.error;
  }
  return ast;
}

export function compile(src, opts) {
  return new Renderer(parse(src), opts);
}

export function render(src, context, opts) {
  const r = compile(src, opts);
  const out = r.render(context);
  if (r.error) {
    throw r.error;
  }
  return out;
}