import { Injectable } from '@angular/core';
import {
  UpdateApplicationSuccessAction,
  DeleteApplicationSuccessAction,
} from '@applications/actions';
import { ModelVersionBuilder } from '@core/builders/_index';
import { ApplicationBuilder } from '@core/builders/application.builder';
import { HydroServingState } from '@core/reducers';
import * as fromModels from '@models/actions';
import { Store } from '@ngrx/store';
import * as fromServables from '@servables/actions';
import { Servable } from '@servables/models';
import { Application, ModelVersion } from '@shared/_index';
import { environment } from 'environments/environment';
@Injectable({
  providedIn: 'root',
})
export class SseService {
  private dict = new Map<string, any>([
    ['ModelRemove', modelVersionId => this.deleteModelVerions(modelVersionId)],
    ['ModelUpdate', modelVersion => this.updateModelVersion(modelVersion)],
    ['ApplicationUpdate', application => this.updateApplication(application)],
    [
      'ApplicationRemove',
      applicationName => this.deleteApplication(applicationName),
    ],
    ['ServableUpdate', servable => this.updateServable(servable)],
    ['ServableRemove', servableName => this.deleteServable(servableName)],
  ]);
  private eventSource: EventSource;
  constructor(
    private store: Store<HydroServingState>,
    private applicationBuilder: ApplicationBuilder,
    private modelVersionBuilder: ModelVersionBuilder
  ) {}

  createConnection() {
    const { host, apiUrl, production } = environment;
    const { protocol, port, hostname } = window.location;

    if (production) {
      this.eventSource = new EventSource(
        `${protocol}//${hostname}:${port}${apiUrl}/events`,
        {
          withCredentials: true,
        }
      );
    } else {
      this.eventSource = new EventSource(`${host}${apiUrl}/events`, {
        withCredentials: true,
      });
    }

    for (const item of this.dict) {
      this.addEventHandler(item);
    }
  }

  private updateApplication(data: Application) {
    const app = this.applicationBuilder.build(data);
    return new UpdateApplicationSuccessAction(app);
  }

  private deleteApplication(applicationName: string) {
    return new DeleteApplicationSuccessAction(applicationName);
  }

  private updateModelVersion(data: ModelVersion) {
    const modelVersion = this.modelVersionBuilder.build(data);
    return new fromModels.AddModelVersionSuccessAction({ modelVersion });
  }

  private deleteModelVerions(modelVersionId: number) {
    return new fromModels.DeleteModelAction(modelVersionId);
  }

  private updateServable(servable: Servable) {
    return fromServables.updateServable({ servable });
  }

  private deleteServable(name: string) {
    return fromServables.deleteServableSuccess({name});
  }

  private addEventHandler(item: [string, any]) {
    const [evtName, action] = item;
    this.eventSource.addEventListener(evtName, (message: MessageEvent) => {
      try {
        const myData = JSON.parse(message.data);
        this.store.dispatch(new action(myData));
      } catch (err) {
        if (message.data) {
          this.store.dispatch(new action(message.data));
        }
      }
    });
  }
}
