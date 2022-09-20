import {Base64} from 'js-base64'
import UtilFun from "../Component/ui/common/UtilFun";
import CryptoJS from '../Util/aes';
import Service from "../Component/ui/service";

/**
 * Created by John on 2017-6-29.
 */
const options={
    mode: CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7
}
const AES_KEY = "abcdefgabcdefg12";
let Util = {

    /*
     * 功能：删除数组中的某一个元素
     * 参数：arr - 数组
     *      index - 需要被删除的元素序号，从0开始
     * 返回：删除元素后的数组
     */
    ArrRemoveAt(arr, index) {
        console.log(arr);
        let ArrTmp = [];
        let Tmp = null;
        let len = arr.length;
        for (let i = 0; i < len; i++) {
            Tmp = arr.pop();
            if (i != len - index - 1) {
                ArrTmp.push(Tmp);
            } else {
                break;
            }
        }
        ArrTmp = ArrTmp.reverse();
        for (let i in ArrTmp) {
            arr.push(ArrTmp[i]);
        }
        return arr;
    },

    /*
     * 功能：删除数组中的某一个元素
     * 参数：arr - 数组
     *      item - 需要被删除的元素
     * 返回：删除元素后的数组
     */
    ArrRemoveItem(arr, item) {
        let ArrTmp = [];
        let Tmp = null;
        let len = arr.length;
        for (let i = 0; i < len; i++) {
            Tmp = arr.pop();
            if (Tmp != item) {
                ArrTmp.push(Tmp);
            } else {
                break;
            }
        }
        ArrTmp = ArrTmp.reverse();
        for (let i in ArrTmp) {
            arr.push(ArrTmp[i]);
        }
        return arr;
    },
    /**
     * 格式化Base64Url
     * @param url
     */
    encodeBase64Url(url) {
        if (url && url.indexOf("&") > -1) {
            let urlArr = url.split('&');
            let data = {};
            urlArr.forEach((item, index) => {
                if (index !== 0) {
                    let kv = item.split("=");
                    data[kv[0]] = kv[1];
                }
            })
            console.log(data);
            return urlArr[0] + '&data=' + Base64.encode(JSON.stringify(data));
        }
        return url;
    },

    /**
     * 格式化AES加密URL
     * @param url
     */
    encodeAESUrl(url) {
        if (url.indexOf('a8_fssc_modules_bill_modules') > -1) {
            return url;
        }
        if (url && url.indexOf("&") > -1) {
            let index = url.indexOf('&');
            let str1 = url.substring(0, index);
            let str2 = url.substring(index + 1, url.length);
            str2 = str2.replace(/=/g, ":");
            str2 = str2.replace(/&/g, ",");
            str2 = UtilFun.objUser(str2);
            str2 = JSON.stringify(str2);
            let srcs = CryptoJS.enc.Utf8.parse(str2);
            let key = CryptoJS.enc.Utf8.parse(AES_KEY);
            str2 = CryptoJS.AES.encrypt(srcs, key, options).toString();
            str2 = encodeURIComponent(str2);
            url = str1 + '&pt_json_data=' + str2 + '&tokenID=' + Service.tokenID;
        }
        return url;
    },
    /**
     * AES解密
     * @param data
     */
    decodeAES(data) {
        let key = CryptoJS.enc.Utf8.parse(AES_KEY);
        let decrypt = CryptoJS.AES.decrypt(data, key, options);
        let result = CryptoJS.enc.Utf8.stringify(decrypt).toString();
        try {
            return JSON.parse(result);
        } catch (e) {
            return result;
        }
    }
}

export default Util;
