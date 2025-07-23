import { Component, OnInit } from '@angular/core';
import {ProductResource, Resource, ResourceRole, Role} from '../models/basic';
import {RoleService} from '../services/role.service';
import {ResourceService} from '../services/resource.service';
import {ProductResourceService} from '../services/product.resource.service';
import {Utils} from '../utils/utils';
import {
  DataTableColumnCellDirective,
  DataTableColumnDirective,
  DataTableColumnHeaderDirective,
  DatatableComponent
} from '@swimlane/ngx-datatable';
import {FormsModule} from '@angular/forms';
import {NgFor, NgIf, TitleCasePipe} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {lastValueFrom} from 'rxjs';

@Component({
  selector: 'app-team-resource',
  templateUrl: './team-resource.component.html',
  styleUrl: './team-resource.component.css',
    imports: [
        DatatableComponent,
        DataTableColumnDirective,
        FormsModule,
        NgFor,
        DataTableColumnCellDirective,
        NgIf,
        DataTableColumnHeaderDirective,
        TitleCasePipe
    ],
  standalone: true
})
export class TeamResourceComponent implements OnInit {
  resources: Resource[] = [];
  roles: Role[] = [];
  selectedRoles: { [resourceId: number]: number } = {};
  productResources: ProductResource[] = [];
  productId! : number;
  isAnyThingChanged = false;
  // inject ResourceService
  // constructor(private resourceService: ResourceService) {}
  constructor(private roleService: RoleService,private resourceService: ResourceService,
              private productResourceService: ProductResourceService, private util: Utils,
              private router: Router,
              private route: ActivatedRoute) {

  }

  ngOnInit(): void {
    const companyId = this.util.getCompanyId();
    this.productId = this.util.getSelectedProductId();//Number(this.route.snapshot.paramMap.get('productId'));
    this.resourceService.getByCompanyId(companyId).subscribe({
      next: (data) => {
        this.resources = data._embedded.resources;
        this.resources.sort((a, b) => a.name.localeCompare(b.name));
        console.log(this.resources);
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
    this.roleService.getByCompanyId(companyId).subscribe({
      next: (data) => {
        this.roles = data._embedded.roles;
        this.roles.sort((a, b) => a.name.localeCompare(b.name));
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
    this.productResourceService.getByProductId(this.productId).subscribe({
      next: (data) => {
        this.productResources = data._embedded.productResources;
        // fill selectedRoles using productResources
        this.productResources.forEach((pr) => {
          this.selectedRoles[pr.resourceId] = pr.roleId;
        });
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }

  onSkip():void {
    if (sessionStorage.getItem('wizard')) {
      this.router.navigate(['/product-resource']);
    }
  }
  isWizard():boolean {
    return sessionStorage.getItem('wizard')!=null && sessionStorage.getItem('wizard')=='productSetup';
  }

  async onSave(): Promise<void> {
    for (const pr of this.productResources) {
      try {
        if (pr.id > 0) {
          if (pr.roleId === 0) {
            await lastValueFrom(this.productResourceService.delete(pr.id));
          } else {
            await lastValueFrom(this.productResourceService.update(pr.id, pr));
          }
        } else if (pr.roleId > 0) {
          const data = await lastValueFrom(this.productResourceService.create(pr));
          pr.id = data.id;
        }
        this.util.showSuccessMessage('Data is saved');
      } catch (err) {
        console.log(err);
        //this.util.showErrorMessage(err.toString());
      }
    }
    if (sessionStorage.getItem('wizard')) {
      this.router.navigate(['/product-resource']);
    }
  }


  onRoleSelect(resourceId: number, roleId: number): void {
    this.selectedRoles[resourceId] = roleId;
    this.isAnyThingChanged = true;
    const prs = this.productResources.filter(pr=>pr.resourceId==resourceId);
    if(prs.length > 0) {
      prs[0].roleId = roleId;
    } else {
      const pr = new ProductResource();
      pr.productId = this.productId;
      pr.active = true;
      pr.resourceId = resourceId;
      pr.roleId = roleId;
      pr.participationPercentTime = 0;
      this.productResources.push(pr);
    }

    /*this.selectedResourceRoles = Object.keys(this.selectedRoles).map(kResourceId => {
      const rr = new ResourceRole();
      rr.resourceId = Number(kResourceId);
      rr.roleId = this.selectedRoles[Number(kResourceId)] ;
      return rr;
      //resourceId: resourceId,
      //roleId: this.selectedRoles[resourceId]
    });
    console.log('selected:'+this.selectedResourceRoles);*/
  }
}
