import { Profiles } from '@shared/models/_index';
import { ProfilesActions, ProfilesActionTypes } from './../actions';

export interface State {
  profiles: Profiles | null;
}

export const initialState: State = {
  profiles: null,
};

export function reducer(state = initialState, action: ProfilesActions) {
  switch (action.type) {
    case ProfilesActionTypes.GetProfilesSuccess:
      return {
        profiles: action.payload,
      };
    case ProfilesActionTypes.CleanProfiles:
      return { profiles: null };
    default:
      return state;
  }
}
