export interface User {
    _id?: string;
    username: string;
    type: 'admin' | 'technician' | 'client';
    email: string;
    createdAt?: Date;
    updatedAt?: Date;
}
