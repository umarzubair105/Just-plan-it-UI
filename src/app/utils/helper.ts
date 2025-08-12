import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {AppConstants} from '../configuration/app.constants';
import {
  EpicAssignmentBean,
  EpicAssignmentStatusEnum, EpicEstimateBean,
  EpicLinkType,
  EpicStatusEnum,
  RelatedEpicDetailBean,
  ReleaseStatusEnum
} from '../models/planning';
import {CompanyType, ResourceRightBean} from '../models/basic';


export enum ReleaseIteration {
  ANNUAL="ANNUAL",
  SEMI_ANNUAL = "SEMI_ANNUAL",
  QUARTERLY = "QUARTERLY",
  BI_MONTHLY = "BI-MONTHLY",
  MONTHLY = "MONTHLY",
  TRI_WEEKLY = "TRI-WEEKLY",
  BI_WEEKLY = "BI-WEEKLY",
  WEEKLY = "WEEKLY",
}
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function isLoggedIn(): boolean {
  return localStorage.getItem(AppConstants.TOKEN_KEY) !== null;
}

export function capitalizeFirstLetter(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function isGlobalHR(right:ResourceRightBean): boolean {
  return right.globalAdmin || right.globalHr;
}
export function isGlobalManager(right:ResourceRightBean): boolean {
  return right.globalAdmin || right.globalManager;
}
export function isManager(right:ResourceRightBean): boolean {
  return right.globalAdmin || right.globalManager || right.productManager;
}
export function handleError(error: HttpErrorResponse): Observable<never> {
  let errorMessage = 'An unknown error occurred!';
  console.error('>>>>>');
  console.error(error);
  if (error.error instanceof ErrorEvent) {
    console.error('ErrorEvent');
    // Client-side error
    errorMessage = `Error: ${error.error.message}`;
  } else  if (error.error && error.error.message) {
    console.error('Not ErrorEvent');
    // Client-side error
    errorMessage = `Error: ${error.error.message}`;
  } else {
    // Server-side error
    errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
  }
  return throwError(messageChange(errorMessage));
}
export function handleErrorLogin(error: HttpErrorResponse): Observable<never> {
  let errorMessage = 'An unknown error occurred!';
  console.error('>>>>>');
  console.error(error);
  if (error.error instanceof ErrorEvent) {
    console.error('ErrorEvent');
    // Client-side error
    errorMessage = `Error: ${error.error.message}`;
  } else  if (error.error && error.error.message) {
    console.error('Not ErrorEvent');
    // Client-side error
    errorMessage = `Error: ${error.error.error}`;
  } else {
    // Server-side error
    errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
  }
  return throwError(messageChange(errorMessage));
}

export function getLocalDate(): Date {
  const today = new Date();
  // Create YYYY-MM-DD string in local time
  const localDateString = today.toISOString().split('T')[0];
  return new Date(localDateString);
}

export function convertToMinutes(timeString: string): number {

  let totalMinutes = 0;
  console.log('convertToMinutes input:'+timeString);
  //const dayMatch = timeString.match(/(\d+)\s*d/);
  const hourMatch = timeString.match(/(\d+(?:\.\d+)?)\s*h/);
  const minuteMatch = timeString.match(/(\d+)\s*m/);
  console.log('convertToMinutes hourMatch:'+hourMatch);
  console.log('convertToMinutes minuteMatch:'+minuteMatch);

  //if (dayMatch) {
    //totalMinutes += parseInt(dayMatch[1], 10) * 24 * 60;
  //}
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1], 10) * 60;
  }
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1], 10);
  }
  if (totalMinutes==0) {
    const hours = Number(timeString);
    console.log('convertToMinutes hourMatch:'+minuteMatch);
    if (!isNaN(hours)) {
      totalMinutes = hours * 60;
    }
  }
  console.log('convertToMinutes totalMinutes:'+totalMinutes);
  return totalMinutes;

}
export function transformToDhM(totalMinutes: number): string {
  if (isNaN(totalMinutes) || totalMinutes < 0) {
    return 'Invalid time';
  }

  //const days = Math.floor(totalMinutes / (24 * 60));
  //const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  //const minutes = totalMinutes % 60;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  //return `${hours}h ${totalMinutes}m`;

  let result = '';
  //if (days > 0) result += `${days}d `;
  if (hours > 0) result += `${hours}h `;
  if (minutes > 0) result += `${minutes}m`;



  return result.trim();
}

export function releaseStatusClass(status: ReleaseStatusEnum | undefined): string {
  if (!status) {
    return 'release-status-badge';
  } else {
    return 'release-status-badge release-status-'+status.toLowerCase();
  }
}

export function relationData(epics:RelatedEpicDetailBean[] | null, linkType: EpicLinkType, showTitle: boolean): string {
  if (!epics || epics.length==0) {
    return '';
  }
  var str = ''
  if (showTitle) {
    if (linkType == EpicLinkType.RELATED_TO) {
      str = "Related To: "
    } else if (linkType == EpicLinkType.DEPEND_ON) {
      str = "Depends On: "
    }
  }
  epics.forEach(e=> {
    var classStr = 'link-open';
    var byDate = '';
    if (e.status==EpicStatusEnum.RESOLVED) {
      classStr = 'link-resolved';
    } else if (e.releaseDate!=null) {
      classStr = 'link-planned';
      byDate = ` - Planned by ${e.releaseDate}`
    }
    str += `<span class="${classStr}" title="Status: ${e.status}, Title: ${e.title}${byDate}">${e.code}</span>&nbsp;`
  });
  return str;

}

export function assignmentStatusClass(assignment: EpicAssignmentBean): string {
  var classStr = 'table-light';
  const today = new Date();
  today.setHours(0, 0, 0, 0);  // strip time
  if (assignment.status==EpicAssignmentStatusEnum.COMPLETED) {
    classStr = 'table-success';
  } else if (assignment.expectedDeliveryDate && new Date(assignment.expectedDeliveryDate) < today) {
    classStr = 'table-danger'
  } else if (assignment.status==EpicAssignmentStatusEnum.ON_HOLD || assignment.status==EpicAssignmentStatusEnum.OVERDUE) {
    classStr = 'table-warning';
  }
  return classStr;
  //return `<span class="${classStr}" title="${e.title}">${e.code}:${e.status}${byDate}</span>&nbsp;&nbsp;`
}


export function assignmentStatusShow(assignment: EpicAssignmentBean): string {
  var iconStr = '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);  // strip time
  if (assignment.status==EpicAssignmentStatusEnum.COMPLETED) {
    iconStr = 'bi-check-circle';
  } else if (assignment.status==EpicAssignmentStatusEnum.ON_HOLD) {
    iconStr = 'bi-slash-circle';
  } else if (assignment.status==EpicAssignmentStatusEnum.OVERDUE) {
    iconStr = 'bi-x-octagon';
  } else if (assignment.status==EpicAssignmentStatusEnum.STARTED) {
    iconStr = 'bi-hourglass-split';
  } else if (assignment.status==EpicAssignmentStatusEnum.OPEN) {
    iconStr = 'bi-unlock';
  }
  return `<span><i class="bi ${iconStr}" title="${assignment.status}"></i>&nbsp;${assignment.status}</span>`
}

export function epicAssignmentStatusIconClass(assignments: EpicAssignmentBean[]|null): string {
  if (!assignments) {
    return 'bi bi-arrow-repeat text-primary m-1';
  } else if (assignments.filter(a => a.status != EpicAssignmentStatusEnum.COMPLETED).length == 0) {
    return 'bi bi-check-circle-fill text-success m-1';
  } else if (assignments.filter(a => a.status == EpicAssignmentStatusEnum.OVERDUE).length >0) {
    return 'bi bi-exclamation-circle-fill text-danger m-1'
  } else{
    return 'bi bi-arrow-repeat text-primary m-1';
  }
}

export function estimateStatusClass(estimate: EpicEstimateBean): string {
  var classStr = '';
  if (estimate.id==0 && estimate.estimate==0 ) {
    classStr = 'link-open';
  } else if (estimate.estimate==0) {
    classStr = 'link-planned'
  } else  {
    classStr = 'link-resolved';
  }
  return classStr;
  //return `<span class="${classStr}" title="${e.title}">${e.code}:${e.status}${byDate}</span>&nbsp;&nbsp;`
}

export function isDateOver(date: Date|null): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);  // strip time
  if (date) {
    return new Date(date) >= today;
  }
  return false;
}
export function isDateStarted(date: Date|null): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);  // strip time
  if (date) {
    return new Date(date) <= today;
  }
  return false;
}

export function messageChange(input:string): string {
  var companyType = localStorage.getItem('companyType');
  if (!companyType || companyType==undefined) {
    return input;
  } else if (companyType==CompanyType.IT_PRODUCT_BASE) {
    let output = input.replace(/\bProject\b/g, 'Product');
    output = output.replace(/\bProjects\b/g, 'Products');
    output = output.replace(/\bprojects\b/g, 'products');
    output = output.replace(/\bproject\b/g, 'product');
    output = output.replace(/\BPROJECT\b/g, 'PRODUCT');
    return output;
  } else if (companyType==CompanyType.IT_PROJECT_BASE) {
    let output = input.replace(/\bProduct\b/g, 'Project');
    output = output.replace(/\bProducts\b/g, 'Projects');
    output = output.replace(/\bproducts\b/g, 'projects');
    output = output.replace(/\bproduct\b/g, 'project');
    output = output.replace(/\bPRODUCT\b/g, 'PROJECT');
    return output;
  } else if (companyType==CompanyType.OTHERS) {
    let output = input.replace(/\bProduct\b/g, 'Project');
    output = output.replace(/\bProducts\b/g, 'Projects');
    output = output.replace(/\bproducts\b/g, 'projects');
    output = output.replace(/\bproduct\b/g, 'project');
    output = output.replace(/\bPRODUCT\b/g, 'PROJECT');
    return output;
  }
  return input;
}
export function getToDayDate():string {
  return new Date().toISOString().split('T')[0];
}
