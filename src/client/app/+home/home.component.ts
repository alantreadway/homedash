import { Component } from '@angular/core';
import { REACTIVE_FORM_DIRECTIVES } from '@angular/forms';

import { EvohomeComponent } from '../+evohome/index';

/**
 * This class represents the lazy loaded HomeComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'hd-home',
  templateUrl: 'home.component.html',
  directives: [EvohomeComponent, REACTIVE_FORM_DIRECTIVES]
})
export class HomeComponent {
}
