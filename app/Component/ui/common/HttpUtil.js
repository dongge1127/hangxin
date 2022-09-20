import Login from '../Login';
import Service from '../service';
import ToastUtil from "./ToastUtil";
import Util from "../../../Util/Util";

export default class HttpUtil{
    static get(url, _this, time = 120000){
        return new Promise((resolve, reject)=> {
            console.log(`url : ${url}`);
            url = Util.encodeAESUrl(url);
            console.log(`AESUrl : ${url}`);
            fetch(url, time)
                .then(response => response.ok ? response.json() : 'error')
                .then(result => {
                    if(result === 'error'){
                        return;
                    }
                    // AES解密 登录返回的信息  和  数字  不需要解密
                    if (result && url.indexOf('a8_fssc_modules_bill_modules') < 0) {
                        result = Util.decodeAES(result);
                    }
                    console.log("解密后的信息：", result);
                    if (result['pt_err'] === '-1') {
                        reject(result['errmsg']);
                    }
                    let sqlException = 'com.microsoft.sqlserver.jdbc.SQLServerException: 对象名 ';
                    let errormsg = result['errmsg'] == null ? '' : result['errmsg'];
                    if(errormsg === '请先登陆' || errormsg.split("'")[0] === sqlException){
                        console.log(errormsg);
                        let loginUrl = Service.host + Service.login
                            +'&username=' + encodeURIComponent(Service.userName)
                            +'&password=' + encodeURIComponent(Service.passWord == null ? '' : Service.passWord)
                            +'&accountId=' + Service.accountId;
                        // AES加密
                        loginUrl = Util.encodeAESUrl(loginUrl);
                        fetch(loginUrl, time)
                            .then(response => response.ok ? response.json() : 'error')
                            .then(result => {
                                if(result==='error'){
                                    return;
                                }
                                if(result['errorMsg'] === 'success'){
                                    fetch(url, time)
                                        .then(response => response.ok ? response.json() : 'error')
                                        .then(result => {
                                            console.log('请求结果：'+ result);
                                            if(result === 'error'){
                                                return;
                                            }
                                            // AES解密   登录返回信息  和 数字信息 不加密
                                            if (result) {
                                                result = Util.decodeAES(result);
                                            }
                                            console.log(result);
                                            resolve(result);
                                        })
                                        .catch(error => reject(error));
                                }else{
                                    ToastUtil.show(result['errmsg']);
                                    if(_this){
                                        _this.props.navigator.resetTo({
                                            name : 'Login',
                                            component : Login,
                                        });
                                    }
                                }
                            })
                            .catch(error => reject(error));
                    }else{
                        resolve(result);
                    }
                })
				.catch(error => reject(error));
        })
    }
}
