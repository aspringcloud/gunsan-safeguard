module.exports = {
    "transpileDependencies": [
        "vuetify"
    ],


    configureWebpack: {
        devServer: {
            host: '0.0.0.0',
            port: '2080',
            disableHostCheck: true
        }
    }
}