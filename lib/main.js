(function() {
  'use strict';
  var Async_jetstream, Benchmarker, Bsql3, Dbric, Dbric_std, GUY, Jetstream, Jizura, Jzr_db_adapter, Language_services, PATH, SFMODULES, SQL, alert, as_bool, benchmarker, blue, bold, debug, demo, demo_source_identifiers, echo, freeze, from_bool, get_paths, gold, green, grey, help, info, inspect, lets, log, plain, praise, red, reverse, rpr, timeit, urge, walk_lines_with_positions, warn, whisper, white;

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
  ({Dbric, Dbric_std, SQL} = SFMODULES.unstable.require_dbric());

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
    R['dict:x:ko-Hang+Latn'] = PATH.join(R.jzrnewds, 'hangeul-transcriptions.tsv');
    R['dict:x:ja-Kan+Latn'] = PATH.join(R.jzrnewds, 'kana-transcriptions.tsv');
    R['dict:bcp47'] = PATH.join(R.jzrnewds, 'BCP47-language-scripts-regions.tsv');
    return R;
  };

  Jzr_db_adapter = (function() {
    //===========================================================================================================
    class Jzr_db_adapter extends Dbric_std {
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
        (() => {          //.......................................................................................................
          var error, messages, name, type, y;
          /* TAINT this is not well placed */
          /* NOTE execute a Gaps-and-Islands ESSFRI to improve structural integrity assurance: */
          // ( @prepare SQL"select * from _jzr_meta_uc_normalization_faults where false;" ).get()
          messages = [];
          for (y of this.statements.std_get_relations.iterate()) {
            ({name, type} = y);
            try {
              (this.prepare(SQL`select * from ${name} where false;`)).all();
            } catch (error1) {
              error = error1;
              messages.push(`${type} ${name}: ${error.message}`);
              warn('Ωjzrsdb___4', error.message);
            }
          }
          if (messages.length === 0) {
            return null;
          }
          throw new Error(`Ωjzrsdb___5 EFFRI testing revealed errors: ${rpr(messages)}`);
          return null;
        })();
        //.......................................................................................................
        if (this.is_fresh) {
          this._on_open_populate_jzr_datasources();
          this._on_open_populate_jzr_mirror_verbs();
          this._on_open_populate_jzr_mirror_lcodes();
          this._on_open_populate_jzr_mirror_lines();
          this._on_open_populate_jzr_mirror_triples_for_meanings();
        } else {
          warn('Ωjzrsdb___6', "skipped data insertion");
        }
        //.......................................................................................................
        void 0;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_mirror_lcodes() {
        this.statements.insert_jzr_mirror_lcode.run({
          rowid: 't:mr:lc:V=B',
          lcode: 'B',
          comment: 'blank line'
        });
        this.statements.insert_jzr_mirror_lcode.run({
          rowid: 't:mr:lc:V=C',
          lcode: 'C',
          comment: 'comment line'
        });
        this.statements.insert_jzr_mirror_lcode.run({
          rowid: 't:mr:lc:V=D',
          lcode: 'D',
          comment: 'data line'
        });
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_mirror_verbs() {
        /* NOTE
           in verbs, initial component indicates type of subject:
             `c:` is for subjects that are CJK characters
             `x:` is used for unclassified subjects (possibly to be refined in the future)
           */
        var i, len, row, rows;
        rows = [
          {
            rowid: 't:mr:vb:V=x:ko-Hang+Latn:initial',
            s: "NN",
            v: 'x:ko-Hang+Latn:initial',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=x:ko-Hang+Latn:medial',
            s: "NN",
            v: 'x:ko-Hang+Latn:medial',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=x:ko-Hang+Latn:final',
            s: "NN",
            v: 'x:ko-Hang+Latn:final',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:zh-Latn-pinyin',
            s: "NN",
            v: 'c:reading:zh-Latn-pinyin',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ja-x-Kan',
            s: "NN",
            v: 'c:reading:ja-x-Kan',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ja-x-Hir',
            s: "NN",
            v: 'c:reading:ja-x-Hir',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ja-x-Kat',
            s: "NN",
            v: 'c:reading:ja-x-Kat',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ja-x-Latn',
            s: "NN",
            v: 'c:reading:ja-x-Latn',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ko-Hang',
            s: "NN",
            v: 'c:reading:ko-Hang',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ko-Latn',
            s: "NN",
            v: 'c:reading:ko-Latn',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ko-Hang:initial',
            s: "NN",
            v: 'c:reading:ko-Hang:initial',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ko-Hang:medial',
            s: "NN",
            v: 'c:reading:ko-Hang:medial',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ko-Hang:final',
            s: "NN",
            v: 'c:reading:ko-Hang:final',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ko-Latn:initial',
            s: "NN",
            v: 'c:reading:ko-Latn:initial',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ko-Latn:medial',
            s: "NN",
            v: 'c:reading:ko-Latn:medial',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ko-Latn:final',
            s: "NN",
            v: 'c:reading:ko-Latn:final',
            o: "NN"
          }
        ];
        for (i = 0, len = rows.length; i < len; i++) {
          row = rows[i];
          this.statements.insert_jzr_mirror_verb.run(row);
        }
        return null;
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
        dskey = 'dict:x:ko-Hang+Latn';
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
          triple_count: 0,
          most_recent_inserted_row: null
        };
      }

      // me = @

        //---------------------------------------------------------------------------------------------------------
      trigger_on_before_insert(name, ...fields) {
        this._TMP_state.most_recent_inserted_row = {name, fields};
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      * get_triples(rowid_in, dskey, field_1, field_2, field_3, field_4) {
        var base, entry, i, len, o, reading, readings, ref, role, rowid_out, s, v;
        ref = rowid_in;
        s = field_2;
        v = null;
        o = null;
        entry = field_3;
        // x:ko-Hang+Latn:initial
        // x:ko-Hang+Latn:medial
        // x:ko-Hang+Latn:final
        // reading:zh-Latn-pinyin
        // reading:ja-x-Kan
        // reading:ja-x-Hir
        // reading:ja-x-Kat
        // reading:ja-x-Latn
        // reading:ko-Hang
        // reading:ko-Latn
        //.......................................................................................................
        switch (true) {
          //...................................................................................................
          case dskey === 'dict:x:ko-Hang+Latn': // and ( entry.startsWith 'py:' )
            role = field_1;
            v = `x:ko-Hang+Latn:${role}`;
            readings = [field_3];
            break;
          //...................................................................................................
          case (dskey === 'dict:meanings') && (entry.startsWith('py:')):
            v = 'c:reading:zh-Latn-pinyin';
            readings = this.host.language_services.extract_atonal_zh_readings(entry);
            break;
          //...................................................................................................
          case (dskey === 'dict:meanings') && (entry.startsWith('ka:')):
            v = 'c:reading:ja-x-Kat';
            readings = this.host.language_services.extract_ja_readings(entry);
            break;
          //...................................................................................................
          case (dskey === 'dict:meanings') && (entry.startsWith('hi:')):
            v = 'c:reading:ja-x-Hir';
            readings = this.host.language_services.extract_ja_readings(entry);
            break;
          //...................................................................................................
          case (dskey === 'dict:meanings') && (entry.startsWith('hg:')):
            v = 'c:reading:ko-Hang';
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
check ( rowid = 't:mr:lc:V=' || lcode ) );`,
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
      SQL`create table jzr_mirror_verbs (
  rowid     text    unique  not null,
  s         text            not null,
  v         text    unique  not null,
  o         text            not null,
primary key ( rowid ),
check ( rowid regexp '^t:mr:vb:V=[\\-:\\+\\p{L}]+$' ) );`,
      //.......................................................................................................
      SQL`create table jzr_mirror_triples_base (
  rowid     text    unique  not null,
  ref       text            not null,
  s         text            not null,
  v         text            not null,
  o         json            not null,
primary key ( rowid ),
check ( rowid regexp '^t:mr:3pl:R=\\d+$' ),
unique ( ref, s, v, o )
foreign key ( ref ) references jzr_mirror_lines ( rowid )
foreign key ( v ) references jzr_mirror_verbs ( v ) );`,
      //.......................................................................................................
      SQL`create trigger jzr_mirror_triples_register
before insert on jzr_mirror_triples_base
for each row begin
  select trigger_on_before_insert( 'jzr_mirror_triples_base', new.rowid, new.ref, new.s, new.v, new.o );
  end;`,
      //.......................................................................................................
      SQL`create table jzr_lang_hang_syllables (
  rowid           text  unique  not null,
  ref             text          not null,
  syllable_hang   text  unique  not null,
  syllable_latn   text  not null generated always as ( initial_latn || medial_latn || final_latn ) virtual,
  -- syllable_latn   text  unique  not null generated always as ( initial_latn || medial_latn || final_latn ) virtual,
  initial_hang    text          not null,
  medial_hang     text          not null,
  final_hang      text          not null,
  initial_latn    text          not null,
  medial_latn     text          not null,
  final_latn      text          not null,
primary key ( rowid ),
check ( rowid regexp '^t:lang:hang:syl:V=\\S+$' )
-- unique ( ref, s, v, o )
-- foreign key ( ref ) references jzr_mirror_lines ( rowid )
-- foreign key ( syllable_hang ) references jzr_mirror_triples_base ( o ) )
);`,
      //.......................................................................................................
      SQL`create trigger jzr_lang_hang_syllables_register
before insert on jzr_lang_hang_syllables
for each row begin
  select trigger_on_before_insert( 'jzr_lang_hang_syllables',
    new.rowid, new.ref, new.syllable_hang, new.syllable_latn,
      new.initial_hang, new.medial_hang, new.final_hang,
      new.initial_latn, new.medial_latn, new.final_latn );
  end;`,
      //.......................................................................................................
      SQL`create view jzr_lang_kr_readings_triples as
select null as rowid, null as ref, null as s, null as v, null as o where false union all
-- ...................................................................................................
select rowid, ref, syllable_hang, 'c:reading:ko-Latn',          syllable_latn   from jzr_lang_hang_syllables union all
select rowid, ref, syllable_hang, 'c:reading:ko-Latn:initial',  initial_latn    from jzr_lang_hang_syllables union all
select rowid, ref, syllable_hang, 'c:reading:ko-Latn:medial',   medial_latn     from jzr_lang_hang_syllables union all
select rowid, ref, syllable_hang, 'c:reading:ko-Latn:final',    final_latn      from jzr_lang_hang_syllables union all
select rowid, ref, syllable_hang, 'c:reading:ko-Hang:initial',  initial_hang    from jzr_lang_hang_syllables union all
select rowid, ref, syllable_hang, 'c:reading:ko-Hang:medial',   medial_hang     from jzr_lang_hang_syllables union all
select rowid, ref, syllable_hang, 'c:reading:ko-Hang:final',    final_hang      from jzr_lang_hang_syllables union all
-- ...................................................................................................
select null, null, null, null, null where false
;`,
      //.......................................................................................................
      SQL`create view jzr_all_triples as
select null as rowid, null as ref, null as s, null as v, null as o where false union all
-- ...................................................................................................
select * from jzr_mirror_triples_base union all
select * from jzr_lang_kr_readings_triples union all
-- ...................................................................................................
select null, null, null, null, null where false
;`,
      //.......................................................................................................
      SQL`create view jzr_triples as
select null as rowid, null as ref, null as s, null as v, null as o where false union all
-- ...................................................................................................
select * from jzr_mirror_triples_base where v like 'c:%' union all
select tb.rowid, tb.ref, tb.s, kr.v, kr.o from jzr_mirror_triples_base as tb
  join jzr_lang_kr_readings_triples as kr on ( tb.v = 'c:reading:ko-Hang' and tb.o = kr.s )
  union all
-- ...................................................................................................
select null, null, null, null, null where false
order by s, v, o
;`,
      //-------------------------------------------------------------------------------------------------------
      SQL`create view _jzr_meta_uc_normalization_faults as select
  ml.rowid  as rowid,
  ml.ref    as ref,
  ml.line   as line
from jzr_mirror_lines as ml
where true
  and ( not is_uc_normal( ml.line ) )
order by ml.rowid;`,
      //.......................................................................................................
      SQL`create view _jzr_meta_kr_readings_unknown_verb_faults as select distinct
  count(*) over ( partition by v )    as count,
  'jzr_lang_kr_readings_triples:R=*'  as rowid,
  '*'                                 as ref,
  'unknown-verb'                      as description,
  v                                   as quote
from jzr_lang_kr_readings_triples as nn
where not exists ( select 1 from jzr_mirror_verbs as vb where vb.v = nn.v );`,
      //.......................................................................................................
      SQL`create view jzr_meta_faults as
select null as count, null as rowid, null as ref, null as description, null  as quote where false union all
-- ...................................................................................................
select 1, rowid, ref,  'uc-normalization', line  as quote from _jzr_meta_uc_normalization_faults          union all
select *                                                  from _jzr_meta_kr_readings_unknown_verb_faults  union all
-- ...................................................................................................
select null, null, null, null, null where false
;`
    ];

    //---------------------------------------------------------------------------------------------------------
    //.......................................................................................................
    // SQL"""create view jzr_syllables as select
    //       t1.s
    //       t1.v
    //       t1.o
    //       ti.s as initial_hang
    //       tm.s as medial_hang
    //       tf.s as final_hang
    //       ti.o as initial_latn
    //       tm.o as medial_latn
    //       tf.o as final_latn
    //     from jzr_mirror_triples_base as t1
    //     join
    //     join jzr_mirror_triples_base as ti on ( t1.)
    //   ;"""

    //.......................................................................................................
    /* aggregate table for all rowids goes here */
    //.......................................................................................................
    Jzr_db_adapter.statements = {
      //.......................................................................................................
      insert_jzr_datasource: SQL`insert into jzr_datasources ( rowid, dskey, path ) values ( $rowid, $dskey, $path )
  on conflict ( dskey ) do update set path = excluded.path;`,
      //.......................................................................................................
      insert_jzr_mirror_verb: SQL`insert into jzr_mirror_verbs ( rowid, s, v, o ) values ( $rowid, $s, $v, $o )
  on conflict ( rowid ) do update set s = excluded.s, v = excluded.v, o = excluded.o;`,
      //.......................................................................................................
      insert_jzr_mirror_lcode: SQL`insert into jzr_mirror_lcodes ( rowid, lcode, comment ) values ( $rowid, $lcode, $comment )
  on conflict ( rowid ) do update set lcode = excluded.lcode, comment = excluded.comment;`,
      //.......................................................................................................
      insert_jzr_mirror_triple: SQL`insert into jzr_mirror_triples_base ( rowid, ref, s, v, o ) values ( $rowid, $ref, $s, $v, $o )
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
      populate_jzr_mirror_triples: SQL`insert into jzr_mirror_triples_base ( rowid, ref, s, v, o )
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
  ;`,
      //.......................................................................................................
      populate_jzr_lang_hangeul_syllables: SQL`insert into jzr_lang_hang_syllables ( rowid, ref,
  syllable_hang, initial_hang, medial_hang, final_hang,
                  initial_latn, medial_latn, final_latn
                  )
  select
      't:lang:hang:syl:V=' || mt.o          as rowid,
      mt.rowid                              as ref,
      mt.o                                  as syllable_hang,
      dh.initial                            as initial_hang,
      dh.medial                             as medial_hang,
      dh.final                              as final_hang,
      coalesce( mti.o, '' )                 as initial_latn,
      coalesce( mtm.o, '' )                 as medial_latn,
      coalesce( mtf.o, '' )                 as final_latn
    from jzr_mirror_triples_base             as mt
    left join disassemble_hangeul( mt.o )    as dh
    left join jzr_mirror_triples_base as mti on ( mti.s = dh.initial and mti.v = 'x:ko-Hang+Latn:initial' )
    left join jzr_mirror_triples_base as mtm on ( mtm.s = dh.medial  and mtm.v = 'x:ko-Hang+Latn:medial'  )
    left join jzr_mirror_triples_base as mtf on ( mtf.s = dh.final   and mtf.v = 'x:ko-Hang+Latn:final'   )
    where true
      and ( mt.v = 'c:reading:ko-Hang' )
      -- and ( ml.dskey = 'dict:meanings' )
      -- and ( ml.field_1 is not null )
      -- and ( ml.field_1 not regexp '^@glyphs' )
      -- and ( ml.field_3 regexp '^(?:py|hi|ka):' )
    order by mt.o
  on conflict ( rowid         ) do nothing
  on conflict ( syllable_hang ) do nothing
  ;`
    };

    //=========================================================================================================
    Jzr_db_adapter.functions = {
      //-------------------------------------------------------------------------------------------------------
      trigger_on_before_insert: {
        /* NOTE in the future this function could trigger creation of triggers on inserts */
        deterministic: true,
        varargs: true,
        call: function(name, ...fields) {
          return this.trigger_on_before_insert(name, ...fields);
        }
      },
      //-------------------------------------------------------------------------------------------------------
      /* NOTE moved to Dbric_std; consider to overwrite with version using `slevithan/regex` */
      // regexp:
      //   overwrite:      true
      //   deterministic:  true
      //   call: ( pattern, text ) -> if ( ( new RegExp pattern, 'v' ).test text ) then 1 else 0

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
      },
      //-------------------------------------------------------------------------------------------------------
      disassemble_hangeul: {
        parameters: ['hang'],
        columns: ['initial', 'medial', 'final'],
        rows: function*(hang) {
          var final, i, initial, jamos, len, medial;
          jamos = this.host.language_services._TMP_hangeul.disassemble(hang, {
            flatten: false
          });
          for (i = 0, len = jamos.length; i < len; i++) {
            ({
              first: initial,
              vowel: medial,
              last: final
            } = jamos[i]);
            yield ({initial, medial, final});
          }
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
      var cause, fields_rpr;
      this.paths = get_paths();
      this.language_services = new Language_services();
      this.dba = new Jzr_db_adapter(this.paths.db, {
        host: this
      });
      try {
        //.......................................................................................................
        /* TAINT move to Jzr_db_adapter together with try/catch */
        this.populate_meaning_mirror_triples();
      } catch (error1) {
        cause = error1;
        fields_rpr = rpr(this.dba._TMP_state.most_recent_inserted_row);
        throw new Error(`Ωjzrsdb___8 when trying to insert this row: ${fields_rpr}, an error was thrown: ${cause.message}`, {cause});
      }
      try {
        //.......................................................................................................
        /* TAINT move to Jzr_db_adapter together with try/catch */
        this.populate_hangeul_syllables();
      } catch (error1) {
        cause = error1;
        fields_rpr = rpr(this.dba._TMP_state.most_recent_inserted_row);
        throw new Error(`Ωjzrsdb___9 when trying to insert this row: ${fields_rpr}, an error was thrown: ${cause.message}`, {cause});
      }
      //.......................................................................................................
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
      help('Ωjzrsdb__10', {total_row_count, total});
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
    populate_hangeul_syllables() {
      this.dba.statements.populate_jzr_lang_hangeul_syllables.run();
      //.......................................................................................................
      return null;
    }

    // #---------------------------------------------------------------------------------------------------------
    // _show_jzr_meta_uc_normalization_faults: ->
    //   faulty_rows = ( @dba.prepare SQL"select * from _jzr_meta_uc_normalization_faults;" ).all()
    //   warn 'Ωjzrsdb__11', reverse faulty_rows
    //   # for row from
    //   #.......................................................................................................
    //   ;null

      //---------------------------------------------------------------------------------------------------------
    show_jzr_meta_faults() {
      var faulty_rows;
      faulty_rows = (this.dba.prepare(SQL`select * from jzr_meta_faults;`)).all();
      // warn 'Ωjzrsdb__12',
      console.table(faulty_rows);
      // for row from
      //.......................................................................................................
      return null;
    }

  };

  //===========================================================================================================
  demo = function() {
    var jzr, seen;
    jzr = new Jizura();
    //.........................................................................................................
    // jzr._show_jzr_meta_uc_normalization_faults()
    jzr.show_jzr_meta_faults();
    // c:reading:ja-x-Hir
    // c:reading:ja-x-Kat
    seen = new Set();
    // for { reading, } from jzr.dba.walk SQL"select distinct( o ) as reading from jzr_triples where v = 'c:reading:ja-x-Kat' order by o;"
    //   for part in ( reading.split /(.ー|.ャ|.ュ|.ョ|ッ.|.)/v ) when part isnt ''
    //     continue if seen.has part
    //     seen.add part
    //     echo part
    // for { reading, } from jzr.dba.walk SQL"select distinct( o ) as reading from jzr_triples where v = 'c:reading:ja-x-Hir' order by o;"
    //   for part in ( reading.split /(.ー|.ゃ|.ゅ|.ょ|っ.|.)/v ) when part isnt ''
    //   # for part in ( reading.split /(.)/v ) when part isnt ''
    //     continue if seen.has part
    //     seen.add part
    //     echo part
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsR0FBQSxFQUFBLFNBQUEsRUFBQSxNQUFBLEVBQUEsY0FBQSxFQUFBLGlCQUFBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLHVCQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsSUFBQSxFQUFBLHlCQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxLQUFBOzs7RUFHQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixDQUFBLENBQUUsS0FBRixFQUNFLEtBREYsRUFFRSxJQUZGLEVBR0UsSUFIRixFQUlFLEtBSkYsRUFLRSxNQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxPQVJGLENBQUEsR0FRNEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFSLENBQW9CLG1CQUFwQixDQVI1Qjs7RUFTQSxDQUFBLENBQUUsR0FBRixFQUNFLE9BREYsRUFFRSxJQUZGLEVBR0UsS0FIRixFQUlFLEtBSkYsRUFLRSxJQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxHQVJGLEVBU0UsSUFURixFQVVFLE9BVkYsRUFXRSxHQVhGLENBQUEsR0FXNEIsR0FBRyxDQUFDLEdBWGhD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UDNCLENBQUEsQ0FBdkI7TUFRQSxLQUFBLEdBQVEsZUFBQSxHQUFrQixDQUFFLG1CQVJoQzs7TUFVSSxJQUFBLENBQUssYUFBTCxFQUFvQixDQUFFLGVBQUYsRUFBbUIsS0FBbkIsQ0FBcEIsRUFWSjs7Ozs7TUFlSSxJQUFDLENBQUEsR0FBRyxDQUFDLFVBQVUsQ0FBQywyQkFBMkIsQ0FBQyxHQUE1QyxDQUFBLEVBZko7Ozs7YUFtQks7SUFwQjhCLENBekJuQzs7O0lBZ0RFLDBCQUE0QixDQUFBLENBQUE7TUFDMUIsSUFBQyxDQUFBLEdBQUcsQ0FBQyxVQUFVLENBQUMsbUNBQW1DLENBQUMsR0FBcEQsQ0FBQSxFQUFKOzthQUVLO0lBSHlCLENBaEQ5Qjs7Ozs7Ozs7Ozs7SUE4REUsb0JBQXNCLENBQUEsQ0FBQTtBQUN4QixVQUFBO01BQUksV0FBQSxHQUFjLENBQUUsSUFBQyxDQUFBLEdBQUcsQ0FBQyxPQUFMLENBQWEsR0FBRyxDQUFBLDhCQUFBLENBQWhCLENBQUYsQ0FBb0QsQ0FBQyxHQUFyRCxDQUFBLEVBQWxCOztNQUVJLE9BQU8sQ0FBQyxLQUFSLENBQWMsV0FBZCxFQUZKOzs7YUFLSztJQU5tQjs7RUFoRXhCLEVBdHFCQTs7O0VBK3VCQSxJQUFBLEdBQU8sUUFBQSxDQUFBLENBQUE7QUFDUCxRQUFBLEdBQUEsRUFBQTtJQUFFLEdBQUEsR0FBTSxJQUFJLE1BQUosQ0FBQSxFQUFSOzs7SUFHRSxHQUFHLENBQUMsb0JBQUosQ0FBQSxFQUhGOzs7SUFNRSxJQUFBLEdBQU8sSUFBSSxHQUFKLENBQUEsRUFOVDs7Ozs7Ozs7Ozs7OztXQW1CRztFQXBCSSxFQS91QlA7OztFQXV3QkEsSUFBRyxNQUFBLEtBQVUsT0FBTyxDQUFDLElBQXJCO0lBQWtDLENBQUEsQ0FBQSxDQUFBLEdBQUE7TUFDaEMsSUFBQSxDQUFBLEVBQUY7O2FBRUc7SUFIK0IsQ0FBQSxJQUFsQzs7QUF2d0JBIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0J1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbkdVWSAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXknXG57IGFsZXJ0XG4gIGRlYnVnXG4gIGhlbHBcbiAgaW5mb1xuICBwbGFpblxuICBwcmFpc2VcbiAgdXJnZVxuICB3YXJuXG4gIHdoaXNwZXIgfSAgICAgICAgICAgICAgID0gR1VZLnRybS5nZXRfbG9nZ2VycyAnaml6dXJhLXNvdXJjZXMtZGInXG57IHJwclxuICBpbnNwZWN0XG4gIGVjaG9cbiAgd2hpdGVcbiAgZ3JlZW5cbiAgYmx1ZVxuICBnb2xkXG4gIGdyZXlcbiAgcmVkXG4gIGJvbGRcbiAgcmV2ZXJzZVxuICBsb2cgICAgIH0gICAgICAgICAgICAgICA9IEdVWS50cm1cbiMgeyBmIH0gICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9lZmZzdHJpbmcnXG4jIHdyaXRlICAgICAgICAgICAgICAgICAgICAgPSAoIHAgKSAtPiBwcm9jZXNzLnN0ZG91dC53cml0ZSBwXG4jIHsgbmZhIH0gICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvbm9ybWFsaXplLWZ1bmN0aW9uLWFyZ3VtZW50cydcbiMgR1RORyAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ndXktdGVzdC1ORydcbiMgeyBUZXN0ICAgICAgICAgICAgICAgICAgfSA9IEdUTkdcbiMgRlMgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6ZnMnXG5QQVRIICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpwYXRoJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5Cc3FsMyAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYmV0dGVyLXNxbGl0ZTMnXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblNGTU9EVUxFUyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvYnJpY2FicmFjLXNmbW9kdWxlcydcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBEYnJpYyxcbiAgRGJyaWNfc3RkLFxuICBTUUwsICAgICAgICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9kYnJpYygpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgbGV0cyxcbiAgZnJlZXplLCAgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfbGV0c2ZyZWV6ZXRoYXRfaW5mcmEoKS5zaW1wbGVcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBKZXRzdHJlYW0sXG4gIEFzeW5jX2pldHN0cmVhbSwgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2pldHN0cmVhbSgpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBCZW5jaG1hcmtlciwgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9iZW5jaG1hcmtpbmcoKVxuYmVuY2htYXJrZXIgICAgICAgICAgICAgICAgICAgPSBuZXcgQmVuY2htYXJrZXIoKVxudGltZWl0ICAgICAgICAgICAgICAgICAgICAgICAgPSAoIFAuLi4gKSAtPiBiZW5jaG1hcmtlci50aW1laXQgUC4uLlxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5mcm9tX2Jvb2wgICAgICAgICAgICAgICAgICAgICA9ICggeCApIC0+IHN3aXRjaCB4XG4gIHdoZW4gdHJ1ZSAgdGhlbiAxXG4gIHdoZW4gZmFsc2UgdGhlbiAwXG4gIGVsc2UgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfX18xIGV4cGVjdGVkIHRydWUgb3IgZmFsc2UsIGdvdCAje3JwciB4fVwiXG5hc19ib29sICAgICAgICAgICAgICAgICAgICAgICA9ICggeCApIC0+IHN3aXRjaCB4XG4gIHdoZW4gMSB0aGVuIHRydWVcbiAgd2hlbiAwIHRoZW4gZmFsc2VcbiAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fXzIgZXhwZWN0ZWQgMCBvciAxLCBnb3QgI3tycHIgeH1cIlxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmRlbW9fc291cmNlX2lkZW50aWZpZXJzID0gLT5cbiAgeyBleHBhbmRfZGljdGlvbmFyeSwgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfZGljdGlvbmFyeV90b29scygpXG4gIHsgZ2V0X2xvY2FsX2Rlc3RpbmF0aW9ucywgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2dldF9sb2NhbF9kZXN0aW5hdGlvbnMoKVxuICBmb3Iga2V5LCB2YWx1ZSBvZiBnZXRfbG9jYWxfZGVzdGluYXRpb25zKClcbiAgICBkZWJ1ZyAnzqlqenJzZGJfX18zJywga2V5LCB2YWx1ZVxuICAjIGNhbiBhcHBlbmQgbGluZSBudW1iZXJzIHRvIGZpbGVzIGFzIGluOlxuICAjICdkaWN0Om1lYW5pbmdzLjE6TD0xMzMzMidcbiAgIyAnZGljdDp1Y2QxNDAuMTp1aGRpZHg6TD0xMjM0J1xuICAjIHJvd2lkczogJ3Q6amZtOlI9MSdcbiAgIyB7XG4gICMgICAnZGljdDptZWFuaW5ncyc6ICAgICAgICAgICckanpyZHMvbWVhbmluZy9tZWFuaW5ncy50eHQnXG4gICMgICAnZGljdDp1Y2Q6djE0LjA6dWhkaWR4JyA6ICckanpyZHMvdW5pY29kZS5vcmctdWNkLXYxNC4wL1VuaWhhbl9EaWN0aW9uYXJ5SW5kaWNlcy50eHQnXG4gICMgICB9XG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZ2V0X3BhdGhzID0gLT5cbiAgUiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IHt9XG4gIFIuYmFzZSAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4nXG4gIFIuanpyICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILnJlc29sdmUgUi5iYXNlLCAnLi4nXG4gIFIuZGIgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gUi5iYXNlLCAnanpyLmRiJ1xuICAjIFIuZGIgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSAnL2Rldi9zaG0vanpyLmRiJ1xuICBSLmp6cmRzICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIFIuYmFzZSwgJ2p6cmRzJ1xuICBSLmp6cm5ld2RzICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIFIuanpyLCAnaml6dXJhLW5ldy1kYXRhc291cmNlcydcbiAgUlsgJ2RpY3Q6bWVhbmluZ3MnICAgICAgICAgIF0gICA9IFBBVEguam9pbiBSLmp6cmRzLCAnbWVhbmluZy9tZWFuaW5ncy50eHQnXG4gIFJbICdkaWN0OnVjZDp2MTQuMDp1aGRpZHgnICBdICAgPSBQQVRILmpvaW4gUi5qenJkcywgJ3VuaWNvZGUub3JnLXVjZC12MTQuMC9VbmloYW5fRGljdGlvbmFyeUluZGljZXMudHh0J1xuICBSWyAnZGljdDp4OmtvLUhhbmcrTGF0bicgICAgXSAgID0gUEFUSC5qb2luIFIuanpybmV3ZHMsICdoYW5nZXVsLXRyYW5zY3JpcHRpb25zLnRzdidcbiAgUlsgJ2RpY3Q6eDpqYS1LYW4rTGF0bicgICAgIF0gICA9IFBBVEguam9pbiBSLmp6cm5ld2RzLCAna2FuYS10cmFuc2NyaXB0aW9ucy50c3YnXG4gIFJbICdkaWN0OmJjcDQ3JyAgICAgICAgICAgICBdICAgPSBQQVRILmpvaW4gUi5qenJuZXdkcywgJ0JDUDQ3LWxhbmd1YWdlLXNjcmlwdHMtcmVnaW9ucy50c3YnXG4gIHJldHVybiBSXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBKenJfZGJfYWRhcHRlciBleHRlbmRzIERicmljX3N0ZFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQGRiX2NsYXNzOiAgQnNxbDNcbiAgQHByZWZpeDogICAgJ2p6cidcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAoIGRiX3BhdGgsIGNmZyA9IHt9ICkgLT5cbiAgICAjIyMgVEFJTlQgbmVlZCBtb3JlIGNsYXJpdHkgYWJvdXQgd2hlbiBzdGF0ZW1lbnRzLCBidWlsZCwgaW5pdGlhbGl6ZS4uLiBpcyBwZXJmb3JtZWQgIyMjXG4gICAgeyBob3N0LCB9ID0gY2ZnXG4gICAgY2ZnICAgICAgID0gbGV0cyBjZmcsICggY2ZnICkgLT4gZGVsZXRlIGNmZy5ob3N0XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBzdXBlciBkYl9wYXRoLCBjZmdcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIEBob3N0ICAgICA9IGhvc3RcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRvID0+XG4gICAgICAjIyMgVEFJTlQgdGhpcyBpcyBub3Qgd2VsbCBwbGFjZWQgIyMjXG4gICAgICAjIyMgTk9URSBleGVjdXRlIGEgR2Fwcy1hbmQtSXNsYW5kcyBFU1NGUkkgdG8gaW1wcm92ZSBzdHJ1Y3R1cmFsIGludGVncml0eSBhc3N1cmFuY2U6ICMjI1xuICAgICAgIyAoIEBwcmVwYXJlIFNRTFwic2VsZWN0ICogZnJvbSBfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMgd2hlcmUgZmFsc2U7XCIgKS5nZXQoKVxuICAgICAgbWVzc2FnZXMgPSBbXVxuICAgICAgZm9yIHsgbmFtZSwgdHlwZSwgfSBmcm9tIEBzdGF0ZW1lbnRzLnN0ZF9nZXRfcmVsYXRpb25zLml0ZXJhdGUoKVxuICAgICAgICB0cnlcbiAgICAgICAgICAoIEBwcmVwYXJlIFNRTFwic2VsZWN0ICogZnJvbSAje25hbWV9IHdoZXJlIGZhbHNlO1wiICkuYWxsKClcbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICBtZXNzYWdlcy5wdXNoIFwiI3t0eXBlfSAje25hbWV9OiAje2Vycm9yLm1lc3NhZ2V9XCJcbiAgICAgICAgICB3YXJuICfOqWp6cnNkYl9fXzQnLCBlcnJvci5tZXNzYWdlXG4gICAgICByZXR1cm4gbnVsbCBpZiBtZXNzYWdlcy5sZW5ndGggaXMgMFxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfX181IEVGRlJJIHRlc3RpbmcgcmV2ZWFsZWQgZXJyb3JzOiAje3JwciBtZXNzYWdlc31cIlxuICAgICAgO251bGxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIEBpc19mcmVzaFxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlcygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl92ZXJicygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9sY29kZXMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGluZXMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlc19mb3JfbWVhbmluZ3MoKVxuICAgIGVsc2VcbiAgICAgIHdhcm4gJ86panpyc2RiX19fNicsIFwic2tpcHBlZCBkYXRhIGluc2VydGlvblwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAYnVpbGQ6IFtcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9kYXRhc291cmNlcyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGRza2V5ICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHBhdGggICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6ZHM6Uj1cXFxcZCskJykpO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX21pcnJvcl9sY29kZXMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBsY29kZSAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBjb21tZW50ICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCBsY29kZSByZWdleHAgJ15bYS16QS1aXStbYS16QS1aMC05XSokJyApLFxuICAgICAgY2hlY2sgKCByb3dpZCA9ICd0Om1yOmxjOlY9JyB8fCBsY29kZSApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX2xpbmVzIChcbiAgICAgICAgLS0gJ3Q6amZtOidcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcmVmICAgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggZHNrZXkgfHwgJzpMPScgfHwgbGluZV9uciApIHZpcnR1YWwsXG4gICAgICAgIGRza2V5ICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmVfbnIgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxjb2RlICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmUgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpZWxkXzEgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgIGZpZWxkXzIgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgIGZpZWxkXzMgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgIGZpZWxkXzQgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bXI6bG46Uj1cXFxcZCskJyksXG4gICAgICB1bmlxdWUgKCBkc2tleSwgbGluZV9uciApLFxuICAgICAgZm9yZWlnbiBrZXkgKCBsY29kZSApIHJlZmVyZW5jZXMganpyX21pcnJvcl9sY29kZXMgKCBsY29kZSApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX3ZlcmJzIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcyAgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgdiAgICAgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgbyAgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNoZWNrICggcm93aWQgcmVnZXhwICdedDptcjp2YjpWPVtcXFxcLTpcXFxcK1xcXFxwe0x9XSskJyApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHJlZiAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHMgICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHYgICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIG8gICAgICAgICBqc29uICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bXI6M3BsOlI9XFxcXGQrJCcgKSxcbiAgICAgIHVuaXF1ZSAoIHJlZiwgcywgdiwgbyApXG4gICAgICBmb3JlaWduIGtleSAoIHJlZiApIHJlZmVyZW5jZXMganpyX21pcnJvcl9saW5lcyAoIHJvd2lkIClcbiAgICAgIGZvcmVpZ24ga2V5ICggdiApIHJlZmVyZW5jZXMganpyX21pcnJvcl92ZXJicyAoIHYgKSApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdHJpZ2dlciBqenJfbWlycm9yX3RyaXBsZXNfcmVnaXN0ZXJcbiAgICAgIGJlZm9yZSBpbnNlcnQgb24ganpyX21pcnJvcl90cmlwbGVzX2Jhc2VcbiAgICAgIGZvciBlYWNoIHJvdyBiZWdpblxuICAgICAgICBzZWxlY3QgdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0KCAnanpyX21pcnJvcl90cmlwbGVzX2Jhc2UnLCBuZXcucm93aWQsIG5ldy5yZWYsIG5ldy5zLCBuZXcudiwgbmV3Lm8gKTtcbiAgICAgICAgZW5kO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgKFxuICAgICAgICByb3dpZCAgICAgICAgICAgdGV4dCAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcmVmICAgICAgICAgICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHN5bGxhYmxlX2hhbmcgICB0ZXh0ICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBzeWxsYWJsZV9sYXRuICAgdGV4dCAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGluaXRpYWxfbGF0biB8fCBtZWRpYWxfbGF0biB8fCBmaW5hbF9sYXRuICkgdmlydHVhbCxcbiAgICAgICAgLS0gc3lsbGFibGVfbGF0biAgIHRleHQgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGluaXRpYWxfbGF0biB8fCBtZWRpYWxfbGF0biB8fCBmaW5hbF9sYXRuICkgdmlydHVhbCxcbiAgICAgICAgaW5pdGlhbF9oYW5nICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIG1lZGlhbF9oYW5nICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBmaW5hbF9oYW5nICAgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgaW5pdGlhbF9sYXRuICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIG1lZGlhbF9sYXRuICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBmaW5hbF9sYXRuICAgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNoZWNrICggcm93aWQgcmVnZXhwICdedDpsYW5nOmhhbmc6c3lsOlY9XFxcXFMrJCcgKVxuICAgICAgLS0gdW5pcXVlICggcmVmLCBzLCB2LCBvIClcbiAgICAgIC0tIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xpbmVzICggcm93aWQgKVxuICAgICAgLS0gZm9yZWlnbiBrZXkgKCBzeWxsYWJsZV9oYW5nICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoIG8gKSApXG4gICAgICApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdHJpZ2dlciBqenJfbGFuZ19oYW5nX3N5bGxhYmxlc19yZWdpc3RlclxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfbGFuZ19oYW5nX3N5bGxhYmxlc1xuICAgICAgZm9yIGVhY2ggcm93IGJlZ2luXG4gICAgICAgIHNlbGVjdCB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfbGFuZ19oYW5nX3N5bGxhYmxlcycsXG4gICAgICAgICAgbmV3LnJvd2lkLCBuZXcucmVmLCBuZXcuc3lsbGFibGVfaGFuZywgbmV3LnN5bGxhYmxlX2xhdG4sXG4gICAgICAgICAgICBuZXcuaW5pdGlhbF9oYW5nLCBuZXcubWVkaWFsX2hhbmcsIG5ldy5maW5hbF9oYW5nLFxuICAgICAgICAgICAgbmV3LmluaXRpYWxfbGF0biwgbmV3Lm1lZGlhbF9sYXRuLCBuZXcuZmluYWxfbGF0biApO1xuICAgICAgICBlbmQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyBzLCBudWxsIGFzIHYsIG51bGwgYXMgbyB3aGVyZSBmYWxzZSB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tTGF0bicsICAgICAgICAgIHN5bGxhYmxlX2xhdG4gICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tTGF0bjppbml0aWFsJywgIGluaXRpYWxfbGF0biAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tTGF0bjptZWRpYWwnLCAgIG1lZGlhbF9sYXRuICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tTGF0bjpmaW5hbCcsICAgIGZpbmFsX2xhdG4gICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tSGFuZzppbml0aWFsJywgIGluaXRpYWxfaGFuZyAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tSGFuZzptZWRpYWwnLCAgIG1lZGlhbF9oYW5nICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tSGFuZzpmaW5hbCcsICAgIGZpbmFsX2hhbmcgICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfYWxsX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyBzLCBudWxsIGFzIHYsIG51bGwgYXMgbyB3aGVyZSBmYWxzZSB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0ICogZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCAqIGZyb20ganpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlcyB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwgd2hlcmUgZmFsc2VcbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyBzLCBudWxsIGFzIHYsIG51bGwgYXMgbyB3aGVyZSBmYWxzZSB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0ICogZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSB3aGVyZSB2IGxpa2UgJ2M6JScgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgdGIucm93aWQsIHRiLnJlZiwgdGIucywga3Iudiwga3IubyBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHRiXG4gICAgICAgIGpvaW4ganpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlcyBhcyBrciBvbiAoIHRiLnYgPSAnYzpyZWFkaW5nOmtvLUhhbmcnIGFuZCB0Yi5vID0ga3IucyApXG4gICAgICAgIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgb3JkZXIgYnkgcywgdiwgb1xuICAgICAgO1wiXCJcIlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMgYXMgc2VsZWN0XG4gICAgICAgIG1sLnJvd2lkICBhcyByb3dpZCxcbiAgICAgICAgbWwucmVmICAgIGFzIHJlZixcbiAgICAgICAgbWwubGluZSAgIGFzIGxpbmVcbiAgICAgIGZyb20ganpyX21pcnJvcl9saW5lcyBhcyBtbFxuICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICBhbmQgKCBub3QgaXNfdWNfbm9ybWFsKCBtbC5saW5lICkgKVxuICAgICAgb3JkZXIgYnkgbWwucm93aWQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV9rcl9yZWFkaW5nc191bmtub3duX3ZlcmJfZmF1bHRzIGFzIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIGNvdW50KCopIG92ZXIgKCBwYXJ0aXRpb24gYnkgdiApICAgIGFzIGNvdW50LFxuICAgICAgICAgICdqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzOlI9KicgIGFzIHJvd2lkLFxuICAgICAgICAgICcqJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAndW5rbm93bi12ZXJiJyAgICAgICAgICAgICAgICAgICAgICBhcyBkZXNjcmlwdGlvbixcbiAgICAgICAgICB2ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBxdW90ZVxuICAgICAgICBmcm9tIGp6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXMgYXMgbm5cbiAgICAgICAgd2hlcmUgbm90IGV4aXN0cyAoIHNlbGVjdCAxIGZyb20ganpyX21pcnJvcl92ZXJicyBhcyB2YiB3aGVyZSB2Yi52ID0gbm4udiApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfbWV0YV9mYXVsdHMgYXNcbiAgICAgIHNlbGVjdCBudWxsIGFzIGNvdW50LCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyBkZXNjcmlwdGlvbiwgbnVsbCAgYXMgcXVvdGUgd2hlcmUgZmFsc2UgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCAxLCByb3dpZCwgcmVmLCAgJ3VjLW5vcm1hbGl6YXRpb24nLCBsaW5lICBhcyBxdW90ZSBmcm9tIF9qenJfbWV0YV91Y19ub3JtYWxpemF0aW9uX2ZhdWx0cyAgICAgICAgICB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tIF9qenJfbWV0YV9rcl9yZWFkaW5nc191bmtub3duX3ZlcmJfZmF1bHRzICB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwgd2hlcmUgZmFsc2VcbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfc3lsbGFibGVzIGFzIHNlbGVjdFxuICAgICMgICAgICAgdDEuc1xuICAgICMgICAgICAgdDEudlxuICAgICMgICAgICAgdDEub1xuICAgICMgICAgICAgdGkucyBhcyBpbml0aWFsX2hhbmdcbiAgICAjICAgICAgIHRtLnMgYXMgbWVkaWFsX2hhbmdcbiAgICAjICAgICAgIHRmLnMgYXMgZmluYWxfaGFuZ1xuICAgICMgICAgICAgdGkubyBhcyBpbml0aWFsX2xhdG5cbiAgICAjICAgICAgIHRtLm8gYXMgbWVkaWFsX2xhdG5cbiAgICAjICAgICAgIHRmLm8gYXMgZmluYWxfbGF0blxuICAgICMgICAgIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgdDFcbiAgICAjICAgICBqb2luXG4gICAgIyAgICAgam9pbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0aSBvbiAoIHQxLilcbiAgICAjICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIyMgYWdncmVnYXRlIHRhYmxlIGZvciBhbGwgcm93aWRzIGdvZXMgaGVyZSAjIyNcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQHN0YXRlbWVudHM6XG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfZGF0YXNvdXJjZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfZGF0YXNvdXJjZXMgKCByb3dpZCwgZHNrZXksIHBhdGggKSB2YWx1ZXMgKCAkcm93aWQsICRkc2tleSwgJHBhdGggKVxuICAgICAgICBvbiBjb25mbGljdCAoIGRza2V5ICkgZG8gdXBkYXRlIHNldCBwYXRoID0gZXhjbHVkZWQucGF0aDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9taXJyb3JfdmVyYjogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3ZlcmJzICggcm93aWQsIHMsIHYsIG8gKSB2YWx1ZXMgKCAkcm93aWQsICRzLCAkdiwgJG8gKVxuICAgICAgICBvbiBjb25mbGljdCAoIHJvd2lkICkgZG8gdXBkYXRlIHNldCBzID0gZXhjbHVkZWQucywgdiA9IGV4Y2x1ZGVkLnYsIG8gPSBleGNsdWRlZC5vO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX21pcnJvcl9sY29kZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX2xjb2RlcyAoIHJvd2lkLCBsY29kZSwgY29tbWVudCApIHZhbHVlcyAoICRyb3dpZCwgJGxjb2RlLCAkY29tbWVudCApXG4gICAgICAgIG9uIGNvbmZsaWN0ICggcm93aWQgKSBkbyB1cGRhdGUgc2V0IGxjb2RlID0gZXhjbHVkZWQubGNvZGUsIGNvbW1lbnQgPSBleGNsdWRlZC5jb21tZW50O1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX21pcnJvcl90cmlwbGU6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgKCByb3dpZCwgcmVmLCBzLCB2LCBvICkgdmFsdWVzICggJHJvd2lkLCAkcmVmLCAkcywgJHYsICRvIClcbiAgICAgICAgb24gY29uZmxpY3QgKCByZWYsIHMsIHYsIG8gKSBkbyBub3RoaW5nO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfbGluZXMgKCByb3dpZCwgZHNrZXksIGxpbmVfbnIsIGxjb2RlLCBsaW5lLCBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80IClcbiAgICAgIHNlbGVjdFxuICAgICAgICAndDptcjpsbjpSPScgfHwgcm93X251bWJlcigpIG92ZXIgKCkgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgIC0tIGRzLmRza2V5IHx8ICc6TD0nIHx8IGZsLmxpbmVfbnIgICBhcyByb3dpZCxcbiAgICAgICAgZHMuZHNrZXkgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGRza2V5LFxuICAgICAgICBmbC5saW5lX25yICAgICAgICAgICAgICAgICAgICAgICAgYXMgbGluZV9ucixcbiAgICAgICAgZmwubGNvZGUgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGxjb2RlLFxuICAgICAgICBmbC5saW5lICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbGluZSxcbiAgICAgICAgZmwuZmllbGRfMSAgICAgICAgICAgICAgICAgICAgICAgIGFzIGZpZWxkXzEsXG4gICAgICAgIGZsLmZpZWxkXzIgICAgICAgICAgICAgICAgICAgICAgICBhcyBmaWVsZF8yLFxuICAgICAgICBmbC5maWVsZF8zICAgICAgICAgICAgICAgICAgICAgICAgYXMgZmllbGRfMyxcbiAgICAgICAgZmwuZmllbGRfNCAgICAgICAgICAgICAgICAgICAgICAgIGFzIGZpZWxkXzRcbiAgICAgIGZyb20ganpyX2RhdGFzb3VyY2VzICAgICAgICBhcyBkc1xuICAgICAgam9pbiBmaWxlX2xpbmVzKCBkcy5wYXRoICkgIGFzIGZsXG4gICAgICB3aGVyZSB0cnVlXG4gICAgICBvbiBjb25mbGljdCAoIGRza2V5LCBsaW5lX25yICkgZG8gdXBkYXRlIHNldCBsaW5lID0gZXhjbHVkZWQubGluZTtcbiAgICAgIFwiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgKCByb3dpZCwgcmVmLCBzLCB2LCBvIClcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICBndC5yb3dpZF9vdXQgICAgYXMgcm93aWQsXG4gICAgICAgICAgICBndC5yZWYgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICAgZ3QucyAgICAgICAgICAgIGFzIHMsXG4gICAgICAgICAgICBndC52ICAgICAgICAgICAgYXMgdixcbiAgICAgICAgICAgIGd0Lm8gICAgICAgICAgICBhcyBvXG4gICAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIG1sXG4gICAgICAgICAgam9pbiBnZXRfdHJpcGxlcyggbWwucm93aWQsIG1sLmRza2V5LCBtbC5maWVsZF8xLCBtbC5maWVsZF8yLCBtbC5maWVsZF8zICkgIGFzIGd0XG4gICAgICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICAgICAgYW5kICggbWwubGNvZGUgPSAnRCcgKVxuICAgICAgICAgICAgLS0gYW5kICggbWwuZHNrZXkgPSAnZGljdDptZWFuaW5ncycgKVxuICAgICAgICAgICAgYW5kICggbWwuZmllbGRfMSBpcyBub3QgbnVsbCApXG4gICAgICAgICAgICBhbmQgKCBtbC5maWVsZF8xIG5vdCByZWdleHAgJ15AZ2x5cGhzJyApXG4gICAgICAgICAgICAtLSBhbmQgKCBtbC5maWVsZF8zIHJlZ2V4cCAnXig/OnB5fGhpfGthKTonIClcbiAgICAgICAgb24gY29uZmxpY3QgKCByZWYsIHMsIHYsIG8gKSBkbyBub3RoaW5nXG4gICAgICAgIDtcbiAgICAgIFwiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbGFuZ19oYW5nZXVsX3N5bGxhYmxlczogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyAoIHJvd2lkLCByZWYsXG4gICAgICAgIHN5bGxhYmxlX2hhbmcsIGluaXRpYWxfaGFuZywgbWVkaWFsX2hhbmcsIGZpbmFsX2hhbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsX2xhdG4sIG1lZGlhbF9sYXRuLCBmaW5hbF9sYXRuXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgIHNlbGVjdFxuICAgICAgICAgICAgJ3Q6bGFuZzpoYW5nOnN5bDpWPScgfHwgbXQubyAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgICAgIG10LnJvd2lkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICAgbXQubyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBzeWxsYWJsZV9oYW5nLFxuICAgICAgICAgICAgZGguaW5pdGlhbCAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBpbml0aWFsX2hhbmcsXG4gICAgICAgICAgICBkaC5tZWRpYWwgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIG1lZGlhbF9oYW5nLFxuICAgICAgICAgICAgZGguZmluYWwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBmaW5hbF9oYW5nLFxuICAgICAgICAgICAgY29hbGVzY2UoIG10aS5vLCAnJyApICAgICAgICAgICAgICAgICBhcyBpbml0aWFsX2xhdG4sXG4gICAgICAgICAgICBjb2FsZXNjZSggbXRtLm8sICcnICkgICAgICAgICAgICAgICAgIGFzIG1lZGlhbF9sYXRuLFxuICAgICAgICAgICAgY29hbGVzY2UoIG10Zi5vLCAnJyApICAgICAgICAgICAgICAgICBhcyBmaW5hbF9sYXRuXG4gICAgICAgICAgZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAgICAgICAgICAgICBhcyBtdFxuICAgICAgICAgIGxlZnQgam9pbiBkaXNhc3NlbWJsZV9oYW5nZXVsKCBtdC5vICkgICAgYXMgZGhcbiAgICAgICAgICBsZWZ0IGpvaW4ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgbXRpIG9uICggbXRpLnMgPSBkaC5pbml0aWFsIGFuZCBtdGkudiA9ICd4OmtvLUhhbmcrTGF0bjppbml0aWFsJyApXG4gICAgICAgICAgbGVmdCBqb2luIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIG10bSBvbiAoIG10bS5zID0gZGgubWVkaWFsICBhbmQgbXRtLnYgPSAneDprby1IYW5nK0xhdG46bWVkaWFsJyAgKVxuICAgICAgICAgIGxlZnQgam9pbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyBtdGYgb24gKCBtdGYucyA9IGRoLmZpbmFsICAgYW5kIG10Zi52ID0gJ3g6a28tSGFuZytMYXRuOmZpbmFsJyAgIClcbiAgICAgICAgICB3aGVyZSB0cnVlXG4gICAgICAgICAgICBhbmQgKCBtdC52ID0gJ2M6cmVhZGluZzprby1IYW5nJyApXG4gICAgICAgICAgICAtLSBhbmQgKCBtbC5kc2tleSA9ICdkaWN0Om1lYW5pbmdzJyApXG4gICAgICAgICAgICAtLSBhbmQgKCBtbC5maWVsZF8xIGlzIG5vdCBudWxsIClcbiAgICAgICAgICAgIC0tIGFuZCAoIG1sLmZpZWxkXzEgbm90IHJlZ2V4cCAnXkBnbHlwaHMnIClcbiAgICAgICAgICAgIC0tIGFuZCAoIG1sLmZpZWxkXzMgcmVnZXhwICdeKD86cHl8aGl8a2EpOicgKVxuICAgICAgICAgIG9yZGVyIGJ5IG10Lm9cbiAgICAgICAgb24gY29uZmxpY3QgKCByb3dpZCAgICAgICAgICkgZG8gbm90aGluZ1xuICAgICAgICBvbiBjb25mbGljdCAoIHN5bGxhYmxlX2hhbmcgKSBkbyBub3RoaW5nXG4gICAgICAgIDtcbiAgICAgIFwiXCJcIlxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9sY29kZXM6IC0+XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0Om1yOmxjOlY9QicsIGxjb2RlOiAnQicsIGNvbW1lbnQ6ICdibGFuayBsaW5lJywgICB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0Om1yOmxjOlY9QycsIGxjb2RlOiAnQycsIGNvbW1lbnQ6ICdjb21tZW50IGxpbmUnLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0Om1yOmxjOlY9RCcsIGxjb2RlOiAnRCcsIGNvbW1lbnQ6ICdkYXRhIGxpbmUnLCAgICB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdmVyYnM6IC0+XG4gICAgIyMjIE5PVEVcbiAgICBpbiB2ZXJicywgaW5pdGlhbCBjb21wb25lbnQgaW5kaWNhdGVzIHR5cGUgb2Ygc3ViamVjdDpcbiAgICAgIGBjOmAgaXMgZm9yIHN1YmplY3RzIHRoYXQgYXJlIENKSyBjaGFyYWN0ZXJzXG4gICAgICBgeDpgIGlzIHVzZWQgZm9yIHVuY2xhc3NpZmllZCBzdWJqZWN0cyAocG9zc2libHkgdG8gYmUgcmVmaW5lZCBpbiB0aGUgZnV0dXJlKVxuICAgICMjI1xuICAgIHJvd3MgPSBbXG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPXg6a28tSGFuZytMYXRuOmluaXRpYWwnLCAgICBzOiBcIk5OXCIsIHY6ICd4OmtvLUhhbmcrTGF0bjppbml0aWFsJywgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj14OmtvLUhhbmcrTGF0bjptZWRpYWwnLCAgICAgczogXCJOTlwiLCB2OiAneDprby1IYW5nK0xhdG46bWVkaWFsJywgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9eDprby1IYW5nK0xhdG46ZmluYWwnLCAgICAgIHM6IFwiTk5cIiwgdjogJ3g6a28tSGFuZytMYXRuOmZpbmFsJywgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzp6aC1MYXRuLXBpbnlpbicsICBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6emgtTGF0bi1waW55aW4nLCAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6amEteC1LYW4nLCAgICAgICAgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmphLXgtS2FuJywgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmphLXgtSGlyJywgICAgICAgIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzpqYS14LUhpcicsICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzpqYS14LUthdCcsICAgICAgICBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6amEteC1LYXQnLCAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6amEteC1MYXRuJywgICAgICAgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmphLXgtTGF0bicsICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmtvLUhhbmcnLCAgICAgICAgIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzprby1IYW5nJywgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzprby1MYXRuJywgICAgICAgICBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6a28tTGF0bicsICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6a28tSGFuZzppbml0aWFsJywgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmtvLUhhbmc6aW5pdGlhbCcsICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmtvLUhhbmc6bWVkaWFsJywgIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzprby1IYW5nOm1lZGlhbCcsICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzprby1IYW5nOmZpbmFsJywgICBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6a28tSGFuZzpmaW5hbCcsICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6a28tTGF0bjppbml0aWFsJywgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmtvLUxhdG46aW5pdGlhbCcsICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmtvLUxhdG46bWVkaWFsJywgIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzprby1MYXRuOm1lZGlhbCcsICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzprby1MYXRuOmZpbmFsJywgICBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6a28tTGF0bjpmaW5hbCcsICAgIG86IFwiTk5cIiwgfVxuICAgICAgXVxuICAgIGZvciByb3cgaW4gcm93c1xuICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfdmVyYi5ydW4gcm93XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlczogLT5cbiAgICBwYXRocyA9IGdldF9wYXRocygpXG4gICAgZHNrZXkgPSAnZGljdDptZWFuaW5ncyc7ICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkaWN0OnVjZDp2MTQuMDp1aGRpZHgnOyAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTInLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkaWN0Ong6a28tSGFuZytMYXRuJzsgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MycsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIDtudWxsXG5cbiAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgX29uX29wZW5fcG9wdWxhdGVfdmVyYnM6IC0+XG4gICMgICBwYXRocyA9IGdldF9wYXRocygpXG4gICMgICBkc2tleSA9ICdkaWN0Om1lYW5pbmdzJzsgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEnLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgIyAgIGRza2V5ID0gJ2RpY3Q6dWNkOnYxNC4wOnVoZGlkeCc7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MicsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAjICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGluZXM6IC0+XG4gICAgQHN0YXRlbWVudHMucG9wdWxhdGVfanpyX21pcnJvcl9saW5lcy5ydW4oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXNfZm9yX21lYW5pbmdzOiAtPlxuICAgICMgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXIoKVxuICAgIEBfVE1QX3N0YXRlID0geyB0cmlwbGVfY291bnQ6IDAsIG1vc3RfcmVjZW50X2luc2VydGVkX3JvdzogbnVsbCB9XG4gICAgIyBtZSA9IEBcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaWdnZXJfb25fYmVmb3JlX2luc2VydDogKCBuYW1lLCBmaWVsZHMuLi4gKSAtPlxuICAgIEBfVE1QX3N0YXRlLm1vc3RfcmVjZW50X2luc2VydGVkX3JvdyA9IHsgbmFtZSwgZmllbGRzLCB9XG4gICAgO251bGxcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIEBmdW5jdGlvbnM6XG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIHRyaWdnZXJfb25fYmVmb3JlX2luc2VydDpcbiAgICAgICMjIyBOT1RFIGluIHRoZSBmdXR1cmUgdGhpcyBmdW5jdGlvbiBjb3VsZCB0cmlnZ2VyIGNyZWF0aW9uIG9mIHRyaWdnZXJzIG9uIGluc2VydHMgIyMjXG4gICAgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICAgdmFyYXJnczogICAgICAgIHRydWVcbiAgICAgIGNhbGw6ICggbmFtZSwgZmllbGRzLi4uICkgLT4gQHRyaWdnZXJfb25fYmVmb3JlX2luc2VydCBuYW1lLCBmaWVsZHMuLi5cblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyMjIE5PVEUgbW92ZWQgdG8gRGJyaWNfc3RkOyBjb25zaWRlciB0byBvdmVyd3JpdGUgd2l0aCB2ZXJzaW9uIHVzaW5nIGBzbGV2aXRoYW4vcmVnZXhgICMjI1xuICAgICMgcmVnZXhwOlxuICAgICMgICBvdmVyd3JpdGU6ICAgICAgdHJ1ZVxuICAgICMgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICMgICBjYWxsOiAoIHBhdHRlcm4sIHRleHQgKSAtPiBpZiAoICggbmV3IFJlZ0V4cCBwYXR0ZXJuLCAndicgKS50ZXN0IHRleHQgKSB0aGVuIDEgZWxzZSAwXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGlzX3VjX25vcm1hbDpcbiAgICAgIGRldGVybWluaXN0aWM6ICB0cnVlXG4gICAgICAjIyMgTk9URTogYWxzbyBzZWUgYFN0cmluZzo6aXNXZWxsRm9ybWVkKClgICMjI1xuICAgICAgY2FsbDogKCB0ZXh0LCBmb3JtID0gJ05GQycgKSAtPiBmcm9tX2Jvb2wgdGV4dCBpcyB0ZXh0Lm5vcm1hbGl6ZSBmb3JtICMjIyAnTkZDJywgJ05GRCcsICdORktDJywgb3IgJ05GS0QnICMjI1xuXG4gICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgQHRhYmxlX2Z1bmN0aW9uczpcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgc3BsaXRfd29yZHM6XG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2tleXdvcmQnLCBdXG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ2xpbmUnLCBdXG4gICAgICByb3dzOiAoIGxpbmUgKSAtPlxuICAgICAgICBrZXl3b3JkcyA9IGxpbmUuc3BsaXQgLyg/OlxccHtafSspfCgoPzpcXHB7U2NyaXB0PUhhbn0pfCg/OlxccHtMfSspfCg/OlxccHtOfSspfCg/OlxccHtTfSspKS92XG4gICAgICAgIGZvciBrZXl3b3JkIGluIGtleXdvcmRzXG4gICAgICAgICAgY29udGludWUgdW5sZXNzIGtleXdvcmQ/XG4gICAgICAgICAgY29udGludWUgaWYga2V5d29yZCBpcyAnJ1xuICAgICAgICAgIHlpZWxkIHsga2V5d29yZCwgfVxuICAgICAgICA7bnVsbFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBmaWxlX2xpbmVzOlxuICAgICAgY29sdW1uczogICAgICBbICdsaW5lX25yJywgJ2xjb2RlJywgJ2xpbmUnLCAnZmllbGRfMScsICdmaWVsZF8yJywgJ2ZpZWxkXzMnLCAnZmllbGRfNCcsIF1cbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAncGF0aCcsIF1cbiAgICAgIHJvd3M6ICggcGF0aCApIC0+XG4gICAgICAgIGZvciB7IGxucjogbGluZV9uciwgbGluZSwgZW9sLCB9IGZyb20gd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBwYXRoXG4gICAgICAgICAgZmllbGRfMSA9IGZpZWxkXzIgPSBmaWVsZF8zID0gZmllbGRfNCA9IG51bGxcbiAgICAgICAgICBzd2l0Y2ggdHJ1ZVxuICAgICAgICAgICAgd2hlbiAvXlxccyokL3YudGVzdCBsaW5lXG4gICAgICAgICAgICAgIGxjb2RlID0gJ0InXG4gICAgICAgICAgICB3aGVuIC9eXFxzKiMvdi50ZXN0IGxpbmVcbiAgICAgICAgICAgICAgbGNvZGUgPSAnQydcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgbGNvZGUgPSAnRCdcbiAgICAgICAgICAgICAgWyBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80LCBdID0gbGluZS5zcGxpdCAnXFx0J1xuICAgICAgICAgICAgICBmaWVsZF8xID89IG51bGxcbiAgICAgICAgICAgICAgZmllbGRfMiA/PSBudWxsXG4gICAgICAgICAgICAgIGZpZWxkXzMgPz0gbnVsbFxuICAgICAgICAgICAgICBmaWVsZF80ID89IG51bGxcbiAgICAgICAgICB5aWVsZCB7IGxpbmVfbnIsIGxjb2RlLCBsaW5lLCBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80LCB9XG4gICAgICAgIDtudWxsXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGdldF90cmlwbGVzOlxuICAgICAgcGFyYW1ldGVyczogICBbICdyb3dpZF9pbicsICdkc2tleScsICdmaWVsZF8xJywgJ2ZpZWxkXzInLCAnZmllbGRfMycsICdmaWVsZF80JywgXVxuICAgICAgY29sdW1uczogICAgICBbICdyb3dpZF9vdXQnLCAncmVmJywgJ3MnLCAndicsICdvJywgXVxuICAgICAgcm93czogKCByb3dpZF9pbiwgZHNrZXksIGZpZWxkXzEsIGZpZWxkXzIsIGZpZWxkXzMsIGZpZWxkXzQgKSAtPlxuICAgICAgICB5aWVsZCBmcm9tIEBnZXRfdHJpcGxlcyByb3dpZF9pbiwgZHNrZXksIGZpZWxkXzEsIGZpZWxkXzIsIGZpZWxkXzMsIGZpZWxkXzRcbiAgICAgICAgO251bGxcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgZGlzYXNzZW1ibGVfaGFuZ2V1bDpcbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAnaGFuZycsIF1cbiAgICAgIGNvbHVtbnM6ICAgICAgWyAnaW5pdGlhbCcsICdtZWRpYWwnLCAnZmluYWwnLCBdXG4gICAgICByb3dzOiAoIGhhbmcgKSAtPlxuICAgICAgICBqYW1vcyA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLl9UTVBfaGFuZ2V1bC5kaXNhc3NlbWJsZSBoYW5nLCB7IGZsYXR0ZW46IGZhbHNlLCB9XG4gICAgICAgIGZvciB7IGZpcnN0OiBpbml0aWFsLCB2b3dlbDogbWVkaWFsLCBsYXN0OiBmaW5hbCwgfSBpbiBqYW1vc1xuICAgICAgICAgIHlpZWxkIHsgaW5pdGlhbCwgbWVkaWFsLCBmaW5hbCwgfVxuICAgICAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZ2V0X3RyaXBsZXM6ICggcm93aWRfaW4sIGRza2V5LCBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80ICkgLT5cbiAgICByZWYgICAgICAgICAgID0gcm93aWRfaW5cbiAgICBzICAgICAgICAgICAgID0gZmllbGRfMlxuICAgIHYgICAgICAgICAgICAgPSBudWxsXG4gICAgbyAgICAgICAgICAgICA9IG51bGxcbiAgICBlbnRyeSAgICAgICAgID0gZmllbGRfM1xuICAgICMgeDprby1IYW5nK0xhdG46aW5pdGlhbFxuICAgICMgeDprby1IYW5nK0xhdG46bWVkaWFsXG4gICAgIyB4OmtvLUhhbmcrTGF0bjpmaW5hbFxuICAgICMgcmVhZGluZzp6aC1MYXRuLXBpbnlpblxuICAgICMgcmVhZGluZzpqYS14LUthblxuICAgICMgcmVhZGluZzpqYS14LUhpclxuICAgICMgcmVhZGluZzpqYS14LUthdFxuICAgICMgcmVhZGluZzpqYS14LUxhdG5cbiAgICAjIHJlYWRpbmc6a28tSGFuZ1xuICAgICMgcmVhZGluZzprby1MYXRuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBzd2l0Y2ggdHJ1ZVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgd2hlbiAoIGRza2V5IGlzICdkaWN0Ong6a28tSGFuZytMYXRuJyApICMgYW5kICggZW50cnkuc3RhcnRzV2l0aCAncHk6JyApXG4gICAgICAgIHJvbGUgICAgICA9IGZpZWxkXzFcbiAgICAgICAgdiAgICAgICAgID0gXCJ4OmtvLUhhbmcrTGF0bjoje3JvbGV9XCJcbiAgICAgICAgcmVhZGluZ3MgID0gWyBmaWVsZF8zLCBdXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB3aGVuICggZHNrZXkgaXMgJ2RpY3Q6bWVhbmluZ3MnICkgYW5kICggZW50cnkuc3RhcnRzV2l0aCAncHk6JyApXG4gICAgICAgIHYgICAgICAgICA9ICdjOnJlYWRpbmc6emgtTGF0bi1waW55aW4nXG4gICAgICAgIHJlYWRpbmdzICA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfYXRvbmFsX3poX3JlYWRpbmdzIGVudHJ5XG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB3aGVuICggZHNrZXkgaXMgJ2RpY3Q6bWVhbmluZ3MnICkgYW5kICggZW50cnkuc3RhcnRzV2l0aCAna2E6JyApXG4gICAgICAgIHYgICAgICAgICA9ICdjOnJlYWRpbmc6amEteC1LYXQnXG4gICAgICAgIHJlYWRpbmdzICA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfamFfcmVhZGluZ3MgZW50cnlcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHdoZW4gKCBkc2tleSBpcyAnZGljdDptZWFuaW5ncycgKSBhbmQgKCBlbnRyeS5zdGFydHNXaXRoICdoaTonIClcbiAgICAgICAgdiAgICAgICAgID0gJ2M6cmVhZGluZzpqYS14LUhpcidcbiAgICAgICAgcmVhZGluZ3MgID0gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9qYV9yZWFkaW5ncyBlbnRyeVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgd2hlbiAoIGRza2V5IGlzICdkaWN0Om1lYW5pbmdzJyApIGFuZCAoIGVudHJ5LnN0YXJ0c1dpdGggJ2hnOicgKVxuICAgICAgICB2ICAgICAgICAgPSAnYzpyZWFkaW5nOmtvLUhhbmcnXG4gICAgICAgIHJlYWRpbmdzICA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfaGdfcmVhZGluZ3MgZW50cnlcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiB2P1xuICAgICAgZm9yIHJlYWRpbmcgaW4gcmVhZGluZ3NcbiAgICAgICAgQF9UTVBfc3RhdGUudHJpcGxlX2NvdW50KytcbiAgICAgICAgcm93aWRfb3V0ID0gXCJ0Om1yOjNwbDpSPSN7QF9UTVBfc3RhdGUudHJpcGxlX2NvdW50fVwiXG4gICAgICAgIG8gICAgICAgICA9IHJlYWRpbmdcbiAgICAgICAgeWllbGQgeyByb3dpZF9vdXQsIHJlZiwgcywgdiwgbywgfVxuICAgICAgICBAX1RNUF9zdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHJldHVybiBudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBMYW5ndWFnZV9zZXJ2aWNlc1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQF9UTVBfaGFuZ2V1bCA9IHJlcXVpcmUgJ2hhbmd1bC1kaXNhc3NlbWJsZSdcbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICByZW1vdmVfcGlueWluX2RpYWNyaXRpY3M6ICggdGV4dCApIC0+ICggdGV4dC5ub3JtYWxpemUgJ05GS0QnICkucmVwbGFjZSAvXFxQe0x9L2d2LCAnJ1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZXh0cmFjdF9hdG9uYWxfemhfcmVhZGluZ3M6ICggZW50cnkgKSAtPlxuICAgICMgcHk6emjDuSwgemhlLCB6aMSBbywgemjDoW8sIHpox5QsIHrEq1xuICAgIFIgPSBlbnRyeVxuICAgIFIgPSBSLnJlcGxhY2UgL15weTovdiwgJydcbiAgICBSID0gUi5zcGxpdCAvLFxccyovdlxuICAgIFIgPSAoICggQHJlbW92ZV9waW55aW5fZGlhY3JpdGljcyB6aF9yZWFkaW5nICkgZm9yIHpoX3JlYWRpbmcgaW4gUiApXG4gICAgUiA9IG5ldyBTZXQgUlxuICAgIFIuZGVsZXRlICdudWxsJ1xuICAgIFIuZGVsZXRlICdAbnVsbCdcbiAgICByZXR1cm4gWyBSLi4uLCBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBleHRyYWN0X2phX3JlYWRpbmdzOiAoIGVudHJ5ICkgLT5cbiAgICAjIOepuiAgICAgIGhpOuOBneOCiSwg44GCwrco44GPfOOBjXzjgZHjgospLCDjgYvjgoksIOOBmcK3KOOBj3zjgYvjgZkpLCDjgoDjgarCt+OBl+OBhFxuICAgIFIgPSBlbnRyeVxuICAgIFIgPSBSLnJlcGxhY2UgL14oPzpoaXxrYSk6L3YsICcnXG4gICAgUiA9IFIucmVwbGFjZSAvXFxzKy9ndiwgJydcbiAgICBSID0gUi5zcGxpdCAvLFxccyovdlxuICAgICMjIyBOT1RFIHJlbW92ZSBuby1yZWFkaW5ncyBtYXJrZXIgYEBudWxsYCBhbmQgY29udGV4dHVhbCByZWFkaW5ncyBsaWtlIC3jg43jg7MgZm9yIOe4gSwgLeODjuOCpiBmb3Ig546LICMjI1xuICAgIFIgPSAoIHJlYWRpbmcgZm9yIHJlYWRpbmcgaW4gUiB3aGVuIG5vdCByZWFkaW5nLnN0YXJ0c1dpdGggJy0nIClcbiAgICBSID0gbmV3IFNldCBSXG4gICAgUi5kZWxldGUgJ251bGwnXG4gICAgUi5kZWxldGUgJ0BudWxsJ1xuICAgIHJldHVybiBbIFIuLi4sIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGV4dHJhY3RfaGdfcmVhZGluZ3M6ICggZW50cnkgKSAtPlxuICAgICMg56m6ICAgICAgaGk644Gd44KJLCDjgYLCtyjjgY9844GNfOOBkeOCiyksIOOBi+OCiSwg44GZwrco44GPfOOBi+OBmSksIOOCgOOBqsK344GX44GEXG4gICAgUiA9IGVudHJ5XG4gICAgUiA9IFIucmVwbGFjZSAvXig/OmhnKTovdiwgJydcbiAgICBSID0gUi5yZXBsYWNlIC9cXHMrL2d2LCAnJ1xuICAgIFIgPSBSLnNwbGl0IC8sXFxzKi92XG4gICAgUiA9IG5ldyBTZXQgUlxuICAgIFIuZGVsZXRlICdudWxsJ1xuICAgIFIuZGVsZXRlICdAbnVsbCdcbiAgICBoYW5nZXVsID0gWyBSLi4uLCBdLmpvaW4gJydcbiAgICAjIGRlYnVnICfOqWp6cnNkYl9fXzcnLCBAX1RNUF9oYW5nZXVsLmRpc2Fzc2VtYmxlIGhhbmdldWwsIHsgZmxhdHRlbjogZmFsc2UsIH1cbiAgICByZXR1cm4gWyBSLi4uLCBdXG5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyMgVEFJTlQgZ29lcyBpbnRvIGNvbnN0cnVjdG9yIG9mIEp6ciBjbGFzcyAjIyNcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBKaXp1cmFcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBwYXRocyAgICAgICAgICAgICAgPSBnZXRfcGF0aHMoKVxuICAgIEBsYW5ndWFnZV9zZXJ2aWNlcyAgPSBuZXcgTGFuZ3VhZ2Vfc2VydmljZXMoKVxuICAgIEBkYmEgICAgICAgICAgICAgICAgPSBuZXcgSnpyX2RiX2FkYXB0ZXIgQHBhdGhzLmRiLCB7IGhvc3Q6IEAsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMjIyBUQUlOVCBtb3ZlIHRvIEp6cl9kYl9hZGFwdGVyIHRvZ2V0aGVyIHdpdGggdHJ5L2NhdGNoICMjI1xuICAgIHRyeVxuICAgICAgQHBvcHVsYXRlX21lYW5pbmdfbWlycm9yX3RyaXBsZXMoKVxuICAgIGNhdGNoIGNhdXNlXG4gICAgICBmaWVsZHNfcnByID0gcnByIEBkYmEuX1RNUF9zdGF0ZS5tb3N0X3JlY2VudF9pbnNlcnRlZF9yb3dcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX19fOCB3aGVuIHRyeWluZyB0byBpbnNlcnQgdGhpcyByb3c6ICN7ZmllbGRzX3Jwcn0sIGFuIGVycm9yIHdhcyB0aHJvd246ICN7Y2F1c2UubWVzc2FnZX1cIiwgXFxcbiAgICAgICAgeyBjYXVzZSwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyMjIFRBSU5UIG1vdmUgdG8gSnpyX2RiX2FkYXB0ZXIgdG9nZXRoZXIgd2l0aCB0cnkvY2F0Y2ggIyMjXG4gICAgdHJ5XG4gICAgICBAcG9wdWxhdGVfaGFuZ2V1bF9zeWxsYWJsZXMoKVxuICAgIGNhdGNoIGNhdXNlXG4gICAgICBmaWVsZHNfcnByID0gcnByIEBkYmEuX1RNUF9zdGF0ZS5tb3N0X3JlY2VudF9pbnNlcnRlZF9yb3dcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX19fOSB3aGVuIHRyeWluZyB0byBpbnNlcnQgdGhpcyByb3c6ICN7ZmllbGRzX3Jwcn0sIGFuIGVycm9yIHdhcyB0aHJvd246ICN7Y2F1c2UubWVzc2FnZX1cIiwgXFxcbiAgICAgICAgeyBjYXVzZSwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO3VuZGVmaW5lZFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcG9wdWxhdGVfbWVhbmluZ19taXJyb3JfdHJpcGxlczogLT5cbiAgICB7IHRvdGFsX3Jvd19jb3VudCwgfSA9ICggQGRiYS5wcmVwYXJlIFNRTFwiXCJcIlxuICAgICAgc2VsZWN0XG4gICAgICAgICAgY291bnQoKikgYXMgdG90YWxfcm93X2NvdW50XG4gICAgICAgIGZyb20ganpyX21pcnJvcl9saW5lc1xuICAgICAgICB3aGVyZSB0cnVlXG4gICAgICAgICAgYW5kICggZHNrZXkgaXMgJ2RpY3Q6bWVhbmluZ3MnIClcbiAgICAgICAgICBhbmQgKCBmaWVsZF8xIGlzIG5vdCBudWxsIClcbiAgICAgICAgICBhbmQgKCBub3QgZmllbGRfMSByZWdleHAgJ15AZ2x5cGhzJyApO1wiXCJcIiApLmdldCgpXG4gICAgdG90YWwgPSB0b3RhbF9yb3dfY291bnQgKiAyICMjIyBOT1RFIGVzdGltYXRlICMjI1xuICAgICMgeyB0b3RhbF9yb3dfY291bnQsIHRvdGFsLCB9ID0geyB0b3RhbF9yb3dfY291bnQ6IDQwMDg2LCB0b3RhbDogODAxNzIgfSAjICEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhXG4gICAgaGVscCAnzqlqenJzZGJfXzEwJywgeyB0b3RhbF9yb3dfY291bnQsIHRvdGFsLCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIGJyYW5kID0gJ0JSQU5EJ1xuICAgICMgdGltZWl0IHsgdG90YWwsIGJyYW5kLCB9LCBwb3B1bGF0ZV90cmlwbGVzXzFfY29ubmVjdGlvbiA9ICh7IHByb2dyZXNzLCB9KSA9PlxuICAgICMgQF9UTVBfc3RhdGUudGltZWl0X3Byb2dyZXNzID0gcHJvZ3Jlc3NcbiAgICBAZGJhLnN0YXRlbWVudHMucG9wdWxhdGVfanpyX21pcnJvcl90cmlwbGVzLnJ1bigpXG4gICAgIyBAX1RNUF9zdGF0ZS50aW1laXRfcHJvZ3Jlc3MgPSBudWxsXG4gICAgIyA7bnVsbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHBvcHVsYXRlX2hhbmdldWxfc3lsbGFibGVzOiAtPlxuICAgIEBkYmEuc3RhdGVtZW50cy5wb3B1bGF0ZV9qenJfbGFuZ19oYW5nZXVsX3N5bGxhYmxlcy5ydW4oKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBfc2hvd19qenJfbWV0YV91Y19ub3JtYWxpemF0aW9uX2ZhdWx0czogLT5cbiAgIyAgIGZhdWx0eV9yb3dzID0gKCBAZGJhLnByZXBhcmUgU1FMXCJzZWxlY3QgKiBmcm9tIF9qenJfbWV0YV91Y19ub3JtYWxpemF0aW9uX2ZhdWx0cztcIiApLmFsbCgpXG4gICMgICB3YXJuICfOqWp6cnNkYl9fMTEnLCByZXZlcnNlIGZhdWx0eV9yb3dzXG4gICMgICAjIGZvciByb3cgZnJvbVxuICAjICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzaG93X2p6cl9tZXRhX2ZhdWx0czogLT5cbiAgICBmYXVsdHlfcm93cyA9ICggQGRiYS5wcmVwYXJlIFNRTFwic2VsZWN0ICogZnJvbSBqenJfbWV0YV9mYXVsdHM7XCIgKS5hbGwoKVxuICAgICMgd2FybiAnzqlqenJzZGJfXzEyJyxcbiAgICBjb25zb2xlLnRhYmxlIGZhdWx0eV9yb3dzXG4gICAgIyBmb3Igcm93IGZyb21cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDtudWxsXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZGVtbyA9IC0+XG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMganpyLl9zaG93X2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzKClcbiAganpyLnNob3dfanpyX21ldGFfZmF1bHRzKClcbiAgIyBjOnJlYWRpbmc6amEteC1IaXJcbiAgIyBjOnJlYWRpbmc6amEteC1LYXRcbiAgc2VlbiA9IG5ldyBTZXQoKVxuICAjIGZvciB7IHJlYWRpbmcsIH0gZnJvbSBqenIuZGJhLndhbGsgU1FMXCJzZWxlY3QgZGlzdGluY3QoIG8gKSBhcyByZWFkaW5nIGZyb20ganpyX3RyaXBsZXMgd2hlcmUgdiA9ICdjOnJlYWRpbmc6amEteC1LYXQnIG9yZGVyIGJ5IG87XCJcbiAgIyAgIGZvciBwYXJ0IGluICggcmVhZGluZy5zcGxpdCAvKC7jg7x8LuODo3wu44OlfC7jg6d844ODLnwuKS92ICkgd2hlbiBwYXJ0IGlzbnQgJydcbiAgIyAgICAgY29udGludWUgaWYgc2Vlbi5oYXMgcGFydFxuICAjICAgICBzZWVuLmFkZCBwYXJ0XG4gICMgICAgIGVjaG8gcGFydFxuICAjIGZvciB7IHJlYWRpbmcsIH0gZnJvbSBqenIuZGJhLndhbGsgU1FMXCJzZWxlY3QgZGlzdGluY3QoIG8gKSBhcyByZWFkaW5nIGZyb20ganpyX3RyaXBsZXMgd2hlcmUgdiA9ICdjOnJlYWRpbmc6amEteC1IaXInIG9yZGVyIGJ5IG87XCJcbiAgIyAgIGZvciBwYXJ0IGluICggcmVhZGluZy5zcGxpdCAvKC7jg7x8LuOCg3wu44KFfC7jgod844GjLnwuKS92ICkgd2hlbiBwYXJ0IGlzbnQgJydcbiAgIyAgICMgZm9yIHBhcnQgaW4gKCByZWFkaW5nLnNwbGl0IC8oLikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICMgICAgIGNvbnRpbnVlIGlmIHNlZW4uaGFzIHBhcnRcbiAgIyAgICAgc2Vlbi5hZGQgcGFydFxuICAjICAgICBlY2hvIHBhcnRcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICA7bnVsbFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuaWYgbW9kdWxlIGlzIHJlcXVpcmUubWFpbiB0aGVuIGRvID0+XG4gIGRlbW8oKVxuICAjIGRlbW9fc291cmNlX2lkZW50aWZpZXJzKClcbiAgO251bGxcblxuIl19
