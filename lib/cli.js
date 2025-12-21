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
  // PATH                      = require 'node:path'
  // FS                        = require 'fs-extra'
  // CP                        = require 'node:child_process'
  // H                         = require './helpers'
  // types                     = require './types'
  // { isa
  //   validate }              = types
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
            debug('Ωjsdbcli___2', d.verdict.parameters.query);
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
            // debug 'Ωjsdbcli___3', process.argv
            // debug 'Ωjsdbcli___4', "info"
            // debug 'Ωjsdbcli___5',
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7RUFBQTtBQUFBLE1BQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQTs7O0VBSUEsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxJQURGLEVBRUUsT0FGRixFQUdFLElBSEYsRUFJRSxJQUpGLEVBS0UsSUFMRixDQUFBLEdBSzRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBUixDQUFvQixTQUFwQixDQUw1Qjs7RUFNQSxDQUFBLENBQUUsR0FBRixFQUNFLElBREYsQ0FBQSxHQUM0QixHQUFHLENBQUMsR0FEaEMsRUFYQTs7O0VBY0EsQ0FBQSxDQUFFLE9BQUYsRUFDRSxJQURGLEVBRUUsSUFGRixFQUdFLElBSEYsRUFJRSxHQUpGLENBQUEsR0FJNEIsR0FBRyxDQUFDLEdBSmhDLEVBZEE7Ozs7Ozs7Ozs7RUEyQkEsSUFBQSxHQUE0QixPQUFBLENBQVEsTUFBUjs7RUFDNUIsQ0FBQSxDQUFFLE1BQUYsQ0FBQSxHQUE0QixPQUFBLENBQVEsUUFBUixDQUE1QixFQTVCQTs7Ozs7RUFrQ0EsSUFBQyxDQUFBLEdBQUQsR0FBTyxRQUFBLENBQUEsQ0FBQTtBQUNQLFFBQUEsT0FBQTs7SUFDRSxPQUFBLEdBQ0U7TUFBQSxJQUFBLEVBQ0U7UUFBQSxPQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQWMsR0FBZDtVQUNBLElBQUEsRUFBYyxPQURkO1VBRUEsV0FBQSxFQUFjO1FBRmQ7TUFERixDQURGO01BS0EsUUFBQSxFQUVFLENBQUE7O1FBQUEsTUFBQSxFQUNFO1VBQUEsTUFBQSxFQUFRLENBQUUsQ0FBRixDQUFBLEdBQUE7WUFDTixLQUFBLENBQU0sY0FBTixFQUFzQixPQUFPLENBQUMsSUFBOUI7WUFDQSxJQUFBLENBQUssSUFBQSxDQUFLLENBQUEsOENBQUEsQ0FBTCxDQUFMO21CQUNBLElBQUEsQ0FBSyxJQUFBLENBQUssQ0FBQTs7Ozs7Ozs7Ozs7a0RBQUEsQ0FBTCxDQUFMO1VBSE07UUFBUixDQURGOztRQW1CQSxPQUFBLEVBQ0U7VUFBQSxXQUFBLEVBQWMsa0JBQWQ7VUFDQSxLQUFBLEVBQ0U7WUFBQSxPQUFBLEVBQ0U7Y0FBQSxLQUFBLEVBQWMsR0FBZDtjQUNBLElBQUEsRUFBYyxNQURkO2NBRUEsV0FBQSxFQUFjLFdBRmQ7Y0FHQSxVQUFBLEVBQWM7WUFIZDtVQURGLENBRkY7VUFPQSxNQUFBLEVBQVEsQ0FBRSxDQUFGLENBQUEsR0FBQTtBQUNoQixnQkFBQTtZQUFVLEtBQUEsQ0FBTSxjQUFOLEVBQXNCLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQTNDO1lBQ0EsQ0FBQSxDQUFFLG1CQUFGLENBQUEsR0FBMkIsT0FBQSxDQUFRLFFBQVIsQ0FBM0I7bUJBQ0EsbUJBQUEsQ0FBb0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBekM7VUFITTtRQVBSLENBcEJGOztRQWdDQSxNQUFBLEVBQ0U7VUFBQSxXQUFBLEVBQWMsd0NBQWQ7VUFDQSxLQUFBLEVBQ0U7WUFBQSxNQUFBLEVBQ0U7Y0FBQSxLQUFBLEVBQWMsR0FBZDtjQUNBLElBQUEsRUFBYyxNQURkO2NBRUEsV0FBQSxFQUFjO1lBRmQ7VUFERixDQUZGO1VBTUEsTUFBQSxFQUFRLENBQUUsQ0FBRixDQUFBLEdBQUE7QUFDaEIsZ0JBQUEsb0JBQUEsRUFBQSxJQUFBOzs7O1lBR1UsQ0FBQSxDQUFFLG9CQUFGLENBQUEsR0FBNEIsT0FBQSxDQUFRLFFBQVIsQ0FBNUI7WUFDQSxDQUFBLENBQUUsSUFBRixDQUFBLEdBQTRCLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBdEM7WUFDQSxvQkFBQSxDQUFxQixDQUFFLElBQUYsQ0FBckI7QUFDQSxtQkFBTztVQVBEO1FBTlI7TUFqQ0Y7SUFQRixFQUZKOztJQXlERSxJQUFJLENBQUMsR0FBTCxDQUFTLE9BQVQsRUFBa0IsT0FBTyxDQUFDLElBQTFCO0FBQ0EsV0FBTztFQTNERixFQWxDUDs7O0VBa0dBLElBQUcsTUFBQSxLQUFVLE9BQU8sQ0FBQyxJQUFyQjtJQUFrQyxDQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUE7O2FBRWhDLElBQUMsQ0FBQSxHQUFELENBQUE7SUFGZ0MsQ0FBQSxJQUFsQzs7O0VBbEdBOzs7OztBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0J1xuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuR1VZICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2d1eSdcbnsgZGVidWdcbiAgaW5mb1xuICB3aGlzcGVyXG4gIHdhcm5cbiAgdXJnZVxuICBoZWxwIH0gICAgICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ2p6ci9jbGknXG57IHJwclxuICBlY2hvIH0gICAgICAgICAgICAgICAgICA9IEdVWS50cm1cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyByZXZlcnNlLFxuICBsaW1lLFxuICBibHVlLFxuICBnb2xkLFxuICByZWQsICAgICAgICAgICAgICAgICAgfSA9IEdVWS50cm1cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuIyBQQVRIICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpwYXRoJ1xuIyBGUyAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZnMtZXh0cmEnXG4jIENQICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdub2RlOmNoaWxkX3Byb2Nlc3MnXG4jIEggICAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL2hlbHBlcnMnXG4jIHR5cGVzICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICcuL3R5cGVzJ1xuIyB7IGlzYVxuIyAgIHZhbGlkYXRlIH0gICAgICAgICAgICAgID0gdHlwZXNcbk1JWEEgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdtaXhhJ1xueyBKaXp1cmEsICAgICAgICAgICAgICAgfSA9IHJlcXVpcmUgJy4vbWFpbidcblxuXG4jPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT1cbiNcbiMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuQGNsaSA9IC0+XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgam9iZGVmcyA9XG4gICAgbWV0YTpcbiAgICAgICdwYWdlcic6XG4gICAgICAgIGFsaWFzOiAgICAgICAgJ3AnXG4gICAgICAgIHR5cGU6ICAgICAgICAgQm9vbGVhblxuICAgICAgICBkZXNjcmlwdGlvbjogIFwidXNlIHBhZ2VyXCJcbiAgICBjb21tYW5kczpcbiAgICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgJ2hlbHAnOlxuICAgICAgICBydW5uZXI6ICggZCApID0+XG4gICAgICAgICAgZGVidWcgJ86panNkYmNsaV9fXzEnLCBwcm9jZXNzLmFyZ3ZcbiAgICAgICAgICBlY2hvIGxpbWUgXCJcIlwianpyZGI6IHByb2R1Y2UgYW5kIHNob3cgQ0pLIGNvbXBvc2l0aW9uYWwgZGF0YVwiXCJcIlxuICAgICAgICAgIGVjaG8gYmx1ZSBcIlwiXCJcbiAgICAgICAgICAgIFVzYWdlOlxuICAgICAgICAgICAgICBqenJkYiBbbWV0YV0gJGNvbW1hbmQgW2ZsYWdzXSBbYXJndW1lbnRdXG5cbiAgICAgICAgICAgICAgICBtZXRhOlxuICAgICAgICAgICAgICAgICAgLS1wYWdlciAvIC1wIC0tIHVzZSBwc3BnIHRvIHBhZ2Ugb3V0cHV0XG5cbiAgICAgICAgICAgICAgICBjb21tYW5kOlxuXG4gICAgICAgICAgICAgICAgICBxdWVyeSAtLSBzZW5kIGFuIFNRTCBxdWVyeVxuICAgICAgICAgICAgICAgICAgICAtLXF1ZXJ5IC8gLXEgLyBwb3NpdGlvbmFsIGFyZ3VtZW50IC0tIHRoZSBxdWVyeSAocmVxdWlyZWQpXG5cbiAgICAgICAgICAgICAgICAgIGluZm8gLS0gc2hvdyBhbiBvdmVydmlldyBvZiB0YWJsZXMgYW5kIHZpZXdzXG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgJ3F1ZXJ5JzpcbiAgICAgICAgZGVzY3JpcHRpb246ICBcInJ1biBhbiBTUUwgcXVlcnlcIlxuICAgICAgICBmbGFnczpcbiAgICAgICAgICAncXVlcnknOlxuICAgICAgICAgICAgYWxpYXM6ICAgICAgICAncSdcbiAgICAgICAgICAgIHR5cGU6ICAgICAgICAgU3RyaW5nXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogIFwiU1FMIHF1ZXJ5XCJcbiAgICAgICAgICAgIHBvc2l0aW9uYWw6ICAgdHJ1ZVxuICAgICAgICBydW5uZXI6ICggZCApID0+XG4gICAgICAgICAgZGVidWcgJ86panNkYmNsaV9fXzInLCBkLnZlcmRpY3QucGFyYW1ldGVycy5xdWVyeVxuICAgICAgICAgIHsgb3V0cHV0X3F1ZXJ5X2FzX2NzdiwgfSA9IHJlcXVpcmUgJy4vZGVtbydcbiAgICAgICAgICBvdXRwdXRfcXVlcnlfYXNfY3N2IGQudmVyZGljdC5wYXJhbWV0ZXJzLnF1ZXJ5XG4gICAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICdpbmZvJzpcbiAgICAgICAgZGVzY3JpcHRpb246ICBcInNob3cgaW5mbyBvbiBjb25maWd1cmF0aW9uIHNldHRpbmdzICZjXCJcbiAgICAgICAgZmxhZ3M6XG4gICAgICAgICAgJ3Jvd3MnOlxuICAgICAgICAgICAgYWxpYXM6ICAgICAgICAnbidcbiAgICAgICAgICAgIHR5cGU6ICAgICAgICAgTnVtYmVyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogIFwibnVtYmVyIG9mIHJvd3NcIlxuICAgICAgICBydW5uZXI6ICggZCApID0+XG4gICAgICAgICAgIyBkZWJ1ZyAnzqlqc2RiY2xpX19fMycsIHByb2Nlc3MuYXJndlxuICAgICAgICAgICMgZGVidWcgJ86panNkYmNsaV9fXzQnLCBcImluZm9cIlxuICAgICAgICAgICMgZGVidWcgJ86panNkYmNsaV9fXzUnLFxuICAgICAgICAgIHsgZGVtb19zaG93X2FsbF90YWJsZXMsIH0gPSByZXF1aXJlICcuL2RlbW8nXG4gICAgICAgICAgeyByb3dzLCAgICAgICAgICAgICAgICAgfSA9IGQudmVyZGljdC5wYXJhbWV0ZXJzXG4gICAgICAgICAgZGVtb19zaG93X2FsbF90YWJsZXMgeyByb3dzLCB9XG4gICAgICAgICAgcmV0dXJuIG51bGxcbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBNSVhBLnJ1biBqb2JkZWZzLCBwcm9jZXNzLmFyZ3ZcbiAgcmV0dXJuIG51bGxcblxuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuaWYgbW9kdWxlIGlzIHJlcXVpcmUubWFpbiB0aGVuIGRvID0+XG4gICMgYXdhaXQgQGNsaSgpXG4gIEBjbGkoKVxuICAjIGNsaV9jb21tYW5kcyA9XG4gICMgICB1c2VfcHNwZzogXCLOqSBjb21tYW5kOiB1c2UtcHNwZyDOqVwiXG4gICMgZWNobyBjbGlfY29tbWFuZHMudXNlX3BzcGdcbiAgIyBlY2hvIFwizqlqc2RiY2xpX19fNiBoZWxvXCJcbiAgIyBlY2hvIFwizqlqc2RiY2xpX19fNyBsaW5lIDJcIlxuIl19
