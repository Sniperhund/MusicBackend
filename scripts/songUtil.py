import syncedlyrics, time, sys, os
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