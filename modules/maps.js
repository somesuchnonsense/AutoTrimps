//Radon
MODULES.maps.RMapTierZone = [72, 47, 16];
MODULES.maps.RMapTier0Sliders = [9, 9, 9, "Mountain"];
MODULES.maps.RMapTier1Sliders = [9, 9, 9, "Depths"];
MODULES.maps.RMapTier2Sliders = [9, 9, 9, "Random"];
MODULES.maps.RMapTier3Sliders = [9, 9, 9, "Random"];
MODULES.maps.RshouldFarmCell = 59;
MODULES.maps.RSkipNumUnboughtPrestiges = 2;
MODULES.maps.RUnearnedPrestigesRequired = 2;

function RupdateAutoMapsStatus(get) {

    var status;

    //Fail Safes
    if (getPageSetting('RAutoMaps') == 0) status = 'Off';

    else if (Rshouldcastle && game.global.totalVoidMaps <= 0) status = 'Frozen Castle';
    else if (contractVoid) status = 'Contract';
    else if (Rshouldshipfarm) status = 'Ship Farming';
    else if (Rshouldequipfarm) status = 'Equip Farming to ' + equipfarmdynamicHD().toFixed(2) + " and " + estimateEquipsForZone()[2] + " Equality";
    else if (Rshouldstormfarm) status = 'Storm Farming to ' + stormdynamicHD().toFixed(2);
    else if (Rshouldinsanityfarm) status = 'Insanity Farming';
    else if (Rshouldalchfarm) status = 'Alchemy Farming';
    else if (Rshouldhypofarm) status = 'Hypo Farming';
    else if (Rshouldmayhem == 1) status = 'Mayhem Attack';
    else if (Rshouldmayhem == 2) status = 'Mayhem Health';
    else if (Rshouldpanda) status = 'Pandemonium';
    else if (Rshoulddopraid) status = 'Praiding';
    else if (Rdshoulddopraid) status = 'Daily Praiding';
    else if (Rshoulddoquest) status = 'Questing';
    else if (Rshouldtimefarm) status = 'Time Farming';
    else if (Rdshouldtimefarm) status = 'Daily Time Farming';
    else if (Rshouldtributefarm) status = 'Tribute Farming';
    else if (Rshoulddobogs) status = 'Black Bogs';
    else if (RdoMaxMapBonus) status = 'Max Map Bonus After Zone';
    else if (RvanillaMAZ) status = 'Vanilla MAZing';
    else if (!game.global.mapsUnlocked) status = '&nbsp;';
    else if (RneedPrestige && !RdoVoids) status = 'Prestige';
    else if (RdoVoids) {
        var stackedMaps = Fluffy.isRewardActive('void') ? countStackedVoidMaps() : 0;
        status = 'Void Maps: ' + game.global.totalVoidMaps + ((stackedMaps) ? " (" + stackedMaps + " stacked)" : "") + ' remaining';
    } else if (RshouldFarm && !RdoVoids) status = 'Farming: ' + RcalcHDratio().toFixed(4) + 'x';
    else if (!RenoughHealth && !RenoughDamage) status = 'Want Health & Damage';
    else if (!RenoughDamage) status = 'Want ' + RcalcHDratio().toFixed(4) + 'x &nbspmore damage';
    else if (!RenoughHealth) status = 'Want more health';
    else if (RenoughHealth && RenoughDamage) status = 'Advancing';

    var getPercent = (game.stats.heliumHour.value() / (game.global.totalRadonEarned - (game.global.radonLeftover + game.resources.radon.owned))) * 100;
    var lifetime = (game.resources.radon.owned / (game.global.totalRadonEarned - game.resources.radon.owned)) * 100;
    var hiderStatus = 'Rn/hr: ' + getPercent.toFixed(3) + '%<br>&nbsp;&nbsp;&nbsp;Rn: ' + lifetime.toFixed(3) + '%';

    if (get) {
        return [status, getPercent, lifetime];
    } else {
        document.getElementById('autoMapStatus').innerHTML = status;
        document.getElementById('hiderStatus').innerHTML = hiderStatus;
    }
}

//RAutoMaps

function RautoMap() {

    //Failsafes
    if (!game.global.mapsUnlocked || RcalcOurDmg("avg", false, true) <= 0 || Rshoulddoquest == 6) {
        RenoughDamage = true;
        RenoughHealth = true;
        RshouldFarm = false;
        RupdateAutoMapsStatus();
        return;
    }

    //Calc
    var ourBaseDamage = RcalcOurDmg("avg", false, true);
    var ourBaseHealth = RcalcOurHealth();
    var enemyDamage = RcalcBadGuyDmg(null, RgetEnemyMaxAttack(game.global.world, 50, 'Snimp', 1.0));
    var enemyHealth = RcalcEnemyHealth(game.global.world);
    var mapenoughdamagecutoff = getPageSetting("Rmapcuntoff");

    if (getPageSetting('RDisableFarm') > 0) {
        RshouldFarm = (RcalcHDratio() >= getPageSetting('RDisableFarm'));
        if (game.options.menu.repeatUntil.enabled == 1 && RshouldFarm)
            toggleSetting('repeatUntil');
    }
    var hitsSurvived = 10;
    if (getPageSetting("Rhitssurvived") > 0) hitsSurvived = getPageSetting("Rhitssurvived");
    RenoughHealth = (ourBaseHealth > (hitsSurvived * enemyDamage));
    RenoughDamage = (RcalcHDratio() <= mapenoughdamagecutoff);

    RupdateAutoMapsStatus();

    //Map Options
    var customVars = MODULES["maps"];
    if (game.global.repeatMap == true && !game.global.mapsActive && !game.global.preMapsActive) repeatClicked();
    if ((game.options.menu.repeatUntil.enabled == 1 || game.options.menu.repeatUntil.enabled == 2 || game.options.menu.repeatUntil.enabled == 3) && !game.global.mapsActive && !game.global.preMapsActive) toggleSetting('repeatUntil');
    if (game.options.menu.exitTo.enabled != 0) toggleSetting('exitTo');
    if (game.options.menu.repeatVoids.enabled != 0) toggleSetting('repeatVoids');

    //Void Vars
    var voidMapLevelSetting = 0;
    var voidMapLevelSettingCell = ((getPageSetting('Rvoidscell') > 0) ? getPageSetting('Rvoidscell') : 70);
    var voidMapLevelPlus = 0;
    if (game.global.challengeActive != "Daily" && getPageSetting('RVoidMaps') > 0) {
        voidMapLevelSetting = getPageSetting('RVoidMaps');
    }
    if (game.global.challengeActive == "Daily" && getPageSetting('RDailyVoidMod') >= 1) {
        voidMapLevelSetting = getPageSetting('RDailyVoidMod');
    }
    if (getPageSetting('RRunNewVoidsUntilNew') != 0 && game.global.challengeActive != "Daily") {
        voidMapLevelPlus = getPageSetting('RRunNewVoidsUntilNew');
    }
    if (getPageSetting('RdRunNewVoidsUntilNew') != 0 && game.global.challengeActive == "Daily") {
        voidMapLevelPlus = getPageSetting('RdRunNewVoidsUntilNew');
    }

    RneedToVoid = (voidMapLevelSetting > 0 && game.global.totalVoidMaps > 0 && game.global.lastClearedCell + 1 >= voidMapLevelSettingCell &&
        (
            (game.global.world == voidMapLevelSetting) ||
            (voidMapLevelPlus < 0 && game.global.world >= voidMapLevelSetting) ||
            (voidMapLevelPlus > 0 && game.global.world >= voidMapLevelSetting && game.global.world <= (voidMapLevelSetting + voidMapLevelPlus))
        )
    );

    var voidArrayDoneS = [];
    if (game.global.challengeActive != "Daily" && getPageSetting('Ronlystackedvoids') == true) {
        for (var mapz in game.global.mapsOwnedArray) {
            var theMapz = game.global.mapsOwnedArray[mapz];
            if (theMapz.location == 'Void' && theMapz.stacked > 0) {
                voidArrayDoneS.push(theMapz);
            }
        }
    }

    if (
        (game.global.totalVoidMaps <= 0) ||
        (!RneedToVoid) ||
        (getPageSetting('Rnovmsc2') == true && game.global.runningChallengeSquared) ||
        (game.global.challengeActive != "Daily" && game.global.totalVoidMaps > 0 && getPageSetting('Ronlystackedvoids') == true && voidArrayDoneS.length < 1)
    ) {
        RdoVoids = false;
    }

    //Contract
    if (autoBattle.activeContract != '') {
        if (getPageSetting('RABsolve') == true && contractVoid) {
            RneedToVoid = true;
            RdoVoids = true;
        }
    }

    //Quest
    var Rquestfarming = false;
    Rshoulddoquest = false;
    Rquestfarming = (game.global.world > 5 && game.global.challengeActive == "Quest" && questcheck() > 0);

    if (Rquestfarming) {
        if (questcheck() == 3) Rshoulddoquest = 3;
        else if (questcheck() == 4 && RcalcHDratio() > 0.95 && (((new Date().getTime() - game.global.zoneStarted) / 1000 / 60) < 121)) Rshoulddoquest = 4;
        else if (questcheck() == 6) Rshoulddoquest = 6;
        else if (questcheck() == 7 && !canAffordBuilding('Smithy')) Rshoulddoquest = 7;
        else if (questcheck() == 10 || questcheck() == 20) Rshoulddoquest = 10;
        else if (questcheck() == 11 || questcheck() == 21) Rshoulddoquest = 11;
        else if (questcheck() == 12 || questcheck() == 22) Rshoulddoquest = 12;
        else if (questcheck() == 13 || questcheck() == 23) Rshoulddoquest = 13;
        else if (questcheck() == 14 || questcheck() == 24) Rshoulddoquest = 14;
    }

    //Quest Shield
    if (game.global.world < 6 && (Rquestshieldzone != 0 || Rquestequalityscale != false)) {
        Rquestshieldzone = 0;
        Rquestequalityscale = false;
    }
    if (Rquestfarming && questcheck() == 5 && ((game.global.soldierEnergyShieldMax / enemyDamage) < RcalcHDratio()) && game.portal.Equality.scalingActive && !game.global.mapsActive) {
        toggleEqualityScale();
        Rquestshieldzone = game.global.world;
        Rquestequalityscale = true;
    }
    if (game.global.world > 5 && game.global.challengeActive == "Quest" && Rquestshieldzone > 0 && !game.portal.Equality.scalingActive && game.global.world > Rquestshieldzone && Rquestequalityscale) {
        toggleEqualityScale();
        Rquestequalityscale = false;
    }

    //### Map Modules found in mapfunctions.js

    //Farming
    var selectedMap = "world";

    RshouldDoMaps = false;
    Rshouldtimefarm = false;
    Rdshouldtimefarm = false;
    Rshouldtributefarm = false;
    Rshoulddobogs = false;
    Rshoulddopraid = false;
    Rdshoulddopraid = false;
    Rshouldinsanityfarm = false;
    Rshouldalchfarm = false;
    Rshouldhypofarm = false;
    Rhyposhouldwood = true;
    Rshouldstormfarm = false;
    Rshouldequipfarm = false;
    Rshouldshipfarm = false;
    contractVoid = false;
    Rshouldmayhem = 0;
    Rshouldpanda = false;
    RvanillaMAZ = false;

    if (ourBaseDamage > 0) {
        RshouldDoMaps = (!RenoughDamage || RshouldFarm);
    }
    var shouldDoHealthMaps = false;
    if (game.global.mapBonus >= getPageSetting('RMaxMapBonuslimit') && !RshouldFarm)
        RshouldDoMaps = false;
    else if (game.global.mapBonus < getPageSetting('RMaxMapBonushealth') && !RenoughHealth && !RshouldDoMaps) {
        RshouldDoMaps = true;
        shouldDoHealthMaps = true;
    }
    var restartVoidMap = false;

    //Map Bonus
    var maxMapBonusZ = getPageSetting('RMaxMapBonusAfterZone');
    RdoMaxMapBonus = (maxMapBonusZ >= 0 && game.global.mapBonus < getPageSetting("RMaxMapBonuslimit") && game.global.world >= maxMapBonusZ);
    if (RdoMaxMapBonus) {
        RshouldDoMaps = true;
    }

    //MAZ
    if (game.options.menu.mapAtZone.enabled && game.global.canMapAtZone) {
        let setZone = game.options.menu.mapAtZone.getSetZone();
        for (var x = 0; x < setZone.length; x++) {
            if (!setZone[x].on) continue;
            if (game.global.world < setZone[x].world || game.global.world > setZone[x].through) continue;
            if (setZone[x].times === -1 && game.global.world !== setZone[x].world) continue;
            if (setZone[x].times > 0 && (game.global.world - setZone[x].world) % setZone[x].times !== 0) continue;
            if (setZone[x].cell === game.global.lastClearedCell + 2) {
                RvanillaMAZ = true;
                if (setZone.until == 6) game.global.mapCounterGoal = 25;
                if (setZone.until == 7) game.global.mapCounterGoal = 50;
                if (setZone.until == 8) game.global.mapCounterGoal = 100;
                if (setZone.until == 9) game.global.mapCounterGoal = setZone.rx;
                break;
            }
        }

        //Toggle void repeat on if it's disabled.
        if (RvanillaMAZ) {
            if (game.options.menu.repeatVoids.enabled != 1) toggleSetting('repeatVoids');
            return RupdateAutoMapsStatus();
        }
    }

    //Time Farm
    if (getPageSetting('Rtimefarm') || (game.global.challengeActive == 'Daily' && getPageSetting('Rdtimefarm') == 2)) {
        RtimeFarm(true, false, false, false, false);
    }

    //dTime Farm
    if (game.global.challengeActive == 'Daily' && getPageSetting('Rdtimefarm') == 1) {
        RtimeFarm(true, false, false, false, true);
    }

    //Tribute Farm
    if (getPageSetting('Rtributefarm')) {
        RtributeFarm(true, false, false, false);
    }

    //Bogs
    if (game.global.world > 5 && (game.global.challengeActive == "Quagmire" && getPageSetting('Rblackbog') == true && getPageSetting('Rblackbogzone')[0] > 0 && getPageSetting('Rblackbogamount')[0] > 0)) {
        Rbogs();
    }

    //Praid
    var Rdopraid = false;
    Rdopraid = (game.global.world > 5 && (((getPageSetting('RAMPraid') == true) || (game.global.challengeActive == "Daily" && getPageSetting('RdAMPraid') == 2)) && getPageSetting('RAMPraidzone')[0] > 0 && getPageSetting('RAMPraidraid')[0] > 0));
    if (game.global.challengeActive == 'Daily' && getPageSetting('RdAMPraid') != 2) {
        Rdopraid = false;
    }
    if (Rdopraid) {
        RPraid(false);
    }
    if (!Rshoulddopraid && (RAMPrepMap1 != undefined || RAMPrepMap2 != undefined || RAMPrepMap3 != undefined || RAMPrepMap4 != undefined || RAMPrepMap5 != undefined)) {
        RAMPreset(false);
    }

    //dPraid
    var Rddopraid = false;
    Rddopraid = (game.global.challengeActive == "Daily" && game.global.world > 5 && (getPageSetting('RdAMPraid') == 1 && getPageSetting('RdAMPraidzone')[0] > 0 && getPageSetting('RdAMPraidraid')[0] > 0));
    if (Rddopraid) {
        RPraid(true);
    }
    if (!Rdshoulddopraid && (RdAMPrepMap1 != undefined || RdAMPrepMap2 != undefined || RdAMPrepMap3 != undefined || RdAMPrepMap4 != undefined || RdAMPrepMap5 != undefined)) {
        RAMPreset(true);
    }

    //Mayhem
    if (game.global.challengeActive == "Mayhem") {
        var Rdomayhem = false;
        Rdomayhem = (game.global.world > 5 && game.global.challengeActive == "Mayhem" && getPageSetting('Rmayhemon') == true && (getPageSetting('Rmayhemhealth') == true || getPageSetting('Rmayhemattack') == true));
        if (Rdomayhem) {
            Rmayhem();
        }
    }

    //Panda
    if (game.global.challengeActive == "Pandemonium") {
        var Rdopanda = false;
        Rdopanda = (game.global.world >= getPageSetting('Rpandazone') && game.global.challengeActive == "Pandemonium" && getPageSetting('Rpandaon') == true);
        if (Rdopanda && game.challenges.Pandemonium.pandemonium > 0 && getPageSetting('Rpandamaps') == true) {
            Rshouldpanda = true;
        }
    }

    //Insanity
    if (game.global.challengeActive == "Insanity") {
        var insanityfarmzone = getPageSetting('Rinsanityfarmzone');
        var insanitystacksfarmindex = insanityfarmzone.indexOf(game.global.world);
        var insanityfarmcell = ((getPageSetting('Rinsanityfarmcell') != 0) ? getPageSetting('Rinsanityfarmcell')[insanitystacksfarmindex] : 1);
        Rinsanityfarm = (getPageSetting('Rinsanityon') == true && ((insanityfarmcell <= 1) || (insanityfarmcell > 1 && (game.global.lastClearedCell + 1) >= insanityfarmcell)) && game.global.world > 5 && (game.global.challengeActive == "Insanity" && getPageSetting('Rinsanityfarmzone')[0] > 0 && getPageSetting('Rinsanityfarmstack')[0] > 0));
        if (Rinsanityfarm) {
            Rinsanity(true, false, false);
        }
        Rinsanity(false, false, true);
    }

    //Storm
    if (game.global.challengeActive == "Storm") {
        Rstormfarm = (getPageSetting('Rstormon') == true && game.global.world > 5 && (game.global.challengeActive == "Storm" && getPageSetting('Rstormzone') > 0 && getPageSetting('RstormHD') > 0 && getPageSetting('Rstormmult') > 0));
        if (Rstormfarm) {
            Rstorm(true);
        }
    }

    //Ship
    if (game.jobs.Worshipper.locked == 0) {
        var shipfarmcell = ((getPageSetting('Rshipfarmcell') > 0) ? getPageSetting('Rshipfarmcell') : 1);
        Rshipfarm = (game.jobs.Worshipper.locked == 0 && getPageSetting('Rshipfarmon') == true && ((shipfarmcell <= 1) || (shipfarmcell > 1 && (game.global.lastClearedCell + 1) >= shipfarmcell)) && game.global.world > 5 && (getPageSetting('Rshipfarmzone')[0] > 0 && getPageSetting('Rshipfarmamount')[0] > 0));
        if (Rshipfarm) {
            Rship(true, false, false);
        }
        Rship(false, false, true);
    }
    //Alch
    if (game.global.challengeActive == "Alchemy") {
        var alchfarmzone = getPageSetting('Ralchfarmzone');
        var alchstacksfarmindex = alchfarmzone.indexOf(game.global.world);
        var alchfarmcell = ((getPageSetting('Ralchfarmcell') != 0) ? getPageSetting('Ralchfarmcell')[alchstacksfarmindex] : 1);
        Ralchfarm = (getPageSetting('Ralchon') == true && ((alchfarmcell <= 1) || (alchfarmcell > 1 && (game.global.lastClearedCell + 1) >= alchfarmcell)) && game.global.world > 5 && (game.global.challengeActive == "Alchemy" && getPageSetting('Ralchfarmzone')[0] > 0 && getPageSetting('Ralchfarmstack').length > 0));
        if (Ralchfarm) {
            Ralch(true, false, false);
        }
        Ralch(false, false, true);
    }

    //Hypo
    Rshouldcastle = false;
    if (game.global.challengeActive == "Hypothermia") {
        if (game.global.world >= getPageSetting('Rhypocastle')) {
            Rshouldcastle = true;
        }
        var hypofarmzone = getPageSetting('Rhypofarmzone');
        var hypoamountfarmindex = hypofarmzone.indexOf(game.global.world);
        var hypofarmcell = ((getPageSetting('Rhypofarmcell') != 0) ? getPageSetting('Rhypofarmcell')[hypoamountfarmindex] : 1);
        Rhypofarm = (getPageSetting('Rhypoon') == true && ((hypofarmcell <= 1) || (hypofarmcell > 1 && (game.global.lastClearedCell + 1) >= hypofarmcell)) && game.global.world > 5 && (game.global.challengeActive == "Hypothermia" && getPageSetting('Rhypofarmzone')[0] > 0 && getPageSetting('Rhypofarmstack').length > 0));
        if (Rhypofarm) {
            Rhypo(true, false, false);
        }
        Rhypo(false, false, true);
    }

    //Equip Farming
    Requipfarm = (getPageSetting('Requipfarmon') == true && game.global.world > 5 && (getPageSetting('Requipfarmzone') > 0 && getPageSetting('RequipfarmHD') > 0 && getPageSetting('Requipfarmmult') > 0));
    if (Requipfarm) {
        var equipfarmzone = getPageSetting('Requipfarmzone');
        var metal = game.resources.metal.owned
        var metalneeded = estimateEquipsForZone()[0];

        if (game.global.world >= equipfarmzone && metal < metalneeded) {
            Rshouldequipfarm = true;
        }
    }

    //### Map selection section

    //Map Selection
    var obj = {};
    for (var map in game.global.mapsOwnedArray) {
        if (!game.global.mapsOwnedArray[map].noRecycle) {
            obj[map] = game.global.mapsOwnedArray[map].level;
        }
    }
    var keysSorted = Object.keys(obj).sort(function(a, b) {
        return obj[b] - obj[a];
    });
    var highestMap;
    var lowestMap;
    if (keysSorted[0]) {
        highestMap = keysSorted[0];
        lowestMap = keysSorted[keysSorted.length - 1];
    } else
        selectedMap = "create";

    //### Specific maps that take priority over everything else that can be found in mapfunctions.js

    //Uniques
    var runUniques = (getPageSetting('RAutoMaps') == 1);
    if (runUniques || Rshoulddobogs || Rshouldcastle) {
         for (var map in game.global.mapsOwnedArray) {
            var theMap = game.global.mapsOwnedArray[map];
            if (Rshoulddobogs && theMap.name == 'The Black Bog') {
                selectedMap = theMap.id;
                break;
            } else if (runUniques && theMap.noRecycle) {
                if (theMap.name == 'Big Wall' && !game.upgrades.Bounty.allowed && !game.upgrades.Bounty.done && game.global.highestRadonLevelCleared < 40) {
                    if (game.global.world < 8 && RcalcHDratio() > 4) continue;
                    selectedMap = theMap.id;
                    break;
                }
                if (theMap.name == 'Dimension of Rage' && document.getElementById("portalBtn").style.display == "none" && game.upgrades.Rage.done == 1) {
                    if (game.global.challenge != "Unlucky" && (game.global.world < 16 || RcalcHDratio() < 2)) continue;
                    selectedMap = theMap.id;
                    break;
                }
                if (getPageSetting('Rprispalace') == true && theMap.name == 'Prismatic Palace' && game.mapUnlocks.Prismalicious.canRunOnce) {
                    if (game.global.world < 21 || RcalcHDratio() > 25) continue;
                    selectedMap = theMap.id;
                    break;
                }
                var meltingpoint = [10000, 10000];
                if (getPageSetting('Rmeltpoint')[0] > 0 && getPageSetting('Rmeltpoint')[1] >= 0) meltingpoint = getPageSetting('Rmeltpoint');
                if (theMap.name == 'Melting Point' && ((game.global.challengeActive == "Trappapalooza" && game.global.world >= meltingpoint[0] && ((game.global.lastClearedCell + 1) >= meltingpoint[1])) || (game.global.challengeActive == "Melt" && game.global.world >= meltingpoint[0] && ((game.global.lastClearedCell + 1) >= meltingpoint[1])) || (getPageSetting('Rmeltsmithy') > 0 && getPageSetting('Rmeltsmithy') <= game.buildings.Smithy.owned && game.mapUnlocks.SmithFree.canRunOnce))) {
                    if (game.global.world < 50 || (game.global.world == 50 && game.global.lastClearedCell < 55)) continue;
                    selectedMap = theMap.id;
                    break;
                }
                if (game.global.challengeActive == "Hypothermia" && getPageSetting('Rhypocastle') > 0 && theMap.name == 'Frozen Castle' && game.global.world >= getPageSetting('Rhypocastle')) {
                    if (getPageSetting('Rhypovoids') == true && game.global.totalVoidMaps <= 0) {
                        selectedMap = theMap.id;
                        break;
                    }
                    if (getPageSetting('Rhypovoids') == false) {
                        selectedMap = theMap.id;
                        break;
                    }
                }
                if (game.global.challengeActive != "Hypothermia" && getPageSetting('Rfrozencastle') != -1 && theMap.name == 'Frozen Castle' && game.global.world >= getPageSetting('Rfrozencastle')[0] && ((game.global.lastClearedCell + 1) >= getPageSetting('Rfrozencastle')[1])) {
                    selectedMap = theMap.id;
                    break;
                }
            }
        }
    }

    //Voids
    if (RneedToVoid) {
        var voidArray = [];
        var prefixlist = {
            'Deadly': 10,
            'Heinous': 11,
            'Poisonous': 20,
            'Destructive': 30
        };
        var prefixkeys = Object.keys(prefixlist);
        var suffixlist = {
            'Descent': 7.077,
            'Void': 8.822,
            'Nightmare': 9.436,
            'Pit': 10.6
        };
        var suffixkeys = Object.keys(suffixlist);

        for (var map in game.global.mapsOwnedArray) {
            var theMap = game.global.mapsOwnedArray[map];
            if (theMap.location == 'Void') {
                for (var pre in prefixkeys) {
                    if (theMap.name.includes(prefixkeys[pre]))
                        theMap.sortByDiff = 1 * prefixlist[prefixkeys[pre]];
                }
                for (var suf in suffixkeys) {
                    if (theMap.name.includes(suffixkeys[suf]))
                        theMap.sortByDiff += 1 * suffixlist[suffixkeys[suf]];
                }
                voidArray.push(theMap);
            }
        }

        var voidArraySorted = voidArray.sort(function(a, b) {
            return a.sortByDiff - b.sortByDiff;
        });
        for (var map in voidArraySorted) {
            var theMap = voidArraySorted[map];
            RdoVoids = true;
            if (getPageSetting('RDisableFarm') <= 0)
                RshouldFarm = RshouldFarm || false;
            if (!restartVoidMap)
                selectedMap = theMap.id;
            break;
        }
    }

    //### Automaps automatic part

    //Raiding - split off from the rest to make it easier
    if (Rshoulddopraid) {
        if (selectedMap == "world") {
            selectedMap = "createp";
        }
    }

    if (Rdshoulddopraid) {
        if (selectedMap == "world") {
            selectedMap = "dcreatep";
        }
    }

    //Everything else - mostly stuff from mapfunctions.js but also some important bits like voids or general farming
    RselectMap(selectedMap);

    //Getting to Map Creation and Repeat.
    if (!game.global.preMapsActive && game.global.mapsActive) {
        var doDefaultMapBonus = game.global.mapBonus < getPageSetting('RMaxMapBonuslimit') - 1;
        if ((RvanillaMAZ) ||
            (Rshoulddopraid || (Rshoulddopraid && RAMPfragfarming)) ||
            (Rdshoulddopraid || (Rdshoulddopraid && RdAMPfragfarming)) ||
            (Rshouldinsanityfarm || (Rshouldinsanityfarm && Rinsanityfragfarming)) ||
            (Rshouldalchfarm || (Rshouldalchfarm && Ralchfragfarming)) ||
            (Rshouldhypofarm || (Rshouldhypofarm && Rhypofragfarming)) ||
            (selectedMap == game.global.currentMapId && (!getCurrentMapObject().noRecycle && (doDefaultMapBonus || RvanillaMAZ || RdoMaxMapBonus || RshouldFarm || Rshouldtimefarm || Rdshouldtimefarm || Rshouldtributefarm || Rshoulddobogs || Rshoulddoquest > 0 || Rshouldmayhem > 0 || Rshouldpanda || Rshouldstormfarm || Rshouldequipfarm ||
                (Rshouldshipfarm || (Rshouldshipfarm && Rshipfragfarming)))))) {
            if (!game.global.repeatMap) {
                repeatClicked();
            }
            if (Rshoulddopraid && !RAMPfragfarming) {
                if (game.options.menu.repeatUntil.enabled != 2) {
                    game.options.menu.repeatUntil.enabled = 2;
                }
            } else if ((Rshoulddopraid && RAMPfragfarming) || (Rshouldinsanityfarm && Rinsanityfragfarming) || (Rshouldalchfarm && Ralchfragfarming) || (Rshouldhypofarm && Rhypofragfarming) || (Rshouldshipfarm && Rshipfragfarming)) {
                if (game.options.menu.repeatUntil.enabled != 0) {
                    game.options.menu.repeatUntil.enabled = 0;
                }
            }
            if (Rdshoulddopraid && !RdAMPfragfarming) {
                if (game.options.menu.repeatUntil.enabled != 2) {
                    game.options.menu.repeatUntil.enabled = 2;
                }
            } else if ((Rdshoulddopraid && RdAMPfragfarming) || (Rshouldinsanityfarm && Rinsanityfragfarming) || (Rshouldalchfarm && Ralchfragfarming) || (Rshouldhypofarm && Rhypofragfarming) || (Rshouldshipfarm && Rshipfragfarming)) {
                if (game.options.menu.repeatUntil.enabled != 0) {
                    game.options.menu.repeatUntil.enabled = 0;
                }
            }
            if (!Rshoulddopraid && !RAMPfragfarming && !Rdshoulddopraid && !RdAMPfragfarming && !Rshouldinsanityfarm && !Rinsanityfragfarming && !Rshouldalchfarm && !Rshouldhypofarm && !Rhypofragfarming && !Ralchfragfarming && !Rshoulddobogs && !RshouldDoMaps && !Rshouldtimefarm && !Rdshouldtimefarm && !Rshouldtributefarm && Rshoulddoquest <= 0 && Rshouldmayhem <= 0 && !Rshouldpanda && !Rshouldstormfarm && !Rshouldequipfarm && !Rshouldshipfarm && !Rshipfragfarming) {
                repeatClicked();
            }
            if (shouldDoHealthMaps && game.global.mapBonus >= getPageSetting('RMaxMapBonushealth')) {
                repeatClicked();
                shouldDoHealthMaps = false;
            }
            if (RdoMaxMapBonus && game.global.mapBonus < getPageSetting('RMaxMapBonuslimit')) {
                repeatClicked();
                RdoMaxMapBonus = false;
            }
            if (game.global.repeatMap && Rshoulddoquest == 3 && game.global.mapBonus >= 4) {
                repeatClicked();
            }
            if (game.global.repeatMap && Rshoulddopraid && RAMPfragfarming && RAMPfrag() == true) {
                repeatClicked();
            }
            if (game.global.repeatMap && Rdshoulddopraid && RdAMPfragfarming && RdAMPfrag() == true) {
                repeatClicked();
            }
            if (game.global.repeatMap && Rshouldinsanityfarm && Rinsanityfragfarming && insanityfrag() == true) {
                repeatClicked();
            }
            if (game.global.repeatMap && Rshouldalchfarm && Ralchfragfarming && alchfrag() == true) {
                repeatClicked();
            }
            if (game.global.repeatMap && Rshouldhypofarm && Rhypofragfarming && hypofrag() == true) {
                repeatClicked();
            }
            if (game.global.repeatMap && Rshouldshipfarm && Rshipfragfarming && shipfrag() == true) {
                repeatClicked();
            }

        } else {
            if (game.global.repeatMap) {
                repeatClicked();
            }
            if (restartVoidMap) {
                mapsClicked(true);
            }
        }
    } else if (!game.global.preMapsActive && !game.global.mapsActive) {
        if (selectedMap != "world") {
            if (!game.global.switchToMaps) {
                mapsClicked();
            }
            if (RdoVoids && game.global.switchToMaps &&
                (RdoVoids ||
                    (!RenoughDamage && RenoughHealth && game.global.lastClearedCell < 9) ||
                    (RshouldFarm && game.global.lastClearedCell >= customVars.RshouldFarmCell) ||
                    (RscryerStuck)) &&
                (
                    (game.resources.trimps.realMax() <= game.resources.trimps.owned + 1) ||
                    (RdoVoids && game.global.lastClearedCell > 70)
                )
            ) {
                if (RscryerStuck) {
                    debug("Got perma-stuck on cell " + (game.global.lastClearedCell + 2) + " during scryer stance. Are your scryer settings correct? Entering map to farm to fix it.");
                }
                mapsClicked();
            }
        }

        //Creating Map
    } else if (game.global.preMapsActive) {
        if (selectedMap == "world") {
            mapsClicked();
        } else if (selectedMap == "createp") {
            RAMP();
        } else if (selectedMap == "dcreatep") {
            dRAMP();
        } else if (selectedMap == "create") {
            document.getElementById("mapLevelInput").value = game.global.world;
            var decrement;
            var tier;
            if (game.global.world >= customVars.RMapTierZone[0]) {
                tier = customVars.RMapTier0Sliders;
                decrement = [];
            } else if (game.global.world >= customVars.RMapTierZone[1]) {
                tier = customVars.RMapTier1Sliders;
                decrement = ['loot'];
            } else if (game.global.world >= customVars.RMapTierZone[2]) {
                tier = customVars.RMapTier2Sliders;
                decrement = ['loot'];
            } else {
                tier = customVars.RMapTier3Sliders;
                decrement = ['diff', 'loot'];
            }
            sizeAdvMapsRange.value = tier[0];
            adjustMap('size', tier[0]);
            difficultyAdvMapsRange.value = tier[1];
            adjustMap('difficulty', tier[1]);
            lootAdvMapsRange.value = tier[2];
            adjustMap('loot', tier[2]);
            biomeAdvMapsSelect.value = autoTrimpSettings.Rmapselection.selected == "Gardens" ? "Plentiful" : autoTrimpSettings.Rmapselection.selected;
            updateMapCost();
            if (RshouldFarm || game.global.challengeActive == 'Transmute') {
                biomeAdvMapsSelect.value = game.global.decayDone ? "Plentiful" : "Forest";
                updateMapCost();
            }
            if (Rshouldinsanityfarm && !Rshouldtimefarm && !Rdshouldtimefarm && !Rshouldtributefarm && !Rshoulddoquest && !Rshouldequipfarm && !Rshouldshipfarm && !Rshouldalchfarm && !Rshouldhypofarm) {
                RinsanityMap();
            }
            if (Rshouldalchfarm && !Rshouldhypofarm && !Rshouldtimefarm && !Rdshouldtimefarm && !Rshouldtributefarm && !Rshoulddoquest && !Rshouldequipfarm && !Rshouldshipfarm) {
                RalchMap();
            }
            if (Rshouldhypofarm && !Rshouldtimefarm && !Rdshouldtimefarm && !Rshouldtributefarm && !Rshoulddoquest && !Rshouldequipfarm) {
                RhypoMap();
            }
            if (Rshouldshipfarm && !Rshouldtimefarm && !Rdshouldtimefarm && !Rshouldtributefarm && !Rshoulddoquest && !Rshouldequipfarm) {
                RshipMap();
            }
            if (Rshouldtimefarm && !Rdshouldtimefarm && !Rshouldtributefarm && !Rshoulddoquest) {
                RtimeFarmMap(false);
            }
            if (Rdshouldtimefarm && !Rshouldtributefarm && !Rshoulddoquest) {
                RtimeFarmMap(true);
            }
            if (Rshouldtributefarm && !Rshoulddoquest) {
                RtributeFarmMap();
            }
            if (Rshoulddoquest) {
                biomeAdvMapsSelect.value = "Plentiful";
                if (Rshoulddoquest == 4) {
                    document.getElementById("advSpecialSelect").value = "hc";
                    updateMapCost();
                    if (updateMapCost(true) > game.resources.fragments.owned) {
                        document.getElementById("advSpecialSelect").value = "fa";
                        updateMapCost();
                        if (updateMapCost(true) > game.resources.fragments.owned) {
                            document.getElementById("advSpecialSelect").value = 0;
                            updateMapCost();
                        }
                    }
                }
                if (Rshoulddoquest == 7) {
                    document.getElementById("advSpecialSelect").value = "hc";
                    updateMapCost();
                    if (updateMapCost(true) > game.resources.fragments.owned) {
                        document.getElementById("advSpecialSelect").value = "lc";
                        updateMapCost();
                        if (updateMapCost(true) > game.resources.fragments.owned) {
                            document.getElementById("advSpecialSelect").value = "fa";
                            updateMapCost();
                            if (updateMapCost(true) > game.resources.fragments.owned) {
                                document.getElementById("advSpecialSelect").value = 0;
                                updateMapCost();
                            }
                        }
                    }
                }
                if (Rshoulddoquest == 10) {
                    document.getElementById("advSpecialSelect").value = "lsc";
                    updateMapCost();
                    if (updateMapCost(true) > game.resources.fragments.owned) {
                        document.getElementById("advSpecialSelect").value = "ssc";
                        updateMapCost();
                        if (updateMapCost(true) > game.resources.fragments.owned) {
                            document.getElementById("advSpecialSelect").value = "fa";
                            updateMapCost();
                            if (updateMapCost(true) > game.resources.fragments.owned) {
                                document.getElementById("advSpecialSelect").value = 0;
                                updateMapCost();
                            }
                        }
                    }
                }
                if (Rshoulddoquest == 11) {
                    document.getElementById("advSpecialSelect").value = "lwc";
                    updateMapCost();
                    if (updateMapCost(true) > game.resources.fragments.owned) {
                        document.getElementById("advSpecialSelect").value = "swc";
                        updateMapCost();
                        if (updateMapCost(true) > game.resources.fragments.owned) {
                            document.getElementById("advSpecialSelect").value = "fa";
                            updateMapCost();
                            if (updateMapCost(true) > game.resources.fragments.owned) {
                                document.getElementById("advSpecialSelect").value = 0;
                                updateMapCost();
                            }
                        }
                    }
                }
                if (Rshoulddoquest == 12) {
                    document.getElementById("advSpecialSelect").value = "lmc";
                    updateMapCost();
                    if (updateMapCost(true) > game.resources.fragments.owned) {
                        document.getElementById("advSpecialSelect").value = "smc";
                        updateMapCost();
                        if (updateMapCost(true) > game.resources.fragments.owned) {
                            document.getElementById("advSpecialSelect").value = "fa";
                            updateMapCost();
                            if (updateMapCost(true) > game.resources.fragments.owned) {
                                document.getElementById("advSpecialSelect").value = 0;
                                updateMapCost();
                            }
                        }
                    }
                }
                if (Rshoulddoquest == 13) {
                    document.getElementById("advSpecialSelect").value = "fa";
                    updateMapCost();
                    if (updateMapCost(true) > game.resources.fragments.owned) {
                        document.getElementById("advSpecialSelect").value = 0;
                        updateMapCost();
                    }
                }
                if (Rshoulddoquest == 14) {
                    document.getElementById("advSpecialSelect").value = "fa";
                    updateMapCost();
                    if (updateMapCost(true) > game.resources.fragments.owned) {
                        document.getElementById("advSpecialSelect").value = 0;
                        updateMapCost();
                    }
                }
                if (updateMapCost(true) > game.resources.fragments.owned) {
                    biomeAdvMapsSelect.value = "Random";
                    updateMapCost();
                }
            }
            if (Rshouldmayhem > 0 && getPageSetting('Rmayhemmap') == 2 && !Rshouldtimefarm && !Rdshouldtimefarm) {
                mapLevelInput.value = game.global.world;
                biomeAdvMapsSelect.value = "Random";
                document.getElementById("advSpecialSelect").value = "fa";
                document.getElementById("advExtraLevelSelect").value = RmayhemExtra();
                updateMapCost();
                if (updateMapCost(true) > game.resources.fragments.owned) {
                    console.log("cant afford this shit dumbass btw mayhemextra is " + RmayhemExtra());
                }
            }
            if (Rshouldpanda && getPageSetting('Rpandamaps') == true && !Rshouldtimefarm && !Rdshouldtimefarm) {
                mapLevelInput.value = game.global.world;
                biomeAdvMapsSelect.value = "Random";
                document.getElementById("advSpecialSelect").value = "fa";
                document.getElementById("advExtraLevelSelect").value = RpandaExtra();
                updateMapCost();
                if (updateMapCost(true) > game.resources.fragments.owned) {
                    console.log("Cant afford this shit dumbass btw pandaextra is " + RpandaExtra());
                }
            }
            if (Rshouldequipfarm) {
                mapLevelInput.value = game.global.world + RequipExtra();
                biomeAdvMapsSelect.value = "Plentiful";
                document.getElementById("advSpecialSelect").value = "lmc";
                document.getElementById("advExtraLevelSelect").value = 0;
                updateMapCost();
            }
            if (updateMapCost(true) > game.resources.fragments.owned) {
                if (!RenoughDamage) decrement.push('diff');
                if (RshouldFarm) decrement.push('size');
            }
            while (decrement.indexOf('loot') > -1 && lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                lootAdvMapsRange.value -= 1;
            }
            while (decrement.indexOf('diff') > -1 && difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                difficultyAdvMapsRange.value -= 1;
            }
            while (decrement.indexOf('size') > -1 && sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                sizeAdvMapsRange.value -= 1;
            }
            while (lootAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                lootAdvMapsRange.value -= 1;
            }
            while (difficultyAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                difficultyAdvMapsRange.value -= 1;
            }
            while (sizeAdvMapsRange.value > 0 && updateMapCost(true) > game.resources.fragments.owned) {
                sizeAdvMapsRange.value -= 1;
            }
            var maplvlpicked = parseInt(document.getElementById("mapLevelInput").value);
            if (updateMapCost(true) > game.resources.fragments.owned) {
                selectMap(game.global.mapsOwnedArray[highestMap].id);
                debug("Can't afford the map we designed, #" + maplvlpicked, "maps", '*crying2');
                debug("...selected our highest map instead # " + game.global.mapsOwnedArray[highestMap].id + " Level: " + game.global.mapsOwnedArray[highestMap].level, "maps", '*happy2');
                runMap();
                RlastMapWeWereIn = getCurrentMapObject();
            } else {
                debug("Buying a Map, level: #" + maplvlpicked, "maps", 'th-large');
                var result = buyMap();
                if (result == -2) {
                    debug("Too many maps, recycling now: ", "maps", 'th-large');
                    recycleBelow(true);
                    debug("Retrying, Buying a Map, level: #" + maplvlpicked, "maps", 'th-large');
                    result = buyMap();
                    if (result == -2) {
                        recycleMap(lowestMap);
                        result = buyMap();
                        if (result == -2)
                            debug("AutoMaps unable to recycle to buy map!");
                        else
                            debug("Retrying map buy after recycling lowest level map");
                    }
                }
            }
        } else {
            selectMap(selectedMap);
            var themapobj = game.global.mapsOwnedArray[getMapIndex(selectedMap)];
            var levelText;
            if (themapobj.level > 0) {
                levelText = " Level: " + themapobj.level;
            } else {
                levelText = " Level: " + game.global.world;
            }
            var voidorLevelText = themapobj.location == "Void" ? " Void: " : levelText;
            debug("Running selected " + selectedMap + voidorLevelText + " Name: " + themapobj.name, "maps", 'th-large');
            runMap();
            RlastMapWeWereIn = getCurrentMapObject();
        }
    }
}
