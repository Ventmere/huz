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

  it('context stack', () => {
    const context = {
      "list": [
        {
          "handle": "1",
          "sublist": ['1.1'],
          "active": true
        },
        {
          "handle": "2",
          "sublist": ['2.1'],
        },
        {
          "handle": "3",
          "sublist": []
        }
      ]
    };

    const template = `
    {{#list}}
      {{#sublist.length}}
      [{{#active}}active{{/active}}]
      {{/sublist.length}}
    {{/list}}
    `;

    const r = render(template, context).replace(/\s/g, '');
    expect(r).equals('[active][]');
  });
});