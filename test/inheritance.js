import { render, parse } from "../src";
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

  it("unexpected tag close", function() {
    expect(function() {
      try {
        render(
          "{{<t}}{{/die}}",
          {},
          {
            filename: "123"
          }
        );
      } catch (e) {
        expect(e.filename).to.equal("123");
        throw e;
      }
    }).to.throw("Unexpected tag close 'die', current tag: 't'");
  });

  it("parse block content", function() {
    const node = parse(`<div>
      {{$block1}}one{{/block1}}
      {{$block2}}two{{/block2}}
    </div>`);

    const blocks = node.children
      .filter(c => c.type === "Inheritance.BLOCK")
      .map(c => {
        return {
          name: c.name,
          content: c.content
        };
      });

    expect(blocks).to.deep.equal([
      { content: "one", name: "block1" },
      { content: "two", name: "block2" }
    ]);
  });
});
