// 1. 全局数据与简化库 [cite: 135]
const CHAR_DB = [
    { id: "chr_001", name: "娜塔莎", cost: 1, hp: 900, atk: 80, def: 60, speed: 95 },
    { id: "chr_002", name: "青雀", cost: 1, hp: 850, atk: 95, def: 50, speed: 100 },
    { id: "chr_010", name: "希儿", cost: 2, hp: 920, atk: 120, def: 65, speed: 115 },
    { id: "chr_040", name: "黄泉", cost: 5, hp: 1100, atk: 160, def: 70, speed: 115 }
];

// 简化的怪物库 [cite: 170]
const MONSTER_DB = [
    { name: "虚卒·掠夺者", hp: 800, atk: 70, def: 40, speed: 90 },
    { name: "自动机兵·齿狼", hp: 1200, atk: 95, def: 60, speed: 85 },
    { name: "可可利亚·幻象", hp: 3000, atk: 150, def: 80, speed: 100 }
];

// 2. 游戏可变状态 [cite: 78, 80]
let player = {
    hp: 1000,
    gold: 10,
    round: 1,
    bench: [],       // 备战席 (最大8)
    team: []         // 出战阵容 (最大5)
};
let currentShop = [];

// 3. 初始化与渲染逻辑
function initGame() {
    updateUI();
    rerollShop(true); // 免费首刷
    
    document.getElementById("btn-refresh").addEventListener("click", () => {
        if(player.gold >= 2) { player.gold -= 2; rerollShop(); updateUI(); }
    });
    document.getElementById("btn-combat").addEventListener("click", startCombatPhase);
}

function updateUI() {
    document.getElementById("player-hp").innerText = player.hp;
    document.getElementById("player-gold").innerText = player.gold;
    document.getElementById("game-round").innerText = player.round;

    // 渲染备战席
    const benchDiv = document.getElementById("bench-slots");
    benchDiv.innerHTML = "";
    player.bench.forEach((char, idx) => {
        let el = document.createElement("div");
        el.className = `card star-${char.star}`;
        el.innerHTML = `<b>${char.name}</b><br>★${char.star}<br>ATK:${Math.floor(char.atk)}`;
        el.onclick = () => { deployCharacter(idx); };
        benchDiv.appendChild(el);
    });

    // 渲染出战席
    const teamDiv = document.getElementById("battle-slots");
    teamDiv.innerHTML = "";
    player.team.forEach((char, idx) => {
        let el = document.createElement("div");
        el.className = `card star-${char.star}`;
        el.innerHTML = `<b>${char.name}</b><br>★${char.star}<br>HP:${Math.floor(char.hp)}`;
        el.onclick = () => { retractCharacter(idx); };
        teamDiv.appendChild(el);
    });
}

// 4. 商店机制与“三合一”自动触发 [cite: 78, 80]
function rerollShop(free = false) {
    currentShop = [];
    const shopDiv = document.getElementById("shop-items");
    shopDiv.innerHTML = "";

    for(let i=0; i<5; i++) {
        let randomChar = CHAR_DB[Math.floor(Math.random() * CHAR_DB.length)];
        currentShop.push(randomChar);

        let el = document.createElement("div");
        el.className = "shop-item";
        el.innerHTML = `<h4>${randomChar.name}</h4><p>费用: ${randomChar.cost}</p><button onclick="buyCharacter(${i})">购买</button>`;
        shopDiv.appendChild(el);
    }
}

function buyCharacter(index) {
    let char = currentShop[index];
    if (!char || player.gold < char.cost) return alert("金币不足！");
    if (player.bench.length >= 8) return alert("备战席已满！");

    player.gold -= char.cost;
    // 生成1星独立实例
    player.bench.push({ ...char, star: 1 });
    currentShop[index] = null; // 移除商品
    
    checkAndMerge(); // 触发合星检测
    updateUI();
}

// 简化的三合一合星逻辑 [cite: 78, 99]
function checkAndMerge() {
    let counts = {};
    player.bench.forEach(c => {
        let key = `${c.id}_${c.star}`;
        counts[key] = (counts[key] || 0) + 1;
    });

    for (let key in counts) {
        if (counts[key] >= 3) {
            let [id, star] = key.split("_");
            star = parseInt(star);
            if (star >= 3) continue; // 先限制最高3星 

            // 清理3个旧的
            let removed = 0;
            player.bench = player.bench.filter(c => {
                if (c.id === id && c.star === star && removed < 3) {
                    removed++;
                    return false;
                }
                return true;
            });

            // 依据常量乘子获得进阶数值 [cite: 79]
            let base = CHAR_DB.find(c => c.id === id);
            let mult = star === 1 ? 1.3 : 1.7; // 2星与3星系数 [cite: 79]
            
            player.bench.push({
                ...base,
                star: star + 1,
                hp: base.hp * mult,
                atk: base.atk * mult,
                def: base.def * mult
            });

            logToBattle(`✨ 发生聚合！三只 1只 ★${star} ${base.name} 合成为 ★${star+1}！`);
            checkAndMerge(); // 递归检测
            break;
        }
    }
}

function deployCharacter(idx) {
    if(player.team.length >= 5) return alert("上阵主力已达上限 ");
    let char = player.bench.splice(idx, 1)[0];
    player.team.push(char);
    updateUI();
}

function retractCharacter(idx) {
    if(player.bench.length >= 8) return alert("备战席已满！");
    let char = player.team.splice(idx, 1)[0];
    player.bench.push(char);
    updateUI();
}

// 5. 战斗阶段：纯前端异步模拟循环 
function logToBattle(text) {
    const logBox = document.getElementById("battle-log");
    logBox.innerHTML += `<div>${text}</div>`;
    logBox.scrollTop = logBox.scrollHeight;
}

function startCombatPhase() {
    if (player.team.length === 0) return alert("请先派遣角色上阵！");
    
    // 切换UI显示
    document.getElementById("prepare-zone").classList.add("hidden");
    document.getElementById("combat-zone").classList.remove("hidden");
    document.getElementById("battle-log").innerHTML = "=== 战斗阶段开始 ===<br>";

    // 生成本轮怪物队伍 [cite: 170]
    let enemyCount = Math.min(player.round, 3);
    let enemies = [];
    for(let i=0; i<enemyCount; i++) {
        let template = MONSTER_DB[Math.min(player.round - 1, MONSTER_DB.length - 1)];
        enemies.push({ ...template, currentHp: template.hp });
    }

    // 克隆并初始化我方战斗实例
    let myCombatTeam = player.team.map(c => ({ ...c, currentHp: c.hp }));

    // 战斗时序主循环 
    let timer = setInterval(() => {
        if (myCombatTeam.length === 0 || enemies.length === 0) {
            clearInterval(timer);
            endCombatPhase(myCombatTeam.length > 0);
            return;
        }

        // 简化的速度条顺序动作：我方先手攻击，敌方随机反击 
        let attacker = myCombatTeam[0];
        let target = enemies[0];

        // 依据公式计算衰减伤害 [cite: 81, 112]
        let damage = Math.max(1, Math.floor(attacker.atk * (1 - target.def / (target.def + 100)))); [cite: 112]
        target.currentHp -= damage;
        logToBattle(`⚔️ 我方 [★${attacker.star} ${attacker.name}] 打击了 敌人, 造成 ${damage} 点物理伤害`);

        if (target.currentHp <= 0) {
            logToBattle(`💀 敌方 [${target.name}] 溃败退出战场！`);
            enemies.shift();
        } else {
            // 怪物反击
            let counterDmg = Math.max(1, Math.floor(target.atk * (1 - attacker.def / (attacker.def + 100)))); [cite: 112]
            attacker.currentHp -= counterDmg;
            logToBattle(`💥 敌方 [${target.name}] 反扑，对我方造成 ${counterDmg} 点伤害`);
            if(attacker.currentHp <= 0) {
                logToBattle(`💀 我方 [${attacker.name}] 战败倒下！`);
                myCombatTeam.shift();
            }
        }
    }, 600); // 慢速动作，便于观看战斗气泡日志
}

// 6. 结算阶段与资源回流 [cite: 81]
function endCombatPhase(isWin) {
    document.getElementById("prepare-zone").classList.remove("hidden");
    document.getElementById("combat-zone").classList.add("hidden");

    if (isWin) {
        // 利息与胜者加成计算 [cite: 81, 133]
        let interest = Math.floor(Math.min(player.gold, 50) * 0.1); [cite: 78, 133]
        let reward = 3 + 2 + interest; // 基础3+胜2+利息 [cite: 81]
        player.gold += reward;
        alert(`🏆 战斗胜利！获得金币奖励：${reward}（含利息及胜场补贴）`);
    } else {
        // 败者遭受固定的段位惩罚血量 [cite: 81]
        player.hp -= 150;
        player.gold += 3 + Math.floor(Math.min(player.gold, 50) * 0.1); [cite: 78, 81]
        alert(`❌ 战斗失败！玩家基地遭到入侵，生命值扣除 150 点。`);
    }

    if (player.hp <= 0) {
        alert("💀 GAME OVER! 您的阵地已被全面合围，资金链断裂。");
        player.hp = 1000;
        player.gold = 10;
        player.round = 1;
        player.bench = [];
        player.team = [];
    } else {
        player.round++;
    }
    
    rerollShop();
    updateUI();
}

window.onload = initGame;
