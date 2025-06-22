import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardMessageComponent } from './card-message.component';

describe('CardMessageComponent', () => {
  let component: CardMessageComponent;
  let fixture: ComponentFixture<CardMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CardMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
