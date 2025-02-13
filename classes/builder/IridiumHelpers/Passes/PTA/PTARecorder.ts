export class PTARecorder {
  top: Array<string> = []
  states: Array<[string, string]> = []
  bottom: Array<string> = []

  init() {
    this.top.push(`<html>`)
    this.top.push(`  <header>IRIDIUM PTA Debug Session</header>`)
    this.top.push(`  <body>`)

    this.bottom.push(`  </body>`)
    this.bottom.push(`</html>`)
  }

  recordState(codeState, ptaState) {
    this.states.push([codeState, ptaState])
  }

  saveRecording(path) {
    let res = []
    res = [...this.top]


    res = [...this.bottom]
  }

}