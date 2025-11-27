/**
 * @file locales.ts
 * @description Translation strings for English and Chinese.
 */

import { Language } from './types';

export const translations = {
  en: {
    appTitle: "Polacam",
    tagline: "OneStep",
    memories: "memories",
    takePhoto: "Take Photo",
    printPhoto: "PRINT PHOTO",
    cancel: "Cancel",
    zoom: "Zoom",
    rotate: "Rotate 90°",
    rotateShort: "Rotate",
    filters: "Filters",
    caption: "Caption",
    captionPlaceholder: "Add a date or note...",
    galleryTitle: "Photo Wall",
    noPhotos: "No photos yet. Start snapping!",
    download: "Download",
    saveToGallery: "Save",
    saved: "Saved!",
    delete: "Discard",
    confirmDelete: "Are you sure you want to discard this memory?",
    editorTitle: "Darkroom",
    frameLabel: "FRAME",
    dragHint: "Drag to Adjust",
    nav: {
      camera: "Studio",
      gallery: "Gallery"
    },
    guide: {
      title: "Welcome to Polacam",
      step1: "Tap the Red Button to take a shot",
      step2: "Edit, Filter & Caption in the Darkroom",
      step3: "Watch it develop & Drag your photo anywhere!",
      button: "Let's Go!"
    },
    filtersList: {
      Normal: "Normal",
      "B&W": "B&W",
      Sepia: "Sepia",
      Vintage: "Vintage",
      Cool: "Cool"
    },
    presets: [
      "Summer Vibes", "Good Times", "Wanderlust", "Pure Joy", "Dream Big",
      "Stay Wild", "Memories", "Golden Hour", "Forever", "Love This"
    ]
  },
  zh: {
    appTitle: "Polacam",
    tagline: "拍立得",
    memories: "张回忆",
    takePhoto: "拍照",
    printPhoto: "冲印照片",
    cancel: "取消",
    zoom: "缩放",
    rotate: "旋转 90°",
    rotateShort: "旋转",
    filters: "滤镜",
    caption: "标注",
    captionPlaceholder: "添加日期或心情...",
    galleryTitle: "照片墙",
    noPhotos: "暂无照片，快去拍摄第一张吧！",
    download: "下载原图",
    saveToGallery: "收藏",
    saved: "已收藏",
    delete: "丢弃",
    confirmDelete: "确定要丢弃这张回忆吗？",
    editorTitle: "暗房",
    frameLabel: "取景框",
    dragHint: "拖动调整位置",
    nav: {
      camera: "相机",
      gallery: "相册"
    },
    guide: {
      title: "欢迎来到 Polacam",
      step1: "点击红色快门按钮拍摄照片",
      step2: "在暗房中裁剪、滤镜与手写标注",
      step3: "等待显影，照片可自由拖动摆放！",
      button: "开始体验"
    },
    filtersList: {
      Normal: "原片",
      "B&W": "黑白",
      Sepia: "怀旧",
      Vintage: "复古",
      Cool: "冷调"
    },
    presets: [
      "夏日限定", "美好时光", "诗与远方", "简单的快乐", "追梦",
      "保持热爱", "独家记忆", "日落跌进星河", "永远热泪盈眶", "喜欢"
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
