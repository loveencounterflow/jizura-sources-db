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
              return output_query_as_table(d.verdict.parameters.query, {rebuild});
            } else {
              return output_query_as_csv(d.verdict.parameters.query, {rebuild});
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBRUE7RUFBQTtBQUFBLE1BQUEsR0FBQSxFQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEtBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLEdBQUEsRUFBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsT0FBQTtJQUFBLG9CQUFBOzs7RUFJQSxHQUFBLEdBQTRCLE9BQUEsQ0FBUSxLQUFSOztFQUM1QixDQUFBLENBQUUsS0FBRixFQUNFLElBREYsRUFFRSxPQUZGLEVBR0UsSUFIRixFQUlFLElBSkYsRUFLRSxJQUxGLENBQUEsR0FLNEIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxXQUFSLENBQW9CLFNBQXBCLENBTDVCOztFQU1BLENBQUEsQ0FBRSxHQUFGLEVBQ0UsSUFERixDQUFBLEdBQzRCLEdBQUcsQ0FBQyxHQURoQyxFQVhBOzs7RUFjQSxDQUFBLENBQUUsT0FBRixFQUNFLElBREYsRUFFRSxJQUZGLEVBR0UsSUFIRixFQUlFLEdBSkYsQ0FBQSxHQUk0QixHQUFHLENBQUMsR0FKaEMsRUFkQTs7O0VBb0JBLElBQUEsR0FBNEIsT0FBQSxDQUFRLE1BQVI7O0VBQzVCLENBQUEsQ0FBRSxNQUFGLENBQUEsR0FBNEIsT0FBQSxDQUFRLFFBQVIsQ0FBNUIsRUFyQkE7Ozs7O0VBMkJBLElBQUMsQ0FBQSxHQUFELEdBQU8sUUFBQSxDQUFBLENBQUE7QUFDUCxRQUFBLE9BQUE7O0lBQ0UsT0FBQSxHQUNFO01BQUEsSUFBQSxFQUNFO1FBQUEsT0FBQSxFQUNFO1VBQUEsS0FBQSxFQUFjLEdBQWQ7VUFDQSxJQUFBLEVBQWMsT0FEZDtVQUVBLFdBQUEsRUFBYztRQUZkLENBREY7UUFJQSxTQUFBLEVBQ0U7VUFBQSxLQUFBLEVBQWMsR0FBZDtVQUNBLElBQUEsRUFBYyxPQURkO1VBRUEsV0FBQSxFQUFjO1FBRmQ7TUFMRixDQURGO01BU0EsUUFBQSxFQUVFLENBQUE7O1FBQUEsTUFBQSxFQUNFO1VBQUEsTUFBQSxFQUFRLENBQUUsQ0FBRixDQUFBLEdBQUE7WUFDTixLQUFBLENBQU0sY0FBTixFQUFzQixPQUFPLENBQUMsSUFBOUI7WUFDQSxJQUFBLENBQUssSUFBQSxDQUFLLENBQUEsOENBQUEsQ0FBTCxDQUFMO21CQUNBLElBQUEsQ0FBSyxJQUFBLENBQUssQ0FBQTs7Ozs7Ozs7Ozs7Ozs7NkNBQUEsQ0FBTCxDQUFMO1VBSE07UUFBUixDQURGOztRQXNCQSxPQUFBLEVBQ0U7VUFBQSxXQUFBLEVBQWMsa0JBQWQ7VUFDQSxLQUFBLEVBQ0U7WUFBQSxPQUFBLEVBQ0U7Y0FBQSxLQUFBLEVBQWMsR0FBZDtjQUNBLElBQUEsRUFBYyxPQURkO2NBRUEsV0FBQSxFQUFjLGdCQUZkO2NBR0EsVUFBQSxFQUFjO1lBSGQsQ0FERjtZQUtBLE9BQUEsRUFDRTtjQUFBLEtBQUEsRUFBYyxHQUFkO2NBQ0EsSUFBQSxFQUFjLE1BRGQ7Y0FFQSxXQUFBLEVBQWMsV0FGZDtjQUdBLFVBQUEsRUFBYztZQUhkO1VBTkYsQ0FGRjtVQVlBLE1BQUEsRUFBUSxDQUFFLENBQUYsQ0FBQSxHQUFBLEVBQUE7O0FBQ2hCLGdCQUFBLG1CQUFBLEVBQUEscUJBQUEsRUFBQTtZQUNVLE9BQUEsR0FBNEIsY0FBaUIsT0FBTyxDQUFDLE1BQXZCLGlCQUFGLENBQUEsSUFBbUMsY0FBVSxPQUFPLENBQUMsTUFBaEIsVUFBRjtZQUMvRCxDQUFBLENBQUUscUJBQUYsRUFDRSxtQkFERixDQUFBLEdBQzRCLE9BQUEsQ0FBUSxRQUFSLENBRDVCO1lBRUEsSUFBRyxDQUFDLENBQUMsT0FBTyxDQUFDLFVBQVUsQ0FBQyxLQUF4QjtxQkFBb0MscUJBQUEsQ0FBc0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBM0MsRUFBa0QsQ0FBRSxPQUFGLENBQWxELEVBQXBDO2FBQUEsTUFBQTtxQkFDb0MsbUJBQUEsQ0FBc0IsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsS0FBM0MsRUFBa0QsQ0FBRSxPQUFGLENBQWxELEVBRHBDOztVQUxNO1FBWlIsQ0F2QkY7O1FBMkNBLE1BQUEsRUFDRTtVQUFBLFdBQUEsRUFBYyx3Q0FBZDtVQUNBLEtBQUEsRUFDRTtZQUFBLE1BQUEsRUFDRTtjQUFBLEtBQUEsRUFBYyxHQUFkO2NBQ0EsSUFBQSxFQUFjLE1BRGQ7Y0FFQSxXQUFBLEVBQWM7WUFGZDtVQURGLENBRkY7VUFNQSxNQUFBLEVBQVEsQ0FBRSxDQUFGLENBQUEsR0FBQSxFQUFBOztBQUNoQixnQkFBQSxvQkFBQSxFQUFBLE9BQUEsRUFBQTtZQUNVLE9BQUEsR0FBNEIsY0FBaUIsT0FBTyxDQUFDLE1BQXZCLGlCQUFGLENBQUEsSUFBbUMsY0FBVSxPQUFPLENBQUMsTUFBaEIsVUFBRjtZQUMvRCxDQUFBLENBQUUsb0JBQUYsQ0FBQSxHQUE0QixPQUFBLENBQVEsUUFBUixDQUE1QjtZQUNBLENBQUEsQ0FBRSxJQUFGLENBQUEsR0FBNEIsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxVQUF0QztZQUNBLG9CQUFBLENBQXFCLENBQUUsT0FBRixFQUFXLElBQVgsQ0FBckI7QUFDQSxtQkFBTztVQU5EO1FBTlI7TUE1Q0Y7SUFYRixFQUZKOztJQXVFRSxJQUFJLENBQUMsR0FBTCxDQUFTLE9BQVQsRUFBa0IsT0FBTyxDQUFDLElBQTFCO0FBQ0EsV0FBTztFQXpFRixFQTNCUDs7O0VBeUdBLElBQUcsTUFBQSxLQUFVLE9BQU8sQ0FBQyxJQUFyQjtJQUFrQyxDQUFBLENBQUEsQ0FBQSxHQUFBO2FBQ2hDLElBQUMsQ0FBQSxHQUFELENBQUE7SUFEZ0MsQ0FBQSxJQUFsQzs7QUF6R0EiLCJzb3VyY2VzQ29udGVudCI6WyJcblxuJ3VzZSBzdHJpY3QnXG5cblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5HVVkgICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnZ3V5J1xueyBkZWJ1Z1xuICBpbmZvXG4gIHdoaXNwZXJcbiAgd2FyblxuICB1cmdlXG4gIGhlbHAgfSAgICAgICAgICAgICAgICAgID0gR1VZLnRybS5nZXRfbG9nZ2VycyAnanpyL2NsaSdcbnsgcnByXG4gIGVjaG8gfSAgICAgICAgICAgICAgICAgID0gR1VZLnRybVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG57IHJldmVyc2UsXG4gIGxpbWUsXG4gIGJsdWUsXG4gIGdvbGQsXG4gIHJlZCwgICAgICAgICAgICAgICAgICB9ID0gR1VZLnRybVxuIy4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG5NSVhBICAgICAgICAgICAgICAgICAgICAgID0gcmVxdWlyZSAnbWl4YSdcbnsgSml6dXJhLCAgICAgICAgICAgICAgIH0gPSByZXF1aXJlICcuL21haW4nXG5cblxuIz09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG4jXG4jLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbkBjbGkgPSAtPlxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIGpvYmRlZnMgPVxuICAgIG1ldGE6XG4gICAgICAncGFnZXInOlxuICAgICAgICBhbGlhczogICAgICAgICdwJ1xuICAgICAgICB0eXBlOiAgICAgICAgIEJvb2xlYW5cbiAgICAgICAgZGVzY3JpcHRpb246ICBcInVzZSBwYWdlclwiXG4gICAgICAncmVidWlsZCc6XG4gICAgICAgIGFsaWFzOiAgICAgICAgJ3InXG4gICAgICAgIHR5cGU6ICAgICAgICAgQm9vbGVhblxuICAgICAgICBkZXNjcmlwdGlvbjogIFwicmVidWlsZCBiZWZvcmUgY29tbWFuZFwiXG4gICAgY29tbWFuZHM6XG4gICAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICdoZWxwJzpcbiAgICAgICAgcnVubmVyOiAoIGQgKSA9PlxuICAgICAgICAgIGRlYnVnICfOqWpzZGJjbGlfX18xJywgcHJvY2Vzcy5hcmd2XG4gICAgICAgICAgZWNobyBsaW1lIFwiXCJcImp6cmRiOiBwcm9kdWNlIGFuZCBzaG93IENKSyBjb21wb3NpdGlvbmFsIGRhdGFcIlwiXCJcbiAgICAgICAgICBlY2hvIGJsdWUgXCJcIlwiXG4gICAgICAgICAgICBVc2FnZTpcbiAgICAgICAgICAgICAganpyZGIgW21ldGFdICRjb21tYW5kIFtmbGFnc10gW2FyZ3VtZW50XVxuXG4gICAgICAgICAgICAgICAgbWV0YTpcbiAgICAgICAgICAgICAgICAgIC0tcGFnZXIgLyAtcCAtLSB1c2UgcHNwZyB0byBwYWdlIG91dHB1dFxuICAgICAgICAgICAgICAgICAgLS1yZWJ1aWxkIC8gLXIgLS0gcmVidWlsZCBEQiBiZWZvcmUgZXhlY3V0aW5nIGNvbW1hbmRcblxuICAgICAgICAgICAgICAgIGNvbW1hbmQ6XG5cbiAgICAgICAgICAgICAgICAgIHF1ZXJ5IC0tIHNlbmQgYW4gU1FMIHF1ZXJ5XG4gICAgICAgICAgICAgICAgICAgIC0tdGFibGUgLyAtdCBvdXRwdXQgYXMgZm9ybWF0dGVkIENMSSB0YWJsZSAoQ1NWIG90aGVyd2lzZSlcbiAgICAgICAgICAgICAgICAgICAgLS1xdWVyeSAvIC1xIC8gcG9zaXRpb25hbCBhcmd1bWVudCAtLSB0aGUgcXVlcnkgKHJlcXVpcmVkKVxuXG4gICAgICAgICAgICAgICAgICBpbmZvIC0tIHNob3cgYW4gb3ZlcnZpZXcgb2YgdGFibGVzIGFuZCB2aWV3c1xuICAgICAgICAgICAgICAgICAgICAtLXJvd3MgLyAtbiAtLSBudW1iZXIgb2Ygcm93cyB0byBzaG93XG4gICAgICAgICAgICBcIlwiXCJcbiAgICAgICMtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgICAgJ3F1ZXJ5JzpcbiAgICAgICAgZGVzY3JpcHRpb246ICBcInJ1biBhbiBTUUwgcXVlcnlcIlxuICAgICAgICBmbGFnczpcbiAgICAgICAgICAndGFibGUnOlxuICAgICAgICAgICAgYWxpYXM6ICAgICAgICAndCdcbiAgICAgICAgICAgIHR5cGU6ICAgICAgICAgQm9vbGVhblxuICAgICAgICAgICAgZGVzY3JpcHRpb246ICBcInRhYnVsYXIgZm9ybWF0XCJcbiAgICAgICAgICAgIHBvc2l0aW9uYWw6ICAgZmFsc2VcbiAgICAgICAgICAncXVlcnknOlxuICAgICAgICAgICAgYWxpYXM6ICAgICAgICAncSdcbiAgICAgICAgICAgIHR5cGU6ICAgICAgICAgU3RyaW5nXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogIFwiU1FMIHF1ZXJ5XCJcbiAgICAgICAgICAgIHBvc2l0aW9uYWw6ICAgdHJ1ZVxuICAgICAgICBydW5uZXI6ICggZCApID0+XG4gICAgICAgICAgIyMjIFRBSU5UIGJ1ZyBpbiBNSVhBIGhpZGVzIG1ldGEgZmxhZ3MgIyMjXG4gICAgICAgICAgcmVidWlsZCAgICAgICAgICAgICAgICAgICA9ICggJy0tcmVidWlsZCcgaW4gcHJvY2Vzcy5hcmd2ICkgb3IgKCAnLXInIGluIHByb2Nlc3MuYXJndiApXG4gICAgICAgICAgeyBvdXRwdXRfcXVlcnlfYXNfdGFibGUsXG4gICAgICAgICAgICBvdXRwdXRfcXVlcnlfYXNfY3N2LCAgfSA9IHJlcXVpcmUgJy4vZGVtbydcbiAgICAgICAgICBpZiBkLnZlcmRpY3QucGFyYW1ldGVycy50YWJsZSB0aGVuICBvdXRwdXRfcXVlcnlfYXNfdGFibGUgZC52ZXJkaWN0LnBhcmFtZXRlcnMucXVlcnksIHsgcmVidWlsZCwgfVxuICAgICAgICAgIGVsc2UgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dF9xdWVyeV9hc19jc3YgICBkLnZlcmRpY3QucGFyYW1ldGVycy5xdWVyeSwgeyByZWJ1aWxkLCB9XG4gICAgICAjLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgICAgICdpbmZvJzpcbiAgICAgICAgZGVzY3JpcHRpb246ICBcInNob3cgaW5mbyBvbiBjb25maWd1cmF0aW9uIHNldHRpbmdzICZjXCJcbiAgICAgICAgZmxhZ3M6XG4gICAgICAgICAgJ3Jvd3MnOlxuICAgICAgICAgICAgYWxpYXM6ICAgICAgICAnbidcbiAgICAgICAgICAgIHR5cGU6ICAgICAgICAgTnVtYmVyXG4gICAgICAgICAgICBkZXNjcmlwdGlvbjogIFwibnVtYmVyIG9mIHJvd3NcIlxuICAgICAgICBydW5uZXI6ICggZCApID0+XG4gICAgICAgICAgIyMjIFRBSU5UIGJ1ZyBpbiBNSVhBIGhpZGVzIG1ldGEgZmxhZ3MgIyMjXG4gICAgICAgICAgcmVidWlsZCAgICAgICAgICAgICAgICAgICA9ICggJy0tcmVidWlsZCcgaW4gcHJvY2Vzcy5hcmd2ICkgb3IgKCAnLXInIGluIHByb2Nlc3MuYXJndiApXG4gICAgICAgICAgeyBkZW1vX3Nob3dfYWxsX3RhYmxlcywgfSA9IHJlcXVpcmUgJy4vZGVtbydcbiAgICAgICAgICB7IHJvd3MsICAgICAgICAgICAgICAgICB9ID0gZC52ZXJkaWN0LnBhcmFtZXRlcnNcbiAgICAgICAgICBkZW1vX3Nob3dfYWxsX3RhYmxlcyB7IHJlYnVpbGQsIHJvd3MsIH1cbiAgICAgICAgICByZXR1cm4gbnVsbFxuICAjLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uLi4uXG4gIE1JWEEucnVuIGpvYmRlZnMsIHByb2Nlc3MuYXJndlxuICByZXR1cm4gbnVsbFxuXG5cblxuIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjXG5pZiBtb2R1bGUgaXMgcmVxdWlyZS5tYWluIHRoZW4gZG8gPT5cbiAgQGNsaSgpXG4iXX0=
