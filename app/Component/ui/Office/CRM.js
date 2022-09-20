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
    Linking,
    Dimensions,
    BackAndroid,
} from 'react-native';
import {PullList} from 'react-native-pull';
import Swipeable from 'react-native-swipeable';
import Service from '../service';
import dismissKeyboard from 'dismissKeyboard';
import CatchError from '../CatchError';
import CrmDetail from './CrmDetail';
import CommonStyles from '../../../style/CommonStyle';
import EmojiUtil from "../common/EmojiUtil";
import HttpUtil from '../common/HttpUtil';
import RequestFail from '../APPComponent/RequestFail';
import NavigationBar from "../APPComponent/NavigationBar";

let bar=[];
let page=1;
let isHasPhone=true;

//调取电话组件
class CustomButton extends Component{
    propTypes:{
        url:React.PropTypes.string,
    };
    render(){
        return (
            <TouchableHighlight
                style={{position:'absolute',right:40}}
                underlayColor="#fff"
                onPress={() => Linking.canOpenURL(this.props.url).then(supported => {
                    if(this.props.url!='tel:null'){
                        if(supported){
                            Linking.openURL(this.props.url);
                        }else{
                            console.log('不支持:'+this.props.url);
                        }
                    }
                })} >
                <View>{this.isHasPhone()}</View>
            </TouchableHighlight>
        )
    };
    isHasPhone(){
        if(isHasPhone==true){
            return(
                <View>
                    <Image source={require('../../../../img/phoneg2.png')} style={styles.phoneImgStyle}/>
                </View>
            );
        }else{
            return(
                <View>
                    <Image source={require('../../../../img/phoneg1.png')} style={styles.phoneImgStyle}/>
                </View>
            );
        }
    };
};

export default class CRM extends Component {
    constructor(props) {
        super(props);
        this.dataSource = [];
        this.state = {
            list: (new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})).cloneWithRows(this.dataSource),
            netState:Service.netState,
            requestFail:false,
            nomore:false,
            searchText:'',
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
    componentDidMount(){
        BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid);

    };
    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
    };

    onBackAndroid=()=>{
        if (this.props.navigator) {
            bar=[];
            page=1;
            this.props.navigator.pop();
            return true;
        }
    };
    //禁止输入emoji
    onChangeText(text){
        text = EmojiUtil.FilterEmoji(text);
        this.setState({searchText:text,})
    }
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            bar=[];
            page=1;
            navigator.pop();
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
        this.dataSource = [];
        bar=[];
        page=1;
        if(this.state.searchText==''){
            url=Service.host+Service.crmList
                +'&curpage='+page
                +'&pagenum=100';
        }else{
            url=Service.host+Service.crmList
                +'&keyword='+encodeURIComponent(this.state.searchText)
                +'&curpage='+page
                +'&pagenum=100';
        }
        console.log('下拉刷新');

        HttpUtil.get(url,this)
            .then((responseData) => {
                if(responseData.customerlist!=null){
                    let Data=responseData.customerlist;
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
                    });
                }
            })
            .catch((error) => {
                this.setState({
                    requestFail:true,
                })
            });
        page++;
    }
    onPullRelease(resolve) {
        setTimeout(() => {
            this.reFreshPage();
            resolve();
        }, 1000);
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
            <View style={styles.container}>
                <View style={CommonStyles.CommonWrapContainer}>
                    <NavigationBar
                        leftAction={this.onPressBack}
                        leftImage={require('../../../../img/back.png')}
                        title={'客户列表'}/>
                    <View style={CommonStyles.CommonInputItem}>
                        <TextInput
                            style={CommonStyles.CommonTextInput}
                            placeholder="按客户名称、助记码、联系人、手机查找"
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
                                <Image source={require('../../../../img/search.png')} style={CommonStyles.CommonSearchImg} />
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
        if(bar.toString().indexOf(item.firstletter) > -1) {
            //console.log('数组中有这个字母');
            bar.push(item.firstletter);
            return (
             <TouchableOpacity onPress={()=>{this.changedata(item)}} key={item.hidden_csupguid}>
                <View style={styles.rowStyle}>
                    <Text numberOfLines={1} style={styles.rowTitleNameStyle}>{item.cname}</Text>
                    <View style={{flexDirection:'row',alignItems:'flex-end',}}>
                        <View>{this.isHasPhoneNumber(item.cmobil)}</View>
                        <Text style={styles.rowNameStyle}>{item.cmobil}</Text>
                        <CustomButton url={'tel:'+item.cmobil}/>
                    </View>
                </View> 
            </TouchableOpacity>
            );
        }else{
           //console.log('数组中没有这个字母');
           bar.push(item.firstletter);
           return (
             <View>
                <View style={styles.barStyle}>
                    <Text  style={styles.barTitleStyle}>{item.firstletter}</Text>
                </View>
                <TouchableOpacity onPress={()=>{this.changedata(item)}} key={item.hidden_csupguid}>
                    <View style={styles.rowStyle}>
                        <Text numberOfLines={1} style={styles.rowTitleNameStyle}>{item.cname}</Text>
                        <View style={{flexDirection:'row',alignItems:'flex-end',}}>
                            <View>{this.isHasPhoneNumber(item.cmobil)}</View>
                            <Text style={styles.rowNameStyle}>{item.cmobil}</Text>
                            <CustomButton url={'tel:'+item.cmobil}/>
                        </View>
                    </View> 
                </TouchableOpacity>
            </View> 
            );
        }
    }
    isHasPhoneNumber(cmobil){
        isHasPhone=false;
        if(cmobil==null){
            isHasPhone=false;
            return(
                <Image style={styles.personImgStyle} source={require('../../../../img/per1.png')}/>
            );
        }else{
            isHasPhone=true;
            return(
                <Image style={styles.personImgStyle} source={require('../../../../img/per2.png')}/>
            );
        }
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
        bar=[];
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
        var url=Service.host+Service.crmList
                +'&keyword='+encodeURIComponent(this.state.searchText)
                +'&curpage='+page
                +'&pagenum=100';
        HttpUtil.get(url,this)
                .then((responseData) => {
                    if(responseData.customerlist){
                        //当进行搜索时,不进行字母分组
                        for(let k =0;k<responseData.customerlist.length;k++){
                            responseData.customerlist[k]["firstletter"] = ""
                        }                   
                        let Data=responseData.customerlist;
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
                    })
                });
        page++;
    };
    //加载数据
    loadMore() {
        bar=[];
        var url;
        if(this.state.searchText==''){
            url=Service.host+Service.crmList
                +'&curpage='+page
                +'&pagenum=100';
        }else{
            url=Service.host+Service.crmList
                +'&keyword='+encodeURIComponent(this.state.searchText)
                +'&curpage='+page
                +'&pagenum=100';
        }
        console.log('加载数据执行');
        console.log(bar);
        console.log(url);
        HttpUtil.get(url,this)
                .then((responseData) => {
                    if(responseData.customerlist!=null){                   
                        let Data=responseData.customerlist;
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
                        });
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
    changedata=(rowData)=>{
        this.props.navigator.push({
            name : 'CrmDetail',
            component : CrmDetail,
            params:{
                 passProps:{rowData},
                 //回掉函数
            }
        })
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

