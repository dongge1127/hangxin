/**
 * Created by John on 2016-11-24.
     <View style={styles.leftViewStyle}>
        <Text style={styles.leftTitleStyle}>清空缓存</Text>
            <Image source={require('../../../../img/rarrow.png')} style={{width:8, height:13, marginRight:8, marginLeft:5}} />
    </View>
 */
import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Platform,
    Image,
    TouchableOpacity,
    TextInput,
    AsyncStorage,
    ScrollView,
    Switch,
    } from 'react-native';
import {
    RadioCells,Dialog,
} from 'rn-weui/src';
import Login from  '../Login';
import Home from  '../Home';
import WebService from  './WebService';
import Service from '../service';
import CommonStyles from '../../../style/CommonStyle';
import HttpUtil from "../common/HttpUtil";
import NavigationBar from "../APPComponent/NavigationBar";
import CommonModal from "../APPComponent/CommonModal";
var Dimensions = require('Dimensions');
var screenW = Dimensions.get('window').width;
var screenH = Dimensions.get('window').height;
export default class Setting extends Component {
    constructor(props) {
        super(props);
         this.state = {
            setWebInput: null,
            urlService:null,
            url:'',
            radio: '',
            userName:'',
            passWord:'',
            showImgSwitch:true,
            oneAlertFlag:false,
            alertMsg:'-',
        }
    };
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    };
    onPressWebService = () => {
        this.props.navigator.push({
            name : 'WebService',
            component : WebService,
            params: {callBack:()=>this.callBackfn()}
        });
    };
    callBackfn() {
        this.setService();
        this.getNamePwd();
    };
    componentDidMount(){
       this.setService();
       this.getNamePwd();
       if(Service.showImgSwitch=='false') this.setState({showImgSwitch:false,})
        else  this.setState({showImgSwitch:true,})
    };
    getNamePwd(){
        AsyncStorage.getItem('userName',(error,result)=>{
            this.setState({
                userName:result,
            });
        });
        AsyncStorage.getItem('passWord',(error,result)=>{
            this.setState({
                passWord:result,
            });
        });
    };
    setService(){
        if(Service.demoAcc==true){
            this.setState({url:Service.demoUrl,});
        }else{
            AsyncStorage.getItem("ServiceUrl",(error,text)=>{  
                this.setState({url:text,});
            });
        }
        AsyncStorage.getItem('accountId',(error,result)=>{
            this.setState({ radio:result,});
        });
    };
    
    showImgSwitch(){//wifi图片显示
        var flag = this.state.showImgSwitch;
        if(flag){
            this.setState({showImgSwitch:false,});
            AsyncStorage.setItem('showImgSwitch','false',()=>{});
            Service.showImgSwitch = 'false';
        }else{
            this.setState({showImgSwitch:true,});
            AsyncStorage.setItem('showImgSwitch','true',()=>{});
            Service.showImgSwitch = 'true';
        }
        
    }
    hideDialog(){
        this.setState({oneAlertFlag:false});
    }
    render() {
        return (
            <View style={{flex: Platform.OS == 'ios' ? 0 : 1,backgroundColor: '#F5F5F5'}}>
                <NavigationBar
                    leftAction={this.onPressBack}
                    leftImage={require('../../../../img/back.png')}
                    title={'系统设置'}/>
                <View style={styles.CellStyle}>
                    <Text style={styles.LeftTextStyle}>系统设置</Text>
                </View>
                <View style={styles.leftViewStyle}>
                    <Text style={styles.leftTitleStyle}>仅在wifi下加载物品图片</Text>
                    <Switch
                        onChange={this.showImgSwitch.bind(this)}
                        value={this.state.showImgSwitch}
                        onTintColor='#97CBFF'
                        thumbTintColor ='#50B1F8'
                    />
                </View>
                <View style={styles.CellStyle}>
                    <Text style={styles.LeftTextStyle}>服务器配置</Text>
                </View>
                    <TouchableOpacity onPress={this.onPressWebService.bind(this)}>
                         <View style={styles.leftViewStyle}>
                            <Text style={styles.LeftTextStyle}>{this.state.url}</Text>
                            <Image source={require('../../../../img/rarrow.png')} style={{width:8, height:13, marginRight:8, marginLeft:5}} />
                        </View>
                    </TouchableOpacity>
                <View style={{height:screenH,backgroundColor:'#efefef'}}></View>
                <CommonModal
                    visible={this.state.oneAlertFlag}
                    message={this.state.alertMsg}
                    sureTitle='确定'
                    sureAction={this.hideDialog.bind(this)}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    CellStyle:{
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor:'#efefef',
        alignItems:'center',
        height:Platform.OS == 'ios' ? 45 : 50,
        borderBottomColor:'#e8e8e8',
        borderBottomWidth:0.5,
    },
    LeftTextStyle:{
        marginLeft:8,
        fontSize:14,
    },
    leftViewStyle:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        marginLeft:8,
        height:50,
        borderBottomWidth:1,
        borderBottomColor:'#efefef'
    },
    text_input:{
        fontSize: 15,
        flex:1,
        textAlign: 'left',
        textAlignVertical:'bottom',
        marginLeft:5,
        borderBottomWidth:1,
        borderBottomColor:'#efefef'
    },
    input_item:{
        backgroundColor:'white',
        height:48,
        flexDirection:'row',
        alignItems:'center',
        margin:5,
    },
    btn:{
        width:80,
        height:48,
        backgroundColor:'#50B1F8',
        alignItems:'center',
        justifyContent:'center',
        marginLeft:5,
        marginRight:2,
        borderRadius:6,
        marginTop:10,
    },
});

