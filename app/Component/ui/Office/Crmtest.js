import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    ListView,
    Image,
    TouchableOpacity,
    Linking,
    TouchableHighlight,
} from 'react-native';
import Service from '../service';
import CrmDetail from './CrmDetail';
class CustomButton extends Component{
    propTypes:{
        url:React.PropTypes.string,
    };
    render(){
        return (
            <TouchableHighlight
                style={{position:'absolute',right:60}}
                underlayColor="#fff"
                onPress={() => Linking.canOpenURL(this.props.url).then(supported => {
                    if(supported){
                        Linking.openURL(this.props.url);
                    }else{
                        console.log('无法打开该URL:'+this.props.url);
                    }
                })} >
                <View>
                    <Image source={require('../../../../img/phoneg1.png')} style={styles.phoneImgStyle}/>
                </View>
            </TouchableHighlight>
        )
    }
}

export default class Crmtest extends Component {
    // 初始化
     constructor(props) {
        super(props);
        var getSectionData = (dataBlob,sectionID) => {
            return dataBlob[sectionID];
        };

        var getRowData = (dataBlob,sectionID,rowID) => {
            return dataBlob[sectionID +':' + rowID];
        };
        this.state = {
            dataSource: new ListView.DataSource({
                getSectionData: getSectionData, // 获取section
                getRowData: getRowData, // 获取row
                rowHasChanged: (row1,row2)=>row1 !== row2,
                sectionHeaderHasChanged: (s1,s2)=>s1 !== s2,
            }),
            date:[],

        };
       
    };
    componentDidMount(){
        this.fetchData();
    };
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    };
    fetchData() {
    var url=Service.host+Service.crmList;
    console.log(url);
    fetch(url)
        .then((response) => response.json())
        .then((responseData) => {
            console.log(responseData); 
            this.setState({
                date: responseData,
            });
            //调用json数据
            this.loadDataFromJson(); 
        })
        .done();
    };
    // 调用json数据的方法
    loadDataFromJson(customerlist){
        // 拿到json数据
        var jsonData = this.state.date.customerlist;
        // 定义一些变量
        var dataBlob = {},
            sectionIDs = [],
            rowIDs = [],
            titleDate = [];
        // 遍历
        for(var i=0;i<jsonData.length;i++){
            // 1.把组号放入sectionIDs数组
            sectionIDs.push(i);
            // 2.把组内容放入dataBlob对象中
            dataBlob[i] = jsonData[i].title;
            // 3.取出该组所有的通讯录数据
            titleDate = jsonData[i].titleDate;
            rowIDs[i] = [];
            // 4.遍历通讯录数据
            for(var j=0;j<titleDate.length;j++){
                // 把行号放入rowIDs
                rowIDs[i].push(j);
                // 把每一行中的内容放入dataBlob对象中
                dataBlob[i+':'+j] = titleDate[j];
            }
        }
        // 更新状态,刷新UI
        this.setState({
            dataSource:this.state.dataSource.cloneWithRowsAndSections(dataBlob,sectionIDs,rowIDs)
        });
    };

    // 返回cell
    renderRow(rowData){
        console.log(rowData);
        return(
            <TouchableOpacity onPress={()=>this.CrmList(rowData)}>
                <View style={styles.rowStyle}>
                    <Text style={styles.rowTitleNameStyle}>{rowData.cname}</Text>
                    <Text style={styles.rowNameStyle}>应收：<Text style={{color:'#e4393c'}}>{rowData.iinitamt}</Text></Text>
                    <View style={{flexDirection:'row',alignItems:'flex-end',}}>
                        <Image source={require('../../../../img/per1.png')} style={styles.personImgStyle}/>
                        <Text style={styles.rowNameStyle}>{rowData.cmobil}</Text>
                        <CustomButton url={'tel:'+rowData.cmobil}/>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };
    CrmList(rowData){
        console.log('点击了列表');
        console.log(rowData);
        this.props.navigator.push({
            name : 'CrmDetail',
            component : CrmDetail,
            params:{
                passProps:{rowData}
            }
        });
    };

    // 返回每一组
    renderSectionHeader(sectionData,sectionID){
        return(
            <View style={styles.sectionHeaderViewStyle}>
                <Text style={styles.sectionHeaderTitleStyle}>{sectionData}</Text>
            </View>
        );
    };

    // 渲染
    render(){
        return(
            <View style={styles.outerViewStyle}>
                <View style={styles.headerViewStyle}>
                    <TouchableOpacity onPress={this.onPressBack}>
                        <Text style={{color:'#fff',fontSize:25,textAlign:'center',}}>返回</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitleStyle}>客户</Text>
                </View>
                <ListView
                    dataSource={this.state.dataSource}
                    renderRow={this.renderRow.bind(this)}
                    removeClippedSubviews={false}
                    renderSectionHeader={this.renderSectionHeader}
                />
            </View>
        );
    }

};

const styles = StyleSheet.create({
    outerViewStyle:{
        // 占满窗口(这样里面的就可以滚动了)
        flex:1,
    },
    headerViewStyle:{
        // 导航栏
        flexDirection: 'row',
        height:50,
        backgroundColor:'#50B1F8',
    },
    headerTitleStyle:{
        color:'#fff',
        fontSize:25,
        textAlign:'center',
    },
    sectionHeaderViewStyle:{
        backgroundColor:'#e8e8e8',
        justifyContent:'center',
        height:20,
    },
    sectionHeaderTitleStyle:{
        paddingLeft:10,
        color:'#666',
        backgroundColor:'#ddd',
    },
    rowStyle:{
        // 设置水平排列
        // 侧轴方向
        padding:10,
        borderBottomWidth:0.5,
        borderBottomColor:'#ccc',
        backgroundColor:'#fff',
    },
    rowTitleNameStyle:{
        fontSize:20,
        marginLeft:10,
    },
    rowNameStyle:{
        fontSize:16,
        marginLeft:10,
    },
    personImgStyle:{
        width:30,
        height:30,
        marginLeft:8,
    },
    phoneImgStyle:{
        width:30,
        height:30,
    },
});
