import { Ticket } from "./tiket";

export interface TicketsResponse {
    items: Ticket[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
