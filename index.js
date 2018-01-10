//导入模块
var fs = require('fs');
var http = require('http');
var path = require('path');

var url = require('url');
var querystring = require('querystring');

var template = require('art-template');

//创建服务器
var server = http.createServer();

//
server.on('request', function (req, res) {

    //解析url
    var urlObj = url.parse(req.url, true);
    //获取请求路径和请求方法
    var urlPath = urlObj.pathname;
    var method = req.method;

    if (urlPath == '/' && method == 'GET') {
        // -------------------渲染页面

        //读取文件,获取数据
        fs.readFile(path.join(__dirname, 'hero.json'), 'utf-8', function (err, jsonData) {
            if (err) {
                throw err;
            }
            // console.log(jsonData);
            //转成json格式
            var jsonObj = JSON.parse(jsonData);
            //模板引擎渲染
            var html = template(path.join(__dirname, '/views/heroList.html'), jsonObj);
            res.end(html)
        })


    }else if (urlPath == '/heroAdd' && method == 'GET') {
        //读取heroAdd.htm文件
        fs.readFile(path.join(__dirname, '/views/heroAdd.html'), function (err, data) {
            if (err) {
                throw err;
            }
            // console.log('成功');
            res.end(data);
        })
    }else if (urlPath == '/heroAdd' && method == 'POST') {
        //使用post请求的方法
        var postData = '';
        req.on('data', function (chunck) {
            postData += chunck;
        })
        req.on('end', function () {
            var postObj = querystring.parse(postData);
        
            //读取hero.json文件
            fs.readFile(path.join(__dirname, 'hero.json'), 'utf-8', function (err, jsonData) {
                if (err) {
                    res.end(JSON.stringify({
                        err_code : 500,
                        err_message : err.message
                    }));
                }
                var jsonObj = JSON.parse(jsonData);
                //将新创建的对象添加到原来json对象中
                postObj.id = jsonObj.heros.length + 1;
                //console.log(postObj);
                jsonObj.heros.push(postObj)

                //写入文件
                
                //转换成字符串
                var jsonStr = JSON.stringify(jsonObj);
                fs.writeFile(path.join(__dirname, 'hero.json'), jsonStr, function (err) {
                    if (err) {
                       res.end(JSON.stringify({
                           err_code: 500,
                           err_message: err.message
                       }))
                    }
                    console.log('写入成功');
                    //响应请求
                    res.end(JSON.stringify({
                        err_code: 0,
                        err_message: null
                    }))
                })
            })
        })
    }else if (urlPath == '/heroInfo' && method == 'GET') {
        //--读取json文件找到数据
        
        //get方法找到id
        var heroId = urlObj.query.id;
        // console.log(heroId);

        //读取文件
        fs.readFile(path.join(__dirname, 'hero.json'), 'utf-8', function (err, jsonData) {
            if (err) {
                throw err;
            }
            var jsonObj = JSON.parse(jsonData);

            //根据id找数据
            var hero = {};
            jsonObj.heros.some(function (item) {
                if (item.id == heroId) {
                    hero = item;
                    return;
                }
            })
            // console.log(hero);
            //模板引擎渲染到heroInfo.html页面上
            var html = template(path.join(__dirname, 'views/heroInfo.html'), hero);
            res.end(html);
        })

    }else if (urlPath == '/heroList' && method == 'GET') {

    }else if (urlPath.indexOf('/node_modules') == 0){
        fs.readFile(path.join(__dirname, urlPath), function (err, data) {
            if (err) {
                throw err;
            }
            res.end(data)
        })
    }else {
        res.end('404')
    }
})

//服务器监听
server.listen(3000, function () {
    console.log('开启成功');
})