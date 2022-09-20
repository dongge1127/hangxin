import React, {Component} from 'react';
import {Container} from 'native-echarts/src/components'
import Echarts from './Echarts';

export default class App extends Component {
  render() {
    return (
      <Container width={this.props.width}>
        <Echarts {...this.props} />
      </Container>
    );
  }
}
