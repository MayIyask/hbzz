// js/engine.js
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
        this.bindEvents();
        this.log('🎮 货币战争 V4.2 模拟器启动。点击商店角色购买，拖拽或点击调配阵容！');
    },

    bindEvents() {
        document.getElementById('btn-refresh').onclick = () => this.refreshShop();
        document.getElementById('btn-levelup').onclick = () => this.levelUp();
        document.getElementById('btn-start-battle').onclick = () => Combat.startNode();
        document.getElementById('btn-close-battle').onclick = () => this.endBattlePhase();
    },

    refreshShop() {
        if (this.state.gold < 2 && this.state.shop.length > 0) return this.log('💰 金币不足(2)');
        if (this.state.shop.length === 0) this.state.gold -= 2;
        
        const pool = DATA.characters.filter(c => c['费'] <= this.state.level + 1);
        // 保持商店数量在3-5个
        while(this.state.shop.length < 3) {
            const char = pool[Math.floor(Math.random() * pool.length)];
            this.state.shop.push({ ...char, uid: Date.now() + Math.random(), stars: 1 });
        }
        this.renderAll();
    },

    // 核心修复：正确处理 shop_uid 和 area_idx 格式的参数
    assignCard(from, to) {
        let card;
        const fromParts = from.split('_');
        
        // 1. 取出卡牌
        if (fromParts[0] === 'shop') {
            const uid = fromParts[1];
            const idx = this.state.shop.findIndex(c => String(c.uid) === uid);
            if (idx === -1) return;
            card = this.state.shop[idx];

            if (this.state.gold < card['费']) return this.log('💰 金币不足');
            this.state.gold -= card['费'];
            this.state.shop.splice(idx, 1); // 购买后移除
        } else {
            const [area, i] = fromParts;
            const idx = parseInt(i);
            if (area === 'bench') {
                card = this.state.team.bench.splice(idx, 1)[0];
            } else {
                card = this.state.team[area][idx];
                this.state.team[area][idx] = null;
            }
        }

        if (!card) return;

        // 2. 放置卡牌
        const toParts = to.split('_');
        const [tArea, j] = toParts;
        const tIdx = j ? parseInt(j) : null;

        if (tArea === 'bench') {
            this.state.team.bench.push(card);
        } else {
            // 如果目标槽位已有卡，挤到备战席
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
        this.log(`⬆️ 升至 Lv.${this.state.level}！刷新概率提升`);
        this.refreshShop();
    },

    calcStats() {
        const { front, back } = this.state.team;
        const activeChars = [...front, ...back].filter(Boolean);
        const bondCount = {};
        
        activeChars.forEach(c => {
            (c['羁绊'] || '').split('、').forEach(b => {
                if(b) bondCount[b] = (bondCount[b] || 0) + 1;
            });
        });

        this.state.bondsActive = Object.entries(bondCount)
            .filter(([_, count]) => count >= 2)
            .map(([name]) => ({ name, count }));

        this.state.stats.base = {
            frontInt: activeChars.reduce((sum, c) => sum + (c['前台强度'] || 0), 0),
            backInt: activeChars.reduce((sum, c) => sum + (c['后台强度'] || 0), 0),
            speed: 100, dmgAmp: 10, critRate: 24, critDmg: 48
        };
    },

    renderAll() {
        this.calcStats();
        this.renderShop();
        this.renderSlots();
        
        // 更新 UI 状态
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
            <div class="stat-item"><span>暴击率</span><span>${s.critRate}%</span></div>
        `;
    },

    renderShop() {
        const grid = document.getElementById('shop-grid');
        grid.innerHTML = this.state.shop.map(c => `
            <div class="card" draggable="true" data-uid="${c.uid}">
                <div class="name">${c['角色']}</div>
                <div class="cost">${c['费']}费 | ${c['羁绊']?.split('、')[0] || '无'}</div>
                <div class="stars">⭐${c.stars}</div>
            </div>
        `).join('');

        grid.querySelectorAll('.card').forEach(el => {
            // 点击商店角色：自动购买并放入备战席
            el.onclick = () => this.assignCard(`shop_${el.dataset.uid}`, 'bench');
            el.ondragstart = (e) => e.dataTransfer.setData('text/plain', `shop_${el.dataset.uid}`);
        });
    },

    renderSlots() {
        const createSlot = (id, area, idx) => {
            const c = this.state.team[area][idx];
            return c ? `
                <div class="card" draggable="true" data-slot="${area}_${idx}">
                    <div class="name">${c['角色']}</div>
                    <div class="cost">${c['费']}费</div>
                    <button onclick="event.stopPropagation(); Game.assignCard('${area}_${idx}', 'bench')" style="margin-top:auto;font-size:0.7rem;">撤回</button>
                </div>` : `<div class="slot empty" data-slot="${area}_${idx}">空位</div>`;
        };

        document.getElementById('fl-slots').innerHTML = this.state.team.front.map((_, i) => createSlot('fl-slots', 'front', i)).join('');
        document.getElementById('bl-slots').innerHTML = this.state.team.back.map((_, i) => createSlot('bl-slots', 'back', i)).join('');
        document.getElementById('bench-slots').innerHTML = this.state.team.bench.map((_, i) => createSlot('bench-slots', 'bench', i)).join('');

        // 绑定拖拽与点击
        document.querySelectorAll('.card, .slot.empty').forEach(el => {
            el.ondragover = (e) => e.preventDefault();
            el.ondrop = (e) => {
                e.preventDefault();
                const data = e.dataTransfer.getData('text/plain');
                const target = el.dataset.slot || 'bench';
                this.assignCard(data, target);
            };
            el.onclick = () => {
                // 点击空位：把最后选中的或备战席第一个移入
                const benchFirst = this.state.team.bench[0];
                if(benchFirst && el.classList.contains('empty')) {
                    this.assignCard('bench_0', el.dataset.slot);
                }
            };
        });
    },

    log(msg) {
        const box = document.getElementById('game-log');
        box.innerHTML += `<div>[${new Date().toLocaleTimeString()}] ${msg}</div>`;
        box.scrollTop = box.scrollHeight;
    },

    endBattlePhase() {
        document.getElementById('battle-modal').classList.add('hidden');
        this.log('✅ 战斗结束，返回备战阶段。');
        this.renderAll();
    }
};

window.onload = () => Game.init();
