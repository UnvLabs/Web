function compile(input) {
  input = input.replace(
    /("(?:\\["\\]|[^"\\])*"|'(?:\\['\\]|[^'\\])*')|###[^]*?###|#.*/gm,
    (_, string) => (string ? string.replace(/\n/g, '\\n') : '')
  );
  let lines = input.split('\n');
  let comment = false;
  let indents = [];
  let output = '';
  for (let line of lines) {
    let statement = line.match(
      /^(\s*)(if|else|switch|try|catch|(?:async\s+)?function\*?|class|do|while|for)\s+(.+)/
    );
    if (statement) {
      let [, spaces, name, args] = statement;
      indents.unshift(spaces.length);
      output += `${spaces}${name} ${/function|try|class/.test(name) ? args : `(${args})`} {${/function/.test(name) ? '$locals = {}' : ''}\n`;
    } else {
      let spaces = line.match(/^\s*/)[0].length;
      for (let indent of [...indents]) {
        if (indent < spaces) break;
        output += `${' '.repeat(indent)}}\n`;
        indents.shift();
      }
      let variable = line.match(/^(\s*)([A-Za-z_]\w*)(\s*=.*)/)
      if(variable)
        output += variable[1] + '$locals.' + variable[2] + variable[3] + '\n';
      else
        output += line + '\n';
    }
  }
  return output;
}
