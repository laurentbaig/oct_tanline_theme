const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    entry: './src/main.js',
    mode: 'development',
    output: {
	path: path.resolve(__dirname, 'dist'),
	filename: 'main.js'
    },
    plugins: [
	new MiniCssExtractPlugin({
            filename: 'styles.css',
            chunkFilename: 'styles.css',
            ignoreOrder: false
	})
    ],
    module: {
	rules: [
	    {
		test: /\.css$/,
		exclude: /node_modules/,
		use: [
		    {
			/*
			loader: 'style-loader'
			*/
			loader: MiniCssExtractPlugin.loader,
			options: {
			    hmr: process.env.NODE_ENV === 'development'
			},
		    },
		    {
			loader: 'css-loader',
			options: {
			    importLoaders: 1,
			}
		    },
		    {
			loader: 'postcss-loader',
			options: {
			    ident: 'postcss',
			    plugins: [
				require('postcss-easy-import'),
				require('tailwindcss'),
				require('autoprefixer'),
			    ],
			},
		    },
		]
	    },
	    {
		include: /node_modules/,
		test: /\.css$/,
		loaders: [
		    'style-loader',
		    'css-loader'
		],
	    },
	    /*
	    {
		test: /\.woff2?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
		use: 'url-loader?limit=10000',
	    },
	    {
		test: /\.(ttf|eot|svg)$/,
		loader: 'url-loader?limit=10000'
	    }
	    */
	    {
		test: /\.(ttf|eot|svg|woff2?)$/,
		loader: 'file-loader',
		options: {
		    name: '[name].[ext]',
		    outputPath: 'fonts',
		    publicPath: 'themes/tanline/assets/dist/fonts'
		}
	    },
	]
    }
};
