import { UnvConverter } from "./converter"
import { UnvLexer } from "./lexer"
import { UnvParser } from "./parser"

// A new parser instance with CST output enabled.
const parserInstance = new UnvParser()
// Our visitor has no state, so a single instance is sufficient.
const toAstVisitorInstance = new UnvConverter()

function toAst(inputText: string) {
    // Lex
    const lexResult = UnvLexer.tokenize(inputText)
    parserInstance.input = lexResult.tokens

    // Automatic CST created when parsing
    const cst = parserInstance.Program()
    if (parserInstance.errors.length > 0) {
        throw Error(
            "Sad sad panda, parsing errors detected!\n" +
                parserInstance.errors[0].message
        )
    }

    // Visit
    const ast = toAstVisitorInstance.visit(cst)
    return ast
}

console.log(
    toAst(`
a, b = c = d, e = f = 1, 2
`)
)
