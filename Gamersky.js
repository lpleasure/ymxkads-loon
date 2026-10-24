/*
 * 游民星空 App 去广告 (Loon)
 * 处理接口:
 *   adSystem/ad/getAdAtLaunchView   开屏广告(自营)
 *   adSystem/tempAdConfig/get       文章页推荐/底部广告开关
 *   app/config                      第三方开屏/信息流广告 SDK 配置
 *   lists/getListElements           首页信息流广告
 *   pageUi/*                        攻略/我的 等页面中的广告卡片
 */

const url = $request.url;
let body = $response.body;

function isAd(item) {
  if (!item || typeof item !== "object") return false;
  if (item.adCategory || item.adType) return true;
  if (item.beAdIconVisible === true || item.adIconShow === true) return true;
  const id = item.adId;
  return typeof id === "string" && id !== "" && id !== "0";
}

function cleanList(list) {
  if (!Array.isArray(list)) return list;
  return list.filter((item) => !isAd(item)).map((item) => {
    if (item && Array.isArray(item.childElements)) {
      item.childElements = cleanList(item.childElements);
    }
    return item;
  });
}

function cleanConfig(cfg) {
  for (const key of Object.keys(cfg)) {
    if (!/ad/i.test(key)) continue;
    const v = cfg[key];
    if (/ProviderName$|AdProvider$/i.test(key)) cfg[key] = "close";
    else if (/Percentage/i.test(key)) cfg[key] = 0;
    else if (/PositionNumbers$/i.test(key)) cfg[key] = [];
    else if (/OldVersionShowFixed.*Ad$/i.test(key)) cfg[key] = false;
    else if (/^(ios|android)launchAdId|^(ios|android)listAdId/i.test(key) && typeof v === "string") cfg[key] = "";
  }
  if (Array.isArray(cfg.preloadAdVideos)) cfg.preloadAdVideos = [];
}

try {
  const obj = JSON.parse(body);

  if (/\/adSystem\/ad\/getAdAtLaunchView/.test(url)) {
    if (obj.data) {
      obj.data.ad = null;
      if (obj.data.position) {
        obj.data.position.enable = 0;
        obj.data.position.isValidRequest = 0;
        obj.data.position.showSeconds = 0;
      }
    }
  } else if (/\/adSystem\/tempAdConfig\/get/.test(url)) {
    const cfg = obj.config || {};
    for (const k of Object.keys(cfg)) {
      const c = cfg[k];
      if (c && typeof c === "object") {
        if ("isEnable" in c) c.isEnable = false;
        if ("iOSEnable" in c && k !== "nativeContentPage") c.iOSEnable = false;
        if ("isOpenStatistics" in c) c.isOpenStatistics = false;
      }
    }
  } else if (/\/app\/config\//.test(url)) {
    if (obj.config) cleanConfig(obj.config);
  } else if (Array.isArray(obj.listElements)) {
    obj.listElements = cleanList(obj.listElements);
  }

  body = JSON.stringify(obj);
} catch (e) {
  console.log("Gamersky AdBlock error: " + e);
}

$done({ body });
