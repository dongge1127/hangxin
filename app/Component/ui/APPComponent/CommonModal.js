/**
 * Created by John on 2017-9-19.
 */
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    ListView,
    Platform,
    ScrollView,
    Image,
    TextInput,
    Linking,
    TouchableWithoutFeedback,
    Keyboard,
    BackAndroid,
    TouchableHighlight,
    } from 'react-native';
import Modal from 'react-native-root-modal';
import ViewUtil from '../common/ViewUtil';
export default class CommonModal extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const {visible,cancelTitle,sureTitle,cancelAction,sureAction, message,} = this.props;
        return (
            <View  style={this.props.style}>
            	{cancelAction?
		        	 <Modal visible={this.props.visible} >
		                <View style={styles.modalContainer}>
		                    <View style={{height:180-45,width: ViewUtil.screenW*0.8,justifyContent: 'center',alignItems: 'center',borderBottomWidth:1,borderColor:'#ccc',}}>
		                        <Text style={{paddingLeft:20,paddingRight:20}}>{this.props.message}</Text>
		                    </View>
		                    <View style={{height:38,flexDirection: 'row',}}>
		                    <TouchableHighlight  style={[styles.button, styles.close]} underlayColor="#aaa" onPress={this.props.cancelAction.bind(this)}>
		                        <Text>{this.props.cancelTitle}</Text>
		                    </TouchableHighlight>
		                    <TouchableHighlight style={[styles.button, styles.close]} underlayColor="#aaa"  onPress={this.props.sureAction.bind(this)}>
		                        <Text style={{color:'#0BB20C'}}>{this.props.sureTitle}</Text>
		                    </TouchableHighlight>
		                </View>
		                </View>
		            </Modal>:
		            <Modal visible={this.props.visible} >
		                <View style={styles.modalContainer}>
		                    <View style={{height:180-45,width: ViewUtil.screenW*0.8,justifyContent: 'center',alignItems: 'center',borderBottomWidth:1,borderColor:'#ccc',}}>
		                        <Text style={{paddingLeft:20,paddingRight:20}}>{this.props.message}</Text>
		                    </View>
		                    <View style={{height:38,flexDirection: 'row',}}>
		                    <TouchableHighlight style={[styles.buttonOnlySure, styles.close]} underlayColor="#aaa"  onPress={this.props.sureAction.bind(this)}>
		                        <Text style={{color:'#0BB20C'}}>{this.props.sureTitle}</Text>
		                    </TouchableHighlight>
		                </View>
		                </View>
		            </Modal>
                }
            </View>
        )
    }
}

const styles = StyleSheet.create({
    //modal
    button: {
        backgroundColor: '#ccc',
        padding: 10,
        width:ViewUtil.screenW*0.8/2,
        alignItems: 'center',
    },
    buttonOnlySure: {
        backgroundColor: '#ccc',
        padding: 10,
        width:ViewUtil.screenW*0.8,
        alignItems: 'center',
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