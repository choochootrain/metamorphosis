var webpack = require('webpack');

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
            }
        ]
    },

    resolve: {
        modulesDirectories: [ "/static/js", "node_modules" ]
    }
};
