/**
 * Created by John on 2016-11-24.
 */
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Platform,
    NetInfo,
} from 'react-native';
import Service from '../../service';
import CatchError from '../../CatchError';
import DoneMessageList from './DoneMessageList';
import HttpUtil from '../../common/HttpUtil';
/*导入公共样式*/
import CommonStyles from '../../../../style/CommonStyle';
import Toast from 'react-native-root-toast';
import ViewUtil from '../../common/ViewUtil';
import NavigationBar from "../../APPComponent/NavigationBar";
import Spinner from "react-native-loading-spinner-overlay";
export default class DoneClass extends Component {
    constructor(props) {
        super(props);
        this.state = {
                EM:'',
                OA:'',
                MA:'',
                FI:'',
                PU:'',
                SA:'',
                ST:'',
                IB:'',
                PM:'',
                BG:'',
        };
    };
    componentWillMount(){
        this.fetchData();
    };
    fetchData() {
        var url=Service.host+Service.ybmodules+'&tokenID='+Service.tokenID;
        console.log(url);
        this.setState({visible:true,tip:''});
        HttpUtil.get(url,this)
                .then((responseData) => {
                    console.log(responseData);
                    this.setState({
                        FI:responseData.modulelist[0]['FI'],
                        PU:responseData.modulelist[1]['PU'],
                        ST:responseData.modulelist[2]['ST'],
                        SA:responseData.modulelist[3]['SA'],
                        IB:responseData.modulelist[4]['IB'],
                        PM:responseData.modulelist[5]['PM'],
                        BG:responseData.modulelist[6]['BG'],
                    });
                    this.setState({visible:false,tip:''});
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
                    this.setState({visible:false,tip:''});
                });
    };
    //刷新页面
    componentWillReceiveProps(nextProps){
        this.fetchData();
    };
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    }; 
    /*待办分类（
      借款报销EM、
      协同办公OA、
      生产审批MA、
      财务审批FI、
      采购审批PU、
      销售审批SA、
      库存审批ST
      ）*/
    //借款报销EM
    goToDoneList=(type)=>{
        this.props.navigator.push({
            name : 'DoneMessageList',
            component : DoneMessageList,
            params:{
                moduleType:type,
            }
        })
    }
    render() {
        return (
            <View style={CommonStyles.CommonWrapContainer}>
                <NavigationBar
                    leftAction={this.onPressBack}
                    leftImage={require('../../../../../img/back.png')}
                    title={'已办事项'}/>
                <View>
                    <TouchableOpacity onPress={() => this.goToDoneList('FI')}>
                        <View style={[styles.cellContainer,{marginTop:20}]}>
                            <View style={styles.leftViewStyle}>
                                <Image source={require('../../../../../img/caiwushenpi.png')} style={styles.leftImgStyle} />
                                <Text style={styles.leftTitleStyle}>财务审批</Text>
                            </View>
                            <View style={styles.rightViewStyle}>
                                <View>{this.isHiddenTextFI()}</View>
                                <Image source={require('../../../../../img/rarrow.png')} style={{width:8, height:13, marginRight:8, marginLeft:5}} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.goToDoneList('PU')}>
                        <View style={[styles.cellContainer,{marginTop:20}]}>
                            <View style={styles.leftViewStyle}>
                                <Image source={require('../../../../../img/caigoushenpi.png')} style={styles.leftImgStyle} />
                                <Text style={styles.leftTitleStyle}>采购审批</Text>
                            </View>
                            <View style={styles.rightViewStyle}>
                                <View>{this.isHiddenTextPU()}</View>
                                <Image source={require('../../../../../img/rarrow.png')} style={{width:8, height:13, marginRight:8, marginLeft:5}} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.goToDoneList('ST')}>
                        <View style={styles.cellContainer}>
                            <View style={styles.leftViewStyle}>
                                <Image source={require('../../../../../img/kucunshenpi.png')} style={styles.leftImgStyle} />
                                <Text style={styles.leftTitleStyle}>库存审批</Text>
                            </View>
                            <View style={styles.rightViewStyle}>
                                <View>{this.isHiddenTextST()}</View>
                                <Image source={require('../../../../../img/rarrow.png')} style={{width:8, height:13, marginRight:8, marginLeft:5}} />
                            </View>
                        </View>
                    </TouchableOpacity>
                     <TouchableOpacity onPress={() => this.goToDoneList('SA')}>
                        <View style={styles.cellContainer}>
                            <View style={styles.leftViewStyle}>
                                <Image source={require('../../../../../img/xiaoshoushenpi.png')} style={styles.leftImgStyle} />
                                <Text style={styles.leftTitleStyle}>销售审批</Text>
                            </View>
                            <View style={styles.rightViewStyle}>
                                <View>{this.isHiddenTextSA()}</View>
                                <Image source={require('../../../../../img/rarrow.png')} style={{width:8, height:13, marginRight:8, marginLeft:5}} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.goToDoneList('IB')}>
                        <View style={styles.cellContainer}>
                            <View style={styles.leftViewStyle}>
                                <Image source={require('../../../../../img/xietongbangong.png')} style={styles.leftImgStyle} />
                                <Text style={styles.leftTitleStyle}>内部交易审批</Text>
                            </View>
                            <View style={styles.rightViewStyle}>
                                <View>{this.isHiddenTextIB()}</View>
                                <Image source={require('../../../../../img/rarrow.png')} style={{width:8, height:13, marginRight:8, marginLeft:5}} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.goToDoneList('PM')}>
                        <View style={styles.cellContainer}>
                            <View style={styles.leftViewStyle}>
                                <Image source={require('../../../../../img/shengchanshenpi.png')} style={styles.leftImgStyle} />
                                <Text style={styles.leftTitleStyle}>项目审批</Text>
                            </View>
                            <View style={styles.rightViewStyle}>
                                <View>{this.isHiddenTextPM()}</View>
                                <Image source={require('../../../../../img/rarrow.png')} style={{width:8, height:13, marginRight:8, marginLeft:5}} />
                            </View>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.goToDoneList('BG')}>
                        <View style={styles.cellContainer}>
                            <View style={styles.leftViewStyle}>
                                <Image source={require('../../../../../img/jiekuanbaoxiao.png')} style={styles.leftImgStyle} />
                                <Text style={styles.leftTitleStyle}>预算审批</Text>
                            </View>
                            <View style={styles.rightViewStyle}>
                                <View>{this.isHiddenTextBG()}</View>
                                <Image source={require('../../../../../img/rarrow.png')} style={{width:8, height:13, marginRight:8, marginLeft:5}} />
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
                 <Spinner visible={this.state.visible} overlayColor={'rgba(0, 0, 0, 0.2)'}
                         textContent={this.state.tip} textStyle={{color: 'white'}}/>
            </View>
        );
    };
    isHiddenTextFI(){
        if(this.state.FI==0){
            return null;
        }else{
            return(
                <Text style={styles.rightTitleStyle}>{this.state.FI}</Text>
            )                         
        }
    };
    isHiddenTextPU(){
        if(this.state.PU==0){
            return null;
        }else{
            return(
                <Text style={styles.rightTitleStyle}>{this.state.PU}</Text>
            )                         
        }
    };
    isHiddenTextST(){
        if(this.state.ST==0){
            return null;
        }else{
            return(
                <Text style={styles.rightTitleStyle}>{this.state.ST}</Text>
            )                         
        }
    };
    isHiddenTextSA(){
        if(this.state.SA==0){
            return null;
        }else{
            return(
                <Text style={styles.rightTitleStyle}>{this.state.SA}</Text>
            )                         
        }
    };
    isHiddenTextIB(){
        if(this.state.IB==0){
            return null;
        }else{
            return(
                <Text style={styles.rightTitleStyle}>{this.state.IB}</Text>
            )                         
        }
    };
    isHiddenTextPM(){
        if(this.state.PM==0){
            return null;
        }else{
            return(
                <Text style={styles.rightTitleStyle}>{this.state.PM}</Text>
            )                         
        }
    };
    isHiddenTextBG(){
        if(this.state.BG==0){
            return null;
        }else{
            return(
                <Text style={styles.rightTitleStyle}>{this.state.BG}</Text>
            )                         
        }
    };
    renderProduct(product) {
        return (
            <View style={styles.ListViewContainerStyle} key={product.cguid}>
                <View style={styles.leftViewStyle}>
                    <Text style={styles.productStyle}>{product.cmatcode}</Text>
                </View>
            </View>
        );
    };
    onPressDetail(product){
        NetInfo.isConnected.fetch().done(
            (isConnected) => { 
                (isConnected ? 
                    this.props.navigator.push({
                        name : 'MessageList',
                        component : MessageList,
                        params:{
                            passProps:{product},
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
    cellContainer: {
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
        flexDirection:'row',
        alignItems:'center',
        marginRight:8,
    },
    leftImgStyle:{
        width:30,
        height:24,
        marginRight:8,
    },
    leftTitleStyle:{
        fontSize:13,
    },
    rightTitleStyle:{
        paddingLeft:5,
        paddingRight:5,
        backgroundColor:"#e4393c",
        fontSize:13,
        color:"#fff",
        borderRadius:9,
        overflow:'hidden',
    },

});

