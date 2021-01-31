Pebble.addEventListener("ready", function () {
    console.log("ready");
    require("pebblejs");
    var UI = require("pebblejs/ui");
    var Vibe = require("pebblejs/ui/vibe");
    var Light = require("pebblejs/ui/light");
    var Feature = require('pebblejs/platform/feature')
    var Vector2 = require('pebblejs/lib/vector2');
    var Settings = require('pebblejs/settings');
    var Clay = require('./clay');
    var clayConfig = require('./config');
    var clay = new Clay(clayConfig, null, { autoHandleEvents: false });

    /*
    const DISTANCE_SMALL_CM = "cm"
    const DISTANCE_SMALL_IN = "in"
    const DISTANCE_LARGE_KM = "km"
    const DISTANCE_LARGE_MI = "km"
    const TEMP_C = "C"
    const TEMP_C = "F"

    */
    function makesections(array) {
        sections = [{
            title: "Resort"
        }]
        for (var i = 0, len = array.length; i < len; ++i) {
            sections.push({
                title: array[i]
            })
        }
        return sections
    }

    function getdata(snow, vis, rain, precip, hum, ob) {
        ret = []

        if (ob["freshsnow_cm"] != null) {
            ret.push({
                title: "Fresh snow",
                subtitle: ob["freshsnow_cm"] + " cm"
            })
        }
        ret.push({
            title: "Visibility",
            subtitle: vis + " km"
        })
        ret.push({
            title: "Precipitation",
            subtitle: precip + " cm"
        })
        ret.push({
            title: "Snow/Rain",
            subtitle: snow + " cm | " + rain + " cm"
        })
        ret.push({
            title: "Humidity",
            subtitle: hum + "%"
        })

        if (ob["temp_avg_c"] != null) {
            ret.push({
                title: "Temperature",
                subtitle: ob["temp_avg_c"] + " C" + " (" + ob["temp_max_c"] + " C / " + ob["temp_min_c"] + " C )"
            })
        }
        if (ob["feelslike_c"] != null) {
            ret.push({
                title: "Feels like",
                subtitle: ob["feelslike_c"] + " C"
            })
        }
        if (ob["winddir_deg"] != null) {
            ret.push({
                title: "Wind",
                subtitle: ob["winddir_deg"] + " deg (" + ob["winddir_compass"] + ")"
            })
        }
        if (ob["windspd_kmh"] != null) {
            ret.push({
                title: "Windspeed",
                subtitle: ob["windspd_kmh"] + " km/h"
            })
        }
        if (ob["windgst_kmh"] != null) {
            ret.push({
                title: "Wind gust",
                subtitle: ob["windgst_kmh"] + " km/h"
            })
        }


        return [
            { items: ret }
        ]
    }


    function loaddata() {
        var xhr = new XMLHttpRequest()
        xhr.open("GET", "https://api.weatherunlocked.com/api/resortforecast/" + Settings.option('resortid') + "?app_id=" + Settings.option('apiid') + "&app_key=" + Settings.option('apikey') + "&hourly_interval=6&num_of_days=" + Settings.option('daystoshow'), true)
        xhr.setRequestHeader("Accept", "application/json");

        xhr.onload = function () {
            if (xhr.readyState === xhr.DONE) {
                if (xhr.status === 200) {
                    slopebuddy(xhr)
                } else {
                    var error = new UI.Card({
                        title: "Request failed",
                        body: "Status code " + xhr.statusText + "\n" + xhr.responseText.substring(10),
                        subtitleColor: "indigo",
                        bodyColor: Feature.color("cyan", "white"),
                        titleColor: "white",
                        backgroundColor: "black"
                    });
                    error.show();
                }
            }
        }
        xhr.send(null)
    }
    Pebble.addEventListener('showConfiguration', function (e) {
        Pebble.openURL(clay.generateUrl());
    });

    Pebble.addEventListener('webviewclosed', function (e) {
        if (e && !e.response) {
            return;
        }
        var dict = clay.getSettings(e.response);

        // Save the Clay settings to the Settings module. 
        Settings.option(dict);
        loaddata();
    });
    var main = new UI.Window();
    var elemtitle = new UI.Text({
        textAlign: "center",
        size: new Vector2(80, 150),
        position: new Vector2(35, 54),
        text: "Slope Buddy"
    });
    var elemsubtitle = new UI.Text({
        textAlign: "center",
        size: new Vector2(80, 150),
        position: new Vector2(30, 84),
        text: "Time to ski",
        color: Feature.color("cyan", "white"),
    });
    var elemrect = new UI.Line({
        position: new Vector2(10, 84),
        position2: new Vector2(130, 84),
        strokeColor: 'white',
        strokeWidth: 7
    });
    main.add(elemtitle);
    main.add(elemrect);
    main.add(elemsubtitle);

    main.show();

    function slopebuddy(xhr) {
        var obj = JSON.parse(xhr.responseText)
        forecastitems = {}
        for (var i = 0, len = obj["forecast"].length; i < len; ++i) {
            var item = obj["forecast"][i];
            if (item["date"] in forecastitems) {
                forecastitems[item["date"]].push(item)
            } else {
                forecastitems[item["date"]] = [item]
            }
        }

        var forecast = new UI.Menu({
            backgroundColor: "black",
            textColor: "white",
            highlightBackgroundColor: Feature.color('cyan', 'black'),
            highlightTextColor: "black",
            sections: makesections(Object.keys(forecastitems))
        });
        forecast.item(0, 0, { title: obj["name"] });
        Object.entries(forecastitems).forEach(([key, value], index) => {
            for (var i = 0, len = value.length; i < len; ++i) {
                item = value[i];
                forecast.item(index + 1, i, {
                    title: item["time"], icon: "images/" + item["base"]["wx_icon"].replace(".gif", ".png"), subtitle: "S: " + item["snow_mm"] + "mm V:" + item["vis_km"] + " km"
                });
            }
        });
        forecast.on('select', function (e) {
            if (e.sectionIndex == 0) {
                var resortinfo = new UI.Card({
                    title: "Resort info",
                    body: "Name " + obj["name"],
                    subtitleColor: "indigo",
                    bodyColor: Feature.color("cyan", "white"),
                    titleColor: "white",
                    backgroundColor: "black"
                });
                resortinfo.show();
            } else {
                sectiondaykey = makesections(Object.keys(forecastitems))[e.sectionIndex]
                item = forecastitems[sectiondaykey["title"]][e.itemIndex]
                var forecastmenu = new UI.Menu({
                    backgroundColor: "black",
                    textColor: "white",
                    highlightBackgroundColor: Feature.color("cyan", "black"),
                    highlightTextColor: "black",
                    sections: [{
                        items: [{
                            title: 'Base',
                        },
                        {
                            title: 'Mid'
                        }, {
                            title: 'Upper'
                        }]
                    }]
                });
                forecastmenu.on('select', function (btn) {
                    showdatafrom = "base"
                    switch (btn.itemIndex) {
                        case 0:
                            // Base
                            showdatafrom = "base"

                            break;
                        case 1:
                            // Mid
                            showdatafrom = "mid"

                            break;
                        case 2:
                            // Upper
                            showdatafrom = "upper"
                            break;
                    }
                    var seshinfo = new UI.Menu({
                        title: item[showdatafrom]["wx_desc"],
                        sections: getdata(item["snow_mm"], item["vis_km"], item["rain_mm"], item["precip_mm"], item["hum_pct"], item[showdatafrom]),
                        textColor: "white",
                        backgroundColor: "black",
                        highlightTextColor: "black",
                        highlightBackgroundColor: Feature.color("cyan", "black"),
                        fullscreen: true
                    });
                    seshinfo.show();
                })
                forecastmenu.show();

            }
        })
        Vibe.vibrate('short');
        Light.trigger();
        forecast.show();
    }
    if (typeof Settings.option('apiid') == "undefined" || typeof Settings.option('apikey') == "undefined" || typeof Settings.option('resortid') == "undefined") {
        var error_card = new UI.Card({
            title: 'ERROR',
            body: 'API ID, API Key and/or Resort ID not configured, open settings in Pebble app and configure Slope Buddy!',
            subtitleColor: Feature.color("red", "white"),
            bodyColor: Feature.color("red", "white"),
            titleColor: Feature.color("red", "white"),
            backgroundColor: "black",
            scrollable: true
        });
        error_card.show();
        Vibe.vibrate('double');
        Light.trigger();
        Pebble.openURL(clay.generateUrl());
    } else {

        loaddata()
    }
});
