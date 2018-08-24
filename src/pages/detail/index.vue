<template>
  <scroll-view>
    <div class="blogdetail">
        <loading :hidden="loading">
            fetching data...
        </loading>
        <div class="page">
            <div class="blog-detail">
                <div class="blog-detail-contaner">
                    <div class="header">
                        <div class="header-cover no-cover">
                            <div class="caption">
                                <h1 class="titl">{{detail.title}}</h1>
                                <p class="time">Posted:<span>{{detail.createdAt}}</span></p>
                            </div>
                        </div>
                    </div>
                    <div class="article-section">

                        <div class="article markdown-body">
                            <wxParse :content="detail.content"/>
                        </div>
                    </div>
                </div>
                <div class="page-tail">
                    <block v-if="userData">
                        <form @submit="submit" report-submit='true'>
                            <div class="resp-input-cell">
                                <input class="resp-input" v-model="message" type="text" placeholder="enter comment..."
                                       @input="bindCommentMessageInput"/>
                            </div>
                            <div class="like-btn">
                                <image v-if="collect" class="like-btn-img" src="../../static/assets/collect.png" @click="_collectAction('noCollect')"></image>
                                <image v-else class="like-btn-img" src="../../static/assets/no-collect.png" @click="_collectAction('collect')"></image>
                            </div>
                            <button class="resp-btn" type="primary" formType="submit">Send</button>
                        </form>
                    </block>
                    <div v-else class="need-login" @click="switchTab">Please Login</div>
                </div>
                <div :style="'padding: 20px 10px;display:'+show ">
                    <div class="resp-head">Total comments（{{ comments.length }}）</div>
                    <div class="comment" v-for="(comment, index) in comments" :key="index">
                        <div class="comment-info">
                            <div class="comment-author">
                                <div>
                                    <image class="comment-author-icon" :src="comment.replyer.userPic"></image>
                                </div>
                                <div class="comment-author-info">
                                    <div>{{ comment.replyer.nickName }}</div>
                                    <div style="margin-top: 5px;">{{ comment.createdAt }}</div>
                                </div>
                            </div>

                            <div class="comment-author-position">
                                <div @click="replyComment(comment.replyer.objectId,comment.replyer.nickName,comment.formID,comment.replyer.authData.weapp.openid)">
                                    <image src="../../static/assets/comment.png" style="width: 20px;height: 20px;margin-bottom: 7px;"></image>
                                </div>
                                <div>{{ index + 1 }}reply</div>
                            </div>
                        </div>
                        <div>
                            <div class="h2w h2w-light">
                                <div class="h2w__main">
                                    <div class="zan-c-red" v-if="comment.user">@{{ comment.user.nickName }}</div>
                                    <div class="h2w__p" data-alpha="undefined" data-data="undefined"
                                         data-ename="undefined" data-href="undefined" data-id="undefined"
                                         data-name="undefined" data-src="undefined" data-url="undefined" id="">
                                        {{ comment.content }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </scroll-view>
</template>
<script>
  import { getArticleDetail, addReadCount } from '@/utils/article'
  import { getIsCollect, collectionAction } from '@/utils/collect'
  import { sendComment, getComment } from '@/utils/comment'
  import { sendNew } from '@/utils/new'
  import common from '../../../static/common/common'
  import timeago from 'timeago.js'
  import wxParse from 'mpvue-wxparse'
  import { share } from '@/utils/share'
  import Bmob from '../../../static/bmob/Bmob-1.4.4.min'
  // import Footer from '@/components/footer'
  
  export default {
    onLoad () {
      this.laoding = false
      this.detail = ''
      this.show = 'none'
      this.userData = wx.getStorageSync('userData')
      this.collect = false 
    },
    onShareAppMessage () {
      return share()
    },
    onPageScroll () {
      this.show = 'block'
    },

    data () {
      return {
        detail: [],
        comments: [],
        show: 'none',
        loading: false,
        userData: null,
        message: null,
        userId: null,
        formID: null,
        openid: null,
        collect: null
      }
    },

    mounted () {
      this._getDetail(this.$root.$mp.query.id)
      this._addReadCount(this.$root.$mp.query.id)
      this._getComment(this.$root.$mp.query.id)
      this._getIsCollect(this.$root.$mp.query.id)
    },

    methods: {
      _getDetail (id) {
        getArticleDetail(id).then(res => {
          console.log('get detail: ', res)
          res.createdAt = timeago().format(res.createdAt, 'en')
          this.detail = res
          this.loading = true
        })
      },

      _addReadCount (id) {
        addReadCount(id)
      },

      _getComment (id) {
        getComment(id).then(res => {
          res.forEach(resEach => {
            resEach.createdAt = timeago().format(resEach.createdAt, 'en')
            if (resEach.user === undefined) {
              resEach.user = null 
            }
          })

          this.comments_count = res.length 
          this.comments = res 
        })
      },

      // has the article been favorited 
      _getIsCollect (id) {
        getIsCollect(id).then(res => {
          if (res === 1) {
            this.collect = true 
          }
        })
      },

      switchTab () {
        wx.switchTab({
          url: '../center/main'
        })
      },

      // get the comment input from the input box 
      bindCommentMessageInput (e) {
        this.message = e.target.value 
      },

      // submit to the server 
      
      submit (e) {
        let formId = e.target.formId
        let articleId = this.$root.$mp.query.id
        let content = this.message 
        let user = null

        if (!content) {
          common.showTip('comment', 'loading')
          return false 
        }
        let userId = this.userId

        sendComment(articleId, userId, content, formId).then(res => {
          console.log('comment sent success')
          this.message = ''
          if (res) {
            // add the comment to the page 
            let userData = wx.getStorageSync('userData')
            let replyer = {
              objectId: userData.objectId,
              userPic: userData.userPic,
              nickName: userData.nickName,
              authData: {
                weapp: {
                  openid: userData.authData.weapp.openid
                }
              }
            }

            if (userId) {
              user = {
                nickName: content.split(' ')[0].slice(1)
              }
              content = content.slice(content.indexOf(''))
            }

            let data = []
            data.push({
              replyer: replyer,
              createdAt: 'Now',
              content: content,
              user: user,
              formID: formId
            })

            let comments = this.comments 
            comments.push.apply(comments, data)
            common.showTip('comment', 'success')

            // send notification 
            this._sendNew('own', userData.nickName + 'at << "+ this.detail.title +">> check!', '', this.$root.$mp.query.id)

            if (userId) {
              this._sendNew('user', userData.nickName + 'at << "+ this.detail.title +">> replied!', '', this.$root.$mp.query.id)
              let myDate = new Date()

              let modelData = {
                'touser': this.openid,
                'template_id': 'ggxiLAjguCzuIcUUxqYhJiSwhpsA80FHvUFdT9ZbSTQ',
                'page': '/pages/detail/main?id=' + this.$root.$mp.query.id,
                'form_id': this.formID,
                'data': {
                  'keyword1': {
                    'value': content
                  },
                  'keyword2': {
                    'value': this.detail.title
                  },
                  'keyword3': {
                    'value': myDate.toLocaleString()
                  }
                },
                'emphasis_keyword': 'keyword2.DATA'

              }

              Bmob.sendWeAppMessage(modelData).then(function (response) {
                console.log('sent templated notification: ', response)
              }).catch(function (res) {
                console.log('oops error sending message: ', res)
              })
            }
          } else {
            common.showTip('error', 'loading')
          }
        })
      },

      // get the commented info 
      
      replyComment (userId, nickName, formID, openid) {
        this.userId = userId
        this.message = '@' + nickName + ' '
        this.formID = formID
        this.openid = openid 
        console.log(openid)
      },

      // unfavorite / favorite article 
      
      _collectAction (action) {
        collectionAction(this.$root.$mp.query.id, action).then(res => {
          if (action === 'noCollect') {
            this.collect = false 
            common.showTip('liked', 'success')
          } else {
            this.collect = true 
            common.showTip('liked', 'success')
          }
        })
      },

      // send templated notification 
      _sendNew (action, content, user, id) {
        sendNew(action, content, user, id).then(res => {
          console.log('sending templated message error: ', res)
        })
      }
    },

    components: {
      wxParse
    }
  }
</script>

<style>
    .wxParse .li-circle {
        display: none;
        width: 0px;
        height: 0px;
    }

    .blogdetail {
        position: relative;
        min-height: 100%;
        margin: 0;
        padding: 0;
    }

    .detail {
        height: 100%;
        overflow: hidden;
    }

    .page {
        padding-bottom: 45px;
        overflow: hidden;
        width: 100%;
    }

    .blog-detail {
        padding: 0;
        background: #eeeeee;
        min-height: 100%;
    }

    .blog-detail-contaner {
        max-width: 1000px;
        margin: 0 auto;
        background: #fff;
    }

    .header {
        position: relative;
        padding-top: 44%;
        background-color: #eee;
        background-size: cover;
        background-position: 50%;
    }

    .header-cover {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        overflow: hidden;
    }

    .no-cover {
        background: #1f3747;
        background-image: -webkit-linear-gradient(left, #1f3747, #39b54a);
    }

    .article-section {
        padding: 0;
    }

    .caption {
        padding: 30px 20px;
    }

    .titl {
        margin-bottom: 20px;
        font-size: 20px;
        font-weight: 700;
        color: #fff;
    }

    .time {
        font-size: 15px;
        color: #95a5a6;
    }

    .article {
        padding: 5px 20px 20px 20px;
        font-size: 20px;
        background: #fff;

    }

    .article:before {
        display: table;
        content: "";
    }

    .footer {
        height: 20px;
        line-height: 20px;
        font-size: 85rem;
    }

    image {
        width: 100%;
    }

    .page-tail {
        font-size: 14px;
        left: 0;
        position: fixed;
        bottom: 0;
        width: 100%;
        z-index: 100;
        background-color: white;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        border-top: 0.5px solid #dfdfdf;

    }

    .resp-input-cell {
        width: 84%;
        margin-right: 10px;
    }

    form{
        width: 100%;
    }
    .resp-input {

        height: 30px;
        padding-left: 10px;
        margin: 7.5px 0 7.5px 7.5px;
        border: 1px solid #ccc;
        border-radius: 15px;
        width: 74%;
        float: left;
    }

    .resp-btn {
        height: 30px;
        width: 16%;
        line-height: 30px;
        text-align: center;
        margin-right: 4px;
        color: #4b0;
        font-size: 14px;
        float: left;
        margin-top: 9px;
        margin-left: 8px;

    }
    .like-btn{
        height: 30px;
        width: 10%;
        line-height: 30px;
        text-align: center;
        margin-right: 4px;
        color: #4b0;
        font-size: 14px;
        float: left;
        margin-top: 9px;
        margin-left: 8px;
    }
    .like-btn-img{
        width: 30px;
        height:30px;
    }

    .need-login {
        height: 45px;
        width: 100%;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        color: #999;
    }

    .resp-head {
        color: #FF6A6A;
        margin: 10px 0 13px 10px;
        font-size: 13px;
    }

    .comment {
        border-radius: 2px;
        margin-bottom: 7.5px;
        padding: 10px 15px;
        position: relative;
        align-items: center;
        background-color: white;
    }

    .comment-info {
        padding: 5px 0 7.5px 0;
        margin-bottom: 9px;
        color: gray;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: flex-end;
        border-bottom: 1px solid #efefef;

    }

    .comment-author {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-content: center;
    }

    .comment-author-icon {
        width: 320px;
        height: 240px;
        display: inline-block;
        overflow: hidden;
        vertical-align: text-bottom;
        margin: 0;
        border-radius: 10%;
        max-width: 34px;
        max-height: 34px;
    }

    .comment-author-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        font-size: 12px;
        padding-left: 9px;
    }

    .comment-author-position {
        display: flex;
        flex-direction: column;
        justify-content: center;
        font-size: 12px;
        padding-left: 5px;
    }
    .h2w-light{
        color:#333;
        background-color:white;
    }
    .h2w__p{
        margin-bottom:15px;
        font-size: 14px;
    }
    .zan-c-red{
        color:#f44;
        font-size: 12px;
        margin-bottom: 10px;
    }
</style>