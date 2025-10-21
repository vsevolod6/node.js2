const express = require('express');
const axios = require('axios');
const path = require('path');
const { validateNewsRequest } = require('./middleware/validation');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Применяем middleware валидации
app.get('/:count/news/for/:category', validateNewsRequest, async (req, res) => {
    try {
        const { count, category } = req.params;
        const newsCount = parseInt(count);

        const rssUrl = `https://www.vedomosti.ru/rss/rubric/${category}`;
        const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;

        console.log(`Запрос новостей: ${newsCount} из категории ${category}`);

        const response = await axios.get(apiUrl, {
            timeout: 10000 // 10 секунд таймаут
        });
        
        if (response.data.status !== 'ok') {
            throw new Error('Ошибка RSS2JSON: ' + (response.data.message || 'Неизвестная ошибка'));
        }

        const limitedNews = response.data.items.slice(0, newsCount);

        const categoryNames = {
            business: 'Бизнес',
            economic: 'Экономика', 
            finances: 'Финансы',
            politics: 'Политика',
            auto: 'Автомобили'
        };

        res.render('news', {
            newsCount: newsCount,
            category: categoryNames[category],
            news: limitedNews
        });

    } catch (error) {
        console.error('Ошибка:', error.message);
        
        if (error.code === 'ECONNABORTED') {
            res.status(504).send('Таймаут при запросе к сервису новостей');
        } else if (error.response) {
            res.status(502).send('Ошибка внешнего сервиса');
        } else {
            res.status(500).send('Внутренняя ошибка сервера');
        }
    }
});

app.get('/', (req, res) => {
    res.send(`
        <h1>Сервис новостей Ведомостей</h1>
        <p>Использование: http://localhost:3000/ЧИСЛО/news/for/КАТЕГОРИЯ</p>
        <p>Примеры:</p>
        <ul>
            <li><a href="/3/news/for/business">3 новости о бизнесе</a></li>
            <li><a href="/5/news/for/politics">5 новостей о политике</a></li>
            <li><a href="/7/news/for/auto">7 новостей об автомобилях</a></li>
        </ul>
    `);
});

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
});
