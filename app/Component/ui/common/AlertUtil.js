import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dialog,
    Platform,
} from 'react-native';
export default class AlertUtil extends Component {
    constructor(props) {
        super(props);
        this.state = {
            flag:false,   // 弹窗开关
            function:null,
            msg:'',
        }
    }
    render() {
        return (
                <View>
                    <Dialog
                        visible={this.state.flag}
                        buttons={[
                            {
                                type: 'default',
                                label: '确定',
                                onPress: this.function,
                            }
                        ]}>
                        <Text style={{fontSize:16,marginTop:20}}>{this.state.msg}</Text>
                        </Dialog> 
                </View>
        );
    }
}

const styles = StyleSheet.create({
   
});

