/**
 * Created by John on 2016-11-22.
 */
import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    AsyncStorage,
    Dimensions,
    Navigator,
} from 'react-native';
import Service from "./Component/ui/service";
import Home from "./Component/ui/Home";
import Login from './Component/ui/Login';
var screenW = Dimensions.get('window').width;
var screenH = Dimensions.get('window').height;
let defaultName = 'Login';
let defaultComponent = Login;
export default class navigator extends React.Component {

    constructor(props) {
        super(props);
        this.state={
            isLoading:true,
        }
    }
    componentDidMount() {
        let init = this.initStorage();
        init.then(()=>{
            if(Service.ServiceUrl&&Service.accountId) {
                Service.host = Service.ServiceUrl+'/pt/service?formid=';
                defaultName  = 'Home';
                defaultComponent = Home;
            }
            this.setState({isLoading: false});
        })
    }
    async initStorage(){
        await AsyncStorage.getItem("ServiceUrl", (error, text) => {Service.ServiceUrl = text});
        await AsyncStorage.getItem("userName", (error, text) => {Service.userName = text});
        await AsyncStorage.getItem("passWord", (error, text) => {Service.passWord = text});
        await AsyncStorage.getItem("accountId", (error, text) => {Service.accountId = text});
    }
    render() {
        if (this.state.isLoading){
            return(<View><Image source={require('../img/lanuchbg.png')} style={{width:screenW,height:screenH}} /></View>);
        }
        else return (
            <Navigator
                initialRoute = {{name : defaultName , component: defaultComponent}}
                configureScene={(route) => Navigator.SceneConfigs.PushFromRight}
                renderScene={(route,navigator) => {
                    let Component = route.component;
                    return <Component {...route.params} navigator = {navigator} />
                }}
            />
        );
    }

};