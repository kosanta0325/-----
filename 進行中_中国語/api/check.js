export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const API_KEY = process.env.GEMINI_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'APIキーが設定されていません' });
  }

  const prompt = `あなたは中国語の専門家です。以下の中国語テキストを分析し、日本語で回答してください。

【出力形式】
1. 「✅ 修正後の文章」として、正しい中国語に直した文章を最初に表示する。
2. 「📝 修正箇所の解説」として、各修正点について以下の形式で説明する：
   - 【修正 X】誤り：「元の表現」 → 正しい表現：「修正後」
     理由：文法・語彙のどこがどのように間違っているか、正しい使い方を詳しく説明する。
3. 間違いが一切ない場合は「✅ 文法・語彙ともに問題ありません。」とだけ回答する。

---
${text}
---`;

  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`;

  const geminiRes = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!geminiRes.ok) {
    const err = await geminiRes.json();
    return res.status(geminiRes.status).json({ error: err.error?.message || 'APIエラー' });
  }

  const data = await geminiRes.json();
  const result = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '結果を取得できませんでした。';
  res.status(200).json({ result });
}
