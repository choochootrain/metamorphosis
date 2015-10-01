var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
    entry: path.join(__dirname, "/static/js/index.js"),

    devtool: "cheap-source-map",

    output: {
        path: path.join(__dirname, "/static/assets"),
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
                test: /\.css$/,
                loader: ExtractTextPlugin.extract("style-loader", "css-loader")
            }
        ]
    },

    resolve: {
        modulesDirectories: [ path.join(__dirname, "/static/js"), "node_modules" ]
    },

    plugins: [
        new ExtractTextPlugin("styles.css", { allChunks: true })
    ]
};
