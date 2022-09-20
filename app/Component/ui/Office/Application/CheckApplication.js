/**
 * Created by John on 2017-8-2.
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
    TouchableWithoutFeedback,
    ListView,
    Linking,
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
import Modal from 'react-native-modal';
import Toast from 'react-native-root-toast';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Spinner from "react-native-loading-spinner-overlay";
import "../../../../constant/Storage";
import Util from "../../../../Util/Util";
import CommonStyles from '../../../../style/CommonStyle';
import ApplicationCommonStyles from './ApplicationCommonStyle';
import ViewUtil from '../../common/ViewUtil';
import HttpUtil from '../../common/HttpUtil';
import EmojiUtil from "../../common/EmojiUtil";
import Service from '../../service';
import TopBar from '../../APPComponent/TopBar';
import NavigationBar from '../../APPComponent/NavigationBar';
import CheckBXDetail from './CheckBXDetail';
import CheckFPDetail from './CheckFPDetail';
import FlowJournal from './FlowJournal';

export default class CheckApplication extends Component {
    constructor(props){
        super(props);
        //报销明细列表数据
        this.BXDETAILLIST=[];
        //发票明细列表数据
        this.FPDETAILLIST=[];   
        this.state={
            dataSource1: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            dataSource2: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
        	type:this.props.callType,
            item: this.props.passProps.item,
            BXYY:'',        //报销原因
			BXR:'',			//报销人
			BXRBM:'',		//报销人部门
			BXRQ:'',		//报销日期
            fileData:null,
        }
    };
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    };
    componentDidMount(){
        console.log(this.state.type);
        this.getData();
    }
     getData(){
        let url=Service.host+'mobile_em_expenseAccountBill'+'&action=load'+'&cguid='+this.state.item.hidden_cguid+'&spzt=spz';
        console.log('修改:'+url);
        HttpUtil.get(url,this)
            .then((responseData) => {
                if(this.state.type=='wtjck'){
                    Toast.show('您只能对单据进行查看', {
                        duration: Toast.durations.SHORT,
                        position: ViewUtil.screenH-130,
                        shadow: true,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        animation: true,
                        hideOnPress: true,
                        delay: 0,
                    });
                }
                console.log('获取后台返回的该单据的信息');
                console.log(responseData);
                this.setState({
                    BXYY:responseData.main.bxyy,           //报销原因
                    BXR:responseData.main.bxrname,         //报销人
                    BXRBM:responseData.main.bxrbmname,     //报销人部门
                    BXRQ:responseData.main.bxrq,           //报销日期

                    fileData: responseData.fileList,       //单据附件
                });
                for (let i in responseData.bxmxList) {
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
                for (let i in responseData.fpmxList) {
                    let map = {};
                        map['fpguid']=responseData.fpmxList[i].cguid;
                        map['FPDM']=responseData.fpmxList[i].fpdm;
                        map['FPHM']=responseData.fpmxList[i].fphm;
                        map['BZ']=responseData.fpmxList[i].bz;
                        map['FPSUM']=responseData.fpmxList[i].fpje;
                    this.FPDETAILLIST.push(map);     
                }
                console.log(this.FPDETAILLIST);
                this.setState({
                    dataSource1: new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,}).cloneWithRows(this.BXDETAILLIST),
                    dataSource2: new ListView.DataSource({
                        rowHasChanged: (row1, row2) => row1 !== row2,}).cloneWithRows(this.FPDETAILLIST),
                });

            })
            .catch((error) => {});
    }
    render(){
    	let buttonType;
    	let titleBar;
    	if(this.state.type=='spz'){
    		titleBar=
    			<NavigationBar
                    leftAction={this.onPressBack.bind(this)}
                    leftImage={require('../../../../../img/back.png')}
                    title="审批中报销明细" 
                />;
    	}else{
    		titleBar=
    			<NavigationBar
                    leftAction={this.onPressBack.bind(this)}
                    leftImage={require('../../../../../img/back.png')}
                    title="已完成报销明细" 
                />;
    	}
        return(
            <View style={CommonStyles.CommonWrapContainer}>
            	{titleBar}
                
                <View style={{height:ViewUtil.screenH-95,}}>
                <ScrollView>
                    <View style={ApplicationCommonStyles.cellyyContainer}>
                            <View style={ApplicationCommonStyles.leftViewStyle}>
                                <View style={ApplicationCommonStyles.leftTitleView}>
                                    <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>报销原因</Text>
                                </View>
                                <View style={{width:ViewUtil.screenW-110,marginLeft:15,}}>
                                    <Text>{this.state.BXYY}</Text>
                                </View>
                            </View>
                            
                        </View>
                    <View style={ApplicationCommonStyles.cellContainer}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>报销人</Text>
                            </View>
                            <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.BXR}</Text>
                        </View>
                    </View>
                    <View style={ApplicationCommonStyles.cellContainer}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>报销人部门</Text>
                            </View>
                            <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.BXRBM}</Text>
                        </View>
                    </View>
                    <View style={ApplicationCommonStyles.cellContainer}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>报销日期</Text>
                            </View>
                            <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.BXRQ}</Text>
                        </View>
                    </View>
                 	<View style={ApplicationCommonStyles.cellContainer}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#5c5c5c',}]}>报销明细</Text>
                        </View>                                                     
                    </View> 

                   <ListView
                        dataSource={this.state.dataSource1}
                        renderRow={this.renderRow1.bind(this)}
                        style={styles.listView}
                        enableEmptySections={true}
                        removeClippedSubviews={false}
                    />
                    <View style={ApplicationCommonStyles.cellContainer}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#5c5c5c',}]}>发票明细</Text>
                        </View>                                                     
                    </View>           
                    <ListView
                        dataSource={this.state.dataSource2}
                        renderRow={this.renderRow2.bind(this)}
                        style={styles.listView}
                        enableEmptySections={true}
                        removeClippedSubviews={false}
                    /> 
                    <View>{this.fileData()}</View>
                </ScrollView>
                </View>
                <View style={styles.btnContainerStyle}>
                    <TouchableOpacity onPress={this.showFlowJournal.bind(this)} style={styles.noFlowBtnStyle} >
                        <Text style={{color:'white',fontSize:18}}>流程日志</Text>
                    </TouchableOpacity>
                </View>
                <Spinner visible={this.state.visible} overlayColor={'rgba(0, 0, 0, 0.2)'}
                         textContent={this.state.tip} textStyle={{color: 'white'}}/>
            </View>
        )
    };
     //渲染明细行
    renderRow1(data,i,row){
        return(
            <TouchableOpacity onPress={()=>this.onPressBXDetail(data,row)}>
            <View key={data.cguid}>
                <View numberOfLines={1} style={styles.CellStyle}>
                    <Text style={styles.LeftTextStyle}>{data.FYTYPE}</Text>
                    <Text style={styles.RightTextStyle}>￥{data.BXMoney}</Text>
                </View>
            </View>
            </TouchableOpacity>
        )
    };
    renderRow2(data,i,row){
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
            <View key={i} style={{flexDirection: 'row',height:80,backgroundColor:'#fff',alignItems: 'center',}}>
                <Image source={require('../../../../../img/filelogo.png')} style={{height:60,width:64,marginLeft:10,}} />
                <View style={{paddingRight:60}}>
                    <Text style={{paddingLeft:10,paddingRight:20}}>{fileName}</Text>
                    <View style={{flexDirection:'row',}}>
                    <TouchableOpacity  onPress={(e) => this.onPressFile(e,file)} style={styles.fileBtn}>
                        <Text numberOfLines={1} style={{color:'#fff'}}>下载</Text>
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
            fileData:_that.state.fileData,
        });
    }
    onPressCancel(){
        alert('撤销');
    };
    onPressBXDetail=(data,row)=>{
        this.props.navigator.push({
            name : 'CheckBXDetail',
            component : CheckBXDetail,
            params: {
                passListData:data,
            }
        });
    };
    onPressFPDetail=(data,row)=>{
        this.props.navigator.push({
            name : 'CheckFPDetail',
            component : CheckFPDetail,
            params: {
                passListData:data,
            }
        });
    };
    showFlowJournal(){
        this.props.navigator.push({
            name : 'FlowJournal',
            component : FlowJournal,
            params: {
                list:this.state.item,
            }
        });
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
        fontSize:13,
        color:'#666',
    },
    RightTextStyle:{
        marginRight:8,
        fontSize:13,
        color:'#50B1F8',
    },
    rightSwipeItem: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 20,
        marginTop:5,
    },
    LeftTextStyle:{
        fontSize:13,
        marginLeft:12,
        color:'#b9b8b8',
    },
    RightTextStyle:{
        marginRight:20,
        fontSize:13,
        color:'#50B1F8',
    },
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
    footBarTextStyle:{
        color:'#fff',
        fontSize:16,
    },
    btnContainerStyle:{
        flexDirection:'row',
        height:40,
        backgroundColor:'#50B1F8',
        justifyContent:'center',
        alignItems:'center',
    },
    noFlowBtnStyle:{
        height:40,
        backgroundColor:'#50B1F8',
        justifyContent:'center',
        alignItems:'center',
        width:ViewUtil.screenW,
        paddingTop:-20,
    },
    //单据附件
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

});