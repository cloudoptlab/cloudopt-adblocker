const path = require("path");
const glob = require("glob");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const mode = process.env.NODE_ENV || 'development'

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
            { from: "css", to: "css" },
            { from: "_locales", to: "_locales" },
            { from: "image", to: "image" },
            { from: "src/adguard", to: "adguard" },
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
    ],
    devtool: mode === 'development' ? 'inline-source-map' : '',
};