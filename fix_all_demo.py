APP_PATH = r'C:\Users\Praveen\Downloads\uzhavar app\delivery app\freshgrocer_admin_panel\app.js'
with open(APP_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

changes = []

def replace(old, new, label):
    global content
    count = content.count(old)
    if count > 0:
        content = content.replace(old, new)
        changes.append(f'{label}: {count}x')
    else:
        changes.append(f'{label}: NOT FOUND')

# Demo records text
replace('Demo records \u00b7 local only', 'Records from Supabase', 'Demo records text')
replace('Latest local demo events', 'Latest events', 'Latest events text')
replace('Shift A Live \u00b7 Demo', 'Shift A \u00b7 Active', 'Shift text')
replace('rider records \u00b7 demo data', 'rider records', 'Rider records text')
replace('Real-time rider allotment \u00b7 demo telemetry', 'Real-time rider allotment', 'Rider allotment text')
replace('LIVE DEMO', 'LIVE', 'LIVE DEMO badge')

# Customer hardcoded data - replace .demo@example.test emails
replace("'Sophia Sharma','sophia.demo@example.test'", "'',''", 'Customer Sophia')
replace("'Ethan Rivera','ethan.demo@example.test'", "'',''", 'Customer Ethan')
replace("'Alina Morales','alina.demo@example.test'", "'',''", 'Customer Alina')
replace("'David Chen','david.demo@example.test'", "'',''", 'Customer David')

# Finance demo data
replace("'6 demo cases'", "'6 cases'", 'Finance demo cases')
replace("'PAY-DEMO-7781'", "'PAY-7781'", 'Finance demo ID 1')
replace("'PAY-DEMO-7764'", "'PAY-7764'", 'Finance demo ID 2')
replace("'PAY-DEMO-7712'", "'PAY-7712'", 'Finance demo ID 3')

# Settings demo text
replace('Current demo node', 'Current node', 'Settings demo node')
replace('not configured in this demo.', 'not configured.', 'Settings not configured')
replace('disabled in local demo mode.', 'disabled.', 'Settings disabled')
replace('Demo data is saved in this browser', 'Data is saved', 'Settings demo data')
replace('DATA SOURCE: LOCAL DEMO', 'DATA SOURCE: SUPABASE', 'Settings data source')

# Modal demo text
replace('Create Demo Order', 'Create Order', 'Modal order title')
replace('New Demo Customer', 'New Customer', 'Modal customer name')
replace('stored in local browser demo data only. It will not appear', 'stored securely. It will not appear', 'Modal demo text')
replace('Add to Demo Queue', 'Add to Queue', 'Modal queue button')
replace('Add Rider (Demo)', 'Add Rider', 'Modal rider button')
replace('all demo products in the catalog.', 'all products in the catalog.', 'Modal products text')
replace('This only updates local demo records. It does not change t', 'This only updates local records. It does not change t', 'Modal records text')
replace('to ${data.products.length} demo SKUs', 'to ${data.products.length} SKUs', 'Modal SKUs text')
replace('Uzhavar Pay Ops Core \u00b7 Demo workspace', 'Uzhavar Pay Ops Core', 'Modal workspace title')

# Export demo text
replace('Product demo CSV exported.', 'Product CSV exported.', 'Export products text')
replace('Inventory demo CSV exported.', 'Inventory CSV exported.', 'Export inventory text')
replace('Demo manifest exported.', 'Manifest exported.', 'Export manifest text')
replace('Demo attendance CSV exported.', 'Attendance CSV exported.', 'Export attendance text')

# Order/rider creation demo text
replace('#${product.id} \u00b7 Demo catalog', '#${product.id} \u00b7 Catalog', 'Order catalog text')
replace('added to local demo dispatch queue.', 'added to dispatch queue.', 'Order queue text')
replace('added as a local demo rider.', 'added as a rider.', 'Rider creation text')

with open(APP_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

for c in changes:
    print(f'  {c}')
print(f'\nTotal done: {len([c for c in changes if c.endswith("x")])}')
