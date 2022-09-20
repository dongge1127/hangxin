import React,{Component} from 'react';
import {View,Text,StyleSheet,Dimensions,Image,TouchableWithoutFeedback,} from 'react-native';
var screenH = Dimensions.get('window').height;
var screenW = Dimensions.get('window').width;
export default class RequestFail extends Component {
	render(){
		return(
			<TouchableWithoutFeedback onPress={this.props.onPress}>
			<View style={styles.wrapContainer}>
				<Image source={require('../../../../img/refresh.png')} style={styles.imgStyle} />
				<Text style={styles.text}>网络连接失败，点击重新加载</Text>
			</View>
			</TouchableWithoutFeedback>
			)
	}
}
const styles = StyleSheet.create({
	wrapContainer:{
        width:screenW,
		height:screenH-130,
        backgroundColor: '#F5F5F5',
        alignItems:'center',
        paddingTop:120,
    },
    imgStyle:{
        width:40,
        height:40,
		marginBottom:20,
    },
    text:{
    	fontSize:16,
    	color:"#999",
    }
})