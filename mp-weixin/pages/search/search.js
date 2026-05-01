"use strict";
const { partyApi } = require("../../api/party.js");

Page({
  data: {
    keyword: "",
    focused: true,
    loading: false,
    results: [],
    history: [],
    hotSearch: ["派对", "音乐节", "线下活动", "同城交友", "脱口秀"]
  },

  onLoad() {
    try {
      const history = wx.getStorageSync("searchHistory") || [];
      this.setData({ history });
    } catch (e) {}
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  clearKeyword() {
    this.setData({ keyword: "", results: [] });
  },

  onCancel() {
    wx.navigateBack();
  },

  onSearch() {
    const { keyword } = this.data;
    if (!keyword) return;
    
    this.saveHistory(keyword);
    this.setData({ loading: true });
    
    // 调用搜索API
    partyApi.searchParties({ keyword }).then((res) => {
      this.setData({ loading: false });
      if (res.success) {
        this.setData({ results: res.data || [] });
      }
    }).catch(() => {
      this.setData({ loading: false });
    });
  },

  saveHistory(keyword) {
    let { history } = this.data;
    history = history.filter(h => h !== keyword);
    history.unshift(keyword);
    history = history.slice(0, 10);
    this.setData({ history });
    wx.setStorageSync("searchHistory", history);
  },

  clearHistory() {
    this.setData({ history: [] });
    wx.removeStorageSync("searchHistory");
  },

  onHistoryTap(e) {
    const keyword = e.currentTarget.dataset.keyword;
    this.setData({ keyword }, () => {
      this.onSearch();
    });
  },

  onResultTap(e) {
    const { id, type } = e.currentTarget.dataset;
    if (type === "party") {
      wx.navigateTo({ url: `/pages/party-detail/party-detail?id=${id}` });
    } else if (type === "user") {
      wx.navigateTo({ url: `/pages/user-profile/user-profile?id=${id}` });
    }
  }
});