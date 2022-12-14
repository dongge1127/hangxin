/**
 * Created by Huchengyu on 2017-1-6.
 */
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    AsyncStorage,
    ActivityIndicator,
    Dimensions,
    Platform,
    NativeModules
} from 'react-native';
import Service from '../service';
import MyCell from './MineCell';
import HttpUtil from '../common/HttpUtil';
import Login from "../Login";
import Spinner from "react-native-loading-spinner-overlay";
import JPushModule from 'jpush-react-native'
import NavigationBar from "../APPComponent/NavigationBar";
import CommonModal from "../APPComponent/CommonModal";

var screenW = Dimensions.get('window').width;
var screenH = Dimensions.get('window').height;
export default class UserMsgList extends Component {

    constructor(props){
        super(props);
        this.state={
            isLoading:true,
            userName:'',
            userRealName:'',
            loginedDs:'',
            versioninfo:'',
            orgnName:'',
            companyName:'',
            date:'',
            mobile:'',
            oneAlertFlag:false,
            alertMsg:'-',
            requestFail:false
        };
    }
    componentDidMount(){
        AsyncStorage.getItem('userName',(error,result)=>{
            console.log('CCCC'+result);
            this.setState({userName:result,});
            Service.userName = result;
        });
        this.getUserMsg();
    };
    componentWillUnmount(){
        this.timer && clearTimeout(this.timer);
    }
    getUserMsg=() =>{
        var url = Service.host + Service.userMsg + '&tokenID=' + Service.tokenID;
        HttpUtil.get(url, this)
            .then((responseData) => {
                console.log("000000")
                console.log(responseData.userRealName)
                this.setState({
                    isLoading:false,
                    userRealName: responseData.userRealName,
                    loginedDs: responseData.loginedDs || '',
                    versioninfo: responseData.versioninfo,
                    orgnName: responseData.orgnName,
                    companyName: responseData.companyName,
                    date: responseData.date
                });
            })
            .catch((error) => {
                this.setState({
                    isLoading:true,requestFail:true
                });
            });
    }
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    };
    onPresslogout = ()=>{
        this.setState({visible:true,tip:'????????????...'});
        // ?????????????????????JPush????????????
        const url2 = Service.ServiceUrl + '/service?formid=mobile_service_jpush_relation&tokenID=' + Service.tokenID + '&os=' + Platform.OS + '&operation=delete' + '&registerID=0000' + '&username=' + Service.userName;
        HttpUtil.get(url2, this);
        var url = Service.host+'logoutservice'+'&tokenID='+Service.tokenID;
        HttpUtil.get(url,this);
        Service.passWord = '';
        Service.tokenID = '';
        Service.passWord = '';
        AsyncStorage.setItem('passWord','');
        console.log('BBBBBBBBBB'+Service.userName);
        // ?????????????????????
        if (Platform.OS === 'android') {
            JPushModule.clearAllNotifications();
            NativeModules.Badge.showBadge(0);
        } else {
            JPushModule.setBadge(0, () => {});
        }
        this.props.navigator.resetTo({
            name : 'Login',
            component : Login,
            params:{
                userName:Service.userName
            }
        });
    };
    loadScene=()=>{
        if(this.state.isLoading==true){
            if(this.state.requestFail==true){
                return(
                    <View style={styles.wrapContainer}>
                        <Text style={styles.text}>??????????????????</Text>
                    </View>)
            }else{
                return(<ActivityIndicator
                    animating={this.state.isLoading}
                    style={[{height: 80,marginTop:screenH/2-90}]}
                    size="large"
                    color="#999"/>)
            }

        }else{
            return(<View>
                <MyCell
                    leftTitle="??????"
                    rightTitle={this.state.userRealName}
                />
                <MyCell
                    leftTitle="??????"
                    rightTitle={this.state.versioninfo}
                />
                {this.testLength()}
                <MyCell
                    leftTitle="????????????"
                    rightTitle={this.state.date}
                />
                <MyCell
                    leftTitle="????????????"
                    rightTitle={this.state.orgnName}
                />
            </View>)
        }
    };
    hideDialog(){
        this.setState({oneAlertFlag:false});
    }
    testLength(){
        if(this.state.loginedDs && this.state.loginedDs.length < 25){
            return (
                <MyCell
                    leftTitle="????????????"
                    rightTitle={this.state.loginedDs}
                />
            );
        }else if(this.state.loginedDs && this.state.loginedDs.length > 25){
            return(
                <View style={styles.container}>
                    <View style={styles.leftViewStyle}>
                        <Text style={styles.leftTitleStyle}>????????????</Text>
                    </View>
                    <View style={{width:screenW-80,marginLeft:10}}>
                        <Text>{this.state.loginedDs}</Text>
                    </View>
                </View>
            );
        }
    }
    render() {
        return(
            <View style={styles.all}>
                <NavigationBar
                    leftAction={this.onPressBack}
                    leftImage={require('../../../../img/back.png')}
                    title={'????????????'}/>
                {this.loadScene()}
                <TouchableOpacity onPress={this.onPresslogout} style={styles.btn_exit}>
                    <Text style={{color:'white',fontSize:18}}>????????????</Text>
                </TouchableOpacity>
                <Spinner visible={this.state.visible} overlayColor={'rgba(0, 0, 0, 0.2)'}
                         textContent={this.state.tip} textStyle={{color: 'white'}}/>
                <CommonModal
                    visible={this.state.oneAlertFlag}
                    message={this.state.alertMsg}
                    sureTitle='??????'
                    sureAction={this.hideDialog.bind(this)}
                />
            </View>);
    }

}
const styles = StyleSheet.create({
    wrapContainer:{
        width:screenW,
        height:screenH-70,
        backgroundColor: '#F5F5F5',
        alignItems:'center',
        paddingTop:screenH/2-70,
    },
    text:{
        fontSize:16,
        color:"#999",
    },
    btn_exit:{
        width:screenW*0.88,
        position:'absolute',
        bottom:20,
        height:48,
        backgroundColor:'#50B1F8',
        alignItems:'center',
        justifyContent:'center',
        marginLeft:screenW*0.06,
        marginRight:2,
        borderRadius:6,
        marginTop:10,
    },
    all:{
        flex:1,
        backgroundColor: '#F5F5F5',
    },
    container: {
        flexDirection:'row',
        backgroundColor:'white',
        alignItems:'center',
        borderBottomColor:'#e8e8e8',
        borderBottomWidth:0.5,
        paddingTop:15,
        paddingBottom:15,
    },
    leftViewStyle:{
        flexDirection:'row',
        alignItems:'center',
        marginLeft:8
    },
    leftTitleStyle:{
        fontSize:15,
    },
    rightViewStyle:{
        marginRight:8,
    },
    rightTitleStyle:{
        fontSize:15,
    }
})
