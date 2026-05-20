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

    assignCard(from, to) {
        const fromParts = from.split('_');
        let card = null;

        if (fromParts[0] === 'shop') {
            const idx = this.state.shop.findIndex(c => String(c.uid) === fromParts[1]);
            if (idx === -1) return;
            card = this.state.shop[idx];
            if (this.state.gold < card['费']) return this.log('💰 金币不足');
            this.state.gold -= card['费'];
            this.state.shop.splice(idx, 1);
        } else {
            const [area, idx] = [fromParts[0], parseInt(fromParts[1])];
            if (area === 'bench') card = this.state.team.bench.splice(idx, 1)[0];
            else card = this.state.team[area].splice(idx, 1)[0];
        }
        if (!card) return;

        const toParts = to.split('_');
        const [tArea, tIdx] = [toParts[0], parseInt(toParts[1])];

        if (tArea === 'bench') {
            this.state.team.bench.push(card);
        } else {
            if (this.state.team[tArea][tIdx]) {
                this.state.team.bench.push(this.state.team[tArea][tIdx]);
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
        this._setText('s-gold', `💰 ${this.state.gold}`);
        this._setText('s-lvl', `⭐ Lv.${this.state.level}`);
        this._setText('s-xp', `📖 ${this.state.xp}/${this.state.xpToNext}`);
        this._setText('s-hp', `❤️ ${this.state.hp}/${this.state.maxHp}`);
        this._setText('s-node', `📍 ${this.state.node}`);
        
        const canBattle = this.state.team.front.some(Boolean);
        this._setAttr('btn-start-battle', 'disabled', canBattle ? '' : 'disabled');

        this._setHTML('bond-list', this.state.bondsActive.length ? 
            this.state.bondsActive.map(b => `<span class="tag active">${b.name}(${b.count})</span>`).join('') : '<span class="tag">未激活</span>');
        
        const s = this.state.stats.base;
        this._setHTML('stats-preview', `
            <div class="stat-item"><span>前台强度</span><span>${s.frontInt}</span></div>
            <div class="stat-item"><span>后台强度</span><span>${s.backInt}</span></div>
            <div class="stat-item"><span>伤害增幅</span><span>${s.dmgAmp}%</span></div>
            <div class="stat-item"><span>暴击率</span><span>${s.critRate}%</span></div>
        `);
    },

    renderShop() {
        this._setHTML('shop-grid', this.state.shop.map(c => `
            <div class="card shop-card" data-uid="${c.uid}">
                <div class="name">${c['角色']}</div>
                <div class="cost">${c['费']}费 | ${c['羁绊']?.split('、')[0] || '无'}</div>
                <div class="stars">⭐${c.stars}</div>
            </div>
        `).join(''));

        document.querySelectorAll('.shop-card').forEach(el => {
            el.onclick = () => this.assignCard(`shop_${el.dataset.uid}`, 'bench');
            el.ondragstart = (e) => e.dataTransfer.setData('text/plain', `shop_${el.dataset.uid}`);
            el.draggable = true;
        });
    },

    renderSlots() {
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
        this._setHTML('bench-slots', this.state.team.bench.map((_, i) => createSlot('bench', i)).join(''));

        // 绑定拖拽与点击
        document.querySelectorAll('.card, .slot.empty').forEach(el => {
            el.ondragover = (e) => e.preventDefault();
            el.ondrop = (e) => {
                e.preventDefault();
                const data = e.dataTransfer.getData('text/plain');
                this.assignCard(data, el.dataset.slot);
            };
            el.onclick = () => {
                if (el.classList.contains('empty')) {
                    const benchIdx = this.state.team.bench.findIndex(Boolean);
                    if (benchIdx !== -1) this.assignCard(`bench_${benchIdx}`, el.dataset.slot);
                }
            };
        });
    },

    renderAll() { this.renderShop(); this.renderSlots(); this.updateUI(); },

    bindEvents() {
        this._el('btn-refresh')?.addEventListener('click', () => this.refreshShop(false));
        this._el('btn-levelup')?.addEventListener('click', () => this.levelUp());
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
    }
};

// 确保DOM加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Game.init());
} else {
    Game.init();
}
