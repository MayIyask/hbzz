/**
 * 游戏常量配置
 * 全局变量: GAME_CONST
 */
(function(window) {
  'use strict';
  
  window.GAME_CONST = {
    // 元素类型
    ELEMS: ['phys','fire','ice','elec','wind','quant','imag'],
    
    // 元素CSS变量映射
    ELEM_CSS: {
      phys:'var(--phys)', fire:'var(--fire)', ice:'var(--ice)',
      elec:'var(--elec)', wind:'var(--wind)', quant:'var(--quant)', imag:'var(--imag)'
    },
    
    // 费用颜色/名称映射 (索引0为空)
    COST_COLORS: ['','var(--cost1)','var(--cost2)','var(--cost3)','var(--cost4)','var(--cost5)'],
    COST_NAMES: ['','银','绿','蓝','紫','金'],
    
    // 游戏配置
    CONFIG: {
      MAX_LEVEL: 10,
      MAX_BENCH: 12,
      FRONT_SLOTS: 4,
      BACK_SLOTS: 6,
      TOTAL_FIELD: 10,
      SHOP_SIZE: 5,
      MAX_NODES: 18,
      REFRESH_COST: 2,
      EXP_COST: 4
    }
  };
})(window);
