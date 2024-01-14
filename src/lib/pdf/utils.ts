export const cm = (n: number) => parseFloat(((n * 72) / 2.54).toFixed(2));

export const dateToString = (date: Date) => {
    const moths = [
        'января',
        'февраля',
        'марта',
        'апреля',
        'мая',
        'июня',
        'июля',
        'августа',
        'сентября',
        'октября',
        'ноября',
        'декабря',
    ];

    return `«${date.getDate()}» ${moths[date.getMonth()]} ${date.getFullYear()} года`;
};

export const formatCurrency = (value: number) => {
    const formatter = new Intl.NumberFormat('ru-RU', {
        minimumIntegerDigits: 2,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    return formatter.format(value) + ' руб.';
};
