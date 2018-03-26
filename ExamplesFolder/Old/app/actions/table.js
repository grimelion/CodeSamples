import _ from 'lodash';
import {
  COLUMN_HAS_CHANGED,
  DIRECTION_HAS_CHANGED,
  DATA_HAS_CHANGED
} from '../constants/constants';

export function dataHasChanged(data) {
  return {
    type: DATA_HAS_CHANGED,
    data
  };
}

export function columnHasChanged(column) {
  return {
    type: COLUMN_HAS_CHANGED,
    column
  };
}

export function directionHasChanged(direction) {
  return {
    type: DIRECTION_HAS_CHANGED,
    direction
  };
}

export function sortTable(clickedColumn) {
  let data = [],
      column = '',
      direction = '';
  return (dispatch) => {
    if (column !== clickedColumn) {
      return dispatch().then(() =>
        Promise.all([
          dispatch(dataHasChanged(_.sortBy(data, [clickedColumn]))),
          dispatch(columnHasChanged(clickedColumn)),
          dispatch(directionHasChanged('ascending'))
        ])
      )
    }
    return dispatch().then(() =>
      Promise.all([
        dispatch(dataHasChanged(data.reverse())),
        dispatch(directionHasChanged(direction === 'ascending' ? 'descending' : 'ascending'))
      ])
    );
  }
}