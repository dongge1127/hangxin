import React, {
    Component
} from 'react';

import {
    StyleSheet,
    Text,
    View,
    ListView,
    Platform,
    ScrollView,
    BackAndroid,
} from 'react-native';
import Service from '../service';
/*导入系统类*/
import ViewUtil from '../common/ViewUtil';
import HttpUtil from '../common/HttpUtil';
/*导入公共样式*/
import CommonStyles from '../../../style/CommonStyle';
import NavigationBar from "../APPComponent/NavigationBar";
class MyCell extends Component {
    constructor(props) {
        super(props);
        this.state = {
            leftTitle: '', // 左侧标题
            rightTitle: '',
        }
    }
    render() {
        return (
            <View style={styles.crmCellStyle}>
                <Text style={styles.crmCellLeftStyle}>{this.props.leftTitle}</Text>
                <Text style={styles.crmCellRightStyle}>{this.props.rightTitle}</Text>
            </View>
        );
    }
};
export default class crmDetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            rowData: this.props.passProps.rowData,
        };
        console.log(this.state.rowData.iinitamt);
    };
    componentDidMount() {
        this.fetchData();
    };
    componentDidMount(){
        BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid);
        this.fetchData();
    };
    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
    };
    fetchData() {
        var url = Service.host + 'mobile_service_customer' + '&cguid=' + this.state.rowData.hidden_csupguid;
        console.log(url);
        HttpUtil.get(url,this)
                .then((responseData) => {
                    console.log(responseData);
                    this.setState({
                        dataSource: this.state.dataSource.cloneWithRows(responseData.customer),
                    });
                })
                .catch((error) => {});
    };
    onPressBack = () => {
        const {
            navigator
        } = this.props;
       
        if (navigator) {
            navigator.pop();
        }
    };
    onBackAndroid=()=>{
        if (this.props.navigator) {
            
            this.props.navigator.pop();
            return true;
        }
    };
    render() {
        return (
            <View style={CommonStyles.CommonWrapContainer}>
                <NavigationBar
                    leftAction={this.onPressBack}
                    leftImage={require('../../../../img/back.png')}
                    title={'客户详情'}/>
                <ScrollView>
                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this.renderCrmDate.bind(this)}
                    removeClippedSubviews={false}
                    style={styles.listView}
                    enableEmptySections={true}
                />
                </ScrollView>
            </View>
        )
    };
    renderCrmDate(customer) {
        return (
            <View style={styles.ListViewContainerStyle}>
                <View style={{marginBottom:8}}>
                    <MyCell
                        leftTitle="编号"
                        rightTitle={customer.ccode}
                    />
                    <View>{this.testNumLength(customer.cname,'名称')}</View>
                    <MyCell
                        leftTitle="客户类别"
                        rightTitle={customer.ccustclass}
                    />
                </View>
                <View style={{marginBottom:8}}>
                 <MyCell
                    leftTitle="联系人"
                    rightTitle={customer.clinkman}
                />
                 <MyCell
                    leftTitle="手机"
                    rightTitle={customer.cmobil}
                />
                 <MyCell
                    leftTitle="电话"
                    rightTitle={customer.cphone}
                />
                <MyCell
                    leftTitle="应收款"
                    rightTitle={customer.iinitamt}
                />
                </View>
                <View>{this.testNumLength(customer.caddress,'地址')}</View>
                <View>{this.testNumLength(customer.cremark,'备注')}</View>
            </View>

        );

    };
    //判断字数长度
    testNumLength(text,title){
        if(text!==null && text.length>20){
            return(
                <View style={styles.extraText}>
                    <Text style={styles.extraTextLeftStyle}>{title}</Text>
                    <Text style={styles.extraTextRightStyle}>{text}</Text>
                </View>
            )
        }else{
            return(
                <MyCell
                    leftTitle={title}
                    rightTitle={text}
                />
            )
        }
    };
}

const styles = StyleSheet.create({
    ListViewContainerStyle: {
        backgroundColor: '#F5F5F5',
    },
    crmCellStyle: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        alignItems: 'center',
        height: Platform.OS == 'ios' ? 45 : 40,
        borderBottomColor: '#e8e8e8',
        borderTopColor: '#e8e8e8',
        borderBottomWidth: 0.8,
        borderTopWidth: 0.5,
    },
    crmCellLeftStyle: {
        marginLeft: 8,
        fontSize:13,
    },
    crmCellRightStyle: {
        marginRight: 8,
        fontSize:13,
    },
    extraText:{
        flexDirection:'row',
        backgroundColor:'white',
        alignItems:'center',
        borderBottomColor:'#e8e8e8',
        borderBottomWidth:0.5,
        paddingTop:8,
        paddingLeft:8,
        paddingBottom:8,
    },
    extraTextLeftStyle:{
        marginRight:8,
        width:40,
        fontSize:13,
    },
    extraTextRightStyle:{
        width:ViewUtil.screenW-50,
        paddingRight:8,
    },

});