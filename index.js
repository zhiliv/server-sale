//ctx.request.body // your POST params
//ctx.params // URL params, like :id

/**
 ** @module index.js
 */

'use strict';
// eslint-disable-next-line no-alert, quotes, semi
process.env.NODE_ENV = 'production';

const Koa = require('koa'),
	//подключение koa сервера
	bodyParser = require('koa-bodyparser'),
	//парсер параметров адресной строки
	Router = require('koa-router'),
	//подключени роутера
	koaBody = require('koa-body'),
	//подуль для получение параметров post
	cors = require('@koa/cors'),
	//подключение cors чтобы можно было делать запросы со сторонних ресурсов
	table = require('./tables'),
	//модуль с таблицами
	moment = require('moment'),
	//библиотека для рабты с дайтой и временем
	clc = require('cli-color'),
	//цвеитовая подсветка в консоли
	app = new Koa(),
	//создание экземплята сервера
	router = new Router();
//создание нового экземпляра роутера

app.use(cors());
//установка cors для сервера
app.use(bodyParser({ strict: false }));
//устанока парсера параметров для сервера

//app.use(koaBody());
//устанока парсера параметров для сервера POST
app.use(router.routes()).use(router.allowedMethods());
//установка роутера для сервера

app.use(function(ctx) {
  ctx.body = { status: 'OK' };
});

/**
 ** Получение данных авторизации
 * @method post
 * @param {String} username Имя пользваотеля
 * @param {String} pass Пароль пользователя
  */
router.post('/auth', async ctx => {
  const arg = ctx.request.body;
   //параметры запроса
 	let USER; //переменная для храения днных пользователя
	await table.Users.findOne({
		where: {
			username: arg.username,
			password: arg.password,
		},
		raw: true,
	}).then((res) => {
    console.log('res', res)
		USER = res;
	})
	ctx.body = {USER : 'test'} ;
});

/*
 * Регистрация новго пользователя
 * @method post
 * @param {String} arg Параметры
 * @param {String} arg.fio Фамилия Имя Отчество
 * @param {String} arg.email Электронная почта
 * @param {String} arg.dr Дата рождения
  */
router.post('/newuser', async ctx => {
 //TODO
})


/*
 * Получение всех клментов
 */
//router.post('/getClient/')

let date = new Date();
let keyDate = {
	month: date.getMonth() + 1,
	date: date.getDate(),
	day: date.getDay(),
};

router.get('/:name', async (ctx, next) => {
  const arg = ctx.params;
	console.log('arg', arg.name);
	ctx.body = { data: 'error' };
});

router.get('/getClientServer', async (ctx) => {
	console.log('1231');
	let data = await table.dataUser.findAll();
	ctx.body = data;
});

//полчение данных из 1с
router.get(`/getClient1C/${keyDate.month}${keyDate.date}/:data`, async (ctx, next) => {
	const arg = JSON.parse(ctx.params.data);
	//console.log(clc.yellow('arg'), arg);
	let checkNumCard = await table.dataUser.findOne({
		where: {
			numCard: Number(arg.numCard),
		},
	}); //првоерка наличия карты в базе
	let obj = {
		fio: arg.FIO,
		email: arg.email,
		phone: arg.phone,
		numCard: arg.numCard,
		SummaBonusa: arg.SummaBonusa,
	};
	if (arg.dr != '01.01.0001 0:00:00') {
		let date = arg.dr.split(' ')[0];
		date = moment(date, 'DD.MM.YYYY').format('YYYY-MM-DD');
		obj.dr = date;
	}

	//console.log('checkNumCard', checkNumCard)
	if (!checkNumCard) {
		table.dataUser.create(obj);
	} else {
		table.dataUser.update(obj, {
			where: {
				numCard: obj.numCard,
			},
		});
	}
	ctx.body = { data: 'error' };
});

/********************
 **  Запуск сервера *
 ********************/
//запуск сервера
app.listen(81, () => {
	//вывод сообщения о запуске сервера
	console.log(`Сервер запущен на порту 80`);
});

//Результат = "{" + Символ(34) + "SummaBonusa" + Символ(34) + ":" + Символ(34) + ВыборкаДетальныеЗаписи.СуммаБонусаОстаток + Символ(34) +"}";
