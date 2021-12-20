function compile(input) {
  input = input.replace(/###[^]*?###|#.*/gm, '')
  let lines = input.split('\n')
  let comment = false
  let indents = []
  let indent = 0
  let output = ''
  for(let line of lines) {
    let statement = line.match(/^(\s*)(if|else|switch|try|catch|(?:async\s+)?function\*?|class|do|while|for)\s+(.+)/)
    if(statement) {
      let [, spaces, name, args] = statement
      indents.unshift(spaces.length)
      indent = spaces.length
      output += `${spaces}${name} ${/function/.test(name) ? `${args}` : `(${args})`} {\n`
    } else {
      let spaces = line.match(/^\s*/)[0].length
      while(indent > spaces) {
        let dedent = indents.shift()
        indent -= dedent
        output += `${' '.repeat(dedent)}}\n`
      }
      indent = spaces
      output += line + '\n'
    }
  }
  return output
}
