// js/engine.js
const Game = {
    state: {
        gold: 10, level: 3, xp: 0, xpToNext: 4, hp: 40, maxHp: 40,
        node: '1-1', face: 1, turn: 1,
        shop: [], team: { front: [null, null, null], back: [null, null], bench: [] },
        inventory: [], strategies: [], bondsActive: [], stats: { base: {} }
    },

    init() {
        console.log('🎮 货币战争引擎初始化...');
        this.generateEnemy();
        this.refreshShop(true); // 开局免费刷新
        this.renderAll();
        this.bindEvents();
        this.log('🎮 V4.2 货币战争模拟器启动。点击商店角色购买，拖拽调配阵容！');
    },

    // 安全DOM工具函数
    _el(id) { return document.getElementById(id); },
    _setText(id, val) { const el = this._el(id); if(el) el.textContent = val; },
    _setHTML(id, val) { const el = this._el(id); if(el) el.innerHTML = val; },
    _setAttr(id, attr, val) { const el = this._el(id); if(el) el.setAttribute(attr, val); },

    refreshShop(isFree = false) {
        if (!isFree && this.state.gold < 2 && this.state.shop.length > 0) return this.log('💰 金币不足(2)');
        if (!isFree) this.state.gold -= 2;
        
        const pool = DATA.characters.filter(c => c['费'] <= this.state.level + 1);
        // 保持商店数量为5
        this.state.shop = [];
        for(let i = 0; i < 5; i++) {
            const char = pool[Math.floor(Math.random() * pool.length)];
            this.state.shop.push({ ...char, uid: Date.now() + Math.random(), stars: 1 });
        }
        this.renderShop();
        this.updateUI();
    },

    generateEnemy() {
        const enemies = ['虚卒·掠夺者', '冰刃猎手', '自动机兵·齿狼', '可可利亚', '史瓦罗'];
        const diff = ['普通', '精英', '首领'];
        const name = enemies[Math.floor(Math.random() * enemies.length)];
        const d = diff[Math.floor(Math.random() * diff.length)];
        this.enemyName = name;
        this.enemyDiff = d;
        this._setText('enemy-info', `👹 ${name} (${d})`);
    },

    assignCard(from, to) {
        const fromParts = from.split('_');
        let card = null;

        if (fromParts[0] === 'shop') {
            const idx = this.state.shop.findIndex(c => String(c.uid) === fromParts[1]);
            if (idx === -1) return;
            card = this.state.shop[idx];
            // 从商店购买时，只能放到备战席
            if (to !== 'bench') {
                // 检查备战席是否有空位
                if (this.state.team.bench.length >= 9) {
                    return this.log('🎒 备战席已满');
                }
                if (this.state.gold < card['费']) return this.log('💰 金币不足');
                this.state.gold -= card['费'];
                this.state.shop.splice(idx, 1);
                this.state.team.bench.push(card);
                this.calcStats();
                this.renderAll();
                this.log(`🛒 购买 ${card['角色']} 至备战席`);
                return;
            }
            // 默认拖拽到备战席
            if (this.state.team.bench.length >= 9) {
                return this.log('🎒 备战席已满');
            }
            if (this.state.gold < card['费']) return this.log('💰 金币不足');
            this.state.gold -= card['费'];
            this.state.shop.splice(idx, 1);
        } else {
            const [area, idx] = [fromParts[0], parseInt(fromParts[1])];
            if (area === 'bench') {
                card = this.state.team.bench.splice(idx, 1)[0];
            } else {
                // front 和 back 是固定长度数组，直接取出来并设为 null
                card = this.state.team[area][idx];
                this.state.team[area][idx] = null;
            }
        }
        if (!card) return;

        const toParts = to.split('_');
        const [tArea, tIdx] = [toParts[0], parseInt(toParts[1])];

        if (tArea === 'bench') {
            // 检查备战席是否已满（最多9格）
            if (this.state.team.bench.length >= 9) {
                // 放回原处
                if (fromParts[0] === 'bench') {
                    this.state.team.bench.splice(parseInt(fromParts[1]), 0, card);
                } else {
                    this.state.team[fromParts[0]][parseInt(fromParts[1])] = card;
                }
                return this.log('🎒 备战席已满');
            }
            this.state.team.bench.push(card);
        } else {
            if (this.state.team[tArea][tIdx]) {
                // 如果目标位置已有卡牌，将其移到备战席（如果备战席有空位）
                const existingCard = this.state.team[tArea][tIdx];
                if (this.state.team.bench.length < 9) {
                    this.state.team.bench.push(existingCard);
                } else {
                    // 备战席满，无法交换，放回原处
                    if (fromParts[0] === 'bench') {
                        this.state.team.bench.splice(parseInt(fromParts[1]), 0, card);
                    } else {
                        this.state.team[fromParts[0]][parseInt(fromParts[1])] = card;
                    }
                    return this.log('🎒 备战席已满，无法交换');
                }
            }
            this.state.team[tArea][tIdx] = card;
        }
        this.calcStats();
        this.renderAll();
        this.log(`🔄 ${card['角色']} 部署至 ${tArea}`);
    },

    levelUp() {
        const cost = this.state.level < 6 ? 4 : 5;
        if (this.state.gold < cost) return this.log('💰 升级金币不足');
        this.state.gold -= cost;
        this.state.level++;
        this.state.maxHp += 5;
        this.state.hp += 5;
        this.log(`⬆️ 升至 Lv.${this.state.level}！商店概率提升，生命+5`);
        this.refreshShop(true);
    },

    calcStats() {
        const { front, back } = this.state.team;
        const active = [...front, ...back].filter(Boolean);
        const count = {};
        active.forEach(c => (c['羁绊'] || '').split('、').forEach(b => b && (count[b] = (count[b] || 0) + 1)));
        this.state.bondsActive = Object.entries(count).filter(([_, v]) => v >= 2).map(([n, c]) => ({ name: n, count: c }));
        this.state.stats.base = {
            frontInt: active.reduce((s, c) => s + (c['前台强度'] || 0), 0),
            backInt: active.reduce((s, c) => s + (c['后台强度'] || 0), 0),
            speed: 100, dmgAmp: 10, critRate: 24, critDmg: 48
        };
    },

    updateUI() {
        this.calcStats();
        this._setText('resources', `❤️ ${this.state.hp}/${this.state.maxHp} | 💰 ${this.state.gold}`);
        this._setText('progress', `📍 ${this.state.node}`);
        this._setText('lvl-num', this.state.level);
        this._setText('xp-cur', this.state.xp);
        this._setText('xp-req', this.state.xpToNext);
        
        const xpPercent = (this.state.xp / this.state.xpToNext) * 100;
        const xpBar = this._el('xp-bar');
        if(xpBar) xpBar.style.width = `${xpPercent}%`;

        const canBattle = this.state.team.front.some(Boolean);
        const battleBtn = this._el('btn-start-battle');
        if(battleBtn) battleBtn.disabled = !canBattle;

        this._setHTML('bond-list', this.state.bondsActive.length ?
            this.state.bondsActive.map(b => `<span class="tag active" style="background:var(--accent);color:#000;padding:2px 6px;border-radius:4px;font-size:0.7rem;">${b.name}(${b.count})</span>`).join('') : '<span style="color:var(--text-dim);font-size:0.7rem;">未激活</span>');

        const s = this.state.stats.base;
        this._setHTML('stats-preview', `
            <div style="font-size:0.7rem;color:var(--text-dim);">
                <div>前台强度：<span style="color:var(--accent);">${s.frontInt}</span></div>
                <div>后台强度：<span style="color:var(--accent);">${s.backInt}</span></div>
                <div>伤害增幅：<span style="color:var(--gold);">${s.dmgAmp}%</span></div>
                <div>暴击率：<span style="color:var(--gold);">${s.critRate}%</span></div>
            </div>
        `);
    },

    renderShop() {
        this._setHTML('shop-grid', this.state.shop.map(c => `
            <div class="card shop-card" data-uid="${c.uid}" data-cost="${c['费']}">
                <div class="name">${c['角色']}</div>
                <div class="cost">${c['费']}费 | ${c['羁绊']?.split('、')[0] || '无'}</div>
                <div class="stars">⭐${c.stars}</div>
            </div>
        `).join(''));

        document.querySelectorAll('.shop-card').forEach(el => {
            el.onclick = () => this.assignCard(`shop_${el.dataset.uid}`, 'bench');
            el.ondragstart = (e) => {
                e.dataTransfer.setData('text/plain', `shop_${el.dataset.uid}`);
                e.dataTransfer.setData('card-cost', el.dataset.cost);
            };
            el.draggable = true;
        });
    },

    renderSlots() {
        // 渲染前台和后台（固定位置）
        const createSlot = (area, idx) => {
            const c = this.state.team[area][idx];
            return c ? `
                <div class="card" data-slot="${area}_${idx}" draggable="true">
                    <div class="name">${c['角色']}</div>
                    <div class="cost">${c['费']}费</div>
                    <button class="remove-btn" onclick="event.stopPropagation(); Game.assignCard('${area}_${idx}', 'bench')">↩</button>
                </div>` : `<div class="slot empty" data-slot="${area}_${idx}"></div>`;
        };

        this._setHTML('fl-slots', this.state.team.front.map((_, i) => createSlot('front', i)).join(''));
        this._setHTML('bl-slots', this.state.team.back.map((_, i) => createSlot('back', i)).join(''));
        
        // 渲染备战席（始终显示9个格子）
        let benchHTML = '';
        for (let i = 0; i < 9; i++) {
            const c = this.state.team.bench[i];
            if (c) {
                benchHTML += `<div class="card" data-slot="bench_${i}" draggable="true">
                    <div class="name">${c['角色']}</div>
                    <div class="cost">${c['费']}费</div>
                </div>`;
            } else {
                benchHTML += `<div class="slot empty" data-slot="bench_${i}"></div>`;
            }
        }
        this._setHTML('bench-slots', benchHTML);

        // 绑定拖拽与点击 - 使用事件委托确保所有元素都能正确响应
        const deploySection = this._el('deploy-section');
        
        // 为所有卡牌和空槽位绑定事件
        document.querySelectorAll('.card, .slot.empty').forEach(el => {
            el.ondragover = (e) => e.preventDefault();
            el.ondrop = (e) => {
                e.preventDefault();
                const data = e.dataTransfer.getData('text/plain');
                if (data) {
                    this.assignCard(data, el.dataset.slot);
                }
            };
            el.onclick = () => {
                if (el.classList.contains('empty')) {
                    const benchIdx = this.state.team.bench.findIndex(Boolean);
                    if (benchIdx !== -1) this.assignCard(`bench_${benchIdx}`, el.dataset.slot);
                }
            };
            // 为所有卡牌添加拖拽开始事件（包括前台、后台、备战席）
            if (el.classList.contains('card')) {
                el.ondragstart = (e) => {
                    e.dataTransfer.setData('text/plain', el.dataset.slot);
                    const costText = el.querySelector('.cost')?.textContent || '';
                    e.dataTransfer.setData('card-cost', costText);
                    console.log('dragstart:', el.dataset.slot, 'cost:', costText);
                };
                el.ondragend = (e) => {
                    console.log('dragend:', el.dataset.slot);
                };
            }
        });
        
        // 绑定出售区域的拖拽事件
        this.bindSellZones();
    },

    renderAll() { this.renderShop(); this.renderSlots(); this.updateUI(); },

    bindEvents() {
        this._el('btn-refresh')?.addEventListener('click', () => this.refreshShop(false));
        this._el('btn-buy-xp')?.addEventListener('click', () => this.levelUp());
        this._el('btn-start-battle')?.addEventListener('click', () => {
            if (typeof Combat === 'object' && Combat.start) Combat.start();
            else this.log('⚠️ 战斗模块未加载');
        });
    },

    log(msg) {
        const box = this._el('game-log');
        if (box) {
            box.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>`;
            box.scrollTop = box.scrollHeight;
        }
        console.log(`[货币战争] ${msg}`);
    },

    // 绑定出售区域的拖拽事件
    bindSellZones() {
        const sellLeft = this._el('sell-left');
        const sellRight = this._el('sell-right');
        
        [sellLeft, sellRight].forEach(zone => {
            if (!zone) return;
            
            zone.ondragover = (e) => {
                e.preventDefault();
                zone.classList.add('drag-over-sell');
            };
            
            zone.ondragleave = () => {
                zone.classList.remove('drag-over-sell');
            };
            
            zone.ondrop = (e) => {
                e.preventDefault();
                zone.classList.remove('drag-over-sell');
                const data = e.dataTransfer.getData('text/plain');
                const costText = e.dataTransfer.getData('card-cost');
                
                // 解析费用
                const costMatch = costText.match(/(\d+)/);
                const cost = costMatch ? parseInt(costMatch[1]) : 0;
                
                if (data && cost > 0) {
                    this.sellCard(data, cost);
                }
            };
        });
        
        // 添加拖拽进入时的显示效果
        document.addEventListener('dragenter', (e) => {
            const target = e.target;
            const sellLeft = this._el('sell-left');
            const sellRight = this._el('sell-right');
            
            if (target === sellLeft || target === sellRight) {
                const costText = e.dataTransfer?.getData('card-cost');
                const costMatch = costText?.match(/(\d+)/);
                const cost = costMatch ? parseInt(costMatch[1]) : 0;
                
                if (cost > 0) {
                    const priceVal = target.querySelector('.price-val');
                    if (priceVal) priceVal.textContent = cost;
                    target.classList.add('active');
                }
            }
        });
    },

    // 出售卡牌
    sellCard(slotRef, cost) {
        const parts = slotRef.split('_');
        const area = parts[0];
        const idx = parseInt(parts[1]);
        
        let card = null;
        if (area === 'bench') {
            if (idx >= 0 && idx < this.state.team.bench.length) {
                card = this.state.team.bench.splice(idx, 1)[0];
            }
        } else if (this.state.team[area] && idx >= 0 && idx < this.state.team[area].length) {
            card = this.state.team[area].splice(idx, 1)[0];
        }
        
        if (card) {
            const sellPrice = cost; // 出售价格等于费用
            this.state.gold += sellPrice;
            this.calcStats();
            this.renderAll();
            this.log(`💰 出售 ${card['角色']}，获得 ${sellPrice}💰`);
        }
    }
};

// 确保DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Game.init());
} else {
    Game.init();
}

// Popup 弹窗模块
const Popup = {
    show(title, content) {
        const overlay = document.getElementById("popup-overlay");
        const titleEl = document.getElementById("popup-title");
        const contentEl = document.getElementById("popup-content");
        if(overlay && titleEl && contentEl) {
            titleEl.textContent = title;
            contentEl.innerHTML = "<p>" + content + "</p>";
            overlay.classList.remove("hidden");
        }
    },
    close() {
        const overlay = document.getElementById("popup-overlay");
        if(overlay) overlay.classList.add("hidden");
    }
};
