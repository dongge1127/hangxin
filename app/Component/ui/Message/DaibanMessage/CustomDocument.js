/**
 * Created by John on 2017-7-4.
 */
'use strict'
import React, {Component} from 'react';
import {
    Text,
    View,
    ListView,
    Platform,
    ScrollView,
    Image,
    TextInput,
    BackAndroid,
    Dimensions,
    AsyncStorage,
    StyleSheet,
    TouchableOpacity,
    Linking,
    TouchableWithoutFeedback,
    Keyboard,
    WebView,
    TouchableHighlight,
} from 'react-native';
import {
    Cells,
    CellsTitle,
    Cell,
    CellBody,
    TextArea,
    RadioCells,
    CheckboxCells,
    Dialog,
    } from 'rn-weui/src';
import Toast from 'react-native-root-toast';
import Modal from 'react-native-root-modal';
import Spinner from "react-native-loading-spinner-overlay";

import TimerMixin from "react-timer-mixin";
import {observer} from 'mobx-react/native';
import {observable} from "mobx";
import ActionButton from 'react-native-action-button';

import Service from '../../service';
import CommonStyles from '../../../../style/CommonStyle';
import FlowJournal from './FlowJournal';
import HttpUtil from '../../common/HttpUtil';
import EmojiUtil from "../../common/EmojiUtil";
import TopBar from '../../APPComponent/TopBar';
import CommonModal from "../../APPComponent/CommonModal";
import ViewUtil from '../../common/ViewUtil';

//定义一些变量
let key='';         //存放preAssigned的值，判断是否有指派方式
let Name='';        //存放用户选取的流程走向，以便请求处理人
let noEdit='';      //存放isContersign的值，判断弹出层是否可以编辑
let noDealBody='';  //判断流程审批处理人是否为空

@observer
export default class CustomDocument extends Component {
    @observable
    canGoBack=false;
    constructor(props) {
        super(props);
        this.state = {
            URL:'',      //服务器配置地址
            //公用
            list: this.props.passProps.list,
            fileData:null,
            //工作流审批
            textarea: '',
            isContersign:false,
            flowDialogVisible: false,
                //存放请求的流程走向数据
                radioData0:[],
                //存放请求的处理人数据
                CheckboxOption:[{
                        label: ' ',
                        value: ' '
                    }],
                //存放用户选择的流程走向
                radio0:'',
                //存放用户选择的指派方式
                radio1:'',
                //存放用户选择的单选处理人
                radio2:'',
                //存放用户选择的处理人数据
                checkbox: [],
            //判断工作流审批需不需要验证
            flowTest:false,
            //公共的弹出层窗口
            commonAlert:false,
            commonAlert1:false,
            commonAlertMsg:'',
            show:false,
            showFlow:false,
            //审核成功显示与隐藏
            rightWidth:0,
            rightHeight:0,
            //加载中
            visible:false,
            //下载权限
            noRight:false,
            keyboardHeight:0,
            //判断自定义表单是不是支持在手机上查看
            isfileExit:false,
        };
       
        //工作流审批
        this.hideFlowDialog = this.hideFlowDialog.bind(this);
        this.handleRadioChange0 = this.handleRadioChange0.bind(this);
        this.handleRadioChange1 = this.handleRadioChange1.bind(this);
        this.handleRadioChange2 = this.handleRadioChange2.bind(this);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.handleTextareaChange = this.handleTextareaChange.bind(this);
    };
    onPressBack = () => {
        this.props.callBackFun();
        this.props.navigator.pop();
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
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        this.timer && TimerMixin.clearTimeout(this.timer);
        this.timer_two && clearTimeout(this.timer_two);
    };
    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
        let url=Service.host+'&cguid='+this.state.list.hidden_cguid;
        AsyncStorage.getItem('ServiceUrl', (error, result) => {
            this.setState({
                URL:result+'/oa/html/'+this.state.list.hidden_cguid+'.htm',
            });
            /*console.log('----------------------------');
            console.log(this.state.URL)*/
        });
    }
    _keyboardDidShow(e){
        if(Platform.OS == 'ios'){
            this.setState({
                keyboardHeight:e.startCoordinates.ViewUtil.screenH
            });
            
        }else{
            this.setState({
                keyboardHeight:270,
            }); 
        }
    }
    _keyboardDidHide(e){
        this.setState({
            keyboardHeight:0
        });
    }
    //公共的弹出层窗口跳转页面
    hideAlertDialog() {
        this.setState({
            commonAlert: false,
        });
        this.props.callBackFun();
        this.props.navigator.pop();
    };
    //公共的弹出层窗口不跳转
    hideAlertDialog1() {
        if(this.state.show==true){
            this.setState({
                commonAlert1: false,
                notFlowDialogVisible2:true,
            });
        }else if(this.state.showFlow==true){
            this.setState({
                commonAlert1: false,
                flowDialogVisible:true,
            });
        }else{
            this.setState({
                commonAlert1: false,
            });
        }    
    };
    //工作流审批
    handleTextareaChange(textarea) {
        textarea = EmojiUtil.FilterEmoji(textarea);
        this.setState({ textarea })
    };
    hideFlowDialog() {
        this.setState({
            flowDialogVisible: false,
        })
    };
    
    handleCheckboxChange(checkbox) {
        if(noEdit!=true){
            this.setState({ checkbox });
        }
        //console.log(this.state.checkbox);
    };
    
    fetchData() {
        var url=Service.host+Service.dbDetail
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&cguid='+this.state.list.hidden_cguid
            +'&cCheckWay='+this.state.list.hidden_ccheckway;
        HttpUtil.get(url,this)
                .then((responseData) => {
                    console.log(responseData);
                    this.setState({visible:false});
                    
                    if(responseData.errmsg){
                        this.state.commonAlertMsg=responseData.errmsg;
                        this.setState({
                            commonAlert: true,
                        });
                    }
                    if(responseData.file){
                        if(responseData.hasfiledown){
                            this.setState({
                                noRight:true,
                            });
                        }
                        this.setState({
                            fileData:responseData.file,
                        });
                    }
                    
                })
                .catch((error) => {
                    console.log(error);
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
  
    loadError=()=>{
        console.log('~~~~~~~~~~~~~~~~~~~~~');
    }
    render() {
        return (
            <View style={CommonStyles.CommonWrapContainer}>
                <TopBar onPress={this.onPressBack} title={this.state.list.bt}/>
                <View style={{height:ViewUtil.screenH-40-55,}}>
                        <WebView
                           
                            source={{uri: this.state.URL,method: 'GET'}}
                            
                            javaScriptEnabled={true}  
                            domStorageEnabled={true}  
                            scalesPageToFit={false}
                        />
                        <CommonModal
                            visible={this.state.commonAlert}
                            message={this.state.commonAlertMsg}
                            sureTitle='确定'
                            sureAction={this.hideAlertDialog.bind(this)}
                            />
                        <CommonModal
                            visible={this.state.commonAlert1}
                            message={this.state.commonAlertMsg}
                            sureTitle='确定'
                            sureAction={this.hideAlertDialog1.bind(this)}
                            />
                        {/*工作流审批*/}
                        <Dialog
                            visible={this.state.flowDialogVisible}
                            onClose={()=>{this.setState({flowDialogVisible:false})}}
                            buttons={[
                                {
                                    type: 'default',
                                    label: '取消',
                                    onPress: this.hideFlowDialog,
                                }, {
                                    type: 'primary',
                                    label: '确定',
                                    onPress: this.onFlowDialogSureBtn,
                                },
                            ]}>
                            <View style={{height:300}}>
                                <ScrollView>
                                    <CellsTitle style={{fontSize:16}}>流程走向</CellsTitle>
                                        <RadioCells
                                            options={this.state.radioData0}
                                            onChange={this.handleRadioChange0}
                                            value={this.state.radio0}
                                        />
                                        <View>{this.isHiddenBox1()}</View>
                                </ScrollView>
                            </View>
                        </Dialog>
                        
                        <View style={{height:162}}>
                        <ScrollView>
                            <View>{this.fileData()}</View>
                            <View style={{marginBottom:10}}>
                                <View style={styles.TitleStyle}>
                                    <CellsTitle style={{paddingLeft:8}}>审批意见</CellsTitle>
                                </View>
                                <Cells>
                                    <Cell>
                                        <CellBody style={{marginTop:-10,}}>
                                            <TextArea
                                            style={{fontSize:13,}}
                                                placeholder="请输入审批意见"
                                                placeholderTextColor="#aaaaaa"
                                                value={this.state.textarea}
                                                onChange={this.handleTextareaChange}
                                                editable={true}
                                                underlineColorAndroid="transparent"
                                                maxLength={500}
                                            />
                                        </CellBody>
                                    </Cell>
                                </Cells>
                            </View>
                        </ScrollView>
                        </View>
                        <View style={{height:this.state.keyboardHeight,width:ViewUtil.screenW,}}></View>
                    
                    <View style={{position:'absolute',left:(ViewUtil.screenW-100)/2,top:(ViewUtil.screenH-320)/2}}>
                        <Image source={require('../../../../../img/success.png')} 
                               style={{width:this.state.rightWidth,height:this.state.rightHeight}}/>
                    </View>
                    <Spinner visible={this.state.visible} overlayColor={'rgba(0, 0, 0, 0.2)'}
                         textContent={this.state.tip} textStyle={{color: 'white'}}/>
                </View>                     
                <ActionButton 
                          buttonText={'审批'} 
                          buttonColor="#50B1F8"
                          hideShadow={true}
                          position='left'
                          offsetX={0}
                          offsetY={0}
                          spacing={0}
                          buttonTextStyle={{fontSize: 16}}
                          degrees={0}
                          size={ViewUtil.screenW/2}
                          activeOpacity={0.85}
                          useNativeFeedback={false}>
                        >
                    <ActionButton.Item buttonColor='#fff' 
                            style={styles.ActionButtonItemStyle} 
                            onPress={this.onPressAgree.bind(this)}>
                        <View style={styles.ViewStyle}>
                            <Text style={styles.textStyle}>同意</Text>
                        </View>
                    </ActionButton.Item>
                    <ActionButton.Item buttonColor='#fff' 
                            style={styles.ActionButtonItemStyle} 
                            onPress={this.onPressBackStep.bind(this)}>
                        <View style={styles.ViewStyle}>
                            <Text style={styles.textStyle}>返回上一步</Text>
                        </View>
                    </ActionButton.Item>
                    <ActionButton.Item buttonColor='#fff' 
                            style={styles.ActionButtonItemStyle} 
                            onPress={this.onPressBackPerson.bind(this)}>
                        <View style={styles.ViewStyle}>
                            <Text style={styles.textStyle}>返回发起人</Text>
                        </View>
                    </ActionButton.Item>
                    <ActionButton.Item buttonColor='#fff' 
                        style={styles.ActionButtonItemStyle} 
                        onPress={this.onPressEnd.bind(this)}>
                        <View style={styles.ViewStyle}>
                            <Text style={styles.textStyle}>终止</Text>
                        </View>
                    </ActionButton.Item>
                </ActionButton>
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
        if(this.state.noRight==true){
            return(
                <View key={i} style={{flexDirection: 'row',height:80,backgroundColor:'#fff',alignItems: 'center',}}>
                    <Image source={require('../../../../../img/filelogo.png')} style={{height:60,width:64,marginLeft:10,}} />
                    <View>
                        <Text style={{paddingLeft:10,}}>{file.cfilerealname}</Text>
                        <TouchableOpacity  onPress={(e) => this.onNoRightFile()} style={styles.fileBtn}>
                            <Text numberOfLines={1} style={{color:'#fff'}}>下载</Text>
                        </TouchableOpacity>
                    </View> 
                </View> 
            );
        }else{
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
        }   
    };
    onNoRightFile(){
        this.state.commonAlertMsg='抱歉，您没有该单据附件的下载权限';
        this.setState({
            commonAlert1: true,
        });
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
    //判断工作流审批弹出层是否有指派方式
    isHiddenBox1(){
        if(noDealBody==true){
            return null;
        }
        if(key==false){
            return (
                <View>
                    <CellsTitle style={{fontSize:16}}>处理人</CellsTitle>
                    <RadioCells
                        options={this.state.CheckboxOption}
                        onChange={this.handleRadioChange2}
                        value={this.state.radio2}
                    />
                </View>   
            )
        }else{
            return (
                <View>
                    <CellsTitle style={{fontSize:16,borderWidth:0}}>指派方式</CellsTitle>
                        <RadioCells
                            options={[
                                {
                                    label: '办理人全部提交，审批才通过',
                                    value: 'consign'
                                }, {
                                    label: '以第一个办理人的处理结论为准',
                                    value: 'compete'
                                }
                            ]}
                            onChange={this.handleRadioChange1}
                            value={this.state.radio1}
                        />
                    <CellsTitle style={{fontSize:16}}>处理人</CellsTitle>
                        <CheckboxCells
                            options={this.state.CheckboxOption}
                            onChange={this.handleCheckboxChange}
                            value={this.state.checkbox}
                        />
                </View>
            )
        }  
    }
    /*工作流审批*/
    onPressAgree = () => {
        this.setState({visible:true,tip:'审批中...'});
        var url=Service.host
            +'mobile_daiban_submit&action=agree&cguid='+this.state.list.hidden_cguid
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&idea='+encodeURIComponent(this.state.textarea);
        HttpUtil.get(url,this)
            .then((responseData) => {
                this.setState({visible:false,});
                console.log(responseData);
                var msg;
                if(responseData==='chooseUsers'){
                    this.onGetUserList();
                }else if(responseData=='checkSuccess'){
                    //审批成功
                    this.showAlert();
                }else if(responseData.errmsg){
                    this.state.commonAlertMsg=responseData.errmsg;
                    this.setState({
                        commonAlert: true,
                    });
                }else{
                    msg=eval('(' + responseData + ')');
                    console.log(msg);
                    if(msg.errmsg){
                        this.state.commonAlertMsg=msg.errmsg;
                        this.setState({
                            commonAlert: true,
                        });
                    }else if(msg.confirm){
                        this.setState({
                            flowTest:true,
                        });
                        this.state.confirmMsg=msg.msg;
                        this.setState({
                            notFlowDialogVisible0: true,
                        });
                    }else if(msg.passWordConfirm===true){
                        this.setState({
                            flowTest:true,
                        });
                        this.state.confirmMsg=msg.msg;
                        this.setState({
                            notFlowDialogVisible2: true,
                        });
                    }else{
                        this.state.commonAlertMsg='审核异常，请重新获取打开单据审核';
                        this.setState({
                            commonAlert: true,
                        });
                    }
                }
            })
            .catch((error) => {});
    };
    onGetUserList(){
        this.setState({visible:true,tip:'获取审批数据...'});
        var url=Service.host
                +'mobile_daiban_choose&cguid='+this.state.list.hidden_cguid
                +'&getType=getOptions';
        console.log(url);
        HttpUtil.get(url,this)
            .then((responseData) => {
                this.setState({visible:false});
                //1.获取流程走向数据
                console.log('获取流程走向数据');
                console.log(responseData);
                this.setState({
                    radioData0:[],
                    CheckboxOption:[{
                            label: ' ',
                            value: ' '
                        }],
                    radio2:'',
                    checkbox: [],
                });
                this.state.CheckboxOption.pop();
                for(var i = 0; i < responseData.length; i++){
                    this.state.radioData0.push({
                        label:responseData[i]['name'],
                        value:responseData[i]['code'],
                        key:responseData[i]['preAssigned'],
                    });
                }
                for (var i = 0; i < responseData.length; i++) {
                    if(responseData[i]['isContersign']==true && responseData[i]['preAssigned']!=true){
                        //不可编辑，且没有指派方式
                        this.setState({ 
                            radio0:responseData[i]['code'],
                            isContersign:true,
                        });
                        noEdit=true;
                        this.getuser(responseData[i]['name']);
                    }
                    if(responseData[i]['isContersign']==true && responseData[i]['preAssigned']==true){
                        //不可编辑，有指派方式
                        this.setState({ 
                            radio0:responseData[i]['code'],
                            isContersign:true,
                        });
                        key=true;
                        noEdit=true;
                        this.getuser(responseData[i]['name']);
                    }
                    if(responseData[0]['preAssigned']==true && responseData[i]['isContersign']!=true){
                        //有指派方式，可以编辑
                        this.setState({ 
                            radio0:responseData[0]['code'],
                        });
                        key=true;
                        this.setState({ 
                            radio1:'consign',
                        });
                        this.getuser(responseData[0]['name']);
                        return false;
                    }if(responseData[0]['preAssigned']!=true && responseData[i]['isContersign']!=true){
                        //没有指派方式，可以编辑
                        console.log('没有指派方式，可以编辑');
                        this.setState({ 
                            radio0:responseData[0]['code'],
                        });
                        this.getuser(responseData[0]['name']);
                        return false;
                    } 
                }    
            })
            .catch((error) => {});
    };

    handleRadioChange0(value) {
        //3.改变流程走向单选按钮
        this.setState({ 
            radio:'',
            radio2:'',
            checkbox:[],
            CheckboxOption:[{
                label: ' ',
                value: ' '
            }],
        });
        if(noEdit!=true){
            this.setState({ 
                radio0:value
            });
        }
        //改变流程走向改变key的值，确认该流程走向有没有指派方式
        for(var i=0;i<this.state.radioData0.length;i++){
            if(value==this.state.radioData0[i].value){
                key=this.state.radioData0[i].key;
            }
        }
        //取得name的值
        for(var i=0;i<this.state.radioData0.length;i++){
            if(value==this.state.radioData0[i].value){
                Name=this.state.radioData0[i].label;
                this.getuser(Name);
            }  
        } 
    };
    getuser(Name){
        var url=Service.host
                +'mobile_daiban_choose&cguid='+this.state.list.hidden_cguid
                +'&selectedActName='+Name
                +'&isContersign='+this.state.isContersign;
        //console.log(url);
        HttpUtil.get(url,this)
            .then((responseData) => {
                this.setState({
                    radioData2:[],
                });
                //4.获取处理人数据
                //console.log(responseData);
                this.state.CheckboxOption.pop();
                if(responseData.assignDealWay != null){
                    this.setState({ 
                        radio1:responseData.assignDealWay
                    });
                }
                for (var i = 0; i < responseData.users.length; i++) {
                    this.state.CheckboxOption.push({
                        label:responseData.users[i]['name'],
                        value:responseData.users[i]['code'],
                    });
                    //console.log(responseData.users[i]['code']);
                    if(noEdit==true){
                        if(key==false){
                            this.setState({
                                radio2:responseData.users[0]['code']
                            });
                        }else{
                            this.state.checkbox.push(
                                responseData.users[i]['code'],
                            );
                        }   
                    } 
                };
                if(responseData.users.length==0){
                    noDealBody=true;
                }else{
                    noDealBody=false;
                }
                this.setState({
                    flowDialogVisible: true,
                });
            })
            .catch((error) => {});
    }
    handleRadioChange1(value) {
        if(noEdit!=true){
            this.setState({ 
                radio1:value
            });
        }
        //console.log(this.state.radio1);
    };
    handleRadioChange2(value) {
        if(noEdit!=true){
            this.setState({ 
                radio2:value
            });
        }
    };
    onFlowDialogSureBtn=()=>{
        this.setState({
            flowDialogVisible: false,
        });
        if(key==false){
            //console.log('没有指派方式');
            var url=Service.host+Service.dbSubmit
            +'&action=commit'
            +'&cguid='+this.state.list.hidden_cguid
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&selected='+this.state.radio0
            +'&preAssigWay=consign'
            +'&preAssigned='+this.state.radio2
            +'&idea='+encodeURIComponent(this.state.textarea);
            console.log(url);
            HttpUtil.get(url,this)
            .then((responseData) => {
                console.log(responseData);
                if(responseData==='checkSuccess'){
                    //审批成功;
                    this.showAlert();
                }else if(responseData.errmsg){
                    this.state.commonAlertMsg=responseData.errmsg;
                    this.setState({
                        commonAlert1: true,
                        showFlow:true,
                    });
                }
                else{
                    this.state.commonAlertMsg='审核异常，请重新获取打开单据审核';
                    this.setState({
                        commonAlert: true,
                    });
                }  
                
            })
            .catch((error) => {});
        }else{
            //console.log('有指派方式');
            var url=Service.host+Service.dbSubmit
            +'&action=commit'
            +'&cguid='+this.state.list.hidden_cguid
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&selected='+this.state.radio0
            +'&preAssigWay='+this.state.radio1
            +'&preAssigned='+this.state.checkbox
            +'&idea='+encodeURIComponent(this.state.textarea);
            console.log(url);
            HttpUtil.get(url,this)
            .then((responseData) => {
                console.log(responseData);
                if(responseData==='checkSuccess'){
                    //审批成功;
                    this.showAlert();
                }else if(responseData.errmsg){
                    this.state.commonAlertMsg=responseData.errmsg;
                    this.setState({
                        commonAlert1: true,
                        showFlow:true,
                    });
                }
                else{
                    this.state.commonAlertMsg='审核异常，请重新获取打开单据审核';
                    this.setState({
                        commonAlert: true,
                    });
                }   
            })
            .catch((error) => {});
        }
    };
    onPressBackStep = () => {
        this.setState({visible:true,tip:'返回上一步中...'});
        var url=Service.host+Service.dbSubmit
            +'&action=backprev'
            +'&cguid='+this.state.list.hidden_cguid
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&idea='+encodeURIComponent(this.state.textarea);
        //console.log(url);
        HttpUtil.get(url,this)
            .then((responseData) => {
                //console.log(responseData);
                this.setState({visible:false});
                var msg;
                if(responseData==='backprevSuccess'){
                    this.state.commonAlertMsg='返回上一步成功';
                    this.setState({
                        commonAlert: true,
                    });
                    this.props.callBackFun();
                    this.props.navigator.pop();
                }else if(responseData.errmsg){
                    this.state.commonAlertMsg=responseData.errmsg;
                    this.setState({
                        commonAlert: true,
                    });
                }else{
                    this.state.commonAlertMsg='审核异常，请重新获取打开单据审核';
                    this.setState({
                        commonAlert: true,
                    });
                }
            })
            .catch((error) => {});
    };
    onPressBackPerson = () => {
        this.setState({visible:true,tip:'返回发起人中...'});
        var url=Service.host+Service.dbSubmit
            +'&action=backorigin'
            +'&cguid='+this.state.list.hidden_cguid
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&idea='+encodeURIComponent(this.state.textarea);
        //console.log(url);
        HttpUtil.get(url,this)
            .then((responseData) => {
                //console.log(responseData);
                this.setState({visible:false});
                var msg;
                if(responseData==='backoriginSuccess'){
                    this.state.commonAlertMsg='返回发起人成功';
                    this.setState({
                        commonAlert: true,
                    });
                    this.props.callBackFun();
                    this.props.navigator.pop();
                }else if(responseData.errmsg){
                    this.state.commonAlertMsg=responseData.errmsg;
                    this.setState({
                        commonAlert: true,
                    });
                }else{
                    this.state.commonAlertMsg='审核异常，请重新获取打开单据审核';
                    this.setState({
                        commonAlert: true,
                    });
                }
            })
            .catch((error) => {});
    };

    onPressEnd = () => {
        this.setState({visible:true,tip:'终止中...'});
        var url=Service.host+Service.dbSubmit
            +'&action=terminate'
            +'&cguid='+this.state.list.hidden_cguid
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&idea='+encodeURIComponent(this.state.textarea);
        //console.log(url);
        HttpUtil.get(url,this)
            .then((responseData) => {
                //console.log(responseData);
                this.setState({visible:false});
                var msg;
                if(responseData==='terminateSuccess'){
                    this.state.commonAlertMsg='审批已终止';
                    this.setState({
                        commonAlert: true,
                    });
                    this.props.callBackFun();
                    this.props.navigator.pop();
                }else if(responseData.errmsg){
                    this.state.commonAlertMsg=responseData.errmsg;
                    this.setState({
                        commonAlert: true,
                    });
                }else{
                    this.state.commonAlertMsg='审核异常，请重新获取打开单据审核';
                    this.setState({
                        commonAlert: true,
                    });
                }
            })
            .catch((error) => {});
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
            this.props.callBackFun();
            this.props.navigator.pop();
        }.bind(this),1000);
    };

}
const styles = StyleSheet.create({
    //标题
    TitleStyle:{
        justifyContent:'center',
        height:40,
    },
    //单据附件
    Title:{
        marginLeft:8,
        fontSize:13,
    },
    //流程日志按钮样式
    footBarStyle:{
        backgroundColor:'#50B1F8',
        width:ViewUtil.screenW/2,
        height:40,
        position:'absolute',
        bottom:0,
        right:0,
        justifyContent:'center',
        alignItems:'center',
        borderRightWidth:0.5,
        borderLeftColor:'#fff',
        borderLeftWidth:1,
        paddingTop:5,
        paddingBottom:5,
    },
    footBarTextStyle:{
        color:'#fff',
        fontSize:16,
    },
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
    //审批box
    ActionButtonItemStyle:{
        borderWidth:1,
        borderColor:'#50B1F8',
        borderBottomWidth:0,
        marginLeft:20,
    },
    ViewStyle: {
       
    },
    textStyle:{
        color: '#50B1F8',
    },
})
