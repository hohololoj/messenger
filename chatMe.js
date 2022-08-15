'use strict'
import express, { json, response } from 'express';
import path from 'path';
import fs from 'fs';
import { route } from './router.js';
import cookieParser from 'cookie-parser';
import dns from 'dns';
import { mailer } from './postServer.js';
import { MongoClient } from 'mongodb';
import multiparty from 'multiparty';
import expressHandlebars from 'express-handlebars';
import { error } from 'console';
import expressWs from 'express-ws';

const __dirname = path.resolve();
const ip = '127.0.0.1';
const port = process.env.PORT || 8000;
const app = express();
expressWs(app);
const emailForbiddenSymbols = ['!', '#', '$', '%', '^', '&', '*', '(', ')', '\\', '/', '}', '{', ':', ';', '?', '+'];
const userSettings = {
    'WCSMP':{
        name: 'whoCanSeeMyPhone',
        accepts: ['Everyone', 'Friends', 'Nobody']
    },
    'WCSME':{
        name: 'whoCanSeeMyEmail',
        accepts: ['Everyone', 'Friends', 'Nobody']
    },
    'SDMN':{
        name: 'showDirectMessagesNotifications',
        accepts: [true, false]
    },
    'PDMS':{
        name: 'playDirectMessagesSound',
        accepts: [true, false]
    },
    'SSGN':{
        name: 'showSecretGroupNotifications',
        accepts: [true, false]
    },
    'PSGS':{
        name: 'PlaySecretGroupSound',
        accepts: [true, false]
    },
    'SCGN':{
        name: 'ShowCommunityGroupNotifications',
        accepts: [true, false]
    },
    'PCGS':{
        name: 'PlayCommunityGroupSound',
        accepts: [true, false]
    },
    'SCN':{
        name: 'ShowCommentNotifications',
        accepts: [true, false]
    },
    'PCS':{
        name: 'PlayCommentSound',
        accepts: [true, false]
    },
    'NP':{
        name: 'NotificationPreview',
        accepts: [1,2]
}
}
const WSclients = {}
const months = {
    '01': 'Jan',
    '02': 'Feb',
    '03': 'Mar',
    '04': 'Apr',
    '05': 'May',
    '06': 'Jun',
    '07': 'Jul',
    '08': 'Aug',
    '09': 'Sep',
    '10': 'Oct',
    '11': 'Nov',
    '12': 'Dec'
}
const categories = ['Animals', 'Auto', 'Beauty', 'Cooking', 'Education', 'Family', 'Finance', 'Hobby', 'House', 'Humour', 'Just talk', 'Literature', 'Medicine', 'Movies', 'Music', 'Own business', 'Product design', 'Programming', 'Sports', 'Technologies', 'Town community', 'Travel', 'True health', 'Videogames'];

app.use(express.json());
app.use(express.static(path.resolve('public')));
app.use(express.urlencoded());
app.use(cookieParser('S3uWv@'));
app.disable('x-powered-by');
app.set('view engine', 'hbs');
app.engine('.hbs', expressHandlebars.engine({
    layoutsDir: './views',
    defaultLayout: 'app.hbs',
    extname: 'hbs'
}))
// app.set('view cache', true);

function htmlspecialchars(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
}

async function writeToken(token, email) {
    let timestamp = Date.now();
    let mongoClient;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('email_tokens');
        const tokens = db.collection('tokens');
        tokens.deleteOne({ token: token });
        tokens.insertOne({
            token: token,
            email: email,
            timestamp: timestamp
        })

    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }
}

async function checkTokenForExistance(token, email) {
    let mongoClient;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('email_tokens');
        const tokens = db.collection('tokens');
        if (await tokens.findOne({ token: token }) == null) {
            writeToken(token, email)
        }
        else {
            return 0;
        }
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }
}

function app_start() {
    try {
        app.listen(port, ip, function () {
            console.log(`Server Running at ${ip}:${port}`);
        })
    }
    catch (e) {
        console.log(e);
    }
}

function generateRegistrationCode() {
    let timestamp = Date.now().toString();
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += timestamp[timestamp.length - 1 - i];
    }
    return code;
}

async function writeCode(code, email) {
    let mongoClient;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('email_tokens');
        const codes = db.collection('codes');
        const isSend = await codes.findOne({ email: email }) != null;
        if (!isSend) {
            codes.insertOne({
                code: code,
                email: email
            })
        }
        else {
            codes.deleteOne({ email: email });
            codes.insertOne({
                code: code,
                email: email
            })
        }

    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }
}

function sendEmailCode(email) {
    let code = generateRegistrationCode();
    const message = {
        to: email,
        subject: 'Email confirmation',
        html: `
           <h2>Congratulations! You have successfully registered at ChatMe</h2>
           <span>Now you need to confirm your email: </span>
           <a>Your code: <strong>${code}</strong></a> 
        `
    }
    // mailer(message);
    writeCode(code, email);
}

//validate email
function email_validate(email) {
    if (email == '') {
        return { 'result': 'empty', 'message': 'Email is empty' };
    }
    email = htmlspecialchars(email);
    let dogIndex = email.indexOf('@');
    if (dogIndex != -1) {
        let email_name = '';
        for (let i = 0; i < dogIndex; i++) {
            email_name += email[i];
        }
        let domain = '';
        for (let i = dogIndex + 1; i < email.length; i++) {
            domain += email[i];
        }
        for (let i = 0; i < email_name.length; i++) {
            for (let j = 0; j < emailForbiddenSymbols.length; j++) {
                if (email_name[i] == emailForbiddenSymbols[j]) {
                    return { 'result': 'error', 'message': 'Email is not valid' }
                }
            }
        }
        let domainIsExist = true;
        dns.resolve(domain, function (err, ip) {
            if (ip) {
            }
            else {
                domainIsExist = false;
            }
        })
        if (!domainIsExist) {
            return { 'result': 'error', 'message': 'Email does not exist' }
        }
        else {
            sendEmailCode(email);
        }
    }
    else {
        return { 'result': 'error', 'message': 'Email is not valid' }
    }
}

function generate_token(length) {
    var a = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');
    var b = [];
    for (var i = 0; i < length; i++) {
        var j = (Math.random() * (a.length - 1)).toFixed(0);
        b[i] = a[j];
    }
    return b.join('');
}

async function checkForLogged(token) {
    let mongoClient;
    let response;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('logged');
        const tokens = db.collection('tokens');
        response = await tokens.findOne({ token: token });
        if (response == undefined) {
            return false;
        }
        else {
            const db = mongoClient.db('logged');
            const tokens = db.collection('tokens');
            return true;
        }
    }
    catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }
}

async function getUserInfo(token) {
    let mongoClient;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('logged');
        const tokens = db.collection('tokens');
        let response = await tokens.findOne({ token: token });
        let user_id = response.id;
        const usersdb = mongoClient.db('users');
        const users = usersdb.collection('users');
        let thisUser = await users.findOne({ id: user_id });
        const invitationsdb = mongoClient.db('invitations');
        const invitations = invitationsdb.collection('invitations');
        let hasInvitationLink = await invitations.findOne({id: user_id});
        if(hasInvitationLink != '' && hasInvitationLink != undefined){
            thisUser.invitationLink = hasInvitationLink.link.toString();
        }
        else{
            await invitations.insertOne({id: user_id, link: `http://127.0.0.1:8000/invite?ref=${thisUser.nickname}`});
            thisUser.invitationLink = `http://127.0.0.1:8000/invite?ref=${thisUser.nickname}`;
        }
        const settingsdb = mongoClient.db('user-settings');
        const thisUser_settings_collectionName = ('user-'+user_id);
        const thisUser_settings_collection = settingsdb.collection(thisUser_settings_collectionName);
        let thisUser_settings = await thisUser_settings_collection.find({}).toArray();
        let thisUser_settings_obj = {};
        for(let i = 0; i < thisUser_settings.length; i++){
            thisUser_settings_obj[Object.entries(thisUser_settings[i])[2][0]] = Object.entries(thisUser_settings[i])[2][1]
        }
        const groupsdb = mongoClient.db('groups');
        const list = groupsdb.collection('list');
        let thisUser_groupsAdmin = await list.find({creator_id: user_id}).toArray();
        thisUser_groupsAdmin = {thisUser_groupsAdmin: thisUser_groupsAdmin}
        // let thisUser_groups = ''
        thisUser = Object.assign({}, thisUser, thisUser_settings_obj, thisUser_groupsAdmin);
        return thisUser;
    }
    catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }

}

async function writeApp(token, res) {
    
    let promise = new Promise((resolve, reject) => {
        let thisUser = getUserInfo(token);
        resolve(thisUser);
    })
    promise.then((thisUser) => {
        let avatar_path = thisUser.avatar_path;
        thisUser.avatar_path = avatar_path.slice(48);
        res.render('app.hbs', thisUser);
    })
}

async function register_route(token, res) {
    let isRegistered = await checkForRegistered(token);
    console.log(`/register: isRegistered: ${isRegistered.isRegistered}`);
    if (!isRegistered.isRegistered) {
        res.sendFile(path.resolve('./public/register.html'));
    }
    else {
        res.redirect('/app')
    }
}

async function buildIvitePage(res, nickname){
    let mongoClient;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('users');
        const users = db.collection('users');
        let user = await users.findOne({nickname: nickname});
        res.render('start-invite.hbs', {name: `${user.name} ${user.surname}`, layout:'start-invite.hbs'});
    }
    catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }
}

async function handleNewWSClient(ws, req){
    console.log('Websocket connection open');
    let thisClient_token = req.signedCookies.token;
    let mongoClient;
    let response;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('logged');
        const tokens = db.collection('tokens');
        response = await tokens.findOne({token: thisClient_token});
        let thisClient_id = response.id;
        WSclients[thisClient_token] = {
            id: thisClient_id,
            ws: ws
        }
        const usersdb = mongoClient.db('users');
        const users = usersdb.collection('users');
        users.updateOne({id: thisClient_id}, {
            $set:{
                onlineStatus: 'online'
            }
        })
    }
    catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }
}

async function handleWSClientCloseConnection(req){
    console.log('Websocket connection close');
    let thisClient_token = req.signedCookies.token;
    let thisClient_id = WSclients[thisClient_token].id;
    let mongoClient;
    mongoClient = new MongoClient('mongodb://localhost:27017');
    await mongoClient.connect();
    const usersdb = mongoClient.db('users');
    const users = usersdb.collection('users');
    users.updateOne({id: thisClient_id}, {
        $set:{
            onlineStatus: Date.now()
        }
    })
}

app.ws('/app', function(ws, req){
    handleNewWSClient(ws, req)
    ws.on('message', function(message){
        
    })
    ws.on('close', function(){
        handleWSClientCloseConnection(req)
    })
})

app.get('*', function (req, res) {
    let req_path = req.path;
    switch (req_path) {
        case '/start': {
            res.sendFile(path.resolve('./public/start.html'));
            break;
        }
        case '/': {
            res.sendFile(path.resolve('./public/start.html'));
            break;
        }
        case '/onboarding-email': {
            res.sendFile(path.resolve('./public/onboarding-email.html'));
            break;
        }
        case '/onboarding-phone': {
            res.redirect(303, '/onboarding-email')
            break;
        }
        case '/code': {
            let token = req.signedCookies.token;
            if (token == undefined) {
                res.redirect(303, '/onboarding-email');
            }
            else {
                res.sendFile(path.resolve('./public/code-email.html'))
            }
            break;
        }
        case '/register': {
            let token = req.signedCookies.token;
            if (token == undefined) {
                res.redirect(303, '/start');
            }
            else {
                register_route(token, res)
            }
            break;
        }
        case '/invite': {
            let userNickname = req.query.ref;
            buildIvitePage(res, userNickname);
            break;
        }
        case '/app': {
            setTimeout(() => {
                notification_send('HMLElbN8LsXjUg4RSq9JONjABkmKNxi2', 'error', 'An error occurred', 'This email is already in use', 'auto')
            }, 2000);
            if(req.query.action == 'logout'){
                res.clearCookie('token');
                
            }
        }
        default: {
            let token = req.signedCookies.token;
            if (token == undefined) {
                res.redirect(303, '/onboarding-email');
                return 0;
            }
            else {
                let isLogged = checkForLogged(token);
                if (isLogged == false) {
                    res.redirect(303, '/onboarding-email');
                }
                else {
                    let router_response = route(req.path);
                    if (router_response.object == 'page') {
                        res.sendFile(router_response.path);
                    }
                    else if (router_response.object == 'render') {
                        writeApp(req.signedCookies.token, res)
                    }
                    else {
                        res.redirect(303, '/app')
                    }
                }
            }
            break;
        }
    }
})

async function findRegistrationCode(token) {
    let mongoClient;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('email_tokens');
        const tokens = db.collection('tokens');
        let response = await tokens.findOne({ token: token });
        if (response == undefined) {

        }
        else {
            let email = response.email;
            const codes = db.collection('codes');
            response = await codes.findOne({ email: email });
            return response;
        }

    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }
}

async function register_validate(fields) {
    const allowedSymbols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'g', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
    let name = fields.name.join().toLowerCase();
    let surname = fields.surname.join().toLowerCase();
    let isPossible;
    for (let i = 0; i < name.length; i++) {
        isPossible = false;
        for (let j = 0; j < allowedSymbols.length; j++) {
            if (name[i] == allowedSymbols[j]) {
                isPossible = true;
            }
        }
        if (!isPossible) {
            return {
                status: false,
                message: 'Please type correct name'
            };
        }
    }
    for (let i = 0; i < surname.length; i++) {
        isPossible = false;
        for (let j = 0; j < allowedSymbols.length; j++) {
            if (surname[i] == allowedSymbols[j]) {
                isPossible = true;
            }
        }
        if (!isPossible) {
            return {
                status: false,
                message: 'Please type correct surname'
            };
        }
    }
    let nickname = fields.nickname;
    let mongoClient;
    let response;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('users');
        const users = db.collection('users');
        nickname = nickname.toString();
        response = await users.findOne({ nickname: nickname });
        if (response == '' || response === undefined || response == null) {
            return { status: true }
        }
        else {
            return { status: false, message: 'nickname already in use' };
        }
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }
}

async function resend_code(token) {
    let mongoClient;
    let response;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('email_tokens');
        const tokens = db.collection('tokens');
        response = await tokens.findOne({ token: token });
        sendEmailCode(response.email);
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }
}

async function write_user(token_val, res, fields, files) {
    let id = generate_avatar_name();
    let avatar_path = files.avatar[0].path;
    let extname = files.avatar[0].originalFilename.split('.').pop();

    fs.rename(avatar_path, (__dirname + ('/public/avatars/' + id + '.' + extname)), function (err) {
        if (err) {
            console.log(err);
        }
    })

    let mongoClient;
    let response;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('email_tokens');
        const tokens = db.collection('tokens');
        response = await tokens.findOne({ token: token_val });
    }
    catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }

    if (response != undefined) {
        console.log('user registered!');
    }
    else {
        console.log('user not registered!');
        console.log(response);
    }

    let thisUser_avatar_path = (__dirname + ('/public/avatars/' + id + '.' + extname));
    let thisUser_name = fields.name.join();
    thisUser_name = thisUser_name[0].toUpperCase() + thisUser_name.slice(1);
    let thisUser_surname = fields.surname.join();
    thisUser_surname = thisUser_surname[0].toUpperCase() + thisUser_surname.slice(1);
    let thisUser_email = response.email;
    let thisUser_nickname = fields.nickname[0];
    const thisUser = {
        id: id,
        avatar_path: thisUser_avatar_path,
        name: thisUser_name,
        surname: thisUser_surname,
        email: thisUser_email,
        nickname: thisUser_nickname,
        date: Date.now(),
        about: '',
        location: '',
        status: '',
        dateOfBirth_day: '',
        dataOfBirth_month: '',
        dataOfBirth_year: '',
        website: '',
        vk: '',
        fullname: `${thisUser_name} ${thisUser_surname}`
    }
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('users');
        const users = db.collection('users');
        let status = await users.insertOne(thisUser);
        if (status) {
            await writeLogged({ token: token_val, id: thisUser.id });
            res.send({ status: true })
        }
    }
    catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }
}

async function generate_user_id() {
    let id = Date.now() + Math.floor(Math.random() * 10);
    let mongoClient;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('users');
        const users = db.collection('users');
        let response = await users.findOne({ id: id });
        if (response == undefined) {
            return id;
        }
        else{
            generate_user_id();
        }
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }
}

async function generate_group_id(){
    let id = Date.now() + Math.floor(Math.random() * 10);
    let mongoClient;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('groups');
        const groups_list = db.collection('list');
        let response = await groups_list.findOne({ groupid: id });
        if (response == undefined) {
            return id;
        }
        else{
            generate_group_id();
        }
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }
}

function generate_avatar_name(){
    let name = Date.now() + Math.floor(Math.random() * 100);
    return name;
}

async function checkForRegistered(token) {
    let mongoClient;
    let response;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('email_tokens');
        const tokens = db.collection('tokens');
        response = await tokens.findOne({ token: token });
    }
    catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }

    if (response == undefined) {
        res.redirect(303, '/onboarding-email');
    }
    else {
        let email = response.email;
        try {
            mongoClient = new MongoClient('mongodb://localhost:27017');
            await mongoClient.connect();
            const db = mongoClient.db('users');
            const users = db.collection('users');
            response = await users.findOne({ email: email });
        }
        catch (error) {
            console.error('Connection to MongoDB Atlas failed!', error);
            //process.exit();
        }
    }
    if (response == undefined) {
        return {
            isRegistered: false,
            id: undefined
        }
    }
    else {
        writeLogged({ token: token, id: response.id });
        return {
            isRegistered: true,
            id: response.id
        }
    }
}

async function writeLogged(user) {
    console.log('Request for writing logged: ');
    console.log(user);
    let mongoClient;
    let response;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('logged');
        const tokens = db.collection('tokens');
        response = await tokens.findOne({ id: user.id })
        if (response != undefined) {
            await tokens.deleteOne({ id: user.id });
        }
        await tokens.insertOne({ token: user.token, id: user.id });
        const userSettingsdb = mongoClient.db('user-settings');
        const collectionName = ('user-'+user.id);
        // let isExists_settingsFile = await db.listCollections({ name: collectionName }).hasNext()
        // const isExists_settingsFile = userSettingsdb.ListCollectionNames().into(new ArrayList()).contains(collectionName);
        const collections = userSettingsdb.listCollections({name: collectionName}).next(function(err, collinfo){
            if(err){
                console.log(err);
            }
            if(collinfo){}
            else{
                userSettingsdb.createCollection(collectionName);
            const settings = [
                {name: 'whoCanSeeMyPhone',whoCanSeeMyPhone: 'Everyone'},
                {name: 'whoCanSeeMyEmail',whoCanSeeMyEmail: 'Everyone'},
                {name:'showDirectMessagesNotifications',showDirectMessagesNotifications: true},
                {name:'playDirectMessagesSound',playDirectMessagesSound: true},
                {name:'showSecretGroupNotifications',showSecretGroupNotifications: true},
                {name:'PlaySecretGroupSound',PlaySecretGroupSound: true},
                {name:'ShowCommunityGroupNotifications',ShowCommunityGroupNotifications: true},
                {name:'PlayCommunityGroupSound',PlayCommunityGroupSound: true},
                {name:'ShowCommentNotifications',ShowCommentNotifications: true},
                {name:'PlayCommentSound',PlayCommentSound: true},
                {name:'NotificationPreview',NotificationPreview: 1}
            ]
            const thisUserSettings = userSettingsdb.collection(collectionName);
            thisUserSettings.insertMany(settings);
            }
        })
    }
    catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }
}

async function register(req, res) {
    const form = new multiparty.Form();
    const token = req.signedCookies.token;
    let parsedFields, parsedFiles;
    form.parse(req, function (err, fields, files) {
        if (err) {
            console.log(err);
        }
        let promise = new Promise((resolve, reject) => {
            let valid_res = register_validate(fields);
            resolve(valid_res);
        })
        promise.then(function (valid_res) {
            if (valid_res.status == false) {
                res.send(valid_res);
            }
            else {
                write_user(token, res, fields, files)
            }
        })
    })
}

async function findChanges(res, token, thisUser, files) {
    let thisUser_token = token;
    let mongoClient;
    let response;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('logged');
        const tokens = db.collection('tokens');
        response = await tokens.findOne({ token: thisUser_token })
        let thisUser_id = response.id;
        const db_users = mongoClient.db('users');
        const users = db_users.collection('users');
        response = await users.updateOne({ id: thisUser_id }, {
            $set: {
                name: thisUser.name,
                surname: thisUser.surname,
                about: thisUser.about,
                location: thisUser.location,
                status: thisUser.status,
                nickname: thisUser.username,
                dateOfBirth_day: thisUser.birthday_day,
                dateOfBirth_month: thisUser.birthday_month,
                dateOfBirth_year: thisUser.birthday_year,
                website: thisUser.website,
                vk: thisUser.vk
            }
        }).then(
            res.send({ status: 'success' })
        )
        if (thisUser.avatarChanged == 'true') { 
            let id = generate_avatar_name();
            let avatar_path = files.avatar[0].path;
            let extname = files.avatar[0].originalFilename.split('.').pop();
            fs.rename(avatar_path, (__dirname + ('/public/avatars/' + id + '.' + extname)), function (err) {
            })
            let newAvatar_path = `${__dirname}/public/avatars/${id}.${extname}`;
            users.updateOne({id: thisUser_id}, {
                $set:{
                    avatar_path : newAvatar_path
                }
            })
        }
    }
    catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }
}

async function changeEmail_code(res, code, email, token){
    let mongoClient;
    let response;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('email_tokens');
        const tokens = db.collection('codes');
        response = await tokens.findOne({ email: email });
        if (response != undefined) {
            let rightCode = response.code;
            if(code == rightCode){
                res.send({status: 'success', message: 'Email changed successfully'});

                const loggeddb = mongoClient.db('logged');
                const tokens = loggeddb.collection('tokens');
                let response = await tokens.findOne({ token: token});

                if(response != undefined){
                    let uid = response.id;
                    const usersdb = mongoClient.db('users');
                    const users = usersdb.collection('users');
                    users.updateOne({id: uid}, {
                        $set: {
                            email: email
                        }
                    })
                }
                else{
                    res.send({status: 'error', message: 'Something went wrong'});
                }
            }
            else{
                res.send({status: 'error', message: 'Invalid code'});
            }
        }
        else{
            res.send({status: 'error', message: 'Something went wrong'});
        }
    }
    catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }
}

async function changeEmailSendCode(res, email, token) {
    let mongoClient;
    let response;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('users');
        const users = db.collection('users');
        response = await users.findOne({ email: email })
        if (response != undefined) {
            res.send({ status: 'error', message: 'Email already in use' });
        }
        else {
            let emailValid = email_validate(email);
            if (emailValid != undefined) {
                res.send({ status: 'error', message: emailValid.message });
            }
            else {
                res.send({ status: 'success' });
            }
        }
    }
    catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }
}

async function changeSettings(res, token, req) {
    let settingName = req.body.name;
    let settingValue = req.body.setting;
    let settingFullName = userSettings[settingName].name;
    if (userSettings[settingName].accepts.includes(settingValue)) {
        let mongoClient;
        let response;
        try {
            mongoClient = new MongoClient('mongodb://localhost:27017');
            await mongoClient.connect();
            let db = mongoClient.db('logged');
            const tokens = db.collection('tokens');
            response = await tokens.findOne({ token: token });
            let user_id = response.id;
            db = mongoClient.db('user-settings');
            let collectionName = ('user-'+user_id);
            const settings = db.collection(collectionName);
            let totalSetting = {}
            totalSetting[settingFullName] = settingValue;
            settings.updateOne({name: settingFullName}, {
                $set:totalSetting
            })
            res.send({status: 'success', message:'property changed successfully'})
        }
        catch (error) {
            console.error('Connection to MongoDB Atlas failed!', error);
            //process.exit();
        }
    }
    else{
        res.send({status: 'error', message: 'something went wrong'});
    }
}

async function search(res, search_object){
    let range = search_object.range;
    let request = search_object.search_request;
    let search_regexp = `.*?${request}.*?`;
    switch(range){
        case 'discover':{
            let mongoClient;
            let response;
            try {
                mongoClient = new MongoClient('mongodb://localhost:27017');
                await mongoClient.connect();
                const db = mongoClient.db('users');
                const users = db.collection('users');
                response = await users.find({ $or: [{nickname: {$regex: search_regexp, $options:"i"}}, {fullname: {$regex: search_regexp, $options:"i"}}] }).sort({date: '1'}).limit(10).toArray();
                let response_obj = {};
                response_obj.people = [];
                for(let i = 0; i < response.length; i++) {
                    let thisUser_onlineStatus;
                    if(response[i].onlineStatus != 'online'){
                        let lastSeen = Date.now() - response[i].onlineStatus;
                        let hours = lastSeen/1000/60/60;
                        if(hours < 24){
                            thisUser_onlineStatus = 'today'
                        }
                        else{
                            if(hours < 48){
                                thisUser_onlineStatus = 'yesterday';
                            }
                            else{
                                let date = new Date(response[i].onlineStatus);
                                let day = date.getDay();
                                if(day.length != 2){
                                    day = '0'+day;
                                }
                                let month = date.getMonth();
                                month++;
                                if(month.length != 2){
                                    month = '0'+month;
                                }
                                let year = date.getFullYear();
                                thisUser_onlineStatus = (day+':'+month+':'+year)
                            }
                        }                        
                    }
                    else{
                        thisUser_onlineStatus = 'online'
                    }
                    response_obj.people.push({
                        avatar: response[i].avatar_path.slice(39),
                        fullname: response[i].fullname,
                        online: thisUser_onlineStatus,
                        id: response[i].id
                    })
                }
                const groupsdb = mongoClient.db('groups');
                const list = groupsdb.collection('list');
                response = await list.find({ $or: [{shortname: {$regex: search_regexp, $options:"i"}}, {name: {$regex: search_regexp, $options:"i"}}] }).sort({date: '1'}).toArray();
                response_obj.groups = [];
                for(let i = 0; i < response.length; i++){
                    response_obj.groups.push({
                        avatar: response[i].avatar_path,
                        name: response[i].name,
                        members: response[i].members,
                        id: response[i].groupid
                    })
                }
                res.send(response_obj);
            }
            catch (error) {
                console.error('Connection to MongoDB Atlas failed!', error);
                //process.exit();
            }
            break;
        }
        case 'contacts':{
            let mongoClient;
            let response;
            try {
                mongoClient = new MongoClient('mongodb://localhost:27017');
                await mongoClient.connect();
                const db = mongoClient.db('users');
                const users = db.collection('users');
                response = await users.find({ $or: [{nickname: {$regex: search_regexp, $options:"i"}}, {fullname: {$regex: search_regexp, $options:"i"}}] }).sort({date: '1'}).limit(10).toArray();
                let response_obj = {};
                response_obj.groups = [];
                response_obj.people = [];
                for (let i = 0; i < response.length; i++) {
                    let thisUser_onlineStatus;
                    if (response[i].onlineStatus != 'online') {
                        let lastSeen = Date.now() - response[i].onlineStatus;
                        let hours = lastSeen / 1000 / 60 / 60;
                        if (hours < 24) {
                            thisUser_onlineStatus = 'today'
                        }
                        else {
                            if (hours < 48) {
                                thisUser_onlineStatus = 'yesterday';
                            }
                            else {
                                let date = new Date(response[i].onlineStatus);
                                let day = date.getDay();
                                if (day.length != 2) {
                                    day = '0' + day;
                                }
                                let month = date.getMonth();
                                month++;
                                if (month.length != 2) {
                                    month = '0' + month;
                                }
                                let year = date.getFullYear();
                                thisUser_onlineStatus = (day + ':' + month + ':' + year)
                            }
                        }
                    }
                    else {
                        thisUser_onlineStatus = 'online'
                    }
                    response_obj.people.push({
                        avatar: response[i].avatar_path.slice(39),
                        fullname: response[i].fullname,
                        online: thisUser_onlineStatus,
                        id: response[i].id
                    })
                }
                res.send(response_obj)
            }
            catch (error) {
                console.error('Connection to MongoDB Atlas failed!', error);
                //process.exit();
            }
            break;
        }
        default:{
            res.send({status: 'error', message:'something went wrong'});
        }
    }
}

function findSettingProperty(settings, name){
    for(let i = 0; i < settings.length; i++){
        if(settings[i].name == name){
            return settings[i][name];
        }
    }
}

async function getFullInfo(type, id, res){
    switch(type){
        case 'user':{
            let mongoClient;
            let response;
            try {
                mongoClient = new MongoClient('mongodb://localhost:27017');
                await mongoClient.connect();
                const db = mongoClient.db('users');
                const users = db.collection('users');
                response = await users.findOne({id: id});
                let thisUser_onlineStatus;
                    if(response.onlineStatus != 'online'){
                        let lastSeen = Date.now() - response.onlineStatus;
                        let hours = lastSeen/1000/60/60;
                        if(hours < 24){
                            thisUser_onlineStatus = 'today'
                        }
                        else{
                            if(hours < 48){
                                thisUser_onlineStatus = 'yesterday';
                            }
                            else{
                                let date = new Date(response.onlineStatus);
                                let day = date.getDay();
                                if(day.length != 2){
                                    day = '0'+day;
                                }
                                let month = date.getMonth();
                                month++;
                                if(month.length != 2){
                                    month = '0'+month;
                                }
                                let year = date.getFullYear();
                                thisUser_onlineStatus = (day+':'+month+':'+year)
                            }
                        }                        
                    }
                    else{
                        thisUser_onlineStatus = 'online'
                    }
                let settingsdb = mongoClient.db('user-settings');
                let UserSettings = settingsdb.collection(`user-${response.id}`);
                let thisUserSettings = await UserSettings.find({}).toArray();
                let thisUserEmailSettings = findSettingProperty(thisUserSettings, 'whoCanSeeMyEmail');
                let thisUserEmail;
                
                if(thisUserEmailSettings == 'Everyone'){
                    thisUserEmail = response.email;
                }
                if(thisUserEmailSettings == 'Nobody'){
                    thisUserEmail = 'hidden';
                }
                let date = new Date(response.dateOfBirth_year, --response.dateOfBirth_month, response.dateOfBirth_day);
                let time = Date.now() - date.getTime();
                let age = Math.floor(time/1000/60/60/24/365);
                date = new Date(response.date);
                let joined = (date.getDay()+1)+' '+months[('0'+date.getMonth().toString())]+' '+date.getFullYear();
                let birthday = response.dateOfBirth_day;
                if(birthday.length != 2){
                    birthday = '0'+birthday;
                }
                let birthmonth = response.dateOfBirth_month;
                birthmonth++;
                if(birthmonth.length != 2){
                    birthmonth = '0'+birthmonth;
                }
                birthday = birthday.toString();
                birthmonth = birthmonth.toString();
                let vk = response.vk;
                let vkshort;
                if(vk != ''){
                    let regexp = /[\w _]+?$/;
                    vkshort = vk.match(regexp)
                }
                let requset_response = {
                    id: response.id,
                    avatar: response.avatar_path.slice(39),
                    fullname: response.fullname,
                    online: thisUser_onlineStatus,
                    about: response.about,
                    nickname: response.nickname,
                    location: response.location,
                    email: thisUserEmail,
                    vk: response.vk,
                    dateOfBirth: (birthday+' '+months[birthmonth]+' '+ response.dateOfBirth_year+', '+age+'y.o.'),
                    joined: joined,
                    about: response.about,
                    vkshort: vkshort[0]
                }
                res.send(requset_response);
            }
            catch (error) {
                console.error('Connection to MongoDB Atlas failed!', error);
            }
            break;
        }
        //Дописать, когда будут группы
        // case 'group':{
        //     let mongoClient;
        //     let response;
        //     try {
        //         mongoClient = new MongoClient('mongodb://localhost:27017');
        //         await mongoClient.connect();
        //         const db = mongoClient.db('groups');
        //         const users = db.collection('users');
        //         response = await users.findOne({ id: id });
        //         res.send(response);
        //     }
        //     catch (error) {
        //         console.error('Connection to MongoDB Atlas failed!', error);
        //     }
        //     break;
        // }
        default:{
            res.send('Something went wrong');
        }
    }
}

async function createCommunity_validate(res, thisGroup, token) {
    if(thisGroup.name == '' || thisGroup.name == undefined){
        res.send({status: 'error', message: 'Please enter a valid name'});
        return false;
    }
    if(thisGroup.payments == '' || thisGroup.payments == undefined){
        res.send({status: 'error', message: 'Please enter a valid payment'});
        return false;
    }
    if(thisGroup.payments != 'Subscription' && thisGroup.payments != 'One-time payment' && thisGroup.payments != 'Free'){
        res.send({status: 'error', message: 'Please enter a valid payment'});
        return false;
    }
    if(thisGroup.payments == 'Subscription' && thisGroup.pricing == ''){
        res.send({status: 'error', message: 'Please enter a pricing for a subscription'});
        return false;
    }
    if(thisGroup.payments == 'One-time payment' && thisGroup.pricing == ''){
        res.send({status: 'error', message: 'Please enter a pricing for a one-time payment'});
        return false;
    }
    if(thisGroup.payments == 'Free' && thisGroup.pricing != ''){
        thisGroup.pricing = '';
    }
    if(thisGroup.visibility != 'Secret' && thisGroup.visibility != 'Public'){
        res.send({status: 'error', message: 'Please enter a valid visibility'});
        return false;
    }
    if(thisGroup.category == '' || (categories.indexOf(thisGroup.category) == -1)){
        res.send({status: 'error', message: 'Please enter a valid category'});
        return false;
    }
    if(thisGroup.avatar == undefined){
        res.send({status: 'error', message: 'Please pick an avatar'});
        return false;
    }
    let mongoClient;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const loggeddb = mongoClient.db('logged');
        const tokens = loggeddb.collection('tokens');
        let response = await tokens.findOne({token: token});
        let thisUser_id = response.id;
        let id = generate_avatar_name();
        let avatar_path = thisGroup.avatar[0].path;
        let extname = thisGroup.avatar[0].originalFilename.split('.').pop();
        fs.rename(avatar_path, (__dirname + ('/public/avatars/' + id + '.' + extname)), function (err) {})
        let thisAvatar_path = `${__dirname}/public/avatars/${id}.${extname}`;
        let thisGroup_id = await generate_group_id();
        let groupCreateObject = {
            groupid: thisGroup_id,
            creator_id: thisUser_id,
            name: htmlspecialchars(thisGroup.name),
            payments: htmlspecialchars(thisGroup.payments),
            pricing: htmlspecialchars(thisGroup.pricing),
            visibility: htmlspecialchars(thisGroup.visibility),
            category: htmlspecialchars(thisGroup.category),
            members: 1,
            creation_timestamp: Date.now(),
            shortname: '',
            description: '',
            avatar_path: thisAvatar_path.slice(39),
            welcome_message: '',
        }
        const groupsdb = mongoClient.db('groups');
        const list = groupsdb.collection('list');
        await list.insertOne(groupCreateObject);
        res.send({status: 'success'});
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
    }
}

async function getGroupInfo(groupid, res){
    let mongoClient;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const groupsdb = mongoClient.db('groups');
        const list = groupsdb.collection('list');
        groupid = htmlspecialchars(groupid);
        groupid = parseInt(groupid);
        let response = await list.findOne({groupid: groupid});
        if(response == undefined){
            res.send({status: 'error', message: 'Something went wrong'})
        }
        else{
            let groupResponse_obj = {
                groupid: response.groupid,
                avatar_path: response.avatar_path,
                name: response.name,
                shortname: response.shortname,
                payments: response.payments,
                welcome_message: response.welcome_message,
                description: response.description,
            }
            res.send({status: 'success', data: groupResponse_obj});
        }
        
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
    }
}

async function deleteCommunity(res, token, groupid){
    let mongoClient;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        let loggeddb = mongoClient.db('logged');
        let tokens = loggeddb.collection('tokens');
        let response = await tokens.findOne({token: token});
        if(response == undefined){
            res.send({status: 'error', message: 'Something went wrong'});
        }
        else{
            let thisUser_id = response.id;
            let groupsdb = mongoClient.db('groups');
            let list = groupsdb.collection('list');
            groupid = htmlspecialchars(groupid);   
            groupid = parseInt(groupid); 
            let response_group = await list.findOne({groupid: groupid});
            if(response_group == undefined){
                res.send({status: 'error', message: 'Something went wrong'});
            }
            else{
                if(thisUser_id == response_group.creator_id){
                    await list.deleteOne({groupid: groupid});
                    res.send({status: 'success'});
                }
                else{
                    res.send({status: 'error', message: 'You are not allowed to do this'});
                }
            }
        }
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
    }
}

async function editCommunity(res, files, fields, token){
    let mongoClient;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('logged');
        const tokens = db.collection('tokens');
        let response = await tokens.findOne({token: token});
        if(response == undefined){
            res.send({status: 'error', message: 'Something went wrong'});
        }
        else{
            let thisUser_id = response.id;
            let editForm_obj = {
                name: fields.name[0],
                description: fields.description[0],
                shortname: fields.shortname[0],
                welcome_message: fields.welcome_message[0],
                groupid: fields.groupid[0],
            }
            let groupsdb = mongoClient.db('groups');
            let list = groupsdb.collection('list');
            editForm_obj.groupid = htmlspecialchars(editForm_obj.groupid);
            editForm_obj.groupid = parseInt(editForm_obj.groupid);
            let thisGroup = await list.findOne({groupid: editForm_obj.groupid});
            if(thisUser_id == thisGroup.creator_id){
                editForm_obj.name = htmlspecialchars(editForm_obj.name);
                editForm_obj.description = htmlspecialchars(editForm_obj.description);
                editForm_obj.shortname = htmlspecialchars(editForm_obj.shortname);
                editForm_obj.welcome_message = htmlspecialchars(editForm_obj.welcome_message);
                let update_status =  await list.updateOne({groupid: editForm_obj.groupid}, {
                    $set: editForm_obj
                })
                res.send({status: 'success'});
            }
            else{
                res.send({status: 'error', message: 'You are not allowed to do this'});
            }
        }
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }
}

function notification_send(token, type, title, message, hide){
    //type: note, confirm, error, friend
    //hide: auto, action
    //action: notification, message
    let thisNotification = {
        action: 'notification',
        type: type,
        title: title,
        message: message,
        hide: hide,
    }   
    let thisUser = WSclients[token].ws;
    
    thisUser.send(JSON.stringify(thisNotification));
}

app.post('*', function (req, res) {
    let action = req.query.action;
    switch (action) {
        case 'email': {
            let response = email_validate(req.body.email)
            if (response != undefined) {
                res.send(response);
            }
            else {
                let token = generate_token(32);
                res.cookie('token', token, { secure: true, httpOnly: true, signed: true })
                checkTokenForExistance(token, req.body.email)
                res.send({ "result": "success", "message": "The email has sent successfully!" })
            }
            break;
        }
        case 'code': {
            let token = req.signedCookies.token;
            findRegistrationCode(token).then(function (response) {
                if (response == undefined) {
                    res.send({ status: false })
                }
                else {
                    let code = req.body.code;
                    if (code == response.code) {
                        res.send({ status: true })
                    }
                    else {
                        res.send({ status: false })
                    }
                }
            })
            break;
        }
        case 'resend': {
            let token = req.signedCookies.token;
            resend_code(token);
            break;
        }
        case 'register': {
            register(req, res);
            break;
        }
        case 'editProfile': {
            const form = new multiparty.Form();
            form.parse(req, function (err, fields, files) {
                let name = htmlspecialchars(fields.name.toString());
                let surname = htmlspecialchars(fields.surname.toString());
                let about = htmlspecialchars(fields.about.toString());
                let location = htmlspecialchars(fields.location.toString());
                let status = htmlspecialchars(fields.status.toString());
                let username = htmlspecialchars(fields.username.toString());
                let birthday_day = htmlspecialchars(fields.birthday_day.toString());
                let birthday_month = htmlspecialchars(fields.birthday_month.toString());
                let birthday_year = htmlspecialchars(fields.birthday_year.toString());
                let website = htmlspecialchars(fields.website.toString());
                let vk = htmlspecialchars(fields.vk.toString());
                let avatarChanged = htmlspecialchars(fields.avatarChanged.toString());
                let thisUser = {
                    name: name,
                    surname: surname,
                    about: about,
                    location: location,
                    status: status,
                    username: username,
                    birthday_day: birthday_day,
                    birthday_month: birthday_month,
                    birthday_year: birthday_year,
                    website: website,
                    vk: vk,
                    avatarChanged: avatarChanged
                }
                findChanges(res, req.signedCookies.token, thisUser, files);
            })
            break;
        }
        case 'changeEmail': {
            let token = req.signedCookies.token;
            let email = req.body.email;
            changeEmailSendCode(res, email, token);
            break;
        }
        case 'changeEmailCode':{
            let email = req.body.email;
            let code = req.body.code;
            let token = req.signedCookies.token;
            changeEmail_code(res, code, email, token);
        }
        case 'settings':{
            let token = req.signedCookies.token;
            changeSettings(res, token, req)
            break;
        }
        case 'search':{
            search(res, req.body);
            break;
        }
        case 'getFullInfo':{
            let type = req.body.type;
            let id = req.body.id;
            getFullInfo(type, parseInt(id), res)
            break;
        }
        case 'createCommunity':{
            const form = new multiparty.Form();
            form.parse(req, function(err, fields, files){
                let name = fields.name[0];
                let payments = fields.payments[0];
                let pricing = fields.pricing[0];
                let visibility = fields.visibility[0];
                let category = fields.category[0];
                let avatar = files.avatar;
                const thisGroupData = {}
                thisGroupData['name'] = name;
                thisGroupData['payments'] = payments;
                thisGroupData['pricing'] = pricing;
                thisGroupData['visibility'] = visibility;
                thisGroupData['category'] = category;
                thisGroupData['avatar'] = avatar;
                createCommunity_validate(res, thisGroupData, req.signedCookies.token);
            })
        }
        case 'getGroupInfo':{
            let thisGroup_id = req.body.groupid;
            getGroupInfo(thisGroup_id, res)
            break;
        }
        case 'deleteCommunity': {
            let token = req.signedCookies.token;
            let groupid = req.body.id;
            deleteCommunity(res, token, groupid)
        }
        case 'editCommunity':{
            const form = new multiparty.Form();
            form.parse(req, function(err, fields, files){
                editCommunity(res, files, fields, req.signedCookies.token)
            })
        }
    }
})

app_start();