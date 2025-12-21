(function() {
  'use strict';
  var Async_jetstream, Benchmarker, Bsql3, Datasource_field_parser, Dbric, Dbric_std, FS, GUY, IDL, IDLX, Jetstream, Jizura, Jzr_db_adapter, Language_services, PATH, SFMODULES, SQL, alert, as_bool, benchmarker, blue, bold, datasource_format_parser, debug, demo_source_identifiers, echo, freeze, from_bool, get_paths_and_formats, gold, green, grey, help, info, inspect, lets, lime, log, plain, praise, red, reverse, rpr, set_getter, timeit, type_of, urge, walk_lines_with_positions, warn, whisper, white;

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
  ({Dbric, Dbric_std, SQL, from_bool, as_bool} = SFMODULES.unstable.require_dbric());

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
          var error, messages, name, type, x;
          /* TAINT this is not well placed */
          /* NOTE execute a Gaps-and-Islands ESSFRI to improve structural integrity assurance: */
          // ( @prepare SQL"select * from _jzr_meta_uc_normalization_faults where false;" ).get()
          messages = [];
          for (x of this.statements.std_get_relations.iterate()) {
            ({name, type} = x);
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
            v: 'v:c:shape:ids:S:formula',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:shape:ids:S:formula:ast',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:shape:ids:error',
            o: "NN"
          },
          {
            rank: 1,
            s: "NN",
            v: 'v:c:shape:ids:M:formula',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:shape:ids:M:formula:ast',
            o: "NN"
          },
          {
            rank: 1,
            s: "NN",
            v: 'v:c:shape:ids:L:formula',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:shape:ids:L:formula:ast',
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
          v: 'v:c:shape:ids:S:formula',
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
            v: 'v:c:shape:ids:error',
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
          v: 'v:c:shape:ids:S:formula:ast',
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
      SQL`create view jzr_glyphs as
select
    gr.rsg    as rsg,
    gs.value  as cid,
    char( gs.value )  as glyph
  from jzr_glyphranges                        as gr
  join std_generate_series( gr.lo, gr.hi, 1 ) as gs
  ;`,
      //.......................................................................................................
      SQL`create view jzr_cjk_glyphranges as
select
    *
  from jzr_glyphranges
  where is_cjk
  order by lo;`,
      //.......................................................................................................
      SQL`create view jzr_cjk_glyphs as
select
    gr.rsg    as rsg,
    gs.value  as cid,
    char( gs.value )  as glyph
  from jzr_cjk_glyphranges                    as gr
  join std_generate_series( gr.lo, gr.hi, 1 ) as gs
  ;`,
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
  select jzr_trigger_on_before_insert( 'jzr_datasource_formats',
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
  select jzr_trigger_on_before_insert( 'jzr_datasources',
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
  select jzr_trigger_on_before_insert( 'jzr_mirror_verbs',
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
  select jzr_trigger_on_before_insert( 'jzr_mirror_triples_base',
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
  select jzr_trigger_on_before_insert( 'jzr_lang_hang_syllables',
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
      // #.......................................................................................................
      // SQL"""create view jzr_all_triples as
      //   select null as rowid, null as ref, null as s, null as v, null as o where false union all
      //   -- ...................................................................................................
      //   select * from jzr_mirror_triples_base union all
      //   select * from jzr_lang_kr_readings_triples union all
      //   -- ...................................................................................................
      //   select null, null, null, null, null where false
      //   ;"""

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
  and ( not std_is_uc_normal( ml.line ) )
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
where ( jzr_has_peripheral_ws_in_jfield( jfields ) );`,
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
from jzr_datasources                                      as ds
join jzr_datasource_formats                               as df using ( format )
join jzr_walk_file_lines( ds.dskey, df.format, ds.path )  as fl
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
    from jzr_mirror_lines                                   as ml
    join jzr_walk_triples( ml.rowid, ml.dskey, ml.jfields ) as gt
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
    from jzr_mirror_triples_base              as mt
    left join jzr_disassemble_hangeul( mt.o ) as dh
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
from jzr_mirror_lines                                                   as ml
join jzr_parse_ucdb_rsgs_glyphrange( ml.dskey, ml.line_nr, ml.jfields ) as gr
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
      jzr_trigger_on_before_insert: {
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
      jzr_has_peripheral_ws_in_jfield: {
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
      jzr_split_words: {
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
      jzr_walk_file_lines: {
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
      jzr_walk_triples: {
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
          return null;
        }
      },
      //-------------------------------------------------------------------------------------------------------
      jzr_disassemble_hangeul: {
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
      jzr_parse_ucdb_rsgs_glyphrange: {
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
      debug('Ωjzrsdb__36', "Datasource_field_parser::walk:", {
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
      var eol, line, line_nr, message, x;
      message = `Ωjzrsdb__37 no parser found for format ${rpr(this.format)}`;
      warn(message);
      yield ({
        line_nr: 0,
        lcode: 'E',
        line: message,
        jfields: null
      });
      for (x of walk_lines_with_positions(this.path)) {
        ({
          lnr: line_nr,
          line,
          eol
        } = x);
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
      var eol, jfields, lcode, line, line_nr, x;
      for (x of walk_lines_with_positions(this.path)) {
        ({
          lnr: line_nr,
          line,
          eol
        } = x);
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
      var eol, field, jfields, lcode, line, line_nr, x;
      for (x of walk_lines_with_positions(this.path)) {
        ({
          lnr: line_nr,
          line,
          eol
        } = x);
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
  module.exports = (() => {
    var internals;
    internals = {Jzr_db_adapter, Datasource_field_parser, datasource_format_parser, Language_services, get_paths_and_formats};
    return {Jizura, internals};
  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsS0FBQSxFQUFBLHVCQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxFQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQSxjQUFBLEVBQUEsaUJBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLHdCQUFBLEVBQUEsS0FBQSxFQUFBLHVCQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUEscUJBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSx5QkFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQTs7O0VBR0EsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxLQURGLEVBRUUsSUFGRixFQUdFLElBSEYsRUFJRSxLQUpGLEVBS0UsTUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsT0FSRixDQUFBLEdBUTRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBUixDQUFvQixtQkFBcEIsQ0FSNUI7O0VBU0EsQ0FBQSxDQUFFLEdBQUYsRUFDRSxPQURGLEVBRUUsSUFGRixFQUdFLEtBSEYsRUFJRSxLQUpGLEVBS0UsSUFMRixFQU1FLElBTkYsRUFP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cUI7VUFBQSxLQUFBLHdDQUFBO2FBQTJCLENBQUUsS0FBRixFQUFTLEtBQVQ7eUJBQTNCLENBQUUsS0FBRixFQUFTLENBQUUsS0FBRixDQUFUO1VBQUEsQ0FBQTs7WUFBckI7ZUFDVCxPQUFPLENBQUMsS0FBUixDQUFjLE1BQWQ7TUFSQyxDQUFBLElBM0JQOzthQXFDSztJQXRDVSxDQTNCZjs7O0lBb0VFLG9CQUFzQixDQUFBLENBQUE7QUFDeEIsVUFBQTtNQUFJLElBQUcsQ0FBRSxXQUFBLEdBQWMsQ0FBRSxJQUFDLENBQUEsR0FBRyxDQUFDLE9BQUwsQ0FBYSxHQUFHLENBQUEsOEJBQUEsQ0FBaEIsQ0FBRixDQUFvRCxDQUFDLEdBQXJELENBQUEsQ0FBaEIsQ0FBNEUsQ0FBQyxNQUE3RSxHQUFzRixDQUF6RjtRQUNFLElBQUEsQ0FBSyxhQUFMLEVBQW9CLEdBQUEsQ0FBSSxPQUFBLENBQVEsSUFBQSxDQUFLLHNCQUFMLENBQVIsQ0FBSixDQUFwQjtRQUNBLE9BQU8sQ0FBQyxLQUFSLENBQWMsV0FBZCxFQUZGO09BQUEsTUFBQTtRQUlFLElBQUEsQ0FBSyxhQUFMLEVBQW9CLElBQUEsQ0FBSyxPQUFBLENBQVEsSUFBQSxDQUFLLGVBQUwsQ0FBUixDQUFMLENBQXBCLEVBSkY7T0FBSjs7YUFNSztJQVBtQjs7RUF0RXhCLEVBL3VDQTs7O0VBZzBDQSxNQUFNLENBQUMsT0FBUCxHQUFvQixDQUFBLENBQUEsQ0FBQSxHQUFBO0FBQ3BCLFFBQUE7SUFBRSxTQUFBLEdBQVksQ0FDVixjQURVLEVBRVYsdUJBRlUsRUFHVix3QkFIVSxFQUlWLGlCQUpVLEVBS1YscUJBTFU7QUFNWixXQUFPLENBQ0wsTUFESyxFQUVMLFNBRks7RUFQVyxDQUFBO0FBaDBDcEIiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuJ3VzZSBzdHJpY3QnXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuR1VZICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2d1eSdcbnsgYWxlcnRcbiAgZGVidWdcbiAgaGVscFxuICBpbmZvXG4gIHBsYWluXG4gIHByYWlzZVxuICB1cmdlXG4gIHdhcm5cbiAgd2hpc3BlciB9ICAgICAgICAgICAgICAgPSBHVVkudHJtLmdldF9sb2dnZXJzICdqaXp1cmEtc291cmNlcy1kYidcbnsgcnByXG4gIGluc3BlY3RcbiAgZWNob1xuICB3aGl0ZVxuICBncmVlblxuICBibHVlXG4gIGxpbWVcbiAgZ29sZFxuICBncmV5XG4gIHJlZFxuICBib2xkXG4gIHJldmVyc2VcbiAgbG9nICAgICB9ICAgICAgICAgICAgICAgPSBHVVkudHJtXG4jIHsgZiB9ICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvZWZmc3RyaW5nJ1xuIyB3cml0ZSAgICAgICAgICAgICAgICAgICAgID0gKCBwICkgLT4gcHJvY2Vzcy5zdGRvdXQud3JpdGUgcFxuIyB7IG5mYSB9ICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL25vcm1hbGl6ZS1mdW5jdGlvbi1hcmd1bWVudHMnXG4jIEdUTkcgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvZ3V5LXRlc3QtTkcnXG4jIHsgVGVzdCAgICAgICAgICAgICAgICAgIH0gPSBHVE5HXG5GUyAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpmcydcblBBVEggICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOnBhdGgnXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkJzcWwzICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdiZXR0ZXItc3FsaXRlMydcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuU0ZNT0RVTEVTICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9icmljYWJyYWMtc2Ztb2R1bGVzJ1xuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IERicmljLFxuICBEYnJpY19zdGQsXG4gIFNRTCxcbiAgZnJvbV9ib29sLFxuICBhc19ib29sLCAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2RicmljKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBsZXRzLFxuICBmcmVlemUsICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2xldHNmcmVlemV0aGF0X2luZnJhKCkuc2ltcGxlXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgSmV0c3RyZWFtLFxuICBBc3luY19qZXRzdHJlYW0sICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2pldHN0cmVhbSgpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgd2Fsa19saW5lc193aXRoX3Bvc2l0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2Zhc3RfbGluZXJlYWRlcigpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgQmVuY2htYXJrZXIsICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9iZW5jaG1hcmtpbmcoKVxuYmVuY2htYXJrZXIgICAgICAgICAgICAgICAgICAgPSBuZXcgQmVuY2htYXJrZXIoKVxudGltZWl0ICAgICAgICAgICAgICAgICAgICAgICAgPSAoIFAuLi4gKSAtPiBiZW5jaG1hcmtlci50aW1laXQgUC4uLlxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IHNldF9nZXR0ZXIsICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfbWFuYWdlZF9wcm9wZXJ0eV90b29scygpXG57IElETCwgSURMWCwgICAgICAgICAgICB9ID0gcmVxdWlyZSAnbW9qaWt1cmEtaWRsJ1xueyB0eXBlX29mLCAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX3R5cGVfb2YoKVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZGVtb19zb3VyY2VfaWRlbnRpZmllcnMgPSAtPlxuICB7IGV4cGFuZF9kaWN0aW9uYXJ5LCAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9kaWN0aW9uYXJ5X3Rvb2xzKClcbiAgeyBnZXRfbG9jYWxfZGVzdGluYXRpb25zLCB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfZ2V0X2xvY2FsX2Rlc3RpbmF0aW9ucygpXG4gIGZvciBrZXksIHZhbHVlIG9mIGdldF9sb2NhbF9kZXN0aW5hdGlvbnMoKVxuICAgIGRlYnVnICfOqWp6cnNkYl9fXzMnLCBrZXksIHZhbHVlXG4gICMgY2FuIGFwcGVuZCBsaW5lIG51bWJlcnMgdG8gZmlsZXMgYXMgaW46XG4gICMgJ2RzOmRpY3Q6bWVhbmluZ3MuMTpMPTEzMzMyJ1xuICAjICdkczpkaWN0OnVjZDE0MC4xOnVoZGlkeDpMPTEyMzQnXG4gICMgcm93aWRzOiAndDpqZm06Uj0xJ1xuICAjIHtcbiAgIyAgICdkczpkaWN0Om1lYW5pbmdzJzogICAgICAgICAgJyRqenJkcy9tZWFuaW5nL21lYW5pbmdzLnR4dCdcbiAgIyAgICdkczpkaWN0OnVjZDp2MTQuMDp1aGRpZHgnIDogJyRqenJkcy91bmljb2RlLm9yZy11Y2QtdjE0LjAvVW5paGFuX0RpY3Rpb25hcnlJbmRpY2VzLnR4dCdcbiAgIyAgIH1cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIyNcblxuICAgICAgICAgICAgICAgICAgICAgICAgIC4gICBvb29vXG4gICAgICAgICAgICAgICAgICAgICAgIC5vOCAgIGA4ODhcbm9vLm9vb29vLiAgIC5vb29vLiAgIC5vODg4b28gIDg4OCAub28uICAgIC5vb29vLm9cbiA4ODgnIGA4OGIgYFAgICk4OGIgICAgODg4ICAgIDg4OFBcIlk4OGIgIGQ4OCggIFwiOFxuIDg4OCAgIDg4OCAgLm9QXCI4ODggICAgODg4ICAgIDg4OCAgIDg4OCAgYFwiWTg4Yi5cbiA4ODggICA4ODggZDgoICA4ODggICAgODg4IC4gIDg4OCAgIDg4OCAgby4gICk4OGJcbiA4ODhib2Q4UCcgYFk4ODhcIlwiOG8gICBcIjg4OFwiIG84ODhvIG84ODhvIDhcIlwiODg4UCdcbiA4ODhcbm84ODhvXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5nZXRfcGF0aHNfYW5kX2Zvcm1hdHMgPSAtPlxuICBwYXRocyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IHt9XG4gIGZvcm1hdHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0ge31cbiAgUiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSB7IHBhdGhzLCBmb3JtYXRzLCB9XG4gIHBhdGhzLmJhc2UgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5yZXNvbHZlIF9fZGlybmFtZSwgJy4uJ1xuICBwYXRocy5qenIgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEgucmVzb2x2ZSBwYXRocy5iYXNlLCAnLi4nXG4gIHBhdGhzLmRiICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIHBhdGhzLmJhc2UsICdqenIuZGInXG4gICMgcGF0aHMuZGIgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSAnL2Rldi9zaG0vanpyLmRiJ1xuICAjIHBhdGhzLmp6cmRzICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIHBhdGhzLmJhc2UsICdqenJkcydcbiAgcGF0aHMuanpybmRzICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gcGF0aHMuYmFzZSwgJ2ppenVyYS1uZXctZGF0YXNvdXJjZXMnXG4gIHBhdGhzLm1vamlrdXJhICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIHBhdGhzLmp6cm5kcywgJ21vamlrdXJhJ1xuICBwYXRocy5yYXdfZ2l0aHViICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBwYXRocy5qenJuZHMsICdidmZzL29yaWdpbi9odHRwcy9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tJ1xuICBrYW5qaXVtICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBwYXRocy5yYXdfZ2l0aHViLCAnbWlmdW5ldG9zaGlyby9rYW5qaXVtLzhhMGNkYWExNmQ2NGEyODFhMjA0OGRlMmVlZTJlYzVlM2E0NDBmYTYnXG4gIHJ1dG9waW8gICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIHBhdGhzLnJhd19naXRodWIsICdydXRvcGlvL0tvcmVhbi1OYW1lLUhhbmphLUNoYXJzZXQvMTJkZjFiYTFiNGRmYWEwOTU4MTNlNGRkZmJhNDI0ZTgxNmY5NGM1MydcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjIHBhdGhzWyAnZHM6ZGljdDp1Y2Q6djE0LjA6dWhkaWR4JyAgICAgIF0gICA9IFBBVEguam9pbiBwYXRocy5qenJuZHMsICd1bmljb2RlLm9yZy11Y2QtdjE0LjAvVW5paGFuX0RpY3Rpb25hcnlJbmRpY2VzLnR4dCdcbiAgcGF0aHNbICdkczpkaWN0Ong6a28tSGFuZytMYXRuJyAgICAgICAgXSAgID0gUEFUSC5qb2luIHBhdGhzLmp6cm5kcywgJ2hhbmdldWwtdHJhbnNjcmlwdGlvbnMudHN2J1xuICBwYXRoc1sgJ2RzOmRpY3Q6eDpqYS1LYW4rTGF0bicgICAgICAgICBdICAgPSBQQVRILmpvaW4gcGF0aHMuanpybmRzLCAna2FuYS10cmFuc2NyaXB0aW9ucy50c3YnXG4gIHBhdGhzWyAnZHM6ZGljdDpiY3A0NycgICAgICAgICAgICAgICAgIF0gICA9IFBBVEguam9pbiBwYXRocy5qenJuZHMsICdCQ1A0Ny1sYW5ndWFnZS1zY3JpcHRzLXJlZ2lvbnMudHN2J1xuICBwYXRoc1sgJ2RzOmRpY3Q6amE6a2Fuaml1bScgICAgICAgICAgICBdICAgPSBQQVRILmpvaW4ga2Fuaml1bSwgJ2RhdGEvc291cmNlX2ZpbGVzL2thbmppZGljdC50eHQnXG4gIHBhdGhzWyAnZHM6ZGljdDpqYTprYW5qaXVtOmF1eCcgICAgICAgIF0gICA9IFBBVEguam9pbiBrYW5qaXVtLCAnZGF0YS9zb3VyY2VfZmlsZXMvMF9SRUFETUUudHh0J1xuICBwYXRoc1sgJ2RzOmRpY3Q6a286Vj1kYXRhLWdvdi5jc3YnICAgICBdICAgPSBQQVRILmpvaW4gcnV0b3BpbywgJ2RhdGEtZ292LmNzdidcbiAgcGF0aHNbICdkczpkaWN0OmtvOlY9ZGF0YS1nb3YuanNvbicgICAgXSAgID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLWdvdi5qc29uJ1xuICBwYXRoc1sgJ2RzOmRpY3Q6a286Vj1kYXRhLW5hdmVyLmNzdicgICBdICAgPSBQQVRILmpvaW4gcnV0b3BpbywgJ2RhdGEtbmF2ZXIuY3N2J1xuICBwYXRoc1sgJ2RzOmRpY3Q6a286Vj1kYXRhLW5hdmVyLmpzb24nICBdICAgPSBQQVRILmpvaW4gcnV0b3BpbywgJ2RhdGEtbmF2ZXIuanNvbidcbiAgcGF0aHNbICdkczpkaWN0OmtvOlY9UkVBRE1FLm1kJyAgICAgICAgXSAgID0gUEFUSC5qb2luIHJ1dG9waW8sICdSRUFETUUubWQnXG4gIHBhdGhzWyAnZHM6ZGljdDptZWFuaW5ncycgICAgICAgICAgICAgIF0gICA9IFBBVEguam9pbiBwYXRocy5tb2ppa3VyYSwgJ21lYW5pbmcvbWVhbmluZ3MudHh0J1xuICBwYXRoc1sgJ2RzOnNoYXBlOmlkc3YyJyAgICAgICAgICAgICAgICBdICAgPSBQQVRILmpvaW4gcGF0aHMubW9qaWt1cmEsICdzaGFwZS9zaGFwZS1icmVha2Rvd24tZm9ybXVsYS12Mi50eHQnXG4gIHBhdGhzWyAnZHM6c2hhcGU6emh6NWJmJyAgICAgICAgICAgICAgIF0gICA9IFBBVEguam9pbiBwYXRocy5tb2ppa3VyYSwgJ3NoYXBlL3NoYXBlLXN0cm9rZW9yZGVyLXpoYXppd3ViaWZhLnR4dCdcbiAgcGF0aHNbICdkczp1Y2RiOnJzZ3MnICAgICAgICAgICAgICAgICAgXSAgID0gUEFUSC5qb2luIHBhdGhzLm1vamlrdXJhLCAndWNkYi9jZmcvcnNncy1hbmQtYmxvY2tzLm1kJ1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMgZm9ybWF0c1sgJ2RzOmRpY3Q6dWNkOnYxNC4wOnVoZGlkeCcgICAgICBdICAgPSAsICd1bmljb2RlLm9yZy11Y2QtdjE0LjAvVW5paGFuX0RpY3Rpb25hcnlJbmRpY2VzLnR4dCdcbiAgZm9ybWF0c1sgJ2RzOmRpY3Q6eDprby1IYW5nK0xhdG4nICAgICAgICBdICAgPSAnZHNmOnRzdidcbiAgZm9ybWF0c1sgJ2RzOmRpY3Q6eDpqYS1LYW4rTGF0bicgICAgICAgICBdICAgPSAnZHNmOnRzdidcbiAgZm9ybWF0c1sgJ2RzOmRpY3Q6YmNwNDcnICAgICAgICAgICAgICAgICBdICAgPSAnZHNmOnRzdidcbiAgZm9ybWF0c1sgJ2RzOmRpY3Q6amE6a2Fuaml1bScgICAgICAgICAgICBdICAgPSAnZHNmOnR4dCdcbiAgZm9ybWF0c1sgJ2RzOmRpY3Q6amE6a2Fuaml1bTphdXgnICAgICAgICBdICAgPSAnZHNmOnR4dCdcbiAgZm9ybWF0c1sgJ2RzOmRpY3Q6a286Vj1kYXRhLWdvdi5jc3YnICAgICBdICAgPSAnZHNmOmNzdidcbiAgZm9ybWF0c1sgJ2RzOmRpY3Q6a286Vj1kYXRhLWdvdi5qc29uJyAgICBdICAgPSAnZHNmOmpzb24nXG4gIGZvcm1hdHNbICdkczpkaWN0OmtvOlY9ZGF0YS1uYXZlci5jc3YnICAgXSAgID0gJ2RzZjpjc3YnXG4gIGZvcm1hdHNbICdkczpkaWN0OmtvOlY9ZGF0YS1uYXZlci5qc29uJyAgXSAgID0gJ2RzZjpqc29uJ1xuICBmb3JtYXRzWyAnZHM6ZGljdDprbzpWPVJFQURNRS5tZCcgICAgICAgIF0gICA9ICdkc2Y6bWQnXG4gIGZvcm1hdHNbICdkczpkaWN0Om1lYW5pbmdzJyAgICAgICAgICAgICAgXSAgID0gJ2RzZjp0c3YnXG4gIGZvcm1hdHNbICdkczpzaGFwZTppZHN2MicgICAgICAgICAgICAgICAgXSAgID0gJ2RzZjp0c3YnXG4gIGZvcm1hdHNbICdkczpzaGFwZTp6aHo1YmYnICAgICAgICAgICAgICAgXSAgID0gJ2RzZjp0c3YnXG4gIGZvcm1hdHNbICdkczp1Y2RiOnJzZ3MnICAgICAgICAgICAgICAgICAgXSAgID0gJ2RzZjptZDp0YWJsZSdcbiAgcmV0dXJuIFJcblxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgSnpyX2RiX2FkYXB0ZXIgZXh0ZW5kcyBEYnJpY19zdGRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBkYl9jbGFzczogIEJzcWwzXG4gIEBwcmVmaXg6ICAgICdqenInXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogKCBkYl9wYXRoLCBjZmcgPSB7fSApIC0+XG4gICAgIyMjIFRBSU5UIG5lZWQgbW9yZSBjbGFyaXR5IGFib3V0IHdoZW4gc3RhdGVtZW50cywgYnVpbGQsIGluaXRpYWxpemUuLi4gaXMgcGVyZm9ybWVkICMjI1xuICAgIHsgaG9zdCwgfSA9IGNmZ1xuICAgIGNmZyAgICAgICA9IGxldHMgY2ZnLCAoIGNmZyApIC0+IGRlbGV0ZSBjZmcuaG9zdFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc3VwZXIgZGJfcGF0aCwgY2ZnXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBAaG9zdCAgID0gaG9zdFxuICAgIEBzdGF0ZSAgPSB7IHRyaXBsZV9jb3VudDogMCwgbW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93OiBudWxsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRvID0+XG4gICAgICAjIyMgVEFJTlQgdGhpcyBpcyBub3Qgd2VsbCBwbGFjZWQgIyMjXG4gICAgICAjIyMgTk9URSBleGVjdXRlIGEgR2Fwcy1hbmQtSXNsYW5kcyBFU1NGUkkgdG8gaW1wcm92ZSBzdHJ1Y3R1cmFsIGludGVncml0eSBhc3N1cmFuY2U6ICMjI1xuICAgICAgIyAoIEBwcmVwYXJlIFNRTFwic2VsZWN0ICogZnJvbSBfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMgd2hlcmUgZmFsc2U7XCIgKS5nZXQoKVxuICAgICAgbWVzc2FnZXMgPSBbXVxuICAgICAgZm9yIHsgbmFtZSwgdHlwZSwgfSBmcm9tIEBzdGF0ZW1lbnRzLnN0ZF9nZXRfcmVsYXRpb25zLml0ZXJhdGUoKVxuICAgICAgICB0cnlcbiAgICAgICAgICAoIEBwcmVwYXJlIFNRTFwic2VsZWN0ICogZnJvbSAje25hbWV9IHdoZXJlIGZhbHNlO1wiICkuYWxsKClcbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICBtZXNzYWdlcy5wdXNoIFwiI3t0eXBlfSAje25hbWV9OiAje2Vycm9yLm1lc3NhZ2V9XCJcbiAgICAgICAgICB3YXJuICfOqWp6cnNkYl9fXzQnLCBlcnJvci5tZXNzYWdlXG4gICAgICByZXR1cm4gbnVsbCBpZiBtZXNzYWdlcy5sZW5ndGggaXMgMFxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfX181IEVGRlJJIHRlc3RpbmcgcmV2ZWFsZWQgZXJyb3JzOiAje3JwciBtZXNzYWdlc31cIlxuICAgICAgO251bGxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIEBpc19mcmVzaFxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlX2Zvcm1hdHMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlcygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl92ZXJicygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9sY29kZXMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGluZXMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9nbHlwaHJhbmdlKClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDt1bmRlZmluZWRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNldF9nZXR0ZXIgQDo6LCAnbmV4dF90cmlwbGVfcm93aWQnLCAtPiBcInQ6bXI6M3BsOlI9I3srK0BzdGF0ZS50cmlwbGVfY291bnR9XCJcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICMjI1xuXG4gICAubzggICAgICAgICAgICAgICAgICAgIG84byAgb29vbyAgICAgICAgLm84XG4gIFwiODg4ICAgICAgICAgICAgICAgICAgICBgXCInICBgODg4ICAgICAgIFwiODg4XG4gICA4ODhvb29vLiAgb29vbyAgb29vbyAgb29vbyAgIDg4OCAgIC5vb29vODg4XG4gICBkODgnIGA4OGIgYDg4OCAgYDg4OCAgYDg4OCAgIDg4OCAgZDg4JyBgODg4XG4gICA4ODggICA4ODggIDg4OCAgIDg4OCAgIDg4OCAgIDg4OCAgODg4ICAgODg4XG4gICA4ODggICA4ODggIDg4OCAgIDg4OCAgIDg4OCAgIDg4OCAgODg4ICAgODg4XG4gICBgWThib2Q4UCcgIGBWODhWXCJWOFAnIG84ODhvIG84ODhvIGBZOGJvZDg4UFwiXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIEBidWlsZDogW1xuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX3VybnMgKFxuICAgICAgICB1cm4gICAgIHRleHQgICAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBjb21tZW50IHRleHQgICAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCB1cm4gKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfX182XCIgY2hlY2sgKCB1cm4gcmVnZXhwICdeW1xcXFwtXFxcXCtcXFxcLjphLXpBLVowLTldKyQnICkgKVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2dseXBocmFuZ2VzIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggJ3Q6dWM6cnNnOlY9JyB8fCByc2cgKSxcbiAgICAgICAgcnNnICAgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgaXNfY2prICAgIGJvb2xlYW4gICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbG8gICAgICAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgaGkgICAgICAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgLS0gbG9fZ2x5cGggIHRleHQgICAgICAgICAgICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggY2hhciggbG8gKSApIHN0b3JlZCxcbiAgICAgICAgLS0gaGlfZ2x5cGggIHRleHQgICAgICAgICAgICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggY2hhciggaGkgKSApIHN0b3JlZCxcbiAgICAgICAgbmFtZSAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIC0tIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfX183XCIgY2hlY2sgKCBsbyBiZXR3ZWVuIDB4MDAwMDAwIGFuZCAweDEwZmZmZiApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fXzhcIiBjaGVjayAoIGhpIGJldHdlZW4gMHgwMDAwMDAgYW5kIDB4MTBmZmZmICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X19fOVwiIGNoZWNrICggbG8gPD0gaGkgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzEwXCIgY2hlY2sgKCByb3dpZCByZWdleHAgJ14uKiQnIClcbiAgICAgICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9nbHlwaHMgYXNcbiAgICAgIHNlbGVjdFxuICAgICAgICAgIGdyLnJzZyAgICBhcyByc2csXG4gICAgICAgICAgZ3MudmFsdWUgIGFzIGNpZCxcbiAgICAgICAgICBjaGFyKCBncy52YWx1ZSApICBhcyBnbHlwaFxuICAgICAgICBmcm9tIGp6cl9nbHlwaHJhbmdlcyAgICAgICAgICAgICAgICAgICAgICAgIGFzIGdyXG4gICAgICAgIGpvaW4gc3RkX2dlbmVyYXRlX3NlcmllcyggZ3IubG8sIGdyLmhpLCAxICkgYXMgZ3NcbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfY2prX2dseXBocmFuZ2VzIGFzXG4gICAgICBzZWxlY3RcbiAgICAgICAgICAqXG4gICAgICAgIGZyb20ganpyX2dseXBocmFuZ2VzXG4gICAgICAgIHdoZXJlIGlzX2Nqa1xuICAgICAgICBvcmRlciBieSBsbztcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2Nqa19nbHlwaHMgYXNcbiAgICAgIHNlbGVjdFxuICAgICAgICAgIGdyLnJzZyAgICBhcyByc2csXG4gICAgICAgICAgZ3MudmFsdWUgIGFzIGNpZCxcbiAgICAgICAgICBjaGFyKCBncy52YWx1ZSApICBhcyBnbHlwaFxuICAgICAgICBmcm9tIGp6cl9jamtfZ2x5cGhyYW5nZXMgICAgICAgICAgICAgICAgICAgIGFzIGdyXG4gICAgICAgIGpvaW4gc3RkX2dlbmVyYXRlX3NlcmllcyggZ3IubG8sIGdyLmhpLCAxICkgYXMgZ3NcbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2dseXBoc2V0cyAoXG4gICAgICAgIHJvd2lkICAgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgbmFtZSAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBnbHlwaHJhbmdlICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18xMVwiIGZvcmVpZ24ga2V5ICggZ2x5cGhyYW5nZSApIHJlZmVyZW5jZXMganpyX2dseXBocmFuZ2VzICggcm93aWQgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzEyXCIgY2hlY2sgKCByb3dpZCByZWdleHAgJ14uKiQnIClcbiAgICAgICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfZGF0YXNvdXJjZV9mb3JtYXRzIChcbiAgICAgICAgZm9ybWF0ICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgY29tbWVudCAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggZm9ybWF0ICksXG4gICAgICBjaGVjayAoIGZvcm1hdCByZWdleHAgJ15kc2Y6W1xcXFwtXFxcXCtcXFxcLjphLXpBLVowLTldKyQnIClcbiAgICAgICk7XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdHJpZ2dlciBqenJfZGF0YXNvdXJjZV9mb3JtYXRzX2luc2VydFxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfZGF0YXNvdXJjZV9mb3JtYXRzXG4gICAgICBmb3IgZWFjaCByb3cgYmVnaW5cbiAgICAgICAgc2VsZWN0IGp6cl90cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfZGF0YXNvdXJjZV9mb3JtYXRzJyxcbiAgICAgICAgICAnZm9ybWF0OicsIG5ldy5mb3JtYXQsICdjb21tZW50OicsIG5ldy5jb21tZW50ICk7XG4gICAgICAgIGluc2VydCBpbnRvIGp6cl91cm5zICggdXJuLCBjb21tZW50ICkgdmFsdWVzICggbmV3LmZvcm1hdCwgbmV3LmNvbW1lbnQgKTtcbiAgICAgICAgZW5kO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2RhdGFzb3VyY2VzIChcbiAgICAgICAgZHNrZXkgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgZm9ybWF0ICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgcGF0aCAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggZHNrZXkgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzEzXCIgZm9yZWlnbiBrZXkgKCBmb3JtYXQgKSByZWZlcmVuY2VzIGp6cl9kYXRhc291cmNlX2Zvcm1hdHMgKCBmb3JtYXQgKVxuICAgICAgKTtcIlwiXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9kYXRhc291cmNlc19pbnNlcnRcbiAgICAgIGJlZm9yZSBpbnNlcnQgb24ganpyX2RhdGFzb3VyY2VzXG4gICAgICBmb3IgZWFjaCByb3cgYmVnaW5cbiAgICAgICAgc2VsZWN0IGp6cl90cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfZGF0YXNvdXJjZXMnLFxuICAgICAgICAgICdkc2tleTonLCBuZXcuZHNrZXksICdmb3JtYXQ6JywgbmV3LmZvcm1hdCwgJ3BhdGg6JywgbmV3LnBhdGggKTtcbiAgICAgICAgaW5zZXJ0IGludG8ganpyX3VybnMgKCB1cm4sIGNvbW1lbnQgKSB2YWx1ZXMgKCBuZXcuZHNrZXksICdmb3JtYXQ6ICcgfHwgbmV3LmZvcm1hdCB8fCAnLCBwYXRoOiAnIHx8IG5ldy5wYXRoICk7XG4gICAgICAgIGVuZDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfbGNvZGVzIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgbGNvZGUgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgY29tbWVudCAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzE0XCIgY2hlY2sgKCBsY29kZSByZWdleHAgJ15bYS16QS1aXStbYS16QS1aMC05XSokJyApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTVcIiBjaGVjayAoIHJvd2lkID0gJ3Q6bXI6bGM6Vj0nIHx8IGxjb2RlICkgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfbGluZXMgKFxuICAgICAgICAtLSAndDpqZm06J1xuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsIGdlbmVyYXRlZCBhbHdheXMgYXMgKCAndDptcjpsbjpkcz0nIHx8IGRza2V5IHx8ICc6TD0nIHx8IGxpbmVfbnIgKSBzdG9yZWQsXG4gICAgICAgIHJlZiAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoICAgICAgICAgICAgICAgICAgZHNrZXkgfHwgJzpMPScgfHwgbGluZV9uciApIHZpcnR1YWwsXG4gICAgICAgIGRza2V5ICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmVfbnIgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxjb2RlICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmUgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGpmaWVsZHMgICBqc29uICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAtLSBwcmltYXJ5IGtleSAoIHJvd2lkICksICAgICAgICAgICAgICAgICAgICAgICAgICAgLS0gIyMjIE5PVEUgRXhwZXJpbWVudGFsOiBubyBleHBsaWNpdCBQSywgaW5zdGVhZCBnZW5lcmF0ZWQgYHJvd2lkYCBjb2x1bW5cbiAgICAgIC0tIGNoZWNrICggcm93aWQgcmVnZXhwICdedDptcjpsbjpkcz0uKzpMPVxcXFxkKyQnKSwgIC0tICMjIyBOT1RFIG5vIG5lZWQgdG8gY2hlY2sgYXMgdmFsdWUgaXMgZ2VuZXJhdGVkICMjI1xuICAgICAgdW5pcXVlICggZHNrZXksIGxpbmVfbnIgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzE2XCIgZm9yZWlnbiBrZXkgKCBsY29kZSApIHJlZmVyZW5jZXMganpyX21pcnJvcl9sY29kZXMgKCBsY29kZSApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX3ZlcmJzIChcbiAgICAgICAgcmFuayAgICAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCBkZWZhdWx0IDEsXG4gICAgICAgIHMgICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHYgICAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIG8gICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHYgKSxcbiAgICAgIC0tIGNoZWNrICggcm93aWQgcmVnZXhwICdedDptcjp2YjpWPVtcXFxcLTpcXFxcK1xcXFxwe0x9XSskJyApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTdcIiBjaGVjayAoIHJhbmsgPiAwICkgKTtcIlwiXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9taXJyb3JfdmVyYnNfaW5zZXJ0XG4gICAgICBiZWZvcmUgaW5zZXJ0IG9uIGp6cl9taXJyb3JfdmVyYnNcbiAgICAgIGZvciBlYWNoIHJvdyBiZWdpblxuICAgICAgICBzZWxlY3QganpyX3RyaWdnZXJfb25fYmVmb3JlX2luc2VydCggJ2p6cl9taXJyb3JfdmVyYnMnLFxuICAgICAgICAgICdyYW5rOicsIG5ldy5yYW5rLCAnczonLCBuZXcucywgJ3Y6JywgbmV3LnYsICdvOicsIG5ldy5vICk7XG4gICAgICAgIGluc2VydCBpbnRvIGp6cl91cm5zICggdXJuLCBjb21tZW50ICkgdmFsdWVzICggbmV3LnYsICdzOiAnIHx8IG5ldy5zIHx8ICcsIG86ICcgfHwgbmV3Lm8gKTtcbiAgICAgICAgZW5kO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByZWYgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBzICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICB2ICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBvICAgICAgICAganNvbiAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMThcIiBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bXI6M3BsOlI9XFxcXGQrJCcgKSxcbiAgICAgIC0tIHVuaXF1ZSAoIHJlZiwgcywgdiwgbyApXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18xOVwiIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xpbmVzICggcm93aWQgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzIwXCIgZm9yZWlnbiBrZXkgKCB2ICAgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfdmVyYnMgKCB2IClcbiAgICAgICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9taXJyb3JfdHJpcGxlc19yZWdpc3RlclxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZVxuICAgICAgZm9yIGVhY2ggcm93IGJlZ2luXG4gICAgICAgIHNlbGVjdCBqenJfdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0KCAnanpyX21pcnJvcl90cmlwbGVzX2Jhc2UnLFxuICAgICAgICAgICdyb3dpZDonLCBuZXcucm93aWQsICdyZWY6JywgbmV3LnJlZiwgJ3M6JywgbmV3LnMsICd2OicsIG5ldy52LCAnbzonLCBuZXcubyApO1xuICAgICAgICBlbmQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyAoXG4gICAgICAgIHJvd2lkICAgICAgICAgICB0ZXh0ICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByZWYgICAgICAgICAgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgc3lsbGFibGVfaGFuZyAgIHRleHQgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHN5bGxhYmxlX2xhdG4gICB0ZXh0ICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggaW5pdGlhbF9sYXRuIHx8IG1lZGlhbF9sYXRuIHx8IGZpbmFsX2xhdG4gKSB2aXJ0dWFsLFxuICAgICAgICAtLSBzeWxsYWJsZV9sYXRuICAgdGV4dCAgdW5pcXVlICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggaW5pdGlhbF9sYXRuIHx8IG1lZGlhbF9sYXRuIHx8IGZpbmFsX2xhdG4gKSB2aXJ0dWFsLFxuICAgICAgICBpbml0aWFsX2hhbmcgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbWVkaWFsX2hhbmcgICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpbmFsX2hhbmcgICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBpbml0aWFsX2xhdG4gICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbWVkaWFsX2xhdG4gICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpbmFsX2xhdG4gICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjFcIiBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bGFuZzpoYW5nOnN5bDpWPVxcXFxTKyQnIClcbiAgICAgIC0tIHVuaXF1ZSAoIHJlZiwgcywgdiwgbyApXG4gICAgICAtLSBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18yMlwiIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xpbmVzICggcm93aWQgKVxuICAgICAgLS0gY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjNcIiBmb3JlaWduIGtleSAoIHN5bGxhYmxlX2hhbmcgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICggbyApIClcbiAgICAgICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzX3JlZ2lzdGVyXG4gICAgICBiZWZvcmUgaW5zZXJ0IG9uIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzXG4gICAgICBmb3IgZWFjaCByb3cgYmVnaW5cbiAgICAgICAgc2VsZWN0IGp6cl90cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfbGFuZ19oYW5nX3N5bGxhYmxlcycsXG4gICAgICAgICAgbmV3LnJvd2lkLCBuZXcucmVmLCBuZXcuc3lsbGFibGVfaGFuZywgbmV3LnN5bGxhYmxlX2xhdG4sXG4gICAgICAgICAgICBuZXcuaW5pdGlhbF9oYW5nLCBuZXcubWVkaWFsX2hhbmcsIG5ldy5maW5hbF9oYW5nLFxuICAgICAgICAgICAgbmV3LmluaXRpYWxfbGF0biwgbmV3Lm1lZGlhbF9sYXRuLCBuZXcuZmluYWxfbGF0biApO1xuICAgICAgICBlbmQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyBzLCBudWxsIGFzIHYsIG51bGwgYXMgbyB3aGVyZSBmYWxzZSB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICd2OmM6cmVhZGluZzprby1MYXRuJywgICAgICAgICAgc3lsbGFibGVfbGF0biAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ3Y6YzpyZWFkaW5nOmtvLUxhdG46aW5pdGlhbCcsICBpbml0aWFsX2xhdG4gICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAndjpjOnJlYWRpbmc6a28tTGF0bjptZWRpYWwnLCAgIG1lZGlhbF9sYXRuICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICd2OmM6cmVhZGluZzprby1MYXRuOmZpbmFsJywgICAgZmluYWxfbGF0biAgICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ3Y6YzpyZWFkaW5nOmtvLUhhbmc6aW5pdGlhbCcsICBpbml0aWFsX2hhbmcgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAndjpjOnJlYWRpbmc6a28tSGFuZzptZWRpYWwnLCAgIG1lZGlhbF9oYW5nICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICd2OmM6cmVhZGluZzprby1IYW5nOmZpbmFsJywgICAgZmluYWxfaGFuZyAgICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsIHdoZXJlIGZhbHNlXG4gICAgICA7XCJcIlwiXG5cbiAgICAjICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfYWxsX3RyaXBsZXMgYXNcbiAgICAjICAgc2VsZWN0IG51bGwgYXMgcm93aWQsIG51bGwgYXMgcmVmLCBudWxsIGFzIHMsIG51bGwgYXMgdiwgbnVsbCBhcyBvIHdoZXJlIGZhbHNlIHVuaW9uIGFsbFxuICAgICMgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjICAgc2VsZWN0ICogZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSB1bmlvbiBhbGxcbiAgICAjICAgc2VsZWN0ICogZnJvbSBqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzIHVuaW9uIGFsbFxuICAgICMgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjICAgc2VsZWN0IG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwgd2hlcmUgZmFsc2VcbiAgICAjICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfdHJpcGxlcyBhc1xuICAgICAgc2VsZWN0IG51bGwgYXMgcm93aWQsIG51bGwgYXMgcmVmLCBudWxsIGFzIHJhbmssIG51bGwgYXMgcywgbnVsbCBhcyB2LCBudWxsIGFzIG8gd2hlcmUgZmFsc2VcbiAgICAgIC0tIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgdGIxLnJvd2lkLCB0YjEucmVmLCB2YjEucmFuaywgdGIxLnMsIHRiMS52LCB0YjEubyBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHRiMVxuICAgICAgam9pbiBqenJfbWlycm9yX3ZlcmJzIGFzIHZiMSB1c2luZyAoIHYgKVxuICAgICAgd2hlcmUgdmIxLnYgbGlrZSAndjpjOiUnXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHRiMi5yb3dpZCwgdGIyLnJlZiwgdmIyLnJhbmssIHRiMi5zLCBrci52LCBrci5vIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgdGIyXG4gICAgICBqb2luIGp6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXMgYXMga3Igb24gKCB0YjIudiA9ICd2OmM6cmVhZGluZzprby1IYW5nJyBhbmQgdGIyLm8gPSBrci5zIClcbiAgICAgIGpvaW4ganpyX21pcnJvcl92ZXJicyBhcyB2YjIgb24gKCBrci52ID0gdmIyLnYgKVxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsIHdoZXJlIGZhbHNlXG4gICAgICBvcmRlciBieSBzLCB2LCBvXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl90b3BfdHJpcGxlcyBhc1xuICAgICAgc2VsZWN0ICogZnJvbSBqenJfdHJpcGxlc1xuICAgICAgd2hlcmUgcmFuayA9IDFcbiAgICAgIG9yZGVyIGJ5IHMsIHYsIG9cbiAgICAgIDtcIlwiXCJcblxuICAgICMgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAjIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfZm9ybXVsYXMgKFxuICAgICMgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgIyAgICAgcmVmICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAjICAgICBnbHlwaCAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICMgICAgIGZvcm11bGEgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG5cbiAgICAjICAgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9jb21wb25lbnRzIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcmVmICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbGV2ZWwgICAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbG5yICAgICAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgcm5yICAgICAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgZ2x5cGggICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgY29tcG9uZW50IHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzI0XCIgZm9yZWlnbiBrZXkgKCByZWYgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICggcm93aWQgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzI1XCIgY2hlY2sgKCAoIGxlbmd0aCggZ2x5cGggICAgICkgPSAxICkgb3IgKCBnbHlwaCAgICAgIHJlZ2V4cCAnXiZbXFxcXC1hLXowLTlfXSsjWzAtOWEtZl17NCw2fTskJyApICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18yNlwiIGNoZWNrICggKCBsZW5ndGgoIGNvbXBvbmVudCApID0gMSApIG9yICggY29tcG9uZW50ICByZWdleHAgJ14mW1xcXFwtYS16MC05X10rI1swLTlhLWZdezQsNn07JCcgKSApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjdcIiBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXi4qJCcgKVxuICAgICAgKTtcIlwiXCJcblxuXG4gICAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAjIyNcblxuICAgICAgLm8gIC5vODhvLiAgICAgICAgICAgICAgICAgICAgICAgb29vbyAgICAgIC4gICAgICAgICAgICBvLlxuICAgICAuOCcgIDg4OCBgXCIgICAgICAgICAgICAgICAgICAgICAgIGA4ODggICAgLm84ICAgICAgICAgICAgYDguXG4gICAgLjgnICBvODg4b28gICAub29vby4gICBvb29vICBvb29vICAgODg4ICAubzg4OG9vICAub29vby5vICBgOC5cbiAgICA4OCAgICA4ODggICAgYFAgICk4OGIgIGA4ODggIGA4ODggICA4ODggICAgODg4ICAgZDg4KCAgXCI4ICAgODhcbiAgICA4OCAgICA4ODggICAgIC5vUFwiODg4ICAgODg4ICAgODg4ICAgODg4ICAgIDg4OCAgIGBcIlk4OGIuICAgIDg4XG4gICAgYDguICAgODg4ICAgIGQ4KCAgODg4ICAgODg4ICAgODg4ICAgODg4ICAgIDg4OCAuIG8uICApODhiICAuOCdcbiAgICAgYDguIG84ODhvICAgYFk4ODhcIlwiOG8gIGBWODhWXCJWOFAnIG84ODhvICAgXCI4ODhcIiA4XCJcIjg4OFAnIC44J1xuICAgICAgYFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCInXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuICAgICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcgX2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzIGFzIHNlbGVjdFxuICAgICAgICBtbC5yb3dpZCAgYXMgcm93aWQsXG4gICAgICAgIG1sLnJlZiAgICBhcyByZWYsXG4gICAgICAgIG1sLmxpbmUgICBhcyBsaW5lXG4gICAgICBmcm9tIGp6cl9taXJyb3JfbGluZXMgYXMgbWxcbiAgICAgIHdoZXJlIHRydWVcbiAgICAgICAgYW5kICggbm90IHN0ZF9pc191Y19ub3JtYWwoIG1sLmxpbmUgKSApXG4gICAgICBvcmRlciBieSBtbC5yb3dpZDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcgX2p6cl9tZXRhX2tyX3JlYWRpbmdzX3Vua25vd25fdmVyYl9mYXVsdHMgYXMgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgY291bnQoKikgb3ZlciAoIHBhcnRpdGlvbiBieSB2ICkgICAgYXMgY291bnQsXG4gICAgICAgICAgJ2p6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXM6Uj0qJyAgYXMgcm93aWQsXG4gICAgICAgICAgJyonICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICd1bmtub3duLXZlcmInICAgICAgICAgICAgICAgICAgICAgIGFzIGRlc2NyaXB0aW9uLFxuICAgICAgICAgIHYgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHF1b3RlXG4gICAgICAgIGZyb20ganpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlcyBhcyBublxuICAgICAgICB3aGVyZSBub3QgZXhpc3RzICggc2VsZWN0IDEgZnJvbSBqenJfbWlycm9yX3ZlcmJzIGFzIHZiIHdoZXJlIHZiLnYgPSBubi52ICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV9lcnJvcl92ZXJiX2ZhdWx0cyBhcyBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICBjb3VudCgqKSBvdmVyICggcGFydGl0aW9uIGJ5IHYgKSAgICBhcyBjb3VudCxcbiAgICAgICAgICAnZXJyb3I6Uj0qJyAgICAgICAgICAgICAgICAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgICByb3dpZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgJ2Vycm9yLXZlcmInICAgICAgICAgICAgICAgICAgICAgICAgYXMgZGVzY3JpcHRpb24sXG4gICAgICAgICAgJ3Y6JyB8fCB2IHx8ICcsIG86JyB8fCBvICAgICAgICAgICAgYXMgcXVvdGVcbiAgICAgICAgZnJvbSBqenJfdHJpcGxlcyBhcyBublxuICAgICAgICB3aGVyZSB2IGxpa2UgJyU6ZXJyb3InO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBfanpyX21ldGFfbWlycm9yX2xpbmVzX3doaXRlc3BhY2VfZmF1bHRzIGFzIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIDEgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGNvdW50LFxuICAgICAgICAgICd0Om1yOmxuOmpmaWVsZHM6d3M6Uj0qJyAgICAgICAgICAgICAgICAgICAgIGFzIHJvd2lkLFxuICAgICAgICAgIG1sLnJvd2lkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAnZXh0cmFuZW91cy13aGl0ZXNwYWNlJyAgICAgICAgICAgICAgICAgICAgICBhcyBkZXNjcmlwdGlvbixcbiAgICAgICAgICBtbC5qZmllbGRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBxdW90ZVxuICAgICAgICBmcm9tIGp6cl9taXJyb3JfbGluZXMgYXMgbWxcbiAgICAgICAgd2hlcmUgKCBqenJfaGFzX3BlcmlwaGVyYWxfd3NfaW5famZpZWxkKCBqZmllbGRzICkgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcgX2p6cl9tZXRhX21pcnJvcl9saW5lc193aXRoX2Vycm9ycyBhcyBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICAxICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBjb3VudCxcbiAgICAgICAgICAndDptcjpsbjpqZmllbGRzOndzOlI9KicgICAgICAgICAgICAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgICBtbC5yb3dpZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgJ2Vycm9yJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZGVzY3JpcHRpb24sXG4gICAgICAgICAgbWwubGluZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcXVvdGVcbiAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzIGFzIG1sXG4gICAgICAgIHdoZXJlICggbWwubGNvZGUgPSAnRScgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX21ldGFfZmF1bHRzIGFzXG4gICAgICBzZWxlY3QgbnVsbCBhcyBjb3VudCwgbnVsbCBhcyByb3dpZCwgbnVsbCBhcyByZWYsIG51bGwgYXMgZGVzY3JpcHRpb24sIG51bGwgIGFzIHF1b3RlIHdoZXJlIGZhbHNlIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgMSwgcm93aWQsIHJlZiwgICd1Yy1ub3JtYWxpemF0aW9uJywgbGluZSAgYXMgcXVvdGUgZnJvbSBfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMgICAgICAgICAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSBfanpyX21ldGFfa3JfcmVhZGluZ3NfdW5rbm93bl92ZXJiX2ZhdWx0cyAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSBfanpyX21ldGFfZXJyb3JfdmVyYl9mYXVsdHMgICAgICAgICAgICAgICAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSBfanpyX21ldGFfbWlycm9yX2xpbmVzX3doaXRlc3BhY2VfZmF1bHRzICAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSBfanpyX21ldGFfbWlycm9yX2xpbmVzX3dpdGhfZXJyb3JzICAgICAgICAgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsIHdoZXJlIGZhbHNlXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX3N5bGxhYmxlcyBhcyBzZWxlY3RcbiAgICAjICAgICAgIHQxLnNcbiAgICAjICAgICAgIHQxLnZcbiAgICAjICAgICAgIHQxLm9cbiAgICAjICAgICAgIHRpLnMgYXMgaW5pdGlhbF9oYW5nXG4gICAgIyAgICAgICB0bS5zIGFzIG1lZGlhbF9oYW5nXG4gICAgIyAgICAgICB0Zi5zIGFzIGZpbmFsX2hhbmdcbiAgICAjICAgICAgIHRpLm8gYXMgaW5pdGlhbF9sYXRuXG4gICAgIyAgICAgICB0bS5vIGFzIG1lZGlhbF9sYXRuXG4gICAgIyAgICAgICB0Zi5vIGFzIGZpbmFsX2xhdG5cbiAgICAjICAgICBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHQxXG4gICAgIyAgICAgam9pblxuICAgICMgICAgIGpvaW4ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgdGkgb24gKCB0MS4pXG4gICAgIyAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyMjIGFnZ3JlZ2F0ZSB0YWJsZSBmb3IgYWxsIHJvd2lkcyBnb2VzIGhlcmUgIyMjXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMjI1xuXG4gICAgICAgICAgICAgICAuICAgICAgICAgICAgICAgICAuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLlxuICAgICAgICAgICAgIC5vOCAgICAgICAgICAgICAgIC5vOCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubzhcbiAgIC5vb29vLm8gLm84ODhvbyAgLm9vb28uICAgLm84ODhvbyAgLm9vb29vLiAgb29vLiAub28uICAub28uICAgIC5vb29vby4gIG9vby4gLm9vLiAgIC5vODg4b28gIC5vb29vLm9cbiAgZDg4KCAgXCI4ICAgODg4ICAgYFAgICk4OGIgICAgODg4ICAgZDg4JyBgODhiIGA4ODhQXCJZODhiUFwiWTg4YiAgZDg4JyBgODhiIGA4ODhQXCJZODhiICAgIDg4OCAgIGQ4OCggIFwiOFxuICBgXCJZODhiLiAgICA4ODggICAgLm9QXCI4ODggICAgODg4ICAgODg4b29vODg4ICA4ODggICA4ODggICA4ODggIDg4OG9vbzg4OCAgODg4ICAgODg4ICAgIDg4OCAgIGBcIlk4OGIuXG4gIG8uICApODhiICAgODg4IC4gZDgoICA4ODggICAgODg4IC4gODg4ICAgIC5vICA4ODggICA4ODggICA4ODggIDg4OCAgICAubyAgODg4ICAgODg4ICAgIDg4OCAuIG8uICApODhiXG4gIDhcIlwiODg4UCcgICBcIjg4OFwiIGBZODg4XCJcIjhvICAgXCI4ODhcIiBgWThib2Q4UCcgbzg4OG8gbzg4OG8gbzg4OG8gYFk4Ym9kOFAnIG84ODhvIG84ODhvICAgXCI4ODhcIiA4XCJcIjg4OFAnXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBzdGF0ZW1lbnRzOlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX2dseXBocmFuZ2U6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX2dseXBocmFuZ2VzICggcnNnLCBpc19jamssIGxvLCBoaSwgbmFtZSApIHZhbHVlcyAoICRyc2csICRpc19jamssICRsbywgJGhpLCAkbmFtZSApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggZHNrZXkgKSBkbyB1cGRhdGUgc2V0IHBhdGggPSBleGNsdWRlZC5wYXRoXG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdDogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfZGF0YXNvdXJjZV9mb3JtYXRzICggZm9ybWF0LCBjb21tZW50ICkgdmFsdWVzICggJGZvcm1hdCwgJGNvbW1lbnQgKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIGRza2V5ICkgZG8gdXBkYXRlIHNldCBwYXRoID0gZXhjbHVkZWQucGF0aFxuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfZGF0YXNvdXJjZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfZGF0YXNvdXJjZXMgKCBkc2tleSwgZm9ybWF0LCBwYXRoICkgdmFsdWVzICggJGRza2V5LCAkZm9ybWF0LCAkcGF0aCApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggZHNrZXkgKSBkbyB1cGRhdGUgc2V0IHBhdGggPSBleGNsdWRlZC5wYXRoXG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9taXJyb3JfdmVyYjogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3ZlcmJzICggcmFuaywgcywgdiwgbyApIHZhbHVlcyAoICRyYW5rLCAkcywgJHYsICRvIClcbiAgICAgICAgLS0gb24gY29uZmxpY3QgKCByb3dpZCApIGRvIHVwZGF0ZSBzZXQgcmFuayA9IGV4Y2x1ZGVkLnJhbmssIHMgPSBleGNsdWRlZC5zLCB2ID0gZXhjbHVkZWQudiwgbyA9IGV4Y2x1ZGVkLm9cbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX21pcnJvcl9sY29kZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX2xjb2RlcyAoIHJvd2lkLCBsY29kZSwgY29tbWVudCApIHZhbHVlcyAoICRyb3dpZCwgJGxjb2RlLCAkY29tbWVudCApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcm93aWQgKSBkbyB1cGRhdGUgc2V0IGxjb2RlID0gZXhjbHVkZWQubGNvZGUsIGNvbW1lbnQgPSBleGNsdWRlZC5jb21tZW50XG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9taXJyb3JfdHJpcGxlOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICggcm93aWQsIHJlZiwgcywgdiwgbyApIHZhbHVlcyAoICRyb3dpZCwgJHJlZiwgJHMsICR2LCAkbyApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcmVmLCBzLCB2LCBvICkgZG8gbm90aGluZ1xuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9taXJyb3JfbGluZXM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl9saW5lcyAoIGRza2V5LCBsaW5lX25yLCBsY29kZSwgbGluZSwgamZpZWxkcyApXG4gICAgICBzZWxlY3RcbiAgICAgICAgLS0gJ3Q6bXI6bG46Uj0nIHx8IHJvd19udW1iZXIoKSBvdmVyICgpICAgICAgICAgIGFzIHJvd2lkLFxuICAgICAgICAtLSBkcy5kc2tleSB8fCAnOkw9JyB8fCBmbC5saW5lX25yICAgYXMgcm93aWQsXG4gICAgICAgIGRzLmRza2V5ICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBkc2tleSxcbiAgICAgICAgZmwubGluZV9uciAgICAgICAgICAgICAgICAgICAgICAgIGFzIGxpbmVfbnIsXG4gICAgICAgIGZsLmxjb2RlICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBsY29kZSxcbiAgICAgICAgZmwubGluZSAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGxpbmUsXG4gICAgICAgIGZsLmpmaWVsZHMgICAgICAgICAgICAgICAgICAgICAgICBhcyBqZmllbGRzXG4gICAgICBmcm9tIGp6cl9kYXRhc291cmNlcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZHNcbiAgICAgIGpvaW4ganpyX2RhdGFzb3VyY2VfZm9ybWF0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBkZiB1c2luZyAoIGZvcm1hdCApXG4gICAgICBqb2luIGp6cl93YWxrX2ZpbGVfbGluZXMoIGRzLmRza2V5LCBkZi5mb3JtYXQsIGRzLnBhdGggKSAgYXMgZmxcbiAgICAgIHdoZXJlIHRydWVcbiAgICAgIC0tIG9uIGNvbmZsaWN0ICggZHNrZXksIGxpbmVfbnIgKSBkbyB1cGRhdGUgc2V0IGxpbmUgPSBleGNsdWRlZC5saW5lXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlczogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoIHJvd2lkLCByZWYsIHMsIHYsIG8gKVxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICAgIGd0LnJvd2lkX291dCAgICBhcyByb3dpZCxcbiAgICAgICAgICAgIGd0LnJlZiAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgICBndC5zICAgICAgICAgICAgYXMgcyxcbiAgICAgICAgICAgIGd0LnYgICAgICAgICAgICBhcyB2LFxuICAgICAgICAgICAgZ3QubyAgICAgICAgICAgIGFzIG9cbiAgICAgICAgICBmcm9tIGp6cl9taXJyb3JfbGluZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIG1sXG4gICAgICAgICAgam9pbiBqenJfd2Fsa190cmlwbGVzKCBtbC5yb3dpZCwgbWwuZHNrZXksIG1sLmpmaWVsZHMgKSBhcyBndFxuICAgICAgICAgIHdoZXJlIHRydWVcbiAgICAgICAgICAgIGFuZCAoIG1sLmxjb2RlID0gJ0QnIClcbiAgICAgICAgICAgIC0tIGFuZCAoIG1sLmRza2V5ID0gJ2RzOmRpY3Q6bWVhbmluZ3MnIClcbiAgICAgICAgICAgIGFuZCAoIG1sLmpmaWVsZHMgaXMgbm90IG51bGwgKVxuICAgICAgICAgICAgYW5kICggbWwuamZpZWxkcy0+PickWzBdJyBub3QgcmVnZXhwICdeQGdseXBocycgKVxuICAgICAgICAgICAgLS0gYW5kICggbWwuZmllbGRfMyByZWdleHAgJ14oPzpweXxoaXxrYSk6JyApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcmVmLCBzLCB2LCBvICkgZG8gbm90aGluZ1xuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9sYW5nX2hhbmdldWxfc3lsbGFibGVzOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzICggcm93aWQsIHJlZixcbiAgICAgICAgc3lsbGFibGVfaGFuZywgaW5pdGlhbF9oYW5nLCBtZWRpYWxfaGFuZywgZmluYWxfaGFuZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxfbGF0biwgbWVkaWFsX2xhdG4sIGZpbmFsX2xhdG4gKVxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICAgICd0Omxhbmc6aGFuZzpzeWw6Vj0nIHx8IG10Lm8gICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgICAgICBtdC5yb3dpZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAgIG10Lm8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgc3lsbGFibGVfaGFuZyxcbiAgICAgICAgICAgIGRoLmluaXRpYWwgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgaW5pdGlhbF9oYW5nLFxuICAgICAgICAgICAgZGgubWVkaWFsICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBtZWRpYWxfaGFuZyxcbiAgICAgICAgICAgIGRoLmZpbmFsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZmluYWxfaGFuZyxcbiAgICAgICAgICAgIGNvYWxlc2NlKCBtdGkubywgJycgKSAgICAgICAgICAgICAgICAgYXMgaW5pdGlhbF9sYXRuLFxuICAgICAgICAgICAgY29hbGVzY2UoIG10bS5vLCAnJyApICAgICAgICAgICAgICAgICBhcyBtZWRpYWxfbGF0bixcbiAgICAgICAgICAgIGNvYWxlc2NlKCBtdGYubywgJycgKSAgICAgICAgICAgICAgICAgYXMgZmluYWxfbGF0blxuICAgICAgICAgIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgICAgICAgICAgICAgIGFzIG10XG4gICAgICAgICAgbGVmdCBqb2luIGp6cl9kaXNhc3NlbWJsZV9oYW5nZXVsKCBtdC5vICkgYXMgZGhcbiAgICAgICAgICBsZWZ0IGpvaW4ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgbXRpIG9uICggbXRpLnMgPSBkaC5pbml0aWFsIGFuZCBtdGkudiA9ICd2Ong6a28tSGFuZytMYXRuOmluaXRpYWwnIClcbiAgICAgICAgICBsZWZ0IGpvaW4ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgbXRtIG9uICggbXRtLnMgPSBkaC5tZWRpYWwgIGFuZCBtdG0udiA9ICd2Ong6a28tSGFuZytMYXRuOm1lZGlhbCcgIClcbiAgICAgICAgICBsZWZ0IGpvaW4ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgbXRmIG9uICggbXRmLnMgPSBkaC5maW5hbCAgIGFuZCBtdGYudiA9ICd2Ong6a28tSGFuZytMYXRuOmZpbmFsJyAgIClcbiAgICAgICAgICB3aGVyZSB0cnVlXG4gICAgICAgICAgICBhbmQgKCBtdC52ID0gJ3Y6YzpyZWFkaW5nOmtvLUhhbmcnIClcbiAgICAgICAgICBvcmRlciBieSBtdC5vXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcm93aWQgICAgICAgICApIGRvIG5vdGhpbmdcbiAgICAgICAgLyogIyMjIE5PVEUgYG9uIGNvbmZsaWN0YCBuZWVkZWQgYmVjYXVzZSB3ZSBsb2cgYWxsIGFjdHVhbGx5IG9jY3VycmluZyByZWFkaW5ncyBvZiBhbGwgY2hhcmFjdGVycyAqL1xuICAgICAgICBvbiBjb25mbGljdCAoIHN5bGxhYmxlX2hhbmcgKSBkbyBub3RoaW5nXG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcG9wdWxhdGVfanpyX2dseXBocmFuZ2U6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX2dseXBocmFuZ2VzICggcnNnLCBpc19jamssIGxvLCBoaSwgbmFtZSApXG4gICAgICBzZWxlY3RcbiAgICAgICAgLS0gJ3Q6bXI6bG46Uj0nIHx8IHJvd19udW1iZXIoKSBvdmVyICgpICAgICAgICAgIGFzIHJvd2lkLFxuICAgICAgICAtLSBkcy5kc2tleSB8fCAnOkw9JyB8fCBmbC5saW5lX25yICAgYXMgcm93aWQsXG4gICAgICAgIGdyLnJzZyAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyByc2csXG4gICAgICAgIGdyLmlzX2NqayAgICAgICAgICAgICAgICAgICAgICAgICBhcyBpc19jamssXG4gICAgICAgIC0tIHJlZlxuICAgICAgICBnci5sbyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbG8sXG4gICAgICAgIGdyLmhpICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBoaSxcbiAgICAgICAgZ3IubmFtZSAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIG5hbWVcbiAgICAgIGZyb20ganpyX21pcnJvcl9saW5lcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIG1sXG4gICAgICBqb2luIGp6cl9wYXJzZV91Y2RiX3JzZ3NfZ2x5cGhyYW5nZSggbWwuZHNrZXksIG1sLmxpbmVfbnIsIG1sLmpmaWVsZHMgKSBhcyBnclxuICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICBhbmQgKCBtbC5kc2tleSA9ICdkczp1Y2RiOnJzZ3MnIClcbiAgICAgICAgYW5kICggbWwubGNvZGUgPSAnRCcgKVxuICAgICAgb3JkZXIgYnkgbWwubGluZV9uclxuICAgICAgLS0gb24gY29uZmxpY3QgKCBkc2tleSwgbGluZV9uciApIGRvIHVwZGF0ZSBzZXQgbGluZSA9IGV4Y2x1ZGVkLmxpbmVcbiAgICAgIDtcIlwiXCJcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICMjI1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb29vbyAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYDg4OCAgICAgICAgICAgICAgLm84XG4gIG9vLm9vb29vLiAgIC5vb29vby4gIG9vLm9vb29vLiAgb29vbyAgb29vbyAgIDg4OCAgIC5vb29vLiAgIC5vODg4b28gIC5vb29vby5cbiAgIDg4OCcgYDg4YiBkODgnIGA4OGIgIDg4OCcgYDg4YiBgODg4ICBgODg4ICAgODg4ICBgUCAgKTg4YiAgICA4ODggICBkODgnIGA4OGJcbiAgIDg4OCAgIDg4OCA4ODggICA4ODggIDg4OCAgIDg4OCAgODg4ICAgODg4ICAgODg4ICAgLm9QXCI4ODggICAgODg4ICAgODg4b29vODg4XG4gICA4ODggICA4ODggODg4ICAgODg4ICA4ODggICA4ODggIDg4OCAgIDg4OCAgIDg4OCAgZDgoICA4ODggICAgODg4IC4gODg4ICAgIC5vXG4gICA4ODhib2Q4UCcgYFk4Ym9kOFAnICA4ODhib2Q4UCcgIGBWODhWXCJWOFAnIG84ODhvIGBZODg4XCJcIjhvICAgXCI4ODhcIiBgWThib2Q4UCdcbiAgIDg4OCAgICAgICAgICAgICAgICAgIDg4OFxuICBvODg4byAgICAgICAgICAgICAgICBvODg4b1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xjb2RlczogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzI4JywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGNvZGVzJ1xuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPUInLCBsY29kZTogJ0InLCBjb21tZW50OiAnYmxhbmsgbGluZScsICAgIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl9sY29kZS5ydW4geyByb3dpZDogJ3Q6bXI6bGM6Vj1DJywgbGNvZGU6ICdDJywgY29tbWVudDogJ2NvbW1lbnQgbGluZScsICB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0Om1yOmxjOlY9RCcsIGxjb2RlOiAnRCcsIGNvbW1lbnQ6ICdkYXRhIGxpbmUnLCAgICAgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPUUnLCBsY29kZTogJ0UnLCBjb21tZW50OiAnZXJyb3InLCAgICAgICAgIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl9sY29kZS5ydW4geyByb3dpZDogJ3Q6bXI6bGM6Vj1VJywgbGNvZGU6ICdVJywgY29tbWVudDogJ3Vua25vd24nLCAgICAgICB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdmVyYnM6IC0+XG4gICAgIyMjIE5PVEVcbiAgICBpbiB2ZXJicywgaW5pdGlhbCBjb21wb25lbnQgaW5kaWNhdGVzIHR5cGUgb2Ygc3ViamVjdDpcbiAgICAgIGB2OmM6YCBpcyBmb3Igc3ViamVjdHMgdGhhdCBhcmUgQ0pLIGNoYXJhY3RlcnNcbiAgICAgIGB2Ong6YCBpcyB1c2VkIGZvciB1bmNsYXNzaWZpZWQgc3ViamVjdHMgKHBvc3NpYmx5IHRvIGJlIHJlZmluZWQgaW4gdGhlIGZ1dHVyZSlcbiAgICAjIyNcbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzI5JywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdmVyYnMnXG4gICAgcm93cyA9IFtcbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjp0ZXN0aW5nOnVudXNlZCcsICAgICAgICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2Ong6a28tSGFuZytMYXRuOmluaXRpYWwnLCAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6eDprby1IYW5nK0xhdG46bWVkaWFsJywgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjp4OmtvLUhhbmcrTGF0bjpmaW5hbCcsICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzp6aC1MYXRuLXBpbnlpbicsICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmphLXgtS2FuJywgICAgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6amEteC1IaXInLCAgICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzpqYS14LUthdCcsICAgICAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmphLXgtTGF0bicsICAgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6amEteC1IaXIrTGF0bicsICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzpqYS14LUthdCtMYXRuJywgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmtvLUhhbmcnLCAgICAgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6a28tTGF0bicsICAgICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzprby1IYW5nOmluaXRpYWwnLCAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmtvLUhhbmc6bWVkaWFsJywgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6a28tSGFuZzpmaW5hbCcsICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzprby1MYXRuOmluaXRpYWwnLCAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmtvLUxhdG46bWVkaWFsJywgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6a28tTGF0bjpmaW5hbCcsICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6c2hhcGU6aWRzOlM6Zm9ybXVsYScsICAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpzaGFwZTppZHM6Uzpmb3JtdWxhOmFzdCcsICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnNoYXBlOmlkczplcnJvcicsICAgICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6c2hhcGU6aWRzOk06Zm9ybXVsYScsICAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpzaGFwZTppZHM6TTpmb3JtdWxhOmFzdCcsICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnNoYXBlOmlkczpMOmZvcm11bGEnLCAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6c2hhcGU6aWRzOkw6Zm9ybXVsYTphc3QnLCAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpzaGFwZTppZHM6aGFzLW9wZXJhdG9yJywgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnNoYXBlOmlkczpoYXMtY29tcG9uZW50JywgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6c2hhcGU6aWRzOmNvbXBvbmVudHMnLCAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICBdXG4gICAgZm9yIHJvdyBpbiByb3dzXG4gICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl92ZXJiLnJ1biByb3dcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VfZm9ybWF0czogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzMwJywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlX2Zvcm1hdHMnXG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdkc2Y6dHN2JywgICAgICAgY29tbWVudDogJ05OJywgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZV9mb3JtYXQucnVuIHsgZm9ybWF0OiAnZHNmOm1kOnRhYmxlJywgIGNvbW1lbnQ6ICdOTicsIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2VfZm9ybWF0LnJ1biB7IGZvcm1hdDogJ2RzZjpjc3YnLCAgICAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdkc2Y6anNvbicsICAgICAgY29tbWVudDogJ05OJywgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZV9mb3JtYXQucnVuIHsgZm9ybWF0OiAnZHNmOm1kJywgICAgICAgIGNvbW1lbnQ6ICdOTicsIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2VfZm9ybWF0LnJ1biB7IGZvcm1hdDogJ2RzZjp0eHQnLCAgICAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlczogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzMxJywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlcydcbiAgICB7IHBhdGhzXG4gICAgICBmb3JtYXRzLCB9ID0gZ2V0X3BhdGhzX2FuZF9mb3JtYXRzKClcbiAgICAjIGRza2V5ID0gJ2RzOmRpY3Q6dWNkOnYxNC4wOnVoZGlkeCc7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MicsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6ZGljdDptZWFuaW5ncyc7ICAgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MScsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6ZGljdDp4OmtvLUhhbmcrTGF0bic7ICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MicsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6ZGljdDp4OmphLUthbitMYXRuJzsgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MycsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkczpkaWN0OmphOmthbmppdW0nOyAgICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj00JywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICAjIGRza2V5ID0gJ2RzOmRpY3Q6amE6a2Fuaml1bTphdXgnOyAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTUnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZHM6ZGljdDprbzpWPWRhdGEtZ292LmNzdic7ICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9NicsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkczpkaWN0OmtvOlY9ZGF0YS1nb3YuanNvbic7ICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj03JywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICAjIGRza2V5ID0gJ2RzOmRpY3Q6a286Vj1kYXRhLW5hdmVyLmNzdic7ICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTgnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZHM6ZGljdDprbzpWPWRhdGEtbmF2ZXIuanNvbic7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9OScsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkczpkaWN0OmtvOlY9UkVBRE1FLm1kJzsgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xMCcsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6c2hhcGU6aWRzdjInOyAgICAgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MTEnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIGRza2V5ID0gJ2RzOnNoYXBlOnpoejViZic7ICAgICAgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEyJywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkczp1Y2RiOnJzZ3MnOyAgICAgICAgICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xMycsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgO251bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBfb25fb3Blbl9wb3B1bGF0ZV92ZXJiczogLT5cbiAgIyAgIHBhdGhzID0gZ2V0X3BhdGhzX2FuZF9mb3JtYXRzKClcbiAgIyAgIGRza2V5ID0gJ2RzOmRpY3Q6bWVhbmluZ3MnOyAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MScsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAjICAgZHNrZXkgPSAnZHM6ZGljdDp1Y2Q6djE0LjA6dWhkaWR4JzsgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0yJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICMgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9saW5lczogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzMyJywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGluZXMnXG4gICAgQHN0YXRlbWVudHMucG9wdWxhdGVfanpyX21pcnJvcl9saW5lcy5ydW4oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZ2x5cGhyYW5nZTogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzMzJywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9nbHlwaHJhbmdlJ1xuICAgIEBzdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9nbHlwaHJhbmdlLnJ1bigpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaWdnZXJfb25fYmVmb3JlX2luc2VydDogKCBuYW1lLCBmaWVsZHMuLi4gKSAtPlxuICAgICMgZGVidWcgJ86panpyc2RiX18zNCcsIHsgbmFtZSwgZmllbGRzLCB9XG4gICAgQHN0YXRlLm1vc3RfcmVjZW50X2luc2VydGVkX3JvdyA9IHsgbmFtZSwgZmllbGRzLCB9XG4gICAgO251bGxcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICMjI1xuXG4gIG9vb29vICAgICBvb28gb29vb29vb29vby4gICBvb29vb29vb29vb29cbiAgYDg4OCcgICAgIGA4JyBgODg4JyAgIGBZOGIgIGA4ODgnICAgICBgOFxuICAgODg4ICAgICAgIDggICA4ODggICAgICA4ODggIDg4OCAgICAgICAgICAub29vby5vXG4gICA4ODggICAgICAgOCAgIDg4OCAgICAgIDg4OCAgODg4b29vbzggICAgZDg4KCAgXCI4XG4gICA4ODggICAgICAgOCAgIDg4OCAgICAgIDg4OCAgODg4ICAgIFwiICAgIGBcIlk4OGIuXG4gICBgODguICAgIC44JyAgIDg4OCAgICAgZDg4JyAgODg4ICAgICAgICAgby4gICk4OGJcbiAgICAgYFlib2RQJyAgICBvODg4Ym9vZDhQJyAgIG84ODhvICAgICAgICA4XCJcIjg4OFAnXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIEBmdW5jdGlvbnM6XG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGp6cl90cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQ6XG4gICAgICAjIyMgTk9URSBpbiB0aGUgZnV0dXJlIHRoaXMgZnVuY3Rpb24gY291bGQgdHJpZ2dlciBjcmVhdGlvbiBvZiB0cmlnZ2VycyBvbiBpbnNlcnRzICMjI1xuICAgICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAgIHZhcmFyZ3M6ICAgICAgICB0cnVlXG4gICAgICBjYWxsOiAoIG5hbWUsIGZpZWxkcy4uLiApIC0+IEB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQgbmFtZSwgZmllbGRzLi4uXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMjIyBOT1RFIG1vdmVkIHRvIERicmljX3N0ZDsgY29uc2lkZXIgdG8gb3ZlcndyaXRlIHdpdGggdmVyc2lvbiB1c2luZyBgc2xldml0aGFuL3JlZ2V4YCAjIyNcbiAgICAjIHJlZ2V4cDpcbiAgICAjICAgb3ZlcndyaXRlOiAgICAgIHRydWVcbiAgICAjICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAjICAgY2FsbDogKCBwYXR0ZXJuLCB0ZXh0ICkgLT4gaWYgKCAoIG5ldyBSZWdFeHAgcGF0dGVybiwgJ3YnICkudGVzdCB0ZXh0ICkgdGhlbiAxIGVsc2UgMFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBqenJfaGFzX3BlcmlwaGVyYWxfd3NfaW5famZpZWxkOlxuICAgICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAgIGNhbGw6ICggamZpZWxkc19qc29uICkgLT5cbiAgICAgICAgcmV0dXJuIGZyb21fYm9vbCBmYWxzZSB1bmxlc3MgKCBqZmllbGRzID0gSlNPTi5wYXJzZSBqZmllbGRzX2pzb24gKT9cbiAgICAgICAgcmV0dXJuIGZyb21fYm9vbCBmYWxzZSB1bmxlc3MgKCB0eXBlX29mIGpmaWVsZHMgKSBpcyAnbGlzdCdcbiAgICAgICAgcmV0dXJuIGZyb21fYm9vbCBqZmllbGRzLnNvbWUgKCB2YWx1ZSApIC0+IC8oXlxccyl8KFxccyQpLy50ZXN0IHZhbHVlXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBAdGFibGVfZnVuY3Rpb25zOlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBqenJfc3BsaXRfd29yZHM6XG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2tleXdvcmQnLCBdXG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ2xpbmUnLCBdXG4gICAgICByb3dzOiAoIGxpbmUgKSAtPlxuICAgICAgICBrZXl3b3JkcyA9IGxpbmUuc3BsaXQgLyg/OlxccHtafSspfCgoPzpcXHB7U2NyaXB0PUhhbn0pfCg/OlxccHtMfSspfCg/OlxccHtOfSspfCg/OlxccHtTfSspKS92XG4gICAgICAgIGZvciBrZXl3b3JkIGluIGtleXdvcmRzXG4gICAgICAgICAgY29udGludWUgdW5sZXNzIGtleXdvcmQ/XG4gICAgICAgICAgY29udGludWUgaWYga2V5d29yZCBpcyAnJ1xuICAgICAgICAgIHlpZWxkIHsga2V5d29yZCwgfVxuICAgICAgICA7bnVsbFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBqenJfd2Fsa19maWxlX2xpbmVzOlxuICAgICAgY29sdW1uczogICAgICBbICdsaW5lX25yJywgJ2xjb2RlJywgJ2xpbmUnLCAnamZpZWxkcycgXVxuICAgICAgcGFyYW1ldGVyczogICBbICdkc2tleScsICdmb3JtYXQnLCAncGF0aCcsIF1cbiAgICAgIHJvd3M6ICggZHNrZXksIGZvcm1hdCwgcGF0aCApIC0+XG4gICAgICAgIHlpZWxkIGZyb20gbmV3IERhdGFzb3VyY2VfZmllbGRfcGFyc2VyIHsgaG9zdDogQGhvc3QsIGRza2V5LCBmb3JtYXQsIHBhdGgsIH1cbiAgICAgICAgO251bGxcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAganpyX3dhbGtfdHJpcGxlczpcbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAncm93aWRfaW4nLCAnZHNrZXknLCAnamZpZWxkcycsIF1cbiAgICAgIGNvbHVtbnM6ICAgICAgWyAncm93aWRfb3V0JywgJ3JlZicsICdzJywgJ3YnLCAnbycsIF1cbiAgICAgIHJvd3M6ICggcm93aWRfaW4sIGRza2V5LCBqZmllbGRzICkgLT5cbiAgICAgICAgZmllbGRzICA9IEpTT04ucGFyc2UgamZpZWxkc1xuICAgICAgICBlbnRyeSAgID0gZmllbGRzWyAyIF1cbiAgICAgICAgc3dpdGNoIGRza2V5XG4gICAgICAgICAgd2hlbiAnZHM6ZGljdDp4OmtvLUhhbmcrTGF0bicgICAgIHRoZW4geWllbGQgZnJvbSBAdHJpcGxlc19mcm9tX2RpY3RfeF9rb19IYW5nX0xhdG4gICAgICAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgICB3aGVuICdkczpkaWN0Om1lYW5pbmdzJyB0aGVuIHN3aXRjaCB0cnVlXG4gICAgICAgICAgICB3aGVuICggZW50cnkuc3RhcnRzV2l0aCAncHk6JyApIHRoZW4geWllbGQgZnJvbSBAdHJpcGxlc19mcm9tX2NfcmVhZGluZ196aF9MYXRuX3BpbnlpbiAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgICAgIHdoZW4gKCBlbnRyeS5zdGFydHNXaXRoICdrYTonICkgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX2phX3hfS2FuICAgICAgICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAgICAgd2hlbiAoIGVudHJ5LnN0YXJ0c1dpdGggJ2hpOicgKSB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXNfZnJvbV9jX3JlYWRpbmdfamFfeF9LYW4gICAgICAgIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICAgICB3aGVuICggZW50cnkuc3RhcnRzV2l0aCAnaGc6JyApIHRoZW4geWllbGQgZnJvbSBAdHJpcGxlc19mcm9tX2NfcmVhZGluZ19rb19IYW5nICAgICAgICAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgICB3aGVuICdkczpzaGFwZTppZHN2MicgICAgICAgICAgICAgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fc2hhcGVfaWRzdjIgICAgICAgICAgICAgICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICA7bnVsbFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBqenJfZGlzYXNzZW1ibGVfaGFuZ2V1bDpcbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAnaGFuZycsIF1cbiAgICAgIGNvbHVtbnM6ICAgICAgWyAnaW5pdGlhbCcsICdtZWRpYWwnLCAnZmluYWwnLCBdXG4gICAgICByb3dzOiAoIGhhbmcgKSAtPlxuICAgICAgICBqYW1vcyA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLl9UTVBfaGFuZ2V1bC5kaXNhc3NlbWJsZSBoYW5nLCB7IGZsYXR0ZW46IGZhbHNlLCB9XG4gICAgICAgIGZvciB7IGZpcnN0OiBpbml0aWFsLCB2b3dlbDogbWVkaWFsLCBsYXN0OiBmaW5hbCwgfSBpbiBqYW1vc1xuICAgICAgICAgIHlpZWxkIHsgaW5pdGlhbCwgbWVkaWFsLCBmaW5hbCwgfVxuICAgICAgICA7bnVsbFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBqenJfcGFyc2VfdWNkYl9yc2dzX2dseXBocmFuZ2U6XG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ2Rza2V5JywgJ2xpbmVfbnInLCAnamZpZWxkcycsIF1cbiAgICAgIGNvbHVtbnM6ICAgICAgWyAncnNnJywgJ2lzX2NqaycsICdsbycsICdoaScsICduYW1lJywgXVxuICAgICAgcm93czogKCBkc2tleSwgbGluZV9uciwgamZpZWxkcyApIC0+XG4gICAgICAgIHlpZWxkIGRhdGFzb3VyY2VfZm9ybWF0X3BhcnNlci5wYXJzZV91Y2RiX3JzZ3NfZ2x5cGhyYW5nZSB7IGRza2V5LCBsaW5lX25yLCBqZmllbGRzLCB9XG4gICAgICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlwbGVzX2Zyb21fZGljdF94X2tvX0hhbmdfTGF0bjogKCByb3dpZF9pbiwgZHNrZXksIFsgcm9sZSwgcywgbywgXSApIC0+XG4gICAgcmVmICAgICAgID0gcm93aWRfaW5cbiAgICB2ICAgICAgICAgPSBcInY6eDprby1IYW5nK0xhdG46I3tyb2xlfVwiXG4gICAgbyAgICAgICAgPz0gJydcbiAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHYsIG8sIH1cbiAgICBAc3RhdGUudGltZWl0X3Byb2dyZXNzPygpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaXBsZXNfZnJvbV9jX3JlYWRpbmdfemhfTGF0bl9waW55aW46ICggcm93aWRfaW4sIGRza2V5LCBbIF8sIHMsIGVudHJ5LCBdICkgLT5cbiAgICByZWYgICAgICAgPSByb3dpZF9pblxuICAgIHYgICAgICAgICA9ICd2OmM6cmVhZGluZzp6aC1MYXRuLXBpbnlpbidcbiAgICBmb3IgcmVhZGluZyBmcm9tIEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfYXRvbmFsX3poX3JlYWRpbmdzIGVudHJ5XG4gICAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHYsIG86IHJlYWRpbmcsIH1cbiAgICBAc3RhdGUudGltZWl0X3Byb2dyZXNzPygpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaXBsZXNfZnJvbV9jX3JlYWRpbmdfamFfeF9LYW46ICggcm93aWRfaW4sIGRza2V5LCBbIF8sIHMsIGVudHJ5LCBdICkgLT5cbiAgICByZWYgICAgICAgPSByb3dpZF9pblxuICAgIGlmIGVudHJ5LnN0YXJ0c1dpdGggJ2thOidcbiAgICAgIHZfeF9LYW4gICA9ICd2OmM6cmVhZGluZzpqYS14LUthdCdcbiAgICAgIHZfTGF0biAgICA9ICd2OmM6cmVhZGluZzpqYS14LUthdCtMYXRuJ1xuICAgIGVsc2VcbiAgICAgIHZfeF9LYW4gICA9ICd2OmM6cmVhZGluZzpqYS14LUhpcidcbiAgICAgIHZfTGF0biAgICA9ICd2OmM6cmVhZGluZzpqYS14LUhpcitMYXRuJ1xuICAgIGZvciByZWFkaW5nIGZyb20gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9qYV9yZWFkaW5ncyBlbnRyeVxuICAgICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiB2X3hfS2FuLCBvOiByZWFkaW5nLCB9XG4gICAgICAjIGZvciB0cmFuc2NyaXB0aW9uIGZyb20gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMucm9tYW5pemVfamFfa2FuYSByZWFkaW5nXG4gICAgICAjICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiB2X0xhdG4sIG86IHRyYW5zY3JpcHRpb24sIH1cbiAgICAgIHRyYW5zY3JpcHRpb24gPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5yb21hbml6ZV9qYV9rYW5hIHJlYWRpbmdcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogdl9MYXRuLCBvOiB0cmFuc2NyaXB0aW9uLCB9XG4gICAgQHN0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX2tvX0hhbmc6ICggcm93aWRfaW4sIGRza2V5LCBbIF8sIHMsIGVudHJ5LCBdICkgLT5cbiAgICByZWYgICAgICAgPSByb3dpZF9pblxuICAgIHYgICAgICAgICA9ICd2OmM6cmVhZGluZzprby1IYW5nJ1xuICAgIGZvciByZWFkaW5nIGZyb20gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9oZ19yZWFkaW5ncyBlbnRyeVxuICAgICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2LCBvOiByZWFkaW5nLCB9XG4gICAgQHN0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlwbGVzX2Zyb21fc2hhcGVfaWRzdjI6ICggcm93aWRfaW4sIGRza2V5LCBbIF8sIHMsIGZvcm11bGEsIF0gKSAtPlxuICAgIHJlZiAgICAgICA9IHJvd2lkX2luXG4gICAgIyBmb3IgcmVhZGluZyBmcm9tIEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLnBhcnNlX2lkcyBmb3JtdWxhXG4gICAgIyAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdiwgbzogcmVhZGluZywgfVxuICAgIHJldHVybiBudWxsIGlmICggbm90IGZvcm11bGE/ICkgb3IgKCBmb3JtdWxhIGlzICcnIClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ3Y6YzpzaGFwZTppZHM6Uzpmb3JtdWxhJywgbzogZm9ybXVsYSwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZXJyb3IgPSBudWxsXG4gICAgdHJ5IGZvcm11bGFfYXN0ID0gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMucGFyc2VfaWRseCBmb3JtdWxhIGNhdGNoIGVycm9yXG4gICAgICBvID0gSlNPTi5zdHJpbmdpZnkgeyByZWY6ICfOqWp6cnNkYl9fMzUnLCBtZXNzYWdlOiBlcnJvci5tZXNzYWdlLCByb3c6IHsgcm93aWRfaW4sIGRza2V5LCBzLCBmb3JtdWxhLCB9LCB9XG4gICAgICB3YXJuIFwiZXJyb3I6ICN7b31cIlxuICAgICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiAndjpjOnNoYXBlOmlkczplcnJvcicsIG8sIH1cbiAgICByZXR1cm4gbnVsbCBpZiBlcnJvcj9cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGZvcm11bGFfanNvbiAgICA9IEpTT04uc3RyaW5naWZ5IGZvcm11bGFfYXN0XG4gICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiAndjpjOnNoYXBlOmlkczpTOmZvcm11bGE6YXN0JywgbzogZm9ybXVsYV9qc29uLCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB7IG9wZXJhdG9ycyxcbiAgICAgIGNvbXBvbmVudHMsIH0gPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5vcGVyYXRvcnNfYW5kX2NvbXBvbmVudHNfZnJvbV9pZGx4IGZvcm11bGFfYXN0XG4gICAgc2Vlbl9vcGVyYXRvcnMgID0gbmV3IFNldCgpXG4gICAgc2Vlbl9jb21wb25lbnRzID0gbmV3IFNldCgpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBjb21wb25lbnRzX2pzb24gPSBKU09OLnN0cmluZ2lmeSBjb21wb25lbnRzXG4gICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiAndjpjOnNoYXBlOmlkczpjb21wb25lbnRzJywgbzogY29tcG9uZW50c19qc29uLCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBmb3Igb3BlcmF0b3IgaW4gb3BlcmF0b3JzXG4gICAgICBjb250aW51ZSBpZiBzZWVuX29wZXJhdG9ycy5oYXMgb3BlcmF0b3JcbiAgICAgIHNlZW5fb3BlcmF0b3JzLmFkZCBvcGVyYXRvclxuICAgICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiAndjpjOnNoYXBlOmlkczpoYXMtb3BlcmF0b3InLCBvOiBvcGVyYXRvciwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZm9yIGNvbXBvbmVudCBpbiBjb21wb25lbnRzXG4gICAgICBjb250aW51ZSBpZiBzZWVuX2NvbXBvbmVudHMuaGFzIGNvbXBvbmVudFxuICAgICAgc2Vlbl9jb21wb25lbnRzLmFkZCBjb21wb25lbnRcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ3Y6YzpzaGFwZTppZHM6aGFzLWNvbXBvbmVudCcsIG86IGNvbXBvbmVudCwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQHN0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgIDtudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIyNcblxuICAgICAgLm84ICAgICAgICAgICAgLm84OG8uXG4gICAgIFwiODg4ICAgICAgICAgICAgODg4IGBcIlxuIC5vb29vODg4ICAgLm9vb28ubyBvODg4b28gICAgIG9vLm9vb29vLiAgIC5vb29vLiAgIG9vb28gZDhiICAub29vby5vICAub29vb28uICBvb29vIGQ4YlxuZDg4JyBgODg4ICBkODgoICBcIjggIDg4OCAgICAgICAgODg4JyBgODhiIGBQICApODhiICBgODg4XCJcIjhQIGQ4OCggIFwiOCBkODgnIGA4OGIgYDg4OFwiXCI4UFxuODg4ICAgODg4ICBgXCJZODhiLiAgIDg4OCAgICAgICAgODg4ICAgODg4ICAub1BcIjg4OCAgIDg4OCAgICAgYFwiWTg4Yi4gIDg4OG9vbzg4OCAgODg4XG44ODggICA4ODggIG8uICApODhiICA4ODggICAgICAgIDg4OCAgIDg4OCBkOCggIDg4OCAgIDg4OCAgICAgby4gICk4OGIgODg4ICAgIC5vICA4ODhcbmBZOGJvZDg4UFwiIDhcIlwiODg4UCcgbzg4OG8gICAgICAgODg4Ym9kOFAnIGBZODg4XCJcIjhvIGQ4ODhiICAgIDhcIlwiODg4UCcgYFk4Ym9kOFAnIGQ4ODhiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDg4OFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG84ODhvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgRGF0YXNvdXJjZV9maWVsZF9wYXJzZXJcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAoeyBob3N0LCBkc2tleSwgZm9ybWF0LCBwYXRoLCB9KSAtPlxuICAgIEBob3N0ICAgICA9IGhvc3RcbiAgICBAZHNrZXkgICAgPSBkc2tleVxuICAgIEBmb3JtYXQgICA9IGZvcm1hdFxuICAgIEBwYXRoICAgICA9IHBhdGhcbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBbU3ltYm9sLml0ZXJhdG9yXTogLT4geWllbGQgZnJvbSBAd2FsaygpXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB3YWxrOiAtPlxuICAgIGRlYnVnICfOqWp6cnNkYl9fMzYnLCBcIkRhdGFzb3VyY2VfZmllbGRfcGFyc2VyOjp3YWxrOlwiLCB7IGZvcm1hdDogQGZvcm1hdCwgZHNrZXk6IEBkc2tleSwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgbWV0aG9kX25hbWUgPSAnd2Fsa18nICsgQGZvcm1hdC5yZXBsYWNlIC9bXmEtel0vZ3YsICdfJ1xuICAgIG1ldGhvZCAgICAgID0gQFsgbWV0aG9kX25hbWUgXSA/IEBfd2Fsa19ub19zdWNoX3BhcnNlclxuICAgIHlpZWxkIGZyb20gbWV0aG9kLmNhbGwgQFxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfd2Fsa19ub19zdWNoX3BhcnNlcjogLT5cbiAgICBtZXNzYWdlID0gXCLOqWp6cnNkYl9fMzcgbm8gcGFyc2VyIGZvdW5kIGZvciBmb3JtYXQgI3tycHIgQGZvcm1hdH1cIlxuICAgIHdhcm4gbWVzc2FnZVxuICAgIHlpZWxkIHsgbGluZV9ucjogMCwgbGNvZGU6ICdFJywgbGluZTogbWVzc2FnZSwgamZpZWxkczogbnVsbCwgfVxuICAgIGZvciB7IGxucjogbGluZV9uciwgbGluZSwgZW9sLCB9IGZyb20gd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBAcGF0aFxuICAgICAgeWllbGQgeyBsaW5lX25yLCBsY29kZTogJ1UnLCBsaW5lLCBqZmllbGRzOiBudWxsLCB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHdhbGtfZHNmX3RzdjogLT5cbiAgICBmb3IgeyBsbnI6IGxpbmVfbnIsIGxpbmUsIGVvbCwgfSBmcm9tIHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgQHBhdGhcbiAgICAgIGxpbmUgICAgPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5ub3JtYWxpemVfdGV4dCBsaW5lXG4gICAgICBqZmllbGRzID0gbnVsbFxuICAgICAgc3dpdGNoIHRydWVcbiAgICAgICAgd2hlbiAvXlxccyokL3YudGVzdCBsaW5lIHRoZW4gbGNvZGUgPSAnQidcbiAgICAgICAgd2hlbiAvXlxccyojL3YudGVzdCBsaW5lIHRoZW4gbGNvZGUgPSAnQydcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGxjb2RlID0gJ0QnXG4gICAgICAgICAgamZpZWxkcyAgID0gSlNPTi5zdHJpbmdpZnkgbGluZS5zcGxpdCAnXFx0J1xuICAgICAgeWllbGQgeyBsaW5lX25yLCBsY29kZSwgbGluZSwgamZpZWxkcywgfVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB3YWxrX2RzZl9tZF90YWJsZTogLT5cbiAgICBmb3IgeyBsbnI6IGxpbmVfbnIsIGxpbmUsIGVvbCwgfSBmcm9tIHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgQHBhdGhcbiAgICAgIGxpbmUgICAgPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5ub3JtYWxpemVfdGV4dCBsaW5lXG4gICAgICBqZmllbGRzID0gbnVsbFxuICAgICAgbGNvZGUgICA9ICdVJ1xuICAgICAgc3dpdGNoIHRydWVcbiAgICAgICAgd2hlbiAvXlxccyokL3YudGVzdCBsaW5lICAgICAgIHRoZW4gbGNvZGUgPSAnQidcbiAgICAgICAgd2hlbiBub3QgbGluZS5zdGFydHNXaXRoICd8JyAgdGhlbiBudWxsICMgbm90IGFuIE1EIHRhYmxlXG4gICAgICAgIHdoZW4gbGluZS5zdGFydHNXaXRoICd8LScgICAgIHRoZW4gbnVsbCAjIE1EIHRhYmxlIGhlYWRlciBzZXBhcmF0b3JcbiAgICAgICAgd2hlbiAvXlxcfFxccytcXCovdi50ZXN0IGxpbmUgICAgdGhlbiBudWxsICMgTUQgdGFibGUgaGVhZGVyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBsY29kZSAgID0gJ0QnXG4gICAgICAgICAgamZpZWxkcyA9IGxpbmUuc3BsaXQgJ3wnXG4gICAgICAgICAgamZpZWxkcy5zaGlmdCgpXG4gICAgICAgICAgamZpZWxkcy5wb3AoKVxuICAgICAgICAgIGpmaWVsZHMgPSAoIGZpZWxkLnRyaW0oKSAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGZpZWxkIGluIGpmaWVsZHMgKVxuICAgICAgICAgIGpmaWVsZHMgPSAoICggZmllbGQucmVwbGFjZSAvXmAoLispYCQvZ3YsICckMScgKSAgZm9yIGZpZWxkIGluIGpmaWVsZHMgKVxuICAgICAgICAgIGpmaWVsZHMgPSBKU09OLnN0cmluZ2lmeSBqZmllbGRzXG4gICAgICAgICAgIyBkZWJ1ZyAnzqlqenJzZGJfXzM4JywgamZpZWxkc1xuICAgICAgeWllbGQgeyBsaW5lX25yLCBsY29kZSwgbGluZSwgamZpZWxkcywgfVxuICAgIDtudWxsXG5cbiAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgd2Fsa19jc3Y6IC0+XG4gICMgICB5aWVsZCByZXR1cm4gbnVsbFxuXG4gICMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIHdhbGtfanNvbjogLT5cbiAgIyAgIHlpZWxkIHJldHVybiBudWxsXG5cbiAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgd2Fsa19tZDogLT5cbiAgIyAgIHlpZWxkIHJldHVybiBudWxsXG5cbiAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgd2Fsa190eHQ6IC0+XG4gICMgICB5aWVsZCByZXR1cm4gbnVsbFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgZGF0YXNvdXJjZV9mb3JtYXRfcGFyc2VyXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAcGFyc2VfdWNkYl9yc2dzX2dseXBocmFuZ2U6ICh7IGpmaWVsZHMsIH0pIC0+XG4gICAgWyBpY2xhYmVsLFxuICAgICAgcnNnLFxuICAgICAgaXNfY2prX3R4dCxcbiAgICAgIGxvX2hpX3R4dCxcbiAgICAgIG5hbWUsICAgICBdID0gSlNPTi5wYXJzZSBqZmllbGRzXG4gICAgbG9faGlfcmUgICAgICA9IC8vLyBeIDB4ICg/PGxvPiBbMC05YS1mXXsxLDZ9ICkgXFxzKlxcLlxcLlxccyogMHggKD88aGk+IFswLTlhLWZdezEsNn0gKSAkIC8vL2l2XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpc19jamsgPSBzd2l0Y2ggaXNfY2prX3R4dFxuICAgICAgd2hlbiAndHJ1ZScgICB0aGVuIDFcbiAgICAgIHdoZW4gJ2ZhbHNlJyAgdGhlbiAwXG4gICAgICBlbHNlIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX18zOSBleHBlY3RlZCAndHJ1ZScgb3IgJ2ZhbHNlJywgZ290ICN7cnByIGlzX2Nqa190eHR9XCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHVubGVzcyAoIG1hdGNoID0gbG9faGlfdHh0Lm1hdGNoIGxvX2hpX3JlICk/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fNDAgZXhwZWN0ZWQgYSByYW5nZSBsaXRlcmFsIGxpa2UgJzB4MDFhNi4uMHgxMGZmJywgZ290ICN7cnByIGxvX2hpX3R4dH1cIlxuICAgIGxvICA9IHBhcnNlSW50IG1hdGNoLmdyb3Vwcy5sbywgMTZcbiAgICBoaSAgPSBwYXJzZUludCBtYXRjaC5ncm91cHMuaGksIDE2XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICByZXR1cm4geyByc2csIGlzX2NqaywgbG8sIGhpLCBuYW1lLCB9XG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIyNcblxub29vb29cbmA4ODgnXG4gODg4ICAgICAgICAgIC5vb29vLiAgIG9vby4gLm9vLiAgICAub29vb29vb28gICAgICAgICAgICAgIC5vb29vLm8gb29vbyBkOGIgb29vbyAgICBvb29cbiA4ODggICAgICAgICBgUCAgKTg4YiAgYDg4OFBcIlk4OGIgIDg4OCcgYDg4YiAgICAgICAgICAgICAgZDg4KCAgXCI4IGA4ODhcIlwiOFAgIGA4OC4gIC44J1xuIDg4OCAgICAgICAgICAub1BcIjg4OCAgIDg4OCAgIDg4OCAgODg4ICAgODg4ICAgICAgICAgICAgICBgXCJZODhiLiAgIDg4OCAgICAgICBgODguLjgnXG4gODg4ICAgICAgIG8gZDgoICA4ODggICA4ODggICA4ODggIGA4OGJvZDhQJyAgICAgICAgICAgICAgby4gICk4OGIgIDg4OCAgICAgICAgYDg4OCdcbm84ODhvb29vb29kOCBgWTg4OFwiXCI4byBvODg4byBvODg4byBgOG9vb29vby4gIG9vb29vb29vb29vIDhcIlwiODg4UCcgZDg4OGIgICAgICAgIGA4J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkXCIgICAgIFlEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiWTg4ODg4UCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBMYW5ndWFnZV9zZXJ2aWNlc1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQF9UTVBfaGFuZ2V1bCA9IHJlcXVpcmUgJ2hhbmd1bC1kaXNhc3NlbWJsZSdcbiAgICBAX1RNUF9rYW5hICAgID0gcmVxdWlyZSAnd2FuYWthbmEnXG4gICAgIyB7IHRvSGlyYWdhbmEsXG4gICAgIyAgIHRvS2FuYSxcbiAgICAjICAgdG9LYXRha2FuYVxuICAgICMgICB0b1JvbWFqaSxcbiAgICAjICAgdG9rZW5pemUsICAgICAgICAgfSA9IHJlcXVpcmUgJ3dhbmFrYW5hJ1xuICAgIDt1bmRlZmluZWRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG5vcm1hbGl6ZV90ZXh0OiAoIHRleHQsIGZvcm0gPSAnTkZDJyApIC0+IHRleHQubm9ybWFsaXplIGZvcm1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHJlbW92ZV9waW55aW5fZGlhY3JpdGljczogKCB0ZXh0ICkgLT4gKCB0ZXh0Lm5vcm1hbGl6ZSAnTkZLRCcgKS5yZXBsYWNlIC9cXFB7TH0vZ3YsICcnXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBleHRyYWN0X2F0b25hbF96aF9yZWFkaW5nczogKCBlbnRyeSApIC0+XG4gICAgIyBweTp6aMO5LCB6aGUsIHpoxIFvLCB6aMOhbywgemjHlCwgesSrXG4gICAgUiA9IGVudHJ5XG4gICAgUiA9IFIucmVwbGFjZSAvXnB5Oi92LCAnJ1xuICAgIFIgPSBSLnNwbGl0IC8sXFxzKi92XG4gICAgUiA9ICggKCBAcmVtb3ZlX3Bpbnlpbl9kaWFjcml0aWNzIHpoX3JlYWRpbmcgKSBmb3IgemhfcmVhZGluZyBpbiBSIClcbiAgICBSID0gbmV3IFNldCBSXG4gICAgUi5kZWxldGUgJ251bGwnXG4gICAgUi5kZWxldGUgJ0BudWxsJ1xuICAgIHJldHVybiBbIFIuLi4sIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGV4dHJhY3RfamFfcmVhZGluZ3M6ICggZW50cnkgKSAtPlxuICAgICMg56m6ICAgICAgaGk644Gd44KJLCDjgYLCtyjjgY9844GNfOOBkeOCiyksIOOBi+OCiSwg44GZwrco44GPfOOBi+OBmSksIOOCgOOBqsK344GX44GEXG4gICAgUiA9IGVudHJ5XG4gICAgUiA9IFIucmVwbGFjZSAvXig/OmhpfGthKTovdiwgJydcbiAgICBSID0gUi5yZXBsYWNlIC9cXHMrL2d2LCAnJ1xuICAgIFIgPSBSLnNwbGl0IC8sXFxzKi92XG4gICAgIyMjIE5PVEUgcmVtb3ZlIG5vLXJlYWRpbmdzIG1hcmtlciBgQG51bGxgIGFuZCBjb250ZXh0dWFsIHJlYWRpbmdzIGxpa2UgLeODjeODsyBmb3Ig57iBLCAt44OO44KmIGZvciDnjosgIyMjXG4gICAgUiA9ICggcmVhZGluZyBmb3IgcmVhZGluZyBpbiBSIHdoZW4gbm90IHJlYWRpbmcuc3RhcnRzV2l0aCAnLScgKVxuICAgIFIgPSBuZXcgU2V0IFJcbiAgICBSLmRlbGV0ZSAnbnVsbCdcbiAgICBSLmRlbGV0ZSAnQG51bGwnXG4gICAgcmV0dXJuIFsgUi4uLiwgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZXh0cmFjdF9oZ19yZWFkaW5nczogKCBlbnRyeSApIC0+XG4gICAgIyDnqbogICAgICBoaTrjgZ3jgoksIOOBgsK3KOOBj3zjgY1844GR44KLKSwg44GL44KJLCDjgZnCtyjjgY9844GL44GZKSwg44KA44GqwrfjgZfjgYRcbiAgICBSID0gZW50cnlcbiAgICBSID0gUi5yZXBsYWNlIC9eKD86aGcpOi92LCAnJ1xuICAgIFIgPSBSLnJlcGxhY2UgL1xccysvZ3YsICcnXG4gICAgUiA9IFIuc3BsaXQgLyxcXHMqL3ZcbiAgICBSID0gbmV3IFNldCBSXG4gICAgUi5kZWxldGUgJ251bGwnXG4gICAgUi5kZWxldGUgJ0BudWxsJ1xuICAgIGhhbmdldWwgPSBbIFIuLi4sIF0uam9pbiAnJ1xuICAgICMgZGVidWcgJ86panpyc2RiX180MScsIEBfVE1QX2hhbmdldWwuZGlzYXNzZW1ibGUgaGFuZ2V1bCwgeyBmbGF0dGVuOiBmYWxzZSwgfVxuICAgIHJldHVybiBbIFIuLi4sIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHJvbWFuaXplX2phX2thbmE6ICggZW50cnkgKSAtPlxuICAgIGNmZyA9IHt9XG4gICAgcmV0dXJuIEBfVE1QX2thbmEudG9Sb21hamkgZW50cnksIGNmZ1xuICAgICMgIyMjIHN5c3RlbWF0aWMgbmFtZSBtb3JlIGxpa2UgYC4uLl9qYV94X2thbl9sYXRuKClgICMjI1xuICAgICMgaGVscCAnzqlkamtyX180MicsIHRvSGlyYWdhbmEgICfjg6njg7zjg6Hjg7MnLCAgICAgICB7IGNvbnZlcnRMb25nVm93ZWxNYXJrOiBmYWxzZSwgfVxuICAgICMgaGVscCAnzqlkamtyX180MycsIHRvSGlyYWdhbmEgICfjg6njg7zjg6Hjg7MnLCAgICAgICB7IGNvbnZlcnRMb25nVm93ZWxNYXJrOiB0cnVlLCB9XG4gICAgIyBoZWxwICfOqWRqa3JfXzQ0JywgdG9LYW5hICAgICAgJ3dhbmFrYW5hJywgICB7IGN1c3RvbUthbmFNYXBwaW5nOiB7IG5hOiAn44GrJywga2E6ICdCYW5hJyB9LCB9XG4gICAgIyBoZWxwICfOqWRqa3JfXzQ1JywgdG9LYW5hICAgICAgJ3dhbmFrYW5hJywgICB7IGN1c3RvbUthbmFNYXBwaW5nOiB7IHdha2E6ICco5ZKM5q2MKScsIHdhOiAnKOWSjDIpJywga2E6ICco5q2MMiknLCBuYTogJyjlkI0pJywga2E6ICcoQmFuYSknLCBuYWthOiAnKOS4rSknLCB9LCB9XG4gICAgIyBoZWxwICfOqWRqa3JfXzQ2JywgdG9Sb21hamkgICAgJ+OBpOOBmOOBjuOCiicsICAgICB7IGN1c3RvbVJvbWFqaU1hcHBpbmc6IHsg44GYOiAnKHppKScsIOOBpDogJyh0dSknLCDjgoo6ICcobGkpJywg44KK44KH44GGOiAnKHJ5b3UpJywg44KK44KHOiAnKHJ5byknIH0sIH1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHBhcnNlX2lkbHg6ICggZm9ybXVsYSApIC0+IElETFgucGFyc2UgZm9ybXVsYVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgb3BlcmF0b3JzX2FuZF9jb21wb25lbnRzX2Zyb21faWRseDogKCBmb3JtdWxhICkgLT5cbiAgICBzd2l0Y2ggdHlwZSA9IHR5cGVfb2YgZm9ybXVsYVxuICAgICAgd2hlbiAndGV4dCcgICB0aGVuICBmb3JtdWxhX2FzdCA9IEBwYXJzZV9pZGx4IGZvcm11bGFcbiAgICAgIHdoZW4gJ2xpc3QnICAgdGhlbiAgZm9ybXVsYV9hc3QgPSAgICAgICAgICAgICBmb3JtdWxhXG4gICAgICBlbHNlIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX180NyBleHBlY3RlZCBhIHRleHQgb3IgYSBsaXN0LCBnb3QgYSAje3R5cGV9XCJcbiAgICBvcGVyYXRvcnMgICA9IFtdXG4gICAgY29tcG9uZW50cyAgPSBbXVxuICAgIHNlcGFyYXRlICAgID0gKCBsaXN0ICkgLT5cbiAgICAgIGZvciBlbGVtZW50LCBpZHggaW4gbGlzdFxuICAgICAgICBpZiBpZHggaXMgMFxuICAgICAgICAgIG9wZXJhdG9ycy5wdXNoIGVsZW1lbnRcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICBpZiAoIHR5cGVfb2YgZWxlbWVudCApIGlzICdsaXN0J1xuICAgICAgICAgIHNlcGFyYXRlIGVsZW1lbnRcbiAgICAgICAgICAjIGNvbXBvbmVudHMuc3BsaWNlIGNvbXBvbmVudHMubGVuZ3RoLCAwLCAoIHNlcGFyYXRlIGVsZW1lbnQgKS4uLlxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIGNvbXBvbmVudHMucHVzaCBlbGVtZW50XG4gICAgc2VwYXJhdGUgZm9ybXVsYV9hc3RcbiAgICByZXR1cm4geyBvcGVyYXRvcnMsIGNvbXBvbmVudHMsIH1cblxuXG5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyMgVEFJTlQgZ29lcyBpbnRvIGNvbnN0cnVjdG9yIG9mIEp6ciBjbGFzcyAjIyNcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIyNcblxuICAgb29vbyAgbzhvXG4gICBgODg4ICBgXCInXG4gICAgODg4IG9vb28gICAgb29vb29vb28gb29vbyAgb29vbyAgb29vbyBkOGIgIC5vb29vLlxuICAgIDg4OCBgODg4ICAgZCdcIlwiN2Q4UCAgYDg4OCAgYDg4OCAgYDg4OFwiXCI4UCBgUCAgKTg4YlxuICAgIDg4OCAgODg4ICAgICAuZDhQJyAgICA4ODggICA4ODggICA4ODggICAgICAub1BcIjg4OFxuICAgIDg4OCAgODg4ICAgLmQ4UCcgIC5QICA4ODggICA4ODggICA4ODggICAgIGQ4KCAgODg4XG4uby4gODhQIG84ODhvIGQ4ODg4ODg4UCAgIGBWODhWXCJWOFAnIGQ4ODhiICAgIGBZODg4XCJcIjhvXG5gWTg4OFBcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBKaXp1cmFcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHsgcGF0aHMsIH0gICAgICAgICAgPSBnZXRfcGF0aHNfYW5kX2Zvcm1hdHMoKVxuICAgIEBwYXRocyAgICAgICAgICAgICAgPSBwYXRoc1xuICAgIEBsYW5ndWFnZV9zZXJ2aWNlcyAgPSBuZXcgTGFuZ3VhZ2Vfc2VydmljZXMoKVxuICAgIEBkYmEgICAgICAgICAgICAgICAgPSBuZXcgSnpyX2RiX2FkYXB0ZXIgQHBhdGhzLmRiLCB7IGhvc3Q6IEAsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIEBkYmEuaXNfZnJlc2hcbiAgICAjIyMgVEFJTlQgbW92ZSB0byBKenJfZGJfYWRhcHRlciB0b2dldGhlciB3aXRoIHRyeS9jYXRjaCAjIyNcbiAgICAgIHRyeVxuICAgICAgICBAZGJhLnN0YXRlbWVudHMucG9wdWxhdGVfanpyX21pcnJvcl90cmlwbGVzLnJ1bigpXG4gICAgICBjYXRjaCBjYXVzZVxuICAgICAgICBmaWVsZHNfcnByID0gcnByIEBkYmEuc3RhdGUubW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93XG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX180OCB3aGVuIHRyeWluZyB0byBpbnNlcnQgdGhpcyByb3c6ICN7ZmllbGRzX3Jwcn0sIGFuIGVycm9yIHdhcyB0aHJvd246ICN7Y2F1c2UubWVzc2FnZX1cIiwgXFxcbiAgICAgICAgICB7IGNhdXNlLCB9XG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgIyMjIFRBSU5UIG1vdmUgdG8gSnpyX2RiX2FkYXB0ZXIgdG9nZXRoZXIgd2l0aCB0cnkvY2F0Y2ggIyMjXG4gICAgICB0cnlcbiAgICAgICAgQGRiYS5zdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9sYW5nX2hhbmdldWxfc3lsbGFibGVzLnJ1bigpXG4gICAgICBjYXRjaCBjYXVzZVxuICAgICAgICBmaWVsZHNfcnByID0gcnByIEBkYmEuc3RhdGUubW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93XG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX180OSB3aGVuIHRyeWluZyB0byBpbnNlcnQgdGhpcyByb3c6ICN7ZmllbGRzX3Jwcn0sIGFuIGVycm9yIHdhcyB0aHJvd246ICN7Y2F1c2UubWVzc2FnZX1cIiwgXFxcbiAgICAgICAgICB7IGNhdXNlLCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzaG93X2NvdW50czogLT5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRvID0+XG4gICAgICBxdWVyeSA9IFNRTFwiXCJcIlxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICAgIG12LnYgICAgICAgICAgICBhcyB2LFxuICAgICAgICAgICAgY291bnQoIHQzLnYgKSAgIGFzIGNvdW50XG4gICAgICAgICAgZnJvbSAgICAgICAganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgdDNcbiAgICAgICAgICByaWdodCBqb2luICBqenJfbWlycm9yX3ZlcmJzICAgICAgICBhcyBtdiB1c2luZyAoIHYgKVxuICAgICAgICBncm91cCBieSB2XG4gICAgICAgIG9yZGVyIGJ5IGNvdW50IGRlc2MsIHY7XCJcIlwiXG4gICAgICBlY2hvICggZ3JleSAnzqlqenJzZGJfXzUwJyApLCAoIGdvbGQgcmV2ZXJzZSBib2xkIHF1ZXJ5IClcbiAgICAgIGNvdW50cyA9ICggQGRiYS5wcmVwYXJlIHF1ZXJ5ICkuYWxsKClcbiAgICAgIGNvbnNvbGUudGFibGUgY291bnRzXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkbyA9PlxuICAgICAgcXVlcnkgPSBTUUxcIlwiXCJcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICBtdi52ICAgICAgICAgICAgYXMgdixcbiAgICAgICAgICAgIGNvdW50KCB0My52ICkgICBhcyBjb3VudFxuICAgICAgICAgIGZyb20gICAgICAgIGp6cl90cmlwbGVzICAgICAgIGFzIHQzXG4gICAgICAgICAgcmlnaHQgam9pbiAganpyX21pcnJvcl92ZXJicyAgYXMgbXYgdXNpbmcgKCB2IClcbiAgICAgICAgZ3JvdXAgYnkgdlxuICAgICAgICBvcmRlciBieSBjb3VudCBkZXNjLCB2O1wiXCJcIlxuICAgICAgZWNobyAoIGdyZXkgJ86panpyc2RiX181MScgKSwgKCBnb2xkIHJldmVyc2UgYm9sZCBxdWVyeSApXG4gICAgICBjb3VudHMgPSAoIEBkYmEucHJlcGFyZSBxdWVyeSApLmFsbCgpXG4gICAgICBjb25zb2xlLnRhYmxlIGNvdW50c1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZG8gPT5cbiAgICAgIHF1ZXJ5ID0gU1FMXCJcIlwiXG4gICAgICAgIHNlbGVjdCBkc2tleSwgY291bnQoKikgYXMgY291bnQgZnJvbSBqenJfbWlycm9yX2xpbmVzIGdyb3VwIGJ5IGRza2V5IHVuaW9uIGFsbFxuICAgICAgICBzZWxlY3QgJyonLCAgIGNvdW50KCopIGFzIGNvdW50IGZyb20ganpyX21pcnJvcl9saW5lc1xuICAgICAgICBvcmRlciBieSBjb3VudCBkZXNjO1wiXCJcIlxuICAgICAgZWNobyAoIGdyZXkgJ86panpyc2RiX181MicgKSwgKCBnb2xkIHJldmVyc2UgYm9sZCBxdWVyeSApXG4gICAgICBjb3VudHMgPSAoIEBkYmEucHJlcGFyZSBxdWVyeSApLmFsbCgpXG4gICAgICBjb3VudHMgPSBPYmplY3QuZnJvbUVudHJpZXMgKCBbIGRza2V5LCB7IGNvdW50LCB9LCBdIGZvciB7IGRza2V5LCBjb3VudCwgfSBpbiBjb3VudHMgKVxuICAgICAgY29uc29sZS50YWJsZSBjb3VudHNcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzaG93X2p6cl9tZXRhX2ZhdWx0czogLT5cbiAgICBpZiAoIGZhdWx0eV9yb3dzID0gKCBAZGJhLnByZXBhcmUgU1FMXCJzZWxlY3QgKiBmcm9tIGp6cl9tZXRhX2ZhdWx0cztcIiApLmFsbCgpICkubGVuZ3RoID4gMFxuICAgICAgZWNobyAnzqlqenJzZGJfXzUzJywgcmVkIHJldmVyc2UgYm9sZCBcIiBmb3VuZCBzb21lIGZhdWx0czogXCJcbiAgICAgIGNvbnNvbGUudGFibGUgZmF1bHR5X3Jvd3NcbiAgICBlbHNlXG4gICAgICBlY2hvICfOqWp6cnNkYl9fNTQnLCBsaW1lIHJldmVyc2UgYm9sZCBcIiAobm8gZmF1bHRzKSBcIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbm1vZHVsZS5leHBvcnRzID0gZG8gPT5cbiAgaW50ZXJuYWxzID0ge1xuICAgIEp6cl9kYl9hZGFwdGVyLFxuICAgIERhdGFzb3VyY2VfZmllbGRfcGFyc2VyLFxuICAgIGRhdGFzb3VyY2VfZm9ybWF0X3BhcnNlcixcbiAgICBMYW5ndWFnZV9zZXJ2aWNlcyxcbiAgICBnZXRfcGF0aHNfYW5kX2Zvcm1hdHMsIH1cbiAgcmV0dXJuIHtcbiAgICBKaXp1cmEsXG4gICAgaW50ZXJuYWxzLCB9XG5cbiJdfQ==
