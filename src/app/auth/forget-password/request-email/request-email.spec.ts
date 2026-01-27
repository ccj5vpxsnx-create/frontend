import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RequestEmail } from './request-email';

describe('RequestEmail', () => {
  let component: RequestEmail;
  let fixture: ComponentFixture<RequestEmail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RequestEmail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RequestEmail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
