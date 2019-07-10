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

  leaveLast(db: knex, employeeId: any, limit = 1) {
    return db('leaves as l')
      .select('l.*', 'p.period_name', 'lt.leave_type_name')
      .leftJoin('periods as p', 'p.period_id', 'l.period_id')
      .leftJoin('leave_types as lt', 'lt.leave_type_id', 'l.leave_type_id')
      .where('l.employee_id', employeeId)
      .limit(limit)
      .orderBy('l.leave_id', 'DESC');

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

  createLog(db: knex, leaveId: any, userId: any, status: any) {
    return db('leave_status_logs')
      .insert({
        leave_id: leaveId,
        user_id: userId,
        leave_status: status
      });
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
  managerRead(db: knex, userId: any, employeeId: any, status: any, limit: number, offset: number) {

    var sqlSubDepartment = db('user_sub_departments as usd')
      .select('usd.sub_department_id')
      .where('usd.user_id', userId);

    var sqlEmployees = db('employees as e')
      .select('e.employee_id')
      .whereIn('e.sub_department_id', sqlSubDepartment);

    let sql = db('leaves as l')
      .select('l.*', 'p.period_name',
        'lt.leave_type_name', 'ee.first_name',
        'ee.last_name', 'sd.sub_department_name',
        'pt.position_name')
      .leftJoin('periods as p', 'p.period_id', 'l.period_id')
      .leftJoin('leave_types as lt', 'lt.leave_type_id', 'l.leave_type_id')
      .leftJoin('employees as ee', 'ee.employee_id', 'l.employee_id')
      .leftJoin('sub_departments as sd', 'sd.sub_department_id', 'ee.sub_department_id')
      .leftJoin('positions as pt', 'pt.position_id', 'ee.position_id')
      .whereIn('l.employee_id', sqlEmployees);

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

  mamagerGetTotal(db: knex, userId: any, employeeId: any, status: any) {

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

    if (employeeId) {
      sql.where('l.employee_id', employeeId);
    }

    return sql;
  }

  getLeaveHistoryByEmployee(db: knex, employeeId: any, periodId: any) {
    return db('leaves as l')
      .select('l.*', 'lt.leave_type_name', 'p.period_name')
      .innerJoin('leave_types as lt', 'lt.leave_type_id', 'l.leave_type_id')
      .innerJoin('periods as p', 'p.period_id', 'l.period_id')
      .where('l.leave_status', 'APPROVED')
      .where('l.employee_id', employeeId)
      .where('l.period_id', periodId)
      .orderBy('l.start_date', 'desc');
  }

  getCurrentLeaveSummary(db: knex, employeeId: any, periodId: any) {
    return db('leave_days as ld')
      .select('ld.leave_days_num', 'lt.leave_type_name', 'lt.leave_type_id', 'lt.image_url as leave_type_image')
      .innerJoin('leave_types as lt', 'lt.leave_type_id', 'ld.leave_type_id')
      .where('ld.employee_id', employeeId)
      .where('ld.period_id', periodId)
      .groupByRaw('ld.leave_type_id, ld.employee_id, ld.period_id')
  }

  async getCurrentLeaveTotal(db: knex, employeeId: any, periodId: any, leaveTypeId: any) {
    const rs: any = await db('leaves as l')
      .select(db.raw('sum(l.leave_days) as total'))
      .where('l.leave_type_id', leaveTypeId)
      .where('l.period_id', periodId)
      .where('l.employee_id', employeeId)
      .where('l.leave_status', 'APPROVED');

    return rs[0].total || 0;
  }

  async getLastLeaveDay(db: knex, employeeId: any, periodId: any, leaveTypeId: any) {
    const rs: any = await db('leaves as l')
      .select('l.start_date')
      .where('l.leave_type_id', leaveTypeId)
      .where('l.period_id', periodId)
      .where('l.employee_id', employeeId)
      .where('l.leave_status', 'APPROVED')
      .orderBy('l.start_date', 'DESC')
      .limit(1);

    return rs.length ? rs[0].start_date : null;
  }

  async getLeaveInfoForPrint(db: knex, leaveId: any) {
    const sql = `
      select l.current_leave_days, l.leave_days, l.start_date, l.end_date, l.leave_status,
      l.leave_type_id, 
      e.first_name, e.last_name, e.sub_department_id, e.department_id,
      lt.leave_type_name, p.position_name, d.department_name, sd.sub_department_name
      from leaves as l
      INNER join employees as e on e.employee_id=l.employee_id
      inner join leave_types as lt on lt.leave_type_id=l.leave_type_id
      inner join positions as p on p.position_id=e.position_id
      inner join departments as d on d.department_id=e.department_id
      inner join sub_departments as sd on sd.sub_department_id=e.sub_department_id
      and l.leave_id=?
      GROUP BY l.leave_id, e.employee_id
    `;
    const rs: any = await db.raw(sql, [leaveId]);
    return rs.length ? rs[0][0] : [];
  }

  async searchEmployeeTypeahead(db: knex, query: any) {
    const _query = `%${query}%`;

    const sql = `
    select e.employee_id, e.first_name, e.last_name,
    p.position_name
    from employees as e
    left join positions as p on p.position_id=e.position_id
    where e.first_name like ? or e.last_name like ?
    limit 10
    `;

    return db.raw(sql, [_query, _query]);

  }

}
