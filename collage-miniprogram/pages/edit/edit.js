// pages/edit/edit.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    svgImage: '',
    context: null,
    canvas: null,
    imageWidth: 0,
    imageHeight: 0,
    points: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const that = this;
    const {url,image} = options;
    const systemInfo = wx.getSystemInfoSync();
    const vw = systemInfo.windowWidth
    wx.createSelectorQuery().select('.img-container').boundingClientRect(rect => {
      if (rect) {
        const maxHeight = rect.height
        //获取实际图片长宽
        wx.getImageInfo({
          src: url,
          success(res) {
            if (Math.round(vw * (res.height / res.width)) <= maxHeight) { //如果占满宽度的时候高度不过分
              that.setData({
                imageWidth: vw,
                imageHeight: Math.round(vw * (res.height / res.width))
              })
            } else { //否则高度为限高
              that.setData({
                imageWidth: Math.round(maxHeight * (res.width / res.height)),
                imageHeight: maxHeight
              })
            }
            wx.createSelectorQuery().select('#myCanvas')
            .fields({
              node: true,
              size: true
            })
            .exec((res) => {
              const canvas = res[0].node
              const ctx = canvas.getContext('2d')
              const dpr = wx.getSystemInfoSync().pixelRatio
              canvas.width = that.data.imageWidth * dpr
              canvas.height = that.data.imageHeight * dpr
              ctx.scale(dpr, dpr)
              that.setData({
                context: ctx,
                canvas: canvas
              })
            })
          }
        })
      }
    }).exec();
    // 添加前缀
    const fileType = url.substring(url.lastIndexOf('.') + 1).toLowerCase(); // 获取后缀
    if (fileType === 'png') {
      const imageWithPrefix = 'data:image/png;base64,' + image;
      this.setData({
        svgImage: imageWithPrefix
      });
    } else if (fileType === 'jpg') {
      const imageWithPrefix = 'data:image/jpeg;base64,' + image;
      this.setData({
        svgImage: imageWithPrefix
      });
    } else if (fileType === 'svg') {
      const imageWithPrefix = 'data:image/svg+xml;base64,' + image;
      this.setData({
        svgImage: imageWithPrefix
      });
    }


  },



  onUnload() {
    app.globalData.lastPage = 1;
  },


  //准备画布
  onReady() {
   
  },
  //3个画布监听
  onTouchStart(event) {

    this.data.context.clearRect(0, 0, this.data.canvas.width, this.data.canvas.height);
    this.data.points = []
    this.data.context.lineWidth = 3;
    this.data.context.lineJoin = 'round';
    this.data.context.strokeStyle = 'rgba(17, 170, 102, 0.7)';
    this.data.context.fillStyle = 'rgba(17, 170, 102, 0.5)';
    this.data.context.beginPath(); // 开始新的路径
    this.data.context.moveTo(event.touches[0].x, event.touches[0].y);
  },

  onTouchMove(event) {
    this.data.context.lineTo(event.touches[0].x, event.touches[0].y);
    this.data.context.stroke();
    const {
      x,
      y
    } = event.touches[0];
    this.data.points.push({
      x,
      y
    }); // 记录当前点
  },

  onTouchEnd(event) {
    // 绘画结束时的处理
    this.data.context.fill();
    this.data.context.closePath();
    this.data.context.stroke();
  },
  //导出画布内容
  exportMask() {
    if (this.data.points.length > 0) {

      app.globalData.svgKoutu = this.data.canvas.toDataURL('image/png').split(',')[1]
      // 在目标页面中返回到上一个页面
      wx.navigateBack({
        delta: 1 // 返回的页面数，1 表示返回上一个页面
      });
    } else {
      wx.showToast({
        title: '请绘制后再提交',
        icon: 'none', // 'success', 'loading', 'none'
        duration: 2000 // 显示时间，单位为 ms
      });
    }

  }

})