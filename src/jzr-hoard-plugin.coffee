

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
# { f }                     = require '../../hengist-NG/apps/effstring'
# write                     = ( p ) -> process.stdout.write p
# { nfa }                   = require '../../hengist-NG/apps/normalize-function-arguments'
# GTNG                      = require '../../hengist-NG/apps/guy-test-NG'
# { Test                  } = GTNG
FS                        = require 'node:fs'
PATH                      = require 'node:path'
#-----------------------------------------------------------------------------------------------------------
{ SQL,
  from_bool,
  as_bool,              } = require '../../bricabrac-sfmodules/lib/dbric'
#-----------------------------------------------------------------------------------------------------------
{ dbric_hoard_plugin,   } = require '../../bricabrac-sfmodules/lib/intermission'
{ build,
  functions,
  statements,
  methods,              } = dbric_hoard_plugin.exports


#===========================================================================================================
# build.push SQL"create table yyy ( n integer )"

#===========================================================================================================
jzr_hoard_plugin =
  name:   'jzr_hoard_plugin'
  prefix: 'hrd'               ### NOTE informative, not enforced ###
  exports: {
    build,
    functions,
    statements,
    methods, }
  #   build: [
  #     SQL"create table nbr_numbers ( number integer );"
  #     ]
  #   statements:
  #     nbr_insert_number:          SQL"insert into nbr_numbers values ( $number );"
  #     nbr_select_numbers:         SQL"select * from nbr_numbers order by number;"
  #     nbr_select_square_numbers:  SQL"select nbr_square( number ) from nbr_numbers order by number;"
  #   functions:
  #     nbr_square:
  #       value: ( number ) -> @nbr_get_square number
  #   methods:
  #     nbr_get_square: ( number ) -> number ** 2



#===========================================================================================================
module.exports = { jzr_hoard_plugin, }

