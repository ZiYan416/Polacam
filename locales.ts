
/**
 * @file locales.ts
 * @description Translation strings for English and Chinese.
 */

import { Language } from './types';

export const translations = {
  en: {
    appTitle: "POLACAM",
    tagline: "DIGITAL ANALOG",
    memories: "Vibes",
    takePhoto: "SNAP",
    printPhoto: "PRINT IT",
    cancel: "Nah",
    zoom: "Scale",
    rotate: "Turn",
    rotateShort: "Rot",
    filters: "Moods",
    frame: "Ratio",
    caption: "Tag",
    captionPlaceholder: "Date / Mood / Vibe...",
    galleryTitle: "Darkroom",
    noPhotos: "Roll is empty. Go snap some moments!",
    download: "Save Image",
    saveToGallery: "Keep",
    saved: "Kept",
    delete: "Remove",
    confirmDelete: "Remove this memory? No going back.",
    editorTitle: "Edit Lab",
    frameLabel: "VIEWFINDER",
    dragHint: "Drag / Pinch",
    resetLayout: "Tidy Up",
    resetTransform: "Reset",
    nav: {
      camera: "Cam",
      gallery: "Space"
    },
    guide: {
      title: "Yo, Welcome to Polacam",
      step1: "Hit the red button to Snap.",
      step2: "Customize your film stock & mood.",
      step3: "Watch it fly out & Keep what you love.",
      button: "Start Snapping"
    },
    filtersList: {
      Normal: "Raw",
      "B&W": "Noir",
      Sepia: "1990s",
      Vintage: "Retro",
      Cool: "Chill"
    },
    framesList: {
      Square: "Square",
      Mini: "Mini",
      Wide: "Wide",
      Cinema: "Cinema",
      Portrait: "Portrait"
    },
    profile: {
      guest: "Guest Photographer",
      guestDesc: "Photos are stored locally on this device.",
      joined: "Joined",
      shots: "Shots",
      edit: "Edit Profile",
      logout: "Log Out",
      login: "Log In / Sign Up",
      bioPlaceholder: "Write a bio...",
      save: "Save Profile"
    },
    presets: [
      "Core Memory 🔒", "Main Character Energy ✨", "Touch Grass 🌿", "Chaos Mode ⚡️", "Vibe Check",
      "Pov: You're here", "Living Rent Free", "Serotonin Boost", "No Thoughts", "Just Vibes"
    ]
  },
  zh: {
    appTitle: "POLACAM",
    tagline: "DIGITAL ANALOG", // 保持英文
    memories: "张",
    takePhoto: "快门",
    printPhoto: "显影",
    cancel: "作罢",
    zoom: "缩放",
    rotate: "旋转",
    rotateShort: "转",
    filters: "风格", // 也就是滤镜
    frame: "画幅",
    caption: "印签", // 比文案更复古
    captionPlaceholder: "记录此刻的心绪...",
    galleryTitle: "我的暗房", // 比相册更有代入感
    noPhotos: "胶卷空空如也，去捕捉些光影吧",
    download: "留存原片",
    saveToGallery: "珍藏", // 比收藏更有情感
    saved: "已珍藏",
    delete: "移除", // 比删除更柔和
    confirmDelete: "确定要移除这段记忆吗？",
    editorTitle: "冲印室",
    frameLabel: "取景框",
    dragHint: "拖拽 / 双指缩放",
    resetLayout: "整理桌面",
    resetTransform: "归位",
    nav: {
      camera: "取景",
      gallery: "暗房"
    },
    guide: {
      title: "Polacam 使用指引",
      step1: "点击红色快门，捕捉光影瞬间。",
      step2: "进入冲印室，调整画幅、风格与印签。",
      step3: "照片吐出后，点击红心将其「珍藏」。",
      button: "开始创作"
    },
    filtersList: {
      Normal: "原片",
      "B&W": "黑白", // 经典
      Sepia: "流金", // 更有意境
      Vintage: "复古",
      Cool: "清冷"
    },
    framesList: {
      Square: "经典方",
      Mini: "三寸",
      Wide: "宽幅",
      Cinema: "电影感",
      Portrait: "肖像"
    },
    profile: {
      guest: "路过的摄影师",
      guestDesc: "当前为访客模式，照片仅保存在本机。",
      joined: "加入于",
      shots: "张胶片",
      edit: "修改资料",
      logout: "登出",
      login: "登录 / 注册",
      bioPlaceholder: "写下你的个性签名...",
      save: "保存资料"
    },
    presets: [
      "今日份甜 🍭", "这是什么神仙滤镜", "保持热爱 奔赴山海", "落日归山海 🌄", "碎片 +1",
      "营业一下 📸", "好心情加载中...", "又是被治愈的一天", "Stay Real", "Life is Good"
    ]
  }
};

export const t = (lang: Language, key: string): string => {
  const keys = key.split('.');
  let value: any = translations[lang];
  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      return key;
    }
  }
  return value as string;
};

export const getRandomCaption = (lang: Language): string => {
  const list = translations[lang].presets;
  return list[Math.floor(Math.random() * list.length)];
};
