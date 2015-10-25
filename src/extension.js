export class Extension {
  //called by parser
  visit(node) { return node; }
  
  //called by renderer
  handle(node, renderContext) { }
}