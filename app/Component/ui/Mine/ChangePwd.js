import React, {
    Component
} from 'react';

import {
    StyleSheet,
    Text,
    View,
    Image,
    TouchableOpacity,
    TextInput,
    Platform,
    Alert,
    AsyncStorage,
} from 'react-native';
import{
    Dialog
} from 'rn-weui';
import Service from '../service';
import Login from '../Login';
import HttpUtil from '../common/HttpUtil';
import Spinner from "react-native-loading-spinner-overlay";
import NavigationBar from "../APPComponent/NavigationBar";
import CommonModal from "../APPComponent/CommonModal";
var Dimensions = require('Dimensions');
var screenW = Dimensions.get('window').width;
var screenH = Dimensions.get('window').height;
export default class ChangePwd extends Component {

    constructor(props) {
        super(props);
        this.state = {
            oldPwd: null,
            newPwd1: null,
            newPwd2: null,
            passWord: null,
            oneAlertFlag: false,
            alertMsg: '-',
        }
    }

    onPressBack = () => {
        const {navigator} = this.props;
        if (navigator) {
            navigator.pop();
        }
    };

    componentDidMount() {
        AsyncStorage.getItem("passWord", (error, text) => {
            this.setState({passWord: text});
        });
        var url = Service.host + Service.pwdConfig+'&tokenID='+Service.tokenID;
        HttpUtil.get(url, this)
            .then((responseData) => {
                this.setState({
                    cdefaultpwd: responseData.cdefaultpwd,
                    ivalidateforever: responseData.ivalidateforever,
                    iincludecharnum: responseData.iincludecharnum,
                    ivalidatedays: responseData.ivalidatedays,
                    iallowchange: responseData.iallowchange,
                    iminlength: responseData.iminlength,
                });
            })
            .catch((error) => {
                console.error(error);
            })
    }

    render() {
        return (
            <View style={{flex: Platform.OS == 'ios' ? 0 : 1, backgroundColor: '#F5F5F5'}}>
                <NavigationBar
                    leftAction={this.onPressBack}
                    leftImage={require('../../../../img/back.png')}
                    title={'密码设置'}/>
                <View style={styles.mainText}>
                    <View style={styles.input_item}>
                        <TextInput
                            style={styles.text_input}
                            placeholder="原密码"
                            placeholderTextColor="#aaaaaa"
                            value={this.state.oldPwd}
                            underlineColorAndroid="transparent" //去掉默认的横线
                            numberOfLines={1}
                            ref={'oldPwd'}
                            multiline={Platform.OS == 'ios' ? false : true}
                            secureTextEntry={true}/*设计输入的文字不可见*/
                            onChangeText={(text) => {
                                this.setState({
                                    oldPwd: text
                                });
                            }}
                        />
                    </View>
                    <View style={styles.input_item}>
                        <TextInput
                            style={styles.text_input}
                            placeholder="新密码"
                            placeholderTextColor="#aaaaaa"
                            value={this.state.newPwd1}
                            underlineColorAndroid="transparent" //去掉默认的横线
                            numberOfLines={1}
                            ref={'newPwd1'}
                            multiline={Platform.OS == 'ios' ? false : true}
                            secureTextEntry={true}/*设计输入的文字不可见*/
                            onChangeText={(text) => {
                                this.setState({
                                    newPwd1: text
                                });
                            }}
                        />
                    </View>
                    <View style={styles.input_item}>
                        <TextInput
                            style={styles.text_input}
                            placeholder="密码确认"
                            placeholderTextColor="#aaaaaa"
                            value={this.state.newPwd2}
                            underlineColorAndroid="transparent" //去掉默认的横线
                            numberOfLines={1}
                            ref={'newPwd2'}
                            multiline={Platform.OS == 'ios' ? false : true}
                            secureTextEntry={true}/*设计输入的文字不可见*/
                            onChangeText={(text) => {
                                this.setState({
                                    newPwd2: text
                                });
                            }}
                        />
                    </View>
                </View>
                <View>
                    <TouchableOpacity onPress={this.changePwd.bind(this)} style={styles.btn_container}>
                        <Text style={{color: 'white', fontSize: 18}}>确认</Text>
                    </TouchableOpacity>
                </View>
                <CommonModal
                    visible={this.state.oneAlertFlag}
                    message={this.state.alertMsg}
                    sureTitle='确定'
                    sureAction={this.hideDialog.bind(this)}
                />
                <Spinner visible={this.state.visible} overlayColor={'rgba(0, 0, 0, 0.2)'}
                         textContent={this.state.tip} textStyle={{color: 'white'}}/>
            </View>
        )
    }

    hideDialog() {
        this.setState({oneAlertFlag: false});
    }

    changePwd() {
        var Pwd1 = this.state.newPwd1 == null ? '' : this.state.newPwd1;
        var Pwd2 = this.state.newPwd2 == null ? '' : this.state.newPwd2;
        var cPwd = this.state.oldPwd == null ? '' : this.state.oldPwd;
        var passWord = this.state.passWord;
        if (cPwd != null && cPwd != '' && cPwd != passWord) {
            this.setState({oneAlertFlag: true, alertMsg: '原密码不正确!'});
            //Alert.alert('提示','原密码不正确!');
            return;
        }
        if (this.state.iAllowChange == 0) {
            this.setState({oneAlertFlag: true, alertMsg: '密码策略中不允许修改密码!'});
            //Alert.alert('提示','密码策略中不允许修改密码!');
            return;
        }
        var reg = /[\u4E00-\u9FA5]/i;//[\u4E00-\u9FA5]/i.test(a)) {;
        if (reg.test(cPwd)) {
            this.setState({oneAlertFlag: true, alertMsg: '原密码请不要输入中文'});
            //Alert.alert('提示','原密码请不要输入中文');
            return;
        }
        if (reg.test(Pwd1)) {
            this.setState({oneAlertFlag: true, alertMsg: '新密码请不要输入中文'});
            //Alert.alert('提示','新密码请不要输入中文');
            return;
        }
        if (reg.test(Pwd2)) {
            this.setState({oneAlertFlag: true, alertMsg: '确认密码请不要输入中文'});
            //Alert.alert('提示','确认密码请不要输入中文');
            return;
        }
        if (cPwd != null && cPwd != '') {

            if (cPwd.length < this.state.iMinLength) {
                this.setState({
                    oneAlertFlag: true,
                    alertMsg: '用户密码不符合密码策略的要求，必须不低于' + this.state.iMinLength + '位，请重新设置!'
                });
                //Alert.alert('提示','用户密码不符合密码策略的要求，必须不低于'+this.state.iMinLength+'位，请重新设置!');
                return;
            }

            if (this.state.iIncludeCharNum == 1) {
                var i = /[a-zA-Z]/.test(cPwd);
                var j = /\d/.test(cPwd);
                if (!i || !j) {
                    this.setState({oneAlertFlag: true, alertMsg: '用户密码不符合密码策略的要求，必须包含字母和数字的组合，请重新设置!'});
                    //Alert.alert('提示','用户密码不符合密码策略的要求，必须包含字母和数字的组合，请重新设置!');
                    return;
                }
            }
        } else {
            if (this.state.iMinLength > 0) {
                this.setState({oneAlertFlag: true, alertMsg: '密码策略不允许输入空密码!'});
                //Alert.alert('提示','密码策略不允许输入空密码!');
                return;
            }
        }
        if (Pwd2 != Pwd1) {
            this.setState({oneAlertFlag: true, alertMsg: '两次输入的密码不一致!'});
            //Alert.alert('提示','两次输入的密码不一致!');
            return;
        }
        this.setState({visible:true,tip:'密码修改中...'});
        var url = Service.host + Service.changePwd + '&oldcPwd=' + cPwd + '&cPWD=' + Pwd1 + '&tokenID=' + Service.tokenID;
        HttpUtil.get(url, this)
            .then((responseData) => {
                if (responseData.errmsg == 'success') {
                    this.setState({oneAlertFlag: true, alertMsg: '密码已修改成功',visible:false});
                    //Alert.alert('提示','密码已修改成功');
                    AsyncStorage.setItem('passWord', '', (error) => {
                    });
                    AsyncStorage.setItem('accountId', '', (error) => {
                    });
                    this.props.navigator.push({
                        name: 'Login',
                        component: Login,
                    });
                } else {
                    this.setState({oneAlertFlag: true, alertMsg: responseData.errmsg,visible:false});
                    //Alert.alert('提示',responseData.errmsg);
                }

            })
            .catch((error) => {
                this.setState({oneAlertFlag: true, alertMsg: '网络请求失败',visible:false});
                //Alert.alert('提示','网络请求失败');
            });
    }

}

const styles = StyleSheet.create({
    mainTexts: {
        fontSize: 18,
    },
    topBar: {
        height: 35,
        backgroundColor: '#50B1F8',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Platform.OS == 'ios' ? 20 : 0,
    },
    topText: {
        color: '#fff',
        fontSize: 18,
        marginLeft: 106,
    },
    backImgStyle: {
        width: 30,
        height: 30,
        marginLeft: 8,
    },
    text_input: {
        fontSize: 15,
        flex: Platform.OS == 'ios' ? 0 : 1,
        textAlign: 'left',
        textAlignVertical: 'bottom',
        marginLeft: 5,
        width: screenW,
    },
    input_item: {
        backgroundColor: 'white',
        height: 48,
        flexDirection: 'row',
        alignItems: 'center',
        margin: 5,
    },
    footBarStyle: {
        width: screenW / 2,
        height: 30,
        marginBottom: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderRightWidth: 0.5,
        borderColor: '#fff',
    },
    footBarTextStyle: {
        color: '#fff',
        fontSize: 18,
    },
    btn_container: {
        flexDirection: 'row',
        height: 48,
        backgroundColor: '#50B1F8',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 5,
        marginRight: 5,
        borderRadius: 6,
        marginBottom: 10,
    }
});
