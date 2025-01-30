#! /usr/bin/env python3

import syncedlyrics, time, sys, os
from util import *
from songUtil import *
from colorama import Fore, Style
from dotenv import load_dotenv

api = "https://api.lucasskt.dk/"

session = LiveServerSession(api)
timeBetweenRequests = 30

load_dotenv()

def addLyricsToAll():
    songs = session.get("all/tracks").json().get("response")
    for song in songs:
        addSpecificLyrics(song.get("_id"))
        time.sleep(timeBetweenRequests)

def addSpecificLyrics(songId):
    song = getSongData(songId)
    print("Adding lyrics for song with name: " + song.get("name"))
    hasLyrics = checkIfSongHasLyrics(song.get("_id"))
    if type(hasLyrics) == tuple and hasLyrics[0] == True:
        if hasLyrics[1] == False:
            print("Not synced")

            lrc = getLyrics(getSearchTerm(song))

            if lrc == None:
                print("No lyrics found")
                return

            addAndConfirmLyrics(song, lrc)
        else:
            print("Already synced")
    else:
        print("No lyrics")

        lrc = getLyrics(getSearchTerm(song))

        if lrc == None:
            print("No lyrics found")
            return

        addAndConfirmLyrics(song, lrc)

def addOwnLyrics():
    id = searchSongId()

    print("Enter your lyrics (type 'END' on a new line to finish):")
    
    # Collect multiline input
    lines = []
    while True:
        line = input()
        if line.strip().upper() == "END":  # Stop when user types "END"
            break
        lines.append(line)

    lrc = "\n".join(lines)

    song = getSongData(id)

    addAndConfirmLyrics(song, lrc)

def replaceLyricsWithOwn():
    id = searchSongId()

    print("Enter your lyrics (type 'END' on a new line to finish):")
    
    # Collect multiline input
    lines = []
    while True:
        line = input()
        if line.strip().upper() == "END":  # Stop when user types "END"
            break
        lines.append(line)

    lrc = "\n".join(lines)

    song = getSongData(id)

    addAndConfirmLyrics(song, lrc)

def adjustAddedLyrics():
    id = searchSongId()

    hasLyrics = checkIfSongHasLyrics(id)

    if not (isinstance(hasLyrics, tuple) and hasLyrics[0] == True and hasLyrics[1] == True):
        print("No synced lyrics found")
        return

    offset = input("Enter the offset in milliseconds: ")

    lrc = session.get("/tracks/" + id + "/lyrics").json().get("response").get("lyrics")

    lrc = offsetLrc(lrc, offset)

    print("New lyrics:")
    print(lrc)

    print("Do you want to update the lyrics? (y/n)")
    answer = input()

    if answer.lower() == "y":
        response = session.put("/admin/lyrics?id=" + id,
                                json={"lyrics": lrc, "synced": True})

        if response.json().get("status") != "ok":
            print(response.json())
            raise Exception("Something went wrong")

def printUsage():
    print("Usage: python fetchLyrics.py --id <songId>")
    print("Usage: python fetchLyrics.py --search")
    print("Usage: python fetchLyrics.py --own-lyrics")
    print("Usage: python fetchLyrics.py --replace-lyrics-with-own")
    print("Usage: python fetchLyrics.py --adjust-added-lyrics")

if __name__ == "__main__":
    if os.getenv("REFRESH_TOKEN") == None and os.getenv("SIGNIN_INSTEAD") == None or os.getenv("SIGNIN_INSTEAD") == "true" and (os.getenv("EMAIL") == None or os.getenv("PASSWORD") == None):
        print(Fore.RED + "Missing environment variables" + Style.RESET_ALL)
        print(Fore.GREEN + "You must either have a .env file in the root of the project with the following variables:" + Style.RESET_ALL)
        print("REFRESH_TOKEN")
        print(Fore.BLUE + "You can get the refresh token by signing in to the website and copying the token from the cookies" + Style.RESET_ALL)
        print(Fore.GREEN + "\nIf you want to sign in instead, you must have the following variables:" + Style.RESET_ALL)
        print("SIGNIN_INSTEAD=true")
        print("EMAIL")
        print("PASSWORD")
        print(Fore.RED + "\nNever share you're .env file with anyone as it gives full access to your account with any of these values" + Style.RESET_ALL)

        exit()

    if len(sys.argv) == 1:
        print(Fore.RED + "Missing arguments" + Style.RESET_ALL)
        printUsage()

    else:
        match sys.argv[1]:
            case "--id":
                addSpecificLyrics(sys.argv[2])
            case "--search":
                while True:
                    addSpecificLyrics(searchSongId())
                    os.system('cls||clear')
            case "--own-lyrics":
                addOwnLyrics()
            case "--replace-lyrics-with-own":
                replaceLyricsWithOwn()
            case "--adjust-added-lyrics":
                adjustAddedLyrics()
            case _:
                print(Fore.RED + "Invalid argument" + Style.RESET_ALL)
                printUsage()
