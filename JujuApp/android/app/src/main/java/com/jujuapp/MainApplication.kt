package com.jujuapp

import android.app.Application
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.shell.MainReactPackage
import com.facebook.soloader.SoLoader
import java.util.Arrays

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      object : ReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            Arrays.arrayListOf(
                MainReactPackage()
            )

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = false
        override val isHermesEnabled: Boolean = true
      }

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, false)
  }
}
