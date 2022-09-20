'use strict';
import React, { Component } from 'react';
import {
    Dimensions,
    StyleSheet,
    Animated,
    Text,
    View,
    Easing,
    Platform,
    AsyncStorage
} from 'react-native';
import Camera from 'react-native-camera';
import Login from './Login';
import Service from './service';
import NavigationBar from "./APPComponent/NavigationBar";
import CommonModal from "./APPComponent/CommonModal";
var screenW = Dimensions.get('window').width;
export default class QrCode extends Component {
    constructor(props) {
        super(props);
        this.state={
            flag:true,
            oneAlertFlag:false,
            alertMsg:'-',
            scanTranslte:new Animated.Value(0) 
        }
    }
    componentDidMount(){ 
        this.scanLineAnimation(); 
    } 
    scanLineAnimation(){ 
        Animated.sequence([ 
        Animated.timing(this.state.scanTranslte,{toValue:250 , duration:3000 , easing:Easing.linear}), 
        Animated.timing(this.state.scanTranslte,{toValue:0 , duration:3000 , easing:Easing.linear}) 
                        ]).start(()=>this.scanLineAnimation()) ; 
    } 
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    };
    render() {
        let width = Dimensions.get('window').width ;  
        let height = Dimensions.get('window').height ; 
        let scanCoverColor = '#44444488' ; 
        let scanRectWidth = 250 ; 

        return (
            <View style={styles.container}>
                <Camera
                ref={(cam) => {this.camera = cam;}}
                style={styles.preview}
                aspect={Camera.constants.Aspect.fill}
                onBarCodeRead={this.onReadBarCode.bind(this)}>
            </Camera>
            <CommonModal
                visible={this.state.oneAlertFlag}
                message={this.state.alertMsg}
                sureTitle='确定'
                sureAction={this.hideDialog.bind(this)}
            />
            <View style={{position:'absolute' , left:0 , right:0, top:0 , bottom:0}}>
                <NavigationBar
                    leftAction={this.onPressBack}
                    leftImage={require('../../../img/back.png')}
                    title={'二维码'}/>
                <View style={{width:width , height:(height-scanRectWidth)/2-40, backgroundColor:scanCoverColor}}/> 
                   
                    <View style={{width:width,height:scanRectWidth ,flexDirection:'row'}}>
                    <View style={{flex:1,backgroundColor:scanCoverColor}}/> 
                    <View style={{width:scanRectWidth}}> 
                    <Animated.View style={{width:scanRectWidth , height:1 , backgroundColor:"#50B1F8" , transform:[ 
                        {translateY:this.state.scanTranslte} 
                            ] }}/> 
                    </View>
                    <View style={{flex:1 , backgroundColor:scanCoverColor}}/>     
                </View> 
                <View style={{flex:1 , width:width , backgroundColor:scanCoverColor,paddingTop:10,alignItems:'center',}}>
                    <Text>将二维码放入框内，即可自动扫描</Text>
                    <Text style={{color:'#50B1F8',paddingTop:5}}>我的二维码</Text>
                </View>
            <View style={{flex:1 , width:width , backgroundColor:scanCoverColor}}/> 
            </View> 
        </View>
        );
    }
    hideDialog(){
        this.setState({oneAlertFlag:false});
    }
    onReadBarCode(e){
        let str = 'AppBaseServlet?cguid=';
        //let reg = /^([hH][tT]{2}[pP]:\/\/|[hH][tT]{2}[pP][sS]:\/\/).*,\d{18}$/;
        let num = e.data.indexOf(str);
        if(num===-1){
            this.setState({oneAlertFlag:true,alertMsg:'请扫描正确的二维码'});
            //Alert.alert('提示','请扫描正确的二维码');
            return;
        }
        if(this.state.flag){
        this.setState({flag :false});
        let qrMsg = e.data;
        console.log("e.data:=============>"+e.data);
        //let msg = qrMsg.substring(0, e.data.lastIndexOf(','));
        let cguid = qrMsg.substring(e.data.indexOf('cguid=')+6,qrMsg.length);
        let msg = e.data.substring(0, e.data.indexOf(str)-1);
            console.log("cguid:=============>"+cguid);
            console.log("msg:=============>"+msg);
        let urlArr = msg.split('/');
        let url = e.data+'&mark=getQrCodeMsg';//代表是航天信息ERP扫码
        //console.log(urlArr[0]);
            console.log('http: '+urlArr[0]+'//');
            console.log('ServiceUrl: '+msg);
            console.log('ServiceUrl1: '+urlArr[2].split(':')[0]);
            console.log('ServiceUrl2: '+urlArr[2].split(':')[1]);
            console.log('ServiceUrl3: '+urlArr[3]);
        fetch(url,30000)
            .then((response) => response.json())
            .then((responseData) => {
                console.log(responseData['list'][0]['accid']);
                Service.qrCodeFlag = true;//二维码扫描成功开关开启
                AsyncStorage.setItem('http',urlArr[0]+'//',()=>{});
                AsyncStorage.setItem('userName',responseData['list'][0]['username'],()=>{});
                AsyncStorage.setItem('passWord','',()=>{});
                AsyncStorage.setItem('accountId',responseData['list'][0]['accid'],()=>{});
                AsyncStorage.setItem('ServiceUrl',msg,()=>{});
                AsyncStorage.setItem('ServiceUrl1',urlArr[2].split(':')[0],()=>{});
                AsyncStorage.setItem('ServiceUrl2',urlArr[2].split(':')[1],()=>{});
                AsyncStorage.setItem('ServiceUrl3',urlArr[3],()=>{
                    this.props.navigator.resetTo({
                        name : 'Login',
                        component : Login,
                    });
                });
            })
            .catch((error) => {
                console.error(error);
                //this.setState({oneAlertFlag:true,alertMsg:'网络连接失败'});
                this.setState({flag :true});
            });
        }
    }
  
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop:Platform.OS == 'ios' ? 20 : 0,
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width
    },
    capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        color: '#000',
        padding: 10,
        margin: 40
    },
    topBar:{
        height:50,
        backgroundColor:'#50B1F8',
        flexDirection: 'row',
        alignItems: 'center',
    },
    topText:{
        color:'#fff',
        fontSize:18,
        marginLeft:screenW/2-65,
    },
    backImgStyle:{
        width:30,
        height:30,
        marginLeft:8,
    },
});