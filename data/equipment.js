/**
 * 装备数据库
 * 全局变量：EQUIP_DB
 */
(function(window) {
  'use strict';
  
  window.EQUIP_DB = [
    // ===== T1 基础装备 =====
    {id:'shoe1',name:'简易鞋',emoji:'🛼',type:'shoe',tier:1,stats:{spd:8},color:'var(--green)'},
    {id:'drill1',name:'简易钻',emoji:'🔩',type:'drill',tier:1,stats:{breakEff:0.1},color:'var(--cost5)'},
    {id:'battery1',name:'简易电池',emoji:'🔋',type:'battery',tier:1,stats:{initEnergy:0.2},color:'var(--cost3)'},
    {id:'sword1',name:'简易刀',emoji:'🗡️',type:'sword',tier:1,stats:{frontStr:0.1},color:'var(--red)'},
    {id:'gun1',name:'简易枪',emoji:'🔫',type:'gun',tier:1,stats:{backStr:0.1},color:'var(--cost4)'},
    {id:'star1',name:'简易星',emoji:'⭐',type:'star',tier:1,stats:{critRate:0.05},color:'var(--gold)'},
    {id:'shield1',name:'简易甲',emoji:'👕',type:'shield',tier:1,stats:{dmgReduce:0.05},color:'var(--muted)'},
    {id:'flower1',name:'简易花',emoji:'🌸',type:'flower',tier:1,stats:{hp:100},color:'var(--green)'},
    {id:'reddiamond1',name:'红钻',emoji:'🔶',type:'reddiamond',tier:1,stats:{atk:20,critDmg:0.1},color:'var(--fire)'},
    {id:'bluediamond1',name:'蓝钻',emoji:'🔷',type:'bluediamond',tier:1,stats:{hp:200,dmgReduce:0.03},color:'var(--ice)'},
    
    // ===== T2 合成装备 (鞋 + X) =====
    {id:'boots2',name:'反重力皮靴',emoji:'👢',type:'boots',tier:2,stats:{spd:15,spdStack:0.15},recipe:['shoe1','shoe1'],color:'var(--green)'},
    {id:'storm2',name:'火力风暴潮',emoji:'🌪️',type:'storm',tier:2,stats:{frontStr:0.08,backStr:0.08,stackable:true},recipe:['shoe1','sword1'],color:'var(--red)'},
    {id:'launcher2',name:'电磁弹射器',emoji:'💷',type:'launcher',tier:2,stats:{spd:20,backAdvance:0.5},recipe:['shoe1','gun1'],color:'var(--cost4)'},
    {id:'chase2',name:'追逐星辰',emoji:'✨',type:'chase',tier:2,stats:{spd:12,vulnerable:0.35,vulTurns:2},recipe:['shoe1','star1'],color:'var(--gold)'},
    {id:'bloom2',name:'步步生花',emoji:'🌸',type:'bloom',tier:2,stats:{spd:10,dmgMulHighHp:0.3},recipe:['shoe1','flower1'],color:'var(--green)'},
    {id:'wings2',name:'流星飞翼',emoji:'🪽',type:'wings',tier:2,stats:{spd:15,spRecoverUlt:1,teamSpdBuff:0.15,buffTurns:2},recipe:['shoe1','shield1'],color:'var(--muted)'},
    {id:'propeller2',name:'光速螺旋桨',emoji:'🚁',type:'propeller',tier:2,stats:{spdToFront:0.02,spdToBack:0.01,per10Spd:true},recipe:['shoe1','drill1'],color:'var(--cost5)'},
    {id:'lightBoots2',name:'电光履',emoji:'🥾',type:'lightBoots',tier:2,stats:{spd:12,energyRegenPerTurn:0.1,unique:true},recipe:['shoe1','battery1'],color:'var(--cost3)'},
    
    // ===== T2 合成装备 (刀 + X) =====
    {id:'blade2',name:'碎星斩舰刀',emoji:'⚔️',type:'blade',tier:2,stats:{frontStr:0.35},recipe:['sword1','sword1'],color:'var(--red)'},
    {id:'master2',name:'武器大师',emoji:'🎁',type:'master',tier:2,stats:{frontStr:0.25,backStr:0.25,teamBuff:true},recipe:['sword1','gun1'],color:'var(--cost4)'},
    {id:'saw2',name:'高周波电锯',emoji:'🪚',type:'saw',tier:2,stats:{frontStr:0.15,critDmgStart:0.1},recipe:['sword1','star1'],color:'var(--gold)'},
    {id:'rage2',name:'杀红眼',emoji:'😡',type:'rage',tier:2,stats:{frontStr:0.12,dmgMulKill:0.25},recipe:['sword1','flower1'],color:'var(--green)'},
    {id:'injector2',name:'信心注入器',emoji:'💉',type:'injector',tier:2,stats:{frontStrBuff:0.3,dmgReduceBuff:0.1,buffTurns:2},recipe:['sword1','shield1'],color:'var(--muted)'},
    {id:'kinetic2',name:'动能激发剑',emoji:'⚔︎',type:'kinetic',tier:2,stats:{frontStr:0.18,spRecoverTurn:1,spMaxRecover:3},recipe:['sword1','drill1'],color:'var(--cost5)'},
    {id:'manual2',name:'战场进化手册',emoji:'📘',type:'manual',tier:2,stats:{spdPerStar:0.1,dmgPerStar:0.1},recipe:['sword1','battery1'],color:'var(--cost3)'},
    
    // ===== T2 合成装备 (枪 + X) =====
    {id:'cannon2',name:'天基轨道炮',emoji:'🚀',type:'cannon',tier:2,stats:{backStr:0.35},recipe:['gun1','gun1'],color:'var(--cost4)'},
    {id:'sniper2',name:'反卫星狙击枪',emoji:'🎯',type:'sniper',tier:2,stats:{backStr:0.15,critDmgStart:0.1},recipe:['gun1','star1'],color:'var(--gold)'},
    {id:'barrier2',name:'掩体生成枪',emoji:'🫧',type:'barrier',tier:2,stats:{backStr:0.1,shieldPerHp:0.3,shieldTurns:2},recipe:['gun1','flower1'],color:'var(--green)'},
    {id:'exo2',name:'自适应外骨骼',emoji:'🦾',type:'exo',tier:2,stats:{frontDmgReduce:0.25,frontTaunt:true,backStr:0.2,backSpd:0.2},recipe:['gun1','shield1'],color:'var(--muted)'},
    {id:'decap2',name:'斩首行动',emoji:'🔪',type:'decap',tier:2,stats:{backStr:0.15,bossDmg:0.4,breakEff:0.25},recipe:['gun1','drill1'],color:'var(--cost5)'},
    {id:'sail2',name:'蓄能帆',emoji:'⛵',type:'sail',tier:2,stats:{backStr:0.12,energyPerAction:2,unique:true},recipe:['gun1','battery1'],color:'var(--cost3)'},
    
    // ===== T2 合成装备 (星 + X) =====
    {id:'dice2',name:'随便骰子',emoji:'🎲',type:'dice',tier:2,stats:{randomEquip:2,special:true},recipe:['star1','star1'],color:'var(--gold)'},
    {id:'fist2',name:'热血沸腾拳',emoji:'👊',type:'fist',tier:2,stats:{critRatePerHp:0.02,maxCritRate:0.4,hpThreshold:5000},recipe:['star1','flower1'],color:'var(--green)'},
    {id:'armor2',name:'以牙还牙甲',emoji:'🎽',type:'armor',tier:2,stats:{shieldPerDef:3,counterDmg:2.5},recipe:['star1','shield1'],color:'var(--muted)'},
    {id:'flag2',name:'胜利之旗',emoji:'🚩',type:'flag',tier:2,stats:{teamCritRate:0.12,controlResist:4},recipe:['star1','drill1'],color:'var(--cost5)'},
    {id:'engine2',name:'冷笑话引擎',emoji:'🚦',type:'engine',tier:2,stats:{critRatePerUlt:0.1,maxStack:5},recipe:['star1','battery1'],color:'var(--cost3)'},
    
    // ===== T2 合成装备 (花 + X) =====
    {id:'ring2',name:'生命之环',emoji:'🌿',type:'ring',tier:2,stats:{teamHp:0.15},recipe:['flower1','flower1'],color:'var(--green)'},
    {id:'chip2',name:'痛觉阻断芯片',emoji:'🧠',type:'chip',tier:2,stats:{dmgReduceAfterHeal:0.15,buffTurns:2},recipe:['flower1','shield1'],color:'var(--muted)'},
    {id:'liquid2',name:'物质分解液',emoji:'🍾',type:'liquid',tier:2,stats:{dotMaxHp:0.03,trueDmg:true},recipe:['flower1','drill1'],color:'var(--cost5)'},
    {id:'heat2',name:'绝对热量',emoji:'🔥',type:'heat',tier:2,stats:{healPerAction:0.2,energyRecoverUlt:10,unique:true},recipe:['flower1','battery1'],color:'var(--cost3)'},
    
    // ===== T2 合成装备 (甲 + X) =====
    {id:'hardArmor2',name:'很硬的甲',emoji:'🦺',type:'hardArmor',tier:2,stats:{teamDmgReduce:0.18},recipe:['shield1','shield1'],color:'var(--muted)'},
    {id:'grenade2',name:'闪光手榴弹',emoji:'💣',type:'grenade',tier:2,stats:{enemyWeak:0.2,battleStart:true},recipe:['shield1','drill1'],color:'var(--cost5)'},
    {id:'lightShield2',name:'光能盾牌',emoji:'🔆',type:'lightShield',tier:2,stats:{shieldPerDef:3,shieldTrigger:0.5,maxTrigger:5,actionDelayImmune:true},recipe:['shield1','battery1'],color:'var(--cost3)'},
    
    // ===== T2 合成装备 (钻 + X) =====
    {id:'wormhole2',name:'虫洞掘进钻头',emoji:'⛏️',type:'wormhole',tier:2,stats:{breakEff:0.5,breakDmg:2.5},recipe:['drill1','drill1'],color:'var(--cost5)'},
    {id:'planetDrill2',name:'行星钻地弹',emoji:'💥',type:'planetDrill',tier:2,stats:{breakEff:0.2,vulnerable:0.35,vulTurns:2},recipe:['drill1','battery1'],color:'var(--cost3)'},
    
    // ===== T2 合成装备 (电 + X) =====
    {id:'generator2',name:'永动机',emoji:'⚙️',type:'generator',tier:2,stats:{ultActivate:true,ultResetAfter3:true,special:true},recipe:['battery1','battery1'],color:'var(--cost3)'},
    
    // ===== T2 星徽类 (红钻 + X) =====
    {id:'demigodDay2',name:'昼之半神星徽',emoji:'🌞',type:'demigodDay',tier:2,stats:{special:true,bondCancel:true},recipe:['reddiamond1','shoe1'],color:'var(--fire)'},
    {id:'xianzhou2',name:'仙舟星徽',emoji:'🚢',type:'xianzhou',tier:2,stats:{stackPerAction:true},recipe:['reddiamond1','sword1'],color:'var(--fire)'},
    {id:'demigodNight2',name:'夜之半神星徽',emoji:'🌙',type:'demigodNight',tier:2,stats:{essenceGain:true},recipe:['reddiamond1','gun1'],color:'var(--fire)'},
    {id:'festival2',name:'盛会之星星徽',emoji:'🎉',type:'festival',tier:2,stats:{special:true},recipe:['reddiamond1','star1'],color:'var(--fire)'},
    {id:'wolf2',name:'狼狩星徽',emoji:'🐺',type:'wolf',tier:2,stats:{special:true},recipe:['reddiamond1','flower1'],color:'var(--fire)'},
    {id:'belobog2',name:'贝洛伯格星徽',emoji:'🏔️',type:'belobog',tier:2,stats:{stackPerAction:true},recipe:['reddiamond1','shield1'],color:'var(--fire)'},
    {id:'traveler2',name:'星间旅人星徽',emoji:'🌌',type:'traveler',tier:2,stats:{special:true},recipe:['reddiamond1','drill1'],color:'var(--fire)'},
    {id:'scholar2',name:'银河学者星徽',emoji:'📚',type:'scholar',tier:2,stats:{special:true},recipe:['reddiamond1','battery1'],color:'var(--fire)'},
    
    // ===== T2 星徽类 (蓝钻 + X) =====
    {id:'pursuit2',name:'追击星徽',emoji:'🏃',type:'pursuit',tier:2,stats:{allDmgAsPursuit:true,actionAdvance:0.1},recipe:['bluediamond1','shoe1'],color:'var(--ice)'},
    {id:'skillPoint2',name:'战技点星徽',emoji:'🔘',type:'skillPoint',tier:2,stats:{ignoreDef:0.2,skillType:'basic'},recipe:['bluediamond1','sword1'],color:'var(--ice)'},
    {id:'debuff2',name:'减益星徽',emoji:'🩸',type:'debuff',tier:2,stats:{dmgPerDebuff:0.05,maxDebuff:5},recipe:['bluediamond1','gun1'],color:'var(--ice)'},
    {id:'aoe2',name:'群攻星徽',emoji:'💢',type:'aoe',tier:2,stats:{frontStrPerEnemy:0.08,backStrPerEnemy:0.08},recipe:['bluediamond1','star1'],color:'var(--ice)'},
    {id:'bloodburn2',name:'燃血星徽',emoji:'❤️‍🔥',type:'bloodburn',tier:2,stats:{hpCost:0.2,frontStr:0.4,backStr:0.4},recipe:['bluediamond1','flower1'],color:'var(--ice)'},
    {id:'dot2',name:'持续伤害星徽',emoji:'🐍',type:'dot',tier:2,stats:{addDot:'fire',dotDmg:3.0},recipe:['bluediamond1','shield1'],color:'var(--ice)'},
    {id:'breakEmblem2',name:'击破星徽',emoji:'💔',type:'breakEmblem',tier:2,stats:{breakDmg:1.5},recipe:['bluediamond1','drill1'],color:'var(--ice)'},
    {id:'energyEmblem2',name:'能量星徽',emoji:'🔋',type:'energyEmblem',tier:2,stats:{allDmgAsUlt:true,energyRecoverUlt:10},recipe:['bluediamond1','battery1'],color:'var(--ice)'},
    
    // ===== 特殊装备 =====
    {id:'train2',name:'列车同行星徽',emoji:'🚂',type:'train',tier:2,stats:{special:true},color:'var(--gold)'},
    {id:'healEmblem2',name:'治疗星徽',emoji:'💊',type:'healEmblem',tier:2,stats:{teamHealPerAction:0.1},color:'var(--gold)'},
    {id:'quantum2',name:'量子同频星徽',emoji:'🔮',type:'quantum',tier:2,stats:{special:true},color:'var(--gold)'},
    {id:'shieldEmblem2',name:'护盾星徽',emoji:'🛡️',type:'shieldEmblem',tier:2,stats:{battleStartShield:1.0,shieldPerDef:true},color:'var(--gold)'},
    {id:'wealth2',name:'财富宝钻',emoji:'💎',type:'wealth',tier:2,stats:{maxTeamSize:1,goldPer3Prep:1},recipe:['reddiamond1','bluediamond1'],color:'var(--gold)'},
    {id:'trashBag2',name:'垃圾袋',emoji:'🗑️',type:'trash',tier:0,stats:{},color:'var(--muted)'},
    {id:'goldTrashBag2',name:'金垃圾袋',emoji:'💰',type:'goldTrash',tier:3,stats:{allStats:0.5,goldOnGet:15},special:true,color:'var(--gold)'}
  ];
  
  window.getEquipBase = function(id) {
    return window.EQUIP_DB.find(function(e){ return e.id === id; });
  };
  
  window.getUpgradeTarget = function(equipId) {
    return window.EQUIP_DB.find(function(e){ return e.from === equipId; });
  };
  
  window.findEquipRecipe = function(id1, id2) {
    const e1 = window.getEquipBase(id1);
    const e2 = window.getEquipBase(id2);
    if (!e1 || !e2) return null;
    for (let i = 0; i < window.EQUIP_DB.length; i++) {
      const item = window.EQUIP_DB[i];
      if (item.recipe && item.recipe.length === 2) {
        const match1 = (item.recipe[0] === e1.type || item.recipe[0] === e2.type);
        const match2 = (item.recipe[1] === e1.type || item.recipe[1] === e2.type);
        if (match1 && match2) {
          if (item.recipe[0] === item.recipe[1]) {
            if (e1.type === e2.type && e1.type === item.recipe[0]) return item;
          } else {
            if ((e1.type === item.recipe[0] && e2.type === item.recipe[1]) ||
                (e1.type === item.recipe[1] && e2.type === item.recipe[0])) return item;
          }
        }
      }
    }
    return null;
  };
  
})(window);
