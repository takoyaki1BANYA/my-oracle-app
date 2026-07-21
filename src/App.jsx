import React, { useState } from 'react';

export default function App() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    birthDate: '',
    gender: 'unspecified'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');
    setError('');

    const systemPrompt = `
あなたは世界最高峰の神託師・大占星術師です。
ユーザーの情報をもとに、以下の【フォーマット】に厳密に従って、圧倒的な長文で詳細な神託（占い結果）を生成してください。

【出力フォーマット】
📜
【神託の証明 — 占術の計算結果】
（数秘術、西洋占星術、十二支、タロット、ルーン、易経、おみくじの計算結果を詳細に記述）

【あなたの本質と魂の使命】
（300文字以上の詳細な解説）

🌑
【過去の真実と隠された記憶】
（300文字以上の詳細な解説）

🔮
【現在の核心 — 今あなたに起きていること】
（300文字以上の詳細な解説）

🌙
【近未来の予言 ─ 1〜3ヶ月以内】
（300文字以上の詳細な解説）

⭐
【遠未来の啓示 ─ 半年〜1年先】
（300文字以上の詳細な解説）

【12の神託が紡ぐ、あなただけへの言葉】
（結びの言葉）
`;

    const userPrompt = `
名前: ${formData.name || '未設定'}
生年月日: ${formData.birthDate || '未設定'}
性別: ${formData.gender}

上記の情報を元に、全セクションを極めて深く、重厚な長文で鑑定してください。
`;

    try {
      const res = await fetch('/api/oracle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }]
        })
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error?.message || data.error || '通信エラーが発生しました');
      }

      // Anthropicの返答文を取得
      const text = data.content?.[0]?.text || '';
      if (!text) {
        throw new Error('AIからの回答が空でした');
      }

      setResult(text);
    } catch (err) {
      console.error(err);
      setError(err.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>神託占い</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>お名前: </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>生年月日: </label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '10px 20px', fontSize: '16px', cursor: 'pointer' }}
        >
          {loading ? '神託を受信中...' : '鑑定する'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', padding: '10px', border: '1px solid red', marginBottom: '20px' }}>
          <strong>エラー:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', background: '#f9f9f9', padding: '20px', borderRadius: '8px' }}>
          {result}
        </div>
      )}
    </div>
  );
}
