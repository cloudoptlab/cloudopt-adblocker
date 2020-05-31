const path = require("path");
const glob = require("glob");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const mode = process.env.NODE_ENV || 'development'
const ConcatPlugin = require('webpack-concat-plugin');

module.exports = {
    entry: {
        background: glob.sync("./src/background/*.ts").filter(file => !file.endsWith(".d.ts")),
        content: glob
            .sync("./src/content/*.ts")
            .filter(file => !file.endsWith(".d.ts"))
            .filter(file => file != "block.ts"),
        block: "./src/content/block.ts",
        popup: "./src/popup/popup.ts",
        option: "./src/option/option.ts",
        guide: "./src/guide/guide.ts",
        suspend: "./src/suspend/suspend.ts",
    },
    mode,
    module: {
        rules: [{
                test: /\.ts$/,
                use: "ts-loader",
            },
            {
                test: /\.svg/,
                use: ["file-loader"],
            },
            {
                test: /\.scss|\.css$/,
                use: [
                    "style-loader", // 将 JS 字符串生成为 style 节点
                    "css-loader", // 将 CSS 转化成 CommonJS 模块
                    "sass-loader", // 将 Sass 编译成 CSS，默认使用 Node Sass
                ],
            },
        ],
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            "@image": "image/",
        },
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].js",
        chunkFilename: "[name].[hash].chunk.js",
    },
    externals: {
        jquery: "jQuery",
        "@antv/g2": "G2",
        "@antv/data-set": "DataSet",
        lodash: {
            root: "_",
            amd: "lodash",
            commonjs: "lodash"
        }
    },
    performance: {
        hints: false
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: "manifest.json" },
            { from: "node_modules/material-design-lite/dist/material.min.js", to: "lib/mdl/" },
            { from: "node_modules/material-design-lite/dist/material.min.css", to: "lib/mdl/" },
            { from: "node_modules/bootstrap/dist/js/bootstrap.min.js", to: "lib/bootstrap/" },
            { from: "node_modules/bootstrap/dist/css/bootstrap.min.css", to: "lib/bootstrap/" },
            { from: "node_modules/shards-ui/dist/js/shards.min.js", to: "lib/shardsUI/" },
            { from: "node_modules/shards-ui/dist/css/shards.min.css", to: "lib/shardsUI/" },
            { from: "node_modules/babel-polyfill/dist/polyfill.min.js", to: "lib/" },
            { from: "node_modules/jquery/dist/jquery.min.js", to: "lib/" },
            { from: "node_modules/lodash/lodash.min.js", to: "lib/lodash/" },
            { from: "node_modules/popper.js/dist/umd/popper.min.js", to: "lib/" },
            { from: "node_modules/@antv/g2/dist/g2.min.js", to: "lib/g2/" },
            { from: "node_modules/@antv/data-set/dist/data-set.min.js", to: "lib/g2/" },
            { from: "node_modules/dompurify/dist/purify.min.js", to: "lib/purify.min.js" },
            { from: "src/background/defaultAllowAds.cn.json", to: "lib/" },
            { from: "src/libs/icon", to: "lib/icon" },
            { from: "src/adg/assistant.js", to: "adguard" },
            { from: "css", to: "css" },
            { from: "_locales", to: "_locales" },
            { from: "image", to: "image" },
        ]),
        new HtmlWebpackPlugin({
            filename: "background.html",
            template: "./src/background/background.html",
            chunks: ["background"],
            inject: "body",
        }),
        new HtmlWebpackPlugin({
            filename: "popup.html",
            template: "./src/popup/popup.html",
            chunks: ["popup"],
            inject: true,
        }),
        new HtmlWebpackPlugin({
            filename: "option.html",
            template: "./src/option/option.html",
            chunks: ["option"],
            inject: true,
        }),
        new HtmlWebpackPlugin({
            filename: "guide.html",
            template: "./src/guide/guide.html",
            chunks: ["guide"],
            inject: true,
        }),
        new HtmlWebpackPlugin({
            filename: "suspend.html",
            template: "./src/suspend/suspend.html",
            chunks: ["suspend"],
            inject: true,
        }),
        new ConcatPlugin({
            uglify: false,
            sourceMap: false,
            outputPath: 'adguard',
            fileName: 'adguard-api.js',
            injectType: 'none',
            filesToConcat: [
                // Third party libraries
                './src/adguard/lib/libs/deferred.js',
                './src/adguard/lib/libs/sha256.js',
                './src/adguard/lib/utils/punycode.js',
                './src/adguard/lib/libs/filter-downloader.js',
                './src/adguard/lib/libs/crypto-js/core.js',
                './src/adguard/lib/libs/crypto-js/md5.js',
                './src/adguard/lib/filter/rules/scriptlets/redirects.js',
                './src/adguard/lib/filter/rules/scriptlets/scriptlets.js',
                // Adguard Global and presrc/adguard/ferences
                './src/adguard/lib/adguard.js',
                './src/adguard/browser/webkit/lib/prefs.js',
                // Utils libraries
                './src/adguard/lib/utils/common.js',
                './src/adguard/lib/utils/log.js',
                './src/adguard/lib/utils/public-suffixes.js',
                './src/adguard/lib/utils/url.js',
                './src/adguard/lib/utils/notifier.js',
                './src/adguard/lib/utils/browser-utils.js',
                './src/adguard/lib/utils/service-client.js',
                './src/adguard/lib/utils/page-stats.js',
                './src/adguard/lib/utils/user-settings.js',
                './src/adguard/lib/utils/frames.js',
                './src/adguard/lib/utils/cookie.js',
                // Local storage and rules storage libraries
                './src/adguard/browser/chrome/lib/utils/local-storage.js',
                './src/adguard/browser/chrome/lib/utils/rules-storage.js',
                './src/adguard/lib/storage.js',
                // Chromium api adapter libraries
                './src/adguard/browser/chrome/lib/content-script/common-script.js',
                './src/adguard/browser/chrome/lib/api/background-page.js',
                // Tabs api library
                './src/adguard/browser/chrome/lib/api/tabs.js',
                './src/adguard/lib/tabs/tabs-api.js',
                // Rules and filters libraries
                './src/adguard/lib/filter/rules/rules.js',
                './src/adguard/lib/filter/rules/shortcuts-lookup-table.js',
                './src/adguard/lib/filter/rules/domains-lookup-table.js',
                './src/adguard/lib/filter/rules/url-filter-lookup-table.js',
                './src/adguard/lib/filter/rules/simple-regex.js',
                './src/adguard/lib/filter/rules/base-filter-rule.js',
                './src/adguard/lib/filter/rules/css-filter-rule.js',
                './src/adguard/lib/filter/rules/css-filter.js',
                './src/adguard/lib/filter/rules/script-filter-rule.js',
                './src/adguard/lib/filter/rules/script-filter.js',
                './src/adguard/lib/filter/rules/url-filter-rule.js',
                './src/adguard/lib/filter/rules/url-filter.js',
                './src/adguard/lib/filter/rules/content-filter-rule.js',
                './src/adguard/lib/filter/rules/content-filter.js',
                './src/adguard/lib/filter/rules/csp-filter.js',
                './src/adguard/lib/filter/rules/cookie-filter.js',
                './src/adguard/lib/filter/rules/redirect-filter.js',
                './src/adguard/lib/filter/rules/replace-filter.js',
                './src/adguard/lib/filter/rules/filter-rule-builder.js',
                './src/adguard/lib/filter/rules/scriptlet-rule.js',
                './src/adguard/lib/filter/rules/redirect-filter.js',
                './src/adguard/lib/filter/rules/composite-rule.js',
                // Filters metadata and filtration modules
                './src/adguard/lib/filter/subscription.js',
                './src/adguard/lib/filter/update-service.js',
                './src/adguard/lib/filter/whitelist.js',
                './src/adguard/lib/filter/userrules.js',
                './src/adguard/lib/filter/filters.js',
                './src/adguard/lib/filter/antibanner.js',
                './src/adguard/lib/filter/request-blocking.js',
                './src/adguard/lib/filter/cookie-filtering.js',
                './src/adguard/lib/filter/filtering-log.js',
                './src/adguard/lib/filter/request-context-storage.js',
                './src/adguard/lib/filter/rule-converter.js',
                // Content messaging
                './src/adguard/lib/content-message-handler.js',
                './src/adguard/lib/stealth.js',
                './src/adguard/lib/webrequest.js',
                './src/adguard/api/chrome/lib/api.js',
            ],
            attributes: {
                async: true
            }
        }),
        new ConcatPlugin({
            uglify: false,
            sourceMap: false,
            outputPath: 'adguard',
            fileName: 'adguard-content.js',
            injectType: 'none',
            filesToConcat: [
                './src/adguard/lib/utils/element-collapser.js',
                './src/adguard/lib/libs/extended-css.js',
                './src/adguard/lib/content-script/adguard-content.js',
                './src/adguard/browser/chrome/lib/content-script/common-script.js',
                './src/adguard/browser/chrome/lib/content-script/content-script.js',
                './src/adguard/lib/content-script/wrappers.js',
                './src/adguard/lib/content-script/preload.js',
            ],
            attributes: {
                async: true
            }
        }),
        new ConcatPlugin({
            uglify: false,
            sourceMap: false,
            outputPath: 'adguard',
            fileName: 'adguard-assistant.js',
            injectType: 'none',
            filesToConcat: [
                './src/adguard/lib/content-script/adguard-content.js',
                './src/adguard/browser/chrome/lib/content-script/common-script.js',
                './src/adguard/browser/chrome/lib/content-script/content-script.js',
                './src/adguard/lib/content-script/i18n-helper.js',
                './src/adguard/lib/content-script/assistant/js/start-assistant.js',
            ],
            attributes: {
                async: true
            }
        }),
    ],
    devtool: mode === 'development' ? 'inline-source-map' : '',
};
