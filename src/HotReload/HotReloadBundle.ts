import { HotReloadControlType } from "./HotReloadControlType";
import { HotReloadHostType, HotReloadHostTypeDictionary } from "./types";
import { getOrAddByKey } from "./utils";
import type { ILogger } from "../Logging";
import { HotReloadService } from "./HotReloadService";

export class HotReloadBundle {
    reloadGuard: number;
    readonly url: string;
    readonly typesByExportName: Map<string, HotReloadControlType>;
    readonly hotReloadService:HotReloadService;
    readonly logger: ILogger;
    socket: WebSocket | null;

    constructor(hotReloadService:HotReloadService,url: string, logger: ILogger) {
        this.hotReloadService = hotReloadService;
        this.url = url;
        this.typesByExportName = new Map();
        this.logger = logger;
        this.reloadGuard = 0;
        this.socket = null;
    }

    registerType<IInputs, IOutputs>(
        exportName: string,
        type: HotReloadHostType<IInputs, IOutputs>
    ): [boolean, HotReloadControlType<IInputs, IOutputs>] {
        const result = getOrAddByKey(
            this.typesByExportName,
            exportName,
            () => new HotReloadControlType<IInputs, IOutputs>(this, exportName, type, this.logger),
            (en, instance) => instance.update(type)
        );
        return result;
    }

    enableHotReloadForTypes<Types extends HotReloadHostTypeDictionary>(
        types: Types,
        moduleExports: Types
    ) {
        if (this.reloadGuard === 0) {
            this.logger.debug("enableHotReload within normal load.", this.url, Object.keys(types));
            if (this.url) {
                try {
                    const jsTxt = this.getFromLocalStorage();
                    this.evaluateBundleHotReload(jsTxt);
                } catch (error) {
                }
                this.fetchBundle()
                this.startWatch();
            }
        }
        for (const exportName in types) {
            if (Object.prototype.hasOwnProperty.call(types, exportName)) {
                const type = types[exportName];
                if (typeof type == "function" && type.prototype) {
                    const hotRepositoryForType = this.getByExportName(exportName);
                    if (hotRepositoryForType) {
                        hotRepositoryForType.setModuleExport(moduleExports, type);
                        continue;
                    }
                }
            }
        }
    }

    getFromLocalStorage(): string {
        try {
            const keyLocalStorage = `HotReload#Bundle#${this.url}`;
            const jsTxt = window.localStorage.getItem(keyLocalStorage);
            return jsTxt || "";
        } catch (error) {
            return "";
        }
    }

    guardReloadBundle(guard: number, block: number, action: () => void): boolean {
        if (this.reloadGuard === guard) {
            this.reloadGuard = block;
            try {
                action();
            } finally {
                this.reloadGuard = guard;
            }
            return true;
        } else {
            return false;
        }
    }

    getByExportName(name: string) {
        return this.typesByExportName.get(name);
    }

    startWatch() {
        let socket = this.socket;
        if (socket === null) {
            const r = /(https?\:)(\/\/[^:/]+)((\:[0-9]+)?)(.*)/;
            const m = r.exec(this.url);
            const address = (m && m.length>3)
                ? ((m[1] === "http:") ? "ws:" : "wss:") + m[2] + m[3] + "/ws"
                : "";
            if (address) {
                this.logger.debug("start socket", address)
                socket = this.socket = new WebSocket(address);
                socket.onmessage = (msg: MessageEvent) => {
                    if (msg.data == 'reload') {
                        this.fetchAndApply();
                    }
                };
                socket.onclose = (ev: CloseEvent) => {
                    this.socket = null;
                    if (window?.setTimeout) {
                        window.setTimeout(()=>{ this.startWatch() }, 10000);
                    }
                };
                socket.onerror = (ev: Event) => {
                    this.socket = null;
                    socket?.close();
                };
            }
        }
    }
    fetchAndApply() {
        this.hotReloadService.foreachHotControl((hotControl) => { 
            hotControl.notificationHotReload(this.url); 
        });
        this.fetchBundle().then((jsData) => {
            this.logger.debug('hot reload bundle fetched.');
            if (this.evaluateBundleHotReload(jsData)) {
                this.hotReloadService.foreachHotControl((hotControl) => {
                    hotControl.notificationHotReloaded(this.url);
                });
            }
        });
    }
    fetchBundle(): Promise<string> {
        return fetch(this.url, { mode: "cors", cache: "no-cache" })
            .then((response) => {
                if (response.status == 200) {
                    this.logger.debug(`Hot ${this.url} download OK Status:${response.status}`);
                    return response.text();
                } else {
                    this.logger.debug(`Hot ${this.url} download ?? Status:${response.status}`);
                    return "";
                }
            }, (reason) => {
                this.logger.debug(`Hot ${this.url} Error: ${reason}`);
                return "";
            }).then(data => {
                if (data) {
                    this.logger.debug(`Hot ${this.url} downloaded`);
                    const keyLocalStorage = `HotReload#Bundle#${this.url}`;
                    let oldData = "";
                    try {
                        oldData = window.localStorage.getItem(keyLocalStorage) || "";
                    } catch (error) {
                    }
                    if (oldData == data) {
                        return "";
                    } else {
                        window.localStorage.setItem(keyLocalStorage, data);
                        return data;
                    }
                } else {
                    this.logger.debug(`Hot ${this.url} downloaded no data.`);
                    return "";
                }
            });
    }
    evaluateBundleHotReload(jsData: string) {
        if (jsData) {
            this.guardReloadBundle(0, 1, () => {
                try {
                    this.logger.debug(`Hot reload ${this.url} evaluateBundleHotReload enter.`);
                    // the new bundle.js is evaluated now
                    this.typesByExportName.forEach((value)=>{
                        value.version=-1;
                    });
                    (new Function(jsData))();
                    this.logger.debug(`Hot reload ${this.url} evaluateBundleHotReload exit.`);
                } catch (error) {
                    this.logger.error(`Hot reload ${this.url} evaluateBundleHotReload error.`, error);
                    return;
                }
            });
            this.logger.info("evaluateBundleHotReload", true);
            return true;
        } else {
            this.logger.info("evaluateBundleHotReload", false);
            return false;
        }
    }
}