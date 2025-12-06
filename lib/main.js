(function() {
  'use strict';
  var Async_jetstream, Benchmarker, Bsql3, Dbric, Dbric_std, GUY, Jetstream, Jizura, Jzr_db_adapter, Language_services, PATH, SFMODULES, SQL, alert, as_bool, benchmarker, blue, bold, debug, demo, demo_read_dump, demo_source_identifiers, echo, freeze, from_bool, get_paths, gold, green, grey, help, info, inspect, lets, log, plain, praise, red, reverse, rpr, timeit, urge, walk_lines_with_positions, warn, whisper, white;

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
    var R, kanjium;
    R = {};
    R.base = PATH.resolve(__dirname, '..');
    R.jzr = PATH.resolve(R.base, '..');
    R.db = PATH.join(R.base, 'jzr.db');
    // R.db                            = '/dev/shm/jzr.db'
    R.jzrds = PATH.join(R.base, 'jzrds');
    R.jzrnewds = PATH.join(R.jzr, 'jizura-new-datasources');
    R.raw_github = PATH.join(R.jzrnewds, 'bvfs/origin/https/raw.githubusercontent.com');
    kanjium = PATH.join(R.raw_github, 'mifunetoshiro/kanjium/8a0cdaa16d64a281a2048de2eee2ec5e3a440fa6');
    R['dict:meanings'] = PATH.join(R.jzrds, 'meaning/meanings.txt');
    R['dict:ucd:v14.0:uhdidx'] = PATH.join(R.jzrds, 'unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt');
    R['dict:x:ko-Hang+Latn'] = PATH.join(R.jzrnewds, 'hangeul-transcriptions.tsv');
    R['dict:x:ja-Kan+Latn'] = PATH.join(R.jzrnewds, 'kana-transcriptions.tsv');
    R['dict:bcp47'] = PATH.join(R.jzrnewds, 'BCP47-language-scripts-regions.tsv');
    R['dict:ja:kanjium'] = PATH.join(kanjium, 'data/source_files/kanjidict.txt');
    R['dict:ja:kanjium:aux'] = PATH.join(kanjium, 'data/source_files/0_README.txt');
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
        dskey = 'dict:x:ja-Kan+Latn';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=4',
          dskey,
          path: paths[dskey]
        });
        dskey = 'dict:ja:kanjium';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=5',
          dskey,
          path: paths[dskey]
        });
        dskey = 'dict:ja:kanjium:aux';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=6',
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
  jfields   json                null,
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
      populate_jzr_mirror_lines: SQL`insert into jzr_mirror_lines ( rowid, dskey, line_nr, lcode, line, jfields, field_1, field_2, field_3, field_4 )
select
  't:mr:ln:R=' || row_number() over ()          as rowid,
  -- ds.dskey || ':L=' || fl.line_nr   as rowid,
  ds.dskey                          as dskey,
  fl.line_nr                        as line_nr,
  fl.lcode                          as lcode,
  fl.line                           as line,
  fl.jfields                        as jfields,
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
        columns: ['line_nr', 'lcode', 'line', 'jfields', 'field_1', 'field_2', 'field_3', 'field_4'],
        parameters: ['path'],
        rows: function*(path) {
          var eol, field_1, field_2, field_3, field_4, jfields, lcode, line, line_nr, y;
          for (y of walk_lines_with_positions(path)) {
            ({
              lnr: line_nr,
              line,
              eol
            } = y);
            line = this.host.language_services.normalize_text(line);
            field_1 = field_2 = field_3 = field_4 = jfields = null;
            switch (true) {
              case /^\s*$/v.test(line):
                lcode = 'B';
                break;
              case /^\s*#/v.test(line):
                lcode = 'C';
                break;
              default:
                lcode = 'D';
                [field_1, field_2, field_3, field_4] = jfields = line.split('\t');
                jfields = JSON.stringify(jfields);
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
            yield ({line_nr, lcode, line, jfields, field_1, field_2, field_3, field_4});
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
    normalize_text(text, form = 'NFC') {
      return text.normalize(form);
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
    show_counts() {
      var count, counts, dskey;
      counts = (this.dba.prepare(SQL`select v, count(*) from jzr_mirror_triples_base group by v;`)).all();
      console.table(counts);
      counts = (this.dba.prepare(SQL`select v, count(*) from jzr_triples group by v;`)).all();
      console.table(counts);
      counts = (this.dba.prepare(SQL`select dskey, count(*) as count from jzr_mirror_lines group by dskey union all
select '*',   count(*) as count from jzr_mirror_lines
order by count;`)).all();
      counts = Object.fromEntries((function() {
        var i, len, results;
        results = [];
        for (i = 0, len = counts.length; i < len; i++) {
          ({dskey, count} = counts[i]);
          results.push([dskey, {count}]);
        }
        return results;
      })());
      console.table(counts);
      //.......................................................................................................
      return null;
    }

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
    var jzr;
    jzr = new Jizura();
    //.........................................................................................................
    // jzr._show_jzr_meta_uc_normalization_faults()
    jzr.show_counts();
    jzr.show_jzr_meta_faults();
    // c:reading:ja-x-Hir
    // c:reading:ja-x-Kat
    // seen = new Set()
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

  //-----------------------------------------------------------------------------------------------------------
  demo_read_dump = function() {
    var Undumper, count, jzr, line, path, row, statement, undumper, y;
    ({Undumper} = SFMODULES.require_coarse_sqlite_statement_segmenter());
    ({walk_lines_with_positions} = SFMODULES.unstable.require_fast_linereader());
    jzr = new Jizura();
    jzr.dba.teardown({
      test: '*'
    });
    // debug 'Ωjzrsdb__13', row for row from jzr.dba.walk SQL"select name, type from sqlite_schema;"
    path = PATH.resolve(__dirname, '../jzr.dump.sql');
    undumper = new Undumper({
      db: jzr.dba
    });
    count = 0;
    for (y of walk_lines_with_positions(path)) {
      ({line} = y);
// debug 'Ωjzrsdb__14', rpr line
      for (statement of undumper.scan(line)) {
        count++;
        echo(`Line ${count}:`, statement);
        if ((count % 10) === 0) {
          help('Ωjzrsdb__16', `read ${count} statements`);
        }
      }
    }
    for (row of jzr.dba.walk(SQL`select name, type from sqlite_schema;`)) {
      debug('Ωjzrsdb__17', row);
    }
    //.........................................................................................................
    return null;
  };

  //===========================================================================================================
  if (module === require.main) {
    (() => {
      // demo()
      demo_read_dump();
      return null;
    })();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsR0FBQSxFQUFBLFNBQUEsRUFBQSxNQUFBLEVBQUEsY0FBQSxFQUFBLGlCQUFBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLGNBQUEsRUFBQSx1QkFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSx5QkFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQTs7O0VBR0EsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxLQURGLEVBRUUsSUFGRixFQUdFLElBSEYsRUFJRSxLQUpGLEVBS0UsTUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsT0FSRixDQUFBLEdBUTRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBUixDQUFvQixtQkFBcEIsQ0FSNUI7O0VBU0EsQ0FBQSxDQUFFLEdBQUYsRUFDRSxPQURGLEVBRUUsSUFGRixFQUdFLEtBSEYsRUFJRSxLQUpGLEVBS0UsSUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsR0FSRixFQVNFLElBVEYsRUFVRSxPQVZGLEVBV0UsR0FYRixDQUFBLEdBVzRCLEdBQUcs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TUFBRSxFQUFBLEVBQUksR0FBRyxDQUFDO0lBQVYsQ0FBYjtJQUNaLEtBQUEsR0FBWTtJQUNaLEtBQUEsb0NBQUE7T0FBSSxDQUFFLElBQUYsT0FDTjs7TUFDSSxLQUFBLGdDQUFBO1FBQ0UsS0FBQTtRQUNBLElBQUEsQ0FBSyxDQUFBLEtBQUEsQ0FBQSxDQUFRLEtBQVIsQ0FBQSxDQUFBLENBQUwsRUFBdUIsU0FBdkI7UUFDQSxJQUFrRCxDQUFFLEtBQUEsR0FBUSxFQUFWLENBQUEsS0FBa0IsQ0FBcEU7VUFBQSxJQUFBLENBQUssYUFBTCxFQUFvQixDQUFBLEtBQUEsQ0FBQSxDQUFRLEtBQVIsQ0FBQSxXQUFBLENBQXBCLEVBQUE7O01BSEY7SUFGRjtJQU1BLEtBQUEsK0RBQUE7TUFBQSxLQUFBLENBQU0sYUFBTixFQUFxQixHQUFyQjtJQUFBLENBZEY7O1dBZ0JHO0VBakJjLEVBcHlCakI7OztFQXl6QkEsSUFBRyxNQUFBLEtBQVUsT0FBTyxDQUFDLElBQXJCO0lBQWtDLENBQUEsQ0FBQSxDQUFBLEdBQUEsRUFBQTs7TUFFaEMsY0FBQSxDQUFBO2FBQ0M7SUFIK0IsQ0FBQSxJQUFsQzs7QUF6ekJBIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0J1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbkdVWSAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXknXG57IGFsZXJ0XG4gIGRlYnVnXG4gIGhlbHBcbiAgaW5mb1xuICBwbGFpblxuICBwcmFpc2VcbiAgdXJnZVxuICB3YXJuXG4gIHdoaXNwZXIgfSAgICAgICAgICAgICAgID0gR1VZLnRybS5nZXRfbG9nZ2VycyAnaml6dXJhLXNvdXJjZXMtZGInXG57IHJwclxuICBpbnNwZWN0XG4gIGVjaG9cbiAgd2hpdGVcbiAgZ3JlZW5cbiAgYmx1ZVxuICBnb2xkXG4gIGdyZXlcbiAgcmVkXG4gIGJvbGRcbiAgcmV2ZXJzZVxuICBsb2cgICAgIH0gICAgICAgICAgICAgICA9IEdVWS50cm1cbiMgeyBmIH0gICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9lZmZzdHJpbmcnXG4jIHdyaXRlICAgICAgICAgICAgICAgICAgICAgPSAoIHAgKSAtPiBwcm9jZXNzLnN0ZG91dC53cml0ZSBwXG4jIHsgbmZhIH0gICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvbm9ybWFsaXplLWZ1bmN0aW9uLWFyZ3VtZW50cydcbiMgR1RORyAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ndXktdGVzdC1ORydcbiMgeyBUZXN0ICAgICAgICAgICAgICAgICAgfSA9IEdUTkdcbiMgRlMgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6ZnMnXG5QQVRIICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpwYXRoJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5Cc3FsMyAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYmV0dGVyLXNxbGl0ZTMnXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblNGTU9EVUxFUyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvYnJpY2FicmFjLXNmbW9kdWxlcydcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBEYnJpYyxcbiAgRGJyaWNfc3RkLFxuICBTUUwsICAgICAgICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9kYnJpYygpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgbGV0cyxcbiAgZnJlZXplLCAgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfbGV0c2ZyZWV6ZXRoYXRfaW5mcmEoKS5zaW1wbGVcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBKZXRzdHJlYW0sXG4gIEFzeW5jX2pldHN0cmVhbSwgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2pldHN0cmVhbSgpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBCZW5jaG1hcmtlciwgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9iZW5jaG1hcmtpbmcoKVxuYmVuY2htYXJrZXIgICAgICAgICAgICAgICAgICAgPSBuZXcgQmVuY2htYXJrZXIoKVxudGltZWl0ICAgICAgICAgICAgICAgICAgICAgICAgPSAoIFAuLi4gKSAtPiBiZW5jaG1hcmtlci50aW1laXQgUC4uLlxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5mcm9tX2Jvb2wgICAgICAgICAgICAgICAgICAgICA9ICggeCApIC0+IHN3aXRjaCB4XG4gIHdoZW4gdHJ1ZSAgdGhlbiAxXG4gIHdoZW4gZmFsc2UgdGhlbiAwXG4gIGVsc2UgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfX18xIGV4cGVjdGVkIHRydWUgb3IgZmFsc2UsIGdvdCAje3JwciB4fVwiXG5hc19ib29sICAgICAgICAgICAgICAgICAgICAgICA9ICggeCApIC0+IHN3aXRjaCB4XG4gIHdoZW4gMSB0aGVuIHRydWVcbiAgd2hlbiAwIHRoZW4gZmFsc2VcbiAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fXzIgZXhwZWN0ZWQgMCBvciAxLCBnb3QgI3tycHIgeH1cIlxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmRlbW9fc291cmNlX2lkZW50aWZpZXJzID0gLT5cbiAgeyBleHBhbmRfZGljdGlvbmFyeSwgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfZGljdGlvbmFyeV90b29scygpXG4gIHsgZ2V0X2xvY2FsX2Rlc3RpbmF0aW9ucywgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2dldF9sb2NhbF9kZXN0aW5hdGlvbnMoKVxuICBmb3Iga2V5LCB2YWx1ZSBvZiBnZXRfbG9jYWxfZGVzdGluYXRpb25zKClcbiAgICBkZWJ1ZyAnzqlqenJzZGJfX18zJywga2V5LCB2YWx1ZVxuICAjIGNhbiBhcHBlbmQgbGluZSBudW1iZXJzIHRvIGZpbGVzIGFzIGluOlxuICAjICdkaWN0Om1lYW5pbmdzLjE6TD0xMzMzMidcbiAgIyAnZGljdDp1Y2QxNDAuMTp1aGRpZHg6TD0xMjM0J1xuICAjIHJvd2lkczogJ3Q6amZtOlI9MSdcbiAgIyB7XG4gICMgICAnZGljdDptZWFuaW5ncyc6ICAgICAgICAgICckanpyZHMvbWVhbmluZy9tZWFuaW5ncy50eHQnXG4gICMgICAnZGljdDp1Y2Q6djE0LjA6dWhkaWR4JyA6ICckanpyZHMvdW5pY29kZS5vcmctdWNkLXYxNC4wL1VuaWhhbl9EaWN0aW9uYXJ5SW5kaWNlcy50eHQnXG4gICMgICB9XG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZ2V0X3BhdGhzID0gLT5cbiAgUiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IHt9XG4gIFIuYmFzZSAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4nXG4gIFIuanpyICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILnJlc29sdmUgUi5iYXNlLCAnLi4nXG4gIFIuZGIgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gUi5iYXNlLCAnanpyLmRiJ1xuICAjIFIuZGIgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSAnL2Rldi9zaG0vanpyLmRiJ1xuICBSLmp6cmRzICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIFIuYmFzZSwgJ2p6cmRzJ1xuICBSLmp6cm5ld2RzICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIFIuanpyLCAnaml6dXJhLW5ldy1kYXRhc291cmNlcydcbiAgUi5yYXdfZ2l0aHViICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBSLmp6cm5ld2RzLCAnYnZmcy9vcmlnaW4vaHR0cHMvcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSdcbiAga2Fuaml1bSAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBSLnJhd19naXRodWIsICdtaWZ1bmV0b3NoaXJvL2thbmppdW0vOGEwY2RhYTE2ZDY0YTI4MWEyMDQ4ZGUyZWVlMmVjNWUzYTQ0MGZhNidcbiAgUlsgJ2RpY3Q6bWVhbmluZ3MnICAgICAgICAgIF0gICA9IFBBVEguam9pbiBSLmp6cmRzLCAnbWVhbmluZy9tZWFuaW5ncy50eHQnXG4gIFJbICdkaWN0OnVjZDp2MTQuMDp1aGRpZHgnICBdICAgPSBQQVRILmpvaW4gUi5qenJkcywgJ3VuaWNvZGUub3JnLXVjZC12MTQuMC9VbmloYW5fRGljdGlvbmFyeUluZGljZXMudHh0J1xuICBSWyAnZGljdDp4OmtvLUhhbmcrTGF0bicgICAgXSAgID0gUEFUSC5qb2luIFIuanpybmV3ZHMsICdoYW5nZXVsLXRyYW5zY3JpcHRpb25zLnRzdidcbiAgUlsgJ2RpY3Q6eDpqYS1LYW4rTGF0bicgICAgIF0gICA9IFBBVEguam9pbiBSLmp6cm5ld2RzLCAna2FuYS10cmFuc2NyaXB0aW9ucy50c3YnXG4gIFJbICdkaWN0OmJjcDQ3JyAgICAgICAgICAgICBdICAgPSBQQVRILmpvaW4gUi5qenJuZXdkcywgJ0JDUDQ3LWxhbmd1YWdlLXNjcmlwdHMtcmVnaW9ucy50c3YnXG4gIFJbICdkaWN0OmphOmthbmppdW0nICAgICAgICBdICAgPSBQQVRILmpvaW4ga2Fuaml1bSwgJ2RhdGEvc291cmNlX2ZpbGVzL2thbmppZGljdC50eHQnXG4gIFJbICdkaWN0OmphOmthbmppdW06YXV4JyAgICBdICAgPSBQQVRILmpvaW4ga2Fuaml1bSwgJ2RhdGEvc291cmNlX2ZpbGVzLzBfUkVBRE1FLnR4dCdcbiAgcmV0dXJuIFJcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEp6cl9kYl9hZGFwdGVyIGV4dGVuZHMgRGJyaWNfc3RkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAZGJfY2xhc3M6ICBCc3FsM1xuICBAcHJlZml4OiAgICAnanpyJ1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6ICggZGJfcGF0aCwgY2ZnID0ge30gKSAtPlxuICAgICMjIyBUQUlOVCBuZWVkIG1vcmUgY2xhcml0eSBhYm91dCB3aGVuIHN0YXRlbWVudHMsIGJ1aWxkLCBpbml0aWFsaXplLi4uIGlzIHBlcmZvcm1lZCAjIyNcbiAgICB7IGhvc3QsIH0gPSBjZmdcbiAgICBjZmcgICAgICAgPSBsZXRzIGNmZywgKCBjZmcgKSAtPiBkZWxldGUgY2ZnLmhvc3RcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHN1cGVyIGRiX3BhdGgsIGNmZ1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQGhvc3QgICAgID0gaG9zdFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZG8gPT5cbiAgICAgICMjIyBUQUlOVCB0aGlzIGlzIG5vdCB3ZWxsIHBsYWNlZCAjIyNcbiAgICAgICMjIyBOT1RFIGV4ZWN1dGUgYSBHYXBzLWFuZC1Jc2xhbmRzIEVTU0ZSSSB0byBpbXByb3ZlIHN0cnVjdHVyYWwgaW50ZWdyaXR5IGFzc3VyYW5jZTogIyMjXG4gICAgICAjICggQHByZXBhcmUgU1FMXCJzZWxlY3QgKiBmcm9tIF9qenJfbWV0YV91Y19ub3JtYWxpemF0aW9uX2ZhdWx0cyB3aGVyZSBmYWxzZTtcIiApLmdldCgpXG4gICAgICBtZXNzYWdlcyA9IFtdXG4gICAgICBmb3IgeyBuYW1lLCB0eXBlLCB9IGZyb20gQHN0YXRlbWVudHMuc3RkX2dldF9yZWxhdGlvbnMuaXRlcmF0ZSgpXG4gICAgICAgIHRyeVxuICAgICAgICAgICggQHByZXBhcmUgU1FMXCJzZWxlY3QgKiBmcm9tICN7bmFtZX0gd2hlcmUgZmFsc2U7XCIgKS5hbGwoKVxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgIG1lc3NhZ2VzLnB1c2ggXCIje3R5cGV9ICN7bmFtZX06ICN7ZXJyb3IubWVzc2FnZX1cIlxuICAgICAgICAgIHdhcm4gJ86panpyc2RiX19fNCcsIGVycm9yLm1lc3NhZ2VcbiAgICAgIHJldHVybiBudWxsIGlmIG1lc3NhZ2VzLmxlbmd0aCBpcyAwXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fXzUgRUZGUkkgdGVzdGluZyByZXZlYWxlZCBlcnJvcnM6ICN7cnByIG1lc3NhZ2VzfVwiXG4gICAgICA7bnVsbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaWYgQGlzX2ZyZXNoXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VzKClcbiAgICAgIEBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX3ZlcmJzKClcbiAgICAgIEBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xjb2RlcygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9saW5lcygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl90cmlwbGVzX2Zvcl9tZWFuaW5ncygpXG4gICAgZWxzZVxuICAgICAgd2FybiAnzqlqenJzZGJfX182JywgXCJza2lwcGVkIGRhdGEgaW5zZXJ0aW9uXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDt1bmRlZmluZWRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBidWlsZDogW1xuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2RhdGFzb3VyY2VzIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgZHNrZXkgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcGF0aCAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNoZWNrICggcm93aWQgcmVnZXhwICdedDpkczpSPVxcXFxkKyQnKSk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX2xjb2RlcyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGxjb2RlICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGNvbW1lbnQgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIGxjb2RlIHJlZ2V4cCAnXlthLXpBLVpdK1thLXpBLVowLTldKiQnICksXG4gICAgICBjaGVjayAoIHJvd2lkID0gJ3Q6bXI6bGM6Vj0nIHx8IGxjb2RlICkgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfbGluZXMgKFxuICAgICAgICAtLSAndDpqZm06J1xuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByZWYgICAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsIGdlbmVyYXRlZCBhbHdheXMgYXMgKCBkc2tleSB8fCAnOkw9JyB8fCBsaW5lX25yICkgdmlydHVhbCxcbiAgICAgICAgZHNrZXkgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbGluZV9uciAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbGNvZGUgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbGluZSAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgamZpZWxkcyAgIGpzb24gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgZmllbGRfMSAgIHRleHQgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgZmllbGRfMiAgIHRleHQgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgZmllbGRfMyAgIHRleHQgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgZmllbGRfNCAgIHRleHQgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNoZWNrICggcm93aWQgcmVnZXhwICdedDptcjpsbjpSPVxcXFxkKyQnKSxcbiAgICAgIHVuaXF1ZSAoIGRza2V5LCBsaW5lX25yICksXG4gICAgICBmb3JlaWduIGtleSAoIGxjb2RlICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xjb2RlcyAoIGxjb2RlICkgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfdmVyYnMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBzICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICB2ICAgICAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBvICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCByb3dpZCByZWdleHAgJ150Om1yOnZiOlY9W1xcXFwtOlxcXFwrXFxcXHB7TH1dKyQnICkgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcmVmICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgcyAgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgdiAgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbyAgICAgICAgIGpzb24gICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNoZWNrICggcm93aWQgcmVnZXhwICdedDptcjozcGw6Uj1cXFxcZCskJyApLFxuICAgICAgdW5pcXVlICggcmVmLCBzLCB2LCBvIClcbiAgICAgIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xpbmVzICggcm93aWQgKVxuICAgICAgZm9yZWlnbiBrZXkgKCB2ICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX3ZlcmJzICggdiApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9taXJyb3JfdHJpcGxlc19yZWdpc3RlclxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZVxuICAgICAgZm9yIGVhY2ggcm93IGJlZ2luXG4gICAgICAgIHNlbGVjdCB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfbWlycm9yX3RyaXBsZXNfYmFzZScsIG5ldy5yb3dpZCwgbmV3LnJlZiwgbmV3LnMsIG5ldy52LCBuZXcubyApO1xuICAgICAgICBlbmQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyAoXG4gICAgICAgIHJvd2lkICAgICAgICAgICB0ZXh0ICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByZWYgICAgICAgICAgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgc3lsbGFibGVfaGFuZyAgIHRleHQgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHN5bGxhYmxlX2xhdG4gICB0ZXh0ICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggaW5pdGlhbF9sYXRuIHx8IG1lZGlhbF9sYXRuIHx8IGZpbmFsX2xhdG4gKSB2aXJ0dWFsLFxuICAgICAgICAtLSBzeWxsYWJsZV9sYXRuICAgdGV4dCAgdW5pcXVlICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggaW5pdGlhbF9sYXRuIHx8IG1lZGlhbF9sYXRuIHx8IGZpbmFsX2xhdG4gKSB2aXJ0dWFsLFxuICAgICAgICBpbml0aWFsX2hhbmcgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbWVkaWFsX2hhbmcgICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpbmFsX2hhbmcgICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBpbml0aWFsX2xhdG4gICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbWVkaWFsX2xhdG4gICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpbmFsX2xhdG4gICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCByb3dpZCByZWdleHAgJ150Omxhbmc6aGFuZzpzeWw6Vj1cXFxcUyskJyApXG4gICAgICAtLSB1bmlxdWUgKCByZWYsIHMsIHYsIG8gKVxuICAgICAgLS0gZm9yZWlnbiBrZXkgKCByZWYgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfbGluZXMgKCByb3dpZCApXG4gICAgICAtLSBmb3JlaWduIGtleSAoIHN5bGxhYmxlX2hhbmcgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICggbyApIClcbiAgICAgICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzX3JlZ2lzdGVyXG4gICAgICBiZWZvcmUgaW5zZXJ0IG9uIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzXG4gICAgICBmb3IgZWFjaCByb3cgYmVnaW5cbiAgICAgICAgc2VsZWN0IHRyaWdnZXJfb25fYmVmb3JlX2luc2VydCggJ2p6cl9sYW5nX2hhbmdfc3lsbGFibGVzJyxcbiAgICAgICAgICBuZXcucm93aWQsIG5ldy5yZWYsIG5ldy5zeWxsYWJsZV9oYW5nLCBuZXcuc3lsbGFibGVfbGF0bixcbiAgICAgICAgICAgIG5ldy5pbml0aWFsX2hhbmcsIG5ldy5tZWRpYWxfaGFuZywgbmV3LmZpbmFsX2hhbmcsXG4gICAgICAgICAgICBuZXcuaW5pdGlhbF9sYXRuLCBuZXcubWVkaWFsX2xhdG4sIG5ldy5maW5hbF9sYXRuICk7XG4gICAgICAgIGVuZDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlcyBhc1xuICAgICAgc2VsZWN0IG51bGwgYXMgcm93aWQsIG51bGwgYXMgcmVmLCBudWxsIGFzIHMsIG51bGwgYXMgdiwgbnVsbCBhcyBvIHdoZXJlIGZhbHNlIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ2M6cmVhZGluZzprby1MYXRuJywgICAgICAgICAgc3lsbGFibGVfbGF0biAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ2M6cmVhZGluZzprby1MYXRuOmluaXRpYWwnLCAgaW5pdGlhbF9sYXRuICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ2M6cmVhZGluZzprby1MYXRuOm1lZGlhbCcsICAgbWVkaWFsX2xhdG4gICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ2M6cmVhZGluZzprby1MYXRuOmZpbmFsJywgICAgZmluYWxfbGF0biAgICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ2M6cmVhZGluZzprby1IYW5nOmluaXRpYWwnLCAgaW5pdGlhbF9oYW5nICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ2M6cmVhZGluZzprby1IYW5nOm1lZGlhbCcsICAgbWVkaWFsX2hhbmcgICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ2M6cmVhZGluZzprby1IYW5nOmZpbmFsJywgICAgZmluYWxfaGFuZyAgICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsIHdoZXJlIGZhbHNlXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9hbGxfdHJpcGxlcyBhc1xuICAgICAgc2VsZWN0IG51bGwgYXMgcm93aWQsIG51bGwgYXMgcmVmLCBudWxsIGFzIHMsIG51bGwgYXMgdiwgbnVsbCBhcyBvIHdoZXJlIGZhbHNlIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgKiBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogZnJvbSBqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfdHJpcGxlcyBhc1xuICAgICAgc2VsZWN0IG51bGwgYXMgcm93aWQsIG51bGwgYXMgcmVmLCBudWxsIGFzIHMsIG51bGwgYXMgdiwgbnVsbCBhcyBvIHdoZXJlIGZhbHNlIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgKiBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIHdoZXJlIHYgbGlrZSAnYzolJyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCB0Yi5yb3dpZCwgdGIucmVmLCB0Yi5zLCBrci52LCBrci5vIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgdGJcbiAgICAgICAgam9pbiBqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzIGFzIGtyIG9uICggdGIudiA9ICdjOnJlYWRpbmc6a28tSGFuZycgYW5kIHRiLm8gPSBrci5zIClcbiAgICAgICAgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsIHdoZXJlIGZhbHNlXG4gICAgICBvcmRlciBieSBzLCB2LCBvXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV91Y19ub3JtYWxpemF0aW9uX2ZhdWx0cyBhcyBzZWxlY3RcbiAgICAgICAgbWwucm93aWQgIGFzIHJvd2lkLFxuICAgICAgICBtbC5yZWYgICAgYXMgcmVmLFxuICAgICAgICBtbC5saW5lICAgYXMgbGluZVxuICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzIGFzIG1sXG4gICAgICB3aGVyZSB0cnVlXG4gICAgICAgIGFuZCAoIG5vdCBpc191Y19ub3JtYWwoIG1sLmxpbmUgKSApXG4gICAgICBvcmRlciBieSBtbC5yb3dpZDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcgX2p6cl9tZXRhX2tyX3JlYWRpbmdzX3Vua25vd25fdmVyYl9mYXVsdHMgYXMgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgY291bnQoKikgb3ZlciAoIHBhcnRpdGlvbiBieSB2ICkgICAgYXMgY291bnQsXG4gICAgICAgICAgJ2p6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXM6Uj0qJyAgYXMgcm93aWQsXG4gICAgICAgICAgJyonICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICd1bmtub3duLXZlcmInICAgICAgICAgICAgICAgICAgICAgIGFzIGRlc2NyaXB0aW9uLFxuICAgICAgICAgIHYgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHF1b3RlXG4gICAgICAgIGZyb20ganpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlcyBhcyBublxuICAgICAgICB3aGVyZSBub3QgZXhpc3RzICggc2VsZWN0IDEgZnJvbSBqenJfbWlycm9yX3ZlcmJzIGFzIHZiIHdoZXJlIHZiLnYgPSBubi52ICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9tZXRhX2ZhdWx0cyBhc1xuICAgICAgc2VsZWN0IG51bGwgYXMgY291bnQsIG51bGwgYXMgcm93aWQsIG51bGwgYXMgcmVmLCBudWxsIGFzIGRlc2NyaXB0aW9uLCBudWxsICBhcyBxdW90ZSB3aGVyZSBmYWxzZSB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IDEsIHJvd2lkLCByZWYsICAndWMtbm9ybWFsaXphdGlvbicsIGxpbmUgIGFzIHF1b3RlIGZyb20gX2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzICAgICAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX2tyX3JlYWRpbmdzX3Vua25vd25fdmVyYl9mYXVsdHMgIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9zeWxsYWJsZXMgYXMgc2VsZWN0XG4gICAgIyAgICAgICB0MS5zXG4gICAgIyAgICAgICB0MS52XG4gICAgIyAgICAgICB0MS5vXG4gICAgIyAgICAgICB0aS5zIGFzIGluaXRpYWxfaGFuZ1xuICAgICMgICAgICAgdG0ucyBhcyBtZWRpYWxfaGFuZ1xuICAgICMgICAgICAgdGYucyBhcyBmaW5hbF9oYW5nXG4gICAgIyAgICAgICB0aS5vIGFzIGluaXRpYWxfbGF0blxuICAgICMgICAgICAgdG0ubyBhcyBtZWRpYWxfbGF0blxuICAgICMgICAgICAgdGYubyBhcyBmaW5hbF9sYXRuXG4gICAgIyAgICAgZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0MVxuICAgICMgICAgIGpvaW5cbiAgICAjICAgICBqb2luIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHRpIG9uICggdDEuKVxuICAgICMgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMjIyBhZ2dyZWdhdGUgdGFibGUgZm9yIGFsbCByb3dpZHMgZ29lcyBoZXJlICMjI1xuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAc3RhdGVtZW50czpcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9kYXRhc291cmNlOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9kYXRhc291cmNlcyAoIHJvd2lkLCBkc2tleSwgcGF0aCApIHZhbHVlcyAoICRyb3dpZCwgJGRza2V5LCAkcGF0aCApXG4gICAgICAgIG9uIGNvbmZsaWN0ICggZHNrZXkgKSBkbyB1cGRhdGUgc2V0IHBhdGggPSBleGNsdWRlZC5wYXRoO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX21pcnJvcl92ZXJiOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfdmVyYnMgKCByb3dpZCwgcywgdiwgbyApIHZhbHVlcyAoICRyb3dpZCwgJHMsICR2LCAkbyApXG4gICAgICAgIG9uIGNvbmZsaWN0ICggcm93aWQgKSBkbyB1cGRhdGUgc2V0IHMgPSBleGNsdWRlZC5zLCB2ID0gZXhjbHVkZWQudiwgbyA9IGV4Y2x1ZGVkLm87XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfbWlycm9yX2xjb2RlOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfbGNvZGVzICggcm93aWQsIGxjb2RlLCBjb21tZW50ICkgdmFsdWVzICggJHJvd2lkLCAkbGNvZGUsICRjb21tZW50IClcbiAgICAgICAgb24gY29uZmxpY3QgKCByb3dpZCApIGRvIHVwZGF0ZSBzZXQgbGNvZGUgPSBleGNsdWRlZC5sY29kZSwgY29tbWVudCA9IGV4Y2x1ZGVkLmNvbW1lbnQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfbWlycm9yX3RyaXBsZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoIHJvd2lkLCByZWYsIHMsIHYsIG8gKSB2YWx1ZXMgKCAkcm93aWQsICRyZWYsICRzLCAkdiwgJG8gKVxuICAgICAgICBvbiBjb25mbGljdCAoIHJlZiwgcywgdiwgbyApIGRvIG5vdGhpbmc7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9taXJyb3JfbGluZXM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl9saW5lcyAoIHJvd2lkLCBkc2tleSwgbGluZV9uciwgbGNvZGUsIGxpbmUsIGpmaWVsZHMsIGZpZWxkXzEsIGZpZWxkXzIsIGZpZWxkXzMsIGZpZWxkXzQgKVxuICAgICAgc2VsZWN0XG4gICAgICAgICd0Om1yOmxuOlI9JyB8fCByb3dfbnVtYmVyKCkgb3ZlciAoKSAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgLS0gZHMuZHNrZXkgfHwgJzpMPScgfHwgZmwubGluZV9uciAgIGFzIHJvd2lkLFxuICAgICAgICBkcy5kc2tleSAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZHNrZXksXG4gICAgICAgIGZsLmxpbmVfbnIgICAgICAgICAgICAgICAgICAgICAgICBhcyBsaW5lX25yLFxuICAgICAgICBmbC5sY29kZSAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbGNvZGUsXG4gICAgICAgIGZsLmxpbmUgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBsaW5lLFxuICAgICAgICBmbC5qZmllbGRzICAgICAgICAgICAgICAgICAgICAgICAgYXMgamZpZWxkcyxcbiAgICAgICAgZmwuZmllbGRfMSAgICAgICAgICAgICAgICAgICAgICAgIGFzIGZpZWxkXzEsXG4gICAgICAgIGZsLmZpZWxkXzIgICAgICAgICAgICAgICAgICAgICAgICBhcyBmaWVsZF8yLFxuICAgICAgICBmbC5maWVsZF8zICAgICAgICAgICAgICAgICAgICAgICAgYXMgZmllbGRfMyxcbiAgICAgICAgZmwuZmllbGRfNCAgICAgICAgICAgICAgICAgICAgICAgIGFzIGZpZWxkXzRcbiAgICAgIGZyb20ganpyX2RhdGFzb3VyY2VzICAgICAgICBhcyBkc1xuICAgICAgam9pbiBmaWxlX2xpbmVzKCBkcy5wYXRoICkgIGFzIGZsXG4gICAgICB3aGVyZSB0cnVlXG4gICAgICBvbiBjb25mbGljdCAoIGRza2V5LCBsaW5lX25yICkgZG8gdXBkYXRlIHNldCBsaW5lID0gZXhjbHVkZWQubGluZTtcbiAgICAgIFwiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgKCByb3dpZCwgcmVmLCBzLCB2LCBvIClcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICBndC5yb3dpZF9vdXQgICAgYXMgcm93aWQsXG4gICAgICAgICAgICBndC5yZWYgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICAgZ3QucyAgICAgICAgICAgIGFzIHMsXG4gICAgICAgICAgICBndC52ICAgICAgICAgICAgYXMgdixcbiAgICAgICAgICAgIGd0Lm8gICAgICAgICAgICBhcyBvXG4gICAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIG1sXG4gICAgICAgICAgam9pbiBnZXRfdHJpcGxlcyggbWwucm93aWQsIG1sLmRza2V5LCBtbC5maWVsZF8xLCBtbC5maWVsZF8yLCBtbC5maWVsZF8zICkgIGFzIGd0XG4gICAgICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICAgICAgYW5kICggbWwubGNvZGUgPSAnRCcgKVxuICAgICAgICAgICAgLS0gYW5kICggbWwuZHNrZXkgPSAnZGljdDptZWFuaW5ncycgKVxuICAgICAgICAgICAgYW5kICggbWwuZmllbGRfMSBpcyBub3QgbnVsbCApXG4gICAgICAgICAgICBhbmQgKCBtbC5maWVsZF8xIG5vdCByZWdleHAgJ15AZ2x5cGhzJyApXG4gICAgICAgICAgICAtLSBhbmQgKCBtbC5maWVsZF8zIHJlZ2V4cCAnXig/OnB5fGhpfGthKTonIClcbiAgICAgICAgb24gY29uZmxpY3QgKCByZWYsIHMsIHYsIG8gKSBkbyBub3RoaW5nXG4gICAgICAgIDtcbiAgICAgIFwiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbGFuZ19oYW5nZXVsX3N5bGxhYmxlczogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyAoIHJvd2lkLCByZWYsXG4gICAgICAgIHN5bGxhYmxlX2hhbmcsIGluaXRpYWxfaGFuZywgbWVkaWFsX2hhbmcsIGZpbmFsX2hhbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsX2xhdG4sIG1lZGlhbF9sYXRuLCBmaW5hbF9sYXRuXG4gICAgICAgICAgICAgICAgICAgICAgICApXG4gICAgICAgIHNlbGVjdFxuICAgICAgICAgICAgJ3Q6bGFuZzpoYW5nOnN5bDpWPScgfHwgbXQubyAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgICAgIG10LnJvd2lkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICAgbXQubyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBzeWxsYWJsZV9oYW5nLFxuICAgICAgICAgICAgZGguaW5pdGlhbCAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBpbml0aWFsX2hhbmcsXG4gICAgICAgICAgICBkaC5tZWRpYWwgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIG1lZGlhbF9oYW5nLFxuICAgICAgICAgICAgZGguZmluYWwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBmaW5hbF9oYW5nLFxuICAgICAgICAgICAgY29hbGVzY2UoIG10aS5vLCAnJyApICAgICAgICAgICAgICAgICBhcyBpbml0aWFsX2xhdG4sXG4gICAgICAgICAgICBjb2FsZXNjZSggbXRtLm8sICcnICkgICAgICAgICAgICAgICAgIGFzIG1lZGlhbF9sYXRuLFxuICAgICAgICAgICAgY29hbGVzY2UoIG10Zi5vLCAnJyApICAgICAgICAgICAgICAgICBhcyBmaW5hbF9sYXRuXG4gICAgICAgICAgZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAgICAgICAgICAgICBhcyBtdFxuICAgICAgICAgIGxlZnQgam9pbiBkaXNhc3NlbWJsZV9oYW5nZXVsKCBtdC5vICkgICAgYXMgZGhcbiAgICAgICAgICBsZWZ0IGpvaW4ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgbXRpIG9uICggbXRpLnMgPSBkaC5pbml0aWFsIGFuZCBtdGkudiA9ICd4OmtvLUhhbmcrTGF0bjppbml0aWFsJyApXG4gICAgICAgICAgbGVmdCBqb2luIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIG10bSBvbiAoIG10bS5zID0gZGgubWVkaWFsICBhbmQgbXRtLnYgPSAneDprby1IYW5nK0xhdG46bWVkaWFsJyAgKVxuICAgICAgICAgIGxlZnQgam9pbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyBtdGYgb24gKCBtdGYucyA9IGRoLmZpbmFsICAgYW5kIG10Zi52ID0gJ3g6a28tSGFuZytMYXRuOmZpbmFsJyAgIClcbiAgICAgICAgICB3aGVyZSB0cnVlXG4gICAgICAgICAgICBhbmQgKCBtdC52ID0gJ2M6cmVhZGluZzprby1IYW5nJyApXG4gICAgICAgICAgICAtLSBhbmQgKCBtbC5kc2tleSA9ICdkaWN0Om1lYW5pbmdzJyApXG4gICAgICAgICAgICAtLSBhbmQgKCBtbC5maWVsZF8xIGlzIG5vdCBudWxsIClcbiAgICAgICAgICAgIC0tIGFuZCAoIG1sLmZpZWxkXzEgbm90IHJlZ2V4cCAnXkBnbHlwaHMnIClcbiAgICAgICAgICAgIC0tIGFuZCAoIG1sLmZpZWxkXzMgcmVnZXhwICdeKD86cHl8aGl8a2EpOicgKVxuICAgICAgICAgIG9yZGVyIGJ5IG10Lm9cbiAgICAgICAgb24gY29uZmxpY3QgKCByb3dpZCAgICAgICAgICkgZG8gbm90aGluZ1xuICAgICAgICBvbiBjb25mbGljdCAoIHN5bGxhYmxlX2hhbmcgKSBkbyBub3RoaW5nXG4gICAgICAgIDtcbiAgICAgIFwiXCJcIlxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9sY29kZXM6IC0+XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0Om1yOmxjOlY9QicsIGxjb2RlOiAnQicsIGNvbW1lbnQ6ICdibGFuayBsaW5lJywgICB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0Om1yOmxjOlY9QycsIGxjb2RlOiAnQycsIGNvbW1lbnQ6ICdjb21tZW50IGxpbmUnLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0Om1yOmxjOlY9RCcsIGxjb2RlOiAnRCcsIGNvbW1lbnQ6ICdkYXRhIGxpbmUnLCAgICB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdmVyYnM6IC0+XG4gICAgIyMjIE5PVEVcbiAgICBpbiB2ZXJicywgaW5pdGlhbCBjb21wb25lbnQgaW5kaWNhdGVzIHR5cGUgb2Ygc3ViamVjdDpcbiAgICAgIGBjOmAgaXMgZm9yIHN1YmplY3RzIHRoYXQgYXJlIENKSyBjaGFyYWN0ZXJzXG4gICAgICBgeDpgIGlzIHVzZWQgZm9yIHVuY2xhc3NpZmllZCBzdWJqZWN0cyAocG9zc2libHkgdG8gYmUgcmVmaW5lZCBpbiB0aGUgZnV0dXJlKVxuICAgICMjI1xuICAgIHJvd3MgPSBbXG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPXg6a28tSGFuZytMYXRuOmluaXRpYWwnLCAgICBzOiBcIk5OXCIsIHY6ICd4OmtvLUhhbmcrTGF0bjppbml0aWFsJywgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj14OmtvLUhhbmcrTGF0bjptZWRpYWwnLCAgICAgczogXCJOTlwiLCB2OiAneDprby1IYW5nK0xhdG46bWVkaWFsJywgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9eDprby1IYW5nK0xhdG46ZmluYWwnLCAgICAgIHM6IFwiTk5cIiwgdjogJ3g6a28tSGFuZytMYXRuOmZpbmFsJywgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzp6aC1MYXRuLXBpbnlpbicsICBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6emgtTGF0bi1waW55aW4nLCAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6amEteC1LYW4nLCAgICAgICAgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmphLXgtS2FuJywgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmphLXgtSGlyJywgICAgICAgIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzpqYS14LUhpcicsICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzpqYS14LUthdCcsICAgICAgICBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6amEteC1LYXQnLCAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6amEteC1MYXRuJywgICAgICAgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmphLXgtTGF0bicsICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmtvLUhhbmcnLCAgICAgICAgIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzprby1IYW5nJywgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzprby1MYXRuJywgICAgICAgICBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6a28tTGF0bicsICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6a28tSGFuZzppbml0aWFsJywgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmtvLUhhbmc6aW5pdGlhbCcsICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmtvLUhhbmc6bWVkaWFsJywgIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzprby1IYW5nOm1lZGlhbCcsICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzprby1IYW5nOmZpbmFsJywgICBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6a28tSGFuZzpmaW5hbCcsICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6a28tTGF0bjppbml0aWFsJywgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmtvLUxhdG46aW5pdGlhbCcsICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmtvLUxhdG46bWVkaWFsJywgIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzprby1MYXRuOm1lZGlhbCcsICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzprby1MYXRuOmZpbmFsJywgICBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6a28tTGF0bjpmaW5hbCcsICAgIG86IFwiTk5cIiwgfVxuICAgICAgXVxuICAgIGZvciByb3cgaW4gcm93c1xuICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfdmVyYi5ydW4gcm93XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlczogLT5cbiAgICBwYXRocyA9IGdldF9wYXRocygpXG4gICAgZHNrZXkgPSAnZGljdDptZWFuaW5ncyc7ICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkaWN0OnVjZDp2MTQuMDp1aGRpZHgnOyAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTInLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkaWN0Ong6a28tSGFuZytMYXRuJzsgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTMnLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkaWN0Ong6amEtS2FuK0xhdG4nOyAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTQnLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkaWN0OmphOmthbmppdW0nOyAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTUnLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkaWN0OmphOmthbmppdW06YXV4JzsgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTYnLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICA7bnVsbFxuXG4gICMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIF9vbl9vcGVuX3BvcHVsYXRlX3ZlcmJzOiAtPlxuICAjICAgcGF0aHMgPSBnZXRfcGF0aHMoKVxuICAjICAgZHNrZXkgPSAnZGljdDptZWFuaW5ncyc7ICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICMgICBkc2tleSA9ICdkaWN0OnVjZDp2MTQuMDp1aGRpZHgnOyAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTInLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgIyAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzOiAtPlxuICAgIEBzdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9taXJyb3JfbGluZXMucnVuKClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl90cmlwbGVzX2Zvcl9tZWFuaW5nczogLT5cbiAgICAjIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyKClcbiAgICBAX1RNUF9zdGF0ZSA9IHsgdHJpcGxlX2NvdW50OiAwLCBtb3N0X3JlY2VudF9pbnNlcnRlZF9yb3c6IG51bGwgfVxuICAgICMgbWUgPSBAXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQ6ICggbmFtZSwgZmllbGRzLi4uICkgLT5cbiAgICBAX1RNUF9zdGF0ZS5tb3N0X3JlY2VudF9pbnNlcnRlZF9yb3cgPSB7IG5hbWUsIGZpZWxkcywgfVxuICAgIDtudWxsXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBAZnVuY3Rpb25zOlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQ6XG4gICAgICAjIyMgTk9URSBpbiB0aGUgZnV0dXJlIHRoaXMgZnVuY3Rpb24gY291bGQgdHJpZ2dlciBjcmVhdGlvbiBvZiB0cmlnZ2VycyBvbiBpbnNlcnRzICMjI1xuICAgICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAgIHZhcmFyZ3M6ICAgICAgICB0cnVlXG4gICAgICBjYWxsOiAoIG5hbWUsIGZpZWxkcy4uLiApIC0+IEB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQgbmFtZSwgZmllbGRzLi4uXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMjIyBOT1RFIG1vdmVkIHRvIERicmljX3N0ZDsgY29uc2lkZXIgdG8gb3ZlcndyaXRlIHdpdGggdmVyc2lvbiB1c2luZyBgc2xldml0aGFuL3JlZ2V4YCAjIyNcbiAgICAjIHJlZ2V4cDpcbiAgICAjICAgb3ZlcndyaXRlOiAgICAgIHRydWVcbiAgICAjICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAjICAgY2FsbDogKCBwYXR0ZXJuLCB0ZXh0ICkgLT4gaWYgKCAoIG5ldyBSZWdFeHAgcGF0dGVybiwgJ3YnICkudGVzdCB0ZXh0ICkgdGhlbiAxIGVsc2UgMFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBpc191Y19ub3JtYWw6XG4gICAgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICAgIyMjIE5PVEU6IGFsc28gc2VlIGBTdHJpbmc6OmlzV2VsbEZvcm1lZCgpYCAjIyNcbiAgICAgIGNhbGw6ICggdGV4dCwgZm9ybSA9ICdORkMnICkgLT4gZnJvbV9ib29sIHRleHQgaXMgdGV4dC5ub3JtYWxpemUgZm9ybSAjIyMgJ05GQycsICdORkQnLCAnTkZLQycsIG9yICdORktEJyAjIyNcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIEB0YWJsZV9mdW5jdGlvbnM6XG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIHNwbGl0X3dvcmRzOlxuICAgICAgY29sdW1uczogICAgICBbICdrZXl3b3JkJywgXVxuICAgICAgcGFyYW1ldGVyczogICBbICdsaW5lJywgXVxuICAgICAgcm93czogKCBsaW5lICkgLT5cbiAgICAgICAga2V5d29yZHMgPSBsaW5lLnNwbGl0IC8oPzpcXHB7Wn0rKXwoKD86XFxwe1NjcmlwdD1IYW59KXwoPzpcXHB7TH0rKXwoPzpcXHB7Tn0rKXwoPzpcXHB7U30rKSkvdlxuICAgICAgICBmb3Iga2V5d29yZCBpbiBrZXl3b3Jkc1xuICAgICAgICAgIGNvbnRpbnVlIHVubGVzcyBrZXl3b3JkP1xuICAgICAgICAgIGNvbnRpbnVlIGlmIGtleXdvcmQgaXMgJydcbiAgICAgICAgICB5aWVsZCB7IGtleXdvcmQsIH1cbiAgICAgICAgO251bGxcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgZmlsZV9saW5lczpcbiAgICAgIGNvbHVtbnM6ICAgICAgWyAnbGluZV9ucicsICdsY29kZScsICdsaW5lJywgJ2pmaWVsZHMnLCAnZmllbGRfMScsICdmaWVsZF8yJywgJ2ZpZWxkXzMnLCAnZmllbGRfNCcsIF1cbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAncGF0aCcsIF1cbiAgICAgIHJvd3M6ICggcGF0aCApIC0+XG4gICAgICAgIGZvciB7IGxucjogbGluZV9uciwgbGluZSwgZW9sLCB9IGZyb20gd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBwYXRoXG4gICAgICAgICAgbGluZSA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLm5vcm1hbGl6ZV90ZXh0IGxpbmVcbiAgICAgICAgICBmaWVsZF8xID0gZmllbGRfMiA9IGZpZWxkXzMgPSBmaWVsZF80ID0gamZpZWxkcyA9IG51bGxcbiAgICAgICAgICBzd2l0Y2ggdHJ1ZVxuICAgICAgICAgICAgd2hlbiAvXlxccyokL3YudGVzdCBsaW5lXG4gICAgICAgICAgICAgIGxjb2RlID0gJ0InXG4gICAgICAgICAgICB3aGVuIC9eXFxzKiMvdi50ZXN0IGxpbmVcbiAgICAgICAgICAgICAgbGNvZGUgPSAnQydcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgbGNvZGUgPSAnRCdcbiAgICAgICAgICAgICAgWyBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80LCBdID0gamZpZWxkcyA9IGxpbmUuc3BsaXQgJ1xcdCdcbiAgICAgICAgICAgICAgamZpZWxkcyAgID0gSlNPTi5zdHJpbmdpZnkgamZpZWxkc1xuICAgICAgICAgICAgICBmaWVsZF8xICA/PSBudWxsXG4gICAgICAgICAgICAgIGZpZWxkXzIgID89IG51bGxcbiAgICAgICAgICAgICAgZmllbGRfMyAgPz0gbnVsbFxuICAgICAgICAgICAgICBmaWVsZF80ICA/PSBudWxsXG4gICAgICAgICAgeWllbGQgeyBsaW5lX25yLCBsY29kZSwgbGluZSwgamZpZWxkcywgZmllbGRfMSwgZmllbGRfMiwgZmllbGRfMywgZmllbGRfNCwgfVxuICAgICAgICA7bnVsbFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBnZXRfdHJpcGxlczpcbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAncm93aWRfaW4nLCAnZHNrZXknLCAnZmllbGRfMScsICdmaWVsZF8yJywgJ2ZpZWxkXzMnLCAnZmllbGRfNCcsIF1cbiAgICAgIGNvbHVtbnM6ICAgICAgWyAncm93aWRfb3V0JywgJ3JlZicsICdzJywgJ3YnLCAnbycsIF1cbiAgICAgIHJvd3M6ICggcm93aWRfaW4sIGRza2V5LCBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80ICkgLT5cbiAgICAgICAgeWllbGQgZnJvbSBAZ2V0X3RyaXBsZXMgcm93aWRfaW4sIGRza2V5LCBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80XG4gICAgICAgIDtudWxsXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGRpc2Fzc2VtYmxlX2hhbmdldWw6XG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ2hhbmcnLCBdXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2luaXRpYWwnLCAnbWVkaWFsJywgJ2ZpbmFsJywgXVxuICAgICAgcm93czogKCBoYW5nICkgLT5cbiAgICAgICAgamFtb3MgPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5fVE1QX2hhbmdldWwuZGlzYXNzZW1ibGUgaGFuZywgeyBmbGF0dGVuOiBmYWxzZSwgfVxuICAgICAgICBmb3IgeyBmaXJzdDogaW5pdGlhbCwgdm93ZWw6IG1lZGlhbCwgbGFzdDogZmluYWwsIH0gaW4gamFtb3NcbiAgICAgICAgICB5aWVsZCB7IGluaXRpYWwsIG1lZGlhbCwgZmluYWwsIH1cbiAgICAgICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGdldF90cmlwbGVzOiAoIHJvd2lkX2luLCBkc2tleSwgZmllbGRfMSwgZmllbGRfMiwgZmllbGRfMywgZmllbGRfNCApIC0+XG4gICAgcmVmICAgICAgICAgICA9IHJvd2lkX2luXG4gICAgcyAgICAgICAgICAgICA9IGZpZWxkXzJcbiAgICB2ICAgICAgICAgICAgID0gbnVsbFxuICAgIG8gICAgICAgICAgICAgPSBudWxsXG4gICAgZW50cnkgICAgICAgICA9IGZpZWxkXzNcbiAgICAjIHg6a28tSGFuZytMYXRuOmluaXRpYWxcbiAgICAjIHg6a28tSGFuZytMYXRuOm1lZGlhbFxuICAgICMgeDprby1IYW5nK0xhdG46ZmluYWxcbiAgICAjIHJlYWRpbmc6emgtTGF0bi1waW55aW5cbiAgICAjIHJlYWRpbmc6amEteC1LYW5cbiAgICAjIHJlYWRpbmc6amEteC1IaXJcbiAgICAjIHJlYWRpbmc6amEteC1LYXRcbiAgICAjIHJlYWRpbmc6amEteC1MYXRuXG4gICAgIyByZWFkaW5nOmtvLUhhbmdcbiAgICAjIHJlYWRpbmc6a28tTGF0blxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc3dpdGNoIHRydWVcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHdoZW4gKCBkc2tleSBpcyAnZGljdDp4OmtvLUhhbmcrTGF0bicgKSAjIGFuZCAoIGVudHJ5LnN0YXJ0c1dpdGggJ3B5OicgKVxuICAgICAgICByb2xlICAgICAgPSBmaWVsZF8xXG4gICAgICAgIHYgICAgICAgICA9IFwieDprby1IYW5nK0xhdG46I3tyb2xlfVwiXG4gICAgICAgIHJlYWRpbmdzICA9IFsgZmllbGRfMywgXVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgd2hlbiAoIGRza2V5IGlzICdkaWN0Om1lYW5pbmdzJyApIGFuZCAoIGVudHJ5LnN0YXJ0c1dpdGggJ3B5OicgKVxuICAgICAgICB2ICAgICAgICAgPSAnYzpyZWFkaW5nOnpoLUxhdG4tcGlueWluJ1xuICAgICAgICByZWFkaW5ncyAgPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5leHRyYWN0X2F0b25hbF96aF9yZWFkaW5ncyBlbnRyeVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgd2hlbiAoIGRza2V5IGlzICdkaWN0Om1lYW5pbmdzJyApIGFuZCAoIGVudHJ5LnN0YXJ0c1dpdGggJ2thOicgKVxuICAgICAgICB2ICAgICAgICAgPSAnYzpyZWFkaW5nOmphLXgtS2F0J1xuICAgICAgICByZWFkaW5ncyAgPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5leHRyYWN0X2phX3JlYWRpbmdzIGVudHJ5XG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB3aGVuICggZHNrZXkgaXMgJ2RpY3Q6bWVhbmluZ3MnICkgYW5kICggZW50cnkuc3RhcnRzV2l0aCAnaGk6JyApXG4gICAgICAgIHYgICAgICAgICA9ICdjOnJlYWRpbmc6amEteC1IaXInXG4gICAgICAgIHJlYWRpbmdzICA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfamFfcmVhZGluZ3MgZW50cnlcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHdoZW4gKCBkc2tleSBpcyAnZGljdDptZWFuaW5ncycgKSBhbmQgKCBlbnRyeS5zdGFydHNXaXRoICdoZzonIClcbiAgICAgICAgdiAgICAgICAgID0gJ2M6cmVhZGluZzprby1IYW5nJ1xuICAgICAgICByZWFkaW5ncyAgPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5leHRyYWN0X2hnX3JlYWRpbmdzIGVudHJ5XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaWYgdj9cbiAgICAgIGZvciByZWFkaW5nIGluIHJlYWRpbmdzXG4gICAgICAgIEBfVE1QX3N0YXRlLnRyaXBsZV9jb3VudCsrXG4gICAgICAgIHJvd2lkX291dCA9IFwidDptcjozcGw6Uj0je0BfVE1QX3N0YXRlLnRyaXBsZV9jb3VudH1cIlxuICAgICAgICBvICAgICAgICAgPSByZWFkaW5nXG4gICAgICAgIHlpZWxkIHsgcm93aWRfb3V0LCByZWYsIHMsIHYsIG8sIH1cbiAgICAgICAgQF9UTVBfc3RhdGUudGltZWl0X3Byb2dyZXNzPygpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICByZXR1cm4gbnVsbFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgTGFuZ3VhZ2Vfc2VydmljZXNcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBfVE1QX2hhbmdldWwgPSByZXF1aXJlICdoYW5ndWwtZGlzYXNzZW1ibGUnXG4gICAgO3VuZGVmaW5lZFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgbm9ybWFsaXplX3RleHQ6ICggdGV4dCwgZm9ybSA9ICdORkMnICkgLT4gdGV4dC5ub3JtYWxpemUgZm9ybVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcmVtb3ZlX3Bpbnlpbl9kaWFjcml0aWNzOiAoIHRleHQgKSAtPiAoIHRleHQubm9ybWFsaXplICdORktEJyApLnJlcGxhY2UgL1xcUHtMfS9ndiwgJydcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGV4dHJhY3RfYXRvbmFsX3poX3JlYWRpbmdzOiAoIGVudHJ5ICkgLT5cbiAgICAjIHB5Onpow7ksIHpoZSwgemjEgW8sIHpow6FvLCB6aMeULCB6xKtcbiAgICBSID0gZW50cnlcbiAgICBSID0gUi5yZXBsYWNlIC9ecHk6L3YsICcnXG4gICAgUiA9IFIuc3BsaXQgLyxcXHMqL3ZcbiAgICBSID0gKCAoIEByZW1vdmVfcGlueWluX2RpYWNyaXRpY3MgemhfcmVhZGluZyApIGZvciB6aF9yZWFkaW5nIGluIFIgKVxuICAgIFIgPSBuZXcgU2V0IFJcbiAgICBSLmRlbGV0ZSAnbnVsbCdcbiAgICBSLmRlbGV0ZSAnQG51bGwnXG4gICAgcmV0dXJuIFsgUi4uLiwgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZXh0cmFjdF9qYV9yZWFkaW5nczogKCBlbnRyeSApIC0+XG4gICAgIyDnqbogICAgICBoaTrjgZ3jgoksIOOBgsK3KOOBj3zjgY1844GR44KLKSwg44GL44KJLCDjgZnCtyjjgY9844GL44GZKSwg44KA44GqwrfjgZfjgYRcbiAgICBSID0gZW50cnlcbiAgICBSID0gUi5yZXBsYWNlIC9eKD86aGl8a2EpOi92LCAnJ1xuICAgIFIgPSBSLnJlcGxhY2UgL1xccysvZ3YsICcnXG4gICAgUiA9IFIuc3BsaXQgLyxcXHMqL3ZcbiAgICAjIyMgTk9URSByZW1vdmUgbm8tcmVhZGluZ3MgbWFya2VyIGBAbnVsbGAgYW5kIGNvbnRleHR1YWwgcmVhZGluZ3MgbGlrZSAt44ON44OzIGZvciDnuIEsIC3jg47jgqYgZm9yIOeOiyAjIyNcbiAgICBSID0gKCByZWFkaW5nIGZvciByZWFkaW5nIGluIFIgd2hlbiBub3QgcmVhZGluZy5zdGFydHNXaXRoICctJyApXG4gICAgUiA9IG5ldyBTZXQgUlxuICAgIFIuZGVsZXRlICdudWxsJ1xuICAgIFIuZGVsZXRlICdAbnVsbCdcbiAgICByZXR1cm4gWyBSLi4uLCBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBleHRyYWN0X2hnX3JlYWRpbmdzOiAoIGVudHJ5ICkgLT5cbiAgICAjIOepuiAgICAgIGhpOuOBneOCiSwg44GCwrco44GPfOOBjXzjgZHjgospLCDjgYvjgoksIOOBmcK3KOOBj3zjgYvjgZkpLCDjgoDjgarCt+OBl+OBhFxuICAgIFIgPSBlbnRyeVxuICAgIFIgPSBSLnJlcGxhY2UgL14oPzpoZyk6L3YsICcnXG4gICAgUiA9IFIucmVwbGFjZSAvXFxzKy9ndiwgJydcbiAgICBSID0gUi5zcGxpdCAvLFxccyovdlxuICAgIFIgPSBuZXcgU2V0IFJcbiAgICBSLmRlbGV0ZSAnbnVsbCdcbiAgICBSLmRlbGV0ZSAnQG51bGwnXG4gICAgaGFuZ2V1bCA9IFsgUi4uLiwgXS5qb2luICcnXG4gICAgIyBkZWJ1ZyAnzqlqenJzZGJfX183JywgQF9UTVBfaGFuZ2V1bC5kaXNhc3NlbWJsZSBoYW5nZXVsLCB7IGZsYXR0ZW46IGZhbHNlLCB9XG4gICAgcmV0dXJuIFsgUi4uLiwgXVxuXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjIFRBSU5UIGdvZXMgaW50byBjb25zdHJ1Y3RvciBvZiBKenIgY2xhc3MgIyMjXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgSml6dXJhXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAcGF0aHMgICAgICAgICAgICAgID0gZ2V0X3BhdGhzKClcbiAgICBAbGFuZ3VhZ2Vfc2VydmljZXMgID0gbmV3IExhbmd1YWdlX3NlcnZpY2VzKClcbiAgICBAZGJhICAgICAgICAgICAgICAgID0gbmV3IEp6cl9kYl9hZGFwdGVyIEBwYXRocy5kYiwgeyBob3N0OiBALCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIyMgVEFJTlQgbW92ZSB0byBKenJfZGJfYWRhcHRlciB0b2dldGhlciB3aXRoIHRyeS9jYXRjaCAjIyNcbiAgICB0cnlcbiAgICAgIEBwb3B1bGF0ZV9tZWFuaW5nX21pcnJvcl90cmlwbGVzKClcbiAgICBjYXRjaCBjYXVzZVxuICAgICAgZmllbGRzX3JwciA9IHJwciBAZGJhLl9UTVBfc3RhdGUubW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fXzggd2hlbiB0cnlpbmcgdG8gaW5zZXJ0IHRoaXMgcm93OiAje2ZpZWxkc19ycHJ9LCBhbiBlcnJvciB3YXMgdGhyb3duOiAje2NhdXNlLm1lc3NhZ2V9XCIsIFxcXG4gICAgICAgIHsgY2F1c2UsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMjIyBUQUlOVCBtb3ZlIHRvIEp6cl9kYl9hZGFwdGVyIHRvZ2V0aGVyIHdpdGggdHJ5L2NhdGNoICMjI1xuICAgIHRyeVxuICAgICAgQHBvcHVsYXRlX2hhbmdldWxfc3lsbGFibGVzKClcbiAgICBjYXRjaCBjYXVzZVxuICAgICAgZmllbGRzX3JwciA9IHJwciBAZGJhLl9UTVBfc3RhdGUubW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fXzkgd2hlbiB0cnlpbmcgdG8gaW5zZXJ0IHRoaXMgcm93OiAje2ZpZWxkc19ycHJ9LCBhbiBlcnJvciB3YXMgdGhyb3duOiAje2NhdXNlLm1lc3NhZ2V9XCIsIFxcXG4gICAgICAgIHsgY2F1c2UsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDt1bmRlZmluZWRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHBvcHVsYXRlX21lYW5pbmdfbWlycm9yX3RyaXBsZXM6IC0+XG4gICAgeyB0b3RhbF9yb3dfY291bnQsIH0gPSAoIEBkYmEucHJlcGFyZSBTUUxcIlwiXCJcbiAgICAgIHNlbGVjdFxuICAgICAgICAgIGNvdW50KCopIGFzIHRvdGFsX3Jvd19jb3VudFxuICAgICAgICBmcm9tIGp6cl9taXJyb3JfbGluZXNcbiAgICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICAgIGFuZCAoIGRza2V5IGlzICdkaWN0Om1lYW5pbmdzJyApXG4gICAgICAgICAgYW5kICggZmllbGRfMSBpcyBub3QgbnVsbCApXG4gICAgICAgICAgYW5kICggbm90IGZpZWxkXzEgcmVnZXhwICdeQGdseXBocycgKTtcIlwiXCIgKS5nZXQoKVxuICAgIHRvdGFsID0gdG90YWxfcm93X2NvdW50ICogMiAjIyMgTk9URSBlc3RpbWF0ZSAjIyNcbiAgICAjIHsgdG90YWxfcm93X2NvdW50LCB0b3RhbCwgfSA9IHsgdG90YWxfcm93X2NvdW50OiA0MDA4NiwgdG90YWw6IDgwMTcyIH0gIyAhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhIVxuICAgIGhlbHAgJ86panpyc2RiX18xMCcsIHsgdG90YWxfcm93X2NvdW50LCB0b3RhbCwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyBicmFuZCA9ICdCUkFORCdcbiAgICAjIHRpbWVpdCB7IHRvdGFsLCBicmFuZCwgfSwgcG9wdWxhdGVfdHJpcGxlc18xX2Nvbm5lY3Rpb24gPSAoeyBwcm9ncmVzcywgfSkgPT5cbiAgICAjIEBfVE1QX3N0YXRlLnRpbWVpdF9wcm9ncmVzcyA9IHByb2dyZXNzXG4gICAgQGRiYS5zdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlcy5ydW4oKVxuICAgICMgQF9UTVBfc3RhdGUudGltZWl0X3Byb2dyZXNzID0gbnVsbFxuICAgICMgO251bGxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBwb3B1bGF0ZV9oYW5nZXVsX3N5bGxhYmxlczogLT5cbiAgICBAZGJhLnN0YXRlbWVudHMucG9wdWxhdGVfanpyX2xhbmdfaGFuZ2V1bF9zeWxsYWJsZXMucnVuKClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDtudWxsXG5cbiAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgX3Nob3dfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHM6IC0+XG4gICMgICBmYXVsdHlfcm93cyA9ICggQGRiYS5wcmVwYXJlIFNRTFwic2VsZWN0ICogZnJvbSBfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHM7XCIgKS5hbGwoKVxuICAjICAgd2FybiAnzqlqenJzZGJfXzExJywgcmV2ZXJzZSBmYXVsdHlfcm93c1xuICAjICAgIyBmb3Igcm93IGZyb21cbiAgIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2hvd19jb3VudHM6IC0+XG4gICAgY291bnRzID0gKCBAZGJhLnByZXBhcmUgU1FMXCJzZWxlY3QgdiwgY291bnQoKikgZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBncm91cCBieSB2O1wiICkuYWxsKClcbiAgICBjb25zb2xlLnRhYmxlIGNvdW50c1xuICAgIGNvdW50cyA9ICggQGRiYS5wcmVwYXJlIFNRTFwic2VsZWN0IHYsIGNvdW50KCopIGZyb20ganpyX3RyaXBsZXMgZ3JvdXAgYnkgdjtcIiApLmFsbCgpXG4gICAgY29uc29sZS50YWJsZSBjb3VudHNcbiAgICBjb3VudHMgPSAoIEBkYmEucHJlcGFyZSBTUUxcIlwiXCJcbiAgICAgIHNlbGVjdCBkc2tleSwgY291bnQoKikgYXMgY291bnQgZnJvbSBqenJfbWlycm9yX2xpbmVzIGdyb3VwIGJ5IGRza2V5IHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICcqJywgICBjb3VudCgqKSBhcyBjb3VudCBmcm9tIGp6cl9taXJyb3JfbGluZXNcbiAgICAgIG9yZGVyIGJ5IGNvdW50O1wiXCJcIiApLmFsbCgpXG4gICAgY291bnRzID0gT2JqZWN0LmZyb21FbnRyaWVzICggWyBkc2tleSwgeyBjb3VudCwgfSwgXSBmb3IgeyBkc2tleSwgY291bnQsIH0gaW4gY291bnRzIClcbiAgICBjb25zb2xlLnRhYmxlIGNvdW50c1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNob3dfanpyX21ldGFfZmF1bHRzOiAtPlxuICAgIGZhdWx0eV9yb3dzID0gKCBAZGJhLnByZXBhcmUgU1FMXCJzZWxlY3QgKiBmcm9tIGp6cl9tZXRhX2ZhdWx0cztcIiApLmFsbCgpXG4gICAgIyB3YXJuICfOqWp6cnNkYl9fMTInLFxuICAgIGNvbnNvbGUudGFibGUgZmF1bHR5X3Jvd3NcbiAgICAjIGZvciByb3cgZnJvbVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5kZW1vID0gLT5cbiAganpyID0gbmV3IEppenVyYSgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyBqenIuX3Nob3dfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMoKVxuICBqenIuc2hvd19jb3VudHMoKVxuICBqenIuc2hvd19qenJfbWV0YV9mYXVsdHMoKVxuICAjIGM6cmVhZGluZzpqYS14LUhpclxuICAjIGM6cmVhZGluZzpqYS14LUthdFxuICAjIHNlZW4gPSBuZXcgU2V0KClcbiAgIyBmb3IgeyByZWFkaW5nLCB9IGZyb20ganpyLmRiYS53YWxrIFNRTFwic2VsZWN0IGRpc3RpbmN0KCBvICkgYXMgcmVhZGluZyBmcm9tIGp6cl90cmlwbGVzIHdoZXJlIHYgPSAnYzpyZWFkaW5nOmphLXgtS2F0JyBvcmRlciBieSBvO1wiXG4gICMgICBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLygu44O8fC7jg6N8LuODpXwu44OnfOODgy58LikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICMgICAgIGNvbnRpbnVlIGlmIHNlZW4uaGFzIHBhcnRcbiAgIyAgICAgc2Vlbi5hZGQgcGFydFxuICAjICAgICBlY2hvIHBhcnRcbiAgIyBmb3IgeyByZWFkaW5nLCB9IGZyb20ganpyLmRiYS53YWxrIFNRTFwic2VsZWN0IGRpc3RpbmN0KCBvICkgYXMgcmVhZGluZyBmcm9tIGp6cl90cmlwbGVzIHdoZXJlIHYgPSAnYzpyZWFkaW5nOmphLXgtSGlyJyBvcmRlciBieSBvO1wiXG4gICMgICBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLygu44O8fC7jgoN8LuOChXwu44KHfOOBoy58LikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICMgICAjIGZvciBwYXJ0IGluICggcmVhZGluZy5zcGxpdCAvKC4pL3YgKSB3aGVuIHBhcnQgaXNudCAnJ1xuICAjICAgICBjb250aW51ZSBpZiBzZWVuLmhhcyBwYXJ0XG4gICMgICAgIHNlZW4uYWRkIHBhcnRcbiAgIyAgICAgZWNobyBwYXJ0XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgO251bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5kZW1vX3JlYWRfZHVtcCA9IC0+XG4gIHsgVW5kdW1wZXIsICAgICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9jb2Fyc2Vfc3FsaXRlX3N0YXRlbWVudF9zZWdtZW50ZXIoKVxuICB7IHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMsICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcbiAganpyID0gbmV3IEppenVyYSgpXG4gIGp6ci5kYmEudGVhcmRvd24geyB0ZXN0OiAnKicsIH1cbiAgIyBkZWJ1ZyAnzqlqenJzZGJfXzEzJywgcm93IGZvciByb3cgZnJvbSBqenIuZGJhLndhbGsgU1FMXCJzZWxlY3QgbmFtZSwgdHlwZSBmcm9tIHNxbGl0ZV9zY2hlbWE7XCJcbiAgcGF0aCAgICAgID0gUEFUSC5yZXNvbHZlIF9fZGlybmFtZSwgJy4uL2p6ci5kdW1wLnNxbCdcbiAgdW5kdW1wZXIgID0gbmV3IFVuZHVtcGVyIHsgZGI6IGp6ci5kYmEsIH1cbiAgY291bnQgICAgID0gMFxuICBmb3IgeyBsaW5lLCB9IGZyb20gd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBwYXRoXG4gICAgIyBkZWJ1ZyAnzqlqenJzZGJfXzE0JywgcnByIGxpbmVcbiAgICBmb3Igc3RhdGVtZW50IGZyb20gdW5kdW1wZXIuc2NhbiBsaW5lXG4gICAgICBjb3VudCsrXG4gICAgICBlY2hvIFwiTGluZSAje2NvdW50fTpcIiwgc3RhdGVtZW50XG4gICAgICBoZWxwICfOqWp6cnNkYl9fMTYnLCBcInJlYWQgI3tjb3VudH0gc3RhdGVtZW50c1wiIGlmICggY291bnQgJSAxMCApIGlzIDBcbiAgZGVidWcgJ86panpyc2RiX18xNycsIHJvdyBmb3Igcm93IGZyb20ganpyLmRiYS53YWxrIFNRTFwic2VsZWN0IG5hbWUsIHR5cGUgZnJvbSBzcWxpdGVfc2NoZW1hO1wiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgO251bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmlmIG1vZHVsZSBpcyByZXF1aXJlLm1haW4gdGhlbiBkbyA9PlxuICAjIGRlbW8oKVxuICBkZW1vX3JlYWRfZHVtcCgpXG4gIDtudWxsXG5cbiJdfQ==
