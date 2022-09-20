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
    ScrollView,
    Platform,
    ActivityIndicator,
    TouchableHighlight,
    TouchableOpacity,
    NetInfo,
    TouchableWithoutFeedback,
    Navigator,
    
} from 'react-native';
import {
    Dialog,
    } from 'rn-weui/src';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import Service from '../../service';
import dismissKeyboard from 'dismissKeyboard';
import ApplicationDetail from './ApplicationDetail';
import CheckApplication from './CheckApplication';
import CommonStyles from '../../../../style/CommonStyle';
import Spinner from "react-native-loading-spinner-overlay";
import NavigationBar from '../../APPComponent/NavigationBar';
import CommonModal from "../../APPComponent/CommonModal";
import TabBar from '../../Form/TabBar'
import HttpUtil from '../../common/HttpUtil';
import ViewUtil from '../../common/ViewUtil';
import RequestFail from '../../APPComponent/RequestFail';
let page=1;
import {PullList} from 'react-native-pull';
import Swipeable from 'react-native-swipeable';
var Dimensions = require('Dimensions');
var screenW = Dimensions.get('window').width;
var screenH = Dimensions.get('window').height;

let requestURL='';
export default class TabApplication extends Component {
	constructor(props) {
        super(props);
        this.dataSource = [];
        this.state = {
            visible:false,
            list: (new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})).cloneWithRows(this.dataSource),
            netState:Service.netState,
            time:new Date().toString(),
            requestFail:false,
            nomore:false,
            //三个页签样式
            Color1:'#FFF',     
            Color2:'#000',
            Color3:'#000',
            backgroundColor1:'#50B1F8',
            backgroundColor2:'#FFF',
            backgroundColor3:'#FFF',
            //弹框
            commonAlert:false,
            commonAlert1:false,
            commonAlertMsg:'',
            money:'',  //报销金额
        };
        this.loadMore = this.loadMore.bind(this);
    }
    /***********************页面初始函数********************/
    //页面初始状态清空数据源
    componentWillMount(){
        page=1;
        this.dataSource = [];
        this.setState({
            list: this.state.list.cloneWithRows(this.dataSource),
            nomore:false,
        });
    };
    //公共的弹出层窗口
    hideAlertDialog() {//点击确定跳转页面
        this.setState({commonAlert: false,});
        const { navigator } = this.props;
        if (navigator) {
            this.props.callBackFun();
            navigator.pop();
        }
    };
    hideAlertDialog1() {//点击确定不跳转
        this.setState({commonAlert1: false,});
    };
    onPressBack = () => {//页面返回
        const { navigator } = this.props;
        if (navigator) {
            page=1;
            navigator.pop();
        }
    };
    /***********************切换页签执行********************/
    changeTextStyle1= () => {
        if(this.state.Color1=='#000'){
            //因为设置状态是异步的，需要再设置样式改变之后再执行加载数据
            const changeStyle1 = async () => {
                await  this.setState({
                    Color1:'#FFF',
                    Color2:'#000',
                    Color3:'#000',
                    backgroundColor1:'#50B1F8',
                    backgroundColor2:'#FFF',
                    backgroundColor3:'#FFF',
                });
                page=1;
                this.dataSource = [];
                this.setState({
                    list: this.state.list.cloneWithRows(this.dataSource),
                    nomore:false,
                });
                    
                }
            changeStyle1(); 
            this.loadMore(); 
        }
    };
    changeTextStyle2= () => {
        if(this.state.Color2=='#000'){
            const changeStyle2 = async () => {
                 await  this.setState({
                    Color1:'#000',
                    Color2:'#FFF',
                    Color3:'#000',
                    backgroundColor1:'#FFF',
                    backgroundColor2:'#50B1F8',
                    backgroundColor3:'#FFF',
                });
                page=1;
                this.dataSource = [];
                this.setState({
                    list: this.state.list.cloneWithRows(this.dataSource),
                    nomore:false,
                });
                
            }
            changeStyle2();
            this.loadMore();
        }
    };
    changeTextStyle3= () => {
        if(this.state.Color3=='#000'){
            const changeStyle3 = async () => {
                await  this.setState({
                    Color1:'#000',
                    Color2:'#000',
                    Color3:'#FFF',
                    backgroundColor1:'#FFF',
                    backgroundColor2:'#FFF',
                    backgroundColor3:'#50B1F8',
                    });
                page=1;
                this.dataSource = [];
                this.setState({
                    list: this.state.list.cloneWithRows(this.dataSource),
                    nomore:false,
                });
                
            }
            changeStyle3(); 
            this.loadMore();
        }  
    };
    /********************下拉刷新用到的函数********************/
  	state = {
    	currentlyOpenSwipeable: null
  	};
  	handleScroll = () => {
    	const {currentlyOpenSwipeable} = this.state;
    	if (currentlyOpenSwipeable) {
      		currentlyOpenSwipeable.recenter();
    	}
  	};
    reFreshPage(){
        page=1;
        this.dataSource = [];
        /* this.setState({//报销明细、发票明细重新渲染组件
            list: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,}).cloneWithRows(this.dataSource),
        });*/
         if(this.state.Color1=='#FFF'){
            requestURL= Service.host+Service.tabApplication
                      +'&curpage='+page
                      + '&spzt=wtj';
        }else if(this.state.Color2=='#FFF'){
            requestURL= Service.host+Service.tabApplication
                      + '&curpage='+page
                      + '&spzt=spz';
        }else{
            requestURL= Service.host+Service.tabApplication
                      + '&curpage='+page
                      + '&spzt=ywc'; 
        }
        HttpUtil.get(requestURL,this)
            .then((responseData) => {
                console.log(responseData);
                if(responseData.list==null){
                    
                    setTimeout(() => {
                        this.setState({
                            list: this.state.list.cloneWithRows([])
                        });
                    },500);
                }else{
                    this.loadMore();
                }
            })
            .catch((error) => {});
        
    }
  	onPullRelease(resolve) {
	    setTimeout(() => {
            this.reFreshPage();
	        resolve();
	    }, 1000);
    }
	topIndicatorRender(pulling, pullok, pullrelease) {
		return (
	        <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 60}}>
	            <ActivityIndicator size="small" color="gray" />
	        </View>
		);
	}
    getTextWidth(){
        if(this.state.money==''||this.state.money==null){
            return null;
        }else{
            let arrView=[];
            for (let i=0;i<this.state.money.length;i++) {
                arrView.push(
                    <Image key={i} source={require('../../../../../img/dashLine.png')} style={{height:2,width:15,marginRight:5}} />
                );
            }
            return (
                <View style={{flexDirection:'row'}}>
                    {arrView}
                </View>
            );
        }
    }
    //页面组件渲染
  	render() {
        let tabNames = this.state.tabNames;
	    return (
	    	<View style={styles.container}>
	          	<View style={CommonStyles.CommonWrapContainer}>
                    <NavigationBar
                        leftAction={this.onPressBack.bind(this)}
                        leftImage={require('../../../../../img/back.png')}
                        title="报销申请"
                        rightTitle='新建'
                        rightAction={() => this._AddButtonAction()}/>
                    <View style={{backgroundColor:'#50B1F8'}}> 
                        <CommonModal
                            visible={this.state.commonAlert}
                            message={this.state.commonAlertMsg}
                            sureTitle='确定'
                            sureAction={this.hideAlertDialog.bind(this)}/>
                        <CommonModal
                            visible={this.state.commonAlert1}
                            message={this.state.commonAlertMsg}
                            sureTitle='确定'
                            sureAction={this.hideAlertDialog1.bind(this)}/>   
                       
                        <View style={{height:120,justifyContent:'center',alignItems:'center',}}>
                            <Text style={{fontSize:14,color:'#fff',}}>报销申请(元)</Text>
                            <Text style={{fontSize:34,color:'#fff',}}>{this.state.money}</Text> 
                            {this.getTextWidth()}
                        </View>
                        
                        <View style={{
                            height:60,
                            flexDirection:'row',
                            backgroundColor:'#fff',
                            justifyContent:'center',
                            alignItems:'center',
                        }}>
                        <TouchableOpacity onPress={this.changeTextStyle1}>
                            <View style={[styles.tabViewStyle,{backgroundColor:this.state.backgroundColor1,}]}>
                                <Text style={[styles.tabTextStyle,{color:this.state.Color1}]}>未提交</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.changeTextStyle2}>
                            <View style={[styles.tabViewStyle,{backgroundColor:this.state.backgroundColor2,borderLeftWidth:0,borderRightWidth:0}]}>
                                <Text style={[styles.tabTextStyle,{color:this.state.Color2}]}>审批中</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.changeTextStyle3}>
                            <View style={[styles.tabViewStyle,{backgroundColor:this.state.backgroundColor3,}]}>
                                <Text style={[styles.tabTextStyle,{color:this.state.Color3}]}>已完成</Text>
                            </View>
                        </TouchableOpacity>
                        </View>
                    </View>
                    
                    <PullList
                      style={{}}
                      onPullRelease={this.onPullRelease.bind(this)} 
                      topIndicatorRender={this.topIndicatorRender.bind(this)} 
                      topIndicatorHeight={60}
                      dataSource={this.state.list}
                      pageSize={5}
                      initialListSize={5}
                      renderRow={this.renderRow.bind(this)}
                      onEndReached={this.loadMore}
                      onEndReachedThreshold={60}
                      renderFooter={this.renderFooter.bind(this)}
                      enableEmptySections={true}
                    />
                    <Spinner visible={this.state.visible} overlayColor={'rgba(0, 0, 0, 0.2)'}
                         textContent={this.state.tip} textStyle={{color: 'white'}}/>
	        	</View>	
	      </View>
	    );
  	}
    //渲染行组件
  	renderRow(item, sectionID, rowID, highlightRow) {
        if(this.state.Color1=='#FFF'){
            return (
                <TouchableOpacity onPress={()=>this.onPressDetail(item)}>
                <View style={{alignItems:'center',}}>
                    <View style={[styles.listItem, {backgroundColor: '#fff',}]}>
                        <View style={styles.CellStyle}>
                            <Text style={styles.LeftTextStyle}>{item.bxyy}</Text>
                            <Text style={styles.RightTextStyle}>{item.bxrq}</Text>
                        </View>
                        <Image source={require('../../../../../img/dashBar.png')} style={{height:6,width:ViewUtil.screenW-30,}} />
                        <View style={styles.CellStyle}>
                            <View style={{alignItems:'center'}}>
                                <Text style={{fontSize:22,color:'#50B1F8',fontWeight:'bold'}}>{item.bxje}</Text>
                                <Text style={{fontSize:16,color:'#bcbcbc'}}>金额(元)</Text>
                            </View>
                            <View style={{alignItems:'center'}}>
                                <Text style={{fontSize:18,color:'#f39800',marginRight:15,fontWeight:'bold'}}>未提交</Text>
                                <Text style={{fontSize:16,color:'#bcbcbc',marginRight:15,marginTop:Platform.OS=='ios'?5:0,}}>报销状态</Text>
                            </View>
                        </View>
                        <Image source={require('../../../../../img/footBar.png')} style={{height:6,width:ViewUtil.screenW-10,}} />
                    </View>
                </View>
                </TouchableOpacity>
                     
            );
        }else if(this.state.Color2=='#FFF'){
            return(
                <TouchableOpacity onPress={()=>this.onPressCheckApplication(item)}>
                <View style={{alignItems:'center',}}>
                    <View style={[styles.listItem, {backgroundColor: '#fff',}]}>
                        <View style={styles.CellStyle}>
                            <Text style={styles.LeftTextStyle}>{item.bxyy}</Text>
                            <Text style={styles.RightTextStyle}>{item.bxrq}</Text>
                        </View>
                        <Image source={require('../../../../../img/dashBar.png')} style={{height:6,width:ViewUtil.screenW-30,}} />
                        <View style={styles.CellStyle}>
                            <View style={{alignItems:'center'}}>
                                <Text style={{fontSize:22,color:'#50B1F8',fontWeight:'bold'}}>{item.bxje}</Text>
                                <Text style={{fontSize:16,color:'#bcbcbc'}}>金额(元)</Text>
                            </View>
                            <View style={{alignItems:'center'}}>
                                <Text style={{fontSize:18,color:'#f39800',marginRight:15,fontWeight:'bold'}}>审批中</Text>
                                <Text style={{fontSize:16,color:'#bcbcbc',marginRight:15,marginTop:Platform.OS=='ios'?5:0,}}>报销状态</Text>
                            </View>
                        </View>
                        <Image source={require('../../../../../img/footBar.png')} style={{height:6,width:ViewUtil.screenW-10,}} />
                    </View>
                </View>
                </TouchableOpacity>
            )
        }else{
            return(
                <TouchableOpacity onPress={()=>this.onPressCheckApplication(item)}>
                <View style={{alignItems:'center',}}>
                    <View style={[styles.listItem, {backgroundColor: '#fff',}]}>
                        <View style={styles.CellStyle}>
                            <Text style={styles.LeftTextStyle}>{item.bxyy}</Text>
                            <Text style={styles.RightTextStyle}>{item.bxrq}</Text>
                        </View>
                        <Image source={require('../../../../../img/dashBar.png')} style={{height:6,width:ViewUtil.screenW-30,}} />
                        <View style={styles.CellStyle}>
                            <View style={{alignItems:'center'}}>
                                <Text style={{fontSize:22,color:'#50B1F8',fontWeight:'bold'}}>{item.bxje}</Text>
                                <Text style={{fontSize:16,color:'#bcbcbc'}}>金额(元)</Text>
                            </View>
                            <View style={{alignItems:'center'}}>
                                <Text style={{fontSize:18,color:'#f39800',marginRight:15,fontWeight:'bold'}}>已完成</Text>
                                <Text style={{fontSize:16,color:'#bcbcbc',marginRight:15,marginTop:Platform.OS=='ios'?5:0,}}>报销状态</Text>
                            </View>
                        </View>
                        <Image source={require('../../../../../img/footBar.png')} style={{height:6,width:ViewUtil.screenW-10,}} />
                    </View>
                </View>
                </TouchableOpacity>
            )
        }
    }
    //插件底部组件根据状态返回不同的组件
    renderFooter() {
        if(this.state.requestFail==true&&this.state.nomore==true){
            console.log('没有网络渲染组件');
            return(
                <RequestFail onPress={this.onPressSearch}/>
            )
        }
        if(!this.state.requestFail&&this.state.nomore) {
            return null;
        }
        return (
            <View style={{height: 100}}>
                <ActivityIndicator size="small" color="gray"/>
            </View>
        );
    }
    deleteRow=(item)=>{
        console.log(item);
        let url=Service.host+'mobile_em_expenseAccountBill'+'&action=delete&cguid='+item.hidden_cguid;
        HttpUtil.get(url,this)
            .then((responseData) => {
                console.log('点击删除返回的数据');
                console.log(responseData);
                if(responseData.msg){//删除成功
                   this.reFreshPage();
                }else if(responseData.errmsg){
                    this.setState({
                        commonAlertMsg:responseData.errmsg,
                        commonAlert:true,
                    });
                }
            })
            .catch((error) => {});
    };
    /***************当网络原因加载数据失败时，点击组件重新获取数据*********/
    onPressSearch = () => {
        this.dataSource = [];
        this.setState({
            requestFail:false,
        	nomore:false,
        });
        page=1;
        //每次搜索时把数据清空显示加载动画
        this.setState({
			list: this.state.list.cloneWithRows(this.dataSource)
		});
        HttpUtil.get(requestURL,this)
            .then((responseData) => {
               if(responseData.errmsg=='当前用户没有报销申请列表权限'){
                    this.setState({
                        commonAlertMsg:responseData.errmsg,
                        commonAlert:true,
                    });
                }
                if(responseData.list!=null){
                    let Data=responseData.list;
                    for(let i in Data) {
                        this.dataSource.push(
                            Data[i]
                        )
                    }
                    setTimeout(() => {
                        this.setState({
                            list: this.state.list.cloneWithRows(this.dataSource)
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
                    nomore:true,
                })
            });
        	page++;
    };
    /********************列表加载数据函数********************/
    loadMore() {
        //console.log('tab切换事件~~~~~~~~~~~~~~~~~~~~~`');
        //console.log(requestURL);

        if(this.state.Color1=='#FFF'){
            requestURL= Service.host+Service.tabApplication
                      +'&curpage='+page
                      + '&spzt=wtj';
        }else if(this.state.Color2=='#FFF'){
            requestURL= Service.host+Service.tabApplication
                      + '&curpage='+page
                      + '&spzt=spz';
        }else{
            requestURL= Service.host+Service.tabApplication
                      + '&curpage='+page
                      + '&spzt=ywc'; 
        }
        HttpUtil.get(requestURL,this)
            .then((responseData) => {
                console.log(responseData);
                this.setState({
                    money:responseData.zbxje,
                });
                if(responseData.errmsg=='当前用户没有报销申请列表权限'){
                    this.setState({
                        commonAlertMsg:responseData.errmsg,
                        commonAlert:true,
                    });
                }
                if(responseData.list!=null){
                    let Data=responseData.list;
                    for(let i in Data) {
                        this.dataSource.push(
                            Data[i]
                        )
                    }
                    setTimeout(() => {
                        this.setState({
                            list: this.state.list.cloneWithRows(this.dataSource)
                        });
                    },500);
                }else{
                	this.setState({
                		nomore:true,
                	})
                }
            })
            .catch((error) => {
                console.log('没有网络');
                this.setState({
                    requestFail:true,
                    nomore:true,
                })
            });
        	page++;
    	}
        
        /*********************新建报销单********************/
        _AddButtonAction = () => {
            this.setState({visible:true,tip:'数据加载中...'});
            let url=Service.host+'mobile_em_expenseAccountBill'+'&action=new';
            //console.log(url);
            HttpUtil.get(url,this)
                    .then((responseData) => {
                        this.setState({visible:false,});
                        //console.log(responseData);
                        if(responseData.errmsg){
                            this.setState({
                                commonAlertMsg:responseData.errmsg,
                                commonAlert1:true,
                             });
                        }
                        else{
                            this.props.navigator.push({
                                name: 'ApplicationDetail',
                                component: ApplicationDetail,
                                params: {
                                    callType: 'Add',
                                    //回调函数刷新列表
                                    callRefreshFun: () => {
                                        this.reFreshPage();
                                    }
                                }
                            })
                        }
                    })
                    .catch((error) => { this.setState({visible:false,});});
            
        }
        /******************点击报销单未提交列表进入详情********************/
    	onPressDetail=(item)=>{
            this.props.navigator.push({
                name : 'ApplicationDetail',
                component : ApplicationDetail,
                params:{
                    callType: 'Modify',
                    item:item,
                    //回调函数刷新页面
                    callRefreshFun: () => {
                        this.reFreshPage();
                    }
                }
            });
	    };
        /********************点击审批中、已完成列表进入详情********************/
        onPressCheckApplication=(item)=>{
            let type;
            if(this.state.Color2=='#FFF'){
                type='spz';
            }else if(this.state.Color3=='#FFF'){
                type='ywc';
            }
            this.props.navigator.push({
                name : 'CheckApplication',
                component : CheckApplication,
                params:{
                    callType: type,
                    passProps:{item}
                } 
            }) 
        }
}

const styles = StyleSheet.create({
	container: {
	    flex: 1,
	    flexDirection: 'column',
	    backgroundColor: '#F5FCFF',
	},
	listItem: {
        marginTop:10,
	    justifyContent: 'center',
        width:ViewUtil.screenW-30,
        overflow:'hidden',
	},
	rightSwipeItem: {
	    flex: 1,
        height: 75,
        marginTop:5,
	    justifyContent: 'center',
	    paddingLeft: 20,
	},
	ListViewContainerStyle:{
	    flexDirection:'row',
	    borderWidth:1,
	    borderColor:'rgba(100,53,201,0.1)',
	    backgroundColor:'#fff',
	    marginLeft:5,
	    marginRight:5,
	    marginTop:8,
	},
	rightContainer: {
	    width:ViewUtil.screenW-140,
	},
	listTextStyle: {
	    fontSize:13,
	    marginTop:3,
	}, 
    tabViewStyle:{
        height:40,
        width:screenW/3-10,
        justifyContent:'center',
        alignItems:'center',
        borderWidth:2,
        borderColor:'#50B1F8',
    },
    tabTextStyle:{
        fontSize:16,
    },
    //单行样式
    CellStyle:{
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor:'white',
        alignItems:'center',
        paddingTop:8,
        paddingBottom:6,
        borderBottomColor:'red',
        borderStyle:'dotted',
        borderBottomWidth:2,
        paddingLeft:15,
    },
    //一般单行布局
    LeftTextStyle:{
        color:'#606060',
        fontSize:16,
        width:ViewUtil.screenW*0.5,
    },
    RightTextStyle:{
        marginRight:15,
        fontSize:16,
        color:'#606060',
    },
    icon: {
        width: ViewUtil.screenW*0.9,
        height: 100,
        resizeMode: 'contain',
        alignSelf: 'center',
    },
});

