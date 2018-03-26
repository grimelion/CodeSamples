import { getCampaignsList, getWidgets, exportCampaignsToCSV, exportCampaignsToExcel } from 'packages/redux/actions/singlePage';
import { connect, mapTypesOf, IRootState } from 'packages/redux';
import { appSelector } from 'packages/redux/selectors/app';
import { accountSelector } from 'packages/redux/selectors/session';
import { singleSelector, singleWidgetsSelector } from 'packages/redux/selectors/ui';
import SinglePageView from './components/SinglePageView';

const mapStateToProps = (state: IRootState) => ({
	account: accountSelector(state),
	app: appSelector(state),
	campaigns: singleSelector(state),
	widgets: singleWidgetsSelector(state),
});

const mapDispatchToProps = (dispatch) => ({
	getCampaignsList: (params) => dispatch(getCampaignsList(params)),
	exportCampaignsToCSV: (params) => dispatch(exportCampaignsToCSV(params)),
	exportCampaignsToExcel: (params) => dispatch(exportCampaignsToExcel(params)),
	getWidgets: (params) => dispatch(getWidgets(params)),
});

const { props, funcs } = mapTypesOf(mapStateToProps);

export const SinglePageScene = connect<typeof props, typeof funcs, {}>(mapStateToProps, mapDispatchToProps)(SinglePageView);
