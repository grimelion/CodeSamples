import req from 'superagent';
import {
  CATEGORIES_FETCH_DATA_SUCCESS,
  CATEGORIES_HAS_ERRORED,
  CATEGORIES_IS_LOADING
} from '../constants/constants';

export function itemsHasErrored(hasErrored) {
  return {
    type: CATEGORIES_HAS_ERRORED,
    hasErrored: hasErrored
  };
}

export function itemsIsLoading(isLoading) {
  return {
    type: CATEGORIES_IS_LOADING,
    isLoading: isLoading
  };
}

export function itemsFetchDataSuccess(items) {
  return {
    type: CATEGORIES_FETCH_DATA_SUCCESS,
    items: items
  };
}

export function itemsFetchData() {
  return (dispatch) => {
    dispatch(itemsIsLoading(true));
    // IP is temporary solution
    req.get('/api/database/categories')
    .accept('application/json')
    .then(response => {
      if (!response.ok) {
        throw Error(response.statusText);
      }
      dispatch(itemsIsLoading(false));
      return response;
    })
    .then(response => JSON.parse(response.text))
    .then(result => dispatch(itemsFetchDataSuccess(result)))
    .catch(error => dispatch(itemsHasErrored(true)));
  }
}