import { compile } from '../src';
import { Inheritance } from '../src/extensions/inheritance';

const code =
`{{! mypage.mustache }}
{{<base}}
  {{$header}}
    {{<header}}
      {{$title}}My page title{{/title}}
    {{/header}}
  {{/header}}

  {{$content}}
    <h1>Hello world</h1>
  {{/content}}
{{/base}}`;

describe('Extension: Inheritance', () => {

  it.only('test', () => {
    const r = compile(code);
    console.log(r.render({}));
  });

});