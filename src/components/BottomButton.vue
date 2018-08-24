<template>
  
</template>

<script>
  import { language } from '../../utils/conf.js'
  let buttons = []
  language.forEach(item => {
    buttons.push({
      buttonText: item.lang_name,
      lang: item.lang_content,
      lto: item.lang_to[0],
      msg: item.item.hold_talk,
      buttonType: 'normal'
    })
  })

  let buttonBackground = {
    zh_CN: {
      normal: '../../../static/assets/button_zh.png',
      press: '../../../static/assets/button_zh_press.png',
      disabled: '../../../static/assets/button_zh_disabled.png'
    },
    en_US: {
      normal: '../../../static/assets/button_en.png',
      press: '../../../static/assets/button_en_press.png',
      disabled: '../../../static/assets/button_en_disabled.png'
    }
  }

  export default {
    data () {
        return {
      buttons: buttons,
      buttonBackground: buttonBackground,
      currentButtonType: 'normal',
      buttonDisabled: false
        }
    },

    methods: {
        streamRecord (e) {
          if (this.data.buttonDisavled) {
            return
          }
          wx.stopBackgroundAudio()

          let currentButtonConf = e.currentTarget.dataset.conf
          this.changeButtonType('press', currentButtonConf.lang)
          this.triggerEvent('recordStart', {
            buttonItem: currentButtonConf
          })
        }
    } // end of methods
  }
</script>