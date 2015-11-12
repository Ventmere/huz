import { expect } from 'chai';
import { parse, render } from '../src';

describe('Renderer', () => {
  it('parsed input', () => {
    const t1 = `T{{>p1}}1`;
    const t1t = parse(t1);
    const p1 = `<{{v}}>`;
    const p1t = parse(p1);
    const ctx = {
      'v': 'value'
    };
    const r = render(t1, ctx, {
      partials: { p1 }
    });
    const rp = render(t1t, ctx, {
      parsed: true,
      partials: { p1: p1t }
    })
    expect(r).equals(rp);
  });
});