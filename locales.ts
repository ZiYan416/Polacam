
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
    galleryTitle: "My Collection",
    noPhotos: "Empty roll. Go snap some vibes!",
    download: "Save Image",
    saveToGallery: "Keep",
    saved: "Kept!",
    delete: "Trash",
    confirmDelete: "Delete this vibe? No going back.",
    editorTitle: "Edit Lab",
    frameLabel: "VIEWFINDER",
    dragHint: "Drag / Pinch",
    nav: {
      camera: "Cam",
      gallery: "Vibes"
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
      Square: "Classic",
      Mini: "Instax",
      Wide: "Wide"
    },
    presets: [
      "Core Memory 🔒", "Main Character Energy ✨", "Touch Grass 🌿", "Chaos Mode ⚡️", "Vibe Check",
      "Pov: You're here", "Living Rent Free", "Serotonin Boost", "No Thoughts", "Just Vibes"
    ]
  },
  zh: {
    appTitle: "POLACAM",
    tagline: "赛博拍立得",
    memories: "张碎片",
    takePhoto: "咔嚓",
    printPhoto: "出片",
    cancel: "算了",
    zoom: "缩放",
    rotate: "旋转",
    rotateShort: "转",
    filters: "氛围感",
    frame: "画幅",
    caption: "日签",
    captionPlaceholder: "记录此刻的心情...",
    galleryTitle: "碎片收集",
    noPhotos: "胶卷空空如也，去捕捉瞬间吧",
    download: "保存原图",
    saveToGallery: "收藏",
    saved: "已收藏",
    delete: "丢弃",
    confirmDelete: "确定要丢弃这张碎片吗？无法找回哦。",
    editorTitle: "修图室",
    frameLabel: "取景框",
    dragHint: "拖拽 / 双指缩放",
    nav: {
      camera: "拍摄",
      gallery: "相册"
    },
    guide: {
      title: "Polacam 操作指南",
      step1: "点击底部红钮，捕捉瞬间。",
      step2: "在修图室调整画幅、滤镜与文案。",
      step3: "照片弹出后，点击红心收藏喜欢的碎片。",
      button: "开始记录"
    },
    filtersList: {
      Normal: "原片",
      "B&W": "黑白",
      Sepia: "胶片",
      Vintage: "复古",
      Cool: "清冷"
    },
    framesList: {
      Square: "经典方",
      Mini: "三寸",
      Wide: "宽幅"
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
