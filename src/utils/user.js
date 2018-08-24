/**
 * gets user info from localStorage
 */

import Bmob from '../../static/bmob/Bmob-1.4.4.min'

export function getUserData () {
    let objectId = wx.getStorageSync('objectId')
    const query = Bmob.Query()
}