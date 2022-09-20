import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Platform,
} from 'react-native';
export default class MyCell extends Component {
    constructor(props) {
        super(props);
        this.state = {
            leftTitle:'',   // cell左侧标题
            rightTitle:'',
        }
    }
    render() {
        return (
                <View style={styles.container}>
                    <View style={styles.leftViewStyle}>
                        <Text style={styles.leftTitleStyle}>{this.props.leftTitle}</Text>
                    </View>
                    <View style={styles.rightViewStyle}>
                        <Text style={styles.rightTitleStyle}>{this.props.rightTitle}</Text>
                    </View>
                </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor:'white',
        alignItems:'center',
        height:Platform.OS == 'ios' ? 55 : 50,
        borderBottomColor:'#e8e8e8',
        borderBottomWidth:0.5,
    },
    leftViewStyle:{
        flexDirection:'row',
        alignItems:'center',
        marginLeft:8
    },
    leftTitleStyle:{
        fontSize:15,
    },
    rightViewStyle:{
        marginRight:8,
    },
    rightTitleStyle:{
        fontSize:15,
    }
});

