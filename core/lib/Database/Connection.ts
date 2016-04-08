
import * as Knex from 'knex';
import * as Bookshelf from 'bookshelf';
import {IConnection} from './IConnection';

export default class Connection {
    private _connection: Bookshelf;

    constructor(dataBaseInfo: IConnection) {
        // PostgreSQL, MySQL, and SQLite3.
        
        
        // XXX::: Dont know about port
        let knex = Knex({
            client: dataBaseInfo.driver,
            connection: {
                host: dataBaseInfo.host,
                user: dataBaseInfo.username,
                password: dataBaseInfo.password,
                database: dataBaseInfo.database,
                charset: 'utf8'
            }
        });

        knex['_config'] = dataBaseInfo;
        // XXX::: todo for mongo
        // XXX::: todo for elastic
        
        this._connection = Bookshelf(knex);
    }
    getConnection(): Bookshelf {
        return this._connection;
    }
    closeConnection(): void {

    }
}