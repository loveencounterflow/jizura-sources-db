

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
demo_source_identifiers = ->
  { expand_dictionary,      } = SFMODULES.require_dictionary_tools()
  { get_local_destinations, } = SFMODULES.require_get_local_destinations()
  for key, value of get_local_destinations()
    debug 'Ωjzrsdb___1', key, value
  # can append line numbers to files as in:
  # 'dict:meanings.1:L=13332'
  # 'dict:ucd140.1:uhdidx:L=1234'
  # rowids: 't:jfm:R=1'
  # aref: labels this proximal point in the data set as an origin
  # mref: identifies both the proximal and the distal end
  # zref: identifies the distal source of a piece of data
  # {
  #   'dict:meanings':          '$jzrds/meaning/meanings.txt'
  #   'dict:ucd:v14.0:uhdidx' : '$jzrds/unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt'
  #   }

#===========================================================================================================
get_paths = ->
  R                               = {}
  R.base                          = PATH.resolve __dirname, '..'
  R.db                            = PATH.join R.base, 'jzr.db'
  R.jzrds                         = PATH.join R.base, 'jzrds'
  R[ 'dict:meanings'          ]   = PATH.join R.jzrds, 'meaning/meanings.txt'
  R[ 'dict:ucd:v14.0:uhdidx'  ]   = PATH.join R.jzrds, 'unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt'
  return R

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
        rowid text        unique  not null,
        dskey text        unique  not null,
        path  text                not null,
      primary key ( rowid ),
      check ( rowid regexp '^t:ds:R=\\d+$'));"""

    #.......................................................................................................
    SQL"""create table jzr_mirror_lcodes (
        rowid     text    unique  not null,
        lcode     text    unique  not null,
        comment   text            not null,
      primary key ( rowid ),
      check ( lcode regexp '^[a-zA-Z]+[a-zA-Z0-9]*$' ),
      check ( rowid = 't:lc:V=' || lcode ) );"""

    #.......................................................................................................
    SQL"""create table jzr_mirror_lines (
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
      foreign key ( lcode ) references jzr_mirror_lcodes ( lcode ) );"""

    #.......................................................................................................
    SQL"""create table jzr_mirror_triples (
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
      );"""

    #.......................................................................................................
    ### aggregate table for all rowids goes here ###

    #.......................................................................................................
    ]

  #---------------------------------------------------------------------------------------------------------
  @statements:

    #.......................................................................................................
    insert_jzr_datasource: SQL"""
      insert into jzr_datasources ( rowid, dskey, path ) values ( $rowid, $dskey, $path )
        on conflict ( dskey ) do update set path = $path;"""

    #.......................................................................................................
    insert_jzr_mirror_lcode: SQL"""
      insert into jzr_mirror_lcodes ( rowid, lcode, comment ) values ( $rowid, $lcode, $comment )
        on conflict ( rowid ) do update set lcode = $lcode, comment = $comment;"""

    #.......................................................................................................
    insert_jzr_mirror_triple: SQL"""
      insert into jzr_mirror_triples ( rowid, ref, s, v, o ) values ( $rowid, $ref, $s, $v, $o )
        on conflict ( ref, s, v, o ) do nothing;"""

    #.......................................................................................................
    populate_jzr_mirror_lines: SQL"""
      insert into jzr_mirror_lines ( rowid, dskey, line_nr, lcode, line, field_1, field_2, field_3, field_4 )
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
      on conflict ( dskey, line_nr ) do update set line = excluded.line;
      """

  #---------------------------------------------------------------------------------------------------------
  @open: ( P... ) ->
    ### TAINT not a very nice solution ###
    ### TAINT need more clarity about when statements, build, initialize... is performed ###
    R = super P...
    if R.is_fresh
      R._on_open_populate_jzr_datasources()
      R._on_open_populate_jzr_mirror_lcodes()
      R._on_open_populate_jzr_mirror_lines()
      R._on_open_populate_jzr_mirror_triples_for_meanings()
    else
      warn 'Ωjzrsdb___2', "skipped data insertion"
      debug 'Ωjzrsdb___3', R.is_ready
      debug 'Ωjzrsdb___4', R.is_fresh
    return R

  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_datasources: ->
    paths = get_paths()
    dskey = 'dict:meanings';          @statements.insert_jzr_datasource.run { rowid: 't:ds:R=1', dskey, path: paths[ dskey ], }
    dskey = 'dict:ucd:v14.0:uhdidx';  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=2', dskey, path: paths[ dskey ], }
    ;null

  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_mirror_lcodes: ->
    @statements.insert_jzr_mirror_lcode.run { rowid: 't:lc:V=B', lcode: 'B', comment: 'blank line',   }
    @statements.insert_jzr_mirror_lcode.run { rowid: 't:lc:V=C', lcode: 'C', comment: 'comment line', }
    @statements.insert_jzr_mirror_lcode.run { rowid: 't:lc:V=D', lcode: 'D', comment: 'data line',    }
    ;null

  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_mirror_lines: ->
    @statements.populate_jzr_mirror_lines.run()
    ;null

  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_mirror_triples_for_meanings: ->
    # ;null

  #---------------------------------------------------------------------------------------------------------
  initialize: ->
    super()
    #.......................................................................................................
    @create_function
      name:           'regexp'
      deterministic:  true
      call: ( pattern, text ) -> if ( ( new RegExp pattern, 'v' ).test text ) then 1 else 0

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
      columns:      [ 'line_nr', 'lcode', 'line', 'field_1', 'field_2', 'field_3', 'field_4', ]
      parameters:   [ 'path', ]
      rows: ( path ) ->
        for { lnr: line_nr, line, eol, } from walk_lines_with_positions path
          field_1 = field_2 = field_3 = field_4 = null
          switch true
            when /^\s*$/v.test line
              lcode = 'B'
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
populate_meaning_mirror_triples = ->
  db = get_db()
  # #.........................................................................................................
  # ### TAINT a convoluted way to get a file path ###
  # ### TAINT make an API call ###
  # dskey = 'dict:meanings'
  # for row from db.walk SQL"select * from jzr_datasources where dskey = $dskey;", { dskey, }
  #   meanings_path = row.path
  #   break
  # #.........................................................................................................
  # count = 0
  # for { lnr: line_nr, line, } from walk_lines_with_positions meanings_path
  #   debug 'Ωjzrsdb___6', line_nr, rpr line
  #   count++
  #   break if count > 10
  #.........................................................................................................
  remove_pinyin_diacritics = ( text ) -> ( text.normalize 'NFKD' ).replace /\P{L}/gv, ''
  #.........................................................................................................
  extract_atonal_zh_readings = ( entry ) ->
    # py:zhù, zhe, zhāo, zháo, zhǔ, zī
    R = entry
    R = entry.replace /^py:/v, ''
    R = R.split /,\s*/v
    R = new Set ( remove_pinyin_diacritics zh_reading for zh_reading in R )
    return [ R..., ]
  #.........................................................................................................
  fn = ->
    row_count = 0
    #.......................................................................................................
    query = SQL"""
      select
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
        order by field_3;"""
    #.......................................................................................................
    for row from @walk query
      zh_readings = extract_atonal_zh_readings row.entry
      debug 'Ωjzrsdb___7', { row..., zh_readings, }
      #.....................................................................................................
      for zh_reading in zh_readings
        row_count++
        rowid = "t:mr:3pl:R=#{row_count}"
        ref   = row.rowid
        s     = row.chr
        v     = 'zh_reading'
        o     = zh_reading
        @w.statements.insert_jzr_mirror_triple.run { rowid, ref, s, v, o, }
    #.......................................................................................................
    ;null
  fn.call db
  # debug 'Ωjzrsdb___8', Array.from 'zì'.normalize 'NFC'
  # debug 'Ωjzrsdb___9', Array.from 'zì'.normalize 'NFKC'
  # debug 'Ωjzrsdb__10', Array.from 'zì'.normalize 'NFD'
  # debug 'Ωjzrsdb__11', Array.from 'zì'.normalize 'NFKD'
  #.........................................................................................................
  ;null



#===========================================================================================================
if module is require.main then do =>
  populate_meaning_mirror_triples()
  # demo_source_identifiers()

  # debug 'Ωjzrsdb__12', db = new Bsql3 ':memory:'
  # help 'Ωjzrsdb__13', row for row from ( db.prepare SQL"select 45 * 88;" ).iterate()
  # help 'Ωjzrsdb__14', row for row from ( db.prepare SQL"select 'abc' like 'a%';" ).iterate()
  # help 'Ωjzrsdb__15', row for row from ( db.prepare SQL"select 'abc' regexp '^a';" ).iterate()
  ;null

