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
} from 'react-native';
import {
    RadioCells,
    Dialog,
} from 'rn-weui/src';
import dismissKeyboard from 'dismissKeyboard';
import Modal from 'react-native-modal';
import Spinner from "react-native-loading-spinner-overlay";
import TimerMixin from "react-timer-mixin";
import Swipeable from 'react-native-swipeable';
import CommonStyles from '../../../../style/CommonStyle';
import ApplicationCommonStyles from './ApplicationCommonStyle';
import Service from '../../service';
import TopBar from '../../APPComponent/TopBar';
import NavigationBar from '../../APPComponent/NavigationBar';
import ViewUtil from '../../common/ViewUtil';
import HttpUtil from '../../common/HttpUtil';
import EmojiUtil from "../../common/EmojiUtil";
import AddBXDetail from './AddBXDetail';
import AddFPDetail from './AddFPDetail';
import "../../../../constant/Storage";

let XMTYPEDATA=[];
export default class SearchXM extends Component {

    constructor(props){
        super(props);
        this.state = {
            dataSource2: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            dataSource3: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            dataSource4: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            ListDataType:'queryCommonXm', //数据类型
            searchText:'',    //搜索内容
            Color1:'#50B1F8',
            Color2:'#FFF',
            BottomColor1:'#50B1F8',
            BottomColor2:'#FFF',
           
          value:'',
          valueid:'',
          resultArr:[], //存放之前的搜索结果数组
          content: '',
          kk:[], //暂存第一条键入的结果
          maxLength: 5,
          show:false,
          show2:false,

        };
       
    };
    //组件周期函数
    componentDidMount(){
        this.timer = TimerMixin.setTimeout(() => {
            this.getData();
            this.Search4();
        }, 1000);
        this.setState({visible:true,tip:'数据加载中...'});
    };
    componentWillUnmount() {
        this.keyboardDidHideListener.remove();
        this.timer && TimerMixin.clearTimeout(this.timer);
    }
    componentWillMount() {
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    }
    _keyboardDidHide(e){
        this.refs.searchText.blur();
    }
    //页面返回
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {navigator.pop();}
    };
    //页面切换改变state状态渲染
    changeTextStyle1= () => {
        if(this.state.Color1=='#FFF'){
            this.setState({
                    Color1:'#50B1F8',
                    Color2:'#FFF',
                    BottomColor1:'#50B1F8',
                    BottomColor2:'#FFF',
                    ListDataType:'queryCommonXm',
            },()=>{
                this.getData();
            });
        } 
    };
    changeTextStyle2= () => {
        if(this.state.Color2=='#FFF'){
            this.setState({
                    Color1:'#FFF',
                    Color2:'#50B1F8',
                    BottomColor1:'#FFFF',
                    BottomColor2:'#50B1F8',
                    ListDataType:'queryAllXm',
            },()=>{
                this.getData();
            });
        } 

    };
    /********************************************************************************/
    //输入框获得焦点时调用
    onFocus(){
        let _that = this;
        if(this.state.resultArr.length==0&&this.state.searchText==''){
            _that.setState({
                show: false,
                show2:false,
            });
            return;
        }else if(this.state.searchText==''&&this.state.resultArr.length!=0){
            _that.setState({
                show: true,
                show2:false,
            });
        }else{
            _that.setState({
                show2: true,
                show:false,
            });
        }
    }
    //点击关闭按钮关闭下拉框
    colseBox=()=>{
        this.refs.searchText.blur();
        this.setState({
            show: false,
            show2:false,
        });
    }
    //点击清除历史纪录调用
    removeSearchLog=()=>{
        var _that = this;
        AsyncStorage.removeItem('history',(error,result)=>{
          if (!error) {//更新Favorite的key
            _that.setState({
                    content: '',
                    resultArr:''},
            );
            _that.setState({
                dataSource4: _that.state.dataSource4.cloneWithRows([]),
            });
          }else{
            console.log('err',err)
          }
        });
        _that.Search4();
        _that.colseBox();
    }
    
    fetchData() {
        let _that = this;
        let resultArr=JSON.parse(_that.state.resultArr);
        _that.setState({
            dataSource4: _that.state.dataSource4.cloneWithRows(resultArr),
        }, () => {
            
        });
    };
    getData() {
        var url;
        if(this.state.ListDataType=='queryCommonXm'){
            url=Service.host+'mobile_em_expenseAccountBill'
                +'&action=queryCommonXm';
        }else if(this.state.ListDataType=='queryAllXm'){
            url=Service.host+'mobile_em_expenseAccountBill'
                +'&action=queryAllXm';
        }
        console.log(url);
        HttpUtil.get(url,this)
            .then((responseData) => {
                console.log(responseData);
                if(responseData.coXmList){
                    this.setState({
                        dataSource2: this.state.dataSource2.cloneWithRows(responseData.coXmList),
                    });
                }else if(responseData.xmList){
                    this.setState({
                        dataSource2: this.state.dataSource2.cloneWithRows(responseData.xmList),
                    });
                }
               
            })
            .catch((error) => {
                
            });
    };
    onChangeText(text){
        text = EmojiUtil.FilterEmoji(text);
        //this.setState({searchText:text,})
        let _that=this;
        _that.setState({
            searchText: text,
            show:false,
            show2:true,
        }, () => {
            if(text!=''){
                let url=Service.host+'mobile_em_expenseAccountBill'
                +'&action=queryAllXm'
                +'&queryName='+encodeURIComponent(_that.state.searchText);
                console.log(url);
                HttpUtil.get(url,_that)
                        .then((responseData) => {
                            console.log('**************************');  
                            console.log(responseData);
                            if(responseData.xmList!=null){
                                _that.setState({
                                    dataSource3: _that.state.dataSource3.cloneWithRows(responseData.xmList),
                                });
                            }else{
                                _that.setState({
                                    dataSource3: _that.state.dataSource3.cloneWithRows([]),
                                });
                            }
                        })
                        .catch((error) => {
                            _that.setState({
                                requestFail:true,
                            })
                        });
            }else if(text==''){
                _that.setState({
                    show: true,
                    show2:false,
                });
                this.Search4();
            }
        });
    }
    onPressSearch = () => {
        dismissKeyboard();//点击搜索按钮收回软键盘
    };
    Search4=()=>{
        let _that = this;
        AsyncStorage.getItem('history')
            .then( 
                (result)=> {   //使用Promise机制,如果操作成功不会有error参数
                    if (result == null) {
                        //没有指定的key
                        return;
                    }
                    _that.setState({ content: result, resultArr: result}); 
                    this.fetchData();
                }
            ).catch((error)=> {  //读取操作失败
                console.log('error:' + error);
        });
    }
    //记录用户业务类型搜索记录
    SearchXMItem=(data)=>{
            //console.log('000000000000000000000');
            //console.log(data);
            this.setState({
                searchText:data.xmname,
                show2:false,
            },()=>{
                dismissKeyboard();
              let { value } = this.state;
              let { valueid } =this.state;
              //输入框点击回车后执行的方法
              value = data.xmname; //获取输入框的值
              valueid=data.xmid;
              this.setState({value});
              this.setState({valueid});
              let { kk } = this.state;
              let { resultArr } = this.state;
              let str = '';
              console.log(resultArr);
                if(resultArr.length > 0 ){ //这里目的是每一次进入该页面时，保存之前键入的搜索结果
                     resultArr = JSON.parse(resultArr); //将对象转化成json对象数组
                        function ifArrVal(arr,value){
                            for(let i in arr){
                                if(arr[i].xmname == value){
                                    return 1;
                                }
                            }
                            return -1;
                        }
                        let isExit=ifArrVal(resultArr,this.state.searchText);
                        if(isExit==-1&&this.state.searchText!=''){//如果不存在重复数据,将SEARCHXMITEM添加到记录中
                            resultArr.unshift({ xmname: value,xmid:valueid}); //每次新键入的值放到数组的最前面
                        }  
                        this.setState({ resultArr });
                        str = JSON.stringify(resultArr); //这里因为AsyncStorage setItem方法接收的键值均为string类型，所以把数组转换为字符串存储
                }else{ //这里是第一次没有回车键入任何值，执行此处
                    kk.unshift({ xmname: value,xmid:valueid});
                    this.setState({ kk});
                    str = JSON.stringify(kk);
                }        
                AsyncStorage.setItem('history', str , this.doSomething); //将值放入名称为history的key里，并执行对应的回调函数
                this.props.getxm(data.xmname,data.xmid);
                this.props.navigator.pop();
            })
          
    };
    renderRow3(data){
        return(
            <TouchableOpacity onPress={()=>this.SearchXMItem(data)}>
            <View key={data.xmname}>
                <View numberOfLines={1} style={{
                    justifyContent:'center',
                    height:40,
                    borderBottomColor:'#ccc',
                    borderBottomWidth:1,
                    marginLeft:10,
                    marginRight:10,
                }}>
                    <Text style={styles.LeftTextStyle}>{data.xmname}</Text>
                </View>
            </View>
            </TouchableOpacity>
        ); 
    }
    renderRow4(data){
        return(
            <TouchableWithoutFeedback onPress={()=>this.pressListxm(data)}>
            <View key={data.xmname}>
                <View numberOfLines={1} style={{
                    justifyContent:'center',
                    height:40,
                    borderBottomColor:'#ccc',
                    borderBottomWidth:1,
                    marginLeft:10,
                    marginRight:10,
                }}>
                    <Text style={styles.LeftTextStyle}>{data.xmname}</Text>
                </View>
            </View>
            </TouchableWithoutFeedback>
        ); 
    }
    pressListxm(data){
        this.refs.searchText.blur();
        dismissKeyboard();
        this.setState({
            searchText:data.xmname,
            valueid:data.xmid,
            show:false,
        });
        this.props.getxm(data.xmname,data.xmid);
        this.props.navigator.pop();
    };
    onPressSearchImg=()=>{
        this.setState({
            show2:true,
        })
    }
    renderRow2(data){
        return(
            <TouchableOpacity onPress={()=>this.pressListxm(data)}>
            <View key={data.xmname}>
                <View numberOfLines={1} style={{
                    justifyContent:'center',
                    height:50,
                    borderBottomColor:'#ccc',
                    borderBottomWidth:1,
                    paddingLeft:10,
                    paddingRight:10,
                }}>
                    <Text style={styles.LeftTextStyle}>{data.xmname}</Text>
                </View>
            </View>
            </TouchableOpacity>
        ); 
    }
    render(){
        let iconTetx;
        if(this.state.searchText==''){
            iconTetx=
                <View style={{flexDirection:'row',height:40,flex:1,justifyContent:'space-between',alignItems:'center',}}>
                    <TouchableOpacity onPress={()=>this.removeSearchLog()}>
                    <View>
                        <Text style={{marginLeft:10,}}>清除历史记录</Text>
                    </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>this.colseBox()}>
                    <View>
                        <Text style={{marginRight:10,}}>关闭</Text>
                    </View>  
                    </TouchableOpacity>
                </View> 
        }else{
             iconTetx=
                <View style={{flexDirection:'row',height:40,flex:1,justifyContent:'space-between',alignItems:'center',}}>
                    <View>
                        <Text style={{marginLeft:10,}}></Text> 
                    </View> 
                    <TouchableOpacity onPress={()=>this.colseBox()}>
                        <View>
                            <Text style={{marginRight:10,}}>关闭</Text> 
                        </View>  
                    </TouchableOpacity> 
                </View> 
        }
        return(
            <View style={styles.container}>
                <View style={CommonStyles.CommonWrapContainer}>
                    <NavigationBar
                        leftAction={this.onPressBack.bind(this)}
                        leftImage={require('../../../../../img/back.png')}
                        title="项目列表"
                    />
                    <View style={CommonStyles.CommonInputItem}>
                        <TextInput
                            style={CommonStyles.CommonTextInput}
                            placeholder="请输入项目名称查找"
                            placeholderTextColor="#aaa"
                            value={this.state.searchText}
                            underlineColorAndroid="transparent"
                            numberOfLines={1}
                            ref={'searchText'}
                            returnKeyType="search"
                            onChangeText={this.onChangeText.bind(this)}
                            onFocus ={this.onFocus.bind(this)}
                            onSubmitEditing={this.onPressSearch}
                            onEndEditing={(evt) => this.setState({ searchText: evt.nativeEvent.text })}
                        />
                        <TouchableOpacity onPress={()=>this.onPressSearchImg()}>
                        <View style={CommonStyles.CommonSearchImgContainer}>
                            <Image source={require('../../../../../img/search.png')} style={CommonStyles.CommonSearchImg} />
                        </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{
                            width:ViewUtil.screenW,
                            height:50,
                            flexDirection:'row',
                            backgroundColor:'#ddd',
                        }}>
                        <TouchableOpacity onPress={this.changeTextStyle1}>
                            <View style={[styles.tabViewStyle,{borderBottomColor:this.state.BottomColor1}]}>
                                <Text style={[styles.tabTextStyle,
                                    {color:this.state.Color1,
                                     }]}>常用
                                </Text>                          
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.changeTextStyle2}>
                            <View style={[styles.tabViewStyle,{borderBottomColor:this.state.BottomColor2}]}>
                                <Text style={[styles.tabTextStyle,
                                    {color:this.state.Color2,
                                     }]}>项目列表
                                </Text>                            
                            </View> 
                        </TouchableOpacity>                   
                    </View>
                    <View>
                        <ListView
                            dataSource={this.state.dataSource2}
                            renderRow={this.renderRow2.bind(this)}
                            style={styles.listView}
                            enableEmptySections={true}
                            removeClippedSubviews={false}
                        />
                    </View>
                    {this.state.show?
                        <View style={{
                                width:ViewUtil.screenW-10,
                                position:'absolute',
                                top:Platform.OS == 'ios'?105:85,
                                marginLeft:5,
                                marginRight:5,
                                borderWidth:1,
                                borderColor:'#ccc',
                                backgroundColor:'#fff',
                                maxHeight:200,
                            }}>
                            <View style={{maxHeight:160,}}>
                                <ListView
                                    dataSource={this.state.dataSource4}
                                    renderRow={this.renderRow4.bind(this)}
                                    style={styles.listView}
                                    enableEmptySections={true}
                                    removeClippedSubviews={false}
                                />
                            </View>
                             {iconTetx}           
                        </View>
                        : null
                    }
                    {this.state.show2?
                        <View style={{
                                width:ViewUtil.screenW-10,
                                position:'absolute',
                                top:Platform.OS == 'ios'?105:85,
                                marginLeft:5,
                                marginRight:5,
                                borderWidth:1,
                                borderColor:'#ccc',
                                backgroundColor:'#fff',
                                maxHeight:200,
                            }}>
                            <View style={{maxHeight:160,}}>
                                <ListView
                                    dataSource={this.state.dataSource3}
                                    renderRow={this.renderRow3.bind(this)}
                                    style={styles.listView}
                                    enableEmptySections={true}
                                    removeClippedSubviews={false}
                                />
                            </View>
                            {iconTetx}        
                        </View>
                        : null
                    }
                    
                </View>    
          </View>
        )
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#F5FCFF',
    },
    tabViewStyle:{
        height:50,
        width:ViewUtil.screenW/2,
        justifyContent:'center',
        alignItems:'center',
        borderBottomWidth:2,
    },
    tabTextStyle:{
        fontSize:16,
        
    },
   
});