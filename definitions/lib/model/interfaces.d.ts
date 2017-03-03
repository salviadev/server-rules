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
    fireMetaDataChanged(propertyName: string, params: any): void;
    readonly $schema: any;
    readonly $errors: any;
}
