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
      var d, file_id, read_blobs_for_file_id, results, size, text;
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
      results = [];
      for (d of read_blobs_for_file_id.iterate({file_id})) {
        text = ((Buffer.from(d.data)).toString('utf-8')).slice(0, 101);
        // debug 'Ωjzrsdb__12', d.data
        results.push(debug('Ωjzrsdb__13', 'file', 'block', d.block_num, rpr(text)));
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
      debug('Ωjzrsdb__14', d);
    }
    for (d of walk_lines_with_positions(path, {
      chunk_size: 10
    })) {
      debug('Ωjzrsdb__15', d);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL21haW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEtBQUEsRUFBQSxLQUFBLEVBQUEsYUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsNEJBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsU0FBQSxFQUFBLEdBQUEsRUFBQSx3QkFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLDJCQUFBOzs7RUFHQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixDQUFBLENBQUUsS0FBRixFQUNFLEtBREYsRUFFRSxJQUZGLEVBR0UsSUFIRixFQUlFLEtBSkYsRUFLRSxNQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxPQVJGLENBQUEsR0FRNEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFSLENBQW9CLG1CQUFwQixDQVI1Qjs7RUFTQSxDQUFBLENBQUUsR0FBRixFQUNFLE9BREYsRUFFRSxJQUZGLEVBR0UsS0FIRixFQUlFLEtBSkYsRUFLRSxJQUxGLEVBTUUsSUFORixFQU9FLElBUEYsRUFRRSxHQVJGLEVBU0UsSUFURixFQVVFLE9BVkYsRUFXRSxHQVhGLENBQUEsR0FXNEIsR0FBRyxDQUFDLEdBWGhDLEVBYkE7Ozs7Ozs7RUE4QkEsU0FBQSxHQUE0QixPQUFBLENBQVEsMkNBQVIsRUE5QjVCOzs7RUFnQ0EsSUFBQSxHQUE0QixPQUFBLENBQVEsV0FBUixFQWhDNUI7OztFQWtDQSxDQUFBLENBQUUsS0FBRixFQUNF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RSxDQUFFLE1BQU0sQ0FBQyxJQUFQLENBQVksQ0FBQyxDQUFDLElBQWQsQ0FBRixDQUFzQixDQUFDLFFBQXZCLENBQWdDLE9BQWhDLENBQUYsQ0FBMkMsZUFBeEQ7O3FCQUVNLEtBQUEsQ0FBTSxhQUFOLEVBQXFCLE1BQXJCLEVBQTZCLE9BQTdCLEVBQXNDLENBQUMsQ0FBQyxTQUF4QyxFQUFxRCxHQUFBLENBQUksSUFBSixDQUFyRDtNQUhGLENBQUE7O0lBcEIyQixFQTdCL0I7O0lBc0RFLEtBQUEsR0FBUSxDQUNOLGlCQURNLEVBRU4sWUFGTSxFQUdOLFlBSE07SUFLUixLQUFBLHVDQUFBOztNQUNFLDBCQUFBLENBQTJCLENBQUUsSUFBRixDQUEzQjtJQURGLENBM0RGOztXQThERztFQS9EMkIsRUFyTTlCOzs7RUF3UUEsNEJBQUEsR0FBK0IsUUFBQSxDQUFBLENBQUE7QUFDL0IsUUFBQSxDQUFBLEVBQUEsSUFBQSxFQUFBLDJCQUFBLEVBQUE7SUFBRSxDQUFBLENBQUUsMkJBQUYsRUFDRSx5QkFERixDQUFBLEdBQ2lDLFNBQVMsQ0FBQyxRQUFRLENBQUMsdUJBQW5CLENBQUEsQ0FEakM7SUFFQSxJQUFBLEdBQU8sSUFBSSxDQUFDLE9BQUwsQ0FBYSxTQUFiLEVBQXdCLGlCQUF4QjtJQUNQLEtBQUEsc0NBQUE7TUFDRSxLQUFBLENBQU0sYUFBTixFQUFxQixDQUFyQjtJQURGO0lBRUEsS0FBQTs7TUFBQTtNQUNFLEtBQUEsQ0FBTSxhQUFOLEVBQXFCLENBQXJCO0lBREY7V0FFQztFQVI0QixFQXhRL0I7OztFQW1SQSxJQUFHLE1BQUEsS0FBVSxPQUFPLENBQUMsSUFBckI7SUFBa0MsQ0FBQSxDQUFBLENBQUEsR0FBQSxFQUFBOztNQUVoQywyQkFBQSxDQUFBLEVBREY7O2FBR0c7SUFKK0IsQ0FBQSxJQUFsQzs7QUFuUkEiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuJ3VzZSBzdHJpY3QnXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuR1VZICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2d1eSdcbnsgYWxlcnRcbiAgZGVidWdcbiAgaGVscFxuICBpbmZvXG4gIHBsYWluXG4gIHByYWlzZVxuICB1cmdlXG4gIHdhcm5cbiAgd2hpc3BlciB9ICAgICAgICAgICAgICAgPSBHVVkudHJtLmdldF9sb2dnZXJzICdqaXp1cmEtc291cmNlcy1kYidcbnsgcnByXG4gIGluc3BlY3RcbiAgZWNob1xuICB3aGl0ZVxuICBncmVlblxuICBibHVlXG4gIGdvbGRcbiAgZ3JleVxuICByZWRcbiAgYm9sZFxuICByZXZlcnNlXG4gIGxvZyAgICAgfSAgICAgICAgICAgICAgID0gR1VZLnRybVxuIyB7IGYgfSAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2VmZnN0cmluZydcbiMgd3JpdGUgICAgICAgICAgICAgICAgICAgICA9ICggcCApIC0+IHByb2Nlc3Muc3Rkb3V0LndyaXRlIHBcbiMgeyBuZmEgfSAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ub3JtYWxpemUtZnVuY3Rpb24tYXJndW1lbnRzJ1xuIyBHVE5HICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2d1eS10ZXN0LU5HJ1xuIyB7IFRlc3QgICAgICAgICAgICAgICAgICB9ID0gR1ROR1xuU0ZNT0RVTEVTICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9icmljYWJyYWMtc2Ztb2R1bGVzJ1xuIyBGUyAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpmcydcblBBVEggICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOnBhdGgnXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbnsgRGJyaWMsXG4gIFNRTCxcbiAgaW50ZXJuYWxzLCAgICAgICAgICAgICAgICB9ID0gU0ZNT0RVTEVTLnVuc3RhYmxlLnJlcXVpcmVfZGJyaWMoKVxuQnNxbDMgICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdiZXR0ZXItc3FsaXRlMydcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuY2xhc3MgRGJyaWNfcGhyYXNlcyBleHRlbmRzIERicmljXG4gIEBkYl9jbGFzczogQnNxbDNcbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBAYnVpbGQ6IFtcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIFNRTFwiXCJcImNyZWF0ZSB0YWJsZSBkYXRhc291cmNlcyAoXG4gICAgICAgIGRza2V5IHRleHQgdW5pcXVlIG5vdCBudWxsIHByaW1hcnkga2V5LFxuICAgICAgICBwYXRoIHRleHQgbm90IG51bGwgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIG1pcnJvciAoXG4gICAgICAgIGRza2V5ICAgdGV4dCAgICBub3QgbnVsbCxcbiAgICAgICAgbGluZV9uciBpbnRlZ2VyIG5vdCBudWxsLFxuICAgICAgICBsaW5lICAgIHRleHQgICAgbm90IG51bGwsXG4gICAgICBmb3JlaWduIGtleSAoIGRza2V5ICkgcmVmZXJlbmNlcyBkYXRhc291cmNlcyAoIGRza2V5ICksXG4gICAgICBwcmltYXJ5IGtleSAoIGRza2V5LCBsaW5lX25yICkgKTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHRhYmxlIGtleXdvcmRzIChcbiAgICAgICAgZHNrZXkgICB0ZXh0ICAgIG5vdCBudWxsLFxuICAgICAgICBsaW5lX25yIGludGVnZXIgbm90IG51bGwsXG4gICAgICAgIGtleXdvcmQgdGV4dCAgICBub3QgbnVsbCxcbiAgICAgIGZvcmVpZ24ga2V5ICggZHNrZXkgKSByZWZlcmVuY2VzIGRhdGFzb3VyY2VzICggZHNrZXkgKSxcbiAgICAgIHByaW1hcnkga2V5ICggZHNrZXksIGxpbmVfbnIsIGtleXdvcmQgKSApO1wiXCJcIlxuICAgIF1cblxuICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gIEBzdGF0ZW1lbnRzOlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfZGF0YXNvdXJjZTogU1FMXCJcIlwiaW5zZXJ0IGludG8gZGF0YXNvdXJjZXMgKCBkc2tleSwgcGF0aCApIHZhbHVlcyAoICRkc2tleSwgJHBhdGggKVxuICAgICAgb24gY29uZmxpY3QgKCBkc2tleSApIGRvIHVwZGF0ZSBzZXQgcGF0aCA9ICRwYXRoO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBpbnNlcnRfa2V5d29yZDogU1FMXCJcIlwiaW5zZXJ0IGludG8ga2V5d29yZHMgKCBkc2tleSwgbGluZV9uciwga2V5d29yZCApIHZhbHVlcyAoICRkc2tleSwgJGxpbmVfbnIsICRrZXl3b3JkIClcbiAgICAgIG9uIGNvbmZsaWN0ICggZHNrZXksIGxpbmVfbnIsIGtleXdvcmQgKSBkbyBub3RoaW5nO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBzZWxlY3RfZnJvbV9kYXRhc291cmNlczogU1FMXCJcIlwic2VsZWN0ICogZnJvbSBkYXRhc291cmNlcyBvcmRlciBieSBkc2tleTtcIlwiXCJcbiAgICBzZWxlY3RfZnJvbV9taXJyb3I6ICAgICAgU1FMXCJcIlwic2VsZWN0ICogZnJvbSBtaXJyb3Igb3JkZXIgYnkgZHNrZXksIGxpbmVfbnI7XCJcIlwiXG4gICAgY291bnRfZGF0YXNvdXJjZXM6ICAgICAgIFNRTFwiXCJcInNlbGVjdCBjb3VudCgqKSBhcyBkYXRhc291cmNlX2NvdW50ICBmcm9tIGRhdGFzb3VyY2VzO1wiXCJcIlxuICAgIGNvdW50X21pcnJvcl9saW5lczogICAgICBTUUxcIlwiXCJzZWxlY3QgY291bnQoKikgYXMgbWlycm9yX2xpbmVfY291bnQgZnJvbSBtaXJyb3I7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHNlbGVjdF9mcm9tX2tleXdvcmRzOiBTUUxcIlwiXCJzZWxlY3QgKiBmcm9tIGtleXdvcmRzIG9yZGVyIGJ5IGtleXdvcmQsIGRza2V5LCBsaW5lX25yO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBsb2NhdGlvbnNfZnJvbV9rZXl3b3JkOiBTUUxcIlwiXCJzZWxlY3QgKiBmcm9tIGtleXdvcmRzXG4gICAgICB3aGVyZSBrZXl3b3JkID0gJGtleXdvcmRcbiAgICAgIG9yZGVyIGJ5IGtleXdvcmQsIGRza2V5LCBsaW5lX25yO1wiXCJcIlxuXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBsaW5lc19mcm9tX2tleXdvcmQ6IFNRTFwiXCJcInNlbGVjdFxuICAgICAgICBrdy5kc2tleSAgICBhcyBkc2tleSxcbiAgICAgICAga3cubGluZV9uciAgYXMgbGluZV9ucixcbiAgICAgICAga3cua2V5d29yZCAgYXMga2V5d29yZCxcbiAgICAgICAgbWkubGluZSAgICAgYXMgbGluZVxuICAgICAgZnJvbSBrZXl3b3JkcyBhcyBrd1xuICAgICAgam9pbiBtaXJyb3IgICBhcyBtaSB1c2luZyAoIGRza2V5LCBsaW5lX25yIClcbiAgICAgIHdoZXJlIGtleXdvcmQgPSAka2V5d29yZFxuICAgICAgb3JkZXIgYnkga2V5d29yZCwgZHNrZXksIGxpbmVfbnI7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHNlbGVjdF9mcm9tX21pcnJvcjogU1FMXCJcIlwic2VsZWN0ICogZnJvbSBtaXJyb3Igb3JkZXIgYnkgZHNrZXk7XCJcIlwiXG5cbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIHBvcHVsYXRlX2ZpbGVfbWlycm9yOiBTUUxcIlwiXCJcbiAgICAgIGluc2VydCBpbnRvIG1pcnJvciAoIGRza2V5LCBsaW5lX25yLCBsaW5lIClcbiAgICAgICAgc2VsZWN0XG4gICAgICAgICAgZHMuZHNrZXkgICAgYXMgZHNrZXksXG4gICAgICAgICAgZmwubGluZV9uciAgYXMgbGluZV9ucixcbiAgICAgICAgICBmbC5saW5lICAgICBhcyBsaW5lXG4gICAgICAgIGZyb20gZGF0YXNvdXJjZXMgICAgICAgIGFzIGRzXG4gICAgICAgIGxlZnQgam9pbiBtaXJyb3IgICAgICAgIGFzIG1pIHVzaW5nICggZHNrZXkgKSxcbiAgICAgICAgZmlsZV9saW5lcyggZHMucGF0aCApICAgYXMgZmxcbiAgICAgICAgd2hlcmUgdHJ1ZSAtLSB3aGVyZSBjbGF1c2UganVzdCBhIHN5bnRhY3RpYyBndWFyZCBhcyBwZXIgaHR0cHM6Ly9zcWxpdGUub3JnL2xhbmdfdXBzZXJ0Lmh0bWxcbiAgICAgICAgb24gY29uZmxpY3QgZG8gdXBkYXRlIHNldCBsaW5lID0gZXhjbHVkZWQubGluZTtcIlwiXCJcblxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcG9wdWxhdGVfa2V5d29yZHM6IFNRTFwiXCJcIlxuICAgICAgaW5zZXJ0IGludG8ga2V5d29yZHMgKCBkc2tleSwgbGluZV9uciwga2V5d29yZCApXG4gICAgICAgIHNlbGVjdFxuICAgICAgICAgIGRzLmRza2V5ICAgIGFzIGRza2V5LFxuICAgICAgICAgIG1pLmxpbmVfbnIgIGFzIGxpbmVfbnIsXG4gICAgICAgICAgc3cua2V5d29yZCAgYXMga2V5d29yZFxuICAgICAgICBmcm9tIGRhdGFzb3VyY2VzICAgICAgICBhcyBkc1xuICAgICAgICBqb2luIG1pcnJvciAgICAgICAgICAgICBhcyBtaSB1c2luZyAoIGRza2V5ICksXG4gICAgICAgIHNwbGl0X3dvcmRzKCBtaS5saW5lICkgIGFzIHN3XG4gICAgICAgIHdoZXJlIHRydWUgLS0gd2hlcmUgY2xhdXNlIGp1c3QgYSBzeW50YWN0aWMgZ3VhcmQgYXMgcGVyIGh0dHBzOi8vc3FsaXRlLm9yZy9sYW5nX3Vwc2VydC5odG1sXG4gICAgICAgIG9uIGNvbmZsaWN0IGRvIG5vdGhpbmc7XCJcIlwiXG5cbiAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICBpbml0aWFsaXplOiAtPlxuICAgIHN1cGVyKClcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIEBjcmVhdGVfdGFibGVfZnVuY3Rpb25cbiAgICAgIG5hbWU6ICAgICAgICAgICAnc3BsaXRfd29yZHMnXG4gICAgICBjb2x1bW5zOiAgICAgICAgWyAna2V5d29yZCcsIF1cbiAgICAgIHBhcmFtZXRlcnM6ICAgICBbICdsaW5lJywgXVxuICAgICAgcm93czogKCBsaW5lICkgLT5cbiAgICAgICAga2V5d29yZHMgPSBsaW5lLnNwbGl0IC8oPzpcXHB7Wn0rKXwoKD86XFxwe1NjcmlwdD1IYW59KXwoPzpcXHB7TH0rKXwoPzpcXHB7Tn0rKXwoPzpcXHB7U30rKSkvdlxuICAgICAgICAjIGRlYnVnICfOqWp6cnNkYl9fXzEnLCBsaW5lX25yLCBycHIga2V5d29yZHNcbiAgICAgICAgZm9yIGtleXdvcmQgaW4ga2V5d29yZHNcbiAgICAgICAgICBjb250aW51ZSB1bmxlc3Mga2V5d29yZD9cbiAgICAgICAgICBjb250aW51ZSBpZiBrZXl3b3JkIGlzICcnXG4gICAgICAgICAgeWllbGQgeyBrZXl3b3JkLCB9XG4gICAgICAgIDtudWxsXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgICBAY3JlYXRlX3RhYmxlX2Z1bmN0aW9uXG4gICAgICBuYW1lOiAgICAgICAgICdmaWxlX2xpbmVzJ1xuICAgICAgY29sdW1uczogICAgICBbICdsaW5lX25yJywgJ2xpbmUnLCBdXG4gICAgICBwYXJhbWV0ZXJzOiAgIFsgJ3BhdGgnLCBdXG4gICAgICByb3dzOiAoIHBhdGggKSAtPlxuICAgICAgICBmb3IgeyBsbnI6IGxpbmVfbnIsIGxpbmUsIGVvbCwgfSBmcm9tIEdVWS5mcy53YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zIHBhdGhcbiAgICAgICAgICB5aWVsZCB7IGxpbmVfbnIsIGxpbmUsIH1cbiAgICAgICAgO251bGxcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIDtudWxsXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxubWF0ZXJpYWxpemVkX2ZpbGVfbWlycm9yID0gLT5cbiAgZGJfcGF0aCAgID0gJy9kZXYvc2htL2JyaWNhYnJhYy5zcWxpdGUnXG4gIHBocmFzZXMgICA9IERicmljX3BocmFzZXMub3BlbiBkYl9wYXRoXG4gIGRlYnVnICfOqWp6cnNkYl9fXzInLCBwaHJhc2VzLnRlYXJkb3duKClcbiAgZGVidWcgJ86panpyc2RiX19fMycsIHBocmFzZXMucmVidWlsZCgpXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZG8gPT5cbiAgICBkc2tleSA9ICdodW1kdW0nXG4gICAgcGF0aCAgPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4vLi4vaGVuZ2lzdC1ORy9hc3NldHMvYnJpY2FicmFjL2h1bXB0eS1kdW1wdHkubWQnXG4gICAgcGhyYXNlcy5zdGF0ZW1lbnRzLmluc2VydF9kYXRhc291cmNlLnJ1biB7IGRza2V5LCBwYXRoIH1cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBkbyA9PlxuICAgIGRza2V5ID0gJ21uZydcbiAgICBwYXRoICA9IFBBVEgucmVzb2x2ZSBfX2Rpcm5hbWUsICcuLi8uLi8uLi9pby9taW5na3dhaS1yYWNrL2p6cmRzL21lYW5pbmcvbWVhbmluZ3MudHh0J1xuICAgIHBocmFzZXMuc3RhdGVtZW50cy5pbnNlcnRfZGF0YXNvdXJjZS5ydW4geyBkc2tleSwgcGF0aCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZGVidWcgJ86panpyc2RiX19fNCcsIFwicG9wdWxhdGVfZmlsZV9taXJyb3I6IFwiLCBwaHJhc2VzLnN0YXRlbWVudHMucG9wdWxhdGVfZmlsZV9taXJyb3IucnVuKClcbiAgZGVidWcgJ86panpyc2RiX19fNScsIFwicG9wdWxhdGVfa2V5d29yZHM6ICAgIFwiLCBwaHJhc2VzLnN0YXRlbWVudHMucG9wdWxhdGVfa2V5d29yZHMucnVuKClcbiAgZGVidWcgJ86panpyc2RiX19fNicsIFwiY291bnRfZGF0YXNvdXJjZXM6ICAgIFwiLCBwaHJhc2VzLnN0YXRlbWVudHMuY291bnRfZGF0YXNvdXJjZXMuZ2V0KClcbiAgZGVidWcgJ86panpyc2RiX19fNycsIFwiY291bnRfbWlycm9yX2xpbmVzOiAgIFwiLCBwaHJhc2VzLnN0YXRlbWVudHMuY291bnRfbWlycm9yX2xpbmVzLmdldCgpXG4gICMgZWNobygpOyBlY2hvIHJvdyBmb3Igcm93IGZyb20gcGhyYXNlcy5zdGF0ZW1lbnRzLnNlbGVjdF9mcm9tX21pcnJvci5pdGVyYXRlKClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubG9jYXRpb25zX2Zyb21fa2V5d29yZC5pdGVyYXRlIHsga2V5d29yZDogJ3Rob3VnaHQnLCB9XG4gIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHBocmFzZXMuc3RhdGVtZW50cy5sb2NhdGlvbnNfZnJvbV9rZXl3b3JkLml0ZXJhdGUgeyBrZXl3b3JkOiAnc2hlJywgfVxuICBlY2hvKCk7IGVjaG8gcm93IGZvciByb3cgZnJvbSBwaHJhc2VzLnN0YXRlbWVudHMubG9jYXRpb25zX2Zyb21fa2V5d29yZC5pdGVyYXRlIHsga2V5d29yZDogJ+W7kycsIH1cbiAgZWNobygpOyBlY2hvIHJvdyBmb3Igcm93IGZyb20gcGhyYXNlcy5zdGF0ZW1lbnRzLmxvY2F0aW9uc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICfluqYnLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgZWNobygpOyBlY2hvIHJvdyBmb3Igcm93IGZyb20gcGhyYXNlcy5zdGF0ZW1lbnRzLmxpbmVzX2Zyb21fa2V5d29yZC5pdGVyYXRlIHsga2V5d29yZDogJ3Rob3VnaHQnLCB9XG4gIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHBocmFzZXMuc3RhdGVtZW50cy5saW5lc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICdzaGUnLCB9XG4gIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHBocmFzZXMuc3RhdGVtZW50cy5saW5lc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICflu5MnLCB9XG4gIGVjaG8oKTsgZWNobyByb3cgZm9yIHJvdyBmcm9tIHBocmFzZXMuc3RhdGVtZW50cy5saW5lc19mcm9tX2tleXdvcmQuaXRlcmF0ZSB7IGtleXdvcmQ6ICfluqYnLCB9XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgO251bGxcblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG53cml0ZV9saW5lX2RhdGFfdG9fc3FsaXRlZnMgPSAtPlxuICBkYl9wYXRoICAgPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4vLi4vYnZmcy9idmZzLmRiJ1xuICBidmZzICAgICAgPSBEYnJpYy5vcGVuIGRiX3BhdGhcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBmaWxlX2lkX2FuZF9zaXplX2Zyb21fcGF0aCA9IGJ2ZnMucHJlcGFyZSBTUUxcIlwiXCJcbiAgICBzZWxlY3RcbiAgICAgICAgcC5maWxlX2lkIGFzIGZpbGVfaWQsXG4gICAgICAgIG0uc2l6ZSAgICBhcyBzaXplXG4gICAgICBmcm9tIGJiX3BhdGhzIGFzIHBcbiAgICAgIGpvaW4gbWV0YWRhdGEgYXMgbSBvbiAoIHAuZmlsZV9pZCA9IG0uaWQgKVxuICAgICAgd2hlcmUgcC5wYXRoID0gJHBhdGg7XCJcIlwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgaW5zZXJ0X2xpbmVfYnl0ZV9vZmZzZXQgPSBidmZzLnByZXBhcmUgU1FMXCJcIlwiXG4gICAgaW5zZXJ0IGludG8gYmJfbGluZV9ieXRlX29mZnNldHMgKCBmaWxlX2lkLCAgIGxpbmVfbnIsICBibG9ja19udW0sICBzdGFydCwgIHN0b3AgKVxuICAgICAgdmFsdWVzICAgICAgICAgICAgICAgICAgICAgICAgICggJGZpbGVfaWQsICRsaW5lX25yLCAkYmxvY2tfbnVtLCAkc3RhcnQsICRzdG9wICk7XCJcIlwiXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgIyMjIE5PVEUgbXVzdCBrbm93IGJ5dGUgc2l6ZSBvZiBmaWxlICMjI1xuICAjIyMgVEFJTlQgc2hvdWxkIGJlY29tZSBgRGJyaWM6OmdldF9maXJzdF9yb3coKWAgIyMjXG4gIGdldF9maXJzdF9yb3cgPSAoIGl0ZXJhdG9yICkgLT5cbiAgICBSICAgICAgICAgICAgID0gbnVsbFxuICAgIHsgdmFsdWU6IFIsXG4gICAgICBkb25lLCAgICAgfSA9IGl0ZXJhdG9yLm5leHQoKVxuICAgIGlmICggZG9uZSApIG9yICggbm90IFI/IClcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIs6pZGJyaWNfX184IGV4cGVjdGVkIGV4YWN0bHkgb25lIHJvdywgZ290IG5vbmVcIlxuICAgIGV4dHJhICAgICA9IGl0ZXJhdG9yLm5leHQoKVxuICAgIHRocm93YXdheSA9IFsgaXRlcmF0b3IuLi4sIF0gIyMjIE5PVEUgYWx3YXkgZXhoYXVzdCBpdGVyYXRvciB0byBrZWVwIGl0IGZyb20gYmxvY2tpbmcgREIgIyMjXG4gICAgaWYgKCBub3QgZXh0cmEuZG9uZSApIG9yICggZXh0cmEudmFsdWU/IClcbiAgICAgIHRocm93IG5ldyBFcnJvciBcIs6pZGJyaWNfX185IGV4cGVjdGVkIGV4YWN0bHkgb25lIHJvdywgZ290IG1vcmUgdGhhbiBvbmU6ICN7cnByIGV4dHJhfVwiXG4gICAgcmV0dXJuIFJcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBwb3B1bGF0ZV9saW5lX2J5dGVfb2Zmc2V0cyA9ICh7IHBhdGgsIH0pIC0+XG4gICAgeyBmaWxlX2lkLFxuICAgICAgc2l6ZSwgICAgIH0gPSBnZXRfZmlyc3Rfcm93IGZpbGVfaWRfYW5kX3NpemVfZnJvbV9wYXRoLml0ZXJhdGUgeyBwYXRoLCB9XG4gICAgdXJnZSAnzqlqenJzZGJfXzEwJywgeyBmaWxlX2lkLCBzaXplLCBwYXRoLCB9XG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgICMjIyBOT1RFIEVudHJpZXMgaW4gdGFibGUgYGJiX2xpbmVfYnl0ZV9vZmZzZXRzYCByZXF1aXJlIGEgZm9yZWlnbiBrZXkgdG8gc29tZSBkYXRhIGJsb2NrLCBidXQgZW1wdHlcbiAgICBmaWxlcyBkbyBub3QgZ2V0IGEgZGF0YSBibG9jay4gQXMgYSB0ZW50YXRpdmUgc29sdXRpb24sIHdlIGRvIG5vdCByZXByZXNlbnQgZW1wdHkgZmlsZXMgaW5cbiAgICBgYmJfbGluZV9ieXRlX29mZnNldHNgIGF0IGFsbCwgbGVhdmluZyBpdCB1cCB0byBjb25zdW1lcnMgKGUuZy4gdGhlIHZpZXcgY29udGFpbmluZyBmaWxlIGxpbmVzKVxuICAgIHRvIGRlYWwgd2l0aCB0aGUgc2l0dWF0aW9uLiAjIyNcbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzExJywgXCJmaWxlICN7cGF0aH0gaXMgZW1wdHlcIiBpZiBzaXplIGlzIDBcbiAgICByZXR1cm4gMCBpZiBzaXplIGlzIDBcbiAgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgcmVhZF9ibG9ic19mb3JfZmlsZV9pZCA9IGJ2ZnMucHJlcGFyZSBTUUxcIlwiXCJcbiAgICAgIHNlbGVjdFxuICAgICAgICBibG9ja19udW0sXG4gICAgICAgIGRhdGFcbiAgICAgIGZyb20gZGF0YVxuICAgICAgd2hlcmUgZmlsZV9pZCA9ICRmaWxlX2lkXG4gICAgICBvcmRlciBieSBibG9ja19udW07XCJcIlwiXG4gICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICAgIGZvciBkIGZyb20gcmVhZF9ibG9ic19mb3JfZmlsZV9pZC5pdGVyYXRlIHsgZmlsZV9pZCwgfVxuICAgICAgdGV4dCA9ICggKCBCdWZmZXIuZnJvbSBkLmRhdGEgKS50b1N0cmluZyAndXRmLTgnIClbIC4uIDEwMCBdXG4gICAgICAjIGRlYnVnICfOqWp6cnNkYl9fMTInLCBkLmRhdGFcbiAgICAgIGRlYnVnICfOqWp6cnNkYl9fMTMnLCAnZmlsZScsICdibG9jaycsIGQuYmxvY2tfbnVtLCAoIHJwciB0ZXh0IClcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBwYXRocyA9IFtcbiAgICAnL+OAh+S4gOS6jOS4ieWbm+S6lOWFreS4g+WFq+S5nS50eHQnXG4gICAgJy9udWxscy50eHQnXG4gICAgJy9lbXB0eS50eHQnXG4gICAgXVxuICBmb3IgcGF0aCBpbiBwYXRoc1xuICAgIHBvcHVsYXRlX2xpbmVfYnl0ZV9vZmZzZXRzIHsgcGF0aCwgfVxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIDtudWxsXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5kZW1vX3JlYWRfbGluZXNfZnJvbV9idWZmZXJzID0gLT5cbiAgeyB3YWxrX2J1ZmZlcnNfd2l0aF9wb3NpdGlvbnMsXG4gICAgd2Fsa19saW5lc193aXRoX3Bvc2l0aW9ucywgfSA9IFNGTU9EVUxFUy51bnN0YWJsZS5yZXF1aXJlX2Zhc3RfbGluZXJlYWRlcigpXG4gIHBhdGggPSBQQVRILnJlc29sdmUgX19kaXJuYW1lLCAnLi4vcGFja2FnZS5qc29uJ1xuICBmb3IgZCBmcm9tIHdhbGtfYnVmZmVyc193aXRoX3Bvc2l0aW9ucyBwYXRoXG4gICAgZGVidWcgJ86panpyc2RiX18xNCcsIGRcbiAgZm9yIGQgZnJvbSB3YWxrX2xpbmVzX3dpdGhfcG9zaXRpb25zIHBhdGgsIHsgY2h1bmtfc2l6ZTogMTAsIH1cbiAgICBkZWJ1ZyAnzqlqenJzZGJfXzE1JywgZFxuICA7bnVsbFxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmlmIG1vZHVsZSBpcyByZXF1aXJlLm1haW4gdGhlbiBkbyA9PlxuICAjIG1hdGVyaWFsaXplZF9maWxlX21pcnJvcigpXG4gIHdyaXRlX2xpbmVfZGF0YV90b19zcWxpdGVmcygpXG4gICMgZGVtb19yZWFkX2xpbmVzX2Zyb21fYnVmZmVycygpXG4gIDtudWxsXG5cbiJdfQ==
