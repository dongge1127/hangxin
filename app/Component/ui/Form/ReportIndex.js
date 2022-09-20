import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Platform,
    TouchableOpacity
} from 'react-native';
import Forms from './forms'
import ScrollableTabView from 'react-native-scrollable-tab-view'
import TabBar from './TabBar'
import ViewUtil from '../common/ViewUtil';
import Service from '../service';
import HttpUtil from '../common/HttpUtil';
import NavigationBar from "../APPComponent/NavigationBar";
var screenW = ViewUtil.screenW;
var screenH = ViewUtil.screenH;

var Dimensions = require('Dimensions');

/*定义一些全局的变量*/
var cols = 2;
var boxW = screenW / 2;
var vMargin = (screenW - cols * boxW) / (cols + 1);

export default class ReportIndex extends Component {
    constructor(props) {
        super(props);
        this.state = {
            id: 1,
            user: null,
            tabNames: ['日', '周', '月', '季', '年'],
            tabKeys: ['day', 'week', 'month', 'quarter', 'year'],
            sumData: {},
            currentTabName: 0,
            isConnected: null,
        };

        this.fetchData();
    }

    componentWillReceiveProps(nextProps) {
        this.fetchData();
    };

    fetchData(currentindex) {

        if (currentindex == null || currentindex == '') {
            currentindex = 0;
        }
        let tabKeys = this.state.tabKeys;

        var url = Service.host + Service.reportIndex + '&type=' + tabKeys[currentindex];

        HttpUtil.get(url, this)
            .then((responseData) => {
                let currentPage = this.menuview.state.currentPage;
                if (currentPage != currentindex) {
                    this.menuview.goToPage(currentindex);
                }
                this.setState({
                    sumData: responseData
                });
            })
            .catch((error) => {
                console.error(error);
            })

    }

    showReport1() {
        const {navigator} = this.props;
        const self = this;
        if (navigator) {
            navigator.push({
                name: 'Forms',
                component: Forms,
                params: {
                    id: 'r1',
                    showtitle: '物品毛利',
                }
            })
        }
    }

    showReport2() {
        const {navigator} = this.props;
        const self = this;
        if (navigator) {
            navigator.push({
                name: 'Forms',
                component: Forms,
                params: {
                    id: 'r2',
                    showtitle: '资金收支',
                }
            })
        }
    }

    showReport3() {
        const {navigator} = this.props;
        const self = this;
        if (navigator) {
            navigator.push({
                name: 'Forms',
                component: Forms,
                params: {
                    id: 'r3',
                    showtitle: '客户回款',
                }
            })
        }
    }

    showReport4() {
        const {navigator} = this.props;
        const self = this;
        if (navigator) {
            navigator.push({
                name: 'Forms',
                component: Forms,
                params: {
                    id: 'r4',
                    showtitle: '资金余额',
                }
            })
        }
    }

    render() {
        let tabNames = this.state.tabNames;
        return (
            <View>
                <View>
                    <NavigationBar
                        title={'报表'}/>
                    <View style={styles.msgContainer}>
                        <ScrollableTabView
                            renderTabBar={() => <TabBar tabNames={tabNames} level='t'/>}
                            ref={(menuview) => {
                                this.menuview = menuview
                            }}
                            onChangeTab={(obj) => {
                                this.setState({currentTabName: obj.i,});
                                this.fetchData(obj.i);
                            }}
                            tabBarPosition='bottom'>
                            {this.state.tabNames.map((n, i) => this.renderTabView(n, i))}

                        </ScrollableTabView>
                    </View>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity onPress={this.showReport1.bind(this)}>
                        <View style={styles.outViewStyle}>
                            <Text style={styles.icon_text}>物品毛利</Text>
                            <Image source={require('../../../../img/wupin.png')} style={styles.icon_image1}/>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.showReport2.bind(this)}>
                        <View style={styles.outViewStyle}>
                            <Text style={styles.icon_text}>资金收支</Text>
                            <Image source={require('../../../../img/cash.png')} style={styles.icon_image1}/>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.showReport3.bind(this)}>
                        <View style={styles.outViewStyle}>
                            <Text style={styles.icon_text}>客户回款</Text>
                            <Image source={require('../../../../img/huikuan.png')} style={styles.icon_image2}/>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={this.showReport4.bind(this)}>
                        <View style={styles.outViewStyle}>
                            <Text style={styles.icon_text}>资金余额</Text>
                            <Image source={require('../../../../img/yue.png')} style={styles.icon_image2}/>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    renderTabView(n, i) {
        let keys = this.state.tabKeys;
        let tabNames = this.state.tabNames;
        return (

            <View style={styles.flexContainer} key={i}>
                <View style={styles.flexShowText} key={i}>
                    <View style={styles.totalView} key={i}>
                        <Text style={styles.totalMsg}>本{tabNames[i]}毛利</Text>
                        <Text style={styles.totalAmt}>{this.state.sumData.maoli}</Text>
                    </View>
                    <View style={styles.detailView}>
                        <View style={styles.detailContentView}>
                            <View style={styles.detailContentLineMsgView}>
                                <Text style={styles.lineMsg}>销售额</Text>
                            </View>
                            <View style={styles.detailContentLineAmtView}>

                                <Text style={styles.lineAmt}>{this.state.sumData.itotal}</Text>
                            </View>
                        </View>
                        <View style={styles.detailContentView}>
                            <View style={styles.detailContentLineMsgView}>
                                <Text style={styles.lineMsg}>收款额</Text>
                            </View>
                            <View style={styles.detailContentLineAmtView}>

                                <Text style={styles.lineAmt}>{this.state.sumData.icreditamt}</Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={styles.flexBackgroud}>
                    <Image source={require('../../../../img/formIndex.png')} style={styles.index_background}/>
                </View>
            </View>


        );
    }
}

const styles = StyleSheet.create({
    flexContainer: {
        // 容器需要添加direction才能变成让子元素flex
        height: screenH * 0.3,
        backgroundColor: '#f7f9fa',
    },

    flexShowText: {
        flexDirection: "row",
        height: screenH * 0.15,
        paddingTop: 5,
    },

    flexBackgroud: {
        width: screenW,
        height: screenH * 0.15,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },

    topBar: {
        height:Platform.OS == 'ios'?55:35,
        paddingTop: Platform.OS == 'ios' ? 20 : 0,
        backgroundColor: '#50B1F8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

    },
    topText: {
        color: '#fff',
        fontSize: 18,
    },
    totalMsg: {
        fontSize: 18,
        color: '#528AC3'
    },
    totalAmt: {
        paddingTop: 5,
        paddingLeft: 40,
        fontSize: 16,
        color: '#cc0000'
    },
    lineMsg: {
        paddingTop: 15,
        fontSize: 16,
        color: '#528AC3'
    },
    lineAmt: {
        paddingTop: 17,
        paddingLeft: 10,
        fontSize: 14,
        color: '#528AC3'
    },
    detailContentLineMsgView: {
        width: screenW * 0.16,
        alignItems: 'flex-start',
    },
    detailContentLineAmtView: {
        width: screenW * 0.3,
        alignItems: 'flex-end',
    },
    msgContainer: {
        height: screenH * 0.36,
        backgroundColor: '#4A7CB0',
        flexDirection: "row",
    },
    totalView: {
        flex: Platform.OS == 'ios' ? 0 : 1,
        width: screenW * 0.4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    detailView: {
        flex: Platform.OS == 'ios' ? 0 : 1,
        width: screenW * 0.6,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    detailContentView: {
        width: screenW * 0.46,
        flexDirection: "row",
        borderColor: '#77A8D2',
        borderBottomWidth: 1,
    },
    itemContainer: {
        backgroundColor: '#fff',
        flexDirection: "row",
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        borderTopWidth: 1,
        borderColor: '#F0F0F0',
    },
    outViewStyle: {
        width: boxW,
        height: screenH * 0.46 / 2,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: vMargin,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderRightWidth: 1,
        borderLeftWidth: 1,
        borderColor: '#F0F0F0',
    },
    icon_image1: {
        alignSelf: 'center',
        width: 60,
        height: 72,
    },
    icon_image2: {
        alignSelf: 'center',
        width: 73,
        height: 63,
    },
    icon_text: {
        marginTop: 5,
        alignSelf: 'center',
        // fontSize: 15,
        color: '#000000',
        textAlign: 'center',
        fontSize: 14,
    },
    index_background: {
        alignSelf: 'flex-end',
        width: screenW,
        height: screenH * 0.15,
    }
});


