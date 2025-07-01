export const TEXT_WITH_BADGE_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {MatBadgeModule} from '@angular/material/badge';

    /**
     * @title Badge overview
     */
    @Component({
        selector: 'badge-overview-example',
        templateUrl: 'badge-overview-example.html',
        styleUrl: 'badge-overview-example.css',
        imports: [MatBadgeModule],
    })
    export class AppTextWithBadgeComponent {
        
    }
`;

export const BUTTON_LEFT_WITH_BADGE_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {MatBadgeModule} from '@angular/material/badge';
    import { MatButtonModule } from '@angular/material/button';

    /**
     * @title Badge overview
     */
    @Component({
        selector: 'badge-overview-example',
        templateUrl: 'badge-overview-example.html',
        styleUrl: 'badge-overview-example.css',
        imports: [MatBadgeModule, MatButtonModule],
    })
    export class AppTextWithBadgeComponent {
        
    }
`;


export const BUTTON_TOGGLES_WITH_BADGE_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {MatBadgeModule} from '@angular/material/badge';
    import { MatButtonModule } from '@angular/material/button';

    /**
     * @title Badge overview
     */
    @Component({
        selector: 'badge-overview-example',
        templateUrl: 'badge-overview-example.html',
        styleUrl: 'badge-overview-example.css',
        imports: [MatBadgeModule, MatButtonModule],
    })
    export class AppTextWithBadgeComponent {
        toggleBadgeVisibility() {
            this.hidden = !this.hidden;
        }
    }
`;