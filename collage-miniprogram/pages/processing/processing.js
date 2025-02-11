// pages/processing/processing.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    timer: null, // 计时器对象
    resultImage:'',
    progressType:0,
    progress:0,
    progressBarAnimation:null,
    progressBarStatus:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onUnload(){
    // 页面卸载时停止计时器
    clearInterval(this.data.timer);
      app.globalData.lastPage = 2;

  },
  onLoad(options) {
    wx.showToast({
      title: '上传成功',
      icon: 'success', // 'success', 'loading', 'none'
      duration: 2000 // 显示时间，单位为 ms
    });
    //先清空
      app.globalData.svgIndex = []
      app.globalData.maskIndex = -1
      app.globalData.svgImage = []
      app.globalData.svgKoutu = ''
      app.globalData.maskImage = ''

    // 创建定时器，每隔5秒执行一次请求
    this.data.timer = setInterval(() => {
      this.getProgress();
    }, 3000);
  },
  
  getProgress: function () {
    const that = this;
    // 发起 wx.request 请求
    wx.request({
      url: `https://collageminiprogram.szuvis.com/get_progress?id=${app.globalData.id}`,
      method: 'GET', // 请求方法
      success: function (res) {
        console.log('请求成功', res);
        const base64Image = res.data.photo_base64
        that.setData({
          resultImage: base64Image,
          progressType:res.data.progress.type,
          progress:res.data.progress.steps
        });
        if(that.data.progressType==0){//预处理
        that.showProgressBarHandler(that.data.progress)
        that.setData({
          progressBarStatus:that.data.progress
        })
      }
        
        else if(that.data.progressType==1){//运行
          that.showProgressBarHandler(that.data.progressBarStatus + Math.round( (100-that.data.progressBarStatus)*(that.data.progress)/100) )
        }
        if(base64Image!=''){
          clearInterval(that.data.timer);
          app.globalData.id = -1
        }
      }
    });
  },
  saveImage: function () {
    if(this.data.resultImage!=''){
      const imageUrl = this.data.resultImage; // 替换为你的 Base64 数据
        // 下载图像并保存到本地
        wx.downloadFile({
          url: imageUrl, // 直接使用 HTTP 路径
          success: (res) => {
              if (res.statusCode === 200) {
                   // 将文件保存到相册
                   wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: () => {
                        wx.showToast({
                            title: '保存成功！',
                            icon: 'success',
                            duration: 2000
                        });
                    },
                    fail: (saveError) => {
                        console.error('保存到相册失败:', saveError);
                        wx.showToast({
                            title: '保存失败，请重试。',
                            icon: 'none',
                            duration: 2000
                        });
                    }
                });
              }
          },
          fail: (downloadError) => {
              console.error('Failed to download image:', downloadError);
          }
      });
    }else
    {
      wx.showToast({
        title: '等待有结果后才能保存！',
        icon: 'none', // 'success', 'loading', 'none'
        duration: 2000 // 显示时间，单位为 ms
      });
    }
    
  
  },
  preview(){
    if(this.data.resultImage!='')
    wx.previewImage({
      urls: [this.data.resultImage],
      showmenu: true,
      success: (res) => {},
      fail: (res) => {},
      complete: (res) => {console.log(res)},
    })
  },
  //进度条动画函数
  showProgressBarHandler: function (status) {
    const progressBarAnimation = wx.createAnimation({
      duration: 500, // 动画持续时间
      timingFunction: 'ease' // 动画效果
    });
    if (status>0) {
      progressBarAnimation.width(status+'vw').step(); // 移动到目标位置（从左边界弹出）
      this.setData({
        progressBarAnimation: progressBarAnimation.export(), // 将动画导出并设置给页面中的元素
      });
    } 

  },
  
})