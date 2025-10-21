const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 3000;

// Настройка ejs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Маршрут вида /10/news/for/business
app.get('/:count/news/for/:category', async (req, res) => {
  const { count, category } = req.params;

  const validCategories = ['business', 'economic', 'finances', 'politics', 'auto'];
  if (!validCategories.includes(category)) {
    return res.status(400).send('Некорректная категория.');
  }

  const n = parseInt(count, 10);
  if (isNaN(n) || n <= 0) {
    return res.status(400).send('Количество новостей должно быть положительным числом.');
  }

  try {
    const rssUrl = `https://www.vedomosti.ru/rss/rubric/${category}`;
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`;
    const { data } = await axios.get(apiUrl);

    const news = data.items.slice(0, n);
    res.render('news', {
      category,
      count: n,
      news
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Ошибка при получении данных.');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
