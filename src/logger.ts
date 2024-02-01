export type LoggerMethod = (...args: any[]) => void;

export type LogLevel = string; // "trace" | "debug" | "info" | "warn" | "error";

const index: Record<LogLevel, Logger> = {};

export type Logger = {
  _name: string;
  _parent: Logger | undefined;
  _children: Logger[];
  _level: LogLevel;
  trace: LoggerMethod;
  debug: LoggerMethod;
  info: LoggerMethod;
  warn: LoggerMethod;
  error: LoggerMethod;
};
const noopLogger: LoggerMethod = () => {};

const emptyLogger: Logger = {
  _name: "",
  _parent: undefined,
  _children: [],
  _level: "debug",

  debug: noopLogger,
  info: noopLogger,
  error: noopLogger,
  warn: noopLogger,
  trace: noopLogger,
};

export const LogLevels: Record<LogLevel, number> = {
  trace: 1,
  debug: 2,
  info: 3,
  warn: 4,
  error: 5,
};

setLogLevel("", "info");

export function getLogger(
  logName: string,
  logLevel: LogLevel = "info",
): Logger {
  const path = logName.split("/");
  if (path[0]) path.unshift("");
  let parentLogger: Logger | undefined;
  let loggerSlot: Logger = { ...emptyLogger };
  for (let i = 0; i < path.length; i++) {
    const key = (path.slice(0, i + 1) || []).join("/");
    loggerSlot = index[key] =
      index[key] || _newLogger(parentLogger, key, logLevel);
    parentLogger = loggerSlot;
  }
  _setLogLevel(loggerSlot, logLevel);
  return loggerSlot;
}

export function setLogLevel(logName: string, logLevel: LogLevel) {
  getLogger(logName, logLevel);
}

function _setLogLevel(logger: Logger, level: LogLevel) {
  logger._level = level;
  updateMethods(logger);
  function updateMethods(logger: Logger) {
    _setLoggerMethods(logger, level);
    for (const child of logger._children) {
      updateMethods(child);
    }
  }
}

function _setLoggerMethods(loggerSlot: Logger, level: LogLevel) {
  for (
    let parent = loggerSlot._parent;
    parent && level === undefined;
    parent = parent._parent
  ) {
    level = parent._level;
  }
  const newPrinter = (levelName: string) => {
    const methodName = levelName === "debug" ? "log" : levelName;
    const prefix: string = `[${loggerSlot._name}:${levelName.toUpperCase()}]`;
    const method = (console as any)[methodName];
    return Function.prototype.bind.call(method, console, prefix);
  };
  const noop: LoggerMethod = () => {};
  const entries = Object.entries(LogLevels);
  const newLevelCode = (entries.find(([name]) => name === level) || ["", 0])[1];

  for (const [levelName, levelCode] of entries) {
    const logger: LoggerMethod =
      newLevelCode <= levelCode ? newPrinter(levelName) : noop;
    (loggerSlot as any)[levelName] = logger;
  }
}

function _newLogger(
  parent: Logger | undefined,
  logName: string,
  level: LogLevel,
): Logger {
  const logger: Logger = {
    ...emptyLogger,
    _name: logName,
    _children: [],
  };
  if (parent) parent._children.push(logger);
  _setLoggerMethods(logger, level);
  return logger;
}
