module.exports = {
  devServer: {
    proxy: {
      "/api": {
        target: "http://localhost:3000"
      }
    }
  },
  chainWebpack: config => {
    config.module
      .rule("worker")
      .test(/\.worker\.js$/)
      .use("worker-loader")
      .loader("worker-loader")
      .end();
  },
  pluginOptions: {
    quasar: {
      theme: "ios",
      importAll: true
    }
  },
  transpileDependencies: [/[\\/]node_modules[\\/]quasar-framework[\\/]/],
  pwa: {
    name: "Wordscapes",
    themeColor: "#3fb3d3",
    backgroundColor: "#FFFFFF",
    msTileColor: "#FFFFFF",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "black",
    iconPaths: {
      favicon32: "img/icons/favicon-32x32.png",
      favicon16: "img/icons/favicon-16x16.png",
      appleTouchIcon: "img/icons/apple-touch-icon-152x152.png",
      maskIcon: "img/icons/safari-pinned-tab.svg",
      msTileImage: "img/icons/msapplication-icon-144x144.png"
    },
    workboxOptions: {
      skipWaiting: true
    }
  }
};
