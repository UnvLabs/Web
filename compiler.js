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
  let scope = [[]];
  let output = "";
  for (let line of lines) {
    let statement = line.match(
      /^(\s*)(if|else|switch|try|catch|(?:async\s+)?function\*?|class|do|while|for)\s([^]+)/
    );
    if (statement) {
      let [, spaces, name, args] = statement;
      indents.unshift(spaces.replace(/\t/g, "    ").length);
      scope.unshift(name == "function" ? [] : [...scope[0]]);
      if (/for|catch/.test(name)) {
      }
      if (!/function|try|class/.test(name)) args = "(" + args + ")";
      output += spaces + name + " " + args + " {\n";
    } else {
      let spaces = line.match(/^\s*/)[0].length;
      for (let indent of [...indents]) {
        if (indent < spaces) break;
        output += `${" ".repeat(indent)}}\n`;
        indents.shift();
        scope.shift();
      }
      output +=
        line
          .replace(
            /^(\s*)import\s([^]+?)\sfrom/,
            (_, ws, names) => ws + "import {" + names + "} from"
          )
          .replace(
            /^(\s*)((?:global|nonlocal)\s*)?(\w[\w\s,=]*)(\s*)=(\s*)([^]+)/,
            (_, ws1, keyword, names, ws2, ws3, value) => {
              let code = ws1;
              let vars = [];

              names = names.replace(/\w+(\s*,\s*\w+)*/g, (group) => {
                vars = vars.concat(group.split(/\s*,\s*/));
                return /,/.test(group) ? "[" + group + "]" : group;
              });

              if (!/^n/.test(keyword)) {
                let toDeclare = vars.filter((v) => !scope[0].includes(v));
                if (toDeclare.length) code += "let " + toDeclare.join() + ";";
                scope[0] = scope[0].concat(toDeclare);
              }
              code += names;
              // handle global variables
              if (/^g/.test(keyword))
                code += "=" + names.replace(/\b(?=\w+)/g, "globalThis.");

              // unpack arrays
              code += ws2 + "=" + ws3 + "$assign(" + value + ")";

              return code;
            }
          ) + "\n";
    }
  }
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
    let scope = [[]];
    let output = "";
    for (let line of lines) {
      let statement = line.match(
        /^(\s*)(if|else|switch|try|catch|(?:async\s+)?function\*?|class|do|while|for)\s([^]+)/
      );
      if (statement) {
        let [, spaces, name, args] = statement;
        indents.unshift(spaces.replace(/\t/g, "    ").length);
        scope.unshift(name == "function" ? [] : [...scope[0]]);
        if (/for|catch/.test(name)) {
        }
        if (!/function|try|class/.test(name)) args = "(" + args + ")";
        output += spaces + name + " " + args + " {\n";
      } else {
        let spaces = line.match(/^\s*/)[0].length;
        for (let indent of [...indents]) {
          if (indent < spaces) break;
          output += `${" ".repeat(indent)}}\n`;
          indents.shift();
          scope.shift();
        }
        output +=
          line
            .replace(
              /^(\s*)import\s([^]+?)\sfrom/,
              (_, ws, names) => ws + "import {" + names + "} from"
            )
            .replace(
              /^(\s*)((?:global|nonlocal)\s*)?(\w[\w\s,=]*)(\s*)=(\s*)([^]+)/,
              (_, ws1, keyword, names, ws2, ws3, value) => {
                let code = ws1;
                let vars = [];

                names = names.replace(/\w+(\s*,\s*\w+)*/g, (group) => {
                  vars = vars.concat(group.split(/\s*,\s*/));
                  return /,/.test(group) ? "[" + group + "]" : group;
                });

                if (!/^n/.test(keyword)) {
                  let toDeclare = vars.filter((v) => !scope[0].includes(v));
                  if (toDeclare.length) code += "let " + toDeclare.join() + ";";
                  scope[0] = scope[0].concat(toDeclare);
                }
                code += names;
                // handle global variables
                if (/^g/.test(keyword))
                  code += "=" + names.replace(/\b(?=\w+)/g, "globalThis.");

                // unpack arrays
                code += ws2 + "=" + ws3 + "$assign(" + value + ")";

                return code;
              }
            ) + "\n";
      }
    }
    return output;
  }
}
