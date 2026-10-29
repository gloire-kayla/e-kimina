"""Reproduce descriptive comparisons of published FinScope estimates (stdlib only)."""
import csv
import hashlib
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SOURCE = 'https://statistics.gov.rw/sites/default/files/documents/2024-09/Rwanda-Finscope-2024-Report_compressed.pdf'

def main():
    source = ROOT / 'inputs' / 'saving-channels.csv'
    with source.open(encoding='utf-8', newline='') as handle:
        rows = list(csv.DictReader(handle))
    if len(rows) != 4 or len({r['channel'] for r in rows}) != 4:
        raise ValueError('Expected four distinct selected channels')
    results = []
    for row in rows:
        before, after = int(row['2020']), int(row['2024'])
        if not (0 <= before <= 100 and 0 <= after <= 100):
            raise ValueError('Percentage outside 0..100')
        results.append({'channel': row['channel'], '2020_percent': before,
                        '2024_percent': after, 'change_percentage_points': after-before})
    out = ROOT / 'results'
    out.mkdir(exist_ok=True)
    payload = {'source': SOURCE, 'figure': 35, 'printed_page': 45,
               'input_sha256': hashlib.sha256(source.read_bytes()).hexdigest(),
               'method': '2024 percentage minus 2020 percentage; published rounded estimates',
               'results': results}
    (out / 'comparison.json').write_text(json.dumps(payload, indent=2)+'\n', encoding='utf-8')
    with (out / 'comparison.csv').open('w', encoding='utf-8', newline='') as handle:
        writer = csv.DictWriter(handle, fieldnames=list(results[0]))
        writer.writeheader()
        writer.writerows(results)
    svg = ['<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="530" viewBox="0 0 1000 530" role="img" aria-labelledby="title desc">',
           '<title id="title">Selected saving channels in Rwanda: 2020 and 2024</title>',
           '<desc id="desc">Savings groups 55 to 52 percent; mobile money 22 to 20; commercial banks 21 to 18; Umurenge SACCO 22 to 14. Channels overlap.</desc>',
           '<rect width="1000" height="530" fill="#f6f8f2"/>',
           '<g font-family="Arial, sans-serif" fill="#193e34">',
           '<text x="32" y="42" font-size="25" font-weight="bold">Selected saving channels in Rwanda</text>',
           '<text x="32" y="70" font-size="16">Published adult-population estimates (%) · channels can overlap</text>',
           '<rect x="32" y="93" width="16" height="16" fill="#91b29d"/><text x="56" y="107" font-size="15">2020</text>',
           '<rect x="142" y="93" width="16" height="16" fill="#175d4b"/><text x="166" y="107" font-size="15">2024</text>']
    for tick in range(0, 61, 10):
        x = 240 + tick * 9
        svg += [f'<path d="M{x} 140 V440" stroke="#dce4dc"/>', f'<text x="{x}" y="461" text-anchor="middle" font-size="13">{tick}</text>']
    for i, r in enumerate(results):
        y = 151 + i * 73
        svg.append(f'<text x="32" y="{y+24}" font-size="16">{html.escape(r["channel"])}</text>')
        for j, (key, color) in enumerate([('2020_percent', '#91b29d'), ('2024_percent', '#175d4b')]):
            value = r[key]
            svg += [f'<rect x="240" y="{y+j*25}" width="{value*9}" height="19" rx="3" fill="{color}"/>',
                    f'<text x="{249+value*9}" y="{y+j*25+15}" font-size="14">{value}%</text>']
        svg.append(f'<text x="838" y="{y+25}" font-size="16">{r["change_percentage_points"]:+d} pp</text>')
    svg += ['<text x="32" y="496" font-size="14">Source: AFR, FinScope 2024, Figure 35, printed p.45. Selected channels only.</text>',
            '<text x="32" y="518" font-size="13">Descriptive comparison; no significance tests or causal claims. pp = percentage points.</text>', '</g></svg>']
    (out / 'saving-channels.svg').write_text('\n'.join(svg)+'\n', encoding='utf-8')
    print('Created comparison.csv, comparison.json and saving-channels.svg')

if __name__ == '__main__':
    main()
