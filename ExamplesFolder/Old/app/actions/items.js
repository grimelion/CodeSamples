import {
  ITEMS_FETCH_DATA_SUCCESS,
  ITEMS_HAS_ERRORED,
  ITEMS_IS_LOADING,
  MODAL_OPENED
} from '../constants/constants';
import axios from 'axios';

export function itemsHasErrored(hasErrored) {
  return {
    type: ITEMS_HAS_ERRORED,
    hasErrored: hasErrored
  };
}

export function itemsIsLoading(isLoading) {
  return {
    type: ITEMS_IS_LOADING,
    isLoading: isLoading
  };
}

export function itemsFetchDataSuccess(items) {
  return {
    type: ITEMS_FETCH_DATA_SUCCESS,
    items: items
  };
}

export function itemsFetchData() {
  return (dispatch) => {
    dispatch(itemsIsLoading(true));
    axios.get('/api/database/categories')
      .then(response => {
        dispatch(itemsIsLoading(false));
        return response;
      })
      .then(result => dispatch(itemsFetchDataSuccess(result)))
      .catch(error => dispatch(itemsHasErrored(true)));
  }
}

export function fetchDataFromDb() {
  return (dispatch) => {
    console.log('Start fetch');
    axios.get('/api/database/apps/')
      .then(result => console.log(1))
      .catch(error => console.log(2));
  }
}