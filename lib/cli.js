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
      // meta:
      commands: {
        //-----------------------------------------------------------------------------------------------------
        'help': {
          runner: (d) => {
            debug('Ωjsdbcli___1', process.argv);
            echo(lime(`jzrdb: produce and show CJK compositional data`));
            return echo(blue(`Usage:
  jzrdb $command [flags]
    --input       -i
    --overwrite   -y
    --output      -o
    --split
    --tempdir     -t`));
          }
        },
        //-----------------------------------------------------------------------------------------------------
        'query': {
          description: "run an SQL query",
          // parameters:  [ 'query', ]
          flags: {
            'query': {
              alias: 'q',
              type: String,
              description: "SQL query",
              positional: true
            }
          },
          // allow_extra: true
          // plus: { query: 'select 1 as a;' }
          runner: (d) => {
            var output_query_as_csv;
            // debug 'Ωjsdbcli___2', d
            // debug 'Ωjsdbcli___3', d.verdict
            debug('Ωjsdbcli___4', d.verdict.parameters.query);
            ({output_query_as_csv} = require('./demo'));
            return output_query_as_csv(d.verdict.parameters.query);
          }
        },
        // output_query_as_csv query
        //-----------------------------------------------------------------------------------------------------
        'info': {
          description: "show info on configuration settings &c",
          runner: (d) => {
            var demo_show_all_tables;
            //   # multiple:     'greedy'
            debug('Ωjsdbcli___5', process.argv);
            debug('Ωjsdbcli___6', "info");
            ({demo_show_all_tables} = require('./demo'));
            demo_show_all_tables();
            // debug 'Ωjsdbcli___7', cfg
            // cfg             = types.create.mtr_impose_cfg d.verdict.parameters
            // # await GUY.temp.with_directory { keep: true, }, ({ path }) ->
            // ### TAINT `cfg` key/value duplication ###
            // if cfg.tempdir?
            //   mkdirp.sync cfg.tempdir
            //   return await run_impose cfg
            // else
            //   do ( path = '/tmp/guy.temp--12229-ZUjUOVQEIZXI' ) ->
            //     cfg.tempdir = path
            //     return await run_impose cfg
            return null;
          }
        }
      }
    };
    // flags:
    //   'layout':
    //     alias:        'l'
    //     type:         String
    //     description:  "name of a layout; defaults to 'pps16'"
    // 'input':
    //   alias:        'i'
    //   type:         String
    //   # positional:   true
    //   # multiple:     'greedy'
    //   description:  "input file (providing the individual pages)"
    // 'output':
    //   alias:        'o'
    //   type:         String
    //   # positional:   true
    //   description:  "output file (containing the booklet with multiple pages per sheet, front and back)"
    // 'overwrite':
    //   alias:        'y'
    //   type:         Boolean
    //   # positional:   true
    //   description:  "whether to overwrite output file"
    // 'split':
    //   # alias:        'y'
    //   type:         String
    //   # positional:   true
    //   description:  "use positive page nr or negative count to control insertion of empty pages"
    // 'tempdir':
    //   alias:        't'
    //   type:         String
    //   # positional:   true
    //   description:  "use the directory given to run TeX in instead of a temporary directory"
    // 'backdrop':
    //   alias:        'b'
    //   type:         String
    //   # positional:   true
    //   description:  "use the PDF or image given as a backdrop"
    //-----------------------------------------------------------------------------------------------------
    // 'tex':
    //   description:  "run XeLaTeX on tex/booklet.tex to produce tex/booklet.pdf"
    // runner: run_tex
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
// echo "Ωjsdbcli___8 helo"
// echo "Ωjsdbcli___9 line 2"

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7RUFBQTtBQUFBLE1BQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQTs7O0VBSUEsR0FBQSxHQUE0QixPQUFBLENBQVEsS0FBUjs7RUFDNUIsQ0FBQSxDQUFFLEtBQUYsRUFDRSxJQURGLEVBRUUsT0FGRixFQUdFLElBSEYsRUFJRSxJQUpGLEVBS0UsSUFMRixDQUFBLEdBSzRCLEdBQUcsQ0FBQyxHQUFHLENBQUMsV0FBUixDQUFvQixTQUFwQixDQUw1Qjs7RUFNQSxDQUFBLENBQUUsR0FBRixFQUNFLElBREYsQ0FBQSxHQUM0QixHQUFHLENBQUMsR0FEaEMsRUFYQTs7O0VBY0EsQ0FBQSxDQUFFLE9BQUYsRUFDRSxJQURGLEVBRUUsSUFGRixFQUdFLElBSEYsRUFJRSxHQUpGLENBQUEsR0FJNEIsR0FBRyxDQUFDLEdBSmhDLEVBZEE7Ozs7Ozs7Ozs7RUEyQkEsSUFBQSxHQUE0QixPQUFBLENBQVEsTUFBUjs7RUFDNUIsQ0FBQSxDQUFFLE1BQUYsQ0FBQSxHQUE0QixPQUFBLENBQVEsUUFBUixDQUE1QixFQTVCQTs7Ozs7RUFrQ0EsSUFBQyxDQUFBLEdBQUQsR0FBTyxRQUFBLENBQUEsQ0FBQTtBQUNQLFFBQUEsT0FBQTs7SUFDRSxPQUFBLEdBRUUsQ0FBQTs7TUFBQSxRQUFBLEVBRUUsQ0FBQTs7UUFBQSxNQUFBLEVBQ0U7VUFBQSxNQUFBLEVBQVEsQ0FBRSxDQUFGLENBQUEsR0FBQTtZQUNOLEtBQUEsQ0FBTSxjQUFOLEVBQXNCLE9BQU8sQ0FBQyxJQUE5QjtZQUNBLElBQUEsQ0FBSyxJQUFBLENBQUssQ0FBQSw4Q0FBQSxDQUFMLENBQUw7bUJBQ0EsSUFBQSxDQUFLLElBQUEsQ0FBSyxDQUFBOzs7Ozs7b0JBQUEsQ0FBTCxDQUFMO1VBSE07UUFBUixDQURGOztRQWNBLE9BQUEsRUFDRTtVQUFBLFdBQUEsRUFBYyxrQkFBZDs7VUFFQSxLQUFBLEVBQ0U7WUFBQSxPQUFBLEVBQ0U7Y0FBQSxLQUFBLEVBQWMsR0FBZDtjQUNBLElBQUEsRUFBYyxNQURkO2NBRUEsV0FBQSxFQUFjLFdBRmQ7Y0FHQSxVQUFBLEVBQWM7WUFIZDtVQURGLENBSEY7OztVQVVBLE1BQUEsRUFBUSxDQUFFLENBQUYsQ0FBQSxHQUFBO0FBQ2hCLGdCQUFBLG1CQUFBOzs7WUFFVSxLQUFBLENBQU0sY0FBTixFQUFzQixDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUEzQztZQUNBLENBQUEsQ0FBRSxtQkFBRixDQUFBLEdBQTJCLE9BQUEsQ0FBUSxRQUFSLENBQTNCO21CQUNBLG1CQUFBLENBQW9CLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLEtBQXpDO1VBTE07UUFWUixDQWZGOzs7UUFpQ0EsTUFBQSxFQUNFO1VBQUEsV0FBQSxFQUFjLHdDQUFkO1VBQ0EsTUFBQSxFQUFRLENBQUUsQ0FBRixDQUFBLEdBQUE7QUFDaEIsZ0JBQUEsb0JBQUE7O1lBQ1UsS0FBQSxDQUFNLGNBQU4sRUFBc0IsT0FBTyxDQUFDLElBQTlCO1lBQ0EsS0FBQSxDQUFNLGNBQU4sRUFBc0IsTUFBdEI7WUFDQSxDQUFBLENBQUUsb0JBQUYsQ0FBQSxHQUE0QixPQUFBLENBQVEsUUFBUixDQUE1QjtZQUNBLG9CQUFBLENBQUEsRUFKVjs7Ozs7Ozs7Ozs7O0FBZ0JVLG1CQUFPO1VBakJEO1FBRFI7TUFsQ0Y7SUFGRixFQUhKOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUFtR0UsSUFBSSxDQUFDLEdBQUwsQ0FBUyxPQUFULEVBQWtCLE9BQU8sQ0FBQyxJQUExQjtBQUNBLFdBQU87RUFyR0YsRUFsQ1A7OztFQTRJQSxJQUFHLE1BQUEsS0FBVSxPQUFPLENBQUMsSUFBckI7SUFBa0MsQ0FBQSxDQUFBLENBQUEsR0FBQSxFQUFBOzthQUVoQyxJQUFDLENBQUEsR0FBRCxDQUFBO0lBRmdDLENBQUEsSUFBbEM7OztFQTVJQTs7Ozs7QUFBQSIsInNvdXJjZXNDb250ZW50IjpbIlxuXG4ndXNlIHN0cmljdCdcblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbkdVWSAgICAgICAgICAgICAgICAgICAgICAgPSByZXF1aXJlICdndXknXG57IGRlYnVnXG4gIGluZm9cbiAgd2hpc3BlclxuICB3YXJuXG4gIHVyZ2VcbiAgaGVscCB9ICAgICAgICAgICAgICAgICAgPSBHVVkudHJtLmdldF9sb2dnZXJzICdqenIvY2xpJ1xueyBycHJcbiAgZWNobyB9ICAgICAgICAgICAgICAgICAgPSBHVVkudHJtXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbnsgcmV2ZXJzZSxcbiAgbGltZSxcbiAgYmx1ZSxcbiAgZ29sZCxcbiAgcmVkLCAgICAgICAgICAgICAgICAgIH0gPSBHVVkudHJtXG4jLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiMgUEFUSCAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ25vZGU6cGF0aCdcbiMgRlMgICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2ZzLWV4dHJhJ1xuIyBDUCAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbm9kZTpjaGlsZF9wcm9jZXNzJ1xuIyBIICAgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi9oZWxwZXJzJ1xuIyB0eXBlcyAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnLi90eXBlcydcbiMgeyBpc2FcbiMgICB2YWxpZGF0ZSB9ICAgICAgICAgICAgICA9IHR5cGVzXG5NSVhBICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbWl4YSdcbnsgSml6dXJhLCAgICAgICAgICAgICAgIH0gPSByZXF1aXJlICcuL21haW4nXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjbGkgPSAtPlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGpvYmRlZnMgPVxuICAgICMgbWV0YTpcbiAgICBjb21tYW5kczpcbiAgICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgJ2hlbHAnOlxuICAgICAgICBydW5uZXI6ICggZCApID0+XG4gICAgICAgICAgZGVidWcgJ86panNkYmNsaV9fXzEnLCBwcm9jZXNzLmFyZ3ZcbiAgICAgICAgICBlY2hvIGxpbWUgXCJcIlwianpyZGI6IHByb2R1Y2UgYW5kIHNob3cgQ0pLIGNvbXBvc2l0aW9uYWwgZGF0YVwiXCJcIlxuICAgICAgICAgIGVjaG8gYmx1ZSBcIlwiXCJcbiAgICAgICAgICAgIFVzYWdlOlxuICAgICAgICAgICAgICBqenJkYiAkY29tbWFuZCBbZmxhZ3NdXG4gICAgICAgICAgICAgICAgLS1pbnB1dCAgICAgICAtaVxuICAgICAgICAgICAgICAgIC0tb3ZlcndyaXRlICAgLXlcbiAgICAgICAgICAgICAgICAtLW91dHB1dCAgICAgIC1vXG4gICAgICAgICAgICAgICAgLS1zcGxpdFxuICAgICAgICAgICAgICAgIC0tdGVtcGRpciAgICAgLXRcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAncXVlcnknOlxuICAgICAgICBkZXNjcmlwdGlvbjogIFwicnVuIGFuIFNRTCBxdWVyeVwiXG4gICAgICAgICMgcGFyYW1ldGVyczogIFsgJ3F1ZXJ5JywgXVxuICAgICAgICBmbGFnczpcbiAgICAgICAgICAncXVlcnknOlxuICAgICAgICAgICAgYWxpYXM6ICAgICAgICAncSdcbiAgICAgICAgICAgIHR5cGU6ICAgICAgICAgU3RyaW5nXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogIFwiU1FMIHF1ZXJ5XCJcbiAgICAgICAgICAgIHBvc2l0aW9uYWw6ICAgdHJ1ZVxuICAgICAgICAjIGFsbG93X2V4dHJhOiB0cnVlXG4gICAgICAgICMgcGx1czogeyBxdWVyeTogJ3NlbGVjdCAxIGFzIGE7JyB9XG4gICAgICAgIHJ1bm5lcjogKCBkICkgPT5cbiAgICAgICAgICAjIGRlYnVnICfOqWpzZGJjbGlfX18yJywgZFxuICAgICAgICAgICMgZGVidWcgJ86panNkYmNsaV9fXzMnLCBkLnZlcmRpY3RcbiAgICAgICAgICBkZWJ1ZyAnzqlqc2RiY2xpX19fNCcsIGQudmVyZGljdC5wYXJhbWV0ZXJzLnF1ZXJ5XG4gICAgICAgICAgeyBvdXRwdXRfcXVlcnlfYXNfY3N2LCB9ID0gcmVxdWlyZSAnLi9kZW1vJ1xuICAgICAgICAgIG91dHB1dF9xdWVyeV9hc19jc3YgZC52ZXJkaWN0LnBhcmFtZXRlcnMucXVlcnlcbiAgICAgICAgICAjIG91dHB1dF9xdWVyeV9hc19jc3YgcXVlcnlcbiAgICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgJ2luZm8nOlxuICAgICAgICBkZXNjcmlwdGlvbjogIFwic2hvdyBpbmZvIG9uIGNvbmZpZ3VyYXRpb24gc2V0dGluZ3MgJmNcIlxuICAgICAgICBydW5uZXI6ICggZCApID0+XG4gICAgICAgICAgIyAgICMgbXVsdGlwbGU6ICAgICAnZ3JlZWR5J1xuICAgICAgICAgIGRlYnVnICfOqWpzZGJjbGlfX181JywgcHJvY2Vzcy5hcmd2XG4gICAgICAgICAgZGVidWcgJ86panNkYmNsaV9fXzYnLCBcImluZm9cIlxuICAgICAgICAgIHsgZGVtb19zaG93X2FsbF90YWJsZXMsIH0gPSByZXF1aXJlICcuL2RlbW8nXG4gICAgICAgICAgZGVtb19zaG93X2FsbF90YWJsZXMoKVxuICAgICAgICAgICMgZGVidWcgJ86panNkYmNsaV9fXzcnLCBjZmdcbiAgICAgICAgICAjIGNmZyAgICAgICAgICAgICA9IHR5cGVzLmNyZWF0ZS5tdHJfaW1wb3NlX2NmZyBkLnZlcmRpY3QucGFyYW1ldGVyc1xuICAgICAgICAgICMgIyBhd2FpdCBHVVkudGVtcC53aXRoX2RpcmVjdG9yeSB7IGtlZXA6IHRydWUsIH0sICh7IHBhdGggfSkgLT5cbiAgICAgICAgICAjICMjIyBUQUlOVCBgY2ZnYCBrZXkvdmFsdWUgZHVwbGljYXRpb24gIyMjXG4gICAgICAgICAgIyBpZiBjZmcudGVtcGRpcj9cbiAgICAgICAgICAjICAgbWtkaXJwLnN5bmMgY2ZnLnRlbXBkaXJcbiAgICAgICAgICAjICAgcmV0dXJuIGF3YWl0IHJ1bl9pbXBvc2UgY2ZnXG4gICAgICAgICAgIyBlbHNlXG4gICAgICAgICAgIyAgIGRvICggcGF0aCA9ICcvdG1wL2d1eS50ZW1wLS0xMjIyOS1aVWpVT1ZRRUlaWEknICkgLT5cbiAgICAgICAgICAjICAgICBjZmcudGVtcGRpciA9IHBhdGhcbiAgICAgICAgICAjICAgICByZXR1cm4gYXdhaXQgcnVuX2ltcG9zZSBjZmdcbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAgICAgICAjIGZsYWdzOlxuICAgICAgICAjICAgJ2xheW91dCc6XG4gICAgICAgICMgICAgIGFsaWFzOiAgICAgICAgJ2wnXG4gICAgICAgICMgICAgIHR5cGU6ICAgICAgICAgU3RyaW5nXG4gICAgICAgICMgICAgIGRlc2NyaXB0aW9uOiAgXCJuYW1lIG9mIGEgbGF5b3V0OyBkZWZhdWx0cyB0byAncHBzMTYnXCJcbiAgICAgICAgICAjICdpbnB1dCc6XG4gICAgICAgICAgIyAgIGFsaWFzOiAgICAgICAgJ2knXG4gICAgICAgICAgIyAgIHR5cGU6ICAgICAgICAgU3RyaW5nXG4gICAgICAgICAgIyAgICMgcG9zaXRpb25hbDogICB0cnVlXG4gICAgICAgICAgIyAgICMgbXVsdGlwbGU6ICAgICAnZ3JlZWR5J1xuICAgICAgICAgICMgICBkZXNjcmlwdGlvbjogIFwiaW5wdXQgZmlsZSAocHJvdmlkaW5nIHRoZSBpbmRpdmlkdWFsIHBhZ2VzKVwiXG4gICAgICAgICAgIyAnb3V0cHV0JzpcbiAgICAgICAgICAjICAgYWxpYXM6ICAgICAgICAnbydcbiAgICAgICAgICAjICAgdHlwZTogICAgICAgICBTdHJpbmdcbiAgICAgICAgICAjICAgIyBwb3NpdGlvbmFsOiAgIHRydWVcbiAgICAgICAgICAjICAgZGVzY3JpcHRpb246ICBcIm91dHB1dCBmaWxlIChjb250YWluaW5nIHRoZSBib29rbGV0IHdpdGggbXVsdGlwbGUgcGFnZXMgcGVyIHNoZWV0LCBmcm9udCBhbmQgYmFjaylcIlxuICAgICAgICAgICMgJ292ZXJ3cml0ZSc6XG4gICAgICAgICAgIyAgIGFsaWFzOiAgICAgICAgJ3knXG4gICAgICAgICAgIyAgIHR5cGU6ICAgICAgICAgQm9vbGVhblxuICAgICAgICAgICMgICAjIHBvc2l0aW9uYWw6ICAgdHJ1ZVxuICAgICAgICAgICMgICBkZXNjcmlwdGlvbjogIFwid2hldGhlciB0byBvdmVyd3JpdGUgb3V0cHV0IGZpbGVcIlxuICAgICAgICAgICMgJ3NwbGl0JzpcbiAgICAgICAgICAjICAgIyBhbGlhczogICAgICAgICd5J1xuICAgICAgICAgICMgICB0eXBlOiAgICAgICAgIFN0cmluZ1xuICAgICAgICAgICMgICAjIHBvc2l0aW9uYWw6ICAgdHJ1ZVxuICAgICAgICAgICMgICBkZXNjcmlwdGlvbjogIFwidXNlIHBvc2l0aXZlIHBhZ2UgbnIgb3IgbmVnYXRpdmUgY291bnQgdG8gY29udHJvbCBpbnNlcnRpb24gb2YgZW1wdHkgcGFnZXNcIlxuICAgICAgICAgICMgJ3RlbXBkaXInOlxuICAgICAgICAgICMgICBhbGlhczogICAgICAgICd0J1xuICAgICAgICAgICMgICB0eXBlOiAgICAgICAgIFN0cmluZ1xuICAgICAgICAgICMgICAjIHBvc2l0aW9uYWw6ICAgdHJ1ZVxuICAgICAgICAgICMgICBkZXNjcmlwdGlvbjogIFwidXNlIHRoZSBkaXJlY3RvcnkgZ2l2ZW4gdG8gcnVuIFRlWCBpbiBpbnN0ZWFkIG9mIGEgdGVtcG9yYXJ5IGRpcmVjdG9yeVwiXG4gICAgICAgICAgIyAnYmFja2Ryb3AnOlxuICAgICAgICAgICMgICBhbGlhczogICAgICAgICdiJ1xuICAgICAgICAgICMgICB0eXBlOiAgICAgICAgIFN0cmluZ1xuICAgICAgICAgICMgICAjIHBvc2l0aW9uYWw6ICAgdHJ1ZVxuICAgICAgICAgICMgICBkZXNjcmlwdGlvbjogIFwidXNlIHRoZSBQREYgb3IgaW1hZ2UgZ2l2ZW4gYXMgYSBiYWNrZHJvcFwiXG4gICAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICMgJ3RleCc6XG4gICAgICAjICAgZGVzY3JpcHRpb246ICBcInJ1biBYZUxhVGVYIG9uIHRleC9ib29rbGV0LnRleCB0byBwcm9kdWNlIHRleC9ib29rbGV0LnBkZlwiXG4gICAgICAgICMgcnVubmVyOiBydW5fdGV4XG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgTUlYQS5ydW4gam9iZGVmcywgcHJvY2Vzcy5hcmd2XG4gIHJldHVybiBudWxsXG5cblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbmlmIG1vZHVsZSBpcyByZXF1aXJlLm1haW4gdGhlbiBkbyA9PlxuICAjIGF3YWl0IEBjbGkoKVxuICBAY2xpKClcbiAgIyBjbGlfY29tbWFuZHMgPVxuICAjICAgdXNlX3BzcGc6IFwizqkgY29tbWFuZDogdXNlLXBzcGcgzqlcIlxuICAjIGVjaG8gY2xpX2NvbW1hbmRzLnVzZV9wc3BnXG4gICMgZWNobyBcIs6panNkYmNsaV9fXzggaGVsb1wiXG4gICMgZWNobyBcIs6panNkYmNsaV9fXzkgbGluZSAyXCJcbiJdfQ==
