export interface Page {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;

}
export interface PageResponse {
  _embedded: any;
  page: Page;
}
