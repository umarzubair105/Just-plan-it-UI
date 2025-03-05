import {Basic, Priority} from './basic';

export enum ReleaseStatusEnum {
  INITIATED="INITIATED",
  PLANNED="PLANNED",
  STARTED="STARTED",
  COMPLETED="COMPLETED",
  OVERDUE="OVERDUE"
}
export class Epic extends Basic {
  public productId: number = 0;
  public code: string = '';
  public title: string = '';
  public details: string = '';
  public raisedByResourceId: number | null = null;
  public dependOnEpicId: number | null = null;
  public componentId: number | null = null;
  public requiredBy: Date | null = null;
  public priorityId: number | null = null;
  public comments: string = '';
  public risks: string = '';
  public valueGain: number = 0;
  public releaseId: number | null = null;
  public forcefullyAdded: boolean = true;
  public startDate: Date | null = null;
  public endDate: Date | null = null;
}
export function EpicBeanCopyPasteUpdatedValues(source: EpicBean, target: EpicBean): void {
  target.title = source.title
  target.details = source.details;
  target.comments = source.comments;
  target.risks = source.risks;
  target.valueGain = source.valueGain;
  target.priorityName = source.priorityName;
  target.priorityId = source.priorityId;
  target.priorityLeve = source.priorityLeve;
  target.raisedByResourceId = source.raisedByResourceId;
  target.raisedByResourceName = source.raisedByResourceName;
  target.dependOnEpicCode = source.dependOnEpicCode;
  target.dependOnEpicId = source.dependOnEpicId;
  target.componentId = source.componentId;
  target.componentName = source.componentName;
  target.requiredBy = source.requiredBy;
  target.releaseId = source.releaseId;
  target.forcefullyAdded = source.forcefullyAdded;
  target.startDate = source.startDate;
  target.endDate = source.endDate;
  target.releaseId = source.releaseId;
  target.active = source.active;

}
export class EpicBean extends Epic {
  public priorityName: string | null = null;
  public priorityLeve: number | null = null;
  public componentName: string | null = null;
  public raisedByResourceName: string | null = null;
  public dependOnEpicCode: string | null = null;
  public estimates: EpicEstimateBean[] | null = null;
}

export class Release extends Basic{
  public productId: number = 0;
  public name: string = '';
  public version: number = 0;
  public workingDays: number = 0;
  public status: ReleaseStatusEnum = ReleaseStatusEnum.INITIATED;
  public startDate: Date | null = null;
  public endDate: Date | null = null;
}

export class EpicEstimate extends Basic {
  public epicId: number = 0;
  public resources: number = 0;
  public hours: number = 0;
  public roleId: number = 0;
}
export class EpicEstimateBean extends EpicEstimate {
  public roleName: string | null = null;
}


export class Product extends Basic {
  public companyId: number = 0;
  public name: string = '';
}
