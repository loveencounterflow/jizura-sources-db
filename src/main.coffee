

'use strict'

#===========================================================================================================
GUY                       = require 'guy'
{ alert
  debug
  help
  info
  plain
  praise
  urge
  warn
  whisper }               = GUY.trm.get_loggers 'jizura-sources-db'
{ rpr
  inspect
  echo
  white
  green
  blue
  gold
  grey
  red
  bold
  reverse
  log     }               = GUY.trm
# { f }                     = require '../../hengist-NG/apps/effstring'
# write                     = ( p ) -> process.stdout.write p
# { nfa }                   = require '../../hengist-NG/apps/normalize-function-arguments'
# GTNG                      = require '../../hengist-NG/apps/guy-test-NG'
# { Test                  } = GTNG
SFMODULES                 = require '../../hengist-NG/apps/bricabrac-sfmodules'
# FS                        = require 'node:fs'
PATH                      = require 'node:path'
#-----------------------------------------------------------------------------------------------------------
{ Dbric,
  SQL,
  internals,                } = SFMODULES.unstable.require_dbric()
Bsql3                         = require 'better-sqlite3'
#-----------------------------------------------------------------------------------------------------------


#===========================================================================================================
class Dbric_phrases extends Dbric
  @db_class: Bsql3
  #---------------------------------------------------------------------------------------------------------
  @build: [
    #.......................................................................................................
    SQL"""create table datasources (
        dskey text unique not null primary key,
        path text not null );"""
    #.......................................................................................................
    SQL"""create table mirror (
        dskey   text    not null,
        line_nr integer not null,
        line    text    not null,
      foreign key ( dskey ) references datasources ( dskey ),
      primary key ( dskey, line_nr ) );"""
    #.......................................................................................................
    SQL"""create table keywords (
        dskey   text    not null,
        line_nr integer not null,
        keyword text    not null,
      foreign key ( dskey ) references datasources ( dskey ),
      primary key ( dskey, line_nr, keyword ) );"""
    ]
  #---------------------------------------------------------------------------------------------------------
  @statements:
    #.......................................................................................................
    insert_datasource: SQL"""insert into datasources ( dskey, path ) values ( $dskey, $path )
      on conflict ( dskey ) do update set path = $path;"""
    #.......................................................................................................
    insert_keyword: SQL"""insert into keywords ( dskey, line_nr, keyword ) values ( $dskey, $line_nr, $keyword )
      on conflict ( dskey, line_nr, keyword ) do nothing;"""
    #.......................................................................................................
    select_from_datasources: SQL"""select * from datasources order by dskey;"""
    select_from_mirror:      SQL"""select * from mirror order by dskey, line_nr;"""
    count_datasources:       SQL"""select count(*) as datasource_count  from datasources;"""
    count_mirror_lines:      SQL"""select count(*) as mirror_line_count from mirror;"""
    #.......................................................................................................
    select_from_keywords: SQL"""select * from keywords order by keyword, dskey, line_nr;"""
    locations_from_keyword: SQL"""select * from keywords
      where keyword = $keyword
      order by keyword, dskey, line_nr;"""
    lines_from_keyword: SQL"""select
        kw.dskey    as dskey,
        kw.line_nr  as line_nr,
        kw.keyword  as keyword,
        mi.line     as line
      from keywords as kw
      join mirror   as mi using ( dskey, line_nr )
      where keyword = $keyword
      order by keyword, dskey, line_nr;"""
    #.......................................................................................................
    select_from_mirror: SQL"""select * from mirror order by dskey;"""
    #.......................................................................................................
    populate_file_mirror: SQL"""
      insert into mirror ( dskey, line_nr, line )
        select
          ds.dskey    as dskey,
          fl.line_nr  as line_nr,
          fl.line     as line
        from datasources        as ds
        left join mirror        as mi using ( dskey ),
        file_lines( ds.path )   as fl
        where true -- where clause just a syntactic guard as per https://sqlite.org/lang_upsert.html
        on conflict do update set line = excluded.line;"""
    #.......................................................................................................
    populate_keywords: SQL"""
      insert into keywords ( dskey, line_nr, keyword )
        select
          ds.dskey    as dskey,
          mi.line_nr  as line_nr,
          sw.keyword  as keyword
        from datasources        as ds
        join mirror             as mi using ( dskey ),
        split_words( mi.line )  as sw
        where true -- where clause just a syntactic guard as per https://sqlite.org/lang_upsert.html
        on conflict do nothing;"""
  #---------------------------------------------------------------------------------------------------------
  initialize: ->
    super()
    #.......................................................................................................
    @create_table_function
      name:           'split_words'
      columns:        [ 'keyword', ]
      parameters:     [ 'line', ]
      rows: ( line ) ->
        keywords = line.split /(?:\p{Z}+)|((?:\p{Script=Han})|(?:\p{L}+)|(?:\p{N}+)|(?:\p{S}+))/v
        # debug 'Ωjzrsdb___5', line_nr, rpr keywords
        for keyword in keywords
          continue unless keyword?
          continue if keyword is ''
          yield { keyword, }
        ;null
    #.......................................................................................................
    @create_table_function
      name:         'file_lines'
      columns:      [ 'line_nr', 'line', ]
      parameters:   [ 'path', ]
      rows: ( path ) ->
        for { lnr: line_nr, line, eol, } from GUY.fs.walk_lines_with_positions path
          yield { line_nr, line, }
        ;null
    #.......................................................................................................
    ;null

#===========================================================================================================
materialized_file_mirror = ->
  db_path   = '/dev/shm/bricabrac.sqlite'
  phrases   = Dbric_phrases.open db_path
  debug 'Ωjzrsdb___6', phrases.teardown()
  debug 'Ωjzrsdb___7', phrases.rebuild()
  #.........................................................................................................
  do =>
    dskey = 'humdum'
    path  = PATH.resolve __dirname, '../../hengist-NG/assets/bricabrac/humpty-dumpty.md'
    phrases.statements.insert_datasource.run { dskey, path }
  #.........................................................................................................
  do =>
    dskey = 'mng'
    path  = PATH.resolve __dirname, '../../../io/mingkwai-rack/jzrds/meaning/meanings.txt'
    phrases.statements.insert_datasource.run { dskey, path }
  #.........................................................................................................
  debug 'Ωjzrsdb___8', "populate_file_mirror: ", phrases.statements.populate_file_mirror.run()
  debug 'Ωjzrsdb___9', "populate_keywords:    ", phrases.statements.populate_keywords.run()
  debug 'Ωjzrsdb__10', "count_datasources:    ", phrases.statements.count_datasources.get()
  debug 'Ωjzrsdb__11', "count_mirror_lines:   ", phrases.statements.count_mirror_lines.get()
  # echo(); echo row for row from phrases.statements.select_from_mirror.iterate()
  #.........................................................................................................
  echo(); echo row for row from phrases.statements.locations_from_keyword.iterate { keyword: 'thought', }
  echo(); echo row for row from phrases.statements.locations_from_keyword.iterate { keyword: 'she', }
  echo(); echo row for row from phrases.statements.locations_from_keyword.iterate { keyword: '廓', }
  echo(); echo row for row from phrases.statements.locations_from_keyword.iterate { keyword: '度', }
  #.........................................................................................................
  echo(); echo row for row from phrases.statements.lines_from_keyword.iterate { keyword: 'thought', }
  echo(); echo row for row from phrases.statements.lines_from_keyword.iterate { keyword: 'she', }
  echo(); echo row for row from phrases.statements.lines_from_keyword.iterate { keyword: '廓', }
  echo(); echo row for row from phrases.statements.lines_from_keyword.iterate { keyword: '度', }
  #.........................................................................................................
  ;null

#===========================================================================================================
write_line_data_to_sqlitefs = ->
  db_path   = PATH.resolve __dirname, '../../bvfs/bvfs.db'
  bvfs      = Dbric.open db_path
  #.........................................................................................................
  SQL"""
  where ( file_id = 2 )
  block_num
  data
  """
  #.........................................................................................................
  statement = bvfs.prepare SQL"""select * from data;"""
  echo(); echo row for row from statement.iterate()
  #.........................................................................................................
  ;null


#===========================================================================================================
demo_read_lines_from_buffers = ->
  { walk_buffers_with_positions,
    walk_lines_with_positions, } = SFMODULES.unstable.require_fast_linereader()
  path = PATH.resolve __dirname, '../package.json'
  for d from walk_buffers_with_positions path
    debug 'Ωjzrsdb__10', d
  for d from walk_lines_with_positions path, { chunk_size: 10, }
    debug 'Ωjzrsdb__10', d
  ;null

#===========================================================================================================
if module is require.main then do =>
  # materialized_file_mirror()
  # write_line_data_to_sqlitefs()
  demo_read_lines_from_buffers()
  ;null

