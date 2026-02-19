"""
EduNexus School — PDF Report Generator
Uses Jinja2 templates + WeasyPrint to generate PDF documents.
"""

import io
from datetime import datetime
from typing import Any, Dict, List, Optional

from jinja2 import Environment, BaseLoader


def get_jinja_env() -> Environment:
    """Return a Jinja2 environment for rendering HTML templates."""
    return Environment(loader=BaseLoader(), autoescape=True)


# ══════════════════════════════════════════════════════════
#  REPORT CARD HTML TEMPLATE
# ══════════════════════════════════════════════════════════
REPORT_CARD_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
<style>
  @page { size: A4; margin: 1.5cm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    color: #1a1a2e;
    font-size: 11pt;
    line-height: 1.5;
  }
  .header {
    text-align: center;
    padding: 20px 0;
    border-bottom: 3px solid #7C4DFF;
    margin-bottom: 20px;
  }
  .header h1 {
    font-size: 22pt;
    color: #7C4DFF;
    margin-bottom: 4px;
    letter-spacing: 1px;
  }
  .header p { color: #666; font-size: 10pt; }
  .title {
    text-align: center;
    font-size: 16pt;
    font-weight: 700;
    color: #1a1a2e;
    margin: 15px 0;
    padding: 10px;
    background: linear-gradient(135deg, #f5f0ff, #e8f5e9);
    border-radius: 8px;
  }
  .student-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
    border-left: 4px solid #7C4DFF;
  }
  .student-info .col { flex: 1; }
  .student-info .label {
    font-size: 8pt;
    color: #888;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .student-info .value {
    font-size: 11pt;
    font-weight: 600;
    color: #1a1a2e;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
  }
  th {
    background: #7C4DFF;
    color: white;
    padding: 10px 12px;
    text-align: left;
    font-size: 9pt;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  td {
    padding: 10px 12px;
    border-bottom: 1px solid #eee;
    font-size: 10pt;
  }
  tr:nth-child(even) { background: #fafafa; }
  tr:hover { background: #f0ecff; }
  .grade-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 12px;
    font-weight: 700;
    font-size: 9pt;
  }
  .grade-a { background: #e8f5e9; color: #2e7d32; }
  .grade-b { background: #e3f2fd; color: #1565c0; }
  .grade-c { background: #fff3e0; color: #e65100; }
  .grade-d { background: #fce4ec; color: #c62828; }
  .grade-f { background: #ffebee; color: #b71c1c; }
  .summary {
    margin-top: 20px;
    padding: 15px;
    background: linear-gradient(135deg, #f5f0ff, #e0f7fa);
    border-radius: 8px;
    display: flex;
    justify-content: space-around;
    text-align: center;
  }
  .summary .metric .num {
    font-size: 20pt;
    font-weight: 800;
    color: #7C4DFF;
  }
  .summary .metric .lbl {
    font-size: 8pt;
    color: #666;
    text-transform: uppercase;
  }
  .footer {
    margin-top: 30px;
    padding-top: 15px;
    border-top: 2px solid #eee;
    display: flex;
    justify-content: space-between;
    font-size: 9pt;
    color: #999;
  }
  .signature-line {
    margin-top: 40px;
    display: flex;
    justify-content: space-between;
  }
  .signature-line .sig {
    text-align: center;
    width: 200px;
  }
  .signature-line .sig .line {
    border-top: 1px solid #333;
    margin-top: 30px;
    padding-top: 5px;
    font-size: 9pt;
    color: #666;
  }
</style>
</head>
<body>
  <div class="header">
    <h1>🏫 EduNexus School</h1>
    <p>Excellence in Education • Nurturing Future Leaders</p>
  </div>

  <div class="title">Academic Report Card — {{ term_name }}</div>

  <div class="student-info">
    <div class="col">
      <div class="label">Student Name</div>
      <div class="value">{{ student_name }}</div>
    </div>
    <div class="col">
      <div class="label">Admission No</div>
      <div class="value">{{ admission_no }}</div>
    </div>
    <div class="col">
      <div class="label">Academic Year</div>
      <div class="value">{{ academic_year }}</div>
    </div>
    <div class="col">
      <div class="label">Term</div>
      <div class="value">{{ term_name }}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="width: 40px">#</th>
        <th>Subject</th>
        <th>Code</th>
        <th style="text-align: center">Score (%)</th>
        <th style="text-align: center">Grade</th>
        <th style="text-align: center">GPA</th>
      </tr>
    </thead>
    <tbody>
      {% for subject in subjects %}
      <tr>
        <td>{{ loop.index }}</td>
        <td><strong>{{ subject.subject_name }}</strong></td>
        <td>{{ subject.subject_code }}</td>
        <td style="text-align: center">{{ "%.1f"|format(subject.average_score) }}</td>
        <td style="text-align: center">
          <span class="grade-badge {% if subject.letter_grade and subject.letter_grade.startswith('A') %}grade-a{% elif subject.letter_grade and subject.letter_grade.startswith('B') %}grade-b{% elif subject.letter_grade and subject.letter_grade.startswith('C') %}grade-c{% elif subject.letter_grade and subject.letter_grade.startswith('D') %}grade-d{% else %}grade-f{% endif %}">
            {{ subject.letter_grade or 'N/A' }}
          </span>
        </td>
        <td style="text-align: center">{{ subject.gpa or '-' }}</td>
      </tr>
      {% endfor %}
    </tbody>
  </table>

  <div class="summary">
    <div class="metric">
      <div class="num">{{ "%.1f"|format(overall_average) }}%</div>
      <div class="lbl">Overall Average</div>
    </div>
    <div class="metric">
      <div class="num">{{ overall_gpa or '-' }}</div>
      <div class="lbl">Overall GPA</div>
    </div>
    <div class="metric">
      <div class="num">{{ subjects|length }}</div>
      <div class="lbl">Subjects</div>
    </div>
  </div>

  <div class="signature-line">
    <div class="sig">
      <div class="line">Class Teacher</div>
    </div>
    <div class="sig">
      <div class="line">Principal</div>
    </div>
    <div class="sig">
      <div class="line">Parent/Guardian</div>
    </div>
  </div>

  <div class="footer">
    <span>Generated on {{ generated_at }}</span>
    <span>EduNexus School — Student Information System</span>
  </div>
</body>
</html>
"""


# ══════════════════════════════════════════════════════════
#  ATTENDANCE REPORT HTML TEMPLATE
# ══════════════════════════════════════════════════════════
ATTENDANCE_REPORT_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
<style>
  @page { size: A4 landscape; margin: 1.5cm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; font-size: 10pt; }
  .header { text-align: center; padding: 15px 0; border-bottom: 3px solid #00BFA5; margin-bottom: 15px; }
  .header h1 { font-size: 18pt; color: #00BFA5; }
  .header p { color: #666; font-size: 9pt; }
  .title { text-align: center; font-size: 14pt; font-weight: 700; margin: 10px 0; color: #1a1a2e; }
  .meta { display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px; font-size: 9pt; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  th { background: #00BFA5; color: white; padding: 8px 10px; text-align: left; font-size: 8pt; text-transform: uppercase; }
  td { padding: 7px 10px; border-bottom: 1px solid #eee; font-size: 9pt; }
  tr:nth-child(even) { background: #fafafa; }
  .status-present { color: #2e7d32; font-weight: 600; }
  .status-absent { color: #c62828; font-weight: 600; }
  .status-late { color: #e65100; font-weight: 600; }
  .status-excused { color: #1565c0; font-weight: 600; }
  .summary-row { background: #e0f2f1 !important; font-weight: 700; }
  .footer { margin-top: 15px; text-align: center; font-size: 8pt; color: #999; }
</style>
</head>
<body>
  <div class="header">
    <h1>🏫 EduNexus School</h1>
    <p>Attendance Report</p>
  </div>
  <div class="title">{{ title }}</div>
  <div class="meta">
    <span><strong>Period:</strong> {{ start_date }} to {{ end_date }}</span>
    <span><strong>Section:</strong> {{ section_name }}</span>
    <span><strong>Generated:</strong> {{ generated_at }}</span>
  </div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Student Name</th>
        <th>Admission No</th>
        <th style="text-align:center">Present</th>
        <th style="text-align:center">Absent</th>
        <th style="text-align:center">Late</th>
        <th style="text-align:center">Excused</th>
        <th style="text-align:center">Total</th>
        <th style="text-align:center">Attendance %</th>
      </tr>
    </thead>
    <tbody>
      {% for row in rows %}
      <tr>
        <td>{{ loop.index }}</td>
        <td><strong>{{ row.student_name }}</strong></td>
        <td>{{ row.admission_no }}</td>
        <td style="text-align:center" class="status-present">{{ row.present }}</td>
        <td style="text-align:center" class="status-absent">{{ row.absent }}</td>
        <td style="text-align:center" class="status-late">{{ row.late }}</td>
        <td style="text-align:center" class="status-excused">{{ row.excused }}</td>
        <td style="text-align:center">{{ row.total }}</td>
        <td style="text-align:center"><strong>{{ "%.1f"|format(row.percentage) }}%</strong></td>
      </tr>
      {% endfor %}
    </tbody>
  </table>
  <div class="footer">EduNexus School — Student Information System</div>
</body>
</html>
"""


# ══════════════════════════════════════════════════════════
#  STUDENT LIST HTML TEMPLATE
# ══════════════════════════════════════════════════════════
STUDENT_LIST_TEMPLATE = """
<!DOCTYPE html>
<html>
<head>
<style>
  @page { size: A4; margin: 1.5cm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; font-size: 10pt; }
  .header { text-align: center; padding: 15px 0; border-bottom: 3px solid #7C4DFF; margin-bottom: 15px; }
  .header h1 { font-size: 18pt; color: #7C4DFF; }
  .title { text-align: center; font-size: 14pt; font-weight: 700; margin: 10px 0; }
  .meta { margin-bottom: 10px; font-size: 9pt; color: #666; text-align: right; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #7C4DFF; color: white; padding: 8px 10px; text-align: left; font-size: 8pt; text-transform: uppercase; }
  td { padding: 7px 10px; border-bottom: 1px solid #eee; font-size: 9pt; }
  tr:nth-child(even) { background: #fafafa; }
  .footer { margin-top: 15px; text-align: center; font-size: 8pt; color: #999; }
</style>
</head>
<body>
  <div class="header"><h1>🏫 EduNexus School</h1></div>
  <div class="title">{{ title }}</div>
  <div class="meta">Generated: {{ generated_at }} | Total: {{ students|length }} students</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Name</th>
        <th>Admission No</th>
        <th>Gender</th>
        <th>Status</th>
        <th>Email</th>
        <th>Enrolled</th>
      </tr>
    </thead>
    <tbody>
      {% for s in students %}
      <tr>
        <td>{{ loop.index }}</td>
        <td><strong>{{ s.name }}</strong></td>
        <td>{{ s.admission_no }}</td>
        <td>{{ s.gender }}</td>
        <td>{{ s.status }}</td>
        <td>{{ s.email }}</td>
        <td>{{ s.enrollment_date }}</td>
      </tr>
      {% endfor %}
    </tbody>
  </table>
  <div class="footer">EduNexus School — Student Information System</div>
</body>
</html>
"""


def render_html(template_str: str, context: Dict[str, Any]) -> str:
    """Render an HTML template with Jinja2."""
    env = get_jinja_env()
    template = env.from_string(template_str)
    return template.render(**context)


def generate_pdf_bytes(html_content: str) -> bytes:
    """Convert HTML to PDF bytes using WeasyPrint."""
    try:
        from weasyprint import HTML
        pdf = HTML(string=html_content).write_pdf()
        return pdf
    except ImportError:
        # Fallback: return HTML as bytes if WeasyPrint not available
        return html_content.encode("utf-8")


def generate_report_card_pdf(data: Dict[str, Any]) -> bytes:
    """Generate a report card PDF for a student."""
    data["generated_at"] = datetime.utcnow().strftime("%B %d, %Y at %I:%M %p")
    html = render_html(REPORT_CARD_TEMPLATE, data)
    return generate_pdf_bytes(html)


def generate_attendance_report_pdf(data: Dict[str, Any]) -> bytes:
    """Generate an attendance report PDF."""
    data["generated_at"] = datetime.utcnow().strftime("%B %d, %Y")
    html = render_html(ATTENDANCE_REPORT_TEMPLATE, data)
    return generate_pdf_bytes(html)


def generate_student_list_pdf(data: Dict[str, Any]) -> bytes:
    """Generate a student list PDF."""
    data["generated_at"] = datetime.utcnow().strftime("%B %d, %Y")
    html = render_html(STUDENT_LIST_TEMPLATE, data)
    return generate_pdf_bytes(html)
