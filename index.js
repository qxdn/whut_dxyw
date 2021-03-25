let request = require('request');
let cheerio = require('cheerio');
//用户名
let name = "username";
//密码
let pwd = "password";
//请求时间 ms 默认两分钟
let freq = 1000 * 60 ** 2;

let loginUrl = "http://59.69.102.9/zgyw/index.aspx";
let learnUrl = "http://59.69.102.9/zgyw/study/LearningContent.aspx?type=2&id=11&learningid=2618";
let user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36";
var cookie = "";

//登录
async function login() {
    return new Promise(function (resolve, reject) {
        request(loginUrl, (error, response, body) => {
            //藏的够深的
            $ = cheerio.load(body);
            state = $("#__VIEWSTATE").val();
            cookie = response.headers['set-cookie'];  //这里是登陆后得到的cookie,(重点)
            //登录数据
            let datas = {
                ctl00$ContentPlaceHolder1$name: name,
                ctl00$ContentPlaceHolder1$pwd: pwd,
                ctl00$ContentPlaceHolder1$login: "登录",
                __VIEWSTATE: state
            };
            var opts = {
                url: loginUrl,
                method: 'POST',
                headers: {
                    "User-Agent": user_agent,
                    "Cookie": cookie
                },
                form: datas,
            };

            request(opts, (error, response, body) => {
                //console.log(body)
                //console.log(response.statusCode)
                //302重定向了
                if (error) {
                    reject(error);
                } else {
                    resolve(response.statusCode)
                }
            })
        })
    })
}

//学习页面
async function learn() {
    return new Promise(function (resolve, reject) {
        var opts = {
            url: learnUrl,
            method: 'GET',
            headers: {
                "User-Agent": user_agent,
                "Cookie": cookie
            }
        };
        request(opts, (error, response, body) => {
            if (error) {
                reject(error)
            } else {
                resolve(response.statusCode)
            }
        })

    })
}


//测试时常和有没有掉线
async function checkTime() {
    return new Promise(function (resolve, reject) {
        opts = {
            url: loginUrl,
            method: 'POST',
            headers: {
                "User-Agent": user_agent,
                "Cookie": cookie
            }
        };
        request(opts, (error, response, body) => {
            if (body.indexOf("ctl00_ContentPlaceHolder1_lblonlineTime") > 0) {
                $ = cheerio.load(body);
                name = $("#ctl00_ContentPlaceHolder1_lblrealname").text();
                time = $("#ctl00_ContentPlaceHolder1_lblonlineTime").text();
                console.log(new Date() + ",姓名:" + name + ",学习时间:" + time);
                resolve(response.statusCode)
            } else {
                login();
                console.log("重新登录");
                reject(error)
            }
            
        })
    })

}

async function sleep_ms(ms) {
    return new Promise(function(resolve, reject) {
        setTimeout(resolve, ms);
    })
}


async function study() {
    await login();
    while(true){
        await learn();
        await checkTime();
        await sleep_ms(freq);
    }
}

study()