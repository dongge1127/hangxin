import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    ListView,
    ScrollView,
    ActivityIndicator,
    TouchableHighlight,
    TouchableOpacity,
} from 'react-native';
import Service from '../../service';
import testMessage from './testMessage';
var Dimensions = require('Dimensions');
var screenW = Dimensions.get('window').width;
/*导入json数据*/
var Datas = require('./OrderListType.json');

import ModalPicker from 'react-native-modal-picker';

class Test extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),

        };
    }
    componentDidMount(){
        this.fetchData();
    }
    fetchData() {
        var url=Service.host+Service.dbList
                +'&module=PU';
        console.log(url);
        fetch(url)
            .then((response) => response.json())
            .then((responseData) => {
                console.log(responseData);
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(responseData.list),
                });
                console.log(this.state.dataSource);
            })
            .catch((error) => {
                console.error(error);
            });
    };
   
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            
            navigator.pop();
        }
    };

    render() {
        return (
            <View>
                <TouchableOpacity onPress={this.onPressBack}>
                    <Image source={require('../../../../../img/back.png')} style={styles.backImgStyle} />
                </TouchableOpacity>
                <ScrollView>
                     <ListView
                        dataSource={this.state.dataSource}
                        renderRow={this.renderTable.bind(this)}
                        style={styles.listView}
                    />
                </ScrollView>
            </View>
        );
    }

    renderRow(col,i, row){
        if(i==0){
             return(
                <View key={col.title}>
                    <Text numberOfLines={1} style={[styles.messageListTitleStyle,{color:'#50B1F8'}]}>
                        {col.title}:{row[col.title]}
                    </Text>
                </View>
            ); 
        }
        return(
            <View key={col.title}>
                <Text numberOfLines={1} style={styles.messageListTitleStyle}>
                    {col.title}:{row[col.title]}
                </Text>
            </View>
        );   
    }

    renderTable(list) {
       var number=list.hidden_cbilltype;
       console.log(number);
            return (
                <TouchableOpacity onPress={()=>this.onPressDetail(list)}>
                    <View style={styles.ListViewContainerStyle} key={list.hidden_cguid}>
                        <View>
                            {Datas['A6cbilltype_'+number].map((col, i) => this.renderRow(col, i, list))}
                        </View>
                    </View>
                </TouchableOpacity>
            );
      
        
    }
    onPressDetail(list){
        this.props.navigator.push({
            name : 'testMessage',
            component : testMessage,
            params:{
                passProps:{list}
            }
        });
    }
    
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
        marginLeft:106,
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
        paddingLeft:6,
        backgroundColor:'#fff',
        borderWidth:1,
        borderRadius:5,
        marginLeft:10,
        marginRight:10,
        marginTop:5,
    },
    messageListTitleStyle: {
        fontSize:18,
    },
});
export default Test;