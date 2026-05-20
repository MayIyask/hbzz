document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-btn');
    const contentArea = document.getElementById('contentArea');
    const searchInput = document.getElementById('globalSearch');

    // 初始化默认显示
    let currentTab = 'bonds';

    // 渲染表格函数
    function renderTable(data, keys) {
        if (!data || data.length === 0) return '<p class="note">暂无数据或搜索结果</p>';
        let html = '<table><thead><tr>';
        keys.forEach(k => html += `<th>${k}</th>`);
        html += '</tr></thead><tbody>';
        data.forEach(row => {
            html += '<tr>';
            keys.forEach(k => {
                let val = row[k] || '';
                // 简单格式化：逗号分隔转为标签
                if (val.includes(',')) {
                    val = val.split(',').map(v => `<span class="tag">${v.trim()}</span>`).join('');
                }
                html += `<td>${val}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    }

    // 切换选项卡
    function switchTab(tabName) {
        currentTab = tabName;
        tabs.forEach(t => t.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
        
        const data = CURRENCY_WAR_DATA[tabName];
        const keys = data.length > 0 ? Object.keys(data[0]) : [];
        
        contentArea.innerHTML = `<div class="section active">${renderTable(data, keys)}</div>`;
    }

    // 绑定选项卡点击
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });

    // 全局搜索逻辑
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (!query) {
            switchTab(currentTab);
            return;
        }

        // 跨表搜索
        const results = [];
        const seen = new Set(); // 去重
        Object.entries(CURRENCY_WAR_DATA).forEach(([tabName, dataArray]) => {
            dataArray.forEach(item => {
                // 检查是否匹配任意字段
                const match = Object.values(item).some(val => String(val).toLowerCase().includes(query));
                if (match && !seen.has(item)) {
                    results.push({ _tab: tabName, ...item });
                    seen.add(item);
                }
            });
        });

        contentArea.innerHTML = `<div class="section active"><h3>🔍 跨区搜索结果 (${results.length} 条)</h3>${renderTable(results, Object.keys(results[0] || {}))}</div>`;
    });

    // 初始渲染
    switchTab('bonds');
});
