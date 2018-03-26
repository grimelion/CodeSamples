import { routerReducer, RouterState } from 'react-router-redux';
import { combineReducers } from 'packages/core/redux';

import ui, { IUIState } from './reducers/uiReducer';

export interface IRootState {
	ui: IUIState;
}

export default combineReducers<IRootState>({
	ui,
});
