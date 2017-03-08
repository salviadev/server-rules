import { ObjectModel } from './object-model';
export declare var execInitRules: (inst: ObjectModel) => void;
export declare var execBeforeSaveRules: (inst: ObjectModel) => void;
export declare var execValidationRules: (inst: ObjectModel) => boolean;
export declare var execRules: (operation: number, propertyName: string, root: ObjectModel, params: any) => void;
