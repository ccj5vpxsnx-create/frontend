export interface Ticket {
    _id?: string;
    title: string;
    description: string;
    type: string;
    status: string;
    category: any;
    source?: string;
    urgency: string;
    impact: string;
    priority: string;
    location?: string;
    clientId?: any;
    technicianId?: any;
    adminId?: any;
    requester?: string;
    createdAt?: Date;
    updatedAt?: Date;
}