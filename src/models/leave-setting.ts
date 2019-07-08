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

}
