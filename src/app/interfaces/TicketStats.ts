export interface TicketStats {
  totalTickets: number;

  byStatus:Record<string, number>;
    new: number;
    assigned: number;
    in_progress: number;
    waiting: number;
    resolved: number;
    closed: number;
  
 
  unassignedTickets: number;
}