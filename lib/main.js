(function() {
  'use strict';
  var GUY, PATH, SFMODULES, alert, blue, bold, debug, echo, gold, green, grey, help, info, inspect, log, materialized_file_mirror, plain, praise, red, reverse, rpr, urge, warn, whisper, white;

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
  materialized_file_mirror = function() {
    var Bsql3, Dbric, Dbric_phrases, SQL, internals;
    ({Dbric, SQL, internals} = SFMODULES.unstable.require_dbric());
    Bsql3 = require('better-sqlite3');
    Dbric_phrases = (function() {
      //=========================================================================================================
      class Dbric_phrases extends Dbric {
        //-------------------------------------------------------------------------------------------------------
        initialize() {
          super.initialize();
          //.....................................................................................................
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
          //.....................................................................................................
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
          //.....................................................................................................
          return null;
        }

      };

      Dbric_phrases.db_class = Bsql3;

      //-------------------------------------------------------------------------------------------------------
      Dbric_phrases.build = [
        //.....................................................................................................
        SQL`create table datasources (
dskey text unique not null primary key,
path text not null );`,
        //.....................................................................................................
        SQL`create table mirror (
  dskey   text    not null,
  line_nr integer not null,
  line    text    not null,
foreign key ( dskey ) references datasources ( dskey ),
primary key ( dskey, line_nr ) );`,
        //.....................................................................................................
        SQL`create table keywords (
  dskey   text    not null,
  line_nr integer not null,
  keyword text    not null,
foreign key ( dskey ) references datasources ( dskey ),
primary key ( dskey, line_nr, keyword ) );`
      ];

      //-------------------------------------------------------------------------------------------------------
      Dbric_phrases.statements = {
        //.....................................................................................................
        insert_datasource: SQL`insert into datasources ( dskey, path ) values ( $dskey, $path )
on conflict ( dskey ) do update set path = $path;`,
        //.....................................................................................................
        insert_keyword: SQL`insert into keywords ( dskey, line_nr, keyword ) values ( $dskey, $line_nr, $keyword )
on conflict ( dskey, line_nr, keyword ) do nothing;`,
        //.....................................................................................................
        select_from_datasources: SQL`select * from datasources order by dskey;`,
        select_from_mirror: SQL`select * from mirror order by dskey, line_nr;`,
        count_datasources: SQL`select count(*) as datasource_count  from datasources;`,
        count_mirror_lines: SQL`select count(*) as mirror_line_count from mirror;`,
        //.....................................................................................................
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
        //.....................................................................................................
        select_from_mirror: SQL`select * from mirror order by dskey;`,
        //.....................................................................................................
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
        //.....................................................................................................
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
    (() => {      //=========================================================================================================
      var db_path, phrases, row;
      db_path = '/dev/shm/bricabrac.sqlite';
      phrases = Dbric_phrases.open(db_path);
      debug('Ωjzrsdb___6', phrases.teardown());
      debug('Ωjzrsdb___7', phrases.rebuild());
      (() => {        //.......................................................................................................
        var dskey, path;
        dskey = 'humdum';
        path = PATH.resolve(__dirname, '../../hengist-NG/assets/bricabrac/humpty-dumpty.md');
        return phrases.statements.insert_datasource.run({dskey, path});
      })();
      (() => {        //.......................................................................................................
        var dskey, path;
        dskey = 'mng';
        path = PATH.resolve(__dirname, '../../../io/mingkwai-rack/jzrds/meaning/meanings.txt');
        return phrases.statements.insert_datasource.run({dskey, path});
      })();
      //.......................................................................................................
      debug('Ωjzrsdb___8', "populate_file_mirror: ", phrases.statements.populate_file_mirror.run());
      debug('Ωjzrsdb___9', "populate_keywords:    ", phrases.statements.populate_keywords.run());
      debug('Ωjzrsdb__10', "count_datasources:    ", phrases.statements.count_datasources.get());
      debug('Ωjzrsdb__11', "count_mirror_lines:   ", phrases.statements.count_mirror_lines.get());
      // echo(); echo row for row from phrases.statements.select_from_mirror.iterate()
      //.......................................................................................................
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
      //.......................................................................................................
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
      //.......................................................................................................
      return null;
    })();
    //.........................................................................................................
    return null;
  };

  //===========================================================================================================
  if (module === require.main) {
    (() => {
      materialized_file_mirror();
      return null;
    })();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLHdCQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxLQUFBOzs7RUFHQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixDQUFBLENBQUUsS0FBRixFQUNFLEtBREYsRUFFRSxJQUZGLEVBR0UsSUFIRixFQUlFLEtBSkYsRUFLRSxNQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxPQVJGLENBQUEsR0FRNEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFSLENBQW9CLG1CQUFwQixDQVI1Qjs7RUFTQSxDQUFBLENBQUUsR0FBRixFQUNFLE9BREYsRUFFRSxJQUZGLEVBR0UsS0FIRixFQUlFLEtBSkYsRUFLRSxJQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxHQVJGLEVBU0UsSUFURixFQVVFLE9BVkYsRUFXRSxHQVhGLENBQUEsR0FXNEIsR0FBRyxDQUFDLEdBWGhDLEVBYkE7Ozs7Ozs7RUE4QkEsU0FBQSxHQUE0QixPQUFBLENBQVEsMkNBQVIsRUE5QjVCOzs7RUFnQ0EsSUFBQSxHQUE0QixPQUFBLENBQVEsV0FBUixFQWhDNUI7OztFQW9DQSx3QkFBQSxHQUEyQixRQUFBLENBQUEsQ0FBQTtBQUMzQixRQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsYUFBQSxFQUFBLEdBQUEsRUFBQTtJQUFFLENBQUEsQ0FB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O1FBQUEsSUFBQSxDQUFLLEdBQUw7TUFBQTtNQUNSLElBQUEsQ0FBQTtNQUFRLEtBQUE7O1FBQUE7UUFBQSxJQUFBLENBQUssR0FBTDtNQUFBO01BQ1IsSUFBQSxDQUFBO01BQVEsS0FBQTs7UUFBQTtRQUFBLElBQUEsQ0FBSyxHQUFMO01BQUEsQ0F4Qlo7O01BMEJJLElBQUEsQ0FBQTtNQUFRLEtBQUE7O1FBQUE7UUFBQSxJQUFBLENBQUssR0FBTDtNQUFBO01BQ1IsSUFBQSxDQUFBO01BQVEsS0FBQTs7UUFBQTtRQUFBLElBQUEsQ0FBSyxHQUFMO01BQUE7TUFDUixJQUFBLENBQUE7TUFBUSxLQUFBOztRQUFBO1FBQUEsSUFBQSxDQUFLLEdBQUw7TUFBQTtNQUNSLElBQUEsQ0FBQTtNQUFRLEtBQUE7O1FBQUE7UUFBQSxJQUFBLENBQUssR0FBTDtNQUFBLENBN0JaOzthQStCSztJQWhDQSxDQUFBLElBN0dMOztXQStJRztFQWhKd0IsRUFwQzNCOzs7RUF3TEEsSUFBRyxNQUFBLEtBQVUsT0FBTyxDQUFDLElBQXJCO0lBQWtDLENBQUEsQ0FBQSxDQUFBLEdBQUE7TUFDaEMsd0JBQUEsQ0FBQTthQUNDO0lBRitCLENBQUEsSUFBbEM7O0FBeExBIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0J1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbkdVWSAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXknXG57IGFsZXJ0XG4gIGRlYnVnXG4gIGhlbHBcbiAgaW5mb1xuICBwbGFpblxuICBwcmFpc2VcbiAgdXJnZVxuICB3YXJuXG4gIHdoaXNwZXIgfSAgICAgICAgICAgICAgID0gR1VZLnRybS5nZXRfbG9nZ2VycyAnaml6dXJhLXNvdXJjZXMtZGInXG57IHJwclxuICBpbnNwZWN0XG4gIGVjaG9cbiAgd2hpdGVcbiAgZ3JlZW5cbiAgYmx1ZVxuICBnb2xkXG4gIGdyZXlcbiAgcmVkXG4gIGJvbGRcbiAgcmV2ZXJzZVxuICBsb2cgICAgIH0gICAgICAgICAgICAgICA9IEdVWS50cm1cbiMgeyBmIH0gICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9lZmZzdHJpbmcnXG4jIHdyaXRlICAgICAgICAgICAgICAgICAgICAgPSAoIHAgKSAtPiBwcm9jZXNzLnN0ZG91dC53cml0ZSBwXG4jIHsgbmZhIH0gICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvbm9ybWFsaXplLWZ1bmN0aW9uLWFyZ3VtZW50cydcbiMgR1RORyAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ndXktdGVzdC1ORydcbiMgeyBUZXN0ICAgICAgICAgICAgICAgICAgfSA9IEdUTkdcblNGTU9EVUxFUyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvYnJpY2FicmFjLXNmbW9kdWxlcydcbiMgRlMgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6ZnMnXG5QQVRIICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpwYXRoJ1xuXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxubWF0ZXJpYWxpemVkX2ZpbGVfbWlycm9yID0gLT5cbiAgeyBEYnJpYyxcbiAgICBTUUwsXG4gICAgaW50ZXJuYWxzLCAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZGJyaWMoKVxuICBCc3FsMyAgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2JldHRlci1zcWxpdGUzJ1xuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIGNsYXNzIERicmljX3BocmFzZXMgZXh0ZW5kcyBEYnJpY1xuICAgIEBkYl9jbGFzczogQnNxbDNcbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIEBidWlsZDogW1xuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUgZGF0YXNvdXJjZXMgKFxuICAgICAgICAgIGRza2V5IHRleHQgdW5pcXVlIG5vdCBudWxsIHByaW1hcnkga2V5LFxuICAgICAgICAgIHBhdGggdGV4dCBub3QgbnVsbCApO1wiXCJcIlxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUgbWlycm9yIChcbiAgICAgICAgICBkc2tleSAgIHRleHQgICAgbm90IG51bGwsXG4gICAgICAgICAgbGluZV9uciBpbnRlZ2VyIG5vdCBudWxsLFxuICAgICAgICAgIGxpbmUgICAgdGV4dCAgICBub3QgbnVsbCxcbiAgICAgICAgZm9yZWlnbiBrZXkgKCBkc2tleSApIHJlZmVyZW5jZXMgZGF0YXNvdXJjZXMgKCBkc2tleSApLFxuICAgICAgICBwcmltYXJ5IGtleSAoIGRza2V5LCBsaW5lX25yICkgKTtcIlwiXCJcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGtleXdvcmRzIChcbiAgICAgICAgICBkc2tleSAgIHRleHQgICAgbm90IG51bGwsXG4gICAgICAgICAgbGluZV9uciBpbnRlZ2VyIG5vdCBudWxsLFxuICAgICAgICAgIGtleXdvcmQgdGV4dCAgICBub3QgbnVsbCxcbiAgICAgICAgZm9yZWlnbiBrZXkgKCBkc2tleSApIHJlZmVyZW5jZXMgZGF0YXNvdXJjZXMgKCBkc2tleSApLFxuICAgICAgICBwcmltYXJ5IGtleSAoIGRza2V5LCBsaW5lX25yLCBrZXl3b3JkICkgKTtcIlwiXCJcbiAgICAgIF1cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIEBzdGF0ZW1lbnRzOlxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBpbnNlcnRfZGF0YXNvdXJjZTogU1FMXCJcIlwiaW5zZXJ0IGludG8gZGF0YXNvdXJjZXMgKCBkc2tleSwgcGF0aCApIHZhbHVlcyAoICRkc2tleSwgJHBhdGggKVxuICAgICAgICBvbiBjb25mbGljdCAoIGRza2V5ICkgZG8gdXBkYXRlIHNldCBwYXRoID0gJHBhdGg7XCJcIlwiXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIGluc2VydF9rZXl3b3JkOiBTUUxcIlwiXCJpbnNlcnQgaW50byBrZXl3b3JkcyAoIGRza2V5LCBsaW5lX25yLCBrZXl3b3JkICkgdmFsdWVzICggJGRza2V5LCAkbGluZV9uciwgJGtleXdvcmQgKVxuICAgICAgICBvbiBjb25mbGljdCAoIGRza2V5LCBsaW5lX25yLCBrZXl3b3JkICkgZG8gbm90aGluZztcIlwiXCJcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0X2Zyb21fZGF0YXNvdXJjZXM6IFNRTFwiXCJcInNlbGVjdCAqIGZyb20gZGF0YXNvdXJjZXMgb3JkZXIgYnkgZHNrZXk7XCJcIlwiXG4gICAgICBzZWxlY3RfZnJvbV9taXJyb3I6ICAgICAgU1FMXCJcIlwic2VsZWN0ICogZnJvbSBtaXJyb3Igb3JkZXIgYnkgZHNrZXksIGxpbmVfbnI7XCJcIlwiXG4gICAgICBjb3VudF9kYXRhc291cmNlczogICAgICAgU1FMXCJcIlwic2VsZWN0IGNvdW50KCopIGFzIGRhdGFzb3VyY2VfY291bnQgIGZyb20gZGF0YXNvdXJjZXM7XCJcIlwiXG4gICAgICBjb3VudF9taXJyb3JfbGluZXM6ICAgICAgU1FMXCJcIlwic2VsZWN0IGNvdW50KCopIGFzIG1pcnJvcl9saW5lX2NvdW50IGZyb20gbWlycm9yO1wiXCJcIlxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3RfZnJvbV9rZXl3b3JkczogU1FMXCJcIlwic2VsZWN0ICogZnJvbSBrZXl3b3JkcyBvcmRlciBieSBrZXl3b3JkLCBkc2tleSwgbGluZV9ucjtcIlwiXCJcbiAgICAgIGxvY2F0aW9uc19mcm9tX2tleXdvcmQ6IFNRTFwiXCJcInNlbGVjdCAqIGZyb20ga2V5d29yZHNcbiAgICAgICAgd2hlcmUga2V5d29yZCA9ICRrZXl3b3JkXG4gICAgICAgIG9yZGVyIGJ5IGtleXdvcmQsIGRza2V5LCBsaW5lX25yO1wiXCJcIlxuICAgICAgbGluZXNfZnJvbV9rZXl3b3JkOiBTUUxcIlwiXCJzZWxlY3RcbiAgICAgICAgICBrdy5kc2tleSAgICBhcyBkc2tleSxcbiAgICAgICAgICBrdy5saW5lX25yICBhcyBsaW5lX25yLFxuICAgICAgICAgIGt3LmtleXdvcmQgIGFzIGtleXdvcmQsXG4gICAgICAgICAgbWkubGluZSAgICAgYXMgbGluZVxuICAgICAgICBmcm9tIGtleXdvcmRzIGFzIGt3XG4gICAgICAgIGpvaW4gbWlycm9yICAgYXMgbWkgdXNpbmcgKCBkc2tleSwgbGluZV9uciApXG4gICAgICAgIHdoZXJlIGtleXdvcmQgPSAka2V5d29yZFxuICAgICAgICBvcmRlciBieSBrZXl3b3JkLCBkc2tleSwgbGluZV9ucjtcIlwiXCJcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0X2Zyb21fbWlycm9yOiBTUUxcIlwiXCJzZWxlY3QgKiBmcm9tIG1pcnJvciBvcmRlciBieSBkc2tleTtcIlwiXCJcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgcG9wdWxhdGVfZmlsZV9taXJyb3I6IFNRTFwiXCJcIlxuICAgICAgICBpbnNlcnQgaW50byBtaXJyb3IgKCBkc2tleSwgbGluZV9uciwgbGluZSApXG4gICAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICBkcy5kc2tleSAgICBhcyBkc2tleSxcbiAgICAgICAgICAgIGZsLmxpbmVfbnIgIGFzIGxpbmVfbnIsXG4gICAgICAgICAgICBmbC5saW5lICAgICBhcyBsaW5lXG4gICAgICAgICAgZnJvbSBkYXRhc291cmNlcyAgICAgICAgYXMgZHNcbiAgICAgICAgICBsZWZ0IGpvaW4gbWlycm9yICAgICAgICBhcyBtaSB1c2luZyAoIGRza2V5ICksXG4gICAgICAgICAgZmlsZV9saW5lcyggZHMucGF0aCApICAgYXMgZmxcbiAgICAgICAgICB3aGVyZSB0cnVlIC0tIHdoZXJlIGNsYXVzZSBqdXN0IGEgc3ludGFjdGljIGd1YXJkIGFzIHBlciBodHRwczovL3NxbGl0ZS5vcmcvbGFuZ191cHNlcnQuaHRtbFxuICAgICAgICAgIG9uIGNvbmZsaWN0IGRvIHVwZGF0ZSBzZXQgbGluZSA9IGV4Y2x1ZGVkLmxpbmU7XCJcIlwiXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHBvcHVsYXRlX2tleXdvcmRzOiBTUUxcIlwiXCJcbiAgICAgICAgaW5zZXJ0IGludG8ga2V5d29yZHMgKCBkc2tleSwgbGluZV9uciwga2V5d29yZCApXG4gICAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICBkcy5kc2tleSAgICBhcyBkc2tleSxcbiAgICAgICAgICAgIG1pLmxpbmVfbnIgIGFzIGxpbmVfbnIsXG4gICAgICAgICAgICBzdy5rZXl3b3JkICBhcyBrZXl3b3JkXG4gICAgICAgICAgZnJvbSBkYXRhc291cmNlcyAgICAgICAgYXMgZHNcbiAgICAgICAgICBqb2luIG1pcnJvciAgICAgICAgICAgICBhcyBtaSB1c2luZyAoIGRza2V5ICksXG4gICAgICAgICAgc3BsaXRfd29yZHMoIG1pLmxpbmUgKSAgYXMgc3dcbiAgICAgICAgICB3aGVyZSB0cnVlIC0tIHdoZXJlIGNsYXVzZSBqdXN0IGEgc3ludGFjdGljIGd1YXJkIGFzIHBlciBodHRwczovL3NxbGl0ZS5vcmcvbGFuZ191cHNlcnQuaHRtbFxuICAgICAgICAgIG9uIGNvbmZsaWN0IGRvIG5vdGhpbmc7XCJcIlwiXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBpbml0aWFsaXplOiAtPlxuICAgICAgc3VwZXIoKVxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBAY3JlYXRlX3RhYmxlX2Z1bmN0aW9uXG4gICAgICAgIG5hbWU6ICAgICAgICAgICAnc3BsaXRfd29yZHMnXG4gICAgICAgIGNvbHVtbnM6ICAgICAgICBbICdrZXl3b3JkJywgXVxuICAgICAgICBwYXJhbWV0ZXJzOiAgICAgWyAnbGluZScsIF1cbiAgICAgICAgcm93czogKCBsaW5lICkgLT5cbiAgICAgICAgICBrZXl3b3JkcyA9IGxpbmUuc3BsaXQgLyg/OlxccHtafSspfCgoPzpcXHB7U2NyaXB0PUhhbn0pfCg/OlxccHtMfSspfCg/OlxccHtOfSspfCg/OlxccHtTfSspKS92XG4gICAgICAgICAgIyBkZWJ1ZyAnzqlqenJzZGJfX181JywgbGluZV9uciwgcnByIGtleXdvcmRzXG4gICAgICAgICAgZm9yIGtleXdvcmQgaW4ga2V5d29yZHNcbiAgICAgICAgICAgIGNvbnRpbnVlIHVubGVzcyBrZXl3b3JkP1xuICAgICAgICAgICAgY29udGludWUgaWYga2V5d29yZCBpcyAnJ1xuICAgICAgICAgICAgeWllbGQgeyBrZXl3b3JkLCB9XG4gICAgICAgICAgO251bGxcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgQGNyZWF0ZV90YWJsZV9mdW5jdGlvblxuICAgICAgICBuYW1lOiAgICAgICAgICdmaWxlX2xpbmVzJ1xuICAgICAgICBjb2x1bW5zOiAgICAgIFsgJ2xpbmVfbnInLCAnbGluZScsIF1cbiAgICAgICAgcGFyYW1ldGVyczogICBbICdwYXRoJywgXVxuICAgICAgICByb3dzOiAoIHBhdGggKSAtPlxuICAgICAgICAgIGZvciB7IGxucjogbGluZV9uciwgbGluZSwgZW9sLCB9IGZyb20gR1VZLmZzLndhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgcGF0aFxuICAgICAgICAgICAgeWllbGQgeyBsaW5lX25yLCBsaW5lLCB9XG4gICAgICAgICAgO251bGxcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgO251bGxcbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBkbyA9PlxuICAgIGRiX3BhdGggICA9ICcvZGV2L3NobS9icmljYWJyYWMuc3FsaXRlJ1xuICAgIHBocmFzZXMgICA9IERicmljX3BocmFzZXMub3BlbiBkYl9wYXRoXG4gICAgZGVidWcgJ86panpyc2RiX19fNicsIHBocmFzZXMudGVhcmRvd24oKVxuICAgIGRlYnVnICfOqWp6cnNkYl9fXzcnLCBwaHJhc2VzLnJlYnVpbGQoKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgZG8gPT5cbiAgICAgIGRza2V5ID0gJ2h1bWR1bSdcbiAgICAgIHBhdGggID0gUEFUSC5yZXNvbHZlIF9fZGlybmFtZSwgJy4uLy4uL2hlbmdpc3QtTkcvYXNzZXRzL2JyaWNhYnJhYy9odW1wdHktZHVtcHR5Lm1kJ1xuICAgICAgcGhyYXNlcy5zdGF0ZW1lbnRzLmluc2VydF9kYXRhc291cmNlLnJ1biB7IGRza2V5LCBwYXRoIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRvID0+XG4gICAgICBkc2tleSA9ICdtbmcnXG4gICAgICBwYXRoICA9IFBBVEgucmVzb2x2ZSBfX2Rpcm5hbWUsICcuLi8uLi8uLi9pby9taW5na3dhaS1yYWNrL2p6cmRzL21lYW5pbmcvbWVhbmluZ3MudHh0J1xuICAgICAgcGhyYXNlcy5zdGF0ZW1lbnRzLmluc2VydF9kYXRhc291cmNlLnJ1biB7IGRza2V5LCBwYXRoIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRlYnVnICfOqWp6cnNkYl9fXzgnLCBcInBvcHVsYXRlX2ZpbGVfbWlycm9yOiBcIiwgcGhyYXNlcy5zdGF0ZW1lbnRzLnBvcHVsYXRlX2ZpbGVfbWlycm9yLnJ1bigpXG4gICAgZGVidWcgJ86panpyc2RiX19fOScsIFwicG9wdWxhdGVfa2V5d29yZHM6ICAgIFwiLCBwaHJhc2VzLnN0YXRlbWVudHMucG9wdWxhdGVfa2V5d29yZHMucnVuKClcbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzEwJywgXCJjb3VudF9kYXRhc291cmNlczogICAgXCIsIHBocmFzZXMuc3RhdGVtZW50cy5jb3VudF9kYXRhc291cmNlcy5nZXQoKVxuICAgIGRlYnVnICfOqWp6cnNkYl9fMTEnLCBcImNvdW50X21pcnJvcl9saW5lczogICBcIiwgcGhyYXNlcy5zdGF0ZW1lbnRzLmNvdW50X21pcnJvcl9saW5lcy5nZXQoKVxuICAgICMgZWNobygpOyBlY2hvIHJvdyBmb3Igcm93IGZyb20gcGhyYXNlcy5zdGF0ZW1lbnRzLnNlbGVjdF9mcm9tX21pcnJvci5pdGVyYXRlKClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHBocmFzZXMuc3RhdGVtZW50cy5sb2NhdGlvbnNfZnJvbV9rZXl3b3JkLml0ZXJhdGUgeyBrZXl3b3JkOiAndGhvdWdodCcsIH1cbiAgICBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubG9jYXRpb25zX2Zyb21fa2V5d29yZC5pdGVyYXRlIHsga2V5d29yZDogJ3NoZScsIH1cbiAgICBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubG9jYXRpb25zX2Zyb21fa2V5d29yZC5pdGVyYXRlIHsga2V5d29yZDogJ+W7kycsIH1cbiAgICBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubG9jYXRpb25zX2Zyb21fa2V5d29yZC5pdGVyYXRlIHsga2V5d29yZDogJ+W6picsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHBocmFzZXMuc3RhdGVtZW50cy5saW5lc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICd0aG91Z2h0JywgfVxuICAgIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHBocmFzZXMuc3RhdGVtZW50cy5saW5lc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICdzaGUnLCB9XG4gICAgZWNobygpOyBlY2hvIHJvdyBmb3Igcm93IGZyb20gcGhyYXNlcy5zdGF0ZW1lbnRzLmxpbmVzX2Zyb21fa2V5d29yZC5pdGVyYXRlIHsga2V5d29yZDogJ+W7kycsIH1cbiAgICBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubGluZXNfZnJvbV9rZXl3b3JkLml0ZXJhdGUgeyBrZXl3b3JkOiAn5bqmJywgfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICA7bnVsbFxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuaWYgbW9kdWxlIGlzIHJlcXVpcmUubWFpbiB0aGVuIGRvID0+XG4gIG1hdGVyaWFsaXplZF9maWxlX21pcnJvcigpXG4gIDtudWxsXG5cbiJdfQ==
