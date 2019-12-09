# Cloudopt AdBlocker

<img src="https://cdn.cloudopt.net/20190508140125.jpg" width="800" />

Cloudopt AdBlocker 是基于 AdguardBrowserExtension 以及 Cloudopt 自主研发的云信誉评估技术的浏览器扩展，实时保护您的安全、防止追迹、恶意域名，过滤横幅广告、弹窗广告等等。可以做到：

1. 拦截常见广告。
2. 加速页面载入，节省带宽，屏蔽广告和弹窗。
3. 拦截各种间谍软件，广告软件和拨号安装程序。
4. 通过拦截常见第三方跟踪系统保护您的隐私。
5. 保护您对抗恶意和钓鱼攻击。
6. 保护您的电脑不会被挖矿脚本针对。
7. 阻止脚本从危险网站下载东西。

[您还可以直接前往官网下载体验。](https://www.cloudopt.net/)

## 如何参与

我们鼓励您参与这个开源项目。我们欢迎任何MR、提交BUG、提交建议、代码审查或任何其他积极贡献。

MR相关的规范可以参考我们其它开源项目的相关规范：https://next.cloudopt.net/#/zh-cn/contributing。


## 如何构建

本项目依赖于 [nodejs](https://nodejs.org/en/download/) 和 [yarn](https://yarnpkg.com/en/docs/install/#mac-stable)。

1. 拉取或者下载源码：

  ```shell
  git clone https://github.com/cloudoptlab/cloudopt-adblocker/
  ```

2. 到项目目录执行命令下载依赖：

  ```shell
  yarn install
  ```

3. 使用yarn构建：
  ```shell
  yarn build
  ```

构建完成后会将文件存放在dist目录下，可以直接使用浏览器的开发者模式加载。

## 开源协议

> This Source Code Form is subject to the terms of the GNU General Public License, v. 3.0. If a copy of the GPL was not distributed with this file, You can obtain one at https://www.gnu.org/licenses/gpl-3.0.en.html


## 引用许可

### AdguardBrowserExtension
- Project: https://github.com/AdguardTeam/AdguardBrowserExtension
- License: [GNU Lesser General Public License v3.0](https://github.com/AdguardTeam/AdguardBrowserExtension/blob/master/LICENSE)

### jqKeyboard
- Project: https://github.com/hawkgs/jqKeyboard
- License: [MIT License](https://github.com/hawkgs/jqKeyboard/blob/master/LICENSE)

### material-design-lite
- Project: https://github.com/google/material-design-lite
- License: [Apache License 2.0](https://github.com/google/material-design-lite/blob/mdl-1.x/LICENSE)

### noty
- Project: https://github.com/needim/noty
- License: [MIT License](https://github.com/needim/noty/blob/master/LICENSE.txt)

### DOMPurify
- Project: https://github.com/cure53/DOMPurify
- License: [Apache License Version 2.0](https://github.com/cure53/DOMPurify/blob/master/LICENSE)

### underscore
- Project: https://github.com/jashkenas/underscore
- License: [MIT License](https://github.com/jashkenas/underscore/blob/master/LICENSE)

### jquery
- Project: https://github.com/jquery/jquery
- License: [MIT License](https://github.com/jquery/jquery/blob/master/LICENSE.txt)

### json3
- Project: https://github.com/bestiejs/json3
- License: [MIT License](https://github.com/bestiejs/json3/blob/master/LICENSE)

### push
- Project: https://github.com/Nickersoft/push.js
- License: [MIT License](https://github.com/Nickersoft/push.js/blob/master/LICENSE.md)

### easylist
- Project: https://github.com/easylist/easylist
- License: [GNU General Public License version 3](https://easylist.to/pages/licence.html)

----

开发者 QQ 群： 142574864

关注 Cloudopt 公众号获取最新资讯：

![](https://kol-cdn.cloudopt.net/kol/2018/12/qrcode_for_gh_cace0716c068_258.jpg)