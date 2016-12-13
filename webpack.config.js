var webpack = require('webpack');
var ngAnnotatePlugin = require('ng-annotate-webpack-plugin');

module.exports = {
    entry: './sources/app.js',
    output: {
        path: './public',
        filename: 'bundle/app.js'
    },
    module: {
        preLoaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "jshint-loader"
            }
        ],
        loaders: [
            {
                test: /\.html$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'html',
                query: {
                    minimize: true
                }
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: [
                        "es2015"
                    ],
                    plugins: [
                        "transform-class-properties"
                    ]
                }
            },
            {
                test: /\.scss$/,
                exclude: /(node_modules|bower_components)/,
                loaders: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.json$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'json-loader'
            },
            {
                test: /\.(jpe?g|png|bmp|gif|svg)$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'file-loader',
                query: {
                    name: 'resources/[name].[ext]'
                }
            },
            {
                test: /\.glsl$/,
                loader: 'shader'
            }
        ]
    },
    plugins: [
        //new webpack.optimize.CommonsChunkPlugin('bundle/common.js'),
        //new webpack.optimize.DedupePlugin(),
        //new webpack.optimize.UglifyJsPlugin({
        //    mangle: {
        //        except: ['$super', '$', 'exports', 'require']
        //    },
        //    compress: {
        //        warnings: false
        //    },
        //    comments: false
        //}),
        //new webpack.optimize.AggressiveMergingPlugin(),
        //new ngAnnotatePlugin({
        //    add: true
        //})
    ],
    jshint: {
        camelcase: false,
        emitErrors: true,
        failOnHint: true,
        esnext: 'esversion: 6'
    },
    devtool: [
        'eval',
        'source-map'
    ],
    devServer: {
        contentBase: "./public"
    }
};
