import mongoose from "mongoose";

const trafficSchema = new mongoose.Schema({
    centerId: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    location: {
        zone: {
            type: String,
            required: true
        },
        district: {
            type: Number,
            required: true
        },
        coordinates: {
            type: {
                type: String,
                enum: ['Point'],
                required: true
            },
            coordinates: {
                type: [Number],
                required: true
            }
        },
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },
    violations: {
        total: {
            type: Number,
            required: true
        },
        reported: {
            type: Number,
            required: true
        }
    },
    challans: {
        total: {
            type: Number,
            required: true
        },
        breakdown: {
            Speeding: Number,
            "No Helmet": Number,
            "No Seatbelt": Number,
            "Drunk Driving": Number,
            "No License": Number,
            "Invalid Insurance": Number,
            "Phone While Driving": Number,
            "Lane Violation": Number,
            "No Registration": Number,
            "Modified Vehicle": Number,
            "Noise Pollution": Number
        },
        collected_amount: {
            type: Number,
            required: true
        }
    },
    accidents: {
        today: {
            type: Number,
            required: true
        },
        overall: {
            type: Number,
            required: true
        }
    },
    weather_conditions: {
        type: String,
        required: true
    },
    peak_hour: {
        type: Boolean,
        required: true
    },
    enforcement_officers: {
        type: Number,
        required: true
    }
});

trafficSchema.index({ 'location.coordinates': '2dsphere' });

export const Violation = mongoose.models.Violation || mongoose.model('Violation', trafficSchema);
