/* AI Assistant Chat Console Script */

let currentConversationId = null;

async function renderAssistantPage() {
    const container = document.getElementById('page-content');
    container.innerHTML = `
        <div class="page-header">
            <div class="page-header-title">
                <h1>UdyamSetu AI Industrial Assistant</h1>
                <p>AI-powered statutory clearance, compliance risk assessment & subsidy recommendation engine.</p>
            </div>
            <div style="display:flex; gap:0.75rem; align-items:center;">
                <span class="badge badge-verified" style="font-size:0.75rem; padding:0.4rem 0.75rem; display:flex; align-items:center; gap:0.4rem;">
                    <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#059669;"></span>
                    <span id="ai-model-badge">AI Neural Model: Online</span>
                </span>
                <button onclick="startNewChatSession()" class="btn btn-secondary btn-sm">💬 New Chat</button>
            </div>
        </div>

        <div style="display:grid; grid-template-columns:280px 1fr; gap:1.5rem; height:72vh;">
            <!-- History Sidebar -->
            <div class="card" style="padding:1rem; display:flex; flex-direction:column;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
                    <h4 style="margin:0; font-size:0.95rem;">Chat History</h4>
                    <span style="font-size:0.75rem; color:var(--slate-muted);">Session Logs</span>
                </div>
                <div id="ai-conv-list" style="flex:1; overflow-y:auto;">Loading history...</div>
            </div>

            <!-- Main Chat Console -->
            <div class="card" style="padding:1.25rem; display:flex; flex-direction:column;">
                <!-- Suggested Quick Prompts -->
                <div style="display:flex; gap:0.5rem; overflow-x:auto; padding-bottom:0.75rem; margin-bottom:0.75rem; border-bottom:1px solid var(--border-color);">
                    <button onclick="sendQuickPrompt('What approvals are required for my manufacturing plant?')" class="btn btn-secondary btn-sm">
                        🏭 Required Clearances?
                    </button>
                    <button onclick="sendQuickPrompt('What is my compliance risk score and overdue filings?')" class="btn btn-secondary btn-sm">
                        ⚠️ Compliance Penalties?
                    </button>
                    <button onclick="sendQuickPrompt('Which government capital investment subsidies am I eligible for?')" class="btn btn-secondary btn-sm">
                        💰 Capital Subsidies?
                    </button>
                    <button onclick="sendQuickPrompt('What is the status of my active applications?')" class="btn btn-secondary btn-sm">
                        📋 Track Applications?
                    </button>
                </div>

                <!-- Messages Window -->
                <div id="ai-messages-box" style="flex:1; overflow-y:auto; padding:1.25rem; background:var(--bg-light); border-radius:var(--radius-sm); margin-bottom:1rem; display:flex; flex-direction:column; gap:1rem;">
                    <div style="background:#ffffff; border:1px solid var(--border-color); padding:1.25rem; border-radius:var(--radius-md); max-width:90%; box-shadow:var(--shadow-sm);">
                        <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
                            <span style="font-size:1.25rem;">🤖</span>
                            <strong style="color:var(--gov-blue);">UdyamSetu AI Assistant</strong>
                            <span class="badge badge-submitted" style="font-size:0.65rem; margin-left:auto;">Regulatory Intelligence</span>
                        </div>
                        <div style="font-size:0.9rem; color:var(--slate-body); line-height:1.6;">
                            Hello! I am your AI Compliance, Approvals & Government Support Assistant. I am connected directly to your enterprise profile, regulatory clearance rules, and live application tracking.
                            <br><br>
                            <em>Ask me about mandatory licenses, upcoming compliance deadlines, capital investment subsidies, or technical document requirements.</em>
                        </div>
                    </div>
                </div>

                <!-- Input Box -->
                <form id="ai-chat-form" style="display:flex; gap:0.75rem;">
                    <input type="text" id="ai-chat-input" class="form-control" placeholder="Ask UdyamSetu AI a regulatory or subsidy question..." style="padding:0.75rem 1rem; border-radius:8px;" required>
                    <button type="submit" id="btn-send-ai" class="btn btn-primary" style="padding:0.75rem 1.5rem; display:flex; align-items:center; gap:0.5rem;">
                        <span>Send</span>
                        <span>🚀</span>
                    </button>
                </form>
            </div>
        </div>
    `;

    document.getElementById('ai-chat-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const input = document.getElementById('ai-chat-input');
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        await handleSendMessage(text);
    });

    await loadAIConversationsList();
}

async function loadAIConversationsList() {
    const box = document.getElementById('ai-conv-list');
    try {
        const res = await API.getAIConversations();
        if (res.success) {
            const convs = res.data;
            if (convs.length === 0) {
                box.innerHTML = `<p style="font-size:0.8rem; color:var(--slate-muted); text-align:center; padding:1rem 0;">No chat history.</p>`;
                return;
            }

            box.innerHTML = convs.map(c => `
                <div onclick="loadConversationSession('${c.id}')" style="padding:0.65rem 0.75rem; border-radius:6px; border:1px solid ${c.id === currentConversationId ? 'var(--gov-blue)' : 'var(--border-color)'}; margin-bottom:0.5rem; cursor:pointer; font-size:0.85rem; background:${c.id === currentConversationId ? '#EFF6FF' : '#ffffff'}; transition:all 0.2s;">
                    <strong style="color:var(--primary-navy); display:block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${Utils.escapeHTML(c.title || 'Chat')}</strong>
                    <div style="font-size:0.7rem; color:var(--slate-muted); margin-top:0.25rem;">${Utils.formatDate(c.created_at)}</div>
                </div>
            `).join('');
        }
    } catch (err) {
        box.innerHTML = `<p style="color:var(--danger-red); font-size:0.8rem;">History unavailable.</p>`;
    }
}

async function loadConversationSession(convId) {
    currentConversationId = convId;
    await loadAIConversationsList();
    const msgBox = document.getElementById('ai-messages-box');
    msgBox.innerHTML = '<p style="color:var(--slate-muted); text-align:center; padding:2rem;">Loading message history...</p>';

    try {
        const res = await API.getAIConversationById(convId);
        if (res.success) {
            const msgs = res.data.messages;
            msgBox.innerHTML = msgs.map(m => `
                <div style="background:${m.sender === 'user' ? '#EFF6FF' : '#ffffff'}; border:1px solid ${m.sender === 'user' ? '#BFDBFE' : 'var(--border-color)'}; padding:1.25rem; border-radius:var(--radius-md); max-width:90%; align-self:${m.sender === 'user' ? 'flex-end' : 'flex-start'}; box-shadow:var(--shadow-sm);">
                    <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
                        <span style="font-size:1.1rem;">${m.sender === 'user' ? '👤' : '🤖'}</span>
                        <strong style="color:${m.sender === 'user' ? 'var(--primary-navy)' : 'var(--gov-blue)'};">${m.sender === 'user' ? 'You' : 'UdyamSetu AI Assistant'}</strong>
                    </div>
                    <div style="font-size:0.9rem; color:var(--slate-body); line-height:1.6; white-space:pre-line;">${formatAIMarkdown(m.message)}</div>
                </div>
            `).join('');
            msgBox.scrollTop = msgBox.scrollHeight;
        }
    } catch (err) {
        Toast.error(err.message);
    }
}

async function handleSendMessage(questionText) {
    const msgBox = document.getElementById('ai-messages-box');
    const sendBtn = document.getElementById('btn-send-ai');

    // Append User Message
    const userDiv = document.createElement('div');
    userDiv.style.cssText = 'background:#EFF6FF; border:1px solid #BFDBFE; padding:1.25rem; border-radius:var(--radius-md); max-width:90%; align-self:flex-end; box-shadow:var(--shadow-sm);';
    userDiv.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
            <span>👤</span>
            <strong style="color:var(--primary-navy);">You</strong>
        </div>
        <p style="margin:0; font-size:0.9rem; color:var(--slate-dark);">${Utils.escapeHTML(questionText)}</p>
    `;
    msgBox.appendChild(userDiv);

    // Append Loading Assistant Message
    const loadingDiv = document.createElement('div');
    loadingDiv.style.cssText = 'background:#ffffff; border:1px solid var(--border-color); padding:1.25rem; border-radius:var(--radius-md); max-width:90%; align-self:flex-start; box-shadow:var(--shadow-sm);';
    loadingDiv.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
            <span>🤖</span>
            <strong style="color:var(--gov-blue);">UdyamSetu AI Assistant</strong>
        </div>
        <div style="display:flex; align-items:center; gap:0.5rem; color:var(--slate-muted); font-size:0.9rem;">
            <div style="display:inline-block; width:12px; height:12px; border:2px solid var(--gov-blue); border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite;"></div>
            <span>Analyzing enterprise context and regulatory statutes...</span>
        </div>
    `;
    msgBox.appendChild(loadingDiv);
    msgBox.scrollTop = msgBox.scrollHeight;

    try {
        if (sendBtn) sendBtn.disabled = true;

        const res = await API.sendAIMessage({
            question: questionText,
            conversation_id: currentConversationId
        });

        if (res.success) {
            currentConversationId = res.data.conversation_id;
            const ans = res.data;

            const recsHtml = (ans.recommendedActions || []).map(a => `
                <li style="margin-bottom:0.35rem; display:flex; align-items:flex-start; gap:0.4rem;">
                    <span style="color:var(--gov-blue);">👉</span>
                    <span>${Utils.escapeHTML(a)}</span>
                </li>
            `).join('');

            const sourcesHtml = (ans.sources || []).join(' • ');

            // Update model badge
            const badgeEl = document.getElementById('ai-model-badge');
            if (badgeEl && ans.model_used) {
                badgeEl.textContent = `Model: ${ans.model_used}`;
            }

            loadingDiv.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
                    <div style="display:flex; align-items:center; gap:0.5rem;">
                        <span style="font-size:1.1rem;">🤖</span>
                        <strong style="color:var(--gov-blue);">UdyamSetu AI Assistant</strong>
                    </div>
                    <span class="badge badge-submitted" style="font-size:0.65rem;">${Utils.escapeHTML(ans.model_used || 'Active')}</span>
                </div>

                <div style="font-size:0.9rem; color:var(--slate-body); line-height:1.6; white-space:pre-line;">
                    ${formatAIMarkdown(ans.answer)}
                </div>
                
                ${(ans.recommendedActions && ans.recommendedActions.length > 0) ? `
                    <div style="margin-top:1rem; background:#EFF6FF; border:1px solid #BFDBFE; padding:0.85rem; border-radius:8px; font-size:0.85rem;">
                        <strong style="color:#1E40AF; display:block; margin-bottom:0.4rem;">Recommended Next Actions:</strong>
                        <ul style="list-style:none; padding:0; margin:0;">${recsHtml}</ul>
                    </div>
                ` : ''}

                <div style="margin-top:0.75rem; padding-top:0.5rem; border-top:1px solid var(--border-color); font-size:0.75rem; color:var(--slate-muted); display:flex; flex-direction:column; gap:0.25rem;">
                    <div>📚 <strong>Statutory Sources:</strong> ${Utils.escapeHTML(sourcesHtml)}</div>
                    <div>⚠️ <em>${Utils.escapeHTML(ans.disclaimer || 'Advisory guidance only.')}</em></div>
                </div>
            `;
            msgBox.scrollTop = msgBox.scrollHeight;
            await loadAIConversationsList();
        }
    } catch (err) {
        loadingDiv.innerHTML = `<p style="color:var(--danger-red);">AI Assistant Error: ${Utils.escapeHTML(err.message)}</p>`;
    } finally {
        if (sendBtn) sendBtn.disabled = false;
    }
}

function formatAIMarkdown(text) {
    if (!text) return '';
    // Bold
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Code ticks
    formatted = formatted.replace(/`([^`]+)`/g, '<code style="background:#F1F5F9; padding:0.1rem 0.35rem; border-radius:4px; font-size:0.85rem; color:#1E293B;">$1</code>');
    return formatted;
}

function sendQuickPrompt(promptText) {
    document.getElementById('ai-chat-input').value = promptText;
    handleSendMessage(promptText);
}

function startNewChatSession() {
    currentConversationId = null;
    renderAssistantPage();
}

window.renderAssistantPage = renderAssistantPage;
window.sendQuickPrompt = sendQuickPrompt;
window.loadConversationSession = loadConversationSession;
window.startNewChatSession = startNewChatSession;
