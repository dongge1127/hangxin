/**
 * Created by John on 2016-11-21.
 */
var React   = require('react-native');
// 导入系统类
import {
    StyleSheet,
    PixelRatio,
    Dimensions,
    Platform,
} from 'react-native';
var screenW = Dimensions.get('window').width;
var screenH = Dimensions.get('window').height;
var cell_w = Dimensions.get('window').width;
const styles = StyleSheet.create({
    style_barcode:{
        height:30,
        width:30,
        marginTop:10,
        alignSelf:'center',
        justifyContent:'center',
    },
    image_container:{
        flexDirection:'row',
        height:180,
        justifyContent:'center',
        backgroundColor:'#50B1F8',
    },
    style_image:{
        height:70,
        width:110,
        alignSelf:'center',
    },
    input_item:{
        backgroundColor:'white',
        height:48,
        width:screenW*0.95,
        flexDirection:'row',
        alignItems:'center',
        paddingLeft:10,

    },

    text_input:{
        fontSize: 15,
        width:screenW*0.85-38,
        textAlign: 'left',
        textAlignVertical:'bottom',
        paddingLeft:10,
    },
    text:{
        marginLeft:5,
        height:40,
        width:300,
        justifyContent:'center',
    },
    btn_container:{
        flexDirection:'row',
        width:screenW*0.92,
        height:42,
        backgroundColor:'#50B1F8',
        alignItems:'center',
        justifyContent:'center',
        marginLeft:(screenW-screenW*0.92)/2,
        marginTop:20,
        borderRadius:6,
    },
    testProduct:{
        width:screenW,
        height:30,
        marginTop:10,
        alignItems:'center',
        justifyContent:'center',
    },
    reductText:{
        width:screenW,
        marginTop:screenH-435,
        height:30,
        alignItems:'center',
        justifyContent:'center',
    }
});

module.exports = styles;
