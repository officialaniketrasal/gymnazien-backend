const Event = require('../models/Eventmodel'); // Adjust based on your model structure

const getUserEvents = async (email, mobile) => {
  return await Event.find({
    $or: [
      { 'players.email': email },
      { 'players.mobile': mobile },
      { 'judges.judge1.email': email },
      { 'judges.judge1.mobile': mobile },
      { 'judges.judge2.email': email },
      { 'judges.judge2.mobile': mobile },
      { 'judges.judge3.email': email },
      { 'judges.judge3.mobile': mobile },
      { 'judges.judge4.email': email },
      { 'judges.judge4.mobile': mobile },
      { 'supervisors.email': email },
      { 'supervisors.mobile': mobile }
    ]
  });
};
