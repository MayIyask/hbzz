/**
 * 游戏主逻辑模块
 */
(function(window) {
  'use strict';
  
  // ===== 升级系统 =====
  window.buyExp = function() {
    if (window.state.level >= 10) { window.showToast('满级', 'info'); return; }
    if (window.state.gold < 4) { window.showToast('金币不足', 'error'); return; }
    window.state.gold -= 4;
    window.state.exp += 4;
    while (window.state.exp >= window.expToNext(window.state.level) && window.state.level < 10) {
      window.state.exp -= window.expToNext(window.state.level);
      window.state.level++;
      window.showToast('升级! Lv' + window.state.level + ' 人口' + window.state.level, 'success');
    }
    if (window.state.level >= 10) window.state.exp = 0;
    window.renderAll();
  };
  
  // ===== 商店系统 =====
  window.getShopWeights = function() {
    var lv = window.state.level;
    return [Math.max(5, 70 - lv * 7), Math.max(5, 25 + lv - lv * 2), Math.max(0, 5 + lv * 3), Math.max(0, lv * 2 - 2), Math.max(0, lv - 3)];
  };
  
  window.genShop = function() {
    var sh = [];
    var ws = window.getShopWeights();
    for (var i = 0; i < 5; i++) {
      var pool = window.CHAR_DATA;
      var weights = pool.map(function(c) { return ws[c.cost - 1] || 1; });
      var total = weights.reduce(function(a, b) { return a + b; }, 0);
      var r = Math.random() * total;
      var picked = pool[0];
      for (var j = 0; j < pool.length; j++) {
        r -= weights[j];
        if (r <= 0) { picked = pool[j]; break; }
      }
      sh.push({ id: picked.id, sold: false });
    }
    return sh;
  };
  
  window.refreshShop = function() {
    if (window.battleRunning) return;
    if (window.state.gold < 2) { window.showToast('金币不足', 'error'); return; }
    window.state.gold -= 2;
    window.state.shop = window.genShop();
    window.renderAll();
  };
  
  window.buyChar = function(si) {
    if (window.battleRunning) return;
    var it = window.state.shop[si];
    if (!it || it.sold) return;
    var base = window.getCharBase(it.id);
    if (window.state.gold < base.cost) { window.showToast('金币不足', 'error'); return; }
    window.state.gold -= base.cost;
    it.sold = true;
    
    // 三合一检测
    var merged = false;
    var allSame = window.state.field.filter(function(c) { return c && c.id === it.id }).concat(
      window.state.bench.filter(function(c) { return c.id === it.id })
    );
    var byStar = {};
    allSame.forEach(function(c) {
      var s = c.star;
      if (!byStar[s]) byStar[s] = [];
      byStar[s].push(c);
    });
    var starKeys = Object.keys(byStar);
    for (var ki = 0; ki < starKeys.length; ki++) {
      var star = starKeys[ki];
      var chars = byStar[star];
      if (chars.length >= 2 && !merged) {
        var keep = chars[0];
        keep.star++;
        var rm = chars[1];
        var bi = window.state.bench.indexOf(rm);
        if (bi >= 0) { window.state.bench.splice(bi, 1); }
        else {
          var fi = window.state.field.indexOf(rm);
          if (fi >= 0) window.state.field[fi] = null;
        }
        window.showToast(base.name + ' 三合一升至 ' + keep.star + ' 星!', 'success');
        merged = true;
      }
    }
    if (!merged) {
      window.state.bench.push({ uid: window.makeUID(), id: it.id, star: 1, equips: [] });
    }
    window.renderAll();
  };
  
  // ===== 装备系统 =====
  window.addEquip = function(id) {
    window.state.equips.push(id);
    window.renderAll();
  };
  
  window.equipToChar = function(ch, eid) {
    if (!ch.equips) ch.equips = [];
    if (ch.equips.length >= 3) { window.showToast('装备栏满', 'error'); return; }
    ch.equips.push(eid);
    var idx = window.state.equips.indexOf(eid);
    if (idx >= 0) window.state.equips.splice(idx, 1);
    window.renderAll();
  };
  
  window.tryMergeEquip = function(eid1, eid2) {
    var e1 = window.getEquipBase(eid1);
    var e2 = window.getEquipBase(eid2);
    if (!e1 || !e2) return false;
    
    // 红钻+蓝钻 → 星徽秘典
    var isRedBlue = (e1.type === 'reddiamond' && e2.type === 'bluediamond') ||
                    (e1.type === 'bluediamond' && e2.type === 'reddiamond');
    if (isRedBlue) {
      window.removeOneEquip(eid1);
      window.removeOneEquip(eid2);
      window.state.equips.push('emblem_book');
      window.showToast('合成 星徽秘典!', 'success');
      window.renderAll();
      return true;
    }
    
    // 同种简易→进阶
    if (e1.id !== e2.id) return false;
    var adv = window.EQUIP_DB.find(function(e) { return e.from === e1.id; });
    if (!adv) return false;
    window.removeOneEquip(eid1);
    window.removeOneEquip(eid2);
    window.state.equips.push(adv.id);
    window.showToast('合成 ' + adv.name + '!', 'success');
    window.renderAll();
    return true;
  };
  
  window.removeOneEquip = function(eid) {
    for (var i = 0; i < window.state.equips.length; i++) {
      if (window.state.equips[i] === eid) {
        window.state.equips.splice(i, 1);
        return;
      }
    }
  };
  
  // ===== 晶矿系统 =====
  window.addCrystal = function() {
    var lv = window.state.level;
    var r = Math.random();
    var silverP = Math.max(.2, .5 - lv * .03);
    var blueP = Math.max(.2, .3 + lv * .01);
    var goldP = Math.min(.35, .15 + lv * .025);
    var t = r < silverP ? 'silver' : (r < silverP + blueP ? 'blue' : (r < silverP + blueP + goldP ? 'gold' : 'rainbow'));
    window.state.crystals.push({ id: window.makeUID(), type: t, x: 15 + Math.random() * 130, y: 15 + Math.random() * 130, opened: false });
    window.renderCrystals();
  };
  
  window.openCrystal = function(cry) {
    if (cry.opened) return;
    cry.opened = true;
    var rw = '';
    var t = cry.type;
    
    if (t === 'silver') {
      window.state.gold += 1;
      rw = '+1💰';
    } else if (t === 'blue') {
      if (Math.random() < .5) {
        var cs = window.CHAR_DATA.filter(function(c) { return c.cost === 2 || c.cost === 3; });
        var c = cs[Math.floor(Math.random() * cs.length)];
        if (window.state.bench.length < 12) window.state.bench.push({ uid: window.makeUID(), id: c.id, star: 1, equips: [] });
        rw = c.name;
      } else {
        var se = ['shoe1','drill1','battery1','sword1','gun1','star1','reddiamond1','bluediamond1'];
        window.addEquip(se[Math.floor(Math.random() * se.length)]);
        rw = window.getEquipBase(window.state.equips[window.state.equips.length - 1]).name;
      }
    } else if (t === 'gold') {
      if (Math.random() < .5) {
        var cs2 = window.CHAR_DATA.filter(function(c) { return c.cost === 3 || c.cost === 4; });
        var c2 = cs2[Math.floor(Math.random() * cs2.length)];
        if (window.state.bench.length < 12) window.state.bench.push({ uid: window.makeUID(), id: c2.id, star: 2, equips: [] });
        rw = c2.name + '★2';
      } else {
        window.addEquip('recruit5');
        rw = '五星招募卡';
      }
    } else {
      if (Math.random() < .5) {
        var cs3 = window.CHAR_DATA.filter(function(c) { return c.cost === 5; });
        var c3 = cs3[Math.floor(Math.random() * cs3.length)];
        if (window.state.bench.length < 12) window.state.bench.push({ uid: window.makeUID(), id: c3.id, star: 2, equips: [] });
        rw = c3.name + '★2';
      } else {
        var se3 = ['shoe3','drill3','battery3','sword3','gun3','star3','reddiamond3','bluediamond3'];
        window.addEquip(se3[Math.floor(Math.random() * se3.length)]);
        rw = window.getEquipBase(window.state.equips[window.state.equips.length - 1]).name;
      }
    }
    
    // 奖励弹出
    var area = document.getElementById('crystal-area');
    var rd = document.createElement('div');
    rd.className = 'crystal-reward';
    rd.textContent = rw;
    rd.style.left = cry.x + 'px';
    rd.style.top = cry.y + 'px';
    area.appendChild(rd);
    setTimeout(function() { rd.remove(); }, 900);
    window.renderAll();
  };
  
  // ===== 战斗核心 =====
  window.startBattle = async function() {
    if (window.battleRunning) return;
    if (window.state.bench.length > 9) { window.showToast('备战席溢出', 'error'); return; }
    var fc = window.state.field.filter(Boolean);
    if (!fc.length) { window.showToast('请先上场角色', 'error'); return; }
    if (!window.countFrontChars()) { window.showToast('至少需要一名前排角色', 'error'); return; }
    
    window.battleRunning = true;
    var bonds = window.calcBonds();
    var bonuses = window.sumBonuses(bonds);
    var allies = window.state.field.map(function(c, i) {
      if (!c) return null;
      var s = window.calcStats(c, bonuses);
      s.fieldIdx = i;
      s.isEnemy = false;
      s.energy = Math.round(s.maxEnergy * s.initEnergy);
      return s;
    }).filter(Boolean);
    var enemies = window.genEnemyTeam();
    
    var maxSP = 5;
    if (bonds['战技点'] && bonds['战技点'].tier >= 0) maxSP += 2;
    window.battleState = { sp: 3, maxSP: maxSP, actionCounter: 0, killCount: 0 };
    
    window.showScreen('battle-screen');
    var logEl = document.getElementById('battle-log');
    logEl.innerHTML = '';
    Object.entries(bonds).forEach(function(entry) {
      if (entry[1].tier >= 0) window.addLog(logEl, '<span class="log-bond">羁绊激活：' + entry[0] + '</span>');
    });
    
    var round = 0;
    while (allies.some(function(a) { return a.hp > 0 }) && enemies.some(function(e) { return e.hp > 0 }) && round < 30) {
      round++;
      window.addLog(logEl, '<br><b>— 回合 ' + round + ' —</b>');
      
      // 满能插队
      var ultReady = allies.filter(function(a) { return a.hp > 0 && a.energy >= a.maxEnergy; });
      for (var ui = 0; ui < ultReady.length; ui++) await window.execUlt(ultReady[ui], allies, enemies, logEl);
      
      var units = allies.filter(function(a) { return a.hp > 0 }).concat(enemies.filter(function(e) { return e.hp > 0 }));
      units.sort(function(a, b) { return b.spd - a.spd; });
      
      for (var ni = 0; ni < units.length; ni++) {
        var unit = units[ni];
        if (unit.hp <= 0) continue;
        window.battleState.actionCounter++;
        window.renderBattle(allies, enemies, unit.uid);
        await window.sleep(280);
        
        if (unit.isEnemy) await window.enemyAction(unit, allies, enemies, logEl);
        else await window.allyAction(unit, allies, enemies, logEl);
        
        // 满能插队
        var ur2 = allies.filter(function(a) { return a.hp > 0 && a.energy >= a.maxEnergy; });
        for (var u2 = 0; u2 < ur2.length; u2++) await window.execUlt(ur2[u2], allies, enemies, logEl);
        
        // DOT结算
        enemies.filter(function(e) { return e.hp > 0 && e.dots > 0 }).forEach(function(e) {
          var dd = Math.round(e.dots * 8);
          e.hp = Math.max(0, e.hp - dd);
          e.dots = Math.ceil(e.dots / 2);
          window.addLog(logEl, '<span class="log-dot">DoT：' + e.name + ' -' + dd + '</span>');
        });
        
        // 击杀掉落
        enemies.filter(function(e) { return e.hp <= 0 && !e._ct }).forEach(function(e) {
          e._ct = true;
          window.battleState.killCount++;
          window.addCrystal();
        });
        window.renderBattle(allies, enemies);
        await window.sleep(180);
      }
    }
    
    await window.sleep(400);
    var won = allies.some(function(a) { return a.hp > 0 });
    window.showResult(won, allies, enemies, bonuses);
    window.battleRunning = false;
  };
  
  // 盟友行动
  window.allyAction = async function(unit, allies, enemies, logEl) {
    var targets = enemies.filter(function(e) { return e.hp > 0; });
    if (!targets.length) return;
    var isBack = unit.pos === 'back';
    
    if (unit.skillType === '追击' && window.battleState.actionCounter - unit.actionCount >= 6) {
      unit.actionCount = window.battleState.actionCounter;
      await window.execSkill(unit, targets, allies, enemies, logEl);
      return;
    }
    
    if (isBack) {
      await window.execSkill(unit, targets, allies, enemies, logEl);
    } else {
      var spP = 0.3 + 0.14 * window.battleState.sp;
      var useSk = window.battleState.sp > 0 && Math.random() < spP;
      if (useSk) {
        window.battleState.sp--;
        window.addLog(logEl, '<span class="log-sp">消耗1SP (剩' + window.battleState.sp + ')</span>');
        await window.execSkill(unit, targets, allies, enemies, logEl);
      } else {
        await window.execNormal(unit, targets, allies, enemies, logEl);
        window.battleState.sp = Math.min(window.battleState.maxSP, window.battleState.sp + 1);
        window.addLog(logEl, '<span class="log-sp">普攻+1SP (' + window.battleState.sp + ')</span>');
      }
    }
    
    if (unit.skillType === '持续伤害' && targets.length) {
      var t = targets[Math.floor(Math.random() * targets.length)];
      t.dots += 1;
      window.addLog(logEl, '<span class="log-dot">' + unit.name + '天赋 +1DoT</span>');
    }
  };
  
  // 普攻执行
  window.execNormal = async function(unit, targets, allies, enemies, logEl) {
    unit.energy = Math.min(unit.maxEnergy, unit.energy + Math.round(unit.maxEnergy * 0.1));
    var st = unit.skillType;
    var t = window.pickT(targets);
    
    if (st === '持续伤害') {
      window.dealDmg(unit, t, 1);
      t.dots += 3;
      window.addLog(logEl, unit.name + '普攻→' + t.name + ' +3DoT');
      window.flashTarget(t.uid, 'red');
    } else if (st === '击破') {
      window.dealDmg(unit, t, 1);
      window.reduceTough(unit, t, 15, true);
      window.addLog(logEl, unit.name + '普攻→' + t.name + ' 削韧');
      window.flashTarget(t.uid, 'blue');
    } else if (st === '治疗') {
      var w = allies.filter(function(a) { return a.hp > 0 && a.hp < a.maxHp; }).sort(function(a, b) { return a.hp / a.maxHp - b.hp / b.maxHp; })[0];
      if (w) {
        var h = Math.round(unit.atk * 0.2 * (1 + unit.healMul) * (w.healBuff ? 1.5 : 1));
        w.hp = Math.min(w.maxHp, w.hp + h);
        window.addLog(logEl, '<span class="log-heal">' + unit.name + '治疗 ' + w.name + ' +' + h + '</span>');
        window.flashTarget(w.uid, 'green');
      } else {
        window.dealDmg(unit, t, 1);
        window.flashTarget(t.uid, 'red');
      }
    } else if (st === '护盾') {
      var w2 = allies.filter(function(a) { return a.hp > 0; }).sort(function(a, b) { return a.shield / a.maxHp - b.shield / b.maxHp; })[0] || allies.find(function(a) { return a.hp > 0; });
      if (w2) {
        var s = Math.round(unit.atk * 0.2);
        w2.shield = Math.min(w2.maxHp, w2.shield + s);
        window.addLog(logEl, '<span class="log-shield">' + unit.name + '护盾 ' + w2.name + ' +' + s + '</span>');
        window.flashTarget(w2.uid, 'white');
      } else {
        window.dealDmg(unit, t, 1);
        window.flashTarget(t.uid, 'red');
      }
    } else {
      window.dealDmg(unit, t, 1);
      window.addLog(logEl, unit.name + '普攻→' + t.name);
      window.flashTarget(t.uid, 'red');
    }
  };
  
  // 战技执行
  window.execSkill = async function(unit, targets, allies, enemies, logEl) {
    unit.energy = Math.min(unit.maxEnergy, unit.energy + Math.round(unit.maxEnergy * 0.2));
    var st = unit.skillType;
    
    if (st === '持续伤害') {
      targets.forEach(function(t) { window.dealDmg(unit, t, 1.2); t.dots += 3; window.flashTarget(t.uid, 'purple'); });
      window.addLog(logEl, '<span class="log-dot">' + unit.name + '战技 全体+3DoT</span>');
    } else if (st === '击破') {
      targets.forEach(function(t) { window.dealDmg(unit, t, 1.2); window.reduceTough(unit, t, 20, true); window.flashTarget(t.uid, 'blue'); });
      window.addLog(logEl, unit.name + '战技 全体削韧');
    } else if (st === '治疗') {
      allies.filter(function(a) { return a.hp > 0; }).forEach(function(a) {
        var h = Math.round(unit.atk * 0.15 * (1 + unit.healMul) * (a.healBuff ? 1.5 : 1));
        a.hp = Math.min(a.maxHp, a.hp + h);
        window.flashTarget(a.uid, 'green');
      });
      window.addLog(logEl, '<span class="log-heal">' + unit.name + '战技 全体治疗</span>');
    } else if (st === '追击') {
      targets.forEach(function(t) { window.dealDmg(unit, t, 1.5); window.flashTarget(t.uid, 'red'); });
      window.addLog(logEl, unit.name + '战技 追击全体');
    } else if (st === '护盾') {
      allies.filter(function(a) { return a.hp > 0; }).forEach(function(a) {
        var s = Math.round(unit.atk * 0.15);
        a.shield = Math.min(a.maxHp, a.shield + s);
        window.flashTarget(a.uid, 'white');
      });
      window.addLog(logEl, '<span class="log-shield">' + unit.name + '战技 全体护盾</span>');
    } else if (st === '群攻') {
      targets.forEach(function(t) { window.dealDmg(unit, t, 1.6); window.flashTarget(t.uid, 'red'); });
      window.addLog(logEl, unit.name + '战技 群攻');
    } else if (st === '能量') {
      var m = window.pickT(targets);
      window.dealDmg(unit, m, 2.2);
      window.flashTarget(m.uid, 'red');
      targets.filter(function(t) { return t !== m; }).slice(0, 2).forEach(function(t) {
        window.dealDmg(unit, t, 1.0);
        window.flashTarget(t.uid, 'red');
      });
      allies.filter(function(a) { return a.hp > 0; }).forEach(function(a) {
        a.energy = Math.min(a.maxEnergy, a.energy + Math.round(a.maxEnergy * 0.1));
      });
      window.addLog(logEl, unit.name + '战技 扩散+回能10%');
    } else if (st === '战技点') {
      var cost = window.battleState.sp;
      var mul = 1 + cost * 0.8;
      targets.forEach(function(t) { window.dealDmg(unit, t, mul); window.flashTarget(t.uid, 'red'); });
      window.addLog(logEl, '<span class="log-sp">' + unit.name + '战技 耗' + cost + 'SP ' + mul.toFixed(1) + 'x</span>');
      window.battleState.sp = 0;
    } else {
      var m2 = window.pickT(targets);
      window.dealDmg(unit, m2, 1.8);
      window.flashTarget(m2.uid, 'red');
      targets.filter(function(t) { return t !== m2; }).slice(0, 2).forEach(function(t) {
        window.dealDmg(unit, t, 1.0);
        window.flashTarget(t.uid, 'red');
      });
      window.addLog(logEl, unit.name + '战技 扩散');
    }
  };
  
  // 终结技执行
  window.execUlt = async function(unit, allies, enemies, logEl) {
    unit.energy = 0;
    var targets = enemies.filter(function(e) { return e.hp > 0; });
    if (!targets.length) return;
    
    window.addLog(logEl, '<b style="color:var(--gold)">' + unit.name + ' 终结技!</b>');
    window.flashTarget(unit.uid, 'gold');
    window.renderBattle(allies, enemies, unit.uid);
    await window.sleep(300);
    
    var st = unit.skillType;
    if (st === '持续伤害') {
      targets.forEach(function(t) {
        var dd = Math.round(t.dots * 15 * (1 + unit.dmgMul));
        t.hp = Math.max(0, t.hp - dd);
        window.flashTarget(t.uid, 'purple');
      });
      window.addLog(logEl, '<span class="log-dot">引爆DoT!</span>');
    } else if (st === '击破') {
      targets.forEach(function(t) { window.dealDmg(unit, t, 3.0); window.flashTarget(t.uid, 'blue'); });
      window.addLog(logEl, unit.name + '大招 强力群攻');
    } else if (st === '治疗') {
      allies.filter(function(a) { return a.hp > 0; }).forEach(function(a) { a.healBuff = true; });
      window.addLog(logEl, '<span class="log-heal">被治疗量提升!</span>');
    } else if (st === '追击') {
      unit.dmgMul += 0.5;
      for (var i = 0; i < 3; i++) {
        targets.forEach(function(t) { window.dealDmg(unit, t, 1.5); window.flashTarget(t.uid, 'red'); });
        window.addLog(logEl, unit.name + '连击#' + (i + 1));
        window.renderBattle(allies, enemies, unit.uid);
        await window.sleep(200);
      }
      unit.dmgMul -= 0.5;
    } else if (st === '护盾') {
      allies.filter(function(a) { return a.hp > 0; }).forEach(function(a) { a.shieldDmgReduce = true; });
      window.addLog(logEl, '<span class="log-shield">护盾减伤!</span>');
    } else if (st === '群攻') {
      unit.dmgMul += 0.5;
      targets.forEach(function(t) { window.dealDmg(unit, t, 2.5); window.flashTarget(t.uid, 'red'); });
      unit.dmgMul -= 0.5;
      window.addLog(logEl, unit.name + '大招 提伤群攻');
    } else if (st === '能量') {
      for (var j = 0; j < 20; j++) {
        var t2 = targets[Math.floor(Math.random() * targets.length)];
        window.dealDmg(unit, t2, 0.6);
        if (j % 5 === 0) {
          window.flashTarget(t2.uid, 'gold');
          window.renderBattle(allies, enemies, unit.uid);
          await window.sleep(80);
        }
      }
      window.addLog(logEl, unit.name + '大招 20次弹射!');
    } else if (st === '战技点') {
      var m3 = window.pickT(targets);
      window.dealDmg(unit, m3, 3.0);
      window.flashTarget(m3.uid, 'red');
      targets.filter(function(t) { return t !== m3; }).slice(0, 2).forEach(function(t) {
        window.dealDmg(unit, t, 1.5);
        window.flashTarget(t.uid, 'red');
      });
      window.battleState.sp = Math.min(window.battleState.maxSP, window.battleState.sp + 3);
      window.addLog(logEl, '<span class="log-sp">' + unit.name + '大招 扩散+3SP!</span>');
    } else {
      targets.forEach(function(t) { window.dealDmg(unit, t, 2.2); window.flashTarget(t.uid, 'red'); });
      window.addLog(logEl, unit.name + '大招 群攻');
    }
    
    unit.energy = Math.min(unit.maxEnergy, unit.energy + Math.round(unit.maxEnergy * 0.1));
    window.renderBattle(allies, enemies);
    await window.sleep(200);
  };
  
  // 敌人行动
  window.enemyAction = async function(unit, allies, enemies, logEl) {
    var ts = allies.filter(function(a) { return a.hp > 0 && a.pos === 'front'; });
    if (!ts.length) return;
    var t = window.pickT(ts);
    
    var dmg = unit.atk * (1 + unit.dmgMul) * (0.9 + Math.random() * 0.2);
    if (Math.random() < unit.critRate) dmg *= (1 + unit.critDmg);
    
    if (t.shield > 0) {
      var ab = Math.min(t.shield, dmg);
      t.shield -= ab;
      dmg -= ab;
      if (t.shieldDmgReduce) { dmg *= 0.5; t.shieldDmgReduce = false; }
    }
    dmg *= (1 - Math.min(t.dmgReduce, 0.8));
    dmg = Math.round(Math.max(dmg, 1));
    
    t.hp = Math.max(0, t.hp - dmg);
    t.energy = Math.min(t.maxEnergy, t.energy + Math.round(t.maxEnergy * 0.1));
    
    window.addLog(logEl, '<span class="log-dmg">' + unit.name + '→' + t.name + '：' + dmg + '</span>');
    window.flashTarget(t.uid, 'red');
  };
  
  // 显示结果
  window.showResult = function(won, allies, enemies, bonuses) {
    window.showScreen('result-screen');
    var t = document.getElementById('result-title');
    var g = document.getElementById('result-gold');
    
    if (won) {
      window.state.streak++;
      var goldR = 3 + window.state.streak * 2 + (bonuses.goldPerBattle || 0);
      window.state.gold += goldR;
      t.textContent = '胜利!';
      g.textContent = '+' + goldR;
    } else {
      window.state.streak = 0;
      var dmg = 3 + Math.floor(window.state.node / 3);
      window.state.hp = Math.max(0, window.state.hp - dmg);
      t.textContent = '战败';
      g.textContent = '0';
    }
  };
  
  // 返回大厅
  window.returnToLobby = function() {
    window.showScreen('game-screen');
    window.renderAll();
  };
  
  // 下一节点
  window.nextNode = function() {
    if (window.state.hp <= 0 || window.state.node >= window.state.maxNodes) {
      window.initState();
      window.state.shop = window.genShop();
      window.showScreen('game-screen');
      window.renderAll();
      window.showToast(window.state.hp <= 0 ? '游戏结束' : '恭喜通关!', 'info');
      return;
    }
    window.state.node++;
    window.state.freeRefresh = true;
    window.state.shop = window.genShop();
    window.state.phase = 'prep';
    window.showScreen('game-screen');
    window.renderAll();
  };
  
  // 显示羁绊信息
  window.showBondInfo = function() {
    var m = document.getElementById('bond-modal');
    var c = document.getElementById('bond-modal-content');
    var h = '';
    
    Object.entries(window.BOND_DATA).forEach(function(entry) {
      var name = entry[0], data = entry[1];
      h += '<div style="margin-bottom:.3rem;padding:.25rem;background:var(--card);border-radius:4px;border:1px solid var(--border);font-size:.6rem">' +
        '<div style="font-weight:700;color:var(--gold)"><i class="fas ' + data.icon + '"></i> ' + name + '</div>' +
        '<div style="color:var(--muted);font-size:.5rem">' + data.desc + '</div>' +
        '<div style="font-size:.48rem;margin-top:.05rem">';
      data.tiers.forEach(function(t, i) {
        h += '<span style="color:var(--cost' + Math.min(i + 2, 5) + '">' + t + '人:' +
          Object.entries(data.bonus[i]).map(function(kv) { return kv[0] + '+' + Math.round(kv[1] * 100) + '%'; }).join(',') +
          '</span> | ';
      });
      h += '</div></div>';
    });
    c.innerHTML = h;
    m.classList.add('active');
  };
  
  // 五星招募卡点击
  document.addEventListener('click', function(e) {
    var es = e.target.closest('.equip-slot');
    if (!es) return;
    var idx = parseInt(es.dataset.equipIdx);
    if (isNaN(idx)) return;
    var eid = window.state.equips[idx];
    if (!eid || eid !== 'recruit5') return;
    
    window.state.equips.splice(idx, 1);
    var pool = window.CHAR_DATA.filter(function(c) { return c.cost === 5; });
    var ch = pool[Math.floor(Math.random() * pool.length)];
    
    if (window.state.bench.length < 12) {
      window.state.bench.push({ uid: window.makeUID(), id: ch.id, star: 1, equips: [] });
      window.showToast('招募 ' + ch.name + '!', 'success');
    } else {
      window.showToast('备战席满', 'error');
    }
    window.renderAll();
  });
  
  // 粒子背景
  window.initParticles = function() {
    var cv = document.getElementById('particles');
    var ctx = cv.getContext('2d');
    var W, H;
    var ps = [];
    
    function resize() { W = cv.width = innerWidth; H = cv.height = innerHeight; }
    resize();
    addEventListener('resize', resize);
    
    for (var i = 0; i < 30; i++) {
      ps.push({
        x: Math.random() * 2000, y: Math.random() * 1200, r: Math.random() * 1 + .3,
        vx: (Math.random() - .5) * .2, vy: -Math.random() * .3 - .05, a: Math.random() * .3 + .05
      });
    }
    
    function draw() {
      ctx.clearRect(0, 0, W, H);
      ps.forEach(function(p) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(.1, p.r), 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(240,180,41,' + p.a + ')';
        ctx.fill();
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        if (p.x < -10) p.x = W + 10;
        if (p.x > W + 10) p.x = -10;
      });
      requestAnimationFrame(draw);
    }
    draw();
  };
  
  // 开始游戏
  window.startGame = function() {
    window.initState();
    window.state.shop = window.genShop();
    window.showScreen('game-screen');
    window.renderAll();
    window.showToast('购买角色，升级人口，搭配羁绊', 'info');
  };
  
  // 初始化
  window.initParticles();
  
})(window);
