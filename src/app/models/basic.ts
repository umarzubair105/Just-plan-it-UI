export class Basic {
  public id: number = 0;
  public active: boolean = true;
}

export class Audit extends Basic {
  public createdById: number = 0;
  public createdByName: string | null = null;
  public createdDate: Date | null = null;
  public updatedById: number = 0;
  public updatedByName: string | null = null;
  public updatedDate: Date | null = null;
}

export class Company  extends Basic {
  public name: string = '';
  public sample: boolean = false;
}

export class SubComponent extends Audit{
  public name: string = '';
  public companyId: number = 0;
}
export class Priority extends Basic{
  public name: string = '';
  public companyId: number = 0;
  public priorityLevel: number = 20;
}

export class Role extends Basic{
  public name: string = '';
  public companyId: number = 0;
  public taskAssignable: boolean = false;
}

export class ResourceRole extends Basic{
  public roleId: number = 0;
  public resourceId: number = 0;
}

export class Resource extends Audit {
  public companyId: number = 0;
  public name: string = '';
  public email: string = '';
  public mobileNumber: string = '';
  public designationId: number = 0;
  public leadResourceId: number = 0;
  public countryId: number = 0;
  public lead: boolean = true;
  public individualCapacity: boolean = true;
  public dateOfBirth: Date | null = null;
  public lastWorkingDate: Date | null = null;
  public status: ResourceStatus = ResourceStatus.ACTIVE;
}

export class ResourceProjection {
  public id: number = 0;
  public name: string = '';
}
export class ProductProjection {
  public id: number = 0;
  public name: string = '';
}

export class ProductResource extends Basic {
  public productId: number = 0;
  public resourceId: number = 0;
  public roleId: number = 0;
  public participationPercentTime: number = 0;
}

export class ProductResourceBean extends ProductResource {
  public productName: string = '';
  public resourceName: string = '';
}

export enum LeaveStatus {
  PENDING="PENDING", APPROVED="APPROVED", REJECTED="REJECTED"
}
export enum ResourceStatus {
  ACTIVE="ACTIVE", INACTIVE="INACTIVE"
}
export enum LeaveType {
  SICK_LEAVE, CASUAL_LEAVE, ANNUAL_LEAVE, COMPENSATION_LEAVE,
  SHORT_LEAVE
}
export class ResourceLeave extends Basic {
  public resourceId: number = 0;
  public approvedBy: number = 0;
  public startDate: Date | null = null;
  public endDate: Date | null = null;
  public days: number = 0;
  public status: LeaveStatus = LeaveStatus.PENDING;
  public leaveType: LeaveType = LeaveType.CASUAL_LEAVE;
  public reason: string = '';
  public approvedAt: Date | null = null;
}


