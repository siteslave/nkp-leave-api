import * as knex from 'knex';

export class PositionModel {

  read(db: knex, query: any, limit: number, offset: number) {
    let sql = db('positions');

    if (query) {
      let _query = `%${query}%`;
      sql.where('position_name', 'LIKE', _query);
    }
    // .where('is_enabled', 'Y')
    return sql.orderBy('position_name', 'ASC')
      .limit(limit)
      .offset(offset);
  }

  getTotal(db: knex, query: any) {
    let sql = db('positions')
      .select(db.raw('count(*) as total'));

    if (query) {
      let _query = `%${query}%`;
      sql.where('position_name', 'LIKE', _query);
    }

    return sql;
  }

  create(db: knex, data: any) {
    return db('positions')
      .insert(data);
  }

  update(db: knex, positionId: any, data: any) {
    return db('positions')
      .where('position_id', positionId)
      .update(data);
  }

  delete(db: knex, positionId: any) {
    return db('positions')
      .where('position_id', positionId)
      .del();
  }

}
