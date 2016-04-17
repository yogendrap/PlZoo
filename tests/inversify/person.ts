import {Inject} from 'inversify';
import {Computer} from './computer';

export class Person {
    constructor(public computer: Computer) {

    }
    
    turnOncomputer(){
        this.computer.on();
    }
}
