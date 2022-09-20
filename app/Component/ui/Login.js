/**
 * Created by John on 2016-11-22.
 */
'use strict';
import React, { Component } from 'react';
import{
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput,
    Platform,
    Linking,
    AsyncStorage,
    StatusBar,
} from 'react-native';
import Service from './service';
import Home from  '../ui/Home';
import styles from  '../../style/Loginstyles';
import WebService from './Mine/WebService';
import Spinner from "react-native-loading-spinner-overlay";
import dismissKeyboard from 'react-native-dismiss-keyboard';
import HttpUtil from "./common/HttpUtil";
import CommonModal from "./APPComponent/CommonModal";

export default class Login extends Component {
    constructor(props) {
        super(props);
        this.state = {
            userName: null,
            passWord: '',
            language:'',
            accountid: '',
            optionsdata: [],
            serviveUrl:'',
            accountdata:'',
            oneAlertFlag:false,
            alertMsg:'-',
            twoAlertFlag:false,
            isNeedUpdate:false,

            visible:false,//请求数据等待
            tip:'',////请求数据信息
        }

        // AppState.addEventListener('change', (appState)=>{
        //     if(appState=='background'){
        //         this.timer = setTimeout(()=>{
        //             const { navigator } = props;
        //             navigator.resetTo({
        //                 name : 'Login',
        //                 component : Login,
        //             });
        //         },5400000);
        //     }else if(appState=='active'){
        //         setTimeout(()=>{
        //             this.timer && clearTimeout(this.timer);
        //         },3000);
        //     }
        // });
    }

    componentDidMount(){//从本地获取服务器地址和账套,用户名和密码
        //检测app是否有新版本
        //this.autoLogin();

        this.initStorage();
    };
    initStorage(){
/*        this.setState({
            userName: Service.userName,
            passWord: Service.passWord
        })*/
        AsyncStorage.getItem('ServiceUrl',(error,result)=>{if(result) Service.host = result+'/service?formid=apploginservice'});
        AsyncStorage.getItem('userName',(error,result)=>{
            this.setState({userName: result,});
            Service.userName = result;
        });
        AsyncStorage.getItem('passWord',(error,result)=>{
            this.setState({passWord:result,});
            Service.passWord = result;
        });
        AsyncStorage.getItem("http", (error, text) => {Service.http = text});
        AsyncStorage.getItem("ServiceUrl1", (error, text) => {Service.ServiceUrl1 = text});//ip
        AsyncStorage.getItem("ServiceUrl2", (error, text) => {Service.ServiceUrl2 = text});//端口号
        AsyncStorage.getItem("ServiceUrl3", (error, text) => {Service.ServiceUrl3 = text});//应用名
    }
    render() {
        return (
            <View style={{backgroundColor:'#fff',flex: Platform.OS === 'ios' ? 0 : 1}}>
                <StatusBar
                    backgroundColor = '#50B1F8'
                />
                <View style={styles.image_container}>
                    <Image
                        style={styles.style_image}
                        source={require('../../../img/applogo.png')}/>
                </View>
                <View style={styles.input_item}>
                    <Image
                        style={{marginLeft:5,width:20,height:20,marginRight:10,}}
                        source={require('../../../img/user.png')}/>
                    <View style={{borderColor:'#e8e8e8',borderBottomWidth:1,flexDirection:'row',}}>
                        <TextInput
                            style={styles.text_input}

                            placeholder="用户名"
                            placeholderTextColor="#aaaaaa"
                            value={this.state.userName}
                            underlineColorAndroid="transparent"
                            numberOfLines={1}
                            ref={'userName'}
                            returnKeyType="go"
                            multiline={Platform.OS !== 'ios'}
                            onChangeText={(text) => {
                                this.setState({
                                    userName : text
                                });
                            }}
                        />
                        <Image resizeMode='contain' style={[styles.style_barcode,{opacity:0}]} source={require('../../../img/barcode.png')}/>
                    </View>
                </View>

                <View style={styles.input_item}>
                    <Image
                        style={{marginLeft:5,width:20,height:20,marginRight:10}}
                        source={require('../../../img/password.png')}/>
                    <View style={{borderColor:'#e8e8e8',borderBottomWidth:1,flexDirection:'row',}}>
                        <TextInput
                            style={styles.text_input}
                            placeholder="密码"
                            placeholderTextColor="#aaaaaa"
                            value={this.state.passWord}
                            underlineColorAndroid="transparent"
                            numberOfLines={1}
                            ref={'passWord'}
                            returnKeyType="go"
                            multiline={Platform.OS !== 'ios'}
                            secureTextEntry={true}/*设计输入的文字不可见*/
                            onChangeText={(text) => {
                                this.setState({
                                    passWord : text
                                });
                            }}
                        />
                        <Image resizeMode='contain' style={[styles.style_barcode,{opacity:0}]} source={require('../../../img/barcode.png')}/>
                    </View>
                </View>
                <View>
                    {
                        this.state.visible?
                            <View style={[styles.btn_container,{backgroundColor:'rgb(211,211,211)'}]}>
                                <Text style={{color:'white',fontSize:18}}>登录中</Text>
                            </View>
                            :
                            <TouchableOpacity onPress={this.onPressCallback} style={styles.btn_container}>
                                <Text style={{color:'white',fontSize:18}}>登录</Text>
                            </TouchableOpacity>
                    }
                </View>
                <View style={styles.testProduct}>
                    <View>
                        <TouchableOpacity onPress={this.onPressSetting} >
                            <Text style={{color:'#3152aa',fontSize:16}}>服务配置</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.reductText}>
                    <Text style={{color:'#999',fontSize:14}}>{/*航天信息股份有限公司*/}</Text>
                </View>
                <CommonModal
                    visible={this.state.oneAlertFlag}
                    message={this.state.alertMsg}
                    sureTitle='确定'
                    sureAction={this.hideDialog.bind(this)}
                />
                <CommonModal
                    visible={this.state.twoAlertFlag}
                    message={this.state.alertMsg}
                    cancelTitle='取消'
                    sureTitle='确定'
                    cancelAction={this.hideDialog.bind(this)}
                    sureAction={this.onPressDialogOK.bind(this)}/>
                <CommonModal
                    visible={this.state.isNeedUpdate}
                    message='有新版本，请升级'
                    sureTitle='升级'
                    sureAction={this.onPressUpdate.bind(this)}
                />
                <Spinner visible={this.state.visible} overlayColor={'rgba(0, 0, 0, 0.2)'}
                         textContent={this.state.tip} textStyle={{color: 'white',marginTop:20}}/>

            </View>
        );
    }
    onPressUpdate(){
        let url = "";
        if(Platform.OS === 'ios'){
            url = "itms-apps://"
        }
        if(Platform.OS === 'android') {
            url = "market://details?id=com.aisino";
        }
        Linking.canOpenURL(url).then(supported => {
            if (supported) {
                Linking.openURL(url);
            } else {
                alert("请安装360手机助手、百度手机助手、应用宝、小米商店等下载应用");
            }
        });
        //BackAndroid.exitApp();直接关闭APP
    }
    onPressSetting = () => {
        this.saveLoginMsg(this.state.userName,this.state.passWord);
        this.props.navigator.push({
            name : 'WebService',
            component : WebService,
        });
    }
    onPressDialogOK(){
        this.setState({twoAlertFlag:false});
        this.saveLoginMsg(this.state.userName,this.state.passWord);
        this.props.navigator.push({
            name : 'WebService',
            component : WebService,
        });
    }
    hideDialog(){
        this.setState({oneAlertFlag:false,twoAlertFlag:false});
    }
    onPressCallback = () => {//登录
        dismissKeyboard();//关闭键盘
        Service.demoAcc = false;
        let url =null;
        let userName = this.state.userName;
        let passWord = this.state.passWord==null?'':this.state.passWord;
        if(Service.host){
            this.setState({visible:true,tip:''});
            //非二维码扫描登录，先获取账套信息
            url = Service.host +'&user=' +encodeURIComponent(userName)+'&pwd='+encodeURIComponent(passWord);
            this.loginMethod(url);
        }else{
            this.toSetting();
        }
    };
    autoLogin() {
        if (Service.userName && Service.passWord && Service.ServiceUrl) {
            this.setState({visible: true})
            let username = Service.userName;
            let password = Service.passWord;
            let url = `${Service.ServiceUrl}/service?formid=apploginservice&user=${encodeURIComponent(username)}&pwd=${encodeURIComponent(password)}`
            this.loginMethod(url);
        }
    }
    loginMethod(url){

        HttpUtil.get(url,this)
            .then((responseData) => {
                if(responseData.tokenID){
                    this.saveLoginMsg(this.state.userName,this.state.passWord);
                    let success = this.onLoginSuccess();
                    success.then((value)=>{
                        if(value)
                            this.timer = setTimeout(()=>{
                                this.loginSuccessView(responseData);
                            },500)
                    });
                }else{
                    if(responseData.error){
                        this.timer = setTimeout(()=>{
                            this.setState({oneAlertFlag:true,alertMsg:responseData.error,visible:false});
                        },500);
                    }
                }
            })
            .catch(() => {
                this.timer = setTimeout(()=>{
                    this.setState({
                        twoAlertFlag:true,
                        alertMsg:'网络错误或服务器配置错误,需要重新配置服务器吗？',
                        visible:false
                    });
                },500);
            });
    }
    loginSuccessView=(responseData)=>{
        console.log('==============');
        console.log(responseData);
        this.setState({visible:false});
        Service.userName=this.state.userName;
        AsyncStorage.setItem('userName',this.state.userName);
        if (this.state.passWord) {
            Service.passWord = this.state.passWord;
            AsyncStorage.setItem('passWord',this.state.passWord);
        }
        Service.tokenID = responseData.tokenID;//登陆成功保存用户id
        this.props.navigator.resetTo({
                name : 'Home',
                component : Home,
                params:{
                    userName:this.state.userName,
                    skipLogin:true
                }
            });
    };

     //跳转到配置页面
    toSetting(){
        this.saveLoginMsg(this.state.userName,this.state.passWord);
        this.props.navigator.push({
            name : 'WebService',
            component : WebService,
        });
    }
    saveLoginMsg(userName,passWord){
        console.log('登录界面保存的信息：');
        console.log('userName:'+userName+'passWord:'+passWord);
        //AsyncStorage.setItem('userName',userName==null?'':userName,()=>{
       // });
        Service.userName = userName;
        Service.passWord = passWord;
        Service.userNameae = userName;
        Service.passWordae = passWord;
       //AsyncStorage.setItem('passWord',passWord==null?'':passWord,()=>{
        //});
    }
    //跳转到第二个页面去
    async onLoginSuccess(){
        Service.sys='';
        return true;
    };
}
