const date = new Date()
const years = []
const months = []
const days = []

for (let i = 2019; i <= date.getFullYear()+3; i++) {
  years.push(i)
}

for (let i = 1; i <= 12; i++) {
  months.push(i)
}

for (let i = 1; i <= 31; i++) {
  days.push(i)
}
// miniprogram/pages/bill/bill.js
Page({

  /**
   * Page initial data
   */
  data: {
    winHeight: "", //窗口高度
    showEditBill:false,
    showThing2Bill:false,
    showAddBill:false,
    showEditBank:false,
    showMenuAddBank:false,
    showMenuAddBill:false,
    showMenuAddThing:false,
    showEditThing:false,
    id:'',
    title:'',
    title_year:'',
    title_month:'',
    name:'',
    toPay:'',
    date:'',
    payed:false,
    showDelBank:false,
    flag:'',

    showPickDay:false,
    showPickRecord:false,
    showPickBank:false,
    picker_btn:['取消','确定'],
    years:years,
    months: months,
    days: days,
    month: -1,
    day: -1,
    val:[date.getMonth(),15],//date value
    val_old:[0,0],
    memo:'',
    banks:[],
    records:[],
    records_key:[],
    allDataInfo:[],
    name_bank:'',
    val_record:-1,//index of record
    val_record_old:-1,
    val_bank_old:-1,
    val_bank:-1 //index of bank
  },
  onShowPickDay: function(e){
    switch (e.target.id){
      case "records":
        let val_record=this.data.val_record_old;
        if(val_record<0)val_record=0;
        this.setData({
          showPickRecord:true,
          val_record_old:this.data.val_record,
          val_record:val_record
        });
        break;
      case "todo":
        console.log("onShowPickDay todo!:",this.data.val);
        this.setData({
          showPickDate:true,
          val_old:this.data.val
        });
        break;
      case "banks":
        let val_bank=this.data.val_bank_old;
        if(val_bank<0)val_bank=0;
        if(this.data.val_record>=0){
          this.setData({
            showPickBank:true,
            banks:this.data.allDataInfo[this.data.val_record].bankNames,
            val_bank_old:this.data.val_bank,
            val_bank:val_bank
          });
        }else{
          this.setData({
            showPickBank:true,
            val_bank_old:this.data.val_bank>=0?this.data.val_bank:0,
            val_bank:this.data.val_bank>=0?this.data.val_bank:0,
            val_record_old:this.data.val_record,
            val_record:0
          });      
        }

        break;
      default://pick day
        this.setData({
          showPickDay:true,
          val_old:this.data.val,
          //val:[0,0]
        });
        break;
    }

  },
  onPickerConfirm: function(e){
    //console.log("onPickerConfirm e:",e.currentTarget)
    switch (e.target.id){
      case "records":
        if (e.currentTarget.dataset.index==0)//cancle
          this.setData({
            val_record_old:this.data.val_record,//canceled value
            val_record:this.data.val_record_old
          });
        this.setData({
          showPickRecord:false,
          val_bank:-1
        });
        break;
      case "banks":
        if (e.currentTarget.dataset.index==0)//cancle
          this.setData({
            val_bank_old:this.data.val_bank,//canceled value
            val_bank:this.data.val_bank_old
          });
        this.setData({showPickBank:false});
        break;
      default://pick day
        if (e.currentTarget.dataset.index==0)//cancle
          this.setData({val:this.data.val_old});
        else if(this.data.val.length==2)
          this.setData({month:this.data.val[0]+1,day:this.data.val[1]+1});
        //this.setData({showPickDay:false});
        else
          this.setData({year:years[this.data.val[0]],month:this.data.val[1]+1,day:this.data.val[2]+1});
        
        this.hideModal();
        break;
    }
  },
  bindChange: function(e) {
    //console.log('bindChange', e.detail.value);
    switch (e.target.id){
      case "records":
        this.setData({val_record:e.detail.value[0]});
        //console.log("set val_record:",e.detail.value[0]);
        break;
      case "banks":
        //console.log("val_bank:",this.data.banks[e.detail.value[0]],e.detail.value[0]);
        this.setData({val_bank:e.detail.value[0]});
        break;
      default://pick day or todo
        //console.log("bindChange pick day or todo:",e.detail.value);
        this.setData({val:e.detail.value});
        break;
    }
    
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    //console.log("onload options.id:",options.id);
    //console.log("onload options:",options);
    
    let ret='';
    let time='';
    let that=this;
    if (options.id!==undefined)ret=options.id.split('-');

    
    let prv=this.getPrevPage(1);
    let dataInfo=prv.getRecordsInfo();
    let records=[];
    let records_key=[];
    dataInfo.forEach(function(data){
      records_key.push(data.key);
      records.push(data.name_record);
    });
    //console.log("records:",records,records_key);
    //console.log("allDataInfo:",dataInfo);



    switch (options.show){
      case "EditThing":
        let date=options.date.split('/');
        let idx_year=-1;
        for(const [i, year] of years.entries()){
          if(year==parseInt(date[0])){
            idx_year=i;
            break;     
          }
        }
        //let todos=this.getPrevPage(1).getTodos();
        this.setData({
          //allDataInfo:todos,
          allDataInfo:dataInfo,
          records:records,//record names
          records_key:records_key,//record keys
          id:options.id,
          name:options.id,
          memo:options.memo,
          payed:options.payed== 'true',//conver to boolean
          toPay:parseInt(options.toPay, 10),
          val:[idx_year,date[1]-1,date[2]-1],
          year:years[idx_year],
          month:months[date[1]-1],
          day:days[date[2]-1],
          showEditThing:true
        });
        console.log("edit thing payed:",this.data.payed);
        break;
      case "MenuAddThing":
        console.log("onload MenuAddThing");
        this.setData({
          //allDataInfo:this.getPrevPage(1).getTodos(),
          allDataInfo:dataInfo,
          val:[1,new Date().getMonth()-1,15],
          showMenuAddThing:true
        });
        break;
      case "MenuAddBank":
      case "MenuAddBill":
        let isMenuAddBill=options.show=="MenuAddBill";
        let month_start=new Date().getMonth()+1;
        let day_start=21;
        this.setData({
          allDataInfo:dataInfo,
          banks:dataInfo[0].bankNames,
          records:records,//record names
          records_key:records_key,//record keys
          showMenuAddBill:isMenuAddBill?true:false,
          flag:isMenuAddBill?'btn_menuAddBill_confirm':'btn_menuAddBank_confirm',
          showMenuAddBank:isMenuAddBill?false:true,
          val:[month_start-1,day_start-1],
          month:month_start,
          day:day_start
        });
        break;     
      case "EditBill":
        time=ret[2].split('_');
        let ret_date=options.date.split('/');
        let month_load=parseInt(ret_date[0]);
        let day_load=parseInt(ret_date[1]);
        
        
        let ti=this.getTargetInfo(dataInfo,ret[2],options.bankName);
        let bankIdx=ti.bank_index;
        let recordIdx=ti.record_index;
        let bankList=ti.banks;


        //console.log("editbill recordIdx:",recordIdx,bankIdx);
        this.setData({
          allDataInfo:dataInfo,
          banks:bankList,//to change
          val_bank:bankIdx,
          val_bank_old:bankIdx,
          records:records,//record names
          records_key:records_key,//record keys
          val_record:recordIdx,//index of record
          val_record_old:recordIdx,
          showEditBill:true,
          id:options.id,
          title_year:time[0],//2del
          title_month:time[1],//2del
          name:ret[0],
          toPay:parseInt(options.toPay, 10),
          payed:options.payed== 'true',
          month:month_load,
          day:day_load,
          val:[month_load-1,day_load-1],
          val_old:[month_load-1,day_load-1],
          memo:options.memo=="undefined"?'':options.memo,
          flag:'btn_editBill_confirm',
          name_bank:options.bankName
        });
        break;
      case "AddBill":
        time=ret[1].split('_');
        this.setData({
          allDataInfo:this.getPrevPage(1).getRecordsInfo(),
          showAddBill:true,
          id:options.id,
          title_year:time[0],
          title_month:time[1],
          month:time[1],
          day:15,
          val:[time[1]-1,15-1],
          val_old:[time[1]-1,15-1],
          flag:'btn_addBill_confirm'
        });
        break;
      case "EditBank":
        time=ret[1].split('_');
        this.setData({
          showEditBank:true,
          id:options.id,
          name:ret[0],
          title_year:time[0],
          title_month:time[1],
          flag:'btn_editBank_confirm'
        });
        break;
    }
    

    wx.setNavigationBarTitle({
      title: options.title,
      success: ()=>{
      },
      fail: ()=>{},
      complete: ()=>{}
    });
    wx.getSystemInfo({
      success: function (res) {
          let clientHeight = res.windowHeight,
              clientWidth = res.windowWidth,
              rpxR = 750 / clientWidth;
              //console.log("clientHeight:",clientHeight,", clientWidth:",clientWidth, clientHeight * rpxR);
          that.setData({
              winHeight: clientHeight * rpxR-50, //50 is the tab height
          });
          //console.log("winHeight:",clientHeight * rpxR-50)
      }
  });
  },
  //get the index record, bank in all dataInfo
  getTargetInfo:function(dataInfo,tRecordKey,tBankName){
    let recordIdx=-1;
    let bankIdx=-1;
    let bankList=[]
    dance:
    for(const[i,di] of dataInfo.entries()){
      if (di.key==tRecordKey){
        recordIdx=i;
        bankList=di.bankNames
        for(const[j,bk] of bankList.entries()){
          if(bk==tBankName){
            bankIdx=j;
            break dance;
          }
        }
      }
    }
    return {
      record_index:recordIdx,
      bank_index:bankIdx,
      banks:bankList
    };
  },
  //check if payed
  billCheck:function(e){
    let checked=e.detail.value.length==0?false:true;
    console.log("checked:",checked);
    this.data.payed=checked;
  },
  getPrevPage:function(idx){
    let pages = getCurrentPages(); 
    return pages[pages.length - 1-idx];// -2 就是你上一页的数据 你上上页的数据就是-3 了以此类推！
  },

  input:function(e){
    this.data[e.target.id]=e.detail.value;
    //console.log('input e.target.id:',e.target.id,', value:',e.detail.value)
  },
  showBillToast:function(pTitle, pIcon){
    if(pIcon!=''){
      wx.showToast({
        title: pTitle,
        icon: pIcon,
        duration:3000
      });      
    }
  },
  
  checkNameDuplicated:function(name_new, updateBank,checkOther){
    if(checkOther){//check not duplicated to others
      for(var i=0;i<updateBank.bills.length;i++){
        if(i!=updateBank.bill_index && updateBank.bills[i].name==name_new){
          return true;
        }
      }      
    }else{//check name array
      for(let name of updateBank){
        if(name==name_new)
          return true;
      }
    }
    return false;
  },

  //return bill with checked value
  createReturnData:function(){
    //check toPay
    if(this.data.toPay==''||isNaN(this.data.toPay)){
      this.data.toPay=0;
    }
    //console.log('date val:',this.data.val);

    if(this.data.val.length==2)
      this.data.date=months[this.data.val[0]]+'/'+days[this.data.val[1]];
    else//with year
      this.data.date=years[this.data.val[0]]+'/'+months[this.data.val[1]]+'/'+days[this.data.val[2]];
    
    let bill={id:this.data.id,
      name:this.data.name,
      toPay:this.data.toPay,
      date:this.data.date,
      payed:this.data.payed,
      memo:this.data.memo,
      changed:true,
      key_record:this.data.records_key[this.data.val_record],
      name_bank:this.data.banks[this.data.val_bank]
    };
    return bill;
  },
  getBankNamesPicked:function(){
    let ret=-1;
    for(let d of this.data.allDataInfo){
      if(d.key==this.data.records_key[this.data.val_record]){
        ret=d.bankNames;
        break;
      }
    }
    return ret;
  },
  //from edit thing to add bill
  addToBill:function(){
    this.setData({
      banks:this.data.allDataInfo[0].bankNames,
      name:this.data.name,
      toPay:this.data.toPay,
      payed:this.data.payed,
      memo:this.data.memo,
      val:this.data.val,
      val_old:this.data.val_old,
      showEditThing:false,
      showThing2Bill:true,
      flag:'btn_editBill_confirm'});
  },
  //确定 和 取消 btn
  confirm:function(e){
    let prv=this.getPrevPage(1);
    let showEditBill=this.data.showEditBill;
    let showAddBill=this.data.showAddBill;
    let updateBank=prv.getUpdateBank();//todo add to individual
    
    if(this.data.name==''){
      this.showBillToast('必须输入名称','warn');
      return;
    }
    let id=this.data.id;
    let ret=id.split('-');
    let pFlag=e.currentTarget.dataset.status;
    let billNames=[];
    let retData;
    //console.log("confirm flag:",pFlag)
    switch(pFlag){
      case 'btn_editThing_comfirm':
        if(this.data.id==this.data.name){//no change name
          this.data.date=years[this.data.val[0]]+'/'+
          months[this.data.val[1]]+'/'+
          days[this.data.val[2]];
          retData=this.createReturnData();
          break;
        }
      case 'btn_addThing_comfirm':
        //check if duplicate the name
        
        let existName=[];
        this.data.allDataInfo.forEach(thing =>existName.push(thing.name));
        //console.log('existName:',existName)
        if(!this.checkNameDuplicated(this.data.name,existName,false)){
          if(pFlag=='btn_addThing_comfirm')this.data.id=this.data.name;
          this.data.date=years[this.data.val[0]]+'/'+
          months[this.data.val[1]]+'/'+
          days[this.data.val[2]];
          retData=this.createReturnData();  
        }else{
          this.showBillToast('名称重复','warn');
          break;
        }
        break;
      case 'btn_editBill_confirm':
        let name_bill_ori=ret[0];
        let name_bank_new=this.data.banks[this.data.val_bank];
        //console.log("btn_editBill_confirm name_bank_new:",name_bank_new);
        //console.log("btn_editBill_confirm recordid:",ret[2]);
        
        if(this.data.name==name_bill_ori ){
          if(this.data.name_bank!=name_bank_new)
            if(!ret[2])
            this.data.id=this.data.name+'-'+name_bank_new+'-'+this.data.records_key[this.data.val_record];
            else
              this.data.id=this.data.name+'-'+name_bank_new+'-'+ret[2];
          retData=this.createReturnData();
          //console.log("check retData:",retData);
          break;
        }          
        
        if(this.data.name_bank!=name_bank_new || !this.checkNameDuplicated(this.data.name,updateBank,true)){
          //create id by name
          if(this.data.name_bank!=name_bank_new)
            this.data.id=this.data.name+'-'+name_bank_new+'-'+ret[2];
          else
            this.data.id=this.data.name+'-'+ret[1]+'-'+ret[2];
          retData=this.createReturnData();
        }else{
          this.showBillToast('名称重复','warn');
          return;
        }
        break;
      case 'btn_addBill_menu_confirm':
        //console.log('btn_addBill_menu_confirm val_record:',this.data.val_record);
        if(this.data.val_record==-1){
          this.showBillToast('请选择账本','warn');
          return;
        }
        if(this.data.val==-1)this.data.val=[0,0];

        if(this.data.val_bank==-1)this.data.val_bank=0;
        let record_key=this.data.records_key[this.data.val_record];
        let name_bank=this.data.banks[this.data.val_bank]
        this.data.id=name_bank+'-'+record_key;
        //updateBank=this.getBankNamesPicked();
        let c_data=this.data.allDataInfo.key;
        let c_bank=this.data.banks[this.data.val_bank];
        dance:
        for (let data in this.data.allDataInfo){
          if(data.key==record_key){
            for(let bank of data.banks){
              if(bank.name_bank==name_bank){
                billNames=bank.name_bill;
                break dance;
              }
            }
          }
        }
        /*for(let e of c_data.banks){
          if(e.name_bank==c_bank)
          billNames=e.name_bill//get all the bill name of this bank
        }*/
        //console.log("check billNames:", billNames);
        
      case 'btn_addBill_confirm':
        if(pFlag=='btn_addBill_confirm')
          billNames=updateBank.bills.map(function(bill){return bill.name});
        //console.log('----target---',billNames);
        //check if duplicated if not
        if(!this.checkNameDuplicated(this.data.name,billNames,false)){
          //create id by name
          this.data.id=this.data.name+'-'+this.data.id;
          console.log("btn_addBill_confirm new id:",this.data.id); 
          retData=this.createReturnData();   
        }else{
          this.showBillToast('名称重复','warn');
          return;
        }
        break;
      case 'btn_editBank_confirm':
        this.data.id=this.data.name+'-'+ret[1];       
        retData={id:this.data.id,
              name:this.data.name
              }
        break;
      case 'btn_addBank_menu_confirm':
        if(this.data.val_record<0)this.data.val_record=0;
        this.data.id=this.data.records_key[this.data.val_record];
      case 'btn_addBank_confirm':
        let bankNames=pFlag=='btn_addBank_confirm'?
        prv.getBankNamesOfUpdate():this.getBankNamesPicked();
        if(this.checkNameDuplicated(this.data.name,bankNames,false)){
          this.showBillToast('名称重复','warn');
          return;
        }
        retData={id:this.data.name+'-'+this.data.id,
              name:this.data.name
              }
        break;
      case 'btn_delBank_confirm':
        retData={id:this.data.id,
          name:this.data.name
        }
        break;
    }
    //console.log("retData:",retData);
    wx.navigateBack({complete:function(){
      if(showEditBill || this.data.showThing2Bill)
        prv.editBillDone(retData,pFlag);
      if(showAddBill)
        prv.addBillDone(retData,pFlag);
      if(this.data.showEditBank)
        prv.editBankDone(retData,pFlag);
      if(this.data.showMenuAddThing)
        prv.addThingDone(retData,pFlag);
      if(this.data.showEditThing)
        prv.editThingDone(retData,pFlag);
      if(this.data.showMenuAddBill)
        prv.addBillFromMenuDone(retData,pFlag);
      if(this.data.showMenuAddBank)
        prv.addBankFromMenuDone(retData,pFlag);      
    }.bind(this)});
    
  },

  cancel:function(){
    wx.navigateBack();
  },
  hideModal:function(){
    this.setData({
      showDelBank:false,
      showPickDay:false,
      showPickDate:false,
      showPickRecord:false,
      showPickBank:false
    });
  },
  preventTouchMove:function(){},
  deleteBank:function(){
    this.setData({showDelBank:true});
  },
  deleteBill:function(e){
    
    wx.navigateBack();
    this.getPrevPage(1).updataStorage(e.currentTarget.dataset.status);

  },
  /**
   * Lifecycle function--Called when page is initially rendered
   */
  onReady: function () {

  },

  /**
   * Lifecycle function--Called when page show
   */
  onShow: function () {
    //console.log('onShow');
  },

  /**
   * Lifecycle function--Called when page hide
   */
  onHide: function () {
    console.log('---onHide---');
  },
  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {
    /*暂时不支持此功能
    //check if any changed
    if(this.data.flag=='btn_editBill_confirm'){
      let prv=this.getPrevPage(1);
      let bill_now=this.createReturnData();
      let updateBank=prv.getUpdateBank();

      let up_all_idx = updateBank.data_index;
      let up_bank_idx = updateBank.bank_index;
      let up_bill_idx = updateBank.bill_index;
      let toUpdateAll = prv.data.all[up_all_idx];

      let bill_ori=toUpdateAll.banks[up_bank_idx].bills[up_bill_idx];
      let change=prv.checkBillChange(bill_ori,bill_now);      
      //check if change
      if(change){
        console.log('changed!!!!')
        this.setData({showChangeComfirm:true});
      }else{
        console.log('not changed---')
      }
    }*/
  },

  /**
   * Page event handler function--Called when user drop down
   */
  onPullDownRefresh: function () {

  },

  /**
   * Called when page reach bottom
   */
  onReachBottom: function () {
    
  },

  /**
   * Called when user click on the top right corner to share
   */
  onShareAppMessage: function () {
    console.log('---onShareAppMessage---');
  },








});