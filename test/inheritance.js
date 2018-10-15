import { render } from "../src";
import { defineTests } from "./spec";
import { expect } from "chai";

describe("Extension: Inheritance", () => {
  defineTests("inheritance", require("./inheritance.json"));

  it("Same name blocks", function() {
    const html = render(
      "{{<t}}{{$b}}1{{/b}}{{/t}}{{<t}}{{$b}}2{{/b}}{{/t}}",
      {},
      {
        partials: {
          t: `{{$b}}default{{/b}}`
        },
        filename: "123"
      }
    );
    expect(html).to.equal("12");
  });

  it("recursive block", function() {
    expect(function() {
      try {
        render(
          "{{<t}}{{$b}}{{$c}}{{$b}}{{/b}}{{/c}}{{/b}}{{/t}}{{<t}}{{$b}}2{{/b}}{{/t}}",
          {},
          {
            partials: {
              t: `{{$b}}default{{/b}}`
            },
            filename: "123"
          }
        );
      } catch (e) {
        expect(e.filename).to.equal("123");
        throw e;
      }
    }).to.throw("Recursive block: 'b'");
  });
});
