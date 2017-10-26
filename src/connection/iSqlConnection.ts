import { DatabaseType, Entity, RowBounds, SqlTemplate } from "../model";

export interface ISqlConnection {
    getDataBaseType(): DatabaseType;
    getRowBoundsExpression(rowBounds: RowBounds): string;
    run(sql: string, params: any[]): Promise<any>;
    select(sql: string, params: any[]): Promise<any[]>;
    selectCount(sql: string, params: any[]): Promise<number>;
    selectEntities<T extends Entity>(
        entityClass: { new(): T },
        sql: string,
        params: any[]): Promise<T[]>;

    beginTransaction(): Promise<ISqlConnection>;
    rollback(): Promise<void>;
    commit(): Promise<void>;

}
