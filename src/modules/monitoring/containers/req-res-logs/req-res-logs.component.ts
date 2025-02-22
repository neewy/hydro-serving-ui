import { Component, Input, OnInit } from '@angular/core';
import { RequestResponseLogService } from '@core/services';
import { ModelVersion, TimeInterval } from '@shared/_index';
import { MetricSpecification } from '@shared/models/metric-specification.model';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import {
  filter,
  exhaustMap,
  catchError,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

@Component({
  selector: 'hs-req-res-logs',
  templateUrl: './req-res-logs.component.html',
  styleUrls: ['req-res-logs.component.scss'],
})
export class ReqResLogsComponent implements OnInit {
  log$: any;
  maxMessages: number = 20;
  maxMBytes: number = 5;
  reverse: boolean = true;
  loadFailed: boolean = true;
  loading: boolean = false;

  updateLogButtonClick$: BehaviorSubject<any> = new BehaviorSubject('');
  @Input() modelVersion$: Observable<ModelVersion>;
  @Input() timeInterval$: Observable<TimeInterval>;
  @Input() metricSpecs$: Observable<MetricSpecification[]>;

  constructor(private reqResLogService: RequestResponseLogService) {}

  ngOnInit(): void {
    this.log$ = this.updateLogButtonClick$.pipe(
      withLatestFrom(this.timeInterval$, this.modelVersion$, this.metricSpecs$),
      filter(
        ([, , mv, metricSpecifications]) => !!metricSpecifications && !!mv
      ),
      exhaustMap(([, timeInterval, modelVersion, metricSpecifications]) => {
        this.loading = true;
        return this.reqResLogService
          .getLog({
            timeInterval,
            modelVersion,
            metricSpecifications,
            maxMBytes: this.maxMBytes,
            maxMessages: this.maxMessages,
            reverse: this.reverse,
            loadOnlyFailed: this.loadFailed ? 0 : undefined,
          })
          .pipe(
            tap(() => (this.loading = false)),
            catchError(err => {
              console.error('err');
              this.loading = false;
              return throwError(err);
            })
          );
      })
    );
  }

  updateReqstore(): void {
    this.updateLogButtonClick$.next('click');
  }
}
