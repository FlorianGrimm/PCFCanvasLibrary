export enum LogLevel {
    debug,

    info,

    warn,

    error,
}
export function convertTextToLogLevel(level: LogLevel | string | null | undefined, defaultValue: LogLevel): LogLevel {
    if (typeof level === "string") {
        if (level === "0" || level === "debug") {
            return LogLevel.debug;
        }
        if (level === "1" || level === "info") {
            return LogLevel.info;
        }
        if (level === "2" || level === "warn") {
            return LogLevel.warn;
        }
        if (level === "3" || level === "error") {
            return LogLevel.error;
        }
    }
    if (typeof level === "number") {
        if (0 <= level && level <= 3) {
            return level;
        }
    }
    return defaultValue;
}