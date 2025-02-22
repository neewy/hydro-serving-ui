import { MdlSnackbarService } from '@angular-mdl/core';
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import * as fromModels from '@models/reducers';
import { Store } from '@ngrx/store';
import { Model } from '@shared/_index';
import { Observable, of } from 'rxjs';
import { switchMap, filter, take } from 'rxjs/operators';

@Injectable()
export class ModelDetailsGuard implements CanActivate {
  private defaultUrl: string = 'models';

  constructor(
    private store: Store<fromModels.ModelsState>,
    private mdlSnackbarService: MdlSnackbarService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const modelId = Number(route.params.modelId);

    return this.modelsAreLoaded().pipe(
      switchMap(_ => this.store.select(fromModels.getAllModels)),
      switchMap(models => {
        const model: Model = models.find(curModel => curModel.id === modelId);
        if (model) {
          return of(true);
        } else {
          this.router.navigate([this.defaultUrl]);
          this.mdlSnackbarService.showSnackbar({
            message: `Models with id = ${modelId} doesn't exist`,
            timeout: 5000,
          });
          return of(false);
        }
      })
    );
  }

  private modelsAreLoaded(): Observable<boolean> {
    return this.store.select(fromModels.getModelEntitiesLoaded).pipe(
      filter(loaded => loaded),
      take(1)
    );
  }
}
