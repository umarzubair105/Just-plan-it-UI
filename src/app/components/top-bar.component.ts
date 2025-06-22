import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {CommonModule} from '@angular/common';
import {Utils} from '../utils/utils';
import {MatDialog} from '@angular/material/dialog';
import {Resource} from '../models/basic';
import {ResourceLeaveComponent} from '../leaves/resource.leave.component';
import {FormsModule} from '@angular/forms';
import {ProductService} from '../services/product.service';
import {HttpParams} from '@angular/common/http';
import {Product} from '../models/planning';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  standalone:true,
  imports: [CommonModule, FormsModule],  // Import necessary modules
  //styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {
  userName: string | null = '';
  companyName: string | null = '';
  products: Product[] = [];
  selectedProductId: number = 0;
  constructor(private authService: AuthService,
              private utils: Utils,
              private productService: ProductService,
              private dialog: MatDialog) {}

  ngOnInit() {
    console.log('TopBarComponent');
    this.authService.userName$.subscribe(name => {
      console.log('TopBarComponent:'+name);
      this.userName = name;
      this.selectedProductId = this.authService.getSelectedProductId();
      if (this.userName && this.authService.getCompanyId()) {
        this.companyName = this.authService.getCompanyName();
        this.productService.getByCompanyId(this.authService.getCompanyId()).subscribe({
          next: (data) => {
            this.products = data._embedded.products;
            this.products.sort((a, b) => a.name.localeCompare(b.name));
            // fill selectedRoles using productResources
          },
          error: (err) => (this.utils.showErrorMessage(err)),
        });
      } else {
        this.products = [];
        this.companyName = '';
      }
    });
  }

  logout() {
    this.authService.logout();
    this.utils.navigateToResource('/home'); // Redirect to a secure page
  }
  onProductChange(productId: number) {
    console.log('Selected Product ID:', productId);
    this.authService.setSelectedProductId(productId);
    // Add your logic here, e.g., fetch product details
  }
  openDialogForMyLeaves(): void {
    const dialogRef = this.dialog.open(ResourceLeaveComponent, {
      width: '80%',
      maxWidth: '90vw', // 90% of viewport width
      height: '70%',
      maxHeight: '80vh', // 80% of viewport height
      disableClose: true,
      data: {  },
      //data: { resource: resource },
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      if (result) {
        //row.estimates = result.estimates;
      }
      // Handle the result here
    });
  }

}
