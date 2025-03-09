import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translations: any = {};

  constructor(private http: HttpClient) {}

  loadTranslations(locale: string): Promise<void> {
    return this.http.get(`/assets/i18n/${locale}.json`)
      .toPromise()
      .then(translations => {
        this.translations = translations;
      });
  }

  translate(key: string): string {
    return this.translations[key] || key;
  }
}
