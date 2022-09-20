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
export default class CheckFPDetail extends Component {
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
                    title="发票明细详情" 
                />
                <ScrollView>
                    <View style={[ApplicationCommonStyles.cellContainer]}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={ApplicationCommonStyles.leftTitleStyle}>发票号码</Text>
                            </View>
                            <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.RowData.FPHM}</Text>
                        </View>
                    </View> 
                    <View style={[ApplicationCommonStyles.cellContainer]}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={ApplicationCommonStyles.leftTitleStyle}>发票代码</Text>
                            </View>
                            <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15}]}>{this.state.RowData.FPDM}</Text>
                        </View>
                    </View>
                    <View style={[ApplicationCommonStyles.cellContainer]}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={ApplicationCommonStyles.leftTitleStyle}>发票金额</Text>
                            </View>
                            <Text style={[ApplicationCommonStyles.leftTitleStyle,{marginLeft:15,}]}>{this.state.RowData.FPSUM}</Text>
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
                    <View style={[ApplicationCommonStyles.cellContainer]}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <View style={ApplicationCommonStyles.leftTitleView}>
                                <Text style={ApplicationCommonStyles.leftTitleStyle}>发票</Text>
                            </View>
                        </View>
                    </View>                
                </ScrollView>
            </View>
        )
    };
    
}

const styles = StyleSheet.create({

});