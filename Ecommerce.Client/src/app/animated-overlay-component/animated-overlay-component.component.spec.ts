import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnimatedOverlayComponent } from './animated-overlay-component.component';

describe('AnimatedOverlayComponentComponent', () => {
  let component: AnimatedOverlayComponent;
  let fixture: ComponentFixture<AnimatedOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnimatedOverlayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnimatedOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
