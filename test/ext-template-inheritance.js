import { compile } from '../src';
import { TemplateInheritance } from '../src/extensions/template-inheritance';

describe.only('Extension: TemplateInheritance', () => {

  it('test', () => {
    const r = compile(`0`, {
      extensions: [ TemplateInheritance ]
    });
    console.log(r.render({}));
  });

});