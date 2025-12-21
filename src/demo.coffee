

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
  lime
  gold
  grey
  red
  bold
  reverse
  log     }               = GUY.trm
#-----------------------------------------------------------------------------------------------------------
SFMODULES                 = require 'bricabrac-sfmodules'
#-----------------------------------------------------------------------------------------------------------
{ SQL,
  from_bool,
  as_bool,              } = SFMODULES.unstable.require_dbric()
{ Jizura,               } = require './main'
{ Table, }                = SFMODULES.require_cli_table3a()
#-----------------------------------------------------------------------------------------------------------
{ f,                    } = require 'effstring'



#===========================================================================================================
###

oooooooooo.   oooooooooooo ooo        ooooo   .oooooo.
`888'   `Y8b  `888'     `8 `88.       .888'  d8P'  `Y8b
 888      888  888          888b     d'888  888      888
 888      888  888oooo8     8 Y88. .P  888  888      888
 888      888  888    "     8  `888'   888  888      888
 888     d88'  888       o  8    Y     888  `88b    d88'
o888bood8P'   o888ooooood8 o8o        o888o  `Y8bood8P'

                                                                                                         ###
#===========================================================================================================
demo = ->
  jzr = new Jizura()
  #.........................................................................................................
  # jzr._show_jzr_meta_uc_normalization_faults()
  jzr.show_counts()
  jzr.show_jzr_meta_faults()
  # v:c:reading:ja-x-Hir
  # v:c:reading:ja-x-Kat
  if false
    seen = new Set()
    for { reading, } from jzr.dba.walk SQL"select distinct( o ) as reading from jzr_triples where v = 'v:c:reading:ja-x-Kat' order by o;"
      for part in ( reading.split /(.ー|.ャ|.ュ|.ョ|ッ.|.)/v ) when part isnt ''
        continue if seen.has part
        seen.add part
        echo part
    for { reading, } from jzr.dba.walk SQL"select distinct( o ) as reading from jzr_triples where v = 'v:c:reading:ja-x-Hir' order by o;"
      for part in ( reading.split /(.ー|.ゃ|.ゅ|.ょ|っ.|.)/v ) when part isnt ''
      # for part in ( reading.split /(.)/v ) when part isnt ''
        continue if seen.has part
        seen.add part
        echo part
  #.........................................................................................................
  ;null

#-----------------------------------------------------------------------------------------------------------
demo_read_dump = ->
  { Benchmarker,          } = SFMODULES.unstable.require_benchmarking()
  # { nameit,               } = SFMODULES.require_nameit()
  benchmarker = new Benchmarker()
  timeit = ( P... ) -> benchmarker.timeit P...
  { Undumper,                   } = SFMODULES.require_sqlite_undumper()
  { walk_lines_with_positions,  } = SFMODULES.unstable.require_fast_linereader()
  { wc,                         } = SFMODULES.require_wc()
  path                            = PATH.resolve __dirname, '../jzr.dump.sql'
  jzr = new Jizura()
  jzr.dba.teardown { test: '*', }
  debug 'Ωjzrsdb___1', Undumper.undump { db: jzr.dba, path, mode: 'fast', }
  #.........................................................................................................
  jzr.show_counts()
  jzr.show_jzr_meta_faults()
  ;null

#-----------------------------------------------------------------------------------------------------------
demo_show_all_tables = ({ rows = 10, }={}) ->
  jzr = new Jizura()
  relations = {}
  for { name, type, } from jzr.dba.walk SQL"""
    select name, type
    from sqlite_schema
    where type in ( 'table', 'view' )
    -- order by name
    ;"""
    continue if name.startsWith 'std_'
    continue if name.startsWith '_jzr_meta_'
    continue if name.startsWith 'jzr_meta_'
    relations[ name ] = type
  #.........................................................................................................
  for relation_name, relation_type of relations
    row_count   = ( jzr.dba.get_first SQL"select count(*) as count from #{relation_name};" ).count
    statement   = jzr.dba.prepare SQL"""select * from #{relation_name} order by random() limit $rows;"""
    col_names   = ( column.name for column in jzr.dba.state.columns )
    caption     = f"#{relation_type} #{relation_name} (#{row_count}:,.0f; rows)"
    table       = new Table { caption, head: [ '', col_names..., ], }
    count       = 0
    #.......................................................................................................
    for row from jzr.dba.walk statement, { rows, }
      count++
      cells = []
      for col_name, col_idx in col_names
        cell = row[ col_name ]
        # cell = color cell if ( color = col_colors[ col_idx ] )?
        cells.push cell
      table.push table_row = [ "(#{count})", cells..., ]
    echo table.toString()
  #.........................................................................................................
  ;null

#-----------------------------------------------------------------------------------------------------------
output_query_as_csv = ( query ) ->
  CSV   = require 'csv-stringify/sync'
  jzr   = new Jizura()
  wout  = ( P... ) -> process.stdout.write P...;                            ;null
  woutn = ( P... ) -> process.stdout.write P...; process.stdout.write '\n'  ;null
  werr  = ( P... ) -> process.stderr.write P...;                            ;null
  werrn = ( P... ) -> process.stderr.write P...; process.stderr.write '\n'  ;null
  # query = process.argv[ 2 ] ? null
  if ( not query? ) or ( query is '' )
    werrn reverse red " Ωjzrsdb___8 no query given "
    process.exit 111
    return null
  rows  = jzr.dba.get_all query
  # woutn cli_commands.use_pspg
  wout CSV.stringify [ ( column.name for column in jzr.dba.state.columns ), ]
  wout CSV.stringify rows
  ;null


#===========================================================================================================
module.exports = { demo_show_all_tables, output_query_as_csv, }


#===========================================================================================================
if module is require.main then do =>
  # demo_read_dump()
  # demo()
  demo_show_all_tables()
  # demo_csv_output()
  # ;null


  # cfg =
  #   head: Array.from 'abcdefghijklmno'
  #   # colWidths: [ 10, 20, ]
  # table = new Table cfg
  # # table.push ['First value 1', 'Second value 2'], ['First value 3', 'Second value 4']
  # # table.push [ { a: 'A', b: 'B', c: 'C', } ]
  # table.push [ 'A', { f: 7, }, undefined, 423423423422122434, ]
  # # echo table
  # echo table.toString()
