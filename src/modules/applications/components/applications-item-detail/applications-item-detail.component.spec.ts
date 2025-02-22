import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RouterModule } from '@angular/router';
import { SharedModule } from '@shared/shared.module';
import { ApplicationsItemDetailComponent } from './applications-item-detail.component';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { UpdateModelVersionDirective } from '@applications/directives';
import { InfluxDBService } from '@core/services';
import { HttpService } from '@core/services/http';
import { MonitoringService } from '@core/services/metrics/monitoring.service';
import { DialogService } from '@dialog/dialog.service';
import { MockApplication } from '@testing/factories/application';
import { MockStoreProvider } from '@testing/mocks';
import { of } from 'rxjs';

describe('ApplicationsItemDetailComponent', () => {
  let component: ApplicationsItemDetailComponent;
  let fixture: ComponentFixture<ApplicationsItemDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ApplicationsItemDetailComponent,
        UpdateModelVersionDirective,
      ],
      imports: [
        SharedModule,
        RouterModule,
        HttpClientTestingModule,
        RouterTestingModule,
      ],
      providers: [
        MockStoreProvider,
        DialogService,
        MonitoringService,
        InfluxDBService,
        HttpService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationsItemDetailComponent);
    component = fixture.componentInstance;
    component.application$ = of(MockApplication);

    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
