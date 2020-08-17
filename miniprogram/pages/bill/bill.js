const date = new Date()
const years = []
const months = []
const days = []

for (let i = 2019; i <= date.getFullYear(); i++) {
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
    showEditBill:false,
    showAddBill:false,
    showEditBank:false,
    showAddBank:false,
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
    picker_btn:['取消','确定'],
    months: months,
    days: days,
    month: months[3],
    day: days[1],
    val:[1,3],
    val_old:[0,0],
    memo:''

  },
  onShowPickDay: function(){
    this.setData({
      showPickDay:true,
      val_old:this.data.val
    });
    
  },
  onPickerConfirm: function(e){
    console.log("onPickerConfirm e:",e.currentTarget.dataset.index)
    if (e.currentTarget.dataset.index==0)//cancle
      this.setData({val:this.data.val_old});
    else
      this.setData({month:this.data.val[0]+1,day:this.data.val[1]+1});
    this.setData({showPickDay:false});
  },
  bindChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({val:e.detail.value});
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    console.log("onload options.id:",options.id);
    console.log("onload options:",options);
    let ret=options.id.split('-');
    let time;
    switch (options.show){
      case "EditBill":
        time=ret[2].split('_');
        let ret_date=options.date.split('/');
        let month_load=parseInt(ret_date[0]);
        let day_load=parseInt(ret_date[1]);
        console.log("editbill option.date:",options.date);
        this.setData({
          showEditBill:true,
          id:options.id,
          title_year:time[0],
          title_month:time[1],
          name:ret[0],
          toPay:parseInt(options.toPay, 10),
          date:options.date,//todo check date del
          payed:options.payed== 'true',
          month:month_load,
          day:day_load,
          val:[month_load-1,day_load-1],
          val_old:[month_load-1,day_load-1],
          memo:options.memo=="undefined"?'':options.memo,
          flag:'btn_editBill_confirm'
        });
        break;
      case "AddBill":
        console.log("onload AddBill:",options.id)
        time=ret[1].split('_');
        this.setData({
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
      case "AddBank":
        time=ret[0].split('_');
        this.setData({
          showAddBank:true,
          id:options.id,
          title_year:time[0],
          title_month:time[1],
          flag:'btn_addBank_confirm'
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
    console.log('input e.target.id:',e.target.id,', value:',e.detail.value)
  },
  showBillToast:function(pTitle, pIcon){
    if(pIcon!=''){
      wx.showToast({
        title: pTitle,
        duration:3000
      });      
    }
  },
  
  checkNameDuplicated:function(name_new, updateBank){
    for(var i=0;i<updateBank.bills.length;i++){
      if(i!=updateBank.bill_index && updateBank.bills[i].name==name_new){
        //err='账单名字不可重复';
        console.log("checkNameDuplicated duplicated");
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
      
    this.data.date=months[this.data.val[0]]+'/'+days[this.data.val[1]];

    let bill={id:this.data.id,
      name:this.data.name,
      toPay:this.data.toPay,
      date:this.data.date,
      payed:this.data.payed,
      memo:this.data.memo,
      changed:true
    };
    return bill;
  },

  //确定 和 取消 btn
  confirm:function(e){
    let prv=this.getPrevPage(1);
    let showEditBill=this.data.showEditBill;
    let showAddBill=this.data.showAddBill;
    let updateBank=prv.getUpdateBank();
    
    if(this.data.name==''){
      this.showBillToast('必须输入名称','warn');
      return;
    }
    let id=this.data.id;
    let ret=id.split('-');
    let pFlag=e.currentTarget.dataset.status;

    console.log("pFlag:",pFlag);
    let retData;
    switch(pFlag){
      case 'btn_editBill_confirm':
        console.log("btn_editBill_confirm new memo:",this.data.memo);
        let name_ori=ret[0];
        if(this.data.name==name_ori){
          retData=this.createReturnData();
          break;
        }
        
        if(!this.checkNameDuplicated(this.data.name,updateBank)){
          //create id by name
          this.data.id=this.data.name+'-'+ret[1]+'-'+ret[2];
          console.log("btn_editBill_confirm new id:",this.data.id);
          retData=this.createReturnData();
          console.log("check retData:", retData);
        }else{
          this.showBillToast('名称重复','warn');
          return;
        }
        break;        
      case 'btn_addBill_confirm':
        //check if duplicated if not
        if(!this.checkNameDuplicated(this.data.name,updateBank)){
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
      case 'btn_addBank_confirm':
        //todo check duplicate bank name
        let banks=prv.getBanks();
        let duplicate=false;
        for(let i=0;i<banks.length;i++){
          if(banks[i]==this.data.name)duplicate=true;
        }
        if(duplicate){
          this.showBillToast('名称重复','warn');
          return;
        }
        this.data.id=this.data.name+'-'+this.data.id;
        retData={id:this.data.id,
              name:this.data.name
              }
        break;
      case 'btn_delBank_confirm':
        retData={id:this.data.id,
          name:this.data.name
        }
        break;
    }
  
    console.log("comfirm data:",retData);
    wx.navigateBack({complete:function(){
      if(showEditBill)
        prv.editBillDone(retData,e.currentTarget.dataset.status);
      if(showAddBill)
        prv.addBillDone(retData,e.currentTarget.dataset.status);
      if(this.data.showEditBank)
        prv.editBankDone(retData,e.currentTarget.dataset.status);
      if(this.data.showAddBank)
        prv.addBankDone(retData,e.currentTarget.dataset.status);
    }.bind(this)});
    
  },

  cancel:function(){
    wx.navigateBack();
  },
  hideModal:function(){
    this.setData({showDelBank:false});
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