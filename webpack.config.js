const path = require('path');

module.exports = {
    /*
    externals: {
        "@babylonjs/core": 'BABYLON',
    },
    */
    /*
     module: {
         loaders: [
             {
                 test: /\.js$/,
                 loader: 'babel-loader?presets[]=es2015'
             }
         ]
     },*/
    //"plugins": ["@babel/plugin-proposal-class-properties"],
    entry: './src/index.js',
    output: {
        chunkFormat: "commonjs",
        filename: 'index.js',
        path: path.resolve(__dirname, 'public'),
    },
    //target: "es2015",
    devServer: {
        client: {
            overlay: false,
        },
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 9000,
    },
    /*
    module: {
        rules: [
          {
            test: /\.js$/,
            include: __dirname + '/src',
            use: {
              loader: 'babel-loader',
              options: {
                presets: ['es5']
              }
            }
          }
        ]
      }
      */
};