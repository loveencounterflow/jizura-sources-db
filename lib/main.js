(function() {
  'use strict';
  var Async_jetstream, Benchmarker, Bsql3, Datasource_field_parser, Dbric, Dbric_std, FS, GUY, IDL, IDLX, Jetstream, Jizura, Jzr_db_adapter, Language_services, PATH, SFMODULES, SQL, alert, as_bool, benchmarker, blue, bold, datasource_format_parser, debug, demo, demo_read_dump, demo_show_all_tables, demo_source_identifiers, echo, freeze, from_bool, get_paths_and_formats, gold, green, grey, help, info, inspect, lets, lime, log, plain, praise, red, reverse, rpr, set_getter, timeit, type_of, urge, walk_lines_with_positions, warn, whisper, white;

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
  // 'ds:dict:meanings.1:L=13332'
  // 'ds:dict:ucd140.1:uhdidx:L=1234'
  // rowids: 't:jfm:R=1'
  // {
  //   'ds:dict:meanings':          '$jzrds/meaning/meanings.txt'
  //   'ds:dict:ucd:v14.0:uhdidx' : '$jzrds/unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt'
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
  get_paths_and_formats = function() {
    var R, formats, kanjium, paths, rutopio;
    paths = {};
    formats = {};
    R = {paths, formats};
    paths.base = PATH.resolve(__dirname, '..');
    paths.jzr = PATH.resolve(paths.base, '..');
    paths.db = PATH.join(paths.base, 'jzr.db');
    // paths.db                            = '/dev/shm/jzr.db'
    // paths.jzrds                         = PATH.join paths.base, 'jzrds'
    paths.jzrnds = PATH.join(paths.base, 'jizura-new-datasources');
    paths.mojikura = PATH.join(paths.jzrnds, 'mojikura');
    paths.raw_github = PATH.join(paths.jzrnds, 'bvfs/origin/https/raw.githubusercontent.com');
    kanjium = PATH.join(paths.raw_github, 'mifunetoshiro/kanjium/8a0cdaa16d64a281a2048de2eee2ec5e3a440fa6');
    rutopio = PATH.join(paths.raw_github, 'rutopio/Korean-Name-Hanja-Charset/12df1ba1b4dfaa095813e4ddfba424e816f94c53');
    //.........................................................................................................
    // paths[ 'ds:dict:ucd:v14.0:uhdidx'      ]   = PATH.join paths.jzrnds, 'unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt'
    paths['ds:dict:x:ko-Hang+Latn'] = PATH.join(paths.jzrnds, 'hangeul-transcriptions.tsv');
    paths['ds:dict:x:ja-Kan+Latn'] = PATH.join(paths.jzrnds, 'kana-transcriptions.tsv');
    paths['ds:dict:bcp47'] = PATH.join(paths.jzrnds, 'BCP47-language-scripts-regions.tsv');
    paths['ds:dict:ja:kanjium'] = PATH.join(kanjium, 'data/source_files/kanjidict.txt');
    paths['ds:dict:ja:kanjium:aux'] = PATH.join(kanjium, 'data/source_files/0_README.txt');
    paths['ds:dict:ko:V=data-gov.csv'] = PATH.join(rutopio, 'data-gov.csv');
    paths['ds:dict:ko:V=data-gov.json'] = PATH.join(rutopio, 'data-gov.json');
    paths['ds:dict:ko:V=data-naver.csv'] = PATH.join(rutopio, 'data-naver.csv');
    paths['ds:dict:ko:V=data-naver.json'] = PATH.join(rutopio, 'data-naver.json');
    paths['ds:dict:ko:V=README.md'] = PATH.join(rutopio, 'README.md');
    paths['ds:dict:meanings'] = PATH.join(paths.mojikura, 'meaning/meanings.txt');
    paths['ds:shape:idsv2'] = PATH.join(paths.mojikura, 'shape/shape-breakdown-formula-v2.txt');
    paths['ds:shape:zhz5bf'] = PATH.join(paths.mojikura, 'shape/shape-strokeorder-zhaziwubifa.txt');
    paths['ds:ucdb:rsgs'] = PATH.join(paths.mojikura, 'ucdb/cfg/rsgs-and-blocks.md');
    //.........................................................................................................
    // formats[ 'ds:dict:ucd:v14.0:uhdidx'      ]   = , 'unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt'
    formats['ds:dict:x:ko-Hang+Latn'] = 'dsf:tsv';
    formats['ds:dict:x:ja-Kan+Latn'] = 'dsf:tsv';
    formats['ds:dict:bcp47'] = 'dsf:tsv';
    formats['ds:dict:ja:kanjium'] = 'dsf:txt';
    formats['ds:dict:ja:kanjium:aux'] = 'dsf:txt';
    formats['ds:dict:ko:V=data-gov.csv'] = 'dsf:csv';
    formats['ds:dict:ko:V=data-gov.json'] = 'dsf:json';
    formats['ds:dict:ko:V=data-naver.csv'] = 'dsf:csv';
    formats['ds:dict:ko:V=data-naver.json'] = 'dsf:json';
    formats['ds:dict:ko:V=README.md'] = 'dsf:md';
    formats['ds:dict:meanings'] = 'dsf:tsv';
    formats['ds:shape:idsv2'] = 'dsf:tsv';
    formats['ds:shape:zhz5bf'] = 'dsf:tsv';
    formats['ds:ucdb:rsgs'] = 'dsf:md:table';
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
          this._on_open_populate_jzr_datasource_formats();
          this._on_open_populate_jzr_datasources();
          this._on_open_populate_jzr_mirror_verbs();
          this._on_open_populate_jzr_mirror_lcodes();
          this._on_open_populate_jzr_mirror_lines();
          this._on_open_populate_jzr_glyphrange();
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
        debug('Ωjzrsdb__28', '_on_open_populate_jzr_mirror_lcodes');
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
        this.statements.insert_jzr_mirror_lcode.run({
          rowid: 't:mr:lc:V=E',
          lcode: 'E',
          comment: 'error'
        });
        this.statements.insert_jzr_mirror_lcode.run({
          rowid: 't:mr:lc:V=U',
          lcode: 'U',
          comment: 'unknown'
        });
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_mirror_verbs() {
        var i, len, row, rows;
        /* NOTE
           in verbs, initial component indicates type of subject:
             `v:c:` is for subjects that are CJK characters
             `v:x:` is used for unclassified subjects (possibly to be refined in the future)
           */
        debug('Ωjzrsdb__29', '_on_open_populate_jzr_mirror_verbs');
        rows = [
          {
            rank: 2,
            s: "NN",
            v: 'v:testing:unused',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:x:ko-Hang+Latn:initial',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:x:ko-Hang+Latn:medial',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:x:ko-Hang+Latn:final',
            o: "NN"
          },
          {
            rank: 1,
            s: "NN",
            v: 'v:c:reading:zh-Latn-pinyin',
            o: "NN"
          },
          {
            rank: 1,
            s: "NN",
            v: 'v:c:reading:ja-x-Kan',
            o: "NN"
          },
          {
            rank: 1,
            s: "NN",
            v: 'v:c:reading:ja-x-Hir',
            o: "NN"
          },
          {
            rank: 1,
            s: "NN",
            v: 'v:c:reading:ja-x-Kat',
            o: "NN"
          },
          {
            rank: 1,
            s: "NN",
            v: 'v:c:reading:ja-x-Latn',
            o: "NN"
          },
          {
            rank: 1,
            s: "NN",
            v: 'v:c:reading:ja-x-Hir+Latn',
            o: "NN"
          },
          {
            rank: 1,
            s: "NN",
            v: 'v:c:reading:ja-x-Kat+Latn',
            o: "NN"
          },
          {
            rank: 1,
            s: "NN",
            v: 'v:c:reading:ko-Hang',
            o: "NN"
          },
          {
            rank: 1,
            s: "NN",
            v: 'v:c:reading:ko-Latn',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:reading:ko-Hang:initial',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:reading:ko-Hang:medial',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:reading:ko-Hang:final',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:reading:ko-Latn:initial',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:reading:ko-Latn:medial',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:reading:ko-Latn:final',
            o: "NN"
          },
          {
            rank: 1,
            s: "NN",
            v: 'v:c:shape:ids:formula:shortest',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:shape:ids:formula:shortest:ast',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:shape:ids:formula:shortest:error',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:shape:ids:has-operator',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:shape:ids:has-component',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:shape:ids:components',
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
      _on_open_populate_jzr_datasource_formats() {
        debug('Ωjzrsdb__30', '_on_open_populate_jzr_datasource_formats');
        this.statements.insert_jzr_datasource_format.run({
          format: 'dsf:tsv',
          comment: 'NN'
        });
        this.statements.insert_jzr_datasource_format.run({
          format: 'dsf:md:table',
          comment: 'NN'
        });
        this.statements.insert_jzr_datasource_format.run({
          format: 'dsf:csv',
          comment: 'NN'
        });
        this.statements.insert_jzr_datasource_format.run({
          format: 'dsf:json',
          comment: 'NN'
        });
        this.statements.insert_jzr_datasource_format.run({
          format: 'dsf:md',
          comment: 'NN'
        });
        this.statements.insert_jzr_datasource_format.run({
          format: 'dsf:txt',
          comment: 'NN'
        });
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_datasources() {
        var dskey, formats, paths;
        debug('Ωjzrsdb__31', '_on_open_populate_jzr_datasources');
        ({paths, formats} = get_paths_and_formats());
        // dskey = 'ds:dict:ucd:v14.0:uhdidx';  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=2', dskey, format: formats[ dskey ], path: paths[ dskey ], }
        dskey = 'ds:dict:meanings';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=1',
          dskey,
          format: formats[dskey],
          path: paths[dskey]
        });
        dskey = 'ds:dict:x:ko-Hang+Latn';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=2',
          dskey,
          format: formats[dskey],
          path: paths[dskey]
        });
        dskey = 'ds:dict:x:ja-Kan+Latn';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=3',
          dskey,
          format: formats[dskey],
          path: paths[dskey]
        });
        // dskey = 'ds:dict:ja:kanjium';            @statements.insert_jzr_datasource.run { rowid: 't:ds:R=4', dskey, format: formats[ dskey ], path: paths[ dskey ], }
        // dskey = 'ds:dict:ja:kanjium:aux';        @statements.insert_jzr_datasource.run { rowid: 't:ds:R=5', dskey, format: formats[ dskey ], path: paths[ dskey ], }
        // dskey = 'ds:dict:ko:V=data-gov.csv';     @statements.insert_jzr_datasource.run { rowid: 't:ds:R=6', dskey, format: formats[ dskey ], path: paths[ dskey ], }
        // dskey = 'ds:dict:ko:V=data-gov.json';    @statements.insert_jzr_datasource.run { rowid: 't:ds:R=7', dskey, format: formats[ dskey ], path: paths[ dskey ], }
        // dskey = 'ds:dict:ko:V=data-naver.csv';   @statements.insert_jzr_datasource.run { rowid: 't:ds:R=8', dskey, format: formats[ dskey ], path: paths[ dskey ], }
        // dskey = 'ds:dict:ko:V=data-naver.json';  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=9', dskey, format: formats[ dskey ], path: paths[ dskey ], }
        // dskey = 'ds:dict:ko:V=README.md';        @statements.insert_jzr_datasource.run { rowid: 't:ds:R=10', dskey, format: formats[ dskey ], path: paths[ dskey ], }
        dskey = 'ds:shape:idsv2';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=11',
          dskey,
          format: formats[dskey],
          path: paths[dskey]
        });
        dskey = 'ds:shape:zhz5bf';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=12',
          dskey,
          format: formats[dskey],
          path: paths[dskey]
        });
        dskey = 'ds:ucdb:rsgs';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=13',
          dskey,
          format: formats[dskey],
          path: paths[dskey]
        });
        return null;
      }

      // #---------------------------------------------------------------------------------------------------------
      // _on_open_populate_verbs: ->
      //   paths = get_paths_and_formats()
      //   dskey = 'ds:dict:meanings';          @statements.insert_jzr_datasource.run { rowid: 't:ds:R=1', dskey, path: paths[ dskey ], }
      //   dskey = 'ds:dict:ucd:v14.0:uhdidx';  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=2', dskey, path: paths[ dskey ], }
      //   ;null

        //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_mirror_lines() {
        debug('Ωjzrsdb__32', '_on_open_populate_jzr_mirror_lines');
        this.statements.populate_jzr_mirror_lines.run();
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_glyphrange() {
        debug('Ωjzrsdb__33', '_on_open_populate_jzr_glyphrange');
        this.statements.populate_jzr_glyphrange.run();
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      trigger_on_before_insert(name, ...fields) {
        // debug 'Ωjzrsdb__34', { name, fields, }
        this.state.most_recent_inserted_row = {name, fields};
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      * triples_from_dict_x_ko_Hang_Latn(rowid_in, dskey, [role, s, o]) {
        var base, ref, v;
        ref = rowid_in;
        v = `v:x:ko-Hang+Latn:${role}`;
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
        v = 'v:c:reading:zh-Latn-pinyin';
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
          v_x_Kan = 'v:c:reading:ja-x-Kat';
          v_Latn = 'v:c:reading:ja-x-Kat+Latn';
        } else {
          v_x_Kan = 'v:c:reading:ja-x-Hir';
          v_Latn = 'v:c:reading:ja-x-Hir+Latn';
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
        v = 'v:c:reading:ko-Hang';
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
        var base, component, components, components_json, error, formula_ast, formula_json, i, j, len, len1, o, operator, operators, ref, seen_components, seen_operators;
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
          v: 'v:c:shape:ids:formula:shortest',
          o: formula
        });
        //.......................................................................................................
        error = null;
        try {
          formula_ast = this.host.language_services.parse_idlx(formula);
        } catch (error1) {
          error = error1;
          o = JSON.stringify({
            ref: 'Ωjzrsdb__35',
            message: error.message,
            row: {rowid_in, dskey, s, formula}
          });
          warn(`error: ${o}`);
          yield ({
            rowid_out: this.next_triple_rowid,
            ref,
            s,
            v: 'v:c:shape:ids:formula:shortest:error',
            o
          });
        }
        if (error != null) {
          return null;
        }
        //.......................................................................................................
        formula_json = JSON.stringify(formula_ast);
        yield ({
          rowid_out: this.next_triple_rowid,
          ref,
          s,
          v: 'v:c:shape:ids:formula:shortest:ast',
          o: formula_json
        });
        //.......................................................................................................
        ({operators, components} = this.host.language_services.operators_and_components_from_idlx(formula_ast));
        seen_operators = new Set();
        seen_components = new Set();
        //.......................................................................................................
        components_json = JSON.stringify(components);
        yield ({
          rowid_out: this.next_triple_rowid,
          ref,
          s,
          v: 'v:c:shape:ids:components',
          o: components_json
        });
//.......................................................................................................
        for (i = 0, len = operators.length; i < len; i++) {
          operator = operators[i];
          if (seen_operators.has(operator)) {
            continue;
          }
          seen_operators.add(operator);
          yield ({
            rowid_out: this.next_triple_rowid,
            ref,
            s,
            v: 'v:c:shape:ids:has-operator',
            o: operator
          });
        }
//.......................................................................................................
        for (j = 0, len1 = components.length; j < len1; j++) {
          component = components[j];
          if (seen_components.has(component)) {
            continue;
          }
          seen_components.add(component);
          yield ({
            rowid_out: this.next_triple_rowid,
            ref,
            s,
            v: 'v:c:shape:ids:has-component',
            o: component
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
      SQL`create table jzr_urns (
  urn     text      unique  not null,
  comment text              not null,
primary key ( urn ),
constraint "Ωconstraint___6" check ( urn regexp '^[\\-\\+\\.:a-zA-Z0-9]+$' ) )
;`,
      //.......................................................................................................
      SQL`create table jzr_glyphranges (
  rowid     text    unique  not null generated always as ( 't:uc:rsg:V=' || rsg ),
  rsg       text    unique  not null,
  is_cjk    boolean         not null,
  lo        integer         not null,
  hi        integer         not null,
  -- lo_glyph  text            not null generated always as ( char( lo ) ) stored,
  -- hi_glyph  text            not null generated always as ( char( hi ) ) stored,
  name      text            not null,
-- primary key ( rowid ),
constraint "Ωconstraint___7" check ( lo between 0x000000 and 0x10ffff ),
constraint "Ωconstraint___8" check ( hi between 0x000000 and 0x10ffff ),
constraint "Ωconstraint___9" check ( lo <= hi ),
constraint "Ωconstraint__10" check ( rowid regexp '^.*$' )
);`,
      //.......................................................................................................
      SQL`create view jzr_cjk_glyphranges as select
  *
from jzr_glyphranges
where is_cjk
order by lo;`,
      //.......................................................................................................
      SQL`create table jzr_glyphsets (
  rowid       text    unique  not null,
  name        text            not null,
  glyphrange  text            not null,
primary key ( rowid ),
constraint "Ωconstraint__11" foreign key ( glyphrange ) references jzr_glyphranges ( rowid ),
constraint "Ωconstraint__12" check ( rowid regexp '^.*$' )
);`,
      //.......................................................................................................
      SQL`create table jzr_datasource_formats (
  format    text    unique  not null,
  comment   text            not null,
primary key ( format ),
check ( format regexp '^dsf:[\\-\\+\\.:a-zA-Z0-9]+$' )
);`,
      //.......................................................................................................
      SQL`create trigger jzr_datasource_formats_insert
before insert on jzr_datasource_formats
for each row begin
  select trigger_on_before_insert( 'jzr_datasource_formats',
    'format:', new.format, 'comment:', new.comment );
  insert into jzr_urns ( urn, comment ) values ( new.format, new.comment );
  end;`,
      //.......................................................................................................
      SQL`create table jzr_datasources (
  dskey     text    unique  not null,
  format    text            not null,
  path      text            not null,
primary key ( dskey ),
constraint "Ωconstraint__13" foreign key ( format ) references jzr_datasource_formats ( format )
);`,
      //.......................................................................................................
      SQL`create trigger jzr_datasources_insert
before insert on jzr_datasources
for each row begin
  select trigger_on_before_insert( 'jzr_datasources',
    'dskey:', new.dskey, 'format:', new.format, 'path:', new.path );
  insert into jzr_urns ( urn, comment ) values ( new.dskey, 'format: ' || new.format || ', path: ' || new.path );
  end;`,
      //.......................................................................................................
      SQL`create table jzr_mirror_lcodes (
  rowid     text    unique  not null,
  lcode     text    unique  not null,
  comment   text            not null,
primary key ( rowid ),
constraint "Ωconstraint__14" check ( lcode regexp '^[a-zA-Z]+[a-zA-Z0-9]*$' ),
constraint "Ωconstraint__15" check ( rowid = 't:mr:lc:V=' || lcode ) );`,
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
constraint "Ωconstraint__16" foreign key ( lcode ) references jzr_mirror_lcodes ( lcode ) );`,
      //.......................................................................................................
      SQL`create table jzr_mirror_verbs (
  rank      integer         not null default 1,
  s         text            not null,
  v         text    unique  not null,
  o         text            not null,
primary key ( v ),
-- check ( rowid regexp '^t:mr:vb:V=[\\-:\\+\\p{L}]+$' ),
constraint "Ωconstraint__17" check ( rank > 0 ) );`,
      //.......................................................................................................
      SQL`create trigger jzr_mirror_verbs_insert
before insert on jzr_mirror_verbs
for each row begin
  select trigger_on_before_insert( 'jzr_mirror_verbs',
    'rank:', new.rank, 's:', new.s, 'v:', new.v, 'o:', new.o );
  insert into jzr_urns ( urn, comment ) values ( new.v, 's: ' || new.s || ', o: ' || new.o );
  end;`,
      //.......................................................................................................
      SQL`create table jzr_mirror_triples_base (
  rowid     text    unique  not null,
  ref       text            not null,
  s         text            not null,
  v         text            not null,
  o         json            not null,
primary key ( rowid ),
constraint "Ωconstraint__18" check ( rowid regexp '^t:mr:3pl:R=\\d+$' ),
-- unique ( ref, s, v, o )
constraint "Ωconstraint__19" foreign key ( ref ) references jzr_mirror_lines ( rowid ),
constraint "Ωconstraint__20" foreign key ( v   ) references jzr_mirror_verbs ( v )
);`,
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
constraint "Ωconstraint__21" check ( rowid regexp '^t:lang:hang:syl:V=\\S+$' )
-- unique ( ref, s, v, o )
-- constraint "Ωconstraint__22" foreign key ( ref ) references jzr_mirror_lines ( rowid )
-- constraint "Ωconstraint__23" foreign key ( syllable_hang ) references jzr_mirror_triples_base ( o ) )
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
select rowid, ref, syllable_hang, 'v:c:reading:ko-Latn',          syllable_latn   from jzr_lang_hang_syllables union all
select rowid, ref, syllable_hang, 'v:c:reading:ko-Latn:initial',  initial_latn    from jzr_lang_hang_syllables union all
select rowid, ref, syllable_hang, 'v:c:reading:ko-Latn:medial',   medial_latn     from jzr_lang_hang_syllables union all
select rowid, ref, syllable_hang, 'v:c:reading:ko-Latn:final',    final_latn      from jzr_lang_hang_syllables union all
select rowid, ref, syllable_hang, 'v:c:reading:ko-Hang:initial',  initial_hang    from jzr_lang_hang_syllables union all
select rowid, ref, syllable_hang, 'v:c:reading:ko-Hang:medial',   medial_hang     from jzr_lang_hang_syllables union all
select rowid, ref, syllable_hang, 'v:c:reading:ko-Hang:final',    final_hang      from jzr_lang_hang_syllables union all
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
where vb1.v like 'v:c:%'
-- ...................................................................................................
union all
select tb2.rowid, tb2.ref, vb2.rank, tb2.s, kr.v, kr.o from jzr_mirror_triples_base as tb2
join jzr_lang_kr_readings_triples as kr on ( tb2.v = 'v:c:reading:ko-Hang' and tb2.o = kr.s )
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
      // #=======================================================================================================
      // SQL"""create table jzr_formulas (
      //     rowid     text    unique  not null,
      //     ref       text            not null,
      //     glyph     text            not null,
      //     formula   text            not null,

      //   );"""

      //.......................................................................................................
      SQL`create table jzr_components (
  rowid     text    unique  not null,
  ref       text            not null,
  level     integer         not null,
  lnr       integer         not null,
  rnr       integer         not null,
  glyph     text            not null,
  component text            not null,
primary key ( rowid ),
constraint "Ωconstraint__24" foreign key ( ref ) references jzr_mirror_triples_base ( rowid ),
constraint "Ωconstraint__25" check ( ( length( glyph     ) = 1 ) or ( glyph      regexp '^&[\\-a-z0-9_]+#[0-9a-f]{4,6};$' ) ),
constraint "Ωconstraint__26" check ( ( length( component ) = 1 ) or ( component  regexp '^&[\\-a-z0-9_]+#[0-9a-f]{4,6};$' ) ),
constraint "Ωconstraint__27" check ( rowid regexp '^.*$' )
);`,
      //=======================================================================================================
      /*

            .o  .o88o.                       oooo      .            o.
           .8'  888 `"                       `888    .o8            `8.
          .8'  o888oo   .oooo.   oooo  oooo   888  .o888oo  .oooo.o  `8.
          88    888    `P  )88b  `888  `888   888    888   d88(  "8   88
          88    888     .oP"888   888   888   888    888   `"Y88b.    88
          `8.   888    d8(  888   888   888   888    888 . o.  )88b  .8'
           `8. o888o   `Y888""8o  `V88V"V8P' o888o   "888" 8""888P' .8'
            `"                                                      "'

      */
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
      SQL`create view _jzr_meta_mirror_lines_with_errors as select distinct
  1                                            as count,
  't:mr:ln:jfields:ws:R=*'                     as rowid,
  ml.rowid                                     as ref,
  'error'                                      as description,
  ml.line                                      as quote
from jzr_mirror_lines as ml
where ( ml.lcode = 'E' );`,
      //.......................................................................................................
      SQL`create view jzr_meta_faults as
select null as count, null as rowid, null as ref, null as description, null  as quote where false union all
-- ...................................................................................................
select 1, rowid, ref,  'uc-normalization', line  as quote from _jzr_meta_uc_normalization_faults          union all
select *                                                  from _jzr_meta_kr_readings_unknown_verb_faults  union all
select *                                                  from _jzr_meta_error_verb_faults                union all
select *                                                  from _jzr_meta_mirror_lines_whitespace_faults   union all
select *                                                  from _jzr_meta_mirror_lines_with_errors         union all
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
      insert_jzr_glyphrange: SQL`insert into jzr_glyphranges ( rsg, is_cjk, lo, hi, name ) values ( $rsg, $is_cjk, $lo, $hi, $name )
  -- on conflict ( dskey ) do update set path = excluded.path
  ;`,
      //.......................................................................................................
      insert_jzr_datasource_format: SQL`insert into jzr_datasource_formats ( format, comment ) values ( $format, $comment )
  -- on conflict ( dskey ) do update set path = excluded.path
  ;`,
      //.......................................................................................................
      insert_jzr_datasource: SQL`insert into jzr_datasources ( dskey, format, path ) values ( $dskey, $format, $path )
  -- on conflict ( dskey ) do update set path = excluded.path
  ;`,
      //.......................................................................................................
      insert_jzr_mirror_verb: SQL`insert into jzr_mirror_verbs ( rank, s, v, o ) values ( $rank, $s, $v, $o )
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
from jzr_datasources                                  as ds
join jzr_datasource_formats                           as df using ( format )
join walk_file_lines( ds.dskey, df.format, ds.path )  as fl
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
      -- and ( ml.dskey = 'ds:dict:meanings' )
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
    left join jzr_mirror_triples_base as mti on ( mti.s = dh.initial and mti.v = 'v:x:ko-Hang+Latn:initial' )
    left join jzr_mirror_triples_base as mtm on ( mtm.s = dh.medial  and mtm.v = 'v:x:ko-Hang+Latn:medial'  )
    left join jzr_mirror_triples_base as mtf on ( mtf.s = dh.final   and mtf.v = 'v:x:ko-Hang+Latn:final'   )
    where true
      and ( mt.v = 'v:c:reading:ko-Hang' )
    order by mt.o
  -- on conflict ( rowid         ) do nothing
  /* ### NOTE \`on conflict\` needed because we log all actually occurring readings of all characters */
  on conflict ( syllable_hang ) do nothing
  ;`,
      //.......................................................................................................
      populate_jzr_glyphrange: SQL`insert into jzr_glyphranges ( rsg, is_cjk, lo, hi, name )
select
  -- 't:mr:ln:R=' || row_number() over ()          as rowid,
  -- ds.dskey || ':L=' || fl.line_nr   as rowid,
  gr.rsg                            as rsg,
  gr.is_cjk                         as is_cjk,
  -- ref
  gr.lo                             as lo,
  gr.hi                             as hi,
  gr.name                           as name
from jzr_mirror_lines                                               as ml
join parse_ucdb_rsgs_glyphrange( ml.dskey, ml.line_nr, ml.jfields ) as gr
where true
  and ( ml.dskey = 'ds:ucdb:rsgs' )
  and ( ml.lcode = 'D' )
order by ml.line_nr
-- on conflict ( dskey, line_nr ) do update set line = excluded.line
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
          if ((type_of(jfields)) !== 'list') {
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
      walk_file_lines: {
        columns: ['line_nr', 'lcode', 'line', 'jfields'],
        parameters: ['dskey', 'format', 'path'],
        rows: function*(dskey, format, path) {
          yield* new Datasource_field_parser({
            host: this.host,
            dskey,
            format,
            path
          });
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
            case 'ds:dict:x:ko-Hang+Latn':
              yield* this.triples_from_dict_x_ko_Hang_Latn(rowid_in, dskey, fields);
              break;
            case 'ds:dict:meanings':
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
            case 'ds:shape:idsv2':
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
      },
      //-------------------------------------------------------------------------------------------------------
      parse_ucdb_rsgs_glyphrange: {
        parameters: ['dskey', 'line_nr', 'jfields'],
        columns: ['rsg', 'is_cjk', 'lo', 'hi', 'name'],
        rows: function*(dskey, line_nr, jfields) {
          yield datasource_format_parser.parse_ucdb_rsgs_glyphrange({dskey, line_nr, jfields});
          return null;
        }
      }
    };

    return Jzr_db_adapter;

  }).call(this);

  //===========================================================================================================
  /*

        .o8            .o88o.
       "888            888 `"
   .oooo888   .oooo.o o888oo     oo.ooooo.   .oooo.   oooo d8b  .oooo.o  .ooooo.  oooo d8b
  d88' `888  d88(  "8  888        888' `88b `P  )88b  `888""8P d88(  "8 d88' `88b `888""8P
  888   888  `"Y88b.   888        888   888  .oP"888   888     `"Y88b.  888ooo888  888
  888   888  o.  )88b  888        888   888 d8(  888   888     o.  )88b 888    .o  888
  `Y8bod88P" 8""888P' o888o       888bod8P' `Y888""8o d888b    8""888P' `Y8bod8P' d888b
   888
  o888o
                                                                            */
  //===========================================================================================================
  Datasource_field_parser = class Datasource_field_parser {
    //---------------------------------------------------------------------------------------------------------
    constructor({host, dskey, format, path}) {
      this.host = host;
      this.dskey = dskey;
      this.format = format;
      this.path = path;
      void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    * [Symbol.iterator]() {
      return (yield* this.walk());
    }

    //---------------------------------------------------------------------------------------------------------
    * walk() {
      var method, method_name, ref1;
      debug('Ωjzrsdb__36', "walk_file_lines:", {
        format: this.format,
        dskey: this.dskey
      });
      //.......................................................................................................
      method_name = 'walk_' + this.format.replace(/[^a-z]/gv, '_');
      method = (ref1 = this[method_name]) != null ? ref1 : this._walk_no_such_parser;
      yield* method.call(this);
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    * _walk_no_such_parser() {
      var eol, line, line_nr, message, y;
      message = `Ωjzrsdb__37 no parser found for format ${rpr(this.format)}`;
      warn(message);
      yield ({
        line_nr: 0,
        lcode: 'E',
        line: message,
        jfields: null
      });
      for (y of walk_lines_with_positions(this.path)) {
        ({
          lnr: line_nr,
          line,
          eol
        } = y);
        yield ({
          line_nr,
          lcode: 'U',
          line,
          jfields: null
        });
      }
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    * walk_dsf_tsv() {
      var eol, jfields, lcode, line, line_nr, y;
      for (y of walk_lines_with_positions(this.path)) {
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

    //---------------------------------------------------------------------------------------------------------
    * walk_dsf_md_table() {
      var eol, field, jfields, lcode, line, line_nr, y;
      for (y of walk_lines_with_positions(this.path)) {
        ({
          lnr: line_nr,
          line,
          eol
        } = y);
        line = this.host.language_services.normalize_text(line);
        jfields = null;
        lcode = 'U';
        switch (true) {
          case /^\s*$/v.test(line):
            lcode = 'B';
            break;
          case !line.startsWith('|'):
            null; // not an MD table
            break;
          case line.startsWith('|-'):
            null; // MD table header separator
            break;
          case /^\|\s+\*/v.test(line):
            null; // MD table header
            break;
          default:
            lcode = 'D';
            jfields = line.split('|');
            jfields.shift();
            jfields.pop();
            jfields = (function() {
              var i, len, results;
              results = [];
              for (i = 0, len = jfields.length; i < len; i++) {
                field = jfields[i];
                results.push(field.trim());
              }
              return results;
            })();
            jfields = (function() {
              var i, len, results;
              results = [];
              for (i = 0, len = jfields.length; i < len; i++) {
                field = jfields[i];
                results.push(field.replace(/^`(.+)`$/gv, '$1'));
              }
              return results;
            })();
            jfields = JSON.stringify(jfields);
        }
        // debug 'Ωjzrsdb__38', jfields
        yield ({line_nr, lcode, line, jfields});
      }
      return null;
    }

  };

  // #---------------------------------------------------------------------------------------------------------
  // walk_csv: ->
  //   yield return null

    // #---------------------------------------------------------------------------------------------------------
  // walk_json: ->
  //   yield return null

    // #---------------------------------------------------------------------------------------------------------
  // walk_md: ->
  //   yield return null

    // #---------------------------------------------------------------------------------------------------------
  // walk_txt: ->
  //   yield return null

    //===========================================================================================================
  datasource_format_parser = class datasource_format_parser {
    //---------------------------------------------------------------------------------------------------------
    static parse_ucdb_rsgs_glyphrange({jfields}) {
      var hi, iclabel, is_cjk, is_cjk_txt, lo, lo_hi_re, lo_hi_txt, match, name, rsg;
      [iclabel, rsg, is_cjk_txt, lo_hi_txt, name] = JSON.parse(jfields);
      lo_hi_re = /^0x(?<lo>[0-9a-f]{1,6})\s*\.\.\s*0x(?<hi>[0-9a-f]{1,6})$/iv;
      //.......................................................................................................
      is_cjk = (function() {
        switch (is_cjk_txt) {
          case 'true':
            return 1;
          case 'false':
            return 0;
          default:
            throw new Error(`Ωjzrsdb__39 expected 'true' or 'false', got ${rpr(is_cjk_txt)}`);
        }
      })();
      //.......................................................................................................
      if ((match = lo_hi_txt.match(lo_hi_re)) == null) {
        throw new Error(`Ωjzrsdb__40 expected a range literal like '0x01a6..0x10ff', got ${rpr(lo_hi_txt)}`);
      }
      lo = parseInt(match.groups.lo, 16);
      hi = parseInt(match.groups.hi, 16);
      //.......................................................................................................
      return {rsg, is_cjk, lo, hi, name};
    }

  };

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
      // debug 'Ωjzrsdb__41', @_TMP_hangeul.disassemble hangeul, { flatten: false, }
      return [...R];
    }

    //---------------------------------------------------------------------------------------------------------
    romanize_ja_kana(entry) {
      var cfg;
      cfg = {};
      return this._TMP_kana.toRomaji(entry, cfg);
    }

    // ### systematic name more like `..._ja_x_kan_latn()` ###
    // help 'Ωdjkr__42', toHiragana  'ラーメン',       { convertLongVowelMark: false, }
    // help 'Ωdjkr__43', toHiragana  'ラーメン',       { convertLongVowelMark: true, }
    // help 'Ωdjkr__44', toKana      'wanakana',   { customKanaMapping: { na: 'に', ka: 'Bana' }, }
    // help 'Ωdjkr__45', toKana      'wanakana',   { customKanaMapping: { waka: '(和歌)', wa: '(和2)', ka: '(歌2)', na: '(名)', ka: '(Bana)', naka: '(中)', }, }
    // help 'Ωdjkr__46', toRomaji    'つじぎり',     { customRomajiMapping: { じ: '(zi)', つ: '(tu)', り: '(li)', りょう: '(ryou)', りょ: '(ryo)' }, }

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
          throw new Error(`Ωjzrsdb__47 expected a text or a list, got a ${type}`);
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
      var cause, fields_rpr, paths;
      ({paths} = get_paths_and_formats());
      this.paths = paths;
      this.language_services = new Language_services();
      this.dba = new Jzr_db_adapter(this.paths.db, {
        host: this
      });
      //.......................................................................................................
      if (this.dba.is_fresh) {
        try {
          /* TAINT move to Jzr_db_adapter together with try/catch */
          this.dba.statements.populate_jzr_mirror_triples.run();
        } catch (error1) {
          cause = error1;
          fields_rpr = rpr(this.dba.state.most_recent_inserted_row);
          throw new Error(`Ωjzrsdb__48 when trying to insert this row: ${fields_rpr}, an error was thrown: ${cause.message}`, {cause});
        }
        try {
          //.......................................................................................................
          /* TAINT move to Jzr_db_adapter together with try/catch */
          this.dba.statements.populate_jzr_lang_hangeul_syllables.run();
        } catch (error1) {
          cause = error1;
          fields_rpr = rpr(this.dba.state.most_recent_inserted_row);
          throw new Error(`Ωjzrsdb__49 when trying to insert this row: ${fields_rpr}, an error was thrown: ${cause.message}`, {cause});
        }
      }
      //.......................................................................................................
      void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    show_counts() {
      (() => {        //.......................................................................................................
        var counts, query;
        query = SQL`select
    mv.v            as v,
    count( t3.v )   as count
  from        jzr_mirror_triples_base as t3
  right join  jzr_mirror_verbs        as mv using ( v )
group by v
order by count desc, v;`;
        echo(grey('Ωjzrsdb__50'), gold(reverse(bold(query))));
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
        echo(grey('Ωjzrsdb__51'), gold(reverse(bold(query))));
        counts = (this.dba.prepare(query)).all();
        return console.table(counts);
      })();
      (() => {        //.......................................................................................................
        var count, counts, dskey, query;
        query = SQL`select dskey, count(*) as count from jzr_mirror_lines group by dskey union all
select '*',   count(*) as count from jzr_mirror_lines
order by count desc;`;
        echo(grey('Ωjzrsdb__52'), gold(reverse(bold(query))));
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
        echo('Ωjzrsdb__53', red(reverse(bold(" found some faults: "))));
        console.table(faulty_rows);
      } else {
        echo('Ωjzrsdb__54', lime(reverse(bold(" (no faults) "))));
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
    // v:c:reading:ja-x-Hir
    // v:c:reading:ja-x-Kat
    if (false) {
      seen = new Set();
      for (y of jzr.dba.walk(SQL`select distinct( o ) as reading from jzr_triples where v = 'v:c:reading:ja-x-Kat' order by o;`)) {
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
      for (z of jzr.dba.walk(SQL`select distinct( o ) as reading from jzr_triples where v = 'v:c:reading:ja-x-Hir' order by o;`)) {
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
    debug('Ωjzrsdb__55', Undumper.undump({
      db: jzr.dba,
      path,
      mode: 'fast'
    }));
    //.........................................................................................................
    jzr.show_counts();
    jzr.show_jzr_meta_faults();
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  demo_show_all_tables = function() {
    var count, i, jzr, len, name, relation_name, relation_names, row, row_count, statement, table;
    jzr = new Jizura();
    relation_names = (function() {
      var results;
      results = [];
      for (row of jzr.dba.walk(jzr.dba.statements.std_get_relations)) {
        results.push(row.name);
      }
      return results;
    })();
    relation_names = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = relation_names.length; i < len; i++) {
        name = relation_names[i];
        if (!name.startsWith('std_')) {
          results.push(name);
        }
      }
      return results;
    })();
    relation_names = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = relation_names.length; i < len; i++) {
        name = relation_names[i];
        if (!name.startsWith('_jzr_meta_')) {
          results.push(name);
        }
      }
      return results;
    })();
    relation_names = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = relation_names.length; i < len; i++) {
        name = relation_names[i];
        if (!name.startsWith('jzr_meta_')) {
          results.push(name);
        }
      }
      return results;
    })();
//.........................................................................................................
    for (i = 0, len = relation_names.length; i < len; i++) {
      relation_name = relation_names[i];
      table = {};
      row_count = (jzr.dba.get_first(SQL`select count(*) as count from ${relation_name};`)).count;
      statement = SQL`select * from ${relation_name} order by random() limit 10;`;
      count = 0;
      for (row of jzr.dba.walk(statement)) {
        count++;
        table[relation_name + ` (${count})`] = row;
      }
      echo(reverse(bold(` ${relation_name} `)));
      console.table(table);
    }
    return null;
  };

  //===========================================================================================================
  if (module === require.main) {
    (() => {
      demo();
      demo_show_all_tables();
      // demo_read_dump()
      return null;
    })();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsS0FBQSxFQUFBLHVCQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxFQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQSxjQUFBLEVBQUEsaUJBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLHdCQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxjQUFBLEVBQUEsb0JBQUEsRUFBQSx1QkFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLHFCQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEseUJBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUE7OztFQUdBLEdBQUEsR0FBNEIsT0FBQSxDQUFRLEtBQVI7O0VBQzVCLENBQUEsQ0FBRSxLQUFGLEVBQ0UsS0FERixFQUVFLElBRkYsRUFHRSxJQUhGLEVBSUUsS0FKRixFQUtFLE1BTEYsRUFNRSxJQU5GLEVBT0UsSUFQRixFQVFFLE9BUkYsQ0FBQSxHQVE0QixHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVIsQ0FBb0IsbUJBQXBCLENBUjVCOztFQVNBLENBQUEsQ0FBRSxHQUFGLEVBQ0UsT0FERixFQUVFLElBRkYsRUFHRSxLQUhGLEVB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QUFJLElBQUksQ0FBQyxVQUFMLENBQWdCLFdBQWhCO3VCQUF6Qzs7TUFBQSxDQUFBOztTQUpyQjs7SUFNRSxLQUFBLGdEQUFBOztNQUNFLEtBQUEsR0FBUSxDQUFBO01BQ1IsU0FBQSxHQUFZLENBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFSLENBQWtCLEdBQUcsQ0FBQSw4QkFBQSxDQUFBLENBQWlDLGFBQWpDLEVBQUEsQ0FBckIsQ0FBRixDQUEwRSxDQUFDO01BQ3ZGLFNBQUEsR0FBWSxHQUFHLENBQUEsY0FBQSxDQUFBLENBQW1CLGFBQW5CLENBQUEsNEJBQUE7TUFDZixLQUFBLEdBQVk7TUFDWixLQUFBLDhCQUFBO1FBQ0UsS0FBQTtRQUNBLEtBQUssQ0FBRSxhQUFBLEdBQWdCLENBQUEsRUFBQSxDQUFBLENBQUssS0FBTCxDQUFBLENBQUEsQ0FBbEIsQ0FBTCxHQUF5QztNQUYzQztNQUdBLElBQUEsQ0FBSyxPQUFBLENBQVEsSUFBQSxDQUFLLEVBQUEsQ0FBQSxDQUFJLGFBQUosRUFBQSxDQUFMLENBQVIsQ0FBTDtNQUNBLE9BQU8sQ0FBQyxLQUFSLENBQWMsS0FBZDtJQVRGO1dBVUM7RUFqQm9CLEVBMzJDdkI7OztFQSszQ0EsSUFBRyxNQUFBLEtBQVUsT0FBTyxDQUFDLElBQXJCO0lBQWtDLENBQUEsQ0FBQSxDQUFBLEdBQUE7TUFDaEMsSUFBQSxDQUFBO01BQ0Esb0JBQUEsQ0FBQSxFQURGOzthQUdHO0lBSitCLENBQUEsSUFBbEM7O0FBLzNDQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCdcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5HVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xueyBhbGVydFxuICBkZWJ1Z1xuICBoZWxwXG4gIGluZm9cbiAgcGxhaW5cbiAgcHJhaXNlXG4gIHVyZ2VcbiAgd2FyblxuICB3aGlzcGVyIH0gICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ2ppenVyYS1zb3VyY2VzLWRiJ1xueyBycHJcbiAgaW5zcGVjdFxuICBlY2hvXG4gIHdoaXRlXG4gIGdyZWVuXG4gIGJsdWVcbiAgbGltZVxuICBnb2xkXG4gIGdyZXlcbiAgcmVkXG4gIGJvbGRcbiAgcmV2ZXJzZVxuICBsb2cgICAgIH0gICAgICAgICAgICAgICA9IEdVWS50cm1cbiMgeyBmIH0gICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9lZmZzdHJpbmcnXG4jIHdyaXRlICAgICAgICAgICAgICAgICAgICAgPSAoIHAgKSAtPiBwcm9jZXNzLnN0ZG91dC53cml0ZSBwXG4jIHsgbmZhIH0gICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvbm9ybWFsaXplLWZ1bmN0aW9uLWFyZ3VtZW50cydcbiMgR1RORyAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ndXktdGVzdC1ORydcbiMgeyBUZXN0ICAgICAgICAgICAgICAgICAgfSA9IEdUTkdcbkZTICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOmZzJ1xuUEFUSCAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6cGF0aCdcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQnNxbDMgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2JldHRlci1zcWxpdGUzJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5TRk1PRFVMRVMgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2JyaWNhYnJhYy1zZm1vZHVsZXMnXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgRGJyaWMsXG4gIERicmljX3N0ZCxcbiAgU1FMLCAgICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9kYnJpYygpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgbGV0cyxcbiAgZnJlZXplLCAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9sZXRzZnJlZXpldGhhdF9pbmZyYSgpLnNpbXBsZVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IEpldHN0cmVhbSxcbiAgQXN5bmNfamV0c3RyZWFtLCAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9qZXRzdHJlYW0oKVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9mYXN0X2xpbmVyZWFkZXIoKVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IEJlbmNobWFya2VyLCAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfYmVuY2htYXJraW5nKClcbmJlbmNobWFya2VyICAgICAgICAgICAgICAgICAgID0gbmV3IEJlbmNobWFya2VyKClcbnRpbWVpdCAgICAgICAgICAgICAgICAgICAgICAgID0gKCBQLi4uICkgLT4gYmVuY2htYXJrZXIudGltZWl0IFAuLi5cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBzZXRfZ2V0dGVyLCAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX21hbmFnZWRfcHJvcGVydHlfdG9vbHMoKVxueyBJREwsIElETFgsICAgICAgICAgICAgfSA9IHJlcXVpcmUgJ21vamlrdXJhLWlkbCdcbnsgdHlwZV9vZiwgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV90eXBlX29mKClcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5mcm9tX2Jvb2wgICAgICAgICAgICAgICAgICAgICA9ICggeCApIC0+IHN3aXRjaCB4XG4gIHdoZW4gdHJ1ZSAgdGhlbiAxXG4gIHdoZW4gZmFsc2UgdGhlbiAwXG4gIGVsc2UgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfX18xIGV4cGVjdGVkIHRydWUgb3IgZmFsc2UsIGdvdCAje3JwciB4fVwiXG5hc19ib29sICAgICAgICAgICAgICAgICAgICAgICA9ICggeCApIC0+IHN3aXRjaCB4XG4gIHdoZW4gMSB0aGVuIHRydWVcbiAgd2hlbiAwIHRoZW4gZmFsc2VcbiAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fXzIgZXhwZWN0ZWQgMCBvciAxLCBnb3QgI3tycHIgeH1cIlxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmRlbW9fc291cmNlX2lkZW50aWZpZXJzID0gLT5cbiAgeyBleHBhbmRfZGljdGlvbmFyeSwgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfZGljdGlvbmFyeV90b29scygpXG4gIHsgZ2V0X2xvY2FsX2Rlc3RpbmF0aW9ucywgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2dldF9sb2NhbF9kZXN0aW5hdGlvbnMoKVxuICBmb3Iga2V5LCB2YWx1ZSBvZiBnZXRfbG9jYWxfZGVzdGluYXRpb25zKClcbiAgICBkZWJ1ZyAnzqlqenJzZGJfX18zJywga2V5LCB2YWx1ZVxuICAjIGNhbiBhcHBlbmQgbGluZSBudW1iZXJzIHRvIGZpbGVzIGFzIGluOlxuICAjICdkczpkaWN0Om1lYW5pbmdzLjE6TD0xMzMzMidcbiAgIyAnZHM6ZGljdDp1Y2QxNDAuMTp1aGRpZHg6TD0xMjM0J1xuICAjIHJvd2lkczogJ3Q6amZtOlI9MSdcbiAgIyB7XG4gICMgICAnZHM6ZGljdDptZWFuaW5ncyc6ICAgICAgICAgICckanpyZHMvbWVhbmluZy9tZWFuaW5ncy50eHQnXG4gICMgICAnZHM6ZGljdDp1Y2Q6djE0LjA6dWhkaWR4JyA6ICckanpyZHMvdW5pY29kZS5vcmctdWNkLXYxNC4wL1VuaWhhbl9EaWN0aW9uYXJ5SW5kaWNlcy50eHQnXG4gICMgICB9XG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyMjXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAuICAgb29vb1xuICAgICAgICAgICAgICAgICAgICAgICAubzggICBgODg4XG5vby5vb29vby4gICAub29vby4gICAubzg4OG9vICA4ODggLm9vLiAgICAub29vby5vXG4gODg4JyBgODhiIGBQICApODhiICAgIDg4OCAgICA4ODhQXCJZODhiICBkODgoICBcIjhcbiA4ODggICA4ODggIC5vUFwiODg4ICAgIDg4OCAgICA4ODggICA4ODggIGBcIlk4OGIuXG4gODg4ICAgODg4IGQ4KCAgODg4ICAgIDg4OCAuICA4ODggICA4ODggIG8uICApODhiXG4gODg4Ym9kOFAnIGBZODg4XCJcIjhvICAgXCI4ODhcIiBvODg4byBvODg4byA4XCJcIjg4OFAnXG4gODg4XG5vODg4b1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZ2V0X3BhdGhzX2FuZF9mb3JtYXRzID0gLT5cbiAgcGF0aHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSB7fVxuICBmb3JtYXRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IHt9XG4gIFIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0geyBwYXRocywgZm9ybWF0cywgfVxuICBwYXRocy5iYXNlICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEgucmVzb2x2ZSBfX2Rpcm5hbWUsICcuLidcbiAgcGF0aHMuanpyICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILnJlc29sdmUgcGF0aHMuYmFzZSwgJy4uJ1xuICBwYXRocy5kYiAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBwYXRocy5iYXNlLCAnanpyLmRiJ1xuICAjIHBhdGhzLmRiICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gJy9kZXYvc2htL2p6ci5kYidcbiAgIyBwYXRocy5qenJkcyAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBwYXRocy5iYXNlLCAnanpyZHMnXG4gIHBhdGhzLmp6cm5kcyAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIHBhdGhzLmJhc2UsICdqaXp1cmEtbmV3LWRhdGFzb3VyY2VzJ1xuICBwYXRocy5tb2ppa3VyYSAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBwYXRocy5qenJuZHMsICdtb2ppa3VyYSdcbiAgcGF0aHMucmF3X2dpdGh1YiAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gcGF0aHMuanpybmRzLCAnYnZmcy9vcmlnaW4vaHR0cHMvcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSdcbiAga2Fuaml1bSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gcGF0aHMucmF3X2dpdGh1YiwgJ21pZnVuZXRvc2hpcm8va2Fuaml1bS84YTBjZGFhMTZkNjRhMjgxYTIwNDhkZTJlZWUyZWM1ZTNhNDQwZmE2J1xuICBydXRvcGlvICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBwYXRocy5yYXdfZ2l0aHViLCAncnV0b3Bpby9Lb3JlYW4tTmFtZS1IYW5qYS1DaGFyc2V0LzEyZGYxYmExYjRkZmFhMDk1ODEzZTRkZGZiYTQyNGU4MTZmOTRjNTMnXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyBwYXRoc1sgJ2RzOmRpY3Q6dWNkOnYxNC4wOnVoZGlkeCcgICAgICBdICAgPSBQQVRILmpvaW4gcGF0aHMuanpybmRzLCAndW5pY29kZS5vcmctdWNkLXYxNC4wL1VuaWhhbl9EaWN0aW9uYXJ5SW5kaWNlcy50eHQnXG4gIHBhdGhzWyAnZHM6ZGljdDp4OmtvLUhhbmcrTGF0bicgICAgICAgIF0gICA9IFBBVEguam9pbiBwYXRocy5qenJuZHMsICdoYW5nZXVsLXRyYW5zY3JpcHRpb25zLnRzdidcbiAgcGF0aHNbICdkczpkaWN0Ong6amEtS2FuK0xhdG4nICAgICAgICAgXSAgID0gUEFUSC5qb2luIHBhdGhzLmp6cm5kcywgJ2thbmEtdHJhbnNjcmlwdGlvbnMudHN2J1xuICBwYXRoc1sgJ2RzOmRpY3Q6YmNwNDcnICAgICAgICAgICAgICAgICBdICAgPSBQQVRILmpvaW4gcGF0aHMuanpybmRzLCAnQkNQNDctbGFuZ3VhZ2Utc2NyaXB0cy1yZWdpb25zLnRzdidcbiAgcGF0aHNbICdkczpkaWN0OmphOmthbmppdW0nICAgICAgICAgICAgXSAgID0gUEFUSC5qb2luIGthbmppdW0sICdkYXRhL3NvdXJjZV9maWxlcy9rYW5qaWRpY3QudHh0J1xuICBwYXRoc1sgJ2RzOmRpY3Q6amE6a2Fuaml1bTphdXgnICAgICAgICBdICAgPSBQQVRILmpvaW4ga2Fuaml1bSwgJ2RhdGEvc291cmNlX2ZpbGVzLzBfUkVBRE1FLnR4dCdcbiAgcGF0aHNbICdkczpkaWN0OmtvOlY9ZGF0YS1nb3YuY3N2JyAgICAgXSAgID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLWdvdi5jc3YnXG4gIHBhdGhzWyAnZHM6ZGljdDprbzpWPWRhdGEtZ292Lmpzb24nICAgIF0gICA9IFBBVEguam9pbiBydXRvcGlvLCAnZGF0YS1nb3YuanNvbidcbiAgcGF0aHNbICdkczpkaWN0OmtvOlY9ZGF0YS1uYXZlci5jc3YnICAgXSAgID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLW5hdmVyLmNzdidcbiAgcGF0aHNbICdkczpkaWN0OmtvOlY9ZGF0YS1uYXZlci5qc29uJyAgXSAgID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLW5hdmVyLmpzb24nXG4gIHBhdGhzWyAnZHM6ZGljdDprbzpWPVJFQURNRS5tZCcgICAgICAgIF0gICA9IFBBVEguam9pbiBydXRvcGlvLCAnUkVBRE1FLm1kJ1xuICBwYXRoc1sgJ2RzOmRpY3Q6bWVhbmluZ3MnICAgICAgICAgICAgICBdICAgPSBQQVRILmpvaW4gcGF0aHMubW9qaWt1cmEsICdtZWFuaW5nL21lYW5pbmdzLnR4dCdcbiAgcGF0aHNbICdkczpzaGFwZTppZHN2MicgICAgICAgICAgICAgICAgXSAgID0gUEFUSC5qb2luIHBhdGhzLm1vamlrdXJhLCAnc2hhcGUvc2hhcGUtYnJlYWtkb3duLWZvcm11bGEtdjIudHh0J1xuICBwYXRoc1sgJ2RzOnNoYXBlOnpoejViZicgICAgICAgICAgICAgICBdICAgPSBQQVRILmpvaW4gcGF0aHMubW9qaWt1cmEsICdzaGFwZS9zaGFwZS1zdHJva2VvcmRlci16aGF6aXd1YmlmYS50eHQnXG4gIHBhdGhzWyAnZHM6dWNkYjpyc2dzJyAgICAgICAgICAgICAgICAgIF0gICA9IFBBVEguam9pbiBwYXRocy5tb2ppa3VyYSwgJ3VjZGIvY2ZnL3JzZ3MtYW5kLWJsb2Nrcy5tZCdcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjIGZvcm1hdHNbICdkczpkaWN0OnVjZDp2MTQuMDp1aGRpZHgnICAgICAgXSAgID0gLCAndW5pY29kZS5vcmctdWNkLXYxNC4wL1VuaWhhbl9EaWN0aW9uYXJ5SW5kaWNlcy50eHQnXG4gIGZvcm1hdHNbICdkczpkaWN0Ong6a28tSGFuZytMYXRuJyAgICAgICAgXSAgID0gJ2RzZjp0c3YnXG4gIGZvcm1hdHNbICdkczpkaWN0Ong6amEtS2FuK0xhdG4nICAgICAgICAgXSAgID0gJ2RzZjp0c3YnXG4gIGZvcm1hdHNbICdkczpkaWN0OmJjcDQ3JyAgICAgICAgICAgICAgICAgXSAgID0gJ2RzZjp0c3YnXG4gIGZvcm1hdHNbICdkczpkaWN0OmphOmthbmppdW0nICAgICAgICAgICAgXSAgID0gJ2RzZjp0eHQnXG4gIGZvcm1hdHNbICdkczpkaWN0OmphOmthbmppdW06YXV4JyAgICAgICAgXSAgID0gJ2RzZjp0eHQnXG4gIGZvcm1hdHNbICdkczpkaWN0OmtvOlY9ZGF0YS1nb3YuY3N2JyAgICAgXSAgID0gJ2RzZjpjc3YnXG4gIGZvcm1hdHNbICdkczpkaWN0OmtvOlY9ZGF0YS1nb3YuanNvbicgICAgXSAgID0gJ2RzZjpqc29uJ1xuICBmb3JtYXRzWyAnZHM6ZGljdDprbzpWPWRhdGEtbmF2ZXIuY3N2JyAgIF0gICA9ICdkc2Y6Y3N2J1xuICBmb3JtYXRzWyAnZHM6ZGljdDprbzpWPWRhdGEtbmF2ZXIuanNvbicgIF0gICA9ICdkc2Y6anNvbidcbiAgZm9ybWF0c1sgJ2RzOmRpY3Q6a286Vj1SRUFETUUubWQnICAgICAgICBdICAgPSAnZHNmOm1kJ1xuICBmb3JtYXRzWyAnZHM6ZGljdDptZWFuaW5ncycgICAgICAgICAgICAgIF0gICA9ICdkc2Y6dHN2J1xuICBmb3JtYXRzWyAnZHM6c2hhcGU6aWRzdjInICAgICAgICAgICAgICAgIF0gICA9ICdkc2Y6dHN2J1xuICBmb3JtYXRzWyAnZHM6c2hhcGU6emh6NWJmJyAgICAgICAgICAgICAgIF0gICA9ICdkc2Y6dHN2J1xuICBmb3JtYXRzWyAnZHM6dWNkYjpyc2dzJyAgICAgICAgICAgICAgICAgIF0gICA9ICdkc2Y6bWQ6dGFibGUnXG4gIHJldHVybiBSXG5cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEp6cl9kYl9hZGFwdGVyIGV4dGVuZHMgRGJyaWNfc3RkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAZGJfY2xhc3M6ICBCc3FsM1xuICBAcHJlZml4OiAgICAnanpyJ1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6ICggZGJfcGF0aCwgY2ZnID0ge30gKSAtPlxuICAgICMjIyBUQUlOVCBuZWVkIG1vcmUgY2xhcml0eSBhYm91dCB3aGVuIHN0YXRlbWVudHMsIGJ1aWxkLCBpbml0aWFsaXplLi4uIGlzIHBlcmZvcm1lZCAjIyNcbiAgICB7IGhvc3QsIH0gPSBjZmdcbiAgICBjZmcgICAgICAgPSBsZXRzIGNmZywgKCBjZmcgKSAtPiBkZWxldGUgY2ZnLmhvc3RcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHN1cGVyIGRiX3BhdGgsIGNmZ1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQGhvc3QgICA9IGhvc3RcbiAgICBAc3RhdGUgID0geyB0cmlwbGVfY291bnQ6IDAsIG1vc3RfcmVjZW50X2luc2VydGVkX3JvdzogbnVsbCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkbyA9PlxuICAgICAgIyMjIFRBSU5UIHRoaXMgaXMgbm90IHdlbGwgcGxhY2VkICMjI1xuICAgICAgIyMjIE5PVEUgZXhlY3V0ZSBhIEdhcHMtYW5kLUlzbGFuZHMgRVNTRlJJIHRvIGltcHJvdmUgc3RydWN0dXJhbCBpbnRlZ3JpdHkgYXNzdXJhbmNlOiAjIyNcbiAgICAgICMgKCBAcHJlcGFyZSBTUUxcInNlbGVjdCAqIGZyb20gX2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzIHdoZXJlIGZhbHNlO1wiICkuZ2V0KClcbiAgICAgIG1lc3NhZ2VzID0gW11cbiAgICAgIGZvciB7IG5hbWUsIHR5cGUsIH0gZnJvbSBAc3RhdGVtZW50cy5zdGRfZ2V0X3JlbGF0aW9ucy5pdGVyYXRlKClcbiAgICAgICAgdHJ5XG4gICAgICAgICAgKCBAcHJlcGFyZSBTUUxcInNlbGVjdCAqIGZyb20gI3tuYW1lfSB3aGVyZSBmYWxzZTtcIiApLmFsbCgpXG4gICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgbWVzc2FnZXMucHVzaCBcIiN7dHlwZX0gI3tuYW1lfTogI3tlcnJvci5tZXNzYWdlfVwiXG4gICAgICAgICAgd2FybiAnzqlqenJzZGJfX180JywgZXJyb3IubWVzc2FnZVxuICAgICAgcmV0dXJuIG51bGwgaWYgbWVzc2FnZXMubGVuZ3RoIGlzIDBcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX19fNSBFRkZSSSB0ZXN0aW5nIHJldmVhbGVkIGVycm9yczogI3tycHIgbWVzc2FnZXN9XCJcbiAgICAgIDtudWxsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiBAaXNfZnJlc2hcbiAgICAgIEBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZV9mb3JtYXRzKClcbiAgICAgIEBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZXMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdmVyYnMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGNvZGVzKClcbiAgICAgIEBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzKClcbiAgICAgIEBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZ2x5cGhyYW5nZSgpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzZXRfZ2V0dGVyIEA6OiwgJ25leHRfdHJpcGxlX3Jvd2lkJywgLT4gXCJ0Om1yOjNwbDpSPSN7KytAc3RhdGUudHJpcGxlX2NvdW50fVwiXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAjIyNcblxuICAgLm84ICAgICAgICAgICAgICAgICAgICBvOG8gIG9vb28gICAgICAgIC5vOFxuICBcIjg4OCAgICAgICAgICAgICAgICAgICAgYFwiJyAgYDg4OCAgICAgICBcIjg4OFxuICAgODg4b29vby4gIG9vb28gIG9vb28gIG9vb28gICA4ODggICAub29vbzg4OFxuICAgZDg4JyBgODhiIGA4ODggIGA4ODggIGA4ODggICA4ODggIGQ4OCcgYDg4OFxuICAgODg4ICAgODg4ICA4ODggICA4ODggICA4ODggICA4ODggIDg4OCAgIDg4OFxuICAgODg4ICAgODg4ICA4ODggICA4ODggICA4ODggICA4ODggIDg4OCAgIDg4OFxuICAgYFk4Ym9kOFAnICBgVjg4VlwiVjhQJyBvODg4byBvODg4byBgWThib2Q4OFBcIlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBAYnVpbGQ6IFtcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl91cm5zIChcbiAgICAgICAgdXJuICAgICB0ZXh0ICAgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgY29tbWVudCB0ZXh0ICAgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggdXJuICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X19fNlwiIGNoZWNrICggdXJuIHJlZ2V4cCAnXltcXFxcLVxcXFwrXFxcXC46YS16QS1aMC05XSskJyApIClcbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9nbHlwaHJhbmdlcyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoICd0OnVjOnJzZzpWPScgfHwgcnNnICksXG4gICAgICAgIHJzZyAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGlzX2NqayAgICBib29sZWFuICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxvICAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGhpICAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIC0tIGxvX2dseXBoICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGNoYXIoIGxvICkgKSBzdG9yZWQsXG4gICAgICAgIC0tIGhpX2dseXBoICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGNoYXIoIGhpICkgKSBzdG9yZWQsXG4gICAgICAgIG5hbWUgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAtLSBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X19fN1wiIGNoZWNrICggbG8gYmV0d2VlbiAweDAwMDAwMCBhbmQgMHgxMGZmZmYgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfX184XCIgY2hlY2sgKCBoaSBiZXR3ZWVuIDB4MDAwMDAwIGFuZCAweDEwZmZmZiApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fXzlcIiBjaGVjayAoIGxvIDw9IGhpICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18xMFwiIGNoZWNrICggcm93aWQgcmVnZXhwICdeLiokJyApXG4gICAgICApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfY2prX2dseXBocmFuZ2VzIGFzIHNlbGVjdFxuICAgICAgICAqXG4gICAgICBmcm9tIGp6cl9nbHlwaHJhbmdlc1xuICAgICAgd2hlcmUgaXNfY2prXG4gICAgICBvcmRlciBieSBsbztcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9nbHlwaHNldHMgKFxuICAgICAgICByb3dpZCAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIG5hbWUgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgZ2x5cGhyYW5nZSAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTFcIiBmb3JlaWduIGtleSAoIGdseXBocmFuZ2UgKSByZWZlcmVuY2VzIGp6cl9nbHlwaHJhbmdlcyAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18xMlwiIGNoZWNrICggcm93aWQgcmVnZXhwICdeLiokJyApXG4gICAgICApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2RhdGFzb3VyY2VfZm9ybWF0cyAoXG4gICAgICAgIGZvcm1hdCAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGNvbW1lbnQgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIGZvcm1hdCApLFxuICAgICAgY2hlY2sgKCBmb3JtYXQgcmVnZXhwICdeZHNmOltcXFxcLVxcXFwrXFxcXC46YS16QS1aMC05XSskJyApXG4gICAgICApO1wiXCJcIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRyaWdnZXIganpyX2RhdGFzb3VyY2VfZm9ybWF0c19pbnNlcnRcbiAgICAgIGJlZm9yZSBpbnNlcnQgb24ganpyX2RhdGFzb3VyY2VfZm9ybWF0c1xuICAgICAgZm9yIGVhY2ggcm93IGJlZ2luXG4gICAgICAgIHNlbGVjdCB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfZGF0YXNvdXJjZV9mb3JtYXRzJyxcbiAgICAgICAgICAnZm9ybWF0OicsIG5ldy5mb3JtYXQsICdjb21tZW50OicsIG5ldy5jb21tZW50ICk7XG4gICAgICAgIGluc2VydCBpbnRvIGp6cl91cm5zICggdXJuLCBjb21tZW50ICkgdmFsdWVzICggbmV3LmZvcm1hdCwgbmV3LmNvbW1lbnQgKTtcbiAgICAgICAgZW5kO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2RhdGFzb3VyY2VzIChcbiAgICAgICAgZHNrZXkgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgZm9ybWF0ICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgcGF0aCAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggZHNrZXkgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzEzXCIgZm9yZWlnbiBrZXkgKCBmb3JtYXQgKSByZWZlcmVuY2VzIGp6cl9kYXRhc291cmNlX2Zvcm1hdHMgKCBmb3JtYXQgKVxuICAgICAgKTtcIlwiXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9kYXRhc291cmNlc19pbnNlcnRcbiAgICAgIGJlZm9yZSBpbnNlcnQgb24ganpyX2RhdGFzb3VyY2VzXG4gICAgICBmb3IgZWFjaCByb3cgYmVnaW5cbiAgICAgICAgc2VsZWN0IHRyaWdnZXJfb25fYmVmb3JlX2luc2VydCggJ2p6cl9kYXRhc291cmNlcycsXG4gICAgICAgICAgJ2Rza2V5OicsIG5ldy5kc2tleSwgJ2Zvcm1hdDonLCBuZXcuZm9ybWF0LCAncGF0aDonLCBuZXcucGF0aCApO1xuICAgICAgICBpbnNlcnQgaW50byBqenJfdXJucyAoIHVybiwgY29tbWVudCApIHZhbHVlcyAoIG5ldy5kc2tleSwgJ2Zvcm1hdDogJyB8fCBuZXcuZm9ybWF0IHx8ICcsIHBhdGg6ICcgfHwgbmV3LnBhdGggKTtcbiAgICAgICAgZW5kO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX21pcnJvcl9sY29kZXMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBsY29kZSAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBjb21tZW50ICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTRcIiBjaGVjayAoIGxjb2RlIHJlZ2V4cCAnXlthLXpBLVpdK1thLXpBLVowLTldKiQnICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18xNVwiIGNoZWNrICggcm93aWQgPSAndDptcjpsYzpWPScgfHwgbGNvZGUgKSApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX21pcnJvcl9saW5lcyAoXG4gICAgICAgIC0tICd0OmpmbTonXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoICd0Om1yOmxuOmRzPScgfHwgZHNrZXkgfHwgJzpMPScgfHwgbGluZV9uciApIHN0b3JlZCxcbiAgICAgICAgcmVmICAgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggICAgICAgICAgICAgICAgICBkc2tleSB8fCAnOkw9JyB8fCBsaW5lX25yICkgdmlydHVhbCxcbiAgICAgICAgZHNrZXkgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbGluZV9uciAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbGNvZGUgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbGluZSAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgamZpZWxkcyAgIGpzb24gICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgIC0tIHByaW1hcnkga2V5ICggcm93aWQgKSwgICAgICAgICAgICAgICAgICAgICAgICAgICAtLSAjIyMgTk9URSBFeHBlcmltZW50YWw6IG5vIGV4cGxpY2l0IFBLLCBpbnN0ZWFkIGdlbmVyYXRlZCBgcm93aWRgIGNvbHVtblxuICAgICAgLS0gY2hlY2sgKCByb3dpZCByZWdleHAgJ150Om1yOmxuOmRzPS4rOkw9XFxcXGQrJCcpLCAgLS0gIyMjIE5PVEUgbm8gbmVlZCB0byBjaGVjayBhcyB2YWx1ZSBpcyBnZW5lcmF0ZWQgIyMjXG4gICAgICB1bmlxdWUgKCBkc2tleSwgbGluZV9uciApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTZcIiBmb3JlaWduIGtleSAoIGxjb2RlICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xjb2RlcyAoIGxjb2RlICkgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfdmVyYnMgKFxuICAgICAgICByYW5rICAgICAgaW50ZWdlciAgICAgICAgIG5vdCBudWxsIGRlZmF1bHQgMSxcbiAgICAgICAgcyAgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgdiAgICAgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgbyAgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggdiApLFxuICAgICAgLS0gY2hlY2sgKCByb3dpZCByZWdleHAgJ150Om1yOnZiOlY9W1xcXFwtOlxcXFwrXFxcXHB7TH1dKyQnICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18xN1wiIGNoZWNrICggcmFuayA+IDAgKSApO1wiXCJcIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRyaWdnZXIganpyX21pcnJvcl92ZXJic19pbnNlcnRcbiAgICAgIGJlZm9yZSBpbnNlcnQgb24ganpyX21pcnJvcl92ZXJic1xuICAgICAgZm9yIGVhY2ggcm93IGJlZ2luXG4gICAgICAgIHNlbGVjdCB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfbWlycm9yX3ZlcmJzJyxcbiAgICAgICAgICAncmFuazonLCBuZXcucmFuaywgJ3M6JywgbmV3LnMsICd2OicsIG5ldy52LCAnbzonLCBuZXcubyApO1xuICAgICAgICBpbnNlcnQgaW50byBqenJfdXJucyAoIHVybiwgY29tbWVudCApIHZhbHVlcyAoIG5ldy52LCAnczogJyB8fCBuZXcucyB8fCAnLCBvOiAnIHx8IG5ldy5vICk7XG4gICAgICAgIGVuZDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcmVmICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgcyAgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgdiAgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbyAgICAgICAgIGpzb24gICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzE4XCIgY2hlY2sgKCByb3dpZCByZWdleHAgJ150Om1yOjNwbDpSPVxcXFxkKyQnICksXG4gICAgICAtLSB1bmlxdWUgKCByZWYsIHMsIHYsIG8gKVxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTlcIiBmb3JlaWduIGtleSAoIHJlZiApIHJlZmVyZW5jZXMganpyX21pcnJvcl9saW5lcyAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18yMFwiIGZvcmVpZ24ga2V5ICggdiAgICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX3ZlcmJzICggdiApXG4gICAgICApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdHJpZ2dlciBqenJfbWlycm9yX3RyaXBsZXNfcmVnaXN0ZXJcbiAgICAgIGJlZm9yZSBpbnNlcnQgb24ganpyX21pcnJvcl90cmlwbGVzX2Jhc2VcbiAgICAgIGZvciBlYWNoIHJvdyBiZWdpblxuICAgICAgICBzZWxlY3QgdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0KCAnanpyX21pcnJvcl90cmlwbGVzX2Jhc2UnLFxuICAgICAgICAgICdyb3dpZDonLCBuZXcucm93aWQsICdyZWY6JywgbmV3LnJlZiwgJ3M6JywgbmV3LnMsICd2OicsIG5ldy52LCAnbzonLCBuZXcubyApO1xuICAgICAgICBlbmQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyAoXG4gICAgICAgIHJvd2lkICAgICAgICAgICB0ZXh0ICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByZWYgICAgICAgICAgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgc3lsbGFibGVfaGFuZyAgIHRleHQgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHN5bGxhYmxlX2xhdG4gICB0ZXh0ICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggaW5pdGlhbF9sYXRuIHx8IG1lZGlhbF9sYXRuIHx8IGZpbmFsX2xhdG4gKSB2aXJ0dWFsLFxuICAgICAgICAtLSBzeWxsYWJsZV9sYXRuICAgdGV4dCAgdW5pcXVlICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggaW5pdGlhbF9sYXRuIHx8IG1lZGlhbF9sYXRuIHx8IGZpbmFsX2xhdG4gKSB2aXJ0dWFsLFxuICAgICAgICBpbml0aWFsX2hhbmcgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbWVkaWFsX2hhbmcgICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpbmFsX2hhbmcgICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBpbml0aWFsX2xhdG4gICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbWVkaWFsX2xhdG4gICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpbmFsX2xhdG4gICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjFcIiBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bGFuZzpoYW5nOnN5bDpWPVxcXFxTKyQnIClcbiAgICAgIC0tIHVuaXF1ZSAoIHJlZiwgcywgdiwgbyApXG4gICAgICAtLSBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18yMlwiIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xpbmVzICggcm93aWQgKVxuICAgICAgLS0gY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjNcIiBmb3JlaWduIGtleSAoIHN5bGxhYmxlX2hhbmcgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICggbyApIClcbiAgICAgICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzX3JlZ2lzdGVyXG4gICAgICBiZWZvcmUgaW5zZXJ0IG9uIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzXG4gICAgICBmb3IgZWFjaCByb3cgYmVnaW5cbiAgICAgICAgc2VsZWN0IHRyaWdnZXJfb25fYmVmb3JlX2luc2VydCggJ2p6cl9sYW5nX2hhbmdfc3lsbGFibGVzJyxcbiAgICAgICAgICBuZXcucm93aWQsIG5ldy5yZWYsIG5ldy5zeWxsYWJsZV9oYW5nLCBuZXcuc3lsbGFibGVfbGF0bixcbiAgICAgICAgICAgIG5ldy5pbml0aWFsX2hhbmcsIG5ldy5tZWRpYWxfaGFuZywgbmV3LmZpbmFsX2hhbmcsXG4gICAgICAgICAgICBuZXcuaW5pdGlhbF9sYXRuLCBuZXcubWVkaWFsX2xhdG4sIG5ldy5maW5hbF9sYXRuICk7XG4gICAgICAgIGVuZDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlcyBhc1xuICAgICAgc2VsZWN0IG51bGwgYXMgcm93aWQsIG51bGwgYXMgcmVmLCBudWxsIGFzIHMsIG51bGwgYXMgdiwgbnVsbCBhcyBvIHdoZXJlIGZhbHNlIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ3Y6YzpyZWFkaW5nOmtvLUxhdG4nLCAgICAgICAgICBzeWxsYWJsZV9sYXRuICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAndjpjOnJlYWRpbmc6a28tTGF0bjppbml0aWFsJywgIGluaXRpYWxfbGF0biAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICd2OmM6cmVhZGluZzprby1MYXRuOm1lZGlhbCcsICAgbWVkaWFsX2xhdG4gICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ3Y6YzpyZWFkaW5nOmtvLUxhdG46ZmluYWwnLCAgICBmaW5hbF9sYXRuICAgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAndjpjOnJlYWRpbmc6a28tSGFuZzppbml0aWFsJywgIGluaXRpYWxfaGFuZyAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICd2OmM6cmVhZGluZzprby1IYW5nOm1lZGlhbCcsICAgbWVkaWFsX2hhbmcgICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ3Y6YzpyZWFkaW5nOmtvLUhhbmc6ZmluYWwnLCAgICBmaW5hbF9oYW5nICAgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwgd2hlcmUgZmFsc2VcbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2FsbF90cmlwbGVzIGFzXG4gICAgICBzZWxlY3QgbnVsbCBhcyByb3dpZCwgbnVsbCBhcyByZWYsIG51bGwgYXMgcywgbnVsbCBhcyB2LCBudWxsIGFzIG8gd2hlcmUgZmFsc2UgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCAqIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgKiBmcm9tIGp6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXMgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsIHdoZXJlIGZhbHNlXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl90cmlwbGVzIGFzXG4gICAgICBzZWxlY3QgbnVsbCBhcyByb3dpZCwgbnVsbCBhcyByZWYsIG51bGwgYXMgcmFuaywgbnVsbCBhcyBzLCBudWxsIGFzIHYsIG51bGwgYXMgbyB3aGVyZSBmYWxzZVxuICAgICAgLS0gLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCB0YjEucm93aWQsIHRiMS5yZWYsIHZiMS5yYW5rLCB0YjEucywgdGIxLnYsIHRiMS5vIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgdGIxXG4gICAgICBqb2luIGp6cl9taXJyb3JfdmVyYnMgYXMgdmIxIHVzaW5nICggdiApXG4gICAgICB3aGVyZSB2YjEudiBsaWtlICd2OmM6JSdcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgdGIyLnJvd2lkLCB0YjIucmVmLCB2YjIucmFuaywgdGIyLnMsIGtyLnYsIGtyLm8gZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0YjJcbiAgICAgIGpvaW4ganpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlcyBhcyBrciBvbiAoIHRiMi52ID0gJ3Y6YzpyZWFkaW5nOmtvLUhhbmcnIGFuZCB0YjIubyA9IGtyLnMgKVxuICAgICAgam9pbiBqenJfbWlycm9yX3ZlcmJzIGFzIHZiMiBvbiAoIGtyLnYgPSB2YjIudiApXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwgd2hlcmUgZmFsc2VcbiAgICAgIG9yZGVyIGJ5IHMsIHYsIG9cbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX3RvcF90cmlwbGVzIGFzXG4gICAgICBzZWxlY3QgKiBmcm9tIGp6cl90cmlwbGVzXG4gICAgICB3aGVyZSByYW5rID0gMVxuICAgICAgb3JkZXIgYnkgcywgdiwgb1xuICAgICAgO1wiXCJcIlxuXG4gICAgIyAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICMgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9mb3JtdWxhcyAoXG4gICAgIyAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAjICAgICByZWYgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICMgICAgIGdseXBoICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgIyAgICAgZm9ybXVsYSAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcblxuICAgICMgICApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2NvbXBvbmVudHMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByZWYgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBsZXZlbCAgICAgaW50ZWdlciAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBsbnIgICAgICAgaW50ZWdlciAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBybnIgICAgICAgaW50ZWdlciAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBnbHlwaCAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBjb21wb25lbnQgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjRcIiBmb3JlaWduIGtleSAoIHJlZiApIHJlZmVyZW5jZXMganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjVcIiBjaGVjayAoICggbGVuZ3RoKCBnbHlwaCAgICAgKSA9IDEgKSBvciAoIGdseXBoICAgICAgcmVnZXhwICdeJltcXFxcLWEtejAtOV9dKyNbMC05YS1mXXs0LDZ9OyQnICkgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzI2XCIgY2hlY2sgKCAoIGxlbmd0aCggY29tcG9uZW50ICkgPSAxICkgb3IgKCBjb21wb25lbnQgIHJlZ2V4cCAnXiZbXFxcXC1hLXowLTlfXSsjWzAtOWEtZl17NCw2fTskJyApICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18yN1wiIGNoZWNrICggcm93aWQgcmVnZXhwICdeLiokJyApXG4gICAgICApO1wiXCJcIlxuXG5cbiAgICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICMjI1xuXG4gICAgICAubyAgLm84OG8uICAgICAgICAgICAgICAgICAgICAgICBvb29vICAgICAgLiAgICAgICAgICAgIG8uXG4gICAgIC44JyAgODg4IGBcIiAgICAgICAgICAgICAgICAgICAgICAgYDg4OCAgICAubzggICAgICAgICAgICBgOC5cbiAgICAuOCcgIG84ODhvbyAgIC5vb29vLiAgIG9vb28gIG9vb28gICA4ODggIC5vODg4b28gIC5vb29vLm8gIGA4LlxuICAgIDg4ICAgIDg4OCAgICBgUCAgKTg4YiAgYDg4OCAgYDg4OCAgIDg4OCAgICA4ODggICBkODgoICBcIjggICA4OFxuICAgIDg4ICAgIDg4OCAgICAgLm9QXCI4ODggICA4ODggICA4ODggICA4ODggICAgODg4ICAgYFwiWTg4Yi4gICAgODhcbiAgICBgOC4gICA4ODggICAgZDgoICA4ODggICA4ODggICA4ODggICA4ODggICAgODg4IC4gby4gICk4OGIgIC44J1xuICAgICBgOC4gbzg4OG8gICBgWTg4OFwiXCI4byAgYFY4OFZcIlY4UCcgbzg4OG8gICBcIjg4OFwiIDhcIlwiODg4UCcgLjgnXG4gICAgICBgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIidcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4gICAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMgYXMgc2VsZWN0XG4gICAgICAgIG1sLnJvd2lkICBhcyByb3dpZCxcbiAgICAgICAgbWwucmVmICAgIGFzIHJlZixcbiAgICAgICAgbWwubGluZSAgIGFzIGxpbmVcbiAgICAgIGZyb20ganpyX21pcnJvcl9saW5lcyBhcyBtbFxuICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICBhbmQgKCBub3QgaXNfdWNfbm9ybWFsKCBtbC5saW5lICkgKVxuICAgICAgb3JkZXIgYnkgbWwucm93aWQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV9rcl9yZWFkaW5nc191bmtub3duX3ZlcmJfZmF1bHRzIGFzIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIGNvdW50KCopIG92ZXIgKCBwYXJ0aXRpb24gYnkgdiApICAgIGFzIGNvdW50LFxuICAgICAgICAgICdqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzOlI9KicgIGFzIHJvd2lkLFxuICAgICAgICAgICcqJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAndW5rbm93bi12ZXJiJyAgICAgICAgICAgICAgICAgICAgICBhcyBkZXNjcmlwdGlvbixcbiAgICAgICAgICB2ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBxdW90ZVxuICAgICAgICBmcm9tIGp6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXMgYXMgbm5cbiAgICAgICAgd2hlcmUgbm90IGV4aXN0cyAoIHNlbGVjdCAxIGZyb20ganpyX21pcnJvcl92ZXJicyBhcyB2YiB3aGVyZSB2Yi52ID0gbm4udiApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBfanpyX21ldGFfZXJyb3JfdmVyYl9mYXVsdHMgYXMgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgY291bnQoKikgb3ZlciAoIHBhcnRpdGlvbiBieSB2ICkgICAgYXMgY291bnQsXG4gICAgICAgICAgJ2Vycm9yOlI9KicgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgICAgcm93aWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICdlcnJvci12ZXJiJyAgICAgICAgICAgICAgICAgICAgICAgIGFzIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICd2OicgfHwgdiB8fCAnLCBvOicgfHwgbyAgICAgICAgICAgIGFzIHF1b3RlXG4gICAgICAgIGZyb20ganpyX3RyaXBsZXMgYXMgbm5cbiAgICAgICAgd2hlcmUgdiBsaWtlICclOmVycm9yJztcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcgX2p6cl9tZXRhX21pcnJvcl9saW5lc193aGl0ZXNwYWNlX2ZhdWx0cyBhcyBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICAxICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBjb3VudCxcbiAgICAgICAgICAndDptcjpsbjpqZmllbGRzOndzOlI9KicgICAgICAgICAgICAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgICBtbC5yb3dpZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgJ2V4dHJhbmVvdXMtd2hpdGVzcGFjZScgICAgICAgICAgICAgICAgICAgICAgYXMgZGVzY3JpcHRpb24sXG4gICAgICAgICAgbWwuamZpZWxkcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcXVvdGVcbiAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzIGFzIG1sXG4gICAgICAgIHdoZXJlICggaGFzX3BlcmlwaGVyYWxfd3NfaW5famZpZWxkKCBqZmllbGRzICkgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcgX2p6cl9tZXRhX21pcnJvcl9saW5lc193aXRoX2Vycm9ycyBhcyBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICAxICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBjb3VudCxcbiAgICAgICAgICAndDptcjpsbjpqZmllbGRzOndzOlI9KicgICAgICAgICAgICAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgICBtbC5yb3dpZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgJ2Vycm9yJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZGVzY3JpcHRpb24sXG4gICAgICAgICAgbWwubGluZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcXVvdGVcbiAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzIGFzIG1sXG4gICAgICAgIHdoZXJlICggbWwubGNvZGUgPSAnRScgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX21ldGFfZmF1bHRzIGFzXG4gICAgICBzZWxlY3QgbnVsbCBhcyBjb3VudCwgbnVsbCBhcyByb3dpZCwgbnVsbCBhcyByZWYsIG51bGwgYXMgZGVzY3JpcHRpb24sIG51bGwgIGFzIHF1b3RlIHdoZXJlIGZhbHNlIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgMSwgcm93aWQsIHJlZiwgICd1Yy1ub3JtYWxpemF0aW9uJywgbGluZSAgYXMgcXVvdGUgZnJvbSBfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMgICAgICAgICAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSBfanpyX21ldGFfa3JfcmVhZGluZ3NfdW5rbm93bl92ZXJiX2ZhdWx0cyAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSBfanpyX21ldGFfZXJyb3JfdmVyYl9mYXVsdHMgICAgICAgICAgICAgICAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSBfanpyX21ldGFfbWlycm9yX2xpbmVzX3doaXRlc3BhY2VfZmF1bHRzICAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSBfanpyX21ldGFfbWlycm9yX2xpbmVzX3dpdGhfZXJyb3JzICAgICAgICAgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsIHdoZXJlIGZhbHNlXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX3N5bGxhYmxlcyBhcyBzZWxlY3RcbiAgICAjICAgICAgIHQxLnNcbiAgICAjICAgICAgIHQxLnZcbiAgICAjICAgICAgIHQxLm9cbiAgICAjICAgICAgIHRpLnMgYXMgaW5pdGlhbF9oYW5nXG4gICAgIyAgICAgICB0bS5zIGFzIG1lZGlhbF9oYW5nXG4gICAgIyAgICAgICB0Zi5zIGFzIGZpbmFsX2hhbmdcbiAgICAjICAgICAgIHRpLm8gYXMgaW5pdGlhbF9sYXRuXG4gICAgIyAgICAgICB0bS5vIGFzIG1lZGlhbF9sYXRuXG4gICAgIyAgICAgICB0Zi5vIGFzIGZpbmFsX2xhdG5cbiAgICAjICAgICBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHQxXG4gICAgIyAgICAgam9pblxuICAgICMgICAgIGpvaW4ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgdGkgb24gKCB0MS4pXG4gICAgIyAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyMjIGFnZ3JlZ2F0ZSB0YWJsZSBmb3IgYWxsIHJvd2lkcyBnb2VzIGhlcmUgIyMjXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMjI1xuXG4gICAgICAgICAgICAgICAuICAgICAgICAgICAgICAgICAuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLlxuICAgICAgICAgICAgIC5vOCAgICAgICAgICAgICAgIC5vOCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubzhcbiAgIC5vb29vLm8gLm84ODhvbyAgLm9vb28uICAgLm84ODhvbyAgLm9vb29vLiAgb29vLiAub28uICAub28uICAgIC5vb29vby4gIG9vby4gLm9vLiAgIC5vODg4b28gIC5vb29vLm9cbiAgZDg4KCAgXCI4ICAgODg4ICAgYFAgICk4OGIgICAgODg4ICAgZDg4JyBgODhiIGA4ODhQXCJZODhiUFwiWTg4YiAgZDg4JyBgODhiIGA4ODhQXCJZODhiICAgIDg4OCAgIGQ4OCggIFwiOFxuICBgXCJZODhiLiAgICA4ODggICAgLm9QXCI4ODggICAgODg4ICAgODg4b29vODg4ICA4ODggICA4ODggICA4ODggIDg4OG9vbzg4OCAgODg4ICAgODg4ICAgIDg4OCAgIGBcIlk4OGIuXG4gIG8uICApODhiICAgODg4IC4gZDgoICA4ODggICAgODg4IC4gODg4ICAgIC5vICA4ODggICA4ODggICA4ODggIDg4OCAgICAubyAgODg4ICAgODg4ICAgIDg4OCAuIG8uICApODhiXG4gIDhcIlwiODg4UCcgICBcIjg4OFwiIGBZODg4XCJcIjhvICAgXCI4ODhcIiBgWThib2Q4UCcgbzg4OG8gbzg4OG8gbzg4OG8gYFk4Ym9kOFAnIG84ODhvIG84ODhvICAgXCI4ODhcIiA4XCJcIjg4OFAnXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBzdGF0ZW1lbnRzOlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX2dseXBocmFuZ2U6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX2dseXBocmFuZ2VzICggcnNnLCBpc19jamssIGxvLCBoaSwgbmFtZSApIHZhbHVlcyAoICRyc2csICRpc19jamssICRsbywgJGhpLCAkbmFtZSApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggZHNrZXkgKSBkbyB1cGRhdGUgc2V0IHBhdGggPSBleGNsdWRlZC5wYXRoXG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdDogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfZGF0YXNvdXJjZV9mb3JtYXRzICggZm9ybWF0LCBjb21tZW50ICkgdmFsdWVzICggJGZvcm1hdCwgJGNvbW1lbnQgKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIGRza2V5ICkgZG8gdXBkYXRlIHNldCBwYXRoID0gZXhjbHVkZWQucGF0aFxuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfZGF0YXNvdXJjZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfZGF0YXNvdXJjZXMgKCBkc2tleSwgZm9ybWF0LCBwYXRoICkgdmFsdWVzICggJGRza2V5LCAkZm9ybWF0LCAkcGF0aCApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggZHNrZXkgKSBkbyB1cGRhdGUgc2V0IHBhdGggPSBleGNsdWRlZC5wYXRoXG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9taXJyb3JfdmVyYjogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3ZlcmJzICggcmFuaywgcywgdiwgbyApIHZhbHVlcyAoICRyYW5rLCAkcywgJHYsICRvIClcbiAgICAgICAgLS0gb24gY29uZmxpY3QgKCByb3dpZCApIGRvIHVwZGF0ZSBzZXQgcmFuayA9IGV4Y2x1ZGVkLnJhbmssIHMgPSBleGNsdWRlZC5zLCB2ID0gZXhjbHVkZWQudiwgbyA9IGV4Y2x1ZGVkLm9cbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX21pcnJvcl9sY29kZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX2xjb2RlcyAoIHJvd2lkLCBsY29kZSwgY29tbWVudCApIHZhbHVlcyAoICRyb3dpZCwgJGxjb2RlLCAkY29tbWVudCApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcm93aWQgKSBkbyB1cGRhdGUgc2V0IGxjb2RlID0gZXhjbHVkZWQubGNvZGUsIGNvbW1lbnQgPSBleGNsdWRlZC5jb21tZW50XG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9taXJyb3JfdHJpcGxlOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICggcm93aWQsIHJlZiwgcywgdiwgbyApIHZhbHVlcyAoICRyb3dpZCwgJHJlZiwgJHMsICR2LCAkbyApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcmVmLCBzLCB2LCBvICkgZG8gbm90aGluZ1xuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9taXJyb3JfbGluZXM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl9saW5lcyAoIGRza2V5LCBsaW5lX25yLCBsY29kZSwgbGluZSwgamZpZWxkcyApXG4gICAgICBzZWxlY3RcbiAgICAgICAgLS0gJ3Q6bXI6bG46Uj0nIHx8IHJvd19udW1iZXIoKSBvdmVyICgpICAgICAgICAgIGFzIHJvd2lkLFxuICAgICAgICAtLSBkcy5kc2tleSB8fCAnOkw9JyB8fCBmbC5saW5lX25yICAgYXMgcm93aWQsXG4gICAgICAgIGRzLmRza2V5ICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBkc2tleSxcbiAgICAgICAgZmwubGluZV9uciAgICAgICAgICAgICAgICAgICAgICAgIGFzIGxpbmVfbnIsXG4gICAgICAgIGZsLmxjb2RlICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBsY29kZSxcbiAgICAgICAgZmwubGluZSAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGxpbmUsXG4gICAgICAgIGZsLmpmaWVsZHMgICAgICAgICAgICAgICAgICAgICAgICBhcyBqZmllbGRzXG4gICAgICBmcm9tIGp6cl9kYXRhc291cmNlcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBkc1xuICAgICAgam9pbiBqenJfZGF0YXNvdXJjZV9mb3JtYXRzICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZGYgdXNpbmcgKCBmb3JtYXQgKVxuICAgICAgam9pbiB3YWxrX2ZpbGVfbGluZXMoIGRzLmRza2V5LCBkZi5mb3JtYXQsIGRzLnBhdGggKSAgYXMgZmxcbiAgICAgIHdoZXJlIHRydWVcbiAgICAgIC0tIG9uIGNvbmZsaWN0ICggZHNrZXksIGxpbmVfbnIgKSBkbyB1cGRhdGUgc2V0IGxpbmUgPSBleGNsdWRlZC5saW5lXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlczogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoIHJvd2lkLCByZWYsIHMsIHYsIG8gKVxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICAgIGd0LnJvd2lkX291dCAgICBhcyByb3dpZCxcbiAgICAgICAgICAgIGd0LnJlZiAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgICBndC5zICAgICAgICAgICAgYXMgcyxcbiAgICAgICAgICAgIGd0LnYgICAgICAgICAgICBhcyB2LFxuICAgICAgICAgICAgZ3QubyAgICAgICAgICAgIGFzIG9cbiAgICAgICAgICBmcm9tIGp6cl9taXJyb3JfbGluZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbWxcbiAgICAgICAgICBqb2luIGdldF90cmlwbGVzKCBtbC5yb3dpZCwgbWwuZHNrZXksIG1sLmpmaWVsZHMgKSAgYXMgZ3RcbiAgICAgICAgICB3aGVyZSB0cnVlXG4gICAgICAgICAgICBhbmQgKCBtbC5sY29kZSA9ICdEJyApXG4gICAgICAgICAgICAtLSBhbmQgKCBtbC5kc2tleSA9ICdkczpkaWN0Om1lYW5pbmdzJyApXG4gICAgICAgICAgICBhbmQgKCBtbC5qZmllbGRzIGlzIG5vdCBudWxsIClcbiAgICAgICAgICAgIGFuZCAoIG1sLmpmaWVsZHMtPj4nJFswXScgbm90IHJlZ2V4cCAnXkBnbHlwaHMnIClcbiAgICAgICAgICAgIC0tIGFuZCAoIG1sLmZpZWxkXzMgcmVnZXhwICdeKD86cHl8aGl8a2EpOicgKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIHJlZiwgcywgdiwgbyApIGRvIG5vdGhpbmdcbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbGFuZ19oYW5nZXVsX3N5bGxhYmxlczogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyAoIHJvd2lkLCByZWYsXG4gICAgICAgIHN5bGxhYmxlX2hhbmcsIGluaXRpYWxfaGFuZywgbWVkaWFsX2hhbmcsIGZpbmFsX2hhbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsX2xhdG4sIG1lZGlhbF9sYXRuLCBmaW5hbF9sYXRuIClcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICAndDpsYW5nOmhhbmc6c3lsOlY9JyB8fCBtdC5vICAgICAgICAgIGFzIHJvd2lkLFxuICAgICAgICAgICAgbXQucm93aWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgICBtdC5vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHN5bGxhYmxlX2hhbmcsXG4gICAgICAgICAgICBkaC5pbml0aWFsICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGluaXRpYWxfaGFuZyxcbiAgICAgICAgICAgIGRoLm1lZGlhbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbWVkaWFsX2hhbmcsXG4gICAgICAgICAgICBkaC5maW5hbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGZpbmFsX2hhbmcsXG4gICAgICAgICAgICBjb2FsZXNjZSggbXRpLm8sICcnICkgICAgICAgICAgICAgICAgIGFzIGluaXRpYWxfbGF0bixcbiAgICAgICAgICAgIGNvYWxlc2NlKCBtdG0ubywgJycgKSAgICAgICAgICAgICAgICAgYXMgbWVkaWFsX2xhdG4sXG4gICAgICAgICAgICBjb2FsZXNjZSggbXRmLm8sICcnICkgICAgICAgICAgICAgICAgIGFzIGZpbmFsX2xhdG5cbiAgICAgICAgICBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICAgICAgICAgICAgIGFzIG10XG4gICAgICAgICAgbGVmdCBqb2luIGRpc2Fzc2VtYmxlX2hhbmdldWwoIG10Lm8gKSAgICBhcyBkaFxuICAgICAgICAgIGxlZnQgam9pbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyBtdGkgb24gKCBtdGkucyA9IGRoLmluaXRpYWwgYW5kIG10aS52ID0gJ3Y6eDprby1IYW5nK0xhdG46aW5pdGlhbCcgKVxuICAgICAgICAgIGxlZnQgam9pbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyBtdG0gb24gKCBtdG0ucyA9IGRoLm1lZGlhbCAgYW5kIG10bS52ID0gJ3Y6eDprby1IYW5nK0xhdG46bWVkaWFsJyAgKVxuICAgICAgICAgIGxlZnQgam9pbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyBtdGYgb24gKCBtdGYucyA9IGRoLmZpbmFsICAgYW5kIG10Zi52ID0gJ3Y6eDprby1IYW5nK0xhdG46ZmluYWwnICAgKVxuICAgICAgICAgIHdoZXJlIHRydWVcbiAgICAgICAgICAgIGFuZCAoIG10LnYgPSAndjpjOnJlYWRpbmc6a28tSGFuZycgKVxuICAgICAgICAgIG9yZGVyIGJ5IG10Lm9cbiAgICAgICAgLS0gb24gY29uZmxpY3QgKCByb3dpZCAgICAgICAgICkgZG8gbm90aGluZ1xuICAgICAgICAvKiAjIyMgTk9URSBgb24gY29uZmxpY3RgIG5lZWRlZCBiZWNhdXNlIHdlIGxvZyBhbGwgYWN0dWFsbHkgb2NjdXJyaW5nIHJlYWRpbmdzIG9mIGFsbCBjaGFyYWN0ZXJzICovXG4gICAgICAgIG9uIGNvbmZsaWN0ICggc3lsbGFibGVfaGFuZyApIGRvIG5vdGhpbmdcbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfZ2x5cGhyYW5nZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfZ2x5cGhyYW5nZXMgKCByc2csIGlzX2NqaywgbG8sIGhpLCBuYW1lIClcbiAgICAgIHNlbGVjdFxuICAgICAgICAtLSAndDptcjpsbjpSPScgfHwgcm93X251bWJlcigpIG92ZXIgKCkgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgIC0tIGRzLmRza2V5IHx8ICc6TD0nIHx8IGZsLmxpbmVfbnIgICBhcyByb3dpZCxcbiAgICAgICAgZ3IucnNnICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJzZyxcbiAgICAgICAgZ3IuaXNfY2prICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGlzX2NqayxcbiAgICAgICAgLS0gcmVmXG4gICAgICAgIGdyLmxvICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBsbyxcbiAgICAgICAgZ3IuaGkgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGhpLFxuICAgICAgICBnci5uYW1lICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbmFtZVxuICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBtbFxuICAgICAgam9pbiBwYXJzZV91Y2RiX3JzZ3NfZ2x5cGhyYW5nZSggbWwuZHNrZXksIG1sLmxpbmVfbnIsIG1sLmpmaWVsZHMgKSBhcyBnclxuICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICBhbmQgKCBtbC5kc2tleSA9ICdkczp1Y2RiOnJzZ3MnIClcbiAgICAgICAgYW5kICggbWwubGNvZGUgPSAnRCcgKVxuICAgICAgb3JkZXIgYnkgbWwubGluZV9uclxuICAgICAgLS0gb24gY29uZmxpY3QgKCBkc2tleSwgbGluZV9uciApIGRvIHVwZGF0ZSBzZXQgbGluZSA9IGV4Y2x1ZGVkLmxpbmVcbiAgICAgIDtcIlwiXCJcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICMjI1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb29vbyAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYDg4OCAgICAgICAgICAgICAgLm84XG4gIG9vLm9vb29vLiAgIC5vb29vby4gIG9vLm9vb29vLiAgb29vbyAgb29vbyAgIDg4OCAgIC5vb29vLiAgIC5vODg4b28gIC5vb29vby5cbiAgIDg4OCcgYDg4YiBkODgnIGA4OGIgIDg4OCcgYDg4YiBgODg4ICBgODg4ICAgODg4ICBgUCAgKTg4YiAgICA4ODggICBkODgnIGA4OGJcbiAgIDg4OCAgIDg4OCA4ODggICA4ODggIDg4OCAgIDg4OCAgODg4ICAgODg4ICAgODg4ICAgLm9QXCI4ODggICAgODg4ICAgODg4b29vODg4XG4gICA4ODggICA4ODggODg4ICAgODg4ICA4ODggICA4ODggIDg4OCAgIDg4OCAgIDg4OCAgZDgoICA4ODggICAgODg4IC4gODg4ICAgIC5vXG4gICA4ODhib2Q4UCcgYFk4Ym9kOFAnICA4ODhib2Q4UCcgIGBWODhWXCJWOFAnIG84ODhvIGBZODg4XCJcIjhvICAgXCI4ODhcIiBgWThib2Q4UCdcbiAgIDg4OCAgICAgICAgICAgICAgICAgIDg4OFxuICBvODg4byAgICAgICAgICAgICAgICBvODg4b1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xjb2RlczogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzI4JywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGNvZGVzJ1xuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPUInLCBsY29kZTogJ0InLCBjb21tZW50OiAnYmxhbmsgbGluZScsICAgIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl9sY29kZS5ydW4geyByb3dpZDogJ3Q6bXI6bGM6Vj1DJywgbGNvZGU6ICdDJywgY29tbWVudDogJ2NvbW1lbnQgbGluZScsICB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0Om1yOmxjOlY9RCcsIGxjb2RlOiAnRCcsIGNvbW1lbnQ6ICdkYXRhIGxpbmUnLCAgICAgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPUUnLCBsY29kZTogJ0UnLCBjb21tZW50OiAnZXJyb3InLCAgICAgICAgIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl9sY29kZS5ydW4geyByb3dpZDogJ3Q6bXI6bGM6Vj1VJywgbGNvZGU6ICdVJywgY29tbWVudDogJ3Vua25vd24nLCAgICAgICB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdmVyYnM6IC0+XG4gICAgIyMjIE5PVEVcbiAgICBpbiB2ZXJicywgaW5pdGlhbCBjb21wb25lbnQgaW5kaWNhdGVzIHR5cGUgb2Ygc3ViamVjdDpcbiAgICAgIGB2OmM6YCBpcyBmb3Igc3ViamVjdHMgdGhhdCBhcmUgQ0pLIGNoYXJhY3RlcnNcbiAgICAgIGB2Ong6YCBpcyB1c2VkIGZvciB1bmNsYXNzaWZpZWQgc3ViamVjdHMgKHBvc3NpYmx5IHRvIGJlIHJlZmluZWQgaW4gdGhlIGZ1dHVyZSlcbiAgICAjIyNcbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzI5JywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdmVyYnMnXG4gICAgcm93cyA9IFtcbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjp0ZXN0aW5nOnVudXNlZCcsICAgICAgICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2Ong6a28tSGFuZytMYXRuOmluaXRpYWwnLCAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6eDprby1IYW5nK0xhdG46bWVkaWFsJywgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjp4OmtvLUhhbmcrTGF0bjpmaW5hbCcsICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzp6aC1MYXRuLXBpbnlpbicsICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmphLXgtS2FuJywgICAgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6amEteC1IaXInLCAgICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzpqYS14LUthdCcsICAgICAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmphLXgtTGF0bicsICAgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6amEteC1IaXIrTGF0bicsICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzpqYS14LUthdCtMYXRuJywgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmtvLUhhbmcnLCAgICAgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6a28tTGF0bicsICAgICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzprby1IYW5nOmluaXRpYWwnLCAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmtvLUhhbmc6bWVkaWFsJywgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6a28tSGFuZzpmaW5hbCcsICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzprby1MYXRuOmluaXRpYWwnLCAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmtvLUxhdG46bWVkaWFsJywgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6a28tTGF0bjpmaW5hbCcsICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6c2hhcGU6aWRzOmZvcm11bGE6c2hvcnRlc3QnLCAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpzaGFwZTppZHM6Zm9ybXVsYTpzaG9ydGVzdDphc3QnLCAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnNoYXBlOmlkczpmb3JtdWxhOnNob3J0ZXN0OmVycm9yJywgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6c2hhcGU6aWRzOmhhcy1vcGVyYXRvcicsICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpzaGFwZTppZHM6aGFzLWNvbXBvbmVudCcsICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnNoYXBlOmlkczpjb21wb25lbnRzJywgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgXVxuICAgIGZvciByb3cgaW4gcm93c1xuICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfdmVyYi5ydW4gcm93XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlX2Zvcm1hdHM6IC0+XG4gICAgZGVidWcgJ86panpyc2RiX18zMCcsICdfb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZV9mb3JtYXRzJ1xuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZV9mb3JtYXQucnVuIHsgZm9ybWF0OiAnZHNmOnRzdicsICAgICAgIGNvbW1lbnQ6ICdOTicsIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2VfZm9ybWF0LnJ1biB7IGZvcm1hdDogJ2RzZjptZDp0YWJsZScsICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdkc2Y6Y3N2JywgICAgICAgY29tbWVudDogJ05OJywgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZV9mb3JtYXQucnVuIHsgZm9ybWF0OiAnZHNmOmpzb24nLCAgICAgIGNvbW1lbnQ6ICdOTicsIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2VfZm9ybWF0LnJ1biB7IGZvcm1hdDogJ2RzZjptZCcsICAgICAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdkc2Y6dHh0JywgICAgICAgY29tbWVudDogJ05OJywgfVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZXM6IC0+XG4gICAgZGVidWcgJ86panpyc2RiX18zMScsICdfb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZXMnXG4gICAgeyBwYXRoc1xuICAgICAgZm9ybWF0cywgfSA9IGdldF9wYXRoc19hbmRfZm9ybWF0cygpXG4gICAgIyBkc2tleSA9ICdkczpkaWN0OnVjZDp2MTQuMDp1aGRpZHgnOyAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTInLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIGRza2V5ID0gJ2RzOmRpY3Q6bWVhbmluZ3MnOyAgICAgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIGRza2V5ID0gJ2RzOmRpY3Q6eDprby1IYW5nK0xhdG4nOyAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTInLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIGRza2V5ID0gJ2RzOmRpY3Q6eDpqYS1LYW4rTGF0bic7ICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTMnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZHM6ZGljdDpqYTprYW5qaXVtJzsgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9NCcsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkczpkaWN0OmphOmthbmppdW06YXV4JzsgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj01JywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICAjIGRza2V5ID0gJ2RzOmRpY3Q6a286Vj1kYXRhLWdvdi5jc3YnOyAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTYnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZHM6ZGljdDprbzpWPWRhdGEtZ292Lmpzb24nOyAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9NycsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkczpkaWN0OmtvOlY9ZGF0YS1uYXZlci5jc3YnOyAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj04JywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICAjIGRza2V5ID0gJ2RzOmRpY3Q6a286Vj1kYXRhLW5hdmVyLmpzb24nOyAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTknLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZHM6ZGljdDprbzpWPVJFQURNRS5tZCc7ICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MTAnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIGRza2V5ID0gJ2RzOnNoYXBlOmlkc3YyJzsgICAgICAgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTExJywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkczpzaGFwZTp6aHo1YmYnOyAgICAgICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xMicsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6dWNkYjpyc2dzJzsgICAgICAgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MTMnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIDtudWxsXG5cbiAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgX29uX29wZW5fcG9wdWxhdGVfdmVyYnM6IC0+XG4gICMgICBwYXRocyA9IGdldF9wYXRoc19hbmRfZm9ybWF0cygpXG4gICMgICBkc2tleSA9ICdkczpkaWN0Om1lYW5pbmdzJzsgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEnLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgIyAgIGRza2V5ID0gJ2RzOmRpY3Q6dWNkOnYxNC4wOnVoZGlkeCc7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MicsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAjICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGluZXM6IC0+XG4gICAgZGVidWcgJ86panpyc2RiX18zMicsICdfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzJ1xuICAgIEBzdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9taXJyb3JfbGluZXMucnVuKClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX2dseXBocmFuZ2U6IC0+XG4gICAgZGVidWcgJ86panpyc2RiX18zMycsICdfb25fb3Blbl9wb3B1bGF0ZV9qenJfZ2x5cGhyYW5nZSdcbiAgICBAc3RhdGVtZW50cy5wb3B1bGF0ZV9qenJfZ2x5cGhyYW5nZS5ydW4oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQ6ICggbmFtZSwgZmllbGRzLi4uICkgLT5cbiAgICAjIGRlYnVnICfOqWp6cnNkYl9fMzQnLCB7IG5hbWUsIGZpZWxkcywgfVxuICAgIEBzdGF0ZS5tb3N0X3JlY2VudF9pbnNlcnRlZF9yb3cgPSB7IG5hbWUsIGZpZWxkcywgfVxuICAgIDtudWxsXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAjIyNcblxuICBvb29vbyAgICAgb29vIG9vb29vb29vb28uICAgb29vb29vb29vb29vXG4gIGA4ODgnICAgICBgOCcgYDg4OCcgICBgWThiICBgODg4JyAgICAgYDhcbiAgIDg4OCAgICAgICA4ICAgODg4ICAgICAgODg4ICA4ODggICAgICAgICAgLm9vb28ub1xuICAgODg4ICAgICAgIDggICA4ODggICAgICA4ODggIDg4OG9vb284ICAgIGQ4OCggIFwiOFxuICAgODg4ICAgICAgIDggICA4ODggICAgICA4ODggIDg4OCAgICBcIiAgICBgXCJZODhiLlxuICAgYDg4LiAgICAuOCcgICA4ODggICAgIGQ4OCcgIDg4OCAgICAgICAgIG8uICApODhiXG4gICAgIGBZYm9kUCcgICAgbzg4OGJvb2Q4UCcgICBvODg4byAgICAgICAgOFwiXCI4ODhQJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBAZnVuY3Rpb25zOlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQ6XG4gICAgICAjIyMgTk9URSBpbiB0aGUgZnV0dXJlIHRoaXMgZnVuY3Rpb24gY291bGQgdHJpZ2dlciBjcmVhdGlvbiBvZiB0cmlnZ2VycyBvbiBpbnNlcnRzICMjI1xuICAgICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAgIHZhcmFyZ3M6ICAgICAgICB0cnVlXG4gICAgICBjYWxsOiAoIG5hbWUsIGZpZWxkcy4uLiApIC0+IEB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQgbmFtZSwgZmllbGRzLi4uXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMjIyBOT1RFIG1vdmVkIHRvIERicmljX3N0ZDsgY29uc2lkZXIgdG8gb3ZlcndyaXRlIHdpdGggdmVyc2lvbiB1c2luZyBgc2xldml0aGFuL3JlZ2V4YCAjIyNcbiAgICAjIHJlZ2V4cDpcbiAgICAjICAgb3ZlcndyaXRlOiAgICAgIHRydWVcbiAgICAjICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAjICAgY2FsbDogKCBwYXR0ZXJuLCB0ZXh0ICkgLT4gaWYgKCAoIG5ldyBSZWdFeHAgcGF0dGVybiwgJ3YnICkudGVzdCB0ZXh0ICkgdGhlbiAxIGVsc2UgMFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBpc191Y19ub3JtYWw6XG4gICAgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICAgIyMjIE5PVEU6IGFsc28gc2VlIGBTdHJpbmc6OmlzV2VsbEZvcm1lZCgpYCAjIyNcbiAgICAgIGNhbGw6ICggdGV4dCwgZm9ybSA9ICdORkMnICkgLT4gZnJvbV9ib29sIHRleHQgaXMgdGV4dC5ub3JtYWxpemUgZm9ybSAjIyMgJ05GQycsICdORkQnLCAnTkZLQycsIG9yICdORktEJyAjIyNcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaGFzX3BlcmlwaGVyYWxfd3NfaW5famZpZWxkOlxuICAgICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAgIGNhbGw6ICggamZpZWxkc19qc29uICkgLT5cbiAgICAgICAgcmV0dXJuIGZyb21fYm9vbCBmYWxzZSB1bmxlc3MgKCBqZmllbGRzID0gSlNPTi5wYXJzZSBqZmllbGRzX2pzb24gKT9cbiAgICAgICAgcmV0dXJuIGZyb21fYm9vbCBmYWxzZSB1bmxlc3MgKCB0eXBlX29mIGpmaWVsZHMgKSBpcyAnbGlzdCdcbiAgICAgICAgcmV0dXJuIGZyb21fYm9vbCBqZmllbGRzLnNvbWUgKCB2YWx1ZSApIC0+IC8oXlxccyl8KFxccyQpLy50ZXN0IHZhbHVlXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBAdGFibGVfZnVuY3Rpb25zOlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBzcGxpdF93b3JkczpcbiAgICAgIGNvbHVtbnM6ICAgICAgWyAna2V5d29yZCcsIF1cbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAnbGluZScsIF1cbiAgICAgIHJvd3M6ICggbGluZSApIC0+XG4gICAgICAgIGtleXdvcmRzID0gbGluZS5zcGxpdCAvKD86XFxwe1p9Kyl8KCg/OlxccHtTY3JpcHQ9SGFufSl8KD86XFxwe0x9Kyl8KD86XFxwe059Kyl8KD86XFxwe1N9KykpL3ZcbiAgICAgICAgZm9yIGtleXdvcmQgaW4ga2V5d29yZHNcbiAgICAgICAgICBjb250aW51ZSB1bmxlc3Mga2V5d29yZD9cbiAgICAgICAgICBjb250aW51ZSBpZiBrZXl3b3JkIGlzICcnXG4gICAgICAgICAgeWllbGQgeyBrZXl3b3JkLCB9XG4gICAgICAgIDtudWxsXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIHdhbGtfZmlsZV9saW5lczpcbiAgICAgIGNvbHVtbnM6ICAgICAgWyAnbGluZV9ucicsICdsY29kZScsICdsaW5lJywgJ2pmaWVsZHMnIF1cbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAnZHNrZXknLCAnZm9ybWF0JywgJ3BhdGgnLCBdXG4gICAgICByb3dzOiAoIGRza2V5LCBmb3JtYXQsIHBhdGggKSAtPlxuICAgICAgICB5aWVsZCBmcm9tIG5ldyBEYXRhc291cmNlX2ZpZWxkX3BhcnNlciB7IGhvc3Q6IEBob3N0LCBkc2tleSwgZm9ybWF0LCBwYXRoLCB9XG4gICAgICAgIDtudWxsXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGdldF90cmlwbGVzOlxuICAgICAgcGFyYW1ldGVyczogICBbICdyb3dpZF9pbicsICdkc2tleScsICdqZmllbGRzJywgXVxuICAgICAgY29sdW1uczogICAgICBbICdyb3dpZF9vdXQnLCAncmVmJywgJ3MnLCAndicsICdvJywgXVxuICAgICAgcm93czogKCByb3dpZF9pbiwgZHNrZXksIGpmaWVsZHMgKSAtPlxuICAgICAgICBmaWVsZHMgID0gSlNPTi5wYXJzZSBqZmllbGRzXG4gICAgICAgIGVudHJ5ICAgPSBmaWVsZHNbIDIgXVxuICAgICAgICBzd2l0Y2ggZHNrZXlcbiAgICAgICAgICB3aGVuICdkczpkaWN0Ong6a28tSGFuZytMYXRuJyAgICAgICAgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fZGljdF94X2tvX0hhbmdfTGF0biAgICAgICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAgIHdoZW4gJ2RzOmRpY3Q6bWVhbmluZ3MnIHRoZW4gc3dpdGNoIHRydWVcbiAgICAgICAgICAgIHdoZW4gKCBlbnRyeS5zdGFydHNXaXRoICdweTonICkgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX3poX0xhdG5fcGlueWluICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAgICAgd2hlbiAoIGVudHJ5LnN0YXJ0c1dpdGggJ2thOicgKSB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXNfZnJvbV9jX3JlYWRpbmdfamFfeF9LYW4gICAgICAgIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICAgICB3aGVuICggZW50cnkuc3RhcnRzV2l0aCAnaGk6JyApIHRoZW4geWllbGQgZnJvbSBAdHJpcGxlc19mcm9tX2NfcmVhZGluZ19qYV94X0thbiAgICAgICAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgICAgIHdoZW4gKCBlbnRyeS5zdGFydHNXaXRoICdoZzonICkgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX2tvX0hhbmcgICAgICAgICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAgIHdoZW4gJ2RzOnNoYXBlOmlkc3YyJyAgICAgICAgICAgICB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXNfZnJvbV9zaGFwZV9pZHN2MiAgICAgICAgICAgICAgIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICMgeWllbGQgZnJvbSBAZ2V0X3RyaXBsZXMgcm93aWRfaW4sIGRza2V5LCBqZmllbGRzXG4gICAgICAgIDtudWxsXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGRpc2Fzc2VtYmxlX2hhbmdldWw6XG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ2hhbmcnLCBdXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2luaXRpYWwnLCAnbWVkaWFsJywgJ2ZpbmFsJywgXVxuICAgICAgcm93czogKCBoYW5nICkgLT5cbiAgICAgICAgamFtb3MgPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5fVE1QX2hhbmdldWwuZGlzYXNzZW1ibGUgaGFuZywgeyBmbGF0dGVuOiBmYWxzZSwgfVxuICAgICAgICBmb3IgeyBmaXJzdDogaW5pdGlhbCwgdm93ZWw6IG1lZGlhbCwgbGFzdDogZmluYWwsIH0gaW4gamFtb3NcbiAgICAgICAgICB5aWVsZCB7IGluaXRpYWwsIG1lZGlhbCwgZmluYWwsIH1cbiAgICAgICAgO251bGxcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgcGFyc2VfdWNkYl9yc2dzX2dseXBocmFuZ2U6XG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ2Rza2V5JywgJ2xpbmVfbnInLCAnamZpZWxkcycsIF1cbiAgICAgIGNvbHVtbnM6ICAgICAgWyAncnNnJywgJ2lzX2NqaycsICdsbycsICdoaScsICduYW1lJywgXVxuICAgICAgcm93czogKCBkc2tleSwgbGluZV9uciwgamZpZWxkcyApIC0+XG4gICAgICAgIHlpZWxkIGRhdGFzb3VyY2VfZm9ybWF0X3BhcnNlci5wYXJzZV91Y2RiX3JzZ3NfZ2x5cGhyYW5nZSB7IGRza2V5LCBsaW5lX25yLCBqZmllbGRzLCB9XG4gICAgICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlwbGVzX2Zyb21fZGljdF94X2tvX0hhbmdfTGF0bjogKCByb3dpZF9pbiwgZHNrZXksIFsgcm9sZSwgcywgbywgXSApIC0+XG4gICAgcmVmICAgICAgID0gcm93aWRfaW5cbiAgICB2ICAgICAgICAgPSBcInY6eDprby1IYW5nK0xhdG46I3tyb2xlfVwiXG4gICAgbyAgICAgICAgPz0gJydcbiAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHYsIG8sIH1cbiAgICBAc3RhdGUudGltZWl0X3Byb2dyZXNzPygpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaXBsZXNfZnJvbV9jX3JlYWRpbmdfemhfTGF0bl9waW55aW46ICggcm93aWRfaW4sIGRza2V5LCBbIF8sIHMsIGVudHJ5LCBdICkgLT5cbiAgICByZWYgICAgICAgPSByb3dpZF9pblxuICAgIHYgICAgICAgICA9ICd2OmM6cmVhZGluZzp6aC1MYXRuLXBpbnlpbidcbiAgICBmb3IgcmVhZGluZyBmcm9tIEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfYXRvbmFsX3poX3JlYWRpbmdzIGVudHJ5XG4gICAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHYsIG86IHJlYWRpbmcsIH1cbiAgICBAc3RhdGUudGltZWl0X3Byb2dyZXNzPygpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaXBsZXNfZnJvbV9jX3JlYWRpbmdfamFfeF9LYW46ICggcm93aWRfaW4sIGRza2V5LCBbIF8sIHMsIGVudHJ5LCBdICkgLT5cbiAgICByZWYgICAgICAgPSByb3dpZF9pblxuICAgIGlmIGVudHJ5LnN0YXJ0c1dpdGggJ2thOidcbiAgICAgIHZfeF9LYW4gICA9ICd2OmM6cmVhZGluZzpqYS14LUthdCdcbiAgICAgIHZfTGF0biAgICA9ICd2OmM6cmVhZGluZzpqYS14LUthdCtMYXRuJ1xuICAgIGVsc2VcbiAgICAgIHZfeF9LYW4gICA9ICd2OmM6cmVhZGluZzpqYS14LUhpcidcbiAgICAgIHZfTGF0biAgICA9ICd2OmM6cmVhZGluZzpqYS14LUhpcitMYXRuJ1xuICAgIGZvciByZWFkaW5nIGZyb20gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9qYV9yZWFkaW5ncyBlbnRyeVxuICAgICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiB2X3hfS2FuLCBvOiByZWFkaW5nLCB9XG4gICAgICAjIGZvciB0cmFuc2NyaXB0aW9uIGZyb20gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMucm9tYW5pemVfamFfa2FuYSByZWFkaW5nXG4gICAgICAjICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiB2X0xhdG4sIG86IHRyYW5zY3JpcHRpb24sIH1cbiAgICAgIHRyYW5zY3JpcHRpb24gPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5yb21hbml6ZV9qYV9rYW5hIHJlYWRpbmdcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogdl9MYXRuLCBvOiB0cmFuc2NyaXB0aW9uLCB9XG4gICAgQHN0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX2tvX0hhbmc6ICggcm93aWRfaW4sIGRza2V5LCBbIF8sIHMsIGVudHJ5LCBdICkgLT5cbiAgICByZWYgICAgICAgPSByb3dpZF9pblxuICAgIHYgICAgICAgICA9ICd2OmM6cmVhZGluZzprby1IYW5nJ1xuICAgIGZvciByZWFkaW5nIGZyb20gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9oZ19yZWFkaW5ncyBlbnRyeVxuICAgICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2LCBvOiByZWFkaW5nLCB9XG4gICAgQHN0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlwbGVzX2Zyb21fc2hhcGVfaWRzdjI6ICggcm93aWRfaW4sIGRza2V5LCBbIF8sIHMsIGZvcm11bGEsIF0gKSAtPlxuICAgIHJlZiAgICAgICA9IHJvd2lkX2luXG4gICAgIyBmb3IgcmVhZGluZyBmcm9tIEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLnBhcnNlX2lkcyBmb3JtdWxhXG4gICAgIyAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdiwgbzogcmVhZGluZywgfVxuICAgIHJldHVybiBudWxsIGlmICggbm90IGZvcm11bGE/ICkgb3IgKCBmb3JtdWxhIGlzICcnIClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ3Y6YzpzaGFwZTppZHM6Zm9ybXVsYTpzaG9ydGVzdCcsIG86IGZvcm11bGEsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGVycm9yID0gbnVsbFxuICAgIHRyeSBmb3JtdWxhX2FzdCA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLnBhcnNlX2lkbHggZm9ybXVsYSBjYXRjaCBlcnJvclxuICAgICAgbyA9IEpTT04uc3RyaW5naWZ5IHsgcmVmOiAnzqlqenJzZGJfXzM1JywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSwgcm93OiB7IHJvd2lkX2luLCBkc2tleSwgcywgZm9ybXVsYSwgfSwgfVxuICAgICAgd2FybiBcImVycm9yOiAje299XCJcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ3Y6YzpzaGFwZTppZHM6Zm9ybXVsYTpzaG9ydGVzdDplcnJvcicsIG8sIH1cbiAgICByZXR1cm4gbnVsbCBpZiBlcnJvcj9cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGZvcm11bGFfanNvbiAgICA9IEpTT04uc3RyaW5naWZ5IGZvcm11bGFfYXN0XG4gICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiAndjpjOnNoYXBlOmlkczpmb3JtdWxhOnNob3J0ZXN0OmFzdCcsIG86IGZvcm11bGFfanNvbiwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgeyBvcGVyYXRvcnMsXG4gICAgICBjb21wb25lbnRzLCB9ID0gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMub3BlcmF0b3JzX2FuZF9jb21wb25lbnRzX2Zyb21faWRseCBmb3JtdWxhX2FzdFxuICAgIHNlZW5fb3BlcmF0b3JzICA9IG5ldyBTZXQoKVxuICAgIHNlZW5fY29tcG9uZW50cyA9IG5ldyBTZXQoKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgY29tcG9uZW50c19qc29uID0gSlNPTi5zdHJpbmdpZnkgY29tcG9uZW50c1xuICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ3Y6YzpzaGFwZTppZHM6Y29tcG9uZW50cycsIG86IGNvbXBvbmVudHNfanNvbiwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZm9yIG9wZXJhdG9yIGluIG9wZXJhdG9yc1xuICAgICAgY29udGludWUgaWYgc2Vlbl9vcGVyYXRvcnMuaGFzIG9wZXJhdG9yXG4gICAgICBzZWVuX29wZXJhdG9ycy5hZGQgb3BlcmF0b3JcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ3Y6YzpzaGFwZTppZHM6aGFzLW9wZXJhdG9yJywgbzogb3BlcmF0b3IsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGZvciBjb21wb25lbnQgaW4gY29tcG9uZW50c1xuICAgICAgY29udGludWUgaWYgc2Vlbl9jb21wb25lbnRzLmhhcyBjb21wb25lbnRcbiAgICAgIHNlZW5fY29tcG9uZW50cy5hZGQgY29tcG9uZW50XG4gICAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6ICd2OmM6c2hhcGU6aWRzOmhhcy1jb21wb25lbnQnLCBvOiBjb21wb25lbnQsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIEBzdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICA7bnVsbFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyMjXG5cbiAgICAgIC5vOCAgICAgICAgICAgIC5vODhvLlxuICAgICBcIjg4OCAgICAgICAgICAgIDg4OCBgXCJcbiAub29vbzg4OCAgIC5vb29vLm8gbzg4OG9vICAgICBvby5vb29vby4gICAub29vby4gICBvb29vIGQ4YiAgLm9vb28ubyAgLm9vb29vLiAgb29vbyBkOGJcbmQ4OCcgYDg4OCAgZDg4KCAgXCI4ICA4ODggICAgICAgIDg4OCcgYDg4YiBgUCAgKTg4YiAgYDg4OFwiXCI4UCBkODgoICBcIjggZDg4JyBgODhiIGA4ODhcIlwiOFBcbjg4OCAgIDg4OCAgYFwiWTg4Yi4gICA4ODggICAgICAgIDg4OCAgIDg4OCAgLm9QXCI4ODggICA4ODggICAgIGBcIlk4OGIuICA4ODhvb284ODggIDg4OFxuODg4ICAgODg4ICBvLiAgKTg4YiAgODg4ICAgICAgICA4ODggICA4ODggZDgoICA4ODggICA4ODggICAgIG8uICApODhiIDg4OCAgICAubyAgODg4XG5gWThib2Q4OFBcIiA4XCJcIjg4OFAnIG84ODhvICAgICAgIDg4OGJvZDhQJyBgWTg4OFwiXCI4byBkODg4YiAgICA4XCJcIjg4OFAnIGBZOGJvZDhQJyBkODg4YlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA4ODhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvODg4b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIERhdGFzb3VyY2VfZmllbGRfcGFyc2VyXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogKHsgaG9zdCwgZHNrZXksIGZvcm1hdCwgcGF0aCwgfSkgLT5cbiAgICBAaG9zdCAgICAgPSBob3N0XG4gICAgQGRza2V5ICAgID0gZHNrZXlcbiAgICBAZm9ybWF0ICAgPSBmb3JtYXRcbiAgICBAcGF0aCAgICAgPSBwYXRoXG4gICAgO3VuZGVmaW5lZFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgW1N5bWJvbC5pdGVyYXRvcl06IC0+IHlpZWxkIGZyb20gQHdhbGsoKVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgd2FsazogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzM2JywgXCJ3YWxrX2ZpbGVfbGluZXM6XCIsIHsgZm9ybWF0OiBAZm9ybWF0LCBkc2tleTogQGRza2V5LCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBtZXRob2RfbmFtZSA9ICd3YWxrXycgKyBAZm9ybWF0LnJlcGxhY2UgL1teYS16XS9ndiwgJ18nXG4gICAgbWV0aG9kICAgICAgPSBAWyBtZXRob2RfbmFtZSBdID8gQF93YWxrX25vX3N1Y2hfcGFyc2VyXG4gICAgeWllbGQgZnJvbSBtZXRob2QuY2FsbCBAXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF93YWxrX25vX3N1Y2hfcGFyc2VyOiAtPlxuICAgIG1lc3NhZ2UgPSBcIs6panpyc2RiX18zNyBubyBwYXJzZXIgZm91bmQgZm9yIGZvcm1hdCAje3JwciBAZm9ybWF0fVwiXG4gICAgd2FybiBtZXNzYWdlXG4gICAgeWllbGQgeyBsaW5lX25yOiAwLCBsY29kZTogJ0UnLCBsaW5lOiBtZXNzYWdlLCBqZmllbGRzOiBudWxsLCB9XG4gICAgZm9yIHsgbG5yOiBsaW5lX25yLCBsaW5lLCBlb2wsIH0gZnJvbSB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zIEBwYXRoXG4gICAgICB5aWVsZCB7IGxpbmVfbnIsIGxjb2RlOiAnVScsIGxpbmUsIGpmaWVsZHM6IG51bGwsIH1cbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgd2Fsa19kc2ZfdHN2OiAtPlxuICAgIGZvciB7IGxucjogbGluZV9uciwgbGluZSwgZW9sLCB9IGZyb20gd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBAcGF0aFxuICAgICAgbGluZSAgICA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLm5vcm1hbGl6ZV90ZXh0IGxpbmVcbiAgICAgIGpmaWVsZHMgPSBudWxsXG4gICAgICBzd2l0Y2ggdHJ1ZVxuICAgICAgICB3aGVuIC9eXFxzKiQvdi50ZXN0IGxpbmUgdGhlbiBsY29kZSA9ICdCJ1xuICAgICAgICB3aGVuIC9eXFxzKiMvdi50ZXN0IGxpbmUgdGhlbiBsY29kZSA9ICdDJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgbGNvZGUgPSAnRCdcbiAgICAgICAgICBqZmllbGRzICAgPSBKU09OLnN0cmluZ2lmeSBsaW5lLnNwbGl0ICdcXHQnXG4gICAgICB5aWVsZCB7IGxpbmVfbnIsIGxjb2RlLCBsaW5lLCBqZmllbGRzLCB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHdhbGtfZHNmX21kX3RhYmxlOiAtPlxuICAgIGZvciB7IGxucjogbGluZV9uciwgbGluZSwgZW9sLCB9IGZyb20gd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBAcGF0aFxuICAgICAgbGluZSAgICA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLm5vcm1hbGl6ZV90ZXh0IGxpbmVcbiAgICAgIGpmaWVsZHMgPSBudWxsXG4gICAgICBsY29kZSAgID0gJ1UnXG4gICAgICBzd2l0Y2ggdHJ1ZVxuICAgICAgICB3aGVuIC9eXFxzKiQvdi50ZXN0IGxpbmUgICAgICAgdGhlbiBsY29kZSA9ICdCJ1xuICAgICAgICB3aGVuIG5vdCBsaW5lLnN0YXJ0c1dpdGggJ3wnICB0aGVuIG51bGwgIyBub3QgYW4gTUQgdGFibGVcbiAgICAgICAgd2hlbiBsaW5lLnN0YXJ0c1dpdGggJ3wtJyAgICAgdGhlbiBudWxsICMgTUQgdGFibGUgaGVhZGVyIHNlcGFyYXRvclxuICAgICAgICB3aGVuIC9eXFx8XFxzK1xcKi92LnRlc3QgbGluZSAgICB0aGVuIG51bGwgIyBNRCB0YWJsZSBoZWFkZXJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGxjb2RlICAgPSAnRCdcbiAgICAgICAgICBqZmllbGRzID0gbGluZS5zcGxpdCAnfCdcbiAgICAgICAgICBqZmllbGRzLnNoaWZ0KClcbiAgICAgICAgICBqZmllbGRzLnBvcCgpXG4gICAgICAgICAgamZpZWxkcyA9ICggZmllbGQudHJpbSgpICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgZmllbGQgaW4gamZpZWxkcyApXG4gICAgICAgICAgamZpZWxkcyA9ICggKCBmaWVsZC5yZXBsYWNlIC9eYCguKylgJC9ndiwgJyQxJyApICBmb3IgZmllbGQgaW4gamZpZWxkcyApXG4gICAgICAgICAgamZpZWxkcyA9IEpTT04uc3RyaW5naWZ5IGpmaWVsZHNcbiAgICAgICAgICAjIGRlYnVnICfOqWp6cnNkYl9fMzgnLCBqZmllbGRzXG4gICAgICB5aWVsZCB7IGxpbmVfbnIsIGxjb2RlLCBsaW5lLCBqZmllbGRzLCB9XG4gICAgO251bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyB3YWxrX2NzdjogLT5cbiAgIyAgIHlpZWxkIHJldHVybiBudWxsXG5cbiAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgd2Fsa19qc29uOiAtPlxuICAjICAgeWllbGQgcmV0dXJuIG51bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyB3YWxrX21kOiAtPlxuICAjICAgeWllbGQgcmV0dXJuIG51bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyB3YWxrX3R4dDogLT5cbiAgIyAgIHlpZWxkIHJldHVybiBudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBkYXRhc291cmNlX2Zvcm1hdF9wYXJzZXJcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBwYXJzZV91Y2RiX3JzZ3NfZ2x5cGhyYW5nZTogKHsgamZpZWxkcywgfSkgLT5cbiAgICBbIGljbGFiZWwsXG4gICAgICByc2csXG4gICAgICBpc19jamtfdHh0LFxuICAgICAgbG9faGlfdHh0LFxuICAgICAgbmFtZSwgICAgIF0gPSBKU09OLnBhcnNlIGpmaWVsZHNcbiAgICBsb19oaV9yZSAgICAgID0gLy8vIF4gMHggKD88bG8+IFswLTlhLWZdezEsNn0gKSBcXHMqXFwuXFwuXFxzKiAweCAoPzxoaT4gWzAtOWEtZl17MSw2fSApICQgLy8vaXZcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlzX2NqayA9IHN3aXRjaCBpc19jamtfdHh0XG4gICAgICB3aGVuICd0cnVlJyAgIHRoZW4gMVxuICAgICAgd2hlbiAnZmFsc2UnICB0aGVuIDBcbiAgICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfXzM5IGV4cGVjdGVkICd0cnVlJyBvciAnZmFsc2UnLCBnb3QgI3tycHIgaXNfY2prX3R4dH1cIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgdW5sZXNzICggbWF0Y2ggPSBsb19oaV90eHQubWF0Y2ggbG9faGlfcmUgKT9cbiAgICAgIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX180MCBleHBlY3RlZCBhIHJhbmdlIGxpdGVyYWwgbGlrZSAnMHgwMWE2Li4weDEwZmYnLCBnb3QgI3tycHIgbG9faGlfdHh0fVwiXG4gICAgbG8gID0gcGFyc2VJbnQgbWF0Y2guZ3JvdXBzLmxvLCAxNlxuICAgIGhpICA9IHBhcnNlSW50IG1hdGNoLmdyb3Vwcy5oaSwgMTZcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHJldHVybiB7IHJzZywgaXNfY2prLCBsbywgaGksIG5hbWUsIH1cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMjI1xuXG5vb29vb1xuYDg4OCdcbiA4ODggICAgICAgICAgLm9vb28uICAgb29vLiAub28uICAgIC5vb29vb29vbyAgICAgICAgICAgICAgLm9vb28ubyBvb29vIGQ4YiBvb29vICAgIG9vb1xuIDg4OCAgICAgICAgIGBQICApODhiICBgODg4UFwiWTg4YiAgODg4JyBgODhiICAgICAgICAgICAgICBkODgoICBcIjggYDg4OFwiXCI4UCAgYDg4LiAgLjgnXG4gODg4ICAgICAgICAgIC5vUFwiODg4ICAgODg4ICAgODg4ICA4ODggICA4ODggICAgICAgICAgICAgIGBcIlk4OGIuICAgODg4ICAgICAgIGA4OC4uOCdcbiA4ODggICAgICAgbyBkOCggIDg4OCAgIDg4OCAgIDg4OCAgYDg4Ym9kOFAnICAgICAgICAgICAgICBvLiAgKTg4YiAgODg4ICAgICAgICBgODg4J1xubzg4OG9vb29vb2Q4IGBZODg4XCJcIjhvIG84ODhvIG84ODhvIGA4b29vb29vLiAgb29vb29vb29vb28gOFwiXCI4ODhQJyBkODg4YiAgICAgICAgYDgnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRcIiAgICAgWURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJZODg4ODhQJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIExhbmd1YWdlX3NlcnZpY2VzXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX1RNUF9oYW5nZXVsID0gcmVxdWlyZSAnaGFuZ3VsLWRpc2Fzc2VtYmxlJ1xuICAgIEBfVE1QX2thbmEgICAgPSByZXF1aXJlICd3YW5ha2FuYSdcbiAgICAjIHsgdG9IaXJhZ2FuYSxcbiAgICAjICAgdG9LYW5hLFxuICAgICMgICB0b0thdGFrYW5hXG4gICAgIyAgIHRvUm9tYWppLFxuICAgICMgICB0b2tlbml6ZSwgICAgICAgICB9ID0gcmVxdWlyZSAnd2FuYWthbmEnXG4gICAgO3VuZGVmaW5lZFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgbm9ybWFsaXplX3RleHQ6ICggdGV4dCwgZm9ybSA9ICdORkMnICkgLT4gdGV4dC5ub3JtYWxpemUgZm9ybVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcmVtb3ZlX3Bpbnlpbl9kaWFjcml0aWNzOiAoIHRleHQgKSAtPiAoIHRleHQubm9ybWFsaXplICdORktEJyApLnJlcGxhY2UgL1xcUHtMfS9ndiwgJydcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGV4dHJhY3RfYXRvbmFsX3poX3JlYWRpbmdzOiAoIGVudHJ5ICkgLT5cbiAgICAjIHB5Onpow7ksIHpoZSwgemjEgW8sIHpow6FvLCB6aMeULCB6xKtcbiAgICBSID0gZW50cnlcbiAgICBSID0gUi5yZXBsYWNlIC9ecHk6L3YsICcnXG4gICAgUiA9IFIuc3BsaXQgLyxcXHMqL3ZcbiAgICBSID0gKCAoIEByZW1vdmVfcGlueWluX2RpYWNyaXRpY3MgemhfcmVhZGluZyApIGZvciB6aF9yZWFkaW5nIGluIFIgKVxuICAgIFIgPSBuZXcgU2V0IFJcbiAgICBSLmRlbGV0ZSAnbnVsbCdcbiAgICBSLmRlbGV0ZSAnQG51bGwnXG4gICAgcmV0dXJuIFsgUi4uLiwgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZXh0cmFjdF9qYV9yZWFkaW5nczogKCBlbnRyeSApIC0+XG4gICAgIyDnqbogICAgICBoaTrjgZ3jgoksIOOBgsK3KOOBj3zjgY1844GR44KLKSwg44GL44KJLCDjgZnCtyjjgY9844GL44GZKSwg44KA44GqwrfjgZfjgYRcbiAgICBSID0gZW50cnlcbiAgICBSID0gUi5yZXBsYWNlIC9eKD86aGl8a2EpOi92LCAnJ1xuICAgIFIgPSBSLnJlcGxhY2UgL1xccysvZ3YsICcnXG4gICAgUiA9IFIuc3BsaXQgLyxcXHMqL3ZcbiAgICAjIyMgTk9URSByZW1vdmUgbm8tcmVhZGluZ3MgbWFya2VyIGBAbnVsbGAgYW5kIGNvbnRleHR1YWwgcmVhZGluZ3MgbGlrZSAt44ON44OzIGZvciDnuIEsIC3jg47jgqYgZm9yIOeOiyAjIyNcbiAgICBSID0gKCByZWFkaW5nIGZvciByZWFkaW5nIGluIFIgd2hlbiBub3QgcmVhZGluZy5zdGFydHNXaXRoICctJyApXG4gICAgUiA9IG5ldyBTZXQgUlxuICAgIFIuZGVsZXRlICdudWxsJ1xuICAgIFIuZGVsZXRlICdAbnVsbCdcbiAgICByZXR1cm4gWyBSLi4uLCBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBleHRyYWN0X2hnX3JlYWRpbmdzOiAoIGVudHJ5ICkgLT5cbiAgICAjIOepuiAgICAgIGhpOuOBneOCiSwg44GCwrco44GPfOOBjXzjgZHjgospLCDjgYvjgoksIOOBmcK3KOOBj3zjgYvjgZkpLCDjgoDjgarCt+OBl+OBhFxuICAgIFIgPSBlbnRyeVxuICAgIFIgPSBSLnJlcGxhY2UgL14oPzpoZyk6L3YsICcnXG4gICAgUiA9IFIucmVwbGFjZSAvXFxzKy9ndiwgJydcbiAgICBSID0gUi5zcGxpdCAvLFxccyovdlxuICAgIFIgPSBuZXcgU2V0IFJcbiAgICBSLmRlbGV0ZSAnbnVsbCdcbiAgICBSLmRlbGV0ZSAnQG51bGwnXG4gICAgaGFuZ2V1bCA9IFsgUi4uLiwgXS5qb2luICcnXG4gICAgIyBkZWJ1ZyAnzqlqenJzZGJfXzQxJywgQF9UTVBfaGFuZ2V1bC5kaXNhc3NlbWJsZSBoYW5nZXVsLCB7IGZsYXR0ZW46IGZhbHNlLCB9XG4gICAgcmV0dXJuIFsgUi4uLiwgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcm9tYW5pemVfamFfa2FuYTogKCBlbnRyeSApIC0+XG4gICAgY2ZnID0ge31cbiAgICByZXR1cm4gQF9UTVBfa2FuYS50b1JvbWFqaSBlbnRyeSwgY2ZnXG4gICAgIyAjIyMgc3lzdGVtYXRpYyBuYW1lIG1vcmUgbGlrZSBgLi4uX2phX3hfa2FuX2xhdG4oKWAgIyMjXG4gICAgIyBoZWxwICfOqWRqa3JfXzQyJywgdG9IaXJhZ2FuYSAgJ+ODqeODvOODoeODsycsICAgICAgIHsgY29udmVydExvbmdWb3dlbE1hcms6IGZhbHNlLCB9XG4gICAgIyBoZWxwICfOqWRqa3JfXzQzJywgdG9IaXJhZ2FuYSAgJ+ODqeODvOODoeODsycsICAgICAgIHsgY29udmVydExvbmdWb3dlbE1hcms6IHRydWUsIH1cbiAgICAjIGhlbHAgJ86pZGprcl9fNDQnLCB0b0thbmEgICAgICAnd2FuYWthbmEnLCAgIHsgY3VzdG9tS2FuYU1hcHBpbmc6IHsgbmE6ICfjgasnLCBrYTogJ0JhbmEnIH0sIH1cbiAgICAjIGhlbHAgJ86pZGprcl9fNDUnLCB0b0thbmEgICAgICAnd2FuYWthbmEnLCAgIHsgY3VzdG9tS2FuYU1hcHBpbmc6IHsgd2FrYTogJyjlkozmrYwpJywgd2E6ICco5ZKMMiknLCBrYTogJyjmrYwyKScsIG5hOiAnKOWQjSknLCBrYTogJyhCYW5hKScsIG5ha2E6ICco5LitKScsIH0sIH1cbiAgICAjIGhlbHAgJ86pZGprcl9fNDYnLCB0b1JvbWFqaSAgICAn44Gk44GY44GO44KKJywgICAgIHsgY3VzdG9tUm9tYWppTWFwcGluZzogeyDjgZg6ICcoemkpJywg44GkOiAnKHR1KScsIOOCijogJyhsaSknLCDjgorjgofjgYY6ICcocnlvdSknLCDjgorjgoc6ICcocnlvKScgfSwgfVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcGFyc2VfaWRseDogKCBmb3JtdWxhICkgLT4gSURMWC5wYXJzZSBmb3JtdWxhXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvcGVyYXRvcnNfYW5kX2NvbXBvbmVudHNfZnJvbV9pZGx4OiAoIGZvcm11bGEgKSAtPlxuICAgIHN3aXRjaCB0eXBlID0gdHlwZV9vZiBmb3JtdWxhXG4gICAgICB3aGVuICd0ZXh0JyAgIHRoZW4gIGZvcm11bGFfYXN0ID0gQHBhcnNlX2lkbHggZm9ybXVsYVxuICAgICAgd2hlbiAnbGlzdCcgICB0aGVuICBmb3JtdWxhX2FzdCA9ICAgICAgICAgICAgIGZvcm11bGFcbiAgICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfXzQ3IGV4cGVjdGVkIGEgdGV4dCBvciBhIGxpc3QsIGdvdCBhICN7dHlwZX1cIlxuICAgIG9wZXJhdG9ycyAgID0gW11cbiAgICBjb21wb25lbnRzICA9IFtdXG4gICAgc2VwYXJhdGUgICAgPSAoIGxpc3QgKSAtPlxuICAgICAgZm9yIGVsZW1lbnQsIGlkeCBpbiBsaXN0XG4gICAgICAgIGlmIGlkeCBpcyAwXG4gICAgICAgICAgb3BlcmF0b3JzLnB1c2ggZWxlbWVudFxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIGlmICggdHlwZV9vZiBlbGVtZW50ICkgaXMgJ2xpc3QnXG4gICAgICAgICAgc2VwYXJhdGUgZWxlbWVudFxuICAgICAgICAgICMgY29tcG9uZW50cy5zcGxpY2UgY29tcG9uZW50cy5sZW5ndGgsIDAsICggc2VwYXJhdGUgZWxlbWVudCApLi4uXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgY29tcG9uZW50cy5wdXNoIGVsZW1lbnRcbiAgICBzZXBhcmF0ZSBmb3JtdWxhX2FzdFxuICAgIHJldHVybiB7IG9wZXJhdG9ycywgY29tcG9uZW50cywgfVxuXG5cblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjIyBUQUlOVCBnb2VzIGludG8gY29uc3RydWN0b3Igb2YgSnpyIGNsYXNzICMjI1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMjI1xuXG4gICBvb29vICBvOG9cbiAgIGA4ODggIGBcIidcbiAgICA4ODggb29vbyAgICBvb29vb29vbyBvb29vICBvb29vICBvb29vIGQ4YiAgLm9vb28uXG4gICAgODg4IGA4ODggICBkJ1wiXCI3ZDhQICBgODg4ICBgODg4ICBgODg4XCJcIjhQIGBQICApODhiXG4gICAgODg4ICA4ODggICAgIC5kOFAnICAgIDg4OCAgIDg4OCAgIDg4OCAgICAgIC5vUFwiODg4XG4gICAgODg4ICA4ODggICAuZDhQJyAgLlAgIDg4OCAgIDg4OCAgIDg4OCAgICAgZDgoICA4ODhcbi5vLiA4OFAgbzg4OG8gZDg4ODg4ODhQICAgYFY4OFZcIlY4UCcgZDg4OGIgICAgYFk4ODhcIlwiOG9cbmBZODg4UFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEppenVyYVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgeyBwYXRocywgfSAgICAgICAgICA9IGdldF9wYXRoc19hbmRfZm9ybWF0cygpXG4gICAgQHBhdGhzICAgICAgICAgICAgICA9IHBhdGhzXG4gICAgQGxhbmd1YWdlX3NlcnZpY2VzICA9IG5ldyBMYW5ndWFnZV9zZXJ2aWNlcygpXG4gICAgQGRiYSAgICAgICAgICAgICAgICA9IG5ldyBKenJfZGJfYWRhcHRlciBAcGF0aHMuZGIsIHsgaG9zdDogQCwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaWYgQGRiYS5pc19mcmVzaFxuICAgICMjIyBUQUlOVCBtb3ZlIHRvIEp6cl9kYl9hZGFwdGVyIHRvZ2V0aGVyIHdpdGggdHJ5L2NhdGNoICMjI1xuICAgICAgdHJ5XG4gICAgICAgIEBkYmEuc3RhdGVtZW50cy5wb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXMucnVuKClcbiAgICAgIGNhdGNoIGNhdXNlXG4gICAgICAgIGZpZWxkc19ycHIgPSBycHIgQGRiYS5zdGF0ZS5tb3N0X3JlY2VudF9pbnNlcnRlZF9yb3dcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfXzQ4IHdoZW4gdHJ5aW5nIHRvIGluc2VydCB0aGlzIHJvdzogI3tmaWVsZHNfcnByfSwgYW4gZXJyb3Igd2FzIHRocm93bjogI3tjYXVzZS5tZXNzYWdlfVwiLCBcXFxuICAgICAgICAgIHsgY2F1c2UsIH1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAjIyMgVEFJTlQgbW92ZSB0byBKenJfZGJfYWRhcHRlciB0b2dldGhlciB3aXRoIHRyeS9jYXRjaCAjIyNcbiAgICAgIHRyeVxuICAgICAgICBAZGJhLnN0YXRlbWVudHMucG9wdWxhdGVfanpyX2xhbmdfaGFuZ2V1bF9zeWxsYWJsZXMucnVuKClcbiAgICAgIGNhdGNoIGNhdXNlXG4gICAgICAgIGZpZWxkc19ycHIgPSBycHIgQGRiYS5zdGF0ZS5tb3N0X3JlY2VudF9pbnNlcnRlZF9yb3dcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfXzQ5IHdoZW4gdHJ5aW5nIHRvIGluc2VydCB0aGlzIHJvdzogI3tmaWVsZHNfcnByfSwgYW4gZXJyb3Igd2FzIHRocm93bjogI3tjYXVzZS5tZXNzYWdlfVwiLCBcXFxuICAgICAgICAgIHsgY2F1c2UsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDt1bmRlZmluZWRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNob3dfY291bnRzOiAtPlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZG8gPT5cbiAgICAgIHF1ZXJ5ID0gU1FMXCJcIlwiXG4gICAgICAgIHNlbGVjdFxuICAgICAgICAgICAgbXYudiAgICAgICAgICAgIGFzIHYsXG4gICAgICAgICAgICBjb3VudCggdDMudiApICAgYXMgY291bnRcbiAgICAgICAgICBmcm9tICAgICAgICBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0M1xuICAgICAgICAgIHJpZ2h0IGpvaW4gIGp6cl9taXJyb3JfdmVyYnMgICAgICAgIGFzIG12IHVzaW5nICggdiApXG4gICAgICAgIGdyb3VwIGJ5IHZcbiAgICAgICAgb3JkZXIgYnkgY291bnQgZGVzYywgdjtcIlwiXCJcbiAgICAgIGVjaG8gKCBncmV5ICfOqWp6cnNkYl9fNTAnICksICggZ29sZCByZXZlcnNlIGJvbGQgcXVlcnkgKVxuICAgICAgY291bnRzID0gKCBAZGJhLnByZXBhcmUgcXVlcnkgKS5hbGwoKVxuICAgICAgY29uc29sZS50YWJsZSBjb3VudHNcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRvID0+XG4gICAgICBxdWVyeSA9IFNRTFwiXCJcIlxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICAgIG12LnYgICAgICAgICAgICBhcyB2LFxuICAgICAgICAgICAgY291bnQoIHQzLnYgKSAgIGFzIGNvdW50XG4gICAgICAgICAgZnJvbSAgICAgICAganpyX3RyaXBsZXMgICAgICAgYXMgdDNcbiAgICAgICAgICByaWdodCBqb2luICBqenJfbWlycm9yX3ZlcmJzICBhcyBtdiB1c2luZyAoIHYgKVxuICAgICAgICBncm91cCBieSB2XG4gICAgICAgIG9yZGVyIGJ5IGNvdW50IGRlc2MsIHY7XCJcIlwiXG4gICAgICBlY2hvICggZ3JleSAnzqlqenJzZGJfXzUxJyApLCAoIGdvbGQgcmV2ZXJzZSBib2xkIHF1ZXJ5IClcbiAgICAgIGNvdW50cyA9ICggQGRiYS5wcmVwYXJlIHF1ZXJ5ICkuYWxsKClcbiAgICAgIGNvbnNvbGUudGFibGUgY291bnRzXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkbyA9PlxuICAgICAgcXVlcnkgPSBTUUxcIlwiXCJcbiAgICAgICAgc2VsZWN0IGRza2V5LCBjb3VudCgqKSBhcyBjb3VudCBmcm9tIGp6cl9taXJyb3JfbGluZXMgZ3JvdXAgYnkgZHNrZXkgdW5pb24gYWxsXG4gICAgICAgIHNlbGVjdCAnKicsICAgY291bnQoKikgYXMgY291bnQgZnJvbSBqenJfbWlycm9yX2xpbmVzXG4gICAgICAgIG9yZGVyIGJ5IGNvdW50IGRlc2M7XCJcIlwiXG4gICAgICBlY2hvICggZ3JleSAnzqlqenJzZGJfXzUyJyApLCAoIGdvbGQgcmV2ZXJzZSBib2xkIHF1ZXJ5IClcbiAgICAgIGNvdW50cyA9ICggQGRiYS5wcmVwYXJlIHF1ZXJ5ICkuYWxsKClcbiAgICAgIGNvdW50cyA9IE9iamVjdC5mcm9tRW50cmllcyAoIFsgZHNrZXksIHsgY291bnQsIH0sIF0gZm9yIHsgZHNrZXksIGNvdW50LCB9IGluIGNvdW50cyApXG4gICAgICBjb25zb2xlLnRhYmxlIGNvdW50c1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNob3dfanpyX21ldGFfZmF1bHRzOiAtPlxuICAgIGlmICggZmF1bHR5X3Jvd3MgPSAoIEBkYmEucHJlcGFyZSBTUUxcInNlbGVjdCAqIGZyb20ganpyX21ldGFfZmF1bHRzO1wiICkuYWxsKCkgKS5sZW5ndGggPiAwXG4gICAgICBlY2hvICfOqWp6cnNkYl9fNTMnLCByZWQgcmV2ZXJzZSBib2xkIFwiIGZvdW5kIHNvbWUgZmF1bHRzOiBcIlxuICAgICAgY29uc29sZS50YWJsZSBmYXVsdHlfcm93c1xuICAgIGVsc2VcbiAgICAgIGVjaG8gJ86panpyc2RiX181NCcsIGxpbWUgcmV2ZXJzZSBib2xkIFwiIChubyBmYXVsdHMpIFwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7bnVsbFxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMjI1xuXG5vb29vb29vb29vLiAgIG9vb29vb29vb29vbyBvb28gICAgICAgIG9vb29vICAgLm9vb29vby5cbmA4ODgnICAgYFk4YiAgYDg4OCcgICAgIGA4IGA4OC4gICAgICAgLjg4OCcgIGQ4UCcgIGBZOGJcbiA4ODggICAgICA4ODggIDg4OCAgICAgICAgICA4ODhiICAgICBkJzg4OCAgODg4ICAgICAgODg4XG4gODg4ICAgICAgODg4ICA4ODhvb29vOCAgICAgOCBZODguIC5QICA4ODggIDg4OCAgICAgIDg4OFxuIDg4OCAgICAgIDg4OCAgODg4ICAgIFwiICAgICA4ICBgODg4JyAgIDg4OCAgODg4ICAgICAgODg4XG4gODg4ICAgICBkODgnICA4ODggICAgICAgbyAgOCAgICBZICAgICA4ODggIGA4OGIgICAgZDg4J1xubzg4OGJvb2Q4UCcgICBvODg4b29vb29vZDggbzhvICAgICAgICBvODg4byAgYFk4Ym9vZDhQJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZGVtbyA9IC0+XG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMganpyLl9zaG93X2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzKClcbiAganpyLnNob3dfY291bnRzKClcbiAganpyLnNob3dfanpyX21ldGFfZmF1bHRzKClcbiAgIyB2OmM6cmVhZGluZzpqYS14LUhpclxuICAjIHY6YzpyZWFkaW5nOmphLXgtS2F0XG4gIGlmIGZhbHNlXG4gICAgc2VlbiA9IG5ldyBTZXQoKVxuICAgIGZvciB7IHJlYWRpbmcsIH0gZnJvbSBqenIuZGJhLndhbGsgU1FMXCJzZWxlY3QgZGlzdGluY3QoIG8gKSBhcyByZWFkaW5nIGZyb20ganpyX3RyaXBsZXMgd2hlcmUgdiA9ICd2OmM6cmVhZGluZzpqYS14LUthdCcgb3JkZXIgYnkgbztcIlxuICAgICAgZm9yIHBhcnQgaW4gKCByZWFkaW5nLnNwbGl0IC8oLuODvHwu44OjfC7jg6V8LuODp3zjg4MufC4pL3YgKSB3aGVuIHBhcnQgaXNudCAnJ1xuICAgICAgICBjb250aW51ZSBpZiBzZWVuLmhhcyBwYXJ0XG4gICAgICAgIHNlZW4uYWRkIHBhcnRcbiAgICAgICAgZWNobyBwYXJ0XG4gICAgZm9yIHsgcmVhZGluZywgfSBmcm9tIGp6ci5kYmEud2FsayBTUUxcInNlbGVjdCBkaXN0aW5jdCggbyApIGFzIHJlYWRpbmcgZnJvbSBqenJfdHJpcGxlcyB3aGVyZSB2ID0gJ3Y6YzpyZWFkaW5nOmphLXgtSGlyJyBvcmRlciBieSBvO1wiXG4gICAgICBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLygu44O8fC7jgoN8LuOChXwu44KHfOOBoy58LikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICAgICAjIGZvciBwYXJ0IGluICggcmVhZGluZy5zcGxpdCAvKC4pL3YgKSB3aGVuIHBhcnQgaXNudCAnJ1xuICAgICAgICBjb250aW51ZSBpZiBzZWVuLmhhcyBwYXJ0XG4gICAgICAgIHNlZW4uYWRkIHBhcnRcbiAgICAgICAgZWNobyBwYXJ0XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgO251bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5kZW1vX3JlYWRfZHVtcCA9IC0+XG4gIHsgQmVuY2htYXJrZXIsICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9iZW5jaG1hcmtpbmcoKVxuICAjIHsgbmFtZWl0LCAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9uYW1laXQoKVxuICBiZW5jaG1hcmtlciA9IG5ldyBCZW5jaG1hcmtlcigpXG4gIHRpbWVpdCA9ICggUC4uLiApIC0+IGJlbmNobWFya2VyLnRpbWVpdCBQLi4uXG4gIHsgVW5kdW1wZXIsICAgICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9zcWxpdGVfdW5kdW1wZXIoKVxuICB7IHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMsICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcbiAgeyB3YywgICAgICAgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX3djKClcbiAgcGF0aCAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEgucmVzb2x2ZSBfX2Rpcm5hbWUsICcuLi9qenIuZHVtcC5zcWwnXG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICBqenIuZGJhLnRlYXJkb3duIHsgdGVzdDogJyonLCB9XG4gIGRlYnVnICfOqWp6cnNkYl9fNTUnLCBVbmR1bXBlci51bmR1bXAgeyBkYjoganpyLmRiYSwgcGF0aCwgbW9kZTogJ2Zhc3QnLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAganpyLnNob3dfY291bnRzKClcbiAganpyLnNob3dfanpyX21ldGFfZmF1bHRzKClcbiAgO251bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5kZW1vX3Nob3dfYWxsX3RhYmxlcyA9IC0+XG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICByZWxhdGlvbl9uYW1lcyA9ICggcm93Lm5hbWUgZm9yIHJvdyBmcm9tIGp6ci5kYmEud2FsayBqenIuZGJhLnN0YXRlbWVudHMuc3RkX2dldF9yZWxhdGlvbnMgKVxuICByZWxhdGlvbl9uYW1lcyA9ICggbmFtZSBmb3IgbmFtZSBpbiByZWxhdGlvbl9uYW1lcyB3aGVuIG5vdCBuYW1lLnN0YXJ0c1dpdGggJ3N0ZF8nIClcbiAgcmVsYXRpb25fbmFtZXMgPSAoIG5hbWUgZm9yIG5hbWUgaW4gcmVsYXRpb25fbmFtZXMgd2hlbiBub3QgbmFtZS5zdGFydHNXaXRoICdfanpyX21ldGFfJyApXG4gIHJlbGF0aW9uX25hbWVzID0gKCBuYW1lIGZvciBuYW1lIGluIHJlbGF0aW9uX25hbWVzIHdoZW4gbm90IG5hbWUuc3RhcnRzV2l0aCAnanpyX21ldGFfJyApXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZm9yIHJlbGF0aW9uX25hbWUgaW4gcmVsYXRpb25fbmFtZXNcbiAgICB0YWJsZSA9IHt9XG4gICAgcm93X2NvdW50ID0gKCBqenIuZGJhLmdldF9maXJzdCBTUUxcInNlbGVjdCBjb3VudCgqKSBhcyBjb3VudCBmcm9tICN7cmVsYXRpb25fbmFtZX07XCIgKS5jb3VudFxuICAgIHN0YXRlbWVudCA9IFNRTFwiXCJcInNlbGVjdCAqIGZyb20gI3tyZWxhdGlvbl9uYW1lfSBvcmRlciBieSByYW5kb20oKSBsaW1pdCAxMDtcIlwiXCJcbiAgICBjb3VudCAgICAgPSAwXG4gICAgZm9yIHJvdyBmcm9tIGp6ci5kYmEud2FsayBzdGF0ZW1lbnRcbiAgICAgIGNvdW50KytcbiAgICAgIHRhYmxlWyByZWxhdGlvbl9uYW1lICsgXCIgKCN7Y291bnR9KVwiIF0gPSByb3dcbiAgICBlY2hvIHJldmVyc2UgYm9sZCBcIiAje3JlbGF0aW9uX25hbWV9IFwiXG4gICAgY29uc29sZS50YWJsZSB0YWJsZVxuICA7bnVsbFxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmlmIG1vZHVsZSBpcyByZXF1aXJlLm1haW4gdGhlbiBkbyA9PlxuICBkZW1vKClcbiAgZGVtb19zaG93X2FsbF90YWJsZXMoKVxuICAjIGRlbW9fcmVhZF9kdW1wKClcbiAgO251bGxcblxuXG4iXX0=
