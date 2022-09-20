
var ReportUtil = {
    dataList:[{rowNum:'1',acct:'库存现金-海淀',debit:'10.00',credit:'0'},
                    {rowNum:'2',acct:'库存现金-丰台',debit:'123,123,123,233,000.00',credit:'0'},
                    {rowNum:'3',acct:'库存现金-东城',debit:'600.00',credit:'0'},
                    {rowNum:'4',acct:'库存现金-西城',debit:'0',credit:'500.00'},
                    {rowNum:'5',acct:'库存现金-义庄',debit:'0',credit:'75.00'},
                    {rowNum:'6',acct:'库存现金-遵义',debit:'0',credit:'12.00'},
                    {rowNum:'7',acct:'库存现金-朝阳',debit:'0',credit:'14.36'},
                    {rowNum:'8',acct:'库存现金-石景山',debit:'0',credit:'453.25'},
                    {rowNum:'9',acct:'库存现金-大兴',debit:'0',credit:'742.22'},
                    {rowNum:'10',acct:'库存现金-通州',debit:'0',credit:'123.44'},
                    {rowNum:'11',acct:'库存现金-昌平',debit:'0',credit:'78.22'},
                    {rowNum:'12',acct:'库存现金-顺义',debit:'0',credit:'123.25'},
                    {rowNum:'13',acct:'银行存款-工商',debit:'0',credit:'74.23'},
                    {rowNum:'14',acct:'银行存款-北京银行',debit:'0',credit:'123.5'},
                    {rowNum:'15',acct:'银行存款-建行',debit:'0',credit:'25,456.32'},
                    {rowNum:'16',acct:'银行存款-中国银行',debit:'0',credit:'14.22'},
                    {rowNum:'17',acct:'银行存款-招行',debit:'0',credit:'78.22'},
                    {rowNum:'18',acct:'银行存款-天津银行',debit:'0',credit:'10.00'},
                    {rowNum:'19',acct:'银行存款-农行',debit:'0',credit:'1.00'},
                    {rowNum:'20',acct:'银行存款-央行',debit:'0',credit:'-78.23'}
                ],
    cols:[{code:'acct',name:'资金账户',width:40,alignItems: 'flex-start'},
                    {code:'debit',name:'收入',width:30,alignItems: 'flex-end'},
                    {code:'credit',name:'支出',width:30,alignItems: 'flex-end'}],//width是百分比数,list里会自动计算实际宽度

    option : {
                    title: {

                    },
                    tooltip: {
                        trigger:'item'
                    },
                    legend: {
                        show:false,
                        x:'left',
                        y:'bottom',
                        padding:-12,
                        data:['A','B','C','A1','A2','A3','B1','B2','C']
                    },
                    series: [
                        {
                            name: '',
                            type: 'pie',
                            selectMode:'single',
                            radius:[0,70],
                            x:'20%',
                            width:'30%',
                            max:100,
                            data: [{value:60,name:'A'},{value:30,name:'B'},{value:10,name:'C'}]                    },
                        {
                            name: '',
                            type: 'pie',
                            selectMode:'single',
                            radius:[90,130],
                            x:'60%',
                            width:'25%',
                            max:100,
                            data: [
                                {value:30,name:'A1'},{value:20,name:'A2'},{value:10,name:'A3'},
                                {value:20,name:'B1'},{value:10,name:'B2'},{value:10,name:'C'}
                            ]
                        }
                    ]
                },
    optionLine:{
                title:{},
                tooltip: {
                   trigger: 'item'
                },
                legend:{
                    left:'left',
                    data:'资金余额'
                },
                xAxis:{
                    type:'category',
                    name:'x',
                    splitLine:{show:false},
                    axisLabel:{
                        interval:0,
                        rotate:70
                    },
                    data:['2016-11-07~2016-01-17', '2016-11-14~2016-01-17', '2016-11-21~2016-01-17', '2016-11-28~2016-01-17', '2016-12-05~2016-01-17', '2016-12-12~2016-01-17', '2016-12-19~2016-01-17', '2016-12-26~2016-01-17', '2017-01-02~2017-01-22', '2017-01-09~2017-01-22']
                },
                grid:{
                    left:'3%',
                    right:'4%',
                    bottom:'32%',
                    x:40,
                    x2:20,
                    y2:100,
                    containLabel:true
                },
                yAxis:{
                    name:'y'
                },
                series:[
                    {
                        name:'资金余额',
                        type:'line',
                        data:[64032.00, 28.00, 64023.00, -64017.00, 64010.00, 64002.00, 63993.00, 63983.00, 63972.00, 63960.00]
                    }
                ]
    }

};
module.exports = ReportUtil;