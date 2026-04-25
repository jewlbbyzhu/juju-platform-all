@echo off
chcp 65001
cd /d D:\DevTools\HBuilderX
cli.exe pack --project D:\workspace\uni-app-mobile --platform android --iscustom true --android.androidpacktype 1 --android.packagename uni.app.UNIJujuParty --android.certfile D:\workspace\android.keystore --android.certalias juju --android.certpassword zaqzzh521 --android.storepassword zaqzzh521
