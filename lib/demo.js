(function() {
  'use strict';
  var GUY, Jizura, SFMODULES, SQL, Table, alert, as_bool, blue, bold, debug, demo, demo_csv_output, demo_read_dump, demo_show_all_tables, echo, from_bool, gold, green, grey, help, info, inspect, lime, log, plain, praise, red, reverse, rpr, urge, warn, whisper, white;

  //===========================================================================================================
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('jizura-sources-db'));

  ({rpr, inspect, echo, white, green, blue, lime, gold, grey, red, bold, reverse, log} = GUY.trm);

  // FS                        = require 'node:fs'
  // PATH                      = require 'node:path'
  // #-----------------------------------------------------------------------------------------------------------
  // Bsql3                     = require 'better-sqlite3'
  // #-----------------------------------------------------------------------------------------------------------
  SFMODULES = require('bricabrac-sfmodules');

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

  ({Table} = SFMODULES.require_cli_table3a());

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
  demo_show_all_tables = function() {
    var cell, cells, col_idx, col_name, col_names, column, count, i, j, jzr, len, len1, name, relation_name, relation_names, row, row_count, statement, table, table_row;
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
      table = new Table({
        caption: relation_name,
        head: ['', ...col_names]
      });
      count = 0;
      for (row of jzr.dba.walk(statement)) {
        count++;
        cells = [];
        for (col_idx = j = 0, len1 = col_names.length; j < len1; col_idx = ++j) {
          col_name = col_names[col_idx];
          cell = row[col_name];
          // cell = color cell if ( color = col_colors[ col_idx ] )?
          cells.push(cell);
        }
        table.push(table_row = [`(${count})`, ...cells]);
      }
      echo(table.toString());
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
      werrn(reverse(red(" Ωjzrsdb___8 no query given ")));
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
      // demo_read_dump()
      // demo()
      return demo_show_all_tables();
    })();
  }

  // demo_csv_output()
// ;null

  // cfg =
//   head: Array.from 'abcdefghijklmno'
//   # colWidths: [ 10, 20, ]
// table = new Table cfg
// # table.push ['First value 1', 'Second value 2'], ['First value 3', 'Second value 4']
// # table.push [ { a: 'A', b: 'B', c: 'C', } ]
// table.push [ 'A', { f: 7, }, undefined, 423423423422122434, ]
// # echo table
// echo table.toString()

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2RlbW8uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsZUFBQSxFQUFBLGNBQUEsRUFBQSxvQkFBQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUE7OztFQUdBLEdBQUEsR0FBNEIsT0FBQSxDQUFRLEtBQVI7O0VBQzVCLENBQUEsQ0FBRSxLQUFGLEVBQ0UsS0FERixFQUVFLElBRkYsRUFHRSxJQUhGLEVBSUUsS0FKRixFQUtFLE1BTEYsRUFNRSxJQU5GLEVBT0UsSUFQRixFQVFFLE9BUkYsQ0FBQSxHQVE0QixHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVIsQ0FBb0IsbUJBQXBCLENBUjVCOztFQVNBLENBQUEsQ0FBRSxHQUFGLEVBQ0UsT0FERixFQUVFLElBRkYsRUFHRSxLQUhGLEVBSUUsS0FKRixFQUtFLElBTEYsRUFNRSxJQU5GLEVBT0UsSUFQRixFQVFFLElBUkYsRUFTRSxHQVRGLEVBVUUsSUFWRixFQVdFLE9BWEYsRUFZRSxHQVpGLENBQUEsR0FZNEIsR0FBRyxDQUFDLEdBWmhDLEVBYkE7Ozs7Ozs7RUErQkEsU0FBQSxHQUE0QixPQUFBLENBQVEscUJBQVIsRUEvQjVCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXdEQSxDQUFBLENBQUUsR0FBRixFQUNF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LEdBQUUsQ0FBRixDQUFBO01BQVksT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFmLENBQXFCLEdBQUEsQ0FBckI7TUFBMkIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFmLENBQXFCLElBQXJCO2FBQTRCO0lBQW5FO0lBQ1IsS0FBQSwyQ0FBNEI7SUFDNUIsSUFBRyxDQUFNLGFBQU4sQ0FBQSxJQUFrQixDQUFFLEtBQUEsS0FBUyxFQUFYLENBQXJCO01BQ0UsS0FBQSxDQUFNLE9BQUEsQ0FBUSxHQUFBLENBQUksOEJBQUosQ0FBUixDQUFOO01BQ0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxHQUFiO0FBQ0EsYUFBTyxLQUhUOztJQUlBLElBQUEsR0FBUSxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQVIsQ0FBZ0IsS0FBaEI7SUFDUixJQUFBLENBQUssR0FBRyxDQUFDLFNBQUosQ0FBYzs7Ozs7O0FBQUk7QUFBQTtRQUFBLEtBQUEsc0NBQUE7O3VCQUFBLE1BQU0sQ0FBQztRQUFQLENBQUE7O1VBQUo7S0FBZCxDQUFMO0lBQ0EsSUFBQSxDQUFLLEdBQUcsQ0FBQyxTQUFKLENBQWMsSUFBZCxDQUFMO1dBQ0M7RUFmZSxFQWhKbEI7OztFQW1LQSxNQUFNLENBQUMsT0FBUCxHQUFpQixDQUFFLG9CQUFGLEVBbktqQjs7O0VBdUtBLElBQUcsTUFBQSxLQUFVLE9BQU8sQ0FBQyxJQUFyQjtJQUFrQyxDQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUE7OzthQUdoQyxvQkFBQSxDQUFBO0lBSGdDLENBQUEsSUFBbEM7OztFQXZLQTs7Ozs7Ozs7Ozs7O0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuJ3VzZSBzdHJpY3QnXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuR1VZICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2d1eSdcbnsgYWxlcnRcbiAgZGVidWdcbiAgaGVscFxuICBpbmZvXG4gIHBsYWluXG4gIHByYWlzZVxuICB1cmdlXG4gIHdhcm5cbiAgd2hpc3BlciB9ICAgICAgICAgICAgICAgPSBHVVkudHJtLmdldF9sb2dnZXJzICdqaXp1cmEtc291cmNlcy1kYidcbnsgcnByXG4gIGluc3BlY3RcbiAgZWNob1xuICB3aGl0ZVxuICBncmVlblxuICBibHVlXG4gIGxpbWVcbiAgZ29sZFxuICBncmV5XG4gIHJlZFxuICBib2xkXG4gIHJldmVyc2VcbiAgbG9nICAgICB9ICAgICAgICAgICAgICAgPSBHVVkudHJtXG4jIEZTICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOmZzJ1xuIyBQQVRIICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpwYXRoJ1xuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQnNxbDMgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2JldHRlci1zcWxpdGUzJ1xuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblNGTU9EVUxFUyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdicmljYWJyYWMtc2Ztb2R1bGVzJ1xuIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgeyBEYnJpYyxcbiMgICBEYnJpY19zdGQsXG4jICAgU1FMLFxuIyAgIGZyb21fYm9vbCxcbiMgICBhc19ib29sLCAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2RicmljKClcbiMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jIHsgbGV0cyxcbiMgICBmcmVlemUsICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2xldHNmcmVlemV0aGF0X2luZnJhKCkuc2ltcGxlXG4jICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyB7IEpldHN0cmVhbSxcbiMgICBBc3luY19qZXRzdHJlYW0sICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2pldHN0cmVhbSgpXG4jICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyB7IHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnNcbiMgICAgICAgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2Zhc3RfbGluZXJlYWRlcigpXG4jICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyB7IEJlbmNobWFya2VyLCAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfYmVuY2htYXJraW5nKClcbiMgYmVuY2htYXJrZXIgICAgICAgICAgICAgICAgICAgPSBuZXcgQmVuY2htYXJrZXIoKVxuIyB0aW1laXQgICAgICAgICAgICAgICAgICAgICAgICA9ICggUC4uLiApIC0+IGJlbmNobWFya2VyLnRpbWVpdCBQLi4uXG4jICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyB7IHNldF9nZXR0ZXIsICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfbWFuYWdlZF9wcm9wZXJ0eV90b29scygpXG4jIHsgSURMLCBJRExYLCAgICAgICAgICAgIH0gPSByZXF1aXJlICdtb2ppa3VyYS1pZGwnXG4jIHsgdHlwZV9vZiwgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV90eXBlX29mKClcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxueyBTUUwsXG4gIGZyb21fYm9vbCxcbiAgYXNfYm9vbCwgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9kYnJpYygpXG57IEppenVyYSwgICAgICAgICAgICAgICB9ID0gcmVxdWlyZSAnLi9tYWluJ1xueyBUYWJsZSwgfSAgICAgICAgICAgICAgICA9IFNGTU9EVUxFUy5yZXF1aXJlX2NsaV90YWJsZTNhKClcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMjI1xuXG5vb29vb29vb29vLiAgIG9vb29vb29vb29vbyBvb28gICAgICAgIG9vb29vICAgLm9vb29vby5cbmA4ODgnICAgYFk4YiAgYDg4OCcgICAgIGA4IGA4OC4gICAgICAgLjg4OCcgIGQ4UCcgIGBZOGJcbiA4ODggICAgICA4ODggIDg4OCAgICAgICAgICA4ODhiICAgICBkJzg4OCAgODg4ICAgICAgODg4XG4gODg4ICAgICAgODg4ICA4ODhvb29vOCAgICAgOCBZODguIC5QICA4ODggIDg4OCAgICAgIDg4OFxuIDg4OCAgICAgIDg4OCAgODg4ICAgIFwiICAgICA4ICBgODg4JyAgIDg4OCAgODg4ICAgICAgODg4XG4gODg4ICAgICBkODgnICA4ODggICAgICAgbyAgOCAgICBZICAgICA4ODggIGA4OGIgICAgZDg4J1xubzg4OGJvb2Q4UCcgICBvODg4b29vb29vZDggbzhvICAgICAgICBvODg4byAgYFk4Ym9vZDhQJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZGVtbyA9IC0+XG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMganpyLl9zaG93X2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzKClcbiAganpyLnNob3dfY291bnRzKClcbiAganpyLnNob3dfanpyX21ldGFfZmF1bHRzKClcbiAgIyB2OmM6cmVhZGluZzpqYS14LUhpclxuICAjIHY6YzpyZWFkaW5nOmphLXgtS2F0XG4gIGlmIGZhbHNlXG4gICAgc2VlbiA9IG5ldyBTZXQoKVxuICAgIGZvciB7IHJlYWRpbmcsIH0gZnJvbSBqenIuZGJhLndhbGsgU1FMXCJzZWxlY3QgZGlzdGluY3QoIG8gKSBhcyByZWFkaW5nIGZyb20ganpyX3RyaXBsZXMgd2hlcmUgdiA9ICd2OmM6cmVhZGluZzpqYS14LUthdCcgb3JkZXIgYnkgbztcIlxuICAgICAgZm9yIHBhcnQgaW4gKCByZWFkaW5nLnNwbGl0IC8oLuODvHwu44OjfC7jg6V8LuODp3zjg4MufC4pL3YgKSB3aGVuIHBhcnQgaXNudCAnJ1xuICAgICAgICBjb250aW51ZSBpZiBzZWVuLmhhcyBwYXJ0XG4gICAgICAgIHNlZW4uYWRkIHBhcnRcbiAgICAgICAgZWNobyBwYXJ0XG4gICAgZm9yIHsgcmVhZGluZywgfSBmcm9tIGp6ci5kYmEud2FsayBTUUxcInNlbGVjdCBkaXN0aW5jdCggbyApIGFzIHJlYWRpbmcgZnJvbSBqenJfdHJpcGxlcyB3aGVyZSB2ID0gJ3Y6YzpyZWFkaW5nOmphLXgtSGlyJyBvcmRlciBieSBvO1wiXG4gICAgICBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLygu44O8fC7jgoN8LuOChXwu44KHfOOBoy58LikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICAgICAjIGZvciBwYXJ0IGluICggcmVhZGluZy5zcGxpdCAvKC4pL3YgKSB3aGVuIHBhcnQgaXNudCAnJ1xuICAgICAgICBjb250aW51ZSBpZiBzZWVuLmhhcyBwYXJ0XG4gICAgICAgIHNlZW4uYWRkIHBhcnRcbiAgICAgICAgZWNobyBwYXJ0XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgO251bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5kZW1vX3JlYWRfZHVtcCA9IC0+XG4gIHsgQmVuY2htYXJrZXIsICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9iZW5jaG1hcmtpbmcoKVxuICAjIHsgbmFtZWl0LCAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9uYW1laXQoKVxuICBiZW5jaG1hcmtlciA9IG5ldyBCZW5jaG1hcmtlcigpXG4gIHRpbWVpdCA9ICggUC4uLiApIC0+IGJlbmNobWFya2VyLnRpbWVpdCBQLi4uXG4gIHsgVW5kdW1wZXIsICAgICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9zcWxpdGVfdW5kdW1wZXIoKVxuICB7IHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMsICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcbiAgeyB3YywgICAgICAgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX3djKClcbiAgcGF0aCAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEgucmVzb2x2ZSBfX2Rpcm5hbWUsICcuLi9qenIuZHVtcC5zcWwnXG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICBqenIuZGJhLnRlYXJkb3duIHsgdGVzdDogJyonLCB9XG4gIGRlYnVnICfOqWp6cnNkYl9fXzEnLCBVbmR1bXBlci51bmR1bXAgeyBkYjoganpyLmRiYSwgcGF0aCwgbW9kZTogJ2Zhc3QnLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAganpyLnNob3dfY291bnRzKClcbiAganpyLnNob3dfanpyX21ldGFfZmF1bHRzKClcbiAgO251bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5kZW1vX3Nob3dfYWxsX3RhYmxlcyA9IC0+XG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICByZWxhdGlvbl9uYW1lcyA9ICggcm93Lm5hbWUgZm9yIHJvdyBmcm9tIGp6ci5kYmEud2FsayBqenIuZGJhLnN0YXRlbWVudHMuc3RkX2dldF9yZWxhdGlvbnMgKVxuICByZWxhdGlvbl9uYW1lcyA9ICggbmFtZSBmb3IgbmFtZSBpbiByZWxhdGlvbl9uYW1lcyB3aGVuIG5vdCBuYW1lLnN0YXJ0c1dpdGggJ3N0ZF8nIClcbiAgcmVsYXRpb25fbmFtZXMgPSAoIG5hbWUgZm9yIG5hbWUgaW4gcmVsYXRpb25fbmFtZXMgd2hlbiBub3QgbmFtZS5zdGFydHNXaXRoICdfanpyX21ldGFfJyApXG4gIHJlbGF0aW9uX25hbWVzID0gKCBuYW1lIGZvciBuYW1lIGluIHJlbGF0aW9uX25hbWVzIHdoZW4gbm90IG5hbWUuc3RhcnRzV2l0aCAnanpyX21ldGFfJyApXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZm9yIHJlbGF0aW9uX25hbWUgaW4gcmVsYXRpb25fbmFtZXNcbiAgICByb3dfY291bnQgICA9ICgganpyLmRiYS5nZXRfZmlyc3QgU1FMXCJzZWxlY3QgY291bnQoKikgYXMgY291bnQgZnJvbSAje3JlbGF0aW9uX25hbWV9O1wiICkuY291bnRcbiAgICBzdGF0ZW1lbnQgICA9IGp6ci5kYmEucHJlcGFyZSBTUUxcIlwiXCJzZWxlY3QgKiBmcm9tICN7cmVsYXRpb25fbmFtZX0gb3JkZXIgYnkgcmFuZG9tKCkgbGltaXQgMTA7XCJcIlwiXG4gICAgY29sX25hbWVzICAgPSAoIGNvbHVtbi5uYW1lIGZvciBjb2x1bW4gaW4ganpyLmRiYS5zdGF0ZS5jb2x1bW5zIClcbiAgICB0YWJsZSAgICAgICA9IG5ldyBUYWJsZSB7IGNhcHRpb246IHJlbGF0aW9uX25hbWUsIGhlYWQ6IFsgJycsIGNvbF9uYW1lcy4uLiwgXSwgfVxuICAgIGNvdW50ICAgICAgID0gMFxuICAgIGZvciByb3cgZnJvbSBqenIuZGJhLndhbGsgc3RhdGVtZW50XG4gICAgICBjb3VudCsrXG4gICAgICBjZWxscyA9IFtdXG4gICAgICBmb3IgY29sX25hbWUsIGNvbF9pZHggaW4gY29sX25hbWVzXG4gICAgICAgIGNlbGwgPSByb3dbIGNvbF9uYW1lIF1cbiAgICAgICAgIyBjZWxsID0gY29sb3IgY2VsbCBpZiAoIGNvbG9yID0gY29sX2NvbG9yc1sgY29sX2lkeCBdICk/XG4gICAgICAgIGNlbGxzLnB1c2ggY2VsbFxuICAgICAgdGFibGUucHVzaCB0YWJsZV9yb3cgPSBbIFwiKCN7Y291bnR9KVwiLCBjZWxscy4uLiwgXVxuICAgIGVjaG8gdGFibGUudG9TdHJpbmcoKVxuICA7bnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmRlbW9fY3N2X291dHB1dCA9IC0+XG4gIENTViAgID0gcmVxdWlyZSAnY3N2LXN0cmluZ2lmeS9zeW5jJ1xuICBqenIgICA9IG5ldyBKaXp1cmEoKVxuICB3b3V0ICA9ICggUC4uLiApIC0+IHByb2Nlc3Muc3Rkb3V0LndyaXRlIFAuLi47ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDtudWxsXG4gIHdvdXRuID0gKCBQLi4uICkgLT4gcHJvY2Vzcy5zdGRvdXQud3JpdGUgUC4uLjsgcHJvY2Vzcy5zdGRvdXQud3JpdGUgJ1xcbicgIDtudWxsXG4gIHdlcnIgID0gKCBQLi4uICkgLT4gcHJvY2Vzcy5zdGRlcnIud3JpdGUgUC4uLjsgICAgICAgICAgICAgICAgICAgICAgICAgICAgO251bGxcbiAgd2Vycm4gPSAoIFAuLi4gKSAtPiBwcm9jZXNzLnN0ZGVyci53cml0ZSBQLi4uOyBwcm9jZXNzLnN0ZGVyci53cml0ZSAnXFxuJyAgO251bGxcbiAgcXVlcnkgPSBwcm9jZXNzLmFyZ3ZbIDIgXSA/IG51bGxcbiAgaWYgKCBub3QgcXVlcnk/ICkgb3IgKCBxdWVyeSBpcyAnJyApXG4gICAgd2Vycm4gcmV2ZXJzZSByZWQgXCIgzqlqenJzZGJfX184IG5vIHF1ZXJ5IGdpdmVuIFwiXG4gICAgcHJvY2Vzcy5leGl0IDExMVxuICAgIHJldHVybiBudWxsXG4gIHJvd3MgID0ganpyLmRiYS5nZXRfYWxsIHF1ZXJ5XG4gIHdvdXQgQ1NWLnN0cmluZ2lmeSBbICggY29sdW1uLm5hbWUgZm9yIGNvbHVtbiBpbiBqenIuZGJhLnN0YXRlLmNvbHVtbnMgKSwgXVxuICB3b3V0IENTVi5zdHJpbmdpZnkgcm93c1xuICA7bnVsbFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxubW9kdWxlLmV4cG9ydHMgPSB7IGRlbW9fc2hvd19hbGxfdGFibGVzLCB9XG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5pZiBtb2R1bGUgaXMgcmVxdWlyZS5tYWluIHRoZW4gZG8gPT5cbiAgIyBkZW1vX3JlYWRfZHVtcCgpXG4gICMgZGVtbygpXG4gIGRlbW9fc2hvd19hbGxfdGFibGVzKClcbiAgIyBkZW1vX2Nzdl9vdXRwdXQoKVxuICAjIDtudWxsXG5cblxuICAjIGNmZyA9XG4gICMgICBoZWFkOiBBcnJheS5mcm9tICdhYmNkZWZnaGlqa2xtbm8nXG4gICMgICAjIGNvbFdpZHRoczogWyAxMCwgMjAsIF1cbiAgIyB0YWJsZSA9IG5ldyBUYWJsZSBjZmdcbiAgIyAjIHRhYmxlLnB1c2ggWydGaXJzdCB2YWx1ZSAxJywgJ1NlY29uZCB2YWx1ZSAyJ10sIFsnRmlyc3QgdmFsdWUgMycsICdTZWNvbmQgdmFsdWUgNCddXG4gICMgIyB0YWJsZS5wdXNoIFsgeyBhOiAnQScsIGI6ICdCJywgYzogJ0MnLCB9IF1cbiAgIyB0YWJsZS5wdXNoIFsgJ0EnLCB7IGY6IDcsIH0sIHVuZGVmaW5lZCwgNDIzNDIzNDIzNDIyMTIyNDM0LCBdXG4gICMgIyBlY2hvIHRhYmxlXG4gICMgZWNobyB0YWJsZS50b1N0cmluZygpXG4iXX0=
