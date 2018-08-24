<template>
    <!-- <ul class="footer-box-bottom">
      <div class="wrapper" style="background: red;">
      <div class="result">
        <p>{{ originText }}</p>
      <p>{{ sendTextContent}}</p>
      </div>
      <div>
        <view @click="playTranslateVoice2" >
         <button class="play-btn">Play</button>
        </view>
      </div>
    </div>
      
      <li class="bottom-item" @touchstart='streamRecord(2)' @touchend='streamRecordEnd()'>
     
      
      
      <button type="primary" style=" width:80%; margin: auto; margin-top: 100px;">{{recordText}}</button>
      

    </li>
 
  </ul>  -->

  <div class="container">
    <div class="page">
    
        <div class="result-wrapper">
          <div class="result">
            <div class="origin-text">
            <p>{{ originText }}</p>
          </div>
          <div class="send-text-content">
            <p>{{ sendTextContent}}</p>
          </div>
          </div>

          
            <button  class="play-btn" @catchtap="playTranslateVoice2" @click="playTranslateVoice2">Play</button>
          
        </div>

        <div class="record" @touchstart='streamRecord(2)' @touchend='streamRecordEnd()' >
          <div>
            <button type="primary" style=" width:80%; margin: auto; margin-top: 100px;" class="record-btn">{{recordText}}</button>
          </div>
          <div class="instruction">
            <p>Hold to  record your voice and translate to chinese, then click the play button to play the chinese translation.</p>
          </div>
        </div>


    </div>
  </div>

 
</template>

<script type="text/ecmascript-6">
/* eslint-disable */
  // 获取**全局唯一**的语音识别管理器**recordRecoManager**
  const plugin = requirePlugin('WechatSI');
  const manager = plugin.getRecordRecognitionManager();
  import { language } from '../../utils/conf.js'
  import { recordTime } from '../../utils/index.js'

  export default {
    data () {
      return {
        dialogList: [],
        currentTranslateVoice: '', // 当前播放语音路径 Current playing voice path
        sendTextContent: 'chinese translation here', // 展示的语音内容 Displayed voice content
        connectNum: 0,
        scroll_top: 10000,
        bottomButtonDisabled: false,
        tips_language: language[0],
        initTranslate: {
          create: '04/27 15:27',
          text: 'Speak'
        },
        currentTranslate: {
          create: '04/27 15:27',
          text: 'Speak'
        },
        recording: false,
        recordStatus: 0, // 0 recording, 1 translating 2 done translating 
        toView: 'fake',
        lastId: -1, // dialogList last item id 
        currentTranslateVoice: '', // path to the current playing recording
        translatedVoiceExpiredTime: 0,
        translateVoicePath: '',
        originText: 'english voice recording here',
        recordText: 'Start Recording', // the text of the recording button
        recordType: 0 // 录音类型：0，中文录音；1，中文翻译英文；2，英文翻译中文
      }
    },
    onLoad () {
      this.getRecordAuth()
    },
    mounted( ) {
      this.initRecord()
    },
    methods: {
      // 权限询问
      getRecordAuth () {
        wx.getSetting({
          success (res) {
            console.log('succ')
            console.log(res)
            if (!res.authSetting['scope.record']) {
              wx.authorize({
                scope: 'scope.record',
                success() {
                    // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
                    console.log("succ auth")
                }, fail() {
                    console.log("fail auth")
                }
              })
            } else {
              console.log("record has been authed")
            }
          }, fail(res) {
              console.log("fail")
              console.log(res)
          }
        })
      },
      /**
       * 初始化语音识别回调
       * 绑定语音播放开始事件
       */
      initRecord: function() {
        //有新的识别内容返回，则会调用此事件
        manager.onRecognize = (res) => {
          console.log('what is result in record: ', res)
          let currentData = Object.assign({}, this.sendTextContent, {
                            text: res.result,
                          })
          this.sendTextContent = res.result;
          this.recordText = 'Start Recording'
        }

        // 识别结束事件
        manager.onStop = (res) => {

          let text = res.result
          console.log('识别结束');
          console.log(res);
          this.sendTextContent = res.result;
          this.recordText = 'Start Recording'
          if (this.recordType) {
            this.translateText(res.result)
          }
        }

        // 识别错误事件
        manager.onError = (res) => {
          this.recordText = 'Error! Start Again'
          console.log(res);
        }

        // 语音播放开始事件
        wx.onBackgroundAudioPlay(res=>{

          const backgroundAudioManager = wx.getBackgroundAudioManager()
          let src = backgroundAudioManager.src
          this.currentTranslateVoice = src;

          console.log('currentTranslateVoice: what is it? ', this.currentTranslateVoice)
        })
      },

      playTranslateVoice () {
        let play_path = this.translateVoicePath
        console.log('in play translate func: path -->', play_path)
        if (!play_path) {
          console.log('nothing to play')
          return
        }
        wx.playBackgroundAudio({
          dataUrl: play_path,
          title: '',
          success: res => {

          }
        })
      },

      playTranslateVoice2 () {
        let play_path = this.translateVoicePath
        console.log('in play translate func: path -->', play_path)
        if (!play_path) {
          console.log('nothing to play')
          return
        }
        this.recordText = 'Start Recording'
        const back = wx.getBackgroundAudioManager()
        back.src = play_path
        back.title = ''
        back.play()
      },
      /**
       * 按住按钮开始语音识别
       */
      streamRecord: function(type) {
        
        // clear the background sound first
        let param;
        wx.stopBackgroundAudio();
        this.recordType = type;
        let lfrom =  this.recordType === 1 ? 'zh_CN' : 'en_US';
        let lto = this.recordType === 1 ? 'en_US':'zh_CN';
        if (type == 2) {
          param = 'en_US';
        } else {
          param = "zh_CN";
        }
        manager.start({
          lang: param,
        })
        this.recordText = 'Recording...'
        this.recordStatus = 0
        this.recording = true
        this.currentTranslate = {
          create: recordTime(new Date()),
          text: 'Now Recording',
          lfrom: lfrom,
          lto: lto
        }


      },
      /**
       * 松开按钮结束语音识别
       */
      streamRecordEnd: function(e) {
        if (!this.recording || this.recordStatus != 0) {
          this.recordText = 'Start Recording'
          console.warn('has finished')
          return
        }
        manager.stop()

      },
      /**
       * 翻译
       */
      translateText: function(text) {
        let lfrom =  this.recordType === 1 ? 'zh_CN' : 'en_US';
        let lto = this.recordType === 1 ? 'en_US':'zh_CN';



        plugin.translate({
          lfrom: lfrom,
          lto: lto,
          content: text,
          tts: true,
          success: (resTrans)=>{
            console.log('translated result: ', resTrans);
            let passRetcode = [
              0, // 翻译合成成功
              -10006, // 翻译成功，合成失败
              -10007, // 翻译成功，传入了不支持的语音合成语言
              -10008, // 翻译成功，语音合成达到频率限制
            ]

            if(passRetcode.indexOf(resTrans.retcode) >= 0 ) {
              this.sendTextContent = resTrans.result
              this.originText = resTrans.origin
              console.log('the translated text: ', this.sendTextContent)
              this.autoPlay = true
              this.translateVoicePath = resTrans.filename || ''
              console.log('translated voice path: ', this.translateVoicePath)
              this.translatedVoiceExpiredTime = resTrans.expired_time || 0
              console.log('translated voice expire time: ', this.translatedVoiceExpiredTime)
            } else {
              console.warn("translation failure", resTrans, item)
            }

          },
          fail: function(resTrans) {
            this.recording = false
            console.error("调用失败",resTrans, item)
          },
          complete: resTrans => {
            this.recordStatus = 1
            this.recordText = 'Start Recording'
            wx.hideLoading()
          }
        })

      },

    }
  }
</script>

<style>
  .container {
    min-height: 100%;
    margin: 0;
    padding: 0;
    background: #eeeeee;
  }
  .page {
    position: relative;
    overflow : hidden;
    width: 100%;
  }

  .result {
    display: flex;
    flex-direction: column;

  }
.result p {
      margin-bottom: 10px;
    padding: 30px;
    font-size: 14px;
    line-height: 14px;
    background: #fff;
}
.play-btn {
  background: #39b54a;
  color: #fafafa;
  margin: 10px 2px 50px 300px;
  font-family: Arial;
}
.record-btn {
  background: #39b54a;
  text-shadow: 3px 2px 1px #9daef5;
  -webkit-box-shadow: 6px 5px 24px #666666;
  -moz-box-shadow: 6px 5px 24px #666666;
  box-shadow: 6px 5px 24px #666666;
font-family: Arial;
  color: #fafafa;
  text-decoration: none;
}
.instruction p {
  margin: 10px 2px 0 2px;
  font-size: 16px;
  line-height: 1.2;
  font-family: Arial;

}
</style>