import { render } from '../src';
import { defineTests } from './spec';

describe('Extension: Inheritance', () => {

  defineTests('inheritance', require('./inheritance.json'));

});