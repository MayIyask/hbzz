document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab');
    const contentArea = document.getElementById('content');
    const searchInput = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearSearch');
    let currentTab = 'bonds';

    // 渲染表格
    function renderTable(data, keys, title = '') {
        if (!data || data.length === 0) {
            return `<div class="table-container"><h3 style="padding:1rem;">${title || currentTab} - 暂无数据</h3></div>`;
        }
        let html = `<div class="table-container">`;
        if(title) html += `<h3 style="padding: 1rem 1rem 0;">${title}</h3>`;
        html += `<table><thead><tr>`;
        keys.forEach(k => html += `<th>${k}</th>`);
        html += `</tr></thead><tbody>`;
        data.forEach(row => {
            html += '<tr>';
            keys.forEach(k => {
                let val = row[k] || '';
                // 处理多行文本、链接、数组
                if (String(val).includes('\n')) {
                    val = `<div class="note">${val.replace(/\n/g, '<br>')}</div>`;
                } else if (String(val).includes('BV1')) {
                    val = val.replace(/(BV1[a-zA-Z0-9]+)/g, '<a href="https://www.bilibili.com/video/$1" target="_blank" style="color:var(--primary);text-decoration:none;">$1</a>');
                } else if (String(val).includes(',')) {
                    val = val.split(',').map(v => `<span class="tag">${v.trim()}</span>`).join('');
                }
                html += `<td>${val}</td>`;
            });
            html += '</tr>';
        });
        html += `</tbody></table></div>`;
        return html;
    }

    // 切换选项卡
    function switchTab(tabName) {
        currentTab = tabName;
        tabs.forEach(t => t.classList.toggle('active', t.dataset.target === tabName));
        
        let html = `<div class="section active">`;
        const data = CURRENCY_WAR_DATA[tabName];
        if (Array.isArray(data) && data.length > 0) {
            const keys = Object.keys(data[0]);
            html += renderTable(data, keys);
        } else if (typeof data === 'string') {
            html += `<div class="table-container"><div class="note" style="padding:1.5rem; white-space:pre-wrap;">${data}</div></div>`;
        }
        html += `</div>`;
        contentArea.innerHTML = html;
    }

    // 全局搜索
    function performSearch(query) {
        if (!query) {
            switchTab(currentTab);
            return;
        }
        const q = query.toLowerCase();
        const results = {};
        let totalCount = 0;

        Object.entries(CURRENCY_WAR_DATA).forEach(([key, val]) => {
            if (Array.isArray(val)) {
                const matched = val.filter(row => 
                    Object.values(row).some(v => String(v).toLowerCase().includes(q))
                );
                if (matched.length > 0) {
                    results[key] = { data: matched, keys: Object.keys(matched[0]) };
                    totalCount += matched.length;
                }
            } else if (typeof val === 'string' && val.toLowerCase().includes(q)) {
                results[key] = { data: val, type: 'string' };
                totalCount++;
            }
        });

        let html = `<div class="section active"><div class="search-stats">🔍 搜索 "${query}" 找到 ${totalCount} 条相关结果</div>`;
        Object.entries(results).forEach(([key, res]) => {
            const tabName = getTabLabel(key);
            html += `<h3 style="margin: 1rem 0 0.5rem; color: var(--primary);">📂 ${tabName}</h3>`;
            if (res.type === 'string') {
                html += `<div class="table-container"><div class="note" style="padding:1rem;">${res.data}</div></div>`;
            } else {
                html += renderTable(res.data, res.keys);
            }
        });
        html += `</div>`;
        contentArea.innerHTML = html || `<div class="empty-state">未找到相关内容</div>`;
    }

    function getTabLabel(key) {
        const map = {
            bonds: '🔗 羁绊', characters: '👤 角色技能', equipment: '🛡️ 装备道具',
            strategies: '📊 投资策略', environments: '🌍 投资环境', enemies_hp: '📈 敌人血量',
            enemy_configs: '👹 敌人配置', affixes: '🏷️ 难度词缀', multipliers: '📐 伤害乘区',
            panels: '📊 货币面板', triggers: '⚡ 触发效果', gameplays: '🎮 玩法收集',
            bugs: '🐛 Bug与修复', announcements: '📢 官方公告'
        };
        return map[key] || key;
    }

    // 事件绑定
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            searchInput.value = '';
            clearBtn.style.display = 'none';
            switchTab(tab.dataset.target);
        });
    });

    searchInput.addEventListener('input', (e) => {
        const val = e.target.value.trim();
        clearBtn.style.display = val ? 'block' : 'none';
        performSearch(val);
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        clearBtn.style.display = 'none';
        switchTab(currentTab);
        searchInput.focus();
    });

    // 初始化
    switchTab('bonds');
});
