import React, {
  Component
} from 'react';
import {
  WebView,
  View,
  Platform
} from 'react-native';
import renderChart from './renderChart';
const iosPlatform = Platform.OS === 'ios' ? 'true' : 'false';

export default class App extends Component {
  componentWillReceiveProps(nextProps) {
    if (nextProps.option !== this.props.option) {
      this.refs.chart.reload();
    }
  }

  onMessage = event =>{
    this.props.onPress(event.nativeEvent.data);
  }

  render() {
    return (
      <View style={{flex: 1, height: this.props.height || 400,}}>
        <WebView
          javaScriptEnabled={true}
          domStorageEnabled={true}
          ref="chart"
          onMessage={this.onMessage}
          scrollEnabled={false}
          injectedJavaScript={renderChart(this.props)}
          style={{
            height: this.props.height || 400,
          }}
          source ={iosPlatform === 'true' ? require('./tpl.html') : {uri:'file:///android_asset/tpl.html'}}
        />
      </View>
    );
  }
}
