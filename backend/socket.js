import User from "./models/user.model.js";

export const socketHandler = (io) => {
  io.on("connection", (socket) => {
    //console.log("Client connected to socket:", socket.id);

    socket.on("identity", async ({ userId }) => {
      //console.log("Received identity event for userId:", userId);
      try {
        if (!userId) return;

        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { socketId: socket.id, isOnline: true },
          { new: true }
        );
        //console.log("User online updated in DB:", updatedUser?.fullName, updatedUser?.socketId);
      } catch (error) {
        console.error("Socket identity error:", error.message);
      }
    });


    socket.on("updateLocation",async ({latitude,longitude,userId})=>{
      try{
       const user=await User.findByIdAndUpdate(userId,{
        loaction:{
          type: 'Point',
          coordinates: [longitude,latitude],
        },
        isOnline:true,
        socketId:socket.id
       })
       if(user){
        io.emit('updateDeliveryBoyLocation',{
          deliveryBoyId:userId,
          latitude,
          longitude
        })
       }
      }catch(error){
        console.log("UpdateDeliveryLocation error",error)
      }
    })

    socket.on("disconnect", async () => {
      //console.log("Client disconnected:", socket.id);
      try {
        await User.findOneAndUpdate(
          { socketId: socket.id },
          { socketId: null, isOnline: false }
        );
      } catch (error) {
        console.error("Socket disconnect error:", error.message);
      }
    });
  });
};