const express = require('express');
const router = express.Router();

const db = require('../db/models');

const csrf = require('csurf');
const {asyncHandler,} = require('./utils');
const {check, validationResult} = require('express-validator');
const csrfProtection = csrf({cookie: true})


//get all lists from user
router.get('/', csrfProtection, asyncHandler(async(req,res) => {
    // console.log(req.session);

    let lists = await db.List.findAll({
        where: {
            userId: req.session.auth.userId
        }
    });
    //get a list from the specific user
    res.json({lists, csrfToken: req.csrfToken()});
}));

//get a specific list
router.get('/:listId', csrfProtection, asyncHandler(async(req,res) => {
    //use req.session.auth.userId to send the data to front end

    const list = await db.List.findByPk(req.params.listId);
    const tasks = await db.Task.findAll({
        where: {
            listId: req.params.listId,
        }
    })

    res.json({list, tasks, csrfToken: req.csrfToken()});
}));


//validator errors array
const listValidators = [
    check('name')
    .exists({ checkFalsy: true })
    .withMessage('Please provide a value for Name')
    .isLength({ max: 255 })
    .withMessage('Park Name must not be more than 255 characters long')
];


//create a new list feature
router.post('/', csrfProtection, listValidators, asyncHandler(async(req,res) => {
    const {name} = req.body;

    const list = db.List.build({
        name,
        userId: req.session.auth.userId,
    });
    // validate errors
    const validatorErrors = validationResult(req);

    if (validatorErrors.isEmpty()) {
        await list.save();
        // const lists = await db.List.findAll();
        // const lastList = lists[lists.length - 1];
        res.json({});
    }
    else {
        const errors = validatorErrors.array().map((error) => error.msg);
        res.json({
            name,
            errors,
            csrfToken: req.csrfToken(),
        });
    }
}));

//Rename specified list
router.put('/:listId', csrfProtection, listValidators, asyncHandler(async(req,res) => {
    const list = await db.List.findByPk(req.params.listId);

    const {name} = req.body;


    const validatorErrors = validationResult(req);

    if (validatorErrors.isEmpty()) {
        await list.update({name});
        res.json({list});
    }
    else {
        const errors = validatorErrors.array().map((error) => error.msg);
        //render list.pug page
        res.render('index', {...list, id: req.params.listId, errors, csrfToken: req.csrfToken()})
    }

}))

// listValidators
//Delete a list
router.delete('/:listId', csrfProtection, asyncHandler(async(req,res) => {
    const list = await db.List.findByPk(req.params.listId);

    await db.Task.destroy( {
        where: {
            listId: req.params.listId,
        }
    })

    // const validatorErrors = validationResult(req);

    await list.destroy();
    res.json({});

    // if (validatorErrors.isEmpty()) {
    //     await list.destroy();
    //     res.json({});
    // }
}));




//--------------------------------------------
module.exports = router;
