export const FIRST_AUTOCOMPLETE_OPTION_TS_SNIPPET = `  import {Component, OnInit} from '@angular/core';
    import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
    import {Observable} from 'rxjs';
    import {map, startWith} from 'rxjs/operators';
    import {AsyncPipe} from '@angular/common';
    import {MatAutocompleteModule} from '@angular/material/autocomplete';
    import {MatInputModule} from '@angular/material/input';
    import {MatFormFieldModule} from '@angular/material/form-field';

    /**
     * @title Highlight the first autocomplete option
     */
    @Component({
        selector: 'app-autocomplete',
        imports: [
            FormsModule,
            MatFormFieldModule,
            MatInputModule,
            MatAutocompleteModule,
            ReactiveFormsModule,
            AsyncPipe,
        ],
        templateUrl: './autocomplete.component.html'
    })
    export class AppAutocompleteComponent implements OnInit {

        firstControl = new FormControl('');
        firstoption: string[] = ['One', 'Two', 'Three'];
        filteredOptions: Observable<string[]>;

        ngOnInit() {
            // first option
            this.filteredOptions = this.firstControl.valueChanges.pipe(
              startWith(''),
              map((value) => this._filter(value || ''))
            );
        }

        private _filter(value: string): string[] {
            const filterValue = value.toLowerCase();

            return this.firstoption.filter((option) =>
            option.toLowerCase().includes(filterValue)
            );
        }
    }
`;

export const OPTION_GROUP_TS_SNIPPET = `  import {Component, OnInit, inject} from '@angular/core';
    import {FormBuilder, FormsModule, ReactiveFormsModule} from '@angular/forms';
    import {Observable} from 'rxjs';
    import {startWith, map} from 'rxjs/operators';
    import {AsyncPipe} from '@angular/common';
    import {MatAutocompleteModule} from '@angular/material/autocomplete';
    import {MatInputModule} from '@angular/material/input';
    import {MatFormFieldModule} from '@angular/material/form-field';

    // option group
    export interface StateGroup {
        letter: string;
        names: string[];
    }

    export const _filter = (opt: string[], value: string): string[] => {
        const filterValue = value.toLowerCase();

        return opt.filter((item) => item.toLowerCase().includes(filterValue));
    };

    /**
     * @title Option groups autocomplete
     */
    @Component({
        selector: 'app-autocomplete',
        imports: [
            FormsModule,
            ReactiveFormsModule,
            MatFormFieldModule,
            MatInputModule,
            MatAutocompleteModule,
            AsyncPipe,
        ],
        templateUrl: './autocomplete.component.html'
    })
    export class AppAutocompleteComponent implements OnInit {

        // option group
        stateForm = this._formBuilder.group({
        stateGroup: '',
        });
    
        stateGroups: StateGroup[] = [
        {
            letter: 'A',
            names: ['Alabama', 'Alaska', 'Arizona', 'Arkansas'],
        },
        {
            letter: 'C',
            names: ['California', 'Colorado', 'Connecticut'],
        },
        {
            letter: 'D',
            names: ['Delaware'],
        },
        {
            letter: 'F',
            names: ['Florida'],
        },
        {
            letter: 'G',
            names: ['Georgia'],
        },
        {
            letter: 'H',
            names: ['Hawaii'],
        },
        {
            letter: 'I',
            names: ['Idaho', 'Illinois', 'Indiana', 'Iowa'],
        },
        {
            letter: 'K',
            names: ['Kansas', 'Kentucky'],
        },
        {
            letter: 'L',
            names: ['Louisiana'],
        },
        {
            letter: 'M',
            names: [
            'Maine',
            'Maryland',
            'Massachusetts',
            'Michigan',
            'Minnesota',
            'Mississippi',
            'Missouri',
            'Montana',
            ],
        },
        {
            letter: 'N',
            names: [
            'Nebraska',
            'Nevada',
            'New Hampshire',
            'New Jersey',
            'New Mexico',
            'New York',
            'North Carolina',
            'North Dakota',
            ],
        },
        {
            letter: 'O',
            names: ['Ohio', 'Oklahoma', 'Oregon'],
        },
        {
            letter: 'P',
            names: ['Pennsylvania'],
        },
        {
            letter: 'R',
            names: ['Rhode Island'],
        },
        {
            letter: 'S',
            names: ['South Carolina', 'South Dakota'],
        },
        {
            letter: 'T',
            names: ['Tennessee', 'Texas'],
        },
        {
            letter: 'U',
            names: ['Utah'],
        },
        {
            letter: 'V',
            names: ['Vermont', 'Virginia'],
        },
        {
            letter: 'W',
            names: ['Washington', 'West Virginia', 'Wisconsin', 'Wyoming'],
        },
        ];

        stateGroupOptions: Observable<StateGroup[]>;

          ngOnInit() {
              // option group
              this.stateGroupOptions = this.stateForm
                .get('stateGroup')!
                .valueChanges.pipe(
                  startWith(''),
                  map((value) => this._filterGroup(value || ''))
                );
            }

            // option group
              private _filterGroup(value: string): StateGroup[] {
                if (value) {
                  return this.stateGroups
                    .map((group) => ({
                      letter: group.letter,
                      names: _filter(group.names, value),
                    }))
                    .filter((group) => group.names.length > 0);
                }
            
                return this.stateGroups;
              }
        
    }
`;

export const FILTER_TS_SNIPPET = `  import {Component, OnInit} from '@angular/core';
    import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
    import {Observable} from 'rxjs';
    import {map, startWith} from 'rxjs/operators';
    import {AsyncPipe} from '@angular/common';
    import {MatAutocompleteModule} from '@angular/material/autocomplete';
    import {MatInputModule} from '@angular/material/input';
    import {MatFormFieldModule} from '@angular/material/form-field';

    /**
     * @title Filter autocomplete
     */
    @Component({
        selector: 'app-autocomplete',
        imports: [
            FormsModule,
            MatFormFieldModule,
            MatInputModule,
            MatAutocompleteModule,
            ReactiveFormsModule,
            AsyncPipe,
        ],
        templateUrl: './autocomplete.component.html'
    })
    export class AppAutocompleteComponent implements OnInit {

        // filter option
        filterControl = new FormControl('');
        searchoption: string[] = ['One', 'Two', 'Three'];
        searchfilteredOptions: Observable<string[]>;

        ngOnInit() {
            // filter option
            this.searchfilteredOptions = this.filterControl.valueChanges.pipe(
                startWith(''),
                map((value) => this._searchfilter(value || ''))
            );
        }

        // filter option
        private _searchfilter(value: string): string[] {
            const searchfilterValue = value.toLowerCase();

            return this.searchoption.filter((searchoption) =>
            searchoption.toLowerCase().includes(searchfilterValue)
            );
        }
    }
`;

export const OVERVIEW_TS_SNIPPET = `  import {Component} from '@angular/core';
    import {FormControl, FormsModule, ReactiveFormsModule} from '@angular/forms';
    import {Observable} from 'rxjs';
    import {map, startWith} from 'rxjs/operators';
    import {MatSlideToggleModule} from '@angular/material/slide-toggle';
    import {AsyncPipe} from '@angular/common';
    import {MatAutocompleteModule} from '@angular/material/autocomplete';
    import {MatInputModule} from '@angular/material/input';
    import {MatFormFieldModule} from '@angular/material/form-field';

    export interface State {
        flag: string;
        name: string;
        population: string;
    }

    /**
     * @title Autocomplete overview
     */
    @Component({
        selector: 'app-autocomplete',
        imports: [
            FormsModule,
            MatFormFieldModule,
            MatInputModule,
            MatAutocompleteModule,
            ReactiveFormsModule,
            MatSlideToggleModule,
            AsyncPipe,
        ],
        templateUrl: './autocomplete.component.html'
    })
    export class AppAutocompleteComponent implements OnInit {

        // state
          stateCtrl = new FormControl('');
          filteredStates: Observable<State[]>;
        
          states: State[] = [
            {
              name: 'Arkansas',
              population: '2.978M',
              // https://commons.wikimedia.org/wiki/File:Flag_of_Arkansas.svg
              flag: 'https://upload.wikimedia.org/wikipedia/commons/9/9d/Flag_of_Arkansas.svg',
            },
            {
              name: 'California',
              population: '39.14M',
              // https://commons.wikimedia.org/wiki/File:Flag_of_California.svg
              flag: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Flag_of_California.svg',
            },
            {
              name: 'Florida',
              population: '20.27M',
              // https://commons.wikimedia.org/wiki/File:Flag_of_Florida.svg
              flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Florida.svg',
            },
            {
              name: 'Texas',
              population: '27.47M',
              // https://commons.wikimedia.org/wiki/File:Flag_of_Texas.svg
              flag: 'https://upload.wikimedia.org/wikipedia/commons/f/f7/Flag_of_Texas.svg',
            },
          ];
        
          constructor(private _formBuilder: FormBuilder) {
            this.filteredStates = this.stateCtrl.valueChanges.pipe(
              startWith(''),
              map((state) => (state ? this._filterStates(state) : this.states.slice()))
            );
          }
        
          private _filterStates(value: string): State[] {
            const filterValue = value.toLowerCase();
        
            return this.states.filter((state) =>
              state.name.toLowerCase().includes(filterValue)
            );
          }
    }
`;