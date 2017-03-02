let fr_FR = {
    number: {
        decimalSep: ',',
        thousandSep: ' ',
        decimal: 2,
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
}, en_US = {
    number: {
        decimalSep: '.',
        thousandSep: ' ',
        decimal: 2,
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
let supportedLocale = {
    en_US: en_US,
    fr_FR: fr_FR
};
