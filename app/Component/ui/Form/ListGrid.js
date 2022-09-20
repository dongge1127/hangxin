import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ListView,
    TouchableOpacity,
    Platform,
} from 'react-native';
import ViewUtil from '../common/ViewUtil';

var screenW =ViewUtil.screenW;
var screenH = ViewUtil.screenH;

class ListGrid extends Component {


    constructor(props) {
        super(props);
        this.state = {
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),

        };

    };

    componentDidMount(){
        this.setState({
            dataSource: this.state.dataSource.cloneWithRows(this.props.dataList),
        });
    }
    componentWillReceiveProps(nextProps){
         this.refs._listView.scrollTo({y: 0});
         this.setState({
             dataSource: this.state.dataSource.cloneWithRows(nextProps.dataList),
         });
    }

    static propTypes={
        dataList: React.PropTypes.array
    }

    render() {
        return (

            <View>
                <View style = {styles.contentView}>
                    <View style = {{width:600, height:30,paddingLeft:1,flexDirection:'row'}}>
                        {this.props.cols.map((col, i) => this.renderHeader(col, i))}
                    </View>
                    <ListView
                        ref='_listView'
                        dataSource={this.state.dataSource}
                        renderRow={this.renderProduct.bind(this)}
                        style={styles.listView}
                        enableEmptySections={true}
                        removeClippedSubviews={false}
                        onEndReachedThreshold={200}
                    />
                </View>

            </View>
        );
    }

    renderHeader(col,i){
        let w = screenW*col.width/100;
        return(
            <View key={col.code} style = {[styles.titleView, {width:w}]} >
                <Text>{col.name}</Text>
            </View>

        );
    }
    renderRow(col,i, row){
        let w = screenW*col.width/100;
        let align = 'flex-end';
        if(i==0){
            align = 'flex-start';
        }
        return(
            <View key={col.code} style = {[styles.cellView, {width:w},{alignItems:align}]} >
                <Text>{row[col.code]}</Text>
            </View>
        );
    }

    renderProduct(dataList) {
        return (
            <TouchableOpacity>
                <View style={styles.ListViewContainerStyle} key={dataList.rowNum}>
                    <View style={styles.rightListRow}>

                        {this.props.cols.map((col, i) => this.renderRow(col, i, dataList))}
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    topBar:{
        height:35,
        backgroundColor:'#50B1F8',
        flexDirection: 'row',
        alignItems: 'center',
    },
    topText:{
        color:'#fff',
        fontSize:18,
        marginLeft:106,
    },
    backImgStyle:{
        width:30,
        height:30,
        marginLeft:8,
    },
    ListViewContainerStyle:{
        flexDirection:'row',
        borderColor:'rgba(100,53,201,0.1)',
        //borderBottomWidth:1,
        //borderRightWidth:1,
        backgroundColor:'#fff',
        borderWidth:0,
        borderRadius:0,
    },
    listView:{
        marginBottom:0,
        paddingBottom:0,
        height:Platform.OS == 'ios' ? screenH*0.63: screenH*0.58,
    },

    leftListView:{
        marginTop: 0,
        marginLeft:0,
        marginRight:0,
        marginBottom:30,
        // backgroundColor:'gray',
    },

    leftListRow:{//以后启用列锁定时(表格列比较多)针对锁定列的style
        alignItems: 'center',      // 水平局中
        justifyContent: 'center',  // 垂直居中
        height: 30,
        // backgroundColor:'#db384c',
        borderColor: '#DCD7CD',
        borderBottomWidth:1,
        borderRightWidth:1,
    },

    rightListRow:{
        width: 600 ,
        flexDirection:'row'
    },

    contentView:{
        height: Platform.OS == 'ios' ? screenH*0.63: screenH*0.58,
        width: 600 ,
        // backgroundColor:'yellow',
        flexDirection: 'column',
    },


    titleView:{
        width:100,
        height:30,
        //backgroundColor:'#50B1F8',
        backgroundColor:'#eeeeee',
        borderColor: '#DCD7CD',
        borderTopWidth: 0,
        borderRightWidth:0,
        borderBottomWidth:0,
        alignItems: 'center',      // 水平局中
        justifyContent: 'center',  // 垂直居中
    },

    cellView:{
        width:100,
     //   height:40,
        // backgroundColor:'#db384c',
        borderColor: '#FFFFFF',
       // borderRightWidth:1,
      //  borderBottomWidth:1,
        borderTopWidth: 0,
        borderRightWidth:0,
        borderBottomWidth:0,
        paddingRight:10,
        paddingLeft:10,
        justifyContent: 'center',  // 垂直居中
    },
});

export default ListGrid;

