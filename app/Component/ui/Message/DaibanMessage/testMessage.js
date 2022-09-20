import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ListView,
    Platform,
    ScrollView,
    Image,
    Alert,
    TextInput,
    } from 'react-native';
import Service from '../../service';
import {
    Cells,
    CellsTitle,
    Cell,
    CellHeader,
    CellBody,
    CellFooter,
    Input,
    Label,
    TextArea,
    RadioCells,
    CheckboxCells,
    ButtonArea,
    Button,
    Dialog,
    } from 'rn-weui/src';
import FlowJournal from './FlowJournal';
var Dimensions = require('Dimensions');
/*导入json数据*/
var Datas = require('./test.json');

var screenW = Dimensions.get('window').width;
export default class testMessage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            //公用
            list: this.props.passProps.list,
            mainData:'',
            detailArry:[],
            dataSource1: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            dataSource2: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            cols:[
                 {bar:'供应商'},
                 {bar:'业务类型'},
                 {bar:'采购总金额'},
                 {bar:'采购日期'}],
            cols2:[
                 {bar:'数量'},
                 {bar:'规格'},
                 {bar:'金额'},
                 {bar:'物品'}],
           
        },


        this.fetchData();
    };
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    };
    fetchData() {
    	console.log(this.state.list);
   		console.log(Datas.detail.cols2);
        var url=Service.host+Service.dbDetail
            +'&cbilltype='+this.state.list.hidden_cbilltype
            +'&cguid='+this.state.list.hidden_cguid
            +'&cCheckWay='+this.state.list.hidden_ccheckway;
        console.log(url);
        fetch(url)
            .then((response) => response.json())
            .then((responseData) => {
                console.log(responseData);
                this.setState({
                    dataSource1: this.state.dataSource1.cloneWithRows(responseData.main),
       				dataSource2: this.state.dataSource2.cloneWithRows(responseData.detail),
                });
 
            })
            .catch((error) => {
                console.error(error);
            });
    };

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={this.onPressBack}>
                        <Image source={require('../../../../../img/back.png')} style={styles.backImgStyle} />
                    </TouchableOpacity>
                    <Text style={styles.topText}>单据详情</Text>
                </View>
                
                <ScrollView>
                    <View >
                        <View >
                            <View style={styles.mainCellContainer}>
                                <View style={styles.TitleStyle}>
                                    <Text style={styles.Title}>主要信息</Text>
                                </View>
                                 <ListView
                        			dataSource={this.state.dataSource1}
                        			renderRow={this.renderTable.bind(this)}
                        			style={styles.listView}
                    			/>                             
                                <View style={styles.TitleStyle}>
                                    <Text style={styles.Title}>详情信息</Text>
                                </View>
                                <ListView
                        			dataSource={this.state.dataSource2}
                        			renderRow={this.renderTable2.bind(this)}
                        			style={styles.listView}
                    			/>
                                
                            </View>
                        </View> 
                    </View>      
                </ScrollView>
            </View>
        );
    }
    renderRow(col,i, row){
        return(
            <View key={col.bar}>
                <View numberOfLines={1} style={styles.CellStyle}>
                    <Text style={styles.LeftTextStyle}>{col.bar}</Text>
                    <Text style={styles.RightTextStyle}>{row[col.bar]}</Text>
                </View>
            </View>
        );   
    };
    renderTable(main) {
    	return (
            <View style={styles.ListViewContainerStyle} >
                <View>
                    {Datas.main.A6cbilltype_076.map((col, i) => this.renderRow(col, i, main))}
                </View>
            </View>    
        );
    };
    renderTable2(detail) {
    	return (
			<View style={styles.ListViewContainerStyle} >
                <View>
                    {Datas.detail.A6cbilltype_076.map((col, i) => this.renderRow(col, i, detail))}
                </View>
            </View>
		);
    }
   

}
const styles = StyleSheet.create({
    container: {
        backgroundColor: '#F5FCFF',
    },
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
    TitleStyle:{
        justifyContent:'center',
        height:Platform.OS == 'ios' ? 55 : 50,
    },
    Title:{
        marginLeft:8,
        fontSize:16,
    },
    ListViewContainerStyle:{
        flexDirection:'row',
        borderBottomWidth:1,
        borderColor:'#ccc',
        paddingTop:6,
        backgroundColor:'#fff',
    },
     CellStyle:{
     	width:screenW,
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

});

