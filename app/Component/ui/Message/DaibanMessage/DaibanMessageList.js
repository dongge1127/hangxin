/**
 * Created by John on 2017-6-19.
  */
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    Image,
    ListView,
    Platform,
    ActivityIndicator,
    TouchableOpacity,
    NetInfo,
    BackAndroid,
    AsyncStorage,
} from 'react-native';
import {PullList} from 'react-native-pull';
import dismissKeyboard from 'dismissKeyboard';
import Toast from 'react-native-root-toast';
import ViewUtil from '../../common/ViewUtil';
import Service from '../../service';
import CatchError from '../../CatchError';
import CustomDocument from './CustomDocument';
import DetailMessage from './DaibanMessageListDetail'
import CommonStyles from '../../../../style/CommonStyle';
import HttpUtil from '../../common/HttpUtil';
import EmojiUtil from "../../common/EmojiUtil";
import NavigationBar from "../../APPComponent/NavigationBar";
import RequestFail from '../../APPComponent/RequestFail';
import ToastUtil from "../../common/ToastUtil";
/*导入json数据*/
var Datas = require('./OrderListType.json');
let page=1;

export default class MessageList extends Component {
    constructor(props) {
        super(props);
        this.dataSource = [];
        this.state = {
            searchText:'',
            list: (new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})).cloneWithRows(this.dataSource),
            moduleType:this.props.moduleType,
            requestFail:false,
        };
        this.renderRow = this.renderRow.bind(this);
        this.renderFooter = this.renderFooter.bind(this);
        this.loadMore = this.loadMore.bind(this);
        //this.topIndicatorRender = this.topIndicatorRender.bind(this);
        //console.log(this.state.moduleType);
    };
    //禁止输入emoji
    onChangeText(text){
        text = EmojiUtil.FilterEmoji(text);
        this.setState({searchText:text,})
    }
    componentDidMount(){
        BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid);
        page=1;
    };
    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
    };
    onPressBack = () => {
        page=1;
        this.props.callRefreshFun();
        this.props.navigator.pop();
    };
    onBackAndroid=()=>{
        if (this.props.navigator) {
           this.onPressBack();
            return true;
        }
    };
    state = {
        currentlyOpenSwipeable: null
    };

    handleScroll = () => {
        const {currentlyOpenSwipeable} = this.state;

        if (currentlyOpenSwipeable) {
            currentlyOpenSwipeable.recenter();
        }
    };
    //下拉刷新函数
    reFreshPage(){
        console.log('----------reFreshPage--------------');
        page = 1;
        this.dataSource = [];
        this.onEndReachedCalledDuringMomentum = false;
        this.setState({
            list: this.state.list.cloneWithRows(this.dataSource),
            nomore: false,
        }, () => {
            // 加载数据
            this.loadMore();
        })
    }
    onPullRelease(resolve) {
        this.reFreshPage();
        setTimeout(() => {
            resolve();
        }, 10);
    };
    //下拉执行
    topIndicatorRender(pulling, pullok, pullrelease) {
        return (
            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 60}}>
                <ActivityIndicator size="small" color="gray" />
            </View>
        );
    };
    render() {
        return (
            <View style={CommonStyles.CommonWrapContainer}>
                <NavigationBar
                    leftAction={this.onPressBack}
                    leftImage={require('../../../../../img/back.png')}
                    title={'待办事项列表'}/>
                <View style={CommonStyles.CommonInputItem}>
                     <TextInput
                        style={CommonStyles.CommonTextInput}
                        placeholder="按单据类型、时间(如20170101)查找"
                        placeholderTextColor="#aaa"
                        value={this.state.searchText}
                        underlineColorAndroid="transparent"
                        numberOfLines={1}
                        ref={'searchText'}
                        returnKeyType="search"
                        onChangeText={this.onChangeText.bind(this)}
                        onSubmitEditing={this.onPressSearch}
                        onEndEditing={(evt) => this.setState({ searchText: evt.nativeEvent.text })}
                    />
                    <TouchableOpacity onPress={this.onPressSearch}>
                    <View style={CommonStyles.CommonSearchImgContainer}>
                        <Image source={require('../../../../../img/search.png')} style={CommonStyles.CommonSearchImg} />
                    </View>
                    </TouchableOpacity>
                </View>
                <PullList
                    style={{}}
                    onPullRelease={this.onPullRelease.bind(this)}
                    topIndicatorRender={this.topIndicatorRender}
                    topIndicatorHeight={60}
                    dataSource={this.state.list}
                    pageSize={5}
                    initialListSize={5}
                    renderRow={this.renderTable.bind(this)}
                    onEndReached={this.onEndReached}
                    onEndReachedThreshold={0.5}
                    renderFooter={this.renderFooter}
                    enableEmptySections={true}
                    onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
                />
            </View>
        );
    }
    onEndReached = () => {
        if (!this.onEndReachedCalledDuringMomentum) {
            this.loadMore();
            this.onEndReachedCalledDuringMomentum = true;
        }
    };
    renderRow= (col,i, row) => {
        if(i==0){
             return(
                <View key={col.title}>
                    <Text numberOfLines={1} style={CommonStyles.CommonListViewTitleStyle}>
                        {row[col.code]}
                    </Text>
                </View>
            );
        }
        return(
            <View key={col.title}>
                <Text numberOfLines={1} style={CommonStyles.CommonListViewListTextStyle}>
                    {col.title}:{row[col.code]}
                </Text>
            </View>
        );
    }
    renderTable(item, sectionID, rowID, highlightRow) {
        var number=item.hidden_cbilltype;
        var s=Service.sys;
        /*console.log(number);
        console.log(s);*/
        return (
            <TouchableOpacity onPress={()=>this.onPressDetail(item)}>
                <View style={CommonStyles.CommonListViewContainer} key={item.hidden_cguid}>
                    <View>
                        {Datas[s+'cbilltype_'+number].map((col, i) => this.renderRow(col, i, item))}
                    </View>
                </View>
            </TouchableOpacity>
        );

    };
    renderFooter() {
        if(this.state.requestFail==true){
            return(
                <RequestFail onPress={this.onPressSearch}/>
            )
        }
        if(this.state.nomore) {
            return null;
        }
        return (
            <View style={{height: 100}}>
                <ActivityIndicator size="small" color="gray"/>
            </View>
        );
    }
    //搜索数据
    onPressSearch = () => {
        dismissKeyboard();//点击搜索按钮收回软键盘
        this.dataSource = [];
        this.setState({
            requestFail:false,
            nomore:false,
        });
        page=1;
        this.setState({
            list: this.state.list.cloneWithRows(this.dataSource)
        });
        var url=Service.host+Service.dbList
                +'&module='+this.state.moduleType
                +'&keyword='+encodeURIComponent(this.state.searchText)+'&curpage='+page
                +'&pagenum=100&tokenID='+Service.tokenID;
         console.log('----------onPressSearch--------------');
        HttpUtil.get(url,this)
                .then((responseData) => {
                    if(responseData.list!=''){
                        let Data=responseData.list;
                        for(let i in Data) {
                            this.dataSource.push(
                                Data[i]
                            )
                        }
                        setTimeout(() => {
                            this.setState({
                                list: this.state.list.cloneWithRows(this.dataSource),
                                nomore:true,
                            });
                        },500);
                    }else{
                        this.setState({
                            nomore:true,
                        })
                    }
                })
                .catch((error) => {
                    this.setState({
                        requestFail:true,
                    })
                });
        page++;
    };
    //加载数据
    loadMore() {
        var url=Service.host+Service.dbList
                +'&module='+this.state.moduleType
                +'&keyword='+encodeURIComponent(this.state.searchText)+'&curpage='+page
                +'&pagenum=100&tokenID='+Service.tokenID;
         console.log('----------loadMore--------------');
        HttpUtil.get(url,this)
                .then((responseData) => {
                     console.log(responseData.list);
                    if(responseData.list){
                        let Data=responseData.list;
                        for(let i in Data) {
                            this.dataSource.push(
                                Data[i]
                            )
                        }
                        setTimeout(() => {
                            this.setState({
                                list: this.state.list.cloneWithRows(this.dataSource),
                                nomore:true,
                            });
                        },500);
                    }else{
                        this.setState({
                            nomore:true,
                        })
                    }
                })
                .catch((error) => {
                    this.setState({
                        requestFail:true,
                    })
                });
                page++;
        }
        //跳至详情页面
        onPressDetail(list){
            AsyncStorage.getItem('NeedUpdate',(error,result)=>{
                console.log(result);
                if(result=='true'){
                    ToastUtil.show('请升级后台系统 !');
                }else{
                    if(this.state.moduleType=='OA'){
                        var url=Service.host+Service.dbDetail
                        +'&cbilltype='+list.hidden_cbilltype
                        +'&cguid='+list.hidden_cguid
                        +'&cCheckWay='+list.hidden_ccheckway;
                        console.log()
                        HttpUtil.get(url,this)
                                .then((responseData) => {
                                    console.log(responseData);
                                    if(responseData.zdyExists==false){
                                        ToastUtil.show('该表单格式暂不支持,请通过pc审批 !');
                                    }else{
                                        this.props.navigator.push({
                                            name : 'CustomDocument',
                                            component : CustomDocument,
                                            params:{
                                                passProps:{list},
                                                //回调函数刷新页面
                                                callBackFun: () => {
                                                    this.reFreshPage();
                                                }
                                            }
                                        });
                                    }
                                })
                                .catch((error) => {});
                    }else{
                        this.props.navigator.push({
                            name : 'DetailMessage',
                            component : DetailMessage,
                            params:{
                                taskid:list.taskid,
                                passProps:{list},
                                callBackFun: () => {
                                    this.reFreshPage();
                                }
                            }
                        });
                    }
                }
            });

    };
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#F5FCFF',
    },
    barStyle:{
        height:30,
        backgroundColor:'#E8E8E8',
        justifyContent:'center',
        paddingLeft:5,
        marginLeft:5,
        marginRight:5,
    },
    barTitleStyle:{
        paddingLeft:5,
        color:'#989898',
    },
    rowStyle:{
        padding:10,
        backgroundColor:'#fff',
        borderBottomWidth:0.5,
        borderBottomColor:'#ccc',
        marginLeft:5,
        marginRight:5,
    },
    rowTitleNameStyle:{
        fontSize:13,
        marginRight:20,
    },
    rowNameStyle:{
        fontSize:12,
    },
    personImgStyle:{
        width:30,
        height:30,
    },
    phoneImgStyle:{
        width:30,
        height:30,
    },
});

