import { Component, ViewEncapsulation, 
    // ChangeDetectorRef, 
    ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MdlDialogService } from '@angular-mdl/core';
import { Subscription } from 'rxjs/Subscription';
import { Chart } from "chart.js";
import { chart } from 'highcharts';

import { Store } from '@ngrx/store';
import { 
    AppState, 
    Application,
    Runtime
} from '@shared/models/_index';

import { environment } from '@environments/environment';

import {
    DialogUpdateServiceComponent,
    DialogDeleteServiceComponent,
    DialogTestComponent,
    injectableTestOptions,
    injectableApplicationId,
    injectableServiceUpdate
} from '@components/dialogs/_index';

declare var EventSource:any;



@Component({
    selector: 'hydro-applications-item-detail',
    templateUrl: './applications-item-detail.component.html',
    styleUrls: ['./applications-item-detail.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ApplicationsItemDetailComponent {
    public JSON = JSON;
    public id: string = '';
    public serviceModels: any[] = [];
    public serviceModelsFiltered: any[];
    public applications: Application[] = [];
    public application: Application;
    public publicPath: string = '';

    public runtimes: Runtime[];

    public fullHeight: boolean = false;

    public tableHeader: string[] = ['Model', 'Version', 'Created Date', 'Weight'];

    public chartOptions = {
        responsive: true,
        title: {
            display: true,
            text: 'Application graph',
            fontSize: 24,
            fontFamily: '"Museo Sans Regular"',
            fontColor: '#04143c'
        },
        tooltips: {
            mode: 'index',
            intersect: true
        }
    };

    public alerts: any[] = [];
    public averageChart: any;
    public confidenceChart: any;
    public chartData = {
        labels: [],
        datasets: []
    };

    public signatureName: any[];

    private eventSourcePath: string;
    // private eventSourceAlerts: any;
    private eventSourceMeasures: any;
    private storeSub: Subscription;
    private activeRouteSub: Subscription;
    private runtimesStoreSub: Subscription;

    constructor(
        public store: Store<AppState>,
        public dialog: MdlDialogService,
        private activatedRoute: ActivatedRoute,
        // private modelServicesService: ModelServicesService,
        private router: Router,
        // private changeDetector: ChangeDetectorRef,
        private elementRef: ElementRef,
    ) {
        this.activeRouteSub = this.activatedRoute.params
            .map(params => {
                this.id = params['id'];
                return this.id;
            })
            .subscribe(id => {
                this.publicPath = `${environment.host}:${environment.port}${environment.apiUrl}${this.router.url}`;
                if (this.storeSub) {
                    this.storeSub.unsubscribe();
                }
                // if (this.eventSourceAlerts) {
                //     this.eventSourceAlerts.close();
                // }
                if (this.eventSourceMeasures) {
                    this.eventSourceMeasures.close();   
                }
                this.loadInitialData(id);
            });
    }

    ngAfterContentInit() {
        this.initChart();
    }

    public initChart() {
        Chart.defaults.global.defaultFontColor = '#04143c';
        Chart.defaults.global.defaultFontFamily = '"Museo Sans Regular"';
        
        let averageChartRef = this.elementRef.nativeElement.querySelector('#averageChart');
        let confidenceChartRef = this.elementRef.nativeElement.querySelector('#confidenceChart');

        this.averageChart = chart(averageChartRef, {
                credits: {
                    enabled: false
                },
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Classes\' average values'
                },
                xAxis: {
                    title: {
                        text: 'Classes'
                    },
                    categories: []
                },
                yAxis: {
                    title: {
                        text: 'Values'
                    }
                },
                tooltip: {
                    shared: true
                },
                plotOptions: {
                    column: {
                        grouping: false,
                        shadow: false,
                        borderWidth: 0
                    }
                },
                series: [{
                    name: 'Average',
                    data: []
                }, {
                    name: 'Total',
                    data: [],
                    pointPadding: 0.2
                }]
            });

        this.confidenceChart = chart(confidenceChartRef, {
                credits: {
                    enabled: false
                },
                chart: {
                    type: 'column'
                },
                title: {
                    text: 'Confidence'
                },
                xAxis: {
                    title: {
                        text: 'Classes'
                    },
                    categories: []
                },
                yAxis: {
                    title: {
                        text: 'Confidence values'
                    }
                },
                series: [{
                    name: 'Classes',
                    data: []
                }]
            });
    }

    ngOnDestroy() {
        // this.eventSourceAlerts.close();
        this.eventSourceMeasures.close();
        if (this.activeRouteSub) {
            this.activeRouteSub.unsubscribe();
        }
        if (this.storeSub) {
            this.storeSub.unsubscribe();
        }
        if (this.runtimesStoreSub) {
            this.runtimesStoreSub.unsubscribe();   
        }
    }

    public getRuntimeInfo(runtimeId: number) {
        console.log(this.runtimes.find(runtimes => runtimes.id === runtimeId));
        const runtime = this.runtimes.find(runtimes => runtimes.id === runtimeId);
        return runtime.name;
    }

    public testApplication(application: Application) {
        this.dialog.showCustomDialog({
            component: DialogTestComponent,
            styles: {'width': '900px', 'min-height': '250px'},
            classes: '',
            isModal: true,
            clickOutsideToClose: true,
            enterTransitionDuration: 400,
            leaveTransitionDuration: 400,
            providers: [{ provide: injectableTestOptions, useValue: application }]
        });
    }

    public editApplication(application: Application) {
        this.dialog.showCustomDialog({
            component: DialogUpdateServiceComponent,
            styles: {'width': '900px', 'min-height': '250px', 'max-height': '90vh', 'overflow': 'auto'},
            classes: '',
            isModal: true,
            clickOutsideToClose: true,
            enterTransitionDuration: 400,
            leaveTransitionDuration: 400,
            providers: [{provide: injectableServiceUpdate, useValue: application}]
        });
    }

    public removeApplication(id: number) {
        this.dialog.showCustomDialog({
            component: DialogDeleteServiceComponent,
            styles: {'width': '600px', 'min-height': '250px'},
            classes: '',
            isModal: true,
            clickOutsideToClose: true,
            enterTransitionDuration: 400,
            leaveTransitionDuration: 400,
            providers: [{provide: injectableApplicationId, useValue: id}]
        });
    }

    private loadInitialData(id) {
        this.runtimesStoreSub = this.store.select('runtimes')
            .subscribe(runtimes => this.runtimes = runtimes);
        
        this.storeSub = this.store.select('applications')
            .filter(applications => applications.length > 0)
            .subscribe(applications => {
                if (applications.length) {
                    this.applications = applications;
                    this.getApplicationData(id);
                    this.initChartData();
                }
            });
    }

    private initChartData() {
        this.eventSourcePath = environment.production ? `${window.location.protocol}//${window.location.hostname}/v1/measure/streaming` : `${window.location.protocol}//${window.location.hostname}:9999/v1/measure/streaming`;
        // this.eventSourceAlerts = new EventSource(`${this.eventSourcePath}/alerts`);
        this.eventSourceMeasures = new EventSource(`${this.eventSourcePath}/measures`);

        // this.alerts = [];

        // this.eventSourceAlerts.onopen = (e) => { console.log(`Connected to ${ e.target.url}`) };
        this.eventSourceMeasures.onopen = (e) => { console.log(`Connected to ${ e.target.url}`) };
        
        // this.eventSourceAlerts.onmessage = (e) => { 
        //     if (e.data.length) {
        //         let response = JSON.parse(e.data);
        //         if (response.meta.applicationId === this.application.name) {
        //             this.alerts.push(response.description);
        //             this.changeDetector.detectChanges();
        //         }
        //     };
        // }
        // let classToData = {};
        let chartConfidenceData = [];
        this.eventSourceMeasures.onmessage = (e) => { 
            if (e.data.length) {
                let response = JSON.parse(e.data);
                // let labels: string[] = [];

                console.log(response);

                if (response.applicationId === this.application.name) {

                    let confidences = response.confidences;
                    let measures = response.measures;

                    console.log(measures);

                    for (let key in confidences) {
                        if (confidences.hasOwnProperty(key)) {
                            if (chartConfidenceData.find(item => item.name === key) === undefined) {
                                chartConfidenceData.push({name: key, data: confidences[key]});
                            } else {
                                chartConfidenceData.find(item => item.name === key).data = confidences[key];
                            }
                        }
                    }



                    let labels: string[] = [];
                    let chartData: number[] = [];

                    chartConfidenceData.map(item => {
                        labels.push(item.name);
                        chartData.push(item.data);
                    });

                    this.confidenceChart.xAxis[0].update({categories: labels});
                    this.confidenceChart.series[0].setData(chartData, false);
                    this.confidenceChart.redraw();


                    let measureClasses = measures.map(m => m.class);
                    measureClasses.sort();
                    
                    let cumulativeSumData = measureClasses
                        .map(l => measures.filter(m => m.class === l)[0])
                        .map(entry => entry.cumulativeSum);

                    let totalData = measureClasses
                        .map(l => measures.filter(m => m.class === l)[0])
                        .map(entry => entry.total);

                    console.log(measureClasses);
                    console.log(cumulativeSumData);
                    console.log(totalData);

                    this.averageChart.xAxis[0].update({categories: measureClasses});
                    this.averageChart.series[0].setData(cumulativeSumData, false);
                    this.averageChart.series[1].setData(totalData, false);
                    this.averageChart.redraw();

                    console.log(this.averageChart);

                    // measureClasses.forEach((label, i) => {
                    //     if (-1 === Object.keys(classToData).indexOf(label)) {
                    //         classToData[label] = {
                    //             averageValues: [],
                    //             confidenceValues: []
                    //         }
                    //     } else {
                    //         if (classToData[label].averageValues.length > 8) { classToData[label].averageValues.shift(); }
                    //         if (classToData[label].confidenceValues.length > 8) { classToData[label].confidenceValues.shift(); }

                    //         let measureValue = newData[i];
                    //         let confidenceValue = Object.keys(response.confidences).indexOf(label) !== -1 ?
                    //             response.confidences[label] * 100 : 0;

                    //         i === 0 ? labels.push('n') : labels.push(`n-${i}`);
                    //         classToData[label].averageValues.push(measureValue);
                    //         classToData[label].confidenceValues.push(confidenceValue);

                    //     }
                    // });

                    // let measuresDatasets = Object.keys(classToData).map((label, i) => {
                    //     return {
                    //         type: 'line',
                    //         label: `${label} average`,
                    //         backgroundColor: this.dummyColorPicker(i),
                    //         borderColor: this.dummyColorPicker(i, 0.9),
                    //         fill: false,
                    //         data: classToData[label].averageValues,
                    //         yAxisID: 'left-y-axis'
                    //     };
                    // });

                    // let confidenceDatasets = Object.keys(classToData).map((label, i) => {
                    //     return {
                    //         type: 'bar',
                    //         label: label,
                    //         backgroundColor: this.dummyColorPicker(i, 0.5),
                    //         data: classToData[label].confidenceValues,
                    //         yAxisID: 'left-y-axis'
                    //     };
                    // });

                    // this.averageChart.data.labels = labels.reverse();
                    // this.averageChart.data.datasets = measuresDatasets;
                    // this.confidenceChart.data.datasets = confidenceDatasets;
                    // this.averageChart.update({
                    //     duration: 0
                    // });
                    // this.confidenceChart.update({
                    //     duration: 0
                    // });   
                }
            };
        }
    }

    private getApplicationData(id: string) {
        this.serviceModels = [];
        if (this.applications.length) {
            this.application = this.applications.filter(application => application.id === Number(id)).shift();
            this.signatureName = this.application.contract.match(/signature_name: \"(.*)\"\n/)
        }
    }

    // private dummyColorPicker(i = 0, opacity = 1) {
    //     let base = {
    //         r: 255 - i*20,
    //         g: 0 + i*20,
    //         b: 50 + i*10
    //     };

    //     return `rgba(${base.r}, ${base.g}, ${base.b}, ${opacity})`
    // }


}
