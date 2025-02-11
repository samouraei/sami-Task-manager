const express = require('express');
const User = require('../../models/userModel');
const userController = require('../../controllers/userController');
const jwtAuthService = require('../../services/jwtAuthService');
const taskController = require('../../controllers/taskController');
const router = express.Router();
const checkSession = require("../../middlewares/checkSession");
const sanitizeData = require('../../utils/sanitizeData')




router.post('/login',
    sanitizeData('phoneNumber'),
    userController.login);

router.post('/verification',
    sanitizeData('phoneNumber'),
    sanitizeData('verificationCode'),
    userController.verification);


router.post('/createProfile',
    checkSession,
    jwtAuthService.protect(User, ['user']),
    userController.createProfile);

router.get('/tasks',
    checkSession,
    jwtAuthService.protect(User, ['user']),
    taskController.getUserTasks);

router.patch('/tasks/:taskId/done',
    checkSession,
    jwtAuthService.protect(User, ['user']),
    taskController.markTaskAsDone);


module.exports = router;
