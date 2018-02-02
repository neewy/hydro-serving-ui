import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState } from '@shared/models/_index';
import * as Actions from '@shared/actions/_index';



@Component({
    selector: 'hydro-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'HydroServingUi';

    constructor(
        private store: Store<AppState>,
    ) {}

    ngOnInit() {
        this.store.dispatch({ type: Actions.LOAD_MODELS, payload: null });
        this.store.dispatch({ type: Actions.GET_BUILDS, payload: null });
        
        this.store.dispatch({ type: Actions.GET_APPLICATIONS, payload: null });
        // this.store.dispatch({ type: Actions.GET_MODEL_SERVICES, payload: null });
    }
}
