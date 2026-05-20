const Combat = {
    isRunning: false,

    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        document.getElementById('btn-start-battle').disabled = true;
        Popup.show('⚔️ 战斗开始', '正在计算伤害乘区与结算中...');
        
        // 模拟战斗过程并输出到控制台
        console.log('=== 战斗日志开始 ===');
        const logs = [];
        logs.push(`▶ 节点 ${Game.state.node} 遭遇 ${Game.enemyName} (难度 ${Game.enemyDiff})`);
        
        const frontCount = Game.state.team.front.filter(Boolean).length;
        const backCount = Game.state.team.back.filter(Boolean).length;
        logs.push(`📊 阵容: 前台${frontCount}人 | 后台${backCount}人`);
        logs.push(`💰 计算羁绊加成与伤害公式...`);
        
        // 模拟伤害结算
        setTimeout(() => {
            logs.push(`💥 战斗结算完成。`);
            const win = Math.random() > 0.4; // 模拟胜率
            if (win) {
                logs.push('🏆 胜利！获得经验与金币奖励。');
                Game.state.xp += 1;
                Game.state.gold += 2 + Math.floor(Math.random()*3);
                if (Game.state.xp >= Game.state.xpReq) {
                    Game.state.level++;
                    Game.state.xp = 0;
                    Game.state.xpReq = 5;
                }
                // 推进节点
                Game.state.turn++;
                if(Game.state.turn % 3 === 0) {
                    Game.state.face++;
                    Game.state.turn = 1;
                    Game.state.node = `${Game.state.face}-1`;
                    Game.startNewNode();
                } else {
                    Game.state.node = `${Game.state.face}-${Game.state.turn}`;
                    Game.generateEnemy();
                }
            } else {
                logs.push('💀 失败！扣除小队生命值。');
                Game.state.hp -= 3;
            }
            logs.push('=== 战斗日志结束 ===');
            
            console.log(logs.join('\n'));
            Popup.show(win ? '🏆 战斗胜利' : '💀 战斗失败', logs.join('\n').split('\n').pop());
            Game.updateUI();
            this.isRunning = false;
        }, 1500);
    }
};
