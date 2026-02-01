export interface Conversation {
    _id?: string;
    type: 'private' | 'group';
    name?: string;
    participants: string[];
    createdBy: string;
    ticketId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}