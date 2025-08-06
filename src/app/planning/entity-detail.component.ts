import {Component, inject, Inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule,} from '@angular/forms';
import {
  EntityDetail,
  EntityDetailType, EntityType,
} from '../models/planning';
import {Audit, Priority, ResourceRightBean, SubComponent} from '../models/basic';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ShowErrorsDirective} from '../directives/show-errors.directive';
import {Utils} from '../utils/utils';
import {DecimalToTimePipe} from '../pipes/decimal.to.time';
import {FormatDatePipe} from '../pipes/format.date';
import {formatDate, isGlobalHR, isManager, messageChange} from '../utils/helper';
import {AppConstants} from '../configuration/app.constants';
import {ResourceService} from '../services/resource.service';
import {QuillEditorComponent} from 'ngx-quill';
import {PrettyLabelPipe} from '../pipes/pretty.label';
import {MiscService} from '../services/misc.service';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'epic',
  standalone: true,
  imports: [CommonModule, FormsModule, ShowErrorsDirective, DecimalToTimePipe, FormatDatePipe, QuillEditorComponent, PrettyLabelPipe],
  templateUrl: 'entity-detail.component.html',
})
export class EntityDetailComponent implements OnInit {
  entityId:number;
  entityName:string;
  label:string = 'Artifacts';
  entityType:EntityType;
  companyId:number=0;
  productId:number=0;
  miscService: MiscService = inject(MiscService);
  resourceService: ResourceService = inject(ResourceService);
  selectedFileForUpload: File | null = null;
  descriptionForFileUpload: string = '';
  files: EntityDetail[] = [];
  urls: EntityDetail[] = [];
  url: EntityDetail = new EntityDetail();
  resourceMap = new Map<number, string>();
  authService = inject(AuthService);
  rights  = new ResourceRightBean();
  constructor(public dialogRef: MatDialogRef<EntityDetailComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private readonly util: Utils) {
    console.log('EpicEstimate');
    this.entityId = data.entityId;
    this.entityType = data.entityType;
    this.entityName = data.entityName;
    if (data.label) {
      this.label = data.label;
    }

  }
  ngOnInit() {
    console.log('Child component initialized');
    this.companyId = this.util.getCompanyId();
    this.productId = this.util.getSelectedProductId();//Number(this.route.snapshot.paramMap.get('productId'));

    this.miscService.getEntityDetailsByIdAndType(this.entityType, this.entityId).subscribe({
      next: (data) => {
        let epicDetails = data;
        this.files = epicDetails.filter((e: EntityDetail) => e.detailType === EntityDetailType.ATTACHED_FILE);
        this.urls = epicDetails.filter((e: EntityDetail) => e.detailType === EntityDetailType.URL);
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
    if (this.productId && this.productId > 0) {

      this.authService.getResourceRightsByProductId(this.productId).subscribe({
        next: (data) => {
          this.rights = data;
        },
        error: (err) => {
          this.util.showErrorMessage(err);
        },
      });
    } else {
      this.authService.getResourceRights().subscribe({
        next: (data) => {
          this.rights = data;
        },
        error: (err) => {
          this.util.showErrorMessage(err);
        },
      });
    }
  }


  getResourceName(audit:Audit) {
    let rId = audit.createdById;
    if (this.resourceMap.has(rId)) {
      audit.createdByName = <string>this.resourceMap.get(rId);
    } else {
      this.resourceService.getById(rId).subscribe({
        next: (data) => {
          this.resourceMap.set(rId, data.name);
          audit.createdByName = <string>this.resourceMap.get(rId);
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    }
  }


  addEntityDetail(epicDetail: EntityDetail, epicDetailType: EntityDetailType): void {
    if (!epicDetail) {
      alert("Please enter data");
      return;
    }
     epicDetail.entityId = this.entityId;
     epicDetail.entityType = this.entityType;
      epicDetail.detailType = epicDetailType;
      epicDetail.active = true;
      this.miscService.createEntityDetail(epicDetail).subscribe({
        next: (data) => {
          if (epicDetail.detailType === EntityDetailType.URL) {
            this.getResourceName(data);
            this.urls.push(data);
            this.url = new EntityDetail();
            this.util.showSuccessMessage('Url is added.');
          }
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
  }
  onFileSelected(event: any) {
    this.selectedFileForUpload = event.target.files[0];
  }
  onSubmitFileForm(): void {
    console.log('File Form Submitted!');
    if (!this.selectedFileForUpload) {
      alert("Please select a file");
      return;
    }
      this.miscService.uploadEntityDetailFile(this.companyId,this.entityType,this.entityId,
        this.selectedFileForUpload,this.descriptionForFileUpload).subscribe({
        next: (data) => {
          this.getResourceName(data);
          this.descriptionForFileUpload = '';
          this.files.push(data);
          this.util.showSuccessMessage('File is uploaded.');
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
  }
  download(file:EntityDetail) {
    this.miscService.downloadEntityDetailFile(file.id).subscribe(blob => {
      const a = document.createElement('a');
      const objectUrl = URL.createObjectURL(blob);
      a.href = objectUrl;
      a.download = file.name; // You can make this dynamic
      //a.download = response.headers.get('Content-Disposition')?.split('filename=')[1];
      a.click();
      URL.revokeObjectURL(objectUrl);
    }, error => {
      console.error('Download error:', error);
    });
  }
  deleteEntityDetail(detail:EntityDetail) {
    this.miscService.delete(detail.id).subscribe(blob => {
      if (detail.detailType === EntityDetailType.ATTACHED_FILE) {
        this.files = this.files.filter(f => f.id !== detail.id);
      } else if (detail.detailType === EntityDetailType.URL) {
        this.urls = this.urls.filter(f => f.id !== detail.id);
      }
    }, error => {
      console.error('Error in deleting.', error);
    });
  }


  closeDialog(): void {
    let result = {};
    console.log('Closing with:'+result);
    this.dialogRef.close(result);
  }
  closeDialogDoNothing(): void {
    let result = {};
    console.log('Closing with:'+result);
    this.dialogRef.close(result);
  }



  protected readonly EntityDetailType = EntityDetailType;
  protected readonly EntityType = EntityType;
  protected readonly formatDate = formatDate;
  protected readonly AppConstants = AppConstants;
  protected readonly isManager = isManager;
  protected readonly messageChange = messageChange;
  protected readonly isGlobalHR = isGlobalHR;
}
