# About

## Publications

!!! note "Stub"
    This section has not been written yet.

## People

!!! note "Stub"
    This section has not been written yet.

## Citing Iridium

If you use Iridium in your research, please cite it.

The repository includes a [`CITATION.cff`](https://github.com/compl-research/Iridium/blob/main/CITATION.cff)
file, so GitHub shows a **Cite this repository** button in the sidebar, with ready-made APA and BibTeX
citations. Zotero and other reference managers can also import it.

BibTeX ([download](assets/iridium.bib)):

```bibtex
--8<-- "assets/iridium.bib"
```

!!! info "For maintainers"
    `CITATION.cff` and this BibTeX entry are generated from `Authors.ts`. After changing the authors,
    run `npm run gen:citation`.

## License

Iridium is open source under the [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).
You may use, modify and redistribute it, including in commercial and closed-source tools,
as long as you keep the license and copyright notices. Apache-2.0 also includes an explicit patent grant.

| Component | License | Where |
|---|---|---|
| Iridium (TypeScript frontend) | Apache-2.0 | [`LICENSE`](https://github.com/compl-research/Iridium/blob/main/LICENSE), [`NOTICE`](https://github.com/compl-research/Iridium/blob/main/NOTICE) |
| Forge (C++ analysis) | Apache-2.0 | `LICENSE` and `NOTICE` in `externalDeps/Iridium-Forge` |
| QuickJS runtime (fork) | MIT | `LICENSE` in `externalDeps/quickjs` |

### Third-party code

Iridium includes some third-party code, which keeps its original license:

- **Benchmarks:** the programs in `tests/benchmarks/` (SunSpider, Kraken, Octane, V8, …) are not covered by Apache-2.0.
  Each file carries its own license and copyright header.
- **Forge dependencies:** Forge bundles the [Boost Graph Library](https://www.boost.org/doc/libs/release/libs/graph/)
  (Boost Software License 1.0) and [JSON for Modern C++](https://github.com/nlohmann/json) (MIT).
  Their license texts are in Forge's `include/external/`.
- **test262:** the [ECMAScript conformance suite](https://github.com/tc39/test262), used for testing, is a
  git submodule under its own BSD license.

The `NOTICE` files give the full attribution details.
