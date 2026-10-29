"""Draft route card with the field and row structure of GOST 3.1118-82, form 1."""

from decimal import Decimal
from html import escape
from io import BytesIO
from pathlib import Path
import os

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import KeepTogether, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


STANDARD = "ГОСТ 3.1118-82"
STANDARD_URL = "https://protect.gost.ru/gost/details/11e71aab-c940-4221-97e1-498eb2563f31"


def _number(value):
    return "" if value is None else str(value).replace(".", ",")


def _minutes(hours):
    return _number((hours * Decimal("60")).quantize(Decimal("0.01")))


def route_card_data(product, item=None):
    if item is not None and item.product_id != product.pk:
        raise ValueError("Позиция заказа относится к другому изделию")
    operations = list(product.route.select_related(
        "work_center__department", "equipment", "definition", "cutting_norm"
    ).order_by("number"))
    gaps = []
    if not product.drawing:
        gaps.append("обозначение изделия по чертежу")
    if not product.material_specification:
        gaps.append("материал М01")
    if not product.material_code:
        gaps.append("код материала М02")
    if product.part_mass_kg is None:
        gaps.append("масса детали МД")
    if product.material_consumption_kg is None:
        gaps.append("норма расхода материала")
    if not product.blank_type or not product.blank_dimensions or product.blank_mass_kg is None:
        gaps.append("вид, размеры и масса заготовки")
    if item is None:
        gaps.append("объём партии ОП (выберите позицию заказа)")
    if not operations:
        gaps.append("операции маршрута")
    if product.kind == "assembly" or any(op.kind == "assembly" for op in operations):
        gaps.append("для сборочного процесса требуется отдельная форма 2")

    kim = ""
    if product.part_mass_kg is not None and product.blank_mass_kg:
        kim = _number((product.part_mass_kg / product.blank_mass_kg).quantize(Decimal("0.001")))
    material = {
        "m01": product.material_specification,
        "code": product.material_code,
        "unit": product.unit,
        "part_mass": _number(product.part_mass_kg),
        "consumption": _number(product.material_consumption_kg),
        "kim": kim,
        "blank_type": product.blank_type,
        "blank_dimensions": product.blank_dimensions,
        "parts_per_blank": product.parts_per_blank,
        "blank_mass": _number(product.blank_mass_kg),
    }
    rows = []
    for op in operations:
        equipment = op.equipment or (op.definition.equipment if op.definition_id else None)
        norm = getattr(op, "cutting_norm", None)
        tooling = op.tooling.strip() or (norm.tool if norm and norm.approved else "")
        if not op.shop_code or not op.section_code or not op.workplace_code:
            gaps.append(f"коды цеха, участка и рабочего места операции {op.number}")
        if not equipment:
            gaps.append(f"оборудование операции {op.number}")
        if not op.operation_text.strip():
            gaps.append(f"содержание операции {op.number}")
        if not op.approved:
            gaps.append(f"утверждение операции {op.number}")
        equipment_label = ""
        if equipment:
            equipment_label = "; ".join(part for part in (
                equipment.name, equipment.inventory_number
            ) if part)
        rows.append({
            "a": [
                op.shop_code, op.section_code, op.workplace_code,
                f"{op.number:03d}",
                "; ".join(part for part in (
                    op.definition.code if op.definition_id else "", op.name
                ) if part),
                op.document_refs,
            ],
            "b": [
                equipment_label, op.profession_code,
                op.definition.min_grade if op.definition_id else "",
                op.worker_count, op.simultaneous_quantity, "1",
                item.quantity if item else "", _minutes(op.setup_hours),
                _minutes(op.effective_piece_hours),
            ],
            "o": op.operation_text.strip() or op.name,
            "t": tooling,
        })
    return {
        "standard": STANDARD,
        "product": product,
        "item": item,
        "material": material,
        "operations": rows,
        "gaps": gaps,
    }


def _font():
    if "ESTD" in pdfmetrics.getRegisteredFontNames():
        return "ESTD"
    candidates = ([Path(os.environ["AVT_PDF_FONT"])] if os.environ.get("AVT_PDF_FONT") else []) + [
        Path("C:/Windows/Fonts/arial.ttf"),
        Path("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
        Path("/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf"),
    ]
    source = next((path for path in candidates if path.is_file()), None)
    if source is None:
        raise RuntimeError("Для печати ЕСТД нужен шрифт Arial или DejaVu Sans")
    pdfmetrics.registerFont(TTFont("ESTD", str(source)))
    return "ESTD"


def render_route_card(card):
    """Render a draft: no signature or enterprise norm-control is implied."""
    output = BytesIO()
    font = _font()
    doc = SimpleDocTemplate(
        output, pagesize=landscape(A4), leftMargin=12 * mm, rightMargin=12 * mm,
        topMargin=18 * mm, bottomMargin=16 * mm,
        title=f"Маршрутная карта - {card['product'].name}",
    )
    width = doc.width
    normal = ParagraphStyle("ESTD normal", fontName=font, fontSize=7.6, leading=10)
    small = ParagraphStyle("ESTD small", parent=normal, fontSize=6.6, leading=8.5)
    heading = ParagraphStyle("ESTD heading", parent=normal, fontSize=12, leading=15)

    def cell(value, style=normal):
        return Paragraph(escape(str(value if value is not None else "")).replace("\n", "<br/>") or "&#160;", style)

    def grid(data, widths, header=False):
        table = Table([[cell(value, small if index == 0 else normal) for index, value in enumerate(row)]
                       for row in data], colWidths=widths, hAlign="LEFT")
        commands = [
            ("GRID", (0, 0), (-1, -1), 0.35, colors.black),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("LEFTPADDING", (0, 0), (-1, -1), 4),
            ("RIGHTPADDING", (0, 0), (-1, -1), 4),
            ("TOPPADDING", (0, 0), (-1, -1), 3),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
        ]
        if header:
            commands.append(("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e6e6e6")))
        table.setStyle(TableStyle(commands))
        return table

    story = [
        grid([["МАРШРУТНАЯ КАРТА (проект)", "Структура формы 1 · ГОСТ 3.1118-82"]],
             [width * 0.65, width * 0.35]),
        Spacer(1, 5),
        grid([
            ["Наименование изделия", "Обозначение по чертежу", "Заказ", "Объём партии, шт."],
            [card["product"].name, card["product"].drawing,
             card["item"].order.number if card["item"] else "",
             card["item"].quantity if card["item"] else ""],
        ], [width * 0.37, width * 0.31, width * 0.20, width * 0.12], header=True),
        Spacer(1, 5),
    ]
    if card["gaps"]:
        story.append(cell("Черновик: необходимо заполнить: " + "; ".join(card["gaps"]), small))
        story.append(Spacer(1, 5))
    material = card["material"]
    story.extend([
        grid([["М01", material["m01"] or "Материал не указан"]], [36, width - 36]),
        grid([
            ["М02", "Код", "ЕВ", "МД, кг", "ЕН", "Н. расх., кг", "КИМ", "Вид загот.", "Профиль и размеры", "КД", "МЗ, кг"],
            ["", material["code"], material["unit"], material["part_mass"], "1",
             material["consumption"], material["kim"], material["blank_type"],
             material["blank_dimensions"], material["parts_per_blank"], material["blank_mass"]],
            ],
            [36, 70, 34, 55, 32, 70, 42, 90, width - 36 - 70 - 34 - 55 - 32 - 70 - 42 - 90 - 43 - 52, 43, 52],
            header=True),
        Spacer(1, 7),
    ])
    a_widths = [36, 49, 49, 49, 48, width * 0.37, width - 36 - 49 * 3 - 48 - width * 0.37]
    b_widths = [36, width - 409, 52, 33, 38, 43, 32, 45, 65, 65]
    for index, operation in enumerate(card["operations"], 1):
        a = operation["a"]
        b = operation["b"]
        story.append(KeepTogether([
            grid([["А", "Цех", "Уч.", "РМ", "Опер.", "Код, наименование операции", "Обозначение документа"],
                  [f"А{index * 4 - 1:02d}", *a]], a_widths, header=True),
            grid([["Б", "Код, наименование оборудования", "Проф.", "Р", "КР", "КОИД", "ЕН", "ОП", "Тпз, мин", "Тшт, мин"],
                  [f"Б{index * 4:02d}", *b]], b_widths, header=True),
            grid([[f"О{index * 4 + 1:02d}", operation["o"]]], [36, width - 36]),
            grid([[f"Т{index * 4 + 2:02d}", operation["t"]]], [36, width - 36]),
            Spacer(1, 7),
        ]))
    if not card["operations"]:
        story.append(cell("Операции технологического маршрута не заданы."))

    def page_footer(canvas, document):
        canvas.saveState()
        canvas.setFont(font, 7)
        canvas.drawString(12 * mm, 9 * mm, "Проект ЕСТД. Электронные подписи и нормоконтроль не оформлены.")
        canvas.drawRightString(landscape(A4)[0] - 12 * mm, 9 * mm, f"Лист {document.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=page_footer, onLaterPages=page_footer)
    output.seek(0)
    return output
