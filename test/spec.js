import { render, parse } from '../src';
import { expect } from 'chai';

describe('Specification', () => {

  function defineTests(name, mapFunc) {
    const test = require(`./spec/specs/${name}.json`);
    if (mapFunc) {
      test.tests = test.tests.map(mapFunc);
    }

    describe(name, () => {
      test.tests.forEach(t => {
        it(t.name, () => {
          try {
            const result = render(t.template, t.data, {
              partials: t.partials
            });
            expect(result).equals(t.expected);
          } catch (e) {
            e.message = t.name + ': ' + e.message + '\n' + t.desc;
            throw e;
          }
        });
      });
    })
  }

  ['comments', 'delimiters', 'interpolation', 'inverted', 'partials', 'sections']
    .forEach(name => defineTests(name));

  //reset env for Interpolation - Multiple Calls when using test:watch
  expect.count = expect.count ? expect.count + 1 : 1;
  if (expect.count !== 1) {
    delete g.calls;
  }

  defineTests('~lambdas', test => {
    const def = test.__def || test.data.lambda.js;
    test.__def = def;
    
    test.data.lambda = (new Function([], `return (${def});`))();
    return test;
  });
});