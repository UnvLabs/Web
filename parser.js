const createToken = chevrotain.createToken;
const Lexer = chevrotain.Lexer;

const inline_comment = createToken({
  name: "inline_comment",
  pattern: /#.+/,
});
const block_comment = createToken({
  name: "block_comment",
  pattern: /###[^]*?###/,
});
const lparen = createToken({ name: "lparen", pattern: /\(/ });
const rparen = createToken({ name: "rparen", pattern: /\)/ });
const lcurly = createToken({ name: "lcurly", pattern: /{/ });
const rcurly = createToken({ name: "rcurly", pattern: /}/ });
const lsquare = createToken({ name: "lsquare", pattern: /\[/ });
const rsquare = createToken({ name: "rsquare", pattern: /]/ });
const string = createToken({
  name: "string",
  pattern: /"(?:\\"|[^"])*"/,
});
const number = createToken({
  name: "number",
  pattern: /-?\d+(\.\d+)?([eE][+-]?\d+)?/,
});
const whitespace = createToken({
  name: "whitespace",
  pattern: /[\t ]+/,
});
const newline = createToken({
  name: "newline",
  pattern: /\n/,
});
const unknown = createToken({
  name: "unknown",
  pattern: /./,
});

const UnvTokens = [
  newline,
  whitespace,
  number,
  string,
  rcurly,
  lcurly,
  lparen,
  rparen,
  lsquare,
  rsquare,
  unknown,
];

const UnvLexer = new Lexer(UnvTokens, {
  // Less position info tracked, reduces verbosity of the playground output.
  positionTracking: "onlyStart",
});

// Labels only affect error messages and Diagrams.
lcurly.LABEL = "'{'";
rcurly.LABEL = "'}'";
lsquare.LABEL = "'['";
rsquare.LABEL = "']'";
lparen.LABEL = "'('";
rparen.LABEL = "')'";

// ----------------- parser -----------------
const CstParser = chevrotain.CstParser;

class UnvParser extends CstParser {
  constructor() {
    super(UnvTokens, {
      recoveryEnabled: true,
    });

    const $ = this;

    $.RULE("expr", () => {
      $.OR([
        { ALT: () => $.CONSUME(unknown) },
        { ALT: () => $.CONSUME(number) },
        { ALT: () => $.CONSUME(string) },
        { ALT: () => $.CONSUME(whitespace) },
        { ALT: () => $.SUBRULE($.paren_expr) },
        { ALT: () => $.SUBRULE($.array_expr) },
        { ALT: () => $.SUBRULE($.object_expr) },
      ]);
    });

    $.RULE("expr_stat", () => {
      $.MANY(() => {
        $.SUBRULE($.expr);
      });
    });

    $.RULE("stat", () => {
      $.OR([{ ALT: () => $.SUBRULE($.expr_stat) }]);
    });

    $.RULE("program", () => {
      $.MANY(() => {
        $.SUBRULE($.stat);
      });
    });

    $.RULE("paren_expr", () => {
      $.CONSUME(lparen);
      $.MANY(() => {
        $.OR([
          { ALT: () => $.SUBRULE($.expr) },
          { ALT: () => $.CONSUME(newline) },
        ]);
      });
      $.CONSUME(rparen);
    });

    $.RULE("array_expr", () => {
      $.CONSUME(lsquare);
      $.MANY(() => {
        $.OR([
          { ALT: () => $.SUBRULE($.expr) },
          { ALT: () => $.CONSUME(newline) },
        ]);
      });
      $.CONSUME(rsquare);
    });

    $.RULE("object_expr", () => {
      $.CONSUME(lcurly);
      $.MANY(() => {
        $.OR([
          { ALT: () => $.SUBRULE($.expr) },
          { ALT: () => $.CONSUME(newline) },
        ]);
      });
      $.CONSUME(rcurly);
    });

    // very important to call this after all the rules have been setup.
    // otherwise the parser may not work correctly as it will lack information
    // derived from the self analysis.
    this.performSelfAnalysis();
  }
}
