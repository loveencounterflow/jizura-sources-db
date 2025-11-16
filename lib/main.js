(function() {
  'use strict';
  var GUY, PATH, SFMODULES, TMP_eq, alert, blue, bold, debug, echo, file_mirror_with_integrated_inserts, gold, green, grey, help, info, inspect, log, plain, praise, red, reverse, rpr, urge, warn, whisper, white;

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

  //---------------------------------------------------------------------------------------------------------
  TMP_eq = function(fn, matcher) {
    debug('Ωjzrsdb___1', fn());
    return null;
  };

  //---------------------------------------------------------------------------------------------------------
  file_mirror_with_integrated_inserts = function() {
    var Bsql3, Dbric, Dbric_phrases, SQL, internals;
    ({Dbric, SQL, internals} = SFMODULES.unstable.require_dbric());
    Bsql3 = require('better-sqlite3');
    Dbric_phrases = (function() {
      //=======================================================================================================
      class Dbric_phrases extends Dbric {
        //-----------------------------------------------------------------------------------------------------
        initialize() {
          super.initialize();
          //...................................................................................................
          this.create_table_function({
            name: 'split_words',
            columns: ['keyword'],
            parameters: ['line'],
            rows: function*(line) {
              var i, keyword, keywords, len;
              keywords = line.split(/(?:\p{Z}+)|((?:\p{L}+)|(?:\p{N}+)|(?:\p{S}+))/v);
// debug 'Ωjzrsdb___2', line_nr, rpr keywords
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
          //...................................................................................................
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
          //...................................................................................................
          return null;
        }

      };

      Dbric_phrases.db_class = Bsql3;

      //-----------------------------------------------------------------------------------------------------
      Dbric_phrases.build = [
        //...................................................................................................
        SQL`create table datasources (
dskey text unique not null primary key,
path text not null );`,
        //...................................................................................................
        SQL`create view mirror as select
  *
from
  datasources as ds,
  file_lines( ds.path ) as fl
order by ds.dskey, fl.line_nr;`,
        //...................................................................................................
        SQL`create table keywords (
  dskey   text    not null,
  line_nr integer not null,
  keyword text    not null,
foreign key ( dskey ) references datasources ( dskey ),
primary key ( dskey, line_nr, keyword ) );`
      ];

      //-----------------------------------------------------------------------------------------------------
      Dbric_phrases.statements = {
        //...................................................................................................
        insert_datasource: SQL`insert into datasources ( dskey, path ) values ( $dskey, $path )
on conflict ( dskey ) do update set path = $path;`,
        //...................................................................................................
        insert_keyword: SQL`insert into keywords ( dskey, line_nr, keyword ) values ( $dskey, $line_nr, $keyword )
on conflict ( dskey, line_nr, keyword ) do nothing;`,
        //...................................................................................................
        select_from_datasources: SQL`select * from datasources order by dskey;`,
        //...................................................................................................
        select_from_keywords: SQL`select * from keywords order by keyword, dskey, line_nr;`,
        locations_from_keyword: SQL`select * from keywords
where keyword = $keyword
order by keyword, dskey, line_nr;`,
        //...................................................................................................
        select_from_mirror: SQL`select * from mirror order by dskey;`,
        //...................................................................................................
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
    (() => {      //=======================================================================================================
      var db_path, phrases, row, rows, Ωjzrsdb__10, Ωjzrsdb__11, Ωjzrsdb__12, Ωjzrsdb__13, Ωjzrsdb__14, Ωjzrsdb__15, Ωjzrsdb__16, Ωjzrsdb__17, Ωjzrsdb__18, Ωjzrsdb__19, Ωjzrsdb__20, Ωjzrsdb__21, Ωjzrsdb__22, Ωjzrsdb___5, Ωjzrsdb___6, Ωjzrsdb___7, Ωjzrsdb___9;
      db_path = '/dev/shm/bricabrac.sqlite';
      phrases = Dbric_phrases.open(db_path);
      debug('Ωjzrsdb___3', phrases.teardown());
      debug('Ωjzrsdb___4', phrases.rebuild());
      TMP_eq((Ωjzrsdb___5 = function() {
        return (phrases.prepare(SQL`pragma foreign_keys`)).get();
      }), {
        foreign_keys: 1
      });
      TMP_eq((Ωjzrsdb___6 = function() {
        return (phrases.prepare(SQL`pragma journal_mode`)).get();
      }), {
        journal_mode: 'wal'
      });
      TMP_eq((Ωjzrsdb___7 = function() {
        return phrases.db instanceof Bsql3;
      }), true);
      (() => {        //.....................................................................................................
        var dskey, path;
        dskey = 'humdum';
        path = PATH.resolve(__dirname, '../../hengist-NG/assets/bricabrac/humpty-dumpty.md');
        return phrases.statements.insert_datasource.run({dskey, path});
      })();
      //.....................................................................................................
      debug('Ωjzrsdb___8', phrases.statements.populate_keywords.run());
      for (row of phrases.statements.locations_from_keyword.iterate({
        keyword: 'thought'
      })) {
        //.....................................................................................................
        echo(row);
      }
      echo();
      rows = phrases.statements.locations_from_keyword.iterate({
        keyword: 'thought'
      });
      TMP_eq((Ωjzrsdb___9 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 15,
        keyword: 'thought'
      });
      TMP_eq((Ωjzrsdb__10 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 34,
        keyword: 'thought'
      });
      TMP_eq((Ωjzrsdb__11 = function() {
        return rows.next().value;
      }), void 0);
      for (row of phrases.statements.locations_from_keyword.iterate({
        keyword: 'she'
      })) {
        //.....................................................................................................
        echo(row);
      }
      echo();
      rows = phrases.statements.locations_from_keyword.iterate({
        keyword: 'she'
      });
      TMP_eq((Ωjzrsdb__12 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 2,
        keyword: 'she'
      });
      TMP_eq((Ωjzrsdb__13 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 3,
        keyword: 'she'
      });
      TMP_eq((Ωjzrsdb__14 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 4,
        keyword: 'she'
      });
      TMP_eq((Ωjzrsdb__15 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 5,
        keyword: 'she'
      });
      TMP_eq((Ωjzrsdb__16 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 15,
        keyword: 'she'
      });
      TMP_eq((Ωjzrsdb__17 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 17,
        keyword: 'she'
      });
      TMP_eq((Ωjzrsdb__18 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 18,
        keyword: 'she'
      });
      TMP_eq((Ωjzrsdb__19 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 26,
        keyword: 'she'
      });
      TMP_eq((Ωjzrsdb__20 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 34,
        keyword: 'she'
      });
      TMP_eq((Ωjzrsdb__21 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 36,
        keyword: 'she'
      });
      TMP_eq((Ωjzrsdb__22 = function() {
        return rows.next().value;
      }), void 0);
      //.....................................................................................................
      return null;
    })();
    //.......................................................................................................
    return null;
  };

  file_mirror_with_integrated_inserts();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLG1DQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQTs7O0VBR0EsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxLQURGLEVBRUUsSUFGRixFQUdFLElBSEYsRUFJRSxLQUpGLEVBS0UsTUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsT0FSRixDQUFBLEdBUTRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBUixDQUFvQixtQkFBcEIsQ0FSNUI7O0VBU0EsQ0FBQSxDQUFFLEdBQUYsRUFDRSxPQURGLEVBRUUsSUFGRixFQUdFLEtBSEYsRUFJRSxLQUpGLEVBS0UsSUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsR0FSRixFQVNFLElBVEYsRUFVRSxPQVZGLEVBV0UsR0FYRixDQUFBLEdBVzRCLEdBQUcsQ0FBQyxHQVhoQyxFQWJBOzs7Ozs7O0VBOEJBLFNBQUEsR0FBNEIsT0FBQSxDQUFRLDJDQUFSLEVBOUI1Qjs7O0VBZ0NBLElBQUEsR0FBNEIsT0FBQSxDQUFRLFdBQVIsRUFoQzVCOzs7RUFxQ0EsTUFBQSxHQUFTLFFBQUEsQ0FBRSxFQUFGLEVBQU0sT0FBTixDQUFBO0lBQ1AsS0FBQSxDQUFNLGFBQU4sRUFBcUIsRUFBQSxDQUFBLENBQXJC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Q0FBVyxDQUFDO01BQWYsQ0FBaEIsQ0FBUCxFQUErQztRQUFFLEtBQUEsRUFBTyxRQUFUO1FBQW1CLE9BQUEsRUFBUyxFQUE1QjtRQUFnQyxPQUFBLEVBQVM7TUFBekMsQ0FBL0M7TUFDQSxNQUFBLENBQU8sQ0FBRSxXQUFBLEdBQWMsUUFBQSxDQUFBLENBQUE7ZUFBRyxJQUFJLENBQUMsSUFBTCxDQUFBLENBQVcsQ0FBQztNQUFmLENBQWhCLENBQVAsRUFBK0M7UUFBRSxLQUFBLEVBQU8sUUFBVDtRQUFtQixPQUFBLEVBQVMsRUFBNUI7UUFBZ0MsT0FBQSxFQUFTO01BQXpDLENBQS9DO01BQ0EsTUFBQSxDQUFPLENBQUUsV0FBQSxHQUFjLFFBQUEsQ0FBQSxDQUFBO2VBQUcsSUFBSSxDQUFDLElBQUwsQ0FBQSxDQUFXLENBQUM7TUFBZixDQUFoQixDQUFQLEVBQStDO1FBQUUsS0FBQSxFQUFPLFFBQVQ7UUFBbUIsT0FBQSxFQUFTLEVBQTVCO1FBQWdDLE9BQUEsRUFBUztNQUF6QyxDQUEvQztNQUNBLE1BQUEsQ0FBTyxDQUFFLFdBQUEsR0FBYyxRQUFBLENBQUEsQ0FBQTtlQUFHLElBQUksQ0FBQyxJQUFMLENBQUEsQ0FBVyxDQUFDO01BQWYsQ0FBaEIsQ0FBUCxFQUErQztRQUFFLEtBQUEsRUFBTyxRQUFUO1FBQW1CLE9BQUEsRUFBUyxFQUE1QjtRQUFnQyxPQUFBLEVBQVM7TUFBekMsQ0FBL0M7TUFDQSxNQUFBLENBQU8sQ0FBRSxXQUFBLEdBQWMsUUFBQSxDQUFBLENBQUE7ZUFBRyxJQUFJLENBQUMsSUFBTCxDQUFBLENBQVcsQ0FBQztNQUFmLENBQWhCLENBQVAsRUFBK0MsTUFBL0MsRUFuQ0o7O2FBcUNLO0lBdENBLENBQUEsSUFyRkw7O0FBNkhFLFdBQU87RUE5SDZCOztFQWdJdEMsbUNBQUEsQ0FBQTtBQTFLQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCdcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5HVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xueyBhbGVydFxuICBkZWJ1Z1xuICBoZWxwXG4gIGluZm9cbiAgcGxhaW5cbiAgcHJhaXNlXG4gIHVyZ2VcbiAgd2FyblxuICB3aGlzcGVyIH0gICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ2ppenVyYS1zb3VyY2VzLWRiJ1xueyBycHJcbiAgaW5zcGVjdFxuICBlY2hvXG4gIHdoaXRlXG4gIGdyZWVuXG4gIGJsdWVcbiAgZ29sZFxuICBncmV5XG4gIHJlZFxuICBib2xkXG4gIHJldmVyc2VcbiAgbG9nICAgICB9ICAgICAgICAgICAgICAgPSBHVVkudHJtXG4jIHsgZiB9ICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvZWZmc3RyaW5nJ1xuIyB3cml0ZSAgICAgICAgICAgICAgICAgICAgID0gKCBwICkgLT4gcHJvY2Vzcy5zdGRvdXQud3JpdGUgcFxuIyB7IG5mYSB9ICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL25vcm1hbGl6ZS1mdW5jdGlvbi1hcmd1bWVudHMnXG4jIEdUTkcgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvZ3V5LXRlc3QtTkcnXG4jIHsgVGVzdCAgICAgICAgICAgICAgICAgIH0gPSBHVE5HXG5TRk1PRFVMRVMgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2JyaWNhYnJhYy1zZm1vZHVsZXMnXG4jIEZTICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOmZzJ1xuUEFUSCAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6cGF0aCdcblxuXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblRNUF9lcSA9ICggZm4sIG1hdGNoZXIgKSAtPlxuICBkZWJ1ZyAnzqlqenJzZGJfX18xJywgZm4oKVxuICA7bnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5maWxlX21pcnJvcl93aXRoX2ludGVncmF0ZWRfaW5zZXJ0cyA9IC0+XG4gIHsgRGJyaWMsXG4gICAgU1FMLFxuICAgIGludGVybmFscywgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2RicmljKClcbiAgQnNxbDMgICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdiZXR0ZXItc3FsaXRlMydcbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgY2xhc3MgRGJyaWNfcGhyYXNlcyBleHRlbmRzIERicmljXG4gICAgQGRiX2NsYXNzOiBCc3FsM1xuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIEBidWlsZDogW1xuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGRhdGFzb3VyY2VzIChcbiAgICAgICAgICBkc2tleSB0ZXh0IHVuaXF1ZSBub3QgbnVsbCBwcmltYXJ5IGtleSxcbiAgICAgICAgICBwYXRoIHRleHQgbm90IG51bGwgKTtcIlwiXCJcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IG1pcnJvciBhcyBzZWxlY3RcbiAgICAgICAgICAqXG4gICAgICAgIGZyb21cbiAgICAgICAgICBkYXRhc291cmNlcyBhcyBkcyxcbiAgICAgICAgICBmaWxlX2xpbmVzKCBkcy5wYXRoICkgYXMgZmxcbiAgICAgICAgb3JkZXIgYnkgZHMuZHNrZXksIGZsLmxpbmVfbnI7XCJcIlwiXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUga2V5d29yZHMgKFxuICAgICAgICAgIGRza2V5ICAgdGV4dCAgICBub3QgbnVsbCxcbiAgICAgICAgICBsaW5lX25yIGludGVnZXIgbm90IG51bGwsXG4gICAgICAgICAga2V5d29yZCB0ZXh0ICAgIG5vdCBudWxsLFxuICAgICAgICBmb3JlaWduIGtleSAoIGRza2V5ICkgcmVmZXJlbmNlcyBkYXRhc291cmNlcyAoIGRza2V5ICksXG4gICAgICAgIHByaW1hcnkga2V5ICggZHNrZXksIGxpbmVfbnIsIGtleXdvcmQgKSApO1wiXCJcIlxuICAgICAgXVxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIEBzdGF0ZW1lbnRzOlxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgaW5zZXJ0X2RhdGFzb3VyY2U6IFNRTFwiXCJcImluc2VydCBpbnRvIGRhdGFzb3VyY2VzICggZHNrZXksIHBhdGggKSB2YWx1ZXMgKCAkZHNrZXksICRwYXRoIClcbiAgICAgICAgb24gY29uZmxpY3QgKCBkc2tleSApIGRvIHVwZGF0ZSBzZXQgcGF0aCA9ICRwYXRoO1wiXCJcIlxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgaW5zZXJ0X2tleXdvcmQ6IFNRTFwiXCJcImluc2VydCBpbnRvIGtleXdvcmRzICggZHNrZXksIGxpbmVfbnIsIGtleXdvcmQgKSB2YWx1ZXMgKCAkZHNrZXksICRsaW5lX25yLCAka2V5d29yZCApXG4gICAgICAgIG9uIGNvbmZsaWN0ICggZHNrZXksIGxpbmVfbnIsIGtleXdvcmQgKSBkbyBub3RoaW5nO1wiXCJcIlxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0X2Zyb21fZGF0YXNvdXJjZXM6IFNRTFwiXCJcInNlbGVjdCAqIGZyb20gZGF0YXNvdXJjZXMgb3JkZXIgYnkgZHNrZXk7XCJcIlwiXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3RfZnJvbV9rZXl3b3JkczogU1FMXCJcIlwic2VsZWN0ICogZnJvbSBrZXl3b3JkcyBvcmRlciBieSBrZXl3b3JkLCBkc2tleSwgbGluZV9ucjtcIlwiXCJcbiAgICAgIGxvY2F0aW9uc19mcm9tX2tleXdvcmQ6IFNRTFwiXCJcInNlbGVjdCAqIGZyb20ga2V5d29yZHNcbiAgICAgICAgd2hlcmUga2V5d29yZCA9ICRrZXl3b3JkXG4gICAgICAgIG9yZGVyIGJ5IGtleXdvcmQsIGRza2V5LCBsaW5lX25yO1wiXCJcIlxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0X2Zyb21fbWlycm9yOiBTUUxcIlwiXCJzZWxlY3QgKiBmcm9tIG1pcnJvciBvcmRlciBieSBkc2tleTtcIlwiXCJcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHBvcHVsYXRlX2tleXdvcmRzOiBTUUxcIlwiXCJcbiAgICAgICAgaW5zZXJ0IGludG8ga2V5d29yZHMgKCBkc2tleSwgbGluZV9uciwga2V5d29yZCApXG4gICAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICBkcy5kc2tleSAgICBhcyBkc2tleSxcbiAgICAgICAgICAgIG1pLmxpbmVfbnIgIGFzIGxpbmVfbnIsXG4gICAgICAgICAgICBzdy5rZXl3b3JkICBhcyBrZXl3b3JkXG4gICAgICAgICAgZnJvbSBkYXRhc291cmNlcyAgICAgICAgYXMgZHNcbiAgICAgICAgICBqb2luIG1pcnJvciAgICAgICAgICAgICBhcyBtaSB1c2luZyAoIGRza2V5ICksXG4gICAgICAgICAgc3BsaXRfd29yZHMoIG1pLmxpbmUgKSAgYXMgc3dcbiAgICAgICAgICB3aGVyZSB0cnVlIC0tIHdoZXJlIGNsYXVzZSBqdXN0IGEgc3ludGFjdGljIGd1YXJkIGFzIHBlciBodHRwczovL3NxbGl0ZS5vcmcvbGFuZ191cHNlcnQuaHRtbFxuICAgICAgICAgIG9uIGNvbmZsaWN0IGRvIG5vdGhpbmc7XCJcIlwiXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgIHN1cGVyKClcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIEBjcmVhdGVfdGFibGVfZnVuY3Rpb25cbiAgICAgICAgbmFtZTogICAgICAgICAgICdzcGxpdF93b3JkcydcbiAgICAgICAgY29sdW1uczogICAgICAgIFsgJ2tleXdvcmQnLCBdXG4gICAgICAgIHBhcmFtZXRlcnM6ICAgICBbICdsaW5lJywgXVxuICAgICAgICByb3dzOiAoIGxpbmUgKSAtPlxuICAgICAgICAgIGtleXdvcmRzID0gbGluZS5zcGxpdCAvKD86XFxwe1p9Kyl8KCg/OlxccHtMfSspfCg/OlxccHtOfSspfCg/OlxccHtTfSspKS92XG4gICAgICAgICAgIyBkZWJ1ZyAnzqlqenJzZGJfX18yJywgbGluZV9uciwgcnByIGtleXdvcmRzXG4gICAgICAgICAgZm9yIGtleXdvcmQgaW4ga2V5d29yZHNcbiAgICAgICAgICAgIGNvbnRpbnVlIHVubGVzcyBrZXl3b3JkP1xuICAgICAgICAgICAgY29udGludWUgaWYga2V5d29yZCBpcyAnJ1xuICAgICAgICAgICAgeWllbGQgeyBrZXl3b3JkLCB9XG4gICAgICAgICAgO251bGxcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIEBjcmVhdGVfdGFibGVfZnVuY3Rpb25cbiAgICAgICAgbmFtZTogICAgICAgICAnZmlsZV9saW5lcydcbiAgICAgICAgY29sdW1uczogICAgICBbICdsaW5lX25yJywgJ2xpbmUnLCBdXG4gICAgICAgIHBhcmFtZXRlcnM6ICAgWyAncGF0aCcsIF1cbiAgICAgICAgcm93czogKCBwYXRoICkgLT5cbiAgICAgICAgICBmb3IgeyBsbnI6IGxpbmVfbnIsIGxpbmUsIGVvbCwgfSBmcm9tIEdVWS5mcy53YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zIHBhdGhcbiAgICAgICAgICAgIHlpZWxkIHsgbGluZV9uciwgbGluZSwgfVxuICAgICAgICAgIDtudWxsXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICA7bnVsbFxuICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICBkbyA9PlxuICAgIGRiX3BhdGggICA9ICcvZGV2L3NobS9icmljYWJyYWMuc3FsaXRlJ1xuICAgIHBocmFzZXMgICA9IERicmljX3BocmFzZXMub3BlbiBkYl9wYXRoXG4gICAgZGVidWcgJ86panpyc2RiX19fMycsIHBocmFzZXMudGVhcmRvd24oKVxuICAgIGRlYnVnICfOqWp6cnNkYl9fXzQnLCBwaHJhc2VzLnJlYnVpbGQoKVxuICAgIFRNUF9lcSAoIM6panpyc2RiX19fNSA9IC0+ICggcGhyYXNlcy5wcmVwYXJlIFNRTFwiXCJcInByYWdtYSBmb3JlaWduX2tleXNcIlwiXCIgKS5nZXQoKSApLCB7IGZvcmVpZ25fa2V5czogMSwgICAgICB9XG4gICAgVE1QX2VxICggzqlqenJzZGJfX182ID0gLT4gKCBwaHJhc2VzLnByZXBhcmUgU1FMXCJcIlwicHJhZ21hIGpvdXJuYWxfbW9kZVwiXCJcIiApLmdldCgpICksIHsgam91cm5hbF9tb2RlOiAnd2FsJywgIH1cbiAgICBUTVBfZXEgKCDOqWp6cnNkYl9fXzcgPSAtPiBwaHJhc2VzLmRiIGluc3RhbmNlb2YgQnNxbDMgICAgICksIHRydWVcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkbyA9PlxuICAgICAgZHNrZXkgPSAnaHVtZHVtJ1xuICAgICAgcGF0aCAgPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4vLi4vaGVuZ2lzdC1ORy9hc3NldHMvYnJpY2FicmFjL2h1bXB0eS1kdW1wdHkubWQnXG4gICAgICBwaHJhc2VzLnN0YXRlbWVudHMuaW5zZXJ0X2RhdGFzb3VyY2UucnVuIHsgZHNrZXksIHBhdGggfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRlYnVnICfOqWp6cnNkYl9fXzgnLCBwaHJhc2VzLnN0YXRlbWVudHMucG9wdWxhdGVfa2V5d29yZHMucnVuKClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBlY2hvIHJvdyBmb3Igcm93IGZyb20gcGhyYXNlcy5zdGF0ZW1lbnRzLmxvY2F0aW9uc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICd0aG91Z2h0JywgfVxuICAgIGVjaG8oKVxuICAgIHJvd3MgPSBwaHJhc2VzLnN0YXRlbWVudHMubG9jYXRpb25zX2Zyb21fa2V5d29yZC5pdGVyYXRlIHsga2V5d29yZDogJ3Rob3VnaHQnLCB9XG4gICAgVE1QX2VxICggzqlqenJzZGJfX185ID0gLT4gcm93cy5uZXh0KCkudmFsdWUgKSwgeyBkc2tleTogJ2h1bWR1bScsIGxpbmVfbnI6IDE1LCBrZXl3b3JkOiAndGhvdWdodCcgfVxuICAgIFRNUF9lcSAoIM6panpyc2RiX18xMCA9IC0+IHJvd3MubmV4dCgpLnZhbHVlICksIHsgZHNrZXk6ICdodW1kdW0nLCBsaW5lX25yOiAzNCwga2V5d29yZDogJ3Rob3VnaHQnIH1cbiAgICBUTVBfZXEgKCDOqWp6cnNkYl9fMTEgPSAtPiByb3dzLm5leHQoKS52YWx1ZSApLCB1bmRlZmluZWRcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBlY2hvIHJvdyBmb3Igcm93IGZyb20gcGhyYXNlcy5zdGF0ZW1lbnRzLmxvY2F0aW9uc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICdzaGUnLCB9XG4gICAgZWNobygpXG4gICAgcm93cyA9IHBocmFzZXMuc3RhdGVtZW50cy5sb2NhdGlvbnNfZnJvbV9rZXl3b3JkLml0ZXJhdGUgeyBrZXl3b3JkOiAnc2hlJywgfVxuICAgIFRNUF9lcSAoIM6panpyc2RiX18xMiA9IC0+IHJvd3MubmV4dCgpLnZhbHVlICksIHsgZHNrZXk6ICdodW1kdW0nLCBsaW5lX25yOiAyLCBrZXl3b3JkOiAnc2hlJyB9XG4gICAgVE1QX2VxICggzqlqenJzZGJfXzEzID0gLT4gcm93cy5uZXh0KCkudmFsdWUgKSwgeyBkc2tleTogJ2h1bWR1bScsIGxpbmVfbnI6IDMsIGtleXdvcmQ6ICdzaGUnIH1cbiAgICBUTVBfZXEgKCDOqWp6cnNkYl9fMTQgPSAtPiByb3dzLm5leHQoKS52YWx1ZSApLCB7IGRza2V5OiAnaHVtZHVtJywgbGluZV9ucjogNCwga2V5d29yZDogJ3NoZScgfVxuICAgIFRNUF9lcSAoIM6panpyc2RiX18xNSA9IC0+IHJvd3MubmV4dCgpLnZhbHVlICksIHsgZHNrZXk6ICdodW1kdW0nLCBsaW5lX25yOiA1LCBrZXl3b3JkOiAnc2hlJyB9XG4gICAgVE1QX2VxICggzqlqenJzZGJfXzE2ID0gLT4gcm93cy5uZXh0KCkudmFsdWUgKSwgeyBkc2tleTogJ2h1bWR1bScsIGxpbmVfbnI6IDE1LCBrZXl3b3JkOiAnc2hlJyB9XG4gICAgVE1QX2VxICggzqlqenJzZGJfXzE3ID0gLT4gcm93cy5uZXh0KCkudmFsdWUgKSwgeyBkc2tleTogJ2h1bWR1bScsIGxpbmVfbnI6IDE3LCBrZXl3b3JkOiAnc2hlJyB9XG4gICAgVE1QX2VxICggzqlqenJzZGJfXzE4ID0gLT4gcm93cy5uZXh0KCkudmFsdWUgKSwgeyBkc2tleTogJ2h1bWR1bScsIGxpbmVfbnI6IDE4LCBrZXl3b3JkOiAnc2hlJyB9XG4gICAgVE1QX2VxICggzqlqenJzZGJfXzE5ID0gLT4gcm93cy5uZXh0KCkudmFsdWUgKSwgeyBkc2tleTogJ2h1bWR1bScsIGxpbmVfbnI6IDI2LCBrZXl3b3JkOiAnc2hlJyB9XG4gICAgVE1QX2VxICggzqlqenJzZGJfXzIwID0gLT4gcm93cy5uZXh0KCkudmFsdWUgKSwgeyBkc2tleTogJ2h1bWR1bScsIGxpbmVfbnI6IDM0LCBrZXl3b3JkOiAnc2hlJyB9XG4gICAgVE1QX2VxICggzqlqenJzZGJfXzIxID0gLT4gcm93cy5uZXh0KCkudmFsdWUgKSwgeyBkc2tleTogJ2h1bWR1bScsIGxpbmVfbnI6IDM2LCBrZXl3b3JkOiAnc2hlJyB9XG4gICAgVE1QX2VxICggzqlqenJzZGJfXzIyID0gLT4gcm93cy5uZXh0KCkudmFsdWUgKSwgdW5kZWZpbmVkXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIG51bGxcblxuZmlsZV9taXJyb3Jfd2l0aF9pbnRlZ3JhdGVkX2luc2VydHMoKVxuXG4iXX0=
