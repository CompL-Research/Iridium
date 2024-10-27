import.meta = {
  pathData: "",
  get path() {
    console.log("got path")
    return this.pathData
  },
  set path(newPath) {
    this.pathData = newPath
  }
}

console.log(import.meta.path)