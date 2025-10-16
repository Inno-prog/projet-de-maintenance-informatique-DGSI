import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeItemFormComponent } from './type-item-form.component';

describe('TypeItemFormComponent', () => {
  let component: TypeItemFormComponent;
  let fixture: ComponentFixture<TypeItemFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TypeItemFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeItemFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
