import { render } from '../src';
import { defineTests } from './spec';

describe('Extension: Inheritance', () => {

  //defineTests('inheritance', require('./inheritance.json'));

  it.skip('test', () => {
    const out = render('{{<include}}{{/include}} ', {}, {
      partials: {
      include: "{{$foo}}default content{{/foo}}"
      },
    });

    for (let i = 0; i < out.length; i++) {
      console.log(i, out[i], out.charCodeAt(i));
    }
  })

});