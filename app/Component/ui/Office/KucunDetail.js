import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Platform,
    Image,
    ScrollView,
} from 'react-native';
import Service from '../service';
import CommonStyles from '../../../style/CommonStyle';
import HttpUtil from '../common/HttpUtil';
import NavigationBar from "../APPComponent/NavigationBar";
export default class KCDetailComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            matstock: this.props.passProps.item,
            matstockdetailData:'',
            netState:Service.netState,
        }
        console.log(this.props.passProps.item);
        this.fetchData();
    };
     onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    };

    fetchData() {
        var url = Service.host+Service.matstockdetail
                  +'&cguid='+this.state.matstock.hidden_cguid;
        console.log(url);
        HttpUtil.get(url,this)
            .then((responseData) => {
                console.log(responseData); 
                if(responseData.matstockdetail==null){
                    this.setState({
                        matstockdetailData:'',
                    });
                }else{
                   this.setState({
                        matstockdetailData:responseData.matstockdetail,
                   }); 
                }
                
                console.log(this.state.matstockdetailData);
            })
            .done();
    }
    render() {
        return (
            <View style={CommonStyles.CommonWrapContainer}>
                <NavigationBar
                    leftAction={this.onPressBack}
                    leftImage={require('../../../../img/back.png')}
                    title={'库存详情'}/>
                <View style={styles.ListViewContainerStyle}>
                    <View style={styles.matstockImageContainer}>
                            {this.showImg()}
                    </View>
                    <View style={styles.rightContainer}>
                        <Text style={styles.rightTextStyle}>物品:[{this.state.matstock.cmatcode}]{this.state.matstock.cmatname}</Text>
                        <Text style={styles.rightTextStyle}>规格:{this.state.matstock.cspec}</Text>
                        <Text style={styles.rightTextStyle}>库存:{this.totalcount()}{this.state.matstock.cunitname}</Text>
                        <Text style={styles.rightTextStyle}>条码:{this.state.matstock.cbarcode}</Text>
                    </View>
                </View>
                <ScrollView>
                     <View>{this.matstockdetail()}</View>
                </ScrollView>
            </View>
        );
    }
    showImg(){
        var net = this.state.netState;
            if(Service.showImgSwitch=='true'&&net!='wifi'&&net!='WIFI'){
                return(<Image
                                source={require('../../../../img/matstock.png')}
                                style={styles.matstockImageStyle}
                            />)
            }else{
                if(this.state.matstock.imgPath=='../../../../img/matstock.png'){
                    return(<Image
                                source={require('../../../../img/matstock.png')}
                                style={styles.matstockImageStyle}
                            />) 
                }else{
                    var time = new Date();
                    return(<Image
                                source={{uri:(this.state.matstock.imgPath+'?time='+time.toString())}}
                                style={styles.matstockImageStyle}
                            />) 
                }
            }
    }
    
    totalcount(){
        var count = 0;
        var object = this.state.matstockdetailData;
        var temp = this.state.matstock.icurquan;
        var Precision = temp.indexOf(".") > 0 ? temp.split(".")[1].length:0;
        for(var i=0;i<object.length;i++){
            try{
                count += parseFloat(object[i].icurquan);
            }catch(e){
                console.log("非法库存量数据!")
                count += 0;
            }
        }
        return count.toFixed(Precision);
    }

    matstockdetail(){
        var arrView=[];
        var object=this.state.matstockdetailData;
        //console.log(object);
        for (var i=0;i<object.length;i++) {
            arrView.push(
                <View style={styles.CellStyle} key={i}>
                    <Text style={styles.LeftTextStyle}>{object[i].storename}</Text>
                    <Text style={styles.RightTextStyle}>{object[i].icurquan}{object[i].cunitname}</Text>
                </View>
            );
        }

        return arrView;
    };
    
}

const styles = StyleSheet.create({
    ListViewContainerStyle:{
        flexDirection:'row',
        borderBottomWidth:1,
        borderColor:'rgba(100,53,201,0.1)',
        height:120,
        backgroundColor:'#fff',
    },
    matstockImageContainer:{
        width:120,
        height:120,
        justifyContent:'center',
        alignItems:'center',
    },
    matstockImageStyle:{
        width:78,
        height:70,

    },
    rightContainer: {
        flex:1,
        justifyContent:'center',
    },
    rightTextStyle:{
        fontSize:13,
        marginTop:3,
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
        fontSize:13,
    },
    RightTextStyle:{
        marginRight:8,
        fontSize:13,
    },
    
});

