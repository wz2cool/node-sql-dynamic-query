import { EntityCache } from "./cache";
import { column } from "./decorator";
import { ClassHelper } from "./helper";
import { FilterCondition, FilterDescriptor, FilterOperator } from "./model";

export class User {
    @column("id", "user")
    public id: number;
    public userName: string;
    public email: string;
    public mobile: string;
    public password: string;
    public displayName: string;
    public createTime: Date;
    public updateTime: Date;
    public deleted: number;
}

console.log(EntityCache.getInstance().getColumnInfos("User"));

console.log("hello");
