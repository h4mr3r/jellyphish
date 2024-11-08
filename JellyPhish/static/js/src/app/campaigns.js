var labels = {
    'In progress': 'label-primary',
    Queued: 'label-info',
    Completed: 'label-success',
    'Emails Sent': 'label-success',
    Error: 'label-danger'
}, campaigns = [], campaign = {};
function launch() {
    Swal.fire({
        title: 'Are you sure?',
        text: 'This will schedule the campaign to be launched.',
        type: 'question',
        animation: !1,
        showCancelButton: !0,
        confirmButtonText: 'Launch',
        confirmButtonColor: '#428bca',
        reverseButtons: !0,
        allowOutsideClick: !1,
        showLoaderOnConfirm: !0,
        preConfirm: function () {
            return new Promise(function (e, a) {
                groups = [], $('#users').select2('data').forEach(function (e) {
                    groups.push({ name: e.text });
                });
                var t = $('#send_by_date').val();
                '' != t && (t = moment(t, 'MMMM Do YYYY, h:mm a').utc().format()), campaign = {
                    name: $('#name').val(),
                    template: { name: $('#template').select2('data')[0].text },
                    url: $('#url').val(),
                    page: { name: $('#page').select2('data')[0].text },
                    smtp: { name: $('#profile').select2('data')[0].text },
                    launch_date: moment($('#launch_date').val(), 'MMMM Do YYYY, h:mm a').utc().format(),
                    send_by_date: t || null,
                    groups: groups
                }, api.campaigns.post(campaign).success(function (a) {
                    e(), campaign = a;
                }).error(function (e) {
                    $('#modal\\.flashes').empty().append('<div style="text-align:center" class="alert alert-danger">            <i class="fa fa-exclamation-circle"></i> ' + e.responseJSON.message + '</div>'), Swal.close();
                });
            });
        }
    }).then(function (e) {
        e.value && Swal.fire('Campaign Scheduled!', 'This campaign has been scheduled for launch!', 'success'), $('button:contains("OK")').on('click', function () {
            window.location = '/campaigns/' + campaign.id.toString();
        });
    });
}
function sendTestEmail() {
    var e = {
        template: { name: $('#template').select2('data')[0].text },
        first_name: $('input[name=to_first_name]').val(),
        last_name: $('input[name=to_last_name]').val(),
        email: $('input[name=to_email]').val(),
        position: $('input[name=to_position]').val(),
        url: $('#url').val(),
        page: { name: $('#page').select2('data')[0].text },
        smtp: { name: $('#profile').select2('data')[0].text }
    };
    btnHtml = $('#sendTestModalSubmit').html(), $('#sendTestModalSubmit').html('<i class="fa fa-spinner fa-spin"></i> Sending'), api.send_test_email(e).success(function (e) {
        $('#sendTestEmailModal\\.flashes').empty().append('<div style="text-align:center" class="alert alert-success">            <i class="fa fa-check-circle"></i> Email Sent!</div>'), $('#sendTestModalSubmit').html(btnHtml);
    }).error(function (e) {
        $('#sendTestEmailModal\\.flashes').empty().append('<div style="text-align:center" class="alert alert-danger">            <i class="fa fa-exclamation-circle"></i> ' + e.responseJSON.message + '</div>'), $('#sendTestModalSubmit').html(btnHtml);
    });
}
function dismiss() {
    $('#modal\\.flashes').empty(), $('#name').val(''), $('#template').val('').change(), $('#page').val('').change(), $('#url').val(''), $('#profile').val('').change(), $('#users').val('').change(), $('#modal').modal('hide');
}
function deleteCampaign(e) {
    Swal.fire({
        title: 'Are you sure?',
        text: "This will delete the campaign. This can't be undone!",
        type: 'warning',
        animation: !1,
        showCancelButton: !0,
        confirmButtonText: 'Delete ' + campaigns[e].name,
        confirmButtonColor: '#428bca',
        reverseButtons: !0,
        allowOutsideClick: !1,
        preConfirm: function () {
            return new Promise(function (a, t) {
                api.campaignId.delete(campaigns[e].id).success(function (e) {
                    a();
                }).error(function (e) {
                    t(e.responseJSON.message);
                });
            });
        }
    }).then(function (e) {
        e.value && Swal.fire('Campaign Deleted!', 'This campaign has been deleted!', 'success'), $('button:contains("OK")').on('click', function () {
            location.reload();
        });
    });
}
function setupOptions() {
    api.groups.summary().success(function (e) {
        if (groups = e.groups, 0 == groups.length)
            return modalError('No groups found!'), !1;
        var a = $.map(groups, function (e) {
            return e.text = e.name, e.title = e.num_targets + ' targets', e;
        });
        console.log(a), $('#users.form-control').select2({
            placeholder: 'Select Groups',
            data: a
        });
    }), api.templates.get().success(function (e) {
        if (0 == e.length)
            return modalError('No templates found!'), !1;
        var a = $.map(e, function (e) {
            return e.text = e.name, e;
        }), t = $('#template.form-control');
        t.select2({
            placeholder: 'Select a Template',
            data: a
        }), 1 === e.length && (t.val(a[0].id), t.trigger('change.select2'));
    }), api.pages.get().success(function (e) {
        if (0 == e.length)
            return modalError('No pages found!'), !1;
        var a = $.map(e, function (e) {
            return e.text = e.name, e;
        }), t = $('#page.form-control');
        t.select2({
            placeholder: 'Select a Landing Page',
            data: a
        }), 1 === e.length && (t.val(a[0].id), t.trigger('change.select2'));
    }), api.SMTP.get().success(function (e) {
        if (0 == e.length)
            return modalError('No profiles found!'), !1;
        var a = $.map(e, function (e) {
            return e.text = e.name, e;
        }), t = $('#profile.form-control');
        t.select2({
            placeholder: 'Select a Sending Profile',
            data: a
        }).select2('val', a[0]), 1 === e.length && (t.val(a[0].id), t.trigger('change.select2'));
    });
}
function edit(e) {
    setupOptions();
}
function copy(e) {
    setupOptions(), api.campaignId.get(campaigns[e].id).success(function (e) {
        $('#name').val('Copy of ' + e.name), e.template.id ? ($('#template').val(e.template.id.toString()), $('#template').trigger('change.select2')) : ($('#template').val('').change(), $('#template').select2({ placeholder: e.template.name })), e.page.id ? ($('#page').val(e.page.id.toString()), $('#page').trigger('change.select2')) : ($('#page').val('').change(), $('#page').select2({ placeholder: e.page.name })), e.smtp.id ? ($('#profile').val(e.smtp.id.toString()), $('#profile').trigger('change.select2')) : ($('#profile').val('').change(), $('#profile').select2({ placeholder: e.smtp.name })), $('#url').val(e.url);
    }).error(function (e) {
        $('#modal\\.flashes').empty().append('<div style="text-align:center" class="alert alert-danger">            <i class="fa fa-exclamation-circle"></i> ' + e.responseJSON.message + '</div>');
    });
}
$(document).ready(function () {
    $('#launch_date').datetimepicker({
        widgetPositioning: { vertical: 'bottom' },
        showTodayButton: !0,
        defaultDate: moment(),
        format: 'MMMM Do YYYY, h:mm a'
    }), $('#send_by_date').datetimepicker({
        widgetPositioning: { vertical: 'bottom' },
        showTodayButton: !0,
        useCurrent: !1,
        format: 'MMMM Do YYYY, h:mm a'
    }), $('.modal').on('hidden.bs.modal', function (e) {
        $(this).removeClass('fv-modal-stack'), $('body').data('fv_open_modals', $('body').data('fv_open_modals') - 1);
    }), $('.modal').on('shown.bs.modal', function (e) {
        void 0 === $('body').data('fv_open_modals') && $('body').data('fv_open_modals', 0), $(this).hasClass('fv-modal-stack') || ($(this).addClass('fv-modal-stack'), $('body').data('fv_open_modals', $('body').data('fv_open_modals') + 1), $(this).css('z-index', 1040 + 10 * $('body').data('fv_open_modals')), $('.modal-backdrop').not('.fv-modal-stack').css('z-index', 1039 + 10 * $('body').data('fv_open_modals')), $('.modal-backdrop').not('fv-modal-stack').addClass('fv-modal-stack'));
    }), $(document).on('hidden.bs.modal', '.modal', function () {
        $('.modal:visible').length && $(document.body).addClass('modal-open');
    }), $('#modal').on('hidden.bs.modal', function (e) {
        dismiss();
    }), api.campaigns.summary().success(function (e) {
        campaigns = e.campaigns, $('#loading').hide(), campaigns.length > 0 ? ($('#campaignTable').show(), $('#campaignTableArchive').show(), activeCampaignsTable = $('#campaignTable').DataTable({
            columnDefs: [{
                orderable: !1,
                targets: 'no-sort'
            }],
            order: [[
                1,
                'desc'
            ]]
        }), archivedCampaignsTable = $('#campaignTableArchive').DataTable({
            columnDefs: [{
                orderable: !1,
                targets: 'no-sort'
            }],
            order: [[
                1,
                'desc'
            ]]
        }), rows = {
            active: [],
            archived: []
        }, $.each(campaigns, function (e, a) {
            if (label = labels[a.status] || 'label-default', moment(a.launch_date).isAfter(moment()))
                var t = 'Scheduled to start: ' + moment(a.launch_date).format('MMMM Do YYYY, h:mm:ss a') + '<br><br>Number of recipients: ' + a.stats.total;
            else
                t = 'Launch Date: ' + moment(a.launch_date).format('MMMM Do YYYY, h:mm:ss a') + '<br><br>Number of recipients: ' + a.stats.total + '<br><br>Emails opened: ' + a.stats.opened + '<br><br>Emails clicked: ' + a.stats.clicked + '<br><br>Activity Detected: ' + a.stats.detected + '<br><br>Submitted Credentials: ' + a.stats.submitted_data + '<br><br>Errors : ' + a.stats.error + '<br><br>Reported : ' + a.stats.email_reported;
            var n = [
                escapeHtml(a.name),
                moment(a.created_date).format('MMMM Do YYYY, h:mm:ss a'),
                '<span class="label ' + label + '" data-toggle="tooltip" data-placement="right" data-html="true" title="' + t + '">' + a.status + '</span>',
                "<div class='pull-right'><a class='btn btn-primary' href='/campaigns/" + a.id + "' data-toggle='tooltip' data-placement='left' title='View Results'>                    <i class='fa fa-bar-chart'></i>                    </a>            <span data-toggle='modal' data-backdrop='static' data-target='#modal'><button class='btn btn-primary' data-toggle='tooltip' data-placement='left' title='Copy Campaign' onclick='copy(" + e + ")'>                    <i class='fa fa-copy'></i>                    </button></span>                    <button class='btn btn-danger' onclick='deleteCampaign(" + e + ")' data-toggle='tooltip' data-placement='left' title='Delete Campaign'>                    <i class='fa fa-trash-o'></i>                    </button></div>"
            ];
            'Completed' == a.status ? rows.archived.push(n) : rows.active.push(n);
        }), activeCampaignsTable.rows.add(rows.active).draw(), archivedCampaignsTable.rows.add(rows.archived).draw(), $('[data-toggle="tooltip"]').tooltip()) : $('#emptyMessage').show();
    }).error(function () {
        $('#loading').hide(), errorFlash('Error fetching campaigns');
    }), $.fn.select2.defaults.set('width', '100%'), $.fn.select2.defaults.set('dropdownParent', $('#modal_body')), $.fn.select2.defaults.set('theme', 'bootstrap'), $.fn.select2.defaults.set('sorter', function (e) {
        return e.sort(function (e, a) {
            return e.text.toLowerCase() > a.text.toLowerCase() ? 1 : e.text.toLowerCase() < a.text.toLowerCase() ? -1 : 0;
        });
    });
});