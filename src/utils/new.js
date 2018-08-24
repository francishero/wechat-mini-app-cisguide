import Bmob from '../../static/bmob/Bmob-1.4.4.min'

let userData = wx.getStorageSync('userData')

/**
 * send user notification
 */

export function sendNew (action, content, user, id) {
  const query = Bmob.Query('news')
  let pointer1 = Bmob.Pointer('_User')
  if (action === 'own') {
    var poi1D1 = pointer1.set('772352c876')
  } else {
     poi1D1 = pointer1.set(user)
  }
  var pointer2 = Bmob.Pointer('articles')
  var poi1D2 = pointer2.set(id)
  query.set('user', poi1D1)
  query.set('content', content)
  query.set('article', poi1D2)
  query.set('status', false)

  return query.find().then(res => {
    return Promise.resolve(true)
  }).catch(err => {
    return Promise.resolve(false)
  })
} 

/**
 * get users own notifications
 */

export function getNewsList () {
  const query = Bmob.Query('news')
  query.equalTo('user', userData.objectId)
  query.equalTo('status', '==', 'false')
  query.order('createdAt')

  return query.find().then(res => {
    return Promise.resolve(res)
  }).catch(err => {
    console.log('error getting users ownn notification', err)
  })
}

/**
 * change wether notification has been read or not 
 */

export function changeStatus (id) {
  const query = Bmob.Query('news')
  query.set('id', id)
  query.set('status', 'true')

  return query.find().then(res => {
    return Promise.resolve(res)
  }).catch(err => {
    console.log('error chaning the notification read status: ', err)
  })
}

/**
 * find unread notifications
 */

export function getNewsCount () {
  const query = Bmob.Query('news')
  query.equalTo('status', '==', false)
  query.equalTo('user', '==', userData.objectId)

  return query.find().then(res => {
    return Promise.resolve(res)
  }).catch(err => {
    console.log('error getting users unread notifications: ', err)
  })
}
