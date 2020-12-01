import type { ILogger, ILoggerService, ILogggerTarget } from "./types";
import { LogLevel, convertTextToLogLevel } from "./LogLevel";
import { Logger } from "./Logger";
import { LogTargetConsole } from "./LogTargetConsole";

export class LoggerService implements ILoggerService {
    private _loggerConfiguration: Map<string, LogLevel>;
    private _targets: ILogggerTarget[];
    private _LogLevel:LogLevel;

    constructor(logLevel:LogLevel) {
        this._loggerConfiguration = new Map();
        this._targets = [];
        this._LogLevel = logLevel;
    }

    get loggerConfiguration(): Map<string, LogLevel> { return this._loggerConfiguration; }
    set loggerConfiguration(value: Map<string, LogLevel>) {
        value.forEach((level, source) => {
            this._loggerConfiguration.set(source, level);
        });
    }

    get targets(): ILogggerTarget[] { return this._targets; }
    set targets(value: ILogggerTarget[]) {
        if (this._targets.length > 0) {
            this._targets.splice(0, this._targets.length);
        }
        if ((value?.length ?? 0) > 0) {
            this._targets.push(...value);
        }
    }


    configure(configure?: ((loggerService: ILoggerService) => void) | undefined): ILoggerService {
        if (configure) {
            configure(this);
        } else {
            this.targets.push(new LogTargetConsole());
        }
        return this;
    }

    getLogLevel(source: string, fallback: LogLevel): LogLevel {
        return this._loggerConfiguration.get(source) ?? fallback;
    }

    setLogLevel(source: string, level: LogLevel): void {
        this._loggerConfiguration.set(source, level);
    }
    setLogLevelFromString(source: string, level: LogLevel | string | null | undefined):void{
        this.setLogLevel(source, convertTextToLogLevel(level, LogLevel.debug));
    }

    setConfiguration(cfgAsText: string, loggerService: ILoggerService) {
        if (cfgAsText) {
            const obj = JSON.parse(cfgAsText);
            if (obj) {
                for (const source in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, source)) {
                        const level = obj[source];
                        this._loggerConfiguration.set(source, level);
                    }
                }
            }
        }
    }

    getConfigurationAsString(): string {
        const cfg: { [key: string]: LogLevel } = {};
        this._loggerConfiguration.forEach((v, k) => {
            cfg[k] = v;
        })
        return JSON.stringify(cfg);
    }

    log(level: LogLevel, source: string, message?: any, ...optionalParams: any[]) {
        const levelSource = this._loggerConfiguration.get(source) ?? this._loggerConfiguration.get("default") ?? this._LogLevel;
        
        if (level >= levelSource) {
            if (this._targets) {
                this._targets.map((t) => {
                    try {
                        t.log(level, source, message, ...optionalParams);
                    } catch (error) {
                        console.error && console.error(error);
                    }
                })
            }
        }
    }

    createLogger(source: string): ILogger {
        return new Logger(source, this);
    }
}