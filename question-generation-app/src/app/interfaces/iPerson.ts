import { Staff } from '../classes/staff';
import { Student } from '../classes/student';

// @ts-ignore
// tslint:disable-next-line:no-empty-interface
export interface IPerson extends Student, Staff {}
