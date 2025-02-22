import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { GetMetricsAction } from '@core/actions/monitoring.actions';
import { HydroServingState } from '@core/reducers';
import { getSelectedModelVersion } from '@models/reducers';
import { Store } from '@ngrx/store';
import { ModelVersion } from '@shared/_index';
import { Observable } from 'rxjs';
import { filter, tap } from 'rxjs/operators';

@Component({
  templateUrl: './model-version-container.component.html',
  styleUrls: ['./model-version-container.component.scss'],
})
export class ModelVersionContainerComponent {
  public modelVersion$: Observable<ModelVersion>;

  constructor(
    private store: Store<HydroServingState>,
    private location: Location
  ) {
    this.modelVersion$ = this.store.select(getSelectedModelVersion).pipe(
      filter(val => val !== undefined),
      tap(({ id }) => this.store.dispatch(new GetMetricsAction(`${id}`)))
    );
  }

  back() {
    this.location.back();
  }
}
