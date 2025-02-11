// components/tab-bar/tab-bar.js
const app = getApp();
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
    occupyed:false,//服务器是否占用
    tableAnimation: null,
    collapseAnimation: null,
    case: 0,
    ready: false,
    showChoosePanel: false,
    showCollapse:false,
    choosePanelButtons: [{
        type: 'default',
        className: '',
        text: '单张照片',
        value: 0
      },
      {
        type: 'default',
        className: '',
        text: '照片墙',
        value: 1
      }
    ],
    elementItems:[],
    confirmSvg:{},
    confirmMask:{}
  },
  attached() {
    // 组件附加时执行的操作
    this.initializeSvgConfirm();
  },

  /**
   * 组件的方法列表
   */
  methods: {
    initializeSvgConfirm(){
      var confirmSvg ={}
      for(var i=0;i<44;i++)
      {
        confirmSvg[i] = false;
      }
      confirmSvg[200] = false;
      confirmSvg[201] = false;

      this.setData({
        confirmSvg:confirmSvg
      })
    },
    //恢复mask选中
    initializeMaskConfirm() {
     var confirmMask ={}
      for(var i=0;i<6;i++)
      {
        confirmMask[i] = false;
      }
      confirmMask[200] = false;

      this.setData({
        confirmMask:confirmMask
      })
    },
    //切换两个元素
    onButtonClick(e) {
      this.showCollapseHandler(false)
      var btnId = e.currentTarget.dataset.id;
      var num = parseInt(btnId.substr(btnId.search(/\d/)));
      if (num == 0) { //如果按了elements按钮
        // TODO: 处理按钮1点击事件
        if (this.data.case != 1) { //如果之前不是这个case，就启动
          this.setData({
            case: 1,
            btn0Border: '3',
            btn1Border: '0'
          })
          
        } else if (this.data.case == 1) { //否则关闭
          this.setData({
            btn0Border: '0',
            case: 0,
          })
          
        }

      } else if (num == 1) { //如果按了masks按钮
        // TODO: 处理按钮2点击事件
        if (this.data.case != 2) { //如果之前不是这个case，就启动
          this.setData({
            btn1Border: '3',
            btn0Border: '0',
            case: 2,
          })
          
        } else if (this.data.case == 2) { //否则关闭
          this.setData({
            btn1Border: '0',
            case: 0
          })
          
        }

      }
      if (this.data.case > 0) {
        this.showTableHandler(true)
      } else
        this.showTableHandler(false)
      //取消绘制，因为切换了
      this.triggerEvent('dontDraw');
      this.setData({
        drawbtn0Border: '0',
        drawbtn1Border: '0'
      })
      //提醒一下主页
      this.triggerEvent('switchCase',{case:this.data.case});
    },
    //点击某个预定svg
    onSvgClick(e) {
      //既然点击了预定的，那就没绘画和上传的事了
      app.globalData.svgImage = [];
      app.globalData.svgKoutu = '';
      app.globalData.svgIndex = app.globalData.svgIndex.filter(item => item !== 200&&item !== 201);
      //样式
      var confirmSvg = this.data.confirmSvg
      confirmSvg[200]=false,
      confirmSvg[201]=false
      this.setData({
        confirmSvg :confirmSvg
      })
      

      var btnId = e.currentTarget.dataset.id;
      var num = parseInt(btnId.substr(btnId.search(/\d/)));

      if (!app.globalData.svgIndex.includes(num)) {
        //改变ui
        var confirmSvg = this.data.confirmSvg
        confirmSvg[num]=true
        this.setData({
          confirmSvg :confirmSvg
        })

        app.globalData.svgIndex.push(num);
      } else {
        //改变ui
        var confirmSvg = this.data.confirmSvg
        confirmSvg[num]=false
        this.setData({
          confirmSvg :confirmSvg
        })
        app.globalData.svgIndex = app.globalData.svgIndex.filter(item => item !== num);
      }
      this.areUReady();
      //取消绘制，因为切换了
      this.triggerEvent('dontDraw');
      this.setData({
        drawbtn0Border: '0',
        drawbtn1Border: '0'
      })
    },
    //点击某个预定mask
    onMaskClick(e) {
      this.initializeMaskConfirm();

      var btnId = e.currentTarget.dataset.id;
      var num = parseInt(btnId.substr(btnId.search(/\d/)));

      if (num != app.globalData.maskIndex) {
         //样式
        var confirmMask = this.data.confirmMask
        confirmMask[num]=true,
        this.setData({
          confirmMask :confirmMask
        })
        app.globalData.maskIndex = num;
        app.globalData.maskImage = '';
      } else {
        app.globalData.maskIndex = -1;
      }

      this.areUReady();
      //取消绘制，因为切换了
      this.triggerEvent('dontDraw');
      this.setData({
        drawbtn0Border: '0',
        drawbtn1Border: '0'
      })
    },
    //点击绘制按钮函数
    onDrawBtnClick(e) {
      //关窗
      this.showCollapseHandler(false)

      //先清空
      if (this.data.case == 1) {
        this.initializeSvgConfirm();
        app.globalData.svgIndex = []
        app.globalData.svgImage = []
        app.globalData.svgKoutu = ''
      } else if (this.data.case == 2) {
        this.initializeMaskConfirm();
        app.globalData.maskIndex = -1
        app.globalData.maskImage = ''
      }

      var btnId = e.currentTarget.dataset.id;
      var num = parseInt(btnId.substr(btnId.search(/\d/)));
      if (num == 0) {
        if (this.data.drawbtn0Border == '0') {
          this.triggerEvent('drawSvg');
          this.setData({
            drawbtn0Border: '2'
          })
        } else {
          this.triggerEvent('dontDraw');
          this.setData({
            drawbtn0Border: '0'
          })
        }

      } else {
        if (this.data.drawbtn1Border == '0') {
          this.triggerEvent('drawMask');
          this.setData({
            drawbtn1Border: '2'
          })
        } else {
          this.triggerEvent('dontDraw');
          this.setData({
            drawbtn1Border: '0'
          })
        }
      }
      this.areUReady();
    },
    //点击上传按钮函数
    onUploadBtnClick(e) {
      const that = this;
      //先清空
      if (this.data.case == 1) {
        this.initializeSvgConfirm();
        app.globalData.svgIndex = []
        app.globalData.svgImage = []
        app.globalData.svgKoutu = ''
      } else if (this.data.case == 2) {
        this.initializeMaskConfirm();
        app.globalData.maskIndex = -1
        app.globalData.maskImage = ''
      }
      that.areUReady();
      var btnId = e.currentTarget.dataset.id;
      var num = parseInt(btnId.substr(btnId.search(/\d/)));
      if (num == 0) {
        //弹框
        this.setData({
          showChoosePanel: true
        })
      } else if (num == 1) {
        wx.chooseMedia({
          count: 1, // 最多可以选择的文件个数
          mediaType: ['image'], // 文件类型
          sizeType: ['compressed'], // 是否压缩所选文件
          sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          success(result) {
            wx.getFileSystemManager().readFile({ // 读取本地文件内容
              filePath: result.tempFiles[0].tempFilePath,
              encoding: 'base64', //编码格式
              success(res) {
                app.globalData.maskImage = res.data;
                app.globalData.maskIndex = 201
                //样式
                var confirmMask = this.data.confirmMask
                confirmMask[201]=true,
                this.setData({
                  confirmMask :confirmMask
                })
                that.areUReady();
              }
            })
          },
        })
      }


      //取消绘制，因为切换了
      this.triggerEvent('dontDraw');
      this.setData({
        drawbtn0Border: '0',
        drawbtn1Border: '0'
      })
    },
    //页面传来取消绘制的信息
    cancelDraw() {
      if (this.data.case == 1) {
        this.setData({
          drawbtn0Border: '0'
        })
      } else if (this.data.case == 2) {
        this.setData({
          drawbtn1Border: '0'
        })
      }
      this.areUReady();
    },
    //页面传来确定绘制的信息
    confirmDraw() {
      if (this.data.case == 1) {
        //改变ui
        var confirmSvg = this.data.confirmSvg
        confirmSvg[200]=true
        this.setData({
          confirmSvg :confirmSvg
        })
      } else if (this.data.case == 2) {
        //样式
        var confirmMask = this.data.confirmMask
        confirmMask[200]=true,
        this.setData({
          confirmMask :confirmMask
        })
      }
      this.areUReady();
    },
    //二级弹出函数
    showTableHandler: function (state) {
      const tableAnimation = wx.createAnimation({
        duration: 500, // 动画持续时间
        timingFunction: 'ease' // 动画效果
      });
      if (state) {
        tableAnimation.translateY('48px').step(); // 移动到目标位置（从左边界弹出）
        this.setData({
          tableAnimation: tableAnimation.export(), // 将动画导出并设置给页面中的元素
        });
      } else {
        tableAnimation.translateY('0px').step();
        this.setData({
          tableAnimation: tableAnimation.export(),
        });
      }

    },
    //collapse弹出函数
    showCollapseHandler: function (state) {
      const collapseAnimation = wx.createAnimation({
        duration: 500, // 动画持续时间
        timingFunction: 'ease' // 动画效果
      });
      if (state) {
        collapseAnimation.translateY('253px').step(); // 移动到目标位置（从左边界弹出）
        this.setData({
          collapseAnimation: collapseAnimation.export(), // 将动画导出并设置给页面中的元素
        });
      } else {
        collapseAnimation.translateY(0).step();
        this.setData({
          collapseAnimation: collapseAnimation.export(),
        });
      }

    },
    //数据准备好的监听
    areUReady() {
      if (app.globalData.svgIndex.length > 0 && app.globalData.maskIndex > -1)
        this.setData({
          ready: true
        })
      else
        this.setData({
          ready: false
        })
      console.log(app.globalData)
      console.log('ready', this.data.ready)
    },
    
    //弹出框的按钮选择
    choosePanelButtontap(e) {
      const that = this;
      this.setData({
        showChoosePanel: false
      })

      if (e.detail.index == 0) {
        //选中单张
        wx.chooseMedia({
          count: 1, // 最多可以选择的文件个数
          mediaType: ['image'], // 文件类型
          sizeType: ['compressed'], // 是否压缩所选文件
          sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
          success(result) {
            wx.getFileSystemManager().readFile({ // 读取本地文件内容
              filePath: result.tempFiles[0].tempFilePath,
              encoding: 'base64', //编码格式
              success(res) {
                app.globalData.svgImage = [res.data];
                wx.navigateTo({
                  url: `/pages/edit/edit?url=${result.tempFiles[0].tempFilePath}&image=${res.data}`
                });
              }
            })
          },
        })
      } else {
        //选中多张
        var base64Images = [];
        wx.chooseMedia({
          count: 10, // 最多可以选择的文件个数
          mediaType: ['image'], // 文件类型
          sizeType: ['compressed'], // 是否压缩所选文件
          sourceType: ['album'], // 可以指定来源是相册还是相机，默认二者都有
          success(result) {
            console.log(result)
            for (var i = 0; i < result.tempFiles.length; i++) {
              wx.getFileSystemManager().readFile({ // 读取本地文件内容
                filePath: result.tempFiles[i].tempFilePath,
                encoding: 'base64', //编码格式
                success(res) {
                  base64Images.push(res.data);
                }
              })
            }
            app.globalData.svgImage = base64Images;
            app.globalData.svgIndex = [201]
            //改变UI
            var confirmSvg = that.data.confirmSvg
            confirmSvg[201]=true
            that.setData({
              confirmSvg :confirmSvg
            })
            that.areUReady();
          },
        })
      }
    },
    //跳转都会触发这个
    edited: function () {
      if (app.globalData.svgKoutu != '') {
        app.globalData.svgIndex = [201]
        //改变UI
        var confirmSvg = this.data.confirmSvg
        confirmSvg[201]=true
        this.setData({
          confirmSvg :confirmSvg
        })

      } 
      else{
        app.globalData.svgImage = []
      }
      this.areUReady();
    },
    //最后上传到服务器
    uploadToServer() {
      // 获取当前时间戳
      const that = this;
      that.setData({
        occupyed : false
      })
      var timestamp = Date.now();
      console.log(timestamp);
      app.globalData.id= timestamp
      wx.request({
        method: 'POST',
        url: 'https://collageminiprogram.szuvis.com/process_data',
        data: {
          svgIndex: app.globalData.svgIndex,
          maskIndex: app.globalData.maskIndex,
          svgImage: app.globalData.svgImage,
          maskImage: app.globalData.maskImage,
          mask:app.globalData.svgKoutu,
          id:timestamp
        },
        success: function (res) {
          console.log(res);
          if(res.data.status=='-1')
          that.setData({
            occupyed : true
          })
        }
      })
      setTimeout(() => {
        if(!that.data.occupyed){
          wx.redirectTo({
            url: '/pages/processing/processing'
          });
        }
        else{
          wx.showToast({
            title: '服务器正在占用，请稍后重试',
            icon: 'none', // 'success', 'loading', 'none'
            duration: 2000 // 显示时间，单位为 ms
          });
        }
      }, 1000); // 2秒后执行
     
    },
    //点击下拉
    collapseTap(){
      if(!this.data.showCollapse){
        this.showCollapseHandler(true)
        this.setElementItems();
        this.data.showCollapse = true
      }
      else{
        this.showCollapseHandler(false)
        this.data.showCollapse = false
      }
    },
    setElementItems(){
      var elementItems = []
      for(var i = 6;i<44;i++){
        var item = {
          index: i,
        };
        elementItems.push(item);

      }
      this.setData({
        elementItems:elementItems
      })
    }
    
  }
})