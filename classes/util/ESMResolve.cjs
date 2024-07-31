exports.resolveESM = (source, paths) => {
  return require.resolve(source, { paths })
}