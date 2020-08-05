/**
 ** @module index.js
 */

'use strict';
// eslint-disable-next-line no-alert, quotes, semi
process.env.NODE_ENV = 'production';

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const Router = require('koa-router');
const koaBody = require('koa-body');
const cors = require('@koa/cors');

const app = new Koa();
let router = new Router();
app.use(cors());
app.use(bodyParser({strict:false}));
app.use(koaBody());


app.use(router.routes()).use(router.allowedMethods());




//подключение ORM
const Sequelize = require('sequelize'),
	//модуль для работы с файловой системой
	fs = require('fs'),
	//получение параметров базы даннных
	config = JSON.parse(fs.readFileSync(`./config/mysql.json`).toString());

//инициализация ORM
const sequelize = (module.exports.sequelize = new Sequelize(
	config.database,
	config.user,
	config.password,
	{
		dialect: config.dialect,
		host: config.host,
		define: {
			//отключение дополнительных параметров времени
			timestamps: true,
		},
		logging: false,
		timezone: '+03:00', // for writing to database
	},
));

/************************************
 * * Структура таблицы пользователи *
 * @constant Users                  *
 ************************************/
const Users = sequelize.define(
	'users',
	{
		id: {
			//тип данных
			type: Sequelize.INTEGER,
			//автоинкремент
			autoIncrement: true,
			//не может быть null
			allowNull: false,
			//указание первичного ключа
			primaryKey: true,
			//комментарий поля
			comment: 'Идентификатор пользователя',
		},
		username: {
			//тип данных
			type: Sequelize.STRING(100),
			//может содердать null
			allowNull: false,
			//комментарий
			comment: 'Имя пользователя',
		},
		password: {
			type: Sequelize.TEXT,
			allowNull: false,
			comment: 'Пароль пользователя',
		},
		barcode: {
			type: Sequelize.STRING(20),
			allowNull: false,
			comment: 'Код для полуенич скидки',
		},
	},

	{ comment: 'Пользователи' },
);

router.get('/auth/:username/:password', async (ctx, next) => {
	//параметры запроса
  const arg = ctx.params;
  console.log('arg', arg)
  let USER
	await Users.findOne({
		where: {
			username: arg.username,
			password: arg.password,
		},
		raw: true,
	}).then((res) => {
		USER = res
  });
  ctx.body = USER
});

/* 
 * Получение всех клментов
*/
//router.post('/getClient/')

let date = new Date();
let keyDate = {
  month: date.getMonth()+1,
  date: date.getDate(),
  day: date.getDay()
}
router.post(`/getClient1C/${keyDate.month}${keyDate.date}`, async (ctx, next) => {
  console.log('POST')
  console.log(ctx)
  const arg = ctx.request.body;
  console.log('arg', ctx.req)
  //console.log('keyDate', keyDate)
  ctx.body = {data: 'error'};
});

router.get('/', async (ctx, next) => {
	ctx.body = {data: 'error'};
});

router.get(`/getClient1C/${keyDate.month}${keyDate.date}/:data`, async (ctx, next) => {
  console.log('GET')
  //console.log(ctx)
  const arg = ctx.params;
  console.log('arg', JSON.parse(arg.data))
  //console.log('keyDate', keyDate)
  ctx.body = {data: 'error'};
});

/********************
 **  Запуск сервера *
 ********************/
//запуск сервера
app.listen(81, () => {
	//вывод сообщения о запуске сервера
	console.log(`Сервер запущен на порту 80`);
});

//инициализация таблиц
sequelize.sync({ force: false });
//Результат = "{" + Символ(34) + "SummaBonusa" + Символ(34) + ":" + Символ(34) + ВыборкаДетальныеЗаписи.СуммаБонусаОстаток + Символ(34) +"}";
