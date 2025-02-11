const app = getApp()
const panelAnimation = wx.createAnimation({
  duration: 500, // 动画持续时间
  timingFunction: 'ease' // 动画效果
});
const toolbarAnimation = wx.createAnimation({
  duration: 500, // 动画持续时间
  timingFunction: 'ease' // 动画效果
});
Page({
  data: {
    context: null,
    canvas: null,
    drawing: false,
    rgb: 'rgb(0,0,0)',
    pick: false,
    case: 0,
    toolBarAnimation: null,
    panelAnimation:null,
    popupHeight:0,
    showPanel:false,
    points: [],
    _points: [],
    colors: [],
    beginDialogShow:false,
    beginDialogButtons: [{
      type: 'default',
      className: '',
      text: '退出',
      value: 0
    },
    {
      type: 'default',
      className: '',
      text: '继续',
      value: 1
    }
  ]
    
  },
  //组件触发的绘制svg
  drawSvg() {
    this.setData({
      drawing:true
    })
    this.showToolbarHandler(true)
  },
  //组件触发的绘制mask
  drawMask() {
    this.setData({
      rgb: 'rgb(0,0,0)'
    })
    this.setData({
      drawing:true
    })
    this.showToolbarHandler(true)
  },
  //组件触发的别画了
  dontDraw() {
    this.setData({
      drawing:false
    })
    if(this.data.points.length>0)
    this.data.context.clearRect(0, 0, this.data.canvas.width, this.data.canvas.height);
    this.showToolbarHandler(false)
    this.data.points = []
    this.data.colors = []
  },
  //点击左下绘图取消
  cancelBtnClick() {
    this.dontDraw();
    const component = this.selectComponent('.tab-bar');
    if (component) {
      component.cancelDraw(); // 调用组件的函数
    }
  },
  //准备画布
  onReady() {
    const query = wx.createSelectorQuery()
    query.select('#myCanvas')
      .fields({
        node: true,
        size: true
      })
      .exec((res) => {
        const canvas = res[0].node
        const ctx = canvas.getContext('2d')

        const dpr = wx.getSystemInfoSync().pixelRatio
        canvas.width = res[0].width * dpr
        canvas.height = res[0].height * dpr
        ctx.scale(dpr, dpr)
        this.setData({
          context: ctx,
          canvas: canvas
        })
      })
  },
//3个画布监听
  onTouchStart(event) {
    if (this.data.drawing) {
      this.data.context.lineWidth = 5;
      this.data.context.fillStyle = this.data.rgb;
      this.data.context.strokeStyle = this.data.rgb;
      this.data.context.lineJoin = 'round';
      this.data.context.beginPath(); // 开始新的路径
      this.data.context.moveTo(event.touches[0].x, event.touches[0].y);
     
      const {
        x,
        y
      } = event.touches[0];
      this.data.colors.push(this.data.rgb);
      this.data._points.push({
        x,
        y
      }); // 记录当前点
    }

  },

  onTouchMove(event) {
    if (this.data.drawing) {
      this.data.context.lineTo(event.touches[0].x, event.touches[0].y);
      this.data.context.stroke();
      const {
        x,
        y
      } = event.touches[0];
      this.data._points.push({
        x,
        y
      }); // 记录当前点
    }
  },

  onTouchEnd(event) {
    if (this.data.drawing) {
      // 绘画结束时的处理
      this.data.context.closePath();
      this.data.context.stroke();
      this.data.context.fill();
      this.data.points.push(this.data._points); //放入大数组
      this.data._points=[]
    }
  },
  //toolbar弹出函数
  showToolbarHandler: function (state) {
    if (state) {
      toolbarAnimation.translateY('-50px').step(); // 移动到目标位置（从左边界弹出）
      this.setData({
        toolbarAnimation: toolbarAnimation.export(), // 将动画导出并设置给页面中的元素
      });
    } else {
      toolbarAnimation.translateY('0px').step();
      this.setData({
        toolbarAnimation: toolbarAnimation.export(),
      });
    }

  },
  //开始选择颜色
  toPick: function () {
    this.setData({
      pick: true
    })
    //暂时清空canvas
    setTimeout(() => {
      this.data.context.clearRect(0, 0, this.data.canvas.width, this.data.canvas.height);
    }, 100);
    

  },
  pickColor(e) {
    this.setData({
      rgb: e.detail.color
    })
  },
  //颜色选择器关闭
  pickClose() {
    // 遍历points数组重新绘制
    for (let i = 0; i < this.data.points.length; i++) {

      
      this.data.context.lineWidth = 5;
      this.data.context.lineJoin = 'round';
      this.data.context.fillStyle = this.data.colors[i];
      this.data.context.strokeStyle = this.data.colors[i];
      this.data.context.beginPath();
      for (let j = 0; j < this.data.points[i].length; j++) {
        const point = this.data.points[i][j];
        if (j === 0) {
          this.data.context.moveTo(point.x, point.y); // 移动到起始点
        } else {
          this.data.context.lineTo(point.x, point.y); // 连接到下一个点
          this.data.context.stroke();
        }
      }
        this.data.context.closePath();  
        this.data.context.stroke();
        this.data.context.fill();
           
    }
  },
  //右下提交按钮
  submitBtnClick() {
    if (this.data.points.length > 0) { //如果有图案
      if (this.data.case == 1) {
        app.globalData.svgImage = [this.data.canvas.toDataURL('image/png').split(',')[1]]
        app.globalData.svgIndex = [200];
      } else if (this.data.case == 2) {
        app.globalData.maskImage = this.data.canvas.toDataURL('image/png').split(',')[1]
        app.globalData.maskIndex = 200;
      }

      this.dontDraw();
      const component = this.selectComponent('.tab-bar');
      if (component) {
        component.cancelDraw(); // 调用组件的函数
        component.confirmDraw();
      }
    } else {
      wx.showToast({
        title: '请绘制后再提交',
        icon: 'none', // 'success', 'loading', 'none'
        duration: 2000 // 显示时间，单位为 ms
      });
    }

  },
  //如果从edit返回或者processing 或一开始打开
  onShow: function() {
    if(app.globalData.lastPage==1){
      const component = this.selectComponent('.tab-bar');
      if (component) {
        component.edited(); // 调用组件中的函数
      }
    }
    else if(app.globalData.lastPage==2){
      // 发起 wx.request 请求
      wx.request({
        url: "https://collageminiprogram.szuvis.com/stop_process",
        method: 'POST', 
        data:{
            id:app.globalData.id
        },

        success: function (res) {
          console.log('已发送停止', res); 
        }
      });
      app.globalData.id = -1
    }
    else if(app.globalData.lastPage==0){
      // 发起 wx.request 请求，问有没有在执行
      const that = this;
      wx.request({
        url: "https://collageminiprogram.szuvis.com/get_working",
        method: 'GET', 
        success: function (res) {
          console.log(res); 
          if(res.data.working){
            setTimeout(() => {
              that.setData({
                beginDialogShow:true
              })
            }, 500);
          }

        }
      });
    }

    app.globalData.lastPage=0
  },
  tapBeginDialogButton(e){
    if(e.detail.index==1){
      this.setData({
        beginDialogShow:false
      })
    }else{
      wx.exitMiniProgram({
        success: function() {
        },
        fail: function() {
        }
      })

    }

  },
  switchCase(e) {
    const caseValue = e.detail.case; // 获取传递的值
    this.setData({
      case:caseValue
    })
  },
  onShareAppMessage: function (res) {
    return {
      title: 'CollageVis图片拼贴工具',
      path: '/pages/index/index', // 分享的页面路径
      success: function (res) {
        // 分享成功的回调
      },
      fail: function (res) {
        // 分享失败的回调
      }
    }
  },
  onShareTimeline: function () {
    return {
      title: 'CollageVis图片拼贴工具',
    }
  },
  //左侧框弹出动画实现
  showPopupHandler: function () {
    var that = this;
    //计算弹出宽
    var windowWidth = wx.getSystemInfoSync().windowWidth;
    if (!this.data.showPanel) {
      var headHeight = app.globalData.statusBarHeight + app.globalData.navHeight;
      var windowHeight = wx.getSystemInfoSync().windowHeight;
      var popupHeight = windowHeight - headHeight;

      panelAnimation.translateX(windowWidth).step(); // 移动到目标位置（从左边界弹出）
      that.setData({
        popupHeight: popupHeight,
        showPanel: true,
        panelAnimation: panelAnimation.export(), // 将动画导出并设置给页面中的元素
      });
    } else {
      panelAnimation.translateX(0).step();
      that.setData({
        panelAnimation: panelAnimation.export(),
        showPanel: false
      });
    }

  },
    //点击弹出框右侧关闭
    touchPopupRight: function (e) {
      const that = this;
      const clientX = e.detail.x;
      wx.createSelectorQuery().select('.popup-container').boundingClientRect(function (rect) {
        const elementWidth = rect.width;
        const rightBoundary = rect.left + (0.68 * elementWidth); // 计算右边 20% 的边界
        if (clientX >= rightBoundary) {
          // 用户点击在右边区域内
          that.showPopupHandler();
        }
      }).exec();
    },
    // 点击复制
  copywxtap: function () {
    wx.showToast({
      title: '内容已复制',
      icon: 'none', // 'success', 'loading', 'none'
      duration: 3000 // 显示时间，单位为 ms
    });

	// 下方为微信开发文档中的复制 API
    wx.setClipboardData({
      data: 'http://175.178.152.10:8848', //复制的数据
      success: function (res) {
        console.log(res)
      }
    })
  },


});