const jwt = require('jsonwebtoken');
const { User, Busket } = require('../models/models');
const ApiError = require("../error/ApiError");
const { sequelize } = require('../db');


const generateJwt = (id, login, role) => {
    return jwt.sign(
        { id, login, role },
        process.env.SECRET_KEY,
        { expiresIn: '30d' }
    )
}

class UserController {
    async login(req, res, next) {
        const { mail, password } = req.body
        const user = await User.findOne({ where: { mail } });
        if (!user) {
            return next(ApiError.badRequest('Пользователь не найден'));
        }
        if (password != user.password) {
            return next(ApiError.badRequest('Указан неверный пароль'));
        }
        const token = generateJwt(user.id, user.login, user.role);
        return res.json({ token, role: user.role });
    }

    async check(req, res, next) {
        const token = generateJwt(req.user.id, req.user.login, req.user.role);
        return res.json({ token })
    }

    // Добавьте в ваш контроллер отладку
    async addUser(req, res, next) {
        try {
            const { login, mail, password, itemsJsonb } = req.body;

            const userCheck = await User.findOne({ where: { mail } });
            if (userCheck) {
                return next(ApiError.badRequest('Пользователь с таким email уже существует'));
            }

            const user = await User.create({
                login, mail, password, role: "user"
            });


            const busket = await Busket.create({
                userId: user.id,
                itemsJsonb: itemsJsonb || []
            });


            await user.update({ busketId: busket.id });

            return res.json({
                user,
                busket
            });

        } catch (e) {
            console.error('Full error:', e);
            next(ApiError.badRequest(e.message));
        }
    }

    async getAllUsers(req, res) {
        const users = await User.findAll();
        return res.json(users);
    }
    async getUserById(req, res) {
        const { id } = req.params
        const user = await User.findOne(
            { where: { id } }
        )
        return res.json(user);
    }
    async deleteUserById(req, res) {
        try {
            const { id } = req.params;
            const kategory = await User.findOne({ where: { id } });

            if (!kategory) {
                return res.status(404).json({ error: 'Категория не найдена' });
            }

            await kategory.destroy();
            return res.json({ message: 'Категория удалена' });

        } catch (error) {
            console.error('Delete error:', error);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

    async updateUserById(req, res) {
        const { id } = req.params;
        const { login, mail, password, role } = req.body;
        try {
            const user = await User.findOne(
                { where: { id } }
            )
            if (!user) {
                return res.status(404).json({ error: 'Пользователь не найдена' });
            }
            if (role || mail) {
                return res.status(404).json({ error: 'Пользователь не может менять роли или почту' });
            }
            const [updatedRowsCount, updatedRows] = await User.update(
                {
                    login: login,
                    mail: mail,
                    password: password,
                },
                {
                    returning: true,
                    where: { id }
                }
            );

            if (updatedRowsCount > 0) {
                res.status(200).json({ message: 'Данные успешно обновлены', updatedRows });
            } else {
                res.status(404).json({ message: 'Запись не найдена' });
            }
        } catch (error) {
            console.error('Ошибка при обновлении данных:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new UserController();