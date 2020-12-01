import type { HotReloadHost, HotReloadHostType, HotReloadHostTypeDictionary, PCFCanvasLibrary } from "./types";
import { HotReloadService } from "./HotReloadService";
import { ILoggerService } from "../Logging/types";
import { LogLevel } from "../Logging/LogLevel";

export function enableHotReloadForTypes<Types extends HotReloadHostTypeDictionary>(
    isHotReloadAllowed: boolean,
    name: string,
    types: Types,
    moduleExports: any,
    configure?: (loggerService: ILoggerService) => void
): void {
    const keyEnabled = `HotReload#${name}#enabled`;
    const keyUrl = `HotReload#${name}#Url`;
    const keyUntil = `HotReload#${name}#Until`


    const isEnabled = (isHotReloadAllowed) ? (window.localStorage.getItem(keyEnabled) === "On") : false;
    const url = (isEnabled) ? window.localStorage.getItem(keyUrl) : null;
    const isBeforeUntil = (isEnabled && url) && (new Date()).getTime() < (1+((isEnabled && url) ? Number.parseInt(window.localStorage.getItem(keyUntil) || "0", 10) : 0));


    if (isEnabled) {        
        console.info("hotreload config", "keyEnabled", keyEnabled, isEnabled, "keyUrl", keyUrl, url, "isBeforeUntil", isBeforeUntil);
    }
    if (isEnabled && url && isBeforeUntil) {
        if (!configure) {
            configure = (loggerService: ILoggerService) => {
                const keyLogger = `HotReload#${name}#Logger`;
                const logLevel = window.localStorage.getItem(keyLogger);
                loggerService.setLogLevelFromString(name, logLevel ?? LogLevel.debug);
            }
        }
        getHotReloadService(name, configure).enableHotReloadForTypes(url, types, moduleExports);
    } else {
        Object.defineProperty(moduleExports, "__esModule", { value: true });
        for (const key in types) {
            Object.defineProperty(moduleExports, key, { enumerable: true, value: (types as any)[key] });
        }
    }
}

function enableHotReload(name: string, durationHours?: number, url?: string) {
    window.localStorage.setItem(`HotReload#${name}#enabled`, "On");
    window.localStorage.setItem(`HotReload#${name}#Url`, url || "http://127.0.0.1:8181/bundle.js");
    window.localStorage.setItem(`HotReload#${name}#Until`, (new Date().getTime() + (durationHours || 0) * 3600000).toString());

}
function disableHotReload(name: string) {
    window.localStorage.setItem(`HotReload#${name}#enabled`, "Off");
}

export function getHotReloadService(name?: string, configure?: (loggerService: ILoggerService) => void): HotReloadService {
    const root = window as Partial<{
        PCFCanvasLibrary: Partial<PCFCanvasLibrary>
    }>;
    const lib = (root.PCFCanvasLibrary) || (root.PCFCanvasLibrary = {});
    if (lib.HotReloadService){return lib.HotReloadService;}
    
    lib.HotReloadService = new HotReloadService(name, configure);
    lib.enableHotReload=enableHotReload;
    lib.disableHotReload=disableHotReload;
    return lib.HotReloadService;
}

export {
    HotReloadHost,
    HotReloadHostType as HotReloadHostConstructor
}
