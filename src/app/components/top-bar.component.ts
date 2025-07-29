import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {CommonModule} from '@angular/common';
import {Utils} from '../utils/utils';
import {MatDialog} from '@angular/material/dialog';
import {Resource, ResourceRightBean} from '../models/basic';
import {ResourceLeaveComponent} from '../leaves/resource.leave.component';
import {FormsModule} from '@angular/forms';
import {ProductService} from '../services/product.service';
import {HttpParams} from '@angular/common/http';
import {EntityType, Epic, EpicBeanCopyPasteUpdatedValues, EpicLink, Product, Release} from '../models/planning';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {EpicService} from '../services/epic.service';
import {EpicComponent} from '../planning/epic.component';
import {isGlobalHR, isGlobalManager, isManager, messageChange} from "../utils/helper";
import {EntityDetailComponent} from '../planning/entity-detail.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  standalone:true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],  // Import necessary modules
  //styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {
  userName: string | null = '';
  companyName: string | null = '';
  search: string = '';
  epicSearch: Epic = new Epic();
  products: Product[] = [];
  selectedProductId: number = 0;
  selectedProduct: Product | undefined;
  rights  = new ResourceRightBean();

  notificationCount = 3;
  selectedLang = 'en';
  isSyncing = false;
  darkMode = false;
  username = 'Umar';
  constructor(private authService: AuthService,
              private utils: Utils,
              private productService: ProductService,
              private epicService: EpicService,
              private dialog: MatDialog,
              public router: Router,
              private location: Location) {}

  ngOnInit() {
    console.log('TopBarComponent');

    this.authService.userName$.subscribe(name => {
      console.log('TopBarComponent:'+name);
      this.userName = name;
      this.selectedProductId = this.authService.getSelectedProductId();
      if (this.userName && this.authService.getCompanyId()) {
        this.companyName = this.authService.getCompanyName();

        this.authService.getResourceRights().subscribe({
          next: (data) => {
            this.rights = data;
            this.products = data.products;
            this.products.sort((a, b) => a.name.localeCompare(b.name));
            this.selectedProduct = this.products.find(p=>p.id==this.selectedProductId);
          },
          error: (err) => {this.utils.showErrorMessage(err);},
        });
        /*this.productService.getByCompanyId(this.authService.getCompanyId()).subscribe({
          next: (data) => {
            this.products = data._embedded.products;
            this.products.sort((a, b) => a.name.localeCompare(b.name));
            // fill selectedRoles using productResources
          },
          error: (err) => (this.utils.showErrorMessage(err)),
        });*/



      } else {
        this.products = [];
        this.companyName = '';
      }
    });
  }
  isActive(path: string): boolean {
    return this.router.url === path;
  }
  logout() {
    this.authService.logout();
    this.utils.navigateToResource('/home'); // Redirect to a secure page
  }
  onProductChange(productId: number) {
    console.log('Selected Product ID:', productId);
    this.selectedProductId = productId;
    this.selectedProduct = this.products.find(p=>p.id==this.selectedProductId);
    this.authService.setSelectedProductId(productId);
    this.location.go(this.location.path()); // push current path
    window.location.reload();
    //this.router.navigate(['/home']);
    // Add your logic here, e.g., fetch product details
  }
  addProduct() {
    this.selectedProductId = 0;
    this.selectedProduct = undefined;
    this.authService.setSelectedProductId(0);
    this.router.navigate(['/product']);
    // Add your logic here, e.g., fetch product details
  }
  openDialogForMyLeaves(): void {
    const dialogRef = this.dialog.open(ResourceLeaveComponent, {
      backdropClass: 'transparent-backdrop',
      hasBackdrop: false,
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
  openDialogForEntityDetail(): void {
    var product =  this.products.filter(p=>p.id==this.selectedProductId).at(0);
    if (product) {
    const dialogRef = this.dialog.open(EntityDetailComponent, {
      width: '50%',
      maxWidth: '90vw', // 90% of viewport width
      height: '70%',
      maxHeight: '80vh', // 80% of viewport height
      disableClose: true,
      data: { entityId: this.selectedProductId, entityType: EntityType.PRODUCT, entityName: product.name },
    });

    dialogRef.afterClosed().subscribe(result => {

    });
    }
  }
  onSubmit():void {
    this.search = this.epicSearch.code;
    if (this.search  && this.search.trim()) {
      this.epicService.getEpicBeanByCompanyIdAndCode(this.utils.getCompanyId(), this.search.trim()).subscribe({
        next: (data) => {

          const dialogRef = this.dialog.open(EpicComponent, {
            width: '100%',
            maxWidth: '90vw', // 90% of viewport width
            height: '100%',
            maxHeight: '80vh', // 80% of viewport height
            disableClose: true,
            data: {epicBean: data, priorities: null, subComponents: null},
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result && result.epic && result.epic.id > 0) {
              console.log('The dialog was closed:' + result.epic.title);
            }
            // Handle the result here
          });


        },
        error: (err) => (this.utils.showErrorMessage(err)),
      });
    }
  }

    protected readonly isGlobalHR = isGlobalHR;
    protected readonly isGlobalManager = isGlobalManager;
    protected readonly isManager = isManager;

  switchLang(lang: string) {
    this.selectedLang = lang;
    // switch translation service if needed
  }

  openNotifications() {
    // open notifications modal
  }

  openQuickAdd() {
    // open quick task/project form
  }

  toggleDarkMode() {
    this.darkMode = !this.darkMode;
    document.body.classList.toggle('dark-mode', this.darkMode);
  }


  protected readonly messageChange = messageChange;
}
