import {combineReducers} from 'redux';
import permissionReducer from './permissionsHandler/reducer';

export const RootReducer = combineReducers({
  permissionReducer,
});
