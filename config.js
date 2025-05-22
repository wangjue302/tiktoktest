const config = {
    TIKTOK_PACKAGE: "com.zhiliaoapp.musically",  // TikTok包名
    MAX_RETRY: 3,  // 最大重试次数
    DELAY: {  // 各种操作的延迟时间(毫秒)
        LAUNCH_APP: 5000,
        FIND_ELEMENT: 2000,
        LOAD_VIDEO: 3000,
        OPEN_COMMENT: 3000,
        CLOSE_COMMENT: 1000,
        SWIPE_VIDEO: 2000
    }
};

module.exports = config;
