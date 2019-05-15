import * as knex from 'knex';

export class SubDepartmentModel {

  read(db: knex, query: any, departmentId: any, limit: number, offset: number) {
    let sql = db('sub_departments as s')
      .select('s.*', 'd.department_name')
      .leftJoin('departments as d', 'd.department_id', 's.department_id');

    if (query) {
      let _query = `%${ query }%`;
      sql.where('s.sub_department_name', 'LIKE', _query);
    }

    if (departmentId) {
      sql.where('s.department_id', departmentId);
    }
    // .where('is_enabled', 'Y')
  return sql.orderBy('s.sub_department_name', 'ASC')
      .limit(limit)
      .offset(offset);
  }

  getTotal(db: knex, query: any, departmentId: any) {
    let sql = db('sub_departments')
      .select(db.raw('count(*) as total'));

    if (query) {
      let _query = `%${ query }%`;
      sql.where('sub_department_name', 'LIKE', _query);
    }

    if (departmentId) {
      sql.where('department_id', departmentId);
    }

    return sql;
  }

  create(db: knex, data: any) {
    return db('sub_departments')
      .insert(data);
  }

  update(db: knex, subDepartmentId: any, data: any) {
    return db('sub_departments')
      .where('sub_department_id', subDepartmentId)
      .update(data);
  }

  delete(db: knex, subDepartmentId: any) {
    return db('sub_departments')
      .where('sub_department_id', subDepartmentId)
      .del();
  }

}
