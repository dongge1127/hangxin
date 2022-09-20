/**
 * Created by hu on 2017-9-4.
 */

import Toast from 'react-native-root-toast';
import {Dimensions} from 'react-native';

export default class ToastUtil{
    static show(msg){
        Toast.show(msg, {
            duration: Toast.durations.SHORT,
            position: Dimensions.get('window').height-130,
            shadow: true,
            backgroundColor: 'rgba(0,0,0,0.7)',
            animation: true,
            hideOnPress: true,
            delay: 0,
        });
    }
}