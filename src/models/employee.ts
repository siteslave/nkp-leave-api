import * as knex from 'knex';

export class EmployeeModel {

  read(
    db: knex,
    query: any,
    employeeTypeId: any,
    departmentId: any,
    subDepartmentId: any,
    limit: number,
    offset: number) {

    let sql = db('employees as e')
      .select(
        'e.employee_id', 'e.first_name', 'e.last_name',
        'e.employee_type_id', 'e.is_enabled', 'e.username', 'e.sub_department_id', 'e.department_id',
        'et.employee_type_name', 'd.department_name', 'sd.sub_department_name'
      )
      .leftJoin('employee_types as et', 'et.employee_type_id', 'e.employee_type_id')
      .leftJoin('departments as d', 'd.department_id', 'e.department_id')
      .leftJoin('sub_departments as sd', 'sd.sub_department_id', 'e.sub_department_id');

    if (query) {
      let _query = `%${ query }%`;
      sql.where(w => w
        .where('e.first_name', 'LIKE', _query)
        .orWhere('e.last_name', 'LIKE', _query)
      );
    }

    if (employeeTypeId) {
      sql.where('e.employee_type_id', employeeTypeId);
    }

    if (departmentId) {
      sql.where('e.department_id', departmentId);
    }

    if (subDepartmentId) {
      sql.where('e.sub_department_id', subDepartmentId);
    }

    // .where('is_enabled', 'Y')
  return sql.orderByRaw('e.first_name, e.last_name ASC')
      .limit(limit)
      .offset(offset);
  }

  getTotal(db: knex, query: any, employeeTypeId: any, departmentId: any, subDepartmentId: any) {
    let sql = db('employees as e')
      .select(db.raw('count(*) as total'));

    if (query) {
      let _query = `%${ query }%`;
      sql.where(w => w
        .where('e.first_name', 'LIKE', _query)
        .orWhere('e.last_name', 'LIKE', _query)
      );
    }

    if (employeeTypeId) {
      sql.where('e.employee_type_id', employeeTypeId);
    }

    if (departmentId) {
      sql.where('e.department_id', departmentId);
    }

    if (subDepartmentId) {
      sql.where('e.sub_department_id', subDepartmentId);
    }

    return sql;
  }

  create(db: knex, data: any) {
    return db('employees')
      .insert(data);
  }

  update(db: knex, employeeId: any, data: any) {
    return db('employees')
      .where('employee_id', employeeId)
      .update(data);
  }

  delete(db: knex, employeeId: any) {
    return db('employees')
      .where('employee_id', employeeId)
      .del();
  }

}
