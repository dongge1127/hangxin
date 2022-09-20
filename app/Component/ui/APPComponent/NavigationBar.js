/**
 * 顶部组件
 */
import React, {Component} from 'react';
import {
    Text,
    View,
    Platform,
    TouchableOpacity,
    StyleSheet, Image
} from 'react-native';
import CommonStyles from '../../../style/CommonStyle';
export default class NavigationBar extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        // leftTitle和leftImage 优先判断leftTitle (即 文本按钮和图片按钮优先显示文本按钮)
        const {title, leftTitle, leftImage, leftAction, rightTitle, rightImage, rightAction} = this.props;
        return (
            <View  style={this.props.style}>
                <View style={ styles.navBar }>
                    {
                        leftTitle
                            ?
                            <TouchableOpacity style={styles.left} onPress={ () => {
                                leftAction()
                            } }>
                                <View style={{alignItems: 'center'}}>
                                    <Text style={styles.button}>{leftTitle}</Text>
                                </View>
                            </TouchableOpacity>
                            :
                            (
                                leftImage
                                    ?
                                    <TouchableOpacity style={styles.left} onPress={ () => {
                                        leftAction()
                                    } }>
                                        <View style={{alignItems: 'center'}}>
                                            <Image source={leftImage} style={CommonStyles.CommonTopBarImgStyle} />
                                        </View>
                                    </TouchableOpacity>
                                    : null
                            )
                    }
                    {
                        title ?
                            <Text style={styles.title}>{title || ''}</Text>
                            : null
                    }
                    {
                        rightTitle ?
                            <TouchableOpacity style={styles.right} onPress={ () => {
                                rightAction()
                            } }>
                                <View style={{alignItems: 'center'}}>
                                    <Text style={styles.button}>{rightTitle}</Text>
                                </View>
                            </TouchableOpacity>
                            : (rightImage ?
                                <TouchableOpacity style={styles.right} onPress={ () => {
                                    rightAction()
                                } }>
                                    <View style={{alignItems: 'center'}}>
                                        <Image source={rightImage} style={CommonStyles.CommonTopBarImgStyle} />
                                    </View>
                                </TouchableOpacity>
                                : null
                        )
                    }
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    navBar: {
        height:Platform.OS == 'ios'?55:35,
        paddingTop: Platform.OS == 'ios' ? 20 : 0,
        backgroundColor:'#50B1F8',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        color: 'white',
        fontSize: 16,
    },
    left: {
        position: 'absolute',
        marginTop:Platform.OS=='ios'?20:0,
        top: 0,
        left: 0,
        bottom: 0,
        justifyContent: 'center',
        marginLeft:8,
    },
    right: {
        position: 'absolute',
        marginTop:Platform.OS=='ios'?20:0,
        top:  0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        paddingHorizontal: 15,
    },
    button: {
        color: 'white',
        fontSize: 15,
    },
});