export const generateRoomId = (senderId, receiverId) => {
    const room = [senderId, receiverId].sort().join("_");
    return room
}