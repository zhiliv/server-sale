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
	crypto = require('crypto'),
	//пакет для шифрования данных
	nodemailer = require('nodemailer'),
	//модуль для работы с почтой
  generator = require('generate-password'),
  session = require('koa-session'),
	//модуль для генерации паролей'
	fs = require('fs'),
	//модуль для работы с файловой системой
	app = new Koa();
//создание нового экземпляра роутера
app.keys = ['gaGZMePsaY8R4znksB9wDAHHZCiyJ5'];

const CONFIG_session = {
  key: 'Yarn:sess' /** (string) cookie key (default is koa:sess) */,
  /** (number || 'session') maxAge in ms (default is 1 days) */
  /** 'session' will result in a cookie that expires when session/browser is closed */
  /** Warning: If a session cookie is stolen, this cookie will never expire */
  maxAge: 6000000,
  autoCommit: true /** (boolean) automatically commit headers (default true) */,
  overwrite: true /** (boolean) can overwrite or not (default true) */,
  httpOnly: false /** (boolean) httpOnly or not (default true) */,
  signed: true /** (boolean) signed or not (default true) */,
  rolling: true /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */,
  renew: true /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/,
  //secure: true, /** (boolean) secure cookie*/
  sameSite: null /** (string) session cookie sameSite options (default null, don't set it) */,
};
app.use(session(CONFIG_session, app));

	//создание экземплята сервера

app.use(cors());

//установка cors для сервера
app.use(bodyParser({ strict: false }));
//устанока парсера параметров для сервера


//app.use(koaBody());
//устанока парсера параметров для сервера POST
const router = new Router();
app.use(router.routes()).use(router.allowedMethods());
//установка роутера для сервера
/*
app.use(function (ctx) {
	ctx.body = { status: 'OK' };
});
 */




/**
 ** Получение данных авторизации
 * @method post
 * @param {String} username Имя пользваотеля
 * @param {String} pass Пароль пользователя
 */
router.post('/auth', async (ctx) => {
	const arg = ctx.request.body;
  console.log('arg', arg)
	//параметры запроса
  let USER; //переменная для храения днных пользователя
  let datauser = await table.dataUser.findOne({where: {email: arg.email}});
  if(!datauser){
    ctx.body = {result: 'Пользователь не найден', type:'error'}
  }
  else{
	await table.Users.findOne({
		where: {
			id: datauser.dataValues.userId
		},
		raw: true,
	}).then(async (res) => {
    let crt = await crypt(arg.password)
		if(res.password == crt){
      ctx.body = datauser
    }
    else{
      ctx.body = {result: 'Неверный пароль', type: 'error'}
    }
		USER = res;
  });
}
	//ctx.body = { USER: 'test' };
});


router.post('/newuserconfirm', async (ctx) => {
  const arg = ctx.request.body;
  let rand = 1000 + Math.floor(Math.random() * 9000);
  console.log('rand', rand)

  sendMailConfirmation(arg.email, rand)
  ctx.body = {code: rand}
})

router.post('/findUser', async (ctx) => {
  const arg = ctx.request.body; //получение переданных параметров
  table.dataUser.findAll({where : {fio: arg.fio, numCard: arg.numCard}}, {raw: true}).then(async res => {
    if(res.length != 0){

  if(!res[0].dataValues.userId){

    arg.password = await  crypt(arg.password)
    table.Users.create(arg).then(resU => {
      let id = resU.dataValues.id
      table.dataUser.update({ userId: id }, {id: res[0].id}).then(result => {
        ctx.body = {result}
      })
    })
  }
  else{
    console.log(1)
    ctx.body = {result: 'Данные пользователя уже установлены'}
  }
    }
    else{
      ctx.body = {result: 'error'}
    }
  })

})

/*
 * Регистрация новго пользователя
 * @method post
 * @param {String} arg Параметры
 * @param {String} arg.fio Фамилия Имя Отчество
 * @param {String} arg.email Электронная почта
 * @param {String} arg.dr Дата рождения
 */
router.post('/newuser', async (ctx) => {
	const arg = ctx.request.body; //получение переданных параметров
	let lastCard = await table.dataUser.max('numCard'); //получение последнего номера карты
  arg.numCard = Number(lastCard) + 1; //установка значения для новой карты
  arg.SummaBonusa = 0;
  arg.password =await  crypt(arg.password)
  let user = await table.Users.create(arg)
  arg.userId = user.dataValues.id
  let dataUser = await table.dataUser.create(arg)
  ctx.body = dataUser.dataValues
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

/*******************************************************************
 **  Шифрование данных                                             *
 * @function crypt                                                 *
 * @async                                                          *
 * @exports                                                        *
 * @param {String} data  Данные для шифрования                     *
 * @param {String} type Тип данных для шифрования(pass, session)   *
 * @return {String} зашированное значение                          *
 *******************************************************************/
// eslint-disable-next-line no-unused-vars
const crypt = async (data) => {
	//получение данных с ключами из файла
	let secret = await JSON.parse(
		//чтение файла
		fs.readFileSync(`./config/key.json`).toString(),
	);
	//установка параметров шифрования
	let cipher = await crypto.createCipher('aes-256-cbc', secret.key);
	//шифрование
	let crypted = await cipher.update(data, 'utf-8', 'hex');
	//конкатенация данных ключа
	crypted += await cipher.final('hex');
	return crypted;
};

/***************************************************
 ** Дешифрование данных                            *
 * @function decrypt                               *
 * @async                                          *
 * @exports                                        *
 * @param {String} data Даные для дешифрования     *
 * @param {String} type тип шафрования             *
 * @return {String} дшифрованная информация        *
 ***************************************************/
// eslint-disable-next-line no-unused-vars
const decrypt = async (data) => {
	//полчение ключей
	let secret = await JSON.parse(
		//чтение файлов для полчения ключей
		fs.readFileSync(`./config/key.json`).toString(),
	);
	//указание типа шифрования
	var decipher = await crypto.createDecipher('aes-256-cbc', secret.key);
	//лешифрование данных
	var decrypted = await decipher.update(data, 'hex', 'utf-8');
	//конкатенация значения ключа
	decrypted += await decipher.final('utf-8');
	return decrypted;
};

/************************************************
 ** Отправка сообщение для подтверждения email  *
 ************************************************/
const sendMailConfirmation = async (email, pass) => {
	let config = await JSON.parse(fs.readFileSync(`./config/email.json`).toString());
	let transporter = await nodemailer.createTransport({
		host: config.host,
		port: 465,
		secure: true,
		auth: {
			user: config.user,
			pass: config.pass,
		},
		tls: {
			// do not fail on invalid certs
			rejectUnauthorized: false,
		},
	});
	await transporter.sendMail({
		from: config.user,
		to: email,
		subject: 'Подтверждение регистрации',
		text: 'Подтверждение регистрации',
		html: `Для хвода в приложение используйте следующие данные
          <br/>
          <span><strong>Адрес электронный почты:</strong> ${email} </span>
          <br/>
          <span><strong>Пароль:</strong> ${pass}</span>`,
	});
};

/********************
 **  Запуск сервера *
 ********************/
//запуск сервера
app.listen(81, () => {
	//вывод сообщения о запуске сервера
	console.log(`Сервер запущен на порту 80`);
});

//Результат = "{" + Символ(34) + "SummaBonusa" + Символ(34) + ":" + Символ(34) + ВыборкаДетальныеЗаписи.СуммаБонусаОстаток + Символ(34) +"}";
