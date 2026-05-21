/**
 * 羁绊系统数据
 * 全局变量: BOND_DATA
 * 
 * 羁绊属性说明:
 * - icon: Font Awesome图标类名
 * - tiers: 激活所需人数阈值 [2,4,6]
 * - bonus: 每级加成效果数组
 * - desc: 简短描述
 */
(function(window) {
  'use strict';
  
  window.BOND_DATA = {
    '列车同行': {
      icon: 'fa-train',
      tiers: [2,4,6],
      bonus: [
        {dmgMul: 0.15},
        {dmgMul: 0.30},
        {dmgMul: 0.50}
      ],
      desc: '全队伤害提升'
    },
    '星核猎手': {
      icon: 'fa-star',
      tiers: [2,3,4],
      bonus: [
        {dmgMul: 0.2, hpMul: 0.12},
        {dmgMul: 0.4, hpMul: 0.24},
        {dmgMul: 0.65, hpMul: 0.36}
      ],
      desc: '伤害与生命提升'
    },
    '银河学者': {
      icon: 'fa-graduation-cap',
      tiers: [2,4,6],
      bonus: [
        {atkMul: 0.2},
        {atkMul: 0.45},
        {atkMul: 0.8}
      ],
      desc: '攻击力提升'
    },
    '公司': {
      icon: 'fa-briefcase',
      tiers: [2,3],
      bonus: [
        {atkMul: 0.25, goldPerBattle: 1},
        {atkMul: 0.6, goldPerBattle: 3}
      ],
      desc: '攻击力+战斗金币'
    },
    '贝洛伯格': {
      icon: 'fa-city',
      tiers: [2,4,6],
      bonus: [
        {dmgMul: 0.18},
        {dmgMul: 0.36},
        {dmgMul: 0.6}
      ],
      desc: '伤害提升'
    },
    '仙舟': {
      icon: 'fa-ship',
      tiers: [3,5,7],
      bonus: [
        {atkMul: 0.2, spdMul: 0.08},
        {atkMul: 0.4, spdMul: 0.16},
        {atkMul: 0.7, spdMul: 0.28}
      ],
      desc: '攻击力+速度提升'
    },
    '狼狩': {
      icon: 'fa-paw',
      tiers: [3,5,7],
      bonus: [
        {atkMul: 0.18},
        {atkMul: 0.38},
        {atkMul: 0.65}
      ],
      desc: '攻击力提升'
    },
    '击破': {
      icon: 'fa-burst',
      tiers: [2,4,6],
      bonus: [
        {dmgMul: 0.2},
        {dmgMul: 0.45},
        {dmgMul: 0.75}
      ],
      desc: '超击破伤害提升'
    },
    '追击': {
      icon: 'fa-crosshairs',
      tiers: [3,5,7],
      bonus: [
        {dmgMul: 0.2},
        {dmgMul: 0.45},
        {dmgMul: 0.75}
      ],
      desc: '追击伤害提升'
    },
    '群攻': {
      icon: 'fa-explosion',
      tiers: [3,5,7],
      bonus: [
        {critRate: 0.12},
        {critRate: 0.24},
        {critRate: 0.4}
      ],
      desc: '暴击率提升'
    },
    '持续伤害': {
      icon: 'fa-skull-crossbones',
      tiers: [2,4,6],
      bonus: [
        {dotDmg: 0.08},
        {dotDmg: 0.18},
        {dotDmg: 0.35}
      ],
      desc: 'DoT伤害提升'
    },
    '治疗': {
      icon: 'fa-heart-pulse',
      tiers: [2,4,6],
      bonus: [
        {healMul: 0.25},
        {healMul: 0.5},
        {healMul: 0.85}
      ],
      desc: '治疗效果提升'
    },
    '护盾': {
      icon: 'fa-shield-halved',
      tiers: [2,4],
      bonus: [
        {dmgReduce: 0.12, dmgMul: 0.1},
        {dmgReduce: 0.25, dmgMul: 0.3}
      ],
      desc: '减伤+伤害提升'
    },
    '减益': {
      icon: 'fa-arrow-down',
      tiers: [2,4,6],
      bonus: [
        {dmgMul: 0.18},
        {dmgMul: 0.4},
        {dmgMul: 0.7}
      ],
      desc: '减益时增伤'
    },
    '燃血': {
      icon: 'fa-fire',
      tiers: [2,4,6],
      bonus: [
        {hpMul: 0.15, dmgMul: 0.1},
        {hpMul: 0.3, dmgMul: 0.25},
        {hpMul: 0.5, dmgMul: 0.45}
      ],
      desc: '生命+伤害提升'
    },
    '量子同频': {
      icon: 'fa-atom',
      tiers: [2,3,4],
      bonus: [
        {dmgMul: 0.15},
        {dmgMul: 0.3},
        {dmgMul: 0.5}
      ],
      desc: '易伤效果'
    },
    '星间旅人': {
      icon: 'fa-globe',
      tiers: [2,4,6],
      bonus: [
        {dmgMul: 0.12},
        {dmgMul: 0.28},
        {dmgMul: 0.5}
      ],
      desc: '全队增益'
    },
    '战技点': {
      icon: 'fa-bolt',
      tiers: [2,4,6],
      bonus: [
        {dmgMul: 0.12, spdMul: 0.1},
        {dmgMul: 0.24, spdMul: 0.2},
        {dmgMul: 0.4, spdMul: 0.35}
      ],
      desc: '伤害+速度提升'
    },
    '盛会之星': {
      icon: 'fa-masks-theater',
      tiers: [2,3,4],
      bonus: [
        {dmgMul: 0.15},
        {dmgMul: 0.3},
        {dmgMul: 0.5}
      ],
      desc: '巨星加成'
    },
    '能量': {
      icon: 'fa-charging-station',
      tiers: [3,5,7],
      bonus: [
        {dmgMul: 0.15},
        {dmgMul: 0.35},
        {dmgMul: 0.6}
      ],
      desc: '终结技伤害提升'
    }
  };
  
})(window);
