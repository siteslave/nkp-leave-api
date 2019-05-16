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
      sql.where('l.employee_id', employeeId);
    }

    return sql;
  }

  create(db: knex, data: any) {
    return db('leaves')
      .insert(data);
  }

  update(db: knex, leaveId: any, data: any) {
    return db('leaves')
      .where('leave_id', leaveId)
      .update(data);
  }

  delete(db: knex, leaveId: any) {
    return db('leaves')
      .where('leave_id', leaveId)
      .del();
  }

}
