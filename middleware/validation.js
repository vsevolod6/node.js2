// middleware/validation.js
const validateNewsRequest = (req, res, next) => {
    const { count, category } = req.params;
    
    // Проверка числа
    const newsCount = parseInt(count);
    if (isNaN(newsCount) || newsCount <= 0 || newsCount > 50) {
        return res.status(400).json({
            error: 'Количество новостей должно быть положительным числом не более 50'
        });
    }

    // Проверка категории
    const validCategories = ['business', 'economic', 'finances', 'politics', 'auto'];
    if (!validCategories.includes(category)) {
        return res.status(400).json({
            error: 'Недопустимая категория',
            validCategories: validCategories
        });
    }

    next();
};

module.exports = { validateNewsRequest };
