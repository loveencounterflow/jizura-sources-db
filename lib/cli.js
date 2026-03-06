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
            /* TAINT bug in MIXA hides meta flags */
            var output_query_as_csv, rebuild;
            rebuild = (indexOf.call(process.argv, '--rebuild') >= 0) || (indexOf.call(process.argv, '-r') >= 0);
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7RUFBQTtBQUFBLE1BQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQTtJQUFBLG9CQUFBOzs7RUFJQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixDQUFBLENBQUUsS0FBRixFQUNFLElBREYsRUFFRSxPQUZGLEVBR0UsSUFIRixFQUlFLElBSkYsRUFLRSxJQUxGLENBQUEsR0FLNEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFSLENBQW9CLFNBQXBCLENBTDVCOztFQU1BLENBQUEsQ0FBRSxHQUFGLEVBQ0UsSUFERixDQUFBLEdBQzRCLEdBQUcsQ0FBQyxHQURoQyxFQVhBOzs7RUFjQSxDQUFBLENBQUUsT0FBRixFQUNFLElBREYsRUFFRSxJQUZGLEVBR0UsSUFIRixFQUlFLEdBSkYsQ0FBQSxHQUk0QixHQUFHLENBQUMsR0FKaEMsRUFkQTs7O0VBb0JBLElBQUEsR0FBNEIsT0FBQSxDQUFRLE1BQVI7O0VBQzVCLENBQUEsQ0FBRSxNQUFGLENBQUEsR0FBNEIsT0FBQSxDQUFRLFFBQVIsQ0FBNUIsRUFyQkE7Ozs7O0VBMkJBLElBQUMsQ0FBQSxHQUFELEdBQU8sUUFBQSxDQUFBLENBQUE7QUFDUCxRQUFBLE9BQUE7O0lBQ0UsT0FBQSxHQUNFO01BQUEsSUFBQSxFQUNFO1FBQUEsT0FBQSxFQUNFO1VBQUEsS0FBQSxFQUFjLEdBQWQ7VUFDQSxJQUFBLEVBQWMsT0FEZDtVQUVBLFdBQUEsRUFBYztRQUZkLENBREY7UUFJQSxTQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQWMsR0FBZDtVQUNBLElBQUEsRUFBYyxPQURkO1VBRUEsV0FBQSxFQUFjO1FBRmQ7TUFMRixDQURGO01BU0EsUUFBQSxFQUVFLENBQUE7O1FBQUEsTUFBQSxFQUNFO1VBQUEsTUFBQSxFQUFRLENBQUUsQ0FBRixDQUFBLEdBQUE7WUFDTixLQUFBLENBQU0sY0FBTixFQUFzQixPQUFPLENBQUMsSUFBOUI7WUFDQSxJQUFBLENBQUssSUFBQSxDQUFLLENBQUEsOENBQUEsQ0FBTCxDQUFMO21CQUNBLElBQUEsQ0FBSyxJQUFBLENBQUssQ0FBQTs7Ozs7Ozs7Ozs7Ozs2Q0FBQSxDQUFMLENBQUw7VUFITTtRQUFSLENBREY7O1FBcUJBLE9BQUEsRUFDRTtVQUFBLFdBQUEsRUFBYyxrQkFBZDtVQUNBLEtBQUEsRUFDRTtZQUFBLE9BQUEsRUFDRTtjQUFBLEtBQUEsRUFBYyxHQUFkO2NBQ0EsSUFBQSxFQUFjLE1BRGQ7Y0FFQSxXQUFBLEVBQWMsV0FGZDtjQUdBLFVBQUEsRUFBYztZQUhkO1VBREYsQ0FGRjtVQU9BLE1BQUEsRUFBUSxDQUFFLENBQUYsQ0FBQSxHQUFBLEVBQUE7O0FBQ2hCLGdCQUFBLG1CQUFBLEVBQUE7WUFDVSxPQUFBLEdBQTRCLGNBQWlCLE9BQU8sQ0FBQyxNQUF2QixpQkFBRixDQUFBLElBQW1DLGNBQVUsT0FBTyxDQUFDLE1BQWhCLFVBQUY7WUFDL0QsQ0FBQSxDQUFFLG1CQUFGLENBQUEsR0FBNEIsT0FBQSxDQUFRLFFBQVIsQ0FBNUI7bUJBQ0EsbUJBQUEsQ0FBb0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBekM7VUFKTTtRQVBSLENBdEJGOztRQW1DQSxNQUFBLEVBQ0U7VUFBQSxXQUFBLEVBQWMsd0NBQWQ7VUFDQSxLQUFBLEVBQ0U7WUFBQSxNQUFBLEVBQ0U7Y0FBQSxLQUFBLEVBQWMsR0FBZDtjQUNBLElBQUEsRUFBYyxNQURkO2NBRUEsV0FBQSxFQUFjO1lBRmQ7VUFERixDQUZGO1VBTUEsTUFBQSxFQUFRLENBQUUsQ0FBRixDQUFBLEdBQUEsRUFBQTs7QUFDaEIsZ0JBQUEsb0JBQUEsRUFBQSxPQUFBLEVBQUE7WUFDVSxPQUFBLEdBQTRCLGNBQWlCLE9BQU8sQ0FBQyxNQUF2QixpQkFBRixDQUFBLElBQW1DLGNBQVUsT0FBTyxDQUFDLE1BQWhCLFVBQUY7WUFDL0QsQ0FBQSxDQUFFLG9CQUFGLENBQUEsR0FBNEIsT0FBQSxDQUFRLFFBQVIsQ0FBNUI7WUFDQSxDQUFBLENBQUUsSUFBRixDQUFBLEdBQTRCLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBdEM7WUFDQSxvQkFBQSxDQUFxQixDQUFFLE9BQUYsRUFBVyxJQUFYLENBQXJCO0FBQ0EsbUJBQU87VUFORDtRQU5SO01BcENGO0lBWEYsRUFGSjs7SUErREUsSUFBSSxDQUFDLEdBQUwsQ0FBUyxPQUFULEVBQWtCLE9BQU8sQ0FBQyxJQUExQjtBQUNBLFdBQU87RUFqRUYsRUEzQlA7OztFQWlHQSxJQUFHLE1BQUEsS0FBVSxPQUFPLENBQUMsSUFBckI7SUFBa0MsQ0FBQSxDQUFBLENBQUEsR0FBQTthQUNoQyxJQUFDLENBQUEsR0FBRCxDQUFBO0lBRGdDLENBQUEsSUFBbEM7O0FBakdBIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbid1c2Ugc3RyaWN0J1xuXG5cbiMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjI1xuR1VZICAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ2d1eSdcbnsgZGVidWdcbiAgaW5mb1xuICB3aGlzcGVyXG4gIHdhcm5cbiAgdXJnZVxuICBoZWxwIH0gICAgICAgICAgICAgICAgICA9IEdVWS50cm0uZ2V0X2xvZ2dlcnMgJ2p6ci9jbGknXG57IHJwclxuICBlY2hvIH0gICAgICAgICAgICAgICAgICA9IEdVWS50cm1cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxueyByZXZlcnNlLFxuICBsaW1lLFxuICBibHVlLFxuICBnb2xkLFxuICByZWQsICAgICAgICAgICAgICAgICAgfSA9IEdVWS50cm1cbiMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuTUlYQSAgICAgICAgICAgICAgICAgICAgICA9IHJlcXVpcmUgJ21peGEnXG57IEppenVyYSwgICAgICAgICAgICAgICB9ID0gcmVxdWlyZSAnLi9tYWluJ1xuXG5cbiM9PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuI1xuIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5AY2xpID0gLT5cbiAgIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLlxuICBqb2JkZWZzID1cbiAgICBtZXRhOlxuICAgICAgJ3BhZ2VyJzpcbiAgICAgICAgYWxpYXM6ICAgICAgICAncCdcbiAgICAgICAgdHlwZTogICAgICAgICBCb29sZWFuXG4gICAgICAgIGRlc2NyaXB0aW9uOiAgXCJ1c2UgcGFnZXJcIlxuICAgICAgJ3JlYnVpbGQnOlxuICAgICAgICBhbGlhczogICAgICAgICdyJ1xuICAgICAgICB0eXBlOiAgICAgICAgIEJvb2xlYW5cbiAgICAgICAgZGVzY3JpcHRpb246ICBcInJlYnVpbGQgYmVmb3JlIGNvbW1hbmRcIlxuICAgIGNvbW1hbmRzOlxuICAgICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAnaGVscCc6XG4gICAgICAgIHJ1bm5lcjogKCBkICkgPT5cbiAgICAgICAgICBkZWJ1ZyAnzqlqc2RiY2xpX19fMScsIHByb2Nlc3MuYXJndlxuICAgICAgICAgIGVjaG8gbGltZSBcIlwiXCJqenJkYjogcHJvZHVjZSBhbmQgc2hvdyBDSksgY29tcG9zaXRpb25hbCBkYXRhXCJcIlwiXG4gICAgICAgICAgZWNobyBibHVlIFwiXCJcIlxuICAgICAgICAgICAgVXNhZ2U6XG4gICAgICAgICAgICAgIGp6cmRiIFttZXRhXSAkY29tbWFuZCBbZmxhZ3NdIFthcmd1bWVudF1cblxuICAgICAgICAgICAgICAgIG1ldGE6XG4gICAgICAgICAgICAgICAgICAtLXBhZ2VyIC8gLXAgLS0gdXNlIHBzcGcgdG8gcGFnZSBvdXRwdXRcbiAgICAgICAgICAgICAgICAgIC0tcmVidWlsZCAvIC1yIC0tIHJlYnVpbGQgREIgYmVmb3JlIGV4ZWN1dGluZyBjb21tYW5kXG5cbiAgICAgICAgICAgICAgICBjb21tYW5kOlxuXG4gICAgICAgICAgICAgICAgICBxdWVyeSAtLSBzZW5kIGFuIFNRTCBxdWVyeVxuICAgICAgICAgICAgICAgICAgICAtLXF1ZXJ5IC8gLXEgLyBwb3NpdGlvbmFsIGFyZ3VtZW50IC0tIHRoZSBxdWVyeSAocmVxdWlyZWQpXG5cbiAgICAgICAgICAgICAgICAgIGluZm8gLS0gc2hvdyBhbiBvdmVydmlldyBvZiB0YWJsZXMgYW5kIHZpZXdzXG4gICAgICAgICAgICAgICAgICAgIC0tcm93cyAvIC1uIC0tIG51bWJlciBvZiByb3dzIHRvIHNob3dcbiAgICAgICAgICAgIFwiXCJcIlxuICAgICAgIy0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgICAncXVlcnknOlxuICAgICAgICBkZXNjcmlwdGlvbjogIFwicnVuIGFuIFNRTCBxdWVyeVwiXG4gICAgICAgIGZsYWdzOlxuICAgICAgICAgICdxdWVyeSc6XG4gICAgICAgICAgICBhbGlhczogICAgICAgICdxJ1xuICAgICAgICAgICAgdHlwZTogICAgICAgICBTdHJpbmdcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAgXCJTUUwgcXVlcnlcIlxuICAgICAgICAgICAgcG9zaXRpb25hbDogICB0cnVlXG4gICAgICAgIHJ1bm5lcjogKCBkICkgPT5cbiAgICAgICAgICAjIyMgVEFJTlQgYnVnIGluIE1JWEEgaGlkZXMgbWV0YSBmbGFncyAjIyNcbiAgICAgICAgICByZWJ1aWxkICAgICAgICAgICAgICAgICAgID0gKCAnLS1yZWJ1aWxkJyBpbiBwcm9jZXNzLmFyZ3YgKSBvciAoICctcicgaW4gcHJvY2Vzcy5hcmd2IClcbiAgICAgICAgICB7IG91dHB1dF9xdWVyeV9hc19jc3YsICB9ID0gcmVxdWlyZSAnLi9kZW1vJ1xuICAgICAgICAgIG91dHB1dF9xdWVyeV9hc19jc3YgZC52ZXJkaWN0LnBhcmFtZXRlcnMucXVlcnlcbiAgICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgJ2luZm8nOlxuICAgICAgICBkZXNjcmlwdGlvbjogIFwic2hvdyBpbmZvIG9uIGNvbmZpZ3VyYXRpb24gc2V0dGluZ3MgJmNcIlxuICAgICAgICBmbGFnczpcbiAgICAgICAgICAncm93cyc6XG4gICAgICAgICAgICBhbGlhczogICAgICAgICduJ1xuICAgICAgICAgICAgdHlwZTogICAgICAgICBOdW1iZXJcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAgXCJudW1iZXIgb2Ygcm93c1wiXG4gICAgICAgIHJ1bm5lcjogKCBkICkgPT5cbiAgICAgICAgICAjIyMgVEFJTlQgYnVnIGluIE1JWEEgaGlkZXMgbWV0YSBmbGFncyAjIyNcbiAgICAgICAgICByZWJ1aWxkICAgICAgICAgICAgICAgICAgID0gKCAnLS1yZWJ1aWxkJyBpbiBwcm9jZXNzLmFyZ3YgKSBvciAoICctcicgaW4gcHJvY2Vzcy5hcmd2IClcbiAgICAgICAgICB7IGRlbW9fc2hvd19hbGxfdGFibGVzLCB9ID0gcmVxdWlyZSAnLi9kZW1vJ1xuICAgICAgICAgIHsgcm93cywgICAgICAgICAgICAgICAgIH0gPSBkLnZlcmRpY3QucGFyYW1ldGVyc1xuICAgICAgICAgIGRlbW9fc2hvd19hbGxfdGFibGVzIHsgcmVidWlsZCwgcm93cywgfVxuICAgICAgICAgIHJldHVybiBudWxsXG4gICMuLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi5cbiAgTUlYQS5ydW4gam9iZGVmcywgcHJvY2Vzcy5hcmd2XG4gIHJldHVybiBudWxsXG5cblxuXG4jIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyNcbmlmIG1vZHVsZSBpcyByZXF1aXJlLm1haW4gdGhlbiBkbyA9PlxuICBAY2xpKClcbiJdfQ==
