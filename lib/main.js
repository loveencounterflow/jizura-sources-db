(function() {
  'use strict';
  var Async_jetstream, Benchmarker, Datasource_field_parser, Dbric, Dbric_std, FS, GUY, IDL, IDLX, IDN, Jetstream, Jizura, Jzr_db_adapter, LIT, Language_services, PATH, SFMODULES, SQL, VEC, alert, as_bool, benchmarker, blue, bold, datasource_format_parser, debug, demo_source_identifiers, echo, esql, freeze, from_bool, get_paths_and_formats, glyph_converter, gold, green, grey, help, info, inspect, lets, lime, log, plain, praise, red, reverse, rpr, set_getter, timeit, type_of, urge, walk_lines_with_positions, warn, whisper, white;

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
  SFMODULES = require('../../bricabrac-sfmodules');

  //...........................................................................................................
  ({Dbric, Dbric_std, SQL, IDN, LIT, VEC, esql, from_bool, as_bool} = SFMODULES.unstable.require_dbric());

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxXQUFBLEVBQUEsdUJBQUEsRUFBQSxLQUFBLEVBQUEsU0FBQSxFQUFBLEVBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQSxjQUFBLEVBQUEsR0FBQSxFQUFBLGlCQUFBLEVBQUEsSUFBQSxFQUFBLFNBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsV0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsd0JBQUEsRUFBQSxLQUFBLEVBQUEsdUJBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUEscUJBQUEsRUFBQSxlQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEseUJBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUE7OztFQUdBLEdBQUEsR0FBNEIsT0FBQSxDQUFRLEtBQVI7O0VBQzVCLENBQUEsQ0FBRSxLQUFGLEVBQ0UsS0FERixFQUVFLElBRkYsRUFHRSxJQUhGLEVBSUUsS0FKRixFQUtFLE1BTEYsRUFNRSxJQU5GLEVBT0UsSUFQRixFQVFFLE9BUkYsQ0FBQSxHQVE0QixHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVIsQ0FBb0IsbUJBQXBCLENBUjVCOztFQVNBLENBQUEsQ0FBRSxHQUFGLEVBQ0UsT0FERixFQUVFLElBRkYsRUFH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QUssT0FBQSxDQUFRLElBQUEsQ0FBSyxlQUFMLENBQVIsQ0FBTCxDQUFwQixFQUpGO09BQUo7O2FBTUs7SUFQbUI7O0VBbkZ4QixFQS8wQ0E7OztFQTY2Q0EsTUFBTSxDQUFDLE9BQVAsR0FBb0IsQ0FBQSxDQUFBLENBQUEsR0FBQTtBQUNwQixRQUFBO0lBQUUsU0FBQSxHQUFZLENBQ1YsY0FEVSxFQUVWLHVCQUZVLEVBR1Ysd0JBSFUsRUFJVixpQkFKVSxFQUtWLHFCQUxVO0FBTVosV0FBTyxDQUNMLE1BREssRUFFTCxTQUZLO0VBUFcsQ0FBQSxJQTc2Q3BCOzs7RUF5N0NBLElBQUcsTUFBQSxLQUFVLE9BQU8sQ0FBQyxJQUFyQjtJQUFrQyxDQUFBLENBQUEsQ0FBQSxHQUFBO0FBQ2xDLFVBQUE7TUFBRSxHQUFBLEdBQU0sSUFBSSxNQUFKLENBQUEsRUFBUjthQUNHO0lBRitCLENBQUEsSUFBbEM7O0FBejdDQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCdcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5HVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xueyBhbGVydFxuICBkZWJ1Z1xuICBoZWxwXG4gIGluZm9cbiAgcGxhaW5cbiAgcHJhaXNlXG4gIHVyZ2VcbiAgd2FyblxuICB3aGlzcGVyIH0gICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ2ppenVyYS1zb3VyY2VzLWRiJ1xueyBycHJcbiAgaW5zcGVjdFxuICBlY2hvXG4gIHdoaXRlXG4gIGdyZWVuXG4gIGJsdWVcbiAgbGltZVxuICBnb2xkXG4gIGdyZXlcbiAgcmVkXG4gIGJvbGRcbiAgcmV2ZXJzZVxuICBsb2cgICAgIH0gICAgICAgICAgICAgICA9IEdVWS50cm1cbiMgeyBmIH0gICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9lZmZzdHJpbmcnXG4jIHdyaXRlICAgICAgICAgICAgICAgICAgICAgPSAoIHAgKSAtPiBwcm9jZXNzLnN0ZG91dC53cml0ZSBwXG4jIHsgbmZhIH0gICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvbm9ybWFsaXplLWZ1bmN0aW9uLWFyZ3VtZW50cydcbiMgR1RORyAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ndXktdGVzdC1ORydcbiMgeyBUZXN0ICAgICAgICAgICAgICAgICAgfSA9IEdUTkdcbkZTICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOmZzJ1xuUEFUSCAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6cGF0aCdcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuU0ZNT0RVTEVTICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2JyaWNhYnJhYy1zZm1vZHVsZXMnXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgRGJyaWMsXG4gIERicmljX3N0ZCxcbiAgU1FMLFxuICBJRE4sXG4gIExJVCxcbiAgVkVDLFxuICBlc3FsLFxuICBmcm9tX2Jvb2wsXG4gIGFzX2Jvb2wsICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZGJyaWMoKVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IGxldHMsXG4gIGZyZWV6ZSwgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfbGV0c2ZyZWV6ZXRoYXRfaW5mcmEoKS5zaW1wbGVcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBKZXRzdHJlYW0sXG4gIEFzeW5jX2pldHN0cmVhbSwgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfamV0c3RyZWFtKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zXG4gICAgICAgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBCZW5jaG1hcmtlciwgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2JlbmNobWFya2luZygpXG5iZW5jaG1hcmtlciAgICAgICAgICAgICAgICAgICA9IG5ldyBCZW5jaG1hcmtlcigpXG50aW1laXQgICAgICAgICAgICAgICAgICAgICAgICA9ICggUC4uLiApIC0+IGJlbmNobWFya2VyLnRpbWVpdCBQLi4uXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgc2V0X2dldHRlciwgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9tYW5hZ2VkX3Byb3BlcnR5X3Rvb2xzKClcbnsgSURMLCBJRExYLCAgICAgICAgICAgIH0gPSByZXF1aXJlICdtb2ppa3VyYS1pZGwnXG57IHR5cGVfb2YsICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfdHlwZV9vZigpXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5kZW1vX3NvdXJjZV9pZGVudGlmaWVycyA9IC0+XG4gIHsgZXhwYW5kX2RpY3Rpb25hcnksICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2RpY3Rpb25hcnlfdG9vbHMoKVxuICB7IGdldF9sb2NhbF9kZXN0aW5hdGlvbnMsIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9nZXRfbG9jYWxfZGVzdGluYXRpb25zKClcbiAgZm9yIGtleSwgdmFsdWUgb2YgZ2V0X2xvY2FsX2Rlc3RpbmF0aW9ucygpXG4gICAgZGVidWcgJ86panpyc2RiX19fMScsIGtleSwgdmFsdWVcbiAgIyBjYW4gYXBwZW5kIGxpbmUgbnVtYmVycyB0byBmaWxlcyBhcyBpbjpcbiAgIyAnZHM6ZGljdDptZWFuaW5ncy4xOkw9MTMzMzInXG4gICMgJ2RzOmRpY3Q6dWNkMTQwLjE6dWhkaWR4Okw9MTIzNCdcbiAgIyByb3dpZHM6ICd0OmpmbTpSPTEnXG4gICMge1xuICAjICAgJ2RzOmRpY3Q6bWVhbmluZ3MnOiAgICAgICAgICAnJGp6cmRzL21lYW5pbmcvbWVhbmluZ3MudHh0J1xuICAjICAgJ2RzOmRpY3Q6dWNkOnYxNC4wOnVoZGlkeCcgOiAnJGp6cmRzL3VuaWNvZGUub3JnLXVjZC12MTQuMC9VbmloYW5fRGljdGlvbmFyeUluZGljZXMudHh0J1xuICAjICAgfVxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMjI1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgLiAgIG9vb29cbiAgICAgICAgICAgICAgICAgICAgICAgLm84ICAgYDg4OFxub28ub29vb28uICAgLm9vb28uICAgLm84ODhvbyAgODg4IC5vby4gICAgLm9vb28ub1xuIDg4OCcgYDg4YiBgUCAgKTg4YiAgICA4ODggICAgODg4UFwiWTg4YiAgZDg4KCAgXCI4XG4gODg4ICAgODg4ICAub1BcIjg4OCAgICA4ODggICAgODg4ICAgODg4ICBgXCJZODhiLlxuIDg4OCAgIDg4OCBkOCggIDg4OCAgICA4ODggLiAgODg4ICAgODg4ICBvLiAgKTg4YlxuIDg4OGJvZDhQJyBgWTg4OFwiXCI4byAgIFwiODg4XCIgbzg4OG8gbzg4OG8gOFwiXCI4ODhQJ1xuIDg4OFxubzg4OG9cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmdldF9wYXRoc19hbmRfZm9ybWF0cyA9IC0+XG4gIHBhdGhzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0ge31cbiAgZm9ybWF0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSB7fVxuICBSICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IHsgcGF0aHMsIGZvcm1hdHMsIH1cbiAgcGF0aHMuYmFzZSAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4nXG4gIHBhdGhzLmp6ciAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5yZXNvbHZlIHBhdGhzLmJhc2UsICcuLidcbiAgcGF0aHMuZGIgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gcGF0aHMuYmFzZSwgJ2p6ci5kYidcbiAgIyBwYXRocy5kYiAgICAgICAgICAgICAgICAgICAgICAgICAgICA9ICcvZGV2L3NobS9qenIuZGInXG4gICMgcGF0aHMuanpyZHMgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gcGF0aHMuYmFzZSwgJ2p6cmRzJ1xuICBwYXRocy5qenJuZHMgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBwYXRocy5iYXNlLCAnaml6dXJhLW5ldy1kYXRhc291cmNlcydcbiAgcGF0aHMubW9qaWt1cmEgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gcGF0aHMuanpybmRzLCAnbW9qaWt1cmEnXG4gIHBhdGhzLnJhd19naXRodWIgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIHBhdGhzLmp6cm5kcywgJ2J2ZnMvb3JpZ2luL2h0dHBzL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20nXG4gIGthbmppdW0gICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5qb2luIHBhdGhzLnJhd19naXRodWIsICdtaWZ1bmV0b3NoaXJvL2thbmppdW0vOGEwY2RhYTE2ZDY0YTI4MWEyMDQ4ZGUyZWVlMmVjNWUzYTQ0MGZhNidcbiAgcnV0b3BpbyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gcGF0aHMucmF3X2dpdGh1YiwgJ3J1dG9waW8vS29yZWFuLU5hbWUtSGFuamEtQ2hhcnNldC8xMmRmMWJhMWI0ZGZhYTA5NTgxM2U0ZGRmYmE0MjRlODE2Zjk0YzUzJ1xuICB1Y2QxNzAwICAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBwYXRocy5qenJuZHMsICdidmZzL29yaWdpbi9odHRwcy93d3cudW5pY29kZS5vcmcvUHVibGljLzE3LjAuMC91Y2QnXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyBwYXRoc1sgJ2RzOmRpY3Q6dWNkOnYxNC4wOnVoZGlkeCcgICAgICBdICAgPSBQQVRILmpvaW4gcGF0aHMuanpybmRzLCAndW5pY29kZS5vcmctdWNkLXYxNC4wL1VuaWhhbl9EaWN0aW9uYXJ5SW5kaWNlcy50eHQnXG4gIHBhdGhzWyAnZHM6ZGljdDp4OmtvLUhhbmcrTGF0bicgICAgICAgICBdICA9IFBBVEguam9pbiBwYXRocy5qenJuZHMsICdoYW5nZXVsLXRyYW5zY3JpcHRpb25zLnRzdidcbiAgcGF0aHNbICdkczpkaWN0Ong6amEtS2FuK0xhdG4nICAgICAgICAgIF0gID0gUEFUSC5qb2luIHBhdGhzLmp6cm5kcywgJ2thbmEtdHJhbnNjcmlwdGlvbnMudHN2J1xuICBwYXRoc1sgJ2RzOmRpY3Q6YmNwNDcnICAgICAgICAgICAgICAgICAgXSAgPSBQQVRILmpvaW4gcGF0aHMuanpybmRzLCAnQkNQNDctbGFuZ3VhZ2Utc2NyaXB0cy1yZWdpb25zLnRzdidcbiAgcGF0aHNbICdkczpkaWN0OmphOmthbmppdW0nICAgICAgICAgICAgIF0gID0gUEFUSC5qb2luIGthbmppdW0sICdkYXRhL3NvdXJjZV9maWxlcy9rYW5qaWRpY3QudHh0J1xuICBwYXRoc1sgJ2RzOmRpY3Q6amE6a2Fuaml1bTphdXgnICAgICAgICAgXSAgPSBQQVRILmpvaW4ga2Fuaml1bSwgJ2RhdGEvc291cmNlX2ZpbGVzLzBfUkVBRE1FLnR4dCdcbiAgcGF0aHNbICdkczpkaWN0OmtvOlY9ZGF0YS1nb3YuY3N2JyAgICAgIF0gID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLWdvdi5jc3YnXG4gIHBhdGhzWyAnZHM6ZGljdDprbzpWPWRhdGEtZ292Lmpzb24nICAgICBdICA9IFBBVEguam9pbiBydXRvcGlvLCAnZGF0YS1nb3YuanNvbidcbiAgcGF0aHNbICdkczpkaWN0OmtvOlY9ZGF0YS1uYXZlci5jc3YnICAgIF0gID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLW5hdmVyLmNzdidcbiAgcGF0aHNbICdkczpkaWN0OmtvOlY9ZGF0YS1uYXZlci5qc29uJyAgIF0gID0gUEFUSC5qb2luIHJ1dG9waW8sICdkYXRhLW5hdmVyLmpzb24nXG4gIHBhdGhzWyAnZHM6ZGljdDprbzpWPVJFQURNRS5tZCcgICAgICAgICBdICA9IFBBVEguam9pbiBydXRvcGlvLCAnUkVBRE1FLm1kJ1xuICBwYXRoc1sgJ2RzOmRpY3Q6bWVhbmluZ3MnICAgICAgICAgICAgICAgXSAgPSBQQVRILmpvaW4gcGF0aHMubW9qaWt1cmEsICdtZWFuaW5nL21lYW5pbmdzLnR4dCdcbiAgcGF0aHNbICdkczpzaGFwZTppZHN2MicgICAgICAgICAgICAgICAgIF0gID0gUEFUSC5qb2luIHBhdGhzLm1vamlrdXJhLCAnc2hhcGUvc2hhcGUtYnJlYWtkb3duLWZvcm11bGEtdjIudHh0J1xuICBwYXRoc1sgJ2RzOnNoYXBlOnpoejViZicgICAgICAgICAgICAgICAgXSAgPSBQQVRILmpvaW4gcGF0aHMubW9qaWt1cmEsICdzaGFwZS9zaGFwZS1zdHJva2VvcmRlci16aGF6aXd1YmlmYS50eHQnXG4gIHBhdGhzWyAnZHM6dWNkYjpyc2dzJyAgICAgICAgICAgICAgICAgICBdICA9IFBBVEguam9pbiBwYXRocy5tb2ppa3VyYSwgJ3VjZGIvY2ZnL3JzZ3MtYW5kLWJsb2Nrcy5tZCdcbiAgcGF0aHNbICdkczp1Y2Q6dWNkJyAgICAgICAgICAgICAgICAgICAgIF0gID0gUEFUSC5qb2luIHVjZDE3MDAsICdVbmljb2RlRGF0YS50eHQnXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyBmb3JtYXRzWyAnZHM6ZGljdDp1Y2Q6djE0LjA6dWhkaWR4JyAgICAgIF0gICA9ICwgJ3VuaWNvZGUub3JnLXVjZC12MTQuMC9VbmloYW5fRGljdGlvbmFyeUluZGljZXMudHh0J1xuICBmb3JtYXRzWyAnZHM6ZGljdDp4OmtvLUhhbmcrTGF0bicgICAgICAgICBdID0gJ2RzZjp0c3YnXG4gIGZvcm1hdHNbICdkczpkaWN0Ong6amEtS2FuK0xhdG4nICAgICAgICAgIF0gPSAnZHNmOnRzdidcbiAgZm9ybWF0c1sgJ2RzOmRpY3Q6YmNwNDcnICAgICAgICAgICAgICAgICAgXSA9ICdkc2Y6dHN2J1xuICBmb3JtYXRzWyAnZHM6ZGljdDpqYTprYW5qaXVtJyAgICAgICAgICAgICBdID0gJ2RzZjp0eHQnXG4gIGZvcm1hdHNbICdkczpkaWN0OmphOmthbmppdW06YXV4JyAgICAgICAgIF0gPSAnZHNmOnR4dCdcbiAgZm9ybWF0c1sgJ2RzOmRpY3Q6a286Vj1kYXRhLWdvdi5jc3YnICAgICAgXSA9ICdkc2Y6Y3N2J1xuICBmb3JtYXRzWyAnZHM6ZGljdDprbzpWPWRhdGEtZ292Lmpzb24nICAgICBdID0gJ2RzZjpqc29uJ1xuICBmb3JtYXRzWyAnZHM6ZGljdDprbzpWPWRhdGEtbmF2ZXIuY3N2JyAgICBdID0gJ2RzZjpjc3YnXG4gIGZvcm1hdHNbICdkczpkaWN0OmtvOlY9ZGF0YS1uYXZlci5qc29uJyAgIF0gPSAnZHNmOmpzb24nXG4gIGZvcm1hdHNbICdkczpkaWN0OmtvOlY9UkVBRE1FLm1kJyAgICAgICAgIF0gPSAnZHNmOm1kJ1xuICBmb3JtYXRzWyAnZHM6ZGljdDptZWFuaW5ncycgICAgICAgICAgICAgICBdID0gJ2RzZjp0c3YnXG4gIGZvcm1hdHNbICdkczpzaGFwZTppZHN2MicgICAgICAgICAgICAgICAgIF0gPSAnZHNmOnRzdidcbiAgZm9ybWF0c1sgJ2RzOnNoYXBlOnpoejViZicgICAgICAgICAgICAgICAgXSA9ICdkc2Y6dHN2J1xuICBmb3JtYXRzWyAnZHM6dWNkYjpyc2dzJyAgICAgICAgICAgICAgICAgICBdID0gJ2RzZjptZDp0YWJsZSdcbiAgZm9ybWF0c1sgJ2RzOnVjZDp1Y2QnICAgICAgICAgICAgICAgICAgICAgXSA9ICdkc2Y6c2VtaWNvbG9ucydcbiAgcmV0dXJuIFJcblxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgSnpyX2RiX2FkYXB0ZXIgZXh0ZW5kcyBEYnJpY19zdGRcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBwcmVmaXg6ICAgICdqenInXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogKCBkYl9wYXRoLCBjZmcgPSB7fSApIC0+XG4gICAgIyMjIFRBSU5UIG5lZWQgbW9yZSBjbGFyaXR5IGFib3V0IHdoZW4gc3RhdGVtZW50cywgYnVpbGQsIGluaXRpYWxpemUuLi4gaXMgcGVyZm9ybWVkICMjI1xuICAgIHsgaG9zdCwgfSA9IGNmZ1xuICAgIGNmZyAgICAgICA9IGxldHMgY2ZnLCAoIGNmZyApIC0+IGRlbGV0ZSBjZmcuaG9zdFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc3VwZXIgZGJfcGF0aCwgY2ZnXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBAaG9zdCAgID0gaG9zdFxuICAgIEBzdGF0ZSAgPSB7IHRyaXBsZV9jb3VudDogMCwgbW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93OiBudWxsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRvID0+XG4gICAgICAjIyMgVEFJTlQgdGhpcyBpcyBub3Qgd2VsbCBwbGFjZWQgIyMjXG4gICAgICAjIyMgTk9URSBleGVjdXRlIGEgR2Fwcy1hbmQtSXNsYW5kcyBFU1NGUkkgdG8gaW1wcm92ZSBzdHJ1Y3R1cmFsIGludGVncml0eSBhc3N1cmFuY2U6ICMjI1xuICAgICAgIyAoIEBwcmVwYXJlIFNRTFwic2VsZWN0ICogZnJvbSBfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMgd2hlcmUgZmFsc2U7XCIgKS5nZXQoKVxuICAgICAgbWVzc2FnZXMgPSBbXVxuICAgICAgZm9yIHsgbmFtZSwgdHlwZSwgfSBmcm9tIEBzdGF0ZW1lbnRzLnN0ZF9nZXRfcmVsYXRpb25zLml0ZXJhdGUoKVxuICAgICAgICB0cnlcbiAgICAgICAgICAoIEBwcmVwYXJlIFNRTFwic2VsZWN0ICogZnJvbSAje25hbWV9IHdoZXJlIGZhbHNlO1wiICkuYWxsKClcbiAgICAgICAgY2F0Y2ggZXJyb3JcbiAgICAgICAgICBtZXNzYWdlcy5wdXNoIFwiI3t0eXBlfSAje25hbWV9OiAje2Vycm9yLm1lc3NhZ2V9XCJcbiAgICAgICAgICB3YXJuICfOqWp6cnNkYl9fXzInLCBlcnJvci5tZXNzYWdlXG4gICAgICByZXR1cm4gbnVsbCBpZiBtZXNzYWdlcy5sZW5ndGggaXMgMFxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwizqlqenJzZGJfX18zIEVGRlJJIHRlc3RpbmcgcmV2ZWFsZWQgZXJyb3JzOiAje3JwciBtZXNzYWdlc31cIlxuICAgICAgO251bGxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGlmIEBpc19mcmVzaFxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlX2Zvcm1hdHMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlcygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl92ZXJicygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9sY29kZXMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGluZXMoKVxuICAgICAgQF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9nbHlwaHJhbmdlcygpXG4gICAgICBAX29uX29wZW5fcG9wdWxhdGVfanpyX2dseXBocygpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzZXRfZ2V0dGVyIEA6OiwgJ25leHRfdHJpcGxlX3Jvd2lkJywgLT4gXCJ0Om1yOjNwbDpSPSN7KytAc3RhdGUudHJpcGxlX2NvdW50fVwiXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAjIyNcblxuICAgLm84ICAgICAgICAgICAgICAgICAgICBvOG8gIG9vb28gICAgICAgIC5vOFxuICBcIjg4OCAgICAgICAgICAgICAgICAgICAgYFwiJyAgYDg4OCAgICAgICBcIjg4OFxuICAgODg4b29vby4gIG9vb28gIG9vb28gIG9vb28gICA4ODggICAub29vbzg4OFxuICAgZDg4JyBgODhiIGA4ODggIGA4ODggIGA4ODggICA4ODggIGQ4OCcgYDg4OFxuICAgODg4ICAgODg4ICA4ODggICA4ODggICA4ODggICA4ODggIDg4OCAgIDg4OFxuICAgODg4ICAgODg4ICA4ODggICA4ODggICA4ODggICA4ODggIDg4OCAgIDg4OFxuICAgYFk4Ym9kOFAnICBgVjg4VlwiVjhQJyBvODg4byBvODg4byBgWThib2Q4OFBcIlxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBAYnVpbGQ6IFtcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl91cm5zIChcbiAgICAgICAgdXJuICAgICB0ZXh0ICAgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgY29tbWVudCB0ZXh0ICAgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggdXJuICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X19fNFwiIGNoZWNrICggdXJuIHJlZ2V4cCAnXltcXFxcLVxcXFwrXFxcXC46YS16QS1aMC05XSskJyApIClcbiAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9nbHlwaHJhbmdlcyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoICd0OnVjOnJzZzpWPScgfHwgcnNnICksXG4gICAgICAgIHJzZyAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGlzX2NqayAgICBib29sZWFuICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxvICAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGhpICAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIC0tIGxvX2dseXBoICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGp6cl9jaHJfZnJvbV9jaWQoIGxvICkgKSBzdG9yZWQsXG4gICAgICAgIC0tIGhpX2dseXBoICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGp6cl9jaHJfZnJvbV9jaWQoIGhpICkgKSBzdG9yZWQsXG4gICAgICAgIG5hbWUgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAtLSBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X19fNVwiIGNoZWNrICggbG8gYmV0d2VlbiAweDAwMDAwMCBhbmQgMHgxMGZmZmYgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfX182XCIgY2hlY2sgKCBoaSBiZXR3ZWVuIDB4MDAwMDAwIGFuZCAweDEwZmZmZiApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fXzdcIiBjaGVjayAoIGxvIDw9IGhpICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X19fOFwiIGNoZWNrICggcm93aWQgcmVnZXhwICdeLiokJyApXG4gICAgICApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2dseXBocyAoXG4gICAgICAgICAgY2lkICAgICBpbnRlZ2VyIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgICAgcnNnICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgICAgY2lkX2hleCB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGp6cl9hc19oZXgoIGNpZCApICkgc3RvcmVkLFxuICAgICAgICAgIGdseXBoICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICAgIGlzX2NqayAgYm9vbGVhbiAgICAgICAgIG5vdCBudWxsLCAtLSBnZW5lcmF0ZWQgYWx3YXlzIGFzICgganpyX2lzX2Nqa19nbHlwaCggZ2x5cGggKSApIHN0b3JlZCxcbiAgICAgICAgcHJpbWFyeSBrZXkgKCBjaWQgKSxcbiAgICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fXzlcIiBmb3JlaWduIGtleSAoIHJzZyApIHJlZmVyZW5jZXMganpyX2dseXBocmFuZ2VzICggcnNnIClcbiAgICAgICk7XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdHJpZ2dlciBqenJfZ2x5cGhzX2luc2VydFxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfZ2x5cGhzXG4gICAgICBmb3IgZWFjaCByb3cgYmVnaW5cbiAgICAgICAgc2VsZWN0IGp6cl90cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfZ2x5cGhzJyxcbiAgICAgICAgICAnY2lkOicsIG5ldy5jaWQsICdyc2c6JywgbmV3LnJzZyApO1xuICAgICAgICBlbmQ7XCJcIlwiXG5cbiAgICAjICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfY2prX2dseXBocyBhc1xuICAgICMgICBzZWxlY3RcbiAgICAjICAgICAgIGdyLnJzZyAgICBhcyByc2csXG4gICAgIyAgICAgICBncy52YWx1ZSAgYXMgY2lkLFxuICAgICMgICAgICAganpyX2Nocl9mcm9tX2NpZCggZ3MudmFsdWUgKSAgYXMgZ2x5cGhcbiAgICAjICAgICBmcm9tIGp6cl9jamtfZ2x5cGhyYW5nZXMgICAgICAgICAgICAgICAgICAgIGFzIGdyXG4gICAgIyAgICAgam9pbiBzdGRfZ2VuZXJhdGVfc2VyaWVzKCBnci5sbywgZ3IuaGksIDEgKSBhcyBnc1xuICAgICMgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9nbHlwaHNldHMgKFxuICAgICAgICByb3dpZCAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIG5hbWUgICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgZ2x5cGhyYW5nZSAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTBcIiBmb3JlaWduIGtleSAoIGdseXBocmFuZ2UgKSByZWZlcmVuY2VzIGp6cl9nbHlwaHJhbmdlcyAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18xMVwiIGNoZWNrICggcm93aWQgcmVnZXhwICdeLiokJyApXG4gICAgICApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2RhdGFzb3VyY2VfZm9ybWF0cyAoXG4gICAgICAgIGZvcm1hdCAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGNvbW1lbnQgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIGZvcm1hdCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTJcIiBjaGVjayAoIGZvcm1hdCByZWdleHAgJ15kc2Y6W1xcXFwtXFxcXCtcXFxcLjphLXpBLVowLTldKyQnIClcbiAgICAgICk7XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdHJpZ2dlciBqenJfZGF0YXNvdXJjZV9mb3JtYXRzX2luc2VydFxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfZGF0YXNvdXJjZV9mb3JtYXRzXG4gICAgICBmb3IgZWFjaCByb3cgYmVnaW5cbiAgICAgICAgc2VsZWN0IGp6cl90cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfZGF0YXNvdXJjZV9mb3JtYXRzJyxcbiAgICAgICAgICAnZm9ybWF0OicsIG5ldy5mb3JtYXQsICdjb21tZW50OicsIG5ldy5jb21tZW50ICk7XG4gICAgICAgIGluc2VydCBpbnRvIGp6cl91cm5zICggdXJuLCBjb21tZW50ICkgdmFsdWVzICggbmV3LmZvcm1hdCwgbmV3LmNvbW1lbnQgKTtcbiAgICAgICAgZW5kO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2RhdGFzb3VyY2VzIChcbiAgICAgICAgZHNrZXkgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgZm9ybWF0ICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgcGF0aCAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggZHNrZXkgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzEzXCIgZm9yZWlnbiBrZXkgKCBmb3JtYXQgKSByZWZlcmVuY2VzIGp6cl9kYXRhc291cmNlX2Zvcm1hdHMgKCBmb3JtYXQgKVxuICAgICAgKTtcIlwiXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9kYXRhc291cmNlc19pbnNlcnRcbiAgICAgIGJlZm9yZSBpbnNlcnQgb24ganpyX2RhdGFzb3VyY2VzXG4gICAgICBmb3IgZWFjaCByb3cgYmVnaW5cbiAgICAgICAgc2VsZWN0IGp6cl90cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQoICdqenJfZGF0YXNvdXJjZXMnLFxuICAgICAgICAgICdkc2tleTonLCBuZXcuZHNrZXksICdmb3JtYXQ6JywgbmV3LmZvcm1hdCwgJ3BhdGg6JywgbmV3LnBhdGggKTtcbiAgICAgICAgaW5zZXJ0IGludG8ganpyX3VybnMgKCB1cm4sIGNvbW1lbnQgKSB2YWx1ZXMgKCBuZXcuZHNrZXksICdmb3JtYXQ6ICcgfHwgbmV3LmZvcm1hdCB8fCAnLCBwYXRoOiAnIHx8IG5ldy5wYXRoICk7XG4gICAgICAgIGVuZDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfbGNvZGVzIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgbGNvZGUgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgY29tbWVudCAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzE0XCIgY2hlY2sgKCBsY29kZSByZWdleHAgJ15bYS16QS1aXStbYS16QS1aMC05XSokJyApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTVcIiBjaGVjayAoIHJvd2lkID0gJ3Q6bXI6bGM6Vj0nIHx8IGxjb2RlICkgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfbGluZXMgKFxuICAgICAgICAtLSAndDpqZm06J1xuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsIGdlbmVyYXRlZCBhbHdheXMgYXMgKCAndDptcjpsbjpkcz0nIHx8IGRza2V5IHx8ICc6TD0nIHx8IGxpbmVfbnIgKSBzdG9yZWQsXG4gICAgICAgIHJlZiAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoICAgICAgICAgICAgICAgICAgZHNrZXkgfHwgJzpMPScgfHwgbGluZV9uciApIHZpcnR1YWwsXG4gICAgICAgIGRza2V5ICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmVfbnIgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxjb2RlICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmUgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGpmaWVsZHMgICBqc29uICAgICAgICAgICAgICAgIG51bGwsXG4gICAgICAtLSBwcmltYXJ5IGtleSAoIHJvd2lkICksICAgICAgICAgICAgICAgICAgICAgICAgICAgLS0gIyMjIE5PVEUgRXhwZXJpbWVudGFsOiBubyBleHBsaWNpdCBQSywgaW5zdGVhZCBnZW5lcmF0ZWQgYHJvd2lkYCBjb2x1bW5cbiAgICAgIC0tIGNoZWNrICggcm93aWQgcmVnZXhwICdedDptcjpsbjpkcz0uKzpMPVxcXFxkKyQnKSwgIC0tICMjIyBOT1RFIG5vIG5lZWQgdG8gY2hlY2sgYXMgdmFsdWUgaXMgZ2VuZXJhdGVkICMjI1xuICAgICAgdW5pcXVlICggZHNrZXksIGxpbmVfbnIgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzE2XCIgZm9yZWlnbiBrZXkgKCBsY29kZSApIHJlZmVyZW5jZXMganpyX21pcnJvcl9sY29kZXMgKCBsY29kZSApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbWlycm9yX3ZlcmJzIChcbiAgICAgICAgcmFuayAgICAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCBkZWZhdWx0IDEsXG4gICAgICAgIHMgICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHYgICAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIG8gICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHYgKSxcbiAgICAgIC0tIGNoZWNrICggcm93aWQgcmVnZXhwICdedDptcjp2YjpWPVtcXFxcLTpcXFxcK1xcXFxwe0x9XSskJyApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMTdcIiBjaGVjayAoIHJhbmsgPiAwICkgKTtcIlwiXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9taXJyb3JfdmVyYnNfaW5zZXJ0XG4gICAgICBiZWZvcmUgaW5zZXJ0IG9uIGp6cl9taXJyb3JfdmVyYnNcbiAgICAgIGZvciBlYWNoIHJvdyBiZWdpblxuICAgICAgICBzZWxlY3QganpyX3RyaWdnZXJfb25fYmVmb3JlX2luc2VydCggJ2p6cl9taXJyb3JfdmVyYnMnLFxuICAgICAgICAgICdyYW5rOicsIG5ldy5yYW5rLCAnczonLCBuZXcucywgJ3Y6JywgbmV3LnYsICdvOicsIG5ldy5vICk7XG4gICAgICAgIGluc2VydCBpbnRvIGp6cl91cm5zICggdXJuLCBjb21tZW50ICkgdmFsdWVzICggbmV3LnYsICdzOiAnIHx8IG5ldy5zIHx8ICcsIG86ICcgfHwgbmV3Lm8gKTtcbiAgICAgICAgZW5kO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByZWYgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBzICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICB2ICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBvICAgICAgICAganNvbiAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMThcIiBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bXI6M3BsOlI9XFxcXGQrJCcgKSxcbiAgICAgIC0tIHVuaXF1ZSAoIHJlZiwgcywgdiwgbyApXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18xOVwiIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xpbmVzICggcm93aWQgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzIwXCIgZm9yZWlnbiBrZXkgKCB2ICAgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfdmVyYnMgKCB2IClcbiAgICAgICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0cmlnZ2VyIGp6cl9taXJyb3JfdHJpcGxlc19yZWdpc3RlclxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfbWlycm9yX3RyaXBsZXNfYmFzZVxuICAgICAgZm9yIGVhY2ggcm93IGJlZ2luXG4gICAgICAgIHNlbGVjdCBqenJfdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0KCAnanpyX21pcnJvcl90cmlwbGVzX2Jhc2UnLFxuICAgICAgICAgICdyb3dpZDonLCBuZXcucm93aWQsICdyZWY6JywgbmV3LnJlZiwgJ3M6JywgbmV3LnMsICd2OicsIG5ldy52LCAnbzonLCBuZXcubyApO1xuICAgICAgICBlbmQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyAoXG4gICAgICAgIHJvd2lkICAgICAgICAgICB0ZXh0ICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICByZWYgICAgICAgICAgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgc3lsbGFibGVfaGFuZyAgIHRleHQgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHN5bGxhYmxlX2xhdG4gICB0ZXh0ICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggaW5pdGlhbF9sYXRuIHx8IG1lZGlhbF9sYXRuIHx8IGZpbmFsX2xhdG4gKSB2aXJ0dWFsLFxuICAgICAgICAtLSBzeWxsYWJsZV9sYXRuICAgdGV4dCAgdW5pcXVlICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggaW5pdGlhbF9sYXRuIHx8IG1lZGlhbF9sYXRuIHx8IGZpbmFsX2xhdG4gKSB2aXJ0dWFsLFxuICAgICAgICBpbml0aWFsX2hhbmcgICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbWVkaWFsX2hhbmcgICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpbmFsX2hhbmcgICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBpbml0aWFsX2xhdG4gICAgdGV4dCAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbWVkaWFsX2xhdG4gICAgIHRleHQgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZpbmFsX2xhdG4gICAgICB0ZXh0ICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjFcIiBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6bGFuZzpoYW5nOnN5bDpWPVxcXFxTKyQnIClcbiAgICAgIC0tIHVuaXF1ZSAoIHJlZiwgcywgdiwgbyApXG4gICAgICAtLSBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18yMlwiIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xpbmVzICggcm93aWQgKVxuICAgICAgLS0gY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjNcIiBmb3JlaWduIGtleSAoIHN5bGxhYmxlX2hhbmcgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICggbyApIClcbiAgICAgICk7XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdHJpZ2dlciBqenJfbGFuZ19oYW5nX3N5bGxhYmxlc19yZWdpc3RlclxuICAgICAgYmVmb3JlIGluc2VydCBvbiBqenJfbGFuZ19oYW5nX3N5bGxhYmxlc1xuICAgICAgZm9yIGVhY2ggcm93IGJlZ2luXG4gICAgICAgIHNlbGVjdCBqenJfdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0KCAnanpyX2xhbmdfaGFuZ19zeWxsYWJsZXMnLFxuICAgICAgICAgIG5ldy5yb3dpZCwgbmV3LnJlZiwgbmV3LnN5bGxhYmxlX2hhbmcsIG5ldy5zeWxsYWJsZV9sYXRuLFxuICAgICAgICAgICAgbmV3LmluaXRpYWxfaGFuZywgbmV3Lm1lZGlhbF9oYW5nLCBuZXcuZmluYWxfaGFuZyxcbiAgICAgICAgICAgIG5ldy5pbml0aWFsX2xhdG4sIG5ldy5tZWRpYWxfbGF0biwgbmV3LmZpbmFsX2xhdG4gKTtcbiAgICAgICAgZW5kO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzIGFzXG4gICAgICBzZWxlY3QgbnVsbCBhcyByb3dpZCwgbnVsbCBhcyByZWYsIG51bGwgYXMgcywgbnVsbCBhcyB2LCBudWxsIGFzIG8gd2hlcmUgZmFsc2UgdW5pb24gYWxsXG4gICAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAndjpjOnJlYWRpbmc6a28tTGF0bicsICAgICAgICAgIHN5bGxhYmxlX2xhdG4gICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICd2OmM6cmVhZGluZzprby1MYXRuOmluaXRpYWwnLCAgaW5pdGlhbF9sYXRuICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ3Y6YzpyZWFkaW5nOmtvLUxhdG46bWVkaWFsJywgICBtZWRpYWxfbGF0biAgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAndjpjOnJlYWRpbmc6a28tTGF0bjpmaW5hbCcsICAgIGZpbmFsX2xhdG4gICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHJvd2lkLCByZWYsIHN5bGxhYmxlX2hhbmcsICd2OmM6cmVhZGluZzprby1IYW5nOmluaXRpYWwnLCAgaW5pdGlhbF9oYW5nICAgIGZyb20ganpyX2xhbmdfaGFuZ19zeWxsYWJsZXMgdW5pb24gYWxsXG4gICAgICBzZWxlY3Qgcm93aWQsIHJlZiwgc3lsbGFibGVfaGFuZywgJ3Y6YzpyZWFkaW5nOmtvLUhhbmc6bWVkaWFsJywgICBtZWRpYWxfaGFuZyAgICAgZnJvbSBqenJfbGFuZ19oYW5nX3N5bGxhYmxlcyB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCByb3dpZCwgcmVmLCBzeWxsYWJsZV9oYW5nLCAndjpjOnJlYWRpbmc6a28tSGFuZzpmaW5hbCcsICAgIGZpbmFsX2hhbmcgICAgICBmcm9tIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2FsbF90cmlwbGVzIGFzXG4gICAgIyAgIHNlbGVjdCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyBzLCBudWxsIGFzIHYsIG51bGwgYXMgbyB3aGVyZSBmYWxzZSB1bmlvbiBhbGxcbiAgICAjICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyAgIHNlbGVjdCAqIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgdW5pb24gYWxsXG4gICAgIyAgIHNlbGVjdCAqIGZyb20ganpyX2xhbmdfa3JfcmVhZGluZ3NfdHJpcGxlcyB1bmlvbiBhbGxcbiAgICAjICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyAgIHNlbGVjdCBudWxsLCBudWxsLCBudWxsLCBudWxsLCBudWxsIHdoZXJlIGZhbHNlXG4gICAgIyAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdCBudWxsIGFzIHJvd2lkLCBudWxsIGFzIHJlZiwgbnVsbCBhcyByYW5rLCBudWxsIGFzIHMsIG51bGwgYXMgdiwgbnVsbCBhcyBvIHdoZXJlIGZhbHNlXG4gICAgICAtLSAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0IHRiMS5yb3dpZCwgdGIxLnJlZiwgdmIxLnJhbmssIHRiMS5zLCB0YjEudiwgdGIxLm8gZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0YjFcbiAgICAgIGpvaW4ganpyX21pcnJvcl92ZXJicyBhcyB2YjEgdXNpbmcgKCB2IClcbiAgICAgIHdoZXJlIHZiMS52IGxpa2UgJ3Y6YzolJ1xuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICB1bmlvbiBhbGxcbiAgICAgIHNlbGVjdCB0YjIucm93aWQsIHRiMi5yZWYsIHZiMi5yYW5rLCB0YjIucywga3Iudiwga3IubyBmcm9tIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHRiMlxuICAgICAgam9pbiBqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzIGFzIGtyIG9uICggdGIyLnYgPSAndjpjOnJlYWRpbmc6a28tSGFuZycgYW5kIHRiMi5vID0ga3IucyApXG4gICAgICBqb2luIGp6cl9taXJyb3JfdmVyYnMgYXMgdmIyIG9uICgga3IudiA9IHZiMi52IClcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgdW5pb24gYWxsXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgb3JkZXIgYnkgcywgdiwgb1xuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfdG9wX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdCAqIGZyb20ganpyX3RyaXBsZXNcbiAgICAgIHdoZXJlIHJhbmsgPSAxXG4gICAgICBvcmRlciBieSBzLCB2LCBvXG4gICAgICA7XCJcIlwiXG5cbiAgICAjICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgIyBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2Zvcm11bGFzIChcbiAgICAjICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICMgICAgIHJlZiAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgIyAgICAgZ2x5cGggICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAjICAgICBmb3JtdWxhICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuXG4gICAgIyAgICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfY29tcG9uZW50cyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHJlZiAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxldmVsICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxuciAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIHJuciAgICAgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGdseXBoICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGNvbXBvbmVudCB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18yNFwiIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoIHJvd2lkICksXG4gICAgICBjb25zdHJhaW50IFwizqljb25zdHJhaW50X18yNVwiIGNoZWNrICggKCBsZW5ndGgoIGdseXBoICAgICApID0gMSApIG9yICggZ2x5cGggICAgICByZWdleHAgJ14mW1xcXFwtYS16MC05X10rI1swLTlhLWZdezQsNn07JCcgKSApLFxuICAgICAgY29uc3RyYWludCBcIs6pY29uc3RyYWludF9fMjZcIiBjaGVjayAoICggbGVuZ3RoKCBjb21wb25lbnQgKSA9IDEgKSBvciAoIGNvbXBvbmVudCAgcmVnZXhwICdeJltcXFxcLWEtejAtOV9dKyNbMC05YS1mXXs0LDZ9OyQnICkgKSxcbiAgICAgIGNvbnN0cmFpbnQgXCLOqWNvbnN0cmFpbnRfXzI3XCIgY2hlY2sgKCByb3dpZCByZWdleHAgJ14uKiQnIClcbiAgICAgICk7XCJcIlwiXG5cblxuICAgICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgIyMjXG5cbiAgICAgIC5vICAubzg4by4gICAgICAgICAgICAgICAgICAgICAgIG9vb28gICAgICAuICAgICAgICAgICAgby5cbiAgICAgLjgnICA4ODggYFwiICAgICAgICAgICAgICAgICAgICAgICBgODg4ICAgIC5vOCAgICAgICAgICAgIGA4LlxuICAgIC44JyAgbzg4OG9vICAgLm9vb28uICAgb29vbyAgb29vbyAgIDg4OCAgLm84ODhvbyAgLm9vb28ubyAgYDguXG4gICAgODggICAgODg4ICAgIGBQICApODhiICBgODg4ICBgODg4ICAgODg4ICAgIDg4OCAgIGQ4OCggIFwiOCAgIDg4XG4gICAgODggICAgODg4ICAgICAub1BcIjg4OCAgIDg4OCAgIDg4OCAgIDg4OCAgICA4ODggICBgXCJZODhiLiAgICA4OFxuICAgIGA4LiAgIDg4OCAgICBkOCggIDg4OCAgIDg4OCAgIDg4OCAgIDg4OCAgICA4ODggLiBvLiAgKTg4YiAgLjgnXG4gICAgIGA4LiBvODg4byAgIGBZODg4XCJcIjhvICBgVjg4VlwiVjhQJyBvODg4byAgIFwiODg4XCIgOFwiXCI4ODhQJyAuOCdcbiAgICAgIGBcIiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV91Y19ub3JtYWxpemF0aW9uX2ZhdWx0cyBhcyBzZWxlY3RcbiAgICAgICAgbWwucm93aWQgIGFzIHJvd2lkLFxuICAgICAgICBtbC5yZWYgICAgYXMgcmVmLFxuICAgICAgICBtbC5saW5lICAgYXMgbGluZVxuICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzIGFzIG1sXG4gICAgICB3aGVyZSB0cnVlXG4gICAgICAgIGFuZCAoIG5vdCBzdGRfaXNfdWNfbm9ybWFsKCBtbC5saW5lICkgKVxuICAgICAgb3JkZXIgYnkgbWwucm93aWQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV9rcl9yZWFkaW5nc191bmtub3duX3ZlcmJfZmF1bHRzIGFzIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIGNvdW50KCopIG92ZXIgKCBwYXJ0aXRpb24gYnkgdiApICAgIGFzIGNvdW50LFxuICAgICAgICAgICdqenJfbGFuZ19rcl9yZWFkaW5nc190cmlwbGVzOlI9KicgIGFzIHJvd2lkLFxuICAgICAgICAgICcqJyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAndW5rbm93bi12ZXJiJyAgICAgICAgICAgICAgICAgICAgICBhcyBkZXNjcmlwdGlvbixcbiAgICAgICAgICB2ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBxdW90ZVxuICAgICAgICBmcm9tIGp6cl9sYW5nX2tyX3JlYWRpbmdzX3RyaXBsZXMgYXMgbm5cbiAgICAgICAgd2hlcmUgbm90IGV4aXN0cyAoIHNlbGVjdCAxIGZyb20ganpyX21pcnJvcl92ZXJicyBhcyB2YiB3aGVyZSB2Yi52ID0gbm4udiApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBfanpyX21ldGFfZXJyb3JfdmVyYl9mYXVsdHMgYXMgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgY291bnQoKikgb3ZlciAoIHBhcnRpdGlvbiBieSB2ICkgICAgYXMgY291bnQsXG4gICAgICAgICAgJ2Vycm9yOlI9KicgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgICAgcm93aWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICdlcnJvci12ZXJiJyAgICAgICAgICAgICAgICAgICAgICAgIGFzIGRlc2NyaXB0aW9uLFxuICAgICAgICAgICd2OicgfHwgdiB8fCAnLCBvOicgfHwgbyAgICAgICAgICAgIGFzIHF1b3RlXG4gICAgICAgIGZyb20ganpyX3RyaXBsZXMgYXMgbm5cbiAgICAgICAgd2hlcmUgdiBsaWtlICclOmVycm9yJztcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcgX2p6cl9tZXRhX21pcnJvcl9saW5lc193aGl0ZXNwYWNlX2ZhdWx0cyBhcyBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICAxICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBjb3VudCxcbiAgICAgICAgICAndDptcjpsbjpqZmllbGRzOndzOlI9KicgICAgICAgICAgICAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgICBtbC5yb3dpZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgJ2V4dHJhbmVvdXMtd2hpdGVzcGFjZScgICAgICAgICAgICAgICAgICAgICAgYXMgZGVzY3JpcHRpb24sXG4gICAgICAgICAgbWwuamZpZWxkcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcXVvdGVcbiAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzIGFzIG1sXG4gICAgICAgIHdoZXJlICgganpyX2hhc19wZXJpcGhlcmFsX3dzX2luX2pmaWVsZCggamZpZWxkcyApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IF9qenJfbWV0YV9taXJyb3JfbGluZXNfd2l0aF9lcnJvcnMgYXMgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgMSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgY291bnQsXG4gICAgICAgICAgJ3Q6bXI6bG46amZpZWxkczp3czpSPSonICAgICAgICAgICAgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgICAgbWwucm93aWQgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcmVmLFxuICAgICAgICAgICdlcnJvcicgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGRlc2NyaXB0aW9uLFxuICAgICAgICAgIG1sLmxpbmUgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHF1b3RlXG4gICAgICAgIGZyb20ganpyX21pcnJvcl9saW5lcyBhcyBtbFxuICAgICAgICB3aGVyZSAoIG1sLmxjb2RlID0gJ0UnICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9tZXRhX2ZhdWx0cyBhc1xuICAgICAgc2VsZWN0IG51bGwgYXMgY291bnQsIG51bGwgYXMgcm93aWQsIG51bGwgYXMgcmVmLCBudWxsIGFzIGRlc2NyaXB0aW9uLCBudWxsICBhcyBxdW90ZSB3aGVyZSBmYWxzZSB1bmlvbiBhbGxcbiAgICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0IDEsIHJvd2lkLCByZWYsICAndWMtbm9ybWFsaXphdGlvbicsIGxpbmUgIGFzIHF1b3RlIGZyb20gX2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzICAgICAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX2tyX3JlYWRpbmdzX3Vua25vd25fdmVyYl9mYXVsdHMgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX2Vycm9yX3ZlcmJfZmF1bHRzICAgICAgICAgICAgICAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX21pcnJvcl9saW5lc193aGl0ZXNwYWNlX2ZhdWx0cyAgIHVuaW9uIGFsbFxuICAgICAgc2VsZWN0ICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZyb20gX2p6cl9tZXRhX21pcnJvcl9saW5lc193aXRoX2Vycm9ycyAgICAgICAgIHVuaW9uIGFsbFxuICAgICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3QgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCwgbnVsbCB3aGVyZSBmYWxzZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAjIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9zeWxsYWJsZXMgYXMgc2VsZWN0XG4gICAgIyAgICAgICB0MS5zXG4gICAgIyAgICAgICB0MS52XG4gICAgIyAgICAgICB0MS5vXG4gICAgIyAgICAgICB0aS5zIGFzIGluaXRpYWxfaGFuZ1xuICAgICMgICAgICAgdG0ucyBhcyBtZWRpYWxfaGFuZ1xuICAgICMgICAgICAgdGYucyBhcyBmaW5hbF9oYW5nXG4gICAgIyAgICAgICB0aS5vIGFzIGluaXRpYWxfbGF0blxuICAgICMgICAgICAgdG0ubyBhcyBtZWRpYWxfbGF0blxuICAgICMgICAgICAgdGYubyBhcyBmaW5hbF9sYXRuXG4gICAgIyAgICAgZnJvbSBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSBhcyB0MVxuICAgICMgICAgIGpvaW5cbiAgICAjICAgICBqb2luIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlIGFzIHRpIG9uICggdDEuKVxuICAgICMgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMjIyBhZ2dyZWdhdGUgdGFibGUgZm9yIGFsbCByb3dpZHMgZ29lcyBoZXJlICMjI1xuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAjIyNcblxuICAgICAgICAgICAgICAgLiAgICAgICAgICAgICAgICAgLiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAubzggICAgICAgICAgICAgICAubzggICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm84XG4gICAub29vby5vIC5vODg4b28gIC5vb29vLiAgIC5vODg4b28gIC5vb29vby4gIG9vby4gLm9vLiAgLm9vLiAgICAub29vb28uICBvb28uIC5vby4gICAubzg4OG9vICAub29vby5vXG4gIGQ4OCggIFwiOCAgIDg4OCAgIGBQICApODhiICAgIDg4OCAgIGQ4OCcgYDg4YiBgODg4UFwiWTg4YlBcIlk4OGIgIGQ4OCcgYDg4YiBgODg4UFwiWTg4YiAgICA4ODggICBkODgoICBcIjhcbiAgYFwiWTg4Yi4gICAgODg4ICAgIC5vUFwiODg4ICAgIDg4OCAgIDg4OG9vbzg4OCAgODg4ICAgODg4ICAgODg4ICA4ODhvb284ODggIDg4OCAgIDg4OCAgICA4ODggICBgXCJZODhiLlxuICBvLiAgKTg4YiAgIDg4OCAuIGQ4KCAgODg4ICAgIDg4OCAuIDg4OCAgICAubyAgODg4ICAgODg4ICAgODg4ICA4ODggICAgLm8gIDg4OCAgIDg4OCAgICA4ODggLiBvLiAgKTg4YlxuICA4XCJcIjg4OFAnICAgXCI4ODhcIiBgWTg4OFwiXCI4byAgIFwiODg4XCIgYFk4Ym9kOFAnIG84ODhvIG84ODhvIG84ODhvIGBZOGJvZDhQJyBvODg4byBvODg4byAgIFwiODg4XCIgOFwiXCI4ODhQJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAc3RhdGVtZW50czpcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9kYXRhc291cmNlX2Zvcm1hdDogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfZGF0YXNvdXJjZV9mb3JtYXRzICggZm9ybWF0LCBjb21tZW50ICkgdmFsdWVzICggJGZvcm1hdCwgJGNvbW1lbnQgKVxuICAgICAgICAtLSBvbiBjb25mbGljdCAoIGRza2V5ICkgZG8gdXBkYXRlIHNldCBwYXRoID0gZXhjbHVkZWQucGF0aFxuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfZGF0YXNvdXJjZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfZGF0YXNvdXJjZXMgKCBkc2tleSwgZm9ybWF0LCBwYXRoICkgdmFsdWVzICggJGRza2V5LCAkZm9ybWF0LCAkcGF0aCApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggZHNrZXkgKSBkbyB1cGRhdGUgc2V0IHBhdGggPSBleGNsdWRlZC5wYXRoXG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9taXJyb3JfdmVyYjogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3ZlcmJzICggcmFuaywgcywgdiwgbyApIHZhbHVlcyAoICRyYW5rLCAkcywgJHYsICRvIClcbiAgICAgICAgLS0gb24gY29uZmxpY3QgKCByb3dpZCApIGRvIHVwZGF0ZSBzZXQgcmFuayA9IGV4Y2x1ZGVkLnJhbmssIHMgPSBleGNsdWRlZC5zLCB2ID0gZXhjbHVkZWQudiwgbyA9IGV4Y2x1ZGVkLm9cbiAgICAgICAgO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX21pcnJvcl9sY29kZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX2xjb2RlcyAoIHJvd2lkLCBsY29kZSwgY29tbWVudCApIHZhbHVlcyAoICRyb3dpZCwgJGxjb2RlLCAkY29tbWVudCApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcm93aWQgKSBkbyB1cGRhdGUgc2V0IGxjb2RlID0gZXhjbHVkZWQubGNvZGUsIGNvbW1lbnQgPSBleGNsdWRlZC5jb21tZW50XG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9taXJyb3JfdHJpcGxlOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfdHJpcGxlc19iYXNlICggcm93aWQsIHJlZiwgcywgdiwgbyApIHZhbHVlcyAoICRyb3dpZCwgJHJlZiwgJHMsICR2LCAkbyApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcmVmLCBzLCB2LCBvICkgZG8gbm90aGluZ1xuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9taXJyb3JfbGluZXM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX21pcnJvcl9saW5lcyAoIGRza2V5LCBsaW5lX25yLCBsY29kZSwgbGluZSwgamZpZWxkcyApXG4gICAgICBzZWxlY3RcbiAgICAgICAgLS0gJ3Q6bXI6bG46Uj0nIHx8IHJvd19udW1iZXIoKSBvdmVyICgpICAgICAgICAgIGFzIHJvd2lkLFxuICAgICAgICAtLSBkcy5kc2tleSB8fCAnOkw9JyB8fCBmbC5saW5lX25yICAgYXMgcm93aWQsXG4gICAgICAgIGRzLmRza2V5ICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBkc2tleSxcbiAgICAgICAgZmwubGluZV9uciAgICAgICAgICAgICAgICAgICAgICAgIGFzIGxpbmVfbnIsXG4gICAgICAgIGZsLmxjb2RlICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBsY29kZSxcbiAgICAgICAgZmwubGluZSAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGxpbmUsXG4gICAgICAgIGZsLmpmaWVsZHMgICAgICAgICAgICAgICAgICAgICAgICBhcyBqZmllbGRzXG4gICAgICBmcm9tIGp6cl9kYXRhc291cmNlcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZHNcbiAgICAgIGpvaW4ganpyX2RhdGFzb3VyY2VfZm9ybWF0cyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBkZiB1c2luZyAoIGZvcm1hdCApXG4gICAgICBqb2luIGp6cl93YWxrX2ZpbGVfbGluZXMoIGRzLmRza2V5LCBkZi5mb3JtYXQsIGRzLnBhdGggKSAgYXMgZmxcbiAgICAgIHdoZXJlIHRydWVcbiAgICAgIC0tIG9uIGNvbmZsaWN0ICggZHNrZXksIGxpbmVfbnIgKSBkbyB1cGRhdGUgc2V0IGxpbmUgPSBleGNsdWRlZC5saW5lXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlczogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3RyaXBsZXNfYmFzZSAoIHJvd2lkLCByZWYsIHMsIHYsIG8gKVxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICAgIGd0LnJvd2lkX291dCAgICBhcyByb3dpZCxcbiAgICAgICAgICAgIGd0LnJlZiAgICAgICAgICBhcyByZWYsXG4gICAgICAgICAgICBndC5zICAgICAgICAgICAgYXMgcyxcbiAgICAgICAgICAgIGd0LnYgICAgICAgICAgICBhcyB2LFxuICAgICAgICAgICAgZ3QubyAgICAgICAgICAgIGFzIG9cbiAgICAgICAgICBmcm9tIGp6cl9taXJyb3JfbGluZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIG1sXG4gICAgICAgICAgam9pbiBqenJfd2Fsa190cmlwbGVzKCBtbC5yb3dpZCwgbWwuZHNrZXksIG1sLmpmaWVsZHMgKSBhcyBndFxuICAgICAgICAgIHdoZXJlIHRydWVcbiAgICAgICAgICAgIGFuZCAoIG1sLmxjb2RlID0gJ0QnIClcbiAgICAgICAgICAgIC0tIGFuZCAoIG1sLmRza2V5ID0gJ2RzOmRpY3Q6bWVhbmluZ3MnIClcbiAgICAgICAgICAgIGFuZCAoIG1sLmpmaWVsZHMgaXMgbm90IG51bGwgKVxuICAgICAgICAgICAgYW5kICggbWwuamZpZWxkcy0+PjAgbm90IHJlZ2V4cCAnXkBnbHlwaHMnIClcbiAgICAgICAgICAgIGFuZCAoIG1sLmRza2V5ID0gJGRza2V5IClcbiAgICAgICAgICAgIGFuZCAoIG1sLmpmaWVsZHMtPj4yIHJlZ2V4cCAkdl9yZSApXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcmVmLCBzLCB2LCBvICkgZG8gbm90aGluZ1xuICAgICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9sYW5nX2hhbmdldWxfc3lsbGFibGVzOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9sYW5nX2hhbmdfc3lsbGFibGVzICggcm93aWQsIHJlZixcbiAgICAgICAgc3lsbGFibGVfaGFuZywgaW5pdGlhbF9oYW5nLCBtZWRpYWxfaGFuZywgZmluYWxfaGFuZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluaXRpYWxfbGF0biwgbWVkaWFsX2xhdG4sIGZpbmFsX2xhdG4gKVxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICAgICd0Omxhbmc6aGFuZzpzeWw6Vj0nIHx8IG10Lm8gICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgICAgICBtdC5yb3dpZCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHJlZixcbiAgICAgICAgICAgIG10Lm8gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgc3lsbGFibGVfaGFuZyxcbiAgICAgICAgICAgIGRoLmluaXRpYWwgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgaW5pdGlhbF9oYW5nLFxuICAgICAgICAgICAgZGgubWVkaWFsICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBtZWRpYWxfaGFuZyxcbiAgICAgICAgICAgIGRoLmZpbmFsICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZmluYWxfaGFuZyxcbiAgICAgICAgICAgIGNvYWxlc2NlKCBtdGkubywgJycgKSAgICAgICAgICAgICAgICAgYXMgaW5pdGlhbF9sYXRuLFxuICAgICAgICAgICAgY29hbGVzY2UoIG10bS5vLCAnJyApICAgICAgICAgICAgICAgICBhcyBtZWRpYWxfbGF0bixcbiAgICAgICAgICAgIGNvYWxlc2NlKCBtdGYubywgJycgKSAgICAgICAgICAgICAgICAgYXMgZmluYWxfbGF0blxuICAgICAgICAgIGZyb20ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgICAgICAgICAgICAgIGFzIG10XG4gICAgICAgICAgbGVmdCBqb2luIGp6cl9kaXNhc3NlbWJsZV9oYW5nZXVsKCBtdC5vICkgYXMgZGhcbiAgICAgICAgICBsZWZ0IGpvaW4ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgbXRpIG9uICggbXRpLnMgPSBkaC5pbml0aWFsIGFuZCBtdGkudiA9ICd2Ong6a28tSGFuZytMYXRuOmluaXRpYWwnIClcbiAgICAgICAgICBsZWZ0IGpvaW4ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgbXRtIG9uICggbXRtLnMgPSBkaC5tZWRpYWwgIGFuZCBtdG0udiA9ICd2Ong6a28tSGFuZytMYXRuOm1lZGlhbCcgIClcbiAgICAgICAgICBsZWZ0IGpvaW4ganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgbXRmIG9uICggbXRmLnMgPSBkaC5maW5hbCAgIGFuZCBtdGYudiA9ICd2Ong6a28tSGFuZytMYXRuOmZpbmFsJyAgIClcbiAgICAgICAgICB3aGVyZSB0cnVlXG4gICAgICAgICAgICBhbmQgKCBtdC52ID0gJ3Y6YzpyZWFkaW5nOmtvLUhhbmcnIClcbiAgICAgICAgICBvcmRlciBieSBtdC5vXG4gICAgICAgIC0tIG9uIGNvbmZsaWN0ICggcm93aWQgICAgICAgICApIGRvIG5vdGhpbmdcbiAgICAgICAgLyogIyMjIE5PVEUgYG9uIGNvbmZsaWN0YCBuZWVkZWQgYmVjYXVzZSB3ZSBsb2cgYWxsIGFjdHVhbGx5IG9jY3VycmluZyByZWFkaW5ncyBvZiBhbGwgY2hhcmFjdGVycyAqL1xuICAgICAgICBvbiBjb25mbGljdCAoIHN5bGxhYmxlX2hhbmcgKSBkbyBub3RoaW5nXG4gICAgICAgIDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcG9wdWxhdGVfanpyX2dseXBocmFuZ2VzOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9nbHlwaHJhbmdlcyAoIHJzZywgaXNfY2prLCBsbywgaGksIG5hbWUgKVxuICAgICAgc2VsZWN0XG4gICAgICAgIC0tICd0Om1yOmxuOlI9JyB8fCByb3dfbnVtYmVyKCkgb3ZlciAoKSAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgLS0gZHMuZHNrZXkgfHwgJzpMPScgfHwgZmwubGluZV9uciAgIGFzIHJvd2lkLFxuICAgICAgICBnci5yc2cgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcnNnLFxuICAgICAgICBnci5pc19jamsgICAgICAgICAgICAgICAgICAgICAgICAgYXMgaXNfY2prLFxuICAgICAgICAtLSByZWZcbiAgICAgICAgZ3IubG8gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGxvLFxuICAgICAgICBnci5oaSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgaGksXG4gICAgICAgIGdyLm5hbWUgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBuYW1lXG4gICAgICBmcm9tIGp6cl9taXJyb3JfbGluZXMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBtbFxuICAgICAgam9pbiBqenJfcGFyc2VfdWNkYl9yc2dzX2dseXBocmFuZ2UoIG1sLmRza2V5LCBtbC5saW5lX25yLCBtbC5qZmllbGRzICkgYXMgZ3JcbiAgICAgIHdoZXJlIHRydWVcbiAgICAgICAgYW5kICggbWwuZHNrZXkgPSAnZHM6dWNkYjpyc2dzJyApXG4gICAgICAgIGFuZCAoIG1sLmxjb2RlID0gJ0QnIClcbiAgICAgIG9yZGVyIGJ5IG1sLmxpbmVfbnJcbiAgICAgIC0tIG9uIGNvbmZsaWN0ICggZHNrZXksIGxpbmVfbnIgKSBkbyB1cGRhdGUgc2V0IGxpbmUgPSBleGNsdWRlZC5saW5lXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9nbHlwaHM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX2dseXBocyAoIGNpZCwgZ2x5cGgsIHJzZywgaXNfY2prIClcbiAgICAgIHNlbGVjdFxuICAgICAgICAgIGNnLmNpZCAgICBhcyBjaWQsXG4gICAgICAgICAgY2cuZ2x5cGggIGFzIGdseXBoLFxuICAgICAgICAgIGdyLnJzZyAgICBhcyByc2csXG4gICAgICAgICAgZ3IuaXNfY2prIGFzIGlzX2Nqa1xuICAgICAgICBmcm9tIGp6cl9nbHlwaHJhbmdlcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBnclxuICAgICAgICBqb2luIGp6cl9nZW5lcmF0ZV9jaWRzX2FuZF9nbHlwaHMoIGdyLmxvLCBnci5oaSApICAgICBhcyBjZ1xuICAgICAgICA7XCJcIlwiXG5cblxuXG4gICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgIyMjXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvb29vICAgICAgICAgICAgICAgIC5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBgODg4ICAgICAgICAgICAgICAubzhcbiAgb28ub29vb28uICAgLm9vb29vLiAgb28ub29vb28uICBvb29vICBvb29vICAgODg4ICAgLm9vb28uICAgLm84ODhvbyAgLm9vb29vLlxuICAgODg4JyBgODhiIGQ4OCcgYDg4YiAgODg4JyBgODhiIGA4ODggIGA4ODggICA4ODggIGBQICApODhiICAgIDg4OCAgIGQ4OCcgYDg4YlxuICAgODg4ICAgODg4IDg4OCAgIDg4OCAgODg4ICAgODg4ICA4ODggICA4ODggICA4ODggICAub1BcIjg4OCAgICA4ODggICA4ODhvb284ODhcbiAgIDg4OCAgIDg4OCA4ODggICA4ODggIDg4OCAgIDg4OCAgODg4ICAgODg4ICAgODg4ICBkOCggIDg4OCAgICA4ODggLiA4ODggICAgLm9cbiAgIDg4OGJvZDhQJyBgWThib2Q4UCcgIDg4OGJvZDhQJyAgYFY4OFZcIlY4UCcgbzg4OG8gYFk4ODhcIlwiOG8gICBcIjg4OFwiIGBZOGJvZDhQJ1xuICAgODg4ICAgICAgICAgICAgICAgICAgODg4XG4gIG84ODhvICAgICAgICAgICAgICAgIG84ODhvXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGNvZGVzOiAtPlxuICAgIGRlYnVnICfOqWp6cnNkYl9fMjgnLCAnX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9sY29kZXMnXG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0Om1yOmxjOlY9QicsIGxjb2RlOiAnQicsIGNvbW1lbnQ6ICdibGFuayBsaW5lJywgICAgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPUMnLCBsY29kZTogJ0MnLCBjb21tZW50OiAnY29tbWVudCBsaW5lJywgIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX21pcnJvcl9sY29kZS5ydW4geyByb3dpZDogJ3Q6bXI6bGM6Vj1EJywgbGNvZGU6ICdEJywgY29tbWVudDogJ2RhdGEgbGluZScsICAgICB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0Om1yOmxjOlY9RScsIGxjb2RlOiAnRScsIGNvbW1lbnQ6ICdlcnJvcicsICAgICAgICAgfVxuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX2xjb2RlLnJ1biB7IHJvd2lkOiAndDptcjpsYzpWPVUnLCBsY29kZTogJ1UnLCBjb21tZW50OiAndW5rbm93bicsICAgICAgIH1cbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl92ZXJiczogLT5cbiAgICAjIyMgTk9URVxuICAgIGluIHZlcmJzLCBpbml0aWFsIGNvbXBvbmVudCBpbmRpY2F0ZXMgdHlwZSBvZiBzdWJqZWN0OlxuICAgICAgYHY6YzpgIGlzIGZvciBzdWJqZWN0cyB0aGF0IGFyZSBDSksgY2hhcmFjdGVyc1xuICAgICAgYHY6eDpgIGlzIHVzZWQgZm9yIHVuY2xhc3NpZmllZCBzdWJqZWN0cyAocG9zc2libHkgdG8gYmUgcmVmaW5lZCBpbiB0aGUgZnV0dXJlKVxuICAgICMjI1xuICAgIGRlYnVnICfOqWp6cnNkYl9fMjknLCAnX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl92ZXJicydcbiAgICByb3dzID0gW1xuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OnRlc3Rpbmc6dW51c2VkJywgICAgICAgICAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6eDprby1IYW5nK0xhdG46aW5pdGlhbCcsICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjp4OmtvLUhhbmcrTGF0bjptZWRpYWwnLCAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2Ong6a28tSGFuZytMYXRuOmZpbmFsJywgICAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOnpoLUxhdG4tcGlueWluJywgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6amEteC1LYW4nLCAgICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzpqYS14LUhpcicsICAgICAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmphLXgtS2F0JywgICAgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6amEteC1MYXRuJywgICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzpqYS14LUhpcitMYXRuJywgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmphLXgtS2F0K0xhdG4nLCAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6a28tSGFuZycsICAgICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzprby1MYXRuJywgICAgICAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmtvLUhhbmc6aW5pdGlhbCcsICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6a28tSGFuZzptZWRpYWwnLCAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzprby1IYW5nOmZpbmFsJywgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpyZWFkaW5nOmtvLUxhdG46aW5pdGlhbCcsICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnJlYWRpbmc6a28tTGF0bjptZWRpYWwnLCAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6cmVhZGluZzprby1MYXRuOmZpbmFsJywgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpzaGFwZTppZHM6ZXJyb3InLCAgICAgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMSwgczogXCJOTlwiLCB2OiAndjpjOnNoYXBlOmlkczpTOmZvcm11bGEnLCAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6c2hhcGU6aWRzOlM6YXN0JywgICAgICAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDEsIHM6IFwiTk5cIiwgdjogJ3Y6YzpzaGFwZTppZHM6TTpmb3JtdWxhJywgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnNoYXBlOmlkczpNOmFzdCcsICAgICAgICAgICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAxLCBzOiBcIk5OXCIsIHY6ICd2OmM6c2hhcGU6aWRzOkw6Zm9ybXVsYScsICAgICAgICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpzaGFwZTppZHM6TDphc3QnLCAgICAgICAgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIHsgcmFuazogMiwgczogXCJOTlwiLCB2OiAndjpjOnNoYXBlOmlkczpTOmhhcy1vcGVyYXRvcicsICAgICAgICAgIG86IFwiTk5cIiwgfVxuICAgICAgeyByYW5rOiAyLCBzOiBcIk5OXCIsIHY6ICd2OmM6c2hhcGU6aWRzOlM6aGFzLWNvbXBvbmVudCcsICAgICAgICAgbzogXCJOTlwiLCB9XG4gICAgICB7IHJhbms6IDIsIHM6IFwiTk5cIiwgdjogJ3Y6YzpzaGFwZTppZHM6Uzpjb21wb25lbnRzJywgICAgICAgICAgICBvOiBcIk5OXCIsIH1cbiAgICAgIF1cbiAgICBmb3Igcm93IGluIHJvd3NcbiAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX3ZlcmIucnVuIHJvd1xuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZV9mb3JtYXRzOiAtPlxuICAgIGRlYnVnICfOqWp6cnNkYl9fMzAnLCAnX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VfZm9ybWF0cydcbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2VfZm9ybWF0LnJ1biB7IGZvcm1hdDogJ2RzZjp0c3YnLCAgICAgICAgIGNvbW1lbnQ6ICdOTicsIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2VfZm9ybWF0LnJ1biB7IGZvcm1hdDogJ2RzZjptZDp0YWJsZScsICAgIGNvbW1lbnQ6ICdOTicsIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2VfZm9ybWF0LnJ1biB7IGZvcm1hdDogJ2RzZjpjc3YnLCAgICAgICAgIGNvbW1lbnQ6ICdOTicsIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2VfZm9ybWF0LnJ1biB7IGZvcm1hdDogJ2RzZjpqc29uJywgICAgICAgIGNvbW1lbnQ6ICdOTicsIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2VfZm9ybWF0LnJ1biB7IGZvcm1hdDogJ2RzZjptZCcsICAgICAgICAgIGNvbW1lbnQ6ICdOTicsIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2VfZm9ybWF0LnJ1biB7IGZvcm1hdDogJ2RzZjp0eHQnLCAgICAgICAgIGNvbW1lbnQ6ICdOTicsIH1cbiAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2VfZm9ybWF0LnJ1biB7IGZvcm1hdDogJ2RzZjpzZW1pY29sb25zJywgIGNvbW1lbnQ6ICdOTicsIH1cbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VzOiAtPlxuICAgIGRlYnVnICfOqWp6cnNkYl9fMzEnLCAnX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VzJ1xuICAgIHsgcGF0aHNcbiAgICAgIGZvcm1hdHMsIH0gPSBnZXRfcGF0aHNfYW5kX2Zvcm1hdHMoKVxuICAgICMgZHNrZXkgPSAnZHM6ZGljdDp1Y2Q6djE0LjA6dWhkaWR4JzsgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0yJywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkczpkaWN0Om1lYW5pbmdzJzsgICAgICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xJywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkczpkaWN0Ong6a28tSGFuZytMYXRuJzsgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0yJywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkczpkaWN0Ong6amEtS2FuK0xhdG4nOyAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0zJywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICAjIGRza2V5ID0gJ2RzOmRpY3Q6amE6a2Fuaml1bSc7ICAgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTQnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZHM6ZGljdDpqYTprYW5qaXVtOmF1eCc7ICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9NScsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkczpkaWN0OmtvOlY9ZGF0YS1nb3YuY3N2JzsgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj02JywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICAjIGRza2V5ID0gJ2RzOmRpY3Q6a286Vj1kYXRhLWdvdi5qc29uJzsgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTcnLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgICMgZHNrZXkgPSAnZHM6ZGljdDprbzpWPWRhdGEtbmF2ZXIuY3N2JzsgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9OCcsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgIyBkc2tleSA9ICdkczpkaWN0OmtvOlY9ZGF0YS1uYXZlci5qc29uJzsgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj05JywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICAjIGRza2V5ID0gJ2RzOmRpY3Q6a286Vj1SRUFETUUubWQnOyAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEwJywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkczpzaGFwZTppZHN2Mic7ICAgICAgICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xMScsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgZHNrZXkgPSAnZHM6c2hhcGU6emh6NWJmJzsgICAgICAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MTInLCBkc2tleSwgZm9ybWF0OiBmb3JtYXRzWyBkc2tleSBdLCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAgIGRza2V5ID0gJ2RzOnVjZGI6cnNncyc7ICAgICAgICAgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEzJywgZHNrZXksIGZvcm1hdDogZm9ybWF0c1sgZHNrZXkgXSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkczp1Y2Q6dWNkJzsgICAgICAgICAgICAgICAgICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0xNCcsIGRza2V5LCBmb3JtYXQ6IGZvcm1hdHNbIGRza2V5IF0sIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICAgO251bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyBfb25fb3Blbl9wb3B1bGF0ZV92ZXJiczogLT5cbiAgIyAgIHBhdGhzID0gZ2V0X3BhdGhzX2FuZF9mb3JtYXRzKClcbiAgIyAgIGRza2V5ID0gJ2RzOmRpY3Q6bWVhbmluZ3MnOyAgICAgICAgICBAc3RhdGVtZW50cy5pbnNlcnRfanpyX2RhdGFzb3VyY2UucnVuIHsgcm93aWQ6ICd0OmRzOlI9MScsIGRza2V5LCBwYXRoOiBwYXRoc1sgZHNrZXkgXSwgfVxuICAjICAgZHNrZXkgPSAnZHM6ZGljdDp1Y2Q6djE0LjA6dWhkaWR4JzsgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyByb3dpZDogJ3Q6ZHM6Uj0yJywgZHNrZXksIHBhdGg6IHBhdGhzWyBkc2tleSBdLCB9XG4gICMgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9saW5lczogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzMyJywgJ19vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGluZXMnXG4gICAgQHN0YXRlbWVudHMucG9wdWxhdGVfanpyX21pcnJvcl9saW5lcy5ydW4oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZ2x5cGhyYW5nZXM6IC0+XG4gICAgZGVidWcgJ86panpyc2RiX18zMycsICdfb25fb3Blbl9wb3B1bGF0ZV9qenJfZ2x5cGhyYW5nZXMnXG4gICAgQHN0YXRlbWVudHMucG9wdWxhdGVfanpyX2dseXBocmFuZ2VzLnJ1bigpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9nbHlwaHM6IC0+XG4gICAgZGVidWcgJ86panpyc2RiX18zNCcsICdfb25fb3Blbl9wb3B1bGF0ZV9qenJfZ2x5cGhzJ1xuICAgIHRyeVxuICAgICAgQHN0YXRlbWVudHMucG9wdWxhdGVfanpyX2dseXBocy5ydW4oKVxuICAgIGNhdGNoIGNhdXNlXG4gICAgICBmaWVsZHNfcnByID0gcnByIEBzdGF0ZS5tb3N0X3JlY2VudF9pbnNlcnRlZF9yb3dcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX18zNSB3aGVuIHRyeWluZyB0byBpbnNlcnQgdGhpcyByb3c6ICN7ZmllbGRzX3Jwcn0sIGFuIGVycm9yIHdhcyB0aHJvd246ICN7Y2F1c2UubWVzc2FnZX1cIiwgXFxcbiAgICAgICAgeyBjYXVzZSwgfVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlnZ2VyX29uX2JlZm9yZV9pbnNlcnQ6ICggbmFtZSwgZmllbGRzLi4uICkgLT5cbiAgICAjIGRlYnVnICfOqWp6cnNkYl9fMzYnLCB7IG5hbWUsIGZpZWxkcywgfVxuICAgIEBzdGF0ZS5tb3N0X3JlY2VudF9pbnNlcnRlZF9yb3cgPSB7IG5hbWUsIGZpZWxkcywgfVxuICAgIDtudWxsXG5cbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAjIyNcblxuICBvb29vbyAgICAgb29vIG9vb29vb29vb28uICAgb29vb29vb29vb29vXG4gIGA4ODgnICAgICBgOCcgYDg4OCcgICBgWThiICBgODg4JyAgICAgYDhcbiAgIDg4OCAgICAgICA4ICAgODg4ICAgICAgODg4ICA4ODggICAgICAgICAgLm9vb28ub1xuICAgODg4ICAgICAgIDggICA4ODggICAgICA4ODggIDg4OG9vb284ICAgIGQ4OCggIFwiOFxuICAgODg4ICAgICAgIDggICA4ODggICAgICA4ODggIDg4OCAgICBcIiAgICBgXCJZODhiLlxuICAgYDg4LiAgICAuOCcgICA4ODggICAgIGQ4OCcgIDg4OCAgICAgICAgIG8uICApODhiXG4gICAgIGBZYm9kUCcgICAgbzg4OGJvb2Q4UCcgICBvODg4byAgICAgICAgOFwiXCI4ODhQJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBAZnVuY3Rpb25zOlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBqenJfdHJpZ2dlcl9vbl9iZWZvcmVfaW5zZXJ0OlxuICAgICAgIyMjIE5PVEUgaW4gdGhlIGZ1dHVyZSB0aGlzIGZ1bmN0aW9uIGNvdWxkIHRyaWdnZXIgY3JlYXRpb24gb2YgdHJpZ2dlcnMgb24gaW5zZXJ0cyAjIyNcbiAgICAgIGRldGVybWluaXN0aWM6ICB0cnVlXG4gICAgICB2YXJhcmdzOiAgICAgICAgdHJ1ZVxuICAgICAgdmFsdWU6ICggbmFtZSwgZmllbGRzLi4uICkgLT4gQHRyaWdnZXJfb25fYmVmb3JlX2luc2VydCBuYW1lLCBmaWVsZHMuLi5cblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyMjIE5PVEUgbW92ZWQgdG8gRGJyaWNfc3RkOyBjb25zaWRlciB0byBvdmVyd3JpdGUgd2l0aCB2ZXJzaW9uIHVzaW5nIGBzbGV2aXRoYW4vcmVnZXhgICMjI1xuICAgICMgcmVnZXhwOlxuICAgICMgICBvdmVyd3JpdGU6ICAgICAgdHJ1ZVxuICAgICMgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICMgICB2YWx1ZTogKCBwYXR0ZXJuLCB0ZXh0ICkgLT4gaWYgKCAoIG5ldyBSZWdFeHAgcGF0dGVybiwgJ3YnICkudGVzdCB0ZXh0ICkgdGhlbiAxIGVsc2UgMFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBqenJfaGFzX3BlcmlwaGVyYWxfd3NfaW5famZpZWxkOlxuICAgICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAgIHZhbHVlOiAoIGpmaWVsZHNfanNvbiApIC0+XG4gICAgICAgIHJldHVybiBmcm9tX2Jvb2wgZmFsc2UgdW5sZXNzICggamZpZWxkcyA9IEpTT04ucGFyc2UgamZpZWxkc19qc29uICk/XG4gICAgICAgIHJldHVybiBmcm9tX2Jvb2wgZmFsc2UgdW5sZXNzICggdHlwZV9vZiBqZmllbGRzICkgaXMgJ2xpc3QnXG4gICAgICAgIHJldHVybiBmcm9tX2Jvb2wgamZpZWxkcy5zb21lICggdmFsdWUgKSAtPiAvKF5cXHMpfChcXHMkKS8udGVzdCB2YWx1ZVxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBqenJfY2hyX2Zyb21fY2lkOlxuICAgICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAgIHZhbHVlOiAoIGNpZCApIC0+IGdseXBoX2NvbnZlcnRlci5nbHlwaF9mcm9tX2NpZCBjaWRcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAganpyX2FzX2hleDpcbiAgICAgIGRldGVybWluaXN0aWM6ICB0cnVlXG4gICAgICB2YWx1ZTogKCBjaWQgKSAtPiBcIjB4I3soIGNpZC50b1N0cmluZyAxNiApLnBhZFN0YXJ0IDQsIDB9XCJcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAganpyX2ludGVnZXJfZnJvbV9oZXg6XG4gICAgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICAgdmFsdWU6ICggY2lkX2hleCApIC0+IHBhcnNlSW50IGNpZF9oZXgsIDE2XG5cbiAgICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgIyBqenJfaXNfY2prX2dseXBoOlxuICAgICMgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICMgICB2YWx1ZTogKCBjaWQgKSAtPiBcIjB4I3soIGNpZC50b1N0cmluZyAxNiApLnBhZFN0YXJ0IDQsIDB9XCJcblxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIEB0YWJsZV9mdW5jdGlvbnM6XG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGp6cl9zcGxpdF93b3JkczpcbiAgICAgIGNvbHVtbnM6ICAgICAgWyAna2V5d29yZCcsIF1cbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAnbGluZScsIF1cbiAgICAgIHJvd3M6ICggbGluZSApIC0+XG4gICAgICAgIGtleXdvcmRzID0gbGluZS5zcGxpdCAvKD86XFxwe1p9Kyl8KCg/OlxccHtTY3JpcHQ9SGFufSl8KD86XFxwe0x9Kyl8KD86XFxwe059Kyl8KD86XFxwe1N9KykpL3ZcbiAgICAgICAgZm9yIGtleXdvcmQgaW4ga2V5d29yZHNcbiAgICAgICAgICBjb250aW51ZSB1bmxlc3Mga2V5d29yZD9cbiAgICAgICAgICBjb250aW51ZSBpZiBrZXl3b3JkIGlzICcnXG4gICAgICAgICAgeWllbGQgeyBrZXl3b3JkLCB9XG4gICAgICAgIDtudWxsXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIGp6cl93YWxrX2ZpbGVfbGluZXM6XG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2xpbmVfbnInLCAnbGNvZGUnLCAnbGluZScsICdqZmllbGRzJyBdXG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ2Rza2V5JywgJ2Zvcm1hdCcsICdwYXRoJywgXVxuICAgICAgcm93czogKCBkc2tleSwgZm9ybWF0LCBwYXRoICkgLT5cbiAgICAgICAgeWllbGQgZnJvbSBuZXcgRGF0YXNvdXJjZV9maWVsZF9wYXJzZXIgeyBob3N0OiBAaG9zdCwgZHNrZXksIGZvcm1hdCwgcGF0aCwgfVxuICAgICAgICA7bnVsbFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBqenJfd2Fsa190cmlwbGVzOlxuICAgICAgcGFyYW1ldGVyczogICBbICdyb3dpZF9pbicsICdkc2tleScsICdqZmllbGRzJywgXVxuICAgICAgY29sdW1uczogICAgICBbICdyb3dpZF9vdXQnLCAncmVmJywgJ3MnLCAndicsICdvJywgXVxuICAgICAgcm93czogKCByb3dpZF9pbiwgZHNrZXksIGpmaWVsZHMgKSAtPlxuICAgICAgICBmaWVsZHMgID0gSlNPTi5wYXJzZSBqZmllbGRzXG4gICAgICAgIGVudHJ5ICAgPSBmaWVsZHNbIDIgXVxuICAgICAgICBzd2l0Y2ggZHNrZXlcbiAgICAgICAgICB3aGVuICdkczpkaWN0Ong6a28tSGFuZytMYXRuJyAgICAgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fZGljdF94X2tvX0hhbmdfTGF0biAgICAgICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAgIHdoZW4gJ2RzOmRpY3Q6bWVhbmluZ3MnIHRoZW4gc3dpdGNoIHRydWVcbiAgICAgICAgICAgIHdoZW4gKCBlbnRyeS5zdGFydHNXaXRoICdweTonICkgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX3poX0xhdG5fcGlueWluICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAgICAgd2hlbiAoIGVudHJ5LnN0YXJ0c1dpdGggJ2thOicgKSB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXNfZnJvbV9jX3JlYWRpbmdfamFfeF9LYW4gICAgICAgIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICAgICB3aGVuICggZW50cnkuc3RhcnRzV2l0aCAnaGk6JyApIHRoZW4geWllbGQgZnJvbSBAdHJpcGxlc19mcm9tX2NfcmVhZGluZ19qYV94X0thbiAgICAgICAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgICAgIHdoZW4gKCBlbnRyeS5zdGFydHNXaXRoICdoZzonICkgdGhlbiB5aWVsZCBmcm9tIEB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX2tvX0hhbmcgICAgICAgICByb3dpZF9pbiwgZHNrZXksIGZpZWxkc1xuICAgICAgICAgIHdoZW4gJ2RzOnNoYXBlOmlkc3YyJyAgICAgICAgICAgICB0aGVuIHlpZWxkIGZyb20gQHRyaXBsZXNfZnJvbV9zaGFwZV9pZHN2MiAgICAgICAgICAgICAgIHJvd2lkX2luLCBkc2tleSwgZmllbGRzXG4gICAgICAgICAgd2hlbiAnZHM6dWNkOnVjZCcgICAgICAgICAgICAgICAgIHRoZW4geWllbGQgZnJvbSBAdHJpcGxlc19mcm9tX3VjZF91Y2QgICAgICAgICAgICAgICAgICAgcm93aWRfaW4sIGRza2V5LCBmaWVsZHNcbiAgICAgICAgO251bGxcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAganpyX2Rpc2Fzc2VtYmxlX2hhbmdldWw6XG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ2hhbmcnLCBdXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2luaXRpYWwnLCAnbWVkaWFsJywgJ2ZpbmFsJywgXVxuICAgICAgcm93czogKCBoYW5nICkgLT5cbiAgICAgICAgamFtb3MgPSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5fVE1QX2hhbmdldWwuZGlzYXNzZW1ibGUgaGFuZywgeyBmbGF0dGVuOiBmYWxzZSwgfVxuICAgICAgICBmb3IgeyBmaXJzdDogaW5pdGlhbCwgdm93ZWw6IG1lZGlhbCwgbGFzdDogZmluYWwsIH0gaW4gamFtb3NcbiAgICAgICAgICB5aWVsZCB7IGluaXRpYWwsIG1lZGlhbCwgZmluYWwsIH1cbiAgICAgICAgO251bGxcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAganpyX3BhcnNlX3VjZGJfcnNnc19nbHlwaHJhbmdlOlxuICAgICAgcGFyYW1ldGVyczogICBbICdkc2tleScsICdsaW5lX25yJywgJ2pmaWVsZHMnLCBdXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ3JzZycsICdpc19jamsnLCAnbG8nLCAnaGknLCAnbmFtZScsIF1cbiAgICAgIHJvd3M6ICggZHNrZXksIGxpbmVfbnIsIGpmaWVsZHMgKSAtPlxuICAgICAgICBnbHlwaHJhbmdlID0gZGF0YXNvdXJjZV9mb3JtYXRfcGFyc2VyLnBhcnNlX3VjZGJfcnNnc19nbHlwaHJhbmdlIHsgZHNrZXksIGxpbmVfbnIsIGpmaWVsZHMsIH1cbiAgICAgICAgeWllbGQgZ2x5cGhyYW5nZSBpZiBnbHlwaHJhbmdlP1xuICAgICAgICA7bnVsbFxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBqenJfZ2VuZXJhdGVfY2lkc19hbmRfZ2x5cGhzOlxuICAgICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAnbG8nLCAnaGknLCBdXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2NpZCcsICdnbHlwaCcsIF1cbiAgICAgIHJvd3M6ICggbG8sIGhpICkgLT5cbiAgICAgICAgeWllbGQgZnJvbSBnbHlwaF9jb252ZXJ0ZXIuZ2VuZXJhdGVfY2lkc19hbmRfZ2x5cGhzIGxvLCBoaVxuICAgICAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpcGxlc19mcm9tX2RpY3RfeF9rb19IYW5nX0xhdG46ICggcm93aWRfaW4sIGRza2V5LCBbIHJvbGUsIHMsIG8sIF0gKSAtPlxuICAgIHJlZiAgICAgICA9IHJvd2lkX2luXG4gICAgdiAgICAgICAgID0gXCJ2Ong6a28tSGFuZytMYXRuOiN7cm9sZX1cIlxuICAgIG8gICAgICAgID89ICcnXG4gICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2LCBvLCB9XG4gICAgQHN0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX3poX0xhdG5fcGlueWluOiAoIHJvd2lkX2luLCBkc2tleSwgWyBfLCBzLCBlbnRyeSwgXSApIC0+XG4gICAgcmVmICAgICAgID0gcm93aWRfaW5cbiAgICB2ICAgICAgICAgPSAndjpjOnJlYWRpbmc6emgtTGF0bi1waW55aW4nXG4gICAgZm9yIHJlYWRpbmcgZnJvbSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5leHRyYWN0X2F0b25hbF96aF9yZWFkaW5ncyBlbnRyeVxuICAgICAgeWllbGQgeyByb3dpZF9vdXQ6IEBuZXh0X3RyaXBsZV9yb3dpZCwgcmVmLCBzLCB2LCBvOiByZWFkaW5nLCB9XG4gICAgQHN0YXRlLnRpbWVpdF9wcm9ncmVzcz8oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICB0cmlwbGVzX2Zyb21fY19yZWFkaW5nX2phX3hfS2FuOiAoIHJvd2lkX2luLCBkc2tleSwgWyBfLCBzLCBlbnRyeSwgXSApIC0+XG4gICAgcmVmICAgICAgID0gcm93aWRfaW5cbiAgICBpZiBlbnRyeS5zdGFydHNXaXRoICdrYTonXG4gICAgICB2X3hfS2FuICAgPSAndjpjOnJlYWRpbmc6amEteC1LYXQnXG4gICAgICB2X0xhdG4gICAgPSAndjpjOnJlYWRpbmc6amEteC1LYXQrTGF0bidcbiAgICBlbHNlXG4gICAgICB2X3hfS2FuICAgPSAndjpjOnJlYWRpbmc6amEteC1IaXInXG4gICAgICB2X0xhdG4gICAgPSAndjpjOnJlYWRpbmc6amEteC1IaXIrTGF0bidcbiAgICBmb3IgcmVhZGluZyBmcm9tIEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfamFfcmVhZGluZ3MgZW50cnlcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogdl94X0thbiwgbzogcmVhZGluZywgfVxuICAgICAgIyBmb3IgdHJhbnNjcmlwdGlvbiBmcm9tIEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLnJvbWFuaXplX2phX2thbmEgcmVhZGluZ1xuICAgICAgIyAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogdl9MYXRuLCBvOiB0cmFuc2NyaXB0aW9uLCB9XG4gICAgICB0cmFuc2NyaXB0aW9uID0gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMucm9tYW5pemVfamFfa2FuYSByZWFkaW5nXG4gICAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6IHZfTGF0biwgbzogdHJhbnNjcmlwdGlvbiwgfVxuICAgIEBzdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpcGxlc19mcm9tX2NfcmVhZGluZ19rb19IYW5nOiAoIHJvd2lkX2luLCBkc2tleSwgWyBfLCBzLCBlbnRyeSwgXSApIC0+XG4gICAgcmVmICAgICAgID0gcm93aWRfaW5cbiAgICB2ICAgICAgICAgPSAndjpjOnJlYWRpbmc6a28tSGFuZydcbiAgICBmb3IgcmVhZGluZyBmcm9tIEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLmV4dHJhY3RfaGdfcmVhZGluZ3MgZW50cnlcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdiwgbzogcmVhZGluZywgfVxuICAgIEBzdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgdHJpcGxlc19mcm9tX3NoYXBlX2lkc3YyOiAoIHJvd2lkX2luLCBkc2tleSwgWyBfLCBzLCBmb3JtdWxhLCBdICkgLT5cbiAgICByZWYgICAgICAgPSByb3dpZF9pblxuICAgICMgZm9yIHJlYWRpbmcgZnJvbSBAaG9zdC5sYW5ndWFnZV9zZXJ2aWNlcy5wYXJzZV9pZHMgZm9ybXVsYVxuICAgICMgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHYsIG86IHJlYWRpbmcsIH1cbiAgICByZXR1cm4gbnVsbCBpZiAoIG5vdCBmb3JtdWxhPyApIG9yICggZm9ybXVsYSBpcyAnJyApXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6ICd2OmM6c2hhcGU6aWRzOlM6Zm9ybXVsYScsIG86IGZvcm11bGEsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGVycm9yID0gbnVsbFxuICAgIHRyeSBmb3JtdWxhX2FzdCA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLnBhcnNlX2lkbHggZm9ybXVsYSBjYXRjaCBlcnJvclxuICAgICAgbyA9IEpTT04uc3RyaW5naWZ5IHsgcmVmOiAnzqlqenJzZGJfXzM3JywgbWVzc2FnZTogZXJyb3IubWVzc2FnZSwgcm93OiB7IHJvd2lkX2luLCBkc2tleSwgcywgZm9ybXVsYSwgfSwgfVxuICAgICAgd2FybiBcImVycm9yOiAje299XCJcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ3Y6YzpzaGFwZTppZHM6ZXJyb3InLCBvLCB9XG4gICAgcmV0dXJuIG51bGwgaWYgZXJyb3I/XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBmb3JtdWxhX2pzb24gICAgPSBKU09OLnN0cmluZ2lmeSBmb3JtdWxhX2FzdFxuICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ3Y6YzpzaGFwZTppZHM6Uzphc3QnLCBvOiBmb3JtdWxhX2pzb24sIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHsgb3BlcmF0b3JzLFxuICAgICAgY29tcG9uZW50cywgfSA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLm9wZXJhdG9yc19hbmRfY29tcG9uZW50c19mcm9tX2lkbHggZm9ybXVsYV9hc3RcbiAgICBzZWVuX29wZXJhdG9ycyAgPSBuZXcgU2V0KClcbiAgICBzZWVuX2NvbXBvbmVudHMgPSBuZXcgU2V0KClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGNvbXBvbmVudHNfanNvbiA9IEpTT04uc3RyaW5naWZ5IGNvbXBvbmVudHNcbiAgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHY6ICd2OmM6c2hhcGU6aWRzOlM6Y29tcG9uZW50cycsIG86IGNvbXBvbmVudHNfanNvbiwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZm9yIG9wZXJhdG9yIGluIG9wZXJhdG9yc1xuICAgICAgY29udGludWUgaWYgc2Vlbl9vcGVyYXRvcnMuaGFzIG9wZXJhdG9yXG4gICAgICBzZWVuX29wZXJhdG9ycy5hZGQgb3BlcmF0b3JcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ3Y6YzpzaGFwZTppZHM6UzpoYXMtb3BlcmF0b3InLCBvOiBvcGVyYXRvciwgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZm9yIGNvbXBvbmVudCBpbiBjb21wb25lbnRzXG4gICAgICBjb250aW51ZSBpZiBzZWVuX2NvbXBvbmVudHMuaGFzIGNvbXBvbmVudFxuICAgICAgc2Vlbl9jb21wb25lbnRzLmFkZCBjb21wb25lbnRcbiAgICAgIHlpZWxkIHsgcm93aWRfb3V0OiBAbmV4dF90cmlwbGVfcm93aWQsIHJlZiwgcywgdjogJ3Y6YzpzaGFwZTppZHM6UzpoYXMtY29tcG9uZW50JywgbzogY29tcG9uZW50LCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBAc3RhdGUudGltZWl0X3Byb2dyZXNzPygpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHRyaXBsZXNfZnJvbV91Y2RfdWNkOiAoIHJvd2lkX2luLCBkc2tleSwgWyBfLCBzLCBlbnRyeSwgXSApIC0+XG4gICAgeWllbGQgcmV0dXJuIG51bGxcbiAgICAjIHJlZiAgICAgICA9IHJvd2lkX2luXG4gICAgIyB2ICAgICAgICAgPSAndjpjOnJlYWRpbmc6a28tSGFuZydcbiAgICAjIGZvciByZWFkaW5nIGZyb20gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMuZXh0cmFjdF9oZ19yZWFkaW5ncyBlbnRyeVxuICAgICMgICB5aWVsZCB7IHJvd2lkX291dDogQG5leHRfdHJpcGxlX3Jvd2lkLCByZWYsIHMsIHYsIG86IHJlYWRpbmcsIH1cbiAgICAjIEBzdGF0ZS50aW1laXRfcHJvZ3Jlc3M/KClcbiAgICA7bnVsbFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyMjXG5cbiAgICAgIC5vOCAgICAgICAgICAgIC5vODhvLlxuICAgICBcIjg4OCAgICAgICAgICAgIDg4OCBgXCJcbiAub29vbzg4OCAgIC5vb29vLm8gbzg4OG9vICAgICBvby5vb29vby4gICAub29vby4gICBvb29vIGQ4YiAgLm9vb28ubyAgLm9vb29vLiAgb29vbyBkOGJcbmQ4OCcgYDg4OCAgZDg4KCAgXCI4ICA4ODggICAgICAgIDg4OCcgYDg4YiBgUCAgKTg4YiAgYDg4OFwiXCI4UCBkODgoICBcIjggZDg4JyBgODhiIGA4ODhcIlwiOFBcbjg4OCAgIDg4OCAgYFwiWTg4Yi4gICA4ODggICAgICAgIDg4OCAgIDg4OCAgLm9QXCI4ODggICA4ODggICAgIGBcIlk4OGIuICA4ODhvb284ODggIDg4OFxuODg4ICAgODg4ICBvLiAgKTg4YiAgODg4ICAgICAgICA4ODggICA4ODggZDgoICA4ODggICA4ODggICAgIG8uICApODhiIDg4OCAgICAubyAgODg4XG5gWThib2Q4OFBcIiA4XCJcIjg4OFAnIG84ODhvICAgICAgIDg4OGJvZDhQJyBgWTg4OFwiXCI4byBkODg4YiAgICA4XCJcIjg4OFAnIGBZOGJvZDhQJyBkODg4YlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA4ODhcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvODg4b1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIERhdGFzb3VyY2VfZmllbGRfcGFyc2VyXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogKHsgaG9zdCwgZHNrZXksIGZvcm1hdCwgcGF0aCwgfSkgLT5cbiAgICBAaG9zdCAgICAgPSBob3N0XG4gICAgQGRza2V5ICAgID0gZHNrZXlcbiAgICBAZm9ybWF0ICAgPSBmb3JtYXRcbiAgICBAcGF0aCAgICAgPSBwYXRoXG4gICAgO3VuZGVmaW5lZFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgW1N5bWJvbC5pdGVyYXRvcl06IC0+IHlpZWxkIGZyb20gQHdhbGsoKVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgd2FsazogLT5cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzM4JywgXCJEYXRhc291cmNlX2ZpZWxkX3BhcnNlcjo6d2FsazpcIiwgeyBmb3JtYXQ6IEBmb3JtYXQsIGRza2V5OiBAZHNrZXksIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIG1ldGhvZF9uYW1lID0gJ3dhbGtfJyArIEBmb3JtYXQucmVwbGFjZSAvW15hLXpdL2d2LCAnXydcbiAgICBtZXRob2QgICAgICA9IEBbIG1ldGhvZF9uYW1lIF0gPyBAX3dhbGtfbm9fc3VjaF9wYXJzZXJcbiAgICB5aWVsZCBmcm9tIG1ldGhvZC5jYWxsIEBcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX3dhbGtfbm9fc3VjaF9wYXJzZXI6IC0+XG4gICAgbWVzc2FnZSA9IFwizqlqenJzZGJfXzM5IG5vIHBhcnNlciBmb3VuZCBmb3IgZm9ybWF0ICN7cnByIEBmb3JtYXR9XCJcbiAgICB3YXJuIG1lc3NhZ2VcbiAgICB5aWVsZCB7IGxpbmVfbnI6IDAsIGxjb2RlOiAnRScsIGxpbmU6IG1lc3NhZ2UsIGpmaWVsZHM6IG51bGwsIH1cbiAgICBmb3IgeyBsbnI6IGxpbmVfbnIsIGxpbmUsIGVvbCwgfSBmcm9tIHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgQHBhdGhcbiAgICAgIHlpZWxkIHsgbGluZV9uciwgbGNvZGU6ICdVJywgbGluZSwgamZpZWxkczogbnVsbCwgfVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfd2Fsa19maWVsZHNfd2l0aF9zZXBhcmF0b3I6ICh7IGNvbW1lbnRfcmUgPSAvXlxccyojL3YsIHNwbGl0dGVyID0gJ1xcdCcsIH0pIC0+XG4gICAgZm9yIHsgbG5yOiBsaW5lX25yLCBsaW5lLCBlb2wsIH0gZnJvbSB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zIEBwYXRoXG4gICAgICBsaW5lICAgID0gQGhvc3QubGFuZ3VhZ2Vfc2VydmljZXMubm9ybWFsaXplX3RleHQgbGluZVxuICAgICAgamZpZWxkcyA9IG51bGxcbiAgICAgIHN3aXRjaCB0cnVlXG4gICAgICAgIHdoZW4gL15cXHMqJC92LnRlc3QgbGluZSB0aGVuIGxjb2RlID0gJ0InXG4gICAgICAgIHdoZW4gY29tbWVudF9yZS50ZXN0IGxpbmUgdGhlbiBsY29kZSA9ICdDJ1xuICAgICAgICBlbHNlXG4gICAgICAgICAgbGNvZGUgPSAnRCdcbiAgICAgICAgICBqZmllbGRzICAgPSBKU09OLnN0cmluZ2lmeSBsaW5lLnNwbGl0IHNwbGl0dGVyXG4gICAgICB5aWVsZCB7IGxpbmVfbnIsIGxjb2RlLCBsaW5lLCBqZmllbGRzLCB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHdhbGtfZHNmX3RzdjogLT5cbiAgICB5aWVsZCBmcm9tIEBfd2Fsa19maWVsZHNfd2l0aF9zZXBhcmF0b3IgeyBzcGxpdHRlcjogJ1xcdCcsIH1cbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgd2Fsa19kc2Zfc2VtaWNvbG9uczogLT5cbiAgICB5aWVsZCBmcm9tIEBfd2Fsa19maWVsZHNfd2l0aF9zZXBhcmF0b3IgeyBzcGxpdHRlcjogJzsnLCB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIHdhbGtfZHNmX21kX3RhYmxlOiAtPlxuICAgIGZvciB7IGxucjogbGluZV9uciwgbGluZSwgZW9sLCB9IGZyb20gd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBAcGF0aFxuICAgICAgbGluZSAgICA9IEBob3N0Lmxhbmd1YWdlX3NlcnZpY2VzLm5vcm1hbGl6ZV90ZXh0IGxpbmVcbiAgICAgIGpmaWVsZHMgPSBudWxsXG4gICAgICBsY29kZSAgID0gJ1UnXG4gICAgICBzd2l0Y2ggdHJ1ZVxuICAgICAgICB3aGVuIC9eXFxzKiQvdi50ZXN0IGxpbmUgICAgICAgdGhlbiBsY29kZSA9ICdCJ1xuICAgICAgICB3aGVuIG5vdCBsaW5lLnN0YXJ0c1dpdGggJ3wnICB0aGVuIG51bGwgIyBub3QgYW4gTUQgdGFibGVcbiAgICAgICAgd2hlbiBsaW5lLnN0YXJ0c1dpdGggJ3wtJyAgICAgdGhlbiBudWxsICMgTUQgdGFibGUgaGVhZGVyIHNlcGFyYXRvclxuICAgICAgICB3aGVuIC9eXFx8XFxzK1xcKi92LnRlc3QgbGluZSAgICB0aGVuIG51bGwgIyBNRCB0YWJsZSBoZWFkZXJcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGxjb2RlICAgPSAnRCdcbiAgICAgICAgICBqZmllbGRzID0gbGluZS5zcGxpdCAnfCdcbiAgICAgICAgICBqZmllbGRzLnNoaWZ0KClcbiAgICAgICAgICBqZmllbGRzLnBvcCgpXG4gICAgICAgICAgamZpZWxkcyA9ICggZmllbGQudHJpbSgpICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgZmllbGQgaW4gamZpZWxkcyApXG4gICAgICAgICAgamZpZWxkcyA9ICggKCBmaWVsZC5yZXBsYWNlIC9eYCguKylgJC9ndiwgJyQxJyApICBmb3IgZmllbGQgaW4gamZpZWxkcyApXG4gICAgICAgICAgamZpZWxkcyA9IEpTT04uc3RyaW5naWZ5IGpmaWVsZHNcbiAgICAgICAgICAjIGRlYnVnICfOqWp6cnNkYl9fNDAnLCBqZmllbGRzXG4gICAgICB5aWVsZCB7IGxpbmVfbnIsIGxjb2RlLCBsaW5lLCBqZmllbGRzLCB9XG4gICAgO251bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyB3YWxrX2NzdjogLT5cbiAgIyAgIHlpZWxkIHJldHVybiBudWxsXG5cbiAgIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICMgd2Fsa19qc29uOiAtPlxuICAjICAgeWllbGQgcmV0dXJuIG51bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyB3YWxrX21kOiAtPlxuICAjICAgeWllbGQgcmV0dXJuIG51bGxcblxuICAjICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgIyB3YWxrX3R4dDogLT5cbiAgIyAgIHlpZWxkIHJldHVybiBudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBkYXRhc291cmNlX2Zvcm1hdF9wYXJzZXJcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBwYXJzZV91Y2RiX3JzZ3NfZ2x5cGhyYW5nZTogKHsgamZpZWxkcywgfSkgLT5cbiAgICBbIGRncm91cCxcbiAgICAgIGljbGFiZWwsXG4gICAgICByc2csXG4gICAgICBpc19jamtfdHh0LFxuICAgICAgbG9faGlfdHh0LFxuICAgICAgbmFtZSwgICAgIF0gPSBKU09OLnBhcnNlIGpmaWVsZHNcbiAgICByZXR1cm4gbnVsbCB1bmxlc3MgZGdyb3VwIGlzICdgZGc6cnNnc2AnXG4gICAgbG9faGlfcmUgICAgICA9IC8vLyBeIDB4ICg/PGxvPiBbMC05YS1mXXsxLDZ9ICkgXFxzKlxcLlxcLlxccyogMHggKD88aGk+IFswLTlhLWZdezEsNn0gKSAkIC8vL2l2XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpc19jamsgPSBzd2l0Y2ggaXNfY2prX3R4dFxuICAgICAgd2hlbiAndHJ1ZScgICB0aGVuIDFcbiAgICAgIHdoZW4gJ2ZhbHNlJyAgdGhlbiAwXG4gICAgICBlbHNlIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX180MSBleHBlY3RlZCAndHJ1ZScgb3IgJ2ZhbHNlJywgZ290ICN7cnByIGlzX2Nqa190eHR9XCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHVubGVzcyAoIG1hdGNoID0gbG9faGlfdHh0Lm1hdGNoIGxvX2hpX3JlICk/XG4gICAgICB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fNDIgZXhwZWN0ZWQgYSByYW5nZSBsaXRlcmFsIGxpa2UgJzB4MDFhNi4uMHgxMGZmJywgZ290ICN7cnByIGxvX2hpX3R4dH1cIlxuICAgIGxvICA9IHBhcnNlSW50IG1hdGNoLmdyb3Vwcy5sbywgMTZcbiAgICBoaSAgPSBwYXJzZUludCBtYXRjaC5ncm91cHMuaGksIDE2XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICByZXR1cm4geyByc2csIGlzX2NqaywgbG8sIGhpLCBuYW1lLCB9XG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBnbHlwaF9jb252ZXJ0ZXJcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBnbHlwaF9mcm9tX2NpZDogKCBjaWQgKSAtPlxuICAgIHJldHVybiBudWxsIHVubGVzcyAoIC9eW1xccHtMfVxccHtTfVxccHtQfVxccHtNfVxccHtOfVxccHtac31cXHB7Q299XSQvdi50ZXN0IFIgPSBTdHJpbmcuZnJvbUNvZGVQb2ludCBjaWQgKVxuICAgIHJldHVybiBSXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAZ2VuZXJhdGVfY2lkc19hbmRfZ2x5cGhzOiAoIGxvLCBoaSApIC0+XG4gICAgZm9yIGNpZCBpbiBbIGxvIC4uIGhpIF1cbiAgICAgIGNvbnRpbnVlIHVubGVzcyAoIGdseXBoID0gQGdseXBoX2Zyb21fY2lkIGNpZCApP1xuICAgICAgeWllbGQgeyBjaWQsIGdseXBoLCB9XG4gICAgO251bGxcblxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyMjXG5cbm9vb29vXG5gODg4J1xuIDg4OCAgICAgICAgICAub29vby4gICBvb28uIC5vby4gICAgLm9vb29vb29vICAgICAgICAgICAgICAub29vby5vIG9vb28gZDhiIG9vb28gICAgb29vXG4gODg4ICAgICAgICAgYFAgICk4OGIgIGA4ODhQXCJZODhiICA4ODgnIGA4OGIgICAgICAgICAgICAgIGQ4OCggIFwiOCBgODg4XCJcIjhQICBgODguICAuOCdcbiA4ODggICAgICAgICAgLm9QXCI4ODggICA4ODggICA4ODggIDg4OCAgIDg4OCAgICAgICAgICAgICAgYFwiWTg4Yi4gICA4ODggICAgICAgYDg4Li44J1xuIDg4OCAgICAgICBvIGQ4KCAgODg4ICAgODg4ICAgODg4ICBgODhib2Q4UCcgICAgICAgICAgICAgIG8uICApODhiICA4ODggICAgICAgIGA4ODgnXG5vODg4b29vb29vZDggYFk4ODhcIlwiOG8gbzg4OG8gbzg4OG8gYDhvb29vb28uICBvb29vb29vb29vbyA4XCJcIjg4OFAnIGQ4ODhiICAgICAgICBgOCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZFwiICAgICBZRFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcIlk4ODg4OFAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgTGFuZ3VhZ2Vfc2VydmljZXNcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGNvbnN0cnVjdG9yOiAtPlxuICAgIEBfVE1QX2hhbmdldWwgPSByZXF1aXJlICdoYW5ndWwtZGlzYXNzZW1ibGUnXG4gICAgQF9UTVBfa2FuYSAgICA9IHJlcXVpcmUgJ3dhbmFrYW5hJ1xuICAgICMgeyB0b0hpcmFnYW5hLFxuICAgICMgICB0b0thbmEsXG4gICAgIyAgIHRvS2F0YWthbmFcbiAgICAjICAgdG9Sb21hamksXG4gICAgIyAgIHRva2VuaXplLCAgICAgICAgIH0gPSByZXF1aXJlICd3YW5ha2FuYSdcbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBub3JtYWxpemVfdGV4dDogKCB0ZXh0LCBmb3JtID0gJ05GQycgKSAtPiB0ZXh0Lm5vcm1hbGl6ZSBmb3JtXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICByZW1vdmVfcGlueWluX2RpYWNyaXRpY3M6ICggdGV4dCApIC0+ICggdGV4dC5ub3JtYWxpemUgJ05GS0QnICkucmVwbGFjZSAvXFxQe0x9L2d2LCAnJ1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZXh0cmFjdF9hdG9uYWxfemhfcmVhZGluZ3M6ICggZW50cnkgKSAtPlxuICAgICMgcHk6emjDuSwgemhlLCB6aMSBbywgemjDoW8sIHpox5QsIHrEq1xuICAgIFIgPSBlbnRyeVxuICAgIFIgPSBSLnJlcGxhY2UgL15weTovdiwgJydcbiAgICBSID0gUi5zcGxpdCAvLFxccyovdlxuICAgIFIgPSAoICggQHJlbW92ZV9waW55aW5fZGlhY3JpdGljcyB6aF9yZWFkaW5nICkgZm9yIHpoX3JlYWRpbmcgaW4gUiApXG4gICAgUiA9IG5ldyBTZXQgUlxuICAgIFIuZGVsZXRlICdudWxsJ1xuICAgIFIuZGVsZXRlICdAbnVsbCdcbiAgICByZXR1cm4gWyBSLi4uLCBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBleHRyYWN0X2phX3JlYWRpbmdzOiAoIGVudHJ5ICkgLT5cbiAgICAjIOepuiAgICAgIGhpOuOBneOCiSwg44GCwrco44GPfOOBjXzjgZHjgospLCDjgYvjgoksIOOBmcK3KOOBj3zjgYvjgZkpLCDjgoDjgarCt+OBl+OBhFxuICAgIFIgPSBlbnRyeVxuICAgIFIgPSBSLnJlcGxhY2UgL14oPzpoaXxrYSk6L3YsICcnXG4gICAgUiA9IFIucmVwbGFjZSAvXFxzKy9ndiwgJydcbiAgICBSID0gUi5zcGxpdCAvLFxccyovdlxuICAgICMjIyBOT1RFIHJlbW92ZSBuby1yZWFkaW5ncyBtYXJrZXIgYEBudWxsYCBhbmQgY29udGV4dHVhbCByZWFkaW5ncyBsaWtlIC3jg43jg7MgZm9yIOe4gSwgLeODjuOCpiBmb3Ig546LICMjI1xuICAgIFIgPSAoIHJlYWRpbmcgZm9yIHJlYWRpbmcgaW4gUiB3aGVuIG5vdCByZWFkaW5nLnN0YXJ0c1dpdGggJy0nIClcbiAgICBSID0gbmV3IFNldCBSXG4gICAgUi5kZWxldGUgJ251bGwnXG4gICAgUi5kZWxldGUgJ0BudWxsJ1xuICAgIHJldHVybiBbIFIuLi4sIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGV4dHJhY3RfaGdfcmVhZGluZ3M6ICggZW50cnkgKSAtPlxuICAgICMg56m6ICAgICAgaGk644Gd44KJLCDjgYLCtyjjgY9844GNfOOBkeOCiyksIOOBi+OCiSwg44GZwrco44GPfOOBi+OBmSksIOOCgOOBqsK344GX44GEXG4gICAgUiA9IGVudHJ5XG4gICAgUiA9IFIucmVwbGFjZSAvXig/OmhnKTovdiwgJydcbiAgICBSID0gUi5yZXBsYWNlIC9cXHMrL2d2LCAnJ1xuICAgIFIgPSBSLnNwbGl0IC8sXFxzKi92XG4gICAgUiA9IG5ldyBTZXQgUlxuICAgIFIuZGVsZXRlICdudWxsJ1xuICAgIFIuZGVsZXRlICdAbnVsbCdcbiAgICBoYW5nZXVsID0gWyBSLi4uLCBdLmpvaW4gJydcbiAgICAjIGRlYnVnICfOqWp6cnNkYl9fNDMnLCBAX1RNUF9oYW5nZXVsLmRpc2Fzc2VtYmxlIGhhbmdldWwsIHsgZmxhdHRlbjogZmFsc2UsIH1cbiAgICByZXR1cm4gWyBSLi4uLCBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICByb21hbml6ZV9qYV9rYW5hOiAoIGVudHJ5ICkgLT5cbiAgICBjZmcgPSB7fVxuICAgIHJldHVybiBAX1RNUF9rYW5hLnRvUm9tYWppIGVudHJ5LCBjZmdcbiAgICAjICMjIyBzeXN0ZW1hdGljIG5hbWUgbW9yZSBsaWtlIGAuLi5famFfeF9rYW5fbGF0bigpYCAjIyNcbiAgICAjIGhlbHAgJ86pZGprcl9fNDQnLCB0b0hpcmFnYW5hICAn44Op44O844Oh44OzJywgICAgICAgeyBjb252ZXJ0TG9uZ1Zvd2VsTWFyazogZmFsc2UsIH1cbiAgICAjIGhlbHAgJ86pZGprcl9fNDUnLCB0b0hpcmFnYW5hICAn44Op44O844Oh44OzJywgICAgICAgeyBjb252ZXJ0TG9uZ1Zvd2VsTWFyazogdHJ1ZSwgfVxuICAgICMgaGVscCAnzqlkamtyX180NicsIHRvS2FuYSAgICAgICd3YW5ha2FuYScsICAgeyBjdXN0b21LYW5hTWFwcGluZzogeyBuYTogJ+OBqycsIGthOiAnQmFuYScgfSwgfVxuICAgICMgaGVscCAnzqlkamtyX180NycsIHRvS2FuYSAgICAgICd3YW5ha2FuYScsICAgeyBjdXN0b21LYW5hTWFwcGluZzogeyB3YWthOiAnKOWSjOatjCknLCB3YTogJyjlkowyKScsIGthOiAnKOatjDIpJywgbmE6ICco5ZCNKScsIGthOiAnKEJhbmEpJywgbmFrYTogJyjkuK0pJywgfSwgfVxuICAgICMgaGVscCAnzqlkamtyX180OCcsIHRvUm9tYWppICAgICfjgaTjgZjjgY7jgoonLCAgICAgeyBjdXN0b21Sb21hamlNYXBwaW5nOiB7IOOBmDogJyh6aSknLCDjgaQ6ICcodHUpJywg44KKOiAnKGxpKScsIOOCiuOCh+OBhjogJyhyeW91KScsIOOCiuOChzogJyhyeW8pJyB9LCB9XG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBwYXJzZV9pZGx4OiAoIGZvcm11bGEgKSAtPiBJRExYLnBhcnNlIGZvcm11bGFcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIG9wZXJhdG9yc19hbmRfY29tcG9uZW50c19mcm9tX2lkbHg6ICggZm9ybXVsYSApIC0+XG4gICAgc3dpdGNoIHR5cGUgPSB0eXBlX29mIGZvcm11bGFcbiAgICAgIHdoZW4gJ3RleHQnICAgdGhlbiAgZm9ybXVsYV9hc3QgPSBAcGFyc2VfaWRseCBmb3JtdWxhXG4gICAgICB3aGVuICdsaXN0JyAgIHRoZW4gIGZvcm11bGFfYXN0ID0gICAgICAgICAgICAgZm9ybXVsYVxuICAgICAgZWxzZSB0aHJvdyBuZXcgRXJyb3IgXCLOqWp6cnNkYl9fNDkgZXhwZWN0ZWQgYSB0ZXh0IG9yIGEgbGlzdCwgZ290IGEgI3t0eXBlfVwiXG4gICAgb3BlcmF0b3JzICAgPSBbXVxuICAgIGNvbXBvbmVudHMgID0gW11cbiAgICBzZXBhcmF0ZSAgICA9ICggbGlzdCApIC0+XG4gICAgICBmb3IgZWxlbWVudCwgaWR4IGluIGxpc3RcbiAgICAgICAgaWYgaWR4IGlzIDBcbiAgICAgICAgICBvcGVyYXRvcnMucHVzaCBlbGVtZW50XG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgaWYgKCB0eXBlX29mIGVsZW1lbnQgKSBpcyAnbGlzdCdcbiAgICAgICAgICBzZXBhcmF0ZSBlbGVtZW50XG4gICAgICAgICAgIyBjb21wb25lbnRzLnNwbGljZSBjb21wb25lbnRzLmxlbmd0aCwgMCwgKCBzZXBhcmF0ZSBlbGVtZW50ICkuLi5cbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICBjb21wb25lbnRzLnB1c2ggZWxlbWVudFxuICAgIHNlcGFyYXRlIGZvcm11bGFfYXN0XG4gICAgcmV0dXJuIHsgb3BlcmF0b3JzLCBjb21wb25lbnRzLCB9XG5cblxuXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyMjIFRBSU5UIGdvZXMgaW50byBjb25zdHJ1Y3RvciBvZiBKenIgY2xhc3MgIyMjXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyMjXG5cbiAgIG9vb28gIG84b1xuICAgYDg4OCAgYFwiJ1xuICAgIDg4OCBvb29vICAgIG9vb29vb29vIG9vb28gIG9vb28gIG9vb28gZDhiICAub29vby5cbiAgICA4ODggYDg4OCAgIGQnXCJcIjdkOFAgIGA4ODggIGA4ODggIGA4ODhcIlwiOFAgYFAgICk4OGJcbiAgICA4ODggIDg4OCAgICAgLmQ4UCcgICAgODg4ICAgODg4ICAgODg4ICAgICAgLm9QXCI4ODhcbiAgICA4ODggIDg4OCAgIC5kOFAnICAuUCAgODg4ICAgODg4ICAgODg4ICAgICBkOCggIDg4OFxuLm8uIDg4UCBvODg4byBkODg4ODg4OFAgICBgVjg4VlwiVjhQJyBkODg4YiAgICBgWTg4OFwiXCI4b1xuYFk4ODhQXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgSml6dXJhXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBjb25zdHJ1Y3RvcjogLT5cbiAgICB7IHBhdGhzLCB9ICAgICAgICAgID0gZ2V0X3BhdGhzX2FuZF9mb3JtYXRzKClcbiAgICBAcGF0aHMgICAgICAgICAgICAgID0gcGF0aHNcbiAgICBAbGFuZ3VhZ2Vfc2VydmljZXMgID0gbmV3IExhbmd1YWdlX3NlcnZpY2VzKClcbiAgICBAZGJhICAgICAgICAgICAgICAgID0gbmV3IEp6cl9kYl9hZGFwdGVyIEBwYXRocy5kYiwgeyBob3N0OiBALCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwYXJhbWV0ZXJfc2V0cyAgICAgID0gW1xuICAgICAgeyBkc2tleTogJ2RzOmRpY3Q6eDprby1IYW5nK0xhdG4nLCAgdl9yZTogJ3wnLCAgICB9XG4gICAgICB7IGRza2V5OiAnZHM6ZGljdDptZWFuaW5ncycsICAgICAgICB2X3JlOiAnXnB5OicsIH1cbiAgICAgIHsgZHNrZXk6ICdkczpkaWN0Om1lYW5pbmdzJywgICAgICAgIHZfcmU6ICdea2E6JywgfVxuICAgICAgeyBkc2tleTogJ2RzOmRpY3Q6bWVhbmluZ3MnLCAgICAgICAgdl9yZTogJ15oaTonLCB9XG4gICAgICB7IGRza2V5OiAnZHM6ZGljdDptZWFuaW5ncycsICAgICAgICB2X3JlOiAnXmhnOicsIH1cbiAgICAgIHsgZHNrZXk6ICdkczpzaGFwZTppZHN2MicsICAgICAgICAgIHZfcmU6ICd8JywgICAgfVxuICAgICAgeyBkc2tleTogJ2RzOnVjZDp1Y2QnLCAgICAgICAgICAgICAgdl9yZTogJ3wnLCAgICB9XG4gICAgICBdXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpZiBAZGJhLmlzX2ZyZXNoXG4gICAgICAjIyMgVEFJTlQgbW92ZSB0byBKenJfZGJfYWRhcHRlciB0b2dldGhlciB3aXRoIHRyeS9jYXRjaCAjIyNcbiAgICAgIGZvciBwYXJhbWV0ZXJzIGluIHBhcmFtZXRlcl9zZXRzXG4gICAgICAgIGRlYnVnICfOqWp6cnNkYl9fNTAnLCAncG9wdWxhdGVfanpyX21pcnJvcl90cmlwbGVzJywgcGFyYW1ldGVyc1xuICAgICAgICB0cnlcbiAgICAgICAgICBAZGJhLnN0YXRlbWVudHMucG9wdWxhdGVfanpyX21pcnJvcl90cmlwbGVzLnJ1biBwYXJhbWV0ZXJzXG4gICAgICAgIGNhdGNoIGNhdXNlXG4gICAgICAgICAgZmllbGRzX3JwciA9IHJwciBAZGJhLnN0YXRlLm1vc3RfcmVjZW50X2luc2VydGVkX3Jvd1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX181MSB3aGVuIHRyeWluZyB0byBpbnNlcnQgdGhpcyByb3c6ICN7ZmllbGRzX3Jwcn0sIGFuIGVycm9yIHdhcyB0aHJvd246ICN7Y2F1c2UubWVzc2FnZX1cIiwgXFxcbiAgICAgICAgICAgIHsgY2F1c2UsIH1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICAjIyMgVEFJTlQgbW92ZSB0byBKenJfZGJfYWRhcHRlciB0b2dldGhlciB3aXRoIHRyeS9jYXRjaCAjIyNcbiAgICAgIGRlYnVnICfOqWp6cnNkYl9fNTInLCAncG9wdWxhdGVfanpyX2xhbmdfaGFuZ2V1bF9zeWxsYWJsZXMnXG4gICAgICB0cnlcbiAgICAgICAgQGRiYS5zdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9sYW5nX2hhbmdldWxfc3lsbGFibGVzLnJ1bigpXG4gICAgICBjYXRjaCBjYXVzZVxuICAgICAgICBmaWVsZHNfcnByID0gcnByIEBkYmEuc3RhdGUubW9zdF9yZWNlbnRfaW5zZXJ0ZWRfcm93XG4gICAgICAgIHRocm93IG5ldyBFcnJvciBcIs6panpyc2RiX181MyB3aGVuIHRyeWluZyB0byBpbnNlcnQgdGhpcyByb3c6ICN7ZmllbGRzX3Jwcn0sIGFuIGVycm9yIHdhcyB0aHJvd246ICN7Y2F1c2UubWVzc2FnZX1cIiwgXFxcbiAgICAgICAgICB7IGNhdXNlLCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzaG93X2NvdW50czogLT5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRvID0+XG4gICAgICBxdWVyeSA9IFNRTFwiXCJcIlxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICAgIG12LnYgICAgICAgICAgICBhcyB2LFxuICAgICAgICAgICAgY291bnQoIHQzLnYgKSAgIGFzIGNvdW50XG4gICAgICAgICAgZnJvbSAgICAgICAganpyX21pcnJvcl90cmlwbGVzX2Jhc2UgYXMgdDNcbiAgICAgICAgICByaWdodCBqb2luICBqenJfbWlycm9yX3ZlcmJzICAgICAgICBhcyBtdiB1c2luZyAoIHYgKVxuICAgICAgICBncm91cCBieSB2XG4gICAgICAgIG9yZGVyIGJ5IGNvdW50IGRlc2MsIHY7XCJcIlwiXG4gICAgICBlY2hvICggZ3JleSAnzqlqenJzZGJfXzU0JyApLCAoIGdvbGQgcmV2ZXJzZSBib2xkIHF1ZXJ5IClcbiAgICAgIGNvdW50cyA9ICggQGRiYS5wcmVwYXJlIHF1ZXJ5ICkuYWxsKClcbiAgICAgIGNvbnNvbGUudGFibGUgY291bnRzXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkbyA9PlxuICAgICAgcXVlcnkgPSBTUUxcIlwiXCJcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICBtdi52ICAgICAgICAgICAgYXMgdixcbiAgICAgICAgICAgIGNvdW50KCB0My52ICkgICBhcyBjb3VudFxuICAgICAgICAgIGZyb20gICAgICAgIGp6cl90cmlwbGVzICAgICAgIGFzIHQzXG4gICAgICAgICAgcmlnaHQgam9pbiAganpyX21pcnJvcl92ZXJicyAgYXMgbXYgdXNpbmcgKCB2IClcbiAgICAgICAgZ3JvdXAgYnkgdlxuICAgICAgICBvcmRlciBieSBjb3VudCBkZXNjLCB2O1wiXCJcIlxuICAgICAgZWNobyAoIGdyZXkgJ86panpyc2RiX181NScgKSwgKCBnb2xkIHJldmVyc2UgYm9sZCBxdWVyeSApXG4gICAgICBjb3VudHMgPSAoIEBkYmEucHJlcGFyZSBxdWVyeSApLmFsbCgpXG4gICAgICBjb25zb2xlLnRhYmxlIGNvdW50c1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZG8gPT5cbiAgICAgIHF1ZXJ5ID0gU1FMXCJcIlwiXG4gICAgICAgIHNlbGVjdCBkc2tleSwgY291bnQoKikgYXMgY291bnQgZnJvbSBqenJfbWlycm9yX2xpbmVzIGdyb3VwIGJ5IGRza2V5IHVuaW9uIGFsbFxuICAgICAgICBzZWxlY3QgJyonLCAgIGNvdW50KCopIGFzIGNvdW50IGZyb20ganpyX21pcnJvcl9saW5lc1xuICAgICAgICBvcmRlciBieSBjb3VudCBkZXNjO1wiXCJcIlxuICAgICAgZWNobyAoIGdyZXkgJ86panpyc2RiX181NicgKSwgKCBnb2xkIHJldmVyc2UgYm9sZCBxdWVyeSApXG4gICAgICBjb3VudHMgPSAoIEBkYmEucHJlcGFyZSBxdWVyeSApLmFsbCgpXG4gICAgICBjb3VudHMgPSBPYmplY3QuZnJvbUVudHJpZXMgKCBbIGRza2V5LCB7IGNvdW50LCB9LCBdIGZvciB7IGRza2V5LCBjb3VudCwgfSBpbiBjb3VudHMgKVxuICAgICAgY29uc29sZS50YWJsZSBjb3VudHNcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBzaG93X2p6cl9tZXRhX2ZhdWx0czogLT5cbiAgICBpZiAoIGZhdWx0eV9yb3dzID0gKCBAZGJhLnByZXBhcmUgU1FMXCJzZWxlY3QgKiBmcm9tIGp6cl9tZXRhX2ZhdWx0cztcIiApLmFsbCgpICkubGVuZ3RoID4gMFxuICAgICAgZWNobyAnzqlqenJzZGJfXzU3JywgcmVkIHJldmVyc2UgYm9sZCBcIiBmb3VuZCBzb21lIGZhdWx0czogXCJcbiAgICAgIGNvbnNvbGUudGFibGUgZmF1bHR5X3Jvd3NcbiAgICBlbHNlXG4gICAgICBlY2hvICfOqWp6cnNkYl9fNTgnLCBsaW1lIHJldmVyc2UgYm9sZCBcIiAobm8gZmF1bHRzKSBcIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbm1vZHVsZS5leHBvcnRzID0gZG8gPT5cbiAgaW50ZXJuYWxzID0ge1xuICAgIEp6cl9kYl9hZGFwdGVyLFxuICAgIERhdGFzb3VyY2VfZmllbGRfcGFyc2VyLFxuICAgIGRhdGFzb3VyY2VfZm9ybWF0X3BhcnNlcixcbiAgICBMYW5ndWFnZV9zZXJ2aWNlcyxcbiAgICBnZXRfcGF0aHNfYW5kX2Zvcm1hdHMsIH1cbiAgcmV0dXJuIHtcbiAgICBKaXp1cmEsXG4gICAgaW50ZXJuYWxzLCB9XG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuaWYgbW9kdWxlIGlzIHJlcXVpcmUubWFpbiB0aGVuIGRvID0+XG4gIGp6ciA9IG5ldyBKaXp1cmEoKSAjIHRyaWdnZXJzIHJlYnVpbGQgb2YgREIgd2hlbiBuZWNlc3NhcnlcbiAgO251bGxcblxuIl19
