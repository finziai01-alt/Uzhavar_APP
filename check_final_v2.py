path = r'C:\Users\Praveen\Downloads\uzhavar app\delivery app\freshgrocer_admin_panel\app.js'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()
import re
for i in [241, 262, 292, 293, 294, 340, 341, 440, 441, 442, 530]:
    if i < len(lines):
        line = lines[i]
        for m in re.finditer(r'\w*demo\w*', line.lower()):
            print(f'Line {i+1} - Word: {m.group()}')
            start = max(0, m.start()-40)
            end = min(len(line), m.end()+40)
            print(f'  Context: ...{line[start:end]}...')
            print()
