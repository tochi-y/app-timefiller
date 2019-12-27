function(request) {
    try {
        var results = updateDemoData();
        var resBody = {
            'count': results.length,
            'data': results
        };
        return personium.createResponse(200, resBody);
    } catch(e) {
        return personium.createErrorResponse(e);
    }
};

function updateDemoData() {
    var eventsTable = getTable('Events');
    var events = eventsTable.query().run().d.results;
    _.each(events, function(event) {
        event.startDate = toCurrentDate(event.startDate);
        event.endDate = toCurrentDate(event.endDate);
        delete event.__metadata;
        delete event.__updated;
        delete event.__published;
        eventsTable.merge(event.__id, event, "*");
    });
    return eventsTable.query().run().d.results;
}

var getTable = function (tableName) {
    return _p.as('serviceSubject').cell().box().odata('OData').entitySet(tableName);
};

function toCurrentDate(dateStr) {
    var results = /\/Date\(([0-9]+)\)\//.exec(dateStr);
    if (results.length <= 1) {
        return dateStr;
    }
    var m = moment(Number(results[1]));
    var today = moment();
    m.date(today.date());
    m.month(today.month());
    m.year(today.year());
    return '/Date(' + m.valueOf() + ')/';
}

/*
 * In order to use helpful functions, you need to "require" the library.
 */
var _ = require("underscore")._;
var personium = require("personium").personium;
var moment = require("moment").moment;
moment = require("moment_timezone_with_data").mtz;
