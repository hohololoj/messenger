'use strict'
import express, { json, response } from 'express';
import path, { resolve } from 'path';
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
import imageSize from 'image-size';

const __dirname = path.resolve();
const ip = '127.0.0.1';
const port = process.env.PORT || 8000;
const app = express();
expressWs(app);
const emailForbiddenSymbols = ['!', '#', '$', '%', '^', '&', '*', '(', ')', '\\', '/', '}', '{', ':', ';', '?', '+'];
let images_extnames = ['jpg', 'jpeg', 'png', 'gif', 'ico', 'svg', 'bmp'];
let audio_extnames = ['mp3', 'wav', 'ogg'];
let video_extnames = ['mp4', 'webm', 'avi'];
let prehibited_extnames = ['exe', 'bat', 'bin', 'cmd'];
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
const settings = {
    email_visibility: {
        accepts: [0,1,2]
    },
    notification_preview: {
        accepts: [0,1]
    },
    phone_visibility: {
        accepts: [0,1,2]
    },
    play_comment_sound: {
        accepts: [true, false]
    },
    play_direct_sound: {
        accepts: [true, false]
    },
    play_group_sound: {
        accepts: [true, false]
    },
    show_comment_notification: {
        accepts: [true, false]
    },
    show_direct_notifications: {
        accepts: [true, false]
    },
    show_group_notifications: {
        accepts: [true, false]
    },
    theme_accent: {
        accepts: 'any'
    },
    theme_main: {
        accepts: 'any'
    }
}

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

async function mongoRequest(dbName, collectionName, requestType, range, request){
    let mongoClient;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db(dbName);
        let collection;
        if(requestType != 'checkForExistence'){
            collection = db.collection(collectionName);
        }
        switch(requestType){
            case 'get':{
                if(range == 'one'){
                    let response = await collection.findOne(request);
                    return response;
                }
                if(range == 'many'){
                    let response = await collection.find(request).toArray();
                    return response;
                }
                break;
            }
            case 'put':{
                if(range == 'one'){
                    await collection.insertOne(request);
                    return true;
                }
                if(range == 'many'){
                    await collection.insertMany(request);
                    return true;
                }
                break;
            }
            case 'update':{
                collection.updateOne(request.condition, {
                    $set: request.toUpdate
                })
                break;
            }
        }
    } 
    catch (error) {
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

function generateCache_id() {
    let timestamp = Date.now().toString();
    let code = '';
    for (let i = 0; i < 10; i++) {
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

function generate_cache_id(length) {
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
        let thisUser_contacts = [];
        for(let i = 0; i < thisUser.contacts.length; i++){
            let currentUser_id = thisUser.contacts[i];
            let currentUser_info = await users.findOne({ id: currentUser_id });
            let onlineStatus_classPart;
            let onlineStatus_text;
            if (currentUser_info.onlineStatus == 'online') {
                onlineStatus_classPart = 'online';
                onlineStatus_text = 'online'
            }
            else {
                onlineStatus_classPart = 'offline';
                let lastSeen = Date.now() - currentUser_info.onlineStatus;
                let hours = lastSeen / 1000 / 60 / 60;
                if (hours < 24) {
                    onlineStatus_text = 'today'
                }
                else {
                    if (hours < 48) {
                        onlineStatus_text = 'yesterday';
                    }
                    else {
                        let date = new Date(currentUser_info.onlineStatus);
                        console.log(date);
                        let day = date.getUTCDate();
                        if (day < 10) {
                            day = '0' + day;
                        }
                        let month = date.getUTCMonth();
                        month++;
                        if (month < 10) {
                            month = '0' + month;
                        }
                        let year = date.getUTCFullYear();
                        onlineStatus_text = (day + ':' + month + ':' + year)
                    }
                }
            }
            if(onlineStatus_text != 'online'){
                onlineStatus_text = `last seen ${onlineStatus_text}`;
            }
            thisUser_contacts.push({
                uid: currentUser_id,
                fullname: currentUser_info.fullname,
                avatar_path: currentUser_info.avatar_path.slice(39),
                onlineStatus_classPart: onlineStatus_classPart,
                onlineStatus_text: onlineStatus_text
            })
        }
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
        // const settingsdb = mongoClient.db('user-settings');
        // const thisUser_settings_collectionName = ('user-'+user_id);
        // const thisUser_settings_collection = settingsdb.collection(thisUser_settings_collectionName);
        // let thisUser_settings = await thisUser_settings_collection.find({}).toArray();
        // let thisUser_settings_obj = {};
        // for(let i = 0; i < thisUser_settings.length; i++){
        //     thisUser_settings_obj[Object.entries(thisUser_settings[i])[2][0]] = Object.entries(thisUser_settings[i])[2][1]
        // }
        let thisUser_settings = await mongoRequest('users', 'settings', 'get', 'one', {id: user_id});
        let thisUser_settings_obj = {
            whoCanSeeMyPhone: null,
            whoCanSeeMyEmail: null,
            showDirectMessagesNotifications: thisUser_settings.show_direct_notifications,
            playDirectMessagesSound: thisUser_settings.play_direct_sound,
            ShowCommunityGroupNotifications: thisUser_settings.show_group_notifications,
            PlayCommunityGroupSound: thisUser_settings.play_group_sound,
            ShowCommentNotifications: thisUser_settings.show_comment_notification,
            PlayCommentSound: thisUser_settings.play_comment_sound,
            NotificationPreview: thisUser_settings.notification_preview
        }
        console.log({'изначальные настройки:': thisUser_settings.phone_visibility})
        switch(thisUser_settings.phone_visibility){
            case 0:{thisUser_settings_obj.whoCanSeeMyPhone = 'Everyone'; break;}
            case 1:{thisUser_settings_obj.whoCanSeeMyPhone = 'Friends'; break;}
            case 2:{thisUser_settings_obj.whoCanSeeMyPhone = 'Nobody'; break;}
        }
        switch(thisUser_settings.email_visibility){
            case 0:{thisUser_settings_obj.whoCanSeeMyEmail = 'Everyone'; break;}
            case 1:{thisUser_settings_obj.whoCanSeeMyEmail = 'Friends'; break;}
            case 2:{thisUser_settings_obj.whoCanSeeMyEmail = 'Nobody'; break;}
        }
        console.log(thisUser_settings_obj)
        const groupsdb = mongoClient.db('groups');
        const list = groupsdb.collection('list');
        let thisUser_groupsAdmin = await list.find({creator_id: user_id}).toArray();
        thisUser_groupsAdmin = {thisUser_groupsAdmin: thisUser_groupsAdmin}
        let thisUser_groups = thisUser.groups;
        let thisUser_groups_toRender = [];

        for(let i = 0; i < thisUser_groups.length; i++){
            let thisGroup_id = thisUser_groups[i];
            let thisGroup_info = await mongoRequest('groups', 'list', 'get', 'one', {groupid: thisGroup_id});
            thisUser_groups_toRender.push({
                id: thisGroup_id,
                avatar: thisGroup_info.avatar_path,
                name: thisGroup_info.name,
                members: thisGroup_info.members.length
            })
        }

        thisUser_groups_toRender = {thisUser_groups_toRender: thisUser_groups_toRender}

        thisUser = Object.assign({}, thisUser, thisUser_settings_obj, thisUser_groupsAdmin, {thisUser_contacts: thisUser_contacts}, thisUser_groups_toRender);
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
        let promises = [];
        let chats = thisUser.chats;
        if(chats != undefined){
            for(let i = 0; i < chats.length; i++){
                let thisFriend_id = chats[i];
                let isGroup = false;
                if(/g/.test(thisFriend_id)){
                    isGroup = true;
                    thisFriend_id = parseInt(thisFriend_id.replace(/g/, ''));
                }
                promises.push(new Promise((resolve, reject) => {

                    let promise_userInfo;
                    if(isGroup){
                        promise_userInfo = new Promise((resolve, reject) => {
                            let groupData = mongoRequest('groups', 'list', 'get', 'one', {groupid: thisFriend_id});
                            resolve(groupData);
                        })
                    }
                    else{
                        promise_userInfo = new Promise((resolve, reject) => {
                            let userData = mongoRequest('users', 'users', 'get', 'one', {id: thisFriend_id});
                            resolve(userData);
                        })
                    }
                    let promise_lastMessage = new Promise((resolve, reject) => {
                        let promise_mongoConnect;
                        if(!isGroup){
                            let chatName = `${thisUser.id} - ${thisFriend_id}`;
                            promise_mongoConnect = new Promise((resolve, reject) => {
                            let mongoClient = new MongoClient('mongodb://localhost:27017');
                            mongoClient.connect();
                            const db = mongoClient.db('chats');
                            const thisChat = db.collection(chatName);
                            resolve(thisChat);
                            })
                        }
                        else{
                            let chatName = `group - ${thisFriend_id}`;
                            promise_mongoConnect = new Promise((resolve, reject) => {
                                let mongoClient = new MongoClient('mongodb://localhost:27017');
                                mongoClient.connect();
                                const db = mongoClient.db('chats');
                                const thisChat = db.collection(chatName);
                                resolve(thisChat);
                            })
                        }
                        promise_mongoConnect.then((thisChat)=>{
                            let lastMessage = thisChat.find().sort({$natural: -1}).limit(1).toArray();
                            resolve(lastMessage);
                        })
                    })
                    Promise.all([promise_userInfo, promise_lastMessage])
                    .then((thisChat)=>{
                        let thisFriend_info = thisChat[0];
                        let lastMessage = thisChat[1][0];
                        let thisFriend_info_toRender;
                        if(!isGroup){
                            thisFriend_info_toRender = {
                                id: thisFriend_info.id,
                                name: thisFriend_info.fullname,
                                avatar: thisFriend_info.avatar_path.slice(39),
                                onlineStatus: thisFriend_info.onlineStatus,
                                type: 'user'
                            }
                            thisFriend_info_toRender.onlineStatus == 'online' ? thisFriend_info_toRender.onlineStatus = 'online-status' : thisFriend_info_toRender.onlineStatus = 'online-status online-status_offline'; 
                        }
                        else{
                            thisFriend_info_toRender = {
                                id: thisFriend_info.groupid,
                                name: thisFriend_info.name,
                                avatar: thisFriend_info.avatar_path,
                                onlineStatus: 'online-status online-status_offline',
                                type: 'group'
                            }
                        }
                        let lastMessage_toRender = {
                            id: lastMessage._id,
                            message: '',
                            timestamp: ''
                        }
                        if(lastMessage.sender_id == thisUser.id){
                            lastMessage_toRender.message = 'You: ';
                        }
                        if(lastMessage.message == ''){
                            let length = 0;
                            if(lastMessage.files.audios != []){
                                length += lastMessage.files.audios.length
                            }
                            if(lastMessage.files.videos != []){
                                length += lastMessage.files.videos.length
                            }
                            if(lastMessage.files.others != []){
                                length += lastMessage.files.others.length
                            }
                            if(lastMessage.files.imgs != []){
                                length += lastMessage.files.imgs.length
                            }
                            lastMessage_toRender.message += `${length} attachments`;
                        }
                        else{
                            if(lastMessage.message.length > 60){
                                lastMessage_toRender.message += lastMessage.message.slice(57) + '...';
                            }
                            else{
                                lastMessage_toRender.message += lastMessage.message;
                            }
                        }
                        let today = new Date();
                        let lastMessage_timestamp = new Date(lastMessage.timestamp);
                        if(today.getUTCDate() == lastMessage_timestamp.getUTCDate() && today.getUTCMonth() == lastMessage_timestamp.getUTCMonth() && today.getUTCFullYear() == lastMessage_timestamp.getUTCFullYear()){
                            let timezone_offset = thisUser.timezone_offset;
                            timezone_offset /= 60;
                            let lastMessage_hours = lastMessage_timestamp.getUTCHours();
                            
                            lastMessage_hours -= timezone_offset
                            if(lastMessage_hours < 10){
                                lastMessage_hours = '0'+lastMessage_hours;
                            }
                            let lastMessage_minutes = lastMessage_timestamp.getUTCMinutes();
                            if(lastMessage_minutes < 10){
                                lastMessage_minutes = '0'+lastMessage_minutes;
                            }
                            let date = `${lastMessage_hours}:${lastMessage_minutes}`;
                            lastMessage_toRender.timestamp = date;
                        }
                        else{
                            let date = `
                            ${lastMessage_timestamp.getUTCDate() < 10 ? ('0'+lastMessage_timestamp.getUTCDate()) : lastMessage_timestamp.getUTCDate()}.${lastMessage_timestamp.getUTCMonth() < 10 ? ('0'+lastMessage_timestamp.getUTCMonth()) : lastMessage_timestamp.getUTCMonth()}.${lastMessage_timestamp.getUTCFullYear()}`;
                            lastMessage_toRender.timestamp = date;
                        }

                        resolve({
                            type: isGroup ? 'group':'user',
                            friendInfo: thisFriend_info_toRender,
                            lastMessage: lastMessage_toRender
                        })
                    })
                }))
            }
        }
        Promise.all(promises)
        .then((chats) => {
            console.log(chats)
            let chats_arr = [];
            for(let i = 0; i < chats.length; i++){
                chats_arr.push(chats[i]);
            }
            thisUser.chats = chats_arr;
            res.render('app.hbs', thisUser);
        })
    })
}

async function register_route(token, res) {
    let isRegistered = await checkForRegistered(token, res);
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

async function findOfflineNotifications(ws, token){
    let id = await mongoRequest('logged', 'tokens', 'get', 'one', {token: token});
    id = id.id;
    let offlineNotifications = await mongoRequest('users', 'users', 'get', 'one', {id: id});
    offlineNotifications = offlineNotifications.offlineNotifications;
    if(offlineNotifications == '' || offlineNotifications == [] || offlineNotifications == undefined){
        return false;
    }
    else{
        for(let i = 0; i < offlineNotifications.length; i++){
            console.log(1);
            notification_send(token, offlineNotifications[i].type, offlineNotifications[i].title, offlineNotifications[i].message, offlineNotifications[i].hide)
        }
        mongoRequest('users', 'users', 'update', '', {condition: {id: id}, toUpdate: {offlineNotifications: ""}})
    }
}

app.ws('/app', function(ws, req){
    handleNewWSClient(ws, req)
    ws.on('message', function(message){
        if(message == 'socket connection test'){
            findOfflineNotifications(ws, req.signedCookies.token)
        }
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
            if(req.query.action == 'logout'){
                res.clearCookie('token');  
            }
            if(req.query.action == 'download'){
                let fileName = req.query.fileName;
                sendFileToDownload(fileName, res);
                return 0;
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
    console.log(token);
    let mongoClient;
    try {
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const db = mongoClient.db('email_tokens');
        const tokens = db.collection('tokens');
        let response = await tokens.findOne({ token: token });
        if (response == undefined) {
            return false;
        }
        else {
            let email = response.email;
            const codes = db.collection('codes');
            response = await codes.findOne({ email: email });
            let userinfo = await mongoRequest('users', 'users', 'get', 'one', {email: email});
            return {response: response, userinfo: userinfo};
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
        if(nickname == ''){
            return { status: false, message: 'please enter the nickname' };
        }
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
        fullname: `${thisUser_name} ${thisUser_surname}`,
        offlineNotifications: '',
        contacts: ''
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

async function checkForRegistered(token, res) {
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

async function changeSettings(token, setting, res) {

    console.log('Принят запос на изменение настроек:', {
        setting: setting
    })
    let key = setting.name;
    let settings_list = Object.keys(settings);
    console.log(settings[key])
    if((!settings_list.includes(key) || !settings[key].accepts.includes(setting.setting)) && settings[key].accepts != 'any'){
        res.send({});
        notification_send(token, 'error', 'Something went wrong', '', 'auto')
    }
    
    else{
        let userLogged_promise = new Promise((resolve, reject) => {
            let thisUser_logged = mongoRequest('logged', 'tokens', 'get', 'one', {token: token});
            resolve(thisUser_logged);
        })
        userLogged_promise.then((thisUser_logged) => {
            let thisUser_id = thisUser_logged.id;
            let updateSetting_promise = new Promise((resolve, reject) => {
                let setting_toUpdate = {};
                setting_toUpdate[key] = setting.setting;
                console.log(setting_toUpdate);
                mongoRequest('users', 'settings', 'update', '', { condition: { id: thisUser_id }, toUpdate: setting_toUpdate });
                resolve()
            })
            updateSetting_promise.then(()=>{
                res.send({status: 'success'});
            })
        })
    }
}

async function search(res, search_object, token){
    let idreq = await mongoRequest('logged', 'tokens', 'get', 'one', {token: token});
    let requestingUser_id = idreq.id;
    let range = search_object.range;
    let request = search_object.search_request;
    if(request.includes('@')){
        request = request.replace(/@/gm, '');
    }
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
                console.log('response: ', response);
                let response_obj = {};
                response_obj.people = [];
                let requestingUser_frindsList = await mongoRequest('users', 'users', 'get', 'one', {id: requestingUser_id});
                requestingUser_frindsList = requestingUser_frindsList.contacts;
                for(let i = 0; i < response.length; i++) {
                    if(response[i].id == requestingUser_id){
                        continue;
                    }
                    let isFriend = (requestingUser_frindsList.includes(response[i].id));
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
                                if(month < 10){
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
                        id: response[i].id,
                        isFriend: isFriend
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
                        members: response[i].members.length,
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
                                if (month < 10) {
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

async function getFullInfo(type, id, res, token){ //Полная инфа о юзере
    console.log('получен запрос на полное инфо: ', {
        type: type,
        id: id,
        token: token
    })
    switch(type){
        case 'user':{
            let mongoClient;
            let response;
            try {
                let requestingUser_id = await mongoRequest('logged', 'tokens', 'get', 'one', {token: token});
                requestingUser_id = requestingUser_id.id;
                let requestingUser_frindsList = await mongoRequest('users', 'users', 'get', 'one', {id: requestingUser_id});
                requestingUser_frindsList = requestingUser_frindsList.contacts;
                let isFriend = requestingUser_frindsList.includes(id);
                mongoClient = new MongoClient('mongodb://localhost:27017');
                await mongoClient.connect();
                response = await mongoRequest('users', 'users', 'get', 'one', {id: id});
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
                                let day = date.getUTCDate();
                                if(day < 10){
                                    day = '0'+day;
                                }
                                let month = date.getUTCMonth();
                                month++;
                                if(month < 10){
                                    month = '0'+month;
                                }
                                let year = date.getUTCFullYear();
                                thisUser_onlineStatus = (day+':'+month+':'+year)
                            }
                        }                        
                    }
                    else{
                        thisUser_onlineStatus = 'online'
                    }
                let thisUserSettings = await mongoRequest('users', 'settings', 'get', 'range', {id: id});
                // let thisUserEmailSettings = findSettingProperty(thisUserSettings, 'whoCanSeeMyEmail');
                let thisUserEmail;
                thisUserEmail = response.email;
                // Доделать проверку скрытости email
                // if(thisUserEmailSettings == 'Everyone'){
                //     thisUserEmail = response.email;
                // }
                // if(thisUserEmailSettings == 'Nobody'){
                //     thisUserEmail = 'hidden';
                // }
                
                let date = new Date(response.date);
                let joined_day = date.getUTCDate()+1;
                let joined_month = date.getUTCMonth()+1;
                joined_month = joined_month.toString();
                if(parseInt(joined_month) < 10){
                    joined_month = '0'+joined_month;
                }
                joined_month = months[joined_month];
                let joined_year = date.getUTCFullYear();
                let joined = joined_day+' '+joined_month+' '+joined_year;
                let birthday, birthmonth, birthyear, age;
                if (response.dateOfBirth_day != '') {
                    birthday = response.dateOfBirth_day;
                    if (birthday.length != 2) {
                        birthday = '0' + birthday;
                    }
                    birthmonth = response.dateOfBirth_month;
                    birthyear = response.dateOfBirth_year;
                    birthyear.toString();
                    birthyear += ',';
                    birthday = birthday.toString();
                    birthmonth = birthmonth.toString();
                    birthmonth = months[birthmonth];
                    let date = new Date(response.dateOfBirth_year, --response.dateOfBirth_month, response.dateOfBirth_day);
                    let time = Date.now() - date.getTime();
                    console.log(time)
                    age = Math.floor(time/1000/60/60/24/365);
                    age += 'y.o.';
                }
                else{
                    birthday = 'Not filled yet';
                    birthmonth = '';
                    birthyear = '';
                    age = '';
                }
                let vk = response.vk;
                let vkshort = '';
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
                    dateOfBirth: (birthday+' '+birthmonth+' '+ birthyear+' '+age),
                    joined: joined,
                    about: response.about,
                    vkshort: vkshort[0],
                    isFriend: isFriend,
                }
                res.send(requset_response);
            }
            catch (error) {
                console.error('Connection to MongoDB Atlas failed!', error);
            }
            break;
        }
        case 'groups':{
            let groupInfo = await mongoRequest('groups', 'list', 'get', 'one', {groupid: id});
            let thisUser_id = await mongoRequest('logged', 'tokens', 'get', 'one', {token: token});
            thisUser_id = thisUser_id.id;
            let isMember = groupInfo.members.includes(thisUser_id);
            let thisGroupMembers = groupInfo.members;
            let thisGroupMembers_responseArr = [];
            for(let i = 0; i < thisGroupMembers.length; i++){
                let thisMemberInfo = await mongoRequest('users', 'users', 'get', 'one', {id: thisGroupMembers[i]});
                thisMemberInfo = {
                    id: thisMemberInfo.id,
                    avatar: thisMemberInfo.avatar_path.slice(39),
                    fullname: thisMemberInfo.fullname,
                    onlineStatus: thisMemberInfo.onlineStatus
                }
                if(thisMemberInfo.onlineStatus == 'online'){
                    thisMemberInfo.onlineStatus = `<div class="member-subtitle-text member-subtitle-text_online">online</div>`
                }
                else{
                    let today = new Date();
                    let lastOnline = new Date(thisMemberInfo.onlineStatus);
                    if(today.getUTCDate() == lastOnline.getUTCDate() && today.getUTCMonth() == lastOnline.getUTCMonth() && today.getUTCFullYear() == lastOnline.getUTCFullYear()){
                        thisMemberInfo.onlineStatus = `<div class="member-subtitle-text">last seen today</div>`;
                    }
                    else{                       
                        let day = lastOnline.getUTCDate();
                        if(day < 10){day = '0'+day;}

                        let month = lastOnline.getUTCMonth()+1;
                        if(month < 10){month = '0'+month;}

                        let year = lastOnline.getUTCFullYear();

                        let date = `${day}.${month}.${year}`;

                        thisMemberInfo.onlineStatus = `<div class="member-subtitle-text">last seen ${date}</div>`
                    }
                }
                thisGroupMembers_responseArr.push(thisMemberInfo);
            }      
            console.log(groupInfo.avatar_path); 
            let response_obj = {
                gid: groupInfo.groupid,
                name: groupInfo.name,
                avatar: groupInfo.avatar_path,
                members_quantity: groupInfo.members.length,
                isMember: isMember,
                memberActions: isMember? '<div class="user-actions-block-item"><img src="./icons/icon-mute.svg"> Mute notifications</div><div class="user-actions-block-item group-action_leave-button"><img src="./icons/icon-leave.svg"> Leave the group</div>': '',
                ownerActions: (groupInfo.creator_id == thisUser_id)? `<div class="user-actions-block-item edit-community-button-secret" groupid="${groupInfo.groupid}"><img src="./icons/icon-edit.svg"> Edit group</div>`: '',
                shortName: groupInfo.shortname,
                about: groupInfo.description,
                payments: (groupInfo.payments=='Free')?'$Free':`$${groupInfo.pricing} per month`,
                members_list: thisGroupMembers_responseArr
            }
            res.send(response_obj)
            break;
        }
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
            members: [thisUser_id],
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

function send_socket_message(token, message){
    let thisMessage = JSON.stringify(message);
    let thisUser = WSclients[token].ws;
    thisUser.send(thisMessage);
}

function send_socket_chatMessage(token, message){
    if (message.files != null) {
        let thisMessage_images = message.files.imgs;
        let images_toReturn = [];
        let promises = [];
        for (let i = 0; i < thisMessage_images.length; i++) {
            let thisImage_path = './public/chat_files/imgs/' + thisMessage_images[i];
            promises.push(new Promise((resolve, reject) => {
                imageSize(thisImage_path, (err, dimensions) => {
                    let thisImage = {
                        path: `${thisMessage_images[i]}`,
                        dimensions: {
                            height: dimensions.height,
                            width: dimensions.width
                        }
                    }
                    console.log(`картинка получена: ${thisImage_path}\nШирина: ${dimensions.width}\nВысота: ${dimensions.height}`);
                    thisMessage_images[i] = thisImage;
                    resolve()
                })
            }))
        }
        let promise = new Promise((resolve, reject) => {
            Promise.all(promises)
                .then(() => {
                    resolve()
                })
        })
        promise.then(() => {
            let others_arr = [];
            for (let i = 0; i < message.files.others.length; i++) {
                let thisFile_name = message.files.others[i];
                let thisFile_fullInfo = getFullFileInfo(thisFile_name, 'others')
                others_arr.push(thisFile_fullInfo);
            }
            message.files.others = others_arr;
            let thisMessage = JSON.stringify(message);
            let thisUser = WSclients[token].ws;
            let messageObj = {
                action: 'chatMessage',
                message: thisMessage
            }
            messageObj = JSON.stringify(messageObj);
            thisUser.send(messageObj);
        })
    }
    else {
        let thisMessage = JSON.stringify(message);
        let thisUser = WSclients[token].ws;
        let messageObj = {
            action: 'chatMessage',
            message: thisMessage
        }
        messageObj = JSON.stringify(messageObj);
        thisUser.send(messageObj);
    }
}

async function writeOfflineNotification(thisUser, token, type, title, message, hide) {
    if (thisUser.offlineNotifications == [] || thisUser.offlineNotifications == '' || thisUser.offlineNotifications == undefined) {
        thisUser.offlineNotifications = [];
        thisUser.offlineNotifications.push({
            type: type,
            title: title,
            message: message,
            hide: hide
        })
        mongoRequest('users', 'users', 'update', '', { condition: { id: thisUser.id }, toUpdate: { offlineNotifications: thisUser.offlineNotifications } });
    }
    else {
        let thisNotification = {
            type: type,
            title: title,
            message: message,
            hide: hide
        }
        if (thisUser.offlineNotifications.indexOf(thisNotification) != -1) {
            thisUser.offlineNotifications.push({
                type: type,
                title: title,
                message: message,
                hide: hide
            })
            mongoRequest('users', 'users', 'update', '', { condition: { id: thisUser.id }, toUpdate: { offlineNotifications: thisUser.offlineNotifications } });
        }
        else{
            console.log('Такое уведомление уже есть');
        }
    }
}

async function addToFriends(user_toAdd_id, token, res){
    let mongoClient;
    try {
        user_toAdd_id = htmlspecialchars(user_toAdd_id);
        user_toAdd_id = parseInt(user_toAdd_id);
        mongoClient = new MongoClient('mongodb://localhost:27017');
        await mongoClient.connect();
        const usersdb = mongoClient.db('users');
        const loggeddb = mongoClient.db('logged');
        const logged_tokens = loggeddb.collection('tokens');
        const users = usersdb.collection('users');
        const cachedb = mongoClient.db('localcache');
        const friends_requests = cachedb.collection('friends_requests');
        let response = await logged_tokens.findOne({token: token});
        let user_sending_id = response.id;
        let user_sending_fullinfo = await users.findOne({id: user_sending_id});
        let user_sending_fullname = user_sending_fullinfo.fullname;
        let user_toAdd = await users.findOne({id: user_toAdd_id});
        if(user_toAdd == undefined){
            notification_send(token, 'error', 'User not found', 'Something went wrong', 'auto');
            res.send({status: 'error'});
            return false;
        }
        const friends_request_obj = {
            from: user_sending_id,
            to: user_toAdd_id
        }
        if(await friends_requests.findOne({from: user_sending_id, to: user_toAdd_id}) == undefined){
            friends_requests.insertOne({id: generateCache_id(),from: friends_request_obj.from, to: friends_request_obj.to});
        }
        if(user_toAdd.onlineStatus != 'online'){
            writeOfflineNotification(user_toAdd, null, 'friends', `<span class="account-notification-link" uid="${user_sending_id}">${user_sending_fullname}</span> wants to add you in friend list`, '', 'click')
        }
        else{
            let user_toAdd_token = await logged_tokens.findOne({id: user_toAdd_id});
            user_toAdd_token = user_toAdd_token.token;
            notification_send(user_toAdd_token, 'friends', `<span class="account-notification-link" uid="${user_sending_id}">${user_sending_fullname}</span> wants to add you in friend list`, '', 'click');
        }
    } catch (error) {
        console.error('Connection to MongoDB Atlas failed!', error);
        //process.exit();
    }
}

function calculateLastOnline(lastOnline){
    console.log(lastOnline);
    if(lastOnline == 'online'){
        return 'online';
    }
    let lastSeen = Date.now() - lastOnline;
    let hours = lastSeen / 1000 / 60 / 60;
    let onlineStatus_text;
    if (hours < 24) {
        onlineStatus_text = 'today'
    }
    else {
        if (hours < 48) {
            onlineStatus_text = 'yesterday';
        }
        else {
            let date = new Date(lastOnline);
            let day = date.getUTCDate();
            if (day < 10) {
                day = '0' + day;
            }
            let month = date.getUTCMonth();
            month++;
            if (month < 10) {
                month = '0' + month;
            }
            let year = date.getUTCFullYear();
            onlineStatus_text = (day + ':' + month + ':' + year)
        }
    }
    return ('last seen '+onlineStatus_text);
}

async function friendRequestResponse_handler(token, answer, from, res){
    from = parseInt(from)
    let mongoClient;
    mongoClient = new MongoClient('mongodb://localhost:27017');
    await mongoClient.connect();
    const cachedb = mongoClient.db('localcache');
    const friends_requests = cachedb.collection('friends_requests');
    const usersdb = mongoClient.db('users');
    const users = usersdb.collection('users');
    const loggeddb = mongoClient.db('logged');
    const tokens = loggeddb.collection('tokens');
    let reciever_id = await tokens.findOne({ token: token });
    reciever_id = reciever_id.id;
    switch(answer){
        case 'accept':{
            let thisRequest = await friends_requests.findOne({from: from, to: parseInt(reciever_id)});
            console.log({from: parseInt(from), to: parseInt(reciever_id)});
            console.log('request found: ', thisRequest);
            if(thisRequest != undefined){
                //Запрос найден в бд кэш
                let sender_info = await users.findOne({id: from});
                //Находится имя-фамилия юзера
                if(sender_info == undefined){res.send({status: 'error'}); notification_send(token, 'error', 'Action failed', 'Something went wrong', 'auto');}
                    let receiver_info = await users.findOne({id: reciever_id});
                    let sender_token = await tokens.findOne({id: from});
                    sender_token = sender_token.token;
                    sender_info = await users.findOne({id: from});
                    notification_send(sender_token, 'alert', `${receiver_info.fullname}`, 'accepted your friend request', 'auto');
                    let reciever_contacts = await users.findOne({id: reciever_id});
                    reciever_contacts = reciever_contacts.contacts;
                    if(reciever_contacts.length > 0){
                        if(reciever_contacts.indexOf(from) == -1){
                            reciever_contacts.push(from);
                        }
                    }
                    else{
                        reciever_contacts = [];
                        reciever_contacts[0] = from;
                    }
                    await users.updateOne({id: reciever_id}, {
                        $set: {
                            contacts: reciever_contacts
                        }
                    })
                    let sender_contacts = sender_info.contacts;
                    if(sender_contacts.length > 0){
                        if(sender_contacts.indexOf(reciever_id) == -1){
                            sender_contacts.push(reciever_id)
                        }
                    }
                    else{
                        sender_contacts = [];
                        sender_contacts[0] = reciever_id;
                    }
                    await users.updateOne({id: from}, {
                        $set: {
                            contacts: sender_contacts
                        }
                    }) 
                    let onlineStatus_classPart;
                    let onlineStatus_value;
                    if(sender_info.onlineStatus == 'online'){
                        onlineStatus_classPart = 'online';
                        onlineStatus_value = 'online';
                    }
                    else{
                        onlineStatus_classPart = 'offline'
                        onlineStatus_value = calculateLastOnline(sender_info.onlineStatus);
                    }
                    let message = {
                        action: 'system',
                        context: 'contacts',
                        toadd: {
                            uid: sender_info.id,
                            fullname: sender_info.fullname,
                            avatar_path: sender_info.avatar_path.slice(39),
                            onlineStatus: onlineStatus_value,
                            onlineStatus_classPart: onlineStatus_classPart
                        }
                    }
                    send_socket_message(token, message)
                    if(receiver_info.onlineStatus == 'online'){
                        onlineStatus_classPart = 'online';
                        onlineStatus_value = 'online';
                    }
                    else{
                        onlineStatus_classPart = 'offline'
                        onlineStatus_value = calculateLastOnline(receiver_info.onlineStatus);
                    }
                    message = {
                        action: 'system',
                        context: 'contacts',
                        toadd: {
                            uid: receiver_info.id,
                            fullname: receiver_info.fullname,
                            avatar_path: receiver_info.avatar_path.slice(39),
                            onlineStatus: onlineStatus_value,
                            onlineStatus_classPart: onlineStatus_classPart
                        }
                    }
                    send_socket_message(sender_token, message)
                    notification_send(token, 'alert', `${sender_info.fullname}`, 'added to your contacts list', 'auto');
                    if(sender_info.onlineStatus == 'online'){
                        notification_send(sender_token, 'alert', `${receiver_info.fullname}`, 'added to your contacts list', 'auto');
                    }
                    else{
                        writeOfflineNotification(receiver_info, null, 'note', `${receiver_info.fullname}`, 'added to your contacts list', 'auto')
                    }
            }
            else{
                res.send({status: 'error'})
                notification_send(token, 'error', 'Action failed', 'Something went wrong', 'auto');
            }
            break;
        }
        case 'reject':{

            break;
        }
        default:{
            res.send({status: 'error'});
            notification_send(token, 'error', 'Action failed', 'Something went wrong', 'auto');
        }
    }
}

async function checkFriendshipForExistance(user_sending_id, user_toDelete_id){
    let user_sending_contactsList = await mongoRequest('users', 'users', 'get', 'one', {id: user_sending_id});
    user_sending_contactsList = user_sending_contactsList.contacts;
    let user_toDelete_contactsList = await mongoRequest('users', 'users', 'get', 'one', {id: user_toDelete_id});
    user_toDelete_contactsList = user_toDelete_contactsList.contacts;
    if(user_sending_contactsList.includes(user_toDelete_id) && user_toDelete_contactsList.includes(user_sending_id)){
        return true;
    }
    else{return false;}
}

async function removeFromFriends(user_sending_token, user_toDelete_id, res){

    user_toDelete_id = parseInt(user_toDelete_id);
    let user_sending_id = await mongoRequest('logged', 'tokens', 'get', 'one', {token: user_sending_token});
    user_sending_id = user_sending_id.id; // Айди отправляющего
    let user_toDelete_info = await mongoRequest('users', 'users', 'get', 'one', {id: user_toDelete_id});
    let user_sending_info = await mongoRequest('users', 'users', 'get', 'one', {id: user_sending_id});
    let user_toDelete_onlineStatus = user_toDelete_info.onlineStatus

    if(user_toDelete_onlineStatus != 'online'){
        if(checkFriendshipForExistance(user_sending_id, user_toDelete_id)){
            //Принимающий не онлайн

            let user_sending_contactsList = user_sending_info.contacts;
            let user_toDelete_contactsList = user_toDelete_info.contacts;

            let index = user_sending_contactsList.indexOf(user_toDelete_id);
            user_sending_contactsList.splice(index, 1);

            index = user_toDelete_contactsList.indexOf(user_sending_id);
            user_toDelete_contactsList.splice(index, 1);

            await mongoRequest('users', 'users', 'update', '', {condition: {id: user_sending_id}, toUpdate: {contacts: user_sending_contactsList}})
            await mongoRequest('users', 'users', 'update', '', {condition: {id: user_toDelete_id}, toUpdate: {contacts: user_toDelete_contactsList}})

            notification_send(user_sending_token, 'alert', 'User deleted from friends successfully', `<strong>${user_toDelete_info.fullname}</strong> has been successfully deleted from your frinds list`, 'auto');
            writeOfflineNotification(user_toDelete_info, null, 'alert', 'You have been removed from friends list', `<strong>${user_sending_info.fullname}</strong> has deleted you from friends list`, 'auto')
        }
        else{
            res.send({status: 'error', message: 'Something went wrong'})
            notification_send(user_sending_token, 'error', 'User wasnt deleted from friends', 'Someting went wrong', 'auto')
        }
    }
    else{
        if(checkFriendshipForExistance(user_sending_id, user_toDelete_id)){
            //Принимающий онлайн

            let user_sending_contactsList = user_sending_info.contacts;
            let user_toDelete_contactsList = user_toDelete_info.contacts;

            let index = user_sending_contactsList.indexOf(user_toDelete_id);
            user_sending_contactsList.splice(index, 1);

            index = user_toDelete_contactsList.indexOf(user_sending_id);
            user_toDelete_contactsList.splice(index, 1);

            await mongoRequest('users', 'users', 'update', '', {condition: {id: user_sending_id}, toUpdate: {contacts: user_sending_contactsList}})
            await mongoRequest('users', 'users', 'update', '', {condition: {id: user_toDelete_id}, toUpdate: {contacts: user_toDelete_contactsList}})

            let user_toDelete_token = await mongoRequest('logged', 'tokens', 'get', 'one', {id: user_toDelete_id});
            user_toDelete_token = user_toDelete_token.token;

            notification_send(user_sending_token, 'alert', 'User deleted from friends successfully', `<strong>${user_toDelete_info.fullname}</strong> has been successfully deleted from your frinds list`, 'auto');
            notification_send(user_toDelete_token, 'alert', 'You have been removed from friends list', `<strong>${user_sending_info.fullname}</strong> has deleted you from friends list`, 'auto');

        }
        else{
            res.send({status: 'error', message: 'Something went wrong'})
            notification_send(user_sending_token, 'error', 'User wasnt deleted from friends', 'Someting went wrong', 'auto')
        }
    }
}

function getFullFileInfo(fileName, context){
    let stats = fs.statSync(`./public/chat_files/${context}/${fileName}`);
    let fileWeight = stats.size;
    let fileWeight_toReturn;
    if(fileWeight > 1024){
        fileWeight = fileWeight/1024;
        if(fileWeight > 1024){
            fileWeight = fileWeight/1024;
            fileWeight_toReturn = `${fileWeight.toFixed(1)}MB`;
        }
        else{
            fileWeight_toReturn = `${fileWeight.toFixed(1)}KB`;
        }
    }
    else{
        fileWeight_toReturn = `${fileWeight}B`;
    }
    return {
        fileName: fileName,
        fileWeight: fileWeight_toReturn
    }
}

async function fillChatHistory_info(res, response){
    for(let i = 0; i < response.chatHistory.length; i++){
        let thisMessage_senderid = response.chatHistory[i].sender_id;
        let sender_info = await mongoRequest('users', 'users', 'get', 'one', {id: thisMessage_senderid});
        response.chatHistory[i].sender_avatar = sender_info.avatar_path.slice(39);
        response.chatHistory[i].sender_fullname = sender_info.fullname;
    }
    res.send(response);
}

async function calculateImages(images){
    return new Promise((resolve, reject) => {
        let images_toReturn = [];
        let promises = [];

        for(let i = 0; i < images.length; i++){
            let thisImage = './public/chat_files/imgs/'+images[i];
            promises.push(new Promise((resolve, reject) => {
                imageSize(thisImage, (err, dimensions) => {
                    images_toReturn.push({
                        path: images[i],
                        dimensions: {
                            'width': dimensions.width,
                            'height': dimensions.height
                        }
                    })
                    console.log(`Картинка отправлена: `, {
                        path: images[i],
                        dimensions: {
                            'width': dimensions.width,
                            'height': dimensions.height
                        }
                    });
                    resolve()
                })
            }))
        }
        Promise.all(promises)
        .then(
            () => {
            resolve(images_toReturn)
        })
    })
}

async function getChatHistory(user_sending_token, user_toSend_id, action_context, res){
    let user_sending_id = await mongoRequest('logged', 'tokens', 'get', 'one', {token: user_sending_token});
    user_sending_id = user_sending_id.id;
    user_toSend_id = parseInt(user_toSend_id);
    switch(action_context){
        case 'user':{
            
            let user_toSend_onlineStatus = await mongoRequest('users', 'users', 'get', 'one', {id: user_toSend_id});
            user_toSend_onlineStatus = user_toSend_onlineStatus.onlineStatus;
        
            let thisChat_collectionName = `${user_sending_id} - ${user_toSend_id}`;
            let thisChat_collectionName_reversed = `${user_toSend_id} - ${user_sending_id}`;
        
            let mongoClient;
            try {
                mongoClient = new MongoClient('mongodb://localhost:27017');
                await mongoClient.connect();
                const db = mongoClient.db('chats');
                
                let chatHistory;
        
                db.listCollections({ name: thisChat_collectionName }).next(function (err, colinfo) {
                    if (colinfo == null) {
                        db.createCollection(thisChat_collectionName);
                        chatHistory = [];
                        
                        let promise = new Promise((resolve, reject) => {
                            let user_toSend_info_response = mongoRequest('users', 'users', 'get', 'one', {id: user_toSend_id});
                            resolve(user_toSend_info_response);
                        })
                        promise.then((user_toSend_info_response) => {
                            let user_toSend_info = {
                                avatar: user_toSend_info_response.avatar_path.slice(39),
                                fullname: user_toSend_info_response.fullname,
                                onlineStatus: calculateLastOnline(user_toSend_info_response.onlineStatus),
                                id: user_toSend_id,
                            }
                            let response = {
                                chatHistory: chatHistory,
                                userInfo: user_toSend_info
                            }
                            console.log('chat not found, response: ', response);
                            res.send(response);
                        })
                    }
                    else{
                        Promise.all([
                            new Promise((resolve,reject) => {
                                let chatHistory = mongoRequest('chats', thisChat_collectionName, 'get', 'many', {});
                                resolve(chatHistory);
                            }),
                            new Promise((resolve,reject) => {
                                let user_toSend_info = mongoRequest('users', 'users', 'get', 'one', {id: user_toSend_id});
                                resolve(user_toSend_info);
                            })
                        ])
                        .then(results => {                    
                            let chatHistory = results[0];
                            let chatHistory_filled = [];
                            let filePromise = new Promise((resolve, reject) => {
                            for (let i = 0; i < chatHistory.length; i++) {
                                chatHistory_filled.push({
                                    message_id: '',
                                    sender_id: '',
                                    sender_avatar: '',
                                    sender_fullname: '',
                                    time: '',
                                    message: '',
                                    files: {
                                        audios: [],
                                        videos: [],
                                        imgs: [],
                                        others: []
                                    }
                                });
                                chatHistory_filled[i].message_id = chatHistory[i]._id;
                                chatHistory_filled[i].sender_id = chatHistory[i].sender_id;
                                chatHistory_filled[i].message = chatHistory[i].message;
                                chatHistory_filled[i].time = chatHistory[i].timestamp;
                                if (chatHistory[i].files != null) {
                                    chatHistory_filled[i].files = {
                                        audios: chatHistory[i].files.audios,
                                        videos: chatHistory[i].files.videos,
                                        imgs: chatHistory[i].files.imgs,
                                        others: [],
                                    };
                                    let thisImages = chatHistory_filled[i].files.imgs;
                                    calculateImages(thisImages)
                                    .then((images) => {
                                        chatHistory_filled[i].files.imgs = images;
                                    })
                                    let others_arr = [];
                                    for (let j = 0; j < chatHistory[i].files.others.length; j++) {
                                        let thisFile_name = chatHistory[i].files.others[j];
                                        let thisFile_fullInfo = getFullFileInfo(thisFile_name, 'others')
                                        others_arr.push(thisFile_fullInfo);
                                    }
                                    chatHistory_filled[i].files.others = others_arr;
                                }
                                else{
                                    chatHistory_filled[i].files = {
                                        audios: [],
                                        videos: [],
                                        imgs: [],
                                        others: [],
                                    };
                                }
                            }
                            resolve()
                            })
                            .then(() => {
                                let user_toSend_info_response = results[1];
                            let user_toSend_info = {
                                fullname: user_toSend_info_response.fullname,
                                avatar: user_toSend_info_response.avatar_path.slice(39),
                                onlineStatus: calculateLastOnline(user_toSend_info_response.onlineStatus),
                                id: user_toSend_id
                            }
                            let response = {
                                chatHistory: chatHistory_filled,
                                userInfo: user_toSend_info
                            }
                            fillChatHistory_info(res, response);
                            db.listCollections({ name: thisChat_collectionName_reversed }).next(function (err, colinfo) {
                                if (colinfo == null) {
                                    db.createCollection(thisChat_collectionName_reversed);
                                }
                            })
                            })
                        })
                    }
                })
            } catch (error) {
                console.error('Connection to MongoDB Atlas failed!', error);
                //process.exit();
            }
            break;
        }
        case 'group':{
            let thisGroup_info = await mongoRequest('groups', 'list', 'get', 'one', {groupid: user_toSend_id});
            let thisGroup_members = thisGroup_info.members;
            if(thisGroup_members.includes(user_sending_id)){
                let groupChat_collectionName = `group - ${user_toSend_id}`;
                let mongoClient;
                try {
                    mongoClient = new MongoClient('mongodb://localhost:27017');
                    await mongoClient.connect();
                    const db = mongoClient.db('chats');
                    
                    let chatHistory;
                    
                    db.listCollections({ name: groupChat_collectionName }).next(function (err, colinfo) {
                        if (colinfo == null) {
                            db.createCollection(groupChat_collectionName);
                            chatHistory = [];
                            let response_obj = {
                                chatHistory: chatHistory,
                                groupInfo: {
                                    groupName: thisGroup_info.name,
                                    avatar: thisGroup_info.avatar_path,
                                    id: thisGroup_info.groupid,
                                    members: thisGroup_info.members.length
                                }
                            }
                            console.log('groupChatHistory response sent: ', response_obj)
                            res.send(response_obj);
                        }
                        else{
                            if(thisGroup_members.includes(user_sending_id)){
                                let groupChat_collectionName = `group - ${user_toSend_id}`;
                                new Promise((resolve, reject) => {
                                    let chatHistory = mongoRequest('chats', groupChat_collectionName, 'get', 'many', {});
                                    resolve(chatHistory);
                                })
                                .then(chatHistory => {                    
                                    let chatHistory_filled = [];
                                    let filePromise = new Promise((resolve, reject) => {
                                    for (let i = 0; i < chatHistory.length; i++) {
                                        chatHistory_filled.push({
                                            message_id: '',
                                            sender_id: '',
                                            sender_avatar: '',
                                            sender_fullname: '',
                                            time: '',
                                            message: '',
                                            files: {
                                                audios: [],
                                                videos: [],
                                                imgs: [],
                                                others: []
                                            }
                                        });
                                        chatHistory_filled[i].message_id = chatHistory[i]._id;
                                        chatHistory_filled[i].sender_id = chatHistory[i].sender_id;
                                        chatHistory_filled[i].message = chatHistory[i].message;
                                        chatHistory_filled[i].time = chatHistory[i].timestamp;
                                        if (chatHistory[i].files != null) {
                                            chatHistory_filled[i].files = {
                                                audios: chatHistory[i].files.audios,
                                                videos: chatHistory[i].files.videos,
                                                imgs: chatHistory[i].files.imgs,
                                                others: [],
                                            };
                                            let thisImages = chatHistory_filled[i].files.imgs;
                                            calculateImages(thisImages)
                                            .then((images) => {
                                                chatHistory_filled[i].files.imgs = images;
                                            })
                                            let others_arr = [];
                                            for (let j = 0; j < chatHistory[i].files.others.length; j++) {
                                                let thisFile_name = chatHistory[i].files.others[j];
                                                let thisFile_fullInfo = getFullFileInfo(thisFile_name, 'others')
                                                others_arr.push(thisFile_fullInfo);
                                            }
                                            chatHistory_filled[i].files.others = others_arr;
                                        }
                                        else{
                                            chatHistory_filled[i].files = {
                                                audios: [],
                                                videos: [],
                                                imgs: [],
                                                others: [],
                                            };
                                        }
                                    }
                                    resolve()
                                    })
                                    .then(() => {
                                        let groupInfo = {
                                            groupName: thisGroup_info.name,
                                            avatar: thisGroup_info.avatar_path,
                                            id: thisGroup_info.groupid,
                                            members: thisGroup_info.members.length
                                        }
                                        let response = {
                                            chatHistory: chatHistory_filled,
                                            groupInfo: groupInfo
                                        }
                                        fillChatHistory_info(res, response);
                                    })
                                })
                            }
                            else{
                                res.send('Something went wrong');
                                notification_send(user_sending_token, 'error', 'Something went wrong', 'You are not the member of this group', 'auto');
                            }
                        }
                    })
                } catch (error) {
                    console.error('Connection to MongoDB Atlas failed!', error);
                    //process.exit();
                }
            }
            else{
                res.send({status: false});
                notification_send(user_sending_token, 'error', 'Something went wrong', 'You are not the member of this group', 'auto');
            }
            break;
        }
    }
    
}

function generateUniqueFileName(ext, type){
    let thisFileName = generate_token(32);
    let fullFileName = thisFileName+'.'+ext;
    let fullFilePath = `/public/chat_files/${type}/${fullFileName}`;
    return new Promise((resolve, reject) => {
        fs.stat(fullFilePath, (err, stats) => {
            if(err){
                resolve(fullFileName)
            }
            else{
                generateUniqueFileName(ext, type)
            }
        })
    })
}

async function saveFile(extname, thisFilePath, thisFile_type) {
    return new Promise((resolve, reject) => {
        generateUniqueFileName(extname, 'imgs')
            .then((thisFile_newName) => {
                console.log('результат генерации названия: ', thisFile_newName);
                fs.rename(thisFilePath, (__dirname + (`/public/chat_files/${thisFile_type}/` + thisFile_newName)), function (err) { if (err) { console.log(err); } });
                resolve(thisFile_newName);
            })
    })
}

async function sortFiles(files){
    return new Promise((resolve, reject) => {
        let thisMesssage_files = {
            'audios': [],
            'videos': [],
            'imgs': [],
            'others': [],
        }
        for (let i = 0; i < files.length; i++) {
            let extname = files[i].originalFilename.split('.').pop();
            let thisFile_type;
            let thisFilePath = files[i].path;
            if (images_extnames.includes(extname)) {
                thisFile_type = 'imgs';
            }
            else if (audio_extnames.includes(extname)) {
                thisFile_type = 'audios';
            }
            else if (video_extnames.includes(extname)) {
                thisFile_type = 'videos';
            }
            else if (prehibited_extnames.includes(extname)) {
                notification_send(user_sending_token, 'error', 'Prohibited files', 'One or more files are defined as not allowed to be sent they will not be sent', 'auto');
            }
            else {
                thisFile_type = 'others';
            }
            saveFile(extname, thisFilePath, thisFile_type)
            .then((thisFile_newName) => {
                console.log('thisFile_newName: ',thisFile_newName);
                switch (thisFile_type){
                    case 'imgs':{
                        thisMesssage_files.imgs.push(thisFile_newName)
                        break;
                    }
                    case 'audios':{
                        thisMesssage_files.audios.push(thisFile_newName)
                        break;
                    }
                    case 'videos':{
                        thisMesssage_files.videos.push(thisFile_newName)
                        break;
                    }
                    case 'others':{
                        thisMesssage_files.others.push(thisFile_newName)
                        break;
                    }
                }  
                resolve(thisMesssage_files);
            })
        }
    })
}

async function saveMessage(thisChat_collectionName, thisChat_collectionName_reversed, thisMessage, user_sending_info, user_sending_token, user_toSend_token, user_toSend_info, context){
    await mongoRequest('chats', thisChat_collectionName, 'put', 'one', thisMessage);
    if(thisChat_collectionName_reversed !== null){
        await mongoRequest('chats', thisChat_collectionName_reversed, 'put', 'one', thisMessage);
    }
    thisMessage['avatar'] = user_sending_info.avatar_path.slice(39);
    thisMessage['fullname'] = user_sending_info.fullname;
    send_socket_chatMessage(user_sending_token, thisMessage);
    for(let i = 0; i < user_toSend_token.length; i++){
        console.log('Сообщение отправлено по websocket');
        if(user_toSend_token[i] != false){
            send_socket_chatMessage(user_toSend_token[i], thisMessage);
            if(context !== null){
                notification_send(user_toSend_token[i], 'alert', `${user_sending_info.fullname}`, `Sent a public message at ${context.name}`, 'auto');
            }
            else{
                notification_send(user_toSend_token[i], 'alert', `${user_sending_info.fullname}`, 'Sent you a private message', 'auto');
            }
        }
        else{
            writeOfflineNotification(user_toSend_info, null, 'alert', `${user_sending_info.fullname}`, `Sent a public message at ${context.name}`, 'auto');
        }
    }
}

async function writeMessage(res, thisMessage_obj, token, context){
    let user_sending_token = token;
    let user_sending_id = await mongoRequest('logged', 'tokens', 'get', 'one', {token: token});
    user_sending_id = user_sending_id.id;
    let user_sending_info = await mongoRequest('users', 'users', 'get', 'one', {id: user_sending_id});

    switch(context){
        case 'user':{
            let user_toSend_id = parseInt(thisMessage_obj.id);
            if(user_sending_info.chats == undefined){
                await mongoRequest('users', 'users', 'update', 'one', {condition: {id: user_sending_id}, toUpdate:{chats: []}});
                user_sending_info = await mongoRequest('users', 'users', 'get', 'one', {id: user_sending_id});
            }
            let user_toSend_info = await mongoRequest('users', 'users', 'get', 'one', {id: user_toSend_id});
            if(user_toSend_info.chats == undefined){
                await mongoRequest('users', 'users', 'update', 'one', {condition: {id: user_toSend_id}, toUpdate:{chats: []}});
                user_toSend_info = await mongoRequest('users', 'users', 'get', 'one', {id: user_toSend_id});
            }
            let user_toSend_onlineStatus = user_toSend_info.onlineStatus;
            let user_toSend_token;
        
            if(user_sending_info.chats.indexOf(user_toSend_id) == -1){
                let arr = user_sending_info.chats;
                arr.push(user_toSend_id);
                await mongoRequest('users', 'users', 'update', 'one', {condition: {id: user_sending_id}, toUpdate:{chats: arr}});
            }
            if(user_toSend_info.chats.indexOf(user_sending_id) == -1){
                let arr = user_toSend_info.chats;
                arr.push(user_sending_id);
                await mongoRequest('users', 'users', 'update', 'one', {condition: {id: user_toSend_id}, toUpdate:{chats: arr}});
            }
        
            if(user_toSend_onlineStatus == 'online'){
                let user_toSend_logged_info = await mongoRequest('logged', 'tokens', 'get', 'one', {id: user_toSend_id});
                user_toSend_token = user_toSend_logged_info.token;
            }
            else{
                user_toSend_token = false;
            }
            let message;
            if(thisMessage_obj.message != undefined){
                message = thisMessage_obj.message[0];
            }
            else{
                message = '';
            }
            let thisChat_collectionName = `${user_sending_id} - ${user_toSend_id}`;
            let thisChat_collectionName_reversed = `${user_toSend_id} - ${user_sending_id}`;
        
            let timestamp = Date.now();
        
            let thisMessage = {
                sender_id: user_sending_id,
                message: message,
                timestamp: timestamp
            };
            if(thisMessage_obj.files != false){
                let promise = new Promise((resolve, reject) => {
                    sortFiles(thisMessage_obj.files.files)
                    .then((response) => {
                        resolve(response)
                    })
                })
                .catch((err) => {
                    console.log(err);
                })
                promise.then((response) => {
                    console.log('отсортированные файлы: ', response);
                    thisMessage['files'] = response;
                    saveMessage(thisChat_collectionName, thisChat_collectionName_reversed, thisMessage, user_sending_info, user_sending_token, user_toSend_token, user_toSend_info, null)
                    res.sendStatus(200);
                })
            }
            else{
                thisMessage['files'] = null;
                saveMessage(thisChat_collectionName, thisChat_collectionName_reversed, thisMessage, user_sending_info, user_sending_token, user_toSend_token, user_toSend_info, null)
                res.sendStatus(200);
            }
            break;
        }
        case 'group':{
            let thisGroup_id = parseInt(thisMessage_obj.id);
            let thisGroup_info = await mongoRequest('groups', 'list', 'get', 'one', {groupid: thisGroup_id});
            let thisGroup_chatCollectionName = `group - ${thisGroup_id}`;
            let timestamp = Date.now();
            let message;
            let thisGroup_chatName = `g${thisGroup_id}`;
            if(!user_sending_info.chats.includes(thisGroup_chatName)){
                let thisUser_chats = user_sending_info.chats;
                thisUser_chats.push(thisGroup_chatName);
                await mongoRequest('users', 'users', 'update', 'one', {condition: {id: user_sending_id}, toUpdate:{chats: thisUser_chats}});
            }
            if(thisMessage_obj.message != undefined){
                message = thisMessage_obj.message[0];
            }
            else{
                message = '';
            }
            let thisMessage = {
                sender_id: user_sending_id,
                message: message,
                timestamp: timestamp
            };
            let user_toSend_tokens = [];
            let user_toSend_info = [];
            for(let i = 0; i < thisGroup_info.members.length; i++){
                let thisUser_id = thisGroup_info.members[i];
                if(thisUser_id == user_sending_id){
                    continue;
                }
                else{
                    let thisUser_info = await mongoRequest('users', 'users', 'get', 'one', { id: thisUser_id });
                    if (thisUser_info.onlineStatus == 'online') {
                        let user_toSend_logged_info = await mongoRequest('logged', 'tokens', 'get', 'one', { id: thisUser_id });
                        user_toSend_tokens.push(user_toSend_logged_info.token);
                        user_toSend_info.push(undefined);
                    }
                    else {
                        user_toSend_tokens.push(false);
                        user_toSend_info.push(thisUser_info);
                    }
                }
            }
            if(thisMessage_obj.files != false){
                let promise = new Promise((resolve, reject) => {
                    sortFiles(thisMessage_obj.files.files)
                    .then((response) => {
                        resolve(response)
                    })
                })
                .catch((err) => {
                    console.log(err);
                })
                promise.then((response) => {
                    console.log('отсортированные файлы: ', response);
                    thisMessage['files'] = response;
                    saveMessage(thisGroup_chatCollectionName, null, thisMessage, user_sending_info, user_sending_token, user_toSend_tokens, user_toSend_info, thisGroup_info)
                    res.sendStatus(200);
                })
            }
            else{
                thisMessage['files'] = null;
                saveMessage(thisGroup_chatCollectionName, null, thisMessage, user_sending_info, user_sending_token, user_toSend_tokens, user_toSend_info, thisGroup_info)
                res.sendStatus(200);
            }
            break;
        }
        default:{
            res.sendStatus(500);
            notification_send(user_sending_token, 'error', 'Message not sent', 'Something went wrong', 'auto');
        }
    }
}

async function sendFileToDownload(fileName, res){
    console.log(fileName);
    fileName = fileName.replace(/..\//gi, '');
    fileName = './public/chat_files/others/' + fileName;
    let thisFile_path = path.resolve(fileName);
    res.download(thisFile_path);
}

async function handleCodeInput(token, code, timezone_offset, res){
    let response = await findRegistrationCode(token);
    console.log(response)
    if(!response){
        res.clearCookie('token');
        let token = generate_token(32);
        res.cookie('token', token, { secure: true, httpOnly: true, signed: true }).redirect(303, '/register');
    }
    // if (response.response == undefined) {
    //     res.send({ status: false })
    // }
    else {
        let userinfo = response.userinfo;
        if(userinfo.timezone_offset == undefined){
            await mongoRequest('users', 'users', 'update', 'one', {condition: {id: userinfo.id}, toUpdate:{timezone_offset: timezone_offset}})
            .then(() => {
                if (code == response.response.code) {
                    res.send({ status: true })
                }
                else {
                    res.send({ status: false })
                }
            })
        }
        else{
            if(userinfo.timezone_offset == timezone_offset){
                if (code == response.response.code) {
                    res.send({ status: true })
                }
                else {
                    res.send({ status: false })
                }
            }
            else{
                await mongoRequest('users', 'users', 'update', 'one', {condition: {id: userinfo.id}, toUpdate:{timezone_offset: timezone_offset}})
                .then(() => {
                    if (code == response.response.code) {
                        res.send({ status: true })
                    }
                    else {
                        res.send({ status: false })
                    }
                })
            }
        }
    }
}

async function joinGroup(thisGroup_id, thisUser_token, res){
    thisGroup_id = parseInt(thisGroup_id);
    Promise.all([
        new Promise((resolve, reject) => {
            let thisGroup_info = mongoRequest('groups', 'list', 'get', 'one', {groupid: thisGroup_id});
            resolve(thisGroup_info);
        }),
        new Promise((resolve, reject) => {
            let thisUser_logged = mongoRequest('logged', 'tokens', 'get', 'one', {token: thisUser_token});
            resolve(thisUser_logged)
        }),
    ])
    .then((data)=>{
        let thisGroup_info = data[0];
        let thisUser_logged = data[1];
        let thisUser_id = thisUser_logged.id;
        if(thisGroup_info.members.includes(thisUser_id)){
            res.send({status: false});
            notification_send(thisUser_token, 'error', 'Something went wrong', 'You are already a member of this group', 'auto')
            return 0;
        }
        new Promise((resolve, reject) => {
            let thisUser_info = mongoRequest('users', 'users', 'get', 'one', {id: thisUser_id});
            resolve(thisUser_info)
        })
        .then((thisUser_info) => {
            let thisGroup_members = thisGroup_info.members;
            thisGroup_members.push(thisUser_id);
            let join_promises = [];
            join_promises.push(
                new Promise((resolve, reject) => {
                    mongoRequest('groups', 'list', 'update', 'one', {condition: {groupid: thisGroup_id}, toUpdate:{members: thisGroup_members}});
                    resolve();
                })
            )
            let thisUser_chats = thisUser_info.chats;
            if(!thisUser_chats.includes(thisGroup_id)){
                let thisGroup_chatName = `g${thisGroup_id}`;
                thisUser_chats.push(thisGroup_chatName);
                join_promises.push(
                    new Promise((resolve, reject) => {
                        mongoRequest('users', 'users', 'update', 'one', {condition: {id: thisUser_id}, toUpdate:{chats: thisUser_chats}});
                        resolve();
                    })
                )
            }
            if(!thisUser_info.groups.includes(thisGroup_id)){
                join_promises.push(new Promise((resolve, reject) => {
                    let thisUser_groups = thisUser_info.groups;
                    thisUser_groups.push(thisGroup_id);
                    mongoRequest('users', 'users', 'update', 'one', {condition: {id: thisUser_id}, toUpdate:{groups: thisUser_groups}});
                }))
            }
            Promise.all(join_promises)
            .then(()=>{
                res.send({status: true});
            })
        })
    })
}

async function leaveGroup(thisGroup_id, thisUser_token, res){
    thisGroup_id = parseInt(thisGroup_id);
    let groupInfo_promise = new Promise((resolve, reject) => {
        let thisGroup_info = mongoRequest('groups', 'list', 'get', 'one', {groupid: thisGroup_id})
        resolve(thisGroup_info);
    })
    let userLogged_promise = new Promise((resolve, reject) => {
        let thisUser_logged = mongoRequest('logged', 'tokens', 'get', 'one', {token: thisUser_token});
        resolve(thisUser_logged);
    })
    Promise.all([groupInfo_promise, userLogged_promise])
    .then((data) => {
        let thisGroup_info = data[0];
        let thisUser_logged = data[1];
        let thisUser_id = thisUser_logged.id;
        let thisGroup_members = thisGroup_info.members;

        if(!thisGroup_members.includes(thisUser_id)){
            res.send({status: false});
            console.log({
                thisGroup_members: thisGroup_members,
                thisUser_id: thisUser_id
            })
            return 0;
        }

        let userInfo_promise = new Promise((resolve, reject) => {
            let thisUser_info = mongoRequest('users', 'users', 'get', 'one', {id: thisUser_id});
            resolve(thisUser_info)
        })
        userInfo_promise.then((thisUser_info) => {
            let thisGroup_chatName = `g${thisGroup_id}`;
            let leaveGroup_promises = [];

            if(thisUser_info.chats.includes(thisGroup_chatName)){
                let thisUser_chats = thisUser_info.chats;
                let thisGroup_chat_index = thisUser_chats.indexOf(thisGroup_chatName);
                thisUser_chats.splice(thisGroup_chat_index, 1);
                leaveGroup_promises.push(new Promise((resolve, reject) => {
                    mongoRequest('users', 'users', 'update', 'one', {condition: {id: thisUser_id}, toUpdate:{chats: thisUser_chats}})
                    resolve();
                }))
            }
    
            if(thisGroup_members.includes(thisUser_id)){
                let thisUser_member_index = thisGroup_members.indexOf(thisUser_id);
                thisGroup_members.splice(thisUser_member_index, 1);
                leaveGroup_promises.push(new Promise((resolve, reject) => {
                    mongoRequest('groups', 'list', 'update', 'one', {condition: {groupid: thisGroup_id}, toUpdate:{members: thisGroup_members}});
                    resolve();
                }))
            }

            if(thisUser_info.groups.includes(thisGroup_id)){
                let thisUser_groups = thisUser_info.groups;
                let thisGroup_userGroups_index = thisUser_groups.indexOf(thisGroup_id);
                thisUser_groups.splice(thisGroup_userGroups_index, 1);
                leaveGroup_promises.push(new Promise((resolve, reject) => {
                    mongoRequest('users', 'users', 'update', 'one', {condition: {id: thisUser_id}, toUpdate:{groups: thisUser_groups}})
                    resolve();
                }))
            }

            Promise.all(leaveGroup_promises)
            .then(()=>{
                res.send({status: true});
            })
        })
    })
}

async function getLastMessage(id, scope, token, res){
    switch(scope){
        case 'groups':{
            let thisGroup_chatName = `group - ${id}`;

            let userId_promise = new Promise((resolve, reject) => {
                let user_logged = mongoRequest('logged', 'tokens', 'get', 'one', {token: token});
                resolve(user_logged);
            })
            let lastMessage_promise = new Promise((resolve, reject) => {
                //bookmark
                let promise_mongoConnect = new Promise((resolve, reject) => {
                    let mongoClient = new MongoClient('mongodb://localhost:27017');
                    mongoClient.connect();
                    const db = mongoClient.db('chats');
                    const thisChat = db.collection(thisGroup_chatName);
                    resolve(thisChat);
                })
                promise_mongoConnect.then((thisChat)=>{
                    let lastMessage = thisChat.find().sort({$natural: -1}).limit(1).toArray();
                    resolve(lastMessage);
                })
            })
            Promise.all([userId_promise, lastMessage_promise])
            .then((data) => {
                let thisUser_id = data[0].id;
                let lastMessage = data[1][0];
                let lastMessage_toReturn;
                if(lastMessage.message == ''){
                    let attachments_length = 
                        lastMessage.files.audios.length+
                        lastMessage.files.videos.length+
                        lastMessage.files.imgs.length+
                        lastMessage.files.others.length;
                    lastMessage_toReturn = `${attachments_length} attachments`;
                }
                else{
                    if(lastMessage.message.length > 60){
                        lastMessage_toReturn = lastMessage.message.slice(57) + '...'; 
                    }
                    else{
                        lastMessage_toReturn = lastMessage.message; 
                    }
                }
                if(lastMessage.sender_id == thisUser_id){
                    lastMessage_toReturn = 'You: ' + lastMessage_toReturn;
                }
                new Promise((resolve, reject) => {
                    let thisUser_info = mongoRequest('users', 'users', 'get', 'one', {id: thisUser_id});
                    resolve(thisUser_info)
                })
                .then((thisUser_info) => {
                    if(thisUser_info.timezone_offset != undefined){
                        let timezone_offset_hours = thisUser_info.timezone_offset/60;
                        let lastMessage_timestamp = lastMessage.timestamp;
                        let lastMessage_date = new Date(lastMessage_timestamp);
                        let lastMessage_date_toReturn;
                        let today = new Date();
                        if(today.getUTCDate() == lastMessage_date.getUTCDate()){
                            let lastMessage_hours = lastMessage_date.getUTCHours - timezone_offset_hours;
                            let lastMessage_minutes = lastMessage_date.getUTCMinutes();
                            lastMessage_date_toReturn = `${lastMessage_hours}:${lastMessage_minutes}`;
                        }
                        else{
                            let lastMessage_day = lastMessage_date.getUTCDate();
                            if(lastMessage_day < 9){lastMessage_day = '0'+lastMessage_day}

                            let lastMessage_month = lastMessage_date.getUTCMonth()+1;
                            if(lastMessage_month < 10){lastMessage_month = '0'+lastMessage_month}
                            
                            let lastMessage_year = lastMessage_date.getUTCFullYear();
                            lastMessage_date_toReturn = `${lastMessage_day}.${lastMessage_month}.${lastMessage_year}`;
                        }
                        res.send({lastMessage: lastMessage_toReturn, lastMessage_date: lastMessage_date_toReturn});
                    }
                    else{
                        let lastMessage_date_toReturn;

                        let lastMessage_timestamp = lastMessage.timestamp;
                        let lastMessage_date = new Date(lastMessage_timestamp);

                        let lastMessage_day = lastMessage_date.getUTCDates();
                        if(lastMessage_day < 9){lastMessage_day = '0'+lastMessage_day}

                        let lastMessage_month = lastMessage_date.getUTCMonth()+1;
                        if(lastMessage_month < 10){lastMessage_month = '0'+lastMessage_month}

                        let lastMessage_year = lastMessage_date.getUTCFullYear();

                        lastMessage_date_toReturn = `${lastMessage_day}.${lastMessage_month}.${lastMessage_year}`;
                        res.send({lastMessage: lastMessage_toReturn, lastMessage_date: lastMessage_date_toReturn});
                    }
                })
            })
            break;
        }
    }
}

async function createUserSettingsRecord(thisUser_id){
    let thisUser_settings = {
        id: thisUser_id,
        phone_visibility: 0,
        email_visibility: 0,
        show_direct_notifications: true,
        play_direct_sound: true,
        show_group_notifications: true,
        play_group_sound: true,
        show_comment_notification: true,
        play_comment_sound: true,
        notification_preview: 0,
        theme_main: '#FFF',
        theme_accent: '#398FE5'
    }
    return new Promise((resolve, reject) => {
            mongoRequest('users', 'settings', 'put', 'one', thisUser_settings);
            resolve(thisUser_settings);
        })   
}

async function getUserSettings(thisUser_id){
    return new Promise((resolve, reject) => {
        let thisUser_settings = mongoRequest('users', 'settings', 'get', 'one', {id: thisUser_id});
        resolve(thisUser_settings);
    })
}

async function handleSettingsRequest(token, res){
    let logged_promise = new Promise((resolve, reject) => {
        let thisUser_logged = mongoRequest('logged', 'tokens', 'get', 'one', {token: token});
        resolve(thisUser_logged);
    })
    logged_promise.then((thisUser_logged) => {
        let thisUser_id = thisUser_logged.id;
        getUserSettings(thisUser_id)
        .then((thisUser_settings_record) => {
            new Promise((resolve, reject) => {
                if(thisUser_settings_record == undefined){
                    createUserSettingsRecord(thisUser_id)
                    .then((thisUser_settings) => {
                        resolve(thisUser_settings);
                    })
                }
                else{
                    resolve(thisUser_settings_record)
                }
            })
            .then((thisUser_settings) => {
                delete thisUser_settings._id;
                delete thisUser_settings.id;
                delete thisUser_settings.email_visibility;
                delete thisUser_settings.phone_visibility;
                res.send(thisUser_settings);
            })
        })
    })
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
            let code = req.body.code;
            let timezone_offset = req.body.timezone_offset;
            handleCodeInput(token, code, timezone_offset, res)
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
            let setting = req.body;
            changeSettings(token, setting, res);
            break;
        }
        case 'search':{
            search(res, req.body, req.signedCookies.token);
            break;
        }
        case 'getFullInfo':{
            let type = req.body.type;
            let id = req.body.id;
            getFullInfo(type, parseInt(id), res, req.signedCookies.token);
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
            break;
        }
        case 'getGroupInfo':{
            let thisGroup_id = req.body.groupid;
            getGroupInfo(thisGroup_id, res)
            break;
        }
        case 'deleteCommunity': {
            let token = req.signedCookies.token;
            let groupid = req.body.id;
            deleteCommunity(res, token, groupid);
            break;
        }
        case 'editCommunity':{
            const form = new multiparty.Form();
            form.parse(req, function(err, fields, files){
                editCommunity(res, files, fields, req.signedCookies.token)
            })
            break;
        }
        case 'addToFriends':{
            let userAdd_id = req.body.id;
            addToFriends(userAdd_id, req.signedCookies.token, res);
            break;
        }
        case 'friendRequestResponse':{
            let answer = req.body.answer;
            let from = req.body.from;
            friendRequestResponse_handler(req.signedCookies.token, answer, from, res);
            break;
        }
        case 'removeFromFriends':{
            let user_sending_token = req.signedCookies.token;
            let user_toDelete_id = req.body.id
            removeFromFriends(user_sending_token, user_toDelete_id, res)
            break;
        }
        case 'getChatHistory':{
            let user_sending_token = req.signedCookies.token;
            let user_toSend_id = req.body.id;
            let action_context = req.body.context;
            getChatHistory(user_sending_token, user_toSend_id, action_context, res)
            break;
        }
        case 'writeMessage':{
            let context = req.query.context;
            console.log(context)
            const form = new multiparty.Form();
            form.parse(req, (err, fields, files) => {
                let message = fields.message;
                let token = req.signedCookies.token;
                if(message == '' && files.length == 0){
                    return 0;
                }
                else{
                    let id = fields.id;
                    if(id == undefined || id == ''){
                        notification_send(token, 'error', 'Sending message failed', 'Something went wrong', 'auto');
                    }
                    else {
                        let thisMessage_obj = {}
                        if ((message == undefined || message == '') && files.files == undefined) {
                            console.log('сообщение пустое');
                        }
                        else {
                            if (message == undefined || message == '') { message = false }
                            else { thisMessage_obj['message'] = message }

                            if (files.files == undefined) {
                                thisMessage_obj['files'] = false;
                                console.log('файлов нет');
                            }
                            else {
                                thisMessage_obj['files'] = files;
                                console.log('файлы есть');
                                console.log(files);
                            }

                            thisMessage_obj['id'] = id;
                            writeMessage(res, thisMessage_obj, token, context);
                        }
                    }
                }   
            })
            break;
        }
        case 'joinGroup':{
            let thisGroup_id = req.body.groupid;
            let thisUser_token = req.signedCookies.token;
            joinGroup(thisGroup_id, thisUser_token, res);
            break;
        }
        case 'leaveGroup':{
            let thisGroup_id = req.body.groupid;
            let thisUser_token = req.signedCookies.token;
            leaveGroup(thisGroup_id, thisUser_token, res);
            break;
        }
        case 'getLastMessage':{
            let id = req.body.id;
            let scope = req.body.scope;
            let token = req.signedCookies.token;
            getLastMessage(id, scope, token, res);
            break;
        }
        case 'getUserSettings':{
            let token = req.signedCookies.token;
            handleSettingsRequest(token, res)
            break;
        }
    }
})

app_start();