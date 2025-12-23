(function() {
  var Jzr_band_names;

  Jzr_band_names = (function() {
    class Jzr_band_names {};

    Jzr_band_names.build = [
      //=======================================================================================================
      SQL`create view jzr_cjk_agg_latn as
select distinct
    s                             as s,
    v || ':all'                   as v,
    json_group_array( o ) over w  as os
  from jzr_top_triples
  where v in ( 'c:reading:zh-Latn-pinyin','c:reading:ja-x-Kat+Latn', 'c:reading:ko-Latn')
  window w as ( partition by s, v order by o
    rows between unbounded preceding and unbounded following )
  order by s, v, os
;`,
      //-------------------------------------------------------------------------------------------------------
      SQL`create view jzr_cjk_agg2_latn as
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
;`,
      //-------------------------------------------------------------------------------------------------------
      SQL`create view jzr_reading_pairs_zh_ja as
select distinct
    t1.s      as s,
    t2.value  as reading_zh,
    t3.value  as reading_ja
  from jzr_cjk_agg2_latn as t1,
  json_each( t1.readings_zh ) as t2,
  json_each( t1.readings_ja ) as t3
  where reading_zh not in ( 'yu', 'chi' ) -- exclude non-homophones
  order by t2.value, t3.value
;`,
      //-------------------------------------------------------------------------------------------------------
      SQL`create view jzr_reading_pairs_zh_ja_agg as
select distinct
    reading_zh,
    reading_ja,
    json_group_array( s ) over w as chrs
  from jzr_reading_pairs_zh_ja as t1
  window w as ( partition by t1.reading_zh, t1.reading_ja order by t1.s
    rows between unbounded preceding and unbounded following )
order by reading_zh, reading_ja
;`,
      //-------------------------------------------------------------------------------------------------------
      SQL`create view jzr_reading_pairs_zh_ko as
select distinct
    t1.s      as s,
    t2.value  as reading_zh,
    t3.value  as reading_ko
  from jzr_cjk_agg2_latn as t1,
  json_each( t1.readings_zh ) as t2,
  json_each( t1.readings_ko ) as t3
  where reading_zh not in ( 'yu', 'chi' ) -- exclude non-homophones
  order by t2.value, t3.value
;`,
      //-------------------------------------------------------------------------------------------------------
      SQL`create view jzr_reading_pairs_zh_ko_agg as
select distinct
    reading_zh,
    reading_ko,
    json_group_array( s ) over w as chrs
  from jzr_reading_pairs_zh_ko as t1
  window w as ( partition by t1.reading_zh, t1.reading_ko order by t1.s
    rows between unbounded preceding and unbounded following )
order by reading_zh, reading_ko
;`,
      //-------------------------------------------------------------------------------------------------------
      SQL`create view jzr_equivalent_reading_triples as
select
    t1.reading_zh as reading_zh,
    t1.reading_ja as reading_ja,
    t2.reading_ko as reading_ko,
    t1.s          as s
  from jzr_reading_pairs_zh_ja as t1
  join jzr_reading_pairs_zh_ko as t2 on ( t1.s = t2.s and t1.reading_zh = t2.reading_ko )
  where t1.reading_zh = t1.reading_ja
  order by t1.reading_zh, t1.s
;`,
      //-------------------------------------------------------------------------------------------------------
      SQL`create view jzr_band_names as
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
;`,
      //-------------------------------------------------------------------------------------------------------
      SQL`create view jzr_band_names_2 as
select
    c1 || c2 as c
  from jzr_band_names
  order by reading
;`
    ];

    return Jzr_band_names;

  }).call(this);

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL191bnVzZWQtanpyLWJhbmQtbmFtZXMuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQTs7RUFBTTtJQUFOLE1BQUEsZUFBQSxDQUFBOztJQUVFLGNBQUMsQ0FBQSxLQUFELEdBQVE7O01BRU4sR0FBRyxDQUFBOzs7Ozs7Ozs7O0NBQUEsQ0FGRzs7TUFlTixHQUFHLENBQUE7Ozs7Ozs7Ozs7O0NBQUEsQ0FmRzs7TUE2Qk4sR0FBRyxDQUFBOzs7Ozs7Ozs7O0NBQUEsQ0E3Qkc7O01BMENOLEdBQUcsQ0FBQTs7Ozs7Ozs7O0NBQUEsQ0ExQ0c7O01Bc0ROLEdBQUcsQ0FBQTs7Ozs7Ozs7OztDQUFBLENBdERHOztNQW1FTixHQUFHLENBQUE7Ozs7Ozs7OztDQUFBLENBbkVHOztNQStFTixHQUFHLENBQUE7Ozs7Ozs7Ozs7Q0FBQSxDQS9FRzs7TUE0Rk4sR0FBRyxDQUFBOzs7Ozs7Ozs7Ozs7Q0FBQSxDQTVGRzs7TUEyR04sR0FBRyxDQUFBOzs7OztDQUFBLENBM0dHOzs7Ozs7QUFGViIsInNvdXJjZXNDb250ZW50IjpbIlxuY2xhc3MgSnpyX2JhbmRfbmFtZXNcblxuICBAYnVpbGQ6IFtcbiAgICAjPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9jamtfYWdnX2xhdG4gYXNcbiAgICAgIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIHMgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIHMsXG4gICAgICAgICAgdiB8fCAnOmFsbCcgICAgICAgICAgICAgICAgICAgYXMgdixcbiAgICAgICAgICBqc29uX2dyb3VwX2FycmF5KCBvICkgb3ZlciB3ICBhcyBvc1xuICAgICAgICBmcm9tIGp6cl90b3BfdHJpcGxlc1xuICAgICAgICB3aGVyZSB2IGluICggJ2M6cmVhZGluZzp6aC1MYXRuLXBpbnlpbicsJ2M6cmVhZGluZzpqYS14LUthdCtMYXRuJywgJ2M6cmVhZGluZzprby1MYXRuJylcbiAgICAgICAgd2luZG93IHcgYXMgKCBwYXJ0aXRpb24gYnkgcywgdiBvcmRlciBieSBvXG4gICAgICAgICAgcm93cyBiZXR3ZWVuIHVuYm91bmRlZCBwcmVjZWRpbmcgYW5kIHVuYm91bmRlZCBmb2xsb3dpbmcgKVxuICAgICAgICBvcmRlciBieSBzLCB2LCBvc1xuICAgICAgO1wiXCJcIlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfY2prX2FnZzJfbGF0biBhc1xuICAgICAgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgdHQxLnMgICBhcyBzLFxuICAgICAgICAgIHR0Mi5vcyAgYXMgcmVhZGluZ3NfemgsXG4gICAgICAgICAgdHQzLm9zICBhcyByZWFkaW5nc19qYSxcbiAgICAgICAgICB0dDQub3MgIGFzIHJlYWRpbmdzX2tvXG4gICAgICAgIGZyb20gICAgICBqenJfY2prX2FnZ19sYXRuIGFzIHR0MVxuICAgICAgICBsZWZ0IGpvaW4ganpyX2Nqa19hZ2dfbGF0biBhcyB0dDIgb24gKCB0dDEucyA9IHR0Mi5zIGFuZCB0dDIudiA9ICdjOnJlYWRpbmc6emgtTGF0bi1waW55aW46YWxsJyApXG4gICAgICAgIGxlZnQgam9pbiBqenJfY2prX2FnZ19sYXRuIGFzIHR0MyBvbiAoIHR0MS5zID0gdHQzLnMgYW5kIHR0My52ID0gJ2M6cmVhZGluZzpqYS14LUthdCtMYXRuOmFsbCcgIClcbiAgICAgICAgbGVmdCBqb2luIGp6cl9jamtfYWdnX2xhdG4gYXMgdHQ0IG9uICggdHQxLnMgPSB0dDQucyBhbmQgdHQ0LnYgPSAnYzpyZWFkaW5nOmtvLUxhdG46YWxsJyAgICAgICAgKVxuICAgICAgICBvcmRlciBieSBzXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9yZWFkaW5nX3BhaXJzX3poX2phIGFzXG4gICAgICBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICB0MS5zICAgICAgYXMgcyxcbiAgICAgICAgICB0Mi52YWx1ZSAgYXMgcmVhZGluZ196aCxcbiAgICAgICAgICB0My52YWx1ZSAgYXMgcmVhZGluZ19qYVxuICAgICAgICBmcm9tIGp6cl9jamtfYWdnMl9sYXRuIGFzIHQxLFxuICAgICAgICBqc29uX2VhY2goIHQxLnJlYWRpbmdzX3poICkgYXMgdDIsXG4gICAgICAgIGpzb25fZWFjaCggdDEucmVhZGluZ3NfamEgKSBhcyB0M1xuICAgICAgICB3aGVyZSByZWFkaW5nX3poIG5vdCBpbiAoICd5dScsICdjaGknICkgLS0gZXhjbHVkZSBub24taG9tb3Bob25lc1xuICAgICAgICBvcmRlciBieSB0Mi52YWx1ZSwgdDMudmFsdWVcbiAgICAgIDtcIlwiXCJcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX3JlYWRpbmdfcGFpcnNfemhfamFfYWdnIGFzXG4gICAgICBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICByZWFkaW5nX3poLFxuICAgICAgICAgIHJlYWRpbmdfamEsXG4gICAgICAgICAganNvbl9ncm91cF9hcnJheSggcyApIG92ZXIgdyBhcyBjaHJzXG4gICAgICAgIGZyb20ganpyX3JlYWRpbmdfcGFpcnNfemhfamEgYXMgdDFcbiAgICAgICAgd2luZG93IHcgYXMgKCBwYXJ0aXRpb24gYnkgdDEucmVhZGluZ196aCwgdDEucmVhZGluZ19qYSBvcmRlciBieSB0MS5zXG4gICAgICAgICAgcm93cyBiZXR3ZWVuIHVuYm91bmRlZCBwcmVjZWRpbmcgYW5kIHVuYm91bmRlZCBmb2xsb3dpbmcgKVxuICAgICAgb3JkZXIgYnkgcmVhZGluZ196aCwgcmVhZGluZ19qYVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfcmVhZGluZ19wYWlyc196aF9rbyBhc1xuICAgICAgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgdDEucyAgICAgIGFzIHMsXG4gICAgICAgICAgdDIudmFsdWUgIGFzIHJlYWRpbmdfemgsXG4gICAgICAgICAgdDMudmFsdWUgIGFzIHJlYWRpbmdfa29cbiAgICAgICAgZnJvbSBqenJfY2prX2FnZzJfbGF0biBhcyB0MSxcbiAgICAgICAganNvbl9lYWNoKCB0MS5yZWFkaW5nc196aCApIGFzIHQyLFxuICAgICAgICBqc29uX2VhY2goIHQxLnJlYWRpbmdzX2tvICkgYXMgdDNcbiAgICAgICAgd2hlcmUgcmVhZGluZ196aCBub3QgaW4gKCAneXUnLCAnY2hpJyApIC0tIGV4Y2x1ZGUgbm9uLWhvbW9waG9uZXNcbiAgICAgICAgb3JkZXIgYnkgdDIudmFsdWUsIHQzLnZhbHVlXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9yZWFkaW5nX3BhaXJzX3poX2tvX2FnZyBhc1xuICAgICAgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgcmVhZGluZ196aCxcbiAgICAgICAgICByZWFkaW5nX2tvLFxuICAgICAgICAgIGpzb25fZ3JvdXBfYXJyYXkoIHMgKSBvdmVyIHcgYXMgY2hyc1xuICAgICAgICBmcm9tIGp6cl9yZWFkaW5nX3BhaXJzX3poX2tvIGFzIHQxXG4gICAgICAgIHdpbmRvdyB3IGFzICggcGFydGl0aW9uIGJ5IHQxLnJlYWRpbmdfemgsIHQxLnJlYWRpbmdfa28gb3JkZXIgYnkgdDEuc1xuICAgICAgICAgIHJvd3MgYmV0d2VlbiB1bmJvdW5kZWQgcHJlY2VkaW5nIGFuZCB1bmJvdW5kZWQgZm9sbG93aW5nIClcbiAgICAgIG9yZGVyIGJ5IHJlYWRpbmdfemgsIHJlYWRpbmdfa29cbiAgICAgIDtcIlwiXCJcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2VxdWl2YWxlbnRfcmVhZGluZ190cmlwbGVzIGFzXG4gICAgICBzZWxlY3RcbiAgICAgICAgICB0MS5yZWFkaW5nX3poIGFzIHJlYWRpbmdfemgsXG4gICAgICAgICAgdDEucmVhZGluZ19qYSBhcyByZWFkaW5nX2phLFxuICAgICAgICAgIHQyLnJlYWRpbmdfa28gYXMgcmVhZGluZ19rbyxcbiAgICAgICAgICB0MS5zICAgICAgICAgIGFzIHNcbiAgICAgICAgZnJvbSBqenJfcmVhZGluZ19wYWlyc196aF9qYSBhcyB0MVxuICAgICAgICBqb2luIGp6cl9yZWFkaW5nX3BhaXJzX3poX2tvIGFzIHQyIG9uICggdDEucyA9IHQyLnMgYW5kIHQxLnJlYWRpbmdfemggPSB0Mi5yZWFkaW5nX2tvIClcbiAgICAgICAgd2hlcmUgdDEucmVhZGluZ196aCA9IHQxLnJlYWRpbmdfamFcbiAgICAgICAgb3JkZXIgYnkgdDEucmVhZGluZ196aCwgdDEuc1xuICAgICAgO1wiXCJcIlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfYmFuZF9uYW1lcyBhc1xuICAgICAgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgdDEucyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBjMSxcbiAgICAgICAgICB0Mi5zICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGMyLFxuICAgICAgICAgIHQxLnJlYWRpbmdfemggfHwgJyAnIHx8IHQyLnJlYWRpbmdfemggYXMgcmVhZGluZ1xuICAgICAgICBmcm9tIGp6cl9lcXVpdmFsZW50X3JlYWRpbmdfdHJpcGxlcyBhcyB0MVxuICAgICAgICBqb2luIGp6cl9lcXVpdmFsZW50X3JlYWRpbmdfdHJpcGxlcyBhcyB0MlxuICAgICAgICB3aGVyZSB0cnVlXG4gICAgICAgICAgYW5kICggYzEgIT0gYzIgKVxuICAgICAgICAgIGFuZCAoIGMxIG5vdCBpbiAoICfmuoAnLCAn6J+HJywgJ+W8pScsICfkvq0nLCAn5bC9JywgJ+W8uScsICflvL4nICkgKVxuICAgICAgICAgIGFuZCAoIGMyIG5vdCBpbiAoICfmuoAnLCAn6J+HJywgJ+W8pScsICfkvq0nLCAn5bC9JywgJ+W8uScsICflvL4nICkgKVxuICAgICAgICBvcmRlciBieSByZWFkaW5nXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9iYW5kX25hbWVzXzIgYXNcbiAgICAgIHNlbGVjdFxuICAgICAgICAgIGMxIHx8IGMyIGFzIGNcbiAgICAgICAgZnJvbSBqenJfYmFuZF9uYW1lc1xuICAgICAgICBvcmRlciBieSByZWFkaW5nXG4gICAgICA7XCJcIlwiXG4gICAgXVxuIl19
