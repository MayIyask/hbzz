/**
 * 工具函数模块
 */
(function(window) {
  'use strict';
  
  // 全局状态
  window.state = {};
  window.uidC = 0;
  window.battleRunning = false;
  window.dragInfo = null;
  window.battleState = {};
  
  // 生成唯一ID
  window.makeUID = function() { return ++window.uidC; };
  
  // 计算角色售价
  window.getSellPrice = function(c) {
    var b = window.getCharBase(c.id);
    return b.cost * c.star - c.star + 1;
  };
  
  // 计算升级所需经验
  window.expToNext = function(lv) { return lv < 10 ? lv * 4 : 999; };
  
  // 最大人口 = 等级
  window.maxPop = function() { return window.state.level; };
  
  // 统计场上角色数
  window.countFieldChars = function() { return window.state.field.filter(Boolean).length; };
  
  // 统计前排角色数
  window.countFrontChars = function() { return window.state.field.slice(0, 4).filter(Boolean).length; };
  
  // 判断格子是否锁定
  window.isSlotLocked = function(i) {
    return window.countFieldChars() >= window.maxPop() && !window.state.field[i];
  };
  
  // 初始化游戏状态
  window.initState = function() {
    window.state = {
      gold: 10, hp: 30, node: 1, maxNodes: 18, streak: 0, phase: 'prep',
      level: 2, exp: 0, bench: [], field: new Array(10).fill(null),
      shop: [], equips: [], crystals: []
    };
  };
  
  // 计算羁绊（仅场上）
  window.calcBonds = function() {
    var ct = {};
    window.state.field.filter(Boolean).forEach(function(c) {
      window.getCharBase(c.id).bonds.forEach(function(b) {
        ct[b] = (ct[b] || 0) + 1;
      });
    });
    var ac = {};
    Object.keys(ct).forEach(function(b) {
      var n = ct[b];
      var d = window.BOND_DATA[b];
      if (!d) return;
      var t = -1;
      for (var i = d.tiers.length - 1; i >= 0; i--) {
        if (n >= d.tiers[i]) { t = i; break; }
      }
      ac[b] = { count: n, tier: t, data: d };
    });
    return ac;
  };
  
  // 汇总羁绊加成
  window.sumBonuses = function(bonds) {
    var s = { dmgMul:0, atkMul:0, hpMul:0, spdMul:0, critRate:0, dmgReduce:0, dotDmg:0, healMul:0, goldPerBattle:0 };
    Object.values(bonds).forEach(function(b) {
      if (b.tier >= 0 && b.data.bonus[b.tier]) {
        Object.entries(b.data.bonus[b.tier]).forEach(function(kv) {
          s[kv[0]] = (s[kv[0]] || 0) + kv[1];
        });
      }
    });
    return s;
  };
  
  // 显示Toast提示
  window.showToast = function(msg, type) {
    var t = document.createElement('div');
    t.className = 'toast toast-' + type;
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(function() { t.remove(); }, 2000);
  };
  
  // 切换屏幕
  window.showScreen = function(id) {
    document.querySelectorAll('.screen').forEach(function(s) { s.classList.remove('active'); });
    document.getElementById(id).classList.add('active');
  };
  
  // 异步睡眠
  window.sleep = function(ms) { return new Promise(function(r) { setTimeout(r, ms); }); };
  
})(window);
