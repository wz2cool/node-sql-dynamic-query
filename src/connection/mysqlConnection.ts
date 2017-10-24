import { injectable } from "inversify";
import * as lodash from "lodash";
import "reflect-metadata";
import { CommonHelper } from "../helper";
import { DatabaseType, Entity, SqlTemplate } from "../model";
import { MappingProvider } from "../provider";
import { ISqlConnection } from "./iSqlConnection";

@injectable()
export class MysqlConnection implements ISqlConnection {
    private readonly pool: any;
    constructor(pool: any) {
        this.pool = pool;
    }

    public getDataBaseType(): DatabaseType {
        return DatabaseType.MYSQL;
    }
    public run(sql: string, params: any[], callback: (err: any, result?: any) => void) {
        const sqlTemplate = new SqlTemplate();
        sqlTemplate.sqlExpression = sql;
        sqlTemplate.params = params;
        this.runTransaction([sqlTemplate], (err: any, result: any[]) => {
            if (CommonHelper.isNullOrUndefined(callback)) {
                return;
            }
            if (CommonHelper.isNullOrUndefined(err)) {
                callback(null, result[0]);
            } else {
                callback(err, null);
            }
        });
    }

    public async runTransaction(sqlTemplates: SqlTemplate[], callback: (err: any, result: any[]) => void) {
        try {
            const result: any[] = [];
            const connection = await this.getBeginTransactionConnection(this.pool);
            for (const sqlTemplate of sqlTemplates) {
                const queryResult = await this.runTransactionInternal(connection, sqlTemplate);
                result.push(queryResult);
            }
            await this.commitTransaction(connection);
            if (!CommonHelper.isNullOrUndefined(callback)) {
                callback(null, result);
            }
        } catch (e) {
            if (!CommonHelper.isNullOrUndefined(callback)) {
                callback(e, null);
            }
        }
    }

    public select(sql: string, params: any[], callback: (err: any, result: any[]) => void) {
        this.pool.query(sql, params, callback);
    }

    public selectCount(sql: string, params: any[], callback: (err: any, result: number) => void) {
        this.pool.query(sql, params, (err, result) => {
            if (CommonHelper.isNullOrUndefined(callback)) {
                return;
            }

            if (CommonHelper.isNullOrUndefined(err)) {
                const count = lodash.values(result[0])[0] as number;
                callback(null, count);
            } else {
                callback(err, 0);
            }
        });
    }

    public selectEntities<T extends Entity>(
        entityClass: new () => T, sql: string, params: any[], callback: (err: any, result: T[]) => void) {
        this.pool.query(sql, params, (err, result) => {
            if (CommonHelper.isNullOrUndefined(err)) {
                const entities = MappingProvider.toEntities<T>(entityClass, result);
                callback(null, entities);
            } else {
                callback(err, []);
            }
        });
    }

    private getBeginTransactionConnection(pool: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (CommonHelper.isNullOrUndefined(err)) {
                    connection.beginTransaction((beginTransErr) => {
                        if (CommonHelper.isNullOrUndefined(beginTransErr)) {
                            resolve(connection);
                        } else {
                            reject(beginTransErr);
                        }
                    });
                } else {
                    reject(err);
                }
            });
        });
    }

    private runTransactionInternal(connection: any, sqlTemplate: SqlTemplate): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            connection.query(sqlTemplate.sqlExpression, sqlTemplate.params, (err, result) => {
                if (CommonHelper.isNullOrUndefined(err)) {
                    resolve(result);
                } else {
                    return connection.rollback(() => {
                        reject(err);
                    });
                }
            });
        });
    }

    private commitTransaction(connection): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            connection.commit((commitError) => {
                if (commitError) {
                    return connection.rollback(() => {
                        reject(commitError);
                    });
                } else {
                    resolve();
                }
            });
        });
    }
}