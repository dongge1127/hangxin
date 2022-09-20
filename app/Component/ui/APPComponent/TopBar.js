import React, { Component } from 'react';
import CommonStyles from '../../../style/CommonStyle';
import {
    Text,
    View,
    TouchableOpacity,
    Image,
} from 'react-native';
export default class TopBar extends Component {

    render(){
        return(
                <View style={CommonStyles.CommonTopBarContainer}>
                    <TouchableOpacity onPress={this.props.onPress}>
                        <Image source={require('../../../../img/back.png')} style={CommonStyles.CommonTopBarImgStyle} />
                    </TouchableOpacity>
                    <Text style={CommonStyles.CommonTopBarText}>{this.props.title}</Text>
                    <View style={{height:30,width:38}}></View>
                </View>)
    }
}