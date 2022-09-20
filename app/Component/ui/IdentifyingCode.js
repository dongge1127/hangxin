/**
 * Created by hu on 2017-7-31.
 */
import React, {
    Component
} from 'react';

import {
    View, Text, TouchableOpacity, Platform, TextInput, StyleSheet, Dimensions, AsyncStorage,
    Image, TouchableWithoutFeedback
} from 'react-native';
import HttpUtil from './common/HttpUtil';
import NavigationBar from "./APPComponent/NavigationBar";
import Spinner from "react-native-loading-spinner-overlay";
import Service from "./service";
import {observer} from 'mobx-react/native';
import {observable} from "../../../node_modules/mobx/lib/mobx";
import dismissKeyboard from 'react-native-dismiss-keyboard';
import Home from "./Home";
import ToastUtil from "./common/ToastUtil";
let window = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
};
@observer
export default class IndetifyingCode extends Component{
    @observable
    remainingTime = 60;//剩余时间
    @observable
    showMsg = '获取验证码';
    @observable
    overdue = ''; //验证码过期时间5分钟
    constructor(props){
        super(props);
        this.state = {
            yzm:'',//输入的验证码
            phoneNumber:'',
            sendMsgFlag:true,
            code:'',//接受到的验证码
        }
    }
    componentDidMount(){
        AsyncStorage.getItem("userName", (error, text) => {this.setState({userName:text})});
        AsyncStorage.getItem("passWord", (error, text) => {this.setState({passWord:text})});
        AsyncStorage.getItem('accountId',(error,result)=>{this.setState({ accountId:result});});
    }
    componentWillUnmount(){
        this.interval && clearTimeout(this.interval);
        this.timer && clearTimeout(this.timer);
    }
    /**
     * 发送验证码
     */
    getYZM = () => {
        dismissKeyboard();//关闭键盘
        this.setState({
            code:''
        });
        if(!/^1\d{10}$/.test(this.state.phoneNumber)){
            ToastUtil.show("请输入正确的手机号!");
            return;
        }
        this.setState({sendMsgFlag: false});
        this.interval = setInterval(() => {
            this.remainingTime--;
            if (this.remainingTime === -1) {
                this.remainingTime = 60;
                this.showMsg = '获取验证码';
                this.interval && clearTimeout(this.interval);
                this.setState({sendMsgFlag: true});
            }
        }, 1000);
        //let url = Service.host+ Service.yzm+"&phoneNumber="+this.state.phoneNumber;
        let url =  "http://cmgl.aisino.com:8896/A3/pt/service?formid=mobile_service_sms&phoneNumber="+this.state.phoneNumber;
        this.setState({
            savePhone:this.state.phoneNumber
        });
        HttpUtil.get(url,this)
            .then((responseData) => {
                if(responseData.err==='0'){
                    this.overdue = new Date();
                    this.setState({
                        code:responseData.code
                    });
                    ToastUtil.show("验证码发送成功");
                }else{
                    this.resetYZM(responseData.msg);
                }
            })
            .catch((error) => {
                this.resetYZM();
                console.error(error);
            });
    };
    /**
     * 报错后重置验证码状态,可重新点击发送验证码
     */
    resetYZM = (msg="验证码发送失败")=>{
        this.interval && clearTimeout(this.interval);
        this.remainingTime = 60;
        this.setState({
            sendMsgFlag:true
        });
        ToastUtil.show(msg);
    };
    onPressBack=()=>{
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    };
    onPressOK=()=>{
        dismissKeyboard();//关闭键盘
        if(!this.state.phoneNumber){
            ToastUtil.show("手机号不能为空");
            return;
        }
        if(!this.state.yzm){
            ToastUtil.show("验证码不能为空");
            return;
        }
        if(this.state.yzm!==this.state.code){
            ToastUtil.show("验证码不正确");
            return;
        }
        if(this.state.savePhone!==this.state.phoneNumber){
            ToastUtil.show("当前手机号和发送验证码手机号不一致");
            return;
        }
        let now = new Date();
        let time = now.getTime()-this.overdue.getTime();
        if(time>=300000){
            ToastUtil.show("验证码已过期，请重新获取");
            return;
        }
        this.setState({visible:true,tip:'登录中...'});
        let pwd = this.state.passWord==null?'':this.state.passWord;
        let url = Service.host+ Service.phoneData
            +"&userName="+this.state.userName
            +"&passWord="+pwd
            +"&phoneNumber="+this.state.phoneNumber
            +"&accountId="+this.state.accountId;
        HttpUtil.get(url,this)
            .then((responseData) => {
                if(responseData.msg==="success"){
                    this.timer = setTimeout(()=>{
                        this.setState({visible:false});
                        Service.phoneNumber=responseData.phoneNumber;
                        this.props.navigator.resetTo({
                            name : 'Home',
                            component : Home,
                            params:{
                                userName:this.state.userName,
                                skipLogin:true
                            }
                        });
                    },500);
                }else{
                    this.timer = setTimeout(()=>{
                        this.setState({visible:false});
                        ToastUtil.show(responseData.errmsg);
                    },500);
                }
            })
            .catch((error) => {
                console.error(error);
                this.timer = setTimeout(()=>{
                    this.setState({visible:false});
                    ToastUtil.show("网络连接失败");
                },500);
            });
    };
    render(){
        return(
            <View style={{flex: 1, backgroundColor: 'rgb(221,221,221)', flexDirection: 'column'}}>
                <NavigationBar
                    leftAction={this.onPressBack}
                    leftImage={require('../../../img/back.png')}
                    title={'手机号注册'}/>
                <TouchableWithoutFeedback onPress={()=>{dismissKeyboard();}}>
                    <View style={{flex: 1, backgroundColor: 'rgb(221,221,221)', flexDirection: 'column'}}>
                        <View style={[styles.input_item,{marginTop:80,borderBottomWidth:1,borderColor:'rgb(211,211,211)'}]}>
                            <Image
                                style={styles.imgStyle}
                                source={require('../../../img/user.png')}/>
                            <TextInput
                                style={[styles.text_input,{width:window.width*0.72-100}]}
                                placeholder="请输入手机号"
                                placeholderTextColor="#999999"
                                value={this.state.phoneNumber}
                                underlineColorAndroid="transparent"
                                numberOfLines={1}
                                ref={'phoneNumber'}
                                returnKeyType="go"
                                multiline={Platform.OS == 'ios'?false:true}
                                onChangeText={(text) => this.setState({phoneNumber : text})}/>
                            {this.state.sendMsgFlag ?
                                <TouchableOpacity style={styles.text_send} onPress={this.getYZM}>
                                    <Text style={{color: '#50B1F8', fontSize: window.width / 24.5}}>{this.showMsg}</Text>
                                </TouchableOpacity> :
                                <View style={[styles.text_send,{borderColor:'rgb(211,211,211)'}]}>
                                    <Text style={{
                                        color: '#999999',
                                        fontSize: window.width / 32
                                    }}>{this.remainingTime + 's后重新发送'}</Text>
                                </View>
                            }
                        </View>
                        <View style={styles.input_item}>
                            <Image
                                style={styles.imgStyle}
                                source={require('../../../img/password.png')}/>
                            <TextInput
                                style={[styles.text_input,{width:window.width*0.72}]}
                                placeholder="手机验证码"
                                placeholderTextColor="#999999"
                                value={this.state.yzm}
                                underlineColorAndroid="transparent"
                                numberOfLines={1}
                                keyboardType="numeric"
                                ref={'yzm'}
                                returnKeyType="go"
                                multiline={Platform.OS == 'ios' ? false : true}
                                onChangeText={(text) => this.setState({yzm: text})}/>
                        </View>
                        <TouchableOpacity style={styles.button} onPress={this.onPressOK}>
                            <Text style={{color:'#ffffff',fontSize:window.width/22}}>注册并登录</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableWithoutFeedback>
                <Spinner visible={this.state.visible} overlayColor={'rgba(0, 0, 0, 0.2)'}
                         textContent={this.state.tip} textStyle={{color: 'white'}}/>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    text_input:{
        fontSize: window.width/22,
        textAlign: 'left',
        paddingLeft:5,
    },
    login_msg:{
        fontSize: window.width/22,
        color: '#000000',
    },
    login_info:{
        fontSize: window.width/22,
        color: '#000000',
        fontWeight: 'bold',
    },
    input_item:{
        backgroundColor: 'white',
        flexDirection:'row',
        alignItems:'center',
        width:window.width,
        height:65
    },
    text_send:{
        height:window.height/24,
        width:window.width/4,
        borderWidth:1,
        borderColor:'#50B1F8',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:2,
        marginLeft:10
    },
    button:{
        width:window.width*0.8,
        backgroundColor:'#50B1F8',
        height:window.height/12.8,
        alignItems:'center',
        justifyContent:'center',
        borderRadius:6,
        marginLeft:window.width*0.1,
        marginTop:window.height*0.25
    },
    imgStyle:{
        marginLeft:30,
        width:20,
        height:20,
        marginRight:10
    }
});
