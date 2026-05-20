const Game = {
    state: {
        gold: 10, level: 3, xp: 0, xpToNext: 4, hp: 40, maxHp: 40,
        node: '1-1', face: 1, turn: 1,
        shop: [], team: { front: [null, null, null], back: [null, null], bench: [] },
        inventory: [], strategies: [], bondsActive: [], stats: { base: {} }
    },

    init() {
        this.refreshShop();
        this.renderAll();
        this.setupDragAndDrop();
        this.log('🎮 货币战争 V4.2 模拟器启动。点击商店角色购买，拖拽调配阵容！');
    },

    // 🔄 安全拖拽系统（使用 JSON 传输，事件委托绑定，带边界防护）
    setupDragAndDrop() {
        // 拖拽开始
        document.addEventListener('dragstart', (e) => {
            const el = e.target.closest('.card[data-uid], .slot.empty[data-slot]');
            if (!el || el.classList.contains('empty')) {
                e.preventDefault();
                return;
            }
            const isShop = el.dataset.source === 'shop';
            const payload = isShop 
                ? { type: 'shop', uid: el.dataset.uid }
                : { type: el.dataset.slot.split('_')[0], idx: parseInt(el.dataset.slot.split('_')[1]) };
            
            e.dataTransfer.setData('application/json', JSON.stringify(payload));
            e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => el.style.opacity = '0.4', 0);
        });

        document.addEventListener('dragend', (e) => {
            const el = e.target.closest('.card');
            if (el) el.style.opacity = '1';
            document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
        });

        // 拖拽悬停
        document.addEventListener('dragover', (e) => {
            const target = e.target.closest('.slot.empty');
            if (target) {
                e.preventDefault();
                target.classList.add('drag-over');
            }
        });

        document.addEventListener('dragleave', (e) => {
            const target = e.target.closest('.slot.empty');
            if (target) target.classList.remove('drag-over');
        });

        // 放置
        document.addEventListener('drop', (e) => {
            e.preventDefault();
            const target = e.target.closest('.slot.empty');
            if (!target) return;
            target.classList.remove('drag-over');

            let payload;
            try {
                payload = JSON.parse(e.dataTransfer.getData('application/json'));
            } catch { return; }

            const toSlot = target.dataset.slot;
            if (!toSlot) return;

            this.moveCard(payload, toSlot);
        });
    },

    moveCard(payload, toSlot) {
        const [tArea, tIdxStr] = toSlot.split('_');
        const tIdx = parseInt(tIdxStr);

        // 🛡️ 边界防护：确保目标数组存在
        if (!this.state.team[tArea] || tIdx < 0 || tIdx >= this.state.team[tArea].length) {
            console.warn('⚠️ 无效放置区域');
            return;
        }

        let card = null;

        // 1. 取出源卡牌
        if (payload.type === 'shop') {
            const sIdx = this.state.shop.findIndex(c => String(c.uid) === String(payload.uid));
            if (sIdx === -1) return;
            card = this.state.shop.splice(sIdx, 1)[0];
            if (this.state.gold < card['费']) {
                this.state.shop.push(card);
                this.log('💰 金币不足');
                return;
            }
            this.state.gold -= card['费'];
        } else {
            const { type, idx } = payload;
            if (type === 'bench') {
                card = this.state.team.bench.splice(idx, 1)[0];
            } else if (this.state.team[type]) {
                card = this.state.team[type][idx];
                this.state.team[type][idx] = null;
            }
        }
        if (!card) return;

        // 2. 放入目标位置（若已有卡，挤到备战席）
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
        this.log(`🔄 ${card['角色']} 已移至 ${tArea}`);
    },

    // 🏪 商店刷新
    refreshShop() {
        if (this.state.gold < 2) return this.log('💰 刷新需 2 金币');
        this.state.gold -= 2;
        const pool = DATA.characters.filter(c => c['费'] <= this.state.level + 1);
        this.state.shop = Array.from({ length: 5 }, () => {
            const char = pool[Math.floor(Math.random() * pool.length)];
            return { ...char, uid: Date.now() + Math.random().toString(36).slice(2), stars: 1 };
        });
        this.renderAll();
    },

    levelUp() {
        const cost = this.state.level < 6 ? 4 : 5;
        if (this.state.gold < cost) return this.log('💰 升级金币不足');
        if (this.state.level >= 9) return this.log('🎉 已达最高等级');
        this.state.gold -= cost;
        this.state.level++;
        this.log(`⬆️ 升至 Lv.${this.state.level}！商店概率提升`);
        this.refreshShop(); // 升级免费刷新一次
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

    // 🎨 UI 渲染
    renderShop() {
        document.getElementById('shop-grid').innerHTML = this.state.shop.map(c => `
            <div class="card" draggable="true" data-source="shop" data-uid="${c.uid}">
                <div class="name">${c['角色']}</div>
                <div class="cost">${c['费']}费 | ${c['羁绊']?.split('、')[0] || '无'}</div>
                <div class="stars">⭐${c.stars}</div>
            </div>`).join('');
    },

    renderSlots() {
        const gen = (id, area) => {
            document.getElementById(id).innerHTML = this.state.team[area].map((c, i) => c ? `
                <div class="card" draggable="true" data-source="${area}" data-slot="${area}_${i}" style="opacity:0.4;cursor:not-allowed;">
                    <div class="name">${c['角色']}</div><div class="cost">${c['费']}费</div>
                </div>` : `<div class="slot empty" data-slot="${area}_${i}"></div>`).join('');
        };
        gen('fl-slots', 'front');
        gen('bl-slots', 'back');
        document.getElementById('bench-slots').innerHTML = this.state.team.bench.map((c, i) => c ? `
            <div class="card" draggable="true" data-source="bench" data-slot="bench_${i}">
                <div class="name">${c['角色']}</div><div class="cost">${c['费']}费</div>
                <button onclick="event.stopPropagation(); Game.sellCard(${i})" style="margin-top:auto;font-size:0.7rem;">出售</button>
            </div>` : `<div class="slot empty" data-slot="bench_${i}"></div>`).join('');
    },

    sellCard(benchIdx) {
        const card = this.state.team.bench.splice(benchIdx, 1)[0];
        if (!card) return;
        this.state.gold += card['费'] * card.stars - card.stars + 1;
        this.calcStats(); this.renderAll();
        this.log(`💵 出售 ${card['角色']} (+${card['费'] * card.stars - card.stars + 1}💰)`);
    },

    updateUI() {
        document.getElementById('s-gold').textContent = `💰 ${this.state.gold}`;
        document.getElementById('s-lvl').textContent = `⭐ Lv.${this.state.level}`;
        document.getElementById('s-xp').textContent = `📖 ${this.state.xp}/${this.state.xpToNext}`;
        document.getElementById('s-hp').textContent = `❤️ ${this.state.hp}/${this.state.maxHp}`;
        document.getElementById('s-node').textContent = `📍 ${this.state.node}`;
        document.getElementById('btn-start-battle').disabled = !this.state.team.front.some(Boolean);
        document.getElementById('bond-list').innerHTML = this.state.bondsActive.length ? 
            this.state.bondsActive.map(b => `<span class="tag active">${b.name}(${b.count})</span>`).join('') : '<span class="tag">未激活</span>';
        const s = this.state.stats.base;
        document.getElementById('stats-preview').innerHTML = `
            <div class="stat-item"><span>前台强度</span><span>${s.frontInt}</span></div>
            <div class="stat-item"><span>后台强度</span><span>${s.backInt}</span></div>
            <div class="stat-item"><span>伤害增幅</span><span>${s.dmgAmp}%</span></div>
            <div class="stat-item"><span>暴击率</span><span>${s.critRate}%</span></div>`;
    },

    renderAll() { this.calcStats(); this.renderShop(); this.renderSlots(); this.updateUI(); },
    log(msg) {
        const box = document.getElementById('game-log');
        box.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>`;
        box.scrollTop = box.scrollHeight;
    }
};

window.onload = () => Game.init();
