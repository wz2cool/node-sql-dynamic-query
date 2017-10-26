// import * as mysql from "mysql";
// import { MysqlConnection } from "../connection";
// import { RelationBase } from "../model";
// import { SqlTemplateProvider } from "../provider";
// import { Relations } from "./entity/relation/relations";
// import { Customer } from "./entity/table/customer";
// import { Order } from "./entity/table/order";
// import { CustomerMapper } from "./mapper/customerMapper";
// import { OrderMapper } from "./mapper/orderMapper";

// const connection = mysql.createConnection({
//     host: "sql12.freemysqlhosting.net",
//     port: 3306,
//     // tslint:disable-next-line:object-literal-sort-keys
//     database: "sql12200910",
//     user: "sql12200910",
//     password: "ku8lhu9lAg",
// });

// const conn = new MysqlConnection(connection);
// const mapper = new OrderMapper(conn);

// // mapper.selectByPrimaryKey(31, [
// //     Relations.getOrder_OrderDetailRelation(),
// //     Relations.getOrder_OrderStatusRelation()])
// //     .then((orders) => {
// //         console.log(JSON.stringify(orders));
// //     })
// //     .catch((err) => {
// //         console.error(err);
// //     });

// // const mapper = new CustomerMapper(connection);
// // mapper.selectByPrimaryKey("28", [Relations.getCustomer_OrderRelation()])
// //     .then((customer) => {
// //         console.log(JSON.stringify(customer));
// //     })
// //     .catch((err) => {
// //         console.error(err);
// //     });
import { TansTest } from "./test/tansTest";

const tansTest = new TansTest();
tansTest.insertSuccess()
    .then(() => {
        console.log("success");
    })
    .catch((err) => {
        console.error(err);
    });
