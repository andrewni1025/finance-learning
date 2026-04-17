// 导航栏滚动效果
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navBackdrop = document.getElementById('navBackdrop');
const navClose = document.getElementById('navClose');
const backToTop = document.getElementById('backToTop');
const progressBar = document.getElementById('progressBar');
const isEnglishPage = document.documentElement.lang.toLowerCase().startsWith('en');
const searchHintText = isEnglishPage
    ? 'Search the site for terms, concepts, platforms, and topics...'
    : '输入关键词搜索全站内容，如 "做空"、"ETF"、"黄金"...';
const searchEmptyText = isEnglishPage
    ? 'Type a keyword to search the site...'
    : '输入关键词搜索全站内容...';
const searchNoResultText = isEnglishPage
    ? 'No matching content found. Try another keyword.'
    : '没有找到相关内容，试试其他关键词';

function setNavState(isOpen) {
    if (navMenu) navMenu.classList.toggle('active', isOpen);
    if (navBackdrop) navBackdrop.classList.toggle('active', isOpen);
    if (navToggle) navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    document.body.style.overflow = isOpen ? 'hidden' : '';
}

// 监听滚动
window.addEventListener('scroll', () => {
    // 导航栏阴影
    if (window.scrollY > 10) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // 回到顶部按钮
    if (backToTop) {
        if (window.scrollY > 500) {
            backToTop.classList.add('show');
        } else {
            backToTop.classList.remove('show');
        }
    }

    // 阅读进度条
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) progressBar.style.width = progress + '%';
});

// 移动端菜单切换
if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
        setNavState(!navMenu.classList.contains('active'));
    });
}

if (navClose) navClose.addEventListener('click', () => setNavState(false));
if (navBackdrop) navBackdrop.addEventListener('click', () => setNavState(false));

// 点击导航链接后关闭菜单
navMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        setNavState(false);
    });
});

// 回到顶部
if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// 导航高亮当前区域
const sections = document.querySelectorAll('.section, .hero');
const navLinks = document.querySelectorAll('.nav-menu-list a');

const observerOptions = {
    root: null,
    rootMargin: '-80px 0px -50% 0px',
    threshold: 0
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const id = entry.target.id;
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + id) {
                    link.classList.add('active');
                }
            });
        }
    });
}, observerOptions);

sections.forEach(section => {
    if (section.id) observer.observe(section);
});

// 卡片淡入动画
const cards = document.querySelectorAll('.card, .roadmap-step, .market-block, .tip-box');

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    fadeObserver.observe(card);
});

// 添加淡入样式
const style = document.createElement('style');
style.textContent = `
    .fade-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    .nav-menu-list a.active {
        color: var(--primary) !important;
        background: var(--primary-light);
    }
`;
document.head.appendChild(style);

// ============================== 
// 暗色模式
// ==============================
const themeToggle = document.getElementById('themeToggle');
const savedTheme = localStorage.getItem('theme');
const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
const initialTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
document.documentElement.setAttribute('data-theme', initialTheme);
if (themeToggle) themeToggle.textContent = initialTheme === 'dark' ? '☀️' : '🌙';

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navMenu?.classList.contains('active')) {
        setNavState(false);
    }
});

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
    });
}

// 监听系统主题变化（用户未手动设置过时）
if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            const newTheme = e.matches ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            if (themeToggle) themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
    });
}

// ============================== 
// 搜索功能
// ==============================
const searchToggle = document.getElementById('searchToggle');
const searchOverlay = document.getElementById('searchOverlay');
const searchInput = document.getElementById('searchInput');
const searchClose = document.getElementById('searchClose');
const searchResults = document.getElementById('searchResults');

function normalizeSearchText(text) {
    return text.toLowerCase().replace(/\s+/g, '');
}

function ensureSearchTargetId(element, fallbackPrefix, index) {
    if (element.id) return element.id;
    const generatedId = `${fallbackPrefix}-${index}`;
    element.id = generatedId;
    return generatedId;
}

function scrollToTarget(target) {
    const top = target.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top, behavior: 'smooth' });
}

// 构建搜索索引
function buildSearchIndex() {
    const index = [];
    document.querySelectorAll('.section, .hero').forEach(section => {
        const sectionId = section.id;
        const sectionTitle = section.querySelector('.section-title, h1')?.textContent.trim() || '';
        const searchableBlocks = section.querySelectorAll(
            '.card, .market-block, .tip-box, .warning-box, .faq-item, .roadmap-step, .glossary-table tbody tr'
        );

        searchableBlocks.forEach((block, blockIndex) => {
            const titleNode = block.querySelector('h3, h4, summary, td strong');
            const rawTitle = titleNode?.textContent.trim();
            const rawText = block.textContent.replace(/\s+/g, ' ').trim();

            if (!rawTitle || !rawText) return;

            const targetId = ensureSearchTargetId(block, `${sectionId || 'section'}-item`, blockIndex + 1);
            index.push({
                title: rawTitle,
                text: rawText,
                normalizedTitle: normalizeSearchText(rawTitle),
                normalizedText: normalizeSearchText(rawText),
                sectionTitle,
                sectionId,
                targetId
            });
        });
    });
    return index;
}

let searchIndex = [];
window.addEventListener('load', () => {
    searchIndex = buildSearchIndex();
});

function openSearch() {
    if (!searchOverlay || !searchInput || !searchResults) return;
    searchOverlay.classList.add('active');
    searchInput.value = '';
    searchResults.innerHTML = `<p class="search-hint">${searchHintText}</p>`;
    setTimeout(() => searchInput.focus(), 100);
}

function closeSearch() {
    if (searchOverlay) searchOverlay.classList.remove('active');
}

if (searchToggle) searchToggle.addEventListener('click', openSearch);
if (searchClose) searchClose.addEventListener('click', closeSearch);
if (searchOverlay) {
    searchOverlay.addEventListener('click', (e) => {
        if (e.target === searchOverlay) closeSearch();
    });
}

// Ctrl/Cmd + K 快捷键
document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
    }
    if (e.key === 'Escape') closeSearch();
});

if (searchInput) searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim();
    const normalizedQuery = normalizeSearchText(query);
    if (!query) {
        searchResults.innerHTML = `<p class="search-hint">${searchEmptyText}</p>`;
        return;
    }
    const results = searchIndex.filter(item =>
        item.normalizedTitle.includes(normalizedQuery) ||
        item.normalizedText.includes(normalizedQuery)
    );
    if (results.length === 0) {
        searchResults.innerHTML = `<p class="search-no-result">${searchNoResultText}</p>`;
        return;
    }
    searchResults.innerHTML = results.slice(0, 12).map(item => `
        <div class="search-result-item" data-target="${item.targetId}">
            <span class="search-result-section">${item.sectionTitle}</span>
            <h4>${highlightText(item.title, query)}</h4>
            <p>${highlightText(item.text.substring(0, 120), query)}...</p>
        </div>
    `).join('');

    searchResults.querySelectorAll('.search-result-item').forEach(el => {
        el.addEventListener('click', () => {
            const targetId = el.getAttribute('data-target');
            const target = document.getElementById(targetId);
            if (target) {
                closeSearch();
                if (target.tagName.toLowerCase() === 'details') {
                    target.open = true;
                }
                scrollToTarget(target);
            }
        });
    });
});

function highlightText(text, query) {
    if (!query) return text;
    const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeQuery})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
}

// ============================== 
// 术语表筛选
// ==============================
const filterBtns = document.querySelectorAll('.filter-btn');
const glossaryRows = document.querySelectorAll('.glossary-table tbody tr');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        glossaryRows.forEach(row => {
            if (filter === 'all' || row.getAttribute('data-category') === filter) {
                row.classList.remove('hidden');
            } else {
                row.classList.add('hidden');
            }
        });
    });
});

// ============================== 
// 计算器
// ==============================
const fmt = (n) => {
    if (!isFinite(n)) return '—';
    return n.toLocaleString('zh-CN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
};

const getNum = (id) => {
    const el = document.getElementById(id);
    return el ? parseFloat(el.value) || 0 : 0;
};
const setText = (id, text) => { const el = document.getElementById(id); if (el) el.textContent = text; };

// 复利计算器
function calcCompound() {
    const principal = getNum('c-principal');
    const monthly = getNum('c-monthly');
    const rate = getNum('c-rate') / 100;
    const years = getNum('c-years');
    const months = years * 12;
    const monthlyRate = rate / 12;

    let balance = principal;
    for (let i = 0; i < months; i++) {
        balance = balance * (1 + monthlyRate) + monthly;
    }
    const totalInput = principal + monthly * months;
    const gain = balance - totalInput;

    setText('c-total-input', '¥' + fmt(totalInput));
    setText('c-total-gain', '¥' + fmt(gain));
    setText('c-final', '¥' + fmt(balance));
}

// 仓位计算器
function calcPosition() {
    const capital = getNum('p-capital');
    const risk = getNum('p-risk') / 100;
    const entry = getNum('p-entry');
    const stop = getNum('p-stop');

    const maxLoss = capital * risk;
    const perShareRisk = Math.abs(entry - stop);
    const shares = perShareRisk > 0 ? Math.floor(maxLoss / perShareRisk) : 0;
    const total = shares * entry;

    setText('p-max-loss', '¥' + fmt(maxLoss));
    setText('p-per-share', '¥' + fmt(perShareRisk));
    setText('p-shares', shares.toLocaleString() + ' 股');
    setText('p-total', '¥' + fmt(total));
}

// 盈亏计算器
function calcProfitLoss() {
    const entry = getNum('pl-entry');
    const exit = getNum('pl-exit');
    const shares = getNum('pl-shares');
    const feeRate = getNum('pl-fee') / 100;

    const gross = (exit - entry) * shares;
    const feeAmt = (entry + exit) * shares * feeRate;
    const net = gross - feeAmt;
    const pct = entry > 0 ? ((net / (entry * shares)) * 100) : 0;

    setText('pl-gross', '¥' + fmt(gross));
    setText('pl-fee-amt', '¥' + fmt(feeAmt));
    setText('pl-net', '¥' + fmt(net));
    setText('pl-pct', pct.toFixed(2) + '%');
}

// 汇率换算
function calcFx() {
    const amount = getNum('fx-amount');
    const rate = getNum('fx-rate');
    const from = document.getElementById('fx-from')?.value || 'CNY';
    const to = document.getElementById('fx-to')?.value || 'USD';
    const result = amount * rate;
    setText('fx-output', fmt(result) + ' ' + to + '（' + fmt(amount) + ' ' + from + '）');
}

// 绑定按钮
const bindCalc = (btnId, fn) => {
    const btn = document.getElementById(btnId);
    if (btn) {
        btn.addEventListener('click', fn);
        // 自动监听输入变化实时计算
        btn.closest('.calc-card')?.querySelectorAll('input, select').forEach(input => {
            input.addEventListener('input', fn);
        });
    }
};

bindCalc('c-calc', calcCompound);
bindCalc('p-calc', calcPosition);
bindCalc('pl-calc', calcProfitLoss);
bindCalc('fx-calc', calcFx);

// 页面加载时执行一次以显示默认结果
document.addEventListener('DOMContentLoaded', () => {
    calcCompound();
    calcPosition();
    calcProfitLoss();
    calcFx();
});

