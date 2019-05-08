  window.loged = false;

  cloudopt.onFinish(function() {

      cloudopt.static.send("Open Option Page");

      $("table").children("thead").find("td,th").each(function() {
          var idx = $(this).index();
          var td = $(this).closest("table").children("tbody")
              .children("tr:first").children("td,th").eq(idx);
          $(this).width() > td.width() ? td.width($(this).width()) : $(this).width(td.width());
      });

      $("#speedup").click(function(event) {
          if (!window.loged) {
              new Noty({
                  text: cloudopt.i18n.get("mustLogedTips"),
                  type: "error",
                  theme: "mint",
                  timeout: 3000
              }).show();
              return;
          }
      });

      refresh();

      if (cloudopt.getLocation() == "cn") {
          cloudopt.store.get("firstOpenoption2", function(value) {
              if (value == undefined || value == null) {
                  cloudopt.store.set("firstOpenoption2", "true");
                  new Noty({
                      text: "根据您的ip所在地区的法律及相关政策，我们将自动把视频网站加入白名单。",
                      type: "warning",
                      theme: "mint"
                  }).show();

              }
          });

      }

      $("#safeCloud").click(function() {
          change("safeCloud");

      });

      $("#safeDownload").click(function() {
          change("safeDownload");
      });

      $("#safeCoin").click(function() {
          change("safeCoin");
      });

      $("#safePotential").click(function() {
          change("safePotential");
      });

      $("#labSafeTips").click(function() {
          change("labSafeTips");
      });

      $("#safePrivacy").click(function() {
          change("safePrivacy");
      });

      $("#adblockActivating").click(function() {
          change("adblockActivating");
      });

      $("#adblockDisplay").click(function() {
          change("adblockDisplay");
      });

      $("#labBookmarkSearch").click(function() {
          change("labBookmarkSearch");
      });

      $("#labKeyboard").click(function() {
          change("labKeyboard");
      });

      $("#memoryOptimize").click(function() {
          change("memoryOptimize");
      });

      $("#dataCollection").click(function() {
          change("dataCollection");
      });

      $("#dnsSpeed").click(function() {
          change("dnsSpeed");
      });

      $("#webPrereading").click(function() {
          change("webPrereading");
      });

      $("button[title='Help']").click(function() {
          cloudopt.tab.open("https://www.cloudopt.net/support#help");
      });

      $("#openManualEdit").click(function() {
          location.href = "/edit.html";
      });


      if (cloudopt.utils.getQueryString("website") != null) {
          $("#whiteListInput").val(cloudopt.utils.getQueryString("website"));
          $("#whiteListInput").parent().addClass("is-dirty");
      }

      if (cloudopt.utils.getQueryString("hash") != null) {
          window.location.hash = "#" + cloudopt.utils.getQueryString("hash");
      }

      $("#whiteListAdd").click(function() {
          const text = $("#whiteListInput").val();
          const config = cloudopt.config.get();
          cloudopt.config.fastAddWhiteList(cloudopt.utils.getHost(text))(type => {
              if (type === 'optionTipsDontDuplicate' || type === 'optionTipsInputUrlisNull' || type === 'optionTipsInputUrlisError') {
                  new Noty({
                      text: cloudopt.i18n.get(type),
                      type: "error",
                      theme: "mint",
                      timeout: 1000
                  }).show();
              } else if (type === 'optionTipsAddWhiteListSuccess') {
                  new Noty({
                      text: cloudopt.i18n.get(type),
                      type: "info",
                      theme: "mint",
                      timeout: 1000
                  }).show();
                  refresh();
                  cloudopt.message.send("refresh-config");
                  $("#whiteListInput").val("");
              }
          })
      });

      $("#blackListAdd").click(function () {
          const text = $("#blackListInput").val();
          const config = cloudopt.config.get();
          cloudopt.config.fastAddBlackList(cloudopt.utils.getHost(text))(type => {
              if (type === 'optionTipsDontDuplicate' || type === 'optionTipsInputUrlisNull' || type === 'optionTipsInputUrlisError') {
                  new Noty({
                      text: cloudopt.i18n.get(type),
                      type: "error",
                      theme: "mint",
                      timeout: 1000
                  }).show();
              } else if (type === 'optionTipsAddBlackListSuccess') {
                  new Noty({
                      text: cloudopt.i18n.get(type),
                      type: "info",
                      theme: "mint",
                      timeout: 1000
                  }).show();
                  refresh();
                  cloudopt.message.send("refresh-config");
                  $("#blackListInput").val("");
              }
          })
      });

      $("#whiteListDelete").click(function() {
          var config = cloudopt.config.get();
          config.whiteList = [];
          cloudopt.config.set(config, function() {
              refresh();
              cloudopt.message.send("refresh-config");
          });
      });

      $("#blackListDelete").click(function() {
          var config = cloudopt.config.get();
          config.blackList = [];
          cloudopt.config.set(config, function() {
              refresh();
              cloudopt.message.send("refresh-config");
          });
      });

      $("#customSubscriptionAdd").click(function() {
          var text = $("#customSubscriptionInput").val();
          if (!!text) {
              const _waitNoty = new Noty({
                  text: cloudopt.i18n.get("waitSubscribe"),
                  type: "info",
                  theme: "mint",
                  timeout: 3000
              });
              var config = cloudopt.config.get();
              if (config.customSubscription.indexOf(text) > -1) {
                  new Noty({
                      text: cloudopt.i18n.get("optionTipsDontDuplicate"),
                      type: "error",
                      theme: "mint",
                      timeout: 3000
                  }).show();
              } else {
                  _waitNoty.show();
                  cloudopt.http.get(text, {
                      timeout: 30000,
                      contentType: 'application/x-www-form-urlencoded; charset=UTF-8'
                  }).exec().then(() => {
                      config.customSubscription[config.customSubscription.length] = text;
                      cloudopt.config.set(config, function () {
                          refresh();
                          cloudopt.message.send("refresh-config");
                          $("#customSubscriptionInput").val("");
                          new Noty({
                              text: cloudopt.i18n.get("optionTipsAddCustomRuleSuccess"),
                              type: "success",
                              theme: "mint",
                              timeout: 3000
                          }).show();
                      });
                  }, () => {
                      _waitNoty.close();
                      new Noty({
                          text: cloudopt.i18n.get("optionTipsAddCustomRuleFailure"),
                          type: "error",
                          theme: "mint",
                          timeout: 3000
                      }).show();
                  });
              };
          } else {
              new Noty({
                  text: cloudopt.i18n.get("urlErrorTips"),
                  type: "error",
                  theme: "mint",
                  timeout: 3000
              }).show();
          }

      });

      $("#customRuleAdd").click(function() {
          const text = $("#customRuleInput").val();
          if( !!text ) {
              var config = cloudopt.config.get();
              if (config.customRule.indexOf(text) > -1) {
                  new Noty({
                      text: cloudopt.i18n.get("optionTipsDontDuplicate"),
                      type: "error",
                      theme: "mint",
                      timeout: 3000
                  }).show();
              } else {
                  config.customRule[config.customRule.length] = text;
                  cloudopt.config.set(config, function () {
                      refresh();
                      cloudopt.message.send("refresh-config");
                      $("#customRuleInput").val("");
                  });
              }
          } else {
              new Noty({
                  text: cloudopt.i18n.get('urlErrorTips'),
                  type: "error",
                  theme: "mint",
                  timeout: 1000
              }).show();
          }
      });

      function change() {

          var name = arguments[0];
          var b = !$("#" + name).attr("checked");
          if (arguments[1] != undefined && arguments[1] != null) {
              b = arguments[1];
          }

          $("#" + name).attr("checked", b);
          var config = cloudopt.config.get();
          config[name] = b;
          cloudopt.config.set(config, function() {
              cloudopt.message.send("refresh-config");
          });


      }


  });

  function refresh() {
      cloudopt.config.refresh(function() {
          refreshAccount(function() {
              refreshWhiteList();
              refreshBlackList();
              refreshCustomRule();
              refreshCustomSubscription();
              refreshStatistics();
              refreshAnchorEvents();
              var config = cloudopt.config.get();
              for (var key in config) {
                  $("#" + key).attr("checked", config[key]);
                  if (config[key] && document.querySelector('#' + key + "-label") != undefined && document.querySelector('#' + key + "-label") != null && key != "whiteList") {
                      document.querySelector('#' + key + "-label").MaterialSwitch.on();
                  }
              }
          });
      });
  }


  function refreshWhiteList() {
      $("#whiteListVeiw").html("");
      var config = cloudopt.config.get();
      var template = "<tr><td  class='mdl-data-table__cell--non-numeric'>{{value}}</td><td><i class='material-icons mdl-list__item-avatar whiteListDelete'>delete</i></td></tr>"
      for (var i = 0; i < config.whiteList.length; i++) {
          var html = cloudopt.template.compile(template, DOMPurify.sanitize(config.whiteList[i]));
          $(html).appendTo("#whiteListVeiw");
      }
      $(".whiteListDelete").unbind();
      $(".whiteListDelete").click(function() {
          var text = $(this).parent().prev().html();
          var config = cloudopt.config.get();
          config.whiteList.removeByValue(text);
          cloudopt.config.set(config);
          $(this).parent().parent().css("display", "none");
          cloudopt.message.send("refresh-config");
      });
  }

  function refreshBlackList() {
      $("#blackListVeiw").html("");
      var config = cloudopt.config.get();
      var template = "<tr><td  class='mdl-data-table__cell--non-numeric'>{{value}}</td><td><i class='material-icons mdl-list__item-avatar blackListDelete'>delete</i></td></tr>"
      for (var i = 0; i < config.blackList.length; i++) {
          var html = cloudopt.template.compile(template, DOMPurify.sanitize(config.blackList[i]));
          $(html).appendTo("#blackListVeiw");
      }
      $(".blackListDelete").unbind();
      $(".blackListDelete").click(function () {
          var text = $(this).parent().prev().html();
          var config = cloudopt.config.get();
          config.blackList.removeByValue(text);
          cloudopt.config.set(config);
          $(this).parent().parent().css("display", "none");
          cloudopt.message.send("refresh-config");
      });
  }

  function refreshCustomRule() {
      $("#manualList").html("");
      var config = cloudopt.config.get();
      var template = "<tr ruleid='{{value}}'}><td class='mdl-data-table__cell--non-numeric'>{{value}}</td><td><i class='material-icons mdl-list__item-avatar manualDelete'>delete</i></td></tr>";
      for (var i = 0; i < config.customRule.length; i++) {
          var html = cloudopt.template.compile(template, i, DOMPurify.sanitize(config.customRule[i]));
          $(html).appendTo("#manualList");
      }
      $(".manualDelete").unbind();
      $(".manualDelete").click(function() {
          var text = $(this).parent().prev().html();
          config.customRule.remove(parseInt($(this).parent().parent().attr("ruleid")));
          cloudopt.config.set(config);
          cloudopt.message.send("refresh-config");
          $(this).parent().parent().css("display", "none");
      });
  }

  function refreshCustomSubscription() {
      $("#customSubscriptionList").html("");
      var config = cloudopt.config.get();
      var template = "<tr ruleid='{{value}}'}><td class='mdl-data-table__cell--non-numeric'>{{value}}</td><td><i class='material-icons mdl-list__item-avatar customSubscriptionDelete'>delete</i></td></tr>";
      for (var i = 0; i < config.customSubscription.length; i++) {
          var html = cloudopt.template.compile(template, i, DOMPurify.sanitize(config.customSubscription[i]));
          $(html).appendTo("#customSubscriptionList");
      }
      $(".customSubscriptionDelete").unbind();
      $(".customSubscriptionDelete").click(function() {
          var text = $(this).parent().prev().html();
          config.customSubscription.remove(parseInt($(this).parent().parent().attr("ruleid")));
          cloudopt.config.set(config);
          cloudopt.message.send("refresh-config");
          $(this).parent().parent().css("display", "none");
      });
  }

  function refreshAccount(callback) {
      callback();
      $.ajax({
          url: cloudopt.host + "account/auth",
          type: "get",
          contentType: "application/json;charset=UTF-8",
          data: {
              apikey: cloudopt.apikey
          },
          success: function(data) {
              window.loged = true;
              if (data.result.head.indexOf("http") >= 0 || data.result.head.indexOf("https") >= 0) {
                  $("#account .head").attr('src', data.result.head);
              } else {
                  $("#account .head").attr('src', "https://cdn.cloudopt.net/image/" + data.result.head + "-head");
              }

              $("#account .tips").html(cloudopt.i18n.replace("optionAccountLogedTips", data.result.nickname));
              $("#account .button-1").html(cloudopt.i18n.get("optionAccountProfile"));
              $("#account .button-1").attr("href", "https://www.cloudopt.net/account/profile");
              $("#account .button-2").html(cloudopt.i18n.get("optionAccountLogout"));
              $("#account .button-2").removeClass("hidden");
              $("#account .button-2").click(function(event) {
                  $.ajax({
                      url: cloudopt.host + "account/auth",
                      type: "delete",
                      contentType: "application/json;charset=UTF-8",
                      data: {
                          apikey: cloudopt.apikey
                      },
                      async: true,
                      success: function(data) {
                          window.location.reload();
                      },
                      error: function(XMLHttpRequest, textStatus, errorThrown) {

                      }
                  });
              });

              $("#speedup").unbind("click");
              $("#speedup input").removeAttr('disabled');
              $("#speedup label").attr("class", "mdl-switch mdl-js-switch mdl-js-ripple-effect mdl-js-ripple-effect--ignore-events is-upgraded");
              cloudopt.config.asyncAcquireConfig()
              callback();
          },
          error: function(XMLHttpRequest, textStatus, errorThrown) {
              cloudopt.config.refresh(function() {
                  var config = cloudopt.config.get();
                  config["dnsSpeed"] = false;
                  config["webPrereading"] = false;
                  config["memoryOptimize"] = false;
                  cloudopt.config.set(config, function() {
                      cloudopt.message.send("refresh-config");
                      callback();
                  });
              });

          }
      });
  }

function refreshStatistics() {
    cloudopt.statistics.getCount("adblock", function(count) {
        count = parseInt(count);
        if (isNaN(count)) {
            count = 0;
        }
        $('#statistics #totalAdBlockCount').html(count);
    });
    cloudopt.statistics.getCount("site-block", function(count) {
        count = parseInt(count);
        if (isNaN(count)) {
            count = 0;
        }
        $('#statistics #totalSiteBlockCount').html(count);
    });
    cloudopt.statistics.getCount("prerender", function(count) {
        count = parseInt(count);
        if (isNaN(count)) {
            count = 0;
        }
        $('#statistics #totalPrerender').html(count);
    });
    cloudopt.statistics.getCount("adblock-today", function(count) {
        count = parseInt(count);
        if (isNaN(count)) {
            count = 0;
        }
        $('#statistics #todayAdBlockCount').html(count);
    });
    cloudopt.statistics.getCount("site-block-today", function(count) {
        count = parseInt(count);
        if (isNaN(count)) {
            count = 0;
        }
        $('#statistics #todaySiteBlockCount').html(count);
    });
}

function refreshAnchorEvents() {
    // To avoid the QQBrowser anchor issue in option page
    if (cloudopt.utils.getRawUa().indexOf("QQBrowser") >= 0) {
        $('a:not(.evented)').off("click");
        $("a:not(.evented)").click(function(e) {
            e.preventDefault();
            cloudopt.tab.open($(this).attr("href"));
        });
    }
}