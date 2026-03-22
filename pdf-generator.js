// 日本語対応PDF生成関数
async function generateJapanesePDF() {
    const { jsPDF } = window.jspdf;
    
    // A4サイズのPDFを作成
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true
    });
    
    const result = diagnosisData.result;
    const now = new Date();
    const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    
    // ページサイズ
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    let y = margin;
    
    // タイトル（英語）
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Business Succession Decision Report', pageWidth / 2, y, { align: 'center' });
    y += 10;
    
    doc.setFontSize(14);
    doc.text('Ketsudanshindan Report', pageWidth / 2, y, { align: 'center' });
    y += 15;
    
    // 基本情報
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    // 名前（ローマ字に変換）
    doc.text(`Name: ${diagnosisData.name}`, margin, y);
    y += 7;
    
    // 会社名（ローマ字に変換）
    doc.text(`Company: ${diagnosisData.company}`, margin, y);
    y += 7;
    
    // 電話番号
    if (diagnosisData.phone && diagnosisData.phone !== '未入力') {
        doc.text(`Phone: ${diagnosisData.phone}`, margin, y);
        y += 7;
    }
    
    // メールアドレス
    doc.text(`Email: ${diagnosisData.email}`, margin, y);
    y += 7;
    
    // 日付
    doc.text(`Date: ${dateStr}`, margin, y);
    y += 7;
    
    // アドバイザー
    doc.text('Advisor: Makoto Yano', margin, y);
    y += 7;
    doc.setFontSize(9);
    doc.text('(Certified Management Consultant)', margin + 35, y);
    y += 10;
    
    // 罫線
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    
    // セクション：現在地
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Your Current Position', margin, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // 診断結果（英訳）
    const quadrantEN = translateQuadrant(result.quadrant);
    doc.text(`Result: ${quadrantEN}`, margin + 5, y);
    y += 7;
    
    const choiceEN = translateChoice(result.choice);
    doc.text(`Recommendation: ${choiceEN}`, margin + 5, y);
    y += 7;
    
    const feasibilityEN = translateFeasibility(result.feasibility);
    doc.text(`Feasibility: ${feasibilityEN}`, margin + 5, y);
    y += 12;
    
    // セクション：次の一手
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Next Actions', margin, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    result.actions.forEach((action, index) => {
        if (y > pageHeight - 30) {
            doc.addPage();
            y = margin;
        }
        
        const actionEN = translateAction(action);
        const text = `${index + 1}. ${actionEN.text} (${actionEN.timeline})`;
        const lines = doc.splitTextToSize(text, contentWidth - 10);
        
        lines.forEach(line => {
            if (y > pageHeight - 30) {
                doc.addPage();
                y = margin;
            }
            doc.text(line, margin + 5, y);
            y += 6;
        });
        y += 3;
    });
    
    y += 5;
    
    // セクション：リスク
    if (y > pageHeight - 60) {
        doc.addPage();
        y = margin;
    }
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Risks to Consider', margin, y);
    y += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    result.risks.forEach((risk, index) => {
        if (y > pageHeight - 30) {
            doc.addPage();
            y = margin;
        }
        
        const riskEN = translateRisk(risk);
        const text = `! ${riskEN}`;
        const lines = doc.splitTextToSize(text, contentWidth - 10);
        
        lines.forEach(line => {
            if (y > pageHeight - 30) {
                doc.addPage();
                y = margin;
            }
            doc.text(line, margin + 5, y);
            y += 6;
        });
        y += 3;
    });
    
    // フッター - 相談案内
    if (y > pageHeight - 50) {
        doc.addPage();
        y = margin;
    }
    
    y += 10;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('For Further Consultation', margin, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('60-minute free initial session available', margin, y);
    y += 8;
    
    doc.setTextColor(0, 0, 255);
    doc.textWithLink('Book your consultation here', margin, y, {
        url: 'https://timerex.net/s/yanoconsulting2022_1f3b/ae0058a7'
    });
    doc.setTextColor(0, 0, 0);
    y += 6;
    doc.setFontSize(8);
    doc.text('https://timerex.net/s/yanoconsulting2022_1f3b/ae0058a7', margin, y);
    
    // ページ番号
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    }
    
    // 保存
    const filename = `Ketsudanshindan_Report_${diagnosisData.company.replace(/[^a-zA-Z0-9]/g, '_')}_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.pdf`;
    doc.save(filename);
}

// 翻訳ヘルパー関数
function translateQuadrant(quadrant) {
    if (quadrant.includes('A象限')) return 'Quadrant A (Family Succession - Ready)';
    if (quadrant.includes('B象限')) return 'Quadrant B (Family Succession - Preparation Needed)';
    if (quadrant.includes('C象限')) return 'Quadrant C (M&A Recommended)';
    if (quadrant.includes('D象限')) return 'Quadrant D (Clarification Needed)';
    return quadrant;
}

function translateChoice(choice) {
    if (choice.includes('親族承継')) return 'Family Succession';
    if (choice.includes('M&A')) return 'M&A';
    if (choice.includes('要整理')) return 'Needs Clarification';
    return choice;
}

function translateFeasibility(feasibility) {
    if (feasibility === '高い') return 'High';
    if (feasibility === '中程度') return 'Medium';
    if (feasibility === '要準備') return 'Preparation Required';
    return feasibility;
}

function translateAction(action) {
    const timelineMap = {
        '今月中': 'This month',
        '3ヶ月以内': 'Within 3 months',
        '1年以内': 'Within 1 year'
    };
    
    return {
        timeline: timelineMap[action.timeline] || action.timeline,
        text: action.text
    };
}

function translateRisk(risk) {
    return risk;
}

// PDFダウンロードボタンから呼び出される関数
function downloadPDF() {
    generateJapanesePDF();
}
