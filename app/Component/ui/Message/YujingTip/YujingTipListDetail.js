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
    AsyncStorage,
    Alert,
    Image,
    Linking,
    } from 'react-native';
import Service from '../../service';
export default class YujingTipListDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            list: this.props.passProps.list,
            noticeData:'',
            fileData:null,
        }
        
        this.fetchData();
    };
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    };

    fetchData() {
        var url=Service.host+Service.noticeDetail
                +'&url='+this.state.list.url;
        console.log(url);
        fetch(url)
            .then((response) => response.json())
            .then((responseData) => {
                console.log(responseData);
                /*this.setState({
                    noticeData:responseData.list[0],
                    fileData:responseData.file,
                });*/
            })
            .catch((error) => {
                console.error(error);
            });
    }
    render() {
        return (
            <View style={{flex: Platform.OS == 'ios' ? 0 : 1,backgroundColor: '#F5F5F5'}}>
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={this.onPressBack}>
                        <Image source={require('../../../../../img/back.png')} style={styles.backImgStyle} />
                    </TouchableOpacity>
                    <Text style={styles.topText}>{this.state.list.ccode}</Text>
                    <View style={{height:30,width:38}}></View>
                </View>
                <View>{this.noticeData()}</View>
                <View>{this.fileData()}</View>
            </View>
        );
    };
    noticeData(){
        var arrView=[];
        var object=this.state.noticeData;
        //console.log(object);
        for (var prop in object) {
            if (object.hasOwnProperty(prop)) {
                //console.log("键：" + prop + "值：" + object[prop]);
                arrView.push(
                    <View style={styles.CellStyle} key={prop}>
                        <Text style={styles.LeftTextStyle}>{prop}</Text>
                        <Text style={styles.RightTextStyle}>{object[prop]}</Text>
                    </View>
                );
            }
        }

        return arrView;
    };
    fileData(){
        if(this.state.fileData==null){
            return null;
        }else{
            console.log(this.state.fileData);
            return (
                <View style={{marginTop:10}}>
                    <View style={styles.CellStyle}>
                        <Text style={{paddingLeft:8}}>附件</Text>
                    </View>
                    <View style={styles.CellStyle}>
                        <TouchableOpacity onPress={this.onPressFile}>
                            <Text style={{paddingLeft:8,color:'#50B1F8'}}>{this.state.fileData[0].cfilename}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )
        }  
    };
    onPressFile=()=>{
        //var url="http://192.168.35.166:8891/A6/"+this.state.fileData[0].cfileurl+'/'+this.state.fileData[0].cfilename;
            let result = Service.host.split("/pt")[0];
             
            var fullUrl = result+"/download.do?cFileUrl="+this.state.fileData[0].cfileurl+'&cFileName='+this.state.fileData[0].cfilename;
          
            console.log(fullUrl);


            Linking.openURL(encodeURI(fullUrl))
            .catch((err)=>{
                console.log('An error occurred', err);
            });
       
    };
}

const styles = StyleSheet.create({
    topBar:{
        height:50,
        backgroundColor:'#50B1F8',
        flexDirection: 'row',
        alignItems: 'center',
    },
    topText:{
        color:'#fff',
        fontSize:18,
        marginLeft:90,
    },
    backImgStyle:{
        width:30,
        height:30,
        marginLeft:8,
    },
    ListViewContainerStyle:{
        flexDirection:'row',
        borderBottomWidth:1,
        borderColor:'rgba(100,53,201,0.1)',
        paddingBottom:6,
        paddingTop:6,
        height:80,
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
        borderBottomWidth:0.5,
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
        height:Platform.OS == 'ios' ? 55 : 50,
    },
    Title:{
        marginLeft:8,
        fontSize:16,
    },
    CellStyle:{
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor:'white',
        alignItems:'center',
        height:Platform.OS == 'ios' ? 45 : 40,
        borderBottomColor:'#e8e8e8',
        borderBottomWidth:0.5,
    },
    LeftTextStyle:{
        marginLeft:8,
        fontSize:16,
    },
    RightTextStyle:{
        marginRight:8,
        fontSize:16,
    },

    btnContainerStyle:{
        flexDirection:'row',
        marginTop:20,
    },
    btnType0Agree:{
        width:80,
        height:40,
        backgroundColor:'#50B1F8',
        padding:5,
        borderRadius:6,
        justifyContent:'center',
        alignItems:'center',
        marginLeft:140,
    },
    btnType1Agree:{
        width:120,
        height:40,
        backgroundColor:'#50B1F8',
        padding:5,
        borderRadius:6,
        justifyContent:'center',
        alignItems:'center',
        marginLeft:120,
    },
    btnAgree:{
        width:120,
        height:40,
        backgroundColor:'#50B1F8',
        padding:5,
        borderRadius:6,
        justifyContent:'center',
        alignItems:'center',
        marginLeft:120,
    },
    btnBackStep:{
        marginLeft:50,
        marginRight:20,
        width:100,
        height:40,
        backgroundColor:'#50B1F8',
        borderRadius:5,
        justifyContent:'center',
        alignItems:'center',
    },
    btnBackPerson:{
        width:100,
        height:40,
        backgroundColor:'#50B1F8',
        padding:5,
        borderRadius:6,
        justifyContent:'center',
        alignItems:'center',
    },

});

