const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
    console.log('Запрос:', req.url);
    
    // Разрешаем доступ с любых устройств
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Отдаём HTML страницу
    if (req.url === '/' || req.url === '/index.html') {
        fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
            if (err) {
                res.writeHead(500);
                res.end('Ошибка загрузки страницы');
                return;
            }
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.end(data);
        });
        return;
    }
    
    // API для сообщений
    if (req.url === '/api/messages' && req.method === 'GET') {
        fs.readFile(path.join(__dirname, 'messages.json'), (err, data) => {
            if (err) {
                res.end('[]');
                return;
            }
            res.end(data);
        });
        return;
    }
    
    // Отправка сообщения
    if (req.url === '/api/messages' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', () => {
            try {
                const newMsg = JSON.parse(body);
                
                let messages = [];
                try {
                    messages = JSON.parse(fs.readFileSync(path.join(__dirname, 'messages.json')));
                } catch(e) {}
                
                messages.push({
                    id: Date.now(),
                    name: newMsg.name || 'Аноним',
                    text: newMsg.text || '',
                    time: new Date().toLocaleString()
                });
                
                fs.writeFileSync(path.join(__dirname, 'messages.json'), JSON.stringify(messages, null, 2));
                
                // Логируем
                const log = `[${new Date().toLocaleString()}] ${newMsg.name}: ${newMsg.text}\n`;
                fs.appendFileSync(path.join(__dirname, 'chat.log'), log);
                
                res.end('OK');
            } catch(e) {
                console.log('Ошибка:', e);
                res.statusCode = 500;
                res.end('Ошибка');
            }
        });
        return;
    }
    
    res.statusCode = 404;
    res.end('404 - Страница не найдена');
});

server.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ Чат запущен на порту ${PORT}`);
    console.log(`📱 Открой в браузере: http://localhost:${PORT}`);
});
