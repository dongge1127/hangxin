/**
 * Created by John on 2017-8-28.
 */
import React, {
    Component
    } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    Platform,
    ScrollView,
} from 'react-native';
import Spinner from "react-native-loading-spinner-overlay";
import CommonStyles from '../../../../style/CommonStyle';
import ApplicationCommonStyles from './ApplicationCommonStyle';
import NavigationBar from '../../APPComponent/NavigationBar';
export default class CheckBXDetail extends Component {
    constructor(props){
        super(props);
        this.state={
            RowData:this.props.passListData,
        };
        //console.log('00000000000000');
        //console.log(this.state.RowData);
    };
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    };
    render(){
        return(
            <View style={CommonStyles.CommonWrapContainer}>
                <NavigationBar
                    leftAction={this.onPressBack.bind(this)}
                    leftImage={require('../../../../../img/back.png')}
                    title="报销明细详情" 
                />
                <ScrollView>
                    <View style={[ApplicationCommonStyles.cellContainer]}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={ApplicationCommonStyles.leftTitleStyle}>费用类别</Text>
                            </View>
                            <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.RowData.FYTYPE}</Text>
                        </View>
                    </View> 
                    <View style={[ApplicationCommonStyles.cellContainer]}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={ApplicationCommonStyles.leftTitleStyle}>报销金额</Text>
                            </View>
                            <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.RowData.BXMoney}</Text>
                        </View>
                    </View>
                    <View style={[ApplicationCommonStyles.cellContainer]}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={ApplicationCommonStyles.leftTitleStyle}>日期</Text>
                            </View>
                            <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.RowData.startTime}  ~  {this.state.RowData.endTime}</Text>
                        </View>
                    </View>
                    <View style={[ApplicationCommonStyles.cellContainer]}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={ApplicationCommonStyles.leftTitleStyle}>天数</Text>
                            </View>
                            <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.RowData.SUMDAY}</Text>
                        </View>
                    </View>
                    <View style={[ApplicationCommonStyles.cellContainer]}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={ApplicationCommonStyles.leftTitleStyle}>始发地</Text>
                            </View>
                            <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.RowData.STARTPLACE}</Text>
                        </View>
                    </View>
                    <View style={[ApplicationCommonStyles.cellContainer]}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={ApplicationCommonStyles.leftTitleStyle}>目的地</Text>
                            </View>
                            <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.RowData.ENDPLACE}</Text>
                        </View>
                    </View>
                    <View style={[ApplicationCommonStyles.cellContainer]}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={ApplicationCommonStyles.leftTitleStyle}>备注</Text>
                            </View>
                            <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.RowData.BZ}</Text>
                        </View>
                    </View>
                </ScrollView>
            </View>
        )
    };
    
}

const styles = StyleSheet.create({

});