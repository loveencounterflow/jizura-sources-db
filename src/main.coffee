

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
{ lets,
  freeze,                   } = SFMODULES.require_letsfreezethat_infra().simple
#...........................................................................................................
{ Jetstream,
  Async_jetstream,          } = SFMODULES.require_jetstream()
#...........................................................................................................
{ walk_lines_with_positions } = SFMODULES.unstable.require_fast_linereader()
#...........................................................................................................
{ Benchmarker,              } = SFMODULES.unstable.require_benchmarking()
benchmarker                   = new Benchmarker()
timeit                        = ( P... ) -> benchmarker.timeit P...
#...........................................................................................................
from_bool                     = ( x ) -> switch x
  when true  then 1
  when false then 0
  else throw new Error "Ωjzrsdb___1 expected true or false, got #{rpr x}"
as_bool                       = ( x ) -> switch x
  when 1 then true
  when 0 then false
  else throw new Error "Ωjzrsdb___2 expected 0 or 1, got #{rpr x}"

#===========================================================================================================
demo_source_identifiers = ->
  { expand_dictionary,      } = SFMODULES.require_dictionary_tools()
  { get_local_destinations, } = SFMODULES.require_get_local_destinations()
  for key, value of get_local_destinations()
    debug 'Ωjzrsdb___3', key, value
  # can append line numbers to files as in:
  # 'dict:meanings.1:L=13332'
  # 'dict:ucd140.1:uhdidx:L=1234'
  # rowids: 't:jfm:R=1'
  # {
  #   'dict:meanings':          '$jzrds/meaning/meanings.txt'
  #   'dict:ucd:v14.0:uhdidx' : '$jzrds/unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt'
  #   }

#===========================================================================================================
get_paths = ->
  R                               = {}
  R.base                          = PATH.resolve __dirname, '..'
  R.jzr                           = PATH.resolve R.base, '..'
  R.db                            = PATH.join R.base, 'jzr.db'
  # R.db                            = '/dev/shm/jzr.db'
  R.jzrds                         = PATH.join R.base, 'jzrds'
  R.jzrnewds                      = PATH.join R.jzr, 'jizura-new-datasources'
  R[ 'dict:meanings'          ]   = PATH.join R.jzrds, 'meaning/meanings.txt'
  R[ 'dict:ucd:v14.0:uhdidx'  ]   = PATH.join R.jzrds, 'unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt'
  R[ 'dict:hg-rom'            ]   = PATH.join R.jzrnewds, 'hangeul-transcriptions.tsv'
  return R



#===========================================================================================================
class Jzr_db_adapter extends Dbric

  #---------------------------------------------------------------------------------------------------------
  @db_class:  Bsql3
  @prefix:    'jzr'

  #---------------------------------------------------------------------------------------------------------
  constructor: ( db_path, cfg = {} ) ->
    ### TAINT need more clarity about when statements, build, initialize... is performed ###
    { host, } = cfg
    cfg       = lets cfg, ( cfg ) -> delete cfg.host
    #.......................................................................................................
    super db_path, cfg
    #.......................................................................................................
    @host     = host
    #.......................................................................................................
    ### TAINT this is not well placed ###
    debug 'Ωjzrsdb___4', ( @prepare SQL"select * from jzr_uc_normalization_faults where false;" ).get()
    #.......................................................................................................
    if @is_fresh
      @_on_open_populate_jzr_datasources()
      @_on_open_populate_jzr_mirror_verbs()
      @_on_open_populate_jzr_mirror_lcodes()
      @_on_open_populate_jzr_mirror_lines()
      @_on_open_populate_jzr_mirror_triples_for_meanings()
    else
      warn 'Ωjzrsdb___5', "skipped data insertion"
    #.......................................................................................................
    ;undefined

  #---------------------------------------------------------------------------------------------------------
  @build: [

    #.......................................................................................................
    SQL"""create table jzr_datasources (
        rowid     text    unique  not null,
        dskey     text    unique  not null,
        path      text            not null,
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
    SQL"""create view jzr_uc_normalization_faults as select
        ml.rowid  as rowid,
        ml.ref    as ref,
        ml.line   as line
      from jzr_mirror_lines as ml
      where true
        and ( not is_uc_normal( ml.line ) )
      order by ml.rowid;"""

    #.......................................................................................................
    SQL"""create table jzr_mirror_verbs (
        rowid     text    unique  not null,
        s         text            not null,
        v         text    unique  not null,
        o         text            not null,
      primary key ( rowid ),
      check ( rowid regexp '^t:mr:vb:V=[\\-:\\+\\p{L}]+$' ) );"""

    #.......................................................................................................
    SQL"""create table jzr_mirror_triples (
        rowid     text    unique  not null,
        ref       text            not null,
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
        on conflict ( dskey ) do update set path = excluded.path;"""

    #.......................................................................................................
    insert_jzr_mirror_verb: SQL"""
      insert into jzr_mirror_verbs ( rowid, s, v, o ) values ( $rowid, $s, $v, $o )
        on conflict ( rowid ) do update set s = excluded.s, v = excluded.v, o = excluded.o;"""

    #.......................................................................................................
    insert_jzr_mirror_lcode: SQL"""
      insert into jzr_mirror_lcodes ( rowid, lcode, comment ) values ( $rowid, $lcode, $comment )
        on conflict ( rowid ) do update set lcode = excluded.lcode, comment = excluded.comment;"""

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

    #.......................................................................................................
    populate_jzr_mirror_triples: SQL"""
      insert into jzr_mirror_triples ( rowid, ref, s, v, o )
        select
            gt.rowid_out    as rowid,
            gt.ref          as ref,
            gt.s            as s,
            gt.v            as v,
            gt.o            as o
          from jzr_mirror_lines                                                       as ml
          join get_triples( ml.rowid, ml.dskey, ml.field_1, ml.field_2, ml.field_3 )  as gt
          where true
            and ( ml.lcode = 'D' )
            -- and ( ml.dskey = 'dict:meanings' )
            and ( ml.field_1 is not null )
            and ( ml.field_1 not regexp '^@glyphs' )
            -- and ( ml.field_3 regexp '^(?:py|hi|ka):' )
        on conflict ( ref, s, v, o ) do nothing
        ;
      """

  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_mirror_lcodes: ->
    @statements.insert_jzr_mirror_lcode.run { rowid: 't:mr:lc:V=B', lcode: 'B', comment: 'blank line',   }
    @statements.insert_jzr_mirror_lcode.run { rowid: 't:mr:lc:V=C', lcode: 'C', comment: 'comment line', }
    @statements.insert_jzr_mirror_lcode.run { rowid: 't:mr:lc:V=D', lcode: 'D', comment: 'data line',    }
    ;null

  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_mirror_verbs: ->
    rows = [
      { rowid: 't:mr:vb:V=ko-Hang+Latn:initial',    s: "NN", v: 'ko-Hang+Latn:initial',   o: "NN", }
      { rowid: 't:mr:vb:V=ko-Hang+Latn:medial',     s: "NN", v: 'ko-Hang+Latn:medial',    o: "NN", }
      { rowid: 't:mr:vb:V=ko-Hang+Latn:final',      s: "NN", v: 'ko-Hang+Latn:final',     o: "NN", }
      { rowid: 't:mr:vb:V=reading:zh-Latn-pinyin',  s: "NN", v: 'reading:zh-Latn-pinyin', o: "NN", }
      { rowid: 't:mr:vb:V=reading:ja-x-Kan',        s: "NN", v: 'reading:ja-x-Kan',       o: "NN", }
      { rowid: 't:mr:vb:V=reading:ja-x-Hir',        s: "NN", v: 'reading:ja-x-Hir',       o: "NN", }
      { rowid: 't:mr:vb:V=reading:ja-x-Kat',        s: "NN", v: 'reading:ja-x-Kat',       o: "NN", }
      { rowid: 't:mr:vb:V=reading:ja-x-Latn',       s: "NN", v: 'reading:ja-x-Latn',      o: "NN", }
      { rowid: 't:mr:vb:V=reading:ko-Hang',         s: "NN", v: 'reading:ko-Hang',        o: "NN", }
      { rowid: 't:mr:vb:V=reading:ko-Latn',         s: "NN", v: 'reading:ko-Latn',        o: "NN", }
      ]
    for row in rows
      @statements.insert_jzr_mirror_verb.run row
    ;null

  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_datasources: ->
    paths = get_paths()
    dskey = 'dict:meanings';          @statements.insert_jzr_datasource.run { rowid: 't:ds:R=1', dskey, path: paths[ dskey ], }
    # dskey = 'dict:ucd:v14.0:uhdidx';  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=2', dskey, path: paths[ dskey ], }
    dskey = 'dict:hg-rom';            @statements.insert_jzr_datasource.run { rowid: 't:ds:R=3', dskey, path: paths[ dskey ], }
    ;null

  # #---------------------------------------------------------------------------------------------------------
  # _on_open_populate_verbs: ->
  #   paths = get_paths()
  #   dskey = 'dict:meanings';          @statements.insert_jzr_datasource.run { rowid: 't:ds:R=1', dskey, path: paths[ dskey ], }
  #   dskey = 'dict:ucd:v14.0:uhdidx';  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=2', dskey, path: paths[ dskey ], }
  #   ;null

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
    @_TMP_state = { triple_count: 0, }
    # me = @

  #=========================================================================================================
  @functions:

    #-------------------------------------------------------------------------------------------------------
    regexp:
      deterministic:  true
      call: ( pattern, text ) -> if ( ( new RegExp pattern, 'v' ).test text ) then 1 else 0

    #-------------------------------------------------------------------------------------------------------
    is_uc_normal:
      deterministic:  true
      ### NOTE: also see `String::isWellFormed()` ###
      call: ( text, form = 'NFC' ) -> from_bool text is text.normalize form ### 'NFC', 'NFD', 'NFKC', or 'NFKD' ###

  #=========================================================================================================
  @table_functions:

    #-------------------------------------------------------------------------------------------------------
    split_words:
      columns:      [ 'keyword', ]
      parameters:   [ 'line', ]
      rows: ( line ) ->
        keywords = line.split /(?:\p{Z}+)|((?:\p{Script=Han})|(?:\p{L}+)|(?:\p{N}+)|(?:\p{S}+))/v
        for keyword in keywords
          continue unless keyword?
          continue if keyword is ''
          yield { keyword, }
        ;null

    #-------------------------------------------------------------------------------------------------------
    file_lines:
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

    #-------------------------------------------------------------------------------------------------------
    get_triples:
      parameters:   [ 'rowid_in', 'dskey', 'field_1', 'field_2', 'field_3', 'field_4', ]
      columns:      [ 'rowid_out', 'ref', 's', 'v', 'o', ]
      rows: ( rowid_in, dskey, field_1, field_2, field_3, field_4 ) ->
        yield from @get_triples rowid_in, dskey, field_1, field_2, field_3, field_4
        ;null

  #---------------------------------------------------------------------------------------------------------
  get_triples: ( rowid_in, dskey, field_1, field_2, field_3, field_4 ) ->
    ref           = rowid_in
    s             = field_2
    v             = null
    o             = null
    entry         = field_3
    #.......................................................................................................
    switch true
      #...................................................................................................
      when ( dskey is 'dict:hg-rom' ) # and ( entry.startsWith 'py:' )
        debug 'Ωjzrsdb___6', { rowid_in, dskey, field_1, field_2, field_3, field_4, }
        role          = field_1
        v             = "hg-rom:#{role}"
        readings      = [ field_3, ]
      #...................................................................................................
      when ( dskey is 'dict:meanings' ) and ( entry.startsWith 'py:' )
        v         = 'zh_reading'
        readings  = @host.language_services.extract_atonal_zh_readings entry
      #...................................................................................................
      when ( dskey is 'dict:meanings' ) and ( ( entry.startsWith 'hi:' ) or ( entry.startsWith 'ka:' ) )
        v         = 'ja_reading'
        readings  = @host.language_services.extract_ja_readings entry
      #...................................................................................................
      when ( dskey is 'dict:meanings' ) and ( entry.startsWith 'hg:' )
        v         = 'hg_reading'
        readings  = @host.language_services.extract_hg_readings entry
    #.....................................................................................................
    if v?
      for reading in readings
        @_TMP_state.triple_count++
        rowid_out = "t:mr:3pl:R=#{@_TMP_state.triple_count}"
        o         = reading
        yield { rowid_out, ref, s, v, o, }
        @_TMP_state.timeit_progress?()
    #.......................................................................................................
    return null


#===========================================================================================================
class Language_services

  #---------------------------------------------------------------------------------------------------------
  constructor: ->
    @_TMP_hangeul = require 'hangul-disassemble'
    ;undefined

  #---------------------------------------------------------------------------------------------------------
  remove_pinyin_diacritics: ( text ) -> ( text.normalize 'NFKD' ).replace /\P{L}/gv, ''

  #---------------------------------------------------------------------------------------------------------
  extract_atonal_zh_readings: ( entry ) ->
    # py:zhù, zhe, zhāo, zháo, zhǔ, zī
    R = entry
    R = R.replace /^py:/v, ''
    R = R.split /,\s*/v
    R = ( ( @remove_pinyin_diacritics zh_reading ) for zh_reading in R )
    R = new Set R
    R.delete 'null'
    R.delete '@null'
    return [ R..., ]

  #---------------------------------------------------------------------------------------------------------
  extract_ja_readings: ( entry ) ->
    # 空      hi:そら, あ·(く|き|ける), から, す·(く|かす), むな·しい
    R = entry
    R = R.replace /^(?:hi|ka):/v, ''
    R = R.replace /\s+/gv, ''
    R = R.split /,\s*/v
    ### NOTE remove no-readings marker `@null` and contextual readings like -ネン for 縁, -ノウ for 王 ###
    R = ( reading for reading in R when not reading.startsWith '-' )
    R = new Set R
    R.delete 'null'
    R.delete '@null'
    return [ R..., ]

  #---------------------------------------------------------------------------------------------------------
  extract_hg_readings: ( entry ) ->
    # 空      hi:そら, あ·(く|き|ける), から, す·(く|かす), むな·しい
    R = entry
    R = R.replace /^(?:hg):/v, ''
    R = R.replace /\s+/gv, ''
    R = R.split /,\s*/v
    R = new Set R
    R.delete 'null'
    R.delete '@null'
    hangeul = [ R..., ].join ''
    # debug 'Ωjzrsdb___7', @_TMP_hangeul.disassemble hangeul, { flatten: false, }
    return [ R..., ]


#-----------------------------------------------------------------------------------------------------------
### TAINT goes into constructor of Jzr class ###

#===========================================================================================================
class Jizura

  #---------------------------------------------------------------------------------------------------------
  constructor: ->
    @paths              = get_paths()
    @language_services  = new Language_services()
    @dba                = new Jzr_db_adapter @paths.db, { host: @, }
    @populate_meaning_mirror_triples()
    ;undefined

  #---------------------------------------------------------------------------------------------------------
  populate_meaning_mirror_triples: ->
    { total_row_count, } = ( @dba.prepare SQL"""
      select
          count(*) as total_row_count
        from jzr_mirror_lines
        where true
          and ( dskey is 'dict:meanings' )
          and ( field_1 is not null )
          and ( not field_1 regexp '^@glyphs' );""" ).get()
    total = total_row_count * 2 ### NOTE estimate ###
    # { total_row_count, total, } = { total_row_count: 40086, total: 80172 } # !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    help 'Ωjzrsdb___8', { total_row_count, total, }
    #.......................................................................................................
    # brand = 'BRAND'
    # timeit { total, brand, }, populate_triples_1_connection = ({ progress, }) =>
    # @_TMP_state.timeit_progress = progress
    @dba.statements.populate_jzr_mirror_triples.run()
    # @_TMP_state.timeit_progress = null
    # ;null
    #.......................................................................................................
    ;null

  #---------------------------------------------------------------------------------------------------------
  show_normalization_faults: ->
    faulty_rows = ( @dba.prepare SQL"select * from jzr_uc_normalization_faults;" ).all()
    warn 'Ωjzrsdb___9', reverse faulty_rows
    # for row from
    #.......................................................................................................
    ;null

#===========================================================================================================
demo = ->
  jzr = new Jizura()
  jzr.show_normalization_faults()
  #.........................................................................................................
  ;null


#===========================================================================================================
if module is require.main then do =>
  demo()
  # demo_source_identifiers()
  ;null

