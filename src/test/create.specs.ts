
import * as mochaUtils from 'mocha';
import * as assert from 'assert';

import { ObjectModel } from '../index';

async function execTests() {
    let schema = {
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
                            "minimum": 0,
                            "maximum": 100,
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
    let facture: any = new ObjectModel(null, '', schema, { $create: true });
    //add 2 lines 
    facture.lignes = [{ $create: true }, { $create: true }];
    assert.equal(facture.lignes.length, 2, 'La facture a 2 lignes');



}

describe('Expand Schema $ref', () => {
    it('#/definitions test ', function (done) {
        execTests().then(() => {
            done();
        }).catch((ex) => {
            done(ex);
        });


    });

});

