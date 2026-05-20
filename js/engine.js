const Game = {
    state: {
        gold: 10, hp: 40, maxHp: 40, level: 3, xp: 0, xpReq: 4,
        node: '1-1', face: 1, turn: 1,
        shop: [], team: { front: [null, null, null], back: [null, null], bench: Array(9).fill(null) }
    },
    drag: { data: null, price: 0, sourceZone: null },
    pool: [], // 缓存角色库

    init() {
        this.pool = DATA.characters.map(c => ({...c, uid: null}));
        this.setupDragAndDrop();
        this.startNewNode();
        this.bindUI();
    },

    startNewNode() {
        this.generateEnemy();
        this.refreshShop(true); // 开局/新节点免费刷新
        this.render();
        Popup.show('🌍 新节点', `已抵达 ${this.state.node}。商店已免费刷新。`);
    },

    generateEnemy() {
        const enemies = ['银鬃尉官', '自动机兵·甲虫', '金人勾魂使', '黑潮蚀刃', '虚卒掠夺者'];
        const diff = Math.floor(Math.random() * 30) + 50 + (this.state.face * 10);
        this.enemyName = enemies[Math.floor(Math.random() * enemies.length)];
        this.enemyDiff = diff;
    },

    refreshShop(isFree = false) {
        if (!isFree && this.state.gold < 2) return Popup.show('💰 提示', '金币不足(需2💰)！');
        if (!isFree) this.state.gold -= 2;
        
        // 刷新逻辑：权重池
        const costs = [1,1,1,1,1, 2,2,2,2, 3,3,3, 4, 5]; // 简化概率池
        this.state.shop = [];
        for(let i=0; i<5; i++) {
            const c = this.pool[Math.floor(Math.random() * this.pool.length)];
            const star = 1 + Math.floor(Math.random() * 3); // 模拟星级
            this.state.shop.push({...c, uid: Date.now() + Math.random(), stars: star});
        }
        this.renderShop();
        this.updateUI();
    },

    calculateSellPrice(card) {
        // 公式：费用*星级 - 星级 + 1
        return Math.max(0, (card['费'] * card.stars) - card.stars + 1);
    },

    // 核心拖拽逻辑
    setupDragAndDrop() {
        document.addEventListener('dragstart', (e) => {
            const card = e.target.closest('.card[data-uid]');
            if (!card || card.classList.contains('empty-slot')) return;
            
            this.drag.data = { uid: card.dataset.uid, zone: card.dataset.zone, idx: parseInt(card.dataset.idx) };
            this.drag.sourceZone = card.dataset.zone;
            this.drag.price = this.calculateSellPrice(JSON.parse(card.dataset.json));
            
            document.querySelectorAll('.sell-zone').forEach(el => {
                el.classList.add('active');
                el.querySelector('.price-val').textContent = this.drag.price;
            });
            setTimeout(() => card.style.opacity = '0.4', 0);
        });

        document.addEventListener('dragend', (e) => {
            const card = e.target.closest('.card[data-uid]');
            if(card) card.style.opacity = '1';
            document.querySelectorAll('.sell-zone, .drop-zone').forEach(el => {
                el.classList.remove('active', 'drag-over', 'drag-over-sell');
            });
            this.drag.data = null;
        });

        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
            zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
            zone.addEventListener('drop', e => {
                e.preventDefault(); zone.classList.remove('drag-over');
                if(!this.drag.data) return;
                
                const targetZone = zone.dataset.zone;
                const dropIdx = [...zone.children].findIndex(child => {
                    const rect = child.getBoundingClientRect();
                    return e.clientX >= rect.left && e.clientX <= rect.right && e.clientY >= rect.top && e.clientY <= rect.bottom;
                });

                this.moveCharacter(targetZone, dropIdx === -1 ? 0 : dropIdx);
            });
        });

        document.querySelectorAll('.sell-zone').forEach(zone => {
            zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over-sell'); });
            zone.addEventListener('dragleave', () => zone.classList.remove('drag-over-sell'));
            zone.addEventListener('drop', e => {
                e.preventDefault(); zone.classList.remove('drag-over-sell');
                this.sellCharacter();
            });
        });
    },

    moveCharacter(targetZone, targetIdx) {
        const { uid, zone: srcZone, idx: srcIdx } = this.drag.data;
        // 提取源数据
        let charData = null;
        if (srcZone === 'shop') charData = this.state.shop.splice(srcIdx, 1)[0];
        else if (srcZone === 'frontline') charData = this.state.team.front[srcIdx];
        else if (srcZone === 'backline') charData = this.state.team.back[srcIdx];
        else if (srcZone === 'bench') charData = this.state.team.bench[srcIdx];

        if (!charData) return;

        // 处理目标位置
        if (targetZone !== 'bench' && targetZone !== 'frontline' && targetZone !== 'backline') return;
        
        // 商店买的卡自动补入空位，已上场的卡交换/放入
        if (targetZone === 'shop') { // 从阵容拖回商店不允许（简化）
             this.restoreSrc(charData, srcZone, srcIdx);
             return;
        }

        const targetArr = this.state.team[targetZone];
        // 找到空位或替换
        let placed = false;
        if (targetArr[targetIdx] === null) {
            targetArr[targetIdx] = charData;
            placed = true;
        } else if (srcZone !== 'shop') {
            // 交换
            const temp = targetArr[targetIdx];
            targetArr[targetIdx] = charData;
            this.restoreSrc(temp, srcZone, srcIdx);
            placed = true;
        }

        if (!placed) Popup.show('⚠️', '该位置已满，请先移动原角色或拖至空位。');
        this.render();
    },

    restoreSrc(char, zone, idx) {
        if (zone === 'shop') this.state.shop.splice(idx, 0, char);
        else this.state.team[zone][idx] = char;
    },

    sellCharacter() {
        const { uid, zone, idx } = this.drag.data;
        let charData = null;
        
        if (zone === 'frontline') charData = this.state.team.front.splice(idx, 1)[0];
        else if (zone === 'backline') charData = this.state.team.back.splice(idx, 1)[0];
        else if (zone === 'bench') charData = this.state.team.bench.splice(idx, 1)[0];
        else { Popup.show('⛔', '无法出售商店中的未购买角色！'); return; }

        if (charData) {
            const price = this.calculateSellPrice(charData);
            this.state.gold += price;
            this.render();
            Popup.show('💸 出售成功', `卖出 ${charData['角色']} (★${charData.stars})，获得 ${price} 金币。`);
        }
    },

    buyXP() {
        const cost = this.state.level < 5 ? 4 : 5;
        if (this.state.gold < cost) return Popup.show('💰', '升级金币不足！');
        if (this.state.level >= 9) return Popup.show('🎉', '已达到最高等级 Lv.9！');

        this.state.gold -= cost;
        this.state.xp++;
        if (this.state.xp >= this.state.xpReq) {
            this.state.level++;
            this.state.xp = 0;
            this.state.xpReq = this.state.level >= 5 ? 5 : 4;
            this.state.maxHp += 5; // 升级加血
            this.state.hp += 5;
            Popup.show('⬆️ 升级成功', `升至 Lv.${this.state.level}！生命上限+5，解锁更高费用角色概率。`);
            this.refreshShop(true); // 升级刷新一次
        }
        this.updateUI();
    },

    render() { this.renderShop(); this.renderTeam(); this.updateUI(); },

    renderShop() {
        const grid = document.getElementById('shop-grid');
        grid.innerHTML = this.state.shop.map((c, i) => `
            <div class="card" draggable="true" data-uid="${c.uid}" data-zone="shop" data-idx="${i}" data-json='${JSON.stringify(c)}'>
                <div style="font-weight:bold">${c['角色']}</div>
                <div class="cost">${c['费']}费 | ${c.stars}★</div>
                <div style="font-size:0.7rem;color:#888">${c['羁绊']?.split('、')[0] || '无'}</div>
            </div>`).join('') + `<div class="card empty-slot">空</div>`.repeat(Math.max(0, 5 - this.state.shop.length));
            
        // 点击购买
        grid.querySelectorAll('.card[data-zone="shop"]').forEach(el => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.dataset.idx);
                const card = this.state.shop[idx];
                if (!card || this.state.gold < card['费']) return Popup.show('💰', '金币不足');
                this.state.gold -= card['费'];
                this.state.shop.splice(idx, 1);
                // 放入备战席空位
                const benchIdx = this.state.team.bench.findIndex(x => x === null);
                if (benchIdx !== -1) this.state.team.bench[benchIdx] = card;
                else Popup.show('⚠️', '备战席已满！请出售或调整位置。');
                this.render();
            });
        });
    },

    renderTeam() {
        const renderZone = (id, zone, arr) => {
            document.getElementById(id).innerHTML = arr.map((c, i) => c ? `
                <div class="card" draggable="true" data-uid="${c.uid}" data-zone="${zone}" data-idx="${i}" data-json='${JSON.stringify(c)}'>
                    <div style="font-weight:bold">${c['角色']}</div>
                    <div class="cost">${c['费']}费 | ${c.stars}★</div>
                </div>` : `<div class="card empty-slot" data-zone="${zone}" data-idx="${i}"></div>`
            ).join('');
        };
        renderZone('fl-slots', 'frontline', this.state.team.front);
        renderZone('bl-slots', 'backline', this.state.team.back);
        renderZone('bench-slots', 'bench', this.state.team.bench);
    },

    updateUI() {
        document.getElementById('enemy-info').textContent = `👹 ${this.enemyName} (难度: ${this.enemyDiff})`;
        document.getElementById('progress').textContent = `📍 ${this.state.face}面-${this.state.node.split('-')[1]}`;
        document.getElementById('resources').textContent = `❤️ ${this.state.hp}/${this.state.maxHp} | 💰 ${this.state.gold}`;
        document.getElementById('lvl-num').textContent = this.state.level;
        document.getElementById('xp-cur').textContent = this.state.xp;
        document.getElementById('xp-req').textContent = this.state.xpReq;
        document.getElementById('xp-bar').style.width = `${(this.state.xp / this.state.xpReq)*100}%`;
        document.getElementById('btn-start-battle').disabled = this.state.team.front.every(x => !x);
    },

    bindUI() {
        document.getElementById('btn-refresh').onclick = () => this.refreshShop(false);
        document.getElementById('btn-buy-xp').onclick = () => this.buyXP();
        document.getElementById('btn-start-battle').onclick = () => Combat.start();
    }
};

const Popup = {
    show(title, msg) {
        console.log(`[通知] ${title}: ${msg}`);
        document.getElementById('popup-title').textContent = title;
        document.getElementById('popup-content').textContent = msg;
        document.getElementById('popup-overlay').classList.remove('hidden');
        setTimeout(() => this.close(), 5000);
    },
    close() { document.getElementById('popup-overlay').classList.add('hidden'); }
};

window.onload = () => Game.init();
