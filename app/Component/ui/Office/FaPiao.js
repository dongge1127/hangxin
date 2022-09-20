'use strict';  
import React, { Component } from 'react';  
import {  
  StyleSheet,  
  View,  
  WebView,  
  Dimensions,
  Platform,  
  Image,
  TouchableOpacity,
  Text,
} from 'react-native';
import NavigationBar from "../APPComponent/NavigationBar";

const {width, height} = Dimensions.get('window');

const url = "http://dzwx.aisino.com/invcheck/toInvCheck.do?type=fpxt";
export default class FaPiao extends Component {  
  
  	constructor(props) {  
    	super(props);  
  	}  
  	onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    };
  	render() {  
    	return (
    	<View style={{flex: 1,backgroundColor: '#F5F5F5'}}>
            <NavigationBar
                leftAction={this.onPressBack}
                leftImage={require('../../../../img/back.png')}
                title={'发票查验'}/>
     	<View style={styles.container}>  
        <WebView  
          style={{flex:1,backgroundColor:'gray'}}
          source={{uri:url,method: 'GET'}}  
          javaScriptEnabled={true}  
          domStorageEnabled={true}  
          scalesPageToFit={false}
          />
        </View>  
      </View>  
    );  
  }  
}  
  
const styles = StyleSheet.create({
	backImgStyle:{
        width:30,
        height:30,
        marginLeft:8,
    },  
	topBar:{
        height:50,
        backgroundColor:'#50B1F8',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop:Platform.OS == 'ios' ? 20 : 0,
    },
    topText:{
        color:'#fff',
        fontSize:18,
        marginLeft:106,
    },
  	container: {
    	flex: 1,
    	backgroundColor: '#f2f2f2',  
    	paddingTop:20,  
  	},  
});  
