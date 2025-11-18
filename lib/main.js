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
      locations_from_keyword: SQL`select * from keywords
where keyword = $keyword
order by keyword, dskey, line_nr;`,
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
    SQL`create table bb_line_byte_offsets (
-- .....................................................................................................
dskey     text    not null,
line_nr   integer not null,
chunk_nr  integer not null,
-- .....................................................................................................
file_id   integer not null,
block_num integer not null,
-- .....................................................................................................
d0        integer not null, -- 0-based (?) index to first byte (in this block)
d1        integer not null, -- 0-based (?) index to last  byte (in this block)
-- .....................................................................................................
foreign key ( dskey               ) references datasources ( dskey ),
foreign key ( file_id, block_num  ) references data ( file_id, block_num ),
primary key ( dskey, line_nr, chunk_nr )
);`;
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
      // materialized_file_mirror()
      // write_line_data_to_sqlitefs()
      demo_read_lines_from_buffers();
      return null;
    })();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsYUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsNEJBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSx3QkFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLDJCQUFBOzs7RUFHQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixDQUFBLENBQUUsS0FBRixFQUNFLEtBREYsRUFFRSxJQUZGLEVBR0UsSUFIRixFQUlFLEtBSkYsRUFLRSxNQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxPQVJGLENBQUEsR0FRNEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFSLENBQW9CLG1CQUFwQixDQVI1Qjs7RUFTQSxDQUFBLENBQUUsR0FBRixFQUNFLE9BREYsRUFFRSxJQUZGLEVBR0UsS0FIRixFQUlFLEtBSkYsRUFLRSxJQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxHQVJGLEVBU0UsSUFURixFQVVFLE9BVkYsRUFXRSxHQVhGLENBQUEsR0FXNEIsR0FBRyxDQUFDLEdBWGhDLEVBYkE7Ozs7Ozs7RUE4QkEsU0FBQSxHQUE0QixPQUFBLENBQVEsMkNBQVIsRUE5QjVCOzs7RUFnQ0EsSUFBQSxHQUE0QixPQUFBLENBQVEsV0FBUixFQWhDNUI7OztFQWtDQSxDQUFBLENBQUUsS0FBRixFQUNF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LFFBQVEsQ0FBQyx1QkFBbkIsQ0FBQSxDQURqQztJQUVBLElBQUEsR0FBTyxJQUFJLENBQUMsT0FBTCxDQUFhLFNBQWIsRUFBd0IsaUJBQXhCO0lBQ1AsS0FBQSxzQ0FBQTtNQUNFLEtBQUEsQ0FBTSxhQUFOLEVBQXFCLENBQXJCO0lBREY7SUFFQSxLQUFBOztNQUFBO01BQ0UsS0FBQSxDQUFNLGFBQU4sRUFBcUIsQ0FBckI7SUFERjtXQUVDO0VBUjRCLEVBdk4vQjs7O0VBa09BLElBQUcsTUFBQSxLQUFVLE9BQU8sQ0FBQyxJQUFyQjtJQUFrQyxDQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUE7OztNQUdoQyw0QkFBQSxDQUFBO2FBQ0M7SUFKK0IsQ0FBQSxJQUFsQzs7QUFsT0EiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuJ3VzZSBzdHJpY3QnXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuR1VZICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2d1eSdcbnsgYWxlcnRcbiAgZGVidWdcbiAgaGVscFxuICBpbmZvXG4gIHBsYWluXG4gIHByYWlzZVxuICB1cmdlXG4gIHdhcm5cbiAgd2hpc3BlciB9ICAgICAgICAgICAgICAgPSBHVVkudHJtLmdldF9sb2dnZXJzICdqaXp1cmEtc291cmNlcy1kYidcbnsgcnByXG4gIGluc3BlY3RcbiAgZWNob1xuICB3aGl0ZVxuICBncmVlblxuICBibHVlXG4gIGdvbGRcbiAgZ3JleVxuICByZWRcbiAgYm9sZFxuICByZXZlcnNlXG4gIGxvZyAgICAgfSAgICAgICAgICAgICAgID0gR1VZLnRybVxuIyB7IGYgfSAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2VmZnN0cmluZydcbiMgd3JpdGUgICAgICAgICAgICAgICAgICAgICA9ICggcCApIC0+IHByb2Nlc3Muc3Rkb3V0LndyaXRlIHBcbiMgeyBuZmEgfSAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ub3JtYWxpemUtZnVuY3Rpb24tYXJndW1lbnRzJ1xuIyBHVE5HICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2d1eS10ZXN0LU5HJ1xuIyB7IFRlc3QgICAgICAgICAgICAgICAgICB9ID0gR1ROR1xuU0ZNT0RVTEVTICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9icmljYWJyYWMtc2Ztb2R1bGVzJ1xuIyBGUyAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpmcydcblBBVEggICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOnBhdGgnXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnsgRGJyaWMsXG4gIFNRTCxcbiAgaW50ZXJuYWxzLCAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZGJyaWMoKVxuQnNxbDMgICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdiZXR0ZXItc3FsaXRlMydcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgRGJyaWNfcGhyYXNlcyBleHRlbmRzIERicmljXG4gIEBkYl9jbGFzczogQnNxbDNcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAYnVpbGQ6IFtcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBkYXRhc291cmNlcyAoXG4gICAgICAgIGRza2V5IHRleHQgdW5pcXVlIG5vdCBudWxsIHByaW1hcnkga2V5LFxuICAgICAgICBwYXRoIHRleHQgbm90IG51bGwgKTtcIlwiXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBtaXJyb3IgKFxuICAgICAgICBkc2tleSAgIHRleHQgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmVfbnIgaW50ZWdlciBub3QgbnVsbCxcbiAgICAgICAgbGluZSAgICB0ZXh0ICAgIG5vdCBudWxsLFxuICAgICAgZm9yZWlnbiBrZXkgKCBkc2tleSApIHJlZmVyZW5jZXMgZGF0YXNvdXJjZXMgKCBkc2tleSApLFxuICAgICAgcHJpbWFyeSBrZXkgKCBkc2tleSwgbGluZV9uciApICk7XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUga2V5d29yZHMgKFxuICAgICAgICBkc2tleSAgIHRleHQgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmVfbnIgaW50ZWdlciBub3QgbnVsbCxcbiAgICAgICAga2V5d29yZCB0ZXh0ICAgIG5vdCBudWxsLFxuICAgICAgZm9yZWlnbiBrZXkgKCBkc2tleSApIHJlZmVyZW5jZXMgZGF0YXNvdXJjZXMgKCBkc2tleSApLFxuICAgICAgcHJpbWFyeSBrZXkgKCBkc2tleSwgbGluZV9uciwga2V5d29yZCApICk7XCJcIlwiXG4gICAgXVxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBzdGF0ZW1lbnRzOlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2RhdGFzb3VyY2U6IFNRTFwiXCJcImluc2VydCBpbnRvIGRhdGFzb3VyY2VzICggZHNrZXksIHBhdGggKSB2YWx1ZXMgKCAkZHNrZXksICRwYXRoIClcbiAgICAgIG9uIGNvbmZsaWN0ICggZHNrZXkgKSBkbyB1cGRhdGUgc2V0IHBhdGggPSAkcGF0aDtcIlwiXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9rZXl3b3JkOiBTUUxcIlwiXCJpbnNlcnQgaW50byBrZXl3b3JkcyAoIGRza2V5LCBsaW5lX25yLCBrZXl3b3JkICkgdmFsdWVzICggJGRza2V5LCAkbGluZV9uciwgJGtleXdvcmQgKVxuICAgICAgb24gY29uZmxpY3QgKCBkc2tleSwgbGluZV9uciwga2V5d29yZCApIGRvIG5vdGhpbmc7XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBzZWxlY3RfZnJvbV9kYXRhc291cmNlczogU1FMXCJcIlwic2VsZWN0ICogZnJvbSBkYXRhc291cmNlcyBvcmRlciBieSBkc2tleTtcIlwiXCJcbiAgICBzZWxlY3RfZnJvbV9taXJyb3I6ICAgICAgU1FMXCJcIlwic2VsZWN0ICogZnJvbSBtaXJyb3Igb3JkZXIgYnkgZHNrZXksIGxpbmVfbnI7XCJcIlwiXG4gICAgY291bnRfZGF0YXNvdXJjZXM6ICAgICAgIFNRTFwiXCJcInNlbGVjdCBjb3VudCgqKSBhcyBkYXRhc291cmNlX2NvdW50ICBmcm9tIGRhdGFzb3VyY2VzO1wiXCJcIlxuICAgIGNvdW50X21pcnJvcl9saW5lczogICAgICBTUUxcIlwiXCJzZWxlY3QgY291bnQoKikgYXMgbWlycm9yX2xpbmVfY291bnQgZnJvbSBtaXJyb3I7XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBzZWxlY3RfZnJvbV9rZXl3b3JkczogU1FMXCJcIlwic2VsZWN0ICogZnJvbSBrZXl3b3JkcyBvcmRlciBieSBrZXl3b3JkLCBkc2tleSwgbGluZV9ucjtcIlwiXCJcbiAgICBsb2NhdGlvbnNfZnJvbV9rZXl3b3JkOiBTUUxcIlwiXCJzZWxlY3QgKiBmcm9tIGtleXdvcmRzXG4gICAgICB3aGVyZSBrZXl3b3JkID0gJGtleXdvcmRcbiAgICAgIG9yZGVyIGJ5IGtleXdvcmQsIGRza2V5LCBsaW5lX25yO1wiXCJcIlxuICAgIGxpbmVzX2Zyb21fa2V5d29yZDogU1FMXCJcIlwic2VsZWN0XG4gICAgICAgIGt3LmRza2V5ICAgIGFzIGRza2V5LFxuICAgICAgICBrdy5saW5lX25yICBhcyBsaW5lX25yLFxuICAgICAgICBrdy5rZXl3b3JkICBhcyBrZXl3b3JkLFxuICAgICAgICBtaS5saW5lICAgICBhcyBsaW5lXG4gICAgICBmcm9tIGtleXdvcmRzIGFzIGt3XG4gICAgICBqb2luIG1pcnJvciAgIGFzIG1pIHVzaW5nICggZHNrZXksIGxpbmVfbnIgKVxuICAgICAgd2hlcmUga2V5d29yZCA9ICRrZXl3b3JkXG4gICAgICBvcmRlciBieSBrZXl3b3JkLCBkc2tleSwgbGluZV9ucjtcIlwiXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHNlbGVjdF9mcm9tX21pcnJvcjogU1FMXCJcIlwic2VsZWN0ICogZnJvbSBtaXJyb3Igb3JkZXIgYnkgZHNrZXk7XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9maWxlX21pcnJvcjogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBtaXJyb3IgKCBkc2tleSwgbGluZV9uciwgbGluZSApXG4gICAgICAgIHNlbGVjdFxuICAgICAgICAgIGRzLmRza2V5ICAgIGFzIGRza2V5LFxuICAgICAgICAgIGZsLmxpbmVfbnIgIGFzIGxpbmVfbnIsXG4gICAgICAgICAgZmwubGluZSAgICAgYXMgbGluZVxuICAgICAgICBmcm9tIGRhdGFzb3VyY2VzICAgICAgICBhcyBkc1xuICAgICAgICBsZWZ0IGpvaW4gbWlycm9yICAgICAgICBhcyBtaSB1c2luZyAoIGRza2V5ICksXG4gICAgICAgIGZpbGVfbGluZXMoIGRzLnBhdGggKSAgIGFzIGZsXG4gICAgICAgIHdoZXJlIHRydWUgLS0gd2hlcmUgY2xhdXNlIGp1c3QgYSBzeW50YWN0aWMgZ3VhcmQgYXMgcGVyIGh0dHBzOi8vc3FsaXRlLm9yZy9sYW5nX3Vwc2VydC5odG1sXG4gICAgICAgIG9uIGNvbmZsaWN0IGRvIHVwZGF0ZSBzZXQgbGluZSA9IGV4Y2x1ZGVkLmxpbmU7XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9rZXl3b3JkczogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBrZXl3b3JkcyAoIGRza2V5LCBsaW5lX25yLCBrZXl3b3JkIClcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgZHMuZHNrZXkgICAgYXMgZHNrZXksXG4gICAgICAgICAgbWkubGluZV9uciAgYXMgbGluZV9ucixcbiAgICAgICAgICBzdy5rZXl3b3JkICBhcyBrZXl3b3JkXG4gICAgICAgIGZyb20gZGF0YXNvdXJjZXMgICAgICAgIGFzIGRzXG4gICAgICAgIGpvaW4gbWlycm9yICAgICAgICAgICAgIGFzIG1pIHVzaW5nICggZHNrZXkgKSxcbiAgICAgICAgc3BsaXRfd29yZHMoIG1pLmxpbmUgKSAgYXMgc3dcbiAgICAgICAgd2hlcmUgdHJ1ZSAtLSB3aGVyZSBjbGF1c2UganVzdCBhIHN5bnRhY3RpYyBndWFyZCBhcyBwZXIgaHR0cHM6Ly9zcWxpdGUub3JnL2xhbmdfdXBzZXJ0Lmh0bWxcbiAgICAgICAgb24gY29uZmxpY3QgZG8gbm90aGluZztcIlwiXCJcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyKClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIEBjcmVhdGVfdGFibGVfZnVuY3Rpb25cbiAgICAgIG5hbWU6ICAgICAgICAgICAnc3BsaXRfd29yZHMnXG4gICAgICBjb2x1bW5zOiAgICAgICAgWyAna2V5d29yZCcsIF1cbiAgICAgIHBhcmFtZXRlcnM6ICAgICBbICdsaW5lJywgXVxuICAgICAgcm93czogKCBsaW5lICkgLT5cbiAgICAgICAga2V5d29yZHMgPSBsaW5lLnNwbGl0IC8oPzpcXHB7Wn0rKXwoKD86XFxwe1NjcmlwdD1IYW59KXwoPzpcXHB7TH0rKXwoPzpcXHB7Tn0rKXwoPzpcXHB7U30rKSkvdlxuICAgICAgICAjIGRlYnVnICfOqWp6cnNkYl9fXzUnLCBsaW5lX25yLCBycHIga2V5d29yZHNcbiAgICAgICAgZm9yIGtleXdvcmQgaW4ga2V5d29yZHNcbiAgICAgICAgICBjb250aW51ZSB1bmxlc3Mga2V5d29yZD9cbiAgICAgICAgICBjb250aW51ZSBpZiBrZXl3b3JkIGlzICcnXG4gICAgICAgICAgeWllbGQgeyBrZXl3b3JkLCB9XG4gICAgICAgIDtudWxsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBAY3JlYXRlX3RhYmxlX2Z1bmN0aW9uXG4gICAgICBuYW1lOiAgICAgICAgICdmaWxlX2xpbmVzJ1xuICAgICAgY29sdW1uczogICAgICBbICdsaW5lX25yJywgJ2xpbmUnLCBdXG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ3BhdGgnLCBdXG4gICAgICByb3dzOiAoIHBhdGggKSAtPlxuICAgICAgICBmb3IgeyBsbnI6IGxpbmVfbnIsIGxpbmUsIGVvbCwgfSBmcm9tIEdVWS5mcy53YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zIHBhdGhcbiAgICAgICAgICB5aWVsZCB7IGxpbmVfbnIsIGxpbmUsIH1cbiAgICAgICAgO251bGxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDtudWxsXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxubWF0ZXJpYWxpemVkX2ZpbGVfbWlycm9yID0gLT5cbiAgZGJfcGF0aCAgID0gJy9kZXYvc2htL2JyaWNhYnJhYy5zcWxpdGUnXG4gIHBocmFzZXMgICA9IERicmljX3BocmFzZXMub3BlbiBkYl9wYXRoXG4gIGRlYnVnICfOqWp6cnNkYl9fXzYnLCBwaHJhc2VzLnRlYXJkb3duKClcbiAgZGVidWcgJ86panpyc2RiX19fNycsIHBocmFzZXMucmVidWlsZCgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZG8gPT5cbiAgICBkc2tleSA9ICdodW1kdW0nXG4gICAgcGF0aCAgPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4vLi4vaGVuZ2lzdC1ORy9hc3NldHMvYnJpY2FicmFjL2h1bXB0eS1kdW1wdHkubWQnXG4gICAgcGhyYXNlcy5zdGF0ZW1lbnRzLmluc2VydF9kYXRhc291cmNlLnJ1biB7IGRza2V5LCBwYXRoIH1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBkbyA9PlxuICAgIGRza2V5ID0gJ21uZydcbiAgICBwYXRoICA9IFBBVEgucmVzb2x2ZSBfX2Rpcm5hbWUsICcuLi8uLi8uLi9pby9taW5na3dhaS1yYWNrL2p6cmRzL21lYW5pbmcvbWVhbmluZ3MudHh0J1xuICAgIHBocmFzZXMuc3RhdGVtZW50cy5pbnNlcnRfZGF0YXNvdXJjZS5ydW4geyBkc2tleSwgcGF0aCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZGVidWcgJ86panpyc2RiX19fOCcsIFwicG9wdWxhdGVfZmlsZV9taXJyb3I6IFwiLCBwaHJhc2VzLnN0YXRlbWVudHMucG9wdWxhdGVfZmlsZV9taXJyb3IucnVuKClcbiAgZGVidWcgJ86panpyc2RiX19fOScsIFwicG9wdWxhdGVfa2V5d29yZHM6ICAgIFwiLCBwaHJhc2VzLnN0YXRlbWVudHMucG9wdWxhdGVfa2V5d29yZHMucnVuKClcbiAgZGVidWcgJ86panpyc2RiX18xMCcsIFwiY291bnRfZGF0YXNvdXJjZXM6ICAgIFwiLCBwaHJhc2VzLnN0YXRlbWVudHMuY291bnRfZGF0YXNvdXJjZXMuZ2V0KClcbiAgZGVidWcgJ86panpyc2RiX18xMScsIFwiY291bnRfbWlycm9yX2xpbmVzOiAgIFwiLCBwaHJhc2VzLnN0YXRlbWVudHMuY291bnRfbWlycm9yX2xpbmVzLmdldCgpXG4gICMgZWNobygpOyBlY2hvIHJvdyBmb3Igcm93IGZyb20gcGhyYXNlcy5zdGF0ZW1lbnRzLnNlbGVjdF9mcm9tX21pcnJvci5pdGVyYXRlKClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubG9jYXRpb25zX2Zyb21fa2V5d29yZC5pdGVyYXRlIHsga2V5d29yZDogJ3Rob3VnaHQnLCB9XG4gIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHBocmFzZXMuc3RhdGVtZW50cy5sb2NhdGlvbnNfZnJvbV9rZXl3b3JkLml0ZXJhdGUgeyBrZXl3b3JkOiAnc2hlJywgfVxuICBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubG9jYXRpb25zX2Zyb21fa2V5d29yZC5pdGVyYXRlIHsga2V5d29yZDogJ+W7kycsIH1cbiAgZWNobygpOyBlY2hvIHJvdyBmb3Igcm93IGZyb20gcGhyYXNlcy5zdGF0ZW1lbnRzLmxvY2F0aW9uc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICfluqYnLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZWNobygpOyBlY2hvIHJvdyBmb3Igcm93IGZyb20gcGhyYXNlcy5zdGF0ZW1lbnRzLmxpbmVzX2Zyb21fa2V5d29yZC5pdGVyYXRlIHsga2V5d29yZDogJ3Rob3VnaHQnLCB9XG4gIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHBocmFzZXMuc3RhdGVtZW50cy5saW5lc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICdzaGUnLCB9XG4gIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHBocmFzZXMuc3RhdGVtZW50cy5saW5lc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICflu5MnLCB9XG4gIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHBocmFzZXMuc3RhdGVtZW50cy5saW5lc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICfluqYnLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgO251bGxcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG53cml0ZV9saW5lX2RhdGFfdG9fc3FsaXRlZnMgPSAtPlxuICBkYl9wYXRoICAgPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4vLi4vYnZmcy9idmZzLmRiJ1xuICBidmZzICAgICAgPSBEYnJpYy5vcGVuIGRiX3BhdGhcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBTUUxcIlwiXCJcbiAgd2hlcmUgKCBmaWxlX2lkID0gMiApXG4gIGJsb2NrX251bVxuICBkYXRhXG4gIFwiXCJcIlxuICBTUUxcIlwiXCJjcmVhdGUgdGFibGUgYmJfbGluZV9ieXRlX29mZnNldHMgKFxuICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZHNrZXkgICAgIHRleHQgICAgbm90IG51bGwsXG4gICAgbGluZV9uciAgIGludGVnZXIgbm90IG51bGwsXG4gICAgY2h1bmtfbnIgIGludGVnZXIgbm90IG51bGwsXG4gICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBmaWxlX2lkICAgaW50ZWdlciBub3QgbnVsbCxcbiAgICBibG9ja19udW0gaW50ZWdlciBub3QgbnVsbCxcbiAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGQwICAgICAgICBpbnRlZ2VyIG5vdCBudWxsLCAtLSAwLWJhc2VkICg/KSBpbmRleCB0byBmaXJzdCBieXRlIChpbiB0aGlzIGJsb2NrKVxuICAgIGQxICAgICAgICBpbnRlZ2VyIG5vdCBudWxsLCAtLSAwLWJhc2VkICg/KSBpbmRleCB0byBsYXN0ICBieXRlIChpbiB0aGlzIGJsb2NrKVxuICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZm9yZWlnbiBrZXkgKCBkc2tleSAgICAgICAgICAgICAgICkgcmVmZXJlbmNlcyBkYXRhc291cmNlcyAoIGRza2V5ICksXG4gICAgZm9yZWlnbiBrZXkgKCBmaWxlX2lkLCBibG9ja19udW0gICkgcmVmZXJlbmNlcyBkYXRhICggZmlsZV9pZCwgYmxvY2tfbnVtICksXG4gICAgcHJpbWFyeSBrZXkgKCBkc2tleSwgbGluZV9uciwgY2h1bmtfbnIgKVxuICAgICk7XCJcIlwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgc3RhdGVtZW50ID0gYnZmcy5wcmVwYXJlIFNRTFwiXCJcInNlbGVjdCAqIGZyb20gZGF0YTtcIlwiXCJcbiAgZWNobygpOyBlY2hvIHJvdyBmb3Igcm93IGZyb20gc3RhdGVtZW50Lml0ZXJhdGUoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIDtudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5kZW1vX3JlYWRfbGluZXNfZnJvbV9idWZmZXJzID0gLT5cbiAgeyB3YWxrX2J1ZmZlcnNfd2l0aF9wb3NpdGlvbnMsXG4gICAgd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucywgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2Zhc3RfbGluZXJlYWRlcigpXG4gIHBhdGggPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4vcGFja2FnZS5qc29uJ1xuICBmb3IgZCBmcm9tIHdhbGtfYnVmZmVyc193aXRoX3Bvc2l0aW9ucyBwYXRoXG4gICAgZGVidWcgJ86panpyc2RiX18xMCcsIGRcbiAgZm9yIGQgZnJvbSB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zIHBhdGgsIHsgY2h1bmtfc2l6ZTogMTAsIH1cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzEwJywgZFxuICA7bnVsbFxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmlmIG1vZHVsZSBpcyByZXF1aXJlLm1haW4gdGhlbiBkbyA9PlxuICAjIG1hdGVyaWFsaXplZF9maWxlX21pcnJvcigpXG4gICMgd3JpdGVfbGluZV9kYXRhX3RvX3NxbGl0ZWZzKClcbiAgZGVtb19yZWFkX2xpbmVzX2Zyb21fYnVmZmVycygpXG4gIDtudWxsXG5cbiJdfQ==
