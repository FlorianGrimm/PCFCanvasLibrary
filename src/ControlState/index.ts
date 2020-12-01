import type {
    PCFState,
    UpdateContextCaller,
    UpdateContextStateIncoming,
    UpdateContextStateDerived,
    UpdateContextUpdatedProperties
} from "./types";

import type { ILogger } from "../Logging";
import type { TriggerProperty } from "../Triggers";


export {
    PCFState,
    UpdateContextCaller,
    UpdateContextStateIncoming,
    UpdateContextStateDerived,
    UpdateContextUpdatedProperties
};

const isRunningOnHarness = (typeof window === "undefined") ? true : (window?.location?.hostname === "127.0.0.1");

export function emptyPCFState<IInputs, IOutputs>(): PCFState<IInputs, IOutputs> {
    return {
        notifyOutputChanged: null,
        state: null,
        container: null,
        context: null
    };
}
export function initPCFState<IInputs, IOutputs>(pcfState: PCFState<IInputs, IOutputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement,) {
    pcfState.notifyOutputChanged = notifyOutputChanged || null;
    pcfState.state = state || null;
    pcfState.container = container;
}

export function updateContextInit<IInputs, T>(
    context: ComponentFramework.Context<IInputs>,
    mode: UpdateContextCaller,
    state: (T & Partial<UpdateContextStateIncoming>)): UpdateContextStateDerived & T {
    const isInit = mode === "init";
    const isUpdateView1st = mode === "updateView1st";
    const isUpdateView = mode === "updateView" || mode === "updateView1st";
    const isReload = mode === "hotReload";

    const updatedProperties: string[] = [];
    updatedProperties.push(...context.updatedProperties);
    const noUpdatedProperties = (!updatedProperties || updatedProperties.length === 0);

    state.isInit = isInit;
    state.isUpdateView1st = isUpdateView1st;
    state.isUpdateView = isUpdateView;
    state.isReload = isReload;
    state.noUpdatedProperties = noUpdatedProperties;
    const stateNSP: Partial<UpdateContextStateDerived> = state;

    stateNSP.updateView = false;
    stateNSP.layoutChanged = false;
    stateNSP.parametersChanged = false;
    stateNSP.entityIdChanged = false;
    stateNSP.datasetChanged = [];

    const dctUpdatedProperties: UpdateContextUpdatedProperties = {};
    updatedProperties.forEach((p) => { dctUpdatedProperties[p] = true; });
    stateNSP.dctUpdatedProperties = dctUpdatedProperties;

    const nextSteps = state as UpdateContextStateDerived & T;
    if (dctUpdatedProperties["layout"] || isInit || isReload) {
        dctUpdatedProperties["layout"] = false;
        nextSteps.layoutChanged = true;
    }
    if (dctUpdatedProperties["viewportSizeMode"]) {
        dctUpdatedProperties["viewportSizeMode"] = false;
        nextSteps.layoutChanged = true;
    }
    if (dctUpdatedProperties["parameters"] || isInit || isReload) {
        dctUpdatedProperties["parameters"] = false;
        nextSteps.parametersChanged = true;
    }
    if (dctUpdatedProperties["entityId"]) {
        dctUpdatedProperties["entityId"] = false;
        nextSteps.entityIdChanged = true;
    }
    if (dctUpdatedProperties["fullscreen_open"]) {
        dctUpdatedProperties["fullscreen_open"] = false;
        nextSteps.layoutChanged = true;
    }
    if (dctUpdatedProperties["fullscreen_close"]) {
        dctUpdatedProperties["fullscreen_close"] = false;
        nextSteps.layoutChanged = true;
    }
    if (dctUpdatedProperties["IsControlDisabled"]) {
        dctUpdatedProperties["IsControlDisabled"] = false;
        nextSteps.layoutChanged = true;
    }

    return nextSteps;
}

export function transferParameters<
    N extends Extract<keyof C, keyof S>,
    C extends { [Name in keyof C extends keyof S ? string : never]: ComponentFramework.PropertyTypes.Property },
    S extends { [Name in keyof S extends keyof C ? string : never]: TriggerProperty<any> }
>(
    names: N[] | null,
    contextParameters: C,
    stateProperties: S,
    setAction?: (contextParameter: ComponentFramework.PropertyTypes.Property, stateProperty: TriggerProperty<any>) => void,
    logger?: ILogger
): void {
    if (names === null) {
        names = [];
        for (const name in stateProperties) {
            if (typeof name === "string") {
                if (Object.prototype.hasOwnProperty.call(stateProperties, name)) {
                    names.push(name as unknown as N);
                }
            }
        }
        logger?.debug("transferParameters names", names);
    }

    for (let idx = 0; idx < names.length; idx++) {
        let name = names[idx];
        const contextParameter = contextParameters[name];// as ComponentFramework.PropertyTypes.Property;
        const stateProperty = stateProperties[name];// as TriggerProperty<any>;
        if (contextParameter && stateProperty) {
            let sourceValue = contextParameter.raw;
            if (isRunningOnHarness) {
                if (sourceValue === "val") {
                    continue;
                }
            }
            if (setAction) {
                setAction(contextParameter, stateProperty);
            } else {
                logger?.debug("transferParameters", name, stateProperty.value, sourceValue);
                stateProperty.value = sourceValue;
            }
        }
    }
}