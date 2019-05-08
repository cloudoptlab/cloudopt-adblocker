cloudopt.store.get("version", function(item) {
    if (cloudopt.getVersion() != item) {
        Push.create(cloudopt.i18n.get("updateTipsTitle"), {
            body: cloudopt.i18n.get("updateTips1") + cloudopt.getVersion() + cloudopt.i18n.get("updateTips2"),
            icon: {
                x16: '/image/icon/default/icon@0,25x.png',
                x32: '/image/icon/default/icon@0,25x.png'
            },
            timeout: 10000
        });
        cloudopt.static.send("Update Versoion");
        cloudopt.store.set("version", cloudopt.getVersion());
        $.getJSON("https://cdn.cloudopt.net/extensions/update/updates.json", function(data) {
          try {
            if (cloudopt.getLanguage() == "zh-CN") {
                cloudopt.tab.open(data[cloudopt.getVersion()].cn);
            } else {
                cloudopt.tab.open(data[cloudopt.getVersion()].us);
            }
          } catch (e) {

          }
        });
        /*Compatible settings*/
        if (item == undefined || item == null) {
            item = "0.0.0";
        }
        var intBeforeVersion = parseInt(item.replace(/[&\|\\\*^%$#@\-,.，。\s]/g, "").substring(0, 3));
        if (intBeforeVersion < 110) {
            var config = cloudopt.config.get();
            config.customRule = [];
            cloudopt.config.set(config);
        }

        if(intBeforeVersion < 122){
          cloudopt.config.refresh(function(){
            var config = cloudopt.config.get();
            config.safePotential = false;
            cloudopt.config.set(config);
          });
        }

        Push.create(cloudopt.i18n.get("adblockInitTitle"), {
            body: cloudopt.i18n.get("adblockInitTips"),
            icon: {
                x16: '/image/icon/default/icon@0,25x.png',
                x32: '/image/icon/default/icon@0,25x.png'
            },
            timeout: 10000
        });

    }

    cloudopt.store.set("version", cloudopt.getVersion());
});
