import { BaseNode } from './Nodes'
import { Lexer } from './Lexer'
import { Runtime } from './Runtime'
import { inspect } from 'util'

/**
 * The main transpiler class.
 */
export class Transpiler {
    /**
     * Transpiles the given raw code to Javascript.
     * @param {string} code - The native code.
     * @returns {string}
     */
    static transpile(code: string, runtime = new Runtime(), main = true) {
        const ast = new Lexer(code, 0, [], main).tokenize()
        const program = ast[0].fields[0]
        let total = `${code}`

        for (const nest of program.nested) {
            // Getting the string representation of the instruction.
            const image = Lexer.getImage(nest)

            // Removing from the code if has no data.
            if (!nest.data) {
                total = total.replace(image, '')
                continue
            }

            // Getting the result and replacing it.
            const result = nest.data.run(runtime, nest)
            total = total.replace(image, Transpiler.fromNode(result))
        }

        // Adding the packages.
        if (runtime.packages.size > 0) {
            total = `${[...runtime.packages.values()].map(p => `const ${p.properties === null ? p.name.replace(/[^a-zA-Z]/, '') : `{ ${p.properties.join(', ')} }`} = require("${p.name}");`).join('\n')}\n${total}`
        }

        // Return the total
        return total
    }

    /**
     * Transpiles a node to its string representation.
     * @param {BaseNode} node - The node to be transpiled.
     * @returns {string}
     */
    static fromNode(node: BaseNode) {
        return `${node.toString()}${node.semicolon ? ';' : ''}`
    }
}