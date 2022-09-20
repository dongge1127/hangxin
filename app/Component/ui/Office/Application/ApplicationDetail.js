/**
 * Created by John on 2017-6-26.
 */
import React, {
    Component
} from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    AsyncStorage,
    Platform,
    ScrollView,
    TextInput,
    Button,
    StatusBar,
    ListView,
    TouchableWithoutFeedback,
    Keyboard,
    BackAndroid,
    NativeModules,
    Linking,
    TouchableHighlight,
} from 'react-native';
import {
    RadioCells,
    Dialog,
    Cells,
    CellsTitle,
    Cell,
    CellBody,
    TextArea,
} from 'rn-weui/src';
import dismissKeyboard from 'dismissKeyboard';
import ImageViewer from 'react-native-image-zoom-viewer';
import Modal from 'react-native-root-modal';
import Spinner from "react-native-loading-spinner-overlay";
import TimerMixin from "react-timer-mixin";
import Swipeable from 'react-native-swipeable';
import Toast from 'react-native-root-toast';
import CommonStyles from '../../../../style/CommonStyle';
import ApplicationCommonStyles from './ApplicationCommonStyle';
import Service from '../../service';
import TopBar from '../../APPComponent/TopBar';
import NavigationBar from '../../APPComponent/NavigationBar';
import CommonModal from "../../APPComponent/CommonModal";
import UtilFun from '../../common/UtilFun';
import ViewUtil from '../../common/ViewUtil';
import HttpUtil from '../../common/HttpUtil';
import AddBXDetail from './AddBXDetail';
import AddFPDetail from './AddFPDetail';
import SearchXM from './SearchXM';
import CheckBXDetail from './CheckBXDetail';
import CheckFPDetail from './CheckFPDetail';
import ToastUtil from "../../common/ToastUtil";
import "../../../../constant/Storage";

import ImagePicker from 'react-native-image-crop-picker';
const imagesUrlTest = [];
//存放数组
let dataToPost = [];
let temp = [];


export default class ApplicationDetail extends Component {
    constructor(props){
        super(props);
        this.BXDETAILLIST=[];   //报销明细列表数据
        this.FPDETAILLIST=[];   //发票明细列表数据
        this.filecguid=[];       //存放删除附件id
        this.state = {
            //三个数据源：报销明细、发票明细、报销人列表、业务类型列表
            dataSource1: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2,}),
            dataSource2: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2,}),
            dataSource3: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2,}),
            dataSource4: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2,}),

            visible:false,                      //执行动画
            commonAlert:false,                  //弹出框显示、隐藏
            commonAlertMsg:'',                  //弹出框信息
            deleteAlert:false,                     //是否删除单据弹框
            visibleModal: false,                //modal的显示隐藏
            MODALTYPE:'ywlx',                   //modal的类型
            callType: this.props.callType,      //父页面类型：修改、新增
            item: this.props.item,              //新增时:undefined,修改时:item
            saveAllTime:false,      //不断点击保存

            cguid:'',               //主表main的cguid
            YWLXDATA:[],            //业务类型数据
            YWLX:'',                //选择的业务类型
            radio: '',              //选择的业务类型id

            BXPERSON:'',            //选择的报销人
            BXPERSONID:'',          //选择的报销人id
            BXDEPARTMENT:'',        //选择的报销部门
            BXDEPARTMENTID:'',      //选择的报销部门id

            XMTYPE:'',              //选择的项目类型
            XMTYPEID:'',            //选择的项目类型id
            BXREASON:'',            //报销原因
            SUMMONEY:'',            //总金额
            sjc:'',                 //编辑时间戳
            ccode:'',
            zt:'',

            noEditPower:false,      //不能修改单据2种情况：保存后、当前用户没有修改权限
            saveSuccess:false,      //单据是否保存成功

            images: [],           //选择照片
            imageView:false,
            imageViewUri:false,

            SSDATA:[],               //送审数据
            SSCODE:'',
            submitPower:false,
            userGuid:'',
            fileData:null,

        };
        //获取系统当前时间
        this.DateTime=UtilFun.getTimeDate();
    };
    /********************页面初始函数********************/
    onPressBack = () => {//页面返回
        this.props.callRefreshFun();
        this.props.navigator.pop();
    };
    hideAlertDialog() {
        this.setState({commonAlert: false,});
    };
    componentWillMount() {
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
        this.setState({
            cguid: (this.state.item == undefined) ? '' : this.state.item.cguid,//主表id
        });
        dataToPost = [];
        temp = [];
        AsyncStorage.getItem("userGuid", (error, text) => {this.setState({
            userGuid:text},()=>{
                console.log('=================================');
                console.log(this.state.userGuid);
            })});
    }
    componentDidMount(){
        if(this.state.item==undefined){
            this.timer = TimerMixin.setTimeout(() => {
                this.fetchData();
                this.getXMintData();
            }, 1000);
            this.setState({visible:true,tip:'数据加载中...'});
        }else{
            this.getPower();
            this.getBasicData();
            this.getData();
        }
    };
    componentWillUnmount() {
        this.keyboardDidHideListener.remove();
        this.timer && TimerMixin.clearTimeout(this.timer);
    }
    //键盘收起
    _keyboardDidHide(e){}
    yychange(textarea) {
        this.setState({ BXREASON:textarea,submitPower:false, })
    };
    /********************发起请求获取页面初始状态数据********************/
    fetchData() {
        var url=Service.host+'mobile_em_expenseAccountBill'+'&action=new';
        HttpUtil.get(url,this)
                .then((responseData) => {//console.log(responseData);
                    this.setState({visible:false});
                    this.setState({ //默认业务类型为返回数据中的第一个
                        YWLX:responseData.ywlx[0].name,
                        radio:responseData.ywlx[0].code,
                    });
                    this.setState({ //默认单据报销人为关联用户
                        BXPERSON:responseData.currEmpName,
                        BXDEPARTMENT:responseData.currDeptName,
                        BXPERSONID:responseData.currEmpId,
                        BXDEPARTMENTID:responseData.currDeptId,
                    });
                    this.setState({
                        dataSource1: this.state.dataSource1.cloneWithRows(this.BXDETAILLIST),
                        dataSource2: this.state.dataSource2.cloneWithRows(this.FPDETAILLIST),
                        dataSource3: this.state.dataSource3.cloneWithRows(responseData.bxrList),
                        dataSource4: this.state.dataSource4.cloneWithRows(responseData.ywlx),
                    });

                })
                .catch((error) => {
                    this.setState({
                        requestFail:true,
                    })
                });
    };
    /********************新增获取项目初始值为常用项目的第一个********************/
    getXMintData(){
        let url=Service.host+'mobile_em_expenseAccountBill'+'&action=queryCommonXm';
        HttpUtil.get(url,this)
            .then((responseData) => {//console.log(responseData);
                this.setState({
                    XMTYPE:responseData.coXmList[0].xmname,
                    XMTYPEID:responseData.coXmList[0].xmid,
                });
            })
            .catch((error) => {});
    }
    /*****************编辑进入页面获取后台返回的该单据的初始信息*****************/
    getPower(){//检验用户是否有权限更改单据
        let url=Service.host+'mobile_em_expenseAccountBill'+'&action=checkEditPower';
        HttpUtil.get(url,this)
                .then((responseData) => {
                    console.log(responseData);
                    if(responseData==false){
                        this.setState({
                            noEditPower:true,
                        });
                    }
                })
                .catch((error) => {});
    }
    getData(){
        let url=Service.host+'mobile_em_expenseAccountBill'+'&action=load'+'&cguid='+this.state.item.hidden_cguid+'&spzt=wtj';
        console.log('修改:'+url);
        HttpUtil.get(url,this)
            .then((responseData) => {
                console.log('获取后台返回的该单据的信息:');
                console.log(responseData);
                this.setState({
                    fileData: responseData.fileList,
                });

                this.setState({//主表信息
                    cguid:responseData.main.cguid,
                    YWLX:responseData.main.ywlxname,
                    radio:responseData.main.ywlxid,
                    XMTYPE:responseData.main.xmname,
                    XMTYPEID:responseData.main.xmid,
                    BXPERSON:responseData.main.bxrname,
                    BXPERSONID:responseData.main.bxrid,
                    BXDEPARTMENT:responseData.main.bxrbmname,
                    BXDEPARTMENTID:responseData.main.bxrbmid,
                    SUMMONEY:responseData.main.bxje,
                    //BXREASON:responseData.main.bxyy,
                    sjc:responseData.main.sjc,
                    ccode:responseData.main.ccode,
                    zt:responseData.main.zt,
                });
                if(responseData.main.bxyy==null){
                    this.setState({
                        BXREASON:'',
                    });
                }else{
                    this.setState({
                        BXREASON:responseData.main.bxyy,
                    });
                }
                this.DateTime=responseData.main.bxrq;
                for (let i in responseData.bxmxList) {//报销明细信息
                    let map = {};
                         map['bxguid']=responseData.bxmxList[i].cguid;
                         map['FYTYPE']=responseData.bxmxList[i].fylbname;
                         map['FYradio']=responseData.bxmxList[i].fylbid;
                         map['BXMoney']=responseData.bxmxList[i].bxje;
                         map['startTime']=responseData.bxmxList[i].ksrq;
                         map['endTime']=responseData.bxmxList[i].jsrq;
                         map['SUMDAY']=responseData.bxmxList[i].ts;
                         map['STARTPLACE']=responseData.bxmxList[i].sfd;
                         map['ENDPLACE']=responseData.bxmxList[i].mdd;
                         map['BZ']=responseData.bxmxList[i].bz;
                    this.BXDETAILLIST.push(map);
                }
                for (let i in responseData.fpmxList) {//发票明细
                    let map = {};
                        map['fpguid']=responseData.fpmxList[i].cguid;
                        map['FPDM']=responseData.fpmxList[i].fpdm;
                        map['FPHM']=responseData.fpmxList[i].fphm;
                        map['BZ']=responseData.fpmxList[i].bz;
                        //map['FPSUM']=responseData.fpmxList[i].fpje;
                        if(responseData.fpmxList[i].fpje==null){
                            map['FPSUM']='';
                        }else{
                            map['FPSUM']=responseData.fpmxList[i].fpje;
                        }
                    this.FPDETAILLIST.push(map);
                }

               /* if(responseData.main.zt=='revise'){
                    this.setState({submitPower:true,})
                }else if(responseData.main.zt=='saved'){
                    if(this.state.item.hidden_ccheckway=='2'){
                        this.setState({submitPower:true,})
                    }else{
                        this.setState({submitPower:false,});
                    }
                }else{
                    this.setState({submitPower:false,});
                }*/
                this.setState({//报销明细、发票明细重新渲染组件
                    dataSource1: new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,}).cloneWithRows(this.BXDETAILLIST),
                    dataSource2: new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,}).cloneWithRows(this.FPDETAILLIST),
                });
            })
            .catch((error) => {});
    }
    getBasicData() {//获取页面基础数据
        var url=Service.host+'mobile_em_expenseAccountBill'+'&action=new';//console.log('新增发送地址：'+url);
        HttpUtil.get(url,this)
                .then((responseData) => {
                    //console.log('获取页面基础数据'+responseData);
                    this.setState({visible:false});

                    this.setState({
                        dataSource3: this.state.dataSource3.cloneWithRows(responseData.bxrList),
                        dataSource4: this.state.dataSource3.cloneWithRows(responseData.ywlx),
                    });

                })
                .catch((error) => {
                    this.setState({
                        requestFail:true,
                    })
                });
    };
    //显示弹窗
    _showModal(type){
        this.setState({
            visibleModal: true,
            MODALTYPE:type,
        });
    };
    //弹窗组件根据type类型渲染弹窗内容
    _renderModalContent() {
        if(this.state.MODALTYPE=='ywlx'){
            return(
                <View style={styles.modalContentStyle}>
                    <View style={{marginBottom:15}}>
                        <Text style={{color:'#50B1F8',fontSize:16}}>选择业务类型</Text>
                    </View>
                    <View style={{marginBottom:20}}>
                        <ListView
                            dataSource={this.state.dataSource4}
                            renderRow={this.renderYWLXRow.bind(this)}
                            style={styles.listView}
                            enableEmptySections={true}
                            removeClippedSubviews={false}
                        />
                    </View>
                </View>
            );
        }else if(this.state.MODALTYPE=='bxr'){
            return(
                <View style={styles.modalContentStyle}>
                    <View style={{marginBottom:15}}>
                        <Text style={{color:'#50B1F8',fontSize:16}}>选择报销人</Text>
                    </View>
                    <View style={{marginBottom:20}}>
                        <ListView
                            dataSource={this.state.dataSource3}
                            renderRow={this.renderBxrRow.bind(this)}
                            style={styles.listView}
                            enableEmptySections={true}
                            removeClippedSubviews={false}
                        />
                    </View>
                </View>
            );
        }else if(this.state.MODALTYPE=='tjss'){
            return(
                <View style={styles.modalContentStyle}>
                    <View style={{marginBottom:15}}>
                        <Text style={{color:'#50B1F8',fontSize:16}}>选择送审流程</Text>
                    </View>
                    <View>
                        <ScrollView>
                            <RadioCells
                                options={this.state.SSDATA}
                                onChange={this.handleRadioSSChange.bind(this)}
                                value={this.state.SSCODE}
                            />
                        </ScrollView>
                    </View>
                </View>
            );
        }

    };
    closeModal(){
        this.setState({
            visibleModal:false,
        });
    };
    isDelete(){
        this.setState({
            deleteAlert:true,
        });
    };
    cancelModal(){
        this.setState({
            deleteAlert:false,
        });
    };
    closeImageViewer(){
        this.setState({
            imageView:false,
        });
    }
    //业务类型单选切换
   /* handleRadioChange(value) {
        this.setState({
            radio:value,
            visibleModal:false,
        });
        //根据选择的业务类型的value值去渲染对应的label值
        for(let i in this.state.YWLXDATA){
            if(value==this.state.YWLXDATA[i].value){
                this.setState({
                    YWLX:this.state.YWLXDATA[i].label,
                });
                return;
            }
        }
    };*/
    renderYWLXRow(data){
        return(
            <TouchableOpacity onPress={()=>this.pressYWLXList(data)}>
            <View key={data.code}>
                <View numberOfLines={1} style={styles.modalRowStyle}>
                    <Text>{data.name}</Text>
                </View>
            </View>
            </TouchableOpacity>
        );
    }
    pressYWLXList(data){
        this.setState({
            radio:data.code,
            YWLX:data.name,
            visibleModal:false,
            submitPower:false,
        });
    };
    renderBxrRow(data){
        return(
            <TouchableOpacity onPress={()=>this.pressList(data)}>
            <View key={data.code}>
                <View numberOfLines={1} style={styles.modalRowStyle}>
                    <Text>{data.empname}</Text>
                </View>
            </View>
            </TouchableOpacity>
        );
    }
    pressList(data){
        this.setState({
            BXPERSON:data.empname,
            BXDEPARTMENT:data.depname,
            BXPERSONID:data.empid,
            BXDEPARTMENTID:data.depid,
            visibleModal:false,
            submitPower:false,
        });
    };
    //选择项目
    onPressXM=()=>{
        let _that=this;
        _that.props.navigator.push({
            name : 'SearchXM',
            component : SearchXM,
            params: {//接收子页面用户选择的项目执行的回掉函数
                getxm: function (xm,xmid) {
                    _that.setState({
                        XMTYPE: xm,
                        XMTYPEID:xmid,
                        submitPower:false,
                    },()=>{console.log(_that.state.XMTYPE);console.log(_that.state.XMTYPEID);});
                }.bind(_that),
            }
        })
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
        let pos=file.cfilename.split("_")[0].length+1;
        let fileName = file.cfilename.slice(pos);
        return(
            <View key={i} style={{flexDirection: 'row',height:90,backgroundColor:'#fff',alignItems: 'center',}}>
                <Image source={require('../../../../../img/filelogo.png')} style={{height:60,width:64,marginLeft:10,}} />
                <View style={{paddingRight:60}}>
                    <Text style={{paddingLeft:10,paddingRight:20}}>{fileName}</Text>
                    <View style={{flexDirection:'row',}}>
                    <TouchableOpacity  onPress={(e) => this.onPressFile(e,file)} style={styles.fileBtn}>
                        <Text numberOfLines={1} style={{color:'#fff'}}>下载</Text>
                    </TouchableOpacity>
                    <TouchableOpacity  onPress={(e) => this.deleteFile(e,file)} style={styles.fileBtn}>
                        <Text numberOfLines={1} style={{color:'#fff'}}>删除</Text>
                    </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };
    onPressFile(e,f){
        //先下载文件,保存到app本地, 再展示
        //formid=mobile_common_funcbtn&action=appendix&cFileUrl=upload&cFileName=622239074677135190_adress.txt
        let result = Service.host.split("/pt")[0];
        var fullUrl = result+"/download.do?cFileUrl="+f.cfileurl+'&cFileName='+f.cfilename;
        console.log('++++++++++++++++++');
        console.log(fullUrl);
        Linking.openURL(encodeURI(fullUrl))
            .catch((err)=>{console.log('An error occurred', err);});
    };
    deleteFile(e,f){
        let _that=this;
        _that.filecguid.push(f.cguid);
        console.log(_that.filecguid);
        _that.fileData();
        UtilFun.ArrRemoveItem(_that.state.fileData,f);
        _that.setState({
            submitPower:false,
            fileData:_that.state.fileData,
        });
    }
    render(){
        let TopBarType;
        let saveSuccess;
        if(this.state.saveSuccess==true){
                saveSuccess=
                <View style={{flexDirection:'row',marginRight:5}}>
                <View style={{height:30,width:38,marginRight:5}}>
                    <TouchableOpacity onPress={this._saveAction.bind(this)}>
                        <Image source={require('../../../../../img/save.png')} style={{width:28,height:28,}} />
                    </TouchableOpacity>
                </View>
                <View style={{height:30,width:38,}}>
                    <TouchableOpacity onPress={this.isDelete.bind(this)}>
                        <Image source={require('../../../../../img/delete.png')} style={{width:30,height:30,}} />
                    </TouchableOpacity>
                </View>
                </View>
        }else{
            saveSuccess=
            <View style={{flexDirection:'row',marginRight:5}}>
            <View style={{height:30,width:38,marginRight:5}}>
            <TouchableOpacity onPress={this._saveAction.bind(this)}>
                <Image source={require('../../../../../img/save.png')} style={{width:28,height:28,}} />
            </TouchableOpacity>
            </View>
            </View>
        }
        if(this.state.callType=='Add'){
            TopBarType=
                <View style={CommonStyles.CommonTopBarContainer}>
                    <TouchableOpacity onPress={this.onPressBack.bind(this)}>
                        <Image source={require('../../../../../img/back.png')} style={CommonStyles.CommonTopBarImgStyle} />
                    </TouchableOpacity>
                    <Text style={CommonStyles.CommonTopBarText}>新建报销单申请</Text>
                    {saveSuccess}
                </View>
        }else{
            TopBarType=
                <View style={CommonStyles.CommonTopBarContainer}>
                    <TouchableOpacity onPress={this.onPressBack.bind(this)}>
                        <Image source={require('../../../../../img/back.png')} style={CommonStyles.CommonTopBarImgStyle} />
                    </TouchableOpacity>
                    <Text style={CommonStyles.CommonTopBarText}>修改报销单申请</Text>
                    <View style={{flexDirection:'row',marginRight:5}}>
                        <View style={{height:30,width:38,marginRight:5}}>
                            <TouchableOpacity onPress={this._saveAction.bind(this)}>
                                <Image source={require('../../../../../img/save.png')} style={{width:28,height:28,}} />
                            </TouchableOpacity>
                        </View>
                        <View style={{height:30,width:38,}}>
                            <TouchableOpacity onPress={this.isDelete.bind(this)}>
                                <Image source={require('../../../../../img/delete.png')} style={{width:30,height:30,}} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
        }
        return(
            <View style={CommonStyles.CommonWrapContainer}>
                {TopBarType}
                <View style={{height:ViewUtil.screenH-125,}}>
                <CommonModal
                    visible={this.state.commonAlert}
                    message={this.state.commonAlertMsg}
                    sureTitle='确定'
                    sureAction={this.hideAlertDialog.bind(this)}
                    />
                <CommonModal
                    visible={this.state.deleteAlert}
                    message='您确定要删除该单据吗 ？'
                    cancelTitle='取消'
                    cancelAction={this.cancelModal.bind(this)}
                    sureTitle='确定'
                    sureAction={this.delete.bind(this)}
                />
                <View style={{height:ViewUtil.screenH-140,}}>
                <ScrollView>
                    {this.state.noEditPower?
                        <View style={[ApplicationCommonStyles.cellContainer,{marginTop:10}]}>
                            <View style={ApplicationCommonStyles.leftViewStyle}>
                                <View style={ApplicationCommonStyles.leftTitleView}>
                                    <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>业务类型</Text>
                                    <Text style={{color: 'red', marginLeft: 5}}>*</Text>
                                </View>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.YWLX}</Text>
                            </View>
                        </View>:
                        <TouchableOpacity onPress={()=>this._showModal('ywlx')}>
                        <View style={[ApplicationCommonStyles.cellContainer,{marginTop:10}]}>
                            <View style={ApplicationCommonStyles.leftViewStyle}>
                                <View style={ApplicationCommonStyles.leftTitleView}>
                                    <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>业务类型</Text>
                                    <Text style={{color: 'red', marginLeft: 5}}>*</Text>
                                </View>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.YWLX}</Text>
                            </View>
                            <View style={ApplicationCommonStyles.rightViewStyle}>
                                <Image source={require('../../../../../img/rarrow.png')} style={{width:8, height:13, marginRight:8, marginLeft:5}} />
                            </View>
                        </View>
                        </TouchableOpacity>}
                        <View style={{height:50,justifyContent:'center'}}>
                            <Text style={{marginLeft:14,fontSize:14,color:'#5c5c5c'}}>基本信息</Text>
                        </View>
                    {this.state.noEditPower?
                        <View style={ApplicationCommonStyles.cellContainer}>
                            <View style={ApplicationCommonStyles.leftViewStyle}>
                                <View style={ApplicationCommonStyles.leftTitleView}>
                                    <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>项目</Text>
                                </View>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.XMTYPE}</Text>
                            </View>
                        </View>:
                        <TouchableOpacity onPress={()=>this.onPressXM('xm')}>
                        <View style={ApplicationCommonStyles.cellContainer}>
                            <View style={ApplicationCommonStyles.leftViewStyle}>
                                <View style={ApplicationCommonStyles.leftTitleView}>
                                    <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>项目</Text>
                                </View>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.XMTYPE}</Text>
                            </View>

                            <View style={ApplicationCommonStyles.rightViewStyle}>
                                <Image source={require('../../../../../img/rarrow.png')} style={{width:8, height:13, marginRight:8, marginLeft:5}} />
                            </View>

                        </View>
                        </TouchableOpacity>}
                    {this.state.noEditPower?
                        <View style={ApplicationCommonStyles.cellyyContainer}>
                            <View style={ApplicationCommonStyles.leftViewStyle}>
                                <View style={ApplicationCommonStyles.leftTitleView}>
                                    <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>报销原因</Text>
                                    <Text style={{color: 'red', marginLeft: 5}}>*</Text>
                                </View>
                                <View style={{width:ViewUtil.screenW-110,marginLeft:15,}}>
                                    <Text>{this.state.BXREASON}</Text>
                                </View>
                            </View>

                        </View>:
                        <View>
                            <View style={ApplicationCommonStyles.cellContainer}>
                                <View style={ApplicationCommonStyles.leftViewStyle}>
                                    <View style={ApplicationCommonStyles.leftTitleView}>
                                        <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>报销原因</Text>
                                        <Text style={{color: 'red', marginLeft: 5}}>*</Text>
                                    </View>
                                </View>
                            </View>
                            <View>
                                <Cells>
                                    <Cell>
                                        <CellBody style={{marginTop:Platform.OS == 'ios'?0:-20,}}>
                                            <TextArea
                                                style={{fontSize:14,color:'#5c5c5c'}}
                                                placeholder="(必填)140字以内"
                                                placeholderTextColor="#b9b8b8"
                                                value={this.state.BXREASON}
                                                onChange={this.yychange.bind(this)}
                                                underlineColorAndroid="transparent"
                                                maxLength={140}
                                            />
                                        </CellBody>
                                    </Cell>
                                </Cells>
                            </View>
                        </View>
                    }
                    {this.state.noEditPower?
                        <View style={[ApplicationCommonStyles.cellContainer,{marginTop:10}]}>
                            <View style={ApplicationCommonStyles.leftViewStyle}>
                                <View style={ApplicationCommonStyles.leftTitleView}>
                                    <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>报销人</Text>
                                    <Text style={{color: 'red', marginLeft: 5}}>*</Text>
                                </View>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.BXPERSON}</Text>
                            </View>
                        </View>:
                        <TouchableOpacity onPress={()=>this._showModal('bxr')}>
                        <View style={[ApplicationCommonStyles.cellContainer,{marginTop:10}]}>
                            <View style={ApplicationCommonStyles.leftViewStyle}>
                                <View style={ApplicationCommonStyles.leftTitleView}>
                                    <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>报销人</Text>
                                    <Text style={{color: 'red', marginLeft: 5}}>*</Text>
                                </View>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.BXPERSON}</Text>
                            </View>
                            <View style={ApplicationCommonStyles.rightViewStyle}>
                                <Image source={require('../../../../../img/rarrow.png')} style={{width:8, height:13, marginRight:8, marginLeft:5}} />
                            </View>
                        </View>
                        </TouchableOpacity>}
                    {this.state.noEditPower?
                        <View style={ApplicationCommonStyles.cellContainer}>
                            <View style={ApplicationCommonStyles.leftViewStyle}>
                                <View style={ApplicationCommonStyles.leftTitleView}>
                                    <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>报销部门</Text>
                                </View>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.BXDEPARTMENT}</Text>
                            </View>
                        </View>:
                        <View style={ApplicationCommonStyles.cellContainer}>
                            <View style={ApplicationCommonStyles.leftViewStyle}>
                                <View style={ApplicationCommonStyles.leftTitleView}>
                                    <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>报销部门</Text>
                                </View>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.BXDEPARTMENT}</Text>
                            </View>
                        </View>
                    }
                    {this.state.noEditPower?
                        <View style={ApplicationCommonStyles.cellContainer}>
                            <View style={ApplicationCommonStyles.leftViewStyle}>
                                <View style={ApplicationCommonStyles.leftTitleView}>
                                    <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>报销日期</Text>
                                    <Text style={{color: 'red', marginLeft: 5}}>*</Text>
                                </View>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.DateTime}</Text>
                            </View>
                        </View>:
                        <View style={ApplicationCommonStyles.cellContainer}>
                            <View style={ApplicationCommonStyles.leftViewStyle}>
                                <View style={ApplicationCommonStyles.leftTitleView}>
                                    <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>报销日期</Text>
                                    <Text style={{color: 'red', marginLeft: 5}}>*</Text>
                                </View>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.DateTime}</Text>
                            </View>
                        </View>}

                    <View style={ApplicationCommonStyles.cellContainer}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <Text style={ApplicationCommonStyles.leftTitleStyle}>报销明细</Text>
                            <Text style={{color: 'red', marginLeft: 5}}>*</Text>
                        </View>
                    </View>
                    {this.state.noEditPower?null:
                            <TouchableOpacity onPress={()=>this.addBXDetail()}>
                                <View style={[ApplicationCommonStyles.cellContainer,{justifyContent:'flex-start',}]}>
                                    <Image source={require('../../../../../img/adddetail.png')} style={{height:34,width:34,marginLeft:10}} />
                                    <Text style={{fontSize:14,color:'#b9b8b8',}}>添加明细</Text>
                                </View>
                            </TouchableOpacity>
                        }
                    <ListView
                        dataSource={this.state.dataSource1}
                        renderRow={this.renderRow1.bind(this)}
                        style={styles.listView}
                        enableEmptySections={true}
                        removeClippedSubviews={false}
                    />
                    <View style={ApplicationCommonStyles.cellContainer}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <Text style={ApplicationCommonStyles.leftTitleStyle}>发票明细</Text>
                        </View>
                    </View>
                    {this.state.noEditPower?null:
                        <TouchableOpacity onPress={()=>this.addFPDetail()}>
                            <View style={[ApplicationCommonStyles.cellContainer,{justifyContent:'flex-start',}]}>
                                <Image source={require('../../../../../img/adddetail.png')} style={{height:34,width:34,marginLeft:10}} />
                                <Text style={{fontSize:14,color:'#b9b8b8',}}>添加明细</Text>
                            </View>
                        </TouchableOpacity>
                    }
                    <ListView
                        dataSource={this.state.dataSource2}
                        renderRow={this.renderRow2.bind(this)}
                        style={styles.listView}
                        enableEmptySections={true}
                        removeClippedSubviews={false}
                    />
                    <View style={ApplicationCommonStyles.cellContainer}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <Text style={ApplicationCommonStyles.leftTitleStyle}>发票电子版</Text>
                        </View>
                    </View>
                    {this.state.noEditPower?null:
                        <TouchableOpacity onPress={()=>this.addFPPic()}>
                            <View style={[ApplicationCommonStyles.cellContainer,{justifyContent:'flex-start',}]}>
                                <Image source={require('../../../../../img/adddetail.png')} style={{height:34,width:34,marginLeft:10}} />
                                <Text style={{fontSize:14,color:'#b9b8b8'}}>添加电子版</Text>
                            </View>
                        </TouchableOpacity>
                    }
                    <ScrollView>
                        <View style={styles.FPContainer}>
                            {this.state.images ? this.state.images.map(i => <View key={i.uri2}>{this.renderAsset(i)}</View>) : null}
                        </View>
                    </ScrollView>
                    <View>{this.fileData()}</View>
                </ScrollView>
                </View>
                </View>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',height:60,backgroundColor:'#fff'}}>
                    <View style={ApplicationCommonStyles.leftViewStyle}>
                        <Text style={{fontSize:20,marginLeft:10,color:'#50B1F8',}}>￥:{this.state.SUMMONEY}</Text>
                    </View>
                    {this.state.submitPower?
                        <TouchableOpacity onPress={()=>this.submit()} style={ApplicationCommonStyles.btn_container}>
                            <View style={ApplicationCommonStyles.rightViewStyle}>
                                <Text style={{color:'white',fontSize:16}}>提交送审</Text>
                            </View>
                        </TouchableOpacity>:
                        <View style={ApplicationCommonStyles.btnGrycontainer}>
                            <Text style={{color:'white',fontSize:16}}>提交送审</Text>
                        </View>}
                </View>
                <Modal visible={this.state.visibleModal}>
                    <View style={styles.modalContainer}>
                    {this._renderModalContent()}
                    </View>
                    <TouchableOpacity
                        style={[styles.button, styles.close]}
                        underlayColor="#aaa"
                        onPress={this.closeModal.bind(this)}
                     >
                    <Image source={require('../../../../../img/X.png')} style={{height:40,width:40,}} />
                    </TouchableOpacity>
                </Modal>
                <Modal visible={this.state.imageView}>
                       <View style={{
                            backgroundColor: 'rgba(0, 0, 0, 0)',
                            alignItems: 'center',
                            justifyContent: 'center',

                    }}>
                    <ImageViewer onClick={this.closeImageViewer.bind(this)} imageUrls={imagesUrlTest} style={{width:ViewUtil.screenW , height: 200,}}/>
                    </View>
                </Modal>
                <Spinner visible={this.state.visible} overlayColor={'rgba(0, 0, 0, 0.2)'}
                         textContent={this.state.tip} textStyle={{color: 'white'}}/>
            </View>
        )
    };
    /*****************渲染明细行*****************/
    renderRow1(data,i,row){//报销明细行
         if(this.state.noEditPower==true){
            return(
                <TouchableOpacity onPress={()=>this.onPressDetail(data,row)}>
                <View key={data.cguid}>
                    <View numberOfLines={1} style={styles.CellStyle}>
                        <Text style={styles.LeftTextStyle}>{data.FYTYPE}</Text>
                        <Text style={styles.RightTextStyle}>￥{data.BXMoney}</Text>
                    </View>
                </View>
                </TouchableOpacity>
            )
        }else{
            return(
                <Swipeable
                    rightButtons={[
                        <TouchableOpacity onPress={()=>this.deleteRow(data,row)} style={[styles.rightSwipeItem, {backgroundColor: '#e4393c'}]}>
                          <Text style={{color:'#fff'}}>删除</Text>
                        </TouchableOpacity>
                    ]}>
                    <TouchableOpacity onPress={()=>this.onPressDetail(data,row)}>
                    <View key={data.cguid}>
                        <View numberOfLines={1} style={styles.CellStyle}>
                            <Text style={styles.LeftTextStyle}>{data.FYTYPE}</Text>
                            <Text style={styles.RightTextStyle}>￥{data.BXMoney}</Text>
                        </View>
                    </View>
                    </TouchableOpacity>
                </Swipeable>
            )
        }

    };
    renderRow2(data,i,row){//发票明细行
        if(this.state.noEditPower==true){
            return(
                <TouchableOpacity onPress={()=>this.onPressFPDetail(data,row)}>
                <View key={data.cguid}>
                    <View numberOfLines={1} style={styles.CellStyle}>
                        <Text style={styles.LeftTextStyle}>发票金额</Text>
                        <Text style={styles.RightTextStyle}>￥{data.FPSUM}</Text>
                    </View>
                </View>
                </TouchableOpacity>
            )
        }else{
            return(
                <Swipeable
                    rightButtons={[
                        <TouchableOpacity onPress={()=>this.deleteRow2(data,row)} style={[styles.rightSwipeItem, {backgroundColor: '#e4393c'}]}>
                          <Text style={{color:'#fff'}}>删除</Text>
                        </TouchableOpacity>
                    ]}>
                    <TouchableOpacity onPress={()=>this.onPressFPDetail(data,row)}>
                    <View key={data.cguid}>
                        <View numberOfLines={1} style={styles.CellStyle}>
                            <Text style={styles.LeftTextStyle}>发票金额</Text>
                            <Text style={styles.RightTextStyle}>￥{data.FPSUM}</Text>
                        </View>
                    </View>
                     </TouchableOpacity>
                </Swipeable>
            )
        }

    };
    /*****************添加明细*****************/
    addBXDetail= () => {//添加报销明细
        let _that=this;
        let passPropsId=_that.state.radio;
        _that.props.navigator.push({
            name : 'AddBXDetail',
            component : AddBXDetail,
            params: {
                passProps:{passPropsId},
                //接收子页面用户选择的项目执行的回掉函数
                getBXListData: function (listData) {
                    console.log('接收传递的数据:'+listData);
                    _that.BXDETAILLIST.push(listData);
                    //计算总金额
                    let sum=0;
                    for(let i in this.BXDETAILLIST){
                        sum+=parseFloat(this.BXDETAILLIST[i].BXMoney);
                    }
                    let num = new Number(sum);
                    let number=num.toFixed(2);
                    _that.setState({
                        SUMMONEY:number,
                        submitPower:false,
                        dataSource1: _that.state.dataSource1.cloneWithRows(_that.BXDETAILLIST),
                    });
                }.bind(_that),
            }
        });
    };
    addFPDetail= () => {//添加发票明细
        let _that=this;
        _that.props.navigator.push({
            name : 'AddFPDetail',
            component : AddFPDetail,
            params: {
                getFPListData: function (listData) {
                    _that.FPDETAILLIST.push(listData);
                    _that.setState({
                        dataSource2: _that.state.dataSource1.cloneWithRows(_that.FPDETAILLIST),
                    });
                }.bind(_that),
            }
        });
    };
     /*****************添加发票电子版*****************/
    addFPPic() {
        ImagePicker.openPicker({
          multiple: true,
          width: 300,
          height: 300,
          compressImageQuality: 0.5,
        }).then(images => {
            console.log('&&&&&&&&&&&&&&&&&&&&');
            console.log(images);
            for (var i=0;i<images.length;i++) {
                  let current = images[i].path;
                  console.log('length'+temp.length);
                  if(temp.length != 0){
                    let flag = true;
                        for(var j = 0; j < temp.length;j++){
                            if(temp[j] == current){
                                flag = flag && false;
                                console.log('flg----------------------'+flag)
                            }
                        }
                        if(flag == false)
                            break;
                    }
                    dataToPost.push({
                            uri: images[i].path,
                            width: images[i].width,
                            height: images[i].height,
                            mime: images[i].mime,
                            uri2:new Date()+images[i].path,

                        });
                        imagesUrlTest.push({'url':images[i].path},);
                         temp.push(current);
                         console.log(temp);
                  }
            this.setState({
                images: dataToPost
            });
        }).catch();
    }
    renderImage(image) {
        return (
            <TouchableOpacity onPress={()=>this.imageView(image)}>
                <Image style={{width: 80, height: 80, resizeMode: 'contain',marginLeft:5,marginTop:5}} source={image} />
            </TouchableOpacity>
        )
    }
    imageView=(image)=>{this.setState({imageView:true,}); }
    renderAsset(image) {return this.renderImage(image);}
    /*****************编辑明细行*****************/
    onPressDetail=(data,row)=>{//编辑报销明细行
        if(this.state.noEditPower==true){
            this.props.navigator.push({
                name : 'CheckBXDetail',
                component : CheckBXDetail,
                params: {
                    passListData:data,
                }
            });
        }else{
            let _that=this;
            let passPropsId=this.state.radio;
            this.props.navigator.push({
                name : 'AddBXDetail',
                component : AddBXDetail,
                params: {
                    passProps:{passPropsId},
                    passListData:data,
                    ID:row,
                    refreshBXListData: function (data,id) {
                         /**
                         * 编辑修改报销明细列表返回更新数据源数组
                         * 重新计算总金额
                         */
                        _that.BXDETAILLIST[id]=data;
                        let sum=0;
                        for(let i in this.BXDETAILLIST){
                            sum+=parseFloat(this.BXDETAILLIST[i].BXMoney);
                        };
                        let num = new Number(sum);
                        let number=num.toFixed(2);
                        _that.setState({
                            SUMMONEY:number,
                            submitPower:false,
                            dataSource1: new ListView.DataSource({
                                rowHasChanged: (row1, row2) => row1 !== row2,}).cloneWithRows(this.BXDETAILLIST),
                        });
                    }.bind(_that),

                }
            });
        }
    }
    onPressFPDetail=(data,row)=>{//编辑报销明细行
        if(this.state.noEditPower==true){
            this.props.navigator.push({
                name : 'CheckFPDetail',
                component : CheckFPDetail,
                params: {
                    passListData:data,
                }
            });
        }else{
            let _that=this;
            this.props.navigator.push({
                name : 'AddFPDetail',
                component : AddFPDetail,
                params: {
                    passListData:data,
                    ID:row,
                    refreshFPListData: function (data,id) {
                        _that.FPDETAILLIST[id]=data;
                        _that.setState({
                            submitPower:false,
                            dataSource2: new ListView.DataSource({
                                rowHasChanged: (row1, row2) => row1 !== row2,}).cloneWithRows(this.FPDETAILLIST),
                        });
                    }.bind(_that),

                }
            });
        }
    }
     /*****************左滑删除明细行*****************/
    deleteRow=(data,row)=>{//根据下标行删除报销明细
        let _that=this;
        UtilFun.ArrRemoveAt(_that.BXDETAILLIST,row);
        let sum=0;
        for(let i in this.BXDETAILLIST){
            sum+=parseFloat(this.BXDETAILLIST[i].BXMoney);
        }
        let num = new Number(sum);
        let number=num.toFixed(2);
        this.setState({
            SUMMONEY:number,
            submitPower:false,
            dataSource1: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }).cloneWithRows(this.BXDETAILLIST),
        });
    };
    deleteRow2=(data,row)=>{//根据下标行删除发票明细
        let _that=this;
        UtilFun.ArrRemoveAt(_that.FPDETAILLIST,row);
        this.setState({
            submitPower:false,
            dataSource2: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }).cloneWithRows(this.FPDETAILLIST),
        });
    };
    /*****************保存单据*****************/
    _saveAction= () => {
        if(this.state.saveAllTime==true){
             ToastUtil.show('单据已保存！');
             return;
        }
        console.log('报销');
        console.log(this.state.BXREASON);
        let str=UtilFun.trimStr(this.state.BXREASON);
        console.log('==============');
        console.log(str);
        this.setState({BXREASON:str},()=>{
            if(str.length==0){//报销原因不能为空
                this.setState({BXREASON:''});
                ToastUtil.show('请输入报销原因');
            }else if(this.BXDETAILLIST.length==0){//报销明细不能为空
                ToastUtil.show('请添加报销明细信息');
            }else{
                console.log('---------------------');
                console.log(this.state.BXREASON);
                let arr1=[];
                if(this.state.callType=='Modify'){//修改时主表数据多传递一个时间戳:sjc
                    arr1.push({'main':{
                                   "cguid":this.state.cguid,
                                   "ywlx":this.state.radio,
                                   "bxyy":this.state.BXREASON,
                                   "currDeptId":this.state.BXDEPARTMENTID,
                                   "currEmpId":this.state.BXPERSONID,
                                   "summoney":this.state.SUMMONEY,
                                   "xmid":this.state.XMTYPEID,
                                   "bxrq":this.DateTime,
                                   "sjc":this.state.sjc,
                                   "ccode":this.state.ccode,
                                   "zt":this.state.zt,
                                 },
                          'bxmxdata':this.BXDETAILLIST,
                          'fpmxdata':this.FPDETAILLIST,
                          'filedata':this.filecguid,
                      });
                }else{
                    arr1.push({'main':{
                                   "cguid":this.state.cguid,
                                   "ywlx":this.state.radio,
                                   "bxyy":this.state.BXREASON,
                                   "currDeptId":this.state.BXDEPARTMENTID,
                                   "currEmpId":this.state.BXPERSONID,
                                   "summoney":this.state.SUMMONEY,
                                   "xmid":this.state.XMTYPEID,
                                   "bxrq":this.DateTime,
                                   "ccode":this.state.ccode,
                                   "zt":this.state.zt,
                                 },
                          'bxmxdata':this.BXDETAILLIST,
                          'fpmxdata':this.FPDETAILLIST,
                      });
                }
                console.log('保存的数据');
                console.log(arr1);
                let str=JSON.stringify(arr1); //将数据转为字符串
                let url=Service.host+'mobile_em_expenseAccountBill'+'&action=save'+'&alldata='+str;
                HttpUtil.get(url,this)
                    .then((responseData) => {
                        console.log('保存返回的数据');
                        console.log(responseData);
                        if(responseData.msg=='保存成功!'){//保存成功页面变为不可编辑状态，后台返回该单据的id值
                             this.setState({
                                noEditPower:true,
                                saveSuccess:true,
                                saveAllTime:true,
                                cguid:responseData.cguid,
                                ccode:responseData.ccode,
                                sjc:responseData.ctimestamp,
                                zt:responseData.cstatusenumguid,
                            });
                            if(responseData.cstatusenumguid=='revise'){
                                this.setState({submitPower:true,})
                            }else if(responseData.cstatusenumguid=='saved'){
                                if(responseData.ccheckway=='2'){
                                    this.setState({submitPower:true,})
                                }else{
                                    this.setState({submitPower:false,});
                                }
                            }else{
                                this.setState({submitPower:false,});
                            }
                            if(this.state.images.length==0){
                                ToastUtil.show('保存成功！');
                            }else{
                                this.uploadPic();
                            }

                        }else if(responseData.errmsg){
                            this.setState({
                                commonAlertMsg:responseData.errmsg,
                                commonAlert:true,
                            });
                        }
                    })
                    .catch((error) => {
                    });
            }
        });

    };
     /*****************图片上传*****************/
    uploadPic(){
        let formData = new FormData();
            formData.append('cGroupGuid', this.state.cguid);
            formData.append('userGuid', this.state.userGuid);
            formData.append('accountId', Service.accountId);
        for(let i in this.state.images){
            let uri = this.state.images[i].uri;
            let index = uri.lastIndexOf("\:");
            let name  = uri.substring(index + 1, uri.length);
            let file = {uri: uri, type: 'multipart/form-data', name: name } ;
            formData.append('file', file);
        }
        console.log(formData);
        let str1 = Service.host.split("/pt")[0];;
        console.log(str1);
        //'http://192.168.35.166:8891/A6/ExpenseAccountBillUploadFile'
        fetch(str1+'/ExpenseAccountBillUploadFile',20000,{
            method:'POST',
            headers:{
                'Content-Type':'multipart/form-data',
            },
            body:formData,
        }).then((response) => response.json()).then((responseJson) => {
            console.log(responseJson);
            if(responseJson.msg=='success'){
                 ToastUtil.show('保存成功！');
            }
        }).catch((error) => {})
          .done();;
    }
    /*****************删除单据*****************/
    delete = () => {
        this.setState({
            deleteAlert:false,
        });
        let url=Service.host+'mobile_em_expenseAccountBill'+'&action=delete&cguid='+this.state.cguid;
        HttpUtil.get(url,this)
            .then((responseData) => {
                if(responseData.msg=='删除成功!'){
                    ToastUtil.show('删除成功');
                    this.goBack();
                }else if(responseData.errmsg){
                    this.setState({
                        commonAlertMsg:responseData.errmsg,
                        commonAlert:true,
                    });
                }
            })
            .catch((error) => {});
    };
     /*****************提交送审*****************/
    submit= () => {
        let url=Service.host+'mobile_em_expenseAccountBill'+'&action=submitChoose'+'&cguid='+this.state.cguid
                            +'&ctimestamp='+this.state.sjc+'&ccode='+this.state.ccode+'&iTotalAMT='+this.state.SUMMONEY;
        this.setState({visible:true,tip:'提交送审中...'});
        HttpUtil.get(url,this)
            .then((responseData) => {
                console.log('========================');
                console.log(responseData);
                this.setState({visible:false});
                if(responseData.msg){
                   this.setState({
                        noEditPower:true,
                        submitPower:false,
                        saveSuccess:true,
                    });
                   ToastUtil.show('提交送审成功');
                   this.goBack();
                }else if(responseData.errmsg){
                    this.setState({
                        commonAlertMsg:responseData.errmsg,
                        commonAlert:true,
                    });
                }else if(responseData.chooseList){
                    if(responseData.chooseList.length>1){
                        for(let i in responseData.chooseList){
                            this.state.SSDATA.push({
                                value: responseData.chooseList[i]['processCode'],
                                label: responseData.chooseList[i]['processName']
                            });
                        }
                        this._showModal('tjss');
                    }else if(responseData.chooseList.length==1){
                        this.setState({
                            SSCODE:responseData.chooseList[0]['processCode'],
                        });
                        this.goOnSubmit();
                    }
                }
            })
            .catch((error) => {
                this.setState({visible:false});
            });
    };
    handleRadioSSChange(value){
        this.setState({
            SSCODE:value,
            visibleModal:false,
        },()=>{
            this.goOnSubmit();
        });
    }
    //提交送审modal
    goOnSubmit= () => {
        let url=Service.host+'mobile_em_expenseAccountBill'+'&action=submit'+'&cguid='+this.state.cguid+'&processCode='+this.state.SSCODE
                            +'&ctimestamp='+this.state.sjc+'&ccode='+this.state.ccode+'&iTotalAMT='+this.state.SUMMONEY;
        HttpUtil.get(url,this)
                .then((responseData) => {//console.log('流程送审返回的数据');
                    //console.log(responseData);
                    this.setState({visible:false});
                    if(responseData.msg=='提交送审成功!'){
                        this.setState({
                            noEditPower:true,
                            submitPower:false,
                            saveSuccess:true,
                        });
                        ToastUtil.show('提交送审成功');
                        this.goBack();
                    }
                })
                .catch((error) => {});
    }
    goBack(){
        setTimeout(function(){
            this.props.callRefreshFun();
            this.props.navigator.pop();
        }.bind(this),1000);
    };
}

const styles = StyleSheet.create({
    //单行样式
    CellStyle:{
        width:ViewUtil.screenW-5,
        height:60,
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor:'white',
        alignItems:'center',
        borderBottomColor:'#e8e8e8',
        borderBottomWidth:0.5,
        marginTop:5,
        marginLeft:5,
    },
    //一般单行布局
    LeftTextStyle:{
        marginLeft:15,
        fontSize:14,
        color:'#999',
    },
    RightTextStyle:{
        marginRight:8,
        fontSize:14,
        color:'#50B1F8',
    },
    rightSwipeItem: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 20,
        marginTop:5,
    },
    //发票
    FPContainer:{
        // alignItems: 'center',
        // flexDirection: 'row',
        flexDirection:'row',
        flexWrap:'wrap',
        alignItems:'flex-start',
    },
    TitleStyle:{
        justifyContent:'center',
        height:40,
    },
    Title:{
        marginLeft:8,
        fontSize:13,
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
        marginRight:20,
    },
    modalContentStyle:{
        backgroundColor: 'white',
        padding: 22,
        height:300,
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    modalTitleStyle:{
        paddingBottom:15,
        marginLeft:10,
        marginRight:10,
    },
    modalRowStyle:{
        justifyContent:'center',
        height:50,
        borderBottomColor:'#e8e8e8',
        borderBottomWidth:1,
        marginLeft:10,
        marginRight:10,
    },
    modalContainer: {
        height: 300,
        width: ViewUtil.screenW*0.8,
        backgroundColor: '#fff',
        borderRadius: 5,
    },
    close: {
        position: 'absolute',
        bottom: 80,
        left:ViewUtil.screenW*0.8/2+20,
    },
});
