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

    var dayjs = require("dayjs")
    customParseFormat = require('dayjs/plugin/customParseFormat')

    var metric = "metric"
    var imperial = "imperial"
    const units = {
        DISTANCE_SMALL: "DISTANCE_SMALL",
        DISTANCE_LARGE: "DISTANCE_LARGE",
        ACCUMULATION: "ACCUMULATION",
        TEMPERATURE: "TEMPERATURE",
        SPEED: "SPEED",
    }
    var timelineicons = {
        "Blizzard": "CLOUDY_DAY",
        "Clear": "TIMELINE_SUN",
        "CloudRainThunder": "HEAVY_RAIN",
        "CloudSleetSnowThunder": "RAINING_AND_SNOWING",
        "Cloudy": "PARTLY_CLOUDY",
        "Fog": "CLOUDY_DAY",
        "FreezingDrizzle": "LIGHT_RAIN",
        "FreezingFog": "CLOUDY_DAY",
        "FreezingRain": "HEAVY_RAIN",
        "HeavyRain": "HEAVY_RAIN",
        "HeavyRainSwrsDay": "HEAVY_RAIN",
        "HeavyRainSwrsNight": "HEAVY_RAIN",
        "HeavySleet": "HEAVY_RAIN",
        "HeavySleetSwrsDay": "HEAVY_RAIN",
        "HeavySleetSwrsNight": "HEAVY_RAIN",
        "HeavySnow": "HEAVY_SNOW",
        "HeavySnowSwrsDay": "HEAVY_SNOW",
        "HeavySnowSwrsNight": "HEAVY_SNOW",
        "IsoRainSwrsDay": "LIGHT_RAIN",
        "IsoRainSwrsNight": "LIGHT_RAIN",
        "IsoSleetSwrsDay": "LIGHT_RAIN",
        "IsoSleetSwrsNight": "LIGHT_RAIN",
        "IsoSnowSwrsDay": "LIGHT_SNOW",
        "IsoSnowSwrsNight": "LIGHT_SNOW",
        "ModRain": "LIGHT_RAIN",
        "ModRainSwrsDay": "LIGHT_RAIN",
        "ModRainSwrsNight": "LIGHT_RAIN",
        "ModSleet": "LIGHT_RAIN",
        "ModSleetSwrsDay": "LIGHT_RAIN",
        "ModSleetSwrsNight": "LIGHT_RAIN",
        "ModSnow": "LIGHT_SNOW",
        "ModSnowSwrsDay": "LIGHT_SNOW",
        "ModSnowSwrsNight": "LIGHT_SNOW",
        "OccLightRain": "LIGHT_RAIN",
        "OccLightSleet": "LIGHT_RAIN",
        "OccLightSnow": "LIGHT_SNOW",
        "Overcast": "CLOUDY_DAY",
        "PartCloudRainThunderDay": "HEAVY_RAIN",
        "PartCloudRainThunderNight": "LIGHT_RAIN",
        "PartCloudSleetSnowThunderDay": "LIGHT_SNOW",
        "PartCloudSleetSnowThunderNight": "LIGHT_SNOW",
        "PartlyCloudyDay": "PARTLY_CLOUDY",
        "PartlyCloudyNight": "PARTLY_CLOUDY",
        "Sunny": "TIMELINE_SUN",
        "mist": "CLOUDY_DAY",
        "Mist": "CLOUDY_DAY"

    }
    const tags = {
        FRESH_SNOW: {
            [metric]: "freshsnow_cm",
            [imperial]: "freshsnow_in"
        },
        VISIBILITY: {
            [metric]: "vis_km",
            [imperial]: "vis_mi"
        },
        PRECIPITATION: {
            [metric]: "precip_mm",
            [imperial]: "precip_in"
        },
        SNOW: {
            [metric]: "snow_mm",
            [imperial]: "snow_in"
        },
        RAIN: {
            [metric]: "rain_mm",
            [imperial]: "rain_in"
        },
        TEMP_AVG: {
            [metric]: "temp_avg_c",
            [imperial]: "temp_avg_f"
        },
        TEMP_MAX: {
            [metric]: "temp_max_c",
            [imperial]: "temp_max_f"
        },
        TEMP_MIN: {
            [metric]: "temp_min_c",
            [imperial]: "temp_min_f"
        },
        FEELSLIKE: {
            [metric]: "feelslike_c",
            [imperial]: "feelslike_f"
        },
        WINDPSEED: {
            [metric]: "windspd_kmh",
            [imperial]: "windspd_mph"
        },
        WINDGUST: {
            [metric]: "windgst_kmh",
            [imperial]: "windgst_mph"
        }
    }

    function getunits(unit) {
        selection = Settings.option('units') || metric
        switch (unit) {
            case units.DISTANCE_SMALL:
                if (selection == imperial)
                    return "in"
                if (selection == metric)
                    return "cm"
                break
            case units.DISTANCE_LARGE:
                if (selection == imperial)
                    return "mi"
                if (selection == metric)
                    return "km"
                break
            case units.ACCUMULATION:
                if (selection == imperial)
                    return "in"
                if (selection == metric)
                    return "mm"
                break
            case units.TEMPERATURE:
                if (selection == imperial)
                    return "°F"
                if (selection == metric)
                    return "°C"
                break
            case units.SPEED:
                if (selection == imperial)
                    return "m/h"
                if (selection == metric)
                    return "km/h"
                break
            default: return ""
        }
        return ""
    }
    function getdatatags(tag) {
        selection = Settings.option('units') || metric
        return tag[selection]
    }

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

    function getdefaultpoint() {
        if (typeof Settings.option("trackpoint") == "undefined") {
            return "upper"
        }
        return Settings.option("trackpoint")
    }
    function getdata(snow, vis, rain, precip, hum, ob) {
        ret = []

        if (ob[getdatatags(tags.FRESH_SNOW)] != null) {
            ret.push({
                title: "Fresh snow",
                subtitle: ob[getdatatags(tags.FRESH_SNOW)] + " " + getunits(units.DISTANCE_SMALL)
            })
        }
        ret.push({
            title: "Visibility",
            subtitle: vis + " " + getunits(units.DISTANCE_LARGE)
        })
        ret.push({
            title: "Precipitation",
            subtitle: precip + " " + getunits(units.ACCUMULATION)
        })
        ret.push({
            title: "Snow/Rain",
            subtitle: snow + " " + getunits(units.ACCUMULATION) + " | " + rain + " " + getunits(units.ACCUMULATION)
        })
        ret.push({
            title: "Humidity",
            subtitle: hum + "%"
        })

        if (ob[getdatatags(tags.TEMP_AVG)] != null) {
            ret.push({
                title: "Temperature",
                subtitle: ob[getdatatags(tags.TEMP_AVG)] + " " + getunits(units.TEMPERATURE) + " (" + ob[getdatatags(tags.TEMP_MAX)] + " " + getunits(units.TEMPERATURE) + " / " + ob[getdatatags(tags.TEMP_MIN)] + " " + getunits(units.TEMPERATURE) + " )"
            })
        }
        if (ob[getdatatags(tags.FEELSLIKE)] != null) {
            ret.push({
                title: "Feels like",
                subtitle: ob[getdatatags(tags.FEELSLIKE)] + " " + getunits(units.TEMPERATURE)
            })
        }
        if (ob["winddir_deg"] != null) {
            ret.push({
                title: "Wind",
                subtitle: ob["winddir_deg"] + " deg (" + ob["winddir_compass"] + ")"
            })
        }
        if (ob[getdatatags(tags.WINDPSEED)] != null) {
            ret.push({
                title: "Windspeed",
                subtitle: ob[getdatatags(tags.WINDPSEED)] + " " + getunits(units.SPEED)
            })
        }
        if (ob[getdatatags(tags.WINDGUST)] != null) {
            ret.push({
                title: "Wind gust",
                subtitle: ob[getdatatags(tags.WINDGUST)] + " " + getunits(units.SPEED)
            })
        }
        return [
            { items: ret }
        ]
    }

    function makedesc(data) {
        // [0]["items"].join('\n')
        ret = ""
        for (var i = 0, len = data[0]["items"].length; i < len; ++i) {
            var item = data[0]["items"][i];
            ret = ret + item["title"] + ": " + item["subtitle"] + "\n"
        }
        return ret
    }
    function pushpin(item, location, callback) {
        Pebble.getTimelineToken(function (token) {
            var xhr = new XMLHttpRequest()
            dayjs.extend(customParseFormat)
            dayfixed = dayjs(item["time"], "HH:mm").subtract(1, "hour")
            var pinid = "slopebuddy-" + item["date"].replace(/\//g, "_") + "-" + dayfixed.format("HHmm")
            xhr.open("PUT", "https://timeline-api.rebble.io/v1/user/pins/" + pinid, true)
            xhr.setRequestHeader("Content-Type", "application/json");
            xhr.setRequestHeader("X-User-Token", token);
            pintime = item["date"].split("/")[2] + "-" + item["date"].split("/")[1] + "-" + item["date"].split("/")[0]
            icon = timelineicons[item[getdefaultpoint()]["wx_icon"].replace(".gif", "")] !== undefined ? timelineicons[item[getdefaultpoint()]["wx_icon"].replace(".gif", "")] : "TIMELINE_SUN"

            var pinobject = {
                "id": pinid,
                "time": pintime + "T" + dayfixed.format("HH:mm") + ":00Z",
                "duration": 60,
                "layout": {
                    "type": "weatherPin",
                    "title": item[getdefaultpoint()]["wx_desc"],
                    "subtitle": item[getdefaultpoint()][getdatatags(tags.TEMP_MAX)] + "/" + item[getdefaultpoint()][getdatatags(tags.TEMP_MIN)],
                    "tinyIcon": "system://images/" + icon,
                    "largeIcon": "system://images/" + icon,
                    "locationName": location,
                    "body": makedesc(getdata(item[getdatatags(tags.SNOW)], item[getdatatags(tags.VISIBILITY)], item[getdatatags(tags.RAIN)], item[getdatatags(tags.PRECIPITATION)], item["hum_pct"], item[getdefaultpoint()]))
                },
                "actions": [
                    {
                        "title": "View base snow conditions",
                        "type": "openWatchApp",
                        "launchCode": 22
                    }
                ]
            }
            xhr.onload = function () {
                if (xhr.readyState === xhr.DONE) {
                    if (xhr.status === 200) {
                        callback("ok", item["time"])
                    } else {
                        callback("error: " + xhr.responseText.toString(), item["time"])
                    }
                }
            }
            xhr.send(JSON.stringify(pinobject))
        }, function (error) {
            callback("error", "")
        });
    }
    function pushnextday() {

        // STILL WIP
        var xhr = new XMLHttpRequest()
        xhr.open("GET", "https://api.weatherunlocked.com/api/resortforecast/" + Settings.option('resortid') + "?app_id=" + Settings.option('apiid') + "&app_key=" + Settings.option('apikey') + "&hourly_interval=6&num_of_days=2", true)
        xhr.setRequestHeader("Accept", "application/json");

        xhr.onload = function () {
            if (xhr.readyState === xhr.DONE) {
                if (xhr.status === 200) {
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
                    Object.entries(forecastitems).forEach(([key, value], index) => {
                        for (var i = 0, len = value.length; i < len; ++i) {
                            if (index == 0) {
                                continue
                            }
                            item = value[i];

                            pushpin(item, obj["name"], function (e, time) {
                                if (e == "ok") {
                                    if (time == "19:00") {
                                        Pebble.showSimpleNotificationOnPebble("Pins pushed!", "Might take a while for the pins to arrive in your timeline, sit tight, have a beer, and get ready for a day of shredding!");
                                    }
                                }
                            });
                        }
                    });

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

    function getresortinfo(resortname, callback) {

        text = ""
        var xhr = new XMLHttpRequest()
        xhr.open("GET", "https://liftie.info/api/resort/" + resortname, true)
        xhr.onload = function () {
            if (xhr.readyState === xhr.DONE) {
                if (xhr.status === 200) {
                    var obj = JSON.parse(xhr.responseText)
                    if (obj["open"]) {
                        text = text + "Status: open"
                    } else {
                        text = text + "Status: closed"
                    }
                    text = text + "\nLifts:"
                    text = text + "\n" + obj["lifts"]["stats"]["open"] + " open (" + obj["lifts"]["stats"]["percentage"]["open"] + "%)"
                    text = text + "\n" + obj["lifts"]["stats"]["closed"] + " closed (" + obj["lifts"]["stats"]["percentage"]["closed"] + "%)"

                    callback(text)
                } else {
                    callback("App version: 1.0")
                }
            }
        }
        xhr.send(null)

    }

    function getresortlifs(resortname) {
        var liftsmenu = new UI.Menu({
            backgroundColor: "black",
            textColor: "white",
            highlightBackgroundColor: Feature.color('cyan', 'white'),
            highlightTextColor: "black",
        });
        var xhr = new XMLHttpRequest()
        xhr.open("GET", "https://liftie.info/api/resort/" + resortname, true)
        xhr.onload = function () {
            if (xhr.readyState === xhr.DONE) {
                if (xhr.status === 200) {
                    var obj = JSON.parse(xhr.responseText)
                    for (var i = 0, len = Object.keys(obj["lifts"]["status"]).length; i < len; ++i) {
                        liftsmenu.item(0, i, {
                            title: Object.keys(obj["lifts"]["status"])[i], subtitle: obj["lifts"]["status"][Object.keys(obj["lifts"]["status"])[i]]
                        });
                    }
                    liftsmenu.show()
                }
            }
        }
        xhr.send(null)

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
                        body: "Status code " + xhr.statusText.toString() + "\n" + xhr.responseText.substring(10),
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
            highlightBackgroundColor: Feature.color('cyan', 'white'),
            highlightTextColor: "black",
            sections: makesections(Object.keys(forecastitems))
        });
        forecast.item(0, 0, { title: obj["name"] });
        Object.entries(forecastitems).forEach(([key, value], index) => {
            for (var i = 0, len = value.length; i < len; ++i) {
                item = value[i];
                forecast.item(index + 1, i, {
                    title: item["time"], icon: "images/" + item[getdefaultpoint()]["wx_icon"].replace(".gif", ".png"), subtitle: "S: " + item[getdatatags(tags.SNOW)] + " " + getunits(units.ACCUMULATION) + " V:" + item[getdatatags(tags.VISIBILITY)] + " " + getunits(units.DISTANCE_LARGE)
                });
            }
        });
        forecast.on('select', function (e) {
            if (e.sectionIndex == 0) {
                resortname = obj["name"]
                if (Settings.option('resortname') != "") {
                    resortname = Settings.option('resortname')
                }

                getresortinfo(resortname, function (data) {
                    var resortinfo = new UI.Card({
                        title: obj["name"],
                        body: data,
                        bodyColor: "white",
                        titleColor: "white",
                        backgroundColor: "black",
                        action: {
                            up: 'images/lifticon.png',
                            select: 'images/timelineicon.png',
                            backgroundColor: "white"
                        },
                        style: "small"
                    });
                    resortinfo.on('click', 'select', function () {
                        pushnextday();
                    });
                    resortinfo.on('click', 'up', function () {
                        getresortlifs(resortname)
                    })
                    resortinfo.show();
                })

            } else {
                sectiondaykey = makesections(Object.keys(forecastitems))[e.sectionIndex]
                item = forecastitems[sectiondaykey["title"]][e.itemIndex]
                var forecastmenu = new UI.Menu({
                    backgroundColor: "black",
                    textColor: "white",
                    highlightBackgroundColor: Feature.color("cyan", "white"),
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
                        sections: getdata(item[getdatatags(tags.SNOW)], item[getdatatags(tags.VISIBILITY)], item[getdatatags(tags.RAIN)], item[getdatatags(tags.PRECIPITATION)], item["hum_pct"], item[showdatafrom]),
                        textColor: "white",
                        backgroundColor: "black",
                        highlightTextColor: "black",
                        highlightBackgroundColor: Feature.color("cyan", "white"),
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
