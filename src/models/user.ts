import * as knex from 'knex';

export class UserModel {

  read(db: knex, query: any, userType: any, limit: number, offset: number) {
    let sql = db('users')
      .select('user_id', 'first_name', 'last_name', 'user_type', 'is_enabled', 'username');

    if (query) {
      let _query = `%${ query }%`;
      sql.where(w => w
        .where('first_name', 'LIKE', _query)
        .orWhere('last_name', 'LIKE', _query)
      );
    }

    if (userType) {
      sql.where('user_type', userType);
    }
    // .where('is_enabled', 'Y')
  return sql.orderByRaw('first_name, last_name ASC', )
      .limit(limit)
      .offset(offset);
  }

  getTotal(db: knex, query: any, userType: any) {
    let sql = db('users')
      .select(db.raw('count(*) as total'));

    if (query) {
      let _query = `%${ query }%`;
      sql.where(w => w
        .where('first_name', 'LIKE', _query)
        .orWhere('last_name', 'LIKE', _query)
      );
    }

    if (userType) {
      sql.where('user_type', userType);
    }

    return sql;
  }

  create(db: knex, data: any) {
    return db('users')
      .insert(data);
  }

  update(db: knex, userId: any, data: any) {
    return db('users')
      .where('user_id', userId)
      .update(data);
  }

  delete(db: knex, userId: any) {
    return db('users')
      .where('user_id', userId)
      .del();
  }

}
