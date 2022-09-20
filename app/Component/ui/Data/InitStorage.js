/**
 * Created by hu on 2017-6-29.
 */

import {AsyncStorage} from "react-native";
import Service from '../service';
async function readStorage(){
    await AsyncStorage.getItem("ServiceUrl", (error, text) => {Service.ServiceUrl = text});
    await AsyncStorage.getItem("userName", (error, text) => {Service.userName = text});
    await AsyncStorage.getItem("passWord", (error, text) => {Service.passWord = text});
    await AsyncStorage.getItem("accountId", (error, text) => {Service.accountId = text});
    await AsyncStorage.getItem("http", (error, text) => {Service.http = text});
    await AsyncStorage.getItem("ServiceUrl1", (error, text) => {Service.ServiceUrl1 = text});//ip
    await AsyncStorage.getItem("ServiceUrl2", (error, text) => {Service.ServiceUrl2 = text});//端口号
    await AsyncStorage.getItem("ServiceUrl3", (error, text) => {Service.ServiceUrl3 = text});//应用名
    await AsyncStorage.getItem('oldHost1',(error,result)=>{Service.oldHost1 = result;});
    await AsyncStorage.getItem('oldHost2',(error,result)=>{Service.oldHost2 = result;});
    await AsyncStorage.getItem('oldHost3',(error,result)=>{Service.oldHost3 = result;});
    await AsyncStorage.getItem('oldHost4',(error,result)=>{Service.oldHost4 = result;});
    await AsyncStorage.getItem('oldUser1',(error,result)=>{Service.oldUser1 = result;});
    await AsyncStorage.getItem('oldUser2',(error,result)=>{Service.oldUser2 = result;});
    await AsyncStorage.getItem('oldUser3',(error,result)=>{Service.oldUser3 = result;});
    await AsyncStorage.getItem('oldUser4',(error,result)=>{Service.oldUser4 = result;});
    await AsyncStorage.getItem('oldPwd1',(error,result)=>{Service.oldPwd1 = result;});
    await AsyncStorage.getItem('oldPwd2',(error,result)=>{Service.oldPwd2 = result;});
    await AsyncStorage.getItem('oldPwd3',(error,result)=>{Service.oldPwd3 = result;});
    await AsyncStorage.getItem('oldPwd4',(error,result)=>{Service.oldPwd4 = result;});
    await AsyncStorage.getItem('oldAcc1',(error,result)=>{Service.oldAcc1 = result;});
    await AsyncStorage.getItem('oldAcc2',(error,result)=>{Service.oldAcc2 = result;});
    await AsyncStorage.getItem('oldAcc3',(error,result)=>{Service.oldAcc3 = result;});
    await AsyncStorage.getItem('oldAcc4',(error,result)=>{Service.oldAcc4 = result;});
    return true;
}
async function traversalHost(){//遍历旧服务器配置
    console.log('从本地读取的服务器配置信息 ====================================>');
    let url = Service.http + Service.ServiceUrl1 + ':' + Service.ServiceUrl2 + '/' + Service.ServiceUrl3;
    let serviceArr = [Service.oldHost1,Service.oldHost2,Service.oldHost3,Service.oldHost4];
    let userArr = [Service.oldUser1,Service.oldUser2,Service.oldUser3,Service.oldUser4];
    let pwdArr = [Service.oldPwd1,Service.oldPwd2,Service.oldPwd3,Service.oldPwd4];
    let accountArr = [Service.oldAcc1,Service.oldAcc2,Service.oldAcc3,Service.oldAcc4];
    console.log('serviceArr : '+serviceArr);
    console.log('userArr : '+userArr);
    console.log('pwdArr : '+pwdArr);
    console.log('accountArr : '+accountArr);
    for(let i=0;i<serviceArr.length;i++){
        if(serviceArr[i]===url){//服务器地址和旧地址相同，删除旧地址
            console.log('服务器配置相同，删除原服务器的配置 ：' +serviceArr[i]);
            serviceArr.splice(i,1);
            userArr.splice(i,1);
            pwdArr.splice(i,1);
            accountArr.splice(i,1);
        }
    }
    serviceArr.push(url);
    userArr.push(Service.userName);
    pwdArr.push(Service.passWord);
    accountArr.push(Service.accountId);
    console.log('serviceArr : '+serviceArr);
    if(serviceArr.length>4){
        serviceArr.shift();
        userArr.shift();
        pwdArr.shift();
        accountArr.shift();
    }
    console.log('更新后的配置信息:');
    console.log('serviceArr : '+serviceArr);
    console.log('userArr : '+userArr);
    console.log('pwdArr : '+pwdArr);
    console.log('accountArr : '+accountArr);
    for(let i=0;i<serviceArr.length;i++){
        Service['oldHost'+(i+1)] = serviceArr[i];
        await AsyncStorage.setItem('oldHost'+(i+1),serviceArr[i]==null?'':serviceArr[i],()=>{});
        Service['oldUser'+(i+1)] = userArr[i];
        await AsyncStorage.setItem('oldUser'+(i+1),userArr[i]==null?'':userArr[i],()=>{});
        Service['oldPwd'+(i+1)] = pwdArr[i];
        await AsyncStorage.setItem('oldPwd'+(i+1),pwdArr[i]==null?'':pwdArr[i],()=>{});
        Service['oldAcc'+(i+1)] = accountArr[i];
        await AsyncStorage.setItem('oldAcc'+(i+1),accountArr[i]==null?'':accountArr[i],()=>{});
    }
    return true;
}
export default async function initStorage(){
    let init = readStorage();
    init.then(function(value){
        if(value) {
            let save = traversalHost();
            save.then(function(){
                return true;
            })
        }
    });
}