import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TouchableHighlight,
    ListView,
    Platform,
    Alert,
    Image,
    AsyncStorage,
    Linking,
    ScrollView,
    } from 'react-native';
import Service from '../../service';
/*导入公共样式*/
import CommonStyles from '../../../../style/CommonStyle';
import HttpUtil from '../../common/HttpUtil';
import TopBar from '../../APPComponent/TopBar';
let arrView=[];
let arr=[];
export default class SystemMessageDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            list: this.props.passProps.list,
            fileData:null,
        }
        this.fetchData();
    };
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            arr=[];
            navigator.pop();
        }
    };

    fetchData() {
        var url=Service.host+Service.noticeDetail
                +'&url='+this.state.list.url;
        //console.log(url);
        HttpUtil.get(url,this)
                .then((responseData) => {
                    console.log(responseData);
                    this.setState({
                        dataSource: this.state.dataSource.cloneWithRows(responseData.list),
                        fileData:responseData.file,
                    });
                })
                .catch((error) => {});
    }
    render() {
        return (
            <View style={CommonStyles.CommonWrapContainer}>
                <TopBar onPress={this.onPressBack} title={this.state.list.name}/>
                <ScrollView>
                 <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this.renderProduct.bind(this)}
                    style={styles.listView}
                    removeClippedSubviews={false}
                    enableEmptySections={true}
                />
                </ScrollView>
            </View>
        );
    };
    renderProduct(col,i,list) {
        //console.log(col);
        return (
            <View style={{borderBottomColor:'#e8e8e8',borderBottomWidth:1,}}>
                <View style={styles.ListViewContainerStyle} key={list.cattachgroupguid}>
                    <View style={styles.messageContainer}>
                        <Text style={styles.messageDetailStyle}>消息内容:{col.消息内容}</Text>
                        <Text style={styles.messageDetailStyle}>创建时间:{col.创建时间}</Text>
                        <Text style={styles.messageDetailStyle}>消息名称:{col.消息名称}</Text>
                        <Text style={styles.messageDetailStyle}>发送人:{col.发送人}</Text>
                    </View>
                </View>
                <View style={styles.CellStyle}>{this.file(col,i,list)}</View>
            </View>
        );
    }
    file(col,i,list){
        if(col.cattachgroupguid){
            arrView=[];
            arr=[];
            for(var m=0;m<this.state.fileData.length;m++){
                if(this.state.fileData[m].cgroupguid==col.cattachgroupguid){
                    arr.push(this.state.fileData[m]);
                    for(var n=0;n<arr.length;n++){
                        let file = arr[n];
                        let pos=arr[n].cfilename.split("_")[0].length+1;
                        let fileName = arr[n].cfilename.slice(pos);
                        arrView.push(
                            <TouchableOpacity onPress={(e) => this.onPressFile(e,file)} key={n}>
                                <Text style={{paddingLeft:5,color:'#50B1F8'}}>{fileName}</Text>
                            </TouchableOpacity>
                        );
                    }  
                }
            }
            return arrView;
        }else{
            return null;
        }
    };
    onPressFile=(e,file)=>{
        AsyncStorage.getItem('ServiceUrl',(error,result)=>{
            var fullUrl = result+"/download.do?cFileUrl="+file.cfileurl+'&cFileName='+file.cfilename;
            console.log(fullUrl);
            Linking.openURL(encodeURI(fullUrl))
            .catch((err)=>{
                //console.log('An error occurred', err);
            });
        });
    };
}

const styles = StyleSheet.create({
    ListViewContainerStyle:{
        flexDirection:'row',
        paddingBottom:6,
        paddingTop:6,
        backgroundColor:'#fff',
    },
    messageContainer: {
        flex:1,
        justifyContent:'center',
        paddingLeft:8,
    },
    messageDetailStyle:{
        padding:5,
    },
    CellStyle:{
        backgroundColor:'white',
        padding:8,
    },
});

