#! /usr/bin/env python3

import syncedlyrics, time, sys
from util import *
from colorama import Fore, Style

api = "https://api.lucasskt.dk/"

session = LiveServerSession(api)
timeBetweenRequests = 30


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

def addLyrics():
    songs = session.get("all/tracks").json().get("response")
    for song in songs:
        addSpecificLyrics(song.get("_id"))
        time.sleep(timeBetweenRequests)

def addSpecificLyrics(songId):
    song = session.get("tracks/" + songId).json().get("response")
    print("Adding lyrics for song with name: " + song.get("name"))
    hasLyrics = checkIfSongHasLyrics(song.get("_id"))
    if type(hasLyrics) == tuple and hasLyrics[0] == True:
        if hasLyrics[1] == False:
            print("Not synced")

            lrc = getLyrics(getSearchTerm(song))

            if lrc == None:
                print("No lyrics found")
                return

            if confirmLyrics(song, lrc):
                response = session.put("/admin/lyrics?id=" + song.get("_id"),
                                    json={"synced": True, "lyrics": lrc})

                if response.status_code != 200:
                    print(song)
                    print(lrc)
                    print(response.json())
                    raise Exception("Something went wrong")
        else:
            print("Already synced")
    else:
        print("No lyrics")

        lrc = getLyrics(getSearchTerm(song))

        if lrc == None:
            print("No lyrics found")
            return

        if confirmLyrics(song, lrc):
            response = session.post("/admin/lyrics",
                                json={"songId": song.get("_id"), "synced": True, "lyrics": lrc})

            if response.status_code != 201:
                print(song)
                print(lrc)
                print(response.json())
                raise Exception("Something went wrong")

def formatString(s):
    return s.replace("\\n", "\n").replace("\\t", "\t")

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

def searchSong():
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

    addSpecificLyrics(songs[songIndex].get("_id"))

def getLyrics(searchTerm):
    lrc = syncedlyrics.search(searchTerm)
    return lrc

if __name__ == "__main__":
    if len(sys.argv) == 1:
        print(Fore.RED + "Missing arguments" + Style.RESET_ALL)
        print("Usage: python fetchLyrics.py --id <songId>")
        print("Usage: python fetchLyrics.py --search")
    else:
        match sys.argv[1]:
            case "--id":
                addSpecificLyrics(sys.argv[2])
            case "--search":
                searchSong()
            case _:
                print(Fore.RED + "Invalid argument" + Style.RESET_ALL)
                print("Usage: python fetchLyrics.py --id <songId>")
                print("Usage: python fetchLyrics.py --search")
