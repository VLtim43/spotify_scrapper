#!/bin/sh

is_authenticated=0

choose_option() {
    # Only show "auth" option if not authenticated
    if [ $is_authenticated -eq 0 ]; then
        echo "Auth"
    fi

    echo "Get Saved Songs"
    echo "Get Playlists"
    echo "Get Songs from All Playlists"
    echo "quit"
}

handle_interrupt() {
    echo "\nReceived interrupt. Exiting..."
    exit 1
}

while true; do
    choice=$(choose_option | gum choose)
    case $choice in
    "Auth")
        bun run src/api/spotifyAuth.ts
        if [ $? -eq 0 ]; then
            echo "Authentication successful. Proceeding to the next options..."
            is_authenticated=1
        else
            echo "Authentication failed. Exiting"
        fi
        ;;
    "Get Saved Songs")
        bun run src/api/getSavedSongs.ts
        ;;
    "Get Playlists")
        bun run src/api/getPlaylists.ts
        ;;
    "Get Songs from All Playlists")
        bun run src/api/getAllSongsFromPlaylists.ts
        ;;
    "quit")
        echo "Exiting"
        exit 0
        ;;
    *)
        echo "Invalid choice."
        ;;
    esac
done
