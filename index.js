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
const table = require('./tables');
const moment = require('moment');
const clc = require('cli-color');

const app = new Koa();
let router = new Router();
app.use(cors());
app.use(bodyParser({ strict: false }));
app.use(koaBody());

app.use(router.routes()).use(router.allowedMethods());

router.get('/auth/:username/:password', async (ctx, next) => {
	//параметры запроса
	const arg = ctx.params;
	console.log('arg', arg);
	let USER;
	await Users.findOne({
		where: {
			username: arg.username,
			password: arg.password,
		},
		raw: true,
	}).then((res) => {
		USER = res;
	});
	ctx.body = USER;
});

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


router.get('/', async (ctx, next) => {
	ctx.body = { data: 'error' };
});

router.get('/getClientServer', async ctx => {
  console.log('1231')
  let data =await table.dataUser.findAll();
  ctx.body = data;
})

//полчение данных из 1с
router.get(
	`/getClient1C/${keyDate.month}${keyDate.date}/:data`,
	async (ctx, next) => {
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
			})
		}
		ctx.body = { data: 'error' };
	},
);

/********************
 **  Запуск сервера *
 ********************/
//запуск сервера
app.listen(81, () => {
	//вывод сообщения о запуске сервера
	console.log(`Сервер запущен на порту 80`);
});

//Результат = "{" + Символ(34) + "SummaBonusa" + Символ(34) + ":" + Символ(34) + ВыборкаДетальныеЗаписи.СуммаБонусаОстаток + Символ(34) +"}";
