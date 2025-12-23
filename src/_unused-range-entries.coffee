

query_to_extract_ucd_ucd_range_entries = ->
    #.......................................................................................................
    SQL"""create view _jzr_ucd_ucd_range_entries as
      with slo as ( select
          jfields->>0 as lo_cid_hex,
          jfields->>1 as lo_label
        from jzr_mirror_lines
        where true
          and ( dskey = 'ds:ucd:ucd' )
          and (
            ( jfields->>1 = '<Private Use, First>' )
            or ( jfields->>1 regexp '<[^>]+ First>'
              and ( jfields->>1 not regexp '<(Tangut|Hangul)' ) -- excludes > 17,000 chrs
              and ( jfields->>2 = 'Lo' ) ) ) ),
      shi as ( select
          jfields->>0 as hi_cid_hex,
          jfields->>1 as hi_label
        from jzr_mirror_lines
        where true
          and ( dskey = 'ds:ucd:ucd' )
          and (
            ( jfields->>1 = '<Private Use, Last>' )
            or ( jfields->>1 regexp '<[^>]+ Last>'
              and ( jfields->>2 = 'Lo' ) ) ) )
      select
          jzr_integer_from_hex( slo.lo_cid_hex )  as lo,
          jzr_integer_from_hex( shi.hi_cid_hex )  as hi,
          slo.lo_label                            as lo_label,
          shi.hi_label                            as hi_label
        from slo
        -- left join shi on ( shi.hi_label = substring( slo.lo_label, 1, length( slo.lo_label ) - 6 ) || 'Last>' )
        left join shi on ( shi.hi_label = replace( slo.lo_label, ', First>', ', Last>' ) )
        ;"""
