

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
    commands:
      #-----------------------------------------------------------------------------------------------------
      'help':
        runner: ( d ) =>
          debug 'Ωjsdbcli___1', process.argv
          echo lime """jzrdb: produce and show CJK compositional data"""
          echo blue """
            Usage:
              jzrdb $command [flags]
                --input       -i
                --overwrite   -y
                --output      -o
                --split
                --tempdir     -t
            """
      #-----------------------------------------------------------------------------------------------------
      'query':
        description:  "run an SQL query"
        flags:
          'query':
            alias:        'q'
            type:         String
            description:  "SQL query"
            positional:   true
        runner: ( d ) =>
          { output_query_as_csv, } = require './demo'
          output_query_as_csv d.verdict.parameters.query
      #-----------------------------------------------------------------------------------------------------
      'info':
        description:  "show info on configuration settings &c"
        runner: ( d ) =>
          { demo_show_all_tables, } = require './demo'
          return null
  #.........................................................................................................
  MIXA.run jobdefs, process.argv
  return null



############################################################################################################
if module is require.main then do =>
  # await @cli()
  @cli()
  # cli_commands =
  #   use_pspg: "Ω command: use-pspg Ω"
  # echo cli_commands.use_pspg
  # echo "Ωjsdbcli___8 helo"
  # echo "Ωjsdbcli___9 line 2"
