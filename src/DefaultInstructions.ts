import { BaseInstruction } from './InstructionManager'
import { Transpiler } from './Transpiler'
import { debug } from './Helpers'
import { InstanceInitialization, LiteralNode, SequenceNode, StringLiteral } from './Nodes'

const instructions: BaseInstruction[] = [
    {
        name: '$addActionRow',
        brackets: null,
        run: (ctx) => {
            const djs = ctx.getPackage('discord.js', (d) => d.properties = null)
            
            ctx.packages.set('discord.js', djs)
            
            return new InstanceInitialization('discordjs.ActionRowBuilder', true)
        }
    },
    {
        name: '$c',
        brackets: true,
        run(_, fn) {
            const values = fn.fields.map(({ value }) => value)

            return new LiteralNode(`/* ${values.join(';')} */`)
        }
    },
    {
        name: '$let',
        brackets: true,
        run(ctx, fn) {
            let [name, value] = fn.fields.map(({ value }) => value)
            debug(fn)

            value = Transpiler.transpile(value, ctx.extend())

            if (ctx.variables.has(name)) {
                return new SequenceNode({
                    elements: [
                        new LiteralNode(name),
                        new StringLiteral(value)
                    ],
                    operator: ' = '
                })
            } else {
                ctx.variables.add(name)
                return new SequenceNode({
                    elements: [
                        new LiteralNode('let ' + name),
                        new StringLiteral(value)
                    ],
                    operator: ' = '
                }, true)
            }
        }
    },
    {
        name: '$get',
        brackets: true,
        run(ctx, fn) {
            const [name] = fn.fields.map(({ value }) => value)

            if (ctx.variables.has(name)) {
                return new LiteralNode(name)
            } else {
                return new LiteralNode('undefined')
            }
        }
    }
]

export default instructions