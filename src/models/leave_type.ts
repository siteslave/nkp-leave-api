import * as knex from 'knex';

export class LeaveTypeModel {

  read(db: knex, query: any, limit: number, offset: number) {
    let sql = db('leave_types');

    if (query) {
      let _query = `%${ query }%`;
      sql.where('leave_type_name', 'LIKE', _query);
    }
    // .where('is_enabled', 'Y')
  return sql.orderBy('leave_type_name', 'ASC')
      .limit(limit)
      .offset(offset);
  }

  getTotal(db: knex, query: any) {
    let sql = db('leave_types')
      .select(db.raw('count(*) as total'));

    if (query) {
      let _query = `%${ query }%`;
      sql.where('leave_type_name', 'LIKE', _query);
    }

    return sql;
  }

  create(db: knex, data: any) {
    return db('leave_types')
      .insert(data);
  }

  update(db: knex, leaveTypeId: any, data: any) {
    return db('leave_types')
      .where('leave_type_id', leaveTypeId)
      .update(data);
  }

  delete(db: knex, leaveTypeId: any) {
    return db('leave_types')
      .where('leave_type_id', leaveTypeId)
      .del();
  }

}
