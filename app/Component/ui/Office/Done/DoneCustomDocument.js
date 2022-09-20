/**
 * Created by John on 2017-7-10.
 */
'use strict'
import React, {Component} from 'react';
import {
	Text,
    View,
    Image,
    BackAndroid,
    AsyncStorage,
    StyleSheet,
    TouchableOpacity,
    Linking,
    TouchableWithoutFeedback,
    ScrollView,
    WebView,
    TouchableHighlight,
} from 'react-native';
import {
    Dialog,
    } from 'rn-weui/src';
import Toast from 'react-native-root-toast';
import Modal from 'react-native-root-modal';
import Spinner from "react-native-loading-spinner-overlay";
import TimerMixin from "react-timer-mixin";
import {observer} from 'mobx-react/native';
import {observable} from "mobx";

import Service from '../../service';
import CommonStyles from '../../../../style/CommonStyle';
import FlowJournal from './FlowJournal';
import HttpUtil from '../../common/HttpUtil';
import TopBar from '../../APPComponent/TopBar';
import CommonModal from "../../APPComponent/CommonModal";
import ViewUtil from '../../common/ViewUtil';

@observer
export default class DoneCustomDocument extends Component {
    @observable
    canGoBack=false;
    constructor(props) {
        super(props);
        this.state = {
        	URL:'',      //服务器配置地址
        	//公用
            list: this.props.passProps.list,
            fileData:null,
            //公共的弹出层窗口
            commonAlert1:false,
            commonAlertMsg:'',
            //加载中
            visible:false,
            //附件容器高度
            fileBoxHeight:0,
        };
        //公共的弹出层窗口
        this.hideAlertDialog1 = this.hideAlertDialog1.bind(this);
    };
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            this.props.callBackFun();
            navigator.pop();
        }
    };
    onBackAndroid=()=>{
    	if (this.props.navigator) {
            this.props.callBackFun();
            this.props.navigator.pop();
            return true;
        }
    };
    componentDidMount(){
        BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid);
        this.timer = TimerMixin.setTimeout(() => {
            this.fetchData();
        }, 1000);
        this.setState({visible:true,tip:'数据加载中...'});
    };
    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
        this.timer && TimerMixin.clearTimeout(this.timer);
    };
    componentWillMount() {
    	AsyncStorage.getItem('ServiceUrl', (error, result) => {
            this.setState({
            	URL:result+'/oa/html/'+this.state.list.hidden_cguid+'.htm',
            });
            /*console.log('----------------------------');
        	console.log(this.state.URL)*/
        });
    }

    //公共的弹出层窗口不跳转
    hideAlertDialog1() {
       this.setState({
            commonAlert1: false,
        });
    };
    fetchData() {
        var url=Service.host+Service.ybDetail
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&cguid='+this.state.list.hidden_cguid;
        HttpUtil.get(url,this)
                .then((responseData) => {
                    this.setState({visible:false});
                    if(responseData.file!=null){
                        this.setState({
                            fileData:responseData.file,
                            fileBoxHeight:162,
                        });
                    }else{
                        this.setState({
                            fileBoxHeight:0,
                        });
                    }
                })
                .catch((error) => {
                    this.setState({visible:false});
                    Toast.show('网络原因数据加载失败', {
                        duration: Toast.durations.SHORT,
                        position: ViewUtil.screenH-130,
                        shadow: true,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        animation: true,
                        hideOnPress: true,
                        delay: 0,
                    });
                });
    };
    back=()=>{
        if(this.canGoBack){
            this.webView.goBack();
        }
    };
    onNavigationStateChange(event){
        let canGoBack = this.canGoBack;
        if(canGoBack!=event.canGoBack){
            this.canGoBack=event.canGoBack;
        }
    }
    orError(){

    }
    render() {
        return (
            <View style={CommonStyles.CommonWrapContainer}>
        		<TopBar onPress={this.onPressBack} title={this.state.list.bt}/>
        		<View style={{height:ViewUtil.screenH-40-55,}}>
		                <WebView
		                    ref={webView=>this.webView=webView}
		                    source={{uri: this.state.URL}}
		                    onNavigationStateChange={(e)=>this.onNavigationStateChange(e)}
		                    onError={this.orError()}
		                    javaScriptEnabled={true}
		      				domStorageEnabled={true}
		      				scalesPageToFit={true}
		                />
                        <CommonModal
                            visible={this.state.commonAlert1}
                            message={this.state.commonAlertMsg}
                            sureTitle='确定'
                            sureAction={this.hideAlertDialog1.bind(this)}
                            />
                        <View style={{height:this.state.fileBoxHeight}}>
                            <ScrollView>
                                {this.fileData()}
                            </ScrollView>
                        </View>
                    	<Spinner visible={this.state.visible} overlayColor={'rgba(0, 0, 0, 0.2)'}
                         	textContent={this.state.tip} textStyle={{color: 'white'}}/>
                	</View>
        		<TouchableWithoutFeedback  onPress={this.showFlowJournal.bind(this)}>
                    <View style={styles.footBarStyle}>
                   		<Text style={styles.footBarTextStyle}>流程日志</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }
    //判断单据是否存在附件
    fileData(){
        if(this.state.fileData==null){
            return null;
        }else{
            //console.log(this.state.fileData);
            return (
                <View>
                    <View style={styles.TitleStyle}>
                         <Text style={styles.Title}>单据附件</Text>
                    </View>
                    <View>{this.state.fileData.map((file,i)=>this.fileDataProcess(file,i))}</View>
                </View>
            )
        }
    };
    fileDataProcess(file,i){
        return(
            <View key={i} style={{flexDirection: 'row',height:80,backgroundColor:'#fff',alignItems: 'center',}}>
                <Image source={require('../../../../../img/filelogo.png')} style={{height:60,width:64,marginLeft:10,}} />
                <View>
                    <Text style={{paddingLeft:10,}}>{file.cfilerealname}</Text>
                    <TouchableOpacity  onPress={(e) => this.onPressFile(e,file)} style={styles.fileBtn}>
                        <Text numberOfLines={1} style={{color:'#fff'}}>下载</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };
    onPressFile(e,f){
        //先下载文件,保存到app本地, 再展示
        //formid=mobile_common_funcbtn&action=appendix&cFileUrl=upload&cFileName=622239074677135190_adress.txt
        let result = Service.host.split("/pt")[0];
        var fullUrl = result+"/download.do?cFileUrl="+f.cfileurl+'&cFileName='+f.cfilename;
        console.log(fullUrl);
        Linking.openURL(encodeURI(fullUrl))
            .catch((err)=>{
                console.log('An error occurred', err);
            });
    };


    showFlowJournal(){
        this.props.navigator.push({
            name : 'FlowJournal',
            component : FlowJournal,
            params:{
                list:this.state.list,
            }
        });
    };
    showAlert(){
        this.setState({
            rightWidth:100,
            rightHeight:90,
        });
        setTimeout(function(){
            const { navigator } = this.props;
            if (navigator) {
                this.props.refreshDoneList();
                navigator.pop();
            }
        }.bind(this),1000);
    };

}
const styles = StyleSheet.create({
    //附件下载按钮
    fileBtn:{
        width:60,
        height:26,
        backgroundColor:'#50B1F8',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:3,
        marginTop:10,
        marginLeft:10,
    },
    //标题
    TitleStyle:{
        justifyContent:'center',
        height:40,
    },
    //流程日志按钮样式
    footBarStyle:{
    	backgroundColor:'#50B1F8',
        width:ViewUtil.screenW,
        height:40,
        position:'absolute',
        bottom:0,
        right:0,
        justifyContent:'center',
        alignItems:'center',
        paddingTop:5,
        paddingBottom:5,
    },
    footBarTextStyle:{
        color:'#fff',
        fontSize:16,
    },
})
