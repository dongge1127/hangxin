import {Dimensions, Platform} from 'react-native';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

/**
 * 获取屏幕宽度和高度
 * @auth liuMi
 * @date 2020年6月30日
 */
export default class GetScreenSize{

  static getWidthSize(num){

    return num / 750 * WIDTH;
  }

  static getHeightSize(num) {
    let v;
    if (Platform.OS === 'ios') {
      v = num / 1334 * (HEIGHT);
    } else {
      v =( num * HEIGHT)/ 1334 ;
    }
    return  Math.round(v);
  }
}
