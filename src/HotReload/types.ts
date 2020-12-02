export interface HotReloadHost<IInputs, IOutputs> extends ComponentFramework.StandardControl<IInputs, IOutputs> {
    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     * @param hotReloadState the state from getHotReloadState
     */
    hotReload?(context: ComponentFramework.Context<IInputs>, notifyOutputChanged?: () => void, state?: ComponentFramework.Dictionary, container?: HTMLDivElement, hotReloadState?: any): void;

    /**
     * Called before the control will be destroyed and hotReload-ed.
     */
    getHotReloadState?(): any;
}

/**
 * the extra info for the control.
 */
export interface HotReloadHostType<IInputs = any, IOutputs = any> {
    /**
     * the contructor
     */
    new(): HotReloadHost<IInputs, IOutputs>;

    /**
     * a static attribute for better version handling
     */
    version?: number;

    /**
     * the namespace -- currently not really needed - ignore this for now
     */
    namespace?: string;

    /**
     * the controls name - ignore this - internal used
     */
    name?: string;
}

export type HotReloadHostTypeDictionary = { [name: string]: HotReloadHostType };

export interface IHotReloadService{    
}

/**
 * the window polution is defined here.
 */
export declare var PCFCanvasLibrary: PCFCanvasLibrary | undefined;

export declare type PCFCanvasLibrary = {
    /**
     * the service 
     */
    hotReloadService: IHotReloadService,

    /**
     * enables hot reload for the control for durationHours for this bundle-url.
     * 
     * @param name - the name of your control.
     * @param durationHours - the duration in hours that this control should be active.
     * @param url the url of the bundle.js default is http://127.0.0.1:8181/bundle.js.
     */
    enableHotReload: (name: string, durationHours?: number, url?: string) => void;

    /**
     * diables hot reload for the control.
     * 
     * @param name - the name of your control.
     */
    disableHotReload: (name: string) => void;
};