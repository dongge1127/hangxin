import React, {Component} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  Picker, Platform,
} from 'react-native';
import Echarts from '../../common/echarts';
import CommonStyles from "../../../../style/CommonStyle";
import NavigationBar from "../../APPComponent/NavigationBar";
import screen from '../../common/ScreenSizeUtil';
import Service from "../../service";
import HttpUtil from "../../common/HttpUtil";
import Toast from "react-native-root-toast";
import ViewUtil from "../../common/ViewUtil";
import ToastUtil from "../../common/ToastUtil";
import Spinner from "react-native-loading-spinner-overlay";

/**
 * 进度条 宽度
 * @type {number}
 */
const xl = Dimensions.get('window').width - 50;
/**
 * 单据量统计
 * @author liuMi
 * @date  2020年6月29日
 */
export default class ReportSearch extends Component {
  constructor(props) {
    super(props);
    // 分析维度
    this.DimensionSpans = [{name: '期间', value: 'none'}, {name: '所属组织', value: 'cforgnname'}, {
      name: '业务分类',
      value: 'cbillclassname'
    }, {
      name: '工单类型',
      value: 'cbilltypename'
    }];
    // 初始开始期间
    const periodStart = new Date().getFullYear() + "-01";
    // 初始结束期间
    const periodEnd = new Date().getFullYear() + "-" + this.formatZero(new Date().getMonth() + 1, 2);
    // 面包屑导航
    this.oblink = [{
      name: "期间",
      param: {},
    }];
    // 请求的维度
    this.reqDimension = '';
    // 请求id
    this.reqId = '';
    this.isCalled = false;
    this.timer = null;
    this.timer1 = null;
    this.state = {
      // 当前维度
      dimension: this.DimensionSpans[0],
      // 是否显示期间筛选框
      isShowLBtn: false,
      // 是否显示维度筛选框
      isShowRBtn: false,
      // 左侧期间筛选按钮是否被选中
      isActiveLBtn: false,
      // 右侧维度筛选按钮是否被选中
      isActiveRBtn: false,
      // 当前期间  默认为 当前年~当前月
      period: periodStart + "~" + periodEnd,
      periodType: 1,//分析期间类型 0-年  1-月
      periodStart: periodStart,//期间开始
      periodEnd: periodEnd,//期间结束
      // 是否显示底部上一期间、下一期间
      isShowFooter: false,
      // 饼图数据
      pieData: [],
      // 列表柱状图 X轴数据
      detailDataX: [],
      // 列表柱状图 Y轴数据
      detailDataY: [],
      // 是否显示期间选择器Modal框
      isShowModal: false,
      // 选中的年
      selectYear: new Date().getFullYear(),
      // 选中的月份
      selectMonth: new Date().getMonth() + 1,
      // 选中的维度
      selectDimension: this.DimensionSpans[1],
      // 是否显示遮罩
      visible: false,
      // 遮罩屏幕中间的信息
      tip: '数据加载中',
    };
  }

  componentDidMount(): void {
    const {periodType, periodStart, periodEnd} = this.state;
    let url = Service.host + 'a8_fssc_modules_bill_modules&tokenID=' + Service.tokenID +
      '&userName=' + Service.userName + '&periodType=' + periodType + '&periodStart=' + periodStart +
      '&periodEnd=' + periodEnd + '&details=false';
    HttpUtil.get(url, this).then(res => {
      this.setState({
          pieData: res.pieData,
          detailDataY: res.detailData,
          detailDataX: res.getxAxis,
        }
      )
    }).catch(() => {
      Toast.show('您所在的用户组没有权限', {
        duration: Toast.durations.SHORT,
        position: ViewUtil.screenH - 130,
        shadow: true,
        backgroundColor: 'rgba(0,0,0,0.7)',
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
    });
  }

  componentWillUnmount() {
    this.timer && clearInterval(this.timer);
    this.timer1 && clearInterval(this.timer1);
  }
  // 状态栏上的返回按钮
  onPressBack = () => {
    const {navigator} = this.props;
    if (navigator) {
      navigator.pop();
    }
  };

  // 显示左侧分析期间
  _showLeft() {
    if (!this.state.isShowLBtn) {
      this.setState({
        isActiveLBtn: true,
        isActiveRBtn: false,
        isShowLBtn: true,
        isShowRBtn: false
      });
    }
  }

  // 显示右侧分析维度
  _showRight() {
    if (!this.state.isShowRBtn && this.state.dimension.value !== 'none') {
      this.setState({
        isShowLBtn: false,
        isShowRBtn: true,
        isActiveLBtn: false,
        isActiveRBtn: true,
      });
    }
  }

  // 上一期间 下一期间
  togglePeriod(type) {
    const {period, periodType, periodStart, periodEnd} = this.state;
    // 上一期间
    if (type === 'up' && period == this.oblink[0].param.periodStart) {
      Toast.show('已经是第一个了', {
        duration: Toast.durations.SHORT,
        position: ViewUtil.screenH - 130,
        shadow: true,
        backgroundColor: 'rgba(0,0,0,0.7)',
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
      return false;
    }
    // 下一期间
    if (type === 'down' && period == this.oblink[0].param.periodEnd) {
      Toast.show('已经是最后一个了', {
        duration: Toast.durations.SHORT,
        position: ViewUtil.screenH - 130,
        shadow: true,
        backgroundColor: 'rgba(0,0,0,0.7)',
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
      return false;
    }

    let periodNew = '';
    if (this.state.periodType === 0) {
      periodNew = type === 'up' ? Number(period) - 1 : Number(period) + 1;
    } else {
      let date = new Date(period.replace(/-/g, "/") + "/01");
      let month = type === 'up' ? date.getMonth() - 1 : date.getMonth() + 1;
      date.setMonth(month);
      periodNew = date.getFullYear() + "-" + this.formatZero(date.getMonth() + 1, 2);
    }
    let url = Service.host + 'a8_fssc_modules_bill_modules&tokenID=' + Service.tokenID +
      '&userName=' + Service.userName + '&periodType=' + periodType + '&details=true&periodStart=' + periodNew +
      '&periodEnd=' + periodNew + '&dimension=' + this.reqDimension + '&ids=' + this.reqId;
    HttpUtil.get(url, this).then(res => {
      this.oblink[0] = {name: periodNew,
        param: {
          ...this.oblink[0].param,
          period: periodNew,
        }
      };
      this.setState({
        period: periodNew,
        periodStart: type === 'up' ? periodNew : periodStart,
        periodEnd: type === 'up' ? periodEnd : periodNew,
        pieData: res.pieData,
        detailDataY: res.detailData,
        detailDataX: res.getxAxis,
      });
    }).catch(() => {
      Toast.show('网络原因数据读取失败', {
        duration: Toast.durations.SHORT,
        position: ViewUtil.screenH - 130,
        shadow: true,
        backgroundColor: 'rgba(0,0,0,0.7)',
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
    });
  }

  // 底部按钮
  genFooterView() {
    return (
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.left_btn, {
            height: screen.getHeightSize(100),
            width: screen.getWidthSize(385),
            borderTopWidth: screen.getHeightSize(2),
            borderTopColor: "#eee",
          }]}
          onPress={this.togglePeriod.bind(this, 'up')}
        >
          <Text style={[styles.bottom_text, {
            color: "#333"
          }]}>上一期间</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={this.togglePeriod.bind(this, 'down')}>
          <View style={[styles.right_btn, {
            backgroundColor: "#00b5ce",
            height: screen.getHeightSize(100),
          }]}>
            <Text style={[styles.bottom_text, {
              color: "#FFF"
            }]}>下一期间</Text>
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  // 期间类型
  selectType(type) {
    if (this.state.periodType !== type) {
      const year = new Date().getFullYear();
      const month = this.formatZero(new Date().getMonth() + 1, 2);
      let periodStart = type === 0 ? `${year}` : `${year}-01`;
      let periodEnd = type === 0 ? `${year}` : `${year}-${month}`;
      this.setState({
        periodType: type,
        periodStart: periodStart,
        periodEnd: periodEnd,
      });
    }
  }

  // 分析期间
  genPeriodFilter() {
    return (
      <View style={[styles.left_box, {
        height: screen.getHeightSize(1334),
        backgroundColor: 'rgba(0,0,0,0.5)',
      }]}>
        <View style={{
          height: screen.getHeightSize(570),
          backgroundColor: "#FFF",
        }}>
          <ScrollView keyboardShouldPersistTaps={'always'}>
            <View style={styles.ziti_box}>
              <Text style={{
                fontSize: screen.getWidthSize(28),
                color: "#333"
              }}>分析期间类型</Text>
            </View>
            <View style={styles.but_box}>
              <TouchableOpacity
                style={[styles.anniu2, {
                  backgroundColor: this.state.periodType === 0 ? "#00b5ce" : "white",
                  borderColor: this.state.periodType === 0 ? "#00b5ce" : "#9e9e9e",
                }]}
                onPress={this.selectType.bind(this, 0)}>
                <Text
                  style={[styles.anniu_ziti, {
                    color: this.state.periodType === 0 ? "white" : "black",
                  }]}>按年</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.anniu2, {
                  marginLeft: screen.getWidthSize(25),
                  backgroundColor: this.state.periodType === 1 ? "#00b5ce" : "white",
                  borderColor: this.state.periodType === 1 ? "#00b5ce" : "#9e9e9e",
                }]}
                onPress={this.selectType.bind(this, 1)}>
                <Text
                  style={[styles.anniu_ziti, {
                    color: this.state.periodType === 1 ? "white" : "black",
                  }]}>按月</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.ziti_box}>
              <Text style={{
                fontSize: screen.getWidthSize(28),
                color: "#333"
              }}>期间</Text>
            </View>
            <View style={styles.but_box}>
              <TouchableOpacity onPress={this.selectjd.bind(this, "start")}>
                <View style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: screen.getWidthSize(20),
                  width: screen.getWidthSize(280),
                  height: screen.getHeightSize(90),
                  borderColor: "#d7d7d7",
                  borderWidth: screen.getWidthSize(2),
                  borderRadius: screen.getWidthSize(10),
                  paddingLeft: screen.getWidthSize(10),

                }}
                ><Text style={{color: "#333"}}>{this.state.periodStart}</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={this.selectjd.bind(this, "end")}>
                <View style={{
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: screen.getWidthSize(20),
                  width: screen.getWidthSize(280),
                  height: screen.getHeightSize(90),
                  borderColor: "#d7d7d7",
                  borderWidth: screen.getWidthSize(2),
                  borderRadius: screen.getWidthSize(10),
                  paddingLeft: screen.getWidthSize(10),
                }}
                ><Text style={{color: "#333"}}>{this.state.periodEnd}</Text></View>
              </TouchableOpacity>
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity onPress={this._close.bind(this)}>
              <View style={[styles.right_btn, {
                backgroundColor: "#00b5ce",
                height: screen.getHeightSize(100),
                width: screen.getWidthSize(750)
              }]}>
                <Text style={[styles.bottom_text, {color: "#FFF"}]}>确定</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={{height: screen.getHeightSize(564)}}
          onPress={this._close.bind(this)}
        />
      </View>
    );
  }

  // 分析维度
  genDimensionFilter() {
    const {selectDimension} = this.state;
    return (
      <View style={[styles.right_box, {
        height: screen.getHeightSize(1334),
        backgroundColor: 'rgba(0,0,0,0.5)'
      }]}>
        <View style={{
          height: screen.getHeightSize(430),
          backgroundColor: "#FFF"
        }}>
          <ScrollView keyboardShouldPersistTaps={'always'}>
            <View style={styles.ziti_box}>
              <Text style={{
                fontSize: screen.getWidthSize(28),
                color: "#333"
              }}>分析维度类型</Text>
            </View>
            <View style={styles.but_box}>
              {this.DimensionSpans.filter(value => value.value !== 'none').map((value, index) => {
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.anniu, {
                      backgroundColor: selectDimension.value === value.value ? "#00b5ce" : "white",
                      borderColor: selectDimension.value === value.value ? "#00b5ce" : "#9e9e9e",
                    }]}
                    onPress={() => {
                      this.setState({selectDimension: value});
                    }}>
                    <Text
                      style={[styles.anniu_ziti, {
                        color: selectDimension.value === value.value ? "white" : "black"
                      }]}>{value.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity
              onPress={this._closeRight.bind(this)}>
              <View style={[styles.right_btn, {
                backgroundColor: "#00b5ce",
                height: screen.getHeightSize(100),
                width: screen.getWidthSize(750)
              }]}>
                <Text style={[styles.bottom_text, {color: "#FFF"}]}>确定</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={{height: screen.getHeightSize(564)}}
          onPress={this._close.bind(this)}
        />
      </View>
    );
  }

  // 弹出期间选择器
  selectjd(type) {
    this.opentype = type;
    const {periodStart, periodEnd, periodType} = this.state;
    let period = type === 'start' ? periodStart : periodEnd;
    if (periodType === 1) {
      let periods = period.split('-');
      this.setState({
        selectYear: periods[0],
        selectMonth: periods[1],
        isShowModal: true
      });
    } else {
      this.setState({
        selectYear: period,
        isShowModal: true
      });
    }
  }

  // 关闭期间筛选页面
  _close() {
    const {periodStart, periodEnd, dimension, periodType, period} = this.state;
    if (periodType === 0) {
      if (periodStart > periodEnd) {
        ToastUtil.show("开始时间不能大于结束时间");
        return;
      }
    } else {
      let periodsS = periodStart.split('-');
      let periodsE = periodEnd.split('-');
      if (periodsS[0] > periodsE[0]) {
        ToastUtil.show("开始时间不能大于结束时间");
        return;
      } else if (periodsS[0] === periodsE[0] && periodsS[1] > periodsE[1]) {
        ToastUtil.show("开始时间不能大于结束时间");
        return;
      }
    }
    // 没有修改任何值
    if ((dimension.value === 'none' && period == periodStart + "~" + periodEnd) || (Number(period) == Number(periodEnd) && Number(period) == Number(periodStart))) {
      this.setState({
        isShowLBtn: false,
        isShowRBtn: false,
        isActiveLBtn: false,
        isActiveRBtn: false,
      });
      return false;
    }
    let params = this.oblink[0].param;
    this.oblink[0] = {
      name: periodEnd,
      param: {
        ...params,
        dimensionSpans: this.DimensionSpans,
        periodStart,
        periodEnd,
      }
    };
    let str;
    if (dimension.value !== 'none') {
      str = '&details=true&periodStart=' + periodEnd + '&periodEnd=' + periodEnd + '&dimension=' + this.reqDimension + '&ids=' + this.reqId;
    } else {
      str = '&details=false&periodStart=' + periodStart + '&periodEnd=' + periodEnd;
    }
    let url = Service.host + 'a8_fssc_modules_bill_modules&tokenID=' + Service.tokenID +
      '&userName=' + Service.userName + '&periodType=' + periodType + str;
    HttpUtil.get(url, this).then(res => {
      this.setState({
        isShowLBtn: false,
        isShowRBtn: false,
        isActiveLBtn: false,
        isActiveRBtn: false,
        period: dimension.value === 'none' ? periodStart + "~" + periodEnd : periodEnd,
        periodStart: periodStart,
        periodEnd: periodEnd,
        pieData: res.pieData,
        detailDataY: res.detailData,
        detailDataX: res.getxAxis,
      });
    }).catch(() => {
      Toast.show('网络原因数据读取失败', {
        duration: Toast.durations.SHORT,
        position: ViewUtil.screenH - 130,
        shadow: true,
        backgroundColor: 'rgba(0,0,0,0.7)',
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
    });
  }

  // 关闭维度筛选页面
  _closeRight() {
    // 最后一个维度 不请求数据
    if (this.DimensionSpans.length === 2) {
      this.setState({isShowRBtn: false});
      return false;
    }
    const {selectDimension, periodType, periodEnd, periodStart, dimension} = this.state;
    let len = this.oblink.length;
    this.oblink[len - 1] = {name: selectDimension.name, param: {selectDimension}};
    let str;
    if (dimension.value !== 'none') {
      if (this.reqDimension.indexOf(",") > -1) {
        this.reqDimension = this.reqDimension.substr(0, this.reqDimension.lastIndexOf(",")) + "," + selectDimension.value;
      } else {
        /*this.reqDimension = this.reqDimension ? this.reqDimension + "," + selectDimension.value : selectDimension.value;*/
        this.reqDimension = selectDimension.value;
      }
      str = '&details=true&periodStart=' + periodEnd + '&periodEnd=' + periodEnd + '&dimension=' + this.reqDimension + '&ids=' + this.reqId;
    } else {
      this.reqDimension = '';
      str = '&details=false&periodStart=' + periodStart + '&periodEnd=' + periodEnd;
    }

    let url = Service.host + 'a8_fssc_modules_bill_modules&tokenID=' + Service.tokenID +
      '&userName=' + Service.userName + '&periodType=' + periodType + str;
    HttpUtil.get(url, this).then(res => {
      this.setState({
        dimension: selectDimension,
        isShowRBtn: false,
        pieData: res.pieData,
        detailDataY: res.detailData,
        detailDataX: res.getxAxis,
      });
    }).catch(() => {
      Toast.show('网络原因数据读取失败', {
        duration: Toast.durations.SHORT,
        position: ViewUtil.screenH - 130,
        shadow: true,
        backgroundColor: 'rgba(0,0,0,0.7)',
        animation: true,
        hideOnPress: true,
        delay: 0,
      });
    });
  }

  // 显示明细
  _showDetail(param) {
    if (!this.isCalled) {
      this.isCalled = true;
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.isCalled = false;
      }, 1500);

      let params = param.split("#");
      let name = params[0];
      let id = params[1];
      // 若只剩1个维度则 不显示明细
      if (this.DimensionSpans.length > 2) {
        const {dimension, period, periodEnd, periodStart, periodType} = this.state;
        let periodDate = dimension.value === 'none' ? name : period;
        let len = this.oblink.length;
        this.oblink[len - 1] = {
          name: name,
          param: {
            dimension,
            dimensionSpans: this.DimensionSpans,
            periodStart,
            periodEnd: period == periodEnd ? period : periodEnd,
            reqDimension: this.reqDimension,
            reqId: this.reqId,
          }
        };
        if (dimension.value !== 'none') {
          this.DimensionSpans = this.DimensionSpans.filter(value => value.name !== dimension.name);
          this.reqDimension = this.reqDimension + "," + this.DimensionSpans[1].value;
          this.reqId = id;
        } else {
          this.reqDimension = 'cforgnname';
          this.reqId = '';
        }
        this.oblink.push({
          name: this.DimensionSpans[1].name,
          param: {
            dimension,
            dimensionSpans: this.DimensionSpans,
            periodStart,
            periodEnd: periodDate,
            reqDimension: this.reqDimension,
            reqId: this.reqId,
          }
        });
        let str = '';
        if (id) {
          str = '&ids=' + id;
        }
        let url = Service.host + 'a8_fssc_modules_bill_modules&tokenID=' + Service.tokenID +
          '&userName=' + Service.userName + '&periodType=' + periodType + '&dimension=' + this.reqDimension + '&details=true'
          + '&periodStart=' + periodDate + '&periodEnd=' + periodDate + str;
        this.setState({visible: true});
        HttpUtil.get(url, this).then(res => {
          this.setState({
            dimension: this.DimensionSpans[1],
            selectDimension: this.DimensionSpans[1],
            period: dimension.value === 'none' ? name : period,
            periodEnd: periodDate,
            isShowFooter: true,
            pieData: res.pieData,
            detailDataY: res.detailData,
            detailDataX: res.getxAxis,
            visible: false,
          }, () => {
            this.timer1 = setTimeout(() => {
              this.refs.scroll.scrollTo({x: 0, y: 0, animated: false})
            }, 500);
          });
        }).catch(() => {
          this.setState({visible: false});
          Toast.show('网络原因数据读取失败', {
            duration: Toast.durations.SHORT,
            position: ViewUtil.screenH - 130,
            shadow: true,
            backgroundColor: 'rgba(0,0,0,0.7)',
            animation: true,
            hideOnPress: true,
            delay: 0,
          });
        });
      }
    }
  }

  // JS数字位数不够，前面位数补零
  formatZero(num, len) {
    if (String(num).length > len) return num;
    return (Array(len).join(0) + num).slice(-len);
  }

  // 选择期间确认
  queren() {
    const {selectYear, selectMonth, periodType} = this.state;
    if (this.opentype === 'start') {
      this.setState({
        periodStart: periodType === 0 ? selectYear : selectYear + '-' + selectMonth,
        isShowModal: false,
      });
    } else if (this.opentype === 'end') {
      this.setState({
        periodEnd: periodType === 0 ? selectYear : selectYear + '-' + selectMonth,
        isShowModal: false,
      });
    }
  }

  render() {
    const pieOption = {
      //标题　　
      title: {
        show: false,
      },
      //提示框，鼠标悬浮交互时的信息提示
      tooltip: {
        trigger: 'item',
        formatter: "{b} : {c} ({d}%)"
      },
      //图例，每个图表最多仅有一个图例
      legend: {
        show: false,
      },
      // 系列列表,每个系列通过 type 决定自己的图表类型
      series: [
        {
          type: 'pie',
          radius: '60%',
          center: ['50%', '50%'],
          minAngle: '0',
          animation: false,
          data: this.state.pieData,
          itemStyle: {
            normal: {
              label: {
                show: true,
                formatter: function (params) {
                  let text = `${params.data.name}`;
                  if (text.length <= 7) {
                    return `${text} \nn ${params.percent}%`;
                  } else if (text.length > 8 && text.length <= 15) {
                    return `${text.slice(0, 7)} \nn ${text.slice(7)} \nn ${params.percent}%`;
                  } else if (text.length > 15 && text.length <= 23) {
                    return `${text.slice(0, 7)} \nn ${text.slice(7, 14)} \nn ${text.slice(14)} \nn ${params.percent}%`;
                  } else if (text.length > 23 && text.length <= 30) {
                    return `${text.slice(0, 7)} \nn ${text.slice(7, 14)} \nn ${text.slice(14, 21)} \nn ${text.slice(21)} \nn ${params.percent}%`;
                  } else if (text.length > 30) {
                    return `${text.slice(0, 7)} \nn ${text.slice(7, 14)} \nn ${text.slice(14, 21)} \nn ${text.slice(21, 28)} \nn ${text.slice(28)} \nn ${params.percent}%`;
                  } else {
                    return `${params.data.name} \nn ${params.percent}%`;
                  }
                },
                position: "outside",
                alignTo: 'labelLine',
                textStyle: {
                  fontSize: 10,
                },
              },

              labelLine: {
                show: true,
                length: 12,
              }
            }
          }
        }
      ],
    };
    const progressOption = {
      tooltip: {
        trigger: 'item', //悬浮提示框不显示
        show: false,
      },
      grid: {
        x: 10, //左留白
        y: 0, //上留白
        x2: 35, //右留白
        y2: 0 //下留白
      },
      xAxis: [{
        show: false,
        type: 'value',
        boundaryGap: [0, 0],
      }],
      yAxis: [{
        inverse: true,
        type: 'category',
        min: function (value) {
          return (value.min - 20)
        },
        data: this.state.detailDataX,
        axisLine: {show: false}, //坐标轴
        axisTick: [{ //坐标轴小标记
          show: false,

        }],
        axisLabel: {
          textStyle: {fontSize: '12', color: "#333"},
          inside: true,
          margin: 0,
        },
        z: 100
      }],
      series: [{
        type: 'bar',
        data: this.state.detailDataY,
        barMinHeight: 100, //最小柱高
        barWidth: 25, //柱宽度
        itemStyle: {
          normal: {
            label: {
              show: true, //显示文本
              position: [xl, 12], //数据值位置
              textStyle: {
                color: '#000',
                fontSize: '12',
                align: 'right',
              },
              formatter: '{c0}',
            },
            color: 'transparent',
          },
        },
      }, {
        name: '',
        type: 'bar',
        tooltip: {show: false},
        animation: true,
        barMinHeight: 0, //最小柱高
        barWidth: 8, //柱宽度
        barMaxWidth: 100, //最大柱宽度
        data: this.state.detailDataY,
        itemStyle: {
          normal: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 1,
              colorStops: [{
                offset: 0, color: '#e57f50' // 0% 处的颜色
              }, {
                offset: 1, color: '#d44054' // 100% 处的颜色
              }],
              globalCoord: false // 缺省为 false
            }, //柱状图颜色
            barBorderRadius: [5, 5, 5, 5], // 定义背景柱形的圆角
            label: {
              show: false, //显示文本
              position: [xl, 0], //数据值位置
              textStyle: {
                color: '#000',
                fontSize: '12'
              },
              formatter: '{c0}',
            }
          }
        },
      }],
    };
    const {dimension, period, isActiveLBtn, isActiveRBtn, detailDataY} = this.state;

    return (
      <View style={[CommonStyles.CommonWrapContainer, {backgroundColor: '#fff'}]}>
        <NavigationBar
          leftAction={this.onPressBack}
          leftImage={require('../../../../../img/back.png')}
          title={'单据量统计'}
        />
        {/*头部按钮组*/}
        <View style={styles.head_btn_group}>
          <TouchableOpacity
            style={styles.left_btn}
            onPress={this._showLeft.bind(this)}
          >
            <Text style={[styles.btn_text, {color: isActiveLBtn ? "#00b5ce" : "#333"}]}>{period}</Text>
          </TouchableOpacity>
          <View style={{
            width: screen.getWidthSize(2),
            height: screen.getHeightSize(70),
            backgroundColor: "#eee"
          }}/>
          <TouchableOpacity
            style={styles.right_btn}
            onPress={this._showRight.bind(this)}
          >
            <Text style={[styles.btn_text1, {color: isActiveRBtn ? "#00b5ce" : "#333"}]}>{dimension.name}</Text>
          </TouchableOpacity>
        </View>
        <View style={{flexDirection: 'row', height: 30, padding: 5, backgroundColor: '#eeeeee'}}>
          {/*面包屑导航*/}
          {this.link()}
        </View>
        <ScrollView ref={'scroll'} style={{marginBottom: 25}}>
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Echarts option={pieOption} height={400} onPress={() => false}/>
          </View>
          <View style={{justifyContent: 'center', alignItems: 'center'}}>
            <Echarts option={progressOption} height={detailDataY ? detailDataY.length * 40 : 300}
                     onPress={this._showDetail.bind(this)}/>
          </View>
        </ScrollView>
        {this.state.isShowFooter ? this.genFooterView() : null}
        {this.state.isShowLBtn ? this.genPeriodFilter() : null}
        {this.state.isShowRBtn ? this.genDimensionFilter() : null}
        <Modal
          visible={this.state.isShowModal}
          onRequestClose={() => {
            this.setState({isShowModal: false})
          }}
          transparent={true}
        >
          <View style={{
            flexDirection: "row",
            height: screen.getHeightSize(80),
            marginTop: Dimensions.get('window').height - screen.getHeightSize(500),
            backgroundColor: '#eee',
          }}>
            <TouchableOpacity style={styles.can} onPress={() => {
              this.setState({isShowModal: false})
            }}>
              <View><Text style={styles.fontw}>取消</Text></View>
            </TouchableOpacity>
            <View style={styles.titles}>
              <Text style={styles.fontw2}>选择期间</Text>
            </View>
            <TouchableOpacity style={styles.can} onPress={this.queren.bind(this)}>
              <View><Text style={styles.fontw}>确定</Text></View>
            </TouchableOpacity>
          </View>
          <View style={{flexDirection: 'row',justifyContent: "center", backgroundColor: '#fff', height: 300}}>
            <Picker
              style={{width: screen.getWidthSize(350)}}
              prompt={'请选择年份'}
              selectedValue={this.state.selectYear}
              mode={"dropdown"}
              onValueChange={lang => {
                this.setState({selectYear: lang})
              }}
            >
              {this._renderDeal(2016, new Date().getFullYear() + 1, '年')}
            </Picker>
            {this.state.periodType === 1 ? (
              <Picker
                style={{width: screen.getWidthSize(350)}}
                prompt={'请选择月份'}
                selectedValue={this.state.selectMonth}
                mode={"dropdown"}
                onValueChange={(lang) => {
                  this.setState({selectMonth: lang})
                }}
              >
                {this._renderDeal(1, 13, '月')}
              </Picker>
            ) : null}
          </View>
        </Modal>
        <Spinner visible={this.state.visible} overlayColor={'rgba(0, 0, 0, 0.2)'}
                 textContent={this.state.tip} textStyle={{color: 'white'}}/>
      </View>
    );
  }

  // Picker加载年、月
  _renderDeal(start, ender, str) {
    const dealRow = [];
    for (let i = start; i < ender; i++) {
      // 月份碰到小于10的加0,例如07月
      if ((i + '').length <= 1) {
        dealRow.push(
          <Picker.Item label={'0' + i + str} value={'0' + i} key={i}/>
        );
      } else {
        dealRow.push(
          <Picker.Item label={i + str} value={'' + i} key={i}/>
        );
      }
    }
    return dealRow;
  }

  // 面包屑导航
  link() {
    let tpl = [];
    this.oblink.map((data, index) => {
      tpl.push(
        <Text
          key={index}
          style={[styles.view_text, {color: this.oblink.length - 1 === index ? "#00b5ce" : "#333"}]}
          onPress={() => {
            const {periodType} = this.state;
            if (this.oblink.length - 1 !== index) {
              const param = this.oblink[index].param;
              this.oblink = this.oblink.splice(0, index);
              this.oblink.push(param.dimension);
              this.DimensionSpans = param.dimensionSpans;
              this.reqDimension = param.reqDimension;
              this.reqId = param.reqId;
              let str;
              if (index === 0) {
                str = '&details=false&periodStart=' + param.periodStart + '&periodEnd=' + param.periodEnd;
              } else {
                str = '&details=true&periodStart=' + param.periodEnd + '&periodEnd=' + param.periodEnd + '&dimension=' + param.reqDimension + '&ids=' + param.reqId;
              }
              let url = Service.host + 'a8_fssc_modules_bill_modules&tokenID=' + Service.tokenID +
                '&userName=' + Service.userName + '&periodType=' + periodType + str;
              HttpUtil.get(url, this).then(res => {
                this.setState({
                  dimension: param.dimension,
                  periodStart: param.periodStart,
                  periodEnd: param.periodEnd,
                  period: index === 0 ? param.periodStart + "~" + param.periodEnd : this.state.periodEnd,
                  pieData: res.pieData,
                  detailDataY: res.detailData,
                  detailDataX: res.getxAxis,
                  isShowFooter: index !== 0,
                  selectDimension: param.dimension,
                });
              }).catch(() => {
                Toast.show('网络原因数据读取失败', {
                  duration: Toast.durations.SHORT,
                  position: ViewUtil.screenH - 130,
                  shadow: true,
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  animation: true,
                  hideOnPress: true,
                  delay: 0,
                });
              });
              this.link();
            }
          }}
        >
          {data.name} {this.oblink.length - 1 === index ? "" : " > "}
        </Text>
      )
    });

    return (
      <View style={{flexDirection: "row", flexWrap: "wrap"}}>
        {tpl}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  head_btn_group: {
    width: screen.getWidthSize(750),
    height: screen.getHeightSize(70),
    flexDirection: 'row',
    justifyContent: 'center',
    borderColor: "#eee",
    borderBottomWidth: screen.getWidthSize(2)
  },
  left_btn: {
    height: screen.getHeightSize(70),
    justifyContent: 'center',
    alignItems: 'center',
    width: screen.getWidthSize(374),
  },
  btn_text: {
    color: '#0083CE',
    fontSize: screen.getWidthSize(30),
  },
  right_btn: {
    height: screen.getHeightSize(70),
    justifyContent: 'center',
    alignItems: 'center',
    width: screen.getWidthSize(374),
  },
  btn_text1: {
    color: '#333333',
    fontSize: screen.getWidthSize(30),
  },
  footer: {
    width: screen.getWidthSize(750),
    height: screen.getHeightSize(100),
    flexDirection: 'row',
    backgroundColor: "#ffffff",
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom_text: {
    fontSize: screen.getWidthSize(30),
  },
  left_box: {
    backgroundColor: "white",
    position: "absolute",
    top: Platform.OS == 'ios' ? 55 + screen.getHeightSize(70) : 35 + screen.getHeightSize(70),
    height: screen.getHeightSize(800),
    borderTopWidth: screen.getWidthSize(2),
    borderTopColor: "#eee",
  },
  right_box: {
    backgroundColor: "white",
    position: "absolute",
    top: Platform.OS == 'ios' ? 55 + screen.getHeightSize(70) : 35 + screen.getHeightSize(70),
    height: screen.getHeightSize(300),
    borderTopWidth: screen.getWidthSize(2),
    borderTopColor: "#eee",
  },
  ziti_box: {
    marginTop: screen.getHeightSize(74),
    marginLeft: screen.getWidthSize(30),
  },
  but_box: {
    flexDirection: "row",
    marginTop: screen.getHeightSize(30),
    marginLeft: screen.getWidthSize(30),
    flexWrap: "wrap",
  },
  anniu2: {
    height: screen.getHeightSize(50),
    width: screen.getWidthSize(140),
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#9e9e9e",
    alignItems: "center",
    justifyContent: "center",
  },
  anniu_ziti: {
    color: "#333",
    fontSize: screen.getWidthSize(28),
  },
  anniu: {
    height: screen.getHeightSize(50),
    width: screen.getWidthSize(140),
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#9e9e9e",
    alignItems: "center",
    justifyContent: "center",
    marginRight: screen.getWidthSize(25),
    marginBottom: screen.getHeightSize(25),
  },
  can: {
    width: screen.getWidthSize(100),
    height: screen.getHeightSize(80),
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontw: {
    fontSize: 15,
    color: "#00b5ce"
  },
  titles: {
    flex: 1,
    height: screen.getHeightSize(80),
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontw2: {
    fontSize: 18,
    color: "#333",
  },
  view_text: {
    fontSize: screen.getWidthSize(24),
    color: "#333",
  },
});
