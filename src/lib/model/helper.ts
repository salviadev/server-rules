import * as schemaUtils from './schema';


export const destroyObject = _destroyObject;


var
   _destroyObject = (obj: any): void => {
        if (obj) {
            Object.keys(obj).forEach((ii: any) => {
                ii.destroy();
            });
        };
    };





