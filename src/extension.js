const registry = [];

export class Extension {
  //called by tokenizer
  transformToken(token) { return token; }

  //called by parser
  handleToken(token, parserContext) { }
  visit(root) { return root; }
  
  //called by renderer
  handleNode(node, renderContext) { }
  transformNodeResult(node, result, nodeResult) { return nodeResult; }
  transformResult(result) { return result; }
}

export function instantiateAll(opts) {
  return registry.map(ctor => {
    return new ctor(opts);
  });
}

export function register(constructor) {
  return registry.push(constructor);
}