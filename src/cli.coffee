

'use strict'


############################################################################################################
GUY                       = require 'guy'
{ debug
  info
  whisper
  warn
  urge
  help }                  = GUY.trm.get_loggers 'jzr/cli'
{ rpr
  echo }                  = GUY.trm
#...........................................................................................................
{ reverse,
  lime,
  blue,
  gold,
  red,                  } = GUY.trm
#...........................................................................................................
MIXA                      = require 'mixa'
{ Jizura,               } = require './main'


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@cli = ->
  #.........................................................................................................
  jobdefs =
    meta:
      'pager':
        alias:        'p'
        type:         Boolean
        description:  "use pager"
      'rebuild':
        alias:        'r'
        type:         Boolean
        description:  "rebuild before command"
    commands:
      #-----------------------------------------------------------------------------------------------------
      'help':
        runner: ( d ) =>
          debug 'Ωjsdbcli___1', process.argv
          echo lime """jzrdb: produce and show CJK compositional data"""
          echo blue """
            Usage:
              jzrdb [meta] $command [flags] [argument]

                meta:
                  --pager / -p -- use pspg to page output
                  --rebuild / -r -- rebuild DB before executing command

                command:

                  query -- send an SQL query
                    --table / -t output as formatted CLI table (CSV otherwise)
                    --query / -q / positional argument -- the query (required)

                  info -- show an overview of tables and views
                    --rows / -n -- number of rows to show
            """
      #-----------------------------------------------------------------------------------------------------
      'query':
        description:  "run an SQL query"
        flags:
          'table':
            alias:        't'
            type:         Boolean
            description:  "tabular format"
            positional:   false
          'query':
            alias:        'q'
            type:         String
            description:  "SQL query"
            positional:   true
        runner: ( d ) =>
          ### TAINT bug in MIXA hides meta flags ###
          rebuild                   = ( '--rebuild' in process.argv ) or ( '-r' in process.argv )
          { output_query_as_table,
            output_query_as_csv,  } = require './demo'
          if d.verdict.parameters.table then  output_query_as_table d.verdict.parameters.query, { rebuild, }
          else                                output_query_as_csv   d.verdict.parameters.query, { rebuild, }
      #-----------------------------------------------------------------------------------------------------
      'info':
        description:  "show info on configuration settings &c"
        flags:
          'rows':
            alias:        'n'
            type:         Number
            description:  "number of rows"
        runner: ( d ) =>
          ### TAINT bug in MIXA hides meta flags ###
          rebuild                   = ( '--rebuild' in process.argv ) or ( '-r' in process.argv )
          { demo_show_all_tables, } = require './demo'
          { rows,                 } = d.verdict.parameters
          demo_show_all_tables { rebuild, rows, }
          return null
  #.........................................................................................................
  MIXA.run jobdefs, process.argv
  return null



############################################################################################################
if module is require.main then do =>
  @cli()
