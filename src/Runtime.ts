/**
 * Represents the run-time data.
 */
export class Runtime {
    /**
     * The children runtimes.
     */
    public childs: Runtime[] = []
    
    /**
     * Declared functions in this runtime.
     */
    public functions: Map<string, RunnableFunction>
    
    /**
     * The imported packages in this runtime.
     */
    public packages: Map<string, RunnablePackage>

    /**
     * The parent runtime.
     */
    public parent: Runtime | null = null
    
    /**
     * The variables this runtime has.
     */
    public variables: Set<string>

    /**
     * Creates a new instance of the Runtime class.
     */
    constructor() {
        this.functions = new Map()
        this.packages = new Map()
        this.variables = new Set()
    }

    /**
     * Returns a package from this runtime.
     * @param {string} name - The name of the package.
     * @returns {RunnablePackage}
     */
    public getPackage(name: string, cb?: (pkg: RunnablePackage) => void): RunnablePackage {
        const data = this.packages.get(name) ?? {
            properties: [], name
        }

        if (cb) cb(data);

        return data
    }

    public extend() {
        const vars = this.variables.values()
        const runtime = new Runtime()

        runtime.variables = new Set(vars)
        runtime.parent = this

        this.childs.push(runtime)

        return runtime
    }
}

/**
 * Represents the packages of the context.
 */
export interface RunnablePackage {
    /**
     * Properties to be required from the package.
     * If array, we are requiring certain properties.
     * If null, we are making a default import/require.
     */
    properties: string[] | null
    /**
     * The name of this package.
     */
    name: string
}

/**
 * Represents the functions in this context.
 */
export interface RunnableFunction {
    /**
     * The name of this function.
     */
    name: string
    /**
     * The function itself.
     */
    executor: Function | string
}