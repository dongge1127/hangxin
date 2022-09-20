import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    Platform,
    Image,
    TouchableOpacity,
    AsyncStorage,
    ScrollView,
} from 'react-native';
import {
    RadioCells,
    Dialog,
} from 'rn-weui/src';
import Service from '../service';
import Home from  '../Home';
import HttpUtil from "../common/HttpUtil";
import Spinner from "react-native-loading-spinner-overlay";
import JPushModule from 'jpush-react-native';
import IdentifyingCode from "../IdentifyingCode";
import NavigationBar from "../APPComponent/NavigationBar";
import CommonModal from "../APPComponent/CommonModal";
var Dimensions = require('Dimensions');
var screenW = Dimensions.get('window').width;
var screenH = Dimensions.get('window').height;
export default class ChooseAccount extends Component {

    constructor(props) {
        super(props);
        console.log(props.oldUrl);
        this.state = {
            radio: '',
            data: this.props.data,
            oneAlertFlag: false,
            alertMsg: '',
        };
    };
    componentWillUnmount(){
        this.timer && clearTimeout(this.timer);
    }
    componentDidMount() {
        if (Service.demoAcc === true) {
            this.setState({radio: Service.demoAccountId,});
            return;
        }
        if (this.props.WebService) {
            this.setState({radio: this.props.accountId});
            return;
        }
        AsyncStorage.getItem('accountId', (error, result) => {
            this.setState({radio: result});
        });
    }

    handleRadioChange = (value) => {
        this.setState({radio: value});
    };
    onPressBack = () => {
        this.props.navigator.pop();
    };

    // handleRadioChange(radio) {
    //     this.setState({radio});
    // };

    //点击确认切换所选账套按钮后
    onPressSave() {
        this.loginMethod(this.state.radio);
    }

    //切换账套时保存注册信息
    saveJpushID(){
        if(Platform.OS == "android"){
				JPushModule.notifyJSDidLoad((resultCode) => {
					if (resultCode === 0) {
					}
				});
			}
        JPushModule.getRegistrationID((registrationId) => {
            let userName = (Service.userName == null?"":Service.userName);
            let accountID = (Service.accountId == null?"":Service.accountId);
            let registerID = (registrationId == null?"":registrationId);
            let os = (Platform.OS == null?"":Platform.OS);
            let url = Service.host + Service.jPushRelationId + '&userName=' + userName + '&accountID=' + accountID + '&registerID='+ registerID + '&os='+os;
            HttpUtil.get(url, this)
                .then((responseData) => {
                    if(responseData.result == 'true'){
                        console.log("注册信息成功");
                    }else{
                        console.log("注册信息失败");
                    }
                })
                .catch((error) => {
                    console.error(error);
                })
        });
    }
    loginMethod(accountid) {//选择账套后登录到所选账套
        if (Service.demoAcc === true) {
            this.setState({oneAlertFlag: true, alertMsg: '演示账套不允许切换'});
            return;
        }
        this.setState({visible:true,tip:'登录中...'});
        let url = Service.host + Service.login
            + '&username=' + Service.userName + '&password=' + (Service.passWord == null ? '' : Service.passWord) + '&accountId=' + accountid;
        console.log(url);
        HttpUtil.get(url)
            .then((responseData) => {
                if (responseData.errorMsg === 'success') {
                    Service.successFail = false;//选择帐套成功
                    Service.accountId = accountid;
                    let save = this.saveUrl();
                    save.then((value)=>{
                        if(value)
                            this.timer = setTimeout(()=>{
                                this.onLoginSuccess(responseData);
                            },500);
                    });
                    this.saveJpushID();
                } else {
                    this.timer = setTimeout(()=>{
                        this.setState({oneAlertFlag: true, alertMsg: responseData.errmsg,visible:false});
                    },500);
                    // console.log('未登录成功的帐套：' +accountid);
                    // Service.accountId= accountid;
                    // AsyncStorage.setItem('accountId',accountid,()=>{});
                }
            })
            .catch((error) => {
                this.timer = setTimeout(()=>{
                    this.setState({oneAlertFlag: true, alertMsg: '网络请求失败',visible:false});
                },500);
                console.error(error);
            });
    }

    async saveUrl(){
        let userName = this.props.userName;
        let passWord = this.props.passWord;
        let accountId = this.state.radio;
        let http = this.props.http;
        let url_ip = this.props.url_ip;
        let url_port = this.props.url_port;
        let url_application = this.props.url_application;
        console.log('this.props.oldUrl :' +this.props.oldUrl);
        let url = this.props.oldUrl;
        console.log('chooseAccountId ; '+accountId);
        await AsyncStorage.setItem('userName', userName, () => {
        });
        await AsyncStorage.setItem('passWord', passWord, () => {
        });
        await AsyncStorage.setItem('accountId', accountId, () => {
        });
        await AsyncStorage.setItem('http', http, () => {
        });
        await AsyncStorage.setItem('ServiceUrl', url == null ? '' : url, () => {
        });
        await AsyncStorage.setItem('ServiceUrl1', url_ip == null ? '' : url_ip, () => {
        });
        await AsyncStorage.setItem('ServiceUrl2', url_port == null ? '' : url_port, () => {
        });
        await AsyncStorage.setItem('ServiceUrl3', url_application == null ? '' : url_application, () => {
        });
        return true;
    }

    //跳转到home页面去
    onLoginSuccess=(responseData)=>{
        this.setState({visible:false});
        Service.userGuid = responseData.userGuid;//登陆成功保存用户id
        if(responseData.isBind==="false"){
            this.props.navigator.push({
                name : 'IdentifyingCode',
                component : IdentifyingCode,
                params:{
                    userName:this.state.userName,
                    skipLogin:true
                }
            });
        }else{
            Service.phoneNumber=responseData.phoneNumber;
            this.props.navigator.resetTo({
                name : 'Home',
                component : Home,
                params:{
                    userName:this.state.userName,
                    skipLogin:true
                }
            });
        }
    };

    hideDialog() {
        this.setState({oneAlertFlag: false});
    }

    render() {
        return (
            <View style={styles.container}>
                <NavigationBar
                    leftAction={this.onPressBack}
                    leftImage={require('../../../../img/back.png')}
                    title={'账套选择'}/>
                <View >
                    <ScrollView style={{height: screenH - 150}}>
                        <RadioCells
                            options={this.state.data}
                            onChange={this.handleRadioChange}
                            value={this.state.radio}
                        />
                    </ScrollView>
                </View>
                    <TouchableOpacity onPress={this.onPressSave.bind(this)} style={styles.btn_container}>
                        <Text style={{color: 'white', fontSize: 18}}>确认切换所选账套</Text>
                    </TouchableOpacity>
                <CommonModal
                    visible={this.state.oneAlertFlag}
                    message={this.state.alertMsg}
                    sureTitle='确定'
                    sureAction={this.hideDialog.bind(this)}
                />
                <Spinner visible={this.state.visible} overlayColor={'rgba(0, 0, 0, 0.2)'}
                         textContent={this.state.tip} textStyle={{color: 'white'}}/>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor: '#fff',
    },
    topBar: {
        height:Platform.OS == 'ios'?55:35,
        paddingTop: Platform.OS == 'ios' ? 20 : 0,
        backgroundColor: '#50B1F8',
        flexDirection: 'row',
        alignItems: 'center',
    },
    topText: {
        color: '#fff',
        fontSize: 18,
        marginLeft: screenW / 2 - 66,
    },
    backImgStyle: {
        width: 30,
        height: 30,
        marginLeft: 8,
    },
    btn_container: {
        flexDirection: 'row',
        height: 48,
        backgroundColor: '#50B1F8',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        position:'absolute',
        width:screenW*0.88,
        bottom:20,
        left:screenW*0.06
    },
});
