/**
 * 拖拽系统模块
 */
(function(window) {
  'use strict';
  
  // 初始化角色拖拽
  window.initDrag = function(e, sT, sI) {
    var c = (sT === 'field') ? window.state.field[sI] : window.state.bench[sI];
    if (!c) return;
    e.preventDefault();
    
    var ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.style.width = '62px';
    ghost.style.height = '80px';
    ghost.innerHTML = window.buildCharMiniHTML(c);
    ghost.style.left = (e.clientX - 31) + 'px';
    ghost.style.top = (e.clientY - 40) + 'px';
    document.body.appendChild(ghost);
    
    window.dragInfo = {
      type: 'char',
      srcType: sT,
      srcIdx: sI,
      char: c,
      ghost: ghost,
      price: window.getSellPrice(c)
    };
    
    document.getElementById('sell-left').classList.add('visible');
    document.getElementById('sell-right').classList.add('visible');
    document.getElementById('sell-price-left').textContent = window.dragInfo.price + '💰';
    document.getElementById('sell-price-right').textContent = window.dragInfo.price + '💰';
    
    document.addEventListener('pointermove', window.onDragMove);
    document.addEventListener('pointerup', window.onDragEnd);
  };
  
  // 初始化装备拖拽
  window.initEquipDrag = function(e, idx) {
    e.preventDefault();
    var eid = window.state.equips[idx];
    var base = window.getEquipBase(eid);
    
    var ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.style.width = '36px';
    ghost.style.height = '36px';
    ghost.style.background = 'var(--card)';
    ghost.style.border = '2px solid ' + (base.color || 'var(--border)');
    ghost.style.borderRadius = '4px';
    ghost.style.display = 'flex';
    ghost.style.alignItems = 'center';
    ghost.style.justifyContent = 'center';
    ghost.style.fontSize = '.7rem';
    ghost.textContent = base.emoji;
    ghost.style.left = (e.clientX - 18) + 'px';
    ghost.style.top = (e.clientY - 18) + 'px';
    document.body.appendChild(ghost);
    
    window.dragInfo = { type: 'equip', srcIdx: idx, equipId: eid, ghost: ghost };
    document.addEventListener('pointermove', window.onDragMove);
    document.addEventListener('pointerup', window.onDragEnd);
  };
  
  // 拖拽移动
  window.onDragMove = function(e) {
    if (!window.dragInfo) return;
    var g = window.dragInfo.ghost;
    var off = (window.dragInfo.type === 'char') ? 31 : 18;
    g.style.left = (e.clientX - off) + 'px';
    g.style.top = (e.clientY - off) + 'px';
    g.style.display = 'none';
    
    var el = document.elementFromPoint(e.clientX, e.clientY);
    g.style.display = '';
    
    // 清除高亮
    document.querySelectorAll('.slot.drag-over,.slot.dup-warn,.equip-slot.drag-over-equip').forEach(function(s) {
      s.classList.remove('drag-over', 'dup-warn', 'drag-over-equip');
    });
    document.querySelectorAll('.sell-zone.drag-over').forEach(function(s) { s.classList.remove('drag-over'); });
    
    if (!el) return;
    
    if (window.dragInfo.type === 'char') {
      var sz = el.closest('.sell-zone');
      if (sz) { sz.classList.add('drag-over'); return; }
      
      var sl = el.closest('.slot');
      if (sl) {
        var fI = sl.dataset.fieldIdx;
        var bI = sl.dataset.benchIdx;
        if (fI !== undefined) {
          var fi = parseInt(fI);
          if (window.isSlotLocked(fi)) return;
          if (!window.state.field[fi] && window.wouldHaveDuplicate(window.dragInfo.char, window.dragInfo.srcIdx, window.dragInfo.srcType, null, fi, 'field')) {
            sl.classList.add('dup-warn');
          } else {
            sl.classList.add('drag-over');
          }
        } else if (bI !== undefined) {
          sl.classList.add('drag-over');
        }
      }
    } else {
      var sl2 = el.closest('.slot');
      if (sl2 && sl2.classList.contains('filled')) sl2.classList.add('drag-over');
      var es = el.closest('.equip-slot');
      if (es) es.classList.add('drag-over-equip');
    }
  };
  
  // 拖拽结束
  window.onDragEnd = function(e) {
    if (!window.dragInfo) return;
    var g = window.dragInfo.ghost;
    g.style.display = 'none';
    var el = document.elementFromPoint(e.clientX, e.clientY);
    g.style.display = '';
    g.remove();
    
    document.querySelectorAll('.slot.drag-over,.slot.dup-warn,.equip-slot.drag-over-equip').forEach(function(s) {
      s.classList.remove('drag-over', 'dup-warn', 'drag-over-equip');
    });
    document.querySelectorAll('.sell-zone.drag-over').forEach(function(s) { s.classList.remove('drag-over'); });
    document.getElementById('sell-left').classList.remove('visible');
    document.getElementById('sell-right').classList.remove('visible');
    
    document.removeEventListener('pointermove', window.onDragMove);
    document.removeEventListener('pointerup', window.onDragEnd);
    
    if (window.dragInfo.type === 'char') {
      var sz = el ? el.closest('.sell-zone') : null;
      if (sz) {
        window.sellChar(window.dragInfo.srcType, window.dragInfo.srcIdx);
        window.dragInfo = null;
        return;
      }
      var sl = el ? el.closest('.slot') : null;
      if (sl) {
        var fI = sl.dataset.fieldIdx;
        var bI = sl.dataset.benchIdx;
        if (fI !== undefined) {
          window.moveChar(window.dragInfo.srcType, window.dragInfo.srcIdx, 'field', parseInt(fI));
        } else if (bI !== undefined) {
          var bi = parseInt(bI);
          window.moveChar(window.dragInfo.srcType, window.dragInfo.srcIdx, 'bench', bi >= window.state.bench.length ? -1 : bi);
        }
      }
    } else if (window.dragInfo.type === 'equip') {
      var sl3 = el ? el.closest('.slot') : null;
      if (sl3 && sl3.classList.contains('filled')) {
        var fI2 = sl3.dataset.fieldIdx;
        var bI2 = sl3.dataset.benchIdx;
        var ch = null;
        if (fI2 !== undefined) ch = window.state.field[parseInt(fI2)];
        else if (bI2 !== undefined) ch = window.state.bench[parseInt(bI2)];
        if (ch) {
          if (ch.equips && ch.equips.length >= 3) window.showToast('装备栏满', 'error');
          else {
            window.equipToChar(ch, window.dragInfo.equipId);
            window.showToast('装备 ' + window.getEquipBase(window.dragInfo.equipId).name, 'info');
          }
        }
      }
      var es2 = el ? el.closest('.equip-slot') : null;
      if (es2) {
        var tI = parseInt(es2.dataset.equipIdx);
        if (tI !== window.dragInfo.srcIdx) window.tryMergeEquip(window.dragInfo.equipId, window.state.equips[tI]);
      }
    }
    window.dragInfo = null;
    window.renderAll();
  };
  
  // 同名检测
  window.wouldHaveDuplicate = function(sC, sI, sT, dC, dI, dT) {
    var temp = window.state.field.slice();
    if (sT === 'field') temp[sI] = dC ? Object.assign({}, dC) : null;
    if (dT === 'field') temp[dI] = sC ? Object.assign({}, sC) : null;
    
    var names = {};
    for (var i = 0; i < 10; i++) {
      var c = temp[i];
      if (!c) continue;
      var n = window.getCharBase(c.id).name;
      if (names[n]) return true;
      names[n] = true;
    }
    return false;
  };
  
  // 移动角色
  window.moveChar = function(sT, sI, dT, dI) {
    var sC = (sT === 'field') ? window.state.field[sI] : window.state.bench[sI];
    if (!sC) return;
    var dC = (dT === 'field') ? window.state.field[dI] : ((dI >= 0 && dI < window.state.bench.length) ? window.state.bench[dI] : null);
    
    if (dT === 'field') {
      if (window.wouldHaveDuplicate(sC, sI, sT, dC, dI, dT)) {
        window.showToast('同名角色不可同场', 'error');
        return;
      }
      if (!dC && sT !== 'field' && window.countFieldChars() >= window.maxPop()) {
        window.showToast('人口已满(' + window.maxPop() + ')', 'error');
        return;
      }
    }
    
    // 执行移动
    if (sT === 'field') {
      window.state.field[sI] = dC;
    } else {
      if (dC) window.state.bench[sI] = dC;
      else window.state.bench.splice(sI, 1);
    }
    if (dT === 'field') {
      window.state.field[dI] = sC;
    } else {
      if (!dC) window.state.bench.push(sC);
      else window.state.bench[dI] = sC;
    }
    
    // bench→bench无目标时的修正
    if (sT === 'bench' && dT === 'bench' && !dC) {
      window.state.bench.pop();
      window.state.bench.splice(sI, 1);
      window.state.bench.push(sC);
    }
    window.renderAll();
  };
  
  // 出售角色
  window.sellChar = function(sT, sI) {
    var c = (sT === 'field') ? window.state.field[sI] : window.state.bench[sI];
    if (!c) return;
    window.state.gold += window.getSellPrice(c);
    if (c.equips) c.equips.forEach(function(eid) { window.state.equips.push(eid); });
    if (sT === 'field') window.state.field[sI] = null;
    else window.state.bench.splice(sI, 1);
    window.showToast('出售 ' + window.getCharBase(c.id).name + ' +' + window.getSellPrice(c) + '💰', 'info');
    window.renderAll();
  };
  
})(window);
