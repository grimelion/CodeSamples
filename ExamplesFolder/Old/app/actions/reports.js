import {
  ITEMS_TABLE_FETCH_DATA_SUCCESS,
  ITEMS_TABLE_HAS_ERRORED,
  ITEMS_TABLE_IS_LOADING,
  COLUMN_PICKED,
  DATA_CHANGED,
  DIRECTION_CHANGED
} from '../constants/constants';
import _ from 'lodash';

export function itemsHasErrored(hasErrored) {
  return {
    type: ITEMS_TABLE_HAS_ERRORED,
    hasErrored
  };
}

export function itemsIsLoading(isLoading) {
  return {
    type: ITEMS_TABLE_IS_LOADING,
    isLoading
  };
}

export function itemsFetchDataSuccess(items) {
  return {
    type: ITEMS_TABLE_FETCH_DATA_SUCCESS,
    items
  };
}

function columnHandle(column) {
  return {
    type: COLUMN_PICKED,
    column
  };
}

function dataHandle(data) {
  return {
    type: DATA_CHANGED,
    data
  };
}

function directionHandle(direction) {
  return {
    type: DIRECTION_CHANGED,
    direction
  };
}

export function handleSort(clickedColumn, props) {
  const { column, items, direction } = props;
  return (dispatch) => {
    if (column !== clickedColumn) {
      dispatch(columnHandle(clickedColumn));
      dispatch(dataHandle(_.sortBy(items, [clickedColumn])));
      dispatch(directionHandle('ascending'));
      return
    }

    dispatch(dataHandle(items.reverse()));
    dispatch(directionHandle(direction === 'ascending' ? 'descending' : 'ascending'));
  }
}

export function itemsFetchData() {
  return (dispatch) => {
    dispatch(itemsIsLoading(true));
    dispatch(columnHandle(''));
    dispatch(dataHandle([]));
    dispatch(directionHandle(''));
    fetch('/api/database/apps_db')
      .then(response => {
        if (!response.ok) {
          throw Error(response.statusText);
        }
        dispatch(itemsIsLoading(false));
        console.log(response);
        return response;
      })
      .then(res => res.json())
      .then(result => {
        console.log(result);
        dispatch(itemsFetchDataSuccess(result))
      })
      .catch(error => {
        console.log(error);
        dispatch(itemsHasErrored(true))
      });
  }
}
