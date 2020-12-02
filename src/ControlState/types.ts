// <reference path="./../../node_modules/@types/powerapps-component-framework/componentframework.d.ts" />

export type PCFState<IInputs, IOutputs>={
	notifyOutputChanged: (() => void) | null;
	state: ComponentFramework.Dictionary | null;
	container: HTMLDivElement | null;
    context: ComponentFramework.Context<IInputs> | null;
//    outputs:IOutputs;
}

// export type PropertyRawType<T extends Property> =
//     T extends ComponentFramework.PropertyTypes.DecimalNumberProperty ? (number | null) :
//     T extends ComponentFramework.PropertyTypes.FloatingNumberProperty ? (number | null) :
//     T extends ComponentFramework.PropertyTypes.WholeNumberProperty ? (number | null) :
//     T extends ComponentFramework.PropertyTypes.NumberProperty ? (number | null) :
//     T extends ComponentFramework.PropertyTypes.DateTimeProperty ? (Date | null) :
//     T extends ComponentFramework.PropertyTypes.StringProperty ? (string | null) :
//     T extends ComponentFramework.PropertyTypes.EnumProperty<EnumType=any> ? (EnumType) :
//     T extends ComponentFramework.PropertyTypes.OptionSetProperty ? number :
//     T extends ComponentFramework.PropertyTypes.MultiSelectOptionSetProperty ? (number[] | null) :
//     T extends ComponentFramework.PropertyTypes.TwoOptionsProperty ? (boolean) :
//     never;

export type UpdateContextCaller = "init" | "updateView1st" | "updateView" | "hotReload";

export type UpdateContextStateIncoming = {
    isInit: boolean;
    isUpdateView: boolean;
    isUpdateView1st: boolean;
    isReload: boolean;
    noUpdatedProperties: boolean;
    dctUpdatedProperties: UpdateContextUpdatedProperties;
};
export type UpdateContextStateDerived = UpdateContextStateIncoming & {
    updateView: boolean;
    layoutChanged: boolean;
    parametersChanged: boolean;
    entityIdChanged: boolean;
    datasetChanged: string[]
};
export type UpdateContextUpdatedProperties = { [updatedProperty: string]: boolean; };

export type ControlSize = {
    width?: number | undefined,
    height?: number | undefined
};
