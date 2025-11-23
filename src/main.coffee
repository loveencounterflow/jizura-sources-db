

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
# FS                        = require 'node:fs'
PATH                      = require 'node:path'
#-----------------------------------------------------------------------------------------------------------
Bsql3                     = require 'better-sqlite3'
#-----------------------------------------------------------------------------------------------------------
SFMODULES                 = require '../../hengist-NG/apps/bricabrac-sfmodules'
#...........................................................................................................
{ Dbric,
  SQL,                      } = SFMODULES.unstable.require_dbric()
#...........................................................................................................
{ Jetstream,
  Async_jetstream,          } = SFMODULES.require_jetstream()
#...........................................................................................................
{ walk_lines_with_positions } = SFMODULES.unstable.require_fast_linereader()


#===========================================================================================================
get_paths = ->
  base      = PATH.resolve __dirname, '..'
  db        = PATH.join base, 'jzr.db'
  jzrds     = PATH.join base, 'jzrds'
  meanings  = PATH.join jzrds, 'meaning/meanings.txt'
  return {
    base,
    db,
    jzrds,
    meanings, }

#-----------------------------------------------------------------------------------------------------------
get_db = ->
  paths = get_paths()
  return Jzrbvfs.open paths.db


#===========================================================================================================
class Jzrbvfs extends Dbric

  #---------------------------------------------------------------------------------------------------------
  @db_class: Bsql3

  #---------------------------------------------------------------------------------------------------------
  @build: [

    #.......................................................................................................
    SQL"""create table jzr_datasources (
        dskey text unique not null,
        path text not null,
        primary key ( dskey ) );"""

    #.......................................................................................................
    SQL"""create table jzr_filemirror (
        dskey     text    not null,
        line_nr   integer not null,
        lcode     text    not null,
        line      text    not null,
        field_1   text        null,
        field_2   text        null,
        field_3   text        null,
        field_4   text        null,
        primary key ( dskey, line_nr ) );"""

    #.......................................................................................................
    SQL"""create table jzr_facets (
        dskey   text    not null,
        line_nr integer not null,
        fk      text    not null,
        fv      json    not null,
      foreign key ( dskey ) references jzr_datasources ( dskey ),
      primary key ( dskey, line_nr, fk, fv ) );"""

    #.......................................................................................................
    ]

  #---------------------------------------------------------------------------------------------------------
  @statements:

    #.......................................................................................................
    insert_jzr_datasource: SQL"""insert into jzr_datasources ( dskey, path ) values ( $dskey, $path )
      on conflict ( dskey ) do update set path = $path;"""

    #.......................................................................................................
    populate_jzr_filemirror: SQL"""
      insert into jzr_filemirror ( dskey, line_nr, lcode, line, field_1, field_2, field_3, field_4 )
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
      on conflict ( dskey, line_nr ) do update set line = excluded.line;
      """

  #---------------------------------------------------------------------------------------------------------
  @open: ( P... ) ->
    ### TAINT not a very nice solution ###
    ### TAINT need more clarity about when statements, build, initialize... is performed ###
    R = super P...
    R._on_open_populate_jzr_datasources()
    R._on_open_populate_jzr_filemirror()
    return R

  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_datasources: ->
    paths = get_paths()
    debug 'Ωjzrsdb___1', paths
    @statements.insert_jzr_datasource.run { dskey: 'dict/meanings/1', path: paths.meanings, }
    ;null

  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_filemirror: ->
    @statements.populate_jzr_filemirror.run()
    ;null

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
        # debug 'Ωjzrsdb___2', line_nr, rpr keywords
        for keyword in keywords
          continue unless keyword?
          continue if keyword is ''
          yield { keyword, }
        ;null
    #.......................................................................................................
    @create_table_function
      name:         'file_lines'
      columns:      [ 'line_nr', 'lcode', 'line', 'field_1', 'field_2', 'field_3', 'field_4', ]
      parameters:   [ 'path', ]
      rows: ( path ) ->
        for { lnr: line_nr, line, eol, } from walk_lines_with_positions path
          field_1 = field_2 = field_3 = field_4 = null
          switch true
            when /^\s*$/v.test line
              lcode = 'E'
            when /^\s*#/v.test line
              lcode = 'C'
            else
              lcode = 'D'
              [ field_1, field_2, field_3, field_4, ] = line.split '\t'
              field_1 ?= null
              field_2 ?= null
              field_3 ?= null
              field_4 ?= null
          yield { line_nr, lcode, line, field_1, field_2, field_3, field_4, }
        ;null
    #.......................................................................................................
    ;null

#===========================================================================================================
populate_meaning_facets = ->
  db = get_db()
  #.........................................................................................................
  ### TAINT a convoluted way to get a file path ###
  ### TAINT make an API call ###
  dskey = 'dict/meanings/1'
  for row from db.walk SQL"select * from jzr_datasources where dskey = $dskey;", { dskey, }
    meanings_path = row.path
    break
  #.........................................................................................................
  count = 0
  for { lnr: line_nr, line, } from walk_lines_with_positions meanings_path
    debug 'Ωjzrsdb___3', line_nr, rpr line
    count++
    break if count > 10
  #.........................................................................................................
  ;null



#===========================================================================================================
if module is require.main then do =>
  populate_meaning_facets()
  ;null

