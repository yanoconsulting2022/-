     1	// Global variables
     2	let currentQuestion = 0;
     3	let diagnosisData = {};
     4	let allDiagnosisRecords = [];
     5	const ADMIN_USERNAME = 'yano';
     6	const ADMIN_PASSWORD = 'makoto2025';
     7	
     8	// Initialize
     9	document.addEventListener('DOMContentLoaded', function() {
    10	    loadDiagnosisRecords();
    11	    updateProgress();
    12	});
    13	
    14	// Show page
    15	function showPage(pageId) {
    16	    // Hide all pages
    17	    document.querySelectorAll('.page').forEach(page => {
    18	        page.classList.remove('active');
    19	        page.style.display = 'none';
    20	    });
    21	    
    22	    // Show selected page
    23	    const selectedPage = document.getElementById(pageId);
    24	    if (selectedPage) {
    25	        selectedPage.classList.add('active');
    26	        selectedPage.style.display = 'block';
    27	    }
    28	}
    29	
    30	// Start diagnosis
    31	function startDiagnosis() {
    32	    document.getElementById('landing-page').style.display = 'none';
    33	    document.getElementById('diagnosis-page').style.display = 'block';
    34	    currentQuestion = 0;
    35	    diagnosisData = {};
    36	    updateProgress();
    37	    showQuestion(0);
    38	}
    39	
    40	// Show question
    41	function showQuestion(questionNum) {
    42	    document.querySelectorAll('.question-card').forEach(card => {
    43	        card.classList.remove('active');
    44	    });
    45	    
    46	    const questionCard = document.querySelector(`[data-question="${questionNum}"]`);
    47	    if (questionCard) {
    48	        questionCard.classList.add('active');
    49	    }
    50	    
    51	    currentQuestion = questionNum;
    52	    updateProgress();
    53	}
    54	
    55	// Next question
    56	function nextQuestion(current) {
    57	    // Validate current question
    58	    if (!validateQuestion(current)) {
    59	        return;
    60	    }
    61	    
    62	    // Save answer
    63	    saveAnswer(current);
    64	    
    65	    // Show next question
    66	    const next = current + 1;
    67	    if (next <= 7) {
    68	        showQuestion(next);
    69	    }
    70	}
    71	
    72	// Previous question
    73	function prevQuestion(current) {
    74	    const prev = current - 1;
    75	    if (prev >= 0) {
    76	        showQuestion(prev);
    77	    }
    78	}
    79	
    80	// Update progress bar
    81	function updateProgress() {
    82	    const progress = (currentQuestion / 8) * 100;
    83	    document.getElementById('progress-fill').style.width = progress + '%';
    84	    document.getElementById('current-question').textContent = currentQuestion;
    85	}
    86	
    87	// Validate question
    88	function validateQuestion(questionNum) {
    89	    const questionCard = document.querySelector(`[data-question="${questionNum}"]`);
    90	    
    91	    if (questionNum === 0) {
    92	        // Basic information validation
    93	        const name = questionCard.querySelector('input[name="name"]');
    94	        const company = questionCard.querySelector('input[name="company"]');
    95	        const phone = questionCard.querySelector('input[name="phone"]');
    96	        const email = questionCard.querySelector('input[name="email"]');
    97	        
    98	        if (!name.value.trim()) {
    99	            alert('Please enter your name');
   100	            return false;
   101	        }
   102	        if (!company.value.trim()) {
   103	            alert('Please enter your company name');
   104	            return false;
   105	        }
   106	        if (!phone.value.trim()) {
   107	            alert('Please enter your phone number');
   108	            return false;
   109	        }
   110	        if (!email.value.trim()) {
   111	            alert('Please enter your email address');
   112	            return false;
   113	        }
   114	        // Simple email validation
   115	        if (!email.value.includes('@')) {
   116	            alert('Please enter a valid email address');
   117	            return false;
   118	        }
   119	        return true;
   120	    } else if (questionNum === 6) {
   121	        // Checkbox - at least one must be checked
   122	        const checkboxes = questionCard.querySelectorAll('input[type="checkbox"]');
   123	        const hasChecked = Array.from(checkboxes).some(cb => cb.checked);
   124	        if (!hasChecked) {
   125	            alert('Please select at least one option');
   126	        }
   127	        return hasChecked;
   128	    } else if (questionNum === 7) {
   129	        // Text area
   130	        const textarea = questionCard.querySelector('textarea');
   131	        const hasValue = textarea && textarea.value.trim() !== '';
   132	        if (!hasValue) {
   133	            alert('Please share your honest thoughts');
   134	        }
   135	        return hasValue;
   136	    } else {
   137	        // Radio button
   138	        const selected = questionCard.querySelector('input:checked');
   139	        if (!selected) {
   140	            alert('Please select one option');
   141	        }
   142	        return selected !== null;
   143	    }
   144	}
   145	
   146	// Save answer
   147	function saveAnswer(questionNum) {
   148	    const questionCard = document.querySelector(`[data-question="${questionNum}"]`);
   149	    
   150	    if (questionNum === 0) {
   151	        // Basic information
   152	        diagnosisData.name = questionCard.querySelector('input[name="name"]').value;
   153	        diagnosisData.company = questionCard.querySelector('input[name="company"]').value;
   154	        diagnosisData.phone = questionCard.querySelector('input[name="phone"]').value;
   155	        diagnosisData.email = questionCard.querySelector('input[name="email"]').value;
   156	    } else if (questionNum === 6) {
   157	        // Checkbox (multiple selection)
   158	        const checkboxes = questionCard.querySelectorAll('input[name="q6"]:checked');
   159	        diagnosisData[`q${questionNum}`] = Array.from(checkboxes).map(cb => cb.value);
   160	    } else if (questionNum === 7) {
   161	        // Text area
   162	        diagnosisData[`q${questionNum}`] = questionCard.querySelector('textarea').value;
   163	    } else {
   164	        // Radio button
   165	        const selected = questionCard.querySelector('input:checked');
   166	        diagnosisData[`q${questionNum}`] = selected ? selected.value : '';
   167	    }
   168	}
   169	
   170	// Submit diagnosis
   171	function submitDiagnosis() {
   172	    if (!validateQuestion(7)) {
   173	        return;
   174	    }
   175	    
   176	    saveAnswer(7);
   177	    
   178	    // Calculate diagnosis result
   179	    const result = calculateDiagnosis();
   180	    diagnosisData.result = result;
   181	    diagnosisData.timestamp = Date.now();
   182	    
   183	    // Save to local storage
   184	    allDiagnosisRecords.push(diagnosisData);
   185	    saveDiagnosisRecords();
   186	    
   187	    // Display results
   188	    displayResults(result);
   189	}
   190	
   191	// Calculate diagnosis
   192	function calculateDiagnosis() {
   193	    // Successor readiness (based on Q2)
   194	    let successorReadiness = 0;
   195	    if (diagnosisData.q2 === 'Son/Daughter (willing to succeed)') {
   196	        successorReadiness = 2;
   197	    } else if (diagnosisData.q2 === 'Son/Daughter (unknown willingness)' || 
   198	               diagnosisData.q2 === 'Internal candidate') {
   199	        successorReadiness = 1;
   200	    } else {
   201	        successorReadiness = 0;
   202	    }
   203	    
   204	    // Passion/commitment strength (based on Q4)
   205	    let passionStrength = 0;
   206	    if (diagnosisData.q4 === 'Passing on my vision and values' || 
   207	        diagnosisData.q4 === 'Continuing contribution to the community') {
   208	        passionStrength = 2;
   209	    } else if (diagnosisData.q4 === 'Protecting employee jobs') {
   210	        passionStrength = 1;
   211	    } else {
   212	        passionStrength = 0;
   213	    }
   214	    
   215	    // Determine quadrant
   216	    let quadrant = '';
   217	    let recommendation = '';
   218	    let feasibility = '';
   219	    let actions = [];
   220	    let risks = [];
   221	    
   222	    if (successorReadiness >= 1 && passionStrength >= 1) {
   223	        // Quadrant A: Family succession (Ready)
   224	        quadrant = 'Quadrant A: Family Succession (Ready)';
   225	        recommendation = 'Family Succession';
   226	        feasibility = 'High';
   227	        actions = [
   228	            { time: 'This month', action: 'Company valuation' },
   229	            { time: 'Within 3 months', action: 'Monthly dialogue with successor' },
   230	            { time: 'Within 1 year', action: 'Design timing for employee announcement' }
   231	        ];
   232	        risks = [
   233	            'Tax planning not in place',
   234	            'Successor\'s true intentions unclarified'
   235	        ];
   236	    } else if (successorReadiness === 0 && passionStrength >= 1) {
   237	        // Quadrant B: Family succession (Needs preparation)
   238	        quadrant = 'Quadrant B: Family Succession (Needs Preparation)';
   239	        recommendation = 'Family Succession (with preparation)';
   240	        feasibility = 'Medium (Preparation needed)';
   241	        actions = [
   242	            { time: 'This month', action: 'Confirm successor\'s true feelings (Credo Card Diagnosis)' },
   243	            { time: 'Within 3 months', action: 'Develop 3-year training plan' },
   244	            { time: 'Within 1 year', action: 'Consider alternative plan (M&A) in parallel' }
   245	        ];
   246	        risks = [
   247	            'Successor development takes time',
   248	            'Successor may change their mind midway'
   249	        ];
   250	    } else if (successorReadiness === 0 && passionStrength === 0) {
   251	        // Quadrant C: M&A (Weak passion)
   252	        quadrant = 'Quadrant C: M&A (Weak Vision)';
   253	        recommendation = 'M&A';
   254	        feasibility = 'High';
   255	        actions = [
   256	            { time: 'This month', action: 'Simplified company valuation' },
   257	            { time: 'Within 3 months', action: 'List 3 buyer candidates' },
   258	            { time: 'Within 1 year', action: 'Prioritize sale conditions' }
   259	        ];
   260	        risks = [
   261	            'Company value may be lower than expected',
   262	            'Good buyer may not be found'
   263	        ];
   264	    } else {
   265	        // Quadrant D: Uncertain (Needs clarification)
   266	        quadrant = 'Quadrant D: Uncertain (Needs Clarification)';
   267	        recommendation = 'First organize vision and numbers';
   268	        feasibility = 'Requires clarification';
   269	        actions = [
   270	            { time: 'This month', action: 'Vision organization session' },
   271	            { time: 'Within 3 months', action: 'Simplified financial diagnosis' },
   272	            { time: 'Within 1 year', action: 'Create comparison table of 3 options (Family/M&A/Closure)' }
   273	        ];
   274	        risks = [
   275	            'Delaying decision leads to business decline',
   276	            'Losing timing for M&A or succession'
   277	        ];
   278	    }
   279	    
   280	    return {
   281	        quadrant,
   282	        recommendation,
   283	        feasibility,
   284	        actions,
   285	        risks,
   286	        successorReadiness,
   287	        passionStrength
   288	    };
   289	}
   290	
   291	// Display results
   292	function displayResults(result) {
   293	    document.getElementById('diagnosis-page').style.display = 'none';
   294	    document.getElementById('result-page').style.display = 'block';
   295	    
   296	    // Display quadrant result
   297	    document.getElementById('result-quadrant').textContent = result.quadrant;
   298	    document.getElementById('result-option').textContent = result.recommendation;
   299	    document.getElementById('result-feasibility').textContent = result.feasibility;
   300	    
   301	    // Position marker on matrix
   302	    const marker = document.getElementById('matrix-marker');
   303	    const xPos = (result.successorReadiness / 2) * 100;
   304	    const yPos = 100 - (result.passionStrength / 2) * 100;
   305	    marker.style.left = xPos + '%';
   306	    marker.style.top = yPos + '%';
   307	    
   308	    // Highlight quadrant
   309	    document.querySelectorAll('.matrix-quadrant').forEach(q => {
   310	        q.classList.remove('active');
   311	    });
   312	    if (result.quadrant.includes('A')) {
   313	        document.querySelector('[data-quadrant="A"]').classList.add('active');
   314	    } else if (result.quadrant.includes('B')) {
   315	        document.querySelector('[data-quadrant="B"]').classList.add('active');
   316	    } else if (result.quadrant.includes('C')) {
   317	        document.querySelector('[data-quadrant="C"]').classList.add('active');
   318	    } else if (result.quadrant.includes('D')) {
   319	        document.querySelector('[data-quadrant="D"]').classList.add('active');
   320	    }
   321	    
   322	    // Display action items
   323	    const actionList = document.getElementById('action-list');
   324	    actionList.innerHTML = '';
   325	    result.actions.forEach(action => {
   326	        const actionItem = document.createElement('div');
   327	        actionItem.className = 'action-item';
   328	        actionItem.innerHTML = `
   329	            <span class="action-time">${action.time}</span>
   330	            <span class="action-text">${action.action}</span>
   331	        `;
   332	        actionList.appendChild(actionItem);
   333	    });
   334	    
   335	    // Display risks
   336	    const riskList = document.getElementById('risk-list');
   337	    riskList.innerHTML = '';
   338	    result.risks.forEach(risk => {
   339	        const riskItem = document.createElement('div');
   340	        riskItem.className = 'risk-item';
   341	        riskItem.innerHTML = `⚠️ ${risk}`;
   342	        riskList.appendChild(riskItem);
   343	    });
   344	}
   345	
   346	// Download report
   347	function downloadReport() {
   348	    const result = diagnosisData.result;
   349	    const now = new Date();
   350	    
   351	    let report = `
   352	━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   353	Decision Diagnosis Report
   354	━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   355	
   356	【Name】${diagnosisData.name}
   357	【Company】${diagnosisData.company}
   358	【Diagnosis Date】${now.getFullYear()}/${now.getMonth() + 1}/${now.getDate()}
   359	【Diagnostician】Business Succession & M&A Decision Partner Makoto Yano
   360	
   361	━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   362	Your Current Position
   363	━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   364	
   365	■ Diagnosis Result: ${result.quadrant}
   366	■ Best Option: ${result.recommendation}
   367	■ Feasibility: ${result.feasibility}
   368	
   369	━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   370	Next Steps (What you can do now)
   371	━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   372	`;
   373	    
   374	    result.actions.forEach((action, index) => {
   375	        report += `\n${index + 1}. ${action.action} (${action.time})`;
   376	    });
   377	    
   378	    report += `\n
   379	━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   380	Risks to Watch Out For
   381	━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   382	`;
   383	    
   384	    result.risks.forEach((risk, index) => {
   385	        report += `\n⚠️ ${risk}`;
   386	    });
   387	    
   388	    report += `\n
   389	━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   390	For Those Who Want to Dive Deeper
   391	━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   392	
   393	In a 60-minute individual consultation (free for first session),
   394	we'll organize your vision and numbers into a "winning shape".
   395	
   396	If interested, please apply below.
   397	https://timerex.net/s/yanoconsulting2022_1f3b/ae0058a7
   398	
   399	━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   400	`;
   401	    
   402	    // Download as text file
   403	    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
   404	    const url = URL.createObjectURL(blob);
   405	    const a = document.createElement('a');
   406	    a.href = url;
   407	    a.download = `Decision_Diagnosis_Report_${diagnosisData.company}_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.txt`;
   408	    a.click();
   409	    URL.revokeObjectURL(url);
   410	}
   411	
   412	// Restart diagnosis
   413	function restartDiagnosis() {
   414	    document.getElementById('result-page').style.display = 'none';
   415	    document.getElementById('landing-page').style.display = 'block';
   416	    currentQuestion = 0;
   417	    diagnosisData = {};
   418	    
   419	    // Reset form
   420	    document.getElementById('diagnostic-form').reset();
   421	    document.querySelectorAll('.question-card').forEach(card => {
   422	        card.classList.remove('active');
   423	    });
   424	}
   425	
   426	// Load diagnosis records
   427	function loadDiagnosisRecords() {
   428	    const stored = localStorage.getItem('diagnosisRecords_en');
   429	    if (stored) {
   430	        try {
   431	            allDiagnosisRecords = JSON.parse(stored);
   432	        } catch (e) {
   433	            allDiagnosisRecords = [];
   434	        }
   435	    }
   436	}
   437	
   438	// Save diagnosis records
   439	function saveDiagnosisRecords() {
   440	    localStorage.setItem('diagnosisRecords_en', JSON.stringify(allDiagnosisRecords));
   441	}
   442	
   443	// Admin login
   444	function login() {
   445	    const username = document.getElementById('admin-username').value;
   446	    const password = document.getElementById('admin-password').value;
   447	    
   448	    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
   449	        showPage('admin-dashboard');
   450	        updateStats();
   451	        updateDataTable();
   452	    } else {
   453	        alert('Invalid username or password');
   454	    }
   455	}
   456	
   457	// Logout
   458	function logout() {
   459	    showPage('landing-page');
   460	}
   461	
   462	// Update statistics
   463	function updateStats() {
   464	    document.getElementById('total-diagnoses').textContent = allDiagnosisRecords.length;
   465	    
   466	    const quadrantCounts = {
   467	        A: 0,
   468	        B: 0,
   469	        C: 0,
   470	        D: 0
   471	    };
   472	    
   473	    allDiagnosisRecords.forEach(record => {
   474	        if (record.result && record.result.quadrant) {
   475	            if (record.result.quadrant.includes('A')) quadrantCounts.A++;
   476	            else if (record.result.quadrant.includes('B')) quadrantCounts.B++;
   477	            else if (record.result.quadrant.includes('C')) quadrantCounts.C++;
   478	            else if (record.result.quadrant.includes('D')) quadrantCounts.D++;
   479	        }
   480	    });
   481	    
   482	    document.getElementById('quadrant-a-count').textContent = quadrantCounts.A;
   483	    document.getElementById('quadrant-b-count').textContent = quadrantCounts.B;
   484	    document.getElementById('quadrant-c-count').textContent = quadrantCounts.C;
   485	    document.getElementById('quadrant-d-count').textContent = quadrantCounts.D;
   486	}
   487	
   488	// Update data table
   489	function updateDataTable() {
   490	    const tbody = document.getElementById('data-table-body');
   491	    tbody.innerHTML = '';
   492	    
   493	    // Display in reverse order (newest first)
   494	    allDiagnosisRecords.slice().reverse().forEach((record, index) => {
   495	        const tr = document.createElement('tr');
   496	        const date = new Date(record.timestamp);
   497	        
   498	        tr.innerHTML = `
   499	            <td>${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}</td>
   500	            <td>${record.name || '-'}</td>
   501	            <td>${record.company || '-'}</td>
   502	            <td>${record.phone || '-'}</td>
   503	            <td>${record.email || '-'}</td>
   504	            <td>${record.result.quadrant}</td>
   505	            <td><button class="btn-view" onclick="viewDetail(${allDiagnosisRecords.length - 1 - index})">Details</button></td>
   506	        `;
   507	        tbody.appendChild(tr);
   508	    });
   509	}
   510	
   511	// View detail
   512	function viewDetail(index) {
   513	    const record = allDiagnosisRecords[index];
   514	    let detailText = `【Diagnosis Details】\n\n`;
   515	    detailText += `Date/Time: ${new Date(record.timestamp).toLocaleString('en-US')}\n\n`;
   516	    detailText += `Name: ${record.name || '-'}\n`;
   517	    detailText += `Company: ${record.company || '-'}\n`;
   518	    detailText += `Phone: ${record.phone || '-'}\n`;
   519	    detailText += `Email: ${record.email || '-'}\n\n`;
   520	    detailText += `Q1: ${record.q1}\n`;
   521	    detailText += `Q2: ${record.q2}\n`;
   522	    detailText += `Q3: ${record.q3}\n`;
   523	    detailText += `Q4: ${record.q4}\n`;
   524	    detailText += `Q5: ${record.q5}\n`;
   525	    detailText += `Q6: ${Array.isArray(record.q6) ? record.q6.join(', ') : record.q6}\n`;
   526	    detailText += `Q7: ${record.q7}\n\n`;
   527	    detailText += `Result: ${record.result.quadrant}\n`;
   528	    detailText += `Recommendation: ${record.result.recommendation}\n`;
   529	    detailText += `Feasibility: ${record.result.feasibility}`;
   530	    
   531	    alert(detailText);
   532	}
   533	
   534	// Export CSV
   535	function exportCSV() {
   536	    if (allDiagnosisRecords.length === 0) {
   537	        alert('No data to export');
   538	        return;
   539	    }
   540	    
   541	    let csv = 'Date/Time,Name,Company,Phone,Email,Result,Successor Status,Retirement Timeline,Most Important,Biggest Concern,Consulted,True Feelings\n';
   542	    
   543	    allDiagnosisRecords.forEach(record => {
   544	        const date = new Date(record.timestamp);
   545	        const dateStr = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
   546	        
   547	        csv += `"${dateStr}",`;
   548	        csv += `"${record.name || '-'}",`;
   549	        csv += `"${record.company || '-'}",`;
   550	        csv += `"${record.phone || '-'}",`;
   551	        csv += `"${record.email || '-'}",`;
   552	        csv += `"${record.result.quadrant}",`;
   553	        csv += `"${record.q2}",`;
   554	        csv += `"${record.q3}",`;
   555	        csv += `"${record.q4}",`;
   556	        csv += `"${record.q5}",`;
   557	        csv += `"${Array.isArray(record.q6) ? record.q6.join('; ') : record.q6}",`;
   558	        csv += `"${record.q7.replace(/"/g, '""')}"\n`;
   559	    });
   560	    
   561	    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
   562	    const url = URL.createObjectURL(blob);
   563	    const a = document.createElement('a');
   564	    a.href = url;
   565	    const now = new Date();
   566	    a.download = `Diagnosis_Data_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}.csv`;
   567	    a.click();
   568	    URL.revokeObjectURL(url);
   569	}
   570	
