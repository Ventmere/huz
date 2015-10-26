import * as TokenType from './token';

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

export function trimStandaloneToken(tokens) {
  const count = tokens.length;

  if (count === 0) {
    return tokens;
  }

  let open = null;
  let inline = 0;
  let standalone = true;
  let indentTokens = [];
  for (let i = 0; standalone && i < count; i++) {
    const token = tokens[i];
    let idx;
    switch (token.type) {
      case TokenType.VARIABLE:
      case TokenType.UNESCAPED_VARIABLE:
        standalone = false;
        break;
      case TokenType.TEXT:
        if (isStringWhitespace(token.text)) {
          if (inline === 0) {
            indentTokens.push(token);
          }
        } else {
          standalone = false;
        }
        break;
      case TokenType.DELIMITER_CHANGE:
      case TokenType.COMMENT:
        if (open !== null) {
          open.push(token);
        } else {
          inline ++;
        }
        break;
      case TokenType.SECTION_CLOSE:
        if (open) {
          if (open[0].name === token.name) {
            open = null;
          } else {
            standalone = false;
          }
        } else {
          inline ++;
        }
        break;
      default: //section-like tags
        if (open === null) {
          open = [token];
          inline ++;
        } else {
          standalone = false;
        }
        break;
    }

    if (inline > 1) {
      standalone = false;
    }
  }

  if (open && open.length > 1) {
    standalone = false;
  }
  
  if (standalone) {
    //all whitespace
    if (indentTokens.length === count) {
      return tokens;
    }

    let tailWSNodeCount = 0;
    for (let i = count - 1; i >= 0; i--) {
      const token = tokens[i];
      if (token.type == TokenType.TEXT && isStringWhitespace(token.text)) {
        tailWSNodeCount ++;
      } else {
        break;
      }
    }

    if (indentTokens.length > 0 || tailWSNodeCount > 0) {
      //trim
      tokens = tokens.slice(indentTokens.length, count - tailWSNodeCount);
      if (indentTokens.length) {
        let indent = '';
        indentTokens.forEach(t => { indent += t.text });
        tokens[0].indent = indent;
      }
    }
  }
  return tokens;
}

function isStringWhitespace(str) {
  return /^\s*$/.test(str);
}