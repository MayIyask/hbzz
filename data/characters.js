/**
 * 角色数据库
 * 全局变量: CHAR_DATA
 * 
 * 角色属性说明:
 * - id: 唯一标识
 * - name: 显示名称
 * - cost: 费用(1-5)
 * - bonds: 羁绊标签数组
 * - atk/hp/spd: 基础属性
 * - pos: 'front'或'back'
 * - elem: 元素类型
 */
(function(window) {
  'use strict';
  
  window.CHAR_DATA = [
    {id:'sanzhiqi',name:'三月七',cost:1,bonds:['列车同行','护盾'],atk:75,hp:850,spd:98,pos:'front',elem:'ice'},
    {id:'danheng',name:'丹恒',cost:1,bonds:['列车同行'],atk:115,hp:520,spd:112,pos:'front',elem:'wind'},
    {id:'herta',name:'黑塔',cost:1,bonds:['银河学者','群攻'],atk:95,hp:480,spd:96,pos:'back',elem:'ice'},
    {id:'asta',name:'艾丝妲',cost:1,bonds:['银河学者','持续伤害'],atk:65,hp:520,spd:104,pos:'back',elem:'fire'},
    {id:'sampo',name:'桑博',cost:1,bonds:['持续伤害','贝洛伯格','星间旅人'],atk:88,hp:560,spd:101,pos:'back',elem:'wind'},
    {id:'qingque',name:'青雀',cost:1,bonds:['仙舟','战技点'],atk:108,hp:500,spd:99,pos:'front',elem:'quant'},
    {id:'gallaher',name:'加拉赫',cost:1,bonds:['击破','治疗','盛会之星'],atk:80,hp:700,spd:95,pos:'back',elem:'fire'},
    {id:'ruanmei',name:'阮·梅',cost:2,bonds:['击破','银河学者'],atk:58,hp:620,spd:100,pos:'back',elem:'ice'},
    {id:'ajin',name:'砂金',cost:2,bonds:['公司','追击','护盾'],atk:78,hp:920,spd:94,pos:'back',elem:'imag'},
    {id:'lingsha',name:'灵砂',cost:2,bonds:['击破','狼狩','治疗'],atk:82,hp:680,spd:100,pos:'back',elem:'fire'},
    {id:'huahuo',name:'花火',cost:2,bonds:['战技点','量子同频','盛会之星'],atk:76,hp:540,spd:108,pos:'back',elem:'quant'},
    {id:'yinzhi',name:'银枝',cost:2,bonds:['群攻','星间旅人','能量'],atk:138,hp:580,spd:91,pos:'front',elem:'phys'},
    {id:'peila',name:'佩拉',cost:2,bonds:['贝洛伯格','减益'],atk:95,hp:530,spd:106,pos:'back',elem:'ice'},
    {id:'jizi',name:'姬子',cost:3,bonds:['列车同行','击破'],atk:155,hp:680,spd:96,pos:'front',elem:'fire'},
    {id:'wgr',name:'忘归人',cost:3,bonds:['击破','仙舟'],atk:142,hp:640,spd:100,pos:'back',elem:'fire'},
    {id:'zhenli',name:'真理医生',cost:3,bonds:['追击','银河学者','星间旅人','减益'],atk:168,hp:590,spd:101,pos:'front',elem:'imag'},
    {id:'yanqing',name:'彦卿',cost:3,bonds:['仙舟','减益','狼狩'],atk:175,hp:530,spd:116,pos:'front',elem:'ice'},
    {id:'xier',name:'希儿',cost:3,bonds:['贝洛伯格','量子同频'],atk:188,hp:490,spd:120,pos:'front',elem:'quant'},
    {id:'saber',name:'Saber',cost:3,bonds:['星间旅人','能量'],atk:172,hp:600,spd:105,pos:'front',elem:'wind'},
    {id:'jiepade',name:'杰帕德',cost:4,bonds:['贝洛伯格','护盾'],atk:95,hp:1350,spd:84,pos:'front',elem:'ice'},
    {id:'luosha',name:'罗刹',cost:4,bonds:['星间旅人','治疗'],atk:82,hp:860,spd:100,pos:'back',elem:'imag'},
    {id:'fuxuan',name:'符玄',cost:4,bonds:['仙舟','治疗','量子同频'],atk:72,hp:1020,spd:94,pos:'back',elem:'quant'},
    {id:'daheitai',name:'大黑塔',cost:4,bonds:['银河学者','群攻'],atk:210,hp:590,spd:91,pos:'back',elem:'ice'},
    {id:'welter',name:'瓦尔特',cost:5,bonds:['列车同行','减益'],atk:208,hp:690,spd:96,pos:'front',elem:'imag'},
    {id:'tuopa',name:'托帕',cost:5,bonds:['公司','追击'],atk:228,hp:640,spd:100,pos:'back',elem:'fire'},
    {id:'jingyuan',name:'景元',cost:5,bonds:['仙舟','群攻'],atk:248,hp:690,spd:86,pos:'front',elem:'elec'},
    {id:'yunli',name:'云璃',cost:5,bonds:['狼狩','能量'],atk:235,hp:810,spd:91,pos:'back',elem:'phys'},
    {id:'heitiane',name:'黑天鹅',cost:5,bonds:['盛会之星','持续伤害'],atk:218,hp:640,spd:100,pos:'back',elem:'wind'},
    {id:'liuying',name:'流萤',cost:5,bonds:['星核猎手','击破'],atk:258,hp:590,spd:110,pos:'front',elem:'fire'},
    {id:'buluoniya',name:'布洛妮娅',cost:5,bonds:['贝洛伯格','燃血'],atk:185,hp:690,spd:106,pos:'back',elem:'wind'}
  ];
  
  // 辅助函数：通过ID获取角色基础数据
  window.getCharBase = function(id) {
    return window.CHAR_DATA.find(function(c){ return c.id === id; });
  };
  
})(window);
