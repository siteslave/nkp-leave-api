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
        'et.employee_type_name', 'd.department_name', 'sd.sub_department_name',
        'pt.position_name', 'pt.position_id'
      )
      .leftJoin('employee_types as et', 'et.employee_type_id', 'e.employee_type_id')
      .leftJoin('departments as d', 'd.department_id', 'e.department_id')
      .leftJoin('sub_departments as sd', 'sd.sub_department_id', 'e.sub_department_id')
      .leftJoin('positions as pt', 'pt.position_id', 'e.position_id');

    if (query) {
      let _query = `%${query}%`;
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
      let _query = `%${query}%`;
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

  getInfo(db: knex, employeeId: any) {
    return db('employees as e')
      .select('e.first_name', 'e.last_name',
        'e.username', 'd.department_name', 'sd.sub_department_name',
        'pt.position_name', 'pt.position_id', 'im.image_path')
      .leftJoin('departments as d', 'd.department_id', 'e.department_id')
      .leftJoin('sub_departments as sd', 'sd.sub_department_id', 'e.sub_department_id')
      .leftJoin('positions as pt', 'pt.position_id', 'e.position_id')
      .leftJoin('images as im', 'im.employee_id', 'e.employee_id')
      .where('e.employee_id', employeeId)
      .limit(1);
  }

  readManagerEmployee(
    db: knex,
    query: any,
    managerId: any,
    limit: number,
    offset: number) {

    var sqlSubDepartment = db('user_sub_departments as usd')
      .select('usd.sub_department_id')
      .where('usd.user_id', managerId);

    let sql = db('employees as e')
      .select(
        'e.employee_id', 'e.first_name', 'e.last_name',
        'e.employee_type_id', 'e.is_enabled', 'e.username', 'e.sub_department_id', 'e.department_id',
        'et.employee_type_name', 'd.department_name', 'sd.sub_department_name',
        'pt.position_name', 'pt.position_id'
      )
      .leftJoin('employee_types as et', 'et.employee_type_id', 'e.employee_type_id')
      .leftJoin('departments as d', 'd.department_id', 'e.department_id')
      .leftJoin('sub_departments as sd', 'sd.sub_department_id', 'e.sub_department_id')
      .leftJoin('positions as pt', 'pt.position_id', 'e.position_id')
      .whereIn('e.sub_department_id', sqlSubDepartment);

    if (query) {
      let _query = `%${query}%`;
      sql.where(w => w
        .where('e.first_name', 'LIKE', _query)
        .orWhere('e.last_name', 'LIKE', _query)
      );
    }

    return sql.orderByRaw('e.first_name, e.last_name ASC')
      .limit(limit)
      .offset(offset);
  }

  readTotalManagerEmployee(db: knex, query: any, managerId: any) {
    const sqlSubDepartment = db('user_sub_departments as usd')
      .select('usd.sub_department_id')
      .where('usd.user_id', managerId);

    let sql = db('employees as e')
      .select(db.raw('count(*) as total'))
      .whereIn('e.sub_department_id', sqlSubDepartment);

    if (query) {
      let _query = `%${query}%`;
      sql.where(w => w
        .where('e.first_name', 'LIKE', _query)
        .orWhere('e.last_name', 'LIKE', _query)
      );
    }

    return sql;
  }

  saveImage(db: knex, employeeId: any, fileName: any, mimeType: any) {
    return db('images')
      .insert({
        employee_id: employeeId,
        image_path: fileName,
        mime_type: mimeType
      });
  }

  removeImage(db: knex, employeeId: any) {
    return db('images')
      .where('employee_id', employeeId)
      .del();
  }

  getImage(db: knex, employeeId: any) {
    return db('images')
      .where('employee_id', employeeId)
      .limit(1);
  }

}
