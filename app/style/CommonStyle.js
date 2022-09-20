/**
 * Created by John on 2016-11-21.
 */
var React   = require('react-native');
// 导入系统类
import {
    StyleSheet,
    PixelRatio,
    Platform,
} from 'react-native';
import ViewUtil from '../Component/ui/common/ViewUtil';

const CommonStyles = StyleSheet.create({
    /*每个页面最外层容器样式*/
    CommonWrapContainer:{
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    /*头部标题*/
    CommonTopBarContainer:{
        height:Platform.OS == 'ios'?55:35,
        paddingTop: Platform.OS == 'ios' ? 20 : 0,
        backgroundColor:'#50B1F8',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'space-between',
    },
    CommonTopBarText:{
        color:'#fff',
        fontSize:16,
    },
    CommonTopBarImgStyle:{
        width:30,
        height:30,
        marginLeft:8,
    },
    /*搜索框样式*/
    CommonInputItem:{
        backgroundColor:'#fff',
        height:46,
        flexDirection:'row',
        marginTop:5,
        marginBottom:5,
        marginLeft:5,
        marginRight:5,
		alignItems:'center',
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
    },
    CommonSearchImg:{
        width:20,
        height:20,
        marginRight:10,
        marginLeft:13,
    },
    /*列表样式*/
    CommonListViewContainer:{
        flexDirection:'row',
        borderBottomWidth:1,
        borderColor:'rgba(100,53,201,0.1)',
        paddingBottom:6,
        paddingTop:6,
        paddingLeft:6,
        backgroundColor:'#fff',
        borderWidth:1,
        borderRadius:5,
        marginLeft:5,
        marginRight:5,
        marginTop:5,
    },
    CommonListViewTitleStyle:{
        fontSize:13,
        color:'#50B1F8'
    },
    CommonListViewListTextStyle:{
        fontSize:13,
        color:"#999",
    },
    //加载中容器
    CommonLoadContainer:{
        height:ViewUtil.screenH-130,
        width:ViewUtil.screenW,
        backgroundColor: '#F5F5F5',
    },
    //审批流程日志样式
    btnContainerStyle:{
        flexDirection:'row',
        height:Platform.OS == 'ios' ? 50 : 40,
        backgroundColor:'#50B1F8',
    },
    footBarStyle:{
        width:ViewUtil.screenW/2,
        height:Platform.OS == 'ios' ? 50 : 40,
        justifyContent:'center',
        alignItems:'center',
        borderRightWidth:0.5,
        borderColor:'#fff',
    },
    footBarTextStyle:{
        color:'#fff',
        fontSize:18,
    },
    noFlowBtnStyle:{
        height:40,
        backgroundColor:'#50B1F8',
        justifyContent:'center',
        alignItems:'center',
        width:ViewUtil.screenW,
        paddingTop:-20,
    },
    viewBtnBoxStyle:{
        position:'absolute',
        left:1,
        bottom:40,
        width:ViewUtil.screenW/3.2+2,
        borderColor:'#ccc',
        marginLeft:30,
    },
    viewBtnStyle:{
        width:ViewUtil.screenW/3.2,
        height:40,
        backgroundColor:'#fff',
        justifyContent:'center',
        alignItems:'center',
    },
    viewBtnViewStyle:{
        borderBottomWidth:1,
        borderColor:'#ccc',
        width:ViewUtil.screenW/3,
        height:40,
        justifyContent:'center',
        alignItems:'center',
    },
    viewBtnTextStyle:{
        fontSize:18,
        color:'#50B1F8',
    },
    text: {
        padding: 10,
        fontSize: 14,
    },
    dialogHeader:{
        paddingTop:5,
    },
    fileBtn:{
        width:60,
        height:26,
        backgroundColor:'#50B1F8',
        alignItems:'center',
        justifyContent:'center',
        borderRadius:3,
        marginTop:10,
        marginLeft:10,
    },
    //modal面板
    button: {
        backgroundColor: '#ccc',
        padding: 10,
        width:ViewUtil.screenW*0.8/2,
        alignItems: 'center',
        borderTopWidth:0.5,
        borderColor:'#ccc',
    },
    close: {
        backgroundColor: '#fff'
    },
    sure:{
        backgroundColor: '#0BB20C'
    },
    modalContainer: {
        height: 180,
        width: ViewUtil.screenW*0.8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderColor:'#000',
        borderRadius: 5,
    },
    text: {
        color: '#ccc'
    },

});

module.exports = CommonStyles;