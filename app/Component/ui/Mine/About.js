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
import MyCell from './MineCell';
import CommonStyles from '../../../style/CommonStyle';
import Service from '../service';
import NavigationBar from "../APPComponent/NavigationBar";
export default class About extends Component {

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
            <View style={CommonStyles.CommonWrapContainer}>
                <NavigationBar
                    leftAction={this.onPressBack}
                    leftImage={require('../../../../img/back.png')}
                    title={'关于我们'}/>
                <View>
                    {/*<Image source = {require('../../../../img/a8logo.png')} style={styles.logoImg}/>*/}
                </View>
                <MyCell
                    leftTitle="公司网址"
                    rightTitle=''
                />
                <MyCell
                    leftTitle="客服电话"
                    rightTitle=''
                />
                <MyCell
                    leftTitle="微信公众号"
                    rightTitle=''
                />
            </View>
        )
    };

}

const styles = StyleSheet.create({
    logoImg:{
        height:80,
        width:80,
        marginTop:20,
        marginBottom:10,
        alignSelf:'center',
        borderRadius:6,
    },
    banben:{
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent:'center',
        marginBottom:10,
    },
    mainTexts:{
        fontSize:18,
    },
    mineCellContainer: {
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
        justifyContent: 'center',
    },
});
