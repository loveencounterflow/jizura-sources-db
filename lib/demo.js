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

  Table = require('cli-table3');

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
      table = new Table({
        head: ['', ...col_names]
      });
      count = 0;
      for (row of jzr.dba.walk(statement)) {
        count++;
        debug('Ωjzrsdb___2', row);
        debug('Ωjzrsdb___3', col_names);
        debug('Ωjzrsdb___4', (function() {
          var j, len1, results;
          results = [];
          for (j = 0, len1 = col_names.length; j < len1; j++) {
            c = col_names[j];
            results.push(row[c]);
          }
          return results;
        })());
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2RlbW8uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsZUFBQSxFQUFBLGNBQUEsRUFBQSxvQkFBQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUE7OztFQUdBLEdBQUEsR0FBNEIsT0FBQSxDQUFRLEtBQVI7O0VBQzVCLENBQUEsQ0FBRSxLQUFGLEVBQ0UsS0FERixFQUVFLElBRkYsRUFHRSxJQUhGLEVBSUUsS0FKRixFQUtFLE1BTEYsRUFNRSxJQU5GLEVBT0UsSUFQRixFQVFFLE9BUkYsQ0FBQSxHQVE0QixHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVIsQ0FBb0IsbUJBQXBCLENBUjVCOztFQVNBLENBQUEsQ0FBRSxHQUFGLEVBQ0UsT0FERixFQUVFLElBRkYsRUFHRSxLQUhGLEVBSUUsS0FKRixFQUtFLElBTEYsRUFNRSxJQU5GLEVBT0UsSUFQRixFQVFFLElBUkYsRUFTRSxHQVRGLEVBVUUsSUFWRixFQVdFLE9BWEYsRUFZRSxHQVpGLENBQUEsR0FZNEIsR0FBRyxDQUFDLEdBWmhDLEVBYkE7Ozs7Ozs7RUErQkEsU0FBQSxHQUE0QixPQUFBLENBQVEsMkNBQVIsRUEvQjVCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQXdEQSxDQUFBLENBQUUsR0FBRixFQUNF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LENBQVg7TUFDQSxJQUFBLENBQUssS0FBTDthQUNBLElBQUEsQ0FBSyxLQUFLLENBQUMsUUFBTixDQUFBLENBQUw7SUFoQmdDLENBQUEsSUFBbEM7O0FBdEtBIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0J1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbkdVWSAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXknXG57IGFsZXJ0XG4gIGRlYnVnXG4gIGhlbHBcbiAgaW5mb1xuICBwbGFpblxuICBwcmFpc2VcbiAgdXJnZVxuICB3YXJuXG4gIHdoaXNwZXIgfSAgICAgICAgICAgICAgID0gR1VZLnRybS5nZXRfbG9nZ2VycyAnaml6dXJhLXNvdXJjZXMtZGInXG57IHJwclxuICBpbnNwZWN0XG4gIGVjaG9cbiAgd2hpdGVcbiAgZ3JlZW5cbiAgYmx1ZVxuICBsaW1lXG4gIGdvbGRcbiAgZ3JleVxuICByZWRcbiAgYm9sZFxuICByZXZlcnNlXG4gIGxvZyAgICAgfSAgICAgICAgICAgICAgID0gR1VZLnRybVxuIyBGUyAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpmcydcbiMgUEFUSCAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6cGF0aCdcbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jIEJzcWwzICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdiZXR0ZXItc3FsaXRlMydcbiMgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5TRk1PRFVMRVMgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2JyaWNhYnJhYy1zZm1vZHVsZXMnXG4jICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyB7IERicmljLFxuIyAgIERicmljX3N0ZCxcbiMgICBTUUwsXG4jICAgZnJvbV9ib29sLFxuIyAgIGFzX2Jvb2wsICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZGJyaWMoKVxuIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgeyBsZXRzLFxuIyAgIGZyZWV6ZSwgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfbGV0c2ZyZWV6ZXRoYXRfaW5mcmEoKS5zaW1wbGVcbiMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jIHsgSmV0c3RyZWFtLFxuIyAgIEFzeW5jX2pldHN0cmVhbSwgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfamV0c3RyZWFtKClcbiMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jIHsgd2Fsa19saW5lc193aXRoX3Bvc2l0aW9uc1xuIyAgICAgICAgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcbiMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jIHsgQmVuY2htYXJrZXIsICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9iZW5jaG1hcmtpbmcoKVxuIyBiZW5jaG1hcmtlciAgICAgICAgICAgICAgICAgICA9IG5ldyBCZW5jaG1hcmtlcigpXG4jIHRpbWVpdCAgICAgICAgICAgICAgICAgICAgICAgID0gKCBQLi4uICkgLT4gYmVuY2htYXJrZXIudGltZWl0IFAuLi5cbiMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jIHsgc2V0X2dldHRlciwgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9tYW5hZ2VkX3Byb3BlcnR5X3Rvb2xzKClcbiMgeyBJREwsIElETFgsICAgICAgICAgICAgfSA9IHJlcXVpcmUgJ21vamlrdXJhLWlkbCdcbiMgeyB0eXBlX29mLCAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX3R5cGVfb2YoKVxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG57IFNRTCxcbiAgZnJvbV9ib29sLFxuICBhc19ib29sLCAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2RicmljKClcbnsgSml6dXJhLCAgICAgICAgICAgICAgIH0gPSByZXF1aXJlICcuL21haW4nXG5UYWJsZSAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnY2xpLXRhYmxlMydcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMjI1xuXG5vb29vb29vb29vLiAgIG9vb29vb29vb29vbyBvb28gICAgICAgIG9vb29vICAgLm9vb29vby5cbmA4ODgnICAgYFk4YiAgYDg4OCcgICAgIGA4IGA4OC4gICAgICAgLjg4OCcgIGQ4UCcgIGBZOGJcbiA4ODggICAgICA4ODggIDg4OCAgICAgICAgICA4ODhiICAgICBkJzg4OCAgODg4ICAgICAgODg4XG4gODg4ICAgICAgODg4ICA4ODhvb29vOCAgICAgOCBZODguIC5QICA4ODggIDg4OCAgICAgIDg4OFxuIDg4OCAgICAgIDg4OCAgODg4ICAgIFwiICAgICA4ICBgODg4JyAgIDg4OCAgODg4ICAgICAgODg4XG4gODg4ICAgICBkODgnICA4ODggICAgICAgbyAgOCAgICBZICAgICA4ODggIGA4OGIgICAgZDg4J1xubzg4OGJvb2Q4UCcgICBvODg4b29vb29vZDggbzhvICAgICAgICBvODg4byAgYFk4Ym9vZDhQJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZGVtbyA9IC0+XG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMganpyLl9zaG93X2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzKClcbiAganpyLnNob3dfY291bnRzKClcbiAganpyLnNob3dfanpyX21ldGFfZmF1bHRzKClcbiAgIyB2OmM6cmVhZGluZzpqYS14LUhpclxuICAjIHY6YzpyZWFkaW5nOmphLXgtS2F0XG4gIGlmIGZhbHNlXG4gICAgc2VlbiA9IG5ldyBTZXQoKVxuICAgIGZvciB7IHJlYWRpbmcsIH0gZnJvbSBqenIuZGJhLndhbGsgU1FMXCJzZWxlY3QgZGlzdGluY3QoIG8gKSBhcyByZWFkaW5nIGZyb20ganpyX3RyaXBsZXMgd2hlcmUgdiA9ICd2OmM6cmVhZGluZzpqYS14LUthdCcgb3JkZXIgYnkgbztcIlxuICAgICAgZm9yIHBhcnQgaW4gKCByZWFkaW5nLnNwbGl0IC8oLuODvHwu44OjfC7jg6V8LuODp3zjg4MufC4pL3YgKSB3aGVuIHBhcnQgaXNudCAnJ1xuICAgICAgICBjb250aW51ZSBpZiBzZWVuLmhhcyBwYXJ0XG4gICAgICAgIHNlZW4uYWRkIHBhcnRcbiAgICAgICAgZWNobyBwYXJ0XG4gICAgZm9yIHsgcmVhZGluZywgfSBmcm9tIGp6ci5kYmEud2FsayBTUUxcInNlbGVjdCBkaXN0aW5jdCggbyApIGFzIHJlYWRpbmcgZnJvbSBqenJfdHJpcGxlcyB3aGVyZSB2ID0gJ3Y6YzpyZWFkaW5nOmphLXgtSGlyJyBvcmRlciBieSBvO1wiXG4gICAgICBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLygu44O8fC7jgoN8LuOChXwu44KHfOOBoy58LikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICAgICAjIGZvciBwYXJ0IGluICggcmVhZGluZy5zcGxpdCAvKC4pL3YgKSB3aGVuIHBhcnQgaXNudCAnJ1xuICAgICAgICBjb250aW51ZSBpZiBzZWVuLmhhcyBwYXJ0XG4gICAgICAgIHNlZW4uYWRkIHBhcnRcbiAgICAgICAgZWNobyBwYXJ0XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgO251bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5kZW1vX3JlYWRfZHVtcCA9IC0+XG4gIHsgQmVuY2htYXJrZXIsICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9iZW5jaG1hcmtpbmcoKVxuICAjIHsgbmFtZWl0LCAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9uYW1laXQoKVxuICBiZW5jaG1hcmtlciA9IG5ldyBCZW5jaG1hcmtlcigpXG4gIHRpbWVpdCA9ICggUC4uLiApIC0+IGJlbmNobWFya2VyLnRpbWVpdCBQLi4uXG4gIHsgVW5kdW1wZXIsICAgICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9zcWxpdGVfdW5kdW1wZXIoKVxuICB7IHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMsICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcbiAgeyB3YywgICAgICAgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX3djKClcbiAgcGF0aCAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEgucmVzb2x2ZSBfX2Rpcm5hbWUsICcuLi9qenIuZHVtcC5zcWwnXG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICBqenIuZGJhLnRlYXJkb3duIHsgdGVzdDogJyonLCB9XG4gIGRlYnVnICfOqWp6cnNkYl9fXzEnLCBVbmR1bXBlci51bmR1bXAgeyBkYjoganpyLmRiYSwgcGF0aCwgbW9kZTogJ2Zhc3QnLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAganpyLnNob3dfY291bnRzKClcbiAganpyLnNob3dfanpyX21ldGFfZmF1bHRzKClcbiAgO251bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5kZW1vX3Nob3dfYWxsX3RhYmxlcyA9IC0+XG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICByZWxhdGlvbl9uYW1lcyA9ICggcm93Lm5hbWUgZm9yIHJvdyBmcm9tIGp6ci5kYmEud2FsayBqenIuZGJhLnN0YXRlbWVudHMuc3RkX2dldF9yZWxhdGlvbnMgKVxuICByZWxhdGlvbl9uYW1lcyA9ICggbmFtZSBmb3IgbmFtZSBpbiByZWxhdGlvbl9uYW1lcyB3aGVuIG5vdCBuYW1lLnN0YXJ0c1dpdGggJ3N0ZF8nIClcbiAgcmVsYXRpb25fbmFtZXMgPSAoIG5hbWUgZm9yIG5hbWUgaW4gcmVsYXRpb25fbmFtZXMgd2hlbiBub3QgbmFtZS5zdGFydHNXaXRoICdfanpyX21ldGFfJyApXG4gIHJlbGF0aW9uX25hbWVzID0gKCBuYW1lIGZvciBuYW1lIGluIHJlbGF0aW9uX25hbWVzIHdoZW4gbm90IG5hbWUuc3RhcnRzV2l0aCAnanpyX21ldGFfJyApXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZm9yIHJlbGF0aW9uX25hbWUgaW4gcmVsYXRpb25fbmFtZXNcbiAgICByb3dfY291bnQgICA9ICgganpyLmRiYS5nZXRfZmlyc3QgU1FMXCJzZWxlY3QgY291bnQoKikgYXMgY291bnQgZnJvbSAje3JlbGF0aW9uX25hbWV9O1wiICkuY291bnRcbiAgICBzdGF0ZW1lbnQgICA9IGp6ci5kYmEucHJlcGFyZSBTUUxcIlwiXCJzZWxlY3QgKiBmcm9tICN7cmVsYXRpb25fbmFtZX0gb3JkZXIgYnkgcmFuZG9tKCkgbGltaXQgMTA7XCJcIlwiXG4gICAgY29sX25hbWVzICAgPSAoIGNvbHVtbi5uYW1lIGZvciBjb2x1bW4gaW4ganpyLmRiYS5zdGF0ZS5jb2x1bW5zIClcbiAgICB0YWJsZSAgICAgICA9IG5ldyBUYWJsZSB7IGhlYWQ6IFsgJycsIGNvbF9uYW1lcy4uLiwgXSwgfVxuICAgIGNvdW50ICAgICAgID0gMFxuICAgIGZvciByb3cgZnJvbSBqenIuZGJhLndhbGsgc3RhdGVtZW50XG4gICAgICBjb3VudCsrXG4gICAgICBkZWJ1ZyAnzqlqenJzZGJfX18yJywgcm93XG4gICAgICBkZWJ1ZyAnzqlqenJzZGJfX18zJywgY29sX25hbWVzXG4gICAgICBkZWJ1ZyAnzqlqenJzZGJfX180JywgKCByb3dbIGMgXSBmb3IgYyBpbiBjb2xfbmFtZXMgKVxuICAgICAgdGFibGUucHVzaCBbIHJlbGF0aW9uX25hbWUgKyBcIiAoI3tjb3VudH0pXCIsICggcm93WyBjIF0gZm9yIGMgaW4gY29sX25hbWVzICkuLi4sIF1cbiAgICBlY2hvIHJldmVyc2UgYm9sZCBcIiAje3JlbGF0aW9uX25hbWV9IFwiXG4gICAgZWNobyB0YWJsZS50b1N0cmluZygpXG4gIDtudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZGVtb19jc3Zfb3V0cHV0ID0gLT5cbiAgQ1NWICAgPSByZXF1aXJlICdjc3Ytc3RyaW5naWZ5L3N5bmMnXG4gIGp6ciAgID0gbmV3IEppenVyYSgpXG4gIHdvdXQgID0gKCBQLi4uICkgLT4gcHJvY2Vzcy5zdGRvdXQud3JpdGUgUC4uLjsgICAgICAgICAgICAgICAgICAgICAgICAgICAgO251bGxcbiAgd291dG4gPSAoIFAuLi4gKSAtPiBwcm9jZXNzLnN0ZG91dC53cml0ZSBQLi4uOyBwcm9jZXNzLnN0ZG91dC53cml0ZSAnXFxuJyAgO251bGxcbiAgd2VyciAgPSAoIFAuLi4gKSAtPiBwcm9jZXNzLnN0ZGVyci53cml0ZSBQLi4uOyAgICAgICAgICAgICAgICAgICAgICAgICAgICA7bnVsbFxuICB3ZXJybiA9ICggUC4uLiApIC0+IHByb2Nlc3Muc3RkZXJyLndyaXRlIFAuLi47IHByb2Nlc3Muc3RkZXJyLndyaXRlICdcXG4nICA7bnVsbFxuICBxdWVyeSA9IHByb2Nlc3MuYXJndlsgMiBdID8gbnVsbFxuICBpZiAoIG5vdCBxdWVyeT8gKSBvciAoIHF1ZXJ5IGlzICcnIClcbiAgICB3ZXJybiByZXZlcnNlIHJlZCBcIiDOqWp6cnNkYl9fXzUgbm8gcXVlcnkgZ2l2ZW4gXCJcbiAgICBwcm9jZXNzLmV4aXQgMTExXG4gICAgcmV0dXJuIG51bGxcbiAgcm93cyAgPSBqenIuZGJhLmdldF9hbGwgcXVlcnlcbiAgd291dCBDU1Yuc3RyaW5naWZ5IFsgKCBjb2x1bW4ubmFtZSBmb3IgY29sdW1uIGluIGp6ci5kYmEuc3RhdGUuY29sdW1ucyApLCBdXG4gIHdvdXQgQ1NWLnN0cmluZ2lmeSByb3dzXG4gIDtudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5tb2R1bGUuZXhwb3J0cyA9IHsgZGVtb19zaG93X2FsbF90YWJsZXMsIH1cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmlmIG1vZHVsZSBpcyByZXF1aXJlLm1haW4gdGhlbiBkbyA9PlxuICAjIGRlbW9fcmVhZF9kdW1wKClcbiAgIyBkZW1vKClcbiAgZGVtb19zaG93X2FsbF90YWJsZXMoKVxuICAjIGRlbW9fY3N2X291dHB1dCgpXG4gICMgO251bGxcblxuXG4gIGNmZyA9XG4gICAgaGVhZDogWydUSCAxIGxhYmVsJywgJ1RIIDIgbGFiZWwnXVxuICAgICMgY29sV2lkdGhzOiBbIDEwLCAyMCwgXVxuICB0YWJsZSA9IG5ldyBUYWJsZSBjZmdcbiAgIyB0YWJsZS5wdXNoIFsnRmlyc3QgdmFsdWUgMScsICdTZWNvbmQgdmFsdWUgMiddLCBbJ0ZpcnN0IHZhbHVlIDMnLCAnU2Vjb25kIHZhbHVlIDQnXVxuICAjIHRhYmxlLnB1c2ggWyB7IGE6ICdBJywgYjogJ0InLCBjOiAnQycsIH0gXVxuICB0YWJsZS5wdXNoIEFycmF5LmZyb20gJ0FCQydcbiAgZWNobyB0YWJsZVxuICBlY2hvIHRhYmxlLnRvU3RyaW5nKClcbiJdfQ==
