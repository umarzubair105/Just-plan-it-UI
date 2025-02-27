export class Basic {
  public id: number = 0;
  public active: boolean = true;
}

export class SubComponent extends Basic{
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

export class Resource extends Basic {
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
}
