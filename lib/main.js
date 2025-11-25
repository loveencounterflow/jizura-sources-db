(function() {
  'use strict';
  var Async_jetstream, Benchmarker, Bsql3, Dbric, GUY, Jetstream, Jzrbvfs, PATH, SFMODULES, SQL, TMP_language_services, _begin, _end, alert, benchmarker, blue, bold, debug, demo_source_identifiers, echo, get_db, get_paths, gold, green, grey, help, info, inspect, log, plain, populate_meaning_mirror_triples, praise, red, reverse, rpr, timeit, tmp_language_services, urge, walk_lines_with_positions, warn, whisper, white;

  //===========================================================================================================
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('jizura-sources-db'));

  ({rpr, inspect, echo, white, green, blue, gold, grey, red, bold, reverse, log} = GUY.trm);

  // { f }                     = require '../../hengist-NG/apps/effstring'
  // write                     = ( p ) -> process.stdout.write p
  // { nfa }                   = require '../../hengist-NG/apps/normalize-function-arguments'
  // GTNG                      = require '../../hengist-NG/apps/guy-test-NG'
  // { Test                  } = GTNG
  // FS                        = require 'node:fs'
  PATH = require('node:path');

  //-----------------------------------------------------------------------------------------------------------
  Bsql3 = require('better-sqlite3');

  //-----------------------------------------------------------------------------------------------------------
  SFMODULES = require('../../hengist-NG/apps/bricabrac-sfmodules');

  //...........................................................................................................
  ({Dbric, SQL} = SFMODULES.unstable.require_dbric());

  //...........................................................................................................
  ({Jetstream, Async_jetstream} = SFMODULES.require_jetstream());

  //...........................................................................................................
  ({walk_lines_with_positions} = SFMODULES.unstable.require_fast_linereader());

  //...........................................................................................................
  ({Benchmarker} = SFMODULES.unstable.require_benchmarking());

  benchmarker = new Benchmarker();

  timeit = function(...P) {
    return benchmarker.timeit(...P);
  };

  //===========================================================================================================
  demo_source_identifiers = function() {
    var expand_dictionary, get_local_destinations, key, ref1, results, value;
    ({expand_dictionary} = SFMODULES.require_dictionary_tools());
    ({get_local_destinations} = SFMODULES.require_get_local_destinations());
    ref1 = get_local_destinations();
    results = [];
    for (key in ref1) {
      value = ref1[key];
      results.push(debug('Ωjzrsdb___1', key, value));
    }
    return results;
  };

  // can append line numbers to files as in:
  // 'dict:meanings.1:L=13332'
  // 'dict:ucd140.1:uhdidx:L=1234'
  // rowids: 't:jfm:R=1'
  // aref: labels this proximal point in the data set as an origin
  // mref: identifies both the proximal and the distal end
  // zref: identifies the distal source of a piece of data
  // {
  //   'dict:meanings':          '$jzrds/meaning/meanings.txt'
  //   'dict:ucd:v14.0:uhdidx' : '$jzrds/unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt'
  //   }

  //===========================================================================================================
  get_paths = function() {
    var R;
    R = {};
    R.base = PATH.resolve(__dirname, '..');
    R.db = PATH.join(R.base, 'jzr.db');
    // R.db                            = '/dev/shm/jzr.db'
    R.jzrds = PATH.join(R.base, 'jzrds');
    R['dict:meanings'] = PATH.join(R.jzrds, 'meaning/meanings.txt');
    R['dict:ucd:v14.0:uhdidx'] = PATH.join(R.jzrds, 'unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt');
    return R;
  };

  //-----------------------------------------------------------------------------------------------------------
  get_db = function() {
    var paths;
    paths = get_paths();
    return Jzrbvfs.open(paths.db);
  };

  Jzrbvfs = (function() {
    //===========================================================================================================
    class Jzrbvfs extends Dbric {
      //---------------------------------------------------------------------------------------------------------
      static open(...P) {
        /* TAINT not a very nice solution */
        /* TAINT need more clarity about when statements, build, initialize... is performed */
        var R;
        R = super.open(...P);
        if (R.is_fresh) {
          R._on_open_populate_jzr_datasources();
          R._on_open_populate_jzr_mirror_lcodes();
          R._on_open_populate_jzr_mirror_lines();
          R._on_open_populate_jzr_mirror_triples_for_meanings();
        } else {
          warn('Ωjzrsdb___2', "skipped data insertion");
          debug('Ωjzrsdb___3', R.is_ready);
          debug('Ωjzrsdb___4', R.is_fresh);
        }
        return R;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_datasources() {
        var dskey, paths;
        paths = get_paths();
        dskey = 'dict:meanings';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=1',
          dskey,
          path: paths[dskey]
        });
        // dskey = 'dict:ucd:v14.0:uhdidx';  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=2', dskey, path: paths[ dskey ], }
        return null;
      }

      // #---------------------------------------------------------------------------------------------------------
      // _on_open_populate_verbs: ->
      //   paths = get_paths()
      //   dskey = 'dict:meanings';          @statements.insert_jzr_datasource.run { rowid: 't:ds:R=1', dskey, path: paths[ dskey ], }
      //   dskey = 'dict:ucd:v14.0:uhdidx';  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=2', dskey, path: paths[ dskey ], }
      //   ;null

        //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_mirror_lcodes() {
        this.statements.insert_jzr_mirror_lcode.run({
          rowid: 't:lc:V=B',
          lcode: 'B',
          comment: 'blank line'
        });
        this.statements.insert_jzr_mirror_lcode.run({
          rowid: 't:lc:V=C',
          lcode: 'C',
          comment: 'comment line'
        });
        this.statements.insert_jzr_mirror_lcode.run({
          rowid: 't:lc:V=D',
          lcode: 'D',
          comment: 'data line'
        });
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_mirror_lines() {
        this.statements.populate_jzr_mirror_lines.run();
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_mirror_triples_for_meanings() {}

      // ;null

        //---------------------------------------------------------------------------------------------------------
      initialize() {
        var me;
        super.initialize();
        this._TMP_state = {
          triple_count: 0
        };
        me = this;
        //.......................................................................................................
        this.create_function({
          name: 'regexp',
          deterministic: true,
          call: function(pattern, text) {
            if ((new RegExp(pattern, 'v')).test(text)) {
              return 1;
            } else {
              return 0;
            }
          }
        });
        //.......................................................................................................
        this.create_table_function({
          name: 'split_words',
          columns: ['keyword'],
          parameters: ['line'],
          rows: function*(line) {
            var i, keyword, keywords, len;
            keywords = line.split(/(?:\p{Z}+)|((?:\p{Script=Han})|(?:\p{L}+)|(?:\p{N}+)|(?:\p{S}+))/v);
// debug 'Ωjzrsdb___5', line_nr, rpr keywords
            for (i = 0, len = keywords.length; i < len; i++) {
              keyword = keywords[i];
              if (keyword == null) {
                continue;
              }
              if (keyword === '') {
                continue;
              }
              yield ({keyword});
            }
            return null;
          }
        });
        //.......................................................................................................
        this.create_table_function({
          name: 'file_lines',
          columns: ['line_nr', 'lcode', 'line', 'field_1', 'field_2', 'field_3', 'field_4'],
          parameters: ['path'],
          rows: function*(path) {
            var eol, field_1, field_2, field_3, field_4, lcode, line, line_nr, x;
            for (x of walk_lines_with_positions(path)) {
              ({
                lnr: line_nr,
                line,
                eol
              } = x);
              field_1 = field_2 = field_3 = field_4 = null;
              switch (true) {
                case /^\s*$/v.test(line):
                  lcode = 'B';
                  break;
                case /^\s*#/v.test(line):
                  lcode = 'C';
                  break;
                default:
                  lcode = 'D';
                  [field_1, field_2, field_3, field_4] = line.split('\t');
                  if (field_1 == null) {
                    field_1 = null;
                  }
                  if (field_2 == null) {
                    field_2 = null;
                  }
                  if (field_3 == null) {
                    field_3 = null;
                  }
                  if (field_4 == null) {
                    field_4 = null;
                  }
              }
              yield ({line_nr, lcode, line, field_1, field_2, field_3, field_4});
            }
            return null;
          }
        });
        //.......................................................................................................
        this.create_table_function({
          name: 'get_triples',
          parameters: ['rowid_in', 'field_1', 'field_2', 'field_3', 'field_4'],
          columns: ['rowid_out', 'ref', 's', 'v', 'o'],
          rows: function*(rowid_in, field_1, field_2, field_3, field_4) {
            yield* me.get_triples(rowid_in, field_1, field_2, field_3, field_4);
            return null;
          }
        });
        //.......................................................................................................
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      * get_triples(rowid_in, field_1, field_2, field_3, field_4) {
        var base, entry, i, len, o, reading, readings, ref, rowid_out, s, v;
        ref = rowid_in;
        s = field_2;
        v = null;
        o = null;
        entry = field_3;
        //.......................................................................................................
        switch (true) {
          //...................................................................................................
          case entry.startsWith('py:'):
            v = 'zh_reading';
            readings = tmp_language_services.extract_atonal_zh_readings(entry);
            break;
          //...................................................................................................
          case (entry.startsWith('hi:')) || (entry.startsWith('ka:')):
            v = 'ja_reading';
            readings = tmp_language_services.extract_ja_readings(entry);
        }
        //.....................................................................................................
        if (v != null) {
          for (i = 0, len = readings.length; i < len; i++) {
            reading = readings[i];
            this._TMP_state.triple_count++;
            rowid_out = `t:mr:3pl:R=${this._TMP_state.triple_count}`;
            o = reading;
            yield ({rowid_out, ref, s, v, o});
            if (typeof (base = this._TMP_state).timeit_progress === "function") {
              base.timeit_progress();
            }
          }
        }
        // @w.statements.insert_jzr_mirror_triple.run { rowid, ref, s, v, o, }
        // progress()
        // rowid_out = "t:mr:3pl:R=#{triple_count}"
        // s         = "s.#{triple_count}"
        // v         = "v.#{triple_count}"
        // o         = "o.#{triple_count}"
        // yield { rowid_out, ref, s, v, o, }
        //.......................................................................................................
        return null;
      }

    };

    //---------------------------------------------------------------------------------------------------------
    Jzrbvfs.db_class = Bsql3;

    //---------------------------------------------------------------------------------------------------------
    Jzrbvfs.build = [
      //.......................................................................................................
      SQL`create table jzr_datasources (
  rowid     text    unique  not null,
  dskey     text    unique  not null,
  path      text            not null,
primary key ( rowid ),
check ( rowid regexp '^t:ds:R=\\d+$'));`,
      //.......................................................................................................
      SQL`create table jzr_mirror_lcodes (
  rowid     text    unique  not null,
  lcode     text    unique  not null,
  comment   text            not null,
primary key ( rowid ),
check ( lcode regexp '^[a-zA-Z]+[a-zA-Z0-9]*$' ),
check ( rowid = 't:lc:V=' || lcode ) );`,
      //.......................................................................................................
      SQL`create table jzr_mirror_lines (
  -- 't:jfm:'
  rowid     text    unique  not null,
  ref       text    unique  not null generated always as ( dskey || ':L=' || line_nr ) virtual,
  dskey     text            not null,
  line_nr   integer         not null,
  lcode     text            not null,
  line      text            not null,
  field_1   text                null,
  field_2   text                null,
  field_3   text                null,
  field_4   text                null,
primary key ( rowid ),
check ( rowid regexp '^t:mr:ln:R=\\d+$'),
unique ( dskey, line_nr ),
foreign key ( lcode ) references jzr_mirror_lcodes ( lcode ) );`,
      //.......................................................................................................
      SQL`create table jzr_mirror_triples (
  rowid     text    unique  not null,
  ref       text            not null,
  s         text            not null,
  v         text            not null,
  o         json            not null,
primary key ( rowid ),
check ( rowid regexp '^t:mr:3pl:R=\\d+$' ),
unique ( ref, s, v, o ),
foreign key ( ref ) references jzr_mirror_lines ( rowid )
);`
    ];

    //---------------------------------------------------------------------------------------------------------
    //.......................................................................................................
    /* aggregate table for all rowids goes here */
    //.......................................................................................................
    Jzrbvfs.statements = {
      //.......................................................................................................
      insert_jzr_datasource: SQL`insert into jzr_datasources ( rowid, dskey, path ) values ( $rowid, $dskey, $path )
  on conflict ( dskey ) do update set path = $path;`,
      //.......................................................................................................
      insert_jzr_mirror_lcode: SQL`insert into jzr_mirror_lcodes ( rowid, lcode, comment ) values ( $rowid, $lcode, $comment )
  on conflict ( rowid ) do update set lcode = $lcode, comment = $comment;`,
      //.......................................................................................................
      insert_jzr_mirror_triple: SQL`insert into jzr_mirror_triples ( rowid, ref, s, v, o ) values ( $rowid, $ref, $s, $v, $o )
  on conflict ( ref, s, v, o ) do nothing;`,
      //.......................................................................................................
      populate_jzr_mirror_lines: SQL`insert into jzr_mirror_lines ( rowid, dskey, line_nr, lcode, line, field_1, field_2, field_3, field_4 )
select
  't:mr:ln:R=' || row_number() over ()          as rowid,
  -- ds.dskey || ':L=' || fl.line_nr   as rowid,
  ds.dskey                          as dskey,
  fl.line_nr                        as line_nr,
  fl.lcode                          as lcode,
  fl.line                           as line,
  fl.field_1                        as field_1,
  fl.field_2                        as field_2,
  fl.field_3                        as field_3,
  fl.field_4                        as field_4
from jzr_datasources        as ds
join file_lines( ds.path )  as fl
where true
on conflict ( dskey, line_nr ) do update set line = excluded.line;`
    };

    return Jzrbvfs;

  }).call(this);

  //===========================================================================================================
  TMP_language_services = class TMP_language_services {
    //.........................................................................................................
    remove_pinyin_diacritics(text) {
      return (text.normalize('NFKD')).replace(/\P{L}/gv, '');
    }

    //.........................................................................................................
    extract_atonal_zh_readings(entry) {
      var R, zh_reading;
      // py:zhù, zhe, zhāo, zháo, zhǔ, zī
      R = entry;
      R = R.replace(/^py:/v, '');
      R = R.split(/,\s*/v);
      R = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = R.length; i < len; i++) {
          zh_reading = R[i];
          results.push(this.remove_pinyin_diacritics(zh_reading));
        }
        return results;
      }).call(this);
      R = new Set(R);
      R.delete('null');
      R.delete('@null');
      return [...R];
    }

    //.........................................................................................................
    extract_ja_readings(entry) {
      /* NOTE remove no-readings marker `@null` and contextual readings like -ネン for 縁, -ノウ for 王 */
      var R, reading;
      // 空      hi:そら, あ·(く|き|ける), から, す·(く|かす), むな·しい
      R = entry;
      R = R.replace(/^(?:hi|ka):/v, '');
      R = R.replace(/\s+/gv, '');
      R = R.split(/,\s*/v);
      R = (function() {
        var i, len, results;
        results = [];
        for (i = 0, len = R.length; i < len; i++) {
          reading = R[i];
          if (!reading.startsWith('-')) {
            results.push(reading);
          }
        }
        return results;
      })();
      R = new Set(R);
      R.delete('null');
      R.delete('@null');
      return [...R];
    }

  };

  tmp_language_services = new TMP_language_services();

  //===========================================================================================================
  populate_meaning_mirror_triples = function() {
    var db, total, total_row_count, using_1_connection, using_2_connections;
    db = get_db();
    ({total_row_count} = (db.prepare(SQL`select
    count(*) as total_row_count
  from jzr_mirror_lines
  where true
    and ( dskey = 'dict:meanings' )
    and ( field_1 is not null )
    and ( not field_1 regexp '^@glyphs' );`)).get());
    total = total_row_count * 2/* NOTE estimate */
    // { total_row_count, total, } = { total_row_count: 40086, total: 80172 } # !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    help('Ωjzrsdb___1', {total_row_count, total});
    //.........................................................................................................
    // ### TAINT a convoluted way to get a file path ###
    // ### TAINT make an API call ###
    // dskey = 'dict:meanings'
    // for row from db.walk SQL"select * from jzr_datasources where dskey = $dskey;", { dskey, }
    //   meanings_path = row.path
    //   break
    // #.........................................................................................................
    // count = 0
    // for { lnr: line_nr, line, } from walk_lines_with_positions meanings_path
    //   debug 'Ωjzrsdb___6', line_nr, rpr line
    //   count++
    //   break if count > 10
    //.........................................................................................................
    // triple_count = 0
    // get_triples = ( rowid_in, field_1, field_2, field_3, field_4 ) ->
    //   triple_count++
    //   rowid_out = "t:mr:3pl:R=#{triple_count}"
    //   ref       = rowid_in
    //   s         = "s.#{triple_count}"
    //   v         = "v.#{triple_count}"
    //   o         = "o.#{triple_count}"
    //   yield { rowid_out, ref, s, v, o, }
    //   return null
    //.........................................................................................................
    using_1_connection = function() {
      var brand, populate_jzr_mirror_triples, populate_triples_1_connection;
      //.......................................................................................................
      populate_jzr_mirror_triples = db.prepare(SQL`insert into jzr_mirror_triples ( rowid, ref, s, v, o )
  select
      gt.rowid_out    as rowid,
      gt.ref          as ref,
      gt.s            as s,
      gt.v            as v,
      gt.o            as o
    from jzr_mirror_lines       as ml
    join get_triples( ml.rowid, ml.field_1, ml.field_2, ml.field_3 )  as gt
    where true
      and ( ml.dskey = 'dict:meanings' )
      and ( ml.field_1 is not null )
      and ( ml.field_1 not regexp '^@glyphs' )
      and ( ml.field_3 regexp '^(?:py|hi|ka):' )
  on conflict ( ref, s, v, o ) do nothing;`);
      //.......................................................................................................
      brand = 'BRAND';
      timeit({total, brand}, populate_triples_1_connection = ({progress}) => {
        this._TMP_state.timeit_progress = progress;
        _begin(db.db);
        db.execute(SQL`begin transaction;`);
        populate_jzr_mirror_triples.run();
        db.execute(SQL`commit;`);
        _end(db.db);
        return this._TMP_state.timeit_progress = null;
      });
      //.......................................................................................................
      return null;
    };
    //.........................................................................................................
    using_2_connections = function() {
      var brand, populate_triples_2_connections, query, row_count;
      row_count = 0;
      //.......................................................................................................
      query = SQL`select
    rowid     as rowid,
    field_2   as chr,
    field_3   as entry
  from jzr_mirror_lines
  where true
    and ( dskey = 'dict:meanings' )
    and ( field_1 is not null )
    and ( field_1 not regexp '^@glyphs' )
    and ( field_3 regexp '^(?:py|hi|ka):' )
  ;`;
      //.......................................................................................................
      brand = 'BRAND';
      timeit({total, brand}, populate_triples_2_connections = ({progress}) => {
        var i, len, o, reading, readings, ref, row, rowid, s, v;
        _begin(db.db);
        db.execute(SQL`begin transaction;`);
        for (row of this.walk(query)) {
          v = null;
          //.....................................................................................................
          switch (true) {
            //...................................................................................................
            case row.entry.startsWith('py:'):
              v = 'zh_reading';
              readings = extract_atonal_zh_readings(row.entry);
          }
          if (v == null) {
            // #...................................................................................................
            // when ( row.entry.startsWith 'hi:' ) or ( row.entry.startsWith 'ka:' )
            //   v         = 'ja_reading'
            //   readings  = extract_ja_readings row.entry
            //.....................................................................................................
            continue;
          }
          //.....................................................................................................
          ref = row.rowid;
          s = row.chr;
//.....................................................................................................
          for (i = 0, len = readings.length; i < len; i++) {
            reading = readings[i];
            row_count++;
            rowid = `t:mr:3pl:R=${row_count}`;
            o = reading;
            this.w.statements.insert_jzr_mirror_triple.run({rowid, ref, s, v, o});
            progress();
          }
        }
        //.......................................................................................................
        db.execute(SQL`commit;`);
        return _end(db.db);
      });
      //.......................................................................................................
      return null;
    };
    //.........................................................................................................
    // using_2_connections.call db
    using_1_connection.call(db);
    //.........................................................................................................
    return null;
  };

  _begin = function(db) {};

  // ( db.prepare SQL"pragma journal_mode = wal;"   ).run()
  // ( db.prepare SQL"pragma synchronous  = off;"   ).run()
  // ( db.prepare SQL"pragma foreign_keys = off;"    ).run()
  // # ( db.prepare SQL"pragma busy_timeout = 60000;" ).run() ### time in ms ###
  // ( db.prepare SQL"pragma strict       = off;"    ).run() ### time in ms ###
  // ;null
  _end = function(db) {};

  // ( db.prepare SQL"pragma journal_mode = wal;"   ).run()
  // ( db.prepare SQL"pragma foreign_keys = on;"    ).run()
  // ( db.prepare SQL"pragma busy_timeout = 60000;" ).run() ### time in ms ###
  // ( db.prepare SQL"pragma strict       = on;"    ).run() ### time in ms ###
  // ;null

  //===========================================================================================================
  if (module === require.main) {
    (() => {
      populate_meaning_mirror_triples();
      // demo_source_identifiers()

      // debug 'Ωjzrsdb__12', db = new Bsql3 ':memory:'
      // help 'Ωjzrsdb__13', row for row from ( db.prepare SQL"select 45 * 88;" ).iterate()
      // help 'Ωjzrsdb__14', row for row from ( db.prepare SQL"select 'abc' like 'a%';" ).iterate()
      // help 'Ωjzrsdb__15', row for row from ( db.prepare SQL"select 'abc' regexp '^a';" ).iterate()
      return null;
    })();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUEsU0FBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxxQkFBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSx1QkFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsK0JBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsTUFBQSxFQUFBLHFCQUFBLEVBQUEsSUFBQSxFQUFBLHlCQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxLQUFBOzs7RUFHQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixDQUFBLENBQUUsS0FBRixFQUNFLEtBREYsRUFFRSxJQUZGLEVBR0UsSUFIRixFQUlFLEtBSkYsRUFLRSxNQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxPQVJGLENBQUEsR0FRNEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFSLENBQW9CLG1CQUFwQixDQVI1Qjs7RUFTQSxDQUFBLENBQUUsR0FBRixFQUNFLE9BREYsRUFFRSxJQUZGLEVBR0UsS0FIRixFQUlFLEtBSkYsRUFLRSxJQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxHQVJGLEVBU0UsSUFURixFQVVFLE9BVkYsRUFXRSxHQVhGLENBQUEsR0FXNEIsR0FBRyxDQUFDLEdBWGhDLEVBYkE7Ozs7Ozs7O0VBK0JBLElBQUEsR0FBNEIsT0FBQSxDQUFRLFdBQVIsRUEvQjVCOzs7RUFpQ0EsS0FBQSxHQUE0QixPQUFBLENBQVEsZ0JBQVIsRUFqQzVCOzs7RUFtQ0EsU0FBQSxHQUE0QixPQUFBLENBQVEsMkNBQVIsRUFuQzVCOzs7RUFxQ0EsQ0FBQSxDQUFFLEtBQUYsRUFDRSxHQURGLENBQUEsR0FDZ0MsU0FBUyxDQUFDLFFBQVEsQ0FBQyxhQUFuQixDQUFBLENBRGhDLEVBckNBOzs7RUF3Q0EsQ0FBQSxDQUFFLFNBQUYsRUFDRSxlQURGLENBQUEsR0FDZ0MsU0FBUyxDQUFDLGlCQUFWLENBQUEsQ0FEaEMsRUF4Q0E7OztFQTJDQSxDQUFBLENBQUUseUJBQUYsQ0FBQSxHQUFnQyxTQUFTLENBQUMsUUFBUSxDQUFDLHVCQUFuQixDQUFBLENBQWhDLEVBM0NBOzs7RUE2Q0EsQ0FBQSxDQUFFLFdBQUYsQ0FBQSxHQUFnQyxTQUFTLENBQUMsUUFBUSxDQUFDLG9CQUFuQixDQUFBLENBQWhDOztFQUNBLFdBQUEsR0FBZ0MsSUFBSSxXQUFKLENBQUE7O0VBQ2hDLE1BQUEsR0FBZ0MsUUFBQSxDQUFBLEdBQUUsQ0FBRixDQUFBO1dBQVksV0FBVyxDQUFDLE1BQVosQ0FBbUIsR0FBQSxDQUFuQjtFQUFaLEVBL0NoQzs7O0VBbURBLHVCQUFBLEdBQTBCLFFBQUEsQ0FBQSxDQUFBO0FBQzFCLFFBQUEsaUJBQUEsRUFBQSxzQkFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBO0lBQUUsQ0FBQSxDQUFFLGlCQUFGLENBQUEsR0FBOEIsU0FBUyxDQUFDLHdCQUFWLENBQUEsQ0FBOUI7SUFDQSxDQUFBLENBQUUsc0JBQUYsQ0FBQSxHQUE4QixTQUFTLENBQUMsOEJBQVYsQ0FBQSxDQUE5QjtBQUNBO0FBQUE7SUFBQSxLQUFBLFdBQUE7O21CQUNFLEtBQUEsQ0FBTSxhQUFOLEVBQXFCLEdBQXJCLEVBQTBCLEtBQTFCO0lBREYsQ0FBQTs7RUFId0IsRUFuRDFCOzs7Ozs7Ozs7Ozs7Ozs7RUFxRUEsU0FBQSxHQUFZLFFBQUEsQ0FBQSxDQUFBO0FBQ1osUUFBQTtJQUFFLENBQUEsR0FBa0MsQ0FBQTtJQUNsQyxDQUFDLENBQUMsSUFBRixHQUFrQyxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsSUFBeEI7SUFDbEMsQ0FBQyxDQUFDLEVBQUYsR0FBa0MsSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFDLENBQUMsSUFBWixFQUFrQixRQUFsQixFQUZwQzs7SUFJRSxDQUFDLENBQUMsS0FBRixHQUFrQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxJQUFaLEVBQWtCLE9BQWxCO0lBQ2xDLENBQUMsQ0FBRSxlQUFGLENBQUQsR0FBa0MsSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFDLENBQUMsS0FBWixFQUFtQixzQkFBbkI7SUFDbEMsQ0FBQyxDQUFFLHVCQUFGLENBQUQsR0FBa0MsSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFDLENBQUMsS0FBWixFQUFtQixvREFBbkI7QUFDbEMsV0FBTztFQVJHLEVBckVaOzs7RUFnRkEsTUFBQSxHQUFTLFFBQUEsQ0FBQSxDQUFBO0FBQ1QsUUFBQTtJQUFFLEtBQUEsR0FBUSxTQUFBLENBQUE7QUFDUixXQUFPLE9BQU8sQ0FBQyxJQUFSLENBQWEsS0FBSyxDQUFDLEVBQW5CO0VBRkE7O0VBTUg7O0lBQU4sTUFBQSxRQUFBLFFBQXNCLE1BQXRCLENBQUE7O01BcUdTLE9BQU4sSUFBTSxDQUFBLEdBQUUsQ0FBRixDQUFBLEVBQUE7OztBQUNULFlBQUE7UUFFSSxDQUFBLFFBSEQsQ0FBQSxJQUdLLENBQU0sR0FBQSxDQUFOO1FBQ0osSUFBRyxDQUFDLENBQUMsUUFBTDtVQUNFLENBQUMsQ0FBQyxpQ0FBRixDQUFBO1VBQ0EsQ0FBQyxDQUFDLG1DQUFGLENBQUE7VUFDQSxDQUFDLENBQUMsa0NBQUYsQ0FBQTtVQUNBLENBQUMsQ0FBQyxpREFBRixDQUFBLEVBSkY7U0FBQSxNQUFBO1VBTUUsSUFBQSxDQUFLLGFBQUwsRUFBb0Isd0JBQXBCO1VBQ0EsS0FBQSxDQUFNLGFBQU4sRUFBcUIsQ0FBQyxDQUFDLFFBQXZCO1VBQ0EsS0FBQSxDQUFNLGFBQU4sRUFBcUIsQ0FBQyxDQUFDLFFBQXZCLEVBUkY7O0FBU0EsZUFBTztNQWJGLENBbkdUOzs7TUFtSEUsaUNBQW1DLENBQUEsQ0FBQTtBQUNyQyxZQUFBLEtBQUEsRUFBQTtRQUFJLEtBQUEsR0FBUSxTQUFBLENBQUE7UUFDUixLQUFBLEdBQVE7UUFBMEIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFsQyxDQUFzQztVQUFFLEtBQUEsRUFBTyxVQUFUO1VBQXFCLEtBQXJCO1VBQTRCLElBQUEsRUFBTSxLQUFLLENBQUUsS0FBRjtRQUF2QyxDQUF0QyxFQUR0Qzs7ZUFHSztNQUpnQyxDQW5IckM7Ozs7Ozs7Ozs7TUFpSUUsbUNBQXFDLENBQUEsQ0FBQTtRQUNuQyxJQUFDLENBQUEsVUFBVSxDQUFDLHVCQUF1QixDQUFDLEdBQXBDLENBQXdDO1VBQUUsS0FBQSxFQUFPLFVBQVQ7VUFBcUIsS0FBQSxFQUFPLEdBQTVCO1VBQWlDLE9BQUEsRUFBUztRQUExQyxDQUF4QztRQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsdUJBQXVCLENBQUMsR0FBcEMsQ0FBd0M7VUFBRSxLQUFBLEVBQU8sVUFBVDtVQUFxQixLQUFBLEVBQU8sR0FBNUI7VUFBaUMsT0FBQSxFQUFTO1FBQTFDLENBQXhDO1FBQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFwQyxDQUF3QztVQUFFLEtBQUEsRUFBTyxVQUFUO1VBQXFCLEtBQUEsRUFBTyxHQUE1QjtVQUFpQyxPQUFBLEVBQVM7UUFBMUMsQ0FBeEM7ZUFDQztNQUprQyxDQWpJdkM7OztNQXdJRSxrQ0FBb0MsQ0FBQSxDQUFBO1FBQ2xDLElBQUMsQ0FBQSxVQUFVLENBQUMseUJBQXlCLENBQUMsR0FBdEMsQ0FBQTtlQUNDO01BRmlDLENBeEl0Qzs7O01BNklFLGlEQUFtRCxDQUFBLENBQUEsRUFBQSxDQTdJckQ7Ozs7O01BaUpFLFVBQVksQ0FBQSxDQUFBO0FBQ2QsWUFBQTthQURFLENBQUEsVUFDRSxDQUFBO1FBQ0EsSUFBQyxDQUFBLFVBQUQsR0FBYztVQUFFLFlBQUEsRUFBYztRQUFoQjtRQUNkLEVBQUEsR0FBSyxLQUZUOztRQUtJLElBQUMsQ0FBQSxlQUFELENBQ0U7VUFBQSxJQUFBLEVBQWdCLFFBQWhCO1VBQ0EsYUFBQSxFQUFnQixJQURoQjtVQUVBLElBQUEsRUFBTSxRQUFBLENBQUUsT0FBRixFQUFXLElBQVgsQ0FBQTtZQUFxQixJQUFLLENBQUUsSUFBSSxNQUFKLENBQVcsT0FBWCxFQUFvQixHQUFwQixDQUFGLENBQTJCLENBQUMsSUFBNUIsQ0FBaUMsSUFBakMsQ0FBTDtxQkFBa0QsRUFBbEQ7YUFBQSxNQUFBO3FCQUF5RCxFQUF6RDs7VUFBckI7UUFGTixDQURGLEVBTEo7O1FBV0ksSUFBQyxDQUFBLHFCQUFELENBQ0U7VUFBQSxJQUFBLEVBQWdCLGFBQWhCO1VBQ0EsT0FBQSxFQUFnQixDQUFFLFNBQUYsQ0FEaEI7VUFFQSxVQUFBLEVBQWdCLENBQUUsTUFBRixDQUZoQjtVQUdBLElBQUEsRUFBTSxTQUFBLENBQUUsSUFBRixDQUFBO0FBQ1osZ0JBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUE7WUFBUSxRQUFBLEdBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxtRUFBWCxFQUFuQjs7WUFFUSxLQUFBLDBDQUFBOztjQUNFLElBQWdCLGVBQWhCO0FBQUEseUJBQUE7O2NBQ0EsSUFBWSxPQUFBLEtBQVcsRUFBdkI7QUFBQSx5QkFBQTs7Y0FDQSxNQUFNLENBQUEsQ0FBRSxPQUFGLENBQUE7WUFIUjttQkFJQztVQVBHO1FBSE4sQ0FERixFQVhKOztRQXlCSSxJQUFDLENBQUEscUJBQUQsQ0FDRTtVQUFBLElBQUEsRUFBYyxZQUFkO1VBQ0EsT0FBQSxFQUFjLENBQUUsU0FBRixFQUFhLE9BQWIsRUFBc0IsTUFBdEIsRUFBOEIsU0FBOUIsRUFBeUMsU0FBekMsRUFBb0QsU0FBcEQsRUFBK0QsU0FBL0QsQ0FEZDtVQUVBLFVBQUEsRUFBYyxDQUFFLE1BQUYsQ0FGZDtVQUdBLElBQUEsRUFBTSxTQUFBLENBQUUsSUFBRixDQUFBO0FBQ1osZ0JBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQTtZQUFRLEtBQUEsb0NBQUE7ZUFBSTtnQkFBRSxHQUFBLEVBQUssT0FBUDtnQkFBZ0IsSUFBaEI7Z0JBQXNCO2NBQXRCO2NBQ0YsT0FBQSxHQUFVLE9BQUEsR0FBVSxPQUFBLEdBQVUsT0FBQSxHQUFVO0FBQ3hDLHNCQUFPLElBQVA7QUFBQSxxQkFDTyxRQUFRLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FEUDtrQkFFSSxLQUFBLEdBQVE7QUFETDtBQURQLHFCQUdPLFFBQVEsQ0FBQyxJQUFULENBQWMsSUFBZCxDQUhQO2tCQUlJLEtBQUEsR0FBUTtBQURMO0FBSFA7a0JBTUksS0FBQSxHQUFRO2tCQUNSLENBQUUsT0FBRixFQUFXLE9BQVgsRUFBb0IsT0FBcEIsRUFBNkIsT0FBN0IsQ0FBQSxHQUEwQyxJQUFJLENBQUMsS0FBTCxDQUFXLElBQVg7O29CQUMxQyxVQUFXOzs7b0JBQ1gsVUFBVzs7O29CQUNYLFVBQVc7OztvQkFDWCxVQUFXOztBQVhmO2NBWUEsTUFBTSxDQUFBLENBQUUsT0FBRixFQUFXLEtBQVgsRUFBa0IsSUFBbEIsRUFBd0IsT0FBeEIsRUFBaUMsT0FBakMsRUFBMEMsT0FBMUMsRUFBbUQsT0FBbkQsQ0FBQTtZQWRSO21CQWVDO1VBaEJHO1FBSE4sQ0FERixFQXpCSjs7UUErQ0ksSUFBQyxDQUFBLHFCQUFELENBQ0U7VUFBQSxJQUFBLEVBQWMsYUFBZDtVQUNBLFVBQUEsRUFBYyxDQUFFLFVBQUYsRUFBYyxTQUFkLEVBQXlCLFNBQXpCLEVBQW9DLFNBQXBDLEVBQStDLFNBQS9DLENBRGQ7VUFFQSxPQUFBLEVBQWMsQ0FBRSxXQUFGLEVBQWUsS0FBZixFQUFzQixHQUF0QixFQUEyQixHQUEzQixFQUFnQyxHQUFoQyxDQUZkO1VBR0EsSUFBQSxFQUFNLFNBQUEsQ0FBRSxRQUFGLEVBQVksT0FBWixFQUFxQixPQUFyQixFQUE4QixPQUE5QixFQUF1QyxPQUF2QyxDQUFBO1lBQ0osT0FBVyxFQUFFLENBQUMsV0FBSCxDQUFlLFFBQWYsRUFBeUIsT0FBekIsRUFBa0MsT0FBbEMsRUFBMkMsT0FBM0MsRUFBb0QsT0FBcEQ7bUJBQ1Y7VUFGRztRQUhOLENBREYsRUEvQ0o7O2VBdURLO01BeERTLENBakpkOzs7TUE0TWUsRUFBYixXQUFhLENBQUUsUUFBRixFQUFZLE9BQVosRUFBcUIsT0FBckIsRUFBOEIsT0FBOUIsRUFBdUMsT0FBdkMsQ0FBQTtBQUNmLFlBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUEsQ0FBQSxFQUFBO1FBQUksR0FBQSxHQUFnQjtRQUNoQixDQUFBLEdBQWdCO1FBQ2hCLENBQUEsR0FBZ0I7UUFDaEIsQ0FBQSxHQUFnQjtRQUNoQixLQUFBLEdBQWdCLFFBSnBCOztBQU1JLGdCQUFPLElBQVA7O0FBQUEsZUFFTyxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFqQixDQUZQO1lBR0ksQ0FBQSxHQUFZO1lBQ1osUUFBQSxHQUFZLHFCQUFxQixDQUFDLDBCQUF0QixDQUFpRCxLQUFqRDtBQUZUOztBQUZQLGVBTU8sQ0FBRSxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFqQixDQUFGLENBQUEsSUFBOEIsQ0FBRSxLQUFLLENBQUMsVUFBTixDQUFpQixLQUFqQixDQUFGLENBTnJDO1lBT0ksQ0FBQSxHQUFZO1lBQ1osUUFBQSxHQUFZLHFCQUFxQixDQUFDLG1CQUF0QixDQUEwQyxLQUExQztBQVJoQixTQU5KOztRQWdCSSxJQUFHLFNBQUg7VUFDRSxLQUFBLDBDQUFBOztZQUNFLElBQUMsQ0FBQSxVQUFVLENBQUMsWUFBWjtZQUNBLFNBQUEsR0FBWSxDQUFBLFdBQUEsQ0FBQSxDQUFjLElBQUMsQ0FBQSxVQUFVLENBQUMsWUFBMUIsQ0FBQTtZQUNaLENBQUEsR0FBWTtZQUNaLE1BQU0sQ0FBQSxDQUFFLFNBQUYsRUFBYSxHQUFiLEVBQWtCLENBQWxCLEVBQXFCLENBQXJCLEVBQXdCLENBQXhCLENBQUE7O2tCQUNLLENBQUM7O1VBTGQsQ0FERjtTQWhCSjs7Ozs7Ozs7O0FBK0JJLGVBQU87TUFoQ0k7O0lBOU1mOzs7SUFHRSxPQUFDLENBQUEsUUFBRCxHQUFXOzs7SUFHWCxPQUFDLENBQUEsS0FBRCxHQUFROztNQUdOLEdBQUcsQ0FBQTs7Ozs7dUNBQUEsQ0FIRzs7TUFXTixHQUFHLENBQUE7Ozs7Ozt1Q0FBQSxDQVhHOztNQW9CTixHQUFHLENBQUE7Ozs7Ozs7Ozs7Ozs7OzsrREFBQSxDQXBCRzs7TUFzQ04sR0FBRyxDQUFBOzs7Ozs7Ozs7O0VBQUEsQ0F0Q0c7Ozs7Ozs7SUF5RFIsT0FBQyxDQUFBLFVBQUQsR0FHRSxDQUFBOztNQUFBLHFCQUFBLEVBQXVCLEdBQUcsQ0FBQTttREFBQSxDQUExQjs7TUFLQSx1QkFBQSxFQUF5QixHQUFHLENBQUE7eUVBQUEsQ0FMNUI7O01BVUEsd0JBQUEsRUFBMEIsR0FBRyxDQUFBOzBDQUFBLENBVjdCOztNQWVBLHlCQUFBLEVBQTJCLEdBQUcsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7O2tFQUFBO0lBZjlCOzs7O2dCQXhKSjs7O0VBdVVNLHdCQUFOLE1BQUEsc0JBQUEsQ0FBQTs7SUFFRSx3QkFBMEIsQ0FBRSxJQUFGLENBQUE7YUFBWSxDQUFFLElBQUksQ0FBQyxTQUFMLENBQWUsTUFBZixDQUFGLENBQXlCLENBQUMsT0FBMUIsQ0FBa0MsU0FBbEMsRUFBNkMsRUFBN0M7SUFBWixDQUQ1Qjs7O0lBR0UsMEJBQTRCLENBQUUsS0FBRixDQUFBO0FBQzlCLFVBQUEsQ0FBQSxFQUFBLFVBQUE7O01BQ0ksQ0FBQSxHQUFJO01BQ0osQ0FBQSxHQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsT0FBVixFQUFtQixFQUFuQjtNQUNKLENBQUEsR0FBSSxDQUFDLENBQUMsS0FBRixDQUFRLE9BQVI7TUFDSixDQUFBOztBQUFNO1FBQUEsS0FBQSxtQ0FBQTs7dUJBQUUsSUFBQyxDQUFBLHdCQUFELENBQTBCLFVBQTFCO1FBQUYsQ0FBQTs7O01BQ04sQ0FBQSxHQUFJLElBQUksR0FBSixDQUFRLENBQVI7TUFDSixDQUFDLENBQUMsTUFBRixDQUFTLE1BQVQ7TUFDQSxDQUFDLENBQUMsTUFBRixDQUFTLE9BQVQ7QUFDQSxhQUFPLENBQUUsR0FBQSxDQUFGO0lBVG1CLENBSDlCOzs7SUFjRSxtQkFBcUIsQ0FBRSxLQUFGLENBQUEsRUFBQTs7QUFDdkIsVUFBQSxDQUFBLEVBQUEsT0FBQTs7TUFDSSxDQUFBLEdBQUk7TUFDSixDQUFBLEdBQUksQ0FBQyxDQUFDLE9BQUYsQ0FBVSxjQUFWLEVBQTBCLEVBQTFCO01BQ0osQ0FBQSxHQUFJLENBQUMsQ0FBQyxPQUFGLENBQVUsT0FBVixFQUFtQixFQUFuQjtNQUNKLENBQUEsR0FBSSxDQUFDLENBQUMsS0FBRixDQUFRLE9BQVI7TUFFSixDQUFBOztBQUFNO1FBQUEsS0FBQSxtQ0FBQTs7Y0FBOEIsQ0FBSSxPQUFPLENBQUMsVUFBUixDQUFtQixHQUFuQjt5QkFBbEM7O1FBQUEsQ0FBQTs7O01BQ04sQ0FBQSxHQUFJLElBQUksR0FBSixDQUFRLENBQVI7TUFDSixDQUFDLENBQUMsTUFBRixDQUFTLE1BQVQ7TUFDQSxDQUFDLENBQUMsTUFBRixDQUFTLE9BQVQ7QUFDQSxhQUFPLENBQUUsR0FBQSxDQUFGO0lBWFk7O0VBZnZCOztFQTJCQSxxQkFBQSxHQUF3QixJQUFJLHFCQUFKLENBQUEsRUFsV3hCOzs7RUFxV0EsK0JBQUEsR0FBa0MsUUFBQSxDQUFBLENBQUE7QUFDbEMsUUFBQSxFQUFBLEVBQUEsS0FBQSxFQUFBLGVBQUEsRUFBQSxrQkFBQSxFQUFBO0lBQUUsRUFBQSxHQUFLLE1BQUEsQ0FBQTtJQUNMLENBQUEsQ0FBRSxlQUFGLENBQUEsR0FBdUIsQ0FBRSxFQUFFLENBQUMsT0FBSCxDQUFXLEdBQUcsQ0FBQTs7Ozs7OzBDQUFBLENBQWQsQ0FBRixDQU8wQixDQUFDLEdBUDNCLENBQUEsQ0FBdkI7SUFRQSxLQUFBLEdBQVEsZUFBQSxHQUFrQixDQUFFLG1CQVQ5Qjs7SUFXRSxJQUFBLENBQUssYUFBTCxFQUFvQixDQUFFLGVBQUYsRUFBbUIsS0FBbkIsQ0FBcEIsRUFYRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFxQ0Usa0JBQUEsR0FBcUIsUUFBQSxDQUFBLENBQUE7QUFDdkIsVUFBQSxLQUFBLEVBQUEsMkJBQUEsRUFBQSw2QkFBQTs7TUFDSSwyQkFBQSxHQUE4QixFQUFFLENBQUMsT0FBSCxDQUFXLEdBQUcsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7MENBQUEsQ0FBZCxFQURsQzs7TUFtQkksS0FBQSxHQUFRO01BQ1IsTUFBQSxDQUFPLENBQUUsS0FBRixFQUFTLEtBQVQsQ0FBUCxFQUEwQiw2QkFBQSxHQUFnQyxDQUFDLENBQUUsUUFBRixDQUFELENBQUEsR0FBQTtRQUN4RCxJQUFDLENBQUEsVUFBVSxDQUFDLGVBQVosR0FBOEI7UUFDOUIsTUFBQSxDQUFPLEVBQUUsQ0FBQyxFQUFWO1FBQWMsRUFBRSxDQUFDLE9BQUgsQ0FBVyxHQUFHLENBQUEsa0JBQUEsQ0FBZDtRQUNkLDJCQUEyQixDQUFDLEdBQTVCLENBQUE7UUFDQSxFQUFFLENBQUMsT0FBSCxDQUFXLEdBQUcsQ0FBQSxPQUFBLENBQWQ7UUFBeUIsSUFBQSxDQUFLLEVBQUUsQ0FBQyxFQUFSO2VBQ3pCLElBQUMsQ0FBQSxVQUFVLENBQUMsZUFBWixHQUE4QjtNQUwwQixDQUExRCxFQXBCSjs7YUEyQks7SUE1QmtCLEVBckN2Qjs7SUFtRUUsbUJBQUEsR0FBc0IsUUFBQSxDQUFBLENBQUE7QUFDeEIsVUFBQSxLQUFBLEVBQUEsOEJBQUEsRUFBQSxLQUFBLEVBQUE7TUFBSSxTQUFBLEdBQVksRUFBaEI7O01BRUksS0FBQSxHQUFRLEdBQUcsQ0FBQTs7Ozs7Ozs7OztHQUFBLEVBRmY7O01BZUksS0FBQSxHQUFRO01BQ1IsTUFBQSxDQUFPLENBQUUsS0FBRixFQUFTLEtBQVQsQ0FBUCxFQUEwQiw4QkFBQSxHQUFpQyxDQUFDLENBQUUsUUFBRixDQUFELENBQUEsR0FBQTtBQUMvRCxZQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsQ0FBQSxFQUFBO1FBQU0sTUFBQSxDQUFPLEVBQUUsQ0FBQyxFQUFWO1FBQWMsRUFBRSxDQUFDLE9BQUgsQ0FBVyxHQUFHLENBQUEsa0JBQUEsQ0FBZDtRQUNkLEtBQUEsdUJBQUE7VUFDRSxDQUFBLEdBQUksS0FBWjs7QUFFUSxrQkFBTyxJQUFQOztBQUFBLGlCQUVPLEdBQUcsQ0FBQyxLQUFLLENBQUMsVUFBVixDQUFxQixLQUFyQixDQUZQO2NBR0ksQ0FBQSxHQUFZO2NBQ1osUUFBQSxHQUFZLDBCQUFBLENBQTJCLEdBQUcsQ0FBQyxLQUEvQjtBQUpoQjtVQVVBLElBQWdCLFNBQWhCOzs7Ozs7QUFBQSxxQkFBQTtXQVpSOztVQWNRLEdBQUEsR0FBUSxHQUFHLENBQUM7VUFDWixDQUFBLEdBQVEsR0FBRyxDQUFDLElBZnBCOztVQWlCUSxLQUFBLDBDQUFBOztZQUNFLFNBQUE7WUFDQSxLQUFBLEdBQVEsQ0FBQSxXQUFBLENBQUEsQ0FBYyxTQUFkLENBQUE7WUFDUixDQUFBLEdBQVE7WUFDUixJQUFDLENBQUEsQ0FBQyxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxHQUF2QyxDQUEyQyxDQUFFLEtBQUYsRUFBUyxHQUFULEVBQWMsQ0FBZCxFQUFpQixDQUFqQixFQUFvQixDQUFwQixDQUEzQztZQUNBLFFBQUEsQ0FBQTtVQUxGO1FBbEJGLENBRE47O1FBMEJNLEVBQUUsQ0FBQyxPQUFILENBQVcsR0FBRyxDQUFBLE9BQUEsQ0FBZDtlQUF5QixJQUFBLENBQUssRUFBRSxDQUFDLEVBQVI7TUEzQmdDLENBQTNELEVBaEJKOzthQTZDSztJQTlDbUIsRUFuRXhCOzs7SUFvSEUsa0JBQWtCLENBQUMsSUFBbkIsQ0FBd0IsRUFBeEIsRUFwSEY7O1dBc0hHO0VBdkgrQjs7RUF5SGxDLE1BQUEsR0FBUyxRQUFBLENBQUUsRUFBRixDQUFBLEVBQUEsRUE5ZFQ7Ozs7Ozs7O0VBc2VBLElBQUEsR0FBTyxRQUFBLENBQUUsRUFBRixDQUFBLEVBQUEsRUF0ZVA7Ozs7Ozs7OztFQWdmQSxJQUFHLE1BQUEsS0FBVSxPQUFPLENBQUMsSUFBckI7SUFBa0MsQ0FBQSxDQUFBLENBQUEsR0FBQTtNQUNoQywrQkFBQSxDQUFBLEVBQUY7Ozs7Ozs7YUFPRztJQVIrQixDQUFBLElBQWxDOztBQWhmQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCdcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5HVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xueyBhbGVydFxuICBkZWJ1Z1xuICBoZWxwXG4gIGluZm9cbiAgcGxhaW5cbiAgcHJhaXNlXG4gIHVyZ2VcbiAgd2FyblxuICB3aGlzcGVyIH0gICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ2ppenVyYS1zb3VyY2VzLWRiJ1xueyBycHJcbiAgaW5zcGVjdFxuICBlY2hvXG4gIHdoaXRlXG4gIGdyZWVuXG4gIGJsdWVcbiAgZ29sZFxuICBncmV5XG4gIHJlZFxuICBib2xkXG4gIHJldmVyc2VcbiAgbG9nICAgICB9ICAgICAgICAgICAgICAgPSBHVVkudHJtXG4jIHsgZiB9ICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvZWZmc3RyaW5nJ1xuIyB3cml0ZSAgICAgICAgICAgICAgICAgICAgID0gKCBwICkgLT4gcHJvY2Vzcy5zdGRvdXQud3JpdGUgcFxuIyB7IG5mYSB9ICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL25vcm1hbGl6ZS1mdW5jdGlvbi1hcmd1bWVudHMnXG4jIEdUTkcgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvZ3V5LXRlc3QtTkcnXG4jIHsgVGVzdCAgICAgICAgICAgICAgICAgIH0gPSBHVE5HXG4jIEZTICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOmZzJ1xuUEFUSCAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6cGF0aCdcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQnNxbDMgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2JldHRlci1zcWxpdGUzJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5TRk1PRFVMRVMgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2JyaWNhYnJhYy1zZm1vZHVsZXMnXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgRGJyaWMsXG4gIFNRTCwgICAgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2RicmljKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBKZXRzdHJlYW0sXG4gIEFzeW5jX2pldHN0cmVhbSwgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2pldHN0cmVhbSgpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBCZW5jaG1hcmtlciwgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9iZW5jaG1hcmtpbmcoKVxuYmVuY2htYXJrZXIgICAgICAgICAgICAgICAgICAgPSBuZXcgQmVuY2htYXJrZXIoKVxudGltZWl0ICAgICAgICAgICAgICAgICAgICAgICAgPSAoIFAuLi4gKSAtPiBiZW5jaG1hcmtlci50aW1laXQgUC4uLlxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZGVtb19zb3VyY2VfaWRlbnRpZmllcnMgPSAtPlxuICB7IGV4cGFuZF9kaWN0aW9uYXJ5LCAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9kaWN0aW9uYXJ5X3Rvb2xzKClcbiAgeyBnZXRfbG9jYWxfZGVzdGluYXRpb25zLCB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfZ2V0X2xvY2FsX2Rlc3RpbmF0aW9ucygpXG4gIGZvciBrZXksIHZhbHVlIG9mIGdldF9sb2NhbF9kZXN0aW5hdGlvbnMoKVxuICAgIGRlYnVnICfOqWp6cnNkYl9fXzEnLCBrZXksIHZhbHVlXG4gICMgY2FuIGFwcGVuZCBsaW5lIG51bWJlcnMgdG8gZmlsZXMgYXMgaW46XG4gICMgJ2RpY3Q6bWVhbmluZ3MuMTpMPTEzMzMyJ1xuICAjICdkaWN0OnVjZDE0MC4xOnVoZGlkeDpMPTEyMzQnXG4gICMgcm93aWRzOiAndDpqZm06Uj0xJ1xuICAjIGFyZWY6IGxhYmVscyB0aGlzIHByb3hpbWFsIHBvaW50IGluIHRoZSBkYXRhIHNldCBhcyBhbiBvcmlnaW5cbiAgIyBtcmVmOiBpZGVudGlmaWVzIGJvdGggdGhlIHByb3hpbWFsIGFuZCB0aGUgZGlzdGFsIGVuZFxuICAjIHpyZWY6IGlkZW50aWZpZXMgdGhlIGRpc3RhbCBzb3VyY2Ugb2YgYSBwaWVjZSBvZiBkYXRhXG4gICMge1xuICAjICAgJ2RpY3Q6bWVhbmluZ3MnOiAgICAgICAgICAnJGp6cmRzL21lYW5pbmcvbWVhbmluZ3MudHh0J1xuICAjICAgJ2RpY3Q6dWNkOnYxNC4wOnVoZGlkeCcgOiAnJGp6cmRzL3VuaWNvZGUub3JnLXVjZC12MTQuMC9VbmloYW5fRGljdGlvbmFyeUluZGljZXMudHh0J1xuICAjICAgfVxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmdldF9wYXRocyA9IC0+XG4gIFIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSB7fVxuICBSLmJhc2UgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5yZXNvbHZlIF9fZGlybmFtZSwgJy4uJ1xuICBSLmRiICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIFIuYmFzZSwgJ2p6ci5kYidcbiAgIyBSLmRiICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gJy9kZXYvc2htL2p6ci5kYidcbiAgUi5qenJkcyAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBSLmJhc2UsICdqenJkcydcbiAgUlsgJ2RpY3Q6bWVhbmluZ3MnICAgICAgICAgIF0gICA9IFBBVEguam9pbiBSLmp6cmRzLCAnbWVhbmluZy9tZWFuaW5ncy50eHQnXG4gIFJbICdkaWN0OnVjZDp2MTQuMDp1aGRpZHgnICBdICAgPSBQQVRILmpvaW4gUi5qenJkcywgJ3VuaWNvZGUub3JnLXVjZC12MTQuMC9VbmloYW5fRGljdGlvbmFyeUluZGljZXMudHh0J1xuICByZXR1cm4gUlxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmdldF9kYiA9IC0+XG4gIHBhdGhzID0gZ2V0X3BhdGhzKClcbiAgcmV0dXJuIEp6cmJ2ZnMub3BlbiBwYXRocy5kYlxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgSnpyYnZmcyBleHRlbmRzIERicmljXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAZGJfY2xhc3M6IEJzcWwzXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAYnVpbGQ6IFtcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9kYXRhc291cmNlcyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGRza2V5ICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHBhdGggICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6ZHM6Uj1cXFxcZCskJykpO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX21pcnJvcl9sY29kZXMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBsY29kZSAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBjb21tZW50ICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCBsY29kZSByZWdleHAgJ15bYS16QS1aXStbYS16QS1aMC05XSokJyApLFxuICAgICAgY2hlY2sgKCByb3dpZCA9ICd0OmxjOlY9JyB8fCBsY29kZSApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX2xpbmVzIChcbiAgICAgICAgLS0gJ3Q6amZtOidcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcmVmICAgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggZHNrZXkgfHwgJzpMPScgfHwgbGluZV9uciApIHZpcnR1YWwsXG4gICAgICAgIGRza2V5ICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmVfbnIgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxjb2RlICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmUgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpZWxkXzEgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgIGZpZWxkXzIgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgIGZpZWxkXzMgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgIGZpZWxkXzQgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bXI6bG46Uj1cXFxcZCskJyksXG4gICAgICB1bmlxdWUgKCBkc2tleSwgbGluZV9uciApLFxuICAgICAgZm9yZWlnbiBrZXkgKCBsY29kZSApIHJlZmVyZW5jZXMganpyX21pcnJvcl9sY29kZXMgKCBsY29kZSApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX3RyaXBsZXMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByZWYgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBzICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICB2ICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBvICAgICAgICAganNvbiAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCByb3dpZCByZWdleHAgJ150Om1yOjNwbDpSPVxcXFxkKyQnICksXG4gICAgICB1bmlxdWUgKCByZWYsIHMsIHYsIG8gKSxcbiAgICAgIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xpbmVzICggcm93aWQgKVxuICAgICAgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyMjIGFnZ3JlZ2F0ZSB0YWJsZSBmb3IgYWxsIHJvd2lkcyBnb2VzIGhlcmUgIyMjXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBzdGF0ZW1lbnRzOlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX2RhdGFzb3VyY2U6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX2RhdGFzb3VyY2VzICggcm93aWQsIGRza2V5LCBwYXRoICkgdmFsdWVzICggJHJvd2lkLCAkZHNrZXksICRwYXRoIClcbiAgICAgICAgb24gY29uZmxpY3QgKCBkc2tleSApIGRvIHVwZGF0ZSBzZXQgcGF0aCA9ICRwYXRoO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX21pcnJvcl9sY29kZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX2xjb2RlcyAoIHJvd2lkLCBsY29kZSwgY29tbWVudCApIHZhbHVlcyAoICRyb3dpZCwgJGxjb2RlLCAkY29tbWVudCApXG4gICAgICAgIG9uIGNvbmZsaWN0ICggcm93aWQgKSBkbyB1cGRhdGUgc2V0IGxjb2RlID0gJGxjb2RlLCBjb21tZW50ID0gJGNvbW1lbnQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfbWlycm9yX3RyaXBsZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3RyaXBsZXMgKCByb3dpZCwgcmVmLCBzLCB2LCBvICkgdmFsdWVzICggJHJvd2lkLCAkcmVmLCAkcywgJHYsICRvIClcbiAgICAgICAgb24gY29uZmxpY3QgKCByZWYsIHMsIHYsIG8gKSBkbyBub3RoaW5nO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfbGluZXMgKCByb3dpZCwgZHNrZXksIGxpbmVfbnIsIGxjb2RlLCBsaW5lLCBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80IClcbiAgICAgIHNlbGVjdFxuICAgICAgICAndDptcjpsbjpSPScgfHwgcm93X251bWJlcigpIG92ZXIgKCkgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgIC0tIGRzLmRza2V5IHx8ICc6TD0nIHx8IGZsLmxpbmVfbnIgICBhcyByb3dpZCxcbiAgICAgICAgZHMuZHNrZXkgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGRza2V5LFxuICAgICAgICBmbC5saW5lX25yICAgICAgICAgICAgICAgICAgICAgICAgYXMgbGluZV9ucixcbiAgICAgICAgZmwubGNvZGUgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGxjb2RlLFxuICAgICAgICBmbC5saW5lICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbGluZSxcbiAgICAgICAgZmwuZmllbGRfMSAgICAgICAgICAgICAgICAgICAgICAgIGFzIGZpZWxkXzEsXG4gICAgICAgIGZsLmZpZWxkXzIgICAgICAgICAgICAgICAgICAgICAgICBhcyBmaWVsZF8yLFxuICAgICAgICBmbC5maWVsZF8zICAgICAgICAgICAgICAgICAgICAgICAgYXMgZmllbGRfMyxcbiAgICAgICAgZmwuZmllbGRfNCAgICAgICAgICAgICAgICAgICAgICAgIGFzIGZpZWxkXzRcbiAgICAgIGZyb20ganpyX2RhdGFzb3VyY2VzICAgICAgICBhcyBkc1xuICAgICAgam9pbiBmaWxlX2xpbmVzKCBkcy5wYXRoICkgIGFzIGZsXG4gICAgICB3aGVyZSB0cnVlXG4gICAgICBvbiBjb25mbGljdCAoIGRza2V5LCBsaW5lX25yICkgZG8gdXBkYXRlIHNldCBsaW5lID0gZXhjbHVkZWQubGluZTtcbiAgICAgIFwiXCJcIlxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQG9wZW46ICggUC4uLiApIC0+XG4gICAgIyMjIFRBSU5UIG5vdCBhIHZlcnkgbmljZSBzb2x1dGlvbiAjIyNcbiAgICAjIyMgVEFJTlQgbmVlZCBtb3JlIGNsYXJpdHkgYWJvdXQgd2hlbiBzdGF0ZW1lbnRzLCBidWlsZCwgaW5pdGlhbGl6ZS4uLiBpcyBwZXJmb3JtZWQgIyMjXG4gICAgUiA9IHN1cGVyIFAuLi5cbiAgICBpZiBSLmlzX2ZyZXNoXG4gICAgICBSLl9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlcygpXG4gICAgICBSLl9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGNvZGVzKClcbiAgICAgIFIuX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9saW5lcygpXG4gICAgICBSLl9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlc19mb3JfbWVhbmluZ3MoKVxuICAgIGVsc2VcbiAgICAgIHdhcm4gJ86panpyc2RiX19fMicsIFwic2tpcHBlZCBkYXRhIGluc2VydGlvblwiXG4gICAgICBkZWJ1ZyAnzqlqenJzZGJfX18zJywgUi5pc19yZWFkeVxuICAgICAgZGVidWcgJ86panpyc2RiX19fNCcsIFIuaXNfZnJlc2hcbiAgICByZXR1cm4gUlxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VzOiAtPlxuICAgIHBhdGhzID0gZ2V0X3BhdGhzKClcbiAgICBkc2tleSA9ICdkaWN0Om1lYW5pbmdzJzsgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEnLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICAjIGRza2V5ID0gJ2RpY3Q6dWNkOnYxNC4wOnVoZGlkeCc7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MicsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIDtudWxsXG5cbiAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgX29uX29wZW5fcG9wdWxhdGVfdmVyYnM6IC0+XG4gICMgICBwYXRocyA9IGdldF9wYXRocygpXG4gICMgICBkc2tleSA9ICdkaWN0Om1lYW5pbmdzJzsgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEnLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgIyAgIGRza2V5ID0gJ2RpY3Q6dWNkOnYxNC4wOnVoZGlkeCc7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MicsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAjICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGNvZGVzOiAtPlxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDpsYzpWPUInLCBsY29kZTogJ0InLCBjb21tZW50OiAnYmxhbmsgbGluZScsICAgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDpsYzpWPUMnLCBsY29kZTogJ0MnLCBjb21tZW50OiAnY29tbWVudCBsaW5lJywgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDpsYzpWPUQnLCBsY29kZTogJ0QnLCBjb21tZW50OiAnZGF0YSBsaW5lJywgICAgfVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzOiAtPlxuICAgIEBzdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9taXJyb3JfbGluZXMucnVuKClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl90cmlwbGVzX2Zvcl9tZWFuaW5nczogLT5cbiAgICAjIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyKClcbiAgICBAX1RNUF9zdGF0ZSA9IHsgdHJpcGxlX2NvdW50OiAwLCB9XG4gICAgbWUgPSBAXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIEBjcmVhdGVfZnVuY3Rpb25cbiAgICAgIG5hbWU6ICAgICAgICAgICAncmVnZXhwJ1xuICAgICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAgIGNhbGw6ICggcGF0dGVybiwgdGV4dCApIC0+IGlmICggKCBuZXcgUmVnRXhwIHBhdHRlcm4sICd2JyApLnRlc3QgdGV4dCApIHRoZW4gMSBlbHNlIDBcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQGNyZWF0ZV90YWJsZV9mdW5jdGlvblxuICAgICAgbmFtZTogICAgICAgICAgICdzcGxpdF93b3JkcydcbiAgICAgIGNvbHVtbnM6ICAgICAgICBbICdrZXl3b3JkJywgXVxuICAgICAgcGFyYW1ldGVyczogICAgIFsgJ2xpbmUnLCBdXG4gICAgICByb3dzOiAoIGxpbmUgKSAtPlxuICAgICAgICBrZXl3b3JkcyA9IGxpbmUuc3BsaXQgLyg/OlxccHtafSspfCgoPzpcXHB7U2NyaXB0PUhhbn0pfCg/OlxccHtMfSspfCg/OlxccHtOfSspfCg/OlxccHtTfSspKS92XG4gICAgICAgICMgZGVidWcgJ86panpyc2RiX19fNScsIGxpbmVfbnIsIHJwciBrZXl3b3Jkc1xuICAgICAgICBmb3Iga2V5d29yZCBpbiBrZXl3b3Jkc1xuICAgICAgICAgIGNvbnRpbnVlIHVubGVzcyBrZXl3b3JkP1xuICAgICAgICAgIGNvbnRpbnVlIGlmIGtleXdvcmQgaXMgJydcbiAgICAgICAgICB5aWVsZCB7IGtleXdvcmQsIH1cbiAgICAgICAgO251bGxcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQGNyZWF0ZV90YWJsZV9mdW5jdGlvblxuICAgICAgbmFtZTogICAgICAgICAnZmlsZV9saW5lcydcbiAgICAgIGNvbHVtbnM6ICAgICAgWyAnbGluZV9ucicsICdsY29kZScsICdsaW5lJywgJ2ZpZWxkXzEnLCAnZmllbGRfMicsICdmaWVsZF8zJywgJ2ZpZWxkXzQnLCBdXG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ3BhdGgnLCBdXG4gICAgICByb3dzOiAoIHBhdGggKSAtPlxuICAgICAgICBmb3IgeyBsbnI6IGxpbmVfbnIsIGxpbmUsIGVvbCwgfSBmcm9tIHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgcGF0aFxuICAgICAgICAgIGZpZWxkXzEgPSBmaWVsZF8yID0gZmllbGRfMyA9IGZpZWxkXzQgPSBudWxsXG4gICAgICAgICAgc3dpdGNoIHRydWVcbiAgICAgICAgICAgIHdoZW4gL15cXHMqJC92LnRlc3QgbGluZVxuICAgICAgICAgICAgICBsY29kZSA9ICdCJ1xuICAgICAgICAgICAgd2hlbiAvXlxccyojL3YudGVzdCBsaW5lXG4gICAgICAgICAgICAgIGxjb2RlID0gJ0MnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGxjb2RlID0gJ0QnXG4gICAgICAgICAgICAgIFsgZmllbGRfMSwgZmllbGRfMiwgZmllbGRfMywgZmllbGRfNCwgXSA9IGxpbmUuc3BsaXQgJ1xcdCdcbiAgICAgICAgICAgICAgZmllbGRfMSA/PSBudWxsXG4gICAgICAgICAgICAgIGZpZWxkXzIgPz0gbnVsbFxuICAgICAgICAgICAgICBmaWVsZF8zID89IG51bGxcbiAgICAgICAgICAgICAgZmllbGRfNCA/PSBudWxsXG4gICAgICAgICAgeWllbGQgeyBsaW5lX25yLCBsY29kZSwgbGluZSwgZmllbGRfMSwgZmllbGRfMiwgZmllbGRfMywgZmllbGRfNCwgfVxuICAgICAgICA7bnVsbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQGNyZWF0ZV90YWJsZV9mdW5jdGlvblxuICAgICAgbmFtZTogICAgICAgICAnZ2V0X3RyaXBsZXMnXG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ3Jvd2lkX2luJywgJ2ZpZWxkXzEnLCAnZmllbGRfMicsICdmaWVsZF8zJywgJ2ZpZWxkXzQnLCBdXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ3Jvd2lkX291dCcsICdyZWYnLCAncycsICd2JywgJ28nLCBdXG4gICAgICByb3dzOiAoIHJvd2lkX2luLCBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80ICkgLT5cbiAgICAgICAgeWllbGQgZnJvbSBtZS5nZXRfdHJpcGxlcyByb3dpZF9pbiwgZmllbGRfMSwgZmllbGRfMiwgZmllbGRfMywgZmllbGRfNFxuICAgICAgICA7bnVsbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGdldF90cmlwbGVzOiAoIHJvd2lkX2luLCBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80ICkgLT5cbiAgICByZWYgICAgICAgICAgID0gcm93aWRfaW5cbiAgICBzICAgICAgICAgICAgID0gZmllbGRfMlxuICAgIHYgICAgICAgICAgICAgPSBudWxsXG4gICAgbyAgICAgICAgICAgICA9IG51bGxcbiAgICBlbnRyeSAgICAgICAgID0gZmllbGRfM1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc3dpdGNoIHRydWVcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHdoZW4gZW50cnkuc3RhcnRzV2l0aCAncHk6J1xuICAgICAgICB2ICAgICAgICAgPSAnemhfcmVhZGluZydcbiAgICAgICAgcmVhZGluZ3MgID0gdG1wX2xhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfYXRvbmFsX3poX3JlYWRpbmdzIGVudHJ5XG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB3aGVuICggZW50cnkuc3RhcnRzV2l0aCAnaGk6JyApIG9yICggZW50cnkuc3RhcnRzV2l0aCAna2E6JyApXG4gICAgICAgIHYgICAgICAgICA9ICdqYV9yZWFkaW5nJ1xuICAgICAgICByZWFkaW5ncyAgPSB0bXBfbGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9qYV9yZWFkaW5ncyBlbnRyeVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIHY/XG4gICAgICBmb3IgcmVhZGluZyBpbiByZWFkaW5nc1xuICAgICAgICBAX1RNUF9zdGF0ZS50cmlwbGVfY291bnQrK1xuICAgICAgICByb3dpZF9vdXQgPSBcInQ6bXI6M3BsOlI9I3tAX1RNUF9zdGF0ZS50cmlwbGVfY291bnR9XCJcbiAgICAgICAgbyAgICAgICAgID0gcmVhZGluZ1xuICAgICAgICB5aWVsZCB7IHJvd2lkX291dCwgcmVmLCBzLCB2LCBvLCB9XG4gICAgICAgIEBfVE1QX3N0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgICAgICAjIEB3LnN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfdHJpcGxlLnJ1biB7IHJvd2lkLCByZWYsIHMsIHYsIG8sIH1cbiAgICAgICAgIyBwcm9ncmVzcygpXG4gICAgIyByb3dpZF9vdXQgPSBcInQ6bXI6M3BsOlI9I3t0cmlwbGVfY291bnR9XCJcbiAgICAjIHMgICAgICAgICA9IFwicy4je3RyaXBsZV9jb3VudH1cIlxuICAgICMgdiAgICAgICAgID0gXCJ2LiN7dHJpcGxlX2NvdW50fVwiXG4gICAgIyBvICAgICAgICAgPSBcIm8uI3t0cmlwbGVfY291bnR9XCJcbiAgICAjIHlpZWxkIHsgcm93aWRfb3V0LCByZWYsIHMsIHYsIG8sIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHJldHVybiBudWxsXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgVE1QX2xhbmd1YWdlX3NlcnZpY2VzXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmVtb3ZlX3Bpbnlpbl9kaWFjcml0aWNzOiAoIHRleHQgKSAtPiAoIHRleHQubm9ybWFsaXplICdORktEJyApLnJlcGxhY2UgL1xcUHtMfS9ndiwgJydcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBleHRyYWN0X2F0b25hbF96aF9yZWFkaW5nczogKCBlbnRyeSApIC0+XG4gICAgIyBweTp6aMO5LCB6aGUsIHpoxIFvLCB6aMOhbywgemjHlCwgesSrXG4gICAgUiA9IGVudHJ5XG4gICAgUiA9IFIucmVwbGFjZSAvXnB5Oi92LCAnJ1xuICAgIFIgPSBSLnNwbGl0IC8sXFxzKi92XG4gICAgUiA9ICggKCBAcmVtb3ZlX3Bpbnlpbl9kaWFjcml0aWNzIHpoX3JlYWRpbmcgKSBmb3IgemhfcmVhZGluZyBpbiBSIClcbiAgICBSID0gbmV3IFNldCBSXG4gICAgUi5kZWxldGUgJ251bGwnXG4gICAgUi5kZWxldGUgJ0BudWxsJ1xuICAgIHJldHVybiBbIFIuLi4sIF1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBleHRyYWN0X2phX3JlYWRpbmdzOiAoIGVudHJ5ICkgLT5cbiAgICAjIOepuiAgICAgIGhpOuOBneOCiSwg44GCwrco44GPfOOBjXzjgZHjgospLCDjgYvjgoksIOOBmcK3KOOBj3zjgYvjgZkpLCDjgoDjgarCt+OBl+OBhFxuICAgIFIgPSBlbnRyeVxuICAgIFIgPSBSLnJlcGxhY2UgL14oPzpoaXxrYSk6L3YsICcnXG4gICAgUiA9IFIucmVwbGFjZSAvXFxzKy9ndiwgJydcbiAgICBSID0gUi5zcGxpdCAvLFxccyovdlxuICAgICMjIyBOT1RFIHJlbW92ZSBuby1yZWFkaW5ncyBtYXJrZXIgYEBudWxsYCBhbmQgY29udGV4dHVhbCByZWFkaW5ncyBsaWtlIC3jg43jg7MgZm9yIOe4gSwgLeODjuOCpiBmb3Ig546LICMjI1xuICAgIFIgPSAoIHJlYWRpbmcgZm9yIHJlYWRpbmcgaW4gUiB3aGVuIG5vdCByZWFkaW5nLnN0YXJ0c1dpdGggJy0nIClcbiAgICBSID0gbmV3IFNldCBSXG4gICAgUi5kZWxldGUgJ251bGwnXG4gICAgUi5kZWxldGUgJ0BudWxsJ1xuICAgIHJldHVybiBbIFIuLi4sIF1cbnRtcF9sYW5ndWFnZV9zZXJ2aWNlcyA9IG5ldyBUTVBfbGFuZ3VhZ2Vfc2VydmljZXMoKVxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbnBvcHVsYXRlX21lYW5pbmdfbWlycm9yX3RyaXBsZXMgPSAtPlxuICBkYiA9IGdldF9kYigpXG4gIHsgdG90YWxfcm93X2NvdW50LCB9ID0gKCBkYi5wcmVwYXJlIFNRTFwiXCJcIlxuICAgIHNlbGVjdFxuICAgICAgICBjb3VudCgqKSBhcyB0b3RhbF9yb3dfY291bnRcbiAgICAgIGZyb20ganpyX21pcnJvcl9saW5lc1xuICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICBhbmQgKCBkc2tleSA9ICdkaWN0Om1lYW5pbmdzJyApXG4gICAgICAgIGFuZCAoIGZpZWxkXzEgaXMgbm90IG51bGwgKVxuICAgICAgICBhbmQgKCBub3QgZmllbGRfMSByZWdleHAgJ15AZ2x5cGhzJyApO1wiXCJcIiApLmdldCgpXG4gIHRvdGFsID0gdG90YWxfcm93X2NvdW50ICogMiAjIyMgTk9URSBlc3RpbWF0ZSAjIyNcbiAgIyB7IHRvdGFsX3Jvd19jb3VudCwgdG90YWwsIH0gPSB7IHRvdGFsX3Jvd19jb3VudDogNDAwODYsIHRvdGFsOiA4MDE3MiB9ICMgISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISFcbiAgaGVscCAnzqlqenJzZGJfX18xJywgeyB0b3RhbF9yb3dfY291bnQsIHRvdGFsLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyAjIyMgVEFJTlQgYSBjb252b2x1dGVkIHdheSB0byBnZXQgYSBmaWxlIHBhdGggIyMjXG4gICMgIyMjIFRBSU5UIG1ha2UgYW4gQVBJIGNhbGwgIyMjXG4gICMgZHNrZXkgPSAnZGljdDptZWFuaW5ncydcbiAgIyBmb3Igcm93IGZyb20gZGIud2FsayBTUUxcInNlbGVjdCAqIGZyb20ganpyX2RhdGFzb3VyY2VzIHdoZXJlIGRza2V5ID0gJGRza2V5O1wiLCB7IGRza2V5LCB9XG4gICMgICBtZWFuaW5nc19wYXRoID0gcm93LnBhdGhcbiAgIyAgIGJyZWFrXG4gICMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjIGNvdW50ID0gMFxuICAjIGZvciB7IGxucjogbGluZV9uciwgbGluZSwgfSBmcm9tIHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgbWVhbmluZ3NfcGF0aFxuICAjICAgZGVidWcgJ86panpyc2RiX19fNicsIGxpbmVfbnIsIHJwciBsaW5lXG4gICMgICBjb3VudCsrXG4gICMgICBicmVhayBpZiBjb3VudCA+IDEwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyB0cmlwbGVfY291bnQgPSAwXG4gICMgZ2V0X3RyaXBsZXMgPSAoIHJvd2lkX2luLCBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80ICkgLT5cbiAgIyAgIHRyaXBsZV9jb3VudCsrXG4gICMgICByb3dpZF9vdXQgPSBcInQ6bXI6M3BsOlI9I3t0cmlwbGVfY291bnR9XCJcbiAgIyAgIHJlZiAgICAgICA9IHJvd2lkX2luXG4gICMgICBzICAgICAgICAgPSBcInMuI3t0cmlwbGVfY291bnR9XCJcbiAgIyAgIHYgICAgICAgICA9IFwidi4je3RyaXBsZV9jb3VudH1cIlxuICAjICAgbyAgICAgICAgID0gXCJvLiN7dHJpcGxlX2NvdW50fVwiXG4gICMgICB5aWVsZCB7IHJvd2lkX291dCwgcmVmLCBzLCB2LCBvLCB9XG4gICMgICByZXR1cm4gbnVsbFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHVzaW5nXzFfY29ubmVjdGlvbiA9IC0+XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXMgPSBkYi5wcmVwYXJlIFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl90cmlwbGVzICggcm93aWQsIHJlZiwgcywgdiwgbyApXG4gICAgICAgIHNlbGVjdFxuICAgICAgICAgICAgZ3Qucm93aWRfb3V0ICAgIGFzIHJvd2lkLFxuICAgICAgICAgICAgZ3QucmVmICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAgIGd0LnMgICAgICAgICAgICBhcyBzLFxuICAgICAgICAgICAgZ3QudiAgICAgICAgICAgIGFzIHYsXG4gICAgICAgICAgICBndC5vICAgICAgICAgICAgYXMgb1xuICAgICAgICAgIGZyb20ganpyX21pcnJvcl9saW5lcyAgICAgICBhcyBtbFxuICAgICAgICAgIGpvaW4gZ2V0X3RyaXBsZXMoIG1sLnJvd2lkLCBtbC5maWVsZF8xLCBtbC5maWVsZF8yLCBtbC5maWVsZF8zICkgIGFzIGd0XG4gICAgICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICAgICAgYW5kICggbWwuZHNrZXkgPSAnZGljdDptZWFuaW5ncycgKVxuICAgICAgICAgICAgYW5kICggbWwuZmllbGRfMSBpcyBub3QgbnVsbCApXG4gICAgICAgICAgICBhbmQgKCBtbC5maWVsZF8xIG5vdCByZWdleHAgJ15AZ2x5cGhzJyApXG4gICAgICAgICAgICBhbmQgKCBtbC5maWVsZF8zIHJlZ2V4cCAnXig/OnB5fGhpfGthKTonIClcbiAgICAgICAgb24gY29uZmxpY3QgKCByZWYsIHMsIHYsIG8gKSBkbyBub3RoaW5nO1xuICAgICAgXCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBicmFuZCA9ICdCUkFORCdcbiAgICB0aW1laXQgeyB0b3RhbCwgYnJhbmQsIH0sIHBvcHVsYXRlX3RyaXBsZXNfMV9jb25uZWN0aW9uID0gKHsgcHJvZ3Jlc3MsIH0pID0+XG4gICAgICBAX1RNUF9zdGF0ZS50aW1laXRfcHJvZ3Jlc3MgPSBwcm9ncmVzc1xuICAgICAgX2JlZ2luIGRiLmRiOyBkYi5leGVjdXRlIFNRTFwiYmVnaW4gdHJhbnNhY3Rpb247XCJcbiAgICAgIHBvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlcy5ydW4oKVxuICAgICAgZGIuZXhlY3V0ZSBTUUxcImNvbW1pdDtcIjsgX2VuZCBkYi5kYlxuICAgICAgQF9UTVBfc3RhdGUudGltZWl0X3Byb2dyZXNzID0gbnVsbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICB1c2luZ18yX2Nvbm5lY3Rpb25zID0gLT5cbiAgICByb3dfY291bnQgPSAwXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBxdWVyeSA9IFNRTFwiXCJcIlxuICAgICAgc2VsZWN0XG4gICAgICAgICAgcm93aWQgICAgIGFzIHJvd2lkLFxuICAgICAgICAgIGZpZWxkXzIgICBhcyBjaHIsXG4gICAgICAgICAgZmllbGRfMyAgIGFzIGVudHJ5XG4gICAgICAgIGZyb20ganpyX21pcnJvcl9saW5lc1xuICAgICAgICB3aGVyZSB0cnVlXG4gICAgICAgICAgYW5kICggZHNrZXkgPSAnZGljdDptZWFuaW5ncycgKVxuICAgICAgICAgIGFuZCAoIGZpZWxkXzEgaXMgbm90IG51bGwgKVxuICAgICAgICAgIGFuZCAoIGZpZWxkXzEgbm90IHJlZ2V4cCAnXkBnbHlwaHMnIClcbiAgICAgICAgICBhbmQgKCBmaWVsZF8zIHJlZ2V4cCAnXig/OnB5fGhpfGthKTonIClcbiAgICAgICAgO1wiXCJcIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgYnJhbmQgPSAnQlJBTkQnXG4gICAgdGltZWl0IHsgdG90YWwsIGJyYW5kLCB9LCBwb3B1bGF0ZV90cmlwbGVzXzJfY29ubmVjdGlvbnMgPSAoeyBwcm9ncmVzcywgfSkgPT5cbiAgICAgIF9iZWdpbiBkYi5kYjsgZGIuZXhlY3V0ZSBTUUxcImJlZ2luIHRyYW5zYWN0aW9uO1wiXG4gICAgICBmb3Igcm93IGZyb20gQHdhbGsgcXVlcnlcbiAgICAgICAgdiA9IG51bGxcbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAgIHN3aXRjaCB0cnVlXG4gICAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICAgIHdoZW4gcm93LmVudHJ5LnN0YXJ0c1dpdGggJ3B5OidcbiAgICAgICAgICAgIHYgICAgICAgICA9ICd6aF9yZWFkaW5nJ1xuICAgICAgICAgICAgcmVhZGluZ3MgID0gZXh0cmFjdF9hdG9uYWxfemhfcmVhZGluZ3Mgcm93LmVudHJ5XG4gICAgICAgICAgIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAgICAgIyB3aGVuICggcm93LmVudHJ5LnN0YXJ0c1dpdGggJ2hpOicgKSBvciAoIHJvdy5lbnRyeS5zdGFydHNXaXRoICdrYTonIClcbiAgICAgICAgICAjICAgdiAgICAgICAgID0gJ2phX3JlYWRpbmcnXG4gICAgICAgICAgIyAgIHJlYWRpbmdzICA9IGV4dHJhY3RfamFfcmVhZGluZ3Mgcm93LmVudHJ5XG4gICAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgICBjb250aW51ZSB1bmxlc3Mgdj9cbiAgICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAgIHJlZiAgID0gcm93LnJvd2lkXG4gICAgICAgIHMgICAgID0gcm93LmNoclxuICAgICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICAgZm9yIHJlYWRpbmcgaW4gcmVhZGluZ3NcbiAgICAgICAgICByb3dfY291bnQrK1xuICAgICAgICAgIHJvd2lkID0gXCJ0Om1yOjNwbDpSPSN7cm93X2NvdW50fVwiXG4gICAgICAgICAgbyAgICAgPSByZWFkaW5nXG4gICAgICAgICAgQHcuc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl90cmlwbGUucnVuIHsgcm93aWQsIHJlZiwgcywgdiwgbywgfVxuICAgICAgICAgIHByb2dyZXNzKClcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBkYi5leGVjdXRlIFNRTFwiY29tbWl0O1wiOyBfZW5kIGRiLmRiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7bnVsbFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMgdXNpbmdfMl9jb25uZWN0aW9ucy5jYWxsIGRiXG4gIHVzaW5nXzFfY29ubmVjdGlvbi5jYWxsIGRiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgO251bGxcblxuX2JlZ2luID0gKCBkYiApIC0+XG4gICMgKCBkYi5wcmVwYXJlIFNRTFwicHJhZ21hIGpvdXJuYWxfbW9kZSA9IHdhbDtcIiAgICkucnVuKClcbiAgIyAoIGRiLnByZXBhcmUgU1FMXCJwcmFnbWEgc3luY2hyb25vdXMgID0gb2ZmO1wiICAgKS5ydW4oKVxuICAjICggZGIucHJlcGFyZSBTUUxcInByYWdtYSBmb3JlaWduX2tleXMgPSBvZmY7XCIgICAgKS5ydW4oKVxuICAjICMgKCBkYi5wcmVwYXJlIFNRTFwicHJhZ21hIGJ1c3lfdGltZW91dCA9IDYwMDAwO1wiICkucnVuKCkgIyMjIHRpbWUgaW4gbXMgIyMjXG4gICMgKCBkYi5wcmVwYXJlIFNRTFwicHJhZ21hIHN0cmljdCAgICAgICA9IG9mZjtcIiAgICApLnJ1bigpICMjIyB0aW1lIGluIG1zICMjI1xuICAjIDtudWxsXG5cbl9lbmQgPSAoIGRiICkgLT5cbiAgIyAoIGRiLnByZXBhcmUgU1FMXCJwcmFnbWEgam91cm5hbF9tb2RlID0gd2FsO1wiICAgKS5ydW4oKVxuICAjICggZGIucHJlcGFyZSBTUUxcInByYWdtYSBmb3JlaWduX2tleXMgPSBvbjtcIiAgICApLnJ1bigpXG4gICMgKCBkYi5wcmVwYXJlIFNRTFwicHJhZ21hIGJ1c3lfdGltZW91dCA9IDYwMDAwO1wiICkucnVuKCkgIyMjIHRpbWUgaW4gbXMgIyMjXG4gICMgKCBkYi5wcmVwYXJlIFNRTFwicHJhZ21hIHN0cmljdCAgICAgICA9IG9uO1wiICAgICkucnVuKCkgIyMjIHRpbWUgaW4gbXMgIyMjXG4gICMgO251bGxcblxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuaWYgbW9kdWxlIGlzIHJlcXVpcmUubWFpbiB0aGVuIGRvID0+XG4gIHBvcHVsYXRlX21lYW5pbmdfbWlycm9yX3RyaXBsZXMoKVxuICAjIGRlbW9fc291cmNlX2lkZW50aWZpZXJzKClcblxuICAjIGRlYnVnICfOqWp6cnNkYl9fMTInLCBkYiA9IG5ldyBCc3FsMyAnOm1lbW9yeTonXG4gICMgaGVscCAnzqlqenJzZGJfXzEzJywgcm93IGZvciByb3cgZnJvbSAoIGRiLnByZXBhcmUgU1FMXCJzZWxlY3QgNDUgKiA4ODtcIiApLml0ZXJhdGUoKVxuICAjIGhlbHAgJ86panpyc2RiX18xNCcsIHJvdyBmb3Igcm93IGZyb20gKCBkYi5wcmVwYXJlIFNRTFwic2VsZWN0ICdhYmMnIGxpa2UgJ2ElJztcIiApLml0ZXJhdGUoKVxuICAjIGhlbHAgJ86panpyc2RiX18xNScsIHJvdyBmb3Igcm93IGZyb20gKCBkYi5wcmVwYXJlIFNRTFwic2VsZWN0ICdhYmMnIHJlZ2V4cCAnXmEnO1wiICkuaXRlcmF0ZSgpXG4gIDtudWxsXG5cbiJdfQ==
