const path = require('path') // Импортируем модуль "path" для работы с путями файлов
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = {
	entry: './src/index.js', // Точка входа для сборки проекта

	output: {
		filename: 'bundle.js', // Имя выходного файла сборки
		path: path.resolve(__dirname, 'dist'), // Путь для выходного файла сборки
		assetModuleFilename: 'images/picture.svg',
	},

	devServer: {
		liveReload: true,
	},

	module: {
		rules: [
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader'],
			  },
			  {
				test: /\.(png|jpe?g|gif|svg)$/,
				type: 'asset/resource',
			  },
			{
				test: /\.svg$/,
				use: [
				  {
					loader: 'svg-url-loader',
					options: {
					  limit: 8192, // Определяет порог, выше которого будет использоваться отдельный файл
					},
				  },
				],
			  },
		],
	},

	plugins: [
		new HtmlWebpackPlugin({
			template: './src/index.html',
			inject: true,
			chunks: ['index'],
			filename: 'index.html',
		}),
        new HtmlWebpackPlugin({
			template: './src/add.html',
			inject: true,
			chunks: ['index'],
			filename: 'add.html',
		}),
		new HtmlWebpackPlugin({
			template: './src/main.html',
			inject: true,
			chunks: ['index'],
			filename: 'main.html',
		}),
		new HtmlWebpackPlugin({
			template: './src/projects.html',
			inject: true,
			chunks: ['index'],
			filename: 'projects.html',
		}),
		new HtmlWebpackPlugin({
			template: './src/tasks.html',
			inject: true,
			chunks: ['index'],
			filename: 'tasks.html',
		}),
		new HtmlWebpackPlugin({
			template: './src/about.html',
			inject: true,
			chunks: ['index'],
			filename: 'about.html',
		}),
	],

	devServer: {
		static: {
			directory: path.join(__dirname, 'dist'), // Каталог для статики
		},
		open: true, // Автоматически открывать браузер
	},

	mode: 'development', // Режим сборки
}