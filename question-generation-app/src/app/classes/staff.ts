import { User } from './user';

export class Staff extends User {
  accountType: 'Staff';
  position: string;
  facultyArea: string;
}
