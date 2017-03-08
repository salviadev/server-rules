"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _copyArray = function (src, recursive) {
    let res = new Array(src.length);
    src.forEach(function (item, index) {
        if (recursive && Array.isArray(item)) {
            res[index] = _copyArray(item, true);
        }
        else if (recursive && typeof item === 'object') {
            res[index] = _copyObject(null, item, true);
        }
        else
            res[index] = item;
    });
    return res;
}, _copyObject = function (dst, src, recursive) {
    let res = dst || {};
    Object.keys(src).forEach(function (pn) {
        let item = src[pn];
        if (recursive && item && Array.isArray(item)) {
            res[pn] = _copyArray(item, true);
        }
        else if (recursive && item && typeof item === 'object') {
            res[pn] = _copyObject(null, item, true);
        }
        else
            res[pn] = item;
    });
    return res;
}, _extend = function (dst, src, recursive) {
    if (!src)
        return dst;
    if (Array.isArray(src)) {
        return _copyArray(src, recursive);
    }
    else if (typeof src === 'object') {
        return _copyObject(dst, src, recursive);
    }
    else
        return dst;
}, _formatByPosition = function (...args) {
    let arg0 = args[0] + '';
    return arg0.replace(/{(\d+)}/g, function (match, num) {
        num = parseInt(num, 10);
        return args[num + 1];
    });
}, _formatByName = function (value, params) {
    return value.replace(/{(.*)}/g, function (match, val) {
        return params[val] || '';
    });
}, _p8 = function (addSeparator) {
    var p = (Math.random().toString(16) + '000000000').substr(2, 8);
    return addSeparator ? '-' + p.substr(0, 4) + '-' + p.substr(4, 4) : p;
}, _genUuid = function () {
    return _p8(false) + _p8(true) + _p8(true) + _p8(false);
}, _createID = function () {
    return 'H' + _p8(false) + _p8(false) + _p8(false) + _p8(false);
}, _eq = function (o1, o2) {
    if (o1 !== o2) {
        if (Array.isArray(o1)) {
            if (!Array.isArray(o2))
                return false;
            return _arrayEquals(o1, o2);
        }
        else if (typeof o1 === 'object') {
            if (typeof o2 !== 'object')
                return false;
            return _objectsEquals(o1, o2);
        }
        else
            return false;
    }
    return true;
}, _objectsEquals = function (ia1, ia2) {
    let la1 = Object.keys(ia1), la2 = Object.keys(ia2);
    if (la1.length !== la2.length)
        return false;
    for (let i = 0, len = la1.length; i < len; i++) {
        let p = la1[i];
        if (la2[i] !== p)
            return false;
        if (!_eq(ia1[p], ia1[p]))
            return false;
    }
    return true;
}, _arrayEquals = function (a1, a2) {
    if (a1.length !== a2.length)
        return false;
    for (let i = 0, len = a1.length; i < len; i++) {
        if (!_eq(a1[i], a2[i]))
            return false;
    }
    return true;
}, _equals = function (o1, o2) {
    if (o1 === o2)
        return true;
    if (!o1 || !o2)
        return false;
    return _eq(o1, o2);
}, _showAndLogRules = false, _logRule = (spaces, rule, trigger) => {
    if (_showAndLogRules) {
        spaces = (spaces || 1) - 1;
        let sSpaces = new Array(spaces).join('  ');
        if (typeof rule === 'string')
            console.log(_formatByPosition('{0}{1}".', sSpaces, rule));
        else
            console.log(_formatByPosition('{0}Rule: "{1} - {2}", triggered by "{3}".', sSpaces, rule.name, rule.description, trigger));
    }
}, _showRules = (value) => {
    if (value !== undefined) {
        _showAndLogRules = value;
    }
    return _showAndLogRules;
};
exports.extend = _extend;
exports.uuid = _genUuid;
exports.allocId = _createID;
exports.equals = _equals;
exports.formatByPosition = _formatByPosition;
exports.formatByName = _formatByName;
exports.logRule = _logRule;
exports.showRules = _showRules;
