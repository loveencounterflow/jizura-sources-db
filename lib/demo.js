(function() {
  'use strict';
  var GUY, Jizura, SFMODULES, SQL, Table, alert, as_bool, blue, bold, cli_commands, debug, demo, demo_read_dump, demo_show_all_tables, echo, from_bool, gold, green, grey, help, info, inspect, lime, log, output_query_as_csv, plain, praise, red, reverse, rpr, urge, warn, whisper, white;

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

  //-----------------------------------------------------------------------------------------------------------
  cli_commands = {
    use_pspg: "Ω command: use-pspg Ω"
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
  output_query_as_csv = function(query) {
    var CSV, column, jzr, rows, werr, werrn, wout, woutn;
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
    // query = process.argv[ 2 ] ? null
    if ((query == null) || (query === '')) {
      werrn(reverse(red(" Ωjzrsdb___8 no query given ")));
      process.exit(111);
      return null;
    }
    rows = jzr.dba.get_all(query);
    woutn(cli_commands.use_pspg);
    wout(CSV.stringify([
      (function() {
        var i,
      len,
      ref,
      results;
        ref = jzr.dba.state.columns;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          column = ref[i];
          results.push(column.name);
        }
        return results;
      })()
    ]));
    wout(CSV.stringify(rows));
    return null;
  };

  //===========================================================================================================
  module.exports = {demo_show_all_tables, output_query_as_csv};

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2RlbW8uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLFlBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLGNBQUEsRUFBQSxvQkFBQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxtQkFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQTs7O0VBR0EsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxLQURGLEVBRUUsSUFGRixFQUdFLElBSEYsRUFJRSxLQUpGLEVBS0UsTUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsT0FSRixDQUFBLEdBUTRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBUixDQUFvQixtQkFBcEIsQ0FSNUI7O0VBU0EsQ0FBQSxDQUFFLEdBQUYsRUFDRSxPQURGLEVBRUUsSUFGRixFQUdFLEtBSEYsRUFJRSxLQUpGLEVBS0UsSUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsSUFSRixFQVNFLEdBVEYsRUFVRSxJQVZGLEVBV0UsT0FYRixFQVlFLEdBWkYsQ0FBQSxHQVk0QixHQUFHLENBQUMsR0FaaEMsRUFiQTs7Ozs7OztFQStCQSxTQUFBLEdBQTRCLE9BQUEsQ0FBUSxxQkFBUixFQS9CNUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBd0RBLENBQUEsQ0FB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QUFyQjthQUF1RDtJQUFuRTtJQUNSLEtBQUEsR0FBUSxRQUFBLENBQUEsR0FBRSxDQUFGLENBQUE7TUFBWSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQWYsQ0FBcUIsR0FBQSxDQUFyQjtNQUEyQixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQWYsQ0FBcUIsSUFBckI7YUFBNEI7SUFBbkUsRUFMVjs7SUFPRSxJQUFHLENBQU0sYUFBTixDQUFBLElBQWtCLENBQUUsS0FBQSxLQUFTLEVBQVgsQ0FBckI7TUFDRSxLQUFBLENBQU0sT0FBQSxDQUFRLEdBQUEsQ0FBSSw4QkFBSixDQUFSLENBQU47TUFDQSxPQUFPLENBQUMsSUFBUixDQUFhLEdBQWI7QUFDQSxhQUFPLEtBSFQ7O0lBSUEsSUFBQSxHQUFRLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBUixDQUFnQixLQUFoQjtJQUNSLEtBQUEsQ0FBTSxZQUFZLENBQUMsUUFBbkI7SUFDQSxJQUFBLENBQUssR0FBRyxDQUFDLFNBQUosQ0FBYzs7Ozs7O0FBQUk7QUFBQTtRQUFBLEtBQUEscUNBQUE7O3VCQUFBLE1BQU0sQ0FBQztRQUFQLENBQUE7O1VBQUo7S0FBZCxDQUFMO0lBQ0EsSUFBQSxDQUFLLEdBQUcsQ0FBQyxTQUFKLENBQWMsSUFBZCxDQUFMO1dBQ0M7RUFoQm1CLEVBbkp0Qjs7O0VBdUtBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLENBQUUsb0JBQUYsRUFBd0IsbUJBQXhCLEVBdktqQjs7O0VBMktBLElBQUcsTUFBQSxLQUFVLE9BQU8sQ0FBQyxJQUFyQjtJQUFrQyxDQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUE7OzthQUdoQyxvQkFBQSxDQUFBO0lBSGdDLENBQUEsSUFBbEM7OztFQTNLQTs7Ozs7Ozs7Ozs7O0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuJ3VzZSBzdHJpY3QnXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuR1VZICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2d1eSdcbnsgYWxlcnRcbiAgZGVidWdcbiAgaGVscFxuICBpbmZvXG4gIHBsYWluXG4gIHByYWlzZVxuICB1cmdlXG4gIHdhcm5cbiAgd2hpc3BlciB9ICAgICAgICAgICAgICAgPSBHVVkudHJtLmdldF9sb2dnZXJzICdqaXp1cmEtc291cmNlcy1kYidcbnsgcnByXG4gIGluc3BlY3RcbiAgZWNob1xuICB3aGl0ZVxuICBncmVlblxuICBibHVlXG4gIGxpbWVcbiAgZ29sZFxuICBncmV5XG4gIHJlZFxuICBib2xkXG4gIHJldmVyc2VcbiAgbG9nICAgICB9ICAgICAgICAgICAgICAgPSBHVVkudHJtXG4jIEZTICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOmZzJ1xuIyBQQVRIICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpwYXRoJ1xuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQnNxbDMgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2JldHRlci1zcWxpdGUzJ1xuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblNGTU9EVUxFUyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdicmljYWJyYWMtc2Ztb2R1bGVzJ1xuIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgeyBEYnJpYyxcbiMgICBEYnJpY19zdGQsXG4jICAgU1FMLFxuIyAgIGZyb21fYm9vbCxcbiMgICBhc19ib29sLCAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2RicmljKClcbiMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jIHsgbGV0cyxcbiMgICBmcmVlemUsICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2xldHNmcmVlemV0aGF0X2luZnJhKCkuc2ltcGxlXG4jICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyB7IEpldHN0cmVhbSxcbiMgICBBc3luY19qZXRzdHJlYW0sICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2pldHN0cmVhbSgpXG4jICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyB7IHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnNcbiMgICAgICAgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2Zhc3RfbGluZXJlYWRlcigpXG4jICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyB7IEJlbmNobWFya2VyLCAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfYmVuY2htYXJraW5nKClcbiMgYmVuY2htYXJrZXIgICAgICAgICAgICAgICAgICAgPSBuZXcgQmVuY2htYXJrZXIoKVxuIyB0aW1laXQgICAgICAgICAgICAgICAgICAgICAgICA9ICggUC4uLiApIC0+IGJlbmNobWFya2VyLnRpbWVpdCBQLi4uXG4jICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyB7IHNldF9nZXR0ZXIsICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfbWFuYWdlZF9wcm9wZXJ0eV90b29scygpXG4jIHsgSURMLCBJRExYLCAgICAgICAgICAgIH0gPSByZXF1aXJlICdtb2ppa3VyYS1pZGwnXG4jIHsgdHlwZV9vZiwgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV90eXBlX29mKClcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxueyBTUUwsXG4gIGZyb21fYm9vbCxcbiAgYXNfYm9vbCwgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9kYnJpYygpXG57IEppenVyYSwgICAgICAgICAgICAgICB9ID0gcmVxdWlyZSAnLi9tYWluJ1xueyBUYWJsZSwgfSAgICAgICAgICAgICAgICA9IFNGTU9EVUxFUy5yZXF1aXJlX2NsaV90YWJsZTNhKClcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuY2xpX2NvbW1hbmRzID1cbiAgdXNlX3BzcGc6IFwizqkgY29tbWFuZDogdXNlLXBzcGcgzqlcIlxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyMjXG5cbm9vb29vb29vb28uICAgb29vb29vb29vb29vIG9vbyAgICAgICAgb29vb28gICAub29vb29vLlxuYDg4OCcgICBgWThiICBgODg4JyAgICAgYDggYDg4LiAgICAgICAuODg4JyAgZDhQJyAgYFk4YlxuIDg4OCAgICAgIDg4OCAgODg4ICAgICAgICAgIDg4OGIgICAgIGQnODg4ICA4ODggICAgICA4ODhcbiA4ODggICAgICA4ODggIDg4OG9vb284ICAgICA4IFk4OC4gLlAgIDg4OCAgODg4ICAgICAgODg4XG4gODg4ICAgICAgODg4ICA4ODggICAgXCIgICAgIDggIGA4ODgnICAgODg4ICA4ODggICAgICA4ODhcbiA4ODggICAgIGQ4OCcgIDg4OCAgICAgICBvICA4ICAgIFkgICAgIDg4OCAgYDg4YiAgICBkODgnXG5vODg4Ym9vZDhQJyAgIG84ODhvb29vb29kOCBvOG8gICAgICAgIG84ODhvICBgWThib29kOFAnXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5kZW1vID0gLT5cbiAganpyID0gbmV3IEppenVyYSgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyBqenIuX3Nob3dfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMoKVxuICBqenIuc2hvd19jb3VudHMoKVxuICBqenIuc2hvd19qenJfbWV0YV9mYXVsdHMoKVxuICAjIHY6YzpyZWFkaW5nOmphLXgtSGlyXG4gICMgdjpjOnJlYWRpbmc6amEteC1LYXRcbiAgaWYgZmFsc2VcbiAgICBzZWVuID0gbmV3IFNldCgpXG4gICAgZm9yIHsgcmVhZGluZywgfSBmcm9tIGp6ci5kYmEud2FsayBTUUxcInNlbGVjdCBkaXN0aW5jdCggbyApIGFzIHJlYWRpbmcgZnJvbSBqenJfdHJpcGxlcyB3aGVyZSB2ID0gJ3Y6YzpyZWFkaW5nOmphLXgtS2F0JyBvcmRlciBieSBvO1wiXG4gICAgICBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLygu44O8fC7jg6N8LuODpXwu44OnfOODgy58LikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICAgICAgIGNvbnRpbnVlIGlmIHNlZW4uaGFzIHBhcnRcbiAgICAgICAgc2Vlbi5hZGQgcGFydFxuICAgICAgICBlY2hvIHBhcnRcbiAgICBmb3IgeyByZWFkaW5nLCB9IGZyb20ganpyLmRiYS53YWxrIFNRTFwic2VsZWN0IGRpc3RpbmN0KCBvICkgYXMgcmVhZGluZyBmcm9tIGp6cl90cmlwbGVzIHdoZXJlIHYgPSAndjpjOnJlYWRpbmc6amEteC1IaXInIG9yZGVyIGJ5IG87XCJcbiAgICAgIGZvciBwYXJ0IGluICggcmVhZGluZy5zcGxpdCAvKC7jg7x8LuOCg3wu44KFfC7jgod844GjLnwuKS92ICkgd2hlbiBwYXJ0IGlzbnQgJydcbiAgICAgICMgZm9yIHBhcnQgaW4gKCByZWFkaW5nLnNwbGl0IC8oLikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICAgICAgIGNvbnRpbnVlIGlmIHNlZW4uaGFzIHBhcnRcbiAgICAgICAgc2Vlbi5hZGQgcGFydFxuICAgICAgICBlY2hvIHBhcnRcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICA7bnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmRlbW9fcmVhZF9kdW1wID0gLT5cbiAgeyBCZW5jaG1hcmtlciwgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2JlbmNobWFya2luZygpXG4gICMgeyBuYW1laXQsICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX25hbWVpdCgpXG4gIGJlbmNobWFya2VyID0gbmV3IEJlbmNobWFya2VyKClcbiAgdGltZWl0ID0gKCBQLi4uICkgLT4gYmVuY2htYXJrZXIudGltZWl0IFAuLi5cbiAgeyBVbmR1bXBlciwgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX3NxbGl0ZV91bmR1bXBlcigpXG4gIHsgd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucywgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9mYXN0X2xpbmVyZWFkZXIoKVxuICB7IHdjLCAgICAgICAgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfd2MoKVxuICBwYXRoICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5yZXNvbHZlIF9fZGlybmFtZSwgJy4uL2p6ci5kdW1wLnNxbCdcbiAganpyID0gbmV3IEppenVyYSgpXG4gIGp6ci5kYmEudGVhcmRvd24geyB0ZXN0OiAnKicsIH1cbiAgZGVidWcgJ86panpyc2RiX19fMScsIFVuZHVtcGVyLnVuZHVtcCB7IGRiOiBqenIuZGJhLCBwYXRoLCBtb2RlOiAnZmFzdCcsIH1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBqenIuc2hvd19jb3VudHMoKVxuICBqenIuc2hvd19qenJfbWV0YV9mYXVsdHMoKVxuICA7bnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmRlbW9fc2hvd19hbGxfdGFibGVzID0gLT5cbiAganpyID0gbmV3IEppenVyYSgpXG4gIHJlbGF0aW9uX25hbWVzID0gKCByb3cubmFtZSBmb3Igcm93IGZyb20ganpyLmRiYS53YWxrIGp6ci5kYmEuc3RhdGVtZW50cy5zdGRfZ2V0X3JlbGF0aW9ucyApXG4gIHJlbGF0aW9uX25hbWVzID0gKCBuYW1lIGZvciBuYW1lIGluIHJlbGF0aW9uX25hbWVzIHdoZW4gbm90IG5hbWUuc3RhcnRzV2l0aCAnc3RkXycgKVxuICByZWxhdGlvbl9uYW1lcyA9ICggbmFtZSBmb3IgbmFtZSBpbiByZWxhdGlvbl9uYW1lcyB3aGVuIG5vdCBuYW1lLnN0YXJ0c1dpdGggJ19qenJfbWV0YV8nIClcbiAgcmVsYXRpb25fbmFtZXMgPSAoIG5hbWUgZm9yIG5hbWUgaW4gcmVsYXRpb25fbmFtZXMgd2hlbiBub3QgbmFtZS5zdGFydHNXaXRoICdqenJfbWV0YV8nIClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBmb3IgcmVsYXRpb25fbmFtZSBpbiByZWxhdGlvbl9uYW1lc1xuICAgIHJvd19jb3VudCAgID0gKCBqenIuZGJhLmdldF9maXJzdCBTUUxcInNlbGVjdCBjb3VudCgqKSBhcyBjb3VudCBmcm9tICN7cmVsYXRpb25fbmFtZX07XCIgKS5jb3VudFxuICAgIHN0YXRlbWVudCAgID0ganpyLmRiYS5wcmVwYXJlIFNRTFwiXCJcInNlbGVjdCAqIGZyb20gI3tyZWxhdGlvbl9uYW1lfSBvcmRlciBieSByYW5kb20oKSBsaW1pdCAxMDtcIlwiXCJcbiAgICBjb2xfbmFtZXMgICA9ICggY29sdW1uLm5hbWUgZm9yIGNvbHVtbiBpbiBqenIuZGJhLnN0YXRlLmNvbHVtbnMgKVxuICAgIHRhYmxlICAgICAgID0gbmV3IFRhYmxlIHsgY2FwdGlvbjogcmVsYXRpb25fbmFtZSwgaGVhZDogWyAnJywgY29sX25hbWVzLi4uLCBdLCB9XG4gICAgY291bnQgICAgICAgPSAwXG4gICAgZm9yIHJvdyBmcm9tIGp6ci5kYmEud2FsayBzdGF0ZW1lbnRcbiAgICAgIGNvdW50KytcbiAgICAgIGNlbGxzID0gW11cbiAgICAgIGZvciBjb2xfbmFtZSwgY29sX2lkeCBpbiBjb2xfbmFtZXNcbiAgICAgICAgY2VsbCA9IHJvd1sgY29sX25hbWUgXVxuICAgICAgICAjIGNlbGwgPSBjb2xvciBjZWxsIGlmICggY29sb3IgPSBjb2xfY29sb3JzWyBjb2xfaWR4IF0gKT9cbiAgICAgICAgY2VsbHMucHVzaCBjZWxsXG4gICAgICB0YWJsZS5wdXNoIHRhYmxlX3JvdyA9IFsgXCIoI3tjb3VudH0pXCIsIGNlbGxzLi4uLCBdXG4gICAgZWNobyB0YWJsZS50b1N0cmluZygpXG4gIDtudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxub3V0cHV0X3F1ZXJ5X2FzX2NzdiA9ICggcXVlcnkgKSAtPlxuICBDU1YgICA9IHJlcXVpcmUgJ2Nzdi1zdHJpbmdpZnkvc3luYydcbiAganpyICAgPSBuZXcgSml6dXJhKClcbiAgd291dCAgPSAoIFAuLi4gKSAtPiBwcm9jZXNzLnN0ZG91dC53cml0ZSBQLi4uOyAgICAgICAgICAgICAgICAgICAgICAgICAgICA7bnVsbFxuICB3b3V0biA9ICggUC4uLiApIC0+IHByb2Nlc3Muc3Rkb3V0LndyaXRlIFAuLi47IHByb2Nlc3Muc3Rkb3V0LndyaXRlICdcXG4nICA7bnVsbFxuICB3ZXJyICA9ICggUC4uLiApIC0+IHByb2Nlc3Muc3RkZXJyLndyaXRlIFAuLi47ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDtudWxsXG4gIHdlcnJuID0gKCBQLi4uICkgLT4gcHJvY2Vzcy5zdGRlcnIud3JpdGUgUC4uLjsgcHJvY2Vzcy5zdGRlcnIud3JpdGUgJ1xcbicgIDtudWxsXG4gICMgcXVlcnkgPSBwcm9jZXNzLmFyZ3ZbIDIgXSA/IG51bGxcbiAgaWYgKCBub3QgcXVlcnk/ICkgb3IgKCBxdWVyeSBpcyAnJyApXG4gICAgd2Vycm4gcmV2ZXJzZSByZWQgXCIgzqlqenJzZGJfX184IG5vIHF1ZXJ5IGdpdmVuIFwiXG4gICAgcHJvY2Vzcy5leGl0IDExMVxuICAgIHJldHVybiBudWxsXG4gIHJvd3MgID0ganpyLmRiYS5nZXRfYWxsIHF1ZXJ5XG4gIHdvdXRuIGNsaV9jb21tYW5kcy51c2VfcHNwZ1xuICB3b3V0IENTVi5zdHJpbmdpZnkgWyAoIGNvbHVtbi5uYW1lIGZvciBjb2x1bW4gaW4ganpyLmRiYS5zdGF0ZS5jb2x1bW5zICksIF1cbiAgd291dCBDU1Yuc3RyaW5naWZ5IHJvd3NcbiAgO251bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbm1vZHVsZS5leHBvcnRzID0geyBkZW1vX3Nob3dfYWxsX3RhYmxlcywgb3V0cHV0X3F1ZXJ5X2FzX2NzdiwgfVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuaWYgbW9kdWxlIGlzIHJlcXVpcmUubWFpbiB0aGVuIGRvID0+XG4gICMgZGVtb19yZWFkX2R1bXAoKVxuICAjIGRlbW8oKVxuICBkZW1vX3Nob3dfYWxsX3RhYmxlcygpXG4gICMgZGVtb19jc3Zfb3V0cHV0KClcbiAgIyA7bnVsbFxuXG5cbiAgIyBjZmcgPVxuICAjICAgaGVhZDogQXJyYXkuZnJvbSAnYWJjZGVmZ2hpamtsbW5vJ1xuICAjICAgIyBjb2xXaWR0aHM6IFsgMTAsIDIwLCBdXG4gICMgdGFibGUgPSBuZXcgVGFibGUgY2ZnXG4gICMgIyB0YWJsZS5wdXNoIFsnRmlyc3QgdmFsdWUgMScsICdTZWNvbmQgdmFsdWUgMiddLCBbJ0ZpcnN0IHZhbHVlIDMnLCAnU2Vjb25kIHZhbHVlIDQnXVxuICAjICMgdGFibGUucHVzaCBbIHsgYTogJ0EnLCBiOiAnQicsIGM6ICdDJywgfSBdXG4gICMgdGFibGUucHVzaCBbICdBJywgeyBmOiA3LCB9LCB1bmRlZmluZWQsIDQyMzQyMzQyMzQyMjEyMjQzNCwgXVxuICAjICMgZWNobyB0YWJsZVxuICAjIGVjaG8gdGFibGUudG9TdHJpbmcoKVxuIl19
