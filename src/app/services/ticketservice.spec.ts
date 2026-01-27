import { TestBed } from '@angular/core/testing';

import { Ticketservice } from './ticketservice';

describe('Ticketservice', () => {
  let service: Ticketservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ticketservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
