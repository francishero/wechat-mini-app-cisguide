import Bmob from '../../static/bmob/Bmob-1.4.4.min'

export function getArticle (pageSize, pagination, selectType) {
  const query = Bmob.Query('articles')
  if (selectType !== 0) {
    query.equalTo('category', '==', selectType)
  }
  query.limit(pageSize)
  query.skip(pageSize * pagination)
  query.order('-createdAt')
  // query.select('objectId, title, read_counts, excerpt, author, createdAt')
  return query.find().then(res => {
    return Promise.resolve(res)
  }).catch(err => {
    console.log('Error fetching articles: ', err)
  })
}

export function getArticleDetail (id) {
  const query = Bmob.Query('articles')
  return query.get(id).then(res => {
    return Promise.resolve(res)
  }).catch(err => {
    console.log('Error fetching article details: ', err)
  })
}

export function addReadCount (id) {
  const query = Bmob.Query('articles')
  query.get(id).then(res => {
    res.set('read_counts', (parseInt(res.read_counts) + 1))
    res.save()
  }).catch(err => {
    console.log('Error incrementing the read_count: ', err)
  })
}

export function getArticleByCategory (category) {
  const query = Bmob.Query('articles')
  if (category !== 0) {
    query.equalTo('category', '==', category)
  }
  query.order('-createdAt')

  return query.find().then(res => {
    return Promise.resolve(res)
  }).catch(err => {
    throw new Error(err)
  })
}
