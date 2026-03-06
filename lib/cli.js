(function() {
  'use strict';
  var GUY, Jizura, MIXA, blue, debug, echo, gold, help, info, lime, red, reverse, rpr, urge, warn, whisper,
    indexOf = [].indexOf;

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
        },
        'rebuild': {
          alias: 'r',
          type: Boolean,
          description: "rebuild before command"
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
      --rebuild / -r -- rebuild DB before executing command

    command:

      query -- send an SQL query
        --table / -t output as formatted CLI table (CSV otherwise)
        --query / -q / positional argument -- the query (required)

      info -- show an overview of tables and views
        --rows / -n -- number of rows to show`));
          }
        },
        //-----------------------------------------------------------------------------------------------------
        'query': {
          description: "run an SQL query",
          flags: {
            'table': {
              alias: 't',
              type: Boolean,
              description: "tabular format",
              positional: false
            },
            'query': {
              alias: 'q',
              type: String,
              description: "SQL query",
              positional: true
            }
          },
          runner: (d) => {
            /* TAINT bug in MIXA hides meta flags */
            var output_query_as_csv, output_query_as_table, rebuild;
            rebuild = (indexOf.call(process.argv, '--rebuild') >= 0) || (indexOf.call(process.argv, '-r') >= 0);
            ({output_query_as_table, output_query_as_csv} = require('./demo'));
            if (d.verdict.parameters.table) {
              return output_query_as_table(d.verdict.parameters.query);
            } else {
              return output_query_as_csv(d.verdict.parameters.query);
            }
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
            /* TAINT bug in MIXA hides meta flags */
            var demo_show_all_tables, rebuild, rows;
            rebuild = (indexOf.call(process.argv, '--rebuild') >= 0) || (indexOf.call(process.argv, '-r') >= 0);
            ({demo_show_all_tables} = require('./demo'));
            ({rows} = d.verdict.parameters);
            demo_show_all_tables({rebuild, rows});
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7RUFBQTtBQUFBLE1BQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQTtJQUFBLG9CQUFBOzs7RUFJQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixDQUFBLENBQUUsS0FBRixFQUNFLElBREYsRUFFRSxPQUZGLEVBR0UsSUFIRixFQUlFLElBSkYsRUFLRSxJQUxGLENBQUEsR0FLNEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFSLENBQW9CLFNBQXBCLENBTDVCOztFQU1BLENBQUEsQ0FBRSxHQUFGLEVBQ0UsSUFERixDQUFBLEdBQzRCLEdBQUcsQ0FBQyxHQURoQyxFQVhBOzs7RUFjQSxDQUFBLENBQUUsT0FBRixFQUNFLElBREYsRUFFRSxJQUZGLEVBR0UsSUFIRixFQUlFLEdBSkYsQ0FBQSxHQUk0QixHQUFHLENBQUMsR0FKaEMsRUFkQTs7O0VBb0JBLElBQUEsR0FBNEIsT0FBQSxDQUFRLE1BQVI7O0VBQzVCLENBQUEsQ0FBRSxNQUFGLENBQUEsR0FBNEIsT0FBQSxDQUFRLFFBQVIsQ0FBNUIsRUFyQkE7Ozs7O0VBMkJBLElBQUMsQ0FBQSxHQUFELEdBQU8sUUFBQSxDQUFBLENBQUE7QUFDUCxRQUFBLE9BQUE7O0lBQ0UsT0FBQSxHQUNFO01BQUEsSUFBQSxFQUNFO1FBQUEsT0FBQSxFQUNFO1VBQUEsS0FBQSxFQUFjLEdBQWQ7VUFDQSxJQUFBLEVBQWMsT0FEZDtVQUVBLFdBQUEsRUFBYztRQUZkLENBREY7UUFJQSxTQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQWMsR0FBZDtVQUNBLElBQUEsRUFBYyxPQURkO1VBRUEsV0FBQSxFQUFjO1FBRmQ7TUFMRixDQURGO01BU0EsUUFBQSxFQUVFLENBQUE7O1FBQUEsTUFBQSxFQUNFO1VBQUEsTUFBQSxFQUFRLENBQUUsQ0FBRixDQUFBLEdBQUE7WUFDTixLQUFBLENBQU0sY0FBTixFQUFzQixPQUFPLENBQUMsSUFBOUI7WUFDQSxJQUFBLENBQUssSUFBQSxDQUFLLENBQUEsOENBQUEsQ0FBTCxDQUFMO21CQUNBLElBQUEsQ0FBSyxJQUFBLENBQUssQ0FBQTs7Ozs7Ozs7Ozs7Ozs7NkNBQUEsQ0FBTCxDQUFMO1VBSE07UUFBUixDQURGOztRQXNCQSxPQUFBLEVBQ0U7VUFBQSxXQUFBLEVBQWMsa0JBQWQ7VUFDQSxLQUFBLEVBQ0U7WUFBQSxPQUFBLEVBQ0U7Y0FBQSxLQUFBLEVBQWMsR0FBZDtjQUNBLElBQUEsRUFBYyxPQURkO2NBRUEsV0FBQSxFQUFjLGdCQUZkO2NBR0EsVUFBQSxFQUFjO1lBSGQsQ0FERjtZQUtBLE9BQUEsRUFDRTtjQUFBLEtBQUEsRUFBYyxHQUFkO2NBQ0EsSUFBQSxFQUFjLE1BRGQ7Y0FFQSxXQUFBLEVBQWMsV0FGZDtjQUdBLFVBQUEsRUFBYztZQUhkO1VBTkYsQ0FGRjtVQVlBLE1BQUEsRUFBUSxDQUFFLENBQUYsQ0FBQSxHQUFBLEVBQUE7O0FBQ2hCLGdCQUFBLG1CQUFBLEVBQUEscUJBQUEsRUFBQTtZQUNVLE9BQUEsR0FBNEIsY0FBaUIsT0FBTyxDQUFDLE1BQXZCLGlCQUFGLENBQUEsSUFBbUMsY0FBVSxPQUFPLENBQUMsTUFBaEIsVUFBRjtZQUMvRCxDQUFBLENBQUUscUJBQUYsRUFDRSxtQkFERixDQUFBLEdBQzRCLE9BQUEsQ0FBUSxRQUFSLENBRDVCO1lBRUEsSUFBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUF4QjtxQkFBb0MscUJBQUEsQ0FBc0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBM0MsRUFBcEM7YUFBQSxNQUFBO3FCQUNvQyxtQkFBQSxDQUFzQixDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUEzQyxFQURwQzs7VUFMTTtRQVpSLENBdkJGOztRQTJDQSxNQUFBLEVBQ0U7VUFBQSxXQUFBLEVBQWMsd0NBQWQ7VUFDQSxLQUFBLEVBQ0U7WUFBQSxNQUFBLEVBQ0U7Y0FBQSxLQUFBLEVBQWMsR0FBZDtjQUNBLElBQUEsRUFBYyxNQURkO2NBRUEsV0FBQSxFQUFjO1lBRmQ7VUFERixDQUZGO1VBTUEsTUFBQSxFQUFRLENBQUUsQ0FBRixDQUFBLEdBQUEsRUFBQTs7QUFDaEIsZ0JBQUEsb0JBQUEsRUFBQSxPQUFBLEVBQUE7WUFDVSxPQUFBLEdBQTRCLGNBQWlCLE9BQU8sQ0FBQyxNQUF2QixpQkFBRixDQUFBLElBQW1DLGNBQVUsT0FBTyxDQUFDLE1BQWhCLFVBQUY7WUFDL0QsQ0FBQSxDQUFFLG9CQUFGLENBQUEsR0FBNEIsT0FBQSxDQUFRLFFBQVIsQ0FBNUI7WUFDQSxDQUFBLENBQUUsSUFBRixDQUFBLEdBQTRCLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBdEM7WUFDQSxvQkFBQSxDQUFxQixDQUFFLE9BQUYsRUFBVyxJQUFYLENBQXJCO0FBQ0EsbUJBQU87VUFORDtRQU5SO01BNUNGO0lBWEYsRUFGSjs7SUF1RUUsSUFBSSxDQUFDLEdBQUwsQ0FBUyxPQUFULEVBQWtCLE9BQU8sQ0FBQyxJQUExQjtBQUNBLFdBQU87RUF6RUYsRUEzQlA7OztFQXlHQSxJQUFHLE1BQUEsS0FBVSxPQUFPLENBQUMsSUFBckI7SUFBa0MsQ0FBQSxDQUFBLENBQUEsR0FBQTthQUNoQyxJQUFDLENBQUEsR0FBRCxDQUFBO0lBRGdDLENBQUEsSUFBbEM7O0FBekdBIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0J1xuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuR1VZICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2d1eSdcbnsgZGVidWdcbiAgaW5mb1xuICB3aGlzcGVyXG4gIHdhcm5cbiAgdXJnZVxuICBoZWxwIH0gICAgICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ2p6ci9jbGknXG57IHJwclxuICBlY2hvIH0gICAgICAgICAgICAgICAgICA9IEdVWS50cm1cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyByZXZlcnNlLFxuICBsaW1lLFxuICBibHVlLFxuICBnb2xkLFxuICByZWQsICAgICAgICAgICAgICAgICAgfSA9IEdVWS50cm1cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuTUlYQSAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ21peGEnXG57IEppenVyYSwgICAgICAgICAgICAgICB9ID0gcmVxdWlyZSAnLi9tYWluJ1xuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AY2xpID0gLT5cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBqb2JkZWZzID1cbiAgICBtZXRhOlxuICAgICAgJ3BhZ2VyJzpcbiAgICAgICAgYWxpYXM6ICAgICAgICAncCdcbiAgICAgICAgdHlwZTogICAgICAgICBCb29sZWFuXG4gICAgICAgIGRlc2NyaXB0aW9uOiAgXCJ1c2UgcGFnZXJcIlxuICAgICAgJ3JlYnVpbGQnOlxuICAgICAgICBhbGlhczogICAgICAgICdyJ1xuICAgICAgICB0eXBlOiAgICAgICAgIEJvb2xlYW5cbiAgICAgICAgZGVzY3JpcHRpb246ICBcInJlYnVpbGQgYmVmb3JlIGNvbW1hbmRcIlxuICAgIGNvbW1hbmRzOlxuICAgICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAnaGVscCc6XG4gICAgICAgIHJ1bm5lcjogKCBkICkgPT5cbiAgICAgICAgICBkZWJ1ZyAnzqlqc2RiY2xpX19fMScsIHByb2Nlc3MuYXJndlxuICAgICAgICAgIGVjaG8gbGltZSBcIlwiXCJqenJkYjogcHJvZHVjZSBhbmQgc2hvdyBDSksgY29tcG9zaXRpb25hbCBkYXRhXCJcIlwiXG4gICAgICAgICAgZWNobyBibHVlIFwiXCJcIlxuICAgICAgICAgICAgVXNhZ2U6XG4gICAgICAgICAgICAgIGp6cmRiIFttZXRhXSAkY29tbWFuZCBbZmxhZ3NdIFthcmd1bWVudF1cblxuICAgICAgICAgICAgICAgIG1ldGE6XG4gICAgICAgICAgICAgICAgICAtLXBhZ2VyIC8gLXAgLS0gdXNlIHBzcGcgdG8gcGFnZSBvdXRwdXRcbiAgICAgICAgICAgICAgICAgIC0tcmVidWlsZCAvIC1yIC0tIHJlYnVpbGQgREIgYmVmb3JlIGV4ZWN1dGluZyBjb21tYW5kXG5cbiAgICAgICAgICAgICAgICBjb21tYW5kOlxuXG4gICAgICAgICAgICAgICAgICBxdWVyeSAtLSBzZW5kIGFuIFNRTCBxdWVyeVxuICAgICAgICAgICAgICAgICAgICAtLXRhYmxlIC8gLXQgb3V0cHV0IGFzIGZvcm1hdHRlZCBDTEkgdGFibGUgKENTViBvdGhlcndpc2UpXG4gICAgICAgICAgICAgICAgICAgIC0tcXVlcnkgLyAtcSAvIHBvc2l0aW9uYWwgYXJndW1lbnQgLS0gdGhlIHF1ZXJ5IChyZXF1aXJlZClcblxuICAgICAgICAgICAgICAgICAgaW5mbyAtLSBzaG93IGFuIG92ZXJ2aWV3IG9mIHRhYmxlcyBhbmQgdmlld3NcbiAgICAgICAgICAgICAgICAgICAgLS1yb3dzIC8gLW4gLS0gbnVtYmVyIG9mIHJvd3MgdG8gc2hvd1xuICAgICAgICAgICAgXCJcIlwiXG4gICAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICdxdWVyeSc6XG4gICAgICAgIGRlc2NyaXB0aW9uOiAgXCJydW4gYW4gU1FMIHF1ZXJ5XCJcbiAgICAgICAgZmxhZ3M6XG4gICAgICAgICAgJ3RhYmxlJzpcbiAgICAgICAgICAgIGFsaWFzOiAgICAgICAgJ3QnXG4gICAgICAgICAgICB0eXBlOiAgICAgICAgIEJvb2xlYW5cbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAgXCJ0YWJ1bGFyIGZvcm1hdFwiXG4gICAgICAgICAgICBwb3NpdGlvbmFsOiAgIGZhbHNlXG4gICAgICAgICAgJ3F1ZXJ5JzpcbiAgICAgICAgICAgIGFsaWFzOiAgICAgICAgJ3EnXG4gICAgICAgICAgICB0eXBlOiAgICAgICAgIFN0cmluZ1xuICAgICAgICAgICAgZGVzY3JpcHRpb246ICBcIlNRTCBxdWVyeVwiXG4gICAgICAgICAgICBwb3NpdGlvbmFsOiAgIHRydWVcbiAgICAgICAgcnVubmVyOiAoIGQgKSA9PlxuICAgICAgICAgICMjIyBUQUlOVCBidWcgaW4gTUlYQSBoaWRlcyBtZXRhIGZsYWdzICMjI1xuICAgICAgICAgIHJlYnVpbGQgICAgICAgICAgICAgICAgICAgPSAoICctLXJlYnVpbGQnIGluIHByb2Nlc3MuYXJndiApIG9yICggJy1yJyBpbiBwcm9jZXNzLmFyZ3YgKVxuICAgICAgICAgIHsgb3V0cHV0X3F1ZXJ5X2FzX3RhYmxlLFxuICAgICAgICAgICAgb3V0cHV0X3F1ZXJ5X2FzX2NzdiwgIH0gPSByZXF1aXJlICcuL2RlbW8nXG4gICAgICAgICAgaWYgZC52ZXJkaWN0LnBhcmFtZXRlcnMudGFibGUgdGhlbiAgb3V0cHV0X3F1ZXJ5X2FzX3RhYmxlIGQudmVyZGljdC5wYXJhbWV0ZXJzLnF1ZXJ5XG4gICAgICAgICAgZWxzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0X3F1ZXJ5X2FzX2NzdiAgIGQudmVyZGljdC5wYXJhbWV0ZXJzLnF1ZXJ5XG4gICAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICdpbmZvJzpcbiAgICAgICAgZGVzY3JpcHRpb246ICBcInNob3cgaW5mbyBvbiBjb25maWd1cmF0aW9uIHNldHRpbmdzICZjXCJcbiAgICAgICAgZmxhZ3M6XG4gICAgICAgICAgJ3Jvd3MnOlxuICAgICAgICAgICAgYWxpYXM6ICAgICAgICAnbidcbiAgICAgICAgICAgIHR5cGU6ICAgICAgICAgTnVtYmVyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogIFwibnVtYmVyIG9mIHJvd3NcIlxuICAgICAgICBydW5uZXI6ICggZCApID0+XG4gICAgICAgICAgIyMjIFRBSU5UIGJ1ZyBpbiBNSVhBIGhpZGVzIG1ldGEgZmxhZ3MgIyMjXG4gICAgICAgICAgcmVidWlsZCAgICAgICAgICAgICAgICAgICA9ICggJy0tcmVidWlsZCcgaW4gcHJvY2Vzcy5hcmd2ICkgb3IgKCAnLXInIGluIHByb2Nlc3MuYXJndiApXG4gICAgICAgICAgeyBkZW1vX3Nob3dfYWxsX3RhYmxlcywgfSA9IHJlcXVpcmUgJy4vZGVtbydcbiAgICAgICAgICB7IHJvd3MsICAgICAgICAgICAgICAgICB9ID0gZC52ZXJkaWN0LnBhcmFtZXRlcnNcbiAgICAgICAgICBkZW1vX3Nob3dfYWxsX3RhYmxlcyB7IHJlYnVpbGQsIHJvd3MsIH1cbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIE1JWEEucnVuIGpvYmRlZnMsIHByb2Nlc3MuYXJndlxuICByZXR1cm4gbnVsbFxuXG5cblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5pZiBtb2R1bGUgaXMgcmVxdWlyZS5tYWluIHRoZW4gZG8gPT5cbiAgQGNsaSgpXG4iXX0=
