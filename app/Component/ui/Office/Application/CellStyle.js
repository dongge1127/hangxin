/**
 * Created by John on 2017-6-27.
 */
import React, {
    Component
} from 'react';
import {
    StyleSheet,
    Platform,
} from 'react-native';
import ViewUtil from '../../common/ViewUtil';
const CellStyles = StyleSheet.create({
    /*cell的样式*/
    cellContainer: {
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor:'white',
        alignItems:'center',
        height:50,
        borderBottomColor:'#e8e8e8',
        borderBottomWidth:0.5,
    },
    leftViewStyle:{
        flexDirection:'row',
        alignItems:'center',
        marginLeft:8,
    },
    leftTitleView:{},
    leftTitleStyle:{
        fontSize:13,
        marginLeft:5,
    },
    rightViewStyle:{
        flexDirection:'row',
        alignItems:'center',
        marginRight:8,
    },
    rightTitleStyle:{
        fontSize:13,
        color:"#50B1F8",
    },
    /*modal样式设计*/
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        height:250,
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    /*输入框的样式*/
    input_item:{
        backgroundColor:'white',
        height:48,
        flexDirection:'row',
        alignItems:'center',
        paddingLeft:10,
        marginRight:8,
        paddingTop:10,
    },
    text_input:{
        fontSize: 13,
        width:ViewUtil.screenW*0.7,
        textAlign: 'left',
        textAlignVertical:'bottom',
        paddingLeft:10,
    },
    /*提交送审*/
    btn_container:{
        flexDirection:'row',
        width:100,
        height:35,
        backgroundColor:'#50B1F8',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:6,
        marginRight:8
    },
    /*继续添加明细 保存*/
    detailBtnStyle:{
        flexDirection:'row',
        width:(ViewUtil.screenW-32)/2,
        marginLeft:8,
        marginRight:8,
        height:35,
        backgroundColor:'#50B1F8',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:6,
    }
});
module.exports = CellStyles;