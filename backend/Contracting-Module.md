# Contracting Module

## Import Contractors Scripts

Import contractors from CSV file:

```bash
cd backend
python manage.py import_contractors
```

### Options

- `--file`: Specify a different CSV file (default: `contractors.csv`)
- `--skip-existing`: Skip existing contractors instead of updating them

### Examples

```bash
# Basic import
python manage.py import_contractors

# Skip existing contractors
python manage.py import_contractors --skip-existing

# Use custom file
python manage.py import_contractors --file data/contractors.csv
```

