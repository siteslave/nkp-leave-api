import * as knex from 'knex';

export class SharedModel {

  getPeriods(db: knex) {
    return db('periods');
  }

}
