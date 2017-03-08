"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../core/utils");
const locale_1 = require("../localisation/locale");
var _createContext = (inst) => {
    return {
        today: locale_1.date2ISO(new Date()),
        now() { return new Date().toISOString(); },
        addHours(dateTime, hours) {
            let cd = locale_1.parseISODateTime(dateTime);
            if (cd === null)
                return undefined;
            cd.setTime(cd.getTime() + (hours * 60 * 60 * 1000));
            return cd.toISOString();
        },
        isTriggeredBy(propertyName) {
            return false;
        },
        sum(list, propertyName) {
            let res = 0;
            list && list.forEach((item, index) => {
                res += item[propertyName];
            });
            return res;
        },
        safeDivide(dividend, divisor, def) {
            let td = parseFloat(divisor.toFixed(8));
            if (td === 0)
                return def;
            return dividend / divisor;
        },
        partition(total, list, dst, src) {
            let value = -1;
            let mindex = -1;
            let rest = total;
            let tsrc = 0;
            list.forEach((item, index) => {
                let cv = item[src];
                if (Math.abs(cv) > value) {
                    value = Math.abs(cv);
                    mindex = index;
                }
                tsrc = tsrc + cv;
            });
            tsrc = parseFloat(tsrc.toFixed(8));
            if (tsrc !== 0 && mindex >= 0) {
                list.forEach((item, index) => {
                    item[dst] = total * item[src] / tsrc;
                    rest = rest - item[dst];
                });
                rest = parseFloat(rest.toFixed(8));
                if (rest !== 0) {
                    let mItem = list.get(mindex);
                    mItem[dst] = mItem[dst] + rest;
                }
            }
        },
        utc(value) {
            if (!value)
                return 0;
            let d = locale_1.parseISODateTime(value);
            return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds(), d.getUTCMilliseconds());
        },
        milliseconds2Hours(milliseconds) {
            return milliseconds / (1000 * 3600);
        },
        date(value) {
            return locale_1.parseISODateTime(value);
        }
    };
}, _parseExpression = (expression, options) => {
    options = options || {};
    if (options.isPropagation) {
        expression = expression.replace(/sum\(\s*([^)]+?)\s*\)/g, function (match, args) {
            let sumArgs = args.split(/\s*,\s*/);
            if (sumArgs && sumArgs.length === 1) {
                let faa = sumArgs[0].split('.');
                let la = faa.pop();
                return 'sum(' + faa.join('.') + ', \'' + la + '\')';
            }
            else
                return match;
        });
    }
    return expression;
}, _patchRuleError = (exception, rule, root) => {
    if (typeof exception === 'string')
        exception = { message: exception };
    let head = utils_1.formatByPosition('Rule \'{0}\'  {1}:', rule.name, rule.description || '');
    root.addError([head, exception.message || ''].join('\n'));
}, _execPropagationRule = (rule, inst, ctx, trigger) => {
    let root = inst.getRoot();
    try {
        if (!rule.code) {
            rule.code = new Function('o', 'ctx', 'window', _parseExpression(rule.expression, { isPropagation: true }));
            rule.conditionCode = rule.condition ? new Function('o', 'ctx', 'window', 'return ' + _parseExpression(rule.condition, { isPropagation: false })) : null;
        }
        let canRun = true;
        if (rule.conditionCode)
            canRun = rule.conditionCode(inst, ctx, null);
        if (canRun) {
            utils_1.logRule(root.stack ? root.stack.length : 0, rule, trigger);
            rule.code(inst, ctx, null);
        }
    }
    catch (e) {
        _patchRuleError(e, rule, root);
    }
}, _execInitRules = (inst) => {
    let className = inst.$schema.name;
    if (!className)
        return;
    let root = inst.getRoot();
    let rootSchema = root.$schema;
    let rules, trigger;
    if (inst.$create) {
        rules = rootSchema.rules && rootSchema.rules.created ? rootSchema.rules.created[className] : null;
        trigger = '$events.created';
    }
    else {
        rules = rootSchema.rules && rootSchema.rules.loaded ? rootSchema.rules.loaded[className] : null;
        trigger = '$events.loaded';
    }
    if (rules) {
        let ctx = _createContext(root);
        rules.forEach(rule => _execPropagationRule(rootSchema.rulesMap[rule], inst, ctx, trigger));
    }
}, _execBeforeSaveRules = (inst) => {
    let className = inst.$schema.name;
    if (!className)
        return;
    let root = inst.getRoot();
    let rootSchema = root.$schema;
    let rules = rootSchema.rules && rootSchema.rules.saving ? rootSchema.rules.saving[className] : null;
    if (rules) {
        let ctx = _createContext(root);
        rules.forEach(rule => _execPropagationRule(rootSchema.rulesMap[rule], inst, ctx, '$events.saving'));
    }
}, _execValidationRules = (inst) => {
    let className = inst.$schema.name;
    if (!className)
        return;
    let root = inst.getRoot();
    let rootSchema = root.$schema;
    if (!rootSchema.rules || !rootSchema.rules.validation || !rootSchema.rules.validation[className])
        return false;
    let props = Object.keys(rootSchema.rules.validation[className]);
    let ctx = _createContext(inst);
    let hasErrors = false;
    props.forEach(function (propName) {
        let lrules = rootSchema.rules.validation[className][propName];
        lrules && lrules.forEach((ruleId) => {
            let rule = rootSchema.rulesMap[ruleId];
            try {
                if (!rule.code) {
                    rule.code = new Function('o', 'ctx', 'window', 'return ' + _parseExpression(rule.expression, { isPropagation: false }));
                    rule.conditionCode = rule.condition ? new Function('o', 'ctx', 'window', 'return ' + _parseExpression(rule.condition, { isPropagation: false })) : null;
                }
                let addToRoot = rule.triggers.length > 1;
                let canRun = true;
                if (rule.conditionCode)
                    canRun = rule.conditionCode(inst, ctx, null);
                if (canRun) {
                    utils_1.logRule(root.stack ? root.stack.length : 0, rule, propName);
                }
                if (!canRun || rule.code(inst, ctx, null)) {
                    if (addToRoot || !inst.$errors[propName])
                        root.rmvError(rule.errorMsg);
                    else
                        inst.$errors[propName].rmvError(rule.errorMsg);
                }
                else {
                    hasErrors = true;
                    if (addToRoot || !inst.$errors[propName])
                        root.addError(rule.errorMsg);
                    else
                        inst.$errors[propName].addError(rule.errorMsg);
                }
            }
            catch (e) {
                _patchRuleError(e, rule, root);
            }
        });
    });
    return hasErrors;
}, _execRules = (operation, propertyName, root, params) => {
    let rootSchema = root.$schema;
    if (rootSchema.rules && (rootSchema.rules.validation || rootSchema.rules.propagation)) {
        let propertyName = params.source;
        let segments = propertyName.split('.');
        let sp = segments.pop();
        if (sp.charAt(0) === '$')
            return;
        let cp = [sp];
        let inst = params.instance;
        let ctx = _createContext(root);
        let pp = null;
        while (inst) {
            if (!inst.isArray) {
            }
            else {
                let trigger = cp.join('.');
                if (!pp)
                    pp = inst;
                //Propagation rules
                let rules = (rootSchema.rules.propagation && inst.$schema.name) ? rootSchema.rules.propagation[inst.$schema.name] : null;
                let lrules = rules ? rules[trigger] : null;
                lrules && lrules.forEach(rule => {
                    _execPropagationRule(rootSchema.rulesMap[rule], inst, ctx, trigger);
                });
                //Validation rules
                rules = (rootSchema.rules.validation && inst.$schema.name) ? rootSchema.rules.validation[inst.$schema.name] : null;
                lrules = rules ? rules[trigger] : null;
                lrules && lrules.forEach((ruleId) => {
                    let rule = rootSchema.rulesMap[ruleId];
                    try {
                        if (!rule.code) {
                            rule.code = new Function('o', 'ctx', 'window', 'return ' + _parseExpression(rule.expression, { isPropagation: false }));
                            rule.conditionCode = rule.condition ? new Function('o', 'ctx', 'window', 'return ' + _parseExpression(rule.condition, { isPropagation: false })) : null;
                        }
                        let addToRoot = rule.triggers.length > 1;
                        let canRun = true;
                        if (rule.conditionCode)
                            canRun = rule.conditionCode(inst, ctx, null);
                        if (canRun)
                            utils_1.logRule(root.stack ? root.stack.length : 0, rule, trigger);
                        if (!canRun || rule.code(inst, ctx, null)) {
                            if (addToRoot)
                                root.rmvError(rule.errorMsg);
                            else
                                pp.$errors[sp].rmvError(rule.errorMsg);
                        }
                        else {
                            if (addToRoot)
                                root.addError(rule.errorMsg);
                            else
                                pp.$errors[sp].addError(rule.errorMsg);
                        }
                    }
                    catch (e) {
                        _patchRuleError(e, rule, root);
                    }
                });
            }
            sp = segments.pop();
            if (sp && sp.charAt(0) !== '$')
                cp.unshift(sp);
            inst = inst.owner;
        }
    }
};
exports.execInitRules = _execInitRules;
exports.execBeforeSaveRules = _execBeforeSaveRules;
exports.execValidationRules = _execValidationRules;
exports.execRules = _execRules;
