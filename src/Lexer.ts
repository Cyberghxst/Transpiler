import { BaseInstruction, InstructionManager } from './InstructionManager'

/**
 * Base structure that forms a token.
 */
interface BaseToken {
    /**
     * Position where this token starts at.
     */
    startsAt: number
    /**
     * Position where this token ends at.
     */
    endsAt: number
    /**
     * Lines that this token is on.
     */
    line: number[]
}

/**
 * Represents an instruction in the AST.
 */
export interface InstructionToken extends BaseToken {
    /**
     * The name of this instruction.
     */
    name: string
    /**
     * The fields this instruction has.
     */
    fields: InstructionField[] | null
    /**
     * The ID of the instruction.
     */
    id: string
    /**
     * The path tree of this function.
     */
    path: string
    /**
     * The metadata of this instruction.
     */
    data: BaseInstruction | null
}

/**
 * Represents an instruction field in the AST.
 */
interface InstructionField {
    /**
     * The value of this field.
     */
    value: string
    /**
     * Nested instructions belonging to this field.
     */
    nested: InstructionToken[]
}

/**
 * The lexer class resposible of compiling
 * native code into tokens.
 */
export class Lexer {
    /**
     * The main function name.
     */
    static mainFunction = '$EXECUTEMAINFUNCTION'

    /**
     * Get the string representation of an instruction.
     * @param {InstructionToken} token
     * @return {string}
     */
    static getImage(token: InstructionToken) {
        if (token.fields === null) return '$' + token.name;

        let total = `$${token.name}[`;

        for (let i = 0; i < token.fields.length; i++) {
            const field = token.fields[i]
            total += `${field.value}${i === token.fields.length - 1 ? '' : ';'}`
        }
        
        total += ']';

        return total
    }

    /**
     * Sanitizes the current code.
     * @returns {string}
     */
    static sanitize(code: string) {
        return code.replace(Lexer.mainFunction + '[', '').slice(0, -1)
    }
    
    /**
     * The path of the current function.
     */
    public path: string[] = []
    
    /**
     * The position of the cursor.
     */
    #i = 0

    /**
     * The current line of the cursor.
     */
    #line = 1

    /**
     * The amount of compiled instructions.
     */
    #compiledInstructions: number
    #compiledCode: string

    /**
     * The compiled tokens.
     */
    #tokens: InstructionToken[] = []

    /**
     * The main function.
     */
    #mainFunction = Lexer.mainFunction
    
    /**
     * Creates an instance of the Lexer class.
     * @param {string} code - The code to be analysed.
     */
    constructor(public code: string, fns = 0, p: string[] = [], addMain = true) {
        this.#compiledInstructions = fns
        this.path.push(...p)
        this.#compiledCode = code
        
        if (addMain) {
            this.code = `${this.#mainFunction}[${code}]`
            this.#compiledCode = this.code
        }
    }

    /**
     * Advances the given amount of positions in the code.
     * @param {?number} amount
     * @returns {void}
     */
    public advance(amount = 1) {
        this.#i += amount
    }

    /**
     * Tokenizes the given code.
     * @returns {(AnyValueToken | InstructionToken)[]}
     */
    public tokenize() {
        while (this.position <= this.code.length) {
            if (this.currentChar === '\n') this.#line++;
            
            if (this.currentChar === '\\') {
                this.advance(2)
            } else if (this.currentChar === '$' && this.nextChar && this.nextChar.match(/[a-zA-Z]/)) {
                this.parseInstruction()
            }
            
            this.advance() // Advance one position.
        }

        return this.#tokens
    }

    /**
     * Returns the compiled code.
     * @returns {string}
     */
    public getCompiledCode() {
        return this.#compiledCode
    }

    /**
     * Creates an instruction token.
     * @param {string} name - The name of the instruction.
     * @param {number[]} lines
     * @returns {InstructionToken}
     */
    private createInstruction(name: string, lines: number[] = [this.#line]): InstructionToken {
        return {
            name,
            fields: [],
            startsAt: this.position,
            endsAt: Infinity,
            line: lines,
            id: this.makeId.call(this),
            path: this.path.join('\\'),
            data: null
        }
    }

    /**
     * Parses an instruction.
     */
    private parseInstruction() {
        const fn = this.createInstruction('')
        this.advance() // Omitting "$".

        while (this.currentChar.match(/[a-zA-Z]/)) {
            fn.name += this.currentChar
            this.advance()
        }

        // Add the metadata for this instruction
        // to the Abstract Syntax Tree.
        fn.data = InstructionManager.get((i) => {
            return i.name.slice(1).toLowerCase() === fn.name.toLowerCase()
        }) ?? null

        if ((fn.data !== null && fn.data.brackets === null) || this.currentChar !== '[') {
            fn.fields = null
            fn.endsAt = this.position - 1
            fn.line.push(this.#line)

            this.#tokens.push(fn)
            this.#compiledCode = this.#compiledCode.replace('$' + fn.name, fn.id)
            
            return;
        }

        let depth = 0, got = ''

        while (this.currentChar) {
            if (this.currentChar === '[') depth++;
            else if (this.currentChar === ']') depth--;

            got += this.currentChar

            if (this.code[this.#i] === ']' && depth <= 0) break;

            this.advance()
        }

        const fields = this.parseInside(fn.name, got);
        fn.fields = fields;
        fn.endsAt = this.position - 1;
        fn.line.push(this.#line)

        this.#tokens.push(fn);

        this.#compiledCode = this.#compiledCode.replace(Lexer.getImage(fn), fn.id)
    }

    /**
     * Parses the inside of a function.
     */
    private parseInside(name: string, inside: string): InstructionField[] {
        const args: string[] = []
        inside = inside.slice(1, -1)

        let current = '', depth = 0

        for (const char of inside) {
            if (char === '[') depth++;
            else if (char === ']') depth--;

            if (char === ';' && depth === 0) {
                args.push(current)
                current = ''
            } else current += char
        }

        if (current !== '') args.push(current);

        return args.map((value, i) => {
            if (!value.includes('$')) return { value, nested: [] };
            else {
                const lexer = new Lexer(value, this.#compiledInstructions, [...this.path, '$' + name], false)
                const nested = lexer.tokenize()

                return {
                    value: value,
                    nested
                }
            }
        })
    }

    /**
     * Makes an ID.
     */
    private makeId() {
        return `INSTRUCTION(${this.#compiledInstructions++})`
    }

    /**
     * Returns the current character in the code.
     */
    public get currentChar() {
        return this.code.charAt(this.#i)
    }

    /**
     * Returns the next character in the code.
     */
    public get nextChar() {
        return this.code.charAt(this.#i + 1)
    }
    
    /**
     * Returns the position of the cursor.
     */
    public get position() {
        return this.#i
    }
}