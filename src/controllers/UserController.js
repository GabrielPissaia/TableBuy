const User = require('../models/User');
const bcrypt = require('bcryptjs');

const jwt = require('jsonwebtoken');

const authConfig = require('../config/auth')

const PAGE_SIZE = 5

function generateToken(params = {}) {
    return jwt.sign(params, authConfig.secret, {
        expiresIn: 78300,
    });
}

module.exports = {

    async login(req, res) {
        const { password, email, isLogged } = req.body;

        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).send({
                status: 0,
                message: 'E-mail ou senha incorreto!'
            });
        }

        if (!bcrypt.compareSync(password, user.password)) {
            return res.status(400).send({
                status: 0,
                message: 'Senha incorreta!'
            });
        }

        const user_id = user.id;

        await User.update({
            isLogged
        }, {
            where: {
                id: user_id
            }   
        });

        user.password = undefined
        
        const token = generateToken({ id: user.id });

        return res.status(200).send({
            status: 1,
            message: 'Usuario Logado com sucesso!',
            user, token
        });

    },

    async index(req, res) {
        const { page = 0 } = req.query;
    
        try {
            const users = await User.findAndCountAll({
                limit: PAGE_SIZE,
                offset: page * PAGE_SIZE,
            });
    
            if (users.count === 0) {
                return res.status(200).json({ message: 'Sem usuários cadastrados' });
            }
    
            const totalPages = Math.ceil(users.count / PAGE_SIZE);
    
            return res.status(200).json({
                users: users.rows,
                totalCount: users.count,
                totalPages,
                currentPage: page,
            });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar usuários' });
        }
    },

    async store(req, res) {

        const { name, password, email } = req.body;

        const user = await User.create({ name, password, email });

        const token = generateToken({ id: user.id });

        return res.status(200).send({
            status: 1,
            menssage: 'usuario cadastrado com sucesso!',
            user, token
        });

    },

    async update(req, res) {

        const { name, password, email } = req.body;
        const { user_id } = req.params;

        await User.update({
            name, password, email
        }, {
            where: {
                id: user_id
            }
        });

        return res.status(200).send({
            status: 1,
            menssage: "Usuario atualizado com sucesso!",
        });

    },

    async delete(req, res) {

        const { user_id } = req.params;

        await User.destroy({
            where:{
                id: user_id
            } 
    });
        
    return res.status(200).send({
        status: 1,
        menssage: "Usuario deletado com sucesso!",
    });

    },

};