const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'src', 'js', 'index.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['.js']
    },
    devServer: {
        contentBase: path.resolve(__dirname, "dist"),
        publicPath: '/'
    },
   module: {
      rules: [
         {
             test: /\.js/,
             use: {
                loader: 'babel-loader',
                options: { presets: ['es2015'] }
             }
         },
      ]
   }
}
