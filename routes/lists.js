const express = require('express');
const router = express.Router();

const db = require('../db/models');

const {csrfProtection,asyncHandler,} = require('./utils');
const {check, validationResult} = require('express-validator');

//get all lists from user
router.get('/', asyncHandler(async(req,res) => {

    let lists = await db.List.findAll();
    lists = lists.map((el) => {
        return el.name;
    });
    res.json({lists});
}));

//get a specific list
router.get('/:listId', asyncHandler(async(req,res) => {

    const list = await db.List.findByPk(req.params.listId);

    res.json({list});
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
// router.post('/', csrfProtection, listValidators, asyncHandler(async(req,res) => {
//     const {name, userId} = req.body;

//     const list = db.List.build({
//         name,
//     });

//     //validate errors
//     const validatorErrors = validationResult(req);

//     if (validatorErrors.isEmpty()) {
//         await list.save();
//         res.json({});
//     }
//     else {
//         const errors = validatorErrors.array().map((error) => error.msg);
//         res.json({
//             name,
//             errors,
//             csrfToken: req.csrfToken(),
//         });
//     }
// }));

//Rename specified list
// router.put('/:listId', csrfProtection, listValidators, asyncHandler(async(req,res) => {
//     const listUpdate = await db.List.findByPk(req.params.listId);

//     const {name} = req.body;

//     const list = {name};

//     const validatorErrors = validationResult(req);

//     if (validatorErrors.isEmpty()) {
//         await listUpdate.update(list);
//         res.redirect('/');
//     }
//     else {
//         const errors = validatorErrors.array().map((error) => error.msg);
//         //render list.pug page
//         res.render('index', {...list, id: req.params.listId, errors, csrfToken: req.csrfToken()})
//     }

// }))

// //Delete a list
// router.delete('/listId', csrfProtection, asyncHandler(async(req,res) => {
//     const list = await db.List.findByPk(req.params.listId);
//     await list.destroy();
//     res.redirect('/');
// }));




//--------------------------------------------
module.exports = router;
