import { CstParser } from "chevrotain"
import { allTokens, tokens } from "./lexer"

export class UnvParser extends CstParser {
    constructor() {
        super(allTokens)
        this.performSelfAnalysis()
    }

    public Program = this.RULE("Program", () => {
        this.MANY(() => {
            this.OR([
                { ALT: () => this.CONSUME(tokens.Newline) },
                { ALT: () => this.SUBRULE(this.Statement) },
            ])
        })
    })

    private Statement = this.RULE("Statement", () =>
        this.OR([
            {
                GATE: () => {
                    let index = 0
                    while (true) {
                        let token = this.LA(++index)
                        if (token.tokenType === tokens.Assign) return index > 1
                        else if (
                            !(
                                token.tokenType === tokens.Identifier ||
                                token.tokenType === tokens.Comma
                            )
                        ) {
                            return false
                        }
                    }
                },
                ALT: () => this.SUBRULE(this.AssignmentStatement),
            },
            { ALT: () => this.SUBRULE(this.ImportStatement) },
            { ALT: () => this.SUBRULE(this.BlockStatement) },
            { ALT: () => this.SUBRULE(this.IfStatement) },
            {
                ALT: () => this.SUBRULE(this.ExpressionStatement),
            },
        ])
    )

    public ExpressionStatement = this.RULE("ExpressionStatement", () =>
        this.SUBRULE(this.ExpressionSequence)
    )

    public BlockStatement = this.RULE("BlockStatement", () => {
        this.CONSUME(tokens.Indent)
        this.MANY(() =>
            this.OR([
                { ALT: () => this.CONSUME(tokens.Newline) },
                { ALT: () => this.SUBRULE(this.Statement) },
            ])
        )
        this.CONSUME(tokens.Unindent)
    })

    public IfStatement = this.RULE("IfStatement", () => {
        this.CONSUME(tokens.If)
        this.MANY(() => this.SUBRULE(this.Expression))
        this.SUBRULE(this.BlockStatement)
    })

    public ImportStatement = this.RULE("ImportStatement", () => {
        this.CONSUME(tokens.Import)
        this.OPTION(() => {
            this.AT_LEAST_ONE_SEP({
                SEP: tokens.Comma,
                DEF: () => this.CONSUME(tokens.Identifier),
            })

            this.CONSUME(tokens.From)
        })
        this.CONSUME(tokens.StringLiteral)
    })

    public Expression = this.RULE("Expression", () =>
        this.OR([
            { ALT: () => this.SUBRULE(this.ParenthizedExpression) },
            { ALT: () => this.SUBRULE(this.ObjectExpression) },
            { ALT: () => this.SUBRULE(this.ArrayExpression) },
            { ALT: () => this.SUBRULE(this.OtherExpression) },
        ])
    )

    public ExpressionSequence = this.RULE("ExpressionSequence", () =>
        this.AT_LEAST_ONE_SEP({
            SEP: tokens.Comma,
            DEF: () => this.SUBRULE(this.SingleExpression),
        })
    )

    public SingleExpression = this.RULE("SingleExpression", () =>
        this.AT_LEAST_ONE(() => this.SUBRULE(this.Expression))
    )

    public AssignmentStatement = this.RULE("AssignmentStatement", () => {
        let i = 0
        this.MANY(() => {
            let ii = 0
            this.AT_LEAST_ONE_SEP({
                SEP: tokens.Comma,
                DEF: () =>
                    this.CONSUME(tokens.Identifier, {
                        LABEL: "ID_" + i + "_" + ii++,
                    }),
            })
            this.CONSUME(tokens.Assign)
            i++
        })

        this.AT_LEAST_ONE(() => this.SUBRULE(this.ExpressionSequence))
    })

    public OtherExpression = this.RULE("OtherExpression", () =>
        this.OR([
            { ALT: () => this.CONSUME(tokens.StringLiteral) },
            { ALT: () => this.CONSUME(tokens.ComplexNumber) },
            { ALT: () => this.CONSUME(tokens.DemicalLiteral) },
            { ALT: () => this.CONSUME(tokens.True) },
            { ALT: () => this.CONSUME(tokens.False) },
            { ALT: () => this.CONSUME(tokens.Identifier) },
            { ALT: () => this.CONSUME(tokens.Unknown) },
        ])
    )

    public ParenthizedExpression = this.RULE("ParenthizedExpression", () => {
        this.CONSUME(tokens.OpenParen)
        this.OPTION(() => this.SUBRULE(this.ExpressionSequence))
        this.CONSUME(tokens.CloseParen)
    })

    public ObjectExpression = this.RULE("ObjectExpression", () => {
        this.CONSUME(tokens.OpenBrace)
        this.OPTION(() => this.SUBRULE(this.ExpressionSequence))
        this.CONSUME(tokens.CloseBrace)
    })

    public ArrayExpression = this.RULE("ArrayExpression", () => {
        this.CONSUME(tokens.OpenBracket)
        this.OPTION(() => this.SUBRULE(this.ExpressionSequence))
        this.CONSUME(tokens.CloseBracket)
    })
}

// reuse the same parser instance.
export const Parser = new UnvParser()
