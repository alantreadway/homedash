import { Component, OnInit } from '@angular/core';
import { REACTIVE_FORM_DIRECTIVES } from '@angular/forms';
import { Observable } from 'rxjs/Observable';

import { EvohomeService, Location } from './evohome.service';

@Component({
  moduleId: module.id,
  selector: 'hd-evohome',
  templateUrl: 'evohome.component.html',
  directives: [REACTIVE_FORM_DIRECTIVES]
})
export class EvohomeComponent {
  private locations: Observable<Location>;

  private evohomeService: EvohomeService;

  public constructor(evohomeService: EvohomeService) {
    this.evohomeService = evohomeService;
  }

  public ngOnInit(): void {
    this.locations = this.evohomeService.getLocations();
  }
}
