import {HttpErrorResponse} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {AppConstants} from '../configuration/app.constants';
import {EpicLinkType, EpicStatusEnum, RelatedEpicDetailBean, ReleaseStatusEnum} from '../models/planning';
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
    // Client-side error
    errorMessage = `Error: ${error.error.message}`;
  } else  if (error.error && error.error.message) {
    // Client-side error
    errorMessage = `Error: ${error.error.message}`;
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

  //const dayMatch = timeString.match(/(\d+)\s*d/);
  const hourMatch = timeString.match(/(\d+)\s*h/);
  const minuteMatch = timeString.match(/(\d+)\s*m/);

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
    if (!isNaN(hours)) {
      totalMinutes = hours * 60;
    }
  }
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

export function relationData(epics:RelatedEpicDetailBean[] | null, linkType: EpicLinkType): string {
  if (!epics || epics.length==0) {
    return '';
  }
  var str = ''
  if (linkType==EpicLinkType.RELATED_TO) {
    str = "Related To: "
  } else if (linkType==EpicLinkType.DEPEND_ON) {
    str = "Depends On: "
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
    str += `<span class="${classStr}" title="${e.title}">${e.code}:${e.status}${byDate}</span>&nbsp;&nbsp;`
  });
  return str;

}

export function messageChange(input:string): string {
  var companyType = localStorage.getItem('companyType');
  if (!companyType || companyType==undefined) {
    return input;
  } else if (companyType==CompanyType.IT_PROJECT_BASE) {
    let output = input.replace(/\bProject\b/g, 'Product');
    output = output.replace(/\bProjects\b/g, 'Products');
    output = output.replace(/\bprojects\b/g, 'products');
    output = output.replace(/\bproject\b/g, 'product');
    output = output.replace(/\BPROJECT\b/g, 'PRODUCT');
    return output;
  } else if (companyType==CompanyType.IT_PRODUCT_BASE) {
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
