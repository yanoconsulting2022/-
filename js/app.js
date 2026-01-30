// グローバル変数
let currentQuestion = 0;
let diagnosisData = {};
let allDiagnosisRecords = [];
const ADMIN_USERNAME = 'yano';
const ADMIN_PASSWORD = 'makoto2025';

// ページ読み込み時
document.addEventListener('DOMContentLoaded', function() {
    // ローカルストレージから診断データを読み込み
    loadDiagnosisRecords();
    
    // 管理者ログインフォーム
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            adminLogin();
        });
    }

    // セッションチェック
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        if (window.location.hash === '#admin') {
            showAdminDashboard();
        }
    }
});

// ランディングページから診断開始
function startDiagnosis() {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('diagnosis-form').classList.remove('hidden');
    window.scrollTo(0, 0);
}

// 次の質問へ
function nextQuestion(current) {
    const questionCard = document.querySelector(`[data-question="${current}"]`);
    
    // バリデーション
    if (!validateQuestion(current)) {
        alert('この質問に回答してください');
        return;
    }
    
    // 回答を保存
    saveAnswer(current);
    
    // 次の質問を表示
    questionCard.classList.remove('active');
    const nextCard = document.querySelector(`[data-question="${current + 1}"]`);
    if (nextCard) {
        nextCard.classList.add('active');
        currentQuestion = current + 1;
        updateProgress();
        window.scrollTo(0, 0);
    }
}

// 前の質問へ
function prevQuestion(current) {
    const questionCard = document.querySelector(`[data-question="${current}"]`);
    questionCard.classList.remove('active');
    
    const prevCard = document.querySelector(`[data-question="${current - 1}"]`);
    if (prevCard) {
        prevCard.classList.add('active');
        currentQuestion = current - 1;
        updateProgress();
        window.scrollTo(0, 0);
    }
}

// プログレスバー更新
function updateProgress() {
    const progress = (currentQuestion / 8) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    document.getElementById('current-question').textContent = currentQuestion;
}

// 質問のバリデーション
function validateQuestion(questionNum) {
    const questionCard = document.querySelector(`[data-question="${questionNum}"]`);
    
    if (questionNum === 0) {
        // 基本情報のバリデーション
        const name = questionCard.querySelector('input[name="name"]');
        const company = questionCard.querySelector('input[name="company"]');
        const phone = questionCard.querySelector('input[name="phone"]');
        const email = questionCard.querySelector('input[name="email"]');
        
        if (!name.value.trim()) {
            alert('お名前を入力してください');
            return false;
        }
        if (!company.value.trim()) {
            alert('会社名を入力してください');
            return false;
        }
        if (!phone.value.trim()) {
            alert('電話番号を入力してください');
            return false;
        }
        if (!email.value.trim()) {
            alert('メールアドレスを入力してください');
            return false;
        }
        // 簡易メールバリデーション
        if (!email.value.includes('@')) {
            alert('有効なメールアドレスを入力してください');
            return false;
        }
        return true;
    } else if (questionNum === 6) {
        // チェックボックスは少なくとも1つチェック
        const checkboxes = questionCard.querySelectorAll('input[type="checkbox"]');
        return Array.from(checkboxes).some(cb => cb.checked);
    } else if (questionNum === 7) {
        // テキストエリア
        const textarea = questionCard.querySelector('textarea');
        return textarea.value.trim() !== '';
    } else {
        // ラジオボタン
        const radios = questionCard.querySelectorAll('input[type="radio"]');
        return Array.from(radios).some(radio => radio.checked);
    }
}

// 回答を保存
function saveAnswer(questionNum) {
    const questionCard = document.querySelector(`[data-question="${questionNum}"]`);
    
    if (questionNum === 0) {
        // 基本情報
        diagnosisData.name = questionCard.querySelector('input[name="name"]').value;
        diagnosisData.company = questionCard.querySelector('input[name="company"]').value;
        diagnosisData.phone = questionCard.querySelector('input[name="phone"]').value;
        diagnosisData.email = questionCard.querySelector('input[name="email"]').value;
    } else if (questionNum === 6) {
        // チェックボックス（複数選択）
        const checkboxes = questionCard.querySelectorAll('input[name="q6"]:checked');
        diagnosisData[`q${questionNum}`] = Array.from(checkboxes).map(cb => cb.value);
    } else if (questionNum === 7) {
        // テキストエリア
        const textarea = questionCard.querySelector('textarea[name="q7"]');
        diagnosisData[`q${questionNum}`] = textarea.value;
    } else {
        // ラジオボタン
        const radio = questionCard.querySelector(`input[name="q${questionNum}"]:checked`);
        if (radio) {
            diagnosisData[`q${questionNum}`] = radio.value;
        }
    }
}

// 診断を送信
function submitDiagnosis() {
    if (!validateQuestion(7)) {
        alert('最後の質問に回答してください');
        return;
    }
    
    saveAnswer(7);
    
    // タイムスタンプを追加
    diagnosisData.timestamp = new Date().toISOString();
    
    // 診断結果を計算
    const result = calculateDiagnosis(diagnosisData);
    diagnosisData.result = result;
    
    // ローカルストレージに保存
    saveDiagnosisRecord(diagnosisData);
    
    // 結果画面を表示
    showResult(result);
}

// 診断結果を計算（4象限マトリクス）
function calculateDiagnosis(data) {
    let successorReadiness = 0; // 後継者の準備度
    let commitmentLevel = 0; // 想いの強さ
    
    // Q2: 後継者候補の有無で準備度を判定
    if (data.q2.includes('息子娘いる・継ぐ意思あり')) {
        successorReadiness = 3;
    } else if (data.q2.includes('息子娘いる・継ぐ意思不明') || data.q2.includes('社内に候補者がいる')) {
        successorReadiness = 2;
    } else if (data.q2.includes('息子娘いる・継ぐ意思なし')) {
        successorReadiness = 1;
    } else {
        successorReadiness = 0;
    }
    
    // Q4: 大事にしたいことで想いの強さを判定
    if (data.q4.includes('自分の想いを引き継いでほしい') || data.q4.includes('従業員の雇用を守る') || data.q4.includes('地域への貢献を続けたい')) {
        commitmentLevel = 2;
    } else {
        commitmentLevel = 1;
    }
    
    // 4象限に分類
    let quadrant = '';
    let choice = '';
    let feasibility = '';
    let actions = [];
    let risks = [];
    
    if (successorReadiness >= 2 && commitmentLevel >= 2) {
        // A象限: 親族承継（準備OK型）
        quadrant = 'A象限（親族承継・準備OK型）';
        choice = '親族承継';
        feasibility = '高い';
        actions = [
            { timeline: '今月中', text: '株価算定の専門家に相談する' },
            { timeline: '3ヶ月以内', text: '後継者との承継計画対話を開始する（月1回）' },
            { timeline: '1年以内', text: '従業員への発表タイミングを設計する' }
        ];
        risks = [
            '後継者の本音を確認せずに進めると、途中で計画が頓挫する可能性があります',
            '株式承継の税務対策を早期に始めないと、多額の税金が発生します'
        ];
    } else if (successorReadiness < 2 && commitmentLevel >= 2) {
        // B象限: 親族承継（準備不足型）
        quadrant = 'B象限（親族承継・準備不足型）';
        choice = '親族承継（要準備）';
        feasibility = '中程度';
        actions = [
            { timeline: '今月中', text: '後継者の本音を確認する（クレドカード診断）' },
            { timeline: '3ヶ月以内', text: '3年間の後継者育成計画を策定する' },
            { timeline: '1年以内', text: '緊急時の代替案（M&A）も並行検討する' }
        ];
        risks = [
            '後継者の準備が不十分なまま承継すると、会社が立ち行かなくなる可能性があります',
            '育成期間を過小評価すると、予定通りに引退できません'
        ];
    } else if (successorReadiness >= 2 && commitmentLevel < 2) {
        // C象限: M&A（想い薄い型）
        quadrant = 'C象限（M&A・想い薄い型）';
        choice = 'M&A';
        feasibility = '高い';
        actions = [
            { timeline: '今月中', text: '簡易企業価値算定を実施する' },
            { timeline: '3ヶ月以内', text: '買い手候補3社をリストアップする' },
            { timeline: '1年以内', text: '売却条件の優先順位を整理し、交渉を開始する' }
        ];
        risks = [
            '企業価値を正しく把握せずに売却すると、安値で買い叩かれる可能性があります',
            '従業員や取引先への配慮を欠くと、売却後にトラブルが発生します'
        ];
    } else {
        // D象限: 迷走中（要整理型）
        quadrant = 'D象限（迷走中・要整理型）';
        choice = '要整理（方向性の明確化が必要）';
        feasibility = '要準備';
        actions = [
            { timeline: '今月中', text: 'ビジョン整理セッションで想いを言語化する' },
            { timeline: '3ヶ月以内', text: '簡易財務診断で会社の現状を把握する' },
            { timeline: '1年以内', text: '親族承継・M&A・廃業の3つを比較検討する' }
        ];
        risks = [
            '決断を先延ばしにすると、選択肢が減っていきます',
            '想いと数字を整理しないまま進めると、後悔する決断をしてしまう可能性があります'
        ];
    }
    
    return {
        quadrant,
        choice,
        feasibility,
        actions,
        risks
    };
}

// 診断結果を表示
function showResult(result) {
    document.getElementById('diagnosis-form').classList.add('hidden');
    document.getElementById('diagnosis-result').classList.remove('hidden');
    
    // 診断日
    const now = new Date();
    document.getElementById('diagnosis-date').textContent = 
        `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    
    // マトリクス図を描画
    drawMatrix(result.quadrant);
    
    // 診断結果サマリー
    document.getElementById('result-quadrant').textContent = result.quadrant;
    document.getElementById('result-choice').textContent = result.choice;
    document.getElementById('result-feasibility').textContent = result.feasibility;
    
    // 次の一手
    const actionList = document.getElementById('action-list');
    actionList.innerHTML = '';
    result.actions.forEach(action => {
        const actionItem = document.createElement('div');
        actionItem.className = 'action-item';
        actionItem.innerHTML = `
            <div class="action-timeline">${action.timeline}</div>
            <div class="action-text">${action.text}</div>
        `;
        actionList.appendChild(actionItem);
    });
    
    // リスク
    const riskList = document.getElementById('risk-list');
    riskList.innerHTML = '';
    result.risks.forEach(risk => {
        const riskItem = document.createElement('div');
        riskItem.className = 'risk-item';
        riskItem.textContent = '⚠️ ' + risk;
        riskList.appendChild(riskItem);
    });
    
    window.scrollTo(0, 0);
}

// マトリクス図を描画
function drawMatrix(quadrant) {
    const matrixDiagram = document.getElementById('matrix-diagram');
    
    // 象限を判定
    let activeQuadrant = '';
    if (quadrant.includes('A象限')) activeQuadrant = 'A';
    else if (quadrant.includes('B象限')) activeQuadrant = 'B';
    else if (quadrant.includes('C象限')) activeQuadrant = 'C';
    else if (quadrant.includes('D象限')) activeQuadrant = 'D';
    
    matrixDiagram.innerHTML = `
        <div class="matrix-labels label-top">後継者の準備度 →</div>
        <div class="matrix-labels label-left">想いの強さ →</div>
        
        <div class="matrix-quadrant quadrant-b ${activeQuadrant === 'B' ? 'active' : ''}">
            <div class="quadrant-label">B象限</div>
            <div class="quadrant-description">親族承継<br>（準備不足型）</div>
        </div>
        <div class="matrix-quadrant quadrant-a ${activeQuadrant === 'A' ? 'active' : ''}">
            <div class="quadrant-label">A象限</div>
            <div class="quadrant-description">親族承継<br>（準備OK型）</div>
        </div>
        <div class="matrix-quadrant quadrant-d ${activeQuadrant === 'D' ? 'active' : ''}">
            <div class="quadrant-label">D象限</div>
            <div class="quadrant-description">迷走中<br>（要整理型）</div>
        </div>
        <div class="matrix-quadrant quadrant-c ${activeQuadrant === 'C' ? 'active' : ''}">
            <div class="quadrant-label">C象限</div>
            <div class="quadrant-description">M&A<br>（想い薄い型）</div>
        </div>
    `;
}

// 診断レポートをダウンロード
function downloadReport() {
    // PDFではなくテキストファイルとしてダウンロード
    const result = diagnosisData.result;
    const now = new Date();
    
    let reportText = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━
決断診断レポート
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

【お名前】${diagnosisData.name} 様
【会社名】${diagnosisData.company}
【診断日】${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日
【診断者】承継・M&Aの決断参謀 矢野誠

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
あなたの現在地
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

■ 診断結果：${result.quadrant}
■ 最適な選択肢：${result.choice}
■ 実現可能性：${result.feasibility}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
次の一手（今からできること）
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;
    
    result.actions.forEach((action, index) => {
        reportText += `${index + 1}. ${action.text}（${action.timeline}）\n`;
    });
    
    reportText += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
注意すべきリスク
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

`;
    
    result.risks.forEach(risk => {
        reportText += `⚠️ ${risk}\n`;
    });
    
    reportText += `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
さらに深掘りしたい方へ
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

個別相談（60分・初回無料）で、
想いと数字を「勝てる形」に整理します。

ご希望の方は、下記よりお申し込みください。
https://timerex.net/s/yanoconsulting2022_1f3b/ae0058a7

━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
    
    // ダウンロード
    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `決断診断レポート_${diagnosisData.company}_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// 診断記録を保存
function saveDiagnosisRecord(data) {
    allDiagnosisRecords.push(data);
    localStorage.setItem('diagnosisRecords', JSON.stringify(allDiagnosisRecords));
}

// 診断記録を読み込み
function loadDiagnosisRecords() {
    const stored = localStorage.getItem('diagnosisRecords');
    if (stored) {
        allDiagnosisRecords = JSON.parse(stored);
    }
}

// 管理者ログイン画面を表示
function showAdminLogin() {
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('diagnosis-form').classList.add('hidden');
    document.getElementById('diagnosis-result').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
    document.getElementById('admin-login').classList.remove('hidden');
    window.scrollTo(0, 0);
}

// 管理者ログイン
function adminLogin() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminLoggedIn', 'true');
        showAdminDashboard();
    } else {
        alert('ユーザー名またはパスワードが正しくありません');
    }
}

// ログアウト
function logout() {
    sessionStorage.removeItem('adminLoggedIn');
    location.reload();
}

// 管理者ダッシュボードを表示
function showAdminDashboard() {
    if (sessionStorage.getItem('adminLoggedIn') !== 'true') {
        showAdminLogin();
        return;
    }
    
    document.getElementById('landing-page').classList.add('hidden');
    document.getElementById('diagnosis-form').classList.add('hidden');
    document.getElementById('diagnosis-result').classList.add('hidden');
    document.getElementById('admin-login').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    
    // 統計を更新
    updateStats();
    
    // テーブルを更新
    updateTable();
    
    window.scrollTo(0, 0);
}

// 統計を更新
function updateStats() {
    const total = allDiagnosisRecords.length;
    const quadrantA = allDiagnosisRecords.filter(r => r.result.quadrant.includes('A象限')).length;
    const quadrantB = allDiagnosisRecords.filter(r => r.result.quadrant.includes('B象限')).length;
    const quadrantC = allDiagnosisRecords.filter(r => r.result.quadrant.includes('C象限')).length;
    const quadrantD = allDiagnosisRecords.filter(r => r.result.quadrant.includes('D象限')).length;
    
    document.getElementById('total-diagnosis').textContent = total;
    document.getElementById('quadrant-a').textContent = quadrantA;
    document.getElementById('quadrant-b').textContent = quadrantB;
    document.getElementById('quadrant-c').textContent = quadrantC;
    document.getElementById('quadrant-d').textContent = quadrantD;
}

// テーブルを更新
function updateTable() {
    const tbody = document.getElementById('diagnosis-tbody');
    tbody.innerHTML = '';
    
    // 最新順にソート
    const sortedRecords = [...allDiagnosisRecords].reverse();
    
    sortedRecords.forEach((record, index) => {
        const tr = document.createElement('tr');
        const date = new Date(record.timestamp);
        
        tr.innerHTML = `
            <td>${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}</td>
            <td>${record.name || '-'}</td>
            <td>${record.company || '-'}</td>
            <td>${record.phone || '-'}</td>
            <td>${record.email || '-'}</td>
            <td>${record.result.quadrant}</td>
            <td><button class="btn-view" onclick="viewDetail(${allDiagnosisRecords.length - 1 - index})">詳細</button></td>
        `;
        tbody.appendChild(tr);
    });
}

// 詳細を表示
function viewDetail(index) {
    const record = allDiagnosisRecords[index];
    let detailText = `【診断詳細】\n\n`;
    detailText += `診断日時: ${new Date(record.timestamp).toLocaleString('ja-JP')}\n\n`;
    detailText += `お名前: ${record.name || '-'}\n`;
    detailText += `会社名: ${record.company || '-'}\n`;
    detailText += `電話番号: ${record.phone || '-'}\n`;
    detailText += `メール: ${record.email || '-'}\n\n`;
    detailText += `Q1: ${record.q1}\n`;
    detailText += `Q2: ${record.q2}\n`;
    detailText += `Q3: ${record.q3}\n`;
    detailText += `Q4: ${record.q4}\n`;
    detailText += `Q5: ${record.q5}\n`;
    detailText += `Q6: ${Array.isArray(record.q6) ? record.q6.join(', ') : record.q6}\n`;
    detailText += `Q7: ${record.q7}\n\n`;
    detailText += `診断結果: ${record.result.quadrant}\n`;
    detailText += `最適な選択肢: ${record.result.choice}\n`;
    
    alert(detailText);
}

// CSVエクスポート
function exportCSV() {
    if (allDiagnosisRecords.length === 0) {
        alert('エクスポートするデータがありません');
        return;
    }
    
    let csv = '診断日時,お名前,会社名,電話番号,メールアドレス,診断結果,後継者状況,引退時期,大事にしたいこと,最大の不安,相談相手,本音\n';
    
    allDiagnosisRecords.forEach(record => {
        const date = new Date(record.timestamp);
        const dateStr = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        csv += `"${dateStr}",`;
        csv += `"${record.name || '-'}",`;
        csv += `"${record.company || '-'}",`;
        csv += `"${record.phone || '-'}",`;
        csv += `"${record.email || '-'}",`;
        csv += `"${record.result.quadrant}",`;
        csv += `"${record.q2}",`;
        csv += `"${record.q3}",`;
        csv += `"${record.q4}",`;
        csv += `"${record.q5}",`;
        csv += `"${Array.isArray(record.q6) ? record.q6.join(', ') : record.q6}",`;
        csv += `"${record.q7.replace(/"/g, '""')}"\n`;
    });
    
    // ダウンロード
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const now = new Date();
    a.href = url;
    a.download = `診断データ_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
