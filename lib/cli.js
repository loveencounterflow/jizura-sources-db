(function() {
  'use strict';
  var GUY, Jizura, MIXA, blue, debug, echo, gold, help, info, lime, red, reverse, rpr, urge, warn, whisper;

  //###########################################################################################################
  GUY = require('guy');

  ({debug, info, whisper, warn, urge, help} = GUY.trm.get_loggers('jzr/cli'));

  ({rpr, echo} = GUY.trm);

  //...........................................................................................................
  ({reverse, lime, blue, gold, red} = GUY.trm);

  //...........................................................................................................
  MIXA = require('mixa');

  ({Jizura} = require('./main'));

  //===========================================================================================================

  //-----------------------------------------------------------------------------------------------------------
  this.cli = function() {
    var jobdefs;
    //.........................................................................................................
    jobdefs = {
      meta: {
        'pager': {
          alias: 'p',
          type: Boolean,
          description: "use pager"
        }
      },
      commands: {
        //-----------------------------------------------------------------------------------------------------
        'help': {
          runner: (d) => {
            debug('Ωjsdbcli___1', process.argv);
            echo(lime(`jzrdb: produce and show CJK compositional data`));
            return echo(blue(`Usage:
  jzrdb [meta] $command [flags] [argument]

    meta:
      --pager / -p -- use pspg to page output

    command:

      query -- send an SQL query
        --query / -q / positional argument -- the query (required)

      info -- show an overview of tables and views
        --rows / -n -- number of rows to show`));
          }
        },
        //-----------------------------------------------------------------------------------------------------
        'query': {
          description: "run an SQL query",
          flags: {
            'query': {
              alias: 'q',
              type: String,
              description: "SQL query",
              positional: true
            }
          },
          runner: (d) => {
            var output_query_as_csv;
            ({output_query_as_csv} = require('./demo'));
            return output_query_as_csv(d.verdict.parameters.query);
          }
        },
        //-----------------------------------------------------------------------------------------------------
        'info': {
          description: "show info on configuration settings &c",
          flags: {
            'rows': {
              alias: 'n',
              type: Number,
              description: "number of rows"
            }
          },
          runner: (d) => {
            var demo_show_all_tables, rows;
            ({demo_show_all_tables} = require('./demo'));
            ({rows} = d.verdict.parameters);
            demo_show_all_tables({rows});
            return null;
          }
        }
      }
    };
    //.........................................................................................................
    MIXA.run(jobdefs, process.argv);
    return null;
  };

  //###########################################################################################################
  if (module === require.main) {
    (() => {
      return this.cli();
    })();
  }

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7RUFBQTtBQUFBLE1BQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQTs7O0VBSUEsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxJQURGLEVBRUUsT0FGRixFQUdFLElBSEYsRUFJRSxJQUpGLEVBS0UsSUFMRixDQUFBLEdBSzRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBUixDQUFvQixTQUFwQixDQUw1Qjs7RUFNQSxDQUFBLENBQUUsR0FBRixFQUNFLElBREYsQ0FBQSxHQUM0QixHQUFHLENBQUMsR0FEaEMsRUFYQTs7O0VBY0EsQ0FBQSxDQUFFLE9BQUYsRUFDRSxJQURGLEVBRUUsSUFGRixFQUdFLElBSEYsRUFJRSxHQUpGLENBQUEsR0FJNEIsR0FBRyxDQUFDLEdBSmhDLEVBZEE7OztFQW9CQSxJQUFBLEdBQTRCLE9BQUEsQ0FBUSxNQUFSOztFQUM1QixDQUFBLENBQUUsTUFBRixDQUFBLEdBQTRCLE9BQUEsQ0FBUSxRQUFSLENBQTVCLEVBckJBOzs7OztFQTJCQSxJQUFDLENBQUEsR0FBRCxHQUFPLFFBQUEsQ0FBQSxDQUFBO0FBQ1AsUUFBQSxPQUFBOztJQUNFLE9BQUEsR0FDRTtNQUFBLElBQUEsRUFDRTtRQUFBLE9BQUEsRUFDRTtVQUFBLEtBQUEsRUFBYyxHQUFkO1VBQ0EsSUFBQSxFQUFjLE9BRGQ7VUFFQSxXQUFBLEVBQWM7UUFGZDtNQURGLENBREY7TUFLQSxRQUFBLEVBRUUsQ0FBQTs7UUFBQSxNQUFBLEVBQ0U7VUFBQSxNQUFBLEVBQVEsQ0FBRSxDQUFGLENBQUEsR0FBQTtZQUNOLEtBQUEsQ0FBTSxjQUFOLEVBQXNCLE9BQU8sQ0FBQyxJQUE5QjtZQUNBLElBQUEsQ0FBSyxJQUFBLENBQUssQ0FBQSw4Q0FBQSxDQUFMLENBQUw7bUJBQ0EsSUFBQSxDQUFLLElBQUEsQ0FBSyxDQUFBOzs7Ozs7Ozs7Ozs7NkNBQUEsQ0FBTCxDQUFMO1VBSE07UUFBUixDQURGOztRQW9CQSxPQUFBLEVBQ0U7VUFBQSxXQUFBLEVBQWMsa0JBQWQ7VUFDQSxLQUFBLEVBQ0U7WUFBQSxPQUFBLEVBQ0U7Y0FBQSxLQUFBLEVBQWMsR0FBZDtjQUNBLElBQUEsRUFBYyxNQURkO2NBRUEsV0FBQSxFQUFjLFdBRmQ7Y0FHQSxVQUFBLEVBQWM7WUFIZDtVQURGLENBRkY7VUFPQSxNQUFBLEVBQVEsQ0FBRSxDQUFGLENBQUEsR0FBQTtBQUNoQixnQkFBQTtZQUFVLENBQUEsQ0FBRSxtQkFBRixDQUFBLEdBQTJCLE9BQUEsQ0FBUSxRQUFSLENBQTNCO21CQUNBLG1CQUFBLENBQW9CLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQXpDO1VBRk07UUFQUixDQXJCRjs7UUFnQ0EsTUFBQSxFQUNFO1VBQUEsV0FBQSxFQUFjLHdDQUFkO1VBQ0EsS0FBQSxFQUNFO1lBQUEsTUFBQSxFQUNFO2NBQUEsS0FBQSxFQUFjLEdBQWQ7Y0FDQSxJQUFBLEVBQWMsTUFEZDtjQUVBLFdBQUEsRUFBYztZQUZkO1VBREYsQ0FGRjtVQU1BLE1BQUEsRUFBUSxDQUFFLENBQUYsQ0FBQSxHQUFBO0FBQ2hCLGdCQUFBLG9CQUFBLEVBQUE7WUFBVSxDQUFBLENBQUUsb0JBQUYsQ0FBQSxHQUE0QixPQUFBLENBQVEsUUFBUixDQUE1QjtZQUNBLENBQUEsQ0FBRSxJQUFGLENBQUEsR0FBNEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUF0QztZQUNBLG9CQUFBLENBQXFCLENBQUUsSUFBRixDQUFyQjtBQUNBLG1CQUFPO1VBSkQ7UUFOUjtNQWpDRjtJQVBGLEVBRko7O0lBc0RFLElBQUksQ0FBQyxHQUFMLENBQVMsT0FBVCxFQUFrQixPQUFPLENBQUMsSUFBMUI7QUFDQSxXQUFPO0VBeERGLEVBM0JQOzs7RUF3RkEsSUFBRyxNQUFBLEtBQVUsT0FBTyxDQUFDLElBQXJCO0lBQWtDLENBQUEsQ0FBQSxDQUFBLEdBQUE7YUFDaEMsSUFBQyxDQUFBLEdBQUQsQ0FBQTtJQURnQyxDQUFBLElBQWxDOztBQXhGQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCdcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbkdVWSAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXknXG57IGRlYnVnXG4gIGluZm9cbiAgd2hpc3BlclxuICB3YXJuXG4gIHVyZ2VcbiAgaGVscCB9ICAgICAgICAgICAgICAgICAgPSBHVVkudHJtLmdldF9sb2dnZXJzICdqenIvY2xpJ1xueyBycHJcbiAgZWNobyB9ICAgICAgICAgICAgICAgICAgPSBHVVkudHJtXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgcmV2ZXJzZSxcbiAgbGltZSxcbiAgYmx1ZSxcbiAgZ29sZCxcbiAgcmVkLCAgICAgICAgICAgICAgICAgIH0gPSBHVVkudHJtXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbk1JWEEgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdtaXhhJ1xueyBKaXp1cmEsICAgICAgICAgICAgICAgfSA9IHJlcXVpcmUgJy4vbWFpbidcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGNsaSA9IC0+XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgam9iZGVmcyA9XG4gICAgbWV0YTpcbiAgICAgICdwYWdlcic6XG4gICAgICAgIGFsaWFzOiAgICAgICAgJ3AnXG4gICAgICAgIHR5cGU6ICAgICAgICAgQm9vbGVhblxuICAgICAgICBkZXNjcmlwdGlvbjogIFwidXNlIHBhZ2VyXCJcbiAgICBjb21tYW5kczpcbiAgICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgJ2hlbHAnOlxuICAgICAgICBydW5uZXI6ICggZCApID0+XG4gICAgICAgICAgZGVidWcgJ86panNkYmNsaV9fXzEnLCBwcm9jZXNzLmFyZ3ZcbiAgICAgICAgICBlY2hvIGxpbWUgXCJcIlwianpyZGI6IHByb2R1Y2UgYW5kIHNob3cgQ0pLIGNvbXBvc2l0aW9uYWwgZGF0YVwiXCJcIlxuICAgICAgICAgIGVjaG8gYmx1ZSBcIlwiXCJcbiAgICAgICAgICAgIFVzYWdlOlxuICAgICAgICAgICAgICBqenJkYiBbbWV0YV0gJGNvbW1hbmQgW2ZsYWdzXSBbYXJndW1lbnRdXG5cbiAgICAgICAgICAgICAgICBtZXRhOlxuICAgICAgICAgICAgICAgICAgLS1wYWdlciAvIC1wIC0tIHVzZSBwc3BnIHRvIHBhZ2Ugb3V0cHV0XG5cbiAgICAgICAgICAgICAgICBjb21tYW5kOlxuXG4gICAgICAgICAgICAgICAgICBxdWVyeSAtLSBzZW5kIGFuIFNRTCBxdWVyeVxuICAgICAgICAgICAgICAgICAgICAtLXF1ZXJ5IC8gLXEgLyBwb3NpdGlvbmFsIGFyZ3VtZW50IC0tIHRoZSBxdWVyeSAocmVxdWlyZWQpXG5cbiAgICAgICAgICAgICAgICAgIGluZm8gLS0gc2hvdyBhbiBvdmVydmlldyBvZiB0YWJsZXMgYW5kIHZpZXdzXG4gICAgICAgICAgICAgICAgICAgIC0tcm93cyAvIC1uIC0tIG51bWJlciBvZiByb3dzIHRvIHNob3dcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAncXVlcnknOlxuICAgICAgICBkZXNjcmlwdGlvbjogIFwicnVuIGFuIFNRTCBxdWVyeVwiXG4gICAgICAgIGZsYWdzOlxuICAgICAgICAgICdxdWVyeSc6XG4gICAgICAgICAgICBhbGlhczogICAgICAgICdxJ1xuICAgICAgICAgICAgdHlwZTogICAgICAgICBTdHJpbmdcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAgXCJTUUwgcXVlcnlcIlxuICAgICAgICAgICAgcG9zaXRpb25hbDogICB0cnVlXG4gICAgICAgIHJ1bm5lcjogKCBkICkgPT5cbiAgICAgICAgICB7IG91dHB1dF9xdWVyeV9hc19jc3YsIH0gPSByZXF1aXJlICcuL2RlbW8nXG4gICAgICAgICAgb3V0cHV0X3F1ZXJ5X2FzX2NzdiBkLnZlcmRpY3QucGFyYW1ldGVycy5xdWVyeVxuICAgICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAnaW5mbyc6XG4gICAgICAgIGRlc2NyaXB0aW9uOiAgXCJzaG93IGluZm8gb24gY29uZmlndXJhdGlvbiBzZXR0aW5ncyAmY1wiXG4gICAgICAgIGZsYWdzOlxuICAgICAgICAgICdyb3dzJzpcbiAgICAgICAgICAgIGFsaWFzOiAgICAgICAgJ24nXG4gICAgICAgICAgICB0eXBlOiAgICAgICAgIE51bWJlclxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICBcIm51bWJlciBvZiByb3dzXCJcbiAgICAgICAgcnVubmVyOiAoIGQgKSA9PlxuICAgICAgICAgIHsgZGVtb19zaG93X2FsbF90YWJsZXMsIH0gPSByZXF1aXJlICcuL2RlbW8nXG4gICAgICAgICAgeyByb3dzLCAgICAgICAgICAgICAgICAgfSA9IGQudmVyZGljdC5wYXJhbWV0ZXJzXG4gICAgICAgICAgZGVtb19zaG93X2FsbF90YWJsZXMgeyByb3dzLCB9XG4gICAgICAgICAgcmV0dXJuIG51bGxcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBNSVhBLnJ1biBqb2JkZWZzLCBwcm9jZXNzLmFyZ3ZcbiAgcmV0dXJuIG51bGxcblxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuaWYgbW9kdWxlIGlzIHJlcXVpcmUubWFpbiB0aGVuIGRvID0+XG4gIEBjbGkoKVxuIl19
