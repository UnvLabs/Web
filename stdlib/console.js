let _std = {
  print: console.log
  input: prompt
}

export function print(...args) {
  _std.print(...args)
}

export function input(...args) {
  _std.input(...args)
}
