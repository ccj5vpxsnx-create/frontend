export interface Message {
    _id?: string;
    conversationId: string;
    sender: string;
    senderName?: string; 
    content: string;
    createdAt?: Date;
    updatedAt?: Date;
}


