import {Component, inject, OnInit} from '@angular/core';
import {
  CompanyService,
  Company,
  AddCompany,
  CommonResp,
  BaseModel,
  AddResource,
  AddProduct, AddEpic
} from '../services/company.service';
import { SectionComponent } from './section/section.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import {FormGroup, FormControl, FormBuilder} from '@angular/forms';
import {ReactiveFormsModule, Validators} from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatList, MatListItem} from '@angular/material/list';
import {MatIcon} from '@angular/material/icon';
import { ShowErrorsDirective } from '../show-errors.directive';
import {ActivatedRoute, Router} from '@angular/router';
import {ExcelService} from '../services/excel.service';
import {Utils} from '../utils/utils';

//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-upload-epic',
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, SectionComponent,
    MatButtonModule, MatToolbarModule, MatInputModule,
    MatCheckboxModule, MatFormFieldModule,
    MatListItem, MatList, MatIcon,ReactiveFormsModule, ShowErrorsDirective
  ], // Include FormsModule here
  //template:`Hello`,
  //templateUrl: './company.component.html',
  templateUrl: './upload.epic.component.html',
  styleUrls: ['./upload.epic.component.css'],

})
export class UploadEpicComponent implements OnInit {
  excelHeaders: string[] = []; // Headers from Excel
  rawData: any[] = []; // Raw Excel data
  excelHeadersUnmapped: string[] = [];
  mappedHeaders: { [key: string]: string } = {}; // system is key, value is excel header
  //transformedData: any[] = []; // Final transformed data

  // Predefined field names in our system
  predefinedFields:string[] = [];//['description','component', 'version', 'priority:',
      //'requiredBy','valueGain','comments','risks'];
  requiredFields:{ [key: string]: string } = {'title':'required'};
  dateFormat: string = '';
  dateFormats:string[] = ['dd/MM/yyyy','dd-MM-yyyy', 'MM/dd/yyyy', 'MM-dd-yyyy']
  // Predefined field names in our system
  predefinedFieldLabels:{ [key: string]: string } = {'title':'Deliverable/Epic/Story',
    'details':'Details',
    'component':'Component/Module', 'version':'Version', 'priority':'Priority',
    'requiredBy':'Date Required By','valueGain':'Value Gain (Number)',
    'comments':'Comments',
    'risks':'Risks'};
  roles: BaseModel[] = [];
  errorMessage: string = '';
  //companyId!: number;
  productId! : number;
  //addCompanySetup: AddCompany = { countryId:1, sampleCompanyId:1,name:'',email:'',firstName:'',secondName:'',lastName:'',designation:'' };

  //newCompany: Company = { id: 0, name: '', sample: false };
  companyService = inject(CompanyService)
  //constructor(private companyService: CompanyService) {}
  addProductSetup: AddProduct = { companyId:0, name:'',
    emailProductManager:'',emailProductOwner:'' };

/*  private readonly COLUMN_MAPPING: { [key: string]: string } = {
    "Code": "cc",
    "Help Text": "desc",
    "Description": "desp",
    "Designation": "designation"
  };*/

  myForm: FormGroup;
  constructor(private fb: FormBuilder, private utils: Utils,
              private router: Router,
              private excelService: ExcelService,
              private route: ActivatedRoute) {
    console.log('Construct')
    this.predefinedFields = Object.keys(this.predefinedFieldLabels).filter(key => key!== 'id');
    this.myForm = this.fb.group({
      //name: ['', [Validators.required]],
      //emailProductManager: ['', [Validators.required, Validators.email]],
      //emailProductOwner: ['', [Validators.required, Validators.email]],
//      countryId: [2, Validators.required],
//      phone: ['', [Validators.required, Validators.pattern('^\\d{10}$')]], // 10-digit number
    });
  }
  ngOnInit(): void {
    this.productId = Number(this.route.snapshot.paramMap.get('productId'));
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.excelService.readExcelFile(file).then(({ headers, data }) => {
      this.excelHeaders = headers;
      this.rawData = data;
      //this.transformedData = this.rawData;
      this.excelHeadersUnmapped = headers;
    }).catch(error => console.error('Error reading Excel:', error));
  }

  isFormValid():boolean {
    const allReqFilled  = Object.keys(this.requiredFields)
      .filter(reqField => {return !!this.mappedHeaders[reqField]===false}).length === 0;
    if (allReqFilled) {
      if (!!this.mappedHeaders['requiredBy']) {
        if (!!this.dateFormat) {
          return true;
        }
        return false;
      }
      return true;
    }
    return false;
  }
  onReset():void {
    this.mappedHeaders = {};
    this.excelHeadersUnmapped = this.excelHeaders.filter(header =>this.searchExcelColumnMapping(header)==='Unmapped');
  }
  onSubmit() {
    //if ()

    const epics: AddEpic[] = [];
    //this.transformedData = tthis.rawData.map
    this.rawData.forEach(row => {
      let transformedRow: any = {};
      Object.keys(this.mappedHeaders).forEach(mappedKey => {
        const excelHeader = this.mappedHeaders[mappedKey]; // User-selected field
        //this.excelHeadersUnmapped[excelHeader] = undefined;
        if (mappedKey) {
          transformedRow[mappedKey] = row[excelHeader];
        }
      });
      transformedRow['productId'] = this.productId; // Hardcoding productId for now.
      transformedRow['dateFormat'] = this.dateFormat; // Hardcoding productId for now.
      //console.log('C');
      epics.push(transformedRow);
      //return transformedRow;
    });
    this.companyService.addEpics(epics).subscribe({
      next: (data) => {
        // action: string = 'Close'
        this.utils.showSuccessMessage(data[0].message);
        this.router.navigate(['/priority', 1]);
        //this.newCompany = { id: 0, name: '', sample: false };
      },
      error: (err) => {this.errorMessage = err; this.utils.showErrorMessage(err);},
    });
  }


  onMappingChange() {
    //const mappedKeys = Object.keys(this.mappedHeaders).filter(key =>!!this.mappedHeaders[key]);

    //const mappedValues = Object.keys(this.mappedHeaders).map(key =>this.mappedHeaders[key]);
    this.excelHeadersUnmapped = this.excelHeaders.filter(header =>this.searchExcelColumnMapping(header)==='Unmapped');
  }

  searchExcelColumnMapping(searchValue: string): string  {
    const entry = Object.entries(this.mappedHeaders)
      .find(([key, value]) => value === searchValue);
    return entry ? entry[0] : 'Unmapped';
  }

/*  onMappingChange() {
    this.transformedData = this.rawData.map(row => {
      let transformedRow: any = {};
      Object.keys(this.mappedHeaders).forEach(excelHeader => {
        const mappedKey = this.mappedHeaders[excelHeader]; // User-selected field
        if (mappedKey) {
          transformedRow[mappedKey] = row[excelHeader];
        }
      });
      return transformedRow;
    });
  }*/

/*  onFileChange(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.excelService.readExcelFile(file).then((data) => {
      this.excelData = data;
      this.excelHeaders = data.length > 0 ? Object.keys(data[0]) : [];

      this.mappedData = mapJsonData

    }).catch((error) => {
      console.error('Error reading Excel file:', error);
    });
  }*/



}
