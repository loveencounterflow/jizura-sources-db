(function() {
  'use strict';
  var Async_jetstream, Benchmarker, Bsql3, Dbric, Dbric_std, FS, GUY, Jetstream, Jizura, Jzr_db_adapter, Language_services, PATH, SFMODULES, SQL, alert, as_bool, benchmarker, blue, bold, debug, demo, demo_read_dump, demo_source_identifiers, echo, freeze, from_bool, get_paths, gold, green, grey, help, info, inspect, lets, lime, log, plain, praise, red, reverse, rpr, set_getter, timeit, urge, walk_lines_with_positions, warn, whisper, white;

  //===========================================================================================================
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('jizura-sources-db'));

  ({rpr, inspect, echo, white, green, blue, lime, gold, grey, red, bold, reverse, log} = GUY.trm);

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
  ({set_getter} = SFMODULES.require_managed_property_tools());

  //===========================================================================================================
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
    var R, kanjium, rutopio;
    R = {};
    R.base = PATH.resolve(__dirname, '..');
    R.jzr = PATH.resolve(R.base, '..');
    R.db = PATH.join(R.base, 'jzr.db');
    // R.db                                = '/dev/shm/jzr.db'
    R.jzrds = PATH.join(R.base, 'jzrds');
    R.jzrnewds = PATH.join(R.jzr, 'jizura-new-datasources');
    R.raw_github = PATH.join(R.jzrnewds, 'bvfs/origin/https/raw.githubusercontent.com');
    kanjium = PATH.join(R.raw_github, 'mifunetoshiro/kanjium/8a0cdaa16d64a281a2048de2eee2ec5e3a440fa6');
    rutopio = PATH.join(R.raw_github, 'rutopio/Korean-Name-Hanja-Charset/12df1ba1b4dfaa095813e4ddfba424e816f94c53');
    R['dict:meanings'] = PATH.join(R.jzrds, 'meaning/meanings.txt');
    R['dict:ucd:v14.0:uhdidx'] = PATH.join(R.jzrds, 'unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt');
    R['dict:x:ko-Hang+Latn'] = PATH.join(R.jzrnewds, 'hangeul-transcriptions.tsv');
    R['dict:x:ja-Kan+Latn'] = PATH.join(R.jzrnewds, 'kana-transcriptions.tsv');
    R['dict:bcp47'] = PATH.join(R.jzrnewds, 'BCP47-language-scripts-regions.tsv');
    R['dict:ja:kanjium'] = PATH.join(kanjium, 'data/source_files/kanjidict.txt');
    R['dict:ja:kanjium:aux'] = PATH.join(kanjium, 'data/source_files/0_README.txt');
    R['dict:ko:V=data-gov.csv'] = PATH.join(rutopio, 'data-gov.csv');
    R['dict:ko:V=data-gov.json'] = PATH.join(rutopio, 'data-gov.json');
    R['dict:ko:V=data-naver.csv'] = PATH.join(rutopio, 'data-naver.csv');
    R['dict:ko:V=data-naver.json'] = PATH.join(rutopio, 'data-naver.json');
    R['dict:ko:V=README.md'] = PATH.join(rutopio, 'README.md');
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
        this.state = {
          triple_count: 0,
          most_recent_inserted_row: null
        };
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
        }
        //.......................................................................................................
        void 0;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_mirror_lcodes() {
        debug('Ωjzrsdb___6', '_on_open_populate_jzr_mirror_lcodes');
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
        var i, len, row, rows;
        /* NOTE
           in verbs, initial component indicates type of subject:
             `c:` is for subjects that are CJK characters
             `x:` is used for unclassified subjects (possibly to be refined in the future)
           */
        debug('Ωjzrsdb___7', '_on_open_populate_jzr_mirror_verbs');
        rows = [
          {
            rowid: 't:mr:vb:V=x:ko-Hang+Latn:initial',
            rank: 2,
            s: "NN",
            v: 'x:ko-Hang+Latn:initial',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=x:ko-Hang+Latn:medial',
            rank: 2,
            s: "NN",
            v: 'x:ko-Hang+Latn:medial',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=x:ko-Hang+Latn:final',
            rank: 2,
            s: "NN",
            v: 'x:ko-Hang+Latn:final',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:zh-Latn-pinyin',
            rank: 1,
            s: "NN",
            v: 'c:reading:zh-Latn-pinyin',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ja-x-Kan',
            rank: 1,
            s: "NN",
            v: 'c:reading:ja-x-Kan',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ja-x-Hir',
            rank: 1,
            s: "NN",
            v: 'c:reading:ja-x-Hir',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ja-x-Kat',
            rank: 1,
            s: "NN",
            v: 'c:reading:ja-x-Kat',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ja-x-Latn',
            rank: 1,
            s: "NN",
            v: 'c:reading:ja-x-Latn',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ja-x-Hir+Latn',
            rank: 1,
            s: "NN",
            v: 'c:reading:ja-x-Hir+Latn',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ja-x-Kat+Latn',
            rank: 1,
            s: "NN",
            v: 'c:reading:ja-x-Kat+Latn',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ko-Hang',
            rank: 1,
            s: "NN",
            v: 'c:reading:ko-Hang',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ko-Latn',
            rank: 1,
            s: "NN",
            v: 'c:reading:ko-Latn',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ko-Hang:initial',
            rank: 2,
            s: "NN",
            v: 'c:reading:ko-Hang:initial',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ko-Hang:medial',
            rank: 2,
            s: "NN",
            v: 'c:reading:ko-Hang:medial',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ko-Hang:final',
            rank: 2,
            s: "NN",
            v: 'c:reading:ko-Hang:final',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ko-Latn:initial',
            rank: 2,
            s: "NN",
            v: 'c:reading:ko-Latn:initial',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ko-Latn:medial',
            rank: 2,
            s: "NN",
            v: 'c:reading:ko-Latn:medial',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:reading:ko-Latn:final',
            rank: 2,
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
        debug('Ωjzrsdb___8', '_on_open_populate_jzr_datasources');
        paths = get_paths();
        // dskey = 'dict:ucd:v14.0:uhdidx';  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=2', dskey, path: paths[ dskey ], }
        dskey = 'dict:meanings';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=1',
          dskey,
          path: paths[dskey]
        });
        dskey = 'dict:x:ko-Hang+Latn';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=2',
          dskey,
          path: paths[dskey]
        });
        dskey = 'dict:x:ja-Kan+Latn';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=3',
          dskey,
          path: paths[dskey]
        });
        // dskey = 'dict:ja:kanjium';            @statements.insert_jzr_datasource.run { rowid: 't:ds:R=4', dskey, path: paths[ dskey ], }
        // dskey = 'dict:ja:kanjium:aux';        @statements.insert_jzr_datasource.run { rowid: 't:ds:R=5', dskey, path: paths[ dskey ], }
        // dskey = 'dict:ko:V=data-gov.csv';     @statements.insert_jzr_datasource.run { rowid: 't:ds:R=6', dskey, path: paths[ dskey ], }
        // dskey = 'dict:ko:V=data-gov.json';    @statements.insert_jzr_datasource.run { rowid: 't:ds:R=7', dskey, path: paths[ dskey ], }
        // dskey = 'dict:ko:V=data-naver.csv';   @statements.insert_jzr_datasource.run { rowid: 't:ds:R=8', dskey, path: paths[ dskey ], }
        // dskey = 'dict:ko:V=data-naver.json';  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=9', dskey, path: paths[ dskey ], }
        // dskey = 'dict:ko:V=README.md';        @statements.insert_jzr_datasource.run { rowid: 't:ds:R=10', dskey, path: paths[ dskey ], }
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
        debug('Ωjzrsdb___9', '_on_open_populate_jzr_mirror_lines');
        this.statements.populate_jzr_mirror_lines.run();
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_mirror_triples_for_meanings() {}

      // ;null

        //---------------------------------------------------------------------------------------------------------
      trigger_on_before_insert(name, ...fields) {
        // debug 'Ωjzrsdb__10', { name, fields, }
        this.state.most_recent_inserted_row = {name, fields};
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      * triplets_from_dict_x_ko_Hang_Latn(rowid_in, dskey, [role, s, o]) {
        var base, ref, v;
        ref = rowid_in;
        v = `x:ko-Hang+Latn:${role}`;
        if (o == null) {
          o = '';
        }
        yield ({
          rowid_out: this.next_triple_rowid,
          ref,
          s,
          v,
          o
        });
        if (typeof (base = this.state).timeit_progress === "function") {
          base.timeit_progress();
        }
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      * triplets_from_c_reading_zh_Latn_pinyin(rowid_in, dskey, [_, s, entry]) {
        var base, reading, ref, v;
        ref = rowid_in;
        v = 'c:reading:zh-Latn-pinyin';
        for (reading of this.host.language_services.extract_atonal_zh_readings(entry)) {
          yield ({
            rowid_out: this.next_triple_rowid,
            ref,
            s,
            v,
            o: reading
          });
        }
        if (typeof (base = this.state).timeit_progress === "function") {
          base.timeit_progress();
        }
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      * triplets_from_c_reading_ja_x_Kan(rowid_in, dskey, [_, s, entry]) {
        var base, reading, ref, transcription, v_Latn, v_x_Kan;
        ref = rowid_in;
        if (entry.startsWith('ka:')) {
          v_x_Kan = 'c:reading:ja-x-Kat';
          v_Latn = 'c:reading:ja-x-Kat+Latn';
        } else {
          v_x_Kan = 'c:reading:ja-x-Hir';
          v_Latn = 'c:reading:ja-x-Hir+Latn';
        }
        for (reading of this.host.language_services.extract_ja_readings(entry)) {
          yield ({
            rowid_out: this.next_triple_rowid,
            ref,
            s,
            v: v_x_Kan,
            o: reading
          });
          // for transcription from @host.language_services.romanize_ja_kana reading
          //   yield { rowid_out: @next_triple_rowid, ref, s, v: v_Latn, o: transcription, }
          transcription = this.host.language_services.romanize_ja_kana(reading);
          yield ({
            rowid_out: this.next_triple_rowid,
            ref,
            s,
            v: v_Latn,
            o: transcription
          });
        }
        if (typeof (base = this.state).timeit_progress === "function") {
          base.timeit_progress();
        }
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      * triplets_from_c_reading_ko_Hang(rowid_in, dskey, [_, s, entry]) {
        var base, reading, ref, v;
        ref = rowid_in;
        v = 'c:reading:ko-Hang';
        for (reading of this.host.language_services.extract_hg_readings(entry)) {
          yield ({
            rowid_out: this.next_triple_rowid,
            ref,
            s,
            v,
            o: reading
          });
        }
        if (typeof (base = this.state).timeit_progress === "function") {
          base.timeit_progress();
        }
        return null;
      }

    };

    //---------------------------------------------------------------------------------------------------------
    Jzr_db_adapter.db_class = Bsql3;

    Jzr_db_adapter.prefix = 'jzr';

    //---------------------------------------------------------------------------------------------------------
    set_getter(Jzr_db_adapter.prototype, 'next_triple_rowid', function() {
      return `t:mr:3pl:R=${++this.state.triple_count}`;
    });

    //=========================================================================================================
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
primary key ( rowid ),
check ( rowid regexp '^t:mr:ln:R=\\d+$'),
unique ( dskey, line_nr ),
foreign key ( lcode ) references jzr_mirror_lcodes ( lcode ) );`,
      //.......................................................................................................
      SQL`create table jzr_mirror_verbs (
  rowid     text    unique  not null,
  rank      integer         not null default 1,
  s         text            not null,
  v         text    unique  not null,
  o         text            not null,
primary key ( rowid ),
check ( rowid regexp '^t:mr:vb:V=[\\-:\\+\\p{L}]+$' ),
check ( rank > 0 ) );`,
      //.......................................................................................................
      SQL`create table jzr_mirror_triples_base (
  rowid     text    unique  not null,
  ref       text            not null,
  s         text            not null,
  v         text            not null,
  o         json            not null,
primary key ( rowid ),
check ( rowid regexp '^t:mr:3pl:R=\\d+$' ),
-- unique ( ref, s, v, o )
foreign key ( ref ) references jzr_mirror_lines ( rowid ),
foreign key ( v   ) references jzr_mirror_verbs ( v ) );`,
      //.......................................................................................................
      SQL`create trigger jzr_mirror_triples_register
before insert on jzr_mirror_triples_base
for each row begin
  select trigger_on_before_insert( 'jzr_mirror_triples_base',
    'rowid:', new.rowid, 'ref:', new.ref, 's:', new.s, 'v:', new.v, 'o:', new.o );
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
select null as rowid, null as ref, null as rank, null as s, null as v, null as o where false
-- -- ...................................................................................................
union all
select tb1.rowid, tb1.ref, vb1.rank, tb1.s, tb1.v, tb1.o from jzr_mirror_triples_base as tb1
join jzr_mirror_verbs as vb1 using ( v )
where vb1.v like 'c:%'
-- ...................................................................................................
union all
select tb2.rowid, tb2.ref, vb2.rank, tb2.s, kr.v, kr.o from jzr_mirror_triples_base as tb2
join jzr_lang_kr_readings_triples as kr on ( tb2.v = 'c:reading:ko-Hang' and tb2.o = kr.s )
join jzr_mirror_verbs as vb2 on ( kr.v = vb2.v )
-- ...................................................................................................
union all
select null, null, null, null, null, null where false
order by s, v, o
;`,
      //.......................................................................................................
      SQL`create view jzr_top_triples as
select * from jzr_triples
where rank = 1
order by s, v, o
;`,
      //-------------------------------------------------------------------------------------------------------
      SQL`create view jzr_cjk_agg_latn as
select distinct
    s,
    v,
    json_group_array( o ) over (
      partition by s, v
      order by o
      rows between unbounded preceding and unbounded following
      ) as os
  from jzr_top_triples
  where v in ( 'c:reading:zh-Latn-pinyin','c:reading:ja-x-Kat+Latn', 'c:reading:ko-Latn')
  order by s, v, os
;`,
      // #.......................................................................................................
      // SQL"""create view jzr_cjk_reading_equivalents as
      //   select distinct
      //       -- tr1.rowid as ref1,
      //       -- tr2.rowid as ref2,
      //       -- tr1.ref   as ref1,
      //       -- tr2.ref   as ref2,
      //       -- tr1.rank  as rank1,
      //       -- tr2.rank  as rank2,
      //       tr1.s     as s1,
      //       -- tr2.s     as s2,
      //       -- tr1.v     as v1,
      //       -- tr2.v     as v2,
      //       -- tr3.v     as v3,
      //       -- tr4.v     as v4,
      //       -- tr1.o     as o1,
      //       tr2.o     as o2,
      //       tr3.o     as o3,
      //       tr4.o     as o4
      //     from jzr_triples      as tr1
      //     left join jzr_triples as tr2 on ( tr1.s = tr2.s and tr2.v = 'c:reading:zh-Latn-pinyin' )
      //     left join jzr_triples as tr3 on ( tr1.s = tr3.s and tr3.v = 'c:reading:ja-x-Kat+Latn' )
      //     left join jzr_triples as tr4 on ( tr1.s = tr4.s and tr4.v = 'c:reading:ko-Latn' )
      //     -- left join jzr_triples as tr2 on ( 'c:reading:zh-Latn-pinyin','c:reading:ja-x-Kat+Latn', 'c:reading:ko-Latn')
      //     -- left join jzr_triples as tr2 on ( 'c:reading:zh-Latn-pinyin','c:reading:ja-x-Kat+Latn', 'c:reading:ko-Latn')
      //     where tr1.v in ( 'c:reading:zh-Latn-pinyin', 'c:reading:ja-x-Kat+Latn', 'c:reading:ko-Latn' )
      //     order by s1, o2, o3, o4
      //     ;"""

      // #.......................................................................................................
      // SQL"""create view jzr_cjk_reading_equivalents_2 as
      //   select distinct
      //       s1                              as s1,
      //       json_group_array( o2 ) over w2   as o2,
      //       json_group_array( o3 ) over w3   as o3,
      //       json_group_array( o4 ) over w4   as o4
      //     from jzr_cjk_reading_equivalents
      //     window
      //       w2 as ( partition by s1 order by o2 rows between unbounded preceding and unbounded following ),
      //       w3 as ( partition by s1 order by o3 rows between unbounded preceding and unbounded following ),
      //       w4 as ( partition by s1 order by o4 rows between unbounded preceding and unbounded following )
      //   ;"""

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
  -- on conflict ( dskey ) do update set path = excluded.path
  ;`,
      //.......................................................................................................
      insert_jzr_mirror_verb: SQL`insert into jzr_mirror_verbs ( rowid, rank, s, v, o ) values ( $rowid, $rank, $s, $v, $o )
  -- on conflict ( rowid ) do update set rank = excluded.rank, s = excluded.s, v = excluded.v, o = excluded.o
  ;`,
      //.......................................................................................................
      insert_jzr_mirror_lcode: SQL`insert into jzr_mirror_lcodes ( rowid, lcode, comment ) values ( $rowid, $lcode, $comment )
  -- on conflict ( rowid ) do update set lcode = excluded.lcode, comment = excluded.comment
  ;`,
      //.......................................................................................................
      insert_jzr_mirror_triple: SQL`insert into jzr_mirror_triples_base ( rowid, ref, s, v, o ) values ( $rowid, $ref, $s, $v, $o )
  -- on conflict ( ref, s, v, o ) do nothing
  ;`,
      //.......................................................................................................
      populate_jzr_mirror_lines: SQL`insert into jzr_mirror_lines ( rowid, dskey, line_nr, lcode, line, jfields )
select
  't:mr:ln:R=' || row_number() over ()          as rowid,
  -- ds.dskey || ':L=' || fl.line_nr   as rowid,
  ds.dskey                          as dskey,
  fl.line_nr                        as line_nr,
  fl.lcode                          as lcode,
  fl.line                           as line,
  fl.jfields                        as jfields
from jzr_datasources        as ds
join file_lines( ds.path )  as fl
where true
-- on conflict ( dskey, line_nr ) do update set line = excluded.line
;`,
      //.......................................................................................................
      populate_jzr_mirror_triples: SQL`insert into jzr_mirror_triples_base ( rowid, ref, s, v, o )
  select
      gt.rowid_out    as rowid,
      gt.ref          as ref,
      gt.s            as s,
      gt.v            as v,
      gt.o            as o
    from jzr_mirror_lines                               as ml
    join get_triples( ml.rowid, ml.dskey, ml.jfields )  as gt
    where true
      and ( ml.lcode = 'D' )
      -- and ( ml.dskey = 'dict:meanings' )
      and ( ml.jfields is not null )
      and ( ml.jfields->>'$[0]' not regexp '^@glyphs' )
      -- and ( ml.field_3 regexp '^(?:py|hi|ka):' )
  -- on conflict ( ref, s, v, o ) do nothing
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
    order by mt.o
  -- on conflict ( rowid         ) do nothing
  /* ### NOTE \`on conflict\` needed because we log all actually occurring readings of all characters */
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
        columns: ['line_nr', 'lcode', 'line', 'jfields'],
        parameters: ['path'],
        rows: function*(path) {
          var eol, jfields, lcode, line, line_nr, y;
          for (y of walk_lines_with_positions(path)) {
            ({
              lnr: line_nr,
              line,
              eol
            } = y);
            line = this.host.language_services.normalize_text(line);
            jfields = null;
            switch (true) {
              case /^\s*$/v.test(line):
                lcode = 'B';
                break;
              case /^\s*#/v.test(line):
                lcode = 'C';
                break;
              default:
                lcode = 'D';
                jfields = JSON.stringify(line.split('\t'));
            }
            yield ({line_nr, lcode, line, jfields});
          }
          return null;
        }
      },
      //-------------------------------------------------------------------------------------------------------
      get_triples: {
        parameters: ['rowid_in', 'dskey', 'jfields'],
        columns: ['rowid_out', 'ref', 's', 'v', 'o'],
        rows: function*(rowid_in, dskey, jfields) {
          var entry, fields;
          fields = JSON.parse(jfields);
          entry = fields[2];
          switch (dskey) {
            case 'dict:x:ko-Hang+Latn':
              yield* this.triplets_from_dict_x_ko_Hang_Latn(rowid_in, dskey, fields);
              break;
            case 'dict:meanings':
              switch (true) {
                case entry.startsWith('py:'):
                  yield* this.triplets_from_c_reading_zh_Latn_pinyin(rowid_in, dskey, fields);
                  break;
                case entry.startsWith('ka:'):
                  yield* this.triplets_from_c_reading_ja_x_Kan(rowid_in, dskey, fields);
                  break;
                case entry.startsWith('hi:'):
                  yield* this.triplets_from_c_reading_ja_x_Kan(rowid_in, dskey, fields);
                  break;
                case entry.startsWith('hg:'):
                  yield* this.triplets_from_c_reading_ko_Hang(rowid_in, dskey, fields);
              }
          }
          // yield from @get_triples rowid_in, dskey, jfields
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
      this._TMP_kana = require('wanakana');
      // { toHiragana,
      //   toKana,
      //   toKatakana
      //   toRomaji,
      //   tokenize,         } = require 'wanakana'
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
      // debug 'Ωjzrsdb__11', @_TMP_hangeul.disassemble hangeul, { flatten: false, }
      return [...R];
    }

    //---------------------------------------------------------------------------------------------------------
    romanize_ja_kana(entry) {
      var cfg;
      cfg = {};
      return this._TMP_kana.toRomaji(entry, cfg);
    }

  };

  // ### systematic name more like `..._ja_x_kan_latn()` ###
  // help 'Ωdjkr__12', toHiragana  'ラーメン',       { convertLongVowelMark: false, }
  // help 'Ωdjkr__13', toHiragana  'ラーメン',       { convertLongVowelMark: true, }
  // help 'Ωdjkr__14', toKana      'wanakana',   { customKanaMapping: { na: 'に', ka: 'Bana' }, }
  // help 'Ωdjkr__15', toKana      'wanakana',   { customKanaMapping: { waka: '(和歌)', wa: '(和2)', ka: '(歌2)', na: '(名)', ka: '(Bana)', naka: '(中)', }, }
  // help 'Ωdjkr__16', toRomaji    'つじぎり',     { customRomajiMapping: { じ: '(zi)', つ: '(tu)', り: '(li)', りょう: '(ryou)', りょ: '(ryo)' }, }

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
      if (this.dba.is_fresh) {
        try {
          /* TAINT move to Jzr_db_adapter together with try/catch */
          this.populate_meaning_mirror_triples();
        } catch (error1) {
          cause = error1;
          fields_rpr = rpr(this.dba.state.most_recent_inserted_row);
          throw new Error(`Ωjzrsdb__17 when trying to insert this row: ${fields_rpr}, an error was thrown: ${cause.message}`, {cause});
        }
        try {
          //.......................................................................................................
          /* TAINT move to Jzr_db_adapter together with try/catch */
          this.populate_hangeul_syllables();
        } catch (error1) {
          cause = error1;
          fields_rpr = rpr(this.dba.state.most_recent_inserted_row);
          throw new Error(`Ωjzrsdb__18 when trying to insert this row: ${fields_rpr}, an error was thrown: ${cause.message}`, {cause});
        }
      }
      //.......................................................................................................
      void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    populate_meaning_mirror_triples() {
      (() => {
        var total, total_row_count;
        ({total_row_count} = (this.dba.prepare(SQL`select
    count(*) as total_row_count
  from jzr_mirror_lines
  where true
    and ( dskey is 'dict:meanings' )
    and ( jfields is not null ) -- NOTE: necessary
    and ( not jfields->>'$[0]' regexp '^@glyphs' );`)).get());
        total = total_row_count * 2/* NOTE estimate */
        return help('Ωjzrsdb__19', {total_row_count, total}); // { total_row_count: 40086, total: 80172 }
      })();
      //.......................................................................................................
      this.dba.statements.populate_jzr_mirror_triples.run();
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
    //   warn 'Ωjzrsdb__20', reverse faulty_rows
    //   # for row from
    //   #.......................................................................................................
    //   ;null

      //---------------------------------------------------------------------------------------------------------
    show_counts() {
      (() => {
        var counts, query;
        query = SQL`select v, count(*) from jzr_mirror_triples_base group by v;`;
        echo(grey('Ωjzrsdb__21'), gold(reverse(bold(query))));
        counts = (this.dba.prepare(query)).all();
        return console.table(counts);
      })();
      (() => {        //.......................................................................................................
        var counts, query;
        query = SQL`select v, count(*) from jzr_triples group by v;`;
        echo(grey('Ωjzrsdb__22'), gold(reverse(bold(query))));
        counts = (this.dba.prepare(query)).all();
        return console.table(counts);
      })();
      (() => {        //.......................................................................................................
        var count, counts, dskey, query;
        query = SQL`select dskey, count(*) as count from jzr_mirror_lines group by dskey union all
select '*',   count(*) as count from jzr_mirror_lines
order by count;`;
        echo(grey('Ωjzrsdb__23'), gold(reverse(bold(query))));
        counts = (this.dba.prepare(query)).all();
        counts = Object.fromEntries((function() {
          var i, len, results;
          results = [];
          for (i = 0, len = counts.length; i < len; i++) {
            ({dskey, count} = counts[i]);
            results.push([dskey, {count}]);
          }
          return results;
        })());
        return console.table(counts);
      })();
      //.......................................................................................................
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    show_jzr_meta_faults() {
      var faulty_rows;
      if ((faulty_rows = (this.dba.prepare(SQL`select * from jzr_meta_faults;`)).all()).length > 0) {
        echo('Ωjzrsdb__24', red(reverse(bold(" found some faults: "))));
        console.table(faulty_rows);
      } else {
        echo('Ωjzrsdb__25', lime(reverse(bold(" (no faults) "))));
      }
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
    if (false) {
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
    }
    //.........................................................................................................
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  demo_read_dump = function() {
    var Undumper, jzr, path, wc;
    ({Benchmarker} = SFMODULES.unstable.require_benchmarking());
    // { nameit,               } = SFMODULES.require_nameit()
    benchmarker = new Benchmarker();
    timeit = function(...P) {
      return benchmarker.timeit(...P);
    };
    ({Undumper} = SFMODULES.require_sqlite_undumper());
    ({walk_lines_with_positions} = SFMODULES.unstable.require_fast_linereader());
    ({wc} = SFMODULES.require_wc());
    path = PATH.resolve(__dirname, '../jzr.dump.sql');
    jzr = new Jizura();
    jzr.dba.teardown({
      test: '*'
    });
    debug('Ωjzrsdb__26', Undumper.undump({
      db: jzr.dba,
      path,
      mode: 'fast'
    }));
    //.........................................................................................................
    jzr.show_counts();
    jzr.show_jzr_meta_faults();
    return null;
  };

  //===========================================================================================================
  if (module === require.main) {
    (() => {
      demo();
      // demo_read_dump()
      return null;
    })();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsRUFBQSxFQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUEsTUFBQSxFQUFBLGNBQUEsRUFBQSxpQkFBQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxjQUFBLEVBQUEsdUJBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSx5QkFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQTs7O0VBR0EsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxLQURGLEVBRUUsSUFGRixFQUdFLElBSEYsRUFJRSxLQUpGLEVBS0UsTUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsT0FSRixDQUFBLEdBUTRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBUixDQUFvQixtQkFBcEIsQ0FSNUI7O0VBU0EsQ0FBQSxDQUFFLEdBQUYsRUFDRSxPQURGLEVBRUUsSUFGRixFQUdFLEtBSEYsRUFJRSxLQUpGLEVBS0UsSUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsSUFSRixFQVNFLEdBVEYsRUFVRSxJ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Q0FMSztVQU1MO1lBQUUsS0FBQSxFQUFPLDhCQUFUO1lBQWdELElBQUEsRUFBTSxDQUF0RDtZQUF5RCxDQUFBLEVBQUcsSUFBNUQ7WUFBa0UsQ0FBQSxFQUFHLG9CQUFyRTtZQUFtRyxDQUFBLEVBQUc7VUFBdEcsQ0FOSztVQU9MO1lBQUUsS0FBQSxFQUFPLDhCQUFUO1lBQWdELElBQUEsRUFBTSxDQUF0RDtZQUF5RCxDQUFBLEVBQUcsSUFBNUQ7WUFBa0UsQ0FBQSxFQUFHLG9CQUFyRTtZQUFtRyxDQUFBLEVBQUc7VUFBdEcsQ0FQSztVQVFMO1lBQUUsS0FBQSxFQUFPLCtCQUFUO1lBQWdELElBQUEsRUFBTSxDQUF0RDtZQUF5RCxDQUFBLEVBQUcsSUFBNUQ7WUFBa0UsQ0FBQSxFQUFHLHFCQUFyRTtZQUFtRyxDQUFBLEVBQUc7VUFBdEcsQ0FSSztVQVNMO1lBQUUsS0FBQSxFQUFPLG1DQUFUO1lBQWdELElBQUEsRUFBTSxDQUF0RDtZQUF5RCxDQUFBLEVBQUcsSUFBNUQ7WUFBa0UsQ0FBQSxFQUFHLHlCQUFyRTtZQUFtRyxDQUFBLEVBQUc7VUFBdEcsQ0FUSztVQVVMO1lBQUUsS0FBQSxFQUFPLG1DQUFUO1lBQWdELElBQUEsRUFBTSxDQUF0RDtZQUF5RCxDQUFBLEVBQUcsSUFBNUQ7WUFBa0UsQ0FBQSxFQUFHLHlCQUFyRTtZQUFtRyxDQUFBLEVBQUc7VUFBdEcsQ0FWSztVQVdMO1lBQUUsS0FBQSxFQUFPLDZCQUFUO1lBQWdELElBQUEsRUFBTSxDQUF0RDtZQUF5RCxDQUFBLEVBQUcsSUFBNUQ7WUFBa0UsQ0FBQSxFQUFHLG1CQUFyRTtZQUFtRyxDQUFBLEVBQUc7VUFBdEcsQ0FYSztVQVlMO1lBQUUsS0FBQSxFQUFPLDZCQUFUO1lBQWdELElBQUEsRUFBTSxDQUF0RDtZQUF5RCxDQUFBLEVBQUcsSUFBNUQ7WUFBa0UsQ0FBQSxFQUFHLG1CQUFyRTtZQUFtRyxDQUFBLEVBQUc7VUFBdEcsQ0FaSztVQWFMO1lBQUUsS0FBQSxFQUFPLHFDQUFUO1lBQWdELElBQUEsRUFBTSxDQUF0RDtZQUF5RCxD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blxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5HVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xueyBhbGVydFxuICBkZWJ1Z1xuICBoZWxwXG4gIGluZm9cbiAgcGxhaW5cbiAgcHJhaXNlXG4gIHVyZ2VcbiAgd2FyblxuICB3aGlzcGVyIH0gICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ2ppenVyYS1zb3VyY2VzLWRiJ1xueyBycHJcbiAgaW5zcGVjdFxuICBlY2hvXG4gIHdoaXRlXG4gIGdyZWVuXG4gIGJsdWVcbiAgbGltZVxuICBnb2xkXG4gIGdyZXlcbiAgcmVkXG4gIGJvbGRcbiAgcmV2ZXJzZVxuICBsb2cgICAgIH0gICAgICAgICAgICAgICA9IEdVWS50cm1cbiMgeyBmIH0gICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9lZmZzdHJpbmcnXG4jIHdyaXRlICAgICAgICAgICAgICAgICAgICAgPSAoIHAgKSAtPiBwcm9jZXNzLnN0ZG91dC53cml0ZSBwXG4jIHsgbmZhIH0gICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvbm9ybWFsaXplLWZ1bmN0aW9uLWFyZ3VtZW50cydcbiMgR1RORyAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ndXktdGVzdC1ORydcbiMgeyBUZXN0ICAgICAgICAgICAgICAgICAgfSA9IEdUTkdcbkZTICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOmZzJ1xuUEFUSCAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6cGF0aCdcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQnNxbDMgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2JldHRlci1zcWxpdGUzJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5TRk1PRFVMRVMgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2JyaWNhYnJhYy1zZm1vZHVsZXMnXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgRGJyaWMsXG4gIERicmljX3N0ZCxcbiAgU1FMLCAgICAgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZGJyaWMoKVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IGxldHMsXG4gIGZyZWV6ZSwgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2xldHNmcmVlemV0aGF0X2luZnJhKCkuc2ltcGxlXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgSmV0c3RyZWFtLFxuICBBc3luY19qZXRzdHJlYW0sICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9qZXRzdHJlYW0oKVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2Zhc3RfbGluZXJlYWRlcigpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgQmVuY2htYXJrZXIsICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfYmVuY2htYXJraW5nKClcbmJlbmNobWFya2VyICAgICAgICAgICAgICAgICAgID0gbmV3IEJlbmNobWFya2VyKClcbnRpbWVpdCAgICAgICAgICAgICAgICAgICAgICAgID0gKCBQLi4uICkgLT4gYmVuY2htYXJrZXIudGltZWl0IFAuLi5cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBzZXRfZ2V0dGVyLCAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9tYW5hZ2VkX3Byb3BlcnR5X3Rvb2xzKClcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmZyb21fYm9vbCAgICAgICAgICAgICAgICAgICAgID0gKCB4ICkgLT4gc3dpdGNoIHhcbiAgd2hlbiB0cnVlICB0aGVuIDFcbiAgd2hlbiBmYWxzZSB0aGVuIDBcbiAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fXzEgZXhwZWN0ZWQgdHJ1ZSBvciBmYWxzZSwgZ290ICN7cnByIHh9XCJcbmFzX2Jvb2wgICAgICAgICAgICAgICAgICAgICAgID0gKCB4ICkgLT4gc3dpdGNoIHhcbiAgd2hlbiAxIHRoZW4gdHJ1ZVxuICB3aGVuIDAgdGhlbiBmYWxzZVxuICBlbHNlIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX19fMiBleHBlY3RlZCAwIG9yIDEsIGdvdCAje3JwciB4fVwiXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZGVtb19zb3VyY2VfaWRlbnRpZmllcnMgPSAtPlxuICB7IGV4cGFuZF9kaWN0aW9uYXJ5LCAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9kaWN0aW9uYXJ5X3Rvb2xzKClcbiAgeyBnZXRfbG9jYWxfZGVzdGluYXRpb25zLCB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfZ2V0X2xvY2FsX2Rlc3RpbmF0aW9ucygpXG4gIGZvciBrZXksIHZhbHVlIG9mIGdldF9sb2NhbF9kZXN0aW5hdGlvbnMoKVxuICAgIGRlYnVnICfOqWp6cnNkYl9fXzMnLCBrZXksIHZhbHVlXG4gICMgY2FuIGFwcGVuZCBsaW5lIG51bWJlcnMgdG8gZmlsZXMgYXMgaW46XG4gICMgJ2RpY3Q6bWVhbmluZ3MuMTpMPTEzMzMyJ1xuICAjICdkaWN0OnVjZDE0MC4xOnVoZGlkeDpMPTEyMzQnXG4gICMgcm93aWRzOiAndDpqZm06Uj0xJ1xuICAjIHtcbiAgIyAgICdkaWN0Om1lYW5pbmdzJzogICAgICAgICAgJyRqenJkcy9tZWFuaW5nL21lYW5pbmdzLnR4dCdcbiAgIyAgICdkaWN0OnVjZDp2MTQuMDp1aGRpZHgnIDogJyRqenJkcy91bmljb2RlLm9yZy11Y2QtdjE0LjAvVW5paGFuX0RpY3Rpb25hcnlJbmRpY2VzLnR4dCdcbiAgIyAgIH1cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5nZXRfcGF0aHMgPSAtPlxuICBSICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IHt9XG4gIFIuYmFzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5yZXNvbHZlIF9fZGlybmFtZSwgJy4uJ1xuICBSLmp6ciAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEgucmVzb2x2ZSBSLmJhc2UsICcuLidcbiAgUi5kYiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gUi5iYXNlLCAnanpyLmRiJ1xuICAjIFIuZGIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gJy9kZXYvc2htL2p6ci5kYidcbiAgUi5qenJkcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gUi5iYXNlLCAnanpyZHMnXG4gIFIuanpybmV3ZHMgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIFIuanpyLCAnaml6dXJhLW5ldy1kYXRhc291cmNlcydcbiAgUi5yYXdfZ2l0aHViICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gUi5qenJuZXdkcywgJ2J2ZnMvb3JpZ2luL2h0dHBzL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20nXG4gIGthbmppdW0gICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIFIucmF3X2dpdGh1YiwgJ21pZnVuZXRvc2hpcm8va2Fuaml1bS84YTBjZGFhMTZkNjRhMjgxYTIwNDhkZTJlZWUyZWM1ZTNhNDQwZmE2J1xuICBydXRvcGlvICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBSLnJhd19naXRodWIsICdydXRvcGlvL0tvcmVhbi1OYW1lLUhhbmphLUNoYXJzZXQvMTJkZjFiYTFiNGRmYWEwOTU4MTNlNGRkZmJhNDI0ZTgxNmY5NGM1MydcbiAgUlsgJ2RpY3Q6bWVhbmluZ3MnICAgICAgICAgICAgICBdICAgPSBQQVRILmpvaW4gUi5qenJkcywgJ21lYW5pbmcvbWVhbmluZ3MudHh0J1xuICBSWyAnZGljdDp1Y2Q6djE0LjA6dWhkaWR4JyAgICAgIF0gICA9IFBBVEguam9pbiBSLmp6cmRzLCAndW5pY29kZS5vcmctdWNkLXYxNC4wL1VuaWhhbl9EaWN0aW9uYXJ5SW5kaWNlcy50eHQnXG4gIFJbICdkaWN0Ong6a28tSGFuZytMYXRuJyAgICAgICAgXSAgID0gUEFUSC5qb2luIFIuanpybmV3ZHMsICdoYW5nZXVsLXRyYW5zY3JpcHRpb25zLnRzdidcbiAgUlsgJ2RpY3Q6eDpqYS1LYW4rTGF0bicgICAgICAgICBdICAgPSBQQVRILmpvaW4gUi5qenJuZXdkcywgJ2thbmEtdHJhbnNjcmlwdGlvbnMudHN2J1xuICBSWyAnZGljdDpiY3A0NycgICAgICAgICAgICAgICAgIF0gICA9IFBBVEguam9pbiBSLmp6cm5ld2RzLCAnQkNQNDctbGFuZ3VhZ2Utc2NyaXB0cy1yZWdpb25zLnRzdidcbiAgUlsgJ2RpY3Q6amE6a2Fuaml1bScgICAgICAgICAgICBdICAgPSBQQVRILmpvaW4ga2Fuaml1bSwgJ2RhdGEvc291cmNlX2ZpbGVzL2thbmppZGljdC50eHQnXG4gIFJbICdkaWN0OmphOmthbmppdW06YXV4JyAgICAgICAgXSAgID0gUEFUSC5qb2luIGthbmppdW0sICdkYXRhL3NvdXJjZV9maWxlcy8wX1JFQURNRS50eHQnXG4gIFJbICdkaWN0OmtvOlY9ZGF0YS1nb3YuY3N2JyAgICAgXSAgID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLWdvdi5jc3YnXG4gIFJbICdkaWN0OmtvOlY9ZGF0YS1nb3YuanNvbicgICAgXSAgID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLWdvdi5qc29uJ1xuICBSWyAnZGljdDprbzpWPWRhdGEtbmF2ZXIuY3N2JyAgIF0gICA9IFBBVEguam9pbiBydXRvcGlvLCAnZGF0YS1uYXZlci5jc3YnXG4gIFJbICdkaWN0OmtvOlY9ZGF0YS1uYXZlci5qc29uJyAgXSAgID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLW5hdmVyLmpzb24nXG4gIFJbICdkaWN0OmtvOlY9UkVBRE1FLm1kJyAgICAgICAgXSAgID0gUEFUSC5qb2luIHJ1dG9waW8sICdSRUFETUUubWQnXG4gIHJldHVybiBSXG5cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEp6cl9kYl9hZGFwdGVyIGV4dGVuZHMgRGJyaWNfc3RkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAZGJfY2xhc3M6ICBCc3FsM1xuICBAcHJlZml4OiAgICAnanpyJ1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6ICggZGJfcGF0aCwgY2ZnID0ge30gKSAtPlxuICAgICMjIyBUQUlOVCBuZWVkIG1vcmUgY2xhcml0eSBhYm91dCB3aGVuIHN0YXRlbWVudHMsIGJ1aWxkLCBpbml0aWFsaXplLi4uIGlzIHBlcmZvcm1lZCAjIyNcbiAgICB7IGhvc3QsIH0gPSBjZmdcbiAgICBjZmcgICAgICAgPSBsZXRzIGNmZywgKCBjZmcgKSAtPiBkZWxldGUgY2ZnLmhvc3RcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHN1cGVyIGRiX3BhdGgsIGNmZ1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQGhvc3QgICA9IGhvc3RcbiAgICBAc3RhdGUgID0geyB0cmlwbGVfY291bnQ6IDAsIG1vc3RfcmVjZW50X2luc2VydGVkX3JvdzogbnVsbCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkbyA9PlxuICAgICAgIyMjIFRBSU5UIHRoaXMgaXMgbm90IHdlbGwgcGxhY2VkICMjI1xuICAgICAgIyMjIE5PVEUgZXhlY3V0ZSBhIEdhcHMtYW5kLUlzbGFuZHMgRVNTRlJJIHRvIGltcHJvdmUgc3RydWN0dXJhbCBpbnRlZ3JpdHkgYXNzdXJhbmNlOiAjIyNcbiAgICAgICMgKCBAcHJlcGFyZSBTUUxcInNlbGVjdCAqIGZyb20gX2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzIHdoZXJlIGZhbHNlO1wiICkuZ2V0KClcbiAgICAgIG1lc3NhZ2VzID0gW11cbiAgICAgIGZvciB7IG5hbWUsIHR5cGUsIH0gZnJvbSBAc3RhdGVtZW50cy5zdGRfZ2V0X3JlbGF0aW9ucy5pdGVyYXRlKClcbiAgICAgICAgdHJ5XG4gICAgICAgICAgKCBAcHJlcGFyZSBTUUxcInNlbGVjdCAqIGZyb20gI3tuYW1lfSB3aGVyZSBmYWxzZTtcIiApLmFsbCgpXG4gICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgbWVzc2FnZXMucHVzaCBcIiN7dHlwZX0gI3tuYW1lfTogI3tlcnJvci5tZXNzYWdlfVwiXG4gICAgICAgICAgd2FybiAnzqlqenJzZGJfX180JywgZXJyb3IubWVzc2FnZVxuICAgICAgcmV0dXJuIG51bGwgaWYgbWVzc2FnZXMubGVuZ3RoIGlzIDBcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX19fNSBFRkZSSSB0ZXN0aW5nIHJldmVhbGVkIGVycm9yczogI3tycHIgbWVzc2FnZXN9XCJcbiAgICAgIDtudWxsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiBAaXNfZnJlc2hcbiAgICAgIEBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZXMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdmVyYnMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGNvZGVzKClcbiAgICAgIEBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzKClcbiAgICAgIEBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXNfZm9yX21lYW5pbmdzKClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDt1bmRlZmluZWRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNldF9nZXR0ZXIgQDo6LCAnbmV4dF90cmlwbGVfcm93aWQnLCAtPiBcInQ6bXI6M3BsOlI9I3srK0BzdGF0ZS50cmlwbGVfY291bnR9XCJcblxuXG4gICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgQGJ1aWxkOiBbXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfZGF0YXNvdXJjZXMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBkc2tleSAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBwYXRoICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCByb3dpZCByZWdleHAgJ150OmRzOlI9XFxcXGQrJCcpKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfbGNvZGVzIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgbGNvZGUgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgY29tbWVudCAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNoZWNrICggbGNvZGUgcmVnZXhwICdeW2EtekEtWl0rW2EtekEtWjAtOV0qJCcgKSxcbiAgICAgIGNoZWNrICggcm93aWQgPSAndDptcjpsYzpWPScgfHwgbGNvZGUgKSApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX21pcnJvcl9saW5lcyAoXG4gICAgICAgIC0tICd0OmpmbTonXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHJlZiAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGRza2V5IHx8ICc6TD0nIHx8IGxpbmVfbnIgKSB2aXJ0dWFsLFxuICAgICAgICBkc2tleSAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBsaW5lX25yICAgaW50ZWdlciAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBsY29kZSAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBsaW5lICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBqZmllbGRzICAganNvbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCByb3dpZCByZWdleHAgJ150Om1yOmxuOlI9XFxcXGQrJCcpLFxuICAgICAgdW5pcXVlICggZHNrZXksIGxpbmVfbnIgKSxcbiAgICAgIGZvcmVpZ24ga2V5ICggbGNvZGUgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfbGNvZGVzICggbGNvZGUgKSApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX21pcnJvcl92ZXJicyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHJhbmsgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwgZGVmYXVsdCAxLFxuICAgICAgICBzICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICB2ICAgICAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBvICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCByb3dpZCByZWdleHAgJ150Om1yOnZiOlY9W1xcXFwtOlxcXFwrXFxcXHB7TH1dKyQnICksXG4gICAgICBjaGVjayAoIHJhbmsgPiAwICkgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcmVmICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgcyAgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgdiAgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbyAgICAgICAgIGpzb24gICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNoZWNrICggcm93aWQgcmVnZXhwICdedDptcjozcGw6Uj1cXFxcZCskJyApLFxuICAgICAgLS0gdW5pcXVlICggcmVmLCBzLCB2LCBvIClcbiAgICAgIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xpbmVzICggcm93aWQgKSxcbiAgICAgIGZvcmVpZ24ga2V5ICggdiAgICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX3ZlcmJzICggdiApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9taXJyb3JfdHJpcGxlc19yZWdpc3RlclxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZVxuICAgICAgZm9yIGVhY2ggcm93IGJlZ2luXG4gICAgICAgIHNlbGVjdCB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfbWlycm9yX3RyaXBsZXNfYmFzZScsXG4gICAgICAgICAgJ3Jvd2lkOicsIG5ldy5yb3dpZCwgJ3JlZjonLCBuZXcucmVmLCAnczonLCBuZXcucywgJ3Y6JywgbmV3LnYsICdvOicsIG5ldy5vICk7XG4gICAgICAgIGVuZDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIChcbiAgICAgICAgcm93aWQgICAgICAgICAgIHRleHQgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHJlZiAgICAgICAgICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBzeWxsYWJsZV9oYW5nICAgdGV4dCAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgc3lsbGFibGVfbGF0biAgIHRleHQgIG5vdCBudWxsIGdlbmVyYXRlZCBhbHdheXMgYXMgKCBpbml0aWFsX2xhdG4gfHwgbWVkaWFsX2xhdG4gfHwgZmluYWxfbGF0biApIHZpcnR1YWwsXG4gICAgICAgIC0tIHN5bGxhYmxlX2xhdG4gICB0ZXh0ICB1bmlxdWUgIG5vdCBudWxsIGdlbmVyYXRlZCBhbHdheXMgYXMgKCBpbml0aWFsX2xhdG4gfHwgbWVkaWFsX2xhdG4gfHwgZmluYWxfbGF0biApIHZpcnR1YWwsXG4gICAgICAgIGluaXRpYWxfaGFuZyAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBtZWRpYWxfaGFuZyAgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgZmluYWxfaGFuZyAgICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGluaXRpYWxfbGF0biAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBtZWRpYWxfbGF0biAgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgZmluYWxfbGF0biAgICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bGFuZzpoYW5nOnN5bDpWPVxcXFxTKyQnIClcbiAgICAgIC0tIHVuaXF1ZSAoIHJlZiwgcywgdiwgbyApXG4gICAgICAtLSBmb3JlaWduIGtleSAoIHJlZiApIHJlZmVyZW5jZXMganpyX21pcnJvcl9saW5lcyAoIHJvd2lkIClcbiAgICAgIC0tIGZvcmVpZ24ga2V5ICggc3lsbGFibGVfaGFuZyApIHJlZmVyZW5jZXMganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgKCBvICkgKVxuICAgICAgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRyaWdnZXIganpyX2xhbmdfaGFuZ19zeWxsYWJsZXNfcmVnaXN0ZXJcbiAgICAgIGJlZm9yZSBpbnNlcnQgb24ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXNcbiAgICAgIGZvciBlYWNoIHJvdyBiZWdpblxuICAgICAgICBzZWxlY3QgdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0KCAnanpyX2xhbmdfaGFuZ19zeWxsYWJsZXMnLFxuICAgICAgICAgIG5ldy5yb3dpZCwgbmV3LnJlZiwgbmV3LnN5bGxhYmxlX2hhbmcsIG5ldy5zeWxsYWJsZV9sYXRuLFxuICAgICAgICAgICAgbmV3LmluaXRpYWxfaGFuZywgbmV3Lm1lZGlhbF9oYW5nLCBuZXcuZmluYWxfaGFuZyxcbiAgICAgICAgICAgIG5ldy5pbml0aWFsX2xhdG4sIG5ldy5tZWRpYWxfbGF0biwgbmV3LmZpbmFsX2xhdG4gKTtcbiAgICAgICAgZW5kO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzIGFzXG4gICAgICBzZWxlY3QgbnVsbCBhcyByb3dpZCwgbnVsbCBhcyByZWYsIG51bGwgYXMgcywgbnVsbCBhcyB2LCBudWxsIGFzIG8gd2hlcmUgZmFsc2UgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAnYzpyZWFkaW5nOmtvLUxhdG4nLCAgICAgICAgICBzeWxsYWJsZV9sYXRuICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAnYzpyZWFkaW5nOmtvLUxhdG46aW5pdGlhbCcsICBpbml0aWFsX2xhdG4gICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAnYzpyZWFkaW5nOmtvLUxhdG46bWVkaWFsJywgICBtZWRpYWxfbGF0biAgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAnYzpyZWFkaW5nOmtvLUxhdG46ZmluYWwnLCAgICBmaW5hbF9sYXRuICAgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAnYzpyZWFkaW5nOmtvLUhhbmc6aW5pdGlhbCcsICBpbml0aWFsX2hhbmcgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAnYzpyZWFkaW5nOmtvLUhhbmc6bWVkaWFsJywgICBtZWRpYWxfaGFuZyAgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAnYzpyZWFkaW5nOmtvLUhhbmc6ZmluYWwnLCAgICBmaW5hbF9oYW5nICAgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwgd2hlcmUgZmFsc2VcbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2FsbF90cmlwbGVzIGFzXG4gICAgICBzZWxlY3QgbnVsbCBhcyByb3dpZCwgbnVsbCBhcyByZWYsIG51bGwgYXMgcywgbnVsbCBhcyB2LCBudWxsIGFzIG8gd2hlcmUgZmFsc2UgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCAqIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgKiBmcm9tIGp6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXMgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsIHdoZXJlIGZhbHNlXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl90cmlwbGVzIGFzXG4gICAgICBzZWxlY3QgbnVsbCBhcyByb3dpZCwgbnVsbCBhcyByZWYsIG51bGwgYXMgcmFuaywgbnVsbCBhcyBzLCBudWxsIGFzIHYsIG51bGwgYXMgbyB3aGVyZSBmYWxzZVxuICAgICAgLS0gLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCB0YjEucm93aWQsIHRiMS5yZWYsIHZiMS5yYW5rLCB0YjEucywgdGIxLnYsIHRiMS5vIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgdGIxXG4gICAgICBqb2luIGp6cl9taXJyb3JfdmVyYnMgYXMgdmIxIHVzaW5nICggdiApXG4gICAgICB3aGVyZSB2YjEudiBsaWtlICdjOiUnXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHRiMi5yb3dpZCwgdGIyLnJlZiwgdmIyLnJhbmssIHRiMi5zLCBrci52LCBrci5vIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgdGIyXG4gICAgICBqb2luIGp6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXMgYXMga3Igb24gKCB0YjIudiA9ICdjOnJlYWRpbmc6a28tSGFuZycgYW5kIHRiMi5vID0ga3IucyApXG4gICAgICBqb2luIGp6cl9taXJyb3JfdmVyYnMgYXMgdmIyIG9uICgga3IudiA9IHZiMi52IClcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgb3JkZXIgYnkgcywgdiwgb1xuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfdG9wX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdCAqIGZyb20ganpyX3RyaXBsZXNcbiAgICAgIHdoZXJlIHJhbmsgPSAxXG4gICAgICBvcmRlciBieSBzLCB2LCBvXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9jamtfYWdnX2xhdG4gYXNcbiAgICAgIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIHMsXG4gICAgICAgICAgdixcbiAgICAgICAgICBqc29uX2dyb3VwX2FycmF5KCBvICkgb3ZlciAoXG4gICAgICAgICAgICBwYXJ0aXRpb24gYnkgcywgdlxuICAgICAgICAgICAgb3JkZXIgYnkgb1xuICAgICAgICAgICAgcm93cyBiZXR3ZWVuIHVuYm91bmRlZCBwcmVjZWRpbmcgYW5kIHVuYm91bmRlZCBmb2xsb3dpbmdcbiAgICAgICAgICAgICkgYXMgb3NcbiAgICAgICAgZnJvbSBqenJfdG9wX3RyaXBsZXNcbiAgICAgICAgd2hlcmUgdiBpbiAoICdjOnJlYWRpbmc6emgtTGF0bi1waW55aW4nLCdjOnJlYWRpbmc6amEteC1LYXQrTGF0bicsICdjOnJlYWRpbmc6a28tTGF0bicpXG4gICAgICAgIG9yZGVyIGJ5IHMsIHYsIG9zXG4gICAgICA7XCJcIlwiXG5cbiAgICAjICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfY2prX3JlYWRpbmdfZXF1aXZhbGVudHMgYXNcbiAgICAjICAgc2VsZWN0IGRpc3RpbmN0XG4gICAgIyAgICAgICAtLSB0cjEucm93aWQgYXMgcmVmMSxcbiAgICAjICAgICAgIC0tIHRyMi5yb3dpZCBhcyByZWYyLFxuICAgICMgICAgICAgLS0gdHIxLnJlZiAgIGFzIHJlZjEsXG4gICAgIyAgICAgICAtLSB0cjIucmVmICAgYXMgcmVmMixcbiAgICAjICAgICAgIC0tIHRyMS5yYW5rICBhcyByYW5rMSxcbiAgICAjICAgICAgIC0tIHRyMi5yYW5rICBhcyByYW5rMixcbiAgICAjICAgICAgIHRyMS5zICAgICBhcyBzMSxcbiAgICAjICAgICAgIC0tIHRyMi5zICAgICBhcyBzMixcbiAgICAjICAgICAgIC0tIHRyMS52ICAgICBhcyB2MSxcbiAgICAjICAgICAgIC0tIHRyMi52ICAgICBhcyB2MixcbiAgICAjICAgICAgIC0tIHRyMy52ICAgICBhcyB2MyxcbiAgICAjICAgICAgIC0tIHRyNC52ICAgICBhcyB2NCxcbiAgICAjICAgICAgIC0tIHRyMS5vICAgICBhcyBvMSxcbiAgICAjICAgICAgIHRyMi5vICAgICBhcyBvMixcbiAgICAjICAgICAgIHRyMy5vICAgICBhcyBvMyxcbiAgICAjICAgICAgIHRyNC5vICAgICBhcyBvNFxuICAgICMgICAgIGZyb20ganpyX3RyaXBsZXMgICAgICBhcyB0cjFcbiAgICAjICAgICBsZWZ0IGpvaW4ganpyX3RyaXBsZXMgYXMgdHIyIG9uICggdHIxLnMgPSB0cjIucyBhbmQgdHIyLnYgPSAnYzpyZWFkaW5nOnpoLUxhdG4tcGlueWluJyApXG4gICAgIyAgICAgbGVmdCBqb2luIGp6cl90cmlwbGVzIGFzIHRyMyBvbiAoIHRyMS5zID0gdHIzLnMgYW5kIHRyMy52ID0gJ2M6cmVhZGluZzpqYS14LUthdCtMYXRuJyApXG4gICAgIyAgICAgbGVmdCBqb2luIGp6cl90cmlwbGVzIGFzIHRyNCBvbiAoIHRyMS5zID0gdHI0LnMgYW5kIHRyNC52ID0gJ2M6cmVhZGluZzprby1MYXRuJyApXG4gICAgIyAgICAgLS0gbGVmdCBqb2luIGp6cl90cmlwbGVzIGFzIHRyMiBvbiAoICdjOnJlYWRpbmc6emgtTGF0bi1waW55aW4nLCdjOnJlYWRpbmc6amEteC1LYXQrTGF0bicsICdjOnJlYWRpbmc6a28tTGF0bicpXG4gICAgIyAgICAgLS0gbGVmdCBqb2luIGp6cl90cmlwbGVzIGFzIHRyMiBvbiAoICdjOnJlYWRpbmc6emgtTGF0bi1waW55aW4nLCdjOnJlYWRpbmc6amEteC1LYXQrTGF0bicsICdjOnJlYWRpbmc6a28tTGF0bicpXG4gICAgIyAgICAgd2hlcmUgdHIxLnYgaW4gKCAnYzpyZWFkaW5nOnpoLUxhdG4tcGlueWluJywgJ2M6cmVhZGluZzpqYS14LUthdCtMYXRuJywgJ2M6cmVhZGluZzprby1MYXRuJyApXG4gICAgIyAgICAgb3JkZXIgYnkgczEsIG8yLCBvMywgbzRcbiAgICAjICAgICA7XCJcIlwiXG5cbiAgICAjICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfY2prX3JlYWRpbmdfZXF1aXZhbGVudHNfMiBhc1xuICAgICMgICBzZWxlY3QgZGlzdGluY3RcbiAgICAjICAgICAgIHMxICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgczEsXG4gICAgIyAgICAgICBqc29uX2dyb3VwX2FycmF5KCBvMiApIG92ZXIgdzIgICBhcyBvMixcbiAgICAjICAgICAgIGpzb25fZ3JvdXBfYXJyYXkoIG8zICkgb3ZlciB3MyAgIGFzIG8zLFxuICAgICMgICAgICAganNvbl9ncm91cF9hcnJheSggbzQgKSBvdmVyIHc0ICAgYXMgbzRcbiAgICAjICAgICBmcm9tIGp6cl9jamtfcmVhZGluZ19lcXVpdmFsZW50c1xuICAgICMgICAgIHdpbmRvd1xuICAgICMgICAgICAgdzIgYXMgKCBwYXJ0aXRpb24gYnkgczEgb3JkZXIgYnkgbzIgcm93cyBiZXR3ZWVuIHVuYm91bmRlZCBwcmVjZWRpbmcgYW5kIHVuYm91bmRlZCBmb2xsb3dpbmcgKSxcbiAgICAjICAgICAgIHczIGFzICggcGFydGl0aW9uIGJ5IHMxIG9yZGVyIGJ5IG8zIHJvd3MgYmV0d2VlbiB1bmJvdW5kZWQgcHJlY2VkaW5nIGFuZCB1bmJvdW5kZWQgZm9sbG93aW5nICksXG4gICAgIyAgICAgICB3NCBhcyAoIHBhcnRpdGlvbiBieSBzMSBvcmRlciBieSBvNCByb3dzIGJldHdlZW4gdW5ib3VuZGVkIHByZWNlZGluZyBhbmQgdW5ib3VuZGVkIGZvbGxvd2luZyApXG4gICAgIyAgIDtcIlwiXCJcblxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMgYXMgc2VsZWN0XG4gICAgICAgIG1sLnJvd2lkICBhcyByb3dpZCxcbiAgICAgICAgbWwucmVmICAgIGFzIHJlZixcbiAgICAgICAgbWwubGluZSAgIGFzIGxpbmVcbiAgICAgIGZyb20ganpyX21pcnJvcl9saW5lcyBhcyBtbFxuICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICBhbmQgKCBub3QgaXNfdWNfbm9ybWFsKCBtbC5saW5lICkgKVxuICAgICAgb3JkZXIgYnkgbWwucm93aWQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV9rcl9yZWFkaW5nc191bmtub3duX3ZlcmJfZmF1bHRzIGFzIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIGNvdW50KCopIG92ZXIgKCBwYXJ0aXRpb24gYnkgdiApICAgIGFzIGNvdW50LFxuICAgICAgICAgICdqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzOlI9KicgIGFzIHJvd2lkLFxuICAgICAgICAgICcqJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAndW5rbm93bi12ZXJiJyAgICAgICAgICAgICAgICAgICAgICBhcyBkZXNjcmlwdGlvbixcbiAgICAgICAgICB2ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBxdW90ZVxuICAgICAgICBmcm9tIGp6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXMgYXMgbm5cbiAgICAgICAgd2hlcmUgbm90IGV4aXN0cyAoIHNlbGVjdCAxIGZyb20ganpyX21pcnJvcl92ZXJicyBhcyB2YiB3aGVyZSB2Yi52ID0gbm4udiApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfbWV0YV9mYXVsdHMgYXNcbiAgICAgIHNlbGVjdCBudWxsIGFzIGNvdW50LCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyBkZXNjcmlwdGlvbiwgbnVsbCAgYXMgcXVvdGUgd2hlcmUgZmFsc2UgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCAxLCByb3dpZCwgcmVmLCAgJ3VjLW5vcm1hbGl6YXRpb24nLCBsaW5lICBhcyBxdW90ZSBmcm9tIF9qenJfbWV0YV91Y19ub3JtYWxpemF0aW9uX2ZhdWx0cyAgICAgICAgICB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tIF9qenJfbWV0YV9rcl9yZWFkaW5nc191bmtub3duX3ZlcmJfZmF1bHRzICB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwgd2hlcmUgZmFsc2VcbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfc3lsbGFibGVzIGFzIHNlbGVjdFxuICAgICMgICAgICAgdDEuc1xuICAgICMgICAgICAgdDEudlxuICAgICMgICAgICAgdDEub1xuICAgICMgICAgICAgdGkucyBhcyBpbml0aWFsX2hhbmdcbiAgICAjICAgICAgIHRtLnMgYXMgbWVkaWFsX2hhbmdcbiAgICAjICAgICAgIHRmLnMgYXMgZmluYWxfaGFuZ1xuICAgICMgICAgICAgdGkubyBhcyBpbml0aWFsX2xhdG5cbiAgICAjICAgICAgIHRtLm8gYXMgbWVkaWFsX2xhdG5cbiAgICAjICAgICAgIHRmLm8gYXMgZmluYWxfbGF0blxuICAgICMgICAgIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgdDFcbiAgICAjICAgICBqb2luXG4gICAgIyAgICAgam9pbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0aSBvbiAoIHQxLilcbiAgICAjICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIyMgYWdncmVnYXRlIHRhYmxlIGZvciBhbGwgcm93aWRzIGdvZXMgaGVyZSAjIyNcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQHN0YXRlbWVudHM6XG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfZGF0YXNvdXJjZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfZGF0YXNvdXJjZXMgKCByb3dpZCwgZHNrZXksIHBhdGggKSB2YWx1ZXMgKCAkcm93aWQsICRkc2tleSwgJHBhdGggKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIGRza2V5ICkgZG8gdXBkYXRlIHNldCBwYXRoID0gZXhjbHVkZWQucGF0aFxuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfbWlycm9yX3ZlcmI6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl92ZXJicyAoIHJvd2lkLCByYW5rLCBzLCB2LCBvICkgdmFsdWVzICggJHJvd2lkLCAkcmFuaywgJHMsICR2LCAkbyApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcm93aWQgKSBkbyB1cGRhdGUgc2V0IHJhbmsgPSBleGNsdWRlZC5yYW5rLCBzID0gZXhjbHVkZWQucywgdiA9IGV4Y2x1ZGVkLnYsIG8gPSBleGNsdWRlZC5vXG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGU6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl9sY29kZXMgKCByb3dpZCwgbGNvZGUsIGNvbW1lbnQgKSB2YWx1ZXMgKCAkcm93aWQsICRsY29kZSwgJGNvbW1lbnQgKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIHJvd2lkICkgZG8gdXBkYXRlIHNldCBsY29kZSA9IGV4Y2x1ZGVkLmxjb2RlLCBjb21tZW50ID0gZXhjbHVkZWQuY29tbWVudFxuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfbWlycm9yX3RyaXBsZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoIHJvd2lkLCByZWYsIHMsIHYsIG8gKSB2YWx1ZXMgKCAkcm93aWQsICRyZWYsICRzLCAkdiwgJG8gKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIHJlZiwgcywgdiwgbyApIGRvIG5vdGhpbmdcbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfbGluZXMgKCByb3dpZCwgZHNrZXksIGxpbmVfbnIsIGxjb2RlLCBsaW5lLCBqZmllbGRzIClcbiAgICAgIHNlbGVjdFxuICAgICAgICAndDptcjpsbjpSPScgfHwgcm93X251bWJlcigpIG92ZXIgKCkgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgIC0tIGRzLmRza2V5IHx8ICc6TD0nIHx8IGZsLmxpbmVfbnIgICBhcyByb3dpZCxcbiAgICAgICAgZHMuZHNrZXkgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGRza2V5LFxuICAgICAgICBmbC5saW5lX25yICAgICAgICAgICAgICAgICAgICAgICAgYXMgbGluZV9ucixcbiAgICAgICAgZmwubGNvZGUgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGxjb2RlLFxuICAgICAgICBmbC5saW5lICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbGluZSxcbiAgICAgICAgZmwuamZpZWxkcyAgICAgICAgICAgICAgICAgICAgICAgIGFzIGpmaWVsZHNcbiAgICAgIGZyb20ganpyX2RhdGFzb3VyY2VzICAgICAgICBhcyBkc1xuICAgICAgam9pbiBmaWxlX2xpbmVzKCBkcy5wYXRoICkgIGFzIGZsXG4gICAgICB3aGVyZSB0cnVlXG4gICAgICAtLSBvbiBjb25mbGljdCAoIGRza2V5LCBsaW5lX25yICkgZG8gdXBkYXRlIHNldCBsaW5lID0gZXhjbHVkZWQubGluZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgKCByb3dpZCwgcmVmLCBzLCB2LCBvIClcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICBndC5yb3dpZF9vdXQgICAgYXMgcm93aWQsXG4gICAgICAgICAgICBndC5yZWYgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICAgZ3QucyAgICAgICAgICAgIGFzIHMsXG4gICAgICAgICAgICBndC52ICAgICAgICAgICAgYXMgdixcbiAgICAgICAgICAgIGd0Lm8gICAgICAgICAgICBhcyBvXG4gICAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIG1sXG4gICAgICAgICAgam9pbiBnZXRfdHJpcGxlcyggbWwucm93aWQsIG1sLmRza2V5LCBtbC5qZmllbGRzICkgIGFzIGd0XG4gICAgICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICAgICAgYW5kICggbWwubGNvZGUgPSAnRCcgKVxuICAgICAgICAgICAgLS0gYW5kICggbWwuZHNrZXkgPSAnZGljdDptZWFuaW5ncycgKVxuICAgICAgICAgICAgYW5kICggbWwuamZpZWxkcyBpcyBub3QgbnVsbCApXG4gICAgICAgICAgICBhbmQgKCBtbC5qZmllbGRzLT4+JyRbMF0nIG5vdCByZWdleHAgJ15AZ2x5cGhzJyApXG4gICAgICAgICAgICAtLSBhbmQgKCBtbC5maWVsZF8zIHJlZ2V4cCAnXig/OnB5fGhpfGthKTonIClcbiAgICAgICAgLS0gb24gY29uZmxpY3QgKCByZWYsIHMsIHYsIG8gKSBkbyBub3RoaW5nXG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcG9wdWxhdGVfanpyX2xhbmdfaGFuZ2V1bF9zeWxsYWJsZXM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgKCByb3dpZCwgcmVmLFxuICAgICAgICBzeWxsYWJsZV9oYW5nLCBpbml0aWFsX2hhbmcsIG1lZGlhbF9oYW5nLCBmaW5hbF9oYW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbF9sYXRuLCBtZWRpYWxfbGF0biwgZmluYWxfbGF0blxuICAgICAgICAgICAgICAgICAgICAgICAgKVxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICAgICd0Omxhbmc6aGFuZzpzeWw6Vj0nIHx8IG10Lm8gICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgICAgICBtdC5yb3dpZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAgIG10Lm8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgc3lsbGFibGVfaGFuZyxcbiAgICAgICAgICAgIGRoLmluaXRpYWwgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgaW5pdGlhbF9oYW5nLFxuICAgICAgICAgICAgZGgubWVkaWFsICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBtZWRpYWxfaGFuZyxcbiAgICAgICAgICAgIGRoLmZpbmFsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZmluYWxfaGFuZyxcbiAgICAgICAgICAgIGNvYWxlc2NlKCBtdGkubywgJycgKSAgICAgICAgICAgICAgICAgYXMgaW5pdGlhbF9sYXRuLFxuICAgICAgICAgICAgY29hbGVzY2UoIG10bS5vLCAnJyApICAgICAgICAgICAgICAgICBhcyBtZWRpYWxfbGF0bixcbiAgICAgICAgICAgIGNvYWxlc2NlKCBtdGYubywgJycgKSAgICAgICAgICAgICAgICAgYXMgZmluYWxfbGF0blxuICAgICAgICAgIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgICAgICAgICAgICAgYXMgbXRcbiAgICAgICAgICBsZWZ0IGpvaW4gZGlzYXNzZW1ibGVfaGFuZ2V1bCggbXQubyApICAgIGFzIGRoXG4gICAgICAgICAgbGVmdCBqb2luIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIG10aSBvbiAoIG10aS5zID0gZGguaW5pdGlhbCBhbmQgbXRpLnYgPSAneDprby1IYW5nK0xhdG46aW5pdGlhbCcgKVxuICAgICAgICAgIGxlZnQgam9pbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyBtdG0gb24gKCBtdG0ucyA9IGRoLm1lZGlhbCAgYW5kIG10bS52ID0gJ3g6a28tSGFuZytMYXRuOm1lZGlhbCcgIClcbiAgICAgICAgICBsZWZ0IGpvaW4ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgbXRmIG9uICggbXRmLnMgPSBkaC5maW5hbCAgIGFuZCBtdGYudiA9ICd4OmtvLUhhbmcrTGF0bjpmaW5hbCcgICApXG4gICAgICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICAgICAgYW5kICggbXQudiA9ICdjOnJlYWRpbmc6a28tSGFuZycgKVxuICAgICAgICAgIG9yZGVyIGJ5IG10Lm9cbiAgICAgICAgLS0gb24gY29uZmxpY3QgKCByb3dpZCAgICAgICAgICkgZG8gbm90aGluZ1xuICAgICAgICAvKiAjIyMgTk9URSBgb24gY29uZmxpY3RgIG5lZWRlZCBiZWNhdXNlIHdlIGxvZyBhbGwgYWN0dWFsbHkgb2NjdXJyaW5nIHJlYWRpbmdzIG9mIGFsbCBjaGFyYWN0ZXJzICovXG4gICAgICAgIG9uIGNvbmZsaWN0ICggc3lsbGFibGVfaGFuZyApIGRvIG5vdGhpbmdcbiAgICAgICAgO1wiXCJcIlxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9sY29kZXM6IC0+XG4gICAgZGVidWcgJ86panpyc2RiX19fNicsICdfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xjb2RlcydcbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl9sY29kZS5ydW4geyByb3dpZDogJ3Q6bXI6bGM6Vj1CJywgbGNvZGU6ICdCJywgY29tbWVudDogJ2JsYW5rIGxpbmUnLCAgIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl9sY29kZS5ydW4geyByb3dpZDogJ3Q6bXI6bGM6Vj1DJywgbGNvZGU6ICdDJywgY29tbWVudDogJ2NvbW1lbnQgbGluZScsIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl9sY29kZS5ydW4geyByb3dpZDogJ3Q6bXI6bGM6Vj1EJywgbGNvZGU6ICdEJywgY29tbWVudDogJ2RhdGEgbGluZScsICAgIH1cbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl92ZXJiczogLT5cbiAgICAjIyMgTk9URVxuICAgIGluIHZlcmJzLCBpbml0aWFsIGNvbXBvbmVudCBpbmRpY2F0ZXMgdHlwZSBvZiBzdWJqZWN0OlxuICAgICAgYGM6YCBpcyBmb3Igc3ViamVjdHMgdGhhdCBhcmUgQ0pLIGNoYXJhY3RlcnNcbiAgICAgIGB4OmAgaXMgdXNlZCBmb3IgdW5jbGFzc2lmaWVkIHN1YmplY3RzIChwb3NzaWJseSB0byBiZSByZWZpbmVkIGluIHRoZSBmdXR1cmUpXG4gICAgIyMjXG4gICAgZGVidWcgJ86panpyc2RiX19fNycsICdfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX3ZlcmJzJ1xuICAgIHJvd3MgPSBbXG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPXg6a28tSGFuZytMYXRuOmluaXRpYWwnLCAgICByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd4OmtvLUhhbmcrTGF0bjppbml0aWFsJywgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj14OmtvLUhhbmcrTGF0bjptZWRpYWwnLCAgICAgcmFuazogMiwgczogXCJOTlwiLCB2OiAneDprby1IYW5nK0xhdG46bWVkaWFsJywgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9eDprby1IYW5nK0xhdG46ZmluYWwnLCAgICAgIHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3g6a28tSGFuZytMYXRuOmZpbmFsJywgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzp6aC1MYXRuLXBpbnlpbicsICByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6emgtTGF0bi1waW55aW4nLCAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6amEteC1LYW4nLCAgICAgICAgcmFuazogMSwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmphLXgtS2FuJywgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmphLXgtSGlyJywgICAgICAgIHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzpqYS14LUhpcicsICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzpqYS14LUthdCcsICAgICAgICByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6amEteC1LYXQnLCAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6amEteC1MYXRuJywgICAgICAgcmFuazogMSwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmphLXgtTGF0bicsICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmphLXgtSGlyK0xhdG4nLCAgIHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzpqYS14LUhpcitMYXRuJywgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzpqYS14LUthdCtMYXRuJywgICByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6amEteC1LYXQrTGF0bicsICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6a28tSGFuZycsICAgICAgICAgcmFuazogMSwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmtvLUhhbmcnLCAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmtvLUxhdG4nLCAgICAgICAgIHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzprby1MYXRuJywgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzprby1IYW5nOmluaXRpYWwnLCByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6a28tSGFuZzppbml0aWFsJywgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6a28tSGFuZzptZWRpYWwnLCAgcmFuazogMiwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmtvLUhhbmc6bWVkaWFsJywgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmtvLUhhbmc6ZmluYWwnLCAgIHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzprby1IYW5nOmZpbmFsJywgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzprby1MYXRuOmluaXRpYWwnLCByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6a28tTGF0bjppbml0aWFsJywgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6a28tTGF0bjptZWRpYWwnLCAgcmFuazogMiwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmtvLUxhdG46bWVkaWFsJywgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmtvLUxhdG46ZmluYWwnLCAgIHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzprby1MYXRuOmZpbmFsJywgICAgbzogXCJOTlwiLCB9XG4gICAgICBdXG4gICAgZm9yIHJvdyBpbiByb3dzXG4gICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl92ZXJiLnJ1biByb3dcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VzOiAtPlxuICAgIGRlYnVnICfOqWp6cnNkYl9fXzgnLCAnX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VzJ1xuICAgIHBhdGhzID0gZ2V0X3BhdGhzKClcbiAgICAjIGRza2V5ID0gJ2RpY3Q6dWNkOnYxNC4wOnVoZGlkeCc7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MicsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIGRza2V5ID0gJ2RpY3Q6bWVhbmluZ3MnOyAgICAgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEnLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkaWN0Ong6a28tSGFuZytMYXRuJzsgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0yJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZGljdDp4OmphLUthbitMYXRuJzsgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MycsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZGljdDpqYTprYW5qaXVtJzsgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9NCcsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZGljdDpqYTprYW5qaXVtOmF1eCc7ICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9NScsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZGljdDprbzpWPWRhdGEtZ292LmNzdic7ICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9NicsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZGljdDprbzpWPWRhdGEtZ292Lmpzb24nOyAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9NycsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZGljdDprbzpWPWRhdGEtbmF2ZXIuY3N2JzsgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9OCcsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZGljdDprbzpWPWRhdGEtbmF2ZXIuanNvbic7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9OScsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZGljdDprbzpWPVJFQURNRS5tZCc7ICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MTAnLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICA7bnVsbFxuXG4gICMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIF9vbl9vcGVuX3BvcHVsYXRlX3ZlcmJzOiAtPlxuICAjICAgcGF0aHMgPSBnZXRfcGF0aHMoKVxuICAjICAgZHNrZXkgPSAnZGljdDptZWFuaW5ncyc7ICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICMgICBkc2tleSA9ICdkaWN0OnVjZDp2MTQuMDp1aGRpZHgnOyAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTInLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgIyAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzOiAtPlxuICAgIGRlYnVnICfOqWp6cnNkYl9fXzknLCAnX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9saW5lcydcbiAgICBAc3RhdGVtZW50cy5wb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzLnJ1bigpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlc19mb3JfbWVhbmluZ3M6IC0+XG4gICAgIyA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0OiAoIG5hbWUsIGZpZWxkcy4uLiApIC0+XG4gICAgIyBkZWJ1ZyAnzqlqenJzZGJfXzEwJywgeyBuYW1lLCBmaWVsZHMsIH1cbiAgICBAc3RhdGUubW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93ID0geyBuYW1lLCBmaWVsZHMsIH1cbiAgICA7bnVsbFxuXG4gICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgQGZ1bmN0aW9uczpcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0OlxuICAgICAgIyMjIE5PVEUgaW4gdGhlIGZ1dHVyZSB0aGlzIGZ1bmN0aW9uIGNvdWxkIHRyaWdnZXIgY3JlYXRpb24gb2YgdHJpZ2dlcnMgb24gaW5zZXJ0cyAjIyNcbiAgICAgIGRldGVybWluaXN0aWM6ICB0cnVlXG4gICAgICB2YXJhcmdzOiAgICAgICAgdHJ1ZVxuICAgICAgY2FsbDogKCBuYW1lLCBmaWVsZHMuLi4gKSAtPiBAdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0IG5hbWUsIGZpZWxkcy4uLlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAjIyMgTk9URSBtb3ZlZCB0byBEYnJpY19zdGQ7IGNvbnNpZGVyIHRvIG92ZXJ3cml0ZSB3aXRoIHZlcnNpb24gdXNpbmcgYHNsZXZpdGhhbi9yZWdleGAgIyMjXG4gICAgIyByZWdleHA6XG4gICAgIyAgIG92ZXJ3cml0ZTogICAgICB0cnVlXG4gICAgIyAgIGRldGVybWluaXN0aWM6ICB0cnVlXG4gICAgIyAgIGNhbGw6ICggcGF0dGVybiwgdGV4dCApIC0+IGlmICggKCBuZXcgUmVnRXhwIHBhdHRlcm4sICd2JyApLnRlc3QgdGV4dCApIHRoZW4gMSBlbHNlIDBcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaXNfdWNfbm9ybWFsOlxuICAgICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAgICMjIyBOT1RFOiBhbHNvIHNlZSBgU3RyaW5nOjppc1dlbGxGb3JtZWQoKWAgIyMjXG4gICAgICBjYWxsOiAoIHRleHQsIGZvcm0gPSAnTkZDJyApIC0+IGZyb21fYm9vbCB0ZXh0IGlzIHRleHQubm9ybWFsaXplIGZvcm0gIyMjICdORkMnLCAnTkZEJywgJ05GS0MnLCBvciAnTkZLRCcgIyMjXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBAdGFibGVfZnVuY3Rpb25zOlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBzcGxpdF93b3JkczpcbiAgICAgIGNvbHVtbnM6ICAgICAgWyAna2V5d29yZCcsIF1cbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAnbGluZScsIF1cbiAgICAgIHJvd3M6ICggbGluZSApIC0+XG4gICAgICAgIGtleXdvcmRzID0gbGluZS5zcGxpdCAvKD86XFxwe1p9Kyl8KCg/OlxccHtTY3JpcHQ9SGFufSl8KD86XFxwe0x9Kyl8KD86XFxwe059Kyl8KD86XFxwe1N9KykpL3ZcbiAgICAgICAgZm9yIGtleXdvcmQgaW4ga2V5d29yZHNcbiAgICAgICAgICBjb250aW51ZSB1bmxlc3Mga2V5d29yZD9cbiAgICAgICAgICBjb250aW51ZSBpZiBrZXl3b3JkIGlzICcnXG4gICAgICAgICAgeWllbGQgeyBrZXl3b3JkLCB9XG4gICAgICAgIDtudWxsXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGZpbGVfbGluZXM6XG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2xpbmVfbnInLCAnbGNvZGUnLCAnbGluZScsICdqZmllbGRzJyBdXG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ3BhdGgnLCBdXG4gICAgICByb3dzOiAoIHBhdGggKSAtPlxuICAgICAgICBmb3IgeyBsbnI6IGxpbmVfbnIsIGxpbmUsIGVvbCwgfSBmcm9tIHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgcGF0aFxuICAgICAgICAgIGxpbmUgICAgPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5ub3JtYWxpemVfdGV4dCBsaW5lXG4gICAgICAgICAgamZpZWxkcyA9IG51bGxcbiAgICAgICAgICBzd2l0Y2ggdHJ1ZVxuICAgICAgICAgICAgd2hlbiAvXlxccyokL3YudGVzdCBsaW5lXG4gICAgICAgICAgICAgIGxjb2RlID0gJ0InXG4gICAgICAgICAgICB3aGVuIC9eXFxzKiMvdi50ZXN0IGxpbmVcbiAgICAgICAgICAgICAgbGNvZGUgPSAnQydcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgbGNvZGUgPSAnRCdcbiAgICAgICAgICAgICAgamZpZWxkcyAgID0gSlNPTi5zdHJpbmdpZnkgbGluZS5zcGxpdCAnXFx0J1xuICAgICAgICAgIHlpZWxkIHsgbGluZV9uciwgbGNvZGUsIGxpbmUsIGpmaWVsZHMsIH1cbiAgICAgICAgO251bGxcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgZ2V0X3RyaXBsZXM6XG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ3Jvd2lkX2luJywgJ2Rza2V5JywgJ2pmaWVsZHMnLCBdXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ3Jvd2lkX291dCcsICdyZWYnLCAncycsICd2JywgJ28nLCBdXG4gICAgICByb3dzOiAoIHJvd2lkX2luLCBkc2tleSwgamZpZWxkcyApIC0+XG4gICAgICAgIGZpZWxkcyAgPSBKU09OLnBhcnNlIGpmaWVsZHNcbiAgICAgICAgZW50cnkgICA9IGZpZWxkc1sgMiBdXG4gICAgICAgIHN3aXRjaCBkc2tleVxuICAgICAgICAgIHdoZW4gJ2RpY3Q6eDprby1IYW5nK0xhdG4nICAgICAgICB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXRzX2Zyb21fZGljdF94X2tvX0hhbmdfTGF0biAgICAgIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICAgd2hlbiAnZGljdDptZWFuaW5ncycgdGhlbiBzd2l0Y2ggdHJ1ZVxuICAgICAgICAgICAgd2hlbiAoIGVudHJ5LnN0YXJ0c1dpdGggJ3B5OicgKSB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXRzX2Zyb21fY19yZWFkaW5nX3poX0xhdG5fcGlueWluIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICAgICB3aGVuICggZW50cnkuc3RhcnRzV2l0aCAna2E6JyApIHRoZW4geWllbGQgZnJvbSBAdHJpcGxldHNfZnJvbV9jX3JlYWRpbmdfamFfeF9LYW4gICAgICAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgICAgIHdoZW4gKCBlbnRyeS5zdGFydHNXaXRoICdoaTonICkgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGV0c19mcm9tX2NfcmVhZGluZ19qYV94X0thbiAgICAgICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAgICAgd2hlbiAoIGVudHJ5LnN0YXJ0c1dpdGggJ2hnOicgKSB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXRzX2Zyb21fY19yZWFkaW5nX2tvX0hhbmcgICAgICAgIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICMgeWllbGQgZnJvbSBAZ2V0X3RyaXBsZXMgcm93aWRfaW4sIGRza2V5LCBqZmllbGRzXG4gICAgICAgIDtudWxsXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGRpc2Fzc2VtYmxlX2hhbmdldWw6XG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ2hhbmcnLCBdXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2luaXRpYWwnLCAnbWVkaWFsJywgJ2ZpbmFsJywgXVxuICAgICAgcm93czogKCBoYW5nICkgLT5cbiAgICAgICAgamFtb3MgPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5fVE1QX2hhbmdldWwuZGlzYXNzZW1ibGUgaGFuZywgeyBmbGF0dGVuOiBmYWxzZSwgfVxuICAgICAgICBmb3IgeyBmaXJzdDogaW5pdGlhbCwgdm93ZWw6IG1lZGlhbCwgbGFzdDogZmluYWwsIH0gaW4gamFtb3NcbiAgICAgICAgICB5aWVsZCB7IGluaXRpYWwsIG1lZGlhbCwgZmluYWwsIH1cbiAgICAgICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaXBsZXRzX2Zyb21fZGljdF94X2tvX0hhbmdfTGF0bjogKCByb3dpZF9pbiwgZHNrZXksIFsgcm9sZSwgcywgbywgXSApIC0+XG4gICAgcmVmICAgICAgID0gcm93aWRfaW5cbiAgICB2ICAgICAgICAgPSBcIng6a28tSGFuZytMYXRuOiN7cm9sZX1cIlxuICAgIG8gICAgICAgID89ICcnXG4gICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2LCBvLCB9XG4gICAgQHN0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlwbGV0c19mcm9tX2NfcmVhZGluZ196aF9MYXRuX3BpbnlpbjogKCByb3dpZF9pbiwgZHNrZXksIFsgXywgcywgZW50cnksIF0gKSAtPlxuICAgIHJlZiAgICAgICA9IHJvd2lkX2luXG4gICAgdiAgICAgICAgID0gJ2M6cmVhZGluZzp6aC1MYXRuLXBpbnlpbidcbiAgICBmb3IgcmVhZGluZyBmcm9tIEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfYXRvbmFsX3poX3JlYWRpbmdzIGVudHJ5XG4gICAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHYsIG86IHJlYWRpbmcsIH1cbiAgICBAc3RhdGUudGltZWl0X3Byb2dyZXNzPygpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaXBsZXRzX2Zyb21fY19yZWFkaW5nX2phX3hfS2FuOiAoIHJvd2lkX2luLCBkc2tleSwgWyBfLCBzLCBlbnRyeSwgXSApIC0+XG4gICAgcmVmICAgICAgID0gcm93aWRfaW5cbiAgICBpZiBlbnRyeS5zdGFydHNXaXRoICdrYTonXG4gICAgICB2X3hfS2FuICAgPSAnYzpyZWFkaW5nOmphLXgtS2F0J1xuICAgICAgdl9MYXRuICAgID0gJ2M6cmVhZGluZzpqYS14LUthdCtMYXRuJ1xuICAgIGVsc2VcbiAgICAgIHZfeF9LYW4gICA9ICdjOnJlYWRpbmc6amEteC1IaXInXG4gICAgICB2X0xhdG4gICAgPSAnYzpyZWFkaW5nOmphLXgtSGlyK0xhdG4nXG4gICAgZm9yIHJlYWRpbmcgZnJvbSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5leHRyYWN0X2phX3JlYWRpbmdzIGVudHJ5XG4gICAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6IHZfeF9LYW4sIG86IHJlYWRpbmcsIH1cbiAgICAgICMgZm9yIHRyYW5zY3JpcHRpb24gZnJvbSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5yb21hbml6ZV9qYV9rYW5hIHJlYWRpbmdcbiAgICAgICMgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6IHZfTGF0biwgbzogdHJhbnNjcmlwdGlvbiwgfVxuICAgICAgdHJhbnNjcmlwdGlvbiA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLnJvbWFuaXplX2phX2thbmEgcmVhZGluZ1xuICAgICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiB2X0xhdG4sIG86IHRyYW5zY3JpcHRpb24sIH1cbiAgICBAc3RhdGUudGltZWl0X3Byb2dyZXNzPygpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaXBsZXRzX2Zyb21fY19yZWFkaW5nX2tvX0hhbmc6ICggcm93aWRfaW4sIGRza2V5LCBbIF8sIHMsIGVudHJ5LCBdICkgLT5cbiAgICByZWYgICAgICAgPSByb3dpZF9pblxuICAgIHYgICAgICAgICA9ICdjOnJlYWRpbmc6a28tSGFuZydcbiAgICBmb3IgcmVhZGluZyBmcm9tIEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfaGdfcmVhZGluZ3MgZW50cnlcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdiwgbzogcmVhZGluZywgfVxuICAgIEBzdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICA7bnVsbFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgTGFuZ3VhZ2Vfc2VydmljZXNcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBfVE1QX2hhbmdldWwgPSByZXF1aXJlICdoYW5ndWwtZGlzYXNzZW1ibGUnXG4gICAgQF9UTVBfa2FuYSAgICA9IHJlcXVpcmUgJ3dhbmFrYW5hJ1xuICAgICMgeyB0b0hpcmFnYW5hLFxuICAgICMgICB0b0thbmEsXG4gICAgIyAgIHRvS2F0YWthbmFcbiAgICAjICAgdG9Sb21hamksXG4gICAgIyAgIHRva2VuaXplLCAgICAgICAgIH0gPSByZXF1aXJlICd3YW5ha2FuYSdcbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBub3JtYWxpemVfdGV4dDogKCB0ZXh0LCBmb3JtID0gJ05GQycgKSAtPiB0ZXh0Lm5vcm1hbGl6ZSBmb3JtXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICByZW1vdmVfcGlueWluX2RpYWNyaXRpY3M6ICggdGV4dCApIC0+ICggdGV4dC5ub3JtYWxpemUgJ05GS0QnICkucmVwbGFjZSAvXFxQe0x9L2d2LCAnJ1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZXh0cmFjdF9hdG9uYWxfemhfcmVhZGluZ3M6ICggZW50cnkgKSAtPlxuICAgICMgcHk6emjDuSwgemhlLCB6aMSBbywgemjDoW8sIHpox5QsIHrEq1xuICAgIFIgPSBlbnRyeVxuICAgIFIgPSBSLnJlcGxhY2UgL15weTovdiwgJydcbiAgICBSID0gUi5zcGxpdCAvLFxccyovdlxuICAgIFIgPSAoICggQHJlbW92ZV9waW55aW5fZGlhY3JpdGljcyB6aF9yZWFkaW5nICkgZm9yIHpoX3JlYWRpbmcgaW4gUiApXG4gICAgUiA9IG5ldyBTZXQgUlxuICAgIFIuZGVsZXRlICdudWxsJ1xuICAgIFIuZGVsZXRlICdAbnVsbCdcbiAgICByZXR1cm4gWyBSLi4uLCBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBleHRyYWN0X2phX3JlYWRpbmdzOiAoIGVudHJ5ICkgLT5cbiAgICAjIOepuiAgICAgIGhpOuOBneOCiSwg44GCwrco44GPfOOBjXzjgZHjgospLCDjgYvjgoksIOOBmcK3KOOBj3zjgYvjgZkpLCDjgoDjgarCt+OBl+OBhFxuICAgIFIgPSBlbnRyeVxuICAgIFIgPSBSLnJlcGxhY2UgL14oPzpoaXxrYSk6L3YsICcnXG4gICAgUiA9IFIucmVwbGFjZSAvXFxzKy9ndiwgJydcbiAgICBSID0gUi5zcGxpdCAvLFxccyovdlxuICAgICMjIyBOT1RFIHJlbW92ZSBuby1yZWFkaW5ncyBtYXJrZXIgYEBudWxsYCBhbmQgY29udGV4dHVhbCByZWFkaW5ncyBsaWtlIC3jg43jg7MgZm9yIOe4gSwgLeODjuOCpiBmb3Ig546LICMjI1xuICAgIFIgPSAoIHJlYWRpbmcgZm9yIHJlYWRpbmcgaW4gUiB3aGVuIG5vdCByZWFkaW5nLnN0YXJ0c1dpdGggJy0nIClcbiAgICBSID0gbmV3IFNldCBSXG4gICAgUi5kZWxldGUgJ251bGwnXG4gICAgUi5kZWxldGUgJ0BudWxsJ1xuICAgIHJldHVybiBbIFIuLi4sIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGV4dHJhY3RfaGdfcmVhZGluZ3M6ICggZW50cnkgKSAtPlxuICAgICMg56m6ICAgICAgaGk644Gd44KJLCDjgYLCtyjjgY9844GNfOOBkeOCiyksIOOBi+OCiSwg44GZwrco44GPfOOBi+OBmSksIOOCgOOBqsK344GX44GEXG4gICAgUiA9IGVudHJ5XG4gICAgUiA9IFIucmVwbGFjZSAvXig/OmhnKTovdiwgJydcbiAgICBSID0gUi5yZXBsYWNlIC9cXHMrL2d2LCAnJ1xuICAgIFIgPSBSLnNwbGl0IC8sXFxzKi92XG4gICAgUiA9IG5ldyBTZXQgUlxuICAgIFIuZGVsZXRlICdudWxsJ1xuICAgIFIuZGVsZXRlICdAbnVsbCdcbiAgICBoYW5nZXVsID0gWyBSLi4uLCBdLmpvaW4gJydcbiAgICAjIGRlYnVnICfOqWp6cnNkYl9fMTEnLCBAX1RNUF9oYW5nZXVsLmRpc2Fzc2VtYmxlIGhhbmdldWwsIHsgZmxhdHRlbjogZmFsc2UsIH1cbiAgICByZXR1cm4gWyBSLi4uLCBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICByb21hbml6ZV9qYV9rYW5hOiAoIGVudHJ5ICkgLT5cbiAgICBjZmcgPSB7fVxuICAgIHJldHVybiBAX1RNUF9rYW5hLnRvUm9tYWppIGVudHJ5LCBjZmdcbiAgICAjICMjIyBzeXN0ZW1hdGljIG5hbWUgbW9yZSBsaWtlIGAuLi5famFfeF9rYW5fbGF0bigpYCAjIyNcbiAgICAjIGhlbHAgJ86pZGprcl9fMTInLCB0b0hpcmFnYW5hICAn44Op44O844Oh44OzJywgICAgICAgeyBjb252ZXJ0TG9uZ1Zvd2VsTWFyazogZmFsc2UsIH1cbiAgICAjIGhlbHAgJ86pZGprcl9fMTMnLCB0b0hpcmFnYW5hICAn44Op44O844Oh44OzJywgICAgICAgeyBjb252ZXJ0TG9uZ1Zvd2VsTWFyazogdHJ1ZSwgfVxuICAgICMgaGVscCAnzqlkamtyX18xNCcsIHRvS2FuYSAgICAgICd3YW5ha2FuYScsICAgeyBjdXN0b21LYW5hTWFwcGluZzogeyBuYTogJ+OBqycsIGthOiAnQmFuYScgfSwgfVxuICAgICMgaGVscCAnzqlkamtyX18xNScsIHRvS2FuYSAgICAgICd3YW5ha2FuYScsICAgeyBjdXN0b21LYW5hTWFwcGluZzogeyB3YWthOiAnKOWSjOatjCknLCB3YTogJyjlkowyKScsIGthOiAnKOatjDIpJywgbmE6ICco5ZCNKScsIGthOiAnKEJhbmEpJywgbmFrYTogJyjkuK0pJywgfSwgfVxuICAgICMgaGVscCAnzqlkamtyX18xNicsIHRvUm9tYWppICAgICfjgaTjgZjjgY7jgoonLCAgICAgeyBjdXN0b21Sb21hamlNYXBwaW5nOiB7IOOBmDogJyh6aSknLCDjgaQ6ICcodHUpJywg44KKOiAnKGxpKScsIOOCiuOCh+OBhjogJyhyeW91KScsIOOCiuOChzogJyhyeW8pJyB9LCB9XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjIFRBSU5UIGdvZXMgaW50byBjb25zdHJ1Y3RvciBvZiBKenIgY2xhc3MgIyMjXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgSml6dXJhXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAcGF0aHMgICAgICAgICAgICAgID0gZ2V0X3BhdGhzKClcbiAgICBAbGFuZ3VhZ2Vfc2VydmljZXMgID0gbmV3IExhbmd1YWdlX3NlcnZpY2VzKClcbiAgICBAZGJhICAgICAgICAgICAgICAgID0gbmV3IEp6cl9kYl9hZGFwdGVyIEBwYXRocy5kYiwgeyBob3N0OiBALCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiBAZGJhLmlzX2ZyZXNoXG4gICAgIyMjIFRBSU5UIG1vdmUgdG8gSnpyX2RiX2FkYXB0ZXIgdG9nZXRoZXIgd2l0aCB0cnkvY2F0Y2ggIyMjXG4gICAgICB0cnlcbiAgICAgICAgQHBvcHVsYXRlX21lYW5pbmdfbWlycm9yX3RyaXBsZXMoKVxuICAgICAgY2F0Y2ggY2F1c2VcbiAgICAgICAgZmllbGRzX3JwciA9IHJwciBAZGJhLnN0YXRlLm1vc3RfcmVjZW50X2luc2VydGVkX3Jvd1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fMTcgd2hlbiB0cnlpbmcgdG8gaW5zZXJ0IHRoaXMgcm93OiAje2ZpZWxkc19ycHJ9LCBhbiBlcnJvciB3YXMgdGhyb3duOiAje2NhdXNlLm1lc3NhZ2V9XCIsIFxcXG4gICAgICAgICAgeyBjYXVzZSwgfVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICMjIyBUQUlOVCBtb3ZlIHRvIEp6cl9kYl9hZGFwdGVyIHRvZ2V0aGVyIHdpdGggdHJ5L2NhdGNoICMjI1xuICAgICAgdHJ5XG4gICAgICAgIEBwb3B1bGF0ZV9oYW5nZXVsX3N5bGxhYmxlcygpXG4gICAgICBjYXRjaCBjYXVzZVxuICAgICAgICBmaWVsZHNfcnByID0gcnByIEBkYmEuc3RhdGUubW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93XG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX18xOCB3aGVuIHRyeWluZyB0byBpbnNlcnQgdGhpcyByb3c6ICN7ZmllbGRzX3Jwcn0sIGFuIGVycm9yIHdhcyB0aHJvd246ICN7Y2F1c2UubWVzc2FnZX1cIiwgXFxcbiAgICAgICAgICB7IGNhdXNlLCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBwb3B1bGF0ZV9tZWFuaW5nX21pcnJvcl90cmlwbGVzOiAtPlxuICAgIGRvID0+XG4gICAgICB7IHRvdGFsX3Jvd19jb3VudCwgfSA9ICggQGRiYS5wcmVwYXJlIFNRTFwiXCJcIlxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICAgIGNvdW50KCopIGFzIHRvdGFsX3Jvd19jb3VudFxuICAgICAgICAgIGZyb20ganpyX21pcnJvcl9saW5lc1xuICAgICAgICAgIHdoZXJlIHRydWVcbiAgICAgICAgICAgIGFuZCAoIGRza2V5IGlzICdkaWN0Om1lYW5pbmdzJyApXG4gICAgICAgICAgICBhbmQgKCBqZmllbGRzIGlzIG5vdCBudWxsICkgLS0gTk9URTogbmVjZXNzYXJ5XG4gICAgICAgICAgICBhbmQgKCBub3QgamZpZWxkcy0+PickWzBdJyByZWdleHAgJ15AZ2x5cGhzJyApO1wiXCJcIiApLmdldCgpXG4gICAgICB0b3RhbCA9IHRvdGFsX3Jvd19jb3VudCAqIDIgIyMjIE5PVEUgZXN0aW1hdGUgIyMjXG4gICAgICBoZWxwICfOqWp6cnNkYl9fMTknLCB7IHRvdGFsX3Jvd19jb3VudCwgdG90YWwsIH0gIyB7IHRvdGFsX3Jvd19jb3VudDogNDAwODYsIHRvdGFsOiA4MDE3MiB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBAZGJhLnN0YXRlbWVudHMucG9wdWxhdGVfanpyX21pcnJvcl90cmlwbGVzLnJ1bigpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHBvcHVsYXRlX2hhbmdldWxfc3lsbGFibGVzOiAtPlxuICAgIEBkYmEuc3RhdGVtZW50cy5wb3B1bGF0ZV9qenJfbGFuZ19oYW5nZXVsX3N5bGxhYmxlcy5ydW4oKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBfc2hvd19qenJfbWV0YV91Y19ub3JtYWxpemF0aW9uX2ZhdWx0czogLT5cbiAgIyAgIGZhdWx0eV9yb3dzID0gKCBAZGJhLnByZXBhcmUgU1FMXCJzZWxlY3QgKiBmcm9tIF9qenJfbWV0YV91Y19ub3JtYWxpemF0aW9uX2ZhdWx0cztcIiApLmFsbCgpXG4gICMgICB3YXJuICfOqWp6cnNkYl9fMjAnLCByZXZlcnNlIGZhdWx0eV9yb3dzXG4gICMgICAjIGZvciByb3cgZnJvbVxuICAjICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzaG93X2NvdW50czogLT5cbiAgICBkbyA9PlxuICAgICAgcXVlcnkgPSBTUUxcInNlbGVjdCB2LCBjb3VudCgqKSBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGdyb3VwIGJ5IHY7XCJcbiAgICAgIGVjaG8gKCBncmV5ICfOqWp6cnNkYl9fMjEnICksICggZ29sZCByZXZlcnNlIGJvbGQgcXVlcnkgKVxuICAgICAgY291bnRzID0gKCBAZGJhLnByZXBhcmUgcXVlcnkgKS5hbGwoKVxuICAgICAgY29uc29sZS50YWJsZSBjb3VudHNcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRvID0+XG4gICAgICBxdWVyeSA9IFNRTFwic2VsZWN0IHYsIGNvdW50KCopIGZyb20ganpyX3RyaXBsZXMgZ3JvdXAgYnkgdjtcIlxuICAgICAgZWNobyAoIGdyZXkgJ86panpyc2RiX18yMicgKSwgKCBnb2xkIHJldmVyc2UgYm9sZCBxdWVyeSApXG4gICAgICBjb3VudHMgPSAoIEBkYmEucHJlcGFyZSBxdWVyeSApLmFsbCgpXG4gICAgICBjb25zb2xlLnRhYmxlIGNvdW50c1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZG8gPT5cbiAgICAgIHF1ZXJ5ID0gU1FMXCJcIlwiXG4gICAgICAgIHNlbGVjdCBkc2tleSwgY291bnQoKikgYXMgY291bnQgZnJvbSBqenJfbWlycm9yX2xpbmVzIGdyb3VwIGJ5IGRza2V5IHVuaW9uIGFsbFxuICAgICAgICBzZWxlY3QgJyonLCAgIGNvdW50KCopIGFzIGNvdW50IGZyb20ganpyX21pcnJvcl9saW5lc1xuICAgICAgICBvcmRlciBieSBjb3VudDtcIlwiXCJcbiAgICAgIGVjaG8gKCBncmV5ICfOqWp6cnNkYl9fMjMnICksICggZ29sZCByZXZlcnNlIGJvbGQgcXVlcnkgKVxuICAgICAgY291bnRzID0gKCBAZGJhLnByZXBhcmUgcXVlcnkgKS5hbGwoKVxuICAgICAgY291bnRzID0gT2JqZWN0LmZyb21FbnRyaWVzICggWyBkc2tleSwgeyBjb3VudCwgfSwgXSBmb3IgeyBkc2tleSwgY291bnQsIH0gaW4gY291bnRzIClcbiAgICAgIGNvbnNvbGUudGFibGUgY291bnRzXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2hvd19qenJfbWV0YV9mYXVsdHM6IC0+XG4gICAgaWYgKCBmYXVsdHlfcm93cyA9ICggQGRiYS5wcmVwYXJlIFNRTFwic2VsZWN0ICogZnJvbSBqenJfbWV0YV9mYXVsdHM7XCIgKS5hbGwoKSApLmxlbmd0aCA+IDBcbiAgICAgIGVjaG8gJ86panpyc2RiX18yNCcsIHJlZCByZXZlcnNlIGJvbGQgXCIgZm91bmQgc29tZSBmYXVsdHM6IFwiXG4gICAgICBjb25zb2xlLnRhYmxlIGZhdWx0eV9yb3dzXG4gICAgZWxzZVxuICAgICAgZWNobyAnzqlqenJzZGJfXzI1JywgbGltZSByZXZlcnNlIGJvbGQgXCIgKG5vIGZhdWx0cykgXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDtudWxsXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZGVtbyA9IC0+XG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMganpyLl9zaG93X2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzKClcbiAganpyLnNob3dfY291bnRzKClcbiAganpyLnNob3dfanpyX21ldGFfZmF1bHRzKClcbiAgIyBjOnJlYWRpbmc6amEteC1IaXJcbiAgIyBjOnJlYWRpbmc6amEteC1LYXRcbiAgaWYgZmFsc2VcbiAgICBzZWVuID0gbmV3IFNldCgpXG4gICAgZm9yIHsgcmVhZGluZywgfSBmcm9tIGp6ci5kYmEud2FsayBTUUxcInNlbGVjdCBkaXN0aW5jdCggbyApIGFzIHJlYWRpbmcgZnJvbSBqenJfdHJpcGxlcyB3aGVyZSB2ID0gJ2M6cmVhZGluZzpqYS14LUthdCcgb3JkZXIgYnkgbztcIlxuICAgICAgZm9yIHBhcnQgaW4gKCByZWFkaW5nLnNwbGl0IC8oLuODvHwu44OjfC7jg6V8LuODp3zjg4MufC4pL3YgKSB3aGVuIHBhcnQgaXNudCAnJ1xuICAgICAgICBjb250aW51ZSBpZiBzZWVuLmhhcyBwYXJ0XG4gICAgICAgIHNlZW4uYWRkIHBhcnRcbiAgICAgICAgZWNobyBwYXJ0XG4gICAgZm9yIHsgcmVhZGluZywgfSBmcm9tIGp6ci5kYmEud2FsayBTUUxcInNlbGVjdCBkaXN0aW5jdCggbyApIGFzIHJlYWRpbmcgZnJvbSBqenJfdHJpcGxlcyB3aGVyZSB2ID0gJ2M6cmVhZGluZzpqYS14LUhpcicgb3JkZXIgYnkgbztcIlxuICAgICAgZm9yIHBhcnQgaW4gKCByZWFkaW5nLnNwbGl0IC8oLuODvHwu44KDfC7jgoV8LuOCh3zjgaMufC4pL3YgKSB3aGVuIHBhcnQgaXNudCAnJ1xuICAgICAgIyBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLyguKS92ICkgd2hlbiBwYXJ0IGlzbnQgJydcbiAgICAgICAgY29udGludWUgaWYgc2Vlbi5oYXMgcGFydFxuICAgICAgICBzZWVuLmFkZCBwYXJ0XG4gICAgICAgIGVjaG8gcGFydFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIDtudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZGVtb19yZWFkX2R1bXAgPSAtPlxuICB7IEJlbmNobWFya2VyLCAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfYmVuY2htYXJraW5nKClcbiAgIyB7IG5hbWVpdCwgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfbmFtZWl0KClcbiAgYmVuY2htYXJrZXIgPSBuZXcgQmVuY2htYXJrZXIoKVxuICB0aW1laXQgPSAoIFAuLi4gKSAtPiBiZW5jaG1hcmtlci50aW1laXQgUC4uLlxuICB7IFVuZHVtcGVyLCAgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfc3FsaXRlX3VuZHVtcGVyKClcbiAgeyB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zLCAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2Zhc3RfbGluZXJlYWRlcigpXG4gIHsgd2MsICAgICAgICAgICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV93YygpXG4gIHBhdGggICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4vanpyLmR1bXAuc3FsJ1xuICBqenIgPSBuZXcgSml6dXJhKClcbiAganpyLmRiYS50ZWFyZG93biB7IHRlc3Q6ICcqJywgfVxuICBkZWJ1ZyAnzqlqenJzZGJfXzI2JywgVW5kdW1wZXIudW5kdW1wIHsgZGI6IGp6ci5kYmEsIHBhdGgsIG1vZGU6ICdmYXN0JywgfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGp6ci5zaG93X2NvdW50cygpXG4gIGp6ci5zaG93X2p6cl9tZXRhX2ZhdWx0cygpXG4gIDtudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5pZiBtb2R1bGUgaXMgcmVxdWlyZS5tYWluIHRoZW4gZG8gPT5cbiAgZGVtbygpXG4gICMgZGVtb19yZWFkX2R1bXAoKVxuICA7bnVsbFxuXG4iXX0=
