/**
 * Created by John on 2017-8-7.
 */
var React   = require('react-native');
// 导入系统类
import {
    StyleSheet,
    PixelRatio,
    Platform,
} from 'react-native';
import ViewUtil from '../../common/ViewUtil';
const ApplicationCommonStyles = StyleSheet.create({
    /*单据每行cell渲染的样式*/
    cellContainer: {
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor:'#fff',
        alignItems:'center',
        borderBottomColor:'#e8e8e8',
        borderBottomWidth:0.5,
        paddingLeft:8,
        height:45,
    },
    cellyyContainer:{
        flexDirection:'row',
        justifyContent:'space-between',
        backgroundColor:'#fff',
        alignItems:'center',
        borderBottomColor:'#e8e8e8',
        borderBottomWidth:0.5,
        paddingLeft:8,
        paddingTop:10,
        paddingBottom:10,
    },
    leftViewStyle:{
        flexDirection:'row',
        alignItems:'center',
        marginLeft:8,
    },
    leftTitleView:{
        flexDirection:'row',
        minWidth:70,
    },
    leftTitleStyle:{
        fontSize:14,
        color:'#5c5c5c',
        flexDirection:'row',
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
    cellViewContainer: {
        flexDirection:'row',
        backgroundColor:'white',
        alignItems:'center',
        borderBottomColor:'#e8e8e8',
        borderBottomWidth:0.5,
        paddingLeft:8,
        paddingTop:10,
        paddingBottom:10,
    },
    /*cell中所含输入框的样式*/
    input_item:{
        backgroundColor:'white',
        height:35,
        flexDirection:'row',
        alignItems:'center',
        paddingLeft:10,
        marginRight:8,
    },
    text_input:{
        fontSize: 14,
        width:ViewUtil.screenW*0.7,
        textAlign: 'left',
        textAlignVertical:'bottom',
        color:'#50B1F8',
    },
    text_inputnormal:{
        fontSize: 13,
        width:ViewUtil.screenW*0.7,
        textAlign: 'left',
        textAlignVertical:'bottom',
        color:'#5c5c5c',
    },
    /*modal弹出层样式设计*/
    modalContent: {
        backgroundColor: 'white',
        padding: 22,
        height:250,
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    //弹出层搜索框公共样式
    CommonInputItem:{
        backgroundColor:'#fff',
        height:46,
        flexDirection:'row',
        marginTop:5,
        marginBottom:5,
        marginLeft:5,
        marginRight:5,
        alignItems:'center',
        borderWidth:1,
        borderColor:'#50B1F8',
        borderRadius:5,
    },
    CommonTextInput:{
        fontSize:12,
        flex:1,
        textAlign: 'left',
        textAlignVertical:'bottom',
        marginLeft:5,
        marginTop:6,
    },
    CommonSearchImgContainer:{
        backgroundColor:'#50B1F8',
        width:46,
        height:46, 
        alignSelf:'center',
        justifyContent:'center',
        borderTopRightRadius:5,
        borderBottomRightRadius:5,
    },
    CommonSearchImg:{
        width:20,
        height:20,
        marginRight:10,
        marginLeft:13,
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
    btnGrycontainer:{
        flexDirection:'row',
        width:100,
        height:35,
        backgroundColor:'#ccc',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:6,
        marginRight:8,
    },
    /*继续添加明细 保存*/
    detailBtnStyle:{
        flexDirection:'row',
        width:(ViewUtil.screenW-70)/2,
        marginLeft:10,
        marginRight:10,
        height:35,
        backgroundColor:'#50B1F8',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:6,
    }

});

module.exports = ApplicationCommonStyles;