/**
 * WebViewPage
 * @flow
 **/
'use strict'
import React, {Component} from 'react'
import {
    View,
    BackAndroid,WebView,
    StyleSheet, TouchableWithoutFeedback, Image, Text,Dimensions
} from 'react-native'
var screenH = Dimensions.get('window').height;
var screenW = Dimensions.get('window').width;
//import WebViewBridge from 'react-native-webview-bridge';
import {observer} from 'mobx-react/native';
import {observable} from "mobx";
import Service from '../service';
import NavigationBar from "../APPComponent/NavigationBar";
@observer
export default class VideoShow extends Component {
    @observable
        //'http://cmgl.aisino.com:8896/A3/NetSchoolServlet?phoneNumber='+Service.phoneNumber
        //172.26.8.85:8896/A3/NetSchoolServlet?phoneNumber=15611188148
        //http://cmgl.aisino.com:8896/A3/NetSchoolServlet?phoneNumber=15611188148
    //http://cmgl.aisino.com:8896/A3/pt/canvas?formid=a3login
    url = 'http://cmgl.aisino.com:8896/A3/NetSchoolServlet?phoneNumber='+Service.phoneNumber;
    @observable
    canGoBack=false;
    @observable
    isError=false;
    constructor(props) {
        super(props);
        this.state = {
        }
    }
    onBackAndroid=()=>{
        if(this.canGoBack){
            this.back();
            return true;
        }else{
            const routers = this.props.navigator.getCurrentRoutes();
            if(routers.length==1){
                return false;
            }
            if (this.props.navigator) {
                this.props.navigator.pop();
                return true;
            }
            if (!this.props.navigator){
                return false;
            }
        }
    }
    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
    }
    componentDidMount(){
        console.log(this.url);
        BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid);
    }
    back=()=>{
        if(this.canGoBack){
            this.webView.goBack();
        }
    };
    onNavigationStateChange(event){
        let canGoBack = this.canGoBack;
        if(canGoBack!=event.canGoBack){
            this.canGoBack=event.canGoBack;
        }
    }
    orError=()=>{
        this.isError=true;
    };
    reload=()=>{
        let date = new Date();
        let url = `${this.url}&date=${date}`;
        console.log('url:'+url);
        this.isError=false;
        this.url = url;
    };
    onPressBack = () => {
        this.props.navigator.pop();
    };
    render() {
        return (
            <View style={{flex:1}}>
                <NavigationBar
                    leftAction={this.onPressBack.bind(this)}
                    leftImage={require('../../../../img/back.png')}
                    title="视频教程"
                />
                {this.isError?
                    <TouchableWithoutFeedback onPress={this.reload}>
                        <View style={styles.wrapContainer}>
                            <Image source={require('../../../../img/refresh.png')} style={styles.imgStyle} />
                            <Text style={styles.text}>网络连接失败，点击重新加载</Text>
                        </View>
                    </TouchableWithoutFeedback>
                    :
                    <WebView
                        ref={webView=>this.webView=webView}
                        source={{uri: this.url}}
                        onNavigationStateChange={(e)=>this.onNavigationStateChange(e)}
                        onError={this.orError}
                    />
                }
            </View>

        );
    }
}
const styles = StyleSheet.create({
    wrapContainer:{
        width:screenW,
        height:screenH-35,
        backgroundColor: '#F5F5F5',
        alignItems:'center',
        paddingTop:screenH/2-60,
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