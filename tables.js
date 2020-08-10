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
const Users = (module.exports.Users = sequelize.define(
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
));

/************************************
 * * Структура таблицы пользователи *
 * @constant Users                  *
 ************************************/
const dataUser = (module.exports.dataUser = sequelize.define('dataUser', {
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
  fio: {
    type: Sequelize.STRING(255),
    allowNull: true,
    comment: 'ФИО'
  },
  email: {
    type: Sequelize.STRING(255),
    allowNull: true,
    comment: 'адрес электронной почты'
  },
  dr: {
    type: Sequelize.DATE,
    allowNull: true,
    comment: 'день рожения'
  },
  phone: {
    type: Sequelize.STRING(12),
    allowNull: true,
    comment: 'номер телефона'
  },
  numCard: {
    type: Sequelize.INTEGER(20),
    allowNull: true,
    comment: 'номер карты'
  },
  SummaBonusa: {
    type: Sequelize.STRING(20),
    allowNull: true,
    comment: 'сумма бонусов'
  }
}
));
//установка связей с категориями
Users.hasMany(dataUser, {
	foreignKey: { comment: 'Идентификатор' },
});
//инициализация таблиц
sequelize.sync({ force: false });
