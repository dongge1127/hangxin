import React, {
    Component
} from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Platform,
    AsyncStorage,
    Linking,
    NetInfo,
    StatusBar,
    BackAndroid,
    NativeModules
} from 'react-native';
import{
    Dialog
} from 'rn-weui';
import TabNavigator from 'react-native-tab-navigator';
import ReportNav from  './Form/ReportNav';
import DoneClass from './Office/Done/DoneClass';
import ReportSearch from './Office/FsscReport/ReportSearch';
import YujingTipList from './Message/YujingTip/YujingTipList';
import Kucun from './Office/Kucun';
import TabApplication from  './Office/Application/TabApplication';
import CRM from './Office/CRM';
import FaPiao from './Office/FaPiao';
import DaibanClass from './Message/DaibanMessage/DaibanClass';
import SystemMessageList from './Message/SystemTip/SystemMessageList';
import Setting from './Mine/Setting';
import Service from './service';
import UserMsg from './Mine/UserMsg';
import About from './Mine/About';
import ChangePwd from './Mine/ChangePwd';
import ChooseAccount from './Mine/ChooseAccount';
import HttpUtil from './common/HttpUtil';
import Spinner from "react-native-loading-spinner-overlay";
import VideoShow from "./Mine/VideoShow";
import initStorage from './Data/InitStorage';
import JPushModule from 'jpush-react-native';
import Login from './Login';
import NavigationBar from "./APPComponent/NavigationBar";
import CommonModal from "./APPComponent/CommonModal";
import ToastUtil from "./common/ToastUtil";
// 导入系统类
var Dimensions = require('Dimensions');
var screenW = Dimensions.get('window').width;
var {width} = Dimensions.get('window');
/*定义一些全局的变量*/
var cols = 3;
var boxW = screenW / 3;
var vMargin = (width - cols * boxW) / (cols + 1);

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.count = 0;
        this.defaultConfigPush=this.defaultConfigPush.bind(this);
        this.state = {
            selectedTab: 'message',
            userName: this.props.userName,
            userRealName: '',
            loginedDs: '',
            versioninfo: '',
            orgnName: '',
            companyName: '',
            date: '',
            daibanMessageNum: '',
            yujingMessageNum: '',
            xitongMessageNum: '',
            optionsdata: '',
            appVersion: '',
            isNeedUpdate:false,
            application:false,
        };
    };
    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
        JPushModule.removeReceiveNotificationListener();
        JPushModule.removeReceiveOpenNotificationListener();
        //退出应用时清除通知。
        if(Platform.OS === "android"){
            JPushModule.clearAllNotifications();
            NativeModules.Badge.showBadge(0);
        }else if(Platform.OS === "ios"){
            JPushModule.setBadge(0, (badgeNumber) => {
                console.log("退出ios,清除角标")
            });
        }
    };
    componentDidMount() {
        BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid);
        //this.checkUpdate();
        this.setState({visible:true,tip:'数据正在初始化'});
        console.log(Service.host);
        let str1 = Service.host.split("/pt")[0];
        let index = str1.lastIndexOf("\/");
        let str2  = str1.substring(index + 1, str1.length);
        console.log('----------------');
        if(str2=='a8'){
            this.setState({
                application:true,
            });
        }else{
            this.setState({
                application:false,
            });
        }
        console.log(str2);

        if(!this.props.skipLogin){//如果是退出app后重新登录的
            console.log("loginAndInit:");
            this.setState({visible:true,tip:'登录中...'});
            this.loginAndInit(); //登录并初始化数据
        }else{//如果是从其他页面登录的
            console.log("loadStorage:");
            this.loadStorage();
        }
        // 保存用户与JPush的映射关系
        this.saveJPushRelation();
        this.defaultConfigPush();
    };
    //保存用户与JPush的映射关系
    async saveJPushRelation() {
        let urlString = Service.host;
        let index = urlString.lastIndexOf("\/");
        let host = urlString.substring(0, index);
        let url = host + '/service?formid=mobile_service_jpush_relation&tokenID=' + Service.tokenID + '&os=' + Platform.OS + '&registerID=';
        AsyncStorage.getItem('registrationId', (err, result) => {
            let fetchUrl = url + result;
            HttpUtil.get(fetchUrl, this)
                .then(result => {
                    console.log(result.result);
                })
                .catch(e => {
                    console.error(e);
                })
        });
    }
    async loginAndInit(){
        await AsyncStorage.getItem("accountId", (error, text) => {Service.accountId = text});
        let pwd = Service.passWord?Service.passWord:'';
        let url = Service.host+Service.login+'&username=' + encodeURIComponent(Service.userName)
            +'&password='+encodeURIComponent(pwd)+'&accountId='+Service.accountId;
        HttpUtil.get(url)
            .then((responseData) => {
                if(responseData.errorMsg=='success') {
                    if(responseData.isBind==="false"){
                        this.setState({visible:false});
                        this.props.navigator.resetTo({
                            name : 'Login',
                            component : Login
                        });
                        return;
                    }
                    Service.phoneNumber = responseData.phoneNumber;
                    Service.userGuid = responseData.userGuid;//登陆成功保存用户id
                    this.loadStorage();
                }else{
                    this.setState({oneAlertFlag:true,alertMsg:responseData.errmsg,visible:false});
                    this.props.navigator.resetTo({
                        name: 'Login',
                        component: Login
                    })
                }
            })
            .catch((error) => {
                this.setState({oneAlertFlag:true,alertMsg:'登录失败',visible:false});
                this.props.navigator.resetTo({
                    name: 'Login',
                    component: Login
                })
            });
    }
    // 设置推送
    defaultConfigPush(){
        // 必须配置此方法，否则监听器不会生效，仅android
        if (Platform.OS === 'android') {
            JPushModule.notifyJSDidLoad(resultCode => {
                if (resultCode === 0) {
                }
            });
        }
        // 接收推送通知
        JPushModule.addReceiveNotificationListener(async (message) => {
            //收到推送通知时向后台获取待办数量
            // this.fetchdaibanData();
            const url = Service.host + 'a8_mobile_daiban_modulesnum&tokenID=' + Service.tokenID;
            HttpUtil.get(url, this)
                .then((responseData) => {
                    let num = parseInt(responseData);
                    if(num > 0){
                        if(Platform.OS === 'ios'){
                            JPushModule.setBadge(num,()=>{});
                        }else{
                            NativeModules.Badge.showBadgeAndNotification(num);
                        }
                    }
                })
                .catch((error) => {
                    console.log(error);
                });
            /*            if(Platform.OS==='ios'){
                            /!*JPushModule.getBadge(async badge => {
                                let jpid=await this.getjpushid();
                                let uid=await CommonMethod.getuserid();
                                if(uid){
                                    await CommonMethod.reportlogb((badge+1),jpid,uid);
                                }else{
                                    toastShort('no user!')
                                }
                            })*!/
                        }else{
                            //安卓badge处理
                            let badge=await AsyncStorage.getItem('androidBadge');
                            if(parseInt(badge)){
                                await AsyncStorage.setItem("androidBadge",String(parseInt(badge)+1));
                                let countmsg=Number(badge)+1;
                                // NativeModules.Badge.showBadge(countmsg);
                            }else{
                                await AsyncStorage.setItem("androidBadge","1");
                                // NativeModules.Badge.showBadge(1);
                            }
                        }*/
        });
        // 打开通知
        JPushModule.addReceiveOpenNotificationListener(async (map) => {
            if(Platform.OS==='ios'){
                /*JPushModule.getBadge(badge => {
                    JPushModule.setBadge((badge-1),async success=>{
                        //上报badge
                        let jpid=await this.getjpushid();
                        let uid=await CommonMethod.getuserid();
                        if(uid){
                            await CommonMethod.reportlogb((badge-1),jpid,uid);
                        }else{
                            toastShort('no user!');
                        }
                        this.props.navigation.navigate('Xiaoxi');
                    })
                })*/
            }else{
                let badge=await AsyncStorage.getItem('androidBadge');
                if(parseInt(badge)){
                    await AsyncStorage.setItem("androidBadge",String(parseInt(badge)-1));
                    let countmsg=Number(badge)-1;
                    NativeModules.Badge.showBadge(countmsg);
                }else{
                    await AsyncStorage.setItem("androidBadge","0");
                    NativeModules.Badge.showBadge(0);
                }
                /*                let islog=await this.checkislogin();
                                if(islog){
                                    this.props.navigation.navigate('Xiaoxi');
                                }else{
                                    return null;
                                }*/
            }
        });

    }
    //检测是否需要升级App
    checkUpdate(){
        var serVersion = '';
        var url = Service.host + Service.getReleaseVersion;
        HttpUtil.get(url, this)
            .then((responseData) => {
                if(Platform.OS == 'android'){
                    serVersion = responseData.android_version;
                }
                else if(Platform.OS == 'ios'){
                    serVersion = responseData.ios_version;
                }else{
                    serVersion = '1.0.000000';
                }
                console.log("获取的后台App版本号为：" + serVersion);
                this.judgeVersion(Service.version.split("."),serVersion.split("."));

            })
            .catch((error) => {
                console.error(error);
                serVersion = '1.0.000000';//如果获取数据失败，设置默认最小版本号。
                this.judgeVersion(Service.version.split("."),serVersion.split("."))
            });
    }
    // 比较版本信息
    judgeVersion(localVersions,serverVersions){
        var flag = false;
        if(serverVersions[0] > localVersions[0]) {
            flag = true;
        }
        if(serverVersions[0] == localVersions[0] && serverVersions[1] > localVersions[1]) {
            flag = true;
        }
        if(serverVersions[0] == localVersions[0] && serverVersions[1] == localVersions[1] && serverVersions[2] >localVersions[2]) {
            flag = true;
        }
        this.setState({isNeedUpdate:flag});
    }
    fetchdaibanData() {
        var url = Service.host + 'a8_mobile_daiban_modulesnum&tokenID='+Service.tokenID;
        console.log('查询待办总条数---：'+url);
        this.setState({visible:true,tip:''});
        HttpUtil.get(url, this)
            .then((responseData) => {
                this.setState({
                    daibanMessageNum: responseData,
                });
                console.log('待办总条数：'+responseData);
                // NativeModules.Badge.showBadge(responseData);
                this.setState({visible:false,tip:''});
            })
            .catch((error) => {
                this.setState({visible:false,tip:''})
            });
    };

    loadStorage() {
        console.log('数据初始化');
        this.setState({visible:true,tip:'数据正在初始化'});
        Service.qrCodeFlag = false;
        if (!Service.sys) {
            AsyncStorage.getItem("ServiceUrl3", (error, text) => {Service.sys = text});
        }
        AsyncStorage.getItem("ServiceUrl", (error, text) => {Service.host = text + '/service?formid='});
        AsyncStorage.getItem('showImgSwitch', (error, result) => {
            if (result) Service.showImgSwitch = 'true';
            else    Service.showImgSwitch = result;
        });
        let initSuccess = ()=>{
            this.setState({visible:false});
            this.getUserMsg();
            //this.loadStorage();
            this.fetchdaibanData();
            NetInfo.fetch().done((net) => {
                Service.netState = net;
            });//获取网络信息
            //this.checkUpdate();
        }
        setTimeout(() => {
            let init = initStorage();
            init.then(()=>initSuccess())
        }, 2000);
    }

    daibanMessageNum() {
        if (this.state.daibanMessageNum == 0) {
            return null;
        } else {
            return (
                <Text style={styles.rightTitleStyle}>{this.state.daibanMessageNum}</Text>
            )
        }
    };
    yujingMessageNum() {
        if (this.state.yujingMessageNum == 0) {
            return null;
        } else {
            return (
                <Text style={styles.rightTitleStyle}>{this.state.yujingMessageNum}</Text>
            )
        }
    };
    xitongMessageNum() {
        if (this.state.xitongMessageNum == 0) {
            return null;
        } else {
            return (
                <Text style={styles.rightTitleStyle}>{this.state.xitongMessageNum}</Text>
            )
        }
    };
    onPressDaiban = (userName) => {
        // 清除角标和通知
        if (Platform.OS === 'android') {
            NativeModules.Badge.showBadge(0);
            JPushModule.clearAllNotifications();
        } else {
            JPushModule.setBadge(0, () => {});
        }
        this.props.navigator.push({
            name: 'DaibanClass',
            component: DaibanClass,
            params: {
                //回调函数刷新页面
                callFun: () => {
                    this.fetchdaibanData();
                }
            }
        })
    };
    onPressSystemMsg = () => {
        this.props.navigator.push({
            name: 'SystemMessageList',
            component: SystemMessageList,
            params: {
                //回调函数刷新页面
                callFun: () => {
                    this.fetchdaibanData();
                }
            }
        })
    };
    onPressDone = () => {
        this.props.navigator.push({
            name: 'DoneClass',
            component: DoneClass
        })
    };
    //库存
    onPressKucun = () => {
        NetInfo.fetch().done((net) => {
            Service.netState = net;
        });//获取网络信息
        this.props.navigator.push({
            name: 'Kucun',
            component: Kucun
        })
    };
    //客户CRM
    onPressCRM = () => {
        this.props.navigator.push({
            name: 'CRM',
            component: CRM
        })
    };

    onPressFapiao = () => {
        this.props.navigator.push({
            name: 'FaPiao',
            component: FaPiao
        })
    }
    onPressTabApplication = () => {
        AsyncStorage.getItem('NeedUpdate',(error,result)=>{
            console.log(result);
            if(result=='true'){
                ToastUtil.show('请升级后台系统 !');
            }else{
                this.props.navigator.push({
                    name: 'TabApplication',
                    component: TabApplication
                })
            }
        });

    }

    onPressSetting = () => {
        this.props.navigator.push({
            name: 'Setting',
            component: Setting,
        })
    };
    onPressUserMsg = () => {
        this.props.navigator.push({
            name: 'UserMsg',
            component: UserMsg,
        })
    };
    onPressVideo = () => {
        this.props.navigator.push({
            name: 'VideoShow',
            component: VideoShow,
        })
    };
    onPressAbout = () => {
        this.props.navigator.push({
            name: 'About',
            component: About,
        })
    };

    onPressUpdate(){
        let url = "";
        if(Platform.OS == 'ios'){
            url = "itms-apps://"
        }
        if(Platform.OS == 'android') {
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

    onChangePwd = () => {
        this.props.navigator.push({name: 'ChangePwd', component: ChangePwd,})
    };
    // 报表查询
    onPressReportSearch = () => {
        this.props.navigator.push({
            name: 'ReportSearch',
            component: ReportSearch,
        });
    };

    getUserMsg() {
        var url = Service.host + Service.userMsg+'&tokenID='+Service.tokenID;
        HttpUtil.get(url, this)
            .then((responseData) => {
                this.setState({
                    userRealName: responseData.userRealName,
                    loginedDs: responseData.loginedDs,
                    versioninfo: responseData.versioninfo,
                    orgnName: responseData.orgnName,
                    companyName: responseData.companyName,
                    date: responseData.date,
                });
            })
            .catch((error) => {
                console.error(error);
            });
    }


    chooseDBMethod() {
        this.setState({visible: true, tip: '数据加载中...'});
        let url = Service.host + Service.account + '&username=' + Service.userName + '&password=' + (Service.passWord == null ? '' : Service.passWord);
        HttpUtil.get(url)
            .then((responseData) => {
                console.log(responseData);
                this.setState({
                    optionsdata: [],
                });
                var list = responseData.list;
                for (var i = 0; i < list.length; i++) {
                    this.state.optionsdata.push({
                        value: list[i]['code'],
                        label: list[i]['name']
                    })
                }
                ;
                this.setState({visible: false});
                this.props.navigator.push({
                    name: 'ChooseAccount',
                    component: ChooseAccount,
                    params: {
                        data: this.state.optionsdata,
                        userName: Service.userName,
                        passWord: (Service.passWord == null ? '' : Service.passWord),
                        accountId: (Service.accountId == null ? '' : Service.accountId),
                        http: (Service.http == null ? '' : Service.http),
                        url_ip: Service.ServiceUrl1,
                        url_port: Service.ServiceUrl2,
                        url_application: Service.ServiceUrl3,
                        oldUrl: Service.ServiceUrl,
                    }
                })
            })
            .catch((error) => {
                this.setState({visible: false,oneAlertFlag:true,alertMsg:'网络连接失败'});
            });
    }

    onBackAndroid = () => {
        if (this.lastBackPressed && this.lastBackPressed + 2000 >= Date.now()) {
            //最近2秒内按过back键，可以退出应用。
            return false;
        }
        if ((this.props.navigator.getCurrentRoutes()).length > 1) {
            // nav.pop();
            return false;
        } else {
            this.lastBackPressed = Date.now();
            ToastUtil.show('再按一次退出应用');
            return true;
        }
    };
    hideDialog(){
        this.setState({oneAlertFlag:false});
    }
    render() {
        return (
            <View style={{flex: 1, backgroundColor: '#F5F5F5'}}>
                <StatusBar
                    backgroundColor='#50B1F8'
                />
                <TabNavigator>
                    {/*消息*/}
                    <TabNavigator.Item
                        title="消息"
                        selected={this.state.selectedTab === 'message'}
                        onPress={() => this.setState({selectedTab: 'message'})}
                        renderIcon={() => <Image source={require('../../../img/messn.png')} style={styles.iconStyle}/>}
                        renderSelectedIcon={() => <Image source={require('../../../img/messs.png')}
                                                         style={styles.selectedIconStyle}/>}
                    >
                        <View>
                            <NavigationBar
                                title={'消息'}/>
                            <TouchableOpacity onPress={this.onPressDaiban}>
                                <View style={styles.messageItem}>
                                    <View style={styles.leftListItem}>
                                        <View style={styles.messageItemImage}>
                                            <Image source={require('../../../img/daiban.png')} style={styles.messageImage}/>
                                        </View>
                                        <View style={styles.messageContent}>
                                            <Text style={styles.message}>待办事项</Text>
                                        </View>
                                    </View>
                                    <View style={styles.rightViewStyle}>
                                        <View>{this.daibanMessageNum()}</View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </TabNavigator.Item>
                    {/*功能*/}
                    <TabNavigator.Item
                        title="功能"
                        selected={this.state.selectedTab === 'office'}
                        onPress={() => this.setState({selectedTab: 'office'})}
                        renderIcon={() => <Image source={require('../../../img/gongnengn.png')}
                                                 style={styles.iconStyle}/>}
                        renderSelectedIcon={() => <Image source={require('../../../img/gongnengs.png')}
                                                         style={styles.selectedIconStyle}/>}
                    >
                        <View>
                            <NavigationBar
                                title={'功能'}/>
                            <View style={styles.tipContainerStyle}>
                                <Image source={require('../../../img/tip.png')} style={styles.tipImageStyle}/>
                                <Text style={{fontSize: 14}}>{this.state.appVersion}</Text>
                            </View>
                            {
                                this.state.application?
                                    <View style={styles.itemContainer}>
                                        <TouchableOpacity onPress={this.onPressDone}>
                                            <View style={styles.outViewStyle}>
                                                <Image source={require('../../../img/yiban.png')} style={styles.icon_image1}/>
                                                <Text style={styles.icon_text}>已办事项</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    :
                                    <View style={styles.itemContainer}>
                                        <TouchableOpacity onPress={this.onPressDone}>
                                            <View style={styles.outViewStyle}>
                                                <Image source={require('../../../img/yiban.png')} style={styles.icon_image1}/>
                                                <Text style={styles.icon_text}>已办事项</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={this.onPressReportSearch}>
                                            <View style={styles.outViewStyle}>
                                                <Image source={require('../../../img/application.png')} style={styles.icon_image1}/>
                                                <Text style={styles.icon_text}>单据量统计</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                            }
                        </View>
                    </TabNavigator.Item>
                    <TabNavigator.Item
                        title="我的"
                        selected={this.state.selectedTab === 'mine'}
                        onPress={() => this.setState({selectedTab: 'mine'})}
                        renderIcon={() => <Image source={require('../../../img/minen.png')} style={styles.iconStyle}/>}
                        renderSelectedIcon={() => <Image source={require('../../../img/mines.png')}
                                                         style={styles.selectedIconStyle}/>}
                    >
                        <View>
                            <View style={styles.topBarMine}>
                                <Text style={styles.topTextMine}>我的</Text>
                            </View>
                            <TouchableOpacity onPress={this.onPressUserMsg}>
                                <View style={styles.topViewStyle}>
                                    <Image source={require('../../../img/person.png')} style={styles.leftIconStyle}/>
                                    <View style={styles.conterViewStyle}>
                                        <Text style={styles.conterViewTextStyle}>{this.state.userRealName}</Text>
                                    </View>
                                    <Image source={require('../../../img/rarrow.png')} style={{width: 8, height: 13, marginRight: 8}}/>
                                </View>
                            </TouchableOpacity>
                            <View style={{marginTop: 20}}>
                                <TouchableOpacity onPress={this.onChangePwd}>
                                    <View style={styles.mineCellContainer}>
                                        <View style={styles.leftViewStyle}>
                                            <Image source={require('../../../img/mima.png')}
                                                   style={styles.leftImgStyle}/>
                                            <Text style={styles.leftTitleStyle}>密码设置</Text>
                                        </View>
                                        <View style={styles.rightViewStyle}>
                                            <Image source={require('../../../img/rarrow.png')}
                                                   style={{width: 8, height: 13, marginRight: 8, marginLeft: 5}}/>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this.onPressSetting}>
                                    <View style={styles.mineCellContainer}>
                                        <View style={styles.leftViewStyle}>
                                            <Image source={require('../../../img/xitong.png')}
                                                   style={styles.leftImgStyle}/>
                                            <Text style={styles.leftTitleStyle}>系统设置</Text>
                                        </View>
                                        <View style={styles.rightViewStyle}>
                                            <Image source={require('../../../img/rarrow.png')}
                                                   style={{width: 8, height: 13, marginRight: 8, marginLeft: 5}}/>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={this.onPressAbout}>
                                    <View style={styles.mineCellContainer}>
                                        <View style={styles.leftViewStyle}>
                                            <Image source={require('../../../img/i.png')} style={styles.leftImgStyle}/>
                                            <Text style={styles.leftTitleStyle}>关于我们</Text>
                                        </View>
                                        <View style={styles.rightViewStyle}>
                                            <Image source={require('../../../img/rarrow.png')}
                                                   style={{width: 8, height: 13, marginRight: 8, marginLeft: 5}}/>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TabNavigator.Item>
                </TabNavigator>
                <CommonModal
                    visible={this.state.isNeedUpdate}
                    message='有新版本，请升级'
                    sureTitle='升级'
                    sureAction={this.onPressUpdate.bind(this)}
                />
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
        flex: Platform.OS == 'ios' ? 0 : 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    topBar: {
        backgroundColor: '#50B1F8',
        justifyContent: 'center',
        alignItems: 'center',
        height:Platform.OS == 'ios'?55:35,
        paddingTop: Platform.OS == 'ios' ? 20 : 0
    },
    titleText: {
        color: '#fff',
        fontSize: 18,
    },
    tipContainerStyle: {
        flexDirection: "row",
        alignItems: 'center',
        height: 70,
        backgroundColor: '#fff',
        marginTop: 5,
        marginBottom: 10,
    },
    tipImageStyle: {
        width: 60,
        height: 60,
        marginRight: 10,
        marginLeft: 18,
    },
    itemContainer: {
        backgroundColor: '#fff',
        flexDirection: "row",
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        borderTopWidth: 1,
        borderColor: '#F0F0F0',
    },
    outViewStyle: {
        width: boxW,
        height: boxW,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: vMargin,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderColor: '#F0F0F0',
    },
    icon_image1: {
        alignSelf: 'center',
        width: 60,
        height: 62,
    },
    icon_image2: {
        alignSelf: 'center',
        width: 63,
        height: 53,
    },
    icon_text: {
        marginTop: 5,
        alignSelf: 'center',
        color: '#333',
        textAlign: 'center',
        fontSize: 13,
    },
    iconStyle: {
        width: 24,
        height: 24,
    },
    selectedIconStyle: {
        width: 24,
        height: 24,
    },
    messageItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#F5F7FB',
        backgroundColor: '#fff',
        paddingBottom: 6,
        paddingTop: 6,
    },
    leftListItem:{
        flexDirection: 'row'
    },
    messageItemImage: {
        width: 55,
        height: 55,
        marginLeft: 15,
    },
    messageImage: {
        width: 55,
        height: 55,
    },
    messageContent: {
        marginLeft: 10,
        justifyContent: 'center',
    },
    message: {
        fontSize:13,
        color: '#333',
    },
    topViewStyle: {
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 10,
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: 'white',
    },
    leftIconStyle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth:Platform.OS == 'ios' ? 0 : 3,
        overflow:'hidden',
    },
    conterViewStyle: {
        flexDirection: 'row',
        width: screenW * 0.6,
    },
    conterViewTextStyle: {
        fontSize: 16,
        color: '#000',
        fontWeight: '300',
    },
    bottomViewStyle: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
    },
    mineCellContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: 'white',
        alignItems: 'center',
        height: Platform.OS == 'ios' ? 55 : 60,
        borderBottomColor: '#e8e8e8',
        borderBottomWidth: 0.5,
    },
    leftViewStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8
    },

    rightViewStyle: {
        justifyContent: 'center',
    },
    leftImgStyle: {
        width: 40,
        height: 40,
        marginRight: 8,
    },
    leftTitleStyle: {
        fontSize:13,
        color: '#333',
    },
    rightTitleStyle: {
        paddingLeft: 5,
        paddingRight: 5,
        backgroundColor: "#e4393c",
        fontSize:13,
        color: "#fff",
        borderRadius: 9,
        overflow: 'hidden',
        marginRight: 6,
    },
    RightTextStyle: {
        fontSize: 16,
        color: '#fff',
        marginRight: 8,
    },
    topTextMine: {
        width: 50,
        color: '#fff',
        fontSize: 18,
        marginLeft: (screenW - 36) / 2,
    },
    topBarMine: {
        height:Platform.OS == 'ios'?55:35,
        paddingTop: Platform.OS == 'ios' ? 20 : 0,
        backgroundColor: '#50B1F8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
});

