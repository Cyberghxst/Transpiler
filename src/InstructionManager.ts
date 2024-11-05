import { InstructionToken } from './Lexer'
import { Runtime } from './Runtime'
import { BaseNode } from './Nodes'

/**
 * Represents a base instruction.
 * 
 */
export interface BaseInstruction {
    /**
     * The name of this instruction.
     */
    name: string
    /**
     * Whether this instruction contains brackets.
     * If true, this instruction must have brackets.
     * If false, this instruction may have brackets.
     * If null, this instruction do not have brackets.
     */
    brackets: boolean | null
    /**
     * The instruction executor.
     */
    run: (runtime: Runtime, fn: InstructionToken) => BaseNode
}

/**
 * Represents an instruction manager.
 */
export class InstructionManager {
    /**
     * The cache registry for holding instructions.
     */
    static cache = new Map<string, BaseInstruction>()

    /**
     * Adds an instruction to this manager.
     * @param {BaseInstruction} fn - The instruction to be added.
     * @returns {void}
     */
    static add(...instructions: BaseInstruction[]) {
        instructions.forEach((i) => {
            InstructionManager.cache.set(i.name, i)
        })
    }

    /**
     * Returns an instruction from the cache.
     * @param {string | ((instruction: BaseInstruction) => boolean)} name - The name of this instruction.
     * @return {BaseInstruction}
     */
    static get(name: string | ((instruction: BaseInstruction) => boolean)) {
        if (typeof name === 'string') return InstructionManager.cache.get(name)

        return Array.from(InstructionManager.cache.values()).find(name)
    }
}
