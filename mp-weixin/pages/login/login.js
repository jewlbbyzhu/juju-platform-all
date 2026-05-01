"use strict";
const { authApi } = require("../../api/auth.js");
const { useUserStore } = require("../../stores/user.js");

Page({
  data: {
    agreed: false,
    phone: "",
    code: "",
    showPhoneModal: false,
    countdown: 0
  },

  onLoad() {
    const userStore = useUserStore();
    if (userStore.token.value) {
      wx.switchTab({ url: "/pages/index/index" });
    }
  },

  onWechatLogin() {
    if (!this.data.agreed) {
      wx.showToast({ title: "请先同意用户协议", icon: "none" });
      return;
    }
    wx.showLoading({ title: "登录中..." });
    
    wx.login({
      success: (res) => {
        if (!res.code) {
          wx.hideLoading();
          wx.showToast({ title: "登录失败", icon: "none" });
          return;
        }
        
        authApi.login(res.code).then((result) => {
          wx.hideLoading();
          if (result.success) {
            const userStore = useUserStore();
            userStore.setToken(result.data.token);
            userStore.setUserInfo(result.data.userInfo);
            wx.switchTab({ url: "/pages/index/index" });
          } else {
            wx.showToast({ title: result.message || "登录失败", icon: "none" });
          }
        }).catch(() => {
          wx.hideLoading();
          wx.showToast({ title: "网络错误", icon: "none" });
        });
      }
    });
  },

  showPhoneLogin() {
    this.setData({ showPhoneModal: true });
  },

  hidePhoneLogin() {
    this.setData({ showPhoneModal: false });
  },

  onPhoneInput(e) {
    this.setData({ phone: e.detail.value });
  },

  onCodeInput(e) {
    this.setData({ code: e.detail.value });
  },

  sendVerifyCode() {
    const phone = this.data.phone;
    if (!phone || phone.length !== 11) {
      wx.showToast({ title: "请输入正确手机号", icon: "none" });
      return;
    }
    
    authApi.sendVerifyCode(phone).then((res) => {
      if (res.success) {
        this.setData({ countdown: 60 });
        this.startCountdown();
        wx.showToast({ title: "验证码已发送", icon: "success" });
      } else {
        wx.showToast({ title: res.message || "发送失败", icon: "none" });
      }
    });
  },

  startCountdown() {
    const interval = setInterval(() => {
      const { countdown } = this.data;
      if (countdown <= 1) {
        clearInterval(interval);
        this.setData({ countdown: 0 });
      } else {
        this.setData({ countdown: countdown - 1 });
      }
    }, 1000);
  },

  onPhoneLogin() {
    const { phone, code } = this.data;
    if (!phone || !code) {
      wx.showToast({ title: "请填写完整", icon: "none" });
      return;
    }
    
    wx.showLoading({ title: "登录中..." });
    authApi.phoneLogin(phone, code).then((res) => {
      wx.hideLoading();
      if (res.success) {
        const userStore = useUserStore();
        userStore.setToken(res.data.token);
        userStore.setUserInfo(res.data.userInfo);
        this.setData({ showPhoneModal: false });
        wx.switchTab({ url: "/pages/index/index" });
      } else {
        wx.showToast({ title: res.message || "登录失败", icon: "none" });
      }
    }).catch(() => {
      wx.hideLoading();
      wx.showToast({ title: "网络错误", icon: "none" });
    });
  },

  onAgreeChange(e) {
    this.setData({ agreed: e.detail.value.includes("agree") });
  },

  showUserAgreement() {
    wx.showModal({
      title: "用户协议",
      content: "这里是用户协议内容...",
      showCancel: false
    });
  },

  showPrivacyPolicy() {
    wx.showModal({
      title: "隐私政策",
      content: "这里是隐私政策内容...",
      showCancel: false
    });
  }
});