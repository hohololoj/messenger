import fs from 'fs';
import path from 'path';
const __dirname = path.resolve();

function route(req){
    switch(req){
        case '/':{
            return {
                'object': 'page',
                'path': path.resolve('./public/start.html')
            }
        } 
        case '/start':{
            return {
                'object': 'page',
                'path': path.resolve('./public/start.html')
            }
        }
        case '/start-invite':{
            return {
                'object': 'page',
                'path': path.resolve('./public/start-invite.html')
            }
        }
        
        case '/app':{
            return {
                'object': 'render',
                'render': 'app.hbs'
            }
        }
        case '/register':{
            return {
                'object': 'page',
                'path': path.resolve('./public/register.html')
            }
        }
        case '/onboarding-phone':{
            return {
                'object': 'page',
                'path': path.resolve('./public/onboarding-phone.html')
            }
        }
        case '/onboarding-email':{
            return {
                'object': 'page',
                'path': path.resolve('./public/onboarding-email.html')
            }
        }
        case '/invite':{
            return {
                'object': 'invite',
                path: 'start-invite.hbs'
            }
        }

        default:{
            return{
                'object': 'page',
                'path': path.resolve('./public/app-error.html')
            }
        }
    }
}
export {route};