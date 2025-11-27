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
    delete: "Discard",
    confirmDelete: "Are you sure you want to discard this memory?",
    editorTitle: "Darkroom",
    frameLabel: "FRAME",
    dragHint: "Drag to Adjust",
    guide: {
      title: "Welcome to Polacam",
      step1: "Tap the Red Button to take a shot",
      step2: "Edit, Filter & Caption in the Darkroom",
      step3: "Watch it develop & Drag your photo anywhere!",
      button: "Let's Go!"
    }
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
    delete: "丢弃",
    confirmDelete: "确定要丢弃这张回忆吗？",
    editorTitle: "暗房",
    frameLabel: "取景框",
    dragHint: "拖动调整位置",
    guide: {
      title: "欢迎来到 Polacam",
      step1: "点击红色快门按钮拍摄照片",
      step2: "在暗房中裁剪、滤镜与手写标注",
      step3: "等待显影，照片可自由拖动摆放！",
      button: "开始体验"
    }
  }
};

export const t = (lang: Language, key: keyof typeof translations['en'] | string): string => {
  // @ts-ignore - simple nested key access not fully typed for brevity
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
