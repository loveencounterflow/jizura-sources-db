(function() {
  'use strict';
  var Async_jetstream, Benchmarker, Bsql3, Datasource_field_parser, Dbric, Dbric_std, FS, GUY, IDL, IDLX, Jetstream, Jizura, Jzr_db_adapter, Language_services, PATH, SFMODULES, SQL, alert, as_bool, benchmarker, blue, bold, datasource_format_parser, debug, demo, demo_read_dump, demo_source_identifiers, echo, freeze, from_bool, get_paths_and_formats, gold, green, grey, help, info, inspect, lets, lime, log, plain, praise, red, reverse, rpr, set_getter, timeit, type_of, urge, walk_lines_with_positions, warn, whisper, white;

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
    // paths[ 'dict:ucd:v14.0:uhdidx'      ]   = PATH.join paths.jzrnds, 'unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt'
    paths['dict:x:ko-Hang+Latn'] = PATH.join(paths.jzrnds, 'hangeul-transcriptions.tsv');
    paths['dict:x:ja-Kan+Latn'] = PATH.join(paths.jzrnds, 'kana-transcriptions.tsv');
    paths['dict:bcp47'] = PATH.join(paths.jzrnds, 'BCP47-language-scripts-regions.tsv');
    paths['dict:ja:kanjium'] = PATH.join(kanjium, 'data/source_files/kanjidict.txt');
    paths['dict:ja:kanjium:aux'] = PATH.join(kanjium, 'data/source_files/0_README.txt');
    paths['dict:ko:V=data-gov.csv'] = PATH.join(rutopio, 'data-gov.csv');
    paths['dict:ko:V=data-gov.json'] = PATH.join(rutopio, 'data-gov.json');
    paths['dict:ko:V=data-naver.csv'] = PATH.join(rutopio, 'data-naver.csv');
    paths['dict:ko:V=data-naver.json'] = PATH.join(rutopio, 'data-naver.json');
    paths['dict:ko:V=README.md'] = PATH.join(rutopio, 'README.md');
    paths['dict:meanings'] = PATH.join(paths.mojikura, 'meaning/meanings.txt');
    paths['shape:idsv2'] = PATH.join(paths.mojikura, 'shape/shape-breakdown-formula-v2.txt');
    paths['shape:zhz5bf'] = PATH.join(paths.mojikura, 'shape/shape-strokeorder-zhaziwubifa.txt');
    paths['ucdb:rsgs'] = PATH.join(paths.mojikura, 'ucdb/cfg/rsgs-and-blocks.md');
    //.........................................................................................................
    // formats[ 'dict:ucd:v14.0:uhdidx'      ]   = , 'unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt'
    formats['dict:x:ko-Hang+Latn'] = 'tsv';
    formats['dict:x:ja-Kan+Latn'] = 'tsv';
    formats['dict:bcp47'] = 'tsv';
    formats['dict:ja:kanjium'] = 'txt';
    formats['dict:ja:kanjium:aux'] = 'txt';
    formats['dict:ko:V=data-gov.csv'] = 'csv';
    formats['dict:ko:V=data-gov.json'] = 'json';
    formats['dict:ko:V=data-naver.csv'] = 'csv';
    formats['dict:ko:V=data-naver.json'] = 'json';
    formats['dict:ko:V=README.md'] = 'md';
    formats['dict:meanings'] = 'tsv';
    formats['shape:idsv2'] = 'tsv';
    formats['shape:zhz5bf'] = 'tsv';
    formats['ucdb:rsgs'] = 'md:table';
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
      _on_open_populate_jzr_datasource_formats() {
        debug('Ωjzrsdb__13', '_on_open_populate_jzr_datasource_formats');
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
        debug('Ωjzrsdb__14', '_on_open_populate_jzr_datasources');
        ({paths, formats} = get_paths_and_formats());
        // dskey = 'dict:ucd:v14.0:uhdidx';  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=2', dskey, format: formats[ dskey ], path: paths[ dskey ], }
        dskey = 'dict:meanings';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=1',
          dskey,
          format: formats[dskey],
          path: paths[dskey]
        });
        dskey = 'dict:x:ko-Hang+Latn';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=2',
          dskey,
          format: formats[dskey],
          path: paths[dskey]
        });
        dskey = 'dict:x:ja-Kan+Latn';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=3',
          dskey,
          format: formats[dskey],
          path: paths[dskey]
        });
        // dskey = 'dict:ja:kanjium';            @statements.insert_jzr_datasource.run { rowid: 't:ds:R=4', dskey, format: formats[ dskey ], path: paths[ dskey ], }
        // dskey = 'dict:ja:kanjium:aux';        @statements.insert_jzr_datasource.run { rowid: 't:ds:R=5', dskey, format: formats[ dskey ], path: paths[ dskey ], }
        // dskey = 'dict:ko:V=data-gov.csv';     @statements.insert_jzr_datasource.run { rowid: 't:ds:R=6', dskey, format: formats[ dskey ], path: paths[ dskey ], }
        // dskey = 'dict:ko:V=data-gov.json';    @statements.insert_jzr_datasource.run { rowid: 't:ds:R=7', dskey, format: formats[ dskey ], path: paths[ dskey ], }
        // dskey = 'dict:ko:V=data-naver.csv';   @statements.insert_jzr_datasource.run { rowid: 't:ds:R=8', dskey, format: formats[ dskey ], path: paths[ dskey ], }
        // dskey = 'dict:ko:V=data-naver.json';  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=9', dskey, format: formats[ dskey ], path: paths[ dskey ], }
        // dskey = 'dict:ko:V=README.md';        @statements.insert_jzr_datasource.run { rowid: 't:ds:R=10', dskey, format: formats[ dskey ], path: paths[ dskey ], }
        dskey = 'shape:idsv2';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=11',
          dskey,
          format: formats[dskey],
          path: paths[dskey]
        });
        dskey = 'shape:zhz5bf';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=12',
          dskey,
          format: formats[dskey],
          path: paths[dskey]
        });
        dskey = 'ucdb:rsgs';
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
      //   dskey = 'dict:meanings';          @statements.insert_jzr_datasource.run { rowid: 't:ds:R=1', dskey, path: paths[ dskey ], }
      //   dskey = 'dict:ucd:v14.0:uhdidx';  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=2', dskey, path: paths[ dskey ], }
      //   ;null

        //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_mirror_lines() {
        debug('Ωjzrsdb__15', '_on_open_populate_jzr_mirror_lines');
        this.statements.populate_jzr_mirror_lines.run();
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_glyphrange() {
        debug('Ωjzrsdb__16', '_on_open_populate_jzr_glyphrange');
        this.statements.populate_jzr_glyphrange.run();
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      trigger_on_before_insert(name, ...fields) {
        // debug 'Ωjzrsdb__17', { name, fields, }
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
            ref: 'Ωjzrsdb__19',
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
  rowid     text    unique  not null generated always as ( 't:uc:rsg:V=' || rsg ),
  rsg       text    unique  not null,
  is_cjk    boolean         not null,
  lo        integer         not null,
  hi        integer         not null,
  -- lo_glyph  text            not null generated always as ( char( lo ) ) stored,
  -- hi_glyph  text            not null generated always as ( char( hi ) ) stored,
  name      text            not null,
-- primary key ( rowid ),
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
      SQL`create table jzr_datasource_formats (
  rowid     text    unique  not null generated always as ( 't:ds:f:V=' || format ) stored,
  format    text    unique  not null,
  comment   text            not null
-- primary key ( rowid ),
-- check ( rowid regexp '^t:ds:R=\\d+$' )
);`,
      //.......................................................................................................
      SQL`create table jzr_datasources (
  rowid     text    unique  not null,
  dskey     text    unique  not null,
  format    text            not null,
  path      text            not null,
primary key ( rowid ),
foreign key ( format ) references jzr_datasource_formats ( format ),
check ( rowid regexp '^t:ds:R=\\d+$') );`,
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
      insert_jzr_datasource: SQL`insert into jzr_datasources ( rowid, dskey, format, path ) values ( $rowid, $dskey, $format, $path )
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
  and ( ml.dskey = 'ucdb:rsgs' )
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
      debug('Ωjzrsdb__20', "walk_file_lines:", {
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
      message = `Ωjzrsdb__21 no parser found for format ${rpr(this.format)}`;
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
        // debug 'Ωjzrsdb__22', jfields
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
            throw new Error(`Ωjzrsdb__23 expected 'true' or 'false', got ${rpr(is_cjk_txt)}`);
        }
      })();
      //.......................................................................................................
      if ((match = lo_hi_txt.match(lo_hi_re)) == null) {
        throw new Error(`Ωjzrsdb__24 expected a range literal like '0x01a6..0x10ff', got ${rpr(lo_hi_txt)}`);
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
      // debug 'Ωjzrsdb__26', @_TMP_hangeul.disassemble hangeul, { flatten: false, }
      return [...R];
    }

    //---------------------------------------------------------------------------------------------------------
    romanize_ja_kana(entry) {
      var cfg;
      cfg = {};
      return this._TMP_kana.toRomaji(entry, cfg);
    }

    // ### systematic name more like `..._ja_x_kan_latn()` ###
    // help 'Ωdjkr__27', toHiragana  'ラーメン',       { convertLongVowelMark: false, }
    // help 'Ωdjkr__28', toHiragana  'ラーメン',       { convertLongVowelMark: true, }
    // help 'Ωdjkr__29', toKana      'wanakana',   { customKanaMapping: { na: 'に', ka: 'Bana' }, }
    // help 'Ωdjkr__30', toKana      'wanakana',   { customKanaMapping: { waka: '(和歌)', wa: '(和2)', ka: '(歌2)', na: '(名)', ka: '(Bana)', naka: '(中)', }, }
    // help 'Ωdjkr__31', toRomaji    'つじぎり',     { customRomajiMapping: { じ: '(zi)', つ: '(tu)', り: '(li)', りょう: '(ryou)', りょ: '(ryo)' }, }

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
          throw new Error(`Ωjzrsdb__32 expected a text or a list, got a ${type}`);
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
          this.populate_meaning_mirror_triples();
        } catch (error1) {
          cause = error1;
          fields_rpr = rpr(this.dba.state.most_recent_inserted_row);
          throw new Error(`Ωjzrsdb__33 when trying to insert this row: ${fields_rpr}, an error was thrown: ${cause.message}`, {cause});
        }
        try {
          //.......................................................................................................
          /* TAINT move to Jzr_db_adapter together with try/catch */
          this.populate_hangeul_syllables();
        } catch (error1) {
          cause = error1;
          fields_rpr = rpr(this.dba.state.most_recent_inserted_row);
          throw new Error(`Ωjzrsdb__34 when trying to insert this row: ${fields_rpr}, an error was thrown: ${cause.message}`, {cause});
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
        return help('Ωjzrsdb__35', {total_row_count, total}); // { total_row_count: 40086, total: 80172 }
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
    //   warn 'Ωjzrsdb__36', reverse faulty_rows
    //   # for row from
    //   #.......................................................................................................
    //   ;null

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
        echo(grey('Ωjzrsdb__37'), gold(reverse(bold(query))));
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
        echo(grey('Ωjzrsdb__38'), gold(reverse(bold(query))));
        counts = (this.dba.prepare(query)).all();
        return console.table(counts);
      })();
      (() => {        //.......................................................................................................
        var count, counts, dskey, query;
        query = SQL`select dskey, count(*) as count from jzr_mirror_lines group by dskey union all
select '*',   count(*) as count from jzr_mirror_lines
order by count desc;`;
        echo(grey('Ωjzrsdb__39'), gold(reverse(bold(query))));
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
        echo('Ωjzrsdb__40', red(reverse(bold(" found some faults: "))));
        console.table(faulty_rows);
      } else {
        echo('Ωjzrsdb__41', lime(reverse(bold(" (no faults) "))));
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
    debug('Ωjzrsdb__42', Undumper.undump({
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsS0FBQSxFQUFBLHVCQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxFQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQSxjQUFBLEVBQUEsaUJBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLHdCQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxjQUFBLEVBQUEsdUJBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLFNBQUEsRUFBQSxxQkFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLHlCQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxLQUFBOzs7RUFHQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixDQUFBLENBQUUsS0FBRixFQUNFLEtBREYsRUFFRSxJQUZGLEVBR0UsSUFIRixFQUlFLEtBSkYsRUFLRSxNQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxPQVJGLENBQUEsR0FRNEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFSLENBQW9CLG1CQUFwQixDQVI1Qjs7RUFTQSxDQUFBLENBQUUsR0FBRixFQUNFLE9BREYsRUFFRSxJQUZGLEVBR0UsS0FIRixFQUlFLEtBSkYsRUFL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QUksTUFBSixDQUFBO0lBQ04sR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFSLENBQWlCO01BQUUsSUFBQSxFQUFNO0lBQVIsQ0FBakI7SUFDQSxLQUFBLENBQU0sYUFBTixFQUFxQixRQUFRLENBQUMsTUFBVCxDQUFnQjtNQUFFLEVBQUEsRUFBSSxHQUFHLENBQUMsR0FBVjtNQUFlLElBQWY7TUFBcUIsSUFBQSxFQUFNO0lBQTNCLENBQWhCLENBQXJCLEVBVkY7O0lBWUUsR0FBRyxDQUFDLFdBQUosQ0FBQTtJQUNBLEdBQUcsQ0FBQyxvQkFBSixDQUFBO1dBQ0M7RUFmYyxFQTU3Q2pCOzs7RUErOENBLElBQUcsTUFBQSxLQUFVLE9BQU8sQ0FBQyxJQUFyQjtJQUFrQyxDQUFBLENBQUEsQ0FBQSxHQUFBO01BQ2hDLElBQUEsQ0FBQSxFQUFGOzthQUVHO0lBSCtCLENBQUEsSUFBbEM7O0FBLzhDQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCdcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5HVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xueyBhbGVydFxuICBkZWJ1Z1xuICBoZWxwXG4gIGluZm9cbiAgcGxhaW5cbiAgcHJhaXNlXG4gIHVyZ2VcbiAgd2FyblxuICB3aGlzcGVyIH0gICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ2ppenVyYS1zb3VyY2VzLWRiJ1xueyBycHJcbiAgaW5zcGVjdFxuICBlY2hvXG4gIHdoaXRlXG4gIGdyZWVuXG4gIGJsdWVcbiAgbGltZVxuICBnb2xkXG4gIGdyZXlcbiAgcmVkXG4gIGJvbGRcbiAgcmV2ZXJzZVxuICBsb2cgICAgIH0gICAgICAgICAgICAgICA9IEdVWS50cm1cbiMgeyBmIH0gICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9lZmZzdHJpbmcnXG4jIHdyaXRlICAgICAgICAgICAgICAgICAgICAgPSAoIHAgKSAtPiBwcm9jZXNzLnN0ZG91dC53cml0ZSBwXG4jIHsgbmZhIH0gICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvbm9ybWFsaXplLWZ1bmN0aW9uLWFyZ3VtZW50cydcbiMgR1RORyAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ndXktdGVzdC1ORydcbiMgeyBUZXN0ICAgICAgICAgICAgICAgICAgfSA9IEdUTkdcbkZTICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOmZzJ1xuUEFUSCAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6cGF0aCdcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQnNxbDMgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2JldHRlci1zcWxpdGUzJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5TRk1PRFVMRVMgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2JyaWNhYnJhYy1zZm1vZHVsZXMnXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgRGJyaWMsXG4gIERicmljX3N0ZCxcbiAgU1FMLCAgICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9kYnJpYygpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgbGV0cyxcbiAgZnJlZXplLCAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9sZXRzZnJlZXpldGhhdF9pbmZyYSgpLnNpbXBsZVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IEpldHN0cmVhbSxcbiAgQXN5bmNfamV0c3RyZWFtLCAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9qZXRzdHJlYW0oKVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9mYXN0X2xpbmVyZWFkZXIoKVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IEJlbmNobWFya2VyLCAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfYmVuY2htYXJraW5nKClcbmJlbmNobWFya2VyICAgICAgICAgICAgICAgICAgID0gbmV3IEJlbmNobWFya2VyKClcbnRpbWVpdCAgICAgICAgICAgICAgICAgICAgICAgID0gKCBQLi4uICkgLT4gYmVuY2htYXJrZXIudGltZWl0IFAuLi5cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBzZXRfZ2V0dGVyLCAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX21hbmFnZWRfcHJvcGVydHlfdG9vbHMoKVxueyBJREwsIElETFgsICAgICAgICAgICAgfSA9IHJlcXVpcmUgJ21vamlrdXJhLWlkbCdcbnsgdHlwZV9vZiwgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV90eXBlX29mKClcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5mcm9tX2Jvb2wgICAgICAgICAgICAgICAgICAgICA9ICggeCApIC0+IHN3aXRjaCB4XG4gIHdoZW4gdHJ1ZSAgdGhlbiAxXG4gIHdoZW4gZmFsc2UgdGhlbiAwXG4gIGVsc2UgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfX18xIGV4cGVjdGVkIHRydWUgb3IgZmFsc2UsIGdvdCAje3JwciB4fVwiXG5hc19ib29sICAgICAgICAgICAgICAgICAgICAgICA9ICggeCApIC0+IHN3aXRjaCB4XG4gIHdoZW4gMSB0aGVuIHRydWVcbiAgd2hlbiAwIHRoZW4gZmFsc2VcbiAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fXzIgZXhwZWN0ZWQgMCBvciAxLCBnb3QgI3tycHIgeH1cIlxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmRlbW9fc291cmNlX2lkZW50aWZpZXJzID0gLT5cbiAgeyBleHBhbmRfZGljdGlvbmFyeSwgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfZGljdGlvbmFyeV90b29scygpXG4gIHsgZ2V0X2xvY2FsX2Rlc3RpbmF0aW9ucywgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2dldF9sb2NhbF9kZXN0aW5hdGlvbnMoKVxuICBmb3Iga2V5LCB2YWx1ZSBvZiBnZXRfbG9jYWxfZGVzdGluYXRpb25zKClcbiAgICBkZWJ1ZyAnzqlqenJzZGJfX18zJywga2V5LCB2YWx1ZVxuICAjIGNhbiBhcHBlbmQgbGluZSBudW1iZXJzIHRvIGZpbGVzIGFzIGluOlxuICAjICdkaWN0Om1lYW5pbmdzLjE6TD0xMzMzMidcbiAgIyAnZGljdDp1Y2QxNDAuMTp1aGRpZHg6TD0xMjM0J1xuICAjIHJvd2lkczogJ3Q6amZtOlI9MSdcbiAgIyB7XG4gICMgICAnZGljdDptZWFuaW5ncyc6ICAgICAgICAgICckanpyZHMvbWVhbmluZy9tZWFuaW5ncy50eHQnXG4gICMgICAnZGljdDp1Y2Q6djE0LjA6dWhkaWR4JyA6ICckanpyZHMvdW5pY29kZS5vcmctdWNkLXYxNC4wL1VuaWhhbl9EaWN0aW9uYXJ5SW5kaWNlcy50eHQnXG4gICMgICB9XG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyMjXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAuICAgb29vb1xuICAgICAgICAgICAgICAgICAgICAgICAubzggICBgODg4XG5vby5vb29vby4gICAub29vby4gICAubzg4OG9vICA4ODggLm9vLiAgICAub29vby5vXG4gODg4JyBgODhiIGBQICApODhiICAgIDg4OCAgICA4ODhQXCJZODhiICBkODgoICBcIjhcbiA4ODggICA4ODggIC5vUFwiODg4ICAgIDg4OCAgICA4ODggICA4ODggIGBcIlk4OGIuXG4gODg4ICAgODg4IGQ4KCAgODg4ICAgIDg4OCAuICA4ODggICA4ODggIG8uICApODhiXG4gODg4Ym9kOFAnIGBZODg4XCJcIjhvICAgXCI4ODhcIiBvODg4byBvODg4byA4XCJcIjg4OFAnXG4gODg4XG5vODg4b1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZ2V0X3BhdGhzX2FuZF9mb3JtYXRzID0gLT5cbiAgcGF0aHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSB7fVxuICBmb3JtYXRzICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IHt9XG4gIFIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0geyBwYXRocywgZm9ybWF0cywgfVxuICBwYXRocy5iYXNlICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEgucmVzb2x2ZSBfX2Rpcm5hbWUsICcuLidcbiAgcGF0aHMuanpyICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILnJlc29sdmUgcGF0aHMuYmFzZSwgJy4uJ1xuICBwYXRocy5kYiAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBwYXRocy5iYXNlLCAnanpyLmRiJ1xuICAjIHBhdGhzLmRiICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gJy9kZXYvc2htL2p6ci5kYidcbiAgIyBwYXRocy5qenJkcyAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBwYXRocy5iYXNlLCAnanpyZHMnXG4gIHBhdGhzLmp6cm5kcyAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIHBhdGhzLmJhc2UsICdqaXp1cmEtbmV3LWRhdGFzb3VyY2VzJ1xuICBwYXRocy5tb2ppa3VyYSAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBwYXRocy5qenJuZHMsICdtb2ppa3VyYSdcbiAgcGF0aHMucmF3X2dpdGh1YiAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gcGF0aHMuanpybmRzLCAnYnZmcy9vcmlnaW4vaHR0cHMvcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSdcbiAga2Fuaml1bSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gcGF0aHMucmF3X2dpdGh1YiwgJ21pZnVuZXRvc2hpcm8va2Fuaml1bS84YTBjZGFhMTZkNjRhMjgxYTIwNDhkZTJlZWUyZWM1ZTNhNDQwZmE2J1xuICBydXRvcGlvICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBwYXRocy5yYXdfZ2l0aHViLCAncnV0b3Bpby9Lb3JlYW4tTmFtZS1IYW5qYS1DaGFyc2V0LzEyZGYxYmExYjRkZmFhMDk1ODEzZTRkZGZiYTQyNGU4MTZmOTRjNTMnXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyBwYXRoc1sgJ2RpY3Q6dWNkOnYxNC4wOnVoZGlkeCcgICAgICBdICAgPSBQQVRILmpvaW4gcGF0aHMuanpybmRzLCAndW5pY29kZS5vcmctdWNkLXYxNC4wL1VuaWhhbl9EaWN0aW9uYXJ5SW5kaWNlcy50eHQnXG4gIHBhdGhzWyAnZGljdDp4OmtvLUhhbmcrTGF0bicgICAgICAgIF0gICA9IFBBVEguam9pbiBwYXRocy5qenJuZHMsICdoYW5nZXVsLXRyYW5zY3JpcHRpb25zLnRzdidcbiAgcGF0aHNbICdkaWN0Ong6amEtS2FuK0xhdG4nICAgICAgICAgXSAgID0gUEFUSC5qb2luIHBhdGhzLmp6cm5kcywgJ2thbmEtdHJhbnNjcmlwdGlvbnMudHN2J1xuICBwYXRoc1sgJ2RpY3Q6YmNwNDcnICAgICAgICAgICAgICAgICBdICAgPSBQQVRILmpvaW4gcGF0aHMuanpybmRzLCAnQkNQNDctbGFuZ3VhZ2Utc2NyaXB0cy1yZWdpb25zLnRzdidcbiAgcGF0aHNbICdkaWN0OmphOmthbmppdW0nICAgICAgICAgICAgXSAgID0gUEFUSC5qb2luIGthbmppdW0sICdkYXRhL3NvdXJjZV9maWxlcy9rYW5qaWRpY3QudHh0J1xuICBwYXRoc1sgJ2RpY3Q6amE6a2Fuaml1bTphdXgnICAgICAgICBdICAgPSBQQVRILmpvaW4ga2Fuaml1bSwgJ2RhdGEvc291cmNlX2ZpbGVzLzBfUkVBRE1FLnR4dCdcbiAgcGF0aHNbICdkaWN0OmtvOlY9ZGF0YS1nb3YuY3N2JyAgICAgXSAgID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLWdvdi5jc3YnXG4gIHBhdGhzWyAnZGljdDprbzpWPWRhdGEtZ292Lmpzb24nICAgIF0gICA9IFBBVEguam9pbiBydXRvcGlvLCAnZGF0YS1nb3YuanNvbidcbiAgcGF0aHNbICdkaWN0OmtvOlY9ZGF0YS1uYXZlci5jc3YnICAgXSAgID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLW5hdmVyLmNzdidcbiAgcGF0aHNbICdkaWN0OmtvOlY9ZGF0YS1uYXZlci5qc29uJyAgXSAgID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLW5hdmVyLmpzb24nXG4gIHBhdGhzWyAnZGljdDprbzpWPVJFQURNRS5tZCcgICAgICAgIF0gICA9IFBBVEguam9pbiBydXRvcGlvLCAnUkVBRE1FLm1kJ1xuICBwYXRoc1sgJ2RpY3Q6bWVhbmluZ3MnICAgICAgICAgICAgICBdICAgPSBQQVRILmpvaW4gcGF0aHMubW9qaWt1cmEsICdtZWFuaW5nL21lYW5pbmdzLnR4dCdcbiAgcGF0aHNbICdzaGFwZTppZHN2MicgICAgICAgICAgICAgICAgXSAgID0gUEFUSC5qb2luIHBhdGhzLm1vamlrdXJhLCAnc2hhcGUvc2hhcGUtYnJlYWtkb3duLWZvcm11bGEtdjIudHh0J1xuICBwYXRoc1sgJ3NoYXBlOnpoejViZicgICAgICAgICAgICAgICBdICAgPSBQQVRILmpvaW4gcGF0aHMubW9qaWt1cmEsICdzaGFwZS9zaGFwZS1zdHJva2VvcmRlci16aGF6aXd1YmlmYS50eHQnXG4gIHBhdGhzWyAndWNkYjpyc2dzJyAgICAgICAgICAgICAgICAgIF0gICA9IFBBVEguam9pbiBwYXRocy5tb2ppa3VyYSwgJ3VjZGIvY2ZnL3JzZ3MtYW5kLWJsb2Nrcy5tZCdcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjIGZvcm1hdHNbICdkaWN0OnVjZDp2MTQuMDp1aGRpZHgnICAgICAgXSAgID0gLCAndW5pY29kZS5vcmctdWNkLXYxNC4wL1VuaWhhbl9EaWN0aW9uYXJ5SW5kaWNlcy50eHQnXG4gIGZvcm1hdHNbICdkaWN0Ong6a28tSGFuZytMYXRuJyAgICAgICAgXSAgID0gJ3RzdidcbiAgZm9ybWF0c1sgJ2RpY3Q6eDpqYS1LYW4rTGF0bicgICAgICAgICBdICAgPSAndHN2J1xuICBmb3JtYXRzWyAnZGljdDpiY3A0NycgICAgICAgICAgICAgICAgIF0gICA9ICd0c3YnXG4gIGZvcm1hdHNbICdkaWN0OmphOmthbmppdW0nICAgICAgICAgICAgXSAgID0gJ3R4dCdcbiAgZm9ybWF0c1sgJ2RpY3Q6amE6a2Fuaml1bTphdXgnICAgICAgICBdICAgPSAndHh0J1xuICBmb3JtYXRzWyAnZGljdDprbzpWPWRhdGEtZ292LmNzdicgICAgIF0gICA9ICdjc3YnXG4gIGZvcm1hdHNbICdkaWN0OmtvOlY9ZGF0YS1nb3YuanNvbicgICAgXSAgID0gJ2pzb24nXG4gIGZvcm1hdHNbICdkaWN0OmtvOlY9ZGF0YS1uYXZlci5jc3YnICAgXSAgID0gJ2NzdidcbiAgZm9ybWF0c1sgJ2RpY3Q6a286Vj1kYXRhLW5hdmVyLmpzb24nICBdICAgPSAnanNvbidcbiAgZm9ybWF0c1sgJ2RpY3Q6a286Vj1SRUFETUUubWQnICAgICAgICBdICAgPSAnbWQnXG4gIGZvcm1hdHNbICdkaWN0Om1lYW5pbmdzJyAgICAgICAgICAgICAgXSAgID0gJ3RzdidcbiAgZm9ybWF0c1sgJ3NoYXBlOmlkc3YyJyAgICAgICAgICAgICAgICBdICAgPSAndHN2J1xuICBmb3JtYXRzWyAnc2hhcGU6emh6NWJmJyAgICAgICAgICAgICAgIF0gICA9ICd0c3YnXG4gIGZvcm1hdHNbICd1Y2RiOnJzZ3MnICAgICAgICAgICAgICAgICAgXSAgID0gJ21kOnRhYmxlJ1xuICByZXR1cm4gUlxuXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBKenJfZGJfYWRhcHRlciBleHRlbmRzIERicmljX3N0ZFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQGRiX2NsYXNzOiAgQnNxbDNcbiAgQHByZWZpeDogICAgJ2p6cidcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAoIGRiX3BhdGgsIGNmZyA9IHt9ICkgLT5cbiAgICAjIyMgVEFJTlQgbmVlZCBtb3JlIGNsYXJpdHkgYWJvdXQgd2hlbiBzdGF0ZW1lbnRzLCBidWlsZCwgaW5pdGlhbGl6ZS4uLiBpcyBwZXJmb3JtZWQgIyMjXG4gICAgeyBob3N0LCB9ID0gY2ZnXG4gICAgY2ZnICAgICAgID0gbGV0cyBjZmcsICggY2ZnICkgLT4gZGVsZXRlIGNmZy5ob3N0XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBzdXBlciBkYl9wYXRoLCBjZmdcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIEBob3N0ICAgPSBob3N0XG4gICAgQHN0YXRlICA9IHsgdHJpcGxlX2NvdW50OiAwLCBtb3N0X3JlY2VudF9pbnNlcnRlZF9yb3c6IG51bGwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZG8gPT5cbiAgICAgICMjIyBUQUlOVCB0aGlzIGlzIG5vdCB3ZWxsIHBsYWNlZCAjIyNcbiAgICAgICMjIyBOT1RFIGV4ZWN1dGUgYSBHYXBzLWFuZC1Jc2xhbmRzIEVTU0ZSSSB0byBpbXByb3ZlIHN0cnVjdHVyYWwgaW50ZWdyaXR5IGFzc3VyYW5jZTogIyMjXG4gICAgICAjICggQHByZXBhcmUgU1FMXCJzZWxlY3QgKiBmcm9tIF9qenJfbWV0YV91Y19ub3JtYWxpemF0aW9uX2ZhdWx0cyB3aGVyZSBmYWxzZTtcIiApLmdldCgpXG4gICAgICBtZXNzYWdlcyA9IFtdXG4gICAgICBmb3IgeyBuYW1lLCB0eXBlLCB9IGZyb20gQHN0YXRlbWVudHMuc3RkX2dldF9yZWxhdGlvbnMuaXRlcmF0ZSgpXG4gICAgICAgIHRyeVxuICAgICAgICAgICggQHByZXBhcmUgU1FMXCJzZWxlY3QgKiBmcm9tICN7bmFtZX0gd2hlcmUgZmFsc2U7XCIgKS5hbGwoKVxuICAgICAgICBjYXRjaCBlcnJvclxuICAgICAgICAgIG1lc3NhZ2VzLnB1c2ggXCIje3R5cGV9ICN7bmFtZX06ICN7ZXJyb3IubWVzc2FnZX1cIlxuICAgICAgICAgIHdhcm4gJ86panpyc2RiX19fNCcsIGVycm9yLm1lc3NhZ2VcbiAgICAgIHJldHVybiBudWxsIGlmIG1lc3NhZ2VzLmxlbmd0aCBpcyAwXG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fXzUgRUZGUkkgdGVzdGluZyByZXZlYWxlZCBlcnJvcnM6ICN7cnByIG1lc3NhZ2VzfVwiXG4gICAgICA7bnVsbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaWYgQGlzX2ZyZXNoXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VfZm9ybWF0cygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VzKClcbiAgICAgIEBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX3ZlcmJzKClcbiAgICAgIEBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xjb2RlcygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9saW5lcygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX2dseXBocmFuZ2UoKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO3VuZGVmaW5lZFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2V0X2dldHRlciBAOjosICduZXh0X3RyaXBsZV9yb3dpZCcsIC0+IFwidDptcjozcGw6Uj0jeysrQHN0YXRlLnRyaXBsZV9jb3VudH1cIlxuXG4gICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIyMjXG5cbiAgIC5vOCAgICAgICAgICAgICAgICAgICAgbzhvICBvb29vICAgICAgICAubzhcbiAgXCI4ODggICAgICAgICAgICAgICAgICAgIGBcIicgIGA4ODggICAgICAgXCI4ODhcbiAgIDg4OG9vb28uICBvb29vICBvb29vICBvb29vICAgODg4ICAgLm9vb284ODhcbiAgIGQ4OCcgYDg4YiBgODg4ICBgODg4ICBgODg4ICAgODg4ICBkODgnIGA4ODhcbiAgIDg4OCAgIDg4OCAgODg4ICAgODg4ICAgODg4ICAgODg4ICA4ODggICA4ODhcbiAgIDg4OCAgIDg4OCAgODg4ICAgODg4ICAgODg4ICAgODg4ICA4ODggICA4ODhcbiAgIGBZOGJvZDhQJyAgYFY4OFZcIlY4UCcgbzg4OG8gbzg4OG8gYFk4Ym9kODhQXCJcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4gICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgQGJ1aWxkOiBbXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfZ2x5cGhyYW5nZXMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsIGdlbmVyYXRlZCBhbHdheXMgYXMgKCAndDp1Yzpyc2c6Vj0nIHx8IHJzZyApLFxuICAgICAgICByc2cgICAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBpc19jamsgICAgYm9vbGVhbiAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBsbyAgICAgICAgaW50ZWdlciAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBoaSAgICAgICAgaW50ZWdlciAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICAtLSBsb19nbHlwaCAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsIGdlbmVyYXRlZCBhbHdheXMgYXMgKCBjaGFyKCBsbyApICkgc3RvcmVkLFxuICAgICAgICAtLSBoaV9nbHlwaCAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsIGdlbmVyYXRlZCBhbHdheXMgYXMgKCBjaGFyKCBoaSApICkgc3RvcmVkLFxuICAgICAgICBuYW1lICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgLS0gcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fXzZcIiBjaGVjayAoIGxvIGJldHdlZW4gMHgwMDAwMDAgYW5kIDB4MTBmZmZmICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X19fN1wiIGNoZWNrICggaGkgYmV0d2VlbiAweDAwMDAwMCBhbmQgMHgxMGZmZmYgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfX184XCIgY2hlY2sgKCBsbyA8PSBoaSApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fXzlcIiBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXi4qJCcpXG4gICAgICApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2dseXBoc2V0cyAoXG4gICAgICAgIHJvd2lkICAgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgbmFtZSAgICAgICAgdGV4dCAgICBub3QgbnVsbCxcbiAgICAgICAgZ2x5cGhyYW5nZSAgdGV4dCAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGZvcmVpZ24ga2V5ICggZ2x5cGhyYW5nZSApIHJlZmVyZW5jZXMganpyX2dseXBocmFuZ2VzICggcm93aWQgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzEwXCIgY2hlY2sgKCByb3dpZCByZWdleHAgJ14uKiQnKVxuICAgICAgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9kYXRhc291cmNlX2Zvcm1hdHMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsIGdlbmVyYXRlZCBhbHdheXMgYXMgKCAndDpkczpmOlY9JyB8fCBmb3JtYXQgKSBzdG9yZWQsXG4gICAgICAgIGZvcm1hdCAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGNvbW1lbnQgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGxcbiAgICAgIC0tIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIC0tIGNoZWNrICggcm93aWQgcmVnZXhwICdedDpkczpSPVxcXFxkKyQnIClcbiAgICAgICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfZGF0YXNvdXJjZXMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBkc2tleSAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBmb3JtYXQgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBwYXRoICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgZm9yZWlnbiBrZXkgKCBmb3JtYXQgKSByZWZlcmVuY2VzIGp6cl9kYXRhc291cmNlX2Zvcm1hdHMgKCBmb3JtYXQgKSxcbiAgICAgIGNoZWNrICggcm93aWQgcmVnZXhwICdedDpkczpSPVxcXFxkKyQnKSApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX21pcnJvcl9sY29kZXMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBsY29kZSAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBjb21tZW50ICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCBsY29kZSByZWdleHAgJ15bYS16QS1aXStbYS16QS1aMC05XSokJyApLFxuICAgICAgY2hlY2sgKCByb3dpZCA9ICd0Om1yOmxjOlY9JyB8fCBsY29kZSApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX2xpbmVzIChcbiAgICAgICAgLS0gJ3Q6amZtOidcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggJ3Q6bXI6bG46ZHM9JyB8fCBkc2tleSB8fCAnOkw9JyB8fCBsaW5lX25yICkgc3RvcmVkLFxuICAgICAgICByZWYgICAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsIGdlbmVyYXRlZCBhbHdheXMgYXMgKCAgICAgICAgICAgICAgICAgIGRza2V5IHx8ICc6TD0nIHx8IGxpbmVfbnIgKSB2aXJ0dWFsLFxuICAgICAgICBkc2tleSAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBsaW5lX25yICAgaW50ZWdlciAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBsY29kZSAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBsaW5lICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBqZmllbGRzICAganNvbiAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgLS0gcHJpbWFyeSBrZXkgKCByb3dpZCApLCAgICAgICAgICAgICAgICAgICAgICAgICAgIC0tICMjIyBOT1RFIEV4cGVyaW1lbnRhbDogbm8gZXhwbGljaXQgUEssIGluc3RlYWQgZ2VuZXJhdGVkIGByb3dpZGAgY29sdW1uXG4gICAgICAtLSBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bXI6bG46ZHM9Lis6TD1cXFxcZCskJyksICAtLSAjIyMgTk9URSBubyBuZWVkIHRvIGNoZWNrIGFzIHZhbHVlIGlzIGdlbmVyYXRlZCAjIyNcbiAgICAgIHVuaXF1ZSAoIGRza2V5LCBsaW5lX25yICksXG4gICAgICBmb3JlaWduIGtleSAoIGxjb2RlICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xjb2RlcyAoIGxjb2RlICkgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfdmVyYnMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByYW5rICAgICAgaW50ZWdlciAgICAgICAgIG5vdCBudWxsIGRlZmF1bHQgMSxcbiAgICAgICAgcyAgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgdiAgICAgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgbyAgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNoZWNrICggcm93aWQgcmVnZXhwICdedDptcjp2YjpWPVtcXFxcLTpcXFxcK1xcXFxwe0x9XSskJyApLFxuICAgICAgY2hlY2sgKCByYW5rID4gMCApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHJlZiAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHMgICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHYgICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIG8gICAgICAgICBqc29uICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bXI6M3BsOlI9XFxcXGQrJCcgKSxcbiAgICAgIC0tIHVuaXF1ZSAoIHJlZiwgcywgdiwgbyApXG4gICAgICBmb3JlaWduIGtleSAoIHJlZiApIHJlZmVyZW5jZXMganpyX21pcnJvcl9saW5lcyAoIHJvd2lkICksXG4gICAgICBmb3JlaWduIGtleSAoIHYgICApIHJlZmVyZW5jZXMganpyX21pcnJvcl92ZXJicyAoIHYgKSApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdHJpZ2dlciBqenJfbWlycm9yX3RyaXBsZXNfcmVnaXN0ZXJcbiAgICAgIGJlZm9yZSBpbnNlcnQgb24ganpyX21pcnJvcl90cmlwbGVzX2Jhc2VcbiAgICAgIGZvciBlYWNoIHJvdyBiZWdpblxuICAgICAgICBzZWxlY3QgdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0KCAnanpyX21pcnJvcl90cmlwbGVzX2Jhc2UnLFxuICAgICAgICAgICdyb3dpZDonLCBuZXcucm93aWQsICdyZWY6JywgbmV3LnJlZiwgJ3M6JywgbmV3LnMsICd2OicsIG5ldy52LCAnbzonLCBuZXcubyApO1xuICAgICAgICBlbmQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyAoXG4gICAgICAgIHJvd2lkICAgICAgICAgICB0ZXh0ICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByZWYgICAgICAgICAgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgc3lsbGFibGVfaGFuZyAgIHRleHQgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHN5bGxhYmxlX2xhdG4gICB0ZXh0ICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggaW5pdGlhbF9sYXRuIHx8IG1lZGlhbF9sYXRuIHx8IGZpbmFsX2xhdG4gKSB2aXJ0dWFsLFxuICAgICAgICAtLSBzeWxsYWJsZV9sYXRuICAgdGV4dCAgdW5pcXVlICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggaW5pdGlhbF9sYXRuIHx8IG1lZGlhbF9sYXRuIHx8IGZpbmFsX2xhdG4gKSB2aXJ0dWFsLFxuICAgICAgICBpbml0aWFsX2hhbmcgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbWVkaWFsX2hhbmcgICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpbmFsX2hhbmcgICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBpbml0aWFsX2xhdG4gICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbWVkaWFsX2xhdG4gICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpbmFsX2xhdG4gICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCByb3dpZCByZWdleHAgJ150Omxhbmc6aGFuZzpzeWw6Vj1cXFxcUyskJyApXG4gICAgICAtLSB1bmlxdWUgKCByZWYsIHMsIHYsIG8gKVxuICAgICAgLS0gZm9yZWlnbiBrZXkgKCByZWYgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfbGluZXMgKCByb3dpZCApXG4gICAgICAtLSBmb3JlaWduIGtleSAoIHN5bGxhYmxlX2hhbmcgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICggbyApIClcbiAgICAgICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzX3JlZ2lzdGVyXG4gICAgICBiZWZvcmUgaW5zZXJ0IG9uIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzXG4gICAgICBmb3IgZWFjaCByb3cgYmVnaW5cbiAgICAgICAgc2VsZWN0IHRyaWdnZXJfb25fYmVmb3JlX2luc2VydCggJ2p6cl9sYW5nX2hhbmdfc3lsbGFibGVzJyxcbiAgICAgICAgICBuZXcucm93aWQsIG5ldy5yZWYsIG5ldy5zeWxsYWJsZV9oYW5nLCBuZXcuc3lsbGFibGVfbGF0bixcbiAgICAgICAgICAgIG5ldy5pbml0aWFsX2hhbmcsIG5ldy5tZWRpYWxfaGFuZywgbmV3LmZpbmFsX2hhbmcsXG4gICAgICAgICAgICBuZXcuaW5pdGlhbF9sYXRuLCBuZXcubWVkaWFsX2xhdG4sIG5ldy5maW5hbF9sYXRuICk7XG4gICAgICAgIGVuZDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlcyBhc1xuICAgICAgc2VsZWN0IG51bGwgYXMgcm93aWQsIG51bGwgYXMgcmVmLCBudWxsIGFzIHMsIG51bGwgYXMgdiwgbnVsbCBhcyBvIHdoZXJlIGZhbHNlIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ2M6cmVhZGluZzprby1MYXRuJywgICAgICAgICAgc3lsbGFibGVfbGF0biAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ2M6cmVhZGluZzprby1MYXRuOmluaXRpYWwnLCAgaW5pdGlhbF9sYXRuICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ2M6cmVhZGluZzprby1MYXRuOm1lZGlhbCcsICAgbWVkaWFsX2xhdG4gICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ2M6cmVhZGluZzprby1MYXRuOmZpbmFsJywgICAgZmluYWxfbGF0biAgICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ2M6cmVhZGluZzprby1IYW5nOmluaXRpYWwnLCAgaW5pdGlhbF9oYW5nICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ2M6cmVhZGluZzprby1IYW5nOm1lZGlhbCcsICAgbWVkaWFsX2hhbmcgICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ2M6cmVhZGluZzprby1IYW5nOmZpbmFsJywgICAgZmluYWxfaGFuZyAgICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsIHdoZXJlIGZhbHNlXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9hbGxfdHJpcGxlcyBhc1xuICAgICAgc2VsZWN0IG51bGwgYXMgcm93aWQsIG51bGwgYXMgcmVmLCBudWxsIGFzIHMsIG51bGwgYXMgdiwgbnVsbCBhcyBvIHdoZXJlIGZhbHNlIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgKiBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogZnJvbSBqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfdHJpcGxlcyBhc1xuICAgICAgc2VsZWN0IG51bGwgYXMgcm93aWQsIG51bGwgYXMgcmVmLCBudWxsIGFzIHJhbmssIG51bGwgYXMgcywgbnVsbCBhcyB2LCBudWxsIGFzIG8gd2hlcmUgZmFsc2VcbiAgICAgIC0tIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgdGIxLnJvd2lkLCB0YjEucmVmLCB2YjEucmFuaywgdGIxLnMsIHRiMS52LCB0YjEubyBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHRiMVxuICAgICAgam9pbiBqenJfbWlycm9yX3ZlcmJzIGFzIHZiMSB1c2luZyAoIHYgKVxuICAgICAgd2hlcmUgdmIxLnYgbGlrZSAnYzolJ1xuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCB0YjIucm93aWQsIHRiMi5yZWYsIHZiMi5yYW5rLCB0YjIucywga3Iudiwga3IubyBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHRiMlxuICAgICAgam9pbiBqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzIGFzIGtyIG9uICggdGIyLnYgPSAnYzpyZWFkaW5nOmtvLUhhbmcnIGFuZCB0YjIubyA9IGtyLnMgKVxuICAgICAgam9pbiBqenJfbWlycm9yX3ZlcmJzIGFzIHZiMiBvbiAoIGtyLnYgPSB2YjIudiApXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwsIG51bGwgd2hlcmUgZmFsc2VcbiAgICAgIG9yZGVyIGJ5IHMsIHYsIG9cbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX3RvcF90cmlwbGVzIGFzXG4gICAgICBzZWxlY3QgKiBmcm9tIGp6cl90cmlwbGVzXG4gICAgICB3aGVyZSByYW5rID0gMVxuICAgICAgb3JkZXIgYnkgcywgdiwgb1xuICAgICAgO1wiXCJcIlxuXG4gICAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfY2prX2FnZ19sYXRuIGFzXG4gICAgICBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICBzICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBzLFxuICAgICAgICAgIHYgfHwgJzphbGwnICAgICAgICAgICAgICAgICAgIGFzIHYsXG4gICAgICAgICAganNvbl9ncm91cF9hcnJheSggbyApIG92ZXIgdyAgYXMgb3NcbiAgICAgICAgZnJvbSBqenJfdG9wX3RyaXBsZXNcbiAgICAgICAgd2hlcmUgdiBpbiAoICdjOnJlYWRpbmc6emgtTGF0bi1waW55aW4nLCdjOnJlYWRpbmc6amEteC1LYXQrTGF0bicsICdjOnJlYWRpbmc6a28tTGF0bicpXG4gICAgICAgIHdpbmRvdyB3IGFzICggcGFydGl0aW9uIGJ5IHMsIHYgb3JkZXIgYnkgb1xuICAgICAgICAgIHJvd3MgYmV0d2VlbiB1bmJvdW5kZWQgcHJlY2VkaW5nIGFuZCB1bmJvdW5kZWQgZm9sbG93aW5nIClcbiAgICAgICAgb3JkZXIgYnkgcywgdiwgb3NcbiAgICAgIDtcIlwiXCJcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2Nqa19hZ2cyX2xhdG4gYXNcbiAgICAgIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIHR0MS5zICAgYXMgcyxcbiAgICAgICAgICB0dDIub3MgIGFzIHJlYWRpbmdzX3poLFxuICAgICAgICAgIHR0My5vcyAgYXMgcmVhZGluZ3NfamEsXG4gICAgICAgICAgdHQ0Lm9zICBhcyByZWFkaW5nc19rb1xuICAgICAgICBmcm9tICAgICAganpyX2Nqa19hZ2dfbGF0biBhcyB0dDFcbiAgICAgICAgbGVmdCBqb2luIGp6cl9jamtfYWdnX2xhdG4gYXMgdHQyIG9uICggdHQxLnMgPSB0dDIucyBhbmQgdHQyLnYgPSAnYzpyZWFkaW5nOnpoLUxhdG4tcGlueWluOmFsbCcgKVxuICAgICAgICBsZWZ0IGpvaW4ganpyX2Nqa19hZ2dfbGF0biBhcyB0dDMgb24gKCB0dDEucyA9IHR0My5zIGFuZCB0dDMudiA9ICdjOnJlYWRpbmc6amEteC1LYXQrTGF0bjphbGwnICApXG4gICAgICAgIGxlZnQgam9pbiBqenJfY2prX2FnZ19sYXRuIGFzIHR0NCBvbiAoIHR0MS5zID0gdHQ0LnMgYW5kIHR0NC52ID0gJ2M6cmVhZGluZzprby1MYXRuOmFsbCcgICAgICAgIClcbiAgICAgICAgb3JkZXIgYnkgc1xuICAgICAgO1wiXCJcIlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfcmVhZGluZ19wYWlyc196aF9qYSBhc1xuICAgICAgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgdDEucyAgICAgIGFzIHMsXG4gICAgICAgICAgdDIudmFsdWUgIGFzIHJlYWRpbmdfemgsXG4gICAgICAgICAgdDMudmFsdWUgIGFzIHJlYWRpbmdfamFcbiAgICAgICAgZnJvbSBqenJfY2prX2FnZzJfbGF0biBhcyB0MSxcbiAgICAgICAganNvbl9lYWNoKCB0MS5yZWFkaW5nc196aCApIGFzIHQyLFxuICAgICAgICBqc29uX2VhY2goIHQxLnJlYWRpbmdzX2phICkgYXMgdDNcbiAgICAgICAgd2hlcmUgcmVhZGluZ196aCBub3QgaW4gKCAneXUnLCAnY2hpJyApIC0tIGV4Y2x1ZGUgbm9uLWhvbW9waG9uZXNcbiAgICAgICAgb3JkZXIgYnkgdDIudmFsdWUsIHQzLnZhbHVlXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9yZWFkaW5nX3BhaXJzX3poX2phX2FnZyBhc1xuICAgICAgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgcmVhZGluZ196aCxcbiAgICAgICAgICByZWFkaW5nX2phLFxuICAgICAgICAgIGpzb25fZ3JvdXBfYXJyYXkoIHMgKSBvdmVyIHcgYXMgY2hyc1xuICAgICAgICBmcm9tIGp6cl9yZWFkaW5nX3BhaXJzX3poX2phIGFzIHQxXG4gICAgICAgIHdpbmRvdyB3IGFzICggcGFydGl0aW9uIGJ5IHQxLnJlYWRpbmdfemgsIHQxLnJlYWRpbmdfamEgb3JkZXIgYnkgdDEuc1xuICAgICAgICAgIHJvd3MgYmV0d2VlbiB1bmJvdW5kZWQgcHJlY2VkaW5nIGFuZCB1bmJvdW5kZWQgZm9sbG93aW5nIClcbiAgICAgIG9yZGVyIGJ5IHJlYWRpbmdfemgsIHJlYWRpbmdfamFcbiAgICAgIDtcIlwiXCJcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX3JlYWRpbmdfcGFpcnNfemhfa28gYXNcbiAgICAgIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIHQxLnMgICAgICBhcyBzLFxuICAgICAgICAgIHQyLnZhbHVlICBhcyByZWFkaW5nX3poLFxuICAgICAgICAgIHQzLnZhbHVlICBhcyByZWFkaW5nX2tvXG4gICAgICAgIGZyb20ganpyX2Nqa19hZ2cyX2xhdG4gYXMgdDEsXG4gICAgICAgIGpzb25fZWFjaCggdDEucmVhZGluZ3NfemggKSBhcyB0MixcbiAgICAgICAganNvbl9lYWNoKCB0MS5yZWFkaW5nc19rbyApIGFzIHQzXG4gICAgICAgIHdoZXJlIHJlYWRpbmdfemggbm90IGluICggJ3l1JywgJ2NoaScgKSAtLSBleGNsdWRlIG5vbi1ob21vcGhvbmVzXG4gICAgICAgIG9yZGVyIGJ5IHQyLnZhbHVlLCB0My52YWx1ZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfcmVhZGluZ19wYWlyc196aF9rb19hZ2cgYXNcbiAgICAgIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIHJlYWRpbmdfemgsXG4gICAgICAgICAgcmVhZGluZ19rbyxcbiAgICAgICAgICBqc29uX2dyb3VwX2FycmF5KCBzICkgb3ZlciB3IGFzIGNocnNcbiAgICAgICAgZnJvbSBqenJfcmVhZGluZ19wYWlyc196aF9rbyBhcyB0MVxuICAgICAgICB3aW5kb3cgdyBhcyAoIHBhcnRpdGlvbiBieSB0MS5yZWFkaW5nX3poLCB0MS5yZWFkaW5nX2tvIG9yZGVyIGJ5IHQxLnNcbiAgICAgICAgICByb3dzIGJldHdlZW4gdW5ib3VuZGVkIHByZWNlZGluZyBhbmQgdW5ib3VuZGVkIGZvbGxvd2luZyApXG4gICAgICBvcmRlciBieSByZWFkaW5nX3poLCByZWFkaW5nX2tvXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9lcXVpdmFsZW50X3JlYWRpbmdfdHJpcGxlcyBhc1xuICAgICAgc2VsZWN0XG4gICAgICAgICAgdDEucmVhZGluZ196aCBhcyByZWFkaW5nX3poLFxuICAgICAgICAgIHQxLnJlYWRpbmdfamEgYXMgcmVhZGluZ19qYSxcbiAgICAgICAgICB0Mi5yZWFkaW5nX2tvIGFzIHJlYWRpbmdfa28sXG4gICAgICAgICAgdDEucyAgICAgICAgICBhcyBzXG4gICAgICAgIGZyb20ganpyX3JlYWRpbmdfcGFpcnNfemhfamEgYXMgdDFcbiAgICAgICAgam9pbiBqenJfcmVhZGluZ19wYWlyc196aF9rbyBhcyB0MiBvbiAoIHQxLnMgPSB0Mi5zIGFuZCB0MS5yZWFkaW5nX3poID0gdDIucmVhZGluZ19rbyApXG4gICAgICAgIHdoZXJlIHQxLnJlYWRpbmdfemggPSB0MS5yZWFkaW5nX2phXG4gICAgICAgIG9yZGVyIGJ5IHQxLnJlYWRpbmdfemgsIHQxLnNcbiAgICAgIDtcIlwiXCJcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2JhbmRfbmFtZXMgYXNcbiAgICAgIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIHQxLnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgYzEsXG4gICAgICAgICAgdDIucyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBjMixcbiAgICAgICAgICB0MS5yZWFkaW5nX3poIHx8ICcgJyB8fCB0Mi5yZWFkaW5nX3poIGFzIHJlYWRpbmdcbiAgICAgICAgZnJvbSBqenJfZXF1aXZhbGVudF9yZWFkaW5nX3RyaXBsZXMgYXMgdDFcbiAgICAgICAgam9pbiBqenJfZXF1aXZhbGVudF9yZWFkaW5nX3RyaXBsZXMgYXMgdDJcbiAgICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICAgIGFuZCAoIGMxICE9IGMyIClcbiAgICAgICAgICBhbmQgKCBjMSBub3QgaW4gKCAn5rqAJywgJ+ifhycsICflvKUnLCAn5L6tJywgJ+WwvScsICflvLknLCAn5by+JyApIClcbiAgICAgICAgICBhbmQgKCBjMiBub3QgaW4gKCAn5rqAJywgJ+ifhycsICflvKUnLCAn5L6tJywgJ+WwvScsICflvLknLCAn5by+JyApIClcbiAgICAgICAgb3JkZXIgYnkgcmVhZGluZ1xuICAgICAgO1wiXCJcIlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfYmFuZF9uYW1lc18yIGFzXG4gICAgICBzZWxlY3RcbiAgICAgICAgICBjMSB8fCBjMiBhcyBjXG4gICAgICAgIGZyb20ganpyX2JhbmRfbmFtZXNcbiAgICAgICAgb3JkZXIgYnkgcmVhZGluZ1xuICAgICAgO1wiXCJcIlxuXG4gICAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2NvbXBvbmVudHMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByZWYgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBsZXZlbCAgICAgaW50ZWdlciAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBsbnIgICAgICAgaW50ZWdlciAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBybnIgICAgICAgaW50ZWdlciAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBnbHlwaCAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBjb21wb25lbnQgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgZm9yZWlnbiBrZXkgKCByZWYgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICggcm93aWQgKSxcbiAgICAgIGNoZWNrICggKCBsZW5ndGgoIGdseXBoICAgICApID0gMSApIG9yICggZ2x5cGggICAgICByZWdleHAgJ14mW1xcXFwtYS16MC05X10rI1swLTlhLWZdezQsNn07JCcgKSApLFxuICAgICAgY2hlY2sgKCAoIGxlbmd0aCggY29tcG9uZW50ICkgPSAxICkgb3IgKCBjb21wb25lbnQgIHJlZ2V4cCAnXiZbXFxcXC1hLXowLTlfXSsjWzAtOWEtZl17NCw2fTskJyApICksXG4gICAgICBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXi4qJCcgKVxuICAgICAgKTtcIlwiXCJcblxuXG4gICAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgICAjIyNcblxuICAgICAgLm8gIC5vODhvLiAgICAgICAgICAgICAgICAgICAgICAgb29vbyAgICAgIC4gICAgICAgICAgICBvLlxuICAgICAuOCcgIDg4OCBgXCIgICAgICAgICAgICAgICAgICAgICAgIGA4ODggICAgLm84ICAgICAgICAgICAgYDguXG4gICAgLjgnICBvODg4b28gICAub29vby4gICBvb29vICBvb29vICAgODg4ICAubzg4OG9vICAub29vby5vICBgOC5cbiAgICA4OCAgICA4ODggICAgYFAgICk4OGIgIGA4ODggIGA4ODggICA4ODggICAgODg4ICAgZDg4KCAgXCI4ICAgODhcbiAgICA4OCAgICA4ODggICAgIC5vUFwiODg4ICAgODg4ICAgODg4ICAgODg4ICAgIDg4OCAgIGBcIlk4OGIuICAgIDg4XG4gICAgYDguICAgODg4ICAgIGQ4KCAgODg4ICAgODg4ICAgODg4ICAgODg4ICAgIDg4OCAuIG8uICApODhiICAuOCdcbiAgICAgYDguIG84ODhvICAgYFk4ODhcIlwiOG8gIGBWODhWXCJWOFAnIG84ODhvICAgXCI4ODhcIiA4XCJcIjg4OFAnIC44J1xuICAgICAgYFwiICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCInXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuICAgICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcgX2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzIGFzIHNlbGVjdFxuICAgICAgICBtbC5yb3dpZCAgYXMgcm93aWQsXG4gICAgICAgIG1sLnJlZiAgICBhcyByZWYsXG4gICAgICAgIG1sLmxpbmUgICBhcyBsaW5lXG4gICAgICBmcm9tIGp6cl9taXJyb3JfbGluZXMgYXMgbWxcbiAgICAgIHdoZXJlIHRydWVcbiAgICAgICAgYW5kICggbm90IGlzX3VjX25vcm1hbCggbWwubGluZSApIClcbiAgICAgIG9yZGVyIGJ5IG1sLnJvd2lkO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBfanpyX21ldGFfa3JfcmVhZGluZ3NfdW5rbm93bl92ZXJiX2ZhdWx0cyBhcyBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICBjb3VudCgqKSBvdmVyICggcGFydGl0aW9uIGJ5IHYgKSAgICBhcyBjb3VudCxcbiAgICAgICAgICAnanpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlczpSPSonICBhcyByb3dpZCxcbiAgICAgICAgICAnKicgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgJ3Vua25vd24tdmVyYicgICAgICAgICAgICAgICAgICAgICAgYXMgZGVzY3JpcHRpb24sXG4gICAgICAgICAgdiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcXVvdGVcbiAgICAgICAgZnJvbSBqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzIGFzIG5uXG4gICAgICAgIHdoZXJlIG5vdCBleGlzdHMgKCBzZWxlY3QgMSBmcm9tIGp6cl9taXJyb3JfdmVyYnMgYXMgdmIgd2hlcmUgdmIudiA9IG5uLnYgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcgX2p6cl9tZXRhX2Vycm9yX3ZlcmJfZmF1bHRzIGFzIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIGNvdW50KCopIG92ZXIgKCBwYXJ0aXRpb24gYnkgdiApICAgIGFzIGNvdW50LFxuICAgICAgICAgICdlcnJvcjpSPSonICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJvd2lkLFxuICAgICAgICAgIHJvd2lkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAnZXJyb3ItdmVyYicgICAgICAgICAgICAgICAgICAgICAgICBhcyBkZXNjcmlwdGlvbixcbiAgICAgICAgICAndjonIHx8IHYgfHwgJywgbzonIHx8IG8gICAgICAgICAgICBhcyBxdW90ZVxuICAgICAgICBmcm9tIGp6cl90cmlwbGVzIGFzIG5uXG4gICAgICAgIHdoZXJlIHYgbGlrZSAnJTplcnJvcic7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV9taXJyb3JfbGluZXNfd2hpdGVzcGFjZV9mYXVsdHMgYXMgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgMSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgY291bnQsXG4gICAgICAgICAgJ3Q6bXI6bG46amZpZWxkczp3czpSPSonICAgICAgICAgICAgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgICAgbWwucm93aWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICdleHRyYW5lb3VzLXdoaXRlc3BhY2UnICAgICAgICAgICAgICAgICAgICAgIGFzIGRlc2NyaXB0aW9uLFxuICAgICAgICAgIG1sLmpmaWVsZHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHF1b3RlXG4gICAgICAgIGZyb20ganpyX21pcnJvcl9saW5lcyBhcyBtbFxuICAgICAgICB3aGVyZSAoIGhhc19wZXJpcGhlcmFsX3dzX2luX2pmaWVsZCggamZpZWxkcyApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV9taXJyb3JfbGluZXNfd2l0aF9lcnJvcnMgYXMgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgMSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgY291bnQsXG4gICAgICAgICAgJ3Q6bXI6bG46amZpZWxkczp3czpSPSonICAgICAgICAgICAgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgICAgbWwucm93aWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICdlcnJvcicgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGRlc2NyaXB0aW9uLFxuICAgICAgICAgIG1sLmxpbmUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHF1b3RlXG4gICAgICAgIGZyb20ganpyX21pcnJvcl9saW5lcyBhcyBtbFxuICAgICAgICB3aGVyZSAoIG1sLmxjb2RlID0gJ0UnICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9tZXRhX2ZhdWx0cyBhc1xuICAgICAgc2VsZWN0IG51bGwgYXMgY291bnQsIG51bGwgYXMgcm93aWQsIG51bGwgYXMgcmVmLCBudWxsIGFzIGRlc2NyaXB0aW9uLCBudWxsICBhcyBxdW90ZSB3aGVyZSBmYWxzZSB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IDEsIHJvd2lkLCByZWYsICAndWMtbm9ybWFsaXphdGlvbicsIGxpbmUgIGFzIHF1b3RlIGZyb20gX2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzICAgICAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX2tyX3JlYWRpbmdzX3Vua25vd25fdmVyYl9mYXVsdHMgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX2Vycm9yX3ZlcmJfZmF1bHRzICAgICAgICAgICAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX21pcnJvcl9saW5lc193aGl0ZXNwYWNlX2ZhdWx0cyAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX21pcnJvcl9saW5lc193aXRoX2Vycm9ycyAgICAgICAgIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9zeWxsYWJsZXMgYXMgc2VsZWN0XG4gICAgIyAgICAgICB0MS5zXG4gICAgIyAgICAgICB0MS52XG4gICAgIyAgICAgICB0MS5vXG4gICAgIyAgICAgICB0aS5zIGFzIGluaXRpYWxfaGFuZ1xuICAgICMgICAgICAgdG0ucyBhcyBtZWRpYWxfaGFuZ1xuICAgICMgICAgICAgdGYucyBhcyBmaW5hbF9oYW5nXG4gICAgIyAgICAgICB0aS5vIGFzIGluaXRpYWxfbGF0blxuICAgICMgICAgICAgdG0ubyBhcyBtZWRpYWxfbGF0blxuICAgICMgICAgICAgdGYubyBhcyBmaW5hbF9sYXRuXG4gICAgIyAgICAgZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0MVxuICAgICMgICAgIGpvaW5cbiAgICAjICAgICBqb2luIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHRpIG9uICggdDEuKVxuICAgICMgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMjIyBhZ2dyZWdhdGUgdGFibGUgZm9yIGFsbCByb3dpZHMgZ29lcyBoZXJlICMjI1xuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIyNcblxuICAgICAgICAgICAgICAgLiAgICAgICAgICAgICAgICAgLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAubzggICAgICAgICAgICAgICAubzggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm84XG4gICAub29vby5vIC5vODg4b28gIC5vb29vLiAgIC5vODg4b28gIC5vb29vby4gIG9vby4gLm9vLiAgLm9vLiAgICAub29vb28uICBvb28uIC5vby4gICAubzg4OG9vICAub29vby5vXG4gIGQ4OCggIFwiOCAgIDg4OCAgIGBQICApODhiICAgIDg4OCAgIGQ4OCcgYDg4YiBgODg4UFwiWTg4YlBcIlk4OGIgIGQ4OCcgYDg4YiBgODg4UFwiWTg4YiAgICA4ODggICBkODgoICBcIjhcbiAgYFwiWTg4Yi4gICAgODg4ICAgIC5vUFwiODg4ICAgIDg4OCAgIDg4OG9vbzg4OCAgODg4ICAgODg4ICAgODg4ICA4ODhvb284ODggIDg4OCAgIDg4OCAgICA4ODggICBgXCJZODhiLlxuICBvLiAgKTg4YiAgIDg4OCAuIGQ4KCAgODg4ICAgIDg4OCAuIDg4OCAgICAubyAgODg4ICAgODg4ICAgODg4ICA4ODggICAgLm8gIDg4OCAgIDg4OCAgICA4ODggLiBvLiAgKTg4YlxuICA4XCJcIjg4OFAnICAgXCI4ODhcIiBgWTg4OFwiXCI4byAgIFwiODg4XCIgYFk4Ym9kOFAnIG84ODhvIG84ODhvIG84ODhvIGBZOGJvZDhQJyBvODg4byBvODg4byAgIFwiODg4XCIgOFwiXCI4ODhQJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAc3RhdGVtZW50czpcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9nbHlwaHJhbmdlOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9nbHlwaHJhbmdlcyAoIHJzZywgaXNfY2prLCBsbywgaGksIG5hbWUgKSB2YWx1ZXMgKCAkcnNnLCAkaXNfY2prLCAkbG8sICRoaSwgJG5hbWUgKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIGRza2V5ICkgZG8gdXBkYXRlIHNldCBwYXRoID0gZXhjbHVkZWQucGF0aFxuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfZGF0YXNvdXJjZV9mb3JtYXQ6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX2RhdGFzb3VyY2VfZm9ybWF0cyAoIGZvcm1hdCwgY29tbWVudCApIHZhbHVlcyAoICRmb3JtYXQsICRjb21tZW50IClcbiAgICAgICAgLS0gb24gY29uZmxpY3QgKCBkc2tleSApIGRvIHVwZGF0ZSBzZXQgcGF0aCA9IGV4Y2x1ZGVkLnBhdGhcbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX2RhdGFzb3VyY2U6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX2RhdGFzb3VyY2VzICggcm93aWQsIGRza2V5LCBmb3JtYXQsIHBhdGggKSB2YWx1ZXMgKCAkcm93aWQsICRkc2tleSwgJGZvcm1hdCwgJHBhdGggKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIGRza2V5ICkgZG8gdXBkYXRlIHNldCBwYXRoID0gZXhjbHVkZWQucGF0aFxuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfbWlycm9yX3ZlcmI6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl92ZXJicyAoIHJvd2lkLCByYW5rLCBzLCB2LCBvICkgdmFsdWVzICggJHJvd2lkLCAkcmFuaywgJHMsICR2LCAkbyApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcm93aWQgKSBkbyB1cGRhdGUgc2V0IHJhbmsgPSBleGNsdWRlZC5yYW5rLCBzID0gZXhjbHVkZWQucywgdiA9IGV4Y2x1ZGVkLnYsIG8gPSBleGNsdWRlZC5vXG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGU6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl9sY29kZXMgKCByb3dpZCwgbGNvZGUsIGNvbW1lbnQgKSB2YWx1ZXMgKCAkcm93aWQsICRsY29kZSwgJGNvbW1lbnQgKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIHJvd2lkICkgZG8gdXBkYXRlIHNldCBsY29kZSA9IGV4Y2x1ZGVkLmxjb2RlLCBjb21tZW50ID0gZXhjbHVkZWQuY29tbWVudFxuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfbWlycm9yX3RyaXBsZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoIHJvd2lkLCByZWYsIHMsIHYsIG8gKSB2YWx1ZXMgKCAkcm93aWQsICRyZWYsICRzLCAkdiwgJG8gKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIHJlZiwgcywgdiwgbyApIGRvIG5vdGhpbmdcbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfbGluZXMgKCBkc2tleSwgbGluZV9uciwgbGNvZGUsIGxpbmUsIGpmaWVsZHMgKVxuICAgICAgc2VsZWN0XG4gICAgICAgIC0tICd0Om1yOmxuOlI9JyB8fCByb3dfbnVtYmVyKCkgb3ZlciAoKSAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgLS0gZHMuZHNrZXkgfHwgJzpMPScgfHwgZmwubGluZV9uciAgIGFzIHJvd2lkLFxuICAgICAgICBkcy5kc2tleSAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZHNrZXksXG4gICAgICAgIGZsLmxpbmVfbnIgICAgICAgICAgICAgICAgICAgICAgICBhcyBsaW5lX25yLFxuICAgICAgICBmbC5sY29kZSAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbGNvZGUsXG4gICAgICAgIGZsLmxpbmUgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBsaW5lLFxuICAgICAgICBmbC5qZmllbGRzICAgICAgICAgICAgICAgICAgICAgICAgYXMgamZpZWxkc1xuICAgICAgZnJvbSBqenJfZGF0YXNvdXJjZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZHNcbiAgICAgIGpvaW4ganpyX2RhdGFzb3VyY2VfZm9ybWF0cyAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGRmIHVzaW5nICggZm9ybWF0IClcbiAgICAgIGpvaW4gd2Fsa19maWxlX2xpbmVzKCBkcy5kc2tleSwgZGYuZm9ybWF0LCBkcy5wYXRoICkgIGFzIGZsXG4gICAgICB3aGVyZSB0cnVlXG4gICAgICAtLSBvbiBjb25mbGljdCAoIGRza2V5LCBsaW5lX25yICkgZG8gdXBkYXRlIHNldCBsaW5lID0gZXhjbHVkZWQubGluZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgKCByb3dpZCwgcmVmLCBzLCB2LCBvIClcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICBndC5yb3dpZF9vdXQgICAgYXMgcm93aWQsXG4gICAgICAgICAgICBndC5yZWYgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICAgZ3QucyAgICAgICAgICAgIGFzIHMsXG4gICAgICAgICAgICBndC52ICAgICAgICAgICAgYXMgdixcbiAgICAgICAgICAgIGd0Lm8gICAgICAgICAgICBhcyBvXG4gICAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIG1sXG4gICAgICAgICAgam9pbiBnZXRfdHJpcGxlcyggbWwucm93aWQsIG1sLmRza2V5LCBtbC5qZmllbGRzICkgIGFzIGd0XG4gICAgICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICAgICAgYW5kICggbWwubGNvZGUgPSAnRCcgKVxuICAgICAgICAgICAgLS0gYW5kICggbWwuZHNrZXkgPSAnZGljdDptZWFuaW5ncycgKVxuICAgICAgICAgICAgYW5kICggbWwuamZpZWxkcyBpcyBub3QgbnVsbCApXG4gICAgICAgICAgICBhbmQgKCBtbC5qZmllbGRzLT4+JyRbMF0nIG5vdCByZWdleHAgJ15AZ2x5cGhzJyApXG4gICAgICAgICAgICAtLSBhbmQgKCBtbC5maWVsZF8zIHJlZ2V4cCAnXig/OnB5fGhpfGthKTonIClcbiAgICAgICAgLS0gb24gY29uZmxpY3QgKCByZWYsIHMsIHYsIG8gKSBkbyBub3RoaW5nXG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcG9wdWxhdGVfanpyX2xhbmdfaGFuZ2V1bF9zeWxsYWJsZXM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgKCByb3dpZCwgcmVmLFxuICAgICAgICBzeWxsYWJsZV9oYW5nLCBpbml0aWFsX2hhbmcsIG1lZGlhbF9oYW5nLCBmaW5hbF9oYW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgaW5pdGlhbF9sYXRuLCBtZWRpYWxfbGF0biwgZmluYWxfbGF0biApXG4gICAgICAgIHNlbGVjdFxuICAgICAgICAgICAgJ3Q6bGFuZzpoYW5nOnN5bDpWPScgfHwgbXQubyAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgICAgIG10LnJvd2lkICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICAgbXQubyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBzeWxsYWJsZV9oYW5nLFxuICAgICAgICAgICAgZGguaW5pdGlhbCAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBpbml0aWFsX2hhbmcsXG4gICAgICAgICAgICBkaC5tZWRpYWwgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIG1lZGlhbF9oYW5nLFxuICAgICAgICAgICAgZGguZmluYWwgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBmaW5hbF9oYW5nLFxuICAgICAgICAgICAgY29hbGVzY2UoIG10aS5vLCAnJyApICAgICAgICAgICAgICAgICBhcyBpbml0aWFsX2xhdG4sXG4gICAgICAgICAgICBjb2FsZXNjZSggbXRtLm8sICcnICkgICAgICAgICAgICAgICAgIGFzIG1lZGlhbF9sYXRuLFxuICAgICAgICAgICAgY29hbGVzY2UoIG10Zi5vLCAnJyApICAgICAgICAgICAgICAgICBhcyBmaW5hbF9sYXRuXG4gICAgICAgICAgZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAgICAgICAgICAgICBhcyBtdFxuICAgICAgICAgIGxlZnQgam9pbiBkaXNhc3NlbWJsZV9oYW5nZXVsKCBtdC5vICkgICAgYXMgZGhcbiAgICAgICAgICBsZWZ0IGpvaW4ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgbXRpIG9uICggbXRpLnMgPSBkaC5pbml0aWFsIGFuZCBtdGkudiA9ICd4OmtvLUhhbmcrTGF0bjppbml0aWFsJyApXG4gICAgICAgICAgbGVmdCBqb2luIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIG10bSBvbiAoIG10bS5zID0gZGgubWVkaWFsICBhbmQgbXRtLnYgPSAneDprby1IYW5nK0xhdG46bWVkaWFsJyAgKVxuICAgICAgICAgIGxlZnQgam9pbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyBtdGYgb24gKCBtdGYucyA9IGRoLmZpbmFsICAgYW5kIG10Zi52ID0gJ3g6a28tSGFuZytMYXRuOmZpbmFsJyAgIClcbiAgICAgICAgICB3aGVyZSB0cnVlXG4gICAgICAgICAgICBhbmQgKCBtdC52ID0gJ2M6cmVhZGluZzprby1IYW5nJyApXG4gICAgICAgICAgb3JkZXIgYnkgbXQub1xuICAgICAgICAtLSBvbiBjb25mbGljdCAoIHJvd2lkICAgICAgICAgKSBkbyBub3RoaW5nXG4gICAgICAgIC8qICMjIyBOT1RFIGBvbiBjb25mbGljdGAgbmVlZGVkIGJlY2F1c2Ugd2UgbG9nIGFsbCBhY3R1YWxseSBvY2N1cnJpbmcgcmVhZGluZ3Mgb2YgYWxsIGNoYXJhY3RlcnMgKi9cbiAgICAgICAgb24gY29uZmxpY3QgKCBzeWxsYWJsZV9oYW5nICkgZG8gbm90aGluZ1xuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9nbHlwaHJhbmdlOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9nbHlwaHJhbmdlcyAoIHJzZywgaXNfY2prLCBsbywgaGksIG5hbWUgKVxuICAgICAgc2VsZWN0XG4gICAgICAgIC0tICd0Om1yOmxuOlI9JyB8fCByb3dfbnVtYmVyKCkgb3ZlciAoKSAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgLS0gZHMuZHNrZXkgfHwgJzpMPScgfHwgZmwubGluZV9uciAgIGFzIHJvd2lkLFxuICAgICAgICBnci5yc2cgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcnNnLFxuICAgICAgICBnci5pc19jamsgICAgICAgICAgICAgICAgICAgICAgICAgYXMgaXNfY2prLFxuICAgICAgICAtLSByZWZcbiAgICAgICAgZ3IubG8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGxvLFxuICAgICAgICBnci5oaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgaGksXG4gICAgICAgIGdyLm5hbWUgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBuYW1lXG4gICAgICBmcm9tIGp6cl9taXJyb3JfbGluZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIG1sXG4gICAgICBqb2luIHBhcnNlX3VjZGJfcnNnc19nbHlwaHJhbmdlKCBtbC5kc2tleSwgbWwubGluZV9uciwgbWwuamZpZWxkcyApIGFzIGdyXG4gICAgICB3aGVyZSB0cnVlXG4gICAgICAgIGFuZCAoIG1sLmRza2V5ID0gJ3VjZGI6cnNncycgKVxuICAgICAgICBhbmQgKCBtbC5sY29kZSA9ICdEJyApXG4gICAgICBvcmRlciBieSBtbC5saW5lX25yXG4gICAgICAtLSBvbiBjb25mbGljdCAoIGRza2V5LCBsaW5lX25yICkgZG8gdXBkYXRlIHNldCBsaW5lID0gZXhjbHVkZWQubGluZVxuICAgICAgO1wiXCJcIlxuXG4gICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIyMjXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvb29vICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgODg4ICAgICAgICAgICAgICAubzhcbiAgb28ub29vb28uICAgLm9vb29vLiAgb28ub29vb28uICBvb29vICBvb29vICAgODg4ICAgLm9vb28uICAgLm84ODhvbyAgLm9vb29vLlxuICAgODg4JyBgODhiIGQ4OCcgYDg4YiAgODg4JyBgODhiIGA4ODggIGA4ODggICA4ODggIGBQICApODhiICAgIDg4OCAgIGQ4OCcgYDg4YlxuICAgODg4ICAgODg4IDg4OCAgIDg4OCAgODg4ICAgODg4ICA4ODggICA4ODggICA4ODggICAub1BcIjg4OCAgICA4ODggICA4ODhvb284ODhcbiAgIDg4OCAgIDg4OCA4ODggICA4ODggIDg4OCAgIDg4OCAgODg4ICAgODg4ICAgODg4ICBkOCggIDg4OCAgICA4ODggLiA4ODggICAgLm9cbiAgIDg4OGJvZDhQJyBgWThib2Q4UCcgIDg4OGJvZDhQJyAgYFY4OFZcIlY4UCcgbzg4OG8gYFk4ODhcIlwiOG8gICBcIjg4OFwiIGBZOGJvZDhQJ1xuICAgODg4ICAgICAgICAgICAgICAgICAgODg4XG4gIG84ODhvICAgICAgICAgICAgICAgIG84ODhvXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGNvZGVzOiAtPlxuICAgIGRlYnVnICfOqWp6cnNkYl9fMTEnLCAnX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9sY29kZXMnXG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0Om1yOmxjOlY9QicsIGxjb2RlOiAnQicsIGNvbW1lbnQ6ICdibGFuayBsaW5lJywgICAgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPUMnLCBsY29kZTogJ0MnLCBjb21tZW50OiAnY29tbWVudCBsaW5lJywgIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl9sY29kZS5ydW4geyByb3dpZDogJ3Q6bXI6bGM6Vj1EJywgbGNvZGU6ICdEJywgY29tbWVudDogJ2RhdGEgbGluZScsICAgICB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0Om1yOmxjOlY9RScsIGxjb2RlOiAnRScsIGNvbW1lbnQ6ICdlcnJvcicsICAgICAgICAgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPVUnLCBsY29kZTogJ1UnLCBjb21tZW50OiAndW5rbm93bicsICAgICAgIH1cbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl92ZXJiczogLT5cbiAgICAjIyMgTk9URVxuICAgIGluIHZlcmJzLCBpbml0aWFsIGNvbXBvbmVudCBpbmRpY2F0ZXMgdHlwZSBvZiBzdWJqZWN0OlxuICAgICAgYGM6YCBpcyBmb3Igc3ViamVjdHMgdGhhdCBhcmUgQ0pLIGNoYXJhY3RlcnNcbiAgICAgIGB4OmAgaXMgdXNlZCBmb3IgdW5jbGFzc2lmaWVkIHN1YmplY3RzIChwb3NzaWJseSB0byBiZSByZWZpbmVkIGluIHRoZSBmdXR1cmUpXG4gICAgIyMjXG4gICAgZGVidWcgJ86panpyc2RiX18xMicsICdfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX3ZlcmJzJ1xuICAgIHJvd3MgPSBbXG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPXRlc3Rpbmc6dW51c2VkJywgICAgICAgICAgICAgIHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Rlc3Rpbmc6dW51c2VkJywgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPXg6a28tSGFuZytMYXRuOmluaXRpYWwnLCAgICAgIHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3g6a28tSGFuZytMYXRuOmluaXRpYWwnLCAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPXg6a28tSGFuZytMYXRuOm1lZGlhbCcsICAgICAgIHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3g6a28tSGFuZytMYXRuOm1lZGlhbCcsICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPXg6a28tSGFuZytMYXRuOmZpbmFsJywgICAgICAgIHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3g6a28tSGFuZytMYXRuOmZpbmFsJywgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzp6aC1MYXRuLXBpbnlpbicsICAgIHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzp6aC1MYXRuLXBpbnlpbicsICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzpqYS14LUthbicsICAgICAgICAgIHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzpqYS14LUthbicsICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzpqYS14LUhpcicsICAgICAgICAgIHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzpqYS14LUhpcicsICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzpqYS14LUthdCcsICAgICAgICAgIHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzpqYS14LUthdCcsICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzpqYS14LUxhdG4nLCAgICAgICAgIHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzpqYS14LUxhdG4nLCAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzpqYS14LUhpcitMYXRuJywgICAgIHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzpqYS14LUhpcitMYXRuJywgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzpqYS14LUthdCtMYXRuJywgICAgIHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzpqYS14LUthdCtMYXRuJywgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzprby1IYW5nJywgICAgICAgICAgIHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzprby1IYW5nJywgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzprby1MYXRuJywgICAgICAgICAgIHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzprby1MYXRuJywgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzprby1IYW5nOmluaXRpYWwnLCAgIHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzprby1IYW5nOmluaXRpYWwnLCAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzprby1IYW5nOm1lZGlhbCcsICAgIHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzprby1IYW5nOm1lZGlhbCcsICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzprby1IYW5nOmZpbmFsJywgICAgIHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzprby1IYW5nOmZpbmFsJywgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzprby1MYXRuOmluaXRpYWwnLCAgIHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzprby1MYXRuOmluaXRpYWwnLCAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzprby1MYXRuOm1lZGlhbCcsICAgIHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzprby1MYXRuOm1lZGlhbCcsICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6cmVhZGluZzprby1MYXRuOmZpbmFsJywgICAgIHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ2M6cmVhZGluZzprby1MYXRuOmZpbmFsJywgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6c2hhcGU6aWRzOnNob3J0ZXN0JywgICAgICAgIHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ2M6c2hhcGU6aWRzOnNob3J0ZXN0JywgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6c2hhcGU6aWRzOnNob3J0ZXN0OmFzdCcsICAgIHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ2M6c2hhcGU6aWRzOnNob3J0ZXN0OmFzdCcsICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJvd2lkOiAndDptcjp2YjpWPWM6c2hhcGU6aWRzOnNob3J0ZXN0OmVycm9yJywgIHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ2M6c2hhcGU6aWRzOnNob3J0ZXN0OmVycm9yJywgbzogXCJOTlwiLCB9XG4gICAgICAjIHsgcm93aWQ6ICd0Om1yOnZiOlY9YzpzaGFwZTppZHM6aGFzLW9wZXJhdG9yJywgICAgcmFuazogMiwgczogXCJOTlwiLCB2OiAnYzpzaGFwZTppZHM6aGFzLW9wZXJhdG9yJywgICBvOiBcIk5OXCIsIH1cbiAgICAgICMgeyByb3dpZDogJ3Q6bXI6dmI6Vj1jOnNoYXBlOmlkczpoYXMtY29tcG9uZW50JywgICByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICdjOnNoYXBlOmlkczpoYXMtY29tcG9uZW50JywgIG86IFwiTk5cIiwgfVxuICAgICAgXVxuICAgIGZvciByb3cgaW4gcm93c1xuICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfdmVyYi5ydW4gcm93XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlX2Zvcm1hdHM6IC0+XG4gICAgZGVidWcgJ86panpyc2RiX18xMycsICdfb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZV9mb3JtYXRzJ1xuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZV9mb3JtYXQucnVuIHsgZm9ybWF0OiAndHN2JywgICAgICAgY29tbWVudDogJ05OJywgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZV9mb3JtYXQucnVuIHsgZm9ybWF0OiAnbWQ6dGFibGUnLCAgY29tbWVudDogJ05OJywgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZV9mb3JtYXQucnVuIHsgZm9ybWF0OiAnY3N2JywgICAgICAgY29tbWVudDogJ05OJywgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZV9mb3JtYXQucnVuIHsgZm9ybWF0OiAnanNvbicsICAgICAgY29tbWVudDogJ05OJywgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZV9mb3JtYXQucnVuIHsgZm9ybWF0OiAnbWQnLCAgICAgICAgY29tbWVudDogJ05OJywgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZV9mb3JtYXQucnVuIHsgZm9ybWF0OiAndHh0JywgICAgICAgY29tbWVudDogJ05OJywgfVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZXM6IC0+XG4gICAgZGVidWcgJ86panpyc2RiX18xNCcsICdfb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZXMnXG4gICAgeyBwYXRoc1xuICAgICAgZm9ybWF0cywgfSA9IGdldF9wYXRoc19hbmRfZm9ybWF0cygpXG4gICAgIyBkc2tleSA9ICdkaWN0OnVjZDp2MTQuMDp1aGRpZHgnOyAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTInLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIGRza2V5ID0gJ2RpY3Q6bWVhbmluZ3MnOyAgICAgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIGRza2V5ID0gJ2RpY3Q6eDprby1IYW5nK0xhdG4nOyAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTInLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIGRza2V5ID0gJ2RpY3Q6eDpqYS1LYW4rTGF0bic7ICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTMnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZGljdDpqYTprYW5qaXVtJzsgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9NCcsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkaWN0OmphOmthbmppdW06YXV4JzsgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj01JywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICAjIGRza2V5ID0gJ2RpY3Q6a286Vj1kYXRhLWdvdi5jc3YnOyAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTYnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZGljdDprbzpWPWRhdGEtZ292Lmpzb24nOyAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9NycsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkaWN0OmtvOlY9ZGF0YS1uYXZlci5jc3YnOyAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj04JywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICAjIGRza2V5ID0gJ2RpY3Q6a286Vj1kYXRhLW5hdmVyLmpzb24nOyAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTknLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZGljdDprbzpWPVJFQURNRS5tZCc7ICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MTAnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIGRza2V5ID0gJ3NoYXBlOmlkc3YyJzsgICAgICAgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTExJywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdzaGFwZTp6aHo1YmYnOyAgICAgICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xMicsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAndWNkYjpyc2dzJzsgICAgICAgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MTMnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIDtudWxsXG5cbiAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgX29uX29wZW5fcG9wdWxhdGVfdmVyYnM6IC0+XG4gICMgICBwYXRocyA9IGdldF9wYXRoc19hbmRfZm9ybWF0cygpXG4gICMgICBkc2tleSA9ICdkaWN0Om1lYW5pbmdzJzsgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEnLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgIyAgIGRza2V5ID0gJ2RpY3Q6dWNkOnYxNC4wOnVoZGlkeCc7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MicsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAjICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGluZXM6IC0+XG4gICAgZGVidWcgJ86panpyc2RiX18xNScsICdfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzJ1xuICAgIEBzdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9taXJyb3JfbGluZXMucnVuKClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX2dseXBocmFuZ2U6IC0+XG4gICAgZGVidWcgJ86panpyc2RiX18xNicsICdfb25fb3Blbl9wb3B1bGF0ZV9qenJfZ2x5cGhyYW5nZSdcbiAgICBAc3RhdGVtZW50cy5wb3B1bGF0ZV9qenJfZ2x5cGhyYW5nZS5ydW4oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQ6ICggbmFtZSwgZmllbGRzLi4uICkgLT5cbiAgICAjIGRlYnVnICfOqWp6cnNkYl9fMTcnLCB7IG5hbWUsIGZpZWxkcywgfVxuICAgIEBzdGF0ZS5tb3N0X3JlY2VudF9pbnNlcnRlZF9yb3cgPSB7IG5hbWUsIGZpZWxkcywgfVxuICAgIDtudWxsXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAjIyNcblxuICBvb29vbyAgICAgb29vIG9vb29vb29vb28uICAgb29vb29vb29vb29vXG4gIGA4ODgnICAgICBgOCcgYDg4OCcgICBgWThiICBgODg4JyAgICAgYDhcbiAgIDg4OCAgICAgICA4ICAgODg4ICAgICAgODg4ICA4ODggICAgICAgICAgLm9vb28ub1xuICAgODg4ICAgICAgIDggICA4ODggICAgICA4ODggIDg4OG9vb284ICAgIGQ4OCggIFwiOFxuICAgODg4ICAgICAgIDggICA4ODggICAgICA4ODggIDg4OCAgICBcIiAgICBgXCJZODhiLlxuICAgYDg4LiAgICAuOCcgICA4ODggICAgIGQ4OCcgIDg4OCAgICAgICAgIG8uICApODhiXG4gICAgIGBZYm9kUCcgICAgbzg4OGJvb2Q4UCcgICBvODg4byAgICAgICAgOFwiXCI4ODhQJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBAZnVuY3Rpb25zOlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQ6XG4gICAgICAjIyMgTk9URSBpbiB0aGUgZnV0dXJlIHRoaXMgZnVuY3Rpb24gY291bGQgdHJpZ2dlciBjcmVhdGlvbiBvZiB0cmlnZ2VycyBvbiBpbnNlcnRzICMjI1xuICAgICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAgIHZhcmFyZ3M6ICAgICAgICB0cnVlXG4gICAgICBjYWxsOiAoIG5hbWUsIGZpZWxkcy4uLiApIC0+IEB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQgbmFtZSwgZmllbGRzLi4uXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMjIyBOT1RFIG1vdmVkIHRvIERicmljX3N0ZDsgY29uc2lkZXIgdG8gb3ZlcndyaXRlIHdpdGggdmVyc2lvbiB1c2luZyBgc2xldml0aGFuL3JlZ2V4YCAjIyNcbiAgICAjIHJlZ2V4cDpcbiAgICAjICAgb3ZlcndyaXRlOiAgICAgIHRydWVcbiAgICAjICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAjICAgY2FsbDogKCBwYXR0ZXJuLCB0ZXh0ICkgLT4gaWYgKCAoIG5ldyBSZWdFeHAgcGF0dGVybiwgJ3YnICkudGVzdCB0ZXh0ICkgdGhlbiAxIGVsc2UgMFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBpc191Y19ub3JtYWw6XG4gICAgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICAgIyMjIE5PVEU6IGFsc28gc2VlIGBTdHJpbmc6OmlzV2VsbEZvcm1lZCgpYCAjIyNcbiAgICAgIGNhbGw6ICggdGV4dCwgZm9ybSA9ICdORkMnICkgLT4gZnJvbV9ib29sIHRleHQgaXMgdGV4dC5ub3JtYWxpemUgZm9ybSAjIyMgJ05GQycsICdORkQnLCAnTkZLQycsIG9yICdORktEJyAjIyNcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaGFzX3BlcmlwaGVyYWxfd3NfaW5famZpZWxkOlxuICAgICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAgIGNhbGw6ICggamZpZWxkc19qc29uICkgLT5cbiAgICAgICAgcmV0dXJuIGZyb21fYm9vbCBmYWxzZSB1bmxlc3MgKCBqZmllbGRzID0gSlNPTi5wYXJzZSBqZmllbGRzX2pzb24gKT9cbiAgICAgICAgcmV0dXJuIGZyb21fYm9vbCBmYWxzZSB1bmxlc3MgKCB0eXBlX29mIGpmaWVsZHMgKSBpcyAnbGlzdCdcbiAgICAgICAgcmV0dXJuIGZyb21fYm9vbCBqZmllbGRzLnNvbWUgKCB2YWx1ZSApIC0+IC8oXlxccyl8KFxccyQpLy50ZXN0IHZhbHVlXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBAdGFibGVfZnVuY3Rpb25zOlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBzcGxpdF93b3JkczpcbiAgICAgIGNvbHVtbnM6ICAgICAgWyAna2V5d29yZCcsIF1cbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAnbGluZScsIF1cbiAgICAgIHJvd3M6ICggbGluZSApIC0+XG4gICAgICAgIGtleXdvcmRzID0gbGluZS5zcGxpdCAvKD86XFxwe1p9Kyl8KCg/OlxccHtTY3JpcHQ9SGFufSl8KD86XFxwe0x9Kyl8KD86XFxwe059Kyl8KD86XFxwe1N9KykpL3ZcbiAgICAgICAgZm9yIGtleXdvcmQgaW4ga2V5d29yZHNcbiAgICAgICAgICBjb250aW51ZSB1bmxlc3Mga2V5d29yZD9cbiAgICAgICAgICBjb250aW51ZSBpZiBrZXl3b3JkIGlzICcnXG4gICAgICAgICAgeWllbGQgeyBrZXl3b3JkLCB9XG4gICAgICAgIDtudWxsXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIHdhbGtfZmlsZV9saW5lczpcbiAgICAgIGNvbHVtbnM6ICAgICAgWyAnbGluZV9ucicsICdsY29kZScsICdsaW5lJywgJ2pmaWVsZHMnIF1cbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAnZHNrZXknLCAnZm9ybWF0JywgJ3BhdGgnLCBdXG4gICAgICByb3dzOiAoIGRza2V5LCBmb3JtYXQsIHBhdGggKSAtPlxuICAgICAgICB5aWVsZCBmcm9tIG5ldyBEYXRhc291cmNlX2ZpZWxkX3BhcnNlciB7IGhvc3Q6IEBob3N0LCBkc2tleSwgZm9ybWF0LCBwYXRoLCB9XG4gICAgICAgIDtudWxsXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGdldF90cmlwbGVzOlxuICAgICAgcGFyYW1ldGVyczogICBbICdyb3dpZF9pbicsICdkc2tleScsICdqZmllbGRzJywgXVxuICAgICAgY29sdW1uczogICAgICBbICdyb3dpZF9vdXQnLCAncmVmJywgJ3MnLCAndicsICdvJywgXVxuICAgICAgcm93czogKCByb3dpZF9pbiwgZHNrZXksIGpmaWVsZHMgKSAtPlxuICAgICAgICBmaWVsZHMgID0gSlNPTi5wYXJzZSBqZmllbGRzXG4gICAgICAgIGVudHJ5ICAgPSBmaWVsZHNbIDIgXVxuICAgICAgICBzd2l0Y2ggZHNrZXlcbiAgICAgICAgICB3aGVuICdkaWN0Ong6a28tSGFuZytMYXRuJyAgICAgICAgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fZGljdF94X2tvX0hhbmdfTGF0biAgICAgICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAgIHdoZW4gJ2RpY3Q6bWVhbmluZ3MnIHRoZW4gc3dpdGNoIHRydWVcbiAgICAgICAgICAgIHdoZW4gKCBlbnRyeS5zdGFydHNXaXRoICdweTonICkgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX3poX0xhdG5fcGlueWluICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAgICAgd2hlbiAoIGVudHJ5LnN0YXJ0c1dpdGggJ2thOicgKSB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXNfZnJvbV9jX3JlYWRpbmdfamFfeF9LYW4gICAgICAgIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICAgICB3aGVuICggZW50cnkuc3RhcnRzV2l0aCAnaGk6JyApIHRoZW4geWllbGQgZnJvbSBAdHJpcGxlc19mcm9tX2NfcmVhZGluZ19qYV94X0thbiAgICAgICAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgICAgIHdoZW4gKCBlbnRyeS5zdGFydHNXaXRoICdoZzonICkgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX2tvX0hhbmcgICAgICAgICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAgIHdoZW4gJ3NoYXBlOmlkc3YyJyAgICAgICAgICAgICAgICB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXNfZnJvbV9zaGFwZV9pZHN2MiAgICAgICAgICAgICAgIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICMgeWllbGQgZnJvbSBAZ2V0X3RyaXBsZXMgcm93aWRfaW4sIGRza2V5LCBqZmllbGRzXG4gICAgICAgIDtudWxsXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGRpc2Fzc2VtYmxlX2hhbmdldWw6XG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ2hhbmcnLCBdXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2luaXRpYWwnLCAnbWVkaWFsJywgJ2ZpbmFsJywgXVxuICAgICAgcm93czogKCBoYW5nICkgLT5cbiAgICAgICAgamFtb3MgPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5fVE1QX2hhbmdldWwuZGlzYXNzZW1ibGUgaGFuZywgeyBmbGF0dGVuOiBmYWxzZSwgfVxuICAgICAgICBmb3IgeyBmaXJzdDogaW5pdGlhbCwgdm93ZWw6IG1lZGlhbCwgbGFzdDogZmluYWwsIH0gaW4gamFtb3NcbiAgICAgICAgICB5aWVsZCB7IGluaXRpYWwsIG1lZGlhbCwgZmluYWwsIH1cbiAgICAgICAgO251bGxcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgcGFyc2VfdWNkYl9yc2dzX2dseXBocmFuZ2U6XG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ2Rza2V5JywgJ2xpbmVfbnInLCAnamZpZWxkcycsIF1cbiAgICAgIGNvbHVtbnM6ICAgICAgWyAncnNnJywgJ2lzX2NqaycsICdsbycsICdoaScsICduYW1lJywgXVxuICAgICAgcm93czogKCBkc2tleSwgbGluZV9uciwgamZpZWxkcyApIC0+XG4gICAgICAgIHlpZWxkIGRhdGFzb3VyY2VfZm9ybWF0X3BhcnNlci5wYXJzZV91Y2RiX3JzZ3NfZ2x5cGhyYW5nZSB7IGRza2V5LCBsaW5lX25yLCBqZmllbGRzLCB9XG4gICAgICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlwbGVzX2Zyb21fZGljdF94X2tvX0hhbmdfTGF0bjogKCByb3dpZF9pbiwgZHNrZXksIFsgcm9sZSwgcywgbywgXSApIC0+XG4gICAgcmVmICAgICAgID0gcm93aWRfaW5cbiAgICB2ICAgICAgICAgPSBcIng6a28tSGFuZytMYXRuOiN7cm9sZX1cIlxuICAgIG8gICAgICAgID89ICcnXG4gICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2LCBvLCB9XG4gICAgQHN0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX3poX0xhdG5fcGlueWluOiAoIHJvd2lkX2luLCBkc2tleSwgWyBfLCBzLCBlbnRyeSwgXSApIC0+XG4gICAgcmVmICAgICAgID0gcm93aWRfaW5cbiAgICB2ICAgICAgICAgPSAnYzpyZWFkaW5nOnpoLUxhdG4tcGlueWluJ1xuICAgIGZvciByZWFkaW5nIGZyb20gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9hdG9uYWxfemhfcmVhZGluZ3MgZW50cnlcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdiwgbzogcmVhZGluZywgfVxuICAgIEBzdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpcGxlc19mcm9tX2NfcmVhZGluZ19qYV94X0thbjogKCByb3dpZF9pbiwgZHNrZXksIFsgXywgcywgZW50cnksIF0gKSAtPlxuICAgIHJlZiAgICAgICA9IHJvd2lkX2luXG4gICAgaWYgZW50cnkuc3RhcnRzV2l0aCAna2E6J1xuICAgICAgdl94X0thbiAgID0gJ2M6cmVhZGluZzpqYS14LUthdCdcbiAgICAgIHZfTGF0biAgICA9ICdjOnJlYWRpbmc6amEteC1LYXQrTGF0bidcbiAgICBlbHNlXG4gICAgICB2X3hfS2FuICAgPSAnYzpyZWFkaW5nOmphLXgtSGlyJ1xuICAgICAgdl9MYXRuICAgID0gJ2M6cmVhZGluZzpqYS14LUhpcitMYXRuJ1xuICAgIGZvciByZWFkaW5nIGZyb20gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9qYV9yZWFkaW5ncyBlbnRyeVxuICAgICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiB2X3hfS2FuLCBvOiByZWFkaW5nLCB9XG4gICAgICAjIGZvciB0cmFuc2NyaXB0aW9uIGZyb20gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMucm9tYW5pemVfamFfa2FuYSByZWFkaW5nXG4gICAgICAjICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiB2X0xhdG4sIG86IHRyYW5zY3JpcHRpb24sIH1cbiAgICAgIHRyYW5zY3JpcHRpb24gPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5yb21hbml6ZV9qYV9rYW5hIHJlYWRpbmdcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogdl9MYXRuLCBvOiB0cmFuc2NyaXB0aW9uLCB9XG4gICAgQHN0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX2tvX0hhbmc6ICggcm93aWRfaW4sIGRza2V5LCBbIF8sIHMsIGVudHJ5LCBdICkgLT5cbiAgICByZWYgICAgICAgPSByb3dpZF9pblxuICAgIHYgICAgICAgICA9ICdjOnJlYWRpbmc6a28tSGFuZydcbiAgICBmb3IgcmVhZGluZyBmcm9tIEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfaGdfcmVhZGluZ3MgZW50cnlcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdiwgbzogcmVhZGluZywgfVxuICAgIEBzdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpcGxlc19mcm9tX3NoYXBlX2lkc3YyOiAoIHJvd2lkX2luLCBkc2tleSwgWyBfLCBzLCBmb3JtdWxhLCBdICkgLT5cbiAgICByZWYgICAgICAgPSByb3dpZF9pblxuICAgICMgZm9yIHJlYWRpbmcgZnJvbSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5wYXJzZV9pZHMgZm9ybXVsYVxuICAgICMgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHYsIG86IHJlYWRpbmcsIH1cbiAgICByZXR1cm4gbnVsbCBpZiAoIG5vdCBmb3JtdWxhPyApIG9yICggZm9ybXVsYSBpcyAnJyApXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6ICdjOnNoYXBlOmlkczpzaG9ydGVzdCcsIG86IGZvcm11bGEsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGVycm9yID0gbnVsbFxuICAgIHRyeSBmb3JtdWxhX2FzdCA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLnBhcnNlX2lkbHggZm9ybXVsYSBjYXRjaCBlcnJvclxuICAgICAgbyA9IEpTT04uc3RyaW5naWZ5IHsgcmVmOiAnzqlqenJzZGJfXzE5JywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSwgcm93OiB7IHJvd2lkX2luLCBkc2tleSwgcywgZm9ybXVsYSwgfSwgfVxuICAgICAgd2FybiBcImVycm9yOiAje299XCJcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ2M6c2hhcGU6aWRzOnNob3J0ZXN0OmVycm9yJywgbywgfVxuICAgIHJldHVybiBudWxsIGlmIGVycm9yP1xuICAgICMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIGZvcm11bGFfanNvbiAgICA9IEpTT04uc3RyaW5naWZ5IGZvcm11bGFfYXN0XG4gICAgIyB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6ICdjOnNoYXBlOmlkczpzaG9ydGVzdDphc3QnLCBvOiBmb3JtdWxhX2pzb24sIH1cbiAgICAjICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyB7IG9wZXJhdG9ycyxcbiAgICAjICAgY29tcG9uZW50cywgfSA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLm9wZXJhdG9yc19hbmRfY29tcG9uZW50c19mcm9tX2lkbHggZm9ybXVsYV9hc3RcbiAgICAjIHNlZW5fb3BlcmF0b3JzICA9IG5ldyBTZXQoKVxuICAgICMgc2Vlbl9jb21wb25lbnRzID0gbmV3IFNldCgpXG4gICAgIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgZm9yIG9wZXJhdG9yIGluIG9wZXJhdG9yc1xuICAgICMgICBjb250aW51ZSBpZiBzZWVuX29wZXJhdG9ycy5oYXMgb3BlcmF0b3JcbiAgICAjICAgc2Vlbl9vcGVyYXRvcnMuYWRkIG9wZXJhdG9yXG4gICAgIyAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ2M6c2hhcGU6aWRzOmhhcy1vcGVyYXRvcicsIG86IG9wZXJhdG9yLCB9XG4gICAgIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgZm9yIGNvbXBvbmVudCBpbiBjb21wb25lbnRzXG4gICAgIyAgIGNvbnRpbnVlIGlmIHNlZW5fY29tcG9uZW50cy5oYXMgY29tcG9uZW50XG4gICAgIyAgIHNlZW5fY29tcG9uZW50cy5hZGQgY29tcG9uZW50XG4gICAgIyAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ2M6c2hhcGU6aWRzOmhhcy1jb21wb25lbnQnLCBvOiBjb21wb25lbnQsIH1cbiAgICAjICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQHN0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgIDtudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIyNcblxuICAgICAgLm84ICAgICAgICAgICAgLm84OG8uXG4gICAgIFwiODg4ICAgICAgICAgICAgODg4IGBcIlxuIC5vb29vODg4ICAgLm9vb28ubyBvODg4b28gICAgIG9vLm9vb29vLiAgIC5vb29vLiAgIG9vb28gZDhiICAub29vby5vICAub29vb28uICBvb29vIGQ4YlxuZDg4JyBgODg4ICBkODgoICBcIjggIDg4OCAgICAgICAgODg4JyBgODhiIGBQICApODhiICBgODg4XCJcIjhQIGQ4OCggIFwiOCBkODgnIGA4OGIgYDg4OFwiXCI4UFxuODg4ICAgODg4ICBgXCJZODhiLiAgIDg4OCAgICAgICAgODg4ICAgODg4ICAub1BcIjg4OCAgIDg4OCAgICAgYFwiWTg4Yi4gIDg4OG9vbzg4OCAgODg4XG44ODggICA4ODggIG8uICApODhiICA4ODggICAgICAgIDg4OCAgIDg4OCBkOCggIDg4OCAgIDg4OCAgICAgby4gICk4OGIgODg4ICAgIC5vICA4ODhcbmBZOGJvZDg4UFwiIDhcIlwiODg4UCcgbzg4OG8gICAgICAgODg4Ym9kOFAnIGBZODg4XCJcIjhvIGQ4ODhiICAgIDhcIlwiODg4UCcgYFk4Ym9kOFAnIGQ4ODhiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIDg4OFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG84ODhvXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgRGF0YXNvdXJjZV9maWVsZF9wYXJzZXJcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAoeyBob3N0LCBkc2tleSwgZm9ybWF0LCBwYXRoLCB9KSAtPlxuICAgIEBob3N0ICAgICA9IGhvc3RcbiAgICBAZHNrZXkgICAgPSBkc2tleVxuICAgIEBmb3JtYXQgICA9IGZvcm1hdFxuICAgIEBwYXRoICAgICA9IHBhdGhcbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBbU3ltYm9sLml0ZXJhdG9yXTogLT4geWllbGQgZnJvbSBAd2FsaygpXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB3YWxrOiAtPlxuICAgIGRlYnVnICfOqWp6cnNkYl9fMjAnLCBcIndhbGtfZmlsZV9saW5lczpcIiwgeyBmb3JtYXQ6IEBmb3JtYXQsIGRza2V5OiBAZHNrZXksIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIG1ldGhvZF9uYW1lID0gJ3dhbGtfJyArIEBmb3JtYXQucmVwbGFjZSAvW15hLXpdL2d2LCAnXydcbiAgICBtZXRob2QgICAgICA9IEBbIG1ldGhvZF9uYW1lIF0gPyBAX3dhbGtfbm9fc3VjaF9wYXJzZXJcbiAgICB5aWVsZCBmcm9tIG1ldGhvZC5jYWxsIEBcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX3dhbGtfbm9fc3VjaF9wYXJzZXI6IC0+XG4gICAgbWVzc2FnZSA9IFwizqlqenJzZGJfXzIxIG5vIHBhcnNlciBmb3VuZCBmb3IgZm9ybWF0ICN7cnByIEBmb3JtYXR9XCJcbiAgICB3YXJuIG1lc3NhZ2VcbiAgICB5aWVsZCB7IGxpbmVfbnI6IDAsIGxjb2RlOiAnRScsIGxpbmU6IG1lc3NhZ2UsIGpmaWVsZHM6IG51bGwsIH1cbiAgICBmb3IgeyBsbnI6IGxpbmVfbnIsIGxpbmUsIGVvbCwgfSBmcm9tIHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgQHBhdGhcbiAgICAgIHlpZWxkIHsgbGluZV9uciwgbGNvZGU6ICdVJywgbGluZSwgamZpZWxkczogbnVsbCwgfVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB3YWxrX3RzdjogLT5cbiAgICBmb3IgeyBsbnI6IGxpbmVfbnIsIGxpbmUsIGVvbCwgfSBmcm9tIHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgQHBhdGhcbiAgICAgIGxpbmUgICAgPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5ub3JtYWxpemVfdGV4dCBsaW5lXG4gICAgICBqZmllbGRzID0gbnVsbFxuICAgICAgc3dpdGNoIHRydWVcbiAgICAgICAgd2hlbiAvXlxccyokL3YudGVzdCBsaW5lIHRoZW4gbGNvZGUgPSAnQidcbiAgICAgICAgd2hlbiAvXlxccyojL3YudGVzdCBsaW5lIHRoZW4gbGNvZGUgPSAnQydcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGxjb2RlID0gJ0QnXG4gICAgICAgICAgamZpZWxkcyAgID0gSlNPTi5zdHJpbmdpZnkgbGluZS5zcGxpdCAnXFx0J1xuICAgICAgeWllbGQgeyBsaW5lX25yLCBsY29kZSwgbGluZSwgamZpZWxkcywgfVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB3YWxrX21kX3RhYmxlOiAtPlxuICAgIGZvciB7IGxucjogbGluZV9uciwgbGluZSwgZW9sLCB9IGZyb20gd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBAcGF0aFxuICAgICAgbGluZSAgICA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLm5vcm1hbGl6ZV90ZXh0IGxpbmVcbiAgICAgIGpmaWVsZHMgPSBudWxsXG4gICAgICBsY29kZSAgID0gJ1UnXG4gICAgICBzd2l0Y2ggdHJ1ZVxuICAgICAgICB3aGVuIC9eXFxzKiQvdi50ZXN0IGxpbmUgICAgICAgdGhlbiBsY29kZSA9ICdCJ1xuICAgICAgICB3aGVuIG5vdCBsaW5lLnN0YXJ0c1dpdGggJ3wnICB0aGVuIG51bGwgIyBub3QgYW4gTUQgdGFibGVcbiAgICAgICAgd2hlbiBsaW5lLnN0YXJ0c1dpdGggJ3wtJyAgICAgdGhlbiBudWxsICMgTUQgdGFibGUgaGVhZGVyIHNlcGFyYXRvclxuICAgICAgICB3aGVuIC9eXFx8XFxzK1xcKi92LnRlc3QgbGluZSAgICB0aGVuIG51bGwgIyBNRCB0YWJsZSBoZWFkZXJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGxjb2RlICAgPSAnRCdcbiAgICAgICAgICBqZmllbGRzID0gbGluZS5zcGxpdCAnfCdcbiAgICAgICAgICBqZmllbGRzLnNoaWZ0KClcbiAgICAgICAgICBqZmllbGRzLnBvcCgpXG4gICAgICAgICAgamZpZWxkcyA9ICggZmllbGQudHJpbSgpICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgZmllbGQgaW4gamZpZWxkcyApXG4gICAgICAgICAgamZpZWxkcyA9ICggKCBmaWVsZC5yZXBsYWNlIC9eYCguKylgJC9ndiwgJyQxJyApICBmb3IgZmllbGQgaW4gamZpZWxkcyApXG4gICAgICAgICAgamZpZWxkcyA9IEpTT04uc3RyaW5naWZ5IGpmaWVsZHNcbiAgICAgICAgICAjIGRlYnVnICfOqWp6cnNkYl9fMjInLCBqZmllbGRzXG4gICAgICB5aWVsZCB7IGxpbmVfbnIsIGxjb2RlLCBsaW5lLCBqZmllbGRzLCB9XG4gICAgO251bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyB3YWxrX2NzdjogLT5cbiAgIyAgIHlpZWxkIHJldHVybiBudWxsXG5cbiAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgd2Fsa19qc29uOiAtPlxuICAjICAgeWllbGQgcmV0dXJuIG51bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyB3YWxrX21kOiAtPlxuICAjICAgeWllbGQgcmV0dXJuIG51bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyB3YWxrX3R4dDogLT5cbiAgIyAgIHlpZWxkIHJldHVybiBudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBkYXRhc291cmNlX2Zvcm1hdF9wYXJzZXJcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBwYXJzZV91Y2RiX3JzZ3NfZ2x5cGhyYW5nZTogKHsgamZpZWxkcywgfSkgLT5cbiAgICBbIGljbGFiZWwsXG4gICAgICByc2csXG4gICAgICBpc19jamtfdHh0LFxuICAgICAgbG9faGlfdHh0LFxuICAgICAgbmFtZSwgICAgIF0gPSBKU09OLnBhcnNlIGpmaWVsZHNcbiAgICBsb19oaV9yZSAgICAgID0gLy8vIF4gMHggKD88bG8+IFswLTlhLWZdezEsNn0gKSBcXHMqXFwuXFwuXFxzKiAweCAoPzxoaT4gWzAtOWEtZl17MSw2fSApICQgLy8vaXZcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlzX2NqayA9IHN3aXRjaCBpc19jamtfdHh0XG4gICAgICB3aGVuICd0cnVlJyAgIHRoZW4gMVxuICAgICAgd2hlbiAnZmFsc2UnICB0aGVuIDBcbiAgICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfXzIzIGV4cGVjdGVkICd0cnVlJyBvciAnZmFsc2UnLCBnb3QgI3tycHIgaXNfY2prX3R4dH1cIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgdW5sZXNzICggbWF0Y2ggPSBsb19oaV90eHQubWF0Y2ggbG9faGlfcmUgKT9cbiAgICAgIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX18yNCBleHBlY3RlZCBhIHJhbmdlIGxpdGVyYWwgbGlrZSAnMHgwMWE2Li4weDEwZmYnLCBnb3QgI3tycHIgbG9faGlfdHh0fVwiXG4gICAgbG8gID0gcGFyc2VJbnQgbWF0Y2guZ3JvdXBzLmxvLCAxNlxuICAgIGhpICA9IHBhcnNlSW50IG1hdGNoLmdyb3Vwcy5oaSwgMTZcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHJldHVybiB7IHJzZywgaXNfY2prLCBsbywgaGksIG5hbWUsIH1cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMjI1xuXG5vb29vb1xuYDg4OCdcbiA4ODggICAgICAgICAgLm9vb28uICAgb29vLiAub28uICAgIC5vb29vb29vbyAgICAgICAgICAgICAgLm9vb28ubyBvb29vIGQ4YiBvb29vICAgIG9vb1xuIDg4OCAgICAgICAgIGBQICApODhiICBgODg4UFwiWTg4YiAgODg4JyBgODhiICAgICAgICAgICAgICBkODgoICBcIjggYDg4OFwiXCI4UCAgYDg4LiAgLjgnXG4gODg4ICAgICAgICAgIC5vUFwiODg4ICAgODg4ICAgODg4ICA4ODggICA4ODggICAgICAgICAgICAgIGBcIlk4OGIuICAgODg4ICAgICAgIGA4OC4uOCdcbiA4ODggICAgICAgbyBkOCggIDg4OCAgIDg4OCAgIDg4OCAgYDg4Ym9kOFAnICAgICAgICAgICAgICBvLiAgKTg4YiAgODg4ICAgICAgICBgODg4J1xubzg4OG9vb29vb2Q4IGBZODg4XCJcIjhvIG84ODhvIG84ODhvIGA4b29vb29vLiAgb29vb29vb29vb28gOFwiXCI4ODhQJyBkODg4YiAgICAgICAgYDgnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRcIiAgICAgWURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJZODg4ODhQJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIExhbmd1YWdlX3NlcnZpY2VzXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX1RNUF9oYW5nZXVsID0gcmVxdWlyZSAnaGFuZ3VsLWRpc2Fzc2VtYmxlJ1xuICAgIEBfVE1QX2thbmEgICAgPSByZXF1aXJlICd3YW5ha2FuYSdcbiAgICAjIHsgdG9IaXJhZ2FuYSxcbiAgICAjICAgdG9LYW5hLFxuICAgICMgICB0b0thdGFrYW5hXG4gICAgIyAgIHRvUm9tYWppLFxuICAgICMgICB0b2tlbml6ZSwgICAgICAgICB9ID0gcmVxdWlyZSAnd2FuYWthbmEnXG4gICAgO3VuZGVmaW5lZFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgbm9ybWFsaXplX3RleHQ6ICggdGV4dCwgZm9ybSA9ICdORkMnICkgLT4gdGV4dC5ub3JtYWxpemUgZm9ybVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcmVtb3ZlX3Bpbnlpbl9kaWFjcml0aWNzOiAoIHRleHQgKSAtPiAoIHRleHQubm9ybWFsaXplICdORktEJyApLnJlcGxhY2UgL1xcUHtMfS9ndiwgJydcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGV4dHJhY3RfYXRvbmFsX3poX3JlYWRpbmdzOiAoIGVudHJ5ICkgLT5cbiAgICAjIHB5Onpow7ksIHpoZSwgemjEgW8sIHpow6FvLCB6aMeULCB6xKtcbiAgICBSID0gZW50cnlcbiAgICBSID0gUi5yZXBsYWNlIC9ecHk6L3YsICcnXG4gICAgUiA9IFIuc3BsaXQgLyxcXHMqL3ZcbiAgICBSID0gKCAoIEByZW1vdmVfcGlueWluX2RpYWNyaXRpY3MgemhfcmVhZGluZyApIGZvciB6aF9yZWFkaW5nIGluIFIgKVxuICAgIFIgPSBuZXcgU2V0IFJcbiAgICBSLmRlbGV0ZSAnbnVsbCdcbiAgICBSLmRlbGV0ZSAnQG51bGwnXG4gICAgcmV0dXJuIFsgUi4uLiwgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZXh0cmFjdF9qYV9yZWFkaW5nczogKCBlbnRyeSApIC0+XG4gICAgIyDnqbogICAgICBoaTrjgZ3jgoksIOOBgsK3KOOBj3zjgY1844GR44KLKSwg44GL44KJLCDjgZnCtyjjgY9844GL44GZKSwg44KA44GqwrfjgZfjgYRcbiAgICBSID0gZW50cnlcbiAgICBSID0gUi5yZXBsYWNlIC9eKD86aGl8a2EpOi92LCAnJ1xuICAgIFIgPSBSLnJlcGxhY2UgL1xccysvZ3YsICcnXG4gICAgUiA9IFIuc3BsaXQgLyxcXHMqL3ZcbiAgICAjIyMgTk9URSByZW1vdmUgbm8tcmVhZGluZ3MgbWFya2VyIGBAbnVsbGAgYW5kIGNvbnRleHR1YWwgcmVhZGluZ3MgbGlrZSAt44ON44OzIGZvciDnuIEsIC3jg47jgqYgZm9yIOeOiyAjIyNcbiAgICBSID0gKCByZWFkaW5nIGZvciByZWFkaW5nIGluIFIgd2hlbiBub3QgcmVhZGluZy5zdGFydHNXaXRoICctJyApXG4gICAgUiA9IG5ldyBTZXQgUlxuICAgIFIuZGVsZXRlICdudWxsJ1xuICAgIFIuZGVsZXRlICdAbnVsbCdcbiAgICByZXR1cm4gWyBSLi4uLCBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBleHRyYWN0X2hnX3JlYWRpbmdzOiAoIGVudHJ5ICkgLT5cbiAgICAjIOepuiAgICAgIGhpOuOBneOCiSwg44GCwrco44GPfOOBjXzjgZHjgospLCDjgYvjgoksIOOBmcK3KOOBj3zjgYvjgZkpLCDjgoDjgarCt+OBl+OBhFxuICAgIFIgPSBlbnRyeVxuICAgIFIgPSBSLnJlcGxhY2UgL14oPzpoZyk6L3YsICcnXG4gICAgUiA9IFIucmVwbGFjZSAvXFxzKy9ndiwgJydcbiAgICBSID0gUi5zcGxpdCAvLFxccyovdlxuICAgIFIgPSBuZXcgU2V0IFJcbiAgICBSLmRlbGV0ZSAnbnVsbCdcbiAgICBSLmRlbGV0ZSAnQG51bGwnXG4gICAgaGFuZ2V1bCA9IFsgUi4uLiwgXS5qb2luICcnXG4gICAgIyBkZWJ1ZyAnzqlqenJzZGJfXzI2JywgQF9UTVBfaGFuZ2V1bC5kaXNhc3NlbWJsZSBoYW5nZXVsLCB7IGZsYXR0ZW46IGZhbHNlLCB9XG4gICAgcmV0dXJuIFsgUi4uLiwgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcm9tYW5pemVfamFfa2FuYTogKCBlbnRyeSApIC0+XG4gICAgY2ZnID0ge31cbiAgICByZXR1cm4gQF9UTVBfa2FuYS50b1JvbWFqaSBlbnRyeSwgY2ZnXG4gICAgIyAjIyMgc3lzdGVtYXRpYyBuYW1lIG1vcmUgbGlrZSBgLi4uX2phX3hfa2FuX2xhdG4oKWAgIyMjXG4gICAgIyBoZWxwICfOqWRqa3JfXzI3JywgdG9IaXJhZ2FuYSAgJ+ODqeODvOODoeODsycsICAgICAgIHsgY29udmVydExvbmdWb3dlbE1hcms6IGZhbHNlLCB9XG4gICAgIyBoZWxwICfOqWRqa3JfXzI4JywgdG9IaXJhZ2FuYSAgJ+ODqeODvOODoeODsycsICAgICAgIHsgY29udmVydExvbmdWb3dlbE1hcms6IHRydWUsIH1cbiAgICAjIGhlbHAgJ86pZGprcl9fMjknLCB0b0thbmEgICAgICAnd2FuYWthbmEnLCAgIHsgY3VzdG9tS2FuYU1hcHBpbmc6IHsgbmE6ICfjgasnLCBrYTogJ0JhbmEnIH0sIH1cbiAgICAjIGhlbHAgJ86pZGprcl9fMzAnLCB0b0thbmEgICAgICAnd2FuYWthbmEnLCAgIHsgY3VzdG9tS2FuYU1hcHBpbmc6IHsgd2FrYTogJyjlkozmrYwpJywgd2E6ICco5ZKMMiknLCBrYTogJyjmrYwyKScsIG5hOiAnKOWQjSknLCBrYTogJyhCYW5hKScsIG5ha2E6ICco5LitKScsIH0sIH1cbiAgICAjIGhlbHAgJ86pZGprcl9fMzEnLCB0b1JvbWFqaSAgICAn44Gk44GY44GO44KKJywgICAgIHsgY3VzdG9tUm9tYWppTWFwcGluZzogeyDjgZg6ICcoemkpJywg44GkOiAnKHR1KScsIOOCijogJyhsaSknLCDjgorjgofjgYY6ICcocnlvdSknLCDjgorjgoc6ICcocnlvKScgfSwgfVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcGFyc2VfaWRseDogKCBmb3JtdWxhICkgLT4gSURMWC5wYXJzZSBmb3JtdWxhXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvcGVyYXRvcnNfYW5kX2NvbXBvbmVudHNfZnJvbV9pZGx4OiAoIGZvcm11bGEgKSAtPlxuICAgIHN3aXRjaCB0eXBlID0gdHlwZV9vZiBmb3JtdWxhXG4gICAgICB3aGVuICd0ZXh0JyAgIHRoZW4gIGZvcm11bGFfYXN0ID0gQHBhcnNlX2lkbHggZm9ybXVsYVxuICAgICAgd2hlbiAnbGlzdCcgICB0aGVuICBmb3JtdWxhX2FzdCA9ICAgICAgICAgICAgIGZvcm11bGFcbiAgICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfXzMyIGV4cGVjdGVkIGEgdGV4dCBvciBhIGxpc3QsIGdvdCBhICN7dHlwZX1cIlxuICAgIG9wZXJhdG9ycyAgID0gW11cbiAgICBjb21wb25lbnRzICA9IFtdXG4gICAgc2VwYXJhdGUgICAgPSAoIGxpc3QgKSAtPlxuICAgICAgZm9yIGVsZW1lbnQsIGlkeCBpbiBsaXN0XG4gICAgICAgIGlmIGlkeCBpcyAwXG4gICAgICAgICAgb3BlcmF0b3JzLnB1c2ggZWxlbWVudFxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIGlmICggdHlwZV9vZiBlbGVtZW50ICkgaXMgJ2xpc3QnXG4gICAgICAgICAgc2VwYXJhdGUgZWxlbWVudFxuICAgICAgICAgICMgY29tcG9uZW50cy5zcGxpY2UgY29tcG9uZW50cy5sZW5ndGgsIDAsICggc2VwYXJhdGUgZWxlbWVudCApLi4uXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgY29tcG9uZW50cy5wdXNoIGVsZW1lbnRcbiAgICBzZXBhcmF0ZSBmb3JtdWxhX2FzdFxuICAgIHJldHVybiB7IG9wZXJhdG9ycywgY29tcG9uZW50cywgfVxuXG5cblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjIyBUQUlOVCBnb2VzIGludG8gY29uc3RydWN0b3Igb2YgSnpyIGNsYXNzICMjI1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMjI1xuXG4gICBvb29vICBvOG9cbiAgIGA4ODggIGBcIidcbiAgICA4ODggb29vbyAgICBvb29vb29vbyBvb29vICBvb29vICBvb29vIGQ4YiAgLm9vb28uXG4gICAgODg4IGA4ODggICBkJ1wiXCI3ZDhQICBgODg4ICBgODg4ICBgODg4XCJcIjhQIGBQICApODhiXG4gICAgODg4ICA4ODggICAgIC5kOFAnICAgIDg4OCAgIDg4OCAgIDg4OCAgICAgIC5vUFwiODg4XG4gICAgODg4ICA4ODggICAuZDhQJyAgLlAgIDg4OCAgIDg4OCAgIDg4OCAgICAgZDgoICA4ODhcbi5vLiA4OFAgbzg4OG8gZDg4ODg4ODhQICAgYFY4OFZcIlY4UCcgZDg4OGIgICAgYFk4ODhcIlwiOG9cbmBZODg4UFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEppenVyYVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgeyBwYXRocywgfSAgICAgICAgICA9IGdldF9wYXRoc19hbmRfZm9ybWF0cygpXG4gICAgQHBhdGhzICAgICAgICAgICAgICA9IHBhdGhzXG4gICAgQGxhbmd1YWdlX3NlcnZpY2VzICA9IG5ldyBMYW5ndWFnZV9zZXJ2aWNlcygpXG4gICAgQGRiYSAgICAgICAgICAgICAgICA9IG5ldyBKenJfZGJfYWRhcHRlciBAcGF0aHMuZGIsIHsgaG9zdDogQCwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaWYgQGRiYS5pc19mcmVzaFxuICAgICMjIyBUQUlOVCBtb3ZlIHRvIEp6cl9kYl9hZGFwdGVyIHRvZ2V0aGVyIHdpdGggdHJ5L2NhdGNoICMjI1xuICAgICAgdHJ5XG4gICAgICAgIEBwb3B1bGF0ZV9tZWFuaW5nX21pcnJvcl90cmlwbGVzKClcbiAgICAgIGNhdGNoIGNhdXNlXG4gICAgICAgIGZpZWxkc19ycHIgPSBycHIgQGRiYS5zdGF0ZS5tb3N0X3JlY2VudF9pbnNlcnRlZF9yb3dcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfXzMzIHdoZW4gdHJ5aW5nIHRvIGluc2VydCB0aGlzIHJvdzogI3tmaWVsZHNfcnByfSwgYW4gZXJyb3Igd2FzIHRocm93bjogI3tjYXVzZS5tZXNzYWdlfVwiLCBcXFxuICAgICAgICAgIHsgY2F1c2UsIH1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAjIyMgVEFJTlQgbW92ZSB0byBKenJfZGJfYWRhcHRlciB0b2dldGhlciB3aXRoIHRyeS9jYXRjaCAjIyNcbiAgICAgIHRyeVxuICAgICAgICBAcG9wdWxhdGVfaGFuZ2V1bF9zeWxsYWJsZXMoKVxuICAgICAgY2F0Y2ggY2F1c2VcbiAgICAgICAgZmllbGRzX3JwciA9IHJwciBAZGJhLnN0YXRlLm1vc3RfcmVjZW50X2luc2VydGVkX3Jvd1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fMzQgd2hlbiB0cnlpbmcgdG8gaW5zZXJ0IHRoaXMgcm93OiAje2ZpZWxkc19ycHJ9LCBhbiBlcnJvciB3YXMgdGhyb3duOiAje2NhdXNlLm1lc3NhZ2V9XCIsIFxcXG4gICAgICAgICAgeyBjYXVzZSwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO3VuZGVmaW5lZFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcG9wdWxhdGVfbWVhbmluZ19taXJyb3JfdHJpcGxlczogLT5cbiAgICBkbyA9PlxuICAgICAgeyB0b3RhbF9yb3dfY291bnQsIH0gPSAoIEBkYmEucHJlcGFyZSBTUUxcIlwiXCJcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICBjb3VudCgqKSBhcyB0b3RhbF9yb3dfY291bnRcbiAgICAgICAgICBmcm9tIGp6cl9taXJyb3JfbGluZXNcbiAgICAgICAgICB3aGVyZSB0cnVlXG4gICAgICAgICAgICBhbmQgKCBkc2tleSBpcyAnZGljdDptZWFuaW5ncycgKVxuICAgICAgICAgICAgYW5kICggamZpZWxkcyBpcyBub3QgbnVsbCApIC0tIE5PVEU6IG5lY2Vzc2FyeVxuICAgICAgICAgICAgYW5kICggbm90IGpmaWVsZHMtPj4nJFswXScgcmVnZXhwICdeQGdseXBocycgKTtcIlwiXCIgKS5nZXQoKVxuICAgICAgdG90YWwgPSB0b3RhbF9yb3dfY291bnQgKiAyICMjIyBOT1RFIGVzdGltYXRlICMjI1xuICAgICAgaGVscCAnzqlqenJzZGJfXzM1JywgeyB0b3RhbF9yb3dfY291bnQsIHRvdGFsLCB9ICMgeyB0b3RhbF9yb3dfY291bnQ6IDQwMDg2LCB0b3RhbDogODAxNzIgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQGRiYS5zdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlcy5ydW4oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBwb3B1bGF0ZV9zaGFwZV9mb3JtdWxhX21pcnJvcl90cmlwbGVzOiAtPlxuICAgIEBkYmEuc3RhdGVtZW50cy5wb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXMucnVuKClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcG9wdWxhdGVfaGFuZ2V1bF9zeWxsYWJsZXM6IC0+XG4gICAgQGRiYS5zdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9sYW5nX2hhbmdldWxfc3lsbGFibGVzLnJ1bigpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7bnVsbFxuXG4gICMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIF9zaG93X2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzOiAtPlxuICAjICAgZmF1bHR5X3Jvd3MgPSAoIEBkYmEucHJlcGFyZSBTUUxcInNlbGVjdCAqIGZyb20gX2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzO1wiICkuYWxsKClcbiAgIyAgIHdhcm4gJ86panpyc2RiX18zNicsIHJldmVyc2UgZmF1bHR5X3Jvd3NcbiAgIyAgICMgZm9yIHJvdyBmcm9tXG4gICMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNob3dfY291bnRzOiAtPlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZG8gPT5cbiAgICAgIHF1ZXJ5ID0gU1FMXCJcIlwiXG4gICAgICAgIHNlbGVjdFxuICAgICAgICAgICAgbXYudiAgICAgICAgICAgIGFzIHYsXG4gICAgICAgICAgICBjb3VudCggdDMudiApICAgYXMgY291bnRcbiAgICAgICAgICBmcm9tICAgICAgICBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0M1xuICAgICAgICAgIHJpZ2h0IGpvaW4gIGp6cl9taXJyb3JfdmVyYnMgICAgICAgIGFzIG12IHVzaW5nICggdiApXG4gICAgICAgIGdyb3VwIGJ5IHZcbiAgICAgICAgb3JkZXIgYnkgY291bnQgZGVzYywgdjtcIlwiXCJcbiAgICAgIGVjaG8gKCBncmV5ICfOqWp6cnNkYl9fMzcnICksICggZ29sZCByZXZlcnNlIGJvbGQgcXVlcnkgKVxuICAgICAgY291bnRzID0gKCBAZGJhLnByZXBhcmUgcXVlcnkgKS5hbGwoKVxuICAgICAgY29uc29sZS50YWJsZSBjb3VudHNcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRvID0+XG4gICAgICBxdWVyeSA9IFNRTFwiXCJcIlxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICAgIG12LnYgICAgICAgICAgICBhcyB2LFxuICAgICAgICAgICAgY291bnQoIHQzLnYgKSAgIGFzIGNvdW50XG4gICAgICAgICAgZnJvbSAgICAgICAganpyX3RyaXBsZXMgICAgICAgYXMgdDNcbiAgICAgICAgICByaWdodCBqb2luICBqenJfbWlycm9yX3ZlcmJzICBhcyBtdiB1c2luZyAoIHYgKVxuICAgICAgICBncm91cCBieSB2XG4gICAgICAgIG9yZGVyIGJ5IGNvdW50IGRlc2MsIHY7XCJcIlwiXG4gICAgICBlY2hvICggZ3JleSAnzqlqenJzZGJfXzM4JyApLCAoIGdvbGQgcmV2ZXJzZSBib2xkIHF1ZXJ5IClcbiAgICAgIGNvdW50cyA9ICggQGRiYS5wcmVwYXJlIHF1ZXJ5ICkuYWxsKClcbiAgICAgIGNvbnNvbGUudGFibGUgY291bnRzXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkbyA9PlxuICAgICAgcXVlcnkgPSBTUUxcIlwiXCJcbiAgICAgICAgc2VsZWN0IGRza2V5LCBjb3VudCgqKSBhcyBjb3VudCBmcm9tIGp6cl9taXJyb3JfbGluZXMgZ3JvdXAgYnkgZHNrZXkgdW5pb24gYWxsXG4gICAgICAgIHNlbGVjdCAnKicsICAgY291bnQoKikgYXMgY291bnQgZnJvbSBqenJfbWlycm9yX2xpbmVzXG4gICAgICAgIG9yZGVyIGJ5IGNvdW50IGRlc2M7XCJcIlwiXG4gICAgICBlY2hvICggZ3JleSAnzqlqenJzZGJfXzM5JyApLCAoIGdvbGQgcmV2ZXJzZSBib2xkIHF1ZXJ5IClcbiAgICAgIGNvdW50cyA9ICggQGRiYS5wcmVwYXJlIHF1ZXJ5ICkuYWxsKClcbiAgICAgIGNvdW50cyA9IE9iamVjdC5mcm9tRW50cmllcyAoIFsgZHNrZXksIHsgY291bnQsIH0sIF0gZm9yIHsgZHNrZXksIGNvdW50LCB9IGluIGNvdW50cyApXG4gICAgICBjb25zb2xlLnRhYmxlIGNvdW50c1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNob3dfanpyX21ldGFfZmF1bHRzOiAtPlxuICAgIGlmICggZmF1bHR5X3Jvd3MgPSAoIEBkYmEucHJlcGFyZSBTUUxcInNlbGVjdCAqIGZyb20ganpyX21ldGFfZmF1bHRzO1wiICkuYWxsKCkgKS5sZW5ndGggPiAwXG4gICAgICBlY2hvICfOqWp6cnNkYl9fNDAnLCByZWQgcmV2ZXJzZSBib2xkIFwiIGZvdW5kIHNvbWUgZmF1bHRzOiBcIlxuICAgICAgY29uc29sZS50YWJsZSBmYXVsdHlfcm93c1xuICAgIGVsc2VcbiAgICAgIGVjaG8gJ86panpyc2RiX180MScsIGxpbWUgcmV2ZXJzZSBib2xkIFwiIChubyBmYXVsdHMpIFwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7bnVsbFxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMjI1xuXG5vb29vb29vb29vLiAgIG9vb29vb29vb29vbyBvb28gICAgICAgIG9vb29vICAgLm9vb29vby5cbmA4ODgnICAgYFk4YiAgYDg4OCcgICAgIGA4IGA4OC4gICAgICAgLjg4OCcgIGQ4UCcgIGBZOGJcbiA4ODggICAgICA4ODggIDg4OCAgICAgICAgICA4ODhiICAgICBkJzg4OCAgODg4ICAgICAgODg4XG4gODg4ICAgICAgODg4ICA4ODhvb29vOCAgICAgOCBZODguIC5QICA4ODggIDg4OCAgICAgIDg4OFxuIDg4OCAgICAgIDg4OCAgODg4ICAgIFwiICAgICA4ICBgODg4JyAgIDg4OCAgODg4ICAgICAgODg4XG4gODg4ICAgICBkODgnICA4ODggICAgICAgbyAgOCAgICBZICAgICA4ODggIGA4OGIgICAgZDg4J1xubzg4OGJvb2Q4UCcgICBvODg4b29vb29vZDggbzhvICAgICAgICBvODg4byAgYFk4Ym9vZDhQJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZGVtbyA9IC0+XG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMganpyLl9zaG93X2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzKClcbiAganpyLnNob3dfY291bnRzKClcbiAganpyLnNob3dfanpyX21ldGFfZmF1bHRzKClcbiAgIyBjOnJlYWRpbmc6amEteC1IaXJcbiAgIyBjOnJlYWRpbmc6amEteC1LYXRcbiAgaWYgZmFsc2VcbiAgICBzZWVuID0gbmV3IFNldCgpXG4gICAgZm9yIHsgcmVhZGluZywgfSBmcm9tIGp6ci5kYmEud2FsayBTUUxcInNlbGVjdCBkaXN0aW5jdCggbyApIGFzIHJlYWRpbmcgZnJvbSBqenJfdHJpcGxlcyB3aGVyZSB2ID0gJ2M6cmVhZGluZzpqYS14LUthdCcgb3JkZXIgYnkgbztcIlxuICAgICAgZm9yIHBhcnQgaW4gKCByZWFkaW5nLnNwbGl0IC8oLuODvHwu44OjfC7jg6V8LuODp3zjg4MufC4pL3YgKSB3aGVuIHBhcnQgaXNudCAnJ1xuICAgICAgICBjb250aW51ZSBpZiBzZWVuLmhhcyBwYXJ0XG4gICAgICAgIHNlZW4uYWRkIHBhcnRcbiAgICAgICAgZWNobyBwYXJ0XG4gICAgZm9yIHsgcmVhZGluZywgfSBmcm9tIGp6ci5kYmEud2FsayBTUUxcInNlbGVjdCBkaXN0aW5jdCggbyApIGFzIHJlYWRpbmcgZnJvbSBqenJfdHJpcGxlcyB3aGVyZSB2ID0gJ2M6cmVhZGluZzpqYS14LUhpcicgb3JkZXIgYnkgbztcIlxuICAgICAgZm9yIHBhcnQgaW4gKCByZWFkaW5nLnNwbGl0IC8oLuODvHwu44KDfC7jgoV8LuOCh3zjgaMufC4pL3YgKSB3aGVuIHBhcnQgaXNudCAnJ1xuICAgICAgIyBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLyguKS92ICkgd2hlbiBwYXJ0IGlzbnQgJydcbiAgICAgICAgY29udGludWUgaWYgc2Vlbi5oYXMgcGFydFxuICAgICAgICBzZWVuLmFkZCBwYXJ0XG4gICAgICAgIGVjaG8gcGFydFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIDtudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZGVtb19yZWFkX2R1bXAgPSAtPlxuICB7IEJlbmNobWFya2VyLCAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfYmVuY2htYXJraW5nKClcbiAgIyB7IG5hbWVpdCwgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfbmFtZWl0KClcbiAgYmVuY2htYXJrZXIgPSBuZXcgQmVuY2htYXJrZXIoKVxuICB0aW1laXQgPSAoIFAuLi4gKSAtPiBiZW5jaG1hcmtlci50aW1laXQgUC4uLlxuICB7IFVuZHVtcGVyLCAgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfc3FsaXRlX3VuZHVtcGVyKClcbiAgeyB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zLCAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2Zhc3RfbGluZXJlYWRlcigpXG4gIHsgd2MsICAgICAgICAgICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV93YygpXG4gIHBhdGggICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4vanpyLmR1bXAuc3FsJ1xuICBqenIgPSBuZXcgSml6dXJhKClcbiAganpyLmRiYS50ZWFyZG93biB7IHRlc3Q6ICcqJywgfVxuICBkZWJ1ZyAnzqlqenJzZGJfXzQyJywgVW5kdW1wZXIudW5kdW1wIHsgZGI6IGp6ci5kYmEsIHBhdGgsIG1vZGU6ICdmYXN0JywgfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGp6ci5zaG93X2NvdW50cygpXG4gIGp6ci5zaG93X2p6cl9tZXRhX2ZhdWx0cygpXG4gIDtudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5pZiBtb2R1bGUgaXMgcmVxdWlyZS5tYWluIHRoZW4gZG8gPT5cbiAgZGVtbygpXG4gICMgZGVtb19yZWFkX2R1bXAoKVxuICA7bnVsbFxuIl19
