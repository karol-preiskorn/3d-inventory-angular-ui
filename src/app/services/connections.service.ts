import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable, NgZone } from '@angular/core'
import { Observable, throwError } from 'rxjs'
import { catchError, retry } from 'rxjs/operators'
import { v4 as uuidv4 } from 'uuid'
import { Connection } from '../shared/connection'
import { LogService } from './log.service'
import { Router } from '@angular/router'
import * as dotenv from 'dotenv'
import { env } from 'node:process'
@Injectable({
  providedIn: 'root',
})
export class ConnectionsService {
  baseurl: string | undefined = 'http://localhost:3000'
  constructor(
    private http: HttpClient,
    private logService: LogService,
    private ngZone: NgZone,
    private router: Router
  ) {
    dotenv.config()
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  }

  GetConnections(): Observable<Connection> {
    return this.http
      .get<Connection>(env.BASEURL + '/connections/')
      .pipe(retry(1), catchError(this.errorHandl))
  }

  GetConnection(id: string | null): Observable<Connection> {
    return this.http
      .get<Connection>(
        env.BASEURL + '/connections/' + id,
        this.httpOptions
      )
      .pipe(retry(1), catchError(this.errorHandl))
  }

  DeleteConnection(id: string): Observable<Connection> {
    return this.http
      .delete<Connection>(
        env.BASEURL + '/connections/' + id,
        this.httpOptions
      )
      .pipe(retry(1), catchError(this.errorHandl))
  }

  // POST
  CreateConnection(data: Connection): Observable<Connection> {
    return this.http
      .post<Connection>(
        env.BASEURL + '/connections/',
        JSON.stringify(data),
        this.httpOptions
      )
      .pipe(retry(1), catchError(this.errorHandl))
  }

  CloneConnection(id: string): string {
    const id_uuid: string = uuidv4()
    this.GetConnection(id).subscribe((value: Connection) => {
      console.log('Get Connections: ' + JSON.stringify(value))
      value.id = id_uuid
      this.CreateConnection(value).subscribe({
        next: (v) => {
          console.log('Create Connections: ' + JSON.stringify(v))
          this.ngZone.run(() => this.router.navigateByUrl('/connections-list'))
        },
        complete: () =>
          this.ngZone.run(() => this.router.navigateByUrl('/connections-list')),
      })
    })
    return id_uuid
  }
  // PUT
  UpdateConnection(id: string | null, data: any): Observable<Connection> {
    return this.http
      .put<Connection>(
        env.BASEURL + '/connections/' + id,
        JSON.stringify(data),
        this.httpOptions
      )
      .pipe(retry(1), catchError(this.errorHandl))
  }

  errorHandl(error: { error: { message: string }; status: any; message: any }) {
    let errorMessage = ''
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`
    }
    console.log(JSON.stringify(errorMessage))
    // logService.CreateLog({
    //   message: 'Error service Connections: ' + JSON.stringify(error.message),
    //   category: 'Error',
    //   component: 'ConnectionService.errorHandl',
    // })

    return throwError(() => {
      return errorMessage
    })
  }
}