import {Basic} from './basic';

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
  public raisedByResourceId: number = 0;
  public dependOnEpicId: number = 0;
  public componentId: number = 0;
  public requiredBy: Date | null = null;
  public priorityId: number = 0;
  public comments: string = '';
  public risks: string = '';
  public valueGain: number = 0;
  public releaseId: number = 0;
  public forcefullyAdded: boolean = true;
  public startDate: Date | null = null;
  public endDate: Date | null = null;

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


