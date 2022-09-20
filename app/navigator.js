/**
 * Created by John on 2016-11-22.
 */
import React, { Component } from 'react';
import {
    Navigator,BackAndroid,AsyncStorage
} from 'react-native';
import JPushModule from 'jpush-react-native';
import SplashScreen from "rn-splash-screen";
import Login from './Component/ui/Login';
import Service from "./Component/ui/service";
import Home from "./Component/ui/Home";
let _navigator = null;
let defaultName = 'Login';
let defaultComponent = Login;
export default class navigator extends React.Component {
    constructor(props) {
        super(props);
    }
    state = {
        isLoading: true,
    };

    componentDidMount() {
        global.setTimeout(() => {
            this.setState({isLoading: false});
        }, 1000);
        let init = this.initStorage();
        init.then(()=>{
            if(Service.ServiceUrl&&Service.accountId) {
                Service.host = Service.ServiceUrl+'/pt/service?formid=';
                defaultName  = 'Home';
                defaultComponent = Home;
            }
        });
        //this.registerjpush(); 把这个逻辑放到Home.js中了，ios在这个位置获取不到registrationId
    }

    componentDidUpdate() {
        if (!this.state.isLoading) {
            // Hide splash screen
            SplashScreen.hide();
        }
    }
    async initStorage(){
        await AsyncStorage.getItem("ServiceUrl", (error, text) => {Service.ServiceUrl = text});
        await AsyncStorage.getItem("userName", (error, text) => {Service.userName = text});
        await AsyncStorage.getItem("passWord", (error, text) => {Service.passWord = text});
        await AsyncStorage.getItem("accountId", (error, text) => {Service.accountId = text});
    }
    registerjpush(){
        JPushModule.getRegistrationID(registrationId => {
            if(registrationId){
                console.log(registrationId);
                AsyncStorage.setItem("registrationId",registrationId);
                // this.registerUser(registrationId);
            }else{
                console.error("极光id:registrationId参数未注册");
            }
        });
    }

    //安装app后 isonce决定是否执行else
    registerUser(jpushid){
        AsyncStorage.getItem("isonce",async (err, result) => {
            if(result){
                //重复入口
                if(Platform.OS==='android'){
                    await AsyncStorage.setItem("androidBadge","0");
                    NativeModules.Badge.showBadge(0);
                }
                return null;
            }else{
                //第一次安装 删出jpushid记录
                await new Promise((resolve,reject)=> {
                    NetUtil.postJson("A8TRIP.SCJGTSXX.BC", {cregisterid: jpushid}, (response) => {
                        JPushModule.clearAllNotifications();
                        resolve();
                    })
                })
                AsyncStorage.setItem("isonce","1");
                if(Platform.OS==='android') AsyncStorage.setItem("androidBadge","0");
            }
        });
    }
    render() {
        if (this.state.isLoading) return null;
        return (
            <Navigator
                initialRoute = {{name : defaultName , component: defaultComponent}}
                configureScene={(route) => Navigator.SceneConfigs.PushFromRight}
                renderScene={(route,navigator) => {
                    _navigator = navigator;
                    let Component = route.component;
                    return <Component {...route.params} navigator = {navigator}/>
                }}
            />
        );
    }

};
(function(){
    if (!__DEV__) {
        global.console = {
            info: () => {},
            log: () => {},
            warn: () => {},
            error: () => {},
        };
    }
})();
BackAndroid.addEventListener('hardwareBackPress', function() {
    const routers = _navigator.getCurrentRoutes();
    if(routers.length==1){
        return false;
    }
    if (_navigator) {
        _navigator.pop();
        return true;
    }
    if (!_navigator){
        return false;
    }
});
