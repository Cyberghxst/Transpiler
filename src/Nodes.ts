import { Transpiler } from './Transpiler'

/**
 * Represents a base node in the AST.
 */
export abstract class BaseNode<Type extends string = string, Value = unknown> {
    public declare type: Type
    public declare value: Value
    public semicolon: boolean

    /**
     * Creates an instance of the BaseNode class.
     * @param {Type} type - The node type.
     * @param {Value} value - The value of this node.
     */
    constructor(type: Type, value: Value, semicolon = false) {
        this.type = type
        this.value = value
        this.semicolon = semicolon
    }

    /**
     * Serializes this node to its string
     * representation.
     */
    abstract toString(): string
}

/**
 * The available node types.
 */
export enum NodeType {
    InstanceInitialization = 'instance_initialization',
    InterpolatedString = 'interpolated_string',
    Literal = 'literal',
    NumberLiteral = 'number_literal',
    StringLiteral = 'string_literal',
    Sequence = 'sequence'
}

export class LiteralNode extends BaseNode<NodeType.Literal, string> {
    constructor(value: string, semicolon?: boolean) {
        super(NodeType.Literal, value, semicolon)
    }

    public toString() {
        return this.value
    }
}

/**
 * Represents an string literal in the AST.
 */
export class StringLiteral extends BaseNode<NodeType.StringLiteral, string> {
    constructor(value: string, semicolon?: boolean) {
        super(NodeType.StringLiteral, value, semicolon)
    }

    /**
     * Returns the string representation of this string literal.
     * @returns {string}
     */
    public toString() {
        return `"${this.value}"`
    }
}

/**
 * Represents an interpolated string in the AST.
 */
export class InterpolatedString extends BaseNode<NodeType.InterpolatedString, BaseNode[]> {
    constructor(nodes: BaseNode[], semicolon?: boolean) {
        super(NodeType.InterpolatedString, nodes, semicolon)
    }

    /**
     * Return the parts of this node.
     */
    public get parts() {
        return this.value
    }

    /**
     * Serializes this node to its string representation.
     */
    public toString() {
        return `\`${this.parts.map(part => part.type === NodeType.StringLiteral || part.type === NodeType.NumberLiteral ? part.value : `\${${Transpiler.fromNode(part)}}`).join('')}\``
    }
}

/**
 * Represents a number in the AST.
 */
export class NumberLiteral extends BaseNode<NodeType.NumberLiteral, number> {
    constructor(value: number, semicolon?: boolean) {
        super(NodeType.NumberLiteral, value, semicolon)
    }

    /**
     * Returns the string representation of this string literal.
     * @returns {string}
     */
    public toString() {
        return this.value.toString()
    }
}

/**
 * Represents an instance initialization in the AST.
 */
export class InstanceInitialization extends BaseNode<NodeType.InstanceInitialization, string> {
    constructor(value: string, semicolon?: boolean) {
        super(NodeType.InstanceInitialization, value, semicolon)
    }

    /**
     * Returns the string representation of this node.
     * @returns {string}
     */
    public toString() {
        return `new ${this.value}()`
    }
}

/**
 * Represents a sequence node value.
 */
interface SequenceNodeValue {
    elements: BaseNode[]
    operator: string
}

/**
 * Represents a sequence in the AST.
 */
export class SequenceNode extends BaseNode<NodeType.Sequence, SequenceNodeValue> {
    constructor(value: SequenceNodeValue, semicolon?: boolean) {
        super(NodeType.Sequence, value, semicolon)
    }

    /**
     * Returns the string representation of the sequence.
     */
    public toString() {
        return this.value.elements.map(t => t.toString()).join(this.value.operator)
    }
}