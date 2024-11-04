import syncedlyrics, time, sys
from util import *

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


def addSpecificLyrics(songId):
    song = session.get("tracks/" + songId).json().get("response")
    print("Adding lyrics for song with name: " + song.get("name"))
    hasLyrics = checkIfSongHasLyrics(song.get("_id"))
    if type(hasLyrics) == tuple and hasLyrics[0] == True:
        if hasLyrics[1] == False:
            print("Not synced")

            lrc = getLyrics(getSearchTerm(song))

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

        response = session.post("/admin/lyrics",
                                json={"songId": song.get("_id"), "synced": True, "lyrics": lrc})

        if response.status_code != 201:
            print(song)
            print(lrc)
            print(response.json())
            raise Exception("Something went wrong")
    time.sleep(timeBetweenRequests)


def getLyrics(searchTerm):
    lrc = syncedlyrics.search(searchTerm)
    return lrc


if __name__ == "__main__":
    if len(sys.argv) > 1:
        addSpecificLyrics(sys.argv[1])
    else:
        print("For the time being, this script only supports adding lyrics to a specific song by providing the song id as an argument")
        print("Since it sometimes gets the wrong song, it is recommended to use the admin panel to add lyrics")
        #addLyrics()
