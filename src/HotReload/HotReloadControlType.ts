import { HotReloadBundle } from "./HotReloadBundle";
import { HotReloadHostType as HotReloadableStandardControlType } from "./types";
import { HotReloadProxyControl } from "./HotReloadProxyControl";
import type { ILogger } from "../Logging";

// HotRepositoryForType
// HotReloadControlType
export class HotReloadControlType<IInputs = any, IOutputs = any> {
    hotReloadBundle: HotReloadBundle;
    exportName: string;
    type: HotReloadableStandardControlType<IInputs, IOutputs>;
    hostControlType: HotReloadableStandardControlType<IInputs, IOutputs>;
    name: string;
    namespace: string;
    version: number;
    logger: ILogger;

    constructor(
        hotRepositoryForUrl: HotReloadBundle,
        exportName: string,
        type: HotReloadableStandardControlType<IInputs, IOutputs>,
        logger: ILogger) {
        this.hotReloadBundle = hotRepositoryForUrl;
        this.exportName = exportName;
        this.type = type;
        this.name = type.name || "";
        this.namespace = type.namespace || "";
        this.version = type.version || 0;
        this.logger = logger;
        this.hostControlType = this.generateProxyControlForType(type);
    }

    update(nextType: HotReloadableStandardControlType<IInputs, IOutputs>): HotReloadableStandardControlType<IInputs, IOutputs> {
        if ((this.hotReloadBundle.reloadGuard === 1 && nextType)
            || (this.type && nextType && this.version < (nextType.version || 0))) {
            this.type = nextType;
            this.hostControlType = this.generateProxyControlForType(nextType);
            this.version = (nextType.version || 0);
            return nextType;
        } else {
            return this.type;
        }
    }

    generateProxyControlForType<IInputs, IOutputs>(
        type: HotReloadableStandardControlType<IInputs, IOutputs>
    ) {
        const hotRepositoryForType: HotReloadControlType = this;
        const logger = this.logger;
        const result = function (this: any) {
            const resultType = (hotRepositoryForType.type) || type;
            const instance = new (resultType as any)();
            const proxyControl = (HotReloadProxyControl as any).apply(this, [instance, hotRepositoryForType, logger]) || this;
            const hotReloadService = hotRepositoryForType.hotReloadBundle.hotReloadService;
            if (hotReloadService) { hotReloadService.addHotControl(proxyControl); }
            return proxyControl;
        } as any;
        Object.defineProperty(result, "name", { value: type.name });
        Object.defineProperty(result, "namespace", { value: type.namespace });
        Object.defineProperty(result, "version", { value: type.version });
        function __(this: object) { this.constructor = result; }
        __.prototype = HotReloadProxyControl.prototype;
        result.prototype = new (__ as any)();

        return result as HotReloadableStandardControlType<IInputs, IOutputs>;
    }

    setModuleExport<IInputs, IOutputs>(
        moduleExports: object,
        type: HotReloadableStandardControlType<IInputs, IOutputs>
    ) {
        //const c = this.generateHotReloadHostType(type);
        const hotRepositoryForType: HotReloadControlType = this;
        Object.defineProperty(moduleExports, this.exportName, {
            enumerable: true,
            get: function get() {
                return hotRepositoryForType.hostControlType || type;
            }
        });
    }
}