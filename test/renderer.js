import { render } from '../src';
import { expect } from 'chai';

describe.only('renderer', () => {

  it('partial short circuit', () => {
    expect(() => {
      render(`{{>p}}`, {}, {
        partials: {
          p: `{{>p}}`
        }
      });
    }).to.throw(/Possible partial short circuit/);
  });

  it('lambda short circuit', () => {
    expect(() => {
      render(`{{lambda}}`, {
        lambda: function () {
          return `{{lambda}}`;
        }
      });
    }).to.throw(/Possible lambda short circuit/);
  })

});