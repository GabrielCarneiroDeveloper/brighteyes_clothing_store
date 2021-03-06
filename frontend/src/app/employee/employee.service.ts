import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Employee } from './employee.models';
import { environment } from './../../environments/environment';
import {
  EmployeeStatus,
  EmployeeCreateDTO,
  EmployeeTitle,
  EmployeeRemoveDTO,
} from './employee.interfaces';
import { SuccessfullyResponse } from './../common/interfaces';

interface CreatedSuccessfullyResponse
  extends SuccessfullyResponse<
    Pick<Employee, 'id' | 'name' | 'email' | 'title' | 'status'>
  > {}

interface UpdatedSuccessfullyResponse extends SuccessfullyResponse<Employee> {}

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  constructor(private httpClient: HttpClient) {}

  getList(): Observable<Employee[]> {
    try {
      return this.httpClient.get<Employee[]>(
        `http://${environment.BACKEND_ADDRESS}/employees`
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

  getStatusList(): Observable<EmployeeStatus[]> {
    try {
      return this.httpClient.get<EmployeeStatus[]>(
        `http://${environment.BACKEND_ADDRESS}/employee-client-status`
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

  getTitleList(): Observable<EmployeeTitle[]> {
    try {
      return this.httpClient.get<EmployeeTitle[]>(
        `http://${environment.BACKEND_ADDRESS}/employee-title`
      );
    } catch (error) {
      throw new Error(error.message);
    }
  }

  create(employee: EmployeeCreateDTO): Observable<CreatedSuccessfullyResponse> {
    return this.httpClient.post<CreatedSuccessfullyResponse>(
      `http://${environment.BACKEND_ADDRESS}/employees`,
      employee
    );
  }

  async remove(
    employee: EmployeeRemoveDTO
  ): Promise<Observable<UpdatedSuccessfullyResponse>> {
    console.log(`try to remove employee "${employee.name}"`);
    const statusList = await this.getStatusList().toPromise();
    const deactivatedStatus = statusList.filter(
      (status) => status.name === 'DEACTIVATED'
    )[0];
    return this.httpClient.put<UpdatedSuccessfullyResponse>(
      `http://${environment.BACKEND_ADDRESS}/employees/` + employee.id,
      {
        status: deactivatedStatus.id,
      }
    );
  }

  update(employee: Partial<Employee>): Observable<UpdatedSuccessfullyResponse> {
    console.log(`try to remove employee "${employee.name}"`);
    delete employee.password;
    return this.httpClient.put<UpdatedSuccessfullyResponse>(
      `http://${environment.BACKEND_ADDRESS}/employees/` + employee.id,
      employee
    );
  }

  getOne(employeeId: number): Observable<Employee> {
    return this.httpClient.get<Employee>(
      `http://${environment.BACKEND_ADDRESS}/employees/` + employeeId
    );
  }
}
