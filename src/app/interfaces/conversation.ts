export interface Conversation {
    _id?: string;
    type: 'private' | 'group';
    name?: string;
    participants: string[];
    createdBy: string;
    ticketId?: string | { _id: string; title: string; [key: string]: any };
    createdAt?: Date;
    updatedAt?: Date;
}