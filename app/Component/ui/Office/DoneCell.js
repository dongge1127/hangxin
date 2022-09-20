import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    Platform,
    } from 'react-native';
export default class DoneCell extends Component {
    constructor(props) {
        super(props);
        this.state = {
            leftIconName:'',    // cell左侧图标
            leftTitle:'',       // cell左侧标题
        }
    }
    render() {
        return (
            <TouchableOpacity onPress={()=>{alert('点击了')}}>
                <View style={styles.container}>
                    <View style={styles.leftViewStyle}>
                        <Image source={{uri:this.props.leftIconName}} style={styles.leftImgStyle} />
                        <Text style={styles.leftTitleStyle}>{this.props.leftTitle}</Text>
                    </View>
                    <View style={styles.rightViewStyle}>
                        <Image source={{uri:'rarrow'}} style={{width:8, height:13, marginRight:8, marginLeft:5}} />
                    </View>
                </View>
            </TouchableOpacity>
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

    rightViewStyle:{

    },
    leftImgStyle:{
        width:30,
        height:30,
        marginRight:8,
        borderRadius:15
    },

    leftTitleStyle:{
        fontSize:16
    }
});

