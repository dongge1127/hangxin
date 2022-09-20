
import React, { Component } from 'react';
import {
    Navigator,
} from 'react-native';
import ReportIndex from './ReportIndex'
var Dimensions = require('Dimensions');
var screenW = Dimensions.get('window').width;
var {width}=Dimensions.get('window');
/*定义一些全局的变量*/
var cols=2;
var boxW=screenW/2;
var vMargin=(width-cols*boxW)/(cols+1);
export default class ReportNav extends Component {
    render() {
        return (
            <Navigator
                initialRoute={{ name: 'ReportIndex', component: ReportIndex }}
                configureScene={(route) => Navigator.SceneConfigs.PushFromRight}
                renderScene={(route, navigator) =>{
                    let Component = route.component;
                    return <Component {...route.params} navigator={navigator} />
                }
            }/>
        );}
}
