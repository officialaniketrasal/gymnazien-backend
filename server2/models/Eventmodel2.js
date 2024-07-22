// const mongoose = require('mongoose');

// const eventSchema = new mongoose.Schema({
//   eventName: { type: String, required: true },
//   category: { type: String, required: true },
//   sports: {
//     floor: { type: Boolean, default: true },
//     pommel_horse: { type: Boolean, default: true },
//     rings: { type: Boolean, default: true },
//     vaultMen: { type: Boolean, default: true },
//     parallel_bars: { type: Boolean, default: true },
//     horizontal_bar: { type: Boolean, default: true },
//     vaultWomen: { type: Boolean, default: true },
//     uneven_bars: { type: Boolean, default: true },
//     balance_beam: { type: Boolean, default: true },
//     floor_exercise: { type: Boolean, default: true },
//   },
  
//   numVaults: { type: String, required: true },
//   resultList: {
//     individual: { type: Boolean, default: false },
//     allRound: { type: Boolean, default: false },
//     team: { type: Boolean, default: false },
//   },
//   teamFormat: {
//     input1: { type: Number,  },
//     input2: { type: Number,  },
//     result: { type: Number,  },
//   },
//   dateTime: { type: Date, required: true },
//   teams: [{teamName: { type: String, required: true }, teamFormat: Number, players: {
//     floor: [{ name: String, mobile: String, email:String, approve:{ type: Boolean, default: false }, status: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, appratusStatus: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, scores: { judge1: Number, judge2: Number, judge3: Number, judge4: Number, e:{ type: Number, default: 0 }, d1:{ type: Number, default: 0 }, penalty: {type: Number, default:0}, total: { type: Number, default: 0 }, }, editCount: {judge1:{ type: Number, default: 0 }, judge2:{ type: Number, default: 0 }, judge3:{ type: Number, default: 0 }, judge4:{ type: Number, default: 0 }, d1:{ type: Number, default: 0 }} }],
//     pommel_horse: [{ name: String, mobile: String, email:String, approve:{ type: Boolean, default: false }, status: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, appratusStatus: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, scores: { judge1: Number, judge2: Number, judge3: Number, judge4: Number, e:{ type: Number, default: 0 }, d1: { type: Number, default: 0 }, penalty: {type: Number, default:0}, total: { type: Number, default: 0 }, }, editCount: {judge1:{ type: Number, default: 0 }, judge2:{ type: Number, default: 0 }, judge3:{ type: Number, default: 0 }, judge4:{ type: Number, default: 0 }, d1:{ type: Number, default: 0 }} }],
//     rings: [{ name: String, mobile: String, email:String, approve:{ type: Boolean, default: false }, status: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, appratusStatus: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, scores: { judge1: Number, judge2: Number, judge3: Number, judge4: Number, e:{ type: Number, default: 0 }, d1: { type: Number, default: 0 }, penalty: {type: Number, default:0}, total: { type: Number, default: 0 }, }, editCount: {judge1:{ type: Number, default: 0 }, judge2:{ type: Number, default: 0 }, judge3:{ type: Number, default: 0 }, judge4:{ type: Number, default: 0 }, d1:{ type: Number, default: 0 }} }],
//     vaultMen: [{ name: String, mobile: String, email:String, approve:{ type: Boolean, default: false }, status: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, appratusStatus: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, scores: { judge1: Number, judge2: Number, judge3: Number, judge4: Number, e:{ type: Number, default: 0 }, d1: { type: Number, default: 0 }, penalty: {type: Number, default:0}, total: { type: Number, default: 0 }, }, editCount: {judge1:{ type: Number, default: 0 }, judge2:{ type: Number, default: 0 }, judge3:{ type: Number, default: 0 }, judge4:{ type: Number, default: 0 }, d1:{ type: Number, default: 0 }} }],
//     parallel_bars: [{ name: String, mobile: String, email:String, approve:{ type: Boolean, default: false }, status: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, appratusStatus: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, scores: { judge1: Number, judge2: Number, judge3: Number, judge4: Number, e:{ type: Number, default: 0 }, d1: { type: Number, default: 0 }, penalty: {type: Number, default:0}, total: { type: Number, default: 0 }, }, editCount: {judge1:{ type: Number, default: 0 }, judge2:{ type: Number, default: 0 }, judge3:{ type: Number, default: 0 }, judge4:{ type: Number, default: 0 }, d1:{ type: Number, default: 0 }} }],
//     horizontal_bar: [{ name: String, mobile: String, email:String, approve:{ type: Boolean, default: false }, status: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, appratusStatus: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, scores: { judge1: Number, judge2: Number, judge3: Number, judge4: Number, e:{ type: Number, default: 0 }, d1: { type: Number, default: 0 }, penalty: {type: Number, default:0}, total: { type: Number, default: 0 }, }, editCount: {judge1:{ type: Number, default: 0 }, judge2:{ type: Number, default: 0 }, judge3:{ type: Number, default: 0 }, judge4:{ type: Number, default: 0 }, d1:{ type: Number, default: 0 }} }],
//     vaultWomen: [{ name: String, mobile: String,email:String, approve:{ type: Boolean, default: false }, status: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, appratusStatus: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, scores: { judge1: Number, judge2: Number, judge3: Number, judge4: Number, e:{ type: Number, default: 0 }, d1: { type: Number, default: 0 }, penalty: {type: Number, default:0}, total: { type: Number, default: 0 }, }, editCount: {judge1:{ type: Number, default: 0 }, judge2:{ type: Number, default: 0 }, judge3:{ type: Number, default: 0 }, judge4:{ type: Number, default: 0 }, d1:{ type: Number, default: 0 }} }],
//     uneven_bars: [{ name: String, mobile: String,email:String, approve:{ type: Boolean, default: false }, status: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, appratusStatus: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, scores: { judge1: Number, judge2: Number, judge3: Number, judge4: Number, e:{ type: Number, default: 0 }, d1: { type: Number, default: 0 }, penalty: {type: Number, default:0}, total: { type: Number, default: 0 }, }, editCount: {judge1:{ type: Number, default: 0 }, judge2:{ type: Number, default: 0 }, judge3:{ type: Number, default: 0 }, judge4:{ type: Number, default: 0 }, d1:{ type: Number, default: 0 }} }],
//     balance_beam: [{ name: String, mobile: String,email:String, approve:{ type: Boolean, default: false }, status: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, appratusStatus: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, scores: { judge1: Number, judge2: Number, judge3: Number, judge4: Number, e:{ type: Number, default: 0 }, d1: { type: Number, default: 0 }, penalty: {type: Number, default:0}, total: { type: Number, default: 0 }, }, editCount: {judge1:{ type: Number, default: 0 }, judge2:{ type: Number, default: 0 }, judge3:{ type: Number, default: 0 }, judge4:{ type: Number, default: 0 }, d1:{ type: Number, default: 0 }} }],
//     floor_exercise: [{ name: String, mobile: String,email:String, approve:{ type: Boolean, default: false }, status: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, appratusStatus: { type: String, enum: ['not played', 'playing', 'completed'], default: 'not played' }, scores: { judge1: Number, judge2: Number, judge3: Number, judge4: Number, e:{ type: Number, default: 0 }, d1: { type: Number, default: 0 }, penalty: {type: Number, default:0}, total: { type: Number, default: 0 }, }, editCount: {judge1:{ type: Number, default: 0 }, judge2:{ type: Number, default: 0 }, judge3:{ type: Number, default: 0 }, judge4:{ type: Number, default: 0 }, d1:{ type: Number, default: 0 }} }]
//   },}]
//   ,
//   judges: {
//     floor: { judge1: { name: String, mobile: String, email:String }, judge2: { name: String, mobile: String, email:String }, judge3: { name: String, mobile: String, email:String }, judge4: { name: String, mobile: String, email:String }, d1: {name: String, mobile: String, email:String} },
//     pommel_horse: { judge1: { name: String, mobile: String, email:String }, judge2: { name: String, mobile: String, email:String }, judge3: { name: String, mobile: String, email:String }, judge4: { name: String, mobile: String, email:String }, d1: {name: String, mobile: String, email:String}  },
//     rings: { judge1: { name: String, mobile: String, email:String }, judge2: { name: String, mobile: String, email:String }, judge3: { name: String, mobile: String, email:String }, judge4: { name: String, mobile: String, email:String }, d1: {name: String, mobile: String, email:String}  },
//     vaultMen: { judge1: { name: String, mobile: String, email:String }, judge2: { name: String, mobile: String, email:String }, judge3: { name: String, mobile: String, email:String }, judge4: { name: String, mobile: String, email:String }, d1: {name: String, mobile: String, email:String}  },
//     parallel_bars: { judge1: { name: String, mobile: String, email:String }, judge2: { name: String, mobile: String, email:String }, judge3: { name: String, mobile: String, email:String }, judge4: { name: String, mobile: String, email:String }, d1: {name: String, mobile: String, email:String}  },
//     horizontal_bar: { judge1: { name: String, mobile: String, email:String }, judge2: { name: String, mobile: String, email:String }, judge3: { name: String, mobile: String, email:String }, judge4: { name: String, mobile: String, email:String }, d1: {name: String, mobile: String, email:String}  },
//     vaultWomen: { judge1: { name: String, mobile: String, email:String }, judge2: { name: String, mobile: String, email:String }, judge3: { name: String, mobile: String, email:String }, judge4: { name: String, mobile: String, email:String }, d1: {name: String, mobile: String, email:String}  },
//     uneven_bars: { judge1: { name: String, mobile: String, email:String }, judge2: { name: String, mobile: String, email:String }, judge3: { name: String, mobile: String, email:String }, judge4: { name: String, mobile: String, email:String }, d1: {name: String, mobile: String, email:String}  },
//     balance_beam: { judge1: { name: String, mobile: String, email:String }, judge2: { name: String, mobile: String, email:String }, judge3: { name: String, mobile: String, email:String }, judge4: { name: String, mobile: String, email:String }, d1: {name: String, mobile: String, email:String}  },
//     floor_exercise: { judge1: { name: String, mobile: String, email:String }, judge2: { name: String, mobile: String, email:String }, judge3: { name: String, mobile: String, email:String }, judge4: { name: String, mobile: String, email:String }, d1: {name: String, mobile: String, email:String}  },
//   },
//   supervisors: {
//     floor: {s1:{ name: String, mobile: String, email:String }},
//     pommel_horse: {s1:{ name: String, mobile: String, email:String }},
//     rings: {s1:{ name: String, mobile: String, email:String }},
//     vaultMen: {s1:{ name: String, mobile: String, email:String }},
//     parallel_bars: {s1:{ name: String, mobile: String, email:String }},
//     horizontal_bar: {s1:{ name: String, mobile: String, email:String }},
//     vaultWomen: {s1:{ name: String, mobile: String, email:String }},
//     uneven_bars: {s1:{ name: String, mobile: String, email:String }},
//     balance_beam: {s1:{ name: String, mobile: String, email:String }},
//     floor_exercise: {s1:{ name: String, mobile: String, email:String }},
//   },
//   event_admin: {type: String, required:true}
// });

// const Event = mongoose.model('Event', eventSchema);

// module.exports = Event;
