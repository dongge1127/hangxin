import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ListView,
    Platform,
    ScrollView,
    Image,
    TextInput,
    Linking,
    TouchableWithoutFeedback,
    Keyboard,
    BackAndroid,
    TouchableHighlight,
    } from 'react-native';
import Service from '../../service';
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
import Modal from 'react-native-root-modal';
import Spinner from "react-native-loading-spinner-overlay";
import TimerMixin from "react-timer-mixin";
import ActionButton from 'react-native-action-button';
import ToastUtil from "../../common/ToastUtil";
import FlowJournal from './FlowJournal';
import CommonStyles from '../../../../style/CommonStyle';
import HttpUtil from '../../common/HttpUtil';
import EmojiUtil from "../../common/EmojiUtil";
import TopBar from '../../APPComponent/TopBar';
import CommonModal from "../../APPComponent/CommonModal";
import ViewUtil from '../../common/ViewUtil';
import {Base64} from "js-base64";

/*导入json数据*/
var DetailType = require('./OrderDetailType.json');

//定义一些变量
let key='';     //存放preAssigned的值，判断是否有指派方式
let Name='';    //存放用户选取的流程走向，以便请求处理人
let noEdit='';  //存放isContersign的值，判断弹出层是否可以编辑
let noDealBody='';  //判断流程审批处理人是否为空
let nextTaskKey = '';
export default class DetailMessage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //公用
            list: this.props.passProps.list,
            dataSource1: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            dataSource2: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            dataSourceD:null,
            fileData:null,
            //工作流审批
            textarea: '',
            isContersign:false,
            flowDialogVisible: false,
                //存放请求的流程走向数据
                radioData0:[{
                            label: ' ',
                            value: ' '
                        }],
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
            //非工作流，方式0审批
            confirmMsg:'',
            goOnSubmitMsg:'',
            notFlowDialogVisible0:false,
            notFlowDialogVisible2:false,
            testPassworld:'',
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
        };
        //工作流审批
        this.hideFlowDialog = this.hideFlowDialog.bind(this);
        this.handleRadioChange0 = this.handleRadioChange0.bind(this);
        this.handleRadioChange1 = this.handleRadioChange1.bind(this);
        this.handleRadioChange2 = this.handleRadioChange2.bind(this);
        this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
        this.handleTextareaChange = this.handleTextareaChange.bind(this);
        //非工作流，方式0审批
        this.hideConfirmDialog0 = this.hideConfirmDialog0.bind(this);
        this.hidePassWordDialog = this.hidePassWordDialog.bind(this);
        this.passwordDialogSureBtn = this.passwordDialogSureBtn.bind(this);
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
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
        this.timer = TimerMixin.setTimeout(() => {
            this.fetchData();
        }, 1000);
        this.setState({visible:true,tip:'数据加载中...'});
        console.log('=================================');
       /* console.log(Service.host);
        let str1 = Service.host.split("/pt")[0];;
        let index = str1.lastIndexOf("\/");
        let str2  = str1.substring(index + 1, str1.length);
        console.log(str2);*/
    };
    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
        // this.keyboardWillShowListener.remove();
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
        this.timer && TimerMixin.clearTimeout(this.timer);
        this.timer2 && TimerMixin.clearTimeout(this.timer2);
    }

    //键盘弹出执行
    _keyboardDidShow(e){
        if(Platform.OS == 'ios'){
            this.setState({
                keyboardHeight:e.startCoordinates.height
            });
            if(this.state.list.hidden_ccheckway==2){
                this.refs.scroll.scrollTo({y: e.startCoordinates.height});
            }
        }else{
            this.setState({
                keyboardHeight:270,
            }, () => {
                setTimeout(() => {
                    this.refs.scroll.scrollToEnd({animated: false})
                }, 10)
            });
        }
    }
    //键盘退出执行
    _keyboardDidHide(e){
        this.setState({
            keyboardHeight:0
        });
        if(this.state.list.hidden_ccheckway==2){
            this.refs.scroll.scrollTo({y:260});
        }
        if(this.state.notFlowDialogVisible2==true){
            this.refs.testPassworld.blur();
        }
    }
    //公共的弹出层窗口跳转页面
    hideAlertDialog() {
        this.setState({commonAlert: false,});
        const { navigator } = this.props;
        if (navigator) {
            this.props.callBackFun();
            navigator.pop();
        }
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
    };
    //非工作流，方式0审批
    hideConfirmDialog0() {
        this.setState({
            notFlowDialogVisible0: false,
        })
    };
    hidePassWordDialog(){
         this.setState({
            notFlowDialogVisible2: false,
            testPassworld:'',
        })
    };
    hideModalgoOnSubmit(){
         this.setState({
            notFlowDialogVisible0: false,
        })
    };
    onChangeText(text){
        this.setState({testPassworld:text,})
    }
    fetchData() {
        var url=Service.host+Service.dbDetail
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&cguid='+this.state.list.hidden_cguid
            +'&tokenID='+Service.tokenID+'&cCheckWay='+this.state.list.hidden_ccheckway;
        HttpUtil.get(url,this)
                .then((responseData) => {
                    this.setState({visible:false});
                    if(responseData.errmsg){
                        this.state.commonAlertMsg=responseData.errmsg;
                        this.setState({
                            commonAlert: true,
                        });
                    }
                    if(responseData.hasfiledown){
                        this.setState({
                            noRight:true,
                        });
                    }
                    if(responseData.main==null&&responseData.detail!=null){
                        this.setState({
                            dataSourceD:'0',
                            dataSource2: this.state.dataSource2.cloneWithRows(responseData.detail),
                            fileData:responseData.file,
                        });
                    }else if(responseData.main!=null&&responseData.detail==null){
                        this.setState({
                            dataSource1: this.state.dataSource1.cloneWithRows(responseData.main),
                            fileData:responseData.file,
                        });
                    }
                    else{
                        this.setState({
                            dataSourceD:'1',
                            dataSource1: this.state.dataSource1.cloneWithRows(responseData.main),
                            dataSource2: this.state.dataSource2.cloneWithRows(responseData.detail),
                            fileData:responseData.file,
                        });
                    }
                })
                .catch((error) => {
                    this.setState({visible:false});
                    ToastUtil.show('网络原因数据加载失败');
                });
    };

    render() {
        let buttonType;
        if(this.state.list.hidden_ccheckway==2&&this.state.list.hidden_iauditstatus=='revise'){
            buttonType=
                <TouchableWithoutFeedback  onPress={this.onPressShowTip.bind(this)}>
                    <View style={styles.footBarGradStyle}>
                        <Text style={styles.footBarTextStyle}>审批</Text>
                    </View>
                </TouchableWithoutFeedback>;
        }
        else if(this.state.list.hidden_ccheckway==2&&this.state.list.hidden_iauditstatus!='revise'){
            buttonType=
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
                </ActionButton>;

        }else{
            buttonType=
                    <TouchableWithoutFeedback  onPress={this.onPressDirectAgree.bind(this)}>
                        <View style={styles.footBarStyle}>
                            <Text style={styles.footBarTextStyle}>审批</Text>
                        </View>
                    </TouchableWithoutFeedback>;
        }
        return (
            <View style={CommonStyles.CommonWrapContainer}>
                <TopBar onPress={this.onPressBack} title={this.state.list.title}/>
                <View style={{height:ViewUtil.screenH-40-55,}}>
                    <ScrollView ref='scroll'>
                    <View >
                        <View >
                            <View style={styles.mainCellContainer}>
                                <View style={styles.TitleStyle}>
                                    {this.isHiddenTextMain()}
                                </View>
                                   <ListView
                                        dataSource={this.state.dataSource1}
                                        renderRow={this.renderTable.bind(this)}
                                        style={styles.listView}
                                        enableEmptySections={true}
                                        removeClippedSubviews={false}
                                    />
                                <View >
                                   {this.isHiddenTextDetail()}
                                </View>
                                <ListView
                                    dataSource={this.state.dataSource2}
                                    renderRow={this.renderTable2.bind(this)}
                                    style={styles.listView}
                                    enableEmptySections={true}
                                    removeClippedSubviews={false}
                                />
                            </View>
                        </View>
                        {/*公共的弹出窗口alert*/}
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
                            sureAction={this.hideAlertDialog1.bind(this)}/>

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
                            ]}
                        >
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
                        {/*非工作流，方式0审批*/}
                        <CommonModal
                            visible={this.state.notFlowDialogVisible0}
                            message={this.state.commonAlertMsg}
                            cancelTitle='取消'
                            sureTitle='确定'
                            cancelAction={this.hideModalgoOnSubmit.bind(this)}
                            sureAction={this.goOnSubmit.bind(this)}/>

                        <Modal visible={this.state.notFlowDialogVisible2} >
                            <View style={CommonStyles.modalContainer}>
                                <View style={{height:180-45,justifyContent: 'center',}}>
                                <Text style={{paddingLeft:20,paddingRight:20}}>{this.state.confirmMsg}</Text>
                                <View style={styles.input_item}>
                                    <TextInput
                                        style={styles.text_input}
                                        placeholder="请输入授权密码"
                                        placeholderTextColor="#aaaaaa"
                                        value={this.state.testPassworld}
                                        underlineColorAndroid="transparent"
                                        numberOfLines={1}
                                        ref='testPassworld'
                                        multiline={Platform.OS == 'ios'?false:true}
                                        secureTextEntry={true}/*设计输入的文字不可见*/
                                        onChangeText={this.onChangeText.bind(this)}
                                    />
                                </View>
                                </View>
                                <View style={{height:38,flexDirection: 'row',}}>
                                <TouchableHighlight  style={[CommonStyles.button, CommonStyles.close]} underlayColor="#aaa" onPress={this.hidePassWordDialog.bind(this)}>
                                    <Text>取消</Text>
                                </TouchableHighlight>
                                <TouchableHighlight style={[CommonStyles.button, CommonStyles.close]} underlayColor="#aaa"  onPress={this.passwordDialogSureBtn.bind(this)}>
                                    <Text style={{color:'#0BB20C'}}>确定</Text>
                                </TouchableHighlight>
                            </View>
                            </View>
                        </Modal>
                        </View>
                        <View>{this.view()}</View>
                        <View>{this.fileData()}</View>
                        <View style={{height:this.state.keyboardHeight,width:ViewUtil.screenW,}}></View>
                    </ScrollView>
                    <View style={{position:'absolute',left:(ViewUtil.screenW-100)/2,top:(ViewUtil.screenH-320)/2}}>
                        <Image source={require('../../../../../img/success.png')}
                               style={{width:this.state.rightWidth,height:this.state.rightHeight}}/>
                    </View>
                    <Spinner visible={this.state.visible} overlayColor={'rgba(0, 0, 0, 0.2)'}
                         textContent={this.state.tip} textStyle={{color: 'white'}}/>
                </View>
                {buttonType}
                <TouchableWithoutFeedback  onPress={this.showFlowJournal.bind(this)}>
                    <View style={styles.footBarFlowJournalStyle}>
                        <Text style={styles.footBarTextStyle}>流程日志</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    };
    isHiddenTextMain(){
        if(this.state.dataSourceD=='0'){
            return null;
        }else{
            return(
                <View style={styles.TitleStyle}>
                    <Text style={styles.Title}>主要信息</Text>
                </View>
            )
        }
    }
    //判断是否隐藏明细信息标题
    isHiddenTextDetail(){
        if(this.state.dataSourceD==null){
            return null;
        }else if(this.state.dataSourceD=='1'){
            return(
                <View style={styles.TitleStyle}>
                    <Text style={styles.Title}>明细信息</Text>
                </View>
            )
        }
    };
    //主要信息
    renderTable(main) {
        if(main.value!==null&&main.value.length>20){
            return(
                <View key={main.name}>
                    <View numberOfLines={1} style={styles.CellStyle}>
                        <Text style={styles.extraTextLeftStyle}>{main.name}</Text>
                        <Text style={styles.extraTextRightStyle}>{main.value}</Text>
                    </View>
                </View>
            )
        }else{
            return (
                <View key={main.name}>
                    <View numberOfLines={1} style={styles.CellStyle}>
                        <Text style={styles.LeftTextStyle}>{main.name}</Text>
                        <Text style={styles.RightTextStyle}>{main.value}</Text>
                    </View>
                </View>
            );
        }
    };
    //明细信息
    renderTable2(detail) {
        return (
            <View style={styles.ListViewContainerStyle} >
                <View key={detail.linecguid}>
                    {detail.line.map((col, i) => this.renderRowDetail(col, i, detail.line))}
                </View>
            </View>
        );
    };
    renderRowDetail(col,i, row){
        if(col.value!==null&&col.value.length>20){
            return(
                <View key={col.name}>
                    <View numberOfLines={1} style={styles.CellStyle}>
                        <Text style={styles.extraTextLeftStyle}>{col.name}</Text>
                        <Text style={styles.extraTextRightStyle}>{col.value}</Text>
                    </View>
                </View>
            )
        }else{
            return(
                <View key={col.name}>
                    <View numberOfLines={1} style={styles.CellStyle}>
                        <Text style={styles.LeftTextStyle}>{col.name}</Text>
                        <Text style={styles.RightTextStyle}>{col.value}</Text>
                    </View>
                </View>
            );
        }

    }
    //判断单据是否需要审批意见
    view(){
        if(this.state.list.hidden_ccheckway==0){return null;}
        if(this.state.list.hidden_ccheckway==1){return null;}
        if(this.state.list.hidden_ccheckway==2){
            return(
                <View>
                    <View style={styles.TitleStyle}>
                        <CellsTitle style={{paddingLeft:8}}>审批意见</CellsTitle>
                    </View>
                    <Cells>
                        <Cell>
                            <CellBody style={{marginTop:-10,}}>
                                <TextArea
                                style={{fontSize:Platform.OS == 'ios' ? 15 : 13,}}
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
            )
        }
    };
    //判断单据是否存在附件
    fileData(){
        if(this.state.fileData==null){
            return null;
        }else{
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
        this.setState({commonAlert1: true,});
    };
    onPressFile(e,f){
        //先下载文件,保存到app本地, 再展示
        //formid=mobile_common_funcbtn&action=appendix&cFileUrl=upload&cFileName=622239074677135190_adress.txt
        let result = Service.host.split("/service")[0];
        console.log(f.cfilename);
        var fullUrl = result+'/download.do?cFileUrl='+f.cfileurl+'&cFileName='+f.cfilename;
        console.log(fullUrl);
        Linking.openURL(encodeURI(fullUrl))
            .catch((err)=>{console.log('An error occurred', err);});
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
    onPressShowTip= () => {
        this.state.commonAlertMsg='被退回单据，请到pc端修改！';
        this.setState({commonAlert: true,});
    }
    /*工作流审批*/
    onPressAgree = () => {
        let taskid = this.props.taskid;
        this.setState({visible:true,tip:'审批中...'});
        var url=Service.host
            +'a8_mobile_daiban_submit&action=agree&cguid='+this.state.list.hidden_cguid
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&idea='+Base64.encode(encodeURIComponent(this.state.textarea)) +'&tokenID='+Service.tokenID+'&taskid='+taskid;

        HttpUtil.get(url,this)
            .then((responseData) => {
                console.log(responseData);
                this.setState({visible:false,});
                var msg;
                if(responseData==='chooseUsers'){
                    this.onGetUserList();

                }else if(responseData=='checkSuccess'){
                    //审批成功
                    this.showAlert();
                }else if(responseData.errmsg){
                    this.state.commonAlertMsg=responseData.errmsg;
                    this.setState({commonAlert: true,});
                }else{
                    msg=eval('(' + responseData + ')');
                    console.log(msg);
                    if(msg.errmsg){
                        this.state.commonAlertMsg=msg.errmsg;
                        this.setState({commonAlert: true,});
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
                        this.setState({commonAlert: true,});
                    }
                }
            })
            .catch((error) => {
                 this.setState({visible:false});
                 ToastUtil.show('网络连接失败！');
            });
    };
    onGetUserList(){
        let taskid = this.props.taskid;
        var url=Service.host+'a8_mobile_daiban_choose&cguid='+this.state.list.hidden_cguid+'&getType=getOptions&taskid='+taskid;
        HttpUtil.get(url,this)
            .then((responseData) => {
                //1.获取流程走向数据
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
                    nextTaskKey = responseData[i]['code'],
                    this.state.radioData0.push({
                        label:responseData[i]['name'],
                        value:responseData[i]['code'],
                        key:responseData[i]['isPreAssign'],
                    });
                }
                for (var i = 0; i < responseData.length; i++) {
                    if(responseData[i]['isDefault']==true && responseData[i]['isPreAssign']!=true){
                        //不可编辑，且没有指派方式
                        this.setState({
                            radio0:responseData[i]['code'],
                            isContersign:true,
                        });
                        nextTaskKey = responseData[i].code;
                        console.log('rrrrrrr');
                        if(responseData[i]['disabled']==true){
                            noEdit=true;
                        }else{
                            noEdit='';
                        }
                        this.setState({
                            radio1:responseData[i].assignDealWay,
                        });
                        this.getuser(responseData[i]['name']);
                    }
                    if(responseData[i]['isDefault']==true && responseData[i]['isPreAssign']==true){
                        //不可编辑，有指派方式
                        this.setState({
                            radio0:responseData[i]['code'],
                            isContersign:true,
                        });
                        nextTaskKey = responseData[i].code;
                        key=true;
                        if(responseData[i]['disabled']==true){
                            noEdit=true;
                        }else{
                            noEdit='';
                        }
                         this.setState({
                            radio1:responseData[i].assignDealWay,
                        });
                        this.getuser(responseData[i]['name']);
                    }
                    if(responseData[0]['isPreAssign']==true && responseData[i]['isDefault']!=true){
                        //有指派方式，可以编辑
                        this.setState({
                            radio0:responseData[0]['code'],
                        });
                        nextTaskKey = responseData[0].code;
                        key=true;
                        noEdit = '';
                         this.setState({
                            radio1:responseData[i].assignDealWay,
                        });
                        this.getuser(responseData[0]['name']);
                        return false;
                    }if(responseData[0]['isPreAssign']!=true && responseData[i]['isDefault']!=true){

                        //没有指派方式，可以编辑
                        this.setState({
                            radio0:responseData[0]['code'],
                        });
                        noEdit = '';
                         this.setState({
                            radio1:responseData[i].assignDealWay,
                        });
                        nextTaskKey = responseData[0].code;
                        this.getuser(responseData[0]['name']);
                        return false;
                    }
                }
            })
            .catch((error) => {
                this.setState({visible:false});
                 ToastUtil.show('网络连接失败！');
            });
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
                nextTaskKey = this.state.radioData0[i].value;
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
        let taskid = this.props.taskid;
        var url=Service.host
                +'a8_mobile_daiban_choose&cguid='+this.state.list.hidden_cguid
                +'&selectedActName='+Name
                +'&isContersign='+this.state.isContersign+'&taskid='+taskid+'&nextTaskKey='+nextTaskKey;
        HttpUtil.get(url,this)
            .then((responseData) => {
                console.log(responseData);
                this.setState({
                    radioData2:[],
                });
                this.state.CheckboxOption.pop();

                if(responseData.assignDealWay != null){
                    this.setState({
                        radio1:responseData.assignDealWay,

                    });
                }

                for (var i = 0; i < responseData.users.length; i++) {
                    this.state.CheckboxOption.push({
                        label:responseData.users[i]['name'],
                        value:responseData.users[i]['code'],
                    });
                    if(noEdit==true){
                        if(key==false){
                            console.log('key=false');
                            if(responseData.users[0]['check']){
                                    this.setState({
                                    radio2:responseData.users[0]['code']
                                });
                            }
                        }else{
                            console.log('key=true');
                             if(responseData.users[i]['check']){
                                this.state.checkbox.push(
                                    responseData.users[i]['code'],
                                );
                            }
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
            .catch((error) => {
                this.setState({visible:false});
                 ToastUtil.show('网络连接失败！');
            });
    }
    handleRadioChange1(value) {
        if(noEdit!=true){
            this.setState({
                radio1:value
            });
        }
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
        if(key==false){//没有指派方式
            let taskid = this.props.taskid;
            var url=Service.host+Service.dbSubmit
            +'&action=commit'
            +'&cguid='+this.state.list.hidden_cguid
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&selected='+this.state.radio0
            +'&preAssigWay=consign'
            +'&preAssigned='+this.state.radio2
            +'&idea='+Base64.encode(encodeURIComponent(this.state.textarea))
            +'&taskid='+taskid
            +'&tokenID='+Service.tokenID;
            HttpUtil.get(url,this)
            .then((responseData) => {
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
                    this.setState({commonAlert: true,});
                }
            })
            .catch((error) => {
                this.setState({visible:false});
                 ToastUtil.show('网络连接失败！');
            });
        }else{//console.log('有指派方式');
            let taskid = this.props.taskid;
            var url=Service.host+Service.dbSubmit
            +'&action=commit'
            +'&cguid='+this.state.list.hidden_cguid
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&selected='+this.state.radio0
            +'&preAssigWay='+this.state.radio1
            +'&preAssigned='+this.state.checkbox
            +'&idea='+Base64.encode(encodeURIComponent(this.state.textarea))
            +'&taskid='+taskid
            +'&tokenID='+Service.tokenID;
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
                    this.setState({commonAlert: true,});
                }
            })
            .catch((error) => {
                this.setState({visible:false});
                 ToastUtil.show('网络连接失败！');
            });
        }
    };
    onPressBackStep = () => {
        let taskid = this.props.taskid;
        this.setState({visible:true,tip:'返回上一步中...'});
        var url=Service.host+Service.dbSubmit
            +'&action=backprev'
            +'&cguid='+this.state.list.hidden_cguid
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&idea='+Base64.encode(encodeURIComponent(this.state.textarea))+'&tokenID='+Service.tokenID+'&taskid='+taskid;
        HttpUtil.get(url,this)
            .then((responseData) => {
                this.setState({visible:false});
                var msg;
                if(responseData==='backprevSuccess'){
                    this.state.commonAlertMsg='返回上一步成功';
                    this.setState({
                        commonAlert: true,
                    });
                }else if(responseData.errmsg){
                    this.state.commonAlertMsg=responseData.errmsg;
                    this.setState({commonAlert: true,});
                }else{
                    this.state.commonAlertMsg='审核异常，请重新获取打开单据审核';
                    this.setState({commonAlert: true,});
                }
            })
            .catch((error) => {
                this.setState({visible:false});
                 ToastUtil.show('网络连接失败！');
            });
    };
    onPressBackPerson = () => {
        let taskid = this.props.taskid;
        this.setState({visible:true,tip:'返回发起人中...'});
        var url=Service.host+Service.dbSubmit
            +'&action=backorigin'
            +'&cguid='+this.state.list.hidden_cguid
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&idea='+Base64.encode(encodeURIComponent(this.state.textarea))+'&tokenID='+Service.tokenID+'&taskid='+taskid;
        HttpUtil.get(url,this)
            .then((responseData) => {
                this.setState({visible:false});
                var msg;
                if(responseData==='backoriginSuccess'){
                    this.state.commonAlertMsg='返回发起人成功';
                    this.setState({
                        commonAlert: true,
                    });
                    const { navigator } = this.props;
                    if (navigator) {
                        this.props.callBackFun();
                        navigator.pop();
                    }
                }else if(responseData.errmsg){
                    this.state.commonAlertMsg=responseData.errmsg;
                    this.setState({commonAlert: true,});
                }else{
                    this.state.commonAlertMsg='审核异常，请重新获取打开单据审核';
                    this.setState({commonAlert: true,});
                }
            })
            .catch((error) => {
                this.setState({visible:false});
                 ToastUtil.show('网络连接失败！');
            });
    };

    onPressEnd = () => {
        let taskid = this.props.taskid;
        this.setState({visible:true,tip:'终止中...'});
        var url=Service.host+Service.dbSubmit
            +'&action=terminate'
            +'&cguid='+this.state.list.hidden_cguid
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&idea='+Base64.encode(encodeURIComponent(this.state.textarea))+'&tokenID='+Service.tokenID+'&taskid='+taskid;
        HttpUtil.get(url,this)
            .then((responseData) => {
                this.setState({visible:false});
                var msg;
                if(responseData==='terminateSuccess'){
                    this.state.commonAlertMsg='审批已终止';
                    this.setState({
                        commonAlert: true,
                    });
                    const { navigator } = this.props;
                    if (navigator) {
                        this.props.callBackFun();
                        navigator.pop();
                    }
                }else if(responseData.errmsg){
                    this.state.commonAlertMsg=responseData.errmsg;
                    this.setState({commonAlert: true,});
                }else{
                    this.state.commonAlertMsg='审核异常，请重新获取打开单据审核';
                    this.setState({commonAlert: true,});
                }
            })
            .catch((error) => {
                this.setState({visible:false});
                 ToastUtil.show('网络连接失败！');
            });
    };

    /*非工作流，方式审批*/
    onPressDirectAgree = () => {
        this.setState({visible:true,tip:'审批中...'});
        var url=Service.host+Service.dbSubmit
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&cguid='+this.state.list.hidden_cguid
            +'&action=submit';
        HttpUtil.get(url,this)
            .then((responseData) => {
                console.log(responseData);
                this.setState({visible:false,});
                var msg;
                if(responseData.errmsg){
                    this.state.commonAlertMsg=responseData.errmsg;
                    this.setState({
                        commonAlert: true,
                    });
                    return false;
                }else{
                    msg = eval('(' + responseData + ')');
                }
                if(msg.errmsg){
                    this.state.commonAlertMsg=msg.errmsg;
                    this.setState({
                        commonAlert: true,
                    });
                    return false;
                }else if(msg.confirm){
                    this.state.confirmMsg=msg.msg;
                    this.setState({
                        notFlowDialogVisible0: true,
                    });
                }else  if(msg.passWordConfirm===true){
                    this.state.confirmMsg=msg.msg;
                    this.setState({
                        notFlowDialogVisible2: true,
                    });
                }else {
                    //审批成功;
                    this.showAlert();
                }
            })
            .catch((error) => {
                this.setState({visible:false});
                 ToastUtil.show('网络连接失败！');
            });
    };
    passwordDialogSureBtn(){
        console.log("按钮点击");
        var url;
        if(this.state.flowTest==true){
            console.log("获取url1");
            url=Service.host
            +'mobile_daiban_submit&action=agree&cguid='+this.state.list.hidden_cguid
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&idea='+Base64.encode(encodeURIComponent(this.state.textarea));
        }else{
            console.log("获取url2");
            url=Service.host+Service.dbSubmit
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&cguid='+this.state.list.hidden_cguid
            +'&action=submit';
        }
        HttpUtil.get(url,this)
            .then((responseData) => {

                var msg = eval('(' + responseData + ')');
                if(this.state.testPassworld==msg.password){
                    this.setState({
                        notFlowDialogVisible2: false,
                    });
                    this.goOnSubmit();
                }else{
                    this.setState({
                        notFlowDialogVisible2:false,
                        commonAlertMsg:'密码错误，请重新输入',
                        commonAlert1:true,
                        show:true,
                    });
                }
            })
            .catch((error) => {
                this.setState({visible:false});
                 ToastUtil.show('网络连接失败！');
            });
    };
    goOnSubmit(){
        this.setState({
            notFlowDialogVisible0: false,
        });
        var url;
        if(this.state.flowTest==true){
            url=Service.host
            +'mobile_daiban_submit&action=agree&cguid='+this.state.list.hidden_cguid
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&idea='+Base64.encode(encodeURIComponent(this.state.textarea))
            +'&firstsubmit=false';
        }else{
            url=Service.host+Service.dbSubmit
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&cguid='+this.state.list.hidden_cguid
            +'&firstsubmit=false'
            +'&action=submit';
        }
       HttpUtil.get(url,this)
            .then((responseData) => {

                var msg;
                if(responseData=='checkSuccess'){
                    //审批成功
                    this.showAlert();
                }else if(responseData=='chooseUsers'){
                    this.onGetUserList();
                }else if(responseData.errmsg){
                    this.state.commonAlertMsg=responseData.errmsg;
                        this.setState({
                            commonAlert: true,
                        });
                }else{
                    msg = eval('(' + responseData + ')');
                    if(msg.errmsg){
                        this.state.commonAlertMsg=msg.errmsg;
                        this.setState({
                            commonAlert: true,
                        });
                        return false;
                    }else{
                        //审批成功
                        this.showAlert();
                    }
                }
            })
            .catch((error) => {
                this.setState({visible:false});
                 ToastUtil.show('网络连接失败！');
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
                this.props.callBackFun();
                navigator.pop();
            }
        }.bind(this),1000);
    };
}
const styles = StyleSheet.create({
    //主容器
    mainCellContainer:{},
    //各个子模块标题样式
    TitleStyle:{
        justifyContent:'center',
        height:40,
    },
    Title:{
        marginLeft:8,
        fontSize:13,
    },
    //单行容器样式
    ListViewContainerStyle:{
        flexDirection:'row',
        borderBottomWidth:1,
        borderColor:'#ccc',
        paddingTop:6,
        backgroundColor:'#fff',
    },
    //单行样式
    CellStyle:{
        width:ViewUtil.screenW,
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor:'white',
        alignItems:'center',
        borderBottomColor:'#e8e8e8',
        borderBottomWidth:1,
        paddingTop:5,
        paddingBottom:6,
    },
    //一般单行布局
    LeftTextStyle:{
        marginLeft:8,
        fontSize:13,
        color:'#aaa',
    },
    RightTextStyle:{
        marginRight:8,
        fontSize:13,
        color:'#aaa',
    },
    //单行字数超过20布局
    extraTextLeftStyle:{
        marginLeft:8,
        width:40,
        color:'#aaa',
        fontSize:13,
    },
    extraTextRightStyle:{
        width:ViewUtil.screenW-50,
        paddingRight:8,
        color:'#aaa',
        fontSize:13,
    },
    //输入密码框样式
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
    //文件下载按钮
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
    ViewStyle: {},
    textStyle:{
        color: '#50B1F8',
    },
    //非工作流审批按钮
    footBarStyle:{
        position:'absolute',
        bottom:0,
        left:0,
        backgroundColor:'#50B1F8',
        width:ViewUtil.screenW/2,
        height:40,
        justifyContent:'center',
        alignItems:'center',
    },
    footBarGradStyle:{
        position:'absolute',
        bottom:0,
        left:0,
        backgroundColor:'#bbb',
        width:ViewUtil.screenW/2,
        height:40,
        justifyContent:'center',
        alignItems:'center',
    },
    footBarTextStyle:{
        color:'#fff',
        fontSize:16,
    },
    //流程日志
    footBarFlowJournalStyle:{
        position:'absolute',
        bottom:0,
        right:0,
        backgroundColor:'#50B1F8',
        width:ViewUtil.screenW/2,
        height:40,
        justifyContent:'center',
        alignItems:'center',
        borderLeftColor:'#fff',
        borderLeftWidth:1,
    },
});
