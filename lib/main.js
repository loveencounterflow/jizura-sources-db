(function() {
  'use strict';
  var Async_jetstream, Benchmarker, Bsql3, Datasource_field_parser, Dbric, Dbric_std, FS, GUY, IDL, IDLX, Jetstream, Jizura, Jzr_db_adapter, Language_services, PATH, SFMODULES, SQL, alert, as_bool, benchmarker, blue, bold, datasource_format_parser, debug, demo_source_identifiers, echo, freeze, from_bool, get_paths_and_formats, glyph_converter, gold, green, grey, help, info, inspect, lets, lime, log, plain, praise, red, reverse, rpr, set_getter, timeit, type_of, urge, walk_lines_with_positions, warn, whisper, white;

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
      results.push(debug('Ωjzrsdb___1', key, value));
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
    var R, formats, kanjium, paths, rutopio, ucd1700;
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
    ucd1700 = PATH.join(paths.jzrnds, 'bvfs/origin/https/www.unicode.org/Public/17.0.0/ucd');
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
    paths['ds:ucd:ucd'] = PATH.join(ucd1700, 'UnicodeData.txt');
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
    formats['ds:ucd:ucd'] = 'dsf:semicolons';
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
              warn('Ωjzrsdb___2', error.message);
            }
          }
          if (messages.length === 0) {
            return null;
          }
          throw new Error(`Ωjzrsdb___3 EFFRI testing revealed errors: ${rpr(messages)}`);
          return null;
        })();
        //.......................................................................................................
        if (this.is_fresh) {
          this._on_open_populate_jzr_datasource_formats();
          this._on_open_populate_jzr_datasources();
          this._on_open_populate_jzr_mirror_verbs();
          this._on_open_populate_jzr_mirror_lcodes();
          this._on_open_populate_jzr_mirror_lines();
          this._on_open_populate_jzr_glyphranges();
          this._on_open_populate_jzr_glyphs();
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
        debug('Ωjzrsdb__27', '_on_open_populate_jzr_mirror_lcodes');
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
        debug('Ωjzrsdb__28', '_on_open_populate_jzr_mirror_verbs');
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
            rank: 2,
            s: "NN",
            v: 'v:c:shape:ids:error',
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
            v: 'v:c:shape:ids:S:ast',
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
            v: 'v:c:shape:ids:M:ast',
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
            v: 'v:c:shape:ids:L:ast',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:shape:ids:S:has-operator',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:shape:ids:S:has-component',
            o: "NN"
          },
          {
            rank: 2,
            s: "NN",
            v: 'v:c:shape:ids:S:components',
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
        debug('Ωjzrsdb__29', '_on_open_populate_jzr_datasource_formats');
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
        this.statements.insert_jzr_datasource_format.run({
          format: 'dsf:semicolons',
          comment: 'NN'
        });
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_datasources() {
        var dskey, formats, paths;
        debug('Ωjzrsdb__30', '_on_open_populate_jzr_datasources');
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
        dskey = 'ds:ucd:ucd';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=14',
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
        debug('Ωjzrsdb__31', '_on_open_populate_jzr_mirror_lines');
        this.statements.populate_jzr_mirror_lines.run();
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_glyphranges() {
        debug('Ωjzrsdb__32', '_on_open_populate_jzr_glyphranges');
        this.statements.populate_jzr_glyphranges.run();
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_glyphs() {
        var cause, fields_rpr;
        debug('Ωjzrsdb__33', '_on_open_populate_jzr_glyphs');
        try {
          this.statements.populate_jzr_glyphs.run();
        } catch (error1) {
          cause = error1;
          fields_rpr = rpr(this.state.most_recent_inserted_row);
          throw new Error(`Ωjzrsdb__34 when trying to insert this row: ${fields_rpr}, an error was thrown: ${cause.message}`, {cause});
        }
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      trigger_on_before_insert(name, ...fields) {
        // debug 'Ωjzrsdb__35', { name, fields, }
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
            ref: 'Ωjzrsdb__36',
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
          v: 'v:c:shape:ids:S:ast',
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
          v: 'v:c:shape:ids:S:components',
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
            v: 'v:c:shape:ids:S:has-operator',
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
            v: 'v:c:shape:ids:S:has-component',
            o: component
          });
        }
        if (typeof (base = this.state).timeit_progress === "function") {
          base.timeit_progress();
        }
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      * triples_from_ucd_ucd(rowid_in, dskey, [_, s, entry]) {
        return null;
        // ref       = rowid_in
        // v         = 'v:c:reading:ko-Hang'
        // for reading from @host.language_services.extract_hg_readings entry
        //   yield { rowid_out: @next_triple_rowid, ref, s, v, o: reading, }
        // @state.timeit_progress?()
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
constraint "Ωconstraint___4" check ( urn regexp '^[\\-\\+\\.:a-zA-Z0-9]+$' ) )
;`,
      //.......................................................................................................
      SQL`create table jzr_glyphranges (
  rowid     text    unique  not null generated always as ( 't:uc:rsg:V=' || rsg ),
  rsg       text    unique  not null,
  is_cjk    boolean         not null,
  lo        integer         not null,
  hi        integer         not null,
  -- lo_glyph  text            not null generated always as ( jzr_chr_from_cid( lo ) ) stored,
  -- hi_glyph  text            not null generated always as ( jzr_chr_from_cid( hi ) ) stored,
  name      text            not null,
-- primary key ( rowid ),
constraint "Ωconstraint___5" check ( lo between 0x000000 and 0x10ffff ),
constraint "Ωconstraint___6" check ( hi between 0x000000 and 0x10ffff ),
constraint "Ωconstraint___7" check ( lo <= hi ),
constraint "Ωconstraint___8" check ( rowid regexp '^.*$' )
);`,
      //.......................................................................................................
      SQL`create table jzr_glyphs (
    cid     integer unique  not null,
    rsg     text            not null,
    cid_hex text    unique  not null generated always as ( jzr_as_hex( cid ) ) stored,
    glyph   text    unique  not null,
    is_cjk  boolean         not null, -- generated always as ( jzr_is_cjk_glyph( glyph ) ) stored,
  primary key ( cid ),
  constraint "Ωconstraint___9" foreign key ( rsg ) references jzr_glyphranges ( rsg )
);`,
      //.......................................................................................................
      SQL`create trigger jzr_glyphs_insert
before insert on jzr_glyphs
for each row begin
  select jzr_trigger_on_before_insert( 'jzr_glyphs',
    'cid:', new.cid, 'rsg:', new.rsg );
  end;`,
      // #.......................................................................................................
      // SQL"""create view jzr_cjk_glyphranges as
      //   select
      //       *
      //     from jzr_glyphranges
      //     where is_cjk
      //     order by lo;"""

      // #.......................................................................................................
      // SQL"""create view jzr_cjk_glyphs as
      //   select
      //       gr.rsg    as rsg,
      //       gs.value  as cid,
      //       jzr_chr_from_cid( gs.value )  as glyph
      //     from jzr_cjk_glyphranges                    as gr
      //     join std_generate_series( gr.lo, gr.hi, 1 ) as gs
      //     ;"""

      //.......................................................................................................
      SQL`create table jzr_glyphsets (
  rowid       text    unique  not null,
  name        text            not null,
  glyphrange  text            not null,
primary key ( rowid ),
constraint "Ωconstraint__10" foreign key ( glyphrange ) references jzr_glyphranges ( rowid ),
constraint "Ωconstraint__11" check ( rowid regexp '^.*$' )
);`,
      //.......................................................................................................
      SQL`create view _jzr_ucd_ucd_range_entries as
with slo as ( select
    jfields->>0 as lo_cid_hex,
    jfields->>1 as lo_label
  from jzr_mirror_lines
  where true
    and ( dskey = 'ds:ucd:ucd' )
    and (
      ( jfields->>1 = '<Private Use, First>' )
      or ( jfields->>1 regexp '<[^>]+ First>'
        and ( jfields->>2 = 'Lo' ) ) ) ),
shi as ( select
    jfields->>0 as hi_cid_hex,
    jfields->>1 as hi_label
  from jzr_mirror_lines
  where true
    and ( dskey = 'ds:ucd:ucd' )
    and (
      ( jfields->>1 = '<Private Use, Last>' )
      or ( jfields->>1 regexp '<[^>]+ Last>'
        and ( jfields->>2 = 'Lo' ) ) ) )
select
    jzr_integer_from_hex( slo.lo_cid_hex )  as lo,
    jzr_integer_from_hex( shi.hi_cid_hex )  as hi,
    slo.lo_label                            as lo_label,
    shi.hi_label                            as hi_label
  from slo
  -- left join shi on ( shi.hi_label = substring( slo.lo_label, 1, length( slo.lo_label ) - 6 ) || 'Last>' )
  left join shi on ( shi.hi_label = replace( slo.lo_label, ' First>', ' Last>' ) )
  ;`,
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
constraint "Ωconstraint__12" foreign key ( format ) references jzr_datasource_formats ( format )
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
constraint "Ωconstraint__13" check ( lcode regexp '^[a-zA-Z]+[a-zA-Z0-9]*$' ),
constraint "Ωconstraint__14" check ( rowid = 't:mr:lc:V=' || lcode ) );`,
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
constraint "Ωconstraint__15" foreign key ( lcode ) references jzr_mirror_lcodes ( lcode ) );`,
      //.......................................................................................................
      SQL`create table jzr_mirror_verbs (
  rank      integer         not null default 1,
  s         text            not null,
  v         text    unique  not null,
  o         text            not null,
primary key ( v ),
-- check ( rowid regexp '^t:mr:vb:V=[\\-:\\+\\p{L}]+$' ),
constraint "Ωconstraint__16" check ( rank > 0 ) );`,
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
constraint "Ωconstraint__17" check ( rowid regexp '^t:mr:3pl:R=\\d+$' ),
-- unique ( ref, s, v, o )
constraint "Ωconstraint__18" foreign key ( ref ) references jzr_mirror_lines ( rowid ),
constraint "Ωconstraint__19" foreign key ( v   ) references jzr_mirror_verbs ( v )
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
constraint "Ωconstraint__20" check ( rowid regexp '^t:lang:hang:syl:V=\\S+$' )
-- unique ( ref, s, v, o )
-- constraint "Ωconstraint__21" foreign key ( ref ) references jzr_mirror_lines ( rowid )
-- constraint "Ωconstraint__22" foreign key ( syllable_hang ) references jzr_mirror_triples_base ( o ) )
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
constraint "Ωconstraint__23" foreign key ( ref ) references jzr_mirror_triples_base ( rowid ),
constraint "Ωconstraint__24" check ( ( length( glyph     ) = 1 ) or ( glyph      regexp '^&[\\-a-z0-9_]+#[0-9a-f]{4,6};$' ) ),
constraint "Ωconstraint__25" check ( ( length( component ) = 1 ) or ( component  regexp '^&[\\-a-z0-9_]+#[0-9a-f]{4,6};$' ) ),
constraint "Ωconstraint__26" check ( rowid regexp '^.*$' )
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
      and ( ml.jfields->>0 not regexp '^@glyphs' )
      and ( ml.dskey = $dskey )
      and ( ml.jfields->>2 regexp $v_re )
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
      populate_jzr_glyphranges: SQL`insert into jzr_glyphranges ( rsg, is_cjk, lo, hi, name )
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
;`,
      //.......................................................................................................
      populate_jzr_glyphs: SQL`insert into jzr_glyphs ( cid, glyph, rsg, is_cjk )
select
    cg.cid    as cid,
    cg.glyph  as glyph,
    gr.rsg    as rsg,
    gr.is_cjk as is_cjk
  from jzr_glyphranges                                  as gr
  join jzr_generate_cids_and_glyphs( gr.lo, gr.hi )     as cg
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
      },
      //-------------------------------------------------------------------------------------------------------
      jzr_chr_from_cid: {
        deterministic: true,
        call: function(cid) {
          return glyph_converter.glyph_from_cid(cid);
        }
      },
      //-------------------------------------------------------------------------------------------------------
      jzr_as_hex: {
        deterministic: true,
        call: function(cid) {
          return `0x${(cid.toString(16)).padStart(4, 0)}`;
        }
      },
      //-------------------------------------------------------------------------------------------------------
      jzr_integer_from_hex: {
        deterministic: true,
        call: function(cid_hex) {
          return parseInt(cid_hex, 16);
        }
      }
    };

    // #-------------------------------------------------------------------------------------------------------
    // jzr_is_cjk_glyph:
    //   deterministic:  true
    //   call: ( cid ) -> "0x#{( cid.toString 16 ).padStart 4, 0}"

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
              break;
            case 'ds:ucd:ucd':
              yield* this.triples_from_ucd_ucd(rowid_in, dskey, fields);
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
      },
      //-------------------------------------------------------------------------------------------------------
      jzr_generate_cids_and_glyphs: {
        deterministic: true,
        parameters: ['lo', 'hi'],
        columns: ['cid', 'glyph'],
        rows: function*(lo, hi) {
          yield* glyph_converter.generate_cids_and_glyphs(lo, hi);
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
      debug('Ωjzrsdb__37', "Datasource_field_parser::walk:", {
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
      message = `Ωjzrsdb__38 no parser found for format ${rpr(this.format)}`;
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
    * _walk_fields_with_separator({comment_re = /^\s*#/v, splitter = '\t'}) {
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
          case comment_re.test(line):
            lcode = 'C';
            break;
          default:
            lcode = 'D';
            jfields = JSON.stringify(line.split(splitter));
        }
        yield ({line_nr, lcode, line, jfields});
      }
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    * walk_dsf_tsv() {
      yield* this._walk_fields_with_separator({
        splitter: '\t'
      });
      return null;
    }

    //---------------------------------------------------------------------------------------------------------
    * walk_dsf_semicolons() {
      yield* this._walk_fields_with_separator({
        splitter: ';'
      });
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
        // debug 'Ωjzrsdb__39', jfields
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
            throw new Error(`Ωjzrsdb__40 expected 'true' or 'false', got ${rpr(is_cjk_txt)}`);
        }
      })();
      //.......................................................................................................
      if ((match = lo_hi_txt.match(lo_hi_re)) == null) {
        throw new Error(`Ωjzrsdb__41 expected a range literal like '0x01a6..0x10ff', got ${rpr(lo_hi_txt)}`);
      }
      lo = parseInt(match.groups.lo, 16);
      hi = parseInt(match.groups.hi, 16);
      //.......................................................................................................
      return {rsg, is_cjk, lo, hi, name};
    }

  };

  //===========================================================================================================
  glyph_converter = class glyph_converter {
    //---------------------------------------------------------------------------------------------------------
    static glyph_from_cid(cid) {
      var R;
      if (!(/^[\p{L}\p{S}\p{P}\p{M}\p{N}\p{Zs}\p{Co}]$/v.test(R = String.fromCodePoint(cid)))) {
        return null;
      }
      return R;
    }

    //---------------------------------------------------------------------------------------------------------
    static * generate_cids_and_glyphs(lo, hi) {
      var cid, glyph, i, ref1, ref2;
      for (cid = i = ref1 = lo, ref2 = hi; (ref1 <= ref2 ? i <= ref2 : i >= ref2); cid = ref1 <= ref2 ? ++i : --i) {
        if ((glyph = this.glyph_from_cid(cid)) == null) {
          continue;
        }
        yield ({cid, glyph});
      }
      return null;
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
      // debug 'Ωjzrsdb__42', @_TMP_hangeul.disassemble hangeul, { flatten: false, }
      return [...R];
    }

    //---------------------------------------------------------------------------------------------------------
    romanize_ja_kana(entry) {
      var cfg;
      cfg = {};
      return this._TMP_kana.toRomaji(entry, cfg);
    }

    // ### systematic name more like `..._ja_x_kan_latn()` ###
    // help 'Ωdjkr__43', toHiragana  'ラーメン',       { convertLongVowelMark: false, }
    // help 'Ωdjkr__44', toHiragana  'ラーメン',       { convertLongVowelMark: true, }
    // help 'Ωdjkr__45', toKana      'wanakana',   { customKanaMapping: { na: 'に', ka: 'Bana' }, }
    // help 'Ωdjkr__46', toKana      'wanakana',   { customKanaMapping: { waka: '(和歌)', wa: '(和2)', ka: '(歌2)', na: '(名)', ka: '(Bana)', naka: '(中)', }, }
    // help 'Ωdjkr__47', toRomaji    'つじぎり',     { customRomajiMapping: { じ: '(zi)', つ: '(tu)', り: '(li)', りょう: '(ryou)', りょ: '(ryo)' }, }

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
          throw new Error(`Ωjzrsdb__48 expected a text or a list, got a ${type}`);
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
      var cause, fields_rpr, i, len, parameter_sets, parameters, paths;
      ({paths} = get_paths_and_formats());
      this.paths = paths;
      this.language_services = new Language_services();
      this.dba = new Jzr_db_adapter(this.paths.db, {
        host: this
      });
      //.......................................................................................................
      parameter_sets = [
        {
          dskey: 'ds:dict:x:ko-Hang+Latn',
          v_re: '|'
        },
        {
          dskey: 'ds:dict:meanings',
          v_re: '^py:'
        },
        {
          dskey: 'ds:dict:meanings',
          v_re: '^ka:'
        },
        {
          dskey: 'ds:dict:meanings',
          v_re: '^hi:'
        },
        {
          dskey: 'ds:dict:meanings',
          v_re: '^hg:'
        },
        {
          dskey: 'ds:shape:idsv2',
          v_re: '|'
        },
        {
          dskey: 'ds:ucd:ucd',
          v_re: '|'
        }
      ];
      //.......................................................................................................
      if (this.dba.is_fresh) {
/* TAINT move to Jzr_db_adapter together with try/catch */
        for (i = 0, len = parameter_sets.length; i < len; i++) {
          parameters = parameter_sets[i];
          debug('Ωjzrsdb__49', 'populate_jzr_mirror_triples', parameters);
          try {
            this.dba.statements.populate_jzr_mirror_triples.run(parameters);
          } catch (error1) {
            cause = error1;
            fields_rpr = rpr(this.dba.state.most_recent_inserted_row);
            throw new Error(`Ωjzrsdb__50 when trying to insert this row: ${fields_rpr}, an error was thrown: ${cause.message}`, {cause});
          }
        }
        //.......................................................................................................
        /* TAINT move to Jzr_db_adapter together with try/catch */
        debug('Ωjzrsdb__51', 'populate_jzr_lang_hangeul_syllables');
        try {
          this.dba.statements.populate_jzr_lang_hangeul_syllables.run();
        } catch (error1) {
          cause = error1;
          fields_rpr = rpr(this.dba.state.most_recent_inserted_row);
          throw new Error(`Ωjzrsdb__52 when trying to insert this row: ${fields_rpr}, an error was thrown: ${cause.message}`, {cause});
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
        echo(grey('Ωjzrsdb__53'), gold(reverse(bold(query))));
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
        echo(grey('Ωjzrsdb__54'), gold(reverse(bold(query))));
        counts = (this.dba.prepare(query)).all();
        return console.table(counts);
      })();
      (() => {        //.......................................................................................................
        var count, counts, dskey, query;
        query = SQL`select dskey, count(*) as count from jzr_mirror_lines group by dskey union all
select '*',   count(*) as count from jzr_mirror_lines
order by count desc;`;
        echo(grey('Ωjzrsdb__55'), gold(reverse(bold(query))));
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
        echo('Ωjzrsdb__56', red(reverse(bold(" found some faults: "))));
        console.table(faulty_rows);
      } else {
        echo('Ωjzrsdb__57', lime(reverse(bold(" (no faults) "))));
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

  //===========================================================================================================
  if (module === require.main) {
    (() => {
      var jzr;
      jzr = new Jizura(); // triggers rebuild of DB when necessary
      return null;
    })();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsS0FBQSxFQUFBLHVCQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxFQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQSxjQUFBLEVBQUEsaUJBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLHdCQUFBLEVBQUEsS0FBQSxFQUFBLHVCQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUEscUJBQUEsRUFBQSxlQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEseUJBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUE7OztFQUdBLEdBQUEsR0FBNEIsT0FBQSxDQUFRLEtBQVI7O0VBQzVCLENBQUEsQ0FBRSxLQUFGLEVBQ0UsS0FERixFQUVFLElBRkYsRUFHRSxJQUhGLEVBSUUsS0FKRixFQUtFLE1BTEYsRUFNRSxJQU5GLEVBT0UsSUFQRixFQVFFLE9BUkYsQ0FBQSxHQVE0QixHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVIsQ0FBb0IsbUJBQXBCLENBUjVCOztFQVNBLENBQUEsQ0FBRSxHQUFGLEVBQ0UsT0FERixFQUVFLElBRkYsRUFHRSxLQUhGLEVBSUUsS0FKRixFQUtFLElBTEYsRUFN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QUFRLElBQUEsQ0FBSyxlQUFMLENBQVIsQ0FBTCxDQUFwQixFQUpGO09BQUo7O2FBTUs7SUFQbUI7O0VBbkZ4QixFQXozQ0E7OztFQXU5Q0EsTUFBTSxDQUFDLE9BQVAsR0FBb0IsQ0FBQSxDQUFBLENBQUEsR0FBQTtBQUNwQixRQUFBO0lBQUUsU0FBQSxHQUFZLENBQ1YsY0FEVSxFQUVWLHVCQUZVLEVBR1Ysd0JBSFUsRUFJVixpQkFKVSxFQUtWLHFCQUxVO0FBTVosV0FBTyxDQUNMLE1BREssRUFFTCxTQUZLO0VBUFcsQ0FBQSxJQXY5Q3BCOzs7RUFtK0NBLElBQUcsTUFBQSxLQUFVLE9BQU8sQ0FBQyxJQUFyQjtJQUFrQyxDQUFBLENBQUEsQ0FBQSxHQUFBO0FBQ2xDLFVBQUE7TUFBRSxHQUFBLEdBQU0sSUFBSSxNQUFKLENBQUEsRUFBUjthQUNHO0lBRitCLENBQUEsSUFBbEM7O0FBbitDQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCdcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5HVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xueyBhbGVydFxuICBkZWJ1Z1xuICBoZWxwXG4gIGluZm9cbiAgcGxhaW5cbiAgcHJhaXNlXG4gIHVyZ2VcbiAgd2FyblxuICB3aGlzcGVyIH0gICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ2ppenVyYS1zb3VyY2VzLWRiJ1xueyBycHJcbiAgaW5zcGVjdFxuICBlY2hvXG4gIHdoaXRlXG4gIGdyZWVuXG4gIGJsdWVcbiAgbGltZVxuICBnb2xkXG4gIGdyZXlcbiAgcmVkXG4gIGJvbGRcbiAgcmV2ZXJzZVxuICBsb2cgICAgIH0gICAgICAgICAgICAgICA9IEdVWS50cm1cbiMgeyBmIH0gICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9lZmZzdHJpbmcnXG4jIHdyaXRlICAgICAgICAgICAgICAgICAgICAgPSAoIHAgKSAtPiBwcm9jZXNzLnN0ZG91dC53cml0ZSBwXG4jIHsgbmZhIH0gICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvbm9ybWFsaXplLWZ1bmN0aW9uLWFyZ3VtZW50cydcbiMgR1RORyAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ndXktdGVzdC1ORydcbiMgeyBUZXN0ICAgICAgICAgICAgICAgICAgfSA9IEdUTkdcbkZTICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOmZzJ1xuUEFUSCAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6cGF0aCdcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQnNxbDMgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2JldHRlci1zcWxpdGUzJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5TRk1PRFVMRVMgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2JyaWNhYnJhYy1zZm1vZHVsZXMnXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgRGJyaWMsXG4gIERicmljX3N0ZCxcbiAgU1FMLFxuICBmcm9tX2Jvb2wsXG4gIGFzX2Jvb2wsICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZGJyaWMoKVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IGxldHMsXG4gIGZyZWV6ZSwgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfbGV0c2ZyZWV6ZXRoYXRfaW5mcmEoKS5zaW1wbGVcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBKZXRzdHJlYW0sXG4gIEFzeW5jX2pldHN0cmVhbSwgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfamV0c3RyZWFtKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBCZW5jaG1hcmtlciwgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2JlbmNobWFya2luZygpXG5iZW5jaG1hcmtlciAgICAgICAgICAgICAgICAgICA9IG5ldyBCZW5jaG1hcmtlcigpXG50aW1laXQgICAgICAgICAgICAgICAgICAgICAgICA9ICggUC4uLiApIC0+IGJlbmNobWFya2VyLnRpbWVpdCBQLi4uXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgc2V0X2dldHRlciwgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9tYW5hZ2VkX3Byb3BlcnR5X3Rvb2xzKClcbnsgSURMLCBJRExYLCAgICAgICAgICAgIH0gPSByZXF1aXJlICdtb2ppa3VyYS1pZGwnXG57IHR5cGVfb2YsICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfdHlwZV9vZigpXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5kZW1vX3NvdXJjZV9pZGVudGlmaWVycyA9IC0+XG4gIHsgZXhwYW5kX2RpY3Rpb25hcnksICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2RpY3Rpb25hcnlfdG9vbHMoKVxuICB7IGdldF9sb2NhbF9kZXN0aW5hdGlvbnMsIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9nZXRfbG9jYWxfZGVzdGluYXRpb25zKClcbiAgZm9yIGtleSwgdmFsdWUgb2YgZ2V0X2xvY2FsX2Rlc3RpbmF0aW9ucygpXG4gICAgZGVidWcgJ86panpyc2RiX19fMScsIGtleSwgdmFsdWVcbiAgIyBjYW4gYXBwZW5kIGxpbmUgbnVtYmVycyB0byBmaWxlcyBhcyBpbjpcbiAgIyAnZHM6ZGljdDptZWFuaW5ncy4xOkw9MTMzMzInXG4gICMgJ2RzOmRpY3Q6dWNkMTQwLjE6dWhkaWR4Okw9MTIzNCdcbiAgIyByb3dpZHM6ICd0OmpmbTpSPTEnXG4gICMge1xuICAjICAgJ2RzOmRpY3Q6bWVhbmluZ3MnOiAgICAgICAgICAnJGp6cmRzL21lYW5pbmcvbWVhbmluZ3MudHh0J1xuICAjICAgJ2RzOmRpY3Q6dWNkOnYxNC4wOnVoZGlkeCcgOiAnJGp6cmRzL3VuaWNvZGUub3JnLXVjZC12MTQuMC9VbmloYW5fRGljdGlvbmFyeUluZGljZXMudHh0J1xuICAjICAgfVxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMjI1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgLiAgIG9vb29cbiAgICAgICAgICAgICAgICAgICAgICAgLm84ICAgYDg4OFxub28ub29vb28uICAgLm9vb28uICAgLm84ODhvbyAgODg4IC5vby4gICAgLm9vb28ub1xuIDg4OCcgYDg4YiBgUCAgKTg4YiAgICA4ODggICAgODg4UFwiWTg4YiAgZDg4KCAgXCI4XG4gODg4ICAgODg4ICAub1BcIjg4OCAgICA4ODggICAgODg4ICAgODg4ICBgXCJZODhiLlxuIDg4OCAgIDg4OCBkOCggIDg4OCAgICA4ODggLiAgODg4ICAgODg4ICBvLiAgKTg4YlxuIDg4OGJvZDhQJyBgWTg4OFwiXCI4byAgIFwiODg4XCIgbzg4OG8gbzg4OG8gOFwiXCI4ODhQJ1xuIDg4OFxubzg4OG9cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmdldF9wYXRoc19hbmRfZm9ybWF0cyA9IC0+XG4gIHBhdGhzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0ge31cbiAgZm9ybWF0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSB7fVxuICBSICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IHsgcGF0aHMsIGZvcm1hdHMsIH1cbiAgcGF0aHMuYmFzZSAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4nXG4gIHBhdGhzLmp6ciAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5yZXNvbHZlIHBhdGhzLmJhc2UsICcuLidcbiAgcGF0aHMuZGIgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gcGF0aHMuYmFzZSwgJ2p6ci5kYidcbiAgIyBwYXRocy5kYiAgICAgICAgICAgICAgICAgICAgICAgICAgICA9ICcvZGV2L3NobS9qenIuZGInXG4gICMgcGF0aHMuanpyZHMgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gcGF0aHMuYmFzZSwgJ2p6cmRzJ1xuICBwYXRocy5qenJuZHMgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBwYXRocy5iYXNlLCAnaml6dXJhLW5ldy1kYXRhc291cmNlcydcbiAgcGF0aHMubW9qaWt1cmEgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gcGF0aHMuanpybmRzLCAnbW9qaWt1cmEnXG4gIHBhdGhzLnJhd19naXRodWIgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIHBhdGhzLmp6cm5kcywgJ2J2ZnMvb3JpZ2luL2h0dHBzL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20nXG4gIGthbmppdW0gICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIHBhdGhzLnJhd19naXRodWIsICdtaWZ1bmV0b3NoaXJvL2thbmppdW0vOGEwY2RhYTE2ZDY0YTI4MWEyMDQ4ZGUyZWVlMmVjNWUzYTQ0MGZhNidcbiAgcnV0b3BpbyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gcGF0aHMucmF3X2dpdGh1YiwgJ3J1dG9waW8vS29yZWFuLU5hbWUtSGFuamEtQ2hhcnNldC8xMmRmMWJhMWI0ZGZhYTA5NTgxM2U0ZGRmYmE0MjRlODE2Zjk0YzUzJ1xuICB1Y2QxNzAwICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBwYXRocy5qenJuZHMsICdidmZzL29yaWdpbi9odHRwcy93d3cudW5pY29kZS5vcmcvUHVibGljLzE3LjAuMC91Y2QnXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyBwYXRoc1sgJ2RzOmRpY3Q6dWNkOnYxNC4wOnVoZGlkeCcgICAgICBdICAgPSBQQVRILmpvaW4gcGF0aHMuanpybmRzLCAndW5pY29kZS5vcmctdWNkLXYxNC4wL1VuaWhhbl9EaWN0aW9uYXJ5SW5kaWNlcy50eHQnXG4gIHBhdGhzWyAnZHM6ZGljdDp4OmtvLUhhbmcrTGF0bicgICAgICAgICBdICA9IFBBVEguam9pbiBwYXRocy5qenJuZHMsICdoYW5nZXVsLXRyYW5zY3JpcHRpb25zLnRzdidcbiAgcGF0aHNbICdkczpkaWN0Ong6amEtS2FuK0xhdG4nICAgICAgICAgIF0gID0gUEFUSC5qb2luIHBhdGhzLmp6cm5kcywgJ2thbmEtdHJhbnNjcmlwdGlvbnMudHN2J1xuICBwYXRoc1sgJ2RzOmRpY3Q6YmNwNDcnICAgICAgICAgICAgICAgICAgXSAgPSBQQVRILmpvaW4gcGF0aHMuanpybmRzLCAnQkNQNDctbGFuZ3VhZ2Utc2NyaXB0cy1yZWdpb25zLnRzdidcbiAgcGF0aHNbICdkczpkaWN0OmphOmthbmppdW0nICAgICAgICAgICAgIF0gID0gUEFUSC5qb2luIGthbmppdW0sICdkYXRhL3NvdXJjZV9maWxlcy9rYW5qaWRpY3QudHh0J1xuICBwYXRoc1sgJ2RzOmRpY3Q6amE6a2Fuaml1bTphdXgnICAgICAgICAgXSAgPSBQQVRILmpvaW4ga2Fuaml1bSwgJ2RhdGEvc291cmNlX2ZpbGVzLzBfUkVBRE1FLnR4dCdcbiAgcGF0aHNbICdkczpkaWN0OmtvOlY9ZGF0YS1nb3YuY3N2JyAgICAgIF0gID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLWdvdi5jc3YnXG4gIHBhdGhzWyAnZHM6ZGljdDprbzpWPWRhdGEtZ292Lmpzb24nICAgICBdICA9IFBBVEguam9pbiBydXRvcGlvLCAnZGF0YS1nb3YuanNvbidcbiAgcGF0aHNbICdkczpkaWN0OmtvOlY9ZGF0YS1uYXZlci5jc3YnICAgIF0gID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLW5hdmVyLmNzdidcbiAgcGF0aHNbICdkczpkaWN0OmtvOlY9ZGF0YS1uYXZlci5qc29uJyAgIF0gID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLW5hdmVyLmpzb24nXG4gIHBhdGhzWyAnZHM6ZGljdDprbzpWPVJFQURNRS5tZCcgICAgICAgICBdICA9IFBBVEguam9pbiBydXRvcGlvLCAnUkVBRE1FLm1kJ1xuICBwYXRoc1sgJ2RzOmRpY3Q6bWVhbmluZ3MnICAgICAgICAgICAgICAgXSAgPSBQQVRILmpvaW4gcGF0aHMubW9qaWt1cmEsICdtZWFuaW5nL21lYW5pbmdzLnR4dCdcbiAgcGF0aHNbICdkczpzaGFwZTppZHN2MicgICAgICAgICAgICAgICAgIF0gID0gUEFUSC5qb2luIHBhdGhzLm1vamlrdXJhLCAnc2hhcGUvc2hhcGUtYnJlYWtkb3duLWZvcm11bGEtdjIudHh0J1xuICBwYXRoc1sgJ2RzOnNoYXBlOnpoejViZicgICAgICAgICAgICAgICAgXSAgPSBQQVRILmpvaW4gcGF0aHMubW9qaWt1cmEsICdzaGFwZS9zaGFwZS1zdHJva2VvcmRlci16aGF6aXd1YmlmYS50eHQnXG4gIHBhdGhzWyAnZHM6dWNkYjpyc2dzJyAgICAgICAgICAgICAgICAgICBdICA9IFBBVEguam9pbiBwYXRocy5tb2ppa3VyYSwgJ3VjZGIvY2ZnL3JzZ3MtYW5kLWJsb2Nrcy5tZCdcbiAgcGF0aHNbICdkczp1Y2Q6dWNkJyAgICAgICAgICAgICAgICAgICAgIF0gID0gUEFUSC5qb2luIHVjZDE3MDAsICdVbmljb2RlRGF0YS50eHQnXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyBmb3JtYXRzWyAnZHM6ZGljdDp1Y2Q6djE0LjA6dWhkaWR4JyAgICAgIF0gICA9ICwgJ3VuaWNvZGUub3JnLXVjZC12MTQuMC9VbmloYW5fRGljdGlvbmFyeUluZGljZXMudHh0J1xuICBmb3JtYXRzWyAnZHM6ZGljdDp4OmtvLUhhbmcrTGF0bicgICAgICAgICBdID0gJ2RzZjp0c3YnXG4gIGZvcm1hdHNbICdkczpkaWN0Ong6amEtS2FuK0xhdG4nICAgICAgICAgIF0gPSAnZHNmOnRzdidcbiAgZm9ybWF0c1sgJ2RzOmRpY3Q6YmNwNDcnICAgICAgICAgICAgICAgICAgXSA9ICdkc2Y6dHN2J1xuICBmb3JtYXRzWyAnZHM6ZGljdDpqYTprYW5qaXVtJyAgICAgICAgICAgICBdID0gJ2RzZjp0eHQnXG4gIGZvcm1hdHNbICdkczpkaWN0OmphOmthbmppdW06YXV4JyAgICAgICAgIF0gPSAnZHNmOnR4dCdcbiAgZm9ybWF0c1sgJ2RzOmRpY3Q6a286Vj1kYXRhLWdvdi5jc3YnICAgICAgXSA9ICdkc2Y6Y3N2J1xuICBmb3JtYXRzWyAnZHM6ZGljdDprbzpWPWRhdGEtZ292Lmpzb24nICAgICBdID0gJ2RzZjpqc29uJ1xuICBmb3JtYXRzWyAnZHM6ZGljdDprbzpWPWRhdGEtbmF2ZXIuY3N2JyAgICBdID0gJ2RzZjpjc3YnXG4gIGZvcm1hdHNbICdkczpkaWN0OmtvOlY9ZGF0YS1uYXZlci5qc29uJyAgIF0gPSAnZHNmOmpzb24nXG4gIGZvcm1hdHNbICdkczpkaWN0OmtvOlY9UkVBRE1FLm1kJyAgICAgICAgIF0gPSAnZHNmOm1kJ1xuICBmb3JtYXRzWyAnZHM6ZGljdDptZWFuaW5ncycgICAgICAgICAgICAgICBdID0gJ2RzZjp0c3YnXG4gIGZvcm1hdHNbICdkczpzaGFwZTppZHN2MicgICAgICAgICAgICAgICAgIF0gPSAnZHNmOnRzdidcbiAgZm9ybWF0c1sgJ2RzOnNoYXBlOnpoejViZicgICAgICAgICAgICAgICAgXSA9ICdkc2Y6dHN2J1xuICBmb3JtYXRzWyAnZHM6dWNkYjpyc2dzJyAgICAgICAgICAgICAgICAgICBdID0gJ2RzZjptZDp0YWJsZSdcbiAgZm9ybWF0c1sgJ2RzOnVjZDp1Y2QnICAgICAgICAgICAgICAgICAgICAgXSA9ICdkc2Y6c2VtaWNvbG9ucydcbiAgcmV0dXJuIFJcblxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgSnpyX2RiX2FkYXB0ZXIgZXh0ZW5kcyBEYnJpY19zdGRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBkYl9jbGFzczogIEJzcWwzXG4gIEBwcmVmaXg6ICAgICdqenInXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogKCBkYl9wYXRoLCBjZmcgPSB7fSApIC0+XG4gICAgIyMjIFRBSU5UIG5lZWQgbW9yZSBjbGFyaXR5IGFib3V0IHdoZW4gc3RhdGVtZW50cywgYnVpbGQsIGluaXRpYWxpemUuLi4gaXMgcGVyZm9ybWVkICMjI1xuICAgIHsgaG9zdCwgfSA9IGNmZ1xuICAgIGNmZyAgICAgICA9IGxldHMgY2ZnLCAoIGNmZyApIC0+IGRlbGV0ZSBjZmcuaG9zdFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc3VwZXIgZGJfcGF0aCwgY2ZnXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBAaG9zdCAgID0gaG9zdFxuICAgIEBzdGF0ZSAgPSB7IHRyaXBsZV9jb3VudDogMCwgbW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93OiBudWxsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRvID0+XG4gICAgICAjIyMgVEFJTlQgdGhpcyBpcyBub3Qgd2VsbCBwbGFjZWQgIyMjXG4gICAgICAjIyMgTk9URSBleGVjdXRlIGEgR2Fwcy1hbmQtSXNsYW5kcyBFU1NGUkkgdG8gaW1wcm92ZSBzdHJ1Y3R1cmFsIGludGVncml0eSBhc3N1cmFuY2U6ICMjI1xuICAgICAgIyAoIEBwcmVwYXJlIFNRTFwic2VsZWN0ICogZnJvbSBfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMgd2hlcmUgZmFsc2U7XCIgKS5nZXQoKVxuICAgICAgbWVzc2FnZXMgPSBbXVxuICAgICAgZm9yIHsgbmFtZSwgdHlwZSwgfSBmcm9tIEBzdGF0ZW1lbnRzLnN0ZF9nZXRfcmVsYXRpb25zLml0ZXJhdGUoKVxuICAgICAgICB0cnlcbiAgICAgICAgICAoIEBwcmVwYXJlIFNRTFwic2VsZWN0ICogZnJvbSAje25hbWV9IHdoZXJlIGZhbHNlO1wiICkuYWxsKClcbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICBtZXNzYWdlcy5wdXNoIFwiI3t0eXBlfSAje25hbWV9OiAje2Vycm9yLm1lc3NhZ2V9XCJcbiAgICAgICAgICB3YXJuICfOqWp6cnNkYl9fXzInLCBlcnJvci5tZXNzYWdlXG4gICAgICByZXR1cm4gbnVsbCBpZiBtZXNzYWdlcy5sZW5ndGggaXMgMFxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfX18zIEVGRlJJIHRlc3RpbmcgcmV2ZWFsZWQgZXJyb3JzOiAje3JwciBtZXNzYWdlc31cIlxuICAgICAgO251bGxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIEBpc19mcmVzaFxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlX2Zvcm1hdHMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlcygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl92ZXJicygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9sY29kZXMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGluZXMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9nbHlwaHJhbmdlcygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX2dseXBocygpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzZXRfZ2V0dGVyIEA6OiwgJ25leHRfdHJpcGxlX3Jvd2lkJywgLT4gXCJ0Om1yOjNwbDpSPSN7KytAc3RhdGUudHJpcGxlX2NvdW50fVwiXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAjIyNcblxuICAgLm84ICAgICAgICAgICAgICAgICAgICBvOG8gIG9vb28gICAgICAgIC5vOFxuICBcIjg4OCAgICAgICAgICAgICAgICAgICAgYFwiJyAgYDg4OCAgICAgICBcIjg4OFxuICAgODg4b29vby4gIG9vb28gIG9vb28gIG9vb28gICA4ODggICAub29vbzg4OFxuICAgZDg4JyBgODhiIGA4ODggIGA4ODggIGA4ODggICA4ODggIGQ4OCcgYDg4OFxuICAgODg4ICAgODg4ICA4ODggICA4ODggICA4ODggICA4ODggIDg4OCAgIDg4OFxuICAgODg4ICAgODg4ICA4ODggICA4ODggICA4ODggICA4ODggIDg4OCAgIDg4OFxuICAgYFk4Ym9kOFAnICBgVjg4VlwiVjhQJyBvODg4byBvODg4byBgWThib2Q4OFBcIlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBAYnVpbGQ6IFtcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl91cm5zIChcbiAgICAgICAgdXJuICAgICB0ZXh0ICAgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgY29tbWVudCB0ZXh0ICAgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggdXJuICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X19fNFwiIGNoZWNrICggdXJuIHJlZ2V4cCAnXltcXFxcLVxcXFwrXFxcXC46YS16QS1aMC05XSskJyApIClcbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9nbHlwaHJhbmdlcyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoICd0OnVjOnJzZzpWPScgfHwgcnNnICksXG4gICAgICAgIHJzZyAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGlzX2NqayAgICBib29sZWFuICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxvICAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGhpICAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIC0tIGxvX2dseXBoICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGp6cl9jaHJfZnJvbV9jaWQoIGxvICkgKSBzdG9yZWQsXG4gICAgICAgIC0tIGhpX2dseXBoICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGp6cl9jaHJfZnJvbV9jaWQoIGhpICkgKSBzdG9yZWQsXG4gICAgICAgIG5hbWUgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAtLSBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X19fNVwiIGNoZWNrICggbG8gYmV0d2VlbiAweDAwMDAwMCBhbmQgMHgxMGZmZmYgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfX182XCIgY2hlY2sgKCBoaSBiZXR3ZWVuIDB4MDAwMDAwIGFuZCAweDEwZmZmZiApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fXzdcIiBjaGVjayAoIGxvIDw9IGhpICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X19fOFwiIGNoZWNrICggcm93aWQgcmVnZXhwICdeLiokJyApXG4gICAgICApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2dseXBocyAoXG4gICAgICAgICAgY2lkICAgICBpbnRlZ2VyIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgICAgcnNnICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgICAgY2lkX2hleCB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGp6cl9hc19oZXgoIGNpZCApICkgc3RvcmVkLFxuICAgICAgICAgIGdseXBoICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICAgIGlzX2NqayAgYm9vbGVhbiAgICAgICAgIG5vdCBudWxsLCAtLSBnZW5lcmF0ZWQgYWx3YXlzIGFzICgganpyX2lzX2Nqa19nbHlwaCggZ2x5cGggKSApIHN0b3JlZCxcbiAgICAgICAgcHJpbWFyeSBrZXkgKCBjaWQgKSxcbiAgICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fXzlcIiBmb3JlaWduIGtleSAoIHJzZyApIHJlZmVyZW5jZXMganpyX2dseXBocmFuZ2VzICggcnNnIClcbiAgICAgICk7XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdHJpZ2dlciBqenJfZ2x5cGhzX2luc2VydFxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfZ2x5cGhzXG4gICAgICBmb3IgZWFjaCByb3cgYmVnaW5cbiAgICAgICAgc2VsZWN0IGp6cl90cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfZ2x5cGhzJyxcbiAgICAgICAgICAnY2lkOicsIG5ldy5jaWQsICdyc2c6JywgbmV3LnJzZyApO1xuICAgICAgICBlbmQ7XCJcIlwiXG5cbiAgICAjICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfY2prX2dseXBocmFuZ2VzIGFzXG4gICAgIyAgIHNlbGVjdFxuICAgICMgICAgICAgKlxuICAgICMgICAgIGZyb20ganpyX2dseXBocmFuZ2VzXG4gICAgIyAgICAgd2hlcmUgaXNfY2prXG4gICAgIyAgICAgb3JkZXIgYnkgbG87XCJcIlwiXG5cbiAgICAjICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfY2prX2dseXBocyBhc1xuICAgICMgICBzZWxlY3RcbiAgICAjICAgICAgIGdyLnJzZyAgICBhcyByc2csXG4gICAgIyAgICAgICBncy52YWx1ZSAgYXMgY2lkLFxuICAgICMgICAgICAganpyX2Nocl9mcm9tX2NpZCggZ3MudmFsdWUgKSAgYXMgZ2x5cGhcbiAgICAjICAgICBmcm9tIGp6cl9jamtfZ2x5cGhyYW5nZXMgICAgICAgICAgICAgICAgICAgIGFzIGdyXG4gICAgIyAgICAgam9pbiBzdGRfZ2VuZXJhdGVfc2VyaWVzKCBnci5sbywgZ3IuaGksIDEgKSBhcyBnc1xuICAgICMgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9nbHlwaHNldHMgKFxuICAgICAgICByb3dpZCAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIG5hbWUgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgZ2x5cGhyYW5nZSAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTBcIiBmb3JlaWduIGtleSAoIGdseXBocmFuZ2UgKSByZWZlcmVuY2VzIGp6cl9nbHlwaHJhbmdlcyAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18xMVwiIGNoZWNrICggcm93aWQgcmVnZXhwICdeLiokJyApXG4gICAgICApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBfanpyX3VjZF91Y2RfcmFuZ2VfZW50cmllcyBhc1xuICAgICAgd2l0aCBzbG8gYXMgKCBzZWxlY3RcbiAgICAgICAgICBqZmllbGRzLT4+MCBhcyBsb19jaWRfaGV4LFxuICAgICAgICAgIGpmaWVsZHMtPj4xIGFzIGxvX2xhYmVsXG4gICAgICAgIGZyb20ganpyX21pcnJvcl9saW5lc1xuICAgICAgICB3aGVyZSB0cnVlXG4gICAgICAgICAgYW5kICggZHNrZXkgPSAnZHM6dWNkOnVjZCcgKVxuICAgICAgICAgIGFuZCAoXG4gICAgICAgICAgICAoIGpmaWVsZHMtPj4xID0gJzxQcml2YXRlIFVzZSwgRmlyc3Q+JyApXG4gICAgICAgICAgICBvciAoIGpmaWVsZHMtPj4xIHJlZ2V4cCAnPFtePl0rIEZpcnN0PidcbiAgICAgICAgICAgICAgYW5kICggamZpZWxkcy0+PjIgPSAnTG8nICkgKSApICksXG4gICAgICBzaGkgYXMgKCBzZWxlY3RcbiAgICAgICAgICBqZmllbGRzLT4+MCBhcyBoaV9jaWRfaGV4LFxuICAgICAgICAgIGpmaWVsZHMtPj4xIGFzIGhpX2xhYmVsXG4gICAgICAgIGZyb20ganpyX21pcnJvcl9saW5lc1xuICAgICAgICB3aGVyZSB0cnVlXG4gICAgICAgICAgYW5kICggZHNrZXkgPSAnZHM6dWNkOnVjZCcgKVxuICAgICAgICAgIGFuZCAoXG4gICAgICAgICAgICAoIGpmaWVsZHMtPj4xID0gJzxQcml2YXRlIFVzZSwgTGFzdD4nIClcbiAgICAgICAgICAgIG9yICggamZpZWxkcy0+PjEgcmVnZXhwICc8W14+XSsgTGFzdD4nXG4gICAgICAgICAgICAgIGFuZCAoIGpmaWVsZHMtPj4yID0gJ0xvJyApICkgKSApXG4gICAgICBzZWxlY3RcbiAgICAgICAgICBqenJfaW50ZWdlcl9mcm9tX2hleCggc2xvLmxvX2NpZF9oZXggKSAgYXMgbG8sXG4gICAgICAgICAganpyX2ludGVnZXJfZnJvbV9oZXgoIHNoaS5oaV9jaWRfaGV4ICkgIGFzIGhpLFxuICAgICAgICAgIHNsby5sb19sYWJlbCAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBsb19sYWJlbCxcbiAgICAgICAgICBzaGkuaGlfbGFiZWwgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgaGlfbGFiZWxcbiAgICAgICAgZnJvbSBzbG9cbiAgICAgICAgLS0gbGVmdCBqb2luIHNoaSBvbiAoIHNoaS5oaV9sYWJlbCA9IHN1YnN0cmluZyggc2xvLmxvX2xhYmVsLCAxLCBsZW5ndGgoIHNsby5sb19sYWJlbCApIC0gNiApIHx8ICdMYXN0PicgKVxuICAgICAgICBsZWZ0IGpvaW4gc2hpIG9uICggc2hpLmhpX2xhYmVsID0gcmVwbGFjZSggc2xvLmxvX2xhYmVsLCAnIEZpcnN0PicsICcgTGFzdD4nICkgKVxuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfZGF0YXNvdXJjZV9mb3JtYXRzIChcbiAgICAgICAgZm9ybWF0ICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgY29tbWVudCAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggZm9ybWF0ICksXG4gICAgICBjaGVjayAoIGZvcm1hdCByZWdleHAgJ15kc2Y6W1xcXFwtXFxcXCtcXFxcLjphLXpBLVowLTldKyQnIClcbiAgICAgICk7XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdHJpZ2dlciBqenJfZGF0YXNvdXJjZV9mb3JtYXRzX2luc2VydFxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfZGF0YXNvdXJjZV9mb3JtYXRzXG4gICAgICBmb3IgZWFjaCByb3cgYmVnaW5cbiAgICAgICAgc2VsZWN0IGp6cl90cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfZGF0YXNvdXJjZV9mb3JtYXRzJyxcbiAgICAgICAgICAnZm9ybWF0OicsIG5ldy5mb3JtYXQsICdjb21tZW50OicsIG5ldy5jb21tZW50ICk7XG4gICAgICAgIGluc2VydCBpbnRvIGp6cl91cm5zICggdXJuLCBjb21tZW50ICkgdmFsdWVzICggbmV3LmZvcm1hdCwgbmV3LmNvbW1lbnQgKTtcbiAgICAgICAgZW5kO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2RhdGFzb3VyY2VzIChcbiAgICAgICAgZHNrZXkgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgZm9ybWF0ICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgcGF0aCAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggZHNrZXkgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzEyXCIgZm9yZWlnbiBrZXkgKCBmb3JtYXQgKSByZWZlcmVuY2VzIGp6cl9kYXRhc291cmNlX2Zvcm1hdHMgKCBmb3JtYXQgKVxuICAgICAgKTtcIlwiXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9kYXRhc291cmNlc19pbnNlcnRcbiAgICAgIGJlZm9yZSBpbnNlcnQgb24ganpyX2RhdGFzb3VyY2VzXG4gICAgICBmb3IgZWFjaCByb3cgYmVnaW5cbiAgICAgICAgc2VsZWN0IGp6cl90cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfZGF0YXNvdXJjZXMnLFxuICAgICAgICAgICdkc2tleTonLCBuZXcuZHNrZXksICdmb3JtYXQ6JywgbmV3LmZvcm1hdCwgJ3BhdGg6JywgbmV3LnBhdGggKTtcbiAgICAgICAgaW5zZXJ0IGludG8ganpyX3VybnMgKCB1cm4sIGNvbW1lbnQgKSB2YWx1ZXMgKCBuZXcuZHNrZXksICdmb3JtYXQ6ICcgfHwgbmV3LmZvcm1hdCB8fCAnLCBwYXRoOiAnIHx8IG5ldy5wYXRoICk7XG4gICAgICAgIGVuZDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfbGNvZGVzIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgbGNvZGUgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgY29tbWVudCAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzEzXCIgY2hlY2sgKCBsY29kZSByZWdleHAgJ15bYS16QS1aXStbYS16QS1aMC05XSokJyApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTRcIiBjaGVjayAoIHJvd2lkID0gJ3Q6bXI6bGM6Vj0nIHx8IGxjb2RlICkgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfbGluZXMgKFxuICAgICAgICAtLSAndDpqZm06J1xuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsIGdlbmVyYXRlZCBhbHdheXMgYXMgKCAndDptcjpsbjpkcz0nIHx8IGRza2V5IHx8ICc6TD0nIHx8IGxpbmVfbnIgKSBzdG9yZWQsXG4gICAgICAgIHJlZiAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoICAgICAgICAgICAgICAgICAgZHNrZXkgfHwgJzpMPScgfHwgbGluZV9uciApIHZpcnR1YWwsXG4gICAgICAgIGRza2V5ICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmVfbnIgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxjb2RlICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmUgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGpmaWVsZHMgICBqc29uICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAtLSBwcmltYXJ5IGtleSAoIHJvd2lkICksICAgICAgICAgICAgICAgICAgICAgICAgICAgLS0gIyMjIE5PVEUgRXhwZXJpbWVudGFsOiBubyBleHBsaWNpdCBQSywgaW5zdGVhZCBnZW5lcmF0ZWQgYHJvd2lkYCBjb2x1bW5cbiAgICAgIC0tIGNoZWNrICggcm93aWQgcmVnZXhwICdedDptcjpsbjpkcz0uKzpMPVxcXFxkKyQnKSwgIC0tICMjIyBOT1RFIG5vIG5lZWQgdG8gY2hlY2sgYXMgdmFsdWUgaXMgZ2VuZXJhdGVkICMjI1xuICAgICAgdW5pcXVlICggZHNrZXksIGxpbmVfbnIgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzE1XCIgZm9yZWlnbiBrZXkgKCBsY29kZSApIHJlZmVyZW5jZXMganpyX21pcnJvcl9sY29kZXMgKCBsY29kZSApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX3ZlcmJzIChcbiAgICAgICAgcmFuayAgICAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCBkZWZhdWx0IDEsXG4gICAgICAgIHMgICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHYgICAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIG8gICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHYgKSxcbiAgICAgIC0tIGNoZWNrICggcm93aWQgcmVnZXhwICdedDptcjp2YjpWPVtcXFxcLTpcXFxcK1xcXFxwe0x9XSskJyApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTZcIiBjaGVjayAoIHJhbmsgPiAwICkgKTtcIlwiXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9taXJyb3JfdmVyYnNfaW5zZXJ0XG4gICAgICBiZWZvcmUgaW5zZXJ0IG9uIGp6cl9taXJyb3JfdmVyYnNcbiAgICAgIGZvciBlYWNoIHJvdyBiZWdpblxuICAgICAgICBzZWxlY3QganpyX3RyaWdnZXJfb25fYmVmb3JlX2luc2VydCggJ2p6cl9taXJyb3JfdmVyYnMnLFxuICAgICAgICAgICdyYW5rOicsIG5ldy5yYW5rLCAnczonLCBuZXcucywgJ3Y6JywgbmV3LnYsICdvOicsIG5ldy5vICk7XG4gICAgICAgIGluc2VydCBpbnRvIGp6cl91cm5zICggdXJuLCBjb21tZW50ICkgdmFsdWVzICggbmV3LnYsICdzOiAnIHx8IG5ldy5zIHx8ICcsIG86ICcgfHwgbmV3Lm8gKTtcbiAgICAgICAgZW5kO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByZWYgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBzICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICB2ICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBvICAgICAgICAganNvbiAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTdcIiBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bXI6M3BsOlI9XFxcXGQrJCcgKSxcbiAgICAgIC0tIHVuaXF1ZSAoIHJlZiwgcywgdiwgbyApXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18xOFwiIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xpbmVzICggcm93aWQgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzE5XCIgZm9yZWlnbiBrZXkgKCB2ICAgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfdmVyYnMgKCB2IClcbiAgICAgICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9taXJyb3JfdHJpcGxlc19yZWdpc3RlclxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZVxuICAgICAgZm9yIGVhY2ggcm93IGJlZ2luXG4gICAgICAgIHNlbGVjdCBqenJfdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0KCAnanpyX21pcnJvcl90cmlwbGVzX2Jhc2UnLFxuICAgICAgICAgICdyb3dpZDonLCBuZXcucm93aWQsICdyZWY6JywgbmV3LnJlZiwgJ3M6JywgbmV3LnMsICd2OicsIG5ldy52LCAnbzonLCBuZXcubyApO1xuICAgICAgICBlbmQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyAoXG4gICAgICAgIHJvd2lkICAgICAgICAgICB0ZXh0ICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByZWYgICAgICAgICAgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgc3lsbGFibGVfaGFuZyAgIHRleHQgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHN5bGxhYmxlX2xhdG4gICB0ZXh0ICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggaW5pdGlhbF9sYXRuIHx8IG1lZGlhbF9sYXRuIHx8IGZpbmFsX2xhdG4gKSB2aXJ0dWFsLFxuICAgICAgICAtLSBzeWxsYWJsZV9sYXRuICAgdGV4dCAgdW5pcXVlICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggaW5pdGlhbF9sYXRuIHx8IG1lZGlhbF9sYXRuIHx8IGZpbmFsX2xhdG4gKSB2aXJ0dWFsLFxuICAgICAgICBpbml0aWFsX2hhbmcgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbWVkaWFsX2hhbmcgICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpbmFsX2hhbmcgICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBpbml0aWFsX2xhdG4gICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbWVkaWFsX2xhdG4gICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpbmFsX2xhdG4gICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjBcIiBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bGFuZzpoYW5nOnN5bDpWPVxcXFxTKyQnIClcbiAgICAgIC0tIHVuaXF1ZSAoIHJlZiwgcywgdiwgbyApXG4gICAgICAtLSBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18yMVwiIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xpbmVzICggcm93aWQgKVxuICAgICAgLS0gY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjJcIiBmb3JlaWduIGtleSAoIHN5bGxhYmxlX2hhbmcgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICggbyApIClcbiAgICAgICk7XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdHJpZ2dlciBqenJfbGFuZ19oYW5nX3N5bGxhYmxlc19yZWdpc3RlclxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfbGFuZ19oYW5nX3N5bGxhYmxlc1xuICAgICAgZm9yIGVhY2ggcm93IGJlZ2luXG4gICAgICAgIHNlbGVjdCBqenJfdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0KCAnanpyX2xhbmdfaGFuZ19zeWxsYWJsZXMnLFxuICAgICAgICAgIG5ldy5yb3dpZCwgbmV3LnJlZiwgbmV3LnN5bGxhYmxlX2hhbmcsIG5ldy5zeWxsYWJsZV9sYXRuLFxuICAgICAgICAgICAgbmV3LmluaXRpYWxfaGFuZywgbmV3Lm1lZGlhbF9oYW5nLCBuZXcuZmluYWxfaGFuZyxcbiAgICAgICAgICAgIG5ldy5pbml0aWFsX2xhdG4sIG5ldy5tZWRpYWxfbGF0biwgbmV3LmZpbmFsX2xhdG4gKTtcbiAgICAgICAgZW5kO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzIGFzXG4gICAgICBzZWxlY3QgbnVsbCBhcyByb3dpZCwgbnVsbCBhcyByZWYsIG51bGwgYXMgcywgbnVsbCBhcyB2LCBudWxsIGFzIG8gd2hlcmUgZmFsc2UgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAndjpjOnJlYWRpbmc6a28tTGF0bicsICAgICAgICAgIHN5bGxhYmxlX2xhdG4gICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICd2OmM6cmVhZGluZzprby1MYXRuOmluaXRpYWwnLCAgaW5pdGlhbF9sYXRuICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ3Y6YzpyZWFkaW5nOmtvLUxhdG46bWVkaWFsJywgICBtZWRpYWxfbGF0biAgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAndjpjOnJlYWRpbmc6a28tTGF0bjpmaW5hbCcsICAgIGZpbmFsX2xhdG4gICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICd2OmM6cmVhZGluZzprby1IYW5nOmluaXRpYWwnLCAgaW5pdGlhbF9oYW5nICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ3Y6YzpyZWFkaW5nOmtvLUhhbmc6bWVkaWFsJywgICBtZWRpYWxfaGFuZyAgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAndjpjOnJlYWRpbmc6a28tSGFuZzpmaW5hbCcsICAgIGZpbmFsX2hhbmcgICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2FsbF90cmlwbGVzIGFzXG4gICAgIyAgIHNlbGVjdCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyBzLCBudWxsIGFzIHYsIG51bGwgYXMgbyB3aGVyZSBmYWxzZSB1bmlvbiBhbGxcbiAgICAjICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyAgIHNlbGVjdCAqIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgdW5pb24gYWxsXG4gICAgIyAgIHNlbGVjdCAqIGZyb20ganpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlcyB1bmlvbiBhbGxcbiAgICAjICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyAgIHNlbGVjdCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsIHdoZXJlIGZhbHNlXG4gICAgIyAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyByYW5rLCBudWxsIGFzIHMsIG51bGwgYXMgdiwgbnVsbCBhcyBvIHdoZXJlIGZhbHNlXG4gICAgICAtLSAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHRiMS5yb3dpZCwgdGIxLnJlZiwgdmIxLnJhbmssIHRiMS5zLCB0YjEudiwgdGIxLm8gZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0YjFcbiAgICAgIGpvaW4ganpyX21pcnJvcl92ZXJicyBhcyB2YjEgdXNpbmcgKCB2IClcbiAgICAgIHdoZXJlIHZiMS52IGxpa2UgJ3Y6YzolJ1xuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCB0YjIucm93aWQsIHRiMi5yZWYsIHZiMi5yYW5rLCB0YjIucywga3Iudiwga3IubyBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHRiMlxuICAgICAgam9pbiBqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzIGFzIGtyIG9uICggdGIyLnYgPSAndjpjOnJlYWRpbmc6a28tSGFuZycgYW5kIHRiMi5vID0ga3IucyApXG4gICAgICBqb2luIGp6cl9taXJyb3JfdmVyYnMgYXMgdmIyIG9uICgga3IudiA9IHZiMi52IClcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgb3JkZXIgYnkgcywgdiwgb1xuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfdG9wX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdCAqIGZyb20ganpyX3RyaXBsZXNcbiAgICAgIHdoZXJlIHJhbmsgPSAxXG4gICAgICBvcmRlciBieSBzLCB2LCBvXG4gICAgICA7XCJcIlwiXG5cbiAgICAjICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgIyBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2Zvcm11bGFzIChcbiAgICAjICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICMgICAgIHJlZiAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgIyAgICAgZ2x5cGggICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAjICAgICBmb3JtdWxhICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuXG4gICAgIyAgICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfY29tcG9uZW50cyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHJlZiAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxldmVsICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxuciAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHJuciAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGdseXBoICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGNvbXBvbmVudCB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18yM1wiIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18yNFwiIGNoZWNrICggKCBsZW5ndGgoIGdseXBoICAgICApID0gMSApIG9yICggZ2x5cGggICAgICByZWdleHAgJ14mW1xcXFwtYS16MC05X10rI1swLTlhLWZdezQsNn07JCcgKSApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjVcIiBjaGVjayAoICggbGVuZ3RoKCBjb21wb25lbnQgKSA9IDEgKSBvciAoIGNvbXBvbmVudCAgcmVnZXhwICdeJltcXFxcLWEtejAtOV9dKyNbMC05YS1mXXs0LDZ9OyQnICkgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzI2XCIgY2hlY2sgKCByb3dpZCByZWdleHAgJ14uKiQnIClcbiAgICAgICk7XCJcIlwiXG5cblxuICAgICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgIyMjXG5cbiAgICAgIC5vICAubzg4by4gICAgICAgICAgICAgICAgICAgICAgIG9vb28gICAgICAuICAgICAgICAgICAgby5cbiAgICAgLjgnICA4ODggYFwiICAgICAgICAgICAgICAgICAgICAgICBgODg4ICAgIC5vOCAgICAgICAgICAgIGA4LlxuICAgIC44JyAgbzg4OG9vICAgLm9vb28uICAgb29vbyAgb29vbyAgIDg4OCAgLm84ODhvbyAgLm9vb28ubyAgYDguXG4gICAgODggICAgODg4ICAgIGBQICApODhiICBgODg4ICBgODg4ICAgODg4ICAgIDg4OCAgIGQ4OCggIFwiOCAgIDg4XG4gICAgODggICAgODg4ICAgICAub1BcIjg4OCAgIDg4OCAgIDg4OCAgIDg4OCAgICA4ODggICBgXCJZODhiLiAgICA4OFxuICAgIGA4LiAgIDg4OCAgICBkOCggIDg4OCAgIDg4OCAgIDg4OCAgIDg4OCAgICA4ODggLiBvLiAgKTg4YiAgLjgnXG4gICAgIGA4LiBvODg4byAgIGBZODg4XCJcIjhvICBgVjg4VlwiVjhQJyBvODg4byAgIFwiODg4XCIgOFwiXCI4ODhQJyAuOCdcbiAgICAgIGBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV91Y19ub3JtYWxpemF0aW9uX2ZhdWx0cyBhcyBzZWxlY3RcbiAgICAgICAgbWwucm93aWQgIGFzIHJvd2lkLFxuICAgICAgICBtbC5yZWYgICAgYXMgcmVmLFxuICAgICAgICBtbC5saW5lICAgYXMgbGluZVxuICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzIGFzIG1sXG4gICAgICB3aGVyZSB0cnVlXG4gICAgICAgIGFuZCAoIG5vdCBzdGRfaXNfdWNfbm9ybWFsKCBtbC5saW5lICkgKVxuICAgICAgb3JkZXIgYnkgbWwucm93aWQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV9rcl9yZWFkaW5nc191bmtub3duX3ZlcmJfZmF1bHRzIGFzIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIGNvdW50KCopIG92ZXIgKCBwYXJ0aXRpb24gYnkgdiApICAgIGFzIGNvdW50LFxuICAgICAgICAgICdqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzOlI9KicgIGFzIHJvd2lkLFxuICAgICAgICAgICcqJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAndW5rbm93bi12ZXJiJyAgICAgICAgICAgICAgICAgICAgICBhcyBkZXNjcmlwdGlvbixcbiAgICAgICAgICB2ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBxdW90ZVxuICAgICAgICBmcm9tIGp6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXMgYXMgbm5cbiAgICAgICAgd2hlcmUgbm90IGV4aXN0cyAoIHNlbGVjdCAxIGZyb20ganpyX21pcnJvcl92ZXJicyBhcyB2YiB3aGVyZSB2Yi52ID0gbm4udiApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBfanpyX21ldGFfZXJyb3JfdmVyYl9mYXVsdHMgYXMgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgY291bnQoKikgb3ZlciAoIHBhcnRpdGlvbiBieSB2ICkgICAgYXMgY291bnQsXG4gICAgICAgICAgJ2Vycm9yOlI9KicgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgICAgcm93aWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICdlcnJvci12ZXJiJyAgICAgICAgICAgICAgICAgICAgICAgIGFzIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICd2OicgfHwgdiB8fCAnLCBvOicgfHwgbyAgICAgICAgICAgIGFzIHF1b3RlXG4gICAgICAgIGZyb20ganpyX3RyaXBsZXMgYXMgbm5cbiAgICAgICAgd2hlcmUgdiBsaWtlICclOmVycm9yJztcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcgX2p6cl9tZXRhX21pcnJvcl9saW5lc193aGl0ZXNwYWNlX2ZhdWx0cyBhcyBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICAxICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBjb3VudCxcbiAgICAgICAgICAndDptcjpsbjpqZmllbGRzOndzOlI9KicgICAgICAgICAgICAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgICBtbC5yb3dpZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgJ2V4dHJhbmVvdXMtd2hpdGVzcGFjZScgICAgICAgICAgICAgICAgICAgICAgYXMgZGVzY3JpcHRpb24sXG4gICAgICAgICAgbWwuamZpZWxkcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcXVvdGVcbiAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzIGFzIG1sXG4gICAgICAgIHdoZXJlICgganpyX2hhc19wZXJpcGhlcmFsX3dzX2luX2pmaWVsZCggamZpZWxkcyApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV9taXJyb3JfbGluZXNfd2l0aF9lcnJvcnMgYXMgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgMSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgY291bnQsXG4gICAgICAgICAgJ3Q6bXI6bG46amZpZWxkczp3czpSPSonICAgICAgICAgICAgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgICAgbWwucm93aWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICdlcnJvcicgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGRlc2NyaXB0aW9uLFxuICAgICAgICAgIG1sLmxpbmUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHF1b3RlXG4gICAgICAgIGZyb20ganpyX21pcnJvcl9saW5lcyBhcyBtbFxuICAgICAgICB3aGVyZSAoIG1sLmxjb2RlID0gJ0UnICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9tZXRhX2ZhdWx0cyBhc1xuICAgICAgc2VsZWN0IG51bGwgYXMgY291bnQsIG51bGwgYXMgcm93aWQsIG51bGwgYXMgcmVmLCBudWxsIGFzIGRlc2NyaXB0aW9uLCBudWxsICBhcyBxdW90ZSB3aGVyZSBmYWxzZSB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IDEsIHJvd2lkLCByZWYsICAndWMtbm9ybWFsaXphdGlvbicsIGxpbmUgIGFzIHF1b3RlIGZyb20gX2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzICAgICAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX2tyX3JlYWRpbmdzX3Vua25vd25fdmVyYl9mYXVsdHMgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX2Vycm9yX3ZlcmJfZmF1bHRzICAgICAgICAgICAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX21pcnJvcl9saW5lc193aGl0ZXNwYWNlX2ZhdWx0cyAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX21pcnJvcl9saW5lc193aXRoX2Vycm9ycyAgICAgICAgIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9zeWxsYWJsZXMgYXMgc2VsZWN0XG4gICAgIyAgICAgICB0MS5zXG4gICAgIyAgICAgICB0MS52XG4gICAgIyAgICAgICB0MS5vXG4gICAgIyAgICAgICB0aS5zIGFzIGluaXRpYWxfaGFuZ1xuICAgICMgICAgICAgdG0ucyBhcyBtZWRpYWxfaGFuZ1xuICAgICMgICAgICAgdGYucyBhcyBmaW5hbF9oYW5nXG4gICAgIyAgICAgICB0aS5vIGFzIGluaXRpYWxfbGF0blxuICAgICMgICAgICAgdG0ubyBhcyBtZWRpYWxfbGF0blxuICAgICMgICAgICAgdGYubyBhcyBmaW5hbF9sYXRuXG4gICAgIyAgICAgZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0MVxuICAgICMgICAgIGpvaW5cbiAgICAjICAgICBqb2luIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHRpIG9uICggdDEuKVxuICAgICMgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMjIyBhZ2dyZWdhdGUgdGFibGUgZm9yIGFsbCByb3dpZHMgZ29lcyBoZXJlICMjI1xuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIyNcblxuICAgICAgICAgICAgICAgLiAgICAgICAgICAgICAgICAgLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAubzggICAgICAgICAgICAgICAubzggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm84XG4gICAub29vby5vIC5vODg4b28gIC5vb29vLiAgIC5vODg4b28gIC5vb29vby4gIG9vby4gLm9vLiAgLm9vLiAgICAub29vb28uICBvb28uIC5vby4gICAubzg4OG9vICAub29vby5vXG4gIGQ4OCggIFwiOCAgIDg4OCAgIGBQICApODhiICAgIDg4OCAgIGQ4OCcgYDg4YiBgODg4UFwiWTg4YlBcIlk4OGIgIGQ4OCcgYDg4YiBgODg4UFwiWTg4YiAgICA4ODggICBkODgoICBcIjhcbiAgYFwiWTg4Yi4gICAgODg4ICAgIC5vUFwiODg4ICAgIDg4OCAgIDg4OG9vbzg4OCAgODg4ICAgODg4ICAgODg4ICA4ODhvb284ODggIDg4OCAgIDg4OCAgICA4ODggICBgXCJZODhiLlxuICBvLiAgKTg4YiAgIDg4OCAuIGQ4KCAgODg4ICAgIDg4OCAuIDg4OCAgICAubyAgODg4ICAgODg4ICAgODg4ICA4ODggICAgLm8gIDg4OCAgIDg4OCAgICA4ODggLiBvLiAgKTg4YlxuICA4XCJcIjg4OFAnICAgXCI4ODhcIiBgWTg4OFwiXCI4byAgIFwiODg4XCIgYFk4Ym9kOFAnIG84ODhvIG84ODhvIG84ODhvIGBZOGJvZDhQJyBvODg4byBvODg4byAgIFwiODg4XCIgOFwiXCI4ODhQJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAc3RhdGVtZW50czpcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9nbHlwaHJhbmdlOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9nbHlwaHJhbmdlcyAoIHJzZywgaXNfY2prLCBsbywgaGksIG5hbWUgKSB2YWx1ZXMgKCAkcnNnLCAkaXNfY2prLCAkbG8sICRoaSwgJG5hbWUgKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIGRza2V5ICkgZG8gdXBkYXRlIHNldCBwYXRoID0gZXhjbHVkZWQucGF0aFxuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfZGF0YXNvdXJjZV9mb3JtYXQ6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX2RhdGFzb3VyY2VfZm9ybWF0cyAoIGZvcm1hdCwgY29tbWVudCApIHZhbHVlcyAoICRmb3JtYXQsICRjb21tZW50IClcbiAgICAgICAgLS0gb24gY29uZmxpY3QgKCBkc2tleSApIGRvIHVwZGF0ZSBzZXQgcGF0aCA9IGV4Y2x1ZGVkLnBhdGhcbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX2RhdGFzb3VyY2U6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX2RhdGFzb3VyY2VzICggZHNrZXksIGZvcm1hdCwgcGF0aCApIHZhbHVlcyAoICRkc2tleSwgJGZvcm1hdCwgJHBhdGggKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIGRza2V5ICkgZG8gdXBkYXRlIHNldCBwYXRoID0gZXhjbHVkZWQucGF0aFxuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfbWlycm9yX3ZlcmI6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl92ZXJicyAoIHJhbmssIHMsIHYsIG8gKSB2YWx1ZXMgKCAkcmFuaywgJHMsICR2LCAkbyApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcm93aWQgKSBkbyB1cGRhdGUgc2V0IHJhbmsgPSBleGNsdWRlZC5yYW5rLCBzID0gZXhjbHVkZWQucywgdiA9IGV4Y2x1ZGVkLnYsIG8gPSBleGNsdWRlZC5vXG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGU6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl9sY29kZXMgKCByb3dpZCwgbGNvZGUsIGNvbW1lbnQgKSB2YWx1ZXMgKCAkcm93aWQsICRsY29kZSwgJGNvbW1lbnQgKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIHJvd2lkICkgZG8gdXBkYXRlIHNldCBsY29kZSA9IGV4Y2x1ZGVkLmxjb2RlLCBjb21tZW50ID0gZXhjbHVkZWQuY29tbWVudFxuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfbWlycm9yX3RyaXBsZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoIHJvd2lkLCByZWYsIHMsIHYsIG8gKSB2YWx1ZXMgKCAkcm93aWQsICRyZWYsICRzLCAkdiwgJG8gKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIHJlZiwgcywgdiwgbyApIGRvIG5vdGhpbmdcbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfbGluZXMgKCBkc2tleSwgbGluZV9uciwgbGNvZGUsIGxpbmUsIGpmaWVsZHMgKVxuICAgICAgc2VsZWN0XG4gICAgICAgIC0tICd0Om1yOmxuOlI9JyB8fCByb3dfbnVtYmVyKCkgb3ZlciAoKSAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgLS0gZHMuZHNrZXkgfHwgJzpMPScgfHwgZmwubGluZV9uciAgIGFzIHJvd2lkLFxuICAgICAgICBkcy5kc2tleSAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZHNrZXksXG4gICAgICAgIGZsLmxpbmVfbnIgICAgICAgICAgICAgICAgICAgICAgICBhcyBsaW5lX25yLFxuICAgICAgICBmbC5sY29kZSAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbGNvZGUsXG4gICAgICAgIGZsLmxpbmUgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBsaW5lLFxuICAgICAgICBmbC5qZmllbGRzICAgICAgICAgICAgICAgICAgICAgICAgYXMgamZpZWxkc1xuICAgICAgZnJvbSBqenJfZGF0YXNvdXJjZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGRzXG4gICAgICBqb2luIGp6cl9kYXRhc291cmNlX2Zvcm1hdHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZGYgdXNpbmcgKCBmb3JtYXQgKVxuICAgICAgam9pbiBqenJfd2Fsa19maWxlX2xpbmVzKCBkcy5kc2tleSwgZGYuZm9ybWF0LCBkcy5wYXRoICkgIGFzIGZsXG4gICAgICB3aGVyZSB0cnVlXG4gICAgICAtLSBvbiBjb25mbGljdCAoIGRza2V5LCBsaW5lX25yICkgZG8gdXBkYXRlIHNldCBsaW5lID0gZXhjbHVkZWQubGluZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgKCByb3dpZCwgcmVmLCBzLCB2LCBvIClcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICBndC5yb3dpZF9vdXQgICAgYXMgcm93aWQsXG4gICAgICAgICAgICBndC5yZWYgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICAgZ3QucyAgICAgICAgICAgIGFzIHMsXG4gICAgICAgICAgICBndC52ICAgICAgICAgICAgYXMgdixcbiAgICAgICAgICAgIGd0Lm8gICAgICAgICAgICBhcyBvXG4gICAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBtbFxuICAgICAgICAgIGpvaW4ganpyX3dhbGtfdHJpcGxlcyggbWwucm93aWQsIG1sLmRza2V5LCBtbC5qZmllbGRzICkgYXMgZ3RcbiAgICAgICAgICB3aGVyZSB0cnVlXG4gICAgICAgICAgICBhbmQgKCBtbC5sY29kZSA9ICdEJyApXG4gICAgICAgICAgICAtLSBhbmQgKCBtbC5kc2tleSA9ICdkczpkaWN0Om1lYW5pbmdzJyApXG4gICAgICAgICAgICBhbmQgKCBtbC5qZmllbGRzIGlzIG5vdCBudWxsIClcbiAgICAgICAgICAgIGFuZCAoIG1sLmpmaWVsZHMtPj4wIG5vdCByZWdleHAgJ15AZ2x5cGhzJyApXG4gICAgICAgICAgICBhbmQgKCBtbC5kc2tleSA9ICRkc2tleSApXG4gICAgICAgICAgICBhbmQgKCBtbC5qZmllbGRzLT4+MiByZWdleHAgJHZfcmUgKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIHJlZiwgcywgdiwgbyApIGRvIG5vdGhpbmdcbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbGFuZ19oYW5nZXVsX3N5bGxhYmxlczogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyAoIHJvd2lkLCByZWYsXG4gICAgICAgIHN5bGxhYmxlX2hhbmcsIGluaXRpYWxfaGFuZywgbWVkaWFsX2hhbmcsIGZpbmFsX2hhbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsX2xhdG4sIG1lZGlhbF9sYXRuLCBmaW5hbF9sYXRuIClcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICAndDpsYW5nOmhhbmc6c3lsOlY9JyB8fCBtdC5vICAgICAgICAgIGFzIHJvd2lkLFxuICAgICAgICAgICAgbXQucm93aWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgICBtdC5vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHN5bGxhYmxlX2hhbmcsXG4gICAgICAgICAgICBkaC5pbml0aWFsICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGluaXRpYWxfaGFuZyxcbiAgICAgICAgICAgIGRoLm1lZGlhbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbWVkaWFsX2hhbmcsXG4gICAgICAgICAgICBkaC5maW5hbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGZpbmFsX2hhbmcsXG4gICAgICAgICAgICBjb2FsZXNjZSggbXRpLm8sICcnICkgICAgICAgICAgICAgICAgIGFzIGluaXRpYWxfbGF0bixcbiAgICAgICAgICAgIGNvYWxlc2NlKCBtdG0ubywgJycgKSAgICAgICAgICAgICAgICAgYXMgbWVkaWFsX2xhdG4sXG4gICAgICAgICAgICBjb2FsZXNjZSggbXRmLm8sICcnICkgICAgICAgICAgICAgICAgIGFzIGZpbmFsX2xhdG5cbiAgICAgICAgICBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICAgICAgICAgICAgICBhcyBtdFxuICAgICAgICAgIGxlZnQgam9pbiBqenJfZGlzYXNzZW1ibGVfaGFuZ2V1bCggbXQubyApIGFzIGRoXG4gICAgICAgICAgbGVmdCBqb2luIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIG10aSBvbiAoIG10aS5zID0gZGguaW5pdGlhbCBhbmQgbXRpLnYgPSAndjp4OmtvLUhhbmcrTGF0bjppbml0aWFsJyApXG4gICAgICAgICAgbGVmdCBqb2luIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIG10bSBvbiAoIG10bS5zID0gZGgubWVkaWFsICBhbmQgbXRtLnYgPSAndjp4OmtvLUhhbmcrTGF0bjptZWRpYWwnICApXG4gICAgICAgICAgbGVmdCBqb2luIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIG10ZiBvbiAoIG10Zi5zID0gZGguZmluYWwgICBhbmQgbXRmLnYgPSAndjp4OmtvLUhhbmcrTGF0bjpmaW5hbCcgICApXG4gICAgICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICAgICAgYW5kICggbXQudiA9ICd2OmM6cmVhZGluZzprby1IYW5nJyApXG4gICAgICAgICAgb3JkZXIgYnkgbXQub1xuICAgICAgICAtLSBvbiBjb25mbGljdCAoIHJvd2lkICAgICAgICAgKSBkbyBub3RoaW5nXG4gICAgICAgIC8qICMjIyBOT1RFIGBvbiBjb25mbGljdGAgbmVlZGVkIGJlY2F1c2Ugd2UgbG9nIGFsbCBhY3R1YWxseSBvY2N1cnJpbmcgcmVhZGluZ3Mgb2YgYWxsIGNoYXJhY3RlcnMgKi9cbiAgICAgICAgb24gY29uZmxpY3QgKCBzeWxsYWJsZV9oYW5nICkgZG8gbm90aGluZ1xuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9nbHlwaHJhbmdlczogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfZ2x5cGhyYW5nZXMgKCByc2csIGlzX2NqaywgbG8sIGhpLCBuYW1lIClcbiAgICAgIHNlbGVjdFxuICAgICAgICAtLSAndDptcjpsbjpSPScgfHwgcm93X251bWJlcigpIG92ZXIgKCkgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgIC0tIGRzLmRza2V5IHx8ICc6TD0nIHx8IGZsLmxpbmVfbnIgICBhcyByb3dpZCxcbiAgICAgICAgZ3IucnNnICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJzZyxcbiAgICAgICAgZ3IuaXNfY2prICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGlzX2NqayxcbiAgICAgICAgLS0gcmVmXG4gICAgICAgIGdyLmxvICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBsbyxcbiAgICAgICAgZ3IuaGkgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGhpLFxuICAgICAgICBnci5uYW1lICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbmFtZVxuICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbWxcbiAgICAgIGpvaW4ganpyX3BhcnNlX3VjZGJfcnNnc19nbHlwaHJhbmdlKCBtbC5kc2tleSwgbWwubGluZV9uciwgbWwuamZpZWxkcyApIGFzIGdyXG4gICAgICB3aGVyZSB0cnVlXG4gICAgICAgIGFuZCAoIG1sLmRza2V5ID0gJ2RzOnVjZGI6cnNncycgKVxuICAgICAgICBhbmQgKCBtbC5sY29kZSA9ICdEJyApXG4gICAgICBvcmRlciBieSBtbC5saW5lX25yXG4gICAgICAtLSBvbiBjb25mbGljdCAoIGRza2V5LCBsaW5lX25yICkgZG8gdXBkYXRlIHNldCBsaW5lID0gZXhjbHVkZWQubGluZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfZ2x5cGhzOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9nbHlwaHMgKCBjaWQsIGdseXBoLCByc2csIGlzX2NqayApXG4gICAgICBzZWxlY3RcbiAgICAgICAgICBjZy5jaWQgICAgYXMgY2lkLFxuICAgICAgICAgIGNnLmdseXBoICBhcyBnbHlwaCxcbiAgICAgICAgICBnci5yc2cgICAgYXMgcnNnLFxuICAgICAgICAgIGdyLmlzX2NqayBhcyBpc19jamtcbiAgICAgICAgZnJvbSBqenJfZ2x5cGhyYW5nZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZ3JcbiAgICAgICAgam9pbiBqenJfZ2VuZXJhdGVfY2lkc19hbmRfZ2x5cGhzKCBnci5sbywgZ3IuaGkgKSAgICAgYXMgY2dcbiAgICAgICAgO1wiXCJcIlxuXG5cblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICMjI1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb29vbyAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYDg4OCAgICAgICAgICAgICAgLm84XG4gIG9vLm9vb29vLiAgIC5vb29vby4gIG9vLm9vb29vLiAgb29vbyAgb29vbyAgIDg4OCAgIC5vb29vLiAgIC5vODg4b28gIC5vb29vby5cbiAgIDg4OCcgYDg4YiBkODgnIGA4OGIgIDg4OCcgYDg4YiBgODg4ICBgODg4ICAgODg4ICBgUCAgKTg4YiAgICA4ODggICBkODgnIGA4OGJcbiAgIDg4OCAgIDg4OCA4ODggICA4ODggIDg4OCAgIDg4OCAgODg4ICAgODg4ICAgODg4ICAgLm9QXCI4ODggICAgODg4ICAgODg4b29vODg4XG4gICA4ODggICA4ODggODg4ICAgODg4ICA4ODggICA4ODggIDg4OCAgIDg4OCAgIDg4OCAgZDgoICA4ODggICAgODg4IC4gODg4ICAgIC5vXG4gICA4ODhib2Q4UCcgYFk4Ym9kOFAnICA4ODhib2Q4UCcgIGBWODhWXCJWOFAnIG84ODhvIGBZODg4XCJcIjhvICAgXCI4ODhcIiBgWThib2Q4UCdcbiAgIDg4OCAgICAgICAgICAgICAgICAgIDg4OFxuICBvODg4byAgICAgICAgICAgICAgICBvODg4b1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xjb2RlczogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzI3JywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGNvZGVzJ1xuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPUInLCBsY29kZTogJ0InLCBjb21tZW50OiAnYmxhbmsgbGluZScsICAgIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl9sY29kZS5ydW4geyByb3dpZDogJ3Q6bXI6bGM6Vj1DJywgbGNvZGU6ICdDJywgY29tbWVudDogJ2NvbW1lbnQgbGluZScsICB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0Om1yOmxjOlY9RCcsIGxjb2RlOiAnRCcsIGNvbW1lbnQ6ICdkYXRhIGxpbmUnLCAgICAgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPUUnLCBsY29kZTogJ0UnLCBjb21tZW50OiAnZXJyb3InLCAgICAgICAgIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl9sY29kZS5ydW4geyByb3dpZDogJ3Q6bXI6bGM6Vj1VJywgbGNvZGU6ICdVJywgY29tbWVudDogJ3Vua25vd24nLCAgICAgICB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdmVyYnM6IC0+XG4gICAgIyMjIE5PVEVcbiAgICBpbiB2ZXJicywgaW5pdGlhbCBjb21wb25lbnQgaW5kaWNhdGVzIHR5cGUgb2Ygc3ViamVjdDpcbiAgICAgIGB2OmM6YCBpcyBmb3Igc3ViamVjdHMgdGhhdCBhcmUgQ0pLIGNoYXJhY3RlcnNcbiAgICAgIGB2Ong6YCBpcyB1c2VkIGZvciB1bmNsYXNzaWZpZWQgc3ViamVjdHMgKHBvc3NpYmx5IHRvIGJlIHJlZmluZWQgaW4gdGhlIGZ1dHVyZSlcbiAgICAjIyNcbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzI4JywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdmVyYnMnXG4gICAgcm93cyA9IFtcbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjp0ZXN0aW5nOnVudXNlZCcsICAgICAgICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2Ong6a28tSGFuZytMYXRuOmluaXRpYWwnLCAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6eDprby1IYW5nK0xhdG46bWVkaWFsJywgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjp4OmtvLUhhbmcrTGF0bjpmaW5hbCcsICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzp6aC1MYXRuLXBpbnlpbicsICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmphLXgtS2FuJywgICAgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6amEteC1IaXInLCAgICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzpqYS14LUthdCcsICAgICAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmphLXgtTGF0bicsICAgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6amEteC1IaXIrTGF0bicsICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzpqYS14LUthdCtMYXRuJywgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmtvLUhhbmcnLCAgICAgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6a28tTGF0bicsICAgICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzprby1IYW5nOmluaXRpYWwnLCAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmtvLUhhbmc6bWVkaWFsJywgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6a28tSGFuZzpmaW5hbCcsICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzprby1MYXRuOmluaXRpYWwnLCAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmtvLUxhdG46bWVkaWFsJywgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6a28tTGF0bjpmaW5hbCcsICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6c2hhcGU6aWRzOmVycm9yJywgICAgICAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpzaGFwZTppZHM6Uzpmb3JtdWxhJywgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnNoYXBlOmlkczpTOmFzdCcsICAgICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6c2hhcGU6aWRzOk06Zm9ybXVsYScsICAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpzaGFwZTppZHM6TTphc3QnLCAgICAgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnNoYXBlOmlkczpMOmZvcm11bGEnLCAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6c2hhcGU6aWRzOkw6YXN0JywgICAgICAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpzaGFwZTppZHM6UzpoYXMtb3BlcmF0b3InLCAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnNoYXBlOmlkczpTOmhhcy1jb21wb25lbnQnLCAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6c2hhcGU6aWRzOlM6Y29tcG9uZW50cycsICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICBdXG4gICAgZm9yIHJvdyBpbiByb3dzXG4gICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl92ZXJiLnJ1biByb3dcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VfZm9ybWF0czogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzI5JywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlX2Zvcm1hdHMnXG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdkc2Y6dHN2JywgICAgICAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdkc2Y6bWQ6dGFibGUnLCAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdkc2Y6Y3N2JywgICAgICAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdkc2Y6anNvbicsICAgICAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdkc2Y6bWQnLCAgICAgICAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdkc2Y6dHh0JywgICAgICAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdkc2Y6c2VtaWNvbG9ucycsICBjb21tZW50OiAnTk4nLCB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlczogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzMwJywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlcydcbiAgICB7IHBhdGhzXG4gICAgICBmb3JtYXRzLCB9ID0gZ2V0X3BhdGhzX2FuZF9mb3JtYXRzKClcbiAgICAjIGRza2V5ID0gJ2RzOmRpY3Q6dWNkOnYxNC4wOnVoZGlkeCc7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MicsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6ZGljdDptZWFuaW5ncyc7ICAgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MScsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6ZGljdDp4OmtvLUhhbmcrTGF0bic7ICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MicsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6ZGljdDp4OmphLUthbitMYXRuJzsgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MycsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkczpkaWN0OmphOmthbmppdW0nOyAgICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj00JywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICAjIGRza2V5ID0gJ2RzOmRpY3Q6amE6a2Fuaml1bTphdXgnOyAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTUnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZHM6ZGljdDprbzpWPWRhdGEtZ292LmNzdic7ICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9NicsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkczpkaWN0OmtvOlY9ZGF0YS1nb3YuanNvbic7ICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj03JywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICAjIGRza2V5ID0gJ2RzOmRpY3Q6a286Vj1kYXRhLW5hdmVyLmNzdic7ICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTgnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZHM6ZGljdDprbzpWPWRhdGEtbmF2ZXIuanNvbic7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9OScsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkczpkaWN0OmtvOlY9UkVBRE1FLm1kJzsgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xMCcsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6c2hhcGU6aWRzdjInOyAgICAgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MTEnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIGRza2V5ID0gJ2RzOnNoYXBlOnpoejViZic7ICAgICAgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEyJywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkczp1Y2RiOnJzZ3MnOyAgICAgICAgICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xMycsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6dWNkOnVjZCc7ICAgICAgICAgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MTQnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIDtudWxsXG5cbiAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgX29uX29wZW5fcG9wdWxhdGVfdmVyYnM6IC0+XG4gICMgICBwYXRocyA9IGdldF9wYXRoc19hbmRfZm9ybWF0cygpXG4gICMgICBkc2tleSA9ICdkczpkaWN0Om1lYW5pbmdzJzsgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEnLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgIyAgIGRza2V5ID0gJ2RzOmRpY3Q6dWNkOnYxNC4wOnVoZGlkeCc7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MicsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAjICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGluZXM6IC0+XG4gICAgZGVidWcgJ86panpyc2RiX18zMScsICdfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzJ1xuICAgIEBzdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9taXJyb3JfbGluZXMucnVuKClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX2dseXBocmFuZ2VzOiAtPlxuICAgIGRlYnVnICfOqWp6cnNkYl9fMzInLCAnX29uX29wZW5fcG9wdWxhdGVfanpyX2dseXBocmFuZ2VzJ1xuICAgIEBzdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9nbHlwaHJhbmdlcy5ydW4oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZ2x5cGhzOiAtPlxuICAgIGRlYnVnICfOqWp6cnNkYl9fMzMnLCAnX29uX29wZW5fcG9wdWxhdGVfanpyX2dseXBocydcbiAgICB0cnlcbiAgICAgIEBzdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9nbHlwaHMucnVuKClcbiAgICBjYXRjaCBjYXVzZVxuICAgICAgZmllbGRzX3JwciA9IHJwciBAc3RhdGUubW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fMzQgd2hlbiB0cnlpbmcgdG8gaW5zZXJ0IHRoaXMgcm93OiAje2ZpZWxkc19ycHJ9LCBhbiBlcnJvciB3YXMgdGhyb3duOiAje2NhdXNlLm1lc3NhZ2V9XCIsIFxcXG4gICAgICAgIHsgY2F1c2UsIH1cbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0OiAoIG5hbWUsIGZpZWxkcy4uLiApIC0+XG4gICAgIyBkZWJ1ZyAnzqlqenJzZGJfXzM1JywgeyBuYW1lLCBmaWVsZHMsIH1cbiAgICBAc3RhdGUubW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93ID0geyBuYW1lLCBmaWVsZHMsIH1cbiAgICA7bnVsbFxuXG4gICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIyMjXG5cbiAgb29vb28gICAgIG9vbyBvb29vb29vb29vLiAgIG9vb29vb29vb29vb1xuICBgODg4JyAgICAgYDgnIGA4ODgnICAgYFk4YiAgYDg4OCcgICAgIGA4XG4gICA4ODggICAgICAgOCAgIDg4OCAgICAgIDg4OCAgODg4ICAgICAgICAgIC5vb29vLm9cbiAgIDg4OCAgICAgICA4ICAgODg4ICAgICAgODg4ICA4ODhvb29vOCAgICBkODgoICBcIjhcbiAgIDg4OCAgICAgICA4ICAgODg4ICAgICAgODg4ICA4ODggICAgXCIgICAgYFwiWTg4Yi5cbiAgIGA4OC4gICAgLjgnICAgODg4ICAgICBkODgnICA4ODggICAgICAgICBvLiAgKTg4YlxuICAgICBgWWJvZFAnICAgIG84ODhib29kOFAnICAgbzg4OG8gICAgICAgIDhcIlwiODg4UCdcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgQGZ1bmN0aW9uczpcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAganpyX3RyaWdnZXJfb25fYmVmb3JlX2luc2VydDpcbiAgICAgICMjIyBOT1RFIGluIHRoZSBmdXR1cmUgdGhpcyBmdW5jdGlvbiBjb3VsZCB0cmlnZ2VyIGNyZWF0aW9uIG9mIHRyaWdnZXJzIG9uIGluc2VydHMgIyMjXG4gICAgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICAgdmFyYXJnczogICAgICAgIHRydWVcbiAgICAgIGNhbGw6ICggbmFtZSwgZmllbGRzLi4uICkgLT4gQHRyaWdnZXJfb25fYmVmb3JlX2luc2VydCBuYW1lLCBmaWVsZHMuLi5cblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyMjIE5PVEUgbW92ZWQgdG8gRGJyaWNfc3RkOyBjb25zaWRlciB0byBvdmVyd3JpdGUgd2l0aCB2ZXJzaW9uIHVzaW5nIGBzbGV2aXRoYW4vcmVnZXhgICMjI1xuICAgICMgcmVnZXhwOlxuICAgICMgICBvdmVyd3JpdGU6ICAgICAgdHJ1ZVxuICAgICMgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICMgICBjYWxsOiAoIHBhdHRlcm4sIHRleHQgKSAtPiBpZiAoICggbmV3IFJlZ0V4cCBwYXR0ZXJuLCAndicgKS50ZXN0IHRleHQgKSB0aGVuIDEgZWxzZSAwXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGp6cl9oYXNfcGVyaXBoZXJhbF93c19pbl9qZmllbGQ6XG4gICAgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICAgY2FsbDogKCBqZmllbGRzX2pzb24gKSAtPlxuICAgICAgICByZXR1cm4gZnJvbV9ib29sIGZhbHNlIHVubGVzcyAoIGpmaWVsZHMgPSBKU09OLnBhcnNlIGpmaWVsZHNfanNvbiApP1xuICAgICAgICByZXR1cm4gZnJvbV9ib29sIGZhbHNlIHVubGVzcyAoIHR5cGVfb2YgamZpZWxkcyApIGlzICdsaXN0J1xuICAgICAgICByZXR1cm4gZnJvbV9ib29sIGpmaWVsZHMuc29tZSAoIHZhbHVlICkgLT4gLyheXFxzKXwoXFxzJCkvLnRlc3QgdmFsdWVcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAganpyX2Nocl9mcm9tX2NpZDpcbiAgICAgIGRldGVybWluaXN0aWM6ICB0cnVlXG4gICAgICBjYWxsOiAoIGNpZCApIC0+IGdseXBoX2NvbnZlcnRlci5nbHlwaF9mcm9tX2NpZCBjaWRcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAganpyX2FzX2hleDpcbiAgICAgIGRldGVybWluaXN0aWM6ICB0cnVlXG4gICAgICBjYWxsOiAoIGNpZCApIC0+IFwiMHgjeyggY2lkLnRvU3RyaW5nIDE2ICkucGFkU3RhcnQgNCwgMH1cIlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBqenJfaW50ZWdlcl9mcm9tX2hleDpcbiAgICAgIGRldGVybWluaXN0aWM6ICB0cnVlXG4gICAgICBjYWxsOiAoIGNpZF9oZXggKSAtPiBwYXJzZUludCBjaWRfaGV4LCAxNlxuXG4gICAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMganpyX2lzX2Nqa19nbHlwaDpcbiAgICAjICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAjICAgY2FsbDogKCBjaWQgKSAtPiBcIjB4I3soIGNpZC50b1N0cmluZyAxNiApLnBhZFN0YXJ0IDQsIDB9XCJcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIEB0YWJsZV9mdW5jdGlvbnM6XG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGp6cl9zcGxpdF93b3JkczpcbiAgICAgIGNvbHVtbnM6ICAgICAgWyAna2V5d29yZCcsIF1cbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAnbGluZScsIF1cbiAgICAgIHJvd3M6ICggbGluZSApIC0+XG4gICAgICAgIGtleXdvcmRzID0gbGluZS5zcGxpdCAvKD86XFxwe1p9Kyl8KCg/OlxccHtTY3JpcHQ9SGFufSl8KD86XFxwe0x9Kyl8KD86XFxwe059Kyl8KD86XFxwe1N9KykpL3ZcbiAgICAgICAgZm9yIGtleXdvcmQgaW4ga2V5d29yZHNcbiAgICAgICAgICBjb250aW51ZSB1bmxlc3Mga2V5d29yZD9cbiAgICAgICAgICBjb250aW51ZSBpZiBrZXl3b3JkIGlzICcnXG4gICAgICAgICAgeWllbGQgeyBrZXl3b3JkLCB9XG4gICAgICAgIDtudWxsXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGp6cl93YWxrX2ZpbGVfbGluZXM6XG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2xpbmVfbnInLCAnbGNvZGUnLCAnbGluZScsICdqZmllbGRzJyBdXG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ2Rza2V5JywgJ2Zvcm1hdCcsICdwYXRoJywgXVxuICAgICAgcm93czogKCBkc2tleSwgZm9ybWF0LCBwYXRoICkgLT5cbiAgICAgICAgeWllbGQgZnJvbSBuZXcgRGF0YXNvdXJjZV9maWVsZF9wYXJzZXIgeyBob3N0OiBAaG9zdCwgZHNrZXksIGZvcm1hdCwgcGF0aCwgfVxuICAgICAgICA7bnVsbFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBqenJfd2Fsa190cmlwbGVzOlxuICAgICAgcGFyYW1ldGVyczogICBbICdyb3dpZF9pbicsICdkc2tleScsICdqZmllbGRzJywgXVxuICAgICAgY29sdW1uczogICAgICBbICdyb3dpZF9vdXQnLCAncmVmJywgJ3MnLCAndicsICdvJywgXVxuICAgICAgcm93czogKCByb3dpZF9pbiwgZHNrZXksIGpmaWVsZHMgKSAtPlxuICAgICAgICBmaWVsZHMgID0gSlNPTi5wYXJzZSBqZmllbGRzXG4gICAgICAgIGVudHJ5ICAgPSBmaWVsZHNbIDIgXVxuICAgICAgICBzd2l0Y2ggZHNrZXlcbiAgICAgICAgICB3aGVuICdkczpkaWN0Ong6a28tSGFuZytMYXRuJyAgICAgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fZGljdF94X2tvX0hhbmdfTGF0biAgICAgICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAgIHdoZW4gJ2RzOmRpY3Q6bWVhbmluZ3MnIHRoZW4gc3dpdGNoIHRydWVcbiAgICAgICAgICAgIHdoZW4gKCBlbnRyeS5zdGFydHNXaXRoICdweTonICkgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX3poX0xhdG5fcGlueWluICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAgICAgd2hlbiAoIGVudHJ5LnN0YXJ0c1dpdGggJ2thOicgKSB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXNfZnJvbV9jX3JlYWRpbmdfamFfeF9LYW4gICAgICAgIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICAgICB3aGVuICggZW50cnkuc3RhcnRzV2l0aCAnaGk6JyApIHRoZW4geWllbGQgZnJvbSBAdHJpcGxlc19mcm9tX2NfcmVhZGluZ19qYV94X0thbiAgICAgICAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgICAgIHdoZW4gKCBlbnRyeS5zdGFydHNXaXRoICdoZzonICkgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX2tvX0hhbmcgICAgICAgICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAgIHdoZW4gJ2RzOnNoYXBlOmlkc3YyJyAgICAgICAgICAgICB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXNfZnJvbV9zaGFwZV9pZHN2MiAgICAgICAgICAgICAgIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICAgd2hlbiAnZHM6dWNkOnVjZCcgICAgICAgICAgICAgICAgIHRoZW4geWllbGQgZnJvbSBAdHJpcGxlc19mcm9tX3VjZF91Y2QgICAgICAgICAgICAgICAgICAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgO251bGxcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAganpyX2Rpc2Fzc2VtYmxlX2hhbmdldWw6XG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ2hhbmcnLCBdXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2luaXRpYWwnLCAnbWVkaWFsJywgJ2ZpbmFsJywgXVxuICAgICAgcm93czogKCBoYW5nICkgLT5cbiAgICAgICAgamFtb3MgPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5fVE1QX2hhbmdldWwuZGlzYXNzZW1ibGUgaGFuZywgeyBmbGF0dGVuOiBmYWxzZSwgfVxuICAgICAgICBmb3IgeyBmaXJzdDogaW5pdGlhbCwgdm93ZWw6IG1lZGlhbCwgbGFzdDogZmluYWwsIH0gaW4gamFtb3NcbiAgICAgICAgICB5aWVsZCB7IGluaXRpYWwsIG1lZGlhbCwgZmluYWwsIH1cbiAgICAgICAgO251bGxcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAganpyX3BhcnNlX3VjZGJfcnNnc19nbHlwaHJhbmdlOlxuICAgICAgcGFyYW1ldGVyczogICBbICdkc2tleScsICdsaW5lX25yJywgJ2pmaWVsZHMnLCBdXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ3JzZycsICdpc19jamsnLCAnbG8nLCAnaGknLCAnbmFtZScsIF1cbiAgICAgIHJvd3M6ICggZHNrZXksIGxpbmVfbnIsIGpmaWVsZHMgKSAtPlxuICAgICAgICB5aWVsZCBkYXRhc291cmNlX2Zvcm1hdF9wYXJzZXIucGFyc2VfdWNkYl9yc2dzX2dseXBocmFuZ2UgeyBkc2tleSwgbGluZV9uciwgamZpZWxkcywgfVxuICAgICAgICA7bnVsbFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBqenJfZ2VuZXJhdGVfY2lkc19hbmRfZ2x5cGhzOlxuICAgICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAnbG8nLCAnaGknLCBdXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2NpZCcsICdnbHlwaCcsIF1cbiAgICAgIHJvd3M6ICggbG8sIGhpICkgLT5cbiAgICAgICAgeWllbGQgZnJvbSBnbHlwaF9jb252ZXJ0ZXIuZ2VuZXJhdGVfY2lkc19hbmRfZ2x5cGhzIGxvLCBoaVxuICAgICAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpcGxlc19mcm9tX2RpY3RfeF9rb19IYW5nX0xhdG46ICggcm93aWRfaW4sIGRza2V5LCBbIHJvbGUsIHMsIG8sIF0gKSAtPlxuICAgIHJlZiAgICAgICA9IHJvd2lkX2luXG4gICAgdiAgICAgICAgID0gXCJ2Ong6a28tSGFuZytMYXRuOiN7cm9sZX1cIlxuICAgIG8gICAgICAgID89ICcnXG4gICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2LCBvLCB9XG4gICAgQHN0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX3poX0xhdG5fcGlueWluOiAoIHJvd2lkX2luLCBkc2tleSwgWyBfLCBzLCBlbnRyeSwgXSApIC0+XG4gICAgcmVmICAgICAgID0gcm93aWRfaW5cbiAgICB2ICAgICAgICAgPSAndjpjOnJlYWRpbmc6emgtTGF0bi1waW55aW4nXG4gICAgZm9yIHJlYWRpbmcgZnJvbSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5leHRyYWN0X2F0b25hbF96aF9yZWFkaW5ncyBlbnRyeVxuICAgICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2LCBvOiByZWFkaW5nLCB9XG4gICAgQHN0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX2phX3hfS2FuOiAoIHJvd2lkX2luLCBkc2tleSwgWyBfLCBzLCBlbnRyeSwgXSApIC0+XG4gICAgcmVmICAgICAgID0gcm93aWRfaW5cbiAgICBpZiBlbnRyeS5zdGFydHNXaXRoICdrYTonXG4gICAgICB2X3hfS2FuICAgPSAndjpjOnJlYWRpbmc6amEteC1LYXQnXG4gICAgICB2X0xhdG4gICAgPSAndjpjOnJlYWRpbmc6amEteC1LYXQrTGF0bidcbiAgICBlbHNlXG4gICAgICB2X3hfS2FuICAgPSAndjpjOnJlYWRpbmc6amEteC1IaXInXG4gICAgICB2X0xhdG4gICAgPSAndjpjOnJlYWRpbmc6amEteC1IaXIrTGF0bidcbiAgICBmb3IgcmVhZGluZyBmcm9tIEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfamFfcmVhZGluZ3MgZW50cnlcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogdl94X0thbiwgbzogcmVhZGluZywgfVxuICAgICAgIyBmb3IgdHJhbnNjcmlwdGlvbiBmcm9tIEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLnJvbWFuaXplX2phX2thbmEgcmVhZGluZ1xuICAgICAgIyAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogdl9MYXRuLCBvOiB0cmFuc2NyaXB0aW9uLCB9XG4gICAgICB0cmFuc2NyaXB0aW9uID0gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMucm9tYW5pemVfamFfa2FuYSByZWFkaW5nXG4gICAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6IHZfTGF0biwgbzogdHJhbnNjcmlwdGlvbiwgfVxuICAgIEBzdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpcGxlc19mcm9tX2NfcmVhZGluZ19rb19IYW5nOiAoIHJvd2lkX2luLCBkc2tleSwgWyBfLCBzLCBlbnRyeSwgXSApIC0+XG4gICAgcmVmICAgICAgID0gcm93aWRfaW5cbiAgICB2ICAgICAgICAgPSAndjpjOnJlYWRpbmc6a28tSGFuZydcbiAgICBmb3IgcmVhZGluZyBmcm9tIEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfaGdfcmVhZGluZ3MgZW50cnlcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdiwgbzogcmVhZGluZywgfVxuICAgIEBzdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpcGxlc19mcm9tX3NoYXBlX2lkc3YyOiAoIHJvd2lkX2luLCBkc2tleSwgWyBfLCBzLCBmb3JtdWxhLCBdICkgLT5cbiAgICByZWYgICAgICAgPSByb3dpZF9pblxuICAgICMgZm9yIHJlYWRpbmcgZnJvbSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5wYXJzZV9pZHMgZm9ybXVsYVxuICAgICMgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHYsIG86IHJlYWRpbmcsIH1cbiAgICByZXR1cm4gbnVsbCBpZiAoIG5vdCBmb3JtdWxhPyApIG9yICggZm9ybXVsYSBpcyAnJyApXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6ICd2OmM6c2hhcGU6aWRzOlM6Zm9ybXVsYScsIG86IGZvcm11bGEsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGVycm9yID0gbnVsbFxuICAgIHRyeSBmb3JtdWxhX2FzdCA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLnBhcnNlX2lkbHggZm9ybXVsYSBjYXRjaCBlcnJvclxuICAgICAgbyA9IEpTT04uc3RyaW5naWZ5IHsgcmVmOiAnzqlqenJzZGJfXzM2JywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSwgcm93OiB7IHJvd2lkX2luLCBkc2tleSwgcywgZm9ybXVsYSwgfSwgfVxuICAgICAgd2FybiBcImVycm9yOiAje299XCJcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ3Y6YzpzaGFwZTppZHM6ZXJyb3InLCBvLCB9XG4gICAgcmV0dXJuIG51bGwgaWYgZXJyb3I/XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBmb3JtdWxhX2pzb24gICAgPSBKU09OLnN0cmluZ2lmeSBmb3JtdWxhX2FzdFxuICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ3Y6YzpzaGFwZTppZHM6Uzphc3QnLCBvOiBmb3JtdWxhX2pzb24sIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHsgb3BlcmF0b3JzLFxuICAgICAgY29tcG9uZW50cywgfSA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLm9wZXJhdG9yc19hbmRfY29tcG9uZW50c19mcm9tX2lkbHggZm9ybXVsYV9hc3RcbiAgICBzZWVuX29wZXJhdG9ycyAgPSBuZXcgU2V0KClcbiAgICBzZWVuX2NvbXBvbmVudHMgPSBuZXcgU2V0KClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGNvbXBvbmVudHNfanNvbiA9IEpTT04uc3RyaW5naWZ5IGNvbXBvbmVudHNcbiAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6ICd2OmM6c2hhcGU6aWRzOlM6Y29tcG9uZW50cycsIG86IGNvbXBvbmVudHNfanNvbiwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZm9yIG9wZXJhdG9yIGluIG9wZXJhdG9yc1xuICAgICAgY29udGludWUgaWYgc2Vlbl9vcGVyYXRvcnMuaGFzIG9wZXJhdG9yXG4gICAgICBzZWVuX29wZXJhdG9ycy5hZGQgb3BlcmF0b3JcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ3Y6YzpzaGFwZTppZHM6UzpoYXMtb3BlcmF0b3InLCBvOiBvcGVyYXRvciwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZm9yIGNvbXBvbmVudCBpbiBjb21wb25lbnRzXG4gICAgICBjb250aW51ZSBpZiBzZWVuX2NvbXBvbmVudHMuaGFzIGNvbXBvbmVudFxuICAgICAgc2Vlbl9jb21wb25lbnRzLmFkZCBjb21wb25lbnRcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ3Y6YzpzaGFwZTppZHM6UzpoYXMtY29tcG9uZW50JywgbzogY29tcG9uZW50LCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBAc3RhdGUudGltZWl0X3Byb2dyZXNzPygpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaXBsZXNfZnJvbV91Y2RfdWNkOiAoIHJvd2lkX2luLCBkc2tleSwgWyBfLCBzLCBlbnRyeSwgXSApIC0+XG4gICAgeWllbGQgcmV0dXJuIG51bGxcbiAgICAjIHJlZiAgICAgICA9IHJvd2lkX2luXG4gICAgIyB2ICAgICAgICAgPSAndjpjOnJlYWRpbmc6a28tSGFuZydcbiAgICAjIGZvciByZWFkaW5nIGZyb20gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9oZ19yZWFkaW5ncyBlbnRyeVxuICAgICMgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHYsIG86IHJlYWRpbmcsIH1cbiAgICAjIEBzdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICA7bnVsbFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyMjXG5cbiAgICAgIC5vOCAgICAgICAgICAgIC5vODhvLlxuICAgICBcIjg4OCAgICAgICAgICAgIDg4OCBgXCJcbiAub29vbzg4OCAgIC5vb29vLm8gbzg4OG9vICAgICBvby5vb29vby4gICAub29vby4gICBvb29vIGQ4YiAgLm9vb28ubyAgLm9vb29vLiAgb29vbyBkOGJcbmQ4OCcgYDg4OCAgZDg4KCAgXCI4ICA4ODggICAgICAgIDg4OCcgYDg4YiBgUCAgKTg4YiAgYDg4OFwiXCI4UCBkODgoICBcIjggZDg4JyBgODhiIGA4ODhcIlwiOFBcbjg4OCAgIDg4OCAgYFwiWTg4Yi4gICA4ODggICAgICAgIDg4OCAgIDg4OCAgLm9QXCI4ODggICA4ODggICAgIGBcIlk4OGIuICA4ODhvb284ODggIDg4OFxuODg4ICAgODg4ICBvLiAgKTg4YiAgODg4ICAgICAgICA4ODggICA4ODggZDgoICA4ODggICA4ODggICAgIG8uICApODhiIDg4OCAgICAubyAgODg4XG5gWThib2Q4OFBcIiA4XCJcIjg4OFAnIG84ODhvICAgICAgIDg4OGJvZDhQJyBgWTg4OFwiXCI4byBkODg4YiAgICA4XCJcIjg4OFAnIGBZOGJvZDhQJyBkODg4YlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA4ODhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvODg4b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIERhdGFzb3VyY2VfZmllbGRfcGFyc2VyXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogKHsgaG9zdCwgZHNrZXksIGZvcm1hdCwgcGF0aCwgfSkgLT5cbiAgICBAaG9zdCAgICAgPSBob3N0XG4gICAgQGRza2V5ICAgID0gZHNrZXlcbiAgICBAZm9ybWF0ICAgPSBmb3JtYXRcbiAgICBAcGF0aCAgICAgPSBwYXRoXG4gICAgO3VuZGVmaW5lZFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgW1N5bWJvbC5pdGVyYXRvcl06IC0+IHlpZWxkIGZyb20gQHdhbGsoKVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgd2FsazogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzM3JywgXCJEYXRhc291cmNlX2ZpZWxkX3BhcnNlcjo6d2FsazpcIiwgeyBmb3JtYXQ6IEBmb3JtYXQsIGRza2V5OiBAZHNrZXksIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIG1ldGhvZF9uYW1lID0gJ3dhbGtfJyArIEBmb3JtYXQucmVwbGFjZSAvW15hLXpdL2d2LCAnXydcbiAgICBtZXRob2QgICAgICA9IEBbIG1ldGhvZF9uYW1lIF0gPyBAX3dhbGtfbm9fc3VjaF9wYXJzZXJcbiAgICB5aWVsZCBmcm9tIG1ldGhvZC5jYWxsIEBcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX3dhbGtfbm9fc3VjaF9wYXJzZXI6IC0+XG4gICAgbWVzc2FnZSA9IFwizqlqenJzZGJfXzM4IG5vIHBhcnNlciBmb3VuZCBmb3IgZm9ybWF0ICN7cnByIEBmb3JtYXR9XCJcbiAgICB3YXJuIG1lc3NhZ2VcbiAgICB5aWVsZCB7IGxpbmVfbnI6IDAsIGxjb2RlOiAnRScsIGxpbmU6IG1lc3NhZ2UsIGpmaWVsZHM6IG51bGwsIH1cbiAgICBmb3IgeyBsbnI6IGxpbmVfbnIsIGxpbmUsIGVvbCwgfSBmcm9tIHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgQHBhdGhcbiAgICAgIHlpZWxkIHsgbGluZV9uciwgbGNvZGU6ICdVJywgbGluZSwgamZpZWxkczogbnVsbCwgfVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfd2Fsa19maWVsZHNfd2l0aF9zZXBhcmF0b3I6ICh7IGNvbW1lbnRfcmUgPSAvXlxccyojL3YsIHNwbGl0dGVyID0gJ1xcdCcsIH0pIC0+XG4gICAgZm9yIHsgbG5yOiBsaW5lX25yLCBsaW5lLCBlb2wsIH0gZnJvbSB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zIEBwYXRoXG4gICAgICBsaW5lICAgID0gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMubm9ybWFsaXplX3RleHQgbGluZVxuICAgICAgamZpZWxkcyA9IG51bGxcbiAgICAgIHN3aXRjaCB0cnVlXG4gICAgICAgIHdoZW4gL15cXHMqJC92LnRlc3QgbGluZSB0aGVuIGxjb2RlID0gJ0InXG4gICAgICAgIHdoZW4gY29tbWVudF9yZS50ZXN0IGxpbmUgdGhlbiBsY29kZSA9ICdDJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgbGNvZGUgPSAnRCdcbiAgICAgICAgICBqZmllbGRzICAgPSBKU09OLnN0cmluZ2lmeSBsaW5lLnNwbGl0IHNwbGl0dGVyXG4gICAgICB5aWVsZCB7IGxpbmVfbnIsIGxjb2RlLCBsaW5lLCBqZmllbGRzLCB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHdhbGtfZHNmX3RzdjogLT5cbiAgICB5aWVsZCBmcm9tIEBfd2Fsa19maWVsZHNfd2l0aF9zZXBhcmF0b3IgeyBzcGxpdHRlcjogJ1xcdCcsIH1cbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgd2Fsa19kc2Zfc2VtaWNvbG9uczogLT5cbiAgICB5aWVsZCBmcm9tIEBfd2Fsa19maWVsZHNfd2l0aF9zZXBhcmF0b3IgeyBzcGxpdHRlcjogJzsnLCB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHdhbGtfZHNmX21kX3RhYmxlOiAtPlxuICAgIGZvciB7IGxucjogbGluZV9uciwgbGluZSwgZW9sLCB9IGZyb20gd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBAcGF0aFxuICAgICAgbGluZSAgICA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLm5vcm1hbGl6ZV90ZXh0IGxpbmVcbiAgICAgIGpmaWVsZHMgPSBudWxsXG4gICAgICBsY29kZSAgID0gJ1UnXG4gICAgICBzd2l0Y2ggdHJ1ZVxuICAgICAgICB3aGVuIC9eXFxzKiQvdi50ZXN0IGxpbmUgICAgICAgdGhlbiBsY29kZSA9ICdCJ1xuICAgICAgICB3aGVuIG5vdCBsaW5lLnN0YXJ0c1dpdGggJ3wnICB0aGVuIG51bGwgIyBub3QgYW4gTUQgdGFibGVcbiAgICAgICAgd2hlbiBsaW5lLnN0YXJ0c1dpdGggJ3wtJyAgICAgdGhlbiBudWxsICMgTUQgdGFibGUgaGVhZGVyIHNlcGFyYXRvclxuICAgICAgICB3aGVuIC9eXFx8XFxzK1xcKi92LnRlc3QgbGluZSAgICB0aGVuIG51bGwgIyBNRCB0YWJsZSBoZWFkZXJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGxjb2RlICAgPSAnRCdcbiAgICAgICAgICBqZmllbGRzID0gbGluZS5zcGxpdCAnfCdcbiAgICAgICAgICBqZmllbGRzLnNoaWZ0KClcbiAgICAgICAgICBqZmllbGRzLnBvcCgpXG4gICAgICAgICAgamZpZWxkcyA9ICggZmllbGQudHJpbSgpICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgZmllbGQgaW4gamZpZWxkcyApXG4gICAgICAgICAgamZpZWxkcyA9ICggKCBmaWVsZC5yZXBsYWNlIC9eYCguKylgJC9ndiwgJyQxJyApICBmb3IgZmllbGQgaW4gamZpZWxkcyApXG4gICAgICAgICAgamZpZWxkcyA9IEpTT04uc3RyaW5naWZ5IGpmaWVsZHNcbiAgICAgICAgICAjIGRlYnVnICfOqWp6cnNkYl9fMzknLCBqZmllbGRzXG4gICAgICB5aWVsZCB7IGxpbmVfbnIsIGxjb2RlLCBsaW5lLCBqZmllbGRzLCB9XG4gICAgO251bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyB3YWxrX2NzdjogLT5cbiAgIyAgIHlpZWxkIHJldHVybiBudWxsXG5cbiAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgd2Fsa19qc29uOiAtPlxuICAjICAgeWllbGQgcmV0dXJuIG51bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyB3YWxrX21kOiAtPlxuICAjICAgeWllbGQgcmV0dXJuIG51bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyB3YWxrX3R4dDogLT5cbiAgIyAgIHlpZWxkIHJldHVybiBudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBkYXRhc291cmNlX2Zvcm1hdF9wYXJzZXJcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBwYXJzZV91Y2RiX3JzZ3NfZ2x5cGhyYW5nZTogKHsgamZpZWxkcywgfSkgLT5cbiAgICBbIGljbGFiZWwsXG4gICAgICByc2csXG4gICAgICBpc19jamtfdHh0LFxuICAgICAgbG9faGlfdHh0LFxuICAgICAgbmFtZSwgICAgIF0gPSBKU09OLnBhcnNlIGpmaWVsZHNcbiAgICBsb19oaV9yZSAgICAgID0gLy8vIF4gMHggKD88bG8+IFswLTlhLWZdezEsNn0gKSBcXHMqXFwuXFwuXFxzKiAweCAoPzxoaT4gWzAtOWEtZl17MSw2fSApICQgLy8vaXZcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlzX2NqayA9IHN3aXRjaCBpc19jamtfdHh0XG4gICAgICB3aGVuICd0cnVlJyAgIHRoZW4gMVxuICAgICAgd2hlbiAnZmFsc2UnICB0aGVuIDBcbiAgICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfXzQwIGV4cGVjdGVkICd0cnVlJyBvciAnZmFsc2UnLCBnb3QgI3tycHIgaXNfY2prX3R4dH1cIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgdW5sZXNzICggbWF0Y2ggPSBsb19oaV90eHQubWF0Y2ggbG9faGlfcmUgKT9cbiAgICAgIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX180MSBleHBlY3RlZCBhIHJhbmdlIGxpdGVyYWwgbGlrZSAnMHgwMWE2Li4weDEwZmYnLCBnb3QgI3tycHIgbG9faGlfdHh0fVwiXG4gICAgbG8gID0gcGFyc2VJbnQgbWF0Y2guZ3JvdXBzLmxvLCAxNlxuICAgIGhpICA9IHBhcnNlSW50IG1hdGNoLmdyb3Vwcy5oaSwgMTZcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHJldHVybiB7IHJzZywgaXNfY2prLCBsbywgaGksIG5hbWUsIH1cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIGdseXBoX2NvbnZlcnRlclxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQGdseXBoX2Zyb21fY2lkOiAoIGNpZCApIC0+XG4gICAgcmV0dXJuIG51bGwgdW5sZXNzICggL15bXFxwe0x9XFxwe1N9XFxwe1B9XFxwe019XFxwe059XFxwe1pzfVxccHtDb31dJC92LnRlc3QgUiA9IFN0cmluZy5mcm9tQ29kZVBvaW50IGNpZCApXG4gICAgcmV0dXJuIFJcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBnZW5lcmF0ZV9jaWRzX2FuZF9nbHlwaHM6ICggbG8sIGhpICkgLT5cbiAgICBmb3IgY2lkIGluIFsgbG8gLi4gaGkgXVxuICAgICAgY29udGludWUgdW5sZXNzICggZ2x5cGggPSBAZ2x5cGhfZnJvbV9jaWQgY2lkICk/XG4gICAgICB5aWVsZCB7IGNpZCwgZ2x5cGgsIH1cbiAgICA7bnVsbFxuXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIyNcblxub29vb29cbmA4ODgnXG4gODg4ICAgICAgICAgIC5vb29vLiAgIG9vby4gLm9vLiAgICAub29vb29vb28gICAgICAgICAgICAgIC5vb29vLm8gb29vbyBkOGIgb29vbyAgICBvb29cbiA4ODggICAgICAgICBgUCAgKTg4YiAgYDg4OFBcIlk4OGIgIDg4OCcgYDg4YiAgICAgICAgICAgICAgZDg4KCAgXCI4IGA4ODhcIlwiOFAgIGA4OC4gIC44J1xuIDg4OCAgICAgICAgICAub1BcIjg4OCAgIDg4OCAgIDg4OCAgODg4ICAgODg4ICAgICAgICAgICAgICBgXCJZODhiLiAgIDg4OCAgICAgICBgODguLjgnXG4gODg4ICAgICAgIG8gZDgoICA4ODggICA4ODggICA4ODggIGA4OGJvZDhQJyAgICAgICAgICAgICAgby4gICk4OGIgIDg4OCAgICAgICAgYDg4OCdcbm84ODhvb29vb29kOCBgWTg4OFwiXCI4byBvODg4byBvODg4byBgOG9vb29vby4gIG9vb29vb29vb29vIDhcIlwiODg4UCcgZDg4OGIgICAgICAgIGA4J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkXCIgICAgIFlEXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiWTg4ODg4UCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBMYW5ndWFnZV9zZXJ2aWNlc1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgQF9UTVBfaGFuZ2V1bCA9IHJlcXVpcmUgJ2hhbmd1bC1kaXNhc3NlbWJsZSdcbiAgICBAX1RNUF9rYW5hICAgID0gcmVxdWlyZSAnd2FuYWthbmEnXG4gICAgIyB7IHRvSGlyYWdhbmEsXG4gICAgIyAgIHRvS2FuYSxcbiAgICAjICAgdG9LYXRha2FuYVxuICAgICMgICB0b1JvbWFqaSxcbiAgICAjICAgdG9rZW5pemUsICAgICAgICAgfSA9IHJlcXVpcmUgJ3dhbmFrYW5hJ1xuICAgIDt1bmRlZmluZWRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG5vcm1hbGl6ZV90ZXh0OiAoIHRleHQsIGZvcm0gPSAnTkZDJyApIC0+IHRleHQubm9ybWFsaXplIGZvcm1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHJlbW92ZV9waW55aW5fZGlhY3JpdGljczogKCB0ZXh0ICkgLT4gKCB0ZXh0Lm5vcm1hbGl6ZSAnTkZLRCcgKS5yZXBsYWNlIC9cXFB7TH0vZ3YsICcnXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBleHRyYWN0X2F0b25hbF96aF9yZWFkaW5nczogKCBlbnRyeSApIC0+XG4gICAgIyBweTp6aMO5LCB6aGUsIHpoxIFvLCB6aMOhbywgemjHlCwgesSrXG4gICAgUiA9IGVudHJ5XG4gICAgUiA9IFIucmVwbGFjZSAvXnB5Oi92LCAnJ1xuICAgIFIgPSBSLnNwbGl0IC8sXFxzKi92XG4gICAgUiA9ICggKCBAcmVtb3ZlX3Bpbnlpbl9kaWFjcml0aWNzIHpoX3JlYWRpbmcgKSBmb3IgemhfcmVhZGluZyBpbiBSIClcbiAgICBSID0gbmV3IFNldCBSXG4gICAgUi5kZWxldGUgJ251bGwnXG4gICAgUi5kZWxldGUgJ0BudWxsJ1xuICAgIHJldHVybiBbIFIuLi4sIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGV4dHJhY3RfamFfcmVhZGluZ3M6ICggZW50cnkgKSAtPlxuICAgICMg56m6ICAgICAgaGk644Gd44KJLCDjgYLCtyjjgY9844GNfOOBkeOCiyksIOOBi+OCiSwg44GZwrco44GPfOOBi+OBmSksIOOCgOOBqsK344GX44GEXG4gICAgUiA9IGVudHJ5XG4gICAgUiA9IFIucmVwbGFjZSAvXig/OmhpfGthKTovdiwgJydcbiAgICBSID0gUi5yZXBsYWNlIC9cXHMrL2d2LCAnJ1xuICAgIFIgPSBSLnNwbGl0IC8sXFxzKi92XG4gICAgIyMjIE5PVEUgcmVtb3ZlIG5vLXJlYWRpbmdzIG1hcmtlciBgQG51bGxgIGFuZCBjb250ZXh0dWFsIHJlYWRpbmdzIGxpa2UgLeODjeODsyBmb3Ig57iBLCAt44OO44KmIGZvciDnjosgIyMjXG4gICAgUiA9ICggcmVhZGluZyBmb3IgcmVhZGluZyBpbiBSIHdoZW4gbm90IHJlYWRpbmcuc3RhcnRzV2l0aCAnLScgKVxuICAgIFIgPSBuZXcgU2V0IFJcbiAgICBSLmRlbGV0ZSAnbnVsbCdcbiAgICBSLmRlbGV0ZSAnQG51bGwnXG4gICAgcmV0dXJuIFsgUi4uLiwgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZXh0cmFjdF9oZ19yZWFkaW5nczogKCBlbnRyeSApIC0+XG4gICAgIyDnqbogICAgICBoaTrjgZ3jgoksIOOBgsK3KOOBj3zjgY1844GR44KLKSwg44GL44KJLCDjgZnCtyjjgY9844GL44GZKSwg44KA44GqwrfjgZfjgYRcbiAgICBSID0gZW50cnlcbiAgICBSID0gUi5yZXBsYWNlIC9eKD86aGcpOi92LCAnJ1xuICAgIFIgPSBSLnJlcGxhY2UgL1xccysvZ3YsICcnXG4gICAgUiA9IFIuc3BsaXQgLyxcXHMqL3ZcbiAgICBSID0gbmV3IFNldCBSXG4gICAgUi5kZWxldGUgJ251bGwnXG4gICAgUi5kZWxldGUgJ0BudWxsJ1xuICAgIGhhbmdldWwgPSBbIFIuLi4sIF0uam9pbiAnJ1xuICAgICMgZGVidWcgJ86panpyc2RiX180MicsIEBfVE1QX2hhbmdldWwuZGlzYXNzZW1ibGUgaGFuZ2V1bCwgeyBmbGF0dGVuOiBmYWxzZSwgfVxuICAgIHJldHVybiBbIFIuLi4sIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHJvbWFuaXplX2phX2thbmE6ICggZW50cnkgKSAtPlxuICAgIGNmZyA9IHt9XG4gICAgcmV0dXJuIEBfVE1QX2thbmEudG9Sb21hamkgZW50cnksIGNmZ1xuICAgICMgIyMjIHN5c3RlbWF0aWMgbmFtZSBtb3JlIGxpa2UgYC4uLl9qYV94X2thbl9sYXRuKClgICMjI1xuICAgICMgaGVscCAnzqlkamtyX180MycsIHRvSGlyYWdhbmEgICfjg6njg7zjg6Hjg7MnLCAgICAgICB7IGNvbnZlcnRMb25nVm93ZWxNYXJrOiBmYWxzZSwgfVxuICAgICMgaGVscCAnzqlkamtyX180NCcsIHRvSGlyYWdhbmEgICfjg6njg7zjg6Hjg7MnLCAgICAgICB7IGNvbnZlcnRMb25nVm93ZWxNYXJrOiB0cnVlLCB9XG4gICAgIyBoZWxwICfOqWRqa3JfXzQ1JywgdG9LYW5hICAgICAgJ3dhbmFrYW5hJywgICB7IGN1c3RvbUthbmFNYXBwaW5nOiB7IG5hOiAn44GrJywga2E6ICdCYW5hJyB9LCB9XG4gICAgIyBoZWxwICfOqWRqa3JfXzQ2JywgdG9LYW5hICAgICAgJ3dhbmFrYW5hJywgICB7IGN1c3RvbUthbmFNYXBwaW5nOiB7IHdha2E6ICco5ZKM5q2MKScsIHdhOiAnKOWSjDIpJywga2E6ICco5q2MMiknLCBuYTogJyjlkI0pJywga2E6ICcoQmFuYSknLCBuYWthOiAnKOS4rSknLCB9LCB9XG4gICAgIyBoZWxwICfOqWRqa3JfXzQ3JywgdG9Sb21hamkgICAgJ+OBpOOBmOOBjuOCiicsICAgICB7IGN1c3RvbVJvbWFqaU1hcHBpbmc6IHsg44GYOiAnKHppKScsIOOBpDogJyh0dSknLCDjgoo6ICcobGkpJywg44KK44KH44GGOiAnKHJ5b3UpJywg44KK44KHOiAnKHJ5byknIH0sIH1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHBhcnNlX2lkbHg6ICggZm9ybXVsYSApIC0+IElETFgucGFyc2UgZm9ybXVsYVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgb3BlcmF0b3JzX2FuZF9jb21wb25lbnRzX2Zyb21faWRseDogKCBmb3JtdWxhICkgLT5cbiAgICBzd2l0Y2ggdHlwZSA9IHR5cGVfb2YgZm9ybXVsYVxuICAgICAgd2hlbiAndGV4dCcgICB0aGVuICBmb3JtdWxhX2FzdCA9IEBwYXJzZV9pZGx4IGZvcm11bGFcbiAgICAgIHdoZW4gJ2xpc3QnICAgdGhlbiAgZm9ybXVsYV9hc3QgPSAgICAgICAgICAgICBmb3JtdWxhXG4gICAgICBlbHNlIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX180OCBleHBlY3RlZCBhIHRleHQgb3IgYSBsaXN0LCBnb3QgYSAje3R5cGV9XCJcbiAgICBvcGVyYXRvcnMgICA9IFtdXG4gICAgY29tcG9uZW50cyAgPSBbXVxuICAgIHNlcGFyYXRlICAgID0gKCBsaXN0ICkgLT5cbiAgICAgIGZvciBlbGVtZW50LCBpZHggaW4gbGlzdFxuICAgICAgICBpZiBpZHggaXMgMFxuICAgICAgICAgIG9wZXJhdG9ycy5wdXNoIGVsZW1lbnRcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICBpZiAoIHR5cGVfb2YgZWxlbWVudCApIGlzICdsaXN0J1xuICAgICAgICAgIHNlcGFyYXRlIGVsZW1lbnRcbiAgICAgICAgICAjIGNvbXBvbmVudHMuc3BsaWNlIGNvbXBvbmVudHMubGVuZ3RoLCAwLCAoIHNlcGFyYXRlIGVsZW1lbnQgKS4uLlxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIGNvbXBvbmVudHMucHVzaCBlbGVtZW50XG4gICAgc2VwYXJhdGUgZm9ybXVsYV9hc3RcbiAgICByZXR1cm4geyBvcGVyYXRvcnMsIGNvbXBvbmVudHMsIH1cblxuXG5cblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIyMgVEFJTlQgZ29lcyBpbnRvIGNvbnN0cnVjdG9yIG9mIEp6ciBjbGFzcyAjIyNcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIyNcblxuICAgb29vbyAgbzhvXG4gICBgODg4ICBgXCInXG4gICAgODg4IG9vb28gICAgb29vb29vb28gb29vbyAgb29vbyAgb29vbyBkOGIgIC5vb29vLlxuICAgIDg4OCBgODg4ICAgZCdcIlwiN2Q4UCAgYDg4OCAgYDg4OCAgYDg4OFwiXCI4UCBgUCAgKTg4YlxuICAgIDg4OCAgODg4ICAgICAuZDhQJyAgICA4ODggICA4ODggICA4ODggICAgICAub1BcIjg4OFxuICAgIDg4OCAgODg4ICAgLmQ4UCcgIC5QICA4ODggICA4ODggICA4ODggICAgIGQ4KCAgODg4XG4uby4gODhQIG84ODhvIGQ4ODg4ODg4UCAgIGBWODhWXCJWOFAnIGQ4ODhiICAgIGBZODg4XCJcIjhvXG5gWTg4OFBcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBKaXp1cmFcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIHsgcGF0aHMsIH0gICAgICAgICAgPSBnZXRfcGF0aHNfYW5kX2Zvcm1hdHMoKVxuICAgIEBwYXRocyAgICAgICAgICAgICAgPSBwYXRoc1xuICAgIEBsYW5ndWFnZV9zZXJ2aWNlcyAgPSBuZXcgTGFuZ3VhZ2Vfc2VydmljZXMoKVxuICAgIEBkYmEgICAgICAgICAgICAgICAgPSBuZXcgSnpyX2RiX2FkYXB0ZXIgQHBhdGhzLmRiLCB7IGhvc3Q6IEAsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBhcmFtZXRlcl9zZXRzICAgICAgPSBbXG4gICAgICB7IGRza2V5OiAnZHM6ZGljdDp4OmtvLUhhbmcrTGF0bicsICB2X3JlOiAnfCcsICAgIH1cbiAgICAgIHsgZHNrZXk6ICdkczpkaWN0Om1lYW5pbmdzJywgICAgICAgIHZfcmU6ICdecHk6JywgfVxuICAgICAgeyBkc2tleTogJ2RzOmRpY3Q6bWVhbmluZ3MnLCAgICAgICAgdl9yZTogJ15rYTonLCB9XG4gICAgICB7IGRza2V5OiAnZHM6ZGljdDptZWFuaW5ncycsICAgICAgICB2X3JlOiAnXmhpOicsIH1cbiAgICAgIHsgZHNrZXk6ICdkczpkaWN0Om1lYW5pbmdzJywgICAgICAgIHZfcmU6ICdeaGc6JywgfVxuICAgICAgeyBkc2tleTogJ2RzOnNoYXBlOmlkc3YyJywgICAgICAgICAgdl9yZTogJ3wnLCAgICB9XG4gICAgICB7IGRza2V5OiAnZHM6dWNkOnVjZCcsICAgICAgICAgICAgICB2X3JlOiAnfCcsICAgIH1cbiAgICAgIF1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIEBkYmEuaXNfZnJlc2hcbiAgICAgICMjIyBUQUlOVCBtb3ZlIHRvIEp6cl9kYl9hZGFwdGVyIHRvZ2V0aGVyIHdpdGggdHJ5L2NhdGNoICMjI1xuICAgICAgZm9yIHBhcmFtZXRlcnMgaW4gcGFyYW1ldGVyX3NldHNcbiAgICAgICAgZGVidWcgJ86panpyc2RiX180OScsICdwb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXMnLCBwYXJhbWV0ZXJzXG4gICAgICAgIHRyeVxuICAgICAgICAgIEBkYmEuc3RhdGVtZW50cy5wb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXMucnVuIHBhcmFtZXRlcnNcbiAgICAgICAgY2F0Y2ggY2F1c2VcbiAgICAgICAgICBmaWVsZHNfcnByID0gcnByIEBkYmEuc3RhdGUubW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfXzUwIHdoZW4gdHJ5aW5nIHRvIGluc2VydCB0aGlzIHJvdzogI3tmaWVsZHNfcnByfSwgYW4gZXJyb3Igd2FzIHRocm93bjogI3tjYXVzZS5tZXNzYWdlfVwiLCBcXFxuICAgICAgICAgICAgeyBjYXVzZSwgfVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgICMjIyBUQUlOVCBtb3ZlIHRvIEp6cl9kYl9hZGFwdGVyIHRvZ2V0aGVyIHdpdGggdHJ5L2NhdGNoICMjI1xuICAgICAgZGVidWcgJ86panpyc2RiX181MScsICdwb3B1bGF0ZV9qenJfbGFuZ19oYW5nZXVsX3N5bGxhYmxlcydcbiAgICAgIHRyeVxuICAgICAgICBAZGJhLnN0YXRlbWVudHMucG9wdWxhdGVfanpyX2xhbmdfaGFuZ2V1bF9zeWxsYWJsZXMucnVuKClcbiAgICAgIGNhdGNoIGNhdXNlXG4gICAgICAgIGZpZWxkc19ycHIgPSBycHIgQGRiYS5zdGF0ZS5tb3N0X3JlY2VudF9pbnNlcnRlZF9yb3dcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfXzUyIHdoZW4gdHJ5aW5nIHRvIGluc2VydCB0aGlzIHJvdzogI3tmaWVsZHNfcnByfSwgYW4gZXJyb3Igd2FzIHRocm93bjogI3tjYXVzZS5tZXNzYWdlfVwiLCBcXFxuICAgICAgICAgIHsgY2F1c2UsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDt1bmRlZmluZWRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNob3dfY291bnRzOiAtPlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZG8gPT5cbiAgICAgIHF1ZXJ5ID0gU1FMXCJcIlwiXG4gICAgICAgIHNlbGVjdFxuICAgICAgICAgICAgbXYudiAgICAgICAgICAgIGFzIHYsXG4gICAgICAgICAgICBjb3VudCggdDMudiApICAgYXMgY291bnRcbiAgICAgICAgICBmcm9tICAgICAgICBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0M1xuICAgICAgICAgIHJpZ2h0IGpvaW4gIGp6cl9taXJyb3JfdmVyYnMgICAgICAgIGFzIG12IHVzaW5nICggdiApXG4gICAgICAgIGdyb3VwIGJ5IHZcbiAgICAgICAgb3JkZXIgYnkgY291bnQgZGVzYywgdjtcIlwiXCJcbiAgICAgIGVjaG8gKCBncmV5ICfOqWp6cnNkYl9fNTMnICksICggZ29sZCByZXZlcnNlIGJvbGQgcXVlcnkgKVxuICAgICAgY291bnRzID0gKCBAZGJhLnByZXBhcmUgcXVlcnkgKS5hbGwoKVxuICAgICAgY29uc29sZS50YWJsZSBjb3VudHNcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRvID0+XG4gICAgICBxdWVyeSA9IFNRTFwiXCJcIlxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICAgIG12LnYgICAgICAgICAgICBhcyB2LFxuICAgICAgICAgICAgY291bnQoIHQzLnYgKSAgIGFzIGNvdW50XG4gICAgICAgICAgZnJvbSAgICAgICAganpyX3RyaXBsZXMgICAgICAgYXMgdDNcbiAgICAgICAgICByaWdodCBqb2luICBqenJfbWlycm9yX3ZlcmJzICBhcyBtdiB1c2luZyAoIHYgKVxuICAgICAgICBncm91cCBieSB2XG4gICAgICAgIG9yZGVyIGJ5IGNvdW50IGRlc2MsIHY7XCJcIlwiXG4gICAgICBlY2hvICggZ3JleSAnzqlqenJzZGJfXzU0JyApLCAoIGdvbGQgcmV2ZXJzZSBib2xkIHF1ZXJ5IClcbiAgICAgIGNvdW50cyA9ICggQGRiYS5wcmVwYXJlIHF1ZXJ5ICkuYWxsKClcbiAgICAgIGNvbnNvbGUudGFibGUgY291bnRzXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkbyA9PlxuICAgICAgcXVlcnkgPSBTUUxcIlwiXCJcbiAgICAgICAgc2VsZWN0IGRza2V5LCBjb3VudCgqKSBhcyBjb3VudCBmcm9tIGp6cl9taXJyb3JfbGluZXMgZ3JvdXAgYnkgZHNrZXkgdW5pb24gYWxsXG4gICAgICAgIHNlbGVjdCAnKicsICAgY291bnQoKikgYXMgY291bnQgZnJvbSBqenJfbWlycm9yX2xpbmVzXG4gICAgICAgIG9yZGVyIGJ5IGNvdW50IGRlc2M7XCJcIlwiXG4gICAgICBlY2hvICggZ3JleSAnzqlqenJzZGJfXzU1JyApLCAoIGdvbGQgcmV2ZXJzZSBib2xkIHF1ZXJ5IClcbiAgICAgIGNvdW50cyA9ICggQGRiYS5wcmVwYXJlIHF1ZXJ5ICkuYWxsKClcbiAgICAgIGNvdW50cyA9IE9iamVjdC5mcm9tRW50cmllcyAoIFsgZHNrZXksIHsgY291bnQsIH0sIF0gZm9yIHsgZHNrZXksIGNvdW50LCB9IGluIGNvdW50cyApXG4gICAgICBjb25zb2xlLnRhYmxlIGNvdW50c1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHNob3dfanpyX21ldGFfZmF1bHRzOiAtPlxuICAgIGlmICggZmF1bHR5X3Jvd3MgPSAoIEBkYmEucHJlcGFyZSBTUUxcInNlbGVjdCAqIGZyb20ganpyX21ldGFfZmF1bHRzO1wiICkuYWxsKCkgKS5sZW5ndGggPiAwXG4gICAgICBlY2hvICfOqWp6cnNkYl9fNTYnLCByZWQgcmV2ZXJzZSBib2xkIFwiIGZvdW5kIHNvbWUgZmF1bHRzOiBcIlxuICAgICAgY29uc29sZS50YWJsZSBmYXVsdHlfcm93c1xuICAgIGVsc2VcbiAgICAgIGVjaG8gJ86panpyc2RiX181NycsIGxpbWUgcmV2ZXJzZSBib2xkIFwiIChubyBmYXVsdHMpIFwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7bnVsbFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxubW9kdWxlLmV4cG9ydHMgPSBkbyA9PlxuICBpbnRlcm5hbHMgPSB7XG4gICAgSnpyX2RiX2FkYXB0ZXIsXG4gICAgRGF0YXNvdXJjZV9maWVsZF9wYXJzZXIsXG4gICAgZGF0YXNvdXJjZV9mb3JtYXRfcGFyc2VyLFxuICAgIExhbmd1YWdlX3NlcnZpY2VzLFxuICAgIGdldF9wYXRoc19hbmRfZm9ybWF0cywgfVxuICByZXR1cm4ge1xuICAgIEppenVyYSxcbiAgICBpbnRlcm5hbHMsIH1cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5pZiBtb2R1bGUgaXMgcmVxdWlyZS5tYWluIHRoZW4gZG8gPT5cbiAganpyID0gbmV3IEppenVyYSgpICMgdHJpZ2dlcnMgcmVidWlsZCBvZiBEQiB3aGVuIG5lY2Vzc2FyeVxuICA7bnVsbFxuXG4iXX0=
