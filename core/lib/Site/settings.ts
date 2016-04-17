import {readFileSync} from 'fs';

interface ISettings {
    // storage: Object
}

/**
 * Read only settings that are initialized with the class.
 *
 * @ingroup utility
 */
export default class Settings implements ISettings {

    /**
     * Array with the settings.
     *
     * @var array
     */
    private $storage: Object = {};

    /**
     * Singleton instance.
     *
     * @var Settings
     */
    private static $instance: Settings;

    /**
     * Constructor.
     *
     * @param array $settings
     *   Array with the settings.
     */
    constructor($settings) {
        this.$storage = $settings;
        Settings.$instance = this;
    }

    /**
     * Returns the settings instance.
     *
     * A singleton is used because this class is used before the container is
     * available.
     *
     * @return Settings
     */
    static getInstance(): Settings {
        return Settings.$instance;
    }

    /**
     * Protects creating with clone.
     */
    private __clone() {
    }



    static getAll(): Object {
        return Settings.$instance.$storage;
    }



    static initialize() {
        var $settings = {};
        new Settings($settings);

        try {
            $settings = JSON.parse(readFileSync(process.cwd() + '/sites/defaults/settings.json', { encoding: 'utf-8' }));
        } catch (ex) {
            throw ex;
        }

        return new Settings($settings);

    }





    static get($name: string, $default = {}): any {
        return Settings.$instance.$storage[$name] ? Settings.$instance.$storage[$name] : $default;
    }

}
  