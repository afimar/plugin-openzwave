/* This file is part of Jeedom.
 *
 * Jeedom is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Jeedom is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Jeedom. If not, see <http://www.gnu.org/licenses/>.
 */

$('#bt_syncEqLogic').on('click', function () {
    syncEqLogicWithOpenZwave();
});
$('.changeIncludeState').on('click', function () {
    var zwaveServerCount = 0;
    var serverId = 1;
    for (var i in listServerZwave) {
        if (listServerZwave[i].name != null) {
            serverId = i
            zwaveServerCount++
        }
    }
    var mode = $(this).attr('data-mode');
    var state = $(this).attr('data-state');
    // if only one server and not in inclusion, no selection dialog
    if (zwaveServerCount == 1 && mode != 1 || zwaveServerCount == 1  && mode == 1  && state == 0) {
        changeIncludeState(mode, state, serverId, 0);
    }
    else {
        var dialog_title = '';
        var dialog_message = '<form class="form-horizontal onsubmit="return false;"> ';
        if (zwaveServerCount > 1) {
            // get the servers list
            var options = '';
            for (var i in listServerZwave) {
                if (listServerZwave[i].name != null) {
                    options += '<option value="' + i + '">' + listServerZwave[i].name + '</option>';
                }
            }
            // display servers selection
            dialog_message += '<label class="control-label" > {{Sélectionner le serveur}} </label> ' +
                '<select id="sel_serverZwave" class="form-control input-md"> ' +
                options +
                '</select> ' +
                '</div> ' +
                '</div> ';
        }
        if (mode == 1 && state != 0) {
            // in inclusion add secure mode selection
            dialog_title = '{{Démarrer l\'inclusion}}';
            dialog_message += '<label class="control-label" > {{Sélectionner le mode d\'inclusion ?}} </label> ' +
                '<div> <div class="radio"> <label > ' +
                '<input type="radio" name="secure" id="secure-1" value="1" checked="checked"> {{Mode sécurisé}} </label> ' +
                '</div><div class="radio"> <label > ' +
                '<input type="radio" name="secure" id="secure-0" value="0"> {{Mode non sécurisé}}</label> ' +
                '</div> ' +
                '</div><br>' +
                '<label class="lbl lbl-warning" for="name">{{Attention, Une fois démarrer veuillez suivre la procédure d\'inclusion de votre module.}}</label> ';
        }
        else {
            dialog_title = '{{Démarrer l\'exclusion}}';
        }
        if (state == 0) {
            // revert state, cancel current mode
            if (mode == 1) {
                dialog_title = '{{Arrêter l\'inclusion}}';
            }
            else {
                dialog_title = '{{Arrêter l\'exclusion}}';
            }
        }
        dialog_message += '</form>';
        bootbox.dialog({
            title: dialog_title,
            message: dialog_message,
            buttons: {
                "{{Annuler}}": {
                    className: "btn-danger",
                    callback: function () {
                    }
                },
                success: {
                    label: "{{Démarrer}}",
                    className: "btn-success",
                    callback: function () {
                        if (zwaveServerCount > 1) {
                            serverId = $('#sel_serverZwave').value();
                        }
                        var secureMode = $("input[name='secure']:checked").val();
                        changeIncludeState(mode, state, serverId, secureMode);
                    }
                },
            }
        });
    }
});

$('body').delegate('.nodeConfiguration', 'click', function () {
    $('#md_modal2').dialog({title: "{{Configuration module Z-Wave}}"});
    $('#md_modal2').load('index.php?v=d&plugin=openzwave&modal=node.configure&id=' + $(this).attr('data-node-id') + '&serverId=' + $(this).attr('data-server-id')).dialog('open');
});

$('#bt_displayZwaveData').on('click', function () {
    $('#md_modal').dialog({title: "{{Arbre Z-Wave de l'équipement}}"});
    $('#md_modal').load('index.php?v=d&plugin=openzwave&modal=zwave.data&id=' + $('.eqLogicAttr[data-l1key=id]').value()).dialog('open');
});

$('#bt_zwaveNetwork').on('click', function () {
    $('#md_modal').dialog({title: "{{Réseaux zwave}}"});
    $('#md_modal').load('index.php?v=d&plugin=openzwave&modal=network').dialog('open');
});

$('#bt_configureDevice').on('click', function () {
    $('#md_modal').dialog({title: "{{Configuration du module}}"});
    $('#md_modal').load('index.php?v=d&plugin=openzwave&modal=node.configure&id=' + $('.eqLogicAttr[data-l1key=logicalId]').value() + '&serverId=' + $('.eqLogicAttr[data-l1key=configuration][data-l2key=serverID]').value()).dialog('open');
});

$('#bt_zwaveHealth').on('click', function () {
    $('#md_modal').dialog({title: "{{Santé zwave}}"});
    $('#md_modal').load('index.php?v=d&plugin=openzwave&modal=health').dialog('open');
});

$('#bt_zwaveBackup').on('click', function () {
    $('#md_modal2').dialog({title: "{{Sauvegardes}}"});
    $('#md_modal2').load('index.php?v=d&plugin=openzwave&modal=backup').dialog('open');
});

if (is_numeric(getUrlVars('logical_id')) && is_numeric(getUrlVars('server_id'))) {
    if ($('.eqLogicDisplayCard[data-logical-id=' + getUrlVars('logical_id') + '][data-server-id=' + getUrlVars('server_id') + ']').length != 0) {
        setTimeout(function () {
            $('.eqLogicDisplayCard[data-logical-id=' + getUrlVars('logical_id') + '][data-server-id=' + getUrlVars('server_id') + ']').click();
        }, 10);
    }
}

$("#table_cmd").sortable({
    axis: "y",
    cursor: "move",
    items: ".cmd",
    placeholder: "ui-state-highlight",
    tolerance: "intersect",
    forcePlaceholderSize: true
});

function printEqLogic(_eqLogic) {
    printPending();
    if ($('.li_eqLogic.active').attr('data-eqlogic_id') != '') {
        $('#img_device').attr("src", $('.eqLogicDisplayCard[data-eqLogic_id=' + $('.li_eqLogic.active').attr('data-eqlogic_id') + '] img').attr('src'));
    } else {
        $('#img_device').attr("src", 'plugins/openzwave/doc/images/openzwave_icon.png');
    }
    if ($('.li_eqLogic.active').attr('data-assistant') != '') {
        $('#bt_deviceAssistant').show();
        $('#bt_deviceAssistant').off().on('click', function () {
            $('#md_modal').dialog({title: "{{Assistant de configuration}}"});
            $('#md_modal').load('index.php?v=d&plugin=openzwave&modal=device.assistant&id=' + _eqLogic.id + '&serverId=' + _eqLogic.configuration.serverID + '&logical_id=' + _eqLogic.logicalId).dialog('open');
        });
    } else {
        $('#bt_deviceAssistant').hide();
    }
    $.ajax({// fonction permettant de faire de l'ajax
        type: "POST", // méthode de transmission des données au fichier php
        url: "plugins/openzwave/core/ajax/openzwave.ajax.php", // url du fichier php
        data: {
            action: "getConfiguration",
            manufacturer_id: _eqLogic.configuration.manufacturer_id,
            product_type: _eqLogic.configuration.product_type,
            product_id: _eqLogic.configuration.product_id,
            json: _eqLogic.configuration.fileconf,
        },
        dataType: 'json',
        global: false,
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) { // si l'appel a bien fonctionné
            $('#bt_deviceRecommended').off('click');
            if (isset(data.result.name)) {
                $('.eqLogicAttr[data-l1key=configuration][data-l2key=product_name]').value(data.result.name);
            }
            if (isset(data.result.doc) && data.result.doc != '') {
                $('#bt_deviceDocumentation').attr('href', 'https://www.jeedom.fr/doc/documentation/zwave-modules/fr_FR/doc-zwave-modules-' + data.result.doc + '.html');
                $('#bt_deviceDocumentation').show();
            } else {
                $('#bt_deviceDocumentation').hide();
            }
            if (isset(data.result.recommended) && data.result.recommended != '') {
                $('#bt_deviceRecommended').show();
                $('#bt_deviceRecommended').on('click', function () {
                    bootbox.dialog({
                            title: "{{Configuration recommandée}}",
                            message: '<form class="form-horizontal"> ' +
                            '<label class="control-label" > {{Voulez-vous appliquer le jeu de configuration recommandée par l\'équipe Jeedom ?}} </label> ' +
                            '<br><br>' +
                            '<ul>' +
                            '<li class="active">{{Paramètres.}}</li>' +
                            '<li class="active">{{Associations.}}</li>' +
                            '<li class="active">{{Intervalle de réveil.}}</li>' +
                            '<li class="active">{{Rafraîchissement.}}</li>' +
                            '</ul>' +
                            '</form>',
                            buttons: {
                                main: {
                                    label: "{{Annuler}}",
                                    className: "btn-danger",
                                    callback: function () {
                                    }
                                },
                                success: {
                                    label: "{{Appliquer}}",
                                    className: "btn-success",
                                    callback: function () {
                                        $.ajax({// fonction permettant de faire de l'ajax
                                            type: "POST", // méthode de transmission des données au fichier php
                                            url: "plugins/openzwave/core/ajax/openzwave.ajax.php", // url du fichier php
                                            data: {
                                                action: "applyRecommended",
                                                id: _eqLogic.id,
                                            },
                                            dataType: 'json',
                                            error: function (request, status, error) {
                                                handleAjaxError(request, status, error);
                                            },
                                            success: function (data) { // si l'appel a bien fonctionné
                                                if (data.state != 'ok') {
                                                    $('#div_alert').showAlert({message: data.result, level: 'danger'});
                                                    return;
                                                }
                                                if (data.result == "wakeup") {
                                                    $('#div_alert').showAlert({
                                                        message: '{{Configuration appliquée. Cependant ce module nécessite un réveil pour que celle-ci soit effective.}}',
                                                        level: 'success'
                                                    });
                                                } else {
                                                    $('#div_alert').showAlert({
                                                        message: '{{Configuration appliquée et effective.}}',
                                                        level: 'success'
                                                    });
                                                }
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    );

                    /*
                     bootbox.confirm('{{Voulez-vous appliquer la configuration recommandée par l\'équipe Jeedom (paramètre, wakeup, refresh, associations ...) }}', function (result) {
                     if (result) {
                     $.ajax({// fonction permettant de faire de l'ajax
                     type: "POST", // methode de transmission des données au fichier php
                     url: "plugins/openzwave/core/ajax/openzwave.ajax.php", // url du fichier php
                     data: {
                     action: "applyRecommended",
                     id: _eqLogic.id,
                     },
                     dataType: 'json',
                     error: function (request, status, error) {
                     handleAjaxError(request, status, error);
                     },
                     success: function (data) { // si l'appel a bien fonctionné
                     if (data.state != 'ok') {
                     $('#div_alert').showAlert({message: data.result, level: 'danger'});
                     return;
                     }
                     if (data.result == "wakeup") {
                     $('#div_alert').showAlert({message: '{{Configuration appliquée. Cependant ce module nécessite un réveil s\'il est sur batterie pour que celle-ci soit effective.}}', level: 'success'});
                     } else {
                     $('#div_alert').showAlert({message: '{{Configuration appliquée et effective.}}', level: 'success'});
                     }
                     }
                     });
                     }
                     });*/
                });
            } else {
                $('#bt_deviceRecommended').hide();
            }
            modifyWithoutSave = false;
        }
    });

    $.ajax({// fonction permettant de faire de l'ajax
        type: "POST", // méthode de transmission des données au fichier php
        url: "plugins/openzwave/core/ajax/openzwave.ajax.php", // url du fichier php
        data: {
            action: "getAllPossibleConf",
            id: _eqLogic.id,
        },
        dataType: 'json',
        global: false,
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) { // si l'appel a bien fonctionné
            $('.eqLogicAttr[data-l1key=configuration][data-l2key=fileconf]').empty();
            if (data.result.length > 1) {
                option = '';
                for (var i in data.result) {
                    option += '<option value="' + data.result[i] + '">' + data.result[i] + '</option>';
                }
                $('.eqLogicAttr[data-l1key=configuration][data-l2key=fileconf]').append(option);
                $('.eqLogicAttr[data-l1key=configuration][data-l2key=fileconf]').closest('.form-group').show();
                if (isset(_eqLogic.configuration.fileconf)) {
                    $('.eqLogicAttr[data-l1key=configuration][data-l2key=fileconf]').value(_eqLogic.configuration.fileconf);
                }
            } else {
                $('.eqLogicAttr[data-l1key=configuration][data-l2key=fileconf]').closest('.form-group').hide();
            }
            modifyWithoutSave = false;
        }
    });
}


/**********************Envent js requests *****************************/
$('body').on('zwave::controller.data.controllerState', function (_event, _options) {
    $.hideAlert();
    if (_options.state == 1) {
        $('.changeIncludeState[data-mode=1]:not(.card)').removeClass('btn-default').addClass('btn-success');
        $('.changeIncludeState.card[data-mode=1]').css('background-color', '#8000FF');
        $('.changeIncludeState.card[data-mode=1] span center').text('{{Arrêter l\'inclusion}}');
        $('.changeIncludeState[data-mode=1]').attr('data-state', 0);
        $('.changeIncludeState[data-mode=1]:not(.card)').html('<i class="fa fa-sign-in fa-rotate-90"></i> {{Arrêter l\'inclusion}}');
        $('#div_inclusionAlert' + _options.serverId).showAlert({
            message: '{{Vous êtes en mode inclusion}} ' + _options.name + '. {{Cliquez à nouveau sur le bouton d\'inclusion pour sortir de ce mode. Pour inclure un module veuillez appuyer sur son bouton d\'inclusion (une ou plusieurs fois comme décrit dans la documentation du module).}}',
            level: 'warning'
        });
    } else if (_options.state == 5) {
        $('.changeIncludeState[data-mode=0]:not(.card)').removeClass('btn-default').addClass('btn-danger');
        $('.changeIncludeState.card[data-mode=0]').css('background-color', '#8000FF');
        $('.changeIncludeState.card[data-mode=0] span center').text('{{Arrêter l\'exclusion}}');
        $('.changeIncludeState[data-mode=0]').attr('data-state', 0);
        $('.changeIncludeState[data-mode=0]:not(.card)').html('<i class="fa fa-sign-out fa-rotate-90"></i> {{Arrêter l\'exclusion}}');
        $('#div_inclusionAlert' + _options.serverId).showAlert({
            message: '{{Vous êtes en mode exclusion sur}} ' + _options.name + '. {{Cliquez à nouveau sur le bouton d\'exclusion pour sortir de ce mode. Pour exclure un module veuillez appuyer sur son bouton d\'inclusion (une ou plusieurs fois comme décrit dans la documentation du module).}}',
            level: 'warning'
        });
    } else {
        $('.changeIncludeState.card[data-mode=0]').css('background-color', '#ffffff');
        $('.changeIncludeState.card[data-mode=1]').css('background-color', '#ffffff');
        $('.changeIncludeState[data-mode=0]:not(.card)').html('<i class="fa fa-sign-in fa-rotate-90"></i> {{Mode exclusion}}');
        $('.changeIncludeState[data-mode=1]:not(.card)').html('<i class="fa fa-sign-in fa-rotate-90"></i> {{Mode inclusion}}');
        $('.changeIncludeState.card[data-mode=1] span center').text('{{Mode inclusion}}');
        $('.changeIncludeState.card[data-mode=0] span center').text('{{Mode exclusion}}');
        $('.changeIncludeState[data-mode=1]').attr('data-state', 1);
        $('.changeIncludeState[data-mode=0]').attr('data-state', 1);
        $('.changeIncludeState[data-mode=1]:not(.card)').removeClass('btn-success').addClass('btn-default');
        $('.changeIncludeState[data-mode=0]:not(.card)').removeClass('btn-danger').addClass('btn-default');
    }
});

$('body').on('zwave::includeDevice', function (_event, _options) {
    if (modifyWithoutSave) {
        $('#div_inclusionAlert').showAlert({
            message: '{{Un périphérique vient d\'être inclu/exclu. Veuillez réactualiser la page}}',
            level: 'warning'
        });
    } else {
        if (_options == '') {
            window.location.reload();
        } else {
            window.location.href = 'index.php?v=d&p=openzwave&m=openzwave&id=' + _options;
        }
    }
});

$('#bt_autoDetectModule').on('click', function () {

    bootbox.confirm('{{Etes-vous sûr de vouloir récréer toutes les commandes ? Cela va supprimer les commandes existantes}}', function (result) {
        if (result) {
            $.ajax({// fonction permettant de faire de l'ajax
                type: "POST", // méthode de transmission des données au fichier php
                url: "plugins/openzwave/core/ajax/openzwave.ajax.php", // url du fichier php
                data: {
                    action: "autoDetectModule",
                    id: $('.eqLogicAttr[data-l1key=id]').value(),
                },
                dataType: 'json',
                global: false,
                error: function (request, status, error) {
                    handleAjaxError(request, status, error);
                },
                success: function (data) { // si l'appel a bien fonctionné
                    if (data.state != 'ok') {
                        $('#div_alert').showAlert({message: data.result, level: 'danger'});
                        return;
                    }
                    $('#div_alert').showAlert({message: '{{Opération réalisée avec succès}}', level: 'success'});
                    $('.li_eqLogic[data-eqLogic_id=' + $('.eqLogicAttr[data-l1key=id]').value() + ']').click();
                }
            });
        }
    });
});

function syncEqLogicWithOpenZwave() {
    $.ajax({// fonction permettant de faire de l'ajax
        type: "POST", // méthode de transmission des données au fichier php
        url: "plugins/openzwave/core/ajax/openzwave.ajax.php", // url du fichier php
        data: {
            action: "syncEqLogicWithOpenZwave",
        },
        dataType: 'json',
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) { // si l'appel a bien fonctionné
            if (data.state != 'ok') {
                $('#div_alert').showAlert({message: data.result, level: 'danger'});
                return;
            }
            window.location.reload();
        }
    });
}

function changeIncludeState(_mode, _state, _serverID, _secure) {
    $.ajax({// fonction permettant de faire de l'ajax
        type: "POST", // méthode de transmission des données au fichier php
        url: "plugins/openzwave/core/ajax/openzwave.ajax.php", // url du fichier php
        data: {
            action: "changeIncludeState",
            mode: _mode,
            state: _state,
            serverID: _serverID,
            secure: _secure,
        },
        dataType: 'json',
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) { // si l'appel a bien fonctionné
            if (data.state != 'ok') {
                $('#div_alert').showAlert({message: data.result, level: 'danger'});
                return;
            }
        }
    });
}

function printPending() {
    $.ajax({// fonction permettant de faire de l'ajax
        type: "POST", // methode de transmission des données au fichier php
        url: "plugins/openzwave/core/ajax/openzwave.ajax.php", // url du fichier php
        data: {
            action: "printPending",
            id: $('.eqLogicAttr[data-l1key=id]').value(),
        },
        dataType: 'json',
        async: true,
        global: false,
        error: function (request, status, error) {
            handleAjaxError(request, status, error);
        },
        success: function (data) {
            if (data.state != 'ok') {
                $('#div_alert').showAlert({message: data.result, level: 'danger'});
                return;
            }
            if (data.result != "ok") {
                $('.isPending').empty().append('  <i class="fa fa-spinner fa-pulse"></i> ' + data.result + ' modification(s) en attente d\'être appliquée(s)');
            } else {
                $('.isPending').empty();
            }
        }
    });
}

window.setInterval(function () {
    printPending();
}, 5000);

function addCmdToTable(_cmd) {
    if (!isset(_cmd)) {
        var _cmd = {configuration: {}};
    }
    var tr = '<tr class="cmd" data-cmd_id="' + init(_cmd.id) + '">';
    tr += '<td>';
    tr += '<div class="row">';
    tr += '<div class="col-sm-6">';
    tr += '<a class="cmdAction btn btn-default btn-sm" data-l1key="chooseIcon"><i class="fa fa-flag"></i> {{Icône}}</a>';
    tr += '<span class="cmdAttr" data-l1key="display" data-l2key="icon" style="margin-left : 10px;"></span>';
    tr += '</div>';
    tr += '<div class="col-sm-6">';
    tr += '<input class="cmdAttr form-control input-sm" data-l1key="name">';
    tr += '</div>';
    tr += '</div>';
    tr += '<select class="cmdAttr form-control tooltips input-sm" data-l1key="value" style="display : none;margin-top : 5px;" title="{{La valeur de la commande vaut par défaut la commande}}">';
    tr += '<option value="">Aucune</option>';
    tr += '</select>';
    tr += '</td>';
    tr += '<td class="expertModeVisible">';
    tr += '<input class="cmdAttr form-control input-sm" data-l1key="id" style="display : none;">';
    tr += '<span class="type" type="' + init(_cmd.type) + '">' + jeedom.cmd.availableType() + '</span>';
    tr += '<span class="subType" subType="' + init(_cmd.subType) + '"></span>';
    tr += '</td>';
    tr += '<td class="expertModeVisible"><input class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="instanceId" value="0"></td>';
    tr += '<td class="expertModeVisible"><input class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="class" ></td>';
    tr += '<td class="expertModeVisible">';
    tr += '<input class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="value" >';
    tr += '<input class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="returnStateValue" placeholder="{{Valeur retour d\'état}}" style="margin-top : 5px;">';
    tr += '<input class="cmdAttr form-control input-sm" data-l1key="configuration" data-l2key="returnStateTime" placeholder="{{Durée avant retour d\'état (min)}}" style="margin-top : 5px;">';
    tr += '</td>';
    tr += '<td>';
    tr += '<span><input type="checkbox" class="cmdAttr bootstrapSwitch" data-size="mini" data-l1key="isHistorized" data-label-text=" {{Historiser}}" /></span> ';
    tr += '<span><input type="checkbox" class="cmdAttr bootstrapSwitch" data-size="mini" data-l1key="isVisible" data-label-text=" {{Afficher}}" checked/></span> ';
    tr += '<span class="expertModeVisible"><input type="checkbox" data-size="mini" class="cmdAttr bootstrapSwitch" data-l1key="display" data-label-text=" {{Inverser}}" data-l2key="invertBinary" /></span> ';
    tr += '</td>';
    tr += '<td>';
    tr += '<input class="cmdAttr form-control tooltips input-sm" data-l1key="unite" placeholder="Unité" title="{{Unité}}">';
    tr += '<input class="tooltips cmdAttr form-control input-sm expertModeVisible" data-l1key="configuration" data-l2key="minValue" placeholder="{{Min}}" title="{{Min}}" style="margin-top : 5px;"> ';
    tr += '<input class="tooltips cmdAttr form-control input-sm expertModeVisible" data-l1key="configuration" data-l2key="maxValue" placeholder="{{Max}}" title="{{Max}}" style="margin-top : 5px;">';
    tr += '</td>';
    tr += '<td>';
    if (is_numeric(_cmd.id)) {
        tr += '<a class="btn btn-default btn-xs cmdAction expertModeVisible" data-action="configure"><i class="fa fa-cogs"></i></a> ';
        tr += '<a class="btn btn-default btn-xs cmdAction" data-action="test"><i class="fa fa-rss"></i> {{Tester}}</a>';
    }
    tr += '<i class="fa fa-minus-circle pull-right cmdAction cursor" data-action="remove"></i></td>';
    tr += '</tr>';
    $('#table_cmd tbody').append(tr);
    var tr = $('#table_cmd tbody tr:last');
    jeedom.eqLogic.builSelectCmd({
        id: $(".li_eqLogic.active").attr('data-eqLogic_id'),
        filter: {type: 'info'},
        error: function (error) {
            $('#div_alert').showAlert({message: error.message, level: 'danger'});
        },
        success: function (result) {
            tr.find('.cmdAttr[data-l1key=value]').append(result);
            tr.setValues(_cmd, '.cmdAttr');
            jeedom.cmd.changeType(tr, init(_cmd.subType));
        }
    });
}
