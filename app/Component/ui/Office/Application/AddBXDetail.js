/**
 * Created by John on 2017-6-27.
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
    Keyboard,
    ListView,
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
import Toast from 'react-native-root-toast';
import Modal from 'react-native-root-modal';
import DateTimePicker from 'react-native-modal-datetime-picker';
import Spinner from "react-native-loading-spinner-overlay";
import "../../../../constant/Storage";
import Util from "../../../../Util/Util";
import CommonStyles from '../../../../style/CommonStyle';

import ApplicationCommonStyles from './ApplicationCommonStyle';
import ToastUtil from "../../common/ToastUtil";
import ViewUtil from '../../common/ViewUtil';
import UtilFun from '../../common/UtilFun';
import EmojiUtil from "../../common/EmojiUtil";
import HttpUtil from '../../common/HttpUtil';
import Service from '../../service';
import TopBar from '../../APPComponent/TopBar';
import NavigationBar from '../../APPComponent/NavigationBar';
import CommonModal from "../../APPComponent/CommonModal";
export default class AddBXDetail extends Component {
    constructor(props){
        super(props);
        this.ywlxId=this.props.passProps.passPropsId;
        this.startTime=UtilFun.getTimeDate();
        this.endTime=UtilFun.getTimeDate();
        this.state={
            dataSourcefylb: new ListView.DataSource({rowHasChanged: (row1, row2) => row1 !== row2,}),
            commonAlert:false,
            commonAlertMsg:'',
            RowData:this.props.passListData,
            RowId:this.props.ID,
            bxguid:'',
            FYModal: false,      //费用类别弹出层
            FYTYPEDATA:[],       //费用类型数据
            FYTYPE:'',           //费用类别展示字段
            FYradio: '',         //费用类别的对应id
            BXMoney:'',          //报销金额
            DateTimeModal:false, //日历modal
            TimeType:'',         //点击日期的类型
            SUMDAY:1,           //天数
            STARTPLACE:'',       //始发地
            ENDPLACE:'',         //目的地
            BZ:'',               //备注信息
            visible:false,       //执行动画

            listData:[],         //存放明细的数据
            keyboardHeight:0,
        }
    };
    componentDidMount(){
        this.fetchData();
    };
    componentWillUnmount() {
        this.keyboardDidHideListener.remove();
    }
    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
        if(this.state.RowData == undefined){
            this.startTime=UtilFun.getTimeDate();
            this.endTime=UtilFun.getTimeDate();
        }else{
            this.startTime=this.state.RowData.startTime;
            this.endTime=this.state.RowData.endTime;
        }
        this.setState({
            bxguid: (this.state.RowData == undefined) ? '' : this.state.RowData.bxguid,//报销明细id
            FYTYPE: (this.state.RowData == undefined) ? '' : this.state.RowData.FYTYPE,//费用类别
            FYradio: (this.state.RowData == undefined) ? '' : this.state.RowData.FYradio,//费用类别id
            BXMoney: (this.state.RowData == undefined) ? '' : this.state.RowData.BXMoney,//报销金额
            SUMDAY: (this.state.RowData == undefined) ? 1 : this.state.RowData.SUMDAY,//天数
            STARTPLACE: (this.state.RowData == undefined) ? '' : this.state.RowData.STARTPLACE,//始发地
            ENDPLACE: (this.state.RowData == undefined) ? '' : this.state.RowData.ENDPLACE,//目的地
            BZ: (this.state.RowData == undefined) ? '' : this.state.RowData.BZ,//备注 
        }) 
        console.log(this.state.RowData);  
        console.log(this.state.RowId);
    }
    //键盘弹出执行
    _keyboardDidShow(e){
        if(Platform.OS == 'ios'){
            this.setState({
                keyboardHeight:e.startCoordinates.height
            });
        }else{
            this.setState({
                keyboardHeight:270,
            });
        }
    }
    //键盘退出执行
    _keyboardDidHide(e){
        this.refs.BXMoney.blur();
        this.setState({
            keyboardHeight:0
        });
    }
    hideAlertDialog() {
       this.setState({
            commonAlert: false,
        });   
    };
    fetchData() {
        let url=Service.host+'mobile_em_expenseAccountBill'
                +'&action=queryFylb'+'&ywlxId='+this.ywlxId;
        //console.log(url);
        console.log('天数');
        console.log(this.state.SUMDAY);
        HttpUtil.get(url,this)
            .then((responseData) => {
                //console.log('费用类型数据');
                //console.log(responseData);
                let data=responseData.fylb;
                //默认业务类型为返回数据中的第一个
                if(this.state.FYTYPE==''){
                    this.setState({ 
                        FYTYPE:responseData.fylb[0].name,
                        FYradio:responseData.fylb[0].code,
                    });
                }
                this.setState({
                    dataSourcefylb: this.state.dataSourcefylb.cloneWithRows(responseData.fylb),
                });
            })
            .catch((error) => {
                Toast.show('网络原因数据读取失败', {
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
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    };
    //费用类别modal
    _showFYModal= () => {this.setState({ FYModal: true})}
    _renderFYModalContent() {
        return(
            <View style={{ 
                    backgroundColor: 'white',
                    padding: 22,
                    height:300,
                    borderRadius: 4,
                    borderColor: 'rgba(0, 0, 0, 0.1)',}}>
                <View style={{marginBottom:15}}>
                    <Text style={{color:'#50B1F8',fontSize:16}}>选择费用类型</Text>
                </View>
                <View style={{marginBottom:20}}>
                    <ListView
                        dataSource={this.state.dataSourcefylb}
                        renderRow={this.renderFYLBRow.bind(this)}
                        style={styles.listView}
                        enableEmptySections={true}
                        removeClippedSubviews={false}
                    />
                </View>
                {/*<View>
                    <ScrollView>
                        <RadioCells
                            options={this.state.FYTYPEDATA}
                            onChange={this.FYRadioChange.bind(this)}
                            value={this.state.FYradio}
                        />
                    </ScrollView>
                </View>*/}
            </View>
        );
    };
    //费用类型单选切换
   /* FYRadioChange(value) {
        this.setState({ 
            FYradio:value,
            FYModal:false,
        });
        for(let i in this.state.FYTYPEDATA){
            if(value==this.state.FYTYPEDATA[i].value){
                this.setState({
                    FYTYPE:this.state.FYTYPEDATA[i].label,
                });
                return;
            }
        }
    };*/
    renderFYLBRow(data){
        return(
            <TouchableOpacity onPress={()=>this.pressYWLXList(data)}>
            <View key={data.code}>
                <View numberOfLines={1} style={{
                    justifyContent:'center',
                    height:50,
                    borderBottomColor:'#e8e8e8',
                    borderBottomWidth:1,
                    marginLeft:10,
                    marginRight:10,
                }}>
                    <Text style={styles.LeftTextStyle}>{data.name}</Text>
                </View>
            </View>
            </TouchableOpacity>
        ); 
    }
    pressYWLXList(data){
        this.setState({
            FYradio:data.code,
            FYTYPE:data.name,
            FYModal:false,
        });
    };
    closeModal(){
        this.setState({ 
            FYModal:false,
        });
    }
    //日历modal
    _showDateTimePicker = (type) => {
        this.setState({ 
            DateTimeModal: true,
            TimeType:type,
        });
    }
    _hideDateTimePicker = () => this.setState({ DateTimeModal: false });
    cover(str, length) {
        for (let i = 0; i < length; i++) {
            if (str.length < length) {
                str = '0' + str;
            }
        }
        return str;
    }
    //选择时间并做相应的运算
    _handleDatePicked = (date) => {
        //获取用户选中的时间
        let year = (date).getFullYear();
        let month = this.cover(((date.getMonth() + 1) + ''), 2);
        let day = this.cover((date.getDate() + ''), 2);
        var requestTime = `${year}-${month}-${day}`;
        //console.log(requestTime);
        //将选中的时间赋值给对应的位置
        if(this.state.TimeType=='start'){
            this.startTime=requestTime;
        }
        if(this.state.TimeType=='end'){
            this.endTime=requestTime;
        }

        //终止日期减去起始日期日期自动计算累计的天数
        let sDate=this.startTime.toString();
        let eDate=this.endTime.toString();
        console.log(sDate);
        console.log(eDate);
        console.log(UtilFun.DateDiff('2017-10-31','2017-11-01')+"天qq");
        let sArr = sDate.split("-");
        let eArr = eDate.split("-");
        let sRDate = new Date(sArr[0], sArr[1], sArr[2]);
        let eRDate = new Date(eArr[0], eArr[1], eArr[2]);
        let result = (eRDate-sRDate)/(24*60*60*1000)+1;
        let days = UtilFun.DateDiff(sDate,eDate);
        if(result>0){
            this.setState({
                SUMDAY:days,
            });
        }else{
            this.state.commonAlertMsg='起始日期不能大于结束日期';
            this.setState({commonAlert: true,});
            this.startTime=UtilFun.getTimeDate();
            this.endTime=UtilFun.getTimeDate();
            this.setState({
                SUMDAY:1,
            });
        }
        this._hideDateTimePicker();
    };
    //备注信息
    handelBZchange(textarea) {
        textarea = EmojiUtil.FilterEmoji(textarea);
        this.setState({ BZ:textarea })
    };
    onChangeText(text){
        text = EmojiUtil.FilterEmoji(text);
        this.setState({BXMoney:text})
    }
    _onEndEditing(text){
        let num ;
        if(UtilFun.checkFloatNum(text)){
            num = new Number(text);
        }else{
            Toast.show('报销金额格式不合法', {
                        duration: Toast.durations.SHORT,
                        position: 100,
                        shadow: true,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        animation: true,
                        hideOnPress: true,
                        delay: 0,
                    });
            num = new Number("0.00");
        }
        let number=num.toFixed(2);
        this.setState({BXMoney:number});
    }
    render(){
        return(
            <View style={CommonStyles.CommonWrapContainer}>
                <NavigationBar
                    leftAction={this.onPressBack.bind(this)}
                    leftImage={require('../../../../../img/back.png')}
                    title="添加报销明细" 
                />
                <View style={{height:ViewUtil.screenH-120,}}>
                <ScrollView ref='scroll'>
                    <TouchableOpacity onPress={()=>this._showFYModal()}>
                    <View style={[ApplicationCommonStyles.cellContainer,{marginTop:10}]}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>费用类别</Text>
                            </View>
                            <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.FYTYPE}</Text>
                        </View>
                        <View style={ApplicationCommonStyles.rightViewStyle}>
                            <Image source={require('../../../../../img/rarrow.png')} style={{width:8, height:13, marginRight:8, marginLeft:5}} />
                        </View>
                    </View>
                    </TouchableOpacity>
                    <View style={ApplicationCommonStyles.cellContainer}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>报销金额</Text>
                                
                            </View>
                            <View style={ApplicationCommonStyles.input_item}>
                            <Text style={{color:'#50B1F8',marginTop:Platform.OS == 'ios'?0:-10,}}>￥</Text>
                            <TextInput
                                    style={ApplicationCommonStyles.text_input}
                                    placeholder="0.00"
                                    placeholderTextColor="#50B1F8"
                                    value={this.state.BXMoney}
                                    maxLength={10}
                                    underlineColorAndroid="transparent"
                                    numberOfLines={1}
                                    ref={'BXMoney'}
                                    returnKeyType="go"
                                    keyboardType="numeric"
                                    multiline={Platform.OS == 'ios'?false:true}
                                    onChangeText={this.onChangeText.bind(this)}
                                    onEndEditing = {(event)=>this._onEndEditing(event.nativeEvent.text)}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={ApplicationCommonStyles.cellContainer}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>日期</Text>
                            </View>
                            <TouchableOpacity onPress={()=>this._showDateTimePicker('start')}>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.startTime}</Text>
                            </TouchableOpacity>
                            <Text style={{marginLeft:15,marginRight:15}}>~</Text>
                            <TouchableOpacity onPress={()=>this._showDateTimePicker('end')}>
                                <Text style={ApplicationCommonStyles.leftTitleStyle}>{this.endTime}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={ApplicationCommonStyles.cellContainer}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>天数</Text>
                            </View>
                            <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.SUMDAY}</Text>
                        </View>
                    </View>
                    <View style={ApplicationCommonStyles.cellContainer}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>始发地</Text>
                            </View>
                            <View style={ApplicationCommonStyles.input_item}>                            
                                <TextInput
                                    style={ApplicationCommonStyles.text_inputnormal}
                                    placeholder="手工录入"
                                    placeholderTextColor="#aaaaaa"
                                    value={this.state.STARTPLACE}
                                    underlineColorAndroid="transparent"
                                    numberOfLines={1}
                                    ref={'reason'}
                                    returnKeyType="go"
                                    multiline={Platform.OS == 'ios'?false:true}
                                    onChangeText={(text) => {
                                        this.setState({
                                            STARTPLACE : text
                                        });
                                    }}
                                />                           
                            </View>
                        </View>
                    </View>
                    <View style={ApplicationCommonStyles.cellContainer}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>目的地</Text>
                            </View>
                            <View style={ApplicationCommonStyles.input_item}>                            
                                <TextInput
                                    style={ApplicationCommonStyles.text_inputnormal}
                                    placeholder="手工录入"
                                    placeholderTextColor="#aaaaaa"
                                    value={this.state.ENDPLACE}
                                    underlineColorAndroid="transparent"
                                    numberOfLines={1}
                                    ref={'reason'}
                                    returnKeyType="go"
                                    multiline={Platform.OS == 'ios'?false:true}
                                    onChangeText={(text) => {
                                        this.setState({
                                            ENDPLACE : text
                                        });
                                    }}
                                />                           
                            </View>
                        </View>
                    </View>
                    <View style={ApplicationCommonStyles.cellContainer}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>备注</Text>
                            </View>
                        </View>
                    </View>
                    <View>
                        <Cells>
                            <Cell>
                                <CellBody style={{marginTop:Platform.OS == 'ios'?0:-20,}}>
                                    <TextArea
                                        style={{fontSize:13}}
                                        placeholder="请输入备注"
                                        placeholderTextColor="#aaaaaa"
                                        value={this.state.BZ}
                                        onChange={this.handelBZchange.bind(this)}
                                        underlineColorAndroid="transparent"
                                        maxLength={400}
                                    />
                                </CellBody>
                            </Cell>
                        </Cells>
                    </View>
                    <View style={{height:this.state.keyboardHeight,width:ViewUtil.screenW,}}></View>
                </ScrollView>
                    <DateTimePicker
                        isVisible={this.state.DateTimeModal}
                        onConfirm={this._handleDatePicked}
                        onCancel={this._hideDateTimePicker}
                        cancelTextIOS='取消'
                        confirmTextIOS='确定'
                        cancelTextStyle={{fontSize:14}}
                        confirmTextStyle={{fontSize:14}}
                        titleIOS="选择日期"
                    />
                    <Modal visible={this.state.FYModal}>
                        <View style={styles.modalContainer}>
                            {this._renderFYModalContent()}
                        </View>
                        <TouchableOpacity
                            style={[styles.button, styles.close]}
                            underlayColor="#aaa"
                            onPress={this.closeModal.bind(this)}
                         >
                        <Image source={require('../../../../../img/X.png')} style={{height:40,width:40,}} />
                        </TouchableOpacity>
                    </Modal>
                    <CommonModal
                        visible={this.state.commonAlert}
                        message={this.state.commonAlertMsg}
                        sureTitle='确定'
                        sureAction={this.hideAlertDialog.bind(this)}
                        />
                    <Spinner visible={this.state.visible} overlayColor={'rgba(0, 0, 0, 0.2)'}
                             textContent={this.state.tip} textStyle={{color: 'white'}}/>
                </View>
                <View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:10}}>
                    <TouchableOpacity onPress={()=>this.goOnAdd()} style={ApplicationCommonStyles.detailBtnStyle}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <Text style={{color:'white',fontSize:16}}>继续添加明细</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>this.saveDetail()} style={ApplicationCommonStyles.detailBtnStyle}>
                        <View style={ApplicationCommonStyles.rightViewStyle}>
                            <Text style={{color:'white',fontSize:16}}>保存</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        )
    };
    //按钮操作事件
    goOnAdd=()=>{//继续添加明细
        if(this.state.BXMoney==''){
            Toast.show('请输入报销金额', {
                        duration: Toast.durations.SHORT,
                        position: 100,
                        shadow: true,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        animation: true,
                        hideOnPress: true,
                        delay: 0,
                    });
        }else if(this.state.BXMoney!=''&&!UtilFun.checkFloatNum(this.state.BXMoney)){
            Toast.show('报销金额格式不合法', {
                        duration: Toast.durations.SHORT,
                        position: 100,
                        shadow: true,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        animation: true,
                        hideOnPress: true,
                        delay: 0,
                    });
            this.setState({
                BXMoney:'',
            });
        }else{
            let id=this.state.RowId;
            let map = {};
                map['bxguid']=this.state.bxguid;
                map['FYTYPE']=this.state.FYTYPE;
                map['FYradio']=this.state.FYradio;
                map['BXMoney']=this.state.BXMoney;
                map['startTime']=this.startTime;
                map['endTime']=this.endTime;
                map['SUMDAY']=this.state.SUMDAY;
                map['STARTPLACE']=this.state.STARTPLACE;
                map['ENDPLACE']=this.state.ENDPLACE;
                map['BZ']=this.state.BZ;
            console.log('==============================');
            //console.log(map);
            if(this.state.RowId==undefined){
                this.props.getBXListData(map);
            }else{
                this.props.refreshBXListData(map,id);
            }
            Toast.show('明细信息已保存', {
                        duration: Toast.durations.SHORT,
                        position: ViewUtil.screenH/2,
                        shadow: true,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        animation: true,
                        hideOnPress: true,
                        delay: 0,
                    });
            this.setState({
                bxguid:'',
                BXMoney:'',
                SUMDAY:1,
                STARTPLACE:'',
                ENDPLACE:'',
                BZ:'',
            });
            this.startTime=UtilFun.getTimeDate();
            this.endTime=UtilFun.getTimeDate();
        }
    };
    saveDetail=()=>{//保存
        if(this.state.BXMoney==''){
            Toast.show('请输入报销金额', {
                        duration: Toast.durations.SHORT,
                        position: 100,
                        shadow: true,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        animation: true,
                        hideOnPress: true,
                        delay: 0,
                    });
        }
        else if(this.state.BXMoney!=''&&!UtilFun.checkFloatNum(this.state.BXMoney)){
            Toast.show('报销金额格式不合法', {
                        duration: Toast.durations.SHORT,
                        position: 100,
                        shadow: true,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        animation: true,
                        hideOnPress: true,
                        delay: 0,
                    });
            this.setState({
                BXMoney:'',
            });
            //this.refs.BXMoney.focus();
        }else{
            let map = {};
                map['bxguid']=this.state.bxguid;
                map['FYTYPE']=this.state.FYTYPE;
                map['FYradio']=this.state.FYradio;
                map['BXMoney']=this.state.BXMoney;
                map['startTime']=this.startTime;
                map['endTime']=this.endTime;
                map['SUMDAY']=this.state.SUMDAY;
                map['STARTPLACE']=this.state.STARTPLACE;
                map['ENDPLACE']=this.state.ENDPLACE;
                map['BZ']=this.state.BZ;
            //console.log('==============================');
            //console.log(map);
            //console.log(this.state.RowId);
            let id=this.state.RowId;
            if(this.state.RowId==undefined){
                //新增报销单返回父页面传递数据
                this.props.getBXListData(map);
            }else{
                //修改父页面数据传递数据刷新数组数据源
                this.props.refreshBXListData(map,id);
            }
            this.props.navigator.pop();
            
        }
        
    }
}

const styles = StyleSheet.create({
     modalContainer: {
        height: 300,
        width: ViewUtil.screenW*0.8,
        backgroundColor: '#fff',
        borderColor:'#000',
        borderRadius: 5,
    },
    close: {
        position: 'absolute',
        bottom: 80,
        left:ViewUtil.screenW*0.8/2+20,
    },
});