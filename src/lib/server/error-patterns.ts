interface ErrorPattern {
	pattern: RegExp;
	template: (match: RegExpMatchArray) => string;
}

const patterns: ErrorPattern[] = [
	{
		pattern: /ENOENT.*no such file.*['"](.+?)['"]/i,
		template: (m) => `找不到檔案「${m[1]}」。AI 可能需要先建立這個檔案。`
	},
	{
		pattern: /EACCES.*permission denied/i,
		template: () => '權限不足，無法存取某些檔案。請確認 Docker volume 的權限設定。'
	},
	{
		pattern: /Cannot find module ['"](.+?)['"]/i,
		template: (m) => `找不到套件「${m[1]}」。AI 需要先安裝它。`
	},
	{
		pattern: /SyntaxError.*Unexpected token/i,
		template: () => 'AI 生成的程式碼有語法錯誤。按「重試」讓它修正。'
	},
	{
		pattern: /TypeError.*is not a function/i,
		template: () => 'AI 呼叫了不存在的函式。按「重試」讓它修正。'
	},
	{
		pattern: /ECONNREFUSED/i,
		template: () => '無法連線到服務。可能是資料庫或 API 尚未啟動。'
	},
	{
		pattern: /npm ERR! code E404/i,
		template: () => 'AI 嘗試安裝的某個套件不存在。按「重試」讓它選擇正確的套件。'
	},
	{
		pattern: /npm ERR! code ERESOLVE/i,
		template: () => '套件之間有版本衝突。AI 需要調整版本。'
	},
	{
		pattern: /ENOMEM|heap out of memory/i,
		template: () => '記憶體不足。請增加 Docker container 的記憶體限制。'
	},
	{
		pattern: /ETIMEOUT|ETIMEDOUT/i,
		template: () => '操作逾時。可能是網路問題，請檢查網路連線後重試。'
	},
	{
		pattern: /rate.?limit|429/i,
		template: () => 'API 呼叫太頻繁，已被限流。請稍等幾分鐘再重試。'
	},
	{
		pattern: /authentication|401|invalid.*api.*key/i,
		template: () => 'API 金鑰無效或已過期。請重新設定你的 Anthropic API key。'
	},
	{
		pattern: /SQLITE_BUSY/i,
		template: () => '資料庫正忙。這通常會自動解決，按「重試」即可。'
	},
	{
		pattern: /port.*already.*in.*use|EADDRINUSE/i,
		template: () => '預覽需要的連接埠已被占用。請關閉占用該連接埠的程式。'
	},
	{
		pattern: /test.*fail|assertion.*error/i,
		template: () => 'AI 生成的程式碼沒有通過測試。按「重試」讓它修正。'
	},
	{
		pattern: /build.*fail/i,
		template: () => '程式碼編譯失敗。按「重試」讓 AI 修正錯誤。'
	},
	{
		pattern: /command not found.*(\S+)/i,
		template: (m) => `找不到指令「${m[1]}」。可能需要安裝對應的工具。`
	},
	{
		pattern: /disk.*space|ENOSPC/i,
		template: () => '磁碟空間不足。請清理一些空間後重試。'
	},
	{
		pattern: /spawn.*ENOENT/i,
		template: () => 'AI 嘗試執行的工具未安裝。按「重試」讓它改用別的方式。'
	},
	{
		pattern: /exit.*code\s+(\d+)/i,
		template: (m) => `操作結束時回報錯誤（代碼 ${m[1]}）。按「重試」讓 AI 嘗試修正。`
	}
];

export function translateError(rawError: string): { plainText: string; matched: boolean } {
	for (const { pattern, template } of patterns) {
		const match = rawError.match(pattern);
		if (match) {
			return { plainText: template(match), matched: true };
		}
	}

	return {
		plainText: 'AI 遇到了問題。你可以按「重試」讓它再試一次，或「查看技術細節」了解更多。',
		matched: false
	};
}
