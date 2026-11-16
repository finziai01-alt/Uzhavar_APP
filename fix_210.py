APP_PATH = r'C:\Users\Praveen\Downloads\uzhavar app\delivery app\freshgrocer_admin_panel\app.js'
with open(APP_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

old = 'is not connected in demo mode.'
new = 'is not connected.'
count = content.count(old)
if count > 0:
    content = content.replace(old, new)
    print(f'Replaced {count} occurrence(s)')
else:
    print('NOT FOUND')

with open(APP_PATH, 'w', encoding='utf-8') as f:
    f.write(content)
