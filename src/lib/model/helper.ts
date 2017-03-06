import * as schemaUtils from './schema';

var
    _destroyObject = (obj: any): void => {
        if (obj) {
            Object.keys(obj).forEach((name: string) => {
                let ii = obj[name];
                ii.destroy();
            });
        };
    };


export var destroyObject = _destroyObject;











