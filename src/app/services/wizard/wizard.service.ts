import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WizardService {
  private wizardData: any = {};

  setStepData(step: string, data: any) {
    this.wizardData[step] = data;
  }

  getStepData(step: string) {
    return this.wizardData[step];
  }

  getAllData() {
    return this.wizardData;
  }

  clearData() {
    this.wizardData = {};
  }
}
