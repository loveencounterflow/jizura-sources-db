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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL19qenItYmFuZC1uYW1lcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0E7QUFBQSxNQUFBOztFQUFNO0lBQU4sTUFBQSxlQUFBLENBQUE7O0lBRUUsY0FBQyxDQUFBLEtBQUQsR0FBUTs7TUFFTixHQUFHLENBQUE7Ozs7Ozs7Ozs7Q0FBQSxDQUZHOztNQWVOLEdBQUcsQ0FBQTs7Ozs7Ozs7Ozs7Q0FBQSxDQWZHOztNQTZCTixHQUFHLENBQUE7Ozs7Ozs7Ozs7Q0FBQSxDQTdCRzs7TUEwQ04sR0FBRyxDQUFBOzs7Ozs7Ozs7Q0FBQSxDQTFDRzs7TUFzRE4sR0FBRyxDQUFBOzs7Ozs7Ozs7O0NBQUEsQ0F0REc7O01BbUVOLEdBQUcsQ0FBQTs7Ozs7Ozs7O0NBQUEsQ0FuRUc7O01BK0VOLEdBQUcsQ0FBQTs7Ozs7Ozs7OztDQUFBLENBL0VHOztNQTRGTixHQUFHLENBQUE7Ozs7Ozs7Ozs7OztDQUFBLENBNUZHOztNQTJHTixHQUFHLENBQUE7Ozs7O0NBQUEsQ0EzR0c7Ozs7OztBQUZWIiwic291cmNlc0NvbnRlbnQiOlsiXG5jbGFzcyBKenJfYmFuZF9uYW1lc1xuXG4gIEBidWlsZDogW1xuICAgICM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2Nqa19hZ2dfbGF0biBhc1xuICAgICAgc2VsZWN0IGRpc3RpbmN0XG4gICAgICAgICAgcyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgcyxcbiAgICAgICAgICB2IHx8ICc6YWxsJyAgICAgICAgICAgICAgICAgICBhcyB2LFxuICAgICAgICAgIGpzb25fZ3JvdXBfYXJyYXkoIG8gKSBvdmVyIHcgIGFzIG9zXG4gICAgICAgIGZyb20ganpyX3RvcF90cmlwbGVzXG4gICAgICAgIHdoZXJlIHYgaW4gKCAnYzpyZWFkaW5nOnpoLUxhdG4tcGlueWluJywnYzpyZWFkaW5nOmphLXgtS2F0K0xhdG4nLCAnYzpyZWFkaW5nOmtvLUxhdG4nKVxuICAgICAgICB3aW5kb3cgdyBhcyAoIHBhcnRpdGlvbiBieSBzLCB2IG9yZGVyIGJ5IG9cbiAgICAgICAgICByb3dzIGJldHdlZW4gdW5ib3VuZGVkIHByZWNlZGluZyBhbmQgdW5ib3VuZGVkIGZvbGxvd2luZyApXG4gICAgICAgIG9yZGVyIGJ5IHMsIHYsIG9zXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9jamtfYWdnMl9sYXRuIGFzXG4gICAgICBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICB0dDEucyAgIGFzIHMsXG4gICAgICAgICAgdHQyLm9zICBhcyByZWFkaW5nc196aCxcbiAgICAgICAgICB0dDMub3MgIGFzIHJlYWRpbmdzX2phLFxuICAgICAgICAgIHR0NC5vcyAgYXMgcmVhZGluZ3Nfa29cbiAgICAgICAgZnJvbSAgICAgIGp6cl9jamtfYWdnX2xhdG4gYXMgdHQxXG4gICAgICAgIGxlZnQgam9pbiBqenJfY2prX2FnZ19sYXRuIGFzIHR0MiBvbiAoIHR0MS5zID0gdHQyLnMgYW5kIHR0Mi52ID0gJ2M6cmVhZGluZzp6aC1MYXRuLXBpbnlpbjphbGwnIClcbiAgICAgICAgbGVmdCBqb2luIGp6cl9jamtfYWdnX2xhdG4gYXMgdHQzIG9uICggdHQxLnMgPSB0dDMucyBhbmQgdHQzLnYgPSAnYzpyZWFkaW5nOmphLXgtS2F0K0xhdG46YWxsJyAgKVxuICAgICAgICBsZWZ0IGpvaW4ganpyX2Nqa19hZ2dfbGF0biBhcyB0dDQgb24gKCB0dDEucyA9IHR0NC5zIGFuZCB0dDQudiA9ICdjOnJlYWRpbmc6a28tTGF0bjphbGwnICAgICAgICApXG4gICAgICAgIG9yZGVyIGJ5IHNcbiAgICAgIDtcIlwiXCJcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX3JlYWRpbmdfcGFpcnNfemhfamEgYXNcbiAgICAgIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIHQxLnMgICAgICBhcyBzLFxuICAgICAgICAgIHQyLnZhbHVlICBhcyByZWFkaW5nX3poLFxuICAgICAgICAgIHQzLnZhbHVlICBhcyByZWFkaW5nX2phXG4gICAgICAgIGZyb20ganpyX2Nqa19hZ2cyX2xhdG4gYXMgdDEsXG4gICAgICAgIGpzb25fZWFjaCggdDEucmVhZGluZ3NfemggKSBhcyB0MixcbiAgICAgICAganNvbl9lYWNoKCB0MS5yZWFkaW5nc19qYSApIGFzIHQzXG4gICAgICAgIHdoZXJlIHJlYWRpbmdfemggbm90IGluICggJ3l1JywgJ2NoaScgKSAtLSBleGNsdWRlIG5vbi1ob21vcGhvbmVzXG4gICAgICAgIG9yZGVyIGJ5IHQyLnZhbHVlLCB0My52YWx1ZVxuICAgICAgO1wiXCJcIlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfcmVhZGluZ19wYWlyc196aF9qYV9hZ2cgYXNcbiAgICAgIHNlbGVjdCBkaXN0aW5jdFxuICAgICAgICAgIHJlYWRpbmdfemgsXG4gICAgICAgICAgcmVhZGluZ19qYSxcbiAgICAgICAgICBqc29uX2dyb3VwX2FycmF5KCBzICkgb3ZlciB3IGFzIGNocnNcbiAgICAgICAgZnJvbSBqenJfcmVhZGluZ19wYWlyc196aF9qYSBhcyB0MVxuICAgICAgICB3aW5kb3cgdyBhcyAoIHBhcnRpdGlvbiBieSB0MS5yZWFkaW5nX3poLCB0MS5yZWFkaW5nX2phIG9yZGVyIGJ5IHQxLnNcbiAgICAgICAgICByb3dzIGJldHdlZW4gdW5ib3VuZGVkIHByZWNlZGluZyBhbmQgdW5ib3VuZGVkIGZvbGxvd2luZyApXG4gICAgICBvcmRlciBieSByZWFkaW5nX3poLCByZWFkaW5nX2phXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9yZWFkaW5nX3BhaXJzX3poX2tvIGFzXG4gICAgICBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICB0MS5zICAgICAgYXMgcyxcbiAgICAgICAgICB0Mi52YWx1ZSAgYXMgcmVhZGluZ196aCxcbiAgICAgICAgICB0My52YWx1ZSAgYXMgcmVhZGluZ19rb1xuICAgICAgICBmcm9tIGp6cl9jamtfYWdnMl9sYXRuIGFzIHQxLFxuICAgICAgICBqc29uX2VhY2goIHQxLnJlYWRpbmdzX3poICkgYXMgdDIsXG4gICAgICAgIGpzb25fZWFjaCggdDEucmVhZGluZ3Nfa28gKSBhcyB0M1xuICAgICAgICB3aGVyZSByZWFkaW5nX3poIG5vdCBpbiAoICd5dScsICdjaGknICkgLS0gZXhjbHVkZSBub24taG9tb3Bob25lc1xuICAgICAgICBvcmRlciBieSB0Mi52YWx1ZSwgdDMudmFsdWVcbiAgICAgIDtcIlwiXCJcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX3JlYWRpbmdfcGFpcnNfemhfa29fYWdnIGFzXG4gICAgICBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICByZWFkaW5nX3poLFxuICAgICAgICAgIHJlYWRpbmdfa28sXG4gICAgICAgICAganNvbl9ncm91cF9hcnJheSggcyApIG92ZXIgdyBhcyBjaHJzXG4gICAgICAgIGZyb20ganpyX3JlYWRpbmdfcGFpcnNfemhfa28gYXMgdDFcbiAgICAgICAgd2luZG93IHcgYXMgKCBwYXJ0aXRpb24gYnkgdDEucmVhZGluZ196aCwgdDEucmVhZGluZ19rbyBvcmRlciBieSB0MS5zXG4gICAgICAgICAgcm93cyBiZXR3ZWVuIHVuYm91bmRlZCBwcmVjZWRpbmcgYW5kIHVuYm91bmRlZCBmb2xsb3dpbmcgKVxuICAgICAgb3JkZXIgYnkgcmVhZGluZ196aCwgcmVhZGluZ19rb1xuICAgICAgO1wiXCJcIlxuXG4gICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICBTUUxcIlwiXCJjcmVhdGUgdmlldyBqenJfZXF1aXZhbGVudF9yZWFkaW5nX3RyaXBsZXMgYXNcbiAgICAgIHNlbGVjdFxuICAgICAgICAgIHQxLnJlYWRpbmdfemggYXMgcmVhZGluZ196aCxcbiAgICAgICAgICB0MS5yZWFkaW5nX2phIGFzIHJlYWRpbmdfamEsXG4gICAgICAgICAgdDIucmVhZGluZ19rbyBhcyByZWFkaW5nX2tvLFxuICAgICAgICAgIHQxLnMgICAgICAgICAgYXMgc1xuICAgICAgICBmcm9tIGp6cl9yZWFkaW5nX3BhaXJzX3poX2phIGFzIHQxXG4gICAgICAgIGpvaW4ganpyX3JlYWRpbmdfcGFpcnNfemhfa28gYXMgdDIgb24gKCB0MS5zID0gdDIucyBhbmQgdDEucmVhZGluZ196aCA9IHQyLnJlYWRpbmdfa28gKVxuICAgICAgICB3aGVyZSB0MS5yZWFkaW5nX3poID0gdDEucmVhZGluZ19qYVxuICAgICAgICBvcmRlciBieSB0MS5yZWFkaW5nX3poLCB0MS5zXG4gICAgICA7XCJcIlwiXG5cbiAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIFNRTFwiXCJcImNyZWF0ZSB2aWV3IGp6cl9iYW5kX25hbWVzIGFzXG4gICAgICBzZWxlY3QgZGlzdGluY3RcbiAgICAgICAgICB0MS5zICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGMxLFxuICAgICAgICAgIHQyLnMgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXMgYzIsXG4gICAgICAgICAgdDEucmVhZGluZ196aCB8fCAnICcgfHwgdDIucmVhZGluZ196aCBhcyByZWFkaW5nXG4gICAgICAgIGZyb20ganpyX2VxdWl2YWxlbnRfcmVhZGluZ190cmlwbGVzIGFzIHQxXG4gICAgICAgIGpvaW4ganpyX2VxdWl2YWxlbnRfcmVhZGluZ190cmlwbGVzIGFzIHQyXG4gICAgICAgIHdoZXJlIHRydWVcbiAgICAgICAgICBhbmQgKCBjMSAhPSBjMiApXG4gICAgICAgICAgYW5kICggYzEgbm90IGluICggJ+a6gCcsICfon4cnLCAn5bylJywgJ+S+rScsICflsL0nLCAn5by5JywgJ+W8vicgKSApXG4gICAgICAgICAgYW5kICggYzIgbm90IGluICggJ+a6gCcsICfon4cnLCAn5bylJywgJ+S+rScsICflsL0nLCAn5by5JywgJ+W8vicgKSApXG4gICAgICAgIG9yZGVyIGJ5IHJlYWRpbmdcbiAgICAgIDtcIlwiXCJcblxuICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcganpyX2JhbmRfbmFtZXNfMiBhc1xuICAgICAgc2VsZWN0XG4gICAgICAgICAgYzEgfHwgYzIgYXMgY1xuICAgICAgICBmcm9tIGp6cl9iYW5kX25hbWVzXG4gICAgICAgIG9yZGVyIGJ5IHJlYWRpbmdcbiAgICAgIDtcIlwiXCJcbiAgICBdXG4iXX0=
