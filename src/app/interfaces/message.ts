export interface Message {
    _id?: string;
    conversationId: string;
    sender: string;
    senderName?: string; // optional display name cached in frontend
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
}


