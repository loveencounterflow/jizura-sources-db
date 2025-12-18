

'use strict'


############################################################################################################
GUY                       = require 'guy'
{ debug
  info
  whisper
  warn
  urge
  help }                  = GUY.trm.get_loggers 'METTEUR/cli'
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


#===========================================================================================================
#
#-----------------------------------------------------------------------------------------------------------
@cli = ->
  #.........................................................................................................
  jobdefs =
    # meta:
    commands:
      #-----------------------------------------------------------------------------------------------------
      'help':
        runner: ( d ) =>
          debug '^690-1^', process.argv
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
      'info':
        description:  "show info on configuration settings &c"
        runner: ( d ) =>
          debug 'Ωjsdbcli___1', process.argv
          debug 'Ωjsdbcli___2', "info"
          { demo_show_all_tables, } = require './demo'
          demo_show_all_tables()
          # debug 'Ωjsdbcli___3', cfg
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
  cli_commands =
    use_pspg: "Ω command: use-pspg Ω"
  # echo cli_commands.use_pspg
  # echo "Ωjsdbcli___1 helo"
  # echo "Ωjsdbcli___1 line 2"
