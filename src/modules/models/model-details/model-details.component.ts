import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MdlDialogService } from '@angular-mdl/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs/Subscription';

import { AppState, Model } from '@shared/models/_index';

import {
    DialogModelBuildComponent,
    injectableModelOptions,
    DialogEditContractComponent,
    injectableModelId,
    DialogAddServiceComponent
} from '@components/dialogs/_index';

import * as Actions from '@shared/actions/_index';



@Component({
    selector: 'hydro-model-details',
    templateUrl: './model-details.component.html',
    styleUrls: ['./model-details.component.scss']
})
export class ModelDetailsComponent implements OnInit, OnDestroy {

    public model: Model;
    public modelBuilds: any[]; // TODO: FIX TYPE
    public tableHeader: string[] = [
        'Created', 'Version', 'Status', 'Actions'
    ];
    
    private modelBuildsSub: Subscription;
    private modelsStoreSelectionSubscription: Subscription;
    private activatedRouteSubscription: Subscription;


    constructor(
        private activatedRoute: ActivatedRoute,
        private dialog: MdlDialogService,
        private store: Store<AppState>
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
                this.modelBuilds = modelBuilds.reverse();
            })

        this.modelsStoreSelectionSubscription = this.store.select('models')
            .filter(models => models.length > 0)
            .subscribe(models => {
                this.model = models.find(modelsStoreItem => modelsStoreItem.id === Number(modelId));
            });
    }

    public buildModel(model: Model) {
        this.dialog.showCustomDialog({
            component: DialogModelBuildComponent,
            styles: { 'width': '800px', 'min-height': '350px' },
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

    public deployModel() {
        this.dialog.showCustomDialog({
            component: DialogAddServiceComponent,
            styles: { 'width': '850px', 'min-height': '250px', 'max-height': '90vh', 'overflow': 'auto' },
            classes: '',
            isModal: true,
            clickOutsideToClose: true,
            enterTransitionDuration: 400,
            leaveTransitionDuration: 400
        });
    }

}
