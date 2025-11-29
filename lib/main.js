(function() {
  'use strict';
  var Async_jetstream, Benchmarker, Bsql3, Dbric, GUY, Jetstream, Jizura, Jzr_db_adapter, Language_services, PATH, SFMODULES, SQL, alert, as_bool, benchmarker, blue, bold, debug, demo, demo_source_identifiers, echo, freeze, from_bool, get_paths, gold, green, grey, help, info, inspect, lets, log, plain, praise, red, reverse, rpr, timeit, urge, walk_lines_with_positions, warn, whisper, white;

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

  //...........................................................................................................
  from_bool = function(x) {
    switch (x) {
      case true:
        return 1;
      case false:
        return 0;
      default:
        throw new Error(`Ωjzrsdb___1 expected true or false, got ${rpr(x)}`);
    }
  };

  as_bool = function(x) {
    switch (x) {
      case 1:
        return true;
      case 0:
        return false;
      default:
        throw new Error(`Ωjzrsdb___2 expected 0 or 1, got ${rpr(x)}`);
    }
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
      results.push(debug('Ωjzrsdb___3', key, value));
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
    R.jzr = PATH.resolve(R.base, '..');
    R.db = PATH.join(R.base, 'jzr.db');
    // R.db                            = '/dev/shm/jzr.db'
    R.jzrds = PATH.join(R.base, 'jzrds');
    R.jzrnewds = PATH.join(R.jzr, 'jizura-new-datasources');
    R['dict:meanings'] = PATH.join(R.jzrds, 'meaning/meanings.txt');
    R['dict:ucd:v14.0:uhdidx'] = PATH.join(R.jzrds, 'unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt');
    R['dict:hg-rom'] = PATH.join(R.jzrnewds, 'hangeul-transcriptions.tsv');
    return R;
  };

  Jzr_db_adapter = (function() {
    //===========================================================================================================
    class Jzr_db_adapter extends Dbric {
      //---------------------------------------------------------------------------------------------------------
      constructor(db_path, cfg = {}) {
        /* TAINT need more clarity about when statements, build, initialize... is performed */
        var host;
        ({host} = cfg);
        cfg = lets(cfg, function(cfg) {
          return delete cfg.host;
        });
        //.......................................................................................................
        super(db_path, cfg);
        //.......................................................................................................
        this.host = host;
        //.......................................................................................................
        /* TAINT this is not well placed */
        debug('Ωjzrsdb___4', (this.prepare(SQL`select * from jzr_uc_normalization_faults where false;`)).get());
        //.......................................................................................................
        if (this.is_fresh) {
          this._on_open_populate_jzr_datasources();
          this._on_open_populate_jzr_mirror_lcodes();
          this._on_open_populate_jzr_mirror_lines();
          this._on_open_populate_jzr_mirror_triples_for_meanings();
        } else {
          warn('Ωjzrsdb___5', "skipped data insertion");
        }
        //.......................................................................................................
        void 0;
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
        dskey = 'dict:hg-rom';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=3',
          dskey,
          path: paths[dskey]
        });
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
        super.initialize();
        return this._TMP_state = {
          triple_count: 0
        };
      }

      //---------------------------------------------------------------------------------------------------------
      * get_triples(rowid_in, dskey, field_1, field_2, field_3, field_4) {
        var base, entry, i, len, o, reading, readings, ref, role, rowid_out, s, v;
        ref = rowid_in;
        s = field_2;
        v = null;
        o = null;
        entry = field_3;
        //.......................................................................................................
        switch (true) {
          //...................................................................................................
          case dskey === 'dict:hg-rom': // and ( entry.startsWith 'py:' )
            debug('Ωjzrsdb___6', {rowid_in, dskey, field_1, field_2, field_3, field_4});
            role = field_1;
            v = `hg-rom:${role}`;
            readings = [field_3];
            break;
          //...................................................................................................
          case (dskey === 'dict:meanings') && (entry.startsWith('py:')):
            v = 'zh_reading';
            readings = this.host.language_services.extract_atonal_zh_readings(entry);
            break;
          //...................................................................................................
          case (dskey === 'dict:meanings') && ((entry.startsWith('hi:')) || (entry.startsWith('ka:'))):
            v = 'ja_reading';
            readings = this.host.language_services.extract_ja_readings(entry);
            break;
          //...................................................................................................
          case (dskey === 'dict:meanings') && (entry.startsWith('hg:')):
            v = 'hg_reading';
            readings = this.host.language_services.extract_hg_readings(entry);
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

    Jzr_db_adapter.prefix = 'jzr';

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
      SQL`create view jzr_uc_normalization_faults as select
  ml.rowid  as rowid,
  ml.ref    as ref,
  ml.line   as line
from jzr_mirror_lines as ml
where true
  and ( not is_uc_normal( ml.line ) )
order by ml.rowid;`,
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
    from jzr_mirror_lines                                                       as ml
    join get_triples( ml.rowid, ml.dskey, ml.field_1, ml.field_2, ml.field_3 )  as gt
    where true
      and ( ml.lcode = 'D' )
      -- and ( ml.dskey = 'dict:meanings' )
      and ( ml.field_1 is not null )
      and ( ml.field_1 not regexp '^@glyphs' )
      -- and ( ml.field_3 regexp '^(?:py|hi|ka):' )
  on conflict ( ref, s, v, o ) do nothing
  ;`
    };

    // me = @

    //=========================================================================================================
    Jzr_db_adapter.functions = {
      //-------------------------------------------------------------------------------------------------------
      regexp: {
        deterministic: true,
        call: function(pattern, text) {
          if ((new RegExp(pattern, 'v')).test(text)) {
            return 1;
          } else {
            return 0;
          }
        }
      },
      //-------------------------------------------------------------------------------------------------------
      is_uc_normal: {
        deterministic: true,
        /* NOTE: also see `String::isWellFormed()` */
        call: function(text, form = 'NFC') {
          return from_bool(text === text.normalize(form));
        }
      }
    };

    //=========================================================================================================
    Jzr_db_adapter./* 'NFC', 'NFD', 'NFKC', or 'NFKD' */table_functions = {
      //-------------------------------------------------------------------------------------------------------
      split_words: {
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
      },
      //-------------------------------------------------------------------------------------------------------
      file_lines: {
        columns: ['line_nr', 'lcode', 'line', 'field_1', 'field_2', 'field_3', 'field_4'],
        parameters: ['path'],
        rows: function*(path) {
          var eol, field_1, field_2, field_3, field_4, lcode, line, line_nr, y;
          for (y of walk_lines_with_positions(path)) {
            ({
              lnr: line_nr,
              line,
              eol
            } = y);
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
      },
      //-------------------------------------------------------------------------------------------------------
      get_triples: {
        parameters: ['rowid_in', 'dskey', 'field_1', 'field_2', 'field_3', 'field_4'],
        columns: ['rowid_out', 'ref', 's', 'v', 'o'],
        rows: function*(rowid_in, dskey, field_1, field_2, field_3, field_4) {
          yield* this.get_triples(rowid_in, dskey, field_1, field_2, field_3, field_4);
          return null;
        }
      }
    };

    return Jzr_db_adapter;

  }).call(this);

  //===========================================================================================================
  Language_services = class Language_services {
    //---------------------------------------------------------------------------------------------------------
    constructor() {
      this._TMP_hangeul = require('hangul-disassemble');
      void 0;
    }

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

    //---------------------------------------------------------------------------------------------------------
    extract_hg_readings(entry) {
      var R, hangeul;
      // 空      hi:そら, あ·(く|き|ける), から, す·(く|かす), むな·しい
      R = entry;
      R = R.replace(/^(?:hg):/v, '');
      R = R.replace(/\s+/gv, '');
      R = R.split(/,\s*/v);
      R = new Set(R);
      R.delete('null');
      R.delete('@null');
      hangeul = [...R].join('');
      // debug 'Ωjzrsdb___7', @_TMP_hangeul.disassemble hangeul, { flatten: false, }
      return [...R];
    }

  };

  //-----------------------------------------------------------------------------------------------------------
  /* TAINT goes into constructor of Jzr class */
  //===========================================================================================================
  Jizura = class Jizura {
    //---------------------------------------------------------------------------------------------------------
    constructor() {
      this.paths = get_paths();
      this.language_services = new Language_services();
      this.dba = new Jzr_db_adapter(this.paths.db, {
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
    and ( dskey is 'dict:meanings' )
    and ( field_1 is not null )
    and ( not field_1 regexp '^@glyphs' );`)).get());
      total = total_row_count * 2/* NOTE estimate */
      // { total_row_count, total, } = { total_row_count: 40086, total: 80172 } # !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      help('Ωjzrsdb___8', {total_row_count, total});
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

    //---------------------------------------------------------------------------------------------------------
    show_normalization_faults() {
      var faulty_rows;
      faulty_rows = (this.dba.prepare(SQL`select * from jzr_uc_normalization_faults;`)).all();
      warn('Ωjzrsdb___9', reverse(faulty_rows));
      // for row from
      //.......................................................................................................
      return null;
    }

  };

  //===========================================================================================================
  demo = function() {
    var jzr;
    jzr = new Jizura();
    jzr.show_normalization_faults();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQSxjQUFBLEVBQUEsaUJBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsdUJBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEseUJBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUE7OztFQUdBLEdBQUEsR0FBNEIsT0FBQSxDQUFRLEtBQVI7O0VBQzVCLENBQUEsQ0FBRSxLQUFGLEVBQ0UsS0FERixFQUVFLElBRkYsRUFHRSxJQUhGLEVBSUUsS0FKRixFQUtFLE1BTEYsRUFNRSxJQU5GLEVBT0UsSUFQRixFQVFFLE9BUkYsQ0FBQSxHQVE0QixHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVIsQ0FBb0IsbUJBQXBCLENBUjVCOztFQVNBLENBQUEsQ0FBRSxHQUFGLEVBQ0UsT0FERixFQUVFLElBRkYsRUFHRSxLQUhGLEVBSUUsS0FKRixFQUtFLElBTEYsRUFNRSxJQU5GLEVBT0UsSUFQRixFQVFFLEdBUkYsRUFTRSxJQVRGLEVBVUUsT0FWRixFQVdFLEdBWEYsQ0FBQSxHQVc0QixHQUFHLENBQUMsR0FYaEMsRUFiQTs7Ozs7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REo7OzthQUlLO0lBTHdCOztFQWxDN0IsRUF2YkE7OztFQWllQSxJQUFBLEdBQU8sUUFBQSxDQUFBLENBQUE7QUFDUCxRQUFBO0lBQUUsR0FBQSxHQUFNLElBQUksTUFBSixDQUFBO0lBQ04sR0FBRyxDQUFDLHlCQUFKLENBQUEsRUFERjs7V0FHRztFQUpJLEVBamVQOzs7RUF5ZUEsSUFBRyxNQUFBLEtBQVUsT0FBTyxDQUFDLElBQXJCO0lBQWtDLENBQUEsQ0FBQSxDQUFBLEdBQUE7TUFDaEMsSUFBQSxDQUFBLEVBQUY7O2FBRUc7SUFIK0IsQ0FBQSxJQUFsQzs7QUF6ZUEiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuJ3VzZSBzdHJpY3QnXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuR1VZICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2d1eSdcbnsgYWxlcnRcbiAgZGVidWdcbiAgaGVscFxuICBpbmZvXG4gIHBsYWluXG4gIHByYWlzZVxuICB1cmdlXG4gIHdhcm5cbiAgd2hpc3BlciB9ICAgICAgICAgICAgICAgPSBHVVkudHJtLmdldF9sb2dnZXJzICdqaXp1cmEtc291cmNlcy1kYidcbnsgcnByXG4gIGluc3BlY3RcbiAgZWNob1xuICB3aGl0ZVxuICBncmVlblxuICBibHVlXG4gIGdvbGRcbiAgZ3JleVxuICByZWRcbiAgYm9sZFxuICByZXZlcnNlXG4gIGxvZyAgICAgfSAgICAgICAgICAgICAgID0gR1VZLnRybVxuIyB7IGYgfSAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2VmZnN0cmluZydcbiMgd3JpdGUgICAgICAgICAgICAgICAgICAgICA9ICggcCApIC0+IHByb2Nlc3Muc3Rkb3V0LndyaXRlIHBcbiMgeyBuZmEgfSAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ub3JtYWxpemUtZnVuY3Rpb24tYXJndW1lbnRzJ1xuIyBHVE5HICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2d1eS10ZXN0LU5HJ1xuIyB7IFRlc3QgICAgICAgICAgICAgICAgICB9ID0gR1ROR1xuIyBGUyAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpmcydcblBBVEggICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOnBhdGgnXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkJzcWwzICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdiZXR0ZXItc3FsaXRlMydcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuU0ZNT0RVTEVTICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9icmljYWJyYWMtc2Ztb2R1bGVzJ1xuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IERicmljLFxuICBTUUwsICAgICAgICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9kYnJpYygpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgbGV0cyxcbiAgZnJlZXplLCAgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfbGV0c2ZyZWV6ZXRoYXRfaW5mcmEoKS5zaW1wbGVcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBKZXRzdHJlYW0sXG4gIEFzeW5jX2pldHN0cmVhbSwgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2pldHN0cmVhbSgpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBCZW5jaG1hcmtlciwgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9iZW5jaG1hcmtpbmcoKVxuYmVuY2htYXJrZXIgICAgICAgICAgICAgICAgICAgPSBuZXcgQmVuY2htYXJrZXIoKVxudGltZWl0ICAgICAgICAgICAgICAgICAgICAgICAgPSAoIFAuLi4gKSAtPiBiZW5jaG1hcmtlci50aW1laXQgUC4uLlxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5mcm9tX2Jvb2wgICAgICAgICAgICAgICAgICAgICA9ICggeCApIC0+IHN3aXRjaCB4XG4gIHdoZW4gdHJ1ZSAgdGhlbiAxXG4gIHdoZW4gZmFsc2UgdGhlbiAwXG4gIGVsc2UgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfX18xIGV4cGVjdGVkIHRydWUgb3IgZmFsc2UsIGdvdCAje3JwciB4fVwiXG5hc19ib29sICAgICAgICAgICAgICAgICAgICAgICA9ICggeCApIC0+IHN3aXRjaCB4XG4gIHdoZW4gMSB0aGVuIHRydWVcbiAgd2hlbiAwIHRoZW4gZmFsc2VcbiAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fXzIgZXhwZWN0ZWQgMCBvciAxLCBnb3QgI3tycHIgeH1cIlxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmRlbW9fc291cmNlX2lkZW50aWZpZXJzID0gLT5cbiAgeyBleHBhbmRfZGljdGlvbmFyeSwgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfZGljdGlvbmFyeV90b29scygpXG4gIHsgZ2V0X2xvY2FsX2Rlc3RpbmF0aW9ucywgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2dldF9sb2NhbF9kZXN0aW5hdGlvbnMoKVxuICBmb3Iga2V5LCB2YWx1ZSBvZiBnZXRfbG9jYWxfZGVzdGluYXRpb25zKClcbiAgICBkZWJ1ZyAnzqlqenJzZGJfX18zJywga2V5LCB2YWx1ZVxuICAjIGNhbiBhcHBlbmQgbGluZSBudW1iZXJzIHRvIGZpbGVzIGFzIGluOlxuICAjICdkaWN0Om1lYW5pbmdzLjE6TD0xMzMzMidcbiAgIyAnZGljdDp1Y2QxNDAuMTp1aGRpZHg6TD0xMjM0J1xuICAjIHJvd2lkczogJ3Q6amZtOlI9MSdcbiAgIyB7XG4gICMgICAnZGljdDptZWFuaW5ncyc6ICAgICAgICAgICckanpyZHMvbWVhbmluZy9tZWFuaW5ncy50eHQnXG4gICMgICAnZGljdDp1Y2Q6djE0LjA6dWhkaWR4JyA6ICckanpyZHMvdW5pY29kZS5vcmctdWNkLXYxNC4wL1VuaWhhbl9EaWN0aW9uYXJ5SW5kaWNlcy50eHQnXG4gICMgICB9XG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZ2V0X3BhdGhzID0gLT5cbiAgUiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IHt9XG4gIFIuYmFzZSAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4nXG4gIFIuanpyICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILnJlc29sdmUgUi5iYXNlLCAnLi4nXG4gIFIuZGIgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gUi5iYXNlLCAnanpyLmRiJ1xuICAjIFIuZGIgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSAnL2Rldi9zaG0vanpyLmRiJ1xuICBSLmp6cmRzICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIFIuYmFzZSwgJ2p6cmRzJ1xuICBSLmp6cm5ld2RzICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIFIuanpyLCAnaml6dXJhLW5ldy1kYXRhc291cmNlcydcbiAgUlsgJ2RpY3Q6bWVhbmluZ3MnICAgICAgICAgIF0gICA9IFBBVEguam9pbiBSLmp6cmRzLCAnbWVhbmluZy9tZWFuaW5ncy50eHQnXG4gIFJbICdkaWN0OnVjZDp2MTQuMDp1aGRpZHgnICBdICAgPSBQQVRILmpvaW4gUi5qenJkcywgJ3VuaWNvZGUub3JnLXVjZC12MTQuMC9VbmloYW5fRGljdGlvbmFyeUluZGljZXMudHh0J1xuICBSWyAnZGljdDpoZy1yb20nICAgICAgICAgICAgXSAgID0gUEFUSC5qb2luIFIuanpybmV3ZHMsICdoYW5nZXVsLXRyYW5zY3JpcHRpb25zLnRzdidcbiAgcmV0dXJuIFJcblxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgSnpyX2RiX2FkYXB0ZXIgZXh0ZW5kcyBEYnJpY1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQGRiX2NsYXNzOiAgQnNxbDNcbiAgQHByZWZpeDogICAgJ2p6cidcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAoIGRiX3BhdGgsIGNmZyA9IHt9ICkgLT5cbiAgICAjIyMgVEFJTlQgbmVlZCBtb3JlIGNsYXJpdHkgYWJvdXQgd2hlbiBzdGF0ZW1lbnRzLCBidWlsZCwgaW5pdGlhbGl6ZS4uLiBpcyBwZXJmb3JtZWQgIyMjXG4gICAgeyBob3N0LCB9ID0gY2ZnXG4gICAgY2ZnICAgICAgID0gbGV0cyBjZmcsICggY2ZnICkgLT4gZGVsZXRlIGNmZy5ob3N0XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBzdXBlciBkYl9wYXRoLCBjZmdcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIEBob3N0ICAgICA9IGhvc3RcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMjIyBUQUlOVCB0aGlzIGlzIG5vdCB3ZWxsIHBsYWNlZCAjIyNcbiAgICBkZWJ1ZyAnzqlqenJzZGJfX180JywgKCBAcHJlcGFyZSBTUUxcInNlbGVjdCAqIGZyb20ganpyX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzIHdoZXJlIGZhbHNlO1wiICkuZ2V0KClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIEBpc19mcmVzaFxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlcygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9sY29kZXMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGluZXMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlc19mb3JfbWVhbmluZ3MoKVxuICAgIGVsc2VcbiAgICAgIHdhcm4gJ86panpyc2RiX19fNScsIFwic2tpcHBlZCBkYXRhIGluc2VydGlvblwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAYnVpbGQ6IFtcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9kYXRhc291cmNlcyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGRza2V5ICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHBhdGggICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6ZHM6Uj1cXFxcZCskJykpO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX21pcnJvcl9sY29kZXMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBsY29kZSAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBjb21tZW50ICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCBsY29kZSByZWdleHAgJ15bYS16QS1aXStbYS16QS1aMC05XSokJyApLFxuICAgICAgY2hlY2sgKCByb3dpZCA9ICd0OmxjOlY9JyB8fCBsY29kZSApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX2xpbmVzIChcbiAgICAgICAgLS0gJ3Q6amZtOidcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcmVmICAgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggZHNrZXkgfHwgJzpMPScgfHwgbGluZV9uciApIHZpcnR1YWwsXG4gICAgICAgIGRza2V5ICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmVfbnIgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxjb2RlICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmUgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpZWxkXzEgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgIGZpZWxkXzIgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgIGZpZWxkXzMgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgIGZpZWxkXzQgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bXI6bG46Uj1cXFxcZCskJyksXG4gICAgICB1bmlxdWUgKCBkc2tleSwgbGluZV9uciApLFxuICAgICAgZm9yZWlnbiBrZXkgKCBsY29kZSApIHJlZmVyZW5jZXMganpyX21pcnJvcl9sY29kZXMgKCBsY29kZSApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl91Y19ub3JtYWxpemF0aW9uX2ZhdWx0cyBhcyBzZWxlY3RcbiAgICAgICAgbWwucm93aWQgIGFzIHJvd2lkLFxuICAgICAgICBtbC5yZWYgICAgYXMgcmVmLFxuICAgICAgICBtbC5saW5lICAgYXMgbGluZVxuICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzIGFzIG1sXG4gICAgICB3aGVyZSB0cnVlXG4gICAgICAgIGFuZCAoIG5vdCBpc191Y19ub3JtYWwoIG1sLmxpbmUgKSApXG4gICAgICBvcmRlciBieSBtbC5yb3dpZDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfdHJpcGxlcyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHJlZiAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHMgICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHYgICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIG8gICAgICAgICBqc29uICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bXI6M3BsOlI9XFxcXGQrJCcgKSxcbiAgICAgIHVuaXF1ZSAoIHJlZiwgcywgdiwgbyApLFxuICAgICAgZm9yZWlnbiBrZXkgKCByZWYgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfbGluZXMgKCByb3dpZCApXG4gICAgICApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIyMgYWdncmVnYXRlIHRhYmxlIGZvciBhbGwgcm93aWRzIGdvZXMgaGVyZSAjIyNcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQHN0YXRlbWVudHM6XG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfZGF0YXNvdXJjZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfZGF0YXNvdXJjZXMgKCByb3dpZCwgZHNrZXksIHBhdGggKSB2YWx1ZXMgKCAkcm93aWQsICRkc2tleSwgJHBhdGggKVxuICAgICAgICBvbiBjb25mbGljdCAoIGRza2V5ICkgZG8gdXBkYXRlIHNldCBwYXRoID0gJHBhdGg7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfbWlycm9yX2xjb2RlOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfbGNvZGVzICggcm93aWQsIGxjb2RlLCBjb21tZW50ICkgdmFsdWVzICggJHJvd2lkLCAkbGNvZGUsICRjb21tZW50IClcbiAgICAgICAgb24gY29uZmxpY3QgKCByb3dpZCApIGRvIHVwZGF0ZSBzZXQgbGNvZGUgPSAkbGNvZGUsIGNvbW1lbnQgPSAkY29tbWVudDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9taXJyb3JfdHJpcGxlOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfdHJpcGxlcyAoIHJvd2lkLCByZWYsIHMsIHYsIG8gKSB2YWx1ZXMgKCAkcm93aWQsICRyZWYsICRzLCAkdiwgJG8gKVxuICAgICAgICBvbiBjb25mbGljdCAoIHJlZiwgcywgdiwgbyApIGRvIG5vdGhpbmc7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9taXJyb3JfbGluZXM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl9saW5lcyAoIHJvd2lkLCBkc2tleSwgbGluZV9uciwgbGNvZGUsIGxpbmUsIGZpZWxkXzEsIGZpZWxkXzIsIGZpZWxkXzMsIGZpZWxkXzQgKVxuICAgICAgc2VsZWN0XG4gICAgICAgICd0Om1yOmxuOlI9JyB8fCByb3dfbnVtYmVyKCkgb3ZlciAoKSAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgLS0gZHMuZHNrZXkgfHwgJzpMPScgfHwgZmwubGluZV9uciAgIGFzIHJvd2lkLFxuICAgICAgICBkcy5kc2tleSAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZHNrZXksXG4gICAgICAgIGZsLmxpbmVfbnIgICAgICAgICAgICAgICAgICAgICAgICBhcyBsaW5lX25yLFxuICAgICAgICBmbC5sY29kZSAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbGNvZGUsXG4gICAgICAgIGZsLmxpbmUgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBsaW5lLFxuICAgICAgICBmbC5maWVsZF8xICAgICAgICAgICAgICAgICAgICAgICAgYXMgZmllbGRfMSxcbiAgICAgICAgZmwuZmllbGRfMiAgICAgICAgICAgICAgICAgICAgICAgIGFzIGZpZWxkXzIsXG4gICAgICAgIGZsLmZpZWxkXzMgICAgICAgICAgICAgICAgICAgICAgICBhcyBmaWVsZF8zLFxuICAgICAgICBmbC5maWVsZF80ICAgICAgICAgICAgICAgICAgICAgICAgYXMgZmllbGRfNFxuICAgICAgZnJvbSBqenJfZGF0YXNvdXJjZXMgICAgICAgIGFzIGRzXG4gICAgICBqb2luIGZpbGVfbGluZXMoIGRzLnBhdGggKSAgYXMgZmxcbiAgICAgIHdoZXJlIHRydWVcbiAgICAgIG9uIGNvbmZsaWN0ICggZHNrZXksIGxpbmVfbnIgKSBkbyB1cGRhdGUgc2V0IGxpbmUgPSBleGNsdWRlZC5saW5lO1xuICAgICAgXCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlczogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3RyaXBsZXMgKCByb3dpZCwgcmVmLCBzLCB2LCBvIClcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICBndC5yb3dpZF9vdXQgICAgYXMgcm93aWQsXG4gICAgICAgICAgICBndC5yZWYgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICAgZ3QucyAgICAgICAgICAgIGFzIHMsXG4gICAgICAgICAgICBndC52ICAgICAgICAgICAgYXMgdixcbiAgICAgICAgICAgIGd0Lm8gICAgICAgICAgICBhcyBvXG4gICAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIG1sXG4gICAgICAgICAgam9pbiBnZXRfdHJpcGxlcyggbWwucm93aWQsIG1sLmRza2V5LCBtbC5maWVsZF8xLCBtbC5maWVsZF8yLCBtbC5maWVsZF8zICkgIGFzIGd0XG4gICAgICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICAgICAgYW5kICggbWwubGNvZGUgPSAnRCcgKVxuICAgICAgICAgICAgLS0gYW5kICggbWwuZHNrZXkgPSAnZGljdDptZWFuaW5ncycgKVxuICAgICAgICAgICAgYW5kICggbWwuZmllbGRfMSBpcyBub3QgbnVsbCApXG4gICAgICAgICAgICBhbmQgKCBtbC5maWVsZF8xIG5vdCByZWdleHAgJ15AZ2x5cGhzJyApXG4gICAgICAgICAgICAtLSBhbmQgKCBtbC5maWVsZF8zIHJlZ2V4cCAnXig/OnB5fGhpfGthKTonIClcbiAgICAgICAgb24gY29uZmxpY3QgKCByZWYsIHMsIHYsIG8gKSBkbyBub3RoaW5nXG4gICAgICAgIDtcbiAgICAgIFwiXCJcIlxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VzOiAtPlxuICAgIHBhdGhzID0gZ2V0X3BhdGhzKClcbiAgICBkc2tleSA9ICdkaWN0Om1lYW5pbmdzJzsgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEnLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICAjIGRza2V5ID0gJ2RpY3Q6dWNkOnYxNC4wOnVoZGlkeCc7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MicsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIGRza2V5ID0gJ2RpY3Q6aGctcm9tJzsgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MycsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIDtudWxsXG5cbiAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgX29uX29wZW5fcG9wdWxhdGVfdmVyYnM6IC0+XG4gICMgICBwYXRocyA9IGdldF9wYXRocygpXG4gICMgICBkc2tleSA9ICdkaWN0Om1lYW5pbmdzJzsgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEnLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgIyAgIGRza2V5ID0gJ2RpY3Q6dWNkOnYxNC4wOnVoZGlkeCc7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MicsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAjICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGNvZGVzOiAtPlxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDpsYzpWPUInLCBsY29kZTogJ0InLCBjb21tZW50OiAnYmxhbmsgbGluZScsICAgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDpsYzpWPUMnLCBsY29kZTogJ0MnLCBjb21tZW50OiAnY29tbWVudCBsaW5lJywgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDpsYzpWPUQnLCBsY29kZTogJ0QnLCBjb21tZW50OiAnZGF0YSBsaW5lJywgICAgfVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzOiAtPlxuICAgIEBzdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9taXJyb3JfbGluZXMucnVuKClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl90cmlwbGVzX2Zvcl9tZWFuaW5nczogLT5cbiAgICAjIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyKClcbiAgICBAX1RNUF9zdGF0ZSA9IHsgdHJpcGxlX2NvdW50OiAwLCB9XG4gICAgIyBtZSA9IEBcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIEBmdW5jdGlvbnM6XG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIHJlZ2V4cDpcbiAgICAgIGRldGVybWluaXN0aWM6ICB0cnVlXG4gICAgICBjYWxsOiAoIHBhdHRlcm4sIHRleHQgKSAtPiBpZiAoICggbmV3IFJlZ0V4cCBwYXR0ZXJuLCAndicgKS50ZXN0IHRleHQgKSB0aGVuIDEgZWxzZSAwXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGlzX3VjX25vcm1hbDpcbiAgICAgIGRldGVybWluaXN0aWM6ICB0cnVlXG4gICAgICAjIyMgTk9URTogYWxzbyBzZWUgYFN0cmluZzo6aXNXZWxsRm9ybWVkKClgICMjI1xuICAgICAgY2FsbDogKCB0ZXh0LCBmb3JtID0gJ05GQycgKSAtPiBmcm9tX2Jvb2wgdGV4dCBpcyB0ZXh0Lm5vcm1hbGl6ZSBmb3JtICMjIyAnTkZDJywgJ05GRCcsICdORktDJywgb3IgJ05GS0QnICMjI1xuXG4gICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgQHRhYmxlX2Z1bmN0aW9uczpcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgc3BsaXRfd29yZHM6XG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2tleXdvcmQnLCBdXG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ2xpbmUnLCBdXG4gICAgICByb3dzOiAoIGxpbmUgKSAtPlxuICAgICAgICBrZXl3b3JkcyA9IGxpbmUuc3BsaXQgLyg/OlxccHtafSspfCgoPzpcXHB7U2NyaXB0PUhhbn0pfCg/OlxccHtMfSspfCg/OlxccHtOfSspfCg/OlxccHtTfSspKS92XG4gICAgICAgIGZvciBrZXl3b3JkIGluIGtleXdvcmRzXG4gICAgICAgICAgY29udGludWUgdW5sZXNzIGtleXdvcmQ/XG4gICAgICAgICAgY29udGludWUgaWYga2V5d29yZCBpcyAnJ1xuICAgICAgICAgIHlpZWxkIHsga2V5d29yZCwgfVxuICAgICAgICA7bnVsbFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBmaWxlX2xpbmVzOlxuICAgICAgY29sdW1uczogICAgICBbICdsaW5lX25yJywgJ2xjb2RlJywgJ2xpbmUnLCAnZmllbGRfMScsICdmaWVsZF8yJywgJ2ZpZWxkXzMnLCAnZmllbGRfNCcsIF1cbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAncGF0aCcsIF1cbiAgICAgIHJvd3M6ICggcGF0aCApIC0+XG4gICAgICAgIGZvciB7IGxucjogbGluZV9uciwgbGluZSwgZW9sLCB9IGZyb20gd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBwYXRoXG4gICAgICAgICAgZmllbGRfMSA9IGZpZWxkXzIgPSBmaWVsZF8zID0gZmllbGRfNCA9IG51bGxcbiAgICAgICAgICBzd2l0Y2ggdHJ1ZVxuICAgICAgICAgICAgd2hlbiAvXlxccyokL3YudGVzdCBsaW5lXG4gICAgICAgICAgICAgIGxjb2RlID0gJ0InXG4gICAgICAgICAgICB3aGVuIC9eXFxzKiMvdi50ZXN0IGxpbmVcbiAgICAgICAgICAgICAgbGNvZGUgPSAnQydcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgbGNvZGUgPSAnRCdcbiAgICAgICAgICAgICAgWyBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80LCBdID0gbGluZS5zcGxpdCAnXFx0J1xuICAgICAgICAgICAgICBmaWVsZF8xID89IG51bGxcbiAgICAgICAgICAgICAgZmllbGRfMiA/PSBudWxsXG4gICAgICAgICAgICAgIGZpZWxkXzMgPz0gbnVsbFxuICAgICAgICAgICAgICBmaWVsZF80ID89IG51bGxcbiAgICAgICAgICB5aWVsZCB7IGxpbmVfbnIsIGxjb2RlLCBsaW5lLCBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80LCB9XG4gICAgICAgIDtudWxsXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGdldF90cmlwbGVzOlxuICAgICAgcGFyYW1ldGVyczogICBbICdyb3dpZF9pbicsICdkc2tleScsICdmaWVsZF8xJywgJ2ZpZWxkXzInLCAnZmllbGRfMycsICdmaWVsZF80JywgXVxuICAgICAgY29sdW1uczogICAgICBbICdyb3dpZF9vdXQnLCAncmVmJywgJ3MnLCAndicsICdvJywgXVxuICAgICAgcm93czogKCByb3dpZF9pbiwgZHNrZXksIGZpZWxkXzEsIGZpZWxkXzIsIGZpZWxkXzMsIGZpZWxkXzQgKSAtPlxuICAgICAgICB5aWVsZCBmcm9tIEBnZXRfdHJpcGxlcyByb3dpZF9pbiwgZHNrZXksIGZpZWxkXzEsIGZpZWxkXzIsIGZpZWxkXzMsIGZpZWxkXzRcbiAgICAgICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGdldF90cmlwbGVzOiAoIHJvd2lkX2luLCBkc2tleSwgZmllbGRfMSwgZmllbGRfMiwgZmllbGRfMywgZmllbGRfNCApIC0+XG4gICAgcmVmICAgICAgICAgICA9IHJvd2lkX2luXG4gICAgcyAgICAgICAgICAgICA9IGZpZWxkXzJcbiAgICB2ICAgICAgICAgICAgID0gbnVsbFxuICAgIG8gICAgICAgICAgICAgPSBudWxsXG4gICAgZW50cnkgICAgICAgICA9IGZpZWxkXzNcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHN3aXRjaCB0cnVlXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB3aGVuICggZHNrZXkgaXMgJ2RpY3Q6aGctcm9tJyApICMgYW5kICggZW50cnkuc3RhcnRzV2l0aCAncHk6JyApXG4gICAgICAgIGRlYnVnICfOqWp6cnNkYl9fXzYnLCB7IHJvd2lkX2luLCBkc2tleSwgZmllbGRfMSwgZmllbGRfMiwgZmllbGRfMywgZmllbGRfNCwgfVxuICAgICAgICByb2xlICAgICAgICAgID0gZmllbGRfMVxuICAgICAgICB2ICAgICAgICAgICAgID0gXCJoZy1yb206I3tyb2xlfVwiXG4gICAgICAgIHJlYWRpbmdzICAgICAgPSBbIGZpZWxkXzMsIF1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHdoZW4gKCBkc2tleSBpcyAnZGljdDptZWFuaW5ncycgKSBhbmQgKCBlbnRyeS5zdGFydHNXaXRoICdweTonIClcbiAgICAgICAgdiAgICAgICAgID0gJ3poX3JlYWRpbmcnXG4gICAgICAgIHJlYWRpbmdzICA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfYXRvbmFsX3poX3JlYWRpbmdzIGVudHJ5XG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB3aGVuICggZHNrZXkgaXMgJ2RpY3Q6bWVhbmluZ3MnICkgYW5kICggKCBlbnRyeS5zdGFydHNXaXRoICdoaTonICkgb3IgKCBlbnRyeS5zdGFydHNXaXRoICdrYTonICkgKVxuICAgICAgICB2ICAgICAgICAgPSAnamFfcmVhZGluZydcbiAgICAgICAgcmVhZGluZ3MgID0gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9qYV9yZWFkaW5ncyBlbnRyeVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgd2hlbiAoIGRza2V5IGlzICdkaWN0Om1lYW5pbmdzJyApIGFuZCAoIGVudHJ5LnN0YXJ0c1dpdGggJ2hnOicgKVxuICAgICAgICB2ICAgICAgICAgPSAnaGdfcmVhZGluZydcbiAgICAgICAgcmVhZGluZ3MgID0gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9oZ19yZWFkaW5ncyBlbnRyeVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIHY/XG4gICAgICBmb3IgcmVhZGluZyBpbiByZWFkaW5nc1xuICAgICAgICBAX1RNUF9zdGF0ZS50cmlwbGVfY291bnQrK1xuICAgICAgICByb3dpZF9vdXQgPSBcInQ6bXI6M3BsOlI9I3tAX1RNUF9zdGF0ZS50cmlwbGVfY291bnR9XCJcbiAgICAgICAgbyAgICAgICAgID0gcmVhZGluZ1xuICAgICAgICB5aWVsZCB7IHJvd2lkX291dCwgcmVmLCBzLCB2LCBvLCB9XG4gICAgICAgIEBfVE1QX3N0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcmV0dXJuIG51bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIExhbmd1YWdlX3NlcnZpY2VzXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX1RNUF9oYW5nZXVsID0gcmVxdWlyZSAnaGFuZ3VsLWRpc2Fzc2VtYmxlJ1xuICAgIDt1bmRlZmluZWRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHJlbW92ZV9waW55aW5fZGlhY3JpdGljczogKCB0ZXh0ICkgLT4gKCB0ZXh0Lm5vcm1hbGl6ZSAnTkZLRCcgKS5yZXBsYWNlIC9cXFB7TH0vZ3YsICcnXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBleHRyYWN0X2F0b25hbF96aF9yZWFkaW5nczogKCBlbnRyeSApIC0+XG4gICAgIyBweTp6aMO5LCB6aGUsIHpoxIFvLCB6aMOhbywgemjHlCwgesSrXG4gICAgUiA9IGVudHJ5XG4gICAgUiA9IFIucmVwbGFjZSAvXnB5Oi92LCAnJ1xuICAgIFIgPSBSLnNwbGl0IC8sXFxzKi92XG4gICAgUiA9ICggKCBAcmVtb3ZlX3Bpbnlpbl9kaWFjcml0aWNzIHpoX3JlYWRpbmcgKSBmb3IgemhfcmVhZGluZyBpbiBSIClcbiAgICBSID0gbmV3IFNldCBSXG4gICAgUi5kZWxldGUgJ251bGwnXG4gICAgUi5kZWxldGUgJ0BudWxsJ1xuICAgIHJldHVybiBbIFIuLi4sIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGV4dHJhY3RfamFfcmVhZGluZ3M6ICggZW50cnkgKSAtPlxuICAgICMg56m6ICAgICAgaGk644Gd44KJLCDjgYLCtyjjgY9844GNfOOBkeOCiyksIOOBi+OCiSwg44GZwrco44GPfOOBi+OBmSksIOOCgOOBqsK344GX44GEXG4gICAgUiA9IGVudHJ5XG4gICAgUiA9IFIucmVwbGFjZSAvXig/OmhpfGthKTovdiwgJydcbiAgICBSID0gUi5yZXBsYWNlIC9cXHMrL2d2LCAnJ1xuICAgIFIgPSBSLnNwbGl0IC8sXFxzKi92XG4gICAgIyMjIE5PVEUgcmVtb3ZlIG5vLXJlYWRpbmdzIG1hcmtlciBgQG51bGxgIGFuZCBjb250ZXh0dWFsIHJlYWRpbmdzIGxpa2UgLeODjeODsyBmb3Ig57iBLCAt44OO44KmIGZvciDnjosgIyMjXG4gICAgUiA9ICggcmVhZGluZyBmb3IgcmVhZGluZyBpbiBSIHdoZW4gbm90IHJlYWRpbmcuc3RhcnRzV2l0aCAnLScgKVxuICAgIFIgPSBuZXcgU2V0IFJcbiAgICBSLmRlbGV0ZSAnbnVsbCdcbiAgICBSLmRlbGV0ZSAnQG51bGwnXG4gICAgcmV0dXJuIFsgUi4uLiwgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZXh0cmFjdF9oZ19yZWFkaW5nczogKCBlbnRyeSApIC0+XG4gICAgIyDnqbogICAgICBoaTrjgZ3jgoksIOOBgsK3KOOBj3zjgY1844GR44KLKSwg44GL44KJLCDjgZnCtyjjgY9844GL44GZKSwg44KA44GqwrfjgZfjgYRcbiAgICBSID0gZW50cnlcbiAgICBSID0gUi5yZXBsYWNlIC9eKD86aGcpOi92LCAnJ1xuICAgIFIgPSBSLnJlcGxhY2UgL1xccysvZ3YsICcnXG4gICAgUiA9IFIuc3BsaXQgLyxcXHMqL3ZcbiAgICBSID0gbmV3IFNldCBSXG4gICAgUi5kZWxldGUgJ251bGwnXG4gICAgUi5kZWxldGUgJ0BudWxsJ1xuICAgIGhhbmdldWwgPSBbIFIuLi4sIF0uam9pbiAnJ1xuICAgICMgZGVidWcgJ86panpyc2RiX19fNycsIEBfVE1QX2hhbmdldWwuZGlzYXNzZW1ibGUgaGFuZ2V1bCwgeyBmbGF0dGVuOiBmYWxzZSwgfVxuICAgIHJldHVybiBbIFIuLi4sIF1cblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjIyBUQUlOVCBnb2VzIGludG8gY29uc3RydWN0b3Igb2YgSnpyIGNsYXNzICMjI1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEppenVyYVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQHBhdGhzICAgICAgICAgICAgICA9IGdldF9wYXRocygpXG4gICAgQGxhbmd1YWdlX3NlcnZpY2VzICA9IG5ldyBMYW5ndWFnZV9zZXJ2aWNlcygpXG4gICAgQGRiYSAgICAgICAgICAgICAgICA9IG5ldyBKenJfZGJfYWRhcHRlciBAcGF0aHMuZGIsIHsgaG9zdDogQCwgfVxuICAgIEBwb3B1bGF0ZV9tZWFuaW5nX21pcnJvcl90cmlwbGVzKClcbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBwb3B1bGF0ZV9tZWFuaW5nX21pcnJvcl90cmlwbGVzOiAtPlxuICAgIHsgdG90YWxfcm93X2NvdW50LCB9ID0gKCBAZGJhLnByZXBhcmUgU1FMXCJcIlwiXG4gICAgICBzZWxlY3RcbiAgICAgICAgICBjb3VudCgqKSBhcyB0b3RhbF9yb3dfY291bnRcbiAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzXG4gICAgICAgIHdoZXJlIHRydWVcbiAgICAgICAgICBhbmQgKCBkc2tleSBpcyAnZGljdDptZWFuaW5ncycgKVxuICAgICAgICAgIGFuZCAoIGZpZWxkXzEgaXMgbm90IG51bGwgKVxuICAgICAgICAgIGFuZCAoIG5vdCBmaWVsZF8xIHJlZ2V4cCAnXkBnbHlwaHMnICk7XCJcIlwiICkuZ2V0KClcbiAgICB0b3RhbCA9IHRvdGFsX3Jvd19jb3VudCAqIDIgIyMjIE5PVEUgZXN0aW1hdGUgIyMjXG4gICAgIyB7IHRvdGFsX3Jvd19jb3VudCwgdG90YWwsIH0gPSB7IHRvdGFsX3Jvd19jb3VudDogNDAwODYsIHRvdGFsOiA4MDE3MiB9ICMgISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISFcbiAgICBoZWxwICfOqWp6cnNkYl9fXzgnLCB7IHRvdGFsX3Jvd19jb3VudCwgdG90YWwsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgYnJhbmQgPSAnQlJBTkQnXG4gICAgIyB0aW1laXQgeyB0b3RhbCwgYnJhbmQsIH0sIHBvcHVsYXRlX3RyaXBsZXNfMV9jb25uZWN0aW9uID0gKHsgcHJvZ3Jlc3MsIH0pID0+XG4gICAgIyBAX1RNUF9zdGF0ZS50aW1laXRfcHJvZ3Jlc3MgPSBwcm9ncmVzc1xuICAgIEBkYmEuc3RhdGVtZW50cy5wb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXMucnVuKClcbiAgICAjIEBfVE1QX3N0YXRlLnRpbWVpdF9wcm9ncmVzcyA9IG51bGxcbiAgICAjIDtudWxsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2hvd19ub3JtYWxpemF0aW9uX2ZhdWx0czogLT5cbiAgICBmYXVsdHlfcm93cyA9ICggQGRiYS5wcmVwYXJlIFNRTFwic2VsZWN0ICogZnJvbSBqenJfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHM7XCIgKS5hbGwoKVxuICAgIHdhcm4gJ86panpyc2RiX19fOScsIHJldmVyc2UgZmF1bHR5X3Jvd3NcbiAgICAjIGZvciByb3cgZnJvbVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5kZW1vID0gLT5cbiAganpyID0gbmV3IEppenVyYSgpXG4gIGp6ci5zaG93X25vcm1hbGl6YXRpb25fZmF1bHRzKClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICA7bnVsbFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuaWYgbW9kdWxlIGlzIHJlcXVpcmUubWFpbiB0aGVuIGRvID0+XG4gIGRlbW8oKVxuICAjIGRlbW9fc291cmNlX2lkZW50aWZpZXJzKClcbiAgO251bGxcblxuIl19
