import syncedlyrics, time, sys, os, re
from util import *
from songUtil import *
from colorama import Fore, Style
from dotenv import load_dotenv

api = "https://api.lucasskt.dk/"

session = LiveServerSession(api)
timeBetweenRequests = 30

load_dotenv()

def confirmLyrics(song, lrc):
    print(Fore.RED + "Lyrics:" + Style.RESET_ALL)
    print(formatString(lrc))
    print(Fore.RED + "Song information (on the backend):" + Style.RESET_ALL)
    print(Fore.GREEN + "Name: " + Style.RESET_ALL + song.get("name"))
    print(Fore.GREEN + "Artists: " + Style.RESET_ALL + ", ".join([artist.get("name") for artist in song.get("artists")]))
    print(Fore.GREEN + "Album: " + Style.RESET_ALL + song.get("album").get("name"))

    print("Do you want to add these lyrics? (y/n)")
    answer = input()

    if answer.lower() == "y":
        return True
    
    return False

def checkIfSongHasLyrics(songId):
    songLyrics = session.get("/tracks/" + songId + "/lyrics")

    if songLyrics.status_code == 200:
        return True, songLyrics.json().get("response").get("synced")
    return False

def getSearchTerm(song):
    artistNames = ""

    for artist in song.get("artists"):
        artistNames += artist.get("name") + " "

    return song.get("name") + " " + artistNames

def getSongData(songId):
    return session.get("tracks/" + songId).json().get("response")

def addAndConfirmLyrics(song, lrc):
    if confirmLyrics(song, lrc):
        response = None
        hasLyrics = checkIfSongHasLyrics(song.get("_id"))
        if hasLyrics == False:
            response = session.post("/admin/lyrics",
                            json={"songId": song.get("_id"), "synced": True, "lyrics": lrc})
        elif isinstance(hasLyrics, tuple) and hasLyrics[0] == True and hasLyrics[1] == False:
            response = session.put("/admin/lyrics?id=" + song.get("_id"),
                            json={"lyrics": lrc, "synced": True})
        else:
            print("Lyrics already synced or an error occurred")
            print("If you want to replace them, you can use the argument --replace-lyrics-with-own")
            return

        if response.json().get("status") != "ok":
            print(song)
            print(lrc)
            print(response.json())
            raise Exception("Something went wrong")

def searchSongId():
    searchTerm = input("Enter a search term: ")

    response = session.get("/search?q=" + searchTerm)

    if response.status_code != 200:
        print(response.json())
        raise Exception("Something went wrong")

    songs = response.json().get("response")

    if len(songs) == 0:
        print("No songs found")
        return

    for song in songs:
        if song.get("type") != "track":
            songs.remove(song)

    for i, song in enumerate(songs):
        print(str(i) + ": " + song.get("name") + " by " + ", ".join([artist.get("name") for artist in song.get("artists")]))

    songIndex = int(input("Select a song by typing the number: "))

    return songs[songIndex].get("_id")

import re

def offsetLrc(lrc, offset):
    try:
        offset = int(offset)  # Ensure offset is an integer
    except ValueError:
        raise TypeError("Offset must be an integer.")

    def shift_timestamp(timestamp, offset):
        match = re.match(r"\[(\d+):(\d+\.\d+)\]", timestamp)
        if not match:
            return timestamp  # Return unchanged if not a valid timestamp
        
        minutes, seconds = int(match.group(1)), float(match.group(2))
        total_ms = (minutes * 60 + seconds) * 1000 + offset
        
        if total_ms < 0:
            return None  # Skip negative timestamps
        
        new_minutes = int(total_ms // 60000)
        new_seconds = (total_ms % 60000) / 1000
        return f"[{new_minutes:02}:{new_seconds:05.2f}]"
    
    lrc_lines = lrc.split("\n")
    adjusted_lines = []
    
    for line in lrc_lines:
        matches = re.findall(r"\[\d+:\d+\.\d+\]", line)
        
        if matches:
            new_timestamps = [shift_timestamp(ts, offset) for ts in matches]
            new_timestamps = [ts for ts in new_timestamps if ts is not None]  # Remove invalid timestamps
            
            if new_timestamps:
                lyrics_part = re.sub(r"\[\d+:\d+\.\d+\]", "", line).strip()
                adjusted_lines.append("".join(new_timestamps) + " " + lyrics_part)
        else:
            adjusted_lines.append(line)  # Keep non-timestamped lines unchanged
    
    return "\n".join(adjusted_lines)
