
export interface ModelObject {
    owner: ModelObject;
    isArray(): boolean;
    uuid: string;
    model(): any;
    getRoot(): ModelObject;
    getFullPath(): string;
    addError(message: string): void;
    rmvError(message: string): void;
    clearErrors(): void;
    validate(): boolean;
    fireMetaDataChanged(propertyName: string, params: any): void;
    firePropChangedChanged(operation: number, propertyName: string, oldvalue: any, newValue: any, params: any, source: boolean): void;
    readonly $schema: any;
    readonly $errors: any;
}


