import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';

import { HydroServingState } from '@core/reducers';
import { IModel, ModelVersion } from '@shared/models/_index';

import * as fromModels from '@models/reducers';
import { Observable } from 'rxjs';

import { DialogService } from '@dialog/dialog.service';
import {
  DialogDeleteModelComponent,
  SELECTED_MODEL$,
} from '@models/components/dialogs';
import { switchMap, filter } from 'rxjs/operators';
@Component({
  selector: 'hs-model-details',
  templateUrl: './model-details.component.html',
  styleUrls: ['./model-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModelDetailsComponent {
  public model$: Observable<IModel>;
  public modelVersions$: Observable<ModelVersion[]>;

  constructor(
    private store: Store<HydroServingState>,
    private dialog: DialogService
  ) {
    this.model$ = this.store
      .select(fromModels.getSelectedModel)
      .pipe(filter(model => !!model));

    this.modelVersions$ = this.model$.pipe(
      switchMap(({ id }) =>
        this.store.select(fromModels.getModelVersionsByModelId(id))
      )
    );
  }

  public removeModel() {
    this.dialog.createDialog({
      component: DialogDeleteModelComponent,
      providers: [{ provide: SELECTED_MODEL$, useValue: this.model$ }],
    });
  }
}
