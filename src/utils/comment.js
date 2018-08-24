/**
 * send and get comments
 */
import Bmob from '../../static/bmob/Bmob-1.4.4.min'

/**
 * @param {objectId} [articleId] [pointer to an article]
 * @param {objectId} [userId] [pointer to user commenting]
 * @param {string} [content] [comment content]
 * @param {int} [formId] [description]
 */

export function sendComment (articleId, userId, content, formId) {
  let userData = wx.getStorageSync('userData')
  let replyerId = userData.objectId
  const query = Bmob.Query('comments')
  let pointer1 = Bmob.Pointer('_User')
  let poi1D1 = pointer1.set(replyerId)
  let pointer2 = Bmob.Pointer('articles')
  let poi1D2 = pointer2.set(articleId)

  if (userId) {
    let pointer3 = Bmob.Pointer('_User')
    let poi1D3 = pointer3.set(userId)
    query.set('user', poi1D3)
    content = content.slice(content.indexOf(' '))
  }
  query.set('content', content)
  query.set('replyer', poi1D1)
  query.set('article', poi1D2)
  query.set('formID', formId)

  return query.save().then(res => {
    return Promise.resolve(true)
  }).catch(err => {
    return Promise.resolve(false)
  }) 
}

/**
 * given an article ID return the comments and the replies 
 */

export function getComment (articleId) {
  let query = Bmob.Query('comments')
  query.include('replyer,user', '_User')
  query.equalTo('article', '==', articleId)

  return query.find().then(res => {
    return Promise.resolve(res)
  }).catch(err => {
    console.log('error getting comments and replies for article: ', err)
  })
}
