import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MdlDialogService } from '@angular-mdl/core';
import * as moment from 'moment';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';

import {
    HttpModelsService,
    AppState, 
    Model, 
    ModelRuntime,
} from '@shared/_index';

import {
    DialogModelBuildComponent,
    DialogDeployModelComponent,
    DialogTestComponent,
    DialogStopModelComponent,
    injectableModelOptions,
    injectableModelDeployOptions,
    injectableModelStopOptions,
    injectableModelBuildOptions
} from '@components/dialogs/_index';

import * as Actions from '@shared/actions/_index';


@Component({
    selector: 'hydro-model-details',
    templateUrl: './model-details.component.html',
    styleUrls: ['./model-details.component.scss']
    })
export class ModelDetailsComponent implements OnInit, OnDestroy {

  private activatedRouteSub: any;
  public id: string;
  public builds: any; // TODO: FIX TYPE
  public model: Model;
  public runtimes: ModelRuntime[];
  public deployable = true;
  public latestVersion: string;
  public isModels = true;
  private modelsRuntimesSub: Subscription;
  private modelsStoreSelectionSubscription: Subscription;
  public nestedModelRuntimes: any[]; // TODO: FIX TYPE
  public tableHeader: string[] = [
      'Created', 'Version', 'Status', 'Actions', 'Services'
  ];


  constructor(
    private activatedRoute: ActivatedRoute,
    private modelsService: HttpModelsService,
    private dialog: MdlDialogService,
    private store: Store<AppState>
  ) { }

  ngOnInit() {
      this.activatedRouteSub = this.activatedRoute.params
          .map((params) => {
              this.id = params['modelId'];
              return this.id;
          })
          .subscribe((modelId) => {
              if (this.modelsStoreSelectionSubscription) {
                  this.modelsStoreSelectionSubscription.unsubscribe();
              }
              this.loadInitialData(modelId);
          });
  }

  loadInitialData(id: string) {
      this.modelsService.getBuildsByModel(id).first()
          .subscribe((data) => {
              this.builds = data.sort((a, b) => {
                  return moment(b.started).diff(moment(a.started));
              });
          });

      this.store.dispatch({ type: Actions.SWITCH_MODEL, payload: this.id });


      this.modelsRuntimesSub = this.store.select('modelRuntimes')
          .subscribe(modelRuntimes => {
              this.nestedModelRuntimes = modelRuntimes;
          });

      this.modelsStoreSelectionSubscription = this.store.select('models').filter(models => models.length > 0)
          .subscribe(models => {
              this.model = models.find((dataStoreItem) => dataStoreItem.id === Number(this.id));
              this.deployable = this.isDeployable();
              this.latestVersion = this.getLatestVersion();
          });
  }

  public isDeployable(): boolean {
      if (!this.model || !this.model.lastModelRuntime.created) {
          return true;
      }
      const modelUpdated = this.model.updated;
      const runtimeCreated = this.model.lastModelRuntime.created;
      return moment(modelUpdated).isAfter(moment(runtimeCreated));
  }

  public getPayloadForModelDeploy(runtime) {
      return { serviceName: `${runtime.modelName}_${runtime.modelVersion}`, modelRuntimeId: runtime.id };
  }

  public getLatestVersion(): string {
      if (this.isDeployable()) {
          return this.model.nextVersion;
      }
      if (!this.nestedModelRuntimes || this.nestedModelRuntimes.length < 1) {
          return '0.0.1';
      }
      const sortedRuntimes = this.nestedModelRuntimes.sort((a, b) => {
          if (Number(a.runtime.imageTag) < Number(b.runtime.imageTag)) {
              return -1;
          }
          if (Number(a.runtime.imageTag) > Number(b.runtime.imageTag)) {
              return 1;
          }
          return 0;
      });
      return sortedRuntimes[0].imageTag;
  }

  buildModel(modelOptions: Model) {
      this.dialog.showCustomDialog({
          component: DialogModelBuildComponent,
          styles: { 'width': '800px', 'min-height': '350px' },
          classes: '',
          isModal: true,
          clickOutsideToClose: true,
          enterTransitionDuration: 400,
          leaveTransitionDuration: 400,
          providers: [{ provide: injectableModelOptions, useValue: modelOptions }],
      });
  }

  deployModelService(modelOptions) {
      this.dialog.showCustomDialog({
          component: DialogDeployModelComponent,
          styles: { 'width': '800px', 'min-height': '350px' },
          classes: '',
          isModal: true,
          clickOutsideToClose: true,
          enterTransitionDuration: 400,
          leaveTransitionDuration: 400,
          providers: [{ provide: injectableModelDeployOptions, useValue: modelOptions }],
      });
  }

  testModel(model) {
      this.dialog.showCustomDialog({
          component: DialogTestComponent,
          styles: { 'width': '800px', 'min-height': '350px' },
          classes: '',
          isModal: true,
          clickOutsideToClose: true,
          enterTransitionDuration: 400,
          leaveTransitionDuration: 400,
          providers: [{ provide: injectableModelBuildOptions, useValue: model }],
      });
  }

  stopModel(modelService) {
      const payload = {
          model: modelService.service,
          hasWeightedServices: modelService.weightedServices.length > 0
      };
      this.dialog.showCustomDialog({
          component: DialogStopModelComponent,
          styles: { 'width': '800px', 'min-height': '350px' },
          classes: '',
          isModal: true,
          clickOutsideToClose: true,
          enterTransitionDuration: 400,
          leaveTransitionDuration: 400,
          providers: [{ provide: injectableModelStopOptions, useValue: payload }],
      });

  }

  ngOnDestroy() {
      if (this.modelsStoreSelectionSubscription) {
          this.modelsStoreSelectionSubscription.unsubscribe();
      }
      console.log(this.modelsRuntimesSub);
      this.modelsRuntimesSub.unsubscribe();
  }

}
