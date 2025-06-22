import { Component, OnInit } from '@angular/core';
import {DataTableColumnCellDirective, DataTableColumnDirective, DatatableComponent} from '@swimlane/ngx-datatable';
import {Product} from '../models/planning';
import {ProductResource, ProductResourceBean, Resource} from '../models/basic';
import {ResourceService} from '../services/resource.service';
import {Utils} from '../utils/utils';
import {ProductResourceService} from '../services/product.resource.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ProductService} from '../services/product.service';
import {HttpParams} from '@angular/common/http';
import {FormsModule} from '@angular/forms';
import {NgForOf, NgIf} from '@angular/common';
import {firstValueFrom} from 'rxjs';

@Component({
  selector: 'app-product-resource',
  templateUrl: './product-resource.component.html',
  standalone: true,
  imports: [
    DatatableComponent,
    DataTableColumnCellDirective,
    DataTableColumnDirective,
    FormsModule,
    NgForOf,
    NgIf
  ],
  styleUrls: ['./product-resource.component.css']
})
export class ProductResourceComponent implements OnInit {
  //products: { [productId: number]: string } = {};
  //resources: { [resourceId: number]: string } = {};
  products: Product[] = [];
  resources: Resource[] = [];
  productResources: ProductResourceBean[] = [];
  isAnyThingChanged: boolean = false;
  transformedData: any[] = [];
  columns: any[] = [];
  productId! : number;

  errorMessage: string='';
  isValidated: boolean = true;
  constructor(private resourceService: ResourceService,
              private productResourceService: ProductResourceService,
              private productService: ProductService,
              private util: Utils,
              private router: Router,
              private route: ActivatedRoute) {}

  ngOnInit(): void {
    const companyId = this.util.getCompanyId();
    this.productId = this.util.getSelectedProductId();//Number(this.route.snapshot.paramMap.get('productId'));

    this.products = [];//this.productResourceService.getProducts();
    this.resources = [];//this.productResourceService.getResources();
    this.productResources = [];//this.productResourceService.getProductResources();

    this.productService.getByCompanyId(companyId).subscribe({
      next: (data) => {
        this.products = data._embedded.products;
        this.products.sort((a, b) => a.name.localeCompare(b.name));
        // fill selectedRoles using productResources
        this.resourceService.getByProductId(this.productId).subscribe({
          next: (data) => {
            this.resources = data._embedded.resources;
            this.resources.sort((a, b) => a.name.localeCompare(b.name));
            console.log(this.resources);
            let params = new HttpParams();
            this.resources.forEach(s => params = params.append('resourceId', s.id));
            this.productResourceService.getByResourceIds(params).subscribe({
              next: (data) => {
                this.productResources = data._embedded.productResources;
                this.products = this.products.filter(p =>
                  {
                    return this.productResources.some(pr => pr.productId === p.id);
                  }
                );
                this.transformData();
              },
              error: (err) => (this.util.showErrorMessage(err)),
            });
          },
          error: (err) => (this.util.showErrorMessage(err)),
        });

      },
      error: (err) => (this.util.showErrorMessage(err)),
    });

    this.transformData();
  }

  transformData() {
    // Prepare base structure: Each row represents a Resource
    this.transformedData = this.resources.map(resource => {
      let row: any = { resourceName: resource.name, resourceId: resource.id }; // First column as resource name
      let totalTime: number = 0;
      this.products.forEach(product => {
        // Find matching product-resource entry
        const match = this.productResources.find(
          pr => pr.resourceId === resource.id && pr.productId === product.id
        );
        if (match) {
          totalTime += match.participationPercentTime;
        }
        //row[product.name] = match ? `${match.participationPercentTime}%` : '-'; // Show hours or "-"
        row[product.id] = match || new ProductResourceBean();
      });
      const totalPR = new ProductResourceBean();
      totalPR.resourceId=resource.id;
      totalPR.productId = 0; // Total row
      totalPR.participationPercentTime = totalTime;
      this.productResources.push(totalPR);
      row['total'] = totalPR;
      return row;
    });

    // Define dynamic columns
    this.columns = [
      { prop: 'resourceName', name: 'Resource' },
      ...this.products.map(product => ({
        prop: product.id,
        name: product.name // Column name = Product Name
      }))
    ];
  }

  validateData() {
    this.errorMessage = '';
    this.isValidated = true;
    if (this.productResources.find(pr=>pr.productId>0 &&
      (pr.participationPercentTime < 0 || pr.participationPercentTime > 100))) {
      this.errorMessage = 'None of the participation time should be less than 0 and greater than 100';
      this.isValidated = false;
      return;
    }
    if (this.productResources.find(pr=>pr.productId==0 && pr.participationPercentTime > 100)) {
      this.errorMessage = 'Total time should never be greater than 100%';
      this.isValidated = false;
    }
  }
//  onParticipationChange(resourceName: string, productName: string, newValue: number) {
  onParticipationChange(resourceId: number, productId: number, newValue: number) {
    //const resource = this.resources.find(r => r.name === resourceName);
    //const product = this.products.find(p => p.name === productName);
    //if (resource && product) {
      const productResource = this.productResources.find(
        pr => pr.resourceId === resourceId && pr.productId === productId
      );
      if (productResource) {
        this.isAnyThingChanged = true;
        productResource.participationPercentTime = newValue;
        // update total
        const totalPR = this.productResources.find(
          pr => pr.resourceId === resourceId && pr.productId === 0
        );

        if (totalPR) {
          totalPR.participationPercentTime = this.productResources.filter(
            pr => pr.resourceId === resourceId && pr.productId!== 0
          ).reduce((acc, pr) => acc + pr.participationPercentTime, 0);
        }
        this.validateData();

      } else {
        // Handle case where ProductResourceBean doesn't exist
        //const newProductResource = new ProductResourceBean();
        //newProductResource.resourceId = resource.id;
        //newProductResource.productId = product.id;
        //newProductResource.participationPercentTime = newValue;
        //this.productResources.push(newProductResource);
      }
    //}
  }

  //convert following method service calls to sync
  async onSave(): Promise<void> {
    for (const pr of this.productResources.filter(pr => pr.resourceId > 0 && pr.productId > 0 && pr.id > 0)) {
      try {
        await firstValueFrom(this.productResourceService.updateSpecificFieldsPasses(pr.id,
          { 'participationPercentTime': pr.participationPercentTime }));
        this.util.showSuccessMessage('Data is saved');
      } catch (err) {
        console.log(err);
        //this.util.showErrorMessage(err.toString());
      }
    }
    this.router.navigate(['/priority']);
  }
/*
  transformData() {
    // Prepare base structure: Each row represents a Resource
    this.transformedData = this.resources.map(resource => {
      let row: any = { resourceName: resource.name }; // First column as resource name
      this.products.forEach(product => {
        // Find matching product-resource entry
        const match = this.productResources.find(
          pr => pr.resourceId === resource.id && pr.productId === product.id
        );
        row[product.name] = match ? `${match.participationPercentTime}%` : '-'; // Show hours or "-"
      });
      return row;
    });

    // Define dynamic columns
    this.columns = [
      { prop: 'resourceName', name: 'Resource' },
      ...this.products.map(product => ({
        prop: product.name,
        name: product.name // Column name = Product Name
      }))
    ];
  }*/
}
