(function() {
  'use strict';
  var Async_jetstream, Bsql3, Dbric, GUY, Jetstream, Jzrbvfs, PATH, SFMODULES, SQL, alert, blue, bold, debug, demo_source_identifiers, echo, get_db, get_paths, gold, green, grey, help, info, inspect, log, plain, populate_meaning_facets, praise, red, reverse, rpr, urge, walk_lines_with_positions, warn, whisper, white;

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
  demo_source_identifiers = function() {
    var expand_dictionary, get_local_destinations, key, ref, results, value;
    ({expand_dictionary} = SFMODULES.require_dictionary_tools());
    ({get_local_destinations} = SFMODULES.require_get_local_destinations());
    ref = get_local_destinations();
    results = [];
    for (key in ref) {
      value = ref[key];
      results.push(debug('Ωjzrsdb___1', key, value));
    }
    return results;
  };

  // can append line numbers to files as in:
  // 'dict:meanings.1:L=13332'
  // 'dict:ucd140.1:uhdidx:L=1234'
  // rowids: 't:jfm:R=1'
  // aref: labels this proximal point in the data set as an origin
  // mref: identifies both the proximal and the distal end
  // zref: identifies the distal source of a piece of data
  // {
  //   'dict:meanings':          '$jzrds/meaning/meanings.txt'
  //   'dict:ucd:v14.0:uhdidx' : '$jzrds/unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt'
  //   }

  //===========================================================================================================
  get_paths = function() {
    var R;
    R = {};
    R.base = PATH.resolve(__dirname, '..');
    R.db = PATH.join(R.base, 'jzr.db');
    R.jzrds = PATH.join(R.base, 'jzrds');
    R['dict:meanings'] = PATH.join(R.jzrds, 'meaning/meanings.txt');
    R['dict:ucd:v14.0:uhdidx'] = PATH.join(R.jzrds, 'unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt');
    return R;
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
        var dskey, paths;
        paths = get_paths();
        dskey = 'dict:meanings';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=1',
          dskey,
          path: paths[dskey]
        });
        dskey = 'dict:ucd:v14.0:uhdidx';
        this.statements.insert_jzr_datasource.run({
          rowid: 't:ds:R=2',
          dskey,
          path: paths[dskey]
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
        this.create_function({
          name: 'regexp',
          deterministic: true,
          call: function(pattern, text) {
            if ((new RegExp(pattern, 'v')).test(text)) {
              return 1;
            } else {
              return 0;
            }
          }
        });
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
  rowid text        unique  not null,
  dskey text        unique  not null,
  path  text                not null,
primary key ( rowid ),
check ( rowid regexp '^t:ds:R=\\d+$'));`,
      //.......................................................................................................
      SQL`create table jzr_filemirror (
  -- 't:jfm:'
  rowid     text    unique  not null,
  dskey     text            not null,
  line_nr   integer         not null,
  lcode     text            not null,
  line      text            not null,
  field_1   text                null,
  field_2   text                null,
  field_3   text                null,
  field_4   text                null,
primary key ( rowid ),
check ( rowid regexp '^t:fm:R=\\d+$'),
unique ( dskey, line_nr ) );`,
      //.......................................................................................................
      SQL`create table jzr_facets (
  rowid     text    unique  not null,
  dskey     text            not null,
  line_nr   integer         not null,
  fk        text            not null,
  fv        json            not null,
primary key ( rowid ),
check ( rowid regexp '^t:fct:R=\\d+$' ),
unique ( dskey, line_nr, fk, fv ),
foreign key ( dskey ) references jzr_datasources ( dskey ) );`
    ];

    //---------------------------------------------------------------------------------------------------------
    //.......................................................................................................
    Jzrbvfs.statements = {
      //.......................................................................................................
      insert_jzr_datasource: SQL`insert into jzr_datasources ( rowid, dskey, path ) values ( $rowid, $dskey, $path )
  on conflict ( dskey ) do update set path = $path;`,
      //.......................................................................................................
      populate_jzr_filemirror: SQL`insert into jzr_filemirror ( rowid, dskey, line_nr, lcode, line, field_1, field_2, field_3, field_4 )
select
  't:fm:R=' || row_number() over ()          as rowid,
  -- ds.dskey || ':L=' || fl.line_nr   as rowid,
  ds.dskey                          as dskey,
  fl.line_nr                        as line_nr,
  fl.lcode                          as lcode,
  fl.line                           as line,
  fl.field_1                        as field_1,
  fl.field_2                        as field_2,
  fl.field_3                        as field_3,
  fl.field_4                        as field_4
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
    dskey = 'dict:meanings';
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
      // demo_source_identifiers()

      // debug 'Ωjzrsdb___4', db = new Bsql3 ':memory:'
      // help 'Ωjzrsdb___5', row for row from ( db.prepare SQL"select 45 * 88;" ).iterate()
      // help 'Ωjzrsdb___6', row for row from ( db.prepare SQL"select 'abc' like 'a%';" ).iterate()
      // help 'Ωjzrsdb___7', row for row from ( db.prepare SQL"select 'abc' regexp '^a';" ).iterate()
      return null;
    })();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSx1QkFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsdUJBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLHlCQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxLQUFBOzs7RUFHQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixDQUFBLENBQUUsS0FBRixFQUNFLEtBREYsRUFFRSxJQUZGLEVBR0UsSUFIRixFQUlFLEtBSkYsRUFLRSxNQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxPQVJGLENBQUEsR0FRNEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFSLENBQW9CLG1CQUFwQixDQVI1Qjs7RUFTQSxDQUFBLENBQUUsR0FBRixFQUNFLE9BREYsRUFFRSxJQUZGLEVBR0UsS0FIRixFQUlFLEtBSkYsRUFLRSxJQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxHQVJGLEVBU0UsSUFURixFQVVFLE9BVkYsRUFXRSxHQVhGLENBQUEsR0FXNEIsR0FBRyxDQUFDLEdBWGhDLEVBYkE7Ozs7Ozs7O0VBK0JBLElBQUEsR0FBNEIsT0FBQSxDQUFRLFdBQVIsRUEvQjVCOzs7RUFpQ0EsS0FBQSxHQUE0QixPQUFBLENBQVEsZ0JBQVIsRUFqQzVCOzs7RUFtQ0EsU0FBQSxHQUE0QixPQUFBLENBQVEsMkNBQVIsRUFuQzVCOzs7RUFxQ0EsQ0FBQSxDQUFFLEtBQUYsRUFDRSxHQURGLENBQUEsR0FDZ0MsU0FBUyxDQUFDLFFBQVEsQ0FBQyxhQUFuQixDQUFBLENBRGhDLEVBckNBOzs7RUF3Q0EsQ0FBQSxDQUFFLFNBQUYsRUFDRSxlQURGLENBQUEsR0FDZ0MsU0FBUyxDQUFDLGlCQUFWLENBQUEsQ0FEaEMsRUF4Q0E7OztFQTJDQSxDQUFBLENBQUUseUJBQUYsQ0FBQSxHQUFnQyxTQUFTLENBQUMsUUFBUSxDQUFDLHVCQUFuQixDQUFBLENBQWhDLEVBM0NBOzs7RUErQ0EsdUJBQUEsR0FBMEIsUUFBQSxDQUFBLENBQUE7QUFDMUIsUUFBQSxpQkFBQSxFQUFBLHNCQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUE7SUFBRSxDQUFBLENBQUUsaUJBQUYsQ0FBQSxHQUE4QixTQUFTLENBQUMsd0JBQVYsQ0FBQSxDQUE5QjtJQUNBLENBQUEsQ0FBRSxzQkFBRixDQUFBLEdBQThCLFNBQVMsQ0FBQyw4QkFBVixDQUFBLENBQTlCO0FBQ0E7QUFBQTtJQUFBLEtBQUEsVUFBQTs7bUJBQ0UsS0FBQSxDQUFNLGFBQU4sRUFBcUIsR0FBckIsRUFBMEIsS0FBMUI7SUFERixDQUFBOztFQUh3QixFQS9DMUI7Ozs7Ozs7Ozs7Ozs7OztFQWlFQSxTQUFBLEdBQVksUUFBQSxDQUFBLENBQUE7QUFDWixRQUFBO0lBQUUsQ0FBQSxHQUFrQyxDQUFBO0lBQ2xDLENBQUMsQ0FBQyxJQUFGLEdBQWtDLElBQUksQ0FBQyxPQUFMLENBQWEsU0FBYixFQUF3QixJQUF4QjtJQUNsQyxDQUFDLENBQUMsRUFBRixHQUFrQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxJQUFaLEVBQWtCLFFBQWxCO0lBQ2xDLENBQUMsQ0FBQyxLQUFGLEdBQWtDLElBQUksQ0FBQyxJQUFMLENBQVUsQ0FBQyxDQUFDLElBQVosRUFBa0IsT0FBbEI7SUFDbEMsQ0FBQyxDQUFFLGVBQUYsQ0FBRCxHQUFrQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxLQUFaLEVBQW1CLHNCQUFuQjtJQUNsQyxDQUFDLENBQUUsdUJBQUYsQ0FBRCxHQUFrQyxJQUFJLENBQUMsSUFBTCxDQUFVLENBQUMsQ0FBQyxLQUFaLEVBQW1CLG9EQUFuQjtBQUNsQyxXQUFPO0VBUEcsRUFqRVo7OztFQTJFQSxNQUFBLEdBQVMsUUFBQSxDQUFBLENBQUE7QUFDVCxRQUFBO0lBQUUsS0FBQSxHQUFRLFNBQUEsQ0FBQTtBQUNSLFdBQU8sT0FBTyxDQUFDLElBQVIsQ0FBYSxLQUFLLENBQUMsRUFBbkI7RUFGQTs7RUFNSDs7SUFBTixNQUFBLFFBQUEsUUFBc0IsTUFBdEIsQ0FBQTs7TUE0RVMsT0FBTixJQUFNLENBQUEsR0FBRSxDQUFGLENBQUEsRUFBQTs7O0FBQ1QsWUFBQTtRQUVJLENBQUEsUUFIRCxDQUFBLElBR0ssQ0FBTSxHQUFBLENBQU47UUFDSixDQUFDLENBQUMsaUNBQUYsQ0FBQTtRQUNBLENBQUMsQ0FBQyxnQ0FBRixDQUFBO0FBQ0EsZUFBTztNQU5GLENBMUVUOzs7TUFtRkUsaUNBQW1DLENBQUEsQ0FBQTtBQUNyQyxZQUFBLEtBQUEsRUFBQTtRQUFJLEtBQUEsR0FBUSxTQUFBLENBQUE7UUFDUixLQUFBLEdBQVE7UUFBMEIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFsQyxDQUFzQztVQUFFLEtBQUEsRUFBTyxVQUFUO1VBQXFCLEtBQXJCO1VBQTRCLElBQUEsRUFBTSxLQUFLLENBQUUsS0FBRjtRQUF2QyxDQUF0QztRQUNsQyxLQUFBLEdBQVE7UUFBMEIsSUFBQyxDQUFBLFVBQVUsQ0FBQyxxQkFBcUIsQ0FBQyxHQUFsQyxDQUFzQztVQUFFLEtBQUEsRUFBTyxVQUFUO1VBQXFCLEtBQXJCO1VBQTRCLElBQUEsRUFBTSxLQUFLLENBQUUsS0FBRjtRQUF2QyxDQUF0QztlQUNqQztNQUpnQyxDQW5GckM7OztNQTBGRSxnQ0FBa0MsQ0FBQSxDQUFBO1FBQ2hDLElBQUMsQ0FBQSxVQUFVLENBQUMsdUJBQXVCLENBQUMsR0FBcEMsQ0FBQTtlQUNDO01BRitCLENBMUZwQzs7O01BK0ZFLFVBQVksQ0FBQSxDQUFBO2FBQVosQ0FBQSxVQUNFLENBQUEsRUFBSjs7UUFFSSxJQUFDLENBQUEsZUFBRCxDQUNFO1VBQUEsSUFBQSxFQUFnQixRQUFoQjtVQUNBLGFBQUEsRUFBZ0IsSUFEaEI7VUFFQSxJQUFBLEVBQU0sUUFBQSxDQUFFLE9BQUYsRUFBVyxJQUFYLENBQUE7WUFBcUIsSUFBSyxDQUFFLElBQUksTUFBSixDQUFXLE9BQVgsRUFBb0IsR0FBcEIsQ0FBRixDQUEyQixDQUFDLElBQTVCLENBQWlDLElBQWpDLENBQUw7cUJBQWtELEVBQWxEO2FBQUEsTUFBQTtxQkFBeUQsRUFBekQ7O1VBQXJCO1FBRk4sQ0FERixFQUZKOztRQVFJLElBQUMsQ0FBQSxxQkFBRCxDQUNFO1VBQUEsSUFBQSxFQUFnQixhQUFoQjtVQUNBLE9BQUEsRUFBZ0IsQ0FBRSxTQUFGLENBRGhCO1VBRUEsVUFBQSxFQUFnQixDQUFFLE1BQUYsQ0FGaEI7VUFHQSxJQUFBLEVBQU0sU0FBQSxDQUFFLElBQUYsQ0FBQTtBQUNaLGdCQUFBLENBQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBO1lBQVEsUUFBQSxHQUFXLElBQUksQ0FBQyxLQUFMLENBQVcsbUVBQVgsRUFBbkI7O1lBRVEsS0FBQSwwQ0FBQTs7Y0FDRSxJQUFnQixlQUFoQjtBQUFBLHlCQUFBOztjQUNBLElBQVksT0FBQSxLQUFXLEVBQXZCO0FBQUEseUJBQUE7O2NBQ0EsTUFBTSxDQUFBLENBQUUsT0FBRixDQUFBO1lBSFI7bUJBSUM7VUFQRztRQUhOLENBREYsRUFSSjs7UUFxQkksSUFBQyxDQUFBLHFCQUFELENBQ0U7VUFBQSxJQUFBLEVBQWMsWUFBZDtVQUNBLE9BQUEsRUFBYyxDQUFFLFNBQUYsRUFBYSxPQUFiLEVBQXNCLE1BQXRCLEVBQThCLFNBQTlCLEVBQXlDLFNBQXpDLEVBQW9ELFNBQXBELEVBQStELFNBQS9ELENBRGQ7VUFFQSxVQUFBLEVBQWMsQ0FBRSxNQUFGLENBRmQ7VUFHQSxJQUFBLEVBQU0sU0FBQSxDQUFFLElBQUYsQ0FBQTtBQUNaLGdCQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsT0FBQSxFQUFBLE9BQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUE7WUFBUSxLQUFBLG9DQUFBO2VBQUk7Z0JBQUUsR0FBQSxFQUFLLE9BQVA7Z0JBQWdCLElBQWhCO2dCQUFzQjtjQUF0QjtjQUNGLE9BQUEsR0FBVSxPQUFBLEdBQVUsT0FBQSxHQUFVLE9BQUEsR0FBVTtBQUN4QyxzQkFBTyxJQUFQO0FBQUEscUJBQ08sUUFBUSxDQUFDLElBQVQsQ0FBYyxJQUFkLENBRFA7a0JBRUksS0FBQSxHQUFRO0FBREw7QUFEUCxxQkFHTyxRQUFRLENBQUMsSUFBVCxDQUFjLElBQWQsQ0FIUDtrQkFJSSxLQUFBLEdBQVE7QUFETDtBQUhQO2tCQU1JLEtBQUEsR0FBUTtrQkFDUixDQUFFLE9BQUYsRUFBVyxPQUFYLEVBQW9CLE9BQXBCLEVBQTZCLE9BQTdCLENBQUEsR0FBMEMsSUFBSSxDQUFDLEtBQUwsQ0FBVyxJQUFYOztvQkFDMUMsVUFBVzs7O29CQUNYLFVBQVc7OztvQkFDWCxVQUFXOzs7b0JBQ1gsVUFBVzs7QUFYZjtjQVlBLE1BQU0sQ0FBQSxDQUFFLE9BQUYsRUFBVyxLQUFYLEVBQWtCLElBQWxCLEVBQXdCLE9BQXhCLEVBQWlDLE9BQWpDLEVBQTBDLE9BQTFDLEVBQW1ELE9BQW5ELENBQUE7WUFkUjttQkFlQztVQWhCRztRQUhOLENBREYsRUFyQko7O2VBMkNLO01BNUNTOztJQWpHZDs7O0lBR0UsT0FBQyxDQUFBLFFBQUQsR0FBVzs7O0lBR1gsT0FBQyxDQUFBLEtBQUQsR0FBUTs7TUFHTixHQUFHLENBQUE7Ozs7O3VDQUFBLENBSEc7O01BV04sR0FBRyxDQUFBOzs7Ozs7Ozs7Ozs7OzRCQUFBLENBWEc7O01BMkJOLEdBQUcsQ0FBQTs7Ozs7Ozs7OzZEQUFBLENBM0JHOzs7OztJQTBDUixPQUFDLENBQUEsVUFBRCxHQUdFLENBQUE7O01BQUEscUJBQUEsRUFBdUIsR0FBRyxDQUFBO21EQUFBLENBQTFCOztNQUtBLHVCQUFBLEVBQXlCLEdBQUcsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7O2tFQUFBO0lBTDVCOzs7O2dCQXBJSjs7O0VBaU9BLHVCQUFBLEdBQTBCLFFBQUEsQ0FBQSxDQUFBO0FBQzFCLFFBQUEsS0FBQSxFQUFBLEVBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxhQUFBLEVBQUEsR0FBQSxFQUFBO0lBQUUsRUFBQSxHQUFLLE1BQUEsQ0FBQSxFQUFQOzs7O0lBSUUsS0FBQSxHQUFRO0lBQ1IsS0FBQSxpRkFBQTtNQUNFLGFBQUEsR0FBZ0IsR0FBRyxDQUFDO0FBQ3BCO0lBRkYsQ0FMRjs7SUFTRSxLQUFBLEdBQVE7SUFDUixLQUFBLDZDQUFBO09BQUk7UUFBRSxHQUFBLEVBQUssT0FBUDtRQUFnQjtNQUFoQjtNQUNGLEtBQUEsQ0FBTSxhQUFOLEVBQXFCLE9BQXJCLEVBQThCLEdBQUEsQ0FBSSxJQUFKLENBQTlCO01BQ0EsS0FBQTtNQUNBLElBQVMsS0FBQSxHQUFRLEVBQWpCO0FBQUEsY0FBQTs7SUFIRixDQVZGOztXQWVHO0VBaEJ1QixFQWpPMUI7OztFQXNQQSxJQUFHLE1BQUEsS0FBVSxPQUFPLENBQUMsSUFBckI7SUFBa0MsQ0FBQSxDQUFBLENBQUEsR0FBQTtNQUNoQyx1QkFBQSxDQUFBLEVBQUY7Ozs7Ozs7YUFPRztJQVIrQixDQUFBLElBQWxDOztBQXRQQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCdcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5HVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xueyBhbGVydFxuICBkZWJ1Z1xuICBoZWxwXG4gIGluZm9cbiAgcGxhaW5cbiAgcHJhaXNlXG4gIHVyZ2VcbiAgd2FyblxuICB3aGlzcGVyIH0gICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ2ppenVyYS1zb3VyY2VzLWRiJ1xueyBycHJcbiAgaW5zcGVjdFxuICBlY2hvXG4gIHdoaXRlXG4gIGdyZWVuXG4gIGJsdWVcbiAgZ29sZFxuICBncmV5XG4gIHJlZFxuICBib2xkXG4gIHJldmVyc2VcbiAgbG9nICAgICB9ICAgICAgICAgICAgICAgPSBHVVkudHJtXG4jIHsgZiB9ICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvZWZmc3RyaW5nJ1xuIyB3cml0ZSAgICAgICAgICAgICAgICAgICAgID0gKCBwICkgLT4gcHJvY2Vzcy5zdGRvdXQud3JpdGUgcFxuIyB7IG5mYSB9ICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL25vcm1hbGl6ZS1mdW5jdGlvbi1hcmd1bWVudHMnXG4jIEdUTkcgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvZ3V5LXRlc3QtTkcnXG4jIHsgVGVzdCAgICAgICAgICAgICAgICAgIH0gPSBHVE5HXG4jIEZTICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOmZzJ1xuUEFUSCAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6cGF0aCdcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQnNxbDMgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2JldHRlci1zcWxpdGUzJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5TRk1PRFVMRVMgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2JyaWNhYnJhYy1zZm1vZHVsZXMnXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgRGJyaWMsXG4gIFNRTCwgICAgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2RicmljKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBKZXRzdHJlYW0sXG4gIEFzeW5jX2pldHN0cmVhbSwgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2pldHN0cmVhbSgpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmRlbW9fc291cmNlX2lkZW50aWZpZXJzID0gLT5cbiAgeyBleHBhbmRfZGljdGlvbmFyeSwgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfZGljdGlvbmFyeV90b29scygpXG4gIHsgZ2V0X2xvY2FsX2Rlc3RpbmF0aW9ucywgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2dldF9sb2NhbF9kZXN0aW5hdGlvbnMoKVxuICBmb3Iga2V5LCB2YWx1ZSBvZiBnZXRfbG9jYWxfZGVzdGluYXRpb25zKClcbiAgICBkZWJ1ZyAnzqlqenJzZGJfX18xJywga2V5LCB2YWx1ZVxuICAjIGNhbiBhcHBlbmQgbGluZSBudW1iZXJzIHRvIGZpbGVzIGFzIGluOlxuICAjICdkaWN0Om1lYW5pbmdzLjE6TD0xMzMzMidcbiAgIyAnZGljdDp1Y2QxNDAuMTp1aGRpZHg6TD0xMjM0J1xuICAjIHJvd2lkczogJ3Q6amZtOlI9MSdcbiAgIyBhcmVmOiBsYWJlbHMgdGhpcyBwcm94aW1hbCBwb2ludCBpbiB0aGUgZGF0YSBzZXQgYXMgYW4gb3JpZ2luXG4gICMgbXJlZjogaWRlbnRpZmllcyBib3RoIHRoZSBwcm94aW1hbCBhbmQgdGhlIGRpc3RhbCBlbmRcbiAgIyB6cmVmOiBpZGVudGlmaWVzIHRoZSBkaXN0YWwgc291cmNlIG9mIGEgcGllY2Ugb2YgZGF0YVxuICAjIHtcbiAgIyAgICdkaWN0Om1lYW5pbmdzJzogICAgICAgICAgJyRqenJkcy9tZWFuaW5nL21lYW5pbmdzLnR4dCdcbiAgIyAgICdkaWN0OnVjZDp2MTQuMDp1aGRpZHgnIDogJyRqenJkcy91bmljb2RlLm9yZy11Y2QtdjE0LjAvVW5paGFuX0RpY3Rpb25hcnlJbmRpY2VzLnR4dCdcbiAgIyAgIH1cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5nZXRfcGF0aHMgPSAtPlxuICBSICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0ge31cbiAgUi5iYXNlICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEgucmVzb2x2ZSBfX2Rpcm5hbWUsICcuLidcbiAgUi5kYiAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBSLmJhc2UsICdqenIuZGInXG4gIFIuanpyZHMgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gUi5iYXNlLCAnanpyZHMnXG4gIFJbICdkaWN0Om1lYW5pbmdzJyAgICAgICAgICBdICAgPSBQQVRILmpvaW4gUi5qenJkcywgJ21lYW5pbmcvbWVhbmluZ3MudHh0J1xuICBSWyAnZGljdDp1Y2Q6djE0LjA6dWhkaWR4JyAgXSAgID0gUEFUSC5qb2luIFIuanpyZHMsICd1bmljb2RlLm9yZy11Y2QtdjE0LjAvVW5paGFuX0RpY3Rpb25hcnlJbmRpY2VzLnR4dCdcbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5nZXRfZGIgPSAtPlxuICBwYXRocyA9IGdldF9wYXRocygpXG4gIHJldHVybiBKenJidmZzLm9wZW4gcGF0aHMuZGJcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEp6cmJ2ZnMgZXh0ZW5kcyBEYnJpY1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQGRiX2NsYXNzOiBCc3FsM1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQGJ1aWxkOiBbXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfZGF0YXNvdXJjZXMgKFxuICAgICAgICByb3dpZCB0ZXh0ICAgICAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBkc2tleSB0ZXh0ICAgICAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBwYXRoICB0ZXh0ICAgICAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCByb3dpZCByZWdleHAgJ150OmRzOlI9XFxcXGQrJCcpKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9maWxlbWlycm9yIChcbiAgICAgICAgLS0gJ3Q6amZtOidcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgZHNrZXkgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbGluZV9uciAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbGNvZGUgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbGluZSAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgZmllbGRfMSAgIHRleHQgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgZmllbGRfMiAgIHRleHQgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgZmllbGRfMyAgIHRleHQgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgZmllbGRfNCAgIHRleHQgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNoZWNrICggcm93aWQgcmVnZXhwICdedDpmbTpSPVxcXFxkKyQnKSxcbiAgICAgIHVuaXF1ZSAoIGRza2V5LCBsaW5lX25yICkgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9mYWNldHMgKFxuICAgICAgICByb3dpZCAgICAgdGV4dCAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBkc2tleSAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBsaW5lX25yICAgaW50ZWdlciAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBmayAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBmdiAgICAgICAganNvbiAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCByb3dpZCByZWdleHAgJ150OmZjdDpSPVxcXFxkKyQnICksXG4gICAgICB1bmlxdWUgKCBkc2tleSwgbGluZV9uciwgZmssIGZ2ICksXG4gICAgICBmb3JlaWduIGtleSAoIGRza2V5ICkgcmVmZXJlbmNlcyBqenJfZGF0YXNvdXJjZXMgKCBkc2tleSApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBzdGF0ZW1lbnRzOlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX2RhdGFzb3VyY2U6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX2RhdGFzb3VyY2VzICggcm93aWQsIGRza2V5LCBwYXRoICkgdmFsdWVzICggJHJvd2lkLCAkZHNrZXksICRwYXRoIClcbiAgICAgICAgb24gY29uZmxpY3QgKCBkc2tleSApIGRvIHVwZGF0ZSBzZXQgcGF0aCA9ICRwYXRoO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfZmlsZW1pcnJvcjogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfZmlsZW1pcnJvciAoIHJvd2lkLCBkc2tleSwgbGluZV9uciwgbGNvZGUsIGxpbmUsIGZpZWxkXzEsIGZpZWxkXzIsIGZpZWxkXzMsIGZpZWxkXzQgKVxuICAgICAgc2VsZWN0XG4gICAgICAgICd0OmZtOlI9JyB8fCByb3dfbnVtYmVyKCkgb3ZlciAoKSAgICAgICAgICBhcyByb3dpZCxcbiAgICAgICAgLS0gZHMuZHNrZXkgfHwgJzpMPScgfHwgZmwubGluZV9uciAgIGFzIHJvd2lkLFxuICAgICAgICBkcy5kc2tleSAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgZHNrZXksXG4gICAgICAgIGZsLmxpbmVfbnIgICAgICAgICAgICAgICAgICAgICAgICBhcyBsaW5lX25yLFxuICAgICAgICBmbC5sY29kZSAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbGNvZGUsXG4gICAgICAgIGZsLmxpbmUgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBsaW5lLFxuICAgICAgICBmbC5maWVsZF8xICAgICAgICAgICAgICAgICAgICAgICAgYXMgZmllbGRfMSxcbiAgICAgICAgZmwuZmllbGRfMiAgICAgICAgICAgICAgICAgICAgICAgIGFzIGZpZWxkXzIsXG4gICAgICAgIGZsLmZpZWxkXzMgICAgICAgICAgICAgICAgICAgICAgICBhcyBmaWVsZF8zLFxuICAgICAgICBmbC5maWVsZF80ICAgICAgICAgICAgICAgICAgICAgICAgYXMgZmllbGRfNFxuICAgICAgZnJvbSBqenJfZGF0YXNvdXJjZXMgICAgICAgIGFzIGRzXG4gICAgICBqb2luIGZpbGVfbGluZXMoIGRzLnBhdGggKSAgYXMgZmxcbiAgICAgIHdoZXJlIHRydWVcbiAgICAgIG9uIGNvbmZsaWN0ICggZHNrZXksIGxpbmVfbnIgKSBkbyB1cGRhdGUgc2V0IGxpbmUgPSBleGNsdWRlZC5saW5lO1xuICAgICAgXCJcIlwiXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAb3BlbjogKCBQLi4uICkgLT5cbiAgICAjIyMgVEFJTlQgbm90IGEgdmVyeSBuaWNlIHNvbHV0aW9uICMjI1xuICAgICMjIyBUQUlOVCBuZWVkIG1vcmUgY2xhcml0eSBhYm91dCB3aGVuIHN0YXRlbWVudHMsIGJ1aWxkLCBpbml0aWFsaXplLi4uIGlzIHBlcmZvcm1lZCAjIyNcbiAgICBSID0gc3VwZXIgUC4uLlxuICAgIFIuX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VzKClcbiAgICBSLl9vbl9vcGVuX3BvcHVsYXRlX2p6cl9maWxlbWlycm9yKClcbiAgICByZXR1cm4gUlxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VzOiAtPlxuICAgIHBhdGhzID0gZ2V0X3BhdGhzKClcbiAgICBkc2tleSA9ICdkaWN0Om1lYW5pbmdzJzsgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEnLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkaWN0OnVjZDp2MTQuMDp1aGRpZHgnOyAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTInLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX2ZpbGVtaXJyb3I6IC0+XG4gICAgQHN0YXRlbWVudHMucG9wdWxhdGVfanpyX2ZpbGVtaXJyb3IucnVuKClcbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgaW5pdGlhbGl6ZTogLT5cbiAgICBzdXBlcigpXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBAY3JlYXRlX2Z1bmN0aW9uXG4gICAgICBuYW1lOiAgICAgICAgICAgJ3JlZ2V4cCdcbiAgICAgIGRldGVybWluaXN0aWM6ICB0cnVlXG4gICAgICBjYWxsOiAoIHBhdHRlcm4sIHRleHQgKSAtPiBpZiAoICggbmV3IFJlZ0V4cCBwYXR0ZXJuLCAndicgKS50ZXN0IHRleHQgKSB0aGVuIDEgZWxzZSAwXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIEBjcmVhdGVfdGFibGVfZnVuY3Rpb25cbiAgICAgIG5hbWU6ICAgICAgICAgICAnc3BsaXRfd29yZHMnXG4gICAgICBjb2x1bW5zOiAgICAgICAgWyAna2V5d29yZCcsIF1cbiAgICAgIHBhcmFtZXRlcnM6ICAgICBbICdsaW5lJywgXVxuICAgICAgcm93czogKCBsaW5lICkgLT5cbiAgICAgICAga2V5d29yZHMgPSBsaW5lLnNwbGl0IC8oPzpcXHB7Wn0rKXwoKD86XFxwe1NjcmlwdD1IYW59KXwoPzpcXHB7TH0rKXwoPzpcXHB7Tn0rKXwoPzpcXHB7U30rKSkvdlxuICAgICAgICAjIGRlYnVnICfOqWp6cnNkYl9fXzInLCBsaW5lX25yLCBycHIga2V5d29yZHNcbiAgICAgICAgZm9yIGtleXdvcmQgaW4ga2V5d29yZHNcbiAgICAgICAgICBjb250aW51ZSB1bmxlc3Mga2V5d29yZD9cbiAgICAgICAgICBjb250aW51ZSBpZiBrZXl3b3JkIGlzICcnXG4gICAgICAgICAgeWllbGQgeyBrZXl3b3JkLCB9XG4gICAgICAgIDtudWxsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBAY3JlYXRlX3RhYmxlX2Z1bmN0aW9uXG4gICAgICBuYW1lOiAgICAgICAgICdmaWxlX2xpbmVzJ1xuICAgICAgY29sdW1uczogICAgICBbICdsaW5lX25yJywgJ2xjb2RlJywgJ2xpbmUnLCAnZmllbGRfMScsICdmaWVsZF8yJywgJ2ZpZWxkXzMnLCAnZmllbGRfNCcsIF1cbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAncGF0aCcsIF1cbiAgICAgIHJvd3M6ICggcGF0aCApIC0+XG4gICAgICAgIGZvciB7IGxucjogbGluZV9uciwgbGluZSwgZW9sLCB9IGZyb20gd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBwYXRoXG4gICAgICAgICAgZmllbGRfMSA9IGZpZWxkXzIgPSBmaWVsZF8zID0gZmllbGRfNCA9IG51bGxcbiAgICAgICAgICBzd2l0Y2ggdHJ1ZVxuICAgICAgICAgICAgd2hlbiAvXlxccyokL3YudGVzdCBsaW5lXG4gICAgICAgICAgICAgIGxjb2RlID0gJ0UnXG4gICAgICAgICAgICB3aGVuIC9eXFxzKiMvdi50ZXN0IGxpbmVcbiAgICAgICAgICAgICAgbGNvZGUgPSAnQydcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgbGNvZGUgPSAnRCdcbiAgICAgICAgICAgICAgWyBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80LCBdID0gbGluZS5zcGxpdCAnXFx0J1xuICAgICAgICAgICAgICBmaWVsZF8xID89IG51bGxcbiAgICAgICAgICAgICAgZmllbGRfMiA/PSBudWxsXG4gICAgICAgICAgICAgIGZpZWxkXzMgPz0gbnVsbFxuICAgICAgICAgICAgICBmaWVsZF80ID89IG51bGxcbiAgICAgICAgICB5aWVsZCB7IGxpbmVfbnIsIGxjb2RlLCBsaW5lLCBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80LCB9XG4gICAgICAgIDtudWxsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7bnVsbFxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbnBvcHVsYXRlX21lYW5pbmdfZmFjZXRzID0gLT5cbiAgZGIgPSBnZXRfZGIoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICMjIyBUQUlOVCBhIGNvbnZvbHV0ZWQgd2F5IHRvIGdldCBhIGZpbGUgcGF0aCAjIyNcbiAgIyMjIFRBSU5UIG1ha2UgYW4gQVBJIGNhbGwgIyMjXG4gIGRza2V5ID0gJ2RpY3Q6bWVhbmluZ3MnXG4gIGZvciByb3cgZnJvbSBkYi53YWxrIFNRTFwic2VsZWN0ICogZnJvbSBqenJfZGF0YXNvdXJjZXMgd2hlcmUgZHNrZXkgPSAkZHNrZXk7XCIsIHsgZHNrZXksIH1cbiAgICBtZWFuaW5nc19wYXRoID0gcm93LnBhdGhcbiAgICBicmVha1xuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGNvdW50ID0gMFxuICBmb3IgeyBsbnI6IGxpbmVfbnIsIGxpbmUsIH0gZnJvbSB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zIG1lYW5pbmdzX3BhdGhcbiAgICBkZWJ1ZyAnzqlqenJzZGJfX18zJywgbGluZV9uciwgcnByIGxpbmVcbiAgICBjb3VudCsrXG4gICAgYnJlYWsgaWYgY291bnQgPiAxMFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIDtudWxsXG5cblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmlmIG1vZHVsZSBpcyByZXF1aXJlLm1haW4gdGhlbiBkbyA9PlxuICBwb3B1bGF0ZV9tZWFuaW5nX2ZhY2V0cygpXG4gICMgZGVtb19zb3VyY2VfaWRlbnRpZmllcnMoKVxuXG4gICMgZGVidWcgJ86panpyc2RiX19fNCcsIGRiID0gbmV3IEJzcWwzICc6bWVtb3J5OidcbiAgIyBoZWxwICfOqWp6cnNkYl9fXzUnLCByb3cgZm9yIHJvdyBmcm9tICggZGIucHJlcGFyZSBTUUxcInNlbGVjdCA0NSAqIDg4O1wiICkuaXRlcmF0ZSgpXG4gICMgaGVscCAnzqlqenJzZGJfX182Jywgcm93IGZvciByb3cgZnJvbSAoIGRiLnByZXBhcmUgU1FMXCJzZWxlY3QgJ2FiYycgbGlrZSAnYSUnO1wiICkuaXRlcmF0ZSgpXG4gICMgaGVscCAnzqlqenJzZGJfX183Jywgcm93IGZvciByb3cgZnJvbSAoIGRiLnByZXBhcmUgU1FMXCJzZWxlY3QgJ2FiYycgcmVnZXhwICdeYSc7XCIgKS5pdGVyYXRlKClcbiAgO251bGxcblxuIl19
