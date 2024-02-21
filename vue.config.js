const { defineConfig } = require('@vue/cli-service')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')
const path = require('path')
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')

const AutoImport = require('unplugin-auto-import/webpack')
const Components = require('unplugin-vue-components/webpack')
const { ElementPlusResolver } = require('unplugin-vue-components/resolvers')

const cesiumSource = './node_modules/cesium/Source'
const cesiumBuild = './node_modules/cesium/Build/Cesium'
const cesiumWorkers = '../Build/Cesium/Workers'
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: './',
  outputDir: 'xxx', // 输出文件目录
  lintOnSave: false, // eslint 是否在保存时检查 关闭语法检查
  // assetsDir: 'static', // 配置js、css静态资源二级目录的位置

  configureWebpack: {
    output: {
      sourcePrefix: ' '
    },
    amd: {
      toUrlUndefined: true
    },
    resolve: {
      extensions: ['.js', '.json', '.mjs', '.vue', '.ts', '.jsx', '.tsx'],
      alias: {
        '@': path.resolve('src'),
        views: '@/views',
        utils: '@/utils',
        store: '@/store',
        cesium: path.resolve(__dirname, cesiumSource)
      },
      // 参考别人说的，我不太懂webpack，所以都不知道咋解决https zlib问题  必写-2
      fallback: { https: false, zlib: false, http: false, url: false }
    },
    plugins: [
      // 对于webpack版本此处有不同配置，webpack低版本5.x执行下面4行注释的代码，对于webpack高版本9.x及以上，patterns是可以的。
      new CopyWebpackPlugin({
        patterns: [
          { from: path.join(cesiumSource, cesiumWorkers), to: 'Workers' },
          { from: path.join(cesiumSource, 'Assets'), to: 'Assets' },
          { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets' },
          {
            from: path.join(cesiumSource, 'ThirdParty/Workers'),
            to: 'ThirdParty/Workers'
          }
        ]
      }),
      // new CopyWebpackPlugin([ { from: path.join(cesiumSource, 'Workers'), to: 'Workers'}]),
      // new CopyWebpackPlugin([ { from: path.join(cesiumSource, 'Assets'), to: 'Assets'}]),
      // new CopyWebpackPlugin([ { from: path.join(cesiumSource, 'Widgets'), to: 'Widgets'}]),
      // new CopyWebpackPlugin([ { from: path.join(cesiumSource, 'ThirdParty/Workers'), to: 'ThirdParty/Workers'}]),
      // new NodePolyfillPlugin(),
      new webpack.DefinePlugin({
        // BASE_URL: "'./'",
        // __VUE_OPTIONS_API__: true,
        // __VUE_PROD_DEVTOOLS__: false,
        CESIUM_BASE_URL: JSON.stringify('./')
        // CopyWebpackPlugin from的绝对路径
      }),
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      })
    ],
    // 不使用这个loader，也就不用安装

    module: {
      rules: [
        {
          test: /\.(jpe?g|png|gif|svg|xml|json|TGA)$/,
          type: 'asset',
          generator: {
            filename: 'img/[name]_[hash:6][ext]'
          },
          parser: {
            dataUrlCondition: {
              maxSize: 100 * 1024
            }
          }
        },
        {
          test: /\.(eot|ttf|woff2?)$/,
          type: 'asset/resource',
          generator: {
            filename: 'font/[name]_[hash:6][ext]'
          }
        },
        {
          test: /\.js$/,
          use: {
            loader: '@open-wc/webpack-import-meta-loader'
          }
        }
        // {
        //   test: /\.(glb|gltf)?$/,
        //   use: {
        //     loader: 'url-loader'
        //   }
        // }
        // {
        //   test: /\.js$/,
        //   loader: 'babel-loader'
        // }
        // {
        //   test: /\.worker.js$/,
        //   use: {
        //     loader: 'worker-loader',
        //     options: { inline: true, name: 'workerName.[hash].js' }
        //   }
        // }
      ]
    }
  },
  parallel: false
})
