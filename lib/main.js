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
// debug 'Ωjzrsdb___1', line_nr, rpr keywords
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
    debug('Ωjzrsdb___2', phrases.teardown());
    debug('Ωjzrsdb___3', phrases.rebuild());
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
    debug('Ωjzrsdb___4', "populate_file_mirror: ", phrases.statements.populate_file_mirror.run());
    debug('Ωjzrsdb___5', "populate_keywords:    ", phrases.statements.populate_keywords.run());
    debug('Ωjzrsdb___6', "count_datasources:    ", phrases.statements.count_datasources.get());
    debug('Ωjzrsdb___7', "count_mirror_lines:   ", phrases.statements.count_mirror_lines.get());
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
    var bvfs, db_path, file_id_and_size_from_path, get_first_row, i, insert_line_byte_offset, len, path, paths, populate_line_byte_offsets;
    db_path = PATH.resolve(__dirname, '../../bvfs/bvfs.db');
    bvfs = Dbric.open(db_path);
    //.........................................................................................................
    file_id_and_size_from_path = bvfs.prepare(SQL`select
    p.file_id as file_id,
    m.size    as size
  from bb_paths as p
  join metadata as m on ( p.file_id = m.id )
  where p.path = $path;`);
    //.........................................................................................................
    insert_line_byte_offset = bvfs.prepare(SQL`insert into bb_line_byte_offsets ( file_id,   line_nr,  block_num,  start,  stop )
  values                         ( $file_id, $line_nr, $block_num, $start, $stop );`);
    //.........................................................................................................
    /* NOTE must know byte size of file */
    /* TAINT should become `Dbric::get_first_row()` */
    get_first_row = function(iterator) {
      var R, done, extra, throwaway;
      R = null;
      ({
        value: R,
        done
      } = iterator.next());
      if (done || (R == null)) {
        throw new Error("Ωdbric___8 expected exactly one row, got none");
      }
      extra = iterator.next();
      throwaway = [...iterator];
      if ((!/* NOTE alway exhaust iterator to keep it from blocking DB */extra.done) || (extra.value != null)) {
        throw new Error(`Ωdbric___9 expected exactly one row, got more than one: ${rpr(extra)}`);
      }
      return R;
    };
    //.........................................................................................................
    populate_line_byte_offsets = function({path}) {
      var buffer, cr_cid, current_byte_count, d, data_length, delta, entry_idx, file_finished, file_id, find_linebreaks, last_entry_idx, lf_cid, linebreak_idxs, linepart_length, nl_idx, nl_length, read_blobs_for_file_id, remaining_bytes, results, size, text;
      ({file_id, size} = get_first_row(file_id_and_size_from_path.iterate({path})));
      urge('Ωjzrsdb__10', {file_id, size, path});
      if (size === 0) {
        //.........................................................................................................
        /* NOTE Entries in table `bb_line_byte_offsets` require a foreign key to some data block, but empty
           files do not get a data block. As a tentative solution, we do not represent empty files in
           `bb_line_byte_offsets` at all, leaving it up to consumers (e.g. the view containing file lines)
           to deal with the situation. */
        debug('Ωjzrsdb__11', `file ${path} is empty`);
      }
      if (size === 0) {
        return 0;
      }
      //.........................................................................................................
      read_blobs_for_file_id = bvfs.prepare(SQL`select
  block_num,
  data
from data
where file_id = $file_id
order by block_num;`);
      //.........................................................................................................
      lf_cid = '\n'.codePointAt(0);
      cr_cid = '\r'.codePointAt(0);
      find_linebreaks = function(values) {
        /* TAINT use Array::find() to iterate over all values in array and satisfy compound criterion" */
        var R, idx, length, start;
        R = [];
        start = 0;
        length = 1; // could be two for CRLF
        while (true) {
          if ((idx = values.indexOf(lf_cid, start)) < 0) {
            /* NOTE This test could be used once on each buffer; once it returns `true` a more complicated
            algorithm to detect `/\r\n|\r|\n/` should be used for the rest of the file:

              if use_crlf_algo = values.includes cr_cid
            */
            break;
          }
          R.push([idx, length]);
          start = idx + 1;
        }
        return R;
      };
      //.........................................................................................................
      current_byte_count = 0;
      file_finished = false;
      results = [];
      for (d of read_blobs_for_file_id.iterate({file_id})) {
        buffer = Buffer.from(d.data);
        text = (buffer.toString('utf-8')).slice(0, 101);
        // debug 'Ωjzrsdb__12', d.data
        debug('Ωjzrsdb__13', 'file', 'block', d.block_num, rpr(text));
        linebreak_idxs = find_linebreaks(d.data);
        data_length = d.data.length;
        debug('Ωjzrsdb__14', linebreak_idxs);
        if (linebreak_idxs.length === 0) {
          /* TAINT deal with no line breaks */
          continue;
        }
        last_entry_idx = linebreak_idxs.length - 1;
        results.push((function() {
          var i, len, results1;
          results1 = [];
          for (entry_idx = i = 0, len = linebreak_idxs.length; i < len; entry_idx = ++i) {
            [nl_idx, nl_length] = linebreak_idxs[entry_idx];
            if (entry_idx < last_entry_idx) {
              linepart_length = linebreak_idxs[entry_idx + 1][0] - nl_idx;
            } else {
              delta = last_entry_idx - nl_idx;
              if ((remaining_bytes = size - current_byte_count) < delta) {
                linepart_length = remaining_bytes;
                file_finished = true;
              } else {
                linepart_length = delta;
              }
            }
            results1.push(current_byte_count += linepart_length);
          }
          return results1;
        })());
      }
      return results;
    };
    //.........................................................................................................
    paths = ['/〇一二三四五六七八九.txt', '/nulls.txt', '/empty.txt'];
    for (i = 0, len = paths.length; i < len; i++) {
      path = paths[i];
      populate_line_byte_offsets({path});
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
      debug('Ωjzrsdb__15', d);
    }
    for (d of walk_lines_with_positions(path, {
      chunk_size: 10
    })) {
      debug('Ωjzrsdb__16', d);
    }
    return null;
  };

  //===========================================================================================================
  if (module === require.main) {
    (() => {
      // materialized_file_mirror()
      write_line_data_to_sqlitefs();
      // demo_read_lines_from_buffers()
      return null;
    })();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsYUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsNEJBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSx3QkFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLDJCQUFBOzs7RUFHQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixDQUFBLENBQUUsS0FBRixFQUNFLEtBREYsRUFFRSxJQUZGLEVBR0UsSUFIRixFQUlFLEtBSkYsRUFLRSxNQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxPQVJGLENBQUEsR0FRNEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFSLENBQW9CLG1CQUFwQixDQVI1Qjs7RUFTQSxDQUFBLENBQUUsR0FBRixFQUNFLE9BREYsRUFFRSxJQUZGLEVBR0UsS0FIRixFQUlFLEtBSkYsRUFLRSxJQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxHQVJGLEVBU0UsSUFURixFQVVFLE9BVkYsRUFXRSxHQVhGLENBQUEsR0FXNEIsR0FBRyxDQUFDLEdBWGhDLEVBYkE7Ozs7Ozs7RUE4QkEsU0FBQSxHQUE0QixPQUFBLENBQVEsMkNBQVIsRUE5QjVCOzs7RUFnQ0EsSUFBQSxHQUE0QixPQUFBLENBQVEsV0FBUixFQWhDNUI7OztFQWtDQSxDQUFBLENBQUUsS0FBRixFQUNF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OztNQUFBO01BQ0UsS0FBQSxDQUFNLGFBQU4sRUFBcUIsQ0FBckI7SUFERjtXQUVDO0VBUjRCLEVBL1MvQjs7O0VBMFRBLElBQUcsTUFBQSxLQUFVLE9BQU8sQ0FBQyxJQUFyQjtJQUFrQyxDQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUE7O01BRWhDLDJCQUFBLENBQUEsRUFERjs7YUFHRztJQUorQixDQUFBLElBQWxDOztBQTFUQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCdcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5HVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xueyBhbGVydFxuICBkZWJ1Z1xuICBoZWxwXG4gIGluZm9cbiAgcGxhaW5cbiAgcHJhaXNlXG4gIHVyZ2VcbiAgd2FyblxuICB3aGlzcGVyIH0gICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ2ppenVyYS1zb3VyY2VzLWRiJ1xueyBycHJcbiAgaW5zcGVjdFxuICBlY2hvXG4gIHdoaXRlXG4gIGdyZWVuXG4gIGJsdWVcbiAgZ29sZFxuICBncmV5XG4gIHJlZFxuICBib2xkXG4gIHJldmVyc2VcbiAgbG9nICAgICB9ICAgICAgICAgICAgICAgPSBHVVkudHJtXG4jIHsgZiB9ICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvZWZmc3RyaW5nJ1xuIyB3cml0ZSAgICAgICAgICAgICAgICAgICAgID0gKCBwICkgLT4gcHJvY2Vzcy5zdGRvdXQud3JpdGUgcFxuIyB7IG5mYSB9ICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL25vcm1hbGl6ZS1mdW5jdGlvbi1hcmd1bWVudHMnXG4jIEdUTkcgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuLi8uLi9oZW5naXN0LU5HL2FwcHMvZ3V5LXRlc3QtTkcnXG4jIHsgVGVzdCAgICAgICAgICAgICAgICAgIH0gPSBHVE5HXG5TRk1PRFVMRVMgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2JyaWNhYnJhYy1zZm1vZHVsZXMnXG4jIEZTICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOmZzJ1xuUEFUSCAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6cGF0aCdcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxueyBEYnJpYyxcbiAgU1FMLFxuICBpbnRlcm5hbHMsICAgICAgICAgICAgICAgIH0gPSBTRk1PRFVMRVMudW5zdGFibGUucmVxdWlyZV9kYnJpYygpXG5Cc3FsMyAgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2JldHRlci1zcWxpdGUzJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5jbGFzcyBEYnJpY19waHJhc2VzIGV4dGVuZHMgRGJyaWNcbiAgQGRiX2NsYXNzOiBCc3FsM1xuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBidWlsZDogW1xuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGRhdGFzb3VyY2VzIChcbiAgICAgICAgZHNrZXkgdGV4dCB1bmlxdWUgbm90IG51bGwgcHJpbWFyeSBrZXksXG4gICAgICAgIHBhdGggdGV4dCBub3QgbnVsbCApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUgbWlycm9yIChcbiAgICAgICAgZHNrZXkgICB0ZXh0ICAgIG5vdCBudWxsLFxuICAgICAgICBsaW5lX25yIGludGVnZXIgbm90IG51bGwsXG4gICAgICAgIGxpbmUgICAgdGV4dCAgICBub3QgbnVsbCxcbiAgICAgIGZvcmVpZ24ga2V5ICggZHNrZXkgKSByZWZlcmVuY2VzIGRhdGFzb3VyY2VzICggZHNrZXkgKSxcbiAgICAgIHByaW1hcnkga2V5ICggZHNrZXksIGxpbmVfbnIgKSApO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBTUUxcIlwiXCJjcmVhdGUgdGFibGUga2V5d29yZHMgKFxuICAgICAgICBkc2tleSAgIHRleHQgICAgbm90IG51bGwsXG4gICAgICAgIGxpbmVfbnIgaW50ZWdlciBub3QgbnVsbCxcbiAgICAgICAga2V5d29yZCB0ZXh0ICAgIG5vdCBudWxsLFxuICAgICAgZm9yZWlnbiBrZXkgKCBkc2tleSApIHJlZmVyZW5jZXMgZGF0YXNvdXJjZXMgKCBkc2tleSApLFxuICAgICAgcHJpbWFyeSBrZXkgKCBkc2tleSwgbGluZV9uciwga2V5d29yZCApICk7XCJcIlwiXG4gICAgXVxuXG4gICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgQHN0YXRlbWVudHM6XG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9kYXRhc291cmNlOiBTUUxcIlwiXCJpbnNlcnQgaW50byBkYXRhc291cmNlcyAoIGRza2V5LCBwYXRoICkgdmFsdWVzICggJGRza2V5LCAkcGF0aCApXG4gICAgICBvbiBjb25mbGljdCAoIGRza2V5ICkgZG8gdXBkYXRlIHNldCBwYXRoID0gJHBhdGg7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGluc2VydF9rZXl3b3JkOiBTUUxcIlwiXCJpbnNlcnQgaW50byBrZXl3b3JkcyAoIGRza2V5LCBsaW5lX25yLCBrZXl3b3JkICkgdmFsdWVzICggJGRza2V5LCAkbGluZV9uciwgJGtleXdvcmQgKVxuICAgICAgb24gY29uZmxpY3QgKCBkc2tleSwgbGluZV9uciwga2V5d29yZCApIGRvIG5vdGhpbmc7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHNlbGVjdF9mcm9tX2RhdGFzb3VyY2VzOiBTUUxcIlwiXCJzZWxlY3QgKiBmcm9tIGRhdGFzb3VyY2VzIG9yZGVyIGJ5IGRza2V5O1wiXCJcIlxuICAgIHNlbGVjdF9mcm9tX21pcnJvcjogICAgICBTUUxcIlwiXCJzZWxlY3QgKiBmcm9tIG1pcnJvciBvcmRlciBieSBkc2tleSwgbGluZV9ucjtcIlwiXCJcbiAgICBjb3VudF9kYXRhc291cmNlczogICAgICAgU1FMXCJcIlwic2VsZWN0IGNvdW50KCopIGFzIGRhdGFzb3VyY2VfY291bnQgIGZyb20gZGF0YXNvdXJjZXM7XCJcIlwiXG4gICAgY291bnRfbWlycm9yX2xpbmVzOiAgICAgIFNRTFwiXCJcInNlbGVjdCBjb3VudCgqKSBhcyBtaXJyb3JfbGluZV9jb3VudCBmcm9tIG1pcnJvcjtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc2VsZWN0X2Zyb21fa2V5d29yZHM6IFNRTFwiXCJcInNlbGVjdCAqIGZyb20ga2V5d29yZHMgb3JkZXIgYnkga2V5d29yZCwgZHNrZXksIGxpbmVfbnI7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGxvY2F0aW9uc19mcm9tX2tleXdvcmQ6IFNRTFwiXCJcInNlbGVjdCAqIGZyb20ga2V5d29yZHNcbiAgICAgIHdoZXJlIGtleXdvcmQgPSAka2V5d29yZFxuICAgICAgb3JkZXIgYnkga2V5d29yZCwgZHNrZXksIGxpbmVfbnI7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGxpbmVzX2Zyb21fa2V5d29yZDogU1FMXCJcIlwic2VsZWN0XG4gICAgICAgIGt3LmRza2V5ICAgIGFzIGRza2V5LFxuICAgICAgICBrdy5saW5lX25yICBhcyBsaW5lX25yLFxuICAgICAgICBrdy5rZXl3b3JkICBhcyBrZXl3b3JkLFxuICAgICAgICBtaS5saW5lICAgICBhcyBsaW5lXG4gICAgICBmcm9tIGtleXdvcmRzIGFzIGt3XG4gICAgICBqb2luIG1pcnJvciAgIGFzIG1pIHVzaW5nICggZHNrZXksIGxpbmVfbnIgKVxuICAgICAgd2hlcmUga2V5d29yZCA9ICRrZXl3b3JkXG4gICAgICBvcmRlciBieSBrZXl3b3JkLCBkc2tleSwgbGluZV9ucjtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgc2VsZWN0X2Zyb21fbWlycm9yOiBTUUxcIlwiXCJzZWxlY3QgKiBmcm9tIG1pcnJvciBvcmRlciBieSBkc2tleTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcG9wdWxhdGVfZmlsZV9taXJyb3I6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8gbWlycm9yICggZHNrZXksIGxpbmVfbnIsIGxpbmUgKVxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICBkcy5kc2tleSAgICBhcyBkc2tleSxcbiAgICAgICAgICBmbC5saW5lX25yICBhcyBsaW5lX25yLFxuICAgICAgICAgIGZsLmxpbmUgICAgIGFzIGxpbmVcbiAgICAgICAgZnJvbSBkYXRhc291cmNlcyAgICAgICAgYXMgZHNcbiAgICAgICAgbGVmdCBqb2luIG1pcnJvciAgICAgICAgYXMgbWkgdXNpbmcgKCBkc2tleSApLFxuICAgICAgICBmaWxlX2xpbmVzKCBkcy5wYXRoICkgICBhcyBmbFxuICAgICAgICB3aGVyZSB0cnVlIC0tIHdoZXJlIGNsYXVzZSBqdXN0IGEgc3ludGFjdGljIGd1YXJkIGFzIHBlciBodHRwczovL3NxbGl0ZS5vcmcvbGFuZ191cHNlcnQuaHRtbFxuICAgICAgICBvbiBjb25mbGljdCBkbyB1cGRhdGUgc2V0IGxpbmUgPSBleGNsdWRlZC5saW5lO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBwb3B1bGF0ZV9rZXl3b3JkczogU1FMXCJcIlwiXG4gICAgICBpbnNlcnQgaW50byBrZXl3b3JkcyAoIGRza2V5LCBsaW5lX25yLCBrZXl3b3JkIClcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgZHMuZHNrZXkgICAgYXMgZHNrZXksXG4gICAgICAgICAgbWkubGluZV9uciAgYXMgbGluZV9ucixcbiAgICAgICAgICBzdy5rZXl3b3JkICBhcyBrZXl3b3JkXG4gICAgICAgIGZyb20gZGF0YXNvdXJjZXMgICAgICAgIGFzIGRzXG4gICAgICAgIGpvaW4gbWlycm9yICAgICAgICAgICAgIGFzIG1pIHVzaW5nICggZHNrZXkgKSxcbiAgICAgICAgc3BsaXRfd29yZHMoIG1pLmxpbmUgKSAgYXMgc3dcbiAgICAgICAgd2hlcmUgdHJ1ZSAtLSB3aGVyZSBjbGF1c2UganVzdCBhIHN5bnRhY3RpYyBndWFyZCBhcyBwZXIgaHR0cHM6Ly9zcWxpdGUub3JnL2xhbmdfdXBzZXJ0Lmh0bWxcbiAgICAgICAgb24gY29uZmxpY3QgZG8gbm90aGluZztcIlwiXCJcblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIGluaXRpYWxpemU6IC0+XG4gICAgc3VwZXIoKVxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgQGNyZWF0ZV90YWJsZV9mdW5jdGlvblxuICAgICAgbmFtZTogICAgICAgICAgICdzcGxpdF93b3JkcydcbiAgICAgIGNvbHVtbnM6ICAgICAgICBbICdrZXl3b3JkJywgXVxuICAgICAgcGFyYW1ldGVyczogICAgIFsgJ2xpbmUnLCBdXG4gICAgICByb3dzOiAoIGxpbmUgKSAtPlxuICAgICAgICBrZXl3b3JkcyA9IGxpbmUuc3BsaXQgLyg/OlxccHtafSspfCgoPzpcXHB7U2NyaXB0PUhhbn0pfCg/OlxccHtMfSspfCg/OlxccHtOfSspfCg/OlxccHtTfSspKS92XG4gICAgICAgICMgZGVidWcgJ86panpyc2RiX19fMScsIGxpbmVfbnIsIHJwciBrZXl3b3Jkc1xuICAgICAgICBmb3Iga2V5d29yZCBpbiBrZXl3b3Jkc1xuICAgICAgICAgIGNvbnRpbnVlIHVubGVzcyBrZXl3b3JkP1xuICAgICAgICAgIGNvbnRpbnVlIGlmIGtleXdvcmQgaXMgJydcbiAgICAgICAgICB5aWVsZCB7IGtleXdvcmQsIH1cbiAgICAgICAgO251bGxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIEBjcmVhdGVfdGFibGVfZnVuY3Rpb25cbiAgICAgIG5hbWU6ICAgICAgICAgJ2ZpbGVfbGluZXMnXG4gICAgICBjb2x1bW5zOiAgICAgIFsgJ2xpbmVfbnInLCAnbGluZScsIF1cbiAgICAgIHBhcmFtZXRlcnM6ICAgWyAncGF0aCcsIF1cbiAgICAgIHJvd3M6ICggcGF0aCApIC0+XG4gICAgICAgIGZvciB7IGxucjogbGluZV9uciwgbGluZSwgZW9sLCB9IGZyb20gR1VZLmZzLndhbGtfbGluZXNfd2l0aF9wb3NpdGlvbnMgcGF0aFxuICAgICAgICAgIHlpZWxkIHsgbGluZV9uciwgbGluZSwgfVxuICAgICAgICA7bnVsbFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgO251bGxcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5tYXRlcmlhbGl6ZWRfZmlsZV9taXJyb3IgPSAtPlxuICBkYl9wYXRoICAgPSAnL2Rldi9zaG0vYnJpY2FicmFjLnNxbGl0ZSdcbiAgcGhyYXNlcyAgID0gRGJyaWNfcGhyYXNlcy5vcGVuIGRiX3BhdGhcbiAgZGVidWcgJ86panpyc2RiX19fMicsIHBocmFzZXMudGVhcmRvd24oKVxuICBkZWJ1ZyAnzqlqenJzZGJfX18zJywgcGhyYXNlcy5yZWJ1aWxkKClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBkbyA9PlxuICAgIGRza2V5ID0gJ2h1bWR1bSdcbiAgICBwYXRoICA9IFBBVEgucmVzb2x2ZSBfX2Rpcm5hbWUsICcuLi8uLi9oZW5naXN0LU5HL2Fzc2V0cy9icmljYWJyYWMvaHVtcHR5LWR1bXB0eS5tZCdcbiAgICBwaHJhc2VzLnN0YXRlbWVudHMuaW5zZXJ0X2RhdGFzb3VyY2UucnVuIHsgZHNrZXksIHBhdGggfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGRvID0+XG4gICAgZHNrZXkgPSAnbW5nJ1xuICAgIHBhdGggID0gUEFUSC5yZXNvbHZlIF9fZGlybmFtZSwgJy4uLy4uLy4uL2lvL21pbmdrd2FpLXJhY2svanpyZHMvbWVhbmluZy9tZWFuaW5ncy50eHQnXG4gICAgcGhyYXNlcy5zdGF0ZW1lbnRzLmluc2VydF9kYXRhc291cmNlLnJ1biB7IGRza2V5LCBwYXRoIH1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBkZWJ1ZyAnzqlqenJzZGJfX180JywgXCJwb3B1bGF0ZV9maWxlX21pcnJvcjogXCIsIHBocmFzZXMuc3RhdGVtZW50cy5wb3B1bGF0ZV9maWxlX21pcnJvci5ydW4oKVxuICBkZWJ1ZyAnzqlqenJzZGJfX181JywgXCJwb3B1bGF0ZV9rZXl3b3JkczogICAgXCIsIHBocmFzZXMuc3RhdGVtZW50cy5wb3B1bGF0ZV9rZXl3b3Jkcy5ydW4oKVxuICBkZWJ1ZyAnzqlqenJzZGJfX182JywgXCJjb3VudF9kYXRhc291cmNlczogICAgXCIsIHBocmFzZXMuc3RhdGVtZW50cy5jb3VudF9kYXRhc291cmNlcy5nZXQoKVxuICBkZWJ1ZyAnzqlqenJzZGJfX183JywgXCJjb3VudF9taXJyb3JfbGluZXM6ICAgXCIsIHBocmFzZXMuc3RhdGVtZW50cy5jb3VudF9taXJyb3JfbGluZXMuZ2V0KClcbiAgIyBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMuc2VsZWN0X2Zyb21fbWlycm9yLml0ZXJhdGUoKVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHBocmFzZXMuc3RhdGVtZW50cy5sb2NhdGlvbnNfZnJvbV9rZXl3b3JkLml0ZXJhdGUgeyBrZXl3b3JkOiAndGhvdWdodCcsIH1cbiAgZWNobygpOyBlY2hvIHJvdyBmb3Igcm93IGZyb20gcGhyYXNlcy5zdGF0ZW1lbnRzLmxvY2F0aW9uc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICdzaGUnLCB9XG4gIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHBocmFzZXMuc3RhdGVtZW50cy5sb2NhdGlvbnNfZnJvbV9rZXl3b3JkLml0ZXJhdGUgeyBrZXl3b3JkOiAn5buTJywgfVxuICBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubG9jYXRpb25zX2Zyb21fa2V5d29yZC5pdGVyYXRlIHsga2V5d29yZDogJ+W6picsIH1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubGluZXNfZnJvbV9rZXl3b3JkLml0ZXJhdGUgeyBrZXl3b3JkOiAndGhvdWdodCcsIH1cbiAgZWNobygpOyBlY2hvIHJvdyBmb3Igcm93IGZyb20gcGhyYXNlcy5zdGF0ZW1lbnRzLmxpbmVzX2Zyb21fa2V5d29yZC5pdGVyYXRlIHsga2V5d29yZDogJ3NoZScsIH1cbiAgZWNobygpOyBlY2hvIHJvdyBmb3Igcm93IGZyb20gcGhyYXNlcy5zdGF0ZW1lbnRzLmxpbmVzX2Zyb21fa2V5d29yZC5pdGVyYXRlIHsga2V5d29yZDogJ+W7kycsIH1cbiAgZWNobygpOyBlY2hvIHJvdyBmb3Igcm93IGZyb20gcGhyYXNlcy5zdGF0ZW1lbnRzLmxpbmVzX2Zyb21fa2V5d29yZC5pdGVyYXRlIHsga2V5d29yZDogJ+W6picsIH1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICA7bnVsbFxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbndyaXRlX2xpbmVfZGF0YV90b19zcWxpdGVmcyA9IC0+XG4gIGRiX3BhdGggICA9IFBBVEgucmVzb2x2ZSBfX2Rpcm5hbWUsICcuLi8uLi9idmZzL2J2ZnMuZGInXG4gIGJ2ZnMgICAgICA9IERicmljLm9wZW4gZGJfcGF0aFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGZpbGVfaWRfYW5kX3NpemVfZnJvbV9wYXRoID0gYnZmcy5wcmVwYXJlIFNRTFwiXCJcIlxuICAgIHNlbGVjdFxuICAgICAgICBwLmZpbGVfaWQgYXMgZmlsZV9pZCxcbiAgICAgICAgbS5zaXplICAgIGFzIHNpemVcbiAgICAgIGZyb20gYmJfcGF0aHMgYXMgcFxuICAgICAgam9pbiBtZXRhZGF0YSBhcyBtIG9uICggcC5maWxlX2lkID0gbS5pZCApXG4gICAgICB3aGVyZSBwLnBhdGggPSAkcGF0aDtcIlwiXCJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBpbnNlcnRfbGluZV9ieXRlX29mZnNldCA9IGJ2ZnMucHJlcGFyZSBTUUxcIlwiXCJcbiAgICBpbnNlcnQgaW50byBiYl9saW5lX2J5dGVfb2Zmc2V0cyAoIGZpbGVfaWQsICAgbGluZV9uciwgIGJsb2NrX251bSwgIHN0YXJ0LCAgc3RvcCApXG4gICAgICB2YWx1ZXMgICAgICAgICAgICAgICAgICAgICAgICAgKCAkZmlsZV9pZCwgJGxpbmVfbnIsICRibG9ja19udW0sICRzdGFydCwgJHN0b3AgKTtcIlwiXCJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAjIyMgTk9URSBtdXN0IGtub3cgYnl0ZSBzaXplIG9mIGZpbGUgIyMjXG4gICMjIyBUQUlOVCBzaG91bGQgYmVjb21lIGBEYnJpYzo6Z2V0X2ZpcnN0X3JvdygpYCAjIyNcbiAgZ2V0X2ZpcnN0X3JvdyA9ICggaXRlcmF0b3IgKSAtPlxuICAgIFIgICAgICAgICAgICAgPSBudWxsXG4gICAgeyB2YWx1ZTogUixcbiAgICAgIGRvbmUsICAgICB9ID0gaXRlcmF0b3IubmV4dCgpXG4gICAgaWYgKCBkb25lICkgb3IgKCBub3QgUj8gKVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwizqlkYnJpY19fXzggZXhwZWN0ZWQgZXhhY3RseSBvbmUgcm93LCBnb3Qgbm9uZVwiXG4gICAgZXh0cmEgICAgID0gaXRlcmF0b3IubmV4dCgpXG4gICAgdGhyb3dhd2F5ID0gWyBpdGVyYXRvci4uLiwgXSAjIyMgTk9URSBhbHdheSBleGhhdXN0IGl0ZXJhdG9yIHRvIGtlZXAgaXQgZnJvbSBibG9ja2luZyBEQiAjIyNcbiAgICBpZiAoIG5vdCBleHRyYS5kb25lICkgb3IgKCBleHRyYS52YWx1ZT8gKVxuICAgICAgdGhyb3cgbmV3IEVycm9yIFwizqlkYnJpY19fXzkgZXhwZWN0ZWQgZXhhY3RseSBvbmUgcm93LCBnb3QgbW9yZSB0aGFuIG9uZTogI3tycHIgZXh0cmF9XCJcbiAgICByZXR1cm4gUlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIHBvcHVsYXRlX2xpbmVfYnl0ZV9vZmZzZXRzID0gKHsgcGF0aCwgfSkgLT5cbiAgICB7IGZpbGVfaWQsXG4gICAgICBzaXplLCAgICAgfSA9IGdldF9maXJzdF9yb3cgZmlsZV9pZF9hbmRfc2l6ZV9mcm9tX3BhdGguaXRlcmF0ZSB7IHBhdGgsIH1cbiAgICB1cmdlICfOqWp6cnNkYl9fMTAnLCB7IGZpbGVfaWQsIHNpemUsIHBhdGgsIH1cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgIyMjIE5PVEUgRW50cmllcyBpbiB0YWJsZSBgYmJfbGluZV9ieXRlX29mZnNldHNgIHJlcXVpcmUgYSBmb3JlaWduIGtleSB0byBzb21lIGRhdGEgYmxvY2ssIGJ1dCBlbXB0eVxuICAgIGZpbGVzIGRvIG5vdCBnZXQgYSBkYXRhIGJsb2NrLiBBcyBhIHRlbnRhdGl2ZSBzb2x1dGlvbiwgd2UgZG8gbm90IHJlcHJlc2VudCBlbXB0eSBmaWxlcyBpblxuICAgIGBiYl9saW5lX2J5dGVfb2Zmc2V0c2AgYXQgYWxsLCBsZWF2aW5nIGl0IHVwIHRvIGNvbnN1bWVycyAoZS5nLiB0aGUgdmlldyBjb250YWluaW5nIGZpbGUgbGluZXMpXG4gICAgdG8gZGVhbCB3aXRoIHRoZSBzaXR1YXRpb24uICMjI1xuICAgIGRlYnVnICfOqWp6cnNkYl9fMTEnLCBcImZpbGUgI3twYXRofSBpcyBlbXB0eVwiIGlmIHNpemUgaXMgMFxuICAgIHJldHVybiAwIGlmIHNpemUgaXMgMFxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICByZWFkX2Jsb2JzX2Zvcl9maWxlX2lkID0gYnZmcy5wcmVwYXJlIFNRTFwiXCJcIlxuICAgICAgc2VsZWN0XG4gICAgICAgIGJsb2NrX251bSxcbiAgICAgICAgZGF0YVxuICAgICAgZnJvbSBkYXRhXG4gICAgICB3aGVyZSBmaWxlX2lkID0gJGZpbGVfaWRcbiAgICAgIG9yZGVyIGJ5IGJsb2NrX251bTtcIlwiXCJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgbGZfY2lkID0gKCAnXFxuJyApLmNvZGVQb2ludEF0IDBcbiAgICBjcl9jaWQgPSAoICdcXHInICkuY29kZVBvaW50QXQgMFxuICAgIGZpbmRfbGluZWJyZWFrcyA9ICggdmFsdWVzICkgLT5cbiAgICAgICMjIyBUQUlOVCB1c2UgQXJyYXk6OmZpbmQoKSB0byBpdGVyYXRlIG92ZXIgYWxsIHZhbHVlcyBpbiBhcnJheSBhbmQgc2F0aXNmeSBjb21wb3VuZCBjcml0ZXJpb25cIiAjIyNcbiAgICAgIFIgICAgICAgPSBbXVxuICAgICAgc3RhcnQgICA9IDBcbiAgICAgIGxlbmd0aCAgPSAxICMgY291bGQgYmUgdHdvIGZvciBDUkxGXG4gICAgICAjIyMgTk9URSBUaGlzIHRlc3QgY291bGQgYmUgdXNlZCBvbmNlIG9uIGVhY2ggYnVmZmVyOyBvbmNlIGl0IHJldHVybnMgYHRydWVgIGEgbW9yZSBjb21wbGljYXRlZFxuICAgICAgYWxnb3JpdGhtIHRvIGRldGVjdCBgL1xcclxcbnxcXHJ8XFxuL2Agc2hvdWxkIGJlIHVzZWQgZm9yIHRoZSByZXN0IG9mIHRoZSBmaWxlOlxuXG4gICAgICAgIGlmIHVzZV9jcmxmX2FsZ28gPSB2YWx1ZXMuaW5jbHVkZXMgY3JfY2lkXG4gICAgICAjIyNcbiAgICAgIGxvb3BcbiAgICAgICAgYnJlYWsgaWYgKCBpZHggPSB2YWx1ZXMuaW5kZXhPZiBsZl9jaWQsIHN0YXJ0ICkgPCAwXG4gICAgICAgIFIucHVzaCBbIGlkeCwgbGVuZ3RoLCBdXG4gICAgICAgIHN0YXJ0ID0gaWR4ICsgMVxuICAgICAgcmV0dXJuIFJcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgY3VycmVudF9ieXRlX2NvdW50ICA9IDBcbiAgICBmaWxlX2ZpbmlzaGVkICAgICAgID0gZmFsc2VcbiAgICBmb3IgZCBmcm9tIHJlYWRfYmxvYnNfZm9yX2ZpbGVfaWQuaXRlcmF0ZSB7IGZpbGVfaWQsIH1cbiAgICAgIGJ1ZmZlciAgPSBCdWZmZXIuZnJvbSBkLmRhdGFcbiAgICAgIHRleHQgICAgPSAoIGJ1ZmZlci50b1N0cmluZyAndXRmLTgnIClbIC4uIDEwMCBdXG4gICAgICAjIGRlYnVnICfOqWp6cnNkYl9fMTInLCBkLmRhdGFcbiAgICAgIGRlYnVnICfOqWp6cnNkYl9fMTMnLCAnZmlsZScsICdibG9jaycsIGQuYmxvY2tfbnVtLCAoIHJwciB0ZXh0IClcbiAgICAgIGxpbmVicmVha19pZHhzICA9IGZpbmRfbGluZWJyZWFrcyBkLmRhdGFcbiAgICAgIGRhdGFfbGVuZ3RoICAgICA9IGQuZGF0YS5sZW5ndGhcbiAgICAgIGRlYnVnICfOqWp6cnNkYl9fMTQnLCBsaW5lYnJlYWtfaWR4c1xuICAgICAgaWYgbGluZWJyZWFrX2lkeHMubGVuZ3RoIGlzIDBcbiAgICAgICAgIyMjIFRBSU5UIGRlYWwgd2l0aCBubyBsaW5lIGJyZWFrcyAjIyNcbiAgICAgICAgY29udGludWVcbiAgICAgIGxhc3RfZW50cnlfaWR4ID0gbGluZWJyZWFrX2lkeHMubGVuZ3RoIC0gMVxuICAgICAgZm9yIFsgbmxfaWR4LCBubF9sZW5ndGgsIF0sIGVudHJ5X2lkeCBpbiBsaW5lYnJlYWtfaWR4c1xuICAgICAgICBpZiBlbnRyeV9pZHggPCBsYXN0X2VudHJ5X2lkeFxuICAgICAgICAgIGxpbmVwYXJ0X2xlbmd0aCA9IGxpbmVicmVha19pZHhzWyBlbnRyeV9pZHggKyAxIF1bIDAgXSAtIG5sX2lkeFxuICAgICAgICBlbHNlXG4gICAgICAgICAgZGVsdGEgPSBsYXN0X2VudHJ5X2lkeCAtIG5sX2lkeFxuICAgICAgICAgIGlmICggcmVtYWluaW5nX2J5dGVzID0gc2l6ZSAtIGN1cnJlbnRfYnl0ZV9jb3VudCApIDwgZGVsdGFcbiAgICAgICAgICAgIGxpbmVwYXJ0X2xlbmd0aCA9IHJlbWFpbmluZ19ieXRlc1xuICAgICAgICAgICAgZmlsZV9maW5pc2hlZCAgID0gdHJ1ZVxuICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIGxpbmVwYXJ0X2xlbmd0aCA9IGRlbHRhXG4gICAgICAgIGN1cnJlbnRfYnl0ZV9jb3VudCArPSBsaW5lcGFydF9sZW5ndGhcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBwYXRocyA9IFtcbiAgICAnL+OAh+S4gOS6jOS4ieWbm+S6lOWFreS4g+WFq+S5nS50eHQnXG4gICAgJy9udWxscy50eHQnXG4gICAgJy9lbXB0eS50eHQnXG4gICAgXVxuICBmb3IgcGF0aCBpbiBwYXRoc1xuICAgIHBvcHVsYXRlX2xpbmVfYnl0ZV9vZmZzZXRzIHsgcGF0aCwgfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIDtudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5kZW1vX3JlYWRfbGluZXNfZnJvbV9idWZmZXJzID0gLT5cbiAgeyB3YWxrX2J1ZmZlcnNfd2l0aF9wb3NpdGlvbnMsXG4gICAgd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucywgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2Zhc3RfbGluZXJlYWRlcigpXG4gIHBhdGggPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4vcGFja2FnZS5qc29uJ1xuICBmb3IgZCBmcm9tIHdhbGtfYnVmZmVyc193aXRoX3Bvc2l0aW9ucyBwYXRoXG4gICAgZGVidWcgJ86panpyc2RiX18xNScsIGRcbiAgZm9yIGQgZnJvbSB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zIHBhdGgsIHsgY2h1bmtfc2l6ZTogMTAsIH1cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzE2JywgZFxuICA7bnVsbFxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmlmIG1vZHVsZSBpcyByZXF1aXJlLm1haW4gdGhlbiBkbyA9PlxuICAjIG1hdGVyaWFsaXplZF9maWxlX21pcnJvcigpXG4gIHdyaXRlX2xpbmVfZGF0YV90b19zcWxpdGVmcygpXG4gICMgZGVtb19yZWFkX2xpbmVzX2Zyb21fYnVmZmVycygpXG4gIDtudWxsXG5cbiJdfQ==
