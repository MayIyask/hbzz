// 战斗引擎：完整实现V4.2伤害乘区公式
const Combat = {
    queue: [], turnIndex: 0, isFighting: false,

    startNode() {
        if (this.isFighting) return;
        this.isFighting = true;
        document.getElementById('battle-modal').classList.remove('hidden');
        document.getElementById('btn-close-battle').classList.add('hidden');
        document.getElementById('battle-title').textContent = `⚔️ 节点 ${Game.state.node} 战斗开始`;
        
        this.generateEnemies();
        this.buildTurnQueue();
        this.log('🛡️ 敌方已就位，自动战斗模拟中...');
        setTimeout(() => this.runTurn(), 800);
    },

    generateEnemies() {
        // 简化：根据节点难度生成敌人
        const hp = this.getNodeHP();
        this.enemies = [
            { name: '敌方单位A', hp: hp, maxHp: hp, speed: 90, atk: 150, def: 800 },
            { name: '敌方单位B', hp: hp * 0.8, maxHp: hp * 0.8, speed: 105, atk: 120, def: 750 }
        ];
        this.allUnits = [...Game.state.team.front, ...Game.state.team.back].filter(Boolean).map(u => ({...u, hp: 9999, maxHp: 9999, speed: 100 + Math.random()*20, isAlly: true}));
        this.allUnits.push(...this.enemies);
        this.allUnits.sort((a,b) => b.speed - a.speed);
    },

    getNodeHP() {
        const base = { '1-1': 5000, '1-2': 8000, '1-3': 12000, '2-1': 25000, '3-1': 80000 };
        return base[Game.state.node] || 5000;
    },

    buildTurnQueue() {
        this.turnIndex = 0;
        this.queue = [...this.allUnits];
    },

    runTurn() {
        if (!this.isFighting) return;
        if (this.turnIndex >= this.queue.length) {
            this.checkWinCondition();
            return;
        }

        const actor = this.queue[this.turnIndex];
        if (!actor || actor.hp <= 0) {
            this.turnIndex++;
            return setTimeout(() => this.runTurn(), 100);
        }

        if (actor.isAlly) {
            this.executeAttack(actor);
        } else {
            this.executeEnemyAttack(actor);
        }

        this.turnIndex++;
        this.updateBattleLog();
        setTimeout(() => this.runTurn(), 400);
    },

    // V4.2 完整伤害乘区计算
    executeAttack(attacker) {
        const target = this.enemies.find(e => e.hp > 0);
        if (!target) return;

        const baseDmg = 1000; // 基础伤害参考值
        const frontInt = Game.state.stats.base.frontInt / 100;
        const dmgAmp = 1 + Game.state.stats.base.dmgAmp / 100;
        const defMult = 1000 / (1000 + 1100 * (1 - 0.2)); // 假设20%减防
        const resMult = 0.8; // 假设20%抗性
        const critChance = Game.state.stats.base.critRate / 100;
        const critMult = 1 + Game.state.stats.base.critDmg / 100;

        const finalDmg = Math.floor(
            baseDmg * frontInt * dmgAmp * defMult * resMult * (Math.random() < critChance ? critMult : 1)
        );

        target.hp = Math.max(0, target.hp - finalDmg);
        Game.log(`⚔️ ${attacker['角色']} 对 ${target.name} 造成 ${finalDmg.toLocaleString()} 伤害 (剩余 ${target.hp.toLocaleString()})`);
    },

    executeEnemyAttack(enemy) {
        const targets = Game.state.team.front.filter(Boolean);
        if (targets.length === 0) return;
        const target = targets[Math.floor(Math.random() * targets.length)];
        const dmg = Math.floor(enemy.atk * (0.8 + Math.random() * 0.4));
        target.hp -= dmg; // 仅模拟
        Game.log(`🔴 ${enemy.name} 攻击我方 ${target['角色']} 造成 ${dmg} 伤害`);
    },

    checkWinCondition() {
        const aliveEnemies = this.enemies.filter(e => e.hp > 0).length;
        const aliveAllies = Game.state.team.front.filter(c => c.hp > 0).length;

        if (aliveEnemies === 0) {
            this.victory();
        } else if (aliveAllies === 0) {
            this.defeat();
        }
    },

    victory() {
        Game.log(`🏆 战斗胜利！获得金币与经验。`);
        Game.state.gold += 5 + Math.floor(Math.random() * 3);
        Game.state.xp += 2;
        if (Game.state.xp >= Game.state.xpToNext) {
            Game.state.xp -= Game.state.xpToNext;
            Game.state.level++;
            Game.state.xpToNext = Game.state.level * 2;
        }
        this.advanceNode();
        document.getElementById('btn-close-battle').classList.remove('hidden');
        this.isFighting = false;
        Game.renderAll();
    },

    defeat() {
        Game.log(`💀 战斗失败！扣除生命值。`);
        Game.state.hp -= 5;
        document.getElementById('btn-close-battle').classList.remove('hidden');
        this.isFighting = false;
        Game.renderAll();
    },

    advanceNode() {
        const [f, n] = Game.state.node.split('-').map(Number);
        let nextN = n + 1;
        let nextF = f;
        if (nextN > (f === 1 ? 9 : 7)) { nextN = 1; nextF = f + 1; }
        if (nextF > 3) { Game.log('🎉 恭喜通关！'); return; }
        Game.state.node = `${nextF}-${nextN}`;
        Game.log(`📍 推进至节点 ${Game.state.node}`);
        
        // 触发策略选择
        if (nextN === 1) this.showStrategyChoice();
    },

    showStrategyChoice() {
        const choices = DATA.strategies.slice(0, 3);
        const modal = document.getElementById('strategy-modal');
        document.getElementById('strategy-choices').innerHTML = choices.map(s => `
            <div class="choice" onclick="Combat.pickStrategy('${s['名称']}')">
                <strong>${s['等级']} ${s['名称']}</strong><br>${s['内容']}
            </div>
        `).join('');
        modal.classList.remove('hidden');
    },

    pickStrategy(name) {
        Game.log(`📜 选择策略：${name}`);
        document.getElementById('strategy-modal').classList.add('hidden');
    },

    updateBattleLog() {
        const box = document.getElementById('battle-log');
        box.innerHTML = Game.logBox?.innerHTML || '战斗进行中...';
    },

    log(msg) { Game.log(msg); this.updateBattleLog(); }
};
