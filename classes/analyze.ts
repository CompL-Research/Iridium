// 
// Analyze 
// 
// 
//  Input: Javascript Project
// 
//  Actions:
// 
//  1. Recursively search for all [.ts, .tsx, .js, .jsx] files in the analysis path.
//  2. Parse all discovered files in the analysis path.
//  3. Iterate over all parsed file's ASTs and resolve top-level imports, all non-library imports are recursively loaded.
//  4. Transform all loaded AST's into JS3 Format.
//  5. Generate Module Graph and discover root nodes.
//     The idea is that the exports from the root nodes form the program root paths, further analysis will consider these as starting points. 
//  6. Construct Intra-module call graphs, starting from root nodes to discover entry functions.
//  7. Perform points-to-analysis for entry functions and construct call graphs.
//     -  
//  8. Mark component functions in the call graph: return nodes reachable by JSX nodes.
//     - Identify pure component functions and conditional component functions
//     - 
//  9. 