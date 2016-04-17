import './di';

import {kernel} from './kernel';

import {INinja} from './di';

var ninja = kernel.get<INinja>('INinja');


console.log(ninja.fight());
