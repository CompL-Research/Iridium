
\`\`\`
██╗██████╗ ██╗██████╗ ██╗██╗   ██╗███╗   ███╗
██║██╔══██╗██║██╔══██╗██║██║   ██║████╗ ████║
██║██████╔╝██║██║  ██║██║██║   ██║██╔████╔██║
██║██╔══██╗██║██║  ██║██║██║   ██║██║╚██╔╝██║
██║██║  ██║██║██████╔╝██║╚██████╔╝██║ ╚═╝ ██║
╚═╝╚═╝  ╚═╝╚═╝╚═════╝ ╚═╝ ╚═════╝ ╚═╝     ╚═╝
\`\`\`

# Iridium Intermediate Representation (IR)

**Iridium IR** is the core intermediate representation used by the **Iridium Static Analysis Framework** for analyzing and optimizing dynamic language systems like JavaScript.

The IR is designed as a **dynamic, closure-oriented language** with first-class support for **asynchronous control flow**. It provides a core calculus that dynamic languages such as JavaScript can extend to encode their semantics.

Iridium desugars source programs into **primitive operations**, constructs **logical stack frames**, and serializes these into a **Lisp-like language** for further analysis and code generation.

This documentation outlines the major components of the Iridium IR and their respective roles in static analysis and transformation pipelines.

---

## Node Classifications

Iridium IR nodes are grouped into the following categories:

---

### 1. Abstract Operations

Transitional nodes that require further resolution before becoming concrete. These are used to defer decisions such as binding resolution or control structure interpretation.

For Example,

- Before **scope resolution**, IR nodes may contain symbolic references to variables whose exact location (stack vs global) is unknown.
- These unresolved references are represented by transitional nodes.
- After resolution, these nodes are rewritten to concrete stack or environment accesses via the `Bindings` object, which models logical stack frames.

---

### 2. Calls

Nodes that represent potential invocation sites, including both user-visible and internal calls.

- **Generic Calls**: Represent calls to user-defined or external functions under various calling conventions.
- **VSysCalls** (Virtual System Calls): Represent calls to internal VM-level abstract operations. These are not exposed to the user and serve as desugared forms of complex language constructs.

---

### 3. Environment

Nodes that represent and manipulate the **closure environment** in which operations execute.

- The `Bindings` object models a **logical stack frame**, storing local bindings and tracking captured variables (external environment references).
- Includes operations to declare, assign, or read values from the environment.
- Contains both **primitive** and **non-primitive** nodes for interacting with the runtime scope explicitly.

---

### 4. Flow

Nodes that control the **execution order** of a program, including both synchronous and asynchronous patterns.

- **Synchronous Flow Nodes**: Represent standard control flow structures such as conditionals, loops, and early exits (`return`, `break`, etc.).
- **Asynchronous Flow Nodes**: Capture constructs like `await`, promises, and VM-level event handling.

---

### 5. RVal (Right-hand Values)

Nodes that evaluate to values and are only permitted on the **right-hand side** of assignments.

- Represent primitive language values (e.g., literals, identifiers) and language-specific operations that produce a value without modifying state.

---

### 6. Structural

High-level structural components that define the organization of an Iridium program.

- **Compilation Units**: The top-level entry points to IR programs.
- **TopLevelContainers**: Contain module-level declarations and metadata (e.g., imports and exports).
- **Basic Blocks**: Represent linear sequences of instructions for control-flow and data-flow analysis.
- The structural nodes also capture JS module semantics, enabling potential **inter-modular analysis** in the future.

---

## Additional Notes

- Iridium is designed to enable **precise static analysis**, **novel program transformations**, and **IR-level optimizations**.
- Its Lisp-like serialization makes it amenable to both **automated reasoning** and **visual inspection**.
- The IR is both a **compilation target** and an **analysis substrate**, supporting end-to-end workflows from JavaScript source to transformed/optimized output.

---

I write the documentation quickly and have GPT beautify it, sorry if this displeases some readers 🙏