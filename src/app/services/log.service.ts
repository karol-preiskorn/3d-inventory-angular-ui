import { HttpClient, HttpHeaders } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, catchError, retry, throwError } from 'rxjs'
import { getDateString } from '../shared/utils'
import { v4 as uuidv4 } from 'uuid'

export class Log {
  id: string
  date: string
  category: string
  component: string
  message: string
}

export class LogInput {
  category: string
  component: string
  message: string
}

@Injectable({
  providedIn: 'root',
})
export class LogService {
  baseurl = 'http://localhost:3000'

  constructor(private http: HttpClient) {}

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  }

  GetLogs(): Observable<Log> {
    return this.http
      .get<Log>(this.baseurl + '/logs?_sort=date&_order=desc')
      .pipe(retry(1), catchError(this.errorHandl))
  }

  GetLog(id: string | null): Observable<Log> {
    return this.http
      .get<Log>(this.baseurl + '/logs/' + id, this.httpOptions)
      .pipe(retry(1), catchError(this.errorHandl))
  }

  DeleteLog(id: string): Observable<Log> {
    return this.http
      .delete<Log>(this.baseurl + '/logs/' + id, this.httpOptions)
      .pipe(retry(1), catchError(this.errorHandl))
  }

  // POST
  CreateLog(data: any): Observable<Log> {
    const log: Log = {
      id: uuidv4(),
      date: getDateString(),
      category: data.category,
      component: data.component,
      message: data.message,
    }
    this.addLog(log)
    return this.http
      .post<Log>(`${this.baseurl}/logs`, log, this.httpOptions)
      .pipe(retry(1), catchError(this.errorHandl))
  }

  addLog(data: LogInput) {
    this.http.post(`${this.baseurl}/logs`, data).subscribe(
      (data) => {
        console.log(
          'POST addLog -> Log Request is successful ',
          JSON.stringify(data)
        )
      },
      (error) => {
        console.log('Error addLog', error)
      }
    )
  }

  postLog(data: Log): Observable<Log> {
    return this.http
      .post<Log>(`${this.baseurl}/logs`, JSON.stringify(data), this.httpOptions)
      .pipe(retry(1), catchError(this.errorHandl))
  }

  private extractData(res: Response) {
    const body = res.json()
    return body || {}
  }

  // PUT
  UpdateLog(id: string | null, data: any): Observable<Log> {
    return this.http
      .put<Log>(
        this.baseurl + '/logs/' + id,
        JSON.stringify(data),
        this.httpOptions
      )
      .pipe(retry(1), catchError(this.errorHandl))
  }

  errorHandl(err: any) {
    let message = ''
    if (err.error instanceof ErrorEvent) {
      message = err.error.message
    } else {
      message = `Error Code: ${err.status}\nMessage: ${err.message}`
    }
    console.log(message)
    return throwError(() => {
      message
    })
  }
}