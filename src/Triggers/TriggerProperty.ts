import type { ILogger } from "../Logging";

import type {
    CallbackHandler,
    ITriggerEvent,
    ITriggerProperty,
    Resume,
    Unsubscribe
} from "./types";

function unsubscribeEmpty() { return; }

function fallbackIsEqual<T>(a: T, b: T) { return a === b; }
function fallbackNormalize<T>(value: T) { return value; }
const fallbackLogger = {
    debug: (message?: any, ...optionalParams: any[]) => { },
    info: (message?: any, ...optionalParams: any[]) => { },
    warn: (message?: any, ...optionalParams: any[]) => { },
    error: (message?: any, ...optionalParams: any[]) => { }
}

export class TriggerProperty<T = any> implements ITriggerEvent<T> {
    name: string;
    cbhs: CallbackHandler<T>[];
    hasChanged: boolean;
    isTriggerPending: boolean;
    isPaused: number;
    internalValue: T;
    isEqual: ((a: T, b: T) => (boolean | [boolean, T]));
    normalize: (newValue: T, oldValue:T) => T;
    logger: ILogger;

    constructor(
        name: string,
        value: T,
        isEqual: ((a: T, b: T) => (boolean | [boolean, T])) | undefined | null,
        normalize: ((newValue: T, oldValue:T) => T) | undefined | null,
        logger: ILogger | undefined | null
    ) {
        this.name = name;
        this.cbhs = [];
        this.hasChanged = false;
        this.isPaused = 0;
        this.isTriggerPending = false;
        this.internalValue = value;
        this.isEqual = isEqual || fallbackIsEqual;
        this.normalize = normalize || fallbackNormalize;
        this.logger = logger || fallbackLogger;
    }

    get value(): T {
        return this.internalValue;
    }

    set value(value: T) {
        let nextValue=(this.normalize)?this.normalize(value, this.internalValue):value;
        let isEq = false;
        if (this.isEqual === null) {
            isEq = (this.internalValue === nextValue);
        } else {
            const e = this.isEqual(this.internalValue, nextValue);
            if (typeof e === "boolean") {
                isEq = e;
            } else {
                [isEq, nextValue] = e;
            }
        }
        if (isEq) {
            // this.logger.info("set value same value", this.name, v);
            return;
        } else {
            const oldValue = this.internalValue;
            this.internalValue = nextValue;
            this.hasChanged = true;
            this.isTriggerPending = true;

            if (this.isPaused === 0) {
                this.logger.info("set new value trigger", this.name, "old:", oldValue, "new:", nextValue);
                this.internalTrigger(this, nextValue);
            } else {
                this.logger.info("set new value paused", this.name, "old:", oldValue, "new:", nextValue);
            }
        }
    }

    getNoMoreTriggeredValue(): T {
        this.isTriggerPending = false;
        return this.value;
    }
    getNoMoreChangedValue(): T {
        this.hasChanged = false;
        return this.value;
    }

    subscribe(cbh: CallbackHandler<T>): Unsubscribe {
        if (cbh) {
            this.cbhs.push(cbh);
            return () => { this.unsubscribe(cbh); }
        } else {
            return unsubscribeEmpty;
        }
    }

    unsubscribe(cbh: CallbackHandler<T>): void {
        const idx = this.cbhs.indexOf(cbh);
        this.cbhs.splice(idx, 1);
    }
    trigger(sender: any, v: T): void {
        let isEq = false;
        if (this.isEqual === null) {
            isEq = (this.internalValue === v);
        } else {
            const e = this.isEqual(this.internalValue, v);
            if (typeof e === "boolean") {
                isEq = e;
            } else {
                [isEq, v] = e;
            }
        }
        this.internalValue = v;
        if (!isEq) {
            this.hasChanged = true;
        }
        //
        this.internalTrigger(sender, v);
    }

    internalTrigger(sender: any, v: T): void {
        const cbhs = this.cbhs;
        if (cbhs.length > 0) {
            if (this.isPaused == 0) {
                for (let watchdog = 0; (watchdog === 0) || (this.isTriggerPending && watchdog < 10); watchdog++) {
                    if (watchdog === 9) {
                        throw new Error("endless triggers");
                    } else if (watchdog > 0) {
                        this.logger.info("looping trigger", this.name);
                    }
                    this.isTriggerPending = false;
                    this.isPaused++;
                    try {
                        let idx = 0;
                        while (idx < cbhs.length) {
                            const cbh = cbhs[idx];
                            let result: void | boolean = false;
                            try {
                                result = cbh(v, sender);
                            } catch (error) {
                                this.logger.error(error);
                                throw error;
                            }
                            if (result === true) {
                                cbhs.splice(idx, 1);
                            } else {
                                idx++;
                            }
                        }
                    } finally {
                        this.isPaused--;
                    }
                }
            } else {
                // paused
                this.isTriggerPending = true;
            }
        }
    }

    dispose() {
        if (0 < this.cbhs.length) {
            this.cbhs.splice(0, this.cbhs.length)
        }
    }

    pause(): Resume {
        this.isPaused++;
        var once = true;
        const result = () => {
            if (once) {
                once = false;
                this.isPaused--;
                if (this.isPaused == 0) {
                    if (this.isTriggerPending) {
                        this.logger.info("resume triggers", this.name);
                        this.internalTrigger(this, this.value);
                    } else {
                        // this.logger.info("resume silence", this.name);
                    }
                }
            }
        }
        return result;
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


export function createWrapProperty<T = any>(property: TriggerProperty<T>): ITriggerProperty<T> {
    const that = {};
    Object.defineProperty(that, "value", {
        get: function () { return property.value; },
        set: function (value) { property.value = value; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(that, "internalValue", {
        get: function () { return property.internalValue; },
        set: function (value) { property.internalValue = value; },
        enumerable: false,
        configurable: true
    });
    // ITriggerEvent
    Object.defineProperty(that, "subscribe", {
        //value: property.subscribe.bind(property),
        get: function () {
            return property.subscribe.bind(property);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(that, "unsubscribe", {
        //value: property.unsubscribe.bind(property),
        get: function () { return property.unsubscribe.bind(property); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(that, "trigger", {
        //value: property.trigger.bind(property),
        get: function () { return property.trigger.bind(property); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(that, "pause", {
        //value: property.pause.bind(property),
        get: function () { return property.pause.bind(property); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(that, "block", {
        //value: property.block.bind(property),
        get: function () { return property.block.bind(property); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(that, "dispose", {
        //value: property.dispose.bind(property),
        get: function () { return property.dispose.bind(property); },
        enumerable: false,
        configurable: true
    });
    return that as ITriggerProperty<T>;
}

export function createWrapProperty2<T = any>(property: TriggerProperty<T>): ITriggerProperty<T> {
    return (new WrapProperty<T>(property)) as ITriggerProperty<T>;
}
export class WrapProperty<T = any> {
    constructor(property: TriggerProperty<T>) {
        // ITriggerProperty
        Object.defineProperty(this, "value", {
            get: function () { return property.value; },
            set: function (value) { property.value = value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(this, "internalValue", {
            get: function () { return property.internalValue; },
            set: function (value) { property.internalValue = value; },
            enumerable: false,
            configurable: true
        });
        // ITriggerEvent
        Object.defineProperty(this, "subscribe", {
            //value: property.subscribe.bind(property),
            get: function () {
                return property.subscribe.bind(property);
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(this, "unsubscribe", {
            //value: property.unsubscribe.bind(property),
            get: function () { return property.unsubscribe.bind(property); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(this, "trigger", {
            //value: property.trigger.bind(property),
            get: function () { return property.trigger.bind(property); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(this, "pause", {
            //value: property.pause.bind(property),
            get: function () { return property.pause.bind(property); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(this, "block", {
            //value: property.block.bind(property),
            get: function () { return property.block.bind(property); },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(this, "dispose", {
            //value: property.dispose.bind(property),
            get: function () { return property.dispose.bind(property); },
            enumerable: false,
            configurable: true
        });
    }
}