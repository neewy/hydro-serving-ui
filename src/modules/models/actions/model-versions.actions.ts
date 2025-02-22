import { Action } from '@ngrx/store';
import { ModelVersion } from '@shared/_index';

export enum ModelVersionActionTypes {
  GetModelVersions = '[ModelVersion] Get all model versions',
  GetModelVersionsSuccess = '[ModelVersion] Get all model versions with success',
  GetModelVersionsFail = '[ModelVersion] Get all model versions with fail',
  AddModelVersion = '[ModelVersion] Add model version',
  AddModelVersionSuccess = '[ModelVersion] Add model version with success',
  AddModelVersionFail = '[ModelVersion] Add model version with fail',
  DeleteModelVersion = '[ModelVersion] Delete model version',
}

export class GetModelVersionsAction implements Action {
  readonly type = ModelVersionActionTypes.GetModelVersions;
}

export class GetModelVersionsSuccessAction implements Action {
  readonly type = ModelVersionActionTypes.GetModelVersionsSuccess;
  constructor(public payload: any) {}
}

export class GetModelVersionsFailAction implements Action {
  readonly type = ModelVersionActionTypes.GetModelVersionsFail;
  constructor(public error) {}
}

export class AddModelVersionAction implements Action {
  readonly type = ModelVersionActionTypes.AddModelVersion;
}

export class AddModelVersionSuccessAction implements Action {
  readonly type = ModelVersionActionTypes.AddModelVersionSuccess;
  constructor(public payload: { modelVersion: ModelVersion }) {}
}

export class AddModelVersionFailAction implements Action {
  readonly type = ModelVersionActionTypes.AddModelVersionFail;
  constructor(public error) {}
}

export class DeleteModelVersionAction implements Action {
  readonly type = ModelVersionActionTypes.DeleteModelVersion;
  constructor(public payload: { modelVersionId: number }) {}
}

export type ModelVersionsActions =
  | GetModelVersionsAction
  | GetModelVersionsSuccessAction
  | GetModelVersionsFailAction
  | AddModelVersionAction
  | AddModelVersionSuccessAction
  | AddModelVersionFailAction
  | DeleteModelVersionAction;
