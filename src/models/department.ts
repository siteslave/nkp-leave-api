import * as knex from 'knex';

export class DepartmentModel {

  read(db: knex, query: any, limit: number, offset: number) {
    let sql = db('departments');

    if (query) {
      let _query = `%${ query }%`;
      sql.where('department_name', 'LIKE', _query);
    }
    // .where('is_enabled', 'Y')
  return sql.orderBy('department_name', 'ASC')
      .limit(limit)
      .offset(offset);
  }

  getTotal(db: knex, query: any) {
    let sql = db('departments')
      .select(db.raw('count(*) as total'));

    if (query) {
      let _query = `%${ query }%`;
      sql.where('department_name', 'LIKE', _query);
    }

    return sql;
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
