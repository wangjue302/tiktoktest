const config = require('./config.js');

// 检查是否授予了必要的权限
if (!requestScreenCapture()) {
    toast("请授予屏幕捕获权限");
    exit();
}

launchTikTok();

// 启动TikTok应用
function launchTikTok() {
    // 检查TikTok是否已安装
    if (!getAppName(config.TIKTOK_PACKAGE)) {
        toast("未找到TikTok应用");
        return false;
    }
    
    // 尝试通过包名启动
    toast("正在打开TikTok");
    app.launch(config.TIKTOK_PACKAGE);
    
    // 等待应用打开
    sleep(config.DELAY.LAUNCH_APP);
    
    // 检查是否成功打开
    if (currentPackage() !== config.TIKTOK_PACKAGE) {
        toast("打开TikTok失败");
        return false;
    }

    // let retryCount = 0;
    // while (retryCount++ < config.MAX_RETRY) {
    //     handleVideoInteraction();
        
    //     // 滑动到下一个视频
    //     swipeToNextVideo();
    // }
    
    // toast("脚本执行完成");






    const commentBtn = findCommentButton();
    if (commentBtn) {
        click(commentBtn.bounds().centerX(), commentBtn.bounds().centerY());
        toast("正在打开评论区");
        sleep(config.DELAY.OPEN_COMMENT);
    } else {
        toast("未找到评论按钮");
    }
}

// 查找并点击评论按钮
function findCommentButton() {
    commentBtn = idContains("cok").findOne(config.DELAY.FIND_ELEMENT);
    if (commentBtn) return commentBtn;
    
    return null;
}
