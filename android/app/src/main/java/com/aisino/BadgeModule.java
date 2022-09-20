package com.aisino;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import android.widget.Toast;
import android.app.Notification;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.Context;
import android.content.BroadcastReceiver;
import android.os.Build;
import android.app.ActivityManager;
import static android.content.Context.ACTIVITY_SERVICE;
import static android.content.Context.NOTIFICATION_SERVICE;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import me.leolin.shortcutbadger.*;

public class BadgeModule extends ReactContextBaseJavaModule {

    private NotificationManager mNotificationManager;

    private int notificationId = 99;

    private static final String NOTIFICATION_CHANNEL = "com.aisino";

    private static ReactApplicationContext reactApplicationContext;

public BadgeModule(ReactApplicationContext reactContext) {
    super(reactContext);
    reactApplicationContext = reactContext;
    mNotificationManager = (NotificationManager) reactContext.getSystemService(Context.NOTIFICATION_SERVICE);
}

    /**
     * 这个返回的字符串是我们js端调用时会用到的
     */
    @Override
    public String getName() {
        return "Badge";
    }
    /**
     *这个方法是我们js端调用的方法，其中的参数可以从js端传过来  如这里我们js端可以类似  Badge.showBadge(2)来调用这个方法
     */
    @ReactMethod
    public void showBadge(int badgeNum) {
        if(badgeNum < 0) return;
        boolean success = ShortcutBadger.applyCount(getCurrentActivity(), badgeNum);
    }


    @ReactMethod
    public void showBadgeAndNotification(int badgeNum) {
        if(badgeNum < 0) return;
        boolean success = ShortcutBadger.applyCount(getCurrentActivity(), badgeNum);
        if(!success){
                // 取消原通知
                // mNotificationManager.cancel(notificationId);
                //创建自定义通知点击事件调用js端
                Intent intent = new Intent(getReactApplicationContext(), MyNotificationReceiver.class);
                intent.putExtra("notificationId",notificationId);
                PendingIntent pendingIntent = PendingIntent.getBroadcast(getReactApplicationContext(), 0, intent, PendingIntent.FLAG_UPDATE_CURRENT);

                //小米专用
                Notification.Builder builder = new Notification.Builder(getCurrentActivity())
                    .setContentTitle("您有" + badgeNum + "条待审批单据")
                    .setContentText("点此处理")
                    .setContentIntent(pendingIntent)
                    .setWhen(System.currentTimeMillis())
                    .setAutoCancel(true)
                    .setSmallIcon(R.drawable.ic_launcher);

                /*if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    setupNotificationChannel();

                    builder.setChannelId(NOTIFICATION_CHANNEL);
                }*/

                Notification notification = builder.build();
                ShortcutBadger.applyNotification(getCurrentActivity(), notification, badgeNum);
                mNotificationManager.notify(notificationId, notification);
        }
        //getCurrentActivity().moveTaskToBack(true);
    }

    /**
     * 监听用户点击待审批消息的通知
     */
    public static class MyNotificationReceiver extends BroadcastReceiver {

        public MyNotificationReceiver() {
        }

        @Override
        public void onReceive(Context context, Intent data) {
            setTopApp(context);
            //取消通知栏展示 setAutoCancel 一样的效果
            //int notificationId = data.getIntExtra("notificationId", 0);
            //NotificationManager manager = (NotificationManager)context.getSystemService(Context.NOTIFICATION_SERVICE);
            //manager.cancel(notificationId);
            //原生调用js
            WritableMap map= Arguments.createMap();
            reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("openUnApproveNotification", map);
        }
    }


        /*@TargetApi(Build.VERSION_CODES.O)
        private void setupNotificationChannel() {
            NotificationChannel channel = new NotificationChannel(NOTIFICATION_CHANNEL, "a8fk",
                    NotificationManager.IMPORTANCE_DEFAULT);

            mNotificationManager.createNotificationChannel(channel);
        }*/

    /**
        * 将本应用置顶到最前端
        * 当本应用位于后台时，则将它切换到最前端
        *
        * @param context
        */
    public static void setTopApp(Context context) {
        /**获取ActivityManager*/
        ActivityManager activityManager = (ActivityManager) context.getSystemService(ACTIVITY_SERVICE);

        /**获得当前运行的task(任务)*/
        List<ActivityManager.RunningTaskInfo> taskInfoList = activityManager.getRunningTasks(100);
        for (ActivityManager.RunningTaskInfo taskInfo : taskInfoList) {
            /**找到本应用的 task，并将它切换到前台*/
            if (taskInfo.topActivity.getPackageName().equals(context.getPackageName())) {
                activityManager.moveTaskToFront(taskInfo.id, 0);
                break;
            }
        }
    }
}
