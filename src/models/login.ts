import * as knex from "knex";

export class LoginModel {

  adminLogin(db: knex, username: string, password: string) {

    var subQuery = db('periods')
      .select('period_id')
      .where('is_current', 'Y')
      .limit(1)
      .as('period_id');

    var subQuery2 = db('periods')
      .select('period_name')
      .where('is_current', 'Y')
      .limit(1)
      .as('period_name');

    return db('users')
      .select('first_name', 'last_name', 'user_type', 'user_id', subQuery2, subQuery)
      .where('is_enabled', 'Y')
      .where('username', username)
      .where('password', password)
      .limit(1);
  }

  userLogin(db: knex, username: string, password: string) {
    var subQuery = db('periods')
      .select('period_id')
      .where('is_current', 'Y')
      .limit(1)
      .as('period_id');

    var subQuery2 = db('periods')
      .select('period_name')
      .where('is_current', 'Y')
      .limit(1)
      .as('period_name');

    return db('employees as e')
      .select('e.first_name', 'e.last_name',
        'et.employee_type_name', 'e.employee_id', subQuery, subQuery2)
      .leftJoin('employee_types as et', 'et.employee_type_id', 'e.employee_type_id')
      .where('e.is_enabled', 'Y')
      .where('e.username', username)
      .where('e.password', password)
      .limit(1);
  }

}
