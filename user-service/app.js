const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { DataTypes } = require('sequelize');
const { sequelize, connectWithRetry } = require('./database');

const app = express();
const port = 4000;

app.use(express.json());

const User = sequelize.define('User', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'customer'
    }
});

(async () => {
    await connectWithRetry();
    await sequelize.sync({ alter: true });
    console.log("Database & tables created!");
})();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(403).send('A token is required for authentication');
    }
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }
    return next();
};

const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).send('Require Admin Role!');
    }
    return next();
};

app.post('/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).send('Name, email, and password are required');
    }
    try {
        const hashedPassword = bcrypt.hashSync(password, 8);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'customer'
        });
        res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).send('Error creating user');
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send('Email and password are required');
    }
    try {
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).send('User not found');
        }
        const passwordIsValid = bcrypt.compareSync(password, user.password);
        if (!passwordIsValid) {
            return res.status(401).send('Invalid password');
        }
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
            expiresIn: 86400 // 24 hours
        });
        res.status(200).json({ auth: true, token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        res.status(500).send('Error logging in');
    }
});

app.get('/users', [verifyToken, isAdmin], async (req, res) => {
    try {
        const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role'] });
        res.json(users);
    } catch (error) {
        res.status(500).send('Error getting users');
    }
});

app.post('/users', [verifyToken, isAdmin], async (req, res) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        return res.status(400).send('Name, email, and password are required');
    }
    try {
        const hashedPassword = bcrypt.hashSync(password, 8);
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'customer'
        });
        res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch (error) {
        res.status(500).send('Error creating user');
    }
});

app.get('/users/:id', verifyToken, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, { attributes: ['id', 'name', 'email', 'role'] });
        if (!user) return res.status(404).send('User not found');
        res.json(user);
    } catch (error) {
        res.status(500).send('Error getting user');
    }
});

app.listen(port, () => {
    console.log(`User service listening at http://localhost:${port}`);
});