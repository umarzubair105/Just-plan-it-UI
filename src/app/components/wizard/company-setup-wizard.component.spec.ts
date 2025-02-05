import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanySetupWizardComponent } from './company-setup-wizard.component';

describe('CompanySetupWizardComponent', () => {
  let component: CompanySetupWizardComponent;
  let fixture: ComponentFixture<CompanySetupWizardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanySetupWizardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanySetupWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
