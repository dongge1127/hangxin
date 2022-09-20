import React, {
    Component
} from 'react';
import {
    StyleSheet, Text, View, Platform, Image, TouchableOpacity, TextInput, AsyncStorage,
} from 'react-native';
import {CellsTitle, RadioCells, Dialog} from 'rn-weui/src';
import Home from  '../Home';
import Login from  '../Login';
import Service from  '../service';
import ChooseAccount from './ChooseAccount';
import Spinner from "react-native-loading-spinner-overlay";
import HttpUtil from "../common/HttpUtil";
import {observer} from 'mobx-react/native';
import {observable} from "mobx";
import {SwipeRow} from 'react-native-swipe-list-view';
import IdentifyingCode from "../IdentifyingCode";
import NavigationBar from "../APPComponent/NavigationBar";
import CommonModal from "../APPComponent/CommonModal";
import dismissKeyboard from 'react-native-dismiss-keyboard';
var Dimensions = require('Dimensions');
var screenW = Dimensions.get('window').width;

@observer
export default class WebService extends Component {
    @observable
    serviceUrl = '';//服务器地址 例： http://192.168.35.166:8891/A6
    @observable
    http = 'http://';//协议
    @observable
    setInput = null;//ip  例：192.168.35.166
    @observable
    portInput = null;//端口号 例：8891
    @observable
    radio = '';//应用名  例： A3或者A6
    @observable
    accountId = null;//所选账套 例：0000
    @observable
    userName = ''; //用户名
    @observable
    passWord = ''; //密码
    @observable
    accountData = '';//获取的所有账套数据
    @observable
    serviceArrays = [Service.oldHost1, Service.oldHost2, Service.oldHost3, Service.oldHost4];
    @observable
    swipeRowList = [true,true,true,true];
    constructor(props) {
        super(props);
        this._refRows = new Map();
        this.state = {
            str: '',
            oneAlertFlag: false,
            twoAlertFlag: false,
            alertMsg: '',
        };
    }

    componentWillMount() {
        this.fetchStorage();
    };
    componentWillUnmount(){
        this.timer && clearTimeout(this.timer);
    }
    fetchStorage() {
        if (Service.demoAcc) {//如果是演示账套
            this.setInput = Service.demoUrlCom;
            this.portInput = Service.demoPort;
            this.radio = Service.demoApplication;
        } else {
            AsyncStorage.getItem('ServiceUrl', (error, result) => {
                if (result) this.serviceUrl = result;
            });
            AsyncStorage.getItem('ServiceUrl1', (error, result) => {//ip
                this.setInput = result;
            });
            AsyncStorage.getItem('ServiceUrl2', (error, result) => {//端口
                this.portInput = result;
            });
            AsyncStorage.getItem('ServiceUrl3', (error, result) => {//应用名
                this.radio = result;
            });
        }
        AsyncStorage.getItem('http', (error, result) => {
            if (result) this.http = result;
        });
        this.userName = Service.userNameae;
        this.passWord = Service.passWordae;
    }

    onPressBack = () => { //返回按钮
        if (this.props.callBack) {
            if (this.props.callBack(this.state.str));
        }
        ;
        const {navigator} = this.props;
        if (navigator) {
            navigator.pop();
        }
        ;
    };//返回上一层
    onPressSave = () => { //登录前的校验
        dismissKeyboard();
        let url_http = this.http;//http协议
        let url_ip = this.setInput;//ip地址
        let url_port = this.portInput;//端口号
        let url_application = this.radio;//应用名
        if (url_http != 'http://' && url_http != 'https://') {
            this.setState({oneAlertFlag: true, alertMsg: "网络协议请输入http://或https://"});
            return;
        }
        if (!url_ip) {
            this.setState({oneAlertFlag: true, alertMsg: "ip地址不能为空"});
            return;
        }
        let reg = /^\d{1,5}$/;
        if (!reg.test(url_port)) {
            this.setState({oneAlertFlag: true, alertMsg: "端口号请输入1到65535之间的数字"});
            return;
        }
        if (parseInt(url_port) <= 1 || parseInt(url_port) >= 65535) {
            this.setState({oneAlertFlag: true, alertMsg: "端口号请输入1到65535之间的数字"});
            return;
        }
        if (!url_port) {
            this.setState({oneAlertFlag: true, alertMsg: "端口号不能为空"});
            return;
        }
        if (!url_application) {
            this.setState({oneAlertFlag: true, alertMsg: "产品不能为空"});
            return;
        }
        let url = url_http + url_ip + ':' + url_port + '/' + url_application;
        let regUrl = /^((([hH][tT][tT][pP][sS]?|[fF][tT][pP])\:\/\/)?([\w\.\-]+(\:[\w\.\&%\$\-]+)*@)?((([^\s\(\)\<\>\\\"\.\[\]\,@;:]+)(\.[^\s\(\)\<\>\\\"\.\[\]\,@;:]+)*(\.[a-zA-Z]{2,4}))|((([01]?\d{1,2}|2[0-4]\d|25[0-5])\.){3}([01]?\d{1,2}|2[0-4]\d|25[0-5])))(\b\:(6553[0-5]|655[0-2]\d|65[0-4]\d{2}|6[0-4]\d{3}|[1-5]\d{4}|[1-9]\d{0,3}|0)\b)?((\/[^\/][\w\.\,\?\'\\\/\+&%\$#\=~_\-@]*)*[^\.\,\?\"\'\(\)\[\]!;<>{}\s\x7F-\xFF])?)$/;
        //let regUrl=new RegExp(strRegex);
        if(!regUrl.test(url)){
            this.setState({oneAlertFlag: true, alertMsg: "请输入正确的服务器地址"});
            return;
        }
        this.setState({visible: true, tip: '登录中...'});
       // if (this.accountId == null || this.serviceUrl != url) {//修改了服务器配置后登录取第一个账套
            //this.getFirstAccFunction(url);
        //} else {
            this.loginMethod(url);
        //}
    };

    toLoginView() {//跳转到登录页面
        this.props.navigator.push({
            name: 'Login',
            component: Login,
        });
    }

    loginMethod = (url) => {
        let user = this.userName;
        let pwd = (this.passWord == null ? '' : this.passWord);
        let loginUrl = url + '/service?formid=apploginservice'
            + '&user=' + encodeURIComponent(user) + '&pwd=' + encodeURIComponent(pwd);
        HttpUtil.get(loginUrl,this)
            .then((responseData) => {
                console.log('GGGGGGGGGGGGGG='+responseData);
                if (responseData.tokenID) {
                    Service.host = url + '/service?formid=';
                    //this.accountId = accountId;
                    Service.sys = this.radio;//应用名赋值给sys
                    let save = this.saveUrl(url);//保存服务器配置
                    save.then((value) => {
                        if (value)
                            this.timer = setTimeout(()=>{
                                this.onLoginSuccess(responseData);
                            },500);
                    });
                }else{
                    this.setState({oneAlertFlag: true, alertMsg:responseData.error});
                    this.setState({visible: false, tip: '登录中...'});
                    return;
                }
            })
            .catch((error) => {
                console.error(error);
                this.timer = setTimeout(()=>{
                    this.setState({oneAlertFlag: true, alertMsg: '网络请求失败', visible: false});
                },500);
            });
    };
    //服务器地址保存到本地
    async saveUrl(url) {
        let userName = this.userName?this.userName:'';
        let passWord = this.passWord?this.passWord:'';
        let accountId = (this.accountId == null ? '' : this.accountId);
        let http = (this.http == null ? '' : this.http);
        let url_ip = (this.setInput == null ? '' : this.setInput);
        let url_port = (this.portInput == null ? '' : this.portInput);
        let url_application = (this.radio == null ? '' : this.radio);
        await AsyncStorage.setItem('userName', userName, () => {
        });
        await AsyncStorage.setItem('passWord', passWord, () => {
        });
        await AsyncStorage.setItem('accountId', accountId, () => {
            Service.accountId = accountId;
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


    onLoginSuccess(responseData) {//登录成功跳转到主页
        this.setState({visible: false});
        Service.tokenID = responseData.tokenID;//登陆成功保存用户id
            this.props.navigator.resetTo({
                name : 'Home',
                component : Home,
                params:{
                    userName:this.state.userName,
                    skipLogin:true
                }
            });
        }

    handleRadioChange = (radio) => {
        this.radio = radio;
    };

    oldConfig() {   //读取旧的服务器配置
        let arr = [];
        if (Service.demoAcc) {
            return arr;
        }
        let ServiceArrays = this.serviceArrays;
        arr.push(
            <View style={styles.CellStyle} key={5}>
                <Text style={styles.LeftTextStyle}>曾用服务器配置</Text>
            </View>
        );
        let flag = true;
        for (let i = 0; i < ServiceArrays.length - 1; i++) {
            if (typeof(ServiceArrays[i]) != 'object' && ServiceArrays[i] != '') {
                flag = false;
                //console.log(i);
                arr.push(
                    this.swipeRowList[i]?
                    <SwipeRow key={i}
                              ref={row => this._refRows.set(`${i}`,row)}
                              disableRightSwipe={true} rightOpenValue={-75} closeOnRowPress={true}>
                        <TouchableOpacity
                            onPress={() => this.deleteGood(i)}
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                alignItems: 'flex-end',
                                backgroundColor: '#E74C3C',
                            }}>
                            <Text style={{fontSize: 20, marginRight: 15, color: 'white'}}>删除</Text>
                        </TouchableOpacity>

                        <View key={i} style={{backgroundColor: 'white'}}>
                            <TouchableOpacity onPress={this.toUseOldUrl.bind(this, ServiceArrays[i], i)}>
                                <View style={styles.leftViewStyle}>
                                    <Text style={styles.LeftTextStyle}>{ServiceArrays[i]}</Text>
                                    <Image source={require('../../../../img/rarrow.png')}
                                           style={{width: 8, height: 13, marginRight: 8, marginLeft: 5}}/>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </SwipeRow>:null
                );
            }
        }
        if (flag) arr = []; //如果一个曾用地址都没有，返回空
        return arr;
    }

    deleteGood = (i) => {
        this._refRows.get(`${i}`).closeRow(); // 删除行
        this.swipeRowList[i] = false;
        Service['oldUser' + (i + 1)] = '';
        Service['oldPwd' + (i + 1)] = '';
        Service['oldAcc' + (i + 1)] = '';
        Service['oldHost' + (i + 1)] = '';
        AsyncStorage.setItem('oldUser' + (i + 1), '');
        AsyncStorage.setItem('oldPwd' + (i + 1), '');
        AsyncStorage.setItem('oldAcc' + (i + 1), '');
        AsyncStorage.setItem('oldHost' + (i + 1), '');
        //删除当前行的地址数据后，将其他数据依次向上填补，仅删除最后一个
        this.moveServiceConfig(i + 1);
    };
    moveServiceConfig=(m)=>{
        for(let i=1;i<m;i++){

        }
    };
    toUseOldUrl(url, i) {
        if (Service.demoAcc) {
            this.setState({oneAlertFlag: true, alertMsg: '演示账套不允许切换'});
            return;
        }
        this.setState({visible: true, tip: '登录中...'});
        let user = Service['oldUser' + (i + 1)];
        let pwd = (Service['oldPwd' + (i + 1)] == null ? '' : Service['oldPwd' + (i + 1)]);
        let accountId = Service['oldAcc' + (i + 1)];
        console.log('=============使用的旧服务器配置===============');
        console.log('user:' + user + '\npwd:' + pwd + '\nacc:' + accountId);
        let loginUrl = url + '/pt/service?formid=apploginservice' + '&user=' + encodeURIComponent(user) + '&pwd=' + encodeURIComponent(pwd);
        HttpUtil.get(loginUrl,this)
            .then((responseData) => {
                if (responseData.tokenID) {
                    Service.host = url + '/service?formid=';
                    Service.sys = this.radio;
                    let save = this.saveUrl(url);
                    save.then((value) => {
                        if (value)
                            this.timer = setTimeout(()=>{
                                this.onLoginSuccess(responseData);
                            },500);
                    });
                }else{
                    this.setState({oneAlertFlag: true, alertMsg:responseData.error});
                    this.setState({visible: false, tip: '登录中...'});
                }
            })
            .catch((error) => {
                console.error(error);
                this.timer = setTimeout(()=>{
                    this.setState({oneAlertFlag: true, alertMsg: '网络请求失败', visible: false});
                },500);
            });
    }

    async saveOldConfig(url, user, pwd, accountId) {
        let urlArr = url.split('/');
        let url_http = urlArr[0] + '//';
        let url_ip = urlArr[2].split(':')[0];
        let url_port = urlArr[2].split(':')[1];
        let url_application = urlArr[3];
        await AsyncStorage.setItem('userName', user, () => {
        });
        await AsyncStorage.setItem('passWord', pwd, () => {
        });
        await AsyncStorage.setItem('accountId', accountId, () => {
        });
        await AsyncStorage.setItem('http', url_http, () => {
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
    };

    onPressDialogOK = () => {
        this.setState({twoAlertFlag: false});
    };


    hideDialog() {
        this.setState({oneAlertFlag: false, twoAlertFlag: false});
    }  //隐藏dialog的方法
    render() {
        return (
            <View style={{flex: Platform.OS == 'ios' ? 0 : 1, backgroundColor: '#F5F5F5'}}>
                <NavigationBar
                    leftAction={this.onPressBack}
                    leftImage={require('../../../../img/back.png')}
                    title={'服务器配置'}/>
                <View style={{flexDirection: 'row',}}>
                    <View style={styles.inputHttp}>
                        <TextInput
                            style={styles.text_input}
                            placeholderTextColor="#aaaaaa"
                            value={this.http}
                            underlineColorAndroid="transparent"
                            numberOfLines={1}
                            ref={'portInput'}
                            multiline={Platform.OS == 'ios' ? false : true}
                            onChangeText={(text) => {
                                this.http = text;
                            }}
                        />
                    </View>
                    <View style={styles.inputUrl}>
                        <TextInput
                            style={styles.text_input}
                            placeholder="服务器 例如:192.168.6.145"
                            placeholderTextColor="#aaaaaa"
                            value={this.setInput}
                            underlineColorAndroid="transparent"
                            numberOfLines={1}
                            ref={'setInput'}
                            multiline={Platform.OS == 'ios' ? false : true}
                            onChangeText={(text) => {
                                this.setInput = text;
                            }}
                        />
                    </View>
                </View>
                <View style={styles.input_item}>
                    <TextInput
                        style={styles.text_input}
                        placeholder="端口号 例如:8080"
                        placeholderTextColor="#aaaaaa"
                        value={this.portInput}
                        underlineColorAndroid="transparent"
                        numberOfLines={1}
                        ref={'portInput'}
                        multiline={Platform.OS == 'ios' ? false : true}
                        onChangeText={(text) => {
                            this.portInput = text;
                        }}
                    />
                </View>
                <CellsTitle style={{fontSize: 16}}>选择产品</CellsTitle>
                <RadioCells
                    options={[
                       {
                            label: 'A8',
                            value: 'a8'
                        }
                    ]}
                    onChange={this.handleRadioChange}
                    value={this.radio}
                />
                <TouchableOpacity onPress={this.onPressSave.bind(this)} style={styles.btn_container}>
                    <Text style={{color: 'white', fontSize: 18}}>保存并登录</Text>
                </TouchableOpacity>
                <View>{this.oldConfig()}</View>

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
                <Spinner visible={this.state.visible} overlayColor={'rgba(0, 0, 0, 0.2)'}
                         textContent={this.state.tip} textStyle={{color: 'white', marginTop: 20}}/>
            </View>
        )
    };

}

const styles = StyleSheet.create({
    inputHttp: {
        width: 75,
        backgroundColor: 'white',
        height: 48,
        margin: 5,
    },
    inputUrl: {
        width: screenW - 95,
        marginLeft: 5,
        backgroundColor: 'white',
        height: 48,
        margin: 5,
    },
    mainTexts: {
        fontSize: 18,
    },
    topBar: {
        height: 35,
        backgroundColor: '#50B1F8',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Platform.OS == 'ios' ? 20 : 0,
    },
    topText: {
        color: '#fff',
        fontSize: 18,
        marginLeft: 106,
    },
    backImgStyle: {
        width: 30,
        height: 30,
        marginLeft: 8,
    },
    CellStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#efefef',
        alignItems: 'center',
        height: Platform.OS == 'ios' ? 45 : 50,
        borderBottomColor: '#e8e8e8',
        borderBottomWidth: 0.5,
    },
    LeftTextStyle: {
        marginLeft: 8,
        fontSize: 16,
    },
    leftViewStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginLeft: 8,
        height: 50,
        borderBottomWidth: 1,
        borderBottomColor: '#efefef'
    },
    text_input: {
        fontSize: 15,
        flex: 1,
        textAlign: 'left',
        textAlignVertical: 'bottom',
        marginLeft: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#efefef'
    },
    input_item: {
        backgroundColor: 'white',
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        margin: 5,
    },
    btn_container: {
        flexDirection: 'row',
        height: 48,
        backgroundColor: '#50B1F8',
        alignItems: 'center',
        justifyContent: 'center',
        width:screenW*0.88,
        marginLeft: screenW*0.06,
        marginRight: 5,
        borderRadius: 6,
        marginTop: 10,
        marginBottom: 10,
    },
});
