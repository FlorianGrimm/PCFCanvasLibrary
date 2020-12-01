import { ILogger } from ".";
import { LogLevel } from "./LogLevel";
import type { ILogggerTarget } from "./types";

export class LogTargetConsole implements ILogggerTarget {
    con: ILogger;
    constructor(con?: ILogger) {
        this.con = con || console
    }
    log(level: LogLevel, source: string, message?: any, ...optionalParams: any[]) {
        const con = this.con;
        switch (level) {
            case LogLevel.debug:
                con.debug && con.debug(`${source} ${message}`, ...optionalParams);
                return;
            case LogLevel.info:
                con.info && con.info(`${source} ${message}`, ...optionalParams);
                return;
            case LogLevel.warn:
                con.warn && con.warn(`${source} ${message}`, ...optionalParams);
                return;
            case LogLevel.error:
                con.error && con.error(`${source} ${message}`, ...optionalParams);
                return;
        }
    }
}