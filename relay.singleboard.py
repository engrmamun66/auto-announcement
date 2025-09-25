import hid
import sys

VID = 0x16c0
PID = 0x05df
RELAYS = 16   # change to 8 if your board has 8 relays

try:
    relay = hid.device()
    relay.open(VID, PID)
except Exception as e:
    print(f"❌ Could not open relay board (VID={VID}, PID={PID}): {e}")
    sys.exit(1)

def relay_on(channel):
    try:
        relay.write([0x00, 0xff, channel])
        print(f"Relay {channel} ON")
    except Exception as e:
        print(f"⚠️ Failed to turn ON relay {channel}: {e}")

def relay_off(channel):
    try:
        relay.write([0x00, 0xfd, channel])
        print(f"Relay {channel} OFF")
    except Exception as e:
        print(f"⚠️ Failed to turn OFF relay {channel}: {e}")

if __name__ == "__main__":
    try:
        with open("relaychannels.txt", "r") as f:
            content = f.read().strip()
    except FileNotFoundError:
        print("❌ relaychannels.txt not found.")
        relay.close()
        sys.exit(1)

    # Parse active channels safely
    try:
        active_channels = {int(x) for x in content.split(",") if x.strip().isdigit()}
    except ValueError:
        print("❌ Invalid content in relaychannels.txt")
        active_channels = set()

    # Loop through relays and apply state
    for ch in range(1, RELAYS + 1):
        if ch in active_channels:
            relay_on(ch)
        else:
            relay_off(ch)

    relay.close()
    print("✅ Finished controlling relays.")
