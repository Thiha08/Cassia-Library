export const DYNAMIC_TABLE_HTML_SNIPPET = `  <div class="d-flex d-sm-block align-items-center gap-1 m-b-16 m-t-16">
      <button mat-flat-button class="m-r-8" (click)="addColumn()">
        Add column
      </button>
      <button mat-flat-button class="m-r-8 bg-error text-white" (click)="removeColumn()">
        Remove column
      </button>
      <button mat-flat-button class="bg-secondary text-white" (click)="shuffle()">
        Shuffle
      </button>
    </div>

    <div class="table-responsive m-t-30">
      <table mat-table [dataSource]="data" class="w-100">
        @for(column of displayedColumns; track column) {
        <ng-container [matColumnDef]="column">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 mat-subtitle-1 f-s-14 p-l-0">
            {{ column | titlecase }}
          </th>
          <td mat-cell *matCellDef="let element" class="p-l-0 f-s-14">
            {{ element[column] }}
          </td>
        </ng-container>
        }

        <tr mat-header-row *matHeaderRowDef="columnsToDisplay"></tr>
        <tr mat-row *matRowDef="let row; columns: columnsToDisplay"></tr>
      </table>
    </div>
`;