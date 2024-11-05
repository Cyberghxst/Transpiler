import { InstructionManager } from './InstructionManager'
import { Lexer, InstructionToken } from './Lexer'
import { Transpiler } from './Transpiler'
import DefaultInstructions from './DefaultInstructions'
// import { inspect } from 'util'

// Adding some test functions.
InstructionManager.add(...DefaultInstructions)

/* const lexer = new Lexer(`
$setservervar[levelling;true]

$setservervar[level_channel;$findchannel[$message[1]]]

$setservervar[level_msg;$replacetext[$replacetext[$checkcondition[$message[2]==];true;$getservervar[level_msg]];false;$nomentionmessage]]

$title[1;Sucess To Enable Levelling]
$color[1;WHITE]
$description[1;Levelling system successfully set up! If you did not use any place holders, and want to use them, check below ->

\`\`\`
> username -> $username
> usertag -> <@$authorid>
> level -> 1
\`\`\`]

$onlyif[$mentionedchannels[1]!=;Could not find the channel!]
$onlyperms[manageserver;Not enough permissions! You need manage server permissions to execute this!]
`) */

// const tokens = lexer.tokenize()
// console.log(tokens)
// const compiledCode = lexer.getCompiledCode()

// const debug = inspect(tokens, { colors: true, depth: null })
// const mainImage = Lexer.getImage(tokens[0])

const output = Transpiler.transpile(`
$c[Este es un action row.]
$addActionRow

$c[Creating a variable.]
$let[name;Mid]

$c[Reassigning the value.]
$let[name;Cyberghxst]

$c[Creating a new variable.]
$let[message;His name is $get[name]!]
`)

console.log(output)