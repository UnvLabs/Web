import { CstNode, IToken } from "chevrotain"
import { Parser } from "./parser"

export const BaseConverter = Parser.getBaseCstVisitorConstructor()

type Options = {
    imports: boolean | string
    tools: {
        sequence: string
        complex: string
    }
}

type Context = Record<string, CstNode[] | IToken[]>

export class UnvConverter extends BaseConverter {
    options: Options
    scope: string[][]
    constructor({
        imports = true,
        tools: { sequence = "$$sequence", complex = "$$complex" } = {} as any,
    }: Partial<Options> = {}) {
        super()
        this.options = {
            imports,
            tools: {
                sequence,
                complex,
            },
        }
        this.scope = [[]]
        // The "validateVisitor" method is a helper utility which performs static analysis
        // to detect missing or redundant visitor methods
        this.validateVisitor()
    }

    Program(ctx: Context) {
        return (ctx.Statement as CstNode[])
            .map((expr) => this.visit(expr))
            .join("")
    }

    Statement(ctx: Context) {
        return (
            this.visit(ctx.AssignmentStatement as CstNode[]) ||
            this.visit(ctx.ImportStatement as CstNode[]) ||
            this.visit(ctx.BlockStatement as CstNode[]) ||
            this.visit(ctx.IfStatement as CstNode[]) ||
            this.visit(ctx.ExpressionStatement as CstNode[])
        )
    }

    ExpressionStatement(ctx: Context) {
        return this.visit(ctx.ExpressionSequence as CstNode[]) + ";"
    }

    AssignmentStatement(ctx: Context) {
        let blocks: string[][] = []
        Object.keys(ctx).forEach((key) => {
            if (/^ID_/.test(key)) {
                let [, blockNum, varNum] = key.split("_")
                blocks[+blockNum] = blocks[+blockNum] || []
                blocks[+blockNum][+varNum] = (ctx[key][0] as IToken).image
            }
        })

        let code = ""
        let toDefine = blocks.flat().filter((id) => !this.scope[0].includes(id))
        if (toDefine.length) code += `let ${toDefine.join()};`

        for (let block of blocks) {
            if (block.length === 1) code += block[0]
            else code += "[" + block.join() + "]"
            code += "="
        }
        code += this.options.tools.sequence
        code += "(" + this.visit(ctx.ExpressionSequence as CstNode[]) + ");"
        return code
    }

    BlockStatement(ctx: Context) {
        return (
            "{" +
            (ctx.Statement as CstNode[])
                .map((expr) => this.visit(expr))
                .join("") +
            "}"
        )
    }

    IfStatement(ctx: Context) {
        return (
            "if(" +
            this.visit(ctx.Expression as CstNode[]) +
            ")" +
            this.visit(ctx.BlockStatement as CstNode[])
        )
    }

    ImportStatement(ctx: Context) {
        let code = ""
        if (this.options.imports === true) {
            code = "import"
            if (ctx.From)
                code +=
                    "{" +
                    (ctx.Identifier as IToken[])
                        .map((id) => id.image)
                        .join(",") +
                    "}from"
            code += (ctx.StringLiteral as IToken[])[0].image + ";"
        } else if (this.options.imports) {
            if (ctx.From)
                code =
                    "const {" +
                    (ctx.Identifier as IToken[])
                        .map((id) => id.image)
                        .join(",") +
                    "}="
            code +=
                this.options.imports +
                "(" +
                (ctx.StringLiteral as IToken[])[0].image +
                ");"
        }

        return code
    }

    ExpressionSequence(ctx: Context) {
        return (ctx.SingleExpression as CstNode[])
            .map((expr) => this.visit(expr))
            .join()
    }

    SingleExpression(ctx: Context) {
        return (ctx.Expression as CstNode[])
            .map((expr) => this.visit(expr))
            .join("")
    }

    Expression(ctx: Context) {
        return (
            this.visit(ctx.ObjectExpression as CstNode[]) ||
            this.visit(ctx.ArrayExpression as CstNode[]) ||
            this.visit(ctx.ParenthizedExpression as CstNode[]) ||
            this.visit(ctx.OtherExpression as CstNode[])
        )
    }

    OtherExpression(ctx: Context) {
        return (
            (ctx.StringLiteral &&
                ctx.StringLiteral[0] &&
                "`" +
                    (ctx.StringLiteral as IToken[])[0].image
                        .slice(1, -1)
                        .replace(/`/g, "\\`") +
                    "`") ||
            (ctx.ComplexNumber &&
                this.options.tools.complex +
                    "(" +
                    (ctx.ComplexNumber as IToken[])[0].image +
                    ")") ||
            (
                (ctx.DemicalLiteral ||
                    ctx.True ||
                    ctx.False ||
                    ctx.Identifier ||
                    ctx.Unknown) as IToken[]
            )?.[0].image
        )
    }

    ObjectExpression(ctx: Context) {
        return (
            "{" +
            (ctx.ExpressionSequence
                ? this.visit(ctx.ExpressionSequence as CstNode[])
                : "") +
            "}"
        )
    }

    ArrayExpression(ctx: Context) {
        return (
            "[" +
            (ctx.ExpressionSequence
                ? this.visit(ctx.ExpressionSequence as CstNode[])
                : "") +
            "]"
        )
    }

    ParenthizedExpression(ctx: Context) {
        return (
            "(" +
            (ctx.ExpressionSequence
                ? this.visit(ctx.ExpressionSequence as CstNode[])
                : "") +
            ")"
        )
    }
}
