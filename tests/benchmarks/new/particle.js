function slowFunction (baseNumber) {
  console.time(`slowFunction ${baseNumber}`)

  let result = 0

  for (let i = Math.pow(baseNumber, 10); i >= 0; i--) {
    result += Math.atan(i) * Math.tan(i)
  }

  console.timeEnd(`slowFunction ${baseNumber}`)

  return result
}

if (require.main) {
  slowFunction(3)
  slowFunction(4)
  slowFunction(5)
}
