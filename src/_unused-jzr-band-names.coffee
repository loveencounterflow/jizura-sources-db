
class Jzr_band_names

  @build: [
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
    ]
