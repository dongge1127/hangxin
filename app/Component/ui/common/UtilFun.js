/**
 * Created by John on 2017-8-22.
 * 定义公共的方法
 */
let UtilFun = {
	 /**
     *获取系统当前时间
     */
    getTimeDate(){
        let date=new Date();
        let iM = date.getTime();   //得到毫秒数
        let month=date.getMonth()+1;
        let timeDate=date.getFullYear()+'-'+month+'-'+date.getDate();
        let DateTime=timeDate.replace(/\b(\w)\b/g, '0$1');
        return DateTime;
    },
    /**
     *校验str是不是大于0的数字
     */
    checkFloatNum(str){
	    var reg_zs = /^[1-9]\d*(\.\d*)?$/i;
	    if (!reg_zs.test(str)) {
	            reg_zs = /^[0]\d*(\.\d*[1-9]\d*)?$/i;
                if(!reg_zs.test(str)){
                    return false;
                }
                return true;
	    }
    	return true;
    },
    trimStr(str){
        return str.replace(/(^\s*)|(\s*$)/g,"");
    },
    /*
     * 功能：删除数组中的某一个元素
     * 参数：arr - 数组
     *      index - 需要被删除的元素序号，从0开始
     * 返回：删除元素后的数组
     */
    ArrRemoveAt(arr, index) {
        //console.log(arr);
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
    //两日期相减
    DateDiff(sDate1,  sDate2){    //sDate1和sDate2是2006-12-18格式
        var  aDate,  oDate1,  oDate2,  iDays
        aDate  =  sDate1.split("-")
        oDate1  =  new  Date(aDate[1]  +  '/'  +  aDate[2]  +  '/'  +  aDate[0])    //转换为12-18-2006格式
        aDate  =  sDate2.split("-")
        oDate2  =  new  Date(aDate[1]  +  '/'  +  aDate[2]  +  '/'  +  aDate[0])
        iDays  =  parseInt(Math.abs(oDate1  -  oDate2)  /  1000  /  60  /  60  /24)    //把相差的毫秒数转换为天数
        return  iDays+1;
    },
    //遍历url组装成可加密的格式
    objUser(val) {
        let user = {}
        val.split(',').map(ele => {
            return ele.split(':')
        }).forEach(ele => {
            user[ele[0]] = ele[1]
        })
        return user
    },

}
export default UtilFun;
