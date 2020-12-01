import { HotReloadHostType, HotReloadHost as HotReloadableStandardControl } from "./types";
import { HotReloadControlType } from "./HotReloadControlType";
import type { ILogger } from "../Logging";

/**
 * A proxy that is created instead of the real component.
 */
export class HotReloadProxyControl<IInputs = any, IOutputs = any> implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    info: {
        context?: ComponentFramework.Context<IInputs>;
        notifyOutputChanged?: () => void;
        state?: ComponentFramework.Dictionary;
        container?: HTMLDivElement;
    };

    private _instance: HotReloadableStandardControl<IInputs, IOutputs> | null;
    private _hotReloadControlType: HotReloadControlType | null;
    private _logger: ILogger | null;


    /**
     * attribure to hold the trampolin to the getOutputs of the real control.
     * 
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    getOutputs?: () => IOutputs;

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     * @param hotReloadState the state from getHotReloadState
     */
    hotReload?: (context: ComponentFramework.Context<IInputs>, notifyOutputChanged?: () => void, state?: ComponentFramework.Dictionary, container?: HTMLDivElement, hotReloadState?: any) => void;

    constructor(
        instance: HotReloadableStandardControl<IInputs, IOutputs>,
        hotRepositoryForType: HotReloadControlType,
        logger: ILogger | null
    ) {
        this.info = {};
        this._instance = null;
        this._logger = logger;
        this._hotReloadControlType = hotRepositoryForType;
        //
        this.instance = instance;
    }

    get instance(): HotReloadableStandardControl<IInputs, IOutputs> | null {
        return this._instance;
    }

    set instance(value: HotReloadableStandardControl<IInputs, IOutputs> | null) {
        this._instance = value;
        if (typeof value?.getOutputs === "function") {
            this.getOutputs = () => {
                return this.instance!.getOutputs!();
            }
        } else {
            this.getOutputs = undefined;
        }
        if (typeof value?.hotReload === "function") {
            this.hotReload = (context: ComponentFramework.Context<IInputs>, notifyOutputChanged?: () => void, state?: ComponentFramework.Dictionary, container?: HTMLDivElement, hotReloadState?: any) => {
                this.info = { context, notifyOutputChanged, state, container };
                return this.instance!.hotReload!(context, notifyOutputChanged, state, container, hotReloadState);
            }
        } else {
            this.hotReload = undefined;
        }
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement) {
        this.info = { context, notifyOutputChanged, state, container };
        this.instance?.init(context, notifyOutputChanged, state, container);
    }

    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        this.info.context = context;
        this.instance?.updateView(context);
    }

    /** 
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        this.instance?.destroy();
        this.instance = null;
        this.info = {};
        //
        const hotReloadService = this._hotReloadControlType?.hotReloadBundle?.hotReloadService;
        if (hotReloadService) { hotReloadService.removeHotControl(this); }
    }

    notificationHotReload(fetchedUrl: string) {
        const url = this._hotReloadControlType?.hotReloadBundle.url;
        const container = this.info.container;
        this._logger?.debug("notificationHotReload", fetchedUrl, url);
        if (container && fetchedUrl === url) {
            container.style.border = "1px solid yellow";
            return;
        }
    }
    notificationHotReloaded(fetchedUrl: string) {
        const url = this._hotReloadControlType?.hotReloadBundle.url;
        const container = this.info.container;
        this._logger?.debug("notificationHotReloaded", fetchedUrl, url);
        if (container && fetchedUrl === url) {
            container.style.border = "1px solid red";
            try {
                const instance = this.instance;
                if (instance && (typeof instance.hotReload === "function")) {
                    const typeLatest = this._hotReloadControlType?.type;
                    const type: HotReloadHostType<IInputs, IOutputs> = (this.instance as any).constructor;
                    const { context, notifyOutputChanged, state } = this.info;
                    if (type && typeLatest && type !== typeLatest && context) {
                        const hotReloadState = instance.getHotReloadState && instance.getHotReloadState();
                        const nextInstance = new typeLatest();
                        if (typeof nextInstance.hotReload === "function") {
                            instance.destroy();
                            this.instance = nextInstance;
                            nextInstance.hotReload(context, notifyOutputChanged, state, container, hotReloadState);
                            container.style.border = "";
                        }
                    }
                }
            } catch (error) {
                this._logger?.error("hot reload failed", error);
            }
        }
    }
}