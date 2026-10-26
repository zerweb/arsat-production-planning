"""Keep user supplied text from becoming spreadsheet formulas."""


def spreadsheet_value(value):
    if isinstance(value, str) and value.lstrip().startswith(("=", "+", "-", "@")):
        return "'" + value
    return value
