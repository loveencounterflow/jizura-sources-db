(function() {
  'use strict';
  var Bsql3, Dbric, Dbric_phrases, GUY, PATH, SFMODULES, SQL, alert, blue, bold, debug, echo, gold, green, grey, help, info, inspect, internals, log, materialized_file_mirror, plain, praise, red, reverse, rpr, urge, warn, whisper, white, write_line_data_to_sqlitefs;

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
  if (module === require.main) {
    (() => {
      // materialized_file_mirror()
      write_line_data_to_sqlitefs();
      return null;
    })();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsYUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLFNBQUEsRUFBQSxHQUFBLEVBQUEsd0JBQUEsRUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEtBQUEsRUFBQSwyQkFBQTs7O0VBR0EsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxLQURGLEVBRUUsSUFGRixFQUdFLElBSEYsRUFJRSxLQUpGLEVBS0UsTUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsT0FSRixDQUFBLEdBUTRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBUixDQUFvQixtQkFBcEIsQ0FSNUI7O0VBU0EsQ0FBQSxDQUFFLEdBQUYsRUFDRSxPQURGLEVBRUUsSUFGRixFQUdFLEtBSEYsRUFJRSxLQUpGLEVBS0UsSUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsR0FSRixFQVNFLElBVEYsRUFVRSxPQVZGLEVBV0UsR0FYRixDQUFBLEdBVzRCLEdBQUcsQ0FBQyxHQVhoQyxFQWJBOzs7Ozs7O0VBOEJBLFNBQUEsR0FBNEIsT0FBQSxDQUFRLDJDQUFSLEVBOUI1Qjs7O0VBZ0NBLElBQUEsR0FBNEIsT0FBQSxDQUFRLFdBQVIsRUFoQzVCOzs7RUFrQ0EsQ0FBQSxDQUFFLEtBQUYsRUFDRSxHQURGLEVBRUUs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bid1c2Ugc3RyaWN0J1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbkdVWSAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXknXG57IGFsZXJ0XG4gIGRlYnVnXG4gIGhlbHBcbiAgaW5mb1xuICBwbGFpblxuICBwcmFpc2VcbiAgdXJnZVxuICB3YXJuXG4gIHdoaXNwZXIgfSAgICAgICAgICAgICAgID0gR1VZLnRybS5nZXRfbG9nZ2VycyAnaml6dXJhLXNvdXJjZXMtZGInXG57IHJwclxuICBpbnNwZWN0XG4gIGVjaG9cbiAgd2hpdGVcbiAgZ3JlZW5cbiAgYmx1ZVxuICBnb2xkXG4gIGdyZXlcbiAgcmVkXG4gIGJvbGRcbiAgcmV2ZXJzZVxuICBsb2cgICAgIH0gICAgICAgICAgICAgICA9IEdVWS50cm1cbiMgeyBmIH0gICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9lZmZzdHJpbmcnXG4jIHdyaXRlICAgICAgICAgICAgICAgICAgICAgPSAoIHAgKSAtPiBwcm9jZXNzLnN0ZG91dC53cml0ZSBwXG4jIHsgbmZhIH0gICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvbm9ybWFsaXplLWZ1bmN0aW9uLWFyZ3VtZW50cydcbiMgR1RORyAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ndXktdGVzdC1ORydcbiMgeyBUZXN0ICAgICAgICAgICAgICAgICAgfSA9IEdUTkdcblNGTU9EVUxFUyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvYnJpY2FicmFjLXNmbW9kdWxlcydcbiMgRlMgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6ZnMnXG5QQVRIICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpwYXRoJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG57IERicmljLFxuICBTUUwsXG4gIGludGVybmFscywgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2RicmljKClcbkJzcWwzICAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYmV0dGVyLXNxbGl0ZTMnXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIERicmljX3BocmFzZXMgZXh0ZW5kcyBEYnJpY1xuICBAZGJfY2xhc3M6IEJzcWwzXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQGJ1aWxkOiBbXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUgZGF0YXNvdXJjZXMgKFxuICAgICAgICBkc2tleSB0ZXh0IHVuaXF1ZSBub3QgbnVsbCBwcmltYXJ5IGtleSxcbiAgICAgICAgcGF0aCB0ZXh0IG5vdCBudWxsICk7XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUgbWlycm9yIChcbiAgICAgICAgZHNrZXkgICB0ZXh0ICAgIG5vdCBudWxsLFxuICAgICAgICBsaW5lX25yIGludGVnZXIgbm90IG51bGwsXG4gICAgICAgIGxpbmUgICAgdGV4dCAgICBub3QgbnVsbCxcbiAgICAgIGZvcmVpZ24ga2V5ICggZHNrZXkgKSByZWZlcmVuY2VzIGRhdGFzb3VyY2VzICggZHNrZXkgKSxcbiAgICAgIHByaW1hcnkga2V5ICggZHNrZXksIGxpbmVfbnIgKSApO1wiXCJcIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGtleXdvcmRzIChcbiAgICAgICAgZHNrZXkgICB0ZXh0ICAgIG5vdCBudWxsLFxuICAgICAgICBsaW5lX25yIGludGVnZXIgbm90IG51bGwsXG4gICAgICAgIGtleXdvcmQgdGV4dCAgICBub3QgbnVsbCxcbiAgICAgIGZvcmVpZ24ga2V5ICggZHNrZXkgKSByZWZlcmVuY2VzIGRhdGFzb3VyY2VzICggZHNrZXkgKSxcbiAgICAgIHByaW1hcnkga2V5ICggZHNrZXksIGxpbmVfbnIsIGtleXdvcmQgKSApO1wiXCJcIlxuICAgIF1cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAc3RhdGVtZW50czpcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9kYXRhc291cmNlOiBTUUxcIlwiXCJpbnNlcnQgaW50byBkYXRhc291cmNlcyAoIGRza2V5LCBwYXRoICkgdmFsdWVzICggJGRza2V5LCAkcGF0aCApXG4gICAgICBvbiBjb25mbGljdCAoIGRza2V5ICkgZG8gdXBkYXRlIHNldCBwYXRoID0gJHBhdGg7XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfa2V5d29yZDogU1FMXCJcIlwiaW5zZXJ0IGludG8ga2V5d29yZHMgKCBkc2tleSwgbGluZV9uciwga2V5d29yZCApIHZhbHVlcyAoICRkc2tleSwgJGxpbmVfbnIsICRrZXl3b3JkIClcbiAgICAgIG9uIGNvbmZsaWN0ICggZHNrZXksIGxpbmVfbnIsIGtleXdvcmQgKSBkbyBub3RoaW5nO1wiXCJcIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc2VsZWN0X2Zyb21fZGF0YXNvdXJjZXM6IFNRTFwiXCJcInNlbGVjdCAqIGZyb20gZGF0YXNvdXJjZXMgb3JkZXIgYnkgZHNrZXk7XCJcIlwiXG4gICAgc2VsZWN0X2Zyb21fbWlycm9yOiAgICAgIFNRTFwiXCJcInNlbGVjdCAqIGZyb20gbWlycm9yIG9yZGVyIGJ5IGRza2V5LCBsaW5lX25yO1wiXCJcIlxuICAgIGNvdW50X2RhdGFzb3VyY2VzOiAgICAgICBTUUxcIlwiXCJzZWxlY3QgY291bnQoKikgYXMgZGF0YXNvdXJjZV9jb3VudCAgZnJvbSBkYXRhc291cmNlcztcIlwiXCJcbiAgICBjb3VudF9taXJyb3JfbGluZXM6ICAgICAgU1FMXCJcIlwic2VsZWN0IGNvdW50KCopIGFzIG1pcnJvcl9saW5lX2NvdW50IGZyb20gbWlycm9yO1wiXCJcIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc2VsZWN0X2Zyb21fa2V5d29yZHM6IFNRTFwiXCJcInNlbGVjdCAqIGZyb20ga2V5d29yZHMgb3JkZXIgYnkga2V5d29yZCwgZHNrZXksIGxpbmVfbnI7XCJcIlwiXG4gICAgbG9jYXRpb25zX2Zyb21fa2V5d29yZDogU1FMXCJcIlwic2VsZWN0ICogZnJvbSBrZXl3b3Jkc1xuICAgICAgd2hlcmUga2V5d29yZCA9ICRrZXl3b3JkXG4gICAgICBvcmRlciBieSBrZXl3b3JkLCBkc2tleSwgbGluZV9ucjtcIlwiXCJcbiAgICBsaW5lc19mcm9tX2tleXdvcmQ6IFNRTFwiXCJcInNlbGVjdFxuICAgICAgICBrdy5kc2tleSAgICBhcyBkc2tleSxcbiAgICAgICAga3cubGluZV9uciAgYXMgbGluZV9ucixcbiAgICAgICAga3cua2V5d29yZCAgYXMga2V5d29yZCxcbiAgICAgICAgbWkubGluZSAgICAgYXMgbGluZVxuICAgICAgZnJvbSBrZXl3b3JkcyBhcyBrd1xuICAgICAgam9pbiBtaXJyb3IgICBhcyBtaSB1c2luZyAoIGRza2V5LCBsaW5lX25yIClcbiAgICAgIHdoZXJlIGtleXdvcmQgPSAka2V5d29yZFxuICAgICAgb3JkZXIgYnkga2V5d29yZCwgZHNrZXksIGxpbmVfbnI7XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBzZWxlY3RfZnJvbV9taXJyb3I6IFNRTFwiXCJcInNlbGVjdCAqIGZyb20gbWlycm9yIG9yZGVyIGJ5IGRza2V5O1wiXCJcIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcG9wdWxhdGVfZmlsZV9taXJyb3I6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8gbWlycm9yICggZHNrZXksIGxpbmVfbnIsIGxpbmUgKVxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICBkcy5kc2tleSAgICBhcyBkc2tleSxcbiAgICAgICAgICBmbC5saW5lX25yICBhcyBsaW5lX25yLFxuICAgICAgICAgIGZsLmxpbmUgICAgIGFzIGxpbmVcbiAgICAgICAgZnJvbSBkYXRhc291cmNlcyAgICAgICAgYXMgZHNcbiAgICAgICAgbGVmdCBqb2luIG1pcnJvciAgICAgICAgYXMgbWkgdXNpbmcgKCBkc2tleSApLFxuICAgICAgICBmaWxlX2xpbmVzKCBkcy5wYXRoICkgICBhcyBmbFxuICAgICAgICB3aGVyZSB0cnVlIC0tIHdoZXJlIGNsYXVzZSBqdXN0IGEgc3ludGFjdGljIGd1YXJkIGFzIHBlciBodHRwczovL3NxbGl0ZS5vcmcvbGFuZ191cHNlcnQuaHRtbFxuICAgICAgICBvbiBjb25mbGljdCBkbyB1cGRhdGUgc2V0IGxpbmUgPSBleGNsdWRlZC5saW5lO1wiXCJcIlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcG9wdWxhdGVfa2V5d29yZHM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ga2V5d29yZHMgKCBkc2tleSwgbGluZV9uciwga2V5d29yZCApXG4gICAgICAgIHNlbGVjdFxuICAgICAgICAgIGRzLmRza2V5ICAgIGFzIGRza2V5LFxuICAgICAgICAgIG1pLmxpbmVfbnIgIGFzIGxpbmVfbnIsXG4gICAgICAgICAgc3cua2V5d29yZCAgYXMga2V5d29yZFxuICAgICAgICBmcm9tIGRhdGFzb3VyY2VzICAgICAgICBhcyBkc1xuICAgICAgICBqb2luIG1pcnJvciAgICAgICAgICAgICBhcyBtaSB1c2luZyAoIGRza2V5ICksXG4gICAgICAgIHNwbGl0X3dvcmRzKCBtaS5saW5lICkgIGFzIHN3XG4gICAgICAgIHdoZXJlIHRydWUgLS0gd2hlcmUgY2xhdXNlIGp1c3QgYSBzeW50YWN0aWMgZ3VhcmQgYXMgcGVyIGh0dHBzOi8vc3FsaXRlLm9yZy9sYW5nX3Vwc2VydC5odG1sXG4gICAgICAgIG9uIGNvbmZsaWN0IGRvIG5vdGhpbmc7XCJcIlwiXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlcigpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBAY3JlYXRlX3RhYmxlX2Z1bmN0aW9uXG4gICAgICBuYW1lOiAgICAgICAgICAgJ3NwbGl0X3dvcmRzJ1xuICAgICAgY29sdW1uczogICAgICAgIFsgJ2tleXdvcmQnLCBdXG4gICAgICBwYXJhbWV0ZXJzOiAgICAgWyAnbGluZScsIF1cbiAgICAgIHJvd3M6ICggbGluZSApIC0+XG4gICAgICAgIGtleXdvcmRzID0gbGluZS5zcGxpdCAvKD86XFxwe1p9Kyl8KCg/OlxccHtTY3JpcHQ9SGFufSl8KD86XFxwe0x9Kyl8KD86XFxwe059Kyl8KD86XFxwe1N9KykpL3ZcbiAgICAgICAgIyBkZWJ1ZyAnzqlqenJzZGJfX181JywgbGluZV9uciwgcnByIGtleXdvcmRzXG4gICAgICAgIGZvciBrZXl3b3JkIGluIGtleXdvcmRzXG4gICAgICAgICAgY29udGludWUgdW5sZXNzIGtleXdvcmQ/XG4gICAgICAgICAgY29udGludWUgaWYga2V5d29yZCBpcyAnJ1xuICAgICAgICAgIHlpZWxkIHsga2V5d29yZCwgfVxuICAgICAgICA7bnVsbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQGNyZWF0ZV90YWJsZV9mdW5jdGlvblxuICAgICAgbmFtZTogICAgICAgICAnZmlsZV9saW5lcydcbiAgICAgIGNvbHVtbnM6ICAgICAgWyAnbGluZV9ucicsICdsaW5lJywgXVxuICAgICAgcGFyYW1ldGVyczogICBbICdwYXRoJywgXVxuICAgICAgcm93czogKCBwYXRoICkgLT5cbiAgICAgICAgZm9yIHsgbG5yOiBsaW5lX25yLCBsaW5lLCBlb2wsIH0gZnJvbSBHVVkuZnMud2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBwYXRoXG4gICAgICAgICAgeWllbGQgeyBsaW5lX25yLCBsaW5lLCB9XG4gICAgICAgIDtudWxsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7bnVsbFxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbm1hdGVyaWFsaXplZF9maWxlX21pcnJvciA9IC0+XG4gIGRiX3BhdGggICA9ICcvZGV2L3NobS9icmljYWJyYWMuc3FsaXRlJ1xuICBwaHJhc2VzICAgPSBEYnJpY19waHJhc2VzLm9wZW4gZGJfcGF0aFxuICBkZWJ1ZyAnzqlqenJzZGJfX182JywgcGhyYXNlcy50ZWFyZG93bigpXG4gIGRlYnVnICfOqWp6cnNkYl9fXzcnLCBwaHJhc2VzLnJlYnVpbGQoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGRvID0+XG4gICAgZHNrZXkgPSAnaHVtZHVtJ1xuICAgIHBhdGggID0gUEFUSC5yZXNvbHZlIF9fZGlybmFtZSwgJy4uLy4uL2hlbmdpc3QtTkcvYXNzZXRzL2JyaWNhYnJhYy9odW1wdHktZHVtcHR5Lm1kJ1xuICAgIHBocmFzZXMuc3RhdGVtZW50cy5pbnNlcnRfZGF0YXNvdXJjZS5ydW4geyBkc2tleSwgcGF0aCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZG8gPT5cbiAgICBkc2tleSA9ICdtbmcnXG4gICAgcGF0aCAgPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4vLi4vLi4vaW8vbWluZ2t3YWktcmFjay9qenJkcy9tZWFuaW5nL21lYW5pbmdzLnR4dCdcbiAgICBwaHJhc2VzLnN0YXRlbWVudHMuaW5zZXJ0X2RhdGFzb3VyY2UucnVuIHsgZHNrZXksIHBhdGggfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGRlYnVnICfOqWp6cnNkYl9fXzgnLCBcInBvcHVsYXRlX2ZpbGVfbWlycm9yOiBcIiwgcGhyYXNlcy5zdGF0ZW1lbnRzLnBvcHVsYXRlX2ZpbGVfbWlycm9yLnJ1bigpXG4gIGRlYnVnICfOqWp6cnNkYl9fXzknLCBcInBvcHVsYXRlX2tleXdvcmRzOiAgICBcIiwgcGhyYXNlcy5zdGF0ZW1lbnRzLnBvcHVsYXRlX2tleXdvcmRzLnJ1bigpXG4gIGRlYnVnICfOqWp6cnNkYl9fMTAnLCBcImNvdW50X2RhdGFzb3VyY2VzOiAgICBcIiwgcGhyYXNlcy5zdGF0ZW1lbnRzLmNvdW50X2RhdGFzb3VyY2VzLmdldCgpXG4gIGRlYnVnICfOqWp6cnNkYl9fMTEnLCBcImNvdW50X21pcnJvcl9saW5lczogICBcIiwgcGhyYXNlcy5zdGF0ZW1lbnRzLmNvdW50X21pcnJvcl9saW5lcy5nZXQoKVxuICAjIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHBocmFzZXMuc3RhdGVtZW50cy5zZWxlY3RfZnJvbV9taXJyb3IuaXRlcmF0ZSgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZWNobygpOyBlY2hvIHJvdyBmb3Igcm93IGZyb20gcGhyYXNlcy5zdGF0ZW1lbnRzLmxvY2F0aW9uc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICd0aG91Z2h0JywgfVxuICBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubG9jYXRpb25zX2Zyb21fa2V5d29yZC5pdGVyYXRlIHsga2V5d29yZDogJ3NoZScsIH1cbiAgZWNobygpOyBlY2hvIHJvdyBmb3Igcm93IGZyb20gcGhyYXNlcy5zdGF0ZW1lbnRzLmxvY2F0aW9uc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICflu5MnLCB9XG4gIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHBocmFzZXMuc3RhdGVtZW50cy5sb2NhdGlvbnNfZnJvbV9rZXl3b3JkLml0ZXJhdGUgeyBrZXl3b3JkOiAn5bqmJywgfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHBocmFzZXMuc3RhdGVtZW50cy5saW5lc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICd0aG91Z2h0JywgfVxuICBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubGluZXNfZnJvbV9rZXl3b3JkLml0ZXJhdGUgeyBrZXl3b3JkOiAnc2hlJywgfVxuICBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubGluZXNfZnJvbV9rZXl3b3JkLml0ZXJhdGUgeyBrZXl3b3JkOiAn5buTJywgfVxuICBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubGluZXNfZnJvbV9rZXl3b3JkLml0ZXJhdGUgeyBrZXl3b3JkOiAn5bqmJywgfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIDtudWxsXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxud3JpdGVfbGluZV9kYXRhX3RvX3NxbGl0ZWZzID0gLT5cbiAgZGJfcGF0aCAgID0gUEFUSC5yZXNvbHZlIF9fZGlybmFtZSwgJy4uLy4uL2J2ZnMvYnZmcy5kYidcbiAgYnZmcyAgICAgID0gRGJyaWMub3BlbiBkYl9wYXRoXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgU1FMXCJcIlwiXG4gIHdoZXJlICggZmlsZV9pZCA9IDIgKVxuICBibG9ja19udW1cbiAgZGF0YVxuICBcIlwiXCJcbiAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGJiX2xpbmVfYnl0ZV9vZmZzZXRzIChcbiAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRza2V5ICAgICB0ZXh0ICAgIG5vdCBudWxsLFxuICAgIGxpbmVfbnIgICBpbnRlZ2VyIG5vdCBudWxsLFxuICAgIGNodW5rX25yICBpbnRlZ2VyIG5vdCBudWxsLFxuICAgIC0tIC4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZmlsZV9pZCAgIGludGVnZXIgbm90IG51bGwsXG4gICAgYmxvY2tfbnVtIGludGVnZXIgbm90IG51bGwsXG4gICAgLS0gLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkMCAgICAgICAgaW50ZWdlciBub3QgbnVsbCwgLS0gMC1iYXNlZCAoPykgaW5kZXggdG8gZmlyc3QgYnl0ZSAoaW4gdGhpcyBibG9jaylcbiAgICBkMSAgICAgICAgaW50ZWdlciBub3QgbnVsbCwgLS0gMC1iYXNlZCAoPykgaW5kZXggdG8gbGFzdCAgYnl0ZSAoaW4gdGhpcyBibG9jaylcbiAgICAtLSAuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGZvcmVpZ24ga2V5ICggZHNrZXkgICAgICAgICAgICAgICApIHJlZmVyZW5jZXMgZGF0YXNvdXJjZXMgKCBkc2tleSApLFxuICAgIGZvcmVpZ24ga2V5ICggZmlsZV9pZCwgYmxvY2tfbnVtICApIHJlZmVyZW5jZXMgZGF0YSAoIGZpbGVfaWQsIGJsb2NrX251bSApLFxuICAgIHByaW1hcnkga2V5ICggZHNrZXksIGxpbmVfbnIsIGNodW5rX25yIClcbiAgICApO1wiXCJcIlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHN0YXRlbWVudCA9IGJ2ZnMucHJlcGFyZSBTUUxcIlwiXCJzZWxlY3QgKiBmcm9tIGRhdGE7XCJcIlwiXG4gIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHN0YXRlbWVudC5pdGVyYXRlKClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICA7bnVsbFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuaWYgbW9kdWxlIGlzIHJlcXVpcmUubWFpbiB0aGVuIGRvID0+XG4gICMgbWF0ZXJpYWxpemVkX2ZpbGVfbWlycm9yKClcbiAgd3JpdGVfbGluZV9kYXRhX3RvX3NxbGl0ZWZzKClcbiAgO251bGxcblxuIl19
