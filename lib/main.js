(function() {
  'use strict';
  var Async_jetstream, Benchmarker, Bsql3, Dbric, Dbric_std, FS, GUY, IDL, IDLX, Jetstream, Jizura, Jzr_db_adapter, Language_services, PATH, SFMODULES, SQL, alert, as_bool, benchmarker, blue, bold, debug, demo, demo_read_dump, demo_source_identifiers, echo, freeze, from_bool, get_paths, gold, green, grey, help, info, inspect, lets, lime, log, plain, praise, red, reverse, rpr, set_getter, timeit, type_of, urge, walk_lines_with_positions, warn, whisper, white;

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

  ({IDL, IDLX} = require('mojikura-idl'));

  ({type_of} = SFMODULES.unstable.require_type_of());

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
  /*

                           .   oooo
                         .o8   `888
  oo.ooooo.   .oooo.   .o888oo  888 .oo.    .oooo.o
   888' `88b `P  )88b    888    888P"Y88b  d88(  "8
   888   888  .oP"888    888    888   888  `"Y88b.
   888   888 d8(  888    888 .  888   888  o.  )88b
   888bod8P' `Y888""8o   "888" o888o o888o 8""888P'
   888
  o888o

  */
  //===========================================================================================================
  get_paths = function() {
    var R, kanjium, rutopio;
    R = {};
    R.base = PATH.resolve(__dirname, '..');
    R.jzr = PATH.resolve(R.base, '..');
    R.db = PATH.join(R.base, 'jzr.db');
    // R.db                                = '/dev/shm/jzr.db'
    // R.jzrds                             = PATH.join R.base, 'jzrds'
    R.jzrnds = PATH.join(R.base, 'jizura-new-datasources');
    R.mojikura = PATH.join(R.jzrnds, 'mojikura');
    R.raw_github = PATH.join(R.jzrnds, 'bvfs/origin/https/raw.githubusercontent.com');
    kanjium = PATH.join(R.raw_github, 'mifunetoshiro/kanjium/8a0cdaa16d64a281a2048de2eee2ec5e3a440fa6');
    rutopio = PATH.join(R.raw_github, 'rutopio/Korean-Name-Hanja-Charset/12df1ba1b4dfaa095813e4ddfba424e816f94c53');
    // R[ 'dict:ucd:v14.0:uhdidx'      ]   = PATH.join R.jzrnds, 'unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt'
    R['dict:x:ko-Hang+Latn'] = PATH.join(R.jzrnds, 'hangeul-transcriptions.tsv');
    R['dict:x:ja-Kan+Latn'] = PATH.join(R.jzrnds, 'kana-transcriptions.tsv');
    R['dict:bcp47'] = PATH.join(R.jzrnds, 'BCP47-language-scripts-regions.tsv');
    R['dict:ja:kanjium'] = PATH.join(kanjium, 'data/source_files/kanjidict.txt');
    R['dict:ja:kanjium:aux'] = PATH.join(kanjium, 'data/source_files/0_README.txt');
    R['dict:ko:V=data-gov.csv'] = PATH.join(rutopio, 'data-gov.csv');
    R['dict:ko:V=data-gov.json'] = PATH.join(rutopio, 'data-gov.json');
    R['dict:ko:V=data-naver.csv'] = PATH.join(rutopio, 'data-naver.csv');
    R['dict:ko:V=data-naver.json'] = PATH.join(rutopio, 'data-naver.json');
    R['dict:ko:V=README.md'] = PATH.join(rutopio, 'README.md');
    R['dict:meanings'] = PATH.join(R.mojikura, 'meaning/meanings.txt');
    R['shape:idsv2'] = PATH.join(R.mojikura, 'shape/shape-breakdown-formula-v2.txt');
    R['shape:zhz5bf'] = PATH.join(R.mojikura, 'shape/shape-strokeorder-zhaziwubifa.txt');
    R['ucdb:rsgs'] = PATH.join(R.mojikura, 'ucdb/cfg/rsgs-and-blocks.md');
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
        }
        //.......................................................................................................
        void 0;
      }

      //=========================================================================================================
      /*

                                                    oooo                .
                                                    `888              .o8
        oo.ooooo.   .ooooo.  oo.ooooo.  oooo  oooo   888   .oooo.   .o888oo  .ooooo.
         888' `88b d88' `88b  888' `88b `888  `888   888  `P  )88b    888   d88' `88b
         888   888 888   888  888   888  888   888   888   .oP"888    888   888ooo888
         888   888 888   888  888   888  888   888   888  d8(  888    888 . 888    .o
         888bod8P' `Y8bod8P'  888bod8P'  `V88V"V8P' o888o `Y888""8o   "888" `Y8bod8P'
         888                  888
        o888o                o888o

      */
      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_mirror_lcodes() {
        debug('Ωjzrsdb__11', '_on_open_populate_jzr_mirror_lcodes');
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
        debug('Ωjzrsdb__12', '_on_open_populate_jzr_mirror_verbs');
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
          },
          {
            rowid: 't:mr:vb:V=c:shape:ids:shortest',
            rank: 1,
            s: "NN",
            v: 'c:shape:ids:shortest',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:shape:ids:shortest:ast',
            rank: 2,
            s: "NN",
            v: 'c:shape:ids:shortest:ast',
            o: "NN"
          },
          {
            rowid: 't:mr:vb:V=c:shape:ids:shortest:error',
            rank: 2,
            s: "NN",
            v: 'c:shape:ids:shortest:error',
            o: "NN"
          }
        ];
// { rowid: 't:mr:vb:V=c:shape:ids:has-operator',    rank: 2, s: "NN", v: 'c:shape:ids:has-operator',   o: "NN", }
// { rowid: 't:mr:vb:V=c:shape:ids:has-component',   rank: 2, s: "NN", v: 'c:shape:ids:has-component',  o: "NN", }
        for (i = 0, len = rows.length; i < len; i++) {
          row = rows[i];
          this.statements.insert_jzr_mirror_verb.run(row);
        }
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_datasources() {
        var dskey, paths;
        debug('Ωjzrsdb__13', '_on_open_populate_jzr_datasources');
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
        dskey = 'shape:idsv2';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=11',
          dskey,
          path: paths[dskey]
        });
        dskey = 'shape:zhz5bf';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=12',
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
        debug('Ωjzrsdb__14', '_on_open_populate_jzr_mirror_lines');
        this.statements.populate_jzr_mirror_lines.run();
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      trigger_on_before_insert(name, ...fields) {
        // debug 'Ωjzrsdb__15', { name, fields, }
        this.state.most_recent_inserted_row = {name, fields};
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      * triples_from_dict_x_ko_Hang_Latn(rowid_in, dskey, [role, s, o]) {
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
      * triples_from_c_reading_zh_Latn_pinyin(rowid_in, dskey, [_, s, entry]) {
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
      * triples_from_c_reading_ja_x_Kan(rowid_in, dskey, [_, s, entry]) {
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
      * triples_from_c_reading_ko_Hang(rowid_in, dskey, [_, s, entry]) {
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

      //---------------------------------------------------------------------------------------------------------
      * triples_from_shape_idsv2(rowid_in, dskey, [_, s, formula]) {
        var base, error, formula_ast, o, ref;
        ref = rowid_in;
        if ((formula == null) || (formula === '')) {
          // for reading from @host.language_services.parse_ids formula
          //   yield { rowid_out: @next_triple_rowid, ref, s, v, o: reading, }
          return null;
        }
        yield ({
          //.......................................................................................................
          rowid_out: this.next_triple_rowid,
          ref,
          s,
          v: 'c:shape:ids:shortest',
          o: formula
        });
        //.......................................................................................................
        error = null;
        try {
          formula_ast = this.host.language_services.parse_idlx(formula);
        } catch (error1) {
          error = error1;
          o = JSON.stringify({
            ref: 'Ωjzrsdb__16',
            message: error.message,
            row: {rowid_in, dskey, s, formula}
          });
          warn(`error: ${o}`);
          yield ({
            rowid_out: this.next_triple_rowid,
            ref,
            s,
            v: 'c:shape:ids:shortest:error',
            o
          });
        }
        if (error != null) {
          return null;
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
    /*

       .o8                    o8o  oooo        .o8
      "888                    `"'  `888       "888
       888oooo.  oooo  oooo  oooo   888   .oooo888
       d88' `88b `888  `888  `888   888  d88' `888
       888   888  888   888   888   888  888   888
       888   888  888   888   888   888  888   888
       `Y8bod8P'  `V88V"V8P' o888o o888o `Y8bod88P"

    */
    //=========================================================================================================
    Jzr_db_adapter.build = [
      //.......................................................................................................
      SQL`create table jzr_glyphranges (
  rowid     text    unique  not null,
  lo        integer         not null,
  hi        integer         not null,
  lo_glyph  text            generated always as ( char( lo ) ) stored,
  hi_glyph  text            generated always as ( char( hi ) ) stored,
primary key ( rowid ),
constraint "Ωconstraint___6" check ( lo between 0x000000 and 0x10ffff ),
constraint "Ωconstraint___7" check ( hi between 0x000000 and 0x10ffff ),
constraint "Ωconstraint___8" check ( lo <= hi ),
constraint "Ωconstraint___9" check ( rowid regexp '^.*$')
);`,
      //.......................................................................................................
      SQL`create table jzr_glyphsets (
  rowid       text    unique  not null,
  name        text    not null,
  glyphrange  text    not null,
primary key ( rowid ),
foreign key ( glyphrange ) references jzr_glyphranges ( rowid ),
constraint "Ωconstraint__10" check ( rowid regexp '^.*$')
);`,
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
  rowid     text    unique  not null generated always as ( 't:mr:ln:ds=' || dskey || ':L=' || line_nr ) stored,
  ref       text    unique  not null generated always as (                  dskey || ':L=' || line_nr ) virtual,
  dskey     text            not null,
  line_nr   integer         not null,
  lcode     text            not null,
  line      text            not null,
  jfields   json                null,
-- primary key ( rowid ),                           -- ### NOTE Experimental: no explicit PK, instead generated \`rowid\` column
-- check ( rowid regexp '^t:mr:ln:ds=.+:L=\\d+$'),  -- ### NOTE no need to check as value is generated ###
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
      //=======================================================================================================
      SQL`create view jzr_cjk_agg_latn as
select distinct
    s                             as s,
    v || ':all'                   as v,
    json_group_array( o ) over w  as os
  from jzr_top_triples
  where v in ( 'c:reading:zh-Latn-pinyin','c:reading:ja-x-Kat+Latn', 'c:reading:ko-Latn')
  window w as ( partition by s, v order by o
    rows between unbounded preceding and unbounded following )
  order by s, v, os
;`,
      //-------------------------------------------------------------------------------------------------------
      SQL`create view jzr_cjk_agg2_latn as
select distinct
    tt1.s   as s,
    tt2.os  as readings_zh,
    tt3.os  as readings_ja,
    tt4.os  as readings_ko
  from      jzr_cjk_agg_latn as tt1
  left join jzr_cjk_agg_latn as tt2 on ( tt1.s = tt2.s and tt2.v = 'c:reading:zh-Latn-pinyin:all' )
  left join jzr_cjk_agg_latn as tt3 on ( tt1.s = tt3.s and tt3.v = 'c:reading:ja-x-Kat+Latn:all'  )
  left join jzr_cjk_agg_latn as tt4 on ( tt1.s = tt4.s and tt4.v = 'c:reading:ko-Latn:all'        )
  order by s
;`,
      //-------------------------------------------------------------------------------------------------------
      SQL`create view jzr_reading_pairs_zh_ja as
select distinct
    t1.s      as s,
    t2.value  as reading_zh,
    t3.value  as reading_ja
  from jzr_cjk_agg2_latn as t1,
  json_each( t1.readings_zh ) as t2,
  json_each( t1.readings_ja ) as t3
  where reading_zh not in ( 'yu', 'chi' ) -- exclude non-homophones
  order by t2.value, t3.value
;`,
      //-------------------------------------------------------------------------------------------------------
      SQL`create view jzr_reading_pairs_zh_ja_agg as
select distinct
    reading_zh,
    reading_ja,
    json_group_array( s ) over w as chrs
  from jzr_reading_pairs_zh_ja as t1
  window w as ( partition by t1.reading_zh, t1.reading_ja order by t1.s
    rows between unbounded preceding and unbounded following )
order by reading_zh, reading_ja
;`,
      //-------------------------------------------------------------------------------------------------------
      SQL`create view jzr_reading_pairs_zh_ko as
select distinct
    t1.s      as s,
    t2.value  as reading_zh,
    t3.value  as reading_ko
  from jzr_cjk_agg2_latn as t1,
  json_each( t1.readings_zh ) as t2,
  json_each( t1.readings_ko ) as t3
  where reading_zh not in ( 'yu', 'chi' ) -- exclude non-homophones
  order by t2.value, t3.value
;`,
      //-------------------------------------------------------------------------------------------------------
      SQL`create view jzr_reading_pairs_zh_ko_agg as
select distinct
    reading_zh,
    reading_ko,
    json_group_array( s ) over w as chrs
  from jzr_reading_pairs_zh_ko as t1
  window w as ( partition by t1.reading_zh, t1.reading_ko order by t1.s
    rows between unbounded preceding and unbounded following )
order by reading_zh, reading_ko
;`,
      //-------------------------------------------------------------------------------------------------------
      SQL`create view jzr_equivalent_reading_triples as
select
    t1.reading_zh as reading_zh,
    t1.reading_ja as reading_ja,
    t2.reading_ko as reading_ko,
    t1.s          as s
  from jzr_reading_pairs_zh_ja as t1
  join jzr_reading_pairs_zh_ko as t2 on ( t1.s = t2.s and t1.reading_zh = t2.reading_ko )
  where t1.reading_zh = t1.reading_ja
  order by t1.reading_zh, t1.s
;`,
      //-------------------------------------------------------------------------------------------------------
      SQL`create view jzr_band_names as
select distinct
    t1.s                                  as c1,
    t2.s                                  as c2,
    t1.reading_zh || ' ' || t2.reading_zh as reading
  from jzr_equivalent_reading_triples as t1
  join jzr_equivalent_reading_triples as t2
  where true
    and ( c1 != c2 )
    and ( c1 not in ( '満', '蟇', '弥', '侭', '尽', '弹', '弾' ) )
    and ( c2 not in ( '満', '蟇', '弥', '侭', '尽', '弹', '弾' ) )
  order by reading
;`,
      //-------------------------------------------------------------------------------------------------------
      SQL`create view jzr_band_names_2 as
select
    c1 || c2 as c
  from jzr_band_names
  order by reading
;`,
      //=======================================================================================================
      SQL`create table jzr_components (
  rowid     text    unique  not null,
  ref       text            not null,
  level     integer         not null,
  lnr       integer         not null,
  rnr       integer         not null,
  glyph     text            not null,
  component text            not null,
primary key ( rowid ),
foreign key ( ref ) references jzr_mirror_triples_base ( rowid ),
check ( ( length( glyph     ) = 1 ) or ( glyph      regexp '^&[\\-a-z0-9_]+#[0-9a-f]{4,6};$' ) ),
check ( ( length( component ) = 1 ) or ( component  regexp '^&[\\-a-z0-9_]+#[0-9a-f]{4,6};$' ) ),
check ( rowid regexp '^.*$' )
);`,
      //=======================================================================================================
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
      SQL`create view _jzr_meta_error_verb_faults as select distinct
  count(*) over ( partition by v )    as count,
  'error:R=*'                         as rowid,
  rowid                               as ref,
  'error-verb'                        as description,
  'v:' || v || ', o:' || o            as quote
from jzr_triples as nn
where v like '%:error';`,
      //.......................................................................................................
      SQL`create view _jzr_meta_mirror_lines_whitespace_faults as select distinct
  1                                            as count,
  't:mr:ln:jfields:ws:R=*'                     as rowid,
  ml.rowid                                     as ref,
  'extraneous-whitespace'                      as description,
  ml.jfields                                   as quote
from jzr_mirror_lines as ml
where ( has_peripheral_ws_in_jfield( jfields ) );`,
      //.......................................................................................................
      SQL`create view jzr_meta_faults as
select null as count, null as rowid, null as ref, null as description, null  as quote where false union all
-- ...................................................................................................
select 1, rowid, ref,  'uc-normalization', line  as quote from _jzr_meta_uc_normalization_faults          union all
select *                                                  from _jzr_meta_kr_readings_unknown_verb_faults  union all
select *                                                  from _jzr_meta_error_verb_faults                union all
select *                                                  from _jzr_meta_mirror_lines_whitespace_faults   union all
-- ...................................................................................................
select null, null, null, null, null where false
;`
    ];

    //---------------------------------------------------------------------------------------------------------
    /*

                   .                 .                                                         .
                 .o8               .o8                                                       .o8
       .oooo.o .o888oo  .oooo.   .o888oo  .ooooo.  ooo. .oo.  .oo.    .ooooo.  ooo. .oo.   .o888oo  .oooo.o
      d88(  "8   888   `P  )88b    888   d88' `88b `888P"Y88bP"Y88b  d88' `88b `888P"Y88b    888   d88(  "8
      `"Y88b.    888    .oP"888    888   888ooo888  888   888   888  888ooo888  888   888    888   `"Y88b.
      o.  )88b   888 . d8(  888    888 . 888    .o  888   888   888  888    .o  888   888    888 . o.  )88b
      8""888P'   "888" `Y888""8o   "888" `Y8bod8P' o888o o888o o888o `Y8bod8P' o888o o888o   "888" 8""888P'

    */
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
      populate_jzr_mirror_lines: SQL`insert into jzr_mirror_lines ( dskey, line_nr, lcode, line, jfields )
select
  -- 't:mr:ln:R=' || row_number() over ()          as rowid,
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
                  initial_latn, medial_latn, final_latn )
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
    /*

      ooooo     ooo oooooooooo.   oooooooooooo
      `888'     `8' `888'   `Y8b  `888'     `8
       888       8   888      888  888          .oooo.o
       888       8   888      888  888oooo8    d88(  "8
       888       8   888      888  888    "    `"Y88b.
       `88.    .8'   888     d88'  888         o.  )88b
         `YbodP'    o888bood8P'   o888o        8""888P'

    */
    //.........................................................................................................
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
      },
      //-------------------------------------------------------------------------------------------------------
      /* 'NFC', 'NFD', 'NFKC', or 'NFKD' */has_peripheral_ws_in_jfield: {
        deterministic: true,
        call: function(jfields_json) {
          var jfields;
          if ((jfields = JSON.parse(jfields_json)) == null) {
            return from_bool(false);
          }
          return from_bool(jfields.some(function(value) {
            return /(^\s)|(\s$)/.test(value);
          }));
        }
      }
    };

    //=========================================================================================================
    Jzr_db_adapter.table_functions = {
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
              yield* this.triples_from_dict_x_ko_Hang_Latn(rowid_in, dskey, fields);
              break;
            case 'dict:meanings':
              switch (true) {
                case entry.startsWith('py:'):
                  yield* this.triples_from_c_reading_zh_Latn_pinyin(rowid_in, dskey, fields);
                  break;
                case entry.startsWith('ka:'):
                  yield* this.triples_from_c_reading_ja_x_Kan(rowid_in, dskey, fields);
                  break;
                case entry.startsWith('hi:'):
                  yield* this.triples_from_c_reading_ja_x_Kan(rowid_in, dskey, fields);
                  break;
                case entry.startsWith('hg:'):
                  yield* this.triples_from_c_reading_ko_Hang(rowid_in, dskey, fields);
              }
              break;
            case 'shape:idsv2':
              yield* this.triples_from_shape_idsv2(rowid_in, dskey, fields);
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
  /*

  ooooo
  `888'
   888          .oooo.   ooo. .oo.    .oooooooo              .oooo.o oooo d8b oooo    ooo
   888         `P  )88b  `888P"Y88b  888' `88b              d88(  "8 `888""8P  `88.  .8'
   888          .oP"888   888   888  888   888              `"Y88b.   888       `88..8'
   888       o d8(  888   888   888  `88bod8P'              o.  )88b  888        `888'
  o888ooooood8 `Y888""8o o888o o888o `8oooooo.  ooooooooooo 8""888P' d888b        `8'
                                     d"     YD
                                     "Y88888P'

  */
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
      // debug 'Ωjzrsdb__17', @_TMP_hangeul.disassemble hangeul, { flatten: false, }
      return [...R];
    }

    //---------------------------------------------------------------------------------------------------------
    romanize_ja_kana(entry) {
      var cfg;
      cfg = {};
      return this._TMP_kana.toRomaji(entry, cfg);
    }

    // ### systematic name more like `..._ja_x_kan_latn()` ###
    // help 'Ωdjkr__18', toHiragana  'ラーメン',       { convertLongVowelMark: false, }
    // help 'Ωdjkr__19', toHiragana  'ラーメン',       { convertLongVowelMark: true, }
    // help 'Ωdjkr__20', toKana      'wanakana',   { customKanaMapping: { na: 'に', ka: 'Bana' }, }
    // help 'Ωdjkr__21', toKana      'wanakana',   { customKanaMapping: { waka: '(和歌)', wa: '(和2)', ka: '(歌2)', na: '(名)', ka: '(Bana)', naka: '(中)', }, }
    // help 'Ωdjkr__22', toRomaji    'つじぎり',     { customRomajiMapping: { じ: '(zi)', つ: '(tu)', り: '(li)', りょう: '(ryou)', りょ: '(ryo)' }, }

      //---------------------------------------------------------------------------------------------------------
    parse_idlx(formula) {
      return IDLX.parse(formula);
    }

    //---------------------------------------------------------------------------------------------------------
    operators_and_components_from_idlx(formula) {
      var components, formula_ast, operators, separate, type;
      switch (type = type_of(formula)) {
        case 'text':
          formula_ast = this.parse_idlx(formula);
          break;
        case 'list':
          formula_ast = formula;
          break;
        default:
          throw new Error(`Ωjzrsdb__23 expected a text or a list, got a ${type}`);
      }
      operators = [];
      components = [];
      separate = function(list) {
        var element, i, idx, len, results;
        results = [];
        for (idx = i = 0, len = list.length; i < len; idx = ++i) {
          element = list[idx];
          if (idx === 0) {
            operators.push(element);
            continue;
          }
          if ((type_of(element)) === 'list') {
            separate(element);
            // components.splice components.length, 0, ( separate element )...
            continue;
          }
          results.push(components.push(element));
        }
        return results;
      };
      separate(formula_ast);
      return {operators, components};
    }

  };

  //-----------------------------------------------------------------------------------------------------------
  /* TAINT goes into constructor of Jzr class */
  //===========================================================================================================
  /*

     oooo  o8o
     `888  `"'
      888 oooo    oooooooo oooo  oooo  oooo d8b  .oooo.
      888 `888   d'""7d8P  `888  `888  `888""8P `P  )88b
      888  888     .d8P'    888   888   888      .oP"888
      888  888   .d8P'  .P  888   888   888     d8(  888
  .o. 88P o888o d8888888P   `V88V"V8P' d888b    `Y888""8o
  `Y888P

  */
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
          throw new Error(`Ωjzrsdb__24 when trying to insert this row: ${fields_rpr}, an error was thrown: ${cause.message}`, {cause});
        }
        try {
          //.......................................................................................................
          /* TAINT move to Jzr_db_adapter together with try/catch */
          this.populate_hangeul_syllables();
        } catch (error1) {
          cause = error1;
          fields_rpr = rpr(this.dba.state.most_recent_inserted_row);
          throw new Error(`Ωjzrsdb__25 when trying to insert this row: ${fields_rpr}, an error was thrown: ${cause.message}`, {cause});
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
        return help('Ωjzrsdb__26', {total_row_count, total}); // { total_row_count: 40086, total: 80172 }
      })();
      //.......................................................................................................
      this.dba.statements.populate_jzr_mirror_triples.run();
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    populate_shape_formula_mirror_triples() {
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
    //   warn 'Ωjzrsdb__27', reverse faulty_rows
    //   # for row from
    //   #.......................................................................................................
    //   ;null

      //---------------------------------------------------------------------------------------------------------
    show_counts() {
      (() => {        //.......................................................................................................
        var counts, query;
        query = SQL`select v, count(*) from jzr_mirror_triples_base group by v;`;
        echo(grey('Ωjzrsdb__28'), gold(reverse(bold(query))));
        counts = (this.dba.prepare(query)).all();
        return console.table(counts);
      })();
      (() => {        //.......................................................................................................
        var counts, query;
        query = SQL`select v, count(*) from jzr_triples group by v;`;
        echo(grey('Ωjzrsdb__29'), gold(reverse(bold(query))));
        counts = (this.dba.prepare(query)).all();
        return console.table(counts);
      })();
      (() => {        //.......................................................................................................
        var count, counts, dskey, query;
        query = SQL`select dskey, count(*) as count from jzr_mirror_lines group by dskey union all
select '*',   count(*) as count from jzr_mirror_lines
order by count desc;`;
        echo(grey('Ωjzrsdb__30'), gold(reverse(bold(query))));
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
        echo('Ωjzrsdb__31', red(reverse(bold(" found some faults: "))));
        console.table(faulty_rows);
      } else {
        echo('Ωjzrsdb__32', lime(reverse(bold(" (no faults) "))));
      }
      //.......................................................................................................
      return null;
    }

  };

  //===========================================================================================================
  /*

  oooooooooo.   oooooooooooo ooo        ooooo   .oooooo.
  `888'   `Y8b  `888'     `8 `88.       .888'  d8P'  `Y8b
   888      888  888          888b     d'888  888      888
   888      888  888oooo8     8 Y88. .P  888  888      888
   888      888  888    "     8  `888'   888  888      888
   888     d88'  888       o  8    Y     888  `88b    d88'
  o888bood8P'   o888ooooood8 o8o        o888o  `Y8bood8P'

  */
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
    debug('Ωjzrsdb__33', Undumper.undump({
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsRUFBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxNQUFBLEVBQUEsY0FBQSxFQUFBLGlCQUFBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLGNBQUEsRUFBQSx1QkFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSx5QkFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQTs7O0VBR0EsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxLQURGLEVBRUUsSUFGRixFQUdFLElBSEYsRUFJRSxLQUpGLEVBS0UsTUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsT0FSRixDQUFBLEdBUTRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBUixDQUFvQixtQkFBcEIsQ0FSNUI7O0VBU0EsQ0FBQSxDQUFFLEdBQUYsRUFDRSxPQURGLEVBRUUsSUFGRixFQUdFLEtBSEYsRUFJRSxLQUpGLEVBS0UsSUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsSUFSRixFQVNFLEdBVEYsRUFVRSxJQVZGLEVBV0UsT0FYRixFQVlFLEdBWkYsQ0FBQSxHQVk0QixHQUFHLENBQUMsR0FaaEMsRUFiQTs7Ozs7OztFQStCQSxFQUFBLEdBQTRCLE9BQUEsQ0FBUSxTQUFSOztFQUM1QixJQUFBLEdBQTRCLE9BQUEsQ0FBUSxXQUFSLEVBaEM1Qjs7O0VBa0NBLEtBQUEsR0FBNEIsT0FBQSxDQUFRLGdCQUFSLEVBbEM1Qjs7O0VBb0NBLFNBQUEsR0FBNEIsT0FBQSxDQUFRLDJDQUFSLEVBcEM1Qjs7O0VBc0NBLENBQUEsQ0FBRSxLQUFGLEVBQ0UsU0FERixFQUVFLEdBRkYsQ0FBQSxHQUU0QixTQUFTLENBQUMsUUFBUSxDQUFDLGFBQW5CLENBQUEsQ0FGNUIsRUF0Q0E7OztFQTBDQSxDQUFBLENBQUUsSUFBRixFQUNFLE1BREYsQ0FBQSxHQUM0QixTQUFTLENBQUMsNEJBQVYsQ0FBQSxDQUF3QyxDQUFDLE1BRHJFLEVBMUNBOzs7RUE2Q0EsQ0FBQSxDQUFFLFNBQUYsRUFDRSxlQURGLENBQUEsR0FDNEIsU0FBUyxDQUFDLGlCQUFWLENBQUEsQ0FENUIsRUE3Q0E7OztFQWdEQSxDQUFBLENBQUUseUJBQUYsQ0FBQSxHQUM0QixTQUFTLENBQUMsUUFBUSxDQUFDLHVCQUFuQixDQUFBLENBRDVCLEVBaERBOzs7RUFtREEsQ0FBQSxDQUFFLFdBQUYsQ0FBQSxHQUE0QixTQUFTLENBQUMsUUFBUSxDQUFDLG9CQUFuQixDQUFBLENBQTVCOztFQUNBLFdBQUEsR0FBZ0MsSUFBSSxXQUFKLENBQUE7O0VBQ2hDLE1BQUEsR0FBZ0MsUUFBQSxDQUFBLEdBQUUsQ0FBRixDQUFBO1dBQVksV0FBVyxDQUFDLE1BQVosQ0FBbUIsR0FBQSxDQUFuQjtFQUFaLEVBckRoQzs7O0VBdURBLENBQUEsQ0FBRSxVQUFGLENBQUEsR0FBNEIsU0FBUyxDQUFDLDhCQUFWLENBQUEsQ0FBNUI7O0VBQ0EsQ0FBQSxDQUFFLEdBQUYsRUFBTyxJQUFQLENBQUEsR0FBNEIsT0FBQSxDQUFRLGNBQVIsQ0FBNUI7O0VBQ0EsQ0FBQSxDQUFFLE9BQUYsQ0FBQSxHQUE0QixTQUFTLENBQUMsUUFBUSxDQUFDLGVBQW5CLENBQUEsQ0FBNUIsRUF6REE7OztFQTREQSxTQUFBLEdBQWdDLFFBQUEsQ0FBRSxDQUFGLENBQUE7QUFBUyxZQUFPLENBQVA7QUFBQSxXQUNsQyxJQURrQztlQUN2QjtBQUR1QixXQUVsQyxLQUZrQztlQUV2QjtBQUZ1QjtRQUdsQyxNQUFNLElBQUksS0FBSixDQUFVLENBQUEsd0NBQUEsQ0FBQSxDQUEyQyxHQUFBLENBQUksQ0FBSixDQUEzQyxDQUFBLENBQVY7QUFINEI7RUFBVDs7RUFJaEMsT0FBQSxHQUFnQyxRQUFBLENBQUUsQ0FBRixDQUFBO0FBQVMsWUFBTyxDQUFQO0FBQUEsV0FDbEMsQ0FEa0M7ZUFDM0I7QUFEMkIsV0FFbEMsQ0FGa0M7ZUFFM0I7QUFGMkI7UUFHbEMsTUFBTSxJQUFJLEtBQUosQ0FBVSxDQUFBLGlDQUFBLENBQUEsQ0FBb0MsR0FBQSxDQUFJLENBQUosQ0FBcEMsQ0FBQSxDQUFWO0FBSDRCO0VBQVQsRUFoRWhDOzs7RUFzRUEsdUJBQUEsR0FBMEIsUUFBQSxDQUFBLENBQUE7QUFDMUIsUUFBQSxpQkFBQSxFQUFBLHNCQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUE7SUFBRSxDQUFBLENBQUUsaUJBQUYsQ0FBQSxHQUE4QixTQUFTLENBQUMsd0JBQVYsQ0FBQSxDQUE5QjtJQUNBLENBQUEsQ0FBRSxzQkFBRixDQUFBLEdBQThCLFNBQVMsQ0FBQyw4QkFBVixDQUFBLENBQTlCO0FBQ0E7QUFBQTtJQUFBLEtBQUEsV0FBQTs7bUJBQ0UsS0FBQSxDQUFNLGFBQU4sRUFBcUIsR0FBckIsRUFBMEIsS0FBMUI7SUFERixDQUFBOztFQUh3QixFQXRFMUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBbUdBLFNBQUEsR0FBWSxRQUFBLENBQUEsQ0FBQTtBQUNaLFFBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQTtJQUFFLENBQUEsR0FBc0MsQ0FBQTtJQUN0QyxDQUFDLENBQUMsSUFBRixHQUFzQyxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsSUFBeEI7SUFDdEMsQ0FBQyxDQUFDLEdBQUYsR0FBc0MsSUFBSSxDQUFDLE9BQUwsQ0FBYSxDQUFDLENBQUMsSUFBZixFQUFxQixJQUFyQjtJQUN0QyxDQUFDLENBQUMsRUFBRixHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxJQUFaLEVBQWtCLFFBQWxCLEVBSHhDOzs7SUFNRSxDQUFDLENBQUMsTUFBRixHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxJQUFaLEVBQWtCLHdCQUFsQjtJQUN0QyxDQUFDLENBQUMsUUFBRixHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxNQUFaLEVBQW9CLFVBQXBCO0lBQ3RDLENBQUMsQ0FBQyxVQUFGLEdBQXNDLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBQyxDQUFDLE1BQVosRUFBb0IsNkNBQXBCO0lBQ3RDLE9BQUEsR0FBc0MsSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFDLENBQUMsVUFBWixFQUF3QixnRUFBeEI7SUFDdEMsT0FBQSxHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxVQUFaLEVBQXdCLDRFQUF4QixFQVZ4Qzs7SUFZRSxDQUFDLENBQUUscUJBQUYsQ0FBRCxHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxNQUFaLEVBQW9CLDRCQUFwQjtJQUN0QyxDQUFDLENBQUUsb0JBQUYsQ0FBRCxHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxNQUFaLEVBQW9CLHlCQUFwQjtJQUN0QyxDQUFDLENBQUUsWUFBRixDQUFELEdBQXNDLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBQyxDQUFDLE1BQVosRUFBb0Isb0NBQXBCO0lBQ3RDLENBQUMsQ0FBRSxpQkFBRixDQUFELEdBQXNDLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQUFtQixpQ0FBbkI7SUFDdEMsQ0FBQyxDQUFFLHFCQUFGLENBQUQsR0FBc0MsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLEVBQW1CLGdDQUFuQjtJQUN0QyxDQUFDLENBQUUsd0JBQUYsQ0FBRCxHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsY0FBbkI7SUFDdEMsQ0FBQyxDQUFFLHlCQUFGLENBQUQsR0FBc0MsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLEVBQW1CLGVBQW5CO0lBQ3RDLENBQUMsQ0FBRSwwQkFBRixDQUFELEdBQXNDLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQUFtQixnQkFBbkI7SUFDdEMsQ0FBQyxDQUFFLDJCQUFGLENBQUQsR0FBc0MsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLEVBQW1CLGlCQUFuQjtJQUN0QyxDQUFDLENBQUUscUJBQUYsQ0FBRCxHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsV0FBbkI7SUFDdEMsQ0FBQyxDQUFFLGVBQUYsQ0FBRCxHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxRQUFaLEVBQXNCLHNCQUF0QjtJQUN0QyxDQUFDLENBQUUsYUFBRixDQUFELEdBQXNDLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBQyxDQUFDLFFBQVosRUFBc0Isc0NBQXRCO0lBQ3RDLENBQUMsQ0FBRSxjQUFGLENBQUQsR0FBc0MsSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFDLENBQUMsUUFBWixFQUFzQix5Q0FBdEI7SUFDdEMsQ0FBQyxDQUFFLFdBQUYsQ0FBRCxHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxRQUFaLEVBQXNCLDZCQUF0QjtBQUN0QyxXQUFPO0VBM0JHOztFQWdDTjs7SUFBTixNQUFBLGVBQUEsUUFBNkIsVUFBN0IsQ0FBQTs7TUFPRSxXQUFhLENBQUUsT0FBRixFQUFXLE1BQU0sQ0FBQSxDQUFqQixDQUFBLEVBQUE7O0FBQ2YsWUFBQTtRQUNJLENBQUEsQ0FBRSxJQUFGLENBQUEsR0FBWSxHQUFaO1FBQ0EsR0FBQSxHQUFZLElBQUEsQ0FBSyxHQUFMLEVBQVUsUUFBQSxDQUFFLEdBQUYsQ0FBQTtpQkFBVyxPQUFPLEdBQUcsQ0FBQztRQUF0QixDQUFWLEVBRmhCOzthQUlJLENBQU0sT0FBTixFQUFlLEdBQWYsRUFKSjs7UUFNSSxJQUFDLENBQUEsSUFBRCxHQUFVO1FBQ1YsSUFBQyxDQUFBLEtBQUQsR0FBVTtVQUFFLFlBQUEsRUFBYyxDQUFoQjtVQUFtQix3QkFBQSxFQUEwQjtRQUE3QztRQUVQLENBQUEsQ0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNQLGNBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUE7Ozs7VUFHTSxRQUFBLEdBQVc7VUFDWCxLQUFBLGdEQUFBO2FBQUksQ0FBRSxJQUFGLEVBQVEsSUFBUjtBQUNGO2NBQ0UsQ0FBRSxJQUFDLENBQUEsT0FBRCxDQUFTLEdBQUcsQ0FBQSxjQUFBLENBQUEsQ0FBaUIsSUFBakIsQ0FBQSxhQUFBLENBQVosQ0FBRixDQUFvRCxDQUFDLEdBQXJELENBQUEsRUFERjthQUVBLGNBQUE7Y0FBTTtjQUNKLFFBQVEsQ0FBQyxJQUFULENBQWMsQ0FBQSxDQUFBLENBQUcsSUFBSCxFQUFBLENBQUEsQ0FBVyxJQUFYLENBQUEsRUFBQSxDQUFBLENBQW9CLEtBQUssQ0FBQyxPQUExQixDQUFBLENBQWQ7Y0FDQSxJQUFBLENBQUssYUFBTCxFQUFvQixLQUFLLENBQUMsT0FBMUIsRUFGRjs7VUFIRjtVQU1BLElBQWUsUUFBUSxDQUFDLE1BQVQsS0FBbUIsQ0FBbEM7QUFBQSxtQkFBTyxLQUFQOztVQUNBLE1BQU0sSUFBSSxLQUFKLENBQVUsQ0FBQSwyQ0FBQSxDQUFBLENBQThDLEdBQUEsQ0FBSSxRQUFKLENBQTlDLENBQUEsQ0FBVjtpQkFDTDtRQWJBLENBQUEsSUFUUDs7UUF3QkksSUFBRyxJQUFDLENBQUEsUUFBSjtVQUNFLElBQUMsQ0FBQSxpQ0FBRCxDQUFBO1VBQ0EsSUFBQyxDQUFBLGtDQUFELENBQUE7VUFDQSxJQUFDLENBQUEsbUNBQUQsQ0FBQTtVQUNBLElBQUMsQ0FBQSxrQ0FBRCxDQUFBLEVBSkY7U0F4Qko7O1FBOEJLO01BL0JVLENBTGY7Ozs7Ozs7Ozs7Ozs7Ozs7O01Bb2lCRSxtQ0FBcUMsQ0FBQSxDQUFBO1FBQ25DLEtBQUEsQ0FBTSxhQUFOLEVBQXFCLHFDQUFyQjtRQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsdUJBQXVCLENBQUMsR0FBcEMsQ0FBd0M7VUFBRSxLQUFBLEVBQU8sYUFBVDtVQUF3QixLQUFBLEVBQU8sR0FBL0I7VUFBb0MsT0FBQSxFQUFTO1FBQTdDLENBQXhDO1FBQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFwQyxDQUF3QztVQUFFLEtBQUEsRUFBTyxhQUFUO1VBQXdCLEtBQUEsRUFBTyxHQUEvQjtVQUFvQyxPQUFBLEVBQVM7UUFBN0MsQ0FBeEM7UUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLHVCQUF1QixDQUFDLEdBQXBDLENBQXdDO1VBQUUsS0FBQSxFQUFPLGFBQVQ7VUFBd0IsS0FBQSxFQUFPLEdBQS9CO1VBQW9DLE9BQUEsRUFBUztRQUE3QyxDQUF4QztlQUNDO01BTGtDLENBcGlCdkM7OztNQTRpQkUsa0NBQW9DLENBQUEsQ0FBQTtBQUN0QyxZQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLElBQUE7Ozs7OztRQUtJLEtBQUEsQ0FBTSxhQUFOLEVBQXFCLG9DQUFyQjtRQUNBLElBQUEsR0FBTztVQUNMO1lBQUUsS0FBQSxFQUFPLGtDQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxFQUFHLHdCQUF2RTtZQUFxRyxDQUFBLEVBQUc7VUFBeEcsQ0FESztVQUVMO1lBQUUsS0FBQSxFQUFPLGlDQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxFQUFHLHVCQUF2RTtZQUFxRyxDQUFBLEVBQUc7VUFBeEcsQ0FGSztVQUdMO1lBQUUsS0FBQSxFQUFPLGdDQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxFQUFHLHNCQUF2RTtZQUFxRyxDQUFBLEVBQUc7VUFBeEcsQ0FISztVQUlMO1lBQUUsS0FBQSxFQUFPLG9DQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxFQUFHLDBCQUF2RTtZQUFxRyxDQUFBLEVBQUc7VUFBeEcsQ0FKSztVQUtMO1lBQUUsS0FBQSxFQUFPLDhCQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxFQUFHLG9CQUF2RTtZQUFxRyxDQUFBLEVBQUc7VUFBeEcsQ0FMSztVQU1MO1lBQUUsS0FBQSxFQUFPLDhCQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxFQUFHLG9CQUF2RTtZQUFxRyxDQUFBLEVBQUc7VUFBeEcsQ0FOSztVQU9MO1lBQUUsS0FBQSxFQUFPLDhCQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxFQUFHLG9CQUF2RTtZQUFxRyxDQUFBLEVBQUc7VUFBeEcsQ0FQSztVQVFMO1lBQUUsS0FBQSxFQUFPLCtCQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxFQUFHLHFCQUF2RTtZQUFxRyxDQUFBLEVBQUc7VUFBeEcsQ0FSSztVQVNMO1lBQUUsS0FBQSxFQUFPLG1DQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxFQUFHLHlCQUF2RTtZQUFxRyxDQUFBLEVBQUc7VUFBeEcsQ0FUSztVQVVMO1lBQUUsS0FBQSxFQUFPLG1DQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxF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Q0FBQSxHQUE0QixTQUFTLENBQUMsUUFBUSxDQUFDLG9CQUFuQixDQUFBLENBQTVCLEVBQUY7O0lBRUUsV0FBQSxHQUFjLElBQUksV0FBSixDQUFBO0lBQ2QsTUFBQSxHQUFTLFFBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBQTthQUFZLFdBQVcsQ0FBQyxNQUFaLENBQW1CLEdBQUEsQ0FBbkI7SUFBWjtJQUNULENBQUEsQ0FBRSxRQUFGLENBQUEsR0FBa0MsU0FBUyxDQUFDLHVCQUFWLENBQUEsQ0FBbEM7SUFDQSxDQUFBLENBQUUseUJBQUYsQ0FBQSxHQUFrQyxTQUFTLENBQUMsUUFBUSxDQUFDLHVCQUFuQixDQUFBLENBQWxDO0lBQ0EsQ0FBQSxDQUFFLEVBQUYsQ0FBQSxHQUFrQyxTQUFTLENBQUMsVUFBVixDQUFBLENBQWxDO0lBQ0EsSUFBQSxHQUFrQyxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsaUJBQXhCO0lBQ2xDLEdBQUEsR0FBTSxJQUFJLE1BQUosQ0FBQTtJQUNOLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUixDQUFpQjtNQUFFLElBQUEsRUFBTTtJQUFSLENBQWpCO0lBQ0EsS0FBQSxDQUFNLGFBQU4sRUFBcUIsUUFBUSxDQUFDLE1BQVQsQ0FBZ0I7TUFBRSxFQUFBLEVBQUksR0FBRyxDQUFDLEdBQVY7TUFBZSxJQUFmO01BQXFCLElBQUEsRUFBTTtJQUEzQixDQUFoQixDQUFyQixFQVZGOztJQVlFLEdBQUcsQ0FBQyxXQUFKLENBQUE7SUFDQSxHQUFHLENBQUMsb0JBQUosQ0FBQTtXQUNDO0VBZmMsRUFqc0NqQjs7O0VBb3RDQSxJQUFHLE1BQUEsS0FBVSxPQUFPLENBQUMsSUFBckI7SUFBa0MsQ0FBQSxDQUFBLENBQUEsR0FBQTtNQUNoQyxJQUFBLENBQUEsRUFBRjs7YUFFRztJQUgrQixDQUFBLElBQWxDOztBQXB0Q0EiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuJ3VzZSBzdHJpY3QnXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuR1VZICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2d1eSdcbnsgYWxlcnRcbiAgZGVidWdcbiAgaGVscFxuICBpbmZvXG4gIHBsYWluXG4gIHByYWlzZVxuICB1cmdlXG4gIHdhcm5cbiAgd2hpc3BlciB9ICAgICAgICAgICAgICAgPSBHVVkudHJtLmdldF9sb2dnZXJzICdqaXp1cmEtc291cmNlcy1kYidcbnsgcnByXG4gIGluc3BlY3RcbiAgZWNob1xuICB3aGl0ZVxuICBncmVlblxuICBibHVlXG4gIGxpbWVcbiAgZ29sZFxuICBncmV5XG4gIHJlZFxuICBib2xkXG4gIHJldmVyc2VcbiAgbG9nICAgICB9ICAgICAgICAgICAgICAgPSBHVVkudHJtXG4jIHsgZiB9ICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvZWZmc3RyaW5nJ1xuIyB3cml0ZSAgICAgICAgICAgICAgICAgICAgID0gKCBwICkgLT4gcHJvY2Vzcy5zdGRvdXQud3JpdGUgcFxuIyB7IG5mYSB9ICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL25vcm1hbGl6ZS1mdW5jdGlvbi1hcmd1bWVudHMnXG4jIEdUTkcgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvZ3V5LXRlc3QtTkcnXG4jIHsgVGVzdCAgICAgICAgICAgICAgICAgIH0gPSBHVE5HXG5GUyAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpmcydcblBBVEggICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOnBhdGgnXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkJzcWwzICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdiZXR0ZXItc3FsaXRlMydcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuU0ZNT0RVTEVTICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9icmljYWJyYWMtc2Ztb2R1bGVzJ1xuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IERicmljLFxuICBEYnJpY19zdGQsXG4gIFNRTCwgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZGJyaWMoKVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IGxldHMsXG4gIGZyZWV6ZSwgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfbGV0c2ZyZWV6ZXRoYXRfaW5mcmEoKS5zaW1wbGVcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBKZXRzdHJlYW0sXG4gIEFzeW5jX2pldHN0cmVhbSwgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfamV0c3RyZWFtKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBCZW5jaG1hcmtlciwgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2JlbmNobWFya2luZygpXG5iZW5jaG1hcmtlciAgICAgICAgICAgICAgICAgICA9IG5ldyBCZW5jaG1hcmtlcigpXG50aW1laXQgICAgICAgICAgICAgICAgICAgICAgICA9ICggUC4uLiApIC0+IGJlbmNobWFya2VyLnRpbWVpdCBQLi4uXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgc2V0X2dldHRlciwgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9tYW5hZ2VkX3Byb3BlcnR5X3Rvb2xzKClcbnsgSURMLCBJRExYLCAgICAgICAgICAgIH0gPSByZXF1aXJlICdtb2ppa3VyYS1pZGwnXG57IHR5cGVfb2YsICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfdHlwZV9vZigpXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZnJvbV9ib29sICAgICAgICAgICAgICAgICAgICAgPSAoIHggKSAtPiBzd2l0Y2ggeFxuICB3aGVuIHRydWUgIHRoZW4gMVxuICB3aGVuIGZhbHNlIHRoZW4gMFxuICBlbHNlIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX19fMSBleHBlY3RlZCB0cnVlIG9yIGZhbHNlLCBnb3QgI3tycHIgeH1cIlxuYXNfYm9vbCAgICAgICAgICAgICAgICAgICAgICAgPSAoIHggKSAtPiBzd2l0Y2ggeFxuICB3aGVuIDEgdGhlbiB0cnVlXG4gIHdoZW4gMCB0aGVuIGZhbHNlXG4gIGVsc2UgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfX18yIGV4cGVjdGVkIDAgb3IgMSwgZ290ICN7cnByIHh9XCJcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5kZW1vX3NvdXJjZV9pZGVudGlmaWVycyA9IC0+XG4gIHsgZXhwYW5kX2RpY3Rpb25hcnksICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2RpY3Rpb25hcnlfdG9vbHMoKVxuICB7IGdldF9sb2NhbF9kZXN0aW5hdGlvbnMsIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9nZXRfbG9jYWxfZGVzdGluYXRpb25zKClcbiAgZm9yIGtleSwgdmFsdWUgb2YgZ2V0X2xvY2FsX2Rlc3RpbmF0aW9ucygpXG4gICAgZGVidWcgJ86panpyc2RiX19fMycsIGtleSwgdmFsdWVcbiAgIyBjYW4gYXBwZW5kIGxpbmUgbnVtYmVycyB0byBmaWxlcyBhcyBpbjpcbiAgIyAnZGljdDptZWFuaW5ncy4xOkw9MTMzMzInXG4gICMgJ2RpY3Q6dWNkMTQwLjE6dWhkaWR4Okw9MTIzNCdcbiAgIyByb3dpZHM6ICd0OmpmbTpSPTEnXG4gICMge1xuICAjICAgJ2RpY3Q6bWVhbmluZ3MnOiAgICAgICAgICAnJGp6cmRzL21lYW5pbmcvbWVhbmluZ3MudHh0J1xuICAjICAgJ2RpY3Q6dWNkOnYxNC4wOnVoZGlkeCcgOiAnJGp6cmRzL3VuaWNvZGUub3JnLXVjZC12MTQuMC9VbmloYW5fRGljdGlvbmFyeUluZGljZXMudHh0J1xuICAjICAgfVxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMjI1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgLiAgIG9vb29cbiAgICAgICAgICAgICAgICAgICAgICAgLm84ICAgYDg4OFxub28ub29vb28uICAgLm9vb28uICAgLm84ODhvbyAgODg4IC5vby4gICAgLm9vb28ub1xuIDg4OCcgYDg4YiBgUCAgKTg4YiAgICA4ODggICAgODg4UFwiWTg4YiAgZDg4KCAgXCI4XG4gODg4ICAgODg4ICAub1BcIjg4OCAgICA4ODggICAgODg4ICAgODg4ICBgXCJZODhiLlxuIDg4OCAgIDg4OCBkOCggIDg4OCAgICA4ODggLiAgODg4ICAgODg4ICBvLiAgKTg4YlxuIDg4OGJvZDhQJyBgWTg4OFwiXCI4byAgIFwiODg4XCIgbzg4OG8gbzg4OG8gOFwiXCI4ODhQJ1xuIDg4OFxubzg4OG9cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmdldF9wYXRocyA9IC0+XG4gIFIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0ge31cbiAgUi5iYXNlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4nXG4gIFIuanpyICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5yZXNvbHZlIFIuYmFzZSwgJy4uJ1xuICBSLmRiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBSLmJhc2UsICdqenIuZGInXG4gICMgUi5kYiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSAnL2Rldi9zaG0vanpyLmRiJ1xuICAjIFIuanpyZHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIFIuYmFzZSwgJ2p6cmRzJ1xuICBSLmp6cm5kcyAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBSLmJhc2UsICdqaXp1cmEtbmV3LWRhdGFzb3VyY2VzJ1xuICBSLm1vamlrdXJhICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBSLmp6cm5kcywgJ21vamlrdXJhJ1xuICBSLnJhd19naXRodWIgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBSLmp6cm5kcywgJ2J2ZnMvb3JpZ2luL2h0dHBzL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20nXG4gIGthbmppdW0gICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIFIucmF3X2dpdGh1YiwgJ21pZnVuZXRvc2hpcm8va2Fuaml1bS84YTBjZGFhMTZkNjRhMjgxYTIwNDhkZTJlZWUyZWM1ZTNhNDQwZmE2J1xuICBydXRvcGlvICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBSLnJhd19naXRodWIsICdydXRvcGlvL0tvcmVhbi1OYW1lLUhhbmphLUNoYXJzZXQvMTJkZjFiYTFiNGRmYWEwOTU4MTNlNGRkZmJhNDI0ZTgxNmY5NGM1MydcbiAgIyBSWyAnZGljdDp1Y2Q6djE0LjA6dWhkaWR4JyAgICAgIF0gICA9IFBBVEguam9pbiBSLmp6cm5kcywgJ3VuaWNvZGUub3JnLXVjZC12MTQuMC9VbmloYW5fRGljdGlvbmFyeUluZGljZXMudHh0J1xuICBSWyAnZGljdDp4OmtvLUhhbmcrTGF0bicgICAgICAgIF0gICA9IFBBVEguam9pbiBSLmp6cm5kcywgJ2hhbmdldWwtdHJhbnNjcmlwdGlvbnMudHN2J1xuICBSWyAnZGljdDp4OmphLUthbitMYXRuJyAgICAgICAgIF0gICA9IFBBVEguam9pbiBSLmp6cm5kcywgJ2thbmEtdHJhbnNjcmlwdGlvbnMudHN2J1xuICBSWyAnZGljdDpiY3A0NycgICAgICAgICAgICAgICAgIF0gICA9IFBBVEguam9pbiBSLmp6cm5kcywgJ0JDUDQ3LWxhbmd1YWdlLXNjcmlwdHMtcmVnaW9ucy50c3YnXG4gIFJbICdkaWN0OmphOmthbmppdW0nICAgICAgICAgICAgXSAgID0gUEFUSC5qb2luIGthbmppdW0sICdkYXRhL3NvdXJjZV9maWxlcy9rYW5qaWRpY3QudHh0J1xuICBSWyAnZGljdDpqYTprYW5qaXVtOmF1eCcgICAgICAgIF0gICA9IFBBVEguam9pbiBrYW5qaXVtLCAnZGF0YS9zb3VyY2VfZmlsZXMvMF9SRUFETUUudHh0J1xuICBSWyAnZGljdDprbzpWPWRhdGEtZ292LmNzdicgICAgIF0gICA9IFBBVEguam9pbiBydXRvcGlvLCAnZGF0YS1nb3YuY3N2J1xuICBSWyAnZGljdDprbzpWPWRhdGEtZ292Lmpzb24nICAgIF0gICA9IFBBVEguam9pbiBydXRvcGlvLCAnZGF0YS1nb3YuanNvbidcbiAgUlsgJ2RpY3Q6a286Vj1kYXRhLW5hdmVyLmNzdicgICBdICAgPSBQQVRILmpvaW4gcnV0b3BpbywgJ2RhdGEtbmF2ZXIuY3N2J1xuICBSWyAnZGljdDprbzpWPWRhdGEtbmF2ZXIuanNvbicgIF0gICA9IFBBVEguam9pbiBydXRvcGlvLCAnZGF0YS1uYXZlci5qc29uJ1xuICBSWyAnZGljdDprbzpWPVJFQURNRS5tZCcgICAgICAgIF0gICA9IFBBVEguam9pbiBydXRvcGlvLCAnUkVBRE1FLm1kJ1xuICBSWyAnZGljdDptZWFuaW5ncycgICAgICAgICAgICAgIF0gICA9IFBBVEguam9pbiBSLm1vamlrdXJhLCAnbWVhbmluZy9tZWFuaW5ncy50eHQnXG4gIFJbICdzaGFwZTppZHN2MicgICAgICAgICAgICAgICAgXSAgID0gUEFUSC5qb2luIFIubW9qaWt1cmEsICdzaGFwZS9zaGFwZS1icmVha2Rvd24tZm9ybXVsYS12Mi50eHQnXG4gIFJbICdzaGFwZTp6aHo1YmYnICAgICAgICAgICAgICAgXSAgID0gUEFUSC5qb2luIFIubW9qaWt1cmEsICdzaGFwZS9zaGFwZS1zdHJva2VvcmRlci16aGF6aXd1YmlmYS50eHQnXG4gIFJbICd1Y2RiOnJzZ3MnICAgICAgICAgICAgICAgICAgXSAgID0gUEFUSC5qb2luIFIubW9qaWt1cmEsICd1Y2RiL2NmZy9yc2dzLWFuZC1ibG9ja3MubWQnXG4gIHJldHVybiBSXG5cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEp6cl9kYl9hZGFwdGVyIGV4dGVuZHMgRGJyaWNfc3RkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAZGJfY2xhc3M6ICBCc3FsM1xuICBAcHJlZml4OiAgICAnanpyJ1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6ICggZGJfcGF0aCwgY2ZnID0ge30gKSAtPlxuICAgICMjIyBUQUlOVCBuZWVkIG1vcmUgY2xhcml0eSBhYm91dCB3aGVuIHN0YXRlbWVudHMsIGJ1aWxkLCBpbml0aWFsaXplLi4uIGlzIHBlcmZvcm1lZCAjIyNcbiAgICB7IGhvc3QsIH0gPSBjZmdcbiAgICBjZmcgICAgICAgPSBsZXRzIGNmZywgKCBjZmcgKSAtPiBkZWxldGUgY2ZnLmhvc3RcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHN1cGVyIGRiX3BhdGgsIGNmZ1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQGhvc3QgICA9IGhvc3RcbiAgICBAc3RhdGUgID0geyB0cmlwbGVfY291bnQ6IDAsIG1vc3RfcmVjZW50X2luc2VydGVkX3JvdzogbnVsbCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkbyA9PlxuICAgICAgIyMjIFRBSU5UIHRoaXMgaXMgbm90IHdlbGwgcGxhY2VkICMjI1xuICAgICAgIyMjIE5PVEUgZXhlY3V0ZSBhIEdhcHMtYW5kLUlzbGFuZHMgRVNTRlJJIHRvIGltcHJvdmUgc3RydWN0dXJhbCBpbnRlZ3JpdHkgYXNzdXJhbmNlOiAjIyNcbiAgICAgICMgKCBAcHJlcGFyZSBTUUxcInNlbGVjdCAqIGZyb20gX2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzIHdoZXJlIGZhbHNlO1wiICkuZ2V0KClcbiAgICAgIG1lc3NhZ2VzID0gW11cbiAgICAgIGZvciB7IG5hbWUsIHR5cGUsIH0gZnJvbSBAc3RhdGVtZW50cy5zdGRfZ2V0X3JlbGF0aW9ucy5pdGVyYXRlKClcbiAgICAgICAgdHJ5XG4gICAgICAgICAgKCBAcHJlcGFyZSBTUUxcInNlbGVjdCAqIGZyb20gI3tuYW1lfSB3aGVyZSBmYWxzZTtcIiApLmFsbCgpXG4gICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgbWVzc2FnZXMucHVzaCBcIiN7dHlwZX0gI3tuYW1lfTogI3tlcnJvci5tZXNzYWdlfVwiXG4gICAgICAgICAgd2FybiAnzqlqenJzZGJfX180JywgZXJyb3IubWVzc2FnZVxuICAgICAgcmV0dXJuIG51bGwgaWYgbWVzc2FnZXMubGVuZ3RoIGlzIDBcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX19fNSBFRkZSSSB0ZXN0aW5nIHJldmVhbGVkIGVycm9yczogI3tycHIgbWVzc2FnZXN9XCJcbiAgICAgIDtudWxsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiBAaXNfZnJlc2hcbiAgICAgIEBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZXMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdmVyYnMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGNvZGVzKClcbiAgICAgIEBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzKClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDt1bmRlZmluZWRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNldF9nZXR0ZXIgQDo6LCAnbmV4dF90cmlwbGVfcm93aWQnLCAtPiBcInQ6bXI6M3BsOlI9I3srK0BzdGF0ZS50cmlwbGVfY291bnR9XCJcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICMjI1xuXG4gICAubzggICAgICAgICAgICAgICAgICAgIG84byAgb29vbyAgICAgICAgLm84XG4gIFwiODg4ICAgICAgICAgICAgICAgICAgICBgXCInICBgODg4ICAgICAgIFwiODg4XG4gICA4ODhvb29vLiAgb29vbyAgb29vbyAgb29vbyAgIDg4OCAgIC5vb29vODg4XG4gICBkODgnIGA4OGIgYDg4OCAgYDg4OCAgYDg4OCAgIDg4OCAgZDg4JyBgODg4XG4gICA4ODggICA4ODggIDg4OCAgIDg4OCAgIDg4OCAgIDg4OCAgODg4ICAgODg4XG4gICA4ODggICA4ODggIDg4OCAgIDg4OCAgIDg4OCAgIDg4OCAgODg4ICAgODg4XG4gICBgWThib2Q4UCcgIGBWODhWXCJWOFAnIG84ODhvIG84ODhvIGBZOGJvZDg4UFwiXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIEBidWlsZDogW1xuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2dseXBocmFuZ2VzIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgbG8gICAgICAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgaGkgICAgICAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbG9fZ2x5cGggIHRleHQgICAgICAgICAgICBnZW5lcmF0ZWQgYWx3YXlzIGFzICggY2hhciggbG8gKSApIHN0b3JlZCxcbiAgICAgICAgaGlfZ2x5cGggIHRleHQgICAgICAgICAgICBnZW5lcmF0ZWQgYWx3YXlzIGFzICggY2hhciggaGkgKSApIHN0b3JlZCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfX182XCIgY2hlY2sgKCBsbyBiZXR3ZWVuIDB4MDAwMDAwIGFuZCAweDEwZmZmZiApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fXzdcIiBjaGVjayAoIGhpIGJldHdlZW4gMHgwMDAwMDAgYW5kIDB4MTBmZmZmICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X19fOFwiIGNoZWNrICggbG8gPD0gaGkgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfX185XCIgY2hlY2sgKCByb3dpZCByZWdleHAgJ14uKiQnKVxuICAgICAgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9nbHlwaHNldHMgKFxuICAgICAgICByb3dpZCAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIG5hbWUgICAgICAgIHRleHQgICAgbm90IG51bGwsXG4gICAgICAgIGdseXBocmFuZ2UgIHRleHQgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBmb3JlaWduIGtleSAoIGdseXBocmFuZ2UgKSByZWZlcmVuY2VzIGp6cl9nbHlwaHJhbmdlcyAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18xMFwiIGNoZWNrICggcm93aWQgcmVnZXhwICdeLiokJylcbiAgICAgICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfZGF0YXNvdXJjZXMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBkc2tleSAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBwYXRoICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCByb3dpZCByZWdleHAgJ150OmRzOlI9XFxcXGQrJCcpKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfbGNvZGVzIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgbGNvZGUgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgY29tbWVudCAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNoZWNrICggbGNvZGUgcmVnZXhwICdeW2EtekEtWl0rW2EtekEtWjAtOV0qJCcgKSxcbiAgICAgIGNoZWNrICggcm93aWQgPSAndDptcjpsYzpWPScgfHwgbGNvZGUgKSApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX21pcnJvcl9saW5lcyAoXG4gICAgICAgIC0tICd0OmpmbTonXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoICd0Om1yOmxuOmRzPScgfHwgZHNrZXkgfHwgJzpMPScgfHwgbGluZV9uciApIHN0b3JlZCxcbiAgICAgICAgcmVmICAgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggICAgICAgICAgICAgICAgICBkc2tleSB8fCAnOkw9JyB8fCBsaW5lX25yICkgdmlydHVhbCxcbiAgICAgICAgZHNrZXkgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbGluZV9uciAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbGNvZGUgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbGluZSAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgamZpZWxkcyAgIGpzb24gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgIC0tIHByaW1hcnkga2V5ICggcm93aWQgKSwgICAgICAgICAgICAgICAgICAgICAgICAgICAtLSAjIyMgTk9URSBFeHBlcmltZW50YWw6IG5vIGV4cGxpY2l0IFBLLCBpbnN0ZWFkIGdlbmVyYXRlZCBgcm93aWRgIGNvbHVtblxuICAgICAgLS0gY2hlY2sgKCByb3dpZCByZWdleHAgJ150Om1yOmxuOmRzPS4rOkw9XFxcXGQrJCcpLCAgLS0gIyMjIE5PVEUgbm8gbmVlZCB0byBjaGVjayBhcyB2YWx1ZSBpcyBnZW5lcmF0ZWQgIyMjXG4gICAgICB1bmlxdWUgKCBkc2tleSwgbGluZV9uciApLFxuICAgICAgZm9yZWlnbiBrZXkgKCBsY29kZSApIHJlZmVyZW5jZXMganpyX21pcnJvcl9sY29kZXMgKCBsY29kZSApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX3ZlcmJzIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcmFuayAgICAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCBkZWZhdWx0IDEsXG4gICAgICAgIHMgICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHYgICAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIG8gICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bXI6dmI6Vj1bXFxcXC06XFxcXCtcXFxccHtMfV0rJCcgKSxcbiAgICAgIGNoZWNrICggcmFuayA+IDAgKSApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByZWYgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBzICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICB2ICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBvICAgICAgICAganNvbiAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCByb3dpZCByZWdleHAgJ150Om1yOjNwbDpSPVxcXFxkKyQnICksXG4gICAgICAtLSB1bmlxdWUgKCByZWYsIHMsIHYsIG8gKVxuICAgICAgZm9yZWlnbiBrZXkgKCByZWYgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfbGluZXMgKCByb3dpZCApLFxuICAgICAgZm9yZWlnbiBrZXkgKCB2ICAgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfdmVyYnMgKCB2ICkgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRyaWdnZXIganpyX21pcnJvcl90cmlwbGVzX3JlZ2lzdGVyXG4gICAgICBiZWZvcmUgaW5zZXJ0IG9uIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlXG4gICAgICBmb3IgZWFjaCByb3cgYmVnaW5cbiAgICAgICAgc2VsZWN0IHRyaWdnZXJfb25fYmVmb3JlX2luc2VydCggJ2p6cl9taXJyb3JfdHJpcGxlc19iYXNlJyxcbiAgICAgICAgICAncm93aWQ6JywgbmV3LnJvd2lkLCAncmVmOicsIG5ldy5yZWYsICdzOicsIG5ldy5zLCAndjonLCBuZXcudiwgJ286JywgbmV3Lm8gKTtcbiAgICAgICAgZW5kO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgKFxuICAgICAgICByb3dpZCAgICAgICAgICAgdGV4dCAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcmVmICAgICAgICAgICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHN5bGxhYmxlX2hhbmcgICB0ZXh0ICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBzeWxsYWJsZV9sYXRuICAgdGV4dCAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGluaXRpYWxfbGF0biB8fCBtZWRpYWxfbGF0biB8fCBmaW5hbF9sYXRuICkgdmlydHVhbCxcbiAgICAgICAgLS0gc3lsbGFibGVfbGF0biAgIHRleHQgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGluaXRpYWxfbGF0biB8fCBtZWRpYWxfbGF0biB8fCBmaW5hbF9sYXRuICkgdmlydHVhbCxcbiAgICAgICAgaW5pdGlhbF9oYW5nICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIG1lZGlhbF9oYW5nICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBmaW5hbF9oYW5nICAgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgaW5pdGlhbF9sYXRuICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIG1lZGlhbF9sYXRuICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBmaW5hbF9sYXRuICAgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNoZWNrICggcm93aWQgcmVnZXhwICdedDpsYW5nOmhhbmc6c3lsOlY9XFxcXFMrJCcgKVxuICAgICAgLS0gdW5pcXVlICggcmVmLCBzLCB2LCBvIClcbiAgICAgIC0tIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xpbmVzICggcm93aWQgKVxuICAgICAgLS0gZm9yZWlnbiBrZXkgKCBzeWxsYWJsZV9oYW5nICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoIG8gKSApXG4gICAgICApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdHJpZ2dlciBqenJfbGFuZ19oYW5nX3N5bGxhYmxlc19yZWdpc3RlclxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfbGFuZ19oYW5nX3N5bGxhYmxlc1xuICAgICAgZm9yIGVhY2ggcm93IGJlZ2luXG4gICAgICAgIHNlbGVjdCB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfbGFuZ19oYW5nX3N5bGxhYmxlcycsXG4gICAgICAgICAgbmV3LnJvd2lkLCBuZXcucmVmLCBuZXcuc3lsbGFibGVfaGFuZywgbmV3LnN5bGxhYmxlX2xhdG4sXG4gICAgICAgICAgICBuZXcuaW5pdGlhbF9oYW5nLCBuZXcubWVkaWFsX2hhbmcsIG5ldy5maW5hbF9oYW5nLFxuICAgICAgICAgICAgbmV3LmluaXRpYWxfbGF0biwgbmV3Lm1lZGlhbF9sYXRuLCBuZXcuZmluYWxfbGF0biApO1xuICAgICAgICBlbmQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyBzLCBudWxsIGFzIHYsIG51bGwgYXMgbyB3aGVyZSBmYWxzZSB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tTGF0bicsICAgICAgICAgIHN5bGxhYmxlX2xhdG4gICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tTGF0bjppbml0aWFsJywgIGluaXRpYWxfbGF0biAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tTGF0bjptZWRpYWwnLCAgIG1lZGlhbF9sYXRuICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tTGF0bjpmaW5hbCcsICAgIGZpbmFsX2xhdG4gICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tSGFuZzppbml0aWFsJywgIGluaXRpYWxfaGFuZyAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tSGFuZzptZWRpYWwnLCAgIG1lZGlhbF9oYW5nICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICdjOnJlYWRpbmc6a28tSGFuZzpmaW5hbCcsICAgIGZpbmFsX2hhbmcgICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfYWxsX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyBzLCBudWxsIGFzIHYsIG51bGwgYXMgbyB3aGVyZSBmYWxzZSB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0ICogZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCAqIGZyb20ganpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlcyB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwgd2hlcmUgZmFsc2VcbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyByYW5rLCBudWxsIGFzIHMsIG51bGwgYXMgdiwgbnVsbCBhcyBvIHdoZXJlIGZhbHNlXG4gICAgICAtLSAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHRiMS5yb3dpZCwgdGIxLnJlZiwgdmIxLnJhbmssIHRiMS5zLCB0YjEudiwgdGIxLm8gZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0YjFcbiAgICAgIGpvaW4ganpyX21pcnJvcl92ZXJicyBhcyB2YjEgdXNpbmcgKCB2IClcbiAgICAgIHdoZXJlIHZiMS52IGxpa2UgJ2M6JSdcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgdGIyLnJvd2lkLCB0YjIucmVmLCB2YjIucmFuaywgdGIyLnMsIGtyLnYsIGtyLm8gZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0YjJcbiAgICAgIGpvaW4ganpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlcyBhcyBrciBvbiAoIHRiMi52ID0gJ2M6cmVhZGluZzprby1IYW5nJyBhbmQgdGIyLm8gPSBrci5zIClcbiAgICAgIGpvaW4ganpyX21pcnJvcl92ZXJicyBhcyB2YjIgb24gKCBrci52ID0gdmIyLnYgKVxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsIHdoZXJlIGZhbHNlXG4gICAgICBvcmRlciBieSBzLCB2LCBvXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl90b3BfdHJpcGxlcyBhc1xuICAgICAgc2VsZWN0ICogZnJvbSBqenJfdHJpcGxlc1xuICAgICAgd2hlcmUgcmFuayA9IDFcbiAgICAgIG9yZGVyIGJ5IHMsIHYsIG9cbiAgICAgIDtcIlwiXCJcblxuICAgICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2Nqa19hZ2dfbGF0biBhc1xuICAgICAgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcyxcbiAgICAgICAgICB2IHx8ICc6YWxsJyAgICAgICAgICAgICAgICAgICBhcyB2LFxuICAgICAgICAgIGpzb25fZ3JvdXBfYXJyYXkoIG8gKSBvdmVyIHcgIGFzIG9zXG4gICAgICAgIGZyb20ganpyX3RvcF90cmlwbGVzXG4gICAgICAgIHdoZXJlIHYgaW4gKCAnYzpyZWFkaW5nOnpoLUxhdG4tcGlueWluJywnYzpyZWFkaW5nOmphLXgtS2F0K0xhdG4nLCAnYzpyZWFkaW5nOmtvLUxhdG4nKVxuICAgICAgICB3aW5kb3cgdyBhcyAoIHBhcnRpdGlvbiBieSBzLCB2IG9yZGVyIGJ5IG9cbiAgICAgICAgICByb3dzIGJldHdlZW4gdW5ib3VuZGVkIHByZWNlZGluZyBhbmQgdW5ib3VuZGVkIGZvbGxvd2luZyApXG4gICAgICAgIG9yZGVyIGJ5IHMsIHYsIG9zXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9jamtfYWdnMl9sYXRuIGFzXG4gICAgICBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICB0dDEucyAgIGFzIHMsXG4gICAgICAgICAgdHQyLm9zICBhcyByZWFkaW5nc196aCxcbiAgICAgICAgICB0dDMub3MgIGFzIHJlYWRpbmdzX2phLFxuICAgICAgICAgIHR0NC5vcyAgYXMgcmVhZGluZ3Nfa29cbiAgICAgICAgZnJvbSAgICAgIGp6cl9jamtfYWdnX2xhdG4gYXMgdHQxXG4gICAgICAgIGxlZnQgam9pbiBqenJfY2prX2FnZ19sYXRuIGFzIHR0MiBvbiAoIHR0MS5zID0gdHQyLnMgYW5kIHR0Mi52ID0gJ2M6cmVhZGluZzp6aC1MYXRuLXBpbnlpbjphbGwnIClcbiAgICAgICAgbGVmdCBqb2luIGp6cl9jamtfYWdnX2xhdG4gYXMgdHQzIG9uICggdHQxLnMgPSB0dDMucyBhbmQgdHQzLnYgPSAnYzpyZWFkaW5nOmphLXgtS2F0K0xhdG46YWxsJyAgKVxuICAgICAgICBsZWZ0IGpvaW4ganpyX2Nqa19hZ2dfbGF0biBhcyB0dDQgb24gKCB0dDEucyA9IHR0NC5zIGFuZCB0dDQudiA9ICdjOnJlYWRpbmc6a28tTGF0bjphbGwnICAgICAgICApXG4gICAgICAgIG9yZGVyIGJ5IHNcbiAgICAgIDtcIlwiXCJcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX3JlYWRpbmdfcGFpcnNfemhfamEgYXNcbiAgICAgIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIHQxLnMgICAgICBhcyBzLFxuICAgICAgICAgIHQyLnZhbHVlICBhcyByZWFkaW5nX3poLFxuICAgICAgICAgIHQzLnZhbHVlICBhcyByZWFkaW5nX2phXG4gICAgICAgIGZyb20ganpyX2Nqa19hZ2cyX2xhdG4gYXMgdDEsXG4gICAgICAgIGpzb25fZWFjaCggdDEucmVhZGluZ3NfemggKSBhcyB0MixcbiAgICAgICAganNvbl9lYWNoKCB0MS5yZWFkaW5nc19qYSApIGFzIHQzXG4gICAgICAgIHdoZXJlIHJlYWRpbmdfemggbm90IGluICggJ3l1JywgJ2NoaScgKSAtLSBleGNsdWRlIG5vbi1ob21vcGhvbmVzXG4gICAgICAgIG9yZGVyIGJ5IHQyLnZhbHVlLCB0My52YWx1ZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfcmVhZGluZ19wYWlyc196aF9qYV9hZ2cgYXNcbiAgICAgIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIHJlYWRpbmdfemgsXG4gICAgICAgICAgcmVhZGluZ19qYSxcbiAgICAgICAgICBqc29uX2dyb3VwX2FycmF5KCBzICkgb3ZlciB3IGFzIGNocnNcbiAgICAgICAgZnJvbSBqenJfcmVhZGluZ19wYWlyc196aF9qYSBhcyB0MVxuICAgICAgICB3aW5kb3cgdyBhcyAoIHBhcnRpdGlvbiBieSB0MS5yZWFkaW5nX3poLCB0MS5yZWFkaW5nX2phIG9yZGVyIGJ5IHQxLnNcbiAgICAgICAgICByb3dzIGJldHdlZW4gdW5ib3VuZGVkIHByZWNlZGluZyBhbmQgdW5ib3VuZGVkIGZvbGxvd2luZyApXG4gICAgICBvcmRlciBieSByZWFkaW5nX3poLCByZWFkaW5nX2phXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9yZWFkaW5nX3BhaXJzX3poX2tvIGFzXG4gICAgICBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICB0MS5zICAgICAgYXMgcyxcbiAgICAgICAgICB0Mi52YWx1ZSAgYXMgcmVhZGluZ196aCxcbiAgICAgICAgICB0My52YWx1ZSAgYXMgcmVhZGluZ19rb1xuICAgICAgICBmcm9tIGp6cl9jamtfYWdnMl9sYXRuIGFzIHQxLFxuICAgICAgICBqc29uX2VhY2goIHQxLnJlYWRpbmdzX3poICkgYXMgdDIsXG4gICAgICAgIGpzb25fZWFjaCggdDEucmVhZGluZ3Nfa28gKSBhcyB0M1xuICAgICAgICB3aGVyZSByZWFkaW5nX3poIG5vdCBpbiAoICd5dScsICdjaGknICkgLS0gZXhjbHVkZSBub24taG9tb3Bob25lc1xuICAgICAgICBvcmRlciBieSB0Mi52YWx1ZSwgdDMudmFsdWVcbiAgICAgIDtcIlwiXCJcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX3JlYWRpbmdfcGFpcnNfemhfa29fYWdnIGFzXG4gICAgICBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICByZWFkaW5nX3poLFxuICAgICAgICAgIHJlYWRpbmdfa28sXG4gICAgICAgICAganNvbl9ncm91cF9hcnJheSggcyApIG92ZXIgdyBhcyBjaHJzXG4gICAgICAgIGZyb20ganpyX3JlYWRpbmdfcGFpcnNfemhfa28gYXMgdDFcbiAgICAgICAgd2luZG93IHcgYXMgKCBwYXJ0aXRpb24gYnkgdDEucmVhZGluZ196aCwgdDEucmVhZGluZ19rbyBvcmRlciBieSB0MS5zXG4gICAgICAgICAgcm93cyBiZXR3ZWVuIHVuYm91bmRlZCBwcmVjZWRpbmcgYW5kIHVuYm91bmRlZCBmb2xsb3dpbmcgKVxuICAgICAgb3JkZXIgYnkgcmVhZGluZ196aCwgcmVhZGluZ19rb1xuICAgICAgO1wiXCJcIlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfZXF1aXZhbGVudF9yZWFkaW5nX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdFxuICAgICAgICAgIHQxLnJlYWRpbmdfemggYXMgcmVhZGluZ196aCxcbiAgICAgICAgICB0MS5yZWFkaW5nX2phIGFzIHJlYWRpbmdfamEsXG4gICAgICAgICAgdDIucmVhZGluZ19rbyBhcyByZWFkaW5nX2tvLFxuICAgICAgICAgIHQxLnMgICAgICAgICAgYXMgc1xuICAgICAgICBmcm9tIGp6cl9yZWFkaW5nX3BhaXJzX3poX2phIGFzIHQxXG4gICAgICAgIGpvaW4ganpyX3JlYWRpbmdfcGFpcnNfemhfa28gYXMgdDIgb24gKCB0MS5zID0gdDIucyBhbmQgdDEucmVhZGluZ196aCA9IHQyLnJlYWRpbmdfa28gKVxuICAgICAgICB3aGVyZSB0MS5yZWFkaW5nX3poID0gdDEucmVhZGluZ19qYVxuICAgICAgICBvcmRlciBieSB0MS5yZWFkaW5nX3poLCB0MS5zXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9iYW5kX25hbWVzIGFzXG4gICAgICBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICB0MS5zICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGMxLFxuICAgICAgICAgIHQyLnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgYzIsXG4gICAgICAgICAgdDEucmVhZGluZ196aCB8fCAnICcgfHwgdDIucmVhZGluZ196aCBhcyByZWFkaW5nXG4gICAgICAgIGZyb20ganpyX2VxdWl2YWxlbnRfcmVhZGluZ190cmlwbGVzIGFzIHQxXG4gICAgICAgIGpvaW4ganpyX2VxdWl2YWxlbnRfcmVhZGluZ190cmlwbGVzIGFzIHQyXG4gICAgICAgIHdoZXJlIHRydWVcbiAgICAgICAgICBhbmQgKCBjMSAhPSBjMiApXG4gICAgICAgICAgYW5kICggYzEgbm90IGluICggJ+a6gCcsICfon4cnLCAn5bylJywgJ+S+rScsICflsL0nLCAn5by5JywgJ+W8vicgKSApXG4gICAgICAgICAgYW5kICggYzIgbm90IGluICggJ+a6gCcsICfon4cnLCAn5bylJywgJ+S+rScsICflsL0nLCAn5by5JywgJ+W8vicgKSApXG4gICAgICAgIG9yZGVyIGJ5IHJlYWRpbmdcbiAgICAgIDtcIlwiXCJcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2JhbmRfbmFtZXNfMiBhc1xuICAgICAgc2VsZWN0XG4gICAgICAgICAgYzEgfHwgYzIgYXMgY1xuICAgICAgICBmcm9tIGp6cl9iYW5kX25hbWVzXG4gICAgICAgIG9yZGVyIGJ5IHJlYWRpbmdcbiAgICAgIDtcIlwiXCJcblxuICAgICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9jb21wb25lbnRzIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcmVmICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbGV2ZWwgICAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbG5yICAgICAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgcm5yICAgICAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgZ2x5cGggICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgY29tcG9uZW50IHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoICggbGVuZ3RoKCBnbHlwaCAgICAgKSA9IDEgKSBvciAoIGdseXBoICAgICAgcmVnZXhwICdeJltcXFxcLWEtejAtOV9dKyNbMC05YS1mXXs0LDZ9OyQnICkgKSxcbiAgICAgIGNoZWNrICggKCBsZW5ndGgoIGNvbXBvbmVudCApID0gMSApIG9yICggY29tcG9uZW50ICByZWdleHAgJ14mW1xcXFwtYS16MC05X10rI1swLTlhLWZdezQsNn07JCcgKSApLFxuICAgICAgY2hlY2sgKCByb3dpZCByZWdleHAgJ14uKiQnIClcbiAgICAgICk7XCJcIlwiXG5cblxuICAgICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcgX2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzIGFzIHNlbGVjdFxuICAgICAgICBtbC5yb3dpZCAgYXMgcm93aWQsXG4gICAgICAgIG1sLnJlZiAgICBhcyByZWYsXG4gICAgICAgIG1sLmxpbmUgICBhcyBsaW5lXG4gICAgICBmcm9tIGp6cl9taXJyb3JfbGluZXMgYXMgbWxcbiAgICAgIHdoZXJlIHRydWVcbiAgICAgICAgYW5kICggbm90IGlzX3VjX25vcm1hbCggbWwubGluZSApIClcbiAgICAgIG9yZGVyIGJ5IG1sLnJvd2lkO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBfanpyX21ldGFfa3JfcmVhZGluZ3NfdW5rbm93bl92ZXJiX2ZhdWx0cyBhcyBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICBjb3VudCgqKSBvdmVyICggcGFydGl0aW9uIGJ5IHYgKSAgICBhcyBjb3VudCxcbiAgICAgICAgICAnanpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlczpSPSonICBhcyByb3dpZCxcbiAgICAgICAgICAnKicgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgJ3Vua25vd24tdmVyYicgICAgICAgICAgICAgICAgICAgICAgYXMgZGVzY3JpcHRpb24sXG4gICAgICAgICAgdiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcXVvdGVcbiAgICAgICAgZnJvbSBqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzIGFzIG5uXG4gICAgICAgIHdoZXJlIG5vdCBleGlzdHMgKCBzZWxlY3QgMSBmcm9tIGp6cl9taXJyb3JfdmVyYnMgYXMgdmIgd2hlcmUgdmIudiA9IG5uLnYgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcgX2p6cl9tZXRhX2Vycm9yX3ZlcmJfZmF1bHRzIGFzIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIGNvdW50KCopIG92ZXIgKCBwYXJ0aXRpb24gYnkgdiApICAgIGFzIGNvdW50LFxuICAgICAgICAgICdlcnJvcjpSPSonICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJvd2lkLFxuICAgICAgICAgIHJvd2lkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAnZXJyb3ItdmVyYicgICAgICAgICAgICAgICAgICAgICAgICBhcyBkZXNjcmlwdGlvbixcbiAgICAgICAgICAndjonIHx8IHYgfHwgJywgbzonIHx8IG8gICAgICAgICAgICBhcyBxdW90ZVxuICAgICAgICBmcm9tIGp6cl90cmlwbGVzIGFzIG5uXG4gICAgICAgIHdoZXJlIHYgbGlrZSAnJTplcnJvcic7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV9taXJyb3JfbGluZXNfd2hpdGVzcGFjZV9mYXVsdHMgYXMgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgMSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgY291bnQsXG4gICAgICAgICAgJ3Q6bXI6bG46amZpZWxkczp3czpSPSonICAgICAgICAgICAgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgICAgbWwucm93aWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICdleHRyYW5lb3VzLXdoaXRlc3BhY2UnICAgICAgICAgICAgICAgICAgICAgIGFzIGRlc2NyaXB0aW9uLFxuICAgICAgICAgIG1sLmpmaWVsZHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHF1b3RlXG4gICAgICAgIGZyb20ganpyX21pcnJvcl9saW5lcyBhcyBtbFxuICAgICAgICB3aGVyZSAoIGhhc19wZXJpcGhlcmFsX3dzX2luX2pmaWVsZCggamZpZWxkcyApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9tZXRhX2ZhdWx0cyBhc1xuICAgICAgc2VsZWN0IG51bGwgYXMgY291bnQsIG51bGwgYXMgcm93aWQsIG51bGwgYXMgcmVmLCBudWxsIGFzIGRlc2NyaXB0aW9uLCBudWxsICBhcyBxdW90ZSB3aGVyZSBmYWxzZSB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IDEsIHJvd2lkLCByZWYsICAndWMtbm9ybWFsaXphdGlvbicsIGxpbmUgIGFzIHF1b3RlIGZyb20gX2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzICAgICAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX2tyX3JlYWRpbmdzX3Vua25vd25fdmVyYl9mYXVsdHMgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX2Vycm9yX3ZlcmJfZmF1bHRzICAgICAgICAgICAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX21pcnJvcl9saW5lc193aGl0ZXNwYWNlX2ZhdWx0cyAgIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9zeWxsYWJsZXMgYXMgc2VsZWN0XG4gICAgIyAgICAgICB0MS5zXG4gICAgIyAgICAgICB0MS52XG4gICAgIyAgICAgICB0MS5vXG4gICAgIyAgICAgICB0aS5zIGFzIGluaXRpYWxfaGFuZ1xuICAgICMgICAgICAgdG0ucyBhcyBtZWRpYWxfaGFuZ1xuICAgICMgICAgICAgdGYucyBhcyBmaW5hbF9oYW5nXG4gICAgIyAgICAgICB0aS5vIGFzIGluaXRpYWxfbGF0blxuICAgICMgICAgICAgdG0ubyBhcyBtZWRpYWxfbGF0blxuICAgICMgICAgICAgdGYubyBhcyBmaW5hbF9sYXRuXG4gICAgIyAgICAgZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0MVxuICAgICMgICAgIGpvaW5cbiAgICAjICAgICBqb2luIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHRpIG9uICggdDEuKVxuICAgICMgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMjIyBhZ2dyZWdhdGUgdGFibGUgZm9yIGFsbCByb3dpZHMgZ29lcyBoZXJlICMjI1xuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIyNcblxuICAgICAgICAgICAgICAgLiAgICAgICAgICAgICAgICAgLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAubzggICAgICAgICAgICAgICAubzggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm84XG4gICAub29vby5vIC5vODg4b28gIC5vb29vLiAgIC5vODg4b28gIC5vb29vby4gIG9vby4gLm9vLiAgLm9vLiAgICAub29vb28uICBvb28uIC5vby4gICAubzg4OG9vICAub29vby5vXG4gIGQ4OCggIFwiOCAgIDg4OCAgIGBQICApODhiICAgIDg4OCAgIGQ4OCcgYDg4YiBgODg4UFwiWTg4YlBcIlk4OGIgIGQ4OCcgYDg4YiBgODg4UFwiWTg4YiAgICA4ODggICBkODgoICBcIjhcbiAgYFwiWTg4Yi4gICAgODg4ICAgIC5vUFwiODg4ICAgIDg4OCAgIDg4OG9vbzg4OCAgODg4ICAgODg4ICAgODg4ICA4ODhvb284ODggIDg4OCAgIDg4OCAgICA4ODggICBgXCJZODhiLlxuICBvLiAgKTg4YiAgIDg4OCAuIGQ4KCAgODg4ICAgIDg4OCAuIDg4OCAgICAubyAgODg4ICAgODg4ICAgODg4ICA4ODggICAgLm8gIDg4OCAgIDg4OCAgICA4ODggLiBvLiAgKTg4YlxuICA4XCJcIjg4OFAnICAgXCI4ODhcIiBgWTg4OFwiXCI4byAgIFwiODg4XCIgYFk4Ym9kOFAnIG84ODhvIG84ODhvIG84ODhvIGBZOGJvZDhQJyBvODg4byBvODg4byAgIFwiODg4XCIgOFwiXCI4ODhQJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAc3RhdGVtZW50czpcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9kYXRhc291cmNlOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9kYXRhc291cmNlcyAoIHJvd2lkLCBkc2tleSwgcGF0aCApIHZhbHVlcyAoICRyb3dpZCwgJGRza2V5LCAkcGF0aCApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggZHNrZXkgKSBkbyB1cGRhdGUgc2V0IHBhdGggPSBleGNsdWRlZC5wYXRoXG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9taXJyb3JfdmVyYjogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3ZlcmJzICggcm93aWQsIHJhbmssIHMsIHYsIG8gKSB2YWx1ZXMgKCAkcm93aWQsICRyYW5rLCAkcywgJHYsICRvIClcbiAgICAgICAgLS0gb24gY29uZmxpY3QgKCByb3dpZCApIGRvIHVwZGF0ZSBzZXQgcmFuayA9IGV4Y2x1ZGVkLnJhbmssIHMgPSBleGNsdWRlZC5zLCB2ID0gZXhjbHVkZWQudiwgbyA9IGV4Y2x1ZGVkLm9cbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX21pcnJvcl9sY29kZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX2xjb2RlcyAoIHJvd2lkLCBsY29kZSwgY29tbWVudCApIHZhbHVlcyAoICRyb3dpZCwgJGxjb2RlLCAkY29tbWVudCApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcm93aWQgKSBkbyB1cGRhdGUgc2V0IGxjb2RlID0gZXhjbHVkZWQubGNvZGUsIGNvbW1lbnQgPSBleGNsdWRlZC5jb21tZW50XG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9taXJyb3JfdHJpcGxlOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICggcm93aWQsIHJlZiwgcywgdiwgbyApIHZhbHVlcyAoICRyb3dpZCwgJHJlZiwgJHMsICR2LCAkbyApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcmVmLCBzLCB2LCBvICkgZG8gbm90aGluZ1xuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9taXJyb3JfbGluZXM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl9saW5lcyAoIGRza2V5LCBsaW5lX25yLCBsY29kZSwgbGluZSwgamZpZWxkcyApXG4gICAgICBzZWxlY3RcbiAgICAgICAgLS0gJ3Q6bXI6bG46Uj0nIHx8IHJvd19udW1iZXIoKSBvdmVyICgpICAgICAgICAgIGFzIHJvd2lkLFxuICAgICAgICAtLSBkcy5kc2tleSB8fCAnOkw9JyB8fCBmbC5saW5lX25yICAgYXMgcm93aWQsXG4gICAgICAgIGRzLmRza2V5ICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBkc2tleSxcbiAgICAgICAgZmwubGluZV9uciAgICAgICAgICAgICAgICAgICAgICAgIGFzIGxpbmVfbnIsXG4gICAgICAgIGZsLmxjb2RlICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBsY29kZSxcbiAgICAgICAgZmwubGluZSAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGxpbmUsXG4gICAgICAgIGZsLmpmaWVsZHMgICAgICAgICAgICAgICAgICAgICAgICBhcyBqZmllbGRzXG4gICAgICBmcm9tIGp6cl9kYXRhc291cmNlcyAgICAgICAgYXMgZHNcbiAgICAgIGpvaW4gZmlsZV9saW5lcyggZHMucGF0aCApICBhcyBmbFxuICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgLS0gb24gY29uZmxpY3QgKCBkc2tleSwgbGluZV9uciApIGRvIHVwZGF0ZSBzZXQgbGluZSA9IGV4Y2x1ZGVkLmxpbmVcbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcG9wdWxhdGVfanpyX21pcnJvcl90cmlwbGVzOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICggcm93aWQsIHJlZiwgcywgdiwgbyApXG4gICAgICAgIHNlbGVjdFxuICAgICAgICAgICAgZ3Qucm93aWRfb3V0ICAgIGFzIHJvd2lkLFxuICAgICAgICAgICAgZ3QucmVmICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAgIGd0LnMgICAgICAgICAgICBhcyBzLFxuICAgICAgICAgICAgZ3QudiAgICAgICAgICAgIGFzIHYsXG4gICAgICAgICAgICBndC5vICAgICAgICAgICAgYXMgb1xuICAgICAgICAgIGZyb20ganpyX21pcnJvcl9saW5lcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBtbFxuICAgICAgICAgIGpvaW4gZ2V0X3RyaXBsZXMoIG1sLnJvd2lkLCBtbC5kc2tleSwgbWwuamZpZWxkcyApICBhcyBndFxuICAgICAgICAgIHdoZXJlIHRydWVcbiAgICAgICAgICAgIGFuZCAoIG1sLmxjb2RlID0gJ0QnIClcbiAgICAgICAgICAgIC0tIGFuZCAoIG1sLmRza2V5ID0gJ2RpY3Q6bWVhbmluZ3MnIClcbiAgICAgICAgICAgIGFuZCAoIG1sLmpmaWVsZHMgaXMgbm90IG51bGwgKVxuICAgICAgICAgICAgYW5kICggbWwuamZpZWxkcy0+PickWzBdJyBub3QgcmVnZXhwICdeQGdseXBocycgKVxuICAgICAgICAgICAgLS0gYW5kICggbWwuZmllbGRfMyByZWdleHAgJ14oPzpweXxoaXxrYSk6JyApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcmVmLCBzLCB2LCBvICkgZG8gbm90aGluZ1xuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9sYW5nX2hhbmdldWxfc3lsbGFibGVzOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzICggcm93aWQsIHJlZixcbiAgICAgICAgc3lsbGFibGVfaGFuZywgaW5pdGlhbF9oYW5nLCBtZWRpYWxfaGFuZywgZmluYWxfaGFuZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxfbGF0biwgbWVkaWFsX2xhdG4sIGZpbmFsX2xhdG4gKVxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICAgICd0Omxhbmc6aGFuZzpzeWw6Vj0nIHx8IG10Lm8gICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgICAgICBtdC5yb3dpZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAgIG10Lm8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgc3lsbGFibGVfaGFuZyxcbiAgICAgICAgICAgIGRoLmluaXRpYWwgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgaW5pdGlhbF9oYW5nLFxuICAgICAgICAgICAgZGgubWVkaWFsICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBtZWRpYWxfaGFuZyxcbiAgICAgICAgICAgIGRoLmZpbmFsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZmluYWxfaGFuZyxcbiAgICAgICAgICAgIGNvYWxlc2NlKCBtdGkubywgJycgKSAgICAgICAgICAgICAgICAgYXMgaW5pdGlhbF9sYXRuLFxuICAgICAgICAgICAgY29hbGVzY2UoIG10bS5vLCAnJyApICAgICAgICAgICAgICAgICBhcyBtZWRpYWxfbGF0bixcbiAgICAgICAgICAgIGNvYWxlc2NlKCBtdGYubywgJycgKSAgICAgICAgICAgICAgICAgYXMgZmluYWxfbGF0blxuICAgICAgICAgIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgICAgICAgICAgICAgYXMgbXRcbiAgICAgICAgICBsZWZ0IGpvaW4gZGlzYXNzZW1ibGVfaGFuZ2V1bCggbXQubyApICAgIGFzIGRoXG4gICAgICAgICAgbGVmdCBqb2luIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIG10aSBvbiAoIG10aS5zID0gZGguaW5pdGlhbCBhbmQgbXRpLnYgPSAneDprby1IYW5nK0xhdG46aW5pdGlhbCcgKVxuICAgICAgICAgIGxlZnQgam9pbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyBtdG0gb24gKCBtdG0ucyA9IGRoLm1lZGlhbCAgYW5kIG10bS52ID0gJ3g6a28tSGFuZytMYXRuOm1lZGlhbCcgIClcbiAgICAgICAgICBsZWZ0IGpvaW4ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgbXRmIG9uICggbXRmLnMgPSBkaC5maW5hbCAgIGFuZCBtdGYudiA9ICd4OmtvLUhhbmcrTGF0bjpmaW5hbCcgICApXG4gICAgICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICAgICAgYW5kICggbXQudiA9ICdjOnJlYWRpbmc6a28tSGFuZycgKVxuICAgICAgICAgIG9yZGVyIGJ5IG10Lm9cbiAgICAgICAgLS0gb24gY29uZmxpY3QgKCByb3dpZCAgICAgICAgICkgZG8gbm90aGluZ1xuICAgICAgICAvKiAjIyMgTk9URSBgb24gY29uZmxpY3RgIG5lZWRlZCBiZWNhdXNlIHdlIGxvZyBhbGwgYWN0dWFsbHkgb2NjdXJyaW5nIHJlYWRpbmdzIG9mIGFsbCBjaGFyYWN0ZXJzICovXG4gICAgICAgIG9uIGNvbmZsaWN0ICggc3lsbGFibGVfaGFuZyApIGRvIG5vdGhpbmdcbiAgICAgICAgO1wiXCJcIlxuXG4gICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIyMjXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvb29vICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgODg4ICAgICAgICAgICAgICAubzhcbiAgb28ub29vb28uICAgLm9vb29vLiAgb28ub29vb28uICBvb29vICBvb29vICAgODg4ICAgLm9vb28uICAgLm84ODhvbyAgLm9vb29vLlxuICAgODg4JyBgODhiIGQ4OCcgYDg4YiAgODg4JyBgODhiIGA4ODggIGA4ODggICA4ODggIGBQICApODhiICAgIDg4OCAgIGQ4OCcgYDg4YlxuICAgODg4ICAgODg4IDg4OCAgIDg4OCAgODg4ICAgODg4ICA4ODggICA4ODggICA4ODggICAub1BcIjg4OCAgICA4ODggICA4ODhvb284ODhcbiAgIDg4OCAgIDg4OCA4ODggICA4ODggIDg4OCAgIDg4OCAgODg4ICAgODg4ICAgODg4ICBkOCggIDg4OCAgICA4ODggLiA4ODggICAgLm9cbiAgIDg4OGJvZDhQJyBgWThib2Q4UCcgIDg4OGJvZDhQJyAgYFY4OFZcIlY4UCcgbzg4OG8gYFk4ODhcIlwiOG8gICBcIjg4OFwiIGBZOGJvZDhQJ1xuICAgODg4ICAgICAgICAgICAgICAgICAgODg4XG4gIG84ODhvICAgICAgICAgICAgICAgIG84ODhvXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGNvZGVzOiAtPlxuICAgIGRlYnVnICfOqWp6cnNkYl9fMTEnLCAnX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9sY29kZXMnXG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0Om1yOmxjOlY9QicsIGxjb2RlOiAnQicsIGNvbW1lbnQ6ICdibGFuayBsaW5lJywgICB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0Om1yOmxjOlY9QycsIGxjb2RlOiAnQycsIGNvbW1lbnQ6ICdjb21tZW50IGxpbmUnLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0Om1yOmxjOlY9RCcsIGxjb2RlOiAnRCcsIGNvbW1lbnQ6ICdkYXRhIGxpbmUnLCAgICB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdmVyYnM6IC0+XG4gICAgIyMjIE5PVEVcbiAgICBpbiB2ZXJicywgaW5pdGlhbCBjb21wb25lbnQgaW5kaWNhdGVzIHR5cGUgb2Ygc3ViamVjdDpcbiAgICAgIGBjOmAgaXMgZm9yIHN1YmplY3RzIHRoYXQgYXJlIENKSyBjaGFyYWN0ZXJzXG4gICAgICBgeDpgIGlzIHVzZWQgZm9yIHVuY2xhc3NpZmllZCBzdWJqZWN0cyAocG9zc2libHkgdG8gYmUgcmVmaW5lZCBpbiB0aGUgZnV0dXJlKVxuICAgICMjI1xuICAgIGRlYnVnICfOqWp6cnNkYl9fMTInLCAnX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl92ZXJicydcbiAgICByb3dzID0gW1xuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj14OmtvLUhhbmcrTGF0bjppbml0aWFsJywgICAgICByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd4OmtvLUhhbmcrTGF0bjppbml0aWFsJywgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj14OmtvLUhhbmcrTGF0bjptZWRpYWwnLCAgICAgICByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd4OmtvLUhhbmcrTGF0bjptZWRpYWwnLCAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj14OmtvLUhhbmcrTGF0bjpmaW5hbCcsICAgICAgICByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd4OmtvLUhhbmcrTGF0bjpmaW5hbCcsICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6emgtTGF0bi1waW55aW4nLCAgICByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6emgtTGF0bi1waW55aW4nLCAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6amEteC1LYW4nLCAgICAgICAgICByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6amEteC1LYW4nLCAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6amEteC1IaXInLCAgICAgICAgICByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6amEteC1IaXInLCAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6amEteC1LYXQnLCAgICAgICAgICByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6amEteC1LYXQnLCAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6amEteC1MYXRuJywgICAgICAgICByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6amEteC1MYXRuJywgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6amEteC1IaXIrTGF0bicsICAgICByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6amEteC1IaXIrTGF0bicsICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6amEteC1LYXQrTGF0bicsICAgICByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6amEteC1LYXQrTGF0bicsICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6a28tSGFuZycsICAgICAgICAgICByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6a28tSGFuZycsICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6a28tTGF0bicsICAgICAgICAgICByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6a28tTGF0bicsICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6a28tSGFuZzppbml0aWFsJywgICByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6a28tSGFuZzppbml0aWFsJywgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6a28tSGFuZzptZWRpYWwnLCAgICByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6a28tSGFuZzptZWRpYWwnLCAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6a28tSGFuZzpmaW5hbCcsICAgICByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6a28tSGFuZzpmaW5hbCcsICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6a28tTGF0bjppbml0aWFsJywgICByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6a28tTGF0bjppbml0aWFsJywgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6a28tTGF0bjptZWRpYWwnLCAgICByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6a28tTGF0bjptZWRpYWwnLCAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnJlYWRpbmc6a28tTGF0bjpmaW5hbCcsICAgICByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICdjOnJlYWRpbmc6a28tTGF0bjpmaW5hbCcsICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnNoYXBlOmlkczpzaG9ydGVzdCcsICAgICAgICByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICdjOnNoYXBlOmlkczpzaG9ydGVzdCcsICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnNoYXBlOmlkczpzaG9ydGVzdDphc3QnLCAgICByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICdjOnNoYXBlOmlkczpzaG9ydGVzdDphc3QnLCAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnNoYXBlOmlkczpzaG9ydGVzdDplcnJvcicsICByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICdjOnNoYXBlOmlkczpzaG9ydGVzdDplcnJvcicsIG86IFwiTk5cIiwgfVxuICAgICAgIyB7IHJvd2lkOiAndDptcjp2YjpWPWM6c2hhcGU6aWRzOmhhcy1vcGVyYXRvcicsICAgIHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ2M6c2hhcGU6aWRzOmhhcy1vcGVyYXRvcicsICAgbzogXCJOTlwiLCB9XG4gICAgICAjIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpzaGFwZTppZHM6aGFzLWNvbXBvbmVudCcsICAgcmFuazogMiwgczogXCJOTlwiLCB2OiAnYzpzaGFwZTppZHM6aGFzLWNvbXBvbmVudCcsICBvOiBcIk5OXCIsIH1cbiAgICAgIF1cbiAgICBmb3Igcm93IGluIHJvd3NcbiAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX3ZlcmIucnVuIHJvd1xuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZXM6IC0+XG4gICAgZGVidWcgJ86panpyc2RiX18xMycsICdfb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZXMnXG4gICAgcGF0aHMgPSBnZXRfcGF0aHMoKVxuICAgICMgZHNrZXkgPSAnZGljdDp1Y2Q6djE0LjA6dWhkaWR4JzsgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0yJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZGljdDptZWFuaW5ncyc7ICAgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MScsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIGRza2V5ID0gJ2RpY3Q6eDprby1IYW5nK0xhdG4nOyAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTInLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkaWN0Ong6amEtS2FuK0xhdG4nOyAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0zJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkaWN0OmphOmthbmppdW0nOyAgICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj00JywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkaWN0OmphOmthbmppdW06YXV4JzsgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj01JywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkaWN0OmtvOlY9ZGF0YS1nb3YuY3N2JzsgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj02JywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkaWN0OmtvOlY9ZGF0YS1nb3YuanNvbic7ICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj03JywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkaWN0OmtvOlY9ZGF0YS1uYXZlci5jc3YnOyAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj04JywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkaWN0OmtvOlY9ZGF0YS1uYXZlci5qc29uJzsgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj05JywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkaWN0OmtvOlY9UkVBRE1FLm1kJzsgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xMCcsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIGRza2V5ID0gJ3NoYXBlOmlkc3YyJzsgICAgICAgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTExJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnc2hhcGU6emh6NWJmJzsgICAgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MTInLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICA7bnVsbFxuXG4gICMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIF9vbl9vcGVuX3BvcHVsYXRlX3ZlcmJzOiAtPlxuICAjICAgcGF0aHMgPSBnZXRfcGF0aHMoKVxuICAjICAgZHNrZXkgPSAnZGljdDptZWFuaW5ncyc7ICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICMgICBkc2tleSA9ICdkaWN0OnVjZDp2MTQuMDp1aGRpZHgnOyAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTInLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgIyAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzOiAtPlxuICAgIGRlYnVnICfOqWp6cnNkYl9fMTQnLCAnX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9saW5lcydcbiAgICBAc3RhdGVtZW50cy5wb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzLnJ1bigpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaWdnZXJfb25fYmVmb3JlX2luc2VydDogKCBuYW1lLCBmaWVsZHMuLi4gKSAtPlxuICAgICMgZGVidWcgJ86panpyc2RiX18xNScsIHsgbmFtZSwgZmllbGRzLCB9XG4gICAgQHN0YXRlLm1vc3RfcmVjZW50X2luc2VydGVkX3JvdyA9IHsgbmFtZSwgZmllbGRzLCB9XG4gICAgO251bGxcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICMjI1xuXG4gIG9vb29vICAgICBvb28gb29vb29vb29vby4gICBvb29vb29vb29vb29cbiAgYDg4OCcgICAgIGA4JyBgODg4JyAgIGBZOGIgIGA4ODgnICAgICBgOFxuICAgODg4ICAgICAgIDggICA4ODggICAgICA4ODggIDg4OCAgICAgICAgICAub29vby5vXG4gICA4ODggICAgICAgOCAgIDg4OCAgICAgIDg4OCAgODg4b29vbzggICAgZDg4KCAgXCI4XG4gICA4ODggICAgICAgOCAgIDg4OCAgICAgIDg4OCAgODg4ICAgIFwiICAgIGBcIlk4OGIuXG4gICBgODguICAgIC44JyAgIDg4OCAgICAgZDg4JyAgODg4ICAgICAgICAgby4gICk4OGJcbiAgICAgYFlib2RQJyAgICBvODg4Ym9vZDhQJyAgIG84ODhvICAgICAgICA4XCJcIjg4OFAnXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIEBmdW5jdGlvbnM6XG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIHRyaWdnZXJfb25fYmVmb3JlX2luc2VydDpcbiAgICAgICMjIyBOT1RFIGluIHRoZSBmdXR1cmUgdGhpcyBmdW5jdGlvbiBjb3VsZCB0cmlnZ2VyIGNyZWF0aW9uIG9mIHRyaWdnZXJzIG9uIGluc2VydHMgIyMjXG4gICAgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICAgdmFyYXJnczogICAgICAgIHRydWVcbiAgICAgIGNhbGw6ICggbmFtZSwgZmllbGRzLi4uICkgLT4gQHRyaWdnZXJfb25fYmVmb3JlX2luc2VydCBuYW1lLCBmaWVsZHMuLi5cblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyMjIE5PVEUgbW92ZWQgdG8gRGJyaWNfc3RkOyBjb25zaWRlciB0byBvdmVyd3JpdGUgd2l0aCB2ZXJzaW9uIHVzaW5nIGBzbGV2aXRoYW4vcmVnZXhgICMjI1xuICAgICMgcmVnZXhwOlxuICAgICMgICBvdmVyd3JpdGU6ICAgICAgdHJ1ZVxuICAgICMgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICMgICBjYWxsOiAoIHBhdHRlcm4sIHRleHQgKSAtPiBpZiAoICggbmV3IFJlZ0V4cCBwYXR0ZXJuLCAndicgKS50ZXN0IHRleHQgKSB0aGVuIDEgZWxzZSAwXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGlzX3VjX25vcm1hbDpcbiAgICAgIGRldGVybWluaXN0aWM6ICB0cnVlXG4gICAgICAjIyMgTk9URTogYWxzbyBzZWUgYFN0cmluZzo6aXNXZWxsRm9ybWVkKClgICMjI1xuICAgICAgY2FsbDogKCB0ZXh0LCBmb3JtID0gJ05GQycgKSAtPiBmcm9tX2Jvb2wgdGV4dCBpcyB0ZXh0Lm5vcm1hbGl6ZSBmb3JtICMjIyAnTkZDJywgJ05GRCcsICdORktDJywgb3IgJ05GS0QnICMjI1xuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBoYXNfcGVyaXBoZXJhbF93c19pbl9qZmllbGQ6XG4gICAgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICAgY2FsbDogKCBqZmllbGRzX2pzb24gKSAtPlxuICAgICAgICByZXR1cm4gZnJvbV9ib29sIGZhbHNlIHVubGVzcyAoIGpmaWVsZHMgPSBKU09OLnBhcnNlIGpmaWVsZHNfanNvbiApP1xuICAgICAgICByZXR1cm4gZnJvbV9ib29sIGpmaWVsZHMuc29tZSAoIHZhbHVlICkgLT4gLyheXFxzKXwoXFxzJCkvLnRlc3QgdmFsdWVcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIEB0YWJsZV9mdW5jdGlvbnM6XG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIHNwbGl0X3dvcmRzOlxuICAgICAgY29sdW1uczogICAgICBbICdrZXl3b3JkJywgXVxuICAgICAgcGFyYW1ldGVyczogICBbICdsaW5lJywgXVxuICAgICAgcm93czogKCBsaW5lICkgLT5cbiAgICAgICAga2V5d29yZHMgPSBsaW5lLnNwbGl0IC8oPzpcXHB7Wn0rKXwoKD86XFxwe1NjcmlwdD1IYW59KXwoPzpcXHB7TH0rKXwoPzpcXHB7Tn0rKXwoPzpcXHB7U30rKSkvdlxuICAgICAgICBmb3Iga2V5d29yZCBpbiBrZXl3b3Jkc1xuICAgICAgICAgIGNvbnRpbnVlIHVubGVzcyBrZXl3b3JkP1xuICAgICAgICAgIGNvbnRpbnVlIGlmIGtleXdvcmQgaXMgJydcbiAgICAgICAgICB5aWVsZCB7IGtleXdvcmQsIH1cbiAgICAgICAgO251bGxcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgZmlsZV9saW5lczpcbiAgICAgIGNvbHVtbnM6ICAgICAgWyAnbGluZV9ucicsICdsY29kZScsICdsaW5lJywgJ2pmaWVsZHMnIF1cbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAncGF0aCcsIF1cbiAgICAgIHJvd3M6ICggcGF0aCApIC0+XG4gICAgICAgIGZvciB7IGxucjogbGluZV9uciwgbGluZSwgZW9sLCB9IGZyb20gd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBwYXRoXG4gICAgICAgICAgbGluZSAgICA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLm5vcm1hbGl6ZV90ZXh0IGxpbmVcbiAgICAgICAgICBqZmllbGRzID0gbnVsbFxuICAgICAgICAgIHN3aXRjaCB0cnVlXG4gICAgICAgICAgICB3aGVuIC9eXFxzKiQvdi50ZXN0IGxpbmVcbiAgICAgICAgICAgICAgbGNvZGUgPSAnQidcbiAgICAgICAgICAgIHdoZW4gL15cXHMqIy92LnRlc3QgbGluZVxuICAgICAgICAgICAgICBsY29kZSA9ICdDJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBsY29kZSA9ICdEJ1xuICAgICAgICAgICAgICBqZmllbGRzICAgPSBKU09OLnN0cmluZ2lmeSBsaW5lLnNwbGl0ICdcXHQnXG4gICAgICAgICAgeWllbGQgeyBsaW5lX25yLCBsY29kZSwgbGluZSwgamZpZWxkcywgfVxuICAgICAgICA7bnVsbFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBnZXRfdHJpcGxlczpcbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAncm93aWRfaW4nLCAnZHNrZXknLCAnamZpZWxkcycsIF1cbiAgICAgIGNvbHVtbnM6ICAgICAgWyAncm93aWRfb3V0JywgJ3JlZicsICdzJywgJ3YnLCAnbycsIF1cbiAgICAgIHJvd3M6ICggcm93aWRfaW4sIGRza2V5LCBqZmllbGRzICkgLT5cbiAgICAgICAgZmllbGRzICA9IEpTT04ucGFyc2UgamZpZWxkc1xuICAgICAgICBlbnRyeSAgID0gZmllbGRzWyAyIF1cbiAgICAgICAgc3dpdGNoIGRza2V5XG4gICAgICAgICAgd2hlbiAnZGljdDp4OmtvLUhhbmcrTGF0bicgICAgICAgIHRoZW4geWllbGQgZnJvbSBAdHJpcGxlc19mcm9tX2RpY3RfeF9rb19IYW5nX0xhdG4gICAgICAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgICB3aGVuICdkaWN0Om1lYW5pbmdzJyB0aGVuIHN3aXRjaCB0cnVlXG4gICAgICAgICAgICB3aGVuICggZW50cnkuc3RhcnRzV2l0aCAncHk6JyApIHRoZW4geWllbGQgZnJvbSBAdHJpcGxlc19mcm9tX2NfcmVhZGluZ196aF9MYXRuX3BpbnlpbiAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgICAgIHdoZW4gKCBlbnRyeS5zdGFydHNXaXRoICdrYTonICkgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX2phX3hfS2FuICAgICAgICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAgICAgd2hlbiAoIGVudHJ5LnN0YXJ0c1dpdGggJ2hpOicgKSB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXNfZnJvbV9jX3JlYWRpbmdfamFfeF9LYW4gICAgICAgIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICAgICB3aGVuICggZW50cnkuc3RhcnRzV2l0aCAnaGc6JyApIHRoZW4geWllbGQgZnJvbSBAdHJpcGxlc19mcm9tX2NfcmVhZGluZ19rb19IYW5nICAgICAgICAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgICB3aGVuICdzaGFwZTppZHN2MicgICAgICAgICAgICAgICAgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fc2hhcGVfaWRzdjIgICAgICAgICAgICAgICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAjIHlpZWxkIGZyb20gQGdldF90cmlwbGVzIHJvd2lkX2luLCBkc2tleSwgamZpZWxkc1xuICAgICAgICA7bnVsbFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBkaXNhc3NlbWJsZV9oYW5nZXVsOlxuICAgICAgcGFyYW1ldGVyczogICBbICdoYW5nJywgXVxuICAgICAgY29sdW1uczogICAgICBbICdpbml0aWFsJywgJ21lZGlhbCcsICdmaW5hbCcsIF1cbiAgICAgIHJvd3M6ICggaGFuZyApIC0+XG4gICAgICAgIGphbW9zID0gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuX1RNUF9oYW5nZXVsLmRpc2Fzc2VtYmxlIGhhbmcsIHsgZmxhdHRlbjogZmFsc2UsIH1cbiAgICAgICAgZm9yIHsgZmlyc3Q6IGluaXRpYWwsIHZvd2VsOiBtZWRpYWwsIGxhc3Q6IGZpbmFsLCB9IGluIGphbW9zXG4gICAgICAgICAgeWllbGQgeyBpbml0aWFsLCBtZWRpYWwsIGZpbmFsLCB9XG4gICAgICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlwbGVzX2Zyb21fZGljdF94X2tvX0hhbmdfTGF0bjogKCByb3dpZF9pbiwgZHNrZXksIFsgcm9sZSwgcywgbywgXSApIC0+XG4gICAgcmVmICAgICAgID0gcm93aWRfaW5cbiAgICB2ICAgICAgICAgPSBcIng6a28tSGFuZytMYXRuOiN7cm9sZX1cIlxuICAgIG8gICAgICAgID89ICcnXG4gICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2LCBvLCB9XG4gICAgQHN0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX3poX0xhdG5fcGlueWluOiAoIHJvd2lkX2luLCBkc2tleSwgWyBfLCBzLCBlbnRyeSwgXSApIC0+XG4gICAgcmVmICAgICAgID0gcm93aWRfaW5cbiAgICB2ICAgICAgICAgPSAnYzpyZWFkaW5nOnpoLUxhdG4tcGlueWluJ1xuICAgIGZvciByZWFkaW5nIGZyb20gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9hdG9uYWxfemhfcmVhZGluZ3MgZW50cnlcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdiwgbzogcmVhZGluZywgfVxuICAgIEBzdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpcGxlc19mcm9tX2NfcmVhZGluZ19qYV94X0thbjogKCByb3dpZF9pbiwgZHNrZXksIFsgXywgcywgZW50cnksIF0gKSAtPlxuICAgIHJlZiAgICAgICA9IHJvd2lkX2luXG4gICAgaWYgZW50cnkuc3RhcnRzV2l0aCAna2E6J1xuICAgICAgdl94X0thbiAgID0gJ2M6cmVhZGluZzpqYS14LUthdCdcbiAgICAgIHZfTGF0biAgICA9ICdjOnJlYWRpbmc6amEteC1LYXQrTGF0bidcbiAgICBlbHNlXG4gICAgICB2X3hfS2FuICAgPSAnYzpyZWFkaW5nOmphLXgtSGlyJ1xuICAgICAgdl9MYXRuICAgID0gJ2M6cmVhZGluZzpqYS14LUhpcitMYXRuJ1xuICAgIGZvciByZWFkaW5nIGZyb20gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9qYV9yZWFkaW5ncyBlbnRyeVxuICAgICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiB2X3hfS2FuLCBvOiByZWFkaW5nLCB9XG4gICAgICAjIGZvciB0cmFuc2NyaXB0aW9uIGZyb20gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMucm9tYW5pemVfamFfa2FuYSByZWFkaW5nXG4gICAgICAjICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiB2X0xhdG4sIG86IHRyYW5zY3JpcHRpb24sIH1cbiAgICAgIHRyYW5zY3JpcHRpb24gPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5yb21hbml6ZV9qYV9rYW5hIHJlYWRpbmdcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogdl9MYXRuLCBvOiB0cmFuc2NyaXB0aW9uLCB9XG4gICAgQHN0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX2tvX0hhbmc6ICggcm93aWRfaW4sIGRza2V5LCBbIF8sIHMsIGVudHJ5LCBdICkgLT5cbiAgICByZWYgICAgICAgPSByb3dpZF9pblxuICAgIHYgICAgICAgICA9ICdjOnJlYWRpbmc6a28tSGFuZydcbiAgICBmb3IgcmVhZGluZyBmcm9tIEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfaGdfcmVhZGluZ3MgZW50cnlcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdiwgbzogcmVhZGluZywgfVxuICAgIEBzdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpcGxlc19mcm9tX3NoYXBlX2lkc3YyOiAoIHJvd2lkX2luLCBkc2tleSwgWyBfLCBzLCBmb3JtdWxhLCBdICkgLT5cbiAgICByZWYgICAgICAgPSByb3dpZF9pblxuICAgICMgZm9yIHJlYWRpbmcgZnJvbSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5wYXJzZV9pZHMgZm9ybXVsYVxuICAgICMgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHYsIG86IHJlYWRpbmcsIH1cbiAgICByZXR1cm4gbnVsbCBpZiAoIG5vdCBmb3JtdWxhPyApIG9yICggZm9ybXVsYSBpcyAnJyApXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6ICdjOnNoYXBlOmlkczpzaG9ydGVzdCcsIG86IGZvcm11bGEsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGVycm9yID0gbnVsbFxuICAgIHRyeSBmb3JtdWxhX2FzdCA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLnBhcnNlX2lkbHggZm9ybXVsYSBjYXRjaCBlcnJvclxuICAgICAgbyA9IEpTT04uc3RyaW5naWZ5IHsgcmVmOiAnzqlqenJzZGJfXzE2JywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSwgcm93OiB7IHJvd2lkX2luLCBkc2tleSwgcywgZm9ybXVsYSwgfSwgfVxuICAgICAgd2FybiBcImVycm9yOiAje299XCJcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ2M6c2hhcGU6aWRzOnNob3J0ZXN0OmVycm9yJywgbywgfVxuICAgIHJldHVybiBudWxsIGlmIGVycm9yP1xuICAgICMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIGZvcm11bGFfanNvbiAgICA9IEpTT04uc3RyaW5naWZ5IGZvcm11bGFfYXN0XG4gICAgIyB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6ICdjOnNoYXBlOmlkczpzaG9ydGVzdDphc3QnLCBvOiBmb3JtdWxhX2pzb24sIH1cbiAgICAjICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyB7IG9wZXJhdG9ycyxcbiAgICAjICAgY29tcG9uZW50cywgfSA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLm9wZXJhdG9yc19hbmRfY29tcG9uZW50c19mcm9tX2lkbHggZm9ybXVsYV9hc3RcbiAgICAjIHNlZW5fb3BlcmF0b3JzICA9IG5ldyBTZXQoKVxuICAgICMgc2Vlbl9jb21wb25lbnRzID0gbmV3IFNldCgpXG4gICAgIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgZm9yIG9wZXJhdG9yIGluIG9wZXJhdG9yc1xuICAgICMgICBjb250aW51ZSBpZiBzZWVuX29wZXJhdG9ycy5oYXMgb3BlcmF0b3JcbiAgICAjICAgc2Vlbl9vcGVyYXRvcnMuYWRkIG9wZXJhdG9yXG4gICAgIyAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ2M6c2hhcGU6aWRzOmhhcy1vcGVyYXRvcicsIG86IG9wZXJhdG9yLCB9XG4gICAgIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgZm9yIGNvbXBvbmVudCBpbiBjb21wb25lbnRzXG4gICAgIyAgIGNvbnRpbnVlIGlmIHNlZW5fY29tcG9uZW50cy5oYXMgY29tcG9uZW50XG4gICAgIyAgIHNlZW5fY29tcG9uZW50cy5hZGQgY29tcG9uZW50XG4gICAgIyAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ2M6c2hhcGU6aWRzOmhhcy1jb21wb25lbnQnLCBvOiBjb21wb25lbnQsIH1cbiAgICAjICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQHN0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgIDtudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIyNcblxub29vb29cbmA4ODgnXG4gODg4ICAgICAgICAgIC5vb29vLiAgIG9vby4gLm9vLiAgICAub29vb29vb28gICAgICAgICAgICAgIC5vb29vLm8gb29vbyBkOGIgb29vbyAgICBvb29cbiA4ODggICAgICAgICBgUCAgKTg4YiAgYDg4OFBcIlk4OGIgIDg4OCcgYDg4YiAgICAgICAgICAgICAgZDg4KCAgXCI4IGA4ODhcIlwiOFAgIGA4OC4gIC44J1xuIDg4OCAgICAgICAgICAub1BcIjg4OCAgIDg4OCAgIDg4OCAgODg4ICAgODg4ICAgICAgICAgICAgICBgXCJZODhiLiAgIDg4OCAgICAgICBgODguLjgnXG4gODg4ICAgICAgIG8gZDgoICA4ODggICA4ODggICA4ODggIGA4OGJvZDhQJyAgICAgICAgICAgICAgby4gICk4OGIgIDg4OCAgICAgICAgYDg4OCdcbm84ODhvb29vb29kOCBgWTg4OFwiXCI4byBvODg4byBvODg4byBgOG9vb29vby4gIG9vb29vb29vb29vIDhcIlwiODg4UCcgZDg4OGIgICAgICAgIGA4J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkXCIgICAgIFlEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiWTg4ODg4UCdcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIExhbmd1YWdlX3NlcnZpY2VzXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX1RNUF9oYW5nZXVsID0gcmVxdWlyZSAnaGFuZ3VsLWRpc2Fzc2VtYmxlJ1xuICAgIEBfVE1QX2thbmEgICAgPSByZXF1aXJlICd3YW5ha2FuYSdcbiAgICAjIHsgdG9IaXJhZ2FuYSxcbiAgICAjICAgdG9LYW5hLFxuICAgICMgICB0b0thdGFrYW5hXG4gICAgIyAgIHRvUm9tYWppLFxuICAgICMgICB0b2tlbml6ZSwgICAgICAgICB9ID0gcmVxdWlyZSAnd2FuYWthbmEnXG4gICAgO3VuZGVmaW5lZFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgbm9ybWFsaXplX3RleHQ6ICggdGV4dCwgZm9ybSA9ICdORkMnICkgLT4gdGV4dC5ub3JtYWxpemUgZm9ybVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcmVtb3ZlX3Bpbnlpbl9kaWFjcml0aWNzOiAoIHRleHQgKSAtPiAoIHRleHQubm9ybWFsaXplICdORktEJyApLnJlcGxhY2UgL1xcUHtMfS9ndiwgJydcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGV4dHJhY3RfYXRvbmFsX3poX3JlYWRpbmdzOiAoIGVudHJ5ICkgLT5cbiAgICAjIHB5Onpow7ksIHpoZSwgemjEgW8sIHpow6FvLCB6aMeULCB6xKtcbiAgICBSID0gZW50cnlcbiAgICBSID0gUi5yZXBsYWNlIC9ecHk6L3YsICcnXG4gICAgUiA9IFIuc3BsaXQgLyxcXHMqL3ZcbiAgICBSID0gKCAoIEByZW1vdmVfcGlueWluX2RpYWNyaXRpY3MgemhfcmVhZGluZyApIGZvciB6aF9yZWFkaW5nIGluIFIgKVxuICAgIFIgPSBuZXcgU2V0IFJcbiAgICBSLmRlbGV0ZSAnbnVsbCdcbiAgICBSLmRlbGV0ZSAnQG51bGwnXG4gICAgcmV0dXJuIFsgUi4uLiwgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZXh0cmFjdF9qYV9yZWFkaW5nczogKCBlbnRyeSApIC0+XG4gICAgIyDnqbogICAgICBoaTrjgZ3jgoksIOOBgsK3KOOBj3zjgY1844GR44KLKSwg44GL44KJLCDjgZnCtyjjgY9844GL44GZKSwg44KA44GqwrfjgZfjgYRcbiAgICBSID0gZW50cnlcbiAgICBSID0gUi5yZXBsYWNlIC9eKD86aGl8a2EpOi92LCAnJ1xuICAgIFIgPSBSLnJlcGxhY2UgL1xccysvZ3YsICcnXG4gICAgUiA9IFIuc3BsaXQgLyxcXHMqL3ZcbiAgICAjIyMgTk9URSByZW1vdmUgbm8tcmVhZGluZ3MgbWFya2VyIGBAbnVsbGAgYW5kIGNvbnRleHR1YWwgcmVhZGluZ3MgbGlrZSAt44ON44OzIGZvciDnuIEsIC3jg47jgqYgZm9yIOeOiyAjIyNcbiAgICBSID0gKCByZWFkaW5nIGZvciByZWFkaW5nIGluIFIgd2hlbiBub3QgcmVhZGluZy5zdGFydHNXaXRoICctJyApXG4gICAgUiA9IG5ldyBTZXQgUlxuICAgIFIuZGVsZXRlICdudWxsJ1xuICAgIFIuZGVsZXRlICdAbnVsbCdcbiAgICByZXR1cm4gWyBSLi4uLCBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBleHRyYWN0X2hnX3JlYWRpbmdzOiAoIGVudHJ5ICkgLT5cbiAgICAjIOepuiAgICAgIGhpOuOBneOCiSwg44GCwrco44GPfOOBjXzjgZHjgospLCDjgYvjgoksIOOBmcK3KOOBj3zjgYvjgZkpLCDjgoDjgarCt+OBl+OBhFxuICAgIFIgPSBlbnRyeVxuICAgIFIgPSBSLnJlcGxhY2UgL14oPzpoZyk6L3YsICcnXG4gICAgUiA9IFIucmVwbGFjZSAvXFxzKy9ndiwgJydcbiAgICBSID0gUi5zcGxpdCAvLFxccyovdlxuICAgIFIgPSBuZXcgU2V0IFJcbiAgICBSLmRlbGV0ZSAnbnVsbCdcbiAgICBSLmRlbGV0ZSAnQG51bGwnXG4gICAgaGFuZ2V1bCA9IFsgUi4uLiwgXS5qb2luICcnXG4gICAgIyBkZWJ1ZyAnzqlqenJzZGJfXzE3JywgQF9UTVBfaGFuZ2V1bC5kaXNhc3NlbWJsZSBoYW5nZXVsLCB7IGZsYXR0ZW46IGZhbHNlLCB9XG4gICAgcmV0dXJuIFsgUi4uLiwgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcm9tYW5pemVfamFfa2FuYTogKCBlbnRyeSApIC0+XG4gICAgY2ZnID0ge31cbiAgICByZXR1cm4gQF9UTVBfa2FuYS50b1JvbWFqaSBlbnRyeSwgY2ZnXG4gICAgIyAjIyMgc3lzdGVtYXRpYyBuYW1lIG1vcmUgbGlrZSBgLi4uX2phX3hfa2FuX2xhdG4oKWAgIyMjXG4gICAgIyBoZWxwICfOqWRqa3JfXzE4JywgdG9IaXJhZ2FuYSAgJ+ODqeODvOODoeODsycsICAgICAgIHsgY29udmVydExvbmdWb3dlbE1hcms6IGZhbHNlLCB9XG4gICAgIyBoZWxwICfOqWRqa3JfXzE5JywgdG9IaXJhZ2FuYSAgJ+ODqeODvOODoeODsycsICAgICAgIHsgY29udmVydExvbmdWb3dlbE1hcms6IHRydWUsIH1cbiAgICAjIGhlbHAgJ86pZGprcl9fMjAnLCB0b0thbmEgICAgICAnd2FuYWthbmEnLCAgIHsgY3VzdG9tS2FuYU1hcHBpbmc6IHsgbmE6ICfjgasnLCBrYTogJ0JhbmEnIH0sIH1cbiAgICAjIGhlbHAgJ86pZGprcl9fMjEnLCB0b0thbmEgICAgICAnd2FuYWthbmEnLCAgIHsgY3VzdG9tS2FuYU1hcHBpbmc6IHsgd2FrYTogJyjlkozmrYwpJywgd2E6ICco5ZKMMiknLCBrYTogJyjmrYwyKScsIG5hOiAnKOWQjSknLCBrYTogJyhCYW5hKScsIG5ha2E6ICco5LitKScsIH0sIH1cbiAgICAjIGhlbHAgJ86pZGprcl9fMjInLCB0b1JvbWFqaSAgICAn44Gk44GY44GO44KKJywgICAgIHsgY3VzdG9tUm9tYWppTWFwcGluZzogeyDjgZg6ICcoemkpJywg44GkOiAnKHR1KScsIOOCijogJyhsaSknLCDjgorjgofjgYY6ICcocnlvdSknLCDjgorjgoc6ICcocnlvKScgfSwgfVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcGFyc2VfaWRseDogKCBmb3JtdWxhICkgLT4gSURMWC5wYXJzZSBmb3JtdWxhXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvcGVyYXRvcnNfYW5kX2NvbXBvbmVudHNfZnJvbV9pZGx4OiAoIGZvcm11bGEgKSAtPlxuICAgIHN3aXRjaCB0eXBlID0gdHlwZV9vZiBmb3JtdWxhXG4gICAgICB3aGVuICd0ZXh0JyAgIHRoZW4gIGZvcm11bGFfYXN0ID0gQHBhcnNlX2lkbHggZm9ybXVsYVxuICAgICAgd2hlbiAnbGlzdCcgICB0aGVuICBmb3JtdWxhX2FzdCA9ICAgICAgICAgICAgIGZvcm11bGFcbiAgICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfXzIzIGV4cGVjdGVkIGEgdGV4dCBvciBhIGxpc3QsIGdvdCBhICN7dHlwZX1cIlxuICAgIG9wZXJhdG9ycyAgID0gW11cbiAgICBjb21wb25lbnRzICA9IFtdXG4gICAgc2VwYXJhdGUgICAgPSAoIGxpc3QgKSAtPlxuICAgICAgZm9yIGVsZW1lbnQsIGlkeCBpbiBsaXN0XG4gICAgICAgIGlmIGlkeCBpcyAwXG4gICAgICAgICAgb3BlcmF0b3JzLnB1c2ggZWxlbWVudFxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIGlmICggdHlwZV9vZiBlbGVtZW50ICkgaXMgJ2xpc3QnXG4gICAgICAgICAgc2VwYXJhdGUgZWxlbWVudFxuICAgICAgICAgICMgY29tcG9uZW50cy5zcGxpY2UgY29tcG9uZW50cy5sZW5ndGgsIDAsICggc2VwYXJhdGUgZWxlbWVudCApLi4uXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgY29tcG9uZW50cy5wdXNoIGVsZW1lbnRcbiAgICBzZXBhcmF0ZSBmb3JtdWxhX2FzdFxuICAgIHJldHVybiB7IG9wZXJhdG9ycywgY29tcG9uZW50cywgfVxuXG5cblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjIyBUQUlOVCBnb2VzIGludG8gY29uc3RydWN0b3Igb2YgSnpyIGNsYXNzICMjI1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMjI1xuXG4gICBvb29vICBvOG9cbiAgIGA4ODggIGBcIidcbiAgICA4ODggb29vbyAgICBvb29vb29vbyBvb29vICBvb29vICBvb29vIGQ4YiAgLm9vb28uXG4gICAgODg4IGA4ODggICBkJ1wiXCI3ZDhQICBgODg4ICBgODg4ICBgODg4XCJcIjhQIGBQICApODhiXG4gICAgODg4ICA4ODggICAgIC5kOFAnICAgIDg4OCAgIDg4OCAgIDg4OCAgICAgIC5vUFwiODg4XG4gICAgODg4ICA4ODggICAuZDhQJyAgLlAgIDg4OCAgIDg4OCAgIDg4OCAgICAgZDgoICA4ODhcbi5vLiA4OFAgbzg4OG8gZDg4ODg4ODhQICAgYFY4OFZcIlY4UCcgZDg4OGIgICAgYFk4ODhcIlwiOG9cbmBZODg4UFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEppenVyYVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQHBhdGhzICAgICAgICAgICAgICA9IGdldF9wYXRocygpXG4gICAgQGxhbmd1YWdlX3NlcnZpY2VzICA9IG5ldyBMYW5ndWFnZV9zZXJ2aWNlcygpXG4gICAgQGRiYSAgICAgICAgICAgICAgICA9IG5ldyBKenJfZGJfYWRhcHRlciBAcGF0aHMuZGIsIHsgaG9zdDogQCwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaWYgQGRiYS5pc19mcmVzaFxuICAgICMjIyBUQUlOVCBtb3ZlIHRvIEp6cl9kYl9hZGFwdGVyIHRvZ2V0aGVyIHdpdGggdHJ5L2NhdGNoICMjI1xuICAgICAgdHJ5XG4gICAgICAgIEBwb3B1bGF0ZV9tZWFuaW5nX21pcnJvcl90cmlwbGVzKClcbiAgICAgIGNhdGNoIGNhdXNlXG4gICAgICAgIGZpZWxkc19ycHIgPSBycHIgQGRiYS5zdGF0ZS5tb3N0X3JlY2VudF9pbnNlcnRlZF9yb3dcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfXzI0IHdoZW4gdHJ5aW5nIHRvIGluc2VydCB0aGlzIHJvdzogI3tmaWVsZHNfcnByfSwgYW4gZXJyb3Igd2FzIHRocm93bjogI3tjYXVzZS5tZXNzYWdlfVwiLCBcXFxuICAgICAgICAgIHsgY2F1c2UsIH1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAjIyMgVEFJTlQgbW92ZSB0byBKenJfZGJfYWRhcHRlciB0b2dldGhlciB3aXRoIHRyeS9jYXRjaCAjIyNcbiAgICAgIHRyeVxuICAgICAgICBAcG9wdWxhdGVfaGFuZ2V1bF9zeWxsYWJsZXMoKVxuICAgICAgY2F0Y2ggY2F1c2VcbiAgICAgICAgZmllbGRzX3JwciA9IHJwciBAZGJhLnN0YXRlLm1vc3RfcmVjZW50X2luc2VydGVkX3Jvd1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fMjUgd2hlbiB0cnlpbmcgdG8gaW5zZXJ0IHRoaXMgcm93OiAje2ZpZWxkc19ycHJ9LCBhbiBlcnJvciB3YXMgdGhyb3duOiAje2NhdXNlLm1lc3NhZ2V9XCIsIFxcXG4gICAgICAgICAgeyBjYXVzZSwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO3VuZGVmaW5lZFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcG9wdWxhdGVfbWVhbmluZ19taXJyb3JfdHJpcGxlczogLT5cbiAgICBkbyA9PlxuICAgICAgeyB0b3RhbF9yb3dfY291bnQsIH0gPSAoIEBkYmEucHJlcGFyZSBTUUxcIlwiXCJcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICBjb3VudCgqKSBhcyB0b3RhbF9yb3dfY291bnRcbiAgICAgICAgICBmcm9tIGp6cl9taXJyb3JfbGluZXNcbiAgICAgICAgICB3aGVyZSB0cnVlXG4gICAgICAgICAgICBhbmQgKCBkc2tleSBpcyAnZGljdDptZWFuaW5ncycgKVxuICAgICAgICAgICAgYW5kICggamZpZWxkcyBpcyBub3QgbnVsbCApIC0tIE5PVEU6IG5lY2Vzc2FyeVxuICAgICAgICAgICAgYW5kICggbm90IGpmaWVsZHMtPj4nJFswXScgcmVnZXhwICdeQGdseXBocycgKTtcIlwiXCIgKS5nZXQoKVxuICAgICAgdG90YWwgPSB0b3RhbF9yb3dfY291bnQgKiAyICMjIyBOT1RFIGVzdGltYXRlICMjI1xuICAgICAgaGVscCAnzqlqenJzZGJfXzI2JywgeyB0b3RhbF9yb3dfY291bnQsIHRvdGFsLCB9ICMgeyB0b3RhbF9yb3dfY291bnQ6IDQwMDg2LCB0b3RhbDogODAxNzIgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQGRiYS5zdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlcy5ydW4oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBwb3B1bGF0ZV9zaGFwZV9mb3JtdWxhX21pcnJvcl90cmlwbGVzOiAtPlxuICAgIEBkYmEuc3RhdGVtZW50cy5wb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXMucnVuKClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcG9wdWxhdGVfaGFuZ2V1bF9zeWxsYWJsZXM6IC0+XG4gICAgQGRiYS5zdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9sYW5nX2hhbmdldWxfc3lsbGFibGVzLnJ1bigpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7bnVsbFxuXG4gICMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIF9zaG93X2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzOiAtPlxuICAjICAgZmF1bHR5X3Jvd3MgPSAoIEBkYmEucHJlcGFyZSBTUUxcInNlbGVjdCAqIGZyb20gX2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzO1wiICkuYWxsKClcbiAgIyAgIHdhcm4gJ86panpyc2RiX18yNycsIHJldmVyc2UgZmF1bHR5X3Jvd3NcbiAgIyAgICMgZm9yIHJvdyBmcm9tXG4gICMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNob3dfY291bnRzOiAtPlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZG8gPT5cbiAgICAgIHF1ZXJ5ID0gU1FMXCJzZWxlY3QgdiwgY291bnQoKikgZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBncm91cCBieSB2O1wiXG4gICAgICBlY2hvICggZ3JleSAnzqlqenJzZGJfXzI4JyApLCAoIGdvbGQgcmV2ZXJzZSBib2xkIHF1ZXJ5IClcbiAgICAgIGNvdW50cyA9ICggQGRiYS5wcmVwYXJlIHF1ZXJ5ICkuYWxsKClcbiAgICAgIGNvbnNvbGUudGFibGUgY291bnRzXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkbyA9PlxuICAgICAgcXVlcnkgPSBTUUxcInNlbGVjdCB2LCBjb3VudCgqKSBmcm9tIGp6cl90cmlwbGVzIGdyb3VwIGJ5IHY7XCJcbiAgICAgIGVjaG8gKCBncmV5ICfOqWp6cnNkYl9fMjknICksICggZ29sZCByZXZlcnNlIGJvbGQgcXVlcnkgKVxuICAgICAgY291bnRzID0gKCBAZGJhLnByZXBhcmUgcXVlcnkgKS5hbGwoKVxuICAgICAgY29uc29sZS50YWJsZSBjb3VudHNcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRvID0+XG4gICAgICBxdWVyeSA9IFNRTFwiXCJcIlxuICAgICAgICBzZWxlY3QgZHNrZXksIGNvdW50KCopIGFzIGNvdW50IGZyb20ganpyX21pcnJvcl9saW5lcyBncm91cCBieSBkc2tleSB1bmlvbiBhbGxcbiAgICAgICAgc2VsZWN0ICcqJywgICBjb3VudCgqKSBhcyBjb3VudCBmcm9tIGp6cl9taXJyb3JfbGluZXNcbiAgICAgICAgb3JkZXIgYnkgY291bnQgZGVzYztcIlwiXCJcbiAgICAgIGVjaG8gKCBncmV5ICfOqWp6cnNkYl9fMzAnICksICggZ29sZCByZXZlcnNlIGJvbGQgcXVlcnkgKVxuICAgICAgY291bnRzID0gKCBAZGJhLnByZXBhcmUgcXVlcnkgKS5hbGwoKVxuICAgICAgY291bnRzID0gT2JqZWN0LmZyb21FbnRyaWVzICggWyBkc2tleSwgeyBjb3VudCwgfSwgXSBmb3IgeyBkc2tleSwgY291bnQsIH0gaW4gY291bnRzIClcbiAgICAgIGNvbnNvbGUudGFibGUgY291bnRzXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2hvd19qenJfbWV0YV9mYXVsdHM6IC0+XG4gICAgaWYgKCBmYXVsdHlfcm93cyA9ICggQGRiYS5wcmVwYXJlIFNRTFwic2VsZWN0ICogZnJvbSBqenJfbWV0YV9mYXVsdHM7XCIgKS5hbGwoKSApLmxlbmd0aCA+IDBcbiAgICAgIGVjaG8gJ86panpyc2RiX18zMScsIHJlZCByZXZlcnNlIGJvbGQgXCIgZm91bmQgc29tZSBmYXVsdHM6IFwiXG4gICAgICBjb25zb2xlLnRhYmxlIGZhdWx0eV9yb3dzXG4gICAgZWxzZVxuICAgICAgZWNobyAnzqlqenJzZGJfXzMyJywgbGltZSByZXZlcnNlIGJvbGQgXCIgKG5vIGZhdWx0cykgXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDtudWxsXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyMjXG5cbm9vb29vb29vb28uICAgb29vb29vb29vb29vIG9vbyAgICAgICAgb29vb28gICAub29vb29vLlxuYDg4OCcgICBgWThiICBgODg4JyAgICAgYDggYDg4LiAgICAgICAuODg4JyAgZDhQJyAgYFk4YlxuIDg4OCAgICAgIDg4OCAgODg4ICAgICAgICAgIDg4OGIgICAgIGQnODg4ICA4ODggICAgICA4ODhcbiA4ODggICAgICA4ODggIDg4OG9vb284ICAgICA4IFk4OC4gLlAgIDg4OCAgODg4ICAgICAgODg4XG4gODg4ICAgICAgODg4ICA4ODggICAgXCIgICAgIDggIGA4ODgnICAgODg4ICA4ODggICAgICA4ODhcbiA4ODggICAgIGQ4OCcgIDg4OCAgICAgICBvICA4ICAgIFkgICAgIDg4OCAgYDg4YiAgICBkODgnXG5vODg4Ym9vZDhQJyAgIG84ODhvb29vb29kOCBvOG8gICAgICAgIG84ODhvICBgWThib29kOFAnXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5kZW1vID0gLT5cbiAganpyID0gbmV3IEppenVyYSgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyBqenIuX3Nob3dfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMoKVxuICBqenIuc2hvd19jb3VudHMoKVxuICBqenIuc2hvd19qenJfbWV0YV9mYXVsdHMoKVxuICAjIGM6cmVhZGluZzpqYS14LUhpclxuICAjIGM6cmVhZGluZzpqYS14LUthdFxuICBpZiBmYWxzZVxuICAgIHNlZW4gPSBuZXcgU2V0KClcbiAgICBmb3IgeyByZWFkaW5nLCB9IGZyb20ganpyLmRiYS53YWxrIFNRTFwic2VsZWN0IGRpc3RpbmN0KCBvICkgYXMgcmVhZGluZyBmcm9tIGp6cl90cmlwbGVzIHdoZXJlIHYgPSAnYzpyZWFkaW5nOmphLXgtS2F0JyBvcmRlciBieSBvO1wiXG4gICAgICBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLygu44O8fC7jg6N8LuODpXwu44OnfOODgy58LikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICAgICAgIGNvbnRpbnVlIGlmIHNlZW4uaGFzIHBhcnRcbiAgICAgICAgc2Vlbi5hZGQgcGFydFxuICAgICAgICBlY2hvIHBhcnRcbiAgICBmb3IgeyByZWFkaW5nLCB9IGZyb20ganpyLmRiYS53YWxrIFNRTFwic2VsZWN0IGRpc3RpbmN0KCBvICkgYXMgcmVhZGluZyBmcm9tIGp6cl90cmlwbGVzIHdoZXJlIHYgPSAnYzpyZWFkaW5nOmphLXgtSGlyJyBvcmRlciBieSBvO1wiXG4gICAgICBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLygu44O8fC7jgoN8LuOChXwu44KHfOOBoy58LikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICAgICAjIGZvciBwYXJ0IGluICggcmVhZGluZy5zcGxpdCAvKC4pL3YgKSB3aGVuIHBhcnQgaXNudCAnJ1xuICAgICAgICBjb250aW51ZSBpZiBzZWVuLmhhcyBwYXJ0XG4gICAgICAgIHNlZW4uYWRkIHBhcnRcbiAgICAgICAgZWNobyBwYXJ0XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgO251bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5kZW1vX3JlYWRfZHVtcCA9IC0+XG4gIHsgQmVuY2htYXJrZXIsICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9iZW5jaG1hcmtpbmcoKVxuICAjIHsgbmFtZWl0LCAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9uYW1laXQoKVxuICBiZW5jaG1hcmtlciA9IG5ldyBCZW5jaG1hcmtlcigpXG4gIHRpbWVpdCA9ICggUC4uLiApIC0+IGJlbmNobWFya2VyLnRpbWVpdCBQLi4uXG4gIHsgVW5kdW1wZXIsICAgICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9zcWxpdGVfdW5kdW1wZXIoKVxuICB7IHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMsICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcbiAgeyB3YywgICAgICAgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX3djKClcbiAgcGF0aCAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEgucmVzb2x2ZSBfX2Rpcm5hbWUsICcuLi9qenIuZHVtcC5zcWwnXG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICBqenIuZGJhLnRlYXJkb3duIHsgdGVzdDogJyonLCB9XG4gIGRlYnVnICfOqWp6cnNkYl9fMzMnLCBVbmR1bXBlci51bmR1bXAgeyBkYjoganpyLmRiYSwgcGF0aCwgbW9kZTogJ2Zhc3QnLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAganpyLnNob3dfY291bnRzKClcbiAganpyLnNob3dfanpyX21ldGFfZmF1bHRzKClcbiAgO251bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmlmIG1vZHVsZSBpcyByZXF1aXJlLm1haW4gdGhlbiBkbyA9PlxuICBkZW1vKClcbiAgIyBkZW1vX3JlYWRfZHVtcCgpXG4gIDtudWxsXG4iXX0=
