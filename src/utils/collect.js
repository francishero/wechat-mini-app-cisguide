/**
 * collects the articles the user has favorited
 */

import Bmob from '../../static/bmob/Bmob-1.4.4.min'

var userData = wx.getStorageSync('userData')

export function getIsCollect (id) {
  const query = Bmob.Query('collect')
  query.equalTo('article', '==', id)
  query.equalTo('user', '==', userData.objectId)
  return query.find().then(res => {
    return Promise.resolve(res)
  }).catch(err => {
    console.log('Error getting user collected articles: ', err)
  })
}

/**
 * favorite an article by user
 */

export function collectionAction (id, action) {
  const query = Bmob.Query('collect')
  if (action === 'noCollect') {
    query.equalTo('article', '==', id)
    query.equalTo('user', '==', userData.objectId)
    return query.find().then(res => {
      res.destroyAll().then(res => {
        return Promise.resolve(res)
      })
    }).catch(err => {
      console.log('error in collectionAction: ', err)
    })
  } else {
    let pointer1 = Bmob.Pointer('_User')
    let poi1D1 = pointer1.set(userData.objectId)
    let pointer2 = Bmob.Pointer('articles')
    let poi1D2 = pointer2.set(id)
    query.set('user', poi1D1)
    query.set('article', poi1D2)

    return query.save().then(res => {
      return Promise.resolve(true)
    }).catch(err => {
      return Promise.resolve(false)
    })
  }
}

/**
 * get all articles user has favorited
 */

export function getCollectionList () {
  const query = Bmob.Query('collect')
  query.equalTo('user', '==', userData.objectId)
  query.include('article','article')
  query.order('-createdAt')

  return query.find().then(res => {
    return Promise.resolve(res)
  }).catch(err => {
    console.log('error in getting user collectionList: ', err)
  })
}
