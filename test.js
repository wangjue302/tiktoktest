// ====== 配置部分 ======
// TikTok包名
const TIKTOK_PACKAGE = "com.zhiliaoapp.musically"; 

// 最大重试次数 
const MAX_RETRY = 3;

// 评论用户头像点击顺序
let AVATAR_CLICK_COUNT = 0;

// 各种操作的延迟时间(毫秒)                             
const DELAY = {                                    
    LAUNCH_APP: 5000,
    OPEN: 3000,
    BACK: 1000,
    FIND_ELEMENT: 2000,
    WAIT_LOAD: 3000,
    LOAD_VIDEO: 3000,
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
    
    sleep(DELAY.OPEN);

    // 获取评论列表
    const commentList = className("android.widget.FrameLayout").untilFind();
    
    if (commentList) {
        clickMessageButtonRecursively()
    } else {
        toast("没有评论，关闭评论区");
        closeAndBack();
        swipeToNextVideo();
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

// 评论区用户点击递归方法
function clickMessageButtonRecursively() {
    // 获取评论用户头像
    const commentAvatar = className("android.widget.ImageView").depth(19).untilFind();
    
    if (AVATAR_CLICK_COUNT >= commentAvatar.length) {
        toast("已点击所有用户");
        closeAndBack();
        return false;
    }

    const avatarBounds = commentAvatar[AVATAR_CLICK_COUNT].bounds();
    if (avatarBounds) {
        click(avatarBounds.centerX(), avatarBounds.centerY());
        sleep(DELAY.WAIT_LOAD);

        // 通过textContains("Message")获取到的元素的clickable属性是false
        const messageButton = textContains("Message").findOne(DELAY.FIND_ELEMENT);

        if (messageButton) {
            // 向上查找可点击的父元素
            let clickableButtonParent = messageButton;
            while (clickableButtonParent && !clickableButtonParent.clickable()) {
                clickableButtonParent = clickableButtonParent.parent();
            }

            const buttonBounds = clickableButtonParent.bounds();

            click(buttonBounds.centerX(), buttonBounds.centerY());
            // sleep(DELAY.WAIT_LOAD);

            sleep(2000)
            closeAndBack();
            closeAndBack();
        } else {
            toast("未获取到消息按钮");
            closeAndBack();
            sleep(DELAY.WAIT_LOAD);
        }

        AVATAR_CLICK_COUNT++;
        clickMessageButtonRecursively();
    } else {
        toast("未获取到头像控件坐标");
        closeAndBack();
    }
}

// 返回
function closeAndBack() {
    back();
    sleep(DELAY.BACK);
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
