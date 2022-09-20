/**
 * Created by John on 2017-6-15.
 */
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    View,
    Image,
    ListView,
    Platform,
    ActivityIndicator,
    TouchableOpacity,
    BackAndroid,
} from 'react-native';
import Service from '../service';
import dismissKeyboard from 'react-native-dismiss-keyboard';
import KCDetailComponent from './KucunDetail';
import CommonStyles from '../../../style/CommonStyle';
import EmojiUtil from "../common/EmojiUtil";
import HttpUtil from '../common/HttpUtil';
import ViewUtil from '../common/ViewUtil';
import RequestFail from '../APPComponent/RequestFail';
import {PullList} from 'react-native-pull';
import NavigationBar from "../APPComponent/NavigationBar";
let page=1;
export default class Kucun extends Component {

  constructor(props) {
        super(props);
        this.dataSource = [];
        this.state = {
            list: (new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})).cloneWithRows(this.dataSource),
            searchText:'',
            dataSource: new ListView.DataSource({
                rowHasChanged: (row1, row2) => row1 !== row2,
            }),
            netState:Service.netState,
            time:new Date().toString(),
            requestFail:false,
            nomore:false,

        };
        this.renderRow = this.renderRow.bind(this);
        this.renderFooter = this.renderFooter.bind(this);
        this.loadMore = this.loadMore.bind(this);
        this.topIndicatorRender = this.topIndicatorRender.bind(this);
        // this.loadMore();
    }
    componentDidMount(){
        page=1;
        BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid);
    };
    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
    };
    onBackAndroid=()=>{
        if (this.props.navigator) {
            page=1;
            this.props.navigator.pop();
            return true;
        }
    };
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            page=1;
            navigator.pop();
        }
    };
    //禁止输入emoji
    onChangeText(text){
        text = EmojiUtil.FilterEmoji(text);
        this.setState({searchText:text,})
    }
    //下拉刷新函数
    reFreshPage(){
        this.dataSource = [];
        page=1;
        var url=Service.host+Service.getmatstock
            +'&curpage='+page
            +'&pagenum=100';
        HttpUtil.get(url,this)
            .then((responseData) => {
                if(responseData.matstock){
                    let Data=responseData.matstock;
                    for(let i in Data) {
                        this.dataSource.push(
                            Data[i]
                        )
                    }
                    setTimeout(() => {
                        this.setState({
                            list: this.state.list.cloneWithRows(this.dataSource)
                        });
                    },500);
                }else{
                    this.setState({
                        nomore:true,
                    })
                }
            })
            .catch((error) => {
                this.setState({
                    requestFail:true,
                })
            });
        page++;
    }
    onPullRelease(resolve) {
        setTimeout(() => {
            this.reFreshPage();
            resolve();
        }, 1000);
    }

    topIndicatorRender(pulling, pullok, pullrelease) {
        return (
            <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', height: 60}}>
                <ActivityIndicator size="small" color="gray" />
            </View>
        );
    }

    render() {
        return (
          <View style={styles.container}>
            <View style={CommonStyles.CommonWrapContainer}>
                <NavigationBar
                    leftAction={this.onPressBack}
                    leftImage={require('../../../../img/back.png')}
                    title={'物品库存'}/>
                <View style={CommonStyles.CommonInputItem}>
                     <TextInput
                        style={CommonStyles.CommonTextInput}
                        placeholder="按物品编码、名称或规格查找"
                        placeholderTextColor="#aaa"
                        value={this.state.searchText}
                        underlineColorAndroid="transparent"
                        numberOfLines={1}
                        ref={'searchText'}
                        returnKeyType="search"
                        onChangeText={this.onChangeText.bind(this)}
                        onSubmitEditing={this.onPressSearch}
                        onEndEditing={(evt) => this.setState({ searchText: evt.nativeEvent.text })}
                    />
                    <TouchableOpacity onPress={this.onPressSearch}>
                        <View style={CommonStyles.CommonSearchImgContainer}>
                            <Image source={require('../../../../img/search.png')} style={CommonStyles.CommonSearchImg} />
                        </View>
                    </TouchableOpacity>
                </View>
                <PullList
                  style={{}}
                  onPullRelease={this.onPullRelease.bind(this)} 
                  topIndicatorRender={this.topIndicatorRender} 
                  topIndicatorHeight={60}
                  dataSource={this.state.list}
                  pageSize={5}
                  initialListSize={5}
                  renderRow={this.renderRow}
                  onEndReached={this.loadMore}
                  onEndReachedThreshold={60}
                  renderFooter={this.renderFooter}
                  enableEmptySections={true}
                  />
            </View>
              
          </View>
        );
    }

    renderRow(item, sectionID, rowID, highlightRow) {
        console.log(item);
        var net = this.state.netState;
        let returnImg;
        if(Service.showImgSwitch=='true'&&net!='wifi'&&net!='WIFI'){
                returnImg=<Image
                    source={require('../../../../img/matstock.png')}
                    style={styles.matstockImageStyle}
                />;
        }else{
            if(item.imgPath=="../../../../img/matstock.png"){
                returnImg=<Image
                    source={require('../../../../img/matstock.png')}
                    style={styles.matstockImageStyle}
                />;
            }else{
                returnImg=<Image
                    source={{uri:(item.imgPath+'?time='+this.state.time)}}
                    style={styles.matstockImageStyle}
                />;
            }
        }

        return (
            <TouchableOpacity onPress={()=>this.onPressDetail(item)} onLongPress={()=>alert('删除')}>
            <View style={styles.ListViewContainerStyle} key={item.hidden_cguid}>
                <View style={styles.matstockImageContainer}>
                    {returnImg}
                </View>
                <View style={styles.rightContainer}>
                    <Text style={styles.listTextStyle}>物品:[{item.cmatcode}]{item.cmatname}</Text>
                    <Text style={styles.listTextStyle}>规格:{item.cspec}</Text>
                    <Text style={styles.listTextStyle}>库存:{item.icurquan}{item.cunitname}</Text>
                </View>
            </View>
            </TouchableOpacity>
        );
    }
    renderFooter() {
        if(this.state.requestFail==true){
            return(
                <RequestFail onPress={this.onPressSearch}/>
            )
        }
        if(this.state.nomore) {
            return null;
        }
        return (
            <View style={{height: 100}}>
                <ActivityIndicator size="small" color="gray"/>
            </View>
        );
    }
    //搜索数据
    onPressSearch = () => {
        dismissKeyboard();//点击搜索按钮收回软键盘
        this.setState({
            requestFail:false,
            nomore:false,
        });
        this.dataSource = [];
        page=1;
        //每次搜索时把数据清空显示加载动画
        this.setState({
            list: this.state.list.cloneWithRows(this.dataSource)
        });
        var url=Service.host+Service.getmatstock
                +'&keyword='+encodeURIComponent(this.state.searchText)
                +'&curpage='+page
                +'&pagenum=100';
        HttpUtil.get(url,this)
            .then((responseData) => {
                if(responseData.matstock){                  
                    let Data=responseData.matstock;
                    for(let i in Data) {
                        this.dataSource.push(
                            Data[i]
                        )
                    }
                    setTimeout(() => {
                        this.setState({
                            list: this.state.list.cloneWithRows(this.dataSource)
                        });
                    }, 500);
                }else{
                    this.setState({
                        nomore:true,
                    })
                }
            })
            .catch((error) => {
                this.setState({
                    requestFail:true,
                })
            });
            page++;
    };
    //加载数据
    loadMore() {
        var url=Service.host+Service.getmatstock
                +'&curpage='+page
                +'&pagenum=100';
        HttpUtil.get(url,this)
            .then((responseData) => {
                if(responseData.matstock){                   
                    let Data=responseData.matstock;
                    for(let i in Data) {
                        this.dataSource.push(
                            Data[i]
                        )
                    }
                    setTimeout(() => {
                        this.setState({
                            list: this.state.list.cloneWithRows(this.dataSource)
                        });
                    },500);
                }else{
                    this.setState({
                        nomore:true,
                    })
                }
            })
            .catch((error) => {
                this.setState({
                    requestFail:true,
                })
            });
            page++;
        }
        onPressDetail(item){
             this.props.navigator.push({
                  name : 'KCDetailComponent',
                  component : KCDetailComponent,
                  params:{
                      passProps:{item}
                  }
             })
        };

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: '#F5FCFF',
  },
  ListViewContainerStyle:{
        flexDirection:'row',
        borderBottomWidth:1,
        borderColor:'rgba(100,53,201,0.1)',
        height:120,
        backgroundColor:'#fff',
        marginLeft:5,
        marginRight:5,
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
        width:ViewUtil.screenW-140,
        flex: Platform.OS == 'ios' ? 0 : 1,
        justifyContent:'center',
    },
    listTextStyle: {
        fontSize:13,
        marginTop:3,
    },  
    imgStyle:{
        width:40,
        height:40,
        marginBottom:20,
    },
    text:{
        fontSize:16,
        color:"#999",
    }
});


