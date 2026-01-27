import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TechnicienDashboard } from './technicien-dashboard';

describe('TechnicienDashboard', () => {
  let component: TechnicienDashboard;
  let fixture: ComponentFixture<TechnicienDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TechnicienDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TechnicienDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
