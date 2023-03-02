// const browserIcon_element = document.getElementsByClassName('browser-icon')[0];
// const browserName_element = document.getElementsByClassName('browser-name')[0];
// const browserLocation_element = document.getElementsByClassName('browser-location')[0];

// function get_browser() {
//     var ua = navigator.userAgent, tem, M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
//     if (/trident/i.test(M[1])) {
//         tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
//         return { name: 'IE', version: (tem[1] || '') };
//     }
//     if (M[1] === 'Chrome') {
//         tem = ua.match(/\bOPR|Edge\/(\d+)/)
//         if (tem != null) { return { name: 'Opera', version: tem[1] }; }
//     }
//     M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
//     if ((tem = ua.match(/version\/(\d+)/i)) != null) { M.splice(1, 1, tem[1]); }
//     return {
//         name: M[0],
//         version: M[1]
//     };
// }

// const userDeviceArray = [
//     { device: 'Android', platform: /Android/ },
//     { device: 'iPhone', platform: /iPhone/ },
//     { device: 'iPad', platform: /iPad/ },
//     { device: 'Symbian', platform: /Symbian/ },
//     { device: 'Windows Phone', platform: /Windows Phone/ },
//     { device: 'Tablet OS', platform: /Tablet OS/ },
//     { device: 'Linux', platform: /Linux/ },
//     { device: 'Windows', platform: /Windows NT/ },
//     { device: 'Macintosh', platform: /Macintosh/ }
// ];

// const platform = navigator.userAgent;

// function getPlatform() {
//     for (let i in userDeviceArray) {
//         if (userDeviceArray[i].platform.test(platform)) {
//             return userDeviceArray[i].device;
//         }
//     }
//     return 'Неизвестная платформа!' + platform;
// }


// if (get_browser().name == 'Chrome') {
//     browserIcon_element.src = './icons/browsers/icon-chrome.svg';
// }
// if (get_browser().name == 'Firefox') {
//     browserIcon_element.src = './icons/browsers/icon-firefox.svg';
// }
// if (get_browser().name == 'Opera') {
//     browserIcon_element.src = './icons/browsers/icon-opera.svg';
// }
// if (get_browser().name == 'Safari') {
//     browserIcon_element.src = './icons/browsers/icon-safari.svg';
// }

// browserName_element.innerHTML = `${get_browser().name}, ${getPlatform()}`;

// let url;

// function getIP(){
//     fetch('https://ipapi.co/json/')
//     .then(response => response.json())
//     .then(function(response){
//         url = `http://api.ipstack.com/${response.ip}?access_key=066c39dda298afd3f7e994f4e9d58eba`;
//         fetch(url)
//         .then(function (response) {
//             response.json().then(function (data) {
//                 console.log(data);
//                 let browserLocation = `Online · ${data.city}, ${data.country_code}`;
//                 browserLocation_element.innerHTML = browserLocation;
//             });
//         })
//     });
// }

// getIP()