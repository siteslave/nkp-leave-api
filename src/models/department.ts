import * as knex from 'knex';

export class DepartmentModel {

  read(db: knex) {
    return db('departments')
      .where('is_enabled', 'Y')
      .orderBy('department_name', 'ASC');
  }

  create(db: knex, data: any) {
    return db('departments')
      .insert(data);
  }

  update(db: knex, departmentId: any, data: any) {
    return db('departments')
      .where('department_id', departmentId)
      .update(data);
  }

  delete(db: knex, departmentId: any) {
    return db('departments')
      .where('department_id', departmentId)
      .del();
  }

}
