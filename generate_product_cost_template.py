"""Generate an Excel template for calculating product costs."""

import openpyxl
from openpyxl.styles import (
    Alignment,
    Border,
    Font,
    PatternFill,
    Side,
    numbers,
)
from openpyxl.utils import get_column_letter

OUTPUT_FILE = "product_cost_template.xlsx"

# ── colour palette ──────────────────────────────────────────────────────
DARK_BLUE = "1F4E79"
MID_BLUE = "2E75B6"
LIGHT_BLUE = "D6E4F0"
LIGHT_GREY = "F2F2F2"
WHITE = "FFFFFF"
GREEN_ACCENT = "548235"
ORANGE_ACCENT = "ED7D31"
DARK_GREY = "404040"

# ── reusable style objects ──────────────────────────────────────────────
header_font = Font(name="Calibri", bold=True, size=12, color=WHITE)
section_font = Font(name="Calibri", bold=True, size=11, color=WHITE)
label_font = Font(name="Calibri", size=11, color=DARK_GREY)
input_font = Font(name="Calibri", size=11, color=DARK_BLUE)
result_font = Font(name="Calibri", bold=True, size=11, color=WHITE)
title_font = Font(name="Calibri", bold=True, size=16, color=DARK_BLUE)

header_fill = PatternFill("solid", fgColor=DARK_BLUE)
section_fill = PatternFill("solid", fgColor=MID_BLUE)
input_fill = PatternFill("solid", fgColor=LIGHT_BLUE)
row_alt_fill = PatternFill("solid", fgColor=LIGHT_GREY)
result_fill = PatternFill("solid", fgColor=GREEN_ACCENT)
total_fill = PatternFill("solid", fgColor=ORANGE_ACCENT)

thin_side = Side(style="thin", color="B4B4B4")
thin_border = Border(top=thin_side, bottom=thin_side, left=thin_side, right=thin_side)

currency_fmt = '#,##0.00'
pct_fmt = '0.00%'
qty_fmt = '#,##0'


def _style_range(ws, row, cols, font, fill, border=thin_border, align=None):
    """Apply styles to a range of cells in a row."""
    if align is None:
        align = Alignment(vertical="center")
    for c in cols:
        cell = ws.cell(row=row, column=c)
        cell.font = font
        cell.fill = fill
        cell.border = border
        cell.alignment = align


def _section_header(ws, row, text, col_start=2, col_end=6):
    """Write a section header spanning several columns."""
    ws.merge_cells(
        start_row=row, start_column=col_start, end_row=row, end_column=col_end
    )
    cell = ws.cell(row=row, column=col_start, value=text)
    cell.font = section_font
    cell.fill = section_fill
    cell.alignment = Alignment(horizontal="left", vertical="center")
    cell.border = thin_border
    for c in range(col_start + 1, col_end + 1):
        ws.cell(row=row, column=c).fill = section_fill
        ws.cell(row=row, column=c).border = thin_border
    ws.row_dimensions[row].height = 28


def _label_row(ws, row, label, unit="", has_input=True, col_val=4, col_unit=5):
    """Write a label row with an input cell and optional unit."""
    ws.cell(row=row, column=2, value=label).font = label_font
    ws.cell(row=row, column=2).border = thin_border
    ws.cell(row=row, column=2).alignment = Alignment(
        horizontal="left", vertical="center", indent=1
    )
    ws.merge_cells(start_row=row, start_column=2, end_row=row, end_column=3)
    ws.cell(row=row, column=3).border = thin_border

    val_cell = ws.cell(row=row, column=col_val)
    val_cell.border = thin_border
    val_cell.number_format = currency_fmt
    if has_input:
        val_cell.fill = input_fill
        val_cell.font = input_font

    if unit:
        ws.merge_cells(start_row=row, start_column=col_unit, end_row=row, end_column=6)
        ws.cell(row=row, column=col_unit, value=unit).font = Font(
            name="Calibri", size=10, italic=True, color="808080"
        )
        ws.cell(row=row, column=col_unit).border = thin_border
        ws.cell(row=row, column=col_unit).alignment = Alignment(
            horizontal="left", vertical="center", indent=1
        )
        ws.cell(row=row, column=6).border = thin_border

    # alternate row shading (on non-input columns)
    if row % 2 == 0:
        for c in [2, 3, 5, 6]:
            cell = ws.cell(row=row, column=c)
            if not cell.fill or cell.fill.fgColor.rgb == "00000000":
                cell.fill = row_alt_fill

    ws.row_dimensions[row].height = 24


def _result_row(ws, row, label, formula, fmt=currency_fmt, fill=result_fill):
    """Write a calculated result row."""
    ws.merge_cells(start_row=row, start_column=2, end_row=row, end_column=3)
    ws.cell(row=row, column=2, value=label).font = result_font
    ws.cell(row=row, column=2).fill = fill
    ws.cell(row=row, column=2).border = thin_border
    ws.cell(row=row, column=2).alignment = Alignment(
        horizontal="left", vertical="center", indent=1
    )
    ws.cell(row=row, column=3).fill = fill
    ws.cell(row=row, column=3).border = thin_border

    val = ws.cell(row=row, column=4, value=formula)
    val.font = result_font
    val.fill = fill
    val.border = thin_border
    val.number_format = fmt

    ws.merge_cells(start_row=row, start_column=5, end_row=row, end_column=6)
    ws.cell(row=row, column=5).fill = fill
    ws.cell(row=row, column=5).border = thin_border
    ws.cell(row=row, column=6).fill = fill
    ws.cell(row=row, column=6).border = thin_border

    ws.row_dimensions[row].height = 30


def build_template():
    wb = openpyxl.Workbook()

    # ================================================================
    #  SHEET 1 – Product Cost Calculator
    # ================================================================
    ws = wb.active
    ws.title = "Product Cost Calculator"
    ws.sheet_properties.tabColor = DARK_BLUE

    # column widths
    ws.column_dimensions["A"].width = 3
    ws.column_dimensions["B"].width = 22
    ws.column_dimensions["C"].width = 18
    ws.column_dimensions["D"].width = 20
    ws.column_dimensions["E"].width = 14
    ws.column_dimensions["F"].width = 14
    ws.column_dimensions["G"].width = 3

    # ── Title ────────────────────────────────────────────────────────
    ws.merge_cells("B2:F2")
    title_cell = ws.cell(row=2, column=2, value="Product Cost Calculator")
    title_cell.font = title_font
    title_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws.row_dimensions[2].height = 40

    ws.merge_cells("B3:F3")
    ws.cell(row=3, column=2, value="Enter values in the highlighted cells").font = Font(
        name="Calibri", size=10, italic=True, color="808080"
    )
    ws.cell(row=3, column=2).alignment = Alignment(horizontal="center")
    ws.row_dimensions[3].height = 20

    # ── Product Info ─────────────────────────────────────────────────
    r = 5
    _section_header(ws, r, "PRODUCT INFORMATION")

    r = 6
    _label_row(ws, r, "Product Name", unit="")
    ws.cell(row=r, column=4).number_format = "@"  # text

    r = 7
    _label_row(ws, r, "SKU / Product Code", unit="")
    ws.cell(row=r, column=4).number_format = "@"

    r = 8
    _label_row(ws, r, "Units Produced", unit="per batch / period")
    ws.cell(row=r, column=4).number_format = qty_fmt

    # ── Material Costs ───────────────────────────────────────────────
    r = 10
    _section_header(ws, r, "1. MATERIAL COSTS")

    materials = [
        ("Raw Material 1", "cost per unit"),
        ("Raw Material 2", "cost per unit"),
        ("Raw Material 3", "cost per unit"),
        ("Raw Material 4", "cost per unit"),
        ("Raw Material 5", "cost per unit"),
        ("Packaging", "cost per unit"),
        ("Shipping / Freight Inbound", "cost per unit"),
    ]
    mat_start = 11
    for i, (name, unit) in enumerate(materials):
        _label_row(ws, mat_start + i, name, unit=unit)

    mat_end = mat_start + len(materials) - 1
    r = mat_end + 1
    _result_row(ws, r, "Total Material Cost",
                f"=SUM(D{mat_start}:D{mat_end})")
    material_total_row = r

    # ── Labour Costs ─────────────────────────────────────────────────
    r = mat_end + 3
    _section_header(ws, r, "2. LABOUR COSTS")
    lab_section = r

    lab_items = [
        ("Direct Labour (Production)", "total cost"),
        ("Indirect Labour (Supervision)", "total cost"),
        ("Quality Control / Inspection", "total cost"),
        ("Overtime / Shift Premiums", "total cost"),
        ("Employee Benefits & Insurance", "total cost"),
    ]
    lab_start = lab_section + 1
    for i, (name, unit) in enumerate(lab_items):
        _label_row(ws, lab_start + i, name, unit=unit)

    lab_end = lab_start + len(lab_items) - 1
    r = lab_end + 1
    _result_row(ws, r, "Total Labour Cost",
                f"=SUM(D{lab_start}:D{lab_end})")
    labour_total_row = r

    # ── Overhead Costs ───────────────────────────────────────────────
    r = lab_end + 3
    _section_header(ws, r, "3. OVERHEAD COSTS (Utilities & Facility)")
    ovh_section = r

    ovh_items = [
        ("Electricity", "per period"),
        ("Gas", "per period"),
        ("Heating", "per period"),
        ("Water", "per period"),
        ("Waste Disposal", "per period"),
        ("Facility Rent / Lease", "per period"),
        ("Equipment Depreciation", "per period"),
        ("Maintenance & Repairs", "per period"),
        ("Insurance (Property/Equip)", "per period"),
        ("Other Utilities", "per period"),
    ]
    ovh_start = ovh_section + 1
    for i, (name, unit) in enumerate(ovh_items):
        _label_row(ws, ovh_start + i, name, unit=unit)

    ovh_end = ovh_start + len(ovh_items) - 1
    r = ovh_end + 1
    _result_row(ws, r, "Total Overhead Cost",
                f"=SUM(D{ovh_start}:D{ovh_end})")
    overhead_total_row = r

    # ── Extra Fixed Costs ────────────────────────────────────────────
    r = ovh_end + 3
    _section_header(ws, r, "4. EXTRA FIXED COSTS")
    fix_section = r

    fix_items = [
        ("Licensing & Permits", "per period"),
        ("Tooling & Moulds", "per period"),
        ("R&D / Design Costs", "per period"),
        ("Regulatory / Compliance", "per period"),
        ("Administrative Overhead", "per period"),
        ("Marketing Allocation", "per period"),
        ("Other Fixed Costs", "per period"),
    ]
    fix_start = fix_section + 1
    for i, (name, unit) in enumerate(fix_items):
        _label_row(ws, fix_start + i, name, unit=unit)

    fix_end = fix_start + len(fix_items) - 1
    r = fix_end + 1
    _result_row(ws, r, "Total Extra Fixed Costs",
                f"=SUM(D{fix_start}:D{fix_end})")
    fixed_total_row = r

    # ── Grand Summary ────────────────────────────────────────────────
    r = fix_end + 3
    _section_header(ws, r, "COST SUMMARY")
    summary_section = r

    rows_summary = {
        "Total Material Cost": material_total_row,
        "Total Labour Cost": labour_total_row,
        "Total Overhead Cost": overhead_total_row,
        "Total Extra Fixed Costs": fixed_total_row,
    }

    sr = summary_section + 1
    for label, ref_row in rows_summary.items():
        _label_row(ws, sr, label, has_input=False)
        ws.cell(row=sr, column=4).value = f"=D{ref_row}"
        ws.cell(row=sr, column=4).font = Font(
            name="Calibri", bold=True, size=11, color=DARK_BLUE
        )
        sr += 1

    sr += 0  # blank spacer already from next row
    grand_total_row = sr
    _result_row(
        ws,
        grand_total_row,
        "TOTAL PRODUCT COST",
        f"=D{summary_section+1}+D{summary_section+2}+D{summary_section+3}+D{summary_section+4}",
        fill=total_fill,
    )

    # Cost per unit
    sr = grand_total_row + 1
    _result_row(
        ws,
        sr,
        "COST PER UNIT",
        f'=IF(D8=0,"",D{grand_total_row}/D8)',
        fill=total_fill,
    )
    cost_per_unit_row = sr

    # ── Markup / Pricing ─────────────────────────────────────────────
    sr += 2
    _section_header(ws, sr, "PRICING (Optional)")
    price_section = sr

    sr += 1
    _label_row(ws, sr, "Desired Profit Margin", unit="e.g. 30% = 0.30")
    ws.cell(row=sr, column=4).number_format = pct_fmt
    margin_row = sr

    sr += 1
    _result_row(
        ws,
        sr,
        "SUGGESTED SELLING PRICE",
        f'=IF(OR(D{margin_row}="",D{margin_row}>=1,D{cost_per_unit_row}=""),"",D{cost_per_unit_row}/(1-D{margin_row}))',
        fill=PatternFill("solid", fgColor=DARK_BLUE),
    )
    selling_price_row = sr

    sr += 1
    _result_row(
        ws,
        sr,
        "PROFIT PER UNIT",
        f'=IF(OR(D{selling_price_row}="",D{cost_per_unit_row}=""),"",D{selling_price_row}-D{cost_per_unit_row})',
        fill=PatternFill("solid", fgColor=DARK_BLUE),
    )

    # ── Print / page setup ───────────────────────────────────────────
    ws.sheet_view.showGridLines = False
    ws.print_area = f"A1:G{sr + 2}"

    # ================================================================
    #  SHEET 2 – Overhead Breakdown
    # ================================================================
    ws2 = wb.create_sheet("Overhead Breakdown")
    ws2.sheet_properties.tabColor = MID_BLUE

    ws2.column_dimensions["A"].width = 3
    ws2.column_dimensions["B"].width = 28
    ws2.column_dimensions["C"].width = 18
    ws2.column_dimensions["D"].width = 18
    ws2.column_dimensions["E"].width = 18
    ws2.column_dimensions["F"].width = 18

    ws2.merge_cells("B2:F2")
    ws2.cell(row=2, column=2, value="Monthly Overhead Breakdown").font = title_font
    ws2.cell(row=2, column=2).alignment = Alignment(horizontal="center")
    ws2.row_dimensions[2].height = 36

    headers = ["Overhead Item", "Monthly Cost", "Quarterly Cost", "Annual Cost", "Notes"]
    r2 = 4
    for ci, h in enumerate(headers, start=2):
        cell = ws2.cell(row=r2, column=ci, value=h)
        cell.font = header_font
        cell.fill = header_fill
        cell.border = thin_border
        cell.alignment = Alignment(horizontal="center", vertical="center")
    ws2.row_dimensions[r2].height = 28

    ovh_detail = [
        "Electricity",
        "Natural Gas",
        "Heating (Oil/Other)",
        "Water & Sewage",
        "Internet / Telecom",
        "Waste Disposal",
        "Facility Rent / Lease",
        "Property Tax",
        "Building Insurance",
        "Equipment Insurance",
        "Equipment Depreciation",
        "Vehicle Costs",
        "Cleaning / Janitorial",
        "Security",
        "Maintenance & Repairs",
        "Office Supplies",
        "Software / Subscriptions",
        "Other",
    ]
    detail_start = r2 + 1
    for i, item in enumerate(ovh_detail):
        row = detail_start + i
        ws2.cell(row=row, column=2, value=item).font = label_font
        ws2.cell(row=row, column=2).border = thin_border
        ws2.cell(row=row, column=2).alignment = Alignment(indent=1)

        # Monthly (input)
        mc = ws2.cell(row=row, column=3)
        mc.fill = input_fill
        mc.font = input_font
        mc.border = thin_border
        mc.number_format = currency_fmt

        # Quarterly = Monthly * 3
        qc = ws2.cell(row=row, column=4, value=f"=C{row}*3")
        qc.border = thin_border
        qc.number_format = currency_fmt

        # Annual = Monthly * 12
        ac = ws2.cell(row=row, column=5, value=f"=C{row}*12")
        ac.border = thin_border
        ac.number_format = currency_fmt

        # Notes
        ws2.cell(row=row, column=6).border = thin_border
        ws2.cell(row=row, column=6).fill = input_fill

        if row % 2 == 0:
            ws2.cell(row=row, column=2).fill = row_alt_fill

        ws2.row_dimensions[row].height = 22

    detail_end = detail_start + len(ovh_detail) - 1

    # Totals
    tr = detail_end + 1
    for ci in range(2, 7):
        ws2.cell(row=tr, column=ci).fill = total_fill
        ws2.cell(row=tr, column=ci).font = result_font
        ws2.cell(row=tr, column=ci).border = thin_border
    ws2.cell(row=tr, column=2, value="TOTAL").alignment = Alignment(indent=1)
    ws2.cell(row=tr, column=3, value=f"=SUM(C{detail_start}:C{detail_end})").number_format = currency_fmt
    ws2.cell(row=tr, column=4, value=f"=SUM(D{detail_start}:D{detail_end})").number_format = currency_fmt
    ws2.cell(row=tr, column=5, value=f"=SUM(E{detail_start}:E{detail_end})").number_format = currency_fmt
    ws2.row_dimensions[tr].height = 28

    ws2.sheet_view.showGridLines = False

    # ================================================================
    #  SHEET 3 – Instructions
    # ================================================================
    ws3 = wb.create_sheet("Instructions")
    ws3.sheet_properties.tabColor = GREEN_ACCENT
    ws3.column_dimensions["B"].width = 90

    instructions = [
        ("How to Use This Template", title_font),
        ("", label_font),
        ("1. Start on the 'Product Cost Calculator' sheet.", label_font),
        ("2. Fill in your Product Name, SKU, and Units Produced per batch/period.", label_font),
        ("3. Enter each cost in the blue highlighted input cells.", label_font),
        ("4. The template automatically calculates subtotals for each category.", label_font),
        ("5. The Cost Summary section shows a full breakdown and the total product cost.", label_font),
        ("6. 'Cost Per Unit' divides total cost by units produced.", label_font),
        ("7. Optionally set a desired profit margin to get a suggested selling price.", label_font),
        ("", label_font),
        ("Sections:", Font(name="Calibri", bold=True, size=12, color=DARK_BLUE)),
        ("  - Material Costs: raw materials, packaging, inbound shipping.", label_font),
        ("  - Labour Costs: direct/indirect labour, QC, overtime, benefits.", label_font),
        ("  - Overhead Costs: electricity, gas, heating, water, rent, depreciation, etc.", label_font),
        ("  - Extra Fixed Costs: licensing, tooling, R&D, compliance, admin, marketing.", label_font),
        ("", label_font),
        ("Tips:", Font(name="Calibri", bold=True, size=12, color=DARK_BLUE)),
        ("  - Use the 'Overhead Breakdown' sheet for a detailed monthly utility tracker.", label_font),
        ("  - All formulas update automatically -- just fill in the blue cells.", label_font),
        ("  - Add or remove rows as needed (update SUM ranges if you do).", label_font),
        ("  - Keep all costs in the same currency for consistency.", label_font),
    ]
    for i, (text, font) in enumerate(instructions, start=2):
        cell = ws3.cell(row=i, column=2, value=text)
        cell.font = font
        cell.alignment = Alignment(wrap_text=True)

    ws3.sheet_view.showGridLines = False

    # ── Save ─────────────────────────────────────────────────────────
    wb.save(OUTPUT_FILE)
    print(f"Template saved to {OUTPUT_FILE}")


if __name__ == "__main__":
    build_template()
