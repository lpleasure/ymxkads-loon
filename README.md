# 游民星空去广告 · Loon 插件

基于游民星空 iOS App 6.34.20 抓包编写。

## 安装

Loon → 配置 → 插件 → 添加，填入：

```
https://raw.githubusercontent.com/lpleasure/ymxkads-loon/main/Gamersky.plugin
```

需开启 MitM 并信任证书。

## 去除内容

| 广告 | 接口 | 方式 |
| --- | --- | --- |
| 开屏广告（自营） | `adSystem/ad/getAdAtLaunchView` | 脚本清空 `ad` |
| 开屏 / 信息流第三方 SDK 广告 | `app/config` | 脚本关闭 provider、比例置 0 |
| 弹窗广告 | `adSystem/ad/getAppPopupAd` | reject-dict |
| 首页信息流广告（横幅、推广帖） | `lists/getListElements` | 脚本过滤带 `adCategory`/`adId` 的条目 |
| 文章页推荐 / 底部广告 | `adSystem/tempAdConfig/get` | 脚本关闭开关 |
| 广告曝光统计 | `item-statistics…/ad/…`、`appapi2click…/statisticAd` | reject-dict |

## 说明

- 开屏广告配置有缓存，首次安装后可能需要冷启动 App 一两次才生效。
- 若有遗漏的广告位，欢迎提 Issue 并附上抓包。
