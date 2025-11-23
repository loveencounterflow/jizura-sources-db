(function() {
  'use strict';
  var Async_jetstream, Bsql3, Dbric, GUY, Jetstream, Jzrbvfs, PATH, SFMODULES, SQL, alert, blue, bold, debug, echo, get_db, get_paths, gold, green, grey, help, info, inspect, log, plain, populate_meaning_facets, praise, red, reverse, rpr, urge, walk_lines_with_positions, warn, whisper, white;

  //===========================================================================================================
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('jizura-sources-db'));

  ({rpr, inspect, echo, white, green, blue, gold, grey, red, bold, reverse, log} = GUY.trm);

  // { f }                     = require '../../hengist-NG/apps/effstring'
  // write                     = ( p ) -> process.stdout.write p
  // { nfa }                   = require '../../hengist-NG/apps/normalize-function-arguments'
  // GTNG                      = require '../../hengist-NG/apps/guy-test-NG'
  // { Test                  } = GTNG
  // FS                        = require 'node:fs'
  PATH = require('node:path');

  //-----------------------------------------------------------------------------------------------------------
  Bsql3 = require('better-sqlite3');

  //-----------------------------------------------------------------------------------------------------------
  SFMODULES = require('../../hengist-NG/apps/bricabrac-sfmodules');

  //...........................................................................................................
  ({Dbric, SQL} = SFMODULES.unstable.require_dbric());

  //...........................................................................................................
  ({Jetstream, Async_jetstream} = SFMODULES.require_jetstream());

  //...........................................................................................................
  ({walk_lines_with_positions} = SFMODULES.unstable.require_fast_linereader());

  //===========================================================================================================
  get_paths = function() {
    var base, db, jzrds, meanings;
    base = PATH.resolve(__dirname, '..');
    db = PATH.join(base, 'jzr.db');
    jzrds = PATH.join(base, 'jzrds');
    meanings = PATH.join(jzrds, 'meaning/meanings.txt');
    return {base, db, jzrds, meanings};
  };

  //-----------------------------------------------------------------------------------------------------------
  get_db = function() {
    var paths;
    paths = get_paths();
    return Jzrbvfs.open(paths.db);
  };

  Jzrbvfs = (function() {
    //===========================================================================================================
    class Jzrbvfs extends Dbric {
      //---------------------------------------------------------------------------------------------------------
      static open(...P) {
        /* TAINT not a very nice solution */
        /* TAINT need more clarity about when statements, build, initialize... is performed */
        var R;
        R = super.open(...P);
        R._on_open_populate_jzr_datasources();
        R._on_open_populate_jzr_filemirror();
        return R;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_datasources() {
        var paths;
        paths = get_paths();
        debug('Ωjzrsdb___1', paths);
        this.statements.insert_jzr_datasource.run({
          dskey: 'dict/meanings/1',
          path: paths.meanings
        });
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_filemirror() {
        this.statements.populate_jzr_filemirror.run();
        return null;
      }

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
        //.......................................................................................................
        this.create_table_function({
          name: 'file_lines',
          columns: ['line_nr', 'lcode', 'line', 'field_1', 'field_2', 'field_3', 'field_4'],
          parameters: ['path'],
          rows: function*(path) {
            var eol, field_1, field_2, field_3, field_4, lcode, line, line_nr, x;
            for (x of walk_lines_with_positions(path)) {
              ({
                lnr: line_nr,
                line,
                eol
              } = x);
              field_1 = field_2 = field_3 = field_4 = null;
              switch (true) {
                case /^\s*$/v.test(line):
                  lcode = 'E';
                  break;
                case /^\s*#/v.test(line):
                  lcode = 'C';
                  break;
                default:
                  lcode = 'D';
                  [field_1, field_2, field_3, field_4] = line.split('\t');
                  if (field_1 == null) {
                    field_1 = null;
                  }
                  if (field_2 == null) {
                    field_2 = null;
                  }
                  if (field_3 == null) {
                    field_3 = null;
                  }
                  if (field_4 == null) {
                    field_4 = null;
                  }
              }
              yield ({line_nr, lcode, line, field_1, field_2, field_3, field_4});
            }
            return null;
          }
        });
        //.......................................................................................................
        return null;
      }

    };

    //---------------------------------------------------------------------------------------------------------
    Jzrbvfs.db_class = Bsql3;

    //---------------------------------------------------------------------------------------------------------
    Jzrbvfs.build = [
      //.......................................................................................................
      SQL`create table jzr_datasources (
dskey text unique not null,
path text not null,
primary key ( dskey ) );`,
      //.......................................................................................................
      SQL`create table jzr_filemirror (
dskey     text    not null,
line_nr   integer not null,
lcode     text    not null,
line      text    not null,
field_1   text        null,
field_2   text        null,
field_3   text        null,
field_4   text        null,
primary key ( dskey, line_nr ) );`,
      //.......................................................................................................
      SQL`create table jzr_facets (
  dskey   text    not null,
  line_nr integer not null,
  fk      text    not null,
  fv      json    not null,
foreign key ( dskey ) references jzr_datasources ( dskey ),
primary key ( dskey, line_nr, fk, fv ) );`
    ];

    //---------------------------------------------------------------------------------------------------------
    //.......................................................................................................
    Jzrbvfs.statements = {
      //.......................................................................................................
      insert_jzr_datasource: SQL`insert into jzr_datasources ( dskey, path ) values ( $dskey, $path )
on conflict ( dskey ) do update set path = $path;`,
      //.......................................................................................................
      populate_jzr_filemirror: SQL`insert into jzr_filemirror ( dskey, line_nr, lcode, line, field_1, field_2, field_3, field_4 )
select
  ds.dskey    as dskey,
  fl.line_nr  as line_nr,
  fl.lcode       as lcode,
  fl.line     as line,
  fl.field_1  as field_1,
  fl.field_2  as field_2,
  fl.field_3  as field_3,
  fl.field_4  as field_4
from jzr_datasources        as ds
join file_lines( ds.path )  as fl
where true
on conflict ( dskey, line_nr ) do update set line = excluded.line;`
    };

    return Jzrbvfs;

  }).call(this);

  //===========================================================================================================
  populate_meaning_facets = function() {
    var count, db, dskey, line, line_nr, meanings_path, row, x;
    db = get_db();
    //.........................................................................................................
    /* TAINT a convoluted way to get a file path */
    /* TAINT make an API call */
    dskey = 'dict/meanings/1';
    for (row of db.walk(SQL`select * from jzr_datasources where dskey = $dskey;`, {dskey})) {
      meanings_path = row.path;
      break;
    }
    //.........................................................................................................
    count = 0;
    for (x of walk_lines_with_positions(meanings_path)) {
      ({
        lnr: line_nr,
        line
      } = x);
      debug('Ωjzrsdb___3', line_nr, rpr(line));
      count++;
      if (count > 10) {
        break;
      }
    }
    //.........................................................................................................
    return null;
  };

  //===========================================================================================================
  if (module === require.main) {
    (() => {
      populate_meaning_facets();
      return null;
    })();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsS0FBQSxFQUFBLHVCQUFBLEVBQUEsTUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSx5QkFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQTs7O0VBR0EsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxLQURGLEVBRUUsSUFGRixFQUdFLElBSEYsRUFJRSxLQUpGLEVBS0UsTUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsT0FSRixDQUFBLEdBUTRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBUixDQUFvQixtQkFBcEIsQ0FSNUI7O0VBU0EsQ0FBQSxDQUFFLEdBQUYsRUFDRSxPQURGLEVBRUUsSUFGRixFQUdFLEtBSEYsRUFJRSxLQUpGLEVBS0UsSUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsR0FSRixFQVNFLElBVEYsRUFVRSxPQVZGLEVBV0UsR0FYRixDQUFBLEdBVzRCLEdBQUcsQ0FBQyxHQVhoQyxFQWJBOzs7Ozs7OztFQStCQSxJQUFBLEdBQTRCLE9BQUEsQ0FBUSxXQUFSLEVBL0I1Qjs7O0VBaUNBLEtBQUEsR0FBNEIsT0FBQSxDQUFRLGdCQUFSLEVBakM1Qjs7O0VBbUNB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O3lDQUFBLENBckJHOzs7OztJQWlDUixPQUFDLENBQUEsVUFBRCxHQUdFLENBQUE7O01BQUEscUJBQUEsRUFBdUIsR0FBRyxDQUFBO2lEQUFBLENBQTFCOztNQUlBLHVCQUFBLEVBQXlCLEdBQUcsQ0FBQTs7Ozs7Ozs7Ozs7OztrRUFBQTtJQUo1Qjs7OztnQkEzR0o7OztFQStMQSx1QkFBQSxHQUEwQixRQUFBLENBQUEsQ0FBQTtBQUMxQixRQUFBLEtBQUEsRUFBQSxFQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsYUFBQSxFQUFBLEdBQUEsRUFBQTtJQUFFLEVBQUEsR0FBSyxNQUFBLENBQUEsRUFBUDs7OztJQUlFLEtBQUEsR0FBUTtJQUNSLEtBQUEsaUZBQUE7TUFDRSxhQUFBLEdBQWdCLEdBQUcsQ0FBQztBQUNwQjtJQUZGLENBTEY7O0lBU0UsS0FBQSxHQUFRO0lBQ1IsS0FBQSw2Q0FBQTtPQUFJO1FBQUUsR0FBQSxFQUFLLE9BQVA7UUFBZ0I7TUFBaEI7TUFDRixLQUFBLENBQU0sYUFBTixFQUFxQixPQUFyQixFQUE4QixHQUFBLENBQUksSUFBSixDQUE5QjtNQUNBLEtBQUE7TUFDQSxJQUFTLEtBQUEsR0FBUSxFQUFqQjtBQUFBLGNBQUE7O0lBSEYsQ0FWRjs7V0FlRztFQWhCdUIsRUEvTDFCOzs7RUFvTkEsSUFBRyxNQUFBLEtBQVUsT0FBTyxDQUFDLElBQXJCO0lBQWtDLENBQUEsQ0FBQSxDQUFBLEdBQUE7TUFDaEMsdUJBQUEsQ0FBQTthQUNDO0lBRitCLENBQUEsSUFBbEM7O0FBcE5BIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0J1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbkdVWSAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXknXG57IGFsZXJ0XG4gIGRlYnVnXG4gIGhlbHBcbiAgaW5mb1xuICBwbGFpblxuICBwcmFpc2VcbiAgdXJnZVxuICB3YXJuXG4gIHdoaXNwZXIgfSAgICAgICAgICAgICAgID0gR1VZLnRybS5nZXRfbG9nZ2VycyAnaml6dXJhLXNvdXJjZXMtZGInXG57IHJwclxuICBpbnNwZWN0XG4gIGVjaG9cbiAgd2hpdGVcbiAgZ3JlZW5cbiAgYmx1ZVxuICBnb2xkXG4gIGdyZXlcbiAgcmVkXG4gIGJvbGRcbiAgcmV2ZXJzZVxuICBsb2cgICAgIH0gICAgICAgICAgICAgICA9IEdVWS50cm1cbiMgeyBmIH0gICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9lZmZzdHJpbmcnXG4jIHdyaXRlICAgICAgICAgICAgICAgICAgICAgPSAoIHAgKSAtPiBwcm9jZXNzLnN0ZG91dC53cml0ZSBwXG4jIHsgbmZhIH0gICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvbm9ybWFsaXplLWZ1bmN0aW9uLWFyZ3VtZW50cydcbiMgR1RORyAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ndXktdGVzdC1ORydcbiMgeyBUZXN0ICAgICAgICAgICAgICAgICAgfSA9IEdUTkdcbiMgRlMgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6ZnMnXG5QQVRIICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpwYXRoJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5Cc3FsMyAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnYmV0dGVyLXNxbGl0ZTMnXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblNGTU9EVUxFUyAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvYnJpY2FicmFjLXNmbW9kdWxlcydcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBEYnJpYyxcbiAgU1FMLCAgICAgICAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZGJyaWMoKVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IEpldHN0cmVhbSxcbiAgQXN5bmNfamV0c3RyZWFtLCAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfamV0c3RyZWFtKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9mYXN0X2xpbmVyZWFkZXIoKVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZ2V0X3BhdGhzID0gLT5cbiAgYmFzZSAgICAgID0gUEFUSC5yZXNvbHZlIF9fZGlybmFtZSwgJy4uJ1xuICBkYiAgICAgICAgPSBQQVRILmpvaW4gYmFzZSwgJ2p6ci5kYidcbiAganpyZHMgICAgID0gUEFUSC5qb2luIGJhc2UsICdqenJkcydcbiAgbWVhbmluZ3MgID0gUEFUSC5qb2luIGp6cmRzLCAnbWVhbmluZy9tZWFuaW5ncy50eHQnXG4gIHJldHVybiB7XG4gICAgYmFzZSxcbiAgICBkYixcbiAgICBqenJkcyxcbiAgICBtZWFuaW5ncywgfVxuXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbmdldF9kYiA9IC0+XG4gIHBhdGhzID0gZ2V0X3BhdGhzKClcbiAgcmV0dXJuIEp6cmJ2ZnMub3BlbiBwYXRocy5kYlxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgSnpyYnZmcyBleHRlbmRzIERicmljXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAZGJfY2xhc3M6IEJzcWwzXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAYnVpbGQ6IFtcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9kYXRhc291cmNlcyAoXG4gICAgICAgIGRza2V5IHRleHQgdW5pcXVlIG5vdCBudWxsLFxuICAgICAgICBwYXRoIHRleHQgbm90IG51bGwsXG4gICAgICAgIHByaW1hcnkga2V5ICggZHNrZXkgKSApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2ZpbGVtaXJyb3IgKFxuICAgICAgICBkc2tleSAgICAgdGV4dCAgICBub3QgbnVsbCxcbiAgICAgICAgbGluZV9uciAgIGludGVnZXIgbm90IG51bGwsXG4gICAgICAgIGxjb2RlICAgICB0ZXh0ICAgIG5vdCBudWxsLFxuICAgICAgICBsaW5lICAgICAgdGV4dCAgICBub3QgbnVsbCxcbiAgICAgICAgZmllbGRfMSAgIHRleHQgICAgICAgIG51bGwsXG4gICAgICAgIGZpZWxkXzIgICB0ZXh0ICAgICAgICBudWxsLFxuICAgICAgICBmaWVsZF8zICAgdGV4dCAgICAgICAgbnVsbCxcbiAgICAgICAgZmllbGRfNCAgIHRleHQgICAgICAgIG51bGwsXG4gICAgICAgIHByaW1hcnkga2V5ICggZHNrZXksIGxpbmVfbnIgKSApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2ZhY2V0cyAoXG4gICAgICAgIGRza2V5ICAgdGV4dCAgICBub3QgbnVsbCxcbiAgICAgICAgbGluZV9uciBpbnRlZ2VyIG5vdCBudWxsLFxuICAgICAgICBmayAgICAgIHRleHQgICAgbm90IG51bGwsXG4gICAgICAgIGZ2ICAgICAganNvbiAgICBub3QgbnVsbCxcbiAgICAgIGZvcmVpZ24ga2V5ICggZHNrZXkgKSByZWZlcmVuY2VzIGp6cl9kYXRhc291cmNlcyAoIGRza2V5ICksXG4gICAgICBwcmltYXJ5IGtleSAoIGRza2V5LCBsaW5lX25yLCBmaywgZnYgKSApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBdXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAc3RhdGVtZW50czpcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgaW5zZXJ0X2p6cl9kYXRhc291cmNlOiBTUUxcIlwiXCJpbnNlcnQgaW50byBqenJfZGF0YXNvdXJjZXMgKCBkc2tleSwgcGF0aCApIHZhbHVlcyAoICRkc2tleSwgJHBhdGggKVxuICAgICAgb24gY29uZmxpY3QgKCBkc2tleSApIGRvIHVwZGF0ZSBzZXQgcGF0aCA9ICRwYXRoO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfZmlsZW1pcnJvcjogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfZmlsZW1pcnJvciAoIGRza2V5LCBsaW5lX25yLCBsY29kZSwgbGluZSwgZmllbGRfMSwgZmllbGRfMiwgZmllbGRfMywgZmllbGRfNCApXG4gICAgICBzZWxlY3RcbiAgICAgICAgZHMuZHNrZXkgICAgYXMgZHNrZXksXG4gICAgICAgIGZsLmxpbmVfbnIgIGFzIGxpbmVfbnIsXG4gICAgICAgIGZsLmxjb2RlICAgICAgIGFzIGxjb2RlLFxuICAgICAgICBmbC5saW5lICAgICBhcyBsaW5lLFxuICAgICAgICBmbC5maWVsZF8xICBhcyBmaWVsZF8xLFxuICAgICAgICBmbC5maWVsZF8yICBhcyBmaWVsZF8yLFxuICAgICAgICBmbC5maWVsZF8zICBhcyBmaWVsZF8zLFxuICAgICAgICBmbC5maWVsZF80ICBhcyBmaWVsZF80XG4gICAgICBmcm9tIGp6cl9kYXRhc291cmNlcyAgICAgICAgYXMgZHNcbiAgICAgIGpvaW4gZmlsZV9saW5lcyggZHMucGF0aCApICBhcyBmbFxuICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgb24gY29uZmxpY3QgKCBkc2tleSwgbGluZV9uciApIGRvIHVwZGF0ZSBzZXQgbGluZSA9IGV4Y2x1ZGVkLmxpbmU7XG4gICAgICBcIlwiXCJcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBvcGVuOiAoIFAuLi4gKSAtPlxuICAgICMjIyBUQUlOVCBub3QgYSB2ZXJ5IG5pY2Ugc29sdXRpb24gIyMjXG4gICAgIyMjIFRBSU5UIG5lZWQgbW9yZSBjbGFyaXR5IGFib3V0IHdoZW4gc3RhdGVtZW50cywgYnVpbGQsIGluaXRpYWxpemUuLi4gaXMgcGVyZm9ybWVkICMjI1xuICAgIFIgPSBzdXBlciBQLi4uXG4gICAgUi5fb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZXMoKVxuICAgIFIuX29uX29wZW5fcG9wdWxhdGVfanpyX2ZpbGVtaXJyb3IoKVxuICAgIHJldHVybiBSXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZGF0YXNvdXJjZXM6IC0+XG4gICAgcGF0aHMgPSBnZXRfcGF0aHMoKVxuICAgIGRlYnVnICfOqWp6cnNkYl9fXzEnLCBwYXRoc1xuICAgIEBzdGF0ZW1lbnRzLmluc2VydF9qenJfZGF0YXNvdXJjZS5ydW4geyBkc2tleTogJ2RpY3QvbWVhbmluZ3MvMScsIHBhdGg6IHBhdGhzLm1lYW5pbmdzLCB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9maWxlbWlycm9yOiAtPlxuICAgIEBzdGF0ZW1lbnRzLnBvcHVsYXRlX2p6cl9maWxlbWlycm9yLnJ1bigpXG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXIoKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQGNyZWF0ZV90YWJsZV9mdW5jdGlvblxuICAgICAgbmFtZTogICAgICAgICAgICdzcGxpdF93b3JkcydcbiAgICAgIGNvbHVtbnM6ICAgICAgICBbICdrZXl3b3JkJywgXVxuICAgICAgcGFyYW1ldGVyczogICAgIFsgJ2xpbmUnLCBdXG4gICAgICByb3dzOiAoIGxpbmUgKSAtPlxuICAgICAgICBrZXl3b3JkcyA9IGxpbmUuc3BsaXQgLyg/OlxccHtafSspfCgoPzpcXHB7U2NyaXB0PUhhbn0pfCg/OlxccHtMfSspfCg/OlxccHtOfSspfCg/OlxccHtTfSspKS92XG4gICAgICAgICMgZGVidWcgJ86panpyc2RiX19fMicsIGxpbmVfbnIsIHJwciBrZXl3b3Jkc1xuICAgICAgICBmb3Iga2V5d29yZCBpbiBrZXl3b3Jkc1xuICAgICAgICAgIGNvbnRpbnVlIHVubGVzcyBrZXl3b3JkP1xuICAgICAgICAgIGNvbnRpbnVlIGlmIGtleXdvcmQgaXMgJydcbiAgICAgICAgICB5aWVsZCB7IGtleXdvcmQsIH1cbiAgICAgICAgO251bGxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIEBjcmVhdGVfdGFibGVfZnVuY3Rpb25cbiAgICAgIG5hbWU6ICAgICAgICAgJ2ZpbGVfbGluZXMnXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2xpbmVfbnInLCAnbGNvZGUnLCAnbGluZScsICdmaWVsZF8xJywgJ2ZpZWxkXzInLCAnZmllbGRfMycsICdmaWVsZF80JywgXVxuICAgICAgcGFyYW1ldGVyczogICBbICdwYXRoJywgXVxuICAgICAgcm93czogKCBwYXRoICkgLT5cbiAgICAgICAgZm9yIHsgbG5yOiBsaW5lX25yLCBsaW5lLCBlb2wsIH0gZnJvbSB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zIHBhdGhcbiAgICAgICAgICBmaWVsZF8xID0gZmllbGRfMiA9IGZpZWxkXzMgPSBmaWVsZF80ID0gbnVsbFxuICAgICAgICAgIHN3aXRjaCB0cnVlXG4gICAgICAgICAgICB3aGVuIC9eXFxzKiQvdi50ZXN0IGxpbmVcbiAgICAgICAgICAgICAgbGNvZGUgPSAnRSdcbiAgICAgICAgICAgIHdoZW4gL15cXHMqIy92LnRlc3QgbGluZVxuICAgICAgICAgICAgICBsY29kZSA9ICdDJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBsY29kZSA9ICdEJ1xuICAgICAgICAgICAgICBbIGZpZWxkXzEsIGZpZWxkXzIsIGZpZWxkXzMsIGZpZWxkXzQsIF0gPSBsaW5lLnNwbGl0ICdcXHQnXG4gICAgICAgICAgICAgIGZpZWxkXzEgPz0gbnVsbFxuICAgICAgICAgICAgICBmaWVsZF8yID89IG51bGxcbiAgICAgICAgICAgICAgZmllbGRfMyA/PSBudWxsXG4gICAgICAgICAgICAgIGZpZWxkXzQgPz0gbnVsbFxuICAgICAgICAgIHlpZWxkIHsgbGluZV9uciwgbGNvZGUsIGxpbmUsIGZpZWxkXzEsIGZpZWxkXzIsIGZpZWxkXzMsIGZpZWxkXzQsIH1cbiAgICAgICAgO251bGxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDtudWxsXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxucG9wdWxhdGVfbWVhbmluZ19mYWNldHMgPSAtPlxuICBkYiA9IGdldF9kYigpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyMjIFRBSU5UIGEgY29udm9sdXRlZCB3YXkgdG8gZ2V0IGEgZmlsZSBwYXRoICMjI1xuICAjIyMgVEFJTlQgbWFrZSBhbiBBUEkgY2FsbCAjIyNcbiAgZHNrZXkgPSAnZGljdC9tZWFuaW5ncy8xJ1xuICBmb3Igcm93IGZyb20gZGIud2FsayBTUUxcInNlbGVjdCAqIGZyb20ganpyX2RhdGFzb3VyY2VzIHdoZXJlIGRza2V5ID0gJGRza2V5O1wiLCB7IGRza2V5LCB9XG4gICAgbWVhbmluZ3NfcGF0aCA9IHJvdy5wYXRoXG4gICAgYnJlYWtcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBjb3VudCA9IDBcbiAgZm9yIHsgbG5yOiBsaW5lX25yLCBsaW5lLCB9IGZyb20gd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBtZWFuaW5nc19wYXRoXG4gICAgZGVidWcgJ86panpyc2RiX19fMycsIGxpbmVfbnIsIHJwciBsaW5lXG4gICAgY291bnQrK1xuICAgIGJyZWFrIGlmIGNvdW50ID4gMTBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICA7bnVsbFxuXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5pZiBtb2R1bGUgaXMgcmVxdWlyZS5tYWluIHRoZW4gZG8gPT5cbiAgcG9wdWxhdGVfbWVhbmluZ19mYWNldHMoKVxuICA7bnVsbFxuXG4iXX0=
