import { render } from '../src';
import { defineTests } from './spec';
import { expect } from 'chai';

describe('Extension: Inheritance', () => {

  defineTests('inheritance', require('./inheritance.json'));

  it('Same name blocks', function() {
    const html = render('{{<t}}{{$b}}1{{/b}}{{/t}}{{<t}}{{$b}}2{{/b}}{{/t}}', {}, {
      partials: {
        't': `{{$b}}default{{/b}}`
      },
      filename: '123'
    });
    expect(html).to.equal('12');
  });
});