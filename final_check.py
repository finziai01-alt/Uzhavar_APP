path = r'C:\Users\Praveen\Downloads\uzhavar app\delivery app\freshgrocer_admin_panel\app.js'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

import re
lines = content.split('\n')
found_any = False
for i, line in enumerate(lines, 1):
    lower = line.lower()
    if line.strip().startswith('//') or line.strip().startswith('/*') or 'iconPaths' in line:
        continue
    if any(word in lower for word in ['demo', 'sample', 'mock', 'fake']):
        if 'isdemomode' not in lower and 'demomode' not in lower:
            print(f'Line {i}: {line[:160]}')
            found_any = True

if not found_any:
    print('CLEAN: No demo/sample/mock/fake references found in app.js')
