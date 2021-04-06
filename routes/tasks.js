const express = require('express');
const { check, validationResult } = require('express-validator');
const { Op } = require("sequelize");

const db = require('../db/models');
const { requireAuth } = require('./auth');
const { csrfProtection, asyncHandler } = require('./utils');

const router = express.Router();

const taskValidators = [];

// GET /tasks - Gets all the tasks from the current list selection
router.get('/', requireAuth, csrfProtection, asyncHandler(async (req, res) => {
    const lists = await db.List.findAll({
        where: {
            userId: req.session.auth.userId
        }
    }).map(el => el.id);

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
        res.json({ task });
    else
        next();
}));

// POST /tasks - Posts a new task to a specific list
router.post('/', requireAuth, csrfProtection, taskValidators, asyncHandler(async (req, res) => {
    const {
        name,
        sets,
        reps,
        duration
    } = req.body;

    const task = db.Task.build({
        listId: 2,
        name,
        sets,
        reps,
        duration
    });

    const validatorErrors = validationResult(req);

    if (validatorErrors.isEmpty()) {
        await task.save();
    }
    else {
        const errors = validatorErrors.array().map(err = err.msg);
    }
}));

// PUT /tasks/:id - Update a specific task from a list
router.put('/:id(\\d+)', requireAuth, csrfProtection, taskValidators, asyncHandler(async (req, res, next) => {
    const taskId = parseInt(req.params.id, 10);
    const task = await db.Task.findByPk(taskId);

    if (task){
        await task.update(req.body);
        res.json({ task });
    }
    else
        next();
}));

// DELETE /tasks/:id - Deletes a task from a list
router.delete('/:id(\\d+)', requireAuth, csrfProtection, asyncHandler(async (req, res) => {
    const taskId = parseInt(req.params.id, 10);
    const task = await db.Task.findByPk(taskId);

    if (task){
        await task.destroy();
        res.status(204).end();
    }
    else
        next();
}));

module.exports = router;
