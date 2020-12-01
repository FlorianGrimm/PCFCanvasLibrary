import { MessagingService } from "./MessagingService";
import type { IMessagingService, MessagingServiceOptions, Message, MessageTyped, OnReceiveMessage  } from "./types";

function createMessagingService(options: Partial<MessagingServiceOptions>): IMessagingService {
    return new MessagingService(options);
}

export {
    IMessagingService,
    MessagingServiceOptions,
    Message, 
    MessageTyped,
    OnReceiveMessage,
    createMessagingService,
};