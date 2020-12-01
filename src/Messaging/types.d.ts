import type { ILogger } from '../Logging/types';

export type OnReceiveMessage<TMessage extends Message = Message>
    = (message: TMessage) => void | Promise<any>;

export type MessagingServiceOptions = {
    targetOrigin: string;
    enableTransportPostMessage: boolean;
    enableTransportPromise: boolean;
    getOwnName:()=>string|null,
    onVerify: () => boolean;
    onReceiveMessage: OnReceiveMessage<any>;
    window: Window | null;
    logger: ILogger;
}

export interface IMessagingService {
    sendMessage<TMessage extends Message = Message>(message: TMessage): Promise<any>;
    dispose(): void;

    getLastPromise(): Promise<any>;
}

export type Message = {
    action: string;
    targetOrigin?: string;
    sender: string;
    receiver?: string;
    messageId?: string;
}

export type MessageTyped<TAction extends string, TPayload> = {
    action: TAction;
    targetOrigin?: string;
    sender: string;
    receiver?: string;
    payload: TPayload;
}
