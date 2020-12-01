import type * as React from "react";
//import React = require("react");

import type { ITriggerEvent, Unsubscribe, TriggerProperty, ITriggerProperty} from "../Triggers";


export type StateTriggerUpdateViewHost = {
    triggerUpdateView: ITriggerProperty<boolean>;
}

export type TriggerUpdateViewProps = {
    getState: (() => StateTriggerUpdateViewHost);
}
export type TriggerUpdateViewState = {
    tickUpdateView: number;
}

export type TriggerUpdateViewReactComponent<P extends TriggerUpdateViewProps, S extends TriggerUpdateViewState>
    = React.Component<P, S>
    & {
        tickUpdateView: number;
    };

export function wireTriggerUpdateView<P extends TriggerUpdateViewProps, S extends TriggerUpdateViewState>(
    that: TriggerUpdateViewReactComponent<P, S>,
    props: TriggerUpdateViewProps
): Unsubscribe {
    const triggerUpdateView = props.getState().triggerUpdateView;
    const updateView = () => {
        //console.info("updateView", triggerUpdateView.value, that.state.tickUpdateView == that.tickUpdateView);
        if (triggerUpdateView.value && that.state.tickUpdateView == that.tickUpdateView){
            that.tickUpdateView--;
            const nextTick=(that.state.tickUpdateView % 1000) + 1;
            //console.info("setState", nextTick);
            that.setState({ tickUpdateView: nextTick });
        }
    };
    return props.getState().triggerUpdateView.subscribe(updateView);
} 
