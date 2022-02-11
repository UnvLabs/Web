import {
    createToken,
    Lexer,
    CustomPatternMatcherFunc,
    createTokenInstance,
} from "chevrotain"

const MultiLineComment = createToken({
    name: "MultiLineComment",
    pattern: /###[^]*?###/,
    group: Lexer.SKIPPED,
})
const SingleLineComment = createToken({
    name: "SingleLineComment",
    pattern: /#.*/,
    group: Lexer.SKIPPED,
})

const JSMultiLineComment = createToken({
    name: "MultiLineComment",
    pattern: /\/\*[^]*?\*\//,
    group: Lexer.SKIPPED,
})
const JSSingleLineComment = createToken({
    name: "SingleLineComment",
    pattern: /\/\/.*/,
    group: Lexer.SKIPPED,
})

const OpenBrace = createToken({ name: "LCurly", pattern: /{/ })
const CloseBrace = createToken({
    name: "RCurly",
    pattern: /}/,
})

const OpenBracket = createToken({
    name: "LSquare",
    pattern: /\[/,
})
const CloseBracket = createToken({
    name: "RSquare",
    pattern: /]/,
})

const OpenParen = createToken({
    name: "LParen",
    pattern: /\(/,
})
const CloseParen = createToken({
    name: "RParen",
    pattern: /\)/,
})

const DemicalLiteral = createToken({
    name: "DemicalLiteral",
    pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/,
})

const ComplexNumber = createToken({
    name: "ComplexNumber",
    pattern: /-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?[ijJ]/,
})

// keywords
const If = createToken({ name: "If", pattern: /if/ })
const Else = createToken({ name: "Else", pattern: /else/ })
const For = createToken({ name: "For", pattern: /for/ })
const In = createToken({ name: "In", pattern: /in/ })
const While = createToken({ name: "While", pattern: /while/ })
const Break = createToken({ name: "Break", pattern: /break/ })
const Continue = createToken({ name: "Continue", pattern: /continue/ })
const Return = createToken({ name: "Return", pattern: /return/ })
const Import = createToken({
    name: "Import",
    pattern: /import/,
})
const From = createToken({
    name: "From",
    pattern: /from/,
})

const True = createToken({ name: "True", pattern: /true/ })
const False = createToken({ name: "False", pattern: /false/ })

const Identifier = createToken({
    name: "Identifier",
    pattern: /[a-zA-Z_][a-zA-Z0-9_]*/,
})

const StringLiteral = createToken({
    name: "StringLiteral",
    pattern: /"(?:\\[\\"]|[^"])*"|'(?:\\[\\']|[^'])*'/,
})

const indentStack = [0]
const matchIndent =
    (isIndent = true): CustomPatternMatcherFunc =>
    (text, offset, tokens, groups) => {
        if (
            tokens.filter((token) => token.tokenType === OpenBrace).length ===
                tokens.filter((token) => token.tokenType === CloseBrace)
                    .length &&
            tokens.filter((token) => token.tokenType === OpenBracket).length ===
                tokens.filter((token) => token.tokenType === CloseBracket)
                    .length &&
            tokens.filter((token) => token.tokenType === OpenParen).length ===
                tokens.filter((token) => token.tokenType === CloseParen).length
        ) {
            let match = text
                .slice(offset)
                .match(/^\n( *)/) as RegExpExecArray | null
            if (match) {
                let indent = match[1].length
                if (isIndent && indent > indentStack[0]) {
                    indentStack.unshift(indent)
                    return match
                } else if (!isIndent && indent < indentStack[0]) {
                    while (indent < indentStack[0]) {
                        tokens.push(
                            createTokenInstance(
                                Unindent,
                                " ".repeat(
                                    indentStack[0] - (indentStack[1] || 0)
                                ),
                                NaN,
                                NaN,
                                NaN,
                                NaN,
                                NaN,
                                NaN
                            )
                        )
                        indentStack.shift()
                    }

                    return [""]
                }
            }
        }

        return null
    }

const Indent = createToken({
    name: "Indent",
    pattern: matchIndent(),
    line_breaks: true,
})

const Unindent = createToken({
    name: "Unindent",
    pattern: matchIndent(false),
    line_breaks: true,
})

const Comma = createToken({
    name: "Comma",
    pattern: /,/,
})
const Assign = createToken({
    name: "Assign",
    pattern: /=/,
})

const Newline = createToken({
    name: "Newline",
    pattern: /\n/,
})

const Whitespaces = createToken({
    name: "Whitespaces",
    pattern: /\s+/,
    group: Lexer.SKIPPED,
})

const Unknown = createToken({ name: "Unknown", pattern: /./ })

export const allTokens = [
    JSMultiLineComment,
    JSSingleLineComment,
    MultiLineComment,
    SingleLineComment,
    OpenBrace,
    CloseBrace,
    OpenBracket,
    CloseBracket,
    OpenParen,
    CloseParen,
    ComplexNumber,
    DemicalLiteral,
    If,
    Else,
    For,
    In,
    While,
    Break,
    Continue,
    Return,
    Import,
    From,
    True,
    False,
    Identifier,
    StringLiteral,
    Indent,
    Unindent,
    Comma,
    Assign,
    Newline,
    Whitespaces,
    Unknown,
]

export const UnvLexer = new Lexer(allTokens)

export const tokens = {
    JSMultiLineComment,
    JSSingleLineComment,
    MultiLineComment,
    SingleLineComment,
    OpenBrace,
    CloseBrace,
    OpenBracket,
    CloseBracket,
    OpenParen,
    CloseParen,
    ComplexNumber,
    DemicalLiteral,
    If,
    Else,
    For,
    In,
    While,
    Break,
    Continue,
    Return,
    Import,
    From,
    True,
    False,
    Identifier,
    StringLiteral,
    Indent,
    Unindent,
    Comma,
    Assign,
    Newline,
    Whitespaces,
    Unknown,
}
