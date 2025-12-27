

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
Bsql3                     = require 'better-sqlite3'
#-----------------------------------------------------------------------------------------------------------
SFMODULES                 = require '../../hengist-NG/apps/bricabrac-sfmodules'
#...........................................................................................................
{ Dbric,
  Dbric_std,
  SQL,
  from_bool,
  as_bool,              } = SFMODULES.unstable.require_dbric()
#...........................................................................................................
{ lets,
  freeze,               } = SFMODULES.require_letsfreezethat_infra().simple
#...........................................................................................................
{ Jetstream,
  Async_jetstream,      } = SFMODULES.require_jetstream()
#...........................................................................................................
{ walk_lines_with_positions
                        } = SFMODULES.unstable.require_fast_linereader()
#...........................................................................................................
{ Benchmarker,          } = SFMODULES.unstable.require_benchmarking()
benchmarker                   = new Benchmarker()
timeit                        = ( P... ) -> benchmarker.timeit P...
#...........................................................................................................
{ set_getter,           } = SFMODULES.require_managed_property_tools()
{ IDL, IDLX,            } = require 'mojikura-idl'
{ type_of,              } = SFMODULES.unstable.require_type_of()


#===========================================================================================================
demo_source_identifiers = ->
  { expand_dictionary,      } = SFMODULES.require_dictionary_tools()
  { get_local_destinations, } = SFMODULES.require_get_local_destinations()
  for key, value of get_local_destinations()
    debug 'Ωjzrsdb___1', key, value
  # can append line numbers to files as in:
  # 'ds:dict:meanings.1:L=13332'
  # 'ds:dict:ucd140.1:uhdidx:L=1234'
  # rowids: 't:jfm:R=1'
  # {
  #   'ds:dict:meanings':          '$jzrds/meaning/meanings.txt'
  #   'ds:dict:ucd:v14.0:uhdidx' : '$jzrds/unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt'
  #   }

#===========================================================================================================
###

                         .   oooo
                       .o8   `888
oo.ooooo.   .oooo.   .o888oo  888 .oo.    .oooo.o
 888' `88b `P  )88b    888    888P"Y88b  d88(  "8
 888   888  .oP"888    888    888   888  `"Y88b.
 888   888 d8(  888    888 .  888   888  o.  )88b
 888bod8P' `Y888""8o   "888" o888o o888o 8""888P'
 888
o888o

                                                                                                         ###
#===========================================================================================================
get_paths_and_formats = ->
  paths                               = {}
  formats                             = {}
  R                                   = { paths, formats, }
  paths.base                          = PATH.resolve __dirname, '..'
  paths.jzr                           = PATH.resolve paths.base, '..'
  paths.db                            = PATH.join paths.base, 'jzr.db'
  # paths.db                            = '/dev/shm/jzr.db'
  # paths.jzrds                         = PATH.join paths.base, 'jzrds'
  paths.jzrnds                        = PATH.join paths.base, 'jizura-new-datasources'
  paths.mojikura                      = PATH.join paths.jzrnds, 'mojikura'
  paths.raw_github                    = PATH.join paths.jzrnds, 'bvfs/origin/https/raw.githubusercontent.com'
  kanjium                             = PATH.join paths.raw_github, 'mifunetoshiro/kanjium/8a0cdaa16d64a281a2048de2eee2ec5e3a440fa6'
  rutopio                             = PATH.join paths.raw_github, 'rutopio/Korean-Name-Hanja-Charset/12df1ba1b4dfaa095813e4ddfba424e816f94c53'
  ucd1700                             = PATH.join paths.jzrnds, 'bvfs/origin/https/www.unicode.org/Public/17.0.0/ucd'
  #.........................................................................................................
  # paths[ 'ds:dict:ucd:v14.0:uhdidx'      ]   = PATH.join paths.jzrnds, 'unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt'
  paths[ 'ds:dict:x:ko-Hang+Latn'         ]  = PATH.join paths.jzrnds, 'hangeul-transcriptions.tsv'
  paths[ 'ds:dict:x:ja-Kan+Latn'          ]  = PATH.join paths.jzrnds, 'kana-transcriptions.tsv'
  paths[ 'ds:dict:bcp47'                  ]  = PATH.join paths.jzrnds, 'BCP47-language-scripts-regions.tsv'
  paths[ 'ds:dict:ja:kanjium'             ]  = PATH.join kanjium, 'data/source_files/kanjidict.txt'
  paths[ 'ds:dict:ja:kanjium:aux'         ]  = PATH.join kanjium, 'data/source_files/0_README.txt'
  paths[ 'ds:dict:ko:V=data-gov.csv'      ]  = PATH.join rutopio, 'data-gov.csv'
  paths[ 'ds:dict:ko:V=data-gov.json'     ]  = PATH.join rutopio, 'data-gov.json'
  paths[ 'ds:dict:ko:V=data-naver.csv'    ]  = PATH.join rutopio, 'data-naver.csv'
  paths[ 'ds:dict:ko:V=data-naver.json'   ]  = PATH.join rutopio, 'data-naver.json'
  paths[ 'ds:dict:ko:V=README.md'         ]  = PATH.join rutopio, 'README.md'
  paths[ 'ds:dict:meanings'               ]  = PATH.join paths.mojikura, 'meaning/meanings.txt'
  paths[ 'ds:shape:idsv2'                 ]  = PATH.join paths.mojikura, 'shape/shape-breakdown-formula-v2.txt'
  paths[ 'ds:shape:zhz5bf'                ]  = PATH.join paths.mojikura, 'shape/shape-strokeorder-zhaziwubifa.txt'
  paths[ 'ds:ucdb:rsgs'                   ]  = PATH.join paths.mojikura, 'ucdb/cfg/rsgs-and-blocks.md'
  paths[ 'ds:ucd:ucd'                     ]  = PATH.join ucd1700, 'UnicodeData.txt'
  #.........................................................................................................
  # formats[ 'ds:dict:ucd:v14.0:uhdidx'      ]   = , 'unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt'
  formats[ 'ds:dict:x:ko-Hang+Latn'         ] = 'dsf:tsv'
  formats[ 'ds:dict:x:ja-Kan+Latn'          ] = 'dsf:tsv'
  formats[ 'ds:dict:bcp47'                  ] = 'dsf:tsv'
  formats[ 'ds:dict:ja:kanjium'             ] = 'dsf:txt'
  formats[ 'ds:dict:ja:kanjium:aux'         ] = 'dsf:txt'
  formats[ 'ds:dict:ko:V=data-gov.csv'      ] = 'dsf:csv'
  formats[ 'ds:dict:ko:V=data-gov.json'     ] = 'dsf:json'
  formats[ 'ds:dict:ko:V=data-naver.csv'    ] = 'dsf:csv'
  formats[ 'ds:dict:ko:V=data-naver.json'   ] = 'dsf:json'
  formats[ 'ds:dict:ko:V=README.md'         ] = 'dsf:md'
  formats[ 'ds:dict:meanings'               ] = 'dsf:tsv'
  formats[ 'ds:shape:idsv2'                 ] = 'dsf:tsv'
  formats[ 'ds:shape:zhz5bf'                ] = 'dsf:tsv'
  formats[ 'ds:ucdb:rsgs'                   ] = 'dsf:md:table'
  formats[ 'ds:ucd:ucd'                     ] = 'dsf:semicolons'
  return R



#===========================================================================================================
class Jzr_db_adapter extends Dbric_std

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
    @host   = host
    @state  = { triple_count: 0, most_recent_inserted_row: null }
    #.......................................................................................................
    do =>
      ### TAINT this is not well placed ###
      ### NOTE execute a Gaps-and-Islands ESSFRI to improve structural integrity assurance: ###
      # ( @prepare SQL"select * from _jzr_meta_uc_normalization_faults where false;" ).get()
      messages = []
      for { name, type, } from @statements.std_get_relations.iterate()
        try
          ( @prepare SQL"select * from #{name} where false;" ).all()
        catch error
          messages.push "#{type} #{name}: #{error.message}"
          warn 'Ωjzrsdb___2', error.message
      return null if messages.length is 0
      throw new Error "Ωjzrsdb___3 EFFRI testing revealed errors: #{rpr messages}"
      ;null
    #.......................................................................................................
    if @is_fresh
      @_on_open_populate_jzr_datasource_formats()
      @_on_open_populate_jzr_datasources()
      @_on_open_populate_jzr_mirror_verbs()
      @_on_open_populate_jzr_mirror_lcodes()
      @_on_open_populate_jzr_mirror_lines()
      @_on_open_populate_jzr_glyphranges()
      @_on_open_populate_jzr_glyphs()
    #.......................................................................................................
    ;undefined

  #---------------------------------------------------------------------------------------------------------
  set_getter @::, 'next_triple_rowid', -> "t:mr:3pl:R=#{++@state.triple_count}"

  #=========================================================================================================
  ###

   .o8                    o8o  oooo        .o8
  "888                    `"'  `888       "888
   888oooo.  oooo  oooo  oooo   888   .oooo888
   d88' `88b `888  `888  `888   888  d88' `888
   888   888  888   888   888   888  888   888
   888   888  888   888   888   888  888   888
   `Y8bod8P'  `V88V"V8P' o888o o888o `Y8bod88P"

                                                                                                         ###
  #=========================================================================================================
  @build: [

    #.......................................................................................................
    SQL"""create table jzr_urns (
        urn     text      unique  not null,
        comment text              not null,
      primary key ( urn ),
      constraint "Ωconstraint___4" check ( urn regexp '^[\\-\\+\\.:a-zA-Z0-9]+$' ) )
      ;"""

    #.......................................................................................................
    SQL"""create table jzr_glyphranges (
        rowid     text    unique  not null generated always as ( 't:uc:rsg:V=' || rsg ),
        rsg       text    unique  not null,
        is_cjk    boolean         not null,
        lo        integer         not null,
        hi        integer         not null,
        -- lo_glyph  text            not null generated always as ( jzr_chr_from_cid( lo ) ) stored,
        -- hi_glyph  text            not null generated always as ( jzr_chr_from_cid( hi ) ) stored,
        name      text            not null,
      -- primary key ( rowid ),
      constraint "Ωconstraint___5" check ( lo between 0x000000 and 0x10ffff ),
      constraint "Ωconstraint___6" check ( hi between 0x000000 and 0x10ffff ),
      constraint "Ωconstraint___7" check ( lo <= hi ),
      constraint "Ωconstraint___8" check ( rowid regexp '^.*$' )
      );"""

    #.......................................................................................................
    SQL"""create table jzr_glyphs (
          cid     integer unique  not null,
          rsg     text            not null,
          cid_hex text    unique  not null generated always as ( jzr_as_hex( cid ) ) stored,
          glyph   text    unique  not null,
          is_cjk  boolean         not null, -- generated always as ( jzr_is_cjk_glyph( glyph ) ) stored,
        primary key ( cid ),
        constraint "Ωconstraint___9" foreign key ( rsg ) references jzr_glyphranges ( rsg )
      );"""
    #.......................................................................................................
    SQL"""create trigger jzr_glyphs_insert
      before insert on jzr_glyphs
      for each row begin
        select jzr_trigger_on_before_insert( 'jzr_glyphs',
          'cid:', new.cid, 'rsg:', new.rsg );
        end;"""

    # #.......................................................................................................
    # SQL"""create view jzr_cjk_glyphranges as
    #   select
    #       *
    #     from jzr_glyphranges
    #     where is_cjk
    #     order by lo;"""

    # #.......................................................................................................
    # SQL"""create view jzr_cjk_glyphs as
    #   select
    #       gr.rsg    as rsg,
    #       gs.value  as cid,
    #       jzr_chr_from_cid( gs.value )  as glyph
    #     from jzr_cjk_glyphranges                    as gr
    #     join std_generate_series( gr.lo, gr.hi, 1 ) as gs
    #     ;"""

    #.......................................................................................................
    SQL"""create table jzr_glyphsets (
        rowid       text    unique  not null,
        name        text            not null,
        glyphrange  text            not null,
      primary key ( rowid ),
      constraint "Ωconstraint__10" foreign key ( glyphrange ) references jzr_glyphranges ( rowid ),
      constraint "Ωconstraint__11" check ( rowid regexp '^.*$' )
      );"""

    #.......................................................................................................
    SQL"""create table jzr_datasource_formats (
        format    text    unique  not null,
        comment   text            not null,
      primary key ( format ),
      constraint "Ωconstraint__12" check ( format regexp '^dsf:[\\-\\+\\.:a-zA-Z0-9]+$' )
      );"""
    #.......................................................................................................
    SQL"""create trigger jzr_datasource_formats_insert
      before insert on jzr_datasource_formats
      for each row begin
        select jzr_trigger_on_before_insert( 'jzr_datasource_formats',
          'format:', new.format, 'comment:', new.comment );
        insert into jzr_urns ( urn, comment ) values ( new.format, new.comment );
        end;"""

    #.......................................................................................................
    SQL"""create table jzr_datasources (
        dskey     text    unique  not null,
        format    text            not null,
        path      text            not null,
      primary key ( dskey ),
      constraint "Ωconstraint__13" foreign key ( format ) references jzr_datasource_formats ( format )
      );"""
    #.......................................................................................................
    SQL"""create trigger jzr_datasources_insert
      before insert on jzr_datasources
      for each row begin
        select jzr_trigger_on_before_insert( 'jzr_datasources',
          'dskey:', new.dskey, 'format:', new.format, 'path:', new.path );
        insert into jzr_urns ( urn, comment ) values ( new.dskey, 'format: ' || new.format || ', path: ' || new.path );
        end;"""

    #.......................................................................................................
    SQL"""create table jzr_mirror_lcodes (
        rowid     text    unique  not null,
        lcode     text    unique  not null,
        comment   text            not null,
      primary key ( rowid ),
      constraint "Ωconstraint__14" check ( lcode regexp '^[a-zA-Z]+[a-zA-Z0-9]*$' ),
      constraint "Ωconstraint__15" check ( rowid = 't:mr:lc:V=' || lcode ) );"""

    #.......................................................................................................
    SQL"""create table jzr_mirror_lines (
        -- 't:jfm:'
        rowid     text    unique  not null generated always as ( 't:mr:ln:ds=' || dskey || ':L=' || line_nr ) stored,
        ref       text    unique  not null generated always as (                  dskey || ':L=' || line_nr ) virtual,
        dskey     text            not null,
        line_nr   integer         not null,
        lcode     text            not null,
        line      text            not null,
        jfields   json                null,
      -- primary key ( rowid ),                           -- ### NOTE Experimental: no explicit PK, instead generated `rowid` column
      -- check ( rowid regexp '^t:mr:ln:ds=.+:L=\\d+$'),  -- ### NOTE no need to check as value is generated ###
      unique ( dskey, line_nr ),
      constraint "Ωconstraint__16" foreign key ( lcode ) references jzr_mirror_lcodes ( lcode ) );"""

    #.......................................................................................................
    SQL"""create table jzr_mirror_verbs (
        rank      integer         not null default 1,
        s         text            not null,
        v         text    unique  not null,
        o         text            not null,
      primary key ( v ),
      -- check ( rowid regexp '^t:mr:vb:V=[\\-:\\+\\p{L}]+$' ),
      constraint "Ωconstraint__17" check ( rank > 0 ) );"""
    #.......................................................................................................
    SQL"""create trigger jzr_mirror_verbs_insert
      before insert on jzr_mirror_verbs
      for each row begin
        select jzr_trigger_on_before_insert( 'jzr_mirror_verbs',
          'rank:', new.rank, 's:', new.s, 'v:', new.v, 'o:', new.o );
        insert into jzr_urns ( urn, comment ) values ( new.v, 's: ' || new.s || ', o: ' || new.o );
        end;"""

    #.......................................................................................................
    SQL"""create table jzr_mirror_triples_base (
        rowid     text    unique  not null,
        ref       text            not null,
        s         text            not null,
        v         text            not null,
        o         json            not null,
      primary key ( rowid ),
      constraint "Ωconstraint__18" check ( rowid regexp '^t:mr:3pl:R=\\d+$' ),
      -- unique ( ref, s, v, o )
      constraint "Ωconstraint__19" foreign key ( ref ) references jzr_mirror_lines ( rowid ),
      constraint "Ωconstraint__20" foreign key ( v   ) references jzr_mirror_verbs ( v )
      );"""

    #.......................................................................................................
    SQL"""create trigger jzr_mirror_triples_register
      before insert on jzr_mirror_triples_base
      for each row begin
        select jzr_trigger_on_before_insert( 'jzr_mirror_triples_base',
          'rowid:', new.rowid, 'ref:', new.ref, 's:', new.s, 'v:', new.v, 'o:', new.o );
        end;"""

    #.......................................................................................................
    SQL"""create table jzr_lang_hang_syllables (
        rowid           text  unique  not null,
        ref             text          not null,
        syllable_hang   text  unique  not null,
        syllable_latn   text  not null generated always as ( initial_latn || medial_latn || final_latn ) virtual,
        -- syllable_latn   text  unique  not null generated always as ( initial_latn || medial_latn || final_latn ) virtual,
        initial_hang    text          not null,
        medial_hang     text          not null,
        final_hang      text          not null,
        initial_latn    text          not null,
        medial_latn     text          not null,
        final_latn      text          not null,
      primary key ( rowid ),
      constraint "Ωconstraint__21" check ( rowid regexp '^t:lang:hang:syl:V=\\S+$' )
      -- unique ( ref, s, v, o )
      -- constraint "Ωconstraint__22" foreign key ( ref ) references jzr_mirror_lines ( rowid )
      -- constraint "Ωconstraint__23" foreign key ( syllable_hang ) references jzr_mirror_triples_base ( o ) )
      );"""
    #.......................................................................................................
    SQL"""create trigger jzr_lang_hang_syllables_register
      before insert on jzr_lang_hang_syllables
      for each row begin
        select jzr_trigger_on_before_insert( 'jzr_lang_hang_syllables',
          new.rowid, new.ref, new.syllable_hang, new.syllable_latn,
            new.initial_hang, new.medial_hang, new.final_hang,
            new.initial_latn, new.medial_latn, new.final_latn );
        end;"""

    #.......................................................................................................
    SQL"""create view jzr_lang_kr_readings_triples as
      select null as rowid, null as ref, null as s, null as v, null as o where false union all
      -- ...................................................................................................
      select rowid, ref, syllable_hang, 'v:c:reading:ko-Latn',          syllable_latn   from jzr_lang_hang_syllables union all
      select rowid, ref, syllable_hang, 'v:c:reading:ko-Latn:initial',  initial_latn    from jzr_lang_hang_syllables union all
      select rowid, ref, syllable_hang, 'v:c:reading:ko-Latn:medial',   medial_latn     from jzr_lang_hang_syllables union all
      select rowid, ref, syllable_hang, 'v:c:reading:ko-Latn:final',    final_latn      from jzr_lang_hang_syllables union all
      select rowid, ref, syllable_hang, 'v:c:reading:ko-Hang:initial',  initial_hang    from jzr_lang_hang_syllables union all
      select rowid, ref, syllable_hang, 'v:c:reading:ko-Hang:medial',   medial_hang     from jzr_lang_hang_syllables union all
      select rowid, ref, syllable_hang, 'v:c:reading:ko-Hang:final',    final_hang      from jzr_lang_hang_syllables union all
      -- ...................................................................................................
      select null, null, null, null, null where false
      ;"""

    # #.......................................................................................................
    # SQL"""create view jzr_all_triples as
    #   select null as rowid, null as ref, null as s, null as v, null as o where false union all
    #   -- ...................................................................................................
    #   select * from jzr_mirror_triples_base union all
    #   select * from jzr_lang_kr_readings_triples union all
    #   -- ...................................................................................................
    #   select null, null, null, null, null where false
    #   ;"""

    #.......................................................................................................
    SQL"""create view jzr_triples as
      select null as rowid, null as ref, null as rank, null as s, null as v, null as o where false
      -- -- ...................................................................................................
      union all
      select tb1.rowid, tb1.ref, vb1.rank, tb1.s, tb1.v, tb1.o from jzr_mirror_triples_base as tb1
      join jzr_mirror_verbs as vb1 using ( v )
      where vb1.v like 'v:c:%'
      -- ...................................................................................................
      union all
      select tb2.rowid, tb2.ref, vb2.rank, tb2.s, kr.v, kr.o from jzr_mirror_triples_base as tb2
      join jzr_lang_kr_readings_triples as kr on ( tb2.v = 'v:c:reading:ko-Hang' and tb2.o = kr.s )
      join jzr_mirror_verbs as vb2 on ( kr.v = vb2.v )
      -- ...................................................................................................
      union all
      select null, null, null, null, null, null where false
      order by s, v, o
      ;"""

    #.......................................................................................................
    SQL"""create view jzr_top_triples as
      select * from jzr_triples
      where rank = 1
      order by s, v, o
      ;"""

    # #=======================================================================================================
    # SQL"""create table jzr_formulas (
    #     rowid     text    unique  not null,
    #     ref       text            not null,
    #     glyph     text            not null,
    #     formula   text            not null,

    #   );"""

    #.......................................................................................................
    SQL"""create table jzr_components (
        rowid     text    unique  not null,
        ref       text            not null,
        level     integer         not null,
        lnr       integer         not null,
        rnr       integer         not null,
        glyph     text            not null,
        component text            not null,
      primary key ( rowid ),
      constraint "Ωconstraint__24" foreign key ( ref ) references jzr_mirror_triples_base ( rowid ),
      constraint "Ωconstraint__25" check ( ( length( glyph     ) = 1 ) or ( glyph      regexp '^&[\\-a-z0-9_]+#[0-9a-f]{4,6};$' ) ),
      constraint "Ωconstraint__26" check ( ( length( component ) = 1 ) or ( component  regexp '^&[\\-a-z0-9_]+#[0-9a-f]{4,6};$' ) ),
      constraint "Ωconstraint__27" check ( rowid regexp '^.*$' )
      );"""


    #=======================================================================================================
    ###

      .o  .o88o.                       oooo      .            o.
     .8'  888 `"                       `888    .o8            `8.
    .8'  o888oo   .oooo.   oooo  oooo   888  .o888oo  .oooo.o  `8.
    88    888    `P  )88b  `888  `888   888    888   d88(  "8   88
    88    888     .oP"888   888   888   888    888   `"Y88b.    88
    `8.   888    d8(  888   888   888   888    888 . o.  )88b  .8'
     `8. o888o   `Y888""8o  `V88V"V8P' o888o   "888" 8""888P' .8'
      `"                                                      "'

                                                                                                         ###
    #=======================================================================================================
    SQL"""create view _jzr_meta_uc_normalization_faults as select
        ml.rowid  as rowid,
        ml.ref    as ref,
        ml.line   as line
      from jzr_mirror_lines as ml
      where true
        and ( not std_is_uc_normal( ml.line ) )
      order by ml.rowid;"""

    #.......................................................................................................
    SQL"""create view _jzr_meta_kr_readings_unknown_verb_faults as select distinct
          count(*) over ( partition by v )    as count,
          'jzr_lang_kr_readings_triples:R=*'  as rowid,
          '*'                                 as ref,
          'unknown-verb'                      as description,
          v                                   as quote
        from jzr_lang_kr_readings_triples as nn
        where not exists ( select 1 from jzr_mirror_verbs as vb where vb.v = nn.v );"""

    #.......................................................................................................
    SQL"""create view _jzr_meta_error_verb_faults as select distinct
          count(*) over ( partition by v )    as count,
          'error:R=*'                         as rowid,
          rowid                               as ref,
          'error-verb'                        as description,
          'v:' || v || ', o:' || o            as quote
        from jzr_triples as nn
        where v like '%:error';"""

    #.......................................................................................................
    SQL"""create view _jzr_meta_mirror_lines_whitespace_faults as select distinct
          1                                            as count,
          't:mr:ln:jfields:ws:R=*'                     as rowid,
          ml.rowid                                     as ref,
          'extraneous-whitespace'                      as description,
          ml.jfields                                   as quote
        from jzr_mirror_lines as ml
        where ( jzr_has_peripheral_ws_in_jfield( jfields ) );"""

    #.......................................................................................................
    SQL"""create view _jzr_meta_mirror_lines_with_errors as select distinct
          1                                            as count,
          't:mr:ln:jfields:ws:R=*'                     as rowid,
          ml.rowid                                     as ref,
          'error'                                      as description,
          ml.line                                      as quote
        from jzr_mirror_lines as ml
        where ( ml.lcode = 'E' );"""

    #.......................................................................................................
    SQL"""create view jzr_meta_faults as
      select null as count, null as rowid, null as ref, null as description, null  as quote where false union all
      -- ...................................................................................................
      select 1, rowid, ref,  'uc-normalization', line  as quote from _jzr_meta_uc_normalization_faults          union all
      select *                                                  from _jzr_meta_kr_readings_unknown_verb_faults  union all
      select *                                                  from _jzr_meta_error_verb_faults                union all
      select *                                                  from _jzr_meta_mirror_lines_whitespace_faults   union all
      select *                                                  from _jzr_meta_mirror_lines_with_errors         union all
      -- ...................................................................................................
      select null, null, null, null, null where false
      ;"""

    #.......................................................................................................
    # SQL"""create view jzr_syllables as select
    #       t1.s
    #       t1.v
    #       t1.o
    #       ti.s as initial_hang
    #       tm.s as medial_hang
    #       tf.s as final_hang
    #       ti.o as initial_latn
    #       tm.o as medial_latn
    #       tf.o as final_latn
    #     from jzr_mirror_triples_base as t1
    #     join
    #     join jzr_mirror_triples_base as ti on ( t1.)
    #   ;"""

    #.......................................................................................................
    ### aggregate table for all rowids goes here ###

    #.......................................................................................................
    ]

  #---------------------------------------------------------------------------------------------------------
  ###

               .                 .                                                         .
             .o8               .o8                                                       .o8
   .oooo.o .o888oo  .oooo.   .o888oo  .ooooo.  ooo. .oo.  .oo.    .ooooo.  ooo. .oo.   .o888oo  .oooo.o
  d88(  "8   888   `P  )88b    888   d88' `88b `888P"Y88bP"Y88b  d88' `88b `888P"Y88b    888   d88(  "8
  `"Y88b.    888    .oP"888    888   888ooo888  888   888   888  888ooo888  888   888    888   `"Y88b.
  o.  )88b   888 . d8(  888    888 . 888    .o  888   888   888  888    .o  888   888    888 . o.  )88b
  8""888P'   "888" `Y888""8o   "888" `Y8bod8P' o888o o888o o888o `Y8bod8P' o888o o888o   "888" 8""888P'

                                                                                                         ###
  #---------------------------------------------------------------------------------------------------------
  @statements:

    #.......................................................................................................
    insert_jzr_glyphrange: SQL"""
      insert into jzr_glyphranges ( rsg, is_cjk, lo, hi, name ) values ( $rsg, $is_cjk, $lo, $hi, $name )
        -- on conflict ( dskey ) do update set path = excluded.path
        ;"""

    #.......................................................................................................
    insert_jzr_datasource_format: SQL"""
      insert into jzr_datasource_formats ( format, comment ) values ( $format, $comment )
        -- on conflict ( dskey ) do update set path = excluded.path
        ;"""

    #.......................................................................................................
    insert_jzr_datasource: SQL"""
      insert into jzr_datasources ( dskey, format, path ) values ( $dskey, $format, $path )
        -- on conflict ( dskey ) do update set path = excluded.path
        ;"""

    #.......................................................................................................
    insert_jzr_mirror_verb: SQL"""
      insert into jzr_mirror_verbs ( rank, s, v, o ) values ( $rank, $s, $v, $o )
        -- on conflict ( rowid ) do update set rank = excluded.rank, s = excluded.s, v = excluded.v, o = excluded.o
        ;"""

    #.......................................................................................................
    insert_jzr_mirror_lcode: SQL"""
      insert into jzr_mirror_lcodes ( rowid, lcode, comment ) values ( $rowid, $lcode, $comment )
        -- on conflict ( rowid ) do update set lcode = excluded.lcode, comment = excluded.comment
        ;"""

    #.......................................................................................................
    insert_jzr_mirror_triple: SQL"""
      insert into jzr_mirror_triples_base ( rowid, ref, s, v, o ) values ( $rowid, $ref, $s, $v, $o )
        -- on conflict ( ref, s, v, o ) do nothing
        ;"""

    #.......................................................................................................
    populate_jzr_mirror_lines: SQL"""
      insert into jzr_mirror_lines ( dskey, line_nr, lcode, line, jfields )
      select
        -- 't:mr:ln:R=' || row_number() over ()          as rowid,
        -- ds.dskey || ':L=' || fl.line_nr   as rowid,
        ds.dskey                          as dskey,
        fl.line_nr                        as line_nr,
        fl.lcode                          as lcode,
        fl.line                           as line,
        fl.jfields                        as jfields
      from jzr_datasources                                      as ds
      join jzr_datasource_formats                               as df using ( format )
      join jzr_walk_file_lines( ds.dskey, df.format, ds.path )  as fl
      where true
      -- on conflict ( dskey, line_nr ) do update set line = excluded.line
      ;"""

    #.......................................................................................................
    populate_jzr_mirror_triples: SQL"""
      insert into jzr_mirror_triples_base ( rowid, ref, s, v, o )
        select
            gt.rowid_out    as rowid,
            gt.ref          as ref,
            gt.s            as s,
            gt.v            as v,
            gt.o            as o
          from jzr_mirror_lines                                   as ml
          join jzr_walk_triples( ml.rowid, ml.dskey, ml.jfields ) as gt
          where true
            and ( ml.lcode = 'D' )
            -- and ( ml.dskey = 'ds:dict:meanings' )
            and ( ml.jfields is not null )
            and ( ml.jfields->>0 not regexp '^@glyphs' )
            and ( ml.dskey = $dskey )
            and ( ml.jfields->>2 regexp $v_re )
        -- on conflict ( ref, s, v, o ) do nothing
        ;"""

    #.......................................................................................................
    populate_jzr_lang_hangeul_syllables: SQL"""
      insert into jzr_lang_hang_syllables ( rowid, ref,
        syllable_hang, initial_hang, medial_hang, final_hang,
                        initial_latn, medial_latn, final_latn )
        select
            't:lang:hang:syl:V=' || mt.o          as rowid,
            mt.rowid                              as ref,
            mt.o                                  as syllable_hang,
            dh.initial                            as initial_hang,
            dh.medial                             as medial_hang,
            dh.final                              as final_hang,
            coalesce( mti.o, '' )                 as initial_latn,
            coalesce( mtm.o, '' )                 as medial_latn,
            coalesce( mtf.o, '' )                 as final_latn
          from jzr_mirror_triples_base              as mt
          left join jzr_disassemble_hangeul( mt.o ) as dh
          left join jzr_mirror_triples_base as mti on ( mti.s = dh.initial and mti.v = 'v:x:ko-Hang+Latn:initial' )
          left join jzr_mirror_triples_base as mtm on ( mtm.s = dh.medial  and mtm.v = 'v:x:ko-Hang+Latn:medial'  )
          left join jzr_mirror_triples_base as mtf on ( mtf.s = dh.final   and mtf.v = 'v:x:ko-Hang+Latn:final'   )
          where true
            and ( mt.v = 'v:c:reading:ko-Hang' )
          order by mt.o
        -- on conflict ( rowid         ) do nothing
        /* ### NOTE `on conflict` needed because we log all actually occurring readings of all characters */
        on conflict ( syllable_hang ) do nothing
        ;"""

    #.......................................................................................................
    populate_jzr_glyphranges: SQL"""
      insert into jzr_glyphranges ( rsg, is_cjk, lo, hi, name )
      select
        -- 't:mr:ln:R=' || row_number() over ()          as rowid,
        -- ds.dskey || ':L=' || fl.line_nr   as rowid,
        gr.rsg                            as rsg,
        gr.is_cjk                         as is_cjk,
        -- ref
        gr.lo                             as lo,
        gr.hi                             as hi,
        gr.name                           as name
      from jzr_mirror_lines                                                   as ml
      join jzr_parse_ucdb_rsgs_glyphrange( ml.dskey, ml.line_nr, ml.jfields ) as gr
      where true
        and ( ml.dskey = 'ds:ucdb:rsgs' )
        and ( ml.lcode = 'D' )
      order by ml.line_nr
      -- on conflict ( dskey, line_nr ) do update set line = excluded.line
      ;"""

    #.......................................................................................................
    populate_jzr_glyphs: SQL"""
      insert into jzr_glyphs ( cid, glyph, rsg, is_cjk )
      select
          cg.cid    as cid,
          cg.glyph  as glyph,
          gr.rsg    as rsg,
          gr.is_cjk as is_cjk
        from jzr_glyphranges                                  as gr
        join jzr_generate_cids_and_glyphs( gr.lo, gr.hi )     as cg
        ;"""



  #=========================================================================================================
  ###

                                              oooo                .
                                              `888              .o8
  oo.ooooo.   .ooooo.  oo.ooooo.  oooo  oooo   888   .oooo.   .o888oo  .ooooo.
   888' `88b d88' `88b  888' `88b `888  `888   888  `P  )88b    888   d88' `88b
   888   888 888   888  888   888  888   888   888   .oP"888    888   888ooo888
   888   888 888   888  888   888  888   888   888  d8(  888    888 . 888    .o
   888bod8P' `Y8bod8P'  888bod8P'  `V88V"V8P' o888o `Y888""8o   "888" `Y8bod8P'
   888                  888
  o888o                o888o

                                                                                                         ###
  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_mirror_lcodes: ->
    debug 'Ωjzrsdb__28', '_on_open_populate_jzr_mirror_lcodes'
    @statements.insert_jzr_mirror_lcode.run { rowid: 't:mr:lc:V=B', lcode: 'B', comment: 'blank line',    }
    @statements.insert_jzr_mirror_lcode.run { rowid: 't:mr:lc:V=C', lcode: 'C', comment: 'comment line',  }
    @statements.insert_jzr_mirror_lcode.run { rowid: 't:mr:lc:V=D', lcode: 'D', comment: 'data line',     }
    @statements.insert_jzr_mirror_lcode.run { rowid: 't:mr:lc:V=E', lcode: 'E', comment: 'error',         }
    @statements.insert_jzr_mirror_lcode.run { rowid: 't:mr:lc:V=U', lcode: 'U', comment: 'unknown',       }
    ;null

  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_mirror_verbs: ->
    ### NOTE
    in verbs, initial component indicates type of subject:
      `v:c:` is for subjects that are CJK characters
      `v:x:` is used for unclassified subjects (possibly to be refined in the future)
    ###
    debug 'Ωjzrsdb__29', '_on_open_populate_jzr_mirror_verbs'
    rows = [
      { rank: 2, s: "NN", v: 'v:testing:unused',                      o: "NN", }
      { rank: 2, s: "NN", v: 'v:x:ko-Hang+Latn:initial',              o: "NN", }
      { rank: 2, s: "NN", v: 'v:x:ko-Hang+Latn:medial',               o: "NN", }
      { rank: 2, s: "NN", v: 'v:x:ko-Hang+Latn:final',                o: "NN", }
      { rank: 1, s: "NN", v: 'v:c:reading:zh-Latn-pinyin',            o: "NN", }
      { rank: 1, s: "NN", v: 'v:c:reading:ja-x-Kan',                  o: "NN", }
      { rank: 1, s: "NN", v: 'v:c:reading:ja-x-Hir',                  o: "NN", }
      { rank: 1, s: "NN", v: 'v:c:reading:ja-x-Kat',                  o: "NN", }
      { rank: 1, s: "NN", v: 'v:c:reading:ja-x-Latn',                 o: "NN", }
      { rank: 1, s: "NN", v: 'v:c:reading:ja-x-Hir+Latn',             o: "NN", }
      { rank: 1, s: "NN", v: 'v:c:reading:ja-x-Kat+Latn',             o: "NN", }
      { rank: 1, s: "NN", v: 'v:c:reading:ko-Hang',                   o: "NN", }
      { rank: 1, s: "NN", v: 'v:c:reading:ko-Latn',                   o: "NN", }
      { rank: 2, s: "NN", v: 'v:c:reading:ko-Hang:initial',           o: "NN", }
      { rank: 2, s: "NN", v: 'v:c:reading:ko-Hang:medial',            o: "NN", }
      { rank: 2, s: "NN", v: 'v:c:reading:ko-Hang:final',             o: "NN", }
      { rank: 2, s: "NN", v: 'v:c:reading:ko-Latn:initial',           o: "NN", }
      { rank: 2, s: "NN", v: 'v:c:reading:ko-Latn:medial',            o: "NN", }
      { rank: 2, s: "NN", v: 'v:c:reading:ko-Latn:final',             o: "NN", }
      { rank: 2, s: "NN", v: 'v:c:shape:ids:error',                   o: "NN", }
      { rank: 1, s: "NN", v: 'v:c:shape:ids:S:formula',               o: "NN", }
      { rank: 2, s: "NN", v: 'v:c:shape:ids:S:ast',                   o: "NN", }
      { rank: 1, s: "NN", v: 'v:c:shape:ids:M:formula',               o: "NN", }
      { rank: 2, s: "NN", v: 'v:c:shape:ids:M:ast',                   o: "NN", }
      { rank: 1, s: "NN", v: 'v:c:shape:ids:L:formula',               o: "NN", }
      { rank: 2, s: "NN", v: 'v:c:shape:ids:L:ast',                   o: "NN", }
      { rank: 2, s: "NN", v: 'v:c:shape:ids:S:has-operator',          o: "NN", }
      { rank: 2, s: "NN", v: 'v:c:shape:ids:S:has-component',         o: "NN", }
      { rank: 2, s: "NN", v: 'v:c:shape:ids:S:components',            o: "NN", }
      ]
    for row in rows
      @statements.insert_jzr_mirror_verb.run row
    ;null

  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_datasource_formats: ->
    debug 'Ωjzrsdb__30', '_on_open_populate_jzr_datasource_formats'
    @statements.insert_jzr_datasource_format.run { format: 'dsf:tsv',         comment: 'NN', }
    @statements.insert_jzr_datasource_format.run { format: 'dsf:md:table',    comment: 'NN', }
    @statements.insert_jzr_datasource_format.run { format: 'dsf:csv',         comment: 'NN', }
    @statements.insert_jzr_datasource_format.run { format: 'dsf:json',        comment: 'NN', }
    @statements.insert_jzr_datasource_format.run { format: 'dsf:md',          comment: 'NN', }
    @statements.insert_jzr_datasource_format.run { format: 'dsf:txt',         comment: 'NN', }
    @statements.insert_jzr_datasource_format.run { format: 'dsf:semicolons',  comment: 'NN', }
    ;null

  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_datasources: ->
    debug 'Ωjzrsdb__31', '_on_open_populate_jzr_datasources'
    { paths
      formats, } = get_paths_and_formats()
    # dskey = 'ds:dict:ucd:v14.0:uhdidx';  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=2', dskey, format: formats[ dskey ], path: paths[ dskey ], }
    dskey = 'ds:dict:meanings';              @statements.insert_jzr_datasource.run { rowid: 't:ds:R=1', dskey, format: formats[ dskey ], path: paths[ dskey ], }
    dskey = 'ds:dict:x:ko-Hang+Latn';        @statements.insert_jzr_datasource.run { rowid: 't:ds:R=2', dskey, format: formats[ dskey ], path: paths[ dskey ], }
    dskey = 'ds:dict:x:ja-Kan+Latn';         @statements.insert_jzr_datasource.run { rowid: 't:ds:R=3', dskey, format: formats[ dskey ], path: paths[ dskey ], }
    # dskey = 'ds:dict:ja:kanjium';            @statements.insert_jzr_datasource.run { rowid: 't:ds:R=4', dskey, format: formats[ dskey ], path: paths[ dskey ], }
    # dskey = 'ds:dict:ja:kanjium:aux';        @statements.insert_jzr_datasource.run { rowid: 't:ds:R=5', dskey, format: formats[ dskey ], path: paths[ dskey ], }
    # dskey = 'ds:dict:ko:V=data-gov.csv';     @statements.insert_jzr_datasource.run { rowid: 't:ds:R=6', dskey, format: formats[ dskey ], path: paths[ dskey ], }
    # dskey = 'ds:dict:ko:V=data-gov.json';    @statements.insert_jzr_datasource.run { rowid: 't:ds:R=7', dskey, format: formats[ dskey ], path: paths[ dskey ], }
    # dskey = 'ds:dict:ko:V=data-naver.csv';   @statements.insert_jzr_datasource.run { rowid: 't:ds:R=8', dskey, format: formats[ dskey ], path: paths[ dskey ], }
    # dskey = 'ds:dict:ko:V=data-naver.json';  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=9', dskey, format: formats[ dskey ], path: paths[ dskey ], }
    # dskey = 'ds:dict:ko:V=README.md';        @statements.insert_jzr_datasource.run { rowid: 't:ds:R=10', dskey, format: formats[ dskey ], path: paths[ dskey ], }
    dskey = 'ds:shape:idsv2';                @statements.insert_jzr_datasource.run { rowid: 't:ds:R=11', dskey, format: formats[ dskey ], path: paths[ dskey ], }
    dskey = 'ds:shape:zhz5bf';               @statements.insert_jzr_datasource.run { rowid: 't:ds:R=12', dskey, format: formats[ dskey ], path: paths[ dskey ], }
    dskey = 'ds:ucdb:rsgs';                  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=13', dskey, format: formats[ dskey ], path: paths[ dskey ], }
    dskey = 'ds:ucd:ucd';                    @statements.insert_jzr_datasource.run { rowid: 't:ds:R=14', dskey, format: formats[ dskey ], path: paths[ dskey ], }
    ;null

  # #---------------------------------------------------------------------------------------------------------
  # _on_open_populate_verbs: ->
  #   paths = get_paths_and_formats()
  #   dskey = 'ds:dict:meanings';          @statements.insert_jzr_datasource.run { rowid: 't:ds:R=1', dskey, path: paths[ dskey ], }
  #   dskey = 'ds:dict:ucd:v14.0:uhdidx';  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=2', dskey, path: paths[ dskey ], }
  #   ;null

  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_mirror_lines: ->
    debug 'Ωjzrsdb__32', '_on_open_populate_jzr_mirror_lines'
    @statements.populate_jzr_mirror_lines.run()
    ;null

  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_glyphranges: ->
    debug 'Ωjzrsdb__33', '_on_open_populate_jzr_glyphranges'
    @statements.populate_jzr_glyphranges.run()
    ;null

  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_glyphs: ->
    debug 'Ωjzrsdb__34', '_on_open_populate_jzr_glyphs'
    try
      @statements.populate_jzr_glyphs.run()
    catch cause
      fields_rpr = rpr @state.most_recent_inserted_row
      throw new Error "Ωjzrsdb__35 when trying to insert this row: #{fields_rpr}, an error was thrown: #{cause.message}", \
        { cause, }
    ;null

  #---------------------------------------------------------------------------------------------------------
  trigger_on_before_insert: ( name, fields... ) ->
    # debug 'Ωjzrsdb__36', { name, fields, }
    @state.most_recent_inserted_row = { name, fields, }
    ;null

  #=========================================================================================================
  ###

  ooooo     ooo oooooooooo.   oooooooooooo
  `888'     `8' `888'   `Y8b  `888'     `8
   888       8   888      888  888          .oooo.o
   888       8   888      888  888oooo8    d88(  "8
   888       8   888      888  888    "    `"Y88b.
   `88.    .8'   888     d88'  888         o.  )88b
     `YbodP'    o888bood8P'   o888o        8""888P'

                                                                                                         ###
  #.........................................................................................................
  @functions:

    #-------------------------------------------------------------------------------------------------------
    jzr_trigger_on_before_insert:
      ### NOTE in the future this function could trigger creation of triggers on inserts ###
      deterministic:  true
      varargs:        true
      value: ( name, fields... ) -> @trigger_on_before_insert name, fields...

    #-------------------------------------------------------------------------------------------------------
    ### NOTE moved to Dbric_std; consider to overwrite with version using `slevithan/regex` ###
    # regexp:
    #   overwrite:      true
    #   deterministic:  true
    #   value: ( pattern, text ) -> if ( ( new RegExp pattern, 'v' ).test text ) then 1 else 0

    #-------------------------------------------------------------------------------------------------------
    jzr_has_peripheral_ws_in_jfield:
      deterministic:  true
      value: ( jfields_json ) ->
        return from_bool false unless ( jfields = JSON.parse jfields_json )?
        return from_bool false unless ( type_of jfields ) is 'list'
        return from_bool jfields.some ( value ) -> /(^\s)|(\s$)/.test value

    #-------------------------------------------------------------------------------------------------------
    jzr_chr_from_cid:
      deterministic:  true
      value: ( cid ) -> glyph_converter.glyph_from_cid cid

    #-------------------------------------------------------------------------------------------------------
    jzr_as_hex:
      deterministic:  true
      value: ( cid ) -> "0x#{( cid.toString 16 ).padStart 4, 0}"

    #-------------------------------------------------------------------------------------------------------
    jzr_integer_from_hex:
      deterministic:  true
      value: ( cid_hex ) -> parseInt cid_hex, 16

    # #-------------------------------------------------------------------------------------------------------
    # jzr_is_cjk_glyph:
    #   deterministic:  true
    #   value: ( cid ) -> "0x#{( cid.toString 16 ).padStart 4, 0}"

  #=========================================================================================================
  @table_functions:

    #-------------------------------------------------------------------------------------------------------
    jzr_split_words:
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
    jzr_walk_file_lines:
      columns:      [ 'line_nr', 'lcode', 'line', 'jfields' ]
      parameters:   [ 'dskey', 'format', 'path', ]
      rows: ( dskey, format, path ) ->
        yield from new Datasource_field_parser { host: @host, dskey, format, path, }
        ;null

    #-------------------------------------------------------------------------------------------------------
    jzr_walk_triples:
      parameters:   [ 'rowid_in', 'dskey', 'jfields', ]
      columns:      [ 'rowid_out', 'ref', 's', 'v', 'o', ]
      rows: ( rowid_in, dskey, jfields ) ->
        fields  = JSON.parse jfields
        entry   = fields[ 2 ]
        switch dskey
          when 'ds:dict:x:ko-Hang+Latn'     then yield from @triples_from_dict_x_ko_Hang_Latn       rowid_in, dskey, fields
          when 'ds:dict:meanings' then switch true
            when ( entry.startsWith 'py:' ) then yield from @triples_from_c_reading_zh_Latn_pinyin  rowid_in, dskey, fields
            when ( entry.startsWith 'ka:' ) then yield from @triples_from_c_reading_ja_x_Kan        rowid_in, dskey, fields
            when ( entry.startsWith 'hi:' ) then yield from @triples_from_c_reading_ja_x_Kan        rowid_in, dskey, fields
            when ( entry.startsWith 'hg:' ) then yield from @triples_from_c_reading_ko_Hang         rowid_in, dskey, fields
          when 'ds:shape:idsv2'             then yield from @triples_from_shape_idsv2               rowid_in, dskey, fields
          when 'ds:ucd:ucd'                 then yield from @triples_from_ucd_ucd                   rowid_in, dskey, fields
        ;null

    #-------------------------------------------------------------------------------------------------------
    jzr_disassemble_hangeul:
      parameters:   [ 'hang', ]
      columns:      [ 'initial', 'medial', 'final', ]
      rows: ( hang ) ->
        jamos = @host.language_services._TMP_hangeul.disassemble hang, { flatten: false, }
        for { first: initial, vowel: medial, last: final, } in jamos
          yield { initial, medial, final, }
        ;null

    #-------------------------------------------------------------------------------------------------------
    jzr_parse_ucdb_rsgs_glyphrange:
      parameters:   [ 'dskey', 'line_nr', 'jfields', ]
      columns:      [ 'rsg', 'is_cjk', 'lo', 'hi', 'name', ]
      rows: ( dskey, line_nr, jfields ) ->
        yield datasource_format_parser.parse_ucdb_rsgs_glyphrange { dskey, line_nr, jfields, }
        ;null

    #-------------------------------------------------------------------------------------------------------
    jzr_generate_cids_and_glyphs:
      deterministic:  true
      parameters:   [ 'lo', 'hi', ]
      columns:      [ 'cid', 'glyph', ]
      rows: ( lo, hi ) ->
        yield from glyph_converter.generate_cids_and_glyphs lo, hi
        ;null

  #---------------------------------------------------------------------------------------------------------
  triples_from_dict_x_ko_Hang_Latn: ( rowid_in, dskey, [ role, s, o, ] ) ->
    ref       = rowid_in
    v         = "v:x:ko-Hang+Latn:#{role}"
    o        ?= ''
    yield { rowid_out: @next_triple_rowid, ref, s, v, o, }
    @state.timeit_progress?()
    ;null

  #---------------------------------------------------------------------------------------------------------
  triples_from_c_reading_zh_Latn_pinyin: ( rowid_in, dskey, [ _, s, entry, ] ) ->
    ref       = rowid_in
    v         = 'v:c:reading:zh-Latn-pinyin'
    for reading from @host.language_services.extract_atonal_zh_readings entry
      yield { rowid_out: @next_triple_rowid, ref, s, v, o: reading, }
    @state.timeit_progress?()
    ;null

  #---------------------------------------------------------------------------------------------------------
  triples_from_c_reading_ja_x_Kan: ( rowid_in, dskey, [ _, s, entry, ] ) ->
    ref       = rowid_in
    if entry.startsWith 'ka:'
      v_x_Kan   = 'v:c:reading:ja-x-Kat'
      v_Latn    = 'v:c:reading:ja-x-Kat+Latn'
    else
      v_x_Kan   = 'v:c:reading:ja-x-Hir'
      v_Latn    = 'v:c:reading:ja-x-Hir+Latn'
    for reading from @host.language_services.extract_ja_readings entry
      yield { rowid_out: @next_triple_rowid, ref, s, v: v_x_Kan, o: reading, }
      # for transcription from @host.language_services.romanize_ja_kana reading
      #   yield { rowid_out: @next_triple_rowid, ref, s, v: v_Latn, o: transcription, }
      transcription = @host.language_services.romanize_ja_kana reading
      yield { rowid_out: @next_triple_rowid, ref, s, v: v_Latn, o: transcription, }
    @state.timeit_progress?()
    ;null

  #---------------------------------------------------------------------------------------------------------
  triples_from_c_reading_ko_Hang: ( rowid_in, dskey, [ _, s, entry, ] ) ->
    ref       = rowid_in
    v         = 'v:c:reading:ko-Hang'
    for reading from @host.language_services.extract_hg_readings entry
      yield { rowid_out: @next_triple_rowid, ref, s, v, o: reading, }
    @state.timeit_progress?()
    ;null

  #---------------------------------------------------------------------------------------------------------
  triples_from_shape_idsv2: ( rowid_in, dskey, [ _, s, formula, ] ) ->
    ref       = rowid_in
    # for reading from @host.language_services.parse_ids formula
    #   yield { rowid_out: @next_triple_rowid, ref, s, v, o: reading, }
    return null if ( not formula? ) or ( formula is '' )
    #.......................................................................................................
    yield { rowid_out: @next_triple_rowid, ref, s, v: 'v:c:shape:ids:S:formula', o: formula, }
    #.......................................................................................................
    error = null
    try formula_ast = @host.language_services.parse_idlx formula catch error
      o = JSON.stringify { ref: 'Ωjzrsdb__37', message: error.message, row: { rowid_in, dskey, s, formula, }, }
      warn "error: #{o}"
      yield { rowid_out: @next_triple_rowid, ref, s, v: 'v:c:shape:ids:error', o, }
    return null if error?
    #.......................................................................................................
    formula_json    = JSON.stringify formula_ast
    yield { rowid_out: @next_triple_rowid, ref, s, v: 'v:c:shape:ids:S:ast', o: formula_json, }
    #.......................................................................................................
    { operators,
      components, } = @host.language_services.operators_and_components_from_idlx formula_ast
    seen_operators  = new Set()
    seen_components = new Set()
    #.......................................................................................................
    components_json = JSON.stringify components
    yield { rowid_out: @next_triple_rowid, ref, s, v: 'v:c:shape:ids:S:components', o: components_json, }
    #.......................................................................................................
    for operator in operators
      continue if seen_operators.has operator
      seen_operators.add operator
      yield { rowid_out: @next_triple_rowid, ref, s, v: 'v:c:shape:ids:S:has-operator', o: operator, }
    #.......................................................................................................
    for component in components
      continue if seen_components.has component
      seen_components.add component
      yield { rowid_out: @next_triple_rowid, ref, s, v: 'v:c:shape:ids:S:has-component', o: component, }
    #.......................................................................................................
    @state.timeit_progress?()
    ;null

  #---------------------------------------------------------------------------------------------------------
  triples_from_ucd_ucd: ( rowid_in, dskey, [ _, s, entry, ] ) ->
    yield return null
    # ref       = rowid_in
    # v         = 'v:c:reading:ko-Hang'
    # for reading from @host.language_services.extract_hg_readings entry
    #   yield { rowid_out: @next_triple_rowid, ref, s, v, o: reading, }
    # @state.timeit_progress?()
    ;null


#===========================================================================================================
###

      .o8            .o88o.
     "888            888 `"
 .oooo888   .oooo.o o888oo     oo.ooooo.   .oooo.   oooo d8b  .oooo.o  .ooooo.  oooo d8b
d88' `888  d88(  "8  888        888' `88b `P  )88b  `888""8P d88(  "8 d88' `88b `888""8P
888   888  `"Y88b.   888        888   888  .oP"888   888     `"Y88b.  888ooo888  888
888   888  o.  )88b  888        888   888 d8(  888   888     o.  )88b 888    .o  888
`Y8bod88P" 8""888P' o888o       888bod8P' `Y888""8o d888b    8""888P' `Y8bod8P' d888b
                                888
                               o888o
                                                                                                         ###
#===========================================================================================================
class Datasource_field_parser

  #---------------------------------------------------------------------------------------------------------
  constructor: ({ host, dskey, format, path, }) ->
    @host     = host
    @dskey    = dskey
    @format   = format
    @path     = path
    ;undefined

  #---------------------------------------------------------------------------------------------------------
  [Symbol.iterator]: -> yield from @walk()

  #---------------------------------------------------------------------------------------------------------
  walk: ->
    debug 'Ωjzrsdb__38', "Datasource_field_parser::walk:", { format: @format, dskey: @dskey, }
    #.......................................................................................................
    method_name = 'walk_' + @format.replace /[^a-z]/gv, '_'
    method      = @[ method_name ] ? @_walk_no_such_parser
    yield from method.call @
    ;null

  #---------------------------------------------------------------------------------------------------------
  _walk_no_such_parser: ->
    message = "Ωjzrsdb__39 no parser found for format #{rpr @format}"
    warn message
    yield { line_nr: 0, lcode: 'E', line: message, jfields: null, }
    for { lnr: line_nr, line, eol, } from walk_lines_with_positions @path
      yield { line_nr, lcode: 'U', line, jfields: null, }
    ;null

  #---------------------------------------------------------------------------------------------------------
  _walk_fields_with_separator: ({ comment_re = /^\s*#/v, splitter = '\t', }) ->
    for { lnr: line_nr, line, eol, } from walk_lines_with_positions @path
      line    = @host.language_services.normalize_text line
      jfields = null
      switch true
        when /^\s*$/v.test line then lcode = 'B'
        when comment_re.test line then lcode = 'C'
        else
          lcode = 'D'
          jfields   = JSON.stringify line.split splitter
      yield { line_nr, lcode, line, jfields, }
    ;null

  #---------------------------------------------------------------------------------------------------------
  walk_dsf_tsv: ->
    yield from @_walk_fields_with_separator { splitter: '\t', }
    ;null

  #---------------------------------------------------------------------------------------------------------
  walk_dsf_semicolons: ->
    yield from @_walk_fields_with_separator { splitter: ';', }
    ;null

  #---------------------------------------------------------------------------------------------------------
  walk_dsf_md_table: ->
    for { lnr: line_nr, line, eol, } from walk_lines_with_positions @path
      line    = @host.language_services.normalize_text line
      jfields = null
      lcode   = 'U'
      switch true
        when /^\s*$/v.test line       then lcode = 'B'
        when not line.startsWith '|'  then null # not an MD table
        when line.startsWith '|-'     then null # MD table header separator
        when /^\|\s+\*/v.test line    then null # MD table header
        else
          lcode   = 'D'
          jfields = line.split '|'
          jfields.shift()
          jfields.pop()
          jfields = ( field.trim()                          for field in jfields )
          jfields = ( ( field.replace /^`(.+)`$/gv, '$1' )  for field in jfields )
          jfields = JSON.stringify jfields
          # debug 'Ωjzrsdb__40', jfields
      yield { line_nr, lcode, line, jfields, }
    ;null

  # #---------------------------------------------------------------------------------------------------------
  # walk_csv: ->
  #   yield return null

  # #---------------------------------------------------------------------------------------------------------
  # walk_json: ->
  #   yield return null

  # #---------------------------------------------------------------------------------------------------------
  # walk_md: ->
  #   yield return null

  # #---------------------------------------------------------------------------------------------------------
  # walk_txt: ->
  #   yield return null


#===========================================================================================================
class datasource_format_parser

  #---------------------------------------------------------------------------------------------------------
  @parse_ucdb_rsgs_glyphrange: ({ jfields, }) ->
    [ dgroup,
      iclabel,
      rsg,
      is_cjk_txt,
      lo_hi_txt,
      name,     ] = JSON.parse jfields
    return null unless dgroup is '`dg:rsgs`'
    lo_hi_re      = /// ^ 0x (?<lo> [0-9a-f]{1,6} ) \s*\.\.\s* 0x (?<hi> [0-9a-f]{1,6} ) $ ///iv
    #.......................................................................................................
    is_cjk = switch is_cjk_txt
      when 'true'   then 1
      when 'false'  then 0
      else throw new Error "Ωjzrsdb__41 expected 'true' or 'false', got #{rpr is_cjk_txt}"
    #.......................................................................................................
    unless ( match = lo_hi_txt.match lo_hi_re )?
      throw new Error "Ωjzrsdb__42 expected a range literal like '0x01a6..0x10ff', got #{rpr lo_hi_txt}"
    lo  = parseInt match.groups.lo, 16
    hi  = parseInt match.groups.hi, 16
    #.......................................................................................................
    return { rsg, is_cjk, lo, hi, name, }


#===========================================================================================================
class glyph_converter

  #---------------------------------------------------------------------------------------------------------
  @glyph_from_cid: ( cid ) ->
    return null unless ( /^[\p{L}\p{S}\p{P}\p{M}\p{N}\p{Zs}\p{Co}]$/v.test R = String.fromCodePoint cid )
    return R

  #---------------------------------------------------------------------------------------------------------
  @generate_cids_and_glyphs: ( lo, hi ) ->
    for cid in [ lo .. hi ]
      continue unless ( glyph = @glyph_from_cid cid )?
      yield { cid, glyph, }
    ;null



#===========================================================================================================
###

ooooo
`888'
 888          .oooo.   ooo. .oo.    .oooooooo              .oooo.o oooo d8b oooo    ooo
 888         `P  )88b  `888P"Y88b  888' `88b              d88(  "8 `888""8P  `88.  .8'
 888          .oP"888   888   888  888   888              `"Y88b.   888       `88..8'
 888       o d8(  888   888   888  `88bod8P'              o.  )88b  888        `888'
o888ooooood8 `Y888""8o o888o o888o `8oooooo.  ooooooooooo 8""888P' d888b        `8'
                                   d"     YD
                                   "Y88888P'
                                                                                                         ###
#===========================================================================================================
class Language_services

  #---------------------------------------------------------------------------------------------------------
  constructor: ->
    @_TMP_hangeul = require 'hangul-disassemble'
    @_TMP_kana    = require 'wanakana'
    # { toHiragana,
    #   toKana,
    #   toKatakana
    #   toRomaji,
    #   tokenize,         } = require 'wanakana'
    ;undefined

  #---------------------------------------------------------------------------------------------------------
  normalize_text: ( text, form = 'NFC' ) -> text.normalize form

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
    # debug 'Ωjzrsdb__43', @_TMP_hangeul.disassemble hangeul, { flatten: false, }
    return [ R..., ]

  #---------------------------------------------------------------------------------------------------------
  romanize_ja_kana: ( entry ) ->
    cfg = {}
    return @_TMP_kana.toRomaji entry, cfg
    # ### systematic name more like `..._ja_x_kan_latn()` ###
    # help 'Ωdjkr__44', toHiragana  'ラーメン',       { convertLongVowelMark: false, }
    # help 'Ωdjkr__45', toHiragana  'ラーメン',       { convertLongVowelMark: true, }
    # help 'Ωdjkr__46', toKana      'wanakana',   { customKanaMapping: { na: 'に', ka: 'Bana' }, }
    # help 'Ωdjkr__47', toKana      'wanakana',   { customKanaMapping: { waka: '(和歌)', wa: '(和2)', ka: '(歌2)', na: '(名)', ka: '(Bana)', naka: '(中)', }, }
    # help 'Ωdjkr__48', toRomaji    'つじぎり',     { customRomajiMapping: { じ: '(zi)', つ: '(tu)', り: '(li)', りょう: '(ryou)', りょ: '(ryo)' }, }

  #---------------------------------------------------------------------------------------------------------
  parse_idlx: ( formula ) -> IDLX.parse formula

  #---------------------------------------------------------------------------------------------------------
  operators_and_components_from_idlx: ( formula ) ->
    switch type = type_of formula
      when 'text'   then  formula_ast = @parse_idlx formula
      when 'list'   then  formula_ast =             formula
      else throw new Error "Ωjzrsdb__49 expected a text or a list, got a #{type}"
    operators   = []
    components  = []
    separate    = ( list ) ->
      for element, idx in list
        if idx is 0
          operators.push element
          continue
        if ( type_of element ) is 'list'
          separate element
          # components.splice components.length, 0, ( separate element )...
          continue
        components.push element
    separate formula_ast
    return { operators, components, }




#-----------------------------------------------------------------------------------------------------------
### TAINT goes into constructor of Jzr class ###

#===========================================================================================================
###

   oooo  o8o
   `888  `"'
    888 oooo    oooooooo oooo  oooo  oooo d8b  .oooo.
    888 `888   d'""7d8P  `888  `888  `888""8P `P  )88b
    888  888     .d8P'    888   888   888      .oP"888
    888  888   .d8P'  .P  888   888   888     d8(  888
.o. 88P o888o d8888888P   `V88V"V8P' d888b    `Y888""8o
`Y888P

                                                                                                          ###
#===========================================================================================================
class Jizura

  #---------------------------------------------------------------------------------------------------------
  constructor: ->
    { paths, }          = get_paths_and_formats()
    @paths              = paths
    @language_services  = new Language_services()
    @dba                = new Jzr_db_adapter @paths.db, { host: @, }
    #.......................................................................................................
    parameter_sets      = [
      { dskey: 'ds:dict:x:ko-Hang+Latn',  v_re: '|',    }
      { dskey: 'ds:dict:meanings',        v_re: '^py:', }
      { dskey: 'ds:dict:meanings',        v_re: '^ka:', }
      { dskey: 'ds:dict:meanings',        v_re: '^hi:', }
      { dskey: 'ds:dict:meanings',        v_re: '^hg:', }
      { dskey: 'ds:shape:idsv2',          v_re: '|',    }
      { dskey: 'ds:ucd:ucd',              v_re: '|',    }
      ]
    #.......................................................................................................
    if @dba.is_fresh
      ### TAINT move to Jzr_db_adapter together with try/catch ###
      for parameters in parameter_sets
        debug 'Ωjzrsdb__50', 'populate_jzr_mirror_triples', parameters
        try
          @dba.statements.populate_jzr_mirror_triples.run parameters
        catch cause
          fields_rpr = rpr @dba.state.most_recent_inserted_row
          throw new Error "Ωjzrsdb__51 when trying to insert this row: #{fields_rpr}, an error was thrown: #{cause.message}", \
            { cause, }
      #.......................................................................................................
      ### TAINT move to Jzr_db_adapter together with try/catch ###
      debug 'Ωjzrsdb__52', 'populate_jzr_lang_hangeul_syllables'
      try
        @dba.statements.populate_jzr_lang_hangeul_syllables.run()
      catch cause
        fields_rpr = rpr @dba.state.most_recent_inserted_row
        throw new Error "Ωjzrsdb__53 when trying to insert this row: #{fields_rpr}, an error was thrown: #{cause.message}", \
          { cause, }
    #.......................................................................................................
    ;undefined

  #---------------------------------------------------------------------------------------------------------
  show_counts: ->
    #.......................................................................................................
    do =>
      query = SQL"""
        select
            mv.v            as v,
            count( t3.v )   as count
          from        jzr_mirror_triples_base as t3
          right join  jzr_mirror_verbs        as mv using ( v )
        group by v
        order by count desc, v;"""
      echo ( grey 'Ωjzrsdb__54' ), ( gold reverse bold query )
      counts = ( @dba.prepare query ).all()
      console.table counts
    #.......................................................................................................
    do =>
      query = SQL"""
        select
            mv.v            as v,
            count( t3.v )   as count
          from        jzr_triples       as t3
          right join  jzr_mirror_verbs  as mv using ( v )
        group by v
        order by count desc, v;"""
      echo ( grey 'Ωjzrsdb__55' ), ( gold reverse bold query )
      counts = ( @dba.prepare query ).all()
      console.table counts
    #.......................................................................................................
    do =>
      query = SQL"""
        select dskey, count(*) as count from jzr_mirror_lines group by dskey union all
        select '*',   count(*) as count from jzr_mirror_lines
        order by count desc;"""
      echo ( grey 'Ωjzrsdb__56' ), ( gold reverse bold query )
      counts = ( @dba.prepare query ).all()
      counts = Object.fromEntries ( [ dskey, { count, }, ] for { dskey, count, } in counts )
      console.table counts
    #.......................................................................................................
    ;null

  #---------------------------------------------------------------------------------------------------------
  show_jzr_meta_faults: ->
    if ( faulty_rows = ( @dba.prepare SQL"select * from jzr_meta_faults;" ).all() ).length > 0
      echo 'Ωjzrsdb__57', red reverse bold " found some faults: "
      console.table faulty_rows
    else
      echo 'Ωjzrsdb__58', lime reverse bold " (no faults) "
    #.......................................................................................................
    ;null


#===========================================================================================================
module.exports = do =>
  internals = {
    Jzr_db_adapter,
    Datasource_field_parser,
    datasource_format_parser,
    Language_services,
    get_paths_and_formats, }
  return {
    Jizura,
    internals, }

#===========================================================================================================
if module is require.main then do =>
  jzr = new Jizura() # triggers rebuild of DB when necessary
  ;null

