"""Liten HTML -> Markdown-omvandlare för de gamla sidorna och recepten.

Hanterar bara det som finns i källorna: h1-h4, p, br, strong/b, em/i, a, ul/ol/li.
Texten skrivs inte om, bara formatet städas: entiteter avkodas, &nbsp; och dubbla
mellanslag tas bort, radbrytningar blir stycken eller listor.
"""
import re
from html.parser import HTMLParser

NBSP = " "


def norm_ws(s):
    """Slå ihop all whitespace (inkl. nbsp) till enkla mellanslag."""
    return re.sub(r"[ \t\r\n ]+", " ", s)


class _Parser(HTMLParser):
    def __init__(self, fixlink=None):
        super().__init__(convert_charrefs=True)
        self.fixlink = fixlink or (lambda h: h)
        self.blocks = []          # ('h', n, text) | ('p', text) | ('list', kind, [text])
        self.buf = []             # inline-delar för pågående block
        self.stack = []           # (tagg, buf-före, extra)
        self.list_stack = []      # [kind, items]
        self.title = None
        self._in_h1_header = False

    # --- inline-hjälp ---
    def _flush_inline(self):
        text = "".join(self.buf)
        self.buf = []
        return text

    def _end_block(self, make):
        text = self._flush_inline()
        make(text)

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag in ("p", "div", "h1", "h2", "h3", "h4"):
            self._close_pending_paragraph()
            self.stack.append((tag, None, None))
        elif tag in ("ul", "ol"):
            self._close_pending_paragraph()
            self.list_stack.append([tag, []])
            self.stack.append((tag, None, None))
        elif tag == "li":
            self.buf = []
            self.stack.append((tag, None, None))
        elif tag == "br":
            self.buf.append("\x00BR\x00")
        elif tag in ("strong", "b", "em", "i", "a"):
            self.stack.append((tag, self.buf, a.get("href")))
            self.buf = []
        elif tag in ("u",):
            self.stack.append((tag, None, None))

    def _close_pending_paragraph(self):
        # Löst text som står direkt i en div/body utan <p>
        text = self._flush_inline()
        if text.strip():
            self.blocks.append(("p", text))

    def handle_endtag(self, tag):
        # hitta matchande starttagg (ignorera överblivna sluttaggar, t.ex. </a> utan <a>)
        idx = None
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                idx = i
                break
        if idx is None:
            return
        # stäng allt ovanför (slarvigt HTML)
        while len(self.stack) - 1 > idx:
            self._pop(self.stack[-1][0])
        self._pop(tag)

    def _pop(self, tag):
        t, saved, extra = self.stack.pop()
        if t in ("p", "div"):
            text = self._flush_inline()
            if text.strip() or "\x00BR\x00" in text:
                self.blocks.append(("p", text))
        elif t in ("h1", "h2", "h3", "h4"):
            text = self._flush_inline()
            self.blocks.append(("h", int(t[1]), text))
        elif t in ("ul", "ol"):
            kind, items = self.list_stack.pop()
            self.blocks.append(("list", kind, items))
        elif t == "li":
            text = self._flush_inline()
            if self.list_stack:
                self.list_stack[-1][1].append(text)
        elif t in ("strong", "b", "em", "i", "a"):
            inner = "".join(self.buf)
            self.buf = saved
            core = inner.strip(" ")
            lead = " " if inner.startswith(" ") else ""
            trail = " " if inner.endswith(" ") and inner.strip(" ") else ""
            if not core:
                self.buf.append(inner)
                return
            if t in ("strong", "b"):
                out = "**" + core + "**"
            elif t in ("em", "i"):
                out = "*" + core + "*"
            else:
                href = self.fixlink(extra or "")
                out = "[" + core + "](" + href + ")" if href else core
            self.buf.append(lead + out + trail)

    def handle_data(self, data):
        self.buf.append(norm_ws(data))

    def handle_pi(self, data):
        pass

    def handle_decl(self, decl):
        pass

    def close(self):
        super().close()
        self._close_pending_paragraph()


def _clean_inline(text):
    """Tar bort överflödiga mellanslag runt radbrytningar och i ändarna."""
    parts = text.split("\x00BR\x00")
    parts = [re.sub(r" {2,}", " ", p).strip() for p in parts]
    return parts


def parse(html, fixlink=None):
    p = _Parser(fixlink)
    p.feed(html)
    p.close()
    return p.blocks


def inline_lines(text):
    """Text -> lista med icketomma rader (<br> = radbrytning)."""
    return [l for l in _clean_inline(text) if l]


def inline_one(text):
    """Text -> en rad, <br> blir hård radbrytning (backslash)."""
    return "\\\n".join(inline_lines(text))
