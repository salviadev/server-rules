import { ObjectModel } from './object-model'

export function createInstance(schema: any, data: any): any {
    return new ObjectModel(null, '', schema, data);
}