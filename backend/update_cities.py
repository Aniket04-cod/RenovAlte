import csv

# Read the CSV file
with open('contractors.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = []
    for row in reader:
        row['city'] = 'Frankfurt'
        row['state'] = 'Hesse'
        rows.append(row)
    fieldnames = reader.fieldnames

# Write the updated CSV file
with open('contractors.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(rows)

print('Successfully updated all cities to Frankfurt')

