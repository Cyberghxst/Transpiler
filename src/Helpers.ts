import { InstructionToken } from './Lexer'
import { inspect } from 'util'

/**
 * Resolves a token.
 * @param {InstructionToken} token - The token to be resolved.
 * @returns {string}
 */
export function resolveToken(token: InstructionToken) {
    
}

/**
 * Logs the detailed structure of the object passed.
 * @returns {unknown}
 */
export function debug<T>(value: T, depth: number | null = null) {
    return console.log(inspect(value, { depth, colors: true }))
}