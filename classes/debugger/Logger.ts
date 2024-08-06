type LogItem = {
  timestamp: any,
  level: "general" | "warn" | "error",
  message: string,
  objects: Array<any>
}

export default class Logger {
  logData: Array<LogItem> = new Array()
  printToConsole: boolean = true

  constructor() { }

  #generateLog(item: LogItem) {
    this.logData.push(item)
    if (!this.printToConsole) return;
    if (item.level === "general") {
      console.log(`[${item.timestamp}] ${item.message}`, item.objects)
    } else if (item.level === "warn") {
      console.warn(`[${item.timestamp}] ${item.message}`, item.objects)
    } else {
      console.error(`[${item.timestamp}] ${item.message}`, item.objects)
    }
  }

  log(message: string, objects: Array<any> = []) {
    const timestamp = new Date().toLocaleString()
    const data: LogItem = {
      timestamp,
      level: "general",
      message,
      objects
    }
    this.#generateLog(data)
  }

  warn(message: string, objects: Array<any> = []) {
    const timestamp = new Date().toLocaleString()
    const data: LogItem = {
      timestamp,
      level: "warn",
      message,
      objects
    }
    this.#generateLog(data)
  }

  error(message: string, objects: Array<any> = []) {
    const timestamp = new Date().toLocaleString()
    const data: LogItem = {
      timestamp,
      level: "error",
      message,
      objects
    }
    this.#generateLog(data)
  }

  thrownError(message: string, objects: Array<any> = []) {
    const timestamp = new Date().toLocaleString()
    const data: LogItem = {
      timestamp,
      level: "error",
      message,
      objects
    }
    this.#generateLog(data)
    throw new Error(message)
  }

};