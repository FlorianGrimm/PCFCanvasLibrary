import { ILogger } from "../Logging";
import type { IDisposable, Unsubscribe } from "./types";

function unsubscribeEmpty() { return unsubscribeEmpty; }

/**
 * a list of function that are called with dispose.
 */
export class DisposeCollection {
    items: (Unsubscribe | IDisposable)[];

    /**
     * DisposeCollection
     */
    constructor() {
        this.items = [];
    }
    add(...unsubscribe: (Unsubscribe | IDisposable)[] ): void {
        this.items.push(...unsubscribe);
    }
    dispose(logger?: ILogger) {
        this.items.splice(0, this.items.length).forEach((u) => {
            try {
                if (typeof u === "function") {
                    u();
                } else if (typeof u === "object" && typeof u.dispose === "function") {
                    u.dispose();
                }
            } catch (error) {
                logger?.error("unsubscribe", error);
            }
        });
    }

    getUnsubscribe():(()=>void){
        return (()=>{
            this.dispose();
        });
    }
}
