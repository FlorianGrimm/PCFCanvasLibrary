import type { HotReloadHostTypeDictionary, IHotReloadService } from "./types";
import type { ILogger, ILoggerService } from "../Logging";

import { HotReloadProxyControl } from "./HotReloadProxyControl";
import { HotReloadBundle } from "./HotReloadBundle";
import { getOrAddByKey } from "./utils";
import { getLoggerService } from "../Logging";

export class HotReloadService {
    readonly hotControls: HotReloadProxyControl[];
    readonly typesByUrl: Map<string, HotReloadBundle>;
    logger: ILogger;

    constructor(loggerName?: string, configure?: (loggerService: ILoggerService) => void) {
        this.hotControls = [];
        this.typesByUrl = new Map();
        this.logger = (getLoggerService(configure)?.createLogger(loggerName ?? "PCFUtils")) || console;
    }

    registerTypes<Types extends HotReloadHostTypeDictionary>(url: string, types: Types): HotReloadBundle {
        const [created, result] = getOrAddByKey(
            this.typesByUrl,
            url,
            (u) => new HotReloadBundle(this, url, this.logger));
        for (const name in types) {
            if (Object.prototype.hasOwnProperty.call(types, name)) {
                const type = types[name];
                if (typeof type == "function" && type.prototype) {
                    const activeType = result.registerType(name, type);
                }
            }
        }
        return result;
    }

    // main entry
    enableHotReloadForTypes<Types extends HotReloadHostTypeDictionary>(
        url: string,
        types: Types,
        moduleExports: Types
    ) {
        try {
            this.logger.warn("enableHotReloadForTypes is activated:", url, types);
            const hotRepositoryForUrl = this.registerTypes(url, types);
            hotRepositoryForUrl.enableHotReloadForTypes(types, moduleExports);
        } catch (err) {
            this.logger.error("enableHotReload", err);
        }
    }

    getTypesByUrl(url: string): HotReloadBundle | undefined {
        return this.typesByUrl.get(url);
    }

    addHotControl(hotControl: HotReloadProxyControl) {
        this.hotControls.push(hotControl);
        this.logger.debug("addHotControl", this.hotControls.length);
    }

    removeHotControl(hotControl: HotReloadProxyControl) {
        const idx = this.hotControls.indexOf(hotControl);
        if (0 <= idx) {
            this.hotControls.splice(idx, 1);
        }
        this.logger.debug("removeHotControl", this.hotControls.length);
    }

    foreachHotControl(action: ((hotControl: HotReloadProxyControl) => void)) {
        this.logger.debug("foreachHotControl.enter", this.hotControls.length);
        let idx = 0;
        const oldHotControls = this.hotControls.splice(0, this.hotControls.length);
        while (idx < oldHotControls.length) {
            const hotControl = oldHotControls[idx];
            idx++;
            if (hotControl) {
                try {
                    action(hotControl);
                } catch (error) {
                    this.logger.error(error)
                }
                this.hotControls.push(hotControl);
            }
        }
        this.logger.debug("foreachHotControl.exiting", this.hotControls.length);
    }
}