/**
 * Created by John on 2016-11-24.
 */
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ListView,
    TouchableOpacity,
    Platform,
    NetInfo,
    ActivityIndicator,
    BackAndroid,
    } from 'react-native';
import {PullList} from 'react-native-pull';
import Service from '../../service';
import CatchError from '../../CatchError';
import SystemMessageDetail from './SystemMessageDetail';
import ToastUtil from "../../common/ToastUtil";
/*导入公共样式*/
import CommonStyles from '../../../../style/CommonStyle';
import HttpUtil from '../../common/HttpUtil';
import NavigationBar from "../../APPComponent/NavigationBar";
export default class SystemMessageList extends Component {
    constructor(props) {
        super(props);
        this.dataSource = [];
        this.state = {
            list: (new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})).cloneWithRows(this.dataSource),
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            userName:this.props.userName,
        };
    };
    componentDidMount(){
        BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid);
        this.fetchData();
    };
    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
    };
    fetchData() {
        var url=Service.host+Service.noticeList+'&noticeType=4'  ;
        HttpUtil.get(url,this)
                .then((responseData) => {
                    console.log(responseData);
                    this.setState({
                        list: this.state.dataSource.cloneWithRows(responseData.list),
                    });
                })
                .catch((error) => {
                });
    }
   onPressBack = () => {
        this.props.callFun();
        this.props.navigator.pop();
    };
    onBackAndroid=()=>{
        if (this.props.navigator) {
            this.props.callFun();
            this.props.navigator.pop();
            return true;
        }
    };
    //下拉刷新函数
    reFreshPage(){
        this.dataSource = [];
        var url=Service.host+Service.noticeList+'&noticeType=4'  ;
        HttpUtil.get(url,this)
            .then((responseData) => {
                console.log(responseData);
                this.setState({
                    list: this.state.dataSource.cloneWithRows(responseData.list),
                });
            })
            .catch((error) => {
                ToastUtil.show('网络原因数据加载失败');
            });
    }
    onPullRelease(resolve) {
        setTimeout(() => {
            this.reFreshPage();
            resolve();
        }, 1000);
    }

    topIndicatorRender(pulling, pullok, pullrelease) {
        return (
            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 60,}}>
                <ActivityIndicator size="small" color="gray" />
            </View>
        );
    }

    render() {
        return (
            <View style={CommonStyles.CommonWrapContainer}>
                <NavigationBar
                    leftAction={this.onPressBack}
                    leftImage={require('../../../../../img/back.png')}
                    title={'系统通知'}/>
                <PullList
                    style={{}}
                    onPullRelease={this.onPullRelease.bind(this)}
                    topIndicatorRender={this.topIndicatorRender}
                    topIndicatorHeight={60}
                    dataSource={this.state.list}
                    pageSize={5}
                    initialListSize={5}
                    renderRow={this.renderRow.bind(this)}
                    onEndReached={this.fetchData}
                    onEndReachedThreshold={60}
                    renderFooter={this.renderFooter}
                    enableEmptySections={true}
                />
            </View>
        );
    }
    renderRow(list) {
        return (
            <TouchableOpacity onPress={()=>this.onPressDetail(list)}>
                <View style={styles.ListViewContainerStyle} key={list.cguid}>
                    <View style={styles.messageContainer}>
                        <Text numberOfLines={1} style={styles.messageListTitleStyle}>{list.content}</Text>
                        <Text style={styles.messageDetailStyle}>消息类型:{list.name}</Text>
                        <Text style={styles.messageDetailStyle}>发送时间:{list.createdate}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
    onPressDetail(list){
        this.props.navigator.push({
            name : 'SystemMessageDetail',
            component : SystemMessageDetail,
            params:{
                passProps:{list}
            }
        })
    }
}

const styles = StyleSheet.create({
    ListViewContainerStyle:{
        flexDirection:'row',
        borderBottomWidth:1,
        borderColor:'rgba(100,53,201,0.1)',
        paddingBottom:6,
        paddingTop:6,
        height:100,
        backgroundColor:'#fff',
        borderWidth:1,
        borderRadius:5,
        marginLeft:5,
        marginRight:5,
        marginTop:5,
    },
    messageContainer: {
        flex: Platform.OS == 'ios' ? 0 : 1,
        justifyContent:'center',
        paddingLeft:10,
    },
    messageListTitleStyle: {
        fontSize:13,
        color:'#50B1F8',
    },
    messageDetailStyle: {
        fontSize:13,
    },
});

