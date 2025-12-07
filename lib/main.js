(function() {
  'use strict';
  var Async_jetstream, Benchmarker, Bsql3, Dbric, Dbric_std, FS, GUY, Jetstream, Jizura, Jzr_db_adapter, Language_services, PATH, SFMODULES, SQL, alert, as_bool, benchmarker, blue, bold, debug, demo, demo_read_dump, demo_source_identifiers, echo, freeze, from_bool, get_paths, gold, green, grey, help, info, inspect, lets, log, plain, praise, red, reverse, rpr, timeit, urge, walk_lines_with_positions, warn, whisper, white;

  //===========================================================================================================
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('jizura-sources-db'));

  ({rpr, inspect, echo, white, green, blue, gold, grey, red, bold, reverse, log} = GUY.trm);

  // { f }                     = require '../../hengist-NG/apps/effstring'
  // write                     = ( p ) -> process.stdout.write p
  // { nfa }                   = require '../../hengist-NG/apps/normalize-function-arguments'
  // GTNG                      = require '../../hengist-NG/apps/guy-test-NG'
  // { Test                  } = GTNG
  FS = require('node:fs');

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
        if (false) { // @is_fresh
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
      //.......................................................................................................
      if (false) { // jzr.dba.is_fresh
        try {
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
      } else {
        //.......................................................................................................
        warn("Ωjzrsdb__13 skipped");
      }
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
    var i, j, jzr, len, len1, part, reading, ref1, ref2, seen, y, z;
    jzr = new Jizura();
    //.........................................................................................................
    // jzr._show_jzr_meta_uc_normalization_faults()
    jzr.show_counts();
    jzr.show_jzr_meta_faults();
    // c:reading:ja-x-Hir
    // c:reading:ja-x-Kat
    seen = new Set();
    for (y of jzr.dba.walk(SQL`select distinct( o ) as reading from jzr_triples where v = 'c:reading:ja-x-Kat' order by o;`)) {
      ({reading} = y);
      ref1 = reading.split(/(.ー|.ャ|.ュ|.ョ|ッ.|.)/v);
      for (i = 0, len = ref1.length; i < len; i++) {
        part = ref1[i];
        if (!(part !== '')) {
          continue;
        }
        if (seen.has(part)) {
          continue;
        }
        seen.add(part);
        echo(part);
      }
    }
    for (z of jzr.dba.walk(SQL`select distinct( o ) as reading from jzr_triples where v = 'c:reading:ja-x-Hir' order by o;`)) {
      ({reading} = z);
      ref2 = reading.split(/(.ー|.ゃ|.ゅ|.ょ|っ.|.)/v);
      for (j = 0, len1 = ref2.length; j < len1; j++) {
        part = ref2[j];
        if (!(part !== '')) {
          continue;
        }
        if (seen.has(part)) {
          // for part in ( reading.split /(.)/v ) when part isnt ''
          continue;
        }
        seen.add(part);
        echo(part);
      }
    }
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  demo_read_dump = function() {
    var Segmenter, Undumper, byte_count, demo_read_dump_with_segmenter, demo_read_dump_with_undumper, jzr, line_count, path, row, segmenter, undumper, wc;
    ({Benchmarker} = SFMODULES.unstable.require_benchmarking());
    // { nameit,               } = SFMODULES.require_nameit()
    benchmarker = new Benchmarker();
    timeit = function(...P) {
      return benchmarker.timeit(...P);
    };
    ({Segmenter, Undumper} = SFMODULES.require_coarse_sqlite_statement_segmenter());
    ({walk_lines_with_positions} = SFMODULES.unstable.require_fast_linereader());
    ({wc} = SFMODULES.require_wc());
    path = PATH.resolve(__dirname, '../jzr.dump.sql');
    line_count = (wc(path)).lines; // 102_727
    // line_count                      =    102_727
    byte_count = (FS.statSync(path)).size;
    debug('Ωjzrsdb__17', {byte_count, line_count});
    jzr = new Jizura();
    jzr.dba.teardown({
      test: '*'
    });
    // debug 'Ωjzrsdb__14', row for row from jzr.dba.walk SQL"select name, type from sqlite_schema;"
    //.........................................................................................................
    if (true) {
      undumper = new Undumper({
        db: jzr.dba,
        mode: 'fast'
      });
      timeit({
        total: line_count,
        brand: 'demo_read_dump'
      }, demo_read_dump_with_undumper = function({progress}) {
        var line, results, statement, y;
        results = [];
        for (y of walk_lines_with_positions(path)) {
          ({line} = y);
          // debug 'Ωjzrsdb__15', rpr line
          progress({
            delta: 1
          });
          results.push((function() {
            var results1;
// progress { delta: line.length, }
            results1 = [];
            for (statement of undumper.scan(line)) {
              results1.push(null);
            }
            return results1;
          })());
        }
        return results;
      });
    } else {
      // echo "Line #{count}:", statement
      // help 'Ωjzrsdb__16', "read #{count} statements" if ( count % 1000 ) is 0
      //.........................................................................................................
      segmenter = new Segmenter();
      timeit({
        total: line_count,
        brand: 'demo_read_dump'
      }, demo_read_dump_with_segmenter = function({progress}) {
        var line, results, statement, y;
        results = [];
        for (y of walk_lines_with_positions(path)) {
          ({line} = y);
          // debug 'Ωjzrsdb__15', rpr line
          progress();
          results.push((function() {
            var results1;
            results1 = [];
            for (statement of segmenter.scan(line)) {
              results1.push(null);
            }
            return results1;
          })());
        }
        return results;
      });
      for (row of jzr.dba.walk(SQL`select name, type from sqlite_schema;`)) {
        // echo "Line #{count}:", statement
        // help 'Ωjzrsdb__16', "read #{count} statements" if ( count % 1000 ) is 0
        debug('Ωjzrsdb__17', row);
      }
      null;
    }
    //.........................................................................................................
    jzr.show_counts();
    jzr.show_jzr_meta_faults();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsRUFBQSxFQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUEsTUFBQSxFQUFBLGNBQUEsRUFBQSxpQkFBQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxjQUFBLEVBQUEsdUJBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEseUJBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUE7OztFQUdBLEdBQUEsR0FBNEIsT0FBQSxDQUFRLEtBQVI7O0VBQzVCLENBQUEsQ0FBRSxLQUFGLEVBQ0UsS0FERixFQUVFLElBRkYsRUFHRSxJQUhGLEVBSUUsS0FKRixFQUtFLE1BTEYsRUFNRSxJQU5GLEVBT0UsSUFQRixFQVFFLE9BUkYsQ0FBQSxHQVE0QixHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVIsQ0FBb0IsbUJBQXBCLENBUjVCOztFQVNBLENBQUEsQ0FBRSxHQUFGLEVBQ0UsT0FERixFQUVFLElBRkYsRUFHRSxLQUhGLEVBSUUsS0FKRixFQUtFLElBTEYsRUFNRSxJQU5GLEVBT0UsSUFQRixFQVFFLEdBUkYsRUFTRSxJQVRGLEVBVUUsT0FWRixFQVdFLEdBWEYsQ0FBQSxH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TUFBQTtNQUNDLEtBdkJIO0tBakJGOztJQTBDRSxHQUFHLENBQUMsV0FBSixDQUFBO0lBQ0EsR0FBRyxDQUFDLG9CQUFKLENBQUE7V0FDQztFQTdDYyxFQXZ5QmpCOzs7RUF3MUJBLElBQUcsTUFBQSxLQUFVLE9BQU8sQ0FBQyxJQUFyQjtJQUFrQyxDQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUE7O01BRWhDLGNBQUEsQ0FBQTthQUNDO0lBSCtCLENBQUEsSUFBbEM7O0FBeDFCQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCdcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5HVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xueyBhbGVydFxuICBkZWJ1Z1xuICBoZWxwXG4gIGluZm9cbiAgcGxhaW5cbiAgcHJhaXNlXG4gIHVyZ2VcbiAgd2FyblxuICB3aGlzcGVyIH0gICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ2ppenVyYS1zb3VyY2VzLWRiJ1xueyBycHJcbiAgaW5zcGVjdFxuICBlY2hvXG4gIHdoaXRlXG4gIGdyZWVuXG4gIGJsdWVcbiAgZ29sZFxuICBncmV5XG4gIHJlZFxuICBib2xkXG4gIHJldmVyc2VcbiAgbG9nICAgICB9ICAgICAgICAgICAgICAgPSBHVVkudHJtXG4jIHsgZiB9ICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvZWZmc3RyaW5nJ1xuIyB3cml0ZSAgICAgICAgICAgICAgICAgICAgID0gKCBwICkgLT4gcHJvY2Vzcy5zdGRvdXQud3JpdGUgcFxuIyB7IG5mYSB9ICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL25vcm1hbGl6ZS1mdW5jdGlvbi1hcmd1bWVudHMnXG4jIEdUTkcgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvZ3V5LXRlc3QtTkcnXG4jIHsgVGVzdCAgICAgICAgICAgICAgICAgIH0gPSBHVE5HXG5GUyAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpmcydcblBBVEggICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOnBhdGgnXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkJzcWwzICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdiZXR0ZXItc3FsaXRlMydcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuU0ZNT0RVTEVTICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9icmljYWJyYWMtc2Ztb2R1bGVzJ1xuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IERicmljLFxuICBEYnJpY19zdGQsXG4gIFNRTCwgICAgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2RicmljKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBsZXRzLFxuICBmcmVlemUsICAgICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9sZXRzZnJlZXpldGhhdF9pbmZyYSgpLnNpbXBsZVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IEpldHN0cmVhbSxcbiAgQXN5bmNfamV0c3RyZWFtLCAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfamV0c3RyZWFtKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9mYXN0X2xpbmVyZWFkZXIoKVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IEJlbmNobWFya2VyLCAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2JlbmNobWFya2luZygpXG5iZW5jaG1hcmtlciAgICAgICAgICAgICAgICAgICA9IG5ldyBCZW5jaG1hcmtlcigpXG50aW1laXQgICAgICAgICAgICAgICAgICAgICAgICA9ICggUC4uLiApIC0+IGJlbmNobWFya2VyLnRpbWVpdCBQLi4uXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbmZyb21fYm9vbCAgICAgICAgICAgICAgICAgICAgID0gKCB4ICkgLT4gc3dpdGNoIHhcbiAgd2hlbiB0cnVlICB0aGVuIDFcbiAgd2hlbiBmYWxzZSB0aGVuIDBcbiAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fXzEgZXhwZWN0ZWQgdHJ1ZSBvciBmYWxzZSwgZ290ICN7cnByIHh9XCJcbmFzX2Jvb2wgICAgICAgICAgICAgICAgICAgICAgID0gKCB4ICkgLT4gc3dpdGNoIHhcbiAgd2hlbiAxIHRoZW4gdHJ1ZVxuICB3aGVuIDAgdGhlbiBmYWxzZVxuICBlbHNlIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX19fMiBleHBlY3RlZCAwIG9yIDEsIGdvdCAje3JwciB4fVwiXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZGVtb19zb3VyY2VfaWRlbnRpZmllcnMgPSAtPlxuICB7IGV4cGFuZF9kaWN0aW9uYXJ5LCAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9kaWN0aW9uYXJ5X3Rvb2xzKClcbiAgeyBnZXRfbG9jYWxfZGVzdGluYXRpb25zLCB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfZ2V0X2xvY2FsX2Rlc3RpbmF0aW9ucygpXG4gIGZvciBrZXksIHZhbHVlIG9mIGdldF9sb2NhbF9kZXN0aW5hdGlvbnMoKVxuICAgIGRlYnVnICfOqWp6cnNkYl9fXzMnLCBrZXksIHZhbHVlXG4gICMgY2FuIGFwcGVuZCBsaW5lIG51bWJlcnMgdG8gZmlsZXMgYXMgaW46XG4gICMgJ2RpY3Q6bWVhbmluZ3MuMTpMPTEzMzMyJ1xuICAjICdkaWN0OnVjZDE0MC4xOnVoZGlkeDpMPTEyMzQnXG4gICMgcm93aWRzOiAndDpqZm06Uj0xJ1xuICAjIHtcbiAgIyAgICdkaWN0Om1lYW5pbmdzJzogICAgICAgICAgJyRqenJkcy9tZWFuaW5nL21lYW5pbmdzLnR4dCdcbiAgIyAgICdkaWN0OnVjZDp2MTQuMDp1aGRpZHgnIDogJyRqenJkcy91bmljb2RlLm9yZy11Y2QtdjE0LjAvVW5paGFuX0RpY3Rpb25hcnlJbmRpY2VzLnR4dCdcbiAgIyAgIH1cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5nZXRfcGF0aHMgPSAtPlxuICBSICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0ge31cbiAgUi5iYXNlICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEgucmVzb2x2ZSBfX2Rpcm5hbWUsICcuLidcbiAgUi5qenIgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEgucmVzb2x2ZSBSLmJhc2UsICcuLidcbiAgUi5kYiAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBSLmJhc2UsICdqenIuZGInXG4gICMgUi5kYiAgICAgICAgICAgICAgICAgICAgICAgICAgICA9ICcvZGV2L3NobS9qenIuZGInXG4gIFIuanpyZHMgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gUi5iYXNlLCAnanpyZHMnXG4gIFIuanpybmV3ZHMgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gUi5qenIsICdqaXp1cmEtbmV3LWRhdGFzb3VyY2VzJ1xuICBSLnJhd19naXRodWIgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIFIuanpybmV3ZHMsICdidmZzL29yaWdpbi9odHRwcy9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tJ1xuICBrYW5qaXVtICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIFIucmF3X2dpdGh1YiwgJ21pZnVuZXRvc2hpcm8va2Fuaml1bS84YTBjZGFhMTZkNjRhMjgxYTIwNDhkZTJlZWUyZWM1ZTNhNDQwZmE2J1xuICBSWyAnZGljdDptZWFuaW5ncycgICAgICAgICAgXSAgID0gUEFUSC5qb2luIFIuanpyZHMsICdtZWFuaW5nL21lYW5pbmdzLnR4dCdcbiAgUlsgJ2RpY3Q6dWNkOnYxNC4wOnVoZGlkeCcgIF0gICA9IFBBVEguam9pbiBSLmp6cmRzLCAndW5pY29kZS5vcmctdWNkLXYxNC4wL1VuaWhhbl9EaWN0aW9uYXJ5SW5kaWNlcy50eHQnXG4gIFJbICdkaWN0Ong6a28tSGFuZytMYXRuJyAgICBdICAgPSBQQVRILmpvaW4gUi5qenJuZXdkcywgJ2hhbmdldWwtdHJhbnNjcmlwdGlvbnMudHN2J1xuICBSWyAnZGljdDp4OmphLUthbitMYXRuJyAgICAgXSAgID0gUEFUSC5qb2luIFIuanpybmV3ZHMsICdrYW5hLXRyYW5zY3JpcHRpb25zLnRzdidcbiAgUlsgJ2RpY3Q6YmNwNDcnICAgICAgICAgICAgIF0gICA9IFBBVEguam9pbiBSLmp6cm5ld2RzLCAnQkNQNDctbGFuZ3VhZ2Utc2NyaXB0cy1yZWdpb25zLnRzdidcbiAgUlsgJ2RpY3Q6amE6a2Fuaml1bScgICAgICAgIF0gICA9IFBBVEguam9pbiBrYW5qaXVtLCAnZGF0YS9zb3VyY2VfZmlsZXMva2FuamlkaWN0LnR4dCdcbiAgUlsgJ2RpY3Q6amE6a2Fuaml1bTphdXgnICAgIF0gICA9IFBBVEguam9pbiBrYW5qaXVtLCAnZGF0YS9zb3VyY2VfZmlsZXMvMF9SRUFETUUudHh0J1xuICByZXR1cm4gUlxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgSnpyX2RiX2FkYXB0ZXIgZXh0ZW5kcyBEYnJpY19zdGRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBkYl9jbGFzczogIEJzcWwzXG4gIEBwcmVmaXg6ICAgICdqenInXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogKCBkYl9wYXRoLCBjZmcgPSB7fSApIC0+XG4gICAgIyMjIFRBSU5UIG5lZWQgbW9yZSBjbGFyaXR5IGFib3V0IHdoZW4gc3RhdGVtZW50cywgYnVpbGQsIGluaXRpYWxpemUuLi4gaXMgcGVyZm9ybWVkICMjI1xuICAgIHsgaG9zdCwgfSA9IGNmZ1xuICAgIGNmZyAgICAgICA9IGxldHMgY2ZnLCAoIGNmZyApIC0+IGRlbGV0ZSBjZmcuaG9zdFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc3VwZXIgZGJfcGF0aCwgY2ZnXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBAaG9zdCAgICAgPSBob3N0XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkbyA9PlxuICAgICAgIyMjIFRBSU5UIHRoaXMgaXMgbm90IHdlbGwgcGxhY2VkICMjI1xuICAgICAgIyMjIE5PVEUgZXhlY3V0ZSBhIEdhcHMtYW5kLUlzbGFuZHMgRVNTRlJJIHRvIGltcHJvdmUgc3RydWN0dXJhbCBpbnRlZ3JpdHkgYXNzdXJhbmNlOiAjIyNcbiAgICAgICMgKCBAcHJlcGFyZSBTUUxcInNlbGVjdCAqIGZyb20gX2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzIHdoZXJlIGZhbHNlO1wiICkuZ2V0KClcbiAgICAgIG1lc3NhZ2VzID0gW11cbiAgICAgIGZvciB7IG5hbWUsIHR5cGUsIH0gZnJvbSBAc3RhdGVtZW50cy5zdGRfZ2V0X3JlbGF0aW9ucy5pdGVyYXRlKClcbiAgICAgICAgdHJ5XG4gICAgICAgICAgKCBAcHJlcGFyZSBTUUxcInNlbGVjdCAqIGZyb20gI3tuYW1lfSB3aGVyZSBmYWxzZTtcIiApLmFsbCgpXG4gICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgbWVzc2FnZXMucHVzaCBcIiN7dHlwZX0gI3tuYW1lfTogI3tlcnJvci5tZXNzYWdlfVwiXG4gICAgICAgICAgd2FybiAnzqlqenJzZGJfX180JywgZXJyb3IubWVzc2FnZVxuICAgICAgcmV0dXJuIG51bGwgaWYgbWVzc2FnZXMubGVuZ3RoIGlzIDBcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX19fNSBFRkZSSSB0ZXN0aW5nIHJldmVhbGVkIGVycm9yczogI3tycHIgbWVzc2FnZXN9XCJcbiAgICAgIDtudWxsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiBmYWxzZSAjIEBpc19mcmVzaFxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlcygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl92ZXJicygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9sY29kZXMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGluZXMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlc19mb3JfbWVhbmluZ3MoKVxuICAgIGVsc2VcbiAgICAgIHdhcm4gJ86panpyc2RiX19fNicsIFwic2tpcHBlZCBkYXRhIGluc2VydGlvblwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAYnVpbGQ6IFtcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9kYXRhc291cmNlcyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGRza2V5ICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHBhdGggICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6ZHM6Uj1cXFxcZCskJykpO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX21pcnJvcl9sY29kZXMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBsY29kZSAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBjb21tZW50ICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCBsY29kZSByZWdleHAgJ15bYS16QS1aXStbYS16QS1aMC05XSokJyApLFxuICAgICAgY2hlY2sgKCByb3dpZCA9ICd0Om1yOmxjOlY9JyB8fCBsY29kZSApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX2xpbmVzIChcbiAgICAgICAgLS0gJ3Q6amZtOidcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcmVmICAgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggZHNrZXkgfHwgJzpMPScgfHwgbGluZV9uciApIHZpcnR1YWwsXG4gICAgICAgIGRza2V5ICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmVfbnIgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxjb2RlICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmUgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGpmaWVsZHMgICBqc29uICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgIGZpZWxkXzEgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgIGZpZWxkXzIgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgIGZpZWxkXzMgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAgIGZpZWxkXzQgICB0ZXh0ICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bXI6bG46Uj1cXFxcZCskJyksXG4gICAgICB1bmlxdWUgKCBkc2tleSwgbGluZV9uciApLFxuICAgICAgZm9yZWlnbiBrZXkgKCBsY29kZSApIHJlZmVyZW5jZXMganpyX21pcnJvcl9sY29kZXMgKCBsY29kZSApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX3ZlcmJzIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcyAgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgdiAgICAgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgbyAgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNoZWNrICggcm93aWQgcmVnZXhwICdedDptcjp2YjpWPVtcXFxcLTpcXFxcK1xcXFxwe0x9XSskJyApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHJlZiAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHMgICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHYgICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIG8gICAgICAgICBqc29uICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bXI6M3BsOlI9XFxcXGQrJCcgKSxcbiAgICAgIHVuaXF1ZSAoIHJlZiwgcywgdiwgbyApXG4gICAgICBmb3JlaWduIGtleSAoIHJlZiApIHJlZmVyZW5jZXMganpyX21pcnJvcl9saW5lcyAoIHJvd2lkIClcbiAgICAgIGZvcmVpZ24ga2V5ICggdiApIHJlZmVyZW5jZXMganpyX21pcnJvcl92ZXJicyAoIHYgKSApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdHJpZ2dlciBqenJfbWlycm9yX3RyaXBsZXNfcmVnaXN0ZXJcbiAgICAgIGJlZm9yZSBpbnNlcnQgb24ganpyX21pcnJvcl90cmlwbGVzX2Jhc2VcbiAgICAgIGZvciBlYWNoIHJvdyBiZWdpblxuICAgICAgICBzZWxlY3QgdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0KCAnanpyX21pcnJvcl90cmlwbGVzX2Jhc2UnLCBuZXcucm93aWQsIG5ldy5yZWYsIG5ldy5zLCBuZXcudiwgbmV3Lm8gKTtcbiAgICAgICAgZW5kO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgKFxuICAgICAgICByb3dpZCAgICAgICAgICAgdGV4dCAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcmVmICAgICAgICAgICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHN5bGxhYmxlX2hhbmcgICB0ZXh0ICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBzeWxsYWJsZV9sYXRuICAgdGV4dCAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGluaXRpYWxfbGF0biB8fCBtZWRpYWxfbGF0biB8fCBmaW5hbF9sYXRuICkgdmlydHVhbCxcbiAgICAgICAgLS0gc3lsbGFibGVfbGF0biAgIHRleHQgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGluaXRpYWxfbGF0biB8fCBtZWRpYWxfbGF0biB8fCBmaW5hbF9sYXRuICkgdmlydHVhbCxcbiAgICAgICAgaW5pdGlhbF9oYW5nICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIG1lZGlhbF9oYW5nICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBmaW5hbF9oYW5nICAgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgaW5pdGlhbF9sYXRuICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIG1lZGlhbF9sYXRuICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBmaW5hbF9sYXRuICAgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNoZWNrICggcm93aWQgcmVnZXhwICdedDpsYW5nOmhhbmc6c3lsOlY9XFxcXFMrJCcgKVxuICAgICAgLS0gdW5pcXVlICggcmVmLCBzLCB2LCBvIClcbiAgICAgIC0tIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xpbmVzICggcm93aWQgKVxuICAgICAgLS0gZm9yZWlnbiBrZXkgKCBzeWxsYWJsZV9oYW5nICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoIG8gKSApXG4gICAgICApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdHJpZ2dlciBqenJfbGFuZ19oYW5nX3N5bGxhYmxlc19yZWdpc3RlclxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfbGFuZ19oYW5nX3N5bGxhYmxlc1xuICAgICAgZm9yIGVhY2ggcm93IGJlZ2luXG4gICAgICAgIHNlbGVjdCB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfbGFuZ19oYW5nX3N5bGxhYmxlcycsXG4gICAgICAgICAgbmV3LnJvd2lkLCBuZXcucmVmLCBuZXcuc3lsbGFibGVfaGFuZywgbmV3LnN5bGxhYmxlX2xhdG4sXG4gICAgICAgICAgICBuZXcuaW5pdGlhbF9oYW5nLCBuZXcubWVkaWFsX2hhbmcsIG5ldy5maW5hbF9oYW5nLFxuICAgICAgICAgICAgbmV3LmluaXRpYWxfbGF0biwgbmV3Lm1lZGlhbF9sYXRuLCBuZXcuZmluYWxfbGF0biApO1xuICAgICAgICBlbmQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyBzLCBudWxsIGFzIHYsIG51bGwgYXMgbyB3aGVyZSBmYWxzZSB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tTGF0bicsICAgICAgICAgIHN5bGxhYmxlX2xhdG4gICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tTGF0bjppbml0aWFsJywgIGluaXRpYWxfbGF0biAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tTGF0bjptZWRpYWwnLCAgIG1lZGlhbF9sYXRuICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tTGF0bjpmaW5hbCcsICAgIGZpbmFsX2xhdG4gICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tSGFuZzppbml0aWFsJywgIGluaXRpYWxfaGFuZyAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tSGFuZzptZWRpYWwnLCAgIG1lZGlhbF9oYW5nICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tSGFuZzpmaW5hbCcsICAgIGZpbmFsX2hhbmcgICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfYWxsX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyBzLCBudWxsIGFzIHYsIG51bGwgYXMgbyB3aGVyZSBmYWxzZSB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0ICogZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCAqIGZyb20ganpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlcyB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwgd2hlcmUgZmFsc2VcbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyBzLCBudWxsIGFzIHYsIG51bGwgYXMgbyB3aGVyZSBmYWxzZSB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0ICogZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSB3aGVyZSB2IGxpa2UgJ2M6JScgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgdGIucm93aWQsIHRiLnJlZiwgdGIucywga3Iudiwga3IubyBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHRiXG4gICAgICAgIGpvaW4ganpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlcyBhcyBrciBvbiAoIHRiLnYgPSAnYzpyZWFkaW5nOmtvLUhhbmcnIGFuZCB0Yi5vID0ga3IucyApXG4gICAgICAgIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgb3JkZXIgYnkgcywgdiwgb1xuICAgICAgO1wiXCJcIlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMgYXMgc2VsZWN0XG4gICAgICAgIG1sLnJvd2lkICBhcyByb3dpZCxcbiAgICAgICAgbWwucmVmICAgIGFzIHJlZixcbiAgICAgICAgbWwubGluZSAgIGFzIGxpbmVcbiAgICAgIGZyb20ganpyX21pcnJvcl9saW5lcyBhcyBtbFxuICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICBhbmQgKCBub3QgaXNfdWNfbm9ybWFsKCBtbC5saW5lICkgKVxuICAgICAgb3JkZXIgYnkgbWwucm93aWQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV9rcl9yZWFkaW5nc191bmtub3duX3ZlcmJfZmF1bHRzIGFzIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIGNvdW50KCopIG92ZXIgKCBwYXJ0aXRpb24gYnkgdiApICAgIGFzIGNvdW50LFxuICAgICAgICAgICdqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzOlI9KicgIGFzIHJvd2lkLFxuICAgICAgICAgICcqJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAndW5rbm93bi12ZXJiJyAgICAgICAgICAgICAgICAgICAgICBhcyBkZXNjcmlwdGlvbixcbiAgICAgICAgICB2ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBxdW90ZVxuICAgICAgICBmcm9tIGp6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXMgYXMgbm5cbiAgICAgICAgd2hlcmUgbm90IGV4aXN0cyAoIHNlbGVjdCAxIGZyb20ganpyX21pcnJvcl92ZXJicyBhcyB2YiB3aGVyZSB2Yi52ID0gbm4udiApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfbWV0YV9mYXVsdHMgYXNcbiAgICAgIHNlbGVjdCBudWxsIGFzIGNvdW50LCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyBkZXNjcmlwdGlvbiwgbnVsbCAgYXMgcXVvdGUgd2hlcmUgZmFsc2UgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCAxLCByb3dpZCwgcmVmLCAgJ3VjLW5vcm1hbGl6YXRpb24nLCBsaW5lICBhcyBxdW90ZSBmcm9tIF9qenJfbWV0YV91Y19ub3JtYWxpemF0aW9uX2ZhdWx0cyAgICAgICAgICB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tIF9qenJfbWV0YV9rcl9yZWFkaW5nc191bmtub3duX3ZlcmJfZmF1bHRzICB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwgd2hlcmUgZmFsc2VcbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfc3lsbGFibGVzIGFzIHNlbGVjdFxuICAgICMgICAgICAgdDEuc1xuICAgICMgICAgICAgdDEudlxuICAgICMgICAgICAgdDEub1xuICAgICMgICAgICAgdGkucyBhcyBpbml0aWFsX2hhbmdcbiAgICAjICAgICAgIHRtLnMgYXMgbWVkaWFsX2hhbmdcbiAgICAjICAgICAgIHRmLnMgYXMgZmluYWxfaGFuZ1xuICAgICMgICAgICAgdGkubyBhcyBpbml0aWFsX2xhdG5cbiAgICAjICAgICAgIHRtLm8gYXMgbWVkaWFsX2xhdG5cbiAgICAjICAgICAgIHRmLm8gYXMgZmluYWxfbGF0blxuICAgICMgICAgIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgdDFcbiAgICAjICAgICBqb2luXG4gICAgIyAgICAgam9pbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0aSBvbiAoIHQxLilcbiAgICAjICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIyMgYWdncmVnYXRlIHRhYmxlIGZvciBhbGwgcm93aWRzIGdvZXMgaGVyZSAjIyNcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQHN0YXRlbWVudHM6XG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfZGF0YXNvdXJjZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfZGF0YXNvdXJjZXMgKCByb3dpZCwgZHNrZXksIHBhdGggKSB2YWx1ZXMgKCAkcm93aWQsICRkc2tleSwgJHBhdGggKVxuICAgICAgICBvbiBjb25mbGljdCAoIGRza2V5ICkgZG8gdXBkYXRlIHNldCBwYXRoID0gZXhjbHVkZWQucGF0aDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9taXJyb3JfdmVyYjogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3ZlcmJzICggcm93aWQsIHMsIHYsIG8gKSB2YWx1ZXMgKCAkcm93aWQsICRzLCAkdiwgJG8gKVxuICAgICAgICBvbiBjb25mbGljdCAoIHJvd2lkICkgZG8gdXBkYXRlIHNldCBzID0gZXhjbHVkZWQucywgdiA9IGV4Y2x1ZGVkLnYsIG8gPSBleGNsdWRlZC5vO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX21pcnJvcl9sY29kZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX2xjb2RlcyAoIHJvd2lkLCBsY29kZSwgY29tbWVudCApIHZhbHVlcyAoICRyb3dpZCwgJGxjb2RlLCAkY29tbWVudCApXG4gICAgICAgIG9uIGNvbmZsaWN0ICggcm93aWQgKSBkbyB1cGRhdGUgc2V0IGxjb2RlID0gZXhjbHVkZWQubGNvZGUsIGNvbW1lbnQgPSBleGNsdWRlZC5jb21tZW50O1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX21pcnJvcl90cmlwbGU6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgKCByb3dpZCwgcmVmLCBzLCB2LCBvICkgdmFsdWVzICggJHJvd2lkLCAkcmVmLCAkcywgJHYsICRvIClcbiAgICAgICAgb24gY29uZmxpY3QgKCByZWYsIHMsIHYsIG8gKSBkbyBub3RoaW5nO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfbGluZXMgKCByb3dpZCwgZHNrZXksIGxpbmVfbnIsIGxjb2RlLCBsaW5lLCBqZmllbGRzLCBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80IClcbiAgICAgIHNlbGVjdFxuICAgICAgICAndDptcjpsbjpSPScgfHwgcm93X251bWJlcigpIG92ZXIgKCkgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgIC0tIGRzLmRza2V5IHx8ICc6TD0nIHx8IGZsLmxpbmVfbnIgICBhcyByb3dpZCxcbiAgICAgICAgZHMuZHNrZXkgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGRza2V5LFxuICAgICAgICBmbC5saW5lX25yICAgICAgICAgICAgICAgICAgICAgICAgYXMgbGluZV9ucixcbiAgICAgICAgZmwubGNvZGUgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGxjb2RlLFxuICAgICAgICBmbC5saW5lICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbGluZSxcbiAgICAgICAgZmwuamZpZWxkcyAgICAgICAgICAgICAgICAgICAgICAgIGFzIGpmaWVsZHMsXG4gICAgICAgIGZsLmZpZWxkXzEgICAgICAgICAgICAgICAgICAgICAgICBhcyBmaWVsZF8xLFxuICAgICAgICBmbC5maWVsZF8yICAgICAgICAgICAgICAgICAgICAgICAgYXMgZmllbGRfMixcbiAgICAgICAgZmwuZmllbGRfMyAgICAgICAgICAgICAgICAgICAgICAgIGFzIGZpZWxkXzMsXG4gICAgICAgIGZsLmZpZWxkXzQgICAgICAgICAgICAgICAgICAgICAgICBhcyBmaWVsZF80XG4gICAgICBmcm9tIGp6cl9kYXRhc291cmNlcyAgICAgICAgYXMgZHNcbiAgICAgIGpvaW4gZmlsZV9saW5lcyggZHMucGF0aCApICBhcyBmbFxuICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgb24gY29uZmxpY3QgKCBkc2tleSwgbGluZV9uciApIGRvIHVwZGF0ZSBzZXQgbGluZSA9IGV4Y2x1ZGVkLmxpbmU7XG4gICAgICBcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcG9wdWxhdGVfanpyX21pcnJvcl90cmlwbGVzOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICggcm93aWQsIHJlZiwgcywgdiwgbyApXG4gICAgICAgIHNlbGVjdFxuICAgICAgICAgICAgZ3Qucm93aWRfb3V0ICAgIGFzIHJvd2lkLFxuICAgICAgICAgICAgZ3QucmVmICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAgIGd0LnMgICAgICAgICAgICBhcyBzLFxuICAgICAgICAgICAgZ3QudiAgICAgICAgICAgIGFzIHYsXG4gICAgICAgICAgICBndC5vICAgICAgICAgICAgYXMgb1xuICAgICAgICAgIGZyb20ganpyX21pcnJvcl9saW5lcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBtbFxuICAgICAgICAgIGpvaW4gZ2V0X3RyaXBsZXMoIG1sLnJvd2lkLCBtbC5kc2tleSwgbWwuZmllbGRfMSwgbWwuZmllbGRfMiwgbWwuZmllbGRfMyApICBhcyBndFxuICAgICAgICAgIHdoZXJlIHRydWVcbiAgICAgICAgICAgIGFuZCAoIG1sLmxjb2RlID0gJ0QnIClcbiAgICAgICAgICAgIC0tIGFuZCAoIG1sLmRza2V5ID0gJ2RpY3Q6bWVhbmluZ3MnIClcbiAgICAgICAgICAgIGFuZCAoIG1sLmZpZWxkXzEgaXMgbm90IG51bGwgKVxuICAgICAgICAgICAgYW5kICggbWwuZmllbGRfMSBub3QgcmVnZXhwICdeQGdseXBocycgKVxuICAgICAgICAgICAgLS0gYW5kICggbWwuZmllbGRfMyByZWdleHAgJ14oPzpweXxoaXxrYSk6JyApXG4gICAgICAgIG9uIGNvbmZsaWN0ICggcmVmLCBzLCB2LCBvICkgZG8gbm90aGluZ1xuICAgICAgICA7XG4gICAgICBcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcG9wdWxhdGVfanpyX2xhbmdfaGFuZ2V1bF9zeWxsYWJsZXM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgKCByb3dpZCwgcmVmLFxuICAgICAgICBzeWxsYWJsZV9oYW5nLCBpbml0aWFsX2hhbmcsIG1lZGlhbF9oYW5nLCBmaW5hbF9oYW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbF9sYXRuLCBtZWRpYWxfbGF0biwgZmluYWxfbGF0blxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICAgICd0Omxhbmc6aGFuZzpzeWw6Vj0nIHx8IG10Lm8gICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgICAgICBtdC5yb3dpZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAgIG10Lm8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgc3lsbGFibGVfaGFuZyxcbiAgICAgICAgICAgIGRoLmluaXRpYWwgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgaW5pdGlhbF9oYW5nLFxuICAgICAgICAgICAgZGgubWVkaWFsICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBtZWRpYWxfaGFuZyxcbiAgICAgICAgICAgIGRoLmZpbmFsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZmluYWxfaGFuZyxcbiAgICAgICAgICAgIGNvYWxlc2NlKCBtdGkubywgJycgKSAgICAgICAgICAgICAgICAgYXMgaW5pdGlhbF9sYXRuLFxuICAgICAgICAgICAgY29hbGVzY2UoIG10bS5vLCAnJyApICAgICAgICAgICAgICAgICBhcyBtZWRpYWxfbGF0bixcbiAgICAgICAgICAgIGNvYWxlc2NlKCBtdGYubywgJycgKSAgICAgICAgICAgICAgICAgYXMgZmluYWxfbGF0blxuICAgICAgICAgIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgICAgICAgICAgICAgYXMgbXRcbiAgICAgICAgICBsZWZ0IGpvaW4gZGlzYXNzZW1ibGVfaGFuZ2V1bCggbXQubyApICAgIGFzIGRoXG4gICAgICAgICAgbGVmdCBqb2luIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIG10aSBvbiAoIG10aS5zID0gZGguaW5pdGlhbCBhbmQgbXRpLnYgPSAneDprby1IYW5nK0xhdG46aW5pdGlhbCcgKVxuICAgICAgICAgIGxlZnQgam9pbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyBtdG0gb24gKCBtdG0ucyA9IGRoLm1lZGlhbCAgYW5kIG10bS52ID0gJ3g6a28tSGFuZytMYXRuOm1lZGlhbCcgIClcbiAgICAgICAgICBsZWZ0IGpvaW4ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgbXRmIG9uICggbXRmLnMgPSBkaC5maW5hbCAgIGFuZCBtdGYudiA9ICd4OmtvLUhhbmcrTGF0bjpmaW5hbCcgICApXG4gICAgICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICAgICAgYW5kICggbXQudiA9ICdjOnJlYWRpbmc6a28tSGFuZycgKVxuICAgICAgICAgICAgLS0gYW5kICggbWwuZHNrZXkgPSAnZGljdDptZWFuaW5ncycgKVxuICAgICAgICAgICAgLS0gYW5kICggbWwuZmllbGRfMSBpcyBub3QgbnVsbCApXG4gICAgICAgICAgICAtLSBhbmQgKCBtbC5maWVsZF8xIG5vdCByZWdleHAgJ15AZ2x5cGhzJyApXG4gICAgICAgICAgICAtLSBhbmQgKCBtbC5maWVsZF8zIHJlZ2V4cCAnXig/OnB5fGhpfGthKTonIClcbiAgICAgICAgICBvcmRlciBieSBtdC5vXG4gICAgICAgIG9uIGNvbmZsaWN0ICggcm93aWQgICAgICAgICApIGRvIG5vdGhpbmdcbiAgICAgICAgb24gY29uZmxpY3QgKCBzeWxsYWJsZV9oYW5nICkgZG8gbm90aGluZ1xuICAgICAgICA7XG4gICAgICBcIlwiXCJcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGNvZGVzOiAtPlxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPUInLCBsY29kZTogJ0InLCBjb21tZW50OiAnYmxhbmsgbGluZScsICAgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPUMnLCBsY29kZTogJ0MnLCBjb21tZW50OiAnY29tbWVudCBsaW5lJywgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPUQnLCBsY29kZTogJ0QnLCBjb21tZW50OiAnZGF0YSBsaW5lJywgICAgfVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX3ZlcmJzOiAtPlxuICAgICMjIyBOT1RFXG4gICAgaW4gdmVyYnMsIGluaXRpYWwgY29tcG9uZW50IGluZGljYXRlcyB0eXBlIG9mIHN1YmplY3Q6XG4gICAgICBgYzpgIGlzIGZvciBzdWJqZWN0cyB0aGF0IGFyZSBDSksgY2hhcmFjdGVyc1xuICAgICAgYHg6YCBpcyB1c2VkIGZvciB1bmNsYXNzaWZpZWQgc3ViamVjdHMgKHBvc3NpYmx5IHRvIGJlIHJlZmluZWQgaW4gdGhlIGZ1dHVyZSlcbiAgICAjIyNcbiAgICByb3dzID0gW1xuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj14OmtvLUhhbmcrTGF0bjppbml0aWFsJywgICAgczogXCJOTlwiLCB2OiAneDprby1IYW5nK0xhdG46aW5pdGlhbCcsICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9eDprby1IYW5nK0xhdG46bWVkaWFsJywgICAgIHM6IFwiTk5cIiwgdjogJ3g6a28tSGFuZytMYXRuOm1lZGlhbCcsICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPXg6a28tSGFuZytMYXRuOmZpbmFsJywgICAgICBzOiBcIk5OXCIsIHY6ICd4OmtvLUhhbmcrTGF0bjpmaW5hbCcsICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6emgtTGF0bi1waW55aW4nLCAgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOnpoLUxhdG4tcGlueWluJywgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmphLXgtS2FuJywgICAgICAgIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzpqYS14LUthbicsICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzpqYS14LUhpcicsICAgICAgICBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6amEteC1IaXInLCAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6amEteC1LYXQnLCAgICAgICAgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmphLXgtS2F0JywgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmphLXgtTGF0bicsICAgICAgIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzpqYS14LUxhdG4nLCAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzprby1IYW5nJywgICAgICAgICBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6a28tSGFuZycsICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6a28tTGF0bicsICAgICAgICAgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmtvLUxhdG4nLCAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmtvLUhhbmc6aW5pdGlhbCcsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzprby1IYW5nOmluaXRpYWwnLCAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzprby1IYW5nOm1lZGlhbCcsICBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6a28tSGFuZzptZWRpYWwnLCAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6a28tSGFuZzpmaW5hbCcsICAgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmtvLUhhbmc6ZmluYWwnLCAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmtvLUxhdG46aW5pdGlhbCcsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzprby1MYXRuOmluaXRpYWwnLCAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzprby1MYXRuOm1lZGlhbCcsICBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6a28tTGF0bjptZWRpYWwnLCAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6a28tTGF0bjpmaW5hbCcsICAgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmtvLUxhdG46ZmluYWwnLCAgICBvOiBcIk5OXCIsIH1cbiAgICAgIF1cbiAgICBmb3Igcm93IGluIHJvd3NcbiAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX3ZlcmIucnVuIHJvd1xuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZXM6IC0+XG4gICAgcGF0aHMgPSBnZXRfcGF0aHMoKVxuICAgIGRza2V5ID0gJ2RpY3Q6bWVhbmluZ3MnOyAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MScsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZGljdDp1Y2Q6djE0LjA6dWhkaWR4JzsgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0yJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZGljdDp4OmtvLUhhbmcrTGF0bic7ICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0zJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZGljdDp4OmphLUthbitMYXRuJzsgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj00JywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZGljdDpqYTprYW5qaXVtJzsgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj01JywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZGljdDpqYTprYW5qaXVtOmF1eCc7ICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj02JywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgO251bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBfb25fb3Blbl9wb3B1bGF0ZV92ZXJiczogLT5cbiAgIyAgIHBhdGhzID0gZ2V0X3BhdGhzKClcbiAgIyAgIGRza2V5ID0gJ2RpY3Q6bWVhbmluZ3MnOyAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MScsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAjICAgZHNrZXkgPSAnZGljdDp1Y2Q6djE0LjA6dWhkaWR4JzsgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0yJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICMgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9saW5lczogLT5cbiAgICBAc3RhdGVtZW50cy5wb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzLnJ1bigpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlc19mb3JfbWVhbmluZ3M6IC0+XG4gICAgIyA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlcigpXG4gICAgQF9UTVBfc3RhdGUgPSB7IHRyaXBsZV9jb3VudDogMCwgbW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93OiBudWxsIH1cbiAgICAjIG1lID0gQFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0OiAoIG5hbWUsIGZpZWxkcy4uLiApIC0+XG4gICAgQF9UTVBfc3RhdGUubW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93ID0geyBuYW1lLCBmaWVsZHMsIH1cbiAgICA7bnVsbFxuXG4gICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgQGZ1bmN0aW9uczpcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0OlxuICAgICAgIyMjIE5PVEUgaW4gdGhlIGZ1dHVyZSB0aGlzIGZ1bmN0aW9uIGNvdWxkIHRyaWdnZXIgY3JlYXRpb24gb2YgdHJpZ2dlcnMgb24gaW5zZXJ0cyAjIyNcbiAgICAgIGRldGVybWluaXN0aWM6ICB0cnVlXG4gICAgICB2YXJhcmdzOiAgICAgICAgdHJ1ZVxuICAgICAgY2FsbDogKCBuYW1lLCBmaWVsZHMuLi4gKSAtPiBAdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0IG5hbWUsIGZpZWxkcy4uLlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjIyMgTk9URSBtb3ZlZCB0byBEYnJpY19zdGQ7IGNvbnNpZGVyIHRvIG92ZXJ3cml0ZSB3aXRoIHZlcnNpb24gdXNpbmcgYHNsZXZpdGhhbi9yZWdleGAgIyMjXG4gICAgIyByZWdleHA6XG4gICAgIyAgIG92ZXJ3cml0ZTogICAgICB0cnVlXG4gICAgIyAgIGRldGVybWluaXN0aWM6ICB0cnVlXG4gICAgIyAgIGNhbGw6ICggcGF0dGVybiwgdGV4dCApIC0+IGlmICggKCBuZXcgUmVnRXhwIHBhdHRlcm4sICd2JyApLnRlc3QgdGV4dCApIHRoZW4gMSBlbHNlIDBcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaXNfdWNfbm9ybWFsOlxuICAgICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAgICMjIyBOT1RFOiBhbHNvIHNlZSBgU3RyaW5nOjppc1dlbGxGb3JtZWQoKWAgIyMjXG4gICAgICBjYWxsOiAoIHRleHQsIGZvcm0gPSAnTkZDJyApIC0+IGZyb21fYm9vbCB0ZXh0IGlzIHRleHQubm9ybWFsaXplIGZvcm0gIyMjICdORkMnLCAnTkZEJywgJ05GS0MnLCBvciAnTkZLRCcgIyMjXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBAdGFibGVfZnVuY3Rpb25zOlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBzcGxpdF93b3JkczpcbiAgICAgIGNvbHVtbnM6ICAgICAgWyAna2V5d29yZCcsIF1cbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAnbGluZScsIF1cbiAgICAgIHJvd3M6ICggbGluZSApIC0+XG4gICAgICAgIGtleXdvcmRzID0gbGluZS5zcGxpdCAvKD86XFxwe1p9Kyl8KCg/OlxccHtTY3JpcHQ9SGFufSl8KD86XFxwe0x9Kyl8KD86XFxwe059Kyl8KD86XFxwe1N9KykpL3ZcbiAgICAgICAgZm9yIGtleXdvcmQgaW4ga2V5d29yZHNcbiAgICAgICAgICBjb250aW51ZSB1bmxlc3Mga2V5d29yZD9cbiAgICAgICAgICBjb250aW51ZSBpZiBrZXl3b3JkIGlzICcnXG4gICAgICAgICAgeWllbGQgeyBrZXl3b3JkLCB9XG4gICAgICAgIDtudWxsXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGZpbGVfbGluZXM6XG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2xpbmVfbnInLCAnbGNvZGUnLCAnbGluZScsICdqZmllbGRzJywgJ2ZpZWxkXzEnLCAnZmllbGRfMicsICdmaWVsZF8zJywgJ2ZpZWxkXzQnLCBdXG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ3BhdGgnLCBdXG4gICAgICByb3dzOiAoIHBhdGggKSAtPlxuICAgICAgICBmb3IgeyBsbnI6IGxpbmVfbnIsIGxpbmUsIGVvbCwgfSBmcm9tIHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgcGF0aFxuICAgICAgICAgIGxpbmUgPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5ub3JtYWxpemVfdGV4dCBsaW5lXG4gICAgICAgICAgZmllbGRfMSA9IGZpZWxkXzIgPSBmaWVsZF8zID0gZmllbGRfNCA9IGpmaWVsZHMgPSBudWxsXG4gICAgICAgICAgc3dpdGNoIHRydWVcbiAgICAgICAgICAgIHdoZW4gL15cXHMqJC92LnRlc3QgbGluZVxuICAgICAgICAgICAgICBsY29kZSA9ICdCJ1xuICAgICAgICAgICAgd2hlbiAvXlxccyojL3YudGVzdCBsaW5lXG4gICAgICAgICAgICAgIGxjb2RlID0gJ0MnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGxjb2RlID0gJ0QnXG4gICAgICAgICAgICAgIFsgZmllbGRfMSwgZmllbGRfMiwgZmllbGRfMywgZmllbGRfNCwgXSA9IGpmaWVsZHMgPSBsaW5lLnNwbGl0ICdcXHQnXG4gICAgICAgICAgICAgIGpmaWVsZHMgICA9IEpTT04uc3RyaW5naWZ5IGpmaWVsZHNcbiAgICAgICAgICAgICAgZmllbGRfMSAgPz0gbnVsbFxuICAgICAgICAgICAgICBmaWVsZF8yICA/PSBudWxsXG4gICAgICAgICAgICAgIGZpZWxkXzMgID89IG51bGxcbiAgICAgICAgICAgICAgZmllbGRfNCAgPz0gbnVsbFxuICAgICAgICAgIHlpZWxkIHsgbGluZV9uciwgbGNvZGUsIGxpbmUsIGpmaWVsZHMsIGZpZWxkXzEsIGZpZWxkXzIsIGZpZWxkXzMsIGZpZWxkXzQsIH1cbiAgICAgICAgO251bGxcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgZ2V0X3RyaXBsZXM6XG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ3Jvd2lkX2luJywgJ2Rza2V5JywgJ2ZpZWxkXzEnLCAnZmllbGRfMicsICdmaWVsZF8zJywgJ2ZpZWxkXzQnLCBdXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ3Jvd2lkX291dCcsICdyZWYnLCAncycsICd2JywgJ28nLCBdXG4gICAgICByb3dzOiAoIHJvd2lkX2luLCBkc2tleSwgZmllbGRfMSwgZmllbGRfMiwgZmllbGRfMywgZmllbGRfNCApIC0+XG4gICAgICAgIHlpZWxkIGZyb20gQGdldF90cmlwbGVzIHJvd2lkX2luLCBkc2tleSwgZmllbGRfMSwgZmllbGRfMiwgZmllbGRfMywgZmllbGRfNFxuICAgICAgICA7bnVsbFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBkaXNhc3NlbWJsZV9oYW5nZXVsOlxuICAgICAgcGFyYW1ldGVyczogICBbICdoYW5nJywgXVxuICAgICAgY29sdW1uczogICAgICBbICdpbml0aWFsJywgJ21lZGlhbCcsICdmaW5hbCcsIF1cbiAgICAgIHJvd3M6ICggaGFuZyApIC0+XG4gICAgICAgIGphbW9zID0gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuX1RNUF9oYW5nZXVsLmRpc2Fzc2VtYmxlIGhhbmcsIHsgZmxhdHRlbjogZmFsc2UsIH1cbiAgICAgICAgZm9yIHsgZmlyc3Q6IGluaXRpYWwsIHZvd2VsOiBtZWRpYWwsIGxhc3Q6IGZpbmFsLCB9IGluIGphbW9zXG4gICAgICAgICAgeWllbGQgeyBpbml0aWFsLCBtZWRpYWwsIGZpbmFsLCB9XG4gICAgICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBnZXRfdHJpcGxlczogKCByb3dpZF9pbiwgZHNrZXksIGZpZWxkXzEsIGZpZWxkXzIsIGZpZWxkXzMsIGZpZWxkXzQgKSAtPlxuICAgIHJlZiAgICAgICAgICAgPSByb3dpZF9pblxuICAgIHMgICAgICAgICAgICAgPSBmaWVsZF8yXG4gICAgdiAgICAgICAgICAgICA9IG51bGxcbiAgICBvICAgICAgICAgICAgID0gbnVsbFxuICAgIGVudHJ5ICAgICAgICAgPSBmaWVsZF8zXG4gICAgIyB4OmtvLUhhbmcrTGF0bjppbml0aWFsXG4gICAgIyB4OmtvLUhhbmcrTGF0bjptZWRpYWxcbiAgICAjIHg6a28tSGFuZytMYXRuOmZpbmFsXG4gICAgIyByZWFkaW5nOnpoLUxhdG4tcGlueWluXG4gICAgIyByZWFkaW5nOmphLXgtS2FuXG4gICAgIyByZWFkaW5nOmphLXgtSGlyXG4gICAgIyByZWFkaW5nOmphLXgtS2F0XG4gICAgIyByZWFkaW5nOmphLXgtTGF0blxuICAgICMgcmVhZGluZzprby1IYW5nXG4gICAgIyByZWFkaW5nOmtvLUxhdG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHN3aXRjaCB0cnVlXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB3aGVuICggZHNrZXkgaXMgJ2RpY3Q6eDprby1IYW5nK0xhdG4nICkgIyBhbmQgKCBlbnRyeS5zdGFydHNXaXRoICdweTonIClcbiAgICAgICAgcm9sZSAgICAgID0gZmllbGRfMVxuICAgICAgICB2ICAgICAgICAgPSBcIng6a28tSGFuZytMYXRuOiN7cm9sZX1cIlxuICAgICAgICByZWFkaW5ncyAgPSBbIGZpZWxkXzMsIF1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHdoZW4gKCBkc2tleSBpcyAnZGljdDptZWFuaW5ncycgKSBhbmQgKCBlbnRyeS5zdGFydHNXaXRoICdweTonIClcbiAgICAgICAgdiAgICAgICAgID0gJ2M6cmVhZGluZzp6aC1MYXRuLXBpbnlpbidcbiAgICAgICAgcmVhZGluZ3MgID0gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9hdG9uYWxfemhfcmVhZGluZ3MgZW50cnlcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHdoZW4gKCBkc2tleSBpcyAnZGljdDptZWFuaW5ncycgKSBhbmQgKCBlbnRyeS5zdGFydHNXaXRoICdrYTonIClcbiAgICAgICAgdiAgICAgICAgID0gJ2M6cmVhZGluZzpqYS14LUthdCdcbiAgICAgICAgcmVhZGluZ3MgID0gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9qYV9yZWFkaW5ncyBlbnRyeVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgd2hlbiAoIGRza2V5IGlzICdkaWN0Om1lYW5pbmdzJyApIGFuZCAoIGVudHJ5LnN0YXJ0c1dpdGggJ2hpOicgKVxuICAgICAgICB2ICAgICAgICAgPSAnYzpyZWFkaW5nOmphLXgtSGlyJ1xuICAgICAgICByZWFkaW5ncyAgPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5leHRyYWN0X2phX3JlYWRpbmdzIGVudHJ5XG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB3aGVuICggZHNrZXkgaXMgJ2RpY3Q6bWVhbmluZ3MnICkgYW5kICggZW50cnkuc3RhcnRzV2l0aCAnaGc6JyApXG4gICAgICAgIHYgICAgICAgICA9ICdjOnJlYWRpbmc6a28tSGFuZydcbiAgICAgICAgcmVhZGluZ3MgID0gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9oZ19yZWFkaW5ncyBlbnRyeVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIHY/XG4gICAgICBmb3IgcmVhZGluZyBpbiByZWFkaW5nc1xuICAgICAgICBAX1RNUF9zdGF0ZS50cmlwbGVfY291bnQrK1xuICAgICAgICByb3dpZF9vdXQgPSBcInQ6bXI6M3BsOlI9I3tAX1RNUF9zdGF0ZS50cmlwbGVfY291bnR9XCJcbiAgICAgICAgbyAgICAgICAgID0gcmVhZGluZ1xuICAgICAgICB5aWVsZCB7IHJvd2lkX291dCwgcmVmLCBzLCB2LCBvLCB9XG4gICAgICAgIEBfVE1QX3N0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcmV0dXJuIG51bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIExhbmd1YWdlX3NlcnZpY2VzXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX1RNUF9oYW5nZXVsID0gcmVxdWlyZSAnaGFuZ3VsLWRpc2Fzc2VtYmxlJ1xuICAgIDt1bmRlZmluZWRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG5vcm1hbGl6ZV90ZXh0OiAoIHRleHQsIGZvcm0gPSAnTkZDJyApIC0+IHRleHQubm9ybWFsaXplIGZvcm1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHJlbW92ZV9waW55aW5fZGlhY3JpdGljczogKCB0ZXh0ICkgLT4gKCB0ZXh0Lm5vcm1hbGl6ZSAnTkZLRCcgKS5yZXBsYWNlIC9cXFB7TH0vZ3YsICcnXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBleHRyYWN0X2F0b25hbF96aF9yZWFkaW5nczogKCBlbnRyeSApIC0+XG4gICAgIyBweTp6aMO5LCB6aGUsIHpoxIFvLCB6aMOhbywgemjHlCwgesSrXG4gICAgUiA9IGVudHJ5XG4gICAgUiA9IFIucmVwbGFjZSAvXnB5Oi92LCAnJ1xuICAgIFIgPSBSLnNwbGl0IC8sXFxzKi92XG4gICAgUiA9ICggKCBAcmVtb3ZlX3Bpbnlpbl9kaWFjcml0aWNzIHpoX3JlYWRpbmcgKSBmb3IgemhfcmVhZGluZyBpbiBSIClcbiAgICBSID0gbmV3IFNldCBSXG4gICAgUi5kZWxldGUgJ251bGwnXG4gICAgUi5kZWxldGUgJ0BudWxsJ1xuICAgIHJldHVybiBbIFIuLi4sIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGV4dHJhY3RfamFfcmVhZGluZ3M6ICggZW50cnkgKSAtPlxuICAgICMg56m6ICAgICAgaGk644Gd44KJLCDjgYLCtyjjgY9844GNfOOBkeOCiyksIOOBi+OCiSwg44GZwrco44GPfOOBi+OBmSksIOOCgOOBqsK344GX44GEXG4gICAgUiA9IGVudHJ5XG4gICAgUiA9IFIucmVwbGFjZSAvXig/OmhpfGthKTovdiwgJydcbiAgICBSID0gUi5yZXBsYWNlIC9cXHMrL2d2LCAnJ1xuICAgIFIgPSBSLnNwbGl0IC8sXFxzKi92XG4gICAgIyMjIE5PVEUgcmVtb3ZlIG5vLXJlYWRpbmdzIG1hcmtlciBgQG51bGxgIGFuZCBjb250ZXh0dWFsIHJlYWRpbmdzIGxpa2UgLeODjeODsyBmb3Ig57iBLCAt44OO44KmIGZvciDnjosgIyMjXG4gICAgUiA9ICggcmVhZGluZyBmb3IgcmVhZGluZyBpbiBSIHdoZW4gbm90IHJlYWRpbmcuc3RhcnRzV2l0aCAnLScgKVxuICAgIFIgPSBuZXcgU2V0IFJcbiAgICBSLmRlbGV0ZSAnbnVsbCdcbiAgICBSLmRlbGV0ZSAnQG51bGwnXG4gICAgcmV0dXJuIFsgUi4uLiwgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZXh0cmFjdF9oZ19yZWFkaW5nczogKCBlbnRyeSApIC0+XG4gICAgIyDnqbogICAgICBoaTrjgZ3jgoksIOOBgsK3KOOBj3zjgY1844GR44KLKSwg44GL44KJLCDjgZnCtyjjgY9844GL44GZKSwg44KA44GqwrfjgZfjgYRcbiAgICBSID0gZW50cnlcbiAgICBSID0gUi5yZXBsYWNlIC9eKD86aGcpOi92LCAnJ1xuICAgIFIgPSBSLnJlcGxhY2UgL1xccysvZ3YsICcnXG4gICAgUiA9IFIuc3BsaXQgLyxcXHMqL3ZcbiAgICBSID0gbmV3IFNldCBSXG4gICAgUi5kZWxldGUgJ251bGwnXG4gICAgUi5kZWxldGUgJ0BudWxsJ1xuICAgIGhhbmdldWwgPSBbIFIuLi4sIF0uam9pbiAnJ1xuICAgICMgZGVidWcgJ86panpyc2RiX19fNycsIEBfVE1QX2hhbmdldWwuZGlzYXNzZW1ibGUgaGFuZ2V1bCwgeyBmbGF0dGVuOiBmYWxzZSwgfVxuICAgIHJldHVybiBbIFIuLi4sIF1cblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjIyBUQUlOVCBnb2VzIGludG8gY29uc3RydWN0b3Igb2YgSnpyIGNsYXNzICMjI1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEppenVyYVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQHBhdGhzICAgICAgICAgICAgICA9IGdldF9wYXRocygpXG4gICAgQGxhbmd1YWdlX3NlcnZpY2VzICA9IG5ldyBMYW5ndWFnZV9zZXJ2aWNlcygpXG4gICAgQGRiYSAgICAgICAgICAgICAgICA9IG5ldyBKenJfZGJfYWRhcHRlciBAcGF0aHMuZGIsIHsgaG9zdDogQCwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaWYgZmFsc2UgIyBqenIuZGJhLmlzX2ZyZXNoXG4gICAgIyMjIFRBSU5UIG1vdmUgdG8gSnpyX2RiX2FkYXB0ZXIgdG9nZXRoZXIgd2l0aCB0cnkvY2F0Y2ggIyMjXG4gICAgICB0cnlcbiAgICAgICAgQHBvcHVsYXRlX21lYW5pbmdfbWlycm9yX3RyaXBsZXMoKVxuICAgICAgY2F0Y2ggY2F1c2VcbiAgICAgICAgZmllbGRzX3JwciA9IHJwciBAZGJhLl9UTVBfc3RhdGUubW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93XG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX19fOCB3aGVuIHRyeWluZyB0byBpbnNlcnQgdGhpcyByb3c6ICN7ZmllbGRzX3Jwcn0sIGFuIGVycm9yIHdhcyB0aHJvd246ICN7Y2F1c2UubWVzc2FnZX1cIiwgXFxcbiAgICAgICAgICB7IGNhdXNlLCB9XG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgIyMjIFRBSU5UIG1vdmUgdG8gSnpyX2RiX2FkYXB0ZXIgdG9nZXRoZXIgd2l0aCB0cnkvY2F0Y2ggIyMjXG4gICAgICB0cnlcbiAgICAgICAgQHBvcHVsYXRlX2hhbmdldWxfc3lsbGFibGVzKClcbiAgICAgIGNhdGNoIGNhdXNlXG4gICAgICAgIGZpZWxkc19ycHIgPSBycHIgQGRiYS5fVE1QX3N0YXRlLm1vc3RfcmVjZW50X2luc2VydGVkX3Jvd1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fXzkgd2hlbiB0cnlpbmcgdG8gaW5zZXJ0IHRoaXMgcm93OiAje2ZpZWxkc19ycHJ9LCBhbiBlcnJvciB3YXMgdGhyb3duOiAje2NhdXNlLm1lc3NhZ2V9XCIsIFxcXG4gICAgICAgICAgeyBjYXVzZSwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZWxzZVxuICAgICAgd2FybiBcIs6panpyc2RiX18xMyBza2lwcGVkXCJcbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBwb3B1bGF0ZV9tZWFuaW5nX21pcnJvcl90cmlwbGVzOiAtPlxuICAgIHsgdG90YWxfcm93X2NvdW50LCB9ID0gKCBAZGJhLnByZXBhcmUgU1FMXCJcIlwiXG4gICAgICBzZWxlY3RcbiAgICAgICAgICBjb3VudCgqKSBhcyB0b3RhbF9yb3dfY291bnRcbiAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzXG4gICAgICAgIHdoZXJlIHRydWVcbiAgICAgICAgICBhbmQgKCBkc2tleSBpcyAnZGljdDptZWFuaW5ncycgKVxuICAgICAgICAgIGFuZCAoIGZpZWxkXzEgaXMgbm90IG51bGwgKVxuICAgICAgICAgIGFuZCAoIG5vdCBmaWVsZF8xIHJlZ2V4cCAnXkBnbHlwaHMnICk7XCJcIlwiICkuZ2V0KClcbiAgICB0b3RhbCA9IHRvdGFsX3Jvd19jb3VudCAqIDIgIyMjIE5PVEUgZXN0aW1hdGUgIyMjXG4gICAgIyB7IHRvdGFsX3Jvd19jb3VudCwgdG90YWwsIH0gPSB7IHRvdGFsX3Jvd19jb3VudDogNDAwODYsIHRvdGFsOiA4MDE3MiB9ICMgISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISFcbiAgICBoZWxwICfOqWp6cnNkYl9fMTAnLCB7IHRvdGFsX3Jvd19jb3VudCwgdG90YWwsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgYnJhbmQgPSAnQlJBTkQnXG4gICAgIyB0aW1laXQgeyB0b3RhbCwgYnJhbmQsIH0sIHBvcHVsYXRlX3RyaXBsZXNfMV9jb25uZWN0aW9uID0gKHsgcHJvZ3Jlc3MsIH0pID0+XG4gICAgIyBAX1RNUF9zdGF0ZS50aW1laXRfcHJvZ3Jlc3MgPSBwcm9ncmVzc1xuICAgIEBkYmEuc3RhdGVtZW50cy5wb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXMucnVuKClcbiAgICAjIEBfVE1QX3N0YXRlLnRpbWVpdF9wcm9ncmVzcyA9IG51bGxcbiAgICAjIDtudWxsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcG9wdWxhdGVfaGFuZ2V1bF9zeWxsYWJsZXM6IC0+XG4gICAgQGRiYS5zdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9sYW5nX2hhbmdldWxfc3lsbGFibGVzLnJ1bigpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7bnVsbFxuXG4gICMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIF9zaG93X2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzOiAtPlxuICAjICAgZmF1bHR5X3Jvd3MgPSAoIEBkYmEucHJlcGFyZSBTUUxcInNlbGVjdCAqIGZyb20gX2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzO1wiICkuYWxsKClcbiAgIyAgIHdhcm4gJ86panpyc2RiX18xMScsIHJldmVyc2UgZmF1bHR5X3Jvd3NcbiAgIyAgICMgZm9yIHJvdyBmcm9tXG4gICMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNob3dfY291bnRzOiAtPlxuICAgIGNvdW50cyA9ICggQGRiYS5wcmVwYXJlIFNRTFwic2VsZWN0IHYsIGNvdW50KCopIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgZ3JvdXAgYnkgdjtcIiApLmFsbCgpXG4gICAgY29uc29sZS50YWJsZSBjb3VudHNcbiAgICBjb3VudHMgPSAoIEBkYmEucHJlcGFyZSBTUUxcInNlbGVjdCB2LCBjb3VudCgqKSBmcm9tIGp6cl90cmlwbGVzIGdyb3VwIGJ5IHY7XCIgKS5hbGwoKVxuICAgIGNvbnNvbGUudGFibGUgY291bnRzXG4gICAgY291bnRzID0gKCBAZGJhLnByZXBhcmUgU1FMXCJcIlwiXG4gICAgICBzZWxlY3QgZHNrZXksIGNvdW50KCopIGFzIGNvdW50IGZyb20ganpyX21pcnJvcl9saW5lcyBncm91cCBieSBkc2tleSB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCAnKicsICAgY291bnQoKikgYXMgY291bnQgZnJvbSBqenJfbWlycm9yX2xpbmVzXG4gICAgICBvcmRlciBieSBjb3VudDtcIlwiXCIgKS5hbGwoKVxuICAgIGNvdW50cyA9IE9iamVjdC5mcm9tRW50cmllcyAoIFsgZHNrZXksIHsgY291bnQsIH0sIF0gZm9yIHsgZHNrZXksIGNvdW50LCB9IGluIGNvdW50cyApXG4gICAgY29uc29sZS50YWJsZSBjb3VudHNcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzaG93X2p6cl9tZXRhX2ZhdWx0czogLT5cbiAgICBmYXVsdHlfcm93cyA9ICggQGRiYS5wcmVwYXJlIFNRTFwic2VsZWN0ICogZnJvbSBqenJfbWV0YV9mYXVsdHM7XCIgKS5hbGwoKVxuICAgICMgd2FybiAnzqlqenJzZGJfXzEyJyxcbiAgICBjb25zb2xlLnRhYmxlIGZhdWx0eV9yb3dzXG4gICAgIyBmb3Igcm93IGZyb21cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDtudWxsXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZGVtbyA9IC0+XG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMganpyLl9zaG93X2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzKClcbiAganpyLnNob3dfY291bnRzKClcbiAganpyLnNob3dfanpyX21ldGFfZmF1bHRzKClcbiAgIyBjOnJlYWRpbmc6amEteC1IaXJcbiAgIyBjOnJlYWRpbmc6amEteC1LYXRcbiAgc2VlbiA9IG5ldyBTZXQoKVxuICBmb3IgeyByZWFkaW5nLCB9IGZyb20ganpyLmRiYS53YWxrIFNRTFwic2VsZWN0IGRpc3RpbmN0KCBvICkgYXMgcmVhZGluZyBmcm9tIGp6cl90cmlwbGVzIHdoZXJlIHYgPSAnYzpyZWFkaW5nOmphLXgtS2F0JyBvcmRlciBieSBvO1wiXG4gICAgZm9yIHBhcnQgaW4gKCByZWFkaW5nLnNwbGl0IC8oLuODvHwu44OjfC7jg6V8LuODp3zjg4MufC4pL3YgKSB3aGVuIHBhcnQgaXNudCAnJ1xuICAgICAgY29udGludWUgaWYgc2Vlbi5oYXMgcGFydFxuICAgICAgc2Vlbi5hZGQgcGFydFxuICAgICAgZWNobyBwYXJ0XG4gIGZvciB7IHJlYWRpbmcsIH0gZnJvbSBqenIuZGJhLndhbGsgU1FMXCJzZWxlY3QgZGlzdGluY3QoIG8gKSBhcyByZWFkaW5nIGZyb20ganpyX3RyaXBsZXMgd2hlcmUgdiA9ICdjOnJlYWRpbmc6amEteC1IaXInIG9yZGVyIGJ5IG87XCJcbiAgICBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLygu44O8fC7jgoN8LuOChXwu44KHfOOBoy58LikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICAgIyBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLyguKS92ICkgd2hlbiBwYXJ0IGlzbnQgJydcbiAgICAgIGNvbnRpbnVlIGlmIHNlZW4uaGFzIHBhcnRcbiAgICAgIHNlZW4uYWRkIHBhcnRcbiAgICAgIGVjaG8gcGFydFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIDtudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZGVtb19yZWFkX2R1bXAgPSAtPlxuICB7IEJlbmNobWFya2VyLCAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfYmVuY2htYXJraW5nKClcbiAgIyB7IG5hbWVpdCwgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfbmFtZWl0KClcbiAgYmVuY2htYXJrZXIgPSBuZXcgQmVuY2htYXJrZXIoKVxuICB0aW1laXQgPSAoIFAuLi4gKSAtPiBiZW5jaG1hcmtlci50aW1laXQgUC4uLlxuICB7IFNlZ21lbnRlcixcbiAgICBVbmR1bXBlciwgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2NvYXJzZV9zcWxpdGVfc3RhdGVtZW50X3NlZ21lbnRlcigpXG4gIHsgd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucywgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9mYXN0X2xpbmVyZWFkZXIoKVxuICB7IHdjLCAgICAgICAgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfd2MoKVxuICBwYXRoICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5yZXNvbHZlIF9fZGlybmFtZSwgJy4uL2p6ci5kdW1wLnNxbCdcbiAgbGluZV9jb3VudCAgICAgICAgICAgICAgICAgICAgICA9ICggd2MgcGF0aCApLmxpbmVzICMgMTAyXzcyN1xuICAjIGxpbmVfY291bnQgICAgICAgICAgICAgICAgICAgICAgPSAgICAxMDJfNzI3XG4gIGJ5dGVfY291bnQgICAgICAgICAgICAgICAgICAgICAgPSAoIEZTLnN0YXRTeW5jIHBhdGggKS5zaXplXG4gIGRlYnVnICfOqWp6cnNkYl9fMTcnLCB7IGJ5dGVfY291bnQsIGxpbmVfY291bnQsIH1cbiAganpyID0gbmV3IEppenVyYSgpXG4gIGp6ci5kYmEudGVhcmRvd24geyB0ZXN0OiAnKicsIH1cbiAgIyBkZWJ1ZyAnzqlqenJzZGJfXzE0Jywgcm93IGZvciByb3cgZnJvbSBqenIuZGJhLndhbGsgU1FMXCJzZWxlY3QgbmFtZSwgdHlwZSBmcm9tIHNxbGl0ZV9zY2hlbWE7XCJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpZiB0cnVlXG4gICAgdW5kdW1wZXIgID0gbmV3IFVuZHVtcGVyIHsgZGI6IGp6ci5kYmEsIG1vZGU6ICdmYXN0JywgfVxuICAgIHRpbWVpdCB7IHRvdGFsOiBsaW5lX2NvdW50LCBicmFuZDogJ2RlbW9fcmVhZF9kdW1wJywgfSwgZGVtb19yZWFkX2R1bXBfd2l0aF91bmR1bXBlciA9ICh7IHByb2dyZXNzLCB9KSAtPlxuICAgICAgZm9yIHsgbGluZSwgfSBmcm9tIHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgcGF0aFxuICAgICAgICAjIGRlYnVnICfOqWp6cnNkYl9fMTUnLCBycHIgbGluZVxuICAgICAgICBwcm9ncmVzcyB7IGRlbHRhOiAxLCB9XG4gICAgICAgICMgcHJvZ3Jlc3MgeyBkZWx0YTogbGluZS5sZW5ndGgsIH1cbiAgICAgICAgZm9yIHN0YXRlbWVudCBmcm9tIHVuZHVtcGVyLnNjYW4gbGluZVxuICAgICAgICAgIG51bGxcbiAgICAgICAgICAjIGVjaG8gXCJMaW5lICN7Y291bnR9OlwiLCBzdGF0ZW1lbnRcbiAgICAgICAgICAjIGhlbHAgJ86panpyc2RiX18xNicsIFwicmVhZCAje2NvdW50fSBzdGF0ZW1lbnRzXCIgaWYgKCBjb3VudCAlIDEwMDAgKSBpcyAwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZWxzZVxuICAgIHNlZ21lbnRlciAgPSBuZXcgU2VnbWVudGVyKClcbiAgICB0aW1laXQgeyB0b3RhbDogbGluZV9jb3VudCwgYnJhbmQ6ICdkZW1vX3JlYWRfZHVtcCcsIH0sIGRlbW9fcmVhZF9kdW1wX3dpdGhfc2VnbWVudGVyID0gKHsgcHJvZ3Jlc3MsIH0pIC0+XG4gICAgICBmb3IgeyBsaW5lLCB9IGZyb20gd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBwYXRoXG4gICAgICAgICMgZGVidWcgJ86panpyc2RiX18xNScsIHJwciBsaW5lXG4gICAgICAgIHByb2dyZXNzKClcbiAgICAgICAgZm9yIHN0YXRlbWVudCBmcm9tIHNlZ21lbnRlci5zY2FuIGxpbmVcbiAgICAgICAgICBudWxsXG4gICAgICAgICAgIyBlY2hvIFwiTGluZSAje2NvdW50fTpcIiwgc3RhdGVtZW50XG4gICAgICAgICAgIyBoZWxwICfOqWp6cnNkYl9fMTYnLCBcInJlYWQgI3tjb3VudH0gc3RhdGVtZW50c1wiIGlmICggY291bnQgJSAxMDAwICkgaXMgMFxuICAgIGRlYnVnICfOqWp6cnNkYl9fMTcnLCByb3cgZm9yIHJvdyBmcm9tIGp6ci5kYmEud2FsayBTUUxcInNlbGVjdCBuYW1lLCB0eXBlIGZyb20gc3FsaXRlX3NjaGVtYTtcIlxuICAgIDtudWxsXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAganpyLnNob3dfY291bnRzKClcbiAganpyLnNob3dfanpyX21ldGFfZmF1bHRzKClcbiAgO251bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmlmIG1vZHVsZSBpcyByZXF1aXJlLm1haW4gdGhlbiBkbyA9PlxuICAjIGRlbW8oKVxuICBkZW1vX3JlYWRfZHVtcCgpXG4gIDtudWxsXG5cbiJdfQ==
