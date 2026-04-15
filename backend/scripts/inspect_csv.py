import pandas as pd
import os

file_path = r"C:\Users\samru\Downloads\archive_1\Instagram data.csv"

if os.path.exists(file_path):
    print(f"\n--- Headers for Instagram data.csv ---")
    try:
        # Try different encodings as CSVs from Kaggle can sometimes be tricky
        try:
            df = pd.read_csv(file_path, nrows=5, encoding='utf-8')
        except UnicodeDecodeError:
            df = pd.read_csv(file_path, nrows=5, encoding='latin1')
            
        print(df.columns.tolist())
        print("\nFirst row sample:")
        print(df.iloc[0].to_dict())
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
else:
    print(f"File not found: {file_path}")
