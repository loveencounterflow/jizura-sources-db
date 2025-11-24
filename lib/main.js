(function() {
  'use strict';
  var Async_jetstream, Bsql3, Dbric, GUY, Jetstream, Jzrbvfs, PATH, SFMODULES, SQL, alert, blue, bold, debug, demo_source_identifiers, echo, get_db, get_paths, gold, green, grey, help, info, inspect, log, plain, populate_meaning_mirror_triples, praise, red, reverse, rpr, urge, walk_lines_with_positions, warn, whisper, white;

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
    var expand_dictionary, get_local_destinations, key, ref1, results, value;
    ({expand_dictionary} = SFMODULES.require_dictionary_tools());
    ({get_local_destinations} = SFMODULES.require_get_local_destinations());
    ref1 = get_local_destinations();
    results = [];
    for (key in ref1) {
      value = ref1[key];
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
        if (R.is_fresh) {
          R._on_open_populate_jzr_datasources();
          R._on_open_populate_jzr_mirror_lcodes();
          R._on_open_populate_jzr_mirror_lines();
          R._on_open_populate_jzr_mirror_triples_for_meanings();
        } else {
          warn('Ωjzrsdb___2', "skipped data insertion");
          debug('Ωjzrsdb___3', R.is_ready);
          debug('Ωjzrsdb___4', R.is_fresh);
        }
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
      _on_open_populate_jzr_mirror_lcodes() {
        this.statements.insert_jzr_mirror_lcode.run({
          rowid: 't:lc:V=B',
          lcode: 'B',
          comment: 'blank line'
        });
        this.statements.insert_jzr_mirror_lcode.run({
          rowid: 't:lc:V=C',
          lcode: 'C',
          comment: 'comment line'
        });
        this.statements.insert_jzr_mirror_lcode.run({
          rowid: 't:lc:V=D',
          lcode: 'D',
          comment: 'data line'
        });
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_mirror_lines() {
        this.statements.populate_jzr_mirror_lines.run();
        return null;
      }

      //---------------------------------------------------------------------------------------------------------
      _on_open_populate_jzr_mirror_triples_for_meanings() {}

      // ;null

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
                  lcode = 'B';
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
      SQL`create table jzr_mirror_lcodes (
  rowid     text    unique  not null,
  lcode     text    unique  not null,
  comment   text            not null,
primary key ( rowid ),
check ( lcode regexp '^[a-zA-Z]+[a-zA-Z0-9]*$' ),
check ( rowid = 't:lc:V=' || lcode ) );`,
      //.......................................................................................................
      SQL`create table jzr_mirror_lines (
  -- 't:jfm:'
  rowid     text    unique  not null,
  ref       text    unique  not null generated always as ( dskey || ':L=' || line_nr ) virtual,
  dskey     text            not null,
  line_nr   integer         not null,
  lcode     text            not null,
  line      text            not null,
  field_1   text                null,
  field_2   text                null,
  field_3   text                null,
  field_4   text                null,
primary key ( rowid ),
check ( rowid regexp '^t:mr:ln:R=\\d+$'),
unique ( dskey, line_nr ),
foreign key ( lcode ) references jzr_mirror_lcodes ( lcode ) );`,
      //.......................................................................................................
      SQL`create table jzr_mirror_triples (
  rowid     text    unique  not null,
  ref       text            not null,
  -- ref       text    unique  not null generated always as ( dskey || ':L=' || line_nr ) virtual,
  -- dskey     text            not null,
  -- line_nr   integer         not null,
  -- ### TAINT use refs, rowids to identify subjects?
  s         text            not null,
  v         text            not null,
  o         json            not null,
primary key ( rowid ),
check ( rowid regexp '^t:mr:3pl:R=\\d+$' ),
unique ( ref, s, v, o ),
foreign key ( ref ) references jzr_mirror_lines ( rowid )
);`
    ];

    //---------------------------------------------------------------------------------------------------------
    //.......................................................................................................
    /* aggregate table for all rowids goes here */
    //.......................................................................................................
    Jzrbvfs.statements = {
      //.......................................................................................................
      insert_jzr_datasource: SQL`insert into jzr_datasources ( rowid, dskey, path ) values ( $rowid, $dskey, $path )
  on conflict ( dskey ) do update set path = $path;`,
      //.......................................................................................................
      insert_jzr_mirror_lcode: SQL`insert into jzr_mirror_lcodes ( rowid, lcode, comment ) values ( $rowid, $lcode, $comment )
  on conflict ( rowid ) do update set lcode = $lcode, comment = $comment;`,
      //.......................................................................................................
      insert_jzr_mirror_triple: SQL`insert into jzr_mirror_triples ( rowid, ref, s, v, o ) values ( $rowid, $ref, $s, $v, $o )
  on conflict ( ref, s, v, o ) do nothing;`,
      //.......................................................................................................
      populate_jzr_mirror_lines: SQL`insert into jzr_mirror_lines ( rowid, dskey, line_nr, lcode, line, field_1, field_2, field_3, field_4 )
select
  't:mr:ln:R=' || row_number() over ()          as rowid,
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
  populate_meaning_mirror_triples = function() {
    var db, extract_atonal_zh_readings, fn, remove_pinyin_diacritics;
    db = get_db();
    // #.........................................................................................................
    // ### TAINT a convoluted way to get a file path ###
    // ### TAINT make an API call ###
    // dskey = 'dict:meanings'
    // for row from db.walk SQL"select * from jzr_datasources where dskey = $dskey;", { dskey, }
    //   meanings_path = row.path
    //   break
    // #.........................................................................................................
    // count = 0
    // for { lnr: line_nr, line, } from walk_lines_with_positions meanings_path
    //   debug 'Ωjzrsdb___6', line_nr, rpr line
    //   count++
    //   break if count > 10
    //.........................................................................................................
    remove_pinyin_diacritics = function(text) {
      return (text.normalize('NFKD')).replace(/\P{L}/gv, '');
    };
    //.........................................................................................................
    extract_atonal_zh_readings = function(entry) {
      var R, zh_reading;
      // py:zhù, zhe, zhāo, zháo, zhǔ, zī
      R = entry;
      R = entry.replace(/^py:/v, '');
      R = R.split(/,\s*/v);
      R = new Set((function() {
        var i, len, results;
        results = [];
        for (i = 0, len = R.length; i < len; i++) {
          zh_reading = R[i];
          results.push(remove_pinyin_diacritics(zh_reading));
        }
        return results;
      })());
      return [...R];
    };
    //.........................................................................................................
    fn = function() {
      var i, len, o, query, ref, row, row_count, rowid, s, v, zh_reading, zh_readings;
      row_count = 0;
      //.......................................................................................................
      query = SQL`select
    rowid,
    -- ref,
    field_2 as chr,
    field_3 as entry
  from jzr_mirror_lines
  where true
    and ( dskey = 'dict:meanings' )
    and ( field_1 is not null )
    and ( field_1 not regexp '^@glyphs' )
    and ( field_3 regexp '^py:' )
  order by field_3;`;
//.......................................................................................................
      for (row of this.walk(query)) {
        zh_readings = extract_atonal_zh_readings(row.entry);
        debug('Ωjzrsdb___7', {...row, zh_readings});
//.....................................................................................................
        for (i = 0, len = zh_readings.length; i < len; i++) {
          zh_reading = zh_readings[i];
          row_count++;
          rowid = `t:mr:3pl:R=${row_count}`;
          ref = row.rowid;
          s = row.chr;
          v = 'zh_reading';
          o = zh_reading;
          this.w.statements.insert_jzr_mirror_triple.run({rowid, ref, s, v, o});
        }
      }
      //.......................................................................................................
      return null;
    };
    fn.call(db);
    // debug 'Ωjzrsdb___8', Array.from 'zì'.normalize 'NFC'
    // debug 'Ωjzrsdb___9', Array.from 'zì'.normalize 'NFKC'
    // debug 'Ωjzrsdb__10', Array.from 'zì'.normalize 'NFD'
    // debug 'Ωjzrsdb__11', Array.from 'zì'.normalize 'NFKD'
    //.........................................................................................................
    return null;
  };

  //===========================================================================================================
  if (module === require.main) {
    (() => {
      populate_meaning_mirror_triples();
      // demo_source_identifiers()

      // debug 'Ωjzrsdb__12', db = new Bsql3 ':memory:'
      // help 'Ωjzrsdb__13', row for row from ( db.prepare SQL"select 45 * 88;" ).iterate()
      // help 'Ωjzrsdb__14', row for row from ( db.prepare SQL"select 'abc' like 'a%';" ).iterate()
      // help 'Ωjzrsdb__15', row for row from ( db.prepare SQL"select 'abc' regexp '^a';" ).iterate()
      return null;
    })();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLGVBQUEsRUFBQSxLQUFBLEVBQUEsS0FBQSxFQUFBLEdBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsR0FBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSx1QkFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsK0JBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLHlCQUFBLEVBQUEsSUFBQSxFQUFBLE9BQUEsRUFBQSxLQUFBOzs7RUFHQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixDQUFBLENBQUUsS0FBRixFQUNFLEtBREYsRUFFRSxJQUZGLEVBR0UsSUFIRixFQUlFLEtBSkYsRUFLRSxNQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxPQVJGLENBQUEsR0FRNEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFSLENBQW9CLG1CQUFwQixDQVI1Qjs7RUFTQSxDQUFBLENBQUUsR0FBRixFQUNFLE9BREYsRUFFRSxJQUZGLEVBR0UsS0FIRixFQUlFLEtBSkYsRUFLRSxJQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxHQVJGLEVBU0UsSUFURixFQVVFLE9BVkYsRUFXRSxHQVhGLENBQUEsR0FXNEIsR0FBRyxDQUFDLEdBWGhDLEVBYkE7Ozs7Ozs7O0VBK0JBLElBQUEsR0FBNEIsT0FBQSxDQUFRLFdBQVIsRUEvQjVCOzs7RUFpQ0EsS0FBQSxHQUE0QixPQUFBLENBQVEsZ0JBQVIsRUFq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S0FBQSw2Q0FBQTs7VUFDRSxTQUFBO1VBQ0EsS0FBQSxHQUFRLENBQUEsV0FBQSxDQUFBLENBQWMsU0FBZCxDQUFBO1VBQ1IsR0FBQSxHQUFRLEdBQUcsQ0FBQztVQUNaLENBQUEsR0FBUSxHQUFHLENBQUM7VUFDWixDQUFBLEdBQVE7VUFDUixDQUFBLEdBQVE7VUFDUixJQUFDLENBQUEsQ0FBQyxDQUFDLFVBQVUsQ0FBQyx3QkFBd0IsQ0FBQyxHQUF2QyxDQUEyQyxDQUFFLEtBQUYsRUFBUyxHQUFULEVBQWMsQ0FBZCxFQUFpQixDQUFqQixFQUFvQixDQUFwQixDQUEzQztRQVBGO01BSkYsQ0FoQko7O2FBNkJLO0lBOUJFO0lBK0JMLEVBQUUsQ0FBQyxJQUFILENBQVEsRUFBUixFQXhERjs7Ozs7O1dBOERHO0VBL0QrQixFQWhSbEM7OztFQW9WQSxJQUFHLE1BQUEsS0FBVSxPQUFPLENBQUMsSUFBckI7SUFBa0MsQ0FBQSxDQUFBLENBQUEsR0FBQTtNQUNoQywrQkFBQSxDQUFBLEVBQUY7Ozs7Ozs7YUFPRztJQVIrQixDQUFBLElBQWxDOztBQXBWQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCdcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5HVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xueyBhbGVydFxuICBkZWJ1Z1xuICBoZWxwXG4gIGluZm9cbiAgcGxhaW5cbiAgcHJhaXNlXG4gIHVyZ2VcbiAgd2FyblxuICB3aGlzcGVyIH0gICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ2ppenVyYS1zb3VyY2VzLWRiJ1xueyBycHJcbiAgaW5zcGVjdFxuICBlY2hvXG4gIHdoaXRlXG4gIGdyZWVuXG4gIGJsdWVcbiAgZ29sZFxuICBncmV5XG4gIHJlZFxuICBib2xkXG4gIHJldmVyc2VcbiAgbG9nICAgICB9ICAgICAgICAgICAgICAgPSBHVVkudHJtXG4jIHsgZiB9ICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvZWZmc3RyaW5nJ1xuIyB3cml0ZSAgICAgICAgICAgICAgICAgICAgID0gKCBwICkgLT4gcHJvY2Vzcy5zdGRvdXQud3JpdGUgcFxuIyB7IG5mYSB9ICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL25vcm1hbGl6ZS1mdW5jdGlvbi1hcmd1bWVudHMnXG4jIEdUTkcgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvZ3V5LXRlc3QtTkcnXG4jIHsgVGVzdCAgICAgICAgICAgICAgICAgIH0gPSBHVE5HXG4jIEZTICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOmZzJ1xuUEFUSCAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6cGF0aCdcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQnNxbDMgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2JldHRlci1zcWxpdGUzJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5TRk1PRFVMRVMgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2JyaWNhYnJhYy1zZm1vZHVsZXMnXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgRGJyaWMsXG4gIFNRTCwgICAgICAgICAgICAgICAgICAgICAgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2RicmljKClcbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyBKZXRzdHJlYW0sXG4gIEFzeW5jX2pldHN0cmVhbSwgICAgICAgICAgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2pldHN0cmVhbSgpXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucyB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZmFzdF9saW5lcmVhZGVyKClcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmRlbW9fc291cmNlX2lkZW50aWZpZXJzID0gLT5cbiAgeyBleHBhbmRfZGljdGlvbmFyeSwgICAgICB9ID0gU0ZNT0RVTEVTLnJlcXVpcmVfZGljdGlvbmFyeV90b29scygpXG4gIHsgZ2V0X2xvY2FsX2Rlc3RpbmF0aW9ucywgfSA9IFNGTU9EVUxFUy5yZXF1aXJlX2dldF9sb2NhbF9kZXN0aW5hdGlvbnMoKVxuICBmb3Iga2V5LCB2YWx1ZSBvZiBnZXRfbG9jYWxfZGVzdGluYXRpb25zKClcbiAgICBkZWJ1ZyAnzqlqenJzZGJfX18xJywga2V5LCB2YWx1ZVxuICAjIGNhbiBhcHBlbmQgbGluZSBudW1iZXJzIHRvIGZpbGVzIGFzIGluOlxuICAjICdkaWN0Om1lYW5pbmdzLjE6TD0xMzMzMidcbiAgIyAnZGljdDp1Y2QxNDAuMTp1aGRpZHg6TD0xMjM0J1xuICAjIHJvd2lkczogJ3Q6amZtOlI9MSdcbiAgIyBhcmVmOiBsYWJlbHMgdGhpcyBwcm94aW1hbCBwb2ludCBpbiB0aGUgZGF0YSBzZXQgYXMgYW4gb3JpZ2luXG4gICMgbXJlZjogaWRlbnRpZmllcyBib3RoIHRoZSBwcm94aW1hbCBhbmQgdGhlIGRpc3RhbCBlbmRcbiAgIyB6cmVmOiBpZGVudGlmaWVzIHRoZSBkaXN0YWwgc291cmNlIG9mIGEgcGllY2Ugb2YgZGF0YVxuICAjIHtcbiAgIyAgICdkaWN0Om1lYW5pbmdzJzogICAgICAgICAgJyRqenJkcy9tZWFuaW5nL21lYW5pbmdzLnR4dCdcbiAgIyAgICdkaWN0OnVjZDp2MTQuMDp1aGRpZHgnIDogJyRqenJkcy91bmljb2RlLm9yZy11Y2QtdjE0LjAvVW5paGFuX0RpY3Rpb25hcnlJbmRpY2VzLnR4dCdcbiAgIyAgIH1cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5nZXRfcGF0aHMgPSAtPlxuICBSICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgID0ge31cbiAgUi5iYXNlICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEgucmVzb2x2ZSBfX2Rpcm5hbWUsICcuLidcbiAgUi5kYiAgICAgICAgICAgICAgICAgICAgICAgICAgICA9IFBBVEguam9pbiBSLmJhc2UsICdqenIuZGInXG4gIFIuanpyZHMgICAgICAgICAgICAgICAgICAgICAgICAgPSBQQVRILmpvaW4gUi5iYXNlLCAnanpyZHMnXG4gIFJbICdkaWN0Om1lYW5pbmdzJyAgICAgICAgICBdICAgPSBQQVRILmpvaW4gUi5qenJkcywgJ21lYW5pbmcvbWVhbmluZ3MudHh0J1xuICBSWyAnZGljdDp1Y2Q6djE0LjA6dWhkaWR4JyAgXSAgID0gUEFUSC5qb2luIFIuanpyZHMsICd1bmljb2RlLm9yZy11Y2QtdjE0LjAvVW5paGFuX0RpY3Rpb25hcnlJbmRpY2VzLnR4dCdcbiAgcmV0dXJuIFJcblxuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5nZXRfZGIgPSAtPlxuICBwYXRocyA9IGdldF9wYXRocygpXG4gIHJldHVybiBKenJidmZzLm9wZW4gcGF0aHMuZGJcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmNsYXNzIEp6cmJ2ZnMgZXh0ZW5kcyBEYnJpY1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQGRiX2NsYXNzOiBCc3FsM1xuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQGJ1aWxkOiBbXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBqenJfZGF0YXNvdXJjZXMgKFxuICAgICAgICByb3dpZCB0ZXh0ICAgICAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBkc2tleSB0ZXh0ICAgICAgICB1bmlxdWUgIG5vdCBudWxsLFxuICAgICAgICBwYXRoICB0ZXh0ICAgICAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCByb3dpZCByZWdleHAgJ150OmRzOlI9XFxcXGQrJCcpKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGp6cl9taXJyb3JfbGNvZGVzIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgbGNvZGUgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgY29tbWVudCAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgIHByaW1hcnkga2V5ICggcm93aWQgKSxcbiAgICAgIGNoZWNrICggbGNvZGUgcmVnZXhwICdeW2EtekEtWl0rW2EtekEtWjAtOV0qJCcgKSxcbiAgICAgIGNoZWNrICggcm93aWQgPSAndDpsYzpWPScgfHwgbGNvZGUgKSApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX21pcnJvcl9saW5lcyAoXG4gICAgICAgIC0tICd0OmpmbTonXG4gICAgICAgIHJvd2lkICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwsXG4gICAgICAgIHJlZiAgICAgICB0ZXh0ICAgIHVuaXF1ZSAgbm90IG51bGwgZ2VuZXJhdGVkIGFsd2F5cyBhcyAoIGRza2V5IHx8ICc6TD0nIHx8IGxpbmVfbnIgKSB2aXJ0dWFsLFxuICAgICAgICBkc2tleSAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBsaW5lX25yICAgaW50ZWdlciAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBsY29kZSAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBsaW5lICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBmaWVsZF8xICAgdGV4dCAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICBmaWVsZF8yICAgdGV4dCAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICBmaWVsZF8zICAgdGV4dCAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgICBmaWVsZF80ICAgdGV4dCAgICAgICAgICAgICAgICBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCByb3dpZCByZWdleHAgJ150Om1yOmxuOlI9XFxcXGQrJCcpLFxuICAgICAgdW5pcXVlICggZHNrZXksIGxpbmVfbnIgKSxcbiAgICAgIGZvcmVpZ24ga2V5ICggbGNvZGUgKSByZWZlcmVuY2VzIGp6cl9taXJyb3JfbGNvZGVzICggbGNvZGUgKSApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUganpyX21pcnJvcl90cmlwbGVzIChcbiAgICAgICAgcm93aWQgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCxcbiAgICAgICAgcmVmICAgICAgIHRleHQgICAgICAgICAgICBub3QgbnVsbCxcbiAgICAgICAgLS0gcmVmICAgICAgIHRleHQgICAgdW5pcXVlICBub3QgbnVsbCBnZW5lcmF0ZWQgYWx3YXlzIGFzICggZHNrZXkgfHwgJzpMPScgfHwgbGluZV9uciApIHZpcnR1YWwsXG4gICAgICAgIC0tIGRza2V5ICAgICB0ZXh0ICAgICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIC0tIGxpbmVfbnIgICBpbnRlZ2VyICAgICAgICAgbm90IG51bGwsXG4gICAgICAgIC0tICMjIyBUQUlOVCB1c2UgcmVmcywgcm93aWRzIHRvIGlkZW50aWZ5IHN1YmplY3RzP1xuICAgICAgICBzICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICB2ICAgICAgICAgdGV4dCAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgICBvICAgICAgICAganNvbiAgICAgICAgICAgIG5vdCBudWxsLFxuICAgICAgcHJpbWFyeSBrZXkgKCByb3dpZCApLFxuICAgICAgY2hlY2sgKCByb3dpZCByZWdleHAgJ150Om1yOjNwbDpSPVxcXFxkKyQnICksXG4gICAgICB1bmlxdWUgKCByZWYsIHMsIHYsIG8gKSxcbiAgICAgIGZvcmVpZ24ga2V5ICggcmVmICkgcmVmZXJlbmNlcyBqenJfbWlycm9yX2xpbmVzICggcm93aWQgKVxuICAgICAgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyMjIGFnZ3JlZ2F0ZSB0YWJsZSBmb3IgYWxsIHJvd2lkcyBnb2VzIGhlcmUgIyMjXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBzdGF0ZW1lbnRzOlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX2RhdGFzb3VyY2U6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ganpyX2RhdGFzb3VyY2VzICggcm93aWQsIGRza2V5LCBwYXRoICkgdmFsdWVzICggJHJvd2lkLCAkZHNrZXksICRwYXRoIClcbiAgICAgICAgb24gY29uZmxpY3QgKCBkc2tleSApIGRvIHVwZGF0ZSBzZXQgcGF0aCA9ICRwYXRoO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfanpyX21pcnJvcl9sY29kZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX2xjb2RlcyAoIHJvd2lkLCBsY29kZSwgY29tbWVudCApIHZhbHVlcyAoICRyb3dpZCwgJGxjb2RlLCAkY29tbWVudCApXG4gICAgICAgIG9uIGNvbmZsaWN0ICggcm93aWQgKSBkbyB1cGRhdGUgc2V0IGxjb2RlID0gJGxjb2RlLCBjb21tZW50ID0gJGNvbW1lbnQ7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9qenJfbWlycm9yX3RyaXBsZTogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBqenJfbWlycm9yX3RyaXBsZXMgKCByb3dpZCwgcmVmLCBzLCB2LCBvICkgdmFsdWVzICggJHJvd2lkLCAkcmVmLCAkcywgJHYsICRvIClcbiAgICAgICAgb24gY29uZmxpY3QgKCByZWYsIHMsIHYsIG8gKSBkbyBub3RoaW5nO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9qenJfbWlycm9yX2xpbmVzOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIGp6cl9taXJyb3JfbGluZXMgKCByb3dpZCwgZHNrZXksIGxpbmVfbnIsIGxjb2RlLCBsaW5lLCBmaWVsZF8xLCBmaWVsZF8yLCBmaWVsZF8zLCBmaWVsZF80IClcbiAgICAgIHNlbGVjdFxuICAgICAgICAndDptcjpsbjpSPScgfHwgcm93X251bWJlcigpIG92ZXIgKCkgICAgICAgICAgYXMgcm93aWQsXG4gICAgICAgIC0tIGRzLmRza2V5IHx8ICc6TD0nIHx8IGZsLmxpbmVfbnIgICBhcyByb3dpZCxcbiAgICAgICAgZHMuZHNrZXkgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGRza2V5LFxuICAgICAgICBmbC5saW5lX25yICAgICAgICAgICAgICAgICAgICAgICAgYXMgbGluZV9ucixcbiAgICAgICAgZmwubGNvZGUgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGxjb2RlLFxuICAgICAgICBmbC5saW5lICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgbGluZSxcbiAgICAgICAgZmwuZmllbGRfMSAgICAgICAgICAgICAgICAgICAgICAgIGFzIGZpZWxkXzEsXG4gICAgICAgIGZsLmZpZWxkXzIgICAgICAgICAgICAgICAgICAgICAgICBhcyBmaWVsZF8yLFxuICAgICAgICBmbC5maWVsZF8zICAgICAgICAgICAgICAgICAgICAgICAgYXMgZmllbGRfMyxcbiAgICAgICAgZmwuZmllbGRfNCAgICAgICAgICAgICAgICAgICAgICAgIGFzIGZpZWxkXzRcbiAgICAgIGZyb20ganpyX2RhdGFzb3VyY2VzICAgICAgICBhcyBkc1xuICAgICAgam9pbiBmaWxlX2xpbmVzKCBkcy5wYXRoICkgIGFzIGZsXG4gICAgICB3aGVyZSB0cnVlXG4gICAgICBvbiBjb25mbGljdCAoIGRza2V5LCBsaW5lX25yICkgZG8gdXBkYXRlIHNldCBsaW5lID0gZXhjbHVkZWQubGluZTtcbiAgICAgIFwiXCJcIlxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQG9wZW46ICggUC4uLiApIC0+XG4gICAgIyMjIFRBSU5UIG5vdCBhIHZlcnkgbmljZSBzb2x1dGlvbiAjIyNcbiAgICAjIyMgVEFJTlQgbmVlZCBtb3JlIGNsYXJpdHkgYWJvdXQgd2hlbiBzdGF0ZW1lbnRzLCBidWlsZCwgaW5pdGlhbGl6ZS4uLiBpcyBwZXJmb3JtZWQgIyMjXG4gICAgUiA9IHN1cGVyIFAuLi5cbiAgICBpZiBSLmlzX2ZyZXNoXG4gICAgICBSLl9vbl9vcGVuX3BvcHVsYXRlX2p6cl9kYXRhc291cmNlcygpXG4gICAgICBSLl9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGNvZGVzKClcbiAgICAgIFIuX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9saW5lcygpXG4gICAgICBSLl9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfdHJpcGxlc19mb3JfbWVhbmluZ3MoKVxuICAgIGVsc2VcbiAgICAgIHdhcm4gJ86panpyc2RiX19fMicsIFwic2tpcHBlZCBkYXRhIGluc2VydGlvblwiXG4gICAgICBkZWJ1ZyAnzqlqenJzZGJfX18zJywgUi5pc19yZWFkeVxuICAgICAgZGVidWcgJ86panpyc2RiX19fNCcsIFIuaXNfZnJlc2hcbiAgICByZXR1cm4gUlxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX2RhdGFzb3VyY2VzOiAtPlxuICAgIHBhdGhzID0gZ2V0X3BhdGhzKClcbiAgICBkc2tleSA9ICdkaWN0Om1lYW5pbmdzJzsgICAgICAgICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTEnLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICBkc2tleSA9ICdkaWN0OnVjZDp2MTQuMDp1aGRpZHgnOyAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9kYXRhc291cmNlLnJ1biB7IHJvd2lkOiAndDpkczpSPTInLCBkc2tleSwgcGF0aDogcGF0aHNbIGRza2V5IF0sIH1cbiAgICA7bnVsbFxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgX29uX29wZW5fcG9wdWxhdGVfanpyX21pcnJvcl9sY29kZXM6IC0+XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0OmxjOlY9QicsIGxjb2RlOiAnQicsIGNvbW1lbnQ6ICdibGFuayBsaW5lJywgICB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0OmxjOlY9QycsIGxjb2RlOiAnQycsIGNvbW1lbnQ6ICdjb21tZW50IGxpbmUnLCB9XG4gICAgQHN0YXRlbWVudHMuaW5zZXJ0X2p6cl9taXJyb3JfbGNvZGUucnVuIHsgcm93aWQ6ICd0OmxjOlY9RCcsIGxjb2RlOiAnRCcsIGNvbW1lbnQ6ICdkYXRhIGxpbmUnLCAgICB9XG4gICAgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIF9vbl9vcGVuX3BvcHVsYXRlX2p6cl9taXJyb3JfbGluZXM6IC0+XG4gICAgQHN0YXRlbWVudHMucG9wdWxhdGVfanpyX21pcnJvcl9saW5lcy5ydW4oKVxuICAgIDtudWxsXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBfb25fb3Blbl9wb3B1bGF0ZV9qenJfbWlycm9yX3RyaXBsZXNfZm9yX21lYW5pbmdzOiAtPlxuICAgICMgO251bGxcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXIoKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQGNyZWF0ZV9mdW5jdGlvblxuICAgICAgbmFtZTogICAgICAgICAgICdyZWdleHAnXG4gICAgICBkZXRlcm1pbmlzdGljOiAgdHJ1ZVxuICAgICAgY2FsbDogKCBwYXR0ZXJuLCB0ZXh0ICkgLT4gaWYgKCAoIG5ldyBSZWdFeHAgcGF0dGVybiwgJ3YnICkudGVzdCB0ZXh0ICkgdGhlbiAxIGVsc2UgMFxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBAY3JlYXRlX3RhYmxlX2Z1bmN0aW9uXG4gICAgICBuYW1lOiAgICAgICAgICAgJ3NwbGl0X3dvcmRzJ1xuICAgICAgY29sdW1uczogICAgICAgIFsgJ2tleXdvcmQnLCBdXG4gICAgICBwYXJhbWV0ZXJzOiAgICAgWyAnbGluZScsIF1cbiAgICAgIHJvd3M6ICggbGluZSApIC0+XG4gICAgICAgIGtleXdvcmRzID0gbGluZS5zcGxpdCAvKD86XFxwe1p9Kyl8KCg/OlxccHtTY3JpcHQ9SGFufSl8KD86XFxwe0x9Kyl8KD86XFxwe059Kyl8KD86XFxwe1N9KykpL3ZcbiAgICAgICAgIyBkZWJ1ZyAnzqlqenJzZGJfX181JywgbGluZV9uciwgcnByIGtleXdvcmRzXG4gICAgICAgIGZvciBrZXl3b3JkIGluIGtleXdvcmRzXG4gICAgICAgICAgY29udGludWUgdW5sZXNzIGtleXdvcmQ/XG4gICAgICAgICAgY29udGludWUgaWYga2V5d29yZCBpcyAnJ1xuICAgICAgICAgIHlpZWxkIHsga2V5d29yZCwgfVxuICAgICAgICA7bnVsbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQGNyZWF0ZV90YWJsZV9mdW5jdGlvblxuICAgICAgbmFtZTogICAgICAgICAnZmlsZV9saW5lcydcbiAgICAgIGNvbHVtbnM6ICAgICAgWyAnbGluZV9ucicsICdsY29kZScsICdsaW5lJywgJ2ZpZWxkXzEnLCAnZmllbGRfMicsICdmaWVsZF8zJywgJ2ZpZWxkXzQnLCBdXG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ3BhdGgnLCBdXG4gICAgICByb3dzOiAoIHBhdGggKSAtPlxuICAgICAgICBmb3IgeyBsbnI6IGxpbmVfbnIsIGxpbmUsIGVvbCwgfSBmcm9tIHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgcGF0aFxuICAgICAgICAgIGZpZWxkXzEgPSBmaWVsZF8yID0gZmllbGRfMyA9IGZpZWxkXzQgPSBudWxsXG4gICAgICAgICAgc3dpdGNoIHRydWVcbiAgICAgICAgICAgIHdoZW4gL15cXHMqJC92LnRlc3QgbGluZVxuICAgICAgICAgICAgICBsY29kZSA9ICdCJ1xuICAgICAgICAgICAgd2hlbiAvXlxccyojL3YudGVzdCBsaW5lXG4gICAgICAgICAgICAgIGxjb2RlID0gJ0MnXG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICAgIGxjb2RlID0gJ0QnXG4gICAgICAgICAgICAgIFsgZmllbGRfMSwgZmllbGRfMiwgZmllbGRfMywgZmllbGRfNCwgXSA9IGxpbmUuc3BsaXQgJ1xcdCdcbiAgICAgICAgICAgICAgZmllbGRfMSA/PSBudWxsXG4gICAgICAgICAgICAgIGZpZWxkXzIgPz0gbnVsbFxuICAgICAgICAgICAgICBmaWVsZF8zID89IG51bGxcbiAgICAgICAgICAgICAgZmllbGRfNCA/PSBudWxsXG4gICAgICAgICAgeWllbGQgeyBsaW5lX25yLCBsY29kZSwgbGluZSwgZmllbGRfMSwgZmllbGRfMiwgZmllbGRfMywgZmllbGRfNCwgfVxuICAgICAgICA7bnVsbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5wb3B1bGF0ZV9tZWFuaW5nX21pcnJvcl90cmlwbGVzID0gLT5cbiAgZGIgPSBnZXRfZGIoKVxuICAjICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyAjIyMgVEFJTlQgYSBjb252b2x1dGVkIHdheSB0byBnZXQgYSBmaWxlIHBhdGggIyMjXG4gICMgIyMjIFRBSU5UIG1ha2UgYW4gQVBJIGNhbGwgIyMjXG4gICMgZHNrZXkgPSAnZGljdDptZWFuaW5ncydcbiAgIyBmb3Igcm93IGZyb20gZGIud2FsayBTUUxcInNlbGVjdCAqIGZyb20ganpyX2RhdGFzb3VyY2VzIHdoZXJlIGRza2V5ID0gJGRza2V5O1wiLCB7IGRza2V5LCB9XG4gICMgICBtZWFuaW5nc19wYXRoID0gcm93LnBhdGhcbiAgIyAgIGJyZWFrXG4gICMgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjIGNvdW50ID0gMFxuICAjIGZvciB7IGxucjogbGluZV9uciwgbGluZSwgfSBmcm9tIHdhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgbWVhbmluZ3NfcGF0aFxuICAjICAgZGVidWcgJ86panpyc2RiX19fNicsIGxpbmVfbnIsIHJwciBsaW5lXG4gICMgICBjb3VudCsrXG4gICMgICBicmVhayBpZiBjb3VudCA+IDEwXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgcmVtb3ZlX3Bpbnlpbl9kaWFjcml0aWNzID0gKCB0ZXh0ICkgLT4gKCB0ZXh0Lm5vcm1hbGl6ZSAnTkZLRCcgKS5yZXBsYWNlIC9cXFB7TH0vZ3YsICcnXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZXh0cmFjdF9hdG9uYWxfemhfcmVhZGluZ3MgPSAoIGVudHJ5ICkgLT5cbiAgICAjIHB5Onpow7ksIHpoZSwgemjEgW8sIHpow6FvLCB6aMeULCB6xKtcbiAgICBSID0gZW50cnlcbiAgICBSID0gZW50cnkucmVwbGFjZSAvXnB5Oi92LCAnJ1xuICAgIFIgPSBSLnNwbGl0IC8sXFxzKi92XG4gICAgUiA9IG5ldyBTZXQgKCByZW1vdmVfcGlueWluX2RpYWNyaXRpY3MgemhfcmVhZGluZyBmb3IgemhfcmVhZGluZyBpbiBSIClcbiAgICByZXR1cm4gWyBSLi4uLCBdXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZm4gPSAtPlxuICAgIHJvd19jb3VudCA9IDBcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHF1ZXJ5ID0gU1FMXCJcIlwiXG4gICAgICBzZWxlY3RcbiAgICAgICAgICByb3dpZCxcbiAgICAgICAgICAtLSByZWYsXG4gICAgICAgICAgZmllbGRfMiBhcyBjaHIsXG4gICAgICAgICAgZmllbGRfMyBhcyBlbnRyeVxuICAgICAgICBmcm9tIGp6cl9taXJyb3JfbGluZXNcbiAgICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICAgIGFuZCAoIGRza2V5ID0gJ2RpY3Q6bWVhbmluZ3MnIClcbiAgICAgICAgICBhbmQgKCBmaWVsZF8xIGlzIG5vdCBudWxsIClcbiAgICAgICAgICBhbmQgKCBmaWVsZF8xIG5vdCByZWdleHAgJ15AZ2x5cGhzJyApXG4gICAgICAgICAgYW5kICggZmllbGRfMyByZWdleHAgJ15weTonIClcbiAgICAgICAgb3JkZXIgYnkgZmllbGRfMztcIlwiXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGZvciByb3cgZnJvbSBAd2FsayBxdWVyeVxuICAgICAgemhfcmVhZGluZ3MgPSBleHRyYWN0X2F0b25hbF96aF9yZWFkaW5ncyByb3cuZW50cnlcbiAgICAgIGRlYnVnICfOqWp6cnNkYl9fXzcnLCB7IHJvdy4uLiwgemhfcmVhZGluZ3MsIH1cbiAgICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICAgZm9yIHpoX3JlYWRpbmcgaW4gemhfcmVhZGluZ3NcbiAgICAgICAgcm93X2NvdW50KytcbiAgICAgICAgcm93aWQgPSBcInQ6bXI6M3BsOlI9I3tyb3dfY291bnR9XCJcbiAgICAgICAgcmVmICAgPSByb3cucm93aWRcbiAgICAgICAgcyAgICAgPSByb3cuY2hyXG4gICAgICAgIHYgICAgID0gJ3poX3JlYWRpbmcnXG4gICAgICAgIG8gICAgID0gemhfcmVhZGluZ1xuICAgICAgICBAdy5zdGF0ZW1lbnRzLmluc2VydF9qenJfbWlycm9yX3RyaXBsZS5ydW4geyByb3dpZCwgcmVmLCBzLCB2LCBvLCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICA7bnVsbFxuICBmbi5jYWxsIGRiXG4gICMgZGVidWcgJ86panpyc2RiX19fOCcsIEFycmF5LmZyb20gJ3rDrCcubm9ybWFsaXplICdORkMnXG4gICMgZGVidWcgJ86panpyc2RiX19fOScsIEFycmF5LmZyb20gJ3rDrCcubm9ybWFsaXplICdORktDJ1xuICAjIGRlYnVnICfOqWp6cnNkYl9fMTAnLCBBcnJheS5mcm9tICd6w6wnLm5vcm1hbGl6ZSAnTkZEJ1xuICAjIGRlYnVnICfOqWp6cnNkYl9fMTEnLCBBcnJheS5mcm9tICd6w6wnLm5vcm1hbGl6ZSAnTkZLRCdcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICA7bnVsbFxuXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5pZiBtb2R1bGUgaXMgcmVxdWlyZS5tYWluIHRoZW4gZG8gPT5cbiAgcG9wdWxhdGVfbWVhbmluZ19taXJyb3JfdHJpcGxlcygpXG4gICMgZGVtb19zb3VyY2VfaWRlbnRpZmllcnMoKVxuXG4gICMgZGVidWcgJ86panpyc2RiX18xMicsIGRiID0gbmV3IEJzcWwzICc6bWVtb3J5OidcbiAgIyBoZWxwICfOqWp6cnNkYl9fMTMnLCByb3cgZm9yIHJvdyBmcm9tICggZGIucHJlcGFyZSBTUUxcInNlbGVjdCA0NSAqIDg4O1wiICkuaXRlcmF0ZSgpXG4gICMgaGVscCAnzqlqenJzZGJfXzE0Jywgcm93IGZvciByb3cgZnJvbSAoIGRiLnByZXBhcmUgU1FMXCJzZWxlY3QgJ2FiYycgbGlrZSAnYSUnO1wiICkuaXRlcmF0ZSgpXG4gICMgaGVscCAnzqlqenJzZGJfXzE1Jywgcm93IGZvciByb3cgZnJvbSAoIGRiLnByZXBhcmUgU1FMXCJzZWxlY3QgJ2FiYycgcmVnZXhwICdeYSc7XCIgKS5pdGVyYXRlKClcbiAgO251bGxcblxuIl19
