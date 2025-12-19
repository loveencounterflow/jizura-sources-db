(function() {
  'use strict';
  var GUY, Jizura, Mytable, SFMODULES, SQL, Table, alert, as_bool, blue, bold, debug, demo, demo_csv_output, demo_read_dump, demo_show_all_tables, echo, from_bool, gold, green, grey, help, info, inspect, lime, log, plain, praise, red, reverse, rpr, templates, urge, warn, whisper, white;

  //===========================================================================================================
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('jizura-sources-db'));

  ({rpr, inspect, echo, white, green, blue, lime, gold, grey, red, bold, reverse, log} = GUY.trm);

  // FS                        = require 'node:fs'
  // PATH                      = require 'node:path'
  // #-----------------------------------------------------------------------------------------------------------
  // Bsql3                     = require 'better-sqlite3'
  // #-----------------------------------------------------------------------------------------------------------
  SFMODULES = require('../../hengist-NG/apps/bricabrac-sfmodules');

  // #...........................................................................................................
  // { Dbric,
  //   Dbric_std,
  //   SQL,
  //   from_bool,
  //   as_bool,              } = SFMODULES.unstable.require_dbric()
  // #...........................................................................................................
  // { lets,
  //   freeze,               } = SFMODULES.require_letsfreezethat_infra().simple
  // #...........................................................................................................
  // { Jetstream,
  //   Async_jetstream,      } = SFMODULES.require_jetstream()
  // #...........................................................................................................
  // { walk_lines_with_positions
  //                         } = SFMODULES.unstable.require_fast_linereader()
  // #...........................................................................................................
  // { Benchmarker,          } = SFMODULES.unstable.require_benchmarking()
  // benchmarker                   = new Benchmarker()
  // timeit                        = ( P... ) -> benchmarker.timeit P...
  // #...........................................................................................................
  // { set_getter,           } = SFMODULES.require_managed_property_tools()
  // { IDL, IDLX,            } = require 'mojikura-idl'
  // { type_of,              } = SFMODULES.unstable.require_type_of()
  //-----------------------------------------------------------------------------------------------------------
  ({SQL, from_bool, as_bool} = SFMODULES.unstable.require_dbric());

  ({Jizura} = require('./main'));

  // Table                     = require 'cli-table3'
  Table = require('../../cli-table3');

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
    var i, j, jzr, len, len1, part, reading, ref, ref1, seen, x, y;
    jzr = new Jizura();
    //.........................................................................................................
    // jzr._show_jzr_meta_uc_normalization_faults()
    jzr.show_counts();
    jzr.show_jzr_meta_faults();
    // v:c:reading:ja-x-Hir
    // v:c:reading:ja-x-Kat
    if (false) {
      seen = new Set();
      for (x of jzr.dba.walk(SQL`select distinct( o ) as reading from jzr_triples where v = 'v:c:reading:ja-x-Kat' order by o;`)) {
        ({reading} = x);
        ref = reading.split(/(.ー|.ャ|.ュ|.ョ|ッ.|.)/v);
        for (i = 0, len = ref.length; i < len; i++) {
          part = ref[i];
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
      for (y of jzr.dba.walk(SQL`select distinct( o ) as reading from jzr_triples where v = 'v:c:reading:ja-x-Hir' order by o;`)) {
        ({reading} = y);
        ref1 = reading.split(/(.ー|.ゃ|.ゅ|.ょ|っ.|.)/v);
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          part = ref1[j];
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
    var Benchmarker, Undumper, benchmarker, jzr, path, timeit, walk_lines_with_positions, wc;
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
    debug('Ωjzrsdb___1', Undumper.undump({
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
  templates = {
    mytable: {
      horizontal_lines: false,
      // chars:
      // 'top':            '═'
      // 'top-mid':        '╤'
      // 'top-left':       '╔'
      // 'top-right':      '╗'
      // 'bottom':         '═'
      // 'bottom-mid':     '╧'
      // 'bottom-left':    '╚'
      // 'bottom-right':   '╝'
      // 'left':           '║'
      // 'left-mid':       '╟'
      // 'right':          '║'
      // 'right-mid':      '╢'
      // colWidths:          [11, 5, 5]
      // wordWrap:           true
      // wrapOnWordBoundary: false
      chars: {
        'top': '─',
        'top-mid': '┬',
        'top-left': '┌',
        'top-right': '┐',
        'bottom': '─',
        'bottom-mid': '┴',
        'bottom-left': '└',
        'bottom-right': '┘',
        'left': '│',
        'left-mid': '├',
        'mid': '─',
        'mid-mid': '┼',
        'right': '│',
        'right-mid': '┤',
        'middle': '│'
      },
      // truncate:         '…'
      // colWidths:        []
      // rowHeights:       []
      // colAligns:        []
      // rowAligns:        []
      style: {
        'padding-left': 1,
        'padding-right': 1,
        'head': ['bold', 'brightYellow', 'bgBlue'],
        'border': ['grey'],
        'compact': false
      },
      head: []
    }
  };

  //===========================================================================================================
  Mytable = class Mytable extends Table {
    //---------------------------------------------------------------------------------------------------------
    constructor(cfg) {
      cfg = {...templates.mytable, ...cfg};
      super(cfg);
      void 0;
    }

    //---------------------------------------------------------------------------------------------------------
    push(row) {
      var cell, i, idx, len;
      for (idx = i = 0, len = row.length; i < len; idx = ++i) {
        cell = row[idx];
        // debug 'Ωjzrsdb___1', P
        row[idx] = gold(cell);
      }
      return super.push(row);
    }

  };

  //-----------------------------------------------------------------------------------------------------------
  demo_show_all_tables = function() {
    var c, col_names, column, count, i, jzr, len, name, relation_name, relation_names, row, row_count, statement, table;
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
      row_count = (jzr.dba.get_first(SQL`select count(*) as count from ${relation_name};`)).count;
      statement = jzr.dba.prepare(SQL`select * from ${relation_name} order by random() limit 10;`);
      col_names = (function() {
        var j, len1, ref, results;
        ref = jzr.dba.state.columns;
        results = [];
        for (j = 0, len1 = ref.length; j < len1; j++) {
          column = ref[j];
          results.push(column.name);
        }
        return results;
      })();
      table = new Mytable({
        head: ['', ...col_names]
      });
      count = 0;
      for (row of jzr.dba.walk(statement)) {
        count++;
        // debug 'Ωjzrsdb___2', row
        // debug 'Ωjzrsdb___3', col_names
        // debug 'Ωjzrsdb___4', ( row[ c ] for c in col_names )
        table.push([
          relation_name + ` (${count})`,
          ...((function() {
            var j,
          len1,
          results;
            results = [];
            for (j = 0, len1 = col_names.length; j < len1; j++) {
              c = col_names[j];
              results.push(row[c]);
            }
            return results;
          })())
        ]);
      }
      echo(reverse(bold(` ${relation_name} `)));
      echo(table.toString());
      return null; // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    }
    return null;
  };

  //-----------------------------------------------------------------------------------------------------------
  demo_csv_output = function() {
    var CSV, column, jzr, query, ref, rows, werr, werrn, wout, woutn;
    CSV = require('csv-stringify/sync');
    jzr = new Jizura();
    wout = function(...P) {
      process.stdout.write(...P);
      return null;
    };
    woutn = function(...P) {
      process.stdout.write(...P);
      process.stdout.write('\n');
      return null;
    };
    werr = function(...P) {
      process.stderr.write(...P);
      return null;
    };
    werrn = function(...P) {
      process.stderr.write(...P);
      process.stderr.write('\n');
      return null;
    };
    query = (ref = process.argv[2]) != null ? ref : null;
    if ((query == null) || (query === '')) {
      werrn(reverse(red(" Ωjzrsdb___5 no query given ")));
      process.exit(111);
      return null;
    }
    rows = jzr.dba.get_all(query);
    wout(CSV.stringify([
      (function() {
        var i,
      len,
      ref1,
      results;
        ref1 = jzr.dba.state.columns;
        results = [];
        for (i = 0, len = ref1.length; i < len; i++) {
          column = ref1[i];
          results.push(column.name);
        }
        return results;
      })()
    ]));
    wout(CSV.stringify(rows));
    return null;
  };

  //===========================================================================================================
  module.exports = {demo_show_all_tables};

  //===========================================================================================================
  if (module === require.main) {
    (() => {
      var cfg, table;
      // demo_read_dump()
      // demo()
      demo_show_all_tables();
      // demo_csv_output()
      // ;null
      cfg = {
        head: ['TH 1 label', 'TH 2 label']
      };
      // colWidths: [ 10, 20, ]
      table = new Table(cfg);
      // table.push ['First value 1', 'Second value 2'], ['First value 3', 'Second value 4']
      // table.push [ { a: 'A', b: 'B', c: 'C', } ]
      table.push(Array.from('ABC'));
      echo(table);
      return echo(table.toString());
    })();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2RlbW8uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsT0FBQSxFQUFBLFNBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLGVBQUEsRUFBQSxjQUFBLEVBQUEsb0JBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQTs7O0VBR0EsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxLQURGLEVBRUUsSUFGRixFQUdFLElBSEYsRUFJRSxLQUpGLEVBS0UsTUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsT0FSRixDQUFBLEdBUTRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBUixDQUFvQixtQkFBcEIsQ0FSNUI7O0VBU0EsQ0FBQSxDQUFFLEdBQUYsRUFDRSxPQURGLEVBRUUsSUFGRixFQUdFLEtBSEYsRUFJRSxLQUpGLEVBS0UsSUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsSUFSRixFQVNFLEdBVEYsRUFVRSxJQVZGLEVBV0UsT0FYRixFQVlFLEdBWkYsQ0FBQSxHQVk0QixHQUFHLENBQUMsR0FaaEMsRUFiQTs7Ozs7OztFQStCQSxTQUFBLEdBQTRCLE9BQUEsQ0FBUSwyQ0FBUixFQS9CNUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBd0RB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QUFLLEtBQUw7YUFDQSxJQUFBLENBQUssS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUFMO0lBaEJnQyxDQUFBLElBQWxDOztBQTFPQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCdcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5HVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xueyBhbGVydFxuICBkZWJ1Z1xuICBoZWxwXG4gIGluZm9cbiAgcGxhaW5cbiAgcHJhaXNlXG4gIHVyZ2VcbiAgd2FyblxuICB3aGlzcGVyIH0gICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ2ppenVyYS1zb3VyY2VzLWRiJ1xueyBycHJcbiAgaW5zcGVjdFxuICBlY2hvXG4gIHdoaXRlXG4gIGdyZWVuXG4gIGJsdWVcbiAgbGltZVxuICBnb2xkXG4gIGdyZXlcbiAgcmVkXG4gIGJvbGRcbiAgcmV2ZXJzZVxuICBsb2cgICAgIH0gICAgICAgICAgICAgICA9IEdVWS50cm1cbiMgRlMgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6ZnMnXG4jIFBBVEggICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOnBhdGgnXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBCc3FsMyAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYmV0dGVyLXNxbGl0ZTMnXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuU0ZNT0RVTEVTICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9icmljYWJyYWMtc2Ztb2R1bGVzJ1xuIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgeyBEYnJpYyxcbiMgICBEYnJpY19zdGQsXG4jICAgU1FMLFxuIyAgIGZyb21fYm9vbCxcbiMgICBhc19ib29sLCAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2RicmljKClcbiMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jIHsgbGV0cyxcbiMgICBmcmVlemUsICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2xldHNmcmVlemV0aGF0X2luZnJhKCkuc2ltcGxlXG4jICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyB7IEpldHN0cmVhbSxcbiMgICBBc3luY19qZXRzdHJlYW0sICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2pldHN0cmVhbSgpXG4jICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyB7IHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnNcbiMgICAgICAgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2Zhc3RfbGluZXJlYWRlcigpXG4jICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyB7IEJlbmNobWFya2VyLCAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfYmVuY2htYXJraW5nKClcbiMgYmVuY2htYXJrZXIgICAgICAgICAgICAgICAgICAgPSBuZXcgQmVuY2htYXJrZXIoKVxuIyB0aW1laXQgICAgICAgICAgICAgICAgICAgICAgICA9ICggUC4uLiApIC0+IGJlbmNobWFya2VyLnRpbWVpdCBQLi4uXG4jICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyB7IHNldF9nZXR0ZXIsICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfbWFuYWdlZF9wcm9wZXJ0eV90b29scygpXG4jIHsgSURMLCBJRExYLCAgICAgICAgICAgIH0gPSByZXF1aXJlICdtb2ppa3VyYS1pZGwnXG4jIHsgdHlwZV9vZiwgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV90eXBlX29mKClcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxueyBTUUwsXG4gIGZyb21fYm9vbCxcbiAgYXNfYm9vbCwgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9kYnJpYygpXG57IEppenVyYSwgICAgICAgICAgICAgICB9ID0gcmVxdWlyZSAnLi9tYWluJ1xuIyBUYWJsZSAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY2xpLXRhYmxlMydcblRhYmxlICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9jbGktdGFibGUzJ1xuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyMjXG5cbm9vb29vb29vb28uICAgb29vb29vb29vb29vIG9vbyAgICAgICAgb29vb28gICAub29vb29vLlxuYDg4OCcgICBgWThiICBgODg4JyAgICAgYDggYDg4LiAgICAgICAuODg4JyAgZDhQJyAgYFk4YlxuIDg4OCAgICAgIDg4OCAgODg4ICAgICAgICAgIDg4OGIgICAgIGQnODg4ICA4ODggICAgICA4ODhcbiA4ODggICAgICA4ODggIDg4OG9vb284ICAgICA4IFk4OC4gLlAgIDg4OCAgODg4ICAgICAgODg4XG4gODg4ICAgICAgODg4ICA4ODggICAgXCIgICAgIDggIGA4ODgnICAgODg4ICA4ODggICAgICA4ODhcbiA4ODggICAgIGQ4OCcgIDg4OCAgICAgICBvICA4ICAgIFkgICAgIDg4OCAgYDg4YiAgICBkODgnXG5vODg4Ym9vZDhQJyAgIG84ODhvb29vb29kOCBvOG8gICAgICAgIG84ODhvICBgWThib29kOFAnXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5kZW1vID0gLT5cbiAganpyID0gbmV3IEppenVyYSgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyBqenIuX3Nob3dfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMoKVxuICBqenIuc2hvd19jb3VudHMoKVxuICBqenIuc2hvd19qenJfbWV0YV9mYXVsdHMoKVxuICAjIHY6YzpyZWFkaW5nOmphLXgtSGlyXG4gICMgdjpjOnJlYWRpbmc6amEteC1LYXRcbiAgaWYgZmFsc2VcbiAgICBzZWVuID0gbmV3IFNldCgpXG4gICAgZm9yIHsgcmVhZGluZywgfSBmcm9tIGp6ci5kYmEud2FsayBTUUxcInNlbGVjdCBkaXN0aW5jdCggbyApIGFzIHJlYWRpbmcgZnJvbSBqenJfdHJpcGxlcyB3aGVyZSB2ID0gJ3Y6YzpyZWFkaW5nOmphLXgtS2F0JyBvcmRlciBieSBvO1wiXG4gICAgICBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLygu44O8fC7jg6N8LuODpXwu44OnfOODgy58LikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICAgICAgIGNvbnRpbnVlIGlmIHNlZW4uaGFzIHBhcnRcbiAgICAgICAgc2Vlbi5hZGQgcGFydFxuICAgICAgICBlY2hvIHBhcnRcbiAgICBmb3IgeyByZWFkaW5nLCB9IGZyb20ganpyLmRiYS53YWxrIFNRTFwic2VsZWN0IGRpc3RpbmN0KCBvICkgYXMgcmVhZGluZyBmcm9tIGp6cl90cmlwbGVzIHdoZXJlIHYgPSAndjpjOnJlYWRpbmc6amEteC1IaXInIG9yZGVyIGJ5IG87XCJcbiAgICAgIGZvciBwYXJ0IGluICggcmVhZGluZy5zcGxpdCAvKC7jg7x8LuOCg3wu44KFfC7jgod844GjLnwuKS92ICkgd2hlbiBwYXJ0IGlzbnQgJydcbiAgICAgICMgZm9yIHBhcnQgaW4gKCByZWFkaW5nLnNwbGl0IC8oLikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICAgICAgIGNvbnRpbnVlIGlmIHNlZW4uaGFzIHBhcnRcbiAgICAgICAgc2Vlbi5hZGQgcGFydFxuICAgICAgICBlY2hvIHBhcnRcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICA7bnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmRlbW9fcmVhZF9kdW1wID0gLT5cbiAgeyBCZW5jaG1hcmtlciwgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2JlbmNobWFya2luZygpXG4gICMgeyBuYW1laXQsICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX25hbWVpdCgpXG4gIGJlbmNobWFya2VyID0gbmV3IEJlbmNobWFya2VyKClcbiAgdGltZWl0ID0gKCBQLi4uICkgLT4gYmVuY2htYXJrZXIudGltZWl0IFAuLi5cbiAgeyBVbmR1bXBlciwgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX3NxbGl0ZV91bmR1bXBlcigpXG4gIHsgd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucywgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9mYXN0X2xpbmVyZWFkZXIoKVxuICB7IHdjLCAgICAgICAgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfd2MoKVxuICBwYXRoICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5yZXNvbHZlIF9fZGlybmFtZSwgJy4uL2p6ci5kdW1wLnNxbCdcbiAganpyID0gbmV3IEppenVyYSgpXG4gIGp6ci5kYmEudGVhcmRvd24geyB0ZXN0OiAnKicsIH1cbiAgZGVidWcgJ86panpyc2RiX19fMScsIFVuZHVtcGVyLnVuZHVtcCB7IGRiOiBqenIuZGJhLCBwYXRoLCBtb2RlOiAnZmFzdCcsIH1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBqenIuc2hvd19jb3VudHMoKVxuICBqenIuc2hvd19qenJfbWV0YV9mYXVsdHMoKVxuICA7bnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnRlbXBsYXRlcyA9XG4gIG15dGFibGU6XG4gICAgaG9yaXpvbnRhbF9saW5lczogZmFsc2VcbiAgICAjIGNoYXJzOlxuICAgICAgIyAndG9wJzogICAgICAgICAgICAn4pWQJ1xuICAgICAgIyAndG9wLW1pZCc6ICAgICAgICAn4pWkJ1xuICAgICAgIyAndG9wLWxlZnQnOiAgICAgICAn4pWUJ1xuICAgICAgIyAndG9wLXJpZ2h0JzogICAgICAn4pWXJ1xuICAgICAgIyAnYm90dG9tJzogICAgICAgICAn4pWQJ1xuICAgICAgIyAnYm90dG9tLW1pZCc6ICAgICAn4pWnJ1xuICAgICAgIyAnYm90dG9tLWxlZnQnOiAgICAn4pWaJ1xuICAgICAgIyAnYm90dG9tLXJpZ2h0JzogICAn4pWdJ1xuICAgICAgIyAnbGVmdCc6ICAgICAgICAgICAn4pWRJ1xuICAgICAgIyAnbGVmdC1taWQnOiAgICAgICAn4pWfJ1xuICAgICAgIyAncmlnaHQnOiAgICAgICAgICAn4pWRJ1xuICAgICAgIyAncmlnaHQtbWlkJzogICAgICAn4pWiJ1xuICAgICMgY29sV2lkdGhzOiAgICAgICAgICBbMTEsIDUsIDVdXG4gICAgIyB3b3JkV3JhcDogICAgICAgICAgIHRydWVcbiAgICAjIHdyYXBPbldvcmRCb3VuZGFyeTogZmFsc2VcblxuICAgIGNoYXJzOlxuICAgICAgJ3RvcCc6ICAgICAgICAgICAgJ+KUgCdcbiAgICAgICd0b3AtbWlkJzogICAgICAgICfilKwnXG4gICAgICAndG9wLWxlZnQnOiAgICAgICAn4pSMJ1xuICAgICAgJ3RvcC1yaWdodCc6ICAgICAgJ+KUkCdcbiAgICAgICdib3R0b20nOiAgICAgICAgICfilIAnXG4gICAgICAnYm90dG9tLW1pZCc6ICAgICAn4pS0J1xuICAgICAgJ2JvdHRvbS1sZWZ0JzogICAgJ+KUlCdcbiAgICAgICdib3R0b20tcmlnaHQnOiAgICfilJgnXG4gICAgICAnbGVmdCc6ICAgICAgICAgICAn4pSCJ1xuICAgICAgJ2xlZnQtbWlkJzogICAgICAgJ+KUnCdcbiAgICAgICdtaWQnOiAgICAgICAgICAgICfilIAnXG4gICAgICAnbWlkLW1pZCc6ICAgICAgICAn4pS8J1xuICAgICAgJ3JpZ2h0JzogICAgICAgICAgJ+KUgidcbiAgICAgICdyaWdodC1taWQnOiAgICAgICfilKQnXG4gICAgICAnbWlkZGxlJzogICAgICAgICAn4pSCJ1xuICAgICMgdHJ1bmNhdGU6ICAgICAgICAgJ+KApidcbiAgICAjIGNvbFdpZHRoczogICAgICAgIFtdXG4gICAgIyByb3dIZWlnaHRzOiAgICAgICBbXVxuICAgICMgY29sQWxpZ25zOiAgICAgICAgW11cbiAgICAjIHJvd0FsaWduczogICAgICAgIFtdXG4gICAgc3R5bGU6XG4gICAgICAncGFkZGluZy1sZWZ0JzogICAxXG4gICAgICAncGFkZGluZy1yaWdodCc6ICAxXG4gICAgICAnaGVhZCc6ICAgICAgICAgICBbICdib2xkJywgJ2JyaWdodFllbGxvdycsICdiZ0JsdWUnLCBdXG4gICAgICAnYm9yZGVyJzogICAgICAgICBbICdncmV5JywgXVxuICAgICAgJ2NvbXBhY3QnOiAgICAgICAgZmFsc2VcbiAgICBoZWFkOiBbXVxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIE15dGFibGUgZXh0ZW5kcyBUYWJsZVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgY29uc3RydWN0b3I6ICggY2ZnICkgLT5cbiAgICBjZmcgPSB7IHRlbXBsYXRlcy5teXRhYmxlLi4uLCBjZmcuLi4sIH1cbiAgICBzdXBlciBjZmdcbiAgICA7dW5kZWZpbmVkXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBwdXNoOiAoIHJvdyApIC0+XG4gICAgZm9yIGNlbGwsIGlkeCBpbiByb3dcbiAgICAgICMgZGVidWcgJ86panpyc2RiX19fMScsIFBcbiAgICAgIHJvd1sgaWR4IF0gPSBnb2xkIGNlbGxcbiAgICByZXR1cm4gc3VwZXIgcm93XG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZGVtb19zaG93X2FsbF90YWJsZXMgPSAtPlxuICBqenIgPSBuZXcgSml6dXJhKClcbiAgcmVsYXRpb25fbmFtZXMgPSAoIHJvdy5uYW1lIGZvciByb3cgZnJvbSBqenIuZGJhLndhbGsganpyLmRiYS5zdGF0ZW1lbnRzLnN0ZF9nZXRfcmVsYXRpb25zIClcbiAgcmVsYXRpb25fbmFtZXMgPSAoIG5hbWUgZm9yIG5hbWUgaW4gcmVsYXRpb25fbmFtZXMgd2hlbiBub3QgbmFtZS5zdGFydHNXaXRoICdzdGRfJyApXG4gIHJlbGF0aW9uX25hbWVzID0gKCBuYW1lIGZvciBuYW1lIGluIHJlbGF0aW9uX25hbWVzIHdoZW4gbm90IG5hbWUuc3RhcnRzV2l0aCAnX2p6cl9tZXRhXycgKVxuICByZWxhdGlvbl9uYW1lcyA9ICggbmFtZSBmb3IgbmFtZSBpbiByZWxhdGlvbl9uYW1lcyB3aGVuIG5vdCBuYW1lLnN0YXJ0c1dpdGggJ2p6cl9tZXRhXycgKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGZvciByZWxhdGlvbl9uYW1lIGluIHJlbGF0aW9uX25hbWVzXG4gICAgcm93X2NvdW50ICAgPSAoIGp6ci5kYmEuZ2V0X2ZpcnN0IFNRTFwic2VsZWN0IGNvdW50KCopIGFzIGNvdW50IGZyb20gI3tyZWxhdGlvbl9uYW1lfTtcIiApLmNvdW50XG4gICAgc3RhdGVtZW50ICAgPSBqenIuZGJhLnByZXBhcmUgU1FMXCJcIlwic2VsZWN0ICogZnJvbSAje3JlbGF0aW9uX25hbWV9IG9yZGVyIGJ5IHJhbmRvbSgpIGxpbWl0IDEwO1wiXCJcIlxuICAgIGNvbF9uYW1lcyAgID0gKCBjb2x1bW4ubmFtZSBmb3IgY29sdW1uIGluIGp6ci5kYmEuc3RhdGUuY29sdW1ucyApXG4gICAgdGFibGUgICAgICAgPSBuZXcgTXl0YWJsZSB7IGhlYWQ6IFsgJycsIGNvbF9uYW1lcy4uLiwgXSwgfVxuICAgIGNvdW50ICAgICAgID0gMFxuICAgIGZvciByb3cgZnJvbSBqenIuZGJhLndhbGsgc3RhdGVtZW50XG4gICAgICBjb3VudCsrXG4gICAgICAjIGRlYnVnICfOqWp6cnNkYl9fXzInLCByb3dcbiAgICAgICMgZGVidWcgJ86panpyc2RiX19fMycsIGNvbF9uYW1lc1xuICAgICAgIyBkZWJ1ZyAnzqlqenJzZGJfX180JywgKCByb3dbIGMgXSBmb3IgYyBpbiBjb2xfbmFtZXMgKVxuICAgICAgdGFibGUucHVzaCBbIHJlbGF0aW9uX25hbWUgKyBcIiAoI3tjb3VudH0pXCIsICggcm93WyBjIF0gZm9yIGMgaW4gY29sX25hbWVzICkuLi4sIF1cbiAgICBlY2hvIHJldmVyc2UgYm9sZCBcIiAje3JlbGF0aW9uX25hbWV9IFwiXG4gICAgZWNobyB0YWJsZS50b1N0cmluZygpXG4gICAgcmV0dXJuIG51bGwgIyAhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhISEhIVxuICA7bnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmRlbW9fY3N2X291dHB1dCA9IC0+XG4gIENTViAgID0gcmVxdWlyZSAnY3N2LXN0cmluZ2lmeS9zeW5jJ1xuICBqenIgICA9IG5ldyBKaXp1cmEoKVxuICB3b3V0ICA9ICggUC4uLiApIC0+IHByb2Nlc3Muc3Rkb3V0LndyaXRlIFAuLi47ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDtudWxsXG4gIHdvdXRuID0gKCBQLi4uICkgLT4gcHJvY2Vzcy5zdGRvdXQud3JpdGUgUC4uLjsgcHJvY2Vzcy5zdGRvdXQud3JpdGUgJ1xcbicgIDtudWxsXG4gIHdlcnIgID0gKCBQLi4uICkgLT4gcHJvY2Vzcy5zdGRlcnIud3JpdGUgUC4uLjsgICAgICAgICAgICAgICAgICAgICAgICAgICAgO251bGxcbiAgd2Vycm4gPSAoIFAuLi4gKSAtPiBwcm9jZXNzLnN0ZGVyci53cml0ZSBQLi4uOyBwcm9jZXNzLnN0ZGVyci53cml0ZSAnXFxuJyAgO251bGxcbiAgcXVlcnkgPSBwcm9jZXNzLmFyZ3ZbIDIgXSA/IG51bGxcbiAgaWYgKCBub3QgcXVlcnk/ICkgb3IgKCBxdWVyeSBpcyAnJyApXG4gICAgd2Vycm4gcmV2ZXJzZSByZWQgXCIgzqlqenJzZGJfX181IG5vIHF1ZXJ5IGdpdmVuIFwiXG4gICAgcHJvY2Vzcy5leGl0IDExMVxuICAgIHJldHVybiBudWxsXG4gIHJvd3MgID0ganpyLmRiYS5nZXRfYWxsIHF1ZXJ5XG4gIHdvdXQgQ1NWLnN0cmluZ2lmeSBbICggY29sdW1uLm5hbWUgZm9yIGNvbHVtbiBpbiBqenIuZGJhLnN0YXRlLmNvbHVtbnMgKSwgXVxuICB3b3V0IENTVi5zdHJpbmdpZnkgcm93c1xuICA7bnVsbFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxubW9kdWxlLmV4cG9ydHMgPSB7IGRlbW9fc2hvd19hbGxfdGFibGVzLCB9XG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5pZiBtb2R1bGUgaXMgcmVxdWlyZS5tYWluIHRoZW4gZG8gPT5cbiAgIyBkZW1vX3JlYWRfZHVtcCgpXG4gICMgZGVtbygpXG4gIGRlbW9fc2hvd19hbGxfdGFibGVzKClcbiAgIyBkZW1vX2Nzdl9vdXRwdXQoKVxuICAjIDtudWxsXG5cblxuICBjZmcgPVxuICAgIGhlYWQ6IFsnVEggMSBsYWJlbCcsICdUSCAyIGxhYmVsJ11cbiAgICAjIGNvbFdpZHRoczogWyAxMCwgMjAsIF1cbiAgdGFibGUgPSBuZXcgVGFibGUgY2ZnXG4gICMgdGFibGUucHVzaCBbJ0ZpcnN0IHZhbHVlIDEnLCAnU2Vjb25kIHZhbHVlIDInXSwgWydGaXJzdCB2YWx1ZSAzJywgJ1NlY29uZCB2YWx1ZSA0J11cbiAgIyB0YWJsZS5wdXNoIFsgeyBhOiAnQScsIGI6ICdCJywgYzogJ0MnLCB9IF1cbiAgdGFibGUucHVzaCBBcnJheS5mcm9tICdBQkMnXG4gIGVjaG8gdGFibGVcbiAgZWNobyB0YWJsZS50b1N0cmluZygpXG4iXX0=
