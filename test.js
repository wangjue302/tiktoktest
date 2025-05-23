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
    BACK: 2000,
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
        swipeToNextVideo();
        return false;
    }

    sleep(DELAY.OPEN);
    clickVisibleAvatarsAndScroll();
}

// 处理可视范围内头像并自动滑动
function clickVisibleAvatarsAndScroll() {
    let clickedBoundsSet = new Set();
    let maxScroll = 20; // 最多滑动次数，防止死循环
    let noNewAvatarCount = 0;
    let firstTry = true;
    while (maxScroll-- > 0) {
        let avatars = className("android.widget.ImageView").depth(19).untilFind();
        if (firstTry && avatars.length === 0) {
            toast("评论区无用户头像，直接退出");
            closeAndBack();
            swipeToNextVideo();
            return;
        }
        firstTry = false;
        let hasNew = false;
        for (let i = 0; i < avatars.length; i += 2) {
            let avatar = avatars[i];
            let bounds = avatar.bounds();
            if (!bounds) continue;
            let bstr = bounds.toString();
            if (!clickedBoundsSet.has(bstr)) {
                hasNew = true;
                clickedBoundsSet.add(bstr);
                click(bounds.centerX(), bounds.centerY());
                sleep(DELAY.WAIT_LOAD);
                
                // 进入用户主页后，查找并点击Message按钮
                const messageButton = textContains("Message").findOne(DELAY.FIND_ELEMENT);
                if (messageButton) {
                    let clickableButtonParent = messageButton;
                    while (clickableButtonParent && !clickableButtonParent.clickable()) {
                        clickableButtonParent = clickableButtonParent.parent();
                    }
                    if (clickableButtonParent) {
                        let buttonBounds = clickableButtonParent.bounds();
                        click(buttonBounds.centerX(), buttonBounds.centerY());
                        sleep(DELAY.WAIT_LOAD);
                    }
                    closeAndBack();
                    closeAndBack();
                } else {
                    toast("未获取到消息按钮");
                    closeAndBack();
                    sleep(DELAY.WAIT_LOAD);
                }
            }
        }
        if (!hasNew) {
            noNewAvatarCount++;
        } else {
            noNewAvatarCount = 0;
        }
        // 连续两次滑动都没有新头像，说明到底了
        if (noNewAvatarCount >= 2) {
            toast("评论区头像处理完成");
            break;
        }
        // 优化：在评论区容器内部滑动，增大滑动距离
        let commentContainer = className("android.widget.FrameLayout").depth(10).findOne(DELAY.FIND_ELEMENT);
        if (commentContainer) {
            let cBounds = commentContainer.bounds();
            swipe(
                cBounds.centerX(),
                cBounds.bottom - 30,
                cBounds.centerX(),
                cBounds.top + 30,
                500
            );
        } else {
            // 容器没找到则全屏滑动
            swipe(device.width / 2, device.height * 0.8, device.width / 2, device.height * 0.2, 600);
        }
        sleep(2000);
    }
    closeAndBack();
    swipeToNextVideo();
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
    // 查找评论按钮
    let commentBtn = id("cno").findOne(DELAY.FIND_ELEMENT);
    if (!commentBtn) {
        toast("未找到评论按钮，跳过");
        return false;
    }
    // 查找评论按钮下方的评论数文本
    let commentCountNode = null;
    // 尝试获取评论按钮的下一个兄弟节点（常见结构）
    if (commentBtn.parent()) {
        let siblings = commentBtn.parent().children();
        let found = false;
        for (let i = 0; i < siblings.length; i++) {
            if (siblings[i].id() === "cno") {
                // 下一个兄弟节点
                if (i + 1 < siblings.length) {
                    commentCountNode = siblings[i + 1];
                    found = true;
                    break;
                }
            }
        }
        // 如果没找到，尝试直接找 parent 下的 text 节点
        if (!found) {
            for (let i = 0; i < siblings.length; i++) {
                if (siblings[i].text() && /\d/.test(siblings[i].text())) {
                    commentCountNode = siblings[i];
                    break;
                }
            }
        }
    }
    // 解析评论数
    let count = 0;
    if (commentCountNode && commentCountNode.text()) {
        let text = commentCountNode.text().replace(/[^\d\.Kk万]/g, "");
        if (/K|k/.test(text)) {
            count = parseFloat(text) * 1000;
        } else if (/万/.test(text)) {
            count = parseFloat(text) * 10000;
        } else {
            count = parseInt(text);
        }
    }
    if (!count || isNaN(count) || count === 0) {
        toast("无评论，跳过");
        return false;
    }
    commentBtn.click();
    return true;
}

// 评论区用户点击递归方法
function clickMessageButtonRecursively() {
    // 获取评论用户头像
    const commentAvatar = className("android.widget.ImageView").depth(19).untilFind();

    const avatarBounds = commentAvatar[AVATAR_CLICK_COUNT].bounds();
    if (!avatarBounds) {
        toast("未获取到头像控件坐标");
        closeAndBack();
        return false;
    }

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
        sleep(DELAY.WAIT_LOAD);

        closeAndBack();
        closeAndBack();
    } else {
        toast("未获取到消息按钮");
        closeAndBack();
        sleep(DELAY.WAIT_LOAD);
    }

    AVATAR_CLICK_COUNT += 2;
    sleep(DELAY.WAIT_LOAD);
    clickMessageButtonRecursively(); 
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
