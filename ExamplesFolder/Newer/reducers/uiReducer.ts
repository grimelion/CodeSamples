import { IRootState } from 'packages/redux';
import { ISinglePage, ISinglePageWidgetsState } from '../reducers/ui';

export const singlePageSelector = (state: IRootState): ISinglePage => state.ui.singlePage;
export const singlePageWidgetsSelector = (state: IRootState): ISinglePageWidgetsState => state.ui.singlePageWidgets;