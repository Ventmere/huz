const registry = [];

export class Extension {
  //called by tokenizer
  transformToken(token) { return token; }

  //called by parser
  handleToken(token, parserContext) { }
  
  //called by renderer
  handleNode(node, renderContext) { }
}

export function instantiateAll() {
  return registry.map(ctor => {
    return new ctor();
  });
}

export function register(constructor) {
  return registry.push(constructor);
}