// app.js
App({
  globalData: {
    svgIndex:[],
    maskIndex:-1,
    svgImage:[],
    maskImage:'',
    svgKoutu:'',
    id:-1,
    lastPage:0,//0为主页，1为edit，2为processing
    navHeight:0,
    statusBarHeight:0
  },
  onLaunch: function () {
    // 应用启动时的逻辑
    this.navHeight()
  },
  navHeight() {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        // console.log(res);
        that.globalData.statusBarHeight = res.statusBarHeight;
        that.globalData.navHeight = wx.getMenuButtonBoundingClientRect().height + 10;
      },
    })
  },

  
})
