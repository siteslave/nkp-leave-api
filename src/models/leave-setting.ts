import * as knex from 'knex';

export class LeaveSettingModel {

  getSetting(db: knex, periodId: any, employeeTypeId: any) {
    var sql = `
    select lt.*, lds.employee_type_id, 
    lds.leave_days, lds.max_leave_days, 
    lds.period_id, lds.is_collect
    from leave_types as lt
    left join leave_days_settings as lds on lds.leave_type_id=lt.leave_type_id 
    and lds.period_id=? and lds.employee_type_id=?
    order by lt.leave_type_name
    `;

    return db.raw(sql, [periodId, employeeTypeId]);
  }

  saveSetting(db: knex, data: any) {
    return db('leave_days_settings').insert(data);
  }

  removeSetting(db: knex, periodId: any, employeeTypeId: any) {
    return db('leave_days_settings')
      .where('period_id', periodId)
      .where('employee_type_id', employeeTypeId)
      .del();
  }

  // initial leave 
  // 1. get all employees
  getAllEmployeesWithLeaveType(db: knex) {
    return db('empployees')
      .where('is_enabled', 'Y');
  }

  getLeaveDaysSettings(db: knex, periodId: number) {
    return db('leave_days_settings')
      .where('period_id', periodId);
  }

  getAllLeaveSummary(db: knex, periodId: number) {
    let sql = `
      select e.employee_id, e.first_name,e.last_name, e.employee_type_id,
      et.employee_type_name, 
      lt.leave_type_name, lds.leave_type_id,
      lds.leave_days, lds.max_leave_days, lds.is_collect,
      (
        select ifnull(sum(l.leave_days), 0) 
        from leaves as l 
        where l.employee_id=e.employee_id 
        and l.leave_type_id=lds.leave_type_id
        and l.period_id=?
        ) as total_leave_days,
      (
        select ifnull(sum(ldd.leave_days_num), 0) 
        from leave_days as ldd 
        where ldd.employee_id=e.employee_id 
        and ldd.leave_type_id=lds.leave_type_id
        and ldd.period_id=?
      ) as collected_leave_days
      from employees as e 
      inner join employee_types as et on et.employee_type_id=e.employee_type_id
      inner join leave_days_settings as lds on lds.employee_type_id=e.employee_type_id 
      and lds.employee_type_id=e.employee_type_id and lds.period_id=?
      inner join leave_types as lt on lt.leave_type_id=lds.leave_type_id

      order by e.employee_id
    `;

    return db.raw(sql, [periodId, periodId, periodId]);
  }

  removeLeaveDaysForNextPeriod(db: knex, periodId: number) {
    return db('leave_days')
      .where('period_id', periodId)
      .del();
  }

  saveLeaveDaysNewPeriod(db: knex, data: any[]) {
    return db('leave_days')
      .insert(data);
  }

  getCurrentLeaveDaysSetting(db: knex, periodId: number) {
    return db('leave_days_settings')
      .where('period_id', periodId);
  }

  removeOldLeaveDaysSetting(db: knex, periodId: number) {
    return db('leave_days_settings')
      .where('period_id', periodId)
      .del();
  }

  saveNewLeaveDaysSetting(db: knex, data: any[]) {
    return db('leave_days_settings')
      .insert(data);
  }

}
