/**
 * Created by John on 2017-6-28.
 */
import React, {
    Component
    } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Image,
    TouchableOpacity,
    ScrollView,
    TextInput,
	NativeModules,
    Modal,
    BackAndroid,
    Keyboard,
    Platform,
    } from 'react-native';
import {
    Cells,
    Cell,
    CellBody,
    TextArea,
} from 'rn-weui/src';
import Toast from 'react-native-root-toast';
import ImageViewer from 'react-native-image-zoom-viewer';
import CommonStyles from '../../../../style/CommonStyle';
import ApplicationCommonStyles from './ApplicationCommonStyle';
import ViewUtil from '../../common/ViewUtil';
import EmojiUtil from "../../common/EmojiUtil";
import NavigationBar from '../../APPComponent/NavigationBar';
import CommonModal from "../../APPComponent/CommonModal";
var screenW = Dimensions.get('window').width;
var ImagePicker = NativeModules.ImageCropPicker;
let imagesUrlTest = [];
export default class AddFPDetail extends Component {

	constructor(props){
		super(props);
		this.state={
            commonAlert:false,
            commonAlertMsg:'',
            RowData:this.props.passListData,
            RowId:this.props.ID,
            fpguid:'',
            visible:false,   //执行动画
            FPDM:'',         //发票代码
            FPHM:'',         //发票号码
            FPSUM:'',        //发票金额
            BZ:'',           //备注
            FPCOUNT:'',      //发票数量
      		images: null,    //选择照片
            imageView:false,
            imageViewUri:false,
            keyboardHeight:0,
        }
	}
	onPressBack = () => {
        const { navigator } = this.props;
        if (navigator) {
            navigator.pop();
        }
    };
    onBackAndroid=()=>{
        if(this.state.imageView==true){
            this.setState({
                imageView:false,
                /*imageViewUri:image.uri,*/
            });
        }else{
            this.props.navigator.pop();
            return true;
        }

    };
    hideAlertDialog() {
       this.setState({
            commonAlert: false,
        });
    };
    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
        this.setState({
            fpguid: (this.state.RowData == undefined) ? '' : this.state.RowData.fpguid,//发票明细id
            FPDM: (this.state.RowData == undefined) ? '' : this.state.RowData.FPDM,//发票代码
            FPHM: (this.state.RowData == undefined) ? '' : this.state.RowData.FPHM,//发票号码
            FPSUM: (this.state.RowData == undefined) ? '' : this.state.RowData.FPSUM,//发票金额
            BZ: (this.state.RowData == undefined) ? '' : this.state.RowData.BZ,//备注
        })
        console.log(this.state.RowData);
        console.log(this.state.RowId);
    }
    componentDidMount(){
        BackAndroid.addEventListener('hardwareBackPress', this.onBackAndroid);
    };
    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this.onBackAndroid);
        this.keyboardDidHideListener.remove();
    }
    //键盘弹出执行
    _keyboardDidShow(e){
        if(Platform.OS == 'ios'){
            this.setState({
                keyboardHeight:e.startCoordinates.height
            });
        }else{
            this.setState({
                keyboardHeight:270,
            });
        }
    }
    //键盘退出执行
    _keyboardDidHide(e){
        this.refs.FPSUM.blur();
        this.setState({
            keyboardHeight:0
        });
    }
    //备注信息
    handelBZchange(textarea) {
        textarea = EmojiUtil.FilterEmoji(textarea);
        this.setState({ BZ:textarea })
    };
    _onEndEditing(text){
        let num;
        if(isNaN(text)){
            num = new Number('0.00');
        }else{
            num = new Number(text);
        }
        let number=num.toFixed(2);
        this.setState({FPSUM:number});
    }
	render(){
		return(
			<View style={CommonStyles.CommonWrapContainer}>
				<NavigationBar
                    leftAction={this.onPressBack.bind(this)}
                    leftImage={require('../../../../../img/back.png')}
                    title="添加发票明细"
                />
                <View style={{height:ViewUtil.screenH-110,}}>
                    <ScrollView ref='scroll'>
                        <View style={ApplicationCommonStyles.cellContainer}>
                            <View style={ApplicationCommonStyles.leftViewStyle}>
                                <View style={ApplicationCommonStyles.leftTitleView}>
                                    <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>发票号码</Text>
                                </View>
                                <View style={ApplicationCommonStyles.input_item}>
                                    <TextInput
                                        style={ApplicationCommonStyles.text_inputnormal}
                                        multiline={false}
        		                        keyboardType='numeric'
        		                        maxLength={8}
        		                        clearButtonMode = {'always'}
        		                        placeholder={'输入发票号码'}
        		                        password={false}
                                        value={this.state.FPHM}
                                        underlineColorAndroid="transparent"
                                        onChangeText={(text) => {
        		                            this.setState({
        		                                FPHM: text
        		                            })
        		                        }}
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={ApplicationCommonStyles.cellContainer}>
                            <View style={ApplicationCommonStyles.leftViewStyle}>
                                <View style={ApplicationCommonStyles.leftTitleView}>
                                    <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>发票代码</Text>
                                </View>
                                <View style={ApplicationCommonStyles.input_item}>
                                    <TextInput
                                        style={ApplicationCommonStyles.text_inputnormal}
                                        multiline={false}
        		                        keyboardType='numeric'
        		                        maxLength={12}
        		                        clearButtonMode = {'always'}
        		                        placeholder={'输入发票代码'}
        		                        password={false}
                                        value={this.state.FPDM}
                                        underlineColorAndroid="transparent"
                                        onChangeText={(text) => {
        		                            this.setState({
        		                                FPDM: text
        		                            })
        		                        }}
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={ApplicationCommonStyles.cellContainer}>
                            <View style={ApplicationCommonStyles.leftViewStyle}>
                                <View style={ApplicationCommonStyles.leftTitleView}>
                                    <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>发票金额</Text>
                                </View>
                                <View style={ApplicationCommonStyles.input_item}>
                                    <Text style={{color:'#50B1F8',marginTop:Platform.OS == 'ios'?0:-8}}>￥</Text>
                                    <TextInput
                                        style={ApplicationCommonStyles.text_input}
                                        multiline={false}
        		                        keyboardType='numeric'
        		                        maxLength={10}
        		                        clearButtonMode = {'always'}
        		                        placeholder={'发票金额'}
                                        placeholderTextColor="#50B1F8"
        		                        password={false}
                                        ref={'FPSUM'}
                                        value={this.state.FPSUM}
                                        underlineColorAndroid="transparent"
                                        onChangeText={(text) => {
        		                            this.setState({
        		                                FPSUM: text
        		                            })
        		                        }}
                                        onEndEditing = {(event)=>this._onEndEditing(event.nativeEvent.text)}
                                    />
                                </View>
                            </View>
                        </View>
                        <View style={ApplicationCommonStyles.cellContainer}>
                            <View style={ApplicationCommonStyles.leftViewStyle}>
                                <View style={ApplicationCommonStyles.leftTitleView}>
                                    <Text style={[ApplicationCommonStyles.leftTitleStyle,{color:'#b9b8b8',}]}>备注</Text>
                                </View>
                            </View>
                        </View>
                        <View>
                            <Cells>
                                <Cell>
                                    <CellBody style={{marginTop:Platform.OS == 'ios'?0:-20,}}>
                                        <TextArea
                                            style={{fontSize:14,color:'#5c5c5c'}}
                                            placeholder="请输入备注"
                                            placeholderTextColor="#aaaaaa"
                                            value={this.state.BZ}
                                            onChange={this.handelBZchange.bind(this)}
                                            underlineColorAndroid="transparent"
                                            maxLength={400}
                                        />
                                    </CellBody>
                                </Cell>
                            </Cells>
                        </View>
                        <Modal transparent
                               visible={this.state.imageView}
                               onRequestClose={() => this.setState({imageView: false})}>
                            <View style={{
                                    flex:1,
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    alignItems: 'center',
                                    justifyContent: 'center',

                            }}>
                                <ImageViewer imageUrls={imagesUrlTest} style={{width:ViewUtil.screenW , height: 200,}}/>
                            </View>
                        </Modal>
                       <CommonModal
                            visible={this.state.commonAlert}
                            message={this.state.commonAlertMsg}
                            sureTitle='确定'
                            sureAction={this.hideAlertDialog.bind(this)}
                            />
                        <View style={{height:this.state.keyboardHeight,width:ViewUtil.screenW,}}></View>
                </ScrollView>
                </View>
      			<View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                    <TouchableOpacity onPress={()=>this.goOnAdd()} style={ApplicationCommonStyles.detailBtnStyle}>
                        <View style={ApplicationCommonStyles.leftViewStyle}>
                            <Text style={{color:'white',fontSize:16}}>继续添加明细</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={()=>this.saveDetail()} style={ApplicationCommonStyles.detailBtnStyle}>
                        <View style={ApplicationCommonStyles.rightViewStyle}>
                            <Text style={{color:'white',fontSize:16}}>保存</Text>
                        </View>
                    </TouchableOpacity>
                </View>

			</View>
		)
	};
	goOnAdd=()=>{
        //this.setState({visible:true,tip:'保存中...'});
        if(this.state.FPDM=='' || !/^\d{8}$/.test(this.state.FPHM)){
            this.state.commonAlertMsg='发票号码不能为空，且必须为8位数字!';
            this.setState({commonAlert: true,});
            return;
        }
        if(this.state.FPHM=='' || !/^\d{12}$/.test(this.state.FPDM)){
            this.state.commonAlertMsg='发票代码不能为空，且必须为12位数字!';
            this.setState({commonAlert: true,});
            return;
        }
        let map = {};
            map['fpguid']=this.state.fpguid;
            map['FPDM']=this.state.FPDM;
            map['FPHM']=this.state.FPHM;
            map['BZ']=this.state.BZ;
            map['FPCOUNT']=this.state.FPCOUNT;
            map['FPSUM']=this.state.FPSUM;
        let id=this.state.RowId;
        if(this.state.RowId==undefined){
            this.props.getFPListData(map);
        }else{
            this.props.refreshFPListData(map,id);
        }
        Toast.show('明细信息已保存', {
                    duration: Toast.durations.SHORT,
                    position: ViewUtil.screenH/2,
                    shadow: true,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    animation: true,
                    hideOnPress: true,
                    delay: 0,
                });
        this.setState({
            fpguid:'',
            FPDM:'',
            FPHM:'',
            FPSUM:'',
            BZ:'',
        });
    };
    saveDetail=()=>{
        //this.setState({visible:true,tip:'保存中...'});
        if(this.state.FPHM=='' || !/^\d{8}$/.test(this.state.FPHM)){
            this.state.commonAlertMsg='发票号码不能为空，且必须为8位数字!';
            this.setState({commonAlert: true,});
            return;
        }
        if(this.state.FPDM=='' || !/^\d{12}$/.test(this.state.FPDM)){
            this.state.commonAlertMsg='发票代码不能为空，且必须为12位数字!';
            this.setState({commonAlert: true,});
            return;
        }
        let map = {};
            map['fpguid']=this.state.fpguid;
            map['FPDM']=this.state.FPDM;
            map['FPHM']=this.state.FPHM;
            map['BZ']=this.state.BZ;
            map['FPCOUNT']=this.state.FPCOUNT;
            map['FPSUM']=this.state.FPSUM;
        console.log('==============================');
        let id=this.state.RowId;
        if(this.state.RowId==undefined){
            this.props.getFPListData(map);
        }else{
            this.props.refreshFPListData(map,id);
        }
        this.props.navigator.pop();
    };

}


const styles = StyleSheet.create({
    FPContainer:{
    	// alignItems: 'center',
        // flexDirection: 'row',
        flexDirection:'row',
        flexWrap:'wrap',
        alignItems:'flex-start',
    },
     ModalContainer:{
        width: window.width * 0.7, height: 300,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent:'center',
        borderRadius: 8,
        marginLeft:30,
        marginRight:30,
    },
    ModalContent:{
        justifyContent: 'center',
        alignItems:'center',
        height: 100,
        width: screenW,
        paddingLeft:40,
        paddingRight:40,
        borderBottomWidth:0.5,
        borderColor:'#ccc',
    },
    ModalButtonContainer:{
        backgroundColor: 'white',
        height: 40,
        width: screenW,
        alignItems: 'center',
        justifyContent:'center',
    }
});
