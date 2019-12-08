enum LogLevel {
    DEBUG = 0,
    INFORMATION,
    WARNING,
    ERROR,
}

const logLevel: LogLevel = LogLevel.INFORMATION

/* tslint:disable:no-console */
function print(level: LogLevel, text: string, color: string) {
    console.log(`%c[CLOUDOPT-${LogLevel[level]}]${(new Date()).toLocaleDateString()}:${text}`, `color:${color}`)
}
/* tslint:enable:no-console */

export function debug(text: string) {
    if (logLevel <= LogLevel.DEBUG) {
        print(LogLevel.DEBUG, text, '#00BCD4')
    }
}

export function info(text: string) {
    if (logLevel <= LogLevel.INFORMATION) {
        print(LogLevel.INFORMATION, text, '#3F51B5')
    }
}

export function warning(text: string) {
    if (logLevel <= LogLevel.WARNING) {
        print(LogLevel.WARNING, text, '#E91E63')
    }
}

export function error(text: string) {
    if (logLevel <= LogLevel.ERROR) {
        print(LogLevel.ERROR, text, '#E91E63')
    }
}
