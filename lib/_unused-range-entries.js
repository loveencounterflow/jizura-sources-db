(function() {
  var query_to_extract_ucd_ucd_range_entries;

  query_to_extract_ucd_ucd_range_entries = function() {
    //.......................................................................................................
    return SQL`create view _jzr_ucd_ucd_range_entries as
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
  ;`;
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL191bnVzZWQtcmFuZ2UtZW50cmllcy5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7QUFBQSxNQUFBOztFQUFBLHNDQUFBLEdBQXlDLFFBQUEsQ0FBQSxDQUFBLEVBQUE7O1dBRXJDLEdBQUcsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBQUE7RUFGa0M7QUFBekMiLCJzb3VyY2VzQ29udGVudCI6WyJcblxucXVlcnlfdG9fZXh0cmFjdF91Y2RfdWNkX3JhbmdlX2VudHJpZXMgPSAtPlxuICAgICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gICAgU1FMXCJcIlwiY3JlYXRlIHZpZXcgX2p6cl91Y2RfdWNkX3JhbmdlX2VudHJpZXMgYXNcbiAgICAgIHdpdGggc2xvIGFzICggc2VsZWN0XG4gICAgICAgICAgamZpZWxkcy0+PjAgYXMgbG9fY2lkX2hleCxcbiAgICAgICAgICBqZmllbGRzLT4+MSBhcyBsb19sYWJlbFxuICAgICAgICBmcm9tIGp6cl9taXJyb3JfbGluZXNcbiAgICAgICAgd2hlcmUgdHJ1ZVxuICAgICAgICAgIGFuZCAoIGRza2V5ID0gJ2RzOnVjZDp1Y2QnIClcbiAgICAgICAgICBhbmQgKFxuICAgICAgICAgICAgKCBqZmllbGRzLT4+MSA9ICc8UHJpdmF0ZSBVc2UsIEZpcnN0PicgKVxuICAgICAgICAgICAgb3IgKCBqZmllbGRzLT4+MSByZWdleHAgJzxbXj5dKyBGaXJzdD4nXG4gICAgICAgICAgICAgIGFuZCAoIGpmaWVsZHMtPj4xIG5vdCByZWdleHAgJzwoVGFuZ3V0fEhhbmd1bCknICkgLS0gZXhjbHVkZXMgPiAxNywwMDAgY2hyc1xuICAgICAgICAgICAgICBhbmQgKCBqZmllbGRzLT4+MiA9ICdMbycgKSApICkgKSxcbiAgICAgIHNoaSBhcyAoIHNlbGVjdFxuICAgICAgICAgIGpmaWVsZHMtPj4wIGFzIGhpX2NpZF9oZXgsXG4gICAgICAgICAgamZpZWxkcy0+PjEgYXMgaGlfbGFiZWxcbiAgICAgICAgZnJvbSBqenJfbWlycm9yX2xpbmVzXG4gICAgICAgIHdoZXJlIHRydWVcbiAgICAgICAgICBhbmQgKCBkc2tleSA9ICdkczp1Y2Q6dWNkJyApXG4gICAgICAgICAgYW5kIChcbiAgICAgICAgICAgICggamZpZWxkcy0+PjEgPSAnPFByaXZhdGUgVXNlLCBMYXN0PicgKVxuICAgICAgICAgICAgb3IgKCBqZmllbGRzLT4+MSByZWdleHAgJzxbXj5dKyBMYXN0PidcbiAgICAgICAgICAgICAgYW5kICggamZpZWxkcy0+PjIgPSAnTG8nICkgKSApIClcbiAgICAgIHNlbGVjdFxuICAgICAgICAgIGp6cl9pbnRlZ2VyX2Zyb21faGV4KCBzbG8ubG9fY2lkX2hleCApICBhcyBsbyxcbiAgICAgICAgICBqenJfaW50ZWdlcl9mcm9tX2hleCggc2hpLmhpX2NpZF9oZXggKSAgYXMgaGksXG4gICAgICAgICAgc2xvLmxvX2xhYmVsICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzIGxvX2xhYmVsLFxuICAgICAgICAgIHNoaS5oaV9sYWJlbCAgICAgICAgICAgICAgICAgICAgICAgICAgICBhcyBoaV9sYWJlbFxuICAgICAgICBmcm9tIHNsb1xuICAgICAgICAtLSBsZWZ0IGpvaW4gc2hpIG9uICggc2hpLmhpX2xhYmVsID0gc3Vic3RyaW5nKCBzbG8ubG9fbGFiZWwsIDEsIGxlbmd0aCggc2xvLmxvX2xhYmVsICkgLSA2ICkgfHwgJ0xhc3Q+JyApXG4gICAgICAgIGxlZnQgam9pbiBzaGkgb24gKCBzaGkuaGlfbGFiZWwgPSByZXBsYWNlKCBzbG8ubG9fbGFiZWwsICcsIEZpcnN0PicsICcsIExhc3Q+JyApIClcbiAgICAgICAgO1wiXCJcIlxuIl19
