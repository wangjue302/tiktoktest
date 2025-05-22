// 检查是否授予了必要的权限
if (!requestScreenCapture()) {
    toast("请授予屏幕捕获权限");
    exit();
}

// 获取TikTok的包名和活动名（不同设备可能不同）
const tiktokPackageName = "com.zhiliaoapp.musically"; // 国际版TikTok的包名

// 启动TikTok应用
launchTikTok();

function launchTikTok() {
    // 检查TikTok是否已安装
    if (!getPackageName(tiktokPackageName)) {
        toast("未找到TikTok应用111");
        // 可以添加跳转到应用商店的逻辑
        return;
    }
    
    // 尝试通过包名启动
    app.launch(tiktokPackageName);
    toast("正在打开TikTok...");
    
    // 等待应用打开
    sleep(3000);
    
    // 检查是否成功打开
    if (currentPackage() !== tiktokPackageName) {
        toast("打开TikTok失败，尝试其他方式");
        // 可以添加备用启动方式
    }
}

// 可选：添加一个退出按钮
setInterval(() => {
    if (descContains("关闭").findOnce()) {
        exit();
    }
}, 1000);
