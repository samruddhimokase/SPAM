import kagglehub
from kagglehub import KaggleDatasetAdapter
import pandas as pd
import os

# Download the latest version
dataset_path = kagglehub.dataset_download("kundanbedmutha/instagram-analytics-dataset")

print(f"Dataset downloaded to: {dataset_path}")

# List files in the dataset
files = os.listdir(dataset_path)
print("Files in dataset:", files)

# Try to load the first CSV file found
csv_files = [f for f in files if f.endswith('.csv')]
if csv_files:
    file_path = csv_files[0]
    print(f"Loading {file_path}...")
    
    df = kagglehub.load_dataset(
        KaggleDatasetAdapter.PANDAS,
        "kundanbedmutha/instagram-analytics-dataset",
        file_path,
    )
    
    print("\nFirst 5 records:")
    print(df.head())
    print("\nColumns:", df.columns.tolist())
    
    # Save the dataframe to a local CSV for the Node.js script to read
    output_path = os.path.join(os.getcwd(), 'backend', 'scripts', 'instagram_data.csv')
    df.to_csv(output_path, index=False)
    print(f"\nSaved data to {output_path}")
else:
    print("No CSV files found in the dataset.")
