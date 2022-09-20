@echo off
Setlocal enabledelayedexpansion
::CODER BY T460 POWERD BY iBAT 1.6
set /p input=请输入要安装的插件的名字：
choice /C YN /N /M 是否进行link操作？输入Y(y)进行link，输入N(n)不执行link操作，其它无效：
if %errorlevel%==1 (
echo 执行操作：1. npm install --save %input%  
echo 执行操作：2. react-native link %input%
echo 执行操作：3. 删除：%~DP0node_modules\rn-weui\node_modules\react-native
npm install --save %input% && react-native link %input%  && rd/s/q %~DP0node_modules\rn-weui\node_modules\react-native && cmd.exe
echo 操作完成！
)
if %errorlevel%==2 (
echo 执行操作：1. npm install --save %input%  
echo 执行操作：2. 删除：%~DP0node_modules\rn-weui\node_modules\react-native
npm install --save %input% && rd/s/q %~DP0node_modules\rn-weui\node_modules\react-native && cmd.exe
echo 操作完成！
)
pause