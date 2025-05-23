// ====== 配置部分 ======
// TikTok包名
const TIKTOK_PACKAGE = "com.zhiliaoapp.musically"; 

// 最大重试次数 
const MAX_RETRY = 3;

// 各种操作的延迟时间(毫秒)                             
const DELAY = {                                    
    LAUNCH_APP: 5000,
    FIND_ELEMENT: 2000,
    LOAD_VIDEO: 3000,
    OPEN_COMMENT: 3000,
    CLOSE_COMMENT: 1000,
    SWIPE_VIDEO: 2000
}; 

// ====== 主流程 ======
main();

function main() {
    // 检查权限
    if (!prepareEnvironment()) return false;
    
    // 启动TikTok
    if (!launchApp(TIKTOK_PACKAGE)) {
        toast("启动TikTok失败");
        exit();
    }

    handleVideoInteraction();
    // let retryCount = 0;
    // while (retryCount++ < MAX_RETRY) {
    //     handleVideoInteraction();
        
    //     // 滑动到下一个视频
    //     swipeToNextVideo();
    // }
    
    // toast("脚本执行完成");
    // exit();
}


// ====== 评论区核心功能函数 ======
function handleVideoInteraction() {
    if (!openCommentSection()) {
        toast("无法打开评论区");
        return;
    }
    
    sleep(DELAY.OPEN_COMMENT);
    
    // 检查是否有评论
    const commentList = checkCommentsExist();
    if (commentList) {
        toast("检测到评论");
        const commentAvatar = getCommentAvatar();

        let clickCount = 0;
        commentAvatar[clickCount].click();

        // 等待用户主页加载
        sleep(3000);
        
        // 返回视频页面
        back();
        sleep(DELAY.CLOSE_COMMENT);
    } else {
        toast("没有评论，关闭评论区");
        closeCommentSection();
    }
}

// ====== 操作函数 ======
// 屏幕捕获权限
function prepareEnvironment() {
    if (!requestScreenCapture()) {
        toast("请授予屏幕捕获权限");
        return false;
    }
    return true;
}

// 获取应用包名
function launchApp(packageName) {
    if (!getAppName(packageName)) {
        toast("未找到TikTok应用");
        return false;
    }
    
    app.launch(packageName);
    toast("正在打开TikTok");
    sleep(DELAY.LAUNCH_APP);
    return currentPackage() === packageName;
}

// 打开评论区
function openCommentSection() {
    commentBtn = id("cno").findOne(DELAY.FIND_ELEMENT);

    if (commentBtn) {
        commentBtn.click()
        return true;
    }
    
    return null;
}

// 查找评论列表容器
function checkCommentsExist() {
    const commentList = className("android.widget.FrameLayout").untilFind();
    if (!commentList) return false;
    
    return commentList
}

// 查找评论头像
function getCommentAvatar() {
    const commentAvatar = className("android.widget.ImageView").depth(19).untilFind();
    if (!commentAvatar) return false;
    
    return commentAvatar
}

// 用户主页点击
// function clickCommentAvatar(commentItem) {
//     // 优先通过ID查找头像
//     let avatar = commentItem.findOne(idMatches(".*avatar.*|.*icon.*"));
    
//     // 备用查找方式
//     if (!avatar) {
//         avatar = commentItem.findOne(className("ImageView")
//             .filter(v => v.bounds().width() > 30));
//     }

//     if (avatar) {
//         return click(avatar.bounds().centerX(), avatar.bounds().centerY());
//     }

//     return false;
// }

// 返回
function closeCommentSection() {
    back();
    sleep(DELAY.CLOSE_COMMENT);
    swipeToNextVideo();
}

// 滑动到下一个视频
function swipeToNextVideo() {
    const { width, height } = device;
    const startY = height * 0.8;
    const endY = height * 0.2;
    
    swipe(width / 2, startY, width / 2, endY, 500);
    toast("滑动到下一个视频");
    sleep(DELAY.SWIPE_VIDEO);
}
