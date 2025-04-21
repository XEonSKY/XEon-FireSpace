const express = require('express');
const { createCanvas, loadImage } = require('canvas');
const path = require('path');

const app = express();
const PORT = 3000;

// 配置静态文件夹（可选）
app.use(express.static(path.join(__dirname)));

app.use(express.json());

// 生成随机字母验证码
function generateCaptchaText(length = 4) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// 生成验证码图片
function generateCaptchaImage(text) {
    const width = 150;
    const height = 50;

    // 创建画布
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 绘制背景
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, width, height);

    // 添加干扰线
    for (let i = 0; i < 4; i++) {
        ctx.strokeStyle = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.stroke();
    }

    // 绘制验证码文字
    ctx.font = '30px Arial';
    ctx.fillStyle = '#333';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    text.split('').forEach((char, index) => {
        ctx.save();
        ctx.translate(30 + index * 25, height / 2);
        ctx.rotate((Math.random() - 0.5) * 0.5); // 随机旋转
        ctx.fillText(char, 0, 0);
        ctx.restore();
    });

    // 返回图片数据
    return canvas.toBuffer();
}

const list = {};

// 验证码接口
app.get('/captcha', (req, res) => {
    const captchaText = generateCaptchaText(); // 生成随机验证码
    console.log('Generated Captcha:', captchaText); // 打印验证码到控制台
    list[captchaText] = true; // 将验证码存储在列表中
    // 设置响应头
    res.set({
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
    });

    // 返回验证码图片
    res.send(generateCaptchaImage(captchaText));
});
// 验证码接口
app.post('/login_api', (req, res) => {
    const captchaText = req.body.captcha; // 获取请求中的验证码
    const username = req.body.username; // 获取请求中的用户名
    const password = req.body.password; // 获取请求中的密码
    console.log(req.body);
    
    if (captchaText && list[captchaText]) {
        delete list[captchaText]; // 删除验证码
        if (username === 'admin' && password === '123456') {
            res.json({ code: 200, msg: '登录成功' });
        } else {
            res.json({ code: 400, msg: '用户名或密码错误' });
        }
    } else {
        res.json({ code: 400, msg: '验证码错误' });
    }
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html')); // 返回HTML文件
})

// 启动服务器
app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});