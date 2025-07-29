import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LabelService {
  private labels: any = {};
  private specificLabels: any = {};
  private companyType: string | null = null;

  constructor(private http: HttpClient) {
    console.log('000000000000000000000000000000000000000');
    this.http.get(`assets/labels/all.json`)
      .subscribe({
        next: (data) => { console.log('-------------Labels:', data); this.labels = data;},
        error: (err) => { console.error('Failed to load labels:', err); }
      });
    if (localStorage.getItem('companyType')
      && localStorage.getItem('companyType') != undefined) {
    console.log('000000000000000'+localStorage.getItem('companyType'));
      this.http.get(`assets/labels/${localStorage.getItem('companyType')}.json`)
        .subscribe({
          next: (data) => { console.log('-------------Labels:', data); this.specificLabels = data;},
          error: (err) => { console.error('Failed to load labels:', err); }
        });
    }
  }

  get(key: string): string {
    console.log("--------------------------"+key);
    console.log("--------------------------"+localStorage.getItem('companyType'));
    console.log("--------------------------"+this.labels[key]);
      return this.specificLabels[key] ||  this.labels[key] || key;
  }
}
