import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ListView,
    Platform,
    ScrollView,
    Image,
    Alert,
    TextInput,
    AsyncStorage,
    Linking,
    NetInfo,
    BackAndroid,
    TouchableHighlight,
    } from 'react-native';
import {
    Cells,
    CellsTitle,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
    Input,
    Label,
    TextArea,
    RadioCells,
    CheckboxCells,
    ButtonArea,
    Button,
    Dialog,
} from 'rn-weui/src';
import Toast from 'react-native-root-toast';
import Modal from 'react-native-root-modal';
import Spinner from "react-native-loading-spinner-overlay";
import TimerMixin from "react-timer-mixin";
import Service from '../../service';
import FlowJournal from './FlowJournal';
import CatchError from '../../CatchError';
import CommonStyles from '../../../../style/CommonStyle';
import HttpUtil from '../../common/HttpUtil';
import TopBar from '../../APPComponent/TopBar';
import CommonModal from "../../APPComponent/CommonModal";
import ViewUtil from '../../common/ViewUtil';
import NavigationBar from "../../APPComponent/NavigationBar";
var Dimensions = require('Dimensions');
/*导入json数据*/
var DetailType = require('../../Message/DaibanMessage/OrderDetailType.json');
var screenW = Dimensions.get('window').width;
export default class DoneMessageListDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //公用
            list: this.props.passProps.list,  
            dataSourceD:null,                
            fileData:null,
            dataSource1: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            dataSource2: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            //下载权限
            noRight:false,
            //公共弹出框
            commonAlert1:false,
            commonAlertMsg:'',
            visible:false,
        };
        this.hideAlertDialog1 = this.hideAlertDialog1.bind(this);
    };
    //公共的弹出层窗口不跳转
    hideAlertDialog1() {
        this.setState({
            commonAlert1: false,
        });
    };
    componentDidMount(){
        BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid);
        this.timer = TimerMixin.setTimeout(() => {
            this.fetchData();
        }, 500);
        this.setState({visible:true,tip:'数据加载中...'});
    };
    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
        this.timer && TimerMixin.clearTimeout(this.timer);
    };
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            this.props.refreshDoneList();
            navigator.pop()
        }
    };
    onBackAndroid=()=>{
        if (this.props.navigator) {
            this.props.refreshDoneList();
            this.props.navigator.pop();
            return true;
        }
    };
    fetchData() {
        var url=Service.host+Service.ybDetail
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&cguid='+this.state.list.hidden_cguid+'&tokenID='+Service.tokenID;
        console.log("已办详情"+url);
        HttpUtil.get(url,this)
                .then((responseData) => {
                    console.log("已办详情返回值"+JSON.stringify(responseData));
                    this.setState({visible:false});
                    if(responseData.hasfiledown){
                        this.setState({
                            noRight:true,
                        });
                    }
                    if(responseData.detail==null){
                        this.setState({
                            dataSource1: this.state.dataSource1.cloneWithRows(responseData.main),
                            fileData:responseData.file,
                        });
                    }else{
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

    render() {
        return (
           <View style={CommonStyles.CommonWrapContainer}>
               <NavigationBar
                   leftAction={this.onPressBack}
                   leftImage={require('../../../../../img/back.png')}
                   title={this.state.list.title}/>
                <ScrollView>
                    <View >
                        <View >
                            <View style={styles.mainCellContainer}>
                                <View style={styles.TitleStyle}>
                                    <Text style={styles.Title}>主要信息</Text>
                                </View>
                                 <ListView
                                    dataSource={this.state.dataSource1}
                                    renderRow={this.renderTable.bind(this)}
                                    removeClippedSubviews={false}
                                    style={styles.listView}
                                />
                                <View >
                                   {this.isHiddenTextDetail()}
                                </View>
                                <ListView
                                    dataSource={this.state.dataSource2}
                                    renderRow={this.renderTable2.bind(this)}
                                    removeClippedSubviews={false}
                                    style={styles.listView}
                                />
                                <CommonModal
                                    visible={this.state.commonAlert1}
                                    message={this.state.commonAlertMsg}
                                    sureTitle='确定'
                                    sureAction={this.hideAlertDialog1.bind(this)}
                                    />
                            </View>
                        </View>                         
                    </View>
                    <View>{this.fileData()}</View>
                    <Spinner visible={this.state.visible} overlayColor={'rgba(0, 0, 0, 0.2)'}
                         textContent={this.state.tip} textStyle={{color: 'white'}}/> 
                </ScrollView>
                <View style={styles.btnContainerStyle}>
                    <TouchableOpacity onPress={this.showFlowJournal.bind(this)} style={styles.noFlowBtnStyle} >
                        <Text style={{color:'white',fontSize:18}}>流程日志</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };
    showFlowJournal(){
        this.props.navigator.push({
            name : 'FlowJournal',
            component : FlowJournal,
            params:{
                list:this.state.list,
            }
        })   
    };
    isHiddenTextDetail(){
        if(this.state.dataSourceD==null){
            return null;
        }else{
            return(
                <View style={styles.TitleStyle}>
                        <Text style={styles.Title}>明细信息</Text>
                 </View>                                                     
            )                         
        }
    };
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
        console.log('----------------------------');
        console.log('col.value');
        console.log(col.value);
        
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
    //附件
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
        this.setState({
            commonAlert1: true,
        });
    };
    onPressFile(e,f){
        //先下载文件,保存到app本地, 再展示
        //formid=mobile_common_funcbtn&action=appendix&cFileUrl=upload&cFileName=622239074677135190_adress.txt
        //var fullUrl = Service.host+"mobile_common_funcbtn&action=appendix&cFileUrl="+f.cfileurl+'&cFileName='+f.cfilename;
        AsyncStorage.getItem('ServiceUrl',(error,result)=>{
             
            var fullUrl = result+"/download.do?cFileUrl="+f.cfileurl+'&cFileName='+f.cfilename;
          
            console.log(fullUrl);


            Linking.openURL(encodeURI(fullUrl))
            .catch((err)=>{
                console.log('An error occurred', err);
            });
        });
       
    };
};
const styles = StyleSheet.create({
    ListViewContainerStyle:{
        flexDirection:'row',
        borderBottomWidth:1,
        borderColor:'#ccc',
        paddingTop:6,
        backgroundColor:'#fff',
    },
    messageContainer: {
        flex:1,
        justifyContent:'center',
    },
    messageListTitleStyle: {
        fontSize:20,
        color:'#3A8DF3',
    },
    ruleStyle: {
        fontSize:18,
    },
    DetailCellStyle: {
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor:'white',
        alignItems:'center',
        height:Platform.OS == 'ios' ? 55 : 50,
        borderBottomColor:'#e8e8e8',
        borderBottomWidth:1,
    },
    leftViewStyle:{
        flexDirection:'row',
        alignItems:'center',
        marginLeft:8
    },
    rightViewStyle:{
        marginRight:8
    },
    mainCellContainer:{},
    TitleStyle:{
        justifyContent:'center',
        height:40,
    },
    Title:{
        marginLeft:8,
        fontSize:13,
    },
    CellStyle:{
        width:screenW,
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor:'white',
        alignItems:'center',
        borderBottomColor:'#e8e8e8',
        borderBottomWidth:1,
        paddingTop:5,
        paddingBottom:6,
    },
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
    extraTextLeftStyle:{
        marginLeft:8,
        width:60,
        color:'#aaa',
        fontSize:13,
    },
    extraTextRightStyle:{
        width:ViewUtil.screenW-70,
        marginRight:4,
        color:'#aaa',
        fontSize:13,
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
        width:screenW,
        paddingTop:-20,
    },
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
});

