const router = require('koa-router')()
const { user } = require('../config/config')
const sql = require('../mysql')
router.get('/', async(ctx, next) => {
    await ctx.render('index', {
        title: '智能充电桩API站点'
    })
})
router.get('/order', async(ctx, next) => {
    const res = await sql.query('SELECT * from orders ORDER BY id DESC')
    ctx.body = res
})
router.post('/change',async(ctx,next)=>{
    //UPDATE runoob_tbl SET runoob_title='学习 C++' WHERE runoob_id=3;
    param = ctx.request.body
    id = param.id
    await sql.query('UPDATE orders SET is_payed=1 WHERE id = ' + id)
})
router.post('/order', async(ctx, next) => {
    param = ctx.request.body
    method = param.method
    var timestamp = Date.parse(new Date()) / 1000;
    if (method == "start") {
        user_id = param.user_id;
        device_id = param.device_id;
        area_id = param.area_id;
        time_start = param.start //传入开始时间戳
        during = param.during
        //计算during和price
        time_end = time_start + during * 1800//前端传入参数为1，2，3，4
        price = during * 0.01 // 每半小时1分钱，price先留在这，做扩充功能预备
        if (user_id == null || device_id == null || device_id == null || time_start==null || during==null) {
            ctx.body = {
                status: false,
                message: 'please set user_id and device_id and my_id'
            }
        } else {
            //拼接字符串本质上是不安全的，但是暂时项目不考虑安全问题，故采用拼接方式
            const res = await sql.query("INSERT INTO `orders` (`user_id`, `device_id`, `area_id`, `time_start`,`time_end`,`now_time`,`price`) VALUES ('" + user_id + "', '" + device_id + "', '" + area_id + "', '" + time_start + "', '" + time_end + "', '" + timestamp  + "', '" + price + "')")
            //插入mysql数据库，同时记录数据
            ctx.body = {
                status: true,
                user_id: user_id,
                device_id: device_id,
                area_id: area_id,
                timestamp: timestamp,
                message: 'success to insert mysql'
            }
        }
    } else if (method == "end") {
        my_id = param.my_id
        if (my_id == null) {
            ctx.body = {
                stauts: false,
                message: 'please input my id to find what are you want to end at the database'
            }
        } else {
            const res = await sql.query("UPDATE `orders` SET `time_end`= '" + timestamp + "' WHERE my_id=" + my_id)
            ctx.body = {
                status: true,
                message: 'request is already submit,but it success depend input my_id which you input justnow'
            }
        }
    } else {
        ctx.body = {
            status: false,
            message: 'please set method get or post'
        }
    }
    date = new Date()
        //time = `${date.getFullYear()}-${date.getMonth()<9?'0'+(date.getMonth()+1):date.getMonth()+1}-${date.getDate()<10?'0'+date.getDate():date.getDate()} ${date.getHours()<10?'0'+date.getHours():date.getHours()}:${date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes()}:${date.getSeconds()<10?'0'+date.getSeconds():date.getSeconds()}`
})
router.get('/find', async(ctx, next) => {
    const res = await sql.query('SELECT * from areas')
    ctx.body = res
})
router.post('/question', async(ctx, next) => {
    param = ctx.request.body
    content = param.content
    submit_time = Date.parse(new Date()) / 1000; //当前时间戳，精确到秒
    user_name = param.user_name;
    user_id = param.user_id;
    phone = param.phone;
    if (content == null || user_name == null || user_id == null || phone == null) {
        ctx.body = {
            stauts: false,
            message: '参数不全'
        }
    } else {
        const res = await sql.query("INSERT INTO `questions` (`content`, `submit_time`, `user_name`, `user_id`,`phone`) VALUES ('" + content + "', '" + submit_time + "', '" + user_name + "', '" + user_id + "', '" + phone + "')")
        ctx.body = {
            stauts: true,
            message: '已成功提交'
        }
    }

})
router.get('/question', async(ctx, next) => {
    const res = await sql.query('SELECT * from questions')
    ctx.body = {
        res
    }
})
router.get('/json', async(ctx, next) => {

    ctx.body = {
        title: 'koa2 json'
    }
})
router.post('/beidou',async(ctx,next)=>{
    param = ctx.request.body
    id = param.id
    lng = param.lng
    lat = param.lat
    await sql.query('UPDATE areas SET lat='+lat+' WHERE area_id = ' + id)
    await sql.query('UPDATE areas SET lng='+lng+' WHERE area_id = ' + id)
    ctx.body = {
        msg:'success'
    }
})
router.post('/arrive',async(ctx,next)=>{
    let param = ctx.request.body
    let id = param.id
    let now = Date.parse(new Date())/1000
    let random = Math.random() * 65+Math.random()*5
    await sql.query('UPDATE orders SET arrive=1 WHERE id = ' + id)
    await sql.query('UPDATE orders SET arrive_time='+now+' WHERE id = ' + id)
    await sql.query('UPDATE orders SET better='+random+' WHERE id = ' + id)
})
router.get('/nearly',async(ctx,next)=>{
    nowtime = Date.parse(new Date()) / 1000
    const res = await sql.query('SELECT * from orders ORDER BY time_start DESC')
    
    let result=0,end,during,device_id
    for(let x of res){
        if(nowtime - Number(x.time_end)<120){
            result = x.time_start
            end = x.time_end
            during = x.time_end - x.time_start
            device_id = x.device_id
            break
        }
    }
    if(result!=0){
        ctx.body = {
        result:result,
        during:during,
        end:end,
        device_id:device_id
        }
    }
    else{
        ctx.body = {
            result:0
        }
    }
})
module.exports = router