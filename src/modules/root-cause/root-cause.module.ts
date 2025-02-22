import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { SharedModule } from '@shared/shared.module';
import {
  ExplanationComponent,
  AnchorExplanationComponent,
  RiseExplanationComponent,
} from './containers';

import { ExplanationJobBuilder, ExplanationBuilder } from '@rootcause/services';
import { RootCauseEffects } from './store/root-cause.effects';
import { RootCauseFacade } from './store/root-cause.facade';
import { reducer } from './store/root-cause.reducer';
@NgModule({
  entryComponents: [ExplanationComponent],
  declarations: [
    ExplanationComponent,
    RiseExplanationComponent,
    AnchorExplanationComponent,
  ],
  imports: [
    CommonModule,
    StoreModule.forFeature('rootCause', reducer),
    EffectsModule.forFeature([RootCauseEffects]),
    SharedModule,
  ],
  providers: [ExplanationJobBuilder, ExplanationBuilder, RootCauseFacade],
  exports: [ExplanationComponent],
})
export class RootCauseModule {}
