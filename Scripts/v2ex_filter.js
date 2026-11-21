
/**
 * V2EX 主题关键词过滤
 *
 * 功能：
 * 1. 从 Surge 插件参数读取过滤关键词
 * 2. 支持多个关键词
 * 3. 支持中英文逗号、换行分隔
 * 4. 标题包含任意关键词时删除整个主题区块
 */

const body = $response.body || "";

// 获取插件传递的参数
const rawKeywords = "Claude,blg";

// 解析关键词
const keywords = rawKeywords
    .split(/[,，\r\n]+/)
    .map(item => item.trim())
    .filter(Boolean);

console.log("========== V2EX 主题过滤 ==========");
console.log("请求地址: " + $request.url);
console.log("原始响应长度: " + body.length);
console.log("过滤关键词: " + JSON.stringify(keywords));

// 没有关键词时不进行过滤
if (keywords.length === 0) {
    console.log("未配置过滤关键词，跳过过滤");
    $done({ body: body });
} else {
    let removed = 0;

    // 匹配每个 V2EX 主题区块
    const result = body.replace(
        /<div\s+class=["']cell item["'][^>]*>(?:(?!<div\s+class=["']cell item["'][^>]*>)[\s\S])*?<\/table>\s*<\/div>/gi,
        function (block) {

            // 提取主题标题
            const match = block.match(
                /<span\b[^>]*class=["'][^"']*\bitem_title\b[^"']*["'][^>]*>([\s\S]*?)<\/span>/i
            );

            if (!match) {
                return block;
            }

            // 去除标题中的 HTML 标签
            const title = match[1]
                .replace(/<[^>]*>/g, "")
                .trim();

            // 判断标题是否包含任意一个关键词
            const normalizedTitle = title.toLowerCase();

            const matchedKeyword = keywords.find(keyword =>
                normalizedTitle.includes(keyword.toLowerCase())
            );

            if (matchedKeyword) {
                removed++;

                console.log(
                    "删除主题: " + title +
                    " (匹配关键词: " + matchedKeyword + ")"
                );

                return "";
            }

            return block;
        }
    );

    console.log("过滤完成，删除主题数量: " + removed);
    console.log("修改后响应长度: " + result.length);

    $done({
        body: result
    });
}
