
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Platform,
    Image,
    TouchableOpacity,
    AsyncStorage,
    } from 'react-native';
import{
    Dialog
} from 'rn-weui';
import Home from  './Home';
import Service from './service';
import CommonStyles from '../../style/CommonStyle';
import HttpUtil from "./common/HttpUtil";
import Spinner from "react-native-loading-spinner-overlay";
import CommonModal from "./APPComponent/CommonModal";
export default class TestComponent extends Component {
     constructor(props) {
        super(props);
        this.state = {
            userName:this.props.userName,
            passWord:this.props.passWord,
            accountid:this.props.accountid,
            oneAlertFlag:false,
            alertMsg:'-',
        };
        
    };
    componentWillUnmount(){
        this.timer && clearTimeout(this.timer);
    }
    onPressBack = () => {
       this.props.navigator.pop();
    };
    onPressTesA3 = () => {
        var url = 'http://cmgl.aisino.com:8896/A3/pt/service?formid=mobile_service_app_login&username=admin&password=Admin_1&accountId=0021';
        var text = 'http://cmgl.aisino.com:8896/A3';
        this.toLogin(url, text);
        Service.sys = 'A3';
        Service.demoUrl = text;
        Service.demoAccountId = '0021';
        Service.userName = 'admin';
        Service.passWord = 'Admin_1';
        Service.demoPort = '8896';
        Service.demoApplication = 'A3';
        Service.demoUrlCom = 'cmgl.aisino.com';
        console.log(Service.sys);
        //this.toLogin(url);
    };
    onPressTesA6 = () => {
        var url = 'http://cmgl.aisino.com:8889/A6/pt/service?formid=mobile_service_app_login&username=admin&password=Admin_1&accountId=001';
        var text = 'http://cmgl.aisino.com:8889/A6';
        Service.demoUrl = text;
        Service.demoAccountId = '001';
        Service.userName = 'admin';
        Service.passWord = 'Admin_1';
        Service.demoPort = '8889';
        Service.demoApplication = 'A6';
        Service.demoUrlCom = 'cmgl.aisino.com';
        this.toLogin(url, text);
        Service.sys = 'A6';

    };

    toLogin(url,host){
        this.setState({visible:true,tip:'登录中...'});
        HttpUtil.get(url)
            .then((responseData) => {
                console.log(responseData);
                if(responseData.errorMsg=='success'){
                    //this.saveLoginMsg('admin','admin1',host);
                    this.timer = setTimeout(()=>{
                        Service.host = host+'/pt/service?formid=';
                        this.onLoginSuccess();
                    },500);
                }else{
                    Service.demoUrl = '';
                    this.setState({visible:false,oneAlertFlag:true,alertMsg:responseData.errmsg});
                    //Alert.alert('提示',responseData.errmsg);
                }
            })
            .catch((error) => {
                this.timer = setTimeout(()=>{
                    Service.demoUrl = '';
                    this.setState({visible:false,oneAlertFlag:true,alertMsg:'网络请求失败'});
                },500);
            });
    }
    saveLoginMsg(userName,passWord,host){
        AsyncStorage.setItem('userName',userName,()=>{  
        });
        AsyncStorage.setItem('passWord',passWord,()=>{  
        });
    }
    hideDialog(){
        this.setState({oneAlertFlag:false});
    }
    //跳转到第二个页面去
    onLoginSuccess(userName){
        this.setState({visible:false});
        Service.demoAcc = true;
        this.props.navigator.resetTo({
            name : 'Home',
            component : Home,
            params:{
                userName:this.state.userName
            }
        });
   };
    render() {
        return (
             <View style={CommonStyles.CommonWrapContainer}>
                <View style={CommonStyles.CommonTopBarContainer}>
                    <TouchableOpacity onPress={this.onPressBack}>
                        <Image source={require('../../../img/back.png')} style={CommonStyles.CommonTopBarImgStyle} />
                    </TouchableOpacity>
                    <Text numberOfLines={1} style={CommonStyles.CommonTopBarText}>演示环境列表</Text>
                    <View style={{height:30,width:38}}></View>
                </View>
                <View>
                    <Text style={styles.testTipStyle}>如果您是小微企业建议</Text>
                    <View style={styles.chooseImageStyle}>
                        <Image source={require('../../../img/chooseA3.png')} style={{width:120,height:120}}/>
                        <TouchableOpacity onPress={this.onPressTesA3} style={styles.btn_container}>
                            <Text style={{color:'#50B1F8',fontSize:14}}>体验Aisino.A3</Text>
                        </TouchableOpacity>
                    </View>
                    
                </View>
                <View>
                    <Text style={styles.testTipStyle}>如果您是中型企业建议</Text>
                     <View style={styles.chooseImageStyle}>
                        <Image source={require('../../../img/chooseA6.png')} style={{width:120,height:120}}/>
                        <TouchableOpacity onPress={this.onPressTesA6} style={styles.btn_container}>
                            <Text style={{color:'#50B1F8',fontSize:14}}>体验Aisino.A6</Text>
                        </TouchableOpacity>
                    </View>
                    
                </View>
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
		flex:Platform.OS == 'ios'?0:1,
        backgroundColor: '#fff',
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
        marginLeft:90,
    },
    backText:{
        color:'#fff',
        fontSize:18,
        marginLeft:5,
    },
    testTipStyle:{
        marginLeft:10,
        marginTop:15,
        fontSize:14,
        color:'#50B1F8'
    },
    chooseImageStyle:{
        alignItems:'center',
        marginTop:20,
    },
    btn_container:{
        flexDirection:'row',
        width:124,
        height:32,
        backgroundColor:'#fff',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:3,
        marginBottom:10,
        borderWidth:1,
        borderColor:'#50B1F8',
    },
});

