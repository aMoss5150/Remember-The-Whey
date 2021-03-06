const express = require('express');
const { check, validationResult } = require('express-validator');
const { Op } = require("sequelize");

const db = require('../db/models');
const { requireAuth } = require('./auth');
const { csrfProtection, asyncHandler } = require('./utils');

const router = express.Router();

const taskValidators = [
    check('reps')
        .exists({ checkFalsy: true }),
    check('name')
        .exists({ checkFalsy: true })
];

// GET /tasks - Gets all the tasks from the current list selection
router.get('/', requireAuth, csrfProtection, asyncHandler(async (req, res) => {
    let lists;

    // Select
    if (req.query.listId) {
        lists = [req.query.listId];
    }
    else {
        lists = await db.List.findAll({
            where: { userId: req.session.auth.userId }
        }).map(el => el.id);
    }

    const tasks = await db.Task.findAll({
        where: {
            listId: {
                [Op.in]: lists
            }
        }
    });

    res.json({ tasks });
}));

// GET /tasks/:id - Gets a specific task from a list
router.get('/:id(\\d+)', requireAuth, csrfProtection, asyncHandler(async (req, res, next) => {
    const taskId = parseInt(req.params.id, 10);
    const task = await db.Task.findByPk(taskId);

    if (task)
        res.json(task);
    else
        next();
}));

// POST /tasks - Posts a new task to a specific list
router.post('/', requireAuth, csrfProtection, taskValidators, asyncHandler(async (req, res) => {
    const task = db.Task.build(req.body);

    const validatorErrors = validationResult(req);

    if (validatorErrors.isEmpty()) {
        await task.save();
        //res.redirect('/');
        res.send(task);
    }
    else {
        const errors = validatorErrors.array().map(err = err.msg);
    }
}));

// PUT /tasks/:id - Update a specific task from a list
router.put('/:id(\\d+)', requireAuth, csrfProtection, taskValidators, asyncHandler(async (req, res, next) => {
    const taskId = parseInt(req.params.id, 10);
    const task = await db.Task.findByPk(taskId);

    if (task) {
        await task.update(req.body);
        res.json(task);
    }
    else
        next();
}));

// PATCH /tasks/:id - Update a property of a task from a list
router.patch('/:id(\\d+)', requireAuth, csrfProtection, taskValidators, asyncHandler(async (req, res, next) => {
    const taskId = parseInt(req.params.id, 10);
    const task = await db.Task.findByPk(taskId);

    if (task) {
        await task.update(req.body);
        res.json(task);
    }
    else
        next();
}));

// DELETE /tasks/:id - Deletes a task from a list
router.delete('/:id(\\d+)', requireAuth, csrfProtection, asyncHandler(async (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    const task = await db.Task.findByPk(taskId);

    if (task) {
        await task.destroy();
        res.status(204).end();
    }
    else
        next();
}));

module.exports = router;
