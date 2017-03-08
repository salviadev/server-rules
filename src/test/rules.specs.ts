
import * as mochaUtils from 'mocha';
import * as assert from 'assert';

import { ObjectModel } from '../index';


let schemaOrder = {
    "name": "Order",
    "type": "object",
    "title": "Order",
    "primaryKey": "code",
    "properties": {
        "code": {
            "type": "string",
            "format": "code",
            "title": "Order Number"
        },
        "lib": {
            "title": "Title",
            "type": "string"
        },
        "saving": {
            "type": "boolean"
        },
        "dateFact": {
            "type": "string",
            "title": "Order date",
            "format": "date"
        },
        "fournisseur": {
            "title": "Customer",
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
                "name": "OrderItem",
                "title": "Order Item",
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
                    "remove": {

                    }
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
        "addOrderLigne": {
            "title": "Add a line"
        }
    },
    "loadRules": true,
    "rules": [
        {
            "name": "TRV_001",
            "description": "date facture passée",
            "expression": "o.dateFact <= ctx.today",
            "errorMsg": "La date de facture doit être antérieure à la date du jour",
            "triggers": "dateFact",
            "ruleType": "validation",
            "entities": [
                {
                    "entity": "Order",
                    "ruleCode": "TRV_001"
                }
            ],
            "clientSide": true,
            "serverSide": true,
            "owner": "Toto",
            "realm": "tenant"
        },
        {
            "name": "RP_001",
            "description": "date facture initialisée à la date du jour",
            "expression": "o.dateFact = ctx.today",
            "triggers": "$events.created",
            "ruleType": "propagation",
            "entities": [
                {
                    "entity": "Order",
                    "ruleCode": "RP_001"
                }
            ],
            "clientSide": true,
            "serverSide": false
        },
        {
            "name": "RP_001-Loaded",
            "description": "Date facture is readOnly",
            "expression": "o.$states.dateFact.isReadOnly = true;",
            "triggers": "$events.loaded",
            "ruleType": "propagation",
            "entities": [
                {
                    "entity": "Order",
                    "ruleCode": "RP_001"
                }
            ],
            "clientSide": true,
            "serverSide": false
        },
        {
            "name": "RP_002",
            "description": "déduire montant TVA",
            "expression": "o.mntTotalTVA = o.mntTotalTTC - o.mntTotalHT",
            "triggers": "mntTotalTTC, mntTotalHT",
            "ruleType": "propagation",
            "entities": [
                {
                    "entity": "Order",
                    "ruleCode": "RP_002"
                }
            ],
            "clientSide": true,
            "serverSide": true
        },
        {
            "name": "RP_003",
            "description": "déduire montant total",
            "expression": "o.mntTotalTTC = ctx.sum(o.lines, 'mntTTC'); o.mntTotalHT = ctx.sum(o.lines.mntHT)",
            "triggers": "lines, lines.mntTTC, lines.mntHT",
            "ruleType": "propagation",
            "entities": [
                {
                    "entity": "Order",
                    "ruleCode": "RP_003"
                }
            ],
            "clientSide": true,
            "serverSide": false
        },
        {
            "name": "RP_004",
            "description": "déduire montant HT",
            "expression": "o.mntHT = o.qte * o.prixUnit",
            "triggers": "qte, prixUnit",
            "ruleType": "propagation",
            "entities": [
                {
                    "entity": "OrderItem",
                    "ruleCode": "RP_004"
                }
            ],
            "clientSide": true,
            "serverSide": false
        },
        {
            "name": "RP_005",
            "description": "déduire montant TTC",
            "expression": "o.mntTTC = o.mntHT + o.mntHT * o.tauxTVA/100",
            "triggers": "mntHT, tauxTVA",
            "ruleType": "propagation",
            "entities": [
                {
                    "entity": "OrderItem",
                    "ruleCode": "RP_005"
                }
            ],
            "clientSide": true,
            "serverSide": false
        },
        {
            "name": "RP_006",
            "description": "déduire montant TVA",
            "expression": "o.mntTVA = o.mntTTC - o.mntHT",
            "triggers": "mntHT, mntTTC",
            "ruleType": "propagation",
            "entities": [
                {
                    "entity": "OrderItem",
                    "ruleCode": "RP_006"
                }
            ],
            "clientSide": true,
            "serverSide": true
        },
        {
            "name": "RV_007",
            "description": "quantité obligatoire",
            "expression": "o.qte > 0",
            "triggers": "qte",
            "ruleType": "validation",
            "errorMsg": "La quantité est obligatoire",
            "entities": [
                {
                    "entity": "OrderItem",
                    "ruleCode": "RV_007"
                }
            ],
            "clientSide": true,
            "serverSide": true
        },
        {
            "name": "RV_008",
            "description": "TTC = HT + TVA",
            "expression": "TTC === HT + TVA",
            "triggers": "TTC, HT, TVA",
            "ruleType": "validation",
            "errorMsg": "incohérence TTC = HT + TVA",
            "entities": [
                {
                    "entity": "OrderItem",
                    "ruleCode": "RV_008"
                }
            ],
            "clientSide": true,
            "serverSide": true
        },
        {
            "name": "RP_009",
            "description": "VAT is readOnly",
            "expression": "o.$states.tauxTVA.isReadOnly = true;",
            "triggers": "$events.loaded",
            "ruleType": "propagation",
            "entities": [
                {
                    "entity": "OrderItem",
                    "ruleCode": "RP_009"
                }
            ],
            "clientSide": true,
            "serverSide": false
        },
        {
            "name": "RP_010",
            "description": "VAT is mandatory",
            "expression": "o.$states.tauxTVA.isMandatory = true;",
            "triggers": "$events.created",
            "ruleType": "propagation",
            "entities": [
                {
                    "entity": "OrderItem",
                    "ruleCode": "RP_010"
                }
            ],
            "clientSide": true,
            "serverSide": false
        },
        {
            "name": "RP_011",
            "description": "Before save",
            "expression": "o.saving = true;",
            "triggers": "$events.saving",
            "ruleType": "propagation",
            "entities": [
                {
                    "entity": "Order",
                    "ruleCode": "RP_011"
                }
            ],
            "clientSide": true,
            "serverSide": false
        },
        
    ]
};



describe('Rules', () => {
    it('Load Rules', function () {
        let order: any = new ObjectModel(null, '', schemaOrder, { $create: true, lines: [{ codeItem: 'A' }, { codeItem: 'B' }] });
        assert.notEqual(order.$schema.rules, undefined, 'Rules (1)');
        assert.notEqual(order.$schema.rules, undefined, 'Rules (2)');
        assert.notEqual(order.$schema.rulesMap, undefined, 'Rules (3)');
        assert.notEqual(order.$schema.rules.created, undefined, 'Rules (4)');
        assert.notEqual(order.$schema.rules.propagation, undefined, 'Rules (5)');
        assert.notEqual(order.$schema.rules.validation, undefined, 'Rules (6)');
        assert.notEqual(order.$schema.rules.created.Order, undefined, 'Rules (7)');
        assert.notEqual(order.$schema.rules.propagation.Order, undefined, 'Rules (8)');
        assert.notEqual(order.$schema.rules.validation.Order, undefined, 'Rules (9)');
        assert.notEqual(order.$schema.rules.propagation.OrderItem, undefined, 'Rules (10)');
        assert.notEqual(order.$schema.rules.validation.OrderItem, undefined, 'Rules (11)');

    });
    it('Create rule', function () {
        let order: any = new ObjectModel(null, '', schemaOrder, { $create: true, lines: [{ codeItem: 'A' }, { codeItem: 'B' }] });
        let today = (new Date()).toISOString().substr(0, 10);
        assert.equal(order.dateFact, today, 'Rules : Date facture initialisée à la date du jour');
        let oi = order.lines.get(0);
        assert.equal(oi.$states.tauxTVA.isMandatory, true, 'VAT rate is mandatory (1)');
        order = new ObjectModel(null, '', schemaOrder, { dateFact: '2001-01-01', lines: [{ codeItem: 'A' }, { codeItem: 'B' }] });
        assert.notEqual(order.dateFact, today, 'Rules : Date facture initialisée à la date du jour - not called');
        oi = order.lines.get(0);
        assert.notEqual(oi.$states.tauxTVA.isMandatory, true, 'VAT rate is mandatory (2)');
        oi = order.lines.push({ codeItem: 'C' });
        assert.equal(oi.$states.tauxTVA.isMandatory, true, 'VAT rate is mandatory (3)');
    });
    it('Load rule', function () {
        let order: any = new ObjectModel(null, '', schemaOrder, { lines: [{ codeItem: 'A', tauxTVA: 20 }, { codeItem: 'B', tauxTVA: 21 }] });
        assert.equal(order.$states.dateFact.isReadOnly, true, 'Order date is readOnly');
        let oi = order.lines.get(0);
        assert.equal(oi.$states.tauxTVA.isReadOnly, true, 'VAT rate is readOnly');
        assert.notEqual(oi.$states.tauxTVA.isMandatory, true, 'VAT rate is not mandatory');
        oi = order.lines.push({ codeItem: 'C' });
        assert.equal(oi.$states.tauxTVA.isMandatory, true, 'VAT rate is mandatory (3)');
    });
    it('Before save rules', function () {
        let order: any = new ObjectModel(null, '', schemaOrder, { lines: [{ codeItem: 'A', tauxTVA: 20 }, { codeItem: 'B', tauxTVA: 21 }] });
        order.saving = false;
        let res = order.validate();
        assert.equal(order.saving, true, 'Rule before saving called');
    });

    it('Validation rules', function () {
        let order: any = new ObjectModel(null, '', schemaOrder, { lines: [{ codeItem: 'A', tauxTVA: 20 }, { codeItem: 'B', tauxTVA: 21 }, { codeItem: 'B', tauxTVA: 30 }] });
        let res = order.validate();
        assert.equal(res, false, 'Has errors (1)');
        assert.equal(order.$errors.lines.hasErrors(), true, 'Pk violation');
        let oi = order.lines.get(0);
        assert.equal(oi.$errors.qte.hasErrors(), true, 'Qte is required (1)');
        oi.qte = 2;
        assert.equal(oi.$errors.qte.hasErrors(), false, 'Qte is required (2)');
        oi = order.lines.get(1);
        assert.equal(oi.$errors.qte.hasErrors(), true, 'Qte is required (3)');
        oi.qte = 3;
        assert.equal(oi.$errors.qte.hasErrors(), false, 'Qte is required (4)');
        oi.qte = 0;
        assert.equal(oi.$errors.qte.hasErrors(), true, 'Qte is required (5)');
        oi = order.lines.push({ codeItem: 'C' });
    });

    it('Propagation rules', function () {
        let order: any = new ObjectModel(null, '', schemaOrder, { $create: true });
        let oi: any = order.lines.push({ codeItem: 'A',  tauxTVA: 20 });
        oi.prixUnit = 10;
        oi.qte = 3;
         
        assert.equal(oi.mntHT, 30, 'mntHT = qte * prixUnit');
        assert.equal(oi.mntTVA, 6 , 'mntTVA = tauxTVA * mntHT / 100');
        assert.equal(oi.mntTTC, 36 , 'mntTTC = mntTVA + mntHT');

        assert.equal(order.mntTotalHT, 30 , '(1) o.mntTotalHT = ctx.sum(o.lines.mntHT)');
        assert.equal(order.mntTotalTTC, 36, '(2) o.mntTotalTTC = ctx.sum(o.lines.mntTTC)');

        oi = order.lines.push({ codeItem: 'B',  tauxTVA: 20 });
        oi.prixUnit = 20;
        oi.qte = 3;
        assert.equal(order.mntTotalHT, 90 , '(1) o.mntTotalHT = ctx.sum(o.lines.mntHT)');
        assert.equal(order.mntTotalTTC, 108, '(2) o.mntTotalTTC = ctx.sum(o.lines.mntTTC)');



    });

});



