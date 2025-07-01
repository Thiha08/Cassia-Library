import { Component } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {FormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { AppCodeViewComponent } from 'src/app/components/code-view/code-view.component';

// snippets
import { BASIC_SNACKBAR_HTML_SNIPPET, CONFIGURABLE_SNACKBAR_HTML_SNIPPET, CUSTOM_COMPONENT_SNACKBAR_HTML_SNIPPET } from './code/snackbar-html-snippet';
import { BASIC_SNACKBAR_TS_SNIPPET, CONFIGURABLE_SNACKBAR_TS_SNIPPET, CUSTOM_COMPONENT_SNACKBAR_TS_SNIPPET } from './code/snackbar-ts-snippet';

import { Highlight, HighlightAuto } from 'ngx-highlightjs';
import { HighlightLineNumbers } from 'ngx-highlightjs/line-numbers';

@Component({
    selector: 'app-custom-snackbar',
    templateUrl: 'snackbar-custom.component.html',
    styles: [
        `
      .example-pizza-party {
        color: hotpink;
      }
    `,
    ],
    standalone: false
})
export class PizzaPartyComponent {}

@Component({
    selector: 'app-snackbar',
    imports: [MatFormFieldModule, FormsModule, MatInputModule, MatButtonModule, MatSelectModule, MatCardModule,
      Highlight,
      HighlightAuto,
      HighlightLineNumbers,
      AppCodeViewComponent,
    ],
    templateUrl: './snackbar.component.html'
})
export class AppSnackbarComponent {

  // 1 [basic with snackbar]
  codeForSnackbarBasic = BASIC_SNACKBAR_HTML_SNIPPET;
  codeForSnackbarBasicTs = BASIC_SNACKBAR_TS_SNIPPET;

  // 2 [Custom Component with snackbar]
  codeForSnackbarCustomComponent = CUSTOM_COMPONENT_SNACKBAR_HTML_SNIPPET;
  codeForSnackbarCustomComponentTs = CUSTOM_COMPONENT_SNACKBAR_TS_SNIPPET;

  // 3 [Configurable with snackbar]
  codeForSnackbarConfigurable = CONFIGURABLE_SNACKBAR_HTML_SNIPPET;
  codeForSnackbarConfigurableTs = CONFIGURABLE_SNACKBAR_TS_SNIPPET;

  durationInSeconds = 5;

  horizontalPosition: MatSnackBarHorizontalPosition = 'start';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';

  constructor(private _snackBar: MatSnackBar) {}

  openSnackBar(message: string, action: string) {
    this._snackBar.open(message, action);
  }

  openCustomSnackBar() {
    this._snackBar.openFromComponent(PizzaPartyComponent, {
      duration: this.durationInSeconds * 1000,
    });
  }

  openConfigSnackBar() {
    this._snackBar.open('Cannonball!!', 'Splash', {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
    });
  }
}
