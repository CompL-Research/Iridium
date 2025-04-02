# Iridium IR-code Specification

## TODOs

// TODO: Reduce JSFunctions and Calls into Abstraction and Application...
// TODO: Should we reduce yields into CPS?
// TODO: 3JS reduce object destructuring into even simpler form.


Syntax:
  ((OPCODE ARG1 ARG2?) (OTHER)) 


## Closures:

(list 
  (λ (list STATEMENT1 STATEMENT2 STATEMENT3))
  (list (list Pure GFable Fable LexRO LexRW))
)

Languages like JS are heavily closure oriented, so we let closures retain their first-class citizenship.
Each closure is qualified by one of the properties described below:

1. Pure: Closure arguments are transitively immutable, and the result is cacheable.

2. Fable: Closure is free from lookups from any enclosing scope.

3. GFable: Closure is free from lookups from any enclosing scope except the Global Scope.

- Fable and GFable closures can be hoisted to the global scope.

4. LexRO: Only reads bindings from the enclosing scope(s).

5. LexRW: May read/write to bindings from the enclosing scope(s).

[ Pure < Fable < GFable < LexRO < LexRW ]

### Reading Arguments

All closures take a single arguments object, formals are initialized inside the function body.

IRIDIUM_DO_ASSIGNMENT(LVAL, (ClosArg ARG_IDX))

### JS Extensions

(list
  (λ (list STATEMENT1 STATEMENT2 STATEMENT3))
  (list (list Pure GFable Fable LexRO LexRW) (list InferredName Strict))
)

A JS Closure can have special properties, it may (possibly) have an inferred name, dynamic 'this' binding, be an async function returning promises,
be a generator function creating first class continuations.

1. InferredName: Setting a closures name, mainly needed only for debugging purposes and codegen can possibly ignore this during codegen.

2. Strict: If the closure is strict or not, depending on the strictness of a closure the semantics of the 'this' pointer may be different.

```
const ff = function () {
  this.x = 100
  this.y = 111
  return function foo () {
    console.log(this.x, this.y);
  }
}
ff()();
```

When evaluating the function in CJS, 'this' gets bound to the global env. So the output is 100, 111.
However in module mode code, this will throw an error as 'this' gets bound to undefined.




## EnvRead
  ID
  (list
    (genericenvread (getEnvBinding Context ID))
    ()
  )
    => (reduce)
  (list
    (genericenvread EnvBinding) ()
  )
    => (reduce)
  (list 
    (_ EnvBinding) 
    ()
  )

  EnvRead = ActiveEnvRead | ClosureEnvRead | ParentEnvRead | FileEnvRead | GlobalEnvRead

  ActiveEnvRead: The read operation is happening in the declaring context.

  ClosureEnvRead: The read operation refers to a value declared in a scope which is bounded by a closure scope.

  ParentEnvRead: The read operation crosses the enclosing closure context.

  FileEnvRead: The read operation refers to a binding in the File env.

  GlobalEnvRead: The read operation refers to the global environment.

### JS Extensions

A read from an environment, this is side effect free in JS aswell, so no special cases exist here.




## EnvWrite

  ID = val
  (list
    (genericenvwrite (getEnvBinding Context ID) (getEnvBinding Context val))
    (Declaration?)
  )
    => (reduce)
  (list
    (genericenvwrite EnvBinding EnvBinding)
    (Declaration?)
  )
    => (reduce) 
  (list
    (_ EnvBinding EnvBinding)
    (Declaration?)
  )

  EnvWrite = ActiveEnvWrite | ClosureEnvWrite | ParentEnvWrite | FileEnvWrite | GlobalEnvWrite

  ActiveEnvWrite: The write operation is happening in the declaring context.

  ClosureEnvWrite: The write operation refers to a value declared in a scope which is bounded by a closure scope.

  ParentEnvWrite: The write operation crosses the enclosing closure context.

  FileEnvWrite: The write operation refers to a binding in the File env.

  GlobalEnvWrite: The write operation refers to the global environment.

### Declaration

A write to an environment may refer to a binding declaration, this distinction is needed for identifying TDZ in JS and hoisting all declarations to the top of the scope.

(list
  (_ _ _)
  (list bindingDeclaration)
)

### JS Extensions

  a. ID = ID:

Fallback to generic case.

  (list
    (genericenvwrite (getEnvBinding Context ID) (getEnvBinding Context val))
    ()
  )





2. Destructure Array Case: [ID, ID, ...] = ID:

(list
  (DestArrWrite (list (getEnvBinding Context ID)...) (getEnvBinding Context val))
  ()
) => (reduce)
(list
  (DestArrWrite (list EnvBinding...) EnvBinding)
  ()
)

Destructuring bytecode produces fast/slow case code, this can lead to large bytecode sequences. 
We might be able to drastically reduce the generated code if this case can be effectively pruned.
An iterator may be involved in slowcases, but we expect it to be rare.
Count the numbers!!

3. Destructure Object Case: { ID: ID,... } = ID

(list
  (DestObjWrite (list (getEnvBinding Context ID)...) (getEnvBinding Context val))
  ()
)


==================== ==================== ==================== ==================== ==================== ==================== ==================== ==================== 

3. Object Destructuring: { field: ID, ... } = ID ===> 

We can naively reduce this to even smaller pieces.

## Computed Properties

Computed properties rely on TOPROPERTYKEY abstract operation, if this can be statically eliminated we can optimize code much more.


### 3. Object Operations








### Abstract Operations

1. getEnvBinding: Given an Identifier returns an EnvBinding

  ID X Context -> EnvBinding

2. resolveImportPath: Given a string, returns the absolute path to the import being made.

  Literal<String> -> Literal<String>

3. getClosureArg: Given the index, collect the argument at a specific index.

  Number -> Arg

### Control Flow Abstractions

1. Goto
  
  ((goto BBIdx) ())

### RVAL

1. List

  An abstract primitive list, no side effects, not a JS Array Object.

  [a, b, c, ...]
  ((list a b c ...) ())

2. Map

  An abstract primitive map, no side effects, not a JS Object.

  [(key, value), (key, value), (key, value), ...]
  ((list (key, value) (key, value) (key, value) ...) ())

3. EnvBinding

  ID
  ((envbinding ID EnvID) ())

4. Symbol 

  ID
  ((symbol ID) ())

5. Literal

  VAL
  ((Literal<JS_LITERALS> VAL) ())

6. Abstraction

  λabc.a...
  ((λ (list a b c) (list ...)))

7. Application
  a(a1, a2...)
  ((call a a1 a2...) ())

8. ClosArg
  (ClosArg NUMBER)

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
  