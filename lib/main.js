(function() {
  'use strict';
  var Bsql3, Dbric, Dbric_phrases, GUY, PATH, SFMODULES, SQL, alert, blue, bold, debug, demo_read_lines_from_buffers, echo, gold, green, grey, help, info, inspect, internals, log, materialized_file_mirror, plain, praise, red, reverse, rpr, urge, warn, whisper, white, write_line_data_to_sqlitefs;

  //===========================================================================================================
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('jizura-sources-db'));

  ({rpr, inspect, echo, white, green, blue, gold, grey, red, bold, reverse, log} = GUY.trm);

  // { f }                     = require '../../hengist-NG/apps/effstring'
  // write                     = ( p ) -> process.stdout.write p
  // { nfa }                   = require '../../hengist-NG/apps/normalize-function-arguments'
  // GTNG                      = require '../../hengist-NG/apps/guy-test-NG'
  // { Test                  } = GTNG
  SFMODULES = require('../../hengist-NG/apps/bricabrac-sfmodules');

  // FS                        = require 'node:fs'
  PATH = require('node:path');

  //-----------------------------------------------------------------------------------------------------------
  ({Dbric, SQL, internals} = SFMODULES.unstable.require_dbric());

  Bsql3 = require('better-sqlite3');

  Dbric_phrases = (function() {
    //-----------------------------------------------------------------------------------------------------------

      //===========================================================================================================
    class Dbric_phrases extends Dbric {
      //---------------------------------------------------------------------------------------------------------
      initialize() {
        super.initialize();
        //.......................................................................................................
        this.create_table_function({
          name: 'split_words',
          columns: ['keyword'],
          parameters: ['line'],
          rows: function*(line) {
            var i, keyword, keywords, len;
            keywords = line.split(/(?:\p{Z}+)|((?:\p{Script=Han})|(?:\p{L}+)|(?:\p{N}+)|(?:\p{S}+))/v);
// debug 'Ωjzrsdb___5', line_nr, rpr keywords
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
        });
        //.......................................................................................................
        this.create_table_function({
          name: 'file_lines',
          columns: ['line_nr', 'line'],
          parameters: ['path'],
          rows: function*(path) {
            var eol, line, line_nr, x;
            for (x of GUY.fs.walk_lines_with_positions(path)) {
              ({
                lnr: line_nr,
                line,
                eol
              } = x);
              yield ({line_nr, line});
            }
            return null;
          }
        });
        //.......................................................................................................
        return null;
      }

    };

    Dbric_phrases.db_class = Bsql3;

    //---------------------------------------------------------------------------------------------------------
    Dbric_phrases.build = [
      //.......................................................................................................
      SQL`create table datasources (
dskey text unique not null primary key,
path text not null );`,
      //.......................................................................................................
      SQL`create table mirror (
  dskey   text    not null,
  line_nr integer not null,
  line    text    not null,
foreign key ( dskey ) references datasources ( dskey ),
primary key ( dskey, line_nr ) );`,
      //.......................................................................................................
      SQL`create table keywords (
  dskey   text    not null,
  line_nr integer not null,
  keyword text    not null,
foreign key ( dskey ) references datasources ( dskey ),
primary key ( dskey, line_nr, keyword ) );`
    ];

    //---------------------------------------------------------------------------------------------------------
    Dbric_phrases.statements = {
      //.......................................................................................................
      insert_datasource: SQL`insert into datasources ( dskey, path ) values ( $dskey, $path )
on conflict ( dskey ) do update set path = $path;`,
      //.......................................................................................................
      insert_keyword: SQL`insert into keywords ( dskey, line_nr, keyword ) values ( $dskey, $line_nr, $keyword )
on conflict ( dskey, line_nr, keyword ) do nothing;`,
      //.......................................................................................................
      select_from_datasources: SQL`select * from datasources order by dskey;`,
      select_from_mirror: SQL`select * from mirror order by dskey, line_nr;`,
      count_datasources: SQL`select count(*) as datasource_count  from datasources;`,
      count_mirror_lines: SQL`select count(*) as mirror_line_count from mirror;`,
      //.......................................................................................................
      select_from_keywords: SQL`select * from keywords order by keyword, dskey, line_nr;`,
      //.......................................................................................................
      locations_from_keyword: SQL`select * from keywords
where keyword = $keyword
order by keyword, dskey, line_nr;`,
      //.......................................................................................................
      lines_from_keyword: SQL`select
  kw.dskey    as dskey,
  kw.line_nr  as line_nr,
  kw.keyword  as keyword,
  mi.line     as line
from keywords as kw
join mirror   as mi using ( dskey, line_nr )
where keyword = $keyword
order by keyword, dskey, line_nr;`,
      //.......................................................................................................
      select_from_mirror: SQL`select * from mirror order by dskey;`,
      //.......................................................................................................
      populate_file_mirror: SQL`insert into mirror ( dskey, line_nr, line )
  select
    ds.dskey    as dskey,
    fl.line_nr  as line_nr,
    fl.line     as line
  from datasources        as ds
  left join mirror        as mi using ( dskey ),
  file_lines( ds.path )   as fl
  where true -- where clause just a syntactic guard as per https://sqlite.org/lang_upsert.html
  on conflict do update set line = excluded.line;`,
      //.......................................................................................................
      populate_keywords: SQL`insert into keywords ( dskey, line_nr, keyword )
  select
    ds.dskey    as dskey,
    mi.line_nr  as line_nr,
    sw.keyword  as keyword
  from datasources        as ds
  join mirror             as mi using ( dskey ),
  split_words( mi.line )  as sw
  where true -- where clause just a syntactic guard as per https://sqlite.org/lang_upsert.html
  on conflict do nothing;`
    };

    return Dbric_phrases;

  }).call(this);

  //===========================================================================================================
  materialized_file_mirror = function() {
    var db_path, phrases, row;
    db_path = '/dev/shm/bricabrac.sqlite';
    phrases = Dbric_phrases.open(db_path);
    debug('Ωjzrsdb___6', phrases.teardown());
    debug('Ωjzrsdb___7', phrases.rebuild());
    (() => {      //.........................................................................................................
      var dskey, path;
      dskey = 'humdum';
      path = PATH.resolve(__dirname, '../../hengist-NG/assets/bricabrac/humpty-dumpty.md');
      return phrases.statements.insert_datasource.run({dskey, path});
    })();
    (() => {      //.........................................................................................................
      var dskey, path;
      dskey = 'mng';
      path = PATH.resolve(__dirname, '../../../io/mingkwai-rack/jzrds/meaning/meanings.txt');
      return phrases.statements.insert_datasource.run({dskey, path});
    })();
    //.........................................................................................................
    debug('Ωjzrsdb___8', "populate_file_mirror: ", phrases.statements.populate_file_mirror.run());
    debug('Ωjzrsdb___9', "populate_keywords:    ", phrases.statements.populate_keywords.run());
    debug('Ωjzrsdb__10', "count_datasources:    ", phrases.statements.count_datasources.get());
    debug('Ωjzrsdb__11', "count_mirror_lines:   ", phrases.statements.count_mirror_lines.get());
    // echo(); echo row for row from phrases.statements.select_from_mirror.iterate()
    //.........................................................................................................
    echo();
    for (row of phrases.statements.locations_from_keyword.iterate({
      keyword: 'thought'
    })) {
      echo(row);
    }
    echo();
    for (row of phrases.statements.locations_from_keyword.iterate({
      keyword: 'she'
    })) {
      echo(row);
    }
    echo();
    for (row of phrases.statements.locations_from_keyword.iterate({
      keyword: '廓'
    })) {
      echo(row);
    }
    echo();
    for (row of phrases.statements.locations_from_keyword.iterate({
      keyword: '度'
    })) {
      echo(row);
    }
    //.........................................................................................................
    echo();
    for (row of phrases.statements.lines_from_keyword.iterate({
      keyword: 'thought'
    })) {
      echo(row);
    }
    echo();
    for (row of phrases.statements.lines_from_keyword.iterate({
      keyword: 'she'
    })) {
      echo(row);
    }
    echo();
    for (row of phrases.statements.lines_from_keyword.iterate({
      keyword: '廓'
    })) {
      echo(row);
    }
    echo();
    for (row of phrases.statements.lines_from_keyword.iterate({
      keyword: '度'
    })) {
      echo(row);
    }
    //.........................................................................................................
    return null;
  };

  //===========================================================================================================
  write_line_data_to_sqlitefs = function() {
    var bvfs, db_path, row, statement;
    db_path = PATH.resolve(__dirname, '../../bvfs/bvfs.db');
    bvfs = Dbric.open(db_path);
    //.........................................................................................................
    SQL`where ( file_id = 2 )
block_num
data`;
    //.........................................................................................................
    statement = bvfs.prepare(SQL`select * from data;`);
    echo();
    for (row of statement.iterate()) {
      echo(row);
    }
    //.........................................................................................................
    return null;
  };

  //===========================================================================================================
  demo_read_lines_from_buffers = function() {
    var d, path, walk_buffers_with_positions, walk_lines_with_positions;
    ({walk_buffers_with_positions, walk_lines_with_positions} = SFMODULES.unstable.require_fast_linereader());
    path = PATH.resolve(__dirname, '../package.json');
    for (d of walk_buffers_with_positions(path)) {
      debug('Ωjzrsdb__10', d);
    }
    for (d of walk_lines_with_positions(path, {
      chunk_size: 10
    })) {
      debug('Ωjzrsdb__10', d);
    }
    return null;
  };

  //===========================================================================================================
  if (module === require.main) {
    (() => {
      materialized_file_mirror();
      // write_line_data_to_sqlitefs()
      // demo_read_lines_from_buffers()
      return null;
    })();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsYUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsNEJBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSx3QkFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLDJCQUFBOzs7RUFHQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixDQUFBLENBQUUsS0FBRixFQUNFLEtBREYsRUFFRSxJQUZGLEVBR0UsSUFIRixFQUlFLEtBSkYsRUFLRSxNQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxPQVJGLENBQUEsR0FRNEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFSLENBQW9CLG1CQUFwQixDQVI1Qjs7RUFTQSxDQUFBLENBQUUsR0FBRixFQUNFLE9BREYsRUFFRSxJQUZGLEVBR0UsS0FIRixFQUlFLEtBSkYsRUFLRSxJQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxHQVJGLEVBU0UsSUFURixFQVVFLE9BVkYsRUFXRSxHQVhGLENBQUEsR0FXNEIsR0FBRyxDQUFDLEdBWGhDLEVBYkE7Ozs7Ozs7RUE4QkEsU0FBQSxHQUE0QixPQUFBLENBQVEsMkNBQVIsRUE5QjVCOzs7RUFnQ0EsSUFBQSxHQUE0QixPQUFBLENBQVEsV0FBUixFQWhDNUI7OztFQWtDQSxDQUFBLENBQUUsS0FBRixFQUNFLEdBREYsRUFFRSxTQUZGLENBQUEsR0FFZ0MsU0FBUyxDQUFDLFFBQVEsQ0FBQyxhQUFuQixDQUFBLENBRmhDOztFQUdBLEtBQUEsR0FBZ0MsT0FBQSxDQUFRLGdCQUFSOztFQUsxQjs7OztJQUFOLE1BQUEsY0FBQSxRQUE0QixNQUE1QixDQUFBOztNQTRGRSxVQUFZLENBQUEsQ0FBQTthQUFaLENBQUEsVUFDRSxDQUFBLEVBQUo7O1FBRUksSUFBQyxDQUFBLHFCQUFELENBQ0U7VUFBQSxJQUFBLEVBQWdCLGFBQWhCO1VBQ0EsT0FBQSxFQUFnQixDQUFFLFNBQUYsQ0FEaEI7VUFFQSxVQUFBLEVBQWdCLENBQUUsTUFBRixDQUZoQjtVQUdBLElBQUEsRUFBTSxTQUFBLENBQUUsSUFBRixDQUFBO0FBQ1osZ0JBQUEsQ0FBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUE7WUFBUSxRQUFBLEdBQVcsSUFBSSxDQUFDLEtBQUwsQ0FBVyxtRUFBWCxFQUFuQjs7WUFFUSxLQUFBLDBDQUFBOztjQUNFLElBQWdCLGVBQWhCO0FBQUEseUJBQUE7O2NBQ0EsSUFBWSxPQUFBLEtBQVcsRUFBdkI7QUFBQSx5QkFBQTs7Y0FDQSxNQUFNLENBQUEsQ0FBRSxPQUFGLENBQUE7WUFIUjttQkFJQztVQVBHO1FBSE4sQ0FERixFQUZKOztRQWVJLElBQUMsQ0FBQSxxQkFBRCxDQUNFO1VBQUEsSUFBQSxFQUFjLFlBQWQ7VUFDQSxPQUFBLEVBQWMsQ0FBRSxTQUFGLEVBQWEsTUFBYixDQURkO1VBRUEsVUFBQSxFQUFjLENBQUUsTUFBRixDQUZkO1VBR0EsSUFBQSxFQUFNLFNBQUEsQ0FBRSxJQUFGLENBQUE7QUFDWixnQkFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQTtZQUFRLEtBQUEsMkNBQUE7ZUFBSTtnQkFBRSxHQUFBLEVBQUssT0FBUDtnQkFBZ0IsSUFBaEI7Z0JBQXNCO2NBQXRCO2NBQ0YsTUFBTSxDQUFBLENBQUUsT0FBRixFQUFXLElBQVgsQ0FBQTtZQURSO21CQUVDO1VBSEc7UUFITixDQURGLEVBZko7O2VBd0JLO01BekJTOztJQTVGZDs7SUFDRSxhQUFDLENBQUEsUUFBRCxHQUFXOzs7SUFFWCxhQUFDLENBQUEsS0FBRCxHQUFROztNQUVOLEdBQUcsQ0FBQTs7cUJBQUEsQ0FGRzs7TUFPTixHQUFHLENBQUE7Ozs7O2lDQUFBLENBUEc7O01BZU4sR0FBRyxDQUFBOzs7OzswQ0FBQSxDQWZHOzs7O0lBd0JSLGFBQUMsQ0FBQSxVQUFELEdBR0UsQ0FBQTs7TUFBQSxpQkFBQSxFQUFtQixHQUFHLENBQUE7aURBQUEsQ0FBdEI7O01BSUEsY0FBQSxFQUFnQixHQUFHLENBQUE7bURBQUEsQ0FKbkI7O01BUUEsdUJBQUEsRUFBeUIsR0FBRyxDQUFBLHlDQUFBLENBUjVCO01BU0Esa0JBQUEsRUFBeUIsR0FBRyxDQUFBLDZDQUFBLENBVDVCO01BVUEsaUJBQUEsRUFBeUIsR0FBRyxDQUFBLHNEQUFBLENBVjVCO01BV0Esa0JBQUEsRUFBeUIsR0FBRyxDQUFBLGlEQUFBLENBWDVCOztNQWNBLG9CQUFBLEVBQXNCLEdBQUcsQ0FBQSx3REFBQSxDQWR6Qjs7TUFpQkEsc0JBQUEsRUFBd0IsR0FBRyxDQUFBOztpQ0FBQSxDQWpCM0I7O01Bc0JBLGtCQUFBLEVBQW9CLEdBQUcsQ0FBQTs7Ozs7Ozs7aUNBQUEsQ0F0QnZCOztNQWlDQSxrQkFBQSxFQUFvQixHQUFHLENBQUEsb0NBQUEsQ0FqQ3ZCOztNQW9DQSxvQkFBQSxFQUFzQixHQUFHLENBQUE7Ozs7Ozs7OztpREFBQSxDQXBDekI7O01BaURBLGlCQUFBLEVBQW1CLEdBQUcsQ0FBQTs7Ozs7Ozs7O3lCQUFBO0lBakR0Qjs7OztnQkF4RUo7OztFQWtLQSx3QkFBQSxHQUEyQixRQUFBLENBQUEsQ0FBQTtBQUMzQixRQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUE7SUFBRSxPQUFBLEdBQVk7SUFDWixPQUFBLEdBQVksYUFBYSxDQUFDLElBQWQsQ0FBbUIsT0FBbkI7SUFDWixLQUFBLENBQU0sYUFBTixFQUFxQixPQUFPLENBQUMsUUFBUixDQUFBLENBQXJCO0lBQ0EsS0FBQSxDQUFNLGFBQU4sRUFBcUIsT0FBTyxDQUFDLE9BQVIsQ0FBQSxDQUFyQjtJQUVHLENBQUEsQ0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNMLFVBQUEsS0FBQSxFQUFBO01BQUksS0FBQSxHQUFRO01BQ1IsSUFBQSxHQUFRLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixvREFBeEI7YUFDUixPQUFPLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLEdBQXJDLENBQXlDLENBQUUsS0FBRixFQUFTLElBQVQsQ0FBekM7SUFIQyxDQUFBO0lBS0EsQ0FBQSxDQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0wsVUFBQSxLQUFBLEVBQUE7TUFBSSxLQUFBLEdBQVE7TUFDUixJQUFBLEdBQVEsSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLHNEQUF4QjthQUNSLE9BQU8sQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsR0FBckMsQ0FBeUMsQ0FBRSxLQUFGLEVBQVMsSUFBVCxDQUF6QztJQUhDLENBQUEsSUFWTDs7SUFlRSxLQUFBLENBQU0sYUFBTixFQUFxQix3QkFBckIsRUFBK0MsT0FBTyxDQUFDLFVBQVUsQ0FBQyxvQkFBb0IsQ0FBQyxHQUF4QyxDQUFBLENBQS9DO0lBQ0EsS0FBQSxDQUFNLGFBQU4sRUFBcUIsd0JBQXJCLEVBQStDLE9BQU8sQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsR0FBckMsQ0FBQSxDQUEvQztJQUNBLEtBQUEsQ0FBTSxhQUFOLEVBQXFCLHdCQUFyQixFQUErQyxPQUFPLENBQUMsVUFBVSxDQUFDLGlCQUFpQixDQUFDLEdBQXJDLENBQUEsQ0FBL0M7SUFDQSxLQUFBLENBQU0sYUFBTixFQUFxQix3QkFBckIsRUFBK0MsT0FBTyxDQUFDLFVBQVUsQ0FBQyxrQkFBa0IsQ0FBQyxHQUF0QyxDQUFBLENBQS9DLEVBbEJGOzs7SUFxQkUsSUFBQSxDQUFBO0lBQVEsS0FBQTs7TUFBQTtNQUFBLElBQUEsQ0FBSyxHQUFMO0lBQUE7SUFDUixJQUFBLENBQUE7SUFBUSxLQUFBOztNQUFBO01BQUEsSUFBQSxDQUFLLEdBQUw7SUFBQTtJQUNSLElBQUEsQ0FBQTtJQUFRLEtBQUE7O01BQUE7TUFBQSxJQUFBLENBQUssR0FBTDtJQUFBO0lBQ1IsSUFBQSxDQUFBO0lBQVEsS0FBQTs7TUFBQTtNQUFBLElBQUEsQ0FBSyxHQUFMO0lBQUEsQ0F4QlY7O0lBMEJFLElBQUEsQ0FBQTtJQUFRLEtBQUE7O01BQUE7TUFBQSxJQUFBLENBQUssR0FBTDtJQUFBO0lBQ1IsSUFBQSxDQUFBO0lBQVEsS0FBQTs7TUFBQTtNQUFBLElBQUEsQ0FBSyxHQUFMO0lBQUE7SUFDUixJQUFBLENBQUE7SUFBUSxLQUFBOztNQUFBO01BQUEsSUFBQSxDQUFLLEdBQUw7SUFBQTtJQUNSLElBQUEsQ0FBQTtJQUFRLEtBQUE7O01BQUE7TUFBQSxJQUFBLENBQUssR0FBTDtJQUFBLENBN0JWOztXQStCRztFQWhDd0IsRUFsSzNCOzs7RUFxTUEsMkJBQUEsR0FBOEIsUUFBQSxDQUFBLENBQUE7QUFDOUIsUUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQTtJQUFFLE9BQUEsR0FBWSxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0Isb0JBQXhCO0lBQ1osSUFBQSxHQUFZLEtBQUssQ0FBQyxJQUFOLENBQVcsT0FBWCxFQURkOztJQUdFLEdBQUcsQ0FBQTs7SUFBQSxFQUhMOztJQVNFLFNBQUEsR0FBWSxJQUFJLENBQUMsT0FBTCxDQUFhLEdBQUcsQ0FBQSxtQkFBQSxDQUFoQjtJQUNaLElBQUEsQ0FBQTtJQUFRLEtBQUEsMEJBQUE7TUFBQSxJQUFBLENBQUssR0FBTDtJQUFBLENBVlY7O1dBWUc7RUFiMkIsRUFyTTlCOzs7RUFzTkEsNEJBQUEsR0FBK0IsUUFBQSxDQUFBLENBQUE7QUFDL0IsUUFBQSxDQUFBLEVBQUEsSUFBQSxFQUFBLDJCQUFBLEVBQUE7SUFBRSxDQUFBLENBQUUsMkJBQUYsRUFDRSx5QkFERixDQUFBLEdBQ2lDLFNBQVMsQ0FBQyxRQUFRLENBQUMsdUJBQW5CLENBQUEsQ0FEakM7SUFFQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLGlCQUF4QjtJQUNQLEtBQUEsc0NBQUE7TUFDRSxLQUFBLENBQU0sYUFBTixFQUFxQixDQUFyQjtJQURGO0lBRUEsS0FBQTs7TUFBQTtNQUNFLEtBQUEsQ0FBTSxhQUFOLEVBQXFCLENBQXJCO0lBREY7V0FFQztFQVI0QixFQXROL0I7OztFQWlPQSxJQUFHLE1BQUEsS0FBVSxPQUFPLENBQUMsSUFBckI7SUFBa0MsQ0FBQSxDQUFBLENBQUEsR0FBQTtNQUNoQyx3QkFBQSxDQUFBLEVBQUY7OzthQUdHO0lBSitCLENBQUEsSUFBbEM7O0FBak9BIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0J1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbkdVWSAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXknXG57IGFsZXJ0XG4gIGRlYnVnXG4gIGhlbHBcbiAgaW5mb1xuICBwbGFpblxuICBwcmFpc2VcbiAgdXJnZVxuICB3YXJuXG4gIHdoaXNwZXIgfSAgICAgICAgICAgICAgID0gR1VZLnRybS5nZXRfbG9nZ2VycyAnaml6dXJhLXNvdXJjZXMtZGInXG57IHJwclxuICBpbnNwZWN0XG4gIGVjaG9cbiAgd2hpdGVcbiAgZ3JlZW5cbiAgYmx1ZVxuICBnb2xkXG4gIGdyZXlcbiAgcmVkXG4gIGJvbGRcbiAgcmV2ZXJzZVxuICBsb2cgICAgIH0gICAgICAgICAgICAgICA9IEdVWS50cm1cbiMgeyBmIH0gICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9lZmZzdHJpbmcnXG4jIHdyaXRlICAgICAgICAgICAgICAgICAgICAgPSAoIHAgKSAtPiBwcm9jZXNzLnN0ZG91dC53cml0ZSBwXG4jIHsgbmZhIH0gICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvbm9ybWFsaXplLWZ1bmN0aW9uLWFyZ3VtZW50cydcbiMgR1RORyAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ndXktdGVzdC1ORydcbiMgeyBUZXN0ICAgICAgICAgICAgICAgICAgfSA9IEdUTkdcblNGTU9EVUxFUyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvYnJpY2FicmFjLXNmbW9kdWxlcydcbiMgRlMgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6ZnMnXG5QQVRIICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpwYXRoJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG57IERicmljLFxuICBTUUwsXG4gIGludGVybmFscywgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2RicmljKClcbkJzcWwzICAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYmV0dGVyLXNxbGl0ZTMnXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIERicmljX3BocmFzZXMgZXh0ZW5kcyBEYnJpY1xuICBAZGJfY2xhc3M6IEJzcWwzXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQGJ1aWxkOiBbXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUgZGF0YXNvdXJjZXMgKFxuICAgICAgICBkc2tleSB0ZXh0IHVuaXF1ZSBub3QgbnVsbCBwcmltYXJ5IGtleSxcbiAgICAgICAgcGF0aCB0ZXh0IG5vdCBudWxsICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBtaXJyb3IgKFxuICAgICAgICBkc2tleSAgIHRleHQgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmVfbnIgaW50ZWdlciBub3QgbnVsbCxcbiAgICAgICAgbGluZSAgICB0ZXh0ICAgIG5vdCBudWxsLFxuICAgICAgZm9yZWlnbiBrZXkgKCBkc2tleSApIHJlZmVyZW5jZXMgZGF0YXNvdXJjZXMgKCBkc2tleSApLFxuICAgICAgcHJpbWFyeSBrZXkgKCBkc2tleSwgbGluZV9uciApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBrZXl3b3JkcyAoXG4gICAgICAgIGRza2V5ICAgdGV4dCAgICBub3QgbnVsbCxcbiAgICAgICAgbGluZV9uciBpbnRlZ2VyIG5vdCBudWxsLFxuICAgICAgICBrZXl3b3JkIHRleHQgICAgbm90IG51bGwsXG4gICAgICBmb3JlaWduIGtleSAoIGRza2V5ICkgcmVmZXJlbmNlcyBkYXRhc291cmNlcyAoIGRza2V5ICksXG4gICAgICBwcmltYXJ5IGtleSAoIGRza2V5LCBsaW5lX25yLCBrZXl3b3JkICkgKTtcIlwiXCJcbiAgICBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAc3RhdGVtZW50czpcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2RhdGFzb3VyY2U6IFNRTFwiXCJcImluc2VydCBpbnRvIGRhdGFzb3VyY2VzICggZHNrZXksIHBhdGggKSB2YWx1ZXMgKCAkZHNrZXksICRwYXRoIClcbiAgICAgIG9uIGNvbmZsaWN0ICggZHNrZXkgKSBkbyB1cGRhdGUgc2V0IHBhdGggPSAkcGF0aDtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2tleXdvcmQ6IFNRTFwiXCJcImluc2VydCBpbnRvIGtleXdvcmRzICggZHNrZXksIGxpbmVfbnIsIGtleXdvcmQgKSB2YWx1ZXMgKCAkZHNrZXksICRsaW5lX25yLCAka2V5d29yZCApXG4gICAgICBvbiBjb25mbGljdCAoIGRza2V5LCBsaW5lX25yLCBrZXl3b3JkICkgZG8gbm90aGluZztcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc2VsZWN0X2Zyb21fZGF0YXNvdXJjZXM6IFNRTFwiXCJcInNlbGVjdCAqIGZyb20gZGF0YXNvdXJjZXMgb3JkZXIgYnkgZHNrZXk7XCJcIlwiXG4gICAgc2VsZWN0X2Zyb21fbWlycm9yOiAgICAgIFNRTFwiXCJcInNlbGVjdCAqIGZyb20gbWlycm9yIG9yZGVyIGJ5IGRza2V5LCBsaW5lX25yO1wiXCJcIlxuICAgIGNvdW50X2RhdGFzb3VyY2VzOiAgICAgICBTUUxcIlwiXCJzZWxlY3QgY291bnQoKikgYXMgZGF0YXNvdXJjZV9jb3VudCAgZnJvbSBkYXRhc291cmNlcztcIlwiXCJcbiAgICBjb3VudF9taXJyb3JfbGluZXM6ICAgICAgU1FMXCJcIlwic2VsZWN0IGNvdW50KCopIGFzIG1pcnJvcl9saW5lX2NvdW50IGZyb20gbWlycm9yO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBzZWxlY3RfZnJvbV9rZXl3b3JkczogU1FMXCJcIlwic2VsZWN0ICogZnJvbSBrZXl3b3JkcyBvcmRlciBieSBrZXl3b3JkLCBkc2tleSwgbGluZV9ucjtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgbG9jYXRpb25zX2Zyb21fa2V5d29yZDogU1FMXCJcIlwic2VsZWN0ICogZnJvbSBrZXl3b3Jkc1xuICAgICAgd2hlcmUga2V5d29yZCA9ICRrZXl3b3JkXG4gICAgICBvcmRlciBieSBrZXl3b3JkLCBkc2tleSwgbGluZV9ucjtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgbGluZXNfZnJvbV9rZXl3b3JkOiBTUUxcIlwiXCJzZWxlY3RcbiAgICAgICAga3cuZHNrZXkgICAgYXMgZHNrZXksXG4gICAgICAgIGt3LmxpbmVfbnIgIGFzIGxpbmVfbnIsXG4gICAgICAgIGt3LmtleXdvcmQgIGFzIGtleXdvcmQsXG4gICAgICAgIG1pLmxpbmUgICAgIGFzIGxpbmVcbiAgICAgIGZyb20ga2V5d29yZHMgYXMga3dcbiAgICAgIGpvaW4gbWlycm9yICAgYXMgbWkgdXNpbmcgKCBkc2tleSwgbGluZV9uciApXG4gICAgICB3aGVyZSBrZXl3b3JkID0gJGtleXdvcmRcbiAgICAgIG9yZGVyIGJ5IGtleXdvcmQsIGRza2V5LCBsaW5lX25yO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBzZWxlY3RfZnJvbV9taXJyb3I6IFNRTFwiXCJcInNlbGVjdCAqIGZyb20gbWlycm9yIG9yZGVyIGJ5IGRza2V5O1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9maWxlX21pcnJvcjogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBtaXJyb3IgKCBkc2tleSwgbGluZV9uciwgbGluZSApXG4gICAgICAgIHNlbGVjdFxuICAgICAgICAgIGRzLmRza2V5ICAgIGFzIGRza2V5LFxuICAgICAgICAgIGZsLmxpbmVfbnIgIGFzIGxpbmVfbnIsXG4gICAgICAgICAgZmwubGluZSAgICAgYXMgbGluZVxuICAgICAgICBmcm9tIGRhdGFzb3VyY2VzICAgICAgICBhcyBkc1xuICAgICAgICBsZWZ0IGpvaW4gbWlycm9yICAgICAgICBhcyBtaSB1c2luZyAoIGRza2V5ICksXG4gICAgICAgIGZpbGVfbGluZXMoIGRzLnBhdGggKSAgIGFzIGZsXG4gICAgICAgIHdoZXJlIHRydWUgLS0gd2hlcmUgY2xhdXNlIGp1c3QgYSBzeW50YWN0aWMgZ3VhcmQgYXMgcGVyIGh0dHBzOi8vc3FsaXRlLm9yZy9sYW5nX3Vwc2VydC5odG1sXG4gICAgICAgIG9uIGNvbmZsaWN0IGRvIHVwZGF0ZSBzZXQgbGluZSA9IGV4Y2x1ZGVkLmxpbmU7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2tleXdvcmRzOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGtleXdvcmRzICggZHNrZXksIGxpbmVfbnIsIGtleXdvcmQgKVxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICBkcy5kc2tleSAgICBhcyBkc2tleSxcbiAgICAgICAgICBtaS5saW5lX25yICBhcyBsaW5lX25yLFxuICAgICAgICAgIHN3LmtleXdvcmQgIGFzIGtleXdvcmRcbiAgICAgICAgZnJvbSBkYXRhc291cmNlcyAgICAgICAgYXMgZHNcbiAgICAgICAgam9pbiBtaXJyb3IgICAgICAgICAgICAgYXMgbWkgdXNpbmcgKCBkc2tleSApLFxuICAgICAgICBzcGxpdF93b3JkcyggbWkubGluZSApICBhcyBzd1xuICAgICAgICB3aGVyZSB0cnVlIC0tIHdoZXJlIGNsYXVzZSBqdXN0IGEgc3ludGFjdGljIGd1YXJkIGFzIHBlciBodHRwczovL3NxbGl0ZS5vcmcvbGFuZ191cHNlcnQuaHRtbFxuICAgICAgICBvbiBjb25mbGljdCBkbyBub3RoaW5nO1wiXCJcIlxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlcigpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBAY3JlYXRlX3RhYmxlX2Z1bmN0aW9uXG4gICAgICBuYW1lOiAgICAgICAgICAgJ3NwbGl0X3dvcmRzJ1xuICAgICAgY29sdW1uczogICAgICAgIFsgJ2tleXdvcmQnLCBdXG4gICAgICBwYXJhbWV0ZXJzOiAgICAgWyAnbGluZScsIF1cbiAgICAgIHJvd3M6ICggbGluZSApIC0+XG4gICAgICAgIGtleXdvcmRzID0gbGluZS5zcGxpdCAvKD86XFxwe1p9Kyl8KCg/OlxccHtTY3JpcHQ9SGFufSl8KD86XFxwe0x9Kyl8KD86XFxwe059Kyl8KD86XFxwe1N9KykpL3ZcbiAgICAgICAgIyBkZWJ1ZyAnzqlqenJzZGJfX181JywgbGluZV9uciwgcnByIGtleXdvcmRzXG4gICAgICAgIGZvciBrZXl3b3JkIGluIGtleXdvcmRzXG4gICAgICAgICAgY29udGludWUgdW5sZXNzIGtleXdvcmQ/XG4gICAgICAgICAgY29udGludWUgaWYga2V5d29yZCBpcyAnJ1xuICAgICAgICAgIHlpZWxkIHsga2V5d29yZCwgfVxuICAgICAgICA7bnVsbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQGNyZWF0ZV90YWJsZV9mdW5jdGlvblxuICAgICAgbmFtZTogICAgICAgICAnZmlsZV9saW5lcydcbiAgICAgIGNvbHVtbnM6ICAgICAgWyAnbGluZV9ucicsICdsaW5lJywgXVxuICAgICAgcGFyYW1ldGVyczogICBbICdwYXRoJywgXVxuICAgICAgcm93czogKCBwYXRoICkgLT5cbiAgICAgICAgZm9yIHsgbG5yOiBsaW5lX25yLCBsaW5lLCBlb2wsIH0gZnJvbSBHVVkuZnMud2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBwYXRoXG4gICAgICAgICAgeWllbGQgeyBsaW5lX25yLCBsaW5lLCB9XG4gICAgICAgIDtudWxsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7bnVsbFxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbm1hdGVyaWFsaXplZF9maWxlX21pcnJvciA9IC0+XG4gIGRiX3BhdGggICA9ICcvZGV2L3NobS9icmljYWJyYWMuc3FsaXRlJ1xuICBwaHJhc2VzICAgPSBEYnJpY19waHJhc2VzLm9wZW4gZGJfcGF0aFxuICBkZWJ1ZyAnzqlqenJzZGJfX182JywgcGhyYXNlcy50ZWFyZG93bigpXG4gIGRlYnVnICfOqWp6cnNkYl9fXzcnLCBwaHJhc2VzLnJlYnVpbGQoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGRvID0+XG4gICAgZHNrZXkgPSAnaHVtZHVtJ1xuICAgIHBhdGggID0gUEFUSC5yZXNvbHZlIF9fZGlybmFtZSwgJy4uLy4uL2hlbmdpc3QtTkcvYXNzZXRzL2JyaWNhYnJhYy9odW1wdHktZHVtcHR5Lm1kJ1xuICAgIHBocmFzZXMuc3RhdGVtZW50cy5pbnNlcnRfZGF0YXNvdXJjZS5ydW4geyBkc2tleSwgcGF0aCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZG8gPT5cbiAgICBkc2tleSA9ICdtbmcnXG4gICAgcGF0aCAgPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4vLi4vLi4vaW8vbWluZ2t3YWktcmFjay9qenJkcy9tZWFuaW5nL21lYW5pbmdzLnR4dCdcbiAgICBwaHJhc2VzLnN0YXRlbWVudHMuaW5zZXJ0X2RhdGFzb3VyY2UucnVuIHsgZHNrZXksIHBhdGggfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGRlYnVnICfOqWp6cnNkYl9fXzgnLCBcInBvcHVsYXRlX2ZpbGVfbWlycm9yOiBcIiwgcGhyYXNlcy5zdGF0ZW1lbnRzLnBvcHVsYXRlX2ZpbGVfbWlycm9yLnJ1bigpXG4gIGRlYnVnICfOqWp6cnNkYl9fXzknLCBcInBvcHVsYXRlX2tleXdvcmRzOiAgICBcIiwgcGhyYXNlcy5zdGF0ZW1lbnRzLnBvcHVsYXRlX2tleXdvcmRzLnJ1bigpXG4gIGRlYnVnICfOqWp6cnNkYl9fMTAnLCBcImNvdW50X2RhdGFzb3VyY2VzOiAgICBcIiwgcGhyYXNlcy5zdGF0ZW1lbnRzLmNvdW50X2RhdGFzb3VyY2VzLmdldCgpXG4gIGRlYnVnICfOqWp6cnNkYl9fMTEnLCBcImNvdW50X21pcnJvcl9saW5lczogICBcIiwgcGhyYXNlcy5zdGF0ZW1lbnRzLmNvdW50X21pcnJvcl9saW5lcy5nZXQoKVxuICAjIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHBocmFzZXMuc3RhdGVtZW50cy5zZWxlY3RfZnJvbV9taXJyb3IuaXRlcmF0ZSgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZWNobygpOyBlY2hvIHJvdyBmb3Igcm93IGZyb20gcGhyYXNlcy5zdGF0ZW1lbnRzLmxvY2F0aW9uc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICd0aG91Z2h0JywgfVxuICBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubG9jYXRpb25zX2Zyb21fa2V5d29yZC5pdGVyYXRlIHsga2V5d29yZDogJ3NoZScsIH1cbiAgZWNobygpOyBlY2hvIHJvdyBmb3Igcm93IGZyb20gcGhyYXNlcy5zdGF0ZW1lbnRzLmxvY2F0aW9uc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICflu5MnLCB9XG4gIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHBocmFzZXMuc3RhdGVtZW50cy5sb2NhdGlvbnNfZnJvbV9rZXl3b3JkLml0ZXJhdGUgeyBrZXl3b3JkOiAn5bqmJywgfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHBocmFzZXMuc3RhdGVtZW50cy5saW5lc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICd0aG91Z2h0JywgfVxuICBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubGluZXNfZnJvbV9rZXl3b3JkLml0ZXJhdGUgeyBrZXl3b3JkOiAnc2hlJywgfVxuICBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubGluZXNfZnJvbV9rZXl3b3JkLml0ZXJhdGUgeyBrZXl3b3JkOiAn5buTJywgfVxuICBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubGluZXNfZnJvbV9rZXl3b3JkLml0ZXJhdGUgeyBrZXl3b3JkOiAn5bqmJywgfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIDtudWxsXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxud3JpdGVfbGluZV9kYXRhX3RvX3NxbGl0ZWZzID0gLT5cbiAgZGJfcGF0aCAgID0gUEFUSC5yZXNvbHZlIF9fZGlybmFtZSwgJy4uLy4uL2J2ZnMvYnZmcy5kYidcbiAgYnZmcyAgICAgID0gRGJyaWMub3BlbiBkYl9wYXRoXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgU1FMXCJcIlwiXG4gIHdoZXJlICggZmlsZV9pZCA9IDIgKVxuICBibG9ja19udW1cbiAgZGF0YVxuICBcIlwiXCJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBzdGF0ZW1lbnQgPSBidmZzLnByZXBhcmUgU1FMXCJcIlwic2VsZWN0ICogZnJvbSBkYXRhO1wiXCJcIlxuICBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBzdGF0ZW1lbnQuaXRlcmF0ZSgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgO251bGxcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmRlbW9fcmVhZF9saW5lc19mcm9tX2J1ZmZlcnMgPSAtPlxuICB7IHdhbGtfYnVmZmVyc193aXRoX3Bvc2l0aW9ucyxcbiAgICB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zLCB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcbiAgcGF0aCA9IFBBVEgucmVzb2x2ZSBfX2Rpcm5hbWUsICcuLi9wYWNrYWdlLmpzb24nXG4gIGZvciBkIGZyb20gd2Fsa19idWZmZXJzX3dpdGhfcG9zaXRpb25zIHBhdGhcbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzEwJywgZFxuICBmb3IgZCBmcm9tIHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgcGF0aCwgeyBjaHVua19zaXplOiAxMCwgfVxuICAgIGRlYnVnICfOqWp6cnNkYl9fMTAnLCBkXG4gIDtudWxsXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuaWYgbW9kdWxlIGlzIHJlcXVpcmUubWFpbiB0aGVuIGRvID0+XG4gIG1hdGVyaWFsaXplZF9maWxlX21pcnJvcigpXG4gICMgd3JpdGVfbGluZV9kYXRhX3RvX3NxbGl0ZWZzKClcbiAgIyBkZW1vX3JlYWRfbGluZXNfZnJvbV9idWZmZXJzKClcbiAgO251bGxcblxuIl19
