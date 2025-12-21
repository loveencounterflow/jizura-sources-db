

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
# PATH                      = require 'node:path'
# FS                        = require 'fs-extra'
# CP                        = require 'node:child_process'
# H                         = require './helpers'
# types                     = require './types'
# { isa
#   validate }              = types
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
        # parameters:  [ 'query', ]
        flags:
          'query':
            alias:        'q'
            type:         String
            description:  "SQL query"
            positional:   true
        # allow_extra: true
        # plus: { query: 'select 1 as a;' }
        runner: ( d ) =>
          # debug 'Ωjsdbcli___2', d
          # debug 'Ωjsdbcli___3', d.verdict
          debug 'Ωjsdbcli___4', d.verdict.parameters.query
          { output_query_as_csv, } = require './demo'
          output_query_as_csv d.verdict.parameters.query
          # output_query_as_csv query
      #-----------------------------------------------------------------------------------------------------
      'info':
        description:  "show info on configuration settings &c"
        runner: ( d ) =>
          #   # multiple:     'greedy'
          debug 'Ωjsdbcli___5', process.argv
          debug 'Ωjsdbcli___6', "info"
          { demo_show_all_tables, } = require './demo'
          demo_show_all_tables()
          # debug 'Ωjsdbcli___7', cfg
          # cfg             = types.create.mtr_impose_cfg d.verdict.parameters
          # # await GUY.temp.with_directory { keep: true, }, ({ path }) ->
          # ### TAINT `cfg` key/value duplication ###
          # if cfg.tempdir?
          #   mkdirp.sync cfg.tempdir
          #   return await run_impose cfg
          # else
          #   do ( path = '/tmp/guy.temp--12229-ZUjUOVQEIZXI' ) ->
          #     cfg.tempdir = path
          #     return await run_impose cfg
          return null
        # flags:
        #   'layout':
        #     alias:        'l'
        #     type:         String
        #     description:  "name of a layout; defaults to 'pps16'"
          # 'input':
          #   alias:        'i'
          #   type:         String
          #   # positional:   true
          #   # multiple:     'greedy'
          #   description:  "input file (providing the individual pages)"
          # 'output':
          #   alias:        'o'
          #   type:         String
          #   # positional:   true
          #   description:  "output file (containing the booklet with multiple pages per sheet, front and back)"
          # 'overwrite':
          #   alias:        'y'
          #   type:         Boolean
          #   # positional:   true
          #   description:  "whether to overwrite output file"
          # 'split':
          #   # alias:        'y'
          #   type:         String
          #   # positional:   true
          #   description:  "use positive page nr or negative count to control insertion of empty pages"
          # 'tempdir':
          #   alias:        't'
          #   type:         String
          #   # positional:   true
          #   description:  "use the directory given to run TeX in instead of a temporary directory"
          # 'backdrop':
          #   alias:        'b'
          #   type:         String
          #   # positional:   true
          #   description:  "use the PDF or image given as a backdrop"
      #-----------------------------------------------------------------------------------------------------
      # 'tex':
      #   description:  "run XeLaTeX on tex/booklet.tex to produce tex/booklet.pdf"
        # runner: run_tex
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
