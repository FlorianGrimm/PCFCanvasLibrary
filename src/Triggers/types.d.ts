
export type CallbackHandler<E = any> = (evt: E, sender: any) => void | boolean;
export type Unsubscribe = (() => void);
export type Resume = () => void;

export interface IDisposable{
    dispose(): void;
}

export interface ITriggerEvent<TValue = any> extends IDisposable {
    subscribe(cbh: CallbackHandler<TValue>): Unsubscribe;
    unsubscribe(cbh: CallbackHandler<TValue>): void;
    trigger(sender: any, evt: TValue): void;
    pause(): Resume;
    block(action: () => void): void;
    dispose(): void;
}
export interface ITriggerProperty<TValue = any> extends ITriggerEvent<TValue> {
    value:TValue;
    internalValue:TValue;
}
