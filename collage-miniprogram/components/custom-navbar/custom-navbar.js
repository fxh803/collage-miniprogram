// pages/custom-navbar.js
// 在页面或组件中获取全局数据
const app = getApp();
const globalData = app.globalData;
Component({

  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    statusBarHeight : 0,
    navHeight:0,
   status:0 //0为主页面，1为edit，2为preprocessing
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleButtonClick: function () {
      if(this.data.status==0)
      this.triggerEvent('showPopup');
      else if(this.data.status==1){
        // 在目标页面中返回到上一个页面
      wx.navigateBack({
        delta: 1 
      });
      }
      else if(this.data.status==2){
        // 在目标页面中返回到上一个页面
      wx.redirectTo({
        url: '/pages/index/index',
      })
      }
    },

  
  detectPage: function(){
     // 获取当前页面栈信息
     var pages = getCurrentPages();
     var currentPage = pages[pages.length - 1];
     if (currentPage.route === 'pages/index/index') {
       this.setData({
         status: 0,
       });
     } else if(currentPage.route === 'pages/edit/edit') {
       this.setData({
        status: 1,
      });
     }
     else if(currentPage.route === 'pages/processing/processing') {
      this.setData({
       status: 2,
     });
    }
   },
  },

  attached: function () {
    this.detectPage();
    this.setData({
      statusBarHeight: globalData.statusBarHeight,
      navHeight: globalData.navHeight
     });
  },

  
})