import { IMessagingService, MessagingServiceOptions, Message } from "./types";
type LocalMessagingService = {
    services: WeakRef<MessagingService>[]
};

interface WeakRef<T extends object> {
    deref(): T | undefined;
}

interface WeakRefConstructor {
    new <T extends object = object>(value: T): WeakRef<T>;
    readonly prototype: WeakRef<object>;
}

declare var WeakRef: WeakRefConstructor;

declare var global: any;

class NotWeakRef<T extends object> implements WeakRef<T>{
    constructor(public value: T) { }
    deref(): T | undefined { return this.value; }
}

function createWeakRef<T extends object>(value: T): WeakRef<T> {
    if (typeof (WeakRef as unknown) === "undefined") {
        return new NotWeakRef<T>(value);
    } else {
        return new WeakRef(value);
    }
}

function getLocalMessagingServices(): LocalMessagingService {
    const root: any = global || window;
    const pcfUtilities = ((root._PCFUtilities || null) === null) ? (root._PCFUtilities = {}) : root._PCFUtilities;
    const messagingServices = ((pcfUtilities.MessagingService || null) === null)
        ? (pcfUtilities.MessagingService = {
            services: [] as IMessagingService[],
            servicesWeak: [] as any[]
        })
        : pcfUtilities.MessagingService;
    return messagingServices;
}

export class MessagingService implements IMessagingService {
    _LastPromise: Promise<any>;
    _postPromise: Map<string, Promise<any>>;
    _postResolve: Map<string, (x: any) => void>;
    options: MessagingServiceOptions;

    constructor(options: Partial<MessagingServiceOptions>) {
        this._postPromise = new Map();
        this._postResolve = new Map();
        this._LastPromise = Promise.resolve<any>(null);
        if ((options as unknown) === undefined || (options as unknown) === null) { options = {}; }
        this.options = {
            enableTransportPostMessage: (options.enableTransportPostMessage === true) ? true : false,
            enableTransportPromise: (options.enableTransportPromise === true) ? true : false,
            targetOrigin: (options.targetOrigin || ""),
            getOwnName: (options.getOwnName || (() => null)),
            onVerify: options.onVerify || (() => true),
            onReceiveMessage: options.onReceiveMessage || (() => { }),
            window: (options.window?.postMessage) ? options.window : null,
            logger: options.logger || console || null
        };
        //
        const transportPostMessagePossible = (this.options?.window?.postMessage) ? true : false;
        if (this.options.enableTransportPostMessage) {
            if (!transportPostMessagePossible) {
                // no postMessage on nodejs
                this.options.enableTransportPostMessage = false;
            }
        }
        if ((this.options.enableTransportPostMessage === false) && (this.options.enableTransportPromise === false)) {
            if (transportPostMessagePossible) {
                this.options.enableTransportPostMessage = true;
                this.options.enableTransportPromise = false;
            } else {
                this.options.enableTransportPromise = true;
                this.options.enableTransportPostMessage = false;
            }
        }
        //
        if (this.options.enableTransportPostMessage) {
            this.windowOnReceiveMessage = this.windowOnReceiveMessage.bind(this);
            this.options.window?.addEventListener("message", this.windowOnReceiveMessage);
        }
        if (this.options.enableTransportPromise) {
            getLocalMessagingServices().services.push(createWeakRef(this));
        }
    }
    chainPromise(p: Promise<any> | null) {
        if (p && typeof p === "object" && typeof p.then === "function") {
            this._LastPromise = this._LastPromise.then(() => p, () => p);
        }
    }
    windowOnReceiveMessage = (ev: MessageEvent) => {
        const message = ev.data as Message;
        var ownName = this.options.getOwnName()
        if (!message.receiver && message.receiver === ownName) {
            if (typeof message.action === "string"
                && message.action === "ack"
                && typeof message.messageId === "string"
            ) {
                const resolve = this._postResolve.get(message.messageId);
                this._postResolve.delete(message.messageId);
                if (typeof resolve === "function") {
                    resolve(message.messageId);
                }
            } else {
                if (ev.origin) {
                    window.postMessage({
                        action: "ack",
                        sender: message.receiver,
                        receiver: message.sender,
                        messageId: message.messageId
                    }, ev.origin)
                }
                this.onReceiveMessage(message);
            }
        }
    }

    onReceiveMessage<T extends Message>(message: T): void | Promise<any> {
        if (typeof message.action === "string"
            && message.action
            && this.options.onReceiveMessage) {
            try {
                const result = this.options.onReceiveMessage(message);
                this.chainPromise(result || null);
                return result;
            } catch (error) {
                this.options.logger.error("while receiving message", error);
            }
        }
        return;
    }

    sendMessage(message: Message): Promise<any> {
        message.messageId = [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((x) => (Math.random() * 1296 | 0).toString(36)).join("") + (Date.now().toString(36));
        const ownName = this.options.getOwnName();
        if (ownName) {
            message.sender = ownName;
            if (this.options.enableTransportPostMessage) {
                const result = new Promise<any>((resolve) => {
                    const targetOrigin = (window?.postMessage)
                        ? ((typeof message.targetOrigin === "string")) ? message.targetOrigin : this.options.targetOrigin
                        : "";
                    window.postMessage(message, targetOrigin);
                    this._postResolve.set(message.messageId!, resolve);
                });
                this.chainPromise(result);
                return result;
            }
            if (this.options.enableTransportPromise) {
                const result = Promise.resolve(message).then((msg) => {
                    const result: Promise<any>[] = [];
                    const services = getLocalMessagingServices().services;
                    services.forEach((weakService) => {
                        try {
                            const service = weakService.deref()
                            if (service) {
                                const r = service.onReceiveMessage(message);
                                if (r && typeof r.then === "function") {
                                    result.push(r);
                                }
                            }
                        } catch (error) {
                            this.options.logger.error("while sending/receiving message", error);
                        }
                    });
                    return result;
                }).then((p: Promise<any>[]) => {
                    if (p && p.length > 0) {
                        return Promise.all(p).then(() => "promises awaited");
                    } else {
                        return Promise.resolve("no promises");
                    }
                });
                this.chainPromise(result);
                return result;
            } else {
                return Promise.reject(
                    new Error("no enabled protocol for sendMessage.")
                );
            }
        } else {
            return Promise.reject(
                new Error("no own name.")
            );
        }
    }

    getLastPromise(): Promise<any> {
        return this._LastPromise;
    }

    dispose(): void {
        if (this.options.enableTransportPostMessage) {
            this.options.window?.removeEventListener("message", this.windowOnReceiveMessage);
            this.options.enableTransportPostMessage = false
        }
        if (this.options.enableTransportPromise) {
            this.options.enableTransportPromise = false;
            const services = getLocalMessagingServices().services;
            let idx = 0;
            while (idx < services.length) {
                const w = services[idx].deref();
                if (w === undefined) {
                    services.splice(idx, 1);
                    continue;
                }
                if (w === this) {
                    services.splice(idx, 1);
                    continue;
                }
                idx++;
            }
        }
    }
}