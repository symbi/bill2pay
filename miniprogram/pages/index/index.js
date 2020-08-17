const date = new Date()
const years = []
const months = []
const year_start=2019
for (let i = year_start; i <= date.getFullYear(); i++) {
  years.push(i)
}

for (let i = 1; i <= 12; i++) {
  months.push(i)
}


const app = getApp()

Page({
    data: {
        scrollHeight: 500,
        avatarUrl: './user-unlogin.png',
        userInfo: {},
        nickName: '',
        logged: false,
        takeSession: false,
        requestResult: '',
        hiddenName: true,
        showBankGuide: false,
        showInitGuide: false,
        updateBank: {},
    
        all: [],
        all_sample: [],
        showDelConfirm: false,
        showDatePicker: false,
        showTop: false,
        showLast: false,
        keys:[],


        winHeight: "", //窗口高度
        currentTab: 0, //预设当前项的值
        scrollLeft: 0, //tab标题的滚动条位置
        //---test----
        birthdayshow:false,
        years: years,
        months: months,
        //days: days,
        year: years[1],
        month: months[1],
        value: [1,0], 
        value_saved:[1,0],
        date:'',//官方对比 todo check if need
    },
    
    bindChange: function (e) {
        //记录改变后的日期
        console.log('bindChange:',e.detail.value);
        this.setData({value:e.detail.value});
    },

    refresh: function(e){
        var self = this;
        setTimeout(function(){
          console.log('下拉刷新');
          var date = new Date();
          self.setData({
            currentPage: 1,
            refreshTime: date.toLocaleTimeString(),
            hideHeader: false
          })
          self.getData();
        },300);
    },
    // 截获竖向滑动
    catchTouchMove:function(res){
        return false
      },
    // 滚动切换标签样式
    switchTab: function (e) {
        this.setData({
            currentTab: e.detail.current
        });
    },
    // 点击标题切换当前页时改变样式
    swichNav: function (e) {
        var cur = e.target.dataset.current;
        if (this.data.currentTaB == cur) {
            return false;
        } else {
            this.setData({
                currentTab: cur
            })
        }
    },

    //create name from key
    createNameByKey: function(pKey) {
        var ret = pKey.split('_');
        return ret[0] + '年' + ret[1] + '月';
    },
    calculatePayment_banks: function(updateAll) {
        var that = this;

        return new Promise(function(resolve) {
            var banks_new = [];
            for (var i = 0; i < updateAll.banks.length; i++) {
                banks_new = banks_new.concat(that.calculatePayment_bank(updateAll.banks[i]));
            }


            updateAll.banks = banks_new;
            resolve(updateAll);
        });
    },
    //calculate total, topay and payed, pData is updateBank
    calculatePayment_bank: function(pBank) {

        //return new Promise(function(resolve){

        let total = 0;
        let topay = 0;
        let payed = 0;
        for (var i = 0; i < pBank.bills.length; i++) {

            let toPay = pBank.bills[i].toPay;
            toPay = parseInt(toPay, 10);
            total += toPay;
            if (pBank.bills[i].payed)
                payed += toPay;
            else
                topay += toPay;
        }
        pBank.total = total;
        pBank.topay = topay;
        pBank.payed = payed;
        return (pBank);
        //console.log("calculatePayment_bank pBank:",pBank);
        //resolve(pBank);   
        //});

    },
    //update ui all 
    //pData{key,data{key,banks,...}}
    updateUIAll: function(msg, pData) {
        //console.log("updateUIAll msg:", msg);
        //console.log("updateUIAll pData:", pData);
        let that = this;
        let newAll = [];

        if (msg == "delete") {
            //console.log('updateUIAll delete----');
            newAll = newAll.concat(this.data.all);
            //console.log("newAll bf:",newAll);
            //console.log('check data_index:',pData.data_index)
            //todo: check pData.data_index???
            if(pData.data_index>=0){
            newAll.splice(pData.data_index, 1);
            }
            //todo: update that.data.keys
            for(let i=0;i<that.data.keys.length;i++){
                if(that.data.keys[i].key==pData.key){
                    //console.log('found key:',that.data.keys[i]);
                    that.data.keys.splice(i,1);
                }
            }

            //console.log("newAll af:",newAll);
            that.setData({
                all: newAll
            });
            //console.log("UI delete check rest keys:",that.data.keys);
            if(that.data.keys.length==0){
                console.log('2 load new sample for current month');
                that.createSample();
            }else if(newAll.length==0){
                console.log('2 load current month');
                that.loadMore('this',null,'init');
            }
            return;
        }
        let up_all_idx = pData.data_index;
        delete pData.data_index;
        delete pData.bank_index;
        delete pData.bill_index;

        this.calculatePayment_banks(pData).then(function(pData_paymentInfo) {
            switch (msg) {
                case 'init': //clear and init
                    //console.log('pData_paymentInfo:', pData_paymentInfo);
                    newAll = newAll.concat(pData_paymentInfo);
                    break;
                case 'add_btm':
                    newAll = that.data.all.concat(pData_paymentInfo);
                    break;
                case 'update':
                    newAll = [];
                    newAll = newAll.concat(that.data.all);
                    //console.log("newAll:",newAll);
                    //var up_all_idx=that.data.updateBank.data_index;
                    newAll[up_all_idx] = pData;
                    break;
                case 'add_top': 
                    newAll = [];
                    newAll[0] = pData;
                    newAll = newAll.concat(that.data.all);
                    console.log("add top newAll:", newAll);
                    break;
            }
            that.setData({
                all: newAll,
                updateBank: {}
            });
        });


    },
    saveAndReadFile: function(pFilePath) {
        console.log("saveAndReadFile IN:", pFilePath);
        let fsm = wx.getFileSystemManager();
        wx.saveFile({
            tempFilePath: pFilePath,
            success: function(res) {
                console.log("saveFile success:", res.savedFilePath); 
                fsm.readFile({   filePath: res.savedFilePath,   encoding: 'utf8',   success: function(res) {    console.log("read file:", res.data)   }  });
            },
            fail: function(res) {
                console.log("saveFile fail:", res);
            },
        });
    },
    appendFile2: function(pFilePath, pData) {
        return new Promise(function(resolve, reject) {
            let fsm = wx.getFileSystemManager();
            fsm.appendFile({ 
                filePath: pFilePath,
                 data: pData,
                 encoding: 'utf8',
                 success: res => {  
                    console.info("appendFile sucess:", res);
                    resolve(); 
                },

                 fail: res => {  
                    console.info("appendFile fail:", res);
                    reject(); 
                }
            });

        });

    },
    //save storage and get new saved storage
    saveDataByKey: function(pKey, pBanks) {
        let that=this;
        return new Promise(function(resolve, reject) {
            if (pBanks.length == 0) {
                //delete by key
                wx.removeStorage({
                    key: pKey,
                    success: (result) => {
                        console.log("saveDataByKey delete by key----");
                        that.loadKeys();
                        resolve(null);
                    }
                });
            } else {
                wx.setStorage({
                    key: pKey,
                    data: pBanks,
                    success: function(res) {
                        that.loadKeys();
                        //update all 
                        wx.getStorage({
                            key: pKey,
                            success: function(result) {
                                resolve(result.data);
                            },
                            fail: () => {},
                            complete: () => {}
                        });
                    }

                });
            }
            

        });

    },
    
    //get storage, wx.getStorage
    getDataByKey: function(pKey) {
        return new Promise(function(resolve, reject) {
            wx.getStorage({
                key: pKey,
                success: function(result) {
                    resolve(result.data);
                },
                fail: (err) => {
                    resolve(err);
                },
                complete: () => {}
            });
        });

    },

    //create data from last/next saved data, 
    //return banks with new key
    //pKey: the new key
    //banks: the banks create from
    //msg: last or next, 
    //create from before banks, set next
    //create from after banks, set last
    editBanksWithKey: function(banks, pKey, msg) {
        var that = this;
        for (var i = 0; i < banks.length; i++) {
            //update bank
            var temp_1 = banks[i].id.split('-');
            banks[i].id = temp_1[0] + '-' + pKey;
            //update bill
            for (var j = 0; j < banks[i].bills.length; j++) {
                var temp_2 = banks[i].bills[j].id.split('-');
                banks[i].bills[j].id = temp_2[0] + '-' + temp_2[1] + '-' + pKey;

                let date_old = banks[i].bills[j].date.split('/');
                
                let month = date_old[0];
                let day = date_old[1];
                
                banks[i].bills[j].date = that.getMonthOf(msg, month) + '/' + day;
                banks[i].bills[j].payed = false;
                banks[i].bills[j].memo = '';
                banks[i].bills[j].changed = false;
            }
        }
        return banks;
    },
    //load sample
    //pData:{key}
    //todo here
    createSample: function() {

        let date = new Date();
        let year = date.getFullYear();
        let month = date.getMonth() + 1;
        let key = year + "_" + month;
        let name=this.createNameByKey(key);
        let data_sample = {
                key: key,
                name:name,
                banks: [
                    {
                        id:"银行卡1（点击更改）-"+key,
                        name: '银行卡1（点击更改）',
                        bills: [{
                            id:"帐单1（点击更改，滑动删除）-银行卡1（点击更改）-"+key,
                            name: '帐单1（点击更改，滑动删除）',
                            toPay: 100,
                            date: '11/11',
                            payed: false
                        },]
                    }
                ]
            }
        let all=[data_sample];
        let that=this;
        that.saveDataByKey(key,data_sample.banks).then(function(banks){
            that.setData({all:all,currentTab:0});
        });
    },
    //pKey_a<pKey_b return true
    compareKeys: function(pKey_a, pKey_b){
        let ret_a=pKey_a.split('_');
        let year_a=ret_a[0];
        let month_a=ret_a[1];

        let ret_b=pKey_b.split('_');
        let year_b=ret_b[0];
        let month_b=ret_b[1];

        if(year_a<=year_b && month_a<month_b){
            return true;
        }
        return false;
    },

    //pKey: the key of data to create
    //pKey_by: the key of date create from
    createDataFrom: function(pKey, pKey_by){
        let that=this;
        let data_new = { key: pKey };
        let msg='next'; //last or next
        //if pKey < pKey_by, create from next bank
            //the bank to create is last,msg to pass is last
        if(that.compareKeys(pKey,pKey_by))msg='last';
        console.log('createDataFrom:',pKey,' by key:',pKey_by,' with msg:',msg)
        return new Promise(function(resolve, reject) {
            that.getDataByKey(pKey_by).then(function(banks) {
                    //the bank to create is next, set next
                    //the bank to create is last, set last
                data_new.banks=that.editBanksWithKey(banks, pKey, msg);
                resolve(data_new);
            }.bind(that));
        });
    },

    //get next or last month
    getMonthOf: function(msg, month) {
        month = parseInt(month);
        switch (msg) {
            case 'last':
                if (month == 1)
                    month = 12
                else
                    month = month - 1;
                break;
            case 'next':
                if (month == 12)
                    month = 1;
                else
                    month = month + 1;
                break;
        }
        return month;
    },
    //todo: change name to createKeyOf
    //get next or last month key
    getKeyOf: function(msg,key){
        let y_r=parseInt(key.split('_')[0]);
        let m=parseInt(key.split('_')[1]);
        let m_r=this.getMonthOf(msg,m);
        switch(msg){
            case 'last':
                if (m_r==12)y_r=y_r-1;
            case 'next':
                if (m_r==1)y_r=y_r+1;
        }
        return y_r+'_'+m_r;
    },
    //return the key before or after
    //msg: last or next
    getKeyBeforeAfter: function(msg, pKey){
        console.log("getKeyBeforeAfter msg:",msg,", key:",pKey);
        let that=this;
        let year=pKey.split('_')[0];
        let month=pKey.split('_')[1];
        let t=new Date(year+'/'+month+'/1');
        let idx=-1;
        if(this.data.keys.length==0){return null;}
        if (msg == 'last'){
            if (that.data.keys[0].key_next==pKey){
                //create from latest key
                idx=0;
            }else{
                for(let i=0;i<that.data.keys.length;i++){
                    let e=that.data.keys[i];
                    let k=new Date(e.key.split('_')[0]+'/'+e.key.split('_')[1]+'/1');
                    if (k<t){
                        idx=i;
                        console.log("find last of ",pKey," is ",k);
                        break;
                    }
                }
                //all the key is later than target day
                //idx=-1;
            }
        }else{//if msg is next
            if (that.data.keys[0].key_next==pKey){
                //all the key is earlier than target key, return -1
                idx=-1;
            }else{
                for(let i=0;i<that.data.keys.length;i++){
                    let e=that.data.keys[i];
                    let k_y=e.key.split('_')[0];
                    let k_m=e.key.split('_')[1];
                    let k=new Date(k_y+'/'+k_m+'/1');
                    //console.log("k=",k,", t=",t,", k==t:",k==t);
                    if (k<t || (k_y==year && k_m==month)){
                        idx=i-1;
                        if(idx==-1)idx=-2;//not exist next
                        console.log("find next idx=",idx);
                        //console.log("find next key:",that.data.keys[idx]);
                        console.log("find next of ",pKey," is ",that.data.keys[idx]);
                        break;
                    }
                }
                //all the key is later than target day
                if(idx==-1)idx=that.data.keys.length-1;
            }
        }
        console.log('mark here');
        if (idx<0){
            console.log('to return null idx is:',idx);
            return null;
        }else{
            console.log("return idx=",idx);
            console.log("return key:",that.data.keys[idx]);
            return that.data.keys[idx].key;
        }
        


    },
    
    updateUI: function(pKey,pBanks,pos){
        let name = this.createNameByKey(pKey);
        let data_new = {
            key: pKey,
            name: name,
            banks: pBanks
        }
        this.updateUIAll(pos, data_new);
    },

    getCurrentKey: function(){
        let date,year,month;
        date = new Date();
        year = date.getFullYear();
        month = date.getMonth() + 1;
        return year + "_" + month;
    },

    //load more data
    //key:if null, this year_month
    //pos:add_btm, next, init, null for init
    loadMore: function(msg,key,pos) {
        if(!key)key = this.getCurrentKey();
        if(!pos)pos='init';
        let that = this;

        switch (msg) {
            case 'last': //get last key of certain key and load
                //load last of certain key
                let key_bf=that.getKeyBeforeAfter('last', key);
                if(key_bf){
                    //get data of key_bf and load
                    that.getDataByKey(key_bf).then(function(banks) {
                        that.updateUI(key_bf,banks,pos);
                    });
                }else{
                    //check if next month exist, load next
                    let length_key=that.data.keys.length;
                    let length_all=that.data.all.length;
                    if(length_all>0){
                        //do nothing!
                        console.log('length_all exist , load last do nothing');
                    }else if(length_key>0){//exist next month
                        that.loadMore('key',that.data.keys[length_key-1].key,'init');
                    }else{//no month left, create new
                        that.createSample();
                    }
                    
                }
                break;
            case 'key':
                //console.log("key----!",key);
                //check if key exist
                that.getDataByKey(key).then(function(data) {
                    if (data.errMsg) {
                        //no data, create from last key
                        let key_bf=that.getKeyBeforeAfter('last', key);
                        //console.log('load key key_bf:',key_bf);
                        if(key_bf){
                            //create data from before key
                            that.createDataFrom(key, key_bf).then(function(data) {
                                that.saveDataByKey(key, data.banks).then(function(banks) {
                                    that.updateUI(key,banks,pos);
                                });
                            });
                        }else{//key_bf is not exist, to create key from keys[key_last_index]
                            //create data from this.data.keys[0].key
                            let key_af=that.data.keys[that.data.keys.length-1].key;
                            //console.log("no key_bf, key_af:",key_af);
                            //create data from before key
                            that.createDataFrom(key, key_af).then(function(data) {
                                that.saveDataByKey(key, data.banks).then(function(banks) {
                                    that.updateUI(key,banks,pos);
                                });
                            });
                        }
                    } else {
                        //console.log("2 load key data:", data);

                        that.updateUI(key,data,pos);
                    }
                });
                
                break;
            
            case 'this': //this month, if not exist load lastest month
                //console.log("load more this:", key);
                that.getDataByKey(key).then(function(data) {
                    if (data.errMsg) {
                        //no data, go to load more new
                        //console.log("found no this, go to load last of key:",key);
                        that.loadMore('last',key,'init');

                    } else {
                        //console.log("get load this data:", data);
                        that.updateUI(key,data,pos);
                    }
                });
                break;
        }
    },

    //get sort keys
    loadKeys: function(){
        let that=this;
        //sort keys in storage
        wx.getStorageInfo({
            success: (result) => {
                //console.log("rt:",result.keys);
                if(result.keys.length==0){//initial first time
                    that.setData({ showInitGuide: true });
                    that.createSample();
                }else{
                    //console.log("sort keys:",result.keys)
                    let keys=[];
                    let tmp=[];
                    result.keys.forEach((e,i) => {
                        keys[i] ={key:e,
                                name:that.createNameByKey(e)
                                }
                    });
                    keys.sort(function(a,b){
                        let date_a=a.key.split('_')[0]+'/'+a.key.split('_')[1]+'/1';
                        let date_b=b.key.split('_')[0]+'/'+b.key.split('_')[1]+'/1';
                        
                        a=new Date(date_a);
                        b=new Date(date_b);

                        if (a < b) return 1;
                        if (a > b) return -1;
                        return 0;
                    });
                    
                    keys[0].key_next=that.getKeyOf('next',keys[0].key);
                    keys[0].name_next=that.createNameByKey(keys[0].key_next);

                    //console.log("----tmp:",keys);
                    that.setData({keys:keys});
                }
                
            },
            fail: () => {},
            complete: () => {}
        });
    },

    onLoad: function(options) {

        let that = this;
        let year_now=date.getFullYear();
        let month_now=date.getMonth()+1;
        // 高度自适应
        wx.getSystemInfo({
            success: function (res) {
                let clientHeight = res.windowHeight,
                    clientWidth = res.windowWidth,
                    rpxR = 750 / clientWidth;
                that.setData({
                    winHeight: clientHeight * rpxR-80, //80 is the tab height
                    value:[year_now-year_start,month_now-1]
                    //year:year_now-year_start-1
                });
            }
        });
        //console.log('onload this.data.value:',this.data.value);
        that.loadKeys();
        that.loadMore('this',null,'init');

    },
    //create next new month
    onCreate: function(e) {
        //this.setData({currentTab:0});
        //load from key
        if (e.currentTarget.dataset.status=="btn_addData_confirm"){
            let key_add=this.data.years[this.data.value[0]]+'_'+this.data.months[this.data.value[1]];
            //check if exist or not
            let duplicated=false;
            for(let i=0;i<this.data.keys.length;i++){
                if(this.data.keys[i].key==key_add){
                    this.showToast('此账本已存在','none');
                    duplicated=true;
                    break;
                }
            }
            if(!duplicated) this.loadMore('key',key_add,'init');
            
        }else{
            this.loadMore('key',this.data.keys[0].key_next,'init');
        }
        
        this.hideModal();
    },
    onShowThis: function() {
        //this.setData({currentTab:0});
        //check if current key exist
        let found=false;
        let key_cur=this.getCurrentKey();
        this.data.keys.some(function(value){
            if(value.key==key_cur){
                console.log('found!');
                found=true;
                return true;
            }
        });
        if(found)
            this.loadMore('key',key_cur,'init');
        else
            this.showToast(key_cur.split('_')[1]+'月帐本不存在', 'warn');
        //this.loadMore('this',null,'init');
        this.hideModal();
    },
    //load next exist month
    //todo check
    onShowNext: function() {
       // this.setData({currentTab:0});
        let key_next=this.getKeyBeforeAfter('next',this.data.all[0].key);
        if(key_next){
            this.loadMore('key',key_next,'add_top');
        }else{
            this.showToast('到顶了', 'warn');
        }
        this.hideModal();
    },
    onShowLast: function() {
        console.log('onShowLast!!!! to del!')
        //todo load last of current last record
        //this.loadMore('last',todo,'add_btm');
        this.hideModal();
    },

    onPullDownRefresh: function() {
        if(this.data.currentTab==0){
            this.setData({ showTop: true });
        }
    },
    //页面滑动到底部
    onReachBottom: function() {
        if(this.data.currentTab==0){
            let key = this.data.all[this.data.all.length - 1].key;
            console.log('onReachBottom cur key:',key);
            let key_last=this.getKeyBeforeAfter('last', key);
            if(key_last){
                this.loadMore('key',key_last,'add_btm');
            }else{
                console.log("onReachBottom is null!");
            }     
        }

    },
    preventTouchMove: function() {},

    showToast: function(pTitle, pIcon) {
        
        wx.showToast({
            title: pTitle,
            icon: pIcon,//支持"success"、"loading" 
            duration: 3000
        });
        
    },
    checkBillChange: function(bill_ori, bill_new) {
        console.log("checkBillChange bill_ori:", bill_ori);
        console.log("checkBillChange bill_new:", bill_new);
        if (bill_ori.name != bill_new.name) return true;
        if (bill_ori.toPay != bill_new.toPay) return true;
        if (bill_ori.date != bill_new.date) return true;
        if (bill_ori.payed != bill_new.payed) return true;
        if (bill_ori.memo != bill_new.memo) return true;
        return false;
    },
    hideModal: function() {
        console.log("hideModal--");
        this.setData({
            showDelConfirm: false,
            showDatePicker: false,
            showTop: false,
            showLast: false,
            updateBank: {}
        });
    },
    onCancel: function() {
        this.hideModal();
        this.setData({value:this.data.value_saved});
    },
    onConfirm: function(e) {
        console.log("onConfirm status:", e.currentTarget.dataset.status);
        this.updataStorage(e.currentTarget.dataset.status);
    },

    //detelte bill
    billDelete: function(e) {
        this.setData({ showDelConfirm: true });
        let result = e.currentTarget.id.split('-');
        this.createUpdateBank(result[0], result[1], result[2], 'delBill');
    },
    billPay: function(e){
        console.log('billPay check all:',this.data.all)
        let result = e.currentTarget.id.split('-');
        this.createUpdateBank(result[0], result[1], result[2], 'payBill');
    },
    //delete data
    deleteRecord: function(e) {
        this.setData({ showDelConfirm: true });
        console.log("deleteRecord target id:",e.currentTarget.id);
        this.createUpdateBank(null, null, e.currentTarget.id, 'delData');
    },
    selectRecord: function(e){
        this.setData({ currentTab: 0 });
        this.loadMore('key',e.currentTarget.id,'init');
    },
    //accend:boolean, ture for accend
    sortBills(pBank,accend){
        //a index is after b
        pBank.bills.sort(function(a,b){
            let year=pBank.id.split('-')[1].split('_')[0]
            let date_a=year+'/'+a.date
            
            let date_b=year+'/'+b.date
            a=new Date(date_a);
            b=new Date(date_b);
            //console.log("check a:",a);
            //console.log("check b:", b);
            //console.log("check a<b:",a<b)
            if(accend){
                if (a < b) return -1;
                if (a > b) return 1;
            }else{
                if (a < b) return 1;
                if (a > b) return -1;
            }
            
            return 0
            
            
        });
        return pBank
    },
    //update updateBank to all, set storage, get storage to all
    updataStorage: function(btn_status) {
        console.log("updataStorage btn_status:", btn_status);

        let that = this;
        let updateBank = that.data.updateBank;
        console.log("updataStorage updateBank bf:", updateBank);
        let up_all_idx = updateBank.data_index;
        let up_bank_idx = updateBank.bank_index;
        let up_bill_idx = updateBank.bill_index;
        let toUpdateAll = that.data.all[up_all_idx];
        console.log("updataStorage all bf:", toUpdateAll);
        //banks is the array to update with toUpdateAll's key
        //banks is the one with toUpdateAll's bank[i] replaced with updateBank
        let banks = [];
        let toast = '';
        let change = true;
        let bank_temp; //used for flag_downBank flag_upBank

        switch (btn_status) {
            
            case 'upBank':
                banks = banks.concat(toUpdateAll.banks);
                if (up_bank_idx===0){
                    that.showToast('到顶了','warn');
                    return
                }
                bank_temp=banks[up_bank_idx];
                banks[up_bank_idx]=banks[up_bank_idx-1];
                bank_temp=banks[up_bank_idx-1]=bank_temp;
                
                break
            case 'downBank':
                banks = banks.concat(toUpdateAll.banks);
                if (up_bank_idx===banks.length-1){
                    that.showToast('到底了','warn');
                    return
                }
                bank_temp=banks[up_bank_idx];
                banks[up_bank_idx]=banks[up_bank_idx+1];
                bank_temp=banks[up_bank_idx+1]=bank_temp;
                
                break
            case 'payBill':
            case 'btn_editBill_confirm':
                change = that.checkBillChange(toUpdateAll.banks[up_bank_idx].bills[up_bill_idx], updateBank.bills[up_bill_idx]);
                if (!change) {
                    console.log("no change");
                    that.showToast('无更改', 'warn'); //warn is not support yet
                } else {
                    console.log("have some change");
                    banks = banks.concat(toUpdateAll.banks);
                    //sort updateBank bills by date
                    //console.log("bf updateBank:",updateBank)
                    updateBank=that.sortBills(updateBank,true);
                    //console.log("af updateBank:",updateBank)
                    banks[up_bank_idx] = updateBank;
                    if (btn_status=='payBill'){
                        if(updateBank.bills[up_bill_idx].payed)
                            toast = '已付';
                        else
                            toast='未付';
                    }else{
                        toast = '成功更新账单';
                    }
                        
                }
                break;

            case 'btn_addBill_confirm':
                //console.log("updataStorage banks_ori bf:",toUpdateAll.banks[up_bank_idx].bills);
                console.log("updataStorage btn_addBill_confirm");
                banks = banks.concat(toUpdateAll.banks);
                //sort updateBank bills by date
                updateBank=that.sortBills(updateBank,true);
                banks[up_bank_idx] = updateBank;
                //console.log("updataStorage banks af:", banks);
                toast = '成功添加账单';
                break;

            case 'btn_delBill_confirm':
                console.log("updataStorage btn_delBill_confirm");
                updateBank.bills.splice(up_bill_idx, 1);
                banks = banks.concat(toUpdateAll.banks);
                banks[up_bank_idx] = updateBank;
                toast = '成功删除账单';
                that.hideModal();
                break;
            case 'btn_addBank_confirm':
                console.log("updataStorage btn_addBank_confirm");
                banks = banks.concat(toUpdateAll.banks);
                banks[up_bank_idx] = updateBank;
                toast = '成功添加银行';
                break;
            case 'btn_editBank_confirm':
                //console.log("updataStorage btn_editBank_confirm");
                //need check if change anything
                if (toUpdateAll.banks[up_bank_idx].name == updateBank.name) {
                    that.showToast('无更改', 'info');
                    change = false;
                } else {
                    banks = banks.concat(toUpdateAll.banks);
                    banks[up_bank_idx] = updateBank;
                    console.log("btn_editBank_confirm banks:", banks);
                    toast = '成功改名';
                }
                break;
            case 'btn_delBank_confirm':
                banks = banks.concat(toUpdateAll.banks);
                banks.splice(up_bank_idx, 1);
                toast = '成功删除银行';
                break;

            case 'btn_delData_confirm':
                toast = '成功删除记录';
                that.hideModal();
                toUpdateAll = { key: updateBank.data_key };
                console.log("btn_delData_confirm toUpdateAll");
                break;
        }

        //save data and get data
        if (change) {
            that.saveDataByKey(toUpdateAll.key, banks).then(function(data_get) {
                that.showToast(toast, 'success');
                if (data_get) {
                    let update_All = {
                        key: toUpdateAll.key,
                        name: that.createNameByKey(toUpdateAll.key),
                        banks: data_get,
                        data_index: up_all_idx,
                        bank_index: up_bank_idx,
                        bill_index: up_bill_idx
                    }
                    that.updateUIAll('update', update_All);
                } else { //return null, delete record in that.data.all to update UI
                    
                    let update_All = {
                        key: toUpdateAll.key,
                        banks: null,
                        data_index: up_all_idx,
                    }
                    that.updateUIAll('delete', update_All);
                    

                }
            });
        }



    },
    //add a record
    addData: function(){
        this.setData({showDatePicker:true});
        this.data.value_saved = this.data.value;// 记录改变前的日期
    },
    //add bank
    addBank: function(e) {
        this.createUpdateBank(null, null, e.currentTarget.id, e.currentTarget.dataset.status);
    },
    //todo: check need
    addBankDone: function(pData, pStatus) {
        this.data.updateBank.name = pData.name;
        this.data.updateBank.id = pData.id;
        this.updataStorage(pStatus);
    },
    //rename bank, create updateBank
    bankEdit: function(e) {
        this.setData({ showEditBankModal: true });
        var result = e.currentTarget.id.split('-');
        this.createUpdateBank(null, result[0], result[1], e.currentTarget.dataset.status);
    },
    editBankDone: function(pData, pStatus) {
        this.data.updateBank.name = pData.name;
        this.data.updateBank.id = pData.id;
        
        //pStatus can be btn_editBank_confirm or btn_delBank_confirm
        if (pStatus == 'btn_editBank_confirm') {
            //update all the bills id
            for (let i = 0; i < this.data.updateBank.bills.length; i++) {
                let id = this.data.updateBank.bills[i].id;
                let ret = id.split('-');
                this.data.updateBank.bills[i].id = ret[0] + '-' + pData.name + '-' + ret[2];
                
            }
        }
        this.updataStorage(pStatus);
    },
    //add bill input update updateBank
    addBillDone: function(pBill, pStatus) {
        this.data.updateBank.bills = this.data.updateBank.bills.concat(pBill);
        this.updataStorage(pStatus);
    },
    editBillDone: function(data, status) {
        console.log("editBillDone data:", data);
        this.data.updateBank.bills[this.data.updateBank.bill_index] = data;
        this.updataStorage(status);
    },

    navigateToBill: function(pKeys) {
        wx.navigateTo({
            url: '../bill/bill?' + pKeys,
            success: function(res) {
                console.log("navigateTo success");
            },
            fail: function() {
                //fail
            },
            complete: function() {
                //complete
            }
        });
    },
    //change item, create updateBank
    itemEdit: function(e) {
        console.log("itemEdit:", e.currentTarget.id);
        var result = e.currentTarget.id.split('-');
        //this.createUpdateBank(result[0],result[1],result[2]);
        this.createUpdateBank(result[0], result[1], result[2], e.currentTarget.dataset.status);

    },
    addBill: function(e) {
        let id = e.currentTarget.id.split("-");
        this.createUpdateBank(null, id[0], id[1], e.currentTarget.dataset.status);
    },
    createUpdateBank_delData:function(e){
        let that = this;
        let bank2up = {};
        let allData = that.data.all;
        bank2up.data_key = pAll_key;
        //if delData in allData
        for (let i = 0; i < allData.length; i++) {
            if (allData[i].key == pAll_key) {
                bank2up.data_index = i;
                bank2up.data_name = that.createNameByKey(pAll_key);
                break;
            }
        }
        that.setData({ updateBank: bank2up });
    },
    //pFlag:'EditBill','payBill','AddBill','EditBank','delBill'
    createUpdateBank_bills:function(pBill_name, pBank_name, pAll_key, pFlag){
        let that = this;
        let bank2up = {};
        let allData = that.data.all;
        for (let i = 0; i < allData.length; i++) {
            if (allData[i].key == pAll_key) {
                for (let j = 0; j < allData[i].banks.length; j++) {
                    if (allData[i].banks[j].id == pBank_name+'-'+pAll_key) {
                        //console.log("createUpdateBank add bill, target bank:",allData[i].banks[j]);

                        bank2up.name = allData[i].banks[j].name;
                        bank2up.bills = [].concat(allData[i].banks[j].bills);//must recreate data if update bill
                        bank2up.id = allData[i].banks[j].id;
                        bank2up.bank_index = j;
                        bank2up.data_index = i;
                        bank2up.id = bank2up.name + '-' + allData[i].key;

                        if (pFlag == 'EditBill' || pFlag == 'delBill' ||pFlag == 'payBill') {
                            for (let k = 0; k < allData[i].banks[j].bills.length; k++) {
                                if (allData[i].banks[j].bills[k].id == pBill_name+'-'+pBank_name+'-'+pAll_key) {
                                    bank2up.bill_index = k;
                                    let bill = allData[i].banks[j].bills[k];
                                    if (pFlag == 'EditBill') {
                                        
                                        console.log('createUpdateBank memo check:',bill.memo);
                                        
                                        this.navigateToBill('show=' + pFlag + '&title=修改账单&id=' + bill.id + '&name=' + bill.name +
                                            '&toPay=' + bill.toPay + '&date=' + bill.date + '&payed=' + bill.payed +'&memo=' + bill.memo);
                                    }else if(pFlag == 'payBill'){ 
                                        console.log("before set all:",that.data.all)
                                        //must recreate the data to update otherwise be effect
                                        //bank2up.bills[k].payed=true;
                                        bank2up.bills[k]={id:bill.id, name:bill.name, date:bill.date,memo:bill.memo, toPay:bill.toPay,payed:!bill.payed,changed:true}
                                        that.setData({ updateBank: bank2up });
                                        console.log("after set all:",that.data.all)
                                        console.log("check updateBank:",that.data.updateBank)
                                        that.updataStorage(pFlag);
                                    }
                                    break;
                                }
                            }
                        }
                        if (pFlag == 'AddBill') {
                            this.navigateToBill('show=' + pFlag + '&title=添加账单&id=' + bank2up.id);
                        }
                        if (pFlag == 'EditBank') {
                            console.log("To EditBank");
                            this.navigateToBill('show=' + pFlag + '&title=修改银行&id=' + bank2up.id);
                        }

                    }

                }
            }
        }
        that.setData({ updateBank: bank2up });
    },
    createUpdateBank: function(pBill_name, pBank_name, pAll_key, pFlag) {
        let that = this;
        let bank2up = {};
        let allData = that.data.all;
        //console.log("pFlag:",pFlag);
        //console.log("allData:",allData);
        //console.log('createUpdateBank pBill_name:',pBill_name);
        //console.log('createUpdateBank pBank_name:',pBank_name);
        //console.log('createUpdateBank pAll_key:',pAll_key);
        switch (pFlag) {
            //todo 这里吃相不好看，有空需要优化一下
            case 'EditBill':
            case 'payBill':
            case 'AddBill':
            case 'EditBank':
            case 'delBill':
                that.createUpdateBank_bills(pBill_name, pBank_name, pAll_key, pFlag);
                break;

            case 'AddBank':
                for (let i = 0; i < allData.length; i++) {
                    if (allData[i].key == pAll_key) {
                        bank2up.bank_index = allData[i].banks.length;
                        bank2up.data_index = i; //id and bill_index are not set
                        bank2up.bills = [];
                        this.navigateToBill('show=' + pFlag + '&title=添加银行卡&id=' + pAll_key);
                    }
                }
                that.setData({ updateBank: bank2up });
                break;
            
            case 'upBank':
            case 'downBank':
                for (let i = 0; i < allData.length; i++) {
                    if (allData[i].key == pAll_key) {
                        //bank2up.bank_index = allData[i].banks.length;
                        for (let j=0;j<allData[i].banks.length;j++){
                            if(allData[i].banks[j].id==pBank_name+'-'+pAll_key){
                                bank2up.bank_index = j; 
                            }
                        }
                        bank2up.data_index = i;
                        bank2up.bills = [];//do nothing to exist bills
                    }
                }
                
                that.setData({ updateBank: bank2up });
                that.updataStorage(pFlag);
                
                break;
            case 'delData':
                bank2up.data_key = pAll_key;
                //if delData in allData
                for (let i = 0; i < allData.length; i++) {
                    if (allData[i].key == pAll_key) {
                        bank2up.data_index = i;
                        bank2up.data_name = that.createNameByKey(pAll_key);
                        break;
                    }
                }
                that.setData({ updateBank: bank2up });
                break;

        }
        //that.setData({ updateBank: bank2up });
    },


    onGetUserInfo: function(e) {
        if (!this.data.logged && e.detail.userInfo) {
            this.setData({
                logged: true,
                avatarUrl: e.detail.userInfo.avatarUrl,
                userInfo: e.detail.userInfo
            })
        }
    },
    //call from bill.js
    getUpdateBank: function() {
        return this.data.updateBank;
    },
    //call from bill.js
    getBanks: function() {
        let data_index = this.data.updateBank.data_index;
        let banks = this.data.all[data_index].banks;
        let ret = [];
        for (let i = 0; i < banks.length; i++) {
            ret[i] = banks[i].name;
        }
        return ret;
    }

})