// 游戏核心状态机
const Game = {
    state: {
        gold: 10, level: 3, xp: 0, xpToNext: 4, hp: 40, maxHp: 40,
        node: '1-1', face: 1, turn: 1,
        shop: [], team: { front: [null, null, null], back: [null, null], bench: [] },
        inventory: [], strategies: [], bondsActive: [], stats: { base: {} }
    },

    init() {
        this.renderShop();
        this.renderSlots();
        this.updateUI();
        this.log('🎮 货币战争 V4.2 模拟器启动。请先招募角色组建阵容！');
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('btn-refresh').onclick = () => this.refreshShop();
        document.getElementById('btn-levelup').onclick = () => this.levelUp();
        document.getElementById('btn-start-battle').onclick = () => Combat.startNode();
        document.getElementById('btn-close-battle').onclick = () => this.endBattlePhase();
    },

    // 商店生成
    refreshShop() {
        if (this.state.gold < 2) return this.log('💰 金币不足');
        this.state.gold -= 2;
        const pool = DATA.characters.filter(c => c['费'] <= this.state.level + 1);
        this.state.shop = Array(3).fill(null).map(() => {
            const char = pool[Math.floor(Math.random() * pool.length)];
            return { ...char, uid: Date.now() + Math.random(), stars: 1 };
        });
        this.renderShop();
        this.updateUI();
    },

    // 购买/出售/上阵
    buyCard(uid, targetSlot) {
        const card = this.state.shop.find(c => c.uid === uid);
        if (!card || this.state.gold < card['费']) return this.log('💰 金币不足');
        
        this.state.gold -= card['费'];
        this.state.shop = this.state.shop.filter(c => c.uid !== uid);
        
        if (targetSlot === 'bench') {
            this.state.team.bench.push(card);
        } else {
            const [area, idx] = targetSlot.split('_');
            this.state.team[area][idx] = card;
        }
        this.renderAll();
        this.log(`✅ 招募 ${card['角色']} 至 ${targetSlot === 'bench' ? '备战席' : targetSlot}`);
    },

    sellCard(uid) {
        // 查找并出售逻辑（简化：仅备战席可卖，上阵需先移出）
        const bench = this.state.team.bench.find(c => c.uid === uid);
        if (bench) {
            this.state.gold += bench['费'] - 1; // 售价规则
            this.state.team.bench = this.state.team.bench.filter(c => c.uid !== uid);
            this.renderAll();
            this.log(`💵 出售 ${bench['角色']}`);
        }
    },

    assignCard(from, to) {
        // 拖拽分配逻辑
        let card;
        if (from === 'shop') {
            card = this.state.shop.pop(); // 简化：点击自动购买并上阵
            if (this.state.gold < card['费']) return this.state.shop.push(card);
            this.state.gold -= card['费'];
        } else {
            const [area, idx] = from.split('_');
            if (area === 'bench') card = this.state.team.bench.splice(idx, 1)[0];
            else card = this.state.team[area][idx];
            this.state.team[area][idx] = null;
        }

        const [tArea, tIdx] = to.split('_');
        this.state.team[tArea][tIdx] = card;
        this.renderAll();
        this.log(`🔄 调动 ${card['角色']} 至 ${tArea}`);
    },

    levelUp() {
        const cost = this.state.level < 6 ? 4 : 5;
        if (this.state.gold < cost) return this.log('💰 金币不足');
        this.state.gold -= cost;
        this.state.level++;
        this.log(`⬆️ 升至 Lv.${this.state.level}，商店刷新概率提升！`);
        this.refreshShop();
    },

    // 实时计算羁绊与面板
    calcStats() {
        const { front, back } = this.state.team;
        const activeChars = [...front, ...back].filter(Boolean);
        const bondCount = {};
        activeChars.forEach(c => {
            (c['羁绊'] || '').split('、').forEach(b => {
                bondCount[b] = (bondCount[b] || 0) + 1;
            });
        });

        this.state.bondsActive = Object.entries(bondCount)
            .filter(([_, count]) => count >= 2)
            .map(([name]) => name);

        // 简化面板计算（完整公式在 combat.js）
        this.state.stats.base = {
            frontInt: activeChars.reduce((sum, c) => sum + (c['前台强度'] || 0), 0),
            backInt: activeChars.reduce((sum, c) => sum + (c['后台强度'] || 0), 0),
            speed: 100, dmgAmp: 10, critRate: 24, critDmg: 48
        };
    },

    // UI 渲染
    renderShop() {
        const grid = document.getElementById('shop-grid');
        grid.innerHTML = this.state.shop.map(c => `
            <div class="card" draggable="true" data-uid="${c.uid}">
                <div class="name">${c['角色']}</div>
                <div class="cost">${c['费']}费 | ${c['羁绊']?.split('、')[0] || ''}</div>
                <div class="stars">⭐${c.stars}</div>
            </div>
        `).join('');
        grid.querySelectorAll('.card').forEach(el => {
            el.onclick = () => this.assignCard(`shop_${el.dataset.uid}`, 'bench');
        });
    },

    renderSlots() {
        const renderArea = (id, area) => {
            const container = document.getElementById(id);
            container.innerHTML = this.state.team[area].map((c, i) => {
                if (!c) return `<div class="slot empty" data-slot="${area}_${i}">空位</div>`;
                return `<div class="card" draggable="true" data-slot="${area}_${i}">
                    <div class="name">${c['角色']}</div><div class="cost">${c['费']}费</div>
                </div>`;
            }).join('');
            // 拖放逻辑绑定...
        };
        renderArea('fl-slots', 'front');
        renderArea('bl-slots', 'back');
        document.getElementById('bench-slots').innerHTML = this.state.team.bench.map((c, i) => `
            <div class="card" draggable="true" data-slot="bench_${i}">
                <div class="name">${c['角色']}</div><div class="cost">${c['费']}费</div>
                <button onclick="Game.sellCard('${c.uid}')" style="margin-top:auto; font-size:0.7rem;">出售</button>
            </div>
        `).join('');
    },

    updateUI() {
        this.calcStats();
        document.getElementById('s-gold').textContent = `💰 ${this.state.gold}`;
        document.getElementById('s-lvl').textContent = `⭐ Lv.${this.state.level}`;
        document.getElementById('s-xp').textContent = `📖 ${this.state.xp}/${this.state.xpToNext}`;
        document.getElementById('s-hp').textContent = `❤️ ${this.state.hp}/${this.state.maxHp}`;
        document.getElementById('s-node').textContent = `📍 ${this.state.node}`;
        document.getElementById('btn-start-battle').disabled = this.state.team.front.every(x => !x);

        document.getElementById('bond-list').innerHTML = this.state.bondsActive.length ? 
            this.state.bondsActive.map(b => `<span class="tag active">${b}</span>`).join('') : '<span class="tag">未激活</span>';
        
        const s = this.state.stats.base;
        document.getElementById('stats-preview').innerHTML = `
            <div class="stat-item"><span>前台强度</span><span>${s.frontInt}</span></div>
            <div class="stat-item"><span>后台强度</span><span>${s.backInt}</span></div>
            <div class="stat-item"><span>伤害增幅</span><span>${s.dmgAmp}%</span></div>
            <div class="stat-item"><span>暴击率</span><span>${s.critRate}%</span></div>
        `;
    },

    renderAll() { this.renderShop(); this.renderSlots(); this.updateUI(); },
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

// 初始化
window.onload = () => Game.init();
