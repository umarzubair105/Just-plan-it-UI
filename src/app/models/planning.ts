import {Audit, Basic, Priority} from './basic';
import {ReleaseIteration} from '../utils/helper';

export enum EpicStatusEnum {
  OPEN="OPEN",
  RESOLVED="RESOLVED",
  DELETED="DELETED",
  REOPEN="REOPEN"
}
export enum ReleaseStatusEnum {
  UNPLANNED="UNPLANNED",
  PLANNED="PLANNED",
  STARTED="STARTED",
  COMPLETED="COMPLETED",
  OVERDUE="OVERDUE"
}
export enum EpicAssignmentStatusEnum {
  OPEN="OPEN",
  STARTED="STARTED",
  ON_HOLD="ON_HOLD",
  COMPLETED="COMPLETED",
  OVERDUE="OVERDUE"
}
export enum EpicDetailType {
  COMMENT="COMMENT",
  ATTACHED_FILE="ATTACHED_FILE",
  REFERENCE="REFERENCE",
  URL="URL"
}
export enum EpicLinkType {
  RELATED_TO="RELATED_TO",
  DEPEND_ON="DEPEND_ON"
}
export enum EntityDetailType {
  ATTACHED_FILE="ATTACHED_FILE",
  URL="URL"
}
export enum EntityType {
  COMPANY="COMPANY",
  RELEASE="RELEASE",
  RESOURCE="RESOURCE",
  PRODUCT="PRODUCT"
}
export class Epic extends Audit {
  public productId: number = 0;
  public code: string = '';
  public title: string = '';
  public details: string = '';
  public raisedByResourceId: number | null = null;
  public status: EpicStatusEnum = EpicStatusEnum.OPEN;
  public componentId: number | null = null;
  public replicatedById: number | null = null;
  public requiredBy: Date | null = null;
  public priorityId: number | null = null;
  public comments: string = '';
  public risks: string = '';
  public valueGain: number = 0;
  public releaseId: number | null = null;
  public forcefullyAdded: boolean = true;
  public startDate: Date | null = null;
  public endDate: Date | null = null;
  public replicate: boolean = false;
}
export function EpicBeanCopyPasteUpdatedValues(source: EpicBean, target: EpicBean): void {
  target.title = source.title
  target.details = source.details;
  target.comments = source.comments;
  target.risks = source.risks;
  target.valueGain = source.valueGain;
  target.priorityName = source.priorityName;
  target.priorityId = source.priorityId;
  target.priorityLevel = source.priorityLevel;
  target.raisedByResourceId = source.raisedByResourceId;
  target.raisedByResourceName = source.raisedByResourceName;
  target.componentId = source.componentId;
  target.status = source.status;
  target.componentName = source.componentName;
  target.requiredBy = source.requiredBy;
  target.releaseId = source.releaseId;
  target.forcefullyAdded = source.forcefullyAdded;
  target.startDate = source.startDate;
  target.endDate = source.endDate;
  target.releaseId = source.releaseId;
  target.active = source.active;
  target.replicate = source.replicate;
  target.replicatedById = source.replicatedById;

}
export class EpicBean extends Epic {
  public priorityName: string | null = null;
  public priorityLevel: number = 0;
  public componentName: string | null = null;
  public raisedByResourceName: string | null = null;
  public release: Release | null = null;
  public estimates: EpicEstimateBean[] | null = null;
  public assignments: EpicAssignmentBean[] | null = null;
  public dependsOn: RelatedEpicDetailBean[] | null = null;
  public relatedTo: RelatedEpicDetailBean[] | null = null;
  public expanded: boolean = true;
  public editingPriority: boolean = false;
  public editingValueGain: boolean = false;
  public editingRequiredBy: boolean = false;
//  public : boolean = true;
}

export class Release extends Basic{
  public productId: number = 0;
  public name: string = '';
  public version: number = 0;
  public workingDays: number = 0;
  public status: ReleaseStatusEnum = ReleaseStatusEnum.UNPLANNED;
  public startDate: Date | null = null;
  public endDate: Date | null = null;
}

export class EpicEstimate extends Basic {
  public epicId: number = 0;
  public resources: number = 0;
  public estimate: number = 0;
  public roleId: number = 0;
  public estimateStr: string = '';
}
export class EpicEstimateBean extends EpicEstimate {
  public roleName: string | null = null;
  public editingResources: boolean = false;
  public editingTime: boolean = false;
}
export class EpicAssignment extends Audit {
  public epicId: number = 0;
  public resourceId: number = 0;
  public releaseId: number = 0;
  public estimate: number = 0;
  public roleId: number = 0;
  public expectedDeliveryDate: Date | null = null;
  public editingExpectedDeliveryDate: boolean = false;
  public status: EpicAssignmentStatusEnum = EpicAssignmentStatusEnum.OPEN;
}
export class EpicAssignmentBean extends EpicAssignment {
  public roleName: string = '';
  public resourceName: string  = '';
  public minutesLogged: number = 0;

}

export class TimeLogging extends Basic {
  public epicId: number = 0;
  public resourceId: number = 0;
  public releaseId: number = 0;
  public minutes: number = 0;
  public loggedForDate: Date | null = null;
  public comments: string | null = null;
}
export class Product extends Audit {
  public companyId: number = 0;
  public name: string = '';
  code: string = '';
  otherActivitiesPercentTime: number=10;
  releaseIteration: ReleaseIteration | null= null;
  startDate: Date | null=null;
  endDate: Date | null=null;
  public productManagerId: number = 0;
  public productOwnerId: number = 0;
}

export class ScheduleEpic {
  public epicId: number = 0;
  public releaseToAddIn: Release | null = null;
}
export class RelatedEpicDetailBean {
  public id: number = 0;
  public code: string | null = null;
  public title: string | null = null;
  public status: EpicStatusEnum | null = null;
  public releaseDate: Date | null = null;
}
export class ReleaseDetailBean {
  public release: Release = new Release();
  public product: Product = new Product();
  public resourceCaps: ResourceCapInRelease[] = [];
  public epics: EpicBean[] = [];
  public expanded: boolean = false;
}

export class ResourceCapInRelease {
  public roleId: number =0;
  public roleName: string | null=null;
  public resourceId: number =0;
  public resourceName: string | null=null;
  public workingDays: number =0;
  public availableTime: number =0;
  public prodBasedAssignableTime: number =0;
  public prodBasedAssignedTime: number =0;
  public prodBasedExtraTime: number =0;
  public loggedTime: number =0;
}
export class EpicDetail extends Audit {
  public epicId: number = 0;
  public name: string = '';
  public details: string = '';
  public detailType: EpicDetailType = EpicDetailType.COMMENT;
}
export class EpicLink extends Audit {
  public epicId: number = 0;
  public linkedEpicId: number = 0;
  public details: string = '';
  public linkType: EpicLinkType = EpicLinkType.RELATED_TO;
}

export class EntityDetail extends Audit {
  public entityId: number = 0;
  public name: string = '';
  public details: string = '';
  public detailType: EntityDetailType = EntityDetailType.ATTACHED_FILE;
  public entityType: EntityType = EntityType.PRODUCT;
}
