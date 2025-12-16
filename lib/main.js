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
    formats['ds:dict:x:ko-Hang+Latn'] = 'tsv';
    formats['ds:dict:x:ja-Kan+Latn'] = 'tsv';
    formats['ds:dict:bcp47'] = 'tsv';
    formats['ds:dict:ja:kanjium'] = 'txt';
    formats['ds:dict:ja:kanjium:aux'] = 'txt';
    formats['ds:dict:ko:V=data-gov.csv'] = 'csv';
    formats['ds:dict:ko:V=data-gov.json'] = 'json';
    formats['ds:dict:ko:V=data-naver.csv'] = 'csv';
    formats['ds:dict:ko:V=data-naver.json'] = 'json';
    formats['ds:dict:ko:V=README.md'] = 'md';
    formats['ds:dict:meanings'] = 'tsv';
    formats['ds:shape:idsv2'] = 'tsv';
    formats['ds:shape:zhz5bf'] = 'tsv';
    formats['ds:ucdb:rsgs'] = 'md:table';
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
            v: 'v:c:shape:ids:shortest',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:shape:ids:shortest:ast',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:shape:ids:shortest:error',
            o: "NN"
          }
        ];
// { rank: 2, s: "NN", v: 'v:c:shape:ids:has-operator',   o: "NN", }
// { rank: 2, s: "NN", v: 'v:c:shape:ids:has-component',  o: "NN", }
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
          format: 'tsv',
          comment: 'NN'
        });
        this.statements.insert_jzr_datasource_format.run({
          format: 'md:table',
          comment: 'NN'
        });
        this.statements.insert_jzr_datasource_format.run({
          format: 'csv',
          comment: 'NN'
        });
        this.statements.insert_jzr_datasource_format.run({
          format: 'json',
          comment: 'NN'
        });
        this.statements.insert_jzr_datasource_format.run({
          format: 'md',
          comment: 'NN'
        });
        this.statements.insert_jzr_datasource_format.run({
          format: 'txt',
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
          v: 'v:c:shape:ids:shortest',
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
            v: 'v:c:shape:ids:shortest:error',
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
constraint "Ωconstraint__10" check ( rowid regexp '^.*$')
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
  name        text    not null,
  glyphrange  text    not null,
primary key ( rowid ),
constraint "Ωconstraint__11" foreign key ( glyphrange ) references jzr_glyphranges ( rowid ),
constraint "Ωconstraint__12" check ( rowid regexp '^.*$')
);`,
      //.......................................................................................................
      SQL`create table jzr_datasource_formats (
  rowid     text    unique  not null generated always as ( 't:ds:f:V=' || format ) stored,
  format    text    unique  not null,
  comment   text            not null
-- primary key ( rowid ),
-- check ( rowid regexp '^t:ds:R=\\d+$' )
);`,
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
constraint "Ωconstraint__20" foreign key ( v   ) references jzr_mirror_verbs ( v ) );`,
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
    * walk_tsv() {
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
    * walk_md_table() {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsS0FBQSxFQUFBLHVCQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxFQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQSxjQUFBLEVBQUEsaUJBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLHdCQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxjQUFBLEVBQUEsb0JBQUEsRUFBQSx1QkFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLHFCQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEseUJBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUE7OztFQUdBLEdBQUEsR0FBNEIsT0FBQSxDQUFRLEtBQVI7O0VBQzVCLENBQUEsQ0FBRSxLQUFGLEVBQ0UsS0FERixFQUVFLElBRkYsRUFHRSxJQUhGLEVBSUUsS0FKRixFQUtFLE1BTEYsRUFNRSxJQU5GLEVBT0UsSUFQRixFQVFFLE9BUkYsQ0FBQSxHQVE0QixHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVIsQ0FBb0IsbUJBQXBCLENBUjVCOztFQVNBLENBQUEsQ0FBRSxHQUFGLEVBQ0UsT0FERixFQUVFLElBRkYsRUFHRSxLQUhGLEVB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LE1BQUEsS0FBVSxPQUFPLENBQUMsSUFBckI7SUFBa0MsQ0FBQSxDQUFBLENBQUEsR0FBQTtNQUNoQyxJQUFBLENBQUE7TUFDQSxvQkFBQSxDQUFBLEVBREY7O2FBR0c7SUFKK0IsQ0FBQSxJQUFsQzs7QUExMkNBIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0J1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbkdVWSAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXknXG57IGFsZXJ0XG4gIGRlYnVnXG4gIGhlbHBcbiAgaW5mb1xuICBwbGFpblxuICBwcmFpc2VcbiAgdXJnZVxuICB3YXJuXG4gIHdoaXNwZXIgfSAgICAgICAgICAgICAgID0gR1VZLnRybS5nZXRfbG9nZ2VycyAnaml6dXJhLXNvdXJjZXMtZGInXG57IHJwclxuICBpbnNwZWN0XG4gIGVjaG9cbiAgd2hpdGVcbiAgZ3JlZW5cbiAgYmx1ZVxuICBsaW1lXG4gIGdvbGRcbiAgZ3JleVxuICByZWRcbiAgYm9sZFxuICByZXZlcnNlXG4gIGxvZyAgICAgfSAgICAgICAgICAgICAgID0gR1VZLnRybVxuIyB7IGYgfSAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2VmZnN0cmluZydcbiMgd3JpdGUgICAgICAgICAgICAgICAgICAgICA9ICggcCApIC0+IHByb2Nlc3Muc3Rkb3V0LndyaXRlIHBcbiMgeyBuZmEgfSAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ub3JtYWxpemUtZnVuY3Rpb24tYXJndW1lbnRzJ1xuIyBHVE5HICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2d1eS10ZXN0LU5HJ1xuIyB7IFRlc3QgICAgICAgICAgICAgICAgICB9ID0gR1ROR1xuRlMgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6ZnMnXG5QQVRIICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpwYXRoJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5Cc3FsMyAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYmV0dGVyLXNxbGl0ZTMnXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblNGTU9EVUxFUyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvYnJpY2FicmFjLXNmbW9kdWxlcydcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBEYnJpYyxcbiAgRGJyaWNfc3RkLFxuICBTUUwsICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2RicmljKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBsZXRzLFxuICBmcmVlemUsICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2xldHNmcmVlemV0aGF0X2luZnJhKCkuc2ltcGxlXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgSmV0c3RyZWFtLFxuICBBc3luY19qZXRzdHJlYW0sICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2pldHN0cmVhbSgpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgd2Fsa19saW5lc193aXRoX3Bvc2l0aW9uc1xuICAgICAgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2Zhc3RfbGluZXJlYWRlcigpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgQmVuY2htYXJrZXIsICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9iZW5jaG1hcmtpbmcoKVxuYmVuY2htYXJrZXIgICAgICAgICAgICAgICAgICAgPSBuZXcgQmVuY2htYXJrZXIoKVxudGltZWl0ICAgICAgICAgICAgICAgICAgICAgICAgPSAoIFAuLi4gKSAtPiBiZW5jaG1hcmtlci50aW1laXQgUC4uLlxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IHNldF9nZXR0ZXIsICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfbWFuYWdlZF9wcm9wZXJ0eV90b29scygpXG57IElETCwgSURMWCwgICAgICAgICAgICB9ID0gcmVxdWlyZSAnbW9qaWt1cmEtaWRsJ1xueyB0eXBlX29mLCAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX3R5cGVfb2YoKVxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmZyb21fYm9vbCAgICAgICAgICAgICAgICAgICAgID0gKCB4ICkgLT4gc3dpdGNoIHhcbiAgd2hlbiB0cnVlICB0aGVuIDFcbiAgd2hlbiBmYWxzZSB0aGVuIDBcbiAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fXzEgZXhwZWN0ZWQgdHJ1ZSBvciBmYWxzZSwgZ290ICN7cnByIHh9XCJcbmFzX2Jvb2wgICAgICAgICAgICAgICAgICAgICAgID0gKCB4ICkgLT4gc3dpdGNoIHhcbiAgd2hlbiAxIHRoZW4gdHJ1ZVxuICB3aGVuIDAgdGhlbiBmYWxzZVxuICBlbHNlIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX19fMiBleHBlY3RlZCAwIG9yIDEsIGdvdCAje3JwciB4fVwiXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZGVtb19zb3VyY2VfaWRlbnRpZmllcnMgPSAtPlxuICB7IGV4cGFuZF9kaWN0aW9uYXJ5LCAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9kaWN0aW9uYXJ5X3Rvb2xzKClcbiAgeyBnZXRfbG9jYWxfZGVzdGluYXRpb25zLCB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfZ2V0X2xvY2FsX2Rlc3RpbmF0aW9ucygpXG4gIGZvciBrZXksIHZhbHVlIG9mIGdldF9sb2NhbF9kZXN0aW5hdGlvbnMoKVxuICAgIGRlYnVnICfOqWp6cnNkYl9fXzMnLCBrZXksIHZhbHVlXG4gICMgY2FuIGFwcGVuZCBsaW5lIG51bWJlcnMgdG8gZmlsZXMgYXMgaW46XG4gICMgJ2RzOmRpY3Q6bWVhbmluZ3MuMTpMPTEzMzMyJ1xuICAjICdkczpkaWN0OnVjZDE0MC4xOnVoZGlkeDpMPTEyMzQnXG4gICMgcm93aWRzOiAndDpqZm06Uj0xJ1xuICAjIHtcbiAgIyAgICdkczpkaWN0Om1lYW5pbmdzJzogICAgICAgICAgJyRqenJkcy9tZWFuaW5nL21lYW5pbmdzLnR4dCdcbiAgIyAgICdkczpkaWN0OnVjZDp2MTQuMDp1aGRpZHgnIDogJyRqenJkcy91bmljb2RlLm9yZy11Y2QtdjE0LjAvVW5paGFuX0RpY3Rpb25hcnlJbmRpY2VzLnR4dCdcbiAgIyAgIH1cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIyNcblxuICAgICAgICAgICAgICAgICAgICAgICAgIC4gICBvb29vXG4gICAgICAgICAgICAgICAgICAgICAgIC5vOCAgIGA4ODhcbm9vLm9vb29vLiAgIC5vb29vLiAgIC5vODg4b28gIDg4OCAub28uICAgIC5vb29vLm9cbiA4ODgnIGA4OGIgYFAgICk4OGIgICAgODg4ICAgIDg4OFBcIlk4OGIgIGQ4OCggIFwiOFxuIDg4OCAgIDg4OCAgLm9QXCI4ODggICAgODg4ICAgIDg4OCAgIDg4OCAgYFwiWTg4Yi5cbiA4ODggICA4ODggZDgoICA4ODggICAgODg4IC4gIDg4OCAgIDg4OCAgby4gICk4OGJcbiA4ODhib2Q4UCcgYFk4ODhcIlwiOG8gICBcIjg4OFwiIG84ODhvIG84ODhvIDhcIlwiODg4UCdcbiA4ODhcbm84ODhvXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5nZXRfcGF0aHNfYW5kX2Zvcm1hdHMgPSAtPlxuICBwYXRocyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IHt9XG4gIGZvcm1hdHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0ge31cbiAgUiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSB7IHBhdGhzLCBmb3JtYXRzLCB9XG4gIHBhdGhzLmJhc2UgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5yZXNvbHZlIF9fZGlybmFtZSwgJy4uJ1xuICBwYXRocy5qenIgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEgucmVzb2x2ZSBwYXRocy5iYXNlLCAnLi4nXG4gIHBhdGhzLmRiICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIHBhdGhzLmJhc2UsICdqenIuZGInXG4gICMgcGF0aHMuZGIgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSAnL2Rldi9zaG0vanpyLmRiJ1xuICAjIHBhdGhzLmp6cmRzICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIHBhdGhzLmJhc2UsICdqenJkcydcbiAgcGF0aHMuanpybmRzICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gcGF0aHMuYmFzZSwgJ2ppenVyYS1uZXctZGF0YXNvdXJjZXMnXG4gIHBhdGhzLm1vamlrdXJhICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIHBhdGhzLmp6cm5kcywgJ21vamlrdXJhJ1xuICBwYXRocy5yYXdfZ2l0aHViICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBwYXRocy5qenJuZHMsICdidmZzL29yaWdpbi9odHRwcy9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tJ1xuICBrYW5qaXVtICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBwYXRocy5yYXdfZ2l0aHViLCAnbWlmdW5ldG9zaGlyby9rYW5qaXVtLzhhMGNkYWExNmQ2NGEyODFhMjA0OGRlMmVlZTJlYzVlM2E0NDBmYTYnXG4gIHJ1dG9waW8gICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIHBhdGhzLnJhd19naXRodWIsICdydXRvcGlvL0tvcmVhbi1OYW1lLUhhbmphLUNoYXJzZXQvMTJkZjFiYTFiNGRmYWEwOTU4MTNlNGRkZmJhNDI0ZTgxNmY5NGM1MydcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjIHBhdGhzWyAnZHM6ZGljdDp1Y2Q6djE0LjA6dWhkaWR4JyAgICAgIF0gICA9IFBBVEguam9pbiBwYXRocy5qenJuZHMsICd1bmljb2RlLm9yZy11Y2QtdjE0LjAvVW5paGFuX0RpY3Rpb25hcnlJbmRpY2VzLnR4dCdcbiAgcGF0aHNbICdkczpkaWN0Ong6a28tSGFuZytMYXRuJyAgICAgICAgXSAgID0gUEFUSC5qb2luIHBhdGhzLmp6cm5kcywgJ2hhbmdldWwtdHJhbnNjcmlwdGlvbnMudHN2J1xuICBwYXRoc1sgJ2RzOmRpY3Q6eDpqYS1LYW4rTGF0bicgICAgICAgICBdICAgPSBQQVRILmpvaW4gcGF0aHMuanpybmRzLCAna2FuYS10cmFuc2NyaXB0aW9ucy50c3YnXG4gIHBhdGhzWyAnZHM6ZGljdDpiY3A0NycgICAgICAgICAgICAgICAgIF0gICA9IFBBVEguam9pbiBwYXRocy5qenJuZHMsICdCQ1A0Ny1sYW5ndWFnZS1zY3JpcHRzLXJlZ2lvbnMudHN2J1xuICBwYXRoc1sgJ2RzOmRpY3Q6amE6a2Fuaml1bScgICAgICAgICAgICBdICAgPSBQQVRILmpvaW4ga2Fuaml1bSwgJ2RhdGEvc291cmNlX2ZpbGVzL2thbmppZGljdC50eHQnXG4gIHBhdGhzWyAnZHM6ZGljdDpqYTprYW5qaXVtOmF1eCcgICAgICAgIF0gICA9IFBBVEguam9pbiBrYW5qaXVtLCAnZGF0YS9zb3VyY2VfZmlsZXMvMF9SRUFETUUudHh0J1xuICBwYXRoc1sgJ2RzOmRpY3Q6a286Vj1kYXRhLWdvdi5jc3YnICAgICBdICAgPSBQQVRILmpvaW4gcnV0b3BpbywgJ2RhdGEtZ292LmNzdidcbiAgcGF0aHNbICdkczpkaWN0OmtvOlY9ZGF0YS1nb3YuanNvbicgICAgXSAgID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLWdvdi5qc29uJ1xuICBwYXRoc1sgJ2RzOmRpY3Q6a286Vj1kYXRhLW5hdmVyLmNzdicgICBdICAgPSBQQVRILmpvaW4gcnV0b3BpbywgJ2RhdGEtbmF2ZXIuY3N2J1xuICBwYXRoc1sgJ2RzOmRpY3Q6a286Vj1kYXRhLW5hdmVyLmpzb24nICBdICAgPSBQQVRILmpvaW4gcnV0b3BpbywgJ2RhdGEtbmF2ZXIuanNvbidcbiAgcGF0aHNbICdkczpkaWN0OmtvOlY9UkVBRE1FLm1kJyAgICAgICAgXSAgID0gUEFUSC5qb2luIHJ1dG9waW8sICdSRUFETUUubWQnXG4gIHBhdGhzWyAnZHM6ZGljdDptZWFuaW5ncycgICAgICAgICAgICAgIF0gICA9IFBBVEguam9pbiBwYXRocy5tb2ppa3VyYSwgJ21lYW5pbmcvbWVhbmluZ3MudHh0J1xuICBwYXRoc1sgJ2RzOnNoYXBlOmlkc3YyJyAgICAgICAgICAgICAgICBdICAgPSBQQVRILmpvaW4gcGF0aHMubW9qaWt1cmEsICdzaGFwZS9zaGFwZS1icmVha2Rvd24tZm9ybXVsYS12Mi50eHQnXG4gIHBhdGhzWyAnZHM6c2hhcGU6emh6NWJmJyAgICAgICAgICAgICAgIF0gICA9IFBBVEguam9pbiBwYXRocy5tb2ppa3VyYSwgJ3NoYXBlL3NoYXBlLXN0cm9rZW9yZGVyLXpoYXppd3ViaWZhLnR4dCdcbiAgcGF0aHNbICdkczp1Y2RiOnJzZ3MnICAgICAgICAgICAgICAgICAgXSAgID0gUEFUSC5qb2luIHBhdGhzLm1vamlrdXJhLCAndWNkYi9jZmcvcnNncy1hbmQtYmxvY2tzLm1kJ1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMgZm9ybWF0c1sgJ2RzOmRpY3Q6dWNkOnYxNC4wOnVoZGlkeCcgICAgICBdICAgPSAsICd1bmljb2RlLm9yZy11Y2QtdjE0LjAvVW5paGFuX0RpY3Rpb25hcnlJbmRpY2VzLnR4dCdcbiAgZm9ybWF0c1sgJ2RzOmRpY3Q6eDprby1IYW5nK0xhdG4nICAgICAgICBdICAgPSAndHN2J1xuICBmb3JtYXRzWyAnZHM6ZGljdDp4OmphLUthbitMYXRuJyAgICAgICAgIF0gICA9ICd0c3YnXG4gIGZvcm1hdHNbICdkczpkaWN0OmJjcDQ3JyAgICAgICAgICAgICAgICAgXSAgID0gJ3RzdidcbiAgZm9ybWF0c1sgJ2RzOmRpY3Q6amE6a2Fuaml1bScgICAgICAgICAgICBdICAgPSAndHh0J1xuICBmb3JtYXRzWyAnZHM6ZGljdDpqYTprYW5qaXVtOmF1eCcgICAgICAgIF0gICA9ICd0eHQnXG4gIGZvcm1hdHNbICdkczpkaWN0OmtvOlY9ZGF0YS1nb3YuY3N2JyAgICAgXSAgID0gJ2NzdidcbiAgZm9ybWF0c1sgJ2RzOmRpY3Q6a286Vj1kYXRhLWdvdi5qc29uJyAgICBdICAgPSAnanNvbidcbiAgZm9ybWF0c1sgJ2RzOmRpY3Q6a286Vj1kYXRhLW5hdmVyLmNzdicgICBdICAgPSAnY3N2J1xuICBmb3JtYXRzWyAnZHM6ZGljdDprbzpWPWRhdGEtbmF2ZXIuanNvbicgIF0gICA9ICdqc29uJ1xuICBmb3JtYXRzWyAnZHM6ZGljdDprbzpWPVJFQURNRS5tZCcgICAgICAgIF0gICA9ICdtZCdcbiAgZm9ybWF0c1sgJ2RzOmRpY3Q6bWVhbmluZ3MnICAgICAgICAgICAgICBdICAgPSAndHN2J1xuICBmb3JtYXRzWyAnZHM6c2hhcGU6aWRzdjInICAgICAgICAgICAgICAgIF0gICA9ICd0c3YnXG4gIGZvcm1hdHNbICdkczpzaGFwZTp6aHo1YmYnICAgICAgICAgICAgICAgXSAgID0gJ3RzdidcbiAgZm9ybWF0c1sgJ2RzOnVjZGI6cnNncycgICAgICAgICAgICAgICAgICBdICAgPSAnbWQ6dGFibGUnXG4gIHJldHVybiBSXG5cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEp6cl9kYl9hZGFwdGVyIGV4dGVuZHMgRGJyaWNfc3RkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAZGJfY2xhc3M6ICBCc3FsM1xuICBAcHJlZml4OiAgICAnanpyJ1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6ICggZGJfcGF0aCwgY2ZnID0ge30gKSAtPlxuICAgICMjIyBUQUlOVCBuZWVkIG1vcmUgY2xhcml0eSBhYm91dCB3aGVuIHN0YXRlbWVudHMsIGJ1aWxkLCBpbml0aWFsaXplLi4uIGlzIHBlcmZvcm1lZCAjIyNcbiAgICB7IGhvc3QsIH0gPSBjZmdcbiAgICBjZmcgICAgICAgPSBsZXRzIGNmZywgKCBjZmcgKSAtPiBkZWxldGUgY2ZnLmhvc3RcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHN1cGVyIGRiX3BhdGgsIGNmZ1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQGhvc3QgICA9IGhvc3RcbiAgICBAc3RhdGUgID0geyB0cmlwbGVfY291bnQ6IDAsIG1vc3RfcmVjZW50X2luc2VydGVkX3JvdzogbnVsbCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkbyA9PlxuICAgICAgIyMjIFRBSU5UIHRoaXMgaXMgbm90IHdlbGwgcGxhY2VkICMjI1xuICAgICAgIyMjIE5PVEUgZXhlY3V0ZSBhIEdhcHMtYW5kLUlzbGFuZHMgRVNTRlJJIHRvIGltcHJvdmUgc3RydWN0dXJhbCBpbnRlZ3JpdHkgYXNzdXJhbmNlOiAjIyNcbiAgICAgICMgKCBAcHJlcGFyZSBTUUxcInNlbGVjdCAqIGZyb20gX2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzIHdoZXJlIGZhbHNlO1wiICkuZ2V0KClcbiAgICAgIG1lc3NhZ2VzID0gW11cbiAgICAgIGZvciB7IG5hbWUsIHR5cGUsIH0gZnJvbSBAc3RhdGVtZW50cy5zdGRfZ2V0X3JlbGF0aW9ucy5pdGVyYXRlKClcbiAgICAgICAgdHJ5XG4gICAgICAgICAgKCBAcHJlcGFyZSBTUUxcInNlbGVjdCAqIGZyb20gI3tuYW1lfSB3aGVyZSBmYWxzZTtcIiApLmFsbCgpXG4gICAgICAgIGNhdGNoIGVycm9yXG4gICAgICAgICAgbWVzc2FnZXMucHVzaCBcIiN7dHlwZX0gI3tuYW1lfTogI3tlcnJvci5tZXNzYWdlfVwiXG4gICAgICAgICAgd2FybiAnzqlqenJzZGJfX180JywgZXJyb3IubWVzc2FnZVxuICAgICAgcmV0dXJuIG51bGwgaWYgbWVzc2FnZXMubGVuZ3RoIGlzIDBcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX19fNSBFRkZSSSB0ZXN0aW5nIHJldmVhbGVkIGVycm9yczogI3tycHIgbWVzc2FnZXN9XCJcbiAgICAgIDtudWxsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiBAaXNfZnJlc2hcbiAgICAgIEBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZV9mb3JtYXRzKClcbiAgICAgIEBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZXMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdmVyYnMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGNvZGVzKClcbiAgICAgIEBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzKClcbiAgICAgIEBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZ2x5cGhyYW5nZSgpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzZXRfZ2V0dGVyIEA6OiwgJ25leHRfdHJpcGxlX3Jvd2lkJywgLT4gXCJ0Om1yOjNwbDpSPSN7KytAc3RhdGUudHJpcGxlX2NvdW50fVwiXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAjIyNcblxuICAgLm84ICAgICAgICAgICAgICAgICAgICBvOG8gIG9vb28gICAgICAgIC5vOFxuICBcIjg4OCAgICAgICAgICAgICAgICAgICAgYFwiJyAgYDg4OCAgICAgICBcIjg4OFxuICAgODg4b29vby4gIG9vb28gIG9vb28gIG9vb28gICA4ODggICAub29vbzg4OFxuICAgZDg4JyBgODhiIGA4ODggIGA4ODggIGA4ODggICA4ODggIGQ4OCcgYDg4OFxuICAgODg4ICAgODg4ICA4ODggICA4ODggICA4ODggICA4ODggIDg4OCAgIDg4OFxuICAgODg4ICAgODg4ICA4ODggICA4ODggICA4ODggICA4ODggIDg4OCAgIDg4OFxuICAgYFk4Ym9kOFAnICBgVjg4VlwiVjhQJyBvODg4byBvODg4byBgWThib2Q4OFBcIlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBAYnVpbGQ6IFtcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl91cm5zIChcbiAgICAgICAgdXJuICAgICB0ZXh0ICAgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgY29tbWVudCB0ZXh0ICAgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggdXJuICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X19fNlwiIGNoZWNrICggdXJuIHJlZ2V4cCAnXltcXFxcLVxcXFwrXFxcXC46YS16QS1aMC05XSskJyApIClcbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9nbHlwaHJhbmdlcyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoICd0OnVjOnJzZzpWPScgfHwgcnNnICksXG4gICAgICAgIHJzZyAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGlzX2NqayAgICBib29sZWFuICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxvICAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGhpICAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIC0tIGxvX2dseXBoICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGNoYXIoIGxvICkgKSBzdG9yZWQsXG4gICAgICAgIC0tIGhpX2dseXBoICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGNoYXIoIGhpICkgKSBzdG9yZWQsXG4gICAgICAgIG5hbWUgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAtLSBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X19fN1wiIGNoZWNrICggbG8gYmV0d2VlbiAweDAwMDAwMCBhbmQgMHgxMGZmZmYgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfX184XCIgY2hlY2sgKCBoaSBiZXR3ZWVuIDB4MDAwMDAwIGFuZCAweDEwZmZmZiApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fXzlcIiBjaGVjayAoIGxvIDw9IGhpICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18xMFwiIGNoZWNrICggcm93aWQgcmVnZXhwICdeLiokJylcbiAgICAgICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9jamtfZ2x5cGhyYW5nZXMgYXMgc2VsZWN0XG4gICAgICAgICpcbiAgICAgIGZyb20ganpyX2dseXBocmFuZ2VzXG4gICAgICB3aGVyZSBpc19jamtcbiAgICAgIG9yZGVyIGJ5IGxvO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2dseXBoc2V0cyAoXG4gICAgICAgIHJvd2lkICAgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgbmFtZSAgICAgICAgdGV4dCAgICBub3QgbnVsbCxcbiAgICAgICAgZ2x5cGhyYW5nZSAgdGV4dCAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzExXCIgZm9yZWlnbiBrZXkgKCBnbHlwaHJhbmdlICkgcmVmZXJlbmNlcyBqenJfZ2x5cGhyYW5nZXMgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTJcIiBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXi4qJCcpXG4gICAgICApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2RhdGFzb3VyY2VfZm9ybWF0cyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoICd0OmRzOmY6Vj0nIHx8IGZvcm1hdCApIHN0b3JlZCxcbiAgICAgICAgZm9ybWF0ICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgY29tbWVudCAgIHRleHQgICAgICAgICAgICBub3QgbnVsbFxuICAgICAgLS0gcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgLS0gY2hlY2sgKCByb3dpZCByZWdleHAgJ150OmRzOlI9XFxcXGQrJCcgKVxuICAgICAgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9kYXRhc291cmNlcyAoXG4gICAgICAgIGRza2V5ICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGZvcm1hdCAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHBhdGggICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIGRza2V5ICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18xM1wiIGZvcmVpZ24ga2V5ICggZm9ybWF0ICkgcmVmZXJlbmNlcyBqenJfZGF0YXNvdXJjZV9mb3JtYXRzICggZm9ybWF0IClcbiAgICAgICk7XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdHJpZ2dlciBqenJfZGF0YXNvdXJjZXNfaW5zZXJ0XG4gICAgICBiZWZvcmUgaW5zZXJ0IG9uIGp6cl9kYXRhc291cmNlc1xuICAgICAgZm9yIGVhY2ggcm93IGJlZ2luXG4gICAgICAgIHNlbGVjdCB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfZGF0YXNvdXJjZXMnLFxuICAgICAgICAgICdkc2tleTonLCBuZXcuZHNrZXksICdmb3JtYXQ6JywgbmV3LmZvcm1hdCwgJ3BhdGg6JywgbmV3LnBhdGggKTtcbiAgICAgICAgaW5zZXJ0IGludG8ganpyX3VybnMgKCB1cm4sIGNvbW1lbnQgKSB2YWx1ZXMgKCBuZXcuZHNrZXksICdmb3JtYXQ6ICcgfHwgbmV3LmZvcm1hdCB8fCAnLCBwYXRoOiAnIHx8IG5ldy5wYXRoICk7XG4gICAgICAgIGVuZDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfbGNvZGVzIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgbGNvZGUgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgY29tbWVudCAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzE0XCIgY2hlY2sgKCBsY29kZSByZWdleHAgJ15bYS16QS1aXStbYS16QS1aMC05XSokJyApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTVcIiBjaGVjayAoIHJvd2lkID0gJ3Q6bXI6bGM6Vj0nIHx8IGxjb2RlICkgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfbGluZXMgKFxuICAgICAgICAtLSAndDpqZm06J1xuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsIGdlbmVyYXRlZCBhbHdheXMgYXMgKCAndDptcjpsbjpkcz0nIHx8IGRza2V5IHx8ICc6TD0nIHx8IGxpbmVfbnIgKSBzdG9yZWQsXG4gICAgICAgIHJlZiAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoICAgICAgICAgICAgICAgICAgZHNrZXkgfHwgJzpMPScgfHwgbGluZV9uciApIHZpcnR1YWwsXG4gICAgICAgIGRza2V5ICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmVfbnIgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxjb2RlICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmUgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGpmaWVsZHMgICBqc29uICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAtLSBwcmltYXJ5IGtleSAoIHJvd2lkICksICAgICAgICAgICAgICAgICAgICAgICAgICAgLS0gIyMjIE5PVEUgRXhwZXJpbWVudGFsOiBubyBleHBsaWNpdCBQSywgaW5zdGVhZCBnZW5lcmF0ZWQgYHJvd2lkYCBjb2x1bW5cbiAgICAgIC0tIGNoZWNrICggcm93aWQgcmVnZXhwICdedDptcjpsbjpkcz0uKzpMPVxcXFxkKyQnKSwgIC0tICMjIyBOT1RFIG5vIG5lZWQgdG8gY2hlY2sgYXMgdmFsdWUgaXMgZ2VuZXJhdGVkICMjI1xuICAgICAgdW5pcXVlICggZHNrZXksIGxpbmVfbnIgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzE2XCIgZm9yZWlnbiBrZXkgKCBsY29kZSApIHJlZmVyZW5jZXMganpyX21pcnJvcl9sY29kZXMgKCBsY29kZSApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX3ZlcmJzIChcbiAgICAgICAgcmFuayAgICAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCBkZWZhdWx0IDEsXG4gICAgICAgIHMgICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHYgICAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIG8gICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHYgKSxcbiAgICAgIC0tIGNoZWNrICggcm93aWQgcmVnZXhwICdedDptcjp2YjpWPVtcXFxcLTpcXFxcK1xcXFxwe0x9XSskJyApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTdcIiBjaGVjayAoIHJhbmsgPiAwICkgKTtcIlwiXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9taXJyb3JfdmVyYnNfaW5zZXJ0XG4gICAgICBiZWZvcmUgaW5zZXJ0IG9uIGp6cl9taXJyb3JfdmVyYnNcbiAgICAgIGZvciBlYWNoIHJvdyBiZWdpblxuICAgICAgICBzZWxlY3QgdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0KCAnanpyX21pcnJvcl92ZXJicycsXG4gICAgICAgICAgJ3Jhbms6JywgbmV3LnJhbmssICdzOicsIG5ldy5zLCAndjonLCBuZXcudiwgJ286JywgbmV3Lm8gKTtcbiAgICAgICAgaW5zZXJ0IGludG8ganpyX3VybnMgKCB1cm4sIGNvbW1lbnQgKSB2YWx1ZXMgKCBuZXcudiwgJ3M6ICcgfHwgbmV3LnMgfHwgJywgbzogJyB8fCBuZXcubyApO1xuICAgICAgICBlbmQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHJlZiAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHMgICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHYgICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIG8gICAgICAgICBqc29uICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18xOFwiIGNoZWNrICggcm93aWQgcmVnZXhwICdedDptcjozcGw6Uj1cXFxcZCskJyApLFxuICAgICAgLS0gdW5pcXVlICggcmVmLCBzLCB2LCBvIClcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzE5XCIgZm9yZWlnbiBrZXkgKCByZWYgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfbGluZXMgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjBcIiBmb3JlaWduIGtleSAoIHYgICApIHJlZmVyZW5jZXMganpyX21pcnJvcl92ZXJicyAoIHYgKSApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdHJpZ2dlciBqenJfbWlycm9yX3RyaXBsZXNfcmVnaXN0ZXJcbiAgICAgIGJlZm9yZSBpbnNlcnQgb24ganpyX21pcnJvcl90cmlwbGVzX2Jhc2VcbiAgICAgIGZvciBlYWNoIHJvdyBiZWdpblxuICAgICAgICBzZWxlY3QgdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0KCAnanpyX21pcnJvcl90cmlwbGVzX2Jhc2UnLFxuICAgICAgICAgICdyb3dpZDonLCBuZXcucm93aWQsICdyZWY6JywgbmV3LnJlZiwgJ3M6JywgbmV3LnMsICd2OicsIG5ldy52LCAnbzonLCBuZXcubyApO1xuICAgICAgICBlbmQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyAoXG4gICAgICAgIHJvd2lkICAgICAgICAgICB0ZXh0ICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByZWYgICAgICAgICAgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgc3lsbGFibGVfaGFuZyAgIHRleHQgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHN5bGxhYmxlX2xhdG4gICB0ZXh0ICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggaW5pdGlhbF9sYXRuIHx8IG1lZGlhbF9sYXRuIHx8IGZpbmFsX2xhdG4gKSB2aXJ0dWFsLFxuICAgICAgICAtLSBzeWxsYWJsZV9sYXRuICAgdGV4dCAgdW5pcXVlICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggaW5pdGlhbF9sYXRuIHx8IG1lZGlhbF9sYXRuIHx8IGZpbmFsX2xhdG4gKSB2aXJ0dWFsLFxuICAgICAgICBpbml0aWFsX2hhbmcgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbWVkaWFsX2hhbmcgICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpbmFsX2hhbmcgICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBpbml0aWFsX2xhdG4gICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbWVkaWFsX2xhdG4gICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpbmFsX2xhdG4gICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjFcIiBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bGFuZzpoYW5nOnN5bDpWPVxcXFxTKyQnIClcbiAgICAgIC0tIHVuaXF1ZSAoIHJlZiwgcywgdiwgbyApXG4gICAgICAtLSBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18yMlwiIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xpbmVzICggcm93aWQgKVxuICAgICAgLS0gY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjNcIiBmb3JlaWduIGtleSAoIHN5bGxhYmxlX2hhbmcgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICggbyApIClcbiAgICAgICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzX3JlZ2lzdGVyXG4gICAgICBiZWZvcmUgaW5zZXJ0IG9uIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzXG4gICAgICBmb3IgZWFjaCByb3cgYmVnaW5cbiAgICAgICAgc2VsZWN0IHRyaWdnZXJfb25fYmVmb3JlX2luc2VydCggJ2p6cl9sYW5nX2hhbmdfc3lsbGFibGVzJyxcbiAgICAgICAgICBuZXcucm93aWQsIG5ldy5yZWYsIG5ldy5zeWxsYWJsZV9oYW5nLCBuZXcuc3lsbGFibGVfbGF0bixcbiAgICAgICAgICAgIG5ldy5pbml0aWFsX2hhbmcsIG5ldy5tZWRpYWxfaGFuZywgbmV3LmZpbmFsX2hhbmcsXG4gICAgICAgICAgICBuZXcuaW5pdGlhbF9sYXRuLCBuZXcubWVkaWFsX2xhdG4sIG5ldy5maW5hbF9sYXRuICk7XG4gICAgICAgIGVuZDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlcyBhc1xuICAgICAgc2VsZWN0IG51bGwgYXMgcm93aWQsIG51bGwgYXMgcmVmLCBudWxsIGFzIHMsIG51bGwgYXMgdiwgbnVsbCBhcyBvIHdoZXJlIGZhbHNlIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ3Y6YzpyZWFkaW5nOmtvLUxhdG4nLCAgICAgICAgICBzeWxsYWJsZV9sYXRuICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAndjpjOnJlYWRpbmc6a28tTGF0bjppbml0aWFsJywgIGluaXRpYWxfbGF0biAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICd2OmM6cmVhZGluZzprby1MYXRuOm1lZGlhbCcsICAgbWVkaWFsX2xhdG4gICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ3Y6YzpyZWFkaW5nOmtvLUxhdG46ZmluYWwnLCAgICBmaW5hbF9sYXRuICAgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAndjpjOnJlYWRpbmc6a28tSGFuZzppbml0aWFsJywgIGluaXRpYWxfaGFuZyAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICd2OmM6cmVhZGluZzprby1IYW5nOm1lZGlhbCcsICAgbWVkaWFsX2hhbmcgICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ3Y6YzpyZWFkaW5nOmtvLUhhbmc6ZmluYWwnLCAgICBmaW5hbF9oYW5nICAgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwgd2hlcmUgZmFsc2VcbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2FsbF90cmlwbGVzIGFzXG4gICAgICBzZWxlY3QgbnVsbCBhcyByb3dpZCwgbnVsbCBhcyByZWYsIG51bGwgYXMgcywgbnVsbCBhcyB2LCBudWxsIGFzIG8gd2hlcmUgZmFsc2UgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCAqIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgKiBmcm9tIGp6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXMgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsIHdoZXJlIGZhbHNlXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl90cmlwbGVzIGFzXG4gICAgICBzZWxlY3QgbnVsbCBhcyByb3dpZCwgbnVsbCBhcyByZWYsIG51bGwgYXMgcmFuaywgbnVsbCBhcyBzLCBudWxsIGFzIHYsIG51bGwgYXMgbyB3aGVyZSBmYWxzZVxuICAgICAgLS0gLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCB0YjEucm93aWQsIHRiMS5yZWYsIHZiMS5yYW5rLCB0YjEucywgdGIxLnYsIHRiMS5vIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgdGIxXG4gICAgICBqb2luIGp6cl9taXJyb3JfdmVyYnMgYXMgdmIxIHVzaW5nICggdiApXG4gICAgICB3aGVyZSB2YjEudiBsaWtlICd2OmM6JSdcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgdGIyLnJvd2lkLCB0YjIucmVmLCB2YjIucmFuaywgdGIyLnMsIGtyLnYsIGtyLm8gZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0YjJcbiAgICAgIGpvaW4ganpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlcyBhcyBrciBvbiAoIHRiMi52ID0gJ3Y6YzpyZWFkaW5nOmtvLUhhbmcnIGFuZCB0YjIubyA9IGtyLnMgKVxuICAgICAgam9pbiBqenJfbWlycm9yX3ZlcmJzIGFzIHZiMiBvbiAoIGtyLnYgPSB2YjIudiApXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwgd2hlcmUgZmFsc2VcbiAgICAgIG9yZGVyIGJ5IHMsIHYsIG9cbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX3RvcF90cmlwbGVzIGFzXG4gICAgICBzZWxlY3QgKiBmcm9tIGp6cl90cmlwbGVzXG4gICAgICB3aGVyZSByYW5rID0gMVxuICAgICAgb3JkZXIgYnkgcywgdiwgb1xuICAgICAgO1wiXCJcIlxuXG4gICAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2NvbXBvbmVudHMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByZWYgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBsZXZlbCAgICAgaW50ZWdlciAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBsbnIgICAgICAgaW50ZWdlciAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBybnIgICAgICAgaW50ZWdlciAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBnbHlwaCAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBjb21wb25lbnQgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjRcIiBmb3JlaWduIGtleSAoIHJlZiApIHJlZmVyZW5jZXMganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjVcIiBjaGVjayAoICggbGVuZ3RoKCBnbHlwaCAgICAgKSA9IDEgKSBvciAoIGdseXBoICAgICAgcmVnZXhwICdeJltcXFxcLWEtejAtOV9dKyNbMC05YS1mXXs0LDZ9OyQnICkgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzI2XCIgY2hlY2sgKCAoIGxlbmd0aCggY29tcG9uZW50ICkgPSAxICkgb3IgKCBjb21wb25lbnQgIHJlZ2V4cCAnXiZbXFxcXC1hLXowLTlfXSsjWzAtOWEtZl17NCw2fTskJyApICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18yN1wiIGNoZWNrICggcm93aWQgcmVnZXhwICdeLiokJyApXG4gICAgICApO1wiXCJcIlxuXG5cbiAgICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgICMjI1xuXG4gICAgICAubyAgLm84OG8uICAgICAgICAgICAgICAgICAgICAgICBvb29vICAgICAgLiAgICAgICAgICAgIG8uXG4gICAgIC44JyAgODg4IGBcIiAgICAgICAgICAgICAgICAgICAgICAgYDg4OCAgICAubzggICAgICAgICAgICBgOC5cbiAgICAuOCcgIG84ODhvbyAgIC5vb29vLiAgIG9vb28gIG9vb28gICA4ODggIC5vODg4b28gIC5vb29vLm8gIGA4LlxuICAgIDg4ICAgIDg4OCAgICBgUCAgKTg4YiAgYDg4OCAgYDg4OCAgIDg4OCAgICA4ODggICBkODgoICBcIjggICA4OFxuICAgIDg4ICAgIDg4OCAgICAgLm9QXCI4ODggICA4ODggICA4ODggICA4ODggICAgODg4ICAgYFwiWTg4Yi4gICAgODhcbiAgICBgOC4gICA4ODggICAgZDgoICA4ODggICA4ODggICA4ODggICA4ODggICAgODg4IC4gby4gICk4OGIgIC44J1xuICAgICBgOC4gbzg4OG8gICBgWTg4OFwiXCI4byAgYFY4OFZcIlY4UCcgbzg4OG8gICBcIjg4OFwiIDhcIlwiODg4UCcgLjgnXG4gICAgICBgXCIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIidcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4gICAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMgYXMgc2VsZWN0XG4gICAgICAgIG1sLnJvd2lkICBhcyByb3dpZCxcbiAgICAgICAgbWwucmVmICAgIGFzIHJlZixcbiAgICAgICAgbWwubGluZSAgIGFzIGxpbmVcbiAgICAgIGZyb20ganpyX21pcnJvcl9saW5lcyBhcyBtbFxuICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICBhbmQgKCBub3QgaXNfdWNfbm9ybWFsKCBtbC5saW5lICkgKVxuICAgICAgb3JkZXIgYnkgbWwucm93aWQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV9rcl9yZWFkaW5nc191bmtub3duX3ZlcmJfZmF1bHRzIGFzIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIGNvdW50KCopIG92ZXIgKCBwYXJ0aXRpb24gYnkgdiApICAgIGFzIGNvdW50LFxuICAgICAgICAgICdqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzOlI9KicgIGFzIHJvd2lkLFxuICAgICAgICAgICcqJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAndW5rbm93bi12ZXJiJyAgICAgICAgICAgICAgICAgICAgICBhcyBkZXNjcmlwdGlvbixcbiAgICAgICAgICB2ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBxdW90ZVxuICAgICAgICBmcm9tIGp6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXMgYXMgbm5cbiAgICAgICAgd2hlcmUgbm90IGV4aXN0cyAoIHNlbGVjdCAxIGZyb20ganpyX21pcnJvcl92ZXJicyBhcyB2YiB3aGVyZSB2Yi52ID0gbm4udiApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBfanpyX21ldGFfZXJyb3JfdmVyYl9mYXVsdHMgYXMgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgY291bnQoKikgb3ZlciAoIHBhcnRpdGlvbiBieSB2ICkgICAgYXMgY291bnQsXG4gICAgICAgICAgJ2Vycm9yOlI9KicgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgICAgcm93aWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICdlcnJvci12ZXJiJyAgICAgICAgICAgICAgICAgICAgICAgIGFzIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICd2OicgfHwgdiB8fCAnLCBvOicgfHwgbyAgICAgICAgICAgIGFzIHF1b3RlXG4gICAgICAgIGZyb20ganpyX3RyaXBsZXMgYXMgbm5cbiAgICAgICAgd2hlcmUgdiBsaWtlICclOmVycm9yJztcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcgX2p6cl9tZXRhX21pcnJvcl9saW5lc193aGl0ZXNwYWNlX2ZhdWx0cyBhcyBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICAxICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBjb3VudCxcbiAgICAgICAgICAndDptcjpsbjpqZmllbGRzOndzOlI9KicgICAgICAgICAgICAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgICBtbC5yb3dpZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgJ2V4dHJhbmVvdXMtd2hpdGVzcGFjZScgICAgICAgICAgICAgICAgICAgICAgYXMgZGVzY3JpcHRpb24sXG4gICAgICAgICAgbWwuamZpZWxkcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcXVvdGVcbiAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzIGFzIG1sXG4gICAgICAgIHdoZXJlICggaGFzX3BlcmlwaGVyYWxfd3NfaW5famZpZWxkKCBqZmllbGRzICkgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcgX2p6cl9tZXRhX21pcnJvcl9saW5lc193aXRoX2Vycm9ycyBhcyBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICAxICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBjb3VudCxcbiAgICAgICAgICAndDptcjpsbjpqZmllbGRzOndzOlI9KicgICAgICAgICAgICAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgICBtbC5yb3dpZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgJ2Vycm9yJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZGVzY3JpcHRpb24sXG4gICAgICAgICAgbWwubGluZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcXVvdGVcbiAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzIGFzIG1sXG4gICAgICAgIHdoZXJlICggbWwubGNvZGUgPSAnRScgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX21ldGFfZmF1bHRzIGFzXG4gICAgICBzZWxlY3QgbnVsbCBhcyBjb3VudCwgbnVsbCBhcyByb3dpZCwgbnVsbCBhcyByZWYsIG51bGwgYXMgZGVzY3JpcHRpb24sIG51bGwgIGFzIHF1b3RlIHdoZXJlIGZhbHNlIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgMSwgcm93aWQsIHJlZiwgICd1Yy1ub3JtYWxpemF0aW9uJywgbGluZSAgYXMgcXVvdGUgZnJvbSBfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMgICAgICAgICAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSBfanpyX21ldGFfa3JfcmVhZGluZ3NfdW5rbm93bl92ZXJiX2ZhdWx0cyAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSBfanpyX21ldGFfZXJyb3JfdmVyYl9mYXVsdHMgICAgICAgICAgICAgICAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSBfanpyX21ldGFfbWlycm9yX2xpbmVzX3doaXRlc3BhY2VfZmF1bHRzICAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZnJvbSBfanpyX21ldGFfbWlycm9yX2xpbmVzX3dpdGhfZXJyb3JzICAgICAgICAgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsIHdoZXJlIGZhbHNlXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX3N5bGxhYmxlcyBhcyBzZWxlY3RcbiAgICAjICAgICAgIHQxLnNcbiAgICAjICAgICAgIHQxLnZcbiAgICAjICAgICAgIHQxLm9cbiAgICAjICAgICAgIHRpLnMgYXMgaW5pdGlhbF9oYW5nXG4gICAgIyAgICAgICB0bS5zIGFzIG1lZGlhbF9oYW5nXG4gICAgIyAgICAgICB0Zi5zIGFzIGZpbmFsX2hhbmdcbiAgICAjICAgICAgIHRpLm8gYXMgaW5pdGlhbF9sYXRuXG4gICAgIyAgICAgICB0bS5vIGFzIG1lZGlhbF9sYXRuXG4gICAgIyAgICAgICB0Zi5vIGFzIGZpbmFsX2xhdG5cbiAgICAjICAgICBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHQxXG4gICAgIyAgICAgam9pblxuICAgICMgICAgIGpvaW4ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgdGkgb24gKCB0MS4pXG4gICAgIyAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyMjIGFnZ3JlZ2F0ZSB0YWJsZSBmb3IgYWxsIHJvd2lkcyBnb2VzIGhlcmUgIyMjXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMjI1xuXG4gICAgICAgICAgICAgICAuICAgICAgICAgICAgICAgICAuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLlxuICAgICAgICAgICAgIC5vOCAgICAgICAgICAgICAgIC5vOCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAubzhcbiAgIC5vb29vLm8gLm84ODhvbyAgLm9vb28uICAgLm84ODhvbyAgLm9vb29vLiAgb29vLiAub28uICAub28uICAgIC5vb29vby4gIG9vby4gLm9vLiAgIC5vODg4b28gIC5vb29vLm9cbiAgZDg4KCAgXCI4ICAgODg4ICAgYFAgICk4OGIgICAgODg4ICAgZDg4JyBgODhiIGA4ODhQXCJZODhiUFwiWTg4YiAgZDg4JyBgODhiIGA4ODhQXCJZODhiICAgIDg4OCAgIGQ4OCggIFwiOFxuICBgXCJZODhiLiAgICA4ODggICAgLm9QXCI4ODggICAgODg4ICAgODg4b29vODg4ICA4ODggICA4ODggICA4ODggIDg4OG9vbzg4OCAgODg4ICAgODg4ICAgIDg4OCAgIGBcIlk4OGIuXG4gIG8uICApODhiICAgODg4IC4gZDgoICA4ODggICAgODg4IC4gODg4ICAgIC5vICA4ODggICA4ODggICA4ODggIDg4OCAgICAubyAgODg4ICAgODg4ICAgIDg4OCAuIG8uICApODhiXG4gIDhcIlwiODg4UCcgICBcIjg4OFwiIGBZODg4XCJcIjhvICAgXCI4ODhcIiBgWThib2Q4UCcgbzg4OG8gbzg4OG8gbzg4OG8gYFk4Ym9kOFAnIG84ODhvIG84ODhvICAgXCI4ODhcIiA4XCJcIjg4OFAnXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBzdGF0ZW1lbnRzOlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX2dseXBocmFuZ2U6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX2dseXBocmFuZ2VzICggcnNnLCBpc19jamssIGxvLCBoaSwgbmFtZSApIHZhbHVlcyAoICRyc2csICRpc19jamssICRsbywgJGhpLCAkbmFtZSApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggZHNrZXkgKSBkbyB1cGRhdGUgc2V0IHBhdGggPSBleGNsdWRlZC5wYXRoXG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdDogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfZGF0YXNvdXJjZV9mb3JtYXRzICggZm9ybWF0LCBjb21tZW50ICkgdmFsdWVzICggJGZvcm1hdCwgJGNvbW1lbnQgKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIGRza2V5ICkgZG8gdXBkYXRlIHNldCBwYXRoID0gZXhjbHVkZWQucGF0aFxuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfZGF0YXNvdXJjZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfZGF0YXNvdXJjZXMgKCBkc2tleSwgZm9ybWF0LCBwYXRoICkgdmFsdWVzICggJGRza2V5LCAkZm9ybWF0LCAkcGF0aCApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggZHNrZXkgKSBkbyB1cGRhdGUgc2V0IHBhdGggPSBleGNsdWRlZC5wYXRoXG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9taXJyb3JfdmVyYjogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3ZlcmJzICggcmFuaywgcywgdiwgbyApIHZhbHVlcyAoICRyYW5rLCAkcywgJHYsICRvIClcbiAgICAgICAgLS0gb24gY29uZmxpY3QgKCByb3dpZCApIGRvIHVwZGF0ZSBzZXQgcmFuayA9IGV4Y2x1ZGVkLnJhbmssIHMgPSBleGNsdWRlZC5zLCB2ID0gZXhjbHVkZWQudiwgbyA9IGV4Y2x1ZGVkLm9cbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX21pcnJvcl9sY29kZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX2xjb2RlcyAoIHJvd2lkLCBsY29kZSwgY29tbWVudCApIHZhbHVlcyAoICRyb3dpZCwgJGxjb2RlLCAkY29tbWVudCApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcm93aWQgKSBkbyB1cGRhdGUgc2V0IGxjb2RlID0gZXhjbHVkZWQubGNvZGUsIGNvbW1lbnQgPSBleGNsdWRlZC5jb21tZW50XG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9taXJyb3JfdHJpcGxlOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICggcm93aWQsIHJlZiwgcywgdiwgbyApIHZhbHVlcyAoICRyb3dpZCwgJHJlZiwgJHMsICR2LCAkbyApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcmVmLCBzLCB2LCBvICkgZG8gbm90aGluZ1xuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9taXJyb3JfbGluZXM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl9saW5lcyAoIGRza2V5LCBsaW5lX25yLCBsY29kZSwgbGluZSwgamZpZWxkcyApXG4gICAgICBzZWxlY3RcbiAgICAgICAgLS0gJ3Q6bXI6bG46Uj0nIHx8IHJvd19udW1iZXIoKSBvdmVyICgpICAgICAgICAgIGFzIHJvd2lkLFxuICAgICAgICAtLSBkcy5kc2tleSB8fCAnOkw9JyB8fCBmbC5saW5lX25yICAgYXMgcm93aWQsXG4gICAgICAgIGRzLmRza2V5ICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBkc2tleSxcbiAgICAgICAgZmwubGluZV9uciAgICAgICAgICAgICAgICAgICAgICAgIGFzIGxpbmVfbnIsXG4gICAgICAgIGZsLmxjb2RlICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBsY29kZSxcbiAgICAgICAgZmwubGluZSAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGxpbmUsXG4gICAgICAgIGZsLmpmaWVsZHMgICAgICAgICAgICAgICAgICAgICAgICBhcyBqZmllbGRzXG4gICAgICBmcm9tIGp6cl9kYXRhc291cmNlcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBkc1xuICAgICAgam9pbiBqenJfZGF0YXNvdXJjZV9mb3JtYXRzICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZGYgdXNpbmcgKCBmb3JtYXQgKVxuICAgICAgam9pbiB3YWxrX2ZpbGVfbGluZXMoIGRzLmRza2V5LCBkZi5mb3JtYXQsIGRzLnBhdGggKSAgYXMgZmxcbiAgICAgIHdoZXJlIHRydWVcbiAgICAgIC0tIG9uIGNvbmZsaWN0ICggZHNrZXksIGxpbmVfbnIgKSBkbyB1cGRhdGUgc2V0IGxpbmUgPSBleGNsdWRlZC5saW5lXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlczogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoIHJvd2lkLCByZWYsIHMsIHYsIG8gKVxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICAgIGd0LnJvd2lkX291dCAgICBhcyByb3dpZCxcbiAgICAgICAgICAgIGd0LnJlZiAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgICBndC5zICAgICAgICAgICAgYXMgcyxcbiAgICAgICAgICAgIGd0LnYgICAgICAgICAgICBhcyB2LFxuICAgICAgICAgICAgZ3QubyAgICAgICAgICAgIGFzIG9cbiAgICAgICAgICBmcm9tIGp6cl9taXJyb3JfbGluZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbWxcbiAgICAgICAgICBqb2luIGdldF90cmlwbGVzKCBtbC5yb3dpZCwgbWwuZHNrZXksIG1sLmpmaWVsZHMgKSAgYXMgZ3RcbiAgICAgICAgICB3aGVyZSB0cnVlXG4gICAgICAgICAgICBhbmQgKCBtbC5sY29kZSA9ICdEJyApXG4gICAgICAgICAgICAtLSBhbmQgKCBtbC5kc2tleSA9ICdkczpkaWN0Om1lYW5pbmdzJyApXG4gICAgICAgICAgICBhbmQgKCBtbC5qZmllbGRzIGlzIG5vdCBudWxsIClcbiAgICAgICAgICAgIGFuZCAoIG1sLmpmaWVsZHMtPj4nJFswXScgbm90IHJlZ2V4cCAnXkBnbHlwaHMnIClcbiAgICAgICAgICAgIC0tIGFuZCAoIG1sLmZpZWxkXzMgcmVnZXhwICdeKD86cHl8aGl8a2EpOicgKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIHJlZiwgcywgdiwgbyApIGRvIG5vdGhpbmdcbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbGFuZ19oYW5nZXVsX3N5bGxhYmxlczogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyAoIHJvd2lkLCByZWYsXG4gICAgICAgIHN5bGxhYmxlX2hhbmcsIGluaXRpYWxfaGFuZywgbWVkaWFsX2hhbmcsIGZpbmFsX2hhbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsX2xhdG4sIG1lZGlhbF9sYXRuLCBmaW5hbF9sYXRuIClcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICAndDpsYW5nOmhhbmc6c3lsOlY9JyB8fCBtdC5vICAgICAgICAgIGFzIHJvd2lkLFxuICAgICAgICAgICAgbXQucm93aWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgICBtdC5vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHN5bGxhYmxlX2hhbmcsXG4gICAgICAgICAgICBkaC5pbml0aWFsICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGluaXRpYWxfaGFuZyxcbiAgICAgICAgICAgIGRoLm1lZGlhbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbWVkaWFsX2hhbmcsXG4gICAgICAgICAgICBkaC5maW5hbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGZpbmFsX2hhbmcsXG4gICAgICAgICAgICBjb2FsZXNjZSggbXRpLm8sICcnICkgICAgICAgICAgICAgICAgIGFzIGluaXRpYWxfbGF0bixcbiAgICAgICAgICAgIGNvYWxlc2NlKCBtdG0ubywgJycgKSAgICAgICAgICAgICAgICAgYXMgbWVkaWFsX2xhdG4sXG4gICAgICAgICAgICBjb2FsZXNjZSggbXRmLm8sICcnICkgICAgICAgICAgICAgICAgIGFzIGZpbmFsX2xhdG5cbiAgICAgICAgICBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICAgICAgICAgICAgIGFzIG10XG4gICAgICAgICAgbGVmdCBqb2luIGRpc2Fzc2VtYmxlX2hhbmdldWwoIG10Lm8gKSAgICBhcyBkaFxuICAgICAgICAgIGxlZnQgam9pbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyBtdGkgb24gKCBtdGkucyA9IGRoLmluaXRpYWwgYW5kIG10aS52ID0gJ3Y6eDprby1IYW5nK0xhdG46aW5pdGlhbCcgKVxuICAgICAgICAgIGxlZnQgam9pbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyBtdG0gb24gKCBtdG0ucyA9IGRoLm1lZGlhbCAgYW5kIG10bS52ID0gJ3Y6eDprby1IYW5nK0xhdG46bWVkaWFsJyAgKVxuICAgICAgICAgIGxlZnQgam9pbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyBtdGYgb24gKCBtdGYucyA9IGRoLmZpbmFsICAgYW5kIG10Zi52ID0gJ3Y6eDprby1IYW5nK0xhdG46ZmluYWwnICAgKVxuICAgICAgICAgIHdoZXJlIHRydWVcbiAgICAgICAgICAgIGFuZCAoIG10LnYgPSAndjpjOnJlYWRpbmc6a28tSGFuZycgKVxuICAgICAgICAgIG9yZGVyIGJ5IG10Lm9cbiAgICAgICAgLS0gb24gY29uZmxpY3QgKCByb3dpZCAgICAgICAgICkgZG8gbm90aGluZ1xuICAgICAgICAvKiAjIyMgTk9URSBgb24gY29uZmxpY3RgIG5lZWRlZCBiZWNhdXNlIHdlIGxvZyBhbGwgYWN0dWFsbHkgb2NjdXJyaW5nIHJlYWRpbmdzIG9mIGFsbCBjaGFyYWN0ZXJzICovXG4gICAgICAgIG9uIGNvbmZsaWN0ICggc3lsbGFibGVfaGFuZyApIGRvIG5vdGhpbmdcbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfZ2x5cGhyYW5nZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfZ2x5cGhyYW5nZXMgKCByc2csIGlzX2NqaywgbG8sIGhpLCBuYW1lIClcbiAgICAgIHNlbGVjdFxuICAgICAgICAtLSAndDptcjpsbjpSPScgfHwgcm93X251bWJlcigpIG92ZXIgKCkgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgIC0tIGRzLmRza2V5IHx8ICc6TD0nIHx8IGZsLmxpbmVfbnIgICBhcyByb3dpZCxcbiAgICAgICAgZ3IucnNnICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJzZyxcbiAgICAgICAgZ3IuaXNfY2prICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGlzX2NqayxcbiAgICAgICAgLS0gcmVmXG4gICAgICAgIGdyLmxvICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBsbyxcbiAgICAgICAgZ3IuaGkgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGhpLFxuICAgICAgICBnci5uYW1lICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbmFtZVxuICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBtbFxuICAgICAgam9pbiBwYXJzZV91Y2RiX3JzZ3NfZ2x5cGhyYW5nZSggbWwuZHNrZXksIG1sLmxpbmVfbnIsIG1sLmpmaWVsZHMgKSBhcyBnclxuICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICBhbmQgKCBtbC5kc2tleSA9ICdkczp1Y2RiOnJzZ3MnIClcbiAgICAgICAgYW5kICggbWwubGNvZGUgPSAnRCcgKVxuICAgICAgb3JkZXIgYnkgbWwubGluZV9uclxuICAgICAgLS0gb24gY29uZmxpY3QgKCBkc2tleSwgbGluZV9uciApIGRvIHVwZGF0ZSBzZXQgbGluZSA9IGV4Y2x1ZGVkLmxpbmVcbiAgICAgIDtcIlwiXCJcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICMjI1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb29vbyAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYDg4OCAgICAgICAgICAgICAgLm84XG4gIG9vLm9vb29vLiAgIC5vb29vby4gIG9vLm9vb29vLiAgb29vbyAgb29vbyAgIDg4OCAgIC5vb29vLiAgIC5vODg4b28gIC5vb29vby5cbiAgIDg4OCcgYDg4YiBkODgnIGA4OGIgIDg4OCcgYDg4YiBgODg4ICBgODg4ICAgODg4ICBgUCAgKTg4YiAgICA4ODggICBkODgnIGA4OGJcbiAgIDg4OCAgIDg4OCA4ODggICA4ODggIDg4OCAgIDg4OCAgODg4ICAgODg4ICAgODg4ICAgLm9QXCI4ODggICAgODg4ICAgODg4b29vODg4XG4gICA4ODggICA4ODggODg4ICAgODg4ICA4ODggICA4ODggIDg4OCAgIDg4OCAgIDg4OCAgZDgoICA4ODggICAgODg4IC4gODg4ICAgIC5vXG4gICA4ODhib2Q4UCcgYFk4Ym9kOFAnICA4ODhib2Q4UCcgIGBWODhWXCJWOFAnIG84ODhvIGBZODg4XCJcIjhvICAgXCI4ODhcIiBgWThib2Q4UCdcbiAgIDg4OCAgICAgICAgICAgICAgICAgIDg4OFxuICBvODg4byAgICAgICAgICAgICAgICBvODg4b1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xjb2RlczogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzI4JywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGNvZGVzJ1xuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPUInLCBsY29kZTogJ0InLCBjb21tZW50OiAnYmxhbmsgbGluZScsICAgIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl9sY29kZS5ydW4geyByb3dpZDogJ3Q6bXI6bGM6Vj1DJywgbGNvZGU6ICdDJywgY29tbWVudDogJ2NvbW1lbnQgbGluZScsICB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0Om1yOmxjOlY9RCcsIGxjb2RlOiAnRCcsIGNvbW1lbnQ6ICdkYXRhIGxpbmUnLCAgICAgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPUUnLCBsY29kZTogJ0UnLCBjb21tZW50OiAnZXJyb3InLCAgICAgICAgIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl9sY29kZS5ydW4geyByb3dpZDogJ3Q6bXI6bGM6Vj1VJywgbGNvZGU6ICdVJywgY29tbWVudDogJ3Vua25vd24nLCAgICAgICB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdmVyYnM6IC0+XG4gICAgIyMjIE5PVEVcbiAgICBpbiB2ZXJicywgaW5pdGlhbCBjb21wb25lbnQgaW5kaWNhdGVzIHR5cGUgb2Ygc3ViamVjdDpcbiAgICAgIGB2OmM6YCBpcyBmb3Igc3ViamVjdHMgdGhhdCBhcmUgQ0pLIGNoYXJhY3RlcnNcbiAgICAgIGB2Ong6YCBpcyB1c2VkIGZvciB1bmNsYXNzaWZpZWQgc3ViamVjdHMgKHBvc3NpYmx5IHRvIGJlIHJlZmluZWQgaW4gdGhlIGZ1dHVyZSlcbiAgICAjIyNcbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzI5JywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdmVyYnMnXG4gICAgcm93cyA9IFtcbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjp0ZXN0aW5nOnVudXNlZCcsICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2Ong6a28tSGFuZytMYXRuOmluaXRpYWwnLCAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6eDprby1IYW5nK0xhdG46bWVkaWFsJywgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjp4OmtvLUhhbmcrTGF0bjpmaW5hbCcsICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzp6aC1MYXRuLXBpbnlpbicsICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmphLXgtS2FuJywgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6amEteC1IaXInLCAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzpqYS14LUthdCcsICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmphLXgtTGF0bicsICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6amEteC1IaXIrTGF0bicsICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzpqYS14LUthdCtMYXRuJywgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmtvLUhhbmcnLCAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6a28tTGF0bicsICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzprby1IYW5nOmluaXRpYWwnLCAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmtvLUhhbmc6bWVkaWFsJywgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6a28tSGFuZzpmaW5hbCcsICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzprby1MYXRuOmluaXRpYWwnLCAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmtvLUxhdG46bWVkaWFsJywgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6a28tTGF0bjpmaW5hbCcsICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6c2hhcGU6aWRzOnNob3J0ZXN0JywgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpzaGFwZTppZHM6c2hvcnRlc3Q6YXN0JywgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnNoYXBlOmlkczpzaG9ydGVzdDplcnJvcicsIG86IFwiTk5cIiwgfVxuICAgICAgIyB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpzaGFwZTppZHM6aGFzLW9wZXJhdG9yJywgICBvOiBcIk5OXCIsIH1cbiAgICAgICMgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6c2hhcGU6aWRzOmhhcy1jb21wb25lbnQnLCAgbzogXCJOTlwiLCB9XG4gICAgICBdXG4gICAgZm9yIHJvdyBpbiByb3dzXG4gICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl92ZXJiLnJ1biByb3dcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VfZm9ybWF0czogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzMwJywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlX2Zvcm1hdHMnXG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICd0c3YnLCAgICAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdtZDp0YWJsZScsICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdjc3YnLCAgICAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdqc29uJywgICAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdtZCcsICAgICAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICd0eHQnLCAgICAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlczogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzMxJywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlcydcbiAgICB7IHBhdGhzXG4gICAgICBmb3JtYXRzLCB9ID0gZ2V0X3BhdGhzX2FuZF9mb3JtYXRzKClcbiAgICAjIGRza2V5ID0gJ2RzOmRpY3Q6dWNkOnYxNC4wOnVoZGlkeCc7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MicsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6ZGljdDptZWFuaW5ncyc7ICAgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MScsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6ZGljdDp4OmtvLUhhbmcrTGF0bic7ICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MicsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6ZGljdDp4OmphLUthbitMYXRuJzsgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MycsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkczpkaWN0OmphOmthbmppdW0nOyAgICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj00JywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICAjIGRza2V5ID0gJ2RzOmRpY3Q6amE6a2Fuaml1bTphdXgnOyAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTUnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZHM6ZGljdDprbzpWPWRhdGEtZ292LmNzdic7ICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9NicsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkczpkaWN0OmtvOlY9ZGF0YS1nb3YuanNvbic7ICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj03JywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICAjIGRza2V5ID0gJ2RzOmRpY3Q6a286Vj1kYXRhLW5hdmVyLmNzdic7ICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTgnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZHM6ZGljdDprbzpWPWRhdGEtbmF2ZXIuanNvbic7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9OScsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkczpkaWN0OmtvOlY9UkVBRE1FLm1kJzsgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xMCcsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6c2hhcGU6aWRzdjInOyAgICAgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MTEnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIGRza2V5ID0gJ2RzOnNoYXBlOnpoejViZic7ICAgICAgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEyJywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkczp1Y2RiOnJzZ3MnOyAgICAgICAgICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xMycsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgO251bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBfb25fb3Blbl9wb3B1bGF0ZV92ZXJiczogLT5cbiAgIyAgIHBhdGhzID0gZ2V0X3BhdGhzX2FuZF9mb3JtYXRzKClcbiAgIyAgIGRza2V5ID0gJ2RzOmRpY3Q6bWVhbmluZ3MnOyAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MScsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAjICAgZHNrZXkgPSAnZHM6ZGljdDp1Y2Q6djE0LjA6dWhkaWR4JzsgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0yJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICMgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9saW5lczogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzMyJywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGluZXMnXG4gICAgQHN0YXRlbWVudHMucG9wdWxhdGVfanpyX21pcnJvcl9saW5lcy5ydW4oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZ2x5cGhyYW5nZTogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzMzJywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9nbHlwaHJhbmdlJ1xuICAgIEBzdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9nbHlwaHJhbmdlLnJ1bigpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaWdnZXJfb25fYmVmb3JlX2luc2VydDogKCBuYW1lLCBmaWVsZHMuLi4gKSAtPlxuICAgICMgZGVidWcgJ86panpyc2RiX18zNCcsIHsgbmFtZSwgZmllbGRzLCB9XG4gICAgQHN0YXRlLm1vc3RfcmVjZW50X2luc2VydGVkX3JvdyA9IHsgbmFtZSwgZmllbGRzLCB9XG4gICAgO251bGxcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICMjI1xuXG4gIG9vb29vICAgICBvb28gb29vb29vb29vby4gICBvb29vb29vb29vb29cbiAgYDg4OCcgICAgIGA4JyBgODg4JyAgIGBZOGIgIGA4ODgnICAgICBgOFxuICAgODg4ICAgICAgIDggICA4ODggICAgICA4ODggIDg4OCAgICAgICAgICAub29vby5vXG4gICA4ODggICAgICAgOCAgIDg4OCAgICAgIDg4OCAgODg4b29vbzggICAgZDg4KCAgXCI4XG4gICA4ODggICAgICAgOCAgIDg4OCAgICAgIDg4OCAgODg4ICAgIFwiICAgIGBcIlk4OGIuXG4gICBgODguICAgIC44JyAgIDg4OCAgICAgZDg4JyAgODg4ICAgICAgICAgby4gICk4OGJcbiAgICAgYFlib2RQJyAgICBvODg4Ym9vZDhQJyAgIG84ODhvICAgICAgICA4XCJcIjg4OFAnXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIEBmdW5jdGlvbnM6XG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIHRyaWdnZXJfb25fYmVmb3JlX2luc2VydDpcbiAgICAgICMjIyBOT1RFIGluIHRoZSBmdXR1cmUgdGhpcyBmdW5jdGlvbiBjb3VsZCB0cmlnZ2VyIGNyZWF0aW9uIG9mIHRyaWdnZXJzIG9uIGluc2VydHMgIyMjXG4gICAgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICAgdmFyYXJnczogICAgICAgIHRydWVcbiAgICAgIGNhbGw6ICggbmFtZSwgZmllbGRzLi4uICkgLT4gQHRyaWdnZXJfb25fYmVmb3JlX2luc2VydCBuYW1lLCBmaWVsZHMuLi5cblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyMjIE5PVEUgbW92ZWQgdG8gRGJyaWNfc3RkOyBjb25zaWRlciB0byBvdmVyd3JpdGUgd2l0aCB2ZXJzaW9uIHVzaW5nIGBzbGV2aXRoYW4vcmVnZXhgICMjI1xuICAgICMgcmVnZXhwOlxuICAgICMgICBvdmVyd3JpdGU6ICAgICAgdHJ1ZVxuICAgICMgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICMgICBjYWxsOiAoIHBhdHRlcm4sIHRleHQgKSAtPiBpZiAoICggbmV3IFJlZ0V4cCBwYXR0ZXJuLCAndicgKS50ZXN0IHRleHQgKSB0aGVuIDEgZWxzZSAwXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGlzX3VjX25vcm1hbDpcbiAgICAgIGRldGVybWluaXN0aWM6ICB0cnVlXG4gICAgICAjIyMgTk9URTogYWxzbyBzZWUgYFN0cmluZzo6aXNXZWxsRm9ybWVkKClgICMjI1xuICAgICAgY2FsbDogKCB0ZXh0LCBmb3JtID0gJ05GQycgKSAtPiBmcm9tX2Jvb2wgdGV4dCBpcyB0ZXh0Lm5vcm1hbGl6ZSBmb3JtICMjIyAnTkZDJywgJ05GRCcsICdORktDJywgb3IgJ05GS0QnICMjI1xuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBoYXNfcGVyaXBoZXJhbF93c19pbl9qZmllbGQ6XG4gICAgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICAgY2FsbDogKCBqZmllbGRzX2pzb24gKSAtPlxuICAgICAgICByZXR1cm4gZnJvbV9ib29sIGZhbHNlIHVubGVzcyAoIGpmaWVsZHMgPSBKU09OLnBhcnNlIGpmaWVsZHNfanNvbiApP1xuICAgICAgICByZXR1cm4gZnJvbV9ib29sIGZhbHNlIHVubGVzcyAoIHR5cGVfb2YgamZpZWxkcyApIGlzICdsaXN0J1xuICAgICAgICByZXR1cm4gZnJvbV9ib29sIGpmaWVsZHMuc29tZSAoIHZhbHVlICkgLT4gLyheXFxzKXwoXFxzJCkvLnRlc3QgdmFsdWVcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIEB0YWJsZV9mdW5jdGlvbnM6XG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIHNwbGl0X3dvcmRzOlxuICAgICAgY29sdW1uczogICAgICBbICdrZXl3b3JkJywgXVxuICAgICAgcGFyYW1ldGVyczogICBbICdsaW5lJywgXVxuICAgICAgcm93czogKCBsaW5lICkgLT5cbiAgICAgICAga2V5d29yZHMgPSBsaW5lLnNwbGl0IC8oPzpcXHB7Wn0rKXwoKD86XFxwe1NjcmlwdD1IYW59KXwoPzpcXHB7TH0rKXwoPzpcXHB7Tn0rKXwoPzpcXHB7U30rKSkvdlxuICAgICAgICBmb3Iga2V5d29yZCBpbiBrZXl3b3Jkc1xuICAgICAgICAgIGNvbnRpbnVlIHVubGVzcyBrZXl3b3JkP1xuICAgICAgICAgIGNvbnRpbnVlIGlmIGtleXdvcmQgaXMgJydcbiAgICAgICAgICB5aWVsZCB7IGtleXdvcmQsIH1cbiAgICAgICAgO251bGxcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgd2Fsa19maWxlX2xpbmVzOlxuICAgICAgY29sdW1uczogICAgICBbICdsaW5lX25yJywgJ2xjb2RlJywgJ2xpbmUnLCAnamZpZWxkcycgXVxuICAgICAgcGFyYW1ldGVyczogICBbICdkc2tleScsICdmb3JtYXQnLCAncGF0aCcsIF1cbiAgICAgIHJvd3M6ICggZHNrZXksIGZvcm1hdCwgcGF0aCApIC0+XG4gICAgICAgIHlpZWxkIGZyb20gbmV3IERhdGFzb3VyY2VfZmllbGRfcGFyc2VyIHsgaG9zdDogQGhvc3QsIGRza2V5LCBmb3JtYXQsIHBhdGgsIH1cbiAgICAgICAgO251bGxcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgZ2V0X3RyaXBsZXM6XG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ3Jvd2lkX2luJywgJ2Rza2V5JywgJ2pmaWVsZHMnLCBdXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ3Jvd2lkX291dCcsICdyZWYnLCAncycsICd2JywgJ28nLCBdXG4gICAgICByb3dzOiAoIHJvd2lkX2luLCBkc2tleSwgamZpZWxkcyApIC0+XG4gICAgICAgIGZpZWxkcyAgPSBKU09OLnBhcnNlIGpmaWVsZHNcbiAgICAgICAgZW50cnkgICA9IGZpZWxkc1sgMiBdXG4gICAgICAgIHN3aXRjaCBkc2tleVxuICAgICAgICAgIHdoZW4gJ2RzOmRpY3Q6eDprby1IYW5nK0xhdG4nICAgICAgICB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXNfZnJvbV9kaWN0X3hfa29fSGFuZ19MYXRuICAgICAgIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICAgd2hlbiAnZHM6ZGljdDptZWFuaW5ncycgdGhlbiBzd2l0Y2ggdHJ1ZVxuICAgICAgICAgICAgd2hlbiAoIGVudHJ5LnN0YXJ0c1dpdGggJ3B5OicgKSB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXNfZnJvbV9jX3JlYWRpbmdfemhfTGF0bl9waW55aW4gIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICAgICB3aGVuICggZW50cnkuc3RhcnRzV2l0aCAna2E6JyApIHRoZW4geWllbGQgZnJvbSBAdHJpcGxlc19mcm9tX2NfcmVhZGluZ19qYV94X0thbiAgICAgICAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgICAgIHdoZW4gKCBlbnRyeS5zdGFydHNXaXRoICdoaTonICkgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX2phX3hfS2FuICAgICAgICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAgICAgd2hlbiAoIGVudHJ5LnN0YXJ0c1dpdGggJ2hnOicgKSB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXNfZnJvbV9jX3JlYWRpbmdfa29fSGFuZyAgICAgICAgIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICAgd2hlbiAnZHM6c2hhcGU6aWRzdjInICAgICAgICAgICAgICAgIHRoZW4geWllbGQgZnJvbSBAdHJpcGxlc19mcm9tX3NoYXBlX2lkc3YyICAgICAgICAgICAgICAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgIyB5aWVsZCBmcm9tIEBnZXRfdHJpcGxlcyByb3dpZF9pbiwgZHNrZXksIGpmaWVsZHNcbiAgICAgICAgO251bGxcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgZGlzYXNzZW1ibGVfaGFuZ2V1bDpcbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAnaGFuZycsIF1cbiAgICAgIGNvbHVtbnM6ICAgICAgWyAnaW5pdGlhbCcsICdtZWRpYWwnLCAnZmluYWwnLCBdXG4gICAgICByb3dzOiAoIGhhbmcgKSAtPlxuICAgICAgICBqYW1vcyA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLl9UTVBfaGFuZ2V1bC5kaXNhc3NlbWJsZSBoYW5nLCB7IGZsYXR0ZW46IGZhbHNlLCB9XG4gICAgICAgIGZvciB7IGZpcnN0OiBpbml0aWFsLCB2b3dlbDogbWVkaWFsLCBsYXN0OiBmaW5hbCwgfSBpbiBqYW1vc1xuICAgICAgICAgIHlpZWxkIHsgaW5pdGlhbCwgbWVkaWFsLCBmaW5hbCwgfVxuICAgICAgICA7bnVsbFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBwYXJzZV91Y2RiX3JzZ3NfZ2x5cGhyYW5nZTpcbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAnZHNrZXknLCAnbGluZV9ucicsICdqZmllbGRzJywgXVxuICAgICAgY29sdW1uczogICAgICBbICdyc2cnLCAnaXNfY2prJywgJ2xvJywgJ2hpJywgJ25hbWUnLCBdXG4gICAgICByb3dzOiAoIGRza2V5LCBsaW5lX25yLCBqZmllbGRzICkgLT5cbiAgICAgICAgeWllbGQgZGF0YXNvdXJjZV9mb3JtYXRfcGFyc2VyLnBhcnNlX3VjZGJfcnNnc19nbHlwaHJhbmdlIHsgZHNrZXksIGxpbmVfbnIsIGpmaWVsZHMsIH1cbiAgICAgICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaXBsZXNfZnJvbV9kaWN0X3hfa29fSGFuZ19MYXRuOiAoIHJvd2lkX2luLCBkc2tleSwgWyByb2xlLCBzLCBvLCBdICkgLT5cbiAgICByZWYgICAgICAgPSByb3dpZF9pblxuICAgIHYgICAgICAgICA9IFwidjp4OmtvLUhhbmcrTGF0bjoje3JvbGV9XCJcbiAgICBvICAgICAgICA/PSAnJ1xuICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdiwgbywgfVxuICAgIEBzdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpcGxlc19mcm9tX2NfcmVhZGluZ196aF9MYXRuX3BpbnlpbjogKCByb3dpZF9pbiwgZHNrZXksIFsgXywgcywgZW50cnksIF0gKSAtPlxuICAgIHJlZiAgICAgICA9IHJvd2lkX2luXG4gICAgdiAgICAgICAgID0gJ3Y6YzpyZWFkaW5nOnpoLUxhdG4tcGlueWluJ1xuICAgIGZvciByZWFkaW5nIGZyb20gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9hdG9uYWxfemhfcmVhZGluZ3MgZW50cnlcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdiwgbzogcmVhZGluZywgfVxuICAgIEBzdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpcGxlc19mcm9tX2NfcmVhZGluZ19qYV94X0thbjogKCByb3dpZF9pbiwgZHNrZXksIFsgXywgcywgZW50cnksIF0gKSAtPlxuICAgIHJlZiAgICAgICA9IHJvd2lkX2luXG4gICAgaWYgZW50cnkuc3RhcnRzV2l0aCAna2E6J1xuICAgICAgdl94X0thbiAgID0gJ3Y6YzpyZWFkaW5nOmphLXgtS2F0J1xuICAgICAgdl9MYXRuICAgID0gJ3Y6YzpyZWFkaW5nOmphLXgtS2F0K0xhdG4nXG4gICAgZWxzZVxuICAgICAgdl94X0thbiAgID0gJ3Y6YzpyZWFkaW5nOmphLXgtSGlyJ1xuICAgICAgdl9MYXRuICAgID0gJ3Y6YzpyZWFkaW5nOmphLXgtSGlyK0xhdG4nXG4gICAgZm9yIHJlYWRpbmcgZnJvbSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5leHRyYWN0X2phX3JlYWRpbmdzIGVudHJ5XG4gICAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6IHZfeF9LYW4sIG86IHJlYWRpbmcsIH1cbiAgICAgICMgZm9yIHRyYW5zY3JpcHRpb24gZnJvbSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5yb21hbml6ZV9qYV9rYW5hIHJlYWRpbmdcbiAgICAgICMgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6IHZfTGF0biwgbzogdHJhbnNjcmlwdGlvbiwgfVxuICAgICAgdHJhbnNjcmlwdGlvbiA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLnJvbWFuaXplX2phX2thbmEgcmVhZGluZ1xuICAgICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiB2X0xhdG4sIG86IHRyYW5zY3JpcHRpb24sIH1cbiAgICBAc3RhdGUudGltZWl0X3Byb2dyZXNzPygpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaXBsZXNfZnJvbV9jX3JlYWRpbmdfa29fSGFuZzogKCByb3dpZF9pbiwgZHNrZXksIFsgXywgcywgZW50cnksIF0gKSAtPlxuICAgIHJlZiAgICAgICA9IHJvd2lkX2luXG4gICAgdiAgICAgICAgID0gJ3Y6YzpyZWFkaW5nOmtvLUhhbmcnXG4gICAgZm9yIHJlYWRpbmcgZnJvbSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5leHRyYWN0X2hnX3JlYWRpbmdzIGVudHJ5XG4gICAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHYsIG86IHJlYWRpbmcsIH1cbiAgICBAc3RhdGUudGltZWl0X3Byb2dyZXNzPygpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaXBsZXNfZnJvbV9zaGFwZV9pZHN2MjogKCByb3dpZF9pbiwgZHNrZXksIFsgXywgcywgZm9ybXVsYSwgXSApIC0+XG4gICAgcmVmICAgICAgID0gcm93aWRfaW5cbiAgICAjIGZvciByZWFkaW5nIGZyb20gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMucGFyc2VfaWRzIGZvcm11bGFcbiAgICAjICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2LCBvOiByZWFkaW5nLCB9XG4gICAgcmV0dXJuIG51bGwgaWYgKCBub3QgZm9ybXVsYT8gKSBvciAoIGZvcm11bGEgaXMgJycgKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiAndjpjOnNoYXBlOmlkczpzaG9ydGVzdCcsIG86IGZvcm11bGEsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGVycm9yID0gbnVsbFxuICAgIHRyeSBmb3JtdWxhX2FzdCA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLnBhcnNlX2lkbHggZm9ybXVsYSBjYXRjaCBlcnJvclxuICAgICAgbyA9IEpTT04uc3RyaW5naWZ5IHsgcmVmOiAnzqlqenJzZGJfXzM1JywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSwgcm93OiB7IHJvd2lkX2luLCBkc2tleSwgcywgZm9ybXVsYSwgfSwgfVxuICAgICAgd2FybiBcImVycm9yOiAje299XCJcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ3Y6YzpzaGFwZTppZHM6c2hvcnRlc3Q6ZXJyb3InLCBvLCB9XG4gICAgcmV0dXJuIG51bGwgaWYgZXJyb3I/XG4gICAgIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgZm9ybXVsYV9qc29uICAgID0gSlNPTi5zdHJpbmdpZnkgZm9ybXVsYV9hc3RcbiAgICAjIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ3Y6YzpzaGFwZTppZHM6c2hvcnRlc3Q6YXN0JywgbzogZm9ybXVsYV9qc29uLCB9XG4gICAgIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgeyBvcGVyYXRvcnMsXG4gICAgIyAgIGNvbXBvbmVudHMsIH0gPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5vcGVyYXRvcnNfYW5kX2NvbXBvbmVudHNfZnJvbV9pZGx4IGZvcm11bGFfYXN0XG4gICAgIyBzZWVuX29wZXJhdG9ycyAgPSBuZXcgU2V0KClcbiAgICAjIHNlZW5fY29tcG9uZW50cyA9IG5ldyBTZXQoKVxuICAgICMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIGZvciBvcGVyYXRvciBpbiBvcGVyYXRvcnNcbiAgICAjICAgY29udGludWUgaWYgc2Vlbl9vcGVyYXRvcnMuaGFzIG9wZXJhdG9yXG4gICAgIyAgIHNlZW5fb3BlcmF0b3JzLmFkZCBvcGVyYXRvclxuICAgICMgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6ICd2OmM6c2hhcGU6aWRzOmhhcy1vcGVyYXRvcicsIG86IG9wZXJhdG9yLCB9XG4gICAgIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgZm9yIGNvbXBvbmVudCBpbiBjb21wb25lbnRzXG4gICAgIyAgIGNvbnRpbnVlIGlmIHNlZW5fY29tcG9uZW50cy5oYXMgY29tcG9uZW50XG4gICAgIyAgIHNlZW5fY29tcG9uZW50cy5hZGQgY29tcG9uZW50XG4gICAgIyAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ3Y6YzpzaGFwZTppZHM6aGFzLWNvbXBvbmVudCcsIG86IGNvbXBvbmVudCwgfVxuICAgICMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBAc3RhdGUudGltZWl0X3Byb2dyZXNzPygpXG4gICAgO251bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMjI1xuXG4gICAgICAubzggICAgICAgICAgICAubzg4by5cbiAgICAgXCI4ODggICAgICAgICAgICA4ODggYFwiXG4gLm9vb284ODggICAub29vby5vIG84ODhvbyAgICAgb28ub29vb28uICAgLm9vb28uICAgb29vbyBkOGIgIC5vb29vLm8gIC5vb29vby4gIG9vb28gZDhiXG5kODgnIGA4ODggIGQ4OCggIFwiOCAgODg4ICAgICAgICA4ODgnIGA4OGIgYFAgICk4OGIgIGA4ODhcIlwiOFAgZDg4KCAgXCI4IGQ4OCcgYDg4YiBgODg4XCJcIjhQXG44ODggICA4ODggIGBcIlk4OGIuICAgODg4ICAgICAgICA4ODggICA4ODggIC5vUFwiODg4ICAgODg4ICAgICBgXCJZODhiLiAgODg4b29vODg4ICA4ODhcbjg4OCAgIDg4OCAgby4gICk4OGIgIDg4OCAgICAgICAgODg4ICAgODg4IGQ4KCAgODg4ICAgODg4ICAgICBvLiAgKTg4YiA4ODggICAgLm8gIDg4OFxuYFk4Ym9kODhQXCIgOFwiXCI4ODhQJyBvODg4byAgICAgICA4ODhib2Q4UCcgYFk4ODhcIlwiOG8gZDg4OGIgICAgOFwiXCI4ODhQJyBgWThib2Q4UCcgZDg4OGJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgODg4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbzg4OG9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBEYXRhc291cmNlX2ZpZWxkX3BhcnNlclxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6ICh7IGhvc3QsIGRza2V5LCBmb3JtYXQsIHBhdGgsIH0pIC0+XG4gICAgQGhvc3QgICAgID0gaG9zdFxuICAgIEBkc2tleSAgICA9IGRza2V5XG4gICAgQGZvcm1hdCAgID0gZm9ybWF0XG4gICAgQHBhdGggICAgID0gcGF0aFxuICAgIDt1bmRlZmluZWRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIFtTeW1ib2wuaXRlcmF0b3JdOiAtPiB5aWVsZCBmcm9tIEB3YWxrKClcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHdhbGs6IC0+XG4gICAgZGVidWcgJ86panpyc2RiX18zNicsIFwid2Fsa19maWxlX2xpbmVzOlwiLCB7IGZvcm1hdDogQGZvcm1hdCwgZHNrZXk6IEBkc2tleSwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgbWV0aG9kX25hbWUgPSAnd2Fsa18nICsgQGZvcm1hdC5yZXBsYWNlIC9bXmEtel0vZ3YsICdfJ1xuICAgIG1ldGhvZCAgICAgID0gQFsgbWV0aG9kX25hbWUgXSA/IEBfd2Fsa19ub19zdWNoX3BhcnNlclxuICAgIHlpZWxkIGZyb20gbWV0aG9kLmNhbGwgQFxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfd2Fsa19ub19zdWNoX3BhcnNlcjogLT5cbiAgICBtZXNzYWdlID0gXCLOqWp6cnNkYl9fMzcgbm8gcGFyc2VyIGZvdW5kIGZvciBmb3JtYXQgI3tycHIgQGZvcm1hdH1cIlxuICAgIHdhcm4gbWVzc2FnZVxuICAgIHlpZWxkIHsgbGluZV9ucjogMCwgbGNvZGU6ICdFJywgbGluZTogbWVzc2FnZSwgamZpZWxkczogbnVsbCwgfVxuICAgIGZvciB7IGxucjogbGluZV9uciwgbGluZSwgZW9sLCB9IGZyb20gd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBAcGF0aFxuICAgICAgeWllbGQgeyBsaW5lX25yLCBsY29kZTogJ1UnLCBsaW5lLCBqZmllbGRzOiBudWxsLCB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHdhbGtfdHN2OiAtPlxuICAgIGZvciB7IGxucjogbGluZV9uciwgbGluZSwgZW9sLCB9IGZyb20gd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBAcGF0aFxuICAgICAgbGluZSAgICA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLm5vcm1hbGl6ZV90ZXh0IGxpbmVcbiAgICAgIGpmaWVsZHMgPSBudWxsXG4gICAgICBzd2l0Y2ggdHJ1ZVxuICAgICAgICB3aGVuIC9eXFxzKiQvdi50ZXN0IGxpbmUgdGhlbiBsY29kZSA9ICdCJ1xuICAgICAgICB3aGVuIC9eXFxzKiMvdi50ZXN0IGxpbmUgdGhlbiBsY29kZSA9ICdDJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgbGNvZGUgPSAnRCdcbiAgICAgICAgICBqZmllbGRzICAgPSBKU09OLnN0cmluZ2lmeSBsaW5lLnNwbGl0ICdcXHQnXG4gICAgICB5aWVsZCB7IGxpbmVfbnIsIGxjb2RlLCBsaW5lLCBqZmllbGRzLCB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHdhbGtfbWRfdGFibGU6IC0+XG4gICAgZm9yIHsgbG5yOiBsaW5lX25yLCBsaW5lLCBlb2wsIH0gZnJvbSB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zIEBwYXRoXG4gICAgICBsaW5lICAgID0gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMubm9ybWFsaXplX3RleHQgbGluZVxuICAgICAgamZpZWxkcyA9IG51bGxcbiAgICAgIGxjb2RlICAgPSAnVSdcbiAgICAgIHN3aXRjaCB0cnVlXG4gICAgICAgIHdoZW4gL15cXHMqJC92LnRlc3QgbGluZSAgICAgICB0aGVuIGxjb2RlID0gJ0InXG4gICAgICAgIHdoZW4gbm90IGxpbmUuc3RhcnRzV2l0aCAnfCcgIHRoZW4gbnVsbCAjIG5vdCBhbiBNRCB0YWJsZVxuICAgICAgICB3aGVuIGxpbmUuc3RhcnRzV2l0aCAnfC0nICAgICB0aGVuIG51bGwgIyBNRCB0YWJsZSBoZWFkZXIgc2VwYXJhdG9yXG4gICAgICAgIHdoZW4gL15cXHxcXHMrXFwqL3YudGVzdCBsaW5lICAgIHRoZW4gbnVsbCAjIE1EIHRhYmxlIGhlYWRlclxuICAgICAgICBlbHNlXG4gICAgICAgICAgbGNvZGUgICA9ICdEJ1xuICAgICAgICAgIGpmaWVsZHMgPSBsaW5lLnNwbGl0ICd8J1xuICAgICAgICAgIGpmaWVsZHMuc2hpZnQoKVxuICAgICAgICAgIGpmaWVsZHMucG9wKClcbiAgICAgICAgICBqZmllbGRzID0gKCBmaWVsZC50cmltKCkgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciBmaWVsZCBpbiBqZmllbGRzIClcbiAgICAgICAgICBqZmllbGRzID0gKCAoIGZpZWxkLnJlcGxhY2UgL15gKC4rKWAkL2d2LCAnJDEnICkgIGZvciBmaWVsZCBpbiBqZmllbGRzIClcbiAgICAgICAgICBqZmllbGRzID0gSlNPTi5zdHJpbmdpZnkgamZpZWxkc1xuICAgICAgICAgICMgZGVidWcgJ86panpyc2RiX18zOCcsIGpmaWVsZHNcbiAgICAgIHlpZWxkIHsgbGluZV9uciwgbGNvZGUsIGxpbmUsIGpmaWVsZHMsIH1cbiAgICA7bnVsbFxuXG4gICMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIHdhbGtfY3N2OiAtPlxuICAjICAgeWllbGQgcmV0dXJuIG51bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyB3YWxrX2pzb246IC0+XG4gICMgICB5aWVsZCByZXR1cm4gbnVsbFxuXG4gICMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIHdhbGtfbWQ6IC0+XG4gICMgICB5aWVsZCByZXR1cm4gbnVsbFxuXG4gICMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIHdhbGtfdHh0OiAtPlxuICAjICAgeWllbGQgcmV0dXJuIG51bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIGRhdGFzb3VyY2VfZm9ybWF0X3BhcnNlclxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQHBhcnNlX3VjZGJfcnNnc19nbHlwaHJhbmdlOiAoeyBqZmllbGRzLCB9KSAtPlxuICAgIFsgaWNsYWJlbCxcbiAgICAgIHJzZyxcbiAgICAgIGlzX2Nqa190eHQsXG4gICAgICBsb19oaV90eHQsXG4gICAgICBuYW1lLCAgICAgXSA9IEpTT04ucGFyc2UgamZpZWxkc1xuICAgIGxvX2hpX3JlICAgICAgPSAvLy8gXiAweCAoPzxsbz4gWzAtOWEtZl17MSw2fSApIFxccypcXC5cXC5cXHMqIDB4ICg/PGhpPiBbMC05YS1mXXsxLDZ9ICkgJCAvLy9pdlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaXNfY2prID0gc3dpdGNoIGlzX2Nqa190eHRcbiAgICAgIHdoZW4gJ3RydWUnICAgdGhlbiAxXG4gICAgICB3aGVuICdmYWxzZScgIHRoZW4gMFxuICAgICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fMzkgZXhwZWN0ZWQgJ3RydWUnIG9yICdmYWxzZScsIGdvdCAje3JwciBpc19jamtfdHh0fVwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB1bmxlc3MgKCBtYXRjaCA9IGxvX2hpX3R4dC5tYXRjaCBsb19oaV9yZSApP1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfXzQwIGV4cGVjdGVkIGEgcmFuZ2UgbGl0ZXJhbCBsaWtlICcweDAxYTYuLjB4MTBmZicsIGdvdCAje3JwciBsb19oaV90eHR9XCJcbiAgICBsbyAgPSBwYXJzZUludCBtYXRjaC5ncm91cHMubG8sIDE2XG4gICAgaGkgID0gcGFyc2VJbnQgbWF0Y2guZ3JvdXBzLmhpLCAxNlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcmV0dXJuIHsgcnNnLCBpc19jamssIGxvLCBoaSwgbmFtZSwgfVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyMjXG5cbm9vb29vXG5gODg4J1xuIDg4OCAgICAgICAgICAub29vby4gICBvb28uIC5vby4gICAgLm9vb29vb29vICAgICAgICAgICAgICAub29vby5vIG9vb28gZDhiIG9vb28gICAgb29vXG4gODg4ICAgICAgICAgYFAgICk4OGIgIGA4ODhQXCJZODhiICA4ODgnIGA4OGIgICAgICAgICAgICAgIGQ4OCggIFwiOCBgODg4XCJcIjhQICBgODguICAuOCdcbiA4ODggICAgICAgICAgLm9QXCI4ODggICA4ODggICA4ODggIDg4OCAgIDg4OCAgICAgICAgICAgICAgYFwiWTg4Yi4gICA4ODggICAgICAgYDg4Li44J1xuIDg4OCAgICAgICBvIGQ4KCAgODg4ICAgODg4ICAgODg4ICBgODhib2Q4UCcgICAgICAgICAgICAgIG8uICApODhiICA4ODggICAgICAgIGA4ODgnXG5vODg4b29vb29vZDggYFk4ODhcIlwiOG8gbzg4OG8gbzg4OG8gYDhvb29vb28uICBvb29vb29vb29vbyA4XCJcIjg4OFAnIGQ4ODhiICAgICAgICBgOCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFwiICAgICBZRFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlk4ODg4OFAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgTGFuZ3VhZ2Vfc2VydmljZXNcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBfVE1QX2hhbmdldWwgPSByZXF1aXJlICdoYW5ndWwtZGlzYXNzZW1ibGUnXG4gICAgQF9UTVBfa2FuYSAgICA9IHJlcXVpcmUgJ3dhbmFrYW5hJ1xuICAgICMgeyB0b0hpcmFnYW5hLFxuICAgICMgICB0b0thbmEsXG4gICAgIyAgIHRvS2F0YWthbmFcbiAgICAjICAgdG9Sb21hamksXG4gICAgIyAgIHRva2VuaXplLCAgICAgICAgIH0gPSByZXF1aXJlICd3YW5ha2FuYSdcbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBub3JtYWxpemVfdGV4dDogKCB0ZXh0LCBmb3JtID0gJ05GQycgKSAtPiB0ZXh0Lm5vcm1hbGl6ZSBmb3JtXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICByZW1vdmVfcGlueWluX2RpYWNyaXRpY3M6ICggdGV4dCApIC0+ICggdGV4dC5ub3JtYWxpemUgJ05GS0QnICkucmVwbGFjZSAvXFxQe0x9L2d2LCAnJ1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZXh0cmFjdF9hdG9uYWxfemhfcmVhZGluZ3M6ICggZW50cnkgKSAtPlxuICAgICMgcHk6emjDuSwgemhlLCB6aMSBbywgemjDoW8sIHpox5QsIHrEq1xuICAgIFIgPSBlbnRyeVxuICAgIFIgPSBSLnJlcGxhY2UgL15weTovdiwgJydcbiAgICBSID0gUi5zcGxpdCAvLFxccyovdlxuICAgIFIgPSAoICggQHJlbW92ZV9waW55aW5fZGlhY3JpdGljcyB6aF9yZWFkaW5nICkgZm9yIHpoX3JlYWRpbmcgaW4gUiApXG4gICAgUiA9IG5ldyBTZXQgUlxuICAgIFIuZGVsZXRlICdudWxsJ1xuICAgIFIuZGVsZXRlICdAbnVsbCdcbiAgICByZXR1cm4gWyBSLi4uLCBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBleHRyYWN0X2phX3JlYWRpbmdzOiAoIGVudHJ5ICkgLT5cbiAgICAjIOepuiAgICAgIGhpOuOBneOCiSwg44GCwrco44GPfOOBjXzjgZHjgospLCDjgYvjgoksIOOBmcK3KOOBj3zjgYvjgZkpLCDjgoDjgarCt+OBl+OBhFxuICAgIFIgPSBlbnRyeVxuICAgIFIgPSBSLnJlcGxhY2UgL14oPzpoaXxrYSk6L3YsICcnXG4gICAgUiA9IFIucmVwbGFjZSAvXFxzKy9ndiwgJydcbiAgICBSID0gUi5zcGxpdCAvLFxccyovdlxuICAgICMjIyBOT1RFIHJlbW92ZSBuby1yZWFkaW5ncyBtYXJrZXIgYEBudWxsYCBhbmQgY29udGV4dHVhbCByZWFkaW5ncyBsaWtlIC3jg43jg7MgZm9yIOe4gSwgLeODjuOCpiBmb3Ig546LICMjI1xuICAgIFIgPSAoIHJlYWRpbmcgZm9yIHJlYWRpbmcgaW4gUiB3aGVuIG5vdCByZWFkaW5nLnN0YXJ0c1dpdGggJy0nIClcbiAgICBSID0gbmV3IFNldCBSXG4gICAgUi5kZWxldGUgJ251bGwnXG4gICAgUi5kZWxldGUgJ0BudWxsJ1xuICAgIHJldHVybiBbIFIuLi4sIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGV4dHJhY3RfaGdfcmVhZGluZ3M6ICggZW50cnkgKSAtPlxuICAgICMg56m6ICAgICAgaGk644Gd44KJLCDjgYLCtyjjgY9844GNfOOBkeOCiyksIOOBi+OCiSwg44GZwrco44GPfOOBi+OBmSksIOOCgOOBqsK344GX44GEXG4gICAgUiA9IGVudHJ5XG4gICAgUiA9IFIucmVwbGFjZSAvXig/OmhnKTovdiwgJydcbiAgICBSID0gUi5yZXBsYWNlIC9cXHMrL2d2LCAnJ1xuICAgIFIgPSBSLnNwbGl0IC8sXFxzKi92XG4gICAgUiA9IG5ldyBTZXQgUlxuICAgIFIuZGVsZXRlICdudWxsJ1xuICAgIFIuZGVsZXRlICdAbnVsbCdcbiAgICBoYW5nZXVsID0gWyBSLi4uLCBdLmpvaW4gJydcbiAgICAjIGRlYnVnICfOqWp6cnNkYl9fNDEnLCBAX1RNUF9oYW5nZXVsLmRpc2Fzc2VtYmxlIGhhbmdldWwsIHsgZmxhdHRlbjogZmFsc2UsIH1cbiAgICByZXR1cm4gWyBSLi4uLCBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICByb21hbml6ZV9qYV9rYW5hOiAoIGVudHJ5ICkgLT5cbiAgICBjZmcgPSB7fVxuICAgIHJldHVybiBAX1RNUF9rYW5hLnRvUm9tYWppIGVudHJ5LCBjZmdcbiAgICAjICMjIyBzeXN0ZW1hdGljIG5hbWUgbW9yZSBsaWtlIGAuLi5famFfeF9rYW5fbGF0bigpYCAjIyNcbiAgICAjIGhlbHAgJ86pZGprcl9fNDInLCB0b0hpcmFnYW5hICAn44Op44O844Oh44OzJywgICAgICAgeyBjb252ZXJ0TG9uZ1Zvd2VsTWFyazogZmFsc2UsIH1cbiAgICAjIGhlbHAgJ86pZGprcl9fNDMnLCB0b0hpcmFnYW5hICAn44Op44O844Oh44OzJywgICAgICAgeyBjb252ZXJ0TG9uZ1Zvd2VsTWFyazogdHJ1ZSwgfVxuICAgICMgaGVscCAnzqlkamtyX180NCcsIHRvS2FuYSAgICAgICd3YW5ha2FuYScsICAgeyBjdXN0b21LYW5hTWFwcGluZzogeyBuYTogJ+OBqycsIGthOiAnQmFuYScgfSwgfVxuICAgICMgaGVscCAnzqlkamtyX180NScsIHRvS2FuYSAgICAgICd3YW5ha2FuYScsICAgeyBjdXN0b21LYW5hTWFwcGluZzogeyB3YWthOiAnKOWSjOatjCknLCB3YTogJyjlkowyKScsIGthOiAnKOatjDIpJywgbmE6ICco5ZCNKScsIGthOiAnKEJhbmEpJywgbmFrYTogJyjkuK0pJywgfSwgfVxuICAgICMgaGVscCAnzqlkamtyX180NicsIHRvUm9tYWppICAgICfjgaTjgZjjgY7jgoonLCAgICAgeyBjdXN0b21Sb21hamlNYXBwaW5nOiB7IOOBmDogJyh6aSknLCDjgaQ6ICcodHUpJywg44KKOiAnKGxpKScsIOOCiuOCh+OBhjogJyhyeW91KScsIOOCiuOChzogJyhyeW8pJyB9LCB9XG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBwYXJzZV9pZGx4OiAoIGZvcm11bGEgKSAtPiBJRExYLnBhcnNlIGZvcm11bGFcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG9wZXJhdG9yc19hbmRfY29tcG9uZW50c19mcm9tX2lkbHg6ICggZm9ybXVsYSApIC0+XG4gICAgc3dpdGNoIHR5cGUgPSB0eXBlX29mIGZvcm11bGFcbiAgICAgIHdoZW4gJ3RleHQnICAgdGhlbiAgZm9ybXVsYV9hc3QgPSBAcGFyc2VfaWRseCBmb3JtdWxhXG4gICAgICB3aGVuICdsaXN0JyAgIHRoZW4gIGZvcm11bGFfYXN0ID0gICAgICAgICAgICAgZm9ybXVsYVxuICAgICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fNDcgZXhwZWN0ZWQgYSB0ZXh0IG9yIGEgbGlzdCwgZ290IGEgI3t0eXBlfVwiXG4gICAgb3BlcmF0b3JzICAgPSBbXVxuICAgIGNvbXBvbmVudHMgID0gW11cbiAgICBzZXBhcmF0ZSAgICA9ICggbGlzdCApIC0+XG4gICAgICBmb3IgZWxlbWVudCwgaWR4IGluIGxpc3RcbiAgICAgICAgaWYgaWR4IGlzIDBcbiAgICAgICAgICBvcGVyYXRvcnMucHVzaCBlbGVtZW50XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgaWYgKCB0eXBlX29mIGVsZW1lbnQgKSBpcyAnbGlzdCdcbiAgICAgICAgICBzZXBhcmF0ZSBlbGVtZW50XG4gICAgICAgICAgIyBjb21wb25lbnRzLnNwbGljZSBjb21wb25lbnRzLmxlbmd0aCwgMCwgKCBzZXBhcmF0ZSBlbGVtZW50ICkuLi5cbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICBjb21wb25lbnRzLnB1c2ggZWxlbWVudFxuICAgIHNlcGFyYXRlIGZvcm11bGFfYXN0XG4gICAgcmV0dXJuIHsgb3BlcmF0b3JzLCBjb21wb25lbnRzLCB9XG5cblxuXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjIFRBSU5UIGdvZXMgaW50byBjb25zdHJ1Y3RvciBvZiBKenIgY2xhc3MgIyMjXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyMjXG5cbiAgIG9vb28gIG84b1xuICAgYDg4OCAgYFwiJ1xuICAgIDg4OCBvb29vICAgIG9vb29vb29vIG9vb28gIG9vb28gIG9vb28gZDhiICAub29vby5cbiAgICA4ODggYDg4OCAgIGQnXCJcIjdkOFAgIGA4ODggIGA4ODggIGA4ODhcIlwiOFAgYFAgICk4OGJcbiAgICA4ODggIDg4OCAgICAgLmQ4UCcgICAgODg4ICAgODg4ICAgODg4ICAgICAgLm9QXCI4ODhcbiAgICA4ODggIDg4OCAgIC5kOFAnICAuUCAgODg4ICAgODg4ICAgODg4ICAgICBkOCggIDg4OFxuLm8uIDg4UCBvODg4byBkODg4ODg4OFAgICBgVjg4VlwiVjhQJyBkODg4YiAgICBgWTg4OFwiXCI4b1xuYFk4ODhQXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgSml6dXJhXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICB7IHBhdGhzLCB9ICAgICAgICAgID0gZ2V0X3BhdGhzX2FuZF9mb3JtYXRzKClcbiAgICBAcGF0aHMgICAgICAgICAgICAgID0gcGF0aHNcbiAgICBAbGFuZ3VhZ2Vfc2VydmljZXMgID0gbmV3IExhbmd1YWdlX3NlcnZpY2VzKClcbiAgICBAZGJhICAgICAgICAgICAgICAgID0gbmV3IEp6cl9kYl9hZGFwdGVyIEBwYXRocy5kYiwgeyBob3N0OiBALCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiBAZGJhLmlzX2ZyZXNoXG4gICAgIyMjIFRBSU5UIG1vdmUgdG8gSnpyX2RiX2FkYXB0ZXIgdG9nZXRoZXIgd2l0aCB0cnkvY2F0Y2ggIyMjXG4gICAgICB0cnlcbiAgICAgICAgQGRiYS5zdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlcy5ydW4oKVxuICAgICAgY2F0Y2ggY2F1c2VcbiAgICAgICAgZmllbGRzX3JwciA9IHJwciBAZGJhLnN0YXRlLm1vc3RfcmVjZW50X2luc2VydGVkX3Jvd1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fNDggd2hlbiB0cnlpbmcgdG8gaW5zZXJ0IHRoaXMgcm93OiAje2ZpZWxkc19ycHJ9LCBhbiBlcnJvciB3YXMgdGhyb3duOiAje2NhdXNlLm1lc3NhZ2V9XCIsIFxcXG4gICAgICAgICAgeyBjYXVzZSwgfVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICMjIyBUQUlOVCBtb3ZlIHRvIEp6cl9kYl9hZGFwdGVyIHRvZ2V0aGVyIHdpdGggdHJ5L2NhdGNoICMjI1xuICAgICAgdHJ5XG4gICAgICAgIEBkYmEuc3RhdGVtZW50cy5wb3B1bGF0ZV9qenJfbGFuZ19oYW5nZXVsX3N5bGxhYmxlcy5ydW4oKVxuICAgICAgY2F0Y2ggY2F1c2VcbiAgICAgICAgZmllbGRzX3JwciA9IHJwciBAZGJhLnN0YXRlLm1vc3RfcmVjZW50X2luc2VydGVkX3Jvd1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fNDkgd2hlbiB0cnlpbmcgdG8gaW5zZXJ0IHRoaXMgcm93OiAje2ZpZWxkc19ycHJ9LCBhbiBlcnJvciB3YXMgdGhyb3duOiAje2NhdXNlLm1lc3NhZ2V9XCIsIFxcXG4gICAgICAgICAgeyBjYXVzZSwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO3VuZGVmaW5lZFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2hvd19jb3VudHM6IC0+XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkbyA9PlxuICAgICAgcXVlcnkgPSBTUUxcIlwiXCJcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICBtdi52ICAgICAgICAgICAgYXMgdixcbiAgICAgICAgICAgIGNvdW50KCB0My52ICkgICBhcyBjb3VudFxuICAgICAgICAgIGZyb20gICAgICAgIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHQzXG4gICAgICAgICAgcmlnaHQgam9pbiAganpyX21pcnJvcl92ZXJicyAgICAgICAgYXMgbXYgdXNpbmcgKCB2IClcbiAgICAgICAgZ3JvdXAgYnkgdlxuICAgICAgICBvcmRlciBieSBjb3VudCBkZXNjLCB2O1wiXCJcIlxuICAgICAgZWNobyAoIGdyZXkgJ86panpyc2RiX181MCcgKSwgKCBnb2xkIHJldmVyc2UgYm9sZCBxdWVyeSApXG4gICAgICBjb3VudHMgPSAoIEBkYmEucHJlcGFyZSBxdWVyeSApLmFsbCgpXG4gICAgICBjb25zb2xlLnRhYmxlIGNvdW50c1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZG8gPT5cbiAgICAgIHF1ZXJ5ID0gU1FMXCJcIlwiXG4gICAgICAgIHNlbGVjdFxuICAgICAgICAgICAgbXYudiAgICAgICAgICAgIGFzIHYsXG4gICAgICAgICAgICBjb3VudCggdDMudiApICAgYXMgY291bnRcbiAgICAgICAgICBmcm9tICAgICAgICBqenJfdHJpcGxlcyAgICAgICBhcyB0M1xuICAgICAgICAgIHJpZ2h0IGpvaW4gIGp6cl9taXJyb3JfdmVyYnMgIGFzIG12IHVzaW5nICggdiApXG4gICAgICAgIGdyb3VwIGJ5IHZcbiAgICAgICAgb3JkZXIgYnkgY291bnQgZGVzYywgdjtcIlwiXCJcbiAgICAgIGVjaG8gKCBncmV5ICfOqWp6cnNkYl9fNTEnICksICggZ29sZCByZXZlcnNlIGJvbGQgcXVlcnkgKVxuICAgICAgY291bnRzID0gKCBAZGJhLnByZXBhcmUgcXVlcnkgKS5hbGwoKVxuICAgICAgY29uc29sZS50YWJsZSBjb3VudHNcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRvID0+XG4gICAgICBxdWVyeSA9IFNRTFwiXCJcIlxuICAgICAgICBzZWxlY3QgZHNrZXksIGNvdW50KCopIGFzIGNvdW50IGZyb20ganpyX21pcnJvcl9saW5lcyBncm91cCBieSBkc2tleSB1bmlvbiBhbGxcbiAgICAgICAgc2VsZWN0ICcqJywgICBjb3VudCgqKSBhcyBjb3VudCBmcm9tIGp6cl9taXJyb3JfbGluZXNcbiAgICAgICAgb3JkZXIgYnkgY291bnQgZGVzYztcIlwiXCJcbiAgICAgIGVjaG8gKCBncmV5ICfOqWp6cnNkYl9fNTInICksICggZ29sZCByZXZlcnNlIGJvbGQgcXVlcnkgKVxuICAgICAgY291bnRzID0gKCBAZGJhLnByZXBhcmUgcXVlcnkgKS5hbGwoKVxuICAgICAgY291bnRzID0gT2JqZWN0LmZyb21FbnRyaWVzICggWyBkc2tleSwgeyBjb3VudCwgfSwgXSBmb3IgeyBkc2tleSwgY291bnQsIH0gaW4gY291bnRzIClcbiAgICAgIGNvbnNvbGUudGFibGUgY291bnRzXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2hvd19qenJfbWV0YV9mYXVsdHM6IC0+XG4gICAgaWYgKCBmYXVsdHlfcm93cyA9ICggQGRiYS5wcmVwYXJlIFNRTFwic2VsZWN0ICogZnJvbSBqenJfbWV0YV9mYXVsdHM7XCIgKS5hbGwoKSApLmxlbmd0aCA+IDBcbiAgICAgIGVjaG8gJ86panpyc2RiX181MycsIHJlZCByZXZlcnNlIGJvbGQgXCIgZm91bmQgc29tZSBmYXVsdHM6IFwiXG4gICAgICBjb25zb2xlLnRhYmxlIGZhdWx0eV9yb3dzXG4gICAgZWxzZVxuICAgICAgZWNobyAnzqlqenJzZGJfXzU0JywgbGltZSByZXZlcnNlIGJvbGQgXCIgKG5vIGZhdWx0cykgXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDtudWxsXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyMjXG5cbm9vb29vb29vb28uICAgb29vb29vb29vb29vIG9vbyAgICAgICAgb29vb28gICAub29vb29vLlxuYDg4OCcgICBgWThiICBgODg4JyAgICAgYDggYDg4LiAgICAgICAuODg4JyAgZDhQJyAgYFk4YlxuIDg4OCAgICAgIDg4OCAgODg4ICAgICAgICAgIDg4OGIgICAgIGQnODg4ICA4ODggICAgICA4ODhcbiA4ODggICAgICA4ODggIDg4OG9vb284ICAgICA4IFk4OC4gLlAgIDg4OCAgODg4ICAgICAgODg4XG4gODg4ICAgICAgODg4ICA4ODggICAgXCIgICAgIDggIGA4ODgnICAgODg4ICA4ODggICAgICA4ODhcbiA4ODggICAgIGQ4OCcgIDg4OCAgICAgICBvICA4ICAgIFkgICAgIDg4OCAgYDg4YiAgICBkODgnXG5vODg4Ym9vZDhQJyAgIG84ODhvb29vb29kOCBvOG8gICAgICAgIG84ODhvICBgWThib29kOFAnXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5kZW1vID0gLT5cbiAganpyID0gbmV3IEppenVyYSgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyBqenIuX3Nob3dfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMoKVxuICBqenIuc2hvd19jb3VudHMoKVxuICBqenIuc2hvd19qenJfbWV0YV9mYXVsdHMoKVxuICAjIHY6YzpyZWFkaW5nOmphLXgtSGlyXG4gICMgdjpjOnJlYWRpbmc6amEteC1LYXRcbiAgaWYgZmFsc2VcbiAgICBzZWVuID0gbmV3IFNldCgpXG4gICAgZm9yIHsgcmVhZGluZywgfSBmcm9tIGp6ci5kYmEud2FsayBTUUxcInNlbGVjdCBkaXN0aW5jdCggbyApIGFzIHJlYWRpbmcgZnJvbSBqenJfdHJpcGxlcyB3aGVyZSB2ID0gJ3Y6YzpyZWFkaW5nOmphLXgtS2F0JyBvcmRlciBieSBvO1wiXG4gICAgICBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLygu44O8fC7jg6N8LuODpXwu44OnfOODgy58LikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICAgICAgIGNvbnRpbnVlIGlmIHNlZW4uaGFzIHBhcnRcbiAgICAgICAgc2Vlbi5hZGQgcGFydFxuICAgICAgICBlY2hvIHBhcnRcbiAgICBmb3IgeyByZWFkaW5nLCB9IGZyb20ganpyLmRiYS53YWxrIFNRTFwic2VsZWN0IGRpc3RpbmN0KCBvICkgYXMgcmVhZGluZyBmcm9tIGp6cl90cmlwbGVzIHdoZXJlIHYgPSAndjpjOnJlYWRpbmc6amEteC1IaXInIG9yZGVyIGJ5IG87XCJcbiAgICAgIGZvciBwYXJ0IGluICggcmVhZGluZy5zcGxpdCAvKC7jg7x8LuOCg3wu44KFfC7jgod844GjLnwuKS92ICkgd2hlbiBwYXJ0IGlzbnQgJydcbiAgICAgICMgZm9yIHBhcnQgaW4gKCByZWFkaW5nLnNwbGl0IC8oLikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICAgICAgIGNvbnRpbnVlIGlmIHNlZW4uaGFzIHBhcnRcbiAgICAgICAgc2Vlbi5hZGQgcGFydFxuICAgICAgICBlY2hvIHBhcnRcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICA7bnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmRlbW9fcmVhZF9kdW1wID0gLT5cbiAgeyBCZW5jaG1hcmtlciwgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2JlbmNobWFya2luZygpXG4gICMgeyBuYW1laXQsICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX25hbWVpdCgpXG4gIGJlbmNobWFya2VyID0gbmV3IEJlbmNobWFya2VyKClcbiAgdGltZWl0ID0gKCBQLi4uICkgLT4gYmVuY2htYXJrZXIudGltZWl0IFAuLi5cbiAgeyBVbmR1bXBlciwgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX3NxbGl0ZV91bmR1bXBlcigpXG4gIHsgd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucywgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9mYXN0X2xpbmVyZWFkZXIoKVxuICB7IHdjLCAgICAgICAgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfd2MoKVxuICBwYXRoICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5yZXNvbHZlIF9fZGlybmFtZSwgJy4uL2p6ci5kdW1wLnNxbCdcbiAganpyID0gbmV3IEppenVyYSgpXG4gIGp6ci5kYmEudGVhcmRvd24geyB0ZXN0OiAnKicsIH1cbiAgZGVidWcgJ86panpyc2RiX181NScsIFVuZHVtcGVyLnVuZHVtcCB7IGRiOiBqenIuZGJhLCBwYXRoLCBtb2RlOiAnZmFzdCcsIH1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBqenIuc2hvd19jb3VudHMoKVxuICBqenIuc2hvd19qenJfbWV0YV9mYXVsdHMoKVxuICA7bnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmRlbW9fc2hvd19hbGxfdGFibGVzID0gLT5cbiAganpyID0gbmV3IEppenVyYSgpXG4gIHJlbGF0aW9uX25hbWVzID0gKCByb3cubmFtZSBmb3Igcm93IGZyb20ganpyLmRiYS53YWxrIGp6ci5kYmEuc3RhdGVtZW50cy5zdGRfZ2V0X3JlbGF0aW9ucyApXG4gIHJlbGF0aW9uX25hbWVzID0gKCBuYW1lIGZvciBuYW1lIGluIHJlbGF0aW9uX25hbWVzIHdoZW4gbm90IG5hbWUuc3RhcnRzV2l0aCAnc3RkXycgKVxuICByZWxhdGlvbl9uYW1lcyA9ICggbmFtZSBmb3IgbmFtZSBpbiByZWxhdGlvbl9uYW1lcyB3aGVuIG5vdCBuYW1lLnN0YXJ0c1dpdGggJ19qenJfbWV0YV8nIClcbiAgcmVsYXRpb25fbmFtZXMgPSAoIG5hbWUgZm9yIG5hbWUgaW4gcmVsYXRpb25fbmFtZXMgd2hlbiBub3QgbmFtZS5zdGFydHNXaXRoICdqenJfbWV0YV8nIClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBmb3IgcmVsYXRpb25fbmFtZSBpbiByZWxhdGlvbl9uYW1lc1xuICAgIHRhYmxlID0ge31cbiAgICByb3dfY291bnQgPSAoIGp6ci5kYmEuZ2V0X2ZpcnN0IFNRTFwic2VsZWN0IGNvdW50KCopIGFzIGNvdW50IGZyb20gI3tyZWxhdGlvbl9uYW1lfTtcIiApLmNvdW50XG4gICAgc3RhdGVtZW50ID0gU1FMXCJcIlwic2VsZWN0ICogZnJvbSAje3JlbGF0aW9uX25hbWV9IG9yZGVyIGJ5IHJhbmRvbSgpIGxpbWl0IDEwO1wiXCJcIlxuICAgIGNvdW50ICAgICA9IDBcbiAgICBmb3Igcm93IGZyb20ganpyLmRiYS53YWxrIHN0YXRlbWVudFxuICAgICAgY291bnQrK1xuICAgICAgdGFibGVbIHJlbGF0aW9uX25hbWUgKyBcIiAoI3tjb3VudH0pXCIgXSA9IHJvd1xuICAgIGVjaG8gcmV2ZXJzZSBib2xkIFwiICN7cmVsYXRpb25fbmFtZX0gXCJcbiAgICBjb25zb2xlLnRhYmxlIHRhYmxlXG4gIDtudWxsXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuaWYgbW9kdWxlIGlzIHJlcXVpcmUubWFpbiB0aGVuIGRvID0+XG4gIGRlbW8oKVxuICBkZW1vX3Nob3dfYWxsX3RhYmxlcygpXG4gICMgZGVtb19yZWFkX2R1bXAoKVxuICA7bnVsbFxuXG5cbiJdfQ==
