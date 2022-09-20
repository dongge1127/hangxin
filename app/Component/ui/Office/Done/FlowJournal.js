/**
 * Created by John on 2016-11-24.
 */
import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    ListView,
    ScrollView,
    ActivityIndicator,
    TouchableHighlight,
    TouchableOpacity,
    Platform,
    } from 'react-native';
import Toast from 'react-native-root-toast';
import Spinner from "react-native-loading-spinner-overlay";
import TimerMixin from "react-timer-mixin";
import Service from '../../service';
import CommonStyles from '../../../../style/CommonStyle';
import HttpUtil from '../../common/HttpUtil';
import TopBar from '../../APPComponent/TopBar';
import RequestFail from '../../APPComponent/RequestFail';
import ViewUtil from '../../common/ViewUtil';
export default class FlowJournal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            list:this.props.list,
            visible:false,
            requestFail:false,
        };
    };
    componentDidMount(){
         this.timer = TimerMixin.setTimeout(() => {
            this.fetchData();
        }, 500);
        this.setState({visible:true,tip:'数据加载中...'});
    }
    componentWillUnmount() {
        this.timer && TimerMixin.clearTimeout(this.timer);
    }
    fetchData() {
        var url;
        if(this.state.list.hidden_ccheckway==2){
            url=Service.host+Service.flowJournal
                +'&cguid='+this.state.list.hidden_cguid
                +'&action=flowlog';
        }else{
            url=Service.host+Service.flowJournal
                +'&cguid='+this.state.list.hidden_cguid
                +'&cbilltype='+this.state.list.hidden_cbilltype
                +'&action=flowlog';
        }
        HttpUtil.get(url,this)
                .then((responseData) => {
                    this.setState({
                        dataSource: this.state.dataSource.cloneWithRows(responseData),
                        visible:false,
                    });
                })
                .catch((error) => {
                    this.setState({
                        visible:false,
                        requestFail:true,
                    });
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
    }
    getData=()=>{
        this.setState({
            requestFail:false,
        });
        this.fetchData();
    }
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    };

    render() {
        let contentArea;
        if(this.state.requestFail==true){
            contentArea=<RequestFail onPress={this.getData.bind(this)}/>
        }else{
            //alert(this.state.requestFail);
            contentArea=
                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this.renderFlowJournal.bind(this)}
                    removeClippedSubviews={false}
                    style={styles.listView}
                />
        }
        return (
            <View style={CommonStyles.CommonWrapContainer}>
                <TopBar onPress={this.onPressBack} title="流程日志"/>
                {contentArea}
                <Spinner visible={this.state.visible} overlayColor={'rgba(0, 0, 0, 0.2)'}
                         textContent={this.state.tip} textStyle={{color: 'white'}}/>
            </View>
        );
    }
    renderFlowJournal(responseData) {
        
        return (
            <View style={{flexDirection:'row',alignItems:'center',}}>
                <View style={styles.pointStyle}>     
                </View>
                <View style={styles.ListViewContainerStyle}>
                    <View style={styles.messageContainer}>
                        <Text style={styles.messageDetailStyle}>操作人:{responseData.operatorname}</Text>
                        <Text style={styles.messageDetailStyle}>操作:{responseData.op}</Text>
                        <Text style={styles.messageDetailStyle}>操作时间:{responseData.endtime}</Text>
                    </View>
                </View>
            </View>
        );
    }
    
    
}

const styles = StyleSheet.create({
    ListViewContainerStyle:{
        width:ViewUtil.screenW-45,
        borderBottomWidth:1,
        borderColor:'rgba(100,53,201,0.1)',
        paddingBottom:6,
        paddingTop:6,
        backgroundColor:'#fff',
        borderWidth:1,
        borderRadius:5,
        marginLeft:10,
        marginRight:10,
        marginTop:5,
    },
    pointStyle:{
        width:10,
        height:10,
        borderRadius:5,
        overflow:'hidden',
        backgroundColor:"#e4393c",
        marginLeft:15,
        marginTop:5,
    },
    messageContainer: {
        flex: Platform.OS == 'ios' ? 0 : 1,
        justifyContent:'center',
        paddingLeft:10,
    },
    messageDetailStyle: {
        fontSize:13,
    },
});

