package com.aisino;

import android.app.Application;
import com.facebook.react.ReactApplication;
import com.github.alinz.reactnativewebviewbridge.WebViewBridgePackage;
import cn.jpush.reactnativejpush.JPushPackage;
import com.reactnative.ivpusic.imagepicker.PickerPackage;
import com.mehcode.reactnative.splashscreen.SplashScreenPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.remobile.toast.RCTToastPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;
import com.lwansbrough.RCTCamera.RCTCameraPackage;
import java.util.Arrays;
import java.util.List;



public class MainApplication extends Application implements ReactApplication {
	// 设置为 true 将不弹出 toast
    private boolean SHUTDOWN_TOAST = true;
    // 设置为 true 将不打印 log
    private boolean SHUTDOWN_LOG = true;

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new WebViewBridgePackage(),
            new JPushPackage(SHUTDOWN_TOAST, SHUTDOWN_LOG),
            new PickerPackage(),
            new SplashScreenPackage(),new RCTCameraPackage(),new RCTToastPackage(),
            new BadgePackage()
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);

  }
}
