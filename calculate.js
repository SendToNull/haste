function calculate() {
    var castingtime = document.getElementById("castingtime").value;
    var casting_speed = 1;
    var haste_rating_buffs = 0;
    if(document.hastecapform.heroism.checked == true) {
        casting_speed *= 1.3;
    }
    if(document.hastecapform.icyveins.checked == true) {
        casting_speed *= 1.2;
    }
    if(document.hastecapform.powerinfusion.checked == true) {
        casting_speed *= 1.2;
    }
    if(document.hastecapform.berserker.checked == true) {
        casting_speed *= 1.2;
    }
    if(document.hastecapform.mqg.checked == true) {
        haste_rating_buffs += 330;
    }
    if(document.hastecapform.quag.checked == true) {
        haste_rating_buffs += 320;
    }
    if(document.hastecapform.tsog.checked == true) {
        haste_rating_buffs += 175;
    }
    if(document.hastecapform.ash.checked == true) {
        haste_rating_buffs += 145;
    }
    if(document.hastecapform.drums.checked == true) {
        haste_rating_buffs += 80;
    }
    if(document.hastecapform.shroud.checked == true) {
        haste_rating_buffs += 32;
    }
    if(document.hastecapform.bont.checked == true) {
        haste_rating_buffs += 28;
    }
    if(document.hastecapform.mont.checked == true) {
        haste_rating_buffs += 38;
    }
    if(document.hastecapform.roa1.checked == true) {
        haste_rating_buffs += 31;
    }
    if(document.hastecapform.roa2.checked == true) {
        haste_rating_buffs += 31;
    }
    if(document.hastecapform.zdgd.checked == true) {
        haste_rating_buffs += 55;
    }
    if(document.hastecapform.waist.checked == true) {
        haste_rating_buffs += 32;
    }
    if(document.hastecapform.brooch.checked == true) {
        haste_rating_buffs += 33;
    }
    if(document.hastecapform.foot.checked == true) {
        haste_rating_buffs += 25;
    }
    if(document.hastecapform.loop.checked == true) {
        haste_rating_buffs += 27;
    }
    if(document.hastecapform.mab.checked == true) {
        haste_rating_buffs += 29;
    }
    if(document.hastecapform.pant.checked == true) {
        haste_rating_buffs += 45;
    }
    if(document.hastecapform.robe.checked == true) {
        haste_rating_buffs += 35;
    }
    if(document.hastecapform.drape.checked == true) {
        haste_rating_buffs += 25;
    }
    if(document.hastecapform.tierbelt.checked == true) {
        haste_rating_buffs += 29;
    }
    if(document.hastecapform.tierboots.checked == true) {
        haste_rating_buffs += 25;
    }
    if(document.hastecapform.tierbracers.checked == true) {
        haste_rating_buffs += 26;
    }
    if(document.hastecapform.omnipotence.checked == true) {
        haste_rating_buffs += 31;
    }
    if(document.hastecapform.sunflare.checked == true) {
        haste_rating_buffs += 23;
    }
    if(document.hastecapform.heart.checked == true) {
        haste_rating_buffs += 32;
    }
    var haste_rating_buffs_percent = haste_rating_buffs / 15.77 / 100;
    var haste_rating_total = eval(haste_rating_buffs);
    var haste_rating_total_percent = haste_rating_total / 15.77 / 100;
    var casting_speed_haste_rating = 1 + haste_rating_total_percent;
    var casting_speed_total = casting_speed * casting_speed_haste_rating;
    var gcd = 1.5 / (casting_speed * casting_speed_haste_rating);
    // Cap
    var haste_cap_gear_percent = (castingtime / casting_speed - haste_rating_buffs_percent) * 100 - 100;
    document.hastecapform.gear_percent_total.value = round(castingtime * 100 - 100) + "%";
    // Current
    document.hastecapform.gear_percent_current_total.value = round((casting_speed * casting_speed_haste_rating - 1) * 100) + "%";
    document.hastecapform.castingtime_current.value = round(castingtime / casting_speed_total) + "s";
    document.hastecapform.gcd_current.value = round(Math.max(1, gcd)) + "s";
}
function round(number) {
    return Math.round(number * 1000) / 1000;
}