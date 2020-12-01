import type { ILogger } from "../Logging";

import type { CallbackHandler, ITriggerEvent, Resume, Unsubscribe } from "./types";

function unsubscribeEmpty() { return; }

export class TriggerEvent<E = any> implements ITriggerEvent<E> {
    name: string;
    cbhs: CallbackHandler<E>[];
    paused: number;
    lastEvent: { sender: any, evt: E } | null;
    logger:ILogger|null;

    constructor(name: string, logger?:ILogger) {
        this.name = name;
        this.cbhs = [];
        this.paused = 0;
        this.lastEvent = null;
        this.logger = logger || null;
    }

    subscribe(cbh: CallbackHandler<E>): Unsubscribe {
        if (cbh) {
            this.cbhs.push(cbh);
            return () => { this.unsubscribe(cbh);  }
        } else {
            return unsubscribeEmpty;
        }
    }

    unsubscribe(cbh: CallbackHandler<E>): void {
        const idx = this.cbhs.indexOf(cbh);
        if (0<=idx){
            this.cbhs.splice(idx, 1);
        }
        
    }

    trigger(sender: any, evt: E): void {
        const cbhs = this.cbhs;
        if (cbhs.length > 0) {
            if (this.paused == 0) {
                this.logger?.info("TriggerEvent", this.name);
                let idx = 0;
                while (idx < cbhs.length) {
                    const cbh = cbhs[idx];
                    let result: void | boolean = false;
                    try {
                        result = cbh(evt, sender);
                    } catch (error) {
                        this.logger?.error("trigger", error);
                        throw error;
                    }
                    if (result === true) {
                        cbhs.splice(idx, 1);
                    } else {
                        idx++;
                    }
                }
            } else {
                this.lastEvent = { sender: sender, evt: evt };
            }
        }
    }

    dispose() {
        if (0 < this.cbhs.length) {
            this.cbhs.splice(0, this.cbhs.length)
        }
    }

    pause(): Resume {
        this.paused++;
        return () => {
            this.paused--;
            if (this.paused == 0) {
                const lastEvent = this.lastEvent;
                if (lastEvent) {
                    this.lastEvent = null;
                    this.trigger(lastEvent.sender, lastEvent.evt);
                }
            }
        };
    }

    block(action: () => void): void {
        const resume = this.pause();
        try {
            action();
        } finally {
            resume();
        }
    }
}