"""Render the SalaryShield architecture diagram to PNG (brand-styled)."""
from PIL import Image, ImageDraw, ImageFont

W, H = 2200, 1560
BG = (8, 11, 17)
PANEL = (17, 22, 34)
CARD = (26, 33, 51)
BORDER = (58, 66, 88)
VIOLET = (139, 92, 246)
EMERALD = (16, 185, 129)
AMBER = (245, 158, 11)
BLUE = (59, 130, 246)
WHITE = (249, 250, 251)
GREY = (156, 163, 175)
MUTE = (107, 114, 128)

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

FB = "C:/Windows/Fonts/segoeuib.ttf"
FR = "C:/Windows/Fonts/segoeui.ttf"
def fb(s): return ImageFont.truetype(FB, s)
def fr(s): return ImageFont.truetype(FR, s)

def ctext(cx, y, s, font, fill, anchor="mm"):
    d.text((cx, y), s, font=font, fill=fill, anchor=anchor)

def box(x0, y0, x1, y1, fill=CARD, border=BORDER, w=2, r=18):
    d.rounded_rectangle([x0, y0, x1, y1], radius=r, fill=fill, outline=border, width=w)

def card(x0, y0, x1, y1, title, sub=None, accent=VIOLET, fill=CARD, tsize=34, ssize=24, tag=None):
    box(x0, y0, x1, y1, fill=fill, border=accent, w=3)
    # accent bar
    d.rounded_rectangle([x0, y0, x0 + 12, y1], radius=6, fill=accent)
    cx = (x0 + x1) / 2
    if sub:
        ctext(cx, (y0 + y1) / 2 - 18, title, fb(tsize), WHITE)
        ctext(cx, (y0 + y1) / 2 + 22, sub, fr(ssize), GREY)
    else:
        ctext(cx, (y0 + y1) / 2, title, fb(tsize), WHITE)
    if tag:
        tw = d.textlength(tag, font=fb(18)) + 24
        d.rounded_rectangle([x1 - tw - 16, y0 + 14, x1 - 16, y0 + 46], radius=10, fill=(60, 45, 10), outline=AMBER, width=2)
        ctext(x1 - tw / 2 - 16, y0 + 30, tag, fb(18), AMBER)

def arrow(cx, y0, y1, color=VIOLET):
    d.line([cx, y0, cx, y1 - 14], fill=color, width=4)
    d.polygon([(cx - 11, y1 - 15), (cx + 11, y1 - 15), (cx, y1)], fill=color)

M = 80
CW = W - 2 * M

# ---- Title ----
ctext(W / 2, 54, "SalaryShield — Solution Architecture", fb(52), WHITE)
ctext(W / 2, 104, "AI-Driven, Inflation-Adaptive Compensation Intelligence  ·  React 19 + Vite 8 SPA", fr(28), GREY)

# ---- Row 1: Users ----
y0, y1 = 150, 250
uw = 520
card(W/2 - uw - 40, y0, W/2 - 40, y1, "Employee", "Priya — Tech Lead, Hyderabad", accent=VIOLET, fill=PANEL, tsize=32, ssize=22)
card(W/2 + 40, y0, W/2 + uw + 40, y1, "Employer / HR", "Workforce comp & attrition", accent=EMERALD, fill=PANEL, tsize=32, ssize=22)

# ---- Row 2: Presentation (container with 5 modules) ----
py0, py1 = 320, 640
box(M, py0, W - M, py1, fill=PANEL, border=VIOLET, w=3)
ctext(M + 34, py0 + 34, "PRESENTATION LAYER", fb(26), VIOLET, anchor="lm")
ctext(W - M - 34, py0 + 34, "React 19 · Vite 8 · lucide-react · CSS glassmorphism", fr(22), GREY, anchor="rm")
mods = [
    ("Employer\nConsole", "Budget simulator,\nattrition ROI", EMERALD),
    ("Employee\nPortal", "Real-wage score,\nnegotiation coach", VIOLET),
    ("My Budget &\nInflation", "Personal inflation,\nsavings depletion", AMBER),
    ("CLII\nEngine", "City inflation\nindex + trends", BLUE),
    ("GenAI\nCopilot", "NL Q&A grounded\non user data", VIOLET),
]
n = len(mods)
gap = 26
inner_x = M + 34
inner_w = (W - M) - 34 - inner_x
mw = (inner_w - gap * (n - 1)) / n
my0, my1 = py0 + 80, py1 - 34
for i, (t, s, acc) in enumerate(mods):
    x0 = inner_x + i * (mw + gap)
    x1 = x0 + mw
    box(x0, my0, x1, my1, fill=CARD, border=acc, w=3, r=14)
    d.rounded_rectangle([x0, my0, x1, my0 + 10], radius=5, fill=acc)
    cx = (x0 + x1) / 2
    # title (2 lines)
    tl = t.split("\n")
    yy = my0 + 46
    for ln in tl:
        ctext(cx, yy, ln, fb(28), WHITE); yy += 34
    yy += 6
    for ln in s.split("\n"):
        ctext(cx, yy, ln, fr(20), GREY); yy += 26

arrow(W/2, 250, py0, VIOLET)

# ---- Row 3: State ----
sy0, sy1 = 720, 820
card(M, sy0, W - M, sy1, "CLIENT STATE & PERSISTENCE",
     "React Hooks (useState / useEffect)  ·  localStorage — budget shared across Planner → Coach → Copilot",
     accent=BLUE, fill=PANEL, tsize=28, ssize=23)
arrow(W/2, py1, sy0, VIOLET)

# ---- Row 4: Domain / Model ----
dy0, dy1 = 900, 1010
card(M, dy0, W - M, dy1, "DOMAIN MODEL LAYER  —  src/lib/inflation.js  (single source of truth)",
     "CLII data model · analyzeBudget() · savingsSeries() · personal-inflation & break-even engine",
     accent=EMERALD, fill=PANEL, tsize=28, ssize=23)
arrow(W/2, sy1, dy0, BLUE)

# ---- Row 5: AI Layer ----
ay0, ay1 = 1090, 1210
card(M, ay0, W - M, ay1, "AI LAYER  —  GenAI Copilot",
     "LLM Gateway → Claude / Azure OpenAI GPT-4o  ·  RAG grounding on CLII + live user budget",
     accent=VIOLET, fill=PANEL, tsize=28, ssize=23, tag="ROADMAP: live LLM")
arrow(W/2, dy1, ay0, EMERALD)

# ---- Row 6: Ingestion ----
iy0, iy1 = 1290, 1390
card(M, iy0, W - M, iy1, "DATA INGESTION & NORMALIZATION PIPELINE",
     "Scheduled fetch · basket weighting · CLII computation per city",
     accent=AMBER, fill=PANEL, tsize=28, ssize=23, tag="ROADMAP: live feeds")
arrow(W/2, ay1, iy0, VIOLET)

# ---- Row 7: Sources ----
srcs = ["MOSPI CPI API", "RBI rates / forecasts", "MagicBricks / 99acres", "Zomato / Swiggy basket"]
gy0, gy1 = 1450, 1540
sgap = 24
sw = (CW - sgap * (len(srcs) - 1)) / len(srcs)
for i, s in enumerate(srcs):
    x0 = M + i * (sw + sgap)
    x1 = x0 + sw
    box(x0, gy0, x1, gy1, fill=CARD, border=AMBER, w=2, r=14)
    ctext((x0 + x1) / 2, (gy0 + gy1) / 2, s, fb(24), WHITE)
arrow(W/2, iy1, gy0, AMBER)

img.save("C:/Users/ADMIN/kkl-workspace/salaryshield/deliverables/architecture.png")
print("saved architecture.png", img.size)
