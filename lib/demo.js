(function() {
  'use strict';
  var GUY, Jizura, SFMODULES, SQL, Table, alert, as_bool, blue, bold, debug, demo, demo_read_dump, demo_show_all_tables, echo, f, from_bool, gold, green, grey, help, info, inspect, lime, log, output_query_as_csv, plain, praise, red, reverse, rpr, urge, warn, whisper, white;

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
  // cli_commands =
  //   use_pspg: "Ω command: use-pspg Ω"
  ({f} = require('effstring'));

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
  demo_show_all_tables = function({rows = 10} = {}) {
    var caption, cell, cells, col_idx, col_name, col_names, column, count, i, jzr, len, name, relation_name, relation_type, relations, row, row_count, statement, table, table_row, type, x;
    jzr = new Jizura();
    relations = {};
    for (x of jzr.dba.walk(SQL`select name, type
from sqlite_schema
where type in ( 'table', 'view' )
-- order by name
;`)) {
      ({name, type} = x);
      if (name.startsWith('std_')) {
        continue;
      }
      if (name.startsWith('_jzr_meta_')) {
        continue;
      }
      if (name.startsWith('jzr_meta_')) {
        continue;
      }
      relations[name] = type;
    }
//.........................................................................................................
    for (relation_name in relations) {
      relation_type = relations[relation_name];
      row_count = (jzr.dba.get_first(SQL`select count(*) as count from ${relation_name};`)).count;
      statement = jzr.dba.prepare(SQL`select * from ${relation_name} order by random() limit $rows;`);
      col_names = (function() {
        var i, len, ref, results;
        ref = jzr.dba.state.columns;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          column = ref[i];
          results.push(column.name);
        }
        return results;
      })();
      caption = f`${relation_type} ${relation_name} (${row_count}:,.0f; rows)`;
      table = new Table({
        caption,
        head: ['', ...col_names]
      });
      count = 0;
//.......................................................................................................
      for (row of jzr.dba.walk(statement, {rows})) {
        count++;
        cells = [];
        for (col_idx = i = 0, len = col_names.length; i < len; col_idx = ++i) {
          col_name = col_names[col_idx];
          cell = row[col_name];
          // cell = color cell if ( color = col_colors[ col_idx ] )?
          cells.push(cell);
        }
        table.push(table_row = [`(${count})`, ...cells]);
      }
      echo(table.toString());
    }
    //.........................................................................................................
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
    // woutn cli_commands.use_pspg
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2RlbW8uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsY0FBQSxFQUFBLG9CQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxtQkFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQTs7O0VBR0EsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxLQURGLEVBRUUsSUFGRixFQUdFLElBSEYsRUFJRSxLQUpGLEVBS0UsTUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsT0FSRixDQUFBLEdBUTRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBUixDQUFvQixtQkFBcEIsQ0FSNUI7O0VBU0EsQ0FBQSxDQUFFLEdBQUYsRUFDRSxPQURGLEVBRUUsSUFGRixFQUdFLEtBSEYsRUFJRSxLQUpGLEVBS0UsSUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsSUFSRixFQVNFLEdBVEYsRUFVRSxJQVZGLEVBV0UsT0FYRixFQVlFLEdBWkYsQ0FBQSxHQVk0QixHQUFHLENBQUMsR0FaaEMsRUFiQTs7Ozs7OztFQStCQSxTQUFBLEdBQTRCLE9BQUEsQ0FBUSxxQkFBUixFQS9CNUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBd0RBLENBQUEsQ0FBRSxHQUFGLEVBQ0UsU0FERixFQUVFLE9BRkYsQ0FBQSxHQUU0QixTQUFTLENBQUMsUUFBUSxDQUFDLGFBQW5CLENBQUEsQ0FGNUI7O0VBR0EsQ0FBQSxDQUFFLE1BQUYsQ0FBQSxHQUE0QixPQUFBLENBQVEsUUFBUixDQUE1Qjs7RUFDQSxDQUFBLENBQUUsS0FBRixDQUFBLEdBQTRCLFNBQVMsQ0FBQyxtQkFBVixDQUFBLENBQTVCLEVBNURBOzs7OztFQWdFQSxDQUFBLENBQUUsQ0FBRixDQUFBLEdBQTRCLE9BQUEsQ0FBUSxXQUFSLENBQTVCLEVBaEVBOzs7Ozs7Ozs7Ozs7Ozs7RUFpRkEsSUFBQSxHQUFPLFFBQUEsQ0FBQSxDQUFBO0FBQ1AsUUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxFQUFBO0lBQUUsR0FBQSxHQUFNLElBQUksTUFBSixDQUFBLEVBQVI7OztJQUdFLEdBQUcsQ0FBQyxXQUFKLENBQUE7SUFDQSxHQUFHLENBQUMsb0JBQUosQ0FBQSxFQUpGOzs7SUFPRSxJQUFHLEtBQUg7TUFDRSxJQUFBLEdBQU8sSUFBSSxHQUFKLENBQUE7TUFDUCxLQUFBLHFIQUFBO1NBQUksQ0FBRSxPQUFGO0FBQ0Y7UUFBQSxLQUFBLHFDQUFBOztnQkFBeUQsSUFBQSxLQUFVOzs7VUFDakUsSUFBWSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQVQsQ0FBWjtBQUFBLHFCQUFBOztVQUNBLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBVDtVQUNBLElBQUEsQ0FBSyxJQUFMO1FBSEY7TUFERjtNQUtBLEtBQUEscUhBQUE7U0FBSSxDQUFFLE9BQUY7QUFDRjtRQUFBLEtBQUEsd0NBQUE7O2dCQUF5RCxJQUFBLEtBQVU7OztVQUVqRSxJQUFZLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBVCxDQUFaOztBQUFBLHFCQUFBOztVQUNBLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBVDtVQUNBLElBQUEsQ0FBSyxJQUFMO1FBSkY7TUFERixDQVBGO0tBUEY7O1dBcUJHO0VBdEJJLEVBakZQOzs7RUEwR0EsY0FBQSxHQUFpQixRQUFBLENBQUEsQ0FBQTtBQUNqQixRQUFBLFdBQUEsRUFBQSxRQUFBLEVBQUEsV0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLHlCQUFBLEVBQUE7SUFBRSxDQUFBLENBQUUsV0FBRixDQUFBLEdBQTRCLFNBQVMsQ0FBQyxRQUFRLENBQUMsb0JBQW5CLENBQUEsQ0FBNUIsRUFBRjs7SUFFRSxXQUFBLEdBQWMsSUFBSSxXQUFKLENBQUE7SUFDZCxNQUFBLEdBQVMsUUFBQSxDQUFBLEdBQUUsQ0FBRixDQUFBO2FBQVksV0FBVyxDQUFDLE1BQVosQ0FBbUIsR0FBQSxDQUFuQjtJQUFaO0lBQ1QsQ0FBQSxDQUFFLFFBQUYsQ0FBQSxHQUFrQyxTQUFTLENBQUMsdUJBQVYsQ0FBQSxDQUFsQztJQUNBLENBQUEsQ0FBRSx5QkFBRixDQUFBLEdBQWtDLFNBQVMsQ0FBQyxRQUFRLENBQUMsdUJBQW5CLENBQUEsQ0FBbEM7SUFDQSxDQUFBLENBQUUsRUFBRixDQUFBLEdBQWtDLFNBQVMsQ0FBQyxVQUFWLENBQUEsQ0FBbEM7SUFDQSxJQUFBLEdBQWtDLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixpQkFBeEI7SUFDbEMsR0FBQSxHQUFNLElBQUksTUFBSixDQUFBO0lBQ04sR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFSLENBQWlCO01BQUUsSUFBQSxFQUFNO0lBQVIsQ0FBakI7SUFDQSxLQUFBLENBQU0sYUFBTixFQUFxQixRQUFRLENBQUMsTUFBVCxDQUFnQjtNQUFFLEVBQUEsRUFBSSxHQUFHLENBQUMsR0FBVjtNQUFlLElBQWY7TUFBcUIsSUFBQSxFQUFNO0lBQTNCLENBQWhCLENBQXJCLEVBVkY7O0lBWUUsR0FBRyxDQUFDLFdBQUosQ0FBQTtJQUNBLEdBQUcsQ0FBQyxvQkFBSixDQUFBO1dBQ0M7RUFmYyxFQTFHakI7OztFQTRIQSxvQkFBQSxHQUF1QixRQUFBLENBQUMsQ0FBRSxJQUFBLEdBQU8sRUFBVCxJQUFlLENBQUEsQ0FBaEIsQ0FBQTtBQUN2QixRQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLGFBQUEsRUFBQSxhQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUEsU0FBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBO0lBQUUsR0FBQSxHQUFNLElBQUksTUFBSixDQUFBO0lBQ04sU0FBQSxHQUFZLENBQUE7SUFDWixLQUFBOzs7O0dBQUE7T0FBSSxDQUFFLElBQUYsRUFBUSxJQUFSO01BTUYsSUFBWSxJQUFJLENBQUMsVUFBTCxDQUFnQixNQUFoQixDQUFaO0FBQUEsaUJBQUE7O01BQ0EsSUFBWSxJQUFJLENBQUMsVUFBTCxDQUFnQixZQUFoQixDQUFaO0FBQUEsaUJBQUE7O01BQ0EsSUFBWSxJQUFJLENBQUMsVUFBTCxDQUFnQixXQUFoQixDQUFaO0FBQUEsaUJBQUE7O01BQ0EsU0FBUyxDQUFFLElBQUYsQ0FBVCxHQUFvQjtJQVR0QixDQUZGOztJQWFFLEtBQUEsMEJBQUE7O01BQ0UsU0FBQSxHQUFjLENBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxTQUFSLENBQWtCLEdBQUcsQ0FBQSw4QkFBQSxDQUFBLENBQWlDLGFBQWpDLEVBQUEsQ0FBckIsQ0FBRixDQUEwRSxDQUFDO01BQ3pGLFNBQUEsR0FBYyxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQVIsQ0FBZ0IsR0FBRyxDQUFBLGNBQUEsQ0FBQSxDQUFtQixhQUFuQixDQUFBLCtCQUFBLENBQW5CO01BQ2QsU0FBQTs7QUFBZ0I7QUFBQTtRQUFBLEtBQUEscUNBQUE7O3VCQUFBLE1BQU0sQ0FBQztRQUFQLENBQUE7OztNQUNoQixPQUFBLEdBQWMsQ0FBQyxDQUFBLENBQUEsQ0FBRyxhQUFILEVBQUEsQ0FBQSxDQUFvQixhQUFwQixDQUFBLEVBQUEsQ0FBQSxDQUFzQyxTQUF0QyxDQUFBLFlBQUE7TUFDZixLQUFBLEdBQWMsSUFBSSxLQUFKLENBQVU7UUFBRSxPQUFGO1FBQVcsSUFBQSxFQUFNLENBQUUsRUFBRixFQUFNLEdBQUEsU0FBTjtNQUFqQixDQUFWO01BQ2QsS0FBQSxHQUFjLEVBTGxCOztNQU9JLEtBQUEsc0NBQUE7UUFDRSxLQUFBO1FBQ0EsS0FBQSxHQUFRO1FBQ1IsS0FBQSwrREFBQTs7VUFDRSxJQUFBLEdBQU8sR0FBRyxDQUFFLFFBQUYsRUFBbEI7O1VBRVEsS0FBSyxDQUFDLElBQU4sQ0FBVyxJQUFYO1FBSEY7UUFJQSxLQUFLLENBQUMsSUFBTixDQUFXLFNBQUEsR0FBWSxDQUFFLENBQUEsQ0FBQSxDQUFBLENBQUksS0FBSixDQUFBLENBQUEsQ0FBRixFQUFnQixHQUFBLEtBQWhCLENBQXZCO01BUEY7TUFRQSxJQUFBLENBQUssS0FBSyxDQUFDLFFBQU4sQ0FBQSxDQUFMO0lBaEJGLENBYkY7O1dBK0JHO0VBaENvQixFQTVIdkI7OztFQStKQSxtQkFBQSxHQUFzQixRQUFBLENBQUUsS0FBRixDQUFBO0FBQ3RCLFFBQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBO0lBQUUsR0FBQSxHQUFRLE9BQUEsQ0FBUSxvQkFBUjtJQUNSLEdBQUEsR0FBUSxJQUFJLE1BQUosQ0FBQTtJQUNSLElBQUEsR0FBUSxRQUFBLENBQUEsR0FBRSxDQUFGLENBQUE7TUFBWSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQWYsQ0FBcUIsR0FBQSxDQUFyQjthQUF1RDtJQUFuRTtJQUNSLEtBQUEsR0FBUSxRQUFBLENBQUEsR0FBRSxDQUFGLENBQUE7TUFBWSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQWYsQ0FBcUIsR0FBQSxDQUFyQjtNQUEyQixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQWYsQ0FBcUIsSUFBckI7YUFBNEI7SUFBbkU7SUFDUixJQUFBLEdBQVEsUUFBQSxDQUFBLEdBQUUsQ0FBRixDQUFBO01BQVksT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFmLENBQXFCLEdBQUEsQ0FBckI7YUFBdUQ7SUFBbkU7SUFDUixLQUFBLEdBQVEsUUFBQSxDQUFBLEdBQUUsQ0FBRixDQUFBO01BQVksT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFmLENBQXFCLEdBQUEsQ0FBckI7TUFBMkIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFmLENBQXFCLElBQXJCO2FBQTRCO0lBQW5FLEVBTFY7O0lBT0UsSUFBRyxDQUFNLGFBQU4sQ0FBQSxJQUFrQixDQUFFLEtBQUEsS0FBUyxFQUFYLENBQXJCO01BQ0UsS0FBQSxDQUFNLE9BQUEsQ0FBUSxHQUFBLENBQUksOEJBQUosQ0FBUixDQUFOO01BQ0EsT0FBTyxDQUFDLElBQVIsQ0FBYSxHQUFiO0FBQ0EsYUFBTyxLQUhUOztJQUlBLElBQUEsR0FBUSxHQUFHLENBQUMsR0FBRyxDQUFDLE9BQVIsQ0FBZ0IsS0FBaEIsRUFYVjs7SUFhRSxJQUFBLENBQUssR0FBRyxDQUFDLFNBQUosQ0FBYzs7Ozs7O0FBQUk7QUFBQTtRQUFBLEtBQUEscUNBQUE7O3VCQUFBLE1BQU0sQ0FBQztRQUFQLENBQUE7O1VBQUo7S0FBZCxDQUFMO0lBQ0EsSUFBQSxDQUFLLEdBQUcsQ0FBQyxTQUFKLENBQWMsSUFBZCxDQUFMO1dBQ0M7RUFoQm1CLEVBL0p0Qjs7O0VBbUxBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLENBQUUsb0JBQUYsRUFBd0IsbUJBQXhCLEVBbkxqQjs7O0VBdUxBLElBQUcsTUFBQSxLQUFVLE9BQU8sQ0FBQyxJQUFyQjtJQUFrQyxDQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUE7OzthQUdoQyxvQkFBQSxDQUFBO0lBSGdDLENBQUEsSUFBbEM7OztFQXZMQTs7Ozs7Ozs7Ozs7O0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuJ3VzZSBzdHJpY3QnXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuR1VZICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2d1eSdcbnsgYWxlcnRcbiAgZGVidWdcbiAgaGVscFxuICBpbmZvXG4gIHBsYWluXG4gIHByYWlzZVxuICB1cmdlXG4gIHdhcm5cbiAgd2hpc3BlciB9ICAgICAgICAgICAgICAgPSBHVVkudHJtLmdldF9sb2dnZXJzICdqaXp1cmEtc291cmNlcy1kYidcbnsgcnByXG4gIGluc3BlY3RcbiAgZWNob1xuICB3aGl0ZVxuICBncmVlblxuICBibHVlXG4gIGxpbWVcbiAgZ29sZFxuICBncmV5XG4gIHJlZFxuICBib2xkXG4gIHJldmVyc2VcbiAgbG9nICAgICB9ICAgICAgICAgICAgICAgPSBHVVkudHJtXG4jIEZTICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOmZzJ1xuIyBQQVRIICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpwYXRoJ1xuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgQnNxbDMgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2JldHRlci1zcWxpdGUzJ1xuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblNGTU9EVUxFUyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdicmljYWJyYWMtc2Ztb2R1bGVzJ1xuIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgeyBEYnJpYyxcbiMgICBEYnJpY19zdGQsXG4jICAgU1FMLFxuIyAgIGZyb21fYm9vbCxcbiMgICBhc19ib29sLCAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2RicmljKClcbiMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jIHsgbGV0cyxcbiMgICBmcmVlemUsICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2xldHNmcmVlemV0aGF0X2luZnJhKCkuc2ltcGxlXG4jICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyB7IEpldHN0cmVhbSxcbiMgICBBc3luY19qZXRzdHJlYW0sICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2pldHN0cmVhbSgpXG4jICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyB7IHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnNcbiMgICAgICAgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2Zhc3RfbGluZXJlYWRlcigpXG4jICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyB7IEJlbmNobWFya2VyLCAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfYmVuY2htYXJraW5nKClcbiMgYmVuY2htYXJrZXIgICAgICAgICAgICAgICAgICAgPSBuZXcgQmVuY2htYXJrZXIoKVxuIyB0aW1laXQgICAgICAgICAgICAgICAgICAgICAgICA9ICggUC4uLiApIC0+IGJlbmNobWFya2VyLnRpbWVpdCBQLi4uXG4jICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyB7IHNldF9nZXR0ZXIsICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfbWFuYWdlZF9wcm9wZXJ0eV90b29scygpXG4jIHsgSURMLCBJRExYLCAgICAgICAgICAgIH0gPSByZXF1aXJlICdtb2ppa3VyYS1pZGwnXG4jIHsgdHlwZV9vZiwgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV90eXBlX29mKClcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxueyBTUUwsXG4gIGZyb21fYm9vbCxcbiAgYXNfYm9vbCwgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9kYnJpYygpXG57IEppenVyYSwgICAgICAgICAgICAgICB9ID0gcmVxdWlyZSAnLi9tYWluJ1xueyBUYWJsZSwgfSAgICAgICAgICAgICAgICA9IFNGTU9EVUxFUy5yZXF1aXJlX2NsaV90YWJsZTNhKClcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBjbGlfY29tbWFuZHMgPVxuIyAgIHVzZV9wc3BnOiBcIs6pIGNvbW1hbmQ6IHVzZS1wc3BnIM6pXCJcbnsgZiwgICAgICAgICAgICAgICAgICAgIH0gPSByZXF1aXJlICdlZmZzdHJpbmcnXG5cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMjI1xuXG5vb29vb29vb29vLiAgIG9vb29vb29vb29vbyBvb28gICAgICAgIG9vb29vICAgLm9vb29vby5cbmA4ODgnICAgYFk4YiAgYDg4OCcgICAgIGA4IGA4OC4gICAgICAgLjg4OCcgIGQ4UCcgIGBZOGJcbiA4ODggICAgICA4ODggIDg4OCAgICAgICAgICA4ODhiICAgICBkJzg4OCAgODg4ICAgICAgODg4XG4gODg4ICAgICAgODg4ICA4ODhvb29vOCAgICAgOCBZODguIC5QICA4ODggIDg4OCAgICAgIDg4OFxuIDg4OCAgICAgIDg4OCAgODg4ICAgIFwiICAgICA4ICBgODg4JyAgIDg4OCAgODg4ICAgICAgODg4XG4gODg4ICAgICBkODgnICA4ODggICAgICAgbyAgOCAgICBZICAgICA4ODggIGA4OGIgICAgZDg4J1xubzg4OGJvb2Q4UCcgICBvODg4b29vb29vZDggbzhvICAgICAgICBvODg4byAgYFk4Ym9vZDhQJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZGVtbyA9IC0+XG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMganpyLl9zaG93X2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzKClcbiAganpyLnNob3dfY291bnRzKClcbiAganpyLnNob3dfanpyX21ldGFfZmF1bHRzKClcbiAgIyB2OmM6cmVhZGluZzpqYS14LUhpclxuICAjIHY6YzpyZWFkaW5nOmphLXgtS2F0XG4gIGlmIGZhbHNlXG4gICAgc2VlbiA9IG5ldyBTZXQoKVxuICAgIGZvciB7IHJlYWRpbmcsIH0gZnJvbSBqenIuZGJhLndhbGsgU1FMXCJzZWxlY3QgZGlzdGluY3QoIG8gKSBhcyByZWFkaW5nIGZyb20ganpyX3RyaXBsZXMgd2hlcmUgdiA9ICd2OmM6cmVhZGluZzpqYS14LUthdCcgb3JkZXIgYnkgbztcIlxuICAgICAgZm9yIHBhcnQgaW4gKCByZWFkaW5nLnNwbGl0IC8oLuODvHwu44OjfC7jg6V8LuODp3zjg4MufC4pL3YgKSB3aGVuIHBhcnQgaXNudCAnJ1xuICAgICAgICBjb250aW51ZSBpZiBzZWVuLmhhcyBwYXJ0XG4gICAgICAgIHNlZW4uYWRkIHBhcnRcbiAgICAgICAgZWNobyBwYXJ0XG4gICAgZm9yIHsgcmVhZGluZywgfSBmcm9tIGp6ci5kYmEud2FsayBTUUxcInNlbGVjdCBkaXN0aW5jdCggbyApIGFzIHJlYWRpbmcgZnJvbSBqenJfdHJpcGxlcyB3aGVyZSB2ID0gJ3Y6YzpyZWFkaW5nOmphLXgtSGlyJyBvcmRlciBieSBvO1wiXG4gICAgICBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLygu44O8fC7jgoN8LuOChXwu44KHfOOBoy58LikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICAgICAjIGZvciBwYXJ0IGluICggcmVhZGluZy5zcGxpdCAvKC4pL3YgKSB3aGVuIHBhcnQgaXNudCAnJ1xuICAgICAgICBjb250aW51ZSBpZiBzZWVuLmhhcyBwYXJ0XG4gICAgICAgIHNlZW4uYWRkIHBhcnRcbiAgICAgICAgZWNobyBwYXJ0XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgO251bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5kZW1vX3JlYWRfZHVtcCA9IC0+XG4gIHsgQmVuY2htYXJrZXIsICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9iZW5jaG1hcmtpbmcoKVxuICAjIHsgbmFtZWl0LCAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9uYW1laXQoKVxuICBiZW5jaG1hcmtlciA9IG5ldyBCZW5jaG1hcmtlcigpXG4gIHRpbWVpdCA9ICggUC4uLiApIC0+IGJlbmNobWFya2VyLnRpbWVpdCBQLi4uXG4gIHsgVW5kdW1wZXIsICAgICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9zcWxpdGVfdW5kdW1wZXIoKVxuICB7IHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMsICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcbiAgeyB3YywgICAgICAgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX3djKClcbiAgcGF0aCAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEgucmVzb2x2ZSBfX2Rpcm5hbWUsICcuLi9qenIuZHVtcC5zcWwnXG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICBqenIuZGJhLnRlYXJkb3duIHsgdGVzdDogJyonLCB9XG4gIGRlYnVnICfOqWp6cnNkYl9fXzEnLCBVbmR1bXBlci51bmR1bXAgeyBkYjoganpyLmRiYSwgcGF0aCwgbW9kZTogJ2Zhc3QnLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAganpyLnNob3dfY291bnRzKClcbiAganpyLnNob3dfanpyX21ldGFfZmF1bHRzKClcbiAgO251bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5kZW1vX3Nob3dfYWxsX3RhYmxlcyA9ICh7IHJvd3MgPSAxMCwgfT17fSkgLT5cbiAganpyID0gbmV3IEppenVyYSgpXG4gIHJlbGF0aW9ucyA9IHt9XG4gIGZvciB7IG5hbWUsIHR5cGUsIH0gZnJvbSBqenIuZGJhLndhbGsgU1FMXCJcIlwiXG4gICAgc2VsZWN0IG5hbWUsIHR5cGVcbiAgICBmcm9tIHNxbGl0ZV9zY2hlbWFcbiAgICB3aGVyZSB0eXBlIGluICggJ3RhYmxlJywgJ3ZpZXcnIClcbiAgICAtLSBvcmRlciBieSBuYW1lXG4gICAgO1wiXCJcIlxuICAgIGNvbnRpbnVlIGlmIG5hbWUuc3RhcnRzV2l0aCAnc3RkXydcbiAgICBjb250aW51ZSBpZiBuYW1lLnN0YXJ0c1dpdGggJ19qenJfbWV0YV8nXG4gICAgY29udGludWUgaWYgbmFtZS5zdGFydHNXaXRoICdqenJfbWV0YV8nXG4gICAgcmVsYXRpb25zWyBuYW1lIF0gPSB0eXBlXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZm9yIHJlbGF0aW9uX25hbWUsIHJlbGF0aW9uX3R5cGUgb2YgcmVsYXRpb25zXG4gICAgcm93X2NvdW50ICAgPSAoIGp6ci5kYmEuZ2V0X2ZpcnN0IFNRTFwic2VsZWN0IGNvdW50KCopIGFzIGNvdW50IGZyb20gI3tyZWxhdGlvbl9uYW1lfTtcIiApLmNvdW50XG4gICAgc3RhdGVtZW50ICAgPSBqenIuZGJhLnByZXBhcmUgU1FMXCJcIlwic2VsZWN0ICogZnJvbSAje3JlbGF0aW9uX25hbWV9IG9yZGVyIGJ5IHJhbmRvbSgpIGxpbWl0ICRyb3dzO1wiXCJcIlxuICAgIGNvbF9uYW1lcyAgID0gKCBjb2x1bW4ubmFtZSBmb3IgY29sdW1uIGluIGp6ci5kYmEuc3RhdGUuY29sdW1ucyApXG4gICAgY2FwdGlvbiAgICAgPSBmXCIje3JlbGF0aW9uX3R5cGV9ICN7cmVsYXRpb25fbmFtZX0gKCN7cm93X2NvdW50fTosLjBmOyByb3dzKVwiXG4gICAgdGFibGUgICAgICAgPSBuZXcgVGFibGUgeyBjYXB0aW9uLCBoZWFkOiBbICcnLCBjb2xfbmFtZXMuLi4sIF0sIH1cbiAgICBjb3VudCAgICAgICA9IDBcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGZvciByb3cgZnJvbSBqenIuZGJhLndhbGsgc3RhdGVtZW50LCB7IHJvd3MsIH1cbiAgICAgIGNvdW50KytcbiAgICAgIGNlbGxzID0gW11cbiAgICAgIGZvciBjb2xfbmFtZSwgY29sX2lkeCBpbiBjb2xfbmFtZXNcbiAgICAgICAgY2VsbCA9IHJvd1sgY29sX25hbWUgXVxuICAgICAgICAjIGNlbGwgPSBjb2xvciBjZWxsIGlmICggY29sb3IgPSBjb2xfY29sb3JzWyBjb2xfaWR4IF0gKT9cbiAgICAgICAgY2VsbHMucHVzaCBjZWxsXG4gICAgICB0YWJsZS5wdXNoIHRhYmxlX3JvdyA9IFsgXCIoI3tjb3VudH0pXCIsIGNlbGxzLi4uLCBdXG4gICAgZWNobyB0YWJsZS50b1N0cmluZygpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgO251bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5vdXRwdXRfcXVlcnlfYXNfY3N2ID0gKCBxdWVyeSApIC0+XG4gIENTViAgID0gcmVxdWlyZSAnY3N2LXN0cmluZ2lmeS9zeW5jJ1xuICBqenIgICA9IG5ldyBKaXp1cmEoKVxuICB3b3V0ICA9ICggUC4uLiApIC0+IHByb2Nlc3Muc3Rkb3V0LndyaXRlIFAuLi47ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDtudWxsXG4gIHdvdXRuID0gKCBQLi4uICkgLT4gcHJvY2Vzcy5zdGRvdXQud3JpdGUgUC4uLjsgcHJvY2Vzcy5zdGRvdXQud3JpdGUgJ1xcbicgIDtudWxsXG4gIHdlcnIgID0gKCBQLi4uICkgLT4gcHJvY2Vzcy5zdGRlcnIud3JpdGUgUC4uLjsgICAgICAgICAgICAgICAgICAgICAgICAgICAgO251bGxcbiAgd2Vycm4gPSAoIFAuLi4gKSAtPiBwcm9jZXNzLnN0ZGVyci53cml0ZSBQLi4uOyBwcm9jZXNzLnN0ZGVyci53cml0ZSAnXFxuJyAgO251bGxcbiAgIyBxdWVyeSA9IHByb2Nlc3MuYXJndlsgMiBdID8gbnVsbFxuICBpZiAoIG5vdCBxdWVyeT8gKSBvciAoIHF1ZXJ5IGlzICcnIClcbiAgICB3ZXJybiByZXZlcnNlIHJlZCBcIiDOqWp6cnNkYl9fXzggbm8gcXVlcnkgZ2l2ZW4gXCJcbiAgICBwcm9jZXNzLmV4aXQgMTExXG4gICAgcmV0dXJuIG51bGxcbiAgcm93cyAgPSBqenIuZGJhLmdldF9hbGwgcXVlcnlcbiAgIyB3b3V0biBjbGlfY29tbWFuZHMudXNlX3BzcGdcbiAgd291dCBDU1Yuc3RyaW5naWZ5IFsgKCBjb2x1bW4ubmFtZSBmb3IgY29sdW1uIGluIGp6ci5kYmEuc3RhdGUuY29sdW1ucyApLCBdXG4gIHdvdXQgQ1NWLnN0cmluZ2lmeSByb3dzXG4gIDtudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5tb2R1bGUuZXhwb3J0cyA9IHsgZGVtb19zaG93X2FsbF90YWJsZXMsIG91dHB1dF9xdWVyeV9hc19jc3YsIH1cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmlmIG1vZHVsZSBpcyByZXF1aXJlLm1haW4gdGhlbiBkbyA9PlxuICAjIGRlbW9fcmVhZF9kdW1wKClcbiAgIyBkZW1vKClcbiAgZGVtb19zaG93X2FsbF90YWJsZXMoKVxuICAjIGRlbW9fY3N2X291dHB1dCgpXG4gICMgO251bGxcblxuXG4gICMgY2ZnID1cbiAgIyAgIGhlYWQ6IEFycmF5LmZyb20gJ2FiY2RlZmdoaWprbG1ubydcbiAgIyAgICMgY29sV2lkdGhzOiBbIDEwLCAyMCwgXVxuICAjIHRhYmxlID0gbmV3IFRhYmxlIGNmZ1xuICAjICMgdGFibGUucHVzaCBbJ0ZpcnN0IHZhbHVlIDEnLCAnU2Vjb25kIHZhbHVlIDInXSwgWydGaXJzdCB2YWx1ZSAzJywgJ1NlY29uZCB2YWx1ZSA0J11cbiAgIyAjIHRhYmxlLnB1c2ggWyB7IGE6ICdBJywgYjogJ0InLCBjOiAnQycsIH0gXVxuICAjIHRhYmxlLnB1c2ggWyAnQScsIHsgZjogNywgfSwgdW5kZWZpbmVkLCA0MjM0MjM0MjM0MjIxMjI0MzQsIF1cbiAgIyAjIGVjaG8gdGFibGVcbiAgIyBlY2hvIHRhYmxlLnRvU3RyaW5nKClcbiJdfQ==
