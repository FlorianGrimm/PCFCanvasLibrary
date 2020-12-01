import type { ILogggerTarget, ILoggerService, ILoggerFactory , ILogger } from "./types";
import { LogLevel } from './LogLevel'
import { LoggerService } from "./LoggerService";

const singletons = {

} as {
    loggerService?: LoggerService | undefined
};

const isRunningOnHarness = (typeof window === "undefined") ? true : (window?.location?.hostname === "127.0.0.1");

function createLoggerService(configure?: (loggerService: ILoggerService) => void): ILoggerService{
    if (isRunningOnHarness){
        return (singletons.loggerService = new LoggerService(LogLevel.warn)).configure(configure);
    } else {
        return (singletons.loggerService = new LoggerService(LogLevel.info)).configure(configure);
    }
}
function getLoggerService(configure?: (loggerService: ILoggerService) => void): ILoggerService {
    return (singletons.loggerService) || createLoggerService(configure);
}

function setLoggerService(value: ILoggerService): ILoggerService {
    return value;
}
export { ILogggerTarget, ILoggerService, ILoggerFactory , ILogger,  LogLevel, getLoggerService, setLoggerService };