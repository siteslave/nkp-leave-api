import * as knex from 'knex';

export class LeaveModel {

  read(db: knex, employeeId: any, status: any, limit: number, offset: number) {
    let sql = db('leaves as l')
      .select('l.*', 'p.period_name', 'lt.leave_type_name')
      .leftJoin('periods as p', 'p.period_id', 'l.period_id')
      .leftJoin('leave_types as lt', 'lt.leave_type_id', 'l.leave_type_id');

    if (status) {
      sql.where('l.leave_status', status);
    }

    if (employeeId) {
      sql.where('l.employee_id', employeeId);
    }

  return sql.orderBy('l.start_date', 'DESC')
      .limit(limit)
      .offset(offset);
  }

  getTotal(db: knex, employeeId: any, status: any) {
    let sql = db('leaves')
      .select(db.raw('count(*) as total'));

    if (status) {
      sql.where('leave_status', status);
    }

    if (employeeId) {
      sql.where('employee_id', employeeId);
    }

    return sql;
  }

  create(db: knex, data: any) {
    return db('leaves')
      .insert(data);
  }

  update(db: knex, leaveId: any, data: any, employeeId: any = null) {
    var sql = db('leaves')
      .where('leave_id', leaveId);

    if (employeeId) {
      sql.where('employee_id', employeeId);
    }

    return sql.update(data);
  }

  delete(db: knex, leaveId: any, employeeId: any = null) {
    var sql = db('leaves')
      .where('leave_id', leaveId);

    if (employeeId) {
      sql.where('employee_id', employeeId);
    }

    return sql.del();
  }

  // MANAGER
  managerRead(db: knex, userId: any, status: any, limit: number, offset: number) {

    var sqlSubDepartment = db('user_sub_departments as usd')
      .select('usd.sub_department_id')
      .where('usd.user_id', userId);

    var sqlEmployees = db('employees as e')
      .select('e.employee_id')
      .whereIn('e.sub_department_id', sqlSubDepartment);

    let sql = db('leaves as l')
      .select('l.*', 'p.period_name', 'lt.leave_type_name', 'ee.first_name', 'ee.last_name', 'sd.sub_department_name')
      .leftJoin('periods as p', 'p.period_id', 'l.period_id')
      .leftJoin('leave_types as lt', 'lt.leave_type_id', 'l.leave_type_id')
      .leftJoin('employees as ee', 'ee.employee_id', 'l.employee_id')
      .leftJoin('sub_departments as sd', 'sd.sub_department_id', 'ee.sub_department_id')
      .whereIn('l.employee_id', sqlEmployees);

    if (status) {
      sql.where('l.leave_status', status);
    }

    return sql.orderBy('l.start_date', 'DESC')
      .limit(limit)
      .offset(offset);
  }

  mamagerGetTotal(db: knex, userId: any, status: any) {

    var sqlSubDepartment = db('user_sub_departments as usd')
      .select('usd.sub_department_id')
      .where('usd.user_id', userId);

    var sqlEmployees = db('employees as e')
      .select('e.employee_id')
      .whereIn('e.sub_department_id', sqlSubDepartment);

    let sql = db('leaves as l')
      .select(db.raw('count(*) as total'))
      .whereIn('l.employee_id', sqlEmployees);

    if (status) {
      sql.where('l.leave_status', status);
    }

    return sql;
  }

}
