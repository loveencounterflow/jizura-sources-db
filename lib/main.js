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
        this.statements.insert_jzr_datasource_format.run({
          format: 'dsf:semicolons',
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
        debug('Ωjzrsdb__32', '_on_open_populate_jzr_mirror_lines');
        this.statements.populate_jzr_mirror_lines.run();
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_glyphranges() {
        debug('Ωjzrsdb__33', '_on_open_populate_jzr_glyphranges');
        this.statements.populate_jzr_glyphranges.run();
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_glyphs() {
        var cause, fields_rpr;
        debug('Ωjzrsdb__34', '_on_open_populate_jzr_glyphs');
        try {
          this.statements.populate_jzr_glyphs.run();
        } catch (error1) {
          cause = error1;
          fields_rpr = rpr(this.state.most_recent_inserted_row);
          throw new Error(`Ωjzrsdb__35 when trying to insert this row: ${fields_rpr}, an error was thrown: ${cause.message}`, {cause});
        }
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      trigger_on_before_insert(name, ...fields) {
        // debug 'Ωjzrsdb__36', { name, fields, }
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
            ref: 'Ωjzrsdb__37',
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
      SQL`create table jzr_datasource_formats (
  format    text    unique  not null,
  comment   text            not null,
primary key ( format ),
constraint "Ωconstraint__12" check ( format regexp '^dsf:[\\-\\+\\.:a-zA-Z0-9]+$' )
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
        value: function(name, ...fields) {
          return this.trigger_on_before_insert(name, ...fields);
        }
      },
      //-------------------------------------------------------------------------------------------------------
      /* NOTE moved to Dbric_std; consider to overwrite with version using `slevithan/regex` */
      // regexp:
      //   overwrite:      true
      //   deterministic:  true
      //   value: ( pattern, text ) -> if ( ( new RegExp pattern, 'v' ).test text ) then 1 else 0

      //-------------------------------------------------------------------------------------------------------
      jzr_has_peripheral_ws_in_jfield: {
        deterministic: true,
        value: function(jfields_json) {
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
        value: function(cid) {
          return glyph_converter.glyph_from_cid(cid);
        }
      },
      //-------------------------------------------------------------------------------------------------------
      jzr_as_hex: {
        deterministic: true,
        value: function(cid) {
          return `0x${(cid.toString(16)).padStart(4, 0)}`;
        }
      },
      //-------------------------------------------------------------------------------------------------------
      jzr_integer_from_hex: {
        deterministic: true,
        value: function(cid_hex) {
          return parseInt(cid_hex, 16);
        }
      }
    };

    // #-------------------------------------------------------------------------------------------------------
    // jzr_is_cjk_glyph:
    //   deterministic:  true
    //   value: ( cid ) -> "0x#{( cid.toString 16 ).padStart 4, 0}"

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
          var glyphrange;
          glyphrange = datasource_format_parser.parse_ucdb_rsgs_glyphrange({dskey, line_nr, jfields});
          if (glyphrange != null) {
            yield glyphrange;
          }
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
      debug('Ωjzrsdb__38', "Datasource_field_parser::walk:", {
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
      message = `Ωjzrsdb__39 no parser found for format ${rpr(this.format)}`;
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
        // debug 'Ωjzrsdb__40', jfields
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
      var dgroup, hi, iclabel, is_cjk, is_cjk_txt, lo, lo_hi_re, lo_hi_txt, match, name, rsg;
      [dgroup, iclabel, rsg, is_cjk_txt, lo_hi_txt, name] = JSON.parse(jfields);
      if (dgroup !== '`dg:rsgs`') {
        return null;
      }
      lo_hi_re = /^0x(?<lo>[0-9a-f]{1,6})\s*\.\.\s*0x(?<hi>[0-9a-f]{1,6})$/iv;
      //.......................................................................................................
      is_cjk = (function() {
        switch (is_cjk_txt) {
          case 'true':
            return 1;
          case 'false':
            return 0;
          default:
            throw new Error(`Ωjzrsdb__41 expected 'true' or 'false', got ${rpr(is_cjk_txt)}`);
        }
      })();
      //.......................................................................................................
      if ((match = lo_hi_txt.match(lo_hi_re)) == null) {
        throw new Error(`Ωjzrsdb__42 expected a range literal like '0x01a6..0x10ff', got ${rpr(lo_hi_txt)}`);
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
      // debug 'Ωjzrsdb__43', @_TMP_hangeul.disassemble hangeul, { flatten: false, }
      return [...R];
    }

    //---------------------------------------------------------------------------------------------------------
    romanize_ja_kana(entry) {
      var cfg;
      cfg = {};
      return this._TMP_kana.toRomaji(entry, cfg);
    }

    // ### systematic name more like `..._ja_x_kan_latn()` ###
    // help 'Ωdjkr__44', toHiragana  'ラーメン',       { convertLongVowelMark: false, }
    // help 'Ωdjkr__45', toHiragana  'ラーメン',       { convertLongVowelMark: true, }
    // help 'Ωdjkr__46', toKana      'wanakana',   { customKanaMapping: { na: 'に', ka: 'Bana' }, }
    // help 'Ωdjkr__47', toKana      'wanakana',   { customKanaMapping: { waka: '(和歌)', wa: '(和2)', ka: '(歌2)', na: '(名)', ka: '(Bana)', naka: '(中)', }, }
    // help 'Ωdjkr__48', toRomaji    'つじぎり',     { customRomajiMapping: { じ: '(zi)', つ: '(tu)', り: '(li)', りょう: '(ryou)', りょ: '(ryo)' }, }

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
          throw new Error(`Ωjzrsdb__49 expected a text or a list, got a ${type}`);
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
          debug('Ωjzrsdb__50', 'populate_jzr_mirror_triples', parameters);
          try {
            this.dba.statements.populate_jzr_mirror_triples.run(parameters);
          } catch (error1) {
            cause = error1;
            fields_rpr = rpr(this.dba.state.most_recent_inserted_row);
            throw new Error(`Ωjzrsdb__51 when trying to insert this row: ${fields_rpr}, an error was thrown: ${cause.message}`, {cause});
          }
        }
        //.......................................................................................................
        /* TAINT move to Jzr_db_adapter together with try/catch */
        debug('Ωjzrsdb__52', 'populate_jzr_lang_hangeul_syllables');
        try {
          this.dba.statements.populate_jzr_lang_hangeul_syllables.run();
        } catch (error1) {
          cause = error1;
          fields_rpr = rpr(this.dba.state.most_recent_inserted_row);
          throw new Error(`Ωjzrsdb__53 when trying to insert this row: ${fields_rpr}, an error was thrown: ${cause.message}`, {cause});
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
        echo(grey('Ωjzrsdb__54'), gold(reverse(bold(query))));
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
        echo(grey('Ωjzrsdb__55'), gold(reverse(bold(query))));
        counts = (this.dba.prepare(query)).all();
        return console.table(counts);
      })();
      (() => {        //.......................................................................................................
        var count, counts, dskey, query;
        query = SQL`select dskey, count(*) as count from jzr_mirror_lines group by dskey union all
select '*',   count(*) as count from jzr_mirror_lines
order by count desc;`;
        echo(grey('Ωjzrsdb__56'), gold(reverse(bold(query))));
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
        echo('Ωjzrsdb__57', red(reverse(bold(" found some faults: "))));
        console.table(faulty_rows);
      } else {
        echo('Ωjzrsdb__58', lime(reverse(bold(" (no faults) "))));
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsS0FBQSxFQUFBLHVCQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxFQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQSxjQUFBLEVBQUEsaUJBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLHdCQUFBLEVBQUEsS0FBQSxFQUFBLHVCQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUEscUJBQUEsRUFBQSxlQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEseUJBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUE7OztFQUdBLEdBQUEsR0FBNEIsT0FBQSxDQUFRLEtBQVI7O0VBQzVCLENBQUEsQ0FBRSxLQUFGLEVBQ0UsS0FERixFQUVFLElBRkYsRUFHRSxJQUhGLEVBSUUsS0FKRixFQUtFLE1BTEYsRUFNRSxJQU5GLEVBT0UsSUFQRixFQVFFLE9BUkYsQ0FBQSxHQVE0QixHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVIsQ0FBb0IsbUJBQXBCLENBUjVCOztFQVNBLENBQUEsQ0FBRSxHQUFGLEVBQ0UsT0FERixFQUVFLElBRkYsRUFHRSxLQUhGLEVBSUUsS0FKRixFQUtFLElBTEYsRUFN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RUFGRjtPQUFBLE1BQUE7UUFJRSxJQUFBLENBQUssYUFBTCxFQUFvQixJQUFBLENBQUssT0FBQSxDQUFRLElBQUEsQ0FBSyxlQUFMLENBQVIsQ0FBTCxDQUFwQixFQUpGO09BQUo7O2FBTUs7SUFQbUI7O0VBbkZ4QixFQTUxQ0E7OztFQTA3Q0EsTUFBTSxDQUFDLE9BQVAsR0FBb0IsQ0FBQSxDQUFBLENBQUEsR0FBQTtBQUNwQixRQUFBO0lBQUUsU0FBQSxHQUFZLENBQ1YsY0FEVSxFQUVWLHVCQUZVLEVBR1Ysd0JBSFUsRUFJVixpQkFKVSxFQUtWLHFCQUxVO0FBTVosV0FBTyxDQUNMLE1BREssRUFFTCxTQUZLO0VBUFcsQ0FBQSxJQTE3Q3BCOzs7RUFzOENBLElBQUcsTUFBQSxLQUFVLE9BQU8sQ0FBQyxJQUFyQjtJQUFrQyxDQUFBLENBQUEsQ0FBQSxHQUFBO0FBQ2xDLFVBQUE7TUFBRSxHQUFBLEdBQU0sSUFBSSxNQUFKLENBQUEsRUFBUjthQUNHO0lBRitCLENBQUEsSUFBbEM7O0FBdDhDQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCdcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5HVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xueyBhbGVydFxuICBkZWJ1Z1xuICBoZWxwXG4gIGluZm9cbiAgcGxhaW5cbiAgcHJhaXNlXG4gIHVyZ2VcbiAgd2FyblxuICB3aGlzcGVyIH0gICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ2ppenVyYS1zb3VyY2VzLWRiJ1xueyBycHJcbiAgaW5zcGVjdFxuICBlY2hvXG4gIHdoaXRlXG4gIGdyZWVuXG4gIGJsdWVcbiAgbGltZVxuICBnb2xkXG4gIGdyZXlcbiAgcmVkXG4gIGJvbGRcbiAgcmV2ZXJzZVxuICBsb2cgICAgIH0gICAgICAgICAgICAgICA9IEdVWS50cm1cbiMgeyBmIH0gICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9lZmZzdHJpbmcnXG4jIHdyaXRlICAgICAgICAgICAgICAgICAgICAgPSAoIHAgKSAtPiBwcm9jZXNzLnN0ZG91dC53cml0ZSBwXG4jIHsgbmZhIH0gICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvbm9ybWFsaXplLWZ1bmN0aW9uLWFyZ3VtZW50cydcbiMgR1RORyAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ndXktdGVzdC1ORydcbiMgeyBUZXN0ICAgICAgICAgICAgICAgICAgfSA9IEdUTkdcbkZTICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOmZzJ1xuUEFUSCAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6cGF0aCdcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQnNxbDMgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2JldHRlci1zcWxpdGUzJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5TRk1PRFVMRVMgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2JyaWNhYnJhYy1zZm1vZHVsZXMnXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgRGJyaWMsXG4gIERicmljX3N0ZCxcbiAgU1FMLFxuICBmcm9tX2Jvb2wsXG4gIGFzX2Jvb2wsICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZGJyaWMoKVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IGxldHMsXG4gIGZyZWV6ZSwgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfbGV0c2ZyZWV6ZXRoYXRfaW5mcmEoKS5zaW1wbGVcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBKZXRzdHJlYW0sXG4gIEFzeW5jX2pldHN0cmVhbSwgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfamV0c3RyZWFtKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBCZW5jaG1hcmtlciwgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2JlbmNobWFya2luZygpXG5iZW5jaG1hcmtlciAgICAgICAgICAgICAgICAgICA9IG5ldyBCZW5jaG1hcmtlcigpXG50aW1laXQgICAgICAgICAgICAgICAgICAgICAgICA9ICggUC4uLiApIC0+IGJlbmNobWFya2VyLnRpbWVpdCBQLi4uXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgc2V0X2dldHRlciwgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9tYW5hZ2VkX3Byb3BlcnR5X3Rvb2xzKClcbnsgSURMLCBJRExYLCAgICAgICAgICAgIH0gPSByZXF1aXJlICdtb2ppa3VyYS1pZGwnXG57IHR5cGVfb2YsICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfdHlwZV9vZigpXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5kZW1vX3NvdXJjZV9pZGVudGlmaWVycyA9IC0+XG4gIHsgZXhwYW5kX2RpY3Rpb25hcnksICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2RpY3Rpb25hcnlfdG9vbHMoKVxuICB7IGdldF9sb2NhbF9kZXN0aW5hdGlvbnMsIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9nZXRfbG9jYWxfZGVzdGluYXRpb25zKClcbiAgZm9yIGtleSwgdmFsdWUgb2YgZ2V0X2xvY2FsX2Rlc3RpbmF0aW9ucygpXG4gICAgZGVidWcgJ86panpyc2RiX19fMScsIGtleSwgdmFsdWVcbiAgIyBjYW4gYXBwZW5kIGxpbmUgbnVtYmVycyB0byBmaWxlcyBhcyBpbjpcbiAgIyAnZHM6ZGljdDptZWFuaW5ncy4xOkw9MTMzMzInXG4gICMgJ2RzOmRpY3Q6dWNkMTQwLjE6dWhkaWR4Okw9MTIzNCdcbiAgIyByb3dpZHM6ICd0OmpmbTpSPTEnXG4gICMge1xuICAjICAgJ2RzOmRpY3Q6bWVhbmluZ3MnOiAgICAgICAgICAnJGp6cmRzL21lYW5pbmcvbWVhbmluZ3MudHh0J1xuICAjICAgJ2RzOmRpY3Q6dWNkOnYxNC4wOnVoZGlkeCcgOiAnJGp6cmRzL3VuaWNvZGUub3JnLXVjZC12MTQuMC9VbmloYW5fRGljdGlvbmFyeUluZGljZXMudHh0J1xuICAjICAgfVxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMjI1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgLiAgIG9vb29cbiAgICAgICAgICAgICAgICAgICAgICAgLm84ICAgYDg4OFxub28ub29vb28uICAgLm9vb28uICAgLm84ODhvbyAgODg4IC5vby4gICAgLm9vb28ub1xuIDg4OCcgYDg4YiBgUCAgKTg4YiAgICA4ODggICAgODg4UFwiWTg4YiAgZDg4KCAgXCI4XG4gODg4ICAgODg4ICAub1BcIjg4OCAgICA4ODggICAgODg4ICAgODg4ICBgXCJZODhiLlxuIDg4OCAgIDg4OCBkOCggIDg4OCAgICA4ODggLiAgODg4ICAgODg4ICBvLiAgKTg4YlxuIDg4OGJvZDhQJyBgWTg4OFwiXCI4byAgIFwiODg4XCIgbzg4OG8gbzg4OG8gOFwiXCI4ODhQJ1xuIDg4OFxubzg4OG9cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmdldF9wYXRoc19hbmRfZm9ybWF0cyA9IC0+XG4gIHBhdGhzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0ge31cbiAgZm9ybWF0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSB7fVxuICBSICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IHsgcGF0aHMsIGZvcm1hdHMsIH1cbiAgcGF0aHMuYmFzZSAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4nXG4gIHBhdGhzLmp6ciAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5yZXNvbHZlIHBhdGhzLmJhc2UsICcuLidcbiAgcGF0aHMuZGIgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gcGF0aHMuYmFzZSwgJ2p6ci5kYidcbiAgIyBwYXRocy5kYiAgICAgICAgICAgICAgICAgICAgICAgICAgICA9ICcvZGV2L3NobS9qenIuZGInXG4gICMgcGF0aHMuanpyZHMgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gcGF0aHMuYmFzZSwgJ2p6cmRzJ1xuICBwYXRocy5qenJuZHMgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBwYXRocy5iYXNlLCAnaml6dXJhLW5ldy1kYXRhc291cmNlcydcbiAgcGF0aHMubW9qaWt1cmEgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gcGF0aHMuanpybmRzLCAnbW9qaWt1cmEnXG4gIHBhdGhzLnJhd19naXRodWIgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIHBhdGhzLmp6cm5kcywgJ2J2ZnMvb3JpZ2luL2h0dHBzL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20nXG4gIGthbmppdW0gICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIHBhdGhzLnJhd19naXRodWIsICdtaWZ1bmV0b3NoaXJvL2thbmppdW0vOGEwY2RhYTE2ZDY0YTI4MWEyMDQ4ZGUyZWVlMmVjNWUzYTQ0MGZhNidcbiAgcnV0b3BpbyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gcGF0aHMucmF3X2dpdGh1YiwgJ3J1dG9waW8vS29yZWFuLU5hbWUtSGFuamEtQ2hhcnNldC8xMmRmMWJhMWI0ZGZhYTA5NTgxM2U0ZGRmYmE0MjRlODE2Zjk0YzUzJ1xuICB1Y2QxNzAwICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBwYXRocy5qenJuZHMsICdidmZzL29yaWdpbi9odHRwcy93d3cudW5pY29kZS5vcmcvUHVibGljLzE3LjAuMC91Y2QnXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyBwYXRoc1sgJ2RzOmRpY3Q6dWNkOnYxNC4wOnVoZGlkeCcgICAgICBdICAgPSBQQVRILmpvaW4gcGF0aHMuanpybmRzLCAndW5pY29kZS5vcmctdWNkLXYxNC4wL1VuaWhhbl9EaWN0aW9uYXJ5SW5kaWNlcy50eHQnXG4gIHBhdGhzWyAnZHM6ZGljdDp4OmtvLUhhbmcrTGF0bicgICAgICAgICBdICA9IFBBVEguam9pbiBwYXRocy5qenJuZHMsICdoYW5nZXVsLXRyYW5zY3JpcHRpb25zLnRzdidcbiAgcGF0aHNbICdkczpkaWN0Ong6amEtS2FuK0xhdG4nICAgICAgICAgIF0gID0gUEFUSC5qb2luIHBhdGhzLmp6cm5kcywgJ2thbmEtdHJhbnNjcmlwdGlvbnMudHN2J1xuICBwYXRoc1sgJ2RzOmRpY3Q6YmNwNDcnICAgICAgICAgICAgICAgICAgXSAgPSBQQVRILmpvaW4gcGF0aHMuanpybmRzLCAnQkNQNDctbGFuZ3VhZ2Utc2NyaXB0cy1yZWdpb25zLnRzdidcbiAgcGF0aHNbICdkczpkaWN0OmphOmthbmppdW0nICAgICAgICAgICAgIF0gID0gUEFUSC5qb2luIGthbmppdW0sICdkYXRhL3NvdXJjZV9maWxlcy9rYW5qaWRpY3QudHh0J1xuICBwYXRoc1sgJ2RzOmRpY3Q6amE6a2Fuaml1bTphdXgnICAgICAgICAgXSAgPSBQQVRILmpvaW4ga2Fuaml1bSwgJ2RhdGEvc291cmNlX2ZpbGVzLzBfUkVBRE1FLnR4dCdcbiAgcGF0aHNbICdkczpkaWN0OmtvOlY9ZGF0YS1nb3YuY3N2JyAgICAgIF0gID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLWdvdi5jc3YnXG4gIHBhdGhzWyAnZHM6ZGljdDprbzpWPWRhdGEtZ292Lmpzb24nICAgICBdICA9IFBBVEguam9pbiBydXRvcGlvLCAnZGF0YS1nb3YuanNvbidcbiAgcGF0aHNbICdkczpkaWN0OmtvOlY9ZGF0YS1uYXZlci5jc3YnICAgIF0gID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLW5hdmVyLmNzdidcbiAgcGF0aHNbICdkczpkaWN0OmtvOlY9ZGF0YS1uYXZlci5qc29uJyAgIF0gID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLW5hdmVyLmpzb24nXG4gIHBhdGhzWyAnZHM6ZGljdDprbzpWPVJFQURNRS5tZCcgICAgICAgICBdICA9IFBBVEguam9pbiBydXRvcGlvLCAnUkVBRE1FLm1kJ1xuICBwYXRoc1sgJ2RzOmRpY3Q6bWVhbmluZ3MnICAgICAgICAgICAgICAgXSAgPSBQQVRILmpvaW4gcGF0aHMubW9qaWt1cmEsICdtZWFuaW5nL21lYW5pbmdzLnR4dCdcbiAgcGF0aHNbICdkczpzaGFwZTppZHN2MicgICAgICAgICAgICAgICAgIF0gID0gUEFUSC5qb2luIHBhdGhzLm1vamlrdXJhLCAnc2hhcGUvc2hhcGUtYnJlYWtkb3duLWZvcm11bGEtdjIudHh0J1xuICBwYXRoc1sgJ2RzOnNoYXBlOnpoejViZicgICAgICAgICAgICAgICAgXSAgPSBQQVRILmpvaW4gcGF0aHMubW9qaWt1cmEsICdzaGFwZS9zaGFwZS1zdHJva2VvcmRlci16aGF6aXd1YmlmYS50eHQnXG4gIHBhdGhzWyAnZHM6dWNkYjpyc2dzJyAgICAgICAgICAgICAgICAgICBdICA9IFBBVEguam9pbiBwYXRocy5tb2ppa3VyYSwgJ3VjZGIvY2ZnL3JzZ3MtYW5kLWJsb2Nrcy5tZCdcbiAgcGF0aHNbICdkczp1Y2Q6dWNkJyAgICAgICAgICAgICAgICAgICAgIF0gID0gUEFUSC5qb2luIHVjZDE3MDAsICdVbmljb2RlRGF0YS50eHQnXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyBmb3JtYXRzWyAnZHM6ZGljdDp1Y2Q6djE0LjA6dWhkaWR4JyAgICAgIF0gICA9ICwgJ3VuaWNvZGUub3JnLXVjZC12MTQuMC9VbmloYW5fRGljdGlvbmFyeUluZGljZXMudHh0J1xuICBmb3JtYXRzWyAnZHM6ZGljdDp4OmtvLUhhbmcrTGF0bicgICAgICAgICBdID0gJ2RzZjp0c3YnXG4gIGZvcm1hdHNbICdkczpkaWN0Ong6amEtS2FuK0xhdG4nICAgICAgICAgIF0gPSAnZHNmOnRzdidcbiAgZm9ybWF0c1sgJ2RzOmRpY3Q6YmNwNDcnICAgICAgICAgICAgICAgICAgXSA9ICdkc2Y6dHN2J1xuICBmb3JtYXRzWyAnZHM6ZGljdDpqYTprYW5qaXVtJyAgICAgICAgICAgICBdID0gJ2RzZjp0eHQnXG4gIGZvcm1hdHNbICdkczpkaWN0OmphOmthbmppdW06YXV4JyAgICAgICAgIF0gPSAnZHNmOnR4dCdcbiAgZm9ybWF0c1sgJ2RzOmRpY3Q6a286Vj1kYXRhLWdvdi5jc3YnICAgICAgXSA9ICdkc2Y6Y3N2J1xuICBmb3JtYXRzWyAnZHM6ZGljdDprbzpWPWRhdGEtZ292Lmpzb24nICAgICBdID0gJ2RzZjpqc29uJ1xuICBmb3JtYXRzWyAnZHM6ZGljdDprbzpWPWRhdGEtbmF2ZXIuY3N2JyAgICBdID0gJ2RzZjpjc3YnXG4gIGZvcm1hdHNbICdkczpkaWN0OmtvOlY9ZGF0YS1uYXZlci5qc29uJyAgIF0gPSAnZHNmOmpzb24nXG4gIGZvcm1hdHNbICdkczpkaWN0OmtvOlY9UkVBRE1FLm1kJyAgICAgICAgIF0gPSAnZHNmOm1kJ1xuICBmb3JtYXRzWyAnZHM6ZGljdDptZWFuaW5ncycgICAgICAgICAgICAgICBdID0gJ2RzZjp0c3YnXG4gIGZvcm1hdHNbICdkczpzaGFwZTppZHN2MicgICAgICAgICAgICAgICAgIF0gPSAnZHNmOnRzdidcbiAgZm9ybWF0c1sgJ2RzOnNoYXBlOnpoejViZicgICAgICAgICAgICAgICAgXSA9ICdkc2Y6dHN2J1xuICBmb3JtYXRzWyAnZHM6dWNkYjpyc2dzJyAgICAgICAgICAgICAgICAgICBdID0gJ2RzZjptZDp0YWJsZSdcbiAgZm9ybWF0c1sgJ2RzOnVjZDp1Y2QnICAgICAgICAgICAgICAgICAgICAgXSA9ICdkc2Y6c2VtaWNvbG9ucydcbiAgcmV0dXJuIFJcblxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgSnpyX2RiX2FkYXB0ZXIgZXh0ZW5kcyBEYnJpY19zdGRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBkYl9jbGFzczogIEJzcWwzXG4gIEBwcmVmaXg6ICAgICdqenInXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogKCBkYl9wYXRoLCBjZmcgPSB7fSApIC0+XG4gICAgIyMjIFRBSU5UIG5lZWQgbW9yZSBjbGFyaXR5IGFib3V0IHdoZW4gc3RhdGVtZW50cywgYnVpbGQsIGluaXRpYWxpemUuLi4gaXMgcGVyZm9ybWVkICMjI1xuICAgIHsgaG9zdCwgfSA9IGNmZ1xuICAgIGNmZyAgICAgICA9IGxldHMgY2ZnLCAoIGNmZyApIC0+IGRlbGV0ZSBjZmcuaG9zdFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc3VwZXIgZGJfcGF0aCwgY2ZnXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBAaG9zdCAgID0gaG9zdFxuICAgIEBzdGF0ZSAgPSB7IHRyaXBsZV9jb3VudDogMCwgbW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93OiBudWxsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRvID0+XG4gICAgICAjIyMgVEFJTlQgdGhpcyBpcyBub3Qgd2VsbCBwbGFjZWQgIyMjXG4gICAgICAjIyMgTk9URSBleGVjdXRlIGEgR2Fwcy1hbmQtSXNsYW5kcyBFU1NGUkkgdG8gaW1wcm92ZSBzdHJ1Y3R1cmFsIGludGVncml0eSBhc3N1cmFuY2U6ICMjI1xuICAgICAgIyAoIEBwcmVwYXJlIFNRTFwic2VsZWN0ICogZnJvbSBfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMgd2hlcmUgZmFsc2U7XCIgKS5nZXQoKVxuICAgICAgbWVzc2FnZXMgPSBbXVxuICAgICAgZm9yIHsgbmFtZSwgdHlwZSwgfSBmcm9tIEBzdGF0ZW1lbnRzLnN0ZF9nZXRfcmVsYXRpb25zLml0ZXJhdGUoKVxuICAgICAgICB0cnlcbiAgICAgICAgICAoIEBwcmVwYXJlIFNRTFwic2VsZWN0ICogZnJvbSAje25hbWV9IHdoZXJlIGZhbHNlO1wiICkuYWxsKClcbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICBtZXNzYWdlcy5wdXNoIFwiI3t0eXBlfSAje25hbWV9OiAje2Vycm9yLm1lc3NhZ2V9XCJcbiAgICAgICAgICB3YXJuICfOqWp6cnNkYl9fXzInLCBlcnJvci5tZXNzYWdlXG4gICAgICByZXR1cm4gbnVsbCBpZiBtZXNzYWdlcy5sZW5ndGggaXMgMFxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfX18zIEVGRlJJIHRlc3RpbmcgcmV2ZWFsZWQgZXJyb3JzOiAje3JwciBtZXNzYWdlc31cIlxuICAgICAgO251bGxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIEBpc19mcmVzaFxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlX2Zvcm1hdHMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlcygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl92ZXJicygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9sY29kZXMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGluZXMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9nbHlwaHJhbmdlcygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX2dseXBocygpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzZXRfZ2V0dGVyIEA6OiwgJ25leHRfdHJpcGxlX3Jvd2lkJywgLT4gXCJ0Om1yOjNwbDpSPSN7KytAc3RhdGUudHJpcGxlX2NvdW50fVwiXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAjIyNcblxuICAgLm84ICAgICAgICAgICAgICAgICAgICBvOG8gIG9vb28gICAgICAgIC5vOFxuICBcIjg4OCAgICAgICAgICAgICAgICAgICAgYFwiJyAgYDg4OCAgICAgICBcIjg4OFxuICAgODg4b29vby4gIG9vb28gIG9vb28gIG9vb28gICA4ODggICAub29vbzg4OFxuICAgZDg4JyBgODhiIGA4ODggIGA4ODggIGA4ODggICA4ODggIGQ4OCcgYDg4OFxuICAgODg4ICAgODg4ICA4ODggICA4ODggICA4ODggICA4ODggIDg4OCAgIDg4OFxuICAgODg4ICAgODg4ICA4ODggICA4ODggICA4ODggICA4ODggIDg4OCAgIDg4OFxuICAgYFk4Ym9kOFAnICBgVjg4VlwiVjhQJyBvODg4byBvODg4byBgWThib2Q4OFBcIlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBAYnVpbGQ6IFtcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl91cm5zIChcbiAgICAgICAgdXJuICAgICB0ZXh0ICAgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgY29tbWVudCB0ZXh0ICAgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggdXJuICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X19fNFwiIGNoZWNrICggdXJuIHJlZ2V4cCAnXltcXFxcLVxcXFwrXFxcXC46YS16QS1aMC05XSskJyApIClcbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9nbHlwaHJhbmdlcyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoICd0OnVjOnJzZzpWPScgfHwgcnNnICksXG4gICAgICAgIHJzZyAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGlzX2NqayAgICBib29sZWFuICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxvICAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGhpICAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIC0tIGxvX2dseXBoICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGp6cl9jaHJfZnJvbV9jaWQoIGxvICkgKSBzdG9yZWQsXG4gICAgICAgIC0tIGhpX2dseXBoICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGp6cl9jaHJfZnJvbV9jaWQoIGhpICkgKSBzdG9yZWQsXG4gICAgICAgIG5hbWUgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAtLSBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X19fNVwiIGNoZWNrICggbG8gYmV0d2VlbiAweDAwMDAwMCBhbmQgMHgxMGZmZmYgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfX182XCIgY2hlY2sgKCBoaSBiZXR3ZWVuIDB4MDAwMDAwIGFuZCAweDEwZmZmZiApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fXzdcIiBjaGVjayAoIGxvIDw9IGhpICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X19fOFwiIGNoZWNrICggcm93aWQgcmVnZXhwICdeLiokJyApXG4gICAgICApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2dseXBocyAoXG4gICAgICAgICAgY2lkICAgICBpbnRlZ2VyIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgICAgcnNnICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgICAgY2lkX2hleCB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGp6cl9hc19oZXgoIGNpZCApICkgc3RvcmVkLFxuICAgICAgICAgIGdseXBoICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICAgIGlzX2NqayAgYm9vbGVhbiAgICAgICAgIG5vdCBudWxsLCAtLSBnZW5lcmF0ZWQgYWx3YXlzIGFzICgganpyX2lzX2Nqa19nbHlwaCggZ2x5cGggKSApIHN0b3JlZCxcbiAgICAgICAgcHJpbWFyeSBrZXkgKCBjaWQgKSxcbiAgICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fXzlcIiBmb3JlaWduIGtleSAoIHJzZyApIHJlZmVyZW5jZXMganpyX2dseXBocmFuZ2VzICggcnNnIClcbiAgICAgICk7XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdHJpZ2dlciBqenJfZ2x5cGhzX2luc2VydFxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfZ2x5cGhzXG4gICAgICBmb3IgZWFjaCByb3cgYmVnaW5cbiAgICAgICAgc2VsZWN0IGp6cl90cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfZ2x5cGhzJyxcbiAgICAgICAgICAnY2lkOicsIG5ldy5jaWQsICdyc2c6JywgbmV3LnJzZyApO1xuICAgICAgICBlbmQ7XCJcIlwiXG5cbiAgICAjICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfY2prX2dseXBocmFuZ2VzIGFzXG4gICAgIyAgIHNlbGVjdFxuICAgICMgICAgICAgKlxuICAgICMgICAgIGZyb20ganpyX2dseXBocmFuZ2VzXG4gICAgIyAgICAgd2hlcmUgaXNfY2prXG4gICAgIyAgICAgb3JkZXIgYnkgbG87XCJcIlwiXG5cbiAgICAjICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfY2prX2dseXBocyBhc1xuICAgICMgICBzZWxlY3RcbiAgICAjICAgICAgIGdyLnJzZyAgICBhcyByc2csXG4gICAgIyAgICAgICBncy52YWx1ZSAgYXMgY2lkLFxuICAgICMgICAgICAganpyX2Nocl9mcm9tX2NpZCggZ3MudmFsdWUgKSAgYXMgZ2x5cGhcbiAgICAjICAgICBmcm9tIGp6cl9jamtfZ2x5cGhyYW5nZXMgICAgICAgICAgICAgICAgICAgIGFzIGdyXG4gICAgIyAgICAgam9pbiBzdGRfZ2VuZXJhdGVfc2VyaWVzKCBnci5sbywgZ3IuaGksIDEgKSBhcyBnc1xuICAgICMgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9nbHlwaHNldHMgKFxuICAgICAgICByb3dpZCAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIG5hbWUgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgZ2x5cGhyYW5nZSAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTBcIiBmb3JlaWduIGtleSAoIGdseXBocmFuZ2UgKSByZWZlcmVuY2VzIGp6cl9nbHlwaHJhbmdlcyAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18xMVwiIGNoZWNrICggcm93aWQgcmVnZXhwICdeLiokJyApXG4gICAgICApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2RhdGFzb3VyY2VfZm9ybWF0cyAoXG4gICAgICAgIGZvcm1hdCAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGNvbW1lbnQgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIGZvcm1hdCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTJcIiBjaGVjayAoIGZvcm1hdCByZWdleHAgJ15kc2Y6W1xcXFwtXFxcXCtcXFxcLjphLXpBLVowLTldKyQnIClcbiAgICAgICk7XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdHJpZ2dlciBqenJfZGF0YXNvdXJjZV9mb3JtYXRzX2luc2VydFxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfZGF0YXNvdXJjZV9mb3JtYXRzXG4gICAgICBmb3IgZWFjaCByb3cgYmVnaW5cbiAgICAgICAgc2VsZWN0IGp6cl90cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfZGF0YXNvdXJjZV9mb3JtYXRzJyxcbiAgICAgICAgICAnZm9ybWF0OicsIG5ldy5mb3JtYXQsICdjb21tZW50OicsIG5ldy5jb21tZW50ICk7XG4gICAgICAgIGluc2VydCBpbnRvIGp6cl91cm5zICggdXJuLCBjb21tZW50ICkgdmFsdWVzICggbmV3LmZvcm1hdCwgbmV3LmNvbW1lbnQgKTtcbiAgICAgICAgZW5kO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2RhdGFzb3VyY2VzIChcbiAgICAgICAgZHNrZXkgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgZm9ybWF0ICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgcGF0aCAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggZHNrZXkgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzEzXCIgZm9yZWlnbiBrZXkgKCBmb3JtYXQgKSByZWZlcmVuY2VzIGp6cl9kYXRhc291cmNlX2Zvcm1hdHMgKCBmb3JtYXQgKVxuICAgICAgKTtcIlwiXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9kYXRhc291cmNlc19pbnNlcnRcbiAgICAgIGJlZm9yZSBpbnNlcnQgb24ganpyX2RhdGFzb3VyY2VzXG4gICAgICBmb3IgZWFjaCByb3cgYmVnaW5cbiAgICAgICAgc2VsZWN0IGp6cl90cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfZGF0YXNvdXJjZXMnLFxuICAgICAgICAgICdkc2tleTonLCBuZXcuZHNrZXksICdmb3JtYXQ6JywgbmV3LmZvcm1hdCwgJ3BhdGg6JywgbmV3LnBhdGggKTtcbiAgICAgICAgaW5zZXJ0IGludG8ganpyX3VybnMgKCB1cm4sIGNvbW1lbnQgKSB2YWx1ZXMgKCBuZXcuZHNrZXksICdmb3JtYXQ6ICcgfHwgbmV3LmZvcm1hdCB8fCAnLCBwYXRoOiAnIHx8IG5ldy5wYXRoICk7XG4gICAgICAgIGVuZDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfbGNvZGVzIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgbGNvZGUgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgY29tbWVudCAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzE0XCIgY2hlY2sgKCBsY29kZSByZWdleHAgJ15bYS16QS1aXStbYS16QS1aMC05XSokJyApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTVcIiBjaGVjayAoIHJvd2lkID0gJ3Q6bXI6bGM6Vj0nIHx8IGxjb2RlICkgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfbGluZXMgKFxuICAgICAgICAtLSAndDpqZm06J1xuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsIGdlbmVyYXRlZCBhbHdheXMgYXMgKCAndDptcjpsbjpkcz0nIHx8IGRza2V5IHx8ICc6TD0nIHx8IGxpbmVfbnIgKSBzdG9yZWQsXG4gICAgICAgIHJlZiAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoICAgICAgICAgICAgICAgICAgZHNrZXkgfHwgJzpMPScgfHwgbGluZV9uciApIHZpcnR1YWwsXG4gICAgICAgIGRza2V5ICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmVfbnIgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxjb2RlICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmUgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGpmaWVsZHMgICBqc29uICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAtLSBwcmltYXJ5IGtleSAoIHJvd2lkICksICAgICAgICAgICAgICAgICAgICAgICAgICAgLS0gIyMjIE5PVEUgRXhwZXJpbWVudGFsOiBubyBleHBsaWNpdCBQSywgaW5zdGVhZCBnZW5lcmF0ZWQgYHJvd2lkYCBjb2x1bW5cbiAgICAgIC0tIGNoZWNrICggcm93aWQgcmVnZXhwICdedDptcjpsbjpkcz0uKzpMPVxcXFxkKyQnKSwgIC0tICMjIyBOT1RFIG5vIG5lZWQgdG8gY2hlY2sgYXMgdmFsdWUgaXMgZ2VuZXJhdGVkICMjI1xuICAgICAgdW5pcXVlICggZHNrZXksIGxpbmVfbnIgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzE2XCIgZm9yZWlnbiBrZXkgKCBsY29kZSApIHJlZmVyZW5jZXMganpyX21pcnJvcl9sY29kZXMgKCBsY29kZSApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX3ZlcmJzIChcbiAgICAgICAgcmFuayAgICAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCBkZWZhdWx0IDEsXG4gICAgICAgIHMgICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHYgICAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIG8gICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHYgKSxcbiAgICAgIC0tIGNoZWNrICggcm93aWQgcmVnZXhwICdedDptcjp2YjpWPVtcXFxcLTpcXFxcK1xcXFxwe0x9XSskJyApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTdcIiBjaGVjayAoIHJhbmsgPiAwICkgKTtcIlwiXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9taXJyb3JfdmVyYnNfaW5zZXJ0XG4gICAgICBiZWZvcmUgaW5zZXJ0IG9uIGp6cl9taXJyb3JfdmVyYnNcbiAgICAgIGZvciBlYWNoIHJvdyBiZWdpblxuICAgICAgICBzZWxlY3QganpyX3RyaWdnZXJfb25fYmVmb3JlX2luc2VydCggJ2p6cl9taXJyb3JfdmVyYnMnLFxuICAgICAgICAgICdyYW5rOicsIG5ldy5yYW5rLCAnczonLCBuZXcucywgJ3Y6JywgbmV3LnYsICdvOicsIG5ldy5vICk7XG4gICAgICAgIGluc2VydCBpbnRvIGp6cl91cm5zICggdXJuLCBjb21tZW50ICkgdmFsdWVzICggbmV3LnYsICdzOiAnIHx8IG5ldy5zIHx8ICcsIG86ICcgfHwgbmV3Lm8gKTtcbiAgICAgICAgZW5kO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByZWYgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBzICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICB2ICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBvICAgICAgICAganNvbiAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMThcIiBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bXI6M3BsOlI9XFxcXGQrJCcgKSxcbiAgICAgIC0tIHVuaXF1ZSAoIHJlZiwgcywgdiwgbyApXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18xOVwiIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xpbmVzICggcm93aWQgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzIwXCIgZm9yZWlnbiBrZXkgKCB2ICAgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfdmVyYnMgKCB2IClcbiAgICAgICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9taXJyb3JfdHJpcGxlc19yZWdpc3RlclxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZVxuICAgICAgZm9yIGVhY2ggcm93IGJlZ2luXG4gICAgICAgIHNlbGVjdCBqenJfdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0KCAnanpyX21pcnJvcl90cmlwbGVzX2Jhc2UnLFxuICAgICAgICAgICdyb3dpZDonLCBuZXcucm93aWQsICdyZWY6JywgbmV3LnJlZiwgJ3M6JywgbmV3LnMsICd2OicsIG5ldy52LCAnbzonLCBuZXcubyApO1xuICAgICAgICBlbmQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyAoXG4gICAgICAgIHJvd2lkICAgICAgICAgICB0ZXh0ICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByZWYgICAgICAgICAgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgc3lsbGFibGVfaGFuZyAgIHRleHQgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHN5bGxhYmxlX2xhdG4gICB0ZXh0ICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggaW5pdGlhbF9sYXRuIHx8IG1lZGlhbF9sYXRuIHx8IGZpbmFsX2xhdG4gKSB2aXJ0dWFsLFxuICAgICAgICAtLSBzeWxsYWJsZV9sYXRuICAgdGV4dCAgdW5pcXVlICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggaW5pdGlhbF9sYXRuIHx8IG1lZGlhbF9sYXRuIHx8IGZpbmFsX2xhdG4gKSB2aXJ0dWFsLFxuICAgICAgICBpbml0aWFsX2hhbmcgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbWVkaWFsX2hhbmcgICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpbmFsX2hhbmcgICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBpbml0aWFsX2xhdG4gICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbWVkaWFsX2xhdG4gICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpbmFsX2xhdG4gICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjFcIiBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bGFuZzpoYW5nOnN5bDpWPVxcXFxTKyQnIClcbiAgICAgIC0tIHVuaXF1ZSAoIHJlZiwgcywgdiwgbyApXG4gICAgICAtLSBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18yMlwiIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xpbmVzICggcm93aWQgKVxuICAgICAgLS0gY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjNcIiBmb3JlaWduIGtleSAoIHN5bGxhYmxlX2hhbmcgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICggbyApIClcbiAgICAgICk7XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdHJpZ2dlciBqenJfbGFuZ19oYW5nX3N5bGxhYmxlc19yZWdpc3RlclxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfbGFuZ19oYW5nX3N5bGxhYmxlc1xuICAgICAgZm9yIGVhY2ggcm93IGJlZ2luXG4gICAgICAgIHNlbGVjdCBqenJfdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0KCAnanpyX2xhbmdfaGFuZ19zeWxsYWJsZXMnLFxuICAgICAgICAgIG5ldy5yb3dpZCwgbmV3LnJlZiwgbmV3LnN5bGxhYmxlX2hhbmcsIG5ldy5zeWxsYWJsZV9sYXRuLFxuICAgICAgICAgICAgbmV3LmluaXRpYWxfaGFuZywgbmV3Lm1lZGlhbF9oYW5nLCBuZXcuZmluYWxfaGFuZyxcbiAgICAgICAgICAgIG5ldy5pbml0aWFsX2xhdG4sIG5ldy5tZWRpYWxfbGF0biwgbmV3LmZpbmFsX2xhdG4gKTtcbiAgICAgICAgZW5kO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzIGFzXG4gICAgICBzZWxlY3QgbnVsbCBhcyByb3dpZCwgbnVsbCBhcyByZWYsIG51bGwgYXMgcywgbnVsbCBhcyB2LCBudWxsIGFzIG8gd2hlcmUgZmFsc2UgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAndjpjOnJlYWRpbmc6a28tTGF0bicsICAgICAgICAgIHN5bGxhYmxlX2xhdG4gICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICd2OmM6cmVhZGluZzprby1MYXRuOmluaXRpYWwnLCAgaW5pdGlhbF9sYXRuICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ3Y6YzpyZWFkaW5nOmtvLUxhdG46bWVkaWFsJywgICBtZWRpYWxfbGF0biAgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAndjpjOnJlYWRpbmc6a28tTGF0bjpmaW5hbCcsICAgIGZpbmFsX2xhdG4gICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICd2OmM6cmVhZGluZzprby1IYW5nOmluaXRpYWwnLCAgaW5pdGlhbF9oYW5nICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ3Y6YzpyZWFkaW5nOmtvLUhhbmc6bWVkaWFsJywgICBtZWRpYWxfaGFuZyAgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAndjpjOnJlYWRpbmc6a28tSGFuZzpmaW5hbCcsICAgIGZpbmFsX2hhbmcgICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2FsbF90cmlwbGVzIGFzXG4gICAgIyAgIHNlbGVjdCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyBzLCBudWxsIGFzIHYsIG51bGwgYXMgbyB3aGVyZSBmYWxzZSB1bmlvbiBhbGxcbiAgICAjICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyAgIHNlbGVjdCAqIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgdW5pb24gYWxsXG4gICAgIyAgIHNlbGVjdCAqIGZyb20ganpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlcyB1bmlvbiBhbGxcbiAgICAjICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyAgIHNlbGVjdCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsIHdoZXJlIGZhbHNlXG4gICAgIyAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyByYW5rLCBudWxsIGFzIHMsIG51bGwgYXMgdiwgbnVsbCBhcyBvIHdoZXJlIGZhbHNlXG4gICAgICAtLSAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHRiMS5yb3dpZCwgdGIxLnJlZiwgdmIxLnJhbmssIHRiMS5zLCB0YjEudiwgdGIxLm8gZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0YjFcbiAgICAgIGpvaW4ganpyX21pcnJvcl92ZXJicyBhcyB2YjEgdXNpbmcgKCB2IClcbiAgICAgIHdoZXJlIHZiMS52IGxpa2UgJ3Y6YzolJ1xuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCB0YjIucm93aWQsIHRiMi5yZWYsIHZiMi5yYW5rLCB0YjIucywga3Iudiwga3IubyBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHRiMlxuICAgICAgam9pbiBqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzIGFzIGtyIG9uICggdGIyLnYgPSAndjpjOnJlYWRpbmc6a28tSGFuZycgYW5kIHRiMi5vID0ga3IucyApXG4gICAgICBqb2luIGp6cl9taXJyb3JfdmVyYnMgYXMgdmIyIG9uICgga3IudiA9IHZiMi52IClcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgb3JkZXIgYnkgcywgdiwgb1xuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfdG9wX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdCAqIGZyb20ganpyX3RyaXBsZXNcbiAgICAgIHdoZXJlIHJhbmsgPSAxXG4gICAgICBvcmRlciBieSBzLCB2LCBvXG4gICAgICA7XCJcIlwiXG5cbiAgICAjICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgIyBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2Zvcm11bGFzIChcbiAgICAjICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICMgICAgIHJlZiAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgIyAgICAgZ2x5cGggICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAjICAgICBmb3JtdWxhICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuXG4gICAgIyAgICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfY29tcG9uZW50cyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHJlZiAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxldmVsICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxuciAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHJuciAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGdseXBoICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGNvbXBvbmVudCB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18yNFwiIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18yNVwiIGNoZWNrICggKCBsZW5ndGgoIGdseXBoICAgICApID0gMSApIG9yICggZ2x5cGggICAgICByZWdleHAgJ14mW1xcXFwtYS16MC05X10rI1swLTlhLWZdezQsNn07JCcgKSApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjZcIiBjaGVjayAoICggbGVuZ3RoKCBjb21wb25lbnQgKSA9IDEgKSBvciAoIGNvbXBvbmVudCAgcmVnZXhwICdeJltcXFxcLWEtejAtOV9dKyNbMC05YS1mXXs0LDZ9OyQnICkgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzI3XCIgY2hlY2sgKCByb3dpZCByZWdleHAgJ14uKiQnIClcbiAgICAgICk7XCJcIlwiXG5cblxuICAgICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgIyMjXG5cbiAgICAgIC5vICAubzg4by4gICAgICAgICAgICAgICAgICAgICAgIG9vb28gICAgICAuICAgICAgICAgICAgby5cbiAgICAgLjgnICA4ODggYFwiICAgICAgICAgICAgICAgICAgICAgICBgODg4ICAgIC5vOCAgICAgICAgICAgIGA4LlxuICAgIC44JyAgbzg4OG9vICAgLm9vb28uICAgb29vbyAgb29vbyAgIDg4OCAgLm84ODhvbyAgLm9vb28ubyAgYDguXG4gICAgODggICAgODg4ICAgIGBQICApODhiICBgODg4ICBgODg4ICAgODg4ICAgIDg4OCAgIGQ4OCggIFwiOCAgIDg4XG4gICAgODggICAgODg4ICAgICAub1BcIjg4OCAgIDg4OCAgIDg4OCAgIDg4OCAgICA4ODggICBgXCJZODhiLiAgICA4OFxuICAgIGA4LiAgIDg4OCAgICBkOCggIDg4OCAgIDg4OCAgIDg4OCAgIDg4OCAgICA4ODggLiBvLiAgKTg4YiAgLjgnXG4gICAgIGA4LiBvODg4byAgIGBZODg4XCJcIjhvICBgVjg4VlwiVjhQJyBvODg4byAgIFwiODg4XCIgOFwiXCI4ODhQJyAuOCdcbiAgICAgIGBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV91Y19ub3JtYWxpemF0aW9uX2ZhdWx0cyBhcyBzZWxlY3RcbiAgICAgICAgbWwucm93aWQgIGFzIHJvd2lkLFxuICAgICAgICBtbC5yZWYgICAgYXMgcmVmLFxuICAgICAgICBtbC5saW5lICAgYXMgbGluZVxuICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzIGFzIG1sXG4gICAgICB3aGVyZSB0cnVlXG4gICAgICAgIGFuZCAoIG5vdCBzdGRfaXNfdWNfbm9ybWFsKCBtbC5saW5lICkgKVxuICAgICAgb3JkZXIgYnkgbWwucm93aWQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV9rcl9yZWFkaW5nc191bmtub3duX3ZlcmJfZmF1bHRzIGFzIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIGNvdW50KCopIG92ZXIgKCBwYXJ0aXRpb24gYnkgdiApICAgIGFzIGNvdW50LFxuICAgICAgICAgICdqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzOlI9KicgIGFzIHJvd2lkLFxuICAgICAgICAgICcqJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAndW5rbm93bi12ZXJiJyAgICAgICAgICAgICAgICAgICAgICBhcyBkZXNjcmlwdGlvbixcbiAgICAgICAgICB2ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBxdW90ZVxuICAgICAgICBmcm9tIGp6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXMgYXMgbm5cbiAgICAgICAgd2hlcmUgbm90IGV4aXN0cyAoIHNlbGVjdCAxIGZyb20ganpyX21pcnJvcl92ZXJicyBhcyB2YiB3aGVyZSB2Yi52ID0gbm4udiApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBfanpyX21ldGFfZXJyb3JfdmVyYl9mYXVsdHMgYXMgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgY291bnQoKikgb3ZlciAoIHBhcnRpdGlvbiBieSB2ICkgICAgYXMgY291bnQsXG4gICAgICAgICAgJ2Vycm9yOlI9KicgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgICAgcm93aWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICdlcnJvci12ZXJiJyAgICAgICAgICAgICAgICAgICAgICAgIGFzIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICd2OicgfHwgdiB8fCAnLCBvOicgfHwgbyAgICAgICAgICAgIGFzIHF1b3RlXG4gICAgICAgIGZyb20ganpyX3RyaXBsZXMgYXMgbm5cbiAgICAgICAgd2hlcmUgdiBsaWtlICclOmVycm9yJztcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcgX2p6cl9tZXRhX21pcnJvcl9saW5lc193aGl0ZXNwYWNlX2ZhdWx0cyBhcyBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICAxICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBjb3VudCxcbiAgICAgICAgICAndDptcjpsbjpqZmllbGRzOndzOlI9KicgICAgICAgICAgICAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgICBtbC5yb3dpZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgJ2V4dHJhbmVvdXMtd2hpdGVzcGFjZScgICAgICAgICAgICAgICAgICAgICAgYXMgZGVzY3JpcHRpb24sXG4gICAgICAgICAgbWwuamZpZWxkcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcXVvdGVcbiAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzIGFzIG1sXG4gICAgICAgIHdoZXJlICgganpyX2hhc19wZXJpcGhlcmFsX3dzX2luX2pmaWVsZCggamZpZWxkcyApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV9taXJyb3JfbGluZXNfd2l0aF9lcnJvcnMgYXMgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgMSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgY291bnQsXG4gICAgICAgICAgJ3Q6bXI6bG46amZpZWxkczp3czpSPSonICAgICAgICAgICAgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgICAgbWwucm93aWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICdlcnJvcicgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGRlc2NyaXB0aW9uLFxuICAgICAgICAgIG1sLmxpbmUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHF1b3RlXG4gICAgICAgIGZyb20ganpyX21pcnJvcl9saW5lcyBhcyBtbFxuICAgICAgICB3aGVyZSAoIG1sLmxjb2RlID0gJ0UnICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9tZXRhX2ZhdWx0cyBhc1xuICAgICAgc2VsZWN0IG51bGwgYXMgY291bnQsIG51bGwgYXMgcm93aWQsIG51bGwgYXMgcmVmLCBudWxsIGFzIGRlc2NyaXB0aW9uLCBudWxsICBhcyBxdW90ZSB3aGVyZSBmYWxzZSB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IDEsIHJvd2lkLCByZWYsICAndWMtbm9ybWFsaXphdGlvbicsIGxpbmUgIGFzIHF1b3RlIGZyb20gX2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzICAgICAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX2tyX3JlYWRpbmdzX3Vua25vd25fdmVyYl9mYXVsdHMgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX2Vycm9yX3ZlcmJfZmF1bHRzICAgICAgICAgICAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX21pcnJvcl9saW5lc193aGl0ZXNwYWNlX2ZhdWx0cyAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX21pcnJvcl9saW5lc193aXRoX2Vycm9ycyAgICAgICAgIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9zeWxsYWJsZXMgYXMgc2VsZWN0XG4gICAgIyAgICAgICB0MS5zXG4gICAgIyAgICAgICB0MS52XG4gICAgIyAgICAgICB0MS5vXG4gICAgIyAgICAgICB0aS5zIGFzIGluaXRpYWxfaGFuZ1xuICAgICMgICAgICAgdG0ucyBhcyBtZWRpYWxfaGFuZ1xuICAgICMgICAgICAgdGYucyBhcyBmaW5hbF9oYW5nXG4gICAgIyAgICAgICB0aS5vIGFzIGluaXRpYWxfbGF0blxuICAgICMgICAgICAgdG0ubyBhcyBtZWRpYWxfbGF0blxuICAgICMgICAgICAgdGYubyBhcyBmaW5hbF9sYXRuXG4gICAgIyAgICAgZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0MVxuICAgICMgICAgIGpvaW5cbiAgICAjICAgICBqb2luIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHRpIG9uICggdDEuKVxuICAgICMgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMjIyBhZ2dyZWdhdGUgdGFibGUgZm9yIGFsbCByb3dpZHMgZ29lcyBoZXJlICMjI1xuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIyNcblxuICAgICAgICAgICAgICAgLiAgICAgICAgICAgICAgICAgLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAubzggICAgICAgICAgICAgICAubzggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm84XG4gICAub29vby5vIC5vODg4b28gIC5vb29vLiAgIC5vODg4b28gIC5vb29vby4gIG9vby4gLm9vLiAgLm9vLiAgICAub29vb28uICBvb28uIC5vby4gICAubzg4OG9vICAub29vby5vXG4gIGQ4OCggIFwiOCAgIDg4OCAgIGBQICApODhiICAgIDg4OCAgIGQ4OCcgYDg4YiBgODg4UFwiWTg4YlBcIlk4OGIgIGQ4OCcgYDg4YiBgODg4UFwiWTg4YiAgICA4ODggICBkODgoICBcIjhcbiAgYFwiWTg4Yi4gICAgODg4ICAgIC5vUFwiODg4ICAgIDg4OCAgIDg4OG9vbzg4OCAgODg4ICAgODg4ICAgODg4ICA4ODhvb284ODggIDg4OCAgIDg4OCAgICA4ODggICBgXCJZODhiLlxuICBvLiAgKTg4YiAgIDg4OCAuIGQ4KCAgODg4ICAgIDg4OCAuIDg4OCAgICAubyAgODg4ICAgODg4ICAgODg4ICA4ODggICAgLm8gIDg4OCAgIDg4OCAgICA4ODggLiBvLiAgKTg4YlxuICA4XCJcIjg4OFAnICAgXCI4ODhcIiBgWTg4OFwiXCI4byAgIFwiODg4XCIgYFk4Ym9kOFAnIG84ODhvIG84ODhvIG84ODhvIGBZOGJvZDhQJyBvODg4byBvODg4byAgIFwiODg4XCIgOFwiXCI4ODhQJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAc3RhdGVtZW50czpcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9nbHlwaHJhbmdlOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9nbHlwaHJhbmdlcyAoIHJzZywgaXNfY2prLCBsbywgaGksIG5hbWUgKSB2YWx1ZXMgKCAkcnNnLCAkaXNfY2prLCAkbG8sICRoaSwgJG5hbWUgKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIGRza2V5ICkgZG8gdXBkYXRlIHNldCBwYXRoID0gZXhjbHVkZWQucGF0aFxuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfZGF0YXNvdXJjZV9mb3JtYXQ6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX2RhdGFzb3VyY2VfZm9ybWF0cyAoIGZvcm1hdCwgY29tbWVudCApIHZhbHVlcyAoICRmb3JtYXQsICRjb21tZW50IClcbiAgICAgICAgLS0gb24gY29uZmxpY3QgKCBkc2tleSApIGRvIHVwZGF0ZSBzZXQgcGF0aCA9IGV4Y2x1ZGVkLnBhdGhcbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX2RhdGFzb3VyY2U6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX2RhdGFzb3VyY2VzICggZHNrZXksIGZvcm1hdCwgcGF0aCApIHZhbHVlcyAoICRkc2tleSwgJGZvcm1hdCwgJHBhdGggKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIGRza2V5ICkgZG8gdXBkYXRlIHNldCBwYXRoID0gZXhjbHVkZWQucGF0aFxuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfbWlycm9yX3ZlcmI6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl92ZXJicyAoIHJhbmssIHMsIHYsIG8gKSB2YWx1ZXMgKCAkcmFuaywgJHMsICR2LCAkbyApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcm93aWQgKSBkbyB1cGRhdGUgc2V0IHJhbmsgPSBleGNsdWRlZC5yYW5rLCBzID0gZXhjbHVkZWQucywgdiA9IGV4Y2x1ZGVkLnYsIG8gPSBleGNsdWRlZC5vXG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGU6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl9sY29kZXMgKCByb3dpZCwgbGNvZGUsIGNvbW1lbnQgKSB2YWx1ZXMgKCAkcm93aWQsICRsY29kZSwgJGNvbW1lbnQgKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIHJvd2lkICkgZG8gdXBkYXRlIHNldCBsY29kZSA9IGV4Y2x1ZGVkLmxjb2RlLCBjb21tZW50ID0gZXhjbHVkZWQuY29tbWVudFxuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfbWlycm9yX3RyaXBsZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoIHJvd2lkLCByZWYsIHMsIHYsIG8gKSB2YWx1ZXMgKCAkcm93aWQsICRyZWYsICRzLCAkdiwgJG8gKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIHJlZiwgcywgdiwgbyApIGRvIG5vdGhpbmdcbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfbGluZXMgKCBkc2tleSwgbGluZV9uciwgbGNvZGUsIGxpbmUsIGpmaWVsZHMgKVxuICAgICAgc2VsZWN0XG4gICAgICAgIC0tICd0Om1yOmxuOlI9JyB8fCByb3dfbnVtYmVyKCkgb3ZlciAoKSAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgLS0gZHMuZHNrZXkgfHwgJzpMPScgfHwgZmwubGluZV9uciAgIGFzIHJvd2lkLFxuICAgICAgICBkcy5kc2tleSAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZHNrZXksXG4gICAgICAgIGZsLmxpbmVfbnIgICAgICAgICAgICAgICAgICAgICAgICBhcyBsaW5lX25yLFxuICAgICAgICBmbC5sY29kZSAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbGNvZGUsXG4gICAgICAgIGZsLmxpbmUgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBsaW5lLFxuICAgICAgICBmbC5qZmllbGRzICAgICAgICAgICAgICAgICAgICAgICAgYXMgamZpZWxkc1xuICAgICAgZnJvbSBqenJfZGF0YXNvdXJjZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGRzXG4gICAgICBqb2luIGp6cl9kYXRhc291cmNlX2Zvcm1hdHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZGYgdXNpbmcgKCBmb3JtYXQgKVxuICAgICAgam9pbiBqenJfd2Fsa19maWxlX2xpbmVzKCBkcy5kc2tleSwgZGYuZm9ybWF0LCBkcy5wYXRoICkgIGFzIGZsXG4gICAgICB3aGVyZSB0cnVlXG4gICAgICAtLSBvbiBjb25mbGljdCAoIGRza2V5LCBsaW5lX25yICkgZG8gdXBkYXRlIHNldCBsaW5lID0gZXhjbHVkZWQubGluZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgKCByb3dpZCwgcmVmLCBzLCB2LCBvIClcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICBndC5yb3dpZF9vdXQgICAgYXMgcm93aWQsXG4gICAgICAgICAgICBndC5yZWYgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICAgZ3QucyAgICAgICAgICAgIGFzIHMsXG4gICAgICAgICAgICBndC52ICAgICAgICAgICAgYXMgdixcbiAgICAgICAgICAgIGd0Lm8gICAgICAgICAgICBhcyBvXG4gICAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBtbFxuICAgICAgICAgIGpvaW4ganpyX3dhbGtfdHJpcGxlcyggbWwucm93aWQsIG1sLmRza2V5LCBtbC5qZmllbGRzICkgYXMgZ3RcbiAgICAgICAgICB3aGVyZSB0cnVlXG4gICAgICAgICAgICBhbmQgKCBtbC5sY29kZSA9ICdEJyApXG4gICAgICAgICAgICAtLSBhbmQgKCBtbC5kc2tleSA9ICdkczpkaWN0Om1lYW5pbmdzJyApXG4gICAgICAgICAgICBhbmQgKCBtbC5qZmllbGRzIGlzIG5vdCBudWxsIClcbiAgICAgICAgICAgIGFuZCAoIG1sLmpmaWVsZHMtPj4wIG5vdCByZWdleHAgJ15AZ2x5cGhzJyApXG4gICAgICAgICAgICBhbmQgKCBtbC5kc2tleSA9ICRkc2tleSApXG4gICAgICAgICAgICBhbmQgKCBtbC5qZmllbGRzLT4+MiByZWdleHAgJHZfcmUgKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIHJlZiwgcywgdiwgbyApIGRvIG5vdGhpbmdcbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbGFuZ19oYW5nZXVsX3N5bGxhYmxlczogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyAoIHJvd2lkLCByZWYsXG4gICAgICAgIHN5bGxhYmxlX2hhbmcsIGluaXRpYWxfaGFuZywgbWVkaWFsX2hhbmcsIGZpbmFsX2hhbmcsXG4gICAgICAgICAgICAgICAgICAgICAgICBpbml0aWFsX2xhdG4sIG1lZGlhbF9sYXRuLCBmaW5hbF9sYXRuIClcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICAndDpsYW5nOmhhbmc6c3lsOlY9JyB8fCBtdC5vICAgICAgICAgIGFzIHJvd2lkLFxuICAgICAgICAgICAgbXQucm93aWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgICBtdC5vICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHN5bGxhYmxlX2hhbmcsXG4gICAgICAgICAgICBkaC5pbml0aWFsICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGluaXRpYWxfaGFuZyxcbiAgICAgICAgICAgIGRoLm1lZGlhbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbWVkaWFsX2hhbmcsXG4gICAgICAgICAgICBkaC5maW5hbCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGZpbmFsX2hhbmcsXG4gICAgICAgICAgICBjb2FsZXNjZSggbXRpLm8sICcnICkgICAgICAgICAgICAgICAgIGFzIGluaXRpYWxfbGF0bixcbiAgICAgICAgICAgIGNvYWxlc2NlKCBtdG0ubywgJycgKSAgICAgICAgICAgICAgICAgYXMgbWVkaWFsX2xhdG4sXG4gICAgICAgICAgICBjb2FsZXNjZSggbXRmLm8sICcnICkgICAgICAgICAgICAgICAgIGFzIGZpbmFsX2xhdG5cbiAgICAgICAgICBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICAgICAgICAgICAgICBhcyBtdFxuICAgICAgICAgIGxlZnQgam9pbiBqenJfZGlzYXNzZW1ibGVfaGFuZ2V1bCggbXQubyApIGFzIGRoXG4gICAgICAgICAgbGVmdCBqb2luIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIG10aSBvbiAoIG10aS5zID0gZGguaW5pdGlhbCBhbmQgbXRpLnYgPSAndjp4OmtvLUhhbmcrTGF0bjppbml0aWFsJyApXG4gICAgICAgICAgbGVmdCBqb2luIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIG10bSBvbiAoIG10bS5zID0gZGgubWVkaWFsICBhbmQgbXRtLnYgPSAndjp4OmtvLUhhbmcrTGF0bjptZWRpYWwnICApXG4gICAgICAgICAgbGVmdCBqb2luIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIG10ZiBvbiAoIG10Zi5zID0gZGguZmluYWwgICBhbmQgbXRmLnYgPSAndjp4OmtvLUhhbmcrTGF0bjpmaW5hbCcgICApXG4gICAgICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICAgICAgYW5kICggbXQudiA9ICd2OmM6cmVhZGluZzprby1IYW5nJyApXG4gICAgICAgICAgb3JkZXIgYnkgbXQub1xuICAgICAgICAtLSBvbiBjb25mbGljdCAoIHJvd2lkICAgICAgICAgKSBkbyBub3RoaW5nXG4gICAgICAgIC8qICMjIyBOT1RFIGBvbiBjb25mbGljdGAgbmVlZGVkIGJlY2F1c2Ugd2UgbG9nIGFsbCBhY3R1YWxseSBvY2N1cnJpbmcgcmVhZGluZ3Mgb2YgYWxsIGNoYXJhY3RlcnMgKi9cbiAgICAgICAgb24gY29uZmxpY3QgKCBzeWxsYWJsZV9oYW5nICkgZG8gbm90aGluZ1xuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9nbHlwaHJhbmdlczogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfZ2x5cGhyYW5nZXMgKCByc2csIGlzX2NqaywgbG8sIGhpLCBuYW1lIClcbiAgICAgIHNlbGVjdFxuICAgICAgICAtLSAndDptcjpsbjpSPScgfHwgcm93X251bWJlcigpIG92ZXIgKCkgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgIC0tIGRzLmRza2V5IHx8ICc6TD0nIHx8IGZsLmxpbmVfbnIgICBhcyByb3dpZCxcbiAgICAgICAgZ3IucnNnICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJzZyxcbiAgICAgICAgZ3IuaXNfY2prICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGlzX2NqayxcbiAgICAgICAgLS0gcmVmXG4gICAgICAgIGdyLmxvICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBsbyxcbiAgICAgICAgZ3IuaGkgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGhpLFxuICAgICAgICBnci5uYW1lICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbmFtZVxuICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbWxcbiAgICAgIGpvaW4ganpyX3BhcnNlX3VjZGJfcnNnc19nbHlwaHJhbmdlKCBtbC5kc2tleSwgbWwubGluZV9uciwgbWwuamZpZWxkcyApIGFzIGdyXG4gICAgICB3aGVyZSB0cnVlXG4gICAgICAgIGFuZCAoIG1sLmRza2V5ID0gJ2RzOnVjZGI6cnNncycgKVxuICAgICAgICBhbmQgKCBtbC5sY29kZSA9ICdEJyApXG4gICAgICBvcmRlciBieSBtbC5saW5lX25yXG4gICAgICAtLSBvbiBjb25mbGljdCAoIGRza2V5LCBsaW5lX25yICkgZG8gdXBkYXRlIHNldCBsaW5lID0gZXhjbHVkZWQubGluZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfZ2x5cGhzOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9nbHlwaHMgKCBjaWQsIGdseXBoLCByc2csIGlzX2NqayApXG4gICAgICBzZWxlY3RcbiAgICAgICAgICBjZy5jaWQgICAgYXMgY2lkLFxuICAgICAgICAgIGNnLmdseXBoICBhcyBnbHlwaCxcbiAgICAgICAgICBnci5yc2cgICAgYXMgcnNnLFxuICAgICAgICAgIGdyLmlzX2NqayBhcyBpc19jamtcbiAgICAgICAgZnJvbSBqenJfZ2x5cGhyYW5nZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZ3JcbiAgICAgICAgam9pbiBqenJfZ2VuZXJhdGVfY2lkc19hbmRfZ2x5cGhzKCBnci5sbywgZ3IuaGkgKSAgICAgYXMgY2dcbiAgICAgICAgO1wiXCJcIlxuXG5cblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICMjI1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb29vbyAgICAgICAgICAgICAgICAuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYDg4OCAgICAgICAgICAgICAgLm84XG4gIG9vLm9vb29vLiAgIC5vb29vby4gIG9vLm9vb29vLiAgb29vbyAgb29vbyAgIDg4OCAgIC5vb29vLiAgIC5vODg4b28gIC5vb29vby5cbiAgIDg4OCcgYDg4YiBkODgnIGA4OGIgIDg4OCcgYDg4YiBgODg4ICBgODg4ICAgODg4ICBgUCAgKTg4YiAgICA4ODggICBkODgnIGA4OGJcbiAgIDg4OCAgIDg4OCA4ODggICA4ODggIDg4OCAgIDg4OCAgODg4ICAgODg4ICAgODg4ICAgLm9QXCI4ODggICAgODg4ICAgODg4b29vODg4XG4gICA4ODggICA4ODggODg4ICAgODg4ICA4ODggICA4ODggIDg4OCAgIDg4OCAgIDg4OCAgZDgoICA4ODggICAgODg4IC4gODg4ICAgIC5vXG4gICA4ODhib2Q4UCcgYFk4Ym9kOFAnICA4ODhib2Q4UCcgIGBWODhWXCJWOFAnIG84ODhvIGBZODg4XCJcIjhvICAgXCI4ODhcIiBgWThib2Q4UCdcbiAgIDg4OCAgICAgICAgICAgICAgICAgIDg4OFxuICBvODg4byAgICAgICAgICAgICAgICBvODg4b1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xjb2RlczogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzI4JywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGNvZGVzJ1xuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPUInLCBsY29kZTogJ0InLCBjb21tZW50OiAnYmxhbmsgbGluZScsICAgIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl9sY29kZS5ydW4geyByb3dpZDogJ3Q6bXI6bGM6Vj1DJywgbGNvZGU6ICdDJywgY29tbWVudDogJ2NvbW1lbnQgbGluZScsICB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0Om1yOmxjOlY9RCcsIGxjb2RlOiAnRCcsIGNvbW1lbnQ6ICdkYXRhIGxpbmUnLCAgICAgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPUUnLCBsY29kZTogJ0UnLCBjb21tZW50OiAnZXJyb3InLCAgICAgICAgIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl9sY29kZS5ydW4geyByb3dpZDogJ3Q6bXI6bGM6Vj1VJywgbGNvZGU6ICdVJywgY29tbWVudDogJ3Vua25vd24nLCAgICAgICB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdmVyYnM6IC0+XG4gICAgIyMjIE5PVEVcbiAgICBpbiB2ZXJicywgaW5pdGlhbCBjb21wb25lbnQgaW5kaWNhdGVzIHR5cGUgb2Ygc3ViamVjdDpcbiAgICAgIGB2OmM6YCBpcyBmb3Igc3ViamVjdHMgdGhhdCBhcmUgQ0pLIGNoYXJhY3RlcnNcbiAgICAgIGB2Ong6YCBpcyB1c2VkIGZvciB1bmNsYXNzaWZpZWQgc3ViamVjdHMgKHBvc3NpYmx5IHRvIGJlIHJlZmluZWQgaW4gdGhlIGZ1dHVyZSlcbiAgICAjIyNcbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzI5JywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdmVyYnMnXG4gICAgcm93cyA9IFtcbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjp0ZXN0aW5nOnVudXNlZCcsICAgICAgICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2Ong6a28tSGFuZytMYXRuOmluaXRpYWwnLCAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6eDprby1IYW5nK0xhdG46bWVkaWFsJywgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjp4OmtvLUhhbmcrTGF0bjpmaW5hbCcsICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzp6aC1MYXRuLXBpbnlpbicsICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmphLXgtS2FuJywgICAgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6amEteC1IaXInLCAgICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzpqYS14LUthdCcsICAgICAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmphLXgtTGF0bicsICAgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6amEteC1IaXIrTGF0bicsICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzpqYS14LUthdCtMYXRuJywgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmtvLUhhbmcnLCAgICAgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6a28tTGF0bicsICAgICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzprby1IYW5nOmluaXRpYWwnLCAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmtvLUhhbmc6bWVkaWFsJywgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6a28tSGFuZzpmaW5hbCcsICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzprby1MYXRuOmluaXRpYWwnLCAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmtvLUxhdG46bWVkaWFsJywgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6a28tTGF0bjpmaW5hbCcsICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6c2hhcGU6aWRzOmVycm9yJywgICAgICAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpzaGFwZTppZHM6Uzpmb3JtdWxhJywgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnNoYXBlOmlkczpTOmFzdCcsICAgICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6c2hhcGU6aWRzOk06Zm9ybXVsYScsICAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpzaGFwZTppZHM6TTphc3QnLCAgICAgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnNoYXBlOmlkczpMOmZvcm11bGEnLCAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6c2hhcGU6aWRzOkw6YXN0JywgICAgICAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpzaGFwZTppZHM6UzpoYXMtb3BlcmF0b3InLCAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnNoYXBlOmlkczpTOmhhcy1jb21wb25lbnQnLCAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6c2hhcGU6aWRzOlM6Y29tcG9uZW50cycsICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICBdXG4gICAgZm9yIHJvdyBpbiByb3dzXG4gICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl92ZXJiLnJ1biByb3dcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VfZm9ybWF0czogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzMwJywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlX2Zvcm1hdHMnXG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdkc2Y6dHN2JywgICAgICAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdkc2Y6bWQ6dGFibGUnLCAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdkc2Y6Y3N2JywgICAgICAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdkc2Y6anNvbicsICAgICAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdkc2Y6bWQnLCAgICAgICAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdkc2Y6dHh0JywgICAgICAgICBjb21tZW50OiAnTk4nLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdC5ydW4geyBmb3JtYXQ6ICdkc2Y6c2VtaWNvbG9ucycsICBjb21tZW50OiAnTk4nLCB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlczogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzMxJywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlcydcbiAgICB7IHBhdGhzXG4gICAgICBmb3JtYXRzLCB9ID0gZ2V0X3BhdGhzX2FuZF9mb3JtYXRzKClcbiAgICAjIGRza2V5ID0gJ2RzOmRpY3Q6dWNkOnYxNC4wOnVoZGlkeCc7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MicsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6ZGljdDptZWFuaW5ncyc7ICAgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MScsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6ZGljdDp4OmtvLUhhbmcrTGF0bic7ICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MicsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6ZGljdDp4OmphLUthbitMYXRuJzsgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MycsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkczpkaWN0OmphOmthbmppdW0nOyAgICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj00JywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICAjIGRza2V5ID0gJ2RzOmRpY3Q6amE6a2Fuaml1bTphdXgnOyAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTUnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZHM6ZGljdDprbzpWPWRhdGEtZ292LmNzdic7ICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9NicsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkczpkaWN0OmtvOlY9ZGF0YS1nb3YuanNvbic7ICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj03JywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICAjIGRza2V5ID0gJ2RzOmRpY3Q6a286Vj1kYXRhLW5hdmVyLmNzdic7ICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTgnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZHM6ZGljdDprbzpWPWRhdGEtbmF2ZXIuanNvbic7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9OScsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkczpkaWN0OmtvOlY9UkVBRE1FLm1kJzsgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xMCcsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6c2hhcGU6aWRzdjInOyAgICAgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MTEnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIGRza2V5ID0gJ2RzOnNoYXBlOnpoejViZic7ICAgICAgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEyJywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkczp1Y2RiOnJzZ3MnOyAgICAgICAgICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xMycsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6dWNkOnVjZCc7ICAgICAgICAgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MTQnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIDtudWxsXG5cbiAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgX29uX29wZW5fcG9wdWxhdGVfdmVyYnM6IC0+XG4gICMgICBwYXRocyA9IGdldF9wYXRoc19hbmRfZm9ybWF0cygpXG4gICMgICBkc2tleSA9ICdkczpkaWN0Om1lYW5pbmdzJzsgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEnLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgIyAgIGRza2V5ID0gJ2RzOmRpY3Q6dWNkOnYxNC4wOnVoZGlkeCc7ICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MicsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAjICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGluZXM6IC0+XG4gICAgZGVidWcgJ86panpyc2RiX18zMicsICdfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzJ1xuICAgIEBzdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9taXJyb3JfbGluZXMucnVuKClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX2dseXBocmFuZ2VzOiAtPlxuICAgIGRlYnVnICfOqWp6cnNkYl9fMzMnLCAnX29uX29wZW5fcG9wdWxhdGVfanpyX2dseXBocmFuZ2VzJ1xuICAgIEBzdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9nbHlwaHJhbmdlcy5ydW4oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZ2x5cGhzOiAtPlxuICAgIGRlYnVnICfOqWp6cnNkYl9fMzQnLCAnX29uX29wZW5fcG9wdWxhdGVfanpyX2dseXBocydcbiAgICB0cnlcbiAgICAgIEBzdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9nbHlwaHMucnVuKClcbiAgICBjYXRjaCBjYXVzZVxuICAgICAgZmllbGRzX3JwciA9IHJwciBAc3RhdGUubW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fMzUgd2hlbiB0cnlpbmcgdG8gaW5zZXJ0IHRoaXMgcm93OiAje2ZpZWxkc19ycHJ9LCBhbiBlcnJvciB3YXMgdGhyb3duOiAje2NhdXNlLm1lc3NhZ2V9XCIsIFxcXG4gICAgICAgIHsgY2F1c2UsIH1cbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0OiAoIG5hbWUsIGZpZWxkcy4uLiApIC0+XG4gICAgIyBkZWJ1ZyAnzqlqenJzZGJfXzM2JywgeyBuYW1lLCBmaWVsZHMsIH1cbiAgICBAc3RhdGUubW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93ID0geyBuYW1lLCBmaWVsZHMsIH1cbiAgICA7bnVsbFxuXG4gICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIyMjXG5cbiAgb29vb28gICAgIG9vbyBvb29vb29vb29vLiAgIG9vb29vb29vb29vb1xuICBgODg4JyAgICAgYDgnIGA4ODgnICAgYFk4YiAgYDg4OCcgICAgIGA4XG4gICA4ODggICAgICAgOCAgIDg4OCAgICAgIDg4OCAgODg4ICAgICAgICAgIC5vb29vLm9cbiAgIDg4OCAgICAgICA4ICAgODg4ICAgICAgODg4ICA4ODhvb29vOCAgICBkODgoICBcIjhcbiAgIDg4OCAgICAgICA4ICAgODg4ICAgICAgODg4ICA4ODggICAgXCIgICAgYFwiWTg4Yi5cbiAgIGA4OC4gICAgLjgnICAgODg4ICAgICBkODgnICA4ODggICAgICAgICBvLiAgKTg4YlxuICAgICBgWWJvZFAnICAgIG84ODhib29kOFAnICAgbzg4OG8gICAgICAgIDhcIlwiODg4UCdcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgQGZ1bmN0aW9uczpcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAganpyX3RyaWdnZXJfb25fYmVmb3JlX2luc2VydDpcbiAgICAgICMjIyBOT1RFIGluIHRoZSBmdXR1cmUgdGhpcyBmdW5jdGlvbiBjb3VsZCB0cmlnZ2VyIGNyZWF0aW9uIG9mIHRyaWdnZXJzIG9uIGluc2VydHMgIyMjXG4gICAgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICAgdmFyYXJnczogICAgICAgIHRydWVcbiAgICAgIHZhbHVlOiAoIG5hbWUsIGZpZWxkcy4uLiApIC0+IEB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQgbmFtZSwgZmllbGRzLi4uXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMjIyBOT1RFIG1vdmVkIHRvIERicmljX3N0ZDsgY29uc2lkZXIgdG8gb3ZlcndyaXRlIHdpdGggdmVyc2lvbiB1c2luZyBgc2xldml0aGFuL3JlZ2V4YCAjIyNcbiAgICAjIHJlZ2V4cDpcbiAgICAjICAgb3ZlcndyaXRlOiAgICAgIHRydWVcbiAgICAjICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAjICAgdmFsdWU6ICggcGF0dGVybiwgdGV4dCApIC0+IGlmICggKCBuZXcgUmVnRXhwIHBhdHRlcm4sICd2JyApLnRlc3QgdGV4dCApIHRoZW4gMSBlbHNlIDBcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAganpyX2hhc19wZXJpcGhlcmFsX3dzX2luX2pmaWVsZDpcbiAgICAgIGRldGVybWluaXN0aWM6ICB0cnVlXG4gICAgICB2YWx1ZTogKCBqZmllbGRzX2pzb24gKSAtPlxuICAgICAgICByZXR1cm4gZnJvbV9ib29sIGZhbHNlIHVubGVzcyAoIGpmaWVsZHMgPSBKU09OLnBhcnNlIGpmaWVsZHNfanNvbiApP1xuICAgICAgICByZXR1cm4gZnJvbV9ib29sIGZhbHNlIHVubGVzcyAoIHR5cGVfb2YgamZpZWxkcyApIGlzICdsaXN0J1xuICAgICAgICByZXR1cm4gZnJvbV9ib29sIGpmaWVsZHMuc29tZSAoIHZhbHVlICkgLT4gLyheXFxzKXwoXFxzJCkvLnRlc3QgdmFsdWVcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAganpyX2Nocl9mcm9tX2NpZDpcbiAgICAgIGRldGVybWluaXN0aWM6ICB0cnVlXG4gICAgICB2YWx1ZTogKCBjaWQgKSAtPiBnbHlwaF9jb252ZXJ0ZXIuZ2x5cGhfZnJvbV9jaWQgY2lkXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGp6cl9hc19oZXg6XG4gICAgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICAgdmFsdWU6ICggY2lkICkgLT4gXCIweCN7KCBjaWQudG9TdHJpbmcgMTYgKS5wYWRTdGFydCA0LCAwfVwiXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGp6cl9pbnRlZ2VyX2Zyb21faGV4OlxuICAgICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAgIHZhbHVlOiAoIGNpZF9oZXggKSAtPiBwYXJzZUludCBjaWRfaGV4LCAxNlxuXG4gICAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICMganpyX2lzX2Nqa19nbHlwaDpcbiAgICAjICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAjICAgdmFsdWU6ICggY2lkICkgLT4gXCIweCN7KCBjaWQudG9TdHJpbmcgMTYgKS5wYWRTdGFydCA0LCAwfVwiXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBAdGFibGVfZnVuY3Rpb25zOlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBqenJfc3BsaXRfd29yZHM6XG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2tleXdvcmQnLCBdXG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ2xpbmUnLCBdXG4gICAgICByb3dzOiAoIGxpbmUgKSAtPlxuICAgICAgICBrZXl3b3JkcyA9IGxpbmUuc3BsaXQgLyg/OlxccHtafSspfCgoPzpcXHB7U2NyaXB0PUhhbn0pfCg/OlxccHtMfSspfCg/OlxccHtOfSspfCg/OlxccHtTfSspKS92XG4gICAgICAgIGZvciBrZXl3b3JkIGluIGtleXdvcmRzXG4gICAgICAgICAgY29udGludWUgdW5sZXNzIGtleXdvcmQ/XG4gICAgICAgICAgY29udGludWUgaWYga2V5d29yZCBpcyAnJ1xuICAgICAgICAgIHlpZWxkIHsga2V5d29yZCwgfVxuICAgICAgICA7bnVsbFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBqenJfd2Fsa19maWxlX2xpbmVzOlxuICAgICAgY29sdW1uczogICAgICBbICdsaW5lX25yJywgJ2xjb2RlJywgJ2xpbmUnLCAnamZpZWxkcycgXVxuICAgICAgcGFyYW1ldGVyczogICBbICdkc2tleScsICdmb3JtYXQnLCAncGF0aCcsIF1cbiAgICAgIHJvd3M6ICggZHNrZXksIGZvcm1hdCwgcGF0aCApIC0+XG4gICAgICAgIHlpZWxkIGZyb20gbmV3IERhdGFzb3VyY2VfZmllbGRfcGFyc2VyIHsgaG9zdDogQGhvc3QsIGRza2V5LCBmb3JtYXQsIHBhdGgsIH1cbiAgICAgICAgO251bGxcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAganpyX3dhbGtfdHJpcGxlczpcbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAncm93aWRfaW4nLCAnZHNrZXknLCAnamZpZWxkcycsIF1cbiAgICAgIGNvbHVtbnM6ICAgICAgWyAncm93aWRfb3V0JywgJ3JlZicsICdzJywgJ3YnLCAnbycsIF1cbiAgICAgIHJvd3M6ICggcm93aWRfaW4sIGRza2V5LCBqZmllbGRzICkgLT5cbiAgICAgICAgZmllbGRzICA9IEpTT04ucGFyc2UgamZpZWxkc1xuICAgICAgICBlbnRyeSAgID0gZmllbGRzWyAyIF1cbiAgICAgICAgc3dpdGNoIGRza2V5XG4gICAgICAgICAgd2hlbiAnZHM6ZGljdDp4OmtvLUhhbmcrTGF0bicgICAgIHRoZW4geWllbGQgZnJvbSBAdHJpcGxlc19mcm9tX2RpY3RfeF9rb19IYW5nX0xhdG4gICAgICAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgICB3aGVuICdkczpkaWN0Om1lYW5pbmdzJyB0aGVuIHN3aXRjaCB0cnVlXG4gICAgICAgICAgICB3aGVuICggZW50cnkuc3RhcnRzV2l0aCAncHk6JyApIHRoZW4geWllbGQgZnJvbSBAdHJpcGxlc19mcm9tX2NfcmVhZGluZ196aF9MYXRuX3BpbnlpbiAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgICAgIHdoZW4gKCBlbnRyeS5zdGFydHNXaXRoICdrYTonICkgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX2phX3hfS2FuICAgICAgICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAgICAgd2hlbiAoIGVudHJ5LnN0YXJ0c1dpdGggJ2hpOicgKSB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXNfZnJvbV9jX3JlYWRpbmdfamFfeF9LYW4gICAgICAgIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICAgICB3aGVuICggZW50cnkuc3RhcnRzV2l0aCAnaGc6JyApIHRoZW4geWllbGQgZnJvbSBAdHJpcGxlc19mcm9tX2NfcmVhZGluZ19rb19IYW5nICAgICAgICAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgICB3aGVuICdkczpzaGFwZTppZHN2MicgICAgICAgICAgICAgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fc2hhcGVfaWRzdjIgICAgICAgICAgICAgICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAgIHdoZW4gJ2RzOnVjZDp1Y2QnICAgICAgICAgICAgICAgICB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXNfZnJvbV91Y2RfdWNkICAgICAgICAgICAgICAgICAgIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgIDtudWxsXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGp6cl9kaXNhc3NlbWJsZV9oYW5nZXVsOlxuICAgICAgcGFyYW1ldGVyczogICBbICdoYW5nJywgXVxuICAgICAgY29sdW1uczogICAgICBbICdpbml0aWFsJywgJ21lZGlhbCcsICdmaW5hbCcsIF1cbiAgICAgIHJvd3M6ICggaGFuZyApIC0+XG4gICAgICAgIGphbW9zID0gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuX1RNUF9oYW5nZXVsLmRpc2Fzc2VtYmxlIGhhbmcsIHsgZmxhdHRlbjogZmFsc2UsIH1cbiAgICAgICAgZm9yIHsgZmlyc3Q6IGluaXRpYWwsIHZvd2VsOiBtZWRpYWwsIGxhc3Q6IGZpbmFsLCB9IGluIGphbW9zXG4gICAgICAgICAgeWllbGQgeyBpbml0aWFsLCBtZWRpYWwsIGZpbmFsLCB9XG4gICAgICAgIDtudWxsXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGp6cl9wYXJzZV91Y2RiX3JzZ3NfZ2x5cGhyYW5nZTpcbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAnZHNrZXknLCAnbGluZV9ucicsICdqZmllbGRzJywgXVxuICAgICAgY29sdW1uczogICAgICBbICdyc2cnLCAnaXNfY2prJywgJ2xvJywgJ2hpJywgJ25hbWUnLCBdXG4gICAgICByb3dzOiAoIGRza2V5LCBsaW5lX25yLCBqZmllbGRzICkgLT5cbiAgICAgICAgZ2x5cGhyYW5nZSA9IGRhdGFzb3VyY2VfZm9ybWF0X3BhcnNlci5wYXJzZV91Y2RiX3JzZ3NfZ2x5cGhyYW5nZSB7IGRza2V5LCBsaW5lX25yLCBqZmllbGRzLCB9XG4gICAgICAgIHlpZWxkIGdseXBocmFuZ2UgaWYgZ2x5cGhyYW5nZT9cbiAgICAgICAgO251bGxcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAganpyX2dlbmVyYXRlX2NpZHNfYW5kX2dseXBoczpcbiAgICAgIGRldGVybWluaXN0aWM6ICB0cnVlXG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ2xvJywgJ2hpJywgXVxuICAgICAgY29sdW1uczogICAgICBbICdjaWQnLCAnZ2x5cGgnLCBdXG4gICAgICByb3dzOiAoIGxvLCBoaSApIC0+XG4gICAgICAgIHlpZWxkIGZyb20gZ2x5cGhfY29udmVydGVyLmdlbmVyYXRlX2NpZHNfYW5kX2dseXBocyBsbywgaGlcbiAgICAgICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaXBsZXNfZnJvbV9kaWN0X3hfa29fSGFuZ19MYXRuOiAoIHJvd2lkX2luLCBkc2tleSwgWyByb2xlLCBzLCBvLCBdICkgLT5cbiAgICByZWYgICAgICAgPSByb3dpZF9pblxuICAgIHYgICAgICAgICA9IFwidjp4OmtvLUhhbmcrTGF0bjoje3JvbGV9XCJcbiAgICBvICAgICAgICA/PSAnJ1xuICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdiwgbywgfVxuICAgIEBzdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpcGxlc19mcm9tX2NfcmVhZGluZ196aF9MYXRuX3BpbnlpbjogKCByb3dpZF9pbiwgZHNrZXksIFsgXywgcywgZW50cnksIF0gKSAtPlxuICAgIHJlZiAgICAgICA9IHJvd2lkX2luXG4gICAgdiAgICAgICAgID0gJ3Y6YzpyZWFkaW5nOnpoLUxhdG4tcGlueWluJ1xuICAgIGZvciByZWFkaW5nIGZyb20gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9hdG9uYWxfemhfcmVhZGluZ3MgZW50cnlcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdiwgbzogcmVhZGluZywgfVxuICAgIEBzdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpcGxlc19mcm9tX2NfcmVhZGluZ19qYV94X0thbjogKCByb3dpZF9pbiwgZHNrZXksIFsgXywgcywgZW50cnksIF0gKSAtPlxuICAgIHJlZiAgICAgICA9IHJvd2lkX2luXG4gICAgaWYgZW50cnkuc3RhcnRzV2l0aCAna2E6J1xuICAgICAgdl94X0thbiAgID0gJ3Y6YzpyZWFkaW5nOmphLXgtS2F0J1xuICAgICAgdl9MYXRuICAgID0gJ3Y6YzpyZWFkaW5nOmphLXgtS2F0K0xhdG4nXG4gICAgZWxzZVxuICAgICAgdl94X0thbiAgID0gJ3Y6YzpyZWFkaW5nOmphLXgtSGlyJ1xuICAgICAgdl9MYXRuICAgID0gJ3Y6YzpyZWFkaW5nOmphLXgtSGlyK0xhdG4nXG4gICAgZm9yIHJlYWRpbmcgZnJvbSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5leHRyYWN0X2phX3JlYWRpbmdzIGVudHJ5XG4gICAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6IHZfeF9LYW4sIG86IHJlYWRpbmcsIH1cbiAgICAgICMgZm9yIHRyYW5zY3JpcHRpb24gZnJvbSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5yb21hbml6ZV9qYV9rYW5hIHJlYWRpbmdcbiAgICAgICMgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6IHZfTGF0biwgbzogdHJhbnNjcmlwdGlvbiwgfVxuICAgICAgdHJhbnNjcmlwdGlvbiA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLnJvbWFuaXplX2phX2thbmEgcmVhZGluZ1xuICAgICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiB2X0xhdG4sIG86IHRyYW5zY3JpcHRpb24sIH1cbiAgICBAc3RhdGUudGltZWl0X3Byb2dyZXNzPygpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaXBsZXNfZnJvbV9jX3JlYWRpbmdfa29fSGFuZzogKCByb3dpZF9pbiwgZHNrZXksIFsgXywgcywgZW50cnksIF0gKSAtPlxuICAgIHJlZiAgICAgICA9IHJvd2lkX2luXG4gICAgdiAgICAgICAgID0gJ3Y6YzpyZWFkaW5nOmtvLUhhbmcnXG4gICAgZm9yIHJlYWRpbmcgZnJvbSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5leHRyYWN0X2hnX3JlYWRpbmdzIGVudHJ5XG4gICAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHYsIG86IHJlYWRpbmcsIH1cbiAgICBAc3RhdGUudGltZWl0X3Byb2dyZXNzPygpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaXBsZXNfZnJvbV9zaGFwZV9pZHN2MjogKCByb3dpZF9pbiwgZHNrZXksIFsgXywgcywgZm9ybXVsYSwgXSApIC0+XG4gICAgcmVmICAgICAgID0gcm93aWRfaW5cbiAgICAjIGZvciByZWFkaW5nIGZyb20gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMucGFyc2VfaWRzIGZvcm11bGFcbiAgICAjICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2LCBvOiByZWFkaW5nLCB9XG4gICAgcmV0dXJuIG51bGwgaWYgKCBub3QgZm9ybXVsYT8gKSBvciAoIGZvcm11bGEgaXMgJycgKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiAndjpjOnNoYXBlOmlkczpTOmZvcm11bGEnLCBvOiBmb3JtdWxhLCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBlcnJvciA9IG51bGxcbiAgICB0cnkgZm9ybXVsYV9hc3QgPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5wYXJzZV9pZGx4IGZvcm11bGEgY2F0Y2ggZXJyb3JcbiAgICAgIG8gPSBKU09OLnN0cmluZ2lmeSB7IHJlZjogJ86panpyc2RiX18zNycsIG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsIHJvdzogeyByb3dpZF9pbiwgZHNrZXksIHMsIGZvcm11bGEsIH0sIH1cbiAgICAgIHdhcm4gXCJlcnJvcjogI3tvfVwiXG4gICAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6ICd2OmM6c2hhcGU6aWRzOmVycm9yJywgbywgfVxuICAgIHJldHVybiBudWxsIGlmIGVycm9yP1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZm9ybXVsYV9qc29uICAgID0gSlNPTi5zdHJpbmdpZnkgZm9ybXVsYV9hc3RcbiAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6ICd2OmM6c2hhcGU6aWRzOlM6YXN0JywgbzogZm9ybXVsYV9qc29uLCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB7IG9wZXJhdG9ycyxcbiAgICAgIGNvbXBvbmVudHMsIH0gPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5vcGVyYXRvcnNfYW5kX2NvbXBvbmVudHNfZnJvbV9pZGx4IGZvcm11bGFfYXN0XG4gICAgc2Vlbl9vcGVyYXRvcnMgID0gbmV3IFNldCgpXG4gICAgc2Vlbl9jb21wb25lbnRzID0gbmV3IFNldCgpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBjb21wb25lbnRzX2pzb24gPSBKU09OLnN0cmluZ2lmeSBjb21wb25lbnRzXG4gICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2OiAndjpjOnNoYXBlOmlkczpTOmNvbXBvbmVudHMnLCBvOiBjb21wb25lbnRzX2pzb24sIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGZvciBvcGVyYXRvciBpbiBvcGVyYXRvcnNcbiAgICAgIGNvbnRpbnVlIGlmIHNlZW5fb3BlcmF0b3JzLmhhcyBvcGVyYXRvclxuICAgICAgc2Vlbl9vcGVyYXRvcnMuYWRkIG9wZXJhdG9yXG4gICAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6ICd2OmM6c2hhcGU6aWRzOlM6aGFzLW9wZXJhdG9yJywgbzogb3BlcmF0b3IsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGZvciBjb21wb25lbnQgaW4gY29tcG9uZW50c1xuICAgICAgY29udGludWUgaWYgc2Vlbl9jb21wb25lbnRzLmhhcyBjb21wb25lbnRcbiAgICAgIHNlZW5fY29tcG9uZW50cy5hZGQgY29tcG9uZW50XG4gICAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6ICd2OmM6c2hhcGU6aWRzOlM6aGFzLWNvbXBvbmVudCcsIG86IGNvbXBvbmVudCwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQHN0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlwbGVzX2Zyb21fdWNkX3VjZDogKCByb3dpZF9pbiwgZHNrZXksIFsgXywgcywgZW50cnksIF0gKSAtPlxuICAgIHlpZWxkIHJldHVybiBudWxsXG4gICAgIyByZWYgICAgICAgPSByb3dpZF9pblxuICAgICMgdiAgICAgICAgID0gJ3Y6YzpyZWFkaW5nOmtvLUhhbmcnXG4gICAgIyBmb3IgcmVhZGluZyBmcm9tIEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfaGdfcmVhZGluZ3MgZW50cnlcbiAgICAjICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2LCBvOiByZWFkaW5nLCB9XG4gICAgIyBAc3RhdGUudGltZWl0X3Byb2dyZXNzPygpXG4gICAgO251bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMjI1xuXG4gICAgICAubzggICAgICAgICAgICAubzg4by5cbiAgICAgXCI4ODggICAgICAgICAgICA4ODggYFwiXG4gLm9vb284ODggICAub29vby5vIG84ODhvbyAgICAgb28ub29vb28uICAgLm9vb28uICAgb29vbyBkOGIgIC5vb29vLm8gIC5vb29vby4gIG9vb28gZDhiXG5kODgnIGA4ODggIGQ4OCggIFwiOCAgODg4ICAgICAgICA4ODgnIGA4OGIgYFAgICk4OGIgIGA4ODhcIlwiOFAgZDg4KCAgXCI4IGQ4OCcgYDg4YiBgODg4XCJcIjhQXG44ODggICA4ODggIGBcIlk4OGIuICAgODg4ICAgICAgICA4ODggICA4ODggIC5vUFwiODg4ICAgODg4ICAgICBgXCJZODhiLiAgODg4b29vODg4ICA4ODhcbjg4OCAgIDg4OCAgby4gICk4OGIgIDg4OCAgICAgICAgODg4ICAgODg4IGQ4KCAgODg4ICAgODg4ICAgICBvLiAgKTg4YiA4ODggICAgLm8gIDg4OFxuYFk4Ym9kODhQXCIgOFwiXCI4ODhQJyBvODg4byAgICAgICA4ODhib2Q4UCcgYFk4ODhcIlwiOG8gZDg4OGIgICAgOFwiXCI4ODhQJyBgWThib2Q4UCcgZDg4OGJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgODg4XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbzg4OG9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBEYXRhc291cmNlX2ZpZWxkX3BhcnNlclxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6ICh7IGhvc3QsIGRza2V5LCBmb3JtYXQsIHBhdGgsIH0pIC0+XG4gICAgQGhvc3QgICAgID0gaG9zdFxuICAgIEBkc2tleSAgICA9IGRza2V5XG4gICAgQGZvcm1hdCAgID0gZm9ybWF0XG4gICAgQHBhdGggICAgID0gcGF0aFxuICAgIDt1bmRlZmluZWRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIFtTeW1ib2wuaXRlcmF0b3JdOiAtPiB5aWVsZCBmcm9tIEB3YWxrKClcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHdhbGs6IC0+XG4gICAgZGVidWcgJ86panpyc2RiX18zOCcsIFwiRGF0YXNvdXJjZV9maWVsZF9wYXJzZXI6OndhbGs6XCIsIHsgZm9ybWF0OiBAZm9ybWF0LCBkc2tleTogQGRza2V5LCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBtZXRob2RfbmFtZSA9ICd3YWxrXycgKyBAZm9ybWF0LnJlcGxhY2UgL1teYS16XS9ndiwgJ18nXG4gICAgbWV0aG9kICAgICAgPSBAWyBtZXRob2RfbmFtZSBdID8gQF93YWxrX25vX3N1Y2hfcGFyc2VyXG4gICAgeWllbGQgZnJvbSBtZXRob2QuY2FsbCBAXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF93YWxrX25vX3N1Y2hfcGFyc2VyOiAtPlxuICAgIG1lc3NhZ2UgPSBcIs6panpyc2RiX18zOSBubyBwYXJzZXIgZm91bmQgZm9yIGZvcm1hdCAje3JwciBAZm9ybWF0fVwiXG4gICAgd2FybiBtZXNzYWdlXG4gICAgeWllbGQgeyBsaW5lX25yOiAwLCBsY29kZTogJ0UnLCBsaW5lOiBtZXNzYWdlLCBqZmllbGRzOiBudWxsLCB9XG4gICAgZm9yIHsgbG5yOiBsaW5lX25yLCBsaW5lLCBlb2wsIH0gZnJvbSB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zIEBwYXRoXG4gICAgICB5aWVsZCB7IGxpbmVfbnIsIGxjb2RlOiAnVScsIGxpbmUsIGpmaWVsZHM6IG51bGwsIH1cbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX3dhbGtfZmllbGRzX3dpdGhfc2VwYXJhdG9yOiAoeyBjb21tZW50X3JlID0gL15cXHMqIy92LCBzcGxpdHRlciA9ICdcXHQnLCB9KSAtPlxuICAgIGZvciB7IGxucjogbGluZV9uciwgbGluZSwgZW9sLCB9IGZyb20gd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBAcGF0aFxuICAgICAgbGluZSAgICA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLm5vcm1hbGl6ZV90ZXh0IGxpbmVcbiAgICAgIGpmaWVsZHMgPSBudWxsXG4gICAgICBzd2l0Y2ggdHJ1ZVxuICAgICAgICB3aGVuIC9eXFxzKiQvdi50ZXN0IGxpbmUgdGhlbiBsY29kZSA9ICdCJ1xuICAgICAgICB3aGVuIGNvbW1lbnRfcmUudGVzdCBsaW5lIHRoZW4gbGNvZGUgPSAnQydcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGxjb2RlID0gJ0QnXG4gICAgICAgICAgamZpZWxkcyAgID0gSlNPTi5zdHJpbmdpZnkgbGluZS5zcGxpdCBzcGxpdHRlclxuICAgICAgeWllbGQgeyBsaW5lX25yLCBsY29kZSwgbGluZSwgamZpZWxkcywgfVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB3YWxrX2RzZl90c3Y6IC0+XG4gICAgeWllbGQgZnJvbSBAX3dhbGtfZmllbGRzX3dpdGhfc2VwYXJhdG9yIHsgc3BsaXR0ZXI6ICdcXHQnLCB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHdhbGtfZHNmX3NlbWljb2xvbnM6IC0+XG4gICAgeWllbGQgZnJvbSBAX3dhbGtfZmllbGRzX3dpdGhfc2VwYXJhdG9yIHsgc3BsaXR0ZXI6ICc7JywgfVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB3YWxrX2RzZl9tZF90YWJsZTogLT5cbiAgICBmb3IgeyBsbnI6IGxpbmVfbnIsIGxpbmUsIGVvbCwgfSBmcm9tIHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgQHBhdGhcbiAgICAgIGxpbmUgICAgPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5ub3JtYWxpemVfdGV4dCBsaW5lXG4gICAgICBqZmllbGRzID0gbnVsbFxuICAgICAgbGNvZGUgICA9ICdVJ1xuICAgICAgc3dpdGNoIHRydWVcbiAgICAgICAgd2hlbiAvXlxccyokL3YudGVzdCBsaW5lICAgICAgIHRoZW4gbGNvZGUgPSAnQidcbiAgICAgICAgd2hlbiBub3QgbGluZS5zdGFydHNXaXRoICd8JyAgdGhlbiBudWxsICMgbm90IGFuIE1EIHRhYmxlXG4gICAgICAgIHdoZW4gbGluZS5zdGFydHNXaXRoICd8LScgICAgIHRoZW4gbnVsbCAjIE1EIHRhYmxlIGhlYWRlciBzZXBhcmF0b3JcbiAgICAgICAgd2hlbiAvXlxcfFxccytcXCovdi50ZXN0IGxpbmUgICAgdGhlbiBudWxsICMgTUQgdGFibGUgaGVhZGVyXG4gICAgICAgIGVsc2VcbiAgICAgICAgICBsY29kZSAgID0gJ0QnXG4gICAgICAgICAgamZpZWxkcyA9IGxpbmUuc3BsaXQgJ3wnXG4gICAgICAgICAgamZpZWxkcy5zaGlmdCgpXG4gICAgICAgICAgamZpZWxkcy5wb3AoKVxuICAgICAgICAgIGpmaWVsZHMgPSAoIGZpZWxkLnRyaW0oKSAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIGZpZWxkIGluIGpmaWVsZHMgKVxuICAgICAgICAgIGpmaWVsZHMgPSAoICggZmllbGQucmVwbGFjZSAvXmAoLispYCQvZ3YsICckMScgKSAgZm9yIGZpZWxkIGluIGpmaWVsZHMgKVxuICAgICAgICAgIGpmaWVsZHMgPSBKU09OLnN0cmluZ2lmeSBqZmllbGRzXG4gICAgICAgICAgIyBkZWJ1ZyAnzqlqenJzZGJfXzQwJywgamZpZWxkc1xuICAgICAgeWllbGQgeyBsaW5lX25yLCBsY29kZSwgbGluZSwgamZpZWxkcywgfVxuICAgIDtudWxsXG5cbiAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgd2Fsa19jc3Y6IC0+XG4gICMgICB5aWVsZCByZXR1cm4gbnVsbFxuXG4gICMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIHdhbGtfanNvbjogLT5cbiAgIyAgIHlpZWxkIHJldHVybiBudWxsXG5cbiAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgd2Fsa19tZDogLT5cbiAgIyAgIHlpZWxkIHJldHVybiBudWxsXG5cbiAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgd2Fsa190eHQ6IC0+XG4gICMgICB5aWVsZCByZXR1cm4gbnVsbFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgZGF0YXNvdXJjZV9mb3JtYXRfcGFyc2VyXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAcGFyc2VfdWNkYl9yc2dzX2dseXBocmFuZ2U6ICh7IGpmaWVsZHMsIH0pIC0+XG4gICAgWyBkZ3JvdXAsXG4gICAgICBpY2xhYmVsLFxuICAgICAgcnNnLFxuICAgICAgaXNfY2prX3R4dCxcbiAgICAgIGxvX2hpX3R4dCxcbiAgICAgIG5hbWUsICAgICBdID0gSlNPTi5wYXJzZSBqZmllbGRzXG4gICAgcmV0dXJuIG51bGwgdW5sZXNzIGRncm91cCBpcyAnYGRnOnJzZ3NgJ1xuICAgIGxvX2hpX3JlICAgICAgPSAvLy8gXiAweCAoPzxsbz4gWzAtOWEtZl17MSw2fSApIFxccypcXC5cXC5cXHMqIDB4ICg/PGhpPiBbMC05YS1mXXsxLDZ9ICkgJCAvLy9pdlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaXNfY2prID0gc3dpdGNoIGlzX2Nqa190eHRcbiAgICAgIHdoZW4gJ3RydWUnICAgdGhlbiAxXG4gICAgICB3aGVuICdmYWxzZScgIHRoZW4gMFxuICAgICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fNDEgZXhwZWN0ZWQgJ3RydWUnIG9yICdmYWxzZScsIGdvdCAje3JwciBpc19jamtfdHh0fVwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB1bmxlc3MgKCBtYXRjaCA9IGxvX2hpX3R4dC5tYXRjaCBsb19oaV9yZSApP1xuICAgICAgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfXzQyIGV4cGVjdGVkIGEgcmFuZ2UgbGl0ZXJhbCBsaWtlICcweDAxYTYuLjB4MTBmZicsIGdvdCAje3JwciBsb19oaV90eHR9XCJcbiAgICBsbyAgPSBwYXJzZUludCBtYXRjaC5ncm91cHMubG8sIDE2XG4gICAgaGkgID0gcGFyc2VJbnQgbWF0Y2guZ3JvdXBzLmhpLCAxNlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcmV0dXJuIHsgcnNnLCBpc19jamssIGxvLCBoaSwgbmFtZSwgfVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgZ2x5cGhfY29udmVydGVyXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAZ2x5cGhfZnJvbV9jaWQ6ICggY2lkICkgLT5cbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgKCAvXltcXHB7TH1cXHB7U31cXHB7UH1cXHB7TX1cXHB7Tn1cXHB7WnN9XFxwe0NvfV0kL3YudGVzdCBSID0gU3RyaW5nLmZyb21Db2RlUG9pbnQgY2lkIClcbiAgICByZXR1cm4gUlxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQGdlbmVyYXRlX2NpZHNfYW5kX2dseXBoczogKCBsbywgaGkgKSAtPlxuICAgIGZvciBjaWQgaW4gWyBsbyAuLiBoaSBdXG4gICAgICBjb250aW51ZSB1bmxlc3MgKCBnbHlwaCA9IEBnbHlwaF9mcm9tX2NpZCBjaWQgKT9cbiAgICAgIHlpZWxkIHsgY2lkLCBnbHlwaCwgfVxuICAgIDtudWxsXG5cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMjI1xuXG5vb29vb1xuYDg4OCdcbiA4ODggICAgICAgICAgLm9vb28uICAgb29vLiAub28uICAgIC5vb29vb29vbyAgICAgICAgICAgICAgLm9vb28ubyBvb29vIGQ4YiBvb29vICAgIG9vb1xuIDg4OCAgICAgICAgIGBQICApODhiICBgODg4UFwiWTg4YiAgODg4JyBgODhiICAgICAgICAgICAgICBkODgoICBcIjggYDg4OFwiXCI4UCAgYDg4LiAgLjgnXG4gODg4ICAgICAgICAgIC5vUFwiODg4ICAgODg4ICAgODg4ICA4ODggICA4ODggICAgICAgICAgICAgIGBcIlk4OGIuICAgODg4ICAgICAgIGA4OC4uOCdcbiA4ODggICAgICAgbyBkOCggIDg4OCAgIDg4OCAgIDg4OCAgYDg4Ym9kOFAnICAgICAgICAgICAgICBvLiAgKTg4YiAgODg4ICAgICAgICBgODg4J1xubzg4OG9vb29vb2Q4IGBZODg4XCJcIjhvIG84ODhvIG84ODhvIGA4b29vb29vLiAgb29vb29vb29vb28gOFwiXCI4ODhQJyBkODg4YiAgICAgICAgYDgnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRcIiAgICAgWURcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJZODg4ODhQJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIExhbmd1YWdlX3NlcnZpY2VzXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICBAX1RNUF9oYW5nZXVsID0gcmVxdWlyZSAnaGFuZ3VsLWRpc2Fzc2VtYmxlJ1xuICAgIEBfVE1QX2thbmEgICAgPSByZXF1aXJlICd3YW5ha2FuYSdcbiAgICAjIHsgdG9IaXJhZ2FuYSxcbiAgICAjICAgdG9LYW5hLFxuICAgICMgICB0b0thdGFrYW5hXG4gICAgIyAgIHRvUm9tYWppLFxuICAgICMgICB0b2tlbml6ZSwgICAgICAgICB9ID0gcmVxdWlyZSAnd2FuYWthbmEnXG4gICAgO3VuZGVmaW5lZFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgbm9ybWFsaXplX3RleHQ6ICggdGV4dCwgZm9ybSA9ICdORkMnICkgLT4gdGV4dC5ub3JtYWxpemUgZm9ybVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcmVtb3ZlX3Bpbnlpbl9kaWFjcml0aWNzOiAoIHRleHQgKSAtPiAoIHRleHQubm9ybWFsaXplICdORktEJyApLnJlcGxhY2UgL1xcUHtMfS9ndiwgJydcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGV4dHJhY3RfYXRvbmFsX3poX3JlYWRpbmdzOiAoIGVudHJ5ICkgLT5cbiAgICAjIHB5Onpow7ksIHpoZSwgemjEgW8sIHpow6FvLCB6aMeULCB6xKtcbiAgICBSID0gZW50cnlcbiAgICBSID0gUi5yZXBsYWNlIC9ecHk6L3YsICcnXG4gICAgUiA9IFIuc3BsaXQgLyxcXHMqL3ZcbiAgICBSID0gKCAoIEByZW1vdmVfcGlueWluX2RpYWNyaXRpY3MgemhfcmVhZGluZyApIGZvciB6aF9yZWFkaW5nIGluIFIgKVxuICAgIFIgPSBuZXcgU2V0IFJcbiAgICBSLmRlbGV0ZSAnbnVsbCdcbiAgICBSLmRlbGV0ZSAnQG51bGwnXG4gICAgcmV0dXJuIFsgUi4uLiwgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZXh0cmFjdF9qYV9yZWFkaW5nczogKCBlbnRyeSApIC0+XG4gICAgIyDnqbogICAgICBoaTrjgZ3jgoksIOOBgsK3KOOBj3zjgY1844GR44KLKSwg44GL44KJLCDjgZnCtyjjgY9844GL44GZKSwg44KA44GqwrfjgZfjgYRcbiAgICBSID0gZW50cnlcbiAgICBSID0gUi5yZXBsYWNlIC9eKD86aGl8a2EpOi92LCAnJ1xuICAgIFIgPSBSLnJlcGxhY2UgL1xccysvZ3YsICcnXG4gICAgUiA9IFIuc3BsaXQgLyxcXHMqL3ZcbiAgICAjIyMgTk9URSByZW1vdmUgbm8tcmVhZGluZ3MgbWFya2VyIGBAbnVsbGAgYW5kIGNvbnRleHR1YWwgcmVhZGluZ3MgbGlrZSAt44ON44OzIGZvciDnuIEsIC3jg47jgqYgZm9yIOeOiyAjIyNcbiAgICBSID0gKCByZWFkaW5nIGZvciByZWFkaW5nIGluIFIgd2hlbiBub3QgcmVhZGluZy5zdGFydHNXaXRoICctJyApXG4gICAgUiA9IG5ldyBTZXQgUlxuICAgIFIuZGVsZXRlICdudWxsJ1xuICAgIFIuZGVsZXRlICdAbnVsbCdcbiAgICByZXR1cm4gWyBSLi4uLCBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBleHRyYWN0X2hnX3JlYWRpbmdzOiAoIGVudHJ5ICkgLT5cbiAgICAjIOepuiAgICAgIGhpOuOBneOCiSwg44GCwrco44GPfOOBjXzjgZHjgospLCDjgYvjgoksIOOBmcK3KOOBj3zjgYvjgZkpLCDjgoDjgarCt+OBl+OBhFxuICAgIFIgPSBlbnRyeVxuICAgIFIgPSBSLnJlcGxhY2UgL14oPzpoZyk6L3YsICcnXG4gICAgUiA9IFIucmVwbGFjZSAvXFxzKy9ndiwgJydcbiAgICBSID0gUi5zcGxpdCAvLFxccyovdlxuICAgIFIgPSBuZXcgU2V0IFJcbiAgICBSLmRlbGV0ZSAnbnVsbCdcbiAgICBSLmRlbGV0ZSAnQG51bGwnXG4gICAgaGFuZ2V1bCA9IFsgUi4uLiwgXS5qb2luICcnXG4gICAgIyBkZWJ1ZyAnzqlqenJzZGJfXzQzJywgQF9UTVBfaGFuZ2V1bC5kaXNhc3NlbWJsZSBoYW5nZXVsLCB7IGZsYXR0ZW46IGZhbHNlLCB9XG4gICAgcmV0dXJuIFsgUi4uLiwgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcm9tYW5pemVfamFfa2FuYTogKCBlbnRyeSApIC0+XG4gICAgY2ZnID0ge31cbiAgICByZXR1cm4gQF9UTVBfa2FuYS50b1JvbWFqaSBlbnRyeSwgY2ZnXG4gICAgIyAjIyMgc3lzdGVtYXRpYyBuYW1lIG1vcmUgbGlrZSBgLi4uX2phX3hfa2FuX2xhdG4oKWAgIyMjXG4gICAgIyBoZWxwICfOqWRqa3JfXzQ0JywgdG9IaXJhZ2FuYSAgJ+ODqeODvOODoeODsycsICAgICAgIHsgY29udmVydExvbmdWb3dlbE1hcms6IGZhbHNlLCB9XG4gICAgIyBoZWxwICfOqWRqa3JfXzQ1JywgdG9IaXJhZ2FuYSAgJ+ODqeODvOODoeODsycsICAgICAgIHsgY29udmVydExvbmdWb3dlbE1hcms6IHRydWUsIH1cbiAgICAjIGhlbHAgJ86pZGprcl9fNDYnLCB0b0thbmEgICAgICAnd2FuYWthbmEnLCAgIHsgY3VzdG9tS2FuYU1hcHBpbmc6IHsgbmE6ICfjgasnLCBrYTogJ0JhbmEnIH0sIH1cbiAgICAjIGhlbHAgJ86pZGprcl9fNDcnLCB0b0thbmEgICAgICAnd2FuYWthbmEnLCAgIHsgY3VzdG9tS2FuYU1hcHBpbmc6IHsgd2FrYTogJyjlkozmrYwpJywgd2E6ICco5ZKMMiknLCBrYTogJyjmrYwyKScsIG5hOiAnKOWQjSknLCBrYTogJyhCYW5hKScsIG5ha2E6ICco5LitKScsIH0sIH1cbiAgICAjIGhlbHAgJ86pZGprcl9fNDgnLCB0b1JvbWFqaSAgICAn44Gk44GY44GO44KKJywgICAgIHsgY3VzdG9tUm9tYWppTWFwcGluZzogeyDjgZg6ICcoemkpJywg44GkOiAnKHR1KScsIOOCijogJyhsaSknLCDjgorjgofjgYY6ICcocnlvdSknLCDjgorjgoc6ICcocnlvKScgfSwgfVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgcGFyc2VfaWRseDogKCBmb3JtdWxhICkgLT4gSURMWC5wYXJzZSBmb3JtdWxhXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBvcGVyYXRvcnNfYW5kX2NvbXBvbmVudHNfZnJvbV9pZGx4OiAoIGZvcm11bGEgKSAtPlxuICAgIHN3aXRjaCB0eXBlID0gdHlwZV9vZiBmb3JtdWxhXG4gICAgICB3aGVuICd0ZXh0JyAgIHRoZW4gIGZvcm11bGFfYXN0ID0gQHBhcnNlX2lkbHggZm9ybXVsYVxuICAgICAgd2hlbiAnbGlzdCcgICB0aGVuICBmb3JtdWxhX2FzdCA9ICAgICAgICAgICAgIGZvcm11bGFcbiAgICAgIGVsc2UgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfXzQ5IGV4cGVjdGVkIGEgdGV4dCBvciBhIGxpc3QsIGdvdCBhICN7dHlwZX1cIlxuICAgIG9wZXJhdG9ycyAgID0gW11cbiAgICBjb21wb25lbnRzICA9IFtdXG4gICAgc2VwYXJhdGUgICAgPSAoIGxpc3QgKSAtPlxuICAgICAgZm9yIGVsZW1lbnQsIGlkeCBpbiBsaXN0XG4gICAgICAgIGlmIGlkeCBpcyAwXG4gICAgICAgICAgb3BlcmF0b3JzLnB1c2ggZWxlbWVudFxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIGlmICggdHlwZV9vZiBlbGVtZW50ICkgaXMgJ2xpc3QnXG4gICAgICAgICAgc2VwYXJhdGUgZWxlbWVudFxuICAgICAgICAgICMgY29tcG9uZW50cy5zcGxpY2UgY29tcG9uZW50cy5sZW5ndGgsIDAsICggc2VwYXJhdGUgZWxlbWVudCApLi4uXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgY29tcG9uZW50cy5wdXNoIGVsZW1lbnRcbiAgICBzZXBhcmF0ZSBmb3JtdWxhX2FzdFxuICAgIHJldHVybiB7IG9wZXJhdG9ycywgY29tcG9uZW50cywgfVxuXG5cblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMjIyBUQUlOVCBnb2VzIGludG8gY29uc3RydWN0b3Igb2YgSnpyIGNsYXNzICMjI1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMjI1xuXG4gICBvb29vICBvOG9cbiAgIGA4ODggIGBcIidcbiAgICA4ODggb29vbyAgICBvb29vb29vbyBvb29vICBvb29vICBvb29vIGQ4YiAgLm9vb28uXG4gICAgODg4IGA4ODggICBkJ1wiXCI3ZDhQICBgODg4ICBgODg4ICBgODg4XCJcIjhQIGBQICApODhiXG4gICAgODg4ICA4ODggICAgIC5kOFAnICAgIDg4OCAgIDg4OCAgIDg4OCAgICAgIC5vUFwiODg4XG4gICAgODg4ICA4ODggICAuZDhQJyAgLlAgIDg4OCAgIDg4OCAgIDg4OCAgICAgZDgoICA4ODhcbi5vLiA4OFAgbzg4OG8gZDg4ODg4ODhQICAgYFY4OFZcIlY4UCcgZDg4OGIgICAgYFk4ODhcIlwiOG9cbmBZODg4UFxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEppenVyYVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6IC0+XG4gICAgeyBwYXRocywgfSAgICAgICAgICA9IGdldF9wYXRoc19hbmRfZm9ybWF0cygpXG4gICAgQHBhdGhzICAgICAgICAgICAgICA9IHBhdGhzXG4gICAgQGxhbmd1YWdlX3NlcnZpY2VzICA9IG5ldyBMYW5ndWFnZV9zZXJ2aWNlcygpXG4gICAgQGRiYSAgICAgICAgICAgICAgICA9IG5ldyBKenJfZGJfYWRhcHRlciBAcGF0aHMuZGIsIHsgaG9zdDogQCwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcGFyYW1ldGVyX3NldHMgICAgICA9IFtcbiAgICAgIHsgZHNrZXk6ICdkczpkaWN0Ong6a28tSGFuZytMYXRuJywgIHZfcmU6ICd8JywgICAgfVxuICAgICAgeyBkc2tleTogJ2RzOmRpY3Q6bWVhbmluZ3MnLCAgICAgICAgdl9yZTogJ15weTonLCB9XG4gICAgICB7IGRza2V5OiAnZHM6ZGljdDptZWFuaW5ncycsICAgICAgICB2X3JlOiAnXmthOicsIH1cbiAgICAgIHsgZHNrZXk6ICdkczpkaWN0Om1lYW5pbmdzJywgICAgICAgIHZfcmU6ICdeaGk6JywgfVxuICAgICAgeyBkc2tleTogJ2RzOmRpY3Q6bWVhbmluZ3MnLCAgICAgICAgdl9yZTogJ15oZzonLCB9XG4gICAgICB7IGRza2V5OiAnZHM6c2hhcGU6aWRzdjInLCAgICAgICAgICB2X3JlOiAnfCcsICAgIH1cbiAgICAgIHsgZHNrZXk6ICdkczp1Y2Q6dWNkJywgICAgICAgICAgICAgIHZfcmU6ICd8JywgICAgfVxuICAgICAgXVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaWYgQGRiYS5pc19mcmVzaFxuICAgICAgIyMjIFRBSU5UIG1vdmUgdG8gSnpyX2RiX2FkYXB0ZXIgdG9nZXRoZXIgd2l0aCB0cnkvY2F0Y2ggIyMjXG4gICAgICBmb3IgcGFyYW1ldGVycyBpbiBwYXJhbWV0ZXJfc2V0c1xuICAgICAgICBkZWJ1ZyAnzqlqenJzZGJfXzUwJywgJ3BvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlcycsIHBhcmFtZXRlcnNcbiAgICAgICAgdHJ5XG4gICAgICAgICAgQGRiYS5zdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlcy5ydW4gcGFyYW1ldGVyc1xuICAgICAgICBjYXRjaCBjYXVzZVxuICAgICAgICAgIGZpZWxkc19ycHIgPSBycHIgQGRiYS5zdGF0ZS5tb3N0X3JlY2VudF9pbnNlcnRlZF9yb3dcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fNTEgd2hlbiB0cnlpbmcgdG8gaW5zZXJ0IHRoaXMgcm93OiAje2ZpZWxkc19ycHJ9LCBhbiBlcnJvciB3YXMgdGhyb3duOiAje2NhdXNlLm1lc3NhZ2V9XCIsIFxcXG4gICAgICAgICAgICB7IGNhdXNlLCB9XG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgIyMjIFRBSU5UIG1vdmUgdG8gSnpyX2RiX2FkYXB0ZXIgdG9nZXRoZXIgd2l0aCB0cnkvY2F0Y2ggIyMjXG4gICAgICBkZWJ1ZyAnzqlqenJzZGJfXzUyJywgJ3BvcHVsYXRlX2p6cl9sYW5nX2hhbmdldWxfc3lsbGFibGVzJ1xuICAgICAgdHJ5XG4gICAgICAgIEBkYmEuc3RhdGVtZW50cy5wb3B1bGF0ZV9qenJfbGFuZ19oYW5nZXVsX3N5bGxhYmxlcy5ydW4oKVxuICAgICAgY2F0Y2ggY2F1c2VcbiAgICAgICAgZmllbGRzX3JwciA9IHJwciBAZGJhLnN0YXRlLm1vc3RfcmVjZW50X2luc2VydGVkX3Jvd1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fNTMgd2hlbiB0cnlpbmcgdG8gaW5zZXJ0IHRoaXMgcm93OiAje2ZpZWxkc19ycHJ9LCBhbiBlcnJvciB3YXMgdGhyb3duOiAje2NhdXNlLm1lc3NhZ2V9XCIsIFxcXG4gICAgICAgICAgeyBjYXVzZSwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO3VuZGVmaW5lZFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2hvd19jb3VudHM6IC0+XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkbyA9PlxuICAgICAgcXVlcnkgPSBTUUxcIlwiXCJcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICBtdi52ICAgICAgICAgICAgYXMgdixcbiAgICAgICAgICAgIGNvdW50KCB0My52ICkgICBhcyBjb3VudFxuICAgICAgICAgIGZyb20gICAgICAgIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHQzXG4gICAgICAgICAgcmlnaHQgam9pbiAganpyX21pcnJvcl92ZXJicyAgICAgICAgYXMgbXYgdXNpbmcgKCB2IClcbiAgICAgICAgZ3JvdXAgYnkgdlxuICAgICAgICBvcmRlciBieSBjb3VudCBkZXNjLCB2O1wiXCJcIlxuICAgICAgZWNobyAoIGdyZXkgJ86panpyc2RiX181NCcgKSwgKCBnb2xkIHJldmVyc2UgYm9sZCBxdWVyeSApXG4gICAgICBjb3VudHMgPSAoIEBkYmEucHJlcGFyZSBxdWVyeSApLmFsbCgpXG4gICAgICBjb25zb2xlLnRhYmxlIGNvdW50c1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZG8gPT5cbiAgICAgIHF1ZXJ5ID0gU1FMXCJcIlwiXG4gICAgICAgIHNlbGVjdFxuICAgICAgICAgICAgbXYudiAgICAgICAgICAgIGFzIHYsXG4gICAgICAgICAgICBjb3VudCggdDMudiApICAgYXMgY291bnRcbiAgICAgICAgICBmcm9tICAgICAgICBqenJfdHJpcGxlcyAgICAgICBhcyB0M1xuICAgICAgICAgIHJpZ2h0IGpvaW4gIGp6cl9taXJyb3JfdmVyYnMgIGFzIG12IHVzaW5nICggdiApXG4gICAgICAgIGdyb3VwIGJ5IHZcbiAgICAgICAgb3JkZXIgYnkgY291bnQgZGVzYywgdjtcIlwiXCJcbiAgICAgIGVjaG8gKCBncmV5ICfOqWp6cnNkYl9fNTUnICksICggZ29sZCByZXZlcnNlIGJvbGQgcXVlcnkgKVxuICAgICAgY291bnRzID0gKCBAZGJhLnByZXBhcmUgcXVlcnkgKS5hbGwoKVxuICAgICAgY29uc29sZS50YWJsZSBjb3VudHNcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRvID0+XG4gICAgICBxdWVyeSA9IFNRTFwiXCJcIlxuICAgICAgICBzZWxlY3QgZHNrZXksIGNvdW50KCopIGFzIGNvdW50IGZyb20ganpyX21pcnJvcl9saW5lcyBncm91cCBieSBkc2tleSB1bmlvbiBhbGxcbiAgICAgICAgc2VsZWN0ICcqJywgICBjb3VudCgqKSBhcyBjb3VudCBmcm9tIGp6cl9taXJyb3JfbGluZXNcbiAgICAgICAgb3JkZXIgYnkgY291bnQgZGVzYztcIlwiXCJcbiAgICAgIGVjaG8gKCBncmV5ICfOqWp6cnNkYl9fNTYnICksICggZ29sZCByZXZlcnNlIGJvbGQgcXVlcnkgKVxuICAgICAgY291bnRzID0gKCBAZGJhLnByZXBhcmUgcXVlcnkgKS5hbGwoKVxuICAgICAgY291bnRzID0gT2JqZWN0LmZyb21FbnRyaWVzICggWyBkc2tleSwgeyBjb3VudCwgfSwgXSBmb3IgeyBkc2tleSwgY291bnQsIH0gaW4gY291bnRzIClcbiAgICAgIGNvbnNvbGUudGFibGUgY291bnRzXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgc2hvd19qenJfbWV0YV9mYXVsdHM6IC0+XG4gICAgaWYgKCBmYXVsdHlfcm93cyA9ICggQGRiYS5wcmVwYXJlIFNRTFwic2VsZWN0ICogZnJvbSBqenJfbWV0YV9mYXVsdHM7XCIgKS5hbGwoKSApLmxlbmd0aCA+IDBcbiAgICAgIGVjaG8gJ86panpyc2RiX181NycsIHJlZCByZXZlcnNlIGJvbGQgXCIgZm91bmQgc29tZSBmYXVsdHM6IFwiXG4gICAgICBjb25zb2xlLnRhYmxlIGZhdWx0eV9yb3dzXG4gICAgZWxzZVxuICAgICAgZWNobyAnzqlqenJzZGJfXzU4JywgbGltZSByZXZlcnNlIGJvbGQgXCIgKG5vIGZhdWx0cykgXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDtudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5tb2R1bGUuZXhwb3J0cyA9IGRvID0+XG4gIGludGVybmFscyA9IHtcbiAgICBKenJfZGJfYWRhcHRlcixcbiAgICBEYXRhc291cmNlX2ZpZWxkX3BhcnNlcixcbiAgICBkYXRhc291cmNlX2Zvcm1hdF9wYXJzZXIsXG4gICAgTGFuZ3VhZ2Vfc2VydmljZXMsXG4gICAgZ2V0X3BhdGhzX2FuZF9mb3JtYXRzLCB9XG4gIHJldHVybiB7XG4gICAgSml6dXJhLFxuICAgIGludGVybmFscywgfVxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmlmIG1vZHVsZSBpcyByZXF1aXJlLm1haW4gdGhlbiBkbyA9PlxuICBqenIgPSBuZXcgSml6dXJhKCkgIyB0cmlnZ2VycyByZWJ1aWxkIG9mIERCIHdoZW4gbmVjZXNzYXJ5XG4gIDtudWxsXG5cbiJdfQ==
