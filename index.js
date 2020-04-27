let request = require('request');
let cheerio = require('cheerio');
let schedule = require('node-schedule');
//用户名
let name = "username";
//密码
let pwd = "password";


let loginUrl = "http://59.69.102.9/zgyw/index.aspx";
let learnUrl = "http://59.69.102.9/zgyw/study/LearningContent.aspx?type=2&id=11&learningid=2618";
let user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/59.0.3071.115 Safari/537.36";
var cookie = "";

//登录
function login() {
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
        })
    })
}

//学习页面
function learn() {
    var opts = {
        url: learnUrl,
        method: 'GET',
        headers: {
            "User-Agent": user_agent,
            "Cookie": cookie
        }
    };
    request(opts, (error, response, body) => {
        
    })


}


//测试时常和有没有掉线
function checkTime() {
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
        } else {
            login();
            console.log("重新登录");
        }
    })
}



login();


// 定义规则
let rule = new schedule.RecurrenceRule();
rule.minute = [0, 10, 20, 30, 40, 50]; // 每隔 10 分钟执行一次

// 启动任务
let job = schedule.scheduleJob(rule, () => {
    checkTime();
});

let rule2 = new schedule.RecurrenceRule();
rule2.second = [0,30]; // 每隔 30s执行一次请求
let job2 = schedule.scheduleJob(rule2, ()=>{
    learn();
});