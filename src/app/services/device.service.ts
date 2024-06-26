import { ObjectId } from 'mongodb';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { SyncRequestClient } from 'ts-sync-request/dist';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { Device } from '../shared/device';
import { LogService } from './log.service';

@Injectable({
  providedIn: 'root',
})
/**
 * Service for managing devices.
 */
export class DeviceService {
  baseurl = environment.baseurl
  private objectName = 'devices'

  constructor(
    private http: HttpClient,
    private logService: LogService,
    private ngZone: NgZone,
    private router: Router,
  ) {}

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  }

  /**
   * Retrieves the list of devices.
   * @returns An Observable that emits an array of Device objects.
   */
  GetDevices(): Observable<Device[]> {
    return this.http
      .get<Device[]>(environment.baseurl + '/' + this.objectName + '/')
      .pipe(retry(1), catchError(this.errorHandl))
  }

  /**
   * Retrieves a device by its ID.
   * @param id The ID of the device to retrieve.
   * @returns An Observable that emits the retrieved device.
   */
  GetDevice(id: ObjectId | null): Observable<Device> {
    return this.http
      .get<Device>(environment.baseurl + '/' + this.objectName + '/' + id, this.httpOptions)
      .pipe(retry(1), catchError(this.errorHandl))
  }

  /**
   * Retrieves a device by its ID and returns a synchronous request client.
   * @param id - The ID of the device to retrieve.
   * @returns A synchronous request client for getting the device.
   */
  getDeviceSynchronize(id: string | null) {
    return new SyncRequestClient().get<Device>(environment.baseurl + '/' + this.objectName + '/' + id)
  }

  /**
   * Retrieves a device synchronously by its ID.
   * @param id The ID of the device to retrieve.
   * @returns An Observable that emits the retrieved Device object.
   */
  GetDeviceSynchro(id: string | null): Observable<Device> {
    return this.http.get<Device>(environment.baseurl + '/' + this.objectName + '/' + id).pipe(
      map((res) => {
        return res
      }),
      catchError(this.errorHandl),
    )
  }

  /**
   * Deletes a device with the specified ID.
   * @param id The ID of the device to delete.
   * @returns An Observable that emits the deleted device.
   */
  DeleteDevice(id: ObjectId | null): Observable<Device> {
    return this.http
      .delete<Device>(environment.baseurl + '/' + this.objectName + '/' + id, this.httpOptions)
      .pipe(retry(1), catchError(this.errorHandl))
  }

  /**
   * Creates a new device.
   * @param data The device data to be created.
   * @returns An observable that emits the created device.
   */
  CreateDevice(data: Device): Observable<Device> {
    return this.http
      .post<Device>(
        environment.baseurl + '/' + this.objectName + '/',
        JSON.stringify(data, null, ' '),
        this.httpOptions,
      )
      .pipe(retry(1), catchError(this.errorHandl))
  }

  /**
   * Clones a device with the specified ID.
   *
   * @param id - The ID of the device to clone.
   * @returns The UUID of the cloned device.
   */
  CloneDevice(id: ObjectId | null): ObjectId {
    const local_id = new ObjectId()
    this.GetDevice(id).subscribe((value: Device) => {
      console.log('Get Device: ' + JSON.stringify(value, null, ' '))
      value._id = local_id
      this.CreateDevice(value).subscribe({
        next: (v) => {
          console.log('Create Device: ' + JSON.stringify(v, null, ' '))
          this.ngZone.run(() => this.router.navigateByUrl('device-list'))
        },
        complete: () => this.ngZone.run(() => this.router.navigateByUrl('device-list')),
      })
    })
    return local_id
  }

  /**
   * Updates a device with the specified ID.
   * @param id - The ID of the device to update.
   * @param data - The updated device data.
   * @returns An Observable that emits the updated device.
   */
  UpdateDevice(data: Device): Observable<Device> {
    console.log(
      'device.service.UpdateDevice: PUT ' +
        environment.baseurl +
        '/devices/' +
        data._id +
        '  ' +
        JSON.stringify(data, null, ' '),
    )
    return this.http
      .put<Device>(environment.baseurl + '/devices/' + data._id, JSON.stringify(data, null, ' '), this.httpOptions)
      .pipe(catchError(this.handleErrorTemplate<Device>('UpdateDevice', data)))
  }

  postDevice(data: Device): Observable<Device> {
    return this.http
      .post<Device>(`${environment.baseurl}/devices`, JSON.stringify(data, null, ' '), this.httpOptions)
      .pipe(retry(1), catchError(this.handleErrorTemplate<Device>('postLog', data)))
  }

  /**
   * Handles the error response from the server.
   * @param error - The error object containing the error message and status.
   * @returns An Observable that emits an error message.
   */
  errorHandl(error: { error: { message: string }; status: number; message: string }): Observable<never> {
    let errorMessage = ''
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message
    } else {
      errorMessage = `Error: ${error.status} Message: ${error.message}`
    }
    // console.log(`${error.message}`)

    return throwError(() => {
      return errorMessage
    })
  }

  /**
   * Handle Http operation that failed. Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleErrorTemplate<T>(operation = 'operation', result?: T) {
    return (error: Error): Observable<T> => {
      console.error(`DeviceService.handleErrorTemplate operation: ${operation}, error: ${error.message}`)
      return of(result as T)
    }
  }
}
