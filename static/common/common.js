function showTip(sms, icon, func, duration) {
    if (!duration) {
        duration = 1000;
    }
    wx.showToast({
        sms: sms,
        icon: icon,
        func: func,
        duration: duration
    });
}

function showModal (content, title, showCancel, successfunc) {
    if (!title) {
        title = "warning";
    }
    wx.showModal({
        title: title,
        content: content,
        showCancel: showCancel,
        success: successfunc,
        confirmText: 'Cool'
    })
}

module.exports.showTip = showTip;
module.exports.showModal = showModal;

