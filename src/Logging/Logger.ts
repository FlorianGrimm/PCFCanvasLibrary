import { LogLevel } from "./LogLevel";
import type { ILogger, ILoggerService } from "./types";

/*
export function createLogger(source: string, loggerService: ILoggerService) {
    return {
        debug: (message?: any, ...optionalParams: any[]) => {
            loggerService.log(LogLevel.debug, source, message, ...optionalParams);
        },

        info: (message?: any, ...optionalParams: any[])=> {
            loggerService.log(LogLevel.info, source, message, ...optionalParams);
        },
    
        warn: (message?: any, ...optionalParams: any[])=> {
            loggerService.log(LogLevel.warn, source, message, ...optionalParams);
        },
    
        error: (message?: any, ...optionalParams: any[])=> {
            loggerService.log(LogLevel.error, source, message, ...optionalParams);
        },

        createLogger: (source:string) =>{
            return loggerService.createLogger(source);
        }    
    };
}
*/
export class Logger implements ILogger {
    constructor(
        private source: string,
        private loggerService: ILoggerService) {
    }

    debug(message?: any, ...optionalParams: any[]): void {
        this.loggerService.log(LogLevel.debug, this.source, message, ...optionalParams);
    }

    info(message?: any, ...optionalParams: any[]): void {
        this.loggerService.log(LogLevel.info, this.source, message, ...optionalParams);
    }

    warn(message?: any, ...optionalParams: any[]): void {
        this.loggerService.log(LogLevel.warn, this.source, message, ...optionalParams);
    }

    error(message?: any, ...optionalParams: any[]): void {
        this.loggerService.log(LogLevel.error, this.source, message, ...optionalParams);
    }

    createLogger(source:string) :ILogger {
        return this.loggerService.createLogger(source);
    }
}
