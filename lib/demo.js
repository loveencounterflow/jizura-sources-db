(function() {
  'use strict';
  var GUY, Jizura, SFMODULES, SQL, Table, alert, as_bool, blue, bold, debug, demo, demo_read_dump, demo_show_all_tables, echo, f, from_bool, gold, green, grey, help, info, inspect, lime, log, output_query_as_csv, plain, praise, red, reverse, rpr, urge, warn, whisper, white;

  //===========================================================================================================
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('jizura-sources-db'));

  ({rpr, inspect, echo, white, green, blue, lime, gold, grey, red, bold, reverse, log} = GUY.trm);

  //-----------------------------------------------------------------------------------------------------------
  SFMODULES = require('bricabrac-sfmodules');

  //-----------------------------------------------------------------------------------------------------------
  ({SQL, from_bool, as_bool} = SFMODULES.unstable.require_dbric());

  ({Jizura} = require('./main'));

  ({Table} = SFMODULES.require_cli_table3a());

  //-----------------------------------------------------------------------------------------------------------
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2RlbW8uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsY0FBQSxFQUFBLG9CQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxtQkFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQTs7O0VBR0EsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxLQURGLEVBRUUsSUFGRixFQUdFLElBSEYsRUFJRSxLQUpGLEVBS0UsTUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsT0FSRixDQUFBLEdBUTRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBUixDQUFvQixtQkFBcEIsQ0FSNUI7O0VBU0EsQ0FBQSxDQUFFLEdBQUYsRUFDRSxPQURGLEVBRUUsSUFGRixFQUdFLEtBSEYsRUFJRSxLQUpGLEVBS0UsSUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsSUFSRixFQVNFLEdBVEYsRUFVRSxJQVZGLEVBV0UsT0FYRixFQVlFLEdBWkYsQ0FBQSxHQVk0QixHQUFHLENBQUMsR0FaaEMsRUFiQTs7O0VBMkJBLFNBQUEsR0FBNEIsT0FBQSxDQUFRLHFCQUFSLEVBM0I1Qjs7O0VBNkJBLENBQUEsQ0FBRSxHQUFGLEVBQ0UsU0FERixFQUVFLE9BRkYsQ0FBQSxHQUU0QixTQUFTLENBQUMsUUFBUSxDQUFDLGFBQW5CLENBQUEsQ0FGNUI7O0VBR0EsQ0FBQSxDQUFFLE1BQUYsQ0FBQSxHQUE0QixPQUFBLENBQVEsUUFBUixDQUE1Qjs7RUFDQSxDQUFBLENBQUUsS0FBRixDQUFBLEdBQTRCLFNBQVMsQ0FBQyxtQkFBVixDQUFBLENBQTVCLEVBakNBOzs7RUFtQ0EsQ0FBQSxDQUFFLENBQUYsQ0FBQSxHQUE0QixPQUFBLENBQVEsV0FBUixDQUE1QixFQW5DQTs7Ozs7Ozs7Ozs7Ozs7O0VBb0RBLElBQUEsR0FBTyxRQUFBLENBQUEsQ0FBQTtBQUNQLFFBQUEsQ0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLENBQUEsRUFBQTtJQUFFLEdBQUEsR0FBTSxJQUFJLE1BQUosQ0FBQSxFQUFSOzs7SUFHRSxHQUFHLENBQUMsV0FBSixDQUFBO0lBQ0EsR0FBRyxDQUFDLG9CQUFKLENBQUEsRUFKRjs7O0lBT0UsSUFBRyxLQUFIO01BQ0UsSUFBQSxHQUFPLElBQUksR0FBSixDQUFBO01BQ1AsS0FBQSxxSEFBQTtTQUFJLENBQUUsT0FBRjtBQUNGO1FBQUEsS0FBQSxxQ0FBQTs7Z0JBQXlELElBQUEsS0FBVTs7O1VBQ2pFLElBQVksSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFULENBQVo7QUFBQSxxQkFBQTs7VUFDQSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQVQ7VUFDQSxJQUFBLENBQUssSUFBTDtRQUhGO01BREY7TUFLQSxLQUFBLHFIQUFBO1NBQUksQ0FBRSxPQUFGO0FBQ0Y7UUFBQSxLQUFBLHdDQUFBOztnQkFBeUQsSUFBQSxLQUFVOzs7VUFFakUsSUFBWSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQVQsQ0FBWjs7QUFBQSxxQkFBQTs7VUFDQSxJQUFJLENBQUMsR0FBTCxDQUFTLElBQVQ7VUFDQSxJQUFBLENBQUssSUFBTDtRQUpGO01BREYsQ0FQRjtLQVBGOztXQXFCRztFQXRCSSxFQXBEUDs7O0VBNkVBLGNBQUEsR0FBaUIsUUFBQSxDQUFBLENBQUE7QUFDakIsUUFBQSxXQUFBLEVBQUEsUUFBQSxFQUFBLFdBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSx5QkFBQSxFQUFBO0lBQUUsQ0FBQSxDQUFFLFdBQUYsQ0FBQSxHQUE0QixTQUFTLENBQUMsUUFBUSxDQUFDLG9CQUFuQixDQUFBLENBQTVCLEVBQUY7O0lBRUUsV0FBQSxHQUFjLElBQUksV0FBSixDQUFBO0lBQ2QsTUFBQSxHQUFTLFFBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBQTthQUFZLFdBQVcsQ0FBQyxNQUFaLENBQW1CLEdBQUEsQ0FBbkI7SUFBWjtJQUNULENBQUEsQ0FBRSxRQUFGLENBQUEsR0FBa0MsU0FBUyxDQUFDLHVCQUFWLENBQUEsQ0FBbEM7SUFDQSxDQUFBLENBQUUseUJBQUYsQ0FBQSxHQUFrQyxTQUFTLENBQUMsUUFBUSxDQUFDLHVCQUFuQixDQUFBLENBQWxDO0lBQ0EsQ0FBQSxDQUFFLEVBQUYsQ0FBQSxHQUFrQyxTQUFTLENBQUMsVUFBVixDQUFBLENBQWxDO0lBQ0EsSUFBQSxHQUFrQyxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsaUJBQXhCO0lBQ2xDLEdBQUEsR0FBTSxJQUFJLE1BQUosQ0FBQTtJQUNOLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUixDQUFpQjtNQUFFLElBQUEsRUFBTTtJQUFSLENBQWpCO0lBQ0EsS0FBQSxDQUFNLGFBQU4sRUFBcUIsUUFBUSxDQUFDLE1BQVQsQ0FBZ0I7TUFBRSxFQUFBLEVBQUksR0FBRyxDQUFDLEdBQVY7TUFBZSxJQUFmO01BQXFCLElBQUEsRUFBTTtJQUEzQixDQUFoQixDQUFyQixFQVZGOztJQVlFLEdBQUcsQ0FBQyxXQUFKLENBQUE7SUFDQSxHQUFHLENBQUMsb0JBQUosQ0FBQTtXQUNDO0VBZmMsRUE3RWpCOzs7RUErRkEsb0JBQUEsR0FBdUIsUUFBQSxDQUFDLENBQUUsSUFBQSxHQUFPLEVBQVQsSUFBZSxDQUFBLENBQWhCLENBQUE7QUFDdkIsUUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBLFNBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxhQUFBLEVBQUEsYUFBQSxFQUFBLFNBQUEsRUFBQSxHQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxLQUFBLEVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQTtJQUFFLEdBQUEsR0FBTSxJQUFJLE1BQUosQ0FBQTtJQUNOLFNBQUEsR0FBWSxDQUFBO0lBQ1osS0FBQTs7OztHQUFBO09BQUksQ0FBRSxJQUFGLEVBQVEsSUFBUjtNQU1GLElBQVksSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsTUFBaEIsQ0FBWjtBQUFBLGlCQUFBOztNQUNBLElBQVksSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsWUFBaEIsQ0FBWjtBQUFBLGlCQUFBOztNQUNBLElBQVksSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsV0FBaEIsQ0FBWjtBQUFBLGlCQUFBOztNQUNBLFNBQVMsQ0FBRSxJQUFGLENBQVQsR0FBb0I7SUFUdEIsQ0FGRjs7SUFhRSxLQUFBLDBCQUFBOztNQUNFLFNBQUEsR0FBYyxDQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUixDQUFrQixHQUFHLENBQUEsOEJBQUEsQ0FBQSxDQUFpQyxhQUFqQyxFQUFBLENBQXJCLENBQUYsQ0FBMEUsQ0FBQztNQUN6RixTQUFBLEdBQWMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFSLENBQWdCLEdBQUcsQ0FBQSxjQUFBLENBQUEsQ0FBbUIsYUFBbkIsQ0FBQSwrQkFBQSxDQUFuQjtNQUNkLFNBQUE7O0FBQWdCO0FBQUE7UUFBQSxLQUFBLHFDQUFBOzt1QkFBQSxNQUFNLENBQUM7UUFBUCxDQUFBOzs7TUFDaEIsT0FBQSxHQUFjLENBQUMsQ0FBQSxDQUFBLENBQUcsYUFBSCxFQUFBLENBQUEsQ0FBb0IsYUFBcEIsQ0FBQSxFQUFBLENBQUEsQ0FBc0MsU0FBdEMsQ0FBQSxZQUFBO01BQ2YsS0FBQSxHQUFjLElBQUksS0FBSixDQUFVO1FBQUUsT0FBRjtRQUFXLElBQUEsRUFBTSxDQUFFLEVBQUYsRUFBTSxHQUFBLFNBQU47TUFBakIsQ0FBVjtNQUNkLEtBQUEsR0FBYyxFQUxsQjs7TUFPSSxLQUFBLHNDQUFBO1FBQ0UsS0FBQTtRQUNBLEtBQUEsR0FBUTtRQUNSLEtBQUEsK0RBQUE7O1VBQ0UsSUFBQSxHQUFPLEdBQUcsQ0FBRSxRQUFGLEVBQWxCOztVQUVRLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWDtRQUhGO1FBSUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFBLEdBQVksQ0FBRSxDQUFBLENBQUEsQ0FBQSxDQUFJLEtBQUosQ0FBQSxDQUFBLENBQUYsRUFBZ0IsR0FBQSxLQUFoQixDQUF2QjtNQVBGO01BUUEsSUFBQSxDQUFLLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FBTDtJQWhCRixDQWJGOztXQStCRztFQWhDb0IsRUEvRnZCOzs7RUFrSUEsbUJBQUEsR0FBc0IsUUFBQSxDQUFFLEtBQUYsQ0FBQTtBQUN0QixRQUFBLEdBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQTtJQUFFLEdBQUEsR0FBUSxPQUFBLENBQVEsb0JBQVI7SUFDUixHQUFBLEdBQVEsSUFBSSxNQUFKLENBQUE7SUFDUixJQUFBLEdBQVEsUUFBQSxDQUFBLEdBQUUsQ0FBRixDQUFBO01BQVksT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFmLENBQXFCLEdBQUEsQ0FBckI7YUFBdUQ7SUFBbkU7SUFDUixLQUFBLEdBQVEsUUFBQSxDQUFBLEdBQUUsQ0FBRixDQUFBO01BQVksT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFmLENBQXFCLEdBQUEsQ0FBckI7TUFBMkIsT0FBTyxDQUFDLE1BQU0sQ0FBQyxLQUFmLENBQXFCLElBQXJCO2FBQTRCO0lBQW5FO0lBQ1IsSUFBQSxHQUFRLFFBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBQTtNQUFZLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBZixDQUFxQixHQUFBLENBQXJCO2FBQXVEO0lBQW5FO0lBQ1IsS0FBQSxHQUFRLFFBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBQTtNQUFZLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBZixDQUFxQixHQUFBLENBQXJCO01BQTJCLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBZixDQUFxQixJQUFyQjthQUE0QjtJQUFuRSxFQUxWOztJQU9FLElBQUcsQ0FBTSxhQUFOLENBQUEsSUFBa0IsQ0FBRSxLQUFBLEtBQVMsRUFBWCxDQUFyQjtNQUNFLEtBQUEsQ0FBTSxPQUFBLENBQVEsR0FBQSxDQUFJLDhCQUFKLENBQVIsQ0FBTjtNQUNBLE9BQU8sQ0FBQyxJQUFSLENBQWEsR0FBYjtBQUNBLGFBQU8sS0FIVDs7SUFJQSxJQUFBLEdBQVEsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFSLENBQWdCLEtBQWhCLEVBWFY7O0lBYUUsSUFBQSxDQUFLLEdBQUcsQ0FBQyxTQUFKLENBQWM7Ozs7OztBQUFJO0FBQUE7UUFBQSxLQUFBLHFDQUFBOzt1QkFBQSxNQUFNLENBQUM7UUFBUCxDQUFBOztVQUFKO0tBQWQsQ0FBTDtJQUNBLElBQUEsQ0FBSyxHQUFHLENBQUMsU0FBSixDQUFjLElBQWQsQ0FBTDtXQUNDO0VBaEJtQixFQWxJdEI7OztFQXNKQSxNQUFNLENBQUMsT0FBUCxHQUFpQixDQUFFLG9CQUFGLEVBQXdCLG1CQUF4QixFQXRKakI7OztFQTBKQSxJQUFHLE1BQUEsS0FBVSxPQUFPLENBQUMsSUFBckI7SUFBa0MsQ0FBQSxDQUFBLENBQUEsR0FBQSxFQUFBOzs7YUFHaEMsb0JBQUEsQ0FBQTtJQUhnQyxDQUFBLElBQWxDOzs7RUExSkE7Ozs7Ozs7Ozs7OztBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0J1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbkdVWSAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXknXG57IGFsZXJ0XG4gIGRlYnVnXG4gIGhlbHBcbiAgaW5mb1xuICBwbGFpblxuICBwcmFpc2VcbiAgdXJnZVxuICB3YXJuXG4gIHdoaXNwZXIgfSAgICAgICAgICAgICAgID0gR1VZLnRybS5nZXRfbG9nZ2VycyAnaml6dXJhLXNvdXJjZXMtZGInXG57IHJwclxuICBpbnNwZWN0XG4gIGVjaG9cbiAgd2hpdGVcbiAgZ3JlZW5cbiAgYmx1ZVxuICBsaW1lXG4gIGdvbGRcbiAgZ3JleVxuICByZWRcbiAgYm9sZFxuICByZXZlcnNlXG4gIGxvZyAgICAgfSAgICAgICAgICAgICAgID0gR1VZLnRybVxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5TRk1PRFVMRVMgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYnJpY2FicmFjLXNmbW9kdWxlcydcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxueyBTUUwsXG4gIGZyb21fYm9vbCxcbiAgYXNfYm9vbCwgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9kYnJpYygpXG57IEppenVyYSwgICAgICAgICAgICAgICB9ID0gcmVxdWlyZSAnLi9tYWluJ1xueyBUYWJsZSwgfSAgICAgICAgICAgICAgICA9IFNGTU9EVUxFUy5yZXF1aXJlX2NsaV90YWJsZTNhKClcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxueyBmLCAgICAgICAgICAgICAgICAgICAgfSA9IHJlcXVpcmUgJ2VmZnN0cmluZydcblxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyMjXG5cbm9vb29vb29vb28uICAgb29vb29vb29vb29vIG9vbyAgICAgICAgb29vb28gICAub29vb29vLlxuYDg4OCcgICBgWThiICBgODg4JyAgICAgYDggYDg4LiAgICAgICAuODg4JyAgZDhQJyAgYFk4YlxuIDg4OCAgICAgIDg4OCAgODg4ICAgICAgICAgIDg4OGIgICAgIGQnODg4ICA4ODggICAgICA4ODhcbiA4ODggICAgICA4ODggIDg4OG9vb284ICAgICA4IFk4OC4gLlAgIDg4OCAgODg4ICAgICAgODg4XG4gODg4ICAgICAgODg4ICA4ODggICAgXCIgICAgIDggIGA4ODgnICAgODg4ICA4ODggICAgICA4ODhcbiA4ODggICAgIGQ4OCcgIDg4OCAgICAgICBvICA4ICAgIFkgICAgIDg4OCAgYDg4YiAgICBkODgnXG5vODg4Ym9vZDhQJyAgIG84ODhvb29vb29kOCBvOG8gICAgICAgIG84ODhvICBgWThib29kOFAnXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICMjI1xuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5kZW1vID0gLT5cbiAganpyID0gbmV3IEppenVyYSgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyBqenIuX3Nob3dfanpyX21ldGFfdWNfbm9ybWFsaXphdGlvbl9mYXVsdHMoKVxuICBqenIuc2hvd19jb3VudHMoKVxuICBqenIuc2hvd19qenJfbWV0YV9mYXVsdHMoKVxuICAjIHY6YzpyZWFkaW5nOmphLXgtSGlyXG4gICMgdjpjOnJlYWRpbmc6amEteC1LYXRcbiAgaWYgZmFsc2VcbiAgICBzZWVuID0gbmV3IFNldCgpXG4gICAgZm9yIHsgcmVhZGluZywgfSBmcm9tIGp6ci5kYmEud2FsayBTUUxcInNlbGVjdCBkaXN0aW5jdCggbyApIGFzIHJlYWRpbmcgZnJvbSBqenJfdHJpcGxlcyB3aGVyZSB2ID0gJ3Y6YzpyZWFkaW5nOmphLXgtS2F0JyBvcmRlciBieSBvO1wiXG4gICAgICBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLygu44O8fC7jg6N8LuODpXwu44OnfOODgy58LikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICAgICAgIGNvbnRpbnVlIGlmIHNlZW4uaGFzIHBhcnRcbiAgICAgICAgc2Vlbi5hZGQgcGFydFxuICAgICAgICBlY2hvIHBhcnRcbiAgICBmb3IgeyByZWFkaW5nLCB9IGZyb20ganpyLmRiYS53YWxrIFNRTFwic2VsZWN0IGRpc3RpbmN0KCBvICkgYXMgcmVhZGluZyBmcm9tIGp6cl90cmlwbGVzIHdoZXJlIHYgPSAndjpjOnJlYWRpbmc6amEteC1IaXInIG9yZGVyIGJ5IG87XCJcbiAgICAgIGZvciBwYXJ0IGluICggcmVhZGluZy5zcGxpdCAvKC7jg7x8LuOCg3wu44KFfC7jgod844GjLnwuKS92ICkgd2hlbiBwYXJ0IGlzbnQgJydcbiAgICAgICMgZm9yIHBhcnQgaW4gKCByZWFkaW5nLnNwbGl0IC8oLikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICAgICAgIGNvbnRpbnVlIGlmIHNlZW4uaGFzIHBhcnRcbiAgICAgICAgc2Vlbi5hZGQgcGFydFxuICAgICAgICBlY2hvIHBhcnRcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICA7bnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmRlbW9fcmVhZF9kdW1wID0gLT5cbiAgeyBCZW5jaG1hcmtlciwgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2JlbmNobWFya2luZygpXG4gICMgeyBuYW1laXQsICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX25hbWVpdCgpXG4gIGJlbmNobWFya2VyID0gbmV3IEJlbmNobWFya2VyKClcbiAgdGltZWl0ID0gKCBQLi4uICkgLT4gYmVuY2htYXJrZXIudGltZWl0IFAuLi5cbiAgeyBVbmR1bXBlciwgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX3NxbGl0ZV91bmR1bXBlcigpXG4gIHsgd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucywgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9mYXN0X2xpbmVyZWFkZXIoKVxuICB7IHdjLCAgICAgICAgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfd2MoKVxuICBwYXRoICAgICAgICAgICAgICAgICAgICAgICAgICAgID0gUEFUSC5yZXNvbHZlIF9fZGlybmFtZSwgJy4uL2p6ci5kdW1wLnNxbCdcbiAganpyID0gbmV3IEppenVyYSgpXG4gIGp6ci5kYmEudGVhcmRvd24geyB0ZXN0OiAnKicsIH1cbiAgZGVidWcgJ86panpyc2RiX19fMScsIFVuZHVtcGVyLnVuZHVtcCB7IGRiOiBqenIuZGJhLCBwYXRoLCBtb2RlOiAnZmFzdCcsIH1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBqenIuc2hvd19jb3VudHMoKVxuICBqenIuc2hvd19qenJfbWV0YV9mYXVsdHMoKVxuICA7bnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmRlbW9fc2hvd19hbGxfdGFibGVzID0gKHsgcm93cyA9IDEwLCB9PXt9KSAtPlxuICBqenIgPSBuZXcgSml6dXJhKClcbiAgcmVsYXRpb25zID0ge31cbiAgZm9yIHsgbmFtZSwgdHlwZSwgfSBmcm9tIGp6ci5kYmEud2FsayBTUUxcIlwiXCJcbiAgICBzZWxlY3QgbmFtZSwgdHlwZVxuICAgIGZyb20gc3FsaXRlX3NjaGVtYVxuICAgIHdoZXJlIHR5cGUgaW4gKCAndGFibGUnLCAndmlldycgKVxuICAgIC0tIG9yZGVyIGJ5IG5hbWVcbiAgICA7XCJcIlwiXG4gICAgY29udGludWUgaWYgbmFtZS5zdGFydHNXaXRoICdzdGRfJ1xuICAgIGNvbnRpbnVlIGlmIG5hbWUuc3RhcnRzV2l0aCAnX2p6cl9tZXRhXydcbiAgICBjb250aW51ZSBpZiBuYW1lLnN0YXJ0c1dpdGggJ2p6cl9tZXRhXydcbiAgICByZWxhdGlvbnNbIG5hbWUgXSA9IHR5cGVcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBmb3IgcmVsYXRpb25fbmFtZSwgcmVsYXRpb25fdHlwZSBvZiByZWxhdGlvbnNcbiAgICByb3dfY291bnQgICA9ICgganpyLmRiYS5nZXRfZmlyc3QgU1FMXCJzZWxlY3QgY291bnQoKikgYXMgY291bnQgZnJvbSAje3JlbGF0aW9uX25hbWV9O1wiICkuY291bnRcbiAgICBzdGF0ZW1lbnQgICA9IGp6ci5kYmEucHJlcGFyZSBTUUxcIlwiXCJzZWxlY3QgKiBmcm9tICN7cmVsYXRpb25fbmFtZX0gb3JkZXIgYnkgcmFuZG9tKCkgbGltaXQgJHJvd3M7XCJcIlwiXG4gICAgY29sX25hbWVzICAgPSAoIGNvbHVtbi5uYW1lIGZvciBjb2x1bW4gaW4ganpyLmRiYS5zdGF0ZS5jb2x1bW5zIClcbiAgICBjYXB0aW9uICAgICA9IGZcIiN7cmVsYXRpb25fdHlwZX0gI3tyZWxhdGlvbl9uYW1lfSAoI3tyb3dfY291bnR9OiwuMGY7IHJvd3MpXCJcbiAgICB0YWJsZSAgICAgICA9IG5ldyBUYWJsZSB7IGNhcHRpb24sIGhlYWQ6IFsgJycsIGNvbF9uYW1lcy4uLiwgXSwgfVxuICAgIGNvdW50ICAgICAgID0gMFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZm9yIHJvdyBmcm9tIGp6ci5kYmEud2FsayBzdGF0ZW1lbnQsIHsgcm93cywgfVxuICAgICAgY291bnQrK1xuICAgICAgY2VsbHMgPSBbXVxuICAgICAgZm9yIGNvbF9uYW1lLCBjb2xfaWR4IGluIGNvbF9uYW1lc1xuICAgICAgICBjZWxsID0gcm93WyBjb2xfbmFtZSBdXG4gICAgICAgICMgY2VsbCA9IGNvbG9yIGNlbGwgaWYgKCBjb2xvciA9IGNvbF9jb2xvcnNbIGNvbF9pZHggXSApP1xuICAgICAgICBjZWxscy5wdXNoIGNlbGxcbiAgICAgIHRhYmxlLnB1c2ggdGFibGVfcm93ID0gWyBcIigje2NvdW50fSlcIiwgY2VsbHMuLi4sIF1cbiAgICBlY2hvIHRhYmxlLnRvU3RyaW5nKClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICA7bnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbm91dHB1dF9xdWVyeV9hc19jc3YgPSAoIHF1ZXJ5ICkgLT5cbiAgQ1NWICAgPSByZXF1aXJlICdjc3Ytc3RyaW5naWZ5L3N5bmMnXG4gIGp6ciAgID0gbmV3IEppenVyYSgpXG4gIHdvdXQgID0gKCBQLi4uICkgLT4gcHJvY2Vzcy5zdGRvdXQud3JpdGUgUC4uLjsgICAgICAgICAgICAgICAgICAgICAgICAgICAgO251bGxcbiAgd291dG4gPSAoIFAuLi4gKSAtPiBwcm9jZXNzLnN0ZG91dC53cml0ZSBQLi4uOyBwcm9jZXNzLnN0ZG91dC53cml0ZSAnXFxuJyAgO251bGxcbiAgd2VyciAgPSAoIFAuLi4gKSAtPiBwcm9jZXNzLnN0ZGVyci53cml0ZSBQLi4uOyAgICAgICAgICAgICAgICAgICAgICAgICAgICA7bnVsbFxuICB3ZXJybiA9ICggUC4uLiApIC0+IHByb2Nlc3Muc3RkZXJyLndyaXRlIFAuLi47IHByb2Nlc3Muc3RkZXJyLndyaXRlICdcXG4nICA7bnVsbFxuICAjIHF1ZXJ5ID0gcHJvY2Vzcy5hcmd2WyAyIF0gPyBudWxsXG4gIGlmICggbm90IHF1ZXJ5PyApIG9yICggcXVlcnkgaXMgJycgKVxuICAgIHdlcnJuIHJldmVyc2UgcmVkIFwiIM6panpyc2RiX19fOCBubyBxdWVyeSBnaXZlbiBcIlxuICAgIHByb2Nlc3MuZXhpdCAxMTFcbiAgICByZXR1cm4gbnVsbFxuICByb3dzICA9IGp6ci5kYmEuZ2V0X2FsbCBxdWVyeVxuICAjIHdvdXRuIGNsaV9jb21tYW5kcy51c2VfcHNwZ1xuICB3b3V0IENTVi5zdHJpbmdpZnkgWyAoIGNvbHVtbi5uYW1lIGZvciBjb2x1bW4gaW4ganpyLmRiYS5zdGF0ZS5jb2x1bW5zICksIF1cbiAgd291dCBDU1Yuc3RyaW5naWZ5IHJvd3NcbiAgO251bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbm1vZHVsZS5leHBvcnRzID0geyBkZW1vX3Nob3dfYWxsX3RhYmxlcywgb3V0cHV0X3F1ZXJ5X2FzX2NzdiwgfVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuaWYgbW9kdWxlIGlzIHJlcXVpcmUubWFpbiB0aGVuIGRvID0+XG4gICMgZGVtb19yZWFkX2R1bXAoKVxuICAjIGRlbW8oKVxuICBkZW1vX3Nob3dfYWxsX3RhYmxlcygpXG4gICMgZGVtb19jc3Zfb3V0cHV0KClcbiAgIyA7bnVsbFxuXG5cbiAgIyBjZmcgPVxuICAjICAgaGVhZDogQXJyYXkuZnJvbSAnYWJjZGVmZ2hpamtsbW5vJ1xuICAjICAgIyBjb2xXaWR0aHM6IFsgMTAsIDIwLCBdXG4gICMgdGFibGUgPSBuZXcgVGFibGUgY2ZnXG4gICMgIyB0YWJsZS5wdXNoIFsnRmlyc3QgdmFsdWUgMScsICdTZWNvbmQgdmFsdWUgMiddLCBbJ0ZpcnN0IHZhbHVlIDMnLCAnU2Vjb25kIHZhbHVlIDQnXVxuICAjICMgdGFibGUucHVzaCBbIHsgYTogJ0EnLCBiOiAnQicsIGM6ICdDJywgfSBdXG4gICMgdGFibGUucHVzaCBbICdBJywgeyBmOiA3LCB9LCB1bmRlZmluZWQsIDQyMzQyMzQyMzQyMjEyMjQzNCwgXVxuICAjICMgZWNobyB0YWJsZVxuICAjIGVjaG8gdGFibGUudG9TdHJpbmcoKVxuIl19
