import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import sucrase from "@rollup/plugin-sucrase"
import pkg from "./package.json"
import dts from "rollup-plugin-dts"
import { terser } from "rollup-plugin-terser"

/**
 * @type {import("rollup").RollupOptions}
 */
export default [
    {
        input: "src/index.ts",
        external: ["chevrotain"],
        plugins: [
            resolve({
                extensions: [".js", ".ts"],
            }),
            sucrase({
                exclude: ["node_modules/**"],
                transforms: ["typescript"],
            }),
            terser(),
        ],
        output: [
            { file: pkg.main, format: "cjs" },
            { file: pkg.module, format: "es" },
            {
                file: "dist/core.modern.js",
                format: "es",
                paths: {
                    chevrotain:
                        "https://cdn.skypack.dev/pin/chevrotain@v10.0.0-rPKiqvfRjqXWeRgywbMq/mode=imports,min/optimized/chevrotain.js",
                },
            },
        ],
    },
    {
        input: "src/index.ts",
        output: [{ file: "dist/core.d.ts", format: "es" }],
        plugins: [dts()],
    },
]
