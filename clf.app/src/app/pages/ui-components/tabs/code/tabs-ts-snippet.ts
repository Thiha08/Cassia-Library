export const BASIC_TABS_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {MatTabsModule} from '@angular/material/tabs';

    /**
     * @title Basic tabs
     */
    @Component({
        selector: 'app-tabs',
        imports: [MatTabsModule],
        templateUrl: './tabs.component.html'
    })

    export class AppTabsComponent {
        constructor() {}
    }
`;

export const BACKGROUND_TABS_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {MatTabsModule} from '@angular/material/tabs';

    /**
     * @title background tabs
     */
    @Component({
        selector: 'app-tabs',
        imports: [MatTabsModule],
        templateUrl: './tabs.component.html'
    })

    export class AppTabsComponent {
        constructor() {}

        links = ['Item One', 'Item Second', 'Item Third'];
          activeLink = this.links[0];
          background: ThemePalette = undefined;
        
          toggleBackground() {
            this.background = this.background ? undefined : 'primary';
          }
        
          addLink() {
            this.links.push('Link {this.links.length + 1}');
          }
    }
`;

export const CONTENT_LOADED_LAZILY_TABS_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {DatePipe} from '@angular/common';
    import {MatTabsModule} from '@angular/material/tabs';

    /**
     * @title background tabs
     */
    @Component({
        selector: 'app-tabs',
        imports: [MatTabsModule, DatePipe],
        templateUrl: './tabs.component.html'
    })

    export class AppTabsComponent {
        constructor() {}

        tabLoadTimes: Date[] = [];

    getTimeLoaded(index: number) {
        if (!this.tabLoadTimes[index]) {
        this.tabLoadTimes[index] = new Date();
        }

        return this.tabLoadTimes[index];
    }
        }
`;

export const PAGINATED_TABS_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {MatTabsModule} from '@angular/material/tabs';

    /**
     * @title Paginated tabs
     */
    @Component({
        selector: 'app-tabs',
        imports: [MatTabsModule],
        templateUrl: './tabs.component.html'
    })

    export class AppTabsComponent {
        constructor() {}

        lotsOfTabs = new Array(30).fill(0).map((_, index) => 'Tab {index}');
        
    }
`;

export const NAVBAR_BACKGROUND_TABS_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {MatTabsModule} from '@angular/material/tabs';

    /**
     * @title Navbar Background tabs
     */
    @Component({
        selector: 'app-tabs',
        imports: [MatTabsModule],
        templateUrl: './tabs.component.html'
    })

    export class AppTabsComponent {
        constructor() {}

        // background
          links = ['Item One', 'Item Second', 'Item Third'];
          activeLink = this.links[0];
          background: ThemePalette = undefined;
        
          toggleBackground() {
            this.background = this.background ? undefined : 'primary';
          }
        
          addLink() {
            this.links.push('Link {this.links.length + 1}');
          }
        
    }
`;