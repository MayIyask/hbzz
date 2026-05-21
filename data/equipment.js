/**
 * 装备数据库
 * 全局变量: EQUIP_DB
 * 
 * 装备属性说明:
 * - id: 唯一标识
 * - name: 显示名称
 * - emoji: 图标字符
 * - type: 装备类型(用于合成判断)
 * - tier: 品阶(1-3, 0为特殊)
 * - stats: 属性加成对象
 * - from: 合成来源装备ID(用于进阶)
 * - color: CSS颜色变量
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
    {id:'reddiamond1',name:'红钻',emoji:'🔶',type:'reddiamond',tier:1,stats:{atk:20},color:'var(--fire)'},
    {id:'bluediamond1',name:'蓝钻',emoji:'🔷',type:'bluediamond',tier:1,stats:{hp:200},color:'var(--ice)'},
    
    // ===== T2 进阶装备 =====
    {id:'shoe2',name:'风暴潮',emoji:'🛼',type:'shoe',tier:2,stats:{spd:20,spdMul:0.05},from:'shoe1',color:'var(--green)'},
    {id:'drill2',name:'暴潮蓄能',emoji:'🔩',type:'drill',tier:2,stats:{breakEff:0.25,breakDmg:0.2},from:'drill1',color:'var(--cost5)'},
    {id:'battery2',name:'冷笑话引擎',emoji:'🔋',type:'battery',tier:2,stats:{initEnergy:0.4,energyRegen:0.1},from:'battery1',color:'var(--cost3)'},
    {id:'sword2',name:'热血沸腾拳',emoji:'🗡️',type:'sword',tier:2,stats:{frontStr:0.25,dmgMul:0.1},from:'sword1',color:'var(--red)'},
    {id:'gun2',name:'正当防卫',emoji:'🔫',type:'gun',tier:2,stats:{backStr:0.25,dmgMul:0.1},from:'gun1',color:'var(--cost4)'},
    {id:'star2',name:'胜利之旗',emoji:'⭐',type:'star',tier:2,stats:{critRate:0.12,critDmg:0.15},from:'star1',color:'var(--gold)'},
    {id:'reddiamond2',name:'红锯',emoji:'🔶',type:'reddiamond',tier:2,stats:{atk:50,critRate:0.1},from:'reddiamond1',color:'var(--fire)'},
    {id:'bluediamond2',name:'硬甲',emoji:'🔷',type:'bluediamond',tier:2,stats:{hp:600,dmgReduce:0.05},from:'bluediamond1',color:'var(--ice)'},
    
    // ===== T3 星徽装备 =====
    {id:'shoe3',name:'星徽·速度',emoji:'🛼',type:'shoe',tier:3,stats:{spd:35,spdMul:0.1},from:'shoe2',color:'var(--gold)'},
    {id:'drill3',name:'星徽·击破',emoji:'🔩',type:'drill',tier:3,stats:{breakEff:0.5,breakDmg:0.4},from:'drill2',color:'var(--gold)'},
    {id:'battery3',name:'星徽·能量',emoji:'🔋',type:'battery',tier:3,stats:{initEnergy:0.6,energyRegen:0.15},from:'battery2',color:'var(--gold)'},
    {id:'sword3',name:'星徽·前台',emoji:'🗡️',type:'sword',tier:3,stats:{frontStr:0.5,dmgMul:0.2},from:'sword2',color:'var(--gold)'},
    {id:'gun3',name:'星徽·后台',emoji:'🔫',type:'gun',tier:3,stats:{backStr:0.5,dmgMul:0.2},from:'gun2',color:'var(--gold)'},
    {id:'star3',name:'星徽·幸运',emoji:'⭐',type:'star',tier:3,stats:{critRate:0.2,critDmg:0.3},from:'star2',color:'var(--gold)'},
    {id:'reddiamond3',name:'星徽·攻击',emoji:'🔶',type:'reddiamond',tier:3,stats:{atk:100,critRate:0.15},from:'reddiamond2',color:'var(--gold)'},
    {id:'bluediamond3',name:'星徽·防御',emoji:'🔷',type:'bluediamond',tier:3,stats:{hp:1200,dmgReduce:0.12},from:'bluediamond2',color:'var(--gold)'},
    
    // ===== 特殊装备 =====
    {id:'emblem_book',name:'星徽秘典',emoji:'📖',type:'special',tier:3,stats:{atk:40,hp:400,dmgMul:0.08,critRate:0.05},color:'var(--gold)'},
    {id:'recruit5',name:'五星招募卡',emoji:'🎟️',type:'recruit',tier:0,stats:{},color:'var(--gold)'}
  ];
  
  // 辅助函数：通过ID获取装备基础数据
  window.getEquipBase = function(id) {
    return window.EQUIP_DB.find(function(e){ return e.id === id; });
  };
  
  // 辅助函数：获取可合成的进阶装备
  window.getUpgradeTarget = function(equipId) {
    return window.EQUIP_DB.find(function(e){ return e.from === equipId; });
  };
  
})(window);
