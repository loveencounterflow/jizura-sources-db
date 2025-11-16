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
    debug('Ωjdsdb___1', fn());
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
// debug 'Ωbbdbr___2', line_nr, rpr keywords
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
      var db_path, phrases, row, rows, Ωbbdbr__10, Ωbbdbr__11, Ωbbdbr__12, Ωbbdbr__13, Ωbbdbr__14, Ωbbdbr__15, Ωbbdbr__16, Ωbbdbr__17, Ωbbdbr__18, Ωbbdbr__19, Ωbbdbr__20, Ωbbdbr__21, Ωbbdbr__22, Ωbbdbr___5, Ωbbdbr___6, Ωbbdbr___7, Ωbbdbr___9;
      db_path = '/dev/shm/bricabrac.sqlite';
      phrases = Dbric_phrases.open(db_path);
      debug('Ωbbdbr___3', phrases.teardown());
      debug('Ωbbdbr___4', phrases.rebuild());
      TMP_eq((Ωbbdbr___5 = function() {
        return (phrases.prepare(SQL`pragma foreign_keys`)).get();
      }), {
        foreign_keys: 1
      });
      TMP_eq((Ωbbdbr___6 = function() {
        return (phrases.prepare(SQL`pragma journal_mode`)).get();
      }), {
        journal_mode: 'wal'
      });
      TMP_eq((Ωbbdbr___7 = function() {
        return phrases.db instanceof Bsql3;
      }), true);
      (() => {        //.....................................................................................................
        var dskey, path;
        dskey = 'humdum';
        path = PATH.resolve(__dirname, '../../hengist-NG/assets/bricabrac/humpty-dumpty.md');
        return phrases.statements.insert_datasource.run({dskey, path});
      })();
      //.....................................................................................................
      debug('Ωbbdbr___8', phrases.statements.populate_keywords.run());
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
      TMP_eq((Ωbbdbr___9 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 15,
        keyword: 'thought'
      });
      TMP_eq((Ωbbdbr__10 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 34,
        keyword: 'thought'
      });
      TMP_eq((Ωbbdbr__11 = function() {
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
      TMP_eq((Ωbbdbr__12 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 2,
        keyword: 'she'
      });
      TMP_eq((Ωbbdbr__13 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 3,
        keyword: 'she'
      });
      TMP_eq((Ωbbdbr__14 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 4,
        keyword: 'she'
      });
      TMP_eq((Ωbbdbr__15 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 5,
        keyword: 'she'
      });
      TMP_eq((Ωbbdbr__16 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 15,
        keyword: 'she'
      });
      TMP_eq((Ωbbdbr__17 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 17,
        keyword: 'she'
      });
      TMP_eq((Ωbbdbr__18 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 18,
        keyword: 'she'
      });
      TMP_eq((Ωbbdbr__19 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 26,
        keyword: 'she'
      });
      TMP_eq((Ωbbdbr__20 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 34,
        keyword: 'she'
      });
      TMP_eq((Ωbbdbr__21 = function() {
        return rows.next().value;
      }), {
        dskey: 'humdum',
        line_nr: 36,
        keyword: 'she'
      });
      TMP_eq((Ωbbdbr__22 = function() {
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLG1DQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQTs7O0VBR0EsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxLQURGLEVBRUUsSUFGRixFQUdFLElBSEYsRUFJRSxLQUpGLEVBS0UsTUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsT0FSRixDQUFBLEdBUTRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBUixDQUFvQixtQkFBcEIsQ0FSNUI7O0VBU0EsQ0FBQSxDQUFFLEdBQUYsRUFDRSxPQURGLEVBRUUsSUFGRixFQUdFLEtBSEYsRUFJRSxLQUpGLEVBS0UsSUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsR0FSRixFQVNFLElBVEYsRUFVRSxPQVZGLEVBV0UsR0FYRixDQUFBLEdBVzRCLEdBQUcsQ0FBQyxHQVhoQyxFQWJBOzs7Ozs7O0VBOEJBLFNBQUEsR0FBNEIsT0FBQSxDQUFRLDJDQUFSLEVBOUI1Qjs7O0VBZ0NBLElBQUEsR0FBNEIsT0FBQSxDQUFRLFdBQVIsRUFoQzVCOzs7RUFxQ0EsTUFBQSxHQUFTLFFBQUEsQ0FBRSxFQUFGLEVBQU0sT0FBTixDQUFBO0lBQ1AsS0FBQSxDQUFNLFlBQU4sRUFBb0IsRUFBQSxDQUFBLENBQXBC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QWYsQ0FBZixDQUFQLEVBQThDO1FBQUUsS0FBQSxFQUFPLFFBQVQ7UUFBbUIsT0FBQSxFQUFTLEVBQTVCO1FBQWdDLE9BQUEsRUFBUztNQUF6QyxDQUE5QztNQUNBLE1BQUEsQ0FBTyxDQUFFLFVBQUEsR0FBYSxRQUFBLENBQUEsQ0FBQTtlQUFHLElBQUksQ0FBQyxJQUFMLENBQUEsQ0FBVyxDQUFDO01BQWYsQ0FBZixDQUFQLEVBQThDO1FBQUUsS0FBQSxFQUFPLFFBQVQ7UUFBbUIsT0FBQSxFQUFTLEVBQTVCO1FBQWdDLE9BQUEsRUFBUztNQUF6QyxDQUE5QztNQUNBLE1BQUEsQ0FBTyxDQUFFLFVBQUEsR0FBYSxRQUFBLENBQUEsQ0FBQTtlQUFHLElBQUksQ0FBQyxJQUFMLENBQUEsQ0FBVyxDQUFDO01BQWYsQ0FBZixDQUFQLEVBQThDO1FBQUUsS0FBQSxFQUFPLFFBQVQ7UUFBbUIsT0FBQSxFQUFTLEVBQTVCO1FBQWdDLE9BQUEsRUFBUztNQUF6QyxDQUE5QztNQUNBLE1BQUEsQ0FBTyxDQUFFLFVBQUEsR0FBYSxRQUFBLENBQUEsQ0FBQTtlQUFHLElBQUksQ0FBQyxJQUFMLENBQUEsQ0FBVyxDQUFDO01BQWYsQ0FBZixDQUFQLEVBQThDO1FBQUUsS0FBQSxFQUFPLFFBQVQ7UUFBbUIsT0FBQSxFQUFTLEVBQTVCO1FBQWdDLE9BQUEsRUFBUztNQUF6QyxDQUE5QztNQUNBLE1BQUEsQ0FBTyxDQUFFLFVBQUEsR0FBYSxRQUFBLENBQUEsQ0FBQTtlQUFHLElBQUksQ0FBQyxJQUFMLENBQUEsQ0FBVyxDQUFDO01BQWYsQ0FBZixDQUFQLEVBQThDLE1BQTlDLEVBbkNKOzthQXFDSztJQXRDQSxDQUFBLElBckZMOztBQTZIRSxXQUFPO0VBOUg2Qjs7RUFnSXRDLG1DQUFBLENBQUE7QUExS0EiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuJ3VzZSBzdHJpY3QnXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuR1VZICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2d1eSdcbnsgYWxlcnRcbiAgZGVidWdcbiAgaGVscFxuICBpbmZvXG4gIHBsYWluXG4gIHByYWlzZVxuICB1cmdlXG4gIHdhcm5cbiAgd2hpc3BlciB9ICAgICAgICAgICAgICAgPSBHVVkudHJtLmdldF9sb2dnZXJzICdqaXp1cmEtc291cmNlcy1kYidcbnsgcnByXG4gIGluc3BlY3RcbiAgZWNob1xuICB3aGl0ZVxuICBncmVlblxuICBibHVlXG4gIGdvbGRcbiAgZ3JleVxuICByZWRcbiAgYm9sZFxuICByZXZlcnNlXG4gIGxvZyAgICAgfSAgICAgICAgICAgICAgID0gR1VZLnRybVxuIyB7IGYgfSAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2VmZnN0cmluZydcbiMgd3JpdGUgICAgICAgICAgICAgICAgICAgICA9ICggcCApIC0+IHByb2Nlc3Muc3Rkb3V0LndyaXRlIHBcbiMgeyBuZmEgfSAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ub3JtYWxpemUtZnVuY3Rpb24tYXJndW1lbnRzJ1xuIyBHVE5HICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2d1eS10ZXN0LU5HJ1xuIyB7IFRlc3QgICAgICAgICAgICAgICAgICB9ID0gR1ROR1xuU0ZNT0RVTEVTICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9icmljYWJyYWMtc2Ztb2R1bGVzJ1xuIyBGUyAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpmcydcblBBVEggICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOnBhdGgnXG5cblxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5UTVBfZXEgPSAoIGZuLCBtYXRjaGVyICkgLT5cbiAgZGVidWcgJ86pamRzZGJfX18xJywgZm4oKVxuICA7bnVsbFxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5maWxlX21pcnJvcl93aXRoX2ludGVncmF0ZWRfaW5zZXJ0cyA9IC0+XG4gIHsgRGJyaWMsXG4gICAgU1FMLFxuICAgIGludGVybmFscywgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2RicmljKClcbiAgQnNxbDMgICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdiZXR0ZXItc3FsaXRlMydcbiAgIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiAgY2xhc3MgRGJyaWNfcGhyYXNlcyBleHRlbmRzIERicmljXG4gICAgQGRiX2NsYXNzOiBCc3FsM1xuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIEBidWlsZDogW1xuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGRhdGFzb3VyY2VzIChcbiAgICAgICAgICBkc2tleSB0ZXh0IHVuaXF1ZSBub3QgbnVsbCBwcmltYXJ5IGtleSxcbiAgICAgICAgICBwYXRoIHRleHQgbm90IG51bGwgKTtcIlwiXCJcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IG1pcnJvciBhcyBzZWxlY3RcbiAgICAgICAgICAqXG4gICAgICAgIGZyb21cbiAgICAgICAgICBkYXRhc291cmNlcyBhcyBkcyxcbiAgICAgICAgICBmaWxlX2xpbmVzKCBkcy5wYXRoICkgYXMgZmxcbiAgICAgICAgb3JkZXIgYnkgZHMuZHNrZXksIGZsLmxpbmVfbnI7XCJcIlwiXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUga2V5d29yZHMgKFxuICAgICAgICAgIGRza2V5ICAgdGV4dCAgICBub3QgbnVsbCxcbiAgICAgICAgICBsaW5lX25yIGludGVnZXIgbm90IG51bGwsXG4gICAgICAgICAga2V5d29yZCB0ZXh0ICAgIG5vdCBudWxsLFxuICAgICAgICBmb3JlaWduIGtleSAoIGRza2V5ICkgcmVmZXJlbmNlcyBkYXRhc291cmNlcyAoIGRza2V5ICksXG4gICAgICAgIHByaW1hcnkga2V5ICggZHNrZXksIGxpbmVfbnIsIGtleXdvcmQgKSApO1wiXCJcIlxuICAgICAgXVxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIEBzdGF0ZW1lbnRzOlxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgaW5zZXJ0X2RhdGFzb3VyY2U6IFNRTFwiXCJcImluc2VydCBpbnRvIGRhdGFzb3VyY2VzICggZHNrZXksIHBhdGggKSB2YWx1ZXMgKCAkZHNrZXksICRwYXRoIClcbiAgICAgICAgb24gY29uZmxpY3QgKCBkc2tleSApIGRvIHVwZGF0ZSBzZXQgcGF0aCA9ICRwYXRoO1wiXCJcIlxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgaW5zZXJ0X2tleXdvcmQ6IFNRTFwiXCJcImluc2VydCBpbnRvIGtleXdvcmRzICggZHNrZXksIGxpbmVfbnIsIGtleXdvcmQgKSB2YWx1ZXMgKCAkZHNrZXksICRsaW5lX25yLCAka2V5d29yZCApXG4gICAgICAgIG9uIGNvbmZsaWN0ICggZHNrZXksIGxpbmVfbnIsIGtleXdvcmQgKSBkbyBub3RoaW5nO1wiXCJcIlxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0X2Zyb21fZGF0YXNvdXJjZXM6IFNRTFwiXCJcInNlbGVjdCAqIGZyb20gZGF0YXNvdXJjZXMgb3JkZXIgYnkgZHNrZXk7XCJcIlwiXG4gICAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgICBzZWxlY3RfZnJvbV9rZXl3b3JkczogU1FMXCJcIlwic2VsZWN0ICogZnJvbSBrZXl3b3JkcyBvcmRlciBieSBrZXl3b3JkLCBkc2tleSwgbGluZV9ucjtcIlwiXCJcbiAgICAgIGxvY2F0aW9uc19mcm9tX2tleXdvcmQ6IFNRTFwiXCJcInNlbGVjdCAqIGZyb20ga2V5d29yZHNcbiAgICAgICAgd2hlcmUga2V5d29yZCA9ICRrZXl3b3JkXG4gICAgICAgIG9yZGVyIGJ5IGtleXdvcmQsIGRza2V5LCBsaW5lX25yO1wiXCJcIlxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgc2VsZWN0X2Zyb21fbWlycm9yOiBTUUxcIlwiXCJzZWxlY3QgKiBmcm9tIG1pcnJvciBvcmRlciBieSBkc2tleTtcIlwiXCJcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIHBvcHVsYXRlX2tleXdvcmRzOiBTUUxcIlwiXCJcbiAgICAgICAgaW5zZXJ0IGludG8ga2V5d29yZHMgKCBkc2tleSwgbGluZV9uciwga2V5d29yZCApXG4gICAgICAgICAgc2VsZWN0XG4gICAgICAgICAgICBkcy5kc2tleSAgICBhcyBkc2tleSxcbiAgICAgICAgICAgIG1pLmxpbmVfbnIgIGFzIGxpbmVfbnIsXG4gICAgICAgICAgICBzdy5rZXl3b3JkICBhcyBrZXl3b3JkXG4gICAgICAgICAgZnJvbSBkYXRhc291cmNlcyAgICAgICAgYXMgZHNcbiAgICAgICAgICBqb2luIG1pcnJvciAgICAgICAgICAgICBhcyBtaSB1c2luZyAoIGRza2V5ICksXG4gICAgICAgICAgc3BsaXRfd29yZHMoIG1pLmxpbmUgKSAgYXMgc3dcbiAgICAgICAgICB3aGVyZSB0cnVlIC0tIHdoZXJlIGNsYXVzZSBqdXN0IGEgc3ludGFjdGljIGd1YXJkIGFzIHBlciBodHRwczovL3NxbGl0ZS5vcmcvbGFuZ191cHNlcnQuaHRtbFxuICAgICAgICAgIG9uIGNvbmZsaWN0IGRvIG5vdGhpbmc7XCJcIlwiXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgaW5pdGlhbGl6ZTogLT5cbiAgICAgIHN1cGVyKClcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIEBjcmVhdGVfdGFibGVfZnVuY3Rpb25cbiAgICAgICAgbmFtZTogICAgICAgICAgICdzcGxpdF93b3JkcydcbiAgICAgICAgY29sdW1uczogICAgICAgIFsgJ2tleXdvcmQnLCBdXG4gICAgICAgIHBhcmFtZXRlcnM6ICAgICBbICdsaW5lJywgXVxuICAgICAgICByb3dzOiAoIGxpbmUgKSAtPlxuICAgICAgICAgIGtleXdvcmRzID0gbGluZS5zcGxpdCAvKD86XFxwe1p9Kyl8KCg/OlxccHtMfSspfCg/OlxccHtOfSspfCg/OlxccHtTfSspKS92XG4gICAgICAgICAgIyBkZWJ1ZyAnzqliYmRicl9fXzInLCBsaW5lX25yLCBycHIga2V5d29yZHNcbiAgICAgICAgICBmb3Iga2V5d29yZCBpbiBrZXl3b3Jkc1xuICAgICAgICAgICAgY29udGludWUgdW5sZXNzIGtleXdvcmQ/XG4gICAgICAgICAgICBjb250aW51ZSBpZiBrZXl3b3JkIGlzICcnXG4gICAgICAgICAgICB5aWVsZCB7IGtleXdvcmQsIH1cbiAgICAgICAgICA7bnVsbFxuICAgICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgQGNyZWF0ZV90YWJsZV9mdW5jdGlvblxuICAgICAgICBuYW1lOiAgICAgICAgICdmaWxlX2xpbmVzJ1xuICAgICAgICBjb2x1bW5zOiAgICAgIFsgJ2xpbmVfbnInLCAnbGluZScsIF1cbiAgICAgICAgcGFyYW1ldGVyczogICBbICdwYXRoJywgXVxuICAgICAgICByb3dzOiAoIHBhdGggKSAtPlxuICAgICAgICAgIGZvciB7IGxucjogbGluZV9uciwgbGluZSwgZW9sLCB9IGZyb20gR1VZLmZzLndhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgcGF0aFxuICAgICAgICAgICAgeWllbGQgeyBsaW5lX25yLCBsaW5lLCB9XG4gICAgICAgICAgO251bGxcbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICAgIDtudWxsXG4gICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gIGRvID0+XG4gICAgZGJfcGF0aCAgID0gJy9kZXYvc2htL2JyaWNhYnJhYy5zcWxpdGUnXG4gICAgcGhyYXNlcyAgID0gRGJyaWNfcGhyYXNlcy5vcGVuIGRiX3BhdGhcbiAgICBkZWJ1ZyAnzqliYmRicl9fXzMnLCBwaHJhc2VzLnRlYXJkb3duKClcbiAgICBkZWJ1ZyAnzqliYmRicl9fXzQnLCBwaHJhc2VzLnJlYnVpbGQoKVxuICAgIFRNUF9lcSAoIM6pYmJkYnJfX181ID0gLT4gKCBwaHJhc2VzLnByZXBhcmUgU1FMXCJcIlwicHJhZ21hIGZvcmVpZ25fa2V5c1wiXCJcIiApLmdldCgpICksIHsgZm9yZWlnbl9rZXlzOiAxLCAgICAgIH1cbiAgICBUTVBfZXEgKCDOqWJiZGJyX19fNiA9IC0+ICggcGhyYXNlcy5wcmVwYXJlIFNRTFwiXCJcInByYWdtYSBqb3VybmFsX21vZGVcIlwiXCIgKS5nZXQoKSApLCB7IGpvdXJuYWxfbW9kZTogJ3dhbCcsICB9XG4gICAgVE1QX2VxICggzqliYmRicl9fXzcgPSAtPiBwaHJhc2VzLmRiIGluc3RhbmNlb2YgQnNxbDMgICAgICksIHRydWVcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBkbyA9PlxuICAgICAgZHNrZXkgPSAnaHVtZHVtJ1xuICAgICAgcGF0aCAgPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4vLi4vaGVuZ2lzdC1ORy9hc3NldHMvYnJpY2FicmFjL2h1bXB0eS1kdW1wdHkubWQnXG4gICAgICBwaHJhc2VzLnN0YXRlbWVudHMuaW5zZXJ0X2RhdGFzb3VyY2UucnVuIHsgZHNrZXksIHBhdGggfVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGRlYnVnICfOqWJiZGJyX19fOCcsIHBocmFzZXMuc3RhdGVtZW50cy5wb3B1bGF0ZV9rZXl3b3Jkcy5ydW4oKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubG9jYXRpb25zX2Zyb21fa2V5d29yZC5pdGVyYXRlIHsga2V5d29yZDogJ3Rob3VnaHQnLCB9XG4gICAgZWNobygpXG4gICAgcm93cyA9IHBocmFzZXMuc3RhdGVtZW50cy5sb2NhdGlvbnNfZnJvbV9rZXl3b3JkLml0ZXJhdGUgeyBrZXl3b3JkOiAndGhvdWdodCcsIH1cbiAgICBUTVBfZXEgKCDOqWJiZGJyX19fOSA9IC0+IHJvd3MubmV4dCgpLnZhbHVlICksIHsgZHNrZXk6ICdodW1kdW0nLCBsaW5lX25yOiAxNSwga2V5d29yZDogJ3Rob3VnaHQnIH1cbiAgICBUTVBfZXEgKCDOqWJiZGJyX18xMCA9IC0+IHJvd3MubmV4dCgpLnZhbHVlICksIHsgZHNrZXk6ICdodW1kdW0nLCBsaW5lX25yOiAzNCwga2V5d29yZDogJ3Rob3VnaHQnIH1cbiAgICBUTVBfZXEgKCDOqWJiZGJyX18xMSA9IC0+IHJvd3MubmV4dCgpLnZhbHVlICksIHVuZGVmaW5lZFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubG9jYXRpb25zX2Zyb21fa2V5d29yZC5pdGVyYXRlIHsga2V5d29yZDogJ3NoZScsIH1cbiAgICBlY2hvKClcbiAgICByb3dzID0gcGhyYXNlcy5zdGF0ZW1lbnRzLmxvY2F0aW9uc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICdzaGUnLCB9XG4gICAgVE1QX2VxICggzqliYmRicl9fMTIgPSAtPiByb3dzLm5leHQoKS52YWx1ZSApLCB7IGRza2V5OiAnaHVtZHVtJywgbGluZV9ucjogMiwga2V5d29yZDogJ3NoZScgfVxuICAgIFRNUF9lcSAoIM6pYmJkYnJfXzEzID0gLT4gcm93cy5uZXh0KCkudmFsdWUgKSwgeyBkc2tleTogJ2h1bWR1bScsIGxpbmVfbnI6IDMsIGtleXdvcmQ6ICdzaGUnIH1cbiAgICBUTVBfZXEgKCDOqWJiZGJyX18xNCA9IC0+IHJvd3MubmV4dCgpLnZhbHVlICksIHsgZHNrZXk6ICdodW1kdW0nLCBsaW5lX25yOiA0LCBrZXl3b3JkOiAnc2hlJyB9XG4gICAgVE1QX2VxICggzqliYmRicl9fMTUgPSAtPiByb3dzLm5leHQoKS52YWx1ZSApLCB7IGRza2V5OiAnaHVtZHVtJywgbGluZV9ucjogNSwga2V5d29yZDogJ3NoZScgfVxuICAgIFRNUF9lcSAoIM6pYmJkYnJfXzE2ID0gLT4gcm93cy5uZXh0KCkudmFsdWUgKSwgeyBkc2tleTogJ2h1bWR1bScsIGxpbmVfbnI6IDE1LCBrZXl3b3JkOiAnc2hlJyB9XG4gICAgVE1QX2VxICggzqliYmRicl9fMTcgPSAtPiByb3dzLm5leHQoKS52YWx1ZSApLCB7IGRza2V5OiAnaHVtZHVtJywgbGluZV9ucjogMTcsIGtleXdvcmQ6ICdzaGUnIH1cbiAgICBUTVBfZXEgKCDOqWJiZGJyX18xOCA9IC0+IHJvd3MubmV4dCgpLnZhbHVlICksIHsgZHNrZXk6ICdodW1kdW0nLCBsaW5lX25yOiAxOCwga2V5d29yZDogJ3NoZScgfVxuICAgIFRNUF9lcSAoIM6pYmJkYnJfXzE5ID0gLT4gcm93cy5uZXh0KCkudmFsdWUgKSwgeyBkc2tleTogJ2h1bWR1bScsIGxpbmVfbnI6IDI2LCBrZXl3b3JkOiAnc2hlJyB9XG4gICAgVE1QX2VxICggzqliYmRicl9fMjAgPSAtPiByb3dzLm5leHQoKS52YWx1ZSApLCB7IGRza2V5OiAnaHVtZHVtJywgbGluZV9ucjogMzQsIGtleXdvcmQ6ICdzaGUnIH1cbiAgICBUTVBfZXEgKCDOqWJiZGJyX18yMSA9IC0+IHJvd3MubmV4dCgpLnZhbHVlICksIHsgZHNrZXk6ICdodW1kdW0nLCBsaW5lX25yOiAzNiwga2V5d29yZDogJ3NoZScgfVxuICAgIFRNUF9lcSAoIM6pYmJkYnJfXzIyID0gLT4gcm93cy5uZXh0KCkudmFsdWUgKSwgdW5kZWZpbmVkXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmV0dXJuIG51bGxcblxuZmlsZV9taXJyb3Jfd2l0aF9pbnRlZ3JhdGVkX2luc2VydHMoKVxuXG4iXX0=
