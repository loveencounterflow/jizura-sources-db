(function() {
  'use strict';
  // ############################################################################################################
  // GUY                       = require 'guy'
  // { debug
  //   info
  //   whisper
  //   warn
  //   urge
  //   help }                  = GUY.trm.get_loggers 'METTEUR/cli'
  // { rpr
  //   echo }                  = GUY.trm
  // #...........................................................................................................
  // PATH                      = require 'node:path'
  // FS                        = require 'fs-extra'
  // CP                        = require 'node:child_process'
  // H                         = require './helpers'
  // types                     = require './types'
  // { isa
  //   validate }              = types
  // MIXA                      = require 'mixa'
  // GUY                       = require 'guy'
  // { lime
  //   blue
  //   grey }                  = GUY.trm
  // { Metteur }               = require './main'
  // { to_width }              = require 'to-width'
  // deep_copy                 = ( require 'rfdc' ) { proto: true, circles: false, }
  // $$                        = ( P... ) -> ( await $ P... ).stdout.trim()
  // mkdirp                    = require 'mkdirp'
  // TMP_MYSTERY_EMPTY_PGE_NR  = 0  # ???
  // TMP_MYSTERY_EMPTY_PGE_NR  = -1 # ???

  // #-----------------------------------------------------------------------------------------------------------
  // resolve = ( P... ) ->
  //   return PATH.resolve PATH.join P... if P[ 0 ].startsWith '/'
  //   return PATH.resolve PATH.join process.env.cwd, P...

  // #-----------------------------------------------------------------------------------------------------------
  // run_tex_etc = ( cfg ) ->
  //   cfg.tex_target_path   = resolve cfg.tempdir, 'booklet.tex'
  //   cfg.tex_pdf_path      = resolve cfg.tempdir, 'booklet.pdf'
  //   FS.writeFileSync cfg.tex_target_path, cfg.imposition
  //   whisper "wrote imposition to #{cfg.tex_target_path}"
  //   await _run_tex cfg
  //   if FS.pathExistsSync cfg.tex_pdf_path
  //     FS.moveSync cfg.tex_pdf_path, cfg.output, { overwrite: cfg.overwrite, }
  //     help "wrote output to #{cfg.output}"
  //   else
  //     warn GUY.trm.reverse " ^metteur/cli@34^ no output produced "
  //     process.exit 1
  //   return null

  // #-----------------------------------------------------------------------------------------------------------
  // new_hash          = -> ( require 'crypto' ).createHash 'sha1'
  // digest_from_path  = ( path ) -> ( new_hash().update FS.readFileSync path ).digest 'hex'

  // #-----------------------------------------------------------------------------------------------------------
  // path_from_executable_name = ( name ) ->
  //   await import( 'zx/globals' )
  //   try return await $$"""command -v #{name}""" catch error
  //     warn "^6456^", """
  //       unable to locate #{name};
  //       please refer to [section *External Dependencies*](https://github.com/loveencounterflow/metteur#external-dependencies) in the README.md"""
  //     throw error

  // #-----------------------------------------------------------------------------------------------------------
  // _run_tex = ( cfg ) ->
  //   paths =
  //     xelatex: await path_from_executable_name 'xelatex'
  //   #---------------------------------------------------------------------------------------------------------
  //   cd cfg.tempdir
  //   ### TAINT use loop, check *.aux for changes ###
  //   log_path    = PATH.join cfg.tempdir, 'xelatex-output'
  //   aux_path    = PATH.join cfg.tempdir, 'booklet.aux'
  //   ### TAINT this method has the drawback that we always run at least twice ###
  //   new_digest  = null
  //   old_digest  = null
  //   loop
  //     try
  //       await $"""time #{paths.xelatex} -output-driver="xdvipdfmx -i dvipdfmx-unsafe.cfg -q -E" -synctex=1 -interaction=nonstopmode booklet.tex > xelatex-output"""
  //       # await $"""time #{paths.xelatex} booklet.tex > xelatex-output"""
  //       # await $"""time #{paths.xelatex} --halt-on-error booklet.tex > xelatex-output"""
  //     catch error
  //       echo FS.readFileSync log_path, { encoding: 'utf-8', }
  //       warn error.exitCode
  //       throw error
  //     break if ( new_digest = digest_from_path aux_path ) is old_digest
  //     old_digest = new_digest
  //   return null

  // #-----------------------------------------------------------------------------------------------------------
  // show_cfg = ( cfg ) ->
  //   whisper()
  //   # whisper "#{to_width "#{key}:", 20} #{value}" for key, value of cfg
  //   console.table ( { key, value, } for key, value of cfg )
  //   whisper()
  //   return null

  // #-----------------------------------------------------------------------------------------------------------
  // fetch_pdf_info = ( cfg ) ->
  //   await import( 'zx/globals' )
  //   verbose       = $.verbose; $.verbose = false
  //   pdfinfo_path  = await path_from_executable_name 'pdfinfo'
  //   stdout        = ( await $"#{pdfinfo_path} #{cfg.input}" ).stdout.trim()
  //   R             = {}
  //   #.........................................................................................................
  //   for line in stdout.split /\n/
  //     continue unless ( match = line.match /^(?<key>[^:]+):\s*(?<value>.*)$/ )?
  //     key   = match.groups.key.toLowerCase()
  //     value = match.groups.value
  //     switch key
  //       when 'pages'
  //         R.pagecount = parseInt value, 10
  //       when 'page size'
  //         unless ( submatch = value.match /(?<page_width>[\d.]+)\s*x\s*(?<page_height>[\d.]+)\s*pts/ )?
  //           warn "^33847^ unable to parse #{rpr line}"
  //           R.page_width  = 210
  //           R.page_height = 297
  //           continue
  //         R.page_width  = H.mm_from_pt parseFloat submatch.groups.page_width
  //         R.page_height = H.mm_from_pt parseFloat submatch.groups.page_height
  //       else
  //         null
  //   #.........................................................................................................
  //   $.verbose = verbose
  //   info '^690-1^', "PDF: #{rpr R}"
  //   return R

  // #-----------------------------------------------------------------------------------------------------------
  // fetch_pagedistro = ( cfg ) ->
  //   Object.assign cfg, await fetch_pdf_info cfg
  //   cfg.sheetcount      = cfg.pagecount // cfg.layout.pps
  //   remainder           = cfg.pagecount %% cfg.layout.pps
  //   cfg.sheetcount++ if remainder isnt 0
  //   cfg.blank_pagecount = cfg.layout.pps - remainder
  //   R                   = [ 1 .. cfg.pagecount ]
  //   return R if cfg.blank_pagecount is 0
  //   split               = deep_copy cfg.mtr_split
  //   #.........................................................................................................
  //   ### turn RPNRs into LPNRs ###
  //   ### TAINT correct or complain about PNRs outside the allowed range ###
  //   for d in split
  //     if isa.negative d.pnr
  //       d.pnr = cfg.pagecount + d.pnr
  //   #.........................................................................................................
  //   inserts = {}
  //   bpc     = cfg.blank_pagecount
  //   loop
  //     break if bpc < 0
  //     for d in split
  //       continue if d.count <= 0
  //       bpc--
  //       break if bpc < 0
  //       d.count--
  //       inserts[ d.pnr ] = ( inserts[ d.pnr ] ?= 0 ) + 1
  //   #.........................................................................................................
  //   R = ( [ pnr, ] for pnr in R )
  //   for pnr_txt, count of inserts
  //     pnr = parseInt pnr_txt, 10
  //     idx = pnr - 1
  //     # ### thx to https://2ality.com/2018/12/creating-arrays.html#creating-ranges-of-integer-values ###
  //     # R[ idx ].push Array.from { length, }, ( _, i ) -> -1
  //     # R[ idx ].push -1 for _ in [ 1 .. count ]
  //     # R[ idx ].push 0 for _ in [ 1 .. count ]
  //     R[ idx ].push ( TMP_MYSTERY_EMPTY_PGE_NR = 2 ) for _ in [ 1 .. count ]
  //   R = R.flat()
  //   #.........................................................................................................
  //   return R

  // #-----------------------------------------------------------------------------------------------------------
  // run_impose = ( cfg ) ->
  //   ### TAINT should normalize path ###
  //   ### TAINT inconsistent naming ###
  //   cfg.bdp_path          = cfg.backdrop
  //   # cfg.bdp_path          = resolve cfg.tempdir, 'backdrop.pdf'
  //   cfg.mtr_split         = types.data.mtr_split
  //   cfg.input             = resolve cfg.input
  //   cfg.output            = resolve cfg.output
  //   cfg.pagedistro        = await fetch_pagedistro cfg
  //   cfg.ovl_path          = resolve cfg.tempdir, 'overlay.pdf'
  //   debug '^3553^', { pagedistro: cfg.pagedistro, }
  //   show_cfg cfg
  //   mtr                   = new Metteur()
  //   cfg.imposition        = await mtr._impose cfg
  //   # process.exit 111
  //   await run_tex_etc cfg
  //   return null

  // #===========================================================================================================
  // #
  // #-----------------------------------------------------------------------------------------------------------
  // @cli = ->
  //   #.........................................................................................................
  //   jobdefs =
  //     # meta:
  //     commands:
  //       #-----------------------------------------------------------------------------------------------------
  //       'help':
  //         runner: ( d ) =>
  //           debug '^690-1^', process.argv
  //           echo lime """Metteur: produce impositions for booklets with 4, 8 or 16 pages arranged on one sheet"""
  //           echo blue """
  //             Usage:
  //               metteur impose [flags]
  //                 --input       -i
  //                 --overwrite   -y
  //                 --output      -o
  //                 --split
  //                 --tempdir     -t
  //             """
  //       #-----------------------------------------------------------------------------------------------------
  //       'impose':
  //         description:  "assemble pages from one PDF file into a new PDF, to be folded into a booklet"
  //         runner: ( d ) =>
  //           cfg             = types.create.mtr_impose_cfg d.verdict.parameters
  //           # await GUY.temp.with_directory { keep: true, }, ({ path }) ->
  //           ### TAINT `cfg` key/value duplication ###
  //           if cfg.tempdir?
  //             mkdirp.sync cfg.tempdir
  //             return await run_impose cfg
  //           else
  //             do ( path = '/tmp/guy.temp--12229-ZUjUOVQEIZXI' ) ->
  //               cfg.tempdir = path
  //               return await run_impose cfg
  //           return null
  //         flags:
  //           'layout':
  //             alias:        'l'
  //             type:         String
  //             description:  "name of a layout; defaults to 'pps16'"
  //           'input':
  //             alias:        'i'
  //             type:         String
  //             # positional:   true
  //             # multiple:     'greedy'
  //             description:  "input file (providing the individual pages)"
  //           'output':
  //             alias:        'o'
  //             type:         String
  //             # positional:   true
  //             description:  "output file (containing the booklet with multiple pages per sheet, front and back)"
  //           'overwrite':
  //             alias:        'y'
  //             type:         Boolean
  //             # positional:   true
  //             description:  "whether to overwrite output file"
  //           'split':
  //             # alias:        'y'
  //             type:         String
  //             # positional:   true
  //             description:  "use positive page nr or negative count to control insertion of empty pages"
  //           'tempdir':
  //             alias:        't'
  //             type:         String
  //             # positional:   true
  //             description:  "use the directory given to run TeX in instead of a temporary directory"
  //           'backdrop':
  //             alias:        'b'
  //             type:         String
  //             # positional:   true
  //             description:  "use the PDF or image given as a backdrop"
  //       #-----------------------------------------------------------------------------------------------------
  //       # 'tex':
  //       #   description:  "run XeLaTeX on tex/booklet.tex to produce tex/booklet.pdf"
  //         # runner: run_tex
  //   #.........................................................................................................
  //   MIXA.run jobdefs, process.argv
  //   return null

  //###########################################################################################################
  if (module === require.main) {
    (() => {
      // await demo_receiver()
      // await @cli()
      return process.stdout.write('helo,world\n1,2\n');
    })();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7RUFBQSxhQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFvUkEsSUFBRyxNQUFBLEtBQVUsT0FBTyxDQUFDLElBQXJCO0lBQWtDLENBQUEsQ0FBQSxDQUFBLEdBQUEsRUFBQTs7O2FBR2hDLE9BQU8sQ0FBQyxNQUFNLENBQUMsS0FBZixDQUFxQixtQkFBckI7SUFIZ0MsQ0FBQSxJQUFsQzs7QUFwUkEiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuJ3VzZSBzdHJpY3QnXG5cblxuIyAjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbiMgR1VZICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2d1eSdcbiMgeyBkZWJ1Z1xuIyAgIGluZm9cbiMgICB3aGlzcGVyXG4jICAgd2FyblxuIyAgIHVyZ2VcbiMgICBoZWxwIH0gICAgICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ01FVFRFVVIvY2xpJ1xuIyB7IHJwclxuIyAgIGVjaG8gfSAgICAgICAgICAgICAgICAgID0gR1VZLnRybVxuIyAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgUEFUSCAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6cGF0aCdcbiMgRlMgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2ZzLWV4dHJhJ1xuIyBDUCAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpjaGlsZF9wcm9jZXNzJ1xuIyBIICAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9oZWxwZXJzJ1xuIyB0eXBlcyAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi90eXBlcydcbiMgeyBpc2FcbiMgICB2YWxpZGF0ZSB9ICAgICAgICAgICAgICA9IHR5cGVzXG4jIE1JWEEgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdtaXhhJ1xuIyBHVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xuIyB7IGxpbWVcbiMgICBibHVlXG4jICAgZ3JleSB9ICAgICAgICAgICAgICAgICAgPSBHVVkudHJtXG4jIHsgTWV0dGV1ciB9ICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL21haW4nXG4jIHsgdG9fd2lkdGggfSAgICAgICAgICAgICAgPSByZXF1aXJlICd0by13aWR0aCdcbiMgZGVlcF9jb3B5ICAgICAgICAgICAgICAgICA9ICggcmVxdWlyZSAncmZkYycgKSB7IHByb3RvOiB0cnVlLCBjaXJjbGVzOiBmYWxzZSwgfVxuIyAkJCAgICAgICAgICAgICAgICAgICAgICAgID0gKCBQLi4uICkgLT4gKCBhd2FpdCAkIFAuLi4gKS5zdGRvdXQudHJpbSgpXG4jIG1rZGlycCAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdta2RpcnAnXG4jIFRNUF9NWVNURVJZX0VNUFRZX1BHRV9OUiAgPSAwICAjID8/P1xuIyBUTVBfTVlTVEVSWV9FTVBUWV9QR0VfTlIgID0gLTEgIyA/Pz9cblxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyByZXNvbHZlID0gKCBQLi4uICkgLT5cbiMgICByZXR1cm4gUEFUSC5yZXNvbHZlIFBBVEguam9pbiBQLi4uIGlmIFBbIDAgXS5zdGFydHNXaXRoICcvJ1xuIyAgIHJldHVybiBQQVRILnJlc29sdmUgUEFUSC5qb2luIHByb2Nlc3MuZW52LmN3ZCwgUC4uLlxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBydW5fdGV4X2V0YyA9ICggY2ZnICkgLT5cbiMgICBjZmcudGV4X3RhcmdldF9wYXRoICAgPSByZXNvbHZlIGNmZy50ZW1wZGlyLCAnYm9va2xldC50ZXgnXG4jICAgY2ZnLnRleF9wZGZfcGF0aCAgICAgID0gcmVzb2x2ZSBjZmcudGVtcGRpciwgJ2Jvb2tsZXQucGRmJ1xuIyAgIEZTLndyaXRlRmlsZVN5bmMgY2ZnLnRleF90YXJnZXRfcGF0aCwgY2ZnLmltcG9zaXRpb25cbiMgICB3aGlzcGVyIFwid3JvdGUgaW1wb3NpdGlvbiB0byAje2NmZy50ZXhfdGFyZ2V0X3BhdGh9XCJcbiMgICBhd2FpdCBfcnVuX3RleCBjZmdcbiMgICBpZiBGUy5wYXRoRXhpc3RzU3luYyBjZmcudGV4X3BkZl9wYXRoXG4jICAgICBGUy5tb3ZlU3luYyBjZmcudGV4X3BkZl9wYXRoLCBjZmcub3V0cHV0LCB7IG92ZXJ3cml0ZTogY2ZnLm92ZXJ3cml0ZSwgfVxuIyAgICAgaGVscCBcIndyb3RlIG91dHB1dCB0byAje2NmZy5vdXRwdXR9XCJcbiMgICBlbHNlXG4jICAgICB3YXJuIEdVWS50cm0ucmV2ZXJzZSBcIiBebWV0dGV1ci9jbGlAMzReIG5vIG91dHB1dCBwcm9kdWNlZCBcIlxuIyAgICAgcHJvY2Vzcy5leGl0IDFcbiMgICByZXR1cm4gbnVsbFxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBuZXdfaGFzaCAgICAgICAgICA9IC0+ICggcmVxdWlyZSAnY3J5cHRvJyApLmNyZWF0ZUhhc2ggJ3NoYTEnXG4jIGRpZ2VzdF9mcm9tX3BhdGggID0gKCBwYXRoICkgLT4gKCBuZXdfaGFzaCgpLnVwZGF0ZSBGUy5yZWFkRmlsZVN5bmMgcGF0aCApLmRpZ2VzdCAnaGV4J1xuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBwYXRoX2Zyb21fZXhlY3V0YWJsZV9uYW1lID0gKCBuYW1lICkgLT5cbiMgICBhd2FpdCBpbXBvcnQoICd6eC9nbG9iYWxzJyApXG4jICAgdHJ5IHJldHVybiBhd2FpdCAkJFwiXCJcImNvbW1hbmQgLXYgI3tuYW1lfVwiXCJcIiBjYXRjaCBlcnJvclxuIyAgICAgd2FybiBcIl42NDU2XlwiLCBcIlwiXCJcbiMgICAgICAgdW5hYmxlIHRvIGxvY2F0ZSAje25hbWV9O1xuIyAgICAgICBwbGVhc2UgcmVmZXIgdG8gW3NlY3Rpb24gKkV4dGVybmFsIERlcGVuZGVuY2llcypdKGh0dHBzOi8vZ2l0aHViLmNvbS9sb3ZlZW5jb3VudGVyZmxvdy9tZXR0ZXVyI2V4dGVybmFsLWRlcGVuZGVuY2llcykgaW4gdGhlIFJFQURNRS5tZFwiXCJcIlxuIyAgICAgdGhyb3cgZXJyb3JcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgX3J1bl90ZXggPSAoIGNmZyApIC0+XG4jICAgcGF0aHMgPVxuIyAgICAgeGVsYXRleDogYXdhaXQgcGF0aF9mcm9tX2V4ZWN1dGFibGVfbmFtZSAneGVsYXRleCdcbiMgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jICAgY2QgY2ZnLnRlbXBkaXJcbiMgICAjIyMgVEFJTlQgdXNlIGxvb3AsIGNoZWNrICouYXV4IGZvciBjaGFuZ2VzICMjI1xuIyAgIGxvZ19wYXRoICAgID0gUEFUSC5qb2luIGNmZy50ZW1wZGlyLCAneGVsYXRleC1vdXRwdXQnXG4jICAgYXV4X3BhdGggICAgPSBQQVRILmpvaW4gY2ZnLnRlbXBkaXIsICdib29rbGV0LmF1eCdcbiMgICAjIyMgVEFJTlQgdGhpcyBtZXRob2QgaGFzIHRoZSBkcmF3YmFjayB0aGF0IHdlIGFsd2F5cyBydW4gYXQgbGVhc3QgdHdpY2UgIyMjXG4jICAgbmV3X2RpZ2VzdCAgPSBudWxsXG4jICAgb2xkX2RpZ2VzdCAgPSBudWxsXG4jICAgbG9vcFxuIyAgICAgdHJ5XG4jICAgICAgIGF3YWl0ICRcIlwiXCJ0aW1lICN7cGF0aHMueGVsYXRleH0gLW91dHB1dC1kcml2ZXI9XCJ4ZHZpcGRmbXggLWkgZHZpcGRmbXgtdW5zYWZlLmNmZyAtcSAtRVwiIC1zeW5jdGV4PTEgLWludGVyYWN0aW9uPW5vbnN0b3Btb2RlIGJvb2tsZXQudGV4ID4geGVsYXRleC1vdXRwdXRcIlwiXCJcbiMgICAgICAgIyBhd2FpdCAkXCJcIlwidGltZSAje3BhdGhzLnhlbGF0ZXh9IGJvb2tsZXQudGV4ID4geGVsYXRleC1vdXRwdXRcIlwiXCJcbiMgICAgICAgIyBhd2FpdCAkXCJcIlwidGltZSAje3BhdGhzLnhlbGF0ZXh9IC0taGFsdC1vbi1lcnJvciBib29rbGV0LnRleCA+IHhlbGF0ZXgtb3V0cHV0XCJcIlwiXG4jICAgICBjYXRjaCBlcnJvclxuIyAgICAgICBlY2hvIEZTLnJlYWRGaWxlU3luYyBsb2dfcGF0aCwgeyBlbmNvZGluZzogJ3V0Zi04JywgfVxuIyAgICAgICB3YXJuIGVycm9yLmV4aXRDb2RlXG4jICAgICAgIHRocm93IGVycm9yXG4jICAgICBicmVhayBpZiAoIG5ld19kaWdlc3QgPSBkaWdlc3RfZnJvbV9wYXRoIGF1eF9wYXRoICkgaXMgb2xkX2RpZ2VzdFxuIyAgICAgb2xkX2RpZ2VzdCA9IG5ld19kaWdlc3RcbiMgICByZXR1cm4gbnVsbFxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBzaG93X2NmZyA9ICggY2ZnICkgLT5cbiMgICB3aGlzcGVyKClcbiMgICAjIHdoaXNwZXIgXCIje3RvX3dpZHRoIFwiI3trZXl9OlwiLCAyMH0gI3t2YWx1ZX1cIiBmb3Iga2V5LCB2YWx1ZSBvZiBjZmdcbiMgICBjb25zb2xlLnRhYmxlICggeyBrZXksIHZhbHVlLCB9IGZvciBrZXksIHZhbHVlIG9mIGNmZyApXG4jICAgd2hpc3BlcigpXG4jICAgcmV0dXJuIG51bGxcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgZmV0Y2hfcGRmX2luZm8gPSAoIGNmZyApIC0+XG4jICAgYXdhaXQgaW1wb3J0KCAnengvZ2xvYmFscycgKVxuIyAgIHZlcmJvc2UgICAgICAgPSAkLnZlcmJvc2U7ICQudmVyYm9zZSA9IGZhbHNlXG4jICAgcGRmaW5mb19wYXRoICA9IGF3YWl0IHBhdGhfZnJvbV9leGVjdXRhYmxlX25hbWUgJ3BkZmluZm8nXG4jICAgc3Rkb3V0ICAgICAgICA9ICggYXdhaXQgJFwiI3twZGZpbmZvX3BhdGh9ICN7Y2ZnLmlucHV0fVwiICkuc3Rkb3V0LnRyaW0oKVxuIyAgIFIgICAgICAgICAgICAgPSB7fVxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBmb3IgbGluZSBpbiBzdGRvdXQuc3BsaXQgL1xcbi9cbiMgICAgIGNvbnRpbnVlIHVubGVzcyAoIG1hdGNoID0gbGluZS5tYXRjaCAvXig/PGtleT5bXjpdKyk6XFxzKig/PHZhbHVlPi4qKSQvICk/XG4jICAgICBrZXkgICA9IG1hdGNoLmdyb3Vwcy5rZXkudG9Mb3dlckNhc2UoKVxuIyAgICAgdmFsdWUgPSBtYXRjaC5ncm91cHMudmFsdWVcbiMgICAgIHN3aXRjaCBrZXlcbiMgICAgICAgd2hlbiAncGFnZXMnXG4jICAgICAgICAgUi5wYWdlY291bnQgPSBwYXJzZUludCB2YWx1ZSwgMTBcbiMgICAgICAgd2hlbiAncGFnZSBzaXplJ1xuIyAgICAgICAgIHVubGVzcyAoIHN1Ym1hdGNoID0gdmFsdWUubWF0Y2ggLyg/PHBhZ2Vfd2lkdGg+W1xcZC5dKylcXHMqeFxccyooPzxwYWdlX2hlaWdodD5bXFxkLl0rKVxccypwdHMvICk/XG4jICAgICAgICAgICB3YXJuIFwiXjMzODQ3XiB1bmFibGUgdG8gcGFyc2UgI3tycHIgbGluZX1cIlxuIyAgICAgICAgICAgUi5wYWdlX3dpZHRoICA9IDIxMFxuIyAgICAgICAgICAgUi5wYWdlX2hlaWdodCA9IDI5N1xuIyAgICAgICAgICAgY29udGludWVcbiMgICAgICAgICBSLnBhZ2Vfd2lkdGggID0gSC5tbV9mcm9tX3B0IHBhcnNlRmxvYXQgc3VibWF0Y2guZ3JvdXBzLnBhZ2Vfd2lkdGhcbiMgICAgICAgICBSLnBhZ2VfaGVpZ2h0ID0gSC5tbV9mcm9tX3B0IHBhcnNlRmxvYXQgc3VibWF0Y2guZ3JvdXBzLnBhZ2VfaGVpZ2h0XG4jICAgICAgIGVsc2VcbiMgICAgICAgICBudWxsXG4jICAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyAgICQudmVyYm9zZSA9IHZlcmJvc2VcbiMgICBpbmZvICdeNjkwLTFeJywgXCJQREY6ICN7cnByIFJ9XCJcbiMgICByZXR1cm4gUlxuXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBmZXRjaF9wYWdlZGlzdHJvID0gKCBjZmcgKSAtPlxuIyAgIE9iamVjdC5hc3NpZ24gY2ZnLCBhd2FpdCBmZXRjaF9wZGZfaW5mbyBjZmdcbiMgICBjZmcuc2hlZXRjb3VudCAgICAgID0gY2ZnLnBhZ2Vjb3VudCAvLyBjZmcubGF5b3V0LnBwc1xuIyAgIHJlbWFpbmRlciAgICAgICAgICAgPSBjZmcucGFnZWNvdW50ICUlIGNmZy5sYXlvdXQucHBzXG4jICAgY2ZnLnNoZWV0Y291bnQrKyBpZiByZW1haW5kZXIgaXNudCAwXG4jICAgY2ZnLmJsYW5rX3BhZ2Vjb3VudCA9IGNmZy5sYXlvdXQucHBzIC0gcmVtYWluZGVyXG4jICAgUiAgICAgICAgICAgICAgICAgICA9IFsgMSAuLiBjZmcucGFnZWNvdW50IF1cbiMgICByZXR1cm4gUiBpZiBjZmcuYmxhbmtfcGFnZWNvdW50IGlzIDBcbiMgICBzcGxpdCAgICAgICAgICAgICAgID0gZGVlcF9jb3B5IGNmZy5tdHJfc3BsaXRcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgIyMjIHR1cm4gUlBOUnMgaW50byBMUE5ScyAjIyNcbiMgICAjIyMgVEFJTlQgY29ycmVjdCBvciBjb21wbGFpbiBhYm91dCBQTlJzIG91dHNpZGUgdGhlIGFsbG93ZWQgcmFuZ2UgIyMjXG4jICAgZm9yIGQgaW4gc3BsaXRcbiMgICAgIGlmIGlzYS5uZWdhdGl2ZSBkLnBuclxuIyAgICAgICBkLnBuciA9IGNmZy5wYWdlY291bnQgKyBkLnBuclxuIyAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgICBpbnNlcnRzID0ge31cbiMgICBicGMgICAgID0gY2ZnLmJsYW5rX3BhZ2Vjb3VudFxuIyAgIGxvb3BcbiMgICAgIGJyZWFrIGlmIGJwYyA8IDBcbiMgICAgIGZvciBkIGluIHNwbGl0XG4jICAgICAgIGNvbnRpbnVlIGlmIGQuY291bnQgPD0gMFxuIyAgICAgICBicGMtLVxuIyAgICAgICBicmVhayBpZiBicGMgPCAwXG4jICAgICAgIGQuY291bnQtLVxuIyAgICAgICBpbnNlcnRzWyBkLnBuciBdID0gKCBpbnNlcnRzWyBkLnBuciBdID89IDAgKSArIDFcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgUiA9ICggWyBwbnIsIF0gZm9yIHBuciBpbiBSIClcbiMgICBmb3IgcG5yX3R4dCwgY291bnQgb2YgaW5zZXJ0c1xuIyAgICAgcG5yID0gcGFyc2VJbnQgcG5yX3R4dCwgMTBcbiMgICAgIGlkeCA9IHBuciAtIDFcbiMgICAgICMgIyMjIHRoeCB0byBodHRwczovLzJhbGl0eS5jb20vMjAxOC8xMi9jcmVhdGluZy1hcnJheXMuaHRtbCNjcmVhdGluZy1yYW5nZXMtb2YtaW50ZWdlci12YWx1ZXMgIyMjXG4jICAgICAjIFJbIGlkeCBdLnB1c2ggQXJyYXkuZnJvbSB7IGxlbmd0aCwgfSwgKCBfLCBpICkgLT4gLTFcbiMgICAgICMgUlsgaWR4IF0ucHVzaCAtMSBmb3IgXyBpbiBbIDEgLi4gY291bnQgXVxuIyAgICAgIyBSWyBpZHggXS5wdXNoIDAgZm9yIF8gaW4gWyAxIC4uIGNvdW50IF1cbiMgICAgIFJbIGlkeCBdLnB1c2ggKCBUTVBfTVlTVEVSWV9FTVBUWV9QR0VfTlIgPSAyICkgZm9yIF8gaW4gWyAxIC4uIGNvdW50IF1cbiMgICBSID0gUi5mbGF0KClcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgcmV0dXJuIFJcblxuIyAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiMgcnVuX2ltcG9zZSA9ICggY2ZnICkgLT5cbiMgICAjIyMgVEFJTlQgc2hvdWxkIG5vcm1hbGl6ZSBwYXRoICMjI1xuIyAgICMjIyBUQUlOVCBpbmNvbnNpc3RlbnQgbmFtaW5nICMjI1xuIyAgIGNmZy5iZHBfcGF0aCAgICAgICAgICA9IGNmZy5iYWNrZHJvcFxuIyAgICMgY2ZnLmJkcF9wYXRoICAgICAgICAgID0gcmVzb2x2ZSBjZmcudGVtcGRpciwgJ2JhY2tkcm9wLnBkZidcbiMgICBjZmcubXRyX3NwbGl0ICAgICAgICAgPSB0eXBlcy5kYXRhLm10cl9zcGxpdFxuIyAgIGNmZy5pbnB1dCAgICAgICAgICAgICA9IHJlc29sdmUgY2ZnLmlucHV0XG4jICAgY2ZnLm91dHB1dCAgICAgICAgICAgID0gcmVzb2x2ZSBjZmcub3V0cHV0XG4jICAgY2ZnLnBhZ2VkaXN0cm8gICAgICAgID0gYXdhaXQgZmV0Y2hfcGFnZWRpc3RybyBjZmdcbiMgICBjZmcub3ZsX3BhdGggICAgICAgICAgPSByZXNvbHZlIGNmZy50ZW1wZGlyLCAnb3ZlcmxheS5wZGYnXG4jICAgZGVidWcgJ14zNTUzXicsIHsgcGFnZWRpc3RybzogY2ZnLnBhZ2VkaXN0cm8sIH1cbiMgICBzaG93X2NmZyBjZmdcbiMgICBtdHIgICAgICAgICAgICAgICAgICAgPSBuZXcgTWV0dGV1cigpXG4jICAgY2ZnLmltcG9zaXRpb24gICAgICAgID0gYXdhaXQgbXRyLl9pbXBvc2UgY2ZnXG4jICAgIyBwcm9jZXNzLmV4aXQgMTExXG4jICAgYXdhaXQgcnVuX3RleF9ldGMgY2ZnXG4jICAgcmV0dXJuIG51bGxcblxuXG4jICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuIyAjXG4jICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyBAY2xpID0gLT5cbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgam9iZGVmcyA9XG4jICAgICAjIG1ldGE6XG4jICAgICBjb21tYW5kczpcbiMgICAgICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jICAgICAgICdoZWxwJzpcbiMgICAgICAgICBydW5uZXI6ICggZCApID0+XG4jICAgICAgICAgICBkZWJ1ZyAnXjY5MC0xXicsIHByb2Nlc3MuYXJndlxuIyAgICAgICAgICAgZWNobyBsaW1lIFwiXCJcIk1ldHRldXI6IHByb2R1Y2UgaW1wb3NpdGlvbnMgZm9yIGJvb2tsZXRzIHdpdGggNCwgOCBvciAxNiBwYWdlcyBhcnJhbmdlZCBvbiBvbmUgc2hlZXRcIlwiXCJcbiMgICAgICAgICAgIGVjaG8gYmx1ZSBcIlwiXCJcbiMgICAgICAgICAgICAgVXNhZ2U6XG4jICAgICAgICAgICAgICAgbWV0dGV1ciBpbXBvc2UgW2ZsYWdzXVxuIyAgICAgICAgICAgICAgICAgLS1pbnB1dCAgICAgICAtaVxuIyAgICAgICAgICAgICAgICAgLS1vdmVyd3JpdGUgICAteVxuIyAgICAgICAgICAgICAgICAgLS1vdXRwdXQgICAgICAtb1xuIyAgICAgICAgICAgICAgICAgLS1zcGxpdFxuIyAgICAgICAgICAgICAgICAgLS10ZW1wZGlyICAgICAtdFxuIyAgICAgICAgICAgICBcIlwiXCJcbiMgICAgICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4jICAgICAgICdpbXBvc2UnOlxuIyAgICAgICAgIGRlc2NyaXB0aW9uOiAgXCJhc3NlbWJsZSBwYWdlcyBmcm9tIG9uZSBQREYgZmlsZSBpbnRvIGEgbmV3IFBERiwgdG8gYmUgZm9sZGVkIGludG8gYSBib29rbGV0XCJcbiMgICAgICAgICBydW5uZXI6ICggZCApID0+XG4jICAgICAgICAgICBjZmcgICAgICAgICAgICAgPSB0eXBlcy5jcmVhdGUubXRyX2ltcG9zZV9jZmcgZC52ZXJkaWN0LnBhcmFtZXRlcnNcbiMgICAgICAgICAgICMgYXdhaXQgR1VZLnRlbXAud2l0aF9kaXJlY3RvcnkgeyBrZWVwOiB0cnVlLCB9LCAoeyBwYXRoIH0pIC0+XG4jICAgICAgICAgICAjIyMgVEFJTlQgYGNmZ2Aga2V5L3ZhbHVlIGR1cGxpY2F0aW9uICMjI1xuIyAgICAgICAgICAgaWYgY2ZnLnRlbXBkaXI/XG4jICAgICAgICAgICAgIG1rZGlycC5zeW5jIGNmZy50ZW1wZGlyXG4jICAgICAgICAgICAgIHJldHVybiBhd2FpdCBydW5faW1wb3NlIGNmZ1xuIyAgICAgICAgICAgZWxzZVxuIyAgICAgICAgICAgICBkbyAoIHBhdGggPSAnL3RtcC9ndXkudGVtcC0tMTIyMjktWlVqVU9WUUVJWlhJJyApIC0+XG4jICAgICAgICAgICAgICAgY2ZnLnRlbXBkaXIgPSBwYXRoXG4jICAgICAgICAgICAgICAgcmV0dXJuIGF3YWl0IHJ1bl9pbXBvc2UgY2ZnXG4jICAgICAgICAgICByZXR1cm4gbnVsbFxuIyAgICAgICAgIGZsYWdzOlxuIyAgICAgICAgICAgJ2xheW91dCc6XG4jICAgICAgICAgICAgIGFsaWFzOiAgICAgICAgJ2wnXG4jICAgICAgICAgICAgIHR5cGU6ICAgICAgICAgU3RyaW5nXG4jICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAgXCJuYW1lIG9mIGEgbGF5b3V0OyBkZWZhdWx0cyB0byAncHBzMTYnXCJcbiMgICAgICAgICAgICdpbnB1dCc6XG4jICAgICAgICAgICAgIGFsaWFzOiAgICAgICAgJ2knXG4jICAgICAgICAgICAgIHR5cGU6ICAgICAgICAgU3RyaW5nXG4jICAgICAgICAgICAgICMgcG9zaXRpb25hbDogICB0cnVlXG4jICAgICAgICAgICAgICMgbXVsdGlwbGU6ICAgICAnZ3JlZWR5J1xuIyAgICAgICAgICAgICBkZXNjcmlwdGlvbjogIFwiaW5wdXQgZmlsZSAocHJvdmlkaW5nIHRoZSBpbmRpdmlkdWFsIHBhZ2VzKVwiXG4jICAgICAgICAgICAnb3V0cHV0JzpcbiMgICAgICAgICAgICAgYWxpYXM6ICAgICAgICAnbydcbiMgICAgICAgICAgICAgdHlwZTogICAgICAgICBTdHJpbmdcbiMgICAgICAgICAgICAgIyBwb3NpdGlvbmFsOiAgIHRydWVcbiMgICAgICAgICAgICAgZGVzY3JpcHRpb246ICBcIm91dHB1dCBmaWxlIChjb250YWluaW5nIHRoZSBib29rbGV0IHdpdGggbXVsdGlwbGUgcGFnZXMgcGVyIHNoZWV0LCBmcm9udCBhbmQgYmFjaylcIlxuIyAgICAgICAgICAgJ292ZXJ3cml0ZSc6XG4jICAgICAgICAgICAgIGFsaWFzOiAgICAgICAgJ3knXG4jICAgICAgICAgICAgIHR5cGU6ICAgICAgICAgQm9vbGVhblxuIyAgICAgICAgICAgICAjIHBvc2l0aW9uYWw6ICAgdHJ1ZVxuIyAgICAgICAgICAgICBkZXNjcmlwdGlvbjogIFwid2hldGhlciB0byBvdmVyd3JpdGUgb3V0cHV0IGZpbGVcIlxuIyAgICAgICAgICAgJ3NwbGl0JzpcbiMgICAgICAgICAgICAgIyBhbGlhczogICAgICAgICd5J1xuIyAgICAgICAgICAgICB0eXBlOiAgICAgICAgIFN0cmluZ1xuIyAgICAgICAgICAgICAjIHBvc2l0aW9uYWw6ICAgdHJ1ZVxuIyAgICAgICAgICAgICBkZXNjcmlwdGlvbjogIFwidXNlIHBvc2l0aXZlIHBhZ2UgbnIgb3IgbmVnYXRpdmUgY291bnQgdG8gY29udHJvbCBpbnNlcnRpb24gb2YgZW1wdHkgcGFnZXNcIlxuIyAgICAgICAgICAgJ3RlbXBkaXInOlxuIyAgICAgICAgICAgICBhbGlhczogICAgICAgICd0J1xuIyAgICAgICAgICAgICB0eXBlOiAgICAgICAgIFN0cmluZ1xuIyAgICAgICAgICAgICAjIHBvc2l0aW9uYWw6ICAgdHJ1ZVxuIyAgICAgICAgICAgICBkZXNjcmlwdGlvbjogIFwidXNlIHRoZSBkaXJlY3RvcnkgZ2l2ZW4gdG8gcnVuIFRlWCBpbiBpbnN0ZWFkIG9mIGEgdGVtcG9yYXJ5IGRpcmVjdG9yeVwiXG4jICAgICAgICAgICAnYmFja2Ryb3AnOlxuIyAgICAgICAgICAgICBhbGlhczogICAgICAgICdiJ1xuIyAgICAgICAgICAgICB0eXBlOiAgICAgICAgIFN0cmluZ1xuIyAgICAgICAgICAgICAjIHBvc2l0aW9uYWw6ICAgdHJ1ZVxuIyAgICAgICAgICAgICBkZXNjcmlwdGlvbjogIFwidXNlIHRoZSBQREYgb3IgaW1hZ2UgZ2l2ZW4gYXMgYSBiYWNrZHJvcFwiXG4jICAgICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuIyAgICAgICAjICd0ZXgnOlxuIyAgICAgICAjICAgZGVzY3JpcHRpb246ICBcInJ1biBYZUxhVGVYIG9uIHRleC9ib29rbGV0LnRleCB0byBwcm9kdWNlIHRleC9ib29rbGV0LnBkZlwiXG4jICAgICAgICAgIyBydW5uZXI6IHJ1bl90ZXhcbiMgICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4jICAgTUlYQS5ydW4gam9iZGVmcywgcHJvY2Vzcy5hcmd2XG4jICAgcmV0dXJuIG51bGxcblxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuaWYgbW9kdWxlIGlzIHJlcXVpcmUubWFpbiB0aGVuIGRvID0+XG4gICMgYXdhaXQgZGVtb19yZWNlaXZlcigpXG4gICMgYXdhaXQgQGNsaSgpXG4gIHByb2Nlc3Muc3Rkb3V0LndyaXRlICdoZWxvLHdvcmxkXFxuMSwyXFxuJ1xuIl19
