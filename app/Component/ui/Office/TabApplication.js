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
import Service from '../service';
import dismissKeyboard from 'dismissKeyboard';
import CatchError from '../CatchError';
import KCDetailComponent from './KucunDetail';
import CommonStyles from '../../../style/CommonStyle';
import ScrollableTabView from 'react-native-scrollable-tab-view'
import TopBar from '../APPComponent/TopBar';
import TabBar from '../Form/TabBar'
import HttpUtil from '../common/HttpUtil';
import ViewUtil from '../common/ViewUtil';
import RequestFail from '../APPComponent/RequestFail';
let page=1;
import {PullList} from 'react-native-pull';
import Swipeable from 'react-native-swipeable';

var Dimensions = require('Dimensions');
var screenW = Dimensions.get('window').width;
var screenH = Dimensions.get('window').height;

export default class TabApplication extends Component {
	constructor(props) {
        super(props);
        this.dataSource = [];
        this.state = {
            list: (new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})).cloneWithRows(this.dataSource),
            netState:Service.netState,
            time:new Date().toString(),
            requestFail:false,
            nomore:false,
            Color1:'#FFFF00',
            Color2:'#FFF',
            Color3:'#FFF',
            BottomColor1:'#FFFF00',
            BottomColor2:'#5A8ECB',
            BottomColor3:'#5A8ECB',
        };
        this.renderRow = this.renderRow.bind(this);
        this.renderFooter = this.renderFooter.bind(this);
        this.loadMore = this.loadMore.bind(this);
        this.topIndicatorRender = this.topIndicatorRender.bind(this);
        // this.loadMore();
    }
    componentWillMount(){
        //this.fetchData();
    };
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            page=1;
            navigator.pop();
        }
    };
    changeTextStyle1= () => {
        if(this.state.Color1=='#FFF'){
            this.setState({
                Color1:'#FFFF00',
                Color2:'#FFF',
                Color3:'#FFF',
                BottomColor1:'#FFFF00',
                BottomColor2:'#5A8ECB',
                BottomColor3:'#5A8ECB',
            });
        }
    };
    changeTextStyle2= () => {
        if(this.state.Color2=='#FFF'){
            this.setState({
                Color1:'#FFF',
                Color2:'#FFFF00',
                Color3:'#FFF',
                BottomColor1:'#5A8ECB',
                BottomColor2:'#FFFF00',
                BottomColor3:'#5A8ECB',
            });
        }
    };
    changeTextStyle3= () => {
        if(this.state.Color3=='#FFF'){
            this.setState({
                Color1:'#FFF',
                Color2:'#FFF',
                Color3:'#FFFF00',
                BottomColor1:'#5A8ECB',
                BottomColor2:'#5A8ECB',
                BottomColor3:'#FFFF00',
            });
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
  	onPullRelease(resolve) {
	    setTimeout(() => {
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
  	render() {
        let tabNames = this.state.tabNames;
	    return (
	    	<View style={styles.container}>
	          	<View style={CommonStyles.CommonWrapContainer}>
	                <TopBar onPress={this.onPressBack} title="报销申请"/>
                    <View style={{height:200,backgroundColor:'#5A8ECB'}}>                        
                        <View style={{height:150,justifyContent:'center',alignItems:'center',}}>
                            <Text style={{fontSize:24,color:'#fff'}}>报销申请(元)</Text>
                            <Text style={{fontSize:24,color:'#fff'}}>1000.00</Text>                    
                        </View>
                        <View style={{
                                    flexDirection:'row',
                                    backgroundColor:'#5A8ECB',
                                    paddingBottom:20,
                        }}>
                        <TouchableOpacity onPress={this.changeTextStyle1}>
                            <View style={styles.tabViewStyle}>
                                <Text style={[styles.tabTextStyle,
                                    {color:this.state.Color1,
                                     borderBottomColor:this.state.BottomColor1}]}>未提交
                                </Text>                          
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.changeTextStyle2}>
                            <View style={styles.tabViewStyle}>
                                <Text style={[styles.tabTextStyle,
                                    {color:this.state.Color2,
                                     borderBottomColor:this.state.BottomColor2}]}>审批中
                                </Text>                            
                            </View> 
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.changeTextStyle3}> 
                            <View style={styles.tabViewStyle}>
                                <Text style={[styles.tabTextStyle,
                                    {color:this.state.Color3,
                                     borderBottomColor:this.state.BottomColor3}]}>已完成
                                </Text>
                            </View>
                        </TouchableOpacity>                      
                    </View>
                    </View>
                    
                    <PullList
                      style={{}}
                      onPullRelease={this.onPullRelease} topIndicatorRender={this.topIndicatorRender} topIndicatorHeight={60}
                      dataSource={this.state.list}
                      pageSize={5}
                      initialListSize={5}
                      renderRow={this.renderRow}
                      onEndReached={this.loadMore}
                      onEndReachedThreshold={60}
                      renderFooter={this.renderFooter}
                      enableEmptySections={true}
                    />
	        	</View>	
	      </View>
	    );
  	}
  	renderRow(item, sectionID, rowID, highlightRow) {
	    return (
	        <View style={styles.ListViewContainerStyle} key={item.hidden_cguid}>
	            <View style={styles.rightContainer}>
	            	<Swipeable
      					rightButtons={[
					        <TouchableOpacity onPress={()=>alert('删除')} style={[styles.rightSwipeItem, {backgroundColor: '#e4393c'}]}>
					          <Text>删除</Text>
					        </TouchableOpacity>
					    ]}>
					    <TouchableOpacity onPress={()=>this.onPressDetail(item)}>
					      <View style={[styles.listItem, {backgroundColor: '#fff'}]}>
					        <Text style={styles.listTextStyle}>费用:{item.cunitname}</Text>
					        <Text style={styles.listTextStyle}>费用产生:{item.icurquan}</Text>
					      </View>
					    </TouchableOpacity>
    				</Swipeable>
	            </View>
	        </View>   
	    );
    }
    renderFooter() {
        if(this.state.requestFail&&!this.state.nomore){
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
    //搜索数据
    onPressSearch = () => {
        dismissKeyboard();//点击搜索按钮收回软键盘
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
        var url=Service.host+Service.getmatstock
                +'&keyword='+encodeURIComponent(this.state.searchText)
                +'&curpage='+page
                +'&pagenum=100';
        HttpUtil.get(url,this)
            .then((responseData) => {
                if(responseData.matstock){                  
                    let Data=responseData.matstock;
			        for(let i in Data) {
			            this.dataSource.push(
			                Data[i]
			            )
			        }
			        setTimeout(() => {
			            this.setState({
			                list: this.state.list.cloneWithRows(this.dataSource)
			            });
		 			}, 500);
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
    //加载数据
    loadMore() {
        var url=Service.host+Service.getmatstock
                +'&curpage='+page
                +'&pagenum=100';
        HttpUtil.get(url,this)
            .then((responseData) => {
                if(responseData.matstock){                   
                    let Data=responseData.matstock;
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
    	}
    	onPressDetail(item){
	        NetInfo.isConnected.fetch().done(
	            (isConnected) => { 
	                (isConnected ? 
	                    this.props.navigator.push({
	                        name : 'KCDetailComponent',
	                        component : KCDetailComponent,
	                        params:{
	                            passProps:{item}
	                        }
	                    }) : 
	                    this.props.navigator.push({
	                        name : 'CatchError',
	                        component : CatchError,
	                }));
	             }
	        );  
	    };
}
const styles = StyleSheet.create({
	container: {
	    flex: 1,
	    flexDirection: 'column',
	    backgroundColor: '#F5FCFF',
	},
	listItem: {
	    height: 75,
	    justifyContent: 'center',
	    marginLeft:10,
	},
	rightSwipeItem: {
	    flex: 1,
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
	    flex: Platform.OS == 'ios' ? 0 : 1,
	},
	listTextStyle: {
	    fontSize:Platform.OS == 'ios' ? 14 : 13,
	    marginTop:3,
	}, 
    tabViewStyle:{
        height:50,
        width:screenW/3,
        justifyContent:'center',
        alignItems:'center',
    },
    tabTextStyle:{
        fontSize:16,
        borderBottomWidth:2,
        paddingBottom:5,
    },

});

