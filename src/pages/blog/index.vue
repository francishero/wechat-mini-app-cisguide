<template>
	<div class="blog">
        <loading :hidden="loading">
            fetching data...
        </loading>
        <div class="pages">
            <div style="min-height: 100%">
              <!--  <div class="header">
                    <div class="mac">
                        <div class="logo">
                            <img src="https://www.overxue.com/images/php.jpg">
                        </div>
                        <p>CisGuide for NUIST</p>
                    </div>
                </div> -->
                <div class="articleListPage-tags-cnt">
                    <div>
                        <div class="articleListPage-tags">
                            <div class="grid-row">
                                <div class="content">
                                    <div v-for="(item, index) in categories" :key="index"
                                         :class="{'active':selectType === item.objectId}"
                                         @click="selectCategory(item.objectId)">{{item.name}}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <div class="article">
                    <div class="article-item">
                        <div v-for="(item, index) in articles" :key="index" class="article-list">
                            <a :href="'../detail/main?id=' + item.objectId" style="color:#000000">
                                <div class="label" v-show="index == 0 || index == 1"><span>new</span></div>
                                <h1 class="title">
                                    <a>{{item.title}}</a>
                                </h1>
                                <div class="introduction">
                                    <i class="icon-user">
                                        <span class="user">{{item.author}}</span>
                                    </i>
                                    <i class="icon-clock">
                                        <span class="time">{{item.createdAt}}</span>
                                    </i>
                                    <i class="icon-eye">
                                        <span class="view">{{item.read_counts}}</span>
                                    </i>
                                </div>
                                <div class="article-content">
                                    {{item.excerpt}}
                                </div>
                                <div class="readmore">
                                    <div class="right">
                                        <a class="readmore" style="display: inline">Read</a>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                    <div class="weui-loadmore weui-loadmore_line" v-if="!nodata">
                        <view class="weui-loadmore__tips weui-loadmore__tips_in-line">no more articles</view>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import timeago from 'timeago.js'
import { getArticle, getArticleByCategory } from '@/utils/article'
import { share } from '@/utils/share'
import { getCategory } from '@/utils/category'
// import Bmob from '../../../static/bmob/Bmob-1.4.4.min'

export default {
  onShareAppMessage () {
    return share()
  },
  data () {
    return {
      loading: false,
      pagination: 0,
      pageSize: 5,
      articles: [],
      categories: [],
      selectType: 0,
      nodata: true
    }
  },
  onShow () {
    console.log('ON SHOW AHHHHHHHHHH')
    this._getArticle(this.pageSize, this.pagination, this.selectType)
    console.log('just refetched data')
    this._getCategories()
  },

  // mounted () {
  //   this._getArticle(this.pageSize, this.pagination, this.selectType)
  //   this._getCategories()
  // },
  onReachBottom () {
    this._getArticle(this.pageSize, this.pagination, this.selectType)
  },
  onPullDownRefresh () {
    this._getArticle(this.pageSize, this.pagination, this.selectType)
  },

  methods: {
    _getArticle (pageSize, pagination, selectType) {
      if (this.nodata) {
        this.loading = false
        getArticle(pageSize, pagination, selectType).then(res => {
          console.log('pure data: ', res)
          this.loading = false
          let data = []
          res.forEach(resEach => {
            resEach.createdAt = timeago().format(resEach.createdAt, 'en')
            data.push({
              author: resEach.author,
              createdAt: resEach.createdAt,
              excerpt: resEach.excerpt,
              objectId: resEach.objectId,
              read_counts: resEach.read_counts,
              title: resEach.title
            })
          }) // end of forEach 

          if (data.length) {
            console.log('we have data: ', data)
            let articles = this.articles
            let pagination = this.pagination
            articles.push.apply(articles, data)
            pagination = pagination ? pagination + 1 : 1

            this.articles = articles
            this.pagination = pagination
            this.loading = true 
          } else {
            this.nodata = false 
            this.loading = true 
          }
        })
      } else {
        this.loading = true 
      }
    },

    _getCategories () {
      getCategory().then(res => {
        console.log('all categories: ', res)
        res.unshift({
          objectId: 0,
          name: 'All'
        })
        this.categories = res
        console.log('categories: ', this.categories[0])
      })
    },
    onNavigateTap (e) {
      // try to open the translate mini app
      let appids = e.currentTarget.dataset.appid
      console.log('got the appid: ', appids)
      if (wx.navigateToMiniProgram) {
        wx.navigateToMiniProgram({
          appId: appids,
          path: '',
          envVersion: 'release',
          success (res) {
            console.log('successfully opened translator')
          }
        })
      } else {
        wx.showModal({
          title: 'Info',
          content: 'Your wechat version is too low'
        })
      }
    },

    selectCategory (category) {
      getArticleByCategory(category).then(res => {
        this.articles = res
        console.log('data structure for each category articles: ', this.articles)
        this.selectType = category 
      })
    }
  }
}
</script>

<style>
  .blog {
    position: relative;
    min-height: 100%;
    margin: 0;
    padding: 0;
    background: #eeeeee;
  }
  .pages {
    position:  relative;
    overflow:  hidden;
    width: 100%;
  }
  .header {
    position: relative;
    padding:  60px 0 20px;
    background:  #fafafa;
  }
  .header::before {
    content: "";
    position:  absolute;
    left:  0;
    bottom:  0;
    width: 100%;
    height: 50px;
    background:  #fff;
    background-image: linear-gradient(#fafafa, #fff);
  }
.mac {
  position: relative;
  width:  70%;
  height:  130px;
  margin:  auto;
  padding-top: 30px;
  text-align: center;
  background:  #fafafa;
  background: linear-gradient(to right bottom, #fff, #eee);
  border:  6px solid #222;
  border-width: 6px 6px 8px;
  border-radius:  8px 8px 0 0;
}
.mac::after {
  content:  "";
  position:  absolute;
  width: 134%;
  left: -17%;
  bottom: -14px;
  height: 6px;
  border-radius: 0 040px/0 0 5px 5px;
  background: #ccc;
}
.logo {
  margin-bottom: 15px;
}
.logo img {
  width:  70px;
  height:  70px;
  overflow: hidden;
  border-radius: 50%;
  background:  #fff;
  box-shadow: rgba(255, 255, 255, 0.1) 0 0 0 5px, rgba(0, 0, 0, 0.15) 0 0 0 5px;
  transition: transform .4s ease-out;
}
.logo img:hover {
  transform:  rotate(360deg);
}
.mac p {
  font-size: 13px;
  color:  #333;
}

.articleListPage-tags-cnt {
  margin-top: 10px;
  margin-bottom: 50px;
}
.articleListPage-tags {
  position: static !important;
  width:  100%;
  background:  #fff;
  border-bottom: 1px solid #c4cdd4;
  z-index: 5;
}
.grid-row {
  width: 100%;
  position: relative;
  margin:  auto;
  zoom:  1;
  transition:  all .3 ease-out;
}
.grid-row::after {
  content:  ".";
  display: block;
  height: 0;
  clear: both;
  visibility: hidden;
}
.content {
  padding: 12px 0 5px 10px;
}
.content div {
  position: relative;
  display: inline-block;
  max-width: 100%;
  height: 32px;
  margin: 10px 10px 10px 10px;
  line-height: 24px;
  padding: 8px;
  background: #eee;
  font-size: 12px;
  color:  #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  box-sizing: border-box;
}
.content div::before {
  position: absolute;
  content: "";
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-width: 12px 12px 12.5px 0;
  border-color: #fff transparent;
  border-style: solid;
}
.content div::after {
  position: absolute;
  content: "";
  width: 4px;
  height: 4px;
  left: 8px;
  border-radius: 100%;
  background: #fff;
}
.content div:active {
  background:  #f70;
  color:  #fff;
}
.content span {
  opacity: 0.3;
  padding: 0 0 0 5px;
}
.article {
  margin: 0 10px;
}
.article-item {
  padding-bottom: 10px;
}
.article-list {
  position: relative;
  background: #fff;
  padding: 20px;
  margin-bottom: 15px;
}
.label {
  position: absolute;
  top: 0;
  right: 0;
  width: 30px;
  height: 30px;
  background: #39b54a;
  box-shadow: -1px 1px 2px #000;
}
.label::before {
  position: absolute;
  content: "";
  width: 0;
  height: 0;
  top: 0;
  right: 0;
  border: 1px solid #fff;
  border-width: 0 30px 30px 0;
  border-color: transparent transparent #fff;
}
.label span {
  position: absolute;
  display: block;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  transform: rotate(45deg) scale(.8);
  text-align: center;
  line-height: 15px;
  color: #fff;
  font-size: 15px;
}
.title {
  line-height: 20px;
}
.title a {
  font-size: 17px;
  font-weight: 700;
  color: #3d464d !important;
}
.introduction {
  margin: 15px 0;

}
.introduction .icon-user, .icon-clock, .icon-eye {
  color: #95a5a6;
  font-size: 14px;
  line-height: 14px;
  display: inline-block;
  margin-left: 5px;
}
.introduction .user, .time, .view {
  margin-left: 10px;
  font-size: 14px;
  line-height: 14px;
}
.article-content {
  line-height: 1.2;
}
.readmore {
    width: 100%;
    margin-top: 15px;
    margin-bottom: 30px;
}
.left {
  float: left;
}
.right {
  float: right;
}
.readmore {
  color:  #39b54a;
  font-size: 14px;
  font-weight: 600;
  line-height: 14px;
}
.bottom {
  font-size: 14px;
  text-align: center;
  background: #fff;
  width: 26%;
  color: #595959;
  margin: auto;
  height: 18px;
  line-height: 18px;
}
.content .active {
  background: #39b54a;
  color: #fff;
}
</style>