import assert from 'node:assert';

const API_BASE = 'https://reizeval-api.onrender.com';

async function runLiveVerification() {
  console.log(`\n======================================================================`);
  console.log(`  REIZEVAL Live Cloud Integration Verification (Render.com)`);
  console.log(`  Target: ${API_BASE}`);
  console.log(`======================================================================\n`);

  // 1. Health check
  console.log(`[Test 1] Testing GET ${API_BASE}/health ...`);
  const healthRes = await fetch(`${API_BASE}/health`);
  assert.strictEqual(healthRes.status, 200, `Health check failed with status ${healthRes.status}`);
  const healthData = await healthRes.json();
  console.log(`  ✓ Health Status: ${healthData.status}`);
  console.log(`  ✓ Active Users: ${healthData.activeUsers}`);
  console.log(`  ✓ Active Projects: ${healthData.activeProjects}`);
  console.log(`  ✓ Message: "${healthData.message}"`);
  assert.strictEqual(healthData.status, 'healthy');

  // 2. CTO Login
  console.log(`\n[Test 2] Testing CTO Login (Gökçenur Öztürk) ...`);
  const ctoLoginRes = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gokcenurozturk@reizeval@gmail.com', password: 'ReizCTO2026!Global' })
  });
  assert.strictEqual(ctoLoginRes.status, 200);
  const ctoData = await ctoLoginRes.json();
  console.log(`  ✓ CTO Authenticated: ${ctoData.user.fullName} (${ctoData.user.role}) - Token: ${ctoData.accessToken.slice(0, 16)}...`);
  assert.strictEqual(ctoData.user.role, 'GLOBAL_CTO');

  // 3. Jury Login (Gaspare LoDuca - USA)
  console.log(`\n[Test 3] Testing Jury Login (Gaspare LoDuca - USA) ...`);
  const juryLoginRes = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'gaspare.loduca@reizeval', password: '8jsbrofAZEZZBPDwML$5' })
  });
  assert.strictEqual(juryLoginRes.status, 200);
  const juryData = await juryLoginRes.json();
  console.log(`  ✓ Jury Authenticated: ${juryData.user.fullName} (${juryData.user.role}) - Location: ${juryData.user.country || 'USA'}`);
  assert.strictEqual(juryData.user.role, 'TECHNICAL_JURY');

  // 4. Developer Login (Mustafa Çoban - Founder / CEO)
  console.log(`\n[Test 4] Testing Developer Login (Mustafa Çoban) ...`);
  const devLoginRes = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'mustafa.coban@reizeval', password: 'ffYzp_fx6qYZy5VvnUTa2F' })
  });
  assert.strictEqual(devLoginRes.status, 200);
  const devData = await devLoginRes.json();
  console.log(`  ✓ Developer Authenticated: ${devData.user.fullName} (${devData.user.title})`);
  assert.strictEqual(devData.user.role, 'DEVELOPER');

  // 5. Fetch Projects List
  console.log(`\n[Test 5] Testing GET /api/v1/projects ...`);
  const projectsRes = await fetch(`${API_BASE}/api/v1/projects`);
  assert.strictEqual(projectsRes.status, 200);
  const projectsJson = await projectsRes.json();
  const projects = projectsJson.data;
  console.log(`  ✓ Retrieved ${projects.length} Projects from Cloud:`);
  for (const p of projects) {
    console.log(`    - [${p.id}] "${p.title}" by ${p.ownerName} (${p.status}, ${p.archives?.length || 0} archives)`);
  }
  assert.strictEqual(projects.length >= 3, true);

  // Target project for tests
  const targetProject = projects[0];

  // 6. Messaging / Project Chat
  console.log(`\n[Test 6] Testing POST /api/v1/projects/${targetProject.id}/messages (Jury to CTO Communication) ...`);
  const msgRes = await fetch(`${API_BASE}/api/v1/projects/${targetProject.id}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      senderId: juryData.user.id,
      senderName: juryData.user.fullName,
      senderRole: juryData.user.role,
      content: 'Canlı bulut ortamından test mesajı: Jüri değerlendirmesi tamamlanmak üzere.'
    })
  });
  assert.strictEqual(msgRes.status, 200);
  const msgData = await msgRes.json();
  console.log(`  ✓ Message saved on Cloud: [ID: ${msgData.message.id}] "${msgData.message.content}"`);

  // 7. Verify Message Retrieval
  console.log(`\n[Test 7] Testing GET /api/v1/projects/${targetProject.id}/messages ...`);
  const getMsgsRes = await fetch(`${API_BASE}/api/v1/projects/${targetProject.id}/messages`);
  assert.strictEqual(getMsgsRes.status, 200);
  const msgsJson = await getMsgsRes.json();
  console.log(`  ✓ Project Message Count: ${msgsJson.data.length}`);
  assert.strictEqual(msgsJson.data.some(m => m.id === msgData.message.id), true);

  // 8. RBAC Anti-Tamper Test: Developer attempting to score
  console.log(`\n[Test 8] Testing RBAC Security Lockout: Developer/CEO attempting to score project ...`);
  const illegalEvalRes = await fetch(`${API_BASE}/api/v1/projects/${targetProject.id}/evaluations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      juryId: devData.user.id,
      juryName: devData.user.fullName,
      juryRole: devData.user.role,
      codeQualityScore: 30
    })
  });
  console.log(`  ✓ Security Response Status: HTTP ${illegalEvalRes.status}`);
  assert.strictEqual(illegalEvalRes.status, 403);
  const errJson = await illegalEvalRes.json();
  console.log(`  ✓ Block Reason: "${errJson.error}"`);

  // 9. Valid Technical Jury Evaluation
  console.log(`\n[Test 9] Testing Valid Technical Jury Scoring from USA (Gaspare LoDuca) ...`);
  const legalEvalRes = await fetch(`${API_BASE}/api/v1/projects/${targetProject.id}/evaluations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      juryId: juryData.user.id,
      juryName: juryData.user.fullName,
      juryRole: 'TECHNICAL_JURY',
      codeQualityScore: 29,
      securityScore: 20,
      performanceScore: 19,
      functionalityScore: 20,
      documentationScore: 10,
      technicalReport: 'Mimari ve güvenlik standartları en üst düzeyde (98/100). Onaya sunuldu.'
    })
  });
  assert.strictEqual(legalEvalRes.status, 200);
  const evalJson = await legalEvalRes.json();
  console.log(`  ✓ Evaluation Stored: ID: ${evalJson.evaluation.id}, Score: ${evalJson.evaluation.totalScore}/100`);
  assert.strictEqual(evalJson.evaluation.totalScore, 98);

  // 10. CTO Approval & Certificate Generation
  console.log(`\n[Test 10] Testing Global CTO Approval & Offline Crypto Certificate Issuance ...`);
  const ctoApproveRes = await fetch(`${API_BASE}/api/v1/projects/${targetProject.id}/cto-approve/${evalJson.evaluation.id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  assert.strictEqual(ctoApproveRes.status, 200);
  const ctoApproveJson = await ctoApproveRes.json();
  console.log(`  ✓ Certificate Issued: ${ctoApproveJson.certificate.certificateNumber}`);
  console.log(`  ✓ Certificate Type: ${ctoApproveJson.certificate.titleTr} (${ctoApproveJson.certificate.type})`);
  console.log(`  ✓ Recipient: ${ctoApproveJson.certificate.recipientName}`);
  console.log(`  ✓ Crypto Signature: ${ctoApproveJson.certificate.cryptoSignature.slice(0, 24)}...`);
  assert.strictEqual(ctoApproveJson.certificate.certificateNumber.startsWith('RZV-2026-'), true);

  // 11. Desktop Version Manifest
  console.log(`\n[Test 11] Testing GET /api/v1/desktop/version ...`);
  const versionRes = await fetch(`${API_BASE}/api/v1/desktop/version`);
  assert.strictEqual(versionRes.status, 200);
  const versionJson = await versionRes.json();
  console.log(`  ✓ Version: ${versionJson.currentVersion} (Engine: ${versionJson.engine})`);

  console.log(`\n======================================================================`);
  console.log(`  ALL 11 LIVE CLOUD TESTS PASSED! 🟢`);
  console.log(`  Render.com API is 100% OPERATIONAL, SECURE, AND SYNCHRONIZED.`);
  console.log(`======================================================================\n`);
}

runLiveVerification().catch(err => {
  console.error(`❌ Live Verification FAILED:`, err);
  process.exit(1);
});
