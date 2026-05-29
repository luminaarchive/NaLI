/**
 * Classifies OpenRouter API responses/errors.
 * Returns: 'usable' | 'payment_required' | 'rate_limited' | 'not_found' | 'timeout' | 'invalid_json' | 'network_error'
 */
function classifyOpenRouterResponse({ status, bodyText, error }) {
  if (error) {
    const errMsg = (error.message || String(error)).toLowerCase();
    if (error.name === "AbortError" || errMsg.includes("timeout") || errMsg.includes("aborted")) {
      return "timeout";
    }
    if (errMsg.includes("fetch failed") || errMsg.includes("enotfound") || errMsg.includes("econnrefused")) {
      return "network_error";
    }
  }

  const httpStatus = Number(status || 0);

  if (httpStatus === 402) return "payment_required";
  if (httpStatus === 429) return "rate_limited";
  if (httpStatus === 404) return "not_found";

  if (bodyText) {
    try {
      const parsed = JSON.parse(bodyText);

      // Check for OpenRouter payload errors
      if (parsed.error) {
        const code = Number(parsed.error.code);
        const msg = String(parsed.error.message || "").toLowerCase();

        if (code === 402 || msg.includes("credits") || msg.includes("balance") || msg.includes("payment")) {
          return "payment_required";
        }
        if (code === 429 || msg.includes("rate limit") || msg.includes("rate-limited") || msg.includes("exceeded")) {
          return "rate_limited";
        }
        if (code === 404 || msg.includes("not found")) {
          return "not_found";
        }
        return "network_error";
      }

      // Check for choices
      const choices = parsed.choices;
      if (!Array.isArray(choices) || choices.length === 0) {
        return "invalid_json";
      }

      const content = choices[0]?.message?.content;
      if (typeof content !== "string" || !content.trim()) {
        return "invalid_json";
      }

      // Verify that content is valid JSON since we request json_object
      try {
        JSON.parse(content.trim());
        return "usable";
      } catch {
        // Try fallback parsing (find first '{' and last '}')
        const trimmed = content.trim();
        const start = trimmed.indexOf("{");
        const end = trimmed.lastIndexOf("}");
        if (start >= 0 && end > start) {
          try {
            JSON.parse(trimmed.slice(start, end + 1));
            return "usable";
          } catch {}
        }
        return "invalid_json";
      }
    } catch {
      return "invalid_json";
    }
  }

  if (httpStatus >= 400) {
    return "network_error";
  }

  return "invalid_json";
}

module.exports = {
  classifyOpenRouterResponse,
};
