#!/usr/bin/env python3
import os
import sys
import subprocess
import concurrent.futures

def process_audio(file_path):
    if not file_path:
        print("Warning: A file was not processed because it was not provided")
        return

    file_dir = os.path.dirname(file_path)
    file_name = os.path.splitext(os.path.basename(file_path))[0]

    # Create output subdirectories (relative to the file's directory)
    low_dir = os.path.join(file_dir, "low")
    mid_dir = os.path.join(file_dir, "mid")
    low_aac_dir = os.path.join(file_dir, "low-aac")
    mid_aac_dir = os.path.join(file_dir, "mid-aac")

    os.makedirs(low_dir, exist_ok=True)
    os.makedirs(mid_dir, exist_ok=True)
    os.makedirs(low_aac_dir, exist_ok=True)
    os.makedirs(mid_aac_dir, exist_ok=True)

    # Define output file paths
    output_low_mp3 = os.path.join(low_dir, f"{file_name}.mp3")
    output_mid_mp3 = os.path.join(mid_dir, f"{file_name}.mp3")
    output_low_aac = os.path.join(low_aac_dir, f"{file_name}.m4a")
    output_mid_aac = os.path.join(mid_aac_dir, f"{file_name}.m4a")

    # FFmpeg commands for different conversions
    commands = [
        ["ffmpeg", "-y", "-i", file_path, "-b:a", "128k", "-acodec", "libmp3lame", output_low_mp3],
        ["ffmpeg", "-y", "-i", file_path, "-b:a", "256k", "-acodec", "libmp3lame", output_mid_mp3],
        ["ffmpeg", "-y", "-i", file_path, "-b:a", "96k", "-acodec", "aac", output_low_aac],
        ["ffmpeg", "-y", "-i", file_path, "-b:a", "192k", "-acodec", "aac", output_mid_aac],
    ]

    def run_command(cmd):
        try:
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        except subprocess.CalledProcessError as e:
            print(f"Error processing file {file_path} with command {' '.join(cmd)}:\n{e.stderr.decode()}")

    # Run all FFmpeg conversions concurrently
    with concurrent.futures.ThreadPoolExecutor() as executor:
        futures = [executor.submit(run_command, cmd) for cmd in commands]
        for future in concurrent.futures.as_completed(futures):
            # This will raise exceptions caught during execution
            future.result()

def find_mp3_files(directory):
    """Recursively find all .mp3 files in the given directory."""
    mp3_files = []
    for root, _, files in os.walk(directory):
        for file in files:
            if file.lower().endswith(".mp3"):
                mp3_files.append(os.path.join(root, file))
    return mp3_files

def main():
    if len(sys.argv) < 2:
        print("Usage: python processAudio.py <directory>")
        sys.exit(1)

    directory = sys.argv[1]
    if not os.path.isdir(directory):
        print(f"Error: {directory} is not a valid directory.")
        sys.exit(1)

    mp3_files = find_mp3_files(directory)
    if not mp3_files:
        print("No .mp3 files found in the provided directory.")
        return

    for file_path in mp3_files:
        print(f"Processing: {file_path}")
        process_audio(file_path)

if __name__ == '__main__':
    main()