
import * as Knex from 'knex';
import * as Bookshelf from 'bookshelf';
import {createClient as createRedisClient } from 'redis';
import * as Mongoose from 'mongoose';

import {IConnection} from './IConnection';


export default class Connection {
    private _connection: any;

    constructor(dataBaseInfo: IConnection) {
        let conn = undefined;
        // PostgreSQL, MySQL, and SQLite3.
        switch (dataBaseInfo.driver) {
            case 'mysql':
            case 'sqllite3':
            case 'postgresql':
                conn = Knex({
                    client: dataBaseInfo.driver,
                    connection: {
                        host: dataBaseInfo.host,
                        user: dataBaseInfo.username,
                        password: dataBaseInfo.password,
                        database: dataBaseInfo.database,
                        charset: 'utf8'
                    }
                });
                conn = Bookshelf(conn);
                break;
            case 'redis':
                conn = createRedisClient({
                    host: dataBaseInfo.host,
                    port: dataBaseInfo.port
                });
                break;
            case 'mongo':
                conn = Mongoose.connect(
                    `mongodb://${dataBaseInfo.host}:${dataBaseInfo.port}/${dataBaseInfo.database}`
                    , function (err) {
                        if (err) {
                            throw err;
                        }
                    });
                break;
            default:
                throw new Error(`(${dataBaseInfo.driver}) Driver is not supperted. Please check the settings for storage.`);
        }

        // XXX::: Dont know about port


        conn['_config'] = dataBaseInfo;
        // XXX::: todo for mongo
        // XXX::: todo for elastic
        // XXX::: todo for redis
        this._connection = conn;
    }
    getConnection(): any {
        return this._connection;
    }
    closeConnection(): void {

    }
}