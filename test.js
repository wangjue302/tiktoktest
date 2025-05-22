// 检查是否授予了必要的权限
if (!requestScreenCapture()) {
    toast("请授予屏幕捕获权限");
    exit();
}

// 获取TikTok的包名和活动名（不同设备可能不同）
const tiktokPackageName = "com.zhiliaoapp.musically"; // 国际版TikTok的包名

launchTikTok();

// 启动TikTok应用
function launchTikTok() {
    // 检查TikTok是否已安装
    if (!getAppName(tiktokPackageName)) {
        toast("未找到TikTok应用");
        return false;
    }
    
    // 尝试通过包名启动
    app.launch(tiktokPackageName);
    toast("正在打开TikTok");
    
    // 等待应用打开
    sleep(3000);
    
    // 检查是否成功打开
    if (currentPackage() !== tiktokPackageName) {
        toast("打开TikTok失败");
        return false;
    }

    // 查找并点击评论按钮
    let commentBtn = findCommentButton();
    if (commentBtn) {
        click(commentBtn.bounds().centerX(), commentBtn.bounds().centerY());
        toast("正在打开评论区");
        sleep(3000);
    } else {
        toast("未找到评论按钮");
    }
}

function findCommentButton() {
    commentBtn = descContains("评论").findOne(3000);
    if (commentBtn) return commentBtn;
    
    return null;
}
