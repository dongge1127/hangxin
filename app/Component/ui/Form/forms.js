/**
 * Created by zss on 2016-11-24.
 */
import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    BackAndroid,
    ActivityIndicator,
    TouchableOpacity,
    Platform,
} from 'react-native';
import Echarts from 'native-echarts';
import ScrollableTabView from 'react-native-scrollable-tab-view'
import TabBar from './TabBar'
import ListGrid from './ListGrid'
import ViewUtil from '../common/ViewUtil';
import Service from '../service';
import HttpUtil from '../common/HttpUtil';
import Spinner from "react-native-loading-spinner-overlay";
import NavigationBar from "../APPComponent/NavigationBar";
import CommonModal from "../APPComponent/CommonModal";

var screenW = ViewUtil.screenW;
var screenH = ViewUtil.screenH;
const Dimensions = require('Dimensions');

global.screenWidth = Dimensions.get('window').width;
global.screenHeight = Dimensions.get('window').height;

export default class Forms extends Component {

    constructor(props) {
        super(props);
        BackAndroid.addEventListener('hardwareBackPress', this.handleBackPress.bind(this));
        this.state = {
            text: 'test',
            getTitle: this.props.showtitle,
            rType: this.props.id,
            tabNames: ['日', '周', '月', '季', '年'],
            tabKeys: ['day', 'week', 'month', 'quarter', 'year'],
            subTabNames: ['图形', '表格'],
            subTabKeys: ['chart', 'grid'],
            option: '',
            gridCols: [],
            gridDataList: [],
            currentShow: ['', '', '', '', ''],
            currentOperate: '',
            currentTabName: '0',
            currentSubTab: 'chart',
            animating: true,
            showMask: false,
            oneAlertFlag: false,
            alertMsg: '-',
            requestFail:false,
        };
    }

    //初始化数据
    componentDidMount() {
        //根据从后台获取到的数据为图表和表格加载数据
        setTimeout(()=>{
            this.fetchData('init', 'chart');
        },1000)
    }

    handleBackPress() {
        const {navigator} = this.props;
        const routers = navigator.getCurrentRoutes();
        if (routers.length == 1) {
            return false;
        }
        if (navigator) {
            navigator.pop();
            return true;
        }
        if (!navigator) {
            return false;
        }
    };

    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this.handleBackPress.bind(this));
    }

    hideDialog() {
        this.setState({oneAlertFlag: false});
        const {navigator} = this.props;
        if (navigator) {
            navigator.pop();
        }
    }

    changePre() {
        this.setState({
            animating: true,
            showMask: true
        });
        var currentOperate = 'pre';
        this.fetchData('pre', 'grid');
    }

    changeNext() {
        this.setState({
            animating: true,
            showMask: true
        });
        var currentOperate = 'next';
        this.fetchData('next', 'grid');
    }

    //与后台交互读取数据
    fetchData(currentOperate, showType) {

        // console.log("showType===>"+showType);
        /*--------------------------开始拼接参数------------------------*/
        var params = "";
        //是数字，说明是年、周、月、季度、年之间进行切换
        let tabKeys = this.state.tabKeys;
        let index = '';
        if (!isNaN(currentOperate)) {
            index = currentOperate;
        } else { //否则获取当前的年、周、月、季度
            let currentTabName = this.state.currentTabName;
            index = currentTabName;
        }
        params = '&type=' + tabKeys[index];

        //上下切换,说明是表格，参数增加操作
        if (currentOperate == 'pre' || currentOperate == 'next') {
            params += '&act=' + currentOperate;
        }

        //表格需要增加queryKey参数
        if (showType == 'grid' && currentOperate != 'grid') {
            let queryKey = this.state.currentShow[index];
            if (queryKey != null && queryKey != '') {
                //      console.log("queryKey==================?");
                params += '&queryKey=' + queryKey;
            }
        }
        //    console.log("params=============>"+params);
        /*--------------------------参数拼接完成------------------------*/


        /*--------------------------开始拼接ServiceName-----------------*/
        var serviceName = "";
        let rType = this.state.rType;
        switch (rType) {
            case 'r1': {
                if (showType == 'chart') {
                    serviceName = Service.reportMaterialMaoliChart;
                } else {
                    serviceName = Service.reportMaterialMaoliGrid;
                }
            }
                break;
            case 'r2': {
                if (showType == 'chart') {
                    serviceName = Service.reportHappenChart;
                } else {
                    serviceName = Service.reportHappenGrid;
                }
            }
                break;
            case 'r3': {
                if (showType == 'chart') {
                    serviceName = Service.reportCustomGetChart;
                } else {
                    serviceName = Service.reportCustomGetGrid;
                }
            }
                break;
            case 'r4': {
                if (showType == 'chart') {
                    serviceName = Service.reportChart;
                } else {
                    serviceName = Service.reportGrid;
                }
            }
                break;
        }
        //    console.log("serviceName"+serviceName);
        /*--------------------------ServiceName拼接完成-----------------*/

        url = Service.host + serviceName + params;
        let currentDate = '';
        HttpUtil.get(url, this,90000)
            .then((responseData) => {
                //判断是加载表格还是加载图表
                let currentSubTab = this.state.currentSubTab;
                if (showType == 'chart') {
                    currentDate = responseData.cur;
                    if (!isNaN(currentOperate)) {
                        this.chartOrGrid.goToPage(0);
                    } else {
                        this.loadChart(responseData);//加载图表的数据
                    }
                } else {
                    currentDate = responseData.date;
                    if (!isNaN(currentOperate)) {
                        this.chartOrGrid.goToPage(1);
                    } else {
                        this.loadGrid(responseData);//加载表格的数据
                    }
                }
                let current = this.state.currentShow;
                current[index] = currentDate;

                this.setState({
                    currentShow: current,
                    animating: false,
                });
            })
            .catch((error) => {
                this.setState({
                    animating: false,
                    showMask: false,
                    requestFail:true,
                });
            })
    }

    //加载图表
    loadChart(responseData) {
        console.log(responseData);
        let currentTabName = this.state.currentTabName;
        let tabNames = this.state.tabNames;

        if (responseData.error != null) {

            this.setState({oneAlertFlag: true, alertMsg: responseData.error});

        } else {
            var option = '';
            let rType = this.state.rType;

            var lt = responseData.x.length;

            if (rType == 'r1') { //物品毛利
                option = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {type: 'none'}
                    },
                    legend: {
                        left: 'left',
                        data: responseData.legend
                    },
                    xAxis: {
                        name: tabNames[currentTabName],
                        axisLabel: {
                            interval: 0,
                            rotate: 70
                        },
                        data: responseData.x
                    },
                    grid: {
                        left: '4%',
                        bottom: '32%',
                        width: '84%',
                        containLabel: true
                    },
                    yAxis: {
                        name: '金额（元）'
                    },
                    series: [
                        {
                            name: '销售收入',
                            type: 'line',
                            data: responseData.series.data_销售收入
                        },
                        {
                            name: '销售毛利',
                            type: 'line',
                            data: responseData.series.data_销售毛利
                        }
                    ]
                };

            } else if (rType == 'r2') { //资金收支
                option = {
                    tooltip: {
                        trigger: 'axis', axisPointer: {type: 'none'}
                    },
                    legend: {data: responseData.legend},
                    xAxis: [
                        {
                            name: '金额（元）',
                            type: 'value',
                            axisLabel: {
                                interval: 0,
                                rotate: 70
                            },
                        }
                    ],
                    yAxis: [
                        {
                            name: tabNames[currentTabName]=="周"?"周(开始日期)":tabNames[currentTabName],
                            type: 'category',

                            axisTick: {show: false},
                            data: responseData.x
                        }
                    ],
                    grid: {
                        left: '2%',
                        width: '78%',
                        containLabel: true
                    },
                    series: [
                        {
                            name: '支出',
                            type: 'bar',
                            stack: '总量',
                            itemStyle: {normal: {label: {show: false, position: 'left'}, color: '#cc0033'}},
                            data: responseData.series.data_支出
                        },
                        {
                            name: '收入',
                            type: 'bar',
                            stack: '总量',
                            barWidth: 5,
                            itemStyle: {normal: {label: {show: false, position: 'right'}, color: '#66CC66'}},
                            data: responseData.series.data_收入
                        }
                    ]
                };

            } else if (rType == 'r3') {//客户回款
                option = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {type: 'none'}
                    },
                    legend: {
                        left: 'left',
                        data: responseData.legend
                    },
                    xAxis: {
                        name: tabNames[currentTabName],
                        axisLabel: {
                            interval: 0,
                            rotate: 70
                        },
                        data: responseData.x
                    },
                    grid: {
                        left: '4%',
                        bottom: '32%',
                        width: '84%',
                        containLabel: true
                    },
                    yAxis: {
                        name: '金额(元)'
                    },
                    series: [
                        {
                            name: '销售回款',
                            type: 'line',
                            data: responseData.series.data_销售回款
                        },
                        {
                            name: '销售应收',
                            type: 'line',
                            data: responseData.series.data_销售应收
                        },
                    ]
                };
            } else if (rType == 'r4') {//资金余额
                option = {
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {type: 'none'}
                    },
                    legend: {
                        left: 'left',
                        data: responseData.legend
                    },
                    xAxis: {
                        name: tabNames[currentTabName],
                        axisLabel: {
                            interval: 0,
                            rotate: 70
                        },
                        data: responseData.x
                    },
                    grid: {
                        left: '4%',
                        bottom: '32%',
                        width: '84%',
                        containLabel: true
                    },
                    yAxis: {
                        name: '金额（元）'
                    },
                    series: [
                        {
                            name: '资金余额',
                            type: 'line',
                            itemStyle: {normal: {color: '#ff9900'}},
                            data: responseData.series.data_资金余额
                        }
                    ]
                };
            }

            this.setState({
                option: option,
            });
        }

    }

    //加载表格中的数据
    loadGrid(responseData) {
        //    console.log(responseData);
        this.setState({
            animating: false,
            showMask: false,
            gridCols: responseData.cols,
            gridDataList: responseData.data,
        });
    }

    //表格和图表之间的切换
    changeSubTab(type) {
        var operate = "grid";
        if (type == 0) {
            this.setState({animating: true});
            operate = "chart";
        } else {
            this.setState({
                animating: true,
                showMask: true
            });
        }

        let currentSubTab = this.state.currentSubTab;
        console.log("currentSubTab : "+currentSubTab);
        console.log("type : "+type);
        if (currentSubTab != type) {
            this.setState({currentSubTab: operate});
            this.fetchData(operate, operate);
        }
    }

    onPressBack = () => {
        const {navigator} = this.props;
        if (navigator) {
            navigator.pop();
        }
    };


    render() {
        let tabNames = this.state.tabNames;
        let title = this.state.getTitle;
        let currentSubTab = this.state.currentSubTab;
        let maskView = this._renderMask();

        return (

            <View style={styles.con}>
                <NavigationBar
                    leftAction={this.onPressBack}
                    leftImage={require('../../../../img/back.png')}
                    title={title}/>
                    <ScrollableTabView
                        renderTabBar={() => <TabBar tabNames={tabNames} level='t'/>}
                        onChangeTab={(obj) => {
                            this.setState({currentTabName: obj.i, option: '',animating:true});
                            this.fetchData(obj.i, currentSubTab)
                        }}
                        tabBarPosition='top'>
                        {this.state.tabNames.map((n, i) => this.renderTabView(n, i))}
                    </ScrollableTabView>
                {maskView}
                <CommonModal
                    visible={this.state.oneAlertFlag}
                    message={this.state.alertMsg}
                    sureTitle='确定'
                    sureAction={this.hideDialog.bind(this)}
                />
                <Spinner visible={this.state.visible} overlayColor={'rgba(0, 0, 0, 0.2)'}
                         textContent={this.state.tip} textStyle={{color: 'white', marginTop: 20}}/>
            </View>
        );
    }

    renderTabView = (n, i) => {
        let keys = this.state.tabKeys;
        let subs = this.state.subTabNames;
        let tabNames = this.state.tabNames;
        let subTabKeys = this.state.subTabKeys;
        let getTitle = this.state.getTitle;
        if (this.state.animating == true) {
            return (

                <ScrollableTabView ref={(chartOrGrid) => {
                    this.chartOrGrid = chartOrGrid
                }} tabLabel={subTabKeys[i]} key={i}
                                   renderTabBar={() => <TabBar tabNames={subs} level='s'/>}
                                   onChangeTab={(obj) => {
                                       this.changeSubTab(obj.i)
                                   }}
                                   locked={true} tabBarPosition='bottom'>
                    <View style={styles.content} tabLabel="chart">
                        <ActivityIndicator
                            animating={this.state.animating}
                            style={{
                                position: 'absolute',
                                top: (ViewUtil.screenH) / 4,
                                left: (ViewUtil.screenW - 20) / 2
                            }}
                            size="large"
                        />
                    </View>
                    <View style={styles.content} tabLabel="grid">
                        <View style={styles.change}>
                            <TouchableOpacity onPress={this.changePre.bind(this)}>
                                <View style={styles.preViewStyle}>
                                    <Text style={styles.change_icon_text}>前一{tabNames[i]}</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={styles.currentViewStyle}>
                                <Text style={styles.change_icon_current_text}>{this.state.currentShow[i]}</Text>
                            </View>
                            <TouchableOpacity onPress={this.changeNext.bind(this)}>
                                <View style={styles.nextViewStyle}>
                                    <Text style={styles.change_icon_text}>后一{tabNames[i]}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                        <ActivityIndicator
                            animating={this.state.animating}
                            style={{
                                position: 'absolute',
                                top: (ViewUtil.screenH) / 4,
                                left: (ViewUtil.screenW - 20) / 2
                            }}
                            size="large"
                        />

                    </View>

                </ScrollableTabView>
            );
        } else {
            return (

                <ScrollableTabView ref={(chartOrGrid) => {
                    this.chartOrGrid = chartOrGrid
                }} tabLabel={subTabKeys[i]} key={i}
                                   renderTabBar={() => <TabBar tabNames={subs} level='s'/>}
                                   onChangeTab={(obj) => {
                                       this.changeSubTab(obj.i)
                                   }}
                                   locked={true} tabBarPosition='bottom'>

                        <View style={styles.container} tabLabel="chart">
                            <Echarts option={this.state.option}
                                     height={screenH-250}
                            />
                        </View>
                    <View style={styles.content} tabLabel="grid">
                        <View style={styles.change}>
                            <TouchableOpacity onPress={this.changePre.bind(this)}>
                                <View style={styles.preViewStyle}>
                                    <Text style={styles.change_icon_text}>前一{tabNames[i]}</Text>
                                </View>
                            </TouchableOpacity>
                            <View style={styles.currentViewStyle}>
                                <Text style={styles.change_icon_current_text}>{this.state.currentShow[i]}</Text>
                            </View>
                            <TouchableOpacity onPress={this.changeNext.bind(this)}>
                                <View style={styles.nextViewStyle}>
                                    <Text style={styles.change_icon_text}>后一{tabNames[i]}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>

                        <ListGrid cols={this.state.gridCols} dataList={this.state.gridDataList}/>
                    </View>

                </ScrollableTabView>
            );
        }
    }

    _changeMask() {
        this.setState({
            'showMask': !this.state.showMask
        })
    }

    _renderMask() {
        if (this.state.showMask) {
            return (
                <View style={{
                    position: 'absolute',
                    top: 2,
                    left: 0,
                    width: global.screenWidth,
                    height: global.screenHeight,
                    backgroundColor: '#000000',
                    opacity: 0.0
                }}>

                </View>
            );
        } else {
            return null;
        }
    }
}

const styles = StyleSheet.create({
    topBar: {
        height:Platform.OS == 'ios'?55:35,
        paddingTop: Platform.OS == 'ios' ? 20 : 0,
        backgroundColor: '#50B1F8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    topText: {
        color: '#fff',
        fontSize: 18,
    },
    backText: {
        color: '#fff',
        fontSize: 18,
        marginLeft: 5,
    },
    backImgStyle: {
        width: 30,
        height: 30,
        marginLeft: 8,
    },
    con: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    container: {
        paddingTop: 10,
        backgroundColor: '#ffffff',
    },
    content: {
        height: Platform.OS == 'ios' ? screenH * 0.63 : screenH * 0.58,
        paddingBottom: Platform.OS == 'ios' ? 5 : 20,
    },
    change: {
        height: 30,
        backgroundColor: '#7EC0EE',
        flexDirection: 'row',
        alignItems: 'center',
    },
    preViewStyle: {
        backgroundColor: '#73b2e8',
        width: screenW * 0.2,
        height: 30,
        alignItems: 'center',      // 水平局中
        justifyContent: 'center',  // 垂直居中
    },
    currentViewStyle: {
        backgroundColor: '#7aafdc',
        width: screenW * 0.6,
        height: 30,
        alignItems: 'center',      // 水平局中
        justifyContent: 'center',  // 垂直居中
    },
    nextViewStyle: {
        backgroundColor: '#73b2e8',
        width: screenW * 0.2,
        height: 30,
        alignItems: 'center',      // 水平局中
        justifyContent: 'center',  // 垂直居中
    },
    centering: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
    },
    change_icon_current_text: {
        color: '#FFFFFF',
    },
    change_icon_text: {
        color: '#FFFFFF',
    }
});