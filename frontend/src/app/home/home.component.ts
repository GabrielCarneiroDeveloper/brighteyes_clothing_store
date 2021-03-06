import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {
  SessionService,
  DataStoredInToken,
} from '../common/services/session.service';
import { EmployeeTitleEnum } from '../employee/employee.enum';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  session: DataStoredInToken;

  constructor(private sessionService: SessionService) {}

  ngOnInit(): void {
    this.session = this.sessionService.decodeSession();
  }

  isHumanResource(): boolean {
    return;
  }

  isCashier(): boolean {
    return;
  }

  isCustomerService(): boolean {
    return;
  }

  isSeller(): boolean {
    return;
  }

  isWarehouse(): boolean {
    return;
  }
}
