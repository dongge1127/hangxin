@echo off
Setlocal enabledelayedexpansion
::CODER BY T460 POWERD BY iBAT 1.6
TITLE 查看日志
mode con cols=45 lines=5
echo Write log file to : E:\RNProject\LogFolder\Log.log
echo Please do not close this window
del E:\RNProject\LogFolder\Log.log
react-native log-android > E:\RNProject\LogFolder\Log.log
pause