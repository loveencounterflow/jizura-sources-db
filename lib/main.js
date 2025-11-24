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
    var expand_dictionary, get_local_destinations, key, ref, value;
    ({expand_dictionary} = SFMODULES.require_dictionary_tools());
    ({get_local_destinations} = SFMODULES.require_get_local_destinations());
    ref = get_local_destinations();
    for (key in ref) {
      value = ref[key];
      debug('Ωjzrsdb___1', key, value);
    }
    return {
      // can append line numbers to files as in:
      // 'dict:meanings.1:L=13332'
      // 'dict:ucd140.1:uhdidx:L=1234'
      // rowids: 't:jfm:R=1'
      // aref: labels this proximal point in the data set as an origin
      // mref: identifies both the proximal and the distal end
      // zref: identifies the distal source of a piece of data
      'dict:meanings': '$jzrds/meaning/meanings.txt',
      'dict:ucd:v140.0:uhdidx': '$jzrds/unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt'
    };
  };

  //===========================================================================================================
  get_paths = function() {
    var R;
    R = {};
    R.base = PATH.resolve(__dirname, '..');
    R.db = PATH.join(R.base, 'jzr.db');
    R.jzrds = PATH.join(R.base, 'jzrds');
    R.meanings = PATH.join(R.jzrds, 'meaning/meanings.txt');
    R.ucd140_index = PATH.join(R.jzrds, 'unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt');
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
        var paths;
        paths = get_paths();
        this.statements.insert_jzr_datasource.run({
          dskey: 'dict/meanings/1',
          path: paths.meanings
        });
        this.statements.insert_jzr_datasource.run({
          dskey: 'dict/ucd140/index/1',
          path: paths.ucd140_index
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
check ( rowid regexp '^t:ds:\d+$'));`,
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
check ( rowid regexp '^t:fm:\d+$'),
unique ( dskey, line_nr ) );`,
      //.......................................................................................................
      SQL`create table jzr_facets (
  rowid     text    unique  not null,
  dskey     text            not null,
  line_nr   integer         not null,
  fk        text            not null,
  fv        json            not null,
primary key ( rowid ),
check ( rowid regexp '^t:fct:\d+$'),
unique ( dskey, line_nr, fk, fv ),
foreign key ( dskey ) references jzr_datasources ( dskey ) );`
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
      // demo_source_identifiers()

      // debug 'Ωjzrsdb___4', db = new Bsql3 ':memory:'
      // help 'Ωjzrsdb___5', row for row from ( db.prepare SQL"select 45 * 88;" ).iterate()
      // help 'Ωjzrsdb___6', row for row from ( db.prepare SQL"select 'abc' like 'a%';" ).iterate()
      // help 'Ωjzrsdb___7', row for row from ( db.prepare SQL"select 'abc' regexp '^a';" ).iterate()
      return null;
    })();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSx1QkFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsdUJBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLHlCQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxLQUFBOzs7RUFHQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixDQUFBLENBQUUsS0FBRixFQUNFLEtBREYsRUFFRSxJQUZGLEVBR0UsSUFIRixFQUlFLEtBSkYsRUFLRSxNQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxPQVJGLENBQUEsR0FRNEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFSLENBQW9CLG1CQUFwQixDQVI1Qjs7RUFTQSxDQUFBLENBQUUsR0FBRixFQUNFLE9BREYsRUFFRSxJQUZGLEVBR0UsS0FIRixFQUlFLEtBSkYsRUFLRSxJQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxHQVJGLEVBU0UsSUFURixFQVVFLE9BVkYsRUFXRSxHQVhGLENBQUEsR0FXNEIsR0FBRyxDQUFDLEdBWGhDLEVBYkE7Ozs7Ozs7O0VBK0JBLElBQUEsR0FBNEIsT0FBQSxDQUFRLFdBQVIsRUEvQjVCOzs7RUFpQ0EsS0FBQSxHQUE0QixPQUFBLENBQVEsZ0JBQVIsRUFq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MUI7O01BSUEsdUJBQUEsRUFBeUIsR0FBRyxDQUFBOzs7Ozs7Ozs7Ozs7O2tFQUFBO0lBSjVCOzs7O2dCQXBJSjs7O0VBOE5BLHVCQUFBLEdBQTBCLFFBQUEsQ0FBQSxDQUFBO0FBQzFCLFFBQUEsS0FBQSxFQUFBLEVBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxhQUFBLEVBQUEsR0FBQSxFQUFBO0lBQUUsRUFBQSxHQUFLLE1BQUEsQ0FBQSxFQUFQOzs7O0lBSUUsS0FBQSxHQUFRO0lBQ1IsS0FBQSxpRkFBQTtNQUNFLGFBQUEsR0FBZ0IsR0FBRyxDQUFDO0FBQ3BCO0lBRkYsQ0FMRjs7SUFTRSxLQUFBLEdBQVE7SUFDUixLQUFBLDZDQUFBO09BQUk7UUFBRSxHQUFBLEVBQUssT0FBUDtRQUFnQjtNQUFoQjtNQUNGLEtBQUEsQ0FBTSxhQUFOLEVBQXFCLE9BQXJCLEVBQThCLEdBQUEsQ0FBSSxJQUFKLENBQTlCO01BQ0EsS0FBQTtNQUNBLElBQVMsS0FBQSxHQUFRLEVBQWpCO0FBQUEsY0FBQTs7SUFIRixDQVZGOztXQWVHO0VBaEJ1QixFQTlOMUI7OztFQW1QQSxJQUFHLE1BQUEsS0FBVSxPQUFPLENBQUMsSUFBckI7SUFBa0MsQ0FBQSxDQUFBLENBQUEsR0FBQTtNQUNoQyx1QkFBQSxDQUFBLEVBQUY7Ozs7Ozs7YUFPRztJQVIrQixDQUFBLElBQWxDOztBQW5QQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCdcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5HVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xueyBhbGVydFxuICBkZWJ1Z1xuICBoZWxwXG4gIGluZm9cbiAgcGxhaW5cbiAgcHJhaXNlXG4gIHVyZ2VcbiAgd2FyblxuICB3aGlzcGVyIH0gICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ2ppenVyYS1zb3VyY2VzLWRiJ1xueyBycHJcbiAgaW5zcGVjdFxuICBlY2hvXG4gIHdoaXRlXG4gIGdyZWVuXG4gIGJsdWVcbiAgZ29sZFxuICBncmV5XG4gIHJlZFxuICBib2xkXG4gIHJldmVyc2VcbiAgbG9nICAgICB9ICAgICAgICAgICAgICAgPSBHVVkudHJtXG4jIHsgZiB9ICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvZWZmc3RyaW5nJ1xuIyB3cml0ZSAgICAgICAgICAgICAgICAgICAgID0gKCBwICkgLT4gcHJvY2Vzcy5zdGRvdXQud3JpdGUgcFxuIyB7IG5mYSB9ICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL25vcm1hbGl6ZS1mdW5jdGlvbi1hcmd1bWVudHMnXG4jIEdUTkcgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvZ3V5LXRlc3QtTkcnXG4jIHsgVGVzdCAgICAgICAgICAgICAgICAgIH0gPSBHVE5HXG4jIEZTICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOmZzJ1xuUEFUSCAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6cGF0aCdcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQnNxbDMgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2JldHRlci1zcWxpdGUzJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5TRk1PRFVMRVMgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2JyaWNhYnJhYy1zZm1vZHVsZXMnXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgRGJyaWMsXG4gIFNRTCwgICAgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2RicmljKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBKZXRzdHJlYW0sXG4gIEFzeW5jX2pldHN0cmVhbSwgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2pldHN0cmVhbSgpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmRlbW9fc291cmNlX2lkZW50aWZpZXJzID0gLT5cbiAgeyBleHBhbmRfZGljdGlvbmFyeSwgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfZGljdGlvbmFyeV90b29scygpXG4gIHsgZ2V0X2xvY2FsX2Rlc3RpbmF0aW9ucywgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2dldF9sb2NhbF9kZXN0aW5hdGlvbnMoKVxuICBmb3Iga2V5LCB2YWx1ZSBvZiBnZXRfbG9jYWxfZGVzdGluYXRpb25zKClcbiAgICBkZWJ1ZyAnzqlqenJzZGJfX18xJywga2V5LCB2YWx1ZVxuICAjIGNhbiBhcHBlbmQgbGluZSBudW1iZXJzIHRvIGZpbGVzIGFzIGluOlxuICAjICdkaWN0Om1lYW5pbmdzLjE6TD0xMzMzMidcbiAgIyAnZGljdDp1Y2QxNDAuMTp1aGRpZHg6TD0xMjM0J1xuICAjIHJvd2lkczogJ3Q6amZtOlI9MSdcbiAgIyBhcmVmOiBsYWJlbHMgdGhpcyBwcm94aW1hbCBwb2ludCBpbiB0aGUgZGF0YSBzZXQgYXMgYW4gb3JpZ2luXG4gICMgbXJlZjogaWRlbnRpZmllcyBib3RoIHRoZSBwcm94aW1hbCBhbmQgdGhlIGRpc3RhbCBlbmRcbiAgIyB6cmVmOiBpZGVudGlmaWVzIHRoZSBkaXN0YWwgc291cmNlIG9mIGEgcGllY2Ugb2YgZGF0YVxuICB7XG4gICAgJ2RpY3Q6bWVhbmluZ3MnOiAgICAgICAgICAnJGp6cmRzL21lYW5pbmcvbWVhbmluZ3MudHh0J1xuICAgICdkaWN0OnVjZDp2MTQwLjA6dWhkaWR4JzogJyRqenJkcy91bmljb2RlLm9yZy11Y2QtdjE0LjAvVW5paGFuX0RpY3Rpb25hcnlJbmRpY2VzLnR4dCdcbiAgICB9XG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuZ2V0X3BhdGhzID0gLT5cbiAgUiAgICAgICAgICAgICAgID0ge31cbiAgUi5iYXNlICAgICAgICAgID0gUEFUSC5yZXNvbHZlIF9fZGlybmFtZSwgJy4uJ1xuICBSLmRiICAgICAgICAgICAgPSBQQVRILmpvaW4gUi5iYXNlLCAnanpyLmRiJ1xuICBSLmp6cmRzICAgICAgICAgPSBQQVRILmpvaW4gUi5iYXNlLCAnanpyZHMnXG4gIFIubWVhbmluZ3MgICAgICA9IFBBVEguam9pbiBSLmp6cmRzLCAnbWVhbmluZy9tZWFuaW5ncy50eHQnXG4gIFIudWNkMTQwX2luZGV4ICA9IFBBVEguam9pbiBSLmp6cmRzLCAndW5pY29kZS5vcmctdWNkLXYxNC4wL1VuaWhhbl9EaWN0aW9uYXJ5SW5kaWNlcy50eHQnXG4gIHJldHVybiBSXG5cbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuZ2V0X2RiID0gLT5cbiAgcGF0aHMgPSBnZXRfcGF0aHMoKVxuICByZXR1cm4gSnpyYnZmcy5vcGVuIHBhdGhzLmRiXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBKenJidmZzIGV4dGVuZHMgRGJyaWNcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBkYl9jbGFzczogQnNxbDNcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBidWlsZDogW1xuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2RhdGFzb3VyY2VzIChcbiAgICAgICAgcm93aWQgdGV4dCAgICAgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgZHNrZXkgdGV4dCAgICAgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcGF0aCAgdGV4dCAgICAgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNoZWNrICggcm93aWQgcmVnZXhwICdedDpkczpcXGQrJCcpKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9maWxlbWlycm9yIChcbiAgICAgICAgLS0gJ3Q6amZtOidcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgZHNrZXkgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbGluZV9uciAgIGludGVnZXIgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbGNvZGUgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgbGluZSAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgZmllbGRfMSAgIHRleHQgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgZmllbGRfMiAgIHRleHQgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgZmllbGRfMyAgIHRleHQgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgICAgZmllbGRfNCAgIHRleHQgICAgICAgICAgICAgICAgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNoZWNrICggcm93aWQgcmVnZXhwICdedDpmbTpcXGQrJCcpLFxuICAgICAgdW5pcXVlICggZHNrZXksIGxpbmVfbnIgKSApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX2ZhY2V0cyAoXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIGRza2V5ICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmVfbnIgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZrICAgICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIGZ2ICAgICAgICBqc29uICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICBwcmltYXJ5IGtleSAoIHJvd2lkICksXG4gICAgICBjaGVjayAoIHJvd2lkIHJlZ2V4cCAnXnQ6ZmN0OlxcZCskJyksXG4gICAgICB1bmlxdWUgKCBkc2tleSwgbGluZV9uciwgZmssIGZ2ICksXG4gICAgICBmb3JlaWduIGtleSAoIGRza2V5ICkgcmVmZXJlbmNlcyBqenJfZGF0YXNvdXJjZXMgKCBkc2tleSApICk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBzdGF0ZW1lbnRzOlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX2RhdGFzb3VyY2U6IFNRTFwiXCJcImluc2VydCBpbnRvIGp6cl9kYXRhc291cmNlcyAoIGRza2V5LCBwYXRoICkgdmFsdWVzICggJGRza2V5LCAkcGF0aCApXG4gICAgICBvbiBjb25mbGljdCAoIGRza2V5ICkgZG8gdXBkYXRlIHNldCBwYXRoID0gJHBhdGg7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2p6cl9maWxlbWlycm9yOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9maWxlbWlycm9yICggZHNrZXksIGxpbmVfbnIsIGxjb2RlLCBsaW5lLCBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80IClcbiAgICAgIHNlbGVjdFxuICAgICAgICBkcy5kc2tleSAgICBhcyBkc2tleSxcbiAgICAgICAgZmwubGluZV9uciAgYXMgbGluZV9ucixcbiAgICAgICAgZmwubGNvZGUgICAgICAgYXMgbGNvZGUsXG4gICAgICAgIGZsLmxpbmUgICAgIGFzIGxpbmUsXG4gICAgICAgIGZsLmZpZWxkXzEgIGFzIGZpZWxkXzEsXG4gICAgICAgIGZsLmZpZWxkXzIgIGFzIGZpZWxkXzIsXG4gICAgICAgIGZsLmZpZWxkXzMgIGFzIGZpZWxkXzMsXG4gICAgICAgIGZsLmZpZWxkXzQgIGFzIGZpZWxkXzRcbiAgICAgIGZyb20ganpyX2RhdGFzb3VyY2VzICAgICAgICBhcyBkc1xuICAgICAgam9pbiBmaWxlX2xpbmVzKCBkcy5wYXRoICkgIGFzIGZsXG4gICAgICB3aGVyZSB0cnVlXG4gICAgICBvbiBjb25mbGljdCAoIGRza2V5LCBsaW5lX25yICkgZG8gdXBkYXRlIHNldCBsaW5lID0gZXhjbHVkZWQubGluZTtcbiAgICAgIFwiXCJcIlxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQG9wZW46ICggUC4uLiApIC0+XG4gICAgIyMjIFRBSU5UIG5vdCBhIHZlcnkgbmljZSBzb2x1dGlvbiAjIyNcbiAgICAjIyMgVEFJTlQgbmVlZCBtb3JlIGNsYXJpdHkgYWJvdXQgd2hlbiBzdGF0ZW1lbnRzLCBidWlsZCwgaW5pdGlhbGl6ZS4uLiBpcyBwZXJmb3JtZWQgIyMjXG4gICAgUiA9IHN1cGVyIFAuLi5cbiAgICBSLl9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlcygpXG4gICAgUi5fb25fb3Blbl9wb3B1bGF0ZV9qenJfZmlsZW1pcnJvcigpXG4gICAgcmV0dXJuIFJcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlczogLT5cbiAgICBwYXRocyA9IGdldF9wYXRocygpXG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IGRza2V5OiAnZGljdC9tZWFuaW5ncy8xJywgICAgIHBhdGg6IHBhdGhzLm1lYW5pbmdzLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IGRza2V5OiAnZGljdC91Y2QxNDAvaW5kZXgvMScsIHBhdGg6IHBhdGhzLnVjZDE0MF9pbmRleCwgfVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfZmlsZW1pcnJvcjogLT5cbiAgICBAc3RhdGVtZW50cy5wb3B1bGF0ZV9qenJfZmlsZW1pcnJvci5ydW4oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyKClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIEBjcmVhdGVfZnVuY3Rpb25cbiAgICAgIG5hbWU6ICAgICAgICAgICAncmVnZXhwJ1xuICAgICAgZGV0ZXJtaW5pc3RpYzogIHRydWVcbiAgICAgIGNhbGw6ICggcGF0dGVybiwgdGV4dCApIC0+IGlmICggKCBuZXcgUmVnRXhwIHBhdHRlcm4sICd2JyApLnRlc3QgdGV4dCApIHRoZW4gMSBlbHNlIDBcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQGNyZWF0ZV90YWJsZV9mdW5jdGlvblxuICAgICAgbmFtZTogICAgICAgICAgICdzcGxpdF93b3JkcydcbiAgICAgIGNvbHVtbnM6ICAgICAgICBbICdrZXl3b3JkJywgXVxuICAgICAgcGFyYW1ldGVyczogICAgIFsgJ2xpbmUnLCBdXG4gICAgICByb3dzOiAoIGxpbmUgKSAtPlxuICAgICAgICBrZXl3b3JkcyA9IGxpbmUuc3BsaXQgLyg/OlxccHtafSspfCgoPzpcXHB7U2NyaXB0PUhhbn0pfCg/OlxccHtMfSspfCg/OlxccHtOfSspfCg/OlxccHtTfSspKS92XG4gICAgICAgICMgZGVidWcgJ86panpyc2RiX19fMicsIGxpbmVfbnIsIHJwciBrZXl3b3Jkc1xuICAgICAgICBmb3Iga2V5d29yZCBpbiBrZXl3b3Jkc1xuICAgICAgICAgIGNvbnRpbnVlIHVubGVzcyBrZXl3b3JkP1xuICAgICAgICAgIGNvbnRpbnVlIGlmIGtleXdvcmQgaXMgJydcbiAgICAgICAgICB5aWVsZCB7IGtleXdvcmQsIH1cbiAgICAgICAgO251bGxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIEBjcmVhdGVfdGFibGVfZnVuY3Rpb25cbiAgICAgIG5hbWU6ICAgICAgICAgJ2ZpbGVfbGluZXMnXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2xpbmVfbnInLCAnbGNvZGUnLCAnbGluZScsICdmaWVsZF8xJywgJ2ZpZWxkXzInLCAnZmllbGRfMycsICdmaWVsZF80JywgXVxuICAgICAgcGFyYW1ldGVyczogICBbICdwYXRoJywgXVxuICAgICAgcm93czogKCBwYXRoICkgLT5cbiAgICAgICAgZm9yIHsgbG5yOiBsaW5lX25yLCBsaW5lLCBlb2wsIH0gZnJvbSB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zIHBhdGhcbiAgICAgICAgICBmaWVsZF8xID0gZmllbGRfMiA9IGZpZWxkXzMgPSBmaWVsZF80ID0gbnVsbFxuICAgICAgICAgIHN3aXRjaCB0cnVlXG4gICAgICAgICAgICB3aGVuIC9eXFxzKiQvdi50ZXN0IGxpbmVcbiAgICAgICAgICAgICAgbGNvZGUgPSAnRSdcbiAgICAgICAgICAgIHdoZW4gL15cXHMqIy92LnRlc3QgbGluZVxuICAgICAgICAgICAgICBsY29kZSA9ICdDJ1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICBsY29kZSA9ICdEJ1xuICAgICAgICAgICAgICBbIGZpZWxkXzEsIGZpZWxkXzIsIGZpZWxkXzMsIGZpZWxkXzQsIF0gPSBsaW5lLnNwbGl0ICdcXHQnXG4gICAgICAgICAgICAgIGZpZWxkXzEgPz0gbnVsbFxuICAgICAgICAgICAgICBmaWVsZF8yID89IG51bGxcbiAgICAgICAgICAgICAgZmllbGRfMyA/PSBudWxsXG4gICAgICAgICAgICAgIGZpZWxkXzQgPz0gbnVsbFxuICAgICAgICAgIHlpZWxkIHsgbGluZV9uciwgbGNvZGUsIGxpbmUsIGZpZWxkXzEsIGZpZWxkXzIsIGZpZWxkXzMsIGZpZWxkXzQsIH1cbiAgICAgICAgO251bGxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDtudWxsXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxucG9wdWxhdGVfbWVhbmluZ19mYWNldHMgPSAtPlxuICBkYiA9IGdldF9kYigpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyMjIFRBSU5UIGEgY29udm9sdXRlZCB3YXkgdG8gZ2V0IGEgZmlsZSBwYXRoICMjI1xuICAjIyMgVEFJTlQgbWFrZSBhbiBBUEkgY2FsbCAjIyNcbiAgZHNrZXkgPSAnZGljdC9tZWFuaW5ncy8xJ1xuICBmb3Igcm93IGZyb20gZGIud2FsayBTUUxcInNlbGVjdCAqIGZyb20ganpyX2RhdGFzb3VyY2VzIHdoZXJlIGRza2V5ID0gJGRza2V5O1wiLCB7IGRza2V5LCB9XG4gICAgbWVhbmluZ3NfcGF0aCA9IHJvdy5wYXRoXG4gICAgYnJlYWtcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBjb3VudCA9IDBcbiAgZm9yIHsgbG5yOiBsaW5lX25yLCBsaW5lLCB9IGZyb20gd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyBtZWFuaW5nc19wYXRoXG4gICAgZGVidWcgJ86panpyc2RiX19fMycsIGxpbmVfbnIsIHJwciBsaW5lXG4gICAgY291bnQrK1xuICAgIGJyZWFrIGlmIGNvdW50ID4gMTBcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICA7bnVsbFxuXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5pZiBtb2R1bGUgaXMgcmVxdWlyZS5tYWluIHRoZW4gZG8gPT5cbiAgcG9wdWxhdGVfbWVhbmluZ19mYWNldHMoKVxuICAjIGRlbW9fc291cmNlX2lkZW50aWZpZXJzKClcblxuICAjIGRlYnVnICfOqWp6cnNkYl9fXzQnLCBkYiA9IG5ldyBCc3FsMyAnOm1lbW9yeTonXG4gICMgaGVscCAnzqlqenJzZGJfX181Jywgcm93IGZvciByb3cgZnJvbSAoIGRiLnByZXBhcmUgU1FMXCJzZWxlY3QgNDUgKiA4ODtcIiApLml0ZXJhdGUoKVxuICAjIGhlbHAgJ86panpyc2RiX19fNicsIHJvdyBmb3Igcm93IGZyb20gKCBkYi5wcmVwYXJlIFNRTFwic2VsZWN0ICdhYmMnIGxpa2UgJ2ElJztcIiApLml0ZXJhdGUoKVxuICAjIGhlbHAgJ86panpyc2RiX19fNycsIHJvdyBmb3Igcm93IGZyb20gKCBkYi5wcmVwYXJlIFNRTFwic2VsZWN0ICdhYmMnIHJlZ2V4cCAnXmEnO1wiICkuaXRlcmF0ZSgpXG4gIDtudWxsXG5cbiJdfQ==
