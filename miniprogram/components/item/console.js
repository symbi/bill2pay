// components/item/console.js
Component({
  /**
   * Component properties
   */
  properties: {
    content: {
      type: String,
      value: ''
    }
  },
  options: {
    multipleSlots: true     // 启用多slot支持
  },
  /**
   * Component initial data
   */
  data: {

  },

  /**
   * Component methods
   */
  methods: {
    clickMe: function () {                // 根据需求定义事件
      console.log("you have clicked me");
      //使用 triggerEvent 方法，指定事件名、detail对象和事件选项
      this.triggerEvent('myevent', { ctof: 123 });
    }
  }
})
