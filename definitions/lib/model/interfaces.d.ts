export interface ModelObject {
    owner: ModelObject;
    isArray(): boolean;
    uuid: string;
    addErrors(alerts: {
        message: string;
        severity?: number;
    }[], add?: boolean): void;
    fireMetaDataChanged(propertyName: string, params: any): void;
}
