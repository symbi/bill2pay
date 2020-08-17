// miniprogram/pages/manage/manage.js
Page({

  /**
   * Page initial data
   */

  data: {
    records: [],
    keys:[],
    lastSlideSender: null
  },
   /**
   * cell绑定事件,删除触发
   */
  deleteAction: function (e) {
    //拿到角标
    var row = e.detail.row;
    wx.showToast({
      icon:'none',
      title: 'index='+row,
    })
    let key=e.currentTarget.id;
    console.log("deleteAction : ",key);
    let that=this;
    //delete storage by key
    wx.removeStorage({
      key: key,
      success: (result)=>{
        that.onLoad();
      },
      fail: ()=>{},
      complete: ()=>{}
    });
    
  },
  /**
   * cell绑定事件,滑动触发
   */
  slideAction: function (e) {
    //拿到角标
    var row = e.detail.row;
    //获取角标cell
    var slideSender = this.selectComponent("#slideitem-" + row);
    //在data中定义lastSlideSender 属性,用户记录上一个打开的cell
    var lastSlideSender = this.data.lastSlideSender;
    //如果存在已经打开的cell则关闭
    if (lastSlideSender != null && lastSlideSender != slideSender) {
      lastSlideSender.restoreSalid();
    }
    this.setData({
      lastSlideSender: slideSender
    })
  },
  selectCellAction: function(e){
    wx.reLaunch({
      url:'../index/index?id='+this.data.keys[e.currentTarget.id],
      success:function(){}, //接口调用成功的回调函数
      fail:function(){}, //接口调用失败的回调函数
      complete:function(){} //接口调用结束的回调函数（调用成功、失败都会执行）
    });
  },
  slideButtonTap(e) {
    console.log(e.detail)
  },
  toNote(e) {
    console.log("toNote");
    /*let id = e.currentTarget.dataset['id'];
    wx.navigateTo({
      url: '/pages/note/editor?id=' + id
    })*/
  },

  createNameByKey: function(pKey){
    var ret=pKey.split('_');
    return ret[0]+'年'+ret[1]+'月';
  },
  /**
   * Lifecycle function--Called when page load
   */
  onLoad: function (options) {
    let keys=(wx.getStorageInfoSync().keys).reverse();
    let that=this;
    let names=[];
    keys.forEach(function(key, index) {
      names[index]=that.createNameByKey(key);
    });
    console.log("names:",names);
    console.log("keys:",keys);
    this.setData({records:names,
                  keys:keys});
  },
  navigateToItem: function(pKeys){
    wx.navigateTo({
      url:'../item/item?'+pKeys,
      success:function(res){
        console.log("navigateTo success");
      },
      fail:function(){
        //fail
      },
      complete:function(){
        //complete
      }
    });
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

  },

  /**
   * Lifecycle function--Called when page unload
   */
  onUnload: function () {

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

  },


  //滑动切换
  swiperTab: function (e) {
    var that = this;
    that.setData({
      currentTab: e.detail.current
    });
  },
  //点击切换
  clickTab: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current
      })
    }
  }
})