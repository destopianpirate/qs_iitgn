    let liveSessionsUnsubscribe = null;
    let liveChatsUnsubscribe = null;

    window.startLiveTournamentStats = function(quizId) {
      if (!window.db) return;
      
      const trackingBody = document.getElementById('live-tracking-tbody');
      const participantsBody = document.getElementById('live-participants-tbody');
      const chatMessages = document.getElementById('live-chat-messages');
      const countEl = document.getElementById('live-participant-count');
      const avgEl = document.getElementById('live-avg-completion');

      if (trackingBody) trackingBody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Loading...</td></tr>';
      if (participantsBody) participantsBody.innerHTML = '<tr><td colspan="2" style="text-align:center;">Loading...</td></tr>';
      if (chatMessages) chatMessages.innerHTML = '<div style="text-align:center; color:gray; font-size:0.85rem; padding: 16px;">Connecting...</div>';

      const quiz = quizzes.find(q => q.id === quizId);
      const totalQ = quiz && quiz.questions ? quiz.questions.length : 1;

      // 1. Listen to Live Sessions
      liveSessionsUnsubscribe = window.db.collection('live_sessions')
        .where('quizId', '==', quizId)
        .onSnapshot(snap => {
          let sessions = [];
          snap.forEach(doc => {
            let data = doc.data();
            data.uid = doc.id;
            sessions.push(data);
          });

          if (countEl) countEl.textContent = sessions.length;

          let totalPercent = 0;
          let pRows = '';
          let tRows = '';

          if (sessions.length === 0) {
            if (participantsBody) participantsBody.innerHTML = '<tr><td colspan="2" style="text-align:center; padding:10px;">No active participants</td></tr>';
            if (trackingBody) trackingBody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:10px;">No active participants</td></tr>';
            if (avgEl) avgEl.textContent = '0%';
            return;
          }

          sessions.sort((a,b) => (b.currentQuestion || 0) - (a.currentQuestion || 0));

          sessions.forEach(s => {
            const name = s.participantName || 'Anonymous';
            const uidStr = s.uid ? s.uid.substring(0, 8) : 'Unknown';
            const curQ = s.currentQuestion || 0;
            const att = s.attemptedCount || 0;
            const skip = s.skippedCount || 0;
            const tab = s.tabSwitches || 0;
            const min = s.minimizes || 0;
            const elapsedSec = s.startTime ? Math.floor((new Date() - new Date(s.startTime)) / 1000) : 0;
            const tQ = s.timeOnCurrentQuestion || 0;

            let pct = Math.min(100, Math.round((curQ / totalQ) * 100));
            totalPercent += pct;

            pRows += `<tr><td style="padding:10px;">${name}</td><td style="padding:10px;">${uidStr}</td></tr>`;
            tRows += `<tr>
              <td style="padding:10px;">${name}</td>
              <td style="padding:10px;">Q${curQ}</td>
              <td style="padding:10px;">${att}</td>
              <td style="padding:10px;">${skip}</td>
              <td style="padding:10px; color:${tab>0?'#ef4444':'inherit'}">${tab}</td>
              <td style="padding:10px; color:${min>0?'#f59e0b':'inherit'}">${min}</td>
              <td style="padding:10px;">${tQ}s</td>
              <td style="padding:10px;">${elapsedSec}s</td>
            </tr>`;
          });

          if (participantsBody) participantsBody.innerHTML = pRows;
          if (trackingBody) trackingBody.innerHTML = tRows;
          if (avgEl) avgEl.textContent = Math.round(totalPercent / sessions.length) + '%';
        });

      // 2. Listen to Live Chats
      liveChatsUnsubscribe = window.db.collection('live_chats')
        .where('quizId', '==', quizId)
        .orderBy('timestamp', 'asc')
        .onSnapshot(snap => {
          if (!chatMessages) return;
          chatMessages.innerHTML = '';
          if (snap.empty) {
            chatMessages.innerHTML = '<div style="text-align:center; color:gray; font-size:0.85rem; padding: 16px;">No messages yet.</div>';
            return;
          }
          snap.forEach(doc => {
            const msg = doc.data();
            const isAdmin = msg.sender === 'Admin';
            const align = isAdmin ? 'flex-end' : 'flex-start';
            const bg = isAdmin ? '#0ea5e9' : '#f1f5f9';
            const color = isAdmin ? 'white' : 'var(--text)';
            
            chatMessages.innerHTML += `
              <div style="display:flex; flex-direction:column; align-items:${align}; margin-bottom:8px;">
                <span style="font-size:0.75rem; color:var(--text-secondary); margin-bottom:2px; font-weight:600;">${msg.sender}</span>
                <div style="background:${bg}; color:${color}; padding:8px 12px; border-radius:12px; max-width:80%; font-size:0.9rem; word-break:break-word; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                  ${msg.message}
                </div>
              </div>
            `;
          });
          chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    };

    window.stopLiveTournamentStats = function() {
      if (liveSessionsUnsubscribe) liveSessionsUnsubscribe();
      if (liveChatsUnsubscribe) liveChatsUnsubscribe();
      liveSessionsUnsubscribe = null;
      liveChatsUnsubscribe = null;
    };
