**Generate rules:** Keep all the information in the documentation high level and generally avoid usage code snippets here (as usage may get outdated over time).

# Iridium IR

Iridium is meant to translate complete react programs into an easier to analyze intermediate language called Iridium IR.
Iridium focuses on modeling first-class environments, Type inference, React States and React Effects.
The following sections in-order represent the functioning on Iridium.

## 1. Generation of Module Graph

Iridium first generates an import graph for a react program and determines root nodes.

> root nodes are files which have no incoming edges (i.e. not imported by any other files).

Root nodes typically represent routes, tests, middlewares, etc. in a react application.

<!-- [Module Graph](./moduleGraph.png) -->
![Module Graph](./moduleGraph.png "Module Graph")

> Root nodes are marked green

## From the root nodes next task is to generate a component tree for the application


## Important Classes

### ProjectFile


### Project
