/**
 * UI渲染模块
 */
(function(window) {
  'use strict';
  
  // 渲染所有UI
  window.renderAll = function() {
    window.renderTopBar();
    window.renderBonds();
    window.renderLevel();
    window.renderField();
    window.renderBench();
    window.renderShop();
    window.renderEquips();
    window.renderCrystals();
    window.renderOverflowWarn();
  };
  
  // 渲染顶部状态栏
  window.renderTopBar = function() {
    document.getElementById('gold-display').textContent = window.state.gold;
    document.getElementById('hp-display').textContent = window.state.hp;
    document.getElementById('streak-display').textContent = window.state.streak;
    
    var p = document.getElementById('node-progress');
    var h = '';
    for (var i = 1; i <= window.state.maxNodes; i++) {
      var cls = i < window.state.node ? 'done' : (i === window.state.node ? 'cur' : (i <= 2 && i >= window.state.node ? 'rw' : ''));
      h += '<div class="node-dot ' + cls + '" title="节点' + i + (i<=2?' (奖励)':'') + '"></div>';
    }
    p.innerHTML = h;
  };
  
  // 渲染羁绊侧边栏
  window.renderBonds = function() {
    var bonds = window.calcBonds();
    var bar = document.getElementById('bonds-sidebar');
    var h = '';
    var entries = Object.entries(bonds).sort(function(a, b) {
      return (b[1].tier >= 0 ? 1 : 0) - (a[1].tier >= 0 ? 1 : 0) || b[1].count - a[1].count;
    });
    
    entries.forEach(function(entry) {
      var name = entry[0], b = entry[1];
      var isA = b.tier >= 0;
      var nextT = b.data.tiers.find(function(t) { return t > b.count; });
      var tX = isA ? '<span class="bond-tier">★' + (b.tier + 1) + '</span>' : '';
      var cT = nextT ? b.count + '/' + nextT : b.count + 'MAX';
      h += '<div class="bond-card ' + (isA ? 'active' : '') + '">' +
        '<div class="bond-name"><i class="fas ' + b.data.icon + '" style="color:' + (isA ? 'var(--gold)' : 'var(--muted)') + '"></i>' + name + tX + '</div>' +
        '<div class="bond-count">' + cT + '</div></div>';
    });
    bar.innerHTML = h || '<div style="color:var(--muted);font-size:.5rem;text-align:center;padding:.3rem">上阵角色激活羁绊</div>';
  };
  
  // 渲染等级面板
  window.renderLevel = function() {
    var panel = document.getElementById('level-panel');
    var nextExp = window.expToNext(window.state.level);
    var pct = window.state.level >= 10 ? 100 : Math.min(100, Math.round(window.state.exp / nextExp * 100));
    var canBuy = window.state.gold >= 4 && window.state.level < 10;
    
    panel.innerHTML = '<div class="level-num">Lv' + window.state.level + '</div>' +
      '<div class="level-bar-outer"><div class="level-bar-fill" style="height:' + pct + '%"></div><div class="level-bar-text">' + pct + '%</div></div>' +
      '<button class="level-btn" onclick="buyExp()" ' + (canBuy ? '' : 'disabled') + '>4💰升4经验</button>' +
      '<div class="level-pop">人口 ' + window.countFieldChars() + '/' + window.maxPop() + '</div>' +
      '<div class="level-sub">' + (window.state.level < 10 ? '差' + (nextExp - window.state.exp) + '经验' : 'MAX') + '</div>';
  };
  
  // 构建角色小卡片HTML
  window.buildCharMiniHTML = function(c) {
    var b = window.getCharBase(c.id);
    var cc = window.GAME_CONST.COST_COLORS[b.cost];
    var stars = '★'.repeat(c.star);
    var sm = c.star === 1 ? 1 : (c.star === 2 ? 1.8 : 3.2);
    var eqH = (c.equips || []).map(function(eid) {
      var eb = window.getEquipBase(eid);
      return '<div class="equip-icon" style="background:' + (eb ? eb.color : 'var(--muted)') + '" title="' + (eb ? eb.name : '') + '"></div>';
    }).join('');
    
    return '<div class="char-mini"><div class="cost-dot" style="background:' + cc + ';border-color:' + cc + '"></div>' +
      '<div class="char-name" style="color:' + cc + '">' + b.name + '</div>' +
      '<div class="char-stars">' + stars + '</div>' +
      '<div class="char-bonds">' + b.bonds.join('·') + '</div>' +
      '<div class="char-stats">A' + Math.round(b.atk * sm) + ' H' + Math.round(b.hp * sm) + '</div>' +
      '<div class="equip-icons">' + eqH + '</div></div>';
  };
  
  // 渲染战场格子
  window.renderField = function() {
    var fR = document.getElementById('front-row');
    var bR = document.getElementById('back-row');
    var fh = '', bh = '';
    
    // 前排 0-3
    for (var i = 0; i < 4; i++) {
      var c = window.state.field[i];
      var lk = window.isSlotLocked(i);
      if (c) {
        var b = window.getCharBase(c.id);
        fh += '<div class="slot filled" data-field-idx="' + i + '" style="border-color:' + window.GAME_CONST.COST_COLORS[b.cost] + '">' + window.buildCharMiniHTML(c) + '</div>';
      } else {
        fh += '<div class="slot ' + (lk ? 'locked' : '') + '" data-field-idx="' + i + '"><i class="fas ' + (lk ? 'fa-lock' : 'fa-plus') + '" style="color:var(--border);font-size:.7rem"></i></div>';
      }
    }
    // 后排 4-9
    for (var j = 4; j < 10; j++) {
      var c2 = window.state.field[j];
      var lk2 = window.isSlotLocked(j);
      if (c2) {
        var b2 = window.getCharBase(c2.id);
        bh += '<div class="slot filled" data-field-idx="' + j + '" style="border-color:' + window.GAME_CONST.COST_COLORS[b2.cost] + '">' + window.buildCharMiniHTML(c2) + '</div>';
      } else {
        bh += '<div class="slot ' + (lk2 ? 'locked' : '') + '" data-field-idx="' + j + '"><i class="fas ' + (lk2 ? 'fa-lock' : 'fa-plus') + '" style="color:var(--border);font-size:.7rem"></i></div>';
      }
    }
    fR.innerHTML = fh;
    bR.innerHTML = bh;
    
    // 绑定拖拽事件
    document.querySelectorAll('.slot.filled .char-mini').forEach(function(el) {
      var s = el.closest('.slot');
      var idx = parseInt(s.dataset.fieldIdx);
      el.addEventListener('pointerdown', function(e) { window.initDrag(e, 'field', idx); });
    });
    document.querySelectorAll('.slot:not(.filled):not(.locked)').forEach(function(s) {
      s.addEventListener('click', function() {
        var idx = parseInt(s.dataset.fieldIdx);
        window.autoPlace(idx);
      });
    });
  };
  
  // 渲染备战席
  window.renderBench = function() {
    var br = document.getElementById('bench-row');
    var ov = window.state.bench.length > 9;
    var h = '';
    
    window.state.bench.forEach(function(c, i) {
      var b = window.getCharBase(c.id);
      h += '<div class="slot filled ' + (ov ? 'bench-overflow' : '') + '" data-bench-idx="' + i + '" style="border-color:' + window.GAME_CONST.COST_COLORS[b.cost] + '">' + window.buildCharMiniHTML(c) + '</div>';
    });
    if (!ov) {
      for (var i = 0; i < 9 - window.state.bench.length; i++) {
        h += '<div class="slot" data-bench-idx="' + (window.state.bench.length + i) + '"><i class="fas fa-chair" style="color:var(--border);font-size:.5rem"></i></div>';
      }
    }
    br.innerHTML = h;
    
    document.querySelectorAll('#bench-row .slot.filled .char-mini').forEach(function(el) {
      var s = el.closest('.slot');
      var idx = parseInt(s.dataset.benchIdx);
      el.addEventListener('pointerdown', function(e) { window.initDrag(e, 'bench', idx); });
    });
  };
  
  // 渲染溢出警告
  window.renderOverflowWarn = function() {
    document.getElementById('overflow-warn').innerHTML = window.state.bench.length > 9 ?
      '<div class="overflow-warn"><i class="fas fa-triangle-exclamation"></i> 备战席已满! 请出售角色</div>' : '';
  };
  
  // 渲染商店
  window.renderShop = function() {
    var el = document.getElementById('shop-cards');
    var h = '';
    window.state.shop.forEach(function(it, i) {
      if (it.sold) {
        h += '<div class="shop-card sold"></div>';
      } else {
        var b = window.getCharBase(it.id);
        var cc = window.GAME_CONST.COST_COLORS[b.cost];
        h += '<div class="shop-card" onclick="buyChar(' + i + ')" style="border-color:' + cc + '">' +
          '<div style="font-size:.45rem;color:' + cc + ';font-weight:900">' + window.GAME_CONST.COST_NAMES[b.cost] + b.cost + '费</div>' +
          '<div style="font-size:.65rem;font-weight:700;color:' + cc + '">' + b.name + '</div>' +
          '<div style="font-size:.38rem;color:var(--muted)">' + b.bonds.join('·') + '</div>' +
          '<div style="font-size:.5rem;color:var(--gold);font-weight:700"><i class="fas fa-coins"></i> ' + b.cost + '</div></div>';
      }
    });
    el.innerHTML = h;
    document.getElementById('refresh-btn').disabled = window.state.gold < 2;
  };
  
  // 渲染装备栏
  window.renderEquips = function() {
    var g = document.getElementById('equip-grid');
    var h = '';
    window.state.equips.forEach(function(eid, i) {
      var b = window.getEquipBase(eid);
      if (!b) return;
      var tc = b.tier === 1 ? 'var(--muted)' : (b.tier === 2 ? 'var(--cost3)' : (b.tier === 3 ? 'var(--gold)' : 'var(--cost5)'));
      h += '<div class="equip-slot" data-equip-idx="' + i + '" style="border-color:' + (b.color || 'var(--border)') + '" title="' + b.name + '">' +
        '<span class="eq-emoji">' + b.emoji + '</span>' +
        '<span class="eq-tier" style="color:' + tc + '">' + (b.tier > 0 ? 'T' + b.tier : '★') + '</span></div>';
    });
    g.innerHTML = h;
    document.querySelectorAll('.equip-slot').forEach(function(el) {
      var idx = parseInt(el.dataset.equipIdx);
      el.addEventListener('pointerdown', function(e) { window.initEquipDrag(e, idx); });
    });
  };
  
  // 渲染晶矿
  window.renderCrystals = function() {
    var a = document.getElementById('crystal-area');
    var h = '';
    window.state.crystals.forEach(function(c) {
      if (c.opened) return;
      var sym = c.type === 'rainbow' ? '✦' : (c.type === 'gold' ? '◆' : (c.type === 'blue' ? '●' : '○'));
      h += '<div class="crystal crystal-' + c.type + '" style="left:' + c.x + 'px;top:' + c.y + 'px" data-crystal-id="' + c.id + '">' + sym + '</div>';
    });
    a.innerHTML = h;
  };
  
  // 自动放置角色
  window.autoPlace = function(fi) {
    if (!window.state.bench.length) return;
    if (window.isSlotLocked(fi)) { window.showToast('人口已满(' + window.maxPop() + ')', 'error'); return; }
    
    var isB = fi >= 4;
    var pref = window.state.bench.findIndex(function(c) {
      var b = window.getCharBase(c.id);
      return isB ? b.pos === 'back' : b.pos === 'front';
    });
    var idx = pref >= 0 ? pref : 0;
    
    if (window.wouldHaveDuplicate(window.state.bench[idx], -1, 'bench', null, fi, 'field')) {
      window.showToast('同名不可同场', 'error'); return;
    }
    
    window.state.field[fi] = window.state.bench[idx];
    window.state.bench.splice(idx, 1);
    window.renderAll();
  };
  
  // 晶矿鼠标划过开启
  (function() {
    var md = false;
    document.addEventListener('pointerdown', function() { md = true; });
    document.addEventListener('pointerup', function() { md = false; });
    document.addEventListener('pointermove', function(e) {
      if (!md) return;
      var els = document.elementsFromPoint(e.clientX, e.clientY);
      els.forEach(function(el) {
        if (el.classList.contains('crystal') && !el.classList.contains('opening')) {
          var cid = parseInt(el.dataset.crystalId);
          var cry = window.state.crystals.find(function(c) { return c.id === cid; });
          if (cry && !cry.opened) {
            el.classList.add('opening');
            setTimeout(function() { window.openCrystal(cry); }, 400);
          }
        }
      });
    });
  })();
  
})(window);
