export function walk(root, modifier) {
  let stack = root.children.slice(0).reverse();
  while (stack.length) {
    const node = stack.pop();
    modifier(node);
    if (node.children !== undefined) {
      stack = stack.concat(node.children.slice(0).reverse());
    }
  }
}

export function visit(root, visitor) {
  let stack = [root];
  while (stack.length) {
    const parent = stack.pop();
    for (let i = 0; i < parent.children.length; i++) {
      const child = parent.children[i];
      const modified = visitor.visit(child) || child;
      if (modified !== child) {
        parent.children[i] = modified;
      }
      if (child.children && child.children.length) {
        stack.push(child);
      }
    }
  }
}