/**
 * Created by John on 2017-2-14.
 */
import React, {
    Component
    } from 'react';

import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    AsyncStorage,
    Platform,
    } from 'react-native';


export default class CatchError extends Component {

    constructor(props){
        super(props);
    }
    onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    };
    render(){
        return(
            <View style={{flex: Platform.OS == 'ios' ? 0 : 1,backgroundColor: '#F5F5F5',marginTop:Platform.OS == 'ios' ? 20 : 0,}}>
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={this.onPressBack}>
                        <Image source={require('../../../img/back.png')} style={styles.backImgStyle} />
                    </TouchableOpacity>
                    <Text style={styles.topText} onPress={this.onPressText}>未能连接到互联网</Text>
                </View>
                <View style={styles.mainText}>
                    <Text style={styles.titleText}>您的设备未启用移动网络或WI-FI网络</Text>
                    <Text style={styles.msgTitleText}>如需要连接到互联网，可以参照以下方法：</Text>
                    <Text style={styles.msgText}>在设备的“设置”-“WI-FI网络”设置面板中选择一个可用的WI-FI热点接入。</Text>
                    <Text style={styles.msgText}>在设备的“设置”-“移动网络”-“启用数据网络”(启用后运营商可能会收取数据通信费用)。</Text>
                    <Text style={styles.msgTitleText}>如需您已接入WI-FI网络：</Text>
                    <Text style={styles.msgText}>请检查您所连接的WI-FI热点是否已接入互联网，或该热点是否允许您的设备访问互联网</Text>
                </View>

            </View>
        )
    };

}

const styles = StyleSheet.create({
    mainTexts:{
        fontSize:18,
    },
    topBar:{

        height:50,
        backgroundColor:'#50B1F8',
        flexDirection: 'row',
        alignItems: 'center',
    },
    topText:{
        color:'#fff',
        fontSize:18,
        marginLeft:86,
    },
    backImgStyle:{
        width:30,
        height:30,
        marginLeft:8,
    },
    titleText:{
        fontSize:20,
        marginLeft:5,
        marginTop:10,
        marginBottom:10,
    },
    msgTitleText:{
        fontSize:16,
        marginLeft:5,
        marginTop:5,
        marginBottom:5,
    },
    msgText:{
        fontSize:16,
        marginLeft:5,
    },
});