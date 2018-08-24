import Bmob from '../../static/bmob/Bmob-1.4.4.min'

export function getCategory () {
  const query = Bmob.Query('categories')
  query.order('createdAt')
  return query.find().then(res => {
    return Promise.resolve(res)
  }).catch(err => {
    console.log('error fetching categories :', err)
  })
}
