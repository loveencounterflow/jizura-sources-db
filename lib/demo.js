(function() {
  'use strict';
  var GUY, IDN, Jizura, LIT, SFMODULES, SQL, Table, VEC, alert, as_bool, blue, bold, debug, demo, demo_read_dump, demo_show_all_tables, demo_show_tofu_characters, echo, f, from_bool, gold, green, grey, help, info, inspect, lime, log, output_query_as_csv, output_query_as_table, plain, praise, red, reverse, rpr, urge, warn, whisper, white;

  //===========================================================================================================
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('jizura-sources-db'));

  ({rpr, inspect, echo, white, green, blue, lime, gold, grey, red, bold, reverse, log} = GUY.trm);

  //-----------------------------------------------------------------------------------------------------------
  SFMODULES = require('../../bricabrac-sfmodules');

  //-----------------------------------------------------------------------------------------------------------
  ({SQL, IDN, LIT, VEC, from_bool, as_bool} = SFMODULES.unstable.require_dbric());

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
  demo_show_all_tables = function({rebuild = false, rows = 10} = {}) {
    var caption, cell, cells, col_idx, col_name, col_names, column, count, i, jzr, len, name, relation_name, relation_type, relations, row, row_count, statement, table, table_row, type, x;
    jzr = new Jizura({rebuild});
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
  output_query_as_table = function(query) {
    var jzr;
    jzr = new Jizura();
    jzr.dba.tbl_echo_as_text(query);
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
      werrn(reverse(red(" Ωjzrsdb___2 no query given ")));
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

  //-----------------------------------------------------------------------------------------------------------
  demo_show_tofu_characters = function() {
    var chr, chrs, cids, jzr, statement;
    jzr = new Jizura({
      rebuild: false
    });
    chrs = `𤬓⿱𨎞𢚾𪈎𤹉𪆅𦭘𥣈`;
    chrs = [...(new Set((Array.from(chrs.replace(/\s+/, ''))).sort()))];
    debug('Ωjzrsdb___1', chrs);
    cids = (function() {
      var i, len, results;
      results = [];
      for (i = 0, len = chrs.length; i < len; i++) {
        chr = chrs[i];
        results.push(chr.codePointAt(0));
      }
      return results;
    })();
    statement = SQL`select * from jzr_triples where s in ${VEC(chrs)};`;
    jzr.dba.tbl_echo_as_text(statement);
    jzr.dba.tbl_echo_as_text(SQL`select * from jzr_glyphranges;`);
    jzr.dba.tbl_echo_as_text(SQL`select * from jzr_glyphranges where $cid between lo and hi;`, {
      cid: cids[0]
    });
    return null;
  };

  //===========================================================================================================
  module.exports = {demo_show_all_tables, output_query_as_table, output_query_as_csv};

  //===========================================================================================================
  if (module === require.main) {
    (() => {
      // demo_read_dump()
      // demo()
      // demo_show_all_tables()
      return demo_show_tofu_characters();
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2RlbW8uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsY0FBQSxFQUFBLG9CQUFBLEVBQUEseUJBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxFQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLG1CQUFBLEVBQUEscUJBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUE7OztFQUdBLEdBQUEsR0FBNEIsT0FBQSxDQUFRLEtBQVI7O0VBQzVCLENBQUEsQ0FBRSxLQUFGLEVBQ0UsS0FERixFQUVFLElBRkYsRUFHRSxJQUhGLEVBSUUsS0FKRixFQUtFLE1BTEYsRUFNRSxJQU5GLEVBT0UsSUFQRixFQVFFLE9BUkYsQ0FBQSxHQVE0QixHQUFHLENBQUMsR0FBRyxDQUFDLFdBQVIsQ0FBb0IsbUJBQXBCLENBUjVCOztFQVNBLENBQUEsQ0FBRSxHQUFGLEVBQ0UsT0FERixFQUVFLElBRkYsRUFHRSxLQUhGLEVBSUUsS0FKRixFQUtFLElBTEYsRUFNRSxJQU5GLEVBT0UsSUFQRixFQVFFLElBUkYsRUFTRSxHQVRGLEVBVUUsSUFWRixFQVdFLE9BWEYsRUFZRSxHQVpGLENBQUEsR0FZNEIsR0FBRyxDQUFDLEdBWmhDLEVBYkE7OztFQTJCQSxTQUFBLEdBQTRCLE9BQUEsQ0FBUSwyQkFBUixFQTNCNUI7OztFQTZCQSxDQUFBLENBQUUsR0FBRixFQUNFLEdBREYsRUFFRSxHQUZGLEVBR0UsR0FIRixFQUlFLFNBSkYsRUFLRSxPQUxGLENBQUEsR0FLNEIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxhQUFuQixDQUFBLENBTDVCOztFQU1BLENBQUEsQ0FBRSxNQUFGLENBQUEsR0FBNEIsT0FBQSxDQUFRLFFBQVIsQ0FBNUI7O0VBQ0EsQ0FBQSxDQUFFLEtBQUYsQ0FBQSxHQUE0QixTQUFTLENBQUMsbUJBQVYsQ0FBQSxDQUE1QixFQXBDQTs7O0VBc0NBLENBQUEsQ0FBRSxDQUFGLENBQUEsR0FBNEIsT0FBQSxDQUFRLFdBQVIsQ0FBNUIsRUF0Q0E7Ozs7Ozs7Ozs7Ozs7OztFQXVEQSxJQUFBLEdBQU8sUUFBQSxDQUFBLENBQUE7QUFDUCxRQUFBLENBQUEsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxDQUFBLEVBQUE7SUFBRSxHQUFBLEdBQU0sSUFBSSxNQUFKLENBQUEsRUFBUjs7O0lBR0UsR0FBRyxDQUFDLFdBQUosQ0FBQTtJQUNBLEdBQUcsQ0FBQyxvQkFBSixDQUFBLEVBSkY7OztJQU9FLElBQUcsS0FBSDtNQUNFLElBQUEsR0FBTyxJQUFJLEdBQUosQ0FBQTtNQUNQLEtBQUEscUhBQUE7U0FBSSxDQUFFLE9BQUY7QUFDRjtRQUFBLEtBQUEscUNBQUE7O2dCQUF5RCxJQUFBLEtBQVU7OztVQUNqRSxJQUFZLElBQUksQ0FBQyxHQUFMLENBQVMsSUFBVCxDQUFaO0FBQUEscUJBQUE7O1VBQ0EsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFUO1VBQ0EsSUFBQSxDQUFLLElBQUw7UUFIRjtNQURGO01BS0EsS0FBQSxxSEFBQTtTQUFJLENBQUUsT0FBRjtBQUNGO1FBQUEsS0FBQSx3Q0FBQTs7Z0JBQXlELElBQUEsS0FBVTs7O1VBRWpFLElBQVksSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFULENBQVo7O0FBQUEscUJBQUE7O1VBQ0EsSUFBSSxDQUFDLEdBQUwsQ0FBUyxJQUFUO1VBQ0EsSUFBQSxDQUFLLElBQUw7UUFKRjtNQURGLENBUEY7S0FQRjs7V0FxQkc7RUF0QkksRUF2RFA7OztFQWdGQSxjQUFBLEdBQWlCLFFBQUEsQ0FBQSxDQUFBO0FBQ2pCLFFBQUEsV0FBQSxFQUFBLFFBQUEsRUFBQSxXQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEseUJBQUEsRUFBQTtJQUFFLENBQUEsQ0FBRSxXQUFGLENBQUEsR0FBNEIsU0FBUyxDQUFDLFFBQVEsQ0FBQyxvQkFBbkIsQ0FBQSxDQUE1QixFQUFGOztJQUVFLFdBQUEsR0FBYyxJQUFJLFdBQUosQ0FBQTtJQUNkLE1BQUEsR0FBUyxRQUFBLENBQUEsR0FBRSxDQUFGLENBQUE7YUFBWSxXQUFXLENBQUMsTUFBWixDQUFtQixHQUFBLENBQW5CO0lBQVo7SUFDVCxDQUFBLENBQUUsUUFBRixDQUFBLEdBQWtDLFNBQVMsQ0FBQyx1QkFBVixDQUFBLENBQWxDO0lBQ0EsQ0FBQSxDQUFFLHlCQUFGLENBQUEsR0FBa0MsU0FBUyxDQUFDLFFBQVEsQ0FBQyx1QkFBbkIsQ0FBQSxDQUFsQztJQUNBLENBQUEsQ0FBRSxFQUFGLENBQUEsR0FBa0MsU0FBUyxDQUFDLFVBQVYsQ0FBQSxDQUFsQztJQUNBLElBQUEsR0FBa0MsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLGlCQUF4QjtJQUNsQyxHQUFBLEdBQU0sSUFBSSxNQUFKLENBQUE7SUFDTixHQUFHLENBQUMsR0FBRyxDQUFDLFFBQVIsQ0FBaUI7TUFBRSxJQUFBLEVBQU07SUFBUixDQUFqQjtJQUNBLEtBQUEsQ0FBTSxhQUFOLEVBQXFCLFFBQVEsQ0FBQyxNQUFULENBQWdCO01BQUUsRUFBQSxFQUFJLEdBQUcsQ0FBQyxHQUFWO01BQWUsSUFBZjtNQUFxQixJQUFBLEVBQU07SUFBM0IsQ0FBaEIsQ0FBckIsRUFWRjs7SUFZRSxHQUFHLENBQUMsV0FBSixDQUFBO0lBQ0EsR0FBRyxDQUFDLG9CQUFKLENBQUE7V0FDQztFQWZjLEVBaEZqQjs7O0VBa0dBLG9CQUFBLEdBQXVCLFFBQUEsQ0FBQyxDQUFFLE9BQUEsR0FBVSxLQUFaLEVBQW1CLElBQUEsR0FBTyxFQUExQixJQUFnQyxDQUFBLENBQWpDLENBQUE7QUFDdkIsUUFBQSxPQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBLFNBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxhQUFBLEVBQUEsYUFBQSxFQUFBLFNBQUEsRUFBQSxHQUFBLEVBQUEsU0FBQSxFQUFBLFNBQUEsRUFBQSxLQUFBLEVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQTtJQUFFLEdBQUEsR0FBTSxJQUFJLE1BQUosQ0FBVyxDQUFFLE9BQUYsQ0FBWDtJQUNOLFNBQUEsR0FBWSxDQUFBO0lBQ1osS0FBQTs7OztHQUFBO09BQUksQ0FBRSxJQUFGLEVBQVEsSUFBUjtNQU1GLElBQVksSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsTUFBaEIsQ0FBWjtBQUFBLGlCQUFBOztNQUNBLElBQVksSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsWUFBaEIsQ0FBWjtBQUFBLGlCQUFBOztNQUNBLElBQVksSUFBSSxDQUFDLFVBQUwsQ0FBZ0IsV0FBaEIsQ0FBWjtBQUFBLGlCQUFBOztNQUNBLFNBQVMsQ0FBRSxJQUFGLENBQVQsR0FBb0I7SUFUdEIsQ0FGRjs7SUFhRSxLQUFBLDBCQUFBOztNQUNFLFNBQUEsR0FBYyxDQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsU0FBUixDQUFrQixHQUFHLENBQUEsOEJBQUEsQ0FBQSxDQUFpQyxhQUFqQyxFQUFBLENBQXJCLENBQUYsQ0FBMEUsQ0FBQztNQUN6RixTQUFBLEdBQWMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFSLENBQWdCLEdBQUcsQ0FBQSxjQUFBLENBQUEsQ0FBbUIsYUFBbkIsQ0FBQSwrQkFBQSxDQUFuQjtNQUNkLFNBQUE7O0FBQWdCO0FBQUE7UUFBQSxLQUFBLHFDQUFBOzt1QkFBQSxNQUFNLENBQUM7UUFBUCxDQUFBOzs7TUFDaEIsT0FBQSxHQUFjLENBQUMsQ0FBQSxDQUFBLENBQUcsYUFBSCxFQUFBLENBQUEsQ0FBb0IsYUFBcEIsQ0FBQSxFQUFBLENBQUEsQ0FBc0MsU0FBdEMsQ0FBQSxZQUFBO01BQ2YsS0FBQSxHQUFjLElBQUksS0FBSixDQUFVO1FBQUUsT0FBRjtRQUFXLElBQUEsRUFBTSxDQUFFLEVBQUYsRUFBTSxHQUFBLFNBQU47TUFBakIsQ0FBVjtNQUNkLEtBQUEsR0FBYyxFQUxsQjs7TUFPSSxLQUFBLHNDQUFBO1FBQ0UsS0FBQTtRQUNBLEtBQUEsR0FBUTtRQUNSLEtBQUEsK0RBQUE7O1VBQ0UsSUFBQSxHQUFPLEdBQUcsQ0FBRSxRQUFGLEVBQWxCOztVQUVRLEtBQUssQ0FBQyxJQUFOLENBQVcsSUFBWDtRQUhGO1FBSUEsS0FBSyxDQUFDLElBQU4sQ0FBVyxTQUFBLEdBQVksQ0FBRSxDQUFBLENBQUEsQ0FBQSxDQUFJLEtBQUosQ0FBQSxDQUFBLENBQUYsRUFBZ0IsR0FBQSxLQUFoQixDQUF2QjtNQVBGO01BUUEsSUFBQSxDQUFLLEtBQUssQ0FBQyxRQUFOLENBQUEsQ0FBTDtJQWhCRixDQWJGOztXQStCRztFQWhDb0IsRUFsR3ZCOzs7RUFxSUEscUJBQUEsR0FBd0IsUUFBQSxDQUFFLEtBQUYsQ0FBQTtBQUN4QixRQUFBO0lBQUUsR0FBQSxHQUFRLElBQUksTUFBSixDQUFBO0lBQ1IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxnQkFBUixDQUF5QixLQUF6QjtXQUNDO0VBSHFCLEVBckl4Qjs7O0VBMklBLG1CQUFBLEdBQXNCLFFBQUEsQ0FBRSxLQUFGLENBQUE7QUFDdEIsUUFBQSxHQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUE7SUFBRSxHQUFBLEdBQVEsT0FBQSxDQUFRLG9CQUFSO0lBQ1IsR0FBQSxHQUFRLElBQUksTUFBSixDQUFBO0lBQ1IsSUFBQSxHQUFRLFFBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBQTtNQUFZLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBZixDQUFxQixHQUFBLENBQXJCO2FBQXVEO0lBQW5FO0lBQ1IsS0FBQSxHQUFRLFFBQUEsQ0FBQSxHQUFFLENBQUYsQ0FBQTtNQUFZLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBZixDQUFxQixHQUFBLENBQXJCO01BQTJCLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBZixDQUFxQixJQUFyQjthQUE0QjtJQUFuRTtJQUNSLElBQUEsR0FBUSxRQUFBLENBQUEsR0FBRSxDQUFGLENBQUE7TUFBWSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQWYsQ0FBcUIsR0FBQSxDQUFyQjthQUF1RDtJQUFuRTtJQUNSLEtBQUEsR0FBUSxRQUFBLENBQUEsR0FBRSxDQUFGLENBQUE7TUFBWSxPQUFPLENBQUMsTUFBTSxDQUFDLEtBQWYsQ0FBcUIsR0FBQSxDQUFyQjtNQUEyQixPQUFPLENBQUMsTUFBTSxDQUFDLEtBQWYsQ0FBcUIsSUFBckI7YUFBNEI7SUFBbkUsRUFMVjs7SUFPRSxJQUFHLENBQU0sYUFBTixDQUFBLElBQWtCLENBQUUsS0FBQSxLQUFTLEVBQVgsQ0FBckI7TUFDRSxLQUFBLENBQU0sT0FBQSxDQUFRLEdBQUEsQ0FBSSw4QkFBSixDQUFSLENBQU47TUFDQSxPQUFPLENBQUMsSUFBUixDQUFhLEdBQWI7QUFDQSxhQUFPLEtBSFQ7O0lBSUEsSUFBQSxHQUFRLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBUixDQUFnQixLQUFoQixFQVhWOztJQWFFLElBQUEsQ0FBSyxHQUFHLENBQUMsU0FBSixDQUFjOzs7Ozs7QUFBSTtBQUFBO1FBQUEsS0FBQSxxQ0FBQTs7dUJBQUEsTUFBTSxDQUFDO1FBQVAsQ0FBQTs7VUFBSjtLQUFkLENBQUw7SUFDQSxJQUFBLENBQUssR0FBRyxDQUFDLFNBQUosQ0FBYyxJQUFkLENBQUw7V0FDQztFQWhCbUIsRUEzSXRCOzs7RUE4SkEseUJBQUEsR0FBNEIsUUFBQSxDQUFBLENBQUE7QUFDNUIsUUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxHQUFBLEVBQUE7SUFBRSxHQUFBLEdBQVEsSUFBSSxNQUFKLENBQVc7TUFBRSxPQUFBLEVBQVM7SUFBWCxDQUFYO0lBQ1IsSUFBQSxHQUFRLENBQUEsaUJBQUE7SUFHUixJQUFBLEdBQVksQ0FBRSxHQUFBLENBQUUsSUFBSSxHQUFKLENBQVEsQ0FBRSxLQUFLLENBQUMsSUFBTixDQUFXLElBQUksQ0FBQyxPQUFMLENBQWEsS0FBYixFQUFvQixFQUFwQixDQUFYLENBQUYsQ0FBcUMsQ0FBQyxJQUF0QyxDQUFBLENBQVIsQ0FBRixDQUFGO0lBQ1osS0FBQSxDQUFNLGFBQU4sRUFBcUIsSUFBckI7SUFDQSxJQUFBOztBQUFjO01BQUEsS0FBQSxzQ0FBQTs7cUJBQUEsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsQ0FBaEI7TUFBQSxDQUFBOzs7SUFDZCxTQUFBLEdBQVksR0FBRyxDQUFBLHFDQUFBLENBQUEsQ0FBd0MsR0FBQSxDQUFJLElBQUosQ0FBeEMsRUFBQTtJQUNmLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQVIsQ0FBeUIsU0FBekI7SUFDQSxHQUFHLENBQUMsR0FBRyxDQUFDLGdCQUFSLENBQXlCLEdBQUcsQ0FBQSw4QkFBQSxDQUE1QjtJQUNBLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQVIsQ0FBeUIsR0FBRyxDQUFBLDJEQUFBLENBQTVCLEVBQTJGO01BQUUsR0FBQSxFQUFLLElBQUksQ0FBRSxDQUFGO0lBQVgsQ0FBM0Y7V0FDQztFQVp5QixFQTlKNUI7OztFQThLQSxNQUFNLENBQUMsT0FBUCxHQUFpQixDQUFFLG9CQUFGLEVBQXdCLHFCQUF4QixFQUErQyxtQkFBL0MsRUE5S2pCOzs7RUFrTEEsSUFBRyxNQUFBLEtBQVUsT0FBTyxDQUFDLElBQXJCO0lBQWtDLENBQUEsQ0FBQSxDQUFBLEdBQUEsRUFBQTs7OzthQUloQyx5QkFBQSxDQUFBO0lBSmdDLENBQUEsSUFBbEM7OztFQWxMQTs7Ozs7Ozs7Ozs7O0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuJ3VzZSBzdHJpY3QnXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuR1VZICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2d1eSdcbnsgYWxlcnRcbiAgZGVidWdcbiAgaGVscFxuICBpbmZvXG4gIHBsYWluXG4gIHByYWlzZVxuICB1cmdlXG4gIHdhcm5cbiAgd2hpc3BlciB9ICAgICAgICAgICAgICAgPSBHVVkudHJtLmdldF9sb2dnZXJzICdqaXp1cmEtc291cmNlcy1kYidcbnsgcnByXG4gIGluc3BlY3RcbiAgZWNob1xuICB3aGl0ZVxuICBncmVlblxuICBibHVlXG4gIGxpbWVcbiAgZ29sZFxuICBncmV5XG4gIHJlZFxuICBib2xkXG4gIHJldmVyc2VcbiAgbG9nICAgICB9ICAgICAgICAgICAgICAgPSBHVVkudHJtXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblNGTU9EVUxFUyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9icmljYWJyYWMtc2Ztb2R1bGVzJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG57IFNRTCxcbiAgSUROLFxuICBMSVQsXG4gIFZFQyxcbiAgZnJvbV9ib29sLFxuICBhc19ib29sLCAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2RicmljKClcbnsgSml6dXJhLCAgICAgICAgICAgICAgIH0gPSByZXF1aXJlICcuL21haW4nXG57IFRhYmxlLCB9ICAgICAgICAgICAgICAgID0gU0ZNT0RVTEVTLnJlcXVpcmVfY2xpX3RhYmxlM2EoKVxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG57IGYsICAgICAgICAgICAgICAgICAgICB9ID0gcmVxdWlyZSAnZWZmc3RyaW5nJ1xuXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIyNcblxub29vb29vb29vby4gICBvb29vb29vb29vb28gb29vICAgICAgICBvb29vbyAgIC5vb29vb28uXG5gODg4JyAgIGBZOGIgIGA4ODgnICAgICBgOCBgODguICAgICAgIC44ODgnICBkOFAnICBgWThiXG4gODg4ICAgICAgODg4ICA4ODggICAgICAgICAgODg4YiAgICAgZCc4ODggIDg4OCAgICAgIDg4OFxuIDg4OCAgICAgIDg4OCAgODg4b29vbzggICAgIDggWTg4LiAuUCAgODg4ICA4ODggICAgICA4ODhcbiA4ODggICAgICA4ODggIDg4OCAgICBcIiAgICAgOCAgYDg4OCcgICA4ODggIDg4OCAgICAgIDg4OFxuIDg4OCAgICAgZDg4JyAgODg4ICAgICAgIG8gIDggICAgWSAgICAgODg4ICBgODhiICAgIGQ4OCdcbm84ODhib29kOFAnICAgbzg4OG9vb29vb2Q4IG84byAgICAgICAgbzg4OG8gIGBZOGJvb2Q4UCdcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIyMjXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmRlbW8gPSAtPlxuICBqenIgPSBuZXcgSml6dXJhKClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjIGp6ci5fc2hvd19qenJfbWV0YV91Y19ub3JtYWxpemF0aW9uX2ZhdWx0cygpXG4gIGp6ci5zaG93X2NvdW50cygpXG4gIGp6ci5zaG93X2p6cl9tZXRhX2ZhdWx0cygpXG4gICMgdjpjOnJlYWRpbmc6amEteC1IaXJcbiAgIyB2OmM6cmVhZGluZzpqYS14LUthdFxuICBpZiBmYWxzZVxuICAgIHNlZW4gPSBuZXcgU2V0KClcbiAgICBmb3IgeyByZWFkaW5nLCB9IGZyb20ganpyLmRiYS53YWxrIFNRTFwic2VsZWN0IGRpc3RpbmN0KCBvICkgYXMgcmVhZGluZyBmcm9tIGp6cl90cmlwbGVzIHdoZXJlIHYgPSAndjpjOnJlYWRpbmc6amEteC1LYXQnIG9yZGVyIGJ5IG87XCJcbiAgICAgIGZvciBwYXJ0IGluICggcmVhZGluZy5zcGxpdCAvKC7jg7x8LuODo3wu44OlfC7jg6d844ODLnwuKS92ICkgd2hlbiBwYXJ0IGlzbnQgJydcbiAgICAgICAgY29udGludWUgaWYgc2Vlbi5oYXMgcGFydFxuICAgICAgICBzZWVuLmFkZCBwYXJ0XG4gICAgICAgIGVjaG8gcGFydFxuICAgIGZvciB7IHJlYWRpbmcsIH0gZnJvbSBqenIuZGJhLndhbGsgU1FMXCJzZWxlY3QgZGlzdGluY3QoIG8gKSBhcyByZWFkaW5nIGZyb20ganpyX3RyaXBsZXMgd2hlcmUgdiA9ICd2OmM6cmVhZGluZzpqYS14LUhpcicgb3JkZXIgYnkgbztcIlxuICAgICAgZm9yIHBhcnQgaW4gKCByZWFkaW5nLnNwbGl0IC8oLuODvHwu44KDfC7jgoV8LuOCh3zjgaMufC4pL3YgKSB3aGVuIHBhcnQgaXNudCAnJ1xuICAgICAgIyBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLyguKS92ICkgd2hlbiBwYXJ0IGlzbnQgJydcbiAgICAgICAgY29udGludWUgaWYgc2Vlbi5oYXMgcGFydFxuICAgICAgICBzZWVuLmFkZCBwYXJ0XG4gICAgICAgIGVjaG8gcGFydFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIDtudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZGVtb19yZWFkX2R1bXAgPSAtPlxuICB7IEJlbmNobWFya2VyLCAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfYmVuY2htYXJraW5nKClcbiAgIyB7IG5hbWVpdCwgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfbmFtZWl0KClcbiAgYmVuY2htYXJrZXIgPSBuZXcgQmVuY2htYXJrZXIoKVxuICB0aW1laXQgPSAoIFAuLi4gKSAtPiBiZW5jaG1hcmtlci50aW1laXQgUC4uLlxuICB7IFVuZHVtcGVyLCAgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfc3FsaXRlX3VuZHVtcGVyKClcbiAgeyB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zLCAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2Zhc3RfbGluZXJlYWRlcigpXG4gIHsgd2MsICAgICAgICAgICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV93YygpXG4gIHBhdGggICAgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4vanpyLmR1bXAuc3FsJ1xuICBqenIgPSBuZXcgSml6dXJhKClcbiAganpyLmRiYS50ZWFyZG93biB7IHRlc3Q6ICcqJywgfVxuICBkZWJ1ZyAnzqlqenJzZGJfX18xJywgVW5kdW1wZXIudW5kdW1wIHsgZGI6IGp6ci5kYmEsIHBhdGgsIG1vZGU6ICdmYXN0JywgfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGp6ci5zaG93X2NvdW50cygpXG4gIGp6ci5zaG93X2p6cl9tZXRhX2ZhdWx0cygpXG4gIDtudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZGVtb19zaG93X2FsbF90YWJsZXMgPSAoeyByZWJ1aWxkID0gZmFsc2UsIHJvd3MgPSAxMCwgfT17fSkgLT5cbiAganpyID0gbmV3IEppenVyYSB7IHJlYnVpbGQsIH1cbiAgcmVsYXRpb25zID0ge31cbiAgZm9yIHsgbmFtZSwgdHlwZSwgfSBmcm9tIGp6ci5kYmEud2FsayBTUUxcIlwiXCJcbiAgICBzZWxlY3QgbmFtZSwgdHlwZVxuICAgIGZyb20gc3FsaXRlX3NjaGVtYVxuICAgIHdoZXJlIHR5cGUgaW4gKCAndGFibGUnLCAndmlldycgKVxuICAgIC0tIG9yZGVyIGJ5IG5hbWVcbiAgICA7XCJcIlwiXG4gICAgY29udGludWUgaWYgbmFtZS5zdGFydHNXaXRoICdzdGRfJ1xuICAgIGNvbnRpbnVlIGlmIG5hbWUuc3RhcnRzV2l0aCAnX2p6cl9tZXRhXydcbiAgICBjb250aW51ZSBpZiBuYW1lLnN0YXJ0c1dpdGggJ2p6cl9tZXRhXydcbiAgICByZWxhdGlvbnNbIG5hbWUgXSA9IHR5cGVcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBmb3IgcmVsYXRpb25fbmFtZSwgcmVsYXRpb25fdHlwZSBvZiByZWxhdGlvbnNcbiAgICByb3dfY291bnQgICA9ICgganpyLmRiYS5nZXRfZmlyc3QgU1FMXCJzZWxlY3QgY291bnQoKikgYXMgY291bnQgZnJvbSAje3JlbGF0aW9uX25hbWV9O1wiICkuY291bnRcbiAgICBzdGF0ZW1lbnQgICA9IGp6ci5kYmEucHJlcGFyZSBTUUxcIlwiXCJzZWxlY3QgKiBmcm9tICN7cmVsYXRpb25fbmFtZX0gb3JkZXIgYnkgcmFuZG9tKCkgbGltaXQgJHJvd3M7XCJcIlwiXG4gICAgY29sX25hbWVzICAgPSAoIGNvbHVtbi5uYW1lIGZvciBjb2x1bW4gaW4ganpyLmRiYS5zdGF0ZS5jb2x1bW5zIClcbiAgICBjYXB0aW9uICAgICA9IGZcIiN7cmVsYXRpb25fdHlwZX0gI3tyZWxhdGlvbl9uYW1lfSAoI3tyb3dfY291bnR9OiwuMGY7IHJvd3MpXCJcbiAgICB0YWJsZSAgICAgICA9IG5ldyBUYWJsZSB7IGNhcHRpb24sIGhlYWQ6IFsgJycsIGNvbF9uYW1lcy4uLiwgXSwgfVxuICAgIGNvdW50ICAgICAgID0gMFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZm9yIHJvdyBmcm9tIGp6ci5kYmEud2FsayBzdGF0ZW1lbnQsIHsgcm93cywgfVxuICAgICAgY291bnQrK1xuICAgICAgY2VsbHMgPSBbXVxuICAgICAgZm9yIGNvbF9uYW1lLCBjb2xfaWR4IGluIGNvbF9uYW1lc1xuICAgICAgICBjZWxsID0gcm93WyBjb2xfbmFtZSBdXG4gICAgICAgICMgY2VsbCA9IGNvbG9yIGNlbGwgaWYgKCBjb2xvciA9IGNvbF9jb2xvcnNbIGNvbF9pZHggXSApP1xuICAgICAgICBjZWxscy5wdXNoIGNlbGxcbiAgICAgIHRhYmxlLnB1c2ggdGFibGVfcm93ID0gWyBcIigje2NvdW50fSlcIiwgY2VsbHMuLi4sIF1cbiAgICBlY2hvIHRhYmxlLnRvU3RyaW5nKClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICA7bnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbm91dHB1dF9xdWVyeV9hc190YWJsZSA9ICggcXVlcnkgKSAtPlxuICBqenIgICA9IG5ldyBKaXp1cmEoKVxuICBqenIuZGJhLnRibF9lY2hvX2FzX3RleHQgcXVlcnlcbiAgO251bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5vdXRwdXRfcXVlcnlfYXNfY3N2ID0gKCBxdWVyeSApIC0+XG4gIENTViAgID0gcmVxdWlyZSAnY3N2LXN0cmluZ2lmeS9zeW5jJ1xuICBqenIgICA9IG5ldyBKaXp1cmEoKVxuICB3b3V0ICA9ICggUC4uLiApIC0+IHByb2Nlc3Muc3Rkb3V0LndyaXRlIFAuLi47ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDtudWxsXG4gIHdvdXRuID0gKCBQLi4uICkgLT4gcHJvY2Vzcy5zdGRvdXQud3JpdGUgUC4uLjsgcHJvY2Vzcy5zdGRvdXQud3JpdGUgJ1xcbicgIDtudWxsXG4gIHdlcnIgID0gKCBQLi4uICkgLT4gcHJvY2Vzcy5zdGRlcnIud3JpdGUgUC4uLjsgICAgICAgICAgICAgICAgICAgICAgICAgICAgO251bGxcbiAgd2Vycm4gPSAoIFAuLi4gKSAtPiBwcm9jZXNzLnN0ZGVyci53cml0ZSBQLi4uOyBwcm9jZXNzLnN0ZGVyci53cml0ZSAnXFxuJyAgO251bGxcbiAgIyBxdWVyeSA9IHByb2Nlc3MuYXJndlsgMiBdID8gbnVsbFxuICBpZiAoIG5vdCBxdWVyeT8gKSBvciAoIHF1ZXJ5IGlzICcnIClcbiAgICB3ZXJybiByZXZlcnNlIHJlZCBcIiDOqWp6cnNkYl9fXzIgbm8gcXVlcnkgZ2l2ZW4gXCJcbiAgICBwcm9jZXNzLmV4aXQgMTExXG4gICAgcmV0dXJuIG51bGxcbiAgcm93cyAgPSBqenIuZGJhLmdldF9hbGwgcXVlcnlcbiAgIyB3b3V0biBjbGlfY29tbWFuZHMudXNlX3BzcGdcbiAgd291dCBDU1Yuc3RyaW5naWZ5IFsgKCBjb2x1bW4ubmFtZSBmb3IgY29sdW1uIGluIGp6ci5kYmEuc3RhdGUuY29sdW1ucyApLCBdXG4gIHdvdXQgQ1NWLnN0cmluZ2lmeSByb3dzXG4gIDtudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZGVtb19zaG93X3RvZnVfY2hhcmFjdGVycyA9IC0+XG4gIGp6ciAgID0gbmV3IEppenVyYSB7IHJlYnVpbGQ6IGZhbHNlLCB9XG4gIGNocnMgID0gXCJcIlwiXG4gICAg8KSsk+K/sfCojp7wopq+8KqIjvCkuYnwqoaF8KatmPClo4hcbiAgICBcIlwiXCJcbiAgY2hycyAgICAgID0gWyAoIG5ldyBTZXQgKCBBcnJheS5mcm9tIGNocnMucmVwbGFjZSAvXFxzKy8sICcnICkuc29ydCgpICkuLi4sIF1cbiAgZGVidWcgJ86panpyc2RiX19fMScsIGNocnNcbiAgY2lkcyAgICAgID0gKCBjaHIuY29kZVBvaW50QXQgMCBmb3IgY2hyIGluIGNocnMgKVxuICBzdGF0ZW1lbnQgPSBTUUxcInNlbGVjdCAqIGZyb20ganpyX3RyaXBsZXMgd2hlcmUgcyBpbiAje1ZFQyBjaHJzfTtcIlxuICBqenIuZGJhLnRibF9lY2hvX2FzX3RleHQgc3RhdGVtZW50XG4gIGp6ci5kYmEudGJsX2VjaG9fYXNfdGV4dCBTUUxcInNlbGVjdCAqIGZyb20ganpyX2dseXBocmFuZ2VzO1wiXG4gIGp6ci5kYmEudGJsX2VjaG9fYXNfdGV4dCBTUUxcInNlbGVjdCAqIGZyb20ganpyX2dseXBocmFuZ2VzIHdoZXJlICRjaWQgYmV0d2VlbiBsbyBhbmQgaGk7XCIsIHsgY2lkOiBjaWRzWyAwIF0sIH1cbiAgO251bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbm1vZHVsZS5leHBvcnRzID0geyBkZW1vX3Nob3dfYWxsX3RhYmxlcywgb3V0cHV0X3F1ZXJ5X2FzX3RhYmxlLCBvdXRwdXRfcXVlcnlfYXNfY3N2LCB9XG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5pZiBtb2R1bGUgaXMgcmVxdWlyZS5tYWluIHRoZW4gZG8gPT5cbiAgIyBkZW1vX3JlYWRfZHVtcCgpXG4gICMgZGVtbygpXG4gICMgZGVtb19zaG93X2FsbF90YWJsZXMoKVxuICBkZW1vX3Nob3dfdG9mdV9jaGFyYWN0ZXJzKClcbiAgIyBkZW1vX2Nzdl9vdXRwdXQoKVxuICAjIDtudWxsXG5cblxuICAjIGNmZyA9XG4gICMgICBoZWFkOiBBcnJheS5mcm9tICdhYmNkZWZnaGlqa2xtbm8nXG4gICMgICAjIGNvbFdpZHRoczogWyAxMCwgMjAsIF1cbiAgIyB0YWJsZSA9IG5ldyBUYWJsZSBjZmdcbiAgIyAjIHRhYmxlLnB1c2ggWydGaXJzdCB2YWx1ZSAxJywgJ1NlY29uZCB2YWx1ZSAyJ10sIFsnRmlyc3QgdmFsdWUgMycsICdTZWNvbmQgdmFsdWUgNCddXG4gICMgIyB0YWJsZS5wdXNoIFsgeyBhOiAnQScsIGI6ICdCJywgYzogJ0MnLCB9IF1cbiAgIyB0YWJsZS5wdXNoIFsgJ0EnLCB7IGY6IDcsIH0sIHVuZGVmaW5lZCwgNDIzNDIzNDIzNDIyMTIyNDM0LCBdXG4gICMgIyBlY2hvIHRhYmxlXG4gICMgZWNobyB0YWJsZS50b1N0cmluZygpXG4iXX0=
