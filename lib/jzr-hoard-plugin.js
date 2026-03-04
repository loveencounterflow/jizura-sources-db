(function() {
  'use strict';
  var FS, GUY, PATH, SQL, alert, as_bool, blue, bold, build, dbric_hoard_plugin, debug, echo, from_bool, functions, gold, green, grey, help, info, inspect, jzr_hoard_plugin, lime, log, methods, plain, praise, red, reverse, rpr, statements, urge, warn, whisper, white;

  //===========================================================================================================
  GUY = require('guy');

  ({alert, debug, help, info, plain, praise, urge, warn, whisper} = GUY.trm.get_loggers('jizura-sources-db'));

  ({rpr, inspect, echo, white, green, blue, lime, gold, grey, red, bold, reverse, log} = GUY.trm);

  // { f }                     = require '../../hengist-NG/apps/effstring'
  // write                     = ( p ) -> process.stdout.write p
  // { nfa }                   = require '../../hengist-NG/apps/normalize-function-arguments'
  // GTNG                      = require '../../hengist-NG/apps/guy-test-NG'
  // { Test                  } = GTNG
  FS = require('node:fs');

  PATH = require('node:path');

  //-----------------------------------------------------------------------------------------------------------
  ({SQL, from_bool, as_bool} = require('../../bricabrac-sfmodules/lib/dbric'));

  //-----------------------------------------------------------------------------------------------------------
  ({dbric_hoard_plugin} = require('../../bricabrac-sfmodules/lib/intermission'));

  ({build, functions, statements, methods} = dbric_hoard_plugin.exports);

  //===========================================================================================================
  // build.push SQL"create table yyy ( n integer )"

  //===========================================================================================================
  jzr_hoard_plugin = {
    name: 'jzr_hoard_plugin',
    prefix: 'hrd'/* NOTE informative, not enforced */,
    exports: {build, functions, statements, methods}
  };

  //   build: [
  //     SQL"create table nbr_numbers ( number integer );"
  //     ]
  //   statements:
  //     nbr_insert_number:          SQL"insert into nbr_numbers values ( $number );"
  //     nbr_select_numbers:         SQL"select * from nbr_numbers order by number;"
  //     nbr_select_square_numbers:  SQL"select nbr_square( number ) from nbr_numbers order by number;"
  //   functions:
  //     nbr_square:
  //       value: ( number ) -> @nbr_get_square number
  //   methods:
  //     nbr_get_square: ( number ) -> number ** 2

  //===========================================================================================================
  module.exports = {jzr_hoard_plugin};

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2p6ci1ob2FyZC1wbHVnaW4uY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBO0VBQUE7QUFBQSxNQUFBLEVBQUEsRUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsS0FBQSxFQUFBLGtCQUFBLEVBQUEsS0FBQSxFQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxLQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQSxFQUFBLGdCQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxVQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxPQUFBLEVBQUEsS0FBQTs7O0VBR0EsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxLQURGLEVBRUUsSUFGRixFQUdFLElBSEYsRUFJRSxLQUpGLEVBS0UsTUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsT0FSRixDQUFBLEdBUTRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBUixDQUFvQixtQkFBcEIsQ0FSNUI7O0VBU0EsQ0FBQSxDQUFFLEdBQUYsRUFDRSxPQURGLEVBRUUsSUFGRixFQUdFLEtBSEYsRUFJRSxLQUpGLEVBS0UsSUFMRixFQU1FLElBTkYsRUFPRSxJQVBGLEVBUUUsSUFSRixFQVNFLEdBVEYsRUFVRSxJQVZGLEVBV0UsT0FYRixFQVlFLEdBWkYsQ0FBQSxHQVk0QixHQUFHLENBQUMsR0FaaEMsRUFiQTs7Ozs7OztFQStCQSxFQUFBLEdBQTRCLE9BQUEsQ0FBUSxTQUFSOztFQUM1QixJQUFBLEdBQTRCLE9BQUEsQ0FBUSxXQUFSLEVBaEM1Qjs7O0VBa0NBLENBQUEsQ0FBRSxHQUFGLEVBQ0UsU0FERixFQUVFLE9BRkYsQ0FBQSxHQUU0QixPQUFBLENBQVEscUNBQVIsQ0FGNUIsRUFsQ0E7OztFQXNDQSxDQUFBLENBQUUsa0JBQUYsQ0FBQSxHQUE0QixPQUFBLENBQVEsNENBQVIsQ0FBNUI7O0VBQ0EsQ0FBQSxDQUFFLEtBQUYsRUFDRSxTQURGLEVBRUUsVUFGRixFQUdFLE9BSEYsQ0FBQSxHQUc0QixrQkFBa0IsQ0FBQyxPQUgvQyxFQXZDQTs7Ozs7O0VBaURBLGdCQUFBLEdBQ0U7SUFBQSxJQUFBLEVBQVEsa0JBQVI7SUFDQSxNQUFBLEVBQVEsS0FBb0Isb0NBRDVCO0lBRUEsT0FBQSxFQUFTLENBQ1AsS0FETyxFQUVQLFNBRk8sRUFHUCxVQUhPLEVBSVAsT0FKTztFQUZULEVBbERGOzs7Ozs7Ozs7Ozs7Ozs7O0VBeUVBLE1BQU0sQ0FBQyxPQUFQLEdBQWlCLENBQUUsZ0JBQUY7QUF6RWpCIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0J1xuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbkdVWSAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXknXG57IGFsZXJ0XG4gIGRlYnVnXG4gIGhlbHBcbiAgaW5mb1xuICBwbGFpblxuICBwcmFpc2VcbiAgdXJnZVxuICB3YXJuXG4gIHdoaXNwZXIgfSAgICAgICAgICAgICAgID0gR1VZLnRybS5nZXRfbG9nZ2VycyAnaml6dXJhLXNvdXJjZXMtZGInXG57IHJwclxuICBpbnNwZWN0XG4gIGVjaG9cbiAgd2hpdGVcbiAgZ3JlZW5cbiAgYmx1ZVxuICBsaW1lXG4gIGdvbGRcbiAgZ3JleVxuICByZWRcbiAgYm9sZFxuICByZXZlcnNlXG4gIGxvZyAgICAgfSAgICAgICAgICAgICAgID0gR1VZLnRybVxuIyB7IGYgfSAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2VmZnN0cmluZydcbiMgd3JpdGUgICAgICAgICAgICAgICAgICAgICA9ICggcCApIC0+IHByb2Nlc3Muc3Rkb3V0LndyaXRlIHBcbiMgeyBuZmEgfSAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJy4uLy4uL2hlbmdpc3QtTkcvYXBwcy9ub3JtYWxpemUtZnVuY3Rpb24tYXJndW1lbnRzJ1xuIyBHVE5HICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi4vLi4vaGVuZ2lzdC1ORy9hcHBzL2d1eS10ZXN0LU5HJ1xuIyB7IFRlc3QgICAgICAgICAgICAgICAgICB9ID0gR1ROR1xuRlMgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6ZnMnXG5QQVRIICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpwYXRoJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG57IFNRTCxcbiAgZnJvbV9ib29sLFxuICBhc19ib29sLCAgICAgICAgICAgICAgfSA9IHJlcXVpcmUgJy4uLy4uL2JyaWNhYnJhYy1zZm1vZHVsZXMvbGliL2RicmljJ1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG57IGRicmljX2hvYXJkX3BsdWdpbiwgICB9ID0gcmVxdWlyZSAnLi4vLi4vYnJpY2FicmFjLXNmbW9kdWxlcy9saWIvaW50ZXJtaXNzaW9uJ1xueyBidWlsZCxcbiAgZnVuY3Rpb25zLFxuICBzdGF0ZW1lbnRzLFxuICBtZXRob2RzLCAgICAgICAgICAgICAgfSA9IGRicmljX2hvYXJkX3BsdWdpbi5leHBvcnRzXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jIGJ1aWxkLnB1c2ggU1FMXCJjcmVhdGUgdGFibGUgeXl5ICggbiBpbnRlZ2VyIClcIlxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbmp6cl9ob2FyZF9wbHVnaW4gPVxuICBuYW1lOiAgICdqenJfaG9hcmRfcGx1Z2luJ1xuICBwcmVmaXg6ICdocmQnICAgICAgICAgICAgICAgIyMjIE5PVEUgaW5mb3JtYXRpdmUsIG5vdCBlbmZvcmNlZCAjIyNcbiAgZXhwb3J0czoge1xuICAgIGJ1aWxkLFxuICAgIGZ1bmN0aW9ucyxcbiAgICBzdGF0ZW1lbnRzLFxuICAgIG1ldGhvZHMsIH1cbiAgIyAgIGJ1aWxkOiBbXG4gICMgICAgIFNRTFwiY3JlYXRlIHRhYmxlIG5icl9udW1iZXJzICggbnVtYmVyIGludGVnZXIgKTtcIlxuICAjICAgICBdXG4gICMgICBzdGF0ZW1lbnRzOlxuICAjICAgICBuYnJfaW5zZXJ0X251bWJlcjogICAgICAgICAgU1FMXCJpbnNlcnQgaW50byBuYnJfbnVtYmVycyB2YWx1ZXMgKCAkbnVtYmVyICk7XCJcbiAgIyAgICAgbmJyX3NlbGVjdF9udW1iZXJzOiAgICAgICAgIFNRTFwic2VsZWN0ICogZnJvbSBuYnJfbnVtYmVycyBvcmRlciBieSBudW1iZXI7XCJcbiAgIyAgICAgbmJyX3NlbGVjdF9zcXVhcmVfbnVtYmVyczogIFNRTFwic2VsZWN0IG5icl9zcXVhcmUoIG51bWJlciApIGZyb20gbmJyX251bWJlcnMgb3JkZXIgYnkgbnVtYmVyO1wiXG4gICMgICBmdW5jdGlvbnM6XG4gICMgICAgIG5icl9zcXVhcmU6XG4gICMgICAgICAgdmFsdWU6ICggbnVtYmVyICkgLT4gQG5icl9nZXRfc3F1YXJlIG51bWJlclxuICAjICAgbWV0aG9kczpcbiAgIyAgICAgbmJyX2dldF9zcXVhcmU6ICggbnVtYmVyICkgLT4gbnVtYmVyICoqIDJcblxuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxubW9kdWxlLmV4cG9ydHMgPSB7IGp6cl9ob2FyZF9wbHVnaW4sIH1cblxuIl19
