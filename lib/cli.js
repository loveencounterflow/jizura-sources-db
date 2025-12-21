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

      info -- show an overview of tables and views`));
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
      // await @cli()
      return this.cli();
    })();
  }

  // cli_commands =
//   use_pspg: "Ω command: use-pspg Ω"
// echo cli_commands.use_pspg
// echo "Ωjsdbcli___6 helo"
// echo "Ωjsdbcli___7 line 2"

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7RUFBQTtBQUFBLE1BQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQTs7O0VBSUEsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxJQURGLEVBRUUsT0FGRixFQUdFLElBSEYsRUFJRSxJQUpGLEVBS0UsSUFMRixDQUFBLEdBSzRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBUixDQUFvQixTQUFwQixDQUw1Qjs7RUFNQSxDQUFBLENBQUUsR0FBRixFQUNFLElBREYsQ0FBQSxHQUM0QixHQUFHLENBQUMsR0FEaEMsRUFYQTs7O0VBY0EsQ0FBQSxDQUFFLE9BQUYsRUFDRSxJQURGLEVBRUUsSUFGRixFQUdFLElBSEYsRUFJRSxHQUpGLENBQUEsR0FJNEIsR0FBRyxDQUFDLEdBSmhDLEVBZEE7OztFQW9CQSxJQUFBLEdBQTRCLE9BQUEsQ0FBUSxNQUFSOztFQUM1QixDQUFBLENBQUUsTUFBRixDQUFBLEdBQTRCLE9BQUEsQ0FBUSxRQUFSLENBQTVCLEVBckJBOzs7OztFQTJCQSxJQUFDLENBQUEsR0FBRCxHQUFPLFFBQUEsQ0FBQSxDQUFBO0FBQ1AsUUFBQSxPQUFBOztJQUNFLE9BQUEsR0FDRTtNQUFBLElBQUEsRUFDRTtRQUFBLE9BQUEsRUFDRTtVQUFBLEtBQUEsRUFBYyxHQUFkO1VBQ0EsSUFBQSxFQUFjLE9BRGQ7VUFFQSxXQUFBLEVBQWM7UUFGZDtNQURGLENBREY7TUFLQSxRQUFBLEVBRUUsQ0FBQTs7UUFBQSxNQUFBLEVBQ0U7VUFBQSxNQUFBLEVBQVEsQ0FBRSxDQUFGLENBQUEsR0FBQTtZQUNOLEtBQUEsQ0FBTSxjQUFOLEVBQXNCLE9BQU8sQ0FBQyxJQUE5QjtZQUNBLElBQUEsQ0FBSyxJQUFBLENBQUssQ0FBQSw4Q0FBQSxDQUFMLENBQUw7bUJBQ0EsSUFBQSxDQUFLLElBQUEsQ0FBSyxDQUFBOzs7Ozs7Ozs7OztrREFBQSxDQUFMLENBQUw7VUFITTtRQUFSLENBREY7O1FBbUJBLE9BQUEsRUFDRTtVQUFBLFdBQUEsRUFBYyxrQkFBZDtVQUNBLEtBQUEsRUFDRTtZQUFBLE9BQUEsRUFDRTtjQUFBLEtBQUEsRUFBYyxHQUFkO2NBQ0EsSUFBQSxFQUFjLE1BRGQ7Y0FFQSxXQUFBLEVBQWMsV0FGZDtjQUdBLFVBQUEsRUFBYztZQUhkO1VBREYsQ0FGRjtVQU9BLE1BQUEsRUFBUSxDQUFFLENBQUYsQ0FBQSxHQUFBO0FBQ2hCLGdCQUFBO1lBQVUsQ0FBQSxDQUFFLG1CQUFGLENBQUEsR0FBMkIsT0FBQSxDQUFRLFFBQVIsQ0FBM0I7bUJBQ0EsbUJBQUEsQ0FBb0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBekM7VUFGTTtRQVBSLENBcEJGOztRQStCQSxNQUFBLEVBQ0U7VUFBQSxXQUFBLEVBQWMsd0NBQWQ7VUFDQSxLQUFBLEVBQ0U7WUFBQSxNQUFBLEVBQ0U7Y0FBQSxLQUFBLEVBQWMsR0FBZDtjQUNBLElBQUEsRUFBYyxNQURkO2NBRUEsV0FBQSxFQUFjO1lBRmQ7VUFERixDQUZGO1VBTUEsTUFBQSxFQUFRLENBQUUsQ0FBRixDQUFBLEdBQUE7QUFDaEIsZ0JBQUEsb0JBQUEsRUFBQTtZQUFVLENBQUEsQ0FBRSxvQkFBRixDQUFBLEdBQTRCLE9BQUEsQ0FBUSxRQUFSLENBQTVCO1lBQ0EsQ0FBQSxDQUFFLElBQUYsQ0FBQSxHQUE0QixDQUFDLENBQUMsT0FBTyxDQUFDLFVBQXRDO1lBQ0Esb0JBQUEsQ0FBcUIsQ0FBRSxJQUFGLENBQXJCO0FBQ0EsbUJBQU87VUFKRDtRQU5SO01BaENGO0lBUEYsRUFGSjs7SUFxREUsSUFBSSxDQUFDLEdBQUwsQ0FBUyxPQUFULEVBQWtCLE9BQU8sQ0FBQyxJQUExQjtBQUNBLFdBQU87RUF2REYsRUEzQlA7OztFQXVGQSxJQUFHLE1BQUEsS0FBVSxPQUFPLENBQUMsSUFBckI7SUFBa0MsQ0FBQSxDQUFBLENBQUEsR0FBQSxFQUFBOzthQUVoQyxJQUFDLENBQUEsR0FBRCxDQUFBO0lBRmdDLENBQUEsSUFBbEM7OztFQXZGQTs7Ozs7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCdcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbkdVWSAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXknXG57IGRlYnVnXG4gIGluZm9cbiAgd2hpc3BlclxuICB3YXJuXG4gIHVyZ2VcbiAgaGVscCB9ICAgICAgICAgICAgICAgICAgPSBHVVkudHJtLmdldF9sb2dnZXJzICdqenIvY2xpJ1xueyBycHJcbiAgZWNobyB9ICAgICAgICAgICAgICAgICAgPSBHVVkudHJtXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgcmV2ZXJzZSxcbiAgbGltZSxcbiAgYmx1ZSxcbiAgZ29sZCxcbiAgcmVkLCAgICAgICAgICAgICAgICAgIH0gPSBHVVkudHJtXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbk1JWEEgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdtaXhhJ1xueyBKaXp1cmEsICAgICAgICAgICAgICAgfSA9IHJlcXVpcmUgJy4vbWFpbidcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGNsaSA9IC0+XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgam9iZGVmcyA9XG4gICAgbWV0YTpcbiAgICAgICdwYWdlcic6XG4gICAgICAgIGFsaWFzOiAgICAgICAgJ3AnXG4gICAgICAgIHR5cGU6ICAgICAgICAgQm9vbGVhblxuICAgICAgICBkZXNjcmlwdGlvbjogIFwidXNlIHBhZ2VyXCJcbiAgICBjb21tYW5kczpcbiAgICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgJ2hlbHAnOlxuICAgICAgICBydW5uZXI6ICggZCApID0+XG4gICAgICAgICAgZGVidWcgJ86panNkYmNsaV9fXzEnLCBwcm9jZXNzLmFyZ3ZcbiAgICAgICAgICBlY2hvIGxpbWUgXCJcIlwianpyZGI6IHByb2R1Y2UgYW5kIHNob3cgQ0pLIGNvbXBvc2l0aW9uYWwgZGF0YVwiXCJcIlxuICAgICAgICAgIGVjaG8gYmx1ZSBcIlwiXCJcbiAgICAgICAgICAgIFVzYWdlOlxuICAgICAgICAgICAgICBqenJkYiBbbWV0YV0gJGNvbW1hbmQgW2ZsYWdzXSBbYXJndW1lbnRdXG5cbiAgICAgICAgICAgICAgICBtZXRhOlxuICAgICAgICAgICAgICAgICAgLS1wYWdlciAvIC1wIC0tIHVzZSBwc3BnIHRvIHBhZ2Ugb3V0cHV0XG5cbiAgICAgICAgICAgICAgICBjb21tYW5kOlxuXG4gICAgICAgICAgICAgICAgICBxdWVyeSAtLSBzZW5kIGFuIFNRTCBxdWVyeVxuICAgICAgICAgICAgICAgICAgICAtLXF1ZXJ5IC8gLXEgLyBwb3NpdGlvbmFsIGFyZ3VtZW50IC0tIHRoZSBxdWVyeSAocmVxdWlyZWQpXG5cbiAgICAgICAgICAgICAgICAgIGluZm8gLS0gc2hvdyBhbiBvdmVydmlldyBvZiB0YWJsZXMgYW5kIHZpZXdzXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgJ3F1ZXJ5JzpcbiAgICAgICAgZGVzY3JpcHRpb246ICBcInJ1biBhbiBTUUwgcXVlcnlcIlxuICAgICAgICBmbGFnczpcbiAgICAgICAgICAncXVlcnknOlxuICAgICAgICAgICAgYWxpYXM6ICAgICAgICAncSdcbiAgICAgICAgICAgIHR5cGU6ICAgICAgICAgU3RyaW5nXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogIFwiU1FMIHF1ZXJ5XCJcbiAgICAgICAgICAgIHBvc2l0aW9uYWw6ICAgdHJ1ZVxuICAgICAgICBydW5uZXI6ICggZCApID0+XG4gICAgICAgICAgeyBvdXRwdXRfcXVlcnlfYXNfY3N2LCB9ID0gcmVxdWlyZSAnLi9kZW1vJ1xuICAgICAgICAgIG91dHB1dF9xdWVyeV9hc19jc3YgZC52ZXJkaWN0LnBhcmFtZXRlcnMucXVlcnlcbiAgICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgJ2luZm8nOlxuICAgICAgICBkZXNjcmlwdGlvbjogIFwic2hvdyBpbmZvIG9uIGNvbmZpZ3VyYXRpb24gc2V0dGluZ3MgJmNcIlxuICAgICAgICBmbGFnczpcbiAgICAgICAgICAncm93cyc6XG4gICAgICAgICAgICBhbGlhczogICAgICAgICduJ1xuICAgICAgICAgICAgdHlwZTogICAgICAgICBOdW1iZXJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAgXCJudW1iZXIgb2Ygcm93c1wiXG4gICAgICAgIHJ1bm5lcjogKCBkICkgPT5cbiAgICAgICAgICB7IGRlbW9fc2hvd19hbGxfdGFibGVzLCB9ID0gcmVxdWlyZSAnLi9kZW1vJ1xuICAgICAgICAgIHsgcm93cywgICAgICAgICAgICAgICAgIH0gPSBkLnZlcmRpY3QucGFyYW1ldGVyc1xuICAgICAgICAgIGRlbW9fc2hvd19hbGxfdGFibGVzIHsgcm93cywgfVxuICAgICAgICAgIHJldHVybiBudWxsXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgTUlYQS5ydW4gam9iZGVmcywgcHJvY2Vzcy5hcmd2XG4gIHJldHVybiBudWxsXG5cblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbmlmIG1vZHVsZSBpcyByZXF1aXJlLm1haW4gdGhlbiBkbyA9PlxuICAjIGF3YWl0IEBjbGkoKVxuICBAY2xpKClcbiAgIyBjbGlfY29tbWFuZHMgPVxuICAjICAgdXNlX3BzcGc6IFwizqkgY29tbWFuZDogdXNlLXBzcGcgzqlcIlxuICAjIGVjaG8gY2xpX2NvbW1hbmRzLnVzZV9wc3BnXG4gICMgZWNobyBcIs6panNkYmNsaV9fXzYgaGVsb1wiXG4gICMgZWNobyBcIs6panNkYmNsaV9fXzcgbGluZSAyXCJcbiJdfQ==
