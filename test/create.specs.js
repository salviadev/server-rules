"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const index_1 = require("../index");
let schemaFacture = {
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
        "lignes": {
            "type": "array",
            "items": {
                "type": "object",
                "name": "FactureLigne",
                "title": "Ligne de Facture",
                "primaryKey": [
                    "codeFact",
                    "codeArticle"
                ],
                "properties": {
                    "codeFact": {
                        "type": "string",
                        "format": "code"
                    },
                    "codeArticle": {
                        "title": "Article",
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
                        "fields": "codeArticle"
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
        let facture = new index_1.ObjectModel(null, '', schemaFacture, { $create: true });
        //add 2 lines 
        facture.lignes = [{ $create: true }, { $create: true }];
        assert.equal(facture.lignes.length, 2, 'La facture a 2 lignes');
    });
    it('Test initialisation from schema', function () {
        let facture = new index_1.ObjectModel(null, '', schemaFacture, { $create: true, lignes: [{}, {}] });
        let lf = facture.lignes.get(0);
        assert.equal(lf.tauxTVA, 20, 'Default taux tva is 20');
        assert.equal(lf.mntTVA, 0, 'Default Mnt tva is 0');
    });
    it('Test states', function () {
        let facture = new index_1.ObjectModel(null, '', schemaFacture, { $create: true, lignes: [{}, {}] });
        let lf = facture.lignes.get(0);
        lf.tauxTVA = 20.333;
        assert.equal(lf.tauxTVA, 20.33, 'Decimals round');
        lf.$states.tauxTVA.decimals = 3;
        lf.tauxTVA = 20.333;
        assert.equal(lf.tauxTVA, 20.333, 'Decimals round after decimals changed');
    });
    it('Test errors', function () {
        let facture = new index_1.ObjectModel(null, '', schemaFacture, { $create: true, lignes: [{}, {}] });
        let lf = facture.lignes.get(0);
        lf.$errors.tauxTVA.addError('Test Error');
        assert.equal(lf.$errors.tauxTVA.hasErrors(), true, 'Has error');
        facture.clearErrors();
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
});
