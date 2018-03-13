import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MdlDialogService } from '@angular-mdl/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';

import { AppState, Model, ModelBuild, Signature } from '@shared/models/_index';
import { ContractsService } from '@shared/services/_index';

import {
    DialogModelBuildComponent,
    injectableModelOptions,
    DialogEditContractComponent,
    injectableModelId
} from '@components/dialogs/_index';

import * as Actions from '@shared/actions/_index';



@Component({
    selector: 'hydro-model-details',
    templateUrl: './model-details.component.html',
    styleUrls: ['./model-details.component.scss']
})
export class ModelDetailsComponent implements OnInit, OnDestroy {
    public model: Model;
    public signatures: Signature[];
    public modelBuilds: ModelBuild[];
    public tableHeader: string[] = ['Created', 'Version', 'Status'];
    
    private modelBuildsSub: Subscription;
    private modelsStoreSelectionSubscription: Subscription;
    private activatedRouteSubscription: Subscription;


    constructor(
        private activatedRoute: ActivatedRoute,
        private dialog: MdlDialogService,
        private store: Store<AppState>,
        private contractsService: ContractsService,
    ) { }

    public ngOnInit() {
        this.activatedRouteSubscription = this.activatedRoute.params
            .map(params => {
                return params['modelId'];
            })
            .subscribe(modelId => {
                if (this.modelsStoreSelectionSubscription) {
                    this.modelsStoreSelectionSubscription.unsubscribe();
                }
                if (this.modelBuildsSub) {
                    this.modelBuildsSub.unsubscribe();
                }
                this.loadInitialData(modelId);
            });
    }

    public ngOnDestroy() {
        if (this.modelsStoreSelectionSubscription) {
            this.modelsStoreSelectionSubscription.unsubscribe();
        }
        if (this.modelBuildsSub) {
            this.modelBuildsSub.unsubscribe();
        }
    }

    private loadInitialData(modelId: string) {
        this.store.dispatch({ type: Actions.GET_MODEL_BUILDS, payload: modelId });

        this.modelBuildsSub = this.store.select('modelBuilds')
            .skip(1)
            .subscribe(modelBuilds => {
                console.log(modelBuilds);
                this.modelBuilds = modelBuilds.reverse();
            })

        this.modelsStoreSelectionSubscription = this.store.select('models')
            .filter(models => models.length > 0)
            .subscribe(models => {
                this.model = models.find(modelsStoreItem => modelsStoreItem.id === Number(modelId));
            });

        this.contractsService.getModelContracts(Number(modelId))
            .subscribe(data => {
                console.log(data.signatures);
                this.signatures = data.signatures;
            });
    }

    public buildModel(model: Model) {
        this.dialog.showCustomDialog({
            component: DialogModelBuildComponent,
            styles: { 'width': '850px', 'min-height': '350px', 'max-height': '100vh', 'overflow-y': 'scroll' },
            classes: '',
            isModal: true,
            clickOutsideToClose: true,
            enterTransitionDuration: 400,
            leaveTransitionDuration: 400,
            providers: [{ provide: injectableModelOptions, useValue: model }],
        });
    }

    public editModelContract(modelId: number) {
        this.dialog.showCustomDialog({
            component: DialogEditContractComponent,
            styles: { 'width': '800px', 'min-height': '350px', 'overflow-y': 'scroll', 'height': '100%' },
            classes: '',
            isModal: true,
            clickOutsideToClose: true,
            enterTransitionDuration: 400,
            leaveTransitionDuration: 400,
            providers: [{ provide: injectableModelId, useValue: modelId }],
        });
    }

}
