import type { ITriggerEvent, Unsubscribe } from "../Triggers";
import type { ControlSize } from "./types";


export interface TriggerUpdateControlSize {
    triggerUpdateSize: ITriggerEvent<ControlSize>;
}
export type TriggerUpdateControlSizeProps = {
    getTriggers: (() => TriggerUpdateControlSize);
}
export type TriggerUpdateControlSizeState = {
    controlSize: ControlSize;
}
export type TriggerUpdateControlSizeReactComponent<P extends TriggerUpdateControlSizeProps, S extends TriggerUpdateControlSizeState>
    = React.Component<P, S>
    & {
        controlSize: ControlSize;
    };


export function isEqualControlSize(a: ControlSize, b: ControlSize): boolean {
    return ((a.width || 0) === (b.width || 0)) 
        && ((a.height || 0) === (b.height || 0)) ;

}
export function calcControlSize(controlSizeCurrent: ControlSize, controlSizeNew: ControlSize): [boolean, ControlSize] {
    var isEqual = true;
    let { width: widthCurrent, height: heightCurrent } = controlSizeCurrent;
    let { width: widthNew, height: heightNew } = controlSizeNew;

    if (widthNew && (widthNew || 0) != (widthCurrent || 0)) {
        widthCurrent = widthNew;
        isEqual = false;
    }
    if (heightNew && (heightNew || 0) != (heightCurrent || 0)) {
        heightCurrent = heightNew;
        isEqual = false;
    }
    const result = { width: widthCurrent, height: heightCurrent };
debugger;
    return [isEqual, result];
}
export function wireTriggerUpdateSize<P extends TriggerUpdateControlSizeProps, S extends TriggerUpdateControlSizeState>(
    that: TriggerUpdateControlSizeReactComponent<P, S>,
    props: TriggerUpdateControlSizeProps
): Unsubscribe {
    const triggerUpdateSize = (sender: any, controlSize: ControlSize) => {
        const r = calcControlSize(that.state.controlSize, controlSize);
        if (!r[0]) {
            that.setState({ controlSize: r[1] });
        }
    };
    return props.getTriggers().triggerUpdateSize.subscribe(triggerUpdateSize);
}

export function getControlAllocatedSize<IInputs = any>(context: ComponentFramework.Context<IInputs>): ControlSize {
    const width = context.mode.allocatedWidth == -1 ? undefined : context.mode.allocatedWidth;
    const height = context.mode.allocatedHeight == -1 ? undefined : context.mode.allocatedHeight;
    const controlSize: ControlSize = { width, height };
    return controlSize;
}