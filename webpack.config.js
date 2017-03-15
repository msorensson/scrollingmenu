require('babel-polyfill');
var path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var autoprefixer = require('autoprefixer');

module.exports = {
    entry: {
        'script': ['babel-polyfill', './src/script.js'],
        'style': './src/style.scss'
    },

    output: {
        filename: '[name].js',
        path: path.join(__dirname, 'build'),
        publicPath: '',
        libraryTarget: 'umd'
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel',
                query: {
                    presets: ['es2015']
                }
            },
            {
                test: /\.scss$/,
                loader: ExtractTextPlugin.extract('style', 'css!postcss!resolve-url!sass?sourceMap!import-glob')
            },
            {
                test: /\.(png|gif|svg|jpg|woff|woff2|eot|ttf|)$/,
                loader: 'url-loader?limit=8192' // inline base64 URLs for <=8k files, direct URLs for the rest
            }
        ]
    },

    postcss: [
        autoprefixer({ browsers: ['> 0.5%'] })
    ],

    plugins: [
        new ExtractTextPlugin('[name].css', { allChunks: true })
    ]
};
