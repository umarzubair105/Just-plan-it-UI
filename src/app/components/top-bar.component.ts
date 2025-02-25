import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import {CommonModule} from '@angular/common';
import {Utils} from '../utils/utils';

@Component({
  selector: 'app-top-bar',
  templateUrl: './top-bar.component.html',
  standalone:true,
  imports: [CommonModule],  // Import necessary modules
  //styleUrls: ['./top-bar.component.css']
})
export class TopBarComponent implements OnInit {
  userName: string | null = '';

  constructor(private authService: AuthService,
              private utils: Utils) {}

  ngOnInit() {
    console.log('TopBarComponent');
    this.authService.userName$.subscribe(name => {
      console.log('TopBarComponent:'+name);
      this.userName = name;
    });
  }

  logout() {
    this.authService.logout();
    this.utils.navigateToResource('/home'); // Redirect to a secure page
  }
}
