metadata_df["filepath"] = (
    "data/raw/"
    + metadata_df["label"]
    + "/"
    + metadata_df["filename"]
)


train_df, temp_df = train_test_split(
    metadata_df,
    test_size=0.40,
    stratify=metadata_df["label"], #stratify sabko same split deta hai
    random_state=42,
)


validation_df, test_df = train_test_split(
    temp_df,
    test_size=0.50,
    stratify=temp_df["label"],
    random_state=42,
)


train_df.to_csv(metadata_folder / "train_files.csv", index=False)

validation_df.to_csv(metadata_folder / "validation_files.csv", index=False)

test_df.to_csv(metadata_folder / "test_files.csv", index=False)


print("Dataset Split Completed\n")

print(f"Training Files   : {len(train_df)}")
print(f"Validation Files : {len(validation_df)}")
print(f"Testing Files    : {len(test_df)}")


print("\nClass Distribution\n")

print("Training")
print(train_df["label"].value_counts())

print("\nValidation")
print(validation_df["label"].value_counts())

print("\nTesting")
print(test_df["label"].value_counts())