# 手动修改依赖
1. node_modules/react-native/React/Base/RCTModuleMethod.m
    ```
    static BOOL RCTParseUnused(const char **input)
    {
      return RCTReadString(input, "__unused") ||
      RCTReadString(input, "__attribute__((__unused__))") || // 增加这行
             RCTReadString(input, "__attribute__((unused))");
    }
    ```
2. node_modules/native-echarts/src/util/toString.js
    ```
    export default function toString(obj) {
      return JSON.stringify(obj, function(key, val) {
        if (typeof val === 'function') {
          return `~--demo--~${val}~--demo--~`;
        }
        return val;
      }).replace('\"~--demo--~', '').replace('~--demo--~\"', '').replace(/\\n/g, '').replace(/\\\"/g,"\"");
    }
    ```
