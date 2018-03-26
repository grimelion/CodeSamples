import { IListParameters, IExportListParameters, IWidgetParameters } from 'packages/core/api';
import * as singlePageApi from 'packages/api/singlePage';
import downloadFile from 'packages/core/download';

export const SINGLE_PAGE_EXPORT_REQUEST = 'SINGLE_PAGE_EXPORT_REQUEST';
export const SINGLE_PAGE_EXPORT_SUCCESS = 'SINGLE_PAGE_EXPORT_SUCCESS';
export const SINGLE_PAGE_EXPORT_FAILURE = 'SINGLE_PAGE_EXPORT_FAILURE';

export const SINGLE_PAGE_LIST_REQUEST = 'SINGLE_PAGE_LIST_REQUEST';
export const SINGLE_PAGE_LIST_FAILURE = 'SINGLE_PAGE_LIST_FAILURE';
export const SINGLE_PAGE_LIST_SUCCESS = 'SINGLE_PAGE_LIST_SUCCESS';

export const SINGLE_PAGE_WIDGETS_REQUEST = 'SINGLE_PAGE_WIDGETS_REQUEST';
export const SINGLE_PAGE_WIDGETS_FAILURE = 'SINGLE_PAGE_WIDGETS_FAILURE';
export const SINGLE_PAGE_WIDGETS_SUCCESS = 'SINGLE_PAGE_WIDGETS_SUCCESS';

export const getDataList = (parameters: IListParameters) => {
	return (dispatch) => {
		dispatch({type: SINGLE_PAGE_LIST_REQUEST, payload: parameters});
		return singlePageApi.getSinglePageDataList(parameters).then((result) => {
			dispatch({type: SINGLE_PAGE_LIST_SUCCESS, payload: result});
			return result;
		}, (error) => dispatch({type: SINGLE_PAGE_LIST_FAILURE, payload: error}));
	};
};

export const exportDataToCSV = (parameters: IExportListParameters) => {
	return (dispatch) => {
		dispatch({type: SINGLE_PAGE_EXPORT_REQUEST, payload: parameters});

		return singlePageApi.exportSinglePageList(parameters).then((response) => {
			dispatch({type: SINGLE_PAGE_EXPORT_SUCCESS, payload: response});
			console.log(response);
			downloadFile.downloadCSV(`single-page-${response.filter.clientNumber}`, response.result);

			return response;
		}, (error) => {
			dispatch({type: SINGLE_PAGE_EXPORT_FAILURE, error});
		});
	};
};

export const exportDataToExcel = (parameters: IExportListParameters) => {
	return (dispatch) => {
		dispatch({type: SINGLE_PAGE_EXPORT_REQUEST, payload: parameters});

		return singlePageApi.exportSinglePageList(parameters).then((response) => {
			dispatch({type: SINGLE_PAGE_EXPORT_SUCCESS, payload: response});

			downloadFile.downloadExcel(`single-page-${response.filter.clientNumber}`, response.result);

			return response;
		}, (error) => {
			dispatch({type: SINGLE_PAGE_EXPORT_FAILURE, error});
		});
	};
};

export const getWidgets = (parameters: IWidgetParameters) => {
	const { filter, q, range } = parameters;

	return (dispatch) => {
		dispatch({ type: SINGLE_PAGE_WIDGETS_REQUEST, payload: { range, filter, q } });

		return singlePageApi.getWidgets(parameters).then(
			(response) => {
				dispatch({ type: SINGLE_PAGE_WIDGETS_SUCCESS, payload: response });

				return response;
			},
			(error) => { dispatch({ type: SINGLE_PAGE_WIDGETS_FAILURE, error }); }
		);
	};
};
