/**
 * 战斗引擎模块
 */
(function(window) {
  'use strict';
  
  // 获取角色技能类型
  window.getSkillType = function(id) {
    var bonds = window.getCharBase(id).bonds;
    var prio = ['持续伤害','击破','治疗','追击','护盾','群攻','能量','战技点'];
    for (var i = 0; i < prio.length; i++) {
      if (bonds.indexOf(prio[i]) >= 0) return prio[i];
    }
    return '通用';
  };
  
  // 计算角色战斗属性
  window.calcStats = function(char, bonuses) {
    var base = window.getCharBase(char.id);
    var sm = char.star === 1 ? 1 : (char.star === 2 ? 1.8 : 3.2);
    var atk = base.atk * sm, hp = base.hp * sm, spd = base.spd;
    var dmgMul = 0, critRate = .05, critDmg = .5, dmgReduce = 0, dotDmg = 0, healMul = 0;
    var frontStr = 0, backStr = 0, breakEff = 0, breakDmg = 0, initEnergy = 0, energyRegen = 0;
    
    if (bonuses) {
      atk *= (1 + (bonuses.atkMul || 0));
      hp *= (1 + (bonuses.hpMul || 0));
      spd *= (1 + (bonuses.spdMul || 0));
      dmgMul += (bonuses.dmgMul || 0);
      critRate += (bonuses.critRate || 0);
      dmgReduce += (bonuses.dmgReduce || 0);
      dotDmg += (bonuses.dotDmg || 0);
      healMul += (bonuses.healMul || 0);
    }
    
    (char.equips || []).forEach(function(eid) {
      var eb = window.getEquipBase(eid);
      if (!eb || !eb.stats) return;
      var st = eb.stats;
      if (st.atk) atk += st.atk;
      if (st.hp) hp += st.hp;
      if (st.spd) spd += st.spd;
      if (st.dmgMul) dmgMul += st.dmgMul;
      if (st.critRate) critRate += st.critRate;
      if (st.critDmg) critDmg += st.critDmg;
      if (st.dmgReduce) dmgReduce += st.dmgReduce;
      if (st.frontStr) frontStr += st.frontStr;
      if (st.backStr) backStr += st.backStr;
      if (st.breakEff) breakEff += st.breakEff;
      if (st.breakDmg) breakDmg += st.breakDmg;
      if (st.initEnergy) initEnergy += st.initEnergy;
      if (st.energyRegen) energyRegen += st.energyRegen;
      if (st.spdMul) spd *= (1 + st.spdMul);
    });
    
    if (char.pos === 'front') dmgMul += frontStr;
    else dmgMul += backStr;
    
    return {
      atk: Math.round(atk), hp: Math.round(hp), maxHp: Math.round(hp), spd: Math.round(spd),
      dmgMul: dmgMul, critRate: critRate, critDmg: critDmg, dmgReduce: dmgReduce,
      dotDmg: dotDmg, healMul: healMul, frontStr: frontStr, backStr: backStr,
      breakEff: breakEff, breakDmg: breakDmg, initEnergy: initEnergy, energyRegen: energyRegen,
      name: base.name, pos: base.pos, bonds: base.bonds, cost: base.cost,
      star: char.star, uid: char.uid, id: char.id, elem: base.elem,
      skillType: window.getSkillType(char.id), energy: 0, maxEnergy: 100,
      shield: 0, actionCount: 0, healBuff: false, shieldDmgReduce: false
    };
  };
  
  // 生成敌人队伍
  window.genEnemyTeam = function() {
    var n = Math.min(3 + Math.floor(window.state.node / 3), 8);
    var en = [];
    var ns = 0.6 + window.state.node * 0.25;
    var isR = window.state.node <= 2;
    
    for (var i = 0; i < n; i++) {
      var base = window.CHAR_DATA[Math.floor(Math.random() * window.CHAR_DATA.length)];
      var star = Math.min(3, 1 + Math.floor(window.state.node / 6));
      var sm = star === 1 ? 1 : (star === 2 ? 1.6 : 2.5);
      var weaks = [];
      var pool = window.GAME_CONST.ELEMS.slice();
      for (var j = 0; j < 3; j++) {
        var idx = Math.floor(Math.random() * pool.length);
        weaks.push(pool.splice(idx, 1)[0]);
      }
      var tough = 30 + window.state.node * 5;
      var hp = Math.round(base.hp * sm * ns * (0.85 + Math.random() * 0.3));
      if (isR) hp = Math.round(hp * 0.01);
      
      var enemy = {
        uid: window.makeUID(), id: base.id, name: window.ENEMY_NAMES[Math.floor(Math.random() * window.ENEMY_NAMES.length)],
        atk: Math.round(base.atk * sm * ns * (0.85 + Math.random() * 0.3)),
        hp: hp, maxHp: hp, spd: base.spd, dmgMul: 0.1 * Math.floor(window.state.node / 4),
        critRate: .05, critDmg: .5, dmgReduce: 0, dotDmg: 0, healMul: 0,
        star: star, isEnemy: true, bonds: [], cost: base.cost, pos: base.pos,
        elem: base.elem || window.GAME_CONST.ELEMS[Math.floor(Math.random() * window.GAME_CONST.ELEMS.length)],
        weaknesses: weaks, toughness: tough, maxToughness: tough,
        dots: 0, broken: false, breakEff: 0, breakDmg: 0, frontStr: 0, backStr: 0,
        initEnergy: 0, energyRegen: 0, healBuff: false, shieldDmgReduce: false,
        energy: 0, maxEnergy: 100, shield: 0, actionCount: 0
      };
      en.push(enemy);
    }
    return en;
  };
  
  // 特效闪烁
  window.flashTarget = function(uid, cls) {
    var el = document.querySelector('.battle-char[data-uid="' + uid + '"]');
    if (!el) return;
    var fl = document.createElement('div');
    fl.className = 'fx-flash fx-flash-' + cls;
    el.style.position = 'relative';
    el.appendChild(fl);
    setTimeout(function() { fl.remove(); }, 400);
  };
  
  // 添加战斗日志
  window.addLog = function(el, html) {
    if (!el) return;
    el.innerHTML += '<div>' + html + '</div>';
    el.scrollTop = el.scrollHeight;
  };
  
  // 选择目标
  window.pickT = function(ts) {
    var f = ts.filter(function(t) { return t.pos === 'front'; });
    return f.length ? f[Math.floor(Math.random() * f.length)] : ts[Math.floor(Math.random() * ts.length)];
  };
  
  // 造成伤害
  window.dealDmg = function(atk, tgt, mul) {
    if (!tgt || tgt.hp <= 0) return 0;
    var dmg = atk.atk * mul * (1 + atk.dmgMul) * (0.9 + Math.random() * 0.2);
    var crit = Math.random() < atk.critRate;
    if (crit) dmg *= (1 + atk.critDmg);
    if (!atk.isEnemy) window.reduceTough(atk, tgt, 10 * (1 + atk.breakEff), false);
    var res = tgt.broken ? 0 : 0.2;
    dmg *= (1 - res);
    if (tgt.shield > 0) {
      var ab = Math.min(tgt.shield, dmg);
      tgt.shield -= ab;
      dmg -= ab;
      if (tgt.shieldDmgReduce) { dmg *= 0.5; tgt.shieldDmgReduce = false; }
    }
    dmg = Math.round(Math.max(dmg, 1));
    tgt.hp = Math.max(0, tgt.hp - dmg);
    if (!atk.isEnemy) atk.energy = Math.min(atk.maxEnergy, atk.energy + 5);
    return dmg;
  };
  
  // 削减韧性
  window.reduceTough = function(atk, tgt, amt, ig) {
    if (tgt.broken) return;
    if (ig) tgt.toughness = Math.max(0, tgt.toughness - amt);
    else if (tgt.weaknesses.indexOf(atk.elem) >= 0) tgt.toughness = Math.max(0, tgt.toughness - amt);
    
    if (tgt.toughness <= 0 && !tgt.broken) {
      tgt.broken = true;
      var bd = Math.round(atk.atk * 1.5 * (1 + atk.dmgMul) * (1 + atk.breakDmg));
      tgt.hp = Math.max(0, tgt.hp - bd);
      window.addLog(document.getElementById('battle-log'), '<span class="log-break">击破! ' + tgt.name + ' -' + bd + '</span>');
      window.flashTarget(tgt.uid, 'blue');
    }
  };
  
  // 渲染战斗界面
  window.renderBattle = function(allies, enemies, actUid) {
    // 战技点面板
    var spP = document.getElementById('battle-sp-panel');
    var spH = '<div class="sp-label">战技点</div><div class="sp-dots">';
    for (var i = 0; i < window.battleState.maxSP; i++) spH += '<div class="sp-dot ' + (i < window.battleState.sp ? 'filled' : '') + '"></div>';
    spH += '</div>';
    spP.innerHTML = spH;
    
    // 角色卡片渲染函数
    var rU = function(u, ie) {
      var hpP = Math.max(0, u.hp / u.maxHp * 100);
      var hpC = hpP > 60 ? 'var(--green)' : (hpP > 30 ? 'var(--gold)' : 'var(--red)');
      var tP = u.maxToughness ? Math.max(0, u.toughness / u.maxToughness * 100) : 0;
      var shP = u.shield ? Math.min(100, u.shield / u.maxHp * 100) : 0;
      var eP = u.maxEnergy ? Math.round(u.energy / u.maxEnergy * 100) : 0;
      var act = u.uid === actUid ? 'acting' : '';
      var dead = u.hp <= 0 ? 'dead' : '';
      var ec = window.GAME_CONST.ELEM_CSS[u.elem] || 'var(--muted)';
      var bk = u.broken ? '<span style="color:var(--red);font-size:.4rem">破</span>' : '';
      var dt = u.dots > 0 ? '<span style="color:var(--cost4);font-size:.4rem">D' + u.dots + '</span>' : '';
      var sd = u.shield > 0 ? '<span style="color:#eee;font-size:.4rem">🛡' + Math.round(u.shield) + '</span>' : '';
      var br = u.pos === 'back' && !ie ? 'back-row' : '';
      
      return '<div class="battle-char ' + (ie ? 'enemy' : '') + ' ' + act + ' ' + dead + ' ' + br + '" data-uid="' + u.uid + '">' +
        '<div class="energy-ring" style="background:conic-gradient(var(--gold) ' + eP + '%, transparent ' + eP + '%)"></div>' +
        '<div class="char-avatar" style="background:' + ec + ';border-color:' + ec + '">' + u.name[0] + '</div>' +
        '<div><div class="char-top">' + u.name + ' ' + '★'.repeat(u.star) + bk + dt + sd + '</div>' +
        '<div style="display:flex;flex-direction:column;gap:1px">' +
        '<div class="bar-wrap"><div class="bar-fill" style="width:' + hpP + '%;background:' + hpC + '"></div><div class="shield-bar" style="width:' + shP + '%"></div></div>' +
        (u.maxToughness ? '<div class="bar-wrap" style="height:3px"><div class="bar-fill tough-fill" style="width:' + tP + '%"></div></div>' : '') +
        '<div style="font-size:.4rem;color:var(--muted)">' + Math.max(0, u.hp) + '/' + u.maxHp + '</div>' +
        '</div></div></div>';
    };
    
    // 敌方区域
    var eA = document.getElementById('battle-enemy-area');
    var eH = '<div style="font-size:.55rem;font-weight:700;color:var(--red);margin-bottom:.1rem;text-align:center">竞争对手</div><div class="battle-team-row">';
    enemies.forEach(function(e) { eH += rU(e, true); });
    eH += '</div>';
    eA.innerHTML = eH;
    
    // 我方区域
    var aA = document.getElementById('battle-ally-area');
    var fronts = allies.filter(function(a) { return a.pos === 'front'; });
    var backs = allies.filter(function(a) { return a.pos === 'back'; });
    var aH = '<div style="font-size:.5rem;font-weight:700;color:var(--gold);margin-bottom:.05rem">前排</div><div class="battle-team-row">';
    fronts.forEach(function(a) { aH += rU(a, false); });
    aH += '</div><div style="font-size:.5rem;font-weight:700;color:var(--cost3);margin:.08rem 0">后排</div><div class="battle-team-row">';
    backs.forEach(function(a) { aH += rU(a, false); });
    aH += '</div>';
    aA.innerHTML = aH;
  };
  
})(window);
