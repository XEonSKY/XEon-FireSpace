const http = require('http');
const url = require('url');
const querystring = require('querystring');

// 模拟用户数据和会话存储
let userAccount = {
    username: 'admin',
    password: 'admin123'
};
let session = {};

// 生成随机 CSRF Token
function generateCsrfToken() {
    return Math.random().toString(36).substring(2, 15);
}

// 创建 HTTP 服务器
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url);
    const path = parsedUrl.pathname;

    // 登录页面（展示表单）
    if (path === '/login' && req.method === 'GET') {
        const csrfToken = generateCsrfToken();
        // 将 CSRF Token 存储到会话中
        session.csrfToken = csrfToken;

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
      <h1>Login</h1>
      <form method="POST" action="/loginAPI">
        <input type="hidden" name="csrfToken" value="${csrfToken}">
        <label for="username">Username:</label>
        <input type="text" id="username" name="username" required><br/>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password" required><br/>
        <button type="submit">Login</button>
      </form>
    `);
    }

    // 登录处理（验证用户名、密码和 CSRF Token）
    else if (path === '/loginAPI' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            const params = querystring.parse(body);

            // 验证 CSRF Token
            if (params.csrfToken !== session.csrfToken) {
                res.writeHead(403, { 'Content-Type': 'text/plain' });
                return res.end('Invalid CSRF token');
            }

            // 验证用户名和密码
            if (params.username === userAccount.username && params.password === userAccount.password) {
                session.isLoggedIn = true;
                res.writeHead(302, { 'Location': '/' });
                res.end();
            } else {
                res.writeHead(401, { 'Content-Type': 'text/plain' });
                res.end('Invalid username or password');
            }
        });
    }

    // 主页面
    else if (path === '/' && req.method === 'GET') {
        if (!session.isLoggedIn) {
            res.writeHead(302, { 'Location': '/login' });
            return res.end();
        }

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
      <h1>Welcome, ${userAccount.username}!</h1>
      <p>You are logged in successfully.</p>
    `);
    }

    // 404 页面
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
    }
});

// 启动服务器
server.listen(3000, () => {
    console.log('Server is running at http://localhost:3000');
});