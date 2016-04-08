import {Database} from '../core/lib/Database/Database';
import Settings from '../core/lib/Site/settings';
import * as Bookshelf from 'bookshelf';

Settings.initialize();
Database.setMultipleConnectionInfo(Settings.get('database'));

var defaultConnection: Bookshelf = Database.getConnection();
