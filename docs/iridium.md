# Iridium IR-code Specification

## TODOs

// TODO: Reduce JSFunctions and Calls into Abstraction and Application...
// TODO: Should we reduce yields into CPS?

Syntax:
  ((OPCODE ARG1 ARG2?) (OTHER)) 

## Abstract Operations

1. getEnvBinding: Given an Identifier returns an EnvBinding

  ID X Context -> EnvBinding

2. resolveImportPath: Given a string, returns the absolute path to the import being made.

  Literal<String> -> Literal<String>

### Control Flow Abstractions

1. Goto
  
  ((goto BBIdx) ())

### RVAL

1. List

  An abstract primitive list, no side effects, not a JS Array Object.

  [a, b, c, ...]
  ((list a b c ...) ())

2. EnvBinding

  ID
  ((envbinding ID EnvID) ())

3. Symbol 

  ID
  ((symbol ID) ())

4. Literal

  VAL
  ((Literal<JS_LITERALS> VAL) ())

6. Abstraction

  λabc.a...
  ((λ (list a b c) (list ...)))

7. Application
  a(a1, a2...)
  ((call a a1 a2...) ())

#### JS Primitive RVAL

JS_LITERALS =
  | Decimal
  | BigInt
  | String
  | Numeric
  | Null
  | Boolean

1. JSRegex

  JSREGEX
  ((jsregexp JSREGEX) ())

2. JSTemplates

  `${ID1}str1${ID2}str2...`
  ((jstemplate (list Literal<String>...) (list (getEnvBinding GlobalContext ID1)...)))
    => ((jstemplate (list Literal<String>...) (list EnvBinding...)) ())

  tag`${ID1}str1${ID2}str2...`
  ((jstaggedtemplate (getEnvBinding GlobalContext tag) (list Literal<String>...) (list (getEnvBinding GlobalContext ID1)...)))
    => ((jstaggedtemplate EnvBinding (list Literal<String>...) (list EnvBinding...)) ())

### JS Modules

1. JSImportEffect

  An import made specifically for side effects, side effects are triggered only once globally.

  import "_"
  ((jseffectimport (resolveImportPath "_")) ()) 
    => ((jseffectimport Literal<String>) ())

2. JSImport

  An import made to load a specific field, side effects are triggered only once globally.

  import { field as localID } from "_"
  ((jsnamedimport (resolveImportPath "_") Literal<String> (getEnvBinding GlobalContext localID)) ()) 
    => ((jsnamedimport Literal<String> Literal<String> EnvBinding) ())

3. JSNSImport

  An import made to load the entire namespace to a local binding, side effects are triggered only once globally.

  import * as localID from "_"
  ((jsnsimport (resolveImportPath "_") (getEnvBinding GlobalContext localID)) ()) 
    => ((jsnsimport Literal<String> EnvBinding) ())

4. JSExport

  export { localID as field }
  ((jsexport (getEnvBinding GlobalContext localID) Literal<String>) ())
    => ((jsexport Literal<String> Literal<String> EnvBinding) ())

5. JSReexport

    export { importedField as exportedField } from "_"
    ((reexport (resolveImportPath "_") Literal<String> Literal<String>) ())
      => ((reexport Literal<String> Literal<String> Literal<String>) ())

6. JSReexportNS

    export * from "_"
    ((reexportns (resolveImportPath "_")) ())
      => ((reexportns Literal<String>) ())

7. JSReexportNSAs

    export * as exportedField from "_"
    ((reexportns (resolveImportPath "_") Literal<String>) ())
      => ((reexportns Literal<String> Literal<String>) ())

#### EnvRead

  ID
  ((genericenvread (getEnvBinding Context ID)) ()) 
    => ((genericenvread EnvBinding) ())
    => ((_ EnvBinding) ())

  EnvRead = ActiveEnvRead | ClosureEnvRead | ParentEnvRead | GlobalEnvRead

#### EnvWrite

  ID = val
  ((genericenvwrite (getEnvBinding Context ID) (getEnvBinding Context val)) ())
    => ((genericenvwrite EnvBinding EnvBinding) ())
    => ((_ EnvBinding EnvBinding) ())

  EnvWrite = ActiveEnvWrite | ClosureEnvWrite | ParentEnvWrite | GlobalEnvWrite

### PropAssn

  a.b = c
  ((genericstaticpropassn (getEnvBinding Context ID) (symbol b) (getEnvBinding Context ID)) ()) 
    => ((genericstaticpropassn EnvRead Symbol EnvRead) ())
    => ((_ EnvRead Symbol EnvRead) ())

  a[b] = c
  ((genericstaticpropassn (getEnvBinding Context ID) (symbol b) (getEnvBinding Context ID)) ()) 
    => ((genericstaticpropassn EnvRead EnvRead EnvRead) ())
    => ((_ EnvRead EnvRead EnvRead) ())

  PropAssn = PrimitiveStaticPropAssn | JSStaticPropAssn | JSComputedPropAssn

    PrimitiveStaticPropAssn: Extensible Object && No setter Hoobla && No Prototype Hoobla
    
    JSStaticPropAssn: We know what prop we are assigning, but it can have side effects.

    JSComputedPropAssn: We dont know what prop we are assigning and it can have side effects.

### PropRead

  a.b
  ((genericstaticpropread (getEnvBinding Context ID) (symbol b) (getEnvBinding Context ID)) ()) 
    => ((genericstaticpropread EnvRead Symbol EnvRead) ())
    => ((_ EnvRead Symbol EnvRead) ())

  a[b]
  ((genericcomputedpropread (getEnvBinding Context ID) (symbol b) (getEnvBinding Context ID)) ()) 
    => ((genericcomputedpropread EnvRead EnvRead EnvRead) ())
    => ((_ EnvRead EnvRead EnvRead) ())

  PropRead = PrimitiveStaticPropRead | JSStaticPropRead | JSComputedPropRead

    PrimitiveStaticPropRead: Primitive Field && No Prototype Lookup Needed
    
    JSStaticPropRead: We know what field we are reading, but it can have side effects.

    JSComputedPropRead: We dont know what field we are reading and it can have side effects.
  