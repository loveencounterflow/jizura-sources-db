

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



#---------------------------------------------------------------------------------------------------------
TMP_eq = ( fn, matcher ) ->
  debug 'Ωjdsdb___1', fn()
  ;null

#---------------------------------------------------------------------------------------------------------
file_mirror_with_integrated_inserts = ->
  { Dbric,
    SQL,
    internals,                } = SFMODULES.unstable.require_dbric()
  Bsql3                         = require 'better-sqlite3'
  #=======================================================================================================
  class Dbric_phrases extends Dbric
    @db_class: Bsql3
    #-----------------------------------------------------------------------------------------------------
    @build: [
      #...................................................................................................
      SQL"""create table datasources (
          dskey text unique not null primary key,
          path text not null );"""
      #...................................................................................................
      SQL"""create view mirror as select
          *
        from
          datasources as ds,
          file_lines( ds.path ) as fl
        order by ds.dskey, fl.line_nr;"""
      #...................................................................................................
      SQL"""create table keywords (
          dskey   text    not null,
          line_nr integer not null,
          keyword text    not null,
        foreign key ( dskey ) references datasources ( dskey ),
        primary key ( dskey, line_nr, keyword ) );"""
      ]
    #-----------------------------------------------------------------------------------------------------
    @statements:
      #...................................................................................................
      insert_datasource: SQL"""insert into datasources ( dskey, path ) values ( $dskey, $path )
        on conflict ( dskey ) do update set path = $path;"""
      #...................................................................................................
      insert_keyword: SQL"""insert into keywords ( dskey, line_nr, keyword ) values ( $dskey, $line_nr, $keyword )
        on conflict ( dskey, line_nr, keyword ) do nothing;"""
      #...................................................................................................
      select_from_datasources: SQL"""select * from datasources order by dskey;"""
      #...................................................................................................
      select_from_keywords: SQL"""select * from keywords order by keyword, dskey, line_nr;"""
      locations_from_keyword: SQL"""select * from keywords
        where keyword = $keyword
        order by keyword, dskey, line_nr;"""
      #...................................................................................................
      select_from_mirror: SQL"""select * from mirror order by dskey;"""
      #...................................................................................................
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
    #-----------------------------------------------------------------------------------------------------
    initialize: ->
      super()
      #...................................................................................................
      @create_table_function
        name:           'split_words'
        columns:        [ 'keyword', ]
        parameters:     [ 'line', ]
        rows: ( line ) ->
          keywords = line.split /(?:\p{Z}+)|((?:\p{L}+)|(?:\p{N}+)|(?:\p{S}+))/v
          # debug 'Ωbbdbr___2', line_nr, rpr keywords
          for keyword in keywords
            continue unless keyword?
            continue if keyword is ''
            yield { keyword, }
          ;null
      #...................................................................................................
      @create_table_function
        name:         'file_lines'
        columns:      [ 'line_nr', 'line', ]
        parameters:   [ 'path', ]
        rows: ( path ) ->
          for { lnr: line_nr, line, eol, } from GUY.fs.walk_lines_with_positions path
            yield { line_nr, line, }
          ;null
      #...................................................................................................
      ;null
  #=======================================================================================================
  do =>
    db_path   = '/dev/shm/bricabrac.sqlite'
    phrases   = Dbric_phrases.open db_path
    debug 'Ωbbdbr___3', phrases.teardown()
    debug 'Ωbbdbr___4', phrases.rebuild()
    TMP_eq ( Ωbbdbr___5 = -> ( phrases.prepare SQL"""pragma foreign_keys""" ).get() ), { foreign_keys: 1,      }
    TMP_eq ( Ωbbdbr___6 = -> ( phrases.prepare SQL"""pragma journal_mode""" ).get() ), { journal_mode: 'wal',  }
    TMP_eq ( Ωbbdbr___7 = -> phrases.db instanceof Bsql3     ), true
    #.....................................................................................................
    do =>
      dskey = 'humdum'
      path  = PATH.resolve __dirname, '../../hengist-NG/assets/bricabrac/humpty-dumpty.md'
      phrases.statements.insert_datasource.run { dskey, path }
    #.....................................................................................................
    debug 'Ωbbdbr___8', phrases.statements.populate_keywords.run()
    #.....................................................................................................
    echo row for row from phrases.statements.locations_from_keyword.iterate { keyword: 'thought', }
    echo()
    rows = phrases.statements.locations_from_keyword.iterate { keyword: 'thought', }
    TMP_eq ( Ωbbdbr___9 = -> rows.next().value ), { dskey: 'humdum', line_nr: 15, keyword: 'thought' }
    TMP_eq ( Ωbbdbr__10 = -> rows.next().value ), { dskey: 'humdum', line_nr: 34, keyword: 'thought' }
    TMP_eq ( Ωbbdbr__11 = -> rows.next().value ), undefined
    #.....................................................................................................
    echo row for row from phrases.statements.locations_from_keyword.iterate { keyword: 'she', }
    echo()
    rows = phrases.statements.locations_from_keyword.iterate { keyword: 'she', }
    TMP_eq ( Ωbbdbr__12 = -> rows.next().value ), { dskey: 'humdum', line_nr: 2, keyword: 'she' }
    TMP_eq ( Ωbbdbr__13 = -> rows.next().value ), { dskey: 'humdum', line_nr: 3, keyword: 'she' }
    TMP_eq ( Ωbbdbr__14 = -> rows.next().value ), { dskey: 'humdum', line_nr: 4, keyword: 'she' }
    TMP_eq ( Ωbbdbr__15 = -> rows.next().value ), { dskey: 'humdum', line_nr: 5, keyword: 'she' }
    TMP_eq ( Ωbbdbr__16 = -> rows.next().value ), { dskey: 'humdum', line_nr: 15, keyword: 'she' }
    TMP_eq ( Ωbbdbr__17 = -> rows.next().value ), { dskey: 'humdum', line_nr: 17, keyword: 'she' }
    TMP_eq ( Ωbbdbr__18 = -> rows.next().value ), { dskey: 'humdum', line_nr: 18, keyword: 'she' }
    TMP_eq ( Ωbbdbr__19 = -> rows.next().value ), { dskey: 'humdum', line_nr: 26, keyword: 'she' }
    TMP_eq ( Ωbbdbr__20 = -> rows.next().value ), { dskey: 'humdum', line_nr: 34, keyword: 'she' }
    TMP_eq ( Ωbbdbr__21 = -> rows.next().value ), { dskey: 'humdum', line_nr: 36, keyword: 'she' }
    TMP_eq ( Ωbbdbr__22 = -> rows.next().value ), undefined
    #.....................................................................................................
    ;null
  #.......................................................................................................
  return null

file_mirror_with_integrated_inserts()

