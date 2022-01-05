let declare_var = (ws, keyword, names) => {
  let code = "";
  let vars = names.split("=");

  // declare variables
  if (vars.length > 1)
    code += ws + keyword + " " + vars.slice(1).join(",") + "\n";

  // assign values
  code +=
    ws +
    keyword +
    " " +
    vars.map((v) => (~v.indexOf(",") ? "[" + v + "]" : v)).join("=");
  return code;
};

function compile(input) {
  input =
    input.replace(
      /("(?:\\["\\]|[^"\\])*"|'(?:\\['\\]|[^'\\])*')|###[^]*?###|#.*/gm,
      (_, string) => (string ? string.replace(/\n/g, "\\n") : "")
    ) + "\n\n";
  let lines = [];
  let line = "";
  let sqb = 0,
    braces = 0,
    parens = 0;
  for (let char of input) {
    if (char == "[") sqb++;
    else if (char == "]") sqb--;
    else if (char == "{") braces++;
    else if (char == "}") braces--;
    else if (char == "(") parens++;
    else if (char == ")") parens--;
    if (/[\n\r]/.test(char) && !sqb && !braces && !parens) {
      lines.push(line);
      line = "";
    } else line += char;
  }
  let indents = [];
  let output = "";
  for (let line of lines) {
    let statement = line.match(
      /^(\s*)(if|else|switch|try|catch|(?:async\s+)?function\*?|class|do|while|for)\s(.+)/
    );
    if (statement) {
      let [, spaces, name, args] = statement;
      indents.unshift(spaces.length);
      if (!/function|try|class/.test(name)) args = "(" + args + ")";

      output += spaces + name + " " + args + " {\n";
    } else {
      let spaces = line.match(/^\s*/)[0].length;
      for (let indent of [...indents]) {
        if (indent < spaces) break;
        output += `${" ".repeat(indent)}}\n`;
        indents.shift();
      }
      output +=
        line
          .replace(
            /^(\s*)import\s([^]+?)\sfrom/,
            (_, ws, names) => ws + "import {" + names + "} from"
          )
          .replace(
            /^(\s*)((?:local\s|global\s)?)([\w\s,=]+)=(.*)/,
            (_, ws, keyword, start, end) => {
              // choose the right keyword(let or var)
              let code = declare_var(
                ws,
                keyword[0] == "l" ? "let" : "var",
                start
              );

              // handle global variables
              if (keyword[0] == "g")
                code +=
                  "=" +
                  vars
                    .map((v) =>
                      ~v.indexOf(",")
                        ? "[window." + v.split(",").join(",window.") + "]"
                        : "window." + v
                    )
                    .join("=");

              // unpack arrays
              code += "=$assign(" + end + ")";

              return code;
            }
          ) + "\n";
    }
  }
  return output.trim();
}
