type LogItem = {
  timestamp: string;
  level: "general" | "warn" | "error";
  message: string;
  objects: Array<object>;
};

import debugConfig from "#debugConfig";

export default class Logger {
  logData: Array<LogItem> = [];
  printToConsole: boolean = true;
  logEpoch = new Date().valueOf();

  constructor() {}

  getTimestampSinceEpoch(now) {
    // https://stackoverflow.com/questions/13903897/javascript-return-number-of-days-hours-minutes-seconds-between-two-dates
    const diffTime = Math.abs(now - this.logEpoch);
    let days = diffTime / (24 * 60 * 60 * 1000);
    let hours = (days % 1) * 24;
    let minutes = (hours % 1) * 60;
    let secs = (minutes % 1) * 60;
    [days, hours, minutes, secs] = [
      Math.floor(days),
      Math.floor(hours),
      Math.floor(minutes),
      Math.floor(secs),
    ];

    return `${days}d : ${hours}h : ${minutes}m : ${secs}s`;
  }

  #generateLog(item: LogItem) {
    this.logData.push(item);
    if (!this.printToConsole) return;
    if (item.level === "general") {
      console.log(`LOG: [${item.timestamp}] ${item.message}`);
    } else if (item.level === "warn") {
      console.warn(`WRN: [${item.timestamp}] ${item.message}`);
    } else {
      console.error(`ERR: [${item.timestamp}] ${item.message}`);
    }
  }

  log(message: string, objects: Array<object> = []) {
    const timestamp = new Date().valueOf();
    const data: LogItem = {
      timestamp: this.getTimestampSinceEpoch(timestamp),
      level: "general",
      message,
      objects,
    };
    this.#generateLog(data);
  }

  warn(message: string, objects: Array<object> = []) {
    const timestamp = new Date().valueOf();
    const data: LogItem = {
      timestamp: this.getTimestampSinceEpoch(timestamp),
      level: "warn",
      message,
      objects,
    };
    this.#generateLog(data);
  }

  error(message: string, objects: Array<object> = []) {
    const timestamp = new Date().valueOf();
    const data: LogItem = {
      timestamp: this.getTimestampSinceEpoch(timestamp),
      level: "error",
      message,
      objects,
    };
    this.#generateLog(data);
  }

  throwJS3Error(message: string, objects: Array<object> = []) {
    const timestamp = new Date().valueOf();
    const data: LogItem = {
      timestamp: this.getTimestampSinceEpoch(timestamp),
      level: "error",
      message,
      objects,
    };
    this.#generateLog(data);
    if (debugConfig.throwJS3Errors) throw new Error(message);
  }

  throwIriError(message: string, objects: Array<object> = []) {
    const timestamp = new Date().valueOf();
    const data: LogItem = {
      timestamp: this.getTimestampSinceEpoch(timestamp),
      level: "error",
      message,
      objects,
    };
    this.#generateLog(data);
    if (debugConfig.throwIRIErrors) throw new Error(message);
  }
}
