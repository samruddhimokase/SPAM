import pandas as pd
import os

files = [
    r"C:\Users\samru\Downloads\archive\MainDataset- Instagram.xlsx",
    r"C:\Users\samru\Downloads\archive\TestDataset-Instagram.xlsx"
]

for file in files:
    if os.path.exists(file):
        print(f"\n--- Headers for {os.path.basename(file)} ---")
        try:
            df = pd.read_excel(file, nrows=5)
            print(df.columns.tolist())
            print("\nFirst row sample:")
            print(df.iloc[0].to_dict())
        except Exception as e:
            print(f"Error reading {file}: {e}")
    else:
        print(f"File not found: {file}")
