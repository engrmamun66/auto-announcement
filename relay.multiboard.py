import hid

VID = 0x16c0
PID = 0x05df
RELAYS_PER_BOARD = 8   # change to 16 if your board has 16 relays

# Step 1: Find all connected boards
devices = hid.enumerate(VID, PID)
if not devices:
    print("No relay boards found.")
    exit()

boards = []
for d in devices:
    board = hid.device()
    board.open_path(d['path'])
    boards.append(board)

print(f"{len(boards)} board(s) connected.")

# Step 2: Define relay functions
def relay_on(board, channel):
    board.write([0x00, 0xff, channel])
    print(f"Relay {channel} ON")

def relay_off(board, channel):
    board.write([0x00, 0xfd, channel])
    print(f"Relay {channel} OFF")

# Step 3: Read active channels from file
with open("relaychannels.txt", "r") as f:
    content = f.read().strip()

active_channels = {int(x) for x in content.split(",") if x.strip().isdigit()}
print(f"Active channels: {sorted(active_channels)}")

# Step 4: Control relays across all boards
for idx, board in enumerate(boards):
    start_ch = idx * RELAYS_PER_BOARD + 1
    end_ch = start_ch + RELAYS_PER_BOARD
    for ch in range(start_ch, end_ch):
        local_ch = ch - start_ch + 1  # board expects 1–8
        if ch in active_channels:
            relay_on(board, local_ch)
        else:
            relay_off(board, local_ch)

# Step 5: Close all boards
for board in boards:
    board.close()
