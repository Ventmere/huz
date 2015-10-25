import { render } from '../src';
import { expect } from 'chai';

describe('Short Circuit', () => {

  it('partial', () => {
    expect(() => {
      render(`{{>p}}`, {}, {
        partials: {
          p: `{{>p}}`
        }
      });
    }).to.throw(/Possible partial short circuit/);
  });

  it('lambda', () => {
    expect(() => {
      render(`{{lambda}}`, {
        lambda: function () {
          return `{{lambda}}`;
        }
      });
    }).to.throw(/Possible lambda short circuit/);
  })

});