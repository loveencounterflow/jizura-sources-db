

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
  SQL,                  } = SFMODULES.unstable.require_dbric()
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


#===========================================================================================================
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
get_paths = ->
  R                                   = {}
  R.base                              = PATH.resolve __dirname, '..'
  R.jzr                               = PATH.resolve R.base, '..'
  R.db                                = PATH.join R.base, 'jzr.db'
  # R.db                                = '/dev/shm/jzr.db'
  # R.jzrds                             = PATH.join R.base, 'jzrds'
  R.jzrnds                            = PATH.join R.base, 'jizura-new-datasources'
  R.mojikura                          = PATH.join R.jzrnds, 'mojikura'
  R.raw_github                        = PATH.join R.jzrnds, 'bvfs/origin/https/raw.githubusercontent.com'
  kanjium                             = PATH.join R.raw_github, 'mifunetoshiro/kanjium/8a0cdaa16d64a281a2048de2eee2ec5e3a440fa6'
  rutopio                             = PATH.join R.raw_github, 'rutopio/Korean-Name-Hanja-Charset/12df1ba1b4dfaa095813e4ddfba424e816f94c53'
  # R[ 'dict:ucd:v14.0:uhdidx'      ]   = PATH.join R.jzrnds, 'unicode.org-ucd-v14.0/Unihan_DictionaryIndices.txt'
  R[ 'dict:x:ko-Hang+Latn'        ]   = PATH.join R.jzrnds, 'hangeul-transcriptions.tsv'
  R[ 'dict:x:ja-Kan+Latn'         ]   = PATH.join R.jzrnds, 'kana-transcriptions.tsv'
  R[ 'dict:bcp47'                 ]   = PATH.join R.jzrnds, 'BCP47-language-scripts-regions.tsv'
  R[ 'dict:ja:kanjium'            ]   = PATH.join kanjium, 'data/source_files/kanjidict.txt'
  R[ 'dict:ja:kanjium:aux'        ]   = PATH.join kanjium, 'data/source_files/0_README.txt'
  R[ 'dict:ko:V=data-gov.csv'     ]   = PATH.join rutopio, 'data-gov.csv'
  R[ 'dict:ko:V=data-gov.json'    ]   = PATH.join rutopio, 'data-gov.json'
  R[ 'dict:ko:V=data-naver.csv'   ]   = PATH.join rutopio, 'data-naver.csv'
  R[ 'dict:ko:V=data-naver.json'  ]   = PATH.join rutopio, 'data-naver.json'
  R[ 'dict:ko:V=README.md'        ]   = PATH.join rutopio, 'README.md'
  R[ 'dict:meanings'              ]   = PATH.join R.mojikura, '/meaning/meanings.txt'
  R[ 'shape:idsv2'                ]   = PATH.join R.mojikura, '/shape/shape-breakdown-formula-v2.txt'
  R[ 'shape:zhz5bf'               ]   = PATH.join R.mojikura, '/shape/shape-strokeorder-zhaziwubifa.txt'
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
          warn 'Ωjzrsdb___4', error.message
      return null if messages.length is 0
      throw new Error "Ωjzrsdb___5 EFFRI testing revealed errors: #{rpr messages}"
      ;null
    #.......................................................................................................
    if @is_fresh
      @_on_open_populate_jzr_datasources()
      @_on_open_populate_jzr_mirror_verbs()
      @_on_open_populate_jzr_mirror_lcodes()
      @_on_open_populate_jzr_mirror_lines()
      @_on_open_populate_jzr_mirror_triples_for_meanings()
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
      check ( rowid = 't:mr:lc:V=' || lcode ) );"""

    #.......................................................................................................
    SQL"""create table jzr_mirror_lines (
        -- 't:jfm:'
        rowid     text    unique  not null,
        ref       text    unique  not null generated always as ( dskey || ':L=' || line_nr ) virtual,
        dskey     text            not null,
        line_nr   integer         not null,
        lcode     text            not null,
        line      text            not null,
        jfields   json                null,
      primary key ( rowid ),
      check ( rowid regexp '^t:mr:ln:R=\\d+$'),
      unique ( dskey, line_nr ),
      foreign key ( lcode ) references jzr_mirror_lcodes ( lcode ) );"""

    #.......................................................................................................
    SQL"""create table jzr_mirror_verbs (
        rowid     text    unique  not null,
        rank      integer         not null default 1,
        s         text            not null,
        v         text    unique  not null,
        o         text            not null,
      primary key ( rowid ),
      check ( rowid regexp '^t:mr:vb:V=[\\-:\\+\\p{L}]+$' ),
      check ( rank > 0 ) );"""

    #.......................................................................................................
    SQL"""create table jzr_mirror_triples_base (
        rowid     text    unique  not null,
        ref       text            not null,
        s         text            not null,
        v         text            not null,
        o         json            not null,
      primary key ( rowid ),
      check ( rowid regexp '^t:mr:3pl:R=\\d+$' ),
      -- unique ( ref, s, v, o )
      foreign key ( ref ) references jzr_mirror_lines ( rowid ),
      foreign key ( v   ) references jzr_mirror_verbs ( v ) );"""

    #.......................................................................................................
    SQL"""create trigger jzr_mirror_triples_register
      before insert on jzr_mirror_triples_base
      for each row begin
        select trigger_on_before_insert( 'jzr_mirror_triples_base',
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
      check ( rowid regexp '^t:lang:hang:syl:V=\\S+$' )
      -- unique ( ref, s, v, o )
      -- foreign key ( ref ) references jzr_mirror_lines ( rowid )
      -- foreign key ( syllable_hang ) references jzr_mirror_triples_base ( o ) )
      );"""

    #.......................................................................................................
    SQL"""create trigger jzr_lang_hang_syllables_register
      before insert on jzr_lang_hang_syllables
      for each row begin
        select trigger_on_before_insert( 'jzr_lang_hang_syllables',
          new.rowid, new.ref, new.syllable_hang, new.syllable_latn,
            new.initial_hang, new.medial_hang, new.final_hang,
            new.initial_latn, new.medial_latn, new.final_latn );
        end;"""

    #.......................................................................................................
    SQL"""create view jzr_lang_kr_readings_triples as
      select null as rowid, null as ref, null as s, null as v, null as o where false union all
      -- ...................................................................................................
      select rowid, ref, syllable_hang, 'c:reading:ko-Latn',          syllable_latn   from jzr_lang_hang_syllables union all
      select rowid, ref, syllable_hang, 'c:reading:ko-Latn:initial',  initial_latn    from jzr_lang_hang_syllables union all
      select rowid, ref, syllable_hang, 'c:reading:ko-Latn:medial',   medial_latn     from jzr_lang_hang_syllables union all
      select rowid, ref, syllable_hang, 'c:reading:ko-Latn:final',    final_latn      from jzr_lang_hang_syllables union all
      select rowid, ref, syllable_hang, 'c:reading:ko-Hang:initial',  initial_hang    from jzr_lang_hang_syllables union all
      select rowid, ref, syllable_hang, 'c:reading:ko-Hang:medial',   medial_hang     from jzr_lang_hang_syllables union all
      select rowid, ref, syllable_hang, 'c:reading:ko-Hang:final',    final_hang      from jzr_lang_hang_syllables union all
      -- ...................................................................................................
      select null, null, null, null, null where false
      ;"""

    #.......................................................................................................
    SQL"""create view jzr_all_triples as
      select null as rowid, null as ref, null as s, null as v, null as o where false union all
      -- ...................................................................................................
      select * from jzr_mirror_triples_base union all
      select * from jzr_lang_kr_readings_triples union all
      -- ...................................................................................................
      select null, null, null, null, null where false
      ;"""

    #.......................................................................................................
    SQL"""create view jzr_triples as
      select null as rowid, null as ref, null as rank, null as s, null as v, null as o where false
      -- -- ...................................................................................................
      union all
      select tb1.rowid, tb1.ref, vb1.rank, tb1.s, tb1.v, tb1.o from jzr_mirror_triples_base as tb1
      join jzr_mirror_verbs as vb1 using ( v )
      where vb1.v like 'c:%'
      -- ...................................................................................................
      union all
      select tb2.rowid, tb2.ref, vb2.rank, tb2.s, kr.v, kr.o from jzr_mirror_triples_base as tb2
      join jzr_lang_kr_readings_triples as kr on ( tb2.v = 'c:reading:ko-Hang' and tb2.o = kr.s )
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

    #=======================================================================================================
    SQL"""create view jzr_cjk_agg_latn as
      select distinct
          s                             as s,
          v || ':all'                   as v,
          json_group_array( o ) over w  as os
        from jzr_top_triples
        where v in ( 'c:reading:zh-Latn-pinyin','c:reading:ja-x-Kat+Latn', 'c:reading:ko-Latn')
        window w as ( partition by s, v order by o
          rows between unbounded preceding and unbounded following )
        order by s, v, os
      ;"""

    #-------------------------------------------------------------------------------------------------------
    SQL"""create view jzr_cjk_agg2_latn as
      select distinct
          tt1.s   as s,
          tt2.os  as readings_zh,
          tt3.os  as readings_ja,
          tt4.os  as readings_ko
        from      jzr_cjk_agg_latn as tt1
        left join jzr_cjk_agg_latn as tt2 on ( tt1.s = tt2.s and tt2.v = 'c:reading:zh-Latn-pinyin:all' )
        left join jzr_cjk_agg_latn as tt3 on ( tt1.s = tt3.s and tt3.v = 'c:reading:ja-x-Kat+Latn:all'  )
        left join jzr_cjk_agg_latn as tt4 on ( tt1.s = tt4.s and tt4.v = 'c:reading:ko-Latn:all'        )
        order by s
      ;"""

    #-------------------------------------------------------------------------------------------------------
    SQL"""create view jzr_reading_pairs_zh_ja as
      select distinct
          t1.s      as s,
          t2.value  as reading_zh,
          t3.value  as reading_ja
        from jzr_cjk_agg2_latn as t1,
        json_each( t1.readings_zh ) as t2,
        json_each( t1.readings_ja ) as t3
        where reading_zh not in ( 'yu', 'chi' ) -- exclude non-homophones
        order by t2.value, t3.value
      ;"""

    #-------------------------------------------------------------------------------------------------------
    SQL"""create view jzr_reading_pairs_zh_ja_agg as
      select distinct
          reading_zh,
          reading_ja,
          json_group_array( s ) over w as chrs
        from jzr_reading_pairs_zh_ja as t1
        window w as ( partition by t1.reading_zh, t1.reading_ja order by t1.s
          rows between unbounded preceding and unbounded following )
      order by reading_zh, reading_ja
      ;"""

    #-------------------------------------------------------------------------------------------------------
    SQL"""create view jzr_reading_pairs_zh_ko as
      select distinct
          t1.s      as s,
          t2.value  as reading_zh,
          t3.value  as reading_ko
        from jzr_cjk_agg2_latn as t1,
        json_each( t1.readings_zh ) as t2,
        json_each( t1.readings_ko ) as t3
        where reading_zh not in ( 'yu', 'chi' ) -- exclude non-homophones
        order by t2.value, t3.value
      ;"""

    #-------------------------------------------------------------------------------------------------------
    SQL"""create view jzr_reading_pairs_zh_ko_agg as
      select distinct
          reading_zh,
          reading_ko,
          json_group_array( s ) over w as chrs
        from jzr_reading_pairs_zh_ko as t1
        window w as ( partition by t1.reading_zh, t1.reading_ko order by t1.s
          rows between unbounded preceding and unbounded following )
      order by reading_zh, reading_ko
      ;"""

    #-------------------------------------------------------------------------------------------------------
    SQL"""create view jzr_equivalent_reading_triples as
      select
          t1.reading_zh as reading_zh,
          t1.reading_ja as reading_ja,
          t2.reading_ko as reading_ko,
          t1.s          as s
        from jzr_reading_pairs_zh_ja as t1
        join jzr_reading_pairs_zh_ko as t2 on ( t1.s = t2.s and t1.reading_zh = t2.reading_ko )
        where t1.reading_zh = t1.reading_ja
        order by t1.reading_zh, t1.s
      ;"""

    #-------------------------------------------------------------------------------------------------------
    SQL"""create view jzr_band_names as
      select distinct
          t1.s                                  as c1,
          t2.s                                  as c2,
          t1.reading_zh || ' ' || t2.reading_zh as reading
        from jzr_equivalent_reading_triples as t1
        join jzr_equivalent_reading_triples as t2
        where true
          and ( c1 != c2 )
          and ( c1 not in ( '満', '蟇', '弥', '侭', '尽', '弹', '弾' ) )
          and ( c2 not in ( '満', '蟇', '弥', '侭', '尽', '弹', '弾' ) )
        order by reading
      ;"""

    #-------------------------------------------------------------------------------------------------------
    SQL"""create view jzr_band_names_2 as
      select
          c1 || c2 as c
        from jzr_band_names
        order by reading
      ;"""


    #=======================================================================================================
    SQL"""create view _jzr_meta_uc_normalization_faults as select
        ml.rowid  as rowid,
        ml.ref    as ref,
        ml.line   as line
      from jzr_mirror_lines as ml
      where true
        and ( not is_uc_normal( ml.line ) )
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
    SQL"""create view jzr_meta_faults as
      select null as count, null as rowid, null as ref, null as description, null  as quote where false union all
      -- ...................................................................................................
      select 1, rowid, ref,  'uc-normalization', line  as quote from _jzr_meta_uc_normalization_faults          union all
      select *                                                  from _jzr_meta_kr_readings_unknown_verb_faults  union all
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
    insert_jzr_datasource: SQL"""
      insert into jzr_datasources ( rowid, dskey, path ) values ( $rowid, $dskey, $path )
        -- on conflict ( dskey ) do update set path = excluded.path
        ;"""

    #.......................................................................................................
    insert_jzr_mirror_verb: SQL"""
      insert into jzr_mirror_verbs ( rowid, rank, s, v, o ) values ( $rowid, $rank, $s, $v, $o )
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
      insert into jzr_mirror_lines ( rowid, dskey, line_nr, lcode, line, jfields )
      select
        't:mr:ln:R=' || row_number() over ()          as rowid,
        -- ds.dskey || ':L=' || fl.line_nr   as rowid,
        ds.dskey                          as dskey,
        fl.line_nr                        as line_nr,
        fl.lcode                          as lcode,
        fl.line                           as line,
        fl.jfields                        as jfields
      from jzr_datasources        as ds
      join file_lines( ds.path )  as fl
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
          from jzr_mirror_lines                               as ml
          join get_triples( ml.rowid, ml.dskey, ml.jfields )  as gt
          where true
            and ( ml.lcode = 'D' )
            -- and ( ml.dskey = 'dict:meanings' )
            and ( ml.jfields is not null )
            and ( ml.jfields->>'$[0]' not regexp '^@glyphs' )
            -- and ( ml.field_3 regexp '^(?:py|hi|ka):' )
        -- on conflict ( ref, s, v, o ) do nothing
        ;"""

    #.......................................................................................................
    populate_jzr_lang_hangeul_syllables: SQL"""
      insert into jzr_lang_hang_syllables ( rowid, ref,
        syllable_hang, initial_hang, medial_hang, final_hang,
                        initial_latn, medial_latn, final_latn
                        )
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
          from jzr_mirror_triples_base             as mt
          left join disassemble_hangeul( mt.o )    as dh
          left join jzr_mirror_triples_base as mti on ( mti.s = dh.initial and mti.v = 'x:ko-Hang+Latn:initial' )
          left join jzr_mirror_triples_base as mtm on ( mtm.s = dh.medial  and mtm.v = 'x:ko-Hang+Latn:medial'  )
          left join jzr_mirror_triples_base as mtf on ( mtf.s = dh.final   and mtf.v = 'x:ko-Hang+Latn:final'   )
          where true
            and ( mt.v = 'c:reading:ko-Hang' )
          order by mt.o
        -- on conflict ( rowid         ) do nothing
        /* ### NOTE `on conflict` needed because we log all actually occurring readings of all characters */
        on conflict ( syllable_hang ) do nothing
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
    debug 'Ωjzrsdb___6', '_on_open_populate_jzr_mirror_lcodes'
    @statements.insert_jzr_mirror_lcode.run { rowid: 't:mr:lc:V=B', lcode: 'B', comment: 'blank line',   }
    @statements.insert_jzr_mirror_lcode.run { rowid: 't:mr:lc:V=C', lcode: 'C', comment: 'comment line', }
    @statements.insert_jzr_mirror_lcode.run { rowid: 't:mr:lc:V=D', lcode: 'D', comment: 'data line',    }
    ;null

  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_mirror_verbs: ->
    ### NOTE
    in verbs, initial component indicates type of subject:
      `c:` is for subjects that are CJK characters
      `x:` is used for unclassified subjects (possibly to be refined in the future)
    ###
    debug 'Ωjzrsdb___7', '_on_open_populate_jzr_mirror_verbs'
    rows = [
      { rowid: 't:mr:vb:V=x:ko-Hang+Latn:initial',    rank: 2, s: "NN", v: 'x:ko-Hang+Latn:initial',     o: "NN", }
      { rowid: 't:mr:vb:V=x:ko-Hang+Latn:medial',     rank: 2, s: "NN", v: 'x:ko-Hang+Latn:medial',      o: "NN", }
      { rowid: 't:mr:vb:V=x:ko-Hang+Latn:final',      rank: 2, s: "NN", v: 'x:ko-Hang+Latn:final',       o: "NN", }
      { rowid: 't:mr:vb:V=c:reading:zh-Latn-pinyin',  rank: 1, s: "NN", v: 'c:reading:zh-Latn-pinyin',   o: "NN", }
      { rowid: 't:mr:vb:V=c:reading:ja-x-Kan',        rank: 1, s: "NN", v: 'c:reading:ja-x-Kan',         o: "NN", }
      { rowid: 't:mr:vb:V=c:reading:ja-x-Hir',        rank: 1, s: "NN", v: 'c:reading:ja-x-Hir',         o: "NN", }
      { rowid: 't:mr:vb:V=c:reading:ja-x-Kat',        rank: 1, s: "NN", v: 'c:reading:ja-x-Kat',         o: "NN", }
      { rowid: 't:mr:vb:V=c:reading:ja-x-Latn',       rank: 1, s: "NN", v: 'c:reading:ja-x-Latn',        o: "NN", }
      { rowid: 't:mr:vb:V=c:reading:ja-x-Hir+Latn',   rank: 1, s: "NN", v: 'c:reading:ja-x-Hir+Latn',    o: "NN", }
      { rowid: 't:mr:vb:V=c:reading:ja-x-Kat+Latn',   rank: 1, s: "NN", v: 'c:reading:ja-x-Kat+Latn',    o: "NN", }
      { rowid: 't:mr:vb:V=c:reading:ko-Hang',         rank: 1, s: "NN", v: 'c:reading:ko-Hang',          o: "NN", }
      { rowid: 't:mr:vb:V=c:reading:ko-Latn',         rank: 1, s: "NN", v: 'c:reading:ko-Latn',          o: "NN", }
      { rowid: 't:mr:vb:V=c:reading:ko-Hang:initial', rank: 2, s: "NN", v: 'c:reading:ko-Hang:initial',  o: "NN", }
      { rowid: 't:mr:vb:V=c:reading:ko-Hang:medial',  rank: 2, s: "NN", v: 'c:reading:ko-Hang:medial',   o: "NN", }
      { rowid: 't:mr:vb:V=c:reading:ko-Hang:final',   rank: 2, s: "NN", v: 'c:reading:ko-Hang:final',    o: "NN", }
      { rowid: 't:mr:vb:V=c:reading:ko-Latn:initial', rank: 2, s: "NN", v: 'c:reading:ko-Latn:initial',  o: "NN", }
      { rowid: 't:mr:vb:V=c:reading:ko-Latn:medial',  rank: 2, s: "NN", v: 'c:reading:ko-Latn:medial',   o: "NN", }
      { rowid: 't:mr:vb:V=c:reading:ko-Latn:final',   rank: 2, s: "NN", v: 'c:reading:ko-Latn:final',    o: "NN", }
      ]
    for row in rows
      @statements.insert_jzr_mirror_verb.run row
    ;null

  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_datasources: ->
    debug 'Ωjzrsdb___8', '_on_open_populate_jzr_datasources'
    paths = get_paths()
    # dskey = 'dict:ucd:v14.0:uhdidx';  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=2', dskey, path: paths[ dskey ], }
    dskey = 'dict:meanings';              @statements.insert_jzr_datasource.run { rowid: 't:ds:R=1', dskey, path: paths[ dskey ], }
    dskey = 'dict:x:ko-Hang+Latn';        @statements.insert_jzr_datasource.run { rowid: 't:ds:R=2', dskey, path: paths[ dskey ], }
    dskey = 'dict:x:ja-Kan+Latn';         @statements.insert_jzr_datasource.run { rowid: 't:ds:R=3', dskey, path: paths[ dskey ], }
    # dskey = 'dict:ja:kanjium';            @statements.insert_jzr_datasource.run { rowid: 't:ds:R=4', dskey, path: paths[ dskey ], }
    # dskey = 'dict:ja:kanjium:aux';        @statements.insert_jzr_datasource.run { rowid: 't:ds:R=5', dskey, path: paths[ dskey ], }
    # dskey = 'dict:ko:V=data-gov.csv';     @statements.insert_jzr_datasource.run { rowid: 't:ds:R=6', dskey, path: paths[ dskey ], }
    # dskey = 'dict:ko:V=data-gov.json';    @statements.insert_jzr_datasource.run { rowid: 't:ds:R=7', dskey, path: paths[ dskey ], }
    # dskey = 'dict:ko:V=data-naver.csv';   @statements.insert_jzr_datasource.run { rowid: 't:ds:R=8', dskey, path: paths[ dskey ], }
    # dskey = 'dict:ko:V=data-naver.json';  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=9', dskey, path: paths[ dskey ], }
    # dskey = 'dict:ko:V=README.md';        @statements.insert_jzr_datasource.run { rowid: 't:ds:R=10', dskey, path: paths[ dskey ], }
    dskey = 'shape:idlv2';                @statements.insert_jzr_datasource.run { rowid: 't:ds:R=11', dskey, path: paths[ dskey ], }
    dskey = 'shape:zhz5bf';               @statements.insert_jzr_datasource.run { rowid: 't:ds:R=12', dskey, path: paths[ dskey ], }
    ;null

  # #---------------------------------------------------------------------------------------------------------
  # _on_open_populate_verbs: ->
  #   paths = get_paths()
  #   dskey = 'dict:meanings';          @statements.insert_jzr_datasource.run { rowid: 't:ds:R=1', dskey, path: paths[ dskey ], }
  #   dskey = 'dict:ucd:v14.0:uhdidx';  @statements.insert_jzr_datasource.run { rowid: 't:ds:R=2', dskey, path: paths[ dskey ], }
  #   ;null

  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_mirror_lines: ->
    debug 'Ωjzrsdb___9', '_on_open_populate_jzr_mirror_lines'
    @statements.populate_jzr_mirror_lines.run()
    ;null

  #---------------------------------------------------------------------------------------------------------
  _on_open_populate_jzr_mirror_triples_for_meanings: ->
    # ;null

  #---------------------------------------------------------------------------------------------------------
  trigger_on_before_insert: ( name, fields... ) ->
    # debug 'Ωjzrsdb__10', { name, fields, }
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
    trigger_on_before_insert:
      ### NOTE in the future this function could trigger creation of triggers on inserts ###
      deterministic:  true
      varargs:        true
      call: ( name, fields... ) -> @trigger_on_before_insert name, fields...

    #-------------------------------------------------------------------------------------------------------
    ### NOTE moved to Dbric_std; consider to overwrite with version using `slevithan/regex` ###
    # regexp:
    #   overwrite:      true
    #   deterministic:  true
    #   call: ( pattern, text ) -> if ( ( new RegExp pattern, 'v' ).test text ) then 1 else 0

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
      columns:      [ 'line_nr', 'lcode', 'line', 'jfields' ]
      parameters:   [ 'path', ]
      rows: ( path ) ->
        for { lnr: line_nr, line, eol, } from walk_lines_with_positions path
          line    = @host.language_services.normalize_text line
          jfields = null
          switch true
            when /^\s*$/v.test line
              lcode = 'B'
            when /^\s*#/v.test line
              lcode = 'C'
            else
              lcode = 'D'
              jfields   = JSON.stringify line.split '\t'
          yield { line_nr, lcode, line, jfields, }
        ;null

    #-------------------------------------------------------------------------------------------------------
    get_triples:
      parameters:   [ 'rowid_in', 'dskey', 'jfields', ]
      columns:      [ 'rowid_out', 'ref', 's', 'v', 'o', ]
      rows: ( rowid_in, dskey, jfields ) ->
        fields  = JSON.parse jfields
        entry   = fields[ 2 ]
        switch dskey
          when 'dict:x:ko-Hang+Latn'        then yield from @triplets_from_dict_x_ko_Hang_Latn      rowid_in, dskey, fields
          when 'dict:meanings' then switch true
            when ( entry.startsWith 'py:' ) then yield from @triplets_from_c_reading_zh_Latn_pinyin rowid_in, dskey, fields
            when ( entry.startsWith 'ka:' ) then yield from @triplets_from_c_reading_ja_x_Kan       rowid_in, dskey, fields
            when ( entry.startsWith 'hi:' ) then yield from @triplets_from_c_reading_ja_x_Kan       rowid_in, dskey, fields
            when ( entry.startsWith 'hg:' ) then yield from @triplets_from_c_reading_ko_Hang        rowid_in, dskey, fields
        # yield from @get_triples rowid_in, dskey, jfields
        ;null

    #-------------------------------------------------------------------------------------------------------
    disassemble_hangeul:
      parameters:   [ 'hang', ]
      columns:      [ 'initial', 'medial', 'final', ]
      rows: ( hang ) ->
        jamos = @host.language_services._TMP_hangeul.disassemble hang, { flatten: false, }
        for { first: initial, vowel: medial, last: final, } in jamos
          yield { initial, medial, final, }
        ;null

  #---------------------------------------------------------------------------------------------------------
  triplets_from_dict_x_ko_Hang_Latn: ( rowid_in, dskey, [ role, s, o, ] ) ->
    ref       = rowid_in
    v         = "x:ko-Hang+Latn:#{role}"
    o        ?= ''
    yield { rowid_out: @next_triple_rowid, ref, s, v, o, }
    @state.timeit_progress?()
    ;null

  #---------------------------------------------------------------------------------------------------------
  triplets_from_c_reading_zh_Latn_pinyin: ( rowid_in, dskey, [ _, s, entry, ] ) ->
    ref       = rowid_in
    v         = 'c:reading:zh-Latn-pinyin'
    for reading from @host.language_services.extract_atonal_zh_readings entry
      yield { rowid_out: @next_triple_rowid, ref, s, v, o: reading, }
    @state.timeit_progress?()
    ;null

  #---------------------------------------------------------------------------------------------------------
  triplets_from_c_reading_ja_x_Kan: ( rowid_in, dskey, [ _, s, entry, ] ) ->
    ref       = rowid_in
    if entry.startsWith 'ka:'
      v_x_Kan   = 'c:reading:ja-x-Kat'
      v_Latn    = 'c:reading:ja-x-Kat+Latn'
    else
      v_x_Kan   = 'c:reading:ja-x-Hir'
      v_Latn    = 'c:reading:ja-x-Hir+Latn'
    for reading from @host.language_services.extract_ja_readings entry
      yield { rowid_out: @next_triple_rowid, ref, s, v: v_x_Kan, o: reading, }
      # for transcription from @host.language_services.romanize_ja_kana reading
      #   yield { rowid_out: @next_triple_rowid, ref, s, v: v_Latn, o: transcription, }
      transcription = @host.language_services.romanize_ja_kana reading
      yield { rowid_out: @next_triple_rowid, ref, s, v: v_Latn, o: transcription, }
    @state.timeit_progress?()
    ;null

  #---------------------------------------------------------------------------------------------------------
  triplets_from_c_reading_ko_Hang: ( rowid_in, dskey, [ _, s, entry, ] ) ->
    ref       = rowid_in
    v         = 'c:reading:ko-Hang'
    for reading from @host.language_services.extract_hg_readings entry
      yield { rowid_out: @next_triple_rowid, ref, s, v, o: reading, }
    @state.timeit_progress?()
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
    # debug 'Ωjzrsdb__11', @_TMP_hangeul.disassemble hangeul, { flatten: false, }
    return [ R..., ]

  #---------------------------------------------------------------------------------------------------------
  romanize_ja_kana: ( entry ) ->
    cfg = {}
    return @_TMP_kana.toRomaji entry, cfg
    # ### systematic name more like `..._ja_x_kan_latn()` ###
    # help 'Ωdjkr__12', toHiragana  'ラーメン',       { convertLongVowelMark: false, }
    # help 'Ωdjkr__13', toHiragana  'ラーメン',       { convertLongVowelMark: true, }
    # help 'Ωdjkr__14', toKana      'wanakana',   { customKanaMapping: { na: 'に', ka: 'Bana' }, }
    # help 'Ωdjkr__15', toKana      'wanakana',   { customKanaMapping: { waka: '(和歌)', wa: '(和2)', ka: '(歌2)', na: '(名)', ka: '(Bana)', naka: '(中)', }, }
    # help 'Ωdjkr__16', toRomaji    'つじぎり',     { customRomajiMapping: { じ: '(zi)', つ: '(tu)', り: '(li)', りょう: '(ryou)', りょ: '(ryo)' }, }

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
    @paths              = get_paths()
    @language_services  = new Language_services()
    @dba                = new Jzr_db_adapter @paths.db, { host: @, }
    #.......................................................................................................
    if @dba.is_fresh
    ### TAINT move to Jzr_db_adapter together with try/catch ###
      try
        @populate_meaning_mirror_triples()
      catch cause
        fields_rpr = rpr @dba.state.most_recent_inserted_row
        throw new Error "Ωjzrsdb__17 when trying to insert this row: #{fields_rpr}, an error was thrown: #{cause.message}", \
          { cause, }
      #.......................................................................................................
      ### TAINT move to Jzr_db_adapter together with try/catch ###
      try
        @populate_hangeul_syllables()
      catch cause
        fields_rpr = rpr @dba.state.most_recent_inserted_row
        throw new Error "Ωjzrsdb__18 when trying to insert this row: #{fields_rpr}, an error was thrown: #{cause.message}", \
          { cause, }
    #.......................................................................................................
    ;undefined

  #---------------------------------------------------------------------------------------------------------
  populate_meaning_mirror_triples: ->
    do =>
      { total_row_count, } = ( @dba.prepare SQL"""
        select
            count(*) as total_row_count
          from jzr_mirror_lines
          where true
            and ( dskey is 'dict:meanings' )
            and ( jfields is not null ) -- NOTE: necessary
            and ( not jfields->>'$[0]' regexp '^@glyphs' );""" ).get()
      total = total_row_count * 2 ### NOTE estimate ###
      help 'Ωjzrsdb__19', { total_row_count, total, } # { total_row_count: 40086, total: 80172 }
    #.......................................................................................................
    @dba.statements.populate_jzr_mirror_triples.run()
    ;null

  #---------------------------------------------------------------------------------------------------------
  populate_hangeul_syllables: ->
    @dba.statements.populate_jzr_lang_hangeul_syllables.run()
    #.......................................................................................................
    ;null

  # #---------------------------------------------------------------------------------------------------------
  # _show_jzr_meta_uc_normalization_faults: ->
  #   faulty_rows = ( @dba.prepare SQL"select * from _jzr_meta_uc_normalization_faults;" ).all()
  #   warn 'Ωjzrsdb__20', reverse faulty_rows
  #   # for row from
  #   #.......................................................................................................
  #   ;null

  #---------------------------------------------------------------------------------------------------------
  show_counts: ->
    do =>
      query = SQL"select v, count(*) from jzr_mirror_triples_base group by v;"
      echo ( grey 'Ωjzrsdb__23' ), ( gold reverse bold query )
      counts = ( @dba.prepare query ).all()
      console.table counts
    #.......................................................................................................
    do =>
      query = SQL"select v, count(*) from jzr_triples group by v;"
      echo ( grey 'Ωjzrsdb__24' ), ( gold reverse bold query )
      counts = ( @dba.prepare query ).all()
      console.table counts
    #.......................................................................................................
    do =>
      query = SQL"""
        select dskey, count(*) as count from jzr_mirror_lines group by dskey union all
        select '*',   count(*) as count from jzr_mirror_lines
        order by count desc;"""
      echo ( grey 'Ωjzrsdb__25' ), ( gold reverse bold query )
      counts = ( @dba.prepare query ).all()
      counts = Object.fromEntries ( [ dskey, { count, }, ] for { dskey, count, } in counts )
      console.table counts
    #.......................................................................................................
    ;null

  #---------------------------------------------------------------------------------------------------------
  show_jzr_meta_faults: ->
    if ( faulty_rows = ( @dba.prepare SQL"select * from jzr_meta_faults;" ).all() ).length > 0
      echo 'Ωjzrsdb__26', red reverse bold " found some faults: "
      console.table faulty_rows
    else
      echo 'Ωjzrsdb__27', lime reverse bold " (no faults) "
    #.......................................................................................................
    ;null

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
  # c:reading:ja-x-Hir
  # c:reading:ja-x-Kat
  if false
    seen = new Set()
    for { reading, } from jzr.dba.walk SQL"select distinct( o ) as reading from jzr_triples where v = 'c:reading:ja-x-Kat' order by o;"
      for part in ( reading.split /(.ー|.ャ|.ュ|.ョ|ッ.|.)/v ) when part isnt ''
        continue if seen.has part
        seen.add part
        echo part
    for { reading, } from jzr.dba.walk SQL"select distinct( o ) as reading from jzr_triples where v = 'c:reading:ja-x-Hir' order by o;"
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
  debug 'Ωjzrsdb__28', Undumper.undump { db: jzr.dba, path, mode: 'fast', }
  #.........................................................................................................
  jzr.show_counts()
  jzr.show_jzr_meta_faults()
  ;null


#===========================================================================================================
if module is require.main then do =>
  demo()
  # demo_read_dump()
  ;null
