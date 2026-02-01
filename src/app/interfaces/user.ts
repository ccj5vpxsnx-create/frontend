export interface User {
    _id?: string;
    username: string;
    type: 'admin' | 'technician' | 'user' | 'client';
    email: string;
    createdAt?: Date;
    updatedAt?: Date;
}
