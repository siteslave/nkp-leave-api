import * as knex from "knex";

export class LoginModel {

  adminLogin(db: knex, username: string, password: string) {
    return db('users')
      .select('first_name', 'last_name', 'user_type', 'user_id')
      .where('is_enabled', 'Y')
      .where('username', username)
      .where('password', password)
      .limit(1);
  }

  userLogin(db: knex, username: string, password: string) {
    return db('employees as e')
      .select('e.first_name', 'e.last_name', 'et.employee_type_name', 'e.employee_id')
      .leftJoin('employee_types as et', 'et.employee_type_id', 'e.employee_type_id')
      .where('e.is_enabled', 'Y')
      .where('e.username', username)
      .where('e.password', password)
      .limit(1);
  }

}
