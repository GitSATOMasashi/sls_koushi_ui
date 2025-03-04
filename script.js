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
        // 既存のグラフを破棄して再初期化
        const existingChart = Chart.getChart('retentionChart');
        if (existingChart) {
            existingChart.destroy();
        }
        initRetentionChart();
    }
}

// DOMの読み込み完了時の処理
document.addEventListener('DOMContentLoaded', function() {
    // アナリティクス概要の期間選択
    document.querySelectorAll('.analytics-overview .period-selector button').forEach(button => {
        button.addEventListener('click', () => {
            // アクティブ状態の更新
            const overview = button.closest('.analytics-overview');
            overview.querySelector('.period-selector button.active').classList.remove('active');
            button.classList.add('active');

            // 期間に応じてデータを更新
            const period = button.dataset.period;
            updateOverviewData(period);
        });
    });

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
    document.querySelectorAll('.graph-section .period-selector button').forEach(button => {
        button.addEventListener('click', () => {
            const period = button.dataset.period;
            const currentMetric = document.querySelector('.metric-selector button.active').dataset.metric;
            
            // アクティブ状態の更新
            button.closest('.graph-section').querySelector('.period-selector button.active').classList.remove('active');
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

// アナリティクス概要のデータ更新関数
function updateOverviewData(period) {
    // 各指標のデータを更新
    const data = generateOverviewData(period);
    
    // 前日比の計算用に前日のデータも生成
    const prevData = generateOverviewData(period);
    
    // 総受講者数の更新
    const totalUsersCard = document.querySelector('.analytics-overview .analytics-card:nth-child(1)');
    totalUsersCard.querySelector('.main-value').textContent = data.totalUsers;
    updateTrendValue(totalUsersCard, data.totalUsers, prevData.totalUsers);
    
    // アクティブユーザー数の更新
    const activeUsersCard = document.querySelector('.analytics-overview .analytics-card:nth-child(2)');
    activeUsersCard.querySelector('.main-value').textContent = data.activeUsers;
    activeUsersCard.querySelector('.sub-value').textContent = 
        `(${Math.round(data.activeUsers / data.totalUsers * 100)}%)`;
    updateTrendValue(activeUsersCard, data.activeUsers, prevData.activeUsers);
    
    // 平均学習時間の更新
    const studyTimeCard = document.querySelector('.analytics-overview .analytics-card:nth-child(3)');
    studyTimeCard.querySelector('.main-value').textContent = data.studyTime;
    updateTrendValue(studyTimeCard, data.studyTime, prevData.studyTime);
    
    // 平均アクション完了数の更新
    const actionCountCard = document.querySelector('.analytics-overview .analytics-card:nth-child(4)');
    actionCountCard.querySelector('.main-value').textContent = data.actionCount;
    updateTrendValue(actionCountCard, data.actionCount, prevData.actionCount);
}

// トレンド値の更新関数
function updateTrendValue(card, currentValue, prevValue) {
    const trendElement = card.querySelector('.analytics-trend');
    const trendIcon = trendElement.querySelector('.trend-icon');
    const trendValue = trendElement.querySelector('.trend-value');
    const trendPeriod = trendElement.querySelector('.trend-period');
    
    const difference = currentValue - prevValue;
    const isPositive = difference > 0;
    const isEqual = difference === 0;
    
    // カードのタイトルから指標の種類を判断
    const metricTitle = card.querySelector('.analytics-title').textContent;
    const { unit, positiveVerb, negativeVerb } = getMetricInfo(metricTitle);
    
    if (isEqual) {
        trendElement.className = 'analytics-trend neutral';
        trendIcon.textContent = '→';
        trendValue.textContent = '前日から変化はありません';
    } else {
        trendElement.className = `analytics-trend ${isPositive ? 'positive' : 'negative'}`;
        trendIcon.textContent = isPositive ? '↑' : '↓';
        trendValue.textContent = `前日より ${Math.abs(difference).toFixed(1).replace('.0', '')}${unit} ${isPositive ? positiveVerb : negativeVerb}`;
    }
    
    trendPeriod.style.display = 'none'; // 不要な要素を非表示
}

// 指標ごとの単位と表現を取得する関数
function getMetricInfo(metricTitle) {
    switch(metricTitle) {
        case '総受講者数':
            return { unit: '名', positiveVerb: '増えています', negativeVerb: '減っています' };
        case 'アクティブユーザー数':
            return { unit: '名', positiveVerb: '増えています', negativeVerb: '減っています' };
        case '平均学習時間':
            return { unit: '分', positiveVerb: '長くなっています', negativeVerb: '短くなっています' };
        case '平均アクション完了数':
            return { unit: '個', positiveVerb: '増えています', negativeVerb: '減っています' };
        default:
            return { unit: '', positiveVerb: '増えています', negativeVerb: '減っています' };
    }
}

// アナリティクス概要のデータ生成関数
function generateOverviewData(period) {
    // 期間に応じてベース値を調整
    const baseMultiplier = period === 'daily' ? 1 : 
                          period === 'weekly' ? 7 : 30;
    
    // 期間に応じた基準値の設定
    const baseValues = {
        daily: {
            totalUsers: 425,
            activeUsers: 324,
            studyTime: 42,
            actionCount: 3.8
        },
        weekly: {
            totalUsers: 410,
            activeUsers: 298,
            studyTime: 280,
            actionCount: 24.5
        },
        monthly: {
            totalUsers: 380,
            activeUsers: 275,
            studyTime: 1200,
            actionCount: 95.0
        }
    };
    
    const base = baseValues[period];
    const variance = 0.1; // 10%の変動
    
    return {
        totalUsers: Math.round(base.totalUsers * (1 + Math.random() * variance)),
        activeUsers: Math.round(base.activeUsers * (1 + Math.random() * variance)),
        studyTime: Math.round(base.studyTime * (1 + Math.random() * variance)),
        actionCount: Math.round(base.actionCount * (1 + Math.random() * variance) * 10) / 10
    };
}

// 学習継続率のグラフ初期化
function initRetentionChart() {
    const canvas = document.getElementById('retentionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1週目', '2週目', '3週目', '4週目', '5週目', '6週目', '7週目', '8週目'],
            datasets: [{
                label: '学習継続率',
                data: [100, 92, 85, 78, 72, 68, 65, 62],
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
                            return context.parsed.y + '%';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function initHeatmap() {
    const heatmapGrid = document.querySelector('.heatmap-grid');
    if (!heatmapGrid) return;
    
    // 既存のセルをクリア
    heatmapGrid.innerHTML = '';
    
    // 0時から23時までの24時間分のセルを生成
    for (let hour = 0; hour < 24; hour++) {
        const cell = document.createElement('div');
        cell.className = 'heatmap-cell';
        
        // 仮のデータ生成（実際はAPIからデータを取得）
        const value = Math.random() * 100;
        const intensity = value / 100;
        
        // 時間帯によって異なる強度を設定（例：夜間は高い値）
        let adjustedIntensity = intensity;
        if (hour >= 19 && hour <= 22) {  // 19時〜22時はピーク
            adjustedIntensity = 0.7 + (Math.random() * 0.3);  // 0.7〜1.0
        } else if (hour >= 9 && hour <= 17) {  // 9時〜17時は中程度
            adjustedIntensity = 0.3 + (Math.random() * 0.4);  // 0.3〜0.7
        } else {  // その他の時間は低め
            adjustedIntensity = 0.1 + (Math.random() * 0.2);  // 0.1〜0.3
        }
        
        cell.style.setProperty('--cell-color', `rgba(26, 35, 126, ${adjustedIntensity})`);
        cell.title = `${hour}時: ${Math.round(value)}%`;
        heatmapGrid.appendChild(cell);
    }
}

// ページ表示時にヒートマップを初期化
document.addEventListener('DOMContentLoaded', () => {
    initHeatmap();
});

// 学習継続性グラフの初期化
function initContinuityChart() {
    const ctx = document.getElementById('continuityChart').getContext('2d');
    if (!ctx) return;
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1日', '2日', '3日', '4日', '5日', '6日', '7日', '10日', '14日', '20日', '30日'],
            datasets: [{
                label: '受講生の割合',
                data: [15, 12, 10, 8, 7, 6, 5, 4, 3, 2, 1], // 各日数に対応するデータ
                backgroundColor: [
                    'rgba(26, 35, 126, 0.1)',
                    'rgba(26, 35, 126, 0.15)',
                    'rgba(26, 35, 126, 0.2)',
                    'rgba(26, 35, 126, 0.25)',
                    'rgba(26, 35, 126, 0.3)',
                    'rgba(26, 35, 126, 0.35)',
                    'rgba(26, 35, 126, 0.4)',
                    'rgba(26, 35, 126, 0.5)',
                    'rgba(26, 35, 126, 0.6)',
                    'rgba(26, 35, 126, 0.8)',
                    'rgba(26, 35, 126, 1.0)'
                ],
                borderColor: [
                    'rgba(26, 35, 126, 1)',
                    'rgba(26, 35, 126, 1)',
                    'rgba(26, 35, 126, 1)',
                    'rgba(26, 35, 126, 1)',
                    'rgba(26, 35, 126, 1)',
                    'rgba(26, 35, 126, 1)',
                    'rgba(26, 35, 126, 1)',
                    'rgba(26, 35, 126, 1)',
                    'rgba(26, 35, 126, 1)',
                    'rgba(26, 35, 126, 1)',
                    'rgba(26, 35, 126, 1)'
                ],
                borderWidth: 1
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
                            return context.parsed.y + '%';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 20, // 最大値を調整
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

// ページ表示時に継続性グラフを初期化
document.addEventListener('DOMContentLoaded', () => {
    initHeatmap();
    initContinuityChart();
}); 