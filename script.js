// チュートリアルボタンのクリックイベント
document.querySelector('.tutorial-btn').addEventListener('click', () => {
    document.getElementById('tutorialModal').classList.add('active');
});

// チュートリアル完了ボタンのクリックイベント
document.querySelector('.complete-tutorial-btn').addEventListener('click', () => {
    document.querySelector('.tutorial-card').style.display = 'none';
    document.getElementById('tutorialModal').classList.remove('active');
});

// モーダルを閉じる
document.querySelector('.modal-close').addEventListener('click', () => {
    document.getElementById('tutorialModal').classList.remove('active');
});

document.querySelector('.modal-overlay').addEventListener('click', () => {
    document.getElementById('tutorialModal').classList.remove('active');
});

// 既存のコードに追加
const analyticsData = {
    daily: {
        totalUsers: { value: 425, prevValue: 420 },
        activeUsers: { value: 324, rate: 76, prevValue: 310, prevRate: 72 },
        studyTime: { value: 42, prevValue: 38 },
        actionCount: { value: 3.8, prevValue: 4.0 }
    },
    weekly: {
        totalUsers: { value: 420, prevValue: 410 },
        activeUsers: { value: 298, rate: 72, prevValue: 285, prevRate: 70 },
        studyTime: { value: 38, prevValue: 35 },
        actionCount: { value: 3.5, prevValue: 3.6 }
    },
    monthly: {
        totalUsers: { value: 410, prevValue: 395 },
        activeUsers: { value: 276, rate: 68, prevValue: 265, prevRate: 65 },
        studyTime: { value: 35, prevValue: 33 },
        actionCount: { value: 3.2, prevValue: 3.3 }
    }
};

// 期間選択ボタンのイベントリスナー
document.querySelectorAll('#homePage .period-selector button, #analyticsPage .period-selector button').forEach(button => {
    button.addEventListener('click', () => {
        // アクティブクラスの切り替え
        const container = button.closest('.period-selector');
        container.querySelector('button.active').classList.remove('active');
        button.classList.add('active');

        // データの更新
        const period = button.dataset.period;
        const page = button.closest('[id]').id;
        updateAnalytics(period, page);
    });
});

function updateAnalytics(period, pageId) {
    const data = analyticsData[period];
    const periodText = {
        'daily': '前日',
        'weekly': '先週',
        'monthly': '先月'
    }[period];

    // 各カードの値を更新
    const container = document.querySelector(`#${pageId} .analytics-grid`);
    updateCard('総受講者数', data.totalUsers, periodText, false);
    updateCard('アクティブユーザー', data.activeUsers, periodText, true);
    updateCard('平均学習時間', data.studyTime, periodText, false);
    updateCard('平均アクション完了数', data.actionCount, periodText, false);

    // アナリティクスページの場合、グラフも更新
    if (pageId === 'analyticsPage' && window.analyticsChart) {
        const { labels, data: chartData } = generateSampleData(30);
        window.analyticsChart.data.labels = labels;
        window.analyticsChart.data.datasets[0].data = chartData;
        window.analyticsChart.update();
    }
}

function updateCard(title, data, periodText, showRate = false) {
    const card = [...document.querySelectorAll('#homePage .analytics-title, #analyticsPage .analytics-title')]
        .find(el => el.textContent === title)
        .parentElement;
    
    const valueEl = card.querySelector('.analytics-value');
    const trendEl = card.querySelector('.analytics-trend');
    
    if (showRate) {
        valueEl.innerHTML = `
            <span class="main-value">${data.value}</span>
            <span class="sub-value">(${data.rate}<span class="unit">%</span>)</span>
        `;
        trendEl.innerHTML = `
            <span class="trend-icon">${data.value >= data.prevValue ? '↑' : '↓'}</span>
            <span class="trend-value">${data.prevValue}名</span>
            <span class="trend-icon">${data.rate >= data.prevRate ? '↑' : '↓'}</span>
            <span class="trend-rate">${data.prevRate}<span class="unit">%</span></span>
            <span class="trend-period">${periodText}</span>
        `;
    } else {
        valueEl.innerHTML = `
            <span class="main-value">${data.value}</span>
            <span class="unit">${getUnit(title)}</span>
        `;
        trendEl.innerHTML = `
            <span class="trend-icon">${data.value >= data.prevValue ? '↑' : '↓'}</span>
            <span class="trend-value">${data.prevValue}${getUnit(title)}</span>
            <span class="trend-period">${periodText}</span>
        `;
    }

    trendEl.className = `analytics-trend ${data.value >= data.prevValue ? 'positive' : 'negative'}`;
}

function getUnit(title) {
    switch (title) {
        case '総受講者数':
            return '名';
        case '平均学習時間':
            return '分/日';
        case '平均アクション完了数':
            return '個/日';
        default:
            return '';
    }
}

// ページ遷移の管理
function showPage(pageId) {
    // すべてのページを非表示
    document.querySelectorAll('.content > div').forEach(page => {
        page.style.display = 'none';
    });

    // 指定されたページを表示
    document.getElementById(pageId).style.display = 'block';

    // サイドバーのアクティブ状態を更新
    document.querySelectorAll('.sidebar li').forEach(item => {
        item.classList.remove('active');
    });

    // 現在のページのメニュー項目をアクティブに
    const activeMenuItem = document.querySelector(`[data-page="${pageId}"]`);
    if (activeMenuItem) {
        activeMenuItem.closest('li').classList.add('active');
    }

    // アナリティクスページが表示された場合、グラフを初期化
    if (pageId === 'analyticsPage') {
        initAnalyticsChart();
    }
}

// DOMの読み込み完了時の処理
document.addEventListener('DOMContentLoaded', function() {
    // サイドバーのリンクにイベントリスナーを追加
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.closest('li').dataset.page;
            if (pageId) {
                showPage(pageId);
                // URLの更新（オプション）
                history.pushState({page: pageId}, '', `#${pageId}`);
            }
        });
    });

    // URLのハッシュに基づいて初期ページを表示
    const hash = window.location.hash.slice(1);
    if (hash) {
        showPage(hash);
    }
});

// グラフの初期化関数
function initAnalyticsChart() {
    console.log('Initializing chart...');
    const ctx = document.getElementById('analyticsChart').getContext('2d');
    if (!ctx) {
        console.error('Canvas context not found');
        return;
    }

    // 既存のグラフを破棄
    if (window.analyticsChart instanceof Chart) {
        window.analyticsChart.destroy();
    }

    // 現在選択されている期間を取得
    const activePeriod = document.querySelector('#analyticsPage .period-selector button.active').dataset.period;

    const datasets = {
        totalUsers: generateDataForPeriod('totalUsers', activePeriod),
        activeUsers: generateDataForPeriod('activeUsers', activePeriod),
        studyTime: generateDataForPeriod('studyTime', activePeriod),
        actionCount: generateDataForPeriod('actionCount', activePeriod)
    };

    window.analyticsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: datasets.totalUsers.labels,
            datasets: [{
                label: '総受講者数',
                data: datasets.totalUsers.data,
                borderColor: '#1a237e',
                backgroundColor: 'rgba(26, 35, 126, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const metric = document.querySelector('.metric-selector button.active').dataset.metric;
                            const units = {
                                totalUsers: '名',
                                activeUsers: '名',
                                studyTime: '分/日',
                                actionCount: '個/日'
                            };
                            return `${context.parsed.y}${units[metric]}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                    },
                    ticks: {
                        callback: function(value) {
                            return value + '名';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 12
                    }
                }
            }
        }
    });

    // 期間選択ボタンのイベントリスナー
    document.querySelectorAll('#analyticsPage .period-selector button').forEach(button => {
        button.addEventListener('click', () => {
            const period = button.dataset.period;
            const currentMetric = document.querySelector('.metric-selector button.active').dataset.metric;
            
            // アクティブ状態の更新
            document.querySelector('.period-selector button.active').classList.remove('active');
            button.classList.add('active');
            
            // データセットを更新
            Object.keys(datasets).forEach(key => {
                datasets[key] = generateDataForPeriod(key, period);
            });
            
            // グラフを更新
            updateChartMetric(currentMetric, datasets);
            
            // X軸のラベルを更新
            window.analyticsChart.data.labels = datasets[currentMetric].labels;
            window.analyticsChart.update();
        });
    });

    // メトリクス切り替えボタンのイベントリスナー
    document.querySelectorAll('.metric-selector button').forEach(button => {
        button.addEventListener('click', () => {
            const metric = button.dataset.metric;
            updateChartMetric(metric, datasets);
            
            // アクティブ状態の更新
            document.querySelector('.metric-selector button.active').classList.remove('active');
            button.classList.add('active');
        });
    });
}

// サンプルデータの生成関数
function generateSampleData(days, baseValue, variance) {
    const data = [];
    const labels = [];
    let value = baseValue;

    for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - i - 1));
        labels.push(date.toLocaleDateString('ja-JP'));
        
        // ランダムな変動を加える
        value += Math.random() * variance * 2 - variance;
        value = Math.max(0, value); // 負の値を防ぐ
        data.push(Math.round(value * 10) / 10);
    }

    return { labels, data };
}

// グラフのメトリクス更新関数
function updateChartMetric(metric, datasets) {
    const labels = {
        totalUsers: '総受講者数',
        activeUsers: 'アクティブユーザー',
        studyTime: '平均学習時間',
        actionCount: '平均アクション完了数'
    };

    const units = {
        totalUsers: '名',
        activeUsers: '名',
        studyTime: '分/日',
        actionCount: '個/日'
    };

    window.analyticsChart.data.datasets[0].label = labels[metric];
    window.analyticsChart.data.datasets[0].data = datasets[metric].data;
    
    // Y軸の単位を更新
    window.analyticsChart.options.scales.y.ticks = {
        callback: function(value) {
            return value + units[metric];
        }
    };

    window.analyticsChart.update();
}

// 期間に応じたデータを生成する関数
function generateDataForPeriod(metric, period) {
    const baseValues = {
        totalUsers: { value: 400, variance: 20 },
        activeUsers: { value: 300, variance: 15 },
        studyTime: { value: 40, variance: 5 },
        actionCount: { value: 4, variance: 0.5 }
    };

    const periodConfig = {
        daily: { days: 30, format: 'M/D' },
        weekly: { days: 12, format: 'M/D週' },
        monthly: { days: 12, format: 'YYYY年M月' }
    };

    const config = periodConfig[period];
    const { value, variance } = baseValues[metric];

    const data = [];
    const labels = [];
    let currentValue = value;

    for (let i = 0; i < config.days; i++) {
        const date = new Date();
        
        if (period === 'daily') {
            date.setDate(date.getDate() - (config.days - i - 1));
        } else if (period === 'weekly') {
            date.setDate(date.getDate() - (config.days - i - 1) * 7);
        } else {
            date.setMonth(date.getMonth() - (config.days - i - 1));
        }

        // 日付フォーマットの生成
        const label = formatDate(date, period);
        labels.push(label);

        // 期間に応じてデータの変動を調整
        const periodVariance = period === 'daily' ? variance : 
                             period === 'weekly' ? variance * 2 : 
                             variance * 3;

        currentValue += Math.random() * periodVariance * 2 - periodVariance;
        currentValue = Math.max(0, currentValue);
        data.push(Math.round(currentValue * 10) / 10);
    }

    return { labels, data };
}

// 日付フォーマット関数
function formatDate(date, period) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    switch (period) {
        case 'daily':
            return `${month}/${day}`;
        case 'weekly':
            return `${month}/${day}週`;
        case 'monthly':
            return `${year}年${month}月`;
        default:
            return '';
    }
} 