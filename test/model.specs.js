"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const index_1 = require("../index");
let schemaOrder = {
    "name": "Facture",
    "type": "object",
    "title": "Facture",
    "primaryKey": "code",
    "properties": {
        "code": {
            "type": "string",
            "format": "code",
            "title": "N° Facture"
        },
        "lib": {
            "title": "Libellé",
            "type": "string"
        },
        "dateFact": {
            "type": "string",
            "title": "Date facture",
            "format": "date"
        },
        "fournisseur": {
            "title": "Fournisseur",
            "type": "string",
            "format": "code"
        },
        "mntTotalHT": {
            "title": "Total HT",
            "type": "number",
            "format": "money",
            "description": "xxxx"
        },
        "mntTotalTTC": {
            "title": "Total TTC",
            "type": "number",
            "format": "money"
        },
        "mntTotalTVA": {
            "title": "Total TVA",
            "type": "number",
            "format": "money"
        },
        "info": {
            "type": "object",
            "properties": {
                "comment": {
                    "type": "string"
                }
            }
        },
        "lines": {
            "type": "array",
            "items": {
                "type": "object",
                "name": "FactureLigne",
                "title": "Ligne de Facture",
                "primaryKey": [
                    "codeFact",
                    "codeItem"
                ],
                "properties": {
                    "codeFact": {
                        "type": "string",
                        "format": "code"
                    },
                    "codeItem": {
                        "title": "Item",
                        "type": "string",
                        "format": "code"
                    },
                    "description": {
                        "title": "Libellé",
                        "type": "string"
                    },
                    "qte": {
                        "title": "Quantité",
                        "type": "integer"
                    },
                    "prixUnit": {
                        "title": "Prix Unitaire",
                        "type": "number",
                        "format": "money"
                    },
                    "mntHT": {
                        "title": "HT",
                        "type": "number",
                        "format": "money"
                    },
                    "mntTTC": {
                        "title": "TTC",
                        "type": "number",
                        "format": "money"
                    },
                    "mntTVA": {
                        "title": "TVA",
                        "type": "number",
                        "format": "money"
                    },
                    "tauxTVA": {
                        "title": "Taux Tva",
                        "type": "number",
                        "format": "rate",
                        "default": 20
                    }
                },
                "states": {
                    "mntTVA": {
                        "isReadOnly": true
                    }
                },
                "links": {
                    "remove": {}
                },
                "indexes": [
                    {
                        "fields": "codeItem"
                    }
                ]
            }
        }
    },
    "states": {
        "mntTotalTTC": {
            "isReadOnly": true
        },
        "mntTotalHT": {
            "isReadOnly": true
        },
        "mntTotalTVA": {
            "isReadOnly": true
        }
    },
    "links": {
        "addFactureLigne": {
            "title": "Ajouter une ligne"
        }
    }
};
describe('Proxy create', () => {
    it('Create from schema', function () {
        let order = new index_1.ObjectModel(null, '', schemaOrder, { $create: true });
        //add 2 lines 
        assert.equal(order.lines.length, 0, 'The order has 2 lines');
        assert.notEqual(order.info, null, 'Info is initialized');
        assert.notEqual(order.info, undefined, 'Info is initialized');
        assert.equal(order.$states.info, undefined, 'Info hasn\'t state');
        assert.notEqual(order.lines, null, 'Lines are initialized');
        assert.notEqual(order.lines, undefined, 'Lines are initialized');
        assert.notEqual(order.$states.lines, undefined, 'Lines have states');
        assert.notEqual(order.$states.lines, null, 'Lines have states');
    });
    it('Test initialisation from schema', function () {
        let order = new index_1.ObjectModel(null, '', schemaOrder, { $create: true, lines: [{ codeItem: 'A' }, { codeItem: 'B' }] });
        let lf = order.lines.get(0);
        assert.equal(lf.tauxTVA, 20, 'Default taux tva is 20');
        assert.equal(lf.mntTVA, 0, 'Default Mnt tva is 0');
    });
    it('Test states', function () {
        let order = new index_1.ObjectModel(null, '', schemaOrder, { $create: true, lines: [{ codeItem: 'A' }, { codeItem: 'B' }] });
        let lf = order.lines.get(0);
        lf.tauxTVA = 20.333;
        assert.equal(lf.tauxTVA, 20.33, 'Decimals round');
        lf.$states.tauxTVA.decimals = 3;
        lf.tauxTVA = 20.333;
        assert.equal(lf.tauxTVA, 20.333, 'Decimals round after decimals changed');
    });
    it('Test errors Base', function () {
        let order = new index_1.ObjectModel(null, '', schemaOrder, { $create: true, lines: [{ codeItem: 'A' }, { codeItem: 'B' }] });
        let lf = order.lines.get(0);
        lf.$errors.tauxTVA.addError('Test Error');
        assert.equal(lf.$errors.tauxTVA.hasErrors(), true, 'Has error');
        order.clearErrors();
        assert.equal(lf.$errors.tauxTVA.hasErrors(), false, 'No errors');
        lf.$errors.tauxTVA.addError('Test Error');
        assert.equal(lf.$errors.tauxTVA.hasErrors(), true, 'Has error (2)');
        lf.$errors.tauxTVA.rmvError('Test Error');
        assert.equal(lf.$errors.tauxTVA.hasErrors(), false, 'No errors (2)');
        lf.tauxTVA = 101;
        assert.equal(lf.$errors.tauxTVA.hasErrors(), true, 'TauxTva is greater than 100');
        lf.tauxTVA = 99;
        assert.equal(lf.$errors.tauxTVA.hasErrors(), false, 'TauxTva is less than 100');
    });
    it('Test errors composition one-to-one', function () {
        let order = new index_1.ObjectModel(null, '', schemaOrder, { $create: true, lines: [{ codeItem: 'A' }, { codeItem: 'B' }] });
        assert.equal(order.$errors.info, undefined, 'Info hasn\'t errors');
        let info = order.info;
        assert.equal(info.$errors.$, undefined, 'Info hasn\'t glb errors');
        assert.notEqual(order.$errors.$, undefined, 'Order has glb errors');
        info.addError('Test');
        assert.equal(order.$errors.$.hasErrors(), true, 'Root has errors');
        info.rmvError('Test');
        assert.equal(order.$errors.$.hasErrors(), false, 'Root has not errors');
    });
    it('Test errors composition  one-to-many', function () {
        let order = new index_1.ObjectModel(null, '', schemaOrder, { $create: true, lines: [{ codeItem: 'A' }, { codeItem: 'B' }] });
        let oi = order.lines.get(0);
        assert.notEqual(oi.$errors.$, null, 'Order item has glb errors');
        assert.notEqual(oi.$errors.$, undefined, 'Order item has glb errors');
        assert.notEqual(order.$errors.lines, undefined, 'Lines have errors');
        assert.notEqual(order.$errors.lines, undefined, 'Lines have errors');
        assert.equal(order.$errors.lines.hasErrors(), false, 'No errors for lines');
        oi = order.lines.push({ codeItem: 'A' });
        assert.equal(order.$errors.lines.hasErrors(), true, 'Primary key violation');
        order.lines = [{ codeItem: 'A' }, { codeItem: 'B' }];
        assert.equal(order.$errors.lines.hasErrors(), false, 'No errors for lines');
        oi = order.lines.push({ codeItem: 'A' });
        assert.equal(order.$errors.lines.hasErrors(), true, '(1) Primary key violation');
        assert.equal(order.validate(), false, 'Order in error');
        assert.equal(order.$errors.lines.hasErrors(), true, '(2) Primary key violation');
        oi = order.lines.get(0);
        order.lines.remove(oi);
        assert.equal(order.$errors.lines.hasErrors(), false, 'No errors for lines');
        assert.equal(order.validate(), true, 'No errors ');
    });
});
