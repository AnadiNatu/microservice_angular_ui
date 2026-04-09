import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomCurrencyPipe } from '../../../shared/pipes/custom-currency.pipe';


@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
  standalone : true,
  imports: [FormsModule , CommonModule , CustomCurrencyPipe , RouterModule , HeaderComponent , SidebarComponent],
})
export class AdminLayoutComponent {
  constructor() {
    console.log('AdminLayoutComponent initialized');
  }
}