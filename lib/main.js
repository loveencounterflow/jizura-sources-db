(function() {
  'use strict';
  var Async_jetstream, Benchmarker, Bsql3, Dbric, GUY, Jetstream, Jizura, Jzr_db_adapter, Language_services, PATH, SFMODULES, SQL, alert, benchmarker, blue, bold, debug, demo, demo_source_identifiers, echo, freeze, get_paths, gold, green, grey, help, info, inspect, language_services, lets, log, plain, praise, red, reverse, rpr, timeit, urge, walk_lines_with_positions, warn, whisper, white;

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
  ({lets, freeze} = SFMODULES.require_letsfreezethat_infra().simple);

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

  Jzr_db_adapter = (function() {
    //===========================================================================================================
    class Jzr_db_adapter extends Dbric {
      //---------------------------------------------------------------------------------------------------------
      constructor(db_path, cfg) {
        var host;
        super(db_path, cfg);
        ({host} = cfg);
        this.cfg = lets(this.cfg, function(cfg) {
          return delete cfg.host;
        });
        this.host = host;
        void 0;
      }

      //---------------------------------------------------------------------------------------------------------
      static open(db_path, {host}) {
        /* TAINT not a very nice solution */
        /* TAINT need more clarity about when statements, build, initialize... is performed */
        var R;
        R = super.open(db_path, {host});
        debug('Ωjzrsdb___2', {
          host: this.host
        });
        debug('Ωjzrsdb___3', R.is_ready);
        debug('Ωjzrsdb___4', R.is_fresh);
        if (R.is_fresh) {
          R._on_open_populate_jzr_datasources();
          R._on_open_populate_jzr_mirror_lcodes();
          R._on_open_populate_jzr_mirror_lines();
          R._on_open_populate_jzr_mirror_triples_for_meanings();
        } else {
          warn('Ωjzrsdb___5', "skipped data insertion");
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
            readings = language_services.extract_atonal_zh_readings(entry);
            break;
          //...................................................................................................
          case (entry.startsWith('hi:')) || (entry.startsWith('ka:')):
            v = 'ja_reading';
            readings = language_services.extract_ja_readings(entry);
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
        //.......................................................................................................
        return null;
      }

    };

    //---------------------------------------------------------------------------------------------------------
    Jzr_db_adapter.db_class = Bsql3;

    //---------------------------------------------------------------------------------------------------------
    Jzr_db_adapter.build = [
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
    Jzr_db_adapter.statements = {
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
on conflict ( dskey, line_nr ) do update set line = excluded.line;`,
      //.......................................................................................................
      populate_jzr_mirror_triples: SQL`insert into jzr_mirror_triples ( rowid, ref, s, v, o )
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
  on conflict ( ref, s, v, o ) do nothing
  ;`
    };

    return Jzr_db_adapter;

  }).call(this);

  //===========================================================================================================
  Language_services = class Language_services {
    //---------------------------------------------------------------------------------------------------------
    remove_pinyin_diacritics(text) {
      return (text.normalize('NFKD')).replace(/\P{L}/gv, '');
    }

    //---------------------------------------------------------------------------------------------------------
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

    //---------------------------------------------------------------------------------------------------------
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

  //-----------------------------------------------------------------------------------------------------------
  /* TAINT goes into constructor of Jzr class */
  language_services = new Language_services();

  //===========================================================================================================
  Jizura = class Jizura {
    //---------------------------------------------------------------------------------------------------------
    constructor() {
      this.paths = get_paths();
      this.dba = Jzr_db_adapter.open(this.paths.db, {
        host: this
      });
      this.populate_meaning_mirror_triples();
      void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    populate_meaning_mirror_triples() {
      var total, total_row_count;
      ({total_row_count} = (this.dba.prepare(SQL`select
    count(*) as total_row_count
  from jzr_mirror_lines
  where true
    and ( dskey = 'dict:meanings' )
    and ( field_1 is not null )
    and ( not field_1 regexp '^@glyphs' );`)).get());
      total = total_row_count * 2/* NOTE estimate */
      // { total_row_count, total, } = { total_row_count: 40086, total: 80172 } # !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      help('Ωjzrsdb___6', {total_row_count, total});
      //.......................................................................................................
      // brand = 'BRAND'
      // timeit { total, brand, }, populate_triples_1_connection = ({ progress, }) =>
      // @_TMP_state.timeit_progress = progress
      this.dba.statements.populate_jzr_mirror_triples.run();
      // @_TMP_state.timeit_progress = null
      // ;null
      //.......................................................................................................
      return null;
    }

  };

  //===========================================================================================================
  demo = function() {
    var jzr;
    jzr = new Jizura();
    //.........................................................................................................
    return null;
  };

  //===========================================================================================================
  if (module === require.main) {
    (() => {
      demo();
      // demo_source_identifiers()
      return null;
    })();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQSxjQUFBLEVBQUEsaUJBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSx1QkFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLGlCQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEseUJBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUE7OztFQUdBLEdBQUEsR0FBNEIsT0FBQSxDQUFRLEtBQVI7O0VBQzVCLENBQUEsQ0FBRSxLQUFGLEVBQ0UsS0FERixFQUVFLElBRkYsRUFHRSxJQUhGLEVBSUUsS0FKRixFQUtFLE1BTEYsRUFNRSxJQU5GLEVBT0UsSUFQRixFQVFFLE9BUkYsQ0FBQSxHQVE0QixHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVIsQ0FBb0IsbUJBQXBCLENBUjVCOztFQVNBLENBQUEsQ0FBRSxHQUFGLEVBQ0UsT0FERixFQUVFLElBRkYsRUFHRSxLQUhGLEVBSUUsS0FKRixFQUtFLElBTEYsRUFNRSxJQU5GLEVBT0UsSUFQRixFQVFFLEdBUkYsRUFTRSxJQVRGLEVBVUUsT0FWRixFQVdFLEdBWEYsQ0FBQSxHQVc0QixHQUFHLENBQUMsR0FYaEMsRUFiQTs7Ozs7Ozs7RUErQkEs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QSxFQUFGOzthQUVHO0lBSCtCLENBQUEsSUFBbEM7O0FBdGFBIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0J1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbkdVWSAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXknXG57IGFsZXJ0XG4gIGRlYnVnXG4gIGhlbHBcbiAgaW5mb1xuICBwbGFpblxuICBwcmFpc2VcbiAgdXJnZVxuICB3YXJuXG4gIHdoaXNwZXIgfSAgICAgICAgICAgICAgID0gR1VZLnRybS5nZXRfbG9nZ2VycyAnaml6dXJhLXNvdXJjZXMtZGInXG57IHJwclxuICBpbnNwZWN0XG4gIGVjaG9cbiAgd2hpdGVcbiAgZ3JlZW5cbiAgYmx1ZVxuICBnb2xkXG4gIGdyZXlcbiAgcmVkXG4gIGJvbGRcbiAgcmV2ZXJzZVxuICBsb2cgICAgIH0gICAgICAgICAgICAgICA9IEdVWS50cm1cbiMgeyBmIH0gICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9lZmZzdHJpbmcnXG4jIHdyaXRlICAgICAgICAgICAgICAgICAgICAgPSAoIHAgKSAtPiBwcm9jZXNzLnN0ZG91dC53cml0ZSBwXG4jIHsgbmZhIH0gICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvbm9ybWFsaXplLWZ1bmN0aW9uLWFyZ3VtZW50cydcbiMgR1RORyAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ndXktdGVzdC1ORydcbiMgeyBUZXN0ICAgICAgICAgICAgICAgICAgfSA9IEdUTkdcbiMgRlMgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6ZnMnXG5QQVRIICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpwYXRoJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5Cc3FsMyAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYmV0dGVyLXNxbGl0ZTMnXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblNGTU9EVUxFUyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvYnJpY2FicmFjLXNmbW9kdWxlcydcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBEYnJpYyxcbiAgU1FMLCAgICAgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZGJyaWMoKVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IGxldHMsXG4gIGZyZWV6ZSwgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2xldHNmcmVlemV0aGF0X2luZnJhKCkuc2ltcGxlXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgSmV0c3RyZWFtLFxuICBBc3luY19qZXRzdHJlYW0sICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9qZXRzdHJlYW0oKVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2Zhc3RfbGluZXJlYWRlcigpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgQmVuY2htYXJrZXIsICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfYmVuY2htYXJraW5nKClcbmJlbmNobWFya2VyICAgICAgICAgICAgICAgICAgID0gbmV3IEJlbmNobWFya2VyKClcbnRpbWVpdCAgICAgICAgICAgICAgICAgICAgICAgID0gKCBQLi4uICkgLT4gYmVuY2htYXJrZXIudGltZWl0IFAuLi5cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmRlbW9fc291cmNlX2lkZW50aWZpZXJzID0gLT5cbiAgeyBleHBhbmRfZGljdGlvbmFyeSwgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfZGljdGlvbmFyeV90b29scygpXG4gIHsgZ2V0X2xvY2FsX2Rlc3RpbmF0aW9ucywgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2dldF9sb2NhbF9kZXN0aW5hdGlvbnMoKVxuICBmb3Iga2V5LCB2YWx1ZSBvZiBnZXRfbG9jYWxfZGVzdGluYXRpb25zKClcbiAgICBkZWJ1ZyAnzqlqenJzZGJfX18xJywga2V5LCB2YWx1ZVxuICAjIGNhbiBhcHBlbmQgbGluZSBudW1iZXJzIHRvIGZpbGVzIGFzIGluOlxuICAjICdkaWN0Om1lYW5pbmdzLjE6TD0xMzMzMidcbiAgIyAnZGljdDp1Y2QxNDAuMTp1aGRpZHg6TD0xMjM0J1xuICAjIHJvd2lkczogJ3Q6amZtOlI9MSdcbiAgIyB7XG4gICMgICAnZGljdDptZWFuaW5ncyc6ICAgICAgICAgICckanpyZHMvbWVhbmluZy9tZWFuaW5ncy50eHQnXG4gICMgICAnZGljdDp1Y2Q6djE0LjA6dWhkaWR4JyA6ICckanpyZHMvdW5pY29kZS5vcmctdWNkLXYxNC4wL1VuaWhhbl9EaWN0aW9uYXJ5SW5kaWNlcy50eHQnXG4gICMgICB9XG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZ2V0X3BhdGhzID0gLT5cbiAgUiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IHt9XG4gIFIuYmFzZSAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4nXG4gIFIuZGIgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gUi5iYXNlLCAnanpyLmRiJ1xuICAjIFIuZGIgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSAnL2Rldi9zaG0vanpyLmRiJ1xuICBSLmp6cmRzICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIFIuYmFzZSwgJ2p6cmRzJ1xuICBSWyAnZGljdDptZWFuaW5ncycgICAgICAgICAgXSAgID0gUEFUSC5qb2luIFIuanpyZHMsICdtZWFuaW5nL21lYW5pbmdzLnR4dCdcbiAgUlsgJ2RpY3Q6dWNkOnYxNC4wOnVoZGlkeCcgIF0gICA9IFBBVEguam9pbiBSLmp6cmRzLCAndW5pY29kZS5vcmctdWNkLXYxNC4wL1VuaWhhbl9EaWN0aW9uYXJ5SW5kaWNlcy50eHQnXG4gIHJldHVybiBSXG5cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEp6cl9kYl9hZGFwdGVyIGV4dGVuZHMgRGJyaWNcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAoIGRiX3BhdGgsIGNmZyApIC0+XG4gICAgc3VwZXIgZGJfcGF0aCwgY2ZnXG4gICAgeyBob3N0LCB9ID0gY2ZnXG4gICAgQGNmZyAgICAgID0gbGV0cyBAY2ZnLCAoIGNmZyApIC0+IGRlbGV0ZSBjZmcuaG9zdFxuICAgIEBob3N0ICAgICA9IGhvc3RcbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAZGJfY2xhc3M6IEJzcWwzXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAYnVpbGQ6IFtcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9kYXRhc291cmNlcyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGRza2V5ICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHBhdGggICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6ZHM6Uj1cXFxcZCskJykpO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX21pcnJvcl9sY29kZXMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBsY29kZSAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBjb21tZW50ICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCBsY29kZSByZWdleHAgJ15bYS16QS1aXStbYS16QS1aMC05XSokJyApLFxuICAgICAgY2hlY2sgKCByb3dpZCA9ICd0OmxjOlY9JyB8fCBsY29kZSApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX2xpbmVzIChcbiAgICAgICAgLS0gJ3Q6amZtOidcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcmVmICAgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggZHNrZXkgfHwgJzpMPScgfHwgbGluZV9uciApIHZpcnR1YWwsXG4gICAgICAgIGRza2V5ICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmVfbnIgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxjb2RlICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmUgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpZWxkXzEgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgIGZpZWxkXzIgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgIGZpZWxkXzMgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgIGZpZWxkXzQgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bXI6bG46Uj1cXFxcZCskJyksXG4gICAgICB1bmlxdWUgKCBkc2tleSwgbGluZV9uciApLFxuICAgICAgZm9yZWlnbiBrZXkgKCBsY29kZSApIHJlZmVyZW5jZXMganpyX21pcnJvcl9sY29kZXMgKCBsY29kZSApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX3RyaXBsZXMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByZWYgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBzICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICB2ICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBvICAgICAgICAganNvbiAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCByb3dpZCByZWdleHAgJ150Om1yOjNwbDpSPVxcXFxkKyQnICksXG4gICAgICB1bmlxdWUgKCByZWYsIHMsIHYsIG8gKSxcbiAgICAgIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xpbmVzICggcm93aWQgKVxuICAgICAgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyMjIGFnZ3JlZ2F0ZSB0YWJsZSBmb3IgYWxsIHJvd2lkcyBnb2VzIGhlcmUgIyMjXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBzdGF0ZW1lbnRzOlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX2RhdGFzb3VyY2U6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX2RhdGFzb3VyY2VzICggcm93aWQsIGRza2V5LCBwYXRoICkgdmFsdWVzICggJHJvd2lkLCAkZHNrZXksICRwYXRoIClcbiAgICAgICAgb24gY29uZmxpY3QgKCBkc2tleSApIGRvIHVwZGF0ZSBzZXQgcGF0aCA9ICRwYXRoO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX21pcnJvcl9sY29kZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX2xjb2RlcyAoIHJvd2lkLCBsY29kZSwgY29tbWVudCApIHZhbHVlcyAoICRyb3dpZCwgJGxjb2RlLCAkY29tbWVudCApXG4gICAgICAgIG9uIGNvbmZsaWN0ICggcm93aWQgKSBkbyB1cGRhdGUgc2V0IGxjb2RlID0gJGxjb2RlLCBjb21tZW50ID0gJGNvbW1lbnQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfbWlycm9yX3RyaXBsZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3RyaXBsZXMgKCByb3dpZCwgcmVmLCBzLCB2LCBvICkgdmFsdWVzICggJHJvd2lkLCAkcmVmLCAkcywgJHYsICRvIClcbiAgICAgICAgb24gY29uZmxpY3QgKCByZWYsIHMsIHYsIG8gKSBkbyBub3RoaW5nO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfbGluZXMgKCByb3dpZCwgZHNrZXksIGxpbmVfbnIsIGxjb2RlLCBsaW5lLCBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80IClcbiAgICAgIHNlbGVjdFxuICAgICAgICAndDptcjpsbjpSPScgfHwgcm93X251bWJlcigpIG92ZXIgKCkgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgIC0tIGRzLmRza2V5IHx8ICc6TD0nIHx8IGZsLmxpbmVfbnIgICBhcyByb3dpZCxcbiAgICAgICAgZHMuZHNrZXkgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGRza2V5LFxuICAgICAgICBmbC5saW5lX25yICAgICAgICAgICAgICAgICAgICAgICAgYXMgbGluZV9ucixcbiAgICAgICAgZmwubGNvZGUgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGxjb2RlLFxuICAgICAgICBmbC5saW5lICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbGluZSxcbiAgICAgICAgZmwuZmllbGRfMSAgICAgICAgICAgICAgICAgICAgICAgIGFzIGZpZWxkXzEsXG4gICAgICAgIGZsLmZpZWxkXzIgICAgICAgICAgICAgICAgICAgICAgICBhcyBmaWVsZF8yLFxuICAgICAgICBmbC5maWVsZF8zICAgICAgICAgICAgICAgICAgICAgICAgYXMgZmllbGRfMyxcbiAgICAgICAgZmwuZmllbGRfNCAgICAgICAgICAgICAgICAgICAgICAgIGFzIGZpZWxkXzRcbiAgICAgIGZyb20ganpyX2RhdGFzb3VyY2VzICAgICAgICBhcyBkc1xuICAgICAgam9pbiBmaWxlX2xpbmVzKCBkcy5wYXRoICkgIGFzIGZsXG4gICAgICB3aGVyZSB0cnVlXG4gICAgICBvbiBjb25mbGljdCAoIGRza2V5LCBsaW5lX25yICkgZG8gdXBkYXRlIHNldCBsaW5lID0gZXhjbHVkZWQubGluZTtcbiAgICAgIFwiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl90cmlwbGVzICggcm93aWQsIHJlZiwgcywgdiwgbyApXG4gICAgICAgIHNlbGVjdFxuICAgICAgICAgICAgZ3Qucm93aWRfb3V0ICAgIGFzIHJvd2lkLFxuICAgICAgICAgICAgZ3QucmVmICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAgIGd0LnMgICAgICAgICAgICBhcyBzLFxuICAgICAgICAgICAgZ3QudiAgICAgICAgICAgIGFzIHYsXG4gICAgICAgICAgICBndC5vICAgICAgICAgICAgYXMgb1xuICAgICAgICAgIGZyb20ganpyX21pcnJvcl9saW5lcyAgICAgICBhcyBtbFxuICAgICAgICAgIGpvaW4gZ2V0X3RyaXBsZXMoIG1sLnJvd2lkLCBtbC5maWVsZF8xLCBtbC5maWVsZF8yLCBtbC5maWVsZF8zICkgIGFzIGd0XG4gICAgICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICAgICAgYW5kICggbWwuZHNrZXkgPSAnZGljdDptZWFuaW5ncycgKVxuICAgICAgICAgICAgYW5kICggbWwuZmllbGRfMSBpcyBub3QgbnVsbCApXG4gICAgICAgICAgICBhbmQgKCBtbC5maWVsZF8xIG5vdCByZWdleHAgJ15AZ2x5cGhzJyApXG4gICAgICAgICAgICBhbmQgKCBtbC5maWVsZF8zIHJlZ2V4cCAnXig/OnB5fGhpfGthKTonIClcbiAgICAgICAgb24gY29uZmxpY3QgKCByZWYsIHMsIHYsIG8gKSBkbyBub3RoaW5nXG4gICAgICAgIDtcbiAgICAgIFwiXCJcIlxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQG9wZW46ICggZGJfcGF0aCwgeyBob3N0LCB9ICkgLT5cbiAgICAjIyMgVEFJTlQgbm90IGEgdmVyeSBuaWNlIHNvbHV0aW9uICMjI1xuICAgICMjIyBUQUlOVCBuZWVkIG1vcmUgY2xhcml0eSBhYm91dCB3aGVuIHN0YXRlbWVudHMsIGJ1aWxkLCBpbml0aWFsaXplLi4uIGlzIHBlcmZvcm1lZCAjIyNcbiAgICBSID0gc3VwZXIgZGJfcGF0aCwgeyBob3N0LCB9XG4gICAgZGVidWcgJ86panpyc2RiX19fMicsIHsgaG9zdDogQGhvc3QsIH1cbiAgICBkZWJ1ZyAnzqlqenJzZGJfX18zJywgUi5pc19yZWFkeVxuICAgIGRlYnVnICfOqWp6cnNkYl9fXzQnLCBSLmlzX2ZyZXNoXG4gICAgaWYgUi5pc19mcmVzaFxuICAgICAgUi5fb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZXMoKVxuICAgICAgUi5fb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xjb2RlcygpXG4gICAgICBSLl9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGluZXMoKVxuICAgICAgUi5fb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXNfZm9yX21lYW5pbmdzKClcbiAgICBlbHNlXG4gICAgICB3YXJuICfOqWp6cnNkYl9fXzUnLCBcInNraXBwZWQgZGF0YSBpbnNlcnRpb25cIlxuICAgIHJldHVybiBSXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZXM6IC0+XG4gICAgcGF0aHMgPSBnZXRfcGF0aHMoKVxuICAgIGRza2V5ID0gJ2RpY3Q6bWVhbmluZ3MnOyAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MScsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZGljdDp1Y2Q6djE0LjA6dWhkaWR4JzsgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0yJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgO251bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBfb25fb3Blbl9wb3B1bGF0ZV92ZXJiczogLT5cbiAgIyAgIHBhdGhzID0gZ2V0X3BhdGhzKClcbiAgIyAgIGRza2V5ID0gJ2RpY3Q6bWVhbmluZ3MnOyAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MScsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAjICAgZHNrZXkgPSAnZGljdDp1Y2Q6djE0LjA6dWhkaWR4JzsgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0yJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICMgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9sY29kZXM6IC0+XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0OmxjOlY9QicsIGxjb2RlOiAnQicsIGNvbW1lbnQ6ICdibGFuayBsaW5lJywgICB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0OmxjOlY9QycsIGxjb2RlOiAnQycsIGNvbW1lbnQ6ICdjb21tZW50IGxpbmUnLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0OmxjOlY9RCcsIGxjb2RlOiAnRCcsIGNvbW1lbnQ6ICdkYXRhIGxpbmUnLCAgICB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGluZXM6IC0+XG4gICAgQHN0YXRlbWVudHMucG9wdWxhdGVfanpyX21pcnJvcl9saW5lcy5ydW4oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXNfZm9yX21lYW5pbmdzOiAtPlxuICAgICMgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXIoKVxuICAgIEBfVE1QX3N0YXRlID0geyB0cmlwbGVfY291bnQ6IDAsIH1cbiAgICBtZSA9IEBcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQGNyZWF0ZV9mdW5jdGlvblxuICAgICAgbmFtZTogICAgICAgICAgICdyZWdleHAnXG4gICAgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICAgY2FsbDogKCBwYXR0ZXJuLCB0ZXh0ICkgLT4gaWYgKCAoIG5ldyBSZWdFeHAgcGF0dGVybiwgJ3YnICkudGVzdCB0ZXh0ICkgdGhlbiAxIGVsc2UgMFxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBAY3JlYXRlX3RhYmxlX2Z1bmN0aW9uXG4gICAgICBuYW1lOiAgICAgICAgICAgJ3NwbGl0X3dvcmRzJ1xuICAgICAgY29sdW1uczogICAgICAgIFsgJ2tleXdvcmQnLCBdXG4gICAgICBwYXJhbWV0ZXJzOiAgICAgWyAnbGluZScsIF1cbiAgICAgIHJvd3M6ICggbGluZSApIC0+XG4gICAgICAgIGtleXdvcmRzID0gbGluZS5zcGxpdCAvKD86XFxwe1p9Kyl8KCg/OlxccHtTY3JpcHQ9SGFufSl8KD86XFxwe0x9Kyl8KD86XFxwe059Kyl8KD86XFxwe1N9KykpL3ZcbiAgICAgICAgZm9yIGtleXdvcmQgaW4ga2V5d29yZHNcbiAgICAgICAgICBjb250aW51ZSB1bmxlc3Mga2V5d29yZD9cbiAgICAgICAgICBjb250aW51ZSBpZiBrZXl3b3JkIGlzICcnXG4gICAgICAgICAgeWllbGQgeyBrZXl3b3JkLCB9XG4gICAgICAgIDtudWxsXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIEBjcmVhdGVfdGFibGVfZnVuY3Rpb25cbiAgICAgIG5hbWU6ICAgICAgICAgJ2ZpbGVfbGluZXMnXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2xpbmVfbnInLCAnbGNvZGUnLCAnbGluZScsICdmaWVsZF8xJywgJ2ZpZWxkXzInLCAnZmllbGRfMycsICdmaWVsZF80JywgXVxuICAgICAgcGFyYW1ldGVyczogICBbICdwYXRoJywgXVxuICAgICAgcm93czogKCBwYXRoICkgLT5cbiAgICAgICAgZm9yIHsgbG5yOiBsaW5lX25yLCBsaW5lLCBlb2wsIH0gZnJvbSB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zIHBhdGhcbiAgICAgICAgICBmaWVsZF8xID0gZmllbGRfMiA9IGZpZWxkXzMgPSBmaWVsZF80ID0gbnVsbFxuICAgICAgICAgIHN3aXRjaCB0cnVlXG4gICAgICAgICAgICB3aGVuIC9eXFxzKiQvdi50ZXN0IGxpbmVcbiAgICAgICAgICAgICAgbGNvZGUgPSAnQidcbiAgICAgICAgICAgIHdoZW4gL15cXHMqIy92LnRlc3QgbGluZVxuICAgICAgICAgICAgICBsY29kZSA9ICdDJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBsY29kZSA9ICdEJ1xuICAgICAgICAgICAgICBbIGZpZWxkXzEsIGZpZWxkXzIsIGZpZWxkXzMsIGZpZWxkXzQsIF0gPSBsaW5lLnNwbGl0ICdcXHQnXG4gICAgICAgICAgICAgIGZpZWxkXzEgPz0gbnVsbFxuICAgICAgICAgICAgICBmaWVsZF8yID89IG51bGxcbiAgICAgICAgICAgICAgZmllbGRfMyA/PSBudWxsXG4gICAgICAgICAgICAgIGZpZWxkXzQgPz0gbnVsbFxuICAgICAgICAgIHlpZWxkIHsgbGluZV9uciwgbGNvZGUsIGxpbmUsIGZpZWxkXzEsIGZpZWxkXzIsIGZpZWxkXzMsIGZpZWxkXzQsIH1cbiAgICAgICAgO251bGxcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQGNyZWF0ZV90YWJsZV9mdW5jdGlvblxuICAgICAgbmFtZTogICAgICAgICAnZ2V0X3RyaXBsZXMnXG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ3Jvd2lkX2luJywgJ2ZpZWxkXzEnLCAnZmllbGRfMicsICdmaWVsZF8zJywgJ2ZpZWxkXzQnLCBdXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ3Jvd2lkX291dCcsICdyZWYnLCAncycsICd2JywgJ28nLCBdXG4gICAgICByb3dzOiAoIHJvd2lkX2luLCBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80ICkgLT5cbiAgICAgICAgeWllbGQgZnJvbSBtZS5nZXRfdHJpcGxlcyByb3dpZF9pbiwgZmllbGRfMSwgZmllbGRfMiwgZmllbGRfMywgZmllbGRfNFxuICAgICAgICA7bnVsbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGdldF90cmlwbGVzOiAoIHJvd2lkX2luLCBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80ICkgLT5cbiAgICByZWYgICAgICAgICAgID0gcm93aWRfaW5cbiAgICBzICAgICAgICAgICAgID0gZmllbGRfMlxuICAgIHYgICAgICAgICAgICAgPSBudWxsXG4gICAgbyAgICAgICAgICAgICA9IG51bGxcbiAgICBlbnRyeSAgICAgICAgID0gZmllbGRfM1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc3dpdGNoIHRydWVcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHdoZW4gZW50cnkuc3RhcnRzV2l0aCAncHk6J1xuICAgICAgICB2ICAgICAgICAgPSAnemhfcmVhZGluZydcbiAgICAgICAgcmVhZGluZ3MgID0gbGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9hdG9uYWxfemhfcmVhZGluZ3MgZW50cnlcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHdoZW4gKCBlbnRyeS5zdGFydHNXaXRoICdoaTonICkgb3IgKCBlbnRyeS5zdGFydHNXaXRoICdrYTonIClcbiAgICAgICAgdiAgICAgICAgID0gJ2phX3JlYWRpbmcnXG4gICAgICAgIHJlYWRpbmdzICA9IGxhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfamFfcmVhZGluZ3MgZW50cnlcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiB2P1xuICAgICAgZm9yIHJlYWRpbmcgaW4gcmVhZGluZ3NcbiAgICAgICAgQF9UTVBfc3RhdGUudHJpcGxlX2NvdW50KytcbiAgICAgICAgcm93aWRfb3V0ID0gXCJ0Om1yOjNwbDpSPSN7QF9UTVBfc3RhdGUudHJpcGxlX2NvdW50fVwiXG4gICAgICAgIG8gICAgICAgICA9IHJlYWRpbmdcbiAgICAgICAgeWllbGQgeyByb3dpZF9vdXQsIHJlZiwgcywgdiwgbywgfVxuICAgICAgICBAX1RNUF9zdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHJldHVybiBudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBMYW5ndWFnZV9zZXJ2aWNlc1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcmVtb3ZlX3Bpbnlpbl9kaWFjcml0aWNzOiAoIHRleHQgKSAtPiAoIHRleHQubm9ybWFsaXplICdORktEJyApLnJlcGxhY2UgL1xcUHtMfS9ndiwgJydcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGV4dHJhY3RfYXRvbmFsX3poX3JlYWRpbmdzOiAoIGVudHJ5ICkgLT5cbiAgICAjIHB5Onpow7ksIHpoZSwgemjEgW8sIHpow6FvLCB6aMeULCB6xKtcbiAgICBSID0gZW50cnlcbiAgICBSID0gUi5yZXBsYWNlIC9ecHk6L3YsICcnXG4gICAgUiA9IFIuc3BsaXQgLyxcXHMqL3ZcbiAgICBSID0gKCAoIEByZW1vdmVfcGlueWluX2RpYWNyaXRpY3MgemhfcmVhZGluZyApIGZvciB6aF9yZWFkaW5nIGluIFIgKVxuICAgIFIgPSBuZXcgU2V0IFJcbiAgICBSLmRlbGV0ZSAnbnVsbCdcbiAgICBSLmRlbGV0ZSAnQG51bGwnXG4gICAgcmV0dXJuIFsgUi4uLiwgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZXh0cmFjdF9qYV9yZWFkaW5nczogKCBlbnRyeSApIC0+XG4gICAgIyDnqbogICAgICBoaTrjgZ3jgoksIOOBgsK3KOOBj3zjgY1844GR44KLKSwg44GL44KJLCDjgZnCtyjjgY9844GL44GZKSwg44KA44GqwrfjgZfjgYRcbiAgICBSID0gZW50cnlcbiAgICBSID0gUi5yZXBsYWNlIC9eKD86aGl8a2EpOi92LCAnJ1xuICAgIFIgPSBSLnJlcGxhY2UgL1xccysvZ3YsICcnXG4gICAgUiA9IFIuc3BsaXQgLyxcXHMqL3ZcbiAgICAjIyMgTk9URSByZW1vdmUgbm8tcmVhZGluZ3MgbWFya2VyIGBAbnVsbGAgYW5kIGNvbnRleHR1YWwgcmVhZGluZ3MgbGlrZSAt44ON44OzIGZvciDnuIEsIC3jg47jgqYgZm9yIOeOiyAjIyNcbiAgICBSID0gKCByZWFkaW5nIGZvciByZWFkaW5nIGluIFIgd2hlbiBub3QgcmVhZGluZy5zdGFydHNXaXRoICctJyApXG4gICAgUiA9IG5ldyBTZXQgUlxuICAgIFIuZGVsZXRlICdudWxsJ1xuICAgIFIuZGVsZXRlICdAbnVsbCdcbiAgICByZXR1cm4gWyBSLi4uLCBdXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjIFRBSU5UIGdvZXMgaW50byBjb25zdHJ1Y3RvciBvZiBKenIgY2xhc3MgIyMjXG5sYW5ndWFnZV9zZXJ2aWNlcyA9IG5ldyBMYW5ndWFnZV9zZXJ2aWNlcygpXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgSml6dXJhXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAcGF0aHMgID0gZ2V0X3BhdGhzKClcbiAgICBAZGJhICAgID0gSnpyX2RiX2FkYXB0ZXIub3BlbiBAcGF0aHMuZGIsIHsgaG9zdDogQCwgfVxuICAgIEBwb3B1bGF0ZV9tZWFuaW5nX21pcnJvcl90cmlwbGVzKClcbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBwb3B1bGF0ZV9tZWFuaW5nX21pcnJvcl90cmlwbGVzOiAtPlxuICAgIHsgdG90YWxfcm93X2NvdW50LCB9ID0gKCBAZGJhLnByZXBhcmUgU1FMXCJcIlwiXG4gICAgICBzZWxlY3RcbiAgICAgICAgICBjb3VudCgqKSBhcyB0b3RhbF9yb3dfY291bnRcbiAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzXG4gICAgICAgIHdoZXJlIHRydWVcbiAgICAgICAgICBhbmQgKCBkc2tleSA9ICdkaWN0Om1lYW5pbmdzJyApXG4gICAgICAgICAgYW5kICggZmllbGRfMSBpcyBub3QgbnVsbCApXG4gICAgICAgICAgYW5kICggbm90IGZpZWxkXzEgcmVnZXhwICdeQGdseXBocycgKTtcIlwiXCIgKS5nZXQoKVxuICAgIHRvdGFsID0gdG90YWxfcm93X2NvdW50ICogMiAjIyMgTk9URSBlc3RpbWF0ZSAjIyNcbiAgICAjIHsgdG90YWxfcm93X2NvdW50LCB0b3RhbCwgfSA9IHsgdG90YWxfcm93X2NvdW50OiA0MDA4NiwgdG90YWw6IDgwMTcyIH0gIyAhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhIVxuICAgIGhlbHAgJ86panpyc2RiX19fNicsIHsgdG90YWxfcm93X2NvdW50LCB0b3RhbCwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyBicmFuZCA9ICdCUkFORCdcbiAgICAjIHRpbWVpdCB7IHRvdGFsLCBicmFuZCwgfSwgcG9wdWxhdGVfdHJpcGxlc18xX2Nvbm5lY3Rpb24gPSAoeyBwcm9ncmVzcywgfSkgPT5cbiAgICAjIEBfVE1QX3N0YXRlLnRpbWVpdF9wcm9ncmVzcyA9IHByb2dyZXNzXG4gICAgQGRiYS5zdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlcy5ydW4oKVxuICAgICMgQF9UTVBfc3RhdGUudGltZWl0X3Byb2dyZXNzID0gbnVsbFxuICAgICMgO251bGxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDtudWxsXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZGVtbyA9IC0+XG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIDtudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5pZiBtb2R1bGUgaXMgcmVxdWlyZS5tYWluIHRoZW4gZG8gPT5cbiAgZGVtbygpXG4gICMgZGVtb19zb3VyY2VfaWRlbnRpZmllcnMoKVxuICA7bnVsbFxuXG4iXX0=
