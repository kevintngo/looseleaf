import { describe, expect, it } from "vitest"

import { diffResult, diffStats, langFromFileName, normaliseLang, parseDiff, tokenize, tokenizeLines, type Token } from "@/lib/code-highlight"

const join = (t: Token[]) => t.map((x) => x.text).join("")
const of = (t: Token[], type: string) => t.filter((x) => x.type === type).map((x) => x.text)

const SAMPLES: Record<string, string> = {
  tsx: `import { Button } from "@/components/ui/button"
export function Tags({ tags }: { tags: string[] }) {
  const [n, setN] = useState<number>(0) // how many
  return (
    <ul className="flex gap-2">
      {tags.map((t) => (
        <li key={t}>Choose what to import {t.length > 2 ? "long" : \`short \${t}\`}</li>
      ))}
      <Button onClick={() => setN(1)} disabled />
    </ul>
  )
}`,
  ts: "const a: number = 1 < 2 ? 3 : 4; class A<T> extends B<T> { private x = 0 }",
  css: `@media (min-width: 40rem) {\n  .card > h1, #x { color: var(--ll-ink); margin: -2px 1.5rem !important; content: "a" }\n}\n/* done */`,
  json: `{ "name": "looseleaf", "n": -1.5e3, "ok": true, "list": [null, "x"] } // c`,
  bash: `$ npx shadcn add "https://x.io/r/bubble.json" --overwrite -y # go\nexport FOO=$BAR && echo \${FOO} | grep -i "a b" > out.txt`,
}

describe("normaliseLang / langFromFileName", () => {
  it("knows the aliases", () => {
    expect(normaliseLang("TypeScript")).toBe("ts")
    expect(normaliseLang("sh")).toBe("bash")
    expect(normaliseLang("patch")).toBe("diff")
    expect(normaliseLang("klingon")).toBe("text")
    expect(normaliseLang(undefined)).toBe("text")
  })
  it("reads the extension", () => {
    expect(langFromFileName("src/notes/filter.ts")).toBe("ts")
    expect(langFromFileName("Card.TSX")).toBe("tsx")
    expect(langFromFileName("Makefile")).toBe("text")
  })
})

describe("tokenize", () => {
  it.each(Object.entries(SAMPLES))("%s: the tokens' text concatenates back to the input", (lang, src) => {
    expect(join(tokenize(src, lang))).toBe(src)
  })

  it("never throws and always advances on hostile input", () => {
    const nasty = ["", "\0", "`unterminated ${", '"never closed', "/* open", "<<<<<>>>>{{{{}}}}", "\\\\\\", "<div", "</", "</>", "<A b={", "{ '", "@@@", "$(", "😀 é ñ", "a".repeat(5000), "((((((((((", "\n\n\n"]
    for (const lang of ["tsx", "ts", "jsx", "js", "css", "json", "bash", "diff", "text", "nope"]) {
      for (const s of nasty) expect(join(tokenize(s, lang)), `${lang} ${JSON.stringify(s.slice(0, 20))}`).toBe(s)
    }
  })

  it("tsx: keywords, literals, numbers, functions, types, strings, comments and jsx tags", () => {
    const t = tokenize(SAMPLES.tsx, "tsx")
    expect(of(t, "keyword")).toEqual(expect.arrayContaining(["import", "from", "export", "function", "const", "return"]))
    expect(of(t, "type")).toEqual(expect.arrayContaining(["Button", "Tags"]))
    expect(of(t, "function")).toEqual(expect.arrayContaining(["useState", "map", "setN"]))
    expect(of(t, "tag")).toEqual(expect.arrayContaining(["ul", "li", "Button"]))
    expect(of(t, "attr")).toEqual(expect.arrayContaining(["className", "key", "onClick", "disabled"]))
    expect(of(t, "comment")).toEqual(["// how many"])
    expect(of(t, "string")).toEqual(expect.arrayContaining(['"@/components/ui/button"', '"flex gap-2"', '"long"']))
    expect(of(t, "number")).toEqual(expect.arrayContaining(["0", "2", "1"]))
  })

  it("tsx: words in JSX text are text, not keywords", () => {
    const t = tokenize(`<p>Choose what to import and return</p>`, "tsx")
    expect(of(t, "keyword")).toEqual([])
    expect(of(t, "tag")).toEqual(["p", "p"])
  })

  it("ts: a comparison is not a tag", () => {
    const t = tokenize("if (a < b && c > d) {}", "ts")
    expect(of(t, "tag")).toEqual([])
    const g = tokenize("useState<number>(0)", "tsx")
    expect(of(g, "tag")).toEqual([])
    expect(of(g, "function")).toEqual(["useState"])
  })

  it("template literals keep their expressions inside the string", () => {
    const t = tokenize("const s = `a ${b + `c`} d` + 1", "ts")
    expect(of(t, "string")).toEqual(["`a ${b + `c`} d`"])
    expect(of(t, "number")).toEqual(["1"])
  })

  it("css: at-rules, selectors, properties, numbers, functions, custom properties", () => {
    const t = tokenize(SAMPLES.css, "css")
    expect(of(t, "keyword")).toEqual(expect.arrayContaining(["@media", "!important"]))
    expect(of(t, "attr")).toEqual(expect.arrayContaining(["min-width", "color", "margin", "content"]))
    expect(of(t, "tag")).toEqual(expect.arrayContaining([".card", "h1", "#x"]))
    expect(of(t, "number")).toEqual(expect.arrayContaining(["40rem", "-2px", "1.5rem"]))
    expect(of(t, "function")).toEqual(["var"])
    expect(of(t, "variable")).toEqual(["--ll-ink"])
    expect(of(t, "comment")).toEqual(["/* done */"])
  })

  it("json: keys are attributes, values are strings, numbers and literals", () => {
    const t = tokenize(SAMPLES.json, "json")
    expect(of(t, "attr")).toEqual(['"name"', '"n"', '"ok"', '"list"'])
    expect(of(t, "string")).toEqual(['"looseleaf"', '"x"'])
    expect(of(t, "number")).toEqual(["-1.5e3"])
    expect(of(t, "literal")).toEqual(["true", "null"])
  })

  it("bash: commands, flags, variables, strings and comments", () => {
    const t = tokenize(SAMPLES.bash, "bash")
    expect(of(t, "keyword")).toEqual(expect.arrayContaining(["npx", "export", "echo", "grep"]))
    expect(of(t, "attr")).toEqual(expect.arrayContaining(["--overwrite", "-y", "-i"]))
    expect(of(t, "variable")).toEqual(["$BAR", "${FOO}"])
    expect(of(t, "comment")).toEqual(["# go"])
    expect(of(t, "string")).toEqual(['"https://x.io/r/bubble.json"', '"a b"'])
  })

  it("plain text is one plain token", () => {
    expect(tokenize("just words", "text")).toEqual([{ type: "plain", text: "just words" }])
    expect(tokenize("", "text")).toEqual([])
  })
})

describe("tokenizeLines", () => {
  it("splits at newlines, cuts a token that spans lines, keeps empty lines", () => {
    const l = tokenizeLines("a\n\n/* x\ny */ b", "ts")
    expect(l).toHaveLength(4)
    expect(l[1]).toEqual([])
    expect(l[2].map((t) => t.type)).toEqual(["comment"])
    expect(l[3].map((t) => t.type)).toEqual(["comment", "plain"])
    expect(l.map((x) => x.map((t) => t.text).join("")).join("\n")).toBe("a\n\n/* x\ny */ b")
  })
})

describe("diff", () => {
  const patch = `diff --git a/f.ts b/f.ts
--- a/f.ts
+++ b/f.ts
@@ -1,3 +1,4 @@
 keep
-old
+new1
+new2
plain`
  it("reads markers, context and meta lines", () => {
    const rows = parseDiff(patch)
    expect(rows.map((r) => r.kind)).toEqual(["meta", "meta", "meta", "meta", "ctx", "del", "add", "add", "ctx"])
    expect(rows[5].text).toBe("old")
    expect(rows[8].text).toBe("plain")
  })
  it("counts and gives the result", () => {
    const rows = parseDiff(patch)
    expect(diffStats(rows)).toEqual({ added: 2, removed: 1 })
    expect(diffResult(rows)).toBe("keep\nnew1\nnew2\nplain")
  })
  it("a bare +/- list works, and a trailing newline adds no line", () => {
    expect(parseDiff("-a\n+b\n")).toEqual([
      { kind: "del", text: "a" },
      { kind: "add", text: "b" },
    ])
  })
})

describe("review: diff notes that are not code", () => {
  it("git's '\\ No newline at end of file' is meta: it is not in the copied result", () => {
    const rows = parseDiff("-a\n\\ No newline at end of file\n+b\n\\ No newline at end of file\n c")
    expect(rows.map((r) => r.kind)).toEqual(["del", "meta", "add", "meta", "ctx"])
    expect(diffResult(rows)).toBe("b\nc")
  })
})
