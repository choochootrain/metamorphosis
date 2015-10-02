var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var bourbon = require('node-bourbon');
var LiveReloadPlugin = require("webpack-livereload-plugin");
var WebpackNotifierPlugin = require('webpack-notifier');

var bourbon_include_paths = "includePaths[]=" + bourbon.includePaths.join("&includePaths[]=");

module.exports = {
    entry: __dirname + "/static/js/index.js",
    devtool: "cheap-source-map",
    output: {
        path: __dirname + "/static/assets",
        pathinfo: true,
        filename: "index.js"
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader?optional=runtime&loose"
            },
            {
                test: /\.scss$|\.css$/,
                loader: ExtractTextPlugin.extract("css!sass?" + bourbon_include_paths)
            },
            {
                test: /\.jpe?g$|\.gif$|\.png$|\.svg$|\.woff$|\.ttf$/,
                loader: "file"
            }
        ]
    },

    resolve: {
        modulesDirectories: [
            __dirname + "/static/js",
            __dirname + "/static/scss",
            "node_modules",
        ]
    },

    plugins: [
        new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
        new ExtractTextPlugin("styles.css", { allChunks: true }),
        new LiveReloadPlugin(),
        new WebpackNotifierPlugin({
            title: "Webpack Build Complete", alwaysNotify: true
        })
    ]
};
