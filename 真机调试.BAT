@echo on
::连接海马模拟器
::adb connect 127.0.0.1:26944
adb devices
::rd/s/q %~DP0android\app\build
react-native run-android
pause