import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Injectable } from '@angular/core';
import { Headers, Http, Response, RequestOptionsArgs } from '@angular/http';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs';

import { Config } from '../shared/index';

/**
 * https://github.com/watchforstock/evohome-client/blob/master/evohomeclient2/__init__.py
 */

@Injectable()
export class EvohomeService {
  private http: Http;
  private session: Observable<Session>;

  public constructor(http: Http) {
    this.http = http;
  }

  public getLocations(): Observable<Location[]> {
    if (!this.session) {
      this.session = this.login();
    }

    return this.session
      .flatMap((session: Session) => {
        let userId = session.user_id;
        let requestOpts = {
          headers: this.getHeaders(session),
        };

        return this.http
          .get(
            `${Config.evohome.API}/location/installationInfo?userId=${userId}&`
            + `includeTemperatureControlSystems=True`,
            requestOpts
          )
      })
      .map((response: Response) => {
        return <Location[]> response.json();
      });
  }

  private login(): Observable<Session> {
    let result = new ReplaySubject<Session>(1);

    let requestOpts = <RequestOptionsArgs> { headers: this.getHeaders() };
    let postData = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
      'Host': 'rs.alarmnet.com/',
      'Cache-Control': 'no-store no-cache',
      'Pragma': 'no-cache',
      'grant_type': 'password',
      'scope': 'EMEA-V1-Basic EMEA-V1-Anonymous EMEA-V1-Get-Current-User-Account',
      'Username': localStorage.getItem('evohome-username'),
      'Password': localStorage.getItem('evohome-password'),
      'Connection': 'Keep-Alive'
    }

    return this.http
      .post(`${Config.evohome.OAuth}`, JSON.stringify(postData), requestOpts)
      .map((response: Response) => {
        return <Session> response.json();
      })
      .flatMap((session) => { return this.getUserId(session); });
  }

  private getUserId(session: Session): Observable<Session> {
    let requestOpts = <RequestOptionsArgs> {
      headers: this.getHeaders(session),
    };
    return this.http.get(`${Config.evohome.API}/userAccount`)
      .map((response: Response) => <AccountInfo> response.json())
      .flatMap((accountInfo) => {
        session.user_id = accountInfo.userId;

        // Create a ReplaySubject so that future subscribers always receive a value
        let result = new ReplaySubject<Session>(1);
        result.next(session);

        return result;
      });
  }

  private getHeaders(session?: Session): Headers {
    if (session) {
      return new Headers({
        'Authorization': 'bearer ' + session.access_token,
        'applicationId': 'b013aa26-9724-4dbd-8897-048b9aada249',
        'Accept': 'application/json, application/xml, text/json, text/x-json, text/javascript, text/xml'
      });
    }
    return new Headers({
      'Authorization': 'Basic YjAxM2FhMjYtOTcyNC00ZGJkLTg4OTctMDQ4YjlhYWRhMjQ5OnRlc3Q=',
      'Accept': 'application/json, application/xml, text/json, text/x-json, text/javascript, text/xml'
    });
  }
}

interface Session {
  access_token: string,
  user_id: string,
}

interface AccountInfo {
  userId: string,
}

export interface Location {
  devices: Device[],
}

export interface Device {
  thermostatModelType: string,
  deviceID: string,
  name: string,
  thermostat: {
    indoorTemperature: string,
  },
}
