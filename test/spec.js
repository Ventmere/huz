import { render, parse } from '../src';
import { expect } from 'chai';

export function defineTests(name, test, mapFunc) {
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

function getTest(name) {
  return require(`./spec/specs/${name}.json`);
}

describe('Specification', () => {

  ['comments', 'delimiters', 'interpolation', 'inverted', 'partials', 'sections']
    .forEach(name => defineTests(name, getTest(name)));

  if (global.g && global.g.calls) {
    delete global.g.calls; //Interpolation - Multiple Calls: clear env
  }

  defineTests('~lambdas', getTest('~lambdas'), test => {
    const def = test.__def || test.data.lambda.js;
    test.__def = def;
    
    test.data.lambda = (new Function([], `return (${def});`))();
    return test;
  });
});