// components/inputitem.js
Component({
  /**
   * Component properties
   */
  /**
   * 组件的属性列表
   */
  properties: {
    cellWidth: {
      type: String,
      value: '100%'
    },
    inputValue: {
      type: String,
      value: ''
    },
    inputType: {
      type: String,
      value: 'text'
    },
    inputHint: {
      type: String,
      value: ''
    },
    inputAlign: {
      type: String,
      value: 'left'
    },
    inputGrey: {
      type: Boolean,
      value: true
    },
  },

  /**
   * Component initial data
   */
  data: {
    keyboard: false,
    isClearShow: false,
    inputValue: '', //clear tap will clear input value
    value: ''
  },

  /**
     /**
      * 组件的方法列表
      */
  methods: {
    inputFocus: function(e){
      console.log('inputFocus---:',e.detail.value);
      this.setData({
        isClearShow: true,
        value: e.detail.value
        //keyboard:true
      });
    },
    inputBlur: function(e){
      console.log('inputBlur--',this.data.isClearShow);
      this.setData({
        isClearShow: false,
      //  keyboard: true,
      });
    },
    inputListener: function (e) {
      var value = e.detail.value;
      var cursor = e.detail.cursor;
      if (value === null || value === undefined || value.length === 0) {
        this.setData({
          isClearShow: false
        });
      } else {
        this.setData({
          isClearShow: true
        });
      }
      var detail = {
        value: value,
        cursor: cursor
      };
      this.triggerEvent('inputListener', detail);
    },

    inputConfirm: function (e) {
      console.log("inputconfirm----no use yet");
      var value = e.detail.value;
      var detail = {
        value: value
      }
      this.triggerEvent('inputConfirm', detail);
    },

    clearTap: function (e) {
      //console.log("clearTap:",this.data.value, this.data.isClearShow);
      //if(this.data.isClearShow){
        this.setData({
          inputValue: '',
          //keyboard:true,
          isClearShow: false
        });
      //}
    }
  }
})