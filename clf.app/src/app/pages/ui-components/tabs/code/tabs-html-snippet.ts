export const BASIC_TABS_HTML_SNIPPET = `  <mat-tab-group mat-stretch-tabs="false" mat-align-tabs="start">
              <mat-tab label="Item One">
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 1
                </div>
              </mat-tab>
              <mat-tab label="Item Two">
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 2
                </div>
              </mat-tab>
              <mat-tab label="Item Three">
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 3
                </div>
              </mat-tab>
            </mat-tab-group>
`;

export const CENTER_ALIGN_TABS_HTML_SNIPPET = `  <mat-tab-group mat-stretch-tabs="false" mat-align-tabs="center">
              <mat-tab label="Item One">
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 1
                </div>
              </mat-tab>
              <mat-tab label="Item Two">
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 2
                </div>
              </mat-tab>
              <mat-tab label="Item Three">
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 3
                </div>
              </mat-tab>
            </mat-tab-group>
`;

export const RIGHT_ALIGN_TABS_HTML_SNIPPET = `  <mat-tab-group mat-stretch-tabs="false" mat-align-tabs="end">
              <mat-tab label="Item One">
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 1
                </div>
              </mat-tab>
              <mat-tab label="Item Two">
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 2
                </div>
              </mat-tab>
              <mat-tab label="Item Three">
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 3
                </div>
              </mat-tab>
            </mat-tab-group>
`;

export const NO_ANIMATION_TABS_HTML_SNIPPET = `  <mat-tab-group mat-stretch-tabs="false" mat-align-tabs="start" animationDuration="0ms">
              <mat-tab label="Item One">
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 1
                </div>
              </mat-tab>
              <mat-tab label="Item Two">
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 2
                </div>
              </mat-tab>
              <mat-tab label="Item Three">
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 3
                </div>
              </mat-tab>
            </mat-tab-group>
`;

export const SLOW_ANIMATION_TABS_HTML_SNIPPET = `  <mat-tab-group mat-stretch-tabs="false" mat-align-tabs="start" animationDuration="2000ms">
              <mat-tab label="Item One">
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 1
                </div>
              </mat-tab>
              <mat-tab label="Item Two">
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 2
                </div>
              </mat-tab>
              <mat-tab label="Item Three">
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 3
                </div>
              </mat-tab>
            </mat-tab-group>
`;

export const GROUP_TABS_HTML_SNIPPET = `  <mat-tab-group>
              <mat-tab label="Item One">
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 1
                </div>
              </mat-tab>
              <mat-tab label="Item Two">
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 2
                </div>
              </mat-tab>
              <mat-tab label="Item Three">
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 3
                </div>
              </mat-tab>
            </mat-tab-group>
`;

export const CUSTOM_LABEL_TABS_HTML_SNIPPET = `  <mat-tab-group>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="phone" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                  Item One
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 1
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="heart" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                  Item Two
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 2
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="user" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                  Item Three
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 3
                </div>
              </mat-tab>
            </mat-tab-group>
`;

export const ICON_TABS_HTML_SNIPPET = `  <mat-tab-group>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="phone" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 1
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="heart" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 2
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="user" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 3
                </div>
              </mat-tab>
            </mat-tab-group>
`;

export const POSITION_TABS_HTML_SNIPPET = `  <mat-tab-group headerPosition="below">
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="phone" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                  Item One
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-b-12">
                  Content 1
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="heart" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                  Item Two
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-b-12">
                  Content 2
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="user" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                  Item Three
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-b-12">
                  Content 3
                </div>
              </mat-tab>
            </mat-tab-group>
`;

export const POSITION_WITH_ICON_TABS_HTML_SNIPPET = `  <mat-tab-group headerPosition="below">
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="phone" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-b-12">
                  Content 1
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="heart" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-b-12">
                  Content 2
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="user" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-b-12">
                  Content 3
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="file-description" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-b-12">
                  Content 4
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="archive" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-b-12">
                  Content 5
                </div>
              </mat-tab>
            </mat-tab-group>
`;

export const BACKGROUND_TABS_HTML_SNIPPET = `  <mat-tab-group headerPosition="below">
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="phone" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-b-12">
                  Content 1
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="heart" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-b-12">
                  Content 2
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="user" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-b-12">
                  Content 3
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="file-description" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-b-12">
                  Content 4
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="archive" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-b-12">
                  Content 5
                </div>
              </mat-tab>
            </mat-tab-group>
`;

export const FIT_TO_BAR_CONTENT_TABS_HTML_SNIPPET = `  <mat-tab-group fitInkBarToContent>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="phone" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 1
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="heart" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 2
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="user" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 3
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="file-description" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 4
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="archive" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 5
                </div>
              </mat-tab>
            </mat-tab-group>
`;

export const CONTENT_LOADED_LAZILY_TABS_HTML_SNIPPET = `  <mat-tab-group>
              <mat-tab label="Item One">
                <ng-template matTabContent>
                  <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                    Content 1 - Loaded: {{ getTimeLoaded(1) | date : "medium" }}
                  </div>
                </ng-template>
              </mat-tab>
              <mat-tab label="Item Two">
                <ng-template matTabContent>
                  <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                    Content 2 - Loaded: {{ getTimeLoaded(2) | date : "medium" }}
                  </div>
                </ng-template>
              </mat-tab>
              <mat-tab label="Item Three">
                <ng-template matTabContent>
                  <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                    Content 3 - Loaded: {{ getTimeLoaded(3) | date : "medium" }}
                  </div>
                </ng-template>
              </mat-tab>
            </mat-tab-group>
`;

export const PAGINATED_TABS_HTML_SNIPPET = `  <mat-tab-group>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="phone" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                  Item One
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 1
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="heart" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                  Item Two
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 2
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="user" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                  Item Three
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 3
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="phone" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                  Item Four
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 4
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="heart" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                  Item Five
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 5
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="user" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                  Item Six
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 6
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="phone" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                  Item Seven
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 7
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="heart" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                  Item Eight
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 8
                </div>
              </mat-tab>
              <mat-tab>
                <ng-template mat-tab-label>
                  <div class="d-flex align-items-center">
                    <mat-icon>
                      <i-tabler name="user" class="icon-20 m-r-8"></i-tabler>
                    </mat-icon>
                  </div>
                  Item Nine
                </ng-template>
                <div class="bg-light-primary f-s-14 p-16 rounded m-t-12">
                  Content 9
                </div>
              </mat-tab>
            </mat-tab-group>
`;

export const NAVBAR_BACKGROUND_TABS_HTML_SNIPPET = `  <nav mat-tab-nav-bar [backgroundColor]="background" [tabPanel]="tabPanel">
              @for(link of links; track link) {
              <a mat-tab-link (click)="activeLink = link" [active]="activeLink == link">
                {{ link }}
              </a>
              }

              <a mat-tab-link disabled>Disabled Link</a>
            </nav>
            <mat-tab-nav-panel #tabPanel></mat-tab-nav-panel>
            <div class="m-t-12">
              <button mat-flat-button color="primary" (click)="toggleBackground()">
                Toggle background
              </button>
              <button mat-flat-button color="accent" (click)="addLink()" class="m-l-8">
                Add link
              </button>
            </div>
`;