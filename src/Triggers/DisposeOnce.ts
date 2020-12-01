import { ILogger } from "../Logging";
import type { IDisposable, Unsubscribe } from "./types";

export function createUnsubscribe(
    unsubscribe?: Unsubscribe | IDisposable | null | undefined,
    logger?: ILogger,
    name?: string
): Unsubscribe {
    return (new DisposeOnce(unsubscribe, logger, name)).getUnsubscribe();
}

export class DisposeOnce implements IDisposable {
    unsubscribe: Unsubscribe | IDisposable | null;
    logger: ILogger | null;
    name: string | null;

    constructor(
        unsubscribe?: Unsubscribe | IDisposable | null | undefined,
        logger?: ILogger,
        name?: string
    ) {
        this.unsubscribe = unsubscribe || null;
        this.logger = logger || null;
        this.name = name || null;
        if (unsubscribe && (this.name === null)) {
            if (typeof unsubscribe == "function") {
                if (unsubscribe.name) {
                    this.name = unsubscribe.name || null;
                }
            } else if (typeof unsubscribe.dispose === "function") {
                const unsubscribeNamed = unsubscribe as IDisposable & { name?: string };
                if (typeof unsubscribeNamed.name === "string") {
                    this.name = unsubscribeNamed.name;
                }
            }
        }
    }

    getUnsubscribe(): Unsubscribe {
        return this.dispose.bind(this);
    }

    dispose(): void {
        const unsubscribe = this.unsubscribe;
        this.unsubscribe = null;
        if (unsubscribe) {
            if ((this.logger !== null) && (this.name !== null)) {
                this.logger.debug("dispose", this.name)
                this.logger = null;
                this.name = null;
            }
            if (typeof unsubscribe === "function") {
                unsubscribe();
            } else if (typeof unsubscribe.dispose === "function") {
                unsubscribe.dispose();
            }
        }
    }
}