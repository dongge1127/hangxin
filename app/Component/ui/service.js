/**
 * Created by John on 2016-12-7.
 */
var Service = {
    host:'',
    dbmodules:'a8_mobile_daiban_modules',
    dbList:'a8_mobile_daiban_list',
    dbDetail:'a8_mobile_daiban_browse',
    ybmodules:'a8_mobile_yiban_modules',
    ybList:'a8_mobile_yiban_list',
    ybDetail:'a8_mobile_yiban_browse',
    account:'mobile_service_getAcct',
    getuserinfo: 'a8_mobile_service_app_login',
    login: 'mobile_service_app_login',
    dbSubmit:'a8_mobile_daiban_submit',
    getmatstock:'mobile_service_getmatstock',
    matstockdetail:'mobile_service_matstockdetail',
    noticeList:'mobile_service_loadNoticeList',
    noticeDetail:'mobile_service_notice_detail',
    flowJournal:'a8_mobile_common_funcbtn',
    crmList:'mobile_service_customerlist',
    userMsg:'a8_mobile_service_user_msg',
    tabApplication:'mobile_list_expenseAccount',
    changePwd:'a8_mobile_service_changePwd',
    reportChart:'mobile_report_remain_total_form',
    reportGrid:'mobile_report_remain_detail_form',
    reportHappenChart:'mobile_report_happen_total_form',
    reportHappenGrid:'mobile_report_happen_detail_form',
    reportIndex:'mobile_report_home_form',
    reportCustomGetChart:'mobile_report_customGet_total_form',
    reportCustomGetGrid:'mobile_report_customGet_detail_form',
    reportMaterialMaoliChart:'mobile_report_materialMaoli_total_form',
    reportMaterialMaoliGrid:'mobile_report_materialMaoli_detail_form',
    pwdConfig:'a8_mobile_service_pwd_config',
    logout:'a8_mobile_service_app_logout',
    appVersion:'mobile_service_system_version',
    jPushRelationId:'a8_mobile_service_jpush_relation',
    getReleaseVersion:'mobile_service_release_version',
    yzm:'mobile_service_sms',
    phoneData:'mobile_service_phone_data',
    userGuid:'',
    sys:'',
    accountId:'',
    tokenID: '',
    oldHost1:'',//旧服务器地址1
    oldHost2:'',//旧服务器地址2
    oldHost3:'',//旧服务器地址3
    oldHost4:'',//旧服务器地址4
    oldUser1:'',//旧的用户名1
    oldUser2:'',//旧的用户名2
    oldUser3:'',//旧的用户名3
    oldUser4:'',//旧的用户名4
    oldPwd1:'',//旧的密码1
    oldPwd2:'',//旧的密码2
    oldPwd3:'',//旧的密码3
    oldPwd4:'',//旧的密码4
    oldAcc1:'',//旧的账套配置1
    oldAcc2:'',//旧的账套配置2
    oldAcc3:'',//旧的账套配置3
    oldAcc4:'',//旧的账套配置4
    nowHost:'',
    showImgSwitch:'',//缓存开关
    netState:'',//网络状态
    userName:'',
    passWord:'',
    phoneNumber:'',//绑定的电话号码
    qrCodeFlag :false,//二维码扫描开关
    version:'2.3.3.1',//版本号
    demoAcc:false,//是否是演示账套
    successFail:false,//登录未成功，选择帐套的时候不选择
};

module.exports = Service;
