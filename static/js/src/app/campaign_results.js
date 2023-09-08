var campaigns = [], statuses = {
    'Email Sent': {
        color: '#1abc9c',
        label: 'label-success',
        icon: 'fa-envelope',
        point: 'ct-point-sent'
    },
    'Emails Sent': {
        color: '#1abc9c',
        label: 'label-success',
        icon: 'fa-envelope',
        point: 'ct-point-sent'
    },
    'In progress': { label: 'label-primary' },
    Queued: { label: 'label-info' },
    Completed: { label: 'label-success' },
    'Email Opened': {
        color: '#f9bf3b',
        label: 'label-warning',
        icon: 'fa-envelope',
        point: 'ct-point-opened'
    },
    'Email Reported': {
        color: '#45d6ef',
        label: 'label-warning',
        icon: 'fa-bullhorne',
        point: 'ct-point-reported'
    },
    'Clicked Link': {
        color: '#F39C12',
        label: 'label-clicked',
        icon: 'fa-mouse-pointer',
        point: 'ct-point-clicked'
    },
    Success: {
        color: '#f05b4f',
        label: 'label-danger',
        icon: 'fa-exclamation',
        point: 'ct-point-clicked'
    },
    Error: {
        color: '#6c7a89',
        label: 'label-default',
        icon: 'fa-times',
        point: 'ct-point-error'
    },
    'Error Sending Email': {
        color: '#6c7a89',
        label: 'label-default',
        icon: 'fa-times',
        point: 'ct-point-error'
    },
    'Activity Detected': {
        color: '#cc459d',
        label: 'label-danger',
        icon: 'fa-bullseye',
        point: 'ct-point-clicked'
    },
    'Submitted Data': {
        color: '#f05b4f',
        label: 'label-danger',
        icon: 'fa-exclamation',
        point: 'ct-point-clicked'
    },
    Unknown: {
        color: '#6c7a89',
        label: 'label-default',
        icon: 'fa-question',
        point: 'ct-point-error'
    },
    Sending: {
        color: '#428bca',
        label: 'label-primary',
        icon: 'fa-spinner',
        point: 'ct-point-sending'
    },
    'Campaign Created': {
        label: 'label-success',
        icon: 'fa-rocket'
    }
}, statsMapping = {
    sent: 'Email Sent',
    opened: 'Email Opened',
    email_reported: 'Email Reported',
    clicked: 'Clicked Link',
    detected: 'Activity Detected',
    submitted_data: 'Submitted Data'
};
function deleteCampaign(e) {
    confirm('Delete ' + campaigns[e].name + '?') && api.campaignId.delete(campaigns[e].id).success(function (e) {
        successFlash(e.message), location.reload();
    });
}
function renderPieChart(e) {
    return Highcharts.chart(e.elemId, {
        chart: {
            type: 'pie',
            events: {
                load: function () {
                    var t = this, a = t.renderer, l = t.series[0], i = t.plotLeft + l.center[0], s = t.plotTop + l.center[1];
                    this.innerText = a.text(e.data[0].count, i, s).attr({
                        'text-anchor': 'middle',
                        'font-size': '16px',
                        'font-weight': 'bold',
                        fill: e.colors[0],
                        'font-family': 'Helvetica,Arial,sans-serif'
                    }).add();
                },
                render: function () {
                    this.innerText.attr({ text: e.data[0].count });
                }
            }
        },
        title: { text: e.title },
        plotOptions: {
            pie: {
                innerSize: '80%',
                dataLabels: { enabled: !1 }
            }
        },
        credits: { enabled: !1 },
        tooltip: {
            formatter: function () {
                return null != this.key && '<span style="color:' + this.color + '">\u25CF</span>' + this.point.name + ': <b>' + this.y + '%</b><br/>';
            }
        },
        series: [{
            data: e.data,
            colors: e.colors
        }]
    });
}
function generateStatsPieCharts(e) {
    var t = [], a = {}, l = 0;
    $.each(e, function (e, t) {
        $.each(t.stats, function (e, t) {
            if ('total' == e)
                return l += t, !0;
            a[e] ? a[e] += t : a[e] = t;
        });
    }), $.each(a, function (e, a) {
        if (!(e in statsMapping))
            return !0;
        status_label = statsMapping[e], t.push({
            name: status_label,
            y: Math.floor(a / l * 100),
            count: a
        }), t.push({
            name: '',
            y: 100 - Math.floor(a / l * 100)
        });
        renderPieChart({
            elemId: e + '_chart',
            title: status_label,
            name: e,
            data: t,
            colors: [
                statuses[status_label].color,
                '#dddddd'
            ]
        });
        t = [];
    });
}
function generateTimelineChart(e) {
    var t = [];
    $.each(e, function (e, a) {
        var l = moment.utc(a.created_date).local();
        a.y = 0, a.y += a.stats.clicked, a.y = Math.floor(a.y / a.stats.total * 100), t.push({
            campaign_id: a.id,
            name: a.name,
            x: l.valueOf(),
            y: a.y
        });
    }), Highcharts.chart('overview_chart', {
        chart: {
            zoomType: 'x',
            type: 'areaspline'
        },
        title: { text: 'Phishing Success Overview' },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                second: '%l:%M:%S',
                minute: '%l:%M',
                hour: '%l:%M',
                day: '%b %d, %Y',
                week: '%b %d, %Y',
                month: '%b %Y'
            }
        },
        yAxis: {
            min: 0,
            max: 100,
            title: { text: '% of Success' }
        },
        tooltip: {
            formatter: function () {
                return Highcharts.dateFormat('%A, %b %d %l:%M:%S %P', new Date(this.x)) + '<br>' + this.point.name + '<br>% Success: <b>' + this.y + '%</b>';
            }
        },
        legend: { enabled: !1 },
        plotOptions: {
            series: {
                marker: {
                    enabled: !0,
                    symbol: 'circle',
                    radius: 3
                },
                cursor: 'pointer',
                point: {
                    events: {
                        click: function (e) {
                            window.location.href = '/campaigns/' + this.campaign_id;
                        }
                    }
                }
            }
        },
        credits: { enabled: !1 },
        series: [{
            data: t,
            color: '#f05b4f',
            fillOpacity: 0.5
        }]
    });
}
$(document).ready(function () {
    Highcharts.setOptions({ global: { useUTC: !1 } }), api.campaigns.summary().success(function (e) {
        $('#loading').hide(), (campaigns = e.campaigns).length > 0 ? ($('#dashboard').show(), campaignTable = $('#campaignTable').DataTable({
            columnDefs: [
                {
                    orderable: !1,
                    targets: 'no-sort'
                },
                {
                    className: 'color-sent',
                    targets: [2]
                },
                {
                    className: 'color-opened',
                    targets: [3]
                },
                {
                    className: 'color-clicked',
                    targets: [4]
                },
                {
                    className: 'color-activity',
                    targets: [5]
                },
                {
                    className: 'color-success',
                    targets: [6]
                },
                {
                    className: 'color-reported',
                    targets: [7]
                }
            ],
            order: [[
                1,
                'desc'
            ]]
        }), campaignRows = [], $.each(campaigns, function (e, t) {
            var a = moment(t.created_date).format('MMMM Do YYYY, h:mm:ss a'), l = statuses[t.status].label || 'label-default';
            if (moment(t.launch_date).isAfter(moment()))
                var i = 'Scheduled to start: ' + moment(t.launch_date).format('MMMM Do YYYY, h:mm:ss a') + '<br><br>Number of recipients: ' + t.stats.total;
            else
                i = 'Launch Date: ' + moment(t.launch_date).format('MMMM Do YYYY, h:mm:ss a') + '<br><br>Number of recipients: ' + t.stats.total + '<br><br>Emails opened: ' + t.stats.opened + '<br><br>Emails clicked: ' + t.stats.clicked + '<br><br>Activity Detected: ' + t.stats.detected + '<br><br>Submitted Credentials: ' + t.stats.submitted_data + '<br><br>Errors : ' + t.stats.error + '<br><br>Reported : ' + t.stats.email_reported;
            campaignRows.push([
                escapeHtml(t.name),
                a,
                t.stats.sent,
                t.stats.opened,
                t.stats.clicked,
                t.stats.detected,
                t.stats.submitted_data,
                t.stats.email_reported,
                '<span class="label ' + l + '" data-toggle="tooltip" data-placement="right" data-html="true" title="' + i + '">' + t.status + '</span>',
                "<div class='pull-right'><a class='btn btn-primary' href='/campaigns/" + t.id + "' data-toggle='tooltip' data-placement='left' title='View Results'>                    <i class='fa fa-bar-chart'></i>                    </a>                    <button class='btn btn-danger' onclick='deleteCampaign(" + e + ")' data-toggle='tooltip' data-placement='left' title='Delete Campaign'>                    <i class='fa fa-trash-o'></i>                    </button></div>"
            ]), $('[data-toggle="tooltip"]').tooltip();
        }), campaignTable.rows.add(campaignRows).draw(), generateStatsPieCharts(campaigns), generateTimelineChart(campaigns)) : $('#emptyMessage').show();
    }).error(function () {
        errorFlash('Error fetching campaigns');
    });
});