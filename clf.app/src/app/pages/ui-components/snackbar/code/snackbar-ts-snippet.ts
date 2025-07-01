export const BASIC_SNACKBAR_TS_SNIPPET = `  import {Component, inject} from '@angular/core';
    import {MatSnackBar} from '@angular/material/snack-bar';
    import {MatButtonModule} from '@angular/material/button';
    import {MatInputModule} from '@angular/material/input';
    import {MatFormFieldModule} from '@angular/material/form-field';

    /**
     * @title Basic snack-bar
     */
      @Component({
        selector: 'app-snackbar',
        imports: [MatFormFieldModule, MatInputModule, MatButtonModule],
        templateUrl: './snackbar.component.html'
    })

    export class AppSnackbarComponent {
        constructor() {}

        private _snackBar = inject(MatSnackBar);

        openSnackBar(message: string, action: string) {
            this._snackBar.open(message, action);
        }
    }
`;

export const CUSTOM_COMPONENT_SNACKBAR_TS_SNIPPET = `  import {Component, inject} from '@angular/core';
    import {MatSnackBar} from '@angular/material/snack-bar';
    import {MatButtonModule} from '@angular/material/button';
    import {MatInputModule} from '@angular/material/input';
    import {FormsModule} from '@angular/forms';
    import {MatFormFieldModule} from '@angular/material/form-field';

    /**
     * @title Snack-bar with a custom component
     */
      @Component({
        selector: 'app-snackbar',
        imports: [MatFormFieldModule, FormsModule, MatInputModule, MatButtonModule],
        templateUrl: './snackbar.component.html'
    })

    export class AppSnackbarComponent {
        constructor() {}

        private _snackBar = inject(MatSnackBar);

        durationInSeconds = 5;

        openSnackBar() {
            this._snackBar.openFromComponent(PizzaPartyComponent, {
            duration: this.durationInSeconds * 1000,
            });
        }
    }

    @Component({
        selector: 'app-custom-snackbar',
        templateUrl: 'snackbar-custom.component.html',
        styles: [
            
          .example-pizza-party {
            color: hotpink;
          }
        ,
        ],
        standalone: false
    })
    export class PizzaPartyComponent {}
`;

export const CONFIGURABLE_SNACKBAR_TS_SNIPPET = `  import {Component, inject} from '@angular/core';
    import {
    MatSnackBar,
    MatSnackBarHorizontalPosition,
    MatSnackBarVerticalPosition,
    } from '@angular/material/snack-bar';
    import {MatButtonModule} from '@angular/material/button';
    import {MatSelectModule} from '@angular/material/select';
    import {MatFormFieldModule} from '@angular/material/form-field';

    /**
     * @title Snack-bar with configurable position
     */
      @Component({
        selector: 'app-snackbar',
        imports: [MatFormFieldModule, MatSelectModule, MatButtonModule],
        templateUrl: './snackbar.component.html'
    })

    export class AppSnackbarComponent {
        constructor() {}

        private _snackBar = inject(MatSnackBar);

        horizontalPosition: MatSnackBarHorizontalPosition = 'start';
        verticalPosition: MatSnackBarVerticalPosition = 'bottom';

        openSnackBar() {
            this._snackBar.open('Cannonball!!', 'Splash', {
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
            });
        }
    }
`;