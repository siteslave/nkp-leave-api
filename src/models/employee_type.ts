import * as knex from 'knex';

export class EmployeeTypeModel {

  read(db: knex) {
    return db('employee_types')
      .orderBy('employee_type_name', 'ASC');
  }

  create(db: knex, data: any) {
    return db('employee_types')
      .insert(data);
  }

  update(db: knex, employeeTypeId: any, data: any) {
    return db('employee_types')
      .where('employee_type_id', employeeTypeId)
      .update(data);
  }

  delete(db: knex, employeeTypeId: any) {
    return db('employee_types')
      .where('employee_type_id', employeeTypeId)
      .del();
  }

}
