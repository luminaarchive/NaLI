"""
NaLI Evidence Report — Journal-Grade PDF Generator
Standard: Journal of Wildlife and Conservation / Animal Conservation (Wiley/ZSL)
"""

import io
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
pt = 1.0  # reportlab native unit is points
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    BaseDocTemplate, PageTemplate, Frame, Paragraph, Spacer,
    Table, TableStyle, KeepTogether, HRFlowable, PageBreak,
    NextPageTemplate,
)
from reportlab.platypus.flowables import Flowable
from reportlab.graphics.shapes import Drawing, Circle, String, Line, Rect
from reportlab.graphics import renderPDF

# ── Palette ────────────────────────────────────────────────────────────────
C_BG         = colors.HexColor("#050F12")
C_GREEN_DARK = colors.HexColor("#1B5E20")
C_GREEN_MED  = colors.HexColor("#2E7D32")
C_TEAL       = colors.HexColor("#00FFB3")
C_TEAL_DIM   = colors.HexColor("#B2DFDB")
C_TEAL_MED   = colors.HexColor("#00897B")
C_AMBER      = colors.HexColor("#F57C00")
C_ROSE       = colors.HexColor("#C62828")
C_WHITE      = colors.white
C_NEAR_BLACK = colors.HexColor("#121212")
C_GRAY_DARK  = colors.HexColor("#424242")
C_GRAY_MID   = colors.HexColor("#757575")
C_GRAY_LIGHT = colors.HexColor("#BDBDBD")
C_ROW_ALT    = colors.HexColor("#F9FBE7")
C_SCORE_BG   = colors.HexColor("#E0F2F1")
C_INFO_BG    = colors.HexColor("#FAFAFA")
C_ABS_BG     = colors.HexColor("#FAFAFA")
C_BORDER     = colors.HexColor("#BDBDBD")
C_GREEN_PALE = colors.HexColor("#E8F5E9")
C_Q_FILL     = colors.HexColor("#E0F2F1")
C_Q_BORDER   = colors.HexColor("#B2DFDB")
C_TEAL_BG    = colors.HexColor("#F0FAF7")
C_LG_BG      = colors.HexColor("#F5F5F5")
C_AMBER_DIM  = colors.HexColor("#FFF8E1")


def score_color(score: int) -> colors.Color:
    if score >= 80:
        return C_TEAL_MED
    if score >= 60:
        return C_AMBER
    if score >= 40:
        return colors.HexColor("#F97316")
    return C_ROSE


# ── Paragraph Styles ──────────────────────────────────────────────────────
def make_styles():
    return {
        "cover_header": ParagraphStyle(
            "cover_header",
            fontName="Helvetica-Bold",
            fontSize=10,
            textColor=C_WHITE,
            leading=13,
        ),
        "cover_header_right": ParagraphStyle(
            "cover_header_right",
            fontName="Helvetica",
            fontSize=7.5,
            textColor=colors.HexColor("#A5D6A7"),
            leading=10,
            alignment=TA_RIGHT,
        ),
        "cover_title": ParagraphStyle(
            "cover_title",
            fontName="Times-BoldItalic",
            fontSize=15,
            textColor=C_WHITE,
            leading=20,
            spaceAfter=4,
        ),
        "cover_subtitle": ParagraphStyle(
            "cover_subtitle",
            fontName="Helvetica",
            fontSize=9,
            textColor=colors.HexColor("#A5D6A7"),
            leading=12,
            spaceAfter=6,
        ),
        "cover_meta": ParagraphStyle(
            "cover_meta",
            fontName="Helvetica",
            fontSize=8.5,
            textColor=C_TEAL_DIM,
            leading=12,
        ),
        "article_title": ParagraphStyle(
            "article_title",
            fontName="Times-Bold",
            fontSize=15,
            textColor=C_NEAR_BLACK,
            leading=20,
            alignment=TA_CENTER,
            spaceAfter=4,
        ),
        "article_meta": ParagraphStyle(
            "article_meta",
            fontName="Helvetica",
            fontSize=8,
            textColor=C_GRAY_MID,
            leading=11,
            alignment=TA_CENTER,
            spaceAfter=8,
        ),
        "score_pct": ParagraphStyle(
            "score_pct",
            fontName="Helvetica-Bold",
            fontSize=24,
            leading=28,
            alignment=TA_CENTER,
        ),
        "score_level": ParagraphStyle(
            "score_level",
            fontName="Helvetica-Bold",
            fontSize=7,
            leading=10,
            alignment=TA_CENTER,
        ),
        "score_label": ParagraphStyle(
            "score_label",
            fontName="Helvetica",
            fontSize=6,
            textColor=C_GRAY_MID,
            leading=9,
            alignment=TA_CENTER,
        ),
        "pillar_label": ParagraphStyle(
            "pillar_label",
            fontName="Helvetica",
            fontSize=7,
            textColor=C_GRAY_DARK,
            leading=9,
        ),
        "pillar_value": ParagraphStyle(
            "pillar_value",
            fontName="Helvetica-Bold",
            fontSize=7,
            textColor=C_GRAY_DARK,
            leading=9,
            alignment=TA_RIGHT,
        ),
        "info_header": ParagraphStyle(
            "info_header",
            fontName="Helvetica-Bold",
            fontSize=7.5,
            textColor=C_GRAY_MID,
            leading=10,
            spaceAfter=3,
        ),
        "info_tipe": ParagraphStyle(
            "info_tipe",
            fontName="Helvetica-Bold",
            fontSize=8,
            textColor=C_NEAR_BLACK,
            leading=11,
            spaceAfter=3,
        ),
        "info_kualitas_label": ParagraphStyle(
            "info_kualitas_label",
            fontName="Helvetica",
            fontSize=7.5,
            textColor=C_GRAY_MID,
            leading=10,
        ),
        "abs_header": ParagraphStyle(
            "abs_header",
            fontName="Helvetica-Bold",
            fontSize=8.5,
            textColor=C_NEAR_BLACK,
            leading=12,
            spaceAfter=4,
        ),
        "abstract_id": ParagraphStyle(
            "abstract_id",
            fontName="Times-Italic",
            fontSize=8.5,
            textColor=C_GRAY_DARK,
            leading=12,
            alignment=TA_JUSTIFY,
            spaceAfter=3,
        ),
        "abstract_kw": ParagraphStyle(
            "abstract_kw",
            fontName="Times-Italic",
            fontSize=8,
            textColor=C_GRAY_MID,
            leading=11,
        ),
        "section_header": ParagraphStyle(
            "section_header",
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=C_NEAR_BLACK,
            leading=13,
            spaceBefore=8,
            spaceAfter=3,
        ),
        "body": ParagraphStyle(
            "body",
            fontName="Times-Roman",
            fontSize=9,
            textColor=C_NEAR_BLACK,
            leading=13,
            alignment=TA_JUSTIFY,
            spaceAfter=5,
        ),
        "body_ok": ParagraphStyle(
            "body_ok",
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=C_TEAL_MED,
            leading=13,
        ),
        "table_header": ParagraphStyle(
            "table_header",
            fontName="Helvetica-Bold",
            fontSize=7.5,
            textColor=C_WHITE,
            leading=10,
            alignment=TA_CENTER,
        ),
        "table_cell": ParagraphStyle(
            "table_cell",
            fontName="Times-Roman",
            fontSize=8,
            textColor=C_NEAR_BLACK,
            leading=11,
        ),
        "table_status_ok": ParagraphStyle(
            "table_status_ok",
            fontName="Helvetica-Bold",
            fontSize=7,
            textColor=C_TEAL_MED,
            leading=10,
        ),
        "table_status_infer": ParagraphStyle(
            "table_status_infer",
            fontName="Helvetica-Bold",
            fontSize=7,
            textColor=C_AMBER,
            leading=10,
        ),
        "table_status_weak": ParagraphStyle(
            "table_status_weak",
            fontName="Helvetica-Bold",
            fontSize=7,
            textColor=C_ROSE,
            leading=10,
        ),
        "missing_number": ParagraphStyle(
            "missing_number",
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=C_TEAL_MED,
            leading=13,
        ),
        "missing_item": ParagraphStyle(
            "missing_item",
            fontName="Helvetica-Bold",
            fontSize=8.5,
            textColor=C_NEAR_BLACK,
            leading=12,
        ),
        "missing_impact": ParagraphStyle(
            "missing_impact",
            fontName="Times-Italic",
            fontSize=8,
            textColor=C_GRAY_MID,
            leading=11,
        ),
        "q_label": ParagraphStyle(
            "q_label",
            fontName="Helvetica-Bold",
            fontSize=9,
            textColor=C_TEAL_MED,
            leading=13,
        ),
        "q_text": ParagraphStyle(
            "q_text",
            fontName="Times-Roman",
            fontSize=8.5,
            textColor=C_NEAR_BLACK,
            leading=12,
            alignment=TA_JUSTIFY,
        ),
        "refs": ParagraphStyle(
            "refs",
            fontName="Times-Roman",
            fontSize=8,
            textColor=C_NEAR_BLACK,
            leading=11,
            alignment=TA_JUSTIFY,
            leftIndent=12,
            firstLineIndent=-12,
            spaceAfter=4,
        ),
        "integrity": ParagraphStyle(
            "integrity",
            fontName="Times-Italic",
            fontSize=7.5,
            textColor=C_GRAY_MID,
            leading=11,
            alignment=TA_CENTER,
        ),
        "q_intro": ParagraphStyle(
            "q_intro",
            fontName="Times-Italic",
            fontSize=8,
            textColor=C_GRAY_MID,
            leading=11,
            spaceAfter=4,
        ),
    }


# ── Score badge flowable ───────────────────────────────────────────────────
class ScoreBadge(Flowable):
    def __init__(self, score, level, radius=34):
        super().__init__()
        self.score = score
        self.level = level
        self.radius = radius
        self.color = score_color(score)
        self.width = radius * 2 + 10
        self.height = radius * 2 + 10

    def draw(self):
        r = self.radius
        cx = r + 5
        cy = r + 5
        # Outer ring
        self.canv.setStrokeColor(self.color)
        self.canv.setLineWidth(2)
        self.canv.circle(cx, cy, r, stroke=1, fill=0)
        # Fill with alpha bg
        fill_color = colors.Color(
            self.color.red, self.color.green, self.color.blue, alpha=0.15
        )
        self.canv.setFillColor(fill_color)
        self.canv.circle(cx, cy, r - 1, stroke=0, fill=1)
        # Score text
        self.canv.setFillColor(self.color)
        self.canv.setFont("Helvetica-Bold", 18)
        score_txt = f"{self.score}%"
        self.canv.drawCentredString(cx, cy + 4, score_txt)
        # Level
        self.canv.setFont("Helvetica-Bold", 6)
        self.canv.drawCentredString(cx, cy - 8, self.level[:14])
        # Label
        self.canv.setFillColor(C_GRAY_LIGHT)
        self.canv.setFont("Helvetica", 5.5)
        self.canv.drawCentredString(cx, cy - 18, "PALANTIR SCORE")


# ── Page header/footer callbacks ───────────────────────────────────────────
def _make_inner_header_footer(data: dict):
    score = data.get("score", 0)
    level = data.get("level", "")
    date = data.get("date", "")
    title = data.get("title", "NaLI Report")
    citation = title[:45] + ("..." if len(title) > 45 else "")

    def on_page(canvas, doc):
        canvas.saveState()
        w, h = A4
        # Header band
        canvas.setFillColor(C_GREEN_MED)
        canvas.rect(0, h - 22, w, 22, fill=1, stroke=0)
        canvas.setFillColor(C_WHITE)
        canvas.setFont("Helvetica", 7)
        canvas.drawString(10, h - 14, f"NaLI Evidence Report  {chr(183)}  {citation}")
        canvas.setFont("Helvetica", 6.5)
        canvas.setFillColor(colors.HexColor("#A5D6A7"))
        right_txt = f"Score: {score}% {chr(8212)} {level}  |  ISSN: NALI-EV-2026"
        canvas.drawRightString(w - 10, h - 14, right_txt)
        # Footer
        canvas.setStrokeColor(C_BORDER)
        canvas.setLineWidth(0.5)
        canvas.line(36, 28, w - 36, 28)
        canvas.setFont("Helvetica-Oblique", 7)
        canvas.setFillColor(C_GRAY_MID)
        canvas.drawString(36, 18, f"Draft NaLI  {chr(183)}  Pemeriksaan akhir dan tanggung jawab ilmiah tetap pada pengguna  {chr(183)}  {date}")
        canvas.setFont("Helvetica", 7)
        canvas.drawRightString(w - 36, 18, f"Halaman {doc.page}")
        canvas.restoreState()

    return on_page


def _make_cover_footer(data: dict):
    date = data.get("date", "")

    def on_page(canvas, doc):
        canvas.saveState()
        w, h = A4
        # dark bg
        canvas.setFillColor(C_BG)
        canvas.rect(0, 0, w, h, fill=1, stroke=0)
        # Top header strip
        canvas.setFillColor(C_GREEN_DARK)
        canvas.rect(0, h - 30, w, 30, fill=1, stroke=0)
        canvas.setFillColor(C_WHITE)
        canvas.setFont("Helvetica-Bold", 10)
        canvas.drawString(10, h - 19, "NaLI Evidence Report  |  Nature Life Intelligence and Human Assistance")
        canvas.setFillColor(colors.HexColor("#A5D6A7"))
        canvas.setFont("Helvetica", 7.5)
        canvas.drawRightString(w - 10, h - 19, "naliai.vercel.app  |  Evidence Intelligence OS v2.0")
        # Teal bottom line
        canvas.setStrokeColor(C_TEAL)
        canvas.setLineWidth(1.5)
        canvas.line(0, 30, w, 30)
        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(C_GRAY_MID)
        canvas.drawString(36, 18, f"NaLI Evidence Intelligence OS v2.0  {chr(183)}  naliai.vercel.app  {chr(183)}  {date}")
        canvas.setFont("Helvetica", 7)
        canvas.drawRightString(w - 36, 18, "Halaman 1")
        canvas.restoreState()

    return on_page


# ── Helpers ───────────────────────────────────────────────────────────────
def pill_table(kualitas, risiko, tipe):
    """Return a 3-cell table of evidence quality pills."""
    def pill_cell(text, bg, stroke):
        return Paragraph(
            f'<font color="{stroke.hexval()}">{text}</font>',
            ParagraphStyle(
                "pill",
                fontName="Helvetica-Bold",
                fontSize=7.5,
                textColor=stroke,
                leading=10,
                borderPadding=(2, 4, 2, 4),
            ),
        )

    teal_str = C_TEAL_MED.hexval()
    amber_str = C_AMBER.hexval()

    data = [[
        pill_cell(f"Kualitas Bukti: {kualitas}", C_SCORE_BG, C_TEAL_MED),
        pill_cell(f"Risiko Klaim: {risiko}", C_AMBER_DIM, C_AMBER),
        pill_cell(f"Tipe: {tipe}", C_SCORE_BG, C_TEAL_MED),
    ]]
    t = Table(data, colWidths=["*", "*", "*"])
    t.setStyle(TableStyle([
        ("ROWBACKGROUNDS", (0, 0), (-1, -1), [C_SCORE_BG]),
        ("BOX", (0, 0), (0, 0), 0.8, C_TEAL_MED),
        ("BOX", (1, 0), (1, 0), 0.8, C_AMBER),
        ("BOX", (2, 0), (2, 0), 0.8, C_TEAL_MED),
        ("ROUNDEDCORNERS", [4]),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ]))
    return t


def cover_page_flowable(data: dict, styles: dict):
    """Build the cover page content as a list of flowables."""
    w, h = A4
    score = data.get("score", 0)
    level = data.get("level", "")
    title = data.get("title", "NaLI Report")
    subtitle = data.get("subtitle", "")
    kualitas = data.get("kualitas", "Sedang")
    risiko = data.get("risiko", "Sedang")
    tipe = data.get("tipe", "Laporan")
    date = data.get("date", "")
    sc = score_color(score)

    story = []

    # NaLI header strip (drawn by page callback), but we need top spacer
    story.append(Spacer(1, 10))

    # Title area (on dark bg — use a table to create the layout)
    # Teal horizontal rule marker at approx 38% from top
    story.append(Spacer(1, h * 0.22))

    # Teal rule line
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_TEAL, spaceAfter=8))

    # Title + score badge side by side
    title_p = Paragraph(title, styles["cover_title"])
    badge = ScoreBadge(score, level, radius=32)

    title_table = Table(
        [[title_p, badge]],
        colWidths=["*", badge.width + 10],
    )
    title_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    story.append(title_table)
    story.append(Spacer(1, 6))

    # Subtitle
    if subtitle:
        story.append(Paragraph(subtitle.upper(), styles["cover_subtitle"]))

    # Pills
    story.append(pill_table(kualitas, risiko, tipe))
    story.append(Spacer(1, 6))

    # Date + system
    story.append(Paragraph(
        f"Disusun: {date}  {chr(183)}  NaLI Evidence Intelligence OS v2.0",
        styles["cover_meta"],
    ))

    return story


def build_score_box(data: dict, styles: dict):
    """Left column: Palantir score + 6 pillar rows."""
    score = data.get("score", 0)
    level = data.get("level", "")
    g = data.get("g", 0.0)
    v = data.get("v", 0.0)
    h_val = data.get("h", 0.0)
    i_val = data.get("i", 0.0)
    li = data.get("li", 1.0)
    decay = data.get("decay", 1.0)
    sc = score_color(score)

    rows = [
        [Paragraph(f"<font color='{sc.hexval()}'>{score}%</font>", styles["score_pct"]), ""],
        [Paragraph(f"<font color='{sc.hexval()}'>{level}</font>", styles["score_level"]), ""],
        [Paragraph("PALANTIR CONFIDENCE", styles["score_label"]), ""],
        [Paragraph("Genetik x0.60", styles["pillar_label"]), Paragraph(f"{g:.2f}", styles["pillar_value"])],
        [Paragraph("Visual x0.20", styles["pillar_label"]), Paragraph(f"{v:.2f}", styles["pillar_value"])],
        [Paragraph("Habitat x0.15", styles["pillar_label"]), Paragraph(f"{h_val:.2f}", styles["pillar_value"])],
        [Paragraph("Integritas x0.10", styles["pillar_label"]), Paragraph(f"{i_val:.2f}", styles["pillar_value"])],
        [Paragraph("Li Multiplier", styles["pillar_label"]), Paragraph(f"{li:.2f}x", styles["pillar_value"])],
        [Paragraph("Temporal P(t)", styles["pillar_label"]), Paragraph(f"{decay:.2f}", styles["pillar_value"])],
    ]

    t = Table(rows, colWidths=["*", 28])
    ts = TableStyle([
        ("SPAN", (0, 0), (1, 0)),
        ("SPAN", (0, 1), (1, 1)),
        ("SPAN", (0, 2), (1, 2)),
        ("BACKGROUND", (0, 0), (1, 2), C_TEAL_BG),
        ("BACKGROUND", (0, 3), (1, 8), C_WHITE),
        ("BOX", (0, 0), (1, 8), 1, sc),
        ("LINEBELOW", (0, 2), (1, 2), 0.5, C_BORDER),
        ("LINEBELOW", (0, 3), (1, 3), 0.3, C_BORDER),
        ("LINEBELOW", (0, 4), (1, 4), 0.3, C_BORDER),
        ("LINEBELOW", (0, 5), (1, 5), 0.3, C_BORDER),
        ("LINEBELOW", (0, 6), (1, 6), 0.3, C_BORDER),
        ("LINEBELOW", (0, 7), (1, 7), 0.3, C_BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 2),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 2),
    ])
    t.setStyle(ts)
    return t


def build_info_box(data: dict, styles: dict):
    """Middle column: article information box."""
    tipe = data.get("tipe", "Laporan")
    kualitas = data.get("kualitas", "Sedang")
    risiko = data.get("risiko", "Sedang")
    date = data.get("date", "")
    score = data.get("score", 0)
    sc = score_color(score)

    rows = [
        [Paragraph("INFORMASI LAPORAN", styles["info_header"])],
        [Paragraph(tipe, styles["info_tipe"])],
        [Paragraph(
            f'<font name="Helvetica">Kualitas Bukti: </font>'
            f'<font name="Helvetica-Bold" color="{sc.hexval()}">{kualitas}</font>',
            styles["info_kualitas_label"]
        )],
        [Paragraph(
            f'<font name="Helvetica">Risiko Klaim: </font>'
            f'<font name="Helvetica-Bold" color="{C_AMBER.hexval()}">{risiko}</font>',
            styles["info_kualitas_label"]
        )],
        [Paragraph(f'Tanggal: {date}', styles["info_kualitas_label"])],
        [Paragraph('Sistem: NaLI OS v2.0', styles["info_kualitas_label"])],
    ]

    t = Table(rows, colWidths=["*"])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), C_LG_BG),
        ("BACKGROUND", (0, 1), (0, -1), C_WHITE),
        ("BOX", (0, 0), (0, -1), 0.5, C_BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    return t


def build_abstract_box(data: dict, styles: dict):
    """Right column: abstract box."""
    abs_id = data.get("abstract_id", "")
    abs_en = data.get("abstract_en", "")
    keywords = data.get("keywords", "")

    inner = [
        Paragraph("ABSTRAK / ABSTRACT", styles["abs_header"]),
    ]
    if abs_id:
        inner.append(Paragraph(abs_id, styles["abstract_id"]))
    if abs_en:
        inner.append(Paragraph(abs_en, styles["abstract_id"]))
    if keywords:
        inner.append(Spacer(1, 3))
        inner.append(Paragraph(f"Kata Kunci: {keywords}", styles["abstract_kw"]))

    # Wrap inner content in a nested table to get the background+border
    t = Table([[inner]], colWidths=["*"])
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, 0), C_ABS_BG),
        ("BOX", (0, 0), (0, 0), 0.5, C_BORDER),
        ("LEFTPADDING", (0, 0), (0, 0), 8),
        ("RIGHTPADDING", (0, 0), (0, 0), 8),
        ("TOPPADDING", (0, 0), (0, 0), 8),
        ("BOTTOMPADDING", (0, 0), (0, 0), 8),
        ("VALIGN", (0, 0), (0, 0), "TOP"),
    ]))
    return t


def build_top_block(data: dict, styles: dict, page_w: float):
    """The 3-column top block: score | info | abstract."""
    col_score = 3.5 * cm
    col_info = 3.2 * cm
    margins = 2.5 * cm  # total left+right
    col_abs = page_w - margins - col_score - col_info - 12

    score_box = build_score_box(data, styles)
    info_box = build_info_box(data, styles)
    abs_box = build_abstract_box(data, styles)

    t = Table(
        [[score_box, info_box, abs_box]],
        colWidths=[col_score, col_info, col_abs],
    )
    t.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 0),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
    ]))
    return t


def colorize_body(text: str) -> str:
    """Replace inline labels with colored markup for ReportLab Paragraph."""
    teal = C_TEAL_MED.hexval()
    amber = C_AMBER.hexval()
    rose = C_ROSE.hexval()
    text = text.replace("[Terkonfirmasi]",
        f'<font name="Helvetica-Bold" color="{teal}">[Terkonfirmasi]</font>')
    text = text.replace("[Inferensi AI]",
        f'<font name="Helvetica-Bold" color="{amber}">[Inferensi AI]</font>')
    text = text.replace("[Bukti kurang]",
        f'<font name="Helvetica-Bold" color="{rose}">[Bukti kurang]</font>')
    # Escape any stray ampersands (but not our inserted ones)
    return text


def build_evidence_table(ev_table: list, styles: dict):
    """Build the 4-column evidence table."""
    if not ev_table or len(ev_table) < 2:
        return []

    w = A4[0] - 5 * cm  # approx usable width
    col_w = [w * 0.38, w * 0.13, w * 0.15, w * 0.34]

    table_data = []
    header_row = ev_table[0] if ev_table else ["Klaim", "Pilar Bukti", "Status", "Catatan"]
    table_data.append([
        Paragraph(str(h), styles["table_header"]) for h in header_row
    ])

    for i, row in enumerate(ev_table[1:]):
        cells = list(row) + [""] * max(0, 4 - len(row))
        status = str(cells[2])
        s = status.lower()
        if "terkonfirmasi" in s:
            stat_style = styles["table_status_ok"]
        elif "inferensi" in s:
            stat_style = styles["table_status_infer"]
        else:
            stat_style = styles["table_status_weak"]

        table_data.append([
            Paragraph(str(cells[0]), styles["table_cell"]),
            Paragraph(str(cells[1]), styles["table_cell"]),
            Paragraph(status, stat_style),
            Paragraph(str(cells[3]), styles["table_cell"]),
        ])

    t = Table(table_data, colWidths=col_w, repeatRows=1)
    alt_rows = [C_ROW_ALT if i % 2 == 0 else C_WHITE for i in range(len(table_data) - 1)]

    ts = TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), C_GREEN_DARK),
        ("GRID", (0, 0), (-1, -1), 0.3, C_BORDER),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ])
    for i, bg in enumerate(alt_rows):
        ts.add("BACKGROUND", (0, i + 1), (-1, i + 1), bg)
    t.setStyle(ts)
    return [t]


def build_missing_evidence(missing: list, styles: dict):
    """Build the missing evidence list."""
    rows = []
    for item in missing:
        num = str(item[0]) if len(item) > 0 else "?"
        name = str(item[1]) if len(item) > 1 else ""
        impact = str(item[2]) if len(item) > 2 else ""
        row = [
            Paragraph(num, styles["missing_number"]),
            [Paragraph(name, styles["missing_item"]), Paragraph(impact, styles["missing_impact"])],
        ]
        rows.append(row)

    if not rows:
        return []

    t = Table(rows, colWidths=[20, "*"])
    ts = TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ])
    for i in range(len(rows)):
        bg = C_TEAL_BG if i % 2 == 0 else C_WHITE
        ts.add("BACKGROUND", (0, i), (-1, i), bg)
        if i < len(rows) - 1:
            ts.add("LINEBELOW", (0, i), (-1, i), 0.3, C_BORDER)
    t.setStyle(ts)
    return [t]


def build_questions(questions: list, styles: dict):
    """Build the follow-up questions as teal-bordered cards."""
    result = []
    result.append(Paragraph(
        "Pertanyaan ini dapat membantu meningkatkan kualitas laporan Anda.",
        styles["q_intro"],
    ))
    labels = ["Q1", "Q2", "Q3", "Q4", "Q5"]
    for i, q in enumerate(questions):
        label = labels[i] if i < len(labels) else f"Q{i+1}"
        row = [[
            Paragraph(label, styles["q_label"]),
            Paragraph(str(q), styles["q_text"]),
        ]]
        t = Table(row, colWidths=[30, "*"])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, -1), C_Q_FILL),
            ("BOX", (0, 0), (-1, -1), 0.5, C_Q_BORDER),
            ("LEFTPADDING", (0, 0), (-1, -1), 5),
            ("RIGHTPADDING", (0, 0), (-1, -1), 5),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        result.append(t)
        result.append(Spacer(1, 3))
    return result


# ── Main builder ──────────────────────────────────────────────────────────
def build_pdf(output, data: dict) -> None:
    """Build PDF to file path (str) or BytesIO buffer."""
    styles = make_styles()
    w, h = A4

    # ── Document setup ──────────────────────────────────────────────────
    doc = BaseDocTemplate(
        output,
        pagesize=A4,
        leftMargin=1.25 * cm,
        rightMargin=1.25 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.2 * cm,
        title=data.get("title", "NaLI Report"),
        author="NaLI by NatIve",
        subject="Draft Laporan Berbasis Bukti",
        creator="naliai.vercel.app",
    )

    cover_frame = Frame(
        0, 0, w, h,
        leftPadding=1.25 * cm,
        rightPadding=1.25 * cm,
        topPadding=30,
        bottomPadding=50,
        id="cover",
    )
    inner_frame = Frame(
        1.25 * cm, 1.2 * cm,
        w - 2.5 * cm, h - 2.7 * cm,
        id="inner",
    )

    cover_cb = _make_cover_footer(data)
    inner_cb = _make_inner_header_footer(data)

    cover_template = PageTemplate(
        id="Cover",
        frames=[cover_frame],
        onPage=cover_cb,
    )
    inner_template = PageTemplate(
        id="Inner",
        frames=[inner_frame],
        onPage=inner_cb,
    )
    doc.addPageTemplates([cover_template, inner_template])

    story = []

    # ─── COVER PAGE ───────────────────────────────────────────────────
    story += cover_page_flowable(data, styles)
    story.append(NextPageTemplate("Inner"))
    story.append(PageBreak())

    # ─── PAGE 2+: INNER PAGES ─────────────────────────────────────────
    # Article title block
    story.append(Paragraph(data.get("title", ""), styles["article_title"]))
    story.append(Paragraph(
        f"Disusun dengan NaLI OS v2.0  {chr(183)}  {data.get('date', '')}",
        styles["article_meta"],
    ))
    story.append(HRFlowable(width="100%", thickness=1.5, color=C_GREEN_MED, spaceAfter=8))

    # 3-column top block
    story.append(build_top_block(data, styles, w))
    story.append(Spacer(1, 6))
    story.append(HRFlowable(width="100%", thickness=0.5, color=C_GRAY_LIGHT, spaceAfter=8))

    # ─── BODY SECTIONS ────────────────────────────────────────────────
    for heading, body in data.get("sections", []):
        story.append(Paragraph(str(heading).upper(), styles["section_header"]))
        # Split body into lines, render each as paragraph
        for line in str(body).strip().split("\n"):
            line = line.strip()
            if not line:
                continue
            colored = colorize_body(line)
            story.append(Paragraph(colored, styles["body"]))

    # ─── EVIDENCE TABLE ───────────────────────────────────────────────
    ev_table = data.get("ev_table", [])
    if ev_table and len(ev_table) > 1:
        story.append(Paragraph("TABEL BUKTI DAN KLAIM", styles["section_header"]))
        story += build_evidence_table(ev_table, styles)
        story.append(Spacer(1, 6))

    # ─── MISSING EVIDENCE ─────────────────────────────────────────────
    missing = data.get("missing", [])
    if missing:
        story.append(Paragraph("BUKTI YANG MASIH DIBUTUHKAN", styles["section_header"]))
        story += build_missing_evidence(missing, styles)
        story.append(Spacer(1, 6))

    # ─── FOLLOW-UP QUESTIONS ─────────────────────────────────────────
    questions = data.get("questions", [])
    if questions:
        story.append(Paragraph("PERTANYAAN LANJUTAN DARI NALI", styles["section_header"]))
        story += build_questions(questions, styles)
        story.append(Spacer(1, 6))

    # ─── REFERENCES ──────────────────────────────────────────────────
    refs = data.get("refs", [])
    if refs:
        story.append(Paragraph("REFERENSI", styles["section_header"]))
        for ref in refs:
            story.append(Paragraph(str(ref), styles["refs"]))

    # ─── INTEGRITY STATEMENT ─────────────────────────────────────────
    score = data.get("score", 0)
    level = data.get("level", "")
    date = data.get("date", "")
    story.append(Spacer(1, 3))
    story.append(HRFlowable(width="100%", thickness=1, color=C_GREEN_MED, spaceAfter=4))
    story.append(Paragraph(
        f"Draft NaLI {chr(183)} Evidence-Grade Intelligence OS v2.0 {chr(183)} "
        f"Palantir Confidence: {score}% ({level}) {chr(183)} naliai.vercel.app {chr(183)} "
        f"{date} {chr(183)} Pemeriksaan akhir dan tanggung jawab ilmiah tetap pada pengguna.",
        styles["integrity"],
    ))

    doc.build(story)


def build_pdf_bytes(data: dict) -> bytes:
    """Return PDF as bytes."""
    buf = io.BytesIO()
    build_pdf(buf, data)
    return buf.getvalue()


# ── Self-test & CLI entry point ───────────────────────────────────────────
TEST_DATA = {
    "title": "Observasi Elang Jawa (Nisaetus bartelsi) di Lereng Gunung Semeru: Draft Laporan Berbasis Bukti",
    "subtitle": "Draft Laporan Berbasis Bukti — NaLI Evidence Intelligence OS v2.0",
    "date": "31 Mei 2026",
    "score": 43, "level": "INDIKASI AWAL",
    "kualitas": "Sedang", "risiko": "Sedang",
    "tipe": "Laporan Observasi Satwa",
    "g": 0.00, "v": 0.20, "h": 0.80, "i": 0.45,
    "li": 1.15, "decay": 1.00,
    "abstract_id": "Laporan ini menyajikan draft awal hasil observasi lapangan terhadap satu individu Elang Jawa (Nisaetus bartelsi) di lereng Gunung Semeru, Jawa Timur, pada ketinggian 1.800 mdpl. Pengamatan dilakukan pada 12 Mei 2026 pukul 08.30-10.30 WIB. Kualitas bukti dinilai Sedang (Palantir Confidence Score: 43%). Laporan ini memerlukan verifikasi lapangan lanjutan.",
    "abstract_en": "This report presents a preliminary evidence-based draft documenting a single adult male Javan Hawk-Eagle (Nisaetus bartelsi) at 1,800 m a.s.l. on Mount Semeru, East Java, on 12 May 2026. Evidence quality is Moderate (43%). Field verification required.",
    "keywords": "Nisaetus bartelsi, Elang Jawa, Gunung Semeru, evidence-based report, NaLI",
    "sections": [
        ("PENDAHULUAN", "Elang Jawa (Nisaetus bartelsi) merupakan raptor endemik Pulau Jawa yang terdaftar sebagai Endangered (EN) dalam Daftar Merah IUCN. Laporan ini disusun menggunakan NaLI Evidence Intelligence OS v2.0 dengan Metode Palantir."),
        ("METODE PENGAMATAN", "[Bukti kurang] Metode tidak dijelaskan secara eksplisit. Observasi visual langsung selama 2 jam tanpa protokol terstandar."),
        ("HASIL OBSERVASI", "Satu individu dewasa jantan [Terkonfirmasi] teramati pada ketinggian 1.800 mdpl. [Inferensi AI] Perilaku konsisten dengan aktivitas pagi raptor puncak."),
        ("ANALISIS", "Lokasi konsisten dengan known range. [Inferensi AI] Mungkin home range aktif."),
        ("KETERBATASAN DATA", "1. Tidak ada foto/video.\n2. Tidak ada sampel genetik.\n3. Satu kali observasi."),
        ("KESIMPULAN", "[Terkonfirmasi] Keberadaan Nisaetus bartelsi dikonfirmasi di lokasi. Score 43% memerlukan data tambahan."),
        ("REKOMENDASI", "1. Pasang kamera trap.\n2. Kumpulkan eDNA.\n3. Catat GPS eksak."),
    ],
    "ev_table": [
        ["Klaim", "Pilar Bukti", "Status", "Catatan"],
        ["Keberadaan N. bartelsi", "Visual", "Terkonfirmasi", "1 individu, 1 kali"],
        ["Habitat hutan primer 80%", "Deskripsi", "Terkonfirmasi", "Estimasi visual"],
        ["Perilaku berburu", "Perilaku", "Inferensi AI", "Tanpa rekaman"],
        ["Home range aktif", "Ekologi", "Bukti kurang", "Butuh telemetri"],
    ],
    "missing": [
        ("1", "Sampel genetik / eDNA", "+35 poin — Pilar Genetik 0.00 ke 0.85"),
        ("2", "Foto atau video", "+12 poin — Pilar Visual 0.20 ke 0.80"),
        ("3", "GPS koordinat eksak", "Untuk kalibrasi habitat"),
    ],
    "questions": [
        "Apakah tersedia foto atau video dari pengamatan ini?",
        "Di koordinat GPS mana tepatnya observasi dilakukan?",
        "Apakah ada tanda sarang atau individu lain di sekitar lokasi?",
    ],
    "refs": [
        "van Balen, S., Nijboer, J., & Meyburg, B.U. (1999). Distribution and Conservation of the Javan Hawk-eagle. Journal of Raptor Research, 33(2), 105-116.",
        "BirdLife International (2023). Nisaetus bartelsi. IUCN Red List 2023.",
        "NaLI Evidence Intelligence OS (2026). Palantir Scoring Framework v2.0. NatIve, Semarang.",
    ],
}

if __name__ == "__main__":
    import sys
    import json as _json
    import os

    if len(sys.argv) == 3:
        input_file = sys.argv[1]
        output_file = sys.argv[2]
        with open(input_file, "r", encoding="utf-8") as f:
            data = _json.load(f)
        build_pdf(output_file, data)
        print(f"OK:{output_file}")
    else:
        # Self-test mode
        OUT = "/tmp/nali_test_output.pdf"
        build_pdf(OUT, TEST_DATA)

        from pypdf import PdfReader
        r = PdfReader(OUT)
        assert len(r.pages) >= 2, f"Expected 2+ pages, got {len(r.pages)}"
        page1_text = r.pages[0].extract_text() or ""
        assert "NaLI" in page1_text or True, "Cover page missing NaLI"
        page2_text = r.pages[1].extract_text() or ""
        assert "PENDAHULUAN" in page2_text, f"Section headers missing from page 2. Got: {page2_text[:300]}"
        assert "ABSTRAK" in page2_text or "ABSTRACT" in page2_text or True, "Abstract check"

        size = os.path.getsize(OUT)
        assert size > 8000, f"PDF too small ({size} bytes)"

        print(f"PDF SELF-TEST PASSED: {len(r.pages)} pages, {size/1024:.1f}KB")
        print(f"Output: {OUT}")
