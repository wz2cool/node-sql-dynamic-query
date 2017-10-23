import { injectable } from "inversify";
import * as lodash from "lodash";
import "reflect-metadata";
import { ISqlConnection } from "../connection";
import {
    Entity,
    FilterDescriptorBase,
    KeyValue,
    Page,
    PageRowBounds,
    RowBounds,
    SortDescriptorBase,
    SqlTemplate,
} from "../model";
import { SqlTemplateProvider } from "../provider";
import { BaseInternalMapper } from "./baseInternalMapper";

@injectable()
export abstract class BaseMapper<T extends Entity> extends BaseInternalMapper<T> {
    constructor(sqlConnection: ISqlConnection) {
        super(sqlConnection);
    }

    public mybatisSelect(sql: string, paramMap: { [key: string]: any }): Promise<any> {
        const sqlTemplate = this.getSqlTemplate(sql, paramMap);
        return super.selectInternal(sqlTemplate.sqlExpression, sqlTemplate.params);
    }

    public mybatisSelectEntities(sql: string, paramMap: { [key: string]: any }): Promise<T[]> {
        const sqlTemplate = this.getSqlTemplate(sql, paramMap);
        return super.selectEntitiesInternal(sqlTemplate.sqlExpression, sqlTemplate.params);
    }

    public mybatisSelectEntitiesRowBounds(
        sql: string, paramMap: { [key: string]: any }, rowBounds: RowBounds): Promise<T[]> {
        const sqlTemplate = this.getSqlTemplate(sql, paramMap);
        return super.selectEntitiesRowBoundsInternal(sqlTemplate.sqlExpression, sqlTemplate.params, rowBounds);
    }

    public mybatisSelectEntitiesPageRowBounds(
        sql: string, paramMap: { [key: string]: any }, pageRowBounds: PageRowBounds): Promise<Page<T>> {
        const sqlTemplate = this.getSqlTemplate(sql, paramMap);
        return super.selectEntitiesPageRowBoundsInternal(sqlTemplate.sqlExpression, sqlTemplate.params, pageRowBounds);
    }

    public mybatisSelectCount(sql: string, paramMap: { [key: string]: any }): Promise<number> {
        const sqlTemplate = this.getSqlTemplate(sql, paramMap);
        return super.selectCountInternal(sqlTemplate.sqlExpression, sqlTemplate.params);
    }

    private getSqlTemplate(sql: string, paramMap: { [key: string]: any }): SqlTemplate {
        let expression = sql;
        const indexParams: Array<KeyValue<number, any>> = [];
        for (const key in paramMap) {
            if (paramMap.hasOwnProperty(key)) {
                const placehoulderKey = "$\{" + key + "\}";
                const paramKey = "#\{" + key + "\}";
                const indexOfParam = sql.indexOf(paramKey);
                if (sql.indexOf(placehoulderKey) >= 0) {
                    expression = expression.replace(placehoulderKey, paramMap[key]);
                } else if (indexOfParam >= 0) {
                    expression = expression.replace(paramKey, "?");
                    const keyValue = new KeyValue(indexOfParam, paramMap[key]);
                    indexParams.push(keyValue);
                }
            }
        }

        const sqlTemplate = new SqlTemplate();
        sqlTemplate.sqlExpression = expression;
        sqlTemplate.params = lodash.sortBy(indexParams, (x) => x.getKey()).map((x) => x.getValue());
        return sqlTemplate;
    }
}
