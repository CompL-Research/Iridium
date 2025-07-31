# Iridium Grammar

## FileSEXP

A FileSEXP is the top level S-Expression for an iridium module/script.

```
["JSScript" | "JSModule"]
```
```
FileSEXP := [
  ListSEXP(ModuleRequestSEXP),
  ListSEXP(StaticImportSEXP),
  ListSEXP(LocalStaticExportSEXP | NamedReexportSEXP),
  ListSEXP(StarExportSEXP),
  ...[BBContainerSEXP]
]
```


// Complete the rest of the file using Types.ts as input
