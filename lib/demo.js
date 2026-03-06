(function() {
  'use strict';
  var GUY, IDN, Jizura, LIT, SFMODULES, SQL, Table, VEC, alert, as_bool, blue, bold, debug, demo, demo_read_dump, demo_show_all_tables, demo_show_tofu_characters, echo, f, from_bool, gold, green, grey, help, info, inspect, lime, log, output_query_as_csv, plain, praise, red, reverse, rpr, urge, warn, whisper, white;

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
  module.exports = {demo_show_all_tables, output_query_as_csv};

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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2RlbW8uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsY0FBQSxFQUFBLG9CQUFBLEVBQUEseUJBQUEsRUFBQSxJQUFBLEVBQUEsQ0FBQSxFQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxJQUFBLEVBQUEsR0FBQSxFQUFBLG1CQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxLQUFBOzs7RUFHQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixDQUFBLENBQUUsS0FBRixFQUNFLEtBREYsRUFFRSxJQUZGLEVBR0UsSUFIRixFQUlFLEtBSkYsRUFLRSxNQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxPQVJGLENBQUEsR0FRNEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFSLENBQW9CLG1CQUFwQixDQVI1Qjs7RUFTQSxDQUFBLENBQUUsR0FBRixFQUNFLE9BREYsRUFFRSxJQUZGLEVBR0UsS0FIRixFQUlFLEtBSkYsRUFLRSxJQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxJQVJGLEVBU0UsR0FURixFQVVFLElBVkYsRUFXRSxPQVhGLEVBWUUsR0FaRixDQUFBLEdBWTRCLEdBQUcsQ0FBQyxHQVpoQyxFQWJBOzs7RUEyQkEsU0FBQSxHQUE0QixPQUFBLENBQVEsMkJBQVIsRUEzQjVCOzs7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UixJQUFBLEdBQVksQ0FBRSxHQUFBLENBQUUsSUFBSSxHQUFKLENBQVEsQ0FBRSxLQUFLLENBQUMsSUFBTixDQUFXLElBQUksQ0FBQyxPQUFMLENBQWEsS0FBYixFQUFvQixFQUFwQixDQUFYLENBQUYsQ0FBcUMsQ0FBQyxJQUF0QyxDQUFBLENBQVIsQ0FBRixDQUFGO0lBQ1osS0FBQSxDQUFNLGFBQU4sRUFBcUIsSUFBckI7SUFDQSxJQUFBOztBQUFjO01BQUEsS0FBQSxzQ0FBQTs7cUJBQUEsR0FBRyxDQUFDLFdBQUosQ0FBZ0IsQ0FBaEI7TUFBQSxDQUFBOzs7SUFDZCxTQUFBLEdBQVksR0FBRyxDQUFBLHFDQUFBLENBQUEsQ0FBd0MsR0FBQSxDQUFJLElBQUosQ0FBeEMsRUFBQTtJQUNmLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQVIsQ0FBeUIsU0FBekI7SUFDQSxHQUFHLENBQUMsR0FBRyxDQUFDLGdCQUFSLENBQXlCLEdBQUcsQ0FBQSw4QkFBQSxDQUE1QjtJQUNBLEdBQUcsQ0FBQyxHQUFHLENBQUMsZ0JBQVIsQ0FBeUIsR0FBRyxDQUFBLDJEQUFBLENBQTVCLEVBQTJGO01BQUUsR0FBQSxFQUFLLElBQUksQ0FBRSxDQUFGO0lBQVgsQ0FBM0Y7V0FDQztFQVp5QixFQXhKNUI7OztFQXdLQSxNQUFNLENBQUMsT0FBUCxHQUFpQixDQUFFLG9CQUFGLEVBQXdCLG1CQUF4QixFQXhLakI7OztFQTRLQSxJQUFHLE1BQUEsS0FBVSxPQUFPLENBQUMsSUFBckI7SUFBa0MsQ0FBQSxDQUFBLENBQUEsR0FBQSxFQUFBOzs7O2FBSWhDLHlCQUFBLENBQUE7SUFKZ0MsQ0FBQSxJQUFsQzs7O0VBNUtBOzs7Ozs7Ozs7Ozs7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCdcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5HVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xueyBhbGVydFxuICBkZWJ1Z1xuICBoZWxwXG4gIGluZm9cbiAgcGxhaW5cbiAgcHJhaXNlXG4gIHVyZ2VcbiAgd2FyblxuICB3aGlzcGVyIH0gICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ2ppenVyYS1zb3VyY2VzLWRiJ1xueyBycHJcbiAgaW5zcGVjdFxuICBlY2hvXG4gIHdoaXRlXG4gIGdyZWVuXG4gIGJsdWVcbiAgbGltZVxuICBnb2xkXG4gIGdyZXlcbiAgcmVkXG4gIGJvbGRcbiAgcmV2ZXJzZVxuICBsb2cgICAgIH0gICAgICAgICAgICAgICA9IEdVWS50cm1cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuU0ZNT0RVTEVTICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2JyaWNhYnJhYy1zZm1vZHVsZXMnXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnsgU1FMLFxuICBJRE4sXG4gIExJVCxcbiAgVkVDLFxuICBmcm9tX2Jvb2wsXG4gIGFzX2Jvb2wsICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZGJyaWMoKVxueyBKaXp1cmEsICAgICAgICAgICAgICAgfSA9IHJlcXVpcmUgJy4vbWFpbidcbnsgVGFibGUsIH0gICAgICAgICAgICAgICAgPSBTRk1PRFVMRVMucmVxdWlyZV9jbGlfdGFibGUzYSgpXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnsgZiwgICAgICAgICAgICAgICAgICAgIH0gPSByZXF1aXJlICdlZmZzdHJpbmcnXG5cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiMjI1xuXG5vb29vb29vb29vLiAgIG9vb29vb29vb29vbyBvb28gICAgICAgIG9vb29vICAgLm9vb29vby5cbmA4ODgnICAgYFk4YiAgYDg4OCcgICAgIGA4IGA4OC4gICAgICAgLjg4OCcgIGQ4UCcgIGBZOGJcbiA4ODggICAgICA4ODggIDg4OCAgICAgICAgICA4ODhiICAgICBkJzg4OCAgODg4ICAgICAgODg4XG4gODg4ICAgICAgODg4ICA4ODhvb29vOCAgICAgOCBZODguIC5QICA4ODggIDg4OCAgICAgIDg4OFxuIDg4OCAgICAgIDg4OCAgODg4ICAgIFwiICAgICA4ICBgODg4JyAgIDg4OCAgODg4ICAgICAgODg4XG4gODg4ICAgICBkODgnICA4ODggICAgICAgbyAgOCAgICBZICAgICA4ODggIGA4OGIgICAgZDg4J1xubzg4OGJvb2Q4UCcgICBvODg4b29vb29vZDggbzhvICAgICAgICBvODg4byAgYFk4Ym9vZDhQJ1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAjIyNcbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZGVtbyA9IC0+XG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMganpyLl9zaG93X2p6cl9tZXRhX3VjX25vcm1hbGl6YXRpb25fZmF1bHRzKClcbiAganpyLnNob3dfY291bnRzKClcbiAganpyLnNob3dfanpyX21ldGFfZmF1bHRzKClcbiAgIyB2OmM6cmVhZGluZzpqYS14LUhpclxuICAjIHY6YzpyZWFkaW5nOmphLXgtS2F0XG4gIGlmIGZhbHNlXG4gICAgc2VlbiA9IG5ldyBTZXQoKVxuICAgIGZvciB7IHJlYWRpbmcsIH0gZnJvbSBqenIuZGJhLndhbGsgU1FMXCJzZWxlY3QgZGlzdGluY3QoIG8gKSBhcyByZWFkaW5nIGZyb20ganpyX3RyaXBsZXMgd2hlcmUgdiA9ICd2OmM6cmVhZGluZzpqYS14LUthdCcgb3JkZXIgYnkgbztcIlxuICAgICAgZm9yIHBhcnQgaW4gKCByZWFkaW5nLnNwbGl0IC8oLuODvHwu44OjfC7jg6V8LuODp3zjg4MufC4pL3YgKSB3aGVuIHBhcnQgaXNudCAnJ1xuICAgICAgICBjb250aW51ZSBpZiBzZWVuLmhhcyBwYXJ0XG4gICAgICAgIHNlZW4uYWRkIHBhcnRcbiAgICAgICAgZWNobyBwYXJ0XG4gICAgZm9yIHsgcmVhZGluZywgfSBmcm9tIGp6ci5kYmEud2FsayBTUUxcInNlbGVjdCBkaXN0aW5jdCggbyApIGFzIHJlYWRpbmcgZnJvbSBqenJfdHJpcGxlcyB3aGVyZSB2ID0gJ3Y6YzpyZWFkaW5nOmphLXgtSGlyJyBvcmRlciBieSBvO1wiXG4gICAgICBmb3IgcGFydCBpbiAoIHJlYWRpbmcuc3BsaXQgLygu44O8fC7jgoN8LuOChXwu44KHfOOBoy58LikvdiApIHdoZW4gcGFydCBpc250ICcnXG4gICAgICAjIGZvciBwYXJ0IGluICggcmVhZGluZy5zcGxpdCAvKC4pL3YgKSB3aGVuIHBhcnQgaXNudCAnJ1xuICAgICAgICBjb250aW51ZSBpZiBzZWVuLmhhcyBwYXJ0XG4gICAgICAgIHNlZW4uYWRkIHBhcnRcbiAgICAgICAgZWNobyBwYXJ0XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgO251bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5kZW1vX3JlYWRfZHVtcCA9IC0+XG4gIHsgQmVuY2htYXJrZXIsICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9iZW5jaG1hcmtpbmcoKVxuICAjIHsgbmFtZWl0LCAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9uYW1laXQoKVxuICBiZW5jaG1hcmtlciA9IG5ldyBCZW5jaG1hcmtlcigpXG4gIHRpbWVpdCA9ICggUC4uLiApIC0+IGJlbmNobWFya2VyLnRpbWVpdCBQLi4uXG4gIHsgVW5kdW1wZXIsICAgICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMucmVxdWlyZV9zcWxpdGVfdW5kdW1wZXIoKVxuICB7IHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMsICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcbiAgeyB3YywgICAgICAgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX3djKClcbiAgcGF0aCAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEgucmVzb2x2ZSBfX2Rpcm5hbWUsICcuLi9qenIuZHVtcC5zcWwnXG4gIGp6ciA9IG5ldyBKaXp1cmEoKVxuICBqenIuZGJhLnRlYXJkb3duIHsgdGVzdDogJyonLCB9XG4gIGRlYnVnICfOqWp6cnNkYl9fXzEnLCBVbmR1bXBlci51bmR1bXAgeyBkYjoganpyLmRiYSwgcGF0aCwgbW9kZTogJ2Zhc3QnLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAganpyLnNob3dfY291bnRzKClcbiAganpyLnNob3dfanpyX21ldGFfZmF1bHRzKClcbiAgO251bGxcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5kZW1vX3Nob3dfYWxsX3RhYmxlcyA9ICh7IHJlYnVpbGQgPSBmYWxzZSwgcm93cyA9IDEwLCB9PXt9KSAtPlxuICBqenIgPSBuZXcgSml6dXJhIHsgcmVidWlsZCwgfVxuICByZWxhdGlvbnMgPSB7fVxuICBmb3IgeyBuYW1lLCB0eXBlLCB9IGZyb20ganpyLmRiYS53YWxrIFNRTFwiXCJcIlxuICAgIHNlbGVjdCBuYW1lLCB0eXBlXG4gICAgZnJvbSBzcWxpdGVfc2NoZW1hXG4gICAgd2hlcmUgdHlwZSBpbiAoICd0YWJsZScsICd2aWV3JyApXG4gICAgLS0gb3JkZXIgYnkgbmFtZVxuICAgIDtcIlwiXCJcbiAgICBjb250aW51ZSBpZiBuYW1lLnN0YXJ0c1dpdGggJ3N0ZF8nXG4gICAgY29udGludWUgaWYgbmFtZS5zdGFydHNXaXRoICdfanpyX21ldGFfJ1xuICAgIGNvbnRpbnVlIGlmIG5hbWUuc3RhcnRzV2l0aCAnanpyX21ldGFfJ1xuICAgIHJlbGF0aW9uc1sgbmFtZSBdID0gdHlwZVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGZvciByZWxhdGlvbl9uYW1lLCByZWxhdGlvbl90eXBlIG9mIHJlbGF0aW9uc1xuICAgIHJvd19jb3VudCAgID0gKCBqenIuZGJhLmdldF9maXJzdCBTUUxcInNlbGVjdCBjb3VudCgqKSBhcyBjb3VudCBmcm9tICN7cmVsYXRpb25fbmFtZX07XCIgKS5jb3VudFxuICAgIHN0YXRlbWVudCAgID0ganpyLmRiYS5wcmVwYXJlIFNRTFwiXCJcInNlbGVjdCAqIGZyb20gI3tyZWxhdGlvbl9uYW1lfSBvcmRlciBieSByYW5kb20oKSBsaW1pdCAkcm93cztcIlwiXCJcbiAgICBjb2xfbmFtZXMgICA9ICggY29sdW1uLm5hbWUgZm9yIGNvbHVtbiBpbiBqenIuZGJhLnN0YXRlLmNvbHVtbnMgKVxuICAgIGNhcHRpb24gICAgID0gZlwiI3tyZWxhdGlvbl90eXBlfSAje3JlbGF0aW9uX25hbWV9ICgje3Jvd19jb3VudH06LC4wZjsgcm93cylcIlxuICAgIHRhYmxlICAgICAgID0gbmV3IFRhYmxlIHsgY2FwdGlvbiwgaGVhZDogWyAnJywgY29sX25hbWVzLi4uLCBdLCB9XG4gICAgY291bnQgICAgICAgPSAwXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBmb3Igcm93IGZyb20ganpyLmRiYS53YWxrIHN0YXRlbWVudCwgeyByb3dzLCB9XG4gICAgICBjb3VudCsrXG4gICAgICBjZWxscyA9IFtdXG4gICAgICBmb3IgY29sX25hbWUsIGNvbF9pZHggaW4gY29sX25hbWVzXG4gICAgICAgIGNlbGwgPSByb3dbIGNvbF9uYW1lIF1cbiAgICAgICAgIyBjZWxsID0gY29sb3IgY2VsbCBpZiAoIGNvbG9yID0gY29sX2NvbG9yc1sgY29sX2lkeCBdICk/XG4gICAgICAgIGNlbGxzLnB1c2ggY2VsbFxuICAgICAgdGFibGUucHVzaCB0YWJsZV9yb3cgPSBbIFwiKCN7Y291bnR9KVwiLCBjZWxscy4uLiwgXVxuICAgIGVjaG8gdGFibGUudG9TdHJpbmcoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIDtudWxsXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxub3V0cHV0X3F1ZXJ5X2FzX2NzdiA9ICggcXVlcnkgKSAtPlxuICBDU1YgICA9IHJlcXVpcmUgJ2Nzdi1zdHJpbmdpZnkvc3luYydcbiAganpyICAgPSBuZXcgSml6dXJhKClcbiAgd291dCAgPSAoIFAuLi4gKSAtPiBwcm9jZXNzLnN0ZG91dC53cml0ZSBQLi4uOyAgICAgICAgICAgICAgICAgICAgICAgICAgICA7bnVsbFxuICB3b3V0biA9ICggUC4uLiApIC0+IHByb2Nlc3Muc3Rkb3V0LndyaXRlIFAuLi47IHByb2Nlc3Muc3Rkb3V0LndyaXRlICdcXG4nICA7bnVsbFxuICB3ZXJyICA9ICggUC4uLiApIC0+IHByb2Nlc3Muc3RkZXJyLndyaXRlIFAuLi47ICAgICAgICAgICAgICAgICAgICAgICAgICAgIDtudWxsXG4gIHdlcnJuID0gKCBQLi4uICkgLT4gcHJvY2Vzcy5zdGRlcnIud3JpdGUgUC4uLjsgcHJvY2Vzcy5zdGRlcnIud3JpdGUgJ1xcbicgIDtudWxsXG4gICMgcXVlcnkgPSBwcm9jZXNzLmFyZ3ZbIDIgXSA/IG51bGxcbiAgaWYgKCBub3QgcXVlcnk/ICkgb3IgKCBxdWVyeSBpcyAnJyApXG4gICAgd2Vycm4gcmV2ZXJzZSByZWQgXCIgzqlqenJzZGJfX18yIG5vIHF1ZXJ5IGdpdmVuIFwiXG4gICAgcHJvY2Vzcy5leGl0IDExMVxuICAgIHJldHVybiBudWxsXG4gIHJvd3MgID0ganpyLmRiYS5nZXRfYWxsIHF1ZXJ5XG4gICMgd291dG4gY2xpX2NvbW1hbmRzLnVzZV9wc3BnXG4gIHdvdXQgQ1NWLnN0cmluZ2lmeSBbICggY29sdW1uLm5hbWUgZm9yIGNvbHVtbiBpbiBqenIuZGJhLnN0YXRlLmNvbHVtbnMgKSwgXVxuICB3b3V0IENTVi5zdHJpbmdpZnkgcm93c1xuICA7bnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmRlbW9fc2hvd190b2Z1X2NoYXJhY3RlcnMgPSAtPlxuICBqenIgICA9IG5ldyBKaXp1cmEgeyByZWJ1aWxkOiBmYWxzZSwgfVxuICBjaHJzICA9IFwiXCJcIlxuICAgIPCkrJPiv7HwqI6e8KKavvCqiI7wpLmJ8KqGhfCmrZjwpaOIXG4gICAgXCJcIlwiXG4gIGNocnMgICAgICA9IFsgKCBuZXcgU2V0ICggQXJyYXkuZnJvbSBjaHJzLnJlcGxhY2UgL1xccysvLCAnJyApLnNvcnQoKSApLi4uLCBdXG4gIGRlYnVnICfOqWp6cnNkYl9fXzEnLCBjaHJzXG4gIGNpZHMgICAgICA9ICggY2hyLmNvZGVQb2ludEF0IDAgZm9yIGNociBpbiBjaHJzIClcbiAgc3RhdGVtZW50ID0gU1FMXCJzZWxlY3QgKiBmcm9tIGp6cl90cmlwbGVzIHdoZXJlIHMgaW4gI3tWRUMgY2hyc307XCJcbiAganpyLmRiYS50YmxfZWNob19hc190ZXh0IHN0YXRlbWVudFxuICBqenIuZGJhLnRibF9lY2hvX2FzX3RleHQgU1FMXCJzZWxlY3QgKiBmcm9tIGp6cl9nbHlwaHJhbmdlcztcIlxuICBqenIuZGJhLnRibF9lY2hvX2FzX3RleHQgU1FMXCJzZWxlY3QgKiBmcm9tIGp6cl9nbHlwaHJhbmdlcyB3aGVyZSAkY2lkIGJldHdlZW4gbG8gYW5kIGhpO1wiLCB7IGNpZDogY2lkc1sgMCBdLCB9XG4gIDtudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5tb2R1bGUuZXhwb3J0cyA9IHsgZGVtb19zaG93X2FsbF90YWJsZXMsIG91dHB1dF9xdWVyeV9hc19jc3YsIH1cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmlmIG1vZHVsZSBpcyByZXF1aXJlLm1haW4gdGhlbiBkbyA9PlxuICAjIGRlbW9fcmVhZF9kdW1wKClcbiAgIyBkZW1vKClcbiAgIyBkZW1vX3Nob3dfYWxsX3RhYmxlcygpXG4gIGRlbW9fc2hvd190b2Z1X2NoYXJhY3RlcnMoKVxuICAjIGRlbW9fY3N2X291dHB1dCgpXG4gICMgO251bGxcblxuXG4gICMgY2ZnID1cbiAgIyAgIGhlYWQ6IEFycmF5LmZyb20gJ2FiY2RlZmdoaWprbG1ubydcbiAgIyAgICMgY29sV2lkdGhzOiBbIDEwLCAyMCwgXVxuICAjIHRhYmxlID0gbmV3IFRhYmxlIGNmZ1xuICAjICMgdGFibGUucHVzaCBbJ0ZpcnN0IHZhbHVlIDEnLCAnU2Vjb25kIHZhbHVlIDInXSwgWydGaXJzdCB2YWx1ZSAzJywgJ1NlY29uZCB2YWx1ZSA0J11cbiAgIyAjIHRhYmxlLnB1c2ggWyB7IGE6ICdBJywgYjogJ0InLCBjOiAnQycsIH0gXVxuICAjIHRhYmxlLnB1c2ggWyAnQScsIHsgZjogNywgfSwgdW5kZWZpbmVkLCA0MjM0MjM0MjM0MjIxMjI0MzQsIF1cbiAgIyAjIGVjaG8gdGFibGVcbiAgIyBlY2hvIHRhYmxlLnRvU3RyaW5nKClcbiJdfQ==
