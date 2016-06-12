import Connection from './Connection';
import {IConnection} from './IConnection'


export class Database {
    protected static $databaseInfo = {};
    protected static connections = {};

    static addConnectionInfo($key: string, $info: IConnection): void {
        if (!Database.$databaseInfo[$key]) {
            Database.$databaseInfo[$key] = $info;
        }
    }

    static setMultipleConnectionInfo($databases): void {
        for (var key in $databases) {
            Database.addConnectionInfo(key, $databases[key]);
        }
    }

    protected static openConnection($key = 'default') {
        let $driver;
        if (!Database.$databaseInfo[$key]) {
            throw new Error('The specified database connection is not defined: ' + $key);
        }

        if (!($driver = Database.$databaseInfo[$key]['driver'])) {
            throw new Error('Driver not specified for this database connection: ' + $key);
        }

        return new Connection(Database.$databaseInfo[$key]).getConnection();
    }

    public static getConnection($key = 'default') {
        if (Database.connections[$key]) return Database.connections[$key];

        Database.connections[$key] = Database.openConnection($key);

        return Database.connections[$key];
    }
    
    public static closeConnection($key = 'default') {
      
    }


}