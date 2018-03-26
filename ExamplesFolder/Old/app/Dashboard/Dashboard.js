import React, { Component } from 'react';
import { Container, Header, Divider, Dimmer, Loader, Progress, Button, Message } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { itemsFetchData, fetchDataFromDb } from '../../actions/items'
import './Dashboard.css';

class Dashboard extends Component {

  componentWillMount(){
    this.props.fetchData();
  };

  _started = false;
  _fetchDataFromDb = () => {
    if (this._started) return;
    this._started = true;
    this.props.fetchDataFromDb();
  };

  render() {
    if(this.props.isLoading) {
      return(
        <Dimmer active>
          <Loader />
        </Dimmer>
      )
    }
    return (
      <Container fluid textAlign='justified' className='report-container'>
        <Header as='h3'> Dashboard </Header>
        <Divider />
        <br />
        <Message size='big' color='green'>
          Applications categories have been uploaded and you can start use service.
        </Message>
        <Progress percent={this.props.items.length} indicating />
        <Button onClick={ this._fetchDataFromDb }>
          Fetch data
        </Button>
      </Container>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    fetchData: () => dispatch(itemsFetchData()),
    fetchDataFromDb: () => dispatch(fetchDataFromDb())
  };
};

const mapStateToProps = (state) => {
  return {
    items: state.items.items,
    isLoading: state.items.isLoading,
    isError: state.items.isError,
    category: state.items.category
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);