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
            rowid: 't:mr:vb:V=testing:unused',
            rank: 2,
            s: "NN",
            v: 'testing:unused',
            o: "NN"
          },
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
      (() => {        // #.......................................................................................................
        // do =>
        //   query = SQL"select v, count(*) from jzr_mirror_triples_base group by v;"
        //   echo ( grey 'Ωjzrsdb__28' ), ( gold reverse bold query )
        //   counts = ( @dba.prepare query ).all()
        //   console.table counts
        // #.......................................................................................................
        // do =>
        //   query = SQL"select v, count(*) from jzr_triples group by v;"
        //   echo ( grey 'Ωjzrsdb__29' ), ( gold reverse bold query )
        //   counts = ( @dba.prepare query ).all()
        //   console.table counts
        //.......................................................................................................
        var counts, query;
        query = SQL`select
    mv.v            as v,
    count( t3.v )   as count
  from        jzr_mirror_triples_base as t3
  right join  jzr_mirror_verbs        as mv using ( v )
group by v
order by count desc, v;`;
        echo(grey('Ωjzrsdb__30'), gold(reverse(bold(query))));
        counts = (this.dba.prepare(query)).all();
        return console.table(counts);
      })();
      (() => {        //.......................................................................................................
        var counts, query;
        query = SQL`select
    mv.v            as v,
    count( t3.v )   as count
  from        jzr_triples       as t3
  right join  jzr_mirror_verbs  as mv using ( v )
group by v
order by count desc, v;`;
        echo(grey('Ωjzrsdb__31'), gold(reverse(bold(query))));
        counts = (this.dba.prepare(query)).all();
        return console.table(counts);
      })();
      (() => {        //.......................................................................................................
        var count, counts, dskey, query;
        query = SQL`select dskey, count(*) as count from jzr_mirror_lines group by dskey union all
select '*',   count(*) as count from jzr_mirror_lines
order by count desc;`;
        echo(grey('Ωjzrsdb__32'), gold(reverse(bold(query))));
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
        echo('Ωjzrsdb__33', red(reverse(bold(" found some faults: "))));
        console.table(faulty_rows);
      } else {
        echo('Ωjzrsdb__34', lime(reverse(bold(" (no faults) "))));
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
    debug('Ωjzrsdb__35', Undumper.undump({
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsRUFBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxNQUFBLEVBQUEsY0FBQSxFQUFBLGlCQUFBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxXQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLGNBQUEsRUFBQSx1QkFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSx5QkFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQTs7O0VBR0EsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxLQURGLEVBRUUsSUFGRixFQUdFLElBSEYsRUFJRSxLQUpGLEVBS0UsTUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsT0FSRixDQUFBLEdBUTRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBUixDQUFvQixtQkFBcEIsQ0FSNUI7O0VBU0EsQ0FBQSxDQUFFLEdBQUYsRUFDRSxPQURGLEVBRUUsSUFGRixFQUdFLEtBSEYsRUFJRSxLQUpGLEVBS0UsSUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsSUFSRixFQVNFLEdBVEYsRUFVRSxJQVZGLEVBV0UsT0FYRixFQVlFLEdBWkYsQ0FBQSxHQVk0QixHQUFHLENBQUMsR0FaaEMsRUFiQTs7Ozs7OztFQStCQSxFQUFBLEdBQTRCLE9BQUEsQ0FBUSxTQUFSOztFQUM1QixJQUFBLEdBQTRCLE9BQUEsQ0FBUSxXQUFSLEVBaEM1Qjs7O0VBa0NBLEtBQUEsR0FBNEIsT0FBQSxDQUFRLGdCQUFSLEVBbEM1Qjs7O0VBb0NBLFNBQUEsR0FBNEIsT0FBQSxDQUFRLDJDQUFSLEVBcEM1Qjs7O0VBc0NBLENBQUEsQ0FBRSxLQUFGLEVBQ0UsU0FERixFQUVFLEdBRkYsQ0FBQSxHQUU0QixTQUFTLENBQUMsUUFBUSxDQUFDLGFBQW5CLENBQUEsQ0FGNUIsRUF0Q0E7OztFQTBDQSxDQUFBLENBQUUsSUFBRixFQUNFLE1BREYsQ0FBQSxHQUM0QixTQUFTLENBQUMsNEJBQVYsQ0FBQSxDQUF3QyxDQUFDLE1BRHJFLEVBMUNBOzs7RUE2Q0EsQ0FBQSxDQUFFLFNBQUYsRUFDRSxlQURGLENBQUEsR0FDNEIsU0FBUyxDQUFDLGlCQUFWLENBQUEsQ0FENUIsRUE3Q0E7OztFQWdEQSxDQUFBLENBQUUseUJBQUYsQ0FBQSxHQUM0QixTQUFTLENBQUMsUUFBUSxDQUFDLHVCQUFuQixDQUFBLENBRDVCLEVBaERBOzs7RUFtREEsQ0FBQSxDQUFFLFdBQUYsQ0FBQSxHQUE0QixTQUFTLENBQUMsUUFBUSxDQUFDLG9CQUFuQixDQUFBLENBQTVCOztFQUNBLFdBQUEsR0FBZ0MsSUFBSSxXQUFKLENBQUE7O0VBQ2hDLE1BQUEsR0FBZ0MsUUFBQSxDQUFBLEdBQUUsQ0FBRixDQUFBO1dBQVksV0FBVyxDQUFDLE1BQVosQ0FBbUIsR0FBQSxDQUFuQjtFQUFaLEVBckRoQzs7O0VBdURBLENBQUEsQ0FBRSxVQUFGLENBQUEsR0FBNEIsU0FBUyxDQUFDLDhCQUFWLENBQUEsQ0FBNUI7O0VBQ0EsQ0FBQSxDQUFFLEdBQUYsRUFBTyxJQUFQLENBQUEsR0FBNEIsT0FBQSxDQUFRLGNBQVIsQ0FBNUI7O0VBQ0EsQ0FBQSxDQUFFLE9BQUYsQ0FBQSxHQUE0QixTQUFTLENBQUMsUUFBUSxDQUFDLGVBQW5CLENBQUEsQ0FBNUIsRUF6REE7OztFQTREQSxTQUFBLEdBQWdDLFFBQUEsQ0FBRSxDQUFGLENBQUE7QUFBUyxZQUFPLENBQVA7QUFBQSxXQUNsQyxJQURrQztlQUN2QjtBQUR1QixXQUVsQyxLQUZrQztlQUV2QjtBQUZ1QjtRQUdsQyxNQUFNLElBQUksS0FBSixDQUFVLENBQUEsd0NBQUEsQ0FBQSxDQUEyQyxHQUFBLENBQUksQ0FBSixDQUEzQyxDQUFBLENBQVY7QUFINEI7RUFBVDs7RUFJaEMsT0FBQSxHQUFnQyxRQUFBLENBQUUsQ0FBRixDQUFBO0FBQVMsWUFBTyxDQUFQO0FBQUEsV0FDbEMsQ0FEa0M7ZUFDM0I7QUFEMkIsV0FFbEMsQ0FGa0M7ZUFFM0I7QUFGMkI7UUFHbEMsTUFBTSxJQUFJLEtBQUosQ0FBVSxDQUFBLGlDQUFBLENBQUEsQ0FBb0MsR0FBQSxDQUFJLENBQUosQ0FBcEMsQ0FBQSxDQUFWO0FBSDRCO0VBQVQsRUFoRWhDOzs7RUFzRUEsdUJBQUEsR0FBMEIsUUFBQSxDQUFBLENBQUE7QUFDMUIsUUFBQSxpQkFBQSxFQUFBLHNCQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUE7SUFBRSxDQUFBLENBQUUsaUJBQUYsQ0FBQSxHQUE4QixTQUFTLENBQUMsd0JBQVYsQ0FBQSxDQUE5QjtJQUNBLENBQUEsQ0FBRSxzQkFBRixDQUFBLEdBQThCLFNBQVMsQ0FBQyw4QkFBVixDQUFBLENBQTlCO0FBQ0E7QUFBQTtJQUFBLEtBQUEsV0FBQTs7bUJBQ0UsS0FBQSxDQUFNLGFBQU4sRUFBcUIsR0FBckIsRUFBMEIsS0FBMUI7SUFERixDQUFBOztFQUh3QixFQXRFMUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBbUdBLFNBQUEsR0FBWSxRQUFBLENBQUEsQ0FBQTtBQUNaLFFBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQTtJQUFFLENBQUEsR0FBc0MsQ0FBQTtJQUN0QyxDQUFDLENBQUMsSUFBRixHQUFzQyxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsSUFBeEI7SUFDdEMsQ0FBQyxDQUFDLEdBQUYsR0FBc0MsSUFBSSxDQUFDLE9BQUwsQ0FBYSxDQUFDLENBQUMsSUFBZixFQUFxQixJQUFyQjtJQUN0QyxDQUFDLENBQUMsRUFBRixHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxJQUFaLEVBQWtCLFFBQWxCLEVBSHhDOzs7SUFNRSxDQUFDLENBQUMsTUFBRixHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxJQUFaLEVBQWtCLHdCQUFsQjtJQUN0QyxDQUFDLENBQUMsUUFBRixHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxNQUFaLEVBQW9CLFVBQXBCO0lBQ3RDLENBQUMsQ0FBQyxVQUFGLEdBQXNDLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBQyxDQUFDLE1BQVosRUFBb0IsNkNBQXBCO0lBQ3RDLE9BQUEsR0FBc0MsSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFDLENBQUMsVUFBWixFQUF3QixnRUFBeEI7SUFDdEMsT0FBQSxHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxVQUFaLEVBQXdCLDRFQUF4QixFQVZ4Qzs7SUFZRSxDQUFDLENBQUUscUJBQUYsQ0FBRCxHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxNQUFaLEVBQW9CLDRCQUFwQjtJQUN0QyxDQUFDLENBQUUsb0JBQUYsQ0FBRCxHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxNQUFaLEVBQW9CLHlCQUFwQjtJQUN0QyxDQUFDLENBQUUsWUFBRixDQUFELEdBQXNDLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBQyxDQUFDLE1BQVosRUFBb0Isb0NBQXBCO0lBQ3RDLENBQUMsQ0FBRSxpQkFBRixDQUFELEdBQXNDLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQUFtQixpQ0FBbkI7SUFDdEMsQ0FBQyxDQUFFLHFCQUFGLENBQUQsR0FBc0MsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLEVBQW1CLGdDQUFuQjtJQUN0QyxDQUFDLENBQUUsd0JBQUYsQ0FBRCxHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsY0FBbkI7SUFDdEMsQ0FBQyxDQUFFLHlCQUFGLENBQUQsR0FBc0MsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLEVBQW1CLGVBQW5CO0lBQ3RDLENBQUMsQ0FBRSwwQkFBRixDQUFELEdBQXNDLElBQUksQ0FBQyxJQUFMLENBQVUsT0FBVixFQUFtQixnQkFBbkI7SUFDdEMsQ0FBQyxDQUFFLDJCQUFGLENBQUQsR0FBc0MsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLEVBQW1CLGlCQUFuQjtJQUN0QyxDQUFDLENBQUUscUJBQUYsQ0FBRCxHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLE9BQVYsRUFBbUIsV0FBbkI7SUFDdEMsQ0FBQyxDQUFFLGVBQUYsQ0FBRCxHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxRQUFaLEVBQXNCLHNCQUF0QjtJQUN0QyxDQUFDLENBQUUsYUFBRixDQUFELEdBQXNDLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBQyxDQUFDLFFBQVosRUFBc0Isc0NBQXRCO0lBQ3RDLENBQUMsQ0FBRSxjQUFGLENBQUQsR0FBc0MsSUFBSSxDQUFDLElBQUwsQ0FBVSxDQUFDLENBQUMsUUFBWixFQUFzQix5Q0FBdEI7SUFDdEMsQ0FBQyxDQUFFLFdBQUYsQ0FBRCxHQUFzQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxRQUFaLEVBQXNCLDZCQUF0QjtBQUN0QyxXQUFPO0VBM0JHOztFQWdDTjs7SUFBTixNQUFBLGVBQUEsUUFBNkIsVUFBN0IsQ0FBQTs7TUFPRSxXQUFhLENBQUUsT0FBRixFQUFXLE1BQU0sQ0FBQSxDQUFqQixDQUFBLEVBQUE7O0FBQ2YsWUFBQTtRQUNJLENBQUEsQ0FBRSxJQUFGLENBQUEsR0FBWSxHQUFaO1FBQ0EsR0FBQSxHQUFZLElBQUEsQ0FBSyxHQUFMLEVBQVUsUUFBQSxDQUFFLEdBQUYsQ0FBQTtpQkFBVyxPQUFPLEdBQUcsQ0FBQztRQUF0QixDQUFWLEVBRmhCOzthQUlJLENBQU0sT0FBTixFQUFlLEdBQWYsRUFKSjs7UUFNSSxJQUFDLENBQUEsSUFBRCxHQUFVO1FBQ1YsSUFBQyxDQUFBLEtBQUQsR0FBVTtVQUFFLFlBQUEsRUFBYyxDQUFoQjtVQUFtQix3QkFBQSxFQUEwQjtRQUE3QztRQUVQLENBQUEsQ0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNQLGNBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUE7Ozs7VUFHTSxRQUFBLEdBQVc7VUFDWCxLQUFBLGdEQUFBO2FBQUksQ0FBRSxJQUFGLEVBQVEsSUFBUjtBQUNGO2NBQ0UsQ0FBRSxJQUFDLENBQUEsT0FBRCxDQUFTLEdBQUcsQ0FBQSxjQUFBLENBQUEsQ0FBaUIsSUFBakIsQ0FBQSxhQUFBLENBQVosQ0FBRixDQUFvRCxDQUFDLEdBQXJELENBQUEsRUFERjthQUVBLGNBQUE7Y0FBTTtjQUNKLFFBQVEsQ0FBQyxJQUFULENBQWMsQ0FBQSxDQUFBLENBQUcsSUFBSCxFQUFBLENBQUEsQ0FBVyxJQUFYLENBQUEsRUFBQSxDQUFBLENBQW9CLEtBQUssQ0FBQyxPQUExQixDQUFBLENBQWQ7Y0FDQSxJQUFBLENBQUssYUFBTCxFQUFvQixLQUFLLENBQUMsT0FBMUIsRUFGRjs7VUFIRjtVQU1BLElBQWUsUUFBUSxDQUFDLE1BQVQsS0FBbUIsQ0FBbEM7QUFBQSxtQkFBTyxLQUFQOztVQUNBLE1BQU0sSUFBSSxLQUFKLENBQVUsQ0FBQSwyQ0FBQSxDQUFBLENBQThDLEdBQUEsQ0FBSSxRQUFKLENBQTlDLENBQUEsQ0FBVjtpQkFDTDtRQWJBLENBQUEsSUFUUDs7UUF3QkksSUFBRyxJQUFDLENBQUEsUUFBSjtVQUNFLElBQUMsQ0FBQSxpQ0FBRCxDQUFBO1VBQ0EsSUFBQyxDQUFBLGtDQUFELENBQUE7VUFDQSxJQUFDLENBQUEsbUNBQUQsQ0FBQTtVQUNBLElBQUMsQ0FBQSxrQ0FBRCxDQUFBLEVBSkY7U0F4Qko7O1FBOEJLO01BL0JVLENBTGY7Ozs7Ozs7Ozs7Ozs7Ozs7O01Bb2lCRSxtQ0FBcUMsQ0FBQSxDQUFBO1FBQ25DLEtBQUEsQ0FBTSxhQUFOLEVBQXFCLHFDQUFyQjtRQUNBLElBQUMsQ0FBQSxVQUFVLENBQUMsdUJBQXVCLENBQUMsR0FBcEMsQ0FBd0M7VUFBRSxLQUFBLEVBQU8sYUFBVDtVQUF3QixLQUFBLEVBQU8sR0FBL0I7VUFBb0MsT0FBQSxFQUFTO1FBQTdDLENBQXhDO1FBQ0EsSUFBQyxDQUFBLFVBQVUsQ0FBQyx1QkFBdUIsQ0FBQyxHQUFwQyxDQUF3QztVQUFFLEtBQUEsRUFBTyxhQUFUO1VBQXdCLEtBQUEsRUFBTyxHQUEvQjtVQUFvQyxPQUFBLEVBQVM7UUFBN0MsQ0FBeEM7UUFDQSxJQUFDLENBQUEsVUFBVSxDQUFDLHVCQUF1QixDQUFDLEdBQXBDLENBQXdDO1VBQUUsS0FBQSxFQUFPLGFBQVQ7VUFBd0IsS0FBQSxFQUFPLEdBQS9CO1VBQW9DLE9BQUEsRUFBUztRQUE3QyxDQUF4QztlQUNDO01BTGtDLENBcGlCdkM7OztNQTRpQkUsa0NBQW9DLENBQUEsQ0FBQTtBQUN0QyxZQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLElBQUE7Ozs7OztRQUtJLEtBQUEsQ0FBTSxhQUFOLEVBQXFCLG9DQUFyQjtRQUNBLElBQUEsR0FBTztVQUNMO1lBQUUsS0FBQSxFQUFPLDBCQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxFQUFHLGdCQUF2RTtZQUFxRyxDQUFBLEVBQUc7VUFBeEcsQ0FESztVQUVMO1lBQUUsS0FBQSxFQUFPLGtDQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxFQUFHLHdCQUF2RTtZQUFxRyxDQUFBLEVBQUc7VUFBeEcsQ0FGSztVQUdMO1lBQUUsS0FBQSxFQUFPLGlDQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxFQUFHLHVCQUF2RTtZQUFxRyxDQUFBLEVBQUc7VUFBeEcsQ0FISztVQUlMO1lBQUUsS0FBQSxFQUFPLGdDQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxFQUFHLHNCQUF2RTtZQUFxRyxDQUFBLEVBQUc7VUFBeEcsQ0FKSztVQUtMO1lBQUUsS0FBQSxFQUFPLG9DQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxFQUFHLDBCQUF2RTtZQUFxRyxDQUFBLEVBQUc7VUFBeEcsQ0FMSztVQU1MO1lBQUUsS0FBQSxFQUFPLDhCQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxFQUFHLG9CQUF2RTtZQUFxRyxDQUFBLEVBQUc7VUFBeEcsQ0FOSztVQU9MO1lBQUUsS0FBQSxFQUFPLDhCQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxFQUFHLG9CQUF2RTtZQUFxRyxDQUFBLEVBQUc7VUFBeEcsQ0FQSztVQVFMO1lBQUUsS0FBQSxFQUFPLDhCQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxFQUFHLG9CQUF2RTtZQUFxRyxDQUFBLEVBQUc7VUFBeEcsQ0FSSztVQVNMO1lBQUUsS0FBQSxFQUFPLCtCQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxFQUFHLHFCQUF2RTtZQUFxRyxDQUFBLEVBQUc7VUFBeEcsQ0FUSztVQVVMO1lBQUUsS0FBQSxFQUFPLG1DQUFUO1lBQWtELElBQUEsRUFBTSxDQUF4RDtZQUEyRCxDQUFBLEVBQUcsSUFBOUQ7WUFBb0UsQ0FBQSxF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LEdBQUE7TUFDaEMsSUFBQSxDQUFBLEVBQUY7O2FBRUc7SUFIK0IsQ0FBQSxJQUFsQzs7QUEvdUNBIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0J1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbkdVWSAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXknXG57IGFsZXJ0XG4gIGRlYnVnXG4gIGhlbHBcbiAgaW5mb1xuICBwbGFpblxuICBwcmFpc2VcbiAgdXJnZVxuICB3YXJuXG4gIHdoaXNwZXIgfSAgICAgICAgICAgICAgID0gR1VZLnRybS5nZXRfbG9nZ2VycyAnaml6dXJhLXNvdXJjZXMtZGInXG57IHJwclxuICBpbnNwZWN0XG4gIGVjaG9cbiAgd2hpdGVcbiAgZ3JlZW5cbiAgYmx1ZVxuICBsaW1lXG4gIGdvbGRcbiAgZ3JleVxuICByZWRcbiAgYm9sZFxuICByZXZlcnNlXG4gIGxvZyAgICAgfSAgICAgICAgICAgICAgID0gR1VZLnRybVxuIyB7IGYgfSAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2VmZnN0cmluZydcbiMgd3JpdGUgICAgICAgICAgICAgICAgICAgICA9ICggcCApIC0+IHByb2Nlc3Muc3Rkb3V0LndyaXRlIHBcbiMgeyBuZmEgfSAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ub3JtYWxpemUtZnVuY3Rpb24tYXJndW1lbnRzJ1xuIyBHVE5HICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2d1eS10ZXN0LU5HJ1xuIyB7IFRlc3QgICAgICAgICAgICAgICAgICB9ID0gR1ROR1xuRlMgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6ZnMnXG5QQVRIICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpwYXRoJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5Cc3FsMyAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYmV0dGVyLXNxbGl0ZTMnXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblNGTU9EVUxFUyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvYnJpY2FicmFjLXNmbW9kdWxlcydcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBEYnJpYyxcbiAgRGJyaWNfc3RkLFxuICBTUUwsICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2RicmljKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBsZXRzLFxuICBmcmVlemUsICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2xldHNmcmVlemV0aGF0X2luZnJhKCkuc2ltcGxlXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgSmV0c3RyZWFtLFxuICBBc3luY19qZXRzdHJlYW0sICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2pldHN0cmVhbSgpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgd2Fsa19saW5lc193aXRoX3Bvc2l0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2Zhc3RfbGluZXJlYWRlcigpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgQmVuY2htYXJrZXIsICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9iZW5jaG1hcmtpbmcoKVxuYmVuY2htYXJrZXIgICAgICAgICAgICAgICAgICAgPSBuZXcgQmVuY2htYXJrZXIoKVxudGltZWl0ICAgICAgICAgICAgICAgICAgICAgICAgPSAoIFAuLi4gKSAtPiBiZW5jaG1hcmtlci50aW1laXQgUC4uLlxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IHNldF9nZXR0ZXIsICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfbWFuYWdlZF9wcm9wZXJ0eV90b29scygpXG57IElETCwgSURMWCwgICAgICAgICAgICB9ID0gcmVxdWlyZSAnbW9qaWt1cmEtaWRsJ1xueyB0eXBlX29mLCAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX3R5cGVfb2YoKVxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmZyb21fYm9vbCAgICAgICAgICAgICAgICAgICAgID0gKCB4ICkgLT4gc3dpdGNoIHhcbiAgd2hlbiB0cnVlICB0aGVuIDFcbiAgd2hlbiBmYWxzZSB0aGVuIDBcbiAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fXzEgZXhwZWN0ZWQgdHJ1ZSBvciBmYWxzZSwgZ290ICN7cnByIHh9XCJcbmFzX2Jvb2wgICAgICAgICAgICAgICAgICAgICAgID0gKCB4ICkgLT4gc3dpdGNoIHhcbiAgd2hlbiAxIHRoZW4gdHJ1ZVxuICB3aGVuIDAgdGhlbiBmYWxzZVxuICBlbHNlIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX19fMiBleHBlY3RlZCAwIG9yIDEsIGdvdCAje3JwciB4fVwiXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZGVtb19zb3VyY2VfaWRlbnRpZmllcnMgPSAtPlxuICB7IGV4cGFuZF9kaWN0aW9uYXJ5LCAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9kaWN0aW9uYXJ5X3Rvb2xzKClcbiAgeyBnZXRfbG9jYWxfZGVzdGluYXRpb25zLCB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfZ2V0X2xvY2FsX2Rlc3RpbmF0aW9ucygpXG4gIGZvciBrZXksIHZhbHVlIG9mIGdldF9sb2NhbF9kZXN0aW5hdGlvbnMoKVxuICAgIGRlYnVnICfOqWp6cnNkYl9fXzMnLCBrZXksIHZhbHVlXG4gICMgY2FuIGFwcGVuZCBsaW5lIG51bWJlcnMgdG8gZmlsZXMgYXMgaW46XG4gICMgJ2RpY3Q6bWVhbmluZ3MuMTpMPTEzMzMyJ1xuICAjICdkaWN0OnVjZDE0MC4xOnVoZGlkeDpMPTEyMzQnXG4gICMgcm93aWRzOiAndDpqZm06Uj0xJ1xuICAjIHtcbiAgIyAgICdkaWN0Om1lYW5pbmdzJzogICAgICAgICAgJyRqenJkcy9tZWFuaW5nL21lYW5pbmdzLnR4dCdcbiAgIyAgICdkaWN0OnVjZDp2MTQuMDp1aGRpZHgnIDogJyRqenJkcy91bmljb2RlLm9yZy11Y2QtdjE0LjAvVW5paGFuX0RpY3Rpb25hcnlJbmRpY2VzLnR4dCdcbiAgIyAgIH1cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIyNcblxuICAgICAgICAgICAgICAgICAgICAgICAgIC4gICBvb29vXG4gICAgICAgICAgICAgICAgICAgICAgIC5vOCAgIGA4ODhcbm9vLm9vb29vLiAgIC5vb29vLiAgIC5vODg4b28gIDg4OCAub28uICAgIC5vb29vLm9cbiA4ODgnIGA4OGIgYFAgICk4OGIgICAgODg4ICAgIDg4OFBcIlk4OGIgIGQ4OCggIFwiOFxuIDg4OCAgIDg4OCAgLm9QXCI4ODggICAgODg4ICAgIDg4OCAgIDg4OCAgYFwiWTg4Yi5cbiA4ODggICA4ODggZDgoICA4ODggICAgODg4IC4gIDg4OCAgIDg4OCAgby4gICk4OGJcbiA4ODhib2Q4UCcgYFk4ODhcIlwiOG8gICBcIjg4OFwiIG84ODhvIG84ODhvIDhcIlwiODg4UCdcbiA4ODhcbm84ODhvXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5nZXRfcGF0aHMgPSAtPlxuICBSICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IHt9XG4gIFIuYmFzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5yZXNvbHZlIF9fZGlybmFtZSwgJy4uJ1xuICBSLmp6ciAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEgucmVzb2x2ZSBSLmJhc2UsICcuLidcbiAgUi5kYiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gUi5iYXNlLCAnanpyLmRiJ1xuICAjIFIuZGIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gJy9kZXYvc2htL2p6ci5kYidcbiAgIyBSLmp6cmRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBSLmJhc2UsICdqenJkcydcbiAgUi5qenJuZHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gUi5iYXNlLCAnaml6dXJhLW5ldy1kYXRhc291cmNlcydcbiAgUi5tb2ppa3VyYSAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gUi5qenJuZHMsICdtb2ppa3VyYSdcbiAgUi5yYXdfZ2l0aHViICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gUi5qenJuZHMsICdidmZzL29yaWdpbi9odHRwcy9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tJ1xuICBrYW5qaXVtICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBSLnJhd19naXRodWIsICdtaWZ1bmV0b3NoaXJvL2thbmppdW0vOGEwY2RhYTE2ZDY0YTI4MWEyMDQ4ZGUyZWVlMmVjNWUzYTQ0MGZhNidcbiAgcnV0b3BpbyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gUi5yYXdfZ2l0aHViLCAncnV0b3Bpby9Lb3JlYW4tTmFtZS1IYW5qYS1DaGFyc2V0LzEyZGYxYmExYjRkZmFhMDk1ODEzZTRkZGZiYTQyNGU4MTZmOTRjNTMnXG4gICMgUlsgJ2RpY3Q6dWNkOnYxNC4wOnVoZGlkeCcgICAgICBdICAgPSBQQVRILmpvaW4gUi5qenJuZHMsICd1bmljb2RlLm9yZy11Y2QtdjE0LjAvVW5paGFuX0RpY3Rpb25hcnlJbmRpY2VzLnR4dCdcbiAgUlsgJ2RpY3Q6eDprby1IYW5nK0xhdG4nICAgICAgICBdICAgPSBQQVRILmpvaW4gUi5qenJuZHMsICdoYW5nZXVsLXRyYW5zY3JpcHRpb25zLnRzdidcbiAgUlsgJ2RpY3Q6eDpqYS1LYW4rTGF0bicgICAgICAgICBdICAgPSBQQVRILmpvaW4gUi5qenJuZHMsICdrYW5hLXRyYW5zY3JpcHRpb25zLnRzdidcbiAgUlsgJ2RpY3Q6YmNwNDcnICAgICAgICAgICAgICAgICBdICAgPSBQQVRILmpvaW4gUi5qenJuZHMsICdCQ1A0Ny1sYW5ndWFnZS1zY3JpcHRzLXJlZ2lvbnMudHN2J1xuICBSWyAnZGljdDpqYTprYW5qaXVtJyAgICAgICAgICAgIF0gICA9IFBBVEguam9pbiBrYW5qaXVtLCAnZGF0YS9zb3VyY2VfZmlsZXMva2FuamlkaWN0LnR4dCdcbiAgUlsgJ2RpY3Q6amE6a2Fuaml1bTphdXgnICAgICAgICBdICAgPSBQQVRILmpvaW4ga2Fuaml1bSwgJ2RhdGEvc291cmNlX2ZpbGVzLzBfUkVBRE1FLnR4dCdcbiAgUlsgJ2RpY3Q6a286Vj1kYXRhLWdvdi5jc3YnICAgICBdICAgPSBQQVRILmpvaW4gcnV0b3BpbywgJ2RhdGEtZ292LmNzdidcbiAgUlsgJ2RpY3Q6a286Vj1kYXRhLWdvdi5qc29uJyAgICBdICAgPSBQQVRILmpvaW4gcnV0b3BpbywgJ2RhdGEtZ292Lmpzb24nXG4gIFJbICdkaWN0OmtvOlY9ZGF0YS1uYXZlci5jc3YnICAgXSAgID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLW5hdmVyLmNzdidcbiAgUlsgJ2RpY3Q6a286Vj1kYXRhLW5hdmVyLmpzb24nICBdICAgPSBQQVRILmpvaW4gcnV0b3BpbywgJ2RhdGEtbmF2ZXIuanNvbidcbiAgUlsgJ2RpY3Q6a286Vj1SRUFETUUubWQnICAgICAgICBdICAgPSBQQVRILmpvaW4gcnV0b3BpbywgJ1JFQURNRS5tZCdcbiAgUlsgJ2RpY3Q6bWVhbmluZ3MnICAgICAgICAgICAgICBdICAgPSBQQVRILmpvaW4gUi5tb2ppa3VyYSwgJ21lYW5pbmcvbWVhbmluZ3MudHh0J1xuICBSWyAnc2hhcGU6aWRzdjInICAgICAgICAgICAgICAgIF0gICA9IFBBVEguam9pbiBSLm1vamlrdXJhLCAnc2hhcGUvc2hhcGUtYnJlYWtkb3duLWZvcm11bGEtdjIudHh0J1xuICBSWyAnc2hhcGU6emh6NWJmJyAgICAgICAgICAgICAgIF0gICA9IFBBVEguam9pbiBSLm1vamlrdXJhLCAnc2hhcGUvc2hhcGUtc3Ryb2tlb3JkZXItemhheml3dWJpZmEudHh0J1xuICBSWyAndWNkYjpyc2dzJyAgICAgICAgICAgICAgICAgIF0gICA9IFBBVEguam9pbiBSLm1vamlrdXJhLCAndWNkYi9jZmcvcnNncy1hbmQtYmxvY2tzLm1kJ1xuICByZXR1cm4gUlxuXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBKenJfZGJfYWRhcHRlciBleHRlbmRzIERicmljX3N0ZFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQGRiX2NsYXNzOiAgQnNxbDNcbiAgQHByZWZpeDogICAgJ2p6cidcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAoIGRiX3BhdGgsIGNmZyA9IHt9ICkgLT5cbiAgICAjIyMgVEFJTlQgbmVlZCBtb3JlIGNsYXJpdHkgYWJvdXQgd2hlbiBzdGF0ZW1lbnRzLCBidWlsZCwgaW5pdGlhbGl6ZS4uLiBpcyBwZXJmb3JtZWQgIyMjXG4gICAgeyBob3N0LCB9ID0gY2ZnXG4gICAgY2ZnICAgICAgID0gbGV0cyBjZmcsICggY2ZnICkgLT4gZGVsZXRlIGNmZy5ob3N0XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBzdXBlciBkYl9wYXRoLCBjZmdcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIEBob3N0ICAgPSBob3N0XG4gICAgQHN0YXRlICA9IHsgdHJpcGxlX2NvdW50OiAwLCBtb3N0X3JlY2VudF9pbnNlcnRlZF9yb3c6IG51bGwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZG8gPT5cbiAgICAgICMjIyBUQUlOVCB0aGlzIGlzIG5vdCB3ZWxsIHBsYWNlZCAjIyNcbiAgICAgICMjIyBOT1RFIGV4ZWN1dGUgYSBHYXBzLWFuZC1Jc2xhbmRzIEVTU0ZSSSB0byBpbXByb3ZlIHN0cnVjdHVyYWwgaW50ZWdyaXR5IGFzc3VyYW5jZTogIyMjXG4gICAgICAjICggQHByZXBhcmUgU1FMXCJzZWxlY3QgKiBmcm9tIF9qenJfbWV0YV91Y19ub3JtYWxpemF0aW9uX2ZhdWx0cyB3aGVyZSBmYWxzZTtcIiApLmdldCgpXG4gICAgICBtZXNzYWdlcyA9IFtdXG4gICAgICBmb3IgeyBuYW1lLCB0eXBlLCB9IGZyb20gQHN0YXRlbWVudHMuc3RkX2dldF9yZWxhdGlvbnMuaXRlcmF0ZSgpXG4gICAgICAgIHRyeVxuICAgICAgICAgICggQHByZXBhcmUgU1FMXCJzZWxlY3QgKiBmcm9tICN7bmFtZX0gd2hlcmUgZmFsc2U7XCIgKS5hbGwoKVxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgIG1lc3NhZ2VzLnB1c2ggXCIje3R5cGV9ICN7bmFtZX06ICN7ZXJyb3IubWVzc2FnZX1cIlxuICAgICAgICAgIHdhcm4gJ86panpyc2RiX19fNCcsIGVycm9yLm1lc3NhZ2VcbiAgICAgIHJldHVybiBudWxsIGlmIG1lc3NhZ2VzLmxlbmd0aCBpcyAwXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fXzUgRUZGUkkgdGVzdGluZyByZXZlYWxlZCBlcnJvcnM6ICN7cnByIG1lc3NhZ2VzfVwiXG4gICAgICA7bnVsbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaWYgQGlzX2ZyZXNoXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VzKClcbiAgICAgIEBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX3ZlcmJzKClcbiAgICAgIEBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xjb2RlcygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9saW5lcygpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzZXRfZ2V0dGVyIEA6OiwgJ25leHRfdHJpcGxlX3Jvd2lkJywgLT4gXCJ0Om1yOjNwbDpSPSN7KytAc3RhdGUudHJpcGxlX2NvdW50fVwiXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAjIyNcblxuICAgLm84ICAgICAgICAgICAgICAgICAgICBvOG8gIG9vb28gICAgICAgIC5vOFxuICBcIjg4OCAgICAgICAgICAgICAgICAgICAgYFwiJyAgYDg4OCAgICAgICBcIjg4OFxuICAgODg4b29vby4gIG9vb28gIG9vb28gIG9vb28gICA4ODggICAub29vbzg4OFxuICAgZDg4JyBgODhiIGA4ODggIGA4ODggIGA4ODggICA4ODggIGQ4OCcgYDg4OFxuICAgODg4ICAgODg4ICA4ODggICA4ODggICA4ODggICA4ODggIDg4OCAgIDg4OFxuICAgODg4ICAgODg4ICA4ODggICA4ODggICA4ODggICA4ODggIDg4OCAgIDg4OFxuICAgYFk4Ym9kOFAnICBgVjg4VlwiVjhQJyBvODg4byBvODg4byBgWThib2Q4OFBcIlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBAYnVpbGQ6IFtcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9nbHlwaHJhbmdlcyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGxvICAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGhpICAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxvX2dseXBoICB0ZXh0ICAgICAgICAgICAgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGNoYXIoIGxvICkgKSBzdG9yZWQsXG4gICAgICAgIGhpX2dseXBoICB0ZXh0ICAgICAgICAgICAgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGNoYXIoIGhpICkgKSBzdG9yZWQsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X19fNlwiIGNoZWNrICggbG8gYmV0d2VlbiAweDAwMDAwMCBhbmQgMHgxMGZmZmYgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfX183XCIgY2hlY2sgKCBoaSBiZXR3ZWVuIDB4MDAwMDAwIGFuZCAweDEwZmZmZiApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fXzhcIiBjaGVjayAoIGxvIDw9IGhpICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X19fOVwiIGNoZWNrICggcm93aWQgcmVnZXhwICdeLiokJylcbiAgICAgICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfZ2x5cGhzZXRzIChcbiAgICAgICAgcm93aWQgICAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBuYW1lICAgICAgICB0ZXh0ICAgIG5vdCBudWxsLFxuICAgICAgICBnbHlwaHJhbmdlICB0ZXh0ICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgZm9yZWlnbiBrZXkgKCBnbHlwaHJhbmdlICkgcmVmZXJlbmNlcyBqenJfZ2x5cGhyYW5nZXMgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTBcIiBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXi4qJCcpXG4gICAgICApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2RhdGFzb3VyY2VzIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgZHNrZXkgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcGF0aCAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNoZWNrICggcm93aWQgcmVnZXhwICdedDpkczpSPVxcXFxkKyQnKSk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX2xjb2RlcyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGxjb2RlICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGNvbW1lbnQgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIGxjb2RlIHJlZ2V4cCAnXlthLXpBLVpdK1thLXpBLVowLTldKiQnICksXG4gICAgICBjaGVjayAoIHJvd2lkID0gJ3Q6bXI6bGM6Vj0nIHx8IGxjb2RlICkgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfbGluZXMgKFxuICAgICAgICAtLSAndDpqZm06J1xuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsIGdlbmVyYXRlZCBhbHdheXMgYXMgKCAndDptcjpsbjpkcz0nIHx8IGRza2V5IHx8ICc6TD0nIHx8IGxpbmVfbnIgKSBzdG9yZWQsXG4gICAgICAgIHJlZiAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoICAgICAgICAgICAgICAgICAgZHNrZXkgfHwgJzpMPScgfHwgbGluZV9uciApIHZpcnR1YWwsXG4gICAgICAgIGRza2V5ICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmVfbnIgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxjb2RlICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmUgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGpmaWVsZHMgICBqc29uICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAtLSBwcmltYXJ5IGtleSAoIHJvd2lkICksICAgICAgICAgICAgICAgICAgICAgICAgICAgLS0gIyMjIE5PVEUgRXhwZXJpbWVudGFsOiBubyBleHBsaWNpdCBQSywgaW5zdGVhZCBnZW5lcmF0ZWQgYHJvd2lkYCBjb2x1bW5cbiAgICAgIC0tIGNoZWNrICggcm93aWQgcmVnZXhwICdedDptcjpsbjpkcz0uKzpMPVxcXFxkKyQnKSwgIC0tICMjIyBOT1RFIG5vIG5lZWQgdG8gY2hlY2sgYXMgdmFsdWUgaXMgZ2VuZXJhdGVkICMjI1xuICAgICAgdW5pcXVlICggZHNrZXksIGxpbmVfbnIgKSxcbiAgICAgIGZvcmVpZ24ga2V5ICggbGNvZGUgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfbGNvZGVzICggbGNvZGUgKSApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX21pcnJvcl92ZXJicyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHJhbmsgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwgZGVmYXVsdCAxLFxuICAgICAgICBzICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICB2ICAgICAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBvICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCByb3dpZCByZWdleHAgJ150Om1yOnZiOlY9W1xcXFwtOlxcXFwrXFxcXHB7TH1dKyQnICksXG4gICAgICBjaGVjayAoIHJhbmsgPiAwICkgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcmVmICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgcyAgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgdiAgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbyAgICAgICAgIGpzb24gICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNoZWNrICggcm93aWQgcmVnZXhwICdedDptcjozcGw6Uj1cXFxcZCskJyApLFxuICAgICAgLS0gdW5pcXVlICggcmVmLCBzLCB2LCBvIClcbiAgICAgIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xpbmVzICggcm93aWQgKSxcbiAgICAgIGZvcmVpZ24ga2V5ICggdiAgICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX3ZlcmJzICggdiApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9taXJyb3JfdHJpcGxlc19yZWdpc3RlclxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZVxuICAgICAgZm9yIGVhY2ggcm93IGJlZ2luXG4gICAgICAgIHNlbGVjdCB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfbWlycm9yX3RyaXBsZXNfYmFzZScsXG4gICAgICAgICAgJ3Jvd2lkOicsIG5ldy5yb3dpZCwgJ3JlZjonLCBuZXcucmVmLCAnczonLCBuZXcucywgJ3Y6JywgbmV3LnYsICdvOicsIG5ldy5vICk7XG4gICAgICAgIGVuZDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIChcbiAgICAgICAgcm93aWQgICAgICAgICAgIHRleHQgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHJlZiAgICAgICAgICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBzeWxsYWJsZV9oYW5nICAgdGV4dCAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgc3lsbGFibGVfbGF0biAgIHRleHQgIG5vdCBudWxsIGdlbmVyYXRlZCBhbHdheXMgYXMgKCBpbml0aWFsX2xhdG4gfHwgbWVkaWFsX2xhdG4gfHwgZmluYWxfbGF0biApIHZpcnR1YWwsXG4gICAgICAgIC0tIHN5bGxhYmxlX2xhdG4gICB0ZXh0ICB1bmlxdWUgIG5vdCBudWxsIGdlbmVyYXRlZCBhbHdheXMgYXMgKCBpbml0aWFsX2xhdG4gfHwgbWVkaWFsX2xhdG4gfHwgZmluYWxfbGF0biApIHZpcnR1YWwsXG4gICAgICAgIGluaXRpYWxfaGFuZyAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBtZWRpYWxfaGFuZyAgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgZmluYWxfaGFuZyAgICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGluaXRpYWxfbGF0biAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBtZWRpYWxfbGF0biAgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgZmluYWxfbGF0biAgICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bGFuZzpoYW5nOnN5bDpWPVxcXFxTKyQnIClcbiAgICAgIC0tIHVuaXF1ZSAoIHJlZiwgcywgdiwgbyApXG4gICAgICAtLSBmb3JlaWduIGtleSAoIHJlZiApIHJlZmVyZW5jZXMganpyX21pcnJvcl9saW5lcyAoIHJvd2lkIClcbiAgICAgIC0tIGZvcmVpZ24ga2V5ICggc3lsbGFibGVfaGFuZyApIHJlZmVyZW5jZXMganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgKCBvICkgKVxuICAgICAgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRyaWdnZXIganpyX2xhbmdfaGFuZ19zeWxsYWJsZXNfcmVnaXN0ZXJcbiAgICAgIGJlZm9yZSBpbnNlcnQgb24ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXNcbiAgICAgIGZvciBlYWNoIHJvdyBiZWdpblxuICAgICAgICBzZWxlY3QgdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0KCAnanpyX2xhbmdfaGFuZ19zeWxsYWJsZXMnLFxuICAgICAgICAgIG5ldy5yb3dpZCwgbmV3LnJlZiwgbmV3LnN5bGxhYmxlX2hhbmcsIG5ldy5zeWxsYWJsZV9sYXRuLFxuICAgICAgICAgICAgbmV3LmluaXRpYWxfaGFuZywgbmV3Lm1lZGlhbF9oYW5nLCBuZXcuZmluYWxfaGFuZyxcbiAgICAgICAgICAgIG5ldy5pbml0aWFsX2xhdG4sIG5ldy5tZWRpYWxfbGF0biwgbmV3LmZpbmFsX2xhdG4gKTtcbiAgICAgICAgZW5kO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzIGFzXG4gICAgICBzZWxlY3QgbnVsbCBhcyByb3dpZCwgbnVsbCBhcyByZWYsIG51bGwgYXMgcywgbnVsbCBhcyB2LCBudWxsIGFzIG8gd2hlcmUgZmFsc2UgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAnYzpyZWFkaW5nOmtvLUxhdG4nLCAgICAgICAgICBzeWxsYWJsZV9sYXRuICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAnYzpyZWFkaW5nOmtvLUxhdG46aW5pdGlhbCcsICBpbml0aWFsX2xhdG4gICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAnYzpyZWFkaW5nOmtvLUxhdG46bWVkaWFsJywgICBtZWRpYWxfbGF0biAgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAnYzpyZWFkaW5nOmtvLUxhdG46ZmluYWwnLCAgICBmaW5hbF9sYXRuICAgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAnYzpyZWFkaW5nOmtvLUhhbmc6aW5pdGlhbCcsICBpbml0aWFsX2hhbmcgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAnYzpyZWFkaW5nOmtvLUhhbmc6bWVkaWFsJywgICBtZWRpYWxfaGFuZyAgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAnYzpyZWFkaW5nOmtvLUhhbmc6ZmluYWwnLCAgICBmaW5hbF9oYW5nICAgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwgd2hlcmUgZmFsc2VcbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2FsbF90cmlwbGVzIGFzXG4gICAgICBzZWxlY3QgbnVsbCBhcyByb3dpZCwgbnVsbCBhcyByZWYsIG51bGwgYXMgcywgbnVsbCBhcyB2LCBudWxsIGFzIG8gd2hlcmUgZmFsc2UgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCAqIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgKiBmcm9tIGp6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXMgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsIHdoZXJlIGZhbHNlXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl90cmlwbGVzIGFzXG4gICAgICBzZWxlY3QgbnVsbCBhcyByb3dpZCwgbnVsbCBhcyByZWYsIG51bGwgYXMgcmFuaywgbnVsbCBhcyBzLCBudWxsIGFzIHYsIG51bGwgYXMgbyB3aGVyZSBmYWxzZVxuICAgICAgLS0gLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCB0YjEucm93aWQsIHRiMS5yZWYsIHZiMS5yYW5rLCB0YjEucywgdGIxLnYsIHRiMS5vIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgdGIxXG4gICAgICBqb2luIGp6cl9taXJyb3JfdmVyYnMgYXMgdmIxIHVzaW5nICggdiApXG4gICAgICB3aGVyZSB2YjEudiBsaWtlICdjOiUnXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHRiMi5yb3dpZCwgdGIyLnJlZiwgdmIyLnJhbmssIHRiMi5zLCBrci52LCBrci5vIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgdGIyXG4gICAgICBqb2luIGp6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXMgYXMga3Igb24gKCB0YjIudiA9ICdjOnJlYWRpbmc6a28tSGFuZycgYW5kIHRiMi5vID0ga3IucyApXG4gICAgICBqb2luIGp6cl9taXJyb3JfdmVyYnMgYXMgdmIyIG9uICgga3IudiA9IHZiMi52IClcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgb3JkZXIgYnkgcywgdiwgb1xuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfdG9wX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdCAqIGZyb20ganpyX3RyaXBsZXNcbiAgICAgIHdoZXJlIHJhbmsgPSAxXG4gICAgICBvcmRlciBieSBzLCB2LCBvXG4gICAgICA7XCJcIlwiXG5cbiAgICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9jamtfYWdnX2xhdG4gYXNcbiAgICAgIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHMsXG4gICAgICAgICAgdiB8fCAnOmFsbCcgICAgICAgICAgICAgICAgICAgYXMgdixcbiAgICAgICAgICBqc29uX2dyb3VwX2FycmF5KCBvICkgb3ZlciB3ICBhcyBvc1xuICAgICAgICBmcm9tIGp6cl90b3BfdHJpcGxlc1xuICAgICAgICB3aGVyZSB2IGluICggJ2M6cmVhZGluZzp6aC1MYXRuLXBpbnlpbicsJ2M6cmVhZGluZzpqYS14LUthdCtMYXRuJywgJ2M6cmVhZGluZzprby1MYXRuJylcbiAgICAgICAgd2luZG93IHcgYXMgKCBwYXJ0aXRpb24gYnkgcywgdiBvcmRlciBieSBvXG4gICAgICAgICAgcm93cyBiZXR3ZWVuIHVuYm91bmRlZCBwcmVjZWRpbmcgYW5kIHVuYm91bmRlZCBmb2xsb3dpbmcgKVxuICAgICAgICBvcmRlciBieSBzLCB2LCBvc1xuICAgICAgO1wiXCJcIlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfY2prX2FnZzJfbGF0biBhc1xuICAgICAgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgdHQxLnMgICBhcyBzLFxuICAgICAgICAgIHR0Mi5vcyAgYXMgcmVhZGluZ3NfemgsXG4gICAgICAgICAgdHQzLm9zICBhcyByZWFkaW5nc19qYSxcbiAgICAgICAgICB0dDQub3MgIGFzIHJlYWRpbmdzX2tvXG4gICAgICAgIGZyb20gICAgICBqenJfY2prX2FnZ19sYXRuIGFzIHR0MVxuICAgICAgICBsZWZ0IGpvaW4ganpyX2Nqa19hZ2dfbGF0biBhcyB0dDIgb24gKCB0dDEucyA9IHR0Mi5zIGFuZCB0dDIudiA9ICdjOnJlYWRpbmc6emgtTGF0bi1waW55aW46YWxsJyApXG4gICAgICAgIGxlZnQgam9pbiBqenJfY2prX2FnZ19sYXRuIGFzIHR0MyBvbiAoIHR0MS5zID0gdHQzLnMgYW5kIHR0My52ID0gJ2M6cmVhZGluZzpqYS14LUthdCtMYXRuOmFsbCcgIClcbiAgICAgICAgbGVmdCBqb2luIGp6cl9jamtfYWdnX2xhdG4gYXMgdHQ0IG9uICggdHQxLnMgPSB0dDQucyBhbmQgdHQ0LnYgPSAnYzpyZWFkaW5nOmtvLUxhdG46YWxsJyAgICAgICAgKVxuICAgICAgICBvcmRlciBieSBzXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9yZWFkaW5nX3BhaXJzX3poX2phIGFzXG4gICAgICBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICB0MS5zICAgICAgYXMgcyxcbiAgICAgICAgICB0Mi52YWx1ZSAgYXMgcmVhZGluZ196aCxcbiAgICAgICAgICB0My52YWx1ZSAgYXMgcmVhZGluZ19qYVxuICAgICAgICBmcm9tIGp6cl9jamtfYWdnMl9sYXRuIGFzIHQxLFxuICAgICAgICBqc29uX2VhY2goIHQxLnJlYWRpbmdzX3poICkgYXMgdDIsXG4gICAgICAgIGpzb25fZWFjaCggdDEucmVhZGluZ3NfamEgKSBhcyB0M1xuICAgICAgICB3aGVyZSByZWFkaW5nX3poIG5vdCBpbiAoICd5dScsICdjaGknICkgLS0gZXhjbHVkZSBub24taG9tb3Bob25lc1xuICAgICAgICBvcmRlciBieSB0Mi52YWx1ZSwgdDMudmFsdWVcbiAgICAgIDtcIlwiXCJcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX3JlYWRpbmdfcGFpcnNfemhfamFfYWdnIGFzXG4gICAgICBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICByZWFkaW5nX3poLFxuICAgICAgICAgIHJlYWRpbmdfamEsXG4gICAgICAgICAganNvbl9ncm91cF9hcnJheSggcyApIG92ZXIgdyBhcyBjaHJzXG4gICAgICAgIGZyb20ganpyX3JlYWRpbmdfcGFpcnNfemhfamEgYXMgdDFcbiAgICAgICAgd2luZG93IHcgYXMgKCBwYXJ0aXRpb24gYnkgdDEucmVhZGluZ196aCwgdDEucmVhZGluZ19qYSBvcmRlciBieSB0MS5zXG4gICAgICAgICAgcm93cyBiZXR3ZWVuIHVuYm91bmRlZCBwcmVjZWRpbmcgYW5kIHVuYm91bmRlZCBmb2xsb3dpbmcgKVxuICAgICAgb3JkZXIgYnkgcmVhZGluZ196aCwgcmVhZGluZ19qYVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfcmVhZGluZ19wYWlyc196aF9rbyBhc1xuICAgICAgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgdDEucyAgICAgIGFzIHMsXG4gICAgICAgICAgdDIudmFsdWUgIGFzIHJlYWRpbmdfemgsXG4gICAgICAgICAgdDMudmFsdWUgIGFzIHJlYWRpbmdfa29cbiAgICAgICAgZnJvbSBqenJfY2prX2FnZzJfbGF0biBhcyB0MSxcbiAgICAgICAganNvbl9lYWNoKCB0MS5yZWFkaW5nc196aCApIGFzIHQyLFxuICAgICAgICBqc29uX2VhY2goIHQxLnJlYWRpbmdzX2tvICkgYXMgdDNcbiAgICAgICAgd2hlcmUgcmVhZGluZ196aCBub3QgaW4gKCAneXUnLCAnY2hpJyApIC0tIGV4Y2x1ZGUgbm9uLWhvbW9waG9uZXNcbiAgICAgICAgb3JkZXIgYnkgdDIudmFsdWUsIHQzLnZhbHVlXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9yZWFkaW5nX3BhaXJzX3poX2tvX2FnZyBhc1xuICAgICAgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgcmVhZGluZ196aCxcbiAgICAgICAgICByZWFkaW5nX2tvLFxuICAgICAgICAgIGpzb25fZ3JvdXBfYXJyYXkoIHMgKSBvdmVyIHcgYXMgY2hyc1xuICAgICAgICBmcm9tIGp6cl9yZWFkaW5nX3BhaXJzX3poX2tvIGFzIHQxXG4gICAgICAgIHdpbmRvdyB3IGFzICggcGFydGl0aW9uIGJ5IHQxLnJlYWRpbmdfemgsIHQxLnJlYWRpbmdfa28gb3JkZXIgYnkgdDEuc1xuICAgICAgICAgIHJvd3MgYmV0d2VlbiB1bmJvdW5kZWQgcHJlY2VkaW5nIGFuZCB1bmJvdW5kZWQgZm9sbG93aW5nIClcbiAgICAgIG9yZGVyIGJ5IHJlYWRpbmdfemgsIHJlYWRpbmdfa29cbiAgICAgIDtcIlwiXCJcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2VxdWl2YWxlbnRfcmVhZGluZ190cmlwbGVzIGFzXG4gICAgICBzZWxlY3RcbiAgICAgICAgICB0MS5yZWFkaW5nX3poIGFzIHJlYWRpbmdfemgsXG4gICAgICAgICAgdDEucmVhZGluZ19qYSBhcyByZWFkaW5nX2phLFxuICAgICAgICAgIHQyLnJlYWRpbmdfa28gYXMgcmVhZGluZ19rbyxcbiAgICAgICAgICB0MS5zICAgICAgICAgIGFzIHNcbiAgICAgICAgZnJvbSBqenJfcmVhZGluZ19wYWlyc196aF9qYSBhcyB0MVxuICAgICAgICBqb2luIGp6cl9yZWFkaW5nX3BhaXJzX3poX2tvIGFzIHQyIG9uICggdDEucyA9IHQyLnMgYW5kIHQxLnJlYWRpbmdfemggPSB0Mi5yZWFkaW5nX2tvIClcbiAgICAgICAgd2hlcmUgdDEucmVhZGluZ196aCA9IHQxLnJlYWRpbmdfamFcbiAgICAgICAgb3JkZXIgYnkgdDEucmVhZGluZ196aCwgdDEuc1xuICAgICAgO1wiXCJcIlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfYmFuZF9uYW1lcyBhc1xuICAgICAgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgdDEucyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBjMSxcbiAgICAgICAgICB0Mi5zICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGMyLFxuICAgICAgICAgIHQxLnJlYWRpbmdfemggfHwgJyAnIHx8IHQyLnJlYWRpbmdfemggYXMgcmVhZGluZ1xuICAgICAgICBmcm9tIGp6cl9lcXVpdmFsZW50X3JlYWRpbmdfdHJpcGxlcyBhcyB0MVxuICAgICAgICBqb2luIGp6cl9lcXVpdmFsZW50X3JlYWRpbmdfdHJpcGxlcyBhcyB0MlxuICAgICAgICB3aGVyZSB0cnVlXG4gICAgICAgICAgYW5kICggYzEgIT0gYzIgKVxuICAgICAgICAgIGFuZCAoIGMxIG5vdCBpbiAoICfmuoAnLCAn6J+HJywgJ+W8pScsICfkvq0nLCAn5bC9JywgJ+W8uScsICflvL4nICkgKVxuICAgICAgICAgIGFuZCAoIGMyIG5vdCBpbiAoICfmuoAnLCAn6J+HJywgJ+W8pScsICfkvq0nLCAn5bC9JywgJ+W8uScsICflvL4nICkgKVxuICAgICAgICBvcmRlciBieSByZWFkaW5nXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9iYW5kX25hbWVzXzIgYXNcbiAgICAgIHNlbGVjdFxuICAgICAgICAgIGMxIHx8IGMyIGFzIGNcbiAgICAgICAgZnJvbSBqenJfYmFuZF9uYW1lc1xuICAgICAgICBvcmRlciBieSByZWFkaW5nXG4gICAgICA7XCJcIlwiXG5cbiAgICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfY29tcG9uZW50cyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHJlZiAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxldmVsICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxuciAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHJuciAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGdseXBoICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGNvbXBvbmVudCB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBmb3JlaWduIGtleSAoIHJlZiApIHJlZmVyZW5jZXMganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCAoIGxlbmd0aCggZ2x5cGggICAgICkgPSAxICkgb3IgKCBnbHlwaCAgICAgIHJlZ2V4cCAnXiZbXFxcXC1hLXowLTlfXSsjWzAtOWEtZl17NCw2fTskJyApICksXG4gICAgICBjaGVjayAoICggbGVuZ3RoKCBjb21wb25lbnQgKSA9IDEgKSBvciAoIGNvbXBvbmVudCAgcmVnZXhwICdeJltcXFxcLWEtejAtOV9dKyNbMC05YS1mXXs0LDZ9OyQnICkgKSxcbiAgICAgIGNoZWNrICggcm93aWQgcmVnZXhwICdeLiokJyApXG4gICAgICApO1wiXCJcIlxuXG5cbiAgICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV91Y19ub3JtYWxpemF0aW9uX2ZhdWx0cyBhcyBzZWxlY3RcbiAgICAgICAgbWwucm93aWQgIGFzIHJvd2lkLFxuICAgICAgICBtbC5yZWYgICAgYXMgcmVmLFxuICAgICAgICBtbC5saW5lICAgYXMgbGluZVxuICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzIGFzIG1sXG4gICAgICB3aGVyZSB0cnVlXG4gICAgICAgIGFuZCAoIG5vdCBpc191Y19ub3JtYWwoIG1sLmxpbmUgKSApXG4gICAgICBvcmRlciBieSBtbC5yb3dpZDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcgX2p6cl9tZXRhX2tyX3JlYWRpbmdzX3Vua25vd25fdmVyYl9mYXVsdHMgYXMgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgY291bnQoKikgb3ZlciAoIHBhcnRpdGlvbiBieSB2ICkgICAgYXMgY291bnQsXG4gICAgICAgICAgJ2p6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXM6Uj0qJyAgYXMgcm93aWQsXG4gICAgICAgICAgJyonICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICd1bmtub3duLXZlcmInICAgICAgICAgICAgICAgICAgICAgIGFzIGRlc2NyaXB0aW9uLFxuICAgICAgICAgIHYgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHF1b3RlXG4gICAgICAgIGZyb20ganpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlcyBhcyBublxuICAgICAgICB3aGVyZSBub3QgZXhpc3RzICggc2VsZWN0IDEgZnJvbSBqenJfbWlycm9yX3ZlcmJzIGFzIHZiIHdoZXJlIHZiLnYgPSBubi52ICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV9lcnJvcl92ZXJiX2ZhdWx0cyBhcyBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICBjb3VudCgqKSBvdmVyICggcGFydGl0aW9uIGJ5IHYgKSAgICBhcyBjb3VudCxcbiAgICAgICAgICAnZXJyb3I6Uj0qJyAgICAgICAgICAgICAgICAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgICByb3dpZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgJ2Vycm9yLXZlcmInICAgICAgICAgICAgICAgICAgICAgICAgYXMgZGVzY3JpcHRpb24sXG4gICAgICAgICAgJ3Y6JyB8fCB2IHx8ICcsIG86JyB8fCBvICAgICAgICAgICAgYXMgcXVvdGVcbiAgICAgICAgZnJvbSBqenJfdHJpcGxlcyBhcyBublxuICAgICAgICB3aGVyZSB2IGxpa2UgJyU6ZXJyb3InO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBfanpyX21ldGFfbWlycm9yX2xpbmVzX3doaXRlc3BhY2VfZmF1bHRzIGFzIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIDEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGNvdW50LFxuICAgICAgICAgICd0Om1yOmxuOmpmaWVsZHM6d3M6Uj0qJyAgICAgICAgICAgICAgICAgICAgIGFzIHJvd2lkLFxuICAgICAgICAgIG1sLnJvd2lkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAnZXh0cmFuZW91cy13aGl0ZXNwYWNlJyAgICAgICAgICAgICAgICAgICAgICBhcyBkZXNjcmlwdGlvbixcbiAgICAgICAgICBtbC5qZmllbGRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBxdW90ZVxuICAgICAgICBmcm9tIGp6cl9taXJyb3JfbGluZXMgYXMgbWxcbiAgICAgICAgd2hlcmUgKCBoYXNfcGVyaXBoZXJhbF93c19pbl9qZmllbGQoIGpmaWVsZHMgKSApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfbWV0YV9mYXVsdHMgYXNcbiAgICAgIHNlbGVjdCBudWxsIGFzIGNvdW50LCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyBkZXNjcmlwdGlvbiwgbnVsbCAgYXMgcXVvdGUgd2hlcmUgZmFsc2UgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCAxLCByb3dpZCwgcmVmLCAgJ3VjLW5vcm1hbGl6YXRpb24nLCBsaW5lICBhcyBxdW90ZSBmcm9tIF9qenJfbWV0YV91Y19ub3JtYWxpemF0aW9uX2ZhdWx0cyAgICAgICAgICB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tIF9qenJfbWV0YV9rcl9yZWFkaW5nc191bmtub3duX3ZlcmJfZmF1bHRzICB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tIF9qenJfbWV0YV9lcnJvcl92ZXJiX2ZhdWx0cyAgICAgICAgICAgICAgICB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmcm9tIF9qenJfbWV0YV9taXJyb3JfbGluZXNfd2hpdGVzcGFjZV9mYXVsdHMgICB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwgd2hlcmUgZmFsc2VcbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfc3lsbGFibGVzIGFzIHNlbGVjdFxuICAgICMgICAgICAgdDEuc1xuICAgICMgICAgICAgdDEudlxuICAgICMgICAgICAgdDEub1xuICAgICMgICAgICAgdGkucyBhcyBpbml0aWFsX2hhbmdcbiAgICAjICAgICAgIHRtLnMgYXMgbWVkaWFsX2hhbmdcbiAgICAjICAgICAgIHRmLnMgYXMgZmluYWxfaGFuZ1xuICAgICMgICAgICAgdGkubyBhcyBpbml0aWFsX2xhdG5cbiAgICAjICAgICAgIHRtLm8gYXMgbWVkaWFsX2xhdG5cbiAgICAjICAgICAgIHRmLm8gYXMgZmluYWxfbGF0blxuICAgICMgICAgIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgdDFcbiAgICAjICAgICBqb2luXG4gICAgIyAgICAgam9pbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0aSBvbiAoIHQxLilcbiAgICAjICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIyMgYWdncmVnYXRlIHRhYmxlIGZvciBhbGwgcm93aWRzIGdvZXMgaGVyZSAjIyNcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyMjXG5cbiAgICAgICAgICAgICAgIC4gICAgICAgICAgICAgICAgIC4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICAgLm84ICAgICAgICAgICAgICAgLm84ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5vOFxuICAgLm9vb28ubyAubzg4OG9vICAub29vby4gICAubzg4OG9vICAub29vb28uICBvb28uIC5vby4gIC5vby4gICAgLm9vb29vLiAgb29vLiAub28uICAgLm84ODhvbyAgLm9vb28ub1xuICBkODgoICBcIjggICA4ODggICBgUCAgKTg4YiAgICA4ODggICBkODgnIGA4OGIgYDg4OFBcIlk4OGJQXCJZODhiICBkODgnIGA4OGIgYDg4OFBcIlk4OGIgICAgODg4ICAgZDg4KCAgXCI4XG4gIGBcIlk4OGIuICAgIDg4OCAgICAub1BcIjg4OCAgICA4ODggICA4ODhvb284ODggIDg4OCAgIDg4OCAgIDg4OCAgODg4b29vODg4ICA4ODggICA4ODggICAgODg4ICAgYFwiWTg4Yi5cbiAgby4gICk4OGIgICA4ODggLiBkOCggIDg4OCAgICA4ODggLiA4ODggICAgLm8gIDg4OCAgIDg4OCAgIDg4OCAgODg4ICAgIC5vICA4ODggICA4ODggICAgODg4IC4gby4gICk4OGJcbiAgOFwiXCI4ODhQJyAgIFwiODg4XCIgYFk4ODhcIlwiOG8gICBcIjg4OFwiIGBZOGJvZDhQJyBvODg4byBvODg4byBvODg4byBgWThib2Q4UCcgbzg4OG8gbzg4OG8gICBcIjg4OFwiIDhcIlwiODg4UCdcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQHN0YXRlbWVudHM6XG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfZGF0YXNvdXJjZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfZGF0YXNvdXJjZXMgKCByb3dpZCwgZHNrZXksIHBhdGggKSB2YWx1ZXMgKCAkcm93aWQsICRkc2tleSwgJHBhdGggKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIGRza2V5ICkgZG8gdXBkYXRlIHNldCBwYXRoID0gZXhjbHVkZWQucGF0aFxuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfbWlycm9yX3ZlcmI6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl92ZXJicyAoIHJvd2lkLCByYW5rLCBzLCB2LCBvICkgdmFsdWVzICggJHJvd2lkLCAkcmFuaywgJHMsICR2LCAkbyApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcm93aWQgKSBkbyB1cGRhdGUgc2V0IHJhbmsgPSBleGNsdWRlZC5yYW5rLCBzID0gZXhjbHVkZWQucywgdiA9IGV4Y2x1ZGVkLnYsIG8gPSBleGNsdWRlZC5vXG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGU6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl9sY29kZXMgKCByb3dpZCwgbGNvZGUsIGNvbW1lbnQgKSB2YWx1ZXMgKCAkcm93aWQsICRsY29kZSwgJGNvbW1lbnQgKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIHJvd2lkICkgZG8gdXBkYXRlIHNldCBsY29kZSA9IGV4Y2x1ZGVkLmxjb2RlLCBjb21tZW50ID0gZXhjbHVkZWQuY29tbWVudFxuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfbWlycm9yX3RyaXBsZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoIHJvd2lkLCByZWYsIHMsIHYsIG8gKSB2YWx1ZXMgKCAkcm93aWQsICRyZWYsICRzLCAkdiwgJG8gKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIHJlZiwgcywgdiwgbyApIGRvIG5vdGhpbmdcbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfbGluZXMgKCBkc2tleSwgbGluZV9uciwgbGNvZGUsIGxpbmUsIGpmaWVsZHMgKVxuICAgICAgc2VsZWN0XG4gICAgICAgIC0tICd0Om1yOmxuOlI9JyB8fCByb3dfbnVtYmVyKCkgb3ZlciAoKSAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgLS0gZHMuZHNrZXkgfHwgJzpMPScgfHwgZmwubGluZV9uciAgIGFzIHJvd2lkLFxuICAgICAgICBkcy5kc2tleSAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZHNrZXksXG4gICAgICAgIGZsLmxpbmVfbnIgICAgICAgICAgICAgICAgICAgICAgICBhcyBsaW5lX25yLFxuICAgICAgICBmbC5sY29kZSAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbGNvZGUsXG4gICAgICAgIGZsLmxpbmUgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBsaW5lLFxuICAgICAgICBmbC5qZmllbGRzICAgICAgICAgICAgICAgICAgICAgICAgYXMgamZpZWxkc1xuICAgICAgZnJvbSBqenJfZGF0YXNvdXJjZXMgICAgICAgIGFzIGRzXG4gICAgICBqb2luIGZpbGVfbGluZXMoIGRzLnBhdGggKSAgYXMgZmxcbiAgICAgIHdoZXJlIHRydWVcbiAgICAgIC0tIG9uIGNvbmZsaWN0ICggZHNrZXksIGxpbmVfbnIgKSBkbyB1cGRhdGUgc2V0IGxpbmUgPSBleGNsdWRlZC5saW5lXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlczogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoIHJvd2lkLCByZWYsIHMsIHYsIG8gKVxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICAgIGd0LnJvd2lkX291dCAgICBhcyByb3dpZCxcbiAgICAgICAgICAgIGd0LnJlZiAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgICBndC5zICAgICAgICAgICAgYXMgcyxcbiAgICAgICAgICAgIGd0LnYgICAgICAgICAgICBhcyB2LFxuICAgICAgICAgICAgZ3QubyAgICAgICAgICAgIGFzIG9cbiAgICAgICAgICBmcm9tIGp6cl9taXJyb3JfbGluZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbWxcbiAgICAgICAgICBqb2luIGdldF90cmlwbGVzKCBtbC5yb3dpZCwgbWwuZHNrZXksIG1sLmpmaWVsZHMgKSAgYXMgZ3RcbiAgICAgICAgICB3aGVyZSB0cnVlXG4gICAgICAgICAgICBhbmQgKCBtbC5sY29kZSA9ICdEJyApXG4gICAgICAgICAgICAtLSBhbmQgKCBtbC5kc2tleSA9ICdkaWN0Om1lYW5pbmdzJyApXG4gICAgICAgICAgICBhbmQgKCBtbC5qZmllbGRzIGlzIG5vdCBudWxsIClcbiAgICAgICAgICAgIGFuZCAoIG1sLmpmaWVsZHMtPj4nJFswXScgbm90IHJlZ2V4cCAnXkBnbHlwaHMnIClcbiAgICAgICAgICAgIC0tIGFuZCAoIG1sLmZpZWxkXzMgcmVnZXhwICdeKD86cHl8aGl8a2EpOicgKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIHJlZiwgcywgdiwgbyApIGRvIG5vdGhpbmdcbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbGFuZ19oYW5nZXVsX3N5bGxhYmxlczogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyAoIHJvd2lkLCByZWYsXG4gICAgICAgIHN5bGxhYmxlX2hhbmcsIGluaXRpYWxfaGFuZywgbWVkaWFsX2hhbmcsIGZpbmFsX2hhbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsX2xhdG4sIG1lZGlhbF9sYXRuLCBmaW5hbF9sYXRuIClcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICAndDpsYW5nOmhhbmc6c3lsOlY9JyB8fCBtdC5vICAgICAgICAgIGFzIHJvd2lkLFxuICAgICAgICAgICAgbXQucm93aWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgICBtdC5vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHN5bGxhYmxlX2hhbmcsXG4gICAgICAgICAgICBkaC5pbml0aWFsICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGluaXRpYWxfaGFuZyxcbiAgICAgICAgICAgIGRoLm1lZGlhbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbWVkaWFsX2hhbmcsXG4gICAgICAgICAgICBkaC5maW5hbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGZpbmFsX2hhbmcsXG4gICAgICAgICAgICBjb2FsZXNjZSggbXRpLm8sICcnICkgICAgICAgICAgICAgICAgIGFzIGluaXRpYWxfbGF0bixcbiAgICAgICAgICAgIGNvYWxlc2NlKCBtdG0ubywgJycgKSAgICAgICAgICAgICAgICAgYXMgbWVkaWFsX2xhdG4sXG4gICAgICAgICAgICBjb2FsZXNjZSggbXRmLm8sICcnICkgICAgICAgICAgICAgICAgIGFzIGZpbmFsX2xhdG5cbiAgICAgICAgICBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICAgICAgICAgICAgIGFzIG10XG4gICAgICAgICAgbGVmdCBqb2luIGRpc2Fzc2VtYmxlX2hhbmdldWwoIG10Lm8gKSAgICBhcyBkaFxuICAgICAgICAgIGxlZnQgam9pbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyBtdGkgb24gKCBtdGkucyA9IGRoLmluaXRpYWwgYW5kIG10aS52ID0gJ3g6a28tSGFuZytMYXRuOmluaXRpYWwnIClcbiAgICAgICAgICBsZWZ0IGpvaW4ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgbXRtIG9uICggbXRtLnMgPSBkaC5tZWRpYWwgIGFuZCBtdG0udiA9ICd4OmtvLUhhbmcrTGF0bjptZWRpYWwnICApXG4gICAgICAgICAgbGVmdCBqb2luIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIG10ZiBvbiAoIG10Zi5zID0gZGguZmluYWwgICBhbmQgbXRmLnYgPSAneDprby1IYW5nK0xhdG46ZmluYWwnICAgKVxuICAgICAgICAgIHdoZXJlIHRydWVcbiAgICAgICAgICAgIGFuZCAoIG10LnYgPSAnYzpyZWFkaW5nOmtvLUhhbmcnIClcbiAgICAgICAgICBvcmRlciBieSBtdC5vXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcm93aWQgICAgICAgICApIGRvIG5vdGhpbmdcbiAgICAgICAgLyogIyMjIE5PVEUgYG9uIGNvbmZsaWN0YCBuZWVkZWQgYmVjYXVzZSB3ZSBsb2cgYWxsIGFjdHVhbGx5IG9jY3VycmluZyByZWFkaW5ncyBvZiBhbGwgY2hhcmFjdGVycyAqL1xuICAgICAgICBvbiBjb25mbGljdCAoIHN5bGxhYmxlX2hhbmcgKSBkbyBub3RoaW5nXG4gICAgICAgIDtcIlwiXCJcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICMjI1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb29vbyAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYDg4OCAgICAgICAgICAgICAgLm84XG4gIG9vLm9vb29vLiAgIC5vb29vby4gIG9vLm9vb29vLiAgb29vbyAgb29vbyAgIDg4OCAgIC5vb29vLiAgIC5vODg4b28gIC5vb29vby5cbiAgIDg4OCcgYDg4YiBkODgnIGA4OGIgIDg4OCcgYDg4YiBgODg4ICBgODg4ICAgODg4ICBgUCAgKTg4YiAgICA4ODggICBkODgnIGA4OGJcbiAgIDg4OCAgIDg4OCA4ODggICA4ODggIDg4OCAgIDg4OCAgODg4ICAgODg4ICAgODg4ICAgLm9QXCI4ODggICAgODg4ICAgODg4b29vODg4XG4gICA4ODggICA4ODggODg4ICAgODg4ICA4ODggICA4ODggIDg4OCAgIDg4OCAgIDg4OCAgZDgoICA4ODggICAgODg4IC4gODg4ICAgIC5vXG4gICA4ODhib2Q4UCcgYFk4Ym9kOFAnICA4ODhib2Q4UCcgIGBWODhWXCJWOFAnIG84ODhvIGBZODg4XCJcIjhvICAgXCI4ODhcIiBgWThib2Q4UCdcbiAgIDg4OCAgICAgICAgICAgICAgICAgIDg4OFxuICBvODg4byAgICAgICAgICAgICAgICBvODg4b1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xjb2RlczogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzExJywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGNvZGVzJ1xuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPUInLCBsY29kZTogJ0InLCBjb21tZW50OiAnYmxhbmsgbGluZScsICAgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPUMnLCBsY29kZTogJ0MnLCBjb21tZW50OiAnY29tbWVudCBsaW5lJywgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPUQnLCBsY29kZTogJ0QnLCBjb21tZW50OiAnZGF0YSBsaW5lJywgICAgfVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX3ZlcmJzOiAtPlxuICAgICMjIyBOT1RFXG4gICAgaW4gdmVyYnMsIGluaXRpYWwgY29tcG9uZW50IGluZGljYXRlcyB0eXBlIG9mIHN1YmplY3Q6XG4gICAgICBgYzpgIGlzIGZvciBzdWJqZWN0cyB0aGF0IGFyZSBDSksgY2hhcmFjdGVyc1xuICAgICAgYHg6YCBpcyB1c2VkIGZvciB1bmNsYXNzaWZpZWQgc3ViamVjdHMgKHBvc3NpYmx5IHRvIGJlIHJlZmluZWQgaW4gdGhlIGZ1dHVyZSlcbiAgICAjIyNcbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzEyJywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdmVyYnMnXG4gICAgcm93cyA9IFtcbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9dGVzdGluZzp1bnVzZWQnLCAgICAgICAgICAgICAgcmFuazogMiwgczogXCJOTlwiLCB2OiAndGVzdGluZzp1bnVzZWQnLCAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9eDprby1IYW5nK0xhdG46aW5pdGlhbCcsICAgICAgcmFuazogMiwgczogXCJOTlwiLCB2OiAneDprby1IYW5nK0xhdG46aW5pdGlhbCcsICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9eDprby1IYW5nK0xhdG46bWVkaWFsJywgICAgICAgcmFuazogMiwgczogXCJOTlwiLCB2OiAneDprby1IYW5nK0xhdG46bWVkaWFsJywgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9eDprby1IYW5nK0xhdG46ZmluYWwnLCAgICAgICAgcmFuazogMiwgczogXCJOTlwiLCB2OiAneDprby1IYW5nK0xhdG46ZmluYWwnLCAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOnpoLUxhdG4tcGlueWluJywgICAgcmFuazogMSwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOnpoLUxhdG4tcGlueWluJywgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmphLXgtS2FuJywgICAgICAgICAgcmFuazogMSwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmphLXgtS2FuJywgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmphLXgtSGlyJywgICAgICAgICAgcmFuazogMSwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmphLXgtSGlyJywgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmphLXgtS2F0JywgICAgICAgICAgcmFuazogMSwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmphLXgtS2F0JywgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmphLXgtTGF0bicsICAgICAgICAgcmFuazogMSwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmphLXgtTGF0bicsICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmphLXgtSGlyK0xhdG4nLCAgICAgcmFuazogMSwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmphLXgtSGlyK0xhdG4nLCAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmphLXgtS2F0K0xhdG4nLCAgICAgcmFuazogMSwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmphLXgtS2F0K0xhdG4nLCAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmtvLUhhbmcnLCAgICAgICAgICAgcmFuazogMSwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmtvLUhhbmcnLCAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmtvLUxhdG4nLCAgICAgICAgICAgcmFuazogMSwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmtvLUxhdG4nLCAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmtvLUhhbmc6aW5pdGlhbCcsICAgcmFuazogMiwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmtvLUhhbmc6aW5pdGlhbCcsICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmtvLUhhbmc6bWVkaWFsJywgICAgcmFuazogMiwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmtvLUhhbmc6bWVkaWFsJywgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmtvLUhhbmc6ZmluYWwnLCAgICAgcmFuazogMiwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmtvLUhhbmc6ZmluYWwnLCAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmtvLUxhdG46aW5pdGlhbCcsICAgcmFuazogMiwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmtvLUxhdG46aW5pdGlhbCcsICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmtvLUxhdG46bWVkaWFsJywgICAgcmFuazogMiwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmtvLUxhdG46bWVkaWFsJywgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpyZWFkaW5nOmtvLUxhdG46ZmluYWwnLCAgICAgcmFuazogMiwgczogXCJOTlwiLCB2OiAnYzpyZWFkaW5nOmtvLUxhdG46ZmluYWwnLCAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpzaGFwZTppZHM6c2hvcnRlc3QnLCAgICAgICAgcmFuazogMSwgczogXCJOTlwiLCB2OiAnYzpzaGFwZTppZHM6c2hvcnRlc3QnLCAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpzaGFwZTppZHM6c2hvcnRlc3Q6YXN0JywgICAgcmFuazogMiwgczogXCJOTlwiLCB2OiAnYzpzaGFwZTppZHM6c2hvcnRlc3Q6YXN0JywgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpzaGFwZTppZHM6c2hvcnRlc3Q6ZXJyb3InLCAgcmFuazogMiwgczogXCJOTlwiLCB2OiAnYzpzaGFwZTppZHM6c2hvcnRlc3Q6ZXJyb3InLCBvOiBcIk5OXCIsIH1cbiAgICAgICMgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnNoYXBlOmlkczpoYXMtb3BlcmF0b3InLCAgICByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICdjOnNoYXBlOmlkczpoYXMtb3BlcmF0b3InLCAgIG86IFwiTk5cIiwgfVxuICAgICAgIyB7IHJvd2lkOiAndDptcjp2YjpWPWM6c2hhcGU6aWRzOmhhcy1jb21wb25lbnQnLCAgIHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ2M6c2hhcGU6aWRzOmhhcy1jb21wb25lbnQnLCAgbzogXCJOTlwiLCB9XG4gICAgICBdXG4gICAgZm9yIHJvdyBpbiByb3dzXG4gICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl92ZXJiLnJ1biByb3dcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VzOiAtPlxuICAgIGRlYnVnICfOqWp6cnNkYl9fMTMnLCAnX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VzJ1xuICAgIHBhdGhzID0gZ2V0X3BhdGhzKClcbiAgICAjIGRza2V5ID0gJ2RpY3Q6dWNkOnYxNC4wOnVoZGlkeCc7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MicsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIGRza2V5ID0gJ2RpY3Q6bWVhbmluZ3MnOyAgICAgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEnLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkaWN0Ong6a28tSGFuZytMYXRuJzsgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0yJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZGljdDp4OmphLUthbitMYXRuJzsgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MycsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZGljdDpqYTprYW5qaXVtJzsgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9NCcsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZGljdDpqYTprYW5qaXVtOmF1eCc7ICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9NScsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZGljdDprbzpWPWRhdGEtZ292LmNzdic7ICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9NicsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZGljdDprbzpWPWRhdGEtZ292Lmpzb24nOyAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9NycsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZGljdDprbzpWPWRhdGEtbmF2ZXIuY3N2JzsgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9OCcsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZGljdDprbzpWPWRhdGEtbmF2ZXIuanNvbic7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9OScsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZGljdDprbzpWPVJFQURNRS5tZCc7ICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MTAnLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdzaGFwZTppZHN2Mic7ICAgICAgICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xMScsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIGRza2V5ID0gJ3NoYXBlOnpoejViZic7ICAgICAgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEyJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgO251bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBfb25fb3Blbl9wb3B1bGF0ZV92ZXJiczogLT5cbiAgIyAgIHBhdGhzID0gZ2V0X3BhdGhzKClcbiAgIyAgIGRza2V5ID0gJ2RpY3Q6bWVhbmluZ3MnOyAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MScsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAjICAgZHNrZXkgPSAnZGljdDp1Y2Q6djE0LjA6dWhkaWR4JzsgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0yJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICMgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9saW5lczogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzE0JywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGluZXMnXG4gICAgQHN0YXRlbWVudHMucG9wdWxhdGVfanpyX21pcnJvcl9saW5lcy5ydW4oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQ6ICggbmFtZSwgZmllbGRzLi4uICkgLT5cbiAgICAjIGRlYnVnICfOqWp6cnNkYl9fMTUnLCB7IG5hbWUsIGZpZWxkcywgfVxuICAgIEBzdGF0ZS5tb3N0X3JlY2VudF9pbnNlcnRlZF9yb3cgPSB7IG5hbWUsIGZpZWxkcywgfVxuICAgIDtudWxsXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAjIyNcblxuICBvb29vbyAgICAgb29vIG9vb29vb29vb28uICAgb29vb29vb29vb29vXG4gIGA4ODgnICAgICBgOCcgYDg4OCcgICBgWThiICBgODg4JyAgICAgYDhcbiAgIDg4OCAgICAgICA4ICAgODg4ICAgICAgODg4ICA4ODggICAgICAgICAgLm9vb28ub1xuICAgODg4ICAgICAgIDggICA4ODggICAgICA4ODggIDg4OG9vb284ICAgIGQ4OCggIFwiOFxuICAgODg4ICAgICAgIDggICA4ODggICAgICA4ODggIDg4OCAgICBcIiAgICBgXCJZODhiLlxuICAgYDg4LiAgICAuOCcgICA4ODggICAgIGQ4OCcgIDg4OCAgICAgICAgIG8uICApODhiXG4gICAgIGBZYm9kUCcgICAgbzg4OGJvb2Q4UCcgICBvODg4byAgICAgICAgOFwiXCI4ODhQJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBAZnVuY3Rpb25zOlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQ6XG4gICAgICAjIyMgTk9URSBpbiB0aGUgZnV0dXJlIHRoaXMgZnVuY3Rpb24gY291bGQgdHJpZ2dlciBjcmVhdGlvbiBvZiB0cmlnZ2VycyBvbiBpbnNlcnRzICMjI1xuICAgICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAgIHZhcmFyZ3M6ICAgICAgICB0cnVlXG4gICAgICBjYWxsOiAoIG5hbWUsIGZpZWxkcy4uLiApIC0+IEB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQgbmFtZSwgZmllbGRzLi4uXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMjIyBOT1RFIG1vdmVkIHRvIERicmljX3N0ZDsgY29uc2lkZXIgdG8gb3ZlcndyaXRlIHdpdGggdmVyc2lvbiB1c2luZyBgc2xldml0aGFuL3JlZ2V4YCAjIyNcbiAgICAjIHJlZ2V4cDpcbiAgICAjICAgb3ZlcndyaXRlOiAgICAgIHRydWVcbiAgICAjICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAjICAgY2FsbDogKCBwYXR0ZXJuLCB0ZXh0ICkgLT4gaWYgKCAoIG5ldyBSZWdFeHAgcGF0dGVybiwgJ3YnICkudGVzdCB0ZXh0ICkgdGhlbiAxIGVsc2UgMFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBpc191Y19ub3JtYWw6XG4gICAgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICAgIyMjIE5PVEU6IGFsc28gc2VlIGBTdHJpbmc6OmlzV2VsbEZvcm1lZCgpYCAjIyNcbiAgICAgIGNhbGw6ICggdGV4dCwgZm9ybSA9ICdORkMnICkgLT4gZnJvbV9ib29sIHRleHQgaXMgdGV4dC5ub3JtYWxpemUgZm9ybSAjIyMgJ05GQycsICdORkQnLCAnTkZLQycsIG9yICdORktEJyAjIyNcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaGFzX3BlcmlwaGVyYWxfd3NfaW5famZpZWxkOlxuICAgICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAgIGNhbGw6ICggamZpZWxkc19qc29uICkgLT5cbiAgICAgICAgcmV0dXJuIGZyb21fYm9vbCBmYWxzZSB1bmxlc3MgKCBqZmllbGRzID0gSlNPTi5wYXJzZSBqZmllbGRzX2pzb24gKT9cbiAgICAgICAgcmV0dXJuIGZyb21fYm9vbCBqZmllbGRzLnNvbWUgKCB2YWx1ZSApIC0+IC8oXlxccyl8KFxccyQpLy50ZXN0IHZhbHVlXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBAdGFibGVfZnVuY3Rpb25zOlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBzcGxpdF93b3JkczpcbiAgICAgIGNvbHVtbnM6ICAgICAgWyAna2V5d29yZCcsIF1cbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAnbGluZScsIF1cbiAgICAgIHJvd3M6ICggbGluZSApIC0+XG4gICAgICAgIGtleXdvcmRzID0gbGluZS5zcGxpdCAvKD86XFxwe1p9Kyl8KCg/OlxccHtTY3JpcHQ9SGFufSl8KD86XFxwe0x9Kyl8KD86XFxwe059Kyl8KD86XFxwe1N9KykpL3ZcbiAgICAgICAgZm9yIGtleXdvcmQgaW4ga2V5d29yZHNcbiAgICAgICAgICBjb250aW51ZSB1bmxlc3Mga2V5d29yZD9cbiAgICAgICAgICBjb250aW51ZSBpZiBrZXl3b3JkIGlzICcnXG4gICAgICAgICAgeWllbGQgeyBrZXl3b3JkLCB9XG4gICAgICAgIDtudWxsXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGZpbGVfbGluZXM6XG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2xpbmVfbnInLCAnbGNvZGUnLCAnbGluZScsICdqZmllbGRzJyBdXG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ3BhdGgnLCBdXG4gICAgICByb3dzOiAoIHBhdGggKSAtPlxuICAgICAgICBmb3IgeyBsbnI6IGxpbmVfbnIsIGxpbmUsIGVvbCwgfSBmcm9tIHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgcGF0aFxuICAgICAgICAgIGxpbmUgICAgPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5ub3JtYWxpemVfdGV4dCBsaW5lXG4gICAgICAgICAgamZpZWxkcyA9IG51bGxcbiAgICAgICAgICBzd2l0Y2ggdHJ1ZVxuICAgICAgICAgICAgd2hlbiAvXlxccyokL3YudGVzdCBsaW5lXG4gICAgICAgICAgICAgIGxjb2RlID0gJ0InXG4gICAgICAgICAgICB3aGVuIC9eXFxzKiMvdi50ZXN0IGxpbmVcbiAgICAgICAgICAgICAgbGNvZGUgPSAnQydcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgbGNvZGUgPSAnRCdcbiAgICAgICAgICAgICAgamZpZWxkcyAgID0gSlNPTi5zdHJpbmdpZnkgbGluZS5zcGxpdCAnXFx0J1xuICAgICAgICAgIHlpZWxkIHsgbGluZV9uciwgbGNvZGUsIGxpbmUsIGpmaWVsZHMsIH1cbiAgICAgICAgO251bGxcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgZ2V0X3RyaXBsZXM6XG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ3Jvd2lkX2luJywgJ2Rza2V5JywgJ2pmaWVsZHMnLCBdXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ3Jvd2lkX291dCcsICdyZWYnLCAncycsICd2JywgJ28nLCBdXG4gICAgICByb3dzOiAoIHJvd2lkX2luLCBkc2tleSwgamZpZWxkcyApIC0+XG4gICAgICAgIGZpZWxkcyAgPSBKU09OLnBhcnNlIGpmaWVsZHNcbiAgICAgICAgZW50cnkgICA9IGZpZWxkc1sgMiBdXG4gICAgICAgIHN3aXRjaCBkc2tleVxuICAgICAgICAgIHdoZW4gJ2RpY3Q6eDprby1IYW5nK0xhdG4nICAgICAgICB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXNfZnJvbV9kaWN0X3hfa29fSGFuZ19MYXRuICAgICAgIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICAgd2hlbiAnZGljdDptZWFuaW5ncycgdGhlbiBzd2l0Y2ggdHJ1ZVxuICAgICAgICAgICAgd2hlbiAoIGVudHJ5LnN0YXJ0c1dpdGggJ3B5OicgKSB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXNfZnJvbV9jX3JlYWRpbmdfemhfTGF0bl9waW55aW4gIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICAgICB3aGVuICggZW50cnkuc3RhcnRzV2l0aCAna2E6JyApIHRoZW4geWllbGQgZnJvbSBAdHJpcGxlc19mcm9tX2NfcmVhZGluZ19qYV94X0thbiAgICAgICAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgICAgIHdoZW4gKCBlbnRyeS5zdGFydHNXaXRoICdoaTonICkgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX2phX3hfS2FuICAgICAgICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAgICAgd2hlbiAoIGVudHJ5LnN0YXJ0c1dpdGggJ2hnOicgKSB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXNfZnJvbV9jX3JlYWRpbmdfa29fSGFuZyAgICAgICAgIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICAgd2hlbiAnc2hhcGU6aWRzdjInICAgICAgICAgICAgICAgIHRoZW4geWllbGQgZnJvbSBAdHJpcGxlc19mcm9tX3NoYXBlX2lkc3YyICAgICAgICAgICAgICAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgIyB5aWVsZCBmcm9tIEBnZXRfdHJpcGxlcyByb3dpZF9pbiwgZHNrZXksIGpmaWVsZHNcbiAgICAgICAgO251bGxcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgZGlzYXNzZW1ibGVfaGFuZ2V1bDpcbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAnaGFuZycsIF1cbiAgICAgIGNvbHVtbnM6ICAgICAgWyAnaW5pdGlhbCcsICdtZWRpYWwnLCAnZmluYWwnLCBdXG4gICAgICByb3dzOiAoIGhhbmcgKSAtPlxuICAgICAgICBqYW1vcyA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLl9UTVBfaGFuZ2V1bC5kaXNhc3NlbWJsZSBoYW5nLCB7IGZsYXR0ZW46IGZhbHNlLCB9XG4gICAgICAgIGZvciB7IGZpcnN0OiBpbml0aWFsLCB2b3dlbDogbWVkaWFsLCBsYXN0OiBmaW5hbCwgfSBpbiBqYW1vc1xuICAgICAgICAgIHlpZWxkIHsgaW5pdGlhbCwgbWVkaWFsLCBmaW5hbCwgfVxuICAgICAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpcGxlc19mcm9tX2RpY3RfeF9rb19IYW5nX0xhdG46ICggcm93aWRfaW4sIGRza2V5LCBbIHJvbGUsIHMsIG8sIF0gKSAtPlxuICAgIHJlZiAgICAgICA9IHJvd2lkX2luXG4gICAgdiAgICAgICAgID0gXCJ4OmtvLUhhbmcrTGF0bjoje3JvbGV9XCJcbiAgICBvICAgICAgICA/PSAnJ1xuICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdiwgbywgfVxuICAgIEBzdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpcGxlc19mcm9tX2NfcmVhZGluZ196aF9MYXRuX3BpbnlpbjogKCByb3dpZF9pbiwgZHNrZXksIFsgXywgcywgZW50cnksIF0gKSAtPlxuICAgIHJlZiAgICAgICA9IHJvd2lkX2luXG4gICAgdiAgICAgICAgID0gJ2M6cmVhZGluZzp6aC1MYXRuLXBpbnlpbidcbiAgICBmb3IgcmVhZGluZyBmcm9tIEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfYXRvbmFsX3poX3JlYWRpbmdzIGVudHJ5XG4gICAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHYsIG86IHJlYWRpbmcsIH1cbiAgICBAc3RhdGUudGltZWl0X3Byb2dyZXNzPygpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaXBsZXNfZnJvbV9jX3JlYWRpbmdfamFfeF9LYW46ICggcm93aWRfaW4sIGRza2V5LCBbIF8sIHMsIGVudHJ5LCBdICkgLT5cbiAgICByZWYgICAgICAgPSByb3dpZF9pblxuICAgIGlmIGVudHJ5LnN0YXJ0c1dpdGggJ2thOidcbiAgICAgIHZfeF9LYW4gICA9ICdjOnJlYWRpbmc6amEteC1LYXQnXG4gICAgICB2X0xhdG4gICAgPSAnYzpyZWFkaW5nOmphLXgtS2F0K0xhdG4nXG4gICAgZWxzZVxuICAgICAgdl94X0thbiAgID0gJ2M6cmVhZGluZzpqYS14LUhpcidcbiAgICAgIHZfTGF0biAgICA9ICdjOnJlYWRpbmc6amEteC1IaXIrTGF0bidcbiAgICBmb3IgcmVhZGluZyBmcm9tIEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfamFfcmVhZGluZ3MgZW50cnlcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogdl94X0thbiwgbzogcmVhZGluZywgfVxuICAgICAgIyBmb3IgdHJhbnNjcmlwdGlvbiBmcm9tIEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLnJvbWFuaXplX2phX2thbmEgcmVhZGluZ1xuICAgICAgIyAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogdl9MYXRuLCBvOiB0cmFuc2NyaXB0aW9uLCB9XG4gICAgICB0cmFuc2NyaXB0aW9uID0gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMucm9tYW5pemVfamFfa2FuYSByZWFkaW5nXG4gICAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6IHZfTGF0biwgbzogdHJhbnNjcmlwdGlvbiwgfVxuICAgIEBzdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpcGxlc19mcm9tX2NfcmVhZGluZ19rb19IYW5nOiAoIHJvd2lkX2luLCBkc2tleSwgWyBfLCBzLCBlbnRyeSwgXSApIC0+XG4gICAgcmVmICAgICAgID0gcm93aWRfaW5cbiAgICB2ICAgICAgICAgPSAnYzpyZWFkaW5nOmtvLUhhbmcnXG4gICAgZm9yIHJlYWRpbmcgZnJvbSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5leHRyYWN0X2hnX3JlYWRpbmdzIGVudHJ5XG4gICAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHYsIG86IHJlYWRpbmcsIH1cbiAgICBAc3RhdGUudGltZWl0X3Byb2dyZXNzPygpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaXBsZXNfZnJvbV9zaGFwZV9pZHN2MjogKCByb3dpZF9pbiwgZHNrZXksIFsgXywgcywgZm9ybXVsYSwgXSApIC0+XG4gICAgcmVmICAgICAgID0gcm93aWRfaW5cbiAgICAjIGZvciByZWFkaW5nIGZyb20gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMucGFyc2VfaWRzIGZvcm11bGFcbiAgICAjICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2LCBvOiByZWFkaW5nLCB9XG4gICAgcmV0dXJuIG51bGwgaWYgKCBub3QgZm9ybXVsYT8gKSBvciAoIGZvcm11bGEgaXMgJycgKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiAnYzpzaGFwZTppZHM6c2hvcnRlc3QnLCBvOiBmb3JtdWxhLCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBlcnJvciA9IG51bGxcbiAgICB0cnkgZm9ybXVsYV9hc3QgPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5wYXJzZV9pZGx4IGZvcm11bGEgY2F0Y2ggZXJyb3JcbiAgICAgIG8gPSBKU09OLnN0cmluZ2lmeSB7IHJlZjogJ86panpyc2RiX18xNicsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsIHJvdzogeyByb3dpZF9pbiwgZHNrZXksIHMsIGZvcm11bGEsIH0sIH1cbiAgICAgIHdhcm4gXCJlcnJvcjogI3tvfVwiXG4gICAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6ICdjOnNoYXBlOmlkczpzaG9ydGVzdDplcnJvcicsIG8sIH1cbiAgICByZXR1cm4gbnVsbCBpZiBlcnJvcj9cbiAgICAjICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyBmb3JtdWxhX2pzb24gICAgPSBKU09OLnN0cmluZ2lmeSBmb3JtdWxhX2FzdFxuICAgICMgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiAnYzpzaGFwZTppZHM6c2hvcnRlc3Q6YXN0JywgbzogZm9ybXVsYV9qc29uLCB9XG4gICAgIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgeyBvcGVyYXRvcnMsXG4gICAgIyAgIGNvbXBvbmVudHMsIH0gPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5vcGVyYXRvcnNfYW5kX2NvbXBvbmVudHNfZnJvbV9pZGx4IGZvcm11bGFfYXN0XG4gICAgIyBzZWVuX29wZXJhdG9ycyAgPSBuZXcgU2V0KClcbiAgICAjIHNlZW5fY29tcG9uZW50cyA9IG5ldyBTZXQoKVxuICAgICMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIGZvciBvcGVyYXRvciBpbiBvcGVyYXRvcnNcbiAgICAjICAgY29udGludWUgaWYgc2Vlbl9vcGVyYXRvcnMuaGFzIG9wZXJhdG9yXG4gICAgIyAgIHNlZW5fb3BlcmF0b3JzLmFkZCBvcGVyYXRvclxuICAgICMgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6ICdjOnNoYXBlOmlkczpoYXMtb3BlcmF0b3InLCBvOiBvcGVyYXRvciwgfVxuICAgICMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIGZvciBjb21wb25lbnQgaW4gY29tcG9uZW50c1xuICAgICMgICBjb250aW51ZSBpZiBzZWVuX2NvbXBvbmVudHMuaGFzIGNvbXBvbmVudFxuICAgICMgICBzZWVuX2NvbXBvbmVudHMuYWRkIGNvbXBvbmVudFxuICAgICMgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6ICdjOnNoYXBlOmlkczpoYXMtY29tcG9uZW50JywgbzogY29tcG9uZW50LCB9XG4gICAgIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIEBzdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICA7bnVsbFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyMjXG5cbm9vb29vXG5gODg4J1xuIDg4OCAgICAgICAgICAub29vby4gICBvb28uIC5vby4gICAgLm9vb29vb29vICAgICAgICAgICAgICAub29vby5vIG9vb28gZDhiIG9vb28gICAgb29vXG4gODg4ICAgICAgICAgYFAgICk4OGIgIGA4ODhQXCJZODhiICA4ODgnIGA4OGIgICAgICAgICAgICAgIGQ4OCggIFwiOCBgODg4XCJcIjhQICBgODguICAuOCdcbiA4ODggICAgICAgICAgLm9QXCI4ODggICA4ODggICA4ODggIDg4OCAgIDg4OCAgICAgICAgICAgICAgYFwiWTg4Yi4gICA4ODggICAgICAgYDg4Li44J1xuIDg4OCAgICAgICBvIGQ4KCAgODg4ICAgODg4ICAgODg4ICBgODhib2Q4UCcgICAgICAgICAgICAgIG8uICApODhiICA4ODggICAgICAgIGA4ODgnXG5vODg4b29vb29vZDggYFk4ODhcIlwiOG8gbzg4OG8gbzg4OG8gYDhvb29vb28uICBvb29vb29vb29vbyA4XCJcIjg4OFAnIGQ4ODhiICAgICAgICBgOCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFwiICAgICBZRFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlk4ODg4OFAnXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBMYW5ndWFnZV9zZXJ2aWNlc1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQF9UTVBfaGFuZ2V1bCA9IHJlcXVpcmUgJ2hhbmd1bC1kaXNhc3NlbWJsZSdcbiAgICBAX1RNUF9rYW5hICAgID0gcmVxdWlyZSAnd2FuYWthbmEnXG4gICAgIyB7IHRvSGlyYWdhbmEsXG4gICAgIyAgIHRvS2FuYSxcbiAgICAjICAgdG9LYXRha2FuYVxuICAgICMgICB0b1JvbWFqaSxcbiAgICAjICAgdG9rZW5pemUsICAgICAgICAgfSA9IHJlcXVpcmUgJ3dhbmFrYW5hJ1xuICAgIDt1bmRlZmluZWRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG5vcm1hbGl6ZV90ZXh0OiAoIHRleHQsIGZvcm0gPSAnTkZDJyApIC0+IHRleHQubm9ybWFsaXplIGZvcm1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHJlbW92ZV9waW55aW5fZGlhY3JpdGljczogKCB0ZXh0ICkgLT4gKCB0ZXh0Lm5vcm1hbGl6ZSAnTkZLRCcgKS5yZXBsYWNlIC9cXFB7TH0vZ3YsICcnXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBleHRyYWN0X2F0b25hbF96aF9yZWFkaW5nczogKCBlbnRyeSApIC0+XG4gICAgIyBweTp6aMO5LCB6aGUsIHpoxIFvLCB6aMOhbywgemjHlCwgesSrXG4gICAgUiA9IGVudHJ5XG4gICAgUiA9IFIucmVwbGFjZSAvXnB5Oi92LCAnJ1xuICAgIFIgPSBSLnNwbGl0IC8sXFxzKi92XG4gICAgUiA9ICggKCBAcmVtb3ZlX3Bpbnlpbl9kaWFjcml0aWNzIHpoX3JlYWRpbmcgKSBmb3IgemhfcmVhZGluZyBpbiBSIClcbiAgICBSID0gbmV3IFNldCBSXG4gICAgUi5kZWxldGUgJ251bGwnXG4gICAgUi5kZWxldGUgJ0BudWxsJ1xuICAgIHJldHVybiBbIFIuLi4sIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGV4dHJhY3RfamFfcmVhZGluZ3M6ICggZW50cnkgKSAtPlxuICAgICMg56m6ICAgICAgaGk644Gd44KJLCDjgYLCtyjjgY9844GNfOOBkeOCiyksIOOBi+OCiSwg44GZwrco44GPfOOBi+OBmSksIOOCgOOBqsK344GX44GEXG4gICAgUiA9IGVudHJ5XG4gICAgUiA9IFIucmVwbGFjZSAvXig/OmhpfGthKTovdiwgJydcbiAgICBSID0gUi5yZXBsYWNlIC9cXHMrL2d2LCAnJ1xuICAgIFIgPSBSLnNwbGl0IC8sXFxzKi92XG4gICAgIyMjIE5PVEUgcmVtb3ZlIG5vLXJlYWRpbmdzIG1hcmtlciBgQG51bGxgIGFuZCBjb250ZXh0dWFsIHJlYWRpbmdzIGxpa2UgLeODjeODsyBmb3Ig57iBLCAt44OO44KmIGZvciDnjosgIyMjXG4gICAgUiA9ICggcmVhZGluZyBmb3IgcmVhZGluZyBpbiBSIHdoZW4gbm90IHJlYWRpbmcuc3RhcnRzV2l0aCAnLScgKVxuICAgIFIgPSBuZXcgU2V0IFJcbiAgICBSLmRlbGV0ZSAnbnVsbCdcbiAgICBSLmRlbGV0ZSAnQG51bGwnXG4gICAgcmV0dXJuIFsgUi4uLiwgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZXh0cmFjdF9oZ19yZWFkaW5nczogKCBlbnRyeSApIC0+XG4gICAgIyDnqbogICAgICBoaTrjgZ3jgoksIOOBgsK3KOOBj3zjgY1844GR44KLKSwg44GL44KJLCDjgZnCtyjjgY9844GL44GZKSwg44KA44GqwrfjgZfjgYRcbiAgICBSID0gZW50cnlcbiAgICBSID0gUi5yZXBsYWNlIC9eKD86aGcpOi92LCAnJ1xuICAgIFIgPSBSLnJlcGxhY2UgL1xccysvZ3YsICcnXG4gICAgUiA9IFIuc3BsaXQgLyxcXHMqL3ZcbiAgICBSID0gbmV3IFNldCBSXG4gICAgUi5kZWxldGUgJ251bGwnXG4gICAgUi5kZWxldGUgJ0BudWxsJ1xuICAgIGhhbmdldWwgPSBbIFIuLi4sIF0uam9pbiAnJ1xuICAgICMgZGVidWcgJ86panpyc2RiX18xNycsIEBfVE1QX2hhbmdldWwuZGlzYXNzZW1ibGUgaGFuZ2V1bCwgeyBmbGF0dGVuOiBmYWxzZSwgfVxuICAgIHJldHVybiBbIFIuLi4sIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHJvbWFuaXplX2phX2thbmE6ICggZW50cnkgKSAtPlxuICAgIGNmZyA9IHt9XG4gICAgcmV0dXJuIEBfVE1QX2thbmEudG9Sb21hamkgZW50cnksIGNmZ1xuICAgICMgIyMjIHN5c3RlbWF0aWMgbmFtZSBtb3JlIGxpa2UgYC4uLl9qYV94X2thbl9sYXRuKClgICMjI1xuICAgICMgaGVscCAnzqlkamtyX18xOCcsIHRvSGlyYWdhbmEgICfjg6njg7zjg6Hjg7MnLCAgICAgICB7IGNvbnZlcnRMb25nVm93ZWxNYXJrOiBmYWxzZSwgfVxuICAgICMgaGVscCAnzqlkamtyX18xOScsIHRvSGlyYWdhbmEgICfjg6njg7zjg6Hjg7MnLCAgICAgICB7IGNvbnZlcnRMb25nVm93ZWxNYXJrOiB0cnVlLCB9XG4gICAgIyBoZWxwICfOqWRqa3JfXzIwJywgdG9LYW5hICAgICAgJ3dhbmFrYW5hJywgICB7IGN1c3RvbUthbmFNYXBwaW5nOiB7IG5hOiAn44GrJywga2E6ICdCYW5hJyB9LCB9XG4gICAgIyBoZWxwICfOqWRqa3JfXzIxJywgdG9LYW5hICAgICAgJ3dhbmFrYW5hJywgICB7IGN1c3RvbUthbmFNYXBwaW5nOiB7IHdha2E6ICco5ZKM5q2MKScsIHdhOiAnKOWSjDIpJywga2E6ICco5q2MMiknLCBuYTogJyjlkI0pJywga2E6ICcoQmFuYSknLCBuYWthOiAnKOS4rSknLCB9LCB9XG4gICAgIyBoZWxwICfOqWRqa3JfXzIyJywgdG9Sb21hamkgICAgJ+OBpOOBmOOBjuOCiicsICAgICB7IGN1c3RvbVJvbWFqaU1hcHBpbmc6IHsg44GYOiAnKHppKScsIOOBpDogJyh0dSknLCDjgoo6ICcobGkpJywg44KK44KH44GGOiAnKHJ5b3UpJywg44KK44KHOiAnKHJ5byknIH0sIH1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHBhcnNlX2lkbHg6ICggZm9ybXVsYSApIC0+IElETFgucGFyc2UgZm9ybXVsYVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgb3BlcmF0b3JzX2FuZF9jb21wb25lbnRzX2Zyb21faWRseDogKCBmb3JtdWxhICkgLT5cbiAgICBzd2l0Y2ggdHlwZSA9IHR5cGVfb2YgZm9ybXVsYVxuICAgICAgd2hlbiAndGV4dCcgICB0aGVuICBmb3JtdWxhX2FzdCA9IEBwYXJzZV9pZGx4IGZvcm11bGFcbiAgICAgIHdoZW4gJ2xpc3QnICAgdGhlbiAgZm9ybXVsYV9hc3QgPSAgICAgICAgICAgICBmb3JtdWxhXG4gICAgICBlbHNlIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX18yMyBleHBlY3RlZCBhIHRleHQgb3IgYSBsaXN0LCBnb3QgYSAje3R5cGV9XCJcbiAgICBvcGVyYXRvcnMgICA9IFtdXG4gICAgY29tcG9uZW50cyAgPSBbXVxuICAgIHNlcGFyYXRlICAgID0gKCBsaXN0ICkgLT5cbiAgICAgIGZvciBlbGVtZW50LCBpZHggaW4gbGlzdFxuICAgICAgICBpZiBpZHggaXMgMFxuICAgICAgICAgIG9wZXJhdG9ycy5wdXNoIGVsZW1lbnRcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICBpZiAoIHR5cGVfb2YgZWxlbWVudCApIGlzICdsaXN0J1xuICAgICAgICAgIHNlcGFyYXRlIGVsZW1lbnRcbiAgICAgICAgICAjIGNvbXBvbmVudHMuc3BsaWNlIGNvbXBvbmVudHMubGVuZ3RoLCAwLCAoIHNlcGFyYXRlIGVsZW1lbnQgKS4uLlxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIGNvbXBvbmVudHMucHVzaCBlbGVtZW50XG4gICAgc2VwYXJhdGUgZm9ybXVsYV9hc3RcbiAgICByZXR1cm4geyBvcGVyYXRvcnMsIGNvbXBvbmVudHMsIH1cblxuXG5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyMgVEFJTlQgZ29lcyBpbnRvIGNvbnN0cnVjdG9yIG9mIEp6ciBjbGFzcyAjIyNcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIyNcblxuICAgb29vbyAgbzhvXG4gICBgODg4ICBgXCInXG4gICAgODg4IG9vb28gICAgb29vb29vb28gb29vbyAgb29vbyAgb29vbyBkOGIgIC5vb29vLlxuICAgIDg4OCBgODg4ICAgZCdcIlwiN2Q4UCAgYDg4OCAgYDg4OCAgYDg4OFwiXCI4UCBgUCAgKTg4YlxuICAgIDg4OCAgODg4ICAgICAuZDhQJyAgICA4ODggICA4ODggICA4ODggICAgICAub1BcIjg4OFxuICAgIDg4OCAgODg4ICAgLmQ4UCcgIC5QICA4ODggICA4ODggICA4ODggICAgIGQ4KCAgODg4XG4uby4gODhQIG84ODhvIGQ4ODg4ODg4UCAgIGBWODhWXCJWOFAnIGQ4ODhiICAgIGBZODg4XCJcIjhvXG5gWTg4OFBcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBKaXp1cmFcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBwYXRocyAgICAgICAgICAgICAgPSBnZXRfcGF0aHMoKVxuICAgIEBsYW5ndWFnZV9zZXJ2aWNlcyAgPSBuZXcgTGFuZ3VhZ2Vfc2VydmljZXMoKVxuICAgIEBkYmEgICAgICAgICAgICAgICAgPSBuZXcgSnpyX2RiX2FkYXB0ZXIgQHBhdGhzLmRiLCB7IGhvc3Q6IEAsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIEBkYmEuaXNfZnJlc2hcbiAgICAjIyMgVEFJTlQgbW92ZSB0byBKenJfZGJfYWRhcHRlciB0b2dldGhlciB3aXRoIHRyeS9jYXRjaCAjIyNcbiAgICAgIHRyeVxuICAgICAgICBAcG9wdWxhdGVfbWVhbmluZ19taXJyb3JfdHJpcGxlcygpXG4gICAgICBjYXRjaCBjYXVzZVxuICAgICAgICBmaWVsZHNfcnByID0gcnByIEBkYmEuc3RhdGUubW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93XG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX18yNCB3aGVuIHRyeWluZyB0byBpbnNlcnQgdGhpcyByb3c6ICN7ZmllbGRzX3Jwcn0sIGFuIGVycm9yIHdhcyB0aHJvd246ICN7Y2F1c2UubWVzc2FnZX1cIiwgXFxcbiAgICAgICAgICB7IGNhdXNlLCB9XG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgIyMjIFRBSU5UIG1vdmUgdG8gSnpyX2RiX2FkYXB0ZXIgdG9nZXRoZXIgd2l0aCB0cnkvY2F0Y2ggIyMjXG4gICAgICB0cnlcbiAgICAgICAgQHBvcHVsYXRlX2hhbmdldWxfc3lsbGFibGVzKClcbiAgICAgIGNhdGNoIGNhdXNlXG4gICAgICAgIGZpZWxkc19ycHIgPSBycHIgQGRiYS5zdGF0ZS5tb3N0X3JlY2VudF9pbnNlcnRlZF9yb3dcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfXzI1IHdoZW4gdHJ5aW5nIHRvIGluc2VydCB0aGlzIHJvdzogI3tmaWVsZHNfcnByfSwgYW4gZXJyb3Igd2FzIHRocm93bjogI3tjYXVzZS5tZXNzYWdlfVwiLCBcXFxuICAgICAgICAgIHsgY2F1c2UsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDt1bmRlZmluZWRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHBvcHVsYXRlX21lYW5pbmdfbWlycm9yX3RyaXBsZXM6IC0+XG4gICAgZG8gPT5cbiAgICAgIHsgdG90YWxfcm93X2NvdW50LCB9ID0gKCBAZGJhLnByZXBhcmUgU1FMXCJcIlwiXG4gICAgICAgIHNlbGVjdFxuICAgICAgICAgICAgY291bnQoKikgYXMgdG90YWxfcm93X2NvdW50XG4gICAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzXG4gICAgICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICAgICAgYW5kICggZHNrZXkgaXMgJ2RpY3Q6bWVhbmluZ3MnIClcbiAgICAgICAgICAgIGFuZCAoIGpmaWVsZHMgaXMgbm90IG51bGwgKSAtLSBOT1RFOiBuZWNlc3NhcnlcbiAgICAgICAgICAgIGFuZCAoIG5vdCBqZmllbGRzLT4+JyRbMF0nIHJlZ2V4cCAnXkBnbHlwaHMnICk7XCJcIlwiICkuZ2V0KClcbiAgICAgIHRvdGFsID0gdG90YWxfcm93X2NvdW50ICogMiAjIyMgTk9URSBlc3RpbWF0ZSAjIyNcbiAgICAgIGhlbHAgJ86panpyc2RiX18yNicsIHsgdG90YWxfcm93X2NvdW50LCB0b3RhbCwgfSAjIHsgdG90YWxfcm93X2NvdW50OiA0MDA4NiwgdG90YWw6IDgwMTcyIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIEBkYmEuc3RhdGVtZW50cy5wb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXMucnVuKClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcG9wdWxhdGVfc2hhcGVfZm9ybXVsYV9taXJyb3JfdHJpcGxlczogLT5cbiAgICBAZGJhLnN0YXRlbWVudHMucG9wdWxhdGVfanpyX21pcnJvcl90cmlwbGVzLnJ1bigpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHBvcHVsYXRlX2hhbmdldWxfc3lsbGFibGVzOiAtPlxuICAgIEBkYmEuc3RhdGVtZW50cy5wb3B1bGF0ZV9qenJfbGFuZ19oYW5nZXVsX3N5bGxhYmxlcy5ydW4oKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBfc2hvd19qenJfbWV0YV91Y19ub3JtYWxpemF0aW9uX2ZhdWx0czogLT5cbiAgIyAgIGZhdWx0eV9yb3dzID0gKCBAZGJhLnByZXBhcmUgU1FMXCJzZWxlY3QgKiBmcm9tIF9qenJfbWV0YV91Y19ub3JtYWxpemF0aW9uX2ZhdWx0cztcIiApLmFsbCgpXG4gICMgICB3YXJuICfOqWp6cnNkYl9fMjcnLCByZXZlcnNlIGZhdWx0eV9yb3dzXG4gICMgICAjIGZvciByb3cgZnJvbVxuICAjICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzaG93X2NvdW50czogLT5cbiAgICAjICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyBkbyA9PlxuICAgICMgICBxdWVyeSA9IFNRTFwic2VsZWN0IHYsIGNvdW50KCopIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgZ3JvdXAgYnkgdjtcIlxuICAgICMgICBlY2hvICggZ3JleSAnzqlqenJzZGJfXzI4JyApLCAoIGdvbGQgcmV2ZXJzZSBib2xkIHF1ZXJ5IClcbiAgICAjICAgY291bnRzID0gKCBAZGJhLnByZXBhcmUgcXVlcnkgKS5hbGwoKVxuICAgICMgICBjb25zb2xlLnRhYmxlIGNvdW50c1xuICAgICMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIGRvID0+XG4gICAgIyAgIHF1ZXJ5ID0gU1FMXCJzZWxlY3QgdiwgY291bnQoKikgZnJvbSBqenJfdHJpcGxlcyBncm91cCBieSB2O1wiXG4gICAgIyAgIGVjaG8gKCBncmV5ICfOqWp6cnNkYl9fMjknICksICggZ29sZCByZXZlcnNlIGJvbGQgcXVlcnkgKVxuICAgICMgICBjb3VudHMgPSAoIEBkYmEucHJlcGFyZSBxdWVyeSApLmFsbCgpXG4gICAgIyAgIGNvbnNvbGUudGFibGUgY291bnRzXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkbyA9PlxuICAgICAgcXVlcnkgPSBTUUxcIlwiXCJcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICBtdi52ICAgICAgICAgICAgYXMgdixcbiAgICAgICAgICAgIGNvdW50KCB0My52ICkgICBhcyBjb3VudFxuICAgICAgICAgIGZyb20gICAgICAgIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHQzXG4gICAgICAgICAgcmlnaHQgam9pbiAganpyX21pcnJvcl92ZXJicyAgICAgICAgYXMgbXYgdXNpbmcgKCB2IClcbiAgICAgICAgZ3JvdXAgYnkgdlxuICAgICAgICBvcmRlciBieSBjb3VudCBkZXNjLCB2O1wiXCJcIlxuICAgICAgZWNobyAoIGdyZXkgJ86panpyc2RiX18zMCcgKSwgKCBnb2xkIHJldmVyc2UgYm9sZCBxdWVyeSApXG4gICAgICBjb3VudHMgPSAoIEBkYmEucHJlcGFyZSBxdWVyeSApLmFsbCgpXG4gICAgICBjb25zb2xlLnRhYmxlIGNvdW50c1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZG8gPT5cbiAgICAgIHF1ZXJ5ID0gU1FMXCJcIlwiXG4gICAgICAgIHNlbGVjdFxuICAgICAgICAgICAgbXYudiAgICAgICAgICAgIGFzIHYsXG4gICAgICAgICAgICBjb3VudCggdDMudiApICAgYXMgY291bnRcbiAgICAgICAgICBmcm9tICAgICAgICBqenJfdHJpcGxlcyAgICAgICBhcyB0M1xuICAgICAgICAgIHJpZ2h0IGpvaW4gIGp6cl9taXJyb3JfdmVyYnMgIGFzIG12IHVzaW5nICggdiApXG4gICAgICAgIGdyb3VwIGJ5IHZcbiAgICAgICAgb3JkZXIgYnkgY291bnQgZGVzYywgdjtcIlwiXCJcbiAgICAgIGVjaG8gKCBncmV5ICfOqWp6cnNkYl9fMzEnICksICggZ29sZCByZXZlcnNlIGJvbGQgcXVlcnkgKVxuICAgICAgY291bnRzID0gKCBAZGJhLnByZXBhcmUgcXVlcnkgKS5hbGwoKVxuICAgICAgY29uc29sZS50YWJsZSBjb3VudHNcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRvID0+XG4gICAgICBxdWVyeSA9IFNRTFwiXCJcIlxuICAgICAgICBzZWxlY3QgZHNrZXksIGNvdW50KCopIGFzIGNvdW50IGZyb20ganpyX21pcnJvcl9saW5lcyBncm91cCBieSBkc2tleSB1bmlvbiBhbGxcbiAgICAgICAgc2VsZWN0ICcqJywgICBjb3VudCgqKSBhcyBjb3VudCBmcm9tIGp6cl9taXJyb3JfbGluZXNcbiAgICAgICAgb3JkZXIgYnkgY291bnQgZGVzYztcIlwiXCJcbiAgICAgIGVjaG8gKCBncmV5ICfOqWp6cnNkYl9fMzInICksICggZ29sZCByZXZlcnNlIGJvbGQgcXVlcnkgKVxuICAgICAgY291bnRzID0gKCBAZGJhLnByZXBhcmUgcXVlcnkgKS5hbGwoKVxuICAgICAgY291bnRzID0gT2JqZWN0LmZyb21FbnRyaWVzICggWyBkc2tleSwgeyBjb3VudCwgfSwgXSBmb3IgeyBkc2tleSwgY291bnQsIH0gaW4gY291bnRzIClcbiAgICAgIGNvbnNvbGUudGFibGUgY291bnRzXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2hvd19qenJfbWV0YV9mYXVsdHM6IC0+XG4gICAgaWYgKCBmYXVsdHlfcm93cyA9ICggQGRiYS5wcmVwYXJlIFNRTFwic2VsZWN0ICogZnJvbSBqenJfbWV0YV9mYXVsdHM7XCIgKS5hbGwoKSApLmxlbmd0aCA+IDBcbiAgICAgIGVjaG8gJ86panpyc2RiX18zMycsIHJlZCByZXZlcnNlIGJvbGQgXCIgZm91bmQgc29tZSBmYXVsdHM6IFwiXG4gICAgICBjb25zb2xlLnRhYmxlIGZhdWx0eV9yb3dzXG4gICAgZWxzZVxuICAgICAgZWNobyAnzqlqenJzZGJfXzM0JywgbGltZSByZXZlcnNlIGJvbGQgXCIgKG5vIGZhdWx0cykgXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDtudWxsXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyMjXG5cbm9vb29vb29vb28uICAgb29vb29vb29vb29vIG9vbyAgICAgICAgb29vb28gICAub29vb29vLlxuYDg4OCcgICBgWThiICBgODg4JyAgICAgYDggYDg4LiAgICAgICAuODg4JyAgZDhQJyAgYFk4YlxuIDg4OCAgICAgIDg4OCAgODg4ICAgICAgICAgIDg4OGIgICAgIGQnODg4ICA4ODggICAgICA4ODhcbiA4ODggICAgICA4ODggIDg4OG9vb284ICAgICA4IFk4OC4gLlAgIDg4OCAgODg4ICAgICAgODg4XG4gODg4ICAgICAgODg4ICA4ODggICAgXCIgICAgIDggIGA4ODgnICAgODg4ICA4ODggICAgICA4ODhcbiA4ODggICAgIGQ4OCcgIDg4OCAgICAgICBvICA4ICAgIFkgICAgIDg4OCAgYDg4YiAgICBkODgnXG5vODg4Ym9vZDhQJyAgIG84ODhvb29vb29kOCBvOG8gICAgICAgIG84ODhvICBgWThib29kOFAnXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5kZW1vID0gLT5cbiAganpyID0gbmV3IEppenVyYSgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyBqenIuX3Nob3dfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMoKVxuICBqenIuc2hvd19jb3VudHMoKVxuICBqenIuc2hvd19qenJfbWV0YV9mYXVsdHMoKVxuICAjIGM6cmVhZGluZzpqYS14LUhpclxuICAjIGM6cmVhZGluZzpqYS14LUthdFxuICBpZiBmYWxzZVxuICAgIHNlZW4gPSBuZXcgU2V0KClcbiAgICBmb3IgeyByZWFkaW5nLCB9IGZyb20ganpyLmRiYS53YWxrIFNRTFwic2VsZWN0IGRpc3RpbmN0KCBvICkgYXMgcmVhZGluZyBmcm9tIGp6cl90cmlwbGVzIHdoZXJlIHYgPSAnYzpyZWFkaW5nOmphLXgtS2F0JyBvcmRlciBieSBvO1wiXG4gICAgICBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLygu44O8fC7jg6N8LuODpXwu44OnfOODgy58LikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICAgICAgIGNvbnRpbnVlIGlmIHNlZW4uaGFzIHBhcnRcbiAgICAgICAgc2Vlbi5hZGQgcGFydFxuICAgICAgICBlY2hvIHBhcnRcbiAgICBmb3IgeyByZWFkaW5nLCB9IGZyb20ganpyLmRiYS53YWxrIFNRTFwic2VsZWN0IGRpc3RpbmN0KCBvICkgYXMgcmVhZGluZyBmcm9tIGp6cl90cmlwbGVzIHdoZXJlIHYgPSAnYzpyZWFkaW5nOmphLXgtSGlyJyBvcmRlciBieSBvO1wiXG4gICAgICBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLygu44O8fC7jgoN8LuOChXwu44KHfOOBoy58LikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICAgICAjIGZvciBwYXJ0IGluICggcmVhZGluZy5zcGxpdCAvKC4pL3YgKSB3aGVuIHBhcnQgaXNudCAnJ1xuICAgICAgICBjb250aW51ZSBpZiBzZWVuLmhhcyBwYXJ0XG4gICAgICAgIHNlZW4uYWRkIHBhcnRcbiAgICAgICAgZWNobyBwYXJ0XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgO251bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5kZW1vX3JlYWRfZHVtcCA9IC0+XG4gIHsgQmVuY2htYXJrZXIsICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9iZW5jaG1hcmtpbmcoKVxuICAjIHsgbmFtZWl0LCAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9uYW1laXQoKVxuICBiZW5jaG1hcmtlciA9IG5ldyBCZW5jaG1hcmtlcigpXG4gIHRpbWVpdCA9ICggUC4uLiApIC0+IGJlbmNobWFya2VyLnRpbWVpdCBQLi4uXG4gIHsgVW5kdW1wZXIsICAgICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9zcWxpdGVfdW5kdW1wZXIoKVxuICB7IHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMsICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcbiAgeyB3YywgICAgICAgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX3djKClcbiAgcGF0aCAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEgucmVzb2x2ZSBfX2Rpcm5hbWUsICcuLi9qenIuZHVtcC5zcWwnXG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICBqenIuZGJhLnRlYXJkb3duIHsgdGVzdDogJyonLCB9XG4gIGRlYnVnICfOqWp6cnNkYl9fMzUnLCBVbmR1bXBlci51bmR1bXAgeyBkYjoganpyLmRiYSwgcGF0aCwgbW9kZTogJ2Zhc3QnLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAganpyLnNob3dfY291bnRzKClcbiAganpyLnNob3dfanpyX21ldGFfZmF1bHRzKClcbiAgO251bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmlmIG1vZHVsZSBpcyByZXF1aXJlLm1haW4gdGhlbiBkbyA9PlxuICBkZW1vKClcbiAgIyBkZW1vX3JlYWRfZHVtcCgpXG4gIDtudWxsXG4iXX0=
