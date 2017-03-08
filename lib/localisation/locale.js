"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fr_FR = {
    number: {
        decimalSep: ',',
        thousandSep: ' ',
        decimalPlaces: 2,
        symbol: '€',
        format: '%v %s'
    },
    date: {
        weekdaysShort: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
        weekdaysMin: ['Di', 'Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa'],
        weekdays: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
        monthsShort: ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'],
        months: ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'],
        dateShort: 'd mmmm, yyyy',
        dateLong: 'd mmmm, yyyy',
        monthYear: 'mmmm yyyy',
        daySep: '/',
        weekStart: 1
    }
};
const en_US = {
    number: {
        decimalSep: '.',
        thousandSep: ' ',
        decimalPlaces: 2,
        symbol: '$',
        format: '%s %v'
    },
    date: {
        weekdaysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        weekdaysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        weekdays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        dateShort: 'mm/dd/yyyy',
        dateLong: 'd mmmm, yyyy',
        monthYear: 'mmmm yyyy',
        daySep: '-',
        weekStart: 0
    }
};
var _checkPrecision = (value, defValue) => {
    value = Math.round(Math.abs(value));
    return isNaN(value) ? defValue : value;
}, _toFixed = (value, precision) => {
    precision = _checkPrecision(precision, 2);
    var power = Math.pow(10, precision);
    return (Math.round(value * power) / power).toFixed(precision);
}, _formatNumber = (number, precision, thousandSep, decimalSep) => {
    if (number === null)
        return '';
    var usePrecision = _checkPrecision(precision, 0), negative = number < 0 ? '-' : '', base = parseInt(_toFixed(Math.abs(number || 0), usePrecision), 10) + '', mod = base.length > 3 ? base.length % 3 : 0;
    return negative + (mod ? base.substr(0, mod) + thousandSep : '') + base.substr(mod).replace(/(\d{3})(?=\d)/g, '$1' + thousandSep) +
        (usePrecision ? decimalSep + _toFixed(Math.abs(number), usePrecision).split('.')[1] : '');
}, _formatMoney = (number, precision, thousandSep, decimalSep, symbol, format) => {
    if (number === null)
        return '';
    format = format || '%v %s';
    return format.replace('%s', symbol).replace('%v', _formatNumber(number, precision, thousandSep, decimalSep));
}, _money = (value, useSymbol) => {
    value = value || 0;
    if (useSymbol)
        return _formatMoney(value, exports.currentLocale.number.places, exports.currentLocale.number.thousandSep, exports.currentLocale.number.decimalSep, exports.currentLocale.number.symbol, exports.currentLocale.number.format);
    else
        return _formatNumber(value, exports.currentLocale.number.places, exports.currentLocale.number.thousandSep, exports.currentLocale.number.decimalSep);
}, _decimal = (value, decimals, symbol) => {
    if (value === null)
        return '';
    value = value || 0;
    var format = symbol ? '%v %s' : '%v';
    return _formatMoney(value, decimals, exports.currentLocale.number.thousandSep, exports.currentLocale.number.decimalSep, symbol, format);
}, _parseDateTimeISO8601 = (value) => {
    if (value instanceof Date)
        return value;
    if (!value)
        return null;
    var d = Date.parse(value);
    if (isNaN(d))
        return null;
    return new Date(d);
}, _pad = (val, len) => {
    let sval = val + '';
    while (sval.length < len)
        sval = '0' + val;
    return sval;
}, _date2ISO = (value) => {
    let yy = value.getFullYear(), mm = value.getMonth() + 1, dd = value.getDate();
    return _pad(yy, 4) + '-' + _pad(mm, 2) + '-' + _pad(dd, 2);
};
exports.supportedLocale = {
    en_US: en_US,
    fr_FR: fr_FR
};
exports.currentLocale = exports.supportedLocale.en_US;
exports.currentLang = 'en';
exports.formatMoney = _money;
exports.formatDecimal = _decimal;
exports.parseISODateTime = _parseDateTimeISO8601;
exports.date2ISO = _date2ISO;
