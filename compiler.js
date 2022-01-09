let STRING = /"(?:\\["\\]|[^"\\])*"/;
let TOKENMAP = {
  inline_comment: /#.*/,
  block_comment: /###[^]*?###/,
  whitespace: /\s+/,
  single_string: STRING.source.replace(/"/g, "'"),
  double_string: STRING,
  name: /[a-zA-Z_]\w*/,
  number: /^\d*\.?\d+/,
  char: /./,
};

let RE =
  /(#.*)|(###[^]*?###)|(\s+)|('(?:\\['\\]|[^'\\])*')|("(?:\\["\\]|[^"\\])*")|([a-zA-Z_]\w*)|(^\d*\.?\d+)|(.)/g;

/* for development
RE = Object.entries(TOKENMAP)
  .map(([k, v]) => `(?<${k}>${v.source || v})`)
  .join("|");
*/
/* for production
RE = Object.values(TOKENMAP)
  .map((v) => `(${v.source || v})`)
  .join("|");
*/

function compile(input) {
  let output = "";
  let block;
  let indents = [];
  let isBlock = false;
  let closeWith = "";
  let sqb = 0;
  let parens = 0;
  let braces = 0;
  let scope = [[]];

  while ((block = RE.exec(input))) {
    let token = block[0];

    // comments
    if (block[1] || block[2]) token = " ";
    // multiline strings
    else if (block[4] || block[5]) token = token.replace(/\r\n|\r|\n/g, "\\n");
    else if (block[6]) {
      if (/if|else|switch|try|catch|function|class|do|while|for/.test(token)) {
        if (!/function|try|class/.test(token)) {
          // EG:- `if condition` => `if(condition)`
          closeWith = ")";
          token += "(";
        }

        let ws = output.match(/[\n\r]+(\s*)$/) || [""];
        indents.unshift(ws[0].length);
        scope.unshift([].concat(...scope));
        isBlock = true;
      }

      // EG:- `import a, b from "path"` => `import { a, b } from "path"`
      else if (token == "import") token += "{";
      else if (token == "from") token = "}" + token;

      if (token == "in") {
        output = output.replace(/for\(\s*(\w[\w\s,]*)$/, (_, names) => {
          let vars = names.split(/\s*,\s*/);
          if (vars.length == 1) {
            if (scope[0].includes(vars.trim())) return _;
            else {
              scope[0].push(vars.trim());
              return "for(let " + vars;
            }
          } else {
            let code = "for([" + names + "]";
            let toDeclare = vars.filter((v) => !scope[0].includes(v));
            if (toDeclare.length) code = "let " + toDeclare.join() + ";" + code;
            scope[0] = scope[0].concat(toDeclare);
            return code;
          }
        });

        // for...in to for...of
        token = "of $iter(";
        closeWith = "))";
      }
    } else if (block[8]) {
      if (token == "(") parens += 1;
      else if (token == ")") parens -= 1;
      else if (token == "[") sqb += 1;
      else if (token == "]") sqb -= 1;
      else if (token == "{") braces += 1;
      else if (token == "}") braces -= 1;
      else if (token == "=") {
        // EG:- `a, b = c = [1, 2]` => `let a,b; [a, b] = c = [1, 2];`
        output = output.replace(
          /([ \t]*)((?:global|nonlocal)\s)?(\w[\w\s,=]*)$/,
          (_, ws, modifier, names) => {
            let code = "";

            if (modifier != "nonlocal") {
              let vars = names.split(/\s*[=,]\s*/);
              let toDeclare = vars.filter((v) => !scope[0].includes(v));
              if (toDeclare.length) code += "let " + toDeclare.join() + ";";
              scope[0] = scope[0].concat(toDeclare);
            }

            code += names
              .split("=")
              .map((v) => (~v.indexOf(",") ? "[" + v + "]" : v))
              .join("=");

            // global variables
            if (modifier == "global")
              code +=
                "=" +
                names
                  .split("=")
                  .map((v) =>
                    ~v.indexOf(",")
                      ? "[window." + v.split(",").join(",window.") + "]"
                      : "window." + v
                  )
                  .join("=");

            return code;
          }
        );

        // EG:- `a = 1, 2` => `a = [1, 2]`
        token += "$assign(";
        closeWith = ");";
      }
    } else if (/\n/.test(block[3]) && !sqb && !parens && !braces) {
      // EG:- `if (condition` => `if (condition {`
      if (isBlock) {
        token = "{" + token;
        isBlock = false;
      }

      // EG:- `if (condition {` => `if (condition) {`
      if (closeWith) {
        token = closeWith + token;
        closeWith = "";
      }

      // EG:- `if (condition) { block` => `if (condition) { block }`
      let spaces = token.match(/[\n\r]+(\s*)$/)[1].length;
      for (let indent of [...indents]) {
        if (indent < spaces) break;
        token = "}" + token;
        indents.shift();
        scope.shift();
      }
    }

    // append token to output
    output += token;
  }
  return output;
}
