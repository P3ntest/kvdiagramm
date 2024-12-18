// parse logical expressions like "A&B|C" "!(A)&(B|C)" "A&(B|C)" "A\B"
export function parse(input) {
  // operators: & | ! \ ( )
  // operands: A-Z

  // parse input into tokens
  const tokens = [];
  let i = 0;
  while (i < input.length) {
    const char = input[i];
    if (
      char === "&" ||
      char === "|" ||
      char === "!" ||
      char === "(" ||
      char === ")" ||
      char === "\\"
    ) {
      tokens.push(char);
      i++;
    } else if (char === " ") {
      i++;
    } else {
      tokens.push(char);
      i++;
    }
  }

  // parse tokens into AST

  // helper functions
  function peek() {
    return tokens[0];
  }

  function consume() {
    return tokens.shift();
  }

  function parsePrimaryExpr() {
    const token = peek();
    if (token === "(") {
      consume();
      const expr = parseExpr();
      if (peek() !== ")") {
        throw new Error("Expected )");
      }
      consume();
      return expr;
    } else if (token === "!") {
      consume();
      return {
        type: "NotExpr",
        expr: parsePrimaryExpr(),
      };
    } else {
      return parseLiteral();
    }
  }

  function parseLiteral() {
    const token = peek();
    if (token.match(/[A-Z]/)) {
      consume();
      return {
        type: "LiteralExpr",
        value: token,
      };
    } else {
      throw new Error("Expected literal");
    }
  }

  function parseExpr() {
    let expr = parsePrimaryExpr();
    while (peek() === "&" || peek() === "|" || peek() === "\\") {
      const operator = consume();
      const right = parsePrimaryExpr();
      expr = {
        type: "BinaryExpr",
        operator,
        left: expr,
        right,
      };
    }
    return expr;
  }

  return parseExpr();
}

export function findAllOperands(input) {
  // return the list of all operands in the input
  const operands = [];
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char.match(/[A-Z]/)) {
      operands.push(char);
    }
  }
  return Array.from(new Set(operands));
}

export function evaluate(input, overrideOperands) {
  const tree = parse(input);
  const operands = overrideOperands ?? findAllOperands(input);
  console.log(operands);

  const universe = [];
  for (let i = 0; i < 2 ** operands.length; i++) {
    const assignment = {};
    for (let j = 0; j < operands.length; j++) {
      assignment[operands[j]] = (i >> j) & 1;
    }
    universe.push({
      ...assignment,
      id: i,
    });
  }

  const result = evaluateSubTree(tree, universe);

  return {
    universe,
    result,
    operands,
  };
}

function evaluateSubTree(subtree, universe) {
  if (subtree.type === "LiteralExpr") {
    return universe.filter((assignment) => assignment[subtree.value] === 1);
  } else if (subtree.type === "NotExpr") {
    const subUniverse = evaluateSubTree(subtree.expr, universe);
    return universe.filter((assignment) => !subUniverse.includes(assignment));
  } else if (subtree.type === "BinaryExpr") {
    const left = evaluateSubTree(subtree.left, universe);
    const right = evaluateSubTree(subtree.right, universe);

    if (subtree.operator === "&") {
      return left.filter((assignment) => right.includes(assignment));
    } else if (subtree.operator === "|") {
      return universe.filter(
        (assignment) => left.includes(assignment) || right.includes(assignment)
      );
    } else if (subtree.operator === "\\") {
      return universe.filter(
        (assignment) => left.includes(assignment) && !right.includes(assignment)
      );
    }
  }
}
