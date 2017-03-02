"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let en = {
    numbers: {
        isNan: 'Invalid number value (nan).',
        notANumber: 'Invalid number value.'
    },
    schema: {
        required: '\'{0}\' is required.',
        minNumber: '\'{0}\' must be at least {1}',
        maxNumber: '\'{0}\' cannot exceed {1}',
        minNumberExclusive: '\'{0}\' must be greater than {1}',
        maxNumberExclusive: '\'{0}\' must be less than {1}',
        uniqueColumn: 'The column \'{0}\' must be unique.',
        uniqueColumns: 'Duplicate value for columns \'{0}\' found.',
        passwordMismatch: 'Password mismatch.',
        invalidEmail: 'Invalid Email Address',
        minLength: '\'{0}\' must be at least \'{1}\' characters'
    }
}, fr = {
    numbers: {
        isNan: 'Pas un nombre (nan).',
        notANumber: 'Pas un nombre.'
    },
    schema: {
        required: '\'{0}\' est obligatoire.',
        minNumber: '\'{0}\' doit être supérieur(e) ou égal(e) à {1}',
        maxNumber: '\'{0}\' doit être inférieur(e) ou égal(e) à {1}',
        minNumberExclusive: '\'{0}\' doit être supérieur(e) à {1}',
        maxNumberExclusive: '\'{0}\' doit être inférieur(e) à {1}',
        uniqueColumn: 'La colonne \'{0}\' doit être unique.',
        uniqueColumns: 'La combinaison de colonnes \'{0}\' doit être unique.',
        passwordMismatch: 'Les deux mots de passe sont différents.',
        invalidEmail: 'Adresse e-mail incorrecte',
        minLength: '\'{0}\' doit comporter au moins \'{1}\' caractères'
    }
};
let locales = {
    en: en,
    fr: fr
};
function messages(lang) {
    return locales[lang] || locales.en;
}
exports.messages = messages;
