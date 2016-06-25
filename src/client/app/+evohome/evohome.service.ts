import { Injectable } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { AsyncSubject } from 'rxjs/AsyncSubject';
import { Observable } from 'rxjs/Observable';

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

  public getLocations(): Observable<Location> {
    let result = new AsyncSubject<Location>();

    if (!this.session) {
      this.session = this.login();
    }

    this.session.subscribe(
      (session) => {
        let userId = session.userInfo.userId;
        let requestOpts = {
          headers: new Headers({
            'content-type': 'application/json',
            'sessionId': session.sessionId,
          }),
        };

        return this.http
          .get(
            `${Config.evohome.API}/locations?userId=${userId}&allData=True`,
            requestOpts
          )
          .map((response) => {
            return <Location> response.json();
          })
          .subscribe((location) => {
            result.next(location);
            result.complete();
          });

      });

      return result;
  }

  private login(): Observable<Session> {
    let postData = {
      'Username': localStorage.getItem('evohome-username'),
      'Password': localStorage.getItem('evohome-password'),
      'ApplicationId': '91db1612-73fd-4500-91b2-e63b069b185c'
    };
    let requestOpts = {
      headers: new Headers({'content-type': 'application/json'}),
    }
    return this.http
      .post(`${Config.evohome.API}/Session`, postData, requestOpts)
      .map((response) => {
        return <Session> response.json();
      });
  }
}

interface Session {
  userInfo: {
    userId: string,
  },
  sessionId: string,
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
