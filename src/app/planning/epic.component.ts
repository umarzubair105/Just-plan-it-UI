import {Component, inject, Inject, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule,} from '@angular/forms';
import {
  Epic,
  EpicBean,
  EpicDetail,
  EpicDetailType,
  EpicEstimate,
  EpicLink,
  EpicLinkType,
  Release
} from '../models/planning';
import {Audit, Priority, ResourceRightBean, SubComponent} from '../models/basic';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {ShowErrorsDirective} from '../directives/show-errors.directive';
import {Utils} from '../utils/utils';
import {EpicService} from '../services/epic.service';
import {DecimalToTimePipe} from '../pipes/decimal.to.time';
import {FormatDatePipe} from '../pipes/format.date';
import {formatDate, isManager} from '../utils/helper';
import {AppConstants} from '../configuration/app.constants';
import {ResourceService} from '../services/resource.service';
import {QuillEditorComponent} from 'ngx-quill';
import {PrettyLabelPipe} from '../pipes/pretty.label';
import {AuthService} from '../services/auth.service';
import { NgSelectModule } from '@ng-select/ng-select';
import {PriorityService} from '../services/priority.service';
import {SubComponentService} from '../services/sub-component.service';

@Component({
  selector: 'epic',
  standalone: true,
  imports: [CommonModule, NgSelectModule, FormsModule, ShowErrorsDirective, DecimalToTimePipe, FormatDatePipe, QuillEditorComponent, PrettyLabelPipe],
  templateUrl: 'epic.component.html',
})
export class EpicComponent implements OnInit {
  originalBean!: EpicBean;
  epicBean!: EpicBean;
  priorities: Priority[] = [];
  subComponents: SubComponent[] = [];
  epicService: EpicService = inject(EpicService);
  priorityService: PriorityService = inject(PriorityService);
  subComponentService = inject(SubComponentService)
  resourceService: ResourceService = inject(ResourceService);
  selectedFileForUpload: File | null = null;
  descriptionForFileUpload: string = '';
  files: EpicDetail[] = [];
  references: EpicDetail[] = [];
  urls: EpicDetail[] = [];
  comments: EpicDetail[] = [];
  epicLinks: EpicLink[] = [];
  comment: EpicDetail = new EpicDetail();
  reference: EpicDetail = new EpicDetail();
  url: EpicDetail = new EpicDetail();
  link: EpicLink = new EpicLink();
  resourceMap = new Map<number, string>();
  epicMap = new Map<number, string>();
  makeTitleEditable: boolean = false;
  makeDescEditable: boolean = false;
  makeRiskEditable: boolean = false;
  anythingChanged:boolean = false;
  authService = inject(AuthService);
  rights  = new ResourceRightBean();
  constructor(public dialogRef: MatDialogRef<EpicComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private readonly util: Utils) {
    console.log('Epic....');
    this.originalBean = data.epicBean;
    this.epicBean = { ...this.originalBean };
    this.priorities = data.priorities;
    this.subComponents = data.subComponents;
    if (this.epicBean.id==0) {
      this.epicBean.active=true;
      this.epicBean.priorityId=null;
      this.epicBean.componentId=null;
      this.epicBean.forcefullyAdded=false;
      this.epicBean.code='EpicCode';
      this.epicBean.estimates = [];
      this.makeTitleEditable = true;
      this.makeDescEditable = true;
      this.makeRiskEditable = true;
    } else {
      this.epicService.getEpicBeanById(this.epicBean.id).subscribe({
        next: (data) => {
          this.epicBean = data;
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });

        this.epicService.getEpicDetails(this.epicBean.id).subscribe({
        next: (data) => {
          let epicDetails = data._embedded.epicDetails;
          epicDetails.forEach((e: EpicDetail)=>{
            this.getResourceName(e);
          })
          this.files = epicDetails.filter((e: EpicDetail)=>e.detailType===EpicDetailType.ATTACHED_FILE);
          this.comments = epicDetails.filter((e: EpicDetail)=>e.detailType===EpicDetailType.COMMENT);
          this.references = epicDetails.filter((e: EpicDetail)=>e.detailType===EpicDetailType.REFERENCE);
          this.urls = epicDetails.filter((e: EpicDetail)=>e.detailType===EpicDetailType.URL);
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
      this.epicService.getEpicLinks(this.epicBean.id).subscribe({
        next: (data) => {
          this.epicLinks = data._embedded.epicLinks;
          this.epicLinks.forEach(e=>{
            this.getEpicCode(e);
          })
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    }
    this.authService.getResourceRightsByProductId(this.epicBean.productId).subscribe({
      next: (data) => {
        this.rights = data;
      },
      error: (err) => {this.util.showErrorMessage(err);},
    });
  }
  getEpicCode(epicLink:EpicLink) {
    let epicId = epicLink.linkedEpicId;
    if (this.epicMap.has(epicId)) {
      epicLink.details = <string>this.epicMap.get(epicId);
    } else {
      this.epicService.getById(epicId).subscribe({
        next: (data) => {
          this.epicMap.set(epicId, data.code);
          epicLink.details = <string>this.epicMap.get(epicId);
        },
        error: (err) => (this.util.showErrorMessage(err)),
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

  addNewPriority = (newPriorityName: string) => {
    if (!newPriorityName) {
      return;
    }
        const pLevel = Math.max(0, ...this.priorities.map(p => p.priorityLevel)) + 1;
        let priority:Priority = new Priority();
        priority.name = newPriorityName;
        priority.companyId = this.authService.getCompanyId();
        priority.active = true;
        priority.priorityLevel=pLevel;
        //const newPriority = { id: newId, name: newPriorityName };
        this.priorityService.create(priority).subscribe({
          next: (data) => {
            this.util.showSuccessMessage('New priority is added.')
            this.priorities = [...this.priorities, data];
            this.epicBean.priorityId = data.id;
            this.epicBean.priorityName = data.name;
            this.epicBean.priorityLevel = data.priorityLevel;
            this.priorities.sort((a, b) => a.priorityLevel - b.priorityLevel);
            return data;

          },
          error: (err) => (this.util.showErrorMessage(err)),
        });
  };

  addNewSubComponent = (newName: string) => {
    if (!newName) {
      return;
    }
    let priority:SubComponent = new SubComponent();
    priority.name = newName;
    priority.companyId = this.authService.getCompanyId();
    priority.active = true;
    //const newPriority = { id: newId, name: newPriorityName };
    this.subComponentService.create(priority).subscribe({
      next: (data) => {
        this.util.showSuccessMessage('New component is added.')

        this.subComponents = [...this.subComponents, data];
        this.epicBean.componentId = data.id;
        this.epicBean.componentName = data.name;
        return data;
      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  };

  addEpicLink(epicLink: EpicLink): void {
    if (!epicLink) {
      alert("Please enter data");
      return;
    }
    this.anythingChanged = true;

    this.epicService.getByCompanyIdAndCode(this.util.getCompanyId(), epicLink.details.trim()).subscribe({
      next: (data) => {
        console.log("found:"+data._embedded.epics);
        if (data._embedded.epics.length==0) {
          alert("There is no deliverable with Code:"+epicLink.details);
          return;
        }
        const details = epicLink.details;
        epicLink.linkedEpicId = data._embedded.epics[0].id;
        epicLink.details = '';
        epicLink.epicId = this.epicBean.id;
        epicLink.active = true;
        this.epicService.createEpicLink(epicLink).subscribe({
          next: (data) => {
            this.getResourceName(data);
            data.details = details;
            this.epicLinks.push(data);
            this.link = new EpicLink();
            this.util.showSuccessMessage('Link is added.');
          },
          error: (err) => (this.util.showErrorMessage(err)),
        });

      },
      error: (err) => (this.util.showErrorMessage(err)),
    });
  }
  deleteEpicLink(epicLink:EpicLink) {
    this.anythingChanged = true;

    this.epicService.deleteEpicLink(epicLink.id).subscribe(blob => {
        this.epicLinks = this.epicLinks.filter(f => f.id !== epicLink.id);
    }, error => {
      console.error('Error in deleting.', error);
    });
  }

  addEpicDetail(epicDetail: EpicDetail, epicDetailType: EpicDetailType): void {
    if (!epicDetail) {
      alert("Please enter data");
      return;
    }
    this.anythingChanged = true;

    if (epicDetailType === EpicDetailType.COMMENT && !epicDetail.details) {
      alert("Please enter Comments");
      return;
    }
    epicDetail.epicId = this.epicBean.id;
    epicDetail.detailType = epicDetailType;
    epicDetail.active = true;
      this.epicService.createEpicDetail(epicDetail).subscribe({
        next: (data) => {
          if (epicDetail.detailType === EpicDetailType.COMMENT) {
            this.getResourceName(data);
            this.comments.push(data);
            this.comment = new EpicDetail();
            this.util.showSuccessMessage('Comment is added.');
          } else if (epicDetail.detailType === EpicDetailType.REFERENCE) {
            this.getResourceName(data);
            this.references.push(data);
            this.reference = new EpicDetail();
            this.util.showSuccessMessage('Reference is added.');
          } else if (epicDetail.detailType === EpicDetailType.URL) {
            this.getResourceName(data);
            this.urls.push(data);
            this.url = new EpicDetail();
            this.util.showSuccessMessage('Repo Url is added.');
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
    this.anythingChanged = true;

    if (this.epicBean.id>0) {
      this.epicService.uploadEpicDetailFile(this.epicBean.id,this.selectedFileForUpload,this.descriptionForFileUpload).subscribe({
        next: (data) => {
          this.getResourceName(data);
          this.descriptionForFileUpload = '';
          this.files.push(data);
          this.util.showSuccessMessage('File is uploaded.');
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    }
  }
  download(file:EpicDetail) {
    this.epicService.downloadEpicDetailFile(file.id).subscribe(blob => {
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
  deleteEpicDetail(epicDetail:EpicDetail) {
    this.anythingChanged = true;

    this.epicService.deleteEpicDetail(epicDetail.id).subscribe(blob => {
      if (epicDetail.detailType === EpicDetailType.ATTACHED_FILE) {
        this.files = this.files.filter(f => f.id !== epicDetail.id);
      } else if (epicDetail.detailType === EpicDetailType.COMMENT) {
        this.comments = this.comments.filter(f => f.id !== epicDetail.id);
      } else if (epicDetail.detailType === EpicDetailType.REFERENCE) {
        this.references = this.references.filter(f => f.id !== epicDetail.id);
      } else if (epicDetail.detailType === EpicDetailType.URL) {
        this.urls = this.urls.filter(f => f.id !== epicDetail.id);
      }


    }, error => {
      console.error('Error in deleting.', error);
    });
  }
  onSubmit(form: any): void {
    console.log('Form Submitted!', form.value);
    this.anythingChanged = true;
    this.makeTitleEditable = false;
    this.makeDescEditable = false;
    this.makeRiskEditable = false;
    if (this.epicBean.id==0) {
      this.epicService.create(this.epicBean).subscribe({
        next: (data) => {
          this.epicBean.id = data.id;
          this.fillMetadata(data);
          this.util.showSuccessMessage('Data is inserted.');
          this.originalBean = this.epicBean;
          //this.closeDialog();
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    } else {
      this.epicService.update(this.epicBean.id,
        this.epicBean).subscribe({
        next: (data) => {
          this.fillMetadata(data);
          this.util.showSuccessMessage('Data is updated');
          this.originalBean = this.epicBean;
          //this.closeDialog();
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    }

  }

  fillMetadata(data: Epic) {
    const priority = this.priorities.find(p => p.id === data.priorityId)
      ?? new Priority();
    this.epicBean.priorityName = priority.name;
    this.epicBean.priorityLevel = priority.priorityLevel;
    const subComp = this.subComponents.find(p => p.id === data.componentId)
      ?? new SubComponent();
    this.epicBean.componentName = subComp.name;
  }
  ngOnInit() {
    console.log('Child component initialized');
  }
  closeDialog(): void {
    let result = {epic:this.originalBean, anythingChanged:this.anythingChanged,
      releaseId:this.data.releaseId};
    console.log('Closing with:'+result);
    this.dialogRef.close(result);
  }
  closeDialogDoNothing(): void {
    let result = {};
    console.log('Closing with:'+result);
    this.dialogRef.close(result);
  }
  deleteEpicEstimate(id: number): void {
    if (window.confirm("Are you sure you want to delete?")) {
      this.epicService.delete(id).subscribe({
        next: (data) => {
          this.util.showSuccessMessage('Data is deleted');
//          this.epicEstimatBeans = this.epicEstimatBeans.filter(e=>e.id!==id);
        },
        error: (err) => (this.util.showErrorMessage(err)),
      });
    }
  }

  protected readonly EpicDetailType = EpicDetailType;
  protected readonly EpicLinkType = EpicLinkType;
  protected readonly formatDate = formatDate;
  protected readonly AppConstants = AppConstants;
  protected readonly isManager = isManager;
}
